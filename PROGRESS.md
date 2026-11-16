# Progress

Older entries: [earlier Nov 15](docs/progress-archive/2026-11-15-before-2346.md), [iterations 2339–2347](docs/progress-archive/2026-11-15-2339-2347.md).

Archived: [iterations 2348–2354](docs/progress-archive/2026-11-15-2348-2354.md).

Archived: [iterations 2355–2360](docs/progress-archive/2026-11-15-2355-2360.md).

Archived: [iterations 2361–2367](docs/progress-archive/2026-11-15-2361-2367.md).

Archived: [iterations 2368–2377](docs/progress-archive/2026-11-15-2368-2377.md).

Archived: [iterations 2378–2386](docs/progress-archive/2026-11-15-2378-2386.md).

Archived: [iterations 2387–2397](docs/progress-archive/2026-11-15-2387-2397.md).

Archived: [iterations 2398–2402](docs/progress-archive/2026-11-15-2398-2402.md).

Archived: [iterations 2403–2410](docs/progress-archive/2026-11-15-2403-2410.md).

Archived: [iterations 2411–2420](docs/progress-archive/2026-11-15-2411-2420.md).

Archived: [iterations 2421–2429](docs/progress-archive/2026-11-15-2421-2429.md).

Archived: [iterations 2430–2435](docs/progress-archive/2026-11-15-2430-2435.md).

Archived: [iterations 2436–2441](docs/progress-archive/2026-11-15-2436-2441.md).

Archived [iterations 2442–2447](docs/progress-archive/2026-11-16-iterations-2442-2447.md).

Archived: [iterations 2448–2455](docs/progress-archive/2026-11-16-2448-2455.md).

Archived: [iterations 2456–2459](docs/progress-archive/2026-11-16-2456-2459.md).

## 2026-11-16: iteration 2460 — recover links to hidden topic sections

- Clean main at 9081115b; no inherited work. Health/database/Redis, services, all 38 sources and scheduled jobs pass; alerts zero.
- Item 42 reader weakness: a direct topic or posts-section link silently lost its destination when that topic was hidden. The owner can now restore the topic at the link, as already supported for individual stories/posts.
- Expanded hidden-destination matching to both section anchors; existing Show action restores, scrolls to and focuses the requested heading. No saved edition or generation changes.
- Expanded browser acceptance first reproduces the missing Show button against the old deployment. Captured published-edition replay passes all four destination types on desktop/mobile in light/dark, including focus, persistence and no horizontal overflow/browser errors; screenshots updated and viewed.
- Public live-data browser matrix passed three combinations; fourth initially stalled loading the edition (5s, then 20s), then passes in isolation (`/tmp/2460-live-dark.log`). All four combinations accepted with live API data; separate signed-out public reader GET returns HTTP 200 in 0.075s. No production limits changed.
- Atomic web deployment via `/tmp/2457-deploy.py`: 16 public page/previous-asset probe pairs, zero failures. No service restart for this web-only change under STEERING 63.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,054 unit/329 integration pass, four expected skips. Targeted script ESLint, final handoff Prettier and `git diff --check` pass.
- Affected handbook updated; `pnpm exec tsx scripts/check-handbook.ts 01-app/README` passes, 39 tables and no metadata warnings; no changed diagrams.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` passes five topics/23 stories/16 posts with scheduled provenance. Final alerts zero; no paid calls or new blocker.
- Receipts `/tmp/2460-{before,format,lint,check,deploy,browser-final,browser-replay,handbook,reader,sources,jobs,services,alerts-final}.log`. Next: metrics ≥04:30 UTC, Bluesky export by 12:36, edition review at 15:00; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2461 — review published same-story coverage

- Clean main at 4a6e81d4; no inherited work. `/healthz` database/Redis green; `pnpm obs services --check`, `sources --check`, `jobs --check` pass; initial alerts zero.
- STEERING 27/42: read all Nov 15 published multi-report groups, including saved summaries/excerpts/editor evidence. Eleven groups contain 33 reader coverage entries (42 within-group pairs).
- Nine groups have apparent same-story relationships. Irving's championship reflection under the Cavaliers recap and broader Trump/Iran analysis under Vance lack enough saved prose to establish direct follow-ups; recorded both boundaries in `docs/edition-reviews/2026-11-15-grouping.md`.
- Initial raw coverage-array equality failed: expected reader projection collapses one IPO wrapper and adds one Grizzlies editor-evidence report. Corrected provenance assertions pass for every served report's ID/title/URL/time/publisher against saved coverage/evidence; no runtime defect established.
- No grouping prompt/title rules, model calls, source requests, budget changes or publication writes. Retain production grouping; natural-edition acceptance and independent evaluation remain open.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` passes five topics/23 stories/16 posts with scheduled provenance. Evidence read inside `BEGIN READ ONLY` / `ROLLBACK`.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,054 unit/329 integration pass, four expected skips. Final alerts zero; `git diff --check` passes.
- Receipts `/tmp/2461-{snapshot,edition,grouping-check}.json`, `/tmp/2461-{format,lint,check,reader,services,sources,jobs}.log`.
- Evidence/docs only: live runtime unchanged; no rebuild/restart under STEERING 63. Next metrics ≥04:30 UTC, Bluesky export by 12:36, public scheduled edition review 15:00; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2462 — remove empty post-link keyboard stops

