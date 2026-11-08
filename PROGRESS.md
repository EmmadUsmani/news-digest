# Progress

Earlier entries: [iterations 1062–1069](docs/progress-archive/2026-11-07-iterations-1062-1069.md).

Earlier entries: [iterations 1070–1074](docs/progress-archive/2026-11-07-iterations-1070-1074.md).

Earlier entries: [iterations 1075–1084](docs/progress-archive/2026-11-07-iterations-1075-1084.md).

Earlier entries: [iterations 1089–1101](docs/progress-archive/2026-11-07-iterations-1089-1101.md).

Earlier entries: [iterations 1191–1199](docs/progress-archive/2026-11-07-iterations-1191-1199.md).

Earlier entries: [iterations 1200–1207](docs/progress-archive/2026-11-07-iterations-1200-1207.md).

Earlier entries: [iterations 1208–1214](docs/progress-archive/2026-11-07-iterations-1208-1214.md).

Earlier entries: [iterations 1215–1222](docs/progress-archive/2026-11-07-iterations-1215-1222.md).

Earlier entries: [iterations 1223–1229](docs/progress-archive/2026-11-07-iterations-1223-1229.md).

Archived: [iterations 1230–1234](docs/progress-archive/2026-11-07-iterations-1230-1234.md).

Archived: [iterations 1235–1242](docs/progress-archive/2026-11-07-iterations-1235-1242.md).

Earlier entries: [iterations 1243–1246](docs/progress-archive/2026-11-07-iterations-1243-1246.md).

Earlier entries: [iterations 1247–1254](docs/progress-archive/2026-11-07-iterations-1247-1254.md).

## 2026-11-07: iteration 1255 — private published-reader query contract

- Clean main/no leftovers; alerts clear, health database/Redis OK. Development spend $0; noon generation cutoff respected, production schema/reader/generation unchanged.
- Private restore now checks proposed published latest/history/pagination/direct-link reads against the independent original scheduled-key/UTC policy. Newer unpublished manual/test probes stay admin-readable and cannot displace the published reader.
- Missing-filter and repeated-first-page mutations both fail. Every probe rolls back; full edition fingerprint and immutability rechecks pass. This does not claim application new-model API/browser acceptance.
- `python3 ops/backups/rehearse_publication.py` passes twice (second run includes mutations); private backup `news-digest-20261107T225024Z`: 28 tables/48,536 rows, 546 unchanged editions, five published candidates/476 manual/65 tests. Scratch storage removed.
- `python3 -m unittest discover -s ops/backups -p 'test_database.py'`: four pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 575 unit tests, 229 integration passes/four expected skips. Handbook/metadata checker passes.
- Actual reader complete-response comparison passes for all five saved candidates. Local status reports 36/36 active sources healthy/nonempty/recent. Four app services restarted; final health and alerts clear.
- Updated TASKS/publication inventory/DATABASE-VERIFICATION; archived progress 1243–1246 to keep the log below 25 KB. No handbook/source behavior change.
- Next: register metadata migration/future writes before noon, then pools/test editions and new-model API/browser comparison. Nov 8 scheduled acceptance/first-week report due; passive metrics probe ≥23:17 UTC. No blockers.

## 2026-11-07: iteration 1256 — prepare future edition publication policy

