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

## 2026-11-15: iteration 2421 — accept natural U.S. Bluesky contributions

- Clean main at b88ecb0c; no inherited work. Alerts zero; health, source and job checks pass. Scheduled reader agrees with five topics/23 stories/16 posts.
- Owner value: establish whether U.S. fills its social slots with distinct reporting after the Congress query change, rather than merely counting posts.
- Read ten shortlist texts and saved U.S. stories/posts. Reconstructed 561 observations, 50 exact cached scores, ten finalists in a read-only transaction; all three saved Bluesky picks match finalist membership and text. Only one of three Rupar funding posts selected; duplicated mayor commentary skipped.
- Duffy funding exchange, stock-trading letter and surveillance reporting add distinct contributions. Duffy/FAA X share context but make different claims; funding purpose cannot be inferred from the quoted text. Retain query/gates/budgets. Review, TASKS and SOURCES updated; no provider calls or publication writes.
- Verification: `pnpm exec tsx /tmp/2421-us.ts`, scheduled reader, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, `git diff --check`. Receipts `/tmp/2421-{us,reader,sources,jobs,format,lint,check,build}.log`.
- Full check passes: 1,049 unit/329 integration tests, four expected skips; public build passes. API/worker restart and post-restart health/reader checks complete before handoff.
- Next: World Gaza collection after 19:54 UTC; metrics ≥20:02 UTC. Natural World/NBA acceptance remains pending. Public mode ON; VM private, sharing stays with owner.

## 2026-11-15: iteration 2422 — review natural NBA Bluesky selection

- Clean main at 8a156c2b; no inherited work. Alerts zero; health, source/job checks and scheduled reader pass (five topics/23 stories/16 posts).
- Owner value: distinguish useful NBA social coverage from teasers/repetition and avoid weakening factual guards to fill a slot.
- Read all seven finalists and saved posts/stories. Read-only reconstruction: 622 observations, 42 exact cached scores, seven finalists; the one saved pick matches finalist text and adds concrete Pacers–Knicks officiating news.
- Two slots available, one accepted pick and one unsupported-claim rejection. Rejected wording/identity is not established; OPB offers another distinct game result, so no claim that every omitted candidate is unusable. Retain discovery/gates/budgets; no provider calls or publication writes.
- Review, TASKS and SOURCES updated. Initial `pnpm console sources:status`/`jobs:status` opened the console without running checks; corrected `pnpm obs sources --check` and `pnpm obs jobs --check` pass.
- Verification: `pnpm exec tsx /tmp/2422-nba.ts`, scheduled reader, `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, `git diff --check`; receipts `/tmp/2422-*`.
- Next: World Gaza collection after 19:54 UTC; metrics ≥20:02 UTC. Natural World/NBA acceptance pending. Public mode ON; VM private, sharing stays with owner.
- Full check passes: 1,049 unit/329 integration tests, four expected skips; public build passes. API/worker restart and post-restart health/reader checks complete before handoff.

## 2026-11-15: iteration 2423 — restore saved Bluesky continuation browser check

- Clean main at 6d5eeb78; no inherited work. Alerts zero; health and source/job checks pass. Timed World/metrics work is not due.
- Reader weakness: continuation browser check fails parsing the public-mode refusal because its loopback request lacks visitor admission. Added visitor headers and explicit HTTP status validation; replay remains GET-only with third parties blocked.
- Two real saved clipped posts and complete negative controls pass six desktop/mobile/320px light/dark cases: exact text, original destinations, keyboard focus, 44px targets and no horizontal overflow. Refreshed 12 screenshots; visually inspected both narrow post examples.
- TASKS updated. No production behavior, queries, gates, provider calls or publication writes changed.
- Verification: `pnpm exec tsx scripts/smoke-reader-bluesky-continuation.ts`, `pnpm obs sources --check`, `pnpm obs jobs --check`, scheduled reader, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, `git diff --check`; receipts `/tmp/2423-*`.
- Initial scheduled-reader probe used 08:00 instead of the actual 15:00 window and refused; corrected invocation passes five topics/23 stories/16 posts.
- Next: World Gaza collection after 19:54 UTC; metrics ≥20:02 UTC; retained jobs by Nov 16 06:56 UTC. Natural World/NBA acceptance pending; public mode ON, VM private.
- Full check passes: 1,049 unit/329 integration tests, four expected skips; public build passes. API/worker restarted and active; startup-retried health and scheduled reader pass.

## 2026-11-15: iteration 2424 — retain first natural Gaza collection

- Clean main at d45d1e10; no inherited work. Alerts zero; health, sources/jobs and scheduled reader pass (five topics/23 stories/16 posts).
- Reader weakness: generic World discovery lacks strong international supply. Captured first natural Gaza pass without manual searches, provider calls or publication writes.
- Scheduled 19:54:43–54 UTC job completed: Gaza fetched/submitted 50 observations. Four retained actual jobs verify baseline/Ukraine/baseline/Gaza, unchanged companion queries, five topics and ≤50 observations per topic.
- Read-only rolling World snapshots: 484→534 observations, 107→157 distinct posts; safe engaged candidate cap remains 50. Collection works; Gaza selection quality and full-day comparison remain pending. Queries/gates/budgets unchanged.
- Updated retained results, review, TASKS and SOURCES. Receipts `/tmp/2424-{bluesky-collections,coverage-before,coverage-after}.json`; assertions `python3 /tmp/2424-retain.py` pass.
- Verification: alerts, sources/jobs checks, scheduled reader, `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, `git diff --check`; logs `/tmp/2424-*`.
- Next: metrics sample ≥20:02 UTC; retained-job export by Nov 16 06:56 UTC; first full UTC day and natural World/NBA acceptance. Public mode ON; VM private.
- Full check passes: 1,049 unit/329 integration tests, four expected skips; public build passes. API/worker restart and post-restart health/reader verification complete before handoff.

