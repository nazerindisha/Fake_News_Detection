import os
from pathlib import Path
from typing import List

# Base directory of the repository
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    # Project Info
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "VeriFact AI")
    VERSION: str = os.getenv("VERSION", "2.1.0")
    DESCRIPTION: str = "Enterprise Bilingual (English & Bangla) Fake News Detection & Fact Verification Platform"
    API_V1_STR: str = "/api/v1"
    
    # Server Settings
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Directory Paths
    DATA_DIR: Path = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
    MODELS_DIR: Path = Path(os.getenv("MODELS_DIR", BASE_DIR / "models"))
    
    # Model Artifact Paths
    EN_MODEL_PATH: Path = MODELS_DIR / "fake_news_model.joblib"
    BN_MODEL_PATH: Path = MODELS_DIR / "fake_news_model_bn.joblib"
    
    # Fallback paths for legacy artifacts in root directory
    LEGACY_EN_MODEL_PATH: Path = BASE_DIR / "fake_news_model.joblib"
    LEGACY_BN_MODEL_PATH: Path = BASE_DIR / "fake_news_model_bn.joblib"
    
    # Dataset File Paths
    EN_TRUE_CSV: Path = DATA_DIR / "True.csv"
    EN_FAKE_CSV: Path = DATA_DIR / "Fake.csv"
    BN_AUTHENTIC_CSV: Path = DATA_DIR / "Authentic-48K.csv"
    BN_FAKE_CSV: Path = DATA_DIR / "Fake-1K.csv"
    
    # Retriever & Search Thresholds
    EN_SIMILARITY_THRESHOLD: float = 0.20
    BN_SIMILARITY_THRESHOLD: float = 0.18
    LIVE_SEARCH_FALLBACK_THRESHOLD: float = 0.25
    DEFAULT_TOP_K: int = 2

settings = Settings()
