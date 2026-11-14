import unittest
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.security import is_safe_url

class TestSecurity(unittest.TestCase):
    def test_safe_urls(self):
        self.assertTrue(is_safe_url("https://www.bbc.com/news"))
        self.assertTrue(is_safe_url("http://example.com/article"))

    def test_blocked_unsafe_urls(self):
        self.assertFalse(is_safe_url("http://localhost:8000"))
        self.assertFalse(is_safe_url("http://127.0.0.1:8000"))
        self.assertFalse(is_safe_url("http://0.0.0.0:80"))
        self.assertFalse(is_safe_url("ftp://example.com/file"))
        self.assertFalse(is_safe_url("file:///etc/passwd"))
        self.assertFalse(is_safe_url(""))
        self.assertFalse(is_safe_url(None))

if __name__ == "__main__":
    unittest.main()
