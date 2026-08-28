import argparse
import getpass
from datetime import datetime, timezone

from sqlalchemy import select

from src.database import SessionLocal
from src.models.user import User
from src.security import hash_password


def main() -> None:
    parser = argparse.ArgumentParser(description="Create an Atlas operator account.")
    parser.add_argument("email")
    args = parser.parse_args()
    password = getpass.getpass("Password: ")
    if not password:
        raise SystemExit("Password cannot be empty.")

    with SessionLocal() as db:
        if db.execute(select(User).where(User.email == args.email)).scalar_one_or_none():
            raise SystemExit("An operator with that email already exists.")

        db.add(User(email=args.email, password_hash=hash_password(password), created_at=datetime.now(timezone.utc)))
        db.commit()


if __name__ == "__main__":
    main()
