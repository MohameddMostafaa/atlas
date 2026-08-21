from fastapi import FastAPI

from src.routes.services import router as services_router
from src.routes.incidents import router as incidents_router
from src.routes.incident_updates import router as incident_updates_router

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Atlas API is running - deployed via CI/CD"}


@app.get("/health")
def health():
    return {"status": "healthy"}


app.include_router(services_router)
app.include_router(incidents_router)
app.include_router(incident_updates_router)
