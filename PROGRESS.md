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

## 2026-11-07: iteration 1243 — bounded bookmark storage foundation

- Clean main/no leftover work. Alerts and `/healthz` healthy; all four topics' connected sources healthy (36 total), saved Nov 7 edition readable, next scheduled digest Nov 8 15:00 UTC. No paid calls or publication/sharing changes.
- STEERING 50 waiting path: extracted the version-1 browser store; existing hidden-topic records remain compatible and topic writes preserve bookmark records. Added bounded display copies (title 300, excerpt 600, attribution 200, URL 2,048, platform 40, edition ID 200 characters), HTTP(S)-only destinations and no credentials/unknown fields.
- Bookmark writer permits 1,000 distinct identities including removal tombstones, refuses new identities at capacity, and permits existing saves/removals. Per-key timestamps advance despite clock rollback; newest-record merging preserves stale-tab removals. Controls, cross-tab bookmark mutation and `/saved` remain next; no phase completion claimed.
- Five offline store tests pass: legacy reload, stale merge/removal/re-save, limits/unsafe destinations/field stripping, capacity and prototype-shaped identities. Browser `pnpm exec tsx scripts/smoke-reader-preferences.ts` passes desktop/mobile light/dark, now asserting topic writes preserve an explicit offline bookmark fixture; refreshed screenshots, mobile light inspected. Fixture never rendered or called live.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 2`: 21:16 UTC passive sample, 23 healthy rules, four queries ≤0.194 s, no new evaluator errors/misses or merges. Incident stays open; next probe ≥22:16 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` pass. Four app services restarted; final alerts clear and database/Redis healthy. Internal store change needs no handbook/schema/source update.
- Full `pnpm check` exits 0: typecheck/lint/format/boundaries, 572 unit tests and 229 integration tests pass/four expected skips. Browser regression and final formatting also pass. Next: connect bookmark controls and `/saved`; Nov 8 edition review/first-week report and phase-0 publication decisions remain open.

## 2026-11-07: iteration 1244 — story bookmarks and saved-items page

- Clean main/no leftover work. Alerts clear, `/healthz` database/Redis OK, 14 services/36 sources healthy; next digest Nov 8 15:00 UTC. Metrics passive probe not due before 22:16 UTC. Development spend $0; no provider/publication/sharing changes.
- STEERING 50 waiting path: story Save toggles and `/saved` retain bounded display copies with original/edition links, newest-first ordering and removal tombstones. Cross-tab mutation rereads/merges the browser store; failed writes retain page state with explicit warnings; capacity errors are surfaced. Flag-off build removes controls and the saved route.
- `pnpm exec tsx scripts/smoke-reader-bookmarks.ts`: actual saved edition, original/edition destinations, save/reload/remove/re-save, cross-tab changes, blocked storage and no horizontal overflow pass desktop/mobile light/dark; GET-only/external requests blocked. Eight screenshots saved; saved mobile light inspected.
- Initial added mobile-header overflow assertion caught crowding; moved Saved items below the sticky header, rebuilt and all four views pass. Existing `pnpm exec tsx scripts/smoke-reader-preferences.ts` also passes all four views, including old editions, legacy-topic storage, corrupt/blocked storage and bookmark-envelope preservation; eight screenshots refreshed.
- Updated app handbook; `pnpm exec tsx scripts/check-handbook.ts 01-app/README` passes (18 pages, one unchanged diagram, 28 tables). First handbook call raced API restart/readiness; rerun passes. No schema/source changes.
- Verification: `pnpm check` passed typecheck/lint/format/boundaries and 572 unit tests, then received SIGTERM during integration without reported failures. Separate `pnpm test:integration` exits 0: 229 pass/four expected skips. `pnpm format`, `pnpm lint:fix`, full `pnpm build`, final web rebuild and `git diff --check` pass. Four app services restarted; final health/alerts/services/sources and `/saved` HTTP checks pass.
- Next: post bookmark controls and remaining phase-2 acceptance, including a normal scheduled edition; phase-0 publication decisions remain owner-blocked. Nov 8 edition review/first-week report and metrics incident remain open.

## 2026-11-07: iteration 1245 — bookmark social posts

- Clean main/no leftover work. Initial alerts and `/healthz` healthy; 36/36 connected sources healthy, zero source errors, social collection completed; next digest Nov 8 15:00 UTC. Metrics passive probe not due before 22:16 UTC. Development spend $0.
- STEERING 50 waiting path: Save toggles for X, Bluesky and Reddit use namespaced JSON platform/external-ID tuples and the existing bounded browser store. `/saved` shows platform/author/text with original/edition links and removal controls; story saves remain compatible. No generation, provider, publication, schema or sharing changes.
- `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` exits 0: all 18 actual Nov 7 posts (15 X/three Bluesky), save/reload/original links/remove/re-save/cross-tab updates pass desktop/mobile light/dark. GET-only with external requests blocked; exercises saved-text/embed-failure view, no live Reddit claim. Eight bookmark/saved screenshots refreshed; saved desktop/mobile light inspected.
- `pnpm exec tsx scripts/smoke-reader-preferences.ts` exits 0: old-edition topics, reload, cross-tab/tombstones, corrupt/blocked storage and all-hidden recovery pass four views; screenshots refreshed. Updated app handbook; `pnpm exec tsx scripts/check-handbook.ts 01-app/README` passes (18 pages, one unchanged diagram, 28 tables). No source metadata change.
- Full `pnpm check` exits 0: typecheck/lint/format/boundaries, 572 unit and 229 integration tests pass/four expected skips. `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` pass. Four app services restarted; final health database/Redis OK and alerts clear. Commit/push follows verification.
- Next: remaining phase-2 acceptance (including normal Nov 8 scheduled edition with preferences enabled); phase-0 publication decisions remain owner-blocked. Daily edition/X/Bluesky review and first-week report remain due Nov 8; metrics incident remains open.

## 2026-11-07: iteration 1246 — historical bookmark acceptance

- Clean main/no leftover work. Alerts clear, `/healthz` database/Redis OK, 36/36 sources healthy; next scheduled digest Nov 8 15:00 UTC. Metrics probe not due before 22:16 UTC. Development spend $0.
- STEERING 50 waiting path: extended bookmark browser acceptance to the actual Nov 6 edition `1c83e78b-47f9-4a6f-bfb4-93820a691aea`. Historical story/post display copies retain original destinations and their historical edition link; reload, cross-tab removal and removal reload verified desktop/mobile light/dark.
- `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` exits 0 for all four views, including existing Nov 7 18-post coverage, storage warnings and layout checks. GET-only/external requests blocked; refreshed screenshots, inspected saved desktop/mobile light. First smoke attempt used an incorrect article selector; corrected to the actual list-item structure and rerun passed.
- No product, generation, schema or source changes; handbook/source metadata unchanged. Phase 2 remains open pending a normal scheduled edition with preferences enabled; phase 0 publication decisions remain owner-blocked.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` pass. `pnpm check` passes typecheck/lint/format/boundaries and all 572 unit tests, then SIGTERM during integration without reported failure; separate `pnpm test:integration` exits 0: 229 pass/four expected skips. Four app services restarted; final health/alerts clear.

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
