import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import BigInteger, Boolean, DateTime, Enum, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def new_id() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserRole(str, enum.Enum):
    farmer = "farmer"
    owner = "owner"
    admin = "admin"


class ListingStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    leased = "leased"
    draft = "draft"


class DocumentKind(str, enum.Enum):
    identity_proof = "identity_proof"
    land_ownership = "land_ownership"


class ReviewStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    superseded = "superseded"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    captured = "captured"
    failed = "failed"


class PaymentPurpose(str, enum.Enum):
    contact_unlock = "contact_unlock"
    owner_listing_fee = "owner_listing_fee"


class SupportStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"


class VerificationStage(str, enum.Enum):
    documents_pending = "documents_pending"
    callback_required = "callback_required"
    callback_completed = "callback_completed"
    field_visit_scheduled = "field_visit_scheduled"
    field_verified = "field_verified"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, native_enum=False), default=UserRole.farmer)
    identity_status: Mapped[ReviewStatus] = mapped_column(
        Enum(ReviewStatus, native_enum=False), default=ReviewStatus.pending
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    lands: Mapped[list["Land"]] = relationship(back_populates="owner")


class Land(Base):
    __tablename__ = "lands"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text)
    state: Mapped[str] = mapped_column(String(80), index=True)
    district: Mapped[str] = mapped_column(String(100), index=True)
    address: Mapped[str] = mapped_column(Text)
    size_acres: Mapped[float] = mapped_column()
    soil_type: Mapped[str] = mapped_column(String(80), index=True)
    water_sources: Mapped[list[str]] = mapped_column(JSON)
    crop_history: Mapped[str] = mapped_column(Text, default="")
    crops: Mapped[list[str]] = mapped_column(JSON, default=list)
    fertility_level: Mapped[str] = mapped_column(String(40))
    annual_rent_per_acre_inr: Mapped[int] = mapped_column(BigInteger)
    annual_rent_inr: Mapped[int] = mapped_column(BigInteger)
    owner_listing_fee_paid: Mapped[bool] = mapped_column(Boolean, default=False)
    lease_duration_months: Mapped[int] = mapped_column(Integer)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    irrigation_type: Mapped[str] = mapped_column(String(80), default="")
    electricity_available: Mapped[bool] = mapped_column(Boolean, default=False)
    fertilizer_practices: Mapped[str] = mapped_column(Text, default="")
    pesticide_history: Mapped[str] = mapped_column(Text, default="")
    soil_test_summary: Mapped[str] = mapped_column(Text, default="")
    drainage_notes: Mapped[str] = mapped_column(Text, default="")
    verification_stage: Mapped[VerificationStage] = mapped_column(
        Enum(VerificationStage, native_enum=False), default=VerificationStage.documents_pending
    )
    verification_note: Mapped[str] = mapped_column(Text, default="")
    road_access: Mapped[bool] = mapped_column(Boolean, default=False)
    road_type: Mapped[str] = mapped_column(String(80), default="")
    transport_access: Mapped[str] = mapped_column(Text, default="")
    water_level: Mapped[str] = mapped_column(String(40), default="")
    status: Mapped[ListingStatus] = mapped_column(
        Enum(ListingStatus, native_enum=False), default=ListingStatus.pending, index=True
    )
    rejection_reason: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    owner: Mapped[User] = relationship(back_populates="lands")
    photos: Mapped[list["LandPhoto"]] = relationship(back_populates="land", cascade="all, delete-orphan")


class LandPhoto(Base):
    __tablename__ = "land_photos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    land_id: Mapped[str] = mapped_column(ForeignKey("lands.id", ondelete="CASCADE"), index=True)
    storage_name: Mapped[str] = mapped_column(String(255), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    land: Mapped[Land] = relationship(back_populates="photos")


class PrivateDocument(Base):
    __tablename__ = "private_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    land_id: Mapped[str | None] = mapped_column(ForeignKey("lands.id", ondelete="CASCADE"), nullable=True)
    kind: Mapped[DocumentKind] = mapped_column(Enum(DocumentKind, native_enum=False))
    storage_name: Mapped[str] = mapped_column(String(255), unique=True)
    review_status: Mapped[ReviewStatus] = mapped_column(
        Enum(ReviewStatus, native_enum=False), default=ReviewStatus.pending
    )
    review_note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    land_id: Mapped[str] = mapped_column(ForeignKey("lands.id"), index=True)
    provider_order_id: Mapped[str] = mapped_column(String(100), unique=True)
    provider_payment_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    amount_paise: Mapped[int] = mapped_column(Integer)
    purpose: Mapped[PaymentPurpose] = mapped_column(
        Enum(PaymentPurpose, native_enum=False), default=PaymentPurpose.contact_unlock
    )
    consent_accepted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus, native_enum=False), default=PaymentStatus.pending)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class ContactGrant(Base):
    __tablename__ = "contact_grants"
    __table_args__ = (UniqueConstraint("user_id", "land_id", name="uq_contact_grant_user_land"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    land_id: Mapped[str] = mapped_column(ForeignKey("lands.id"), index=True)
    payment_id: Mapped[str] = mapped_column(ForeignKey("payments.id"), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    land_id: Mapped[str] = mapped_column(ForeignKey("lands.id", ondelete="CASCADE"), index=True)
    sender_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    recipient_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    category: Mapped[str] = mapped_column(String(30))
    subject: Mapped[str] = mapped_column(String(160))
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[SupportStatus] = mapped_column(
        Enum(SupportStatus, native_enum=False), default=SupportStatus.open, index=True
    )
    staff_response: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
