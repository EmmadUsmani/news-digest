## 2026-11-04: iteration 698 — repair bodyless Bluesky session refresh

- Started clean on main; no leftover work. Healthz/services and 36 article sources healthy, zero alerts; triage found the 20:54 hourly Bluesky job failed on refresh HTTP 400. No failed digest jobs; Nov 5 checks remain future.
- Reproduced against the official PDS: refresh POST with JSON `{}` returns HTTP 400 InvalidRequest; bodyless POST returns 200. Fixed the adapter to select POST independently of its body; login/search limits and bounded recovery unchanged.
- Strengthened fixture assertions for refresh method, absent body/content type and between-page recovery. `pnpm exec tsx --test apps/api/test/bluesky-search.test.ts`: 10/10 pass.
- Free adapter probe with simulated access expiry completed a real official refresh and fetched 49 real posts, without storage or paid calls; not a natural-expiry observation. Credentials/tokens never printed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (453 unit/209 isolated integration), `pnpm build`, handbook (17 pages/22 diagrams/26 tables) and `git diff --check` passed. No UI change.
- Restarted worker and retried only the failed hourly Bluesky job once: completed at 21:16 UTC, fetched/submitted 49 real observations per topic (196 total). These are observations, not unique new posts. Healthz/database/Redis remain green, zero alerts.
- Updated TASKS and SOURCES; handbook unchanged for this request-format bug fix. No caps/models/providers changed. Long-lived natural refresh remains to observe.
- Next: Nov 5 grouping/NBA AI/cost/latency/screenshots; paid X experiment remains blocked on a supported cost bound.
