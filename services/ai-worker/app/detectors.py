from __future__ import annotations

import base64
import time
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from random import Random
from typing import Any

from app.config import settings
from app.privacy_masker import mask_object_regions
from app.schemas import ProcessingDetectionModel


@dataclass
class DetectorContext:
    job_id: str
    video_name: str | None = None
    demo_id: str | None = None
    location_label: str | None = None


@dataclass
class DetectionRun:
    detections: list[ProcessingDetectionModel]
    model_name: str
    device: str
    frames_analyzed: int
    processing_ms: int
    objects_detected: int
    class_counts: dict[str, int]


class CivicDetector:
    def detect(self, context: DetectorContext) -> list[ProcessingDetectionModel]:
        raise NotImplementedError


class MockCivicDetector(CivicDetector):
    """Synthetic sample generator kept separate from the real worker path."""

    def detect(self, context: DetectorContext) -> list[ProcessingDetectionModel]:
        seeded = Random(context.job_id)
        labels = [
            ("illegal_parking", "medium", "Barasat Station Road"),
            ("waterlogging", "high", "Nabapally Crossing"),
            ("garbage_overflow", "medium", "Champadali Market Edge"),
        ]
        count = seeded.randint(2, 4)
        detections: list[ProcessingDetectionModel] = []
        for index in range(count):
            label, severity, location = labels[index % len(labels)]
            detections.append(
                ProcessingDetectionModel(
                    id=f"{context.job_id}-det-{index + 1}",
                    jobId=context.job_id,
                    type=label,  # type: ignore[arg-type]
                    confidence=round(0.72 + seeded.random() * 0.18, 2),
                    severity=severity,  # type: ignore[arg-type]
                    locationLabel=location,
                    frameTimestampSec=float(index * 3),
                    boundingBox={"x": 0.2, "y": 0.25, "width": 0.3, "height": 0.2},
                    privacyMasked=True,
                    humanReviewStatus="pending",
                    modelLabel="synthetic_sample",
                )
            )
        return detections


COCO_VEHICLES = {"bicycle", "car", "motorcycle", "bus", "truck"}
PRIVACY_SENSITIVE_OBJECTS = COCO_VEHICLES | {"person"}
CIVIC_LABEL_MAP = {
    "pothole": "pothole",
    "waterlogging": "waterlogging",
    "water": "waterlogging",
    "garbage": "garbage_overflow",
    "garbage_overflow": "garbage_overflow",
    "illegal_parking": "illegal_parking",
    "road_blockage": "road_blockage",
    "roadblock": "road_blockage",
    "wrong_way": "wrong_way_driving",
    "wrong_way_driving": "wrong_way_driving",
}


def resolve_model_path() -> str:
    configured = settings.yolo_model_path.strip()
    path = Path(configured)
    if path.is_file():
        return str(path)
    if settings.allow_model_download and not path.parent.as_posix().strip("."):
        return configured
    if settings.allow_model_download and path.parent == Path("."):
        return configured
    raise RuntimeError(
        f"YOLO model weights were not found at '{configured}'. "
        "Run scripts/bootstrap_model.py or set ALLOW_MODEL_DOWNLOAD=true once."
    )


def resolve_device() -> str:
    if settings.yolo_device.lower() != "auto":
        return settings.yolo_device
    try:
        import torch

        return "0" if torch.cuda.is_available() else "cpu"
    except Exception:
        return "cpu"


def _xyxy_to_box(xyxy: list[float], width: int, height: int) -> dict[str, float]:
    x1, y1, x2, y2 = xyxy
    return {
        "x": max(0.0, min(1.0, x1 / width)),
        "y": max(0.0, min(1.0, y1 / height)),
        "width": max(0.0, min(1.0, (x2 - x1) / width)),
        "height": max(0.0, min(1.0, (y2 - y1) / height)),
    }


def _pixel_box(xyxy: list[float]) -> dict[str, int]:
    x1, y1, x2, y2 = xyxy
    return {
        "x": int(x1),
        "y": int(y1),
        "width": max(0, int(x2 - x1)),
        "height": max(0, int(y2 - y1)),
    }


def _encode_evidence(frame: Any, privacy_boxes: list[dict[str, int]]) -> str:
    import cv2

    safe_frame = (
        mask_object_regions(frame, privacy_boxes, strict=True)
        if settings.privacy_masking_enabled
        else frame
    )
    ok, encoded = cv2.imencode(
        ".jpg",
        safe_frame,
        [int(cv2.IMWRITE_JPEG_QUALITY), settings.evidence_jpeg_quality],
    )
    if not ok:
        raise RuntimeError("Could not encode the privacy-masked evidence frame.")
    return "data:image/jpeg;base64," + base64.b64encode(encoded.tobytes()).decode("ascii")


