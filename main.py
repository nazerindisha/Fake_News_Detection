from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import numpy as np
import os
from scraper import extract_text_from_url
from retriever import ActualNewsRetriever
from app.api.v1.router import api_router
from app.api.v1.endpoints.image_prediction import predict_image

app = FastAPI(title="Multilingual & Multimodal Fake News Detection")

# Add CORS Middleware to prevent browser fetch blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount versioned API router (exposes /api/v1/predict-image, etc.)
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
EN_MODEL_PATH = os.path.join(BASE_DIR, "fake_news_model.joblib")
BN_MODEL_PATH = os.path.join(BASE_DIR, "fake_news_model_bn.joblib")

print("Loading models and retrieval engines...")
en_model = joblib.load(EN_MODEL_PATH)
bn_model = joblib.load(BN_MODEL_PATH)
retriever = ActualNewsRetriever()
print("All systems loaded and ready!")


class NewsRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None
    language: str = "en"  # "en" or "bn"


def analyze_patterns(text: str, model, lang_code: str) -> list[str]:
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

    # 2. Extract top influential TF-IDF features from your trained pipeline
    try:
        vec = model.named_steps.get("tfidfvectorizer") or model.steps[0][1]
        clf = model.named_steps.get("logisticregression") or model.steps[-1][1]
        tfidf_row = vec.transform([text])
        feature_names = np.array(vec.get_feature_names_out())
        coefs = clf.coef_[0]

        nonzero_idx = tfidf_row.nonzero()[1]
        if len(nonzero_idx) > 0:
            contributions = tfidf_row.data * coefs[nonzero_idx]
            sorted_order = np.argsort(contributions)
            top_fake_terms = feature_names[nonzero_idx[sorted_order[:3]]]
            top_real_terms = feature_names[nonzero_idx[sorted_order[-3:]]][::-1]
            reasons.append(
                f"Key model indicators — Fake signals: [{', '.join(top_fake_terms)}] | "
                f"Authentic signals: [{', '.join(top_real_terms)}]"
            )
    except Exception:
        pass

    return reasons or ["Standard lexical and structural distribution analyzed by TF-IDF classifier."]


@app.get("/")
def health_check():
    return {"status": "online", "message": "VeriFact AI Backend is running."}


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

    # Select model based on requested language
    lang_code = (request.language or "en").lower()
    if lang_code == "bn":
        model = bn_model
        lang_name = "Bangla"
    else:
        model = en_model
        lang_name = "English"

    # Run ML classification
    pred = model.predict([input_text])[0]
    prob = float(model.predict_proba([input_text])[0].max())
    label = "Real" if str(pred) in ["1", "Real", "REAL", "True"] else "Fake"

    response = {
        "language": lang_name,
        "prediction": label,
        "confidence": round(prob * 100, 2),
        "explanations": analyze_patterns(input_text, model, lang_code),
        "actual_news_matches": []
    }

    # If classified as Fake, retrieve matching verified news articles
    if label == "Fake":
        matches = retriever.find_matches(input_text, language=lang_code)
        response["actual_news_matches"] = matches

    return response