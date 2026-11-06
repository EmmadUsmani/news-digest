## 2026-11-06: iteration 1041 — group source controls before publication time

- Advanced item 33/43 while X rounds wait until after 21:00 UTC. Started clean on main; no leftovers; alerts clear and health DB/Redis OK.
- Reader source rows now keep grouped-outlet controls beside publisher names before publication time, matching the approved spec. Expanded reports stay below the row with time above them.
- Read-only saved-edition Playwright replay checks disclosure order, expansion, article dates and reader navigation desktop/mobile light/dark; source-card screenshots updated and visually inspected.
- Browser replay initially used two direct-child timestamp selectors from the previous markup; updated both for the timestamp wrapper. First full check received SIGTERM after 562 unit passes at integration setup; reran. No paid calls.
- All 36 sources report no errors; digest queue has zero failed runs. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged: no source/schema/system-flow changes.
- Verification: pnpm build; pnpm exec tsx scripts/smoke-reader-layout.ts; pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration, exit 0); git diff --check. API/worker restarted; health/alerts clear.
- Archived iteration 1025 to keep this log small. Next: continue final reader; fresh X round after 21:00 UTC; approved Bluesky reserved-slot activation pending under Current order. Fixed search OFF.
