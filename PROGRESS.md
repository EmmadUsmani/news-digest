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

## 2026-11-07: iteration 1247 — saved-item keyboard focus

- Clean main/no leftover work. Initial alerts and `/healthz` healthy; 36/36 sources have successful nonempty fetches and no errors. Metrics passive probe not due before 22:16 UTC. Development spend $0.
- STEERING 50 phase-2 waiting path: removing a saved item now focuses the next Remove button, the previous one at the end, or the Saved items heading when the list empties; keyboard readers can continue without returning to the page start.
- `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` passes desktop/mobile light/dark with actual saved editions, first/last/only-item keyboard removal, existing bookmark storage/cross-tab/historical checks, GET-only and external requests blocked. Refreshed screenshots; inspected empty desktop/mobile light views.
- Full `pnpm check` exits 0: typecheck/lint/format/boundaries, 572 unit tests and 229 integration tests pass/four expected skips. `pnpm format`, `pnpm lint:fix`, `git diff --check` pass. First full build received SIGTERM after web completion without compilation errors; `pnpm build` retry exits 0.
- Four app services restarted; final `/healthz` database/Redis OK, alerts clear and actual Nov 7 scheduled edition readable with four topics. No generation/schema/source changes; handbook/source metadata unchanged.
- Initial push rejected (remote advanced); fetched/merged owner commits without rewriting history. New STEERING 51 leak cleanup is next; publication decision now resolved in NEEDS_FROM_HUMAN/TASKS. Remote changes are documentation only.
- Next: STEERING 51, then resume phase 0 with approved Nov 3+ non-integration scheduled publication set; Nov 8 phase-2 acceptance/daily X/Bluesky review/first-week report and metrics incident remain open.

## 2026-11-07: iteration 1248 — reclaim killed integration-run folders

- Clean main/no leftover work. Initial alerts clear, health database/Redis OK; 36/36 sources healthy and latest actual Nov 7 edition readable with four topics. Development spend $0; no provider/source/schema/UI changes.
- STEERING 51: removed 41 unused `/tmp/news-digest-integration-*` roots, 2,943,540 KiB (2.81 GiB); disk 71%→59%. First pass removed 39 aged roots; one-off age override removed two recent unused roots with the same process checks. No other temp content touched.
- Startup cleanup removes owned real directories older than one hour only when no live runner PID or same-UID environment/command/cwd/open-file reference exists. PID reuse retains folders. Read-only sudo proc probe handles protected entries and returns matching paths only; inspection failure deletes nothing. Concurrent disappearance tolerated; other runner behavior unchanged.
- `pnpm exec tsx --test apps/api/test/integration-temp.test.ts` passes: stale cleanup, recent/live-runner/orphan-child/unrelated/symlink preservation, killed child with runner marker removed by next cleanup, repeated cleanup harmless. Updated DATABASE-VERIFICATION and STEERING ack/TASKS.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` pass. Initial lint/full check caught missing `void` on test declaration; corrected. Full `pnpm check` retry exits 0: typecheck/lint/format/boundaries, 573 unit tests, 229 integration tests/four expected skips. Zero remaining integration temp roots after success.
- Four app services restarted; first health request raced readiness, subsequent health database/Redis OK. Alerts clear, 36/36 sources healthy, latest scheduled edition still readable. Disk remains 59%.
- Next: STEERING 50 phase 0 metadata/pools/test editions with approved Nov 3+ non-integration scheduled publication set. Nov 8 scheduled/daily X/Bluesky/phase-2 acceptance and first-week report remain due. Metrics passive check next ≥22:16 UTC.

## 2026-11-07: iteration 1249 — owner-approved publication backfill preview

- Clean main/no leftover work; initial health database/Redis OK and alerts clear. Development spend $0; no generation/provider/schema/reader changes.
- STEERING 50 phase 0: added a reusable historical publication policy and read-only inventory preview. Owner cutoff uses UTC creation time; integration keys always test/unpublished, early non-integration keys and unkeyed editions manual/unpublished; published timestamp equals creation time.
- `pnpm exec tsx scripts/inventory-editions.ts > /tmp/edition-inventory-1249.json` confirms 546 editions: five scheduled/published (Nov 3–7), 476 manual, 65 tests. All five topic/story/post counts match the prior inventory. Corrected stale owner-decision wording in inventory evidence; reader unchanged.
- `pnpm exec tsx --test apps/api/test/edition-publication.test.ts` passes both cases covering UTC cutoff, timezone equivalence, future schedule, test exclusion, manual exclusion and invalid timestamps. Full `pnpm check` exits 0: 575 unit tests, 229 integration tests/four expected skips; typecheck/lint/format/boundaries pass.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` pass. Four app services restarted; final health database/Redis OK, alerts clear and actual Nov 7 edition readable/four topics. Read-only source query confirms 36/36 healthy/nonempty; host psql unavailable, used existing database adapter instead.
- Next: private backup/scratch rehearsal and additive publication metadata migration, then spend pools/test editions and every-published-edition rendering comparison. Nov 8 scheduled acceptance/daily X/Bluesky review/first-week report remain due; metrics passive check next ≥22:16 UTC. No blockers.

