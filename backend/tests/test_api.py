import os
import sys
from io import BytesIO
from pathlib import Path

from PIL import Image
from sqlalchemy import create_engine, select

test_database_path = Path(__file__).resolve().parents[1] / "test_agri_app.db"
os.environ["DATABASE_URL"] = f"sqlite:///{test_database_path.as_posix()}"
sys.path.insert(0, str(test_database_path.parent))

from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine, migrate_legacy_schema
from app.main import app, listing_fee_amount_paise, record_captured_payment
from app.models import ContactGrant, Land, LandPhoto, ListingStatus, Payment, PaymentPurpose, PaymentStatus, User, UserRole
from app.security import hash_password
from app.settings import settings


def test_legacy_monthly_rent_migrates_to_annual_total(tmp_path: Path) -> None:
    legacy_engine = create_engine(f"sqlite:///{tmp_path / 'legacy.db'}")
    with legacy_engine.begin() as connection:
        connection.exec_driver_sql(
            "CREATE TABLE lands (id INTEGER PRIMARY KEY, monthly_rent_inr INTEGER NOT NULL, size_acres REAL NOT NULL)"
        )
        connection.exec_driver_sql("INSERT INTO lands (monthly_rent_inr, size_acres) VALUES (15000, 2)")

    migrate_legacy_schema(legacy_engine)

    with legacy_engine.connect() as connection:
        migrated_rent, migrated_rate = connection.exec_driver_sql(
            "SELECT annual_rent_inr, annual_rent_per_acre_inr FROM lands"
        ).one()
    assert migrated_rent == 180000
    assert migrated_rate == 90000
    legacy_engine.dispose()


def test_owner_listing_fee_is_charged_per_acre() -> None:
    assert listing_fee_amount_paise(1) == 5000
    assert listing_fee_amount_paise(2) == 10000
    assert listing_fee_amount_paise(1.5) == 7500


def test_owner_listing_is_private_until_approved_and_public_contact_stays_hidden() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    client = TestClient(app)

    privilege_escalation = client.post("/api/auth/register", json={
        "full_name": "Attacker",
        "email": "attacker@example.com",
        "phone": "+919876543299",
        "password": "test-admin-password",
        "role": "admin",
    })
    assert privilege_escalation.status_code == 422

    registration = client.post(
        "/api/auth/register",
        json={
            "full_name": "Test Land Owner",
            "email": "land-owner@example.com",
            "phone": "+919876543210",
            "password": "test-owner-password",
            "role": "owner",
        },
    )
    assert registration.status_code == 201
    owner_headers = {"Authorization": f"Bearer {registration.json()['accessToken']}"}

    listing = client.post(
        "/api/lands",
        headers=owner_headers,
        json={
            "title": "Verified test farmland",
            "description": "A fertile plot with road access and irrigation facilities.",
            "state": "Karnataka",
            "district": "Hassan",
            "address": "Private village road, test address",
            "size_acres": 12,
            "latitude": 12.9716,
            "longitude": 77.5946,
            "soil_type": "Black Soil",
            "water_sources": ["Borewell"],
            "crop_history": "Rice and maize",
            "crops": ["Rice", "Maize"],
            "fertility_level": "good",
            "fertilizer_practices": "Compost and farmyard manure",
            "annual_rent_per_acre_inr": 15000,
            "lease_duration_months": 12,
            "road_access": True,
            "road_type": "Paved",
            "transport_access": "Truck access within 2 km",
        },
    )
    assert listing.status_code == 201
    land_id = listing.json()["id"]
    assert listing.json()["annualRentInr"] == 180000
    assert listing.json()["annualRentPerAcreInr"] == 15000
    assert listing.json()["latitude"] == 12.9716
    assert listing.json()["address"] == "Private village road, test address"
    assert client.get("/api/lands").json()["total"] == 0

    with SessionLocal() as db:
        land = db.get(Land, land_id)
        assert land is not None
        land.status = ListingStatus.approved
        db.commit()

    public_detail = client.get(f"/api/lands/{land_id}")
    assert public_detail.status_code == 200
    assert public_detail.json()["address"] is None
    assert public_detail.json()["latitude"] is None
    assert public_detail.json()["longitude"] is None
    assert public_detail.json()["fertilizerPractices"] == "Compost and farmyard manure"
    assert public_detail.json()["owner"] is None
    assert public_detail.json()["roadAccess"] is True
    assert public_detail.json()["transportAccess"] == "Truck access within 2 km"

    crop_results = client.get("/api/lands", params={"crop": "Rice"})
    assert crop_results.status_code == 200
    assert crop_results.json()["total"] == 1
    annual_price_results = client.get("/api/lands", params={"min_price": 180000, "max_price": 180000})
    assert annual_price_results.status_code == 200
    assert annual_price_results.json()["total"] == 1


