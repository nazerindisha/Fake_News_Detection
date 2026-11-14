import os
import joblib
from pathlib import Path
from sklearn.metrics import classification_report, confusion_matrix
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
MODELS_DIR = Path(os.getenv("MODELS_DIR", BASE_DIR / "models"))

def evaluate_models():
    print("==================================================")
    print("📊 VeriFact AI — Model Evaluation Suite")
    print("==================================================")

    en_model_path = MODELS_DIR / "fake_news_model.joblib"
    if not en_model_path.exists():
        en_model_path = BASE_DIR / "fake_news_model.joblib"

    bn_model_path = MODELS_DIR / "fake_news_model_bn.joblib"
    if not bn_model_path.exists():
        bn_model_path = BASE_DIR / "fake_news_model_bn.joblib"

    print(f"English Model Artifact: {'Found' if en_model_path.exists() else 'Missing'}")
    print(f"Bangla Model Artifact:  {'Found' if bn_model_path.exists() else 'Missing'}")

    sample_en = [
        ("NASA confirms new lunar expedition planned for next year.", 1),
        ("Shocking secret conspiracy uncovered: aliens in world government!", 0)
    ]

    if en_model_path.exists():
        print("\nEvaluating sample English predictions:")
        en_model = joblib.load(en_model_path)
        for text, expected in sample_en:
            pred = en_model.predict([text])[0]
            prob = en_model.predict_proba([text])[0].max()
            verdict = "Real" if pred == 1 else "Fake"
            print(f"  - Claim: '{text[:50]}...' -> Pred: {verdict} ({prob*100:.1f}%)")

if __name__ == "__main__":
    evaluate_models()
