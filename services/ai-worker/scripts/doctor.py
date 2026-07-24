from __future__ import annotations

import platform
from pathlib import Path


def main() -> None:
    import cv2
    import torch
    import ultralytics

    root = Path(__file__).resolve().parents[1]
    weights = root / "models" / "yolo26n.pt"
    print(f"Python: {platform.python_version()}")
    print(f"Ultralytics: {ultralytics.__version__}")
    print(f"OpenCV: {cv2.__version__}")
    print(f"PyTorch: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    print(f"CUDA version: {torch.version.cuda or 'none'}")
    print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU only'}")
    print(f"YOLO26n weights: {'ready' if weights.is_file() else 'missing'} ({weights})")


if __name__ == "__main__":
    main()
