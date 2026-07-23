from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api.router import api_router
from app.database import Base, engine

# Create tables on startup if they don't exist yet.
# Fine for local dev / learning
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MeepleUp API")

# Mount API routes
app.include_router(api_router)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/health")
def root_health():
    return {"status": "ok", "type": "root_health"}
