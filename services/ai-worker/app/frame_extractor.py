from __future__ import annotations

import shutil
import subprocess
from pathlib import Path


def _validate_inputs(video_path: str, sample_rate_fps: float, max_frames: int) -> Path:
    video_file = Path(video_path).resolve()
    if not video_file.is_file():
        raise FileNotFoundError(f"Video file not found: {video_path}")
    if sample_rate_fps <= 0 or sample_rate_fps > 30:
        raise ValueError("sample_rate_fps must be greater than 0 and at most 30")
    if max_frames < 1 or max_frames > 10_000:
        raise ValueError("max_frames must be between 1 and 10,000")
    return video_file


def extract_frames_with_ffmpeg(
    video_path: str,
    output_dir: str,
    sample_rate_fps: float = 1,
    max_frames: int = 900,
) -> list[str]:
    """Extract sampled JPEG frames from an authorized local clip.

    This helper never downloads media and never opens a network stream. The caller is
    responsible for authorization, retention, and deletion of the local clip/frames.
    """
    video_file = _validate_inputs(video_path, sample_rate_fps, max_frames)
    ffmpeg_binary = shutil.which("ffmpeg")
    if not ffmpeg_binary:
        raise RuntimeError("FFmpeg is not installed or is not available on PATH.")

    destination = Path(output_dir).resolve()
    destination.mkdir(parents=True, exist_ok=True)
    output_pattern = destination / "frame-%06d.jpg"

    command = [
        ffmpeg_binary,
        "-hide_banner",
        "-loglevel",
        "error",
        "-nostdin",
        "-i",
        str(video_file),
        "-vf",
        f"fps={sample_rate_fps}",
        "-frames:v",
        str(max_frames),
        "-q:v",
        "3",
        "-y",
        str(output_pattern),
    ]
    completed = subprocess.run(command, capture_output=True, text=True, check=False)
    if completed.returncode != 0:
        error = completed.stderr.strip() or "unknown FFmpeg error"
        raise RuntimeError(f"FFmpeg frame extraction failed: {error[:1000]}")

    return [str(path) for path in sorted(destination.glob("frame-*.jpg"))]


def extract_frames_with_opencv(
    video_path: str,
    sample_rate_fps: float = 1,
    max_frames: int = 900,
) -> list[object]:
    """Extract in-memory sampled frames from an authorized local clip."""
    video_file = _validate_inputs(video_path, sample_rate_fps, max_frames)
    try:
        import cv2  # type: ignore
    except Exception as exc:  # pragma: no cover - optional runtime dependency
        raise RuntimeError("OpenCV is required for OpenCV frame extraction.") from exc

    capture = cv2.VideoCapture(str(video_file))
    if not capture.isOpened():
        capture.release()
        raise RuntimeError(f"OpenCV could not open video: {video_file.name}")

    source_fps = float(capture.get(cv2.CAP_PROP_FPS) or 0)
    if source_fps <= 0:
        capture.release()
        raise RuntimeError("Video FPS metadata is missing or invalid.")

    sample_every = max(1, round(source_fps / sample_rate_fps))
    frames: list[object] = []
    frame_index = 0
    try:
        while len(frames) < max_frames:
            ok, frame = capture.read()
            if not ok:
                break
            if frame_index % sample_every == 0:
                frames.append(frame)
            frame_index += 1
    finally:
        capture.release()

    return frames
