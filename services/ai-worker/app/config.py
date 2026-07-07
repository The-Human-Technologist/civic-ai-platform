from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ai_processing_mode: str = Field(default="mock", alias="AI_PROCESSING_MODE")
    frame_sample_rate_fps: int = Field(default=1, alias="FRAME_SAMPLE_RATE_FPS")
    privacy_masking_enabled: bool = Field(default=True, alias="PRIVACY_MASKING_ENABLED")
    max_video_upload_mb: int = Field(default=250, alias="MAX_VIDEO_UPLOAD_MB")

    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "ignore",
    }


settings = Settings()
