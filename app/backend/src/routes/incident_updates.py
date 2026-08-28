from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.incident import Incident
from src.models.user import User
from src.models.incident_update import IncidentUpdate
from src.schemas.incident_update import (
    IncidentUpdateCreate,
    IncidentUpdateResponse,
)
from src.services.incident_service import create_incident_update
from src.security import get_current_user

router = APIRouter(
    prefix="/incidents/{incident_id}/updates",
    tags=["incident-updates"],
)


@router.post(
    "",
    response_model=IncidentUpdateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_update(
    incident_id: int,
    update_data: IncidentUpdateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = db.execute(
        select(Incident).where(Incident.id == incident_id)
    ).scalar_one_or_none()

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    incident_update = create_incident_update(
        db=db,
        incident=incident,
        author_id=current_user.id,
        message=update_data.message,
        status=update_data.status,
    )

    db.commit()
    db.refresh(incident_update)

    return incident_update


@router.get(
    "",
    response_model=list[IncidentUpdateResponse],
)
def list_incident_updates(
    incident_id: int,
    db: Session = Depends(get_db),
):
    incident = db.execute(
        select(Incident).where(Incident.id == incident_id)
    ).scalar_one_or_none()

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    result = db.execute(
        select(IncidentUpdate)
        .where(IncidentUpdate.incident_id == incident_id)
        .order_by(IncidentUpdate.created_at.asc())
    )

    return result.scalars().all()
