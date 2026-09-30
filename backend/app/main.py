import hashlib
import hmac
from decimal import Decimal, ROUND_HALF_UP
from io import BytesIO
import re
import uuid
from pathlib import Path
from typing import Annotated

import httpx
from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageOps, UnidentifiedImageError
from sqlalchemy import cast, func, or_, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Session, selectinload

from app.database import Base, engine, get_db, migrate_legacy_schema
from app.models import (
    ChatMessage,
    ContactGrant,
    DocumentKind,
    Land,
    LandPhoto,
    ListingStatus,
    Payment,
    PaymentPurpose,
    PaymentStatus,
    PrivateDocument,
    ReviewStatus,
    SupportStatus,
    SupportTicket,
    User,
    UserRole,
    VerificationStage,
    utc_now,
)
from app.schemas import (
    ChatMessageCreate,
    DocumentReviewRequest,
    LandCreate,
    LandReviewRequest,
    LoginRequest,
    PaymentVerifyRequest,
    RegisterRequest,
    SupportReplyRequest,
    SupportQuestion,
    SupportTicketCreate,
    UnlockOrderRequest,
    UserOut,
    VerificationReviewRequest,
)
from app.security import create_access_token, decode_access_token, hash_password, verify_password
from app.settings import settings


settings.public_media_dir.mkdir(parents=True, exist_ok=True)
settings.private_upload_dir.mkdir(parents=True, exist_ok=True)
migrate_legacy_schema()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agri App API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if settings.app_env == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


app.mount("/media", StaticFiles(directory=settings.public_media_dir), name="media")

bearer = HTTPBearer(auto_error=False)
Db = Annotated[Session, Depends(get_db)]
Credentials = Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]

IMAGE_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}
DOCUMENT_TYPES = {**IMAGE_TYPES, ".pdf": "application/pdf"}


def current_user(credentials: Credentials, db: Db) -> User:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Sign in required")
    user_id = decode_access_token(credentials.credentials)
    user = db.get(User, user_id) if user_id else None
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
    return user


def optional_user(credentials: Credentials, db: Db) -> User | None:
    if credentials is None:
        return None
    user_id = decode_access_token(credentials.credentials)
    return db.get(User, user_id) if user_id else None


def require_role(*roles: UserRole):
    def dependency(user: Annotated[User, Depends(current_user)]) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Your account cannot perform this action")
        return user

    return dependency


def save_upload(upload: UploadFile, directory: Path, allowed_types: dict[str, str]) -> str:
    suffix = Path(upload.filename or "").suffix.lower()
    expected_type = allowed_types.get(suffix)
    if expected_type is None or upload.content_type != expected_type:
        raise HTTPException(status_code=415, detail="Unsupported file type")
    content = upload.file.read(settings.max_upload_bytes + 1)
    if not content or len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="File is empty or exceeds the 10 MB limit")
    valid_signature = (
        (expected_type == "image/jpeg" and content.startswith(b"\xff\xd8\xff"))
        or (expected_type == "image/png" and content.startswith(b"\x89PNG\r\n\x1a\n"))
        or (expected_type == "image/webp" and content.startswith(b"RIFF") and content[8:12] == b"WEBP")
        or (expected_type == "application/pdf" and content.startswith(b"%PDF-"))
    )
    if not valid_signature:
        raise HTTPException(status_code=415, detail="File content does not match its type")
    if expected_type.startswith("image/"):
        try:
            with Image.open(BytesIO(content)) as image:
                image.verify()
            with Image.open(BytesIO(content)) as image:
                safe_image = ImageOps.exif_transpose(image)
                image_format = {"image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WEBP"}[expected_type]
                if image_format == "JPEG" and safe_image.mode not in {"RGB", "L"}:
                    safe_image = safe_image.convert("RGB")
                cleaned_image = BytesIO()
                safe_image.save(cleaned_image, format=image_format, optimize=True)
                content = cleaned_image.getvalue()
        except (UnidentifiedImageError, OSError, ValueError):
            raise HTTPException(status_code=415, detail="Image file is invalid or corrupted") from None
        if len(content) > settings.max_upload_bytes:
            raise HTTPException(status_code=413, detail="Processed image exceeds the 10 MB limit")
    storage_name = f"{uuid.uuid4().hex}{suffix}"
    (directory / storage_name).write_bytes(content)
    return storage_name


def grant_exists(db: Session, user_id: str, land_id: str) -> bool:
    return db.scalar(
        select(ContactGrant.id).where(ContactGrant.user_id == user_id, ContactGrant.land_id == land_id)
    ) is not None


def ensure_chat_access(db: Session, land: Land, user: User, counterparty_id: str) -> User:
    if user.role == UserRole.farmer:
        if counterparty_id != land.owner_id or not grant_exists(db, user.id, land.id):
            raise HTTPException(status_code=403, detail="Pay to unlock this land's private conversation")
    elif user.role == UserRole.owner:
        if user.id != land.owner_id or not grant_exists(db, counterparty_id, land.id):
            raise HTTPException(status_code=403, detail="This farmer has not unlocked contact for this land")
    else:
        raise HTTPException(status_code=403, detail="Administrators cannot participate in customer conversations")
    counterparty = db.get(User, counterparty_id)
    if counterparty is None:
        raise HTTPException(status_code=404, detail="Conversation participant not found")
    return counterparty


