from io import BytesIO
from pathlib import Path
from typing import Optional

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    np = None
    NUMPY_AVAILABLE = False

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    pd = None
    PANDAS_AVAILABLE = False

try:
    import joblib
    JOBLIB_AVAILABLE = True
except ImportError:
    joblib = None
    JOBLIB_AVAILABLE = False

try:
    from PIL import Image, ImageChops
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

FEATURE_COLS = ["ela_mean", "ela_std", "ela_max", "high_error_ratio"]
HIGH_ERROR_THRESHOLD = 25.0


class ImageDetectorService:
    def __init__(self, quality: int = 90, model_path: Optional[str] = None):
        self.quality = quality
        project_root = Path(__file__).resolve().parents[2]
        candidate_paths = [
            project_root / "models" / "image_forensics_model.joblib",
            project_root / "image_forensics_model.joblib"
        ]

        if model_path:
            self.model_path = Path(model_path)
        else:
            resolved = None
            for p in candidate_paths:
                if p.exists():
                    resolved = p
                    break
            self.model_path = resolved or candidate_paths[1]

        self.model = self._load_model()

    def _load_model(self):
        if not JOBLIB_AVAILABLE:
            return None
        if self.model_path.exists():
            try:
                model = joblib.load(self.model_path)
                print(f"✅ Loaded Image Forensics model from '{self.model_path}'")
                return model
            except Exception as exc:
                print(
                    f"[ImageDetectorService] Warning: failed to load model "
                    f"'{self.model_path}' ({exc}). Falling back to heuristic baseline."
                )
        return None

    def compute_ela_features(self, image_bytes: bytes, quality: Optional[int] = None) -> dict:
        if not PIL_AVAILABLE:
            raise RuntimeError("Pillow is not installed. Install requirements.txt (pip install pillow).")
        if not NUMPY_AVAILABLE:
            raise RuntimeError("NumPy is not installed. Install requirements.txt.")

        target_quality = quality if quality is not None else self.quality

        try:
            with Image.open(BytesIO(image_bytes)) as img:
                original_format = img.format or "UNKNOWN"
                rgb_img = img.convert("RGB")
                width, height = rgb_img.size

                # Re-compress in memory without writing temporary files to disk
                buffer = BytesIO()
                rgb_img.save(buffer, format="JPEG", quality=target_quality)
                buffer.seek(0)

                with Image.open(buffer) as recompressed_img:
                    diff_img = ImageChops.difference(rgb_img, recompressed_img.convert("RGB"))
                    diff_arr = np.asarray(diff_img, dtype=np.float32)
        except Exception as exc:
            raise ValueError(f"Invalid or unreadable image bytes: {exc}") from exc

        # Per-pixel error intensity averaged across RGB channels
        pixel_error = diff_arr.mean(axis=2)

        ela_mean = float(np.mean(pixel_error))
        ela_std = float(np.std(pixel_error))
        ela_max = float(np.max(pixel_error))
        high_error_ratio = float(np.mean(pixel_error >= HIGH_ERROR_THRESHOLD))

        return {
            "format": original_format,
            "width": int(width),
            "height": int(height),
            "quality": int(target_quality),
            "ela_mean": round(ela_mean, 4),
            "ela_std": round(ela_std, 4),
            "ela_max": round(ela_max, 2),
            "high_error_ratio": round(high_error_ratio, 5),
        }

    def _predict_with_heuristic(self, features: dict) -> dict:
        ela_mean = features["ela_mean"]
        ela_std = features["ela_std"]
        high_error_ratio = features["high_error_ratio"]

        score = 0
        if ela_mean >= 2.0:
            score += 1
        if ela_std >= 5.0:
            score += 1
        if high_error_ratio >= 0.02:
            score += 1

        is_edited = score >= 2
        confidence = round(min(92.0, max(55.0, 55.0 + score * 12.0)), 2)

        return {
            "verdict": "POTENTIALLY EDITED (BASELINE)" if is_edited else "LIKELY AUTHENTIC (BASELINE)",
            "mode": "heuristic_baseline",
            "confidence": confidence,
            "features": features,
            "note": "Baseline ELA forensic analysis; prior JPEG re-compression or format differences can influence error values.",
        }

    def _predict_with_ml(self, features: dict) -> dict:
        if not PANDAS_AVAILABLE or not NUMPY_AVAILABLE:
            return self._predict_with_heuristic(features)

        row = pd.DataFrame([{col: float(features[col]) for col in FEATURE_COLS}])
        pred = int(self.model.predict(row)[0])

        confidence = 75.0
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(row)[0]
            confidence = round(float(np.max(probs)) * 100, 2)

        is_edited = pred == 1
        return {
            "verdict": "POTENTIALLY EDITED" if is_edited else "LIKELY AUTHENTIC",
            "mode": "ml_logistic_regression",
            "confidence": confidence,
            "features": features,
            "note": "Classified using trained ELA LogisticRegression pipeline.",
        }

    def predict(self, image_bytes: bytes, quality: Optional[int] = None) -> dict:
        features = self.compute_ela_features(image_bytes=image_bytes, quality=quality)

        if self.model is not None:
            try:
                return self._predict_with_ml(features)
            except Exception as exc:
                print(
                    f"[ImageDetectorService] Warning: ML prediction failed ({exc}). "
                    "Using heuristic baseline."
                )

        return self._predict_with_heuristic(features)
