VALID_INCIDENT_SEVERITIES = {
    "low",
    "medium",
    "high",
    "critical",
}

VALID_INCIDENT_STATUSES = {
    "investigating",
    "identified",
    "monitoring",
    "resolved",
}

VALID_STATUS_TRANSITIONS = {
    "investigating": {"identified"},
    "identified": {"monitoring"},
    "monitoring": {"resolved"},
    "resolved": set(),
}


def is_valid_incident_severity(severity: str) -> bool:
    return severity in VALID_INCIDENT_SEVERITIES


def is_valid_incident_status(status: str) -> bool:
    return status in VALID_INCIDENT_STATUSES


def can_transition_status(current_status: str, new_status: str) -> bool:
    if not is_valid_incident_status(current_status):
        return False

    if not is_valid_incident_status(new_status):
        return False

    return new_status in VALID_STATUS_TRANSITIONS[current_status]
