from datetime import datetime, timezone

from fastapi import FastAPI

from app.config import settings
from app.detectors import DetectorContext, MockCivicDetector
from app.schemas import (
    DemoJobRequest,
    ProcessingJobModel,
    VideoJobRequest,
    WorkerJobResponse,
)

app = FastAPI(
    title="Civic AI Worker",
    description="Phase 2A scaffold for authorized uploaded-video processing only.",
    version="0.1.0-scaffold",
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@app.get("/health")
def health():
    return {
        "ok": True,
        "mode": settings.ai_processing_mode,
        "note": "Worker scaffold only. No real model downloads, RTSP ingest, or automatic enforcement.",
    }


@app.post("/process-demo-job", response_model=WorkerJobResponse)
def process_demo_job(payload: DemoJobRequest):
    detector = MockCivicDetector()
    detections = detector.detect(
        DetectorContext(job_id=payload.jobId, video_name=payload.videoName, demo_id=payload.demoId)
    )
    job = ProcessingJobModel(
        id=payload.jobId,
        sourceType="synthetic_demo",
        status="completed",
        progress=100,
        createdAt=now_iso(),
        updatedAt=now_iso(),
        videoName=payload.videoName,
        demoId=payload.demoId,
        mode="mock",
    )
    return WorkerJobResponse(
        job=job,
        detections=detections,
        note="Mock detector only. This endpoint exists to prove worker/frontend handoff without claiming real AI is shipped.",
    )


@app.post("/process-video-job", response_model=WorkerJobResponse)
def process_video_job(payload: VideoJobRequest):
    job = ProcessingJobModel(
        id=payload.jobId,
        sourceType=payload.sourceType,
        status="failed",
        progress=5,
        createdAt=now_iso(),
        updatedAt=now_iso(),
        videoName=payload.videoName,
        mode="worker",
        error="Scaffold only: real uploaded-video processing is not implemented in Phase 2A.",
    )
    return WorkerJobResponse(
        job=job,
        detections=[],
        note="Dev-only scaffold. Use authorized uploaded clips only after FFmpeg/OpenCV and privacy masking are fully implemented.",
    )
