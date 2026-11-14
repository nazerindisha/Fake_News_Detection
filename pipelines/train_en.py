import os
import sys
from pathlib import Path
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
MODELS_DIR = Path(os.getenv("MODELS_DIR", BASE_DIR / "models"))

def train_english_pipeline():
    print("==================================================")
    print("🤖 VeriFact AI — English Model Training Pipeline")
    print("==================================================")

    true_path = DATA_DIR / "True.csv"
    fake_path = DATA_DIR / "Fake.csv"

    # Fallback to root directory if not in data/
    if not true_path.exists():
        true_path = BASE_DIR / "True.csv"
    if not fake_path.exists():
        fake_path = BASE_DIR / "Fake.csv"

    if not true_path.exists() or not fake_path.exists():
        print(f"\n❌ Error: English dataset not found!")
        print(f"Looked in:\n  - {true_path}\n  - {fake_path}")
        print("Please place 'True.csv' and 'Fake.csv' in the 'data/' folder.")
        sys.exit(1)

    print(f"Loading datasets from {DATA_DIR}...")
    true_df = pd.read_csv(true_path)
    fake_df = pd.read_csv(fake_path)

    print(f"  - Real articles: {len(true_df)}")
    print(f"  - Fake articles: {len(fake_df)}")

    true_df["label"] = 1
    fake_df["label"] = 0

    df = pd.concat([true_df, fake_df], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    df["content"] = df["title"].fillna("") + " " + df["text"].fillna("")

    X = df["content"]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Training TF-IDF + Logistic Regression on {len(X_train)} samples...")
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(stop_words="english", max_df=0.7, min_df=2, ngram_range=(1, 2))),
        ("clf", LogisticRegression(max_iter=1000, C=1.0, random_state=42))
    ])

    pipeline.fit(X_train, y_train)

    print("Evaluating English model performance...")
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n✅ Accuracy: {acc * 100:.2f}%\n")
    print(classification_report(y_test, y_pred, target_names=["Fake (0)", "Real (1)"]))

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = MODELS_DIR / "fake_news_model.joblib"
    joblib.dump(pipeline, out_path)
    print(f"✅ Saved trained pipeline to '{out_path}'")

    # Also save in root for legacy backward compatibility
    try:
        joblib.dump(pipeline, BASE_DIR / "fake_news_model.joblib")
    except Exception:
        pass

if __name__ == "__main__":
    train_english_pipeline()
