import csv
from pathlib import Path
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

FEATURE_COLS = ["ela_mean", "ela_std", "ela_max", "high_error_ratio"]


def train_model(csv_path: str = "ela_dataset.csv", model_out: str = "image_forensics_model.joblib") -> None:
    df = pd.read_csv(csv_path)
    df = df[df["label"].isin([0, 1, "0", "1"])].copy()
    df["label"] = df["label"].astype(int)

    for col in FEATURE_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=FEATURE_COLS + ["label"])

    if len(df) < 10 or df["label"].nunique() < 2:
        print(f"Need at least 10 labeled rows across both classes (0 and 1). Found {len(df)} usable rows.")
        return

    X = df[FEATURE_COLS]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y if len(df) >= 12 else None
    )

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=1000)),
    ])

    pipeline.fit(X_train, y_train)

    if len(X_test) >= 2:
        preds = pipeline.predict(X_test)
        print("Evaluation on holdout split:")
        print(classification_report(y_test, preds, target_names=["authentic", "edited"], zero_division=0))

    joblib.dump(pipeline, model_out)
    print(f"Saved trained image model to '{Path(model_out).resolve()}'.")


if __name__ == "__main__":
    train_model()