## 2026-11-15: iteration 2425 — due metrics-store recovery observation

- Clean main at ee09155c; no inherited work. Alerts zero; health, 38 sources, job checks and scheduled reader pass (five topics/23 stories/16 posts).
- Due read-only `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` at 20:02:03–34 UTC: 24 healthy rules, four uncached queries ≤0.432 s; unchanged metrics/evaluator process starts.
- No new evaluator errors, missed iterations, admission-limit hits, queue timeouts or slow queries since 19:01:24. One small merge/16,968 rows during sample; 59 small merges/1,473,603 rows since previous sample, no big merge. User warning journal empty.
- Comparable natural compaction remains unobserved; retain CPU-only 2% trial. Updated decision evidence and TASKS; no retuning, forced merge, provider calls or publication writes.
- Initial delta assertion ran before the second sample existed and refused; rerun after completion passes all counter/process/rule assertions. Initial system journal corrected to user-unit journal.
- Verification: alerts, sources/jobs checks, scheduled reader, metrics delta assertions, `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, `git diff --check`; receipts `/tmp/2425-*`.
- Next: metrics ≥21:03 UTC; World retained-job export by Nov 16 06:56 UTC; natural World/NBA acceptance. Public mode ON; VM private, sharing stays with owner.
- Full check passes: 1,049 unit/329 integration tests, four expected skips; public build passes. API/worker restart and post-restart health/reader checks complete before handoff.

## 2026-11-15: iteration 2426 — repair saved X source-link browser check

- Clean main at 8f6bac9c; no inherited work. Alerts zero; health, 38 sources and job checks pass. Metrics sample is not due.
- Actual check defect: X source-link replay parsed the public-mode loopback refusal as JSON. Reproduced failure, then added visitor admission and explicit HTTP status validation, matching the repaired Bluesky check.
- Saved X text, original/source destinations, keyboard focus, URL separation and overflow pass six desktop/mobile/320px light/dark cases. Refreshed six screenshots and visually inspected narrow/light. GET-only replay blocks third parties; no provider calls or publication writes.
- No production behavior, queries, budgets or gates changed. TASKS updated; no handbook change needed.
- Verification: `pnpm exec tsx scripts/smoke-reader-x-links.ts`, alerts, sources/jobs, health, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, scheduled reader and `git diff --check`; receipts `/tmp/2426-*`.
- Next: metrics ≥21:03 UTC; World retained-job export by Nov 16 06:56 UTC; natural World/NBA acceptance. Public mode ON, VM private.
- Full check: 1,049 unit/329 integration tests pass, four expected skips; public build passes. API/worker restarted; startup-retried health and scheduled reader pass (five topics/23 stories/16 posts).

## 2026-11-15: iteration 2427 — restore saved-item attribution browser verification

- Clean main at 65fb4f57; no inherited work. Alerts zero; health and all 38 sources healthy, queues available and scheduled digest completed.
- Reader concern: saved bookmarks must retain the original report publisher instead of misleading aggregate provenance. Existing verification failed before assertions because public-mode loopback admission returned an empty refusal.
- Added visitor admission and explicit HTTP status validation to the GET-only replay; six desktop/mobile/320px light/dark cases pass. Real discovery/grouped saved reports and explicit synthetic publisher/legacy controls retain attribution, destinations and stored snapshots after reload.
- Refreshed screenshots and inspected narrow/light. No production behavior, provider calls, publication writes or handbook changes.
- Verification: `pnpm exec tsx scripts/smoke-reader-saved-source.ts`, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, scheduled reader, health and `git diff --check`; receipts `/tmp/2427-*`.
- Next: metrics ≥21:03 UTC; World retained-job export by Nov 16 06:56 UTC; natural World/NBA acceptance. Public mode ON; VM private.
- Full check passes: 1,049 unit/329 integration tests, four expected skips; public build passes. API/worker restart and post-restart health/reader verification complete before handoff.

## 2026-11-15: iteration 2428 — keep coverage disclosure labels accurate

- Clean main at 59ca48ae; no inherited work. Alerts zero; health, sources and job checks pass. Daily scratch cleanup already applied (2339), so no deletion.
- Owner value: screen-reader users can tell whether their expanded source coverage can be hidden, instead of hearing the misleading Show instruction.
- Reproduced expanded coverage retaining Show against the previous build; native details toggles now update the story-specific accessible label to Hide and back to Show.
- Public-mode visitor admission restored in the GET-only saved coverage replay, with explicit HTTP validation; added 320px cases and Enter/Space open/close assertions.
- No generation, query, budget, provider or sharing changes; bug fix needs no handbook update.
- Browser replay passes all 23 saved coverage controls across six viewport/theme cases; refreshed six screenshots and inspected mobile/320px light. API/worker restarted; scheduled reader passes (five topics/23 stories/16 posts).
- Verification: `pnpm exec tsx scripts/smoke-reader-coverage-labels.ts`, alerts, sources/jobs, scheduled reader, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, `git diff --check`; receipts `/tmp/2428-*`.
- Next: metrics ≥21:03 UTC; World retained-job export by Nov 16 06:56 UTC; natural World/NBA acceptance. Public mode ON; VM private.
- Full check passes: 1,049 unit/329 integration tests, four expected skips; public build passes. Final restart and health/reader checks complete before handoff.

## 2026-11-15: iteration 2429 — restore saved-excerpt browser verification

- Clean main at c3e8dea9; no inherited work. Alerts zero; health, 38 sources and scheduled queue checks pass. Metrics sample not yet due.
- Owner value: saved long stories retain readable excerpts, persistence and working source links on narrow phones.
- Reproduced browser check failing before assertions on public-mode loopback refusal; added visitor admission and explicit HTTP status validation.
- Six desktop/mobile/320px light/dark cases pass: explicit offline long-excerpt fixture shortens at a word boundary and survives reload; real saved story retains summary, source destination and keyboard focus.
- Refreshed 12 screenshots; inspected narrow/light. GET-only replay blocks third parties; no provider calls, publication writes or production behavior changes. No handbook update needed.
- Verification: `pnpm exec tsx scripts/smoke-reader-saved-excerpt.ts`, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, scheduled reader, health and `git diff --check`; receipts `/tmp/2429-*`.
- Next: metrics ≥21:03 UTC; World retained-job export by Nov 16 06:56 UTC; natural World/NBA acceptance. Public mode ON; VM private.
- Full check: 1,049 unit/329 integration tests pass, four expected skips; public build passes. API/worker restarted; startup-retried health and scheduled reader pass (five topics/23 stories/16 posts).

## 2026-11-15: iteration 2430 — review first natural Gaza cohort

- Clean main at 95f8e22c; no inherited work. Alerts zero; health, all 38 sources and scheduled queues pass.
- Owner value: establish whether World event discovery adds useful reporting before accepting a larger but noisy social pool.
- Read all 50 distinct first-pass Gaza posts by 45 authors in an explicit read-only transaction; all publication/observation bounds match the completed job. Saved 13 unmodified examples.
- Outlet reporting and a flood-image correction coexist with popular commentary, multiple languages and repeated roundup/aid-truck developments. Retain query/gates/budgets; next natural intake/selection must establish reader value.
- Retained the fifth actual pilot job: 20:54 baseline return, 46 World observations. Five-job query/completion/count assertions pass; prior four results unchanged.
- Updated source/review/task notes; archived older progress and bulky task detail. No production behavior, provider calls, publication writes or sharing changes; no handbook/UI change.
- Verification: exact saved-example/cohort assertions, `report-bluesky-collections.ts`, scheduled reader (five topics/23 stories/16 posts), `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, `git diff --check`; receipts `/tmp/2430-*`.
- Due metrics follow-up: natural 26,799,900-row/104.004 s big merge journal-confirmed at 21:00:07; 24 healthy rules, queries ≤0.096 s, no new failure/admission/timeout/slow counters. Historical self-scrape stays up; cumulative reclaim lacks pre-merge baseline. Trial retained; incident open.
- Next: metrics ≥22:04 UTC; retained-job export by Nov 16 06:56 UTC; first full pilot UTC day and natural World/NBA acceptance. Public mode ON; VM private.
- Full check passes: 1,049 unit/329 integration tests, four expected skips; public build passes. API/worker restarted; post-restart health and scheduled reader pass. No push blocker.

