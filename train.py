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
            if os.path.exists(os.path.join(path, "True.csv")) and os.path.exists(os.path.join(path, "Fake.csv")):
                return os.path.abspath(path)
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "data"))

def train_model():
    print("==================================================")
    print("🤖 VeriFact AI — English Model Training Pipeline")
    print("==================================================")
    
    base_dir = resolve_data_dir()
    true_path = os.path.join(base_dir, "True.csv")
    fake_path = os.path.join(base_dir, "Fake.csv")
    
    print(f"Checking dataset directory: {base_dir}")
    if not os.path.exists(true_path) or not os.path.exists(fake_path):
        print("\n❌ Error: Datasets not found!")
        print(f"Expected files:\n  - {true_path}\n  - {fake_path}")
        print("\nPlease place 'True.csv' and 'Fake.csv' in the 'data/' directory or set DATA_DIR.")
        sys.exit(1)

    print("1. Loading True.csv and Fake.csv...")
    true_df = pd.read_csv(true_path)
    fake_df = pd.read_csv(fake_path)
    
    print(f"   - Real articles: {len(true_df)}")
    print(f"   - Fake articles: {len(fake_df)}")
    
    # Label 1 = Real, 0 = Fake
    true_df["label"] = 1
    fake_df["label"] = 0

    # Combine and shuffle
    df = pd.concat([true_df, fake_df], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Combine title and text for rich context
    df["content"] = df["title"].fillna("") + " " + df["text"].fillna("")

    X = df["content"]
    y = df["label"]

    # 80% training, 20% testing with stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"2. Training TF-IDF + Logistic Regression pipeline on {len(X_train)} samples...")
    
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(stop_words="english", max_df=0.7, min_df=2, ngram_range=(1, 2))),
        ("clf", LogisticRegression(max_iter=1000, C=1.0, random_state=42))
    ])

    pipeline.fit(X_train, y_train)

    print("3. Evaluating model performance on test set...")
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n✅ Model Accuracy: {acc * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Fake (0)", "Real (1)"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Save the trained pipeline to disk
    model_filename = os.path.join(os.path.dirname(__file__), "fake_news_model.joblib")
    joblib.dump(pipeline, model_filename)
    print(f"\n4. Successfully saved trained pipeline to '{model_filename}'!")

if __name__ == "__main__":
    train_model()
