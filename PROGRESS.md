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

## 2026-11-17: iteration 2659 — finish NBA original-text/context review

- Clean main at 524622b1; no inherited work. Alerts clear; services, active sources, jobs and local/public HTTPS health pass; Destructoid remains paused.
- Reviewed all four Nov 17 NBA originals against its five story summaries: four distinct events, no story repetition, no supported additional context needed. Empty reader notes comply with the editor contract; no generation change justified.
- Preserved a compact public-reader evidence record. Fresh API identity/text/note fields match the original private edition capture; internal editorial fields are excluded from the public projection.
- Playwright /tmp/2659-nba.cjs passes 390px/1440px × light/dark: four original texts/destinations match, no empty Context disclosures, no card overflow or browser errors. Four screenshots saved; mobile light inspected.
- Browser blocks third parties and writes: X media-unavailable state is intentional, not live-media acceptance. Attributed claims/engagement remain independently unverified; broader social quality remains open.
- Documentation/data only; existing application build retained. pnpm format, pnpm lint:fix and pnpm check pass: 1,078 unit/329 integration tests, four expected skips.
- Receipts: /tmp/2659-{browser,services,sources,jobs,format,lint,check}.log. API/worker restart after push.
- Next: preserve final Nov 17 Bluesky hourly results/full-day review after midnight; metrics checkpoint ≥21:05 UTC; Tech runtime switch before noon.

## 2026-11-17: iteration 2660 — metrics recovery checkpoint after 21:05 UTC

- Clean main at 47388e81; no inherited work. Alerts clear; services, active sources and jobs pass; Destructoid remains paused.
- Eight read-only samples 20:58:59–21:06:04: 24 healthy rules/16 successful expected-series queries, ≤1.883 s. No paid calls or generation change.
- Since 20:01:39: 66 small merges/1,789,261 rows, no big merge; admission/queue/slow-query/process/evaluator/OOM counters unchanged.
- Memory-high +1,214 (134 during sampling); ending 81,567,744 bytes, lifetime peak 93,560,832. Retain 2% CPU/88 MiB high/112 MiB max; resource acceptance open.
- Metrics NRestarts=0. Journal retains one 20:44:36 refused API scrape during prior restart window; current app-api up=1. Disk 72%.
- Local/public HTTPS health pass; published 6216cb7a retains five topics/25 stories/20 posts. Initial local reader probe 429; separate probe passes.
- Verification: pnpm exec tsx scripts/sample-metrics-recovery.ts 7 60; python3 /tmp/2660-summarize.py asserts eight samples, unchanged failure counters and zero admission delta.
- Documentation only; existing application build retained, no screenshots changed. pnpm format, pnpm lint:fix and pnpm check pass: 1,078 unit/329 integration, four expected skips.
- Receipts: /tmp/2660-{metrics.jsonl,metrics-error.log,summary.json,metrics-journal.log,services,sources,jobs,format,lint,check}. API/worker restart after push.
- Next: metrics ≥22:10 UTC; final Bluesky hourly retention/full-day review after midnight; runtime Tech switch before noon.

## 2026-11-17: iteration 2661 — separate glued shortlink hashtags

- Clean main at e3f38c5a; no inherited work. Alerts clear; services, active sources and jobs pass; Destructoid remains paused.
- Reader weakness: the published Tech Google Colab post joined #GoogleColab to its t.co URL, making the hashtag part of the external destination and underlined URL.
- LinkedPostText now separates shortlink hashtags, adding visual space while retaining exact saved text. Hashtags open the original post; ordinary URL fragments remain intact.
- Owner-visible result: the Learn more link and following hashtags are distinct and open their respective destinations. Generation and budgets unchanged; Tech runtime work remains for pre-noon.
- Five offline rendering controls pass: glued/Unicode hashtags, whitespace, ordinary fragments and nested redirect URLs.
- Playwright /tmp/2661-links.cjs passes 390px/1440px × light/dark: original text, destinations, keyboard order, no overflow/browser errors. Four screenshots saved; mobile light inspected.
- Browser blocks third parties and writes; media-unavailable state is intentional. Real published edition data used, no fixtures labeled live.
- VITE_PUBLIC_MODE=1 pnpm --filter @digest/web build passes and deploys atomically. Local/public HTTPS health pass; web-only change needs no service restart under STEERING 63.
- pnpm format, pnpm lint:fix and pnpm check pass: 1,078 unit/329 integration tests, four expected skips. Monitored final deployment: 15 public page/retained-asset pairs pass, no failures. Receipts: /tmp/2661-{browser,build,deploy,services,sources,jobs,format,lint,check}.log.
- Next: metrics ≥22:10 UTC; final Bluesky retention/full-day review after midnight; Tech runtime switch before noon.

