from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from app.config import settings
from app.detectors import (
    ANALYSIS_MODULES,
    DetectorContext,
    MockCivicDetector,
    YoloCivicDetector,
    get_module_status,
    resolve_device,
)
from app.schemas import DemoJobRequest, WorkerJobResponse

app = FastAPI(
    title="Civic AI Worker",
    description="Privacy-first YOLO processing for explicitly authorized uploaded video.",
    version="1.0.0-prototype",
)

ALLOWED_CONTENT_TYPES = {"video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"}


@app.get("/health")
def health():
    module_status = get_module_status()
    model_available = module_status["traffic"].available
    return {
        "ok": True,
        "service": "civic-ai-worker",
        "mode": "yolo-authorized-upload",
        "realInferenceEnabled": model_available,
        "modelName": Path(settings.yolo_model_path).name,
        "modelAvailable": model_available,
        "device": resolve_device(),
        "privacyMaskingEnabled": settings.privacy_masking_enabled,
        "moduleStatus": {
            name: status.model_dump() for name, status in module_status.items()
        },
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
    analysisModules: str = Form("traffic,civic,helmet,waterlogging"),
    expectedDirection: str | None = Form(None),
):
    if not authorizationConfirmed or not authorizationReference.strip():
        raise HTTPException(
            status_code=403,
            detail="Explicit authorization confirmation and a reference are required.",
        )
    if video.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported video content type.")
    requested_modules = [
        value.strip() for value in analysisModules.split(",") if value.strip()
    ]
    if not requested_modules or any(value not in ANALYSIS_MODULES for value in requested_modules):
        raise HTTPException(status_code=422, detail="Invalid analysis module selection.")
    valid_directions = {
        "left_to_right",
        "right_to_left",
        "top_to_bottom",
        "bottom_to_top",
    }
    if expectedDirection and expectedDirection not in valid_directions:
        raise HTTPException(status_code=422, detail="Invalid expected travel direction.")
    if "wrong_way" in requested_modules and not expectedDirection:
        raise HTTPException(
            status_code=422,
            detail="Expected travel direction is required for wrong-way analysis.",
        )

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
                analysis_modules=requested_modules,  # type: ignore[arg-type]
                expected_direction=expectedDirection,  # type: ignore[arg-type]
            ),
        )
        return WorkerJobResponse(
            jobId=jobId,
            status="completed",
            progress=100,
            detections=run.detections,
            limitations=run.limitations + ["No live CCTV or RTSP intake."],
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
            modelsUsed=run.models_used,
            requestedModules=run.requested_modules,
            moduleStatus=run.module_status,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)[:500]) from exc
    finally:
        await video.close()
        shutil.rmtree(temp_dir, ignore_errors=True)
