from __future__ import annotations

import shutil
import urllib.request
from pathlib import Path


SPECIALIST_MODELS = {
    "civic-road-issues.pt": (
        "https://huggingface.co/Vansh180/PotholeNet-V1/resolve/main/"
        "Vision%20Classification.pt?download=true"
    ),
    "helmet-candidate.pt": (
        "https://huggingface.co/NightPrince/Yolo-Helmet/resolve/main/best.pt?download=true"
    ),
}


def _download(url: str, target: Path) -> None:
    partial = target.with_suffix(target.suffix + ".part")
    print(f"Downloading {target.name}...")
    try:
        urllib.request.urlretrieve(url, partial)
        partial.replace(target)
    finally:
        partial.unlink(missing_ok=True)


def main() -> None:
    from ultralytics import YOLO, YOLOWorld

    worker_root = Path(__file__).resolve().parents[1]
    models_dir = worker_root / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    base_target = models_dir / "yolo26n.pt"
    if not base_target.is_file():
        downloaded = worker_root / "yolo26n.pt"
        YOLO(str(downloaded))
        if not downloaded.is_file():
            raise RuntimeError("Ultralytics did not create the expected YOLO26n weights file.")
        shutil.move(str(downloaded), str(base_target))
    print(f"Base traffic model ready: {base_target}")

    for filename, url in SPECIALIST_MODELS.items():
        target = models_dir / filename
        if not target.is_file():
            _download(url, target)
        model = YOLO(str(target))
        print(f"{filename} ready with classes: {model.names}")

    water_target = models_dir / "waterlogging-world.pt"
    if not water_target.is_file():
        downloaded = worker_root / "yolov8s-worldv2.pt"
        model = YOLOWorld(str(downloaded))
        model.set_classes(["flooded road", "standing water", "waterlogging", "puddle"])
        if not downloaded.is_file():
            raise RuntimeError("Ultralytics did not create the expected YOLO-World weights file.")
        shutil.move(str(downloaded), str(water_target))
    print(f"Waterlogging open-vocabulary model ready: {water_target}")


if __name__ == "__main__":
    main()