- Clean main/no leftovers; initial alerts clear and health database/Redis OK. Development spend $0; generation cutoff respected, production schema/reader/generation unchanged.
- Added isolated `newEditionPublication` domain policy for future writer wiring: scheduled saves publish at save time, manual saves remain private, explicit tests and legacy integration keys never publish. Reject missing scheduled keys, keyed manual intent and invalid save timestamps before persistence.
- Five targeted publication tests pass, including three new cases covering explicit test precedence, UTC save timestamps independent of the historical cutoff, and ambiguous requests. Helper has no runtime callers; migration/writer wiring remains pending the allowed deployment window.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 578 unit tests, 229 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Complete reader fingerprint comparison passes for all five actual Nov 3–7 editions; read-only source query confirms 36/36 enabled sources healthy/nonempty within two hours. No new editions or provider calls.
- Four app services restarted/active; post-restart `/healthz` database/Redis OK, alerts clear and all five reader fingerprints still match. Updated TASKS; no handbook/source behavior change. No owner-controlled files edited.
- Initial push rejected (remote owner documentation commit); fetched and merged `d94c760e` without rewriting history. No application changes in the remote commit.
- Next: register metadata migration and wire future saves in the permitted window, then pools/test editions and new-model API/browser comparison. Nov 8 scheduled acceptance/first-week report remain due; passive metrics probe no earlier than 23:17 UTC.

## 2026-11-07: iteration 1257 — rehearse future publication saves privately

- Clean main/no leftovers; alerts clear, health database/Redis OK. Generation cutoff respected; production schema/writer/reader unchanged, development spend $0.
- Private restore now runs eight synthetic inputs through the prepared TypeScript publication policy, persists candidate metadata in a non-UTC session and checks an independent intent/time oracle. Covers cutoff independence, offset dates, manual/test privacy and legacy integration keys.
- Duplicate scheduled-key inserts reject; forced-manual and missing-publication-time mutations fail. All probes roll back; full saved-edition fingerprint and immutability guards rechecked. This verifies candidate SQL, not runtime writer wiring.
- `python3 ops/backups/rehearse_publication.py` passes twice; final backup `news-digest-20261107T230804Z`: 28 tables/48,739 rows, 546 unchanged editions, five published candidates/476 manual/65 tests. Scratch containers removed.
- Five targeted publication tests, four backup unit tests and Python compilation pass. Complete reader fingerprint comparison passes for all five actual Nov 3–7 editions; read-only status confirms 36/36 enabled sources healthy/nonempty/recent.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 578 unit tests, 229 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Four app services restarted/active; post-restart health database/Redis OK, alerts clear and all five reader fingerprints still match. Updated TASKS/DATABASE-VERIFICATION; no handbook/source behavior change.
- Next: register metadata migration/future writes in the permitted window, then pools/test editions and new-model API/browser comparison; Nov 8 15:00 UTC acceptance/first-week report due. Passive metrics probe remains due no earlier than 23:17 UTC.

## 2026-11-07: iteration 1258 — prepare published-only reader behind switch

- Clean main/no leftovers; initial alerts clear and health database/Redis OK. Generation cutoff respected: no schema/writer/generation changes or provider calls; live reader switch remains off.
- Added `READER_PUBLISHED_ONLY=1` to reader latest/history/direct links; publication filtering precedes pagination/ordering, excludes tests and preserves profile isolation. Admin repository reads retain unpublished editions. Default-off reads work without candidate columns.
- Isolated HTTP test applies candidate metadata only inside disposable Postgres, covers 23 published scheduled/manual rows, four newer private manual/test rows, tied timestamps, archive pagination, direct-link 404s, admin access and switch rollback. Test environment clears inherited rollout switch.
- `pnpm check` typecheck/lint/format/boundaries and 578 unit tests pass; initial integration attempt exposed year-2200 fixture collision in unfiltered latest assertion. Moved fixtures to 9998/9999, cleanup by inserted IDs; `pnpm test:integration` rerun passes 230 tests/four expected skips.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` and `pnpm exec tsx scripts/check-handbook.ts 08-operations` pass. Four app services restarted/active; `/healthz` database/Redis OK, alerts clear, five saved-reader fingerprints match after restart; 36/36 enabled sources healthy/nonempty/recent.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 1` at 23:17 UTC: 23 healthy rules, four uncached queries ≤0.192 s, zero new evaluator errors/misses, zero merges; recovery open, next passive check ≥00:17 UTC Nov 8.
- Updated TASKS and operations handbook; no source/schema metadata change. Actual saved-edition new-model API/browser comparison remains pending migration.
- Next: register metadata migration/future writes in the permitted window, finish pools/test editions and compare saved reader with switch off/on. Nov 8 15:00 UTC acceptance/first-week report due.

