# 90-second demo video script

**AI Civic Operations & Road Safety Intelligence Platform**  
**Live URL:** https://civic-ai-platform-three.vercel.app  
**Duration target:** ~90 seconds (hard cap: 2 minutes)  
**Status:** Script ready — **video not recorded yet**

---

## Before you record

- Use **browser full screen** or a clean window (no desktop taskbar).
- Do **not** show bookmarks bar, browser tabs, address bar overlays, personal apps, or private notifications.
- Use the **live demo** above (or `npm run dev` locally if Vercel is down).
- Reset demo data if needed: **Dashboard → Privacy → Reset demo events**.
- Upload finished video as **YouTube unlisted** — add the real link to `docs/openai-oss-application-draft.md` only after recording.

**Honest framing:** Mock AI only · no real CCTV bundled · no facial recognition · no automatic challan · human-reviewed alerts only.

---

## Click path (rehearse once)

```
/  →  /dashboard  →  /dashboard/demo-footage  →
/dashboard/upload?demo=synthetic-barasat-junction  →  (Run Mock Processing)  →
/dashboard/events  →  /dashboard/events/EVT-BRS-2401  →
/dashboard/data-sources  →  /dashboard/settings  →  /pilot-proposal
```

---

## Voiceover script

### 0–10 sec — Landing page

**[Screen: `/`]**

> “This is an open-source **civic operations and road safety intelligence** platform for municipalities in India.
>
> It helps turn **existing CCTV and uploaded video** into **human-reviewed alerts** — not automatic fines and not a surveillance system.”

**Click:** **Live Dashboard Demo**

---

### 10–20 sec — Dashboard

**[Screen: `/dashboard`]**

> “Here’s the **operations overview** for a 30-day pilot corridor in Barasat.
>
> You see detections today, what’s **pending human review**, confirmed items, and corridor indicators — parking, potholes, waterlogging.
>
> **Enforcement mode is off** — this is advisory intelligence only.”

**Point to:** Pilot banner · Pending review · Charts with visible counts

---

### 20–35 sec — Demo Footage Library

**[Screen: `/dashboard/demo-footage`]**

> “The **Demo Footage Library** catalogs **safe synthetic scenarios** — metadata only.
>
> No raw CCTV is bundled in the repository. Stock clips and public datasets are linked for **manual license review** before any real use.”

**Point to:** “Safe for public mock demo” section

---

### 35–50 sec — Upload mock processing

**[Screen: `/dashboard/upload?demo=synthetic-barasat-junction`]**

> “Officials can select a **synthetic junction demo** and run **mock processing**.
>
> In this MVP, detections are **simulated** to show the workflow: upload → analyse → queue for review. Real YOLO inference is planned for Phase 2.”

**Click:** **Run Mock Processing** · wait for “Detections generated”

---

### 50–65 sec — Events / detections

**[Screen: `/dashboard/events`]**

> “Every detection lands in a **review log**. Officers filter by type, status, severity, and location.
>
> Nothing is acted on until a **human reviewer** confirms, rejects, or sends it for field verification.”

**Point to:** Filter bar · mix of pending and confirmed rows

**Click:** **Review** on `EVT-BRS-2401` (or any pending row)

---

### 65–75 sec — Event review

**[Screen: `/dashboard/events/EVT-BRS-2401`]**

> “On the review page, the officer sees location, confidence, AI description, and an evidence placeholder.
>
> They can **confirm**, **reject a false positive**, request **field verification**, or **export a mock JSON report** — still no automatic challan.”

**Point to:** Disclaimer · Reviewer actions · Export evidence report (mock JSON)

---

### 75–85 sec — Data Sources & Privacy

**[Screen: `/dashboard/data-sources` → `/dashboard/settings`]**

> “**Data Sources** spells out what’s allowed — licensed datasets, synthetic demos, authorized pilot footage — and what’s **not**: random CCTV scraping or committing real video to GitHub.
>
> **Privacy settings** show the posture: no facial recognition, human review required, retention limits — toggles are **client-side demo** today, server enforcement is planned.”

**Scroll briefly** on data-sources allowed/not-allowed cards · privacy toggles

---

### 85–90 sec — Pilot proposal

**[Screen: `/pilot-proposal`]**

> “We’ve published a **30-day municipal pilot proposal** — one road, one junction, human review, civic reports, **no enforcement automation**.
>
> The project is **open source under AGPL**. Thank you.”

**End card (optional):** Repo URL + “Mock MVP v0.1 · Human review required”

---

## One-line pitch (if interrupted)

> “Open-source dashboard that turns existing video into **human-reviewed civic alerts** — **no auto fines, no face recognition**, built for 30-day municipal pilots.”

---

## After recording

1. Upload to **YouTube (unlisted)**.
2. Paste the real URL into `docs/openai-oss-application-draft.md` (replace `YOUR_DEMO_VIDEO_ID` placeholder).
3. Check off the item in [openai-submission-checklist.md](openai-submission-checklist.md).

---

## Related docs

- [Screenshot capture guide](screenshots/README.md)
- [OpenAI submission checklist](openai-submission-checklist.md)
- [QA audit](qa-audit.md)
- [README](../README.md)
