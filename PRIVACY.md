# Privacy Policy & Design Principles

This document describes the **privacy-by-design** intent of the AI Civic Operations & Road Safety Intelligence Platform. It applies to this open-source MVP and guides future production deployments.

> **Not legal advice.** Municipalities and vendors must conduct their own Data Protection Impact Assessment (DPIA) and obtain legal authorization before processing real CCTV in India or any other jurisdiction.

---

## Positioning

This platform is **civic intelligence** and **road safety analytics** — not a surveillance system. It is designed to help authorised officials review **already-captured** video for civic maintenance and advisory safety indicators.

**Grant & pilot evaluators:** See the [README privacy table](README.md#privacy-first-design) for a concise MVP vs planned breakdown.

---

## MVP limitations (important)

- **All detections are mock/demo** — no real computer vision runs in the default build.
- **No facial recognition** — not implemented; UI toggle is locked off.
- **No automatic fines or challans.**
- **No legal-grade speed enforcement** — speed outputs are labelled “estimation (advisory)”.
- Sample data uses **fake event IDs** and **public place names only** — no real individuals.

---

## Core principles

### 1. No facial recognition by default

The MVP does not identify individuals. Production roadmap explicitly excludes biometric identification unless a separate legal and ethical review approves a limited, auditable use case (not planned in this repository).

### 2. Face blurring (planned)

Evidence clips exported from production systems should apply **automatic face blurring** before storage or sharing. MVP shows placeholders only.

### 3. Number plate masking (planned)

In **non-enforcement / advisory mode**, number plates should be masked on evidence exports. ANPR for automatic prosecution is **out of scope** for this project.

### 4. Data minimisation

- Store only frames/clips relevant to a confirmed detection.
- Avoid retaining full 24/7 streams unless legally required and authorised.
- Default retention: **30 days** (configurable in settings UI).

### 5. Human review required

No detection triggers field action, external notification, or enforcement workflow without **explicit human confirmation** by an authorised reviewer.

### 6. Limited retention

Evidence and metadata should be purged after the configured retention window. Production should use automated lifecycle rules on object storage.

### 7. Audit logs (planned)

Production should log: who reviewed each event, action taken, timestamp, and export/download events. MVP toggles represent future behaviour.

### 8. Sample data is fake

| Data type | Status |
|-----------|--------|
| Event IDs (`EVT-BRS-24xx`) | Synthetic |
| Locations (Barasat public roads) | Real place names, fake associations |
| Confidence scores | Randomised demo values |
| Camera labels (`BMC-CAM-01`) | Fictional identifiers |
| Reviewer names | Not stored; “Pilot Reviewer” placeholder |

See `src/lib/data/README.md`.

---

## What we do not collect in the MVP

- No accounts or personal profiles
- No analytics telemetry to third parties (by default)
- No upload of video to any server (processing is client-side mock)
- No cookies beyond what Next.js uses locally in dev

---

## Contributor & researcher obligations

- **Do not** commit real CCTV footage.
- **Do not** add facial recognition or covert tracking features.
- **Do not** integrate automatic prosecution or billing systems.
- Propose privacy controls **before** adding real video processing.

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Data subjects' rights (production)

Deployers must provide mechanisms compliant with applicable law (e.g. India's DPDP Act 2023), which may include:

- Notice that video analytics are in use (where required)
- Access / correction / erasure requests for wrongly retained identifiable data
- Grievance officer contact

This MVP does not process real personal data.

---

## Contact

Privacy questions: open a GitHub issue labelled `privacy` or email **titasdatta78900@gmail.com**.

Security incidents: [SECURITY.md](SECURITY.md).