def land_payload(db: Session, land: Land, viewer: User | None) -> dict:
    can_see_contact = viewer is not None and (
        viewer.id == land.owner_id or viewer.role == UserRole.admin or grant_exists(db, viewer.id, land.id)
    )
    owner = db.get(User, land.owner_id) if can_see_contact else None
    return {
        "id": land.id,
        "title": land.title,
        "description": land.description,
        "state": land.state,
        "district": land.district,
        "address": land.address if can_see_contact else None,
        "latitude": land.latitude if can_see_contact else None,
        "longitude": land.longitude if can_see_contact else None,
        "sizeAcres": land.size_acres,
        "soilType": land.soil_type,
        "waterSources": land.water_sources,
        "cropHistory": land.crop_history,
        "crops": land.crops,
        "fertilityLevel": land.fertility_level,
        "annualRentInr": land.annual_rent_inr,
        "annualRentPerAcreInr": land.annual_rent_per_acre_inr,
        "leaseDurationMonths": land.lease_duration_months,
        "roadAccess": land.road_access,
        "roadType": land.road_type,
        "transportAccess": land.transport_access,
        "waterLevel": land.water_level,
        "irrigationType": land.irrigation_type,
        "electricityAvailable": land.electricity_available,
        "fertilizerPractices": land.fertilizer_practices,
        "pesticideHistory": land.pesticide_history,
        "soilTestSummary": land.soil_test_summary,
        "drainageNotes": land.drainage_notes,
        "status": land.status.value,
        "verificationStage": (
            land.verification_stage.value
            if viewer and (viewer.id == land.owner_id or viewer.role == UserRole.admin)
            else ("field_verified" if land.status == ListingStatus.approved else None)
        ),
        "verificationNote": (
            land.verification_note if viewer and (viewer.id == land.owner_id or viewer.role == UserRole.admin) else None
        ),
        "images": [f"/media/{photo.storage_name}" for photo in land.photos],
        "contactUnlocked": can_see_contact and viewer is not None and viewer.id != land.owner_id,
        "ownerListingFeePaid": land.owner_listing_fee_paid if viewer and (viewer.id == land.owner_id or viewer.role == UserRole.admin) else None,
        "ownerListingFeePerAcreInr": settings.owner_listing_fee_per_acre_paise / 100 if viewer and (viewer.id == land.owner_id or viewer.role == UserRole.admin) else None,
        "owner": ({"id": owner.id, "name": owner.full_name, "phone": owner.phone} if owner else None),
        "createdAt": land.created_at.isoformat(),
    }


def get_land_or_404(db: Session, land_id: str) -> Land:
    land = db.scalar(select(Land).options(selectinload(Land.photos)).where(Land.id == land_id))
    if land is None:
        raise HTTPException(status_code=404, detail="Land listing not found")
    return land


def get_owned_land(db: Session, land_id: str, user: User) -> Land:
    land = get_land_or_404(db, land_id)
    if land.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Land listing not found")
    return land


def land_values(body: LandCreate) -> dict:
    values = body.model_dump(exclude={"annual_rent_per_acre_inr"})
    annual_total = Decimal(body.annual_rent_per_acre_inr) * Decimal(str(body.size_acres))
    values["annual_rent_per_acre_inr"] = body.annual_rent_per_acre_inr
    values["annual_rent_inr"] = int(annual_total.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
    return values


def listing_fee_amount_paise(size_acres: float) -> int:
    fee = Decimal(str(size_acres)) * Decimal(settings.owner_listing_fee_per_acre_paise)
    return int(fee.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def ensure_payment_configured() -> None:
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        raise HTTPException(status_code=503, detail="Payments are not configured")


async def create_provider_order(amount_paise: int) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            "https://api.razorpay.com/v1/orders",
            auth=(settings.razorpay_key_id, settings.razorpay_key_secret),
            json={"amount": amount_paise, "currency": "INR", "receipt": uuid.uuid4().hex[:40]},
        )
    if response.is_error:
        raise HTTPException(status_code=502, detail="Payment provider could not create an order")
    return response.json()


def record_captured_payment(db: Session, payment: Payment, provider_payment_id: str) -> None:
    if payment.status == PaymentStatus.captured:
        return
    payment.status = PaymentStatus.captured
    payment.provider_payment_id = provider_payment_id
    if payment.purpose == PaymentPurpose.contact_unlock and not grant_exists(db, payment.user_id, payment.land_id):
        db.add(ContactGrant(user_id=payment.user_id, land_id=payment.land_id, payment_id=payment.id))
    elif payment.purpose == PaymentPurpose.owner_listing_fee:
        land = db.get(Land, payment.land_id)
        if land is not None and land.owner_id == payment.user_id:
            land.owner_listing_fee_paid = True
    db.commit()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Db) -> dict:
    email = body.email.lower()
    phone = re.sub(r"[\s()-]", "", body.phone)
    existing = db.scalar(select(User.id).where(or_(User.email == email, User.phone == phone)))
    if existing:
        raise HTTPException(status_code=409, detail="Email or phone number is already registered")
    user = User(
        full_name=body.full_name.strip(),
        email=email,
        phone=phone,
        password_hash=hash_password(body.password),
        role=body.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"accessToken": create_access_token(user.id), "tokenType": "bearer", "user": UserOut.model_validate(user)}


