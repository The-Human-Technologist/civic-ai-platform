# Screenshot capture guide

Public presentation materials for GitHub, grant applications, civic-tech reviews, and open-source program submissions.

## Before you start

```bash
cd civic-ai-platform
npm install
npm run dev
```

Open **http://localhost:3000** in Chrome (or your default browser).

### Prep checklist

- [ ] **Hard refresh** (`Ctrl+Shift+R`) so seed data loads (`civic-ai-events-v2` in localStorage)
- [ ] Or open **Dashboard → Privacy → Reset demo events** for a clean dataset
- [ ] Use **desktop viewport 1440×900** unless noted (DevTools → responsive mode)
- [ ] Use **light mode** (default) for government PDFs
- [ ] Hide browser bookmarks bar for cleaner captures
- [ ] **Never** screenshot real CCTV, faces, or number plates — mock UI only

Save all files as **PNG** in this folder (`docs/screenshots/`).

---

## 1. Landing page

| Field | Detail |
|-------|--------|
| **Open** | `http://localhost:3000/` |
| **State / data** | Hero visible with “North 24 Parganas · Barasat Municipality Pilot” badge; mission paragraph; **Read Pilot Proposal** and **Live Dashboard Demo** buttons; pilot snapshot card showing detection counts |
| **Scroll** | Capture from top through hero + snapshot card (no need for full page) |
| **Proves to viewer** | This is a **civic intelligence** product for municipalities — not surveillance; privacy-first positioning; professional government pitch |
| **Filename** | `landing.png` |

---

## 2. Dashboard overview

| Field | Detail |
|-------|--------|
| **Open** | `http://localhost:3000/dashboard` |
| **State / data** | Blue **Live Pilot Demo** banner (Colony More + Station Road corridor); **Operations Overview** heading; status strip (“Week 2 — Active”, review %, CCTV feeds, “Enforcement mode: Off”); KPI cards with non-zero numbers (Pending review, Confirmed, etc.); at least one chart visible if possible |
| **Scroll** | Include banner + first two stat rows + top of charts |
| **Proves to viewer** | Municipal **operations command centre** with human-review queue, corridor metrics, and honest “advisory only” enforcement mode |
| **Filename** | `dashboard.png` |

---

## 3. Video upload / demo processing

| Field | Detail |
|-------|--------|
| **Open** | `http://localhost:3000/dashboard/upload` |
| **State / data** | Either **(A)** progress bar at “Detections generated” after clicking **Run demo analysis** on **Colony More Junction**, or **(B)** completed state with “Analyzed N frames… X events queued for review” + three demo feed cards visible |
| **Action** | Click **Run demo analysis** on Colony More → wait ~3s → capture when stage shows complete |
| **Proves to viewer** | Works with **existing/uploaded video**; AI pipeline UX (upload → process → detections); Barasat-named demo feeds; no claim of live RTSP yet |
| **Filename** | `video-upload-demo.png` |

---

## 4. Events table

| Field | Detail |
|-------|--------|
| **Open** | `http://localhost:3000/dashboard/events` |
| **State / data** | Full table with multiple rows; mix of statuses (Pending, Confirmed, Rejected); filter bar visible; event IDs like `EVT-BRS-2401`; Barasat location names (Station Road, Colony More, Nabapally) |
| **Optional** | Set filter **Status → Pending Review** to show queue depth |
| **Proves to viewer** | Structured **detection log** officials can filter and audit; synthetic but realistic civic + road-safety event types |
| **Filename** | `events-table.png` |

---

## 5. Event review page

| Field | Detail |
|-------|--------|
| **Open** | `http://localhost:3000/dashboard/events/EVT-BRS-2402` |
| **Alternative** | Any **Pending** event — EVT-BRS-2402 is Colony More congestion (high severity) |
| **State / data** | Red **Assisted review only** disclaimer; event details (location, timestamp, severity, confidence); AI description; evidence clip placeholder; reviewer action buttons: **Confirm**, **Reject false positive**, **Field verification**, **Export evidence report** |
| **Proves to viewer** | **Human review gate** — no auto fine/challan; official must confirm before action; evidence workflow |
| **Filename** | `event-review.png` |