- Clean main at 6bbb5338; no inherited work. `/healthz` database/Redis, services, all 38 sources and scheduled jobs pass; initial/final alerts zero.
- STEERING 38/42 reader weakness: the archived Gaming Geoff Keighley reminder post rendered the space between its reminder/media URLs as an unnamed, focusable link. Keyboard readers would notice the useless extra stop.
- `LinkedPostText` now renders whitespace-only segments as text; preserves the full saved excerpt and both destinations. Shared rendering also applies to saved-item excerpts; no snapshot or selection changes.
- `pnpm exec tsx scripts/smoke-reader-post-link-spacing.ts` reproduces the failure against the old deployment, then passes desktop/mobile light/dark after deployment: exact text/URLs, named links, direct Tab navigation, no overflow or browser errors. Four screenshots saved and viewed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,054 unit/329 integration pass; four expected skips. No handbook/source metadata change needed for this rendering bug.
- `python3 /tmp/2457-deploy.py` rebuilds/publishes web atomically; 12 public page/previous-asset probe pairs pass without interruption. No API/worker restart under STEERING 63.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` passes five topics/23 stories/16 posts with scheduled provenance. No paid calls, new blockers or budget changes.
- Receipts `/tmp/2462-{before,format,lint,check,deploy,browser,reader,services,sources,jobs,alerts-final}.log`; original archived snapshot `/tmp/2462-whitespace-edition.json`.
- Next: metrics ≥04:30 UTC, Bluesky export by 12:36, Nov 16 public scheduled edition/content acceptance at 15:00; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2463 — retain the first complete overnight Bluesky rotation

- Clean main at 9795f823; no inherited work. Health database/Redis green; `pnpm obs services --check`, `sources --check`, `jobs --check` pass; initial alerts zero.
- Owner value: preserve the natural discovery evidence needed to judge World query quality before shared job retention removes it; no new partial-pass quality review.
- `pnpm exec tsx scripts/report-bluesky-collections.ts` saved actual Nov 16 02:54 baseline/03:54 Gaza results alongside unchanged 00:54 baseline/01:54 Ukraine results. All four jobs completed for five topics.
- Read-only repeatable-read SQL verifies all 20 topic/job cohorts against exact execution intervals: stored observations and within-job identities equal submitted counts. World counts 48/49/48/50 include cross-job refreshes; no relevance or distinct-day supply claim.
- Updated retained day evidence, TASKS and SOURCES. Keep query/selection rules; next conservative export by 14:36 UTC, full UTC-day review after Nov 17 00:00. Edition acceptance remains at 15:00 UTC today.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` passes: five topics, 23 stories, 16 posts and scheduled provenance.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,054 unit/329 integration pass, four expected skips. Final documentation Prettier and `git diff --check` pass; alerts zero. Archived iterations 2448–2455 to keep PROGRESS small.
- Receipts `/tmp/2463-{bluesky-jobs,cohorts}.json`, `/tmp/2463-cohorts.ts`, `/tmp/2463-{format,lint,check,reader,services,sources,jobs}.log`.
- Due metrics sample 04:30–04:32: five samples/24 healthy rules, ten queries ≤0.875 s; no new failure counters or restarts. Memory-high +359 since 03:26, +5 during sample; no big merge. Resource acceptance stays open; limits unchanged, next short check ≥05:30 UTC. Receipts `/tmp/2463-{metrics.jsonl,summary.json,compare.py}`.
- Evidence/docs only: live runtime unchanged; no rebuild/restart under STEERING 63. No paid calls or new blockers; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2464 — keep enlarged reader text onscreen