## 2026-11-07: iteration 1250 — private publication backfill rehearsal

- Clean main/no leftover work; initial alerts clear and health database/Redis OK. Development spend $0; no production schema, reader, generation, provider or source changes.
- Added `python3 ops/backups/rehearse_publication.py`: private snapshot-consistent backup/checksum, networkless PostgreSQL 17 restore, complete table-count comparison, candidate additive metadata/backfill transaction and independent UTC policy verification. Scratch container/tmpfs volume removed on success and failure; private structural receipt retained.
- Final backup `news-digest-20261107T221313Z`: 28 tables/48,475 rows/9,110,018 bytes. All 546 editions preserve every old field, including IDs/windows/full snapshots. Candidate result: five scheduled/published, 476 manual/unpublished, 65 test/unpublished.
- Initial rehearsal caught immutable edition trigger blocking UPDATE. Successful candidate disables only that trigger inside the backfill transaction, re-enables before commit and proves snapshot UPDATE and DELETE still fail. Registered migration/future scheduled writes and every-published-edition browser comparison remain next; reader filter stays off.
- `python3 -m unittest discover -s ops/backups -p 'test_database.py'`: four pass. `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` pass. Full `pnpm check` exits 0: typecheck/lint/format/boundaries, 575 unit tests and 229 integration tests/four expected skips.
- Passive metrics check `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 1` at 22:17 UTC: 23 healthy rules, four uncached queries ≤0.224 s, zero new evaluator errors/misses, no merges. Incident remains open; next probe ≥23:17 UTC.
- Four app services restarted/active; final health database/Redis OK, alerts clear and actual Nov 7 edition readable/four topics. All 36 enabled sources nonempty/error-free, last success ≤30 minutes old. Handbook/source metadata unchanged.
- Next: registered additive publication migration and future writes, then spend pools/test editions. Nov 8 scheduled acceptance/daily X/Bluesky review/first-week report remain due. No blockers.

## 2026-11-07: iteration 1251 — publication backfill rollback safety

- Clean main/no leftover work; initial alerts clear and health database/Redis OK. Development spend $0. STEERING 50 forbids generation changes after noon; registered migration/future writes remain for a pre-noon iteration.
- Extracted candidate transaction to `ops/backups/publication_metadata.sql` (not registered/deployed). Private rehearsal injects division-by-zero failures before and after UPDATE while the immutability trigger is disabled; missing/ambiguous injection points fail closed.
- `python3 ops/backups/rehearse_publication.py` passes twice: both failures roll back new columns and every original field, then UPDATE/DELETE guards reject mutations. The same candidate commits successfully afterward and checks owner policy/guards again.
- Final backup `news-digest-20261107T222028Z`: 28 tables/48,475 rows/9,109,967 bytes; all 546 editions unchanged, five published candidates/476 manual/65 tests. Scratch container/storage removed; production schema/reader/generation unchanged.
- `python3 -m unittest discover -s ops/backups -p 'test_database.py'`: four pass. Updated DATABASE-VERIFICATION/TASKS; no handbook/source behavior change.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 575 unit tests, 229 integration tests/four expected skips, typecheck/lint/format/boundaries green. Four services restarted/active; final health database/Redis OK, alerts clear and latest edition readable/four topics.
- Actual latest Nov 7 edition remains readable/four topics; read-only query confirms 36/36 enabled sources healthy/nonempty. Admin status HTTP probe returned protected 404; first source SQL used nonexistent `sources`, corrected to `content_sources`.
- Next: register additive metadata migration plus future scheduled writes before 12:00 UTC, then pools/test editions and published-edition rendering comparison. Nov 8 scheduled acceptance/first-week report remain due; next passive metrics probe ≥23:17 UTC.

## 2026-11-07: iteration 1252 — prevent publication of test editions

