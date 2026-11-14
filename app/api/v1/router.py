from fastapi import APIRouter
from app.api.v1.endpoints import prediction, health

api_router = APIRouter()
api_router.include_router(health.router, tags=["System Health"])
api_router.include_router(prediction.router, tags=["News Verification"])
