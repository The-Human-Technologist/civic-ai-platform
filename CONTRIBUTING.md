# Contributing to Civic AI Platform

Thank you for helping build **open-source civic intelligence** for municipalities and traffic departments. This project prioritises **privacy, human review, and responsible deployment** over feature velocity.

**Maintainer:** [The Human Technologist](https://github.com/The-Human-Technologist) · titasdatta78900@gmail.com

---

## For student contributors (GitHub Education)

New to open source? This repo is built for you.

### Fastest path: GitHub Codespaces

1. Fork [The-Human-Technologist/civic-ai-platform](https://github.com/The-Human-Technologist/civic-ai-platform)
2. On your fork: **Code → Codespaces → Create codespace on main**
3. Terminal: `npm run dev` → open port **3000**
4. Pick a **Beginner** task from [docs/good-first-issues.md](docs/good-first-issues.md)
5. Before pushing:

   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```

**Student Pack benefits that pair well with this repo:**

| Benefit | Use for |
|---------|---------|
| **Codespaces** | Dev environment without installing Node |
| **GitHub Pro** | Actions CI on your fork, branch protection |
| **Copilot** (optional) | Learning aid — always review generated code |
| **Vercel** | Deploy your fork for a portfolio demo URL |

Claim benefits: [education.github.com/pack](https://education.github.com/pack)

### What makes a good student PR

- One focused change (e.g. one accessibility fix, one doc page)
- CI green (GitHub Actions runs automatically)
- No real CCTV footage or personal data
- Civic-intelligence language — not surveillance framing

---

## Before you start

1. Read [README.md](README.md) (mission & MVP scope), [PRIVACY.md](PRIVACY.md), and [SECURITY.md](SECURITY.md).
2. Understand that this MVP uses **mock detections only** — do not wire real enforcement systems in contributions without explicit maintainer discussion.
3. Never commit secrets, real CCTV footage, or identifiable personal data.

---

## Local setup

```bash
git clone https://github.com/The-Human-Technologist/civic-ai-platform.git
cd civic-ai-platform
npm install
cp .env.example .env.local   # optional
npm run dev
```

**Prefer zero install?** Use [GitHub Codespaces](README.md#github-codespaces-zero-install) (`.devcontainer/` included).

Verify:

```bash
npm run typecheck
npm run build
npm run lint
```

Open http://localhost:3000 and http://localhost:3000/dashboard.

---

## Creating issues

Use GitHub Issues with the appropriate template:

| Template | Use when |
|----------|----------|
| Bug report | Something breaks in install, build, or UI |
| Feature request | New capability (especially civic/road-safety modules) |
| Good first issue | Small, scoped tasks for new contributors |

**Include:** OS, Node version, steps to reproduce, expected vs actual behaviour, screenshots if UI-related.

**Do not** file public issues for security vulnerabilities — see [SECURITY.md](SECURITY.md).

---

## Submitting pull requests

1. Fork the repository and create a branch: `feat/short-description` or `fix/short-description`.
2. Keep PRs **focused** — one concern per PR when possible.
3. Run `npm run typecheck`, `npm run build`, and `npm run lint` before pushing.
4. Update documentation if you change behaviour, env vars, or architecture.
5. Fill out the PR template completely.
6. Wait for maintainer review.

### PR checklist

- [ ] Typecheck passes (`npm run typecheck`)
- [ ] Builds without errors (`npm run build`)
- [ ] No secrets or real personal data
- [ ] No real CCTV uploads in repo
- [ ] Copy uses civic-intelligence language (not surveillance framing)
- [ ] Disclaimers preserved for MVP limitations
- [ ] Comments added at real AI integration points if touching `mock-ai/`

---

## Code style

| Area | Convention |
|------|------------|
| Language | TypeScript strict mode |
| Framework | Next.js App Router patterns |
| UI | Tailwind + shadcn/ui; reuse existing components |
| Imports | Top of file only (no inline imports) |
| Naming | `camelCase` functions, `PascalCase` components, `kebab-case` files in `app/` |
| Types | Shared types in `src/types/` |
| Mock AI | Keep synthetic logic in `src/lib/mock-ai/` only |

Run ESLint via `npm run lint`. Match surrounding code style — avoid drive-by refactors.

---

## Good first issue ideas

**Curated list:** [docs/good-first-issues.md](docs/good-first-issues.md)
**Full backlog (20 issues):** [docs/issues.md](docs/issues.md)

Quick picks:

- Add Bengali (`bn`) or Hindi (`hi`) UI strings for landing/dashboard
- Improve accessibility (ARIA labels, keyboard nav on event table)
- Unit tests for `getSeedEvents()` and `processVideoMock()`
- Add `docs/screenshots/` images after running the app
- Export detection log as CSV (client-side, fake data only)
- Dark mode polish for dashboard charts
- Document PostgreSQL schema sketch in `docs/`
- Fix typos in pilot proposal copy

---

## Safety & privacy contribution rules

**Required for all contributors:**

1. **No facial recognition features** unless explicitly approved in a maintainer RFC with legal review notes.
2. **No automatic fine/challan integration** in this repository.
3. **No real CCTV footage** in commits, issues, or PRs — use synthetic demo only.
4. **Blur/mask before storage** must be the default design for any real-video feature proposals.
5. **Human review gate** must remain in the workflow for any detection → action path.
6. Label advisory outputs clearly (e.g. “speed estimation”, not “speed violation”).
7. If adding location data, use **public place names only** — no home addresses or private CCTV IDs tied to individuals.

Violations may result in PR closure without merge.

---

## Architecture notes for contributors

| Path | Purpose |
|------|---------|
| `src/lib/mock-ai/processor.ts` | Synthetic AI — replace in Phase 2 |
| `src/lib/data/event-store.tsx` | Client store → future API layer |
| `src/types/index.ts` | Core domain types |
| `src/lib/data/locations.ts` | Demo geography (Barasat pilot) |

**Diagrams:** [docs/architecture.md](docs/architecture.md)

Search `REAL AI INTEGRATION` in the codebase for extension points.

---

## Code of conduct

Be respectful. This project serves public institutions and citizens. Harassment, discrimination, or dismissive behaviour toward privacy/safety concerns is not tolerated.

---

## Questions?

Open a GitHub Discussion or issue labelled `question`. For security: [SECURITY.md](SECURITY.md). Email: titasdatta78900@gmail.com