@app.post("/api/auth/login")
def login(body: LoginRequest, db: Db) -> dict:
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if user is None or not verify_password(body.password, user.password_hash) or not user.is_active:
        raise HTTPException(status_code=401, detail="Email or password is incorrect")
    return {"accessToken": create_access_token(user.id), "tokenType": "bearer", "user": UserOut.model_validate(user)}


@app.get("/api/users/me")
def me(user: Annotated[User, Depends(current_user)]) -> UserOut:
    return UserOut.model_validate(user)


@app.get("/api/users/me/documents")
def my_documents(db: Db, user: Annotated[User, Depends(current_user)]) -> list[dict]:
    docs = db.scalars(select(PrivateDocument).where(PrivateDocument.user_id == user.id)).all()
    return [
        {"id": doc.id, "kind": doc.kind.value, "landId": doc.land_id, "status": doc.review_status.value, "note": doc.review_note}
        for doc in docs
    ]


@app.post("/api/users/me/documents", status_code=status.HTTP_201_CREATED)
def upload_private_document(
    db: Db,
    user: Annotated[User, Depends(current_user)],
    kind: Annotated[DocumentKind, Form()],
    file: Annotated[UploadFile, File()],
    attest_non_aadhaar: Annotated[bool, Form()] = False,
    land_id: Annotated[str | None, Form()] = None,
) -> dict:
    if kind == DocumentKind.land_ownership:
        if user.role != UserRole.owner or not land_id:
            raise HTTPException(status_code=422, detail="Land ownership documents require an owner listing")
        get_owned_land(db, land_id, user)
    else:
        if land_id:
            raise HTTPException(status_code=422, detail="Identity documents cannot be attached to a listing")
        if not attest_non_aadhaar or re.search(r"aadhaar|aadhar|uidai", file.filename or "", re.IGNORECASE):
            raise HTTPException(status_code=422, detail="Upload a non-Aadhaar identity proof only")
    storage_name = save_upload(file, settings.private_upload_dir, DOCUMENT_TYPES)
    previous_docs_query = select(PrivateDocument).where(
        PrivateDocument.user_id == user.id,
        PrivateDocument.kind == kind,
    )
    if kind == DocumentKind.land_ownership:
        previous_docs_query = previous_docs_query.where(PrivateDocument.land_id == land_id)
        land = get_owned_land(db, land_id, user)
        land.status = ListingStatus.pending
        land.rejection_reason = ""
        land.verification_stage = VerificationStage.documents_pending
    else:
        previous_docs_query = previous_docs_query.where(PrivateDocument.land_id.is_(None))
        user.identity_status = ReviewStatus.pending

    previous_docs = db.scalars(previous_docs_query).all()
    previous_storage_names = []
    for previous_doc in previous_docs:
        previous_doc.review_status = ReviewStatus.superseded
        previous_storage_names.append(previous_doc.storage_name)

    doc = PrivateDocument(user_id=user.id, land_id=land_id, kind=kind, storage_name=storage_name)
    db.add(doc)
    db.commit()
    for previous_storage_name in previous_storage_names:
        (settings.private_upload_dir / previous_storage_name).unlink(missing_ok=True)
    db.refresh(doc)
    return {"id": doc.id, "kind": doc.kind.value, "status": doc.review_status.value}


@app.post("/api/lands", status_code=status.HTTP_201_CREATED)
def create_land(
    body: LandCreate,
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.owner))],
) -> dict:
    land = Land(owner_id=user.id, **land_values(body))
    db.add(land)
    db.commit()
    return land_payload(db, get_land_or_404(db, land.id), user)


