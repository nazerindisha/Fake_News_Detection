from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from app.services.image_detector import ImageDetectorService

router = APIRouter()
image_detector = ImageDetectorService(quality=90)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
}
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/predict-image", tags=["Image Forensics"])
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