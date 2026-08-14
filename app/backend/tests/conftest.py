import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete

from src.database import get_db
from src.main import app
from src.models.incident import Incident
from src.models.incident_update import IncidentUpdate
from src.models.service import Service
from src.models.user import User
from tests.database import TestSessionLocal


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