## 2026-11-15: iteration 2431 — restore post-context browser verification

- Clean main at 740a5485; no inherited work. Alerts zero; health, sources and scheduled queues healthy. Time-gated content acceptance remains pending.
- Reader weakness: the context browser check failed before assertions because its edition fetch lacked public-mode visitor admission.
- Restored anonymous loopback admission and explicit HTTP status checking; retained GET-only replay and blocked third parties. No provider calls or publication writes.
- Added 320px light/dark cases, browser-error and page-overflow assertions; touch and Enter/Space expand/collapse pass in six cases.
- Refreshed six screenshots; inspected narrow/light. Synthetic long context is explicitly labelled over actual saved post data. No production behavior or handbook change.
- Verification: `pnpm exec tsx scripts/smoke-reader-post-context.ts`, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, scheduled reader and `git diff --check`; receipts `/tmp/2431-*`.
- Next: metrics ≥22:04 UTC; retained World-job export by Nov 16 06:56 UTC; next natural World/NBA/Tech acceptance. Public mode ON; VM private.
- Full check passes: 1,049 unit/329 integration tests, four expected skips; public build passes. API/worker restarted; health and scheduled reader pass (five topics/23 stories/16 posts).

## 2026-11-15: iteration 2432 — make coverage publication times explicit

