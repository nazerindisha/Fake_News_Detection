import os
import sys
from pathlib import Path
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
MODELS_DIR = Path(os.getenv("MODELS_DIR", BASE_DIR / "models"))


def train_bangla_pipeline():
    print("==================================================")
    print("🤖 VeriFact AI — Enhanced Bangla Training Pipeline")
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
        sys.exit(1)

    print(f"Loading datasets from {DATA_DIR}...")
    true_df = pd.read_csv(auth_path)
    fake_df = pd.read_csv(fake_path)

    true_df["label"] = 1
    fake_df["label"] = 0

    df = pd.concat([true_df, fake_df], ignore_index=True)

    title_col = "headline" if "headline" in df.columns else "title"
    text_col = "content" if "content" in df.columns else "text"
    df["full_text"] = (df[title_col].fillna("") + " " + df[text_col].fillna("")).str.strip()

    # Remove empty and duplicate texts to prevent train/test leakage
    df = df[df["full_text"].str.len() > 10].drop_duplicates(subset=["full_text"])
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    print(f"  - Clean Authentic articles: {(df['label'] == 1).sum()}")
    print(f"  - Clean Fake articles:      {(df['label'] == 0).sum()}")

    X = df["full_text"]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Training Hybrid Word+Char TF-IDF + Logistic Regression on {len(X_train)} samples...")

    features = FeatureUnion([
        ("word_tfidf", TfidfVectorizer(
            token_pattern=r"[\u0980-\u09FF\w]+|[!?।]{1,3}",
            max_df=0.85,
            min_df=2,
            ngram_range=(1, 2),
            max_features=35000,
            sublinear_tf=True
        )),
        ("char_tfidf", TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 5),
            min_df=3,
            max_features=35000,
            sublinear_tf=True
        ))
    ])

    pipeline = Pipeline([
        ("features", features),
        ("clf", LogisticRegression(
            C=2.0,
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        ))
    ])

    pipeline.fit(X_train, y_train)

    print("\nEvaluating Bangla model performance...")
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average="macro")

    print(f"✅ Accuracy:  {acc * 100:.2f}%")
    print(f"✅ Macro F1:  {macro_f1 * 100:.2f}%\n")
    print(classification_report(y_test, y_pred, target_names=["Fake (0)", "Authentic (1)"]))
    print("Confusion Matrix [[TN, FP], [FN, TP]]:")
    print(confusion_matrix(y_test, y_pred))

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = MODELS_DIR / "fake_news_model_bn.joblib"
    joblib.dump(pipeline, out_path)
    print(f"\n✅ Saved trained Bangla pipeline to '{out_path}'")

    try:
        joblib.dump(pipeline, BASE_DIR / "fake_news_model_bn.joblib")
    except Exception:
        pass


if __name__ == "__main__":
    train_bangla_pipeline()