import os
from pathlib import Path
from typing import Tuple, Optional
from app.core.config import settings

try:
    import joblib
    JOBLIB_AVAILABLE = True
except ImportError:
    joblib = None
    JOBLIB_AVAILABLE = False

class ClassifierService:
    """
    ML Classifier Service managing bilingual classification models.
    Supports English (ISOT-trained) and Bangla (BanFakeNews-trained) pipelines.
    """

    def __init__(self):
        self.en_model = None
        self.bn_model = None
        if JOBLIB_AVAILABLE:
            self._load_models()

    def _resolve_model_path(self, primary_path: Path, legacy_path: Path) -> Optional[Path]:
        """Resolves model path from models/ directory or project root fallback."""
        if primary_path.exists():
            return primary_path
        if legacy_path.exists():
            return legacy_path
        return None

    def _load_models(self):
        """Loads serialized model pipelines safely."""
        if not JOBLIB_AVAILABLE:
            return

        en_path = self._resolve_model_path(settings.EN_MODEL_PATH, settings.LEGACY_EN_MODEL_PATH)
        bn_path = self._resolve_model_path(settings.BN_MODEL_PATH, settings.LEGACY_BN_MODEL_PATH)

        if en_path:
            try:
                self.en_model = joblib.load(en_path)
                print(f"✅ Loaded English classification model from '{en_path}'")
            except Exception as e:
                print(f"⚠️ Error loading English model from '{en_path}': {e}")
        else:
            print(f"⚠️ English model artifact not found. (Expected at '{settings.EN_MODEL_PATH}')")

        if bn_path:
            try:
                self.bn_model = joblib.load(bn_path)
                print(f"✅ Loaded Bangla classification model from '{bn_path}'")
            except Exception as e:
                print(f"⚠️ Error loading Bangla model from '{bn_path}': {e}")
        else:
            print(f"⚠️ Bangla model artifact not found. (Expected at '{settings.BN_MODEL_PATH}')")

    @property
    def is_english_ready(self) -> bool:
        return self.en_model is not None

    @property
    def is_bangla_ready(self) -> bool:
        return self.bn_model is not None

    def predict(self, text: str, language: str = "en") -> Tuple[str, float, Optional[str]]:
        """
        Classifies input claim/article text.
        Returns:
            verdict: 'Real', 'Fake', or 'Unverified'
            confidence: float (0.0 to 100.0)
            note: diagnostic message if model was uninitialized
        """
        lang = (language or "en").lower().strip()
        model = self.bn_model if lang == "bn" else self.en_model
        lang_name = "Bangla" if lang == "bn" else "English"

        if not JOBLIB_AVAILABLE:
            return (
                "Unverified",
                50.0,
                "Joblib package is not installed. Install requirements.txt."
            )

        if model is None:
            return (
                "Unverified",
                50.0,
                f"{lang_name} ML model is not loaded. Run 'python pipelines/train_{lang}.py' to train it."
            )

        try:
            pred = model.predict([text])[0]
            probabilities = model.predict_proba([text])[0]
            prob = float(probabilities.max())
            verdict = "Real" if pred == 1 else "Fake"
            return verdict, round(prob * 100, 2), None
        except Exception as e:
            raise RuntimeError(f"Model inference failed: {str(e)}")
