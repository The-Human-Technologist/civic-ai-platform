# 90-second demo script

**AI Civic Operations & Road Safety Intelligence Platform**
*For MLA briefings · municipal & traffic officers · WEBEL/IT · open-source program reviewers*

**Duration:** ~90 seconds spoken · ~2 minutes with clicks
**Prerequisites:** `npm run dev` → http://localhost:3000 · reset demo data if needed (Settings → Reset demo events)

---

## Audience note (say internally, not aloud)

| Viewer | Emphasise |
|--------|-----------|
| **MLA / elected rep** | Constituency service, faster civic response, no surveillance |
| **Municipal officer** | Potholes, waste, drainage — human-confirmed tickets |
| **Traffic officer** | Advisory road safety only — **no auto challan** |
| **WEBEL / IT** | Open stack, AGPL, Phase 2 API/RTSP path |
| **Open-source reviewer** | Honest MVP scope, mock AI, privacy architecture |

---

## Script

### [0:00 – 0:15] Introduce the project

**[Screen: Landing page — `/`]**

> “This is an open-source **civic operations and road safety intelligence** platform — built for municipalities and traffic departments in India.
>
> It uses **CCTV and video footage you already have** to surface potholes, waterlogging, illegal parking, congestion, and advisory safety events.
>
> It is **not a surveillance system** and **does not issue automatic fines**. Every alert goes to a **human reviewer** first.”

**Click:** **Live Dashboard Demo**

---

### [0:15 – 0:30] Show dashboard

**[Screen: Dashboard — `/dashboard`]**

> “This is the **operations overview** for a 30-day pilot — here, the Barasat corridor: Colony More Junction and Station Road.
>
> You see detections today, what’s **pending official review**, what’s confirmed, and corridor indicators — parking, potholes, waterlogging.
>
> Note **enforcement mode is off** — this is decision support, not auto prosecution.”

**Point to:** Pilot banner · Pending review count · “Enforcement mode: Off”

---

### [0:30 – 0:45] Show mock detection

**[Screen: Video & Feeds — `/dashboard/upload`]**

> “Officials can upload a clip or select a **demo CCTV feed** — for example, Colony More Junction from traffic police inventory.
>
> The system runs **video analytics** — in this MVP, mock processing that shows the real workflow: upload, analyse, generate detection events for review.”

**Click:** **Run demo analysis** on Colony More Junction
**Wait:** Progress completes (~3 seconds)

> “In production, this connects to YOLO and OpenCV workers — the architecture is ready; this demo uses synthetic output.”

**Click:** **Review new detections** (or sidebar → Detections)

---

### [0:45 – 1:00] Show human review

**[Screen: Events table — `/dashboard/events` → open EVT-BRS-2402 or any Pending row → Review]**

> “Every detection lands in a **review queue**. Filters by type, severity, location, and status.
>
> An authorised officer opens an event — sees location, confidence, AI description, and evidence placeholder. They **confirm**, **reject as false positive**, or **send for field verification**.
>
> No challan, no court notice — only **assisted review**.”

**[Screen: Event review — `/dashboard/events/EVT-BRS-2402`]**

**Point to:** Disclaimer banner · Confirm / Reject buttons

---

### [1:00 – 1:15] Show report

**[Screen: Reports — `/dashboard/reports`]**

> “Confirmed patterns roll into a **30-day pilot report** — top problem areas, event breakdown, suggested interventions for PWD, sanitation, and drainage.
>
> This is what you bring to a **ward meeting or district review** — printable, shareable, audit-friendly.”

**Scroll briefly:** Top 5 problem areas · Review statistics

---

### [1:15 – 1:25] Explain privacy safeguards

**[Screen: Privacy — `/dashboard/settings`]**

> “Privacy is built in: **no facial recognition**, face blurring and plate masking planned, **human review required**, limited retention, audit logs in production.
>
> All data in this demo is **synthetic** — fake event IDs, public road names only.”

**Point to:** MVP limitations list · Facial recognition disabled toggle

---

### [1:25 – 1:30] End with pilot proposal

**[Screen: Pilot proposal — `/pilot-proposal`]**

> “We’ve published a full **30-day pilot proposal** — one road, one junction, uploaded footage, human review, civic reports, **no enforcement automation**.
>
> The codebase is **open source under AGPL** — municipalities, WEBEL, and civic-tech partners can evaluate, contribute, and pilot without vendor lock-in.
>
> Thank you — happy to walk through technical architecture or Phase 2 RTSP and real AI integration.”

**Optional pause on:** Objective + one-road/one-junction card

---

## One-line elevator pitch (if interrupted at 15 seconds)

> “Open-source dashboard that turns existing CCTV into **human-reviewed civic and road-safety alerts** — potholes to congestion — **no auto fines, no face recognition**, built for 30-day municipal pilots.”

---

## Q&A prep (short answers)

| Question | Answer |
|----------|--------|
| “Is this live on Barasat CCTV?” | “This release is a **demo with mock detections**. Phase 3 adds authorised RTSP feeds after MoU and legal review.” |
| “Will it issue challans?” | “**No.** Explicit non-goal. Advisory analytics + human review only.” |
| “Facial recognition?” | “**Not implemented.** Disabled by design. Blur on evidence planned.” |
| “Who owns the data?” | “Deploying municipality, under their DPIA and retention policy. We provide software, not a data broker.” |
| “Cost?” | “Open source. Pilot infra cost depends on camera count and GPU — Phase 2 estimate after scope sign-off.” |
| “WEBEL role?” | “Hosting, security audit, integration with state smart-city stack — we document APIs for that path.” |

---

## Demo run-of-show (click order)

```
/  →  /dashboard  →  /dashboard/upload  →  (run demo)  →
/dashboard/events  →  /dashboard/events/EVT-BRS-2402  →
/dashboard/reports  →  /dashboard/settings  →  /pilot-proposal
```

**Total navigation:** 7 pages · rehearse once for timing.

---

## Recording tips (GitHub / grant video)

- Record at **1440×900**, 30fps
- Use system cursor highlighting if available
- Narrate the script; avoid background music
- End card: repository URL + “AGPL-3.0 · Mock MVP v0.1”
- Attach screenshots from [screenshots/README.md](screenshots/README.md) to the application form

---

## Related docs

- [Screenshot capture guide](screenshots/README.md)
- [Pilot proposal (live page)](http://localhost:3000/pilot-proposal)
- [README — mission & MVP scope](../README.md)
- [PRIVACY.md](../PRIVACY.md)
