# Open-source issue backlog

Suggested GitHub issues for **AI Civic Operations & Road Safety Intelligence Platform**.

**Primary set (12):** Copy from [Structured issue drafts](#structured-issue-drafts-openai--phase-25) below for OpenAI submission / Phase 2 kickoff.

**Extended backlog:** Additional issues for later phases — see [Extended backlog](#extended-backlog).

Repository: [The-Human-Technologist/civic-ai-platform](https://github.com/The-Human-Technologist/civic-ai-platform/issues)

---

**Legend — difficulty**

| Tag | Meaning |
|-----|---------|
| `good first issue` | ≤1–2 days, limited domain knowledge |
| `medium` | Multi-file, some architecture |
| `advanced` | Infra, CV, security, or cross-cutting |

---

## Structured issue drafts (OpenAI / Phase 2–5)

Create these on GitHub with `gh issue create` or the web UI. Suggested labels are listed per issue.

### Issue 1 — FFmpeg frame extraction worker

**Title:** `Add FFmpeg frame extraction worker`  
**Labels:** `phase-2`, `backend`, `video`

**Body:**
Implement server-side frame extraction from uploaded MP4 files using FFmpeg. Must not process live CCTV streams in public demo mode. Include tests and safety notes.

---

### Issue 2 — YOLO/OpenCV detector service

**Title:** `Add YOLO/OpenCV detector service`  
**Labels:** `phase-2`, `ai-inference`

**Body:**
Add a feature-flagged detector service for potholes, waterlogging, garbage overflow, vehicles, and road blockage. Keep mock processor as default. Document model limitations.

---

### Issue 3 — PostgreSQL schema

**Title:** `Add PostgreSQL schema for events, reviews, jobs, and cameras`  
**Labels:** `phase-2`, `database`

**Body:**
Design database schema for detection events, human reviews, processing jobs, and authorized camera/source metadata. Include migrations and seed data.

---

### Issue 4 — Async video processing API

**Title:** `Add async video processing API`  
**Labels:** `phase-2`, `backend`, `api`

**Body:**
Implement API flow: `POST /videos` creates processing job, worker processes frames, client polls job status, final detections are stored. Keep MVP mock mode intact.

---

### Issue 5 — Face blurring

**Title:** `Add face blurring before evidence persistence`  
**Labels:** `privacy`, `safety`, `phase-5`

**Body:**
Add privacy pipeline for blurring faces before saving evidence frames/clips. This is required before real pilot footage storage.

---

### Issue 6 — Number plate masking

**Title:** `Add number plate masking for advisory mode`  
**Labels:** `privacy`, `safety`, `phase-5`

**Body:**
Mask plates by default in non-enforcement/advisory deployments. No automatic challan workflow.

---

### Issue 7 — Role-based access control

**Title:** `Add role-based access control`  
**Labels:** `security`, `phase-5`

**Body:**
Add viewer, reviewer, and admin roles. Human review actions should require authenticated reviewer/admin role.

---

### Issue 8 — Immutable audit logs

**Title:** `Add immutable audit logs for review actions`  
**Labels:** `security`, `governance`, `phase-5`

**Body:**
Record confirm/reject/field verification actions with timestamp, reviewer, event ID, and reason.

---

### Issue 9 — Work-order routing

**Title:** `Add work-order routing module`  
**Labels:** `phase-4`, `civic-workflow`

**Body:**
Turn confirmed events into department tasks for PWD, sanitation, traffic, drainage, or ward teams.

---

### Issue 10 — Real GIS map

**Title:** `Add real GIS map integration`  
**Labels:** `phase-3`, `maps`

**Body:**
Replace stylized hotspot grid with Mapbox/Leaflet GIS layer. Keep mock fallback for public demo.

---

### Issue 11 — Bengali and Hindi i18n

**Title:** `Add Bengali and Hindi localization`  
**Labels:** `i18n`, `good-first-issue`

**Body:**
Add translation scaffold and translate key dashboard/proposal strings into Bengali and Hindi.

---

### Issue 12 — Mock-to-real processor tests

**Title:** `Add tests for mock-to-real processor swap`  
**Labels:** `tests`, `phase-2`

**Body:**
Add tests that verify mock processor remains default and real inference only runs behind explicit feature flag.

---

### Suggested labels (create once)

```
phase-2, phase-3, phase-4, phase-5, backend, ai-inference, privacy, safety,
security, governance, database, api, maps, i18n, tests, good-first-issue,
civic-workflow, video
```

```bash
gh label create <name> --repo The-Human-Technologist/civic-ai-platform --color "0E8A16" --force
```

---

## Extended backlog

---

### Issue 1.1 — Add YOLO-based object detection pipeline

**Title:** `feat(ai): YOLO-based object detection worker for civic & road-safety classes`

**Labels:** `ai-pipeline`, `advanced`, `phase-2`

**Description:**
Replace `processVideoMock()` with a GPU worker that runs YOLO (or YOLOv8/v11) on sampled video frames and emits `DetectionEvent` records with bounding boxes, class labels, and confidence scores.

**Why it matters:**
The MVP cannot demonstrate real civic value until inference detects potholes, vehicles, waste piles, standing water, and advisory road-safety patterns from actual footage. This is the core Phase 2 deliverable for grants and municipal pilots.

**Suggested implementation:**
- Add `services/inference-worker/` (Python FastAPI or Node + ONNX runtime)
- Model classes: `vehicle`, `motorcycle`, `helmet`, `pothole`, `garbage_pile`, `standing_water`, `person` (for blur only — no ID)
- Sample frames via OpenCV (see Issue 1.2); run batch inference
- Map detections → `DetectionEvent` JSON; POST to `POST /api/v1/detections`
- Keep mock mode when `AI_PROCESSING_MODE=mock`
- Document model weights source, license, and bias evaluation plan in `docs/models.md`

**Difficulty:** `advanced`

---

### Issue 1.2 — Add OpenCV video frame extraction service

**Title:** `feat(ai): OpenCV frame extraction and preprocessing pipeline`

**Labels:** `ai-pipeline`, `medium`, `phase-2`

**Description:**
Build a frame extraction step that reads uploaded MP4/WebM or worker-ingested blobs, samples at configurable FPS (e.g. 1 fps for civic scans), and normalises frames for downstream YOLO inference.

**Why it matters:**
Raw video cannot feed models directly at scale. Consistent preprocessing reduces false positives and standardises worker input across upload and future RTSP sources.

**Suggested implementation:**
- `services/inference-worker/extract_frames.py` using OpenCV `VideoCapture`
- Config: `SAMPLE_FPS`, `MAX_FRAMES_PER_JOB`, ROI masks per camera (JSON)
- Output frames to temp object storage or memory buffer with job metadata
- Hook from `POST /api/v1/videos/process` job queue
- Unit test with a short synthetic test video in `fixtures/` (no real CCTV)

**Difficulty:** `medium`

---

### Issue 1.3 — Add RTSP CCTV stream ingestion adapter

**Title:** `feat(ai): RTSP CCTV stream ingestion for authorised camera feeds`

**Labels:** `ai-pipeline`, `advanced`, `phase-3`

**Description:**
Ingest RTSP URLs from a camera registry, sample frames on a schedule, and enqueue inference jobs — without storing full 24/7 video by default.

**Why it matters:**
Municipalities already operate CCTV. Pilot value requires connecting to **existing authorised feeds**, not only file uploads.

**Suggested implementation:**
- `services/rtsp-ingest/` with reconnect, health heartbeat, and backoff
- Camera registry table: `id`, `rtsp_url`, `ward`, `owner_department`, `sample_fps`, `active`
- Admin UI page (protected) to register feeds — no URLs in git
- Frame → inference queue; store only detection crops/clips after blur (Phase 5)
- Document legal prerequisite: written camera-owner authorization in `docs/deployment/cctv-authorization.md`

**Difficulty:** `advanced`

---

## 2. Privacy and security

---

### Issue 2.1 — Add face blurring before evidence storage

**Title:** `feat(privacy): Blur faces on frames/clips before persistence`

**Labels:** `privacy`, `advanced`, `phase-5`

**Description:**
Apply automatic face blurring to any frame or clip saved as detection evidence **before** write to object storage.

**Why it matters:**
Grant reviewers and DPDP-aligned deployers require demonstrable privacy controls. Storing unblurred faces blocks municipal adoption.

**Suggested implementation:**
- Worker step after detection: face detector (Haar/YOLO-face) → Gaussian blur or pixelation on ROIs
- Blur applied **before** S3/GCS upload; original frame discarded
- Setting: `FACE_BLUR_ENABLED=true` (default on in production profile)
- Visual indicator on review UI: “Faces blurred in stored evidence”
- No facial **recognition** — detection for blur only

**Difficulty:** `advanced`

---

### Issue 2.2 — Add number plate masking for non-enforcement mode

**Title:** `feat(privacy): Mask number plates in advisory / non-enforcement mode`

**Labels:** `privacy`, `medium`, `phase-5`

**Description:**
Detect licence plate regions (OCR bbox or dedicated model) and mask them on exported evidence when the deployment is in **advisory mode** (default).

**Why it matters:**
Plate text is personal data. Masking by default signals non-prosecution posture and supports traffic advisory use cases without ANPR enforcement.

**Suggested implementation:**
- Optional ANPR/OCR bbox model; mask with solid bar or heavy blur
- `NUMBER_PLATE_MASKING=true` in settings API; sync with dashboard toggle
- Export pipeline applies mask before PDF/JSON bundle download
- Log masking action in audit table (Issue 3.3)
- Document: ANPR for prosecution is **out of scope** for this repo

**Difficulty:** `medium`

---

### Issue 2.3 — Add role-based access control (RBAC)

**Title:** `feat(auth): Role-based access control for viewer / reviewer / admin`

**Labels:** `privacy`, `security`, `advanced`, `phase-5`

**Description:**
Introduce authenticated sessions and three roles: **Viewer** (read dashboards), **Reviewer** (confirm/reject events), **Admin** (settings, camera registry, user management).

**Why it matters:**
Production municipal deployments cannot share a single open dashboard. RBAC is required for procurement and security audits.

**Suggested implementation:**
- NextAuth.js or OIDC (municipal SSO adapter stub)
- Middleware on `/dashboard/*` and `/api/*`
- Role checks on review mutations and export endpoints
- Seed roles in DB; no default admin password in repo
- Env: `AUTH_SECRET`, `OIDC_ISSUER` in `.env.example`

**Difficulty:** `advanced`

---

## 3. Municipal workflow

---

### Issue 3.1 — Add work-order assignment module

**Title:** `feat(municipal): Work-order assignment for confirmed detections`

**Labels:** `municipal`, `medium`, `phase-4`

**Description:**
When a reviewer **confirms** an event, allow routing to a departmental work-order: PWD (pothole), Solid Waste, Drainage, Traffic advisory, etc.

**Why it matters:**
Closes the loop from detection → human review → **field action**. Without tickets, the platform is analytics-only.

**Suggested implementation:**
- Tables: `work_orders`, `departments`, `event_work_order_links`
- UI: “Create work order” on confirmed events; department dropdown + notes
- Webhook stub for future municipal ERP integration
- Status: `open` → `assigned` → `in_progress` → `resolved` → `verified`
- No auto-dispatch without human click

**Difficulty:** `medium`

---

### Issue 3.2 — Add department SLA tracking

**Title:** `feat(municipal): SLA timers and escalation for departmental work orders`

**Labels:** `municipal`, `medium`, `phase-4`

**Description:**
Track response SLAs per department and severity (e.g. critical waterlogging: 24h, pothole high: 72h). Show overdue items on dashboard.

**Why it matters:**
MLAs and municipal commissioners care about **resolution time**, not just detection counts. SLA visibility drives accountability.

**Suggested implementation:**
- `sla_policies` table: `department`, `severity`, `target_hours`
- Cron or worker marks `overdue` work orders; badge on dashboard
- Weekly digest email template (optional, no PII in subject lines)
- Pilot report section: “% resolved within SLA”

**Difficulty:** `medium`

---

### Issue 3.3 — Add audit log table for review and export actions

**Title:** `feat(municipal): Immutable audit log for review and export actions`

**Labels:** `municipal`, `privacy`, `security`, `medium`, `phase-5`

**Description:**
Record every review action (confirm, reject, field verify), settings change, and evidence export with actor, timestamp, event ID, and IP hash.

**Why it matters:**
Public-sector software must be auditable for RTI, internal vigilance, and grant compliance. Client-only logs are insufficient.

**Suggested implementation:**
- Table: `audit_logs` (`id`, `actor_id`, `action`, `entity_type`, `entity_id`, `metadata_json`, `created_at`)
- Append-only — no UPDATE/DELETE in application layer
- API middleware logs mutations automatically
- Admin UI: filterable audit viewer (admin role only)
- Export audit CSV for pilot evaluation

**Difficulty:** `medium`

---

## 4. Dashboard and reports

---

### Issue 4.1 — Add PDF export for pilot reports

**Title:** `feat(dashboard): Server-side PDF export for 30-day pilot reports`

**Labels:** `dashboard`, `medium`, `phase-4`

**Description:**
Generate a downloadable PDF from the pilot report page (summary, top areas, breakdown, privacy safeguards) suitable for municipal meetings.

**Why it matters:**
Officials need shareable artifacts beyond browser print. PDF is the lingua franca of ward meetings and district reviews.

**Suggested implementation:**
- API route `GET /api/reports/pilot.pdf` using `@react-pdf/renderer` or Puppeteer print-to-PDF
- Include disclaimer footer on every page (no auto enforcement, mock data flag in MVP)
- Watermark: “DRAFT — DEMO DATA” when `AI_PROCESSING_MODE=mock`
- Button on `/dashboard/reports` next to existing print control

**Difficulty:** `medium`

---

### Issue 4.2 — Add detection log CSV export with privacy filters

**Title:** `feat(dashboard): Export detection log as CSV with privacy-safe fields`

**Labels:** `dashboard`, `good first issue`, `phase-2`

**Description:**
Allow reviewers to export filtered detection events as CSV for spreadsheet analysis — excluding any raw image paths or PII fields.

**Why it matters:**
Ward planners and researchers often work in Excel/Sheets. Export unlocks offline analysis without building custom BI first.

**Suggested implementation:**
- Client-side CSV from event store (MVP) → server-side from PostgreSQL (Phase 2)
- Columns: `event_id`, `type`, `location`, `timestamp`, `severity`, `status`, `confidence`, `reviewed_by`, `reviewed_at`
- No plate text, no face embeddings, no raw video URLs in export
- Button on `/dashboard/events` next to filters

**Difficulty:** `good first issue`

---

## 5. Maps and geospatial features

---

### Issue 5.1 — Add real map integration (Mapbox or Leaflet)

**Title:** `feat(maps): Replace CSS hotspot grid with Mapbox/Leaflet map layer`

**Labels:** `maps`, `medium`, `phase-3`

**Description:**
Integrate an interactive map centred on the pilot municipality with detection hotspots as clustered markers.

**Why it matters:**
Geographic context is essential for engineers and traffic units. The CSS demo map is not credible for production pilots.

**Suggested implementation:**
- `MAP_PROVIDER=mapbox|leaflet` in env; use open tiles or municipal GIS if provided
- Component `HotspotMapLeaflet` replacing stylised grid
- Markers coloured by category; popup: event count, primary type, last seen
- Respect privacy: aggregated markers only, no citizen tracking
- Document tile API key setup in README

**Difficulty:** `medium`

---

### Issue 5.2 — Add ward boundary overlay and geospatial aggregation API

**Title:** `feat(maps): Ward boundary GeoJSON overlay and aggregation endpoint`

**Labels:** `maps`, `advanced`, `phase-6`

**Description:**
Load ward boundary GeoJSON (e.g. Barasat wards 12/14/15) and aggregate confirmed events per ward for choropleth or sidebar stats.

**Why it matters:**
Municipal accountability is **ward-based**. Councillors need ward-scoped views, not only corridor points.

**Suggested implementation:**
- `public/geo/wards-demo.geojson` — synthetic simplified polygons, clearly labelled demo
- API: `GET /api/stats/by-ward?from=&to=`
- Map layer toggle: ward boundaries on/off
- Pilot report: table of ward → event count

**Difficulty:** `advanced`

---

## 6. Deployment and DevOps

---

### Issue 6.1 — Add Docker Compose setup for local full stack

**Title:** `chore(devops): Docker Compose for web app, PostgreSQL, and inference worker`

**Labels:** `devops`, `medium`, `phase-2`

**Description:**
Provide `docker-compose.yml` to run Next.js app, PostgreSQL, Redis (job queue), and optional inference worker with one command.

**Why it matters:**
WEBEL/IT teams and OSS contributors need reproducible environments without manual Node/Python version hunting.

**Suggested implementation:**
- Services: `web`, `db`, `redis`, `worker` (profile `ai`)
- Volume mounts for dev; healthchecks on all services
- `.env.docker.example` documented in README
- `docker compose up` runs MVP in mock mode by default
- CI job: `docker compose build` smoke test

**Difficulty:** `medium`

---

### Issue 6.2 — Add PostgreSQL database support and migration tooling

**Title:** `feat(db): PostgreSQL schema, Prisma/Drizzle migrations, and API persistence`

**Labels:** `devops`, `advanced`, `phase-2`

**Description:**
Move events, reviews, cameras, work orders, and audit logs from localStorage to PostgreSQL with versioned migrations.

**Why it matters:**
Multi-user municipal use requires server-side persistence, backups, and queryable history — browser storage cannot pilot at scale.

**Suggested implementation:**
- Choose ORM (Prisma or Drizzle); schema in `prisma/schema.prisma`
- Tables: `detection_events`, `locations`, `camera_feeds`, `reviews`, `users`
- Replace `event-store.tsx` client writes with SWR/React Query + API routes
- Migration seed script importing synthetic `getSeedEvents()` for demos
- Env: `DATABASE_URL`

**Difficulty:** `advanced`

---

## 7. Documentation

---

### Issue 7.1 — Add sample anonymized dataset format specification

**Title:** `docs: Specification for anonymized detection dataset interchange format`

**Labels:** `documentation`, `medium`, `phase-2`

**Description:**
Document a JSON/JSONL schema for sharing **synthetic or properly anonymized** detection datasets between contributors and pilot partners — without video or PII.

**Why it matters:**
Researchers and grant programs need a standard format to benchmark models and reproduce dashboards without exchanging raw CCTV.

**Suggested implementation:**
- `docs/dataset-format.md` + JSON Schema in `schemas/detection-event.schema.json`
- Example files in `fixtures/datasets/barasaat-demo-2026.jsonl`
- Fields: event metadata, bbox optional, blurred clip URL optional, no plate text
- Validation script: `npm run validate:dataset`
- Cross-link from PRIVACY.md and CONTRIBUTING.md

**Difficulty:** `medium`

---

### Issue 7.2 — Add municipal deployment and CCTV authorization runbook

**Title:** `docs: Municipal deployment runbook and CCTV authorization checklist`

**Labels:** `documentation`, `medium`, `phase-6`

**Description:**
Write a step-by-step runbook for IT departments: hosting, DPIA checklist, camera-owner MoU, reviewer training, and go-live rollback plan.

**Why it matters:**
Software alone does not make a lawful pilot. WEBEL and municipal IT need operational docs for procurement and audit.

**Suggested implementation:**
- `docs/deployment/municipal-runbook.md`
- Sections: legal authorization, network diagram, env vars, backup, retention, incident response
- Checklist template for 30-day pilot sign-off
- Link from `/pilot-proposal` page and README

**Difficulty:** `medium`

---

## 8. Good first issues

---

### Issue 8.1 — Improve accessibility across dashboard and review flows

**Title:** `a11y: Accessibility audit — keyboard nav, ARIA labels, focus order on dashboard`

**Labels:** `good first issue`, `dashboard`, `documentation`

**Description:**
Audit and fix accessibility issues on main flows: landing, dashboard, events table, event review, and settings — targeting WCAG 2.1 AA where practical.

**Why it matters:**
Government software must be usable by all officials and sets a baseline for public-sector procurement accessibility requirements.

**Suggested implementation:**
- Run axe DevTools or Lighthouse on key routes; file findings in issue comments
- Events table: proper `<th scope>`, keyboard row focus, accessible filter labels
- Review page: announce status changes to screen readers (`aria-live`)
- Ensure colour contrast on severity badges and pilot banner
- Document results in `docs/accessibility.md`

**Difficulty:** `good first issue`

---

### Issue 8.2 — Add unit tests for mock AI processor and event seed data

**Title:** `test: Unit tests for processVideoMock() and getSeedEvents()`

**Labels:** `good first issue`, `ai-pipeline`

**Description:**
Add Vitest (or Jest) tests covering mock processor output shape, seed data integrity, and deterministic event IDs.

**Why it matters:**
Tests protect the demo workflow as contributors replace mock AI with real inference. Grant reviewers trust repos with CI green badges.

**Suggested implementation:**
- Install Vitest; `npm run test` in package.json
- Tests: `processor.test.ts` — mock returns 2–5 events, all pending, valid types
- Tests: seed events have unique IDs, valid location keys, confidence 0–1
- GitHub Action: run tests on PR
- Target 80%+ coverage on `src/lib/mock-ai/`

**Difficulty:** `good first issue`

---

## Backlog summary

| # | Title | Category | Difficulty |
|---|-------|----------|------------|
| 1.1 | YOLO object detection pipeline | Real AI | advanced |
| 1.2 | OpenCV frame extraction | Real AI | medium |
| 1.3 | RTSP CCTV ingestion | Real AI | advanced |
| 2.1 | Face blurring before storage | Privacy | advanced |
| 2.2 | Number plate masking | Privacy | medium |
| 2.3 | Role-based access control | Privacy | advanced |
| 3.1 | Work-order assignment | Municipal | medium |
| 3.2 | Department SLA tracking | Municipal | medium |
| 3.3 | Audit log table | Municipal | medium |
| 4.1 | PDF export for reports | Dashboard | medium |
| 4.2 | Detection CSV export | Dashboard | good first issue |
| 5.1 | Real map integration | Maps | medium |
| 5.2 | Ward boundary overlay | Maps | advanced |
| 6.1 | Docker Compose setup | DevOps | medium |
| 6.2 | PostgreSQL support | DevOps | advanced |
| 7.1 | Anonymized dataset format | Documentation | medium |
| 7.2 | Municipal deployment runbook | Documentation | medium |
| 8.1 | Accessibility improvements | Good first issue | good first issue |
| 8.2 | Unit tests for mock processor | Good first issue | good first issue |

**Total: 20 issues**

---

## Suggested GitHub labels (create once)

```
ai-pipeline, privacy, security, municipal, dashboard, maps, devops,
documentation, good first issue, medium, advanced,
phase-2, phase-3, phase-4, phase-5, phase-6
```

## Suggested project board columns

```
Backlog → Good first issue → In progress → Review → Done
```

Link milestones to [ROADMAP.md](../ROADMAP.md) phases when creating the GitHub Project.

---

*Copy issues manually or use `gh issue create --title "..." --body-file issue.md --label "..."`*
