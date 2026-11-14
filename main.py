"""
Application Entrypoint
Exposes the modular FastAPI application defined in app.main.
Allows 'uvicorn main:app --reload' to continue working seamlessly.
"""
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    from app.core.config import settings
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
