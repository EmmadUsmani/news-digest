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

## 2026-11-16: iteration 2448 — metrics recovery under verification load

- Clean main at e6bd4e25; no inherited work. Alerts zero, 38 sources healthy, scheduled queue no failures; reader five topics/23 stories/16 posts.
- Owner value: keep the metrics incident open on measured resource pressure rather than accepting query health alone; retain edition protection and existing limits.
- Read-only `sample-metrics-recovery.ts 10 60` ran early, 01:10:23–01:20:27, overlapping checks rather than waiting for 01:34. Eleven samples/24 healthy rules; 22 probes ≤1.772 s.
- Since 00:33:23: unchanged processes, no new evaluator/admission/timeout/slow-query failures; +300 memory-high events (+76 during sample), max/OOM/kill zero; 43 small merges/1,432,343 rows, no big merge. Comparison assertions pass.
- `sample-observability-capacity.ts 6 10`: stack 1.513% CPU/641.7 MiB peak; metrics 0.447% CPU, 80/240 periods throttled, five memory-high events. No runtime changes, paid calls or restart; disk 78%.
- Updated capacity decision/TASKS. Archived iterations 2436–2441 when PROGRESS exceeded 25 KB. First check caught archive formatting introduced after formatter started; corrected and reran sequentially.
- Receipts `/tmp/2448-{metrics.jsonl,summary.json,compare.py,capacity.json,metrics-journal.log,format.log,lint.log,check.log,reader.log}`.
- Next resource sample ≥02:22 UTC, preferably a natural big merge; Bluesky export by 12:36; scheduled acceptance 15:00, protect 13:00–16:00. No new blocker.
- Final `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,053 unit/329 integration pass, four expected skips; final alerts zero and `git diff --check` clean. Documentation-only deployment remains unchanged.

## 2026-11-16: iteration 2449 — bound Tech discovery alternatives

- Clean main at 4d632410; no inherited work. Alerts zero, 38 sources healthy, scheduled queue no failures, `/healthz` database/Redis green. Next edition Nov 16 15:00 UTC.
- Owner value: test whether technical discovery terms can replace commentary-heavy Tech intake without increasing collection volume or weakening relevance gates.
- Updated the existing explicit Tech probe's three alternatives; four free official searches share the window ending 01:25:51.043 UTC. AI/machine learning/LLM/OpenAI fetched 48/43/48/45, safety-engagement eligible 48/31/48/43, attached videos 3/0/1/1.
- Read all exported safe/video examples; none establishes a better launch/demo query. Preserved bounded public output and review; retain production queries and stop generic term probing until new natural selection evidence.
- Assertions pass: four expected queries/shared window, exact baseline labels, ≤50 fetched each, zero submissions/stored observations, false semantic/publication flags. Private raw receipt `/tmp/2449-tech-probe.jsonl` mode 600.
- No inference, media fetches, app-data writes or paid calls. Probe/docs-only change; running app build/configuration unchanged, no service restart required.
- Verification receipts `/tmp/2449-{format,lint,check}.log`; final results below. Next metrics ≥02:22 UTC, Bluesky export by 12:36, natural edition review 15:00; protect 13:00–16:00 UTC. No new blocker.
- Final `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,053 unit/329 integration pass, four expected skips; `git diff --check` clean.

## 2026-11-16: iteration 2450 — second Gaza cohort distinctness

- Clean main at 55744d9f; no inherited work. Read current priorities/open tasks; overnight edition and metrics acceptance not yet due.
- Disk alert initially pending; current disk 78%, no integration folders remain. Daily scratch cleanup already applied (2446), so no repeated deletion.
- Health/database/Redis green, 38 sources healthy, scheduled digest queue no failures; next edition Nov 16 15:00 UTC.
- Read-only exact 23:54 Gaza cohort: 49 distinct identities, 11 new to World/38 repeated; all repeats from first Gaza pass. Assertions pass; retained all new examples and reporting overlap comparators.
- Owner value: new identities do not equal new stories. New aid-truck mirror repeats prior reporting; outlet shelter appeal overlaps prior coverage. Retained pilot/gates/budgets pending natural selection.
- No live search, inference, media fetches, app-data writes or runtime changes; documentation-only change needs no service restart. Private receipts `/tmp/2450-{export.ts,gaza-posts.json}`.
- Verification results recorded below. Next metrics ≥02:22 UTC, Bluesky export by 12:36, scheduled review 15:00; protect 13:00–16:00. No new blocker.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,053 unit/329 integration pass, four expected skips; cohort/window/snapshot assertions and scheduled-reader provenance pass (five topics/23 stories/16 posts). Final alerts zero; `git diff --check` clean. Receipts `/tmp/2450-{format,lint,check,reader,alerts}.log`.

