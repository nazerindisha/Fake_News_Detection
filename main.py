import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib

from scraper import extract_text_from_url
from retriever import ActualNewsRetriever

app = FastAPI(
    title="VeriFact AI — Bilingual Fake News Detection & Fact Verification",
    description="REST API for real-time bilingual (English & Bangla) news classification, web scraping, and retrieval-augmented fact verification.",
    version="2.0.0"
)

# Enable CORS for frontend dashboard and cross-origin clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model and retriever handles
en_model = None
bn_model = None
retriever = None

# Model file paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EN_MODEL_PATH = os.path.join(BASE_DIR, "fake_news_model.joblib")
BN_MODEL_PATH = os.path.join(BASE_DIR, "fake_news_model_bn.joblib")

print("Initializing VeriFact AI Backend Services...")

# 1. Load English Model safely
if os.path.exists(EN_MODEL_PATH):
    try:
        en_model = joblib.load(EN_MODEL_PATH)
        print("✅ English classifier loaded successfully.")
    except Exception as e:
        print(f"⚠️ Error loading English model from '{EN_MODEL_PATH}': {e}")
else:
    print(f"⚠️ English model file '{EN_MODEL_PATH}' not found. Please run 'python train.py' to generate it.")

# 2. Load Bangla Model safely
if os.path.exists(BN_MODEL_PATH):
    try:
        bn_model = joblib.load(BN_MODEL_PATH)
        print("✅ Bangla classifier loaded successfully.")
    except Exception as e:
        print(f"⚠️ Error loading Bangla model from '{BN_MODEL_PATH}': {e}")
else:
    print(f"⚠️ Bangla model file '{BN_MODEL_PATH}' not found. Please run 'python train_bn.py' to generate it.")

# 3. Initialize Hybrid Retriever safely
try:
    retriever = ActualNewsRetriever()
    print("✅ Hybrid Actual News Retriever initialized.")
except Exception as e:
    print(f"⚠️ Notice: Hybrid Retriever initialized with fallback: {e}")
    retriever = None


class NewsRequest(BaseModel):
    text: Optional[str] = Field(None, description="Raw text of the claim, headline, or article")
    url: Optional[str] = Field(None, description="URL of an online news article to scrape and verify")
    language: Optional[str] = Field("en", description="Language code: 'en' for English, 'bn' for Bangla")


class MatchItem(BaseModel):
    source_type: str
    source_label: str
    title: str
    subject: str
    date: str
    similarity_score: float
    snippet: str
    url: Optional[str] = None


class PredictResponse(BaseModel):
    language: str
    language_code: str
    prediction: str
    confidence: float
    actual_news_matches: List[dict]
    evidence: str
    sources: List[str]
    input_preview: str
    note: Optional[str] = None


@app.get("/")
def root():
    return {
        "service": "VeriFact AI API",
        "status": "online",
        "version": "2.0.0",
        "models_status": {
            "english_model_loaded": en_model is not None,
            "bangla_model_loaded": bn_model is not None,
            "retriever_loaded": retriever is not None
        },
        "endpoints": {
            "predict": "/predict (POST)",
            "health": "/health (GET)",
            "docs": "/docs (Swagger UI)"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict_news(request: NewsRequest):
    input_text = request.text.strip() if request.text else None
    scraped_title = None
    
    # 1. If a URL is provided, extract article text using the secure scraper
    if request.url and not input_text:
        scraped_data = extract_text_from_url(request.url)
        if isinstance(scraped_data, dict):
            if scraped_data.get("status") == "error":
                raise HTTPException(status_code=400, detail=scraped_data.get("error", "Failed to scrape URL."))
            input_text = scraped_data.get("content", "").strip()
            scraped_title = scraped_data.get("title", "")
        elif isinstance(scraped_data, str):
            input_text = scraped_data.strip()
            
    if not input_text:
        raise HTTPException(
            status_code=400,
            detail="Please provide either 'text' (claim/headline) or a valid 'url'."
        )

    # 2. Select appropriate model according to specified language
    lang_code = (request.language or "en").strip().lower()
    if lang_code == "bn":
        model = bn_model
        lang_name = "Bangla"
    else:
        lang_code = "en"
        model = en_model
        lang_name = "English"

    model_note = None
    # 3. Model Inference (with fallback if model hasn't been trained yet)
    if model is not None:
        try:
            pred = model.predict([input_text])[0]
            prob = float(model.predict_proba([input_text])[0].max())
            label = "Real" if pred == 1 else "Fake"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
    else:
        # Fallback diagnostic prediction if model artifact is not yet generated
        model_note = f"Warning: {lang_name} model artifact is not loaded. Run train.py or train_bn.py."
        label = "Unverified"
        prob = 0.50

    # 4. Hybrid Retrieval: Retrieve verified ground-truth news
    actual_matches = []
    if retriever is not None:
        try:
            # Query retriever using the proper language parameter
            actual_matches = retriever.find_actual_news(input_text, language=lang_code, top_k=2)
        except Exception as e:
            print(f"Retriever lookup notice: {e}")

    # 5. Build evidence summary and extract URL sources for the frontend
    sources = []
    if actual_matches:
        top_match = actual_matches[0]
        evidence_summary = (
            f"[{top_match.get('source_label', 'Verified Source')}] {top_match.get('title', '')}\n\n"
            f"{top_match.get('snippet', '')}"
        )
        sources = [m["url"] for m in actual_matches if m.get("url")]
    else:
        if label == "Fake":
            evidence_summary = "No direct verified historical match was found in the indexed database or live web search."
        else:
            evidence_summary = f"Claim analyzed through {lang_name} verification pipeline."

    input_preview = (input_text[:280] + "...") if len(input_text) > 280 else input_text
    if scraped_title:
        input_preview = f"Title: {scraped_title}\n\n{input_preview}"

    return {
        "language": lang_name,
        "language_code": lang_code,
        "prediction": label,
        "confidence": round(prob * 100, 2),
        "actual_news_matches": actual_matches,
        "evidence": evidence_summary,
        "sources": sources,
        "input_preview": input_preview,
        "note": model_note
    }
