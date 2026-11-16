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

Archived: [iterations 2460–2467](docs/progress-archive/2026-11-16-2460-2467.md).

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

## 2026-11-16: iteration 2471 — keep archived publisher labels within enlarged layouts

- Clean main at 1c969e95; no inherited work. Health database/Redis, services, sources and scheduled queues pass. DiskSpaceLow remains at 80%; no deletion, age bypass or extra general scratch cleanup. Integration root eligibility remains 06:53 UTC.
- Reader weakness: signed-out oldest archive edition `777fdd95` overflowed at 320px/200% text because publisher flex labels retained their minimum content width (Hacker News hostname and GamesIndustry.biz). Labels now shrink and wrap anywhere; destinations and provenance are preserved.
- Extended public HTTPS archive acceptance to 320/390/1440px, light/dark, 200% text. Real recent/oldest editions preserve dates/topics, back navigation, keyboard focus and publisher-link bounds; no page overflow or browser errors. Screenshots retained; narrow light/dark publisher examples inspected. No fixture labeled live, provider calls or account writes.
- Web built and published atomically with previous hashes retained; 16 public HTML/previous-asset probe pairs all HTTP 200 with nonempty app/asset. No API/worker change or restart under item 63. No handbook change needed for this layout fix.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration tests, four expected skips; isolated API build passes. First command-session check exited 143 during format validation; complete rerun in transient user unit exits 0. Public browser check passes six cases; 14 services/38 sources healthy, saved latest reader retains five topics/23 stories/16 posts. Receipts `/tmp/2471-{format,lint,check-service,archive-verified,deploy-probe,services,sources,jobs,alerts-final}.log`. Disk warning remains the sole alert; no new blocker.
- Next: metrics ≥06:33, integration-startup cleanup ≥06:53 subject to safeguards, Bluesky export by 14:36, scheduled public/content acceptance at 15:00 UTC. Protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2472 — due metrics checkpoint under verification load

- Clean main at addd3574; no inherited work. Health database/Redis, 14 services, 38 sources and scheduled queues pass. Saved scheduled reader retains five topics/23 stories/16 posts.
- Due metrics recovery check spanned 06:29:13–06:34:17 UTC and repository verification load: 11 samples, 24 fresh healthy rules, 22 expected-series queries ≤0.684 s. Both process starts, evaluator failures/missed, admission, timeout and slow-query counters unchanged; max/OOM/kill zero, NRestarts=0.
- Since 05:32:22, memory-high +440 (42 during sample); 75 small merges/1,560,739 rows, no big merge. Ending memory 84.2 MiB, lifetime peak 88.7 MiB. No metrics journal entries. Continuing reclaim keeps acceptance open; retain CPU 2%/88 MiB high/112 MiB max. Next short checkpoint ≥07:35 UTC, preferably after natural big merge; do not hold reader work.
- Disk remains 80%, sole firing alert. Abandoned integration root not yet eligible at startup; no manual deletion, age bypass or extra general scratch cleanup. Existing cleanup window ≥06:53 UTC remains.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration tests, four expected skips; isolated API build and saved-reader provenance check pass. Receipts `/tmp/2472-{format,lint,check,build,reader,services,sources,jobs,alerts-final}.log`, metrics JSONL/summary/compare/error/journal.
- No runtime change/restart under item 63, provider call, source/budget change or handbook change. Next: eligible integration cleanup, Bluesky export by 14:36 UTC, scheduled public/content review 15:00 UTC; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2473 — reclaim abandoned integration coverage and clear disk warning

- Clean main at be5629fc; no inherited work. Owner-visible benefit: disk capacity recovers and the sole operational alert clears, protecting content collection and the next edition.
- Existing integration startup at 06:53:05 UTC reclaimed `/tmp/news-digest-integration-VOU6rW`, 285,188,096 allocated bytes (272 MiB), after its one-hour age window. Existing PID/process-reference safeguards remained unchanged; no manual deletion, timestamp change, extra general scratch cleanup or deletion outside integration roots. Disk immediately fell 80%→78%.
- `pnpm obs alerts` at 06:54:46 UTC reports zero firing/pending alerts. Health database/Redis, 14 services, 38 sources and scheduled queues pass; saved Nov 15 scheduled reader provenance passes with five topics/23 stories/16 posts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, isolated API build, cleanup safeguard test and `git diff --check` pass: 1,056 unit/329 integration tests, four expected skips. First integration startup was too early to reclaim the abandoned root; the separate eligible startup exits 0 (329 pass/four expected skips), verifies recovery through the normal runner and removes its own root. Final disk remains 78%. The 06:58 final assertion caught renewed DiskSpaceLow pending during coverage; after runner cleanup the 07:00 snapshot and metric confirm zero firing/pending and 20.97% available.
- Archived progress 2460–2467 after PROGRESS exceeded 25 KB, and older completed task markers; open priorities/evidence retained. No runtime changes or restarts under item 63, provider calls, source/budget changes, handbook changes or new blockers.
- Receipts `/tmp/2473-{format,lint,check,build,cleanup-safeguards,recovery,reader,health,services,sources,jobs,alerts-final}.log`. Next: metrics ≥07:35 UTC, Bluesky export by 14:36, scheduled public/content review 15:00; protect 13:00–16:00 UTC.
