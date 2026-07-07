from typing import Literal, Optional

from pydantic import BaseModel, Field


ProcessingMode = Literal["mock", "worker"]
ProcessingJobStatus = Literal[
    "queued",
    "extracting_frames",
    "masking_privacy",
    "running_detection",
    "saving_results",
    "completed",
    "failed",
]
ProcessingSourceType = Literal["synthetic_demo", "uploaded_video", "authorized_pilot_clip"]
CivicDetectionClass = Literal[
    "pothole",
    "waterlogging",
    "garbage_overflow",
    "illegal_parking",
    "road_blockage",
    "congestion",
    "wrong_way_driving",
    "unknown",
]
Severity = Literal["low", "medium", "high", "critical"]
HumanReviewStatus = Literal["pending", "confirmed", "rejected", "needs_field_verification"]


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class ProcessingJobModel(BaseModel):
    id: str
    sourceType: ProcessingSourceType
    status: ProcessingJobStatus
    progress: int = Field(ge=0, le=100)
    createdAt: str
    updatedAt: str
    videoName: Optional[str] = None
    demoId: Optional[str] = None
    locationLabel: Optional[str] = None
    selectedScenario: Optional[str] = None
    mode: ProcessingMode
    error: Optional[str] = None


class ProcessingDetectionModel(BaseModel):
    id: str
    jobId: str
    type: CivicDetectionClass
    confidence: float = Field(ge=0.0, le=1.0)
    severity: Severity
    locationLabel: str
    frameTimestampSec: Optional[float] = None
    boundingBox: Optional[BoundingBox] = None
    privacyMasked: bool = True
    humanReviewStatus: HumanReviewStatus = "pending"


class DemoJobRequest(BaseModel):
    jobId: str
    demoId: Optional[str] = None
    sourceType: ProcessingSourceType = "synthetic_demo"
    videoName: Optional[str] = None
    locationLabel: Optional[str] = None


class VideoJobRequest(BaseModel):
    jobId: str
    videoName: str
    sourceType: ProcessingSourceType = "uploaded_video"
    locationLabel: Optional[str] = None
    selectedScenario: Optional[str] = None


class WorkerJobResponse(BaseModel):
    jobId: str
    status: ProcessingJobStatus
    progress: int = Field(ge=0, le=100)
    detections: list[ProcessingDetectionModel] = []
    limitations: list[str] = []
    note: str
    error: Optional[str] = None
