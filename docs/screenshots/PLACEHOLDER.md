# Screenshots — captured

Nine website-only PNGs are committed for README, GitHub, OpenAI OSS, and proposal sharing.

## Files

| File | URL |
|------|-----|
| `landing.png` | `/` |
| `dashboard.png` | `/dashboard` |
| `upload-demo.png` | `/dashboard/upload?demo=synthetic-barasat-junction` |
| `demo-footage.png` | `/dashboard/demo-footage` |
| `data-sources.png` | `/dashboard/data-sources` |
| `events.png` | `/dashboard/events` |
| `event-review.png` | `/dashboard/events/EVT-BRS-2401` |
| `pilot-proposal.png` | `/pilot-proposal` |
| `privacy.png` | `/dashboard/settings` |

## Re-capture

```bash
npm run dev
npm run capture:screenshots
```

Optional production URL:

```bash
SCREENSHOT_BASE_URL=https://civic-ai-platform-three.vercel.app npm run capture:screenshots
```

Viewport: **1440×900** · Playwright Chromium · website viewport only (no browser chrome or OS taskbar).

See [README.md](README.md) for framing notes.
