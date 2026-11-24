"""
CLI entrypoint for running Error Level Analysis (ELA) on an image.
Forwards to pipelines.test_ela.run_ela.
"""
import sys
from pipelines.test_ela import run_ela

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ela.py <path_to_image> [quality]")
        sys.exit(1)

    img_arg = sys.argv[1]
    q_arg = int(sys.argv[2]) if len(sys.argv) > 2 else 90
    stats = run_ela(img_arg, quality=q_arg)
    for k, v in stats.items():
        print(f"{k}: {v}")
