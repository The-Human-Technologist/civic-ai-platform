from __future__ import annotations

from dataclasses import dataclass
from random import Random

from app.schemas import ProcessingDetectionModel


@dataclass
class DetectorContext:
    job_id: str
    video_name: str | None = None
    demo_id: str | None = None


class CivicDetector:
    """Future detector interface for YOLO / OpenCV integration.

    Do not download weights here. Real model wiring should be explicit, documented, and feature-flagged.
    """

    def detect(self, context: DetectorContext) -> list[ProcessingDetectionModel]:
        raise NotImplementedError


class MockCivicDetector(CivicDetector):
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
                )
            )
        return detections
