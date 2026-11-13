import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report

def train_model():
    print("1. Loading True.csv and Fake.csv...")
    
    # Explicit absolute base directory to prevent path/permission mix-ups
    base_dir = r"D:\7th_Semester_Collections\Project\Fake_News_Detection"
    true_path = os.path.join(base_dir, "True.csv")
    fake_path = os.path.join(base_dir, "Fake.csv")
    
    true_df = pd.read_csv(true_path)
    fake_df = pd.read_csv(fake_path)
    
    # Label 1 = Real, 0 = Fake
    true_df["label"] = 1
    fake_df["label"] = 0

    # Combine and shuffle
    df = pd.concat([true_df, fake_df], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Combine title and text for full context
    df["content"] = df["title"].fillna("") + " " + df["text"].fillna("")

    X = df["content"]
    y = df["label"]

    # 80% training, 20% testing
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"2. Training TF-IDF + Logistic Regression pipeline on {len(X_train)} articles...")
    
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(stop_words="english", max_df=0.7)),
        ("clf", LogisticRegression(max_iter=1000))
    ])

    pipeline.fit(X_train, y_train)

    print("3. Evaluating model on test set...")
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nModel Accuracy: {acc * 100:.2f}%\n")
    print(classification_report(y_test, y_pred, target_names=["Fake (0)", "Real (1)"]))

    # Save the trained pipeline to disk
    model_filename = "fake_news_model.joblib"
    joblib.dump(pipeline, model_filename)
    print(f"4. Saved trained pipeline to '{model_filename}'!")

if __name__ == "__main__":
    train_model()