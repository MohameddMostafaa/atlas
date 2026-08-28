from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IncidentCreate(BaseModel):
    service_id: int
    title: str
    description: str | None = None
    severity: str = "medium"


class IncidentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    severity: str | None = None
    status: str | None = None


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_id: int
    created_by: int
    title: str
    description: str | None
    severity: str
    status: str
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None