- Clean main at b9d5ff6f; no inherited work. Alerts zero; health and scheduled reader pass (five topics/23 stories/16 posts).
- Owner value: readers comparing reports can identify the timezone of each expanded coverage timestamp.
- Coverage used local short times without a zone; added visible timezone while retaining full calendar date and machine-readable publication instant. No selection, provider or publication changes.
- Extended real saved-coverage browser checks to exact local formatting in New York/Tokyo across desktop/mobile/320px and both themes; refreshed six screenshots.
- Initial browser attempts overlapped build and then stale API assets; rebuilt public web and restarted API/worker before verification.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, `pnpm exec tsx scripts/smoke-reader-coverage-labels.ts`, scheduled reader, health and `git diff --check`; receipts `/tmp/2432-*`.
- No handbook change needed for this display fix. Public mode ON; VM private.
- Next: metrics ≥22:04 UTC; World retained-job export by Nov 16 06:56 UTC; natural World/NBA/Tech acceptance.
- Full check passes: 1,049 unit/329 integration tests, four expected skips; public build and six browser cases pass. No push blocker.

## 2026-11-15: iteration 2433 — capture metrics memory-pressure baselines

- Clean main at 7af0a6f7; no inherited work. Alerts zero; health passes. Daily scratch cleanup already applied (2339); no deletion.
- Owner value: the next natural compaction can be assessed for memory pressure, closing the resource-evidence gap behind the unresolved metrics incident.
- Read-only sampler now saves kernel memory high/max/OOM/OOM-kill counters and current/lifetime-peak bytes; interval deltas refuse process changes, resets and invalid values.
- 21:33 sample: high=13,820, max/OOM/OOM-kill=0; no interval pressure, but +143 high events since 21:03. Current 85.2 MiB, lifetime peak 88.7 MiB; no claim of interval peak or recovery.
- 24 healthy rules, queries ≤1.517 s; no new evaluator failures, one small merge/3,654 rows, no big merge. Baseline receipt `/tmp/2433-metrics.jsonl`.
- No limits, production behavior, provider calls or sharing changes. No handbook page describes sampler internals; decision/task notes updated.
- Verification: four targeted recovery tests; `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`; full results and restart checks below.
- Next: compare memory counters at metrics sample ≥22:04 UTC; World retained-job export by Nov 16 06:56 UTC; natural World/NBA/Tech acceptance. Public mode ON; VM private.
- Full check passes: 1,050 unit/329 integration tests, four expected skips; public build passes. API/worker restarted; health and scheduled reader pass (five topics/23 stories/16 posts); `git diff --check` clean. Receipts `/tmp/2433-*`.
