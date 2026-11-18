# Progress

[Earlier entries](docs/progress-archive/2026-11-17-progress-before-2575.md).

[Iterations 2575–2582](docs/progress-archive/2026-11-17-iterations-2575-2582.md)

[Iterations 2583–2590](docs/progress-archive/2026-11-17-iterations-2583-2590.md)

[Iterations 2591–2597](docs/progress-archive/2026-11-17-iterations-2591-2597.md)

[Iterations 2598–2603](docs/progress-archive/2026-11-17-iterations-2598-2603.md)

[Iterations 2604–2610](docs/progress-archive/2026-11-17-iterations-2604-2610.md)

[Iterations 2611–2618](docs/progress-archive/2026-11-17-iterations-2611-2618.md)

[Iterations 2619–2626](docs/progress-archive/2026-11-17-iterations-2619-2626.md)

[Iterations 2627–2635](docs/progress-archive/2026-11-17-iterations-2627-2635.md)

[Iterations 2636–2645](docs/progress-archive/2026-11-17-iterations-2636-2645.md)

[Iterations 2646–2653](docs/progress-archive/2026-11-17-iterations-2646-2653.md).

[Iterations 2654–2658](docs/progress-archive/2026-11-17-iterations-2654-2658.md).

[Iterations 2659–2664](docs/progress-archive/2026-11-18-iterations-2659-2664.md)

## 2026-11-17: iteration 2665 — due metrics recovery checkpoint

- Clean main at 13310183; no inherited work. Alerts clear, 14 services and source snapshot healthy; digest queue has no failures, Destructoid remains paused.
- Twelve read-only samples 21:59–22:10 UTC: 24 healthy rules, 24 uncached queries ≤0.640 s; 65 small merges/1,617,262 rows since 21:06, no new big merge.
- Memory-high +1,261 (247 during window); max/OOM/kill, admission/timeout/slow-query, evaluator and process-start counters unchanged. NRestarts=0; journal quiet; disk 73%.
- Retain 2% CPU/88 MiB high/112 MiB max; resource acceptance open. No forced merge, retuning, provider calls or runtime/UI changes.
- pnpm format, pnpm lint:fix and pnpm check pass: 1,083 unit/329 integration tests, four expected skips. Evidence assertions pass via python3 /tmp/2665-summarize.py.
- Local health passes; latest probe returned HTTP 429. Existing builds retained; API/worker restart after push. No screenshot or handbook change required.
- Archived iterations 2646–2653 to keep PROGRESS.md below 25 KB. Receipts /tmp/2665-{metrics.jsonl,summary.json,services,sources,jobs,format,lint,check}.log (metrics/summary use their named extensions).
- Next: metrics ≥23:15 UTC; Bluesky full-day review after midnight; default-off Tech runtime wiring before noon.

## 2026-11-17: iteration 2666 — review published Bluesky quality

- Clean main at 00b8facb; no inherited work. Alerts/health clear; service/source checks pass, digest queue zero failures. Destructoid remains paused.
- Owner value: distinguish useful social developments from popular keyword noise before changing the reader's picks.
- Read five published Bluesky posts and 25 strongest safe texts for the actual Nov 16–17 15:00 edition window; retained texts/URLs in the review evidence JSON.
- NBA/Gaming/World supply concrete developments; U.S. picks lack the targeted Democrat/letter detail or mix prediction and opinion. Do not invent missing facts.
- Higher-engagement candidates include lexical noise, jokes, repeated Kerch claims and bare context. Retain queries, rotation, selection gates and budgets; quality remains open.
- Fixed-end coverage command and evidence assertions pass: five selected posts, 25 examples, five uncapped reads. Full UTC-day review remains due after midnight.
- No code, UI, runtime, source, provider call or generation change; existing builds retained. No screenshots or handbook update needed.
- Verification: pnpm format, pnpm lint:fix and pnpm check pass: 1,083 unit/329 integration tests, four expected skips; API rebuilt by integration harness. Receipts /tmp/2666-{format,lint,check,services,sources,jobs}.log.
- API/worker restart after push. Next: metrics ≥23:15 UTC, complete Bluesky day after midnight, Tech runtime wiring before noon.