## 2026-11-16: iteration 2451 — overnight publication health checkpoint

- Clean main at a12c8742; no inherited work to recover or discard. Current priorities and open acceptance read; no new owner instruction.
- Owner value: confirm the public edition and scheduled intake remain healthy without stacking changes on editorial fixes awaiting natural acceptance.
- `/healthz` database/Redis green; `pnpm obs services --check` and `pnpm obs sources --check` pass, all 38 sources current. `pnpm obs jobs --check --limit 2` passes; digest queue has zero failures and next publication is Nov 16 15:00 UTC.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` passes scheduled provenance, latest/direct/history agreement: five topics, 23 stories, 16 posts.
- Initial disk alert pending; direct disk usage 78%. Today's permitted scratch cleanup already completed in 2446; no repeated deletion. Retain all resource limits.
- Reader/code inspection found no new actionable failure. Existing World fallback/Tech prose weakness already has causes recorded; no repeated historical reconstruction, query probing, speculative rules or paid calls.
- Health checkpoint only; no runtime/configuration change or service restart needed. Pending work remains metrics sample ≥02:22 UTC, retained Bluesky export by 12:36, natural edition review 15:00; protect 13:00–16:00.
- Receipts `/tmp/2451-{reader,services,alerts}.log`; repository verification results follow.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,053 unit/329 integration pass, four expected skips. Final alerts zero; `git diff --check` clean. Receipts `/tmp/2451-{format,lint,check,final-alerts}.log`.

## 2026-11-16: iteration 2452 — retain overnight Bluesky rotation evidence

- Clean main at ffadac6c; no inherited work. Read current priorities and open tasks; scheduled acceptance remains time-bound.
- Owner value: preserve actual collection results before queue retention removes the evidence needed to judge the first full rotation day.
- Read-only `pnpm exec tsx scripts/report-bluesky-collections.ts` retained Nov 16 00:54 baseline/01:54 Ukraine jobs; both complete for five topics. World fetched/submitted 48/48 and 49/49; counts are observations, not distinct or relevant posts.
- Assertions pass for two jobs, exact query order, complete status, five topic results and fetched=submitted throughout. Updated source evidence and task handoff; no production rule, search, inference or app-data write.
- `/healthz` database/Redis green; `pnpm obs services --check`, `pnpm obs jobs --check --limit 2`, `pnpm obs sources --check` pass. Initial disk alert pending, current disk 78%; today's cleanup already applied, no repeat deletion.
- Documentation/evidence only; running build unchanged, no service restart needed. Next metrics ≥02:22 UTC, extend export by 12:36, scheduled review 15:00; protect 13:00–16:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,053 unit/329 integration pass, four expected skips; `git diff --check` clean. Receipts `/tmp/2452-{format,lint,check,sources,final-alerts}.log`; no new blocker.

## 2026-11-16: iteration 2453 — due short metrics recovery checkpoint

- Clean main at daffacb7; no inherited work. Read current priorities/open acceptance; no new owner instruction.
- Owner value: confirm the metrics service continues serving healthy reads without disturbing intake or editorial changes awaiting natural acceptance. Reader weakness remains known Tech evidence scarcity/World fallback; no new editorial rule justified.
- Services, all 38 sources, scheduled jobs and `/healthz` pass; reader provenance passes for five topics/23 stories/16 posts. Initial disk alert pending; direct disk 78%, today's cleanup already done, no repeated deletion. Final alerts zero.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,053 unit/329 integration pass, four expected skips. Sampling began after checks completed and after the 02:22 checkpoint.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 2 30` passes: three samples/24 fresh healthy rules, six uncached probes ≤0.766 s; baseline comparison assertions pass.
- Since 01:20:27: +329 memory-high events, zero during this minute; max/OOM/kill=0, process starts and failure/admission/timeout/slow counters unchanged. Small merges +62/2,073,596 rows; no big merge. Memory 83.9 MiB, NRestarts=0; journal empty.
- Short checkpoint cannot establish sustained recovery; keep CPU 2%/88 MiB high/112 MiB max. Next short check ≥03:25 UTC, preferably after natural big merge; no waiting for compaction.
- Updated capacity evidence/task handoff only; runtime build unchanged, no restart needed. Bluesky export by 12:36, scheduled review 15:00; protect 13:00–16:00 UTC.
- Receipts `/tmp/2453-{format,lint,check,reader,sources,alerts}.log`, `/tmp/2453-{metrics.jsonl,summary.json,compare.py,metrics-journal.log}`. Final `pnpm format` and `git diff --check` pass; documentation-only edits after full checks.

