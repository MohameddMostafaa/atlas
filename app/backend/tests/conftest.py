import pytest

from datetime import datetime, timezone

from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlalchemy.orm import Session

from src.database import get_db
from src.main import app
from src.models.incident import Incident
from src.models.incident_update import IncidentUpdate
from src.models.service import Service
from src.models.user import User
from tests.database import TestSessionLocal


@pytest.fixture
def db():
    session = TestSessionLocal()

    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client():
    db = TestSessionLocal()

    db.execute(delete(IncidentUpdate))
    db.execute(delete(Incident))
    db.execute(delete(Service))
    db.execute(delete(User))
    db.commit()

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    db.execute(delete(IncidentUpdate))
    db.execute(delete(Incident))
    db.execute(delete(Service))
    db.execute(delete(User))
    db.commit()

    db.close()
    app.dependency_overrides.clear()


@pytest.fixture
def test_service(db):
    service = Service(
        name="Test Service",
        description="Service used during tests",
        url="http://test-service",
    )

    db.add(service)
    db.commit()
    db.refresh(service)

    return service


@pytest.fixture
def test_user(db):
    user = User(
        email="test-user@example.com",
        password_hash="test-password-hash",
        created_at=datetime.now(timezone.utc),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user




