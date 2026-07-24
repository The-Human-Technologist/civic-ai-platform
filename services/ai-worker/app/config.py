from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ai_processing_mode: str = Field(default="worker", alias="AI_PROCESSING_MODE")
    frame_sample_rate_fps: int = Field(default=1, alias="FRAME_SAMPLE_RATE_FPS")
    privacy_masking_enabled: bool = Field(default=True, alias="PRIVACY_MASKING_ENABLED")
    max_video_upload_mb: int = Field(default=250, alias="MAX_VIDEO_UPLOAD_MB")
    max_sampled_frames: int = Field(default=300, alias="MAX_SAMPLED_FRAMES")
    yolo_model_path: str = Field(default="models/yolo26n.pt", alias="YOLO_MODEL_PATH")
    yolo_device: str = Field(default="auto", alias="YOLO_DEVICE")
    yolo_image_size: int = Field(default=640, alias="YOLO_IMAGE_SIZE")
    yolo_confidence: float = Field(default=0.35, alias="YOLO_CONFIDENCE")
    allow_model_download: bool = Field(default=False, alias="ALLOW_MODEL_DOWNLOAD")
    congestion_vehicle_threshold: int = Field(
        default=5, alias="CONGESTION_VEHICLE_THRESHOLD"
    )
    congestion_person_threshold: int = Field(
        default=10, alias="CONGESTION_PERSON_THRESHOLD"
    )
    evidence_jpeg_quality: int = Field(default=78, alias="EVIDENCE_JPEG_QUALITY")

    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "ignore",
    }


settings = Settings()