## 2026-11-17: iteration 2667 — account for sparse U.S. X selection

- Clean main at 65a0d262; no inherited work. Alerts/health clear; 14 services and active sources healthy, digest queue zero failures. Destructoid remains paused.
- Owner value: determine whether the one-post U.S. X section misses useful reporting before loosening selection gates.
- Read all ten saved triage candidates against stored official oEmbed paragraphs: ten matches, four qualifiers, one selected; all texts nonempty/in-window and verified before publication.
- Selected confirmation claim is concrete and explicitly attributed. Other qualifiers are endorsement, unnamed stock-trading allegation and general Alaska promotion; no demonstrated stronger qualifying omission.
- Retained texts/URLs/scores and comparison in the Nov 17 edition review. Below-gate poll remains a possible alternative with missing survey context; one example does not justify lowering gates.
- No source, runtime, UI, provider or budget change; existing builds retained. No screenshot or handbook update needed.
- Evidence assertions pass: pnpm exec tsx /tmp/2667-review.ts. pnpm format, pnpm lint:fix and pnpm check pass: 1,083 unit/329 integration tests, four expected skips; receipts /tmp/2667-{services,sources,jobs,format,lint,check}.log.
- API/worker restart after push. Next: metrics ≥23:15 UTC, Bluesky full-day after midnight, Tech runtime wiring before noon.

## 2026-11-17: iteration 2668 — retain late-day Bluesky collection evidence

- Clean main at 96218bee; no inherited work. Alerts/health, services and active sources pass; digest queue zero failures. Destructoid remains paused.
- Preserved 20:54/21:54 UTC natural Bluesky results before shared queue retention can remove them; merged by job ID and verified overlapping results unchanged.
- Retained day now has 22 consecutive successful hours/110 positive matching fetched/submitted topic counts; World baseline/Ukraine rotation matches each hour.
- Updated same-hours Nov 16 comparison and daily review. These counts are repeated observations, not unique posts or editorial-quality acceptance.
- No source, runtime, UI, provider call or budget change; existing builds retained. No screenshots or handbook change required.
- Evidence: pnpm exec tsx scripts/report-bluesky-collections.ts; python3 /tmp/2668-retain.py passes all job/hour/topic/count/rotation assertions.
- Verification: pnpm format, pnpm lint:fix and pnpm check pass: 1,083 unit/329 integration tests, four expected skips; receipts /tmp/2668-{format,lint,check,services,sources,jobs,evidence}.log. API/worker restart after push.
- Next: metrics ≥23:15 UTC; retain 22:54/23:54 results and complete Bluesky day after midnight; Tech runtime wiring before noon.

## 2026-11-17: iteration 2669 — retain penultimate Bluesky hourly collection

- Clean main at f119fa94; no inherited work. Alerts/health clear; all 14 services and active sources healthy, digest queue zero failures. Destructoid remains paused.
- Preserved the natural 22:54 UTC Bluesky result before shared queue retention; existing overlapping results are unchanged.
- Retained day now covers 23 consecutive successful hours/115 positive matching topic counts; World rotation and all 24-hour collection windows pass assertions.
- Updated same-hours Nov 16 comparison and partial-day review. Counts remain repeated observations, not unique posts or editorial-quality acceptance.
- No source, runtime, UI, provider call or budget change; existing builds retained. No screenshot or handbook change required.
- Evidence: pnpm exec tsx scripts/report-bluesky-collections.ts; python3 /tmp/2669-retain.py. Receipt: /tmp/2669-evidence.log.
- Verification: pnpm format, pnpm lint:fix and pnpm check pass: 1,083 unit/329 integration tests, four expected skips; API rebuilt by integration harness. Receipts /tmp/2669-{format,lint,check,services,sources,jobs}.log. API/worker restart after push.
- Next: metrics ≥23:15 UTC; retain 23:54 result and complete Bluesky day after midnight; Tech runtime wiring before noon.

