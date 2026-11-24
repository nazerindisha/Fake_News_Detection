from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import os
from pathlib import Path

from app.core.config import settings
from app.api.v1.router import api_router
from app.api.v1.endpoints.prediction import predict_news
from app.schemas.news import NewsRequest, PredictResponse
from app.services.image_detector import ImageDetectorService

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

image_detector = ImageDetectorService(quality=90)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
}
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


@app.post("/predict-image", tags=["Image Forensics"])
async def predict_image(
    file: UploadFile = File(...),
    quality: int = Query(default=90, ge=10, le=100),
):
    if file.content_type and file.content_type.lower() not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type '{file.content_type}'. Allowed: JPEG, PNG, WebP, AVIF.",
        )

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds the 5 MB limit.")

    try:
        result = image_detector.predict(image_bytes=image_bytes, quality=quality)
        result["filename"] = file.filename
        result["content_type"] = file.content_type
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to analyze uploaded image.")


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
            "predict_image": "/predict-image",
            "health": f"{settings.API_V1_STR}/health"
        }
    }


@app.get("/health", tags=["Root Endpoints"])
def health_redirect():
    return {"status": "ok", "service": settings.PROJECT_NAME, "version": settings.VERSION}