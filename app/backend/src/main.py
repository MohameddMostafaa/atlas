from fastapi import FastAPI

from src.routes.services import router as services_router


app = FastAPI()


@app.get("/")
def root():
    return {"message": "Atlas API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


app.include_router(services_router)
