# What is needed to make the AI Civic Platform work in real life?

This note is for **officials, MLAs, municipal teams, and pilot partners**.

## Current status

The public portal is a **working public alpha**, but it still runs in **mock AI mode by default**.

That means:

- the dashboard works
- the review flow works
- the upload page works
- detections are synthetic
- no real CCTV is bundled in the repository
- no facial recognition exists
- no automatic challan exists

## What is already built

- Public website and municipal-facing dashboard
- Upload/demo flow for safe mock scenarios
- Detection log and human review page
- Privacy/disclaimer language
- Data sources policy
- Demo footage library
- Pilot proposal and reports
- Phase 2A scaffolding for jobs, worker APIs, and privacy masking

## What is needed for a real pilot

To move from demo to real pilot, the project needs a separate backend processing system for
**authorized uploaded video only**.

## Authorized footage requirement

Real footage must be:

- authorized in writing
- limited to a defined pilot scope
- stored outside GitHub
- used only for civic operations / advisory review

## Backend video worker

The web app should not process large video files directly.

A separate worker is needed for:

- receiving uploaded-video jobs
- extracting frames
- applying privacy masking
- running computer vision
- saving detections for human review

## Computer vision model

A real pilot needs a detector model for a small set of issues.

Recommended first classes:

1. waterlogging
2. garbage overflow
3. illegal parking / road blockage

These should remain **human-reviewed alerts only**.

## Database and storage

Pilot-ready processing also needs:

- a database for jobs and detections
- secure storage for temporary evidence
- retention controls
- auditability for review actions

## Privacy controls

Before storing real evidence, the system should:

- blur faces
- mask number plates
- enforce limited retention
- keep access restricted to authorized reviewers

This is privacy masking only, **not identity recognition**.

## Human review workflow

Even in a real pilot, the workflow should remain:

- detection appears
- human official reviews it
- official confirms / rejects / asks for field verification
- confirmed issue goes to report or work order

No automatic challan should be added.

## Recommended 30-day pilot scope

Recommended first pilot:

- One road
- One junction
- Authorized uploaded footage only
- Three issue types:
  1. waterlogging
  2. garbage overflow
  3. illegal parking / road blockage
- Human review only
- No automatic challan
- No facial recognition
- No live CCTV in first version

## What we should NOT do initially

- Do not start with city-wide live CCTV
- Do not scrape public camera streams
- Do not add automatic fines
- Do not add facial recognition
- Do not store raw footage in GitHub
- Do not claim production-ready AI before evaluation is complete

## Simple architecture

```text
Authorized uploaded video
↓
Frame extraction
↓
Privacy masking
↓
Computer vision detection
↓
Detection event
↓
Human official review
↓
Report / field verification / work order
```

## Bottom line

The current portal already proves the **workflow and governance model**.

Phase 2A adds the safe foundation for a real pilot, but it does **not** mean real AI is shipped yet.

## Phase 2A.1 processing job API

The upload page can now **create and read processing jobs** through the frontend API foundation.

What this means today:

- synthetic demo scenarios can create mock processing jobs
- local file selection can create a **metadata-only** uploaded-video job
- current public mode remains **metadata/mock only**
- no real video bytes are uploaded yet
- real processing still requires a separate worker deployment and authorized footage

This step is useful because it proves the future workflow:

```text
frontend upload page
→ create processing job
→ worker processes authorized footage later
→ detections come back for human review
```

That workflow is now scaffolded, but not yet production-ready.
