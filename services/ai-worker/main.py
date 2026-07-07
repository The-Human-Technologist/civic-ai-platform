from datetime import datetime, timezone

from fastapi import FastAPI

from app.config import settings
from app.detectors import DetectorContext, MockCivicDetector
from app.schemas import (
    DemoJobRequest,
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
        "service": "civic-ai-worker",
        "mode": "scaffold",
        "realInferenceEnabled": False,
    }


@app.post("/process-demo-job", response_model=WorkerJobResponse)
def process_demo_job(payload: DemoJobRequest):
    detector = MockCivicDetector()
    detections = detector.detect(
        DetectorContext(job_id=payload.jobId, video_name=payload.videoName, demo_id=payload.demoId)
    )
    return WorkerJobResponse(
        jobId=payload.jobId,
        status="completed",
        progress=100,
        detections=detections,
        limitations=[
            "mock detector only",
            "no real CV inference",
            "no real video processing",
            "no CCTV/RTSP",
        ],
        note="Mock detector only. This endpoint proves worker/frontend handoff without claiming real AI is shipped.",
    )


@app.post("/process-video-job", response_model=WorkerJobResponse)
def process_video_job(payload: VideoJobRequest):
    return WorkerJobResponse(
        jobId=payload.jobId,
        status="failed",
        progress=5,
        detections=[],
        limitations=[
            "metadata only",
            "no real video bytes accepted",
            "no real CV inference",
            "no CCTV/RTSP",
        ],
        note="Real uploaded-video processing is not implemented yet. This endpoint currently accepts metadata only.",
        error="Real uploaded-video processing is not implemented yet. Metadata-only scaffold response returned.",
    )
