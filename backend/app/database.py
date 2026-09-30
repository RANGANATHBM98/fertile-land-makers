
from collections.abc import Generator

from sqlalchemy import Engine, create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.settings import settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def migrate_legacy_schema(target_engine: Engine = engine) -> None:
    tables = set(inspect(target_engine).get_table_names())
    if "lands" in tables:
        columns = {column["name"] for column in inspect(target_engine).get_columns("lands")}
        with target_engine.begin() as connection:
            if "monthly_rent_inr" in columns and "annual_rent_inr" not in columns:
                connection.execute(text(
                    "ALTER TABLE lands RENAME COLUMN monthly_rent_inr TO annual_rent_inr"
                ))
                connection.execute(text("UPDATE lands SET annual_rent_inr = annual_rent_inr * 12"))
                columns.remove("monthly_rent_inr")
                columns.add("annual_rent_inr")
            if "annual_rent_inr" in columns and "annual_rent_per_acre_inr" not in columns:
                connection.execute(text(
                    "ALTER TABLE lands ADD COLUMN annual_rent_per_acre_inr BIGINT NOT NULL DEFAULT 0"
                ))
                connection.execute(text(
                    "UPDATE lands SET annual_rent_per_acre_inr = "
                    "CAST(ROUND(annual_rent_inr / size_acres) AS BIGINT) WHERE size_acres > 0"
                ))
            if "owner_listing_fee_paid" not in columns:
                connection.execute(text(
                    "ALTER TABLE lands ADD COLUMN owner_listing_fee_paid BOOLEAN NOT NULL DEFAULT TRUE"
                ))
            legacy_land_columns = {
                "latitude": "DOUBLE PRECISION",
                "longitude": "DOUBLE PRECISION",
                "irrigation_type": "VARCHAR(80) NOT NULL DEFAULT ''",
                "electricity_available": "BOOLEAN NOT NULL DEFAULT FALSE",
                "fertilizer_practices": "TEXT NOT NULL DEFAULT ''",
                "pesticide_history": "TEXT NOT NULL DEFAULT ''",
                "soil_test_summary": "TEXT NOT NULL DEFAULT ''",
                "drainage_notes": "TEXT NOT NULL DEFAULT ''",
                "verification_stage": "VARCHAR(40) NOT NULL DEFAULT 'documents_pending'",
                "verification_note": "TEXT NOT NULL DEFAULT ''",
            }
            for column_name, definition in legacy_land_columns.items():
                if column_name not in columns:
                    connection.execute(text(
                        f"ALTER TABLE lands ADD COLUMN {column_name} {definition}"
                    ))
    if "payments" in tables:
        columns = {column["name"] for column in inspect(target_engine).get_columns("payments")}
        if "purpose" not in columns:
            with target_engine.begin() as connection:
                connection.execute(text(
                    "ALTER TABLE payments ADD COLUMN purpose VARCHAR(30) NOT NULL DEFAULT 'contact_unlock'"
                ))


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