## 2026-11-17: iteration 2670 — accept real edition bookmark transport

- Clean main at afe529c8; no inherited work. Alerts/health, 14 services, active sources and digest jobs pass; Destructoid remains paused.
- Higher-priority natural evidence is not due yet: metrics ≥23:15 UTC, final Bluesky/full-day after midnight; Tech runtime waits for pre-noon under item 59.
- Saved all 25 stories/20 posts from the public Nov 17 edition through real reader controls in an isolated browser; all copies exactly match bounded public text, attribution, dates, URLs and eight explanations. No excerpt truncation.
- All 45 source/edition links, exact displayed excerpts/context and card fit pass 12 mobile/desktop, theme and 100–300% text combinations. Keyboard removal focuses the next control and announces 44 items. Four screenshots retained; no reader defect found.
- Browser requests were GET-only; saves/removals affected isolated local storage, not accounts/publication. Initial loopback probe lacked a visitor address and was denied; documented local-probe convention and public HTTPS GET pass.
- No runtime, source, UI, generation, budget or provider change. Existing builds retained; no handbook update required.
- Evidence: node /tmp/2670-saved.cjs; pnpm exec tsx /tmp/2670-verify.ts; node /tmp/2670-browser.cjs. Receipts /tmp/2670-copy-summary.json, /tmp/2670-browser.log and /tmp/2670-{services,sources,jobs}.log.
- Verification: pnpm format, pnpm lint:fix and pnpm check pass: 1,083 unit/329 integration tests, four expected skips; API rebuilt by integration harness. Receipts /tmp/2670-{format,lint,check}.log. API/worker restart after push.
- Next: metrics ≥23:15 UTC; final Bluesky collection/full-day review after midnight; Tech runtime wiring before noon. Do not repeat this completed bookmark review absent a reader regression.

## 2026-11-17: iteration 2671 — due metrics recovery checkpoint

- Clean main at e479452f; no inherited work. Alerts clear, all 14 services and active sources healthy; digest queue has no failures. Destructoid remains paused.
- Three read-only samples straddle 23:15 UTC: 24 healthy rules/six uncached queries ≤0.436 s; failure, process, evaluator and OOM counters unchanged.
- Since prior checkpoint: 68 small merges/1,774,326 rows, no new big merge, +2,005 memory-high events. Continued reclaim keeps resource acceptance open; retain CPU 2%/88 MiB high/112 MiB max.
- Worker scrape warnings align with prior restart windows; current health passes. Local/public HTTPS health and five-topic/25-story/20-post edition pass; disk 73%. Public probe used public DNS because local DNS returned the private VM address.
- No runtime, source, UI, provider call or budget change; existing builds retained, no screenshot or handbook change required.
- Evidence: pnpm exec tsx scripts/sample-metrics-recovery.ts 2 60; python3 /tmp/2671-summarize.py; /tmp/2671-summary.json and /tmp/2671-{metrics-journal,services,sources,jobs}.log.
- Verification: pnpm format, pnpm lint:fix and pnpm check pass: 1,083 unit/329 integration tests, four expected skips; API rebuilt by integration harness. API/worker restart after push.
- Next: metrics ≥00:20 UTC Nov 18; final Bluesky collection/full-day review after midnight; Tech runtime wiring before noon.

## 2026-11-17: iteration 2672 — verify expanded original-report transport