@app.get("/api/lands")
def list_lands(
    db: Db,
    user: Annotated[User | None, Depends(optional_user)],
    search: str | None = None,
    state: str | None = None,
    soil_type: str | None = None,
    crop: str | None = None,
    min_price: int | None = Query(default=None, ge=0),
    max_price: int | None = Query(default=None, ge=0),
    min_acres: float | None = Query(default=None, ge=0),
    max_acres: float | None = Query(default=None, ge=0),
    limit: int = Query(default=24, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> dict:
    query = select(Land).options(selectinload(Land.photos)).where(Land.status == ListingStatus.approved)
    if search:
        term = f"%{search.strip()}%"
        query = query.where(or_(Land.title.ilike(term), Land.district.ilike(term), Land.state.ilike(term)))
    if state:
        query = query.where(Land.state.ilike(state.strip()))
    if soil_type:
        query = query.where(Land.soil_type.ilike(soil_type.strip()))
    if crop:
        if db.bind is not None and db.bind.dialect.name == "postgresql":
            query = query.where(func.jsonb_exists(cast(Land.crops, JSONB), crop))
        else:
            crop_values = func.json_each(Land.crops).table_valued("value").alias("land_crops")
            query = query.where(select(1).select_from(crop_values).where(crop_values.c.value == crop).exists())
    if min_price is not None:
        query = query.where(Land.annual_rent_inr >= min_price)
    if max_price is not None:
        query = query.where(Land.annual_rent_inr <= max_price)
    if min_acres is not None:
        query = query.where(Land.size_acres >= min_acres)
    if max_acres is not None:
        query = query.where(Land.size_acres <= max_acres)
    total = db.scalar(select(func.count()).select_from(query.order_by(None).subquery())) or 0
    lands = db.scalars(query.order_by(Land.created_at.desc()).offset(offset).limit(limit)).unique().all()
    return {"items": [land_payload(db, land, user) for land in lands], "total": total, "limit": limit, "offset": offset}


@app.get("/api/lands/{land_id}")
def land_detail(land_id: str, db: Db, user: Annotated[User | None, Depends(optional_user)]) -> dict:
    land = get_land_or_404(db, land_id)
    if land.status != ListingStatus.approved and (user is None or (user.id != land.owner_id and user.role != UserRole.admin)):
        raise HTTPException(status_code=404, detail="Land listing not found")
    return land_payload(db, land, user)


@app.get("/api/users/me/lands")
def owner_lands(db: Db, user: Annotated[User, Depends(require_role(UserRole.owner))]) -> list[dict]:
    lands = db.scalars(
        select(Land).options(selectinload(Land.photos)).where(Land.owner_id == user.id).order_by(Land.created_at.desc())
    ).unique().all()
    return [land_payload(db, land, user) for land in lands]


@app.get("/api/users/me/contact-unlocks")
def user_contact_unlocks(db: Db, user: Annotated[User, Depends(require_role(UserRole.owner, UserRole.farmer))]) -> list[dict]:
    if user.role == UserRole.owner:
        statement = (
            select(ContactGrant, Land, User)
            .join(Land, ContactGrant.land_id == Land.id)
            .join(User, ContactGrant.user_id == User.id)
            .where(Land.owner_id == user.id)
        )
    else:
        statement = (
            select(ContactGrant, Land, User)
            .join(Land, ContactGrant.land_id == Land.id)
            .join(User, Land.owner_id == User.id)
            .where(ContactGrant.user_id == user.id)
        )
    rows = db.execute(statement.order_by(ContactGrant.created_at.desc())).all()
    return [{
            "id": grant.id,
            "landId": land.id,
            "landTitle": land.title,
            "unlockedAt": grant.created_at.isoformat(),
            "farmerName": counterparty.full_name if user.role == UserRole.owner else None,
            "farmerId": counterparty.id if user.role == UserRole.owner else None,
            "farmerEmail": counterparty.email if user.role == UserRole.owner else None,
            "farmerPhone": counterparty.phone if user.role == UserRole.owner else None,
            "ownerName": counterparty.full_name if user.role == UserRole.farmer else None,
            "ownerId": counterparty.id if user.role == UserRole.farmer else None,
            "ownerPhone": counterparty.phone if user.role == UserRole.farmer else None,
        }
        for grant, land, counterparty in rows]


@app.get("/api/lands/{land_id}/messages")
def land_messages(
    land_id: str,
    with_user_id: str,
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.owner, UserRole.farmer))],
) -> list[dict]:
    land = get_land_or_404(db, land_id)
    ensure_chat_access(db, land, user, with_user_id)
    messages = db.scalars(
        select(ChatMessage)
        .where(
            ChatMessage.land_id == land.id,
            ChatMessage.sender_id.in_([user.id, with_user_id]),
            ChatMessage.recipient_id.in_([user.id, with_user_id]),
        )
        .order_by(ChatMessage.created_at.asc())
        .limit(500)
    ).all()
    unread = [message for message in messages if message.recipient_id == user.id and message.read_at is None]
    for message in unread:
        message.read_at = utc_now()
    if unread:
        db.commit()
    return [{
        "id": message.id,
        "senderId": message.sender_id,
        "body": message.body,
        "createdAt": message.created_at.isoformat(),
        "readAt": message.read_at.isoformat() if message.read_at else None,
    } for message in messages]