- Clean main at 56042df7; no inherited work. Health database/Redis, services, all sources and scheduled jobs pass; initial/final alerts zero.
- Owner value: readers who enlarge text can still reach date/theme controls and read complete summaries and author handles without horizontal page scrolling.
- Reproduced the latest saved edition at 320px/200% text: fixed header controls expanded the document to 362px. Header now wraps; measured height positions the mobile topic bar and anchor offsets. Active-topic tracking follows the enlarged bar.
- The same check exposed overflowing summary words and Bluesky handles; reader text now wraps those without changing saved content, links, selection or generation.
- `pnpm exec tsx scripts/smoke-reader-enlarged-header.ts` passes 320/390/1440px light/dark at 200% and back to 100%: no page overflow, reachable header controls, clear topic destinations/current topic and no browser errors. Six screenshots saved; mobile/desktop images viewed.
- `python3 /tmp/2457-deploy.py` rebuilds/publishes web atomically; final 16 public page/previous-asset probe pairs pass. No API/worker restart under STEERING 63.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` passes five topics/23 stories/16 posts with scheduled provenance. No paid calls, source changes or new blockers; handbook unchanged for this rendering fix.
- `pnpm format`, `pnpm lint:fix`, final `pnpm check` exit 0: 1,054 unit/329 integration pass, four expected skips. The first combined verification ended with signal 143 during integration; the separate complete rerun passes. `git diff --check` passes.
- Receipts `/tmp/2464-{before,browser,deploy-final,format-final,lint-final,check-final,reader,services,sources,jobs,alerts-final}.log`.
- Next: metrics ≥05:30 UTC, Bluesky retention export by 14:36, Nov 16 scheduled public/content acceptance at 15:00; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2465 — verify signed-out public archive access

- Clean main at ac9e56bf; no inherited work. Health database/Redis, 14 services, 38 sources and scheduled jobs healthy.
- Initial pending disk warning cleared naturally; filesystem 78%. Nov 16 scratch cleanup already applied in 2446, so no repeated deletion.
- Added `scripts/check-live-reader-archive.ts`: real public HTTPS browser acceptance, signed out, GET/HEAD only, external requests blocked; no replay, provider calls or publication writes.
- Desktop 1440px/mobile 390px: 13 real archive entries; newest Nov 15 and oldest Nov 3 saved editions open with matching dates/topic IDs, working browser Back, no horizontal overflow or page errors. Six screenshots saved; mobile archive and oldest edition viewed.
- Public DNS resolved explicitly as in the existing handbook probe; default VM hostname resolution cannot reach public HTTPS. Deployment/sharing unchanged.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` passes five topics/23 stories/16 posts with scheduled provenance. This does not close Nov 16 scheduled acceptance.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 1,054 unit and 329 integration tests, four expected skips. `git diff --check` passes. Receipts `/tmp/2465-{format,lint,check,public-archive,reader,alerts-final}.log`.
- No runtime change: no rebuild/restart under STEERING 63. No new blockers, paid calls or source changes.
- Next: metrics ≥05:30 UTC, Bluesky retention export by 14:36, Nov 16 public scheduled publication/content acceptance at 15:00; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2466 — retain recent NBA grouping boundaries

