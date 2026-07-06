# OpenAI OSS / Codex support — submission checklist

**Project:** AI Civic Operations & Road Safety Intelligence Platform  
**Repo:** https://github.com/The-Human-Technologist/civic-ai-platform  
**Live demo:** https://civic-ai-platform-three.vercel.app  
**Application draft:** [openai-oss-application-draft.md](openai-oss-application-draft.md)

**Honest scope:** Mock AI only · no real CCTV bundled · no facial recognition · no automatic challan · human-reviewed alerts only.

---

## Already done

- [x] Public GitHub repository (`The-Human-Technologist/civic-ai-platform`)
- [x] Live Vercel demo (https://civic-ai-platform-three.vercel.app)
- [x] README with embedded screenshots (`docs/screenshots/`)
- [x] QA audit ([qa-audit.md](qa-audit.md))
- [x] Data sources policy ([DATA_SOURCES.md](../DATA_SOURCES.md))
- [x] Demo Footage Library (`/dashboard/demo-footage`)
- [x] Privacy & security docs ([PRIVACY.md](../PRIVACY.md), [SECURITY.md](../SECURITY.md))
- [x] AGPL-3.0-or-later license
- [x] CI / build checks (GitHub Actions: typecheck, lint, build)
- [x] Codespaces / devcontainer
- [x] OpenAI application draft ([openai-oss-application-draft.md](openai-oss-application-draft.md))
- [x] 90-second demo script ([demo-script.md](demo-script.md))
- [x] Screenshot capture script (`npm run capture:screenshots`)
- [x] Footage policy verify step (`npm run verify:footage`)
- [x] Structured GitHub issues for Phase 2+ ([issues #1–#12](https://github.com/The-Human-Technologist/civic-ai-platform/issues))

---

## Still needed before submission

- [ ] **Record 90-second demo video** — follow [demo-script.md](demo-script.md)
- [ ] **Add YouTube unlisted demo link** to `docs/openai-oss-application-draft.md` (do not use a placeholder URL)
- [ ] **Final manual live-site check** — all routes in [qa-audit.md](qa-audit.md) at 390px + desktop

---

## Pre-submit command check

```bash
npm run verify:footage
npm run typecheck
npm run lint
npm run build
```

All must pass.

---

## Do not submit with

- Fake or placeholder demo video URLs
- Raw CCTV, datasets, or model weights in the repo
- Claims of real inference, live RTSP, or automatic enforcement (not shipped in v0.1)

---

## Quick links for reviewers

| Item | Link |
|------|------|
| Live demo | https://civic-ai-platform-three.vercel.app |
| Pilot proposal | https://civic-ai-platform-three.vercel.app/pilot-proposal |
| Demo Footage Library | https://civic-ai-platform-three.vercel.app/dashboard/demo-footage |
| Screenshots folder | [docs/screenshots/](screenshots/) |
| Demo video | *Pending — add after YouTube upload* |

---

*Last updated: Jul 2026*
