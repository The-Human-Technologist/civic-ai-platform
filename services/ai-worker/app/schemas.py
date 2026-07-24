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
    "helmet_violation",
    "unknown",
]
AnalysisModule = Literal["traffic", "civic", "helmet", "waterlogging", "wrong_way"]
ExpectedDirection = Literal[
    "left_to_right",
    "right_to_left",
    "top_to_bottom",
    "bottom_to_top",
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
    modelLabel: Optional[str] = None
    trackId: Optional[int] = None
    evidenceImageDataUrl: Optional[str] = None
    evidencePersisted: bool = False


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
    analysisModules: list[AnalysisModule] = Field(
        default_factory=lambda: ["traffic", "civic", "helmet", "waterlogging"]
    )
    expectedDirection: Optional[ExpectedDirection] = None


class ModelModuleStatus(BaseModel):
    available: bool
    modelName: Optional[str] = None
    classes: list[str] = Field(default_factory=list)
    experimental: bool = False
    note: Optional[str] = None


class WorkerJobResponse(BaseModel):
    jobId: str
    status: ProcessingJobStatus
    progress: int = Field(ge=0, le=100)
    detections: list[ProcessingDetectionModel] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)
    note: str
    error: Optional[str] = None
    modelName: Optional[str] = None
    device: Optional[str] = None
    realInferenceEnabled: bool = False
    framesAnalyzed: int = 0
    processingMs: int = 0
    objectsDetected: int = 0
    classCounts: dict[str, int] = Field(default_factory=dict)
    modelsUsed: list[str] = Field(default_factory=list)
    requestedModules: list[AnalysisModule] = Field(default_factory=list)
    moduleStatus: dict[str, ModelModuleStatus] = Field(default_factory=dict)
