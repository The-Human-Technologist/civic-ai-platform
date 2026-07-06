# Roadmap

**AI Civic Operations & Road Safety Intelligence Platform**

This roadmap is written for **grant reviewers**, **municipal IT teams**, and **open-source contributors**. Each phase lists honest delivery status.

| Label | Meaning |
|-------|---------|
| **Shipped (MVP)** | Available in `v0.1` on the default branch |
| **Planned** | Designed, not yet implemented |
| **Non-goal** | Will not be built in this repository |

Full product context: [README.md](README.md)

---

## Phase 1 — Demo dashboard & mock detections **Shipped (MVP)**

**Goal:** Prove the **human-reviewed civic workflow** without real inference or production infra.

| Deliverable | Status |
|-------------|--------|
| Landing page & mission positioning | Shipped |
| Operations dashboard (KPIs, charts) | Shipped |
| Mock AI processor (`processVideoMock`) | Shipped |
| Detection log + filters | Shipped |
| Event review (confirm / reject / field verify) | Shipped |
| Hotspot map (CSS — not GIS) | Shipped |
| Pilot report (print-friendly) | Shipped |
| Pilot proposal page (`/pilot-proposal`) | Shipped |
| Privacy settings UI | Shipped |
| Open-source docs (README, PRIVACY, SECURITY, CONTRIBUTING) | Shipped |
| Synthetic seed data (35 events, Barasat geography) | Shipped |

**Explicitly not in Phase 1:** real CV, RTSP, database, auth, tickets, server audit logs.

---

## Phase 2 — Real AI detection pipeline **Planned**

**Goal:** Replace `src/lib/mock-ai/processor.ts` with a worker-based inference service.

| Work item | Detection types |
|-----------|-----------------|
| FFmpeg frame extraction | All video sources |
| **YOLO** detector service | Vehicles, helmets, waste piles, potholes, standing water |
| **OpenCV** preprocessing | Denoise, ROI masks, motion cues |
| Object tracking (lightweight) | Congestion, near-miss context |
| Speed estimation (advisory) | School zones — labelled non-enforcement |
| Accident / near-miss heuristics | Sudden deceleration, trajectory conflict |
| PostgreSQL schema | `events`, `reviews`, `cameras`, `jobs` |
| REST API | `POST /videos` → async job → webhook/poll |
| Model evaluation set | Precision/recall per class; false-positive budget |

**Env:** `DATABASE_URL`, `AI_PROCESSING_MODE=worker`

**Exit criteria:** Process a real uploaded MP4 and persist detections server-side with confidence scores.

---

## Phase 3 — RTSP / live CCTV integration **Planned**

**Goal:** Sample **authorised** existing municipal & traffic cameras — not deploy new covert sensors.

- RTSP ingest with reconnect & health monitoring
- Camera registry (owner dept, ward, retention class)
- Frame sampling (e.g. 1 fps analyse, not 24/7 full storage)
- Optional ONVIF / edge gateway for low-bandwidth sites

**Prerequisite:** Written camera-owner authorization + network security review.

---

## Phase 4 — Ticket, report & resolution tracking **Planned**

**Goal:** Close the loop from **confirmed** detection → department action → verified resolution.

```
Human-confirmed event → work-order API → department queue → resolved → analytics
```

- Ticket routing (pothole→PWD, waste→SWM, drainage→engineering)
- SLA timers & escalation
- Email/SMS digests to ward officers (**no** auto-challan)
- Resolution status on analytics dashboard
- Export packs for inter-department meetings

---

## Phase 5 — Privacy & security hardening **Planned**

**Goal:** Production trust for public-sector deployment.

| Control | Detail |
|---------|--------|
| **Face blurring** | On ingest / before evidence persistence |
| **Number plate masking** | Default in advisory mode |
| **Role-based access** | Viewer · reviewer · administrator |
| **Audit logs** | Immutable review & export trail |
| **Retention enforcement** | Auto-purge + legal hold flag |
| **Encryption** | TLS + KMS-backed object storage |
| **Auth** | OIDC / municipal SSO |
| **DPIA template** | For deployers (India DPDP & local law) |

**Env:** `AUTH_SECRET`, `STORAGE_PROVIDER`

---

## Phase 6 — Municipality pilot deployment **Planned**

**Goal:** 30–90 day evaluated pilot (template: Barasat / North 24 Parganas).

- One road + one junction scope ([pilot proposal](src/lib/data/pilot-proposal.ts))
- Reviewer training & false-positive tuning workshops
- Weekly stakeholder digest
- Success metrics vs. proposal targets
- Published pilot evaluation report (aggregated, no PII)

---

## Phase 7 — State-level civic operations dashboard **Planned**

**Goal:** Multi-district visibility for transport & smart-city programs.

- Multi-tenant: state → district → municipality → ward
- Cross-region hotspot analytics (aggregated only)
- Bengali + Hindi UI
- Open statistics export (anonymised)
- Monsoon / disaster preparedness overlays

---

## Capability matrix (at a glance)

| Capability | MVP | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|------------|-----|---------|---------|---------|---------|
| Mock detections | Yes | — | — | — | — |
| Real YOLO/OpenCV | — | Yes | Yes | Yes | Yes |
| RTSP CCTV | — | — | Yes | Yes | Yes |
| Human review UI | Yes | Yes | Yes | Yes | Yes |
| Work orders | — | — | — | Yes | Yes |
| Resolution tracking | — | — | — | Yes | Yes |
| Face blur / plate mask | — | — | — | — | Yes |
| RBAC + audit logs | — | — | — | Partial | Yes |

---

## Non-goals (all phases)

- Automatic challan / e-challan integration **Non-goal**
- Facial recognition or biometric identification **Non-goal**
- Covert or undeclared camera deployment **Non-goal**
- Legal-grade speed prosecution **Non-goal**
- Citizen scoring / social credit **Non-goal**

---

## How to influence the roadmap

- Open a [GitHub Issue](https://github.com/The-Human-Technologist/civic-ai-platform/issues) with label `roadmap`
- Municipal partners: describe pilot constraints (wards, camera count, departments)
- AI contributors: propose model benchmarks with **privacy impact** notes

---

*Last aligned with README v0.1 — update both files when phase status changes.*
