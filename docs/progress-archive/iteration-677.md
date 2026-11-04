## 2026-11-04: iteration 677 — durable X experiment admission

- Started clean on main; no leftover work. Zero alerts; healthz/database/Redis healthy, 36 nonempty sources with no current errors, no failed digest jobs and Nov 5 15:00 UTC next scheduled edition. Two retained ingestion failures have no current source errors.
- Added standalone private-file experiment journal with exclusive locking, fsync/atomic updates, $1 UTC-day/$2.50 lifetime admission and 13:00–16:00 UTC blackout. Unique request reservations survive restart; unknown outcomes never auto-release.
- Known usage settles once; provider overruns are recorded and stop future admissions. Locked/stale or malformed journals fail closed without overwriting evidence. No paid calls or production search, schedule, model, provider or budget changes.
- Four offline tests cover UTC boundaries/invalid amounts, persisted daily/lifetime holds, settlement/headroom/overrun stop, duplicate requests and damaged/locked journals. Targeted 4/4 and explicit helper/test TypeScript check passed.
- Updated TASKS and added docs/x-search-experiment.md for runner requirements; archived iterations 660–661. SOURCES/handbook unchanged: helper is not connected to any production flow.
- Verification: pnpm format, pnpm lint:fix, pnpm check (423 unit/209 isolated integration), pnpm build and git diff --check passed.
- No service restart under STEERING 22: running services do not import this standalone helper.
- Next: wire one fixed external journal path, justify provider per-call reservation bound, add runner/evidence reporting and perform approved two-day comparison. Admission alone cannot bound a provider response. Nov 5 grouping/NBA checks retain priority.
