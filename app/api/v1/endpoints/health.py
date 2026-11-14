from fastapi import APIRouter, Depends
from app.core.config import settings
from app.schemas.news import HealthResponse
from app.api.v1.endpoints.prediction import get_classifier, get_retriever
from app.services.classifier import ClassifierService
from app.services.retriever import RetrieverService

router = APIRouter()

@router.get("/health", response_model=HealthResponse, summary="API Health Check")
def health_check(
    classifier: ClassifierService = Depends(get_classifier),
    retriever: RetrieverService = Depends(get_retriever)
):
    """Returns system status, version, and model/indexer readiness."""
    return HealthResponse(
        status="ok",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        models_status={
            "english_model_loaded": classifier.is_english_ready,
            "bangla_model_loaded": classifier.is_bangla_ready,
            "english_index_ready": retriever.is_english_indexed,
            "bangla_index_ready": retriever.is_bangla_indexed
        }
    )