- Clean main at e7762b4b; no inherited work. Health database/Redis, services, all sources and scheduled jobs pass. Initial pending disk warning below threshold at 78%; daily scratch cleanup already applied, no deletion repeated.
- Reader weakness: merging separate games loses distinct NBA stories. Added recent saved NBA cases to the offline grouping audit so future changes can be judged against actual edition coverage.
- Seven recorded Nov 15 reports retain saved IDs/titles/URLs/timestamps and available supplied prose; published subset only, not full intake or scheduled-input reconstruction.
- Fifteen agent labels: four positives (same game/direct injury consequence), eleven separate-game negatives. Irving retrospective remains unlabeled; six relationships stay unknown. Independent labels/semantic evaluation still needed.
- Added `--later-nba`; controls expose broad false merges and preserve unknown relationships. Production generation, budgets, sources and reader unchanged; no provider calls.
- Targeted `pnpm exec tsx --test apps/api/test/event-grouping-evaluation.test.ts`: 12 pass. First run found fixture lacked the public projection's extra Nets report; included that saved report and reran successfully.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,055 unit/329 integration pass, four expected skips; API build passes within isolated integration. Exact seven-report metadata/prose comparison passes; scheduled reader GET passes five topics/23 stories/16 posts; final alerts zero.
- `pnpm exec tsx scripts/evaluate-event-grouping.ts --later-nba` succeeds; `git diff --check` passes. Receipts `/tmp/2466-{format,lint,check,targeted-final,reader,alerts-final}.log` and `/tmp/2466-grouping.json`.
- No runtime change: no rebuild/restart under STEERING 63. Next: metrics ≥05:30 UTC, Bluesky export by 14:36, Nov 16 scheduled public/content acceptance at 15:00; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2467 — retain World grouping boundaries offline

- Clean main at 0b787456; no inherited work. Health database/Redis and sources healthy. Initial pending disk alert cleared naturally; filesystem 78%, daily scratch cleanup already recorded.
- Reader weakness: shared conflicts can collapse distinct World developments. Retained ten saved published reports spanning Bahrain, Vance, Donbas/NATO, Sudan and Gaza for future offline grouping evaluation.
- Five positive/31 negative agent headline labels; broad Trump analysis retains nine unknown relationships. Broad live blogs and Europe–Russia talks omitted. Fallback supplies no editor prose; excerpts stay empty.
- Added `--later-world`; merge-all exposes false positives/unknowns, reviewed memberships recover five positives, unresolved Vance/Trump pair stays unknown. Independent labels and semantic evaluation remain open.
- Exact saved metadata comparison passes for all ten reports. Targeted grouping tests: 13 pass; final full check includes the added positive-membership control.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass; 1,056 unit/329 integration tests, four expected skips; API build passes inside isolated integration. Scheduled reader GET passes five topics/23 stories/16 posts; final alerts zero. `git diff --check` passes.
- Offline fixtures/evaluation only: no runtime rebuild/restart under STEERING 63, no provider calls, source/budget changes or new blockers. Handbook unchanged.
- Receipts `/tmp/2467-{targeted,format,lint,check,reader,alerts-final}.log` and `/tmp/2467-grouping.json`.
- Next: metrics ≥05:30 UTC, Bluesky export by 14:36, Nov 16 scheduled public/content acceptance at 15:00; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2468 — due overnight metrics checkpoint

- Clean main at 239a0397; no inherited work. Health database/Redis, 14 services, 38 sources and scheduled queues pass; saved reader serves five topics/23 stories/16 posts.
- Due read-only metrics sample 05:31:22–05:32:22 UTC: three samples, 24 healthy/fresh rules, six expected-series queries ≤1.143 s. No new evaluator/admission/timeout/slow-query failures, process starts or restarts; max/OOM/kill zero.
- Since 04:32:20: +363 memory-high events (none during sample), 59 small merges/2,037,755 rows, no big merge. Ending memory 85.1 MiB, lifetime peak 88.7 MiB; journal empty. Short idle interval does not establish sustained recovery.
- Retained CPU 2%/MemoryHigh 88 MiB/MemoryMax 112 MiB; resource acceptance open. Updated TASKS and capacity decision. No retuning, forced merge, provider calls or runtime changes; no rebuild/restart under STEERING 63.
- Initial pending disk alert cleared naturally; disk 78%, daily scratch cleanup already applied. Final alerts zero.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 1,056 unit/329 integration tests, four expected skips; isolated API build passes. `git diff --check` passes. Receipts `/tmp/2468-{format,lint,check,reader,services,sources,jobs,alerts}.log`, metrics JSONL/summary/compare and metrics journal/error logs.
- Next: short metrics check ≥06:33 UTC, Bluesky export by 14:36 UTC, Nov 16 scheduled public/content acceptance at 15:00; protect 13:00–16:00 UTC. No new blockers.

