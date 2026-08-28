from datetime import datetime, timezone

from src.models.service import Service
from src.models.user import User
from tests.database import TestSessionLocal
from sqlalchemy import select

from src.services.incident import (
    can_transition_status,
    is_valid_incident_severity,
    is_valid_incident_status,
)


def test_valid_incident_severity():
    assert is_valid_incident_severity("critical") is True


def test_invalid_incident_severity():
    assert is_valid_incident_severity("banana") is False


def test_valid_incident_status():
    assert is_valid_incident_status("investigating") is True


def test_invalid_incident_status():
    assert is_valid_incident_status("banana") is False


def test_valid_status_transition():
    assert can_transition_status(
        "investigating",
        "identified",
    ) is True


def test_invalid_status_transition():
    assert can_transition_status(
        "investigating",
        "resolved",
    ) is False


def test_resolved_incident_cannot_transition():
    assert can_transition_status(
        "resolved",
        "investigating",
    ) is False

def test_create_incident(client, db, test_service, test_user):
    response = client.post(
        "/incidents",
        json={
            "service_id": test_service.id,
            "created_by": test_user.id,
            "title": "API response times are high",
            "description": "Response times increased significantly.",
            "severity": "high",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["service_id"] == test_service.id
    operator = db.execute(
        select(User).where(User.email == "operator@example.com")
    ).scalar_one()
    assert data["created_by"] == operator.id
    assert data["created_by"] != test_user.id
    assert data["title"] == "API response times are high"
    assert data["description"] == "Response times increased significantly."
    assert data["severity"] == "high"
    assert data["status"] == "investigating"
    assert data["resolved_at"] is None


def test_get_incident(client, test_service, test_user):
    create_response = client.post(
        "/incidents",
        json={
            "service_id": test_service.id,
            "created_by": test_user.id,
            "title": "Database latency",
            "description": "Database queries are slow.",
            "severity": "high",
        },
    )

    assert create_response.status_code == 201

    incident_id = create_response.json()["id"]

    response = client.get(f"/incidents/{incident_id}")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == incident_id
    assert data["title"] == "Database latency"
    assert data["severity"] == "high"
    assert data["status"] == "investigating"

def test_get_incident_not_found(client):
    response = client.get("/incidents/999999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Incident not found"}


def test_list_incidents(client):
    db = TestSessionLocal()

    service = Service(
        name="List Incident API",
        description="Service used for incident listing testing",
        url="http://list-incident-test",
    )

    user = User(
        email="list-incident-test@example.com",
        password_hash="test-password-hash",
        created_at=datetime.now(timezone.utc),
    )

    db.add(service)
    db.add(user)
    db.commit()

    db.refresh(service)
    db.refresh(user)

    first_response = client.post(
        "/incidents",
        json={
            "service_id": service.id,
            "created_by": user.id,
            "title": "First incident",
            "severity": "medium",
        },
    )

    second_response = client.post(
        "/incidents",
        json={
            "service_id": service.id,
            "created_by": user.id,
            "title": "Second incident",
            "severity": "high",
        },
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    response = client.get("/incidents")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["title"] == "Second incident"
    assert data[1]["title"] == "First incident"

    db.close()


def test_update_incident_status(client):
    db = TestSessionLocal()

    service = Service(
        name="Status Update API",
        description="Service used for status update testing",
        url="http://status-update-test",
    )

    user = User(
        email="status-update-test@example.com",
        password_hash="test-password-hash",
        created_at=datetime.now(timezone.utc),
    )

    db.add(service)
    db.add(user)
    db.commit()

    db.refresh(service)
    db.refresh(user)

    create_response = client.post(
        "/incidents",
        json={
            "service_id": service.id,
            "created_by": user.id,
            "title": "API outage",
            "severity": "high",
        },
    )

    assert create_response.status_code == 201

    incident_id = create_response.json()["id"]

    response = client.patch(
        f"/incidents/{incident_id}",
        json={
            "status": "identified",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "identified"
    assert data["resolved_at"] is None

    db.close()



def test_update_incident_invalid_transition(client):
    db = TestSessionLocal()

    service = Service(
        name="Invalid Transition API",
        description="Service used for transition testing",
        url="http://invalid-transition-test",
    )

    user = User(
        email="invalid-transition-test@example.com",
        password_hash="test-password-hash",
        created_at=datetime.now(timezone.utc),
    )

    db.add(service)
    db.add(user)
    db.commit()

    db.refresh(service)
    db.refresh(user)

    create_response = client.post(
        "/incidents",
        json={
            "service_id": service.id,
            "created_by": user.id,
            "title": "API outage",
            "severity": "critical",
        },
    )

    assert create_response.status_code == 201

    incident_id = create_response.json()["id"]

    response = client.patch(
        f"/incidents/{incident_id}",
        json={
            "status": "resolved",
        },
    )

    assert response.status_code == 422

    assert response.json() == {
        "detail": "Invalid incident status transition"
    }

    db.close()

def test_resolve_incident_sets_resolved_at(client):
    db = TestSessionLocal()

    service = Service(
        name="Resolve Test API",
        description="Service used for resolution testing",
        url="http://resolve-test",
    )

    user = User(
        email="resolve-test@example.com",
        password_hash="test-password-hash",
        created_at=datetime.now(timezone.utc),
    )

    db.add(service)
    db.add(user)
    db.commit()

    db.refresh(service)
    db.refresh(user)

    create_response = client.post(
        "/incidents",
        json={
            "service_id": service.id,
            "created_by": user.id,
            "title": "Database outage",
            "severity": "critical",
        },
    )

    assert create_response.status_code == 201

    incident_id = create_response.json()["id"]

    # investigating → identified
    response = client.patch(
        f"/incidents/{incident_id}",
        json={"status": "identified"},
    )

    assert response.status_code == 200

    # identified → monitoring
    response = client.patch(
        f"/incidents/{incident_id}",
        json={"status": "monitoring"},
    )

    assert response.status_code == 200

    # monitoring → resolved
    response = client.patch(
        f"/incidents/{incident_id}",
        json={"status": "resolved"},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "resolved"
    assert data["resolved_at"] is not None

    db.close()


def test_update_incident_invalid_severity(client):
    db = TestSessionLocal()

    service = Service(
        name="Severity Update API",
        description="Service used for severity testing",
        url="http://severity-update-test",
    )

    user = User(
        email="severity-update-test@example.com",
        password_hash="test-password-hash",
        created_at=datetime.now(timezone.utc),
    )

    db.add(service)
    db.add(user)
    db.commit()

    db.refresh(service)
    db.refresh(user)

    create_response = client.post(
        "/incidents",
        json={
            "service_id": service.id,
            "created_by": user.id,
            "title": "API problem",
            "severity": "medium",
        },
    )

    assert create_response.status_code == 201

    incident_id = create_response.json()["id"]

    response = client.patch(
        f"/incidents/{incident_id}",
        json={
            "severity": "banana",
        },
    )

    assert response.status_code == 422
    assert response.json() == {
        "detail": "Invalid incident severity"
    }

    db.close()


def test_create_incident_update(client, db, test_service, test_user):
    create_response = client.post(
        "/incidents",
        json={
            "service_id": test_service.id,
            "created_by": test_user.id,
            "title": "API outage",
            "description": "API requests are failing.",
            "severity": "high",
        },
    )

    assert create_response.status_code == 201

    incident_id = create_response.json()["id"]

    response = client.post(
        f"/incidents/{incident_id}/updates",
        json={
            "author_id": test_user.id,
            "message": "We identified the database connection pool as the cause.",
            "status": "identified",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["incident_id"] == incident_id
    operator = db.execute(
        select(User).where(User.email == "operator@example.com")
    ).scalar_one()
    assert data["author_id"] == operator.id
    assert data["author_id"] != test_user.id
    assert data["message"] == (
        "We identified the database connection pool as the cause."
    )
    assert data["status"] == "identified"
    assert "created_at" in data

    incident_response = client.get(
        f"/incidents/{incident_id}"
    )

    assert incident_response.status_code == 200

    incident_data = incident_response.json()

    assert incident_data["status"] == "identified"


def test_create_incident_update_invalid_transition(
    client,
    test_service,
    test_user,
):
    create_response = client.post(
        "/incidents",
        json={
            "service_id": test_service.id,
            "created_by": test_user.id,
            "title": "API outage",
            "severity": "critical",
        },
    )

    assert create_response.status_code == 201

    incident_id = create_response.json()["id"]

    response = client.post(
        f"/incidents/{incident_id}/updates",
        json={
            "author_id": test_user.id,
            "message": "Trying to resolve immediately.",
            "status": "resolved",
        },
    )

    assert response.status_code == 422

    assert response.json() == {
        "detail": "Invalid incident status transition"
    }



def test_resolve_incident_through_update(
    client,
    test_service,
    test_user,
):
    create_response = client.post(
        "/incidents",
        json={
            "service_id": test_service.id,
            "created_by": test_user.id,
            "title": "Database outage",
            "severity": "critical",
        },
    )

    assert create_response.status_code == 201

    incident_id = create_response.json()["id"]

    response = client.post(
        f"/incidents/{incident_id}/updates",
        json={
            "author_id": test_user.id,
            "message": "The root cause has been identified.",
            "status": "identified",
        },
    )

    assert response.status_code == 201

    response = client.post(
        f"/incidents/{incident_id}/updates",
        json={
            "author_id": test_user.id,
            "message": "The fix has been deployed and we are monitoring.",
            "status": "monitoring",
        },
    )

    assert response.status_code == 201

    response = client.post(
        f"/incidents/{incident_id}/updates",
        json={
            "author_id": test_user.id,
            "message": "All systems have returned to normal.",
            "status": "resolved",
        },
    )

    assert response.status_code == 201

    incident_response = client.get(
        f"/incidents/{incident_id}"
    )

    assert incident_response.status_code == 200

    incident = incident_response.json()

    assert incident["status"] == "resolved"
    assert incident["resolved_at"] is not None




def test_list_incident_updates(
    client,
    test_service,
    test_user,
):
    create_response = client.post(
        "/incidents",
        json={
            "service_id": test_service.id,
            "created_by": test_user.id,
            "title": "API outage",
            "severity": "high",
        },
    )

    assert create_response.status_code == 201

    incident_id = create_response.json()["id"]

    first_update = client.post(
        f"/incidents/{incident_id}/updates",
        json={
            "author_id": test_user.id,
            "message": "We are investigating the issue.",
            "status": "identified",
        },
    )

    assert first_update.status_code == 201

    second_update = client.post(
        f"/incidents/{incident_id}/updates",
        json={
            "author_id": test_user.id,
            "message": "The fix has been deployed.",
            "status": "monitoring",
        },
    )

    assert second_update.status_code == 201

    response = client.get(
        f"/incidents/{incident_id}/updates"
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    assert data[0]["status"] == "identified"
    assert data[0]["message"] == "We are investigating the issue."

    assert data[1]["status"] == "monitoring"
    assert data[1]["message"] == "The fix has been deployed."



def test_list_incident_updates_not_found(client):
    response = client.get(
        "/incidents/999999/updates"
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Incident not found"
    }
