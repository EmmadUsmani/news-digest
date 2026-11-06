## 2026-11-06: iteration 920 — durable Bluesky edition alerts

- Started clean on main; no leftover work. Health green, 36/36 sources healthy, no failed digest jobs and alerts clear. Higher-priority reviews await publication/21:00 UTC.
- Added BlueskyEditingFailed and BlueskyNoPicks from saved scheduled snapshots; no worker counters. Missing/failing/refused results flag the latest edition; three open-slot opportunities without a pick persist until a pick.
- Excluded on-demand, switched-off and pre-step-1 editions (cutover 2026-11-06 01:36 UTC). A restricted aggregate view keeps snapshot content unavailable to the metrics login.
- Offline SQL coverage verifies exclusions, sibling failures, missing results, repeated fresh reads and recovery; alert rules verify thresholds and clearing. No paid calls or selection/budget changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check (535 unit/224 isolated integration tests); pnpm build; check-handbook.ts 09-observability; vmalert-tool-prod unittest; check-observability.ts --verify-alerts; git diff --check. All passed.
- Loaded aggregate view/exporter config and alert rules; live verification reports 18 healthy alert rules, zero firing/pending, saved Bluesky aggregates 0/0. No eligible scheduled edition exists yet; neither new alert fires.
- Rebuilt/restarted API/worker/docs/schema; health/database/Redis green, reader HTTP 200 and 36/36 sources healthy. Updated TASKS and affected handbook; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Next: item 40 per-post validation, then default-off reserved slot; Nov 6 edition/cost review after publication, X experiment after 21:00 UTC. Fixed search remains off.
