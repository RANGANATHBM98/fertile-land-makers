from pathlib import Path
from typing import Annotated

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "sqlite:///./agri_app.db"
    jwt_secret: str = ""
    jwt_expire_minutes: int = 60
    frontend_origins: Annotated[list[str], NoDecode] = Field(default_factory=lambda: ["http://localhost:3000"])
    public_media_dir: Path = Path("./storage/public")
    private_upload_dir: Path = Path("./storage/private")
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""
    contact_unlock_fee_paise: int = 1500
    owner_listing_fee_per_acre_paise: int = 5000
    max_upload_bytes: int = 10 * 1024 * 1024

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @model_validator(mode="after")
    def validate_secrets_and_amounts(self) -> "Settings":
        if not self.jwt_secret:
            if self.app_env == "production":
                raise ValueError("JWT_SECRET must be set in production")
            self.jwt_secret = "development-only-change-me-before-deployment"
        if self.app_env == "production" and (
            self.jwt_secret == "replace-with-a-long-random-secret" or len(self.jwt_secret) < 32
        ):
            raise ValueError("Production JWT_SECRET must be a unique value of at least 32 characters")
        if self.app_env == "production":
            if not self.database_url.startswith(("postgresql://", "postgresql+psycopg://", "postgres://")):
                raise ValueError("Production DATABASE_URL must use PostgreSQL")
            if not self.frontend_origins or any(not origin.startswith("https://") for origin in self.frontend_origins):
                raise ValueError("Production FRONTEND_ORIGINS must contain HTTPS origins only")
            if bool(self.razorpay_key_id) != bool(self.razorpay_key_secret):
                raise ValueError("Razorpay key ID and secret must be configured together")
            if self.razorpay_key_id and not self.razorpay_webhook_secret:
                raise ValueError("Configure RAZORPAY_WEBHOOK_SECRET when payments are enabled in production")
        if not 1000 <= self.contact_unlock_fee_paise <= 2000:
            raise ValueError("CONTACT_UNLOCK_FEE_PAISE must be between 1000 and 2000")
        if not 100 <= self.owner_listing_fee_per_acre_paise <= 10000:
            raise ValueError("OWNER_LISTING_FEE_PER_ACRE_PAISE must be between 100 and 10000")
        return self

    @field_validator("frontend_origins", mode="before")
    @classmethod
    def split_frontend_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


settings = Settings()
