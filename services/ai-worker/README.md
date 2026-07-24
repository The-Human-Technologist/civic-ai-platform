# Civic AI worker

Local FastAPI worker for real, privacy-first YOLO analysis of explicitly authorized video clips.

## What works

- YOLO26n inference at 640px, with CUDA FP16 when an NVIDIA GPU is available
- sampled video processing (1 FPS by default)
- real person and vehicle detection from standard pretrained weights
- conservative congestion advisories from person/vehicle density
- custom civic-class support when `YOLO_MODEL_PATH` points to trained weights
- whole-person and whole-vehicle masking before an evidence image leaves the worker
- immediate deletion of the uploaded source clip and decoded frames
- mandatory authorization reference and human-review status

The worker does not perform facial recognition, citizen scoring, automatic challans, live CCTV
ingestion, or legal speed measurement.

## Windows setup for an RTX 3050

From `services/ai-worker`:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
python scripts\bootstrap_model.py
python scripts\doctor.py
uvicorn main:app --host 127.0.0.1 --port 8000
```

If `doctor.py` reports `CUDA available: False`, install the Windows CUDA build of PyTorch using
the command generated at https://pytorch.org/get-started/locally/ and run the doctor again. Do not
continue to the police walkthrough until it reports the NVIDIA GPU.

Start Next.js from the repository root in a second terminal:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Then open `/dashboard/upload`, check worker health, select an authorized clip, enter its location
and authorization/licence reference, confirm authorization, and run analysis.

## Standard versus custom weights

`yolo26n.pt` is a general COCO checkpoint. It detects people and vehicles and supports the real
congestion advisory in this repository. It does not honestly detect potholes, waterlogging,
garbage overflow, wrong-way driving, or helmet violations.

To add those classes, train/evaluate a civic dataset and set:

```dotenv
YOLO_MODEL_PATH=models/civic-best.pt
```

Recognized custom class names are documented in `app/detectors.py`. Model weights are intentionally
gitignored and must never be committed with private footage.

## API

- `GET /health`
- `POST /process-video` (multipart: video, jobId, locationLabel, authorizationReference,
  authorizationConfirmed)
- `POST /process-sample-job` (synthetic workflow training only)