## 2026-11-16: iteration 2469 — accept enlarged saved-content reading

- Clean main at acc9f682; no inherited work. Health database/Redis and source ingestion pass. Pending disk alert was transient; disk 79%, today's permitted scratch cleanup already recorded, no additional deletion.
- Reader value: people enlarging text can still read their saved stories/posts, follow source links and remove items without losing keyboard position. Earlier enlarged checks covered headers and empty saved state only.
- Added read-only browser acceptance using actual Nov 15 edition a0fa3916; saves one real story and one real post through the UI in isolated browser profiles, then verifies copies survive reload. No account writes or external requests.
- Six cases pass at 320/390/1440px, light/dark, 200% text: no horizontal overflow, source URLs unchanged, controls focusable, removal focuses the remaining item then the empty-state heading; announcements and browse recovery pass. Six screenshots retained; mobile light and desktop dark inspected. No layout defect established; runtime unchanged.
- Initial acceptance assertion incorrectly required inline prose links to have 44px height; corrected to exempt inline text links, retaining bounds/focus checks for them and touch-target checks for standalone controls.
- `pnpm format`, `pnpm lint:fix`, typecheck/lint/format/boundaries and 1,056 unit tests pass. Combined `pnpm check` exited 143 after integration case 333, before its summary; isolated `pnpm test:integration` rerun exits 0: 329 pass/four expected skips, API build passes. Browser check and `git diff --check` pass.
- Saved reader: five topics/23 stories/16 posts; 14 services and 38 sources healthy. Final DiskSpaceLow firing at 80% after verification; health remains OK. Daily scratch cleanup already used; no additional deletion allowed today. Receipts `/tmp/2469-{saved,format,lint,check,integration-retry,reader,services,sources,jobs,alerts}.log`. No paid calls, source/budget changes, new blockers or runtime restart under STEERING 63. Next: metrics ≥06:33 UTC, Bluesky export by 14:36, scheduled public/content review 15:00; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2470 — diagnose disk warning and safe recovery window

- Clean main at d650c523; no inherited work. Health database/Redis, 14 services, 38 sources and scheduled queues pass. Saved reader serves five topics/23 stories/16 posts; next edition remains scheduled for 15:00 UTC.
- Disk warning persists at 80% (19,748,016,128 used bytes; 5,202,124,800 available). Interrupted prior verification left `/tmp/news-digest-integration-VOU6rW`: 285,188,096 allocated bytes (272 MiB), last directory modification 05:52:46 UTC; recorded runner absent. No live integration process or test container remains.
- Corrected the handoff implication that all cleanup is forbidden today: item 61 replaces only item 51's other-scratch prohibition. Integration startup still has separate authorization to remove unused roots older than one hour, with PID/process-reference safeguards. This root is not eligible before 06:53 UTC; no age bypass, manual deletion or general scratch cleanup performed.
- TASKS now carries the exact root, size and recovery window so the next eligible verification can reclaim it. No owner action needed; warning remains open until observed recovery. Broad inventory was read-only; backups, logs, metrics, browser profiles and volumes untouched.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration tests, four expected skips; isolated API build passes. Final disk remains 80% with DiskSpaceLow firing. Receipts `/tmp/2470-{format,format-final,lint,check,services,sources,jobs,reader,alerts-final}.log`. No runtime change or restart under item 63, provider call, source/budget change or handbook change.
- Next: metrics ≥06:33 UTC; integration-startup cleanup after 06:53 UTC subject to safeguards; Bluesky export by 14:36; scheduled public/content review at 15:00. Protect 13:00–16:00 UTC.
