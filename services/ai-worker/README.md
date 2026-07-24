# Civic AI worker

Local FastAPI worker for real, privacy-first YOLO analysis of explicitly authorized video clips.

## What works

- YOLO26n inference at 640px, with CUDA FP16 when an NVIDIA GPU is available
- sampled video processing (1 FPS by default)
- real person and vehicle detection from standard pretrained weights
- conservative congestion advisories from person/vehicle density
- pothole, road-damage, and garbage advisories from a civic specialist checkpoint
- helmet/non-helmet advisories from a specialist checkpoint
- experimental waterlogging advisories from a small YOLO-World checkpoint
- wrong-way advisories from YOLO26 + ByteTrack and a supplied camera direction
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

## Model modules

The worker uses four ignored local checkpoints and loads them sequentially so the target RTX 3050
does not have to hold every network in 4 GB VRAM at once:

- `yolo26n.pt`: people/vehicles, congestion, and ByteTrack direction
- `civic-road-issues.pt`: pothole, road damage, and garbage
- `helmet-candidate.pt`: helmet/non-helmet advisory
- `waterlogging-world.pt`: experimental open-vocabulary standing-water advisory

Run `python scripts/bootstrap_model.py` to install them and `python scripts/doctor.py` to verify
their presence and CUDA. Weights are intentionally gitignored. See
`docs/MODEL_PROVENANCE.md` for sources, hashes, licences, and limitations.

## API

- `GET /health`
- `POST /process-video` (multipart: video, jobId, locationLabel, authorizationReference,
  authorizationConfirmed, analysisModules, optional expectedDirection)
- `POST /process-sample-job` (synthetic workflow training only)
