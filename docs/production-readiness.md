# Production readiness status

This document separates what is usable in the public alpha from what must be completed before any
municipal pilot or production deployment.

## Current release

The repository is a **working public alpha and pilot-workflow demonstration**. Mock processing,
job metadata, authorized-footage intake metadata, dashboards, and human-review UX are functional.
Mock/worker demo detections can be routed into the review queue.

It is **not** a production surveillance or enforcement system. Public video uploads, live CCTV,
facial recognition, citizen identification, automatic challans, and automatic legal action remain
disabled or explicit non-goals.

## Readiness gates

| Gate | Status | What remains |
|---|---|---|
| Public demo UX | Ready | Continue accessibility and browser regression testing |
| Synthetic processing jobs | Ready | Use only non-sensitive demo inputs |
| Human-review workflow | Demo-ready | Move review decisions from localStorage to authenticated server storage |
| Authorized-footage intake | Metadata-ready | Legal review, authenticated roles, approval evidence storage |
| Controlled object storage | Disabled | KMS-backed bucket, short-lived signing, malware/media validation, deletion jobs |
| Frame extraction | Utility implemented | Wire only inside an isolated worker after storage and auth gates pass |
| Privacy masking | Fail-closed utility implemented | Add evaluated face/plate region detectors and verify masking before persistence |
| Civic detection | Mock only | Select, license, evaluate, and document models per civic class |
| Queue/retries | Not ready | Add durable queue, idempotency, leases, retries, dead-letter handling |
| Authentication/RBAC | Not ready | Municipal OIDC/SSO, reviewer/admin roles, session controls |
| Audit/retention | Not ready | Immutable review/export audit and automatic retention deletion |
| Security/legal | Not ready | Threat model, DPIA, penetration test, incident response, local legal approval |
| Live CCTV/RTSP | Out of scope for first pilot | Requires separate authorization and network/security review |

## Minimum safe pilot sequence

1. Approve one road/junction, three civic classes, retention period, and named reviewers in writing.
2. Deploy authenticated database, object storage, queue, and isolated worker in a non-public environment.
3. Process a small authorized clip set; mask privacy regions before any evidence is persisted.
4. Measure class-level precision/recall and false-positive rate with human reviewers.
5. Run a security/privacy review and verify automatic evidence deletion.
6. Only then operate a time-boxed uploaded-footage pilot. Do not add automatic enforcement.

## Acceptance evidence required before production

- written data-controller and camera-owner authorization
- model cards, licences, dataset provenance, and per-class evaluation results
- masking quality test results, including failure-path tests
- authentication, access review, and audit-log evidence
- retention/deletion test evidence and incident-response contacts
- operational runbook, monitoring, backup/restore, and rollback exercise
- signed pilot success criteria and independent legal/privacy review
