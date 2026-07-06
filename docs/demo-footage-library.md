# Demo Footage Library

How **demo footage** is catalogued in the Civic AI Platform — without committing raw video to Git.

**Live UI:** [/dashboard/demo-footage](https://civic-ai-platform-three.vercel.app/dashboard/demo-footage)
**Registry code:** `src/lib/demo-footage.ts`
**Broader policy:** [DATA_SOURCES.md](../DATA_SOURCES.md)

---

## What “demo footage” means here

| Term | Meaning |
|------|---------|
| **Synthetic placeholder** | In-app metadata only — mock detections, no video file |
| **Stock clip candidate** | External licensed clip — link + license doc, never in repo |
| **Public dataset candidate** | BDD100K, AI City Challenge, etc. — manual download to local `data/raw` |
| **Authorized pilot placeholder** | Slot for future municipal footage with written permission |

The public alpha **does not bundle video**. The library is a **metadata catalog** for reviewers, contributors, and Phase 2 planning.

---

## Why raw video is not committed

- GitHub is for **code and documentation**, not CCTV archives
- Privacy risk (faces, plates, sensitive locations)
- License restrictions on research datasets
- AGPL transparency — we must not imply training on undisclosed municipal feeds
- CI enforces policy via `npm run verify:footage`

---

## How to add a licensed stock clip safely

1. Choose a clip from a reputable stock provider (Pexels, Pixabay, etc.)
2. **Read the license** — note attribution, redistribution, commercial use
3. Add a row to the template below (and optionally `src/lib/demo-footage.ts` metadata)
4. Host the file **externally** (YouTube unlisted, Vercel Blob, S3) — **not** in this repo
5. Mask faces/plates if any appear in demo screenshots
6. Document the URL in local `data/sources.json` only

---

## How to add a public dataset reference safely

1. Find the **official** dataset page (not mirrors)
2. Register / accept terms if required
3. Add metadata to `src/lib/demo-footage.ts` with `manual_verification_required`
4. Run `npm run prepare:data` and download to `data/raw/<dataset-id>/`
5. Never `git add` the downloaded files
6. Do **not** claim the model is trained on local Kolkata/Barasat CCTV

---

## How to request official municipal pilot footage

Use the [pilot proposal](https://civic-ai-platform-three.vercel.app/pilot-proposal) template. Written authorization must specify:

- One road + one junction (bounded scope)
- Limited time period
- Human-review-only processing
- No public release of raw footage
- Face/plate masking before storage
- No automatic enforcement

Store pilot video in **private infrastructure** outside Git.

---

## What must never be added

- Random open CCTV stream recordings
- Scraped “live cam” aggregators
- `*.mp4` / `*.mov` in the repository
- Whole dataset ZIPs in Git
- Model weights (`.pt`, `.onnx`) in Git
- Footage implying real Barasat/Kolkata municipal CCTV training without proof
- Clips used for automatic challans or prosecution

---

## Catalog template

Copy when adding a new entry (maintain in `src/lib/demo-footage.ts`):

| Field | Example |
|-------|---------|
| **Title** | Licensed junction stock clip (external) |
| **Source** | Pexels — contributor name |
| **Source URL** | `https://…` (external only) |
| **License** | Pexels License — verify at download time |
| **Allowed use** | Live demo embed, grant deck b-roll |
| **Privacy risk** | Medium |
| **Faces/plates visible?** | Yes → mask before screenshot |
| **Masking required?** | Yes, before any public demo |
| **Can redistribute in repo?** | No |
| **Can use in live demo?** | Yes, via external URL only |
| **Notes** | Added 2026-07-06; attribution in demo script |

---

## Verification

```bash
npm run verify:footage
```

Runs `scripts/verify-footage-policy.js` — also executed in GitHub Actions CI.

---

## Related

- [DATA_SOURCES.md](../DATA_SOURCES.md) — full footage policy
- [docs/data/README.md](data/README.md) — local `data/` architecture
- [docs/screenshots/README.md](screenshots/README.md) — capture guide (no real CCTV in images)
