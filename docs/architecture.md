# Architecture

High-level view of the **AI Civic Operations & Road Safety Intelligence Platform** (MVP v0.1).
For phased delivery detail, see [ROADMAP.md](../ROADMAP.md).

---

## System overview (MVP)

```mermaid
flowchart TB
  subgraph Browser["Browser (Next.js 16 App Router)"]
    LP["Landing / Pilot proposal"]
    DB["Dashboard pages"]
    REV["Event review UI"]
    LP --> DB
    DB --> REV
  end

  subgraph ClientState["Client state"]
    ES["EventStoreProvider<br/>React Context"]
    LS[("localStorage<br/>civic-ai-events-v2")]
    ES <--> LS
  end

  subgraph MockAI["Mock AI (MVP only)"]
    UP["Upload / demo feed UX"]
    PROC["processVideoMock()"]
    SEED["getSeedEvents() — 35 synthetic events"]
    UP --> PROC
    SEED --> ES
    PROC --> ES
  end

  DB --> ES
  REV --> ES
  UP --> DB

  style MockAI fill:#fef3c7,stroke:#d97706
  style ClientState fill:#e0f2fe,stroke:#0284c7
```

**Key idea:** The MVP runs entirely in the browser. Detections are **synthetic**; officials still use the real **human review** workflow (confirm / reject / field verify).

---

## Request & data flow (upload path)

```mermaid
sequenceDiagram
  participant User as Reviewer
  participant UI as Upload page
  participant Mock as mock-ai/processor
  participant Store as event-store
  participant LS as localStorage

  User->>UI: Select video or demo feed
  UI->>Mock: simulateUploadProgress()
  Mock->>Mock: processVideoMock()
  Mock-->>Store: DetectionEvent[]
  Store->>LS: persist events + settings
  Store-->>UI: hydrated state
  User->>UI: Open /dashboard/events
  User->>UI: Review single event
  UI->>Store: updateEventStatus()
  Store->>LS: save review disposition
```

---

## Planned architecture (Phase 2+)

```mermaid
flowchart LR
  subgraph Ingest["Ingest"]
    RTSP["RTSP cameras<br/>(authorised)"]
    MP4["Video upload"]
  end

  subgraph Worker["Inference worker"]
    FF["FFmpeg frames"]
    YOLO["YOLO / OpenCV"]
    FF --> YOLO
  end

  subgraph API["API layer"]
    REST["REST / jobs API"]
    PG[("PostgreSQL")]
    REST --> PG
  end

  subgraph App["Next.js app"]
    DASH["Dashboard"]
    REV2["Human review"]
  end

  RTSP --> FF
  MP4 --> FF
  YOLO --> REST
  DASH --> REST
  REV2 --> REST

  style Worker fill:#fef3c7,stroke:#d97706
  style API fill:#dcfce7,stroke:#16a34a
```

Phase 2 replaces `processVideoMock()` with a swappable worker behind `AI_PROCESSING_MODE=worker`. Search the codebase for **`REAL AI INTEGRATION`** for hook points.

---

## Layer responsibilities

| Layer | Path | Responsibility |
|-------|------|----------------|
| **Routes** | `src/app/` | Pages, layouts, metadata, OG image |
| **UI components** | `src/components/` | Dashboard widgets, layout, shadcn/ui |
| **Domain types** | `src/types/` | `DetectionEvent`, `ReviewStatus`, event enums |
| **Mock AI** | `src/lib/mock-ai/` | Synthetic inference — **replace in Phase 2** |
| **Data & state** | `src/lib/data/` | Event store, Barasat locations, pilot copy |
| **Constants** | `src/lib/constants.ts` | Labels, disclaimers, platform name |
| **CI** | `.github/workflows/ci.yml` | typecheck, lint, build on every PR |

---

## Human review gate (non-negotiable)

Every detection path must pass through official review before any external action:

```
AI signal → pending → confirmed | rejected | needs_field_verification
```

No branch bypasses this gate for enforcement, ticketing, or prosecution in this repository.

---

## Related docs

- [README.md](../README.md) — install & quick start
- [CONTRIBUTING.md](../CONTRIBUTING.md) — student & contributor guide
- [src/lib/data/README.md](../src/lib/data/README.md) — synthetic data policy
