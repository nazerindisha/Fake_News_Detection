import csv
from pathlib import Path
from app.services.image_detector import ImageDetectorService


def collect_dataset(samples_dir: str = "samples", output_csv: str = "ela_dataset.csv") -> None:
    detector = ImageDetectorService(quality=90)
    root = Path(samples_dir)

    if not root.exists():
        print(f"Folder '{samples_dir}' not found. Create it and add authentic/edited images.")
        return

    image_extensions = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
    rows = []

    for img_path in sorted(root.rglob("*")):
        if not img_path.is_file() or img_path.suffix.lower() not in image_extensions:
            continue

        # Infer label from parent folder name ("authentic"/"real" -> 0, "edited"/"fake" -> 1)
        # or filename convention ("_edited" / "_fake" -> 1)
        parent_name = img_path.parent.name.lower()
        stem_lower = img_path.stem.lower()

        if parent_name in {"edited", "fake", "manipulated", "tampered"} or any(
            tag in stem_lower for tag in ("_edited", "_fake", "_manipulated", "_tampered")
        ):
            label = 1
            label_name = "edited"
        elif parent_name in {"authentic", "real", "original"}:
            label = 0
            label_name = "authentic"
        else:
            label = ""
            label_name = "unlabeled"

        try:
            image_bytes = img_path.read_bytes()
            result = detector.predict(image_bytes=image_bytes, quality=90)
            features = result.get("features", {})

            rows.append({
                "file_path": str(img_path),
                "filename": img_path.name,
                "format": features.get("format", ""),
                "width": features.get("width", ""),
                "height": features.get("height", ""),
                "quality": features.get("quality", 90),
                "ela_mean": features.get("ela_mean", ""),
                "ela_std": features.get("ela_std", ""),
                "ela_max": features.get("ela_max", ""),
                "high_error_ratio": features.get("high_error_ratio", ""),
                "baseline_verdict": result.get("verdict", ""),
                "label": label,
                "label_name": label_name,
            })
            print(f"[OK] {img_path.name} -> mean={features.get('ela_mean')}, std={features.get('ela_std')}, max={features.get('ela_max')}, ratio={features.get('high_error_ratio')}")
        except Exception as exc:
            print(f"[SKIP] {img_path.name}: {exc}")

    output_path = Path(output_csv)
    fieldnames = [
        "file_path",
        "filename",
        "format",
        "width",
        "height",
        "quality",
        "ela_mean",
        "ela_std",
        "ela_max",
        "high_error_ratio",
        "baseline_verdict",
        "label",
        "label_name",
    ]

    with output_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nSaved {len(rows)} rows to '{output_path.resolve()}'.")


if __name__ == "__main__":
    collect_dataset()