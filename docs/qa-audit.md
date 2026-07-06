# Portal QA Audit

**Date:** 2026-07-06  
**Branch:** `master`  
**Auditor:** Cursor agent (automated + Playwright smoke)  
**Live URL:** https://civic-ai-platform-three.vercel.app

---

## Routes checked

| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ | Landing, nav anchors, CTAs |
| `/dashboard` | ✅ | KPIs, charts, review queue |
| `/dashboard/upload` | ✅ | Upload UI, synthetic demos, mock pipeline |
| `/dashboard/upload?demo=synthetic-barasat-junction` | ✅ | Preselect card + Run Mock Processing |
| `/dashboard/upload?demo=synthetic-monsoon-waterlogging` | ✅ | Same flow |
| `/dashboard/upload?demo=synthetic-garbage-overflow` | ✅ | Same flow |
| `/dashboard/upload?demo=invalid-id` | ✅ | Unknown demo warning (fixed in audit) |
| `/dashboard/data-sources` | ✅ | Policy cards, registry, mobile cards |
| `/dashboard/demo-footage` | ✅ | Grouped cards, filters, mock demo links |
| `/dashboard/events` | ✅ | Filters, mobile cards + desktop table |
| `/dashboard/events/EVT-BRS-2401` | ✅ | Review actions, mock export |
| `/dashboard/events/EVT-BRS-9999` | ✅ | Not-found state (improved) |
| `/dashboard/map` | ✅ | Mock hotspot map + list |
| `/dashboard/reports` | ✅ | Print layout, mock pilot report |
| `/dashboard/settings` | ✅ | Privacy toggles, MVP disclaimers |
| `/pilot-proposal` | ✅ | Government-ready proposal copy |
| `/does-not-exist` | ✅ | Custom 404 with dashboard links |

**Nav labels vs paths:** Sidebar uses `/dashboard/events` (Detections), `/dashboard/map` (Hotspots), `/dashboard/settings` (Privacy), `/dashboard/reports` (Pilot Report) — all valid.

---

## Commands run

```bash
npm run verify:footage   # pass
npm run typecheck        # pass
npm run lint             # pass
npm run build            # pass
npm run dev              # local smoke (port 3000)
```

Playwright MCP: navigated key dashboard routes; console checked.

---

## Issues found

1. **Events table cramped on mobile** — horizontal scroll, truncated locations.
2. **Data Sources registry table** — poor readability on small screens.
3. **Invalid `?demo=` query** — no user feedback for bad IDs.
4. **Event not found** — plain text only.
5. **Dashboard charts** — potential hydration/size issues with Recharts `ResponsiveContainer`.
6. **Main content overflow** — some pages could cause horizontal scroll on narrow viewports.
7. **Evidence export label** — unclear that export is mock JSON only.
8. **Dev console HMR noise** — duplicate `next dev` instances caused Next.js router warnings (dev-only, not production).

---

## Issues fixed

| Fix | Files |
|-----|-------|
| Mobile card layout for events list | `src/app/dashboard/events/page.tsx` |
| Mobile card layout for data source registry | `src/app/dashboard/data-sources/page.tsx` |
| Invalid demo query warning | `src/app/dashboard/upload/page.tsx` |
| Improved event not-found UI | `src/app/dashboard/events/[id]/page.tsx` |
| Chart client-mount guard + label truncation | `src/components/dashboard/charts.tsx` |
| `overflow-x-hidden` + `min-w-0` on dashboard main | `src/components/layout/dashboard-shell.tsx` |
| `min-w-0` on demo-footage / data-sources roots | page components |
| Filter `htmlFor` labels on events page | `src/app/dashboard/events/page.tsx` |
| Mock JSON label on evidence export | `src/app/dashboard/events/[id]/page.tsx` |
| Footer link to Demo Footage Library | `src/components/layout/landing-footer.tsx` |
| Cross-link data-sources ↔ demo-footage | `src/app/dashboard/data-sources/page.tsx` |

---

## Footage / data safety

- `npm run verify:footage` — **pass** (no committed video, datasets, or weights)
- No raw footage added during audit
- Policy copy unchanged: mock AI only, no CCTV scraping, no auto-challan

---

## Content consistency

Risk terms (`surveillance`, `challan`, `facial recognition`, etc.) appear only in **disclaimers and non-goals** — acceptable. No claims of real Kolkata/Barasat CCTV training in UI.

---

## Remaining known limitations (honest)

| Area | Limitation |
|------|------------|
| AI | Mock detections only — no real CV inference |
| Video | No bundled footage; upload does not hit a server |
| Charts | Weekly trend uses fallback bars when day buckets are empty |
| Map | Stylized grid — not GIS-accurate |
| Evidence | Placeholder clip panel — no real video segments |
| Privacy toggles | Client-side demo — not enforced server-side |
| Screenshots | 9 website-only screenshots captured and committed in `docs/screenshots/` |
| Production console | Test against Vercel after deploy for final sign-off |

---

## Build status

**All static checks passed** at end of audit.

---

## Manual review URLs (post-deploy)

- https://civic-ai-platform-three.vercel.app/dashboard/demo-footage
- https://civic-ai-platform-three.vercel.app/dashboard/upload?demo=synthetic-barasat-junction
- https://civic-ai-platform-three.vercel.app/dashboard/events
- https://civic-ai-platform-three.vercel.app/pilot-proposal

Test at **390px** width for mobile sign-off.