- Clean main/no leftovers; initial alerts clear, health database/Redis OK. Development spend $0; generation cutoff respected, production schema/reader unchanged.
- Phase 0 candidate SQL now enforces test editions remain unpublished. Private networkless restore verifies named CHECK rejects published test INSERT; unpublished test/manual and published manual/scheduled INSERTs succeed.
- All five insertion probes roll back; complete migrated-row fingerprint and immutability checks prove saved metadata/snapshots unchanged. Both existing injected backfill rollback checkpoints still pass.
- `python3 ops/backups/rehearse_publication.py` passes twice; final private backup `news-digest-20261107T222726Z`: 28 tables/48,477 rows, 546 unchanged editions, five published candidates/476 manual/65 tests. Scratch storage removed.
- `python3 -m unittest discover -s ops/backups -p 'test_database.py'`: four pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 575 unit tests, 229 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Read-only source query: 36/36 enabled sources healthy/nonempty/recent. Latest edition endpoint returns four topics. Updated DATABASE-VERIFICATION/TASKS; no handbook/source behavior change.
- Four app services restarted; final health database/Redis OK, alerts clear, latest actual Nov 7 edition readable/four topics.
- Next: register additive metadata migration/future scheduled writes before noon, then spend pools/test editions. Nov 8 daily acceptance/first-week report due; passive metrics probe not due until ≥23:17 UTC.

## 2026-11-07: iteration 1253 — published-candidate reader baseline

- Clean main/no leftovers; initial alerts clear and health database/Redis OK. Development spend $0; generation cutoff respected, schema/reader/generation unchanged.
- Added GET-only `scripts/smoke-publication-candidates.ts`: reads saved inventory, checks every candidate API against totals and every topic's rendered story/post counts and story titles; fresh desktop/mobile light/dark contexts block external requests and writes. Optional app origin supports the later flagged comparison.
- `pnpm exec tsx scripts/inventory-editions.ts > /tmp/publication-inventory-1253.json` and `pnpm exec tsx scripts/smoke-publication-candidates.ts /tmp/publication-inventory-1253.json` pass: all five actual Nov 3–7 editions, 20 views, no page overflow/errors/writes. This is the old-model baseline only; new-model equality remains unverified.
- Initial selector assumption corrected to actual heading/card markup. A repeat during asset rebuilding failed to load topics; repeats after build and service restart pass. Initial lint caught an unused device label; assertion context now uses it and lint passes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 575 unit tests, 229 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Four app services restarted/active; health database/Redis OK, alerts clear. Read-only source query: 36/36 enabled sources healthy/nonempty/recent. Actual candidate edition APIs and rendering pass; no new edition generated.
- Updated TASKS/publication inventory/DATABASE-VERIFICATION. Archived progress 1235–1242 to keep this file below 25 KB. No handbook/source behavior change.
- Next: register additive metadata migration/future scheduled writes before noon, then pools/test editions and new-model comparison. Nov 8 daily acceptance/first-week report remain due; passive metrics probe ≥23:17 UTC. No blockers.

## 2026-11-07: iteration 1254 — complete publication reader fingerprints

- Clean main/no leftovers; initial alerts clear, health database/Redis OK. Development spend $0; generation cutoff respected, production schema/reader/generation unchanged.
- Added GET-only `scripts/compare-publication-content.ts capture|compare`: schema-validates every candidate, hashes the complete response with sorted object keys/preserved array order, refuses baseline overwrite and rejects content/candidate drift. Requests have 15-second timeouts and reject redirects.
- `pnpm exec tsx scripts/inventory-editions.ts > /tmp/publication-inventory-1254.json`; capture and compare pass for all five actual Nov 3–7 reader responses. Committed baseline contains IDs/hashes only. Python subprocess probes confirm overwrite, altered hash and missing candidate fail; post-restart compare passes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 575 unit tests, 229 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Four app services restarted/active; final `/healthz` database/Redis OK and `pnpm obs alerts` clear. Read-only source query confirms 36/36 enabled sources healthy/nonempty/recent. All five actual candidate APIs remain readable.
- Updated TASKS/publication inventory/DATABASE-VERIFICATION. No handbook/source behavior change; full-response comparison supplements the existing browser count/title baseline and does not claim new-model equality.
- Next: register metadata migration/future writes before noon, then spend pools/test editions and new-model API/browser comparisons. Nov 8 scheduled acceptance/first-week report due; next passive metrics probe ≥23:17 UTC. No blockers.

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
