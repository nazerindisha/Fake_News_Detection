from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import os
from pathlib import Path

from app.core.config import settings
from app.api.v1.router import api_router
from app.api.v1.endpoints.prediction import predict_news
from app.schemas.news import NewsRequest, PredictResponse

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Versioned API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Top-level backward-compatible endpoints (allows clients targeting /predict directly to continue working)
app.add_api_route(
    "/predict",
    predict_news,
    methods=["POST"],
    response_model=PredictResponse,
    tags=["Root Endpoints"],
    include_in_schema=True
)

@app.get("/", tags=["Root Endpoints"])
def root():
    """Root metadata & UI landing."""
    frontend_path = Path(__file__).resolve().parent.parent / "frontend" / "index.html"
    if not frontend_path.exists():
        frontend_path = Path(__file__).resolve().parent.parent / "index.html"

    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
        "endpoints": {
            "predict_v1": f"{settings.API_V1_STR}/predict",
            "predict_root": "/predict",
            "health": f"{settings.API_V1_STR}/health"
        }
    }

@app.get("/health", tags=["Root Endpoints"])
def health_redirect():
    return {"status": "ok", "service": settings.PROJECT_NAME, "version": settings.VERSION}
