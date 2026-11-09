## 2026-11-09: iteration 1469 — account activation browser readiness

- Clean main/no leftovers; health and alerts clear, all 36 sources healthy. Phase 1 scheduled acceptance still awaits 15:00 UTC; accounts remain disabled and VM private.
- Ran all four account browser smokes together against the current activation candidate: code login, fragment-link confirmation, account controls and mounted-reader integration pass at desktop/mobile widths. Responses are fixture accounts; mounted reader uses the real saved edition. No live account writes or provider calls.
- Verified disabled deployed UI makes no account requests; fixture flows cover refusal/retry, explicit exchange, replay, sync, sign-out and deletion. Inspected refreshed deletion screenshots and mobile mounted-reader screenshot. No product code changed.
- Saved reader retains four topics/19 stories/17 posts. Archived iterations 1452–1453 to keep this log small.
- Verification: all four `pnpm exec tsx scripts/smoke-*.ts` account commands above; `pnpm format`, `pnpm lint:fix`, `pnpm check` (707 unit/254 integration passes; four expected skips), `pnpm build`, `check-scheduled-reader.ts 2026-11-08T15:00:00Z` and `git diff --check` pass. Commit/push followed by API/worker restart and health/alerts checks.
- Next: normal Nov 9 15:00 UTC scheduled acceptance, then live authenticated proxy proof before activation; fixture browser results do not replace either gate.

## 2026-11-09: iteration 1470 — natural compaction evidence

- Owner value: replaces an indefinite wait for compaction with confirmed natural-load evidence and a precise remaining recovery gap.
- Clean main/no leftovers; health, Grafana, 14 services, all 36 sources, jobs and alerts pass; next digest remains 15:00 UTC.
- Journal confirms Nov 8 17:48 natural 49,279,202-row merge in 164.103 s under unchanged 2% CPU trial; zero restarts. No forced merge, provider calls or settings changes.
- Eight uncached stored-history queries cover Nov 8 11:26–Nov 9 04:26 (2,041 points/series); metrics scrape samples one, admission hits two, queue timeouts/slow queries zero. Resource window shows stack ≤686.8 MiB/2.361% five-minute CPU.
- Recovery stays open: historical evaluator counters/per-rule health unavailable. Current `sample-metrics-recovery.ts 1 30` passes 23 rules/four probes ≤0.833 s/zero new errors or misses. Next passive check ≥05:27 UTC.
- Updated capacity decision and TASKS; accounts still disabled awaiting scheduled acceptance/live proxy proof. No product or schema change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (707 unit/254 integration passes, four expected skips), `pnpm build`, `git diff --check` and saved-reader check (four topics/19 stories/17 posts) pass. Commit/push and API/worker restart followed by health/alerts checks.
