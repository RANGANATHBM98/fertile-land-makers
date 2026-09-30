import argparse
from getpass import getpass

from sqlalchemy import select

from app.database import Base, SessionLocal, engine
from app.models import User, UserRole
from app.security import hash_password


def main() -> None:
    parser = argparse.ArgumentParser(description="Create an Agri App administrator account")
    parser.add_argument("email")
    parser.add_argument("full_name")
    parser.add_argument("phone")
    args = parser.parse_args()
    password = getpass("Admin password (10+ characters): ")
    if len(password) < 10:
        raise SystemExit("Password must contain at least 10 characters")

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        email = args.email.lower()
        if db.scalar(select(User.id).where(User.email == email)):
            raise SystemExit("That email is already registered")
        db.add(
            User(
                full_name=args.full_name,
                email=email,
                phone=args.phone,
                password_hash=hash_password(password),
                role=UserRole.admin,
            )
        )
        db.commit()
    print(f"Created admin account for {email}")


if __name__ == "__main__":
    main()
