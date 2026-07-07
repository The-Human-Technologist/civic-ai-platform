from __future__ import annotations

from typing import Iterable


def mask_privacy_regions(frame, face_boxes: Iterable[dict] = (), plate_boxes: Iterable[dict] = ()):
    """Blur/mosaic privacy regions if OpenCV is available.

    This function is for privacy masking only. It must not be used for identity recognition.
    """
    try:
        import cv2  # type: ignore
    except Exception:
        return frame

    output = frame.copy()
    for box in list(face_boxes) + list(plate_boxes):
        x = int(box.get("x", 0))
        y = int(box.get("y", 0))
        width = int(box.get("width", 0))
        height = int(box.get("height", 0))
        if width <= 0 or height <= 0:
            continue

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