def test_listing_and_contact_unlock_review_gates(monkeypatch, tmp_path: Path) -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    public_dir = tmp_path / "public"
    private_dir = tmp_path / "private"
    public_dir.mkdir()
    private_dir.mkdir()
    monkeypatch.setattr(settings, "public_media_dir", public_dir)
    monkeypatch.setattr(settings, "private_upload_dir", private_dir)
    monkeypatch.setattr(settings, "razorpay_key_id", "")
    monkeypatch.setattr(settings, "razorpay_key_secret", "")
    client = TestClient(app)

    with SessionLocal() as db:
        db.add(User(
            full_name="Platform Admin",
            email="admin@example.com",
            phone="+919876543299",
            password_hash=hash_password("test-admin-password"),
            role=UserRole.admin,
        ))
        db.commit()

    admin_login = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "test-admin-password"})
    assert admin_login.status_code == 200
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['accessToken']}"}

    owner_login = client.post("/api/auth/register", json={
        "full_name": "Owner Review Test",
        "email": "owner-review@example.com",
        "phone": "+919876543201",
        "password": "test-owner-password",
        "role": "owner",
    })
    owner_headers = {"Authorization": f"Bearer {owner_login.json()['accessToken']}"}
    listing = client.post("/api/lands", headers=owner_headers, json={
        "title": "Review workflow farmland",
        "description": "A fertile agricultural plot submitted for moderator review.",
        "state": "Karnataka",
        "district": "Hassan",
        "address": "Private road address, Hassan",
        "size_acres": 8,
        "latitude": 12.9716,
        "longitude": 77.5946,
        "soil_type": "Red Soil",
        "water_sources": ["Borewell"],
        "crop_history": "Maize",
        "crops": ["Maize"],
        "fertility_level": "good",
        "annual_rent_per_acre_inr": 12000,
        "lease_duration_months": 12,
    })
    assert listing.status_code == 201
    land_id = listing.json()["id"]
    assert client.post(f"/api/admin/lands/{land_id}/review", headers=admin_headers, json={"decision": "approved"}).status_code == 409

    image_buffer = BytesIO()
    image = Image.new("RGB", (2, 2), color="green")
    exif = Image.Exif()
    exif[306] = "2026:09:29 12:00:00"
    image.save(image_buffer, format="JPEG", exif=exif)
    image_bytes = image_buffer.getvalue()
    upload_photo = client.post(
        f"/api/lands/{land_id}/photos",
        headers=owner_headers,
        files=[("files", ("field.jpg", image_bytes, "image/jpeg"))],
    )
    assert upload_photo.status_code == 201
    with SessionLocal() as db:
        photo = db.scalar(select(LandPhoto).where(LandPhoto.land_id == land_id))
        assert photo is not None
        with Image.open(public_dir / photo.storage_name) as stored_image:
            assert 306 not in stored_image.getexif()

    ownership = client.post(
        "/api/users/me/documents",
        headers=owner_headers,
        data={"kind": "land_ownership", "land_id": land_id},
        files={"file": ("ownership.pdf", b"%PDF-1.4\nproof", "application/pdf")},
    )
    assert ownership.status_code == 201
    assert client.post(f"/api/admin/lands/{land_id}/review", headers=admin_headers, json={"decision": "approved"}).status_code == 409
    assert client.post(
        f"/api/admin/documents/{ownership.json()['id']}/review",
        headers=admin_headers,
        json={"decision": "approved", "note": ""},
    ).status_code == 200
    assert client.post(f"/api/lands/{land_id}/listing-fee-order", headers=owner_headers).status_code == 503
    assert client.post(
        f"/api/admin/lands/{land_id}/review",
        headers=admin_headers,
        json={"decision": "approved"},
    ).status_code == 409
    with SessionLocal() as db:
        owner = db.scalar(select(User).where(User.email == "owner-review@example.com"))
        land = db.get(Land, land_id)
        assert owner is not None and land is not None
        owner_fee = Payment(
            user_id=owner.id,
            land_id=land.id,
            provider_order_id="test_owner_fee_order",
            provider_payment_id=None,
            amount_paise=40000,
            purpose=PaymentPurpose.owner_listing_fee,
        )
        db.add(owner_fee)
        db.commit()
        db.refresh(owner_fee)
        record_captured_payment(db, owner_fee, "test_owner_fee_payment")
        assert db.scalar(select(ContactGrant.id)) is None
        db.commit()
    verification_path = f"/api/admin/lands/{land_id}/verification"
    for stage in ("callback_completed", "field_visit_scheduled", "field_verified"):
        assert client.put(
            verification_path,
            headers=admin_headers,
            json={"stage": stage, "note": "Reviewed by verification team"},
        ).status_code == 200
    assert client.post(f"/api/admin/lands/{land_id}/review", headers=admin_headers, json={"decision": "approved"}).status_code == 200

    replacement_ownership = client.post(
        "/api/users/me/documents",
        headers=owner_headers,
        data={"kind": "land_ownership", "land_id": land_id},
        files={"file": ("ownership-updated.pdf", b"%PDF-1.4\nupdated proof", "application/pdf")},
    )
    assert replacement_ownership.status_code == 201
    assert client.post(f"/api/admin/documents/{ownership.json()['id']}/review", headers=admin_headers, json={"decision": "approved"}).status_code == 409
    assert client.get(f"/api/lands/{land_id}").status_code == 404
    assert client.post(
        f"/api/admin/documents/{replacement_ownership.json()['id']}/review",
        headers=admin_headers,
        json={"decision": "approved", "note": ""},
    ).status_code == 200
    for stage in ("callback_completed", "field_visit_scheduled", "field_verified"):
        assert client.put(
            verification_path,
            headers=admin_headers,
            json={"stage": stage, "note": "Re-checked after proof update"},
        ).status_code == 200
    assert client.post(f"/api/admin/lands/{land_id}/review", headers=admin_headers, json={"decision": "approved"}).status_code == 200

    farmer_login = client.post("/api/auth/register", json={
        "full_name": "Farmer Review Test",
        "email": "farmer-review@example.com",
        "phone": "+919876543202",
        "password": "test-farmer-password",
        "role": "farmer",
    })
    farmer_headers = {"Authorization": f"Bearer {farmer_login.json()['accessToken']}"}
    farmer_contacts = client.get("/api/users/me/contact-unlocks", headers=farmer_headers)
    assert farmer_contacts.status_code == 200
    assert farmer_contacts.json() == []
    order_path = f"/api/lands/{land_id}/unlock-order"
    assert client.post(order_path, headers=farmer_headers, json={"consent": True}).status_code == 403
    assert client.get(
        f"/api/lands/{land_id}/messages",
        params={"with_user_id": "not-a-participant"},
        headers=farmer_headers,
    ).status_code == 403

    identity = client.post(
        "/api/users/me/documents",
        headers=farmer_headers,
        data={"kind": "identity_proof", "attest_non_aadhaar": "true"},
        files={"file": ("voter-id.jpg", image_bytes, "image/jpeg")},
    )
    assert identity.status_code == 201
    assert client.post(
        f"/api/admin/documents/{identity.json()['id']}/review",
        headers=admin_headers,
        json={"decision": "approved", "note": ""},
    ).status_code == 200
    assert client.post(order_path, headers=farmer_headers, json={"consent": True}).status_code == 503

    replacement_identity = client.post(
        "/api/users/me/documents",
        headers=farmer_headers,
        data={"kind": "identity_proof", "attest_non_aadhaar": "true"},
        files={"file": ("voter-id-updated.jpg", image_bytes, "image/jpeg")},
    )
    assert replacement_identity.status_code == 201
    assert client.get("/api/users/me", headers=farmer_headers).json()["identity_status"] == "pending"
    assert client.post(order_path, headers=farmer_headers, json={"consent": True}).status_code == 403
    assert client.post(
        f"/api/admin/documents/{identity.json()['id']}/review",
        headers=admin_headers,
        json={"decision": "approved", "note": ""},
    ).status_code == 409
    assert client.post(
        f"/api/admin/documents/{replacement_identity.json()['id']}/review",
        headers=admin_headers,
        json={"decision": "approved", "note": ""},
    ).status_code == 200
    assert client.post(order_path, headers=farmer_headers, json={"consent": True}).status_code == 503
    public_detail = client.get(f"/api/lands/{land_id}")
    assert public_detail.json()["address"] is None
    assert public_detail.json()["latitude"] is None
    assert public_detail.json()["longitude"] is None
    assert public_detail.json()["owner"] is None

    with SessionLocal() as db:
        farmer = db.scalar(select(User).where(User.email == "farmer-review@example.com"))
        land = db.get(Land, land_id)
        assert farmer is not None and land is not None
        farmer_id = farmer.id
        owner_id = land.owner_id
        payment = Payment(
            user_id=farmer.id,
            land_id=land.id,
            provider_order_id="test_captured_order",
            provider_payment_id="test_captured_payment",
            amount_paise=1500,
            status=PaymentStatus.captured,
        )
        db.add(payment)
        db.flush()
        db.add(ContactGrant(user_id=farmer.id, land_id=land.id, payment_id=payment.id))
        db.commit()

    unlocked_detail = client.get(f"/api/lands/{land_id}", headers=farmer_headers)
    assert unlocked_detail.json()["address"] == "Private road address, Hassan"
    assert unlocked_detail.json()["owner"]["name"] == "Owner Review Test"
    assert unlocked_detail.json()["owner"]["phone"] == "+919876543201"
    assert unlocked_detail.json()["latitude"] == 12.9716
    assert unlocked_detail.json()["longitude"] == 77.5946
    farmer_history = client.get("/api/users/me/contact-unlocks", headers=farmer_headers).json()
    assert farmer_history[0]["ownerName"] == "Owner Review Test"
    assert farmer_history[0]["ownerPhone"] == "+919876543201"
    assert farmer_history[0]["ownerId"] == owner_id
    owner_history = client.get("/api/users/me/contact-unlocks", headers=owner_headers).json()
    assert owner_history[0]["farmerName"] == "Farmer Review Test"
    assert owner_history[0]["farmerPhone"] == "+919876543202"
    assert owner_history[0]["farmerId"] == farmer_id

    sent_message = client.post(
        f"/api/lands/{land_id}/messages",
        params={"with_user_id": owner_id},
        headers=farmer_headers,
        json={"body": "I would like to discuss the lease dates."},
    )
    assert sent_message.status_code == 201
    owner_thread = client.get(
        f"/api/lands/{land_id}/messages",
        params={"with_user_id": farmer_id},
        headers=owner_headers,
    )
    assert owner_thread.status_code == 200
    assert owner_thread.json()[0]["body"] == "I would like to discuss the lease dates."
    assert client.get(
        f"/api/lands/{land_id}/messages",
        params={"with_user_id": "another-farmer"},
        headers=owner_headers,
    ).status_code == 403

    assistant = client.post("/api/support/assistant", json={"question": "How is annual rent calculated?"})
    assert assistant.status_code == 200
    assert "annual rate per acre" in assistant.json()["answer"]
    ticket = client.post("/api/support/tickets", headers=farmer_headers, json={
        "category": "listing",
        "subject": "Question about this land",
        "message": "Can the owner clarify the water access details?",
    })
    assert ticket.status_code == 201
    assert len(client.get("/api/support/tickets", headers=farmer_headers).json()) == 1
    assert client.get("/api/support/tickets", headers=owner_headers).json() == []
    admin_tickets = client.get("/api/admin/support/tickets", headers=admin_headers)
    assert admin_tickets.status_code == 200
    assert client.put(
        f"/api/admin/support/tickets/{ticket.json()['id']}",
        headers=admin_headers,
        json={"response": "The owner will follow up with you.", "status": "resolved"},
    ).status_code == 200