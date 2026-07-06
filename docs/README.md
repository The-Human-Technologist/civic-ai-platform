# Documentation index

Documentation for grant reviewers, civic-tech evaluators, and contributors.

| Document | Audience | Purpose |
|----------|----------|---------|
| [README.md](../README.md) | Everyone | Mission, MVP scope, install, workflow |
| [ROADMAP.md](../ROADMAP.md) | Funders, municipal IT | Phased delivery & honest status |
| [PRIVACY.md](../PRIVACY.md) | Legal, DPO, privacy advocates | Privacy-by-design & MVP limits |
| [SECURITY.md](../SECURITY.md) | Security researchers | Responsible disclosure |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Developers | PR guidelines, Codespaces, student onboarding |
| [docs/architecture.md](architecture.md) | Developers | System diagrams (MVP + Phase 2) |
| [docs/good-first-issues.md](good-first-issues.md) | Students, new contributors | Curated first PR tasks |
| [COPYRIGHT](../COPYRIGHT) | Legal | AGPL & commercial licensing note |
| [src/lib/data/README.md](../src/lib/data/README.md) | Developers | Synthetic sample data policy |
| [screenshots/README.md](screenshots/README.md) | Marketing, grants | Screenshot capture guide (9 required views) |
| [demo-script.md](demo-script.md) | MLA, municipal, OSS reviewers | 90-second live demo script |
| [issues.md](issues.md) | Maintainers, contributors | 20-issue GitHub backlog (copy-paste ready) |

## MVP vs planned (quick reference)

| | MVP (v0.1) | Planned |
|---|------------|---------|
| AI inference | Mock (`processVideoMock`) | YOLO, OpenCV worker |
| Video ingest | Upload + demo cards | RTSP authorised feeds |
| Data store | Browser localStorage | PostgreSQL |
| Tickets | Report export only | Work-order API |
| Privacy controls | UI toggles | Server-enforced blur, mask, retention |

## Key routes (local demo)

| URL | Page |
|-----|------|
| `/` | Landing |
| `/pilot-proposal` | 30-day municipal pilot document |
| `/dashboard` | Operations overview |
| `/dashboard/events` | Detection log |
| `/dashboard/upload` | Mock video processing |
| `/dashboard/reports` | Pilot report |
| `/dashboard/settings` | Privacy settings |
