from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import joblib
import numpy as np
import os

from scraper import extract_text_from_url
from retriever import ActualNewsRetriever
from app.api.v1.router import api_router
from app.api.v1.endpoints.image_prediction import predict_image
from app.services.classifier import detect_language

app = FastAPI(title="Multilingual & Multimodal Fake News Detection")

# Add CORS Middleware to prevent browser fetch blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount versioned API router (exposes /api/v1/predict, /api/v1/predict-image, /api/v1/health)
app.include_router(api_router, prefix="/api/v1")

# Expose /predict-image at root without duplicating the endpoint handler
app.add_api_route(
    "/predict-image",
    predict_image,
    methods=["POST"],
    tags=["Image Forensics"],
    include_in_schema=True,
)

# Anchor model paths dynamically relative to main.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

EN_MODEL_PATH = os.path.join(MODELS_DIR, "fake_news_model.joblib")
if not os.path.exists(EN_MODEL_PATH):
    EN_MODEL_PATH = os.path.join(BASE_DIR, "fake_news_model.joblib")

BN_MODEL_PATH = os.path.join(MODELS_DIR, "fake_news_model_bn.joblib")
if not os.path.exists(BN_MODEL_PATH):
    BN_MODEL_PATH = os.path.join(BASE_DIR, "fake_news_model_bn.joblib")

print("Loading models and retrieval engines...")
en_model = None
bn_model = None

if os.path.exists(EN_MODEL_PATH):
    try:
        en_model = joblib.load(EN_MODEL_PATH)
        print(f"✅ Loaded English model from '{EN_MODEL_PATH}'")
    except Exception as exc:
        print(f"⚠️ Failed to load English model: {exc}")
else:
    print(f"⚠️ English model artifact not found at '{EN_MODEL_PATH}'. Run train_en.py to train.")

if os.path.exists(BN_MODEL_PATH):
    try:
        bn_model = joblib.load(BN_MODEL_PATH)
        print(f"✅ Loaded Bangla model from '{BN_MODEL_PATH}'")
    except Exception as exc:
        print(f"⚠️ Failed to load Bangla model: {exc}")
else:
    print(f"⚠️ Bangla model artifact not found at '{BN_MODEL_PATH}'. Run train_bn.py to train.")

try:
    retriever = ActualNewsRetriever()
except Exception as exc:
    print(f"⚠️ Notice: Retriever fallback active ({exc})")
    retriever = None

print("Backend initialization complete!")


class NewsRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None
    language: str = "auto"  # "auto" (default), "en", or "bn"


def analyze_patterns(text: str, model, lang_code: str) -> List[str]:
    reasons = []

    # 1. Stylometric checks (punctuation, ALL-CAPS, clickbait cues)
    if text.count("!") >= 2 or "??" in text:
        reasons.append("Excessive exclamation/question marks (sensationalist punctuation cue).")

    if lang_code == "en":
        caps_words = [w for w in text.split() if len(w) >= 4 and w.isupper()]
        if len(caps_words) >= 2:
            reasons.append(f"Heavy ALL-CAPS emphasis detected ({', '.join(caps_words[:3])}).")
        en_triggers = ["breaking", "secretly", "exposed", "shocking", "they don't want you to know", "miracle"]
        found = [t for t in en_triggers if t in text.lower()]
        if found:
            reasons.append(f"Clickbait/conspiracy phrasing detected: {', '.join(found)}.")
    else:
        bn_triggers = ["ভাইরাল", "ফাঁস", "গোপন", "অবাক হবেন", "তোলপাড়", "গুজব", "ষড়যন্ত্র", "মাত্র ৩ দিনে"]
        found = [t for t in bn_triggers if t in text]
        if found:
            reasons.append(f"Bangla clickbait/rumor keywords detected: {', '.join(found)}.")

    # 2. Extract top influential TF-IDF / FeatureUnion features
    if model is not None:
        try:
            vec = (
                model.named_steps.get("tfidf") or
                model.named_steps.get("features") or
                model.named_steps.get("tfidfvectorizer") or
                model.steps[0][1]
            )
            clf = (
                model.named_steps.get("clf") or
                model.named_steps.get("logisticregression") or
                model.steps[-1][1]
            )
            tfidf_row = vec.transform([text])
            feature_names = np.array(vec.get_feature_names_out())
            coefs = clf.coef_[0]

            nonzero_idx = tfidf_row.nonzero()[1]
            if len(nonzero_idx) > 0:
                contributions = tfidf_row.data * coefs[nonzero_idx]
                sorted_order = np.argsort(contributions)

                def clean_token(name: str) -> str:
                    if "__" in name:
                        return name.split("__", 1)[1]
                    return name

                top_fake_terms = [clean_token(t) for t in feature_names[nonzero_idx[sorted_order[:3]]]]
                top_real_terms = [clean_token(t) for t in feature_names[nonzero_idx[sorted_order[-3:]]][::-1]]
                reasons.append(
                    f"Key model indicators — Fake signals: [{', '.join(top_fake_terms)}] | "
                    f"Authentic signals: [{', '.join(top_real_terms)}]"
                )
        except Exception:
            pass

    return reasons or ["Standard lexical and structural distribution analyzed by TF-IDF classifier."]


@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "VeriFact AI Backend",
        "models_status": {
            "english_model_loaded": en_model is not None,
            "bangla_model_loaded": bn_model is not None,
            "retriever_loaded": retriever is not None
        }
    }


@app.get("/health")
def health_endpoint():
    return {"status": "ok", "service": "VeriFact AI Backend"}


@app.post("/predict")
def predict_news(request: NewsRequest):
    input_text = request.text

    # Scrape article content if a URL is provided instead of raw text
    if request.url and not input_text:
        try:
            scraped_data = extract_text_from_url(request.url)
            if isinstance(scraped_data, dict):
                input_text = scraped_data.get("content", "")
            else:
                input_text = scraped_data or ""
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to scrape URL: {str(e)}")

    if not input_text or not input_text.strip():
        raise HTTPException(status_code=400, detail="Please provide either text or a valid URL.")

    # Select or auto-detect language (works for both raw text and scraped URLs)
    lang_code = (request.language or "auto").lower().strip()
    if lang_code in ("auto", "detect", ""):
        lang_code = detect_language(input_text)

    if lang_code == "bn":
        model = bn_model
        lang_name = "Bangla"
    else:
        lang_code = "en"
        model = en_model
        lang_name = "English"

    # Run ML classification
    if model is not None:
        try:
            pred = model.predict([input_text])[0]
            prob = float(model.predict_proba([input_text])[0].max())
            label = "Real" if str(pred) in ["1", "Real", "REAL", "True"] else "Fake"
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Inference error: {exc}")
    else:
        label = "Unverified"
        prob = 0.50

    response = {
        "language": lang_name,
        "language_code": lang_code,
        "prediction": label,
        "confidence": round(prob * 100, 2),
        "explanations": analyze_patterns(input_text, model, lang_code),
        "actual_news_matches": []
    }

    # Retrieve matching verified news articles
    if retriever is not None:
        try:
            matches = retriever.find_matches(input_text, language=lang_code)
            response["actual_news_matches"] = matches
        except Exception as exc:
            print(f"Retriever notice: {exc}")

    return response
