VALID_SERVICE_STATUSES = {
    "operational",
    "degraded",
    "partial_outage",
    "major_outage",
}


def is_valid_service_status(status: str) -> bool:
    return status in VALID_SERVICE_STATUSES
