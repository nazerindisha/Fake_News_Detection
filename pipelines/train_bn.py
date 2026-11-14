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

def train_bangla_pipeline():
    print("==================================================")
    print("🤖 VeriFact AI — Bangla Model Training Pipeline")
    print("==================================================")

    auth_path = DATA_DIR / "Authentic-48K.csv"
    fake_path = DATA_DIR / "Fake-1K.csv"

    if not auth_path.exists():
        auth_path = BASE_DIR / "Authentic-48K.csv"
    if not fake_path.exists():
        fake_path = BASE_DIR / "Fake-1K.csv"

    if not auth_path.exists() or not fake_path.exists():
        print(f"\n❌ Error: Bangla dataset not found!")
        print(f"Looked in:\n  - {auth_path}\n  - {fake_path}")
        print("Please place 'Authentic-48K.csv' and 'Fake-1K.csv' in the 'data/' folder.")
        sys.exit(1)

    print(f"Loading datasets from {DATA_DIR}...")
    true_df = pd.read_csv(auth_path)
    fake_df = pd.read_csv(fake_path)

    print(f"  - Authentic articles: {len(true_df)}")
    print(f"  - Fake articles: {len(fake_df)}")

    true_df["label"] = 1
    fake_df["label"] = 0

    df = pd.concat([true_df, fake_df], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    title_col = "headline" if "headline" in df.columns else "title"
    text_col = "content" if "content" in df.columns else "text"
    df["full_text"] = df[title_col].fillna("") + " " + df[text_col].fillna("")

    X = df["full_text"]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Training Bangla TF-IDF + Logistic Regression on {len(X_train)} samples...")
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            token_pattern=r"[\u0980-\u09FF\w]+",
            max_df=0.8,
            min_df=2,
            ngram_range=(1, 2)
        )),
        ("clf", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42))
    ])

    pipeline.fit(X_train, y_train)

    print("Evaluating Bangla model performance...")
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n✅ Accuracy: {acc * 100:.2f}%\n")
    print(classification_report(y_test, y_pred, target_names=["Fake (0)", "Authentic (1)"]))

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = MODELS_DIR / "fake_news_model_bn.joblib"
    joblib.dump(pipeline, out_path)
    print(f"✅ Saved trained Bangla pipeline to '{out_path}'")

    try:
        joblib.dump(pipeline, BASE_DIR / "fake_news_model_bn.joblib")
    except Exception:
        pass

if __name__ == "__main__":
    train_bangla_pipeline()
