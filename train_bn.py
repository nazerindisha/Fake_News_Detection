import os
import sys
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def resolve_data_dir() -> str:
    """Finds the dataset folder dynamically."""
    candidates = [
        os.getenv("DATA_DIR"),
        os.path.join(os.path.dirname(__file__), "data"),
        os.path.dirname(__file__),
        r"D:\7th_Semester_Collections\Project\Fake_News_Detection"
    ]
    for path in candidates:
        if path and os.path.exists(path):
            if os.path.exists(os.path.join(path, "Authentic-48K.csv")) and os.path.exists(os.path.join(path, "Fake-1K.csv")):
                return os.path.abspath(path)
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "data"))

def train_bangla_model():
    print("==================================================")
    print("🤖 VeriFact AI — Bangla Model Training Pipeline")
    print("==================================================")
    
    base_dir = resolve_data_dir()
    true_path = os.path.join(base_dir, "Authentic-48K.csv")
    fake_path = os.path.join(base_dir, "Fake-1K.csv")
    
    print(f"Checking dataset directory: {base_dir}")
    if not os.path.exists(true_path) or not os.path.exists(fake_path):
        print("\n❌ Error: Datasets not found!")
        print(f"Expected files:\n  - {true_path}\n  - {fake_path}")
        print("\nPlease place 'Authentic-48K.csv' and 'Fake-1K.csv' in the 'data/' directory or set DATA_DIR.")
        sys.exit(1)

    print("1. Loading Authentic-48K.csv and Fake-1K.csv...")
    true_df = pd.read_csv(true_path)
    fake_df = pd.read_csv(fake_path)
    
    print(f"   - Authentic articles: {len(true_df)}")
    print(f"   - Fake articles: {len(fake_df)}")
    
    # Label 1 = Authentic/Real, 0 = Fake
    true_df["label"] = 1
    fake_df["label"] = 0

    # Combine and shuffle
    df = pd.concat([true_df, fake_df], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Map column names dynamically (BanFakeNews format vs standard format)
    title_col = "headline" if "headline" in df.columns else "title"
    text_col = "content" if "content" in df.columns else "text"
    
    df["full_text"] = df[title_col].fillna("") + " " + df[text_col].fillna("")

    X = df["full_text"]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"2. Training Bangla TF-IDF + Logistic Regression pipeline on {len(X_train)} samples...")
    
    # token_pattern=r'[\u0980-\u09FF\w]+' properly extracts Bengali words without trailing punctuation
    # class_weight='balanced' compensates for the severe ~48:1 class imbalance
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

    print("3. Evaluating Bangla model performance on test set...")
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n✅ Bangla Model Accuracy: {acc * 100:.2f}%\n")
    print("Classification Report (Pay close attention to Fake class F1-Score due to imbalance):")
    print(classification_report(y_test, y_pred, target_names=["Fake (0)", "Authentic (1)"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Save artifact
    model_filename = os.path.join(os.path.dirname(__file__), "fake_news_model_bn.joblib")
    joblib.dump(pipeline, model_filename)
    print(f"\n4. Successfully saved trained Bangla pipeline to '{model_filename}'!")

if __name__ == "__main__":
    train_bangla_model()
