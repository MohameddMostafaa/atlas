from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IncidentUpdateCreate(BaseModel):
    message: str
    status: str


class IncidentUpdateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    incident_id: int
    author_id: int
    message: str
    status: str
    created_at: datetime