@app.post("/api/lands/{land_id}/messages", status_code=status.HTTP_201_CREATED)
def send_land_message(
    land_id: str,
    with_user_id: str,
    body: ChatMessageCreate,
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.owner, UserRole.farmer))],
) -> dict:
    land = get_land_or_404(db, land_id)
    counterparty = ensure_chat_access(db, land, user, with_user_id)
    message = ChatMessage(
        land_id=land.id,
        sender_id=user.id,
        recipient_id=counterparty.id,
        body=body.body,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return {
        "id": message.id,
        "senderId": message.sender_id,
        "body": message.body,
        "createdAt": message.created_at.isoformat(),
        "readAt": None,
    }


@app.get("/api/support/faqs")
def support_faqs() -> list[dict[str, str]]:
    return [
        {"question": "How is rent calculated?", "answer": "Owners set an annual rate per acre. The listing shows the annual total for the full acreage."},
        {"question": "How can I contact a land owner?", "answer": "Complete identity review, accept contact-sharing consent, and pay the one-time contact fee for that listing."},
        {"question": "What fees are charged?", "answer": "Owners pay the configured per-acre listing fee after ownership proof approval. Farmers pay a one-time contact-unlock fee per listing. Razorpay shows the exact amount before payment."},
        {"question": "How are owner listings verified?", "answer": "Owners submit ownership evidence for manual review. A listing is published only after proof approval and the listing fee are recorded."},
        {"question": "Can I submit Aadhaar here?", "answer": "No. Do not upload Aadhaar numbers or cards. Use only an approved identity provider if one is enabled."},
        {"question": "How do I report a suspicious listing?", "answer": "Create a support ticket under Safety and include the listing title and what concerns you. Do not include Aadhaar or bank details."},
    ]


@app.post("/api/support/assistant")
def support_assistant(body: SupportQuestion) -> dict[str, str | bool]:
    question = body.question.casefold()
    faqs = support_faqs()
    keywords = {
        "rent": ("rent", "acre", "year", "price"),
        "contact": ("contact", "phone", "owner", "unlock", "message", "chat"),
        "payment": ("payment", "pay", "fee", "refund", "charged"),
        "verification": ("verify", "verification", "pahani", "document", "aadhaar", "aadhar"),
        "safety": ("fraud", "fake", "report", "suspicious", "scam"),
    }
    for intent, terms in keywords.items():
        if any(term in question for term in terms):
            match = next((faq for faq in faqs if intent == "rent" and "rent" in faq["question"].casefold()
                          or intent == "contact" and "contact" in faq["question"].casefold()
                          or intent == "payment" and "fees" in faq["question"].casefold()
                          or intent == "verification" and "verified" in faq["question"].casefold()
                          or intent == "safety" and "suspicious" in faq["question"].casefold()), None)
            if match:
                return {"answer": match["answer"], "needsHumanSupport": False}
    return {
        "answer": "I could not find a reliable answer. Submit a support ticket and our team will follow up.",
        "needsHumanSupport": True,
    }


@app.post("/api/support/tickets", status_code=status.HTTP_201_CREATED)
def create_support_ticket(
    body: SupportTicketCreate,
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.owner, UserRole.farmer))],
) -> dict:
    ticket = SupportTicket(user_id=user.id, **body.model_dump())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {"id": ticket.id, "category": ticket.category, "subject": ticket.subject, "status": ticket.status.value}


@app.get("/api/support/tickets")
def my_support_tickets(
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.owner, UserRole.farmer))],
) -> list[dict]:
    tickets = db.scalars(
        select(SupportTicket).where(SupportTicket.user_id == user.id).order_by(SupportTicket.created_at.desc())
    ).all()
    return [{
        "id": ticket.id,
        "category": ticket.category,
        "subject": ticket.subject,
        "message": ticket.message,
        "status": ticket.status.value,
        "staffResponse": ticket.staff_response,
        "createdAt": ticket.created_at.isoformat(),
    } for ticket in tickets]


@app.get("/api/admin/support/tickets")
def admin_support_tickets(
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.admin))],
) -> list[dict]:
    tickets = db.scalars(select(SupportTicket).order_by(SupportTicket.created_at.desc()).limit(500)).all()
    return [{
        "id": ticket.id,
        "userId": ticket.user_id,
        "category": ticket.category,
        "subject": ticket.subject,
        "message": ticket.message,
        "status": ticket.status.value,
        "staffResponse": ticket.staff_response,
        "createdAt": ticket.created_at.isoformat(),
    } for ticket in tickets]


