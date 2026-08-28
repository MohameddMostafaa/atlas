from datetime import datetime, timezone

from fastapi.testclient import TestClient

from src.main import app
from src.models.user import User
from src.security import hash_password


def test_login_and_me(client, db):
    user = User(email="login@example.com", password_hash=hash_password("correct-password"), created_at=datetime.now(timezone.utc))
    db.add(user)
    db.commit()

    response = client.post("/auth/login", json={"email": user.email, "password": "correct-password"})
    assert response.status_code == 200
    token = response.json()["access_token"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["id"] == user.id


def test_invalid_login_fails(client):
    response = client.post("/auth/login", json={"email": "missing@example.com", "password": "wrong"})
    assert response.status_code == 401


def test_unauthenticated_mutation_is_rejected(test_service):
    with TestClient(app) as anonymous_client:
        response = anonymous_client.patch(f"/services/{test_service.id}", json={"status": "degraded"})
    assert response.status_code == 403
