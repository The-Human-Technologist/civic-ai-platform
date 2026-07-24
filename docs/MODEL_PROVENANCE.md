# Model provenance and validation boundary

Model weights are downloaded locally into `services/ai-worker/models/` and are excluded from Git.
Run `python scripts/bootstrap_model.py` from the worker directory to reproduce the setup.

| Module | Local file | Source | Declared licence | SHA-256 used for the July 2026 prototype |
|---|---|---|---|---|
| Traffic / tracking | `yolo26n.pt` | Ultralytics assets | AGPL-3.0 | `9B09CC8BF347F0FC8A5F7657480587F25DB09B34BF33B0652110FB03A8AD4FEF` |
| Road issues | `civic-road-issues.pt` | [Vansh180/PotholeNet-V1](https://huggingface.co/Vansh180/PotholeNet-V1) | MIT in model card | `F380CD373F61F2BC71F7FCC1B0EC072194DC2CD933FD05BC1AE5AD136A333B78` |
| Helmet | `helmet-candidate.pt` | [NightPrince/Yolo-Helmet](https://huggingface.co/NightPrince/Yolo-Helmet) | Apache-2.0 | `602BC183CE9F53642C07834026B31A0D3CFF855011CCD95954179E83DBF65D9F` |
| Waterlogging | `waterlogging-world.pt` | Ultralytics YOLO-World v2 small | AGPL-3.0 | `9B2C17AB6124A913E9B3A5C170617920D91B0F01111A8479DA69F00E2CF27792` |

## Local verification completed

- all four checkpoints loaded and ran sequentially with CUDA FP16 on an NVIDIA RTX 3050 Laptop GPU
- the road-issues checkpoint produced a pothole detection on a temporary public road test image
- the waterlogging module produced a flooded-road detection on that road test image
- the helmet checkpoint produced a non-helmet detection on a temporary public traffic test image
- YOLO26 + ByteTrack produced a wrong-way alert with a persistent track ID on a generated
  moving-vehicle validation clip

These are integration checks, not an accuracy benchmark. Before an operational pilot, each module
needs an approved, representative West Bengal validation set, written acceptance thresholds,
false-positive/false-negative reporting, and sign-off by the responsible authority.

## Safety and interpretation

- Results are advisory and enter `pending` human review.
- Wrong-way analysis requires the operator to supply the permitted direction for that camera.
- Waterlogging is open-vocabulary and always requires field verification.
- Helmet results are experimental until evaluated on the intended motorcycle camera angles.
- Road damage is routed as a road-blockage/maintenance advisory, not proof of a statutory offence.
- No module performs facial recognition, citizen scoring, automatic challans, or legal speed
  measurement.
