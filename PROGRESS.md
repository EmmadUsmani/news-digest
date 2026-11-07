# Progress

Earlier entries: [iterations 1062–1069](docs/progress-archive/2026-11-07-iterations-1062-1069.md).

Earlier entries: [iterations 1070–1074](docs/progress-archive/2026-11-07-iterations-1070-1074.md).

Earlier entries: [iterations 1075–1084](docs/progress-archive/2026-11-07-iterations-1075-1084.md).

Earlier entries: [iterations 1089–1101](docs/progress-archive/2026-11-07-iterations-1089-1101.md).

Earlier entries: [iterations 1191–1199](docs/progress-archive/2026-11-07-iterations-1191-1199.md).

Earlier entries: [iterations 1200–1207](docs/progress-archive/2026-11-07-iterations-1200-1207.md).

Earlier entries: [iterations 1208–1214](docs/progress-archive/2026-11-07-iterations-1208-1214.md).

## 2026-11-07: iteration 1215 — sustained trial and bounded progress history

- Clean main/no leftovers; prioritized open metrics incident. Alerts clear; 14 services/36 sources, jobs and app/Grafana health pass. Recent free collection verified ten posts without errors.
- Unchanged CPU-only trial exceeds 70 minutes with no restart. Five-minute cgroup sample: 1.322% whole-stack CPU/754.98 MiB peak; metrics 0.411% CPU, 364/1,114 periods throttled. All units zero memory-high/OOM/OOM kills.
- Nine thirty-second probes pass: all 23 rules healthy, both uncached queries return one series; maximum latency 0.401 s. Backup staleness evaluated at 17:11:48 UTC; admission/timeouts/slow-query counters zero.
- Small-storage merged rows 2,281,811 cumulative/indexdb 13,122/large zero. Comparable single five-million-row compaction remains unobserved; recovery and queued deployment stay open.
- Archived iterations 1200–1207 after PROGRESS exceeded 25 KB; linked history retained. Capacity decision/TASKS updated; no source/schema/handbook/UI changes.
- Verification: pnpm build passes. Initial pnpm check stopped on archive formatting; formatted and reran. Final pnpm check passes: 552 unit/228 integration tests, four expected skips; pnpm format, pnpm lint:fix and git diff --check pass.
- No paid calls or runtime/config/data changes; deliberately preserved trial instead of restarting queued app changes. Next: comparable natural compaction, queued deployment, Nov 8 scheduled acceptance.

## 2026-11-07: iteration 1216 — compare repeated reactions and campaigns