@app.put("/api/admin/support/tickets/{ticket_id}")
def reply_to_support_ticket(
    ticket_id: str,
    body: SupportReplyRequest,
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.admin))],
) -> dict:
    ticket = db.get(SupportTicket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    ticket.staff_response = body.response.strip()
    ticket.status = body.status
    ticket.updated_at = utc_now()
    db.commit()
    return {"id": ticket.id, "status": ticket.status.value, "staffResponse": ticket.staff_response}


@app.put("/api/lands/{land_id}")
def update_land(land_id: str, body: LandCreate, db: Db, user: Annotated[User, Depends(require_role(UserRole.owner))]) -> dict:
    land = get_owned_land(db, land_id, user)
    for field, value in land_values(body).items():
        setattr(land, field, value)
    land.status = ListingStatus.pending
    land.rejection_reason = ""
    approved_proof = db.scalar(
        select(PrivateDocument.id).where(
            PrivateDocument.land_id == land.id,
            PrivateDocument.kind == DocumentKind.land_ownership,
            PrivateDocument.review_status == ReviewStatus.approved,
        )
    )
    land.verification_stage = (
        VerificationStage.callback_required if approved_proof else VerificationStage.documents_pending
    )
    db.commit()
    return land_payload(db, get_land_or_404(db, land.id), user)


@app.delete("/api/lands/{land_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_land(land_id: str, db: Db, user: Annotated[User, Depends(require_role(UserRole.owner))]) -> None:
    land = get_owned_land(db, land_id, user)
    photo_names = [photo.storage_name for photo in land.photos]
    db.delete(land)
    db.commit()
    for storage_name in photo_names:
        (settings.public_media_dir / storage_name).unlink(missing_ok=True)


@app.post("/api/lands/{land_id}/photos", status_code=status.HTTP_201_CREATED)
def upload_land_photos(
    land_id: str,
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.owner))],
    files: Annotated[list[UploadFile], File()],
) -> list[str]:
    land = get_owned_land(db, land_id, user)
    if len(land.photos) + len(files) > 6:
        raise HTTPException(status_code=422, detail="A listing can have up to 6 photos")
    new_photos = []
    try:
        for upload in files:
            storage_name = save_upload(upload, settings.public_media_dir, IMAGE_TYPES)
            new_photos.append(LandPhoto(land_id=land.id, storage_name=storage_name))
    except Exception:
        for photo in new_photos:
            (settings.public_media_dir / photo.storage_name).unlink(missing_ok=True)
        raise
    db.add_all(new_photos)
    db.commit()
    return [f"/media/{photo.storage_name}" for photo in new_photos]


@app.get("/api/admin/summary")
def admin_summary(db: Db, user: Annotated[User, Depends(require_role(UserRole.admin))]) -> dict:
    return {
        "users": db.scalar(select(func.count()).select_from(User)) or 0,
        "lands": db.scalar(select(func.count()).select_from(Land)) or 0,
        "pendingLands": db.scalar(select(func.count()).select_from(Land).where(Land.status == ListingStatus.pending)) or 0,
        "pendingDocuments": db.scalar(select(func.count()).select_from(PrivateDocument).where(PrivateDocument.review_status == ReviewStatus.pending)) or 0,
        "capturedPaymentsInr": (db.scalar(select(func.coalesce(func.sum(Payment.amount_paise), 0)).where(Payment.status == PaymentStatus.captured)) or 0) / 100,
    }


@app.get("/api/admin/users")
def admin_users(db: Db, user: Annotated[User, Depends(require_role(UserRole.admin))]) -> list[dict]:
    accounts = db.scalars(select(User).order_by(User.created_at.desc()).limit(500)).all()
    return [
        {
            "id": account.id,
            "name": account.full_name,
            "email": account.email,
            "phone": account.phone,
            "role": account.role.value,
            "identityStatus": account.identity_status.value,
            "joined": account.created_at.isoformat(),
            "status": "active" if account.is_active else "disabled",
        }
        for account in accounts
    ]


@app.get("/api/admin/lands/pending")
def pending_lands(db: Db, user: Annotated[User, Depends(require_role(UserRole.admin))]) -> list[dict]:
    lands = db.scalars(select(Land).options(selectinload(Land.photos)).where(Land.status == ListingStatus.pending)).unique().all()
    return [land_payload(db, land, user) for land in lands]


@app.post("/api/admin/lands/{land_id}/review")
def review_land(
    land_id: str,
    body: LandReviewRequest,
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.admin))],
) -> dict:
    land = get_land_or_404(db, land_id)
    if body.decision == "approved":
        if not land.photos:
            raise HTTPException(status_code=409, detail="Upload at least one public land photo before approving this listing")
        proof = db.scalar(
            select(PrivateDocument.id).where(
                PrivateDocument.land_id == land.id,
                PrivateDocument.kind == DocumentKind.land_ownership,
                PrivateDocument.review_status == ReviewStatus.approved,
            )
        )
        if proof is None:
            raise HTTPException(status_code=409, detail="Approve an ownership document before approving this listing")
        if not land.owner_listing_fee_paid:
            raise HTTPException(status_code=409, detail="The owner must pay the per-acre listing fee before publication")
        if land.verification_stage != VerificationStage.field_verified:
            raise HTTPException(status_code=409, detail="Complete the owner call-back and field visit before publication")
        land.status = ListingStatus.approved
        land.rejection_reason = ""
    else:
        land.status = ListingStatus.rejected
        land.rejection_reason = body.note
    db.commit()
    return land_payload(db, get_land_or_404(db, land.id), user)


@app.get("/api/admin/documents/pending")
def pending_documents(db: Db, user: Annotated[User, Depends(require_role(UserRole.admin))]) -> list[dict]:
    docs = db.scalars(select(PrivateDocument).where(PrivateDocument.review_status == ReviewStatus.pending)).all()
    return [
        {"id": doc.id, "userId": doc.user_id, "landId": doc.land_id, "kind": doc.kind.value, "createdAt": doc.created_at.isoformat()}
        for doc in docs
    ]