## 2026-11-17: iteration 2662 — budgeted grouping to recorded Tech admission

- Clean main at f6977c88; no inherited work. Alerts clear; services/active sources healthy; Destructoid remains paused.
- Added offline end-to-end controls through real BudgetedLlm/EventGrouping, preparation, admission and editor evidence using recorded Nov 17 Tech candidates.
- Validated membership preserves reservations and attributed evidence; validated empty groups keep articles separate and authorize semantic reservations.
- Both valid outcomes replay from cache with fresh budget denied: one provider call/hold/settlement total. First-hold refusal calls no provider; invalid membership settles once without repair and retains baseline admission.
- Seven targeted tests pass. Recorded grouping boundaries remain provisional; runtime wiring is unchanged and awaits pre-noon under item 59.
- Local health passes; public HTTPS health/latest pass via previously verified proxy IP: edition 6216cb7a, five topics/25 stories/20 posts. Default DNS connection failed; initial local latest probe 429.
- pnpm format, pnpm lint:fix and pnpm check pass: 1,082 unit/329 integration tests, four expected skips. No runtime or UI changes; existing build retained; API/worker restart after push.
- Receipts: /tmp/2662-{targeted,services,sources,jobs,format,lint,check}.log. No external provider calls.
- Next: metrics ≥22:10 UTC; final Bluesky retention/full-day review after midnight; Tech runtime switch before noon.

## 2026-11-17: iteration 2663 — share verified Tech admission policy

- Clean main at 95ebd015; no inherited work. Alerts clear, 14 services healthy, active sources returning data; Destructoid remains paused.
- Moved the unchanged bounded Tech admission policy from offline scripts into the dependency-free digest domain; recorded evaluation and editor-evidence controls now import it directly.
- No publication consumer, configuration, prompt, budget or provider call changed. Runtime wiring remains for the next pre-noon window under item 59.
- Thirteen targeted policy/evidence tests pass; recorded evaluation retains 21 events/40 articles, two reservations and source-text events 1→2.
- API build passes. Local/public HTTPS health pass; default VM DNS still points to stale 10.42.0.42, previously verified public proxy IP succeeds with certificate verification.
- pnpm format, pnpm lint:fix and pnpm check pass: 1,082 unit/329 integration tests, four expected skips. Receipts /tmp/2663-{targeted,admission,services,sources,jobs,format,lint,check,build}.*. No UI change; no screenshots needed.
- API/worker restart after push; no runtime consumer connected. Next: metrics ≥22:10 UTC, final Bluesky retention/full-day review after midnight, connect default-off Tech runtime switch before noon.

## 2026-11-17: iteration 2664 — preserve triage failure through recorded editor evidence

- Clean main at 029919b8; no inherited work. Alerts clear, health passes, 14 monitored services healthy; active sources/jobs checked, Destructoid remains paused.
- Removed the recorded evidence bridge's assumed complete triage; callers now supply an explicit outcome.
- Offline control proves validated grouping cannot reserve events after failed/incomplete triage, with complete, partial or empty score sets. Baseline IDs, membership and serialized editor evidence remain identical; complete triage still displaces exactly two events.
- pnpm exec tsx --test apps/api/test/tech-admission-evidence.test.ts apps/api/test/tech-admission-control.test.ts: 14 pass. Recorded evaluation passes with --recorded-tech (initial invocation omitted required flag and was corrected).
- No runtime consumer, UI, prompts, budgets or provider calls changed. Existing build retained; no screenshot or handbook change required.
- pnpm format, pnpm lint:fix and pnpm check pass: 1,083 unit/329 integration tests, four expected skips. Initial check caught progress-entry formatting; corrected and full check rerun. Receipts /tmp/2664-{targeted,admission,services,sources,jobs,format,lint,check}.log.
- API/worker restart after push. Next: metrics ≥22:10 UTC, Bluesky full-day review after midnight, default-off Tech runtime wiring before noon.

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