## 2026-11-07: iteration 1259 — prepare lifetime development-pool policy

- Clean main/no leftovers; initial alerts clear and health database/Redis OK. Generation cutoff respected: no runtime generation, schema or reader-switch changes; provider spend $0.
- Added isolated development allowance policy for phase 0: Anthropic $5/xAI $2 lifetime code ceilings, lower configurable caps, conservative integer 75% stop/report threshold, zero allowance after threshold and validation of unsafe amounts/providers. Settled charges plus pending/uncertain reservations consume the same total; no date input or renewal.
- Four targeted offline policy tests pass, including exact threshold boundaries, exhausted/over-cap totals, disabled/lowered caps and invalid database caps. Helper has no runtime callers; pool persistence and atomic reservation wiring remain pending.
- Complete reader fingerprint comparison verifies all five actual Nov 3–7 responses; read-only source status confirms 36/36 enabled sources healthy/nonempty/recent.
- Updated TASKS; no source/handbook/schema behavior change. Nov 8 scheduled acceptance and first-week review remain due; metrics probe no earlier than 00:17 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build` and `git diff --check` pass: 582 unit tests, 230 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Four app services restarted/active; post-restart health database/Redis OK, alerts clear and five full saved-reader fingerprints still match. Next: register metadata migration, future writes and pool persistence in the permitted window, then actual saved-reader off/on comparison.

## 2026-11-07: iteration 1260 — prepare atomic lifetime development ledger

- Clean main/no leftovers; alerts clear and health database/Redis OK. Generation cutoff respected; no live schema/runtime wiring/reader switch changes or provider spend.
- Candidate SQL and unwired Drizzle adapter serialize reservations/settlement per provider. Null-cost holds never expire; confirmed charges replace holds, confirmed zero releases them, conflicting retries fail. Database and code ceilings retain Anthropic $5/xAI $2 lifetime caps and 75% stop/report threshold.
- Disposable Postgres test passes: three concurrent $1.25 Anthropic holds reach $3.75, fourth denied; same-ID replay, unknown holds across dates, confirmed-cost retry/conflict, release, separate xAI accounting, over-estimate charges and disabled/lowered pools checked. Candidate tables dropped after test; authoritative schema unchanged.
- Updated TASKS and DATABASE-VERIFICATION; no production source/handbook/schema metadata change. Five complete saved-reader fingerprints match; 36/36 enabled sources healthy/nonempty.
- Next: register publication metadata/future writes and pool migration/runtime wiring in permitted window; compare actual saved-reader off/on before switch. Nov 8 15:00 UTC acceptance/first-week report due; passive metrics probe no earlier than 00:17 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build` and `git diff --check` pass: 582 unit tests, 231 integration passes/four expected skips; typecheck/lint/format/boundaries green. Four app services restarted/active; post-restart health database/Redis OK, alerts clear and all five full reader fingerprints match.

## 2026-11-07: iteration 1261 — prepare lifetime development-pool status