## 2026-11-16: iteration 2454 — overnight Ukraine contribution review

- Clean main at 91c0b060; no inherited edits. Current priorities read; no new breakage or due timed acceptance.
- Owner value: distinguish genuinely new reporting from refreshed popular posts before judging the discovery pilot.
- Read all 49 saved texts from the third natural Ukraine job (Nov 16 01:54); read-only repeatable-read SQL finds nine new/40 prior identities, 27 overlapping the first pass. Assertions pass for counts and uniqueness.
- Preserved all nine new public examples: Macron statement overlaps prior coverage; military estimates are image-only; other texts include local relief, video promotion, recap and commentary. Retain attribution and event checks.
- Retained production pilot/limits. Task handoff closes further partial-pass reviews until new edition/full UTC-day evidence; no provider call, collection, app-data write or generation change.
- All 14 services/38 sources healthy; alerts zero; `/healthz` database/Redis pass. Scheduled reader provenance passes for five topics/23 stories/16 posts.
- Evidence/docs only; runtime unchanged, no restart needed. Next metrics ≥03:25 UTC, export by 12:36, edition review 15:00; protect 13:00–16:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,053 unit/329 integration pass, four expected skips. Final alerts zero; receipts `/tmp/2454-{format,lint,check,reader,final-alerts}.log`.

## 2026-11-16: iteration 2455 — compact the active task handoff

- Clean main at f9bbef76; no inherited edits. Read current priorities/open work; alerts zero, services/sources/jobs and `/healthz` pass.
- Owner value: preserve pending edition gates and deadlines in a readable handoff instead of repeatedly loading 14.9 KB of task history.
- Reader inspection finds the already-diagnosed Tech evidence scarcity, World fallback and saved NBA spoof; their fixes/proposals await natural evidence or owner approval. No new editorial rule, source request or provider call.
- Reduced TASKS.md 14,861→7,580 bytes, keeping all 22 open items/order and current timed gates. Original item bodies/evidence links and completed markers are in the 2455 task archive; moved progress 2442–2447 to its own archive.
- Preservation assertions pass for all 22 original bodies (relative link relocation only), six progress entries and 22 open markers. Relative link destinations exist in all four changed files.
- Documentation only; running build unchanged, no service restart under STEERING 63. Next metrics ≥03:25 UTC, Bluesky export by 12:36, scheduled public edition review 15:00; protect 13:00–16:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,053 unit/329 integration pass, four expected skips. Final targeted Prettier and `git diff --check` pass; receipts `/tmp/2455-{format,lint,check}.log`. No new blocker.
- Initial push rejected because remote advanced to e5d942c7 (owner status-check/lead notes only). Fetched and merged without conflicts or history rewrite; owner files preserved, runtime unchanged; pushed merged main.

## 2026-11-16: iteration 2456 — remove duplicate reader coverage citations

- Clean main at 39a4d603; no inherited work. Services/38 sources/jobs healthy, alerts zero; timed acceptance gates not yet due.
- Owner value: the latest Tech IPO story counted the same NYT article twice, cluttering its coverage list and inflating three reports from two distinct reports.
- Reader projection now collapses exact publisher/headline Google News wrappers with ≤1-second timestamp jitter; preserves later updates, different publishers/headlines, direct links and unknown dates. Saved editions, selection, summaries and collection unchanged.
- Regression `pnpm exec tsx --test apps/api/test/reader-edition.test.ts`: 8 pass, including duplicate/independent-report guards and snapshot immutability.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,054 unit/329 integration pass, four expected skips. API build passes; restarted API only, `/healthz` database/Redis healthy.
- `pnpm exec tsx scripts/check-live-coverage-dedup.ts` passes signed-out public HTTPS desktop/mobile, GET-only with no browser errors. Screenshots saved/viewed; only the duplicate NYT citation disappeared in exact before/after comparison.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` verifies five topics/23 stories/16 posts and saved scheduled provenance. Final alerts zero; receipts `/tmp/2456-{check,build,browser,provenance,alerts}.log`.
- Initial plain HTTPS curl hit the VM's managed private host mapping; browser acceptance used public DNS as existing live scripts do. No sharing/config changes, provider calls or new blocker.
- Next: metrics ≥03:25 UTC; Bluesky export by 12:36; public scheduled edition acceptance at 15:00. Protect 13:00–16:00 UTC; retain all production budgets and pilot settings.

## 2026-11-16: iteration 2457 — simplify coverage titles

- Clean main at f5ebd224; no inherited edits. Health/database/Redis and all 38 sources pass; alerts zero. Scheduled/content gates still await natural evidence.
- Owner value: Tech coverage repeated CNBC/NYT publisher names in both headlines and the outlet line, making an already long report list harder to scan.
- Display now removes only an exact trailing ` - publisher` when the report has explicit publisher metadata; the attribution below, destination, original saved title and other headlines stay intact.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,054 unit/329 integration pass, four expected skips. Receipts `/tmp/2457-{format,lint,check}.log`.
- `VITE_PUBLIC_MODE=1 pnpm --filter @digest/web build` atomically deployed under `/tmp/2457-deploy.py`: 11 public reader/previous-asset probe pairs pass, zero failed requests. No service restart for this web-only change, per STEERING 63.
- `pnpm exec tsx scripts/check-live-coverage-dedup.ts` passes public HTTPS desktop/mobile, original API titles/links and publisher credit preserved, no browser errors; screenshots updated and viewed.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` passes five topics/23 stories/16 posts with scheduled provenance; final `pnpm obs alerts` zero.
- No paid calls or new blocker. Next metrics ≥03:25 UTC, Bluesky export by 12:36, public scheduled edition acceptance at 15:00; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2458 — metrics recovery across verification load

