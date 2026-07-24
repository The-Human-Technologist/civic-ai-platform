from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from app.config import settings
from app.detectors import DetectorContext, MockCivicDetector, YoloCivicDetector, resolve_device
from app.schemas import DemoJobRequest, WorkerJobResponse

app = FastAPI(
    title="Civic AI Worker",
    description="Privacy-first YOLO processing for explicitly authorized uploaded video.",
    version="1.0.0-prototype",
)

ALLOWED_CONTENT_TYPES = {"video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"}


@app.get("/health")
def health():
    model_path = Path(settings.yolo_model_path)
    model_available = model_path.is_file() or settings.allow_model_download
    return {
        "ok": True,
        "service": "civic-ai-worker",
        "mode": "yolo-authorized-upload",
        "realInferenceEnabled": model_available,
        "modelName": model_path.name,
        "modelAvailable": model_available,
        "device": resolve_device(),
        "privacyMaskingEnabled": settings.privacy_masking_enabled,
    }


@app.post("/process-sample-job", response_model=WorkerJobResponse)
def process_sample_job(payload: DemoJobRequest):
    detections = MockCivicDetector().detect(
        DetectorContext(
            job_id=payload.jobId,
            video_name=payload.videoName,
            demo_id=payload.demoId,
            location_label=payload.locationLabel,
        )
    )
    return WorkerJobResponse(
        jobId=payload.jobId,
        status="completed",
        progress=100,
        detections=detections,
        limitations=["Synthetic sample only", "No video bytes processed"],
        note="Synthetic sample processing completed.",
    )


@app.post("/process-video", response_model=WorkerJobResponse)
async def process_video(
    video: UploadFile = File(...),
    jobId: str = Form(...),
    locationLabel: str = Form(...),
    authorizationReference: str = Form(...),
    authorizationConfirmed: bool = Form(...),
):
    if not authorizationConfirmed or not authorizationReference.strip():
        raise HTTPException(
            status_code=403,
            detail="Explicit authorization confirmation and a reference are required.",
        )
    if video.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported video content type.")

    suffix = Path(video.filename or "clip.mp4").suffix.lower() or ".mp4"
    max_bytes = settings.max_video_upload_mb * 1024 * 1024
    temp_dir = Path(tempfile.mkdtemp(prefix="civic-ai-"))
    temp_path = temp_dir / f"authorized-clip{suffix}"
    total = 0
    try:
        with temp_path.open("wb") as target:
            while chunk := await video.read(1024 * 1024):
                total += len(chunk)
                if total > max_bytes:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Video exceeds the {settings.max_video_upload_mb} MB limit.",
                    )
                target.write(chunk)

        detector = YoloCivicDetector()
        run = detector.process_video(
            str(temp_path),
            DetectorContext(
                job_id=jobId,
                video_name=video.filename,
                location_label=locationLabel.strip(),
            ),
        )
        return WorkerJobResponse(
            jobId=jobId,
            status="completed",
            progress=100,
            detections=run.detections,
            limitations=[
                "Alerts are advisory and require human review.",
                "Standard weights detect people/vehicles; specialist civic classes require custom weights.",
                "No facial recognition and no automatic enforcement.",
                "No live CCTV or RTSP intake.",
            ],
            note=(
                f"Real YOLO inference completed on {run.frames_analyzed} sampled frames. "
                "The uploaded clip and decoded frames were deleted after processing."
            ),
            modelName=run.model_name,
            device=run.device,
            realInferenceEnabled=True,
            framesAnalyzed=run.frames_analyzed,
            processingMs=run.processing_ms,
            objectsDetected=run.objects_detected,
            classCounts=run.class_counts,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)[:500]) from exc
    finally:
        await video.close()
        shutil.rmtree(temp_dir, ignore_errors=True)
