from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
from scraper import extract_text_from_url
from retriever import ActualNewsRetriever

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Multilingual & Multimodal Fake News Detection")

# Add CORS Middleware to prevent fetch/browser blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for testing
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
print("Loading models and retrieval engines...")
en_model = joblib.load("fake_news_model.joblib")
bn_model = joblib.load("fake_news_model_bn.joblib")
retriever = ActualNewsRetriever()
print("All systems loaded and ready!")

class NewsRequest(BaseModel):
    text: str = None
    url: str = None
    language: str = "en"  # "en" or "bn"

@app.post("/predict")
def predict_news(request: NewsRequest):
    input_text = request.text
    
    # If a URL is provided instead of raw text, scrape it first (Feature 1 scraper)
    if request.url and not input_text:
        try:
            scraped_data = extract_text_from_url(request.url)
            input_text = scraped_data.get("content", "")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to scrape URL: {str(e)}")
            
    if not input_text:
        raise HTTPException(status_code=400, detail="Please provide either text or a valid URL.")

    # Select model based on language
    if request.language.lower() == "bn":
        model = bn_model
        lang_name = "Bangla"
    else:
        model = en_model
        lang_name = "English"

    # Prediction
    pred = model.predict([input_text])[0]
    prob = float(model.predict_proba([input_text])[0].max())
    label = "Real" if pred == 1 else "Fake"

    response = {
        "language": lang_name,
        "prediction": label,
        "confidence": round(prob * 100, 2),
        "actual_news_matches": []
    }

    # Feature 4: If classified as Fake, retrieve the actual verified news!
    if label == "Fake":
        matches = retriever.find_actual_news(input_text, top_k=1)
        response["actual_news_matches"] = matches

    return response