- Clean main at fc93e6d3; no inherited work. Alerts zero, health/database/Redis, services, 38 sources and scheduled jobs pass.
- Owner value: keep resource recovery open on measured reclaim while healthy monitoring protects the scheduled public edition; no generation change justified by the saved reader's known World/Tech/NBA weaknesses.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 8 60`: nine samples, 03:18:46–03:26:52 UTC, all 24 rules fresh/healthy; 18 uncached queries ≤1.037 s.
- Compared with 02:23:32: +373 memory-high events, +37 during the sample; small merges +60/1,758,238 rows, no big merge. Processes unchanged, no new failure/admission/timeout/slow-query counters; max/OOM/kill=0. Ending memory 78.5 MiB, lifetime peak 88.7 MiB; NRestarts=0, journal empty.
- Resource acceptance stays open; CPU 2%/88 MiB high/112 MiB max unchanged. Next short check ≥04:30 UTC, preferably after natural big merge; no waiting for compaction or holding reader work.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,054 unit/329 integration pass, four expected skips. Comparison assertions pass.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` passes five topics/23 stories/16 posts with saved scheduled provenance; final `pnpm obs alerts` zero.
- Updated TASKS.md and capacity evidence. Receipts `/tmp/2458-{format,lint,check,sources,services,jobs,reader,alerts}.log`, `/tmp/2458-{metrics.jsonl,summary.json,compare.py,metrics-journal.log}`.
- Evidence/docs only: runtime unchanged, no rebuild or service restart under STEERING 63. No paid calls or new blocker. Next Bluesky export by 12:36, public scheduled edition review at 15:00; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2459 — keep the mobile reader title visible

- Clean main at 4641d494; no inherited work. Health/database/Redis and all 38 sources pass; scheduled generation remains queued for 15:00 UTC; alerts zero.
- Item 42 reader weakness: the Topics button crowded the mobile header, truncating the site title even at 390px. Moved it beside Saved items and Account; the preferences row can wrap.
- Initial 320px acceptance exposed another seven pixels of clipping; removing mobile-only date-control gaps keeps the full title and existing 44px arrow targets visible.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,054 unit/329 integration pass, four expected skips. Targeted ESLint and `git diff --check` pass.
- `VITE_PUBLIC_MODE=1 pnpm --filter @digest/web build` atomically deployed via `/tmp/2457-deploy.py`; final deploy: 15 public page/previous-asset probe pairs, zero failures; prior hashed assets retained.
- `pnpm exec tsx scripts/check-live-reader-header.ts` passes signed-out public HTTPS at 320/390/1440px: full title, controls within viewport, Topics dialog with five checkboxes, GET-only and no browser errors. Screenshots saved and viewed.
- Updated affected handbook instructions; `pnpm exec tsx scripts/check-handbook.ts 01-app/README` passes, 39 tables and no metadata warnings. No changed diagrams.
- Web-only change: no API/worker restart under STEERING 63. No paid calls, budget changes or new blocker. Receipts `/tmp/2459-{format,lint,check,deploy-final,browser-final,handbook,sources,jobs,alerts}.log`.
- Next: metrics ≥04:30 UTC, Bluesky export by 12:36, scheduled public edition/content review at 15:00; protect 13:00–16:00 UTC.

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
