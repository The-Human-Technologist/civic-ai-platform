# Data Sources & Footage Policy

**AI Civic Operations & Road Safety Intelligence Platform**  
Maintained by [The Human Technologist](https://github.com/The-Human-Technologist)

---

## Overview

The **public alpha (v0.1)** ships with **mock detections only**. This repository does **not** include real CCTV footage, municipal camera feeds, or large video datasets. The upload UI simulates processing locally; no real inference runs in the MVP.

This document defines **allowed** footage and dataset sources for Phase 2 development, demos, and future municipal pilots — and what is **never** permitted.

**Dashboard:** [Live demo → Data Sources](https://civic-ai-platform-three.vercel.app/dashboard/data-sources)

---

## Allowed sources

| Category | Description |
|----------|-------------|
| **Public research datasets** | Datasets with clear license/terms (e.g. academic driving scenes, traffic tracking benchmarks) |
| **Stock traffic clips** | Short clips with explicit reuse permission — link externally; do not commit to Git |
| **Synthetic / demo footage** | Generated placeholders, illustrated scenes, or app mock feeds |
| **Self-recorded footage** | Only after blurring faces and masking number plates; keep outside the repo |
| **Authorized pilot footage** | Municipal or traffic-department video with **written permission** for a defined scope |

---

## Not allowed

- Random **open CCTV streams** without explicit permission from the camera owner
- **Scraped** live camera feeds or third-party “earthcam” style aggregators
- **Real CCTV** uploaded to GitHub (any branch, any folder)
- Footage from **schools, hospitals, private property**, or sensitive locations without authorization
- **Identifiable faces or number plates** in public demo materials without license and masking
- Any footage used for **automatic enforcement**, challans, or prosecution
- Claims that the project is **trained on real Kolkata/Barasat CCTV** (it is not, in v0.1)

---

## Recommended dataset categories

| Category | Example use in this project |
|----------|----------------------------|
| BDD100K-style driving / road-scene | Road layout, vehicles, weather — baseline scene understanding |
| BMD-45-style developing-city CCTV traffic | Vehicle detection in dense urban traffic (verify license per release) |
| AI City Challenge-style multi-camera tracking | Junction analytics, trajectory context |
| Traffic accident / near-miss datasets | Advisory safety pattern research (not legal evidence) |
| Pothole / road-damage datasets | Civic maintenance detection (Phase 2) |
| Waterlogging / flooded-road datasets | Monsoon drainage hotspot research |
| Garbage / waste detection datasets | Sanitation overflow signals |

---

## Dataset & source registry

| Dataset / Source | Purpose | Data type | License / terms | Status in this repo | Notes |
|------------------|---------|-----------|-----------------|---------------------|-------|
| **BDD100K** | Road scene understanding, vehicles | External driving video + labels | Berkeley license — [official site](https://bdd-data.berkeley.edu/) | Manual download required | Not bundled; download outside repo |
| **BMD-45-style traffic CCTV** | Developing-city vehicle detection | External CCTV-style traffic video | Verify per paper/dataset release | Manual download required | Do not assume Kolkata/Barasat origin |
| **AI City Challenge** | Multi-camera traffic tracking | External benchmark videos | Challenge terms — [aicitychallenge.org](https://www.aicitychallenge.org/) | Manual download required | Use only per challenge rules |
| **Stock traffic clips** | Public demo visuals, UI walkthroughs | External hosted video | Per-clip license (Pexels, Pixabay, etc.) | External links only | **Verify license** before each use; no redistribution in repo |
| **Synthetic demo footage** | Safe mock demos in app | In-app mock / placeholders | Project-generated | Available for demo | Default for public alpha |
| **Pothole / RDD-style public sets** | Road damage detection R&D | External images/video | Per-dataset license | Manual download required | e.g. RDD, Pothole-600 — verify terms |
| **Waste / garbage detection sets** | Sanitation overflow R&D | External images | Per-dataset license | Planned | TACO, TrashNet-style — verify terms |
| **Flood / waterlogging sets** | Standing water detection R&D | External images/video | Per-dataset license | Planned | Verify terms before use |
| **Authorized municipal footage** | Real pilot validation | Restricted pilot video | Written pilot agreement | Requires permission | One road, one junction, human review only |

Metadata for the dashboard UI lives in `src/lib/data-sources.ts` (no binary data).

---

## Pilot footage request

For a **real 30-day municipality pilot**, request written authorization that specifies:

1. **One road** and **one junction** (or similarly bounded scope)
2. **Limited time period** (e.g. 30–90 days)
3. **Clear purpose** — civic intelligence and advisory road safety analytics only
4. **Human-review-only** processing — no automatic fines or challans
5. **No public release** of raw footage
6. **Face and plate masking** before storage, export, or evidence clips
7. **Retention limits** and secure deletion after pilot evaluation
8. **Data controller** named (municipality / traffic department)

Template language is in the [pilot proposal](https://civic-ai-platform-three.vercel.app/pilot-proposal) page. Legal review by the deploying authority is required.

---

## Contributor rules

1. **Never commit** raw real-world video to this repository.
2. Keep local datasets in `/data` (ignored by Git) — run `npm run prepare:data` to scaffold folders.
3. Document **license and source** in `data/sources.json` (local only) or issue/PR text.
4. **Blur or mask** faces and plates before any public demo or screenshot.
5. Do not add scripts that **scrape** CCTV or download datasets without maintainer review.
6. Do not claim training on **real local CCTV** without documented authorization.
7. See [CONTRIBUTING.md](CONTRIBUTING.md) and [PRIVACY.md](PRIVACY.md).

---

## Local data setup

```bash
npm run prepare:data
```

Creates ignored folders under `data/` and example metadata. See [docs/data/README.md](docs/data/README.md).

---

## Phase 2 environment variables (planned)

| Variable | Purpose |
|----------|---------|
| `DATA_ROOT` | Local path to ignored `data/` directory |
| `DATASET_MANIFEST` | Path to `data/sources.json` metadata |
| `AI_PROCESSING_MODE` | `mock` (default) or `worker` when inference ships |

---

*This policy is part of the public alpha. Update when real inference or pilot footage is integrated.*
