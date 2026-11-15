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

## 2026-11-15: iteration 2434 — identify saved publication timezones

- Clean main at 98a35918; no inherited work. Alerts zero; health passes. Scheduled content acceptance remains pending; no provider calls.
- Owner value: saved stories and posts now identify the timezone of their publication times, matching expanded report coverage.
- Saved-item timestamps previously omitted the zone; retained local calendar/time and machine-readable instant while adding the short zone.
- Browser assertions verify exact New York/Tokyo formatting and original publication instant, desktop/mobile/320px and both themes; six screenshots refreshed, narrow/light inspected.
- Saved source controls include explicitly labelled synthetic publisher/legacy variants over saved production stories; no publication or remote writes.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, `pnpm exec tsx scripts/smoke-reader-saved-source.ts`, scheduled reader, health and `git diff --check`; receipts `/tmp/2434-*`.
- No handbook change needed for this display fix. Public mode ON; VM private.
- Next: metrics sample ≥22:04 UTC; World retained-job export by Nov 16 06:56 UTC; next natural World/NBA/Tech acceptance.
- Full check passes: 1,050 unit/329 integration tests, four expected skips; public build and all six browser cases pass. API/worker restarted; health and scheduled reader pass (five topics/23 stories/16 posts). No push blocker.

## 2026-11-15: iteration 2435 — quantify sustained metrics recovery and reclaim

- Clean main at fad98d51; no inherited work. Alerts zero, health passes, all 38 sources healthy; no failed scheduled digest runs. Daily scratch cleanup already applied; no deletion.
- Completed due metrics resource comparison: 21:54:55–22:04:59, 11 samples, 24 healthy rules, 22 uncached queries ≤0.831 s; unchanged processes and no new evaluator/admission/timeout/slow-query counters.
- Since 21:33 baseline: +181 memory-high events (+51 during sample), no max/OOM/kill; 32 small merges/1,143,475 rows, no new big merge. Sustained query/evaluation health observed; continuing reclaim keeps resource acceptance open.
- Capacity 21:56:44–21:57:44: whole-stack CPU 1.589%, sampled peak 702.5 MiB; metrics CPU 0.452%, six high events, no OOM. Checks overlap; no causal claim. Limits unchanged.
- Updated task/decision evidence; no production code, provider calls, sharing changes or observability restart. No handbook change needed.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (1,050 unit/329 integration pass, four skips), `VITE_PUBLIC_MODE=1 pnpm build`; comparison assertions pass. Receipts `/tmp/2435-*`.
- API/worker restarted; initial immediate reader/health probes ran before API startup and failed; retried after startup below.
- Next: metrics ≥23:06 UTC, ideally natural big merge; World retained-job export by Nov 16 06:56 UTC; natural content acceptance Nov 16. Public mode ON; VM private.
- Post-startup health and scheduled-reader retry pass (five topics/23 stories/16 posts); `git diff --check` clean. No push blocker.

## 2026-11-15: iteration 2436 — identify archive coverage timezones

- Clean main at b2d52476; no inherited work. Alerts zero, health passes, all 38 sources without errors. Scheduled acceptance and metrics follow-up remain time-gated.
- Owner value: archive readers can identify the timezone of each coverage boundary when comparing editions.
- Coverage windows previously showed unlabelled local times; added short timezone names while preserving exact machine-readable instants and local dates/times.
- Extended existing read-only archive browser check to New York/Tokyo and 320px; saved production history/navigation plus explicit saved-response empty/error cases, no provider calls.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`; archive browser checks, scheduled reader and health. Results below; receipts `/tmp/2436-*`.
- API/worker restarted; initial immediate browser probe preceded startup, then retried after health passed. No sharing or content-generation change; no handbook change needed for display fix.
- Next: metrics ≥23:06 UTC; World retained-job export by Nov 16 06:56 UTC; natural content acceptance Nov 16. Public mode ON; VM private.
- Full check passes: 1,050 unit/329 integration tests, four expected skips; public build and 12 archive browser cases pass. Tokyo narrow/light screenshot inspected; no overflow. Scheduled reader: five topics/23 stories/16 posts. `git diff --check` clean; older progress archived.

## 2026-11-15: iteration 2437 — measure second Ukraine pass discovery value

- Clean main at bc6524a6; no inherited work. Alerts zero; health passes, all 38 sources healthy, digest queue has no failures. Old failed transient check units are historical, not crashed app roles. Daily scratch cleanup already applied; no deletion.
- Owner value: distinguish genuinely new World reporting from refreshed popular posts before accepting the discovery pilot.
- Read all 48 exact saved 21:54 Ukraine texts in a read-only repeatable-read transaction: 13 new World identities, 35 repeated from first Ukraine pass; new outlet reporting coexists with same-event duplicates and commentary.
- Preserved all 13 new snapshots plus three repeated commentary/satire examples and sixth actual rotation job. Review names specific new developments and duplicate-event risks; retain queries, budgets and gates pending natural selection/full day.
- Assertions pass: exact cohort/identity counts, prior-post overlap, publication windows, unmodified examples, six completed jobs/rotation/unchanged companion queries/50-observation bounds. Private receipts `/tmp/2437-*`.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, public build, scheduled reader, health and `git diff --check`; results recorded below. No app or handbook behavior change; no provider calls, collection or publication writes.
- `pnpm obs jobs --check --state failed` unavailable in public mode; queue-count fallback passes with zero digest failures. Existing ingestion failures do not coincide with any unhealthy source.
- Next: metrics ≥23:06 UTC; retained-job export by Nov 16 06:56 UTC; next natural World/NBA/Tech acceptance Nov 16 15:00 UTC. Public mode ON; VM private.
- Full check passes: 1,050 unit/329 integration tests, four expected skips; public build passes. API/worker restarted; startup-aware health and scheduled-reader probes pass (five topics/23 stories/16 posts). `git diff --check` clean; no push blocker.
