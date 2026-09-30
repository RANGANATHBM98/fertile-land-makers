from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.models import SupportStatus, UserRole, VerificationStage


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str = Field(pattern=r"^\+?[0-9\s()-]{8,20}$")
    password: str = Field(min_length=10, max_length=128)
    role: UserRole = UserRole.farmer

    @field_validator("role", mode="before")
    @classmethod
    def prevent_public_admin_registration(cls, value: object) -> object:
        if value == "admin" or value == UserRole.admin:
            raise ValueError("Administrator accounts must be created by a platform operator")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    email: EmailStr
    phone: str
    role: UserRole
    identity_status: str


class LandCreate(BaseModel):
    title: str = Field(min_length=5, max_length=160)
    description: str = Field(min_length=20, max_length=5000)
    state: str = Field(min_length=2, max_length=80)
    district: str = Field(min_length=2, max_length=100)
    address: str = Field(min_length=5, max_length=500)
    size_acres: float = Field(gt=0, le=100000)
    soil_type: str = Field(min_length=2, max_length=80)
    water_sources: list[str] = Field(min_length=1, max_length=10)
    crop_history: str = Field(default="", max_length=2000)
    crops: list[str] = Field(default_factory=list, max_length=30)
    fertility_level: str = Field(min_length=2, max_length=40)
    annual_rent_per_acre_inr: int = Field(gt=0, le=100000000)
    lease_duration_months: int = Field(gt=0, le=600)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    irrigation_type: str = Field(default="", max_length=80)
    electricity_available: bool = False
    fertilizer_practices: str = Field(default="", max_length=2000)
    pesticide_history: str = Field(default="", max_length=2000)
    soil_test_summary: str = Field(default="", max_length=2000)
    drainage_notes: str = Field(default="", max_length=1000)
    road_access: bool = False
    road_type: str = Field(default="", max_length=80)
    transport_access: str = Field(default="", max_length=1000)
    water_level: str = Field(default="", max_length=40)

    @field_validator("water_sources", "crops")
    @classmethod
    def clean_lists(cls, values: list[str]) -> list[str]:
        return list(dict.fromkeys(value.strip() for value in values if value.strip()))

    @model_validator(mode="after")
    def require_coordinate_pair(self) -> "LandCreate":
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("Latitude and longitude must be provided together")
        return self


class LandReviewRequest(BaseModel):
    decision: str = Field(pattern="^(approved|rejected)$")
    note: str = Field(default="", max_length=1000)


class VerificationReviewRequest(BaseModel):
    stage: VerificationStage
    note: str = Field(default="", max_length=1000)


class DocumentReviewRequest(BaseModel):
    decision: str = Field(pattern="^(approved|rejected)$")
    note: str = Field(default="", max_length=1000)


class UnlockOrderRequest(BaseModel):
    consent: bool


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str = Field(min_length=1, max_length=100)
    razorpay_payment_id: str = Field(min_length=1, max_length=100)
    razorpay_signature: str = Field(min_length=1, max_length=256)


class ChatMessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=4000)

    @field_validator("body")
    @classmethod
    def require_non_empty_message(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Message cannot be blank")
        return normalized


class SupportQuestion(BaseModel):
    question: str = Field(min_length=1, max_length=2000)


class SupportTicketCreate(BaseModel):
    category: str = Field(pattern="^(account|listing|payment|verification|safety|other)$")
    subject: str = Field(min_length=5, max_length=160)
    message: str = Field(min_length=10, max_length=5000)


class SupportReplyRequest(BaseModel):
    response: str = Field(min_length=2, max_length=5000)
    status: SupportStatus = SupportStatus.in_progress
