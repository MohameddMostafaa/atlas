from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.models.incident import Incident
from src.models.incident_update import IncidentUpdate
from src.services.incident import (
    can_transition_status,
    is_valid_incident_severity,
    is_valid_incident_status,
)


def update_incident_status(
    db: Session,
    incident: Incident,
    new_status: str,
) -> None:
    if not is_valid_incident_status(new_status):
        raise HTTPException(
            status_code=422,
            detail="Invalid incident status",
        )

    if not can_transition_status(
        incident.status,
        new_status,
    ):
        raise HTTPException(
            status_code=422,
            detail="Invalid incident status transition",
        )

    incident.status = new_status

    if new_status == "resolved":
        incident.resolved_at = datetime.now(timezone.utc)


def create_incident_update(
    db: Session,
    incident: Incident,
    author_id: int,
    message: str,
    status: str,
) -> IncidentUpdate:
    update_incident_status(
        db=db,
        incident=incident,
        new_status=status,
    )

    incident_update = IncidentUpdate(
        incident_id=incident.id,
        author_id=author_id,
        message=message,
        status=status,
        created_at=datetime.now(timezone.utc),
    )

    db.add(incident_update)

    return incident_update