class YoloCivicDetector:
    """Real YOLO inference for authorized local clips.

    Standard COCO weights produce real person/vehicle detections and a conservative
    congestion advisory. A custom civic checkpoint can additionally expose classes
    listed in CIVIC_LABEL_MAP. Every alert remains pending human review.
    """

    def __init__(self) -> None:
        from ultralytics import YOLO

        self.model_path = resolve_model_path()
        self.device = resolve_device()
        self.model = YOLO(self.model_path)
        self.model_name = Path(self.model_path).name

    def process_video(self, video_path: str, context: DetectorContext) -> DetectionRun:
        import cv2

        started = time.perf_counter()
        capture = cv2.VideoCapture(video_path)
        if not capture.isOpened():
            capture.release()
            raise RuntimeError("OpenCV could not open the uploaded video.")

        source_fps = float(capture.get(cv2.CAP_PROP_FPS) or 0)
        if source_fps <= 0:
            capture.release()
            raise RuntimeError("Video FPS metadata is missing or invalid.")
        sample_every = max(1, round(source_fps / settings.frame_sample_rate_fps))
        frame_index = 0
        frames_analyzed = 0
        object_count = 0
        class_counts: Counter[str] = Counter()
        detections: list[ProcessingDetectionModel] = []
        last_congestion_second = -30.0
        location = context.location_label or "Authorized pilot location"

        try:
            while frames_analyzed < settings.max_sampled_frames:
                ok, frame = capture.read()
                if not ok:
                    break
                if frame_index % sample_every != 0:
                    frame_index += 1
                    continue

                timestamp = frame_index / source_fps
                height, width = frame.shape[:2]
                result = self.model.predict(
                    source=frame,
                    conf=settings.yolo_confidence,
                    imgsz=settings.yolo_image_size,
                    device=self.device,
                    half=self.device != "cpu",
                    verbose=False,
                )[0]
                frame_index += 1
                frames_analyzed += 1

                frame_objects: list[tuple[str, float, list[float]]] = []
                for box in result.boxes:
                    class_id = int(box.cls.item())
                    label = str(result.names[class_id]).strip().lower().replace(" ", "_")
                    confidence = float(box.conf.item())
                    coords = [float(value) for value in box.xyxy[0].tolist()]
                    frame_objects.append((label, confidence, coords))
                    class_counts[label] += 1
                    object_count += 1

                privacy_boxes = [
                    _pixel_box(coords)
                    for label, _, coords in frame_objects
                    if label in PRIVACY_SENSITIVE_OBJECTS
                ]
                custom_events = [
                    (CIVIC_LABEL_MAP[label], confidence, coords, label)
                    for label, confidence, coords in frame_objects
                    if label in CIVIC_LABEL_MAP
                ]
                for event_type, confidence, coords, model_label in custom_events:
                    evidence = _encode_evidence(frame, privacy_boxes)
                    detections.append(
                        ProcessingDetectionModel(
                            id=f"{context.job_id}-det-{len(detections) + 1}",
                            jobId=context.job_id,
                            type=event_type,  # type: ignore[arg-type]
                            confidence=round(confidence, 4),
                            severity="high" if confidence >= 0.75 else "medium",
                            locationLabel=location,
                            frameTimestampSec=round(timestamp, 2),
                            boundingBox=_xyxy_to_box(coords, width, height),
                            privacyMasked=settings.privacy_masking_enabled,
                            humanReviewStatus="pending",
                            modelLabel=model_label,
                            evidenceImageDataUrl=evidence,
                        )
                    )

                vehicle_count = sum(
                    1 for label, _, _ in frame_objects if label in COCO_VEHICLES
                )
                person_count = sum(1 for label, _, _ in frame_objects if label == "person")
                is_congested = (
                    vehicle_count >= settings.congestion_vehicle_threshold
                    or person_count >= settings.congestion_person_threshold
                )
                if is_congested and timestamp - last_congestion_second >= 10:
                    evidence = _encode_evidence(frame, privacy_boxes)
                    signal = max(
                        vehicle_count / max(1, settings.congestion_vehicle_threshold),
                        person_count / max(1, settings.congestion_person_threshold),
                    )
                    detections.append(
                        ProcessingDetectionModel(
                            id=f"{context.job_id}-det-{len(detections) + 1}",
                            jobId=context.job_id,
                            type="congestion",
                            confidence=round(min(0.98, 0.55 + signal * 0.12), 4),
                            severity="high" if signal >= 1.8 else "medium",
                            locationLabel=location,
                            frameTimestampSec=round(timestamp, 2),
                            privacyMasked=settings.privacy_masking_enabled,
                            humanReviewStatus="pending",
                            modelLabel="vehicle_person_density_advisory",
                            evidenceImageDataUrl=evidence,
                        )
                    )
                    last_congestion_second = timestamp
        finally:
            capture.release()

        processing_ms = int((time.perf_counter() - started) * 1000)
        return DetectionRun(
            detections=detections,
            model_name=self.model_name,
            device=self.device,
            frames_analyzed=frames_analyzed,
            processing_ms=processing_ms,
            objects_detected=object_count,
            class_counts=dict(class_counts),
        )
