import os
from pathlib import Path
from typing import Tuple, Optional, List
import numpy as np
from app.core.config import settings

try:
    import joblib
    JOBLIB_AVAILABLE = True
except ImportError:
    joblib = None
    JOBLIB_AVAILABLE = False


def detect_language(text: str) -> str:
    """Automatically detects Bangla ('bn') vs English ('en') from Unicode script distribution."""
    if not text:
        return "en"
    bn_count = sum(1 for ch in text if "\u0980" <= ch <= "\u09ff")
    if bn_count == 0:
        return "en"
    en_count = sum(1 for ch in text if ("a" <= ch <= "z") or ("A" <= ch <= "Z"))
    if en_count == 0:
        return "bn"
    return "bn" if (bn_count / (bn_count + en_count)) >= 0.30 else "en"


def extract_stylometric_patterns(text: str, lang_code: str) -> List[str]:
    """Extracts surface-level clickbait, sensationalist, and stylometric patterns."""
    reasons = []

    if text.count("!") >= 2 or "??" in text:
        reasons.append("Excessive exclamation/question marks (sensationalist punctuation cue).")

    if lang_code == "en":
        caps_words = [w for w in text.split() if len(w) >= 4 and w.isupper()]
        if len(caps_words) >= 2:
            reasons.append(f"Heavy ALL-CAPS emphasis detected ({', '.join(caps_words[:3])}).")
        en_triggers = [
            "breaking", "secretly", "exposed", "shocking",
            "they don't want you to know", "miracle", "conspiracy", "unbelievable"
        ]
        found = [t for t in en_triggers if t in text.lower()]
        if found:
            reasons.append(f"Clickbait/sensational phrasing detected: {', '.join(found)}.")
    else:
        bn_triggers = [
            "ভাইরাল", "ফাঁস", "গোপন", "অবাক হবেন", "তোলপাড়",
            "গুজব", "ষড়যন্ত্র", "মাত্র ৩ দিনে", "চমকে যাবেন", "বিস্ময়কর"
        ]
        found = [t for t in bn_triggers if t in text]
        if found:
            reasons.append(f"Bangla clickbait/rumor keywords detected: {', '.join(found)}.")

    return reasons


class ClassifierService:
    """
    ML Classifier Service managing bilingual classification models.
    Supports English (ISOT-trained) and Bangla (BanFakeNews-trained) pipelines.
    Provides inference, probabilistic confidence, and linguistic/model pattern explainability.
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
        """Loads serialized model pipelines safely without crashing on missing artifacts."""
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

    def explain_patterns(self, text: str, language: str = "auto") -> List[str]:
        """
        Extracts explainability signals:
        1. Stylometric / clickbait triggers.
        2. Top influential lexical tokens from trained TF-IDF / FeatureUnion steps.
        """
        lang = (language or "auto").lower().strip()
        if lang in ("auto", "detect", ""):
            lang = detect_language(text)
        model = self.bn_model if lang == "bn" else self.en_model
        reasons = extract_stylometric_patterns(text, lang)

        if model is None:
            return reasons or ["Model weights not loaded; analyzed via baseline lexical patterns."]

        # 2. Extract top influential features from trained pipeline
        try:
            # Handle both Pipeline([('tfidf', ...), ('clf', ...)]) and Pipeline([('features', FeatureUnion), ('clf', ...)])
            vec = (
                model.named_steps.get("tfidf") or
                model.named_steps.get("features") or
                model.named_steps.get("tfidfvectorizer") or
                model.steps[0][1]
            )
            clf = (
                model.named_steps.get("clf") or
                model.named_steps.get("logisticregression") or
                model.steps[-1][1]
            )

            tfidf_row = vec.transform([text])
            feature_names = np.array(vec.get_feature_names_out())
            coefs = clf.coef_[0]

            nonzero_idx = tfidf_row.nonzero()[1]
            if len(nonzero_idx) > 0:
                contributions = tfidf_row.data * coefs[nonzero_idx]
                sorted_order = np.argsort(contributions)

                def clean_token(name: str) -> str:
                    # Strip FeatureUnion step prefixes like 'word_tfidf__' or 'char_tfidf__'
                    if "__" in name:
                        return name.split("__", 1)[1]
                    return name

                top_fake = [clean_token(t) for t in feature_names[nonzero_idx[sorted_order[:3]]]]
                top_real = [clean_token(t) for t in feature_names[nonzero_idx[sorted_order[-3:]]][::-1]]

                reasons.append(
                    f"Key model indicators — Fake signals: [{', '.join(top_fake)}] | "
                    f"Authentic signals: [{', '.join(top_real)}]"
                )
        except Exception:
            pass

        return reasons or ["Standard lexical and structural distribution analyzed by TF-IDF classifier."]

    def predict(self, text: str, language: str = "auto") -> Tuple[str, float, Optional[str]]:
        """
        Classifies input claim/article text.
        Returns:
            verdict: 'Real', 'Fake', or 'Unverified'
            confidence: float (0.0 to 100.0)
            note: diagnostic message if model was uninitialized
        """
        lang = (language or "auto").lower().strip()
        if lang in ("auto", "detect", ""):
            lang = detect_language(text)
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
            verdict = "Real" if str(pred) in ["1", "Real", "REAL", "True"] else "Fake"
            return verdict, round(prob * 100, 2), None
        except Exception as e:
            raise RuntimeError(f"Model inference failed: {str(e)}")