---

## 6. Hotspot / map page

| Field | Detail |
|-------|--------|
| **Open** | `http://localhost:3000/dashboard/map` |
| **State / data** | “Barasat Hotspot Map” card; stylized map with coloured intensity markers; list below showing zones (illegal parking, accident-prone, pothole cluster, waterlogging, congestion junction) with event counts |
| **Proves to viewer** | **Geographic prioritisation** for ward engineers and traffic units; pilot corridor hotspot clustering (MVP map — not production GIS) |
| **Filename** | `hotspot-map.png` |

---

## 7. Reports page

| Field | Detail |
|-------|--------|
| **Open** | `http://localhost:3000/dashboard/reports` |
| **State / data** | “30-Day AI Civic & Road Safety Pilot Report” header; executive summary; total events badge; **Top 5 problem areas** list; event breakdown visible |
| **Scroll** | Capture report header through top problem areas (Print button visible in top-right is good) |
| **Proves to viewer** | **Department-ready reporting** for municipal meetings — aggregations, interventions, review stats |
| **Filename** | `report.png` |

---

## 8. Privacy / settings page

| Field | Detail |
|-------|--------|
| **Open** | `http://localhost:3000/dashboard/settings` |
| **State / data** | **Open-source MVP limitations** alert (no face recognition, no auto fines, mock data); **Not a surveillance system** banner; privacy toggles (face blurring planned, plate masking, audit logs, human review required, facial recognition disabled); retention days field |
| **Proves to viewer** | **Privacy-by-design** defaults for grant reviewers and DPOs; honest MVP scope |
| **Filename** | `privacy.png` |

---

## 9. Pilot proposal page

| Field | Detail |
|-------|--------|
| **Open** | `http://localhost:3000/pilot-proposal` |
| **State / data** | Title “30-Day AI Civic & Road Safety Analytics Pilot”; reference badge `WB-N24-BRS-2026-01`; **Objective** section + start of **Scope** or **One-road / one-junction** card (Colony More + Station Road) |
| **Scroll** | Hero + objective + pilot site card — departments/timeline optional for a second screenshot |
| **Proves to viewer** | **30-day municipal pilot** template — one road, one junction, human review, no enforcement automation; ready for MLA / WEBEL conversation |
| **Filename** | `pilot-proposal.png` |

---

## Quick reference table

| # | Filename | URL |
|---|----------|-----|
| 1 | `landing.png` | `/` |
| 2 | `dashboard.png` | `/dashboard` |
| 3 | `video-upload-demo.png` | `/dashboard/upload` (after demo run) |
| 4 | `events-table.png` | `/dashboard/events` |
| 5 | `event-review.png` | `/dashboard/events/EVT-BRS-2402` |
| 6 | `hotspot-map.png` | `/dashboard/map` |
| 7 | `report.png` | `/dashboard/reports` |
| 8 | `privacy.png` | `/dashboard/settings` |
| 9 | `pilot-proposal.png` | `/pilot-proposal` |

---

## Optional bonus captures

| Filename | Purpose |
|----------|---------|
| `dashboard-mobile.png` | `/dashboard` at 390px width — mobile responsiveness |
| `pilot-proposal-timeline.png` | `/pilot-proposal` scrolled to 30-day timeline + success metrics |

---

## After capture

1. Add files to `docs/screenshots/` and commit to git
2. Update image links in [README.md](../../README.md)
3. Rehearse walkthrough using [demo-script.md](../demo-script.md)
4. For live demos: keep `npm run dev` running; use the same event IDs above for consistency

---

## What not to capture

- Real CCTV stills or uploaded personal videos
- Browser windows with passwords, tokens, or `.env` contents
- Error states unless documenting a known issue for a bug report
