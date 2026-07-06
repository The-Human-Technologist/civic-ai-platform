# OpenAI Open Source / Codex Support — Application Draft

**Applicant:** Titas Datta  
**Organization:** [The Human Technologist](https://github.com/The-Human-Technologist)  
**Email:** titasdatta78900@gmail.com  
**Project:** AI Civic Operations & Road Safety Intelligence Platform  
**License:** AGPL-3.0-or-later  
**Status:** Public alpha (v0.1) — working demo UI, mock AI only, live on Vercel

---

## 1. Short project description

The **AI Civic Operations & Road Safety Intelligence Platform** is open-source public infrastructure software that helps municipalities and traffic departments turn **existing CCTV and uploaded video** into **human-reviewed civic and road-safety alerts**.

It is designed for **civic intelligence** and **municipal operations analytics** — not covert monitoring or automated punishment. Officials review every detection before any field action, report, or department routing.

The current release is an honest MVP: a full Next.js dashboard with synthetic detections, review workflows, hotspot analytics, and a government-ready 30-day pilot proposal. Real computer-vision inference, RTSP ingest, and production auth are on the roadmap.

---

## 2. Problem being solved

Indian cities and towns already record large volumes of video at junctions, markets, schools, hospitals, and municipal assets. Most of that footage is **watched reactively** — after a complaint, accident, or monsoon crisis — rather than analysed systematically for recurring civic and road-safety patterns.

Agencies face predictable gaps:

| Gap | Impact |
|-----|--------|
| **Potholes & road damage** | Accidents, vehicle damage, delayed PWD repair |
| **Waterlogging** | Monsoon disruption, health risk, traffic paralysis |
| **Solid waste overflow** | Sanitation backlog, blocked drains |
| **Illegal parking & congestion** | Blocked emergency lanes, bus stops, footpaths |
| **Wrong-way & junction risk** | Near-misses near markets and schools |
| **Manual monitoring overload** | Control rooms cannot review every feed continuously |

The bottleneck is not only detection technology — it is the **absence of trustworthy, privacy-first workflows** that turn video signals into **human-reviewed alerts** departments can act on.

---

## 3. Why this is useful for the public

When deployed responsibly (with legal authorization and human oversight), this platform can help the public by:

- **Earlier awareness** of potholes, drainage failure, and waste hotspots before they worsen
- **Faster coordination** between traffic units, PWD, and sanitation departments
- **Advisory road safety analytics** for school zones, market junctions, and congestion corridors
- **Transparent review** — detections are confirmed or rejected by officials, not auto-executed
- **Lower cost pilots** — municipalities can evaluate software and governance before large procurement

The MVP uses **only synthetic sample data** (public Barasat place names, fictional event IDs). It demonstrates workflow and policy posture; it does not process real citizen footage in production today.

---

## 4. Why open source matters for this project

Civic and road-safety software touches public trust. Closed, black-box systems are hard for municipalities, auditors, and researchers to evaluate — especially around privacy boundaries and human-review gates.

Open source matters here because:

1. **Inspectability** — Deployers and contributors can verify there are no hidden enforcement or biometric identification paths.
2. **Reproducibility** — Other districts can fork, adapt, and publish their own pilot evaluations.
3. **Public infrastructure mindset** — Municipal software should not be a permanent vendor lock-in when the underlying need is shared nationally.
4. **Contributor ecosystem** — Civic technologists, traffic engineers, and CV researchers can improve models and integrations without NDAs.
5. **AGPL alignment** — Network-deployed civic dashboards remain auditable; commercial private deployments can pursue separate licensing if needed.

We publish explicit **non-goals** in the repository: no automatic challans, no facial recognition, no legal-grade speed prosecution.

---

## 5. Current MVP status (honest)

**Shipped in v0.1:**

| Area | Status |
|------|--------|
| Landing page & mission positioning | Done |
| Operations dashboard (KPIs, charts) | Done |
| Mock AI processor (`processVideoMock`) | Done — client-side synthetic events |
| Detection log with filters | Done |
| Human review (confirm / reject / field verification) | Done |
| Hotspot map | Done — CSS grid (not GIS yet) |
| Pilot report (print-friendly) | Done |
| 30-day pilot proposal page | Done |
| Privacy settings UI | Done — placeholders, not server-enforced |
| Open-source docs (README, PRIVACY, SECURITY, CONTRIBUTING, ROADMAP) | Done |
| Seed data | 35 synthetic events (`EVT-BRS-2401`–`2435`) |

**Not shipped yet:**

- Real YOLO / OpenCV inference
- RTSP / live CCTV ingest
- PostgreSQL or server-side persistence
- Authentication & role-based access
- Work-order / ticket integrations
- Face blur and plate masking on ingest
- Immutable server audit logs

**Stack:** Next.js 16, TypeScript, Tailwind 4, shadcn/ui, Recharts.  
**Live demo:** https://civic-ai-platform-three.vercel.app  
**Repository:** https://github.com/The-Human-Technologist/civic-ai-platform (default branch: `master`)  
**CI:** GitHub Actions — typecheck, lint, build on every push (passing).

**Footage policy:** The project intentionally does **not** bundle or scrape real CCTV footage. Phase 2 will use licensed public datasets and/or authorized pilot footage. [DATA_SOURCES.md](https://github.com/The-Human-Technologist/civic-ai-platform/blob/master/DATA_SOURCES.md) defines allowed sources, prohibited sources, and contributor privacy rules. The MVP uses mock detections only.

---

## 6. Technical roadmap

| Phase | Focus | Target outcome |
|-------|--------|----------------|
| **1** (current) | Demo dashboard, mock detections, human review UX | **Shipped** |
| **2** | YOLO/OpenCV worker, PostgreSQL, real inference API | Process real uploaded MP4 server-side |
| **3** | RTSP ingest for **authorised** municipal cameras | Sampled frame analysis, health monitoring |
| **4** | Work-order routing & resolution tracking | Confirmed event → department queue → resolved |
| **5** | Privacy hardening | Face blur, plate mask, RBAC, audit logs, retention |
| **6** | 30–90 day municipality pilot | Barasat-style evaluated deployment |
| **7** | Multi-district civic operations view | Bengali/Hindi UI, aggregated analytics |

**Permanent non-goals:** automatic challans, facial recognition, covert cameras, legal-grade speed prosecution, citizen scoring.

---

## 7. How Codex / ChatGPT Pro / API credits would help

I am a solo builder under **The Human Technologist**, shipping public-good civic software from Kolkata. Support would directly accelerate open-source delivery — not a proprietary wrapper.

| Use | How credits help |
|-----|------------------|
| **Phase 2 inference service** | Design and implement the worker API, job queue, and model-evaluation harness with fewer iteration cycles |
| **Test coverage** | Generate and refine tests for mock→real processor swap, review state machine, and API contracts |
| **Documentation** | Maintainer docs, DPIA templates for deployers, Bengali/Hindi i18n scaffolding |
| **Code review passes** | Security and privacy boundary checks before pilot-facing releases |
| **Integration work** | RTSP ingest patterns, FFmpeg pipelines, PostgreSQL schemas — areas where careful, long-context reasoning reduces rework |
| **Contributor onboarding** | Issue triage, `good first issue` guidance, and architecture explanations for external civic-tech contributors |

**What I will not use support for:** marketing copy inflation, features that violate our non-goals, or closed forks that undermine the public AGPL codebase.

A modest API allocation would let me keep building in the open while finishing Phase 2 — the critical jump from demo to real **privacy-first AI** on uploaded footage.

---

## 8. Safety and privacy principles

These are product requirements, not footnotes:

| Principle | Implementation |
|-----------|----------------|
| **Human-reviewed alerts** | Every detection can be confirmed, rejected, or sent for field verification before action |
| **No facial recognition** | Feature absent; remains a documented non-goal |
| **No automatic fines or challans** | No enforcement code paths; advisory speed estimates only |
| **Privacy-first AI** | Planned face blur and plate masking before evidence persistence (Phase 5) |
| **Authorised footage only** | Deployers must obtain legal permission; software does not grant it |
| **Retention limits** | 30-day default in settings UI; server enforcement planned |
| **Synthetic demo data** | MVP uses fictional events and public place names only |
| **Transparent limitations** | README and in-app disclaimers state mock AI clearly |

We align language with **civic intelligence** and **municipal operations** — not surveillance framing.

---

## 9. Who benefits

| Stakeholder | Benefit |
|-------------|---------|
| **Municipalities** | Structured civic issue triage, ward hotspot reports, pilot-ready proposals |
| **Traffic departments** | Advisory road safety analytics for junction and corridor planning |
| **PWD / sanitation / drainage teams** | Earlier, geo-tagged signals after human review |
| **Smart city & transport programs** | Open integration layer for existing CCTV inventory |
| **Schools, hospitals, markets** | Zone safety reviews (with proper authorization) |
| **Civic-tech researchers** | Auditable codebase for privacy-preserving video analytics study |
| **Citizens** | Indirect benefit through faster civic response and safer roads — not through automated penalties |

---

## 10. Why I am building it

I am Titas Datta, 22, a developer from Kolkata building small-business and civic web applications. I have shipped municipal-facing demos (citizen portals, ward-level tools) and seen firsthand how agencies struggle with **reactive** workflows — complaints arrive after damage is done, and control rooms cannot scale human monitoring across hundreds of feeds.

I started this project because:

1. **The workflow gap is real** — Cities have cameras; they lack humane, reviewable analytics pipelines.
2. **Trust must be designed in** — Public-sector AI fails when it ships as a black box with enforcement baked in.
3. **Open source fits the mission** — Civic infrastructure should be inspectable and forkable by other districts.
4. **India needs practical pilots** — A working demo plus honest roadmap is more useful than a pitch deck with no governance model.

I am not claiming production deployment today. I am building the **foundation** — UX, review gates, documentation, and a swappable mock AI module — so municipalities can evaluate **how** they would adopt privacy-first civic intelligence before committing to GPU inference and RTSP integration.

**The Human Technologist** is my working identity for shipping humane, production-minded software for public good.

---

## 11. What I plan to build in the next 3 months

**Month 1 — Open release & pilot materials** *(in progress — Jul 2026)*

- [x] Publish repository publicly on GitHub (`The-Human-Technologist/civic-ai-platform`)
- [x] Deploy live demo on Vercel (https://civic-ai-platform-three.vercel.app)
- [x] GitHub Actions CI (typecheck · lint · build)
- [x] Codespaces / devcontainer for contributors
- [ ] Capture 9 screenshots for `docs/screenshots/` (see capture guide)
- [ ] Record 90-second walkthrough video for reviewers
- [ ] File structured GitHub issues for Phase 2 (from `docs/issues.md`)

**Month 2 — Real inference foundation (Phase 2 start)**

- FFmpeg frame-extraction worker
- YOLO-based detector service for potholes, waste, standing water, vehicles (initial classes)
- PostgreSQL schema: `events`, `reviews`, `jobs`, `cameras`
- REST API: `POST /videos` → async job → poll/webhook
- Replace `processVideoMock()` with feature-flagged real path

**Month 3 — Evaluation & pilot readiness**

- Model evaluation set with precision/recall per class and false-positive budget
- Basic auth scaffold (reviewer role)
- Evidence clip storage with **planned** blur/mask hooks
- Updated pilot proposal with real-processing metrics from test footage (authorised or synthetic driving datasets only)
- First external contributor PRs (i18n, accessibility, tests)

**Success metric for Q1:** A municipality technical reviewer can upload a real MP4, receive server-persisted detections with confidence scores, and complete human review in the same UI — with all non-goals still enforced in code.

---

## 12. Links

| Resource | URL |
|----------|-----|
| **GitHub repository** | https://github.com/The-Human-Technologist/civic-ai-platform |
| **Live demo** | https://civic-ai-platform-three.vercel.app |
| **Demo video (90s)** | *Pending* — `https://youtu.be/YOUR_DEMO_VIDEO_ID` after recording ([demo script](demo-script.md)) |
| **Screenshots** | Pending — [capture guide](screenshots/README.md) · [checklist](screenshots/PLACEHOLDER.md) |
| **Pilot proposal (live)** | https://civic-ai-platform-three.vercel.app/pilot-proposal |
| **Architecture** | https://github.com/The-Human-Technologist/civic-ai-platform/blob/master/docs/architecture.md |
| **Roadmap** | https://github.com/The-Human-Technologist/civic-ai-platform/blob/master/ROADMAP.md |
| **Privacy policy** | https://github.com/The-Human-Technologist/civic-ai-platform/blob/master/PRIVACY.md |
| **Contributing** | https://github.com/The-Human-Technologist/civic-ai-platform/blob/master/CONTRIBUTING.md |

---

## Closing statement

This project asks a narrow, important question: **Can municipalities use existing video responsibly — with human review and privacy-first AI — to run better civic and road safety operations?**

The MVP answers the workflow and governance half honestly — **live and inspectable today**. The next phase needs engineering depth for real inference, persistence, and pilot evaluation. OpenAI support would help a solo open-source maintainer close that gap faster — in public, under AGPL, with clear safety boundaries.

I am committed to honest scope, documented non-goals, and software that serves municipalities and citizens — not automated punishment.

**Titas Datta**
The Human Technologist
titasdatta78900@gmail.com

---

*Public alpha draft — Jul 2026. Record demo video and add screenshots before final OSS program submission.*
