from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ServiceCreate(BaseModel):
    name: str
    description: str | None = None
    url: str | None = None


class ServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    url: str | None
    status: str
    created_at: datetime
    updated_at: datetime

class ServiceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    url: str | None = None
    status: str | None = None
