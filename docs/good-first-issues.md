# Good first issues

Curated tasks for **students and new contributors**. Each item is scoped for a first PR, respects privacy boundaries, and does not require production secrets.

Pick one, comment on the issue that you are working on it, and read [CONTRIBUTING.md](../CONTRIBUTING.md) first.

---

## Documentation & onboarding

| Issue | Skill level | Description |
|-------|-------------|-------------|
| Add screenshots to `docs/screenshots/` | Beginner | Run the app locally, capture 9 views per [screenshots/README.md](screenshots/README.md) |
| Fix a typo in pilot proposal copy | Beginner | `src/lib/data/pilot-proposal.ts` or `/pilot-proposal` page |
| Improve Codespaces troubleshooting | Beginner | Add FAQ to README if you hit setup issues |
| Bengali UI strings (landing) | Intermediate | Start i18n with a small `messages/bn.json` pattern |

---

## Accessibility & UX

| Issue | Skill level | Description |
|-------|-------------|-------------|
| ARIA labels on events table | Beginner | `src/app/dashboard/events/page.tsx` — filters and table |
| Keyboard navigation for dashboard nav | Intermediate | `src/components/dashboard/` sidebar |
| Focus styles on review buttons | Beginner | Event review page confirm/reject actions |
| Skip link on landing page | Beginner | `src/app/page.tsx` — “Skip to main content” |
| Chart colour contrast (dark mode) | Intermediate | `src/components/dashboard/charts.tsx` |

---

## Tests & quality

| Issue | Skill level | Description |
|-------|-------------|-------------|
| Unit tests for `getSeedEvents()` | Intermediate | Assert 35 events, valid IDs `EVT-BRS-*` |
| Unit tests for `processVideoMock()` | Intermediate | Returns events with confidence 0–1 |
| CSV export of detection log | Intermediate | Client-side export, synthetic data only |
| Add `npm run typecheck` to contributor docs | Beginner | Already in CI — ensure CONTRIBUTING mentions it |

---

## Dashboard features (MVP-safe)

| Issue | Skill level | Description |
|-------|-------------|-------------|
| Empty state on events table | Beginner | Friendly message when filters match zero rows |
| Copy event ID button | Beginner | Clipboard helper on event review page |
| Print stylesheet polish | Intermediate | `src/app/dashboard/reports/page.tsx` |
| Hotspot map legend | Beginner | Explain severity colours on map page |

---

## Phase 2 prep (stretch — discuss in issue first)

| Issue | Skill level | Description |
|-------|-------------|-------------|
| PostgreSQL schema sketch | Intermediate | `docs/schema-phase2.md` — events, reviews, jobs |
| OpenAPI stub for `POST /videos` | Advanced | Document future worker contract only |
| Feature flag wrapper for mock vs worker | Intermediate | Env `AI_PROCESSING_MODE` plumbing |

---

## How to claim an issue

1. Open a [GitHub Issue](https://github.com/The-Human-Technologist/civic-ai-platform/issues) using the **Good first issue** template.
2. Paste the task title from this doc.
3. Comment: *“I’d like to work on this.”*
4. Fork → branch → PR. CI must pass (typecheck, lint, build).

**Full backlog (20 issues):** [issues.md](issues.md)

---

## What we will not accept as “good first” work

- Facial recognition or biometric features
- Automatic challan / fine integration
- Real CCTV footage in the repository
- Removing human-review gates or MVP disclaimers
