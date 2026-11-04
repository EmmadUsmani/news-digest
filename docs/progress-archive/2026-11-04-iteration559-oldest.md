# Archived progress

## 2026-11-04: iteration 540 — prepare worker resource ownership

- Started clean on main; no leftover work. Zero alerts, healthy root/healthz, 36 sources with recent nonempty successful collections and no current errors; no failed digest jobs. Nov 4 scheduled review remains pending.
- Added prepared worker entry point owning scoring DB and existing settings/topic repositories. Disabled mode allocates nothing; current settings filter enabled topics. Startup failures clean up, repeated shutdowns share one drain, and connections close after scoring stops.
- Four offline lifecycle tests and one isolated persisted-settings/topic integration test pass. No production worker import, activation or paid requests; no live latency/waste claim. Next: gated worker connection after review, longer-span pool/waste evidence.
- Updated TASKS/RANKING; archived iteration 521 to keep PROGRESS small. No source/schema/UI or live handbook flow change. Services stay running under STEERING 22 because prepared code has no production caller.
- Verification: targeted tests 4/4; pnpm format, pnpm lint:fix, pnpm check (348 unit/186 isolated integration), pnpm build, git diff --check; root HTTP 200, healthz healthy, zero alerts and zero dangling Docker volumes. Initial test synchronization and cleanup-error typing failures fixed before successful full checks.