@app.get("/api/admin/documents/{document_id}/file")
def private_document_file(document_id: str, db: Db, user: Annotated[User, Depends(require_role(UserRole.admin))]) -> FileResponse:
    doc = db.get(PrivateDocument, document_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.review_status != ReviewStatus.pending:
        raise HTTPException(status_code=409, detail="This document is no longer awaiting review")
    path = settings.private_upload_dir / doc.storage_name
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Document file not found")
    return FileResponse(
        path,
        filename=f"verification-{doc.id}{path.suffix}",
        headers={"Cache-Control": "no-store"},
    )


@app.post("/api/admin/documents/{document_id}/review")
def review_document(
    document_id: str,
    body: DocumentReviewRequest,
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.admin))],
) -> dict:
    doc = db.get(PrivateDocument, document_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.review_status != ReviewStatus.pending:
        raise HTTPException(status_code=409, detail="This document is no longer awaiting review")
    doc.review_status = ReviewStatus.approved if body.decision == "approved" else ReviewStatus.rejected
    doc.review_note = body.note
    if doc.kind == DocumentKind.identity_proof:
        account = db.get(User, doc.user_id)
        account.identity_status = doc.review_status
    elif doc.kind == DocumentKind.land_ownership and doc.land_id:
        land = db.get(Land, doc.land_id)
        if land is not None:
            land.verification_stage = (
                VerificationStage.callback_required
                if doc.review_status == ReviewStatus.approved
                else VerificationStage.rejected
            )
    db.commit()
    return {"id": doc.id, "kind": doc.kind.value, "status": doc.review_status.value}


@app.put("/api/admin/lands/{land_id}/verification")
def update_land_verification(
    land_id: str,
    body: VerificationReviewRequest,
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.admin))],
) -> dict:
    land = get_land_or_404(db, land_id)
    if body.stage == VerificationStage.documents_pending:
        raise HTTPException(status_code=422, detail="Document review status is controlled by document decisions")
    approved_proof = db.scalar(
        select(PrivateDocument.id).where(
            PrivateDocument.land_id == land.id,
            PrivateDocument.kind == DocumentKind.land_ownership,
            PrivateDocument.review_status == ReviewStatus.approved,
        )
    )
    if body.stage != VerificationStage.rejected and approved_proof is None:
        raise HTTPException(status_code=409, detail="Approve ownership evidence before callback verification")
    allowed_previous = {
        VerificationStage.callback_completed: VerificationStage.callback_required,
        VerificationStage.field_visit_scheduled: VerificationStage.callback_completed,
        VerificationStage.field_verified: VerificationStage.field_visit_scheduled,
    }
    required_previous = allowed_previous.get(body.stage)
    if required_previous and land.verification_stage != required_previous:
        raise HTTPException(status_code=409, detail=f"Move the verification stage through {required_previous.value} first")
    land.verification_stage = body.stage
    land.verification_note = body.note.strip()
    if body.stage == VerificationStage.rejected:
        land.status = ListingStatus.rejected
        land.rejection_reason = body.note.strip()
    db.commit()
    return {"landId": land.id, "verificationStage": land.verification_stage.value, "note": land.verification_note}