- Clean main at 58e514a0; no inherited work. Alerts clear, health database/Redis pass; monitored services, active sources and jobs checked. Destructoid remains paused.
- Higher priorities await natural evidence: final Bluesky collection/full-day after midnight, metrics ≥00:20 UTC; Tech runtime wiring waits for pre-noon.
- Reader value: readers can inspect the original reporting behind every published story at enlarged text using keyboard controls.
- Checked all 59 saved original reports beneath 25 real Nov 17 stories: destinations, headlines, timestamps and supplied publishers match publication. No transport defect found.
- Expanded lists fit mobile/desktop in both themes at 100–300% text; keyboard opening/closing preserves focus. Twelve combinations, four screenshots; third-party traffic blocked and browser requests GET-only.
- No runtime, source, generation, provider or budget change. Existing builds retained; no handbook change needed.
- Evidence: node /tmp/2672-verify.cjs; /tmp/2672-browser.log and /tmp/2672-{services,sources,jobs}.log. First browser attempt needed to wait for the asynchronous details-toggle accessible label; corrected probe waits for it.
- Verification: pnpm format/lint:fix pass; pnpm check passed typecheck/lint/format/boundaries and 1,083 unit tests, then ended with signal 15 during integration without a failed assertion. Standalone pnpm test:integration passes 329 tests/four expected skips and rebuilds API. API/worker restart after push.
- Next: final Bluesky/full-day review after midnight; metrics ≥00:20 UTC; Tech runtime wiring before noon. Do not repeat completed coverage transport review absent a reader regression.

## 2026-11-18: iteration 2673 — connect default-off Tech admission

- Clean main at 16c4be47; no inherited work. Alerts clear, 14 monitored services/active sources healthy, health database/Redis pass; disk 73%.
- Reader value: the prepared two-event reservation can now reach Tech's editor, while the default-off switch protects the existing edition.
- Added the publication consumer and `TECH_STORY_ADMISSION=1` opt-in; production remains off. Disabled/non-Tech paths preserve the legacy grouping call and exact ten-event ranking.
- Enabled Tech uses one explicit-status grouping call with the same pool/cache/budget; validated grouping reaches the shared policy. Invalid/unavailable grouping or unsuccessful triage retains baseline. Representatives, coverage and ranking order survive.
- Recorded 40-article/21-event control matches the evidence bridge, including two displacements; real publication consumer accepts validated grouping and preserves unavailable fallback. No live inference, prompt, provider, cap or source change.
- Updated the pipeline handbook and ranking notes; archived older completed-task markers to keep orientation shorter. No UI or diagram change.
- Targeted verification: 22 policy/preparation/evidence/consumer tests and 16 publication tests pass; handbook check passes (19 pages, 39 tables).
- Verification: pnpm format, pnpm lint:fix and pnpm check pass: 1,087 unit/330 integration tests, four expected skips; isolated harness rebuilt API. Receipts /tmp/2673-{targeted,publication,handbook,check-final}.log. Initial check exposed an unused rank import, removed before rerun. API/worker restart in the pre-noon window after push.
- Final Bluesky 23:54 UTC result preserved in /tmp/2673-bluesky-jobs.json; combined with the tracked prior 23 hours, all 24 jobs succeeded. Full-day review remains next. Metrics ≥00:20 UTC; consider Tech activation before noon, then scheduled acceptance.

## 2026-11-18: iteration 2674 — complete November 17 Bluesky day

- Clean main at 7699d51c; no inherited work. Initial pending worker/metrics scrape alerts cleared on recheck; 14 monitored services healthy, active sources returning content, health database/Redis pass; disk 73%. Destructoid remains paused.
- Merged the retained final hour from 2673 by job ID: 24 successful hours/120 positive matched topic counts, exact World rotation and 24-hour windows. Preserved complete results in the tracked day archive.
- Fixed-cutoff stored-observation read: distinct posts Tech 49/NBA 49/Gaming 68/World 149/U.S. 51, with no capped reads. Compared against November 16 and read all 25 strongest safe texts.
- Gaming's increased supply still has lexical noise; NBA includes satire/thin links; Tech lacks top-five launches/demos; World repeats Kerch; U.S. mixes reporting leads and commentary. Retain queries, rotation, cadence, budgets and gates; quality acceptance stays open.
- Updated the full-day review and TASKS; no runtime, UI, source, provider or budget change. Existing builds retained; no handbook/screenshot change needed.
- Evidence: /tmp/2674-{coverage.json,services.log,sources.log,jobs.log,edition.json}; tracked complete jobs/coverage linked from review. Assertions cover all hours, counts, topics, windows, World queries and five uncapped reads.
- Live reader probe returns five topics/25 stories/20 posts using an explicit public probe address after the shared loopback address hit its rate limit.
- Verification: pnpm format, pnpm lint:fix and pnpm check pass: 1,087 unit/330 integration tests, four expected skips. Isolated harness rebuilt API. Receipts /tmp/2674-{format,lint,check}.log; API/worker restart after push.
- Next: metrics recovery checkpoint ≥00:20 UTC; Tech activation assessment before noon; November 18 scheduled publication and social quality review.

