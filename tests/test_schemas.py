import unittest
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

try:
    from app.schemas.news import NewsRequest, LanguageEnum, RetrievalMatch, PredictResponse
    from app.services.classifier import detect_language
    PYDANTIC_AVAILABLE = True
except ImportError:
    PYDANTIC_AVAILABLE = False

class TestSchemas(unittest.TestCase):
    def test_news_request_schema(self):
        if not PYDANTIC_AVAILABLE:
            self.skipTest("pydantic not installed in global environment")
        req_default = NewsRequest(text="Test auto language")
        self.assertEqual(req_default.language, LanguageEnum.AUTO)
        req = NewsRequest(text="Test news claim", language=LanguageEnum.EN)
        self.assertEqual(req.text, "Test news claim")
        self.assertEqual(req.language, LanguageEnum.EN)
        self.assertIsNone(req.url)

    def test_auto_language_detection(self):
        try:
            from app.services.classifier import detect_language as dl
        except ImportError:
            self.skipTest("classifier dependencies not available")
        self.assertEqual(dl("NASA discovers subterranean water ice reserves on the Moon."), "en")
        self.assertEqual(dl("বাংলাদেশ ব্যাংক নতুন মুদ্রানীতি ঘোষণা করেছে।"), "bn")
        self.assertEqual(dl("NASA এবং বাংলাদেশ ব্যাংক সম্পর্কিত খবর"), "bn")
        self.assertEqual(dl(""), "en")

    def test_retrieval_match_schema(self):
        if not PYDANTIC_AVAILABLE:
            self.skipTest("pydantic not installed in global environment")
        match = RetrievalMatch(
            source_type="local_historical",
            source_label="Verified DB",
            title="Sample Title",
            subject="General",
            date="2026",
            similarity_score=0.88,
            snippet="Snippet text...",
            url=None
        )
        self.assertEqual(match.similarity_score, 0.88)
        self.assertEqual(match.title, "Sample Title")

    def test_predict_response_with_explanations(self):
        if not PYDANTIC_AVAILABLE:
            self.skipTest("pydantic not installed in global environment")
        resp = PredictResponse(
            language="English",
            language_code="en",
            prediction="Real",
            confidence=95.0,
            explanations=["Sensational punctuation detected", "Key authentic signals"],
            actual_news_matches=[],
            evidence="Evidence statement",
            sources=[],
            input_preview="Preview text"
        )
        self.assertEqual(len(resp.explanations), 2)
        self.assertEqual(resp.prediction, "Real")

if __name__ == "__main__":
    unittest.main()
