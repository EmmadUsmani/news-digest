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
