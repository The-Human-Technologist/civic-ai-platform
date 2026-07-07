from pathlib import Path


def extract_frames_with_ffmpeg(video_path: str, output_dir: str, sample_rate_fps: int = 1) -> list[str]:
    """Scaffold only.

    Future real pilot support should use authorized uploaded clips only.
    This function intentionally does not invoke FFmpeg automatically yet.
    """
    try:
        import ffmpeg  # type: ignore  # noqa: F401
    except Exception as exc:  # pragma: no cover - optional dependency
        raise RuntimeError(
            "FFmpeg Python bindings are not installed. Frame extraction is scaffolded only in Phase 2A."
        ) from exc

    video_file = Path(video_path)
    if not video_file.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    Path(output_dir).mkdir(parents=True, exist_ok=True)
    raise NotImplementedError(
        "FFmpeg frame extraction is scaffolded only. Do not route real uploaded clips here until the worker pipeline is hardened."
    )


def extract_frames_with_opencv(video_path: str, sample_rate_fps: int = 1) -> list[object]:
    """Return frame objects in future worker mode.

    OpenCV is optional and not installed by default in this repo scaffold.
    """
    try:
        import cv2  # type: ignore  # noqa: F401
    except Exception as exc:  # pragma: no cover - optional dependency
        raise RuntimeError(
            "OpenCV is not installed. Frame extraction is scaffolded only in Phase 2A."
        ) from exc

    raise NotImplementedError(
        "OpenCV frame extraction is scaffolded only. Use authorized uploaded clips only when this path is fully implemented."
    )
