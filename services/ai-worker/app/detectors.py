from __future__ import annotations

import base64
import gc
import time
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from random import Random
from typing import Any, Iterable

from app.config import settings
from app.privacy_masker import mask_object_regions
from app.schemas import (
    AnalysisModule,
    ExpectedDirection,
    ModelModuleStatus,
    ProcessingDetectionModel,
)


@dataclass
class DetectorContext:
    job_id: str
    video_name: str | None = None
    demo_id: str | None = None
    location_label: str | None = None
    analysis_modules: list[AnalysisModule] = field(
        default_factory=lambda: ["traffic", "civic", "helmet", "waterlogging"]
    )
    expected_direction: ExpectedDirection | None = None


@dataclass
class DetectionRun:
    detections: list[ProcessingDetectionModel]
    model_name: str
    device: str
    frames_analyzed: int
    processing_ms: int
    objects_detected: int
    class_counts: dict[str, int]
    models_used: list[str]
    requested_modules: list[AnalysisModule]
    module_status: dict[str, ModelModuleStatus]
    limitations: list[str]


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
    "road_damage": "road_blockage",
    "garbage": "garbage_overflow",
    "garbage_overflow": "garbage_overflow",
}
WATERLOGGING_LABELS = {"flooded_road", "standing_water", "waterlogging", "puddle"}
HELMET_VIOLATION_LABELS = {
    "non_helmet",
    "no_helmet",
    "nohelmet",
    "without_helmet",
    "helmet_violation",
}
ANALYSIS_MODULES: tuple[AnalysisModule, ...] = (
    "traffic",
    "civic",
    "helmet",
    "waterlogging",
    "wrong_way",
)


def normalize_model_label(label: str) -> str:
    return (
        label.strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
        .strip("_")
    )


def helmet_label_is_violation(label: str) -> bool:
    normalized = normalize_model_label(label)
    return normalized in HELMET_VIOLATION_LABELS or normalized.startswith("non_helmet")


def movement_opposes_direction(
    start: tuple[float, float],
    end: tuple[float, float],
    expected_direction: ExpectedDirection,
    min_displacement_ratio: float,
) -> bool:
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    if expected_direction == "left_to_right":
        return dx <= -min_displacement_ratio
    if expected_direction == "right_to_left":
        return dx >= min_displacement_ratio
    if expected_direction == "top_to_bottom":
        return dy <= -min_displacement_ratio
    return dy >= min_displacement_ratio


def _path_status(
    path_value: str,
    *,
    classes: list[str],
    experimental: bool = False,
    note: str | None = None,
) -> ModelModuleStatus:
    path = Path(path_value)
    return ModelModuleStatus(
        available=path.is_file(),
        modelName=path.name,
        classes=classes,
        experimental=experimental,
        note=note if path.is_file() else f"Missing local weights: {path_value}",
    )


def get_module_status() -> dict[str, ModelModuleStatus]:
    base = _path_status(
        settings.yolo_model_path,
        classes=["person", "bicycle", "car", "motorcycle", "bus", "truck", "congestion"],
    )
    return {
        "traffic": base,
        "wrong_way": ModelModuleStatus(
            available=base.available,
            modelName=f"{base.modelName}+ByteTrack" if base.modelName else None,
            classes=["wrong_way_driving"],
            note="Requires a camera-specific expected travel direction.",
        ),
        "civic": _path_status(
            settings.civic_model_path,
            classes=["pothole", "road_damage", "garbage_overflow"],
        ),
        "helmet": _path_status(
            settings.helmet_model_path,
            classes=["helmet", "helmet_violation"],
            experimental=True,
            note="Specialist checkpoint; validate against local motorcycle footage before operational use.",
        ),
        "waterlogging": _path_status(
            settings.waterlogging_model_path,
            classes=["flooded_road", "standing_water", "waterlogging", "puddle"],
            experimental=True,
            note="Open-vocabulary advisory; field verification is mandatory.",
        ),
    }


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


def _iter_sampled_frames(video_path: str) -> Iterable[tuple[int, float, Any]]:
    import cv2

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
    emitted = 0
    try:
        while emitted < settings.max_sampled_frames:
            ok, frame = capture.read()
            if not ok:
                break
            if frame_index % sample_every == 0:
                yield frame_index, frame_index / source_fps, frame
                emitted += 1
            frame_index += 1
    finally:
        capture.release()


def _release_model(model: Any) -> None:
    del model
    gc.collect()
    try:
        import torch

        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    except Exception:
        pass


