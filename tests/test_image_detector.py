import unittest
import sys
from io import BytesIO
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

try:
    from PIL import Image
    from app.services.image_detector import ImageDetectorService
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


class TestImageDetector(unittest.TestCase):
    def setUp(self):
        if not PIL_AVAILABLE:
            self.skipTest("PIL / Pillow not installed in environment")

        # Create a small synthetic test JPEG in memory
        img = Image.new("RGB", (64, 64), color=(128, 64, 200))
        buf = BytesIO()
        img.save(buf, format="JPEG", quality=90)
        self.sample_jpeg_bytes = buf.getvalue()

    def test_ela_feature_extraction(self):
        service = ImageDetectorService(quality=90)
        features = service.compute_ela_features(self.sample_jpeg_bytes)

        self.assertIn("ela_mean", features)
        self.assertIn("ela_std", features)
        self.assertIn("ela_max", features)
        self.assertIn("high_error_ratio", features)
        self.assertEqual(features["width"], 64)
        self.assertEqual(features["height"], 64)
        self.assertEqual(features["format"], "JPEG")

    def test_predict_structure(self):
        service = ImageDetectorService(quality=90)
        res = service.predict(self.sample_jpeg_bytes)

        self.assertIn("verdict", res)
        self.assertIn("confidence", res)
        self.assertIn("features", res)
        self.assertIn("mode", res)
        self.assertGreaterEqual(res["confidence"], 0.0)
        self.assertLessEqual(res["confidence"], 100.0)

    def test_invalid_image_bytes(self):
        service = ImageDetectorService(quality=90)
        with self.assertRaises(ValueError):
            service.compute_ela_features(b"corrupted-non-image-bytes")


if __name__ == "__main__":
    unittest.main()
