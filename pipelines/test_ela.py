import io
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageChops, ImageEnhance


def run_ela(image_path: str, quality: int = 90, output_path: str = "ela_preview.jpg") -> dict:
    src_path = Path(image_path)
    if not src_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    # Open original image in RGB
    original = Image.open(src_path).convert("RGB")

    # Re-compress at target JPEG quality in memory
    buffer = io.BytesIO()
    original.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)
    recompressed = Image.open(buffer).convert("RGB")

    # Pixel-wise difference between original and recompressed image
    diff = ImageChops.difference(original, recompressed)

    # Scale brightness so subtle differences become visible
    extrema = diff.getextrema()
    max_diff = max(channel_max for _, channel_max in extrema)
    scale = 255.0 / max_diff if max_diff > 0 else 1.0
    ela_image = ImageEnhance.Brightness(diff).enhance(scale)
    ela_image.save(output_path)

    # Compute numeric forensic summary stats on the raw diff
    diff_arr = np.asarray(diff, dtype=np.float32)
    high_error_ratio = float(np.mean(np.max(diff_arr, axis=2) > 15.0))

    return {
        "file": str(src_path),
        "size": f"{original.width}x{original.height}",
        "ela_mean": round(float(np.mean(diff_arr)), 4),
        "ela_std": round(float(np.std(diff_arr)), 4),
        "ela_max": int(max_diff),
        "high_error_ratio": round(high_error_ratio, 4),
        "saved_preview": output_path,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ela.py <path_to_image> [quality]")
        sys.exit(1)

    img_arg = sys.argv[1]
    q_arg = int(sys.argv[2]) if len(sys.argv) > 2 else 90
    stats = run_ela(img_arg, quality=q_arg)
    for k, v in stats.items():
        print(f"{k}: {v}")