class YoloCivicDetector:
    """Sequential multi-model analysis sized for a 4 GB RTX 3050.

    The base model performs person/vehicle, congestion, and ByteTrack direction analysis.
    Specialist checkpoints are loaded one at a time for civic defects, helmet compliance,
    and an experimental open-vocabulary waterlogging advisory.
    """

    def __init__(self) -> None:
        self.device = resolve_device()
        self.module_status = get_module_status()

    def _new_detection(
        self,
        *,
        context: DetectorContext,
        event_type: str,
        confidence: float,
        location: str,
        timestamp: float,
        frame: Any,
        privacy_boxes: list[dict[str, int]],
        coords: list[float] | None = None,
        model_label: str,
        track_id: int | None = None,
        severity: str | None = None,
    ) -> ProcessingDetectionModel:
        height, width = frame.shape[:2]
        return ProcessingDetectionModel(
            id=f"{context.job_id}-det-{time.time_ns()}",
            jobId=context.job_id,
            type=event_type,  # type: ignore[arg-type]
            confidence=round(max(0.0, min(1.0, confidence)), 4),
            severity=severity or ("high" if confidence >= 0.75 else "medium"),  # type: ignore[arg-type]
            locationLabel=location,
            frameTimestampSec=round(timestamp, 2),
            boundingBox=_xyxy_to_box(coords, width, height) if coords else None,
            privacyMasked=settings.privacy_masking_enabled,
            humanReviewStatus="pending",
            modelLabel=model_label,
            trackId=track_id,
            evidenceImageDataUrl=_encode_evidence(frame, privacy_boxes),
        )

    def process_video(self, video_path: str, context: DetectorContext) -> DetectionRun:
        from ultralytics import YOLO, YOLOWorld

        started = time.perf_counter()
        requested = list(dict.fromkeys(context.analysis_modules))
        location = context.location_label or "Authorized pilot location"
        detections: list[ProcessingDetectionModel] = []
        class_counts: Counter[str] = Counter()
        privacy_by_frame: dict[int, list[dict[str, int]]] = {}
        frames_analyzed = 0
        objects_detected = 0
        models_used: list[str] = []
        limitations = [
            "Every alert is advisory and starts pending human review.",
            "No facial recognition, citizen scoring, or automatic enforcement.",
        ]

        # The base pass is mandatory even when traffic alerts are disabled because its
        # person/vehicle boxes are the conservative privacy mask for every evidence frame.
        needs_base = True
        if needs_base:
            status = self.module_status["traffic"]
            if not status.available:
                limitations.append("Traffic and wrong-way modules skipped: base weights are missing.")
            else:
                model = YOLO(settings.yolo_model_path)
                models_used.append(Path(settings.yolo_model_path).name)
                track_history: dict[int, list[tuple[float, float]]] = {}
                alerted_tracks: set[int] = set()
                last_congestion_second = -30.0
                try:
                    for frame_index, timestamp, frame in _iter_sampled_frames(video_path):
                        frames_analyzed += 1
                        result = model.track(
                            source=frame,
                            conf=settings.yolo_confidence,
                            imgsz=settings.yolo_image_size,
                            device=self.device,
                            half=self.device != "cpu",
                            persist=True,
                            tracker="bytetrack.yaml",
                            verbose=False,
                        )[0]
                        frame_objects: list[tuple[str, float, list[float], int | None]] = []
                        for box in result.boxes:
                            class_id = int(box.cls.item())
                            label = normalize_model_label(str(result.names[class_id]))
                            confidence = float(box.conf.item())
                            coords = [float(value) for value in box.xyxy[0].tolist()]
                            track_id = int(box.id.item()) if box.id is not None else None
                            frame_objects.append((label, confidence, coords, track_id))
                            class_counts[label] += 1
                            objects_detected += 1
                        privacy_boxes = [
                            _pixel_box(coords)
                            for label, _, coords, _ in frame_objects
                            if label in PRIVACY_SENSITIVE_OBJECTS
                        ]
                        privacy_by_frame[frame_index] = privacy_boxes

                        if "traffic" in requested:
                            vehicle_count = sum(
                                1 for label, _, _, _ in frame_objects if label in COCO_VEHICLES
                            )
                            person_count = sum(
                                1 for label, _, _, _ in frame_objects if label == "person"
                            )
                            signal = max(
                                vehicle_count / max(1, settings.congestion_vehicle_threshold),
                                person_count / max(1, settings.congestion_person_threshold),
                            )
                            if signal >= 1 and timestamp - last_congestion_second >= 10:
                                detections.append(
                                    self._new_detection(
                                        context=context,
                                        event_type="congestion",
                                        confidence=min(0.98, 0.55 + signal * 0.12),
                                        location=location,
                                        timestamp=timestamp,
                                        frame=frame,
                                        privacy_boxes=privacy_boxes,
                                        model_label="vehicle_person_density_advisory",
                                        severity="high" if signal >= 1.8 else "medium",
                                    )
                                )
                                last_congestion_second = timestamp

                        if "wrong_way" in requested and context.expected_direction:
                            height, width = frame.shape[:2]
                            for label, confidence, coords, track_id in frame_objects:
                                if label not in COCO_VEHICLES or track_id is None:
                                    continue
                                x1, y1, x2, y2 = coords
                                center = (((x1 + x2) / 2) / width, ((y1 + y2) / 2) / height)
                                history = track_history.setdefault(track_id, [])
                                history.append(center)
                                if (
                                    track_id not in alerted_tracks
                                    and len(history) >= settings.wrong_way_min_observations
                                    and movement_opposes_direction(
                                        history[0],
                                        history[-1],
                                        context.expected_direction,
                                        settings.wrong_way_min_displacement_ratio,
                                    )
                                ):
                                    detections.append(
                                        self._new_detection(
                                            context=context,
                                            event_type="wrong_way_driving",
                                            confidence=confidence,
                                            location=location,
                                            timestamp=timestamp,
                                            frame=frame,
                                            privacy_boxes=privacy_boxes,
                                            coords=coords,
                                            model_label=f"yolo26_bytetrack_{context.expected_direction}",
                                            track_id=track_id,
                                            severity="high",
                                        )
                                    )
                                    alerted_tracks.add(track_id)
                finally:
                    _release_model(model)
                if "wrong_way" in requested and not context.expected_direction:
                    limitations.append(
                        "Wrong-way analysis skipped because no expected camera direction was supplied."
                    )

        specialist_specs = [
            (
                "civic",
                settings.civic_model_path,
                settings.civic_confidence,
                CIVIC_LABEL_MAP,
                False,
            ),
            (
                "helmet",
                settings.helmet_model_path,
                settings.helmet_confidence,
                {},
                False,
            ),
            (
                "waterlogging",
                settings.waterlogging_model_path,
                settings.waterlogging_confidence,
                {},
                True,
            ),
        ]
        for module, path_value, confidence_threshold, label_map, is_world in specialist_specs:
            if module not in requested:
                continue
            status = self.module_status[module]
            if not status.available:
                limitations.append(f"{module.replace('_', ' ').title()} module skipped: weights missing.")
                continue
            model = YOLOWorld(path_value) if is_world else YOLO(path_value)
            if is_world:
                model.set_classes(["flooded road", "standing water", "waterlogging", "puddle"])
            models_used.append(Path(path_value).name)
            last_event_second: dict[str, float] = {}
            try:
                for frame_index, timestamp, frame in _iter_sampled_frames(video_path):
                    if not needs_base:
                        frames_analyzed = max(frames_analyzed, len(privacy_by_frame) + 1)
                    result = model.predict(
                        source=frame,
                        conf=confidence_threshold,
                        imgsz=settings.yolo_image_size,
                        device=self.device,
                        half=self.device != "cpu",
                        verbose=False,
                    )[0]
                    for box in result.boxes:
                        class_id = int(box.cls.item())
                        raw_label = str(result.names[class_id])
                        label = normalize_model_label(raw_label)
                        confidence = float(box.conf.item())
                        coords = [float(value) for value in box.xyxy[0].tolist()]
                        class_counts[f"{module}:{label}"] += 1
                        objects_detected += 1
                        event_type: str | None = None
                        if module == "civic":
                            event_type = label_map.get(label)
                        elif module == "helmet" and helmet_label_is_violation(label):
                            event_type = "helmet_violation"
                        elif module == "waterlogging" and label in WATERLOGGING_LABELS:
                            event_type = "waterlogging"
                        if not event_type:
                            continue
                        if timestamp - last_event_second.get(event_type, -30.0) < 5:
                            continue
                        detections.append(
                            self._new_detection(
                                context=context,
                                event_type=event_type,
                                confidence=confidence,
                                location=location,
                                timestamp=timestamp,
                                frame=frame,
                                privacy_boxes=privacy_by_frame.get(frame_index, []),
                                coords=coords,
                                model_label=f"{Path(path_value).stem}:{label}",
                                severity="high" if event_type == "waterlogging" else None,
                            )
                        )
                        last_event_second[event_type] = timestamp
            finally:
                _release_model(model)

        if "waterlogging" in requested:
            limitations.append(
                "Waterlogging uses open-vocabulary detection and always requires field verification."
            )
        if "helmet" in requested:
            limitations.append(
                "Helmet alerts require validation on local motorcycle camera angles before operations."
            )

        processing_ms = int((time.perf_counter() - started) * 1000)
        return DetectionRun(
            detections=detections,
            model_name=" + ".join(models_used) or "no-model-run",
            device=self.device,
            frames_analyzed=frames_analyzed,
            processing_ms=processing_ms,
            objects_detected=objects_detected,
            class_counts=dict(class_counts),
            models_used=models_used,
            requested_modules=requested,
            module_status=self.module_status,
            limitations=limitations,
        )
