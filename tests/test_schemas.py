import unittest
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

try:
    from app.schemas.news import NewsRequest, LanguageEnum, RetrievalMatch, PredictResponse
    PYDANTIC_AVAILABLE = True
except ImportError:
    PYDANTIC_AVAILABLE = False

class TestSchemas(unittest.TestCase):
    def test_news_request_schema(self):
        if not PYDANTIC_AVAILABLE:
            self.skipTest("pydantic not installed in global environment")
        req = NewsRequest(text="Test news claim", language=LanguageEnum.EN)
        self.assertEqual(req.text, "Test news claim")
        self.assertEqual(req.language, LanguageEnum.EN)
        self.assertIsNone(req.url)

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

if __name__ == "__main__":
    unittest.main()