- Clean main/no leftovers; initial `pnpm obs alerts` clear and `/healthz` database/Redis OK. Generation cutoff respected; no live schema, runtime wiring, reader switch or provider calls.
- Candidate development ledger now exposes a single-statement consistent status: confirmed charges, unresolved holds/count, total commitments, configured/code ceiling, remaining allowance and 75% stop/report threshold. Empty pools remain visible; no date reset.
- Disposable Postgres assertions cover empty pools, concurrent holds, confirmed settlement/retry without double counting, confirmed-zero release, over-estimate charges, provider separation and disabled-pool reporting. Adapter remains unwired.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build` and `git diff --check` pass: 582 unit tests, 231 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- `pnpm exec tsx scripts/compare-publication-content.ts compare /tmp/publication-inventory-1257.json docs/edition-reviews/2026-11-07-publication-content-baseline.json` verifies all five complete saved responses. Read-only admin source snapshot: 36/36 enabled sources error-free/nonempty/successful within two hours.
- Updated TASKS and DATABASE-VERIFICATION; no public behavior/source/schema metadata change. Next: register metadata/future writes and pool migration/runtime wiring after midnight UTC; actual saved-reader off/on comparison remains due. Nov 8 15:00 UTC acceptance/first-week report due; passive metrics probe no earlier than 00:17 UTC.
- Four app services restarted/active; post-restart health database/Redis OK, alerts clear and all five complete saved-reader fingerprints still match. Final `pnpm format`/`pnpm lint:fix` and diff checks pass.

## 2026-11-07: iteration 1262 — prepare development-ledger application boundary

- Clean main/no leftovers; initial alerts clear and health database/Redis OK. Generation cutoff respected: no live schema, runtime wiring, reader switch or provider calls.
- Added framework-free `DevelopmentSpendPort` with typed lifetime status, allowance, reservation outcomes and confirmed settlement. Explicit replay outcome documents that callers must not repeat provider calls; unknown billing retains holds.
- Candidate Drizzle adapter implements the port; its disposable-Postgres characterization now uses the port type. Existing concurrency, replay/conflict, settlement, release, independent-provider and threshold assertions pass unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build` and `git diff --check` pass: 582 unit tests, 231 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Complete saved-reader comparison: all five Nov 3–7 responses match committed fingerprints. Read-only admin source snapshot: 36/36 enabled sources error-free/nonempty/successful within two hours.
- Updated TASKS and DATABASE-VERIFICATION; no source, handbook or schema behavior change. Four app services restarted/active; post-restart health and alerts clear and five saved-reader fingerprints match.
- Next: register metadata/future writes and pool migration/runtime wiring after midnight UTC, then actual saved-reader off/on comparison. Nov 8 15:00 UTC acceptance/first-week report due; passive metrics probe no earlier than 00:17 UTC.

## 2026-11-07: iteration 1263 — verify concurrent development-ledger retries

- Clean main/no leftovers; initial alerts clear and health database/Redis OK. No live schema/runtime wiring/reader switch or provider calls.
- Disposable Postgres now verifies six duplicate callers create one reservation and five replays; six identical settlements record exactly one confirmed charge.
- Competing confirmed amounts yield exactly one winner and one conflict; winning-charge replay leaves status unchanged and unrelated uncertain holds remain intact. Candidate adapter stays unwired.
- `pnpm check` passes: 582 unit tests, 231 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Complete saved-reader comparison verifies all five Nov 3–7 responses; read-only source snapshot has 36/36 error-free/nonempty/successful within two hours.
- Updated TASKS and DATABASE-VERIFICATION. Next: register phase-0 publication metadata/future writes and development-pool migration/runtime wiring in the permitted window, then actual saved-reader off/on comparison. Nov 8 15:00 UTC acceptance/first-week report remains due.
- `pnpm build`, `pnpm format`, `pnpm lint:fix` and `git diff --check` pass. Four app services restarted/active; post-restart health database/Redis OK, alerts clear and all five full saved-reader fingerprints match. No source, public behavior or authoritative schema changes.

## 2026-11-08: iteration 1264 — deploy publication metadata and future saves

