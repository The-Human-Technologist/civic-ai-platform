from __future__ import annotations

from typing import Iterable


class PrivacyMaskingError(RuntimeError):
    """Raised when required masking cannot be completed safely."""


def normalize_privacy_box(box: dict, frame_width: int, frame_height: int):
    """Clip a pixel-space privacy box to the frame, returning None if empty."""
    x = max(0, int(box.get("x", 0)))
    y = max(0, int(box.get("y", 0)))
    width = max(0, int(box.get("width", 0)))
    height = max(0, int(box.get("height", 0)))
    right = min(frame_width, x + width)
    bottom = min(frame_height, y + height)
    if right <= x or bottom <= y:
        return None
    return x, y, right - x, bottom - y


def mask_privacy_regions(
    frame,
    face_boxes: Iterable[dict] = (),
    plate_boxes: Iterable[dict] = (),
    *,
    strict: bool = True,
):
    """Mosaic supplied face/plate regions without performing identity recognition.

    In strict mode (the production default), missing OpenCV or an invalid frame fails
    closed instead of returning an unmasked image.
    """
    try:
        import cv2  # type: ignore
    except Exception as exc:
        if strict:
            raise PrivacyMaskingError("OpenCV is unavailable; required masking was not applied.") from exc
        return frame

    if frame is None or not hasattr(frame, "shape") or len(frame.shape) < 2:
        raise PrivacyMaskingError("A valid image frame is required for privacy masking.")

    output = frame.copy()
    frame_height, frame_width = output.shape[:2]
    for box in list(face_boxes) + list(plate_boxes):
        normalized = normalize_privacy_box(box, frame_width, frame_height)
        if normalized is None:
            continue
        x, y, width, height = normalized
        roi = output[y : y + height, x : x + width]
        if roi.size == 0:
            continue
        downscaled = cv2.resize(
            roi,
            (max(1, width // 12), max(1, height // 12)),
            interpolation=cv2.INTER_LINEAR,
        )
        output[y : y + height, x : x + width] = cv2.resize(
            downscaled,
            (width, height),
            interpolation=cv2.INTER_NEAREST,
        )

    return output
