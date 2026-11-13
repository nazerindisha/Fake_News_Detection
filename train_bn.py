import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report

def train_bangla_model():
    print("1. Loading Authentic-48K.csv and Fake-1K.csv...")
    
    base_dir = "D:/7th_Semester_Collections/Project/Fake_News_Detection"
    true_path = os.path.join(base_dir, "Authentic-48K.csv")
    fake_path = os.path.join(base_dir, "Fake-1K.csv")
    
    true_df = pd.read_csv(true_path)
    fake_df = pd.read_csv(fake_path)
    
    # Label 1 = Authentic/Real, 0 = Fake
    true_df["label"] = 1
    fake_df["label"] = 0

    # Combine and shuffle
    df = pd.concat([true_df, fake_df], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Combine 'headline' and 'content' columns from BanFakeNews
    df["full_text"] = df["headline"].fillna("") + " " + df["content"].fillna("")

    X = df["full_text"]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"2. Training Bangla TF-IDF + Logistic Regression pipeline on {len(X_train)} articles...")
    
    # token_pattern=r'\S+' preserves full Bangla words & vowel signs (kar/fala)
    # class_weight='balanced' compensates for 48K real vs ~1.3K fake imbalance
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(token_pattern=r"\S+", max_df=0.8, ngram_range=(1, 2))),
        ("clf", LogisticRegression(max_iter=1000, class_weight="balanced"))
    ])

    pipeline.fit(X_train, y_train)

    print("3. Evaluating Bangla model on test set...")
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nBangla Model Accuracy: {acc * 100:.2f}%\n")
    print(classification_report(y_test, y_pred, target_names=["Fake (0)", "Real (1)"]))

    # Save artifact
    model_filename = "fake_news_model_bn.joblib"
    joblib.dump(pipeline, model_filename)
    print(f"4. Saved trained Bangla pipeline to '{model_filename}'!")

if __name__ == "__main__":
    train_bangla_model()