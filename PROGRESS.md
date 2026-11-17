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

## 2026-11-17: iteration 2654 — expose explicit grouping outcome

- Clean main at 9030c8bb; no inherited work. Alerts clear; services, active sources and digest queue checks pass; local health healthy.
- Tech prerequisite: valid empty membership and a refused/failed grouping call previously shared the same empty-array return.
- Added public validated/unavailable grouping result with bounded skip/failure reasons; retained legacy group API, membership, prompts, fingerprint, no-repair behavior and budgets.
- No admission switch/selection change or provider calls. Runtime shortlist consumption/default-off Tech switch remain for the next pre-noon step.
- Targeted: pnpm exec tsx --test apps/api/test/{event-grouping,group-shortlist,event-grouping-evaluation-ledger}.test.ts — 25 pass.
- pnpm format, pnpm lint:fix, pnpm build and corrected-tree pnpm check pass: 1,072 unit / 329 integration passes, four expected skips. Initial full check raced export-sort autofix; rerun passed.
- API/worker restarted; 14 services healthy, digest queue healthy; local/public HTTPS health pass. Public edition serves five topics/25 stories/20 posts.
- Public check uses current public DNS override; default VM hostname mapping still refuses port 443. No UI changes; no screenshot update needed.
- Receipts: /tmp/2654-{targeted,format,lint,build,check-final,services-final,jobs-final}.log; git diff --check passes.
- Next: metrics checkpoint ≥20:00 UTC; wire explicit grouping status into Tech reservation before natural scheduled acceptance.

## 2026-11-17: iteration 2655 — due metrics recovery checkpoint

- Clean main at 5c77994d; no inherited work. Alerts clear; 14 monitored services, active sources and digest queue pass; Destructoid remains paused.
- Six read-only samples 19:56:37–20:01:39 UTC: 24 healthy rules, 12 uncached queries ≤0.753 s; no new admission/timeout/slow-query/evaluator/OOM events or process restart.
- Since prior checkpoint: 65 small merges / 2,151,711 rows; no new big merge. Memory-high +841 (+88 during sampling), ending 89,276,416 bytes / lifetime peak 93,560,832; disk 71%.
- Retain CPU 2% / MemoryHigh 88 MiB / MemoryMax 112 MiB; continued reclaim leaves resource acceptance open. No retuning, forced merge or provider calls.
- Updated capacity evidence/TASKS; archived iterations 2636–2645 to keep PROGRESS below 25 KB. No product/runtime change or screenshot refresh required.
- Verification: pnpm exec tsx scripts/sample-metrics-recovery.ts 5 60; python3 /tmp/2655-summarize.py; pnpm obs services/sources/jobs --check; local/public HTTPS health; five published topics/25 stories/20 posts.
- pnpm check passes: 1,072 unit / 329 integration tests, four expected skips; pnpm format, pnpm lint:fix and git diff --check pass. Documentation-only; existing build retained.
- Receipts: /tmp/2655-metrics.jsonl, /tmp/2655-summary.json and /tmp/2655-{metrics-journal,services,sources,jobs,check,format,lint}.log. API/worker restart and final health at handoff.
- Next: metrics checkpoint ≥21:05 UTC; Tech grouping status/shortlist preparation and default-off switch before the next noon deployment window.

## 2026-11-17: iteration 2656 — prepare explicit shortlist grouping status

- Clean main at b2065ed6; no inherited work. Alerts, services, active sources, queues and local health pass; Destructoid remains paused.
- Owner value: future Tech evidence reservations can distinguish deliberate separate events from failed grouping without risking duplicate event admission.
- Added isolated prepareStoryGrouping transport with validated/unavailable status, explicit matcher and membership; publication remains on the existing path.
- No runtime consumer, switch, selection change or provider calls; deployment/activation remains restricted to before noon UTC.
- Four offline tests cover empty validation, rank/coverage transport, failed/invalid membership and bounded no-call inputs.
- Verification: pnpm exec tsx --test apps/api/test/prepare-story-grouping.test.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build. All pass: 1,076 unit / 329 integration, four expected skips; build succeeds.
- Nine combined targeted tests pass; public HTTPS health and edition pass (five topics/25 stories/20 posts). Initial local reader probe returned 429; public probe succeeded.
- API/worker restart at handoff; receipts /tmp/2656-{targeted-final,format,lint,check,build,services,sources,jobs}.log. No UI change or screenshot refresh.
- Next: connect preparation/default-off Tech runtime switch before noon; metrics checkpoint ≥21:05 UTC.

## 2026-11-17: iteration 2657 — prepared grouping through recorded Tech admission

- Clean main at 0721bce7; no inherited work. Alerts clear; 14 services, active sources, digest queue and local/public health pass; Destructoid remains paused.
- Recorded-only evidence bridge now consumes prepared grouping status/matcher. Validated recorded membership preserves representatives, coverage, reservations and editor evidence.
- Unavailable grouping retains separate-article baseline evidence with no reservations. Runtime publication, prompts, caps and paid traffic unchanged; generation deployment remains pre-noon only.
- Seven targeted tests pass: pnpm exec tsx --test apps/api/test/prepare-story-grouping.test.ts apps/api/test/tech-admission-evidence.test.ts.
- pnpm format, pnpm lint:fix and pnpm build pass. Initial check raced import-sort autofix; corrected-tree pnpm check passes: 1,078 unit/329 integration, four expected skips.
- Public HTTPS health and latest edition pass: five topics/25 stories/20 posts; initial local reader request returned 429. No UI change or screenshot refresh.
- API/worker restarted after push; final health checked at handoff.
- Receipts: /tmp/2657-{targeted-final,format,lint,build,check-final}.log. Next: pre-noon default-off runtime switch; metrics checkpoint ≥21:05 UTC.

## 2026-11-17: iteration 2658 — preserve today's Bluesky rotation evidence

- Clean main at 4cf03752; no inherited work. Alerts clear; 14 services, active sources and queues pass; Destructoid remains paused.
- Owner value: preserve the hourly evidence needed to judge World query rotation before shared queue retention removes it.
- Tech runtime connection remains pre-noon only; no generation deployment. Date navigator probe passes at 320px/300%; archive already has empty-page recovery, so no UI change was made.
- Exported Nov 17 00:54–19:54 UTC: 20 successful hourly jobs, 100 positive fetched/submitted matches, five unique topics each, no hourly gaps and expected World rotation.
- Retained results and partial-day comparison cover the same first 20 Nov 16 hours; counts are observations, not unique/relevant posts. Queries and gates unchanged; final four hours/full UTC-day quality review remain open.
- Verification: pnpm exec tsx scripts/report-bluesky-collections.ts plus Python assertions for job/hour/topic uniqueness, successful states, positive matching counts and exact rotation; pnpm obs services/sources/jobs --check; git diff --check.
- Local/public HTTPS health pass; published edition 6216cb7a retains five topics/25 stories/20 posts. VM DNS still maps public hostname to stale 10.42.0.42; curl --resolve with public DNS 161.210.94.95 succeeds with certificate checks intact.
- Documentation/data only; existing application build retained, no screenshots changed. pnpm format and pnpm lint:fix pass; pnpm check passes: 1,078 unit/329 integration tests, four expected skips.
- Receipts: /tmp/2658-{bluesky-jobs,edition}.json and /tmp/2658-{services,sources,jobs,format,lint,check}.log. API/worker restart after push.
- Next: preserve 20:54–23:54 UTC results and complete day review after midnight; metrics checkpoint ≥21:05 UTC; runtime Tech switch before noon.

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