@app.post("/api/lands/{land_id}/listing-fee-order")
async def create_listing_fee_order(
    land_id: str,
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.owner))],
) -> dict:
    land = get_owned_land(db, land_id, user)
    if land.owner_listing_fee_paid:
        return {"alreadyPaid": True, "landId": land.id}
    approved_proof = db.scalar(
        select(PrivateDocument.id).where(
            PrivateDocument.land_id == land.id,
            PrivateDocument.kind == DocumentKind.land_ownership,
            PrivateDocument.review_status == ReviewStatus.approved,
        )
    )
    if approved_proof is None:
        raise HTTPException(status_code=409, detail="Ownership proof must be approved before paying the listing fee")
    ensure_payment_configured()
    pending_payment = db.scalar(
        select(Payment).where(
            Payment.user_id == user.id,
            Payment.land_id == land.id,
            Payment.purpose == PaymentPurpose.owner_listing_fee,
            Payment.status == PaymentStatus.pending,
        ).order_by(Payment.created_at.desc())
    )
    if pending_payment is not None:
        return {
            "orderId": pending_payment.provider_order_id,
            "amount": pending_payment.amount_paise,
            "currency": "INR",
            "keyId": settings.razorpay_key_id,
            "paymentId": pending_payment.id,
        }
    amount = listing_fee_amount_paise(land.size_acres)
    if amount < 100:
        raise HTTPException(status_code=422, detail="The calculated listing fee must be at least ₹1")
    provider_order = await create_provider_order(amount)
    payment = Payment(
        user_id=user.id,
        land_id=land.id,
        provider_order_id=provider_order["id"],
        amount_paise=amount,
        purpose=PaymentPurpose.owner_listing_fee,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    db.commit()
    return {
        "orderId": payment.provider_order_id,
        "amount": amount,
        "currency": "INR",
        "keyId": settings.razorpay_key_id,
        "paymentId": payment.id,
    }


@app.post("/api/lands/{land_id}/unlock-order")
async def create_unlock_order(
    land_id: str,
    body: UnlockOrderRequest,
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.farmer))],
) -> dict:
    land = get_land_or_404(db, land_id)
    if land.status != ListingStatus.approved or land.owner_id == user.id:
        raise HTTPException(status_code=404, detail="Land listing not found")
    if user.identity_status != ReviewStatus.approved:
        raise HTTPException(status_code=403, detail="Complete identity verification before unlocking contact details")
    if not body.consent:
        raise HTTPException(status_code=422, detail="Contact sharing consent is required")
    if grant_exists(db, user.id, land.id):
        return {"alreadyUnlocked": True, "landId": land.id}
    ensure_payment_configured()
    pending_payment = db.scalar(
        select(Payment)
        .where(
            Payment.user_id == user.id,
            Payment.land_id == land.id,
            Payment.purpose == PaymentPurpose.contact_unlock,
            Payment.status == PaymentStatus.pending,
        )
        .order_by(Payment.created_at.desc())
    )
    if pending_payment is not None:
        return {
            "orderId": pending_payment.provider_order_id,
            "amount": pending_payment.amount_paise,
            "currency": "INR",
            "keyId": settings.razorpay_key_id,
            "paymentId": pending_payment.id,
        }
    amount = settings.contact_unlock_fee_paise
    provider_order = await create_provider_order(amount)
    payment = Payment(
        user_id=user.id,
        land_id=land.id,
        provider_order_id=provider_order["id"],
        amount_paise=amount,
        purpose=PaymentPurpose.contact_unlock,
        consent_accepted_at=utc_now(),
        status=PaymentStatus.pending,
    )
    db.add(payment)
    db.commit()
    return {
        "orderId": payment.provider_order_id,
        "amount": amount,
        "currency": "INR",
        "keyId": settings.razorpay_key_id,
        "paymentId": payment.id,
    }


@app.post("/api/payments/verify")
async def verify_unlock_payment(
    body: PaymentVerifyRequest,
    db: Db,
    user: Annotated[User, Depends(require_role(UserRole.owner, UserRole.farmer))],
) -> dict:
    order_id = body.razorpay_order_id
    provider_payment_id = body.razorpay_payment_id
    signature = body.razorpay_signature
    payment = db.scalar(select(Payment).where(Payment.provider_order_id == order_id, Payment.user_id == user.id))
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment order not found")
    if (
        payment.purpose == PaymentPurpose.contact_unlock and user.role != UserRole.farmer
        or payment.purpose == PaymentPurpose.owner_listing_fee and user.role != UserRole.owner
    ):
        raise HTTPException(status_code=403, detail="This payment does not belong to your account role")
    expected = hmac.new(
        settings.razorpay_key_secret.encode(), f"{order_id}|{provider_payment_id}".encode(), hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Payment signature is invalid")
    ensure_payment_configured()
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            f"https://api.razorpay.com/v1/payments/{provider_payment_id}",
            auth=(settings.razorpay_key_id, settings.razorpay_key_secret),
        )
    if response.is_error:
        raise HTTPException(status_code=502, detail="Unable to verify payment with provider")
    provider_payment = response.json()
    if (
        provider_payment.get("status") != "captured"
        or provider_payment.get("order_id") != order_id
        or provider_payment.get("amount") != payment.amount_paise
        or provider_payment.get("currency") != "INR"
    ):
        raise HTTPException(status_code=409, detail="Payment is not captured for this order")
    record_captured_payment(db, payment, provider_payment_id)
    return {"status": "captured", "landId": payment.land_id, "purpose": payment.purpose.value}


@app.post("/api/payments/razorpay-webhook")
async def razorpay_webhook(request: Request, db: Db) -> dict[str, str]:
    if not settings.razorpay_webhook_secret:
        raise HTTPException(status_code=503, detail="Payment webhooks are not configured")
    raw_body = await request.body()
    supplied = request.headers.get("x-razorpay-signature", "")
    expected = hmac.new(settings.razorpay_webhook_secret.encode(), raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, supplied):
        raise HTTPException(status_code=400, detail="Webhook signature is invalid")
    event = await request.json()
    payment_entity = event.get("payload", {}).get("payment", {}).get("entity", {})
    if event.get("event") == "payment.captured":
        payment = db.scalar(select(Payment).where(Payment.provider_order_id == payment_entity.get("order_id")))
        if (
            payment
            and payment_entity.get("status") == "captured"
            and payment_entity.get("amount") == payment.amount_paise
            and payment_entity.get("currency") == "INR"
            and payment_entity.get("id")
        ):
            record_captured_payment(db, payment, payment_entity.get("id"))
    return {"received": "true"}
