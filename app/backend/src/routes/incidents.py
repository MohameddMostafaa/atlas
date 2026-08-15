from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.incident import Incident
from src.models.service import Service
from src.models.user import User
from src.schemas.incident import IncidentCreate, IncidentResponse, IncidentUpdate
from src.services.incident import (
    can_transition_status,
    is_valid_incident_severity,
    is_valid_incident_status,
)
from src.services.incident_service import update_incident_status


router = APIRouter(
    prefix="/incidents",
    tags=["incidents"],
)


@router.post(
    "",
    response_model=IncidentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db),
):
    service = db.execute(
        select(Service).where(Service.id == incident_data.service_id)
    ).scalar_one_or_none()

    if service is None:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )

    user = db.execute(
        select(User).where(User.id == incident_data.created_by)
    ).scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if not is_valid_incident_severity(incident_data.severity):
        raise HTTPException(
            status_code=422,
            detail="Invalid incident severity",
        )

    incident = Incident(
        service_id=incident_data.service_id,
        created_by=incident_data.created_by,
        title=incident_data.title,
        description=incident_data.description,
        severity=incident_data.severity,
        status="investigating",
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    return incident


@router.get(
    "",
    response_model=list[IncidentResponse],
)
def list_incidents(
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(Incident).order_by(Incident.created_at.desc())
    )

    return result.scalars().all()

@router.get(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(Incident).where(Incident.id == incident_id)
    )

    incident = result.scalar_one_or_none()

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return incident

@router.patch(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def update_incident(
    incident_id: int,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(Incident).where(Incident.id == incident_id)
    )

    incident = result.scalar_one_or_none()

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    update_data = incident_data.model_dump(exclude_unset=True)

    if "severity" in update_data:
        if not is_valid_incident_severity(update_data["severity"]):
            raise HTTPException(
                status_code=422,
                detail="Invalid incident severity",
            )

    if "status" in update_data:
        update_incident_status(
            db=db,
            incident=incident,
            new_status=update_data["status"],
        )

    del update_data["status"]
    for field, value in update_data.items():
        setattr(incident, field, value)

    db.commit()
    db.refresh(incident)

    return incident
