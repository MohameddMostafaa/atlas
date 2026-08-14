from src.services.service_status import is_valid_service_status


def test_operational_status_is_valid():
    assert is_valid_service_status("operational") is True


def test_major_outage_status_is_valid():
    assert is_valid_service_status("major_outage") is True


def test_unknown_status_is_invalid():
    assert is_valid_service_status("banana") is False