## 2026-11-18: iteration 2675 — preserve Tech admission decisions

- Clean main at a0417261; no inherited work. Initial alerts clear; local health database/Redis pass.
- Owner value: the next Tech admission review can read actual reserved/displaced events rather than reconstructing the decision after publication.
- Enabled Tech now saves status/reason, admitted/reserved/displaced IDs and scored reservation members/baseline ranks in the private edition snapshot. Disabled/non-Tech paths remain receipt-free.
- Extended publication and public-read tests to verify evaluated/fallback receipts survive schema parsing and public reader responses omit them. No migration, UI, source, provider, prompt or budget change; switch remains off.
- Updated the pipeline handbook, ranking notes and TASKS. Handbook check passes: 19 pages/39 tables. No diagram changed.
- Direct targeted invocation was refused by the DB isolation guard; reran through the supported full isolated check instead. Receipts: /tmp/2675-{targeted,format,lint,check,handbook}.log.
- Due metrics checkpoint: 24 healthy rules/six queries ≤0.719 s; three 00:02 slow queries and +4,631 memory-high events keep resource acceptance open. No retuning; next ≥01:25 UTC. /tmp/2675-summary.json.
- Verification: pnpm format/lint:fix/check pass: 1,087 unit and 330 integration tests/four expected skips; isolated harness rebuilt API. Active sources healthy; digest queue zero failures. API/worker restart after commit/push.
- Next: pre-noon Tech activation decision, natural scheduled reader acceptance; metrics ≥01:25 UTC.

## 2026-11-18: iteration 2676 — activate bounded Tech admission

- Clean main at 2b2c17a4; no inherited work. Alerts clear; health database/Redis pass, services/sources/jobs checks pass; disk 73%. Metrics checkpoint is not due until ≥01:25 UTC.
- Owner value: important Tech reporting with supplied text can now survive recency/HN ranking into the editor's ten candidates. Existing saved review identifies this admission bottleneck.
- Enabled TECH_STORY_ADMISSION=1 in the private VM environment for the next natural edition; no inference call, new source, provider, prompt, pool or budget change. Two reserved events/eight usual-ranking places; invalid grouping or triage retains baseline.
- Recorded activation rationale and rollback in docs/RANKING.md; updated pipeline handbook and TASKS. Natural grouping boundaries, evidence depth and final summaries remain unaccepted pending Nov 18 publication. Disable the flag first if the new path regresses.
- Handbook check initially caught the 100-line limit; shortened the affected paragraph and reran successfully (19 pages/39 tables). Initial jobs probe used an unsupported queue name; unfiltered supported jobs --check passes.
- Live reader returns Nov 17 five topics/25 stories/20 posts; no immutable edition rewritten. No UI or diagram change, so no screenshot change.
- Verification: pnpm format, pnpm lint:fix and pnpm check pass: 1,087 unit/330 integration tests, four expected skips; isolated harness rebuilt API. Receipts /tmp/2676-{format,lint,check,handbook,services,sources,jobs}.log and reader.json. Final format/lint also pass.
- API/worker restart after commit/push loads the flag; next: Nov 18 natural scheduled reader acceptance, metrics ≥01:25 UTC.

## 2026-11-18: iteration 2677 — review published grouping provenance

