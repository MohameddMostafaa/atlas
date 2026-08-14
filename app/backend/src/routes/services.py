from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.service import Service
from src.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate

from sqlalchemy import select


router = APIRouter(
    prefix="/services",
    tags=["services"],
)


@router.post(
    "",
    response_model=ServiceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_service(
    service_data: ServiceCreate,
    db: Session = Depends(get_db),
):
    service = Service(
        name=service_data.name,
        description=service_data.description,
        url=service_data.url,
    )

    db.add(service)
    db.commit()
    db.refresh(service)

    return service

@router.get(
    "",
    response_model=list[ServiceResponse],
)
def list_services(
    db: Session = Depends(get_db),
):
    result = db.execute(select(Service))
    services = result.scalars().all()

    return services
@router.get(
    "/{service_id}",
    response_model=ServiceResponse,
)

def get_service(
    service_id: int,
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(Service).where(Service.id == service_id)
    )

    service = result.scalar_one_or_none()

    if service is None:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )

    return service


@router.patch(
    "/{service_id}",
    response_model=ServiceResponse,
)
def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(Service).where(Service.id == service_id)
    )

    service = result.scalar_one_or_none()

    if service is None:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )

    update_data = service_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)

    return service

@router.delete(
    "/{service_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(Service).where(Service.id == service_id)
    )

    service = result.scalar_one_or_none()

    if service is None:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )

    db.delete(service)
    db.commit()