- Reader benefit: avoid spending several social slots on the same player return, game campaign or appointment reaction; these repetitions appear in the actual Nov 7 review.
- Clean main/no leftovers; services 14/14, sources 36/36, scheduled queue and app/Grafana health pass; alerts clear.
- With metrics recovery awaiting natural compaction, moved to available STEERING 42 reader work instead of repeating a monitoring-only iteration.
- Social editor v8 explicitly extends its comparison to event reactions/campaign teasers; separate newsworthy decisions, game results and releases remain eligible. No keyword grouping or selection postfilter added.
- Both-model offline request contracts pass (14 focused tests); this verifies guidance delivery, not model compliance. Next scheduled edition after deployment must establish benefit.
- pnpm exec tsx scripts/sample-observability-capacity.ts 18 10: 1.190% whole-stack CPU/759.77 MiB peak; metrics 0.366% CPU, 177/621 periods throttled; zero memory-high/OOM events.
- Nine read-only rules/uncached-query probe rounds pass: all 23 rules healthy, one series per selector, max 0.089 s. Query-failure counters zero; small merged rows 2,544,175/large zero.
- CPU-only trial exceeds 80 minutes without restart; comparable five-million-row compaction still unobserved. Queued deployment/restart remains deliberately deferred to preserve trial.
- No paid calls, runtime/config/data changes or source/schema/UI/handbook changes. Updated review/TASKS and appended item 42 ack.
- Verification: pnpm check passes (552 unit/228 integration, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass.
- Next: natural compaction recovery evidence, queued deployment, Nov 8 scheduled keyword/Bluesky/repetition acceptance.

## 2026-11-07: iteration 1217 — Nov 8 acceptance handoff

- Owner benefit: next scheduled review distinguishes deployed fixes from queued main changes and compares real content against Nov 7 failures.
- Clean main/no leftovers; services 14/14, sources/jobs checks and /healthz pass; alerts clear, all 23 rules healthy.
- Added Nov 8 checklist: exact window/revision evidence, NBA fallback, repeated posts, publisher/credit changes, per-topic X/Bluesky outcomes, cost and first-week report. No production result claimed.
- Corrected stale TASKS next-step text that still requested Nov 7 acceptance and an already-merged publisher branch.
- Metrics trial remains unchanged since 16:00:24 UTC, no restarts; query admission/timeouts/slow queries zero, small merged rows 2,556,000 cumulative, large zero. Comparable five-million-row compaction unobserved; recovery stays open.
- Verification: checklist links/report entrypoints exist; pnpm check passes (552 unit/228 integration tests, four expected skips), pnpm build, pnpm format, pnpm lint:fix and git diff --check pass.
- No paid calls, source/schema/UI changes or runtime changes. Restart deliberately deferred to preserve the isolated metrics trial and deployment gate.
- Next: natural compaction evidence, queued deployment, Nov 8 second-of-three acceptance and Nov 2–8 first-week report.

## 2026-11-07: iteration 1218 — keep dated matchup previews out of news slots

- Reader benefit: Nov 7 NBA fallback spent a story slot on a routine Knicks–Cavaliers game preview instead of substantive news.
- Clean main/no leftovers; alerts clear, services/sources/jobs checks and /healthz pass. Metrics admission/timeouts/slow-query counters zero; small merged rows 2,653,727, no active merge. Comparable large compaction remains unobserved.
- Existing matchup-preview rule missed “Game Preview: Knicks at Cavaliers, November 7, 2026”; extended it for the explicit dated matchup format, without changing grouping or prompts.
- Regression uses the saved headline/excerpt and synthetic counterexamples: both fallback ranking and AI shortlist exclude it even with highest scores; substantive game reporting and ordinary gaming previews remain eligible.
- Focused quality tests pass (4/4). Updated TASKS, item 42 ack and Nov 8 comparison checklist.
- Verification: pnpm check passes (553 unit/228 integration tests, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass. No paid calls, UI/schema/source/handbook changes or production data writes.
- Deployment/restart deliberately deferred to preserve the unchanged metrics trial and existing recovery gate. Next: compaction recovery, queued deployment, Nov 8 acceptance.

## 2026-11-07: iteration 1219 — preserve completed triage when editing fails

- Reader weakness: Nov 7 NBA editor exhaustion discarded complete triage/grouping and reverted to recency; the selected preview scored importance 3, below admission, while five importance-6 candidates covered one Porziņģis event.
- Prepared fallback retains complete triage importance order and validated coverage groups; shows unedited source excerpts, no generated brief. Partial triage and valid-empty editor behavior stay intact. No new calls or wording/grouping rules.
- Clean main/no leftovers; services 14/14, sources 36/36, jobs and /healthz healthy; saved reader still has 20 stories/18 posts. Alerts clear and all 23 rules healthy.
- Metrics trial unchanged since 16:00:24 UTC, no restarts; admission/queue-timeout counters zero, small merged rows 3,491,086, large zero. Comparable large compaction unobserved; recovery/deployment gate remains open.
- Focused quality tests 6/6 pass; direct repository-test invocation was blocked by the isolation guard, then verified through the disposable-database full suite.
- Updated TASKS, item 42 ack, Nov 7 evidence, Nov 8 acceptance checklist and affected handbook page; handbook checker passes (18 pages, one diagram, 28 tables), no diagram change.
- Verification: pnpm check passes (555 unit/229 integration, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass. No paid calls, source/schema/UI or production-data changes.
- Deployment/restart deliberately deferred to preserve the isolated metrics trial. Next: natural compaction recovery, queued deployment, Nov 8 acceptance; check importance/grouped fallback on the next natural editor failure.

## 2026-11-07: iteration 1220 — identify the Tech summary evidence limit

- Owner benefit: named why Tech reads like headlines, so the next review can distinguish missing reporting from editor omissions without speculative prompt tuning.
- Clean main/no leftovers. Read all five saved Tech summaries and their complete evidence lists: four HN excerpts empty; one Google News excerpt repeats its headline/publisher; one evidence article per story.
- HN adapter maps official item text and does not fetch linked articles; feed adapter maps supplied feed text. No evidence in this sample that supplied detail was discarded. Stopped diagnosis at that cause.
- Recorded evidence in Nov 7 review/docs/SOURCES, added Nov 8 evidence-depth comparison and TASKS follow-up; source balance remains paused/full-article work deferred. No new sources, prompts, paid calls, article-page fetches or saved-edition writes.
- Triage: services 14/14, sources 36/36, jobs checks and /healthz pass; alerts clear, all 23 rules healthy. Metrics trial unchanged since 16:00:24 UTC; admission/timeouts/slow queries zero, small merged rows 3,809,910 cumulative, large zero. Comparable natural compaction unobserved.
- Verification: read-only authenticated immutable-edition GET, adapter inspection and documentation target checks pass. pnpm check passes (555 unit/229 integration, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass.
- Deployment/restart deferred to preserve the unchanged metrics trial and existing recovery gate; this step changes documentation only.
- Next: natural compaction evidence, queued deployment, Nov 8 second-of-three acceptance and Nov 2–8 first-week report; compare Tech evidence depth before further editor changes.

## 2026-11-07: iteration 1221 — recover official Bluesky link targets

- Reader benefit: Gaming's survey and World's article link were shortened/inert; collector discarded full official link facets. One free, read-only official getPosts request confirmed both destinations.
- Prepared UTF-8-aware display expansion keeps original post text/AI evidence intact; observation snapshots and selected editions retain full HTTP(S) targets, and the reader displays them. Historical editions remain unchanged; no query/source/model/budget changes.
- Recorded the two official records; adapter checks cover emoji byte offsets, prose labels, malformed/split-Unicode/overlapping/unsafe facets. Selection/storage tests verify display text survives while original text is retained.
- Focused tests 26/26 pass. pnpm exec tsx scripts/smoke-bluesky-links.ts passes eight prepared local-preview views (two records, desktop/mobile, light/dark), with external traffic blocked, correct hrefs, no horizontal overflow/page errors; inspected screenshots in docs/screenshots/nov7-bluesky-link-*.
- Updated affected handbook/SOURCES, Nov 7 diagnosis, Nov 8 comparison, TASKS and item 42 ack. Handbook checker passes (18 pages, one unchanged diagram, 28 tables).
- Clean main/no leftovers initially. Services 14/14, sources 36/36, jobs and /healthz pass; alerts clear and all 23 rules healthy. CPU trial unchanged since 16:00:24; admission/timeouts/slow queries zero, small merged rows 3,890,176, large zero.
- One-minute cgroup sample: whole stack 1.205% CPU/766.15 MiB peak; metrics zero memory-high/OOM events, logs two memory-high events/no OOM. No comparable large compaction; recovery gate remains open.
- Verification: pnpm check passes (557 unit/229 integration, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass. Initial check stopped on concurrent formatting edits; another process ended with SIGTERM at integration startup. Persistent-terminal rerun completed green. Browser setup/locator attempts corrected before the final eight-view pass.
- Deployment/restart deferred to preserve metrics recovery gate. Next: comparable natural compaction, queued deployment, then Nov 8 scheduled X/Bluesky acceptance; newly collected link facets only, no historical rewrite.

## 2026-11-07: iteration 1222 — mark fallback excerpt truncation

- Reader weakness: Nov 7 NBA Davis-extension story ends mid-attribution at “Windhor”, exactly 600 characters, without indicating omitted text. Ranking's fixed slice caused it.
- Prepared fallback clipping now stops at a word boundary within 600 characters and appends an ellipsis. Short/exact-limit text stays unchanged; Unicode surrogate pairs stay intact. No generated wording, selection or paid calls.
- Focused quality checks pass 7/7, including cutoff boundaries and emoji; affected handbook checker passes (18 pages, one unchanged diagram, 28 tables). Historical snapshots unchanged; future fallback snapshots gain the fix.
- Clean main/no leftovers. App health, services, sources and jobs checks pass; alerts clear, all 23 rules healthy. CPU trial unchanged since 16:00:24 UTC, zero restarts; admission/timeouts/slow queries zero, small merged rows 4,184,515 cumulative, large zero. Comparable natural compaction still unobserved.
- Updated TASKS, item 42 ack, Nov 7 evidence and affected handbook; archived iterations 1208–1214 to keep progress bounded. Verification: pnpm check passes (558 unit/229 integration, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass.
- Deployment/restart deferred to preserve metrics recovery gate. Next: comparable natural compaction, queued deployment, then Nov 8 scheduled acceptance and first-week report.

## 2026-11-07: iteration 1223 — two-hour metrics recovery observation

- Highest-priority breakage: verify unchanged CPU trial before queued reader/editor deployment. Clean main/no leftovers; no runtime or production-data changes.
- Trial remains active since 16:00:24 UTC, zero restarts. Three-minute cgroup sample: 1.335% whole-stack CPU/715.40 MiB peak; metrics 0.450% CPU, 269/684 periods throttled; every sampled unit zero memory-high/OOM events.
- Services 14/14, sources 36/36, jobs checks, app/Grafana health pass; alerts clear. All 23 rules healthy at both endpoint checks; backup staleness evaluated successfully at 18:20:48 UTC (0.099 s).
- Uncached self-scrape/API selectors one series each (0.235/0.002 s); admission/timeouts/slow-query counters zero. Small merged rows 4,362,390 cumulative, indexdb 20,222, large zero; comparable single five-million-row compaction unobserved. Recovery stays open.
- Updated TASKS and capacity evidence. Verification: pnpm check passes (558 unit/229 integration, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass.
- Deployment/restart deferred to preserve the existing recovery gate. Next: comparable natural compaction, queued deployment, Nov 8 scheduled acceptance/first-week report. No paid calls.

## 2026-11-07: iteration 1224 — correlate compaction recovery evidence

- Highest-priority breakage: added bounded, read-only `scripts/sample-metrics-recovery.ts` to correlate small/big merge deltas, process identity, uncached queries, query-failure totals and fresh rule evaluations. No settings changes, forced compaction or provider calls.
- Large interval totals are candidates requiring journal confirmation, never automatic recovery; offline tests reject cumulative-total confusion, resets, invalid counters and changed processes. Invalid CLI arguments rejected before sampling.
- Live `pnpm exec tsx scripts/sample-metrics-recovery.ts 2 30` at 18:25:09–18:26:09 UTC: 171,517/3,476 small rows in one merge each, big zero, all 23 rules healthy/fresh, six queries healthy/max 0.167 s; admission/timeouts/slow queries zero.
- `pnpm exec tsx scripts/sample-observability-capacity.ts 6 10`: 60.038 s, 1.592% CPU/717.79 MiB peak; metrics 0.619% CPU/145 of 265 periods throttled; all units zero memory-high/OOM events. CPU trial unchanged since 16:00:24, zero restarts; no comparable large compaction.
- Clean main/no leftovers initially; services 14/14, sources 36/36, jobs and /healthz pass, alerts clear. Updated TASKS and capacity evidence; item 33 closed and items 39/34 await Nov 8 production evidence.
- Verification: pnpm check passes (560 unit/229 integration, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass. Grafana health HTTP 200/database OK.
- Deployment/restart remains deferred to preserve the recovery gate. Next: use correlated probe alongside cgroup sampling through natural comparable compaction, then queued deployment and Nov 8 acceptance/first-week report.

## 2026-11-07: iteration 1225 — paired recovery observation

- Clean main/no leftovers. Highest-priority metrics recovery gate remains open; no runtime changes, forced compaction, production writes or paid calls.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 6 30` at 18:31:04–18:34:06 UTC: seven small merges/46,332 rows, no big merges; all 23 rules healthy/fresh, fourteen uncached queries passed/max 0.581 s; admission/timeouts/slow queries zero.
- Paired `pnpm exec tsx scripts/sample-observability-capacity.ts 18 10`: 180.177 s, 1.297% whole-stack CPU/723.57 MiB sampled peak; metrics 0.421% CPU, 232/653 periods throttled; every unit zero memory-high/OOM events. Trial unchanged since 16:00:24, zero restarts.
- `pnpm obs services --check`, `sources --check`, `jobs --check`, `alerts`: 14/14 services, 36/36 sources, jobs healthy, no active alerts. App health/database/Redis and Grafana HTTP/database OK; initial Grafana probe used wrong port, corrected to configured 3001.
- Updated TASKS and capacity evidence. Verification: pnpm check (560 unit/229 integration, four expected skips), pnpm build, pnpm format, pnpm lint:fix and git diff --check pass.
- Deployment/restarts remain deferred: comparable natural five-million-row compaction unobserved. Next: capture recovery evidence, deploy queued changes, then Nov 8 scheduled acceptance/first-week report.