- Clean main at 54458739; no inherited work. Initial alerts clear; health database/Redis pass; supported services/sources/jobs checks pass. Metrics checkpoint remains due ≥01:25 UTC.
- Owner value: distinguish shared reporting from broad subject overlap before changing coverage counts or splitting useful multi-source stories.
- Reviewed all twelve Nov 17 published multi-report groups against all 45 exact ID/URL-matched captured members; saved texts and assessments in docs/edition-reviews/2026-11-17-grouping.{md,json}.
- Seven groups supported; five retain scope/provenance uncertainty. GTA reports share Sensor Tower estimates, unlike Nov 16's separate forecasts. Empty Tech and short Gaming members remain unresolved; no new grouping wording rule.
- NBA excerpts disagree on retrospective points and a recap score; preserved attribution and immutable summaries. Published Memphis summary gives no final score. Source discrepancies do not establish a grouping failure.
- Signed-out public HTTPS latest matches all 45 coverage IDs/URLs/titles and returns five topics/25 stories/20 posts. Receipt /tmp/2677-reader.json; existing DNS override retains certificate checks.
- No model call, publisher fetch, source/provider/budget/flag change or UI change. No handbook or screenshot update needed. Tech admission remains enabled pending natural scheduled acceptance.
- Verification: pnpm format/lint:fix/check pass: 1,087 unit/330 integration tests, four expected skips; isolated harness rebuilt API. Assertions cover unique members, group/assessment counts and public projection. Receipts /tmp/2677-{format,lint,check,services,sources,jobs}.log.
- Next: natural Nov 18 admission/reader review and 04:40 retention; metrics ≥01:25 UTC. API/worker restart after push.

## 2026-11-18: iteration 2678 — retain shared-estimate GTA coverage

- Clean main at fb6c665e; no inherited work. Alerts clear; health database/Redis pass, 14 monitored services and active sources/jobs checks pass; disk 73%. Metrics checkpoint not yet due (≥01:25 UTC).
- Reader weakness: Nov 16 merged separate forecasts, but splitting all GTA coverage would also discard Nov 17's supported shared Sensor Tower estimate. Added the latter as a positive offline membership control.
- Three exact pre-publication candidates match saved reviewed IDs, URLs and excerpts; three agent-labeled positive pairs pass all six orders. Separate-all control misses three positives. Independent labels/semantic evaluation remain open.
- No production grouping, prompt, source, provider, budget, UI or flag change; Tech admission stays enabled for natural scheduled acceptance. No handbook or screenshot change needed.
- Verification: targeted grouping suite passes 19 tests; pnpm format/lint:fix/check pass, 1,088 unit and 330 integration tests/four expected skips. Isolated harness rebuilt API. Receipts: /tmp/2678-{targeted,format,lint,check}.log.
- Next: natural Nov 18 Tech admission/reader review, 04:40 retention, metrics ≥01:25 UTC. API/worker restart after push.

## 2026-11-18: iteration 2679 — restore scheduled timing evidence in public mode

- Clean main at 99a14fc0; no inherited work. Alerts clear; health database/Redis pass; services/sources/jobs checks pass. Destructoid remains deliberately paused.
- Owner value: the next morning review can measure real worker latency and inspect saved editorial/social evidence instead of losing the report to the public status projection.
- Reproduced `Edition timing report unavailable`: the private status schema rejects deliberately omitted public fields. Reporter now reads existing local OperationsStatus and saved-preview adapters, closing their DB/Redis resources afterward.
- No public API expansion, inference, jobs, provider/budget/source/flag/UI changes. Updated the affected operations handbook; no diagram or screenshot change needed.
- Live read-only report passes for the latest three scheduled editions, all five topics/edition ledgers, zero unavailable runs. Nov 17 retained worker attempt 247.549 s; scheduled completion delay 247.632 s. Immutable publication timestamps remain distinct.
- Signed-out HTTPS scheduled reader passes: five topics/25 stories/20 posts. Public status still omits job runs and model details. Handbook check passes (19 pages/39 tables). Receipts /tmp/2679-{timing,history,reader}.json and handbook.log.
- Verification: pnpm format, pnpm lint:fix and pnpm check pass: 1,088 unit tests/330 integration tests, four expected skips; isolated harness rebuilt API. Logs /tmp/2679-{format,lint,check}.log.
- API/worker restart after commit/push; next: metrics ≥01:25 UTC, 04:40 retention, natural Nov 18 Tech admission and reader review.
