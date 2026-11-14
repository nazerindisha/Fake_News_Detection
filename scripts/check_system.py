import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

def run_diagnostics():
    print("==================================================")
    print("🔍 VeriFact AI — Industrial System Diagnostics")
    print("==================================================")
    print(f"Base Project Path: {BASE_DIR}")
    
    data_dir = BASE_DIR / "data"
    models_dir = BASE_DIR / "models"
    
    print(f"Data Directory:    {data_dir} (Exists: {data_dir.exists()})")
    print(f"Models Directory:  {models_dir} (Exists: {models_dir.exists()})\n")
    
    components = {
        "English Real Dataset (True.csv)": [data_dir / "True.csv", BASE_DIR / "True.csv"],
        "English Fake Dataset (Fake.csv)": [data_dir / "Fake.csv", BASE_DIR / "Fake.csv"],
        "Bangla Real Dataset (Authentic-48K.csv)": [data_dir / "Authentic-48K.csv", BASE_DIR / "Authentic-48K.csv"],
        "Bangla Fake Dataset (Fake-1K.csv)": [data_dir / "Fake-1K.csv", BASE_DIR / "Fake-1K.csv"],
        "English Trained Model (.joblib)": [models_dir / "fake_news_model.joblib", BASE_DIR / "fake_news_model.joblib"],
        "Bangla Trained Model (.joblib)": [models_dir / "fake_news_model_bn.joblib", BASE_DIR / "fake_news_model_bn.joblib"],
    }
    
    for name, paths in components.items():
        found = False
        for p in paths:
            if p.exists() and p.is_file():
                mb = p.stat().st_size / (1024 * 1024)
                rel = p.relative_to(BASE_DIR)
                print(f"✅ {name}: Found at '{rel}' ({mb:.2f} MB)")
                found = True
                break
        if not found:
            print(f"⚠️ {name}: Not found (Place in 'data/' or 'models/')")
            
    print("\nVerifying Application Package Modules:")
    try:
        from app.core.config import settings
        print(f"✅ app.core.config (Version: {settings.VERSION})")
    except Exception as e:
        print(f"❌ app.core.config: {e}")

    try:
        from app.core.security import is_safe_url
        print(f"✅ app.core.security (SSRF Guard: Enabled)")
    except Exception as e:
        print(f"❌ app.core.security: {e}")

    try:
        from app.services.scraper import ScraperService
        print(f"✅ app.services.scraper (ScraperService: Ready)")
    except Exception as e:
        print(f"❌ app.services.scraper: {e}")

    try:
        from app.services.classifier import ClassifierService
        cs = ClassifierService()
        print(f"✅ app.services.classifier (EN ready: {cs.is_english_ready}, BN ready: {cs.is_bangla_ready})")
    except Exception as e:
        print(f"❌ app.services.classifier: {e}")

    try:
        from app.services.retriever import RetrieverService
        rs = RetrieverService()
        print(f"✅ app.services.retriever (EN index: {rs.is_english_indexed}, BN index: {rs.is_bangla_indexed})")
    except Exception as e:
        print(f"❌ app.services.retriever: {e}")

    print("==================================================")

if __name__ == "__main__":
    # Ensure project root is on PYTHONPATH
    sys.path.insert(0, str(BASE_DIR))
    run_diagnostics()