- Clean main/no leftovers; initial alerts clear and health database/Redis OK. All 36 enabled sources healthy/nonempty/successful within two hours. Work began after midnight in the permitted generation-change window.
- Registered additive Drizzle publication migration/schema and rehearsed owner-approved backfill. Future repository saves apply the publication policy; reader uses typed metadata predicates, with its switch still off.
- Private backup `news-digest-20261108T000202Z` completed before `pnpm migrate`. Live result: five published scheduled/476 private manual/65 private test editions; original 546 full records hash-identical after excluding new metadata, immutability trigger enabled.
- Offline save-path assertions cover private manual, published scheduled/exact save timestamp and private legacy integration saves. Reader HTTP tests use authoritative migrated columns; disposable schema parity passes. A direct targeted invocation was rejected by test isolation; verification used the required disposable integration runner.
- `pnpm check` passes: 582 unit/232 integration passes/four expected skips; typecheck/lint/format/boundaries green. `pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime` passes; affected runtime handbook and DATABASE-VERIFICATION updated.
- `compare-publication-content.ts compare` verifies all five complete saved-reader responses; `smoke-publication-candidates.ts` verifies their API/per-topic counts and titles in 20 desktop/mobile light/dark views after migration. No paid calls or production cap changes.
- Next: actual saved-reader off/on comparison before enabling filtering; development-pool authoritative migration/runtime/test-edition wiring. Phase-0 and phase-2 normal-scheduled-edition acceptance remain due; Nov 8 15:00 UTC review/first-week report still due.
- `pnpm build`, final `pnpm format`/`pnpm lint:fix` and diff checks pass. Four app services restarted/active; deployed health/alerts clear, all five fingerprints and 20 browser views pass again. Archived iterations 1247–1254 to keep this file below 25 KB.

## 2026-11-08: iteration 1265 — enable the published-only reader

- Clean main/no leftovers; initial health/alerts clear. All 36 enabled sources healthy/nonempty/successful within two hours; digest queue has zero failures.
- Compared all five Nov 3–7 published editions before/after enabling `READER_PUBLISHED_ONLY=1` in the private env and restarting API: complete response fingerprints unchanged; API/inventory/per-topic counts and titles pass in 20 desktop/mobile light/dark views per state.
- New GET-only `smoke-publication-visibility.ts` verifies latest/history contain exactly those five IDs; all 541 private reader links return 404 while every original admin ID remains accessible. Four archive browser views pass; screenshots saved and mobile light inspected.
- Initial post-restart comparison raced API startup and returned fetch failed; retried after healthy startup, all comparisons pass. No content/ID/schema/generation/sharing changes or provider calls.
- Updated TASKS, publication plan, runtime handbook and DATABASE-VERIFICATION. `pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime`, `pnpm build` and diff checks pass.
- Next: authoritative development-pool migration/runtime/test-edition wiring. Phase 0/2 normal scheduled acceptance and Nov 8 15:00 UTC review/first-week report remain due; public sharing stays private.
- `pnpm check` passes: 582 unit/232 integration passes/four expected skips; typecheck/lint/format/boundaries green. Final `pnpm format`, `pnpm lint:fix` and diff checks pass. Four app services restarted/active; deployed health/alerts clear, all five fingerprints and private/admin/archive acceptance pass again.

## 2026-11-08: iteration 1266 — verify development-ledger reconnect recovery

- Clean main/no leftovers; health database/Redis OK and alerts clear. All 36 enabled sources healthy; digest queue has zero failures. Existing retained ingestion/social failures remain historical, with current sources healthy.
- Disposable Postgres now verifies unresolved development holds survive closing/recreating independent connection pools; duplicate reservation returns replay, confirmed settlement retries charge once and unrelated holds remain intact.
- Full-row fingerprints of production Anthropic/X ledgers and scheduled reserves remain unchanged throughout development-ledger operations. Candidate schema/adapter remain unwired; no provider calls or live data/schema changes.
- Updated TASKS and DATABASE-VERIFICATION. `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime` and complete saved-reader comparison (five responses) pass.
- Next: authoritative development-pool migration/runtime/test-edition wiring. Phase-0/2 scheduled acceptance and Nov 8 15:00 UTC review/first-week report remain due; public sharing stays private.
- `pnpm check` passes: 582 unit/232 integration passes/four expected skips; typecheck/lint/format/boundaries green. Final `pnpm format`, `pnpm lint:fix` and diff checks pass.
