# AI worker scaffold

This folder contains the **Phase 2A real-processing foundation** for the Civic AI Platform.

## What it is

A separate Python **FastAPI** worker that is meant to run outside the Next.js / Vercel frontend.

Why separate?

- Video frame extraction is too heavy for a frontend route.
- Privacy masking should happen before evidence persistence.
- Future pilot storage and worker queues should not block the public demo UI.

## What is implemented now

- frontend can create processing job records through the Next.js API
- `GET /health` FastAPI health check
- `POST /process-demo-job` scaffold using a mock detector
- `POST /process-video-job` scaffold for future uploaded-video jobs
- FFmpeg / OpenCV frame-extraction function signatures
- Privacy-masking utility scaffold (blur / mosaic if OpenCV exists)
- Shared job / detection schemas matching the frontend processing model

## What is not implemented yet

- No model downloads
- No model weights bundled in this repository
- No YOLO weights
- No RTSP / live CCTV support
- No facial recognition
- No OCR / ANPR / challan logic
- No production queue, storage, or auth

## How to run locally

```bash
cd services/ai-worker
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Then test:

```bash
curl http://localhost:8000/health
```

## Enable worker mode in Next.js

Set these in `.env.local` for local testing:

```bash
AI_PROCESSING_MODE=worker
AI_WORKER_URL=http://localhost:8000
```

The frontend can then create processing jobs that call the worker scaffold for synthetic demos.
Uploaded-video jobs still send metadata only.

Worker will eventually receive **storage object references**, not public URLs or GitHub-hosted videos.

## Warning

Worker scaffold returns **mock detections only**. No model weights or real CV inference are bundled in this repository.

## Privacy-first rule

Future real pilot processing must follow this order:

```text
Authorized uploaded video
→ frame extraction
→ privacy masking
→ detection
→ human review
```

Faces and number plates should be masked **before evidence persistence**. Detection for masking is allowed; identity recognition is not.

## Planned future integration

- Frontend creates processing job metadata
- Worker receives authorized uploaded-video job
- FFmpeg/OpenCV extracts frames
- Detector adapter runs YOLO/OpenCV models behind feature flags
- Detections are stored for human review
- Public demo remains mock by default until pilot hardening is complete
- Worker integration remains scaffolded until a safe backend deployment is available
