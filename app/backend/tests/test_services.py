def test_create_service(client):
    response = client.post(
        "/services",
        json={
            "name": "Test API",
            "description": "A service created during testing",
            "url": "http://test-api",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Test API"
    assert data["description"] == "A service created during testing"
    assert data["url"] == "http://test-api"
    assert data["status"] == "operational"
    assert "id" in data

def test_list_services(client):
    create_response = client.post(
        "/services",
        json={
            "name": "List Test API",
            "description": "Testing service listing",
            "url": "http://list-test",
        },
    )

    assert create_response.status_code == 201

    response = client.get("/services")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["name"] == "List Test API"


def test_get_service(client):
    create_response = client.post(
        "/services",
        json={
            "name": "Get Test API",
            "description": "Testing service retrieval",
            "url": "http://get-test",
        },
    )

    assert create_response.status_code == 201

    service_id = create_response.json()["id"]

    response = client.get(f"/services/{service_id}")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == service_id
    assert data["name"] == "Get Test API"


def test_get_service_not_found(client):
    response = client.get("/services/999999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Service not found"}


def test_update_service(client):
    create_response = client.post(
        "/services",
        json={
            "name": "Update Test API",
            "description": "Before update",
            "url": "http://update-test",
        },
    )

    assert create_response.status_code == 201

    service_id = create_response.json()["id"]

    response = client.patch(
        f"/services/{service_id}",
        json={
            "status": "degraded",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "degraded"
    assert data["name"] == "Update Test API"
    assert data["description"] == "Before update"


def test_delete_service(client):
    create_response = client.post(
        "/services",
        json={
            "name": "Delete Test API",
            "description": "Testing deletion",
            "url": "http://delete-test",
        },
    )

    assert create_response.status_code == 201

    service_id = create_response.json()["id"]

    response = client.delete(f"/services/{service_id}")

    assert response.status_code == 204

    get_response = client.get(f"/services/{service_id}")

    assert get_response.status_code == 404


def test_create_service_invalid_input(client):
    response = client.post(
        "/services",
        json={
            "description": "Missing name",
            "url": "http://invalid",
        },
    )

    assert response.status_code == 422
