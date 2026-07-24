from __future__ import annotations

import shutil
from pathlib import Path


def main() -> None:
    from ultralytics import YOLO

    worker_root = Path(__file__).resolve().parents[1]
    target = worker_root / "models" / "yolo26n.pt"
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_file():
        print(f"YOLO26n is already available: {target}")
        return

    downloaded = worker_root / "yolo26n.pt"
    YOLO(str(downloaded))
    if not downloaded.is_file():
        raise RuntimeError("Ultralytics did not create the expected YOLO26n weights file.")
    shutil.move(str(downloaded), str(target))
    print(f"YOLO26n ready: {target}")


if __name__ == "__main__":
    main()
