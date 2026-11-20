# Progress

Earlier entries: [through iteration 3019](docs/progress-archive/2026-11-20-iterations-through-3019.md).

## 2026-11-20: iteration 3020 — refuse unattributed protected work

- Clean main at 8e7a6f21; no inherited work. Alerts clear, /healthz passes, API/worker active; disk 61%.
- All offline protected estimators now reject blank/whitespace edition and topic IDs before preparing requests, even for empty pools. Joint grouping rejects duplicate topic identities before its zero-call path.
- Regression exercises story, social, both triage routes and both grouping routes with missing identities and valid zero-call controls; no provider calls or production behavior changes.
- Developing stories stays inactive; whole-morning pool/context completeness and semantic acceptance remain open. Nov 20–22 recall reviews await scheduled editions.
- Verification: pnpm exec tsx --test apps/api/test/protected-obligation-identity.test.ts (pass); pnpm format; pnpm lint:fix; pnpm check; pnpm build. Logs /tmp/3020-{target,format,lint,check,build}.log; final results below.
- Reader gate: pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-19T15:00:00Z verifies real Nov 19 edition, 25 stories/22 posts. No source/schema/UI/handbook behavior changes.
- Full checks/build pass: 1,257 unit tests, 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3021 — declared protected-work coverage

- Clean main at 3775ee03; no inherited work. Alerts clear, /healthz healthy, API/worker running, disk 61%. Nov 20 edition not yet due.
- Added offline stage/topic/context inventory validation before combining protected request bounds. Missing/duplicate/unexpected slots refuse; explicit zero-call slots count, joint grouping topic order is canonical, and foreign edition/topic attribution refuses. Returned requests are isolated copies.
- Coverage is only against the caller-declared inventory, not proof of dynamic morning completeness. No production activation, provider calls, source/schema/UI or handbook behavior change; developing stories stays inactive.
- Targeted tests pass (three): real grouping zero-call bounds, missing platform context, duplicate joint order, foreign attribution and mutation isolation.
- Verification: pnpm exec tsx --test apps/api/test/protected-work-manifest.test.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build. Logs /tmp/3021-{target,format,lint,check,build}.log.
- Reader gate: pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-19T15:00:00Z verifies real Nov 19 edition, 25 stories/22 posts. Final checks and service restart recorded below.
- Initial full check found new-test import order; autofixed before rerunning the full gate.
- Next: connect complete dynamic morning inventory and budget admission; semantic acceptance and Nov 20–22 recall reviews remain pending.
- Final full checks/build pass: 1,259 unit tests; 335 integration passes/four expected skips. Typecheck/lint/format/boundaries pass; diff clean. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3022 — bind protected inventory to editorial stages

- Clean main at c6fc779d; no inherited work. Alerts clear, /healthz passes, API/worker active; disk 61%. Nov 20 edition not due.
- Offline inventory now rejects requests with a purpose from another stage, unknown versions, and single-topic/joint grouping route substitutions. Current story/social variants and repair purposes remain accepted.
- Targeted matrix covers every current stage/purpose combination plus unknown and developing-story substitutions; three targeted tests pass. No provider calls or production activation.
- Developing stories stays inactive; complete dynamic morning inventory/admission and semantic acceptance remain open. Nov 20–22 recall reviews await scheduled editions.
- Verification: pnpm exec tsx --test apps/api/test/protected-work-manifest.test.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build. Logs /tmp/3022-{target,format,lint,check,build}.log.
- Reader gate verifies the real Nov 19 edition: 25 stories/22 posts. No source/schema/UI/handbook behavior change. Final checks and restart results follow.
- Full checks/build pass: 1,260 unit tests, 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Diff clean. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3023 — inventory-backed offline budget preflight

- Clean main at 0d898eda; no inherited work. Alerts clear and /healthz passes; Nov 20 edition not due.
- Connected declared protected-work inventory validation to captured feature-plan costing and the file CLI. Stage/topic/context coverage is checked before cost derivation; explicit zero-call slots count. Flat-plus-inventory inputs refuse as ambiguous.
- Tests verify derived costs equal the validated flat plan, protected costs can cause shared-budget refusal, and missing contexts refuse without overwriting existing reports or creating new ones. Inputs remain unchanged.
- Offline only: dynamic inventory completeness, actual reservation and semantic acceptance remain open; developing stories stays inactive. No provider calls or source/schema/UI/handbook behavior changes.
- Targeted: pnpm exec tsx --test apps/api/test/developing-captured-plan.test.ts passes eight tests.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3023-{target,format,lint,check,build}.log). Final results and reader/service gates follow.
- Full checks/build pass: 1,262 unit tests, 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Reader gate verifies real Nov 19 content: 25 stories/22 posts. Diff clean; commit/push and API/worker restart follow.
- Next: complete dynamic morning inventory/admission and semantic acceptance; Nov 20–22 recall reviews await scheduled editions.

## 2026-11-20: iteration 3024 — derive protected bounds from supplied contexts

- Clean main at e4a9b2f2; no inherited work. Alerts clear, /healthz healthy, API/worker active. Nov 20 edition not due.
- Added offline context composition for article/social triage, topic/joint grouping, story and social editors. Bounds come from production request builders and pass declared-inventory validation before feature costing.
- Zero-call contexts still require edition/topic coverage; missing, duplicate, unexpected and foreign contexts refuse. Mixed context/inventory/flat request inputs refuse. Caller inputs remain unchanged.
- Targeted context and captured-plan tests pass (11), including editor repairs/fallback and a protected-cost budget refusal. No provider calls or production activation; dynamic completeness, actual admission and semantic acceptance remain open.
- Verification: pnpm exec tsx --test apps/api/test/protected-context-plan.test.ts apps/api/test/developing-captured-plan.test.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build. Logs /tmp/3024-{target,format,lint,check,build}.log. Final results below.
- No source/schema/UI/handbook behavior change. Next: complete dynamic morning admission; review Nov 20–22 after publication. Developing stories stays inactive.
- Full checks/build pass: 1,265 unit tests; 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Reader gate verifies real Nov 19 content: 25 stories/22 posts. Diff clean; commit/push and API/worker restart follow.

## 2026-11-20: iteration 3025 — reject masked invalid preflight prices

- Clean main at 0d95a88f; no inherited work. Alerts clear, /healthz healthy, API/worker active; Nov 20 edition not due.
- Offline edition preflight now validates original model prices before taking the conservative maximum; negative input/cache rates can no longer be hidden by higher valid rates.
- Regression matrix rejects negative/nonfinite values in all four price fields; zero-cost models remain accepted and protected funds remain included. Three targeted tests pass; no provider calls or runtime activation.
- Verification: pnpm exec tsx --test apps/api/test/developing-edition-budget.test.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build. Logs /tmp/3025-{target,format,lint,check,build}.log; final results below.
- No source/schema/UI/handbook behavior change. Developing stories remains inactive pending complete morning admission and semantic acceptance; Nov 20–22 reviews await publication.
- Full checks/build pass: 1,266 unit tests; 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Reader gate verifies real Nov 19 content: 25 stories/22 posts. Diff clean; commit/push and API/worker restart follow.

## 2026-11-20: iteration 3026 — consistent offline spend snapshots

- Clean main at 507419e2; no inherited work. Alerts clear, /healthz passes, API/worker active; Nov 20 edition not due.
- Offline edition preflight refuses daily spend above monthly spend and summed model spend above shared daily spend, preventing contradictory snapshots from establishing admission.
- Regression cases include aggregate overflow across two models; valid multiple models and omitted historical models remain accepted. Targeted budget/captured-plan tests pass (13).
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3026-{target,format,lint,check,build}.log). Final results below.
- No provider calls, runtime activation, source/schema/UI or handbook behavior changes. Developing stories remains inactive; Nov 20–22 reviews await scheduled publication.
- Full checks/build pass: 1,267 unit tests; 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Reader gate confirms real Nov 19 content: 25 stories/22 posts. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3027 — honor protected contexts in offline CLI

- Clean main at 104d6f94; no inherited work. Alerts clear, /healthz passes and API/worker active; Nov 20 edition not due.
- Captured-plan CLI now awaits context-derived production request bounds instead of silently selecting the flat budget path when protectedContexts is supplied.
- JSON-file regression proves protected costs trigger shared-budget refusal; missing contexts and mixed context/inventory/request inputs refuse without creating or overwriting evidence. Existing flat/inventory file checks now await asynchronous completion.
- Targeted captured-plan suite: nine passes. Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3027-{target,format,lint,check,build}.log). Final results below.
- No provider calls, runtime activation, source/schema/UI or handbook behavior changes. Developing stories remains inactive pending complete morning admission and semantic acceptance; Nov 20–22 reviews remain scheduled.
- Full checks/build pass: 1,267 unit tests; 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Reader gate verifies real Nov 19 content: 25 stories/22 posts. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3028 — consistent model pricing across offline edition work

- Clean main at c388fde2; no inherited work. Alerts clear, /healthz passes, API/worker active; Nov 20 edition not due.
- Offline preflight rejects contradictory prices for one model ID, including across protected-work and feature requests; independent model prices remain supported.
- Regression matrix covers all four rates and both request orders; combined protected/feature controls pass. Targeted suites: 15 passes; no provider calls or runtime activation.
- Verification: pnpm exec tsx --test apps/api/test/developing-edition-budget.test.ts apps/api/test/developing-captured-plan.test.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build. Logs /tmp/3028-{target,format,lint,check,build}.log; final results below.
- No source/schema/UI or handbook behavior change. Developing stories remains inactive pending complete morning admission and semantic acceptance; Nov 20–22 reviews await publication.
- Full checks/build pass: 1,269 unit tests; 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Reader gate verifies real Nov 19 content: 25 stories/22 posts. Older progress archived; no inherited changes. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3029 — bind offline costs to named models

- Clean main at 32a8df94; no inherited work. Alerts clear, /healthz passes and API/worker active; Nov 20 edition not due.
- Offline preflight rejects empty/whitespace model IDs in feature/protected requests, spend maps and allocations before budget arithmetic; valid model identities retain existing behavior.
- Targeted budget/captured-plan suites pass: 16 tests, including three invalid identity variants in all four input positions. No provider calls or runtime activation.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build. Logs /tmp/3029-{target,format,lint,check,build}.log; final results below.
- Initial localhost reader probe hit HTTP 429 (shared loopback throttle); post-restart content verification follows. No source/schema/UI/handbook behavior change.
- Developing stories remains inactive pending complete morning admission and semantic acceptance; Nov 20–22 reviews await publication.
- Full checks/build pass: 1,270 unit tests; 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3030 — independent model cost keys

- Clean main at 95aa044d; no inherited work. Alerts clear, /healthz passes, API/worker active; disk 61%. Nov 20 edition not due.
- Offline feature preflight now accumulates model costs in a Map, avoiding inherited object-property collisions; returned evidence stays a JSON record.
- Regression covers constructor, **proto** and toString model IDs, exact repeated-request totals, allocation accounting and JSON round trips; targeted suite seven passes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3030-{target,format,lint,check,build}.log). Final results below.
- No provider calls, activation, source/schema/UI or handbook behavior changes. Developing stories remains inactive pending budget and semantic acceptance; Nov 20–22 reviews remain next.
- Full checks/build pass: 1,271 unit tests; 335 integration passes/four expected skips. Initial check caught progress-entry formatting, corrected before passing rerun. Pre-restart reader probe returned 429; post-restart verification follows.

## 2026-11-20: iteration 3031 — share runtime and preflight reservation pricing

- Clean main at 3ed9ff68; no inherited work. Alerts clear, healthz passes, API/worker active; Nov 20 edition not due.
- Live dispatch, atomic admission and offline edition budget now use one conservative request estimator, including Unicode/framing allowance and original-price validation.
- Fixes negative input/cache rates hidden by a higher valid rate in live/atomic admission; all invalid rates refuse before reservations or provider dispatch.
- Targeted suites pass 27 tests. Initial direct invocation included three DB tests requiring the isolated runner; full pnpm check runs those correctly.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3031-{target,format,lint,check,build}.log). Final results below.
- No external calls, cap changes, feature activation, source/schema/UI or handbook behavior changes. Developing stories remains inactive; Nov 20–22 reviews remain next.
- Full checks/build pass: 1,272 unit tests; 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Reader gate verifies real Nov 19 content: 25 stories/22 posts. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3032 — consistent atomic plan prices

- Clean main at f0ec2ea1; no inherited changes. Alerts clear, healthz passes and API/worker active; Nov 20 edition not due.
- Moved model-plan price validation into the domain and shared it between offline preflight and atomic admission, covering feature and protected requests together.
- Conflicting rates for one model or blank model identities now refuse before any batch holds. Consistent repeated requests and differently priced distinct models remain supported.
- Targeted reservation/offline budget/captured-plan suites: 39 passes, including all four conflicting rate positions and both feature/protected placement; no provider calls.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3032-{target,format,lint,check,build}.log). Final results below.
- No source/schema/UI/handbook behavior changes. Developing stories remains inactive pending complete morning admission and semantic acceptance; Nov 20–22 reviews remain next.
- First full check caught an inconsistent synthetic protected-plan fixture (two prices for one model); gave its separately priced protected editor a distinct model ID. All 1,274 unit tests passed; full verification rerun follows.
- Final pnpm check/build pass: 1,274 unit tests; 335 integration passes/four expected skips. Source checks pass; digest queue has no failed jobs. Reader gate verifies real Nov 19 content: 25 stories/22 posts. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3033 — captured execution PostgreSQL acceptance

- Clean main at 90aff0dc; no inherited work. Alerts clear, /healthz passes and API/worker active; Nov 20 edition not due.
- Added isolated PostgreSQL integration coverage for the captured execution runner, through real BudgetedLlm and ledger with a synthetic provider.
- Checks atomic feature/protected admission before dispatch, competitor refusal, exact settlement, cleanup before return, uncertain transport hold retention and over-cap refusal without rows or execution.
- No external calls, activation, cap/source/schema/UI or handbook behavior changes. Complete morning inventory and semantic acceptance remain open; Nov 20–22 reviews remain next.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3033-{format,lint,check-final,build}.log). Results follow.
- First full run exposed identical synthetic matching/rewrite prompts taking the valid cache path; separated the dispatch fixture and added explicit cache-hit cleanup coverage. Verification rerun follows.
- Isolated PostgreSQL file passes all four tests after correcting null uncharged costs; explicit cache reuse confirms unused rewrite release. No production bug found. Final full rerun follows.
- Final pnpm check/build pass: 1,274 unit tests; 336 integration passes/four expected skips. Read-only check-scheduled-reader.ts 2026-11-19T15:00:00Z (API NODE_PATH and env-file) verifies real five-topic edition: 25 stories/22 posts.
- Source checks healthy; digest-generation queue zero failed jobs. Commit/push and systemctl --user restart news-digest-{api,worker}.service follow; post-restart health/reader checks required.

## 2026-11-20: iteration 3034 — bind cached execution to admitted requests

- Clean main at a458fb3c; no inherited work. Alerts clear, healthz passes, API/worker active; Nov 20 edition not due.
- Found scoped reservation identity checks could be bypassed by cache hits or concurrent response reuse, which precede reserve().
- Added an optional ledger request gate before both paths; inactive reserved plans require exact feature request identity and an open scope.
- Foreign attribution/prices/prompts, protected-only requests and closed scopes refuse; valid feature cache hits keep their unused holds available for cleanup.
- Targeted reserved-plan suite passes 24 tests, including cached and concurrent bypass controls; no provider calls.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3034-{format,lint,check,build}.log). Final results follow.
- No activation, cap/source/schema/UI or handbook behavior changes. Developing stories still needs semantic and whole-edition admission acceptance; next scheduled reviews Nov 20–22.
- Final pnpm check/build pass: 1,276 unit tests; 336 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- pnpm obs sources --check healthy; pnpm obs jobs --check --queue digest-generation has zero failed jobs. Reader gate verifies real Nov 19 five-topic edition: 25 stories/22 posts.
- Commit/push and API/worker restart follow; post-restart health and reader verification required.

## 2026-11-20: iteration 3035 — close asynchronous cache admission races

- Clean main at be0d49ce; no inherited work. Alerts clear, healthz passes; all 38 source checks healthy and digest queue has zero failed jobs.
- Reserved execution now rechecks admission after cache I/O and coalesced response waits; cleanup or changed request identity refuses before cached validation.
- Targeted reserved-plan suite: 27 passes, including delayed cache hit/miss after cleanup and independent coalesced caller identity checks. No provider calls.
- No activation, cap/source/schema/UI or handbook behavior changes; developing stories still awaits semantic and whole-edition acceptance.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3035-{format,lint,check,build}.log). Final results below.
- Read-only scheduled reader check verifies real Nov 19 five-topic edition: 25 stories/22 posts. Nov 20 edition due 15:00 UTC; Nov 20–22 reviews remain next.
- Final pnpm check/build pass: 1,279 unit tests; 336 integration passes/four expected skips. Typecheck/lint/format/boundaries green.
- Commit/push and API/worker restart follow; post-restart health and scheduled reader verification required.

## 2026-11-20: iteration 3036 — recheck admission before reserved dispatch

- Clean main at e86669da; no inherited work. Alerts clear, healthz passes; 38 source checks healthy, digest queue zero failed jobs; next edition 15:00 UTC.
- Found reservation completion could resume after scope closure or request mutation and still start a provider call.
- BudgetedLlm now rechecks scoped admission immediately before dispatch and safely releases consumed, undispatched holds on refusal.
- Targeted reserved-plan suite: 28 passes, including delayed reservation closure/mutation controls and unchanged successful dispatch; no provider calls.
- No activation, caps, sources, schema, UI or handbook behavior changes. Semantic and whole-edition acceptance remain open; Nov 20–22 reviews remain next.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3036-{format,lint,check,build}.log). Final results follow.
- Initial lint rejected an unbound test-harness method; bound it and reran verification. Final pnpm check/build pass: 1,280 unit tests; 336 integration passes/four expected skips.
- Read-only scheduled reader gate verifies real Nov 19 edition: five topics, 25 stories/22 posts. Commit/push and API/worker restart follow; post-restart health/reader verification required.

## 2026-11-20: iteration 3037 — release holds when reservation outlives execution

- Clean main at 40c8adf3; no inherited work. Alerts clear, healthz passes, all 38 source checks healthy; digest queue has zero failures and next run 15:00 UTC.
- BudgetedLlm rechecks execution deadlines after reservation I/O, before provider dispatch; expired or invalid deadlines release undispatched holds instead of relying on adapter refusal.
- Targeted reserved-plan suite passes 29 tests: before/exactly at/after deadline and invalidated deadline controls; no provider calls.
- No activation, cap/source/schema/UI or handbook behavior changes; developing stories remains inactive pending semantic and whole-edition acceptance.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3037-{format,lint,check,build}.log). Final results follow.
- Final pnpm check/build pass: 1,281 unit tests, 336 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Read-only scheduled reader gate verifies real Nov 19 edition: five topics, 25 stories/22 posts; disk 61%. Next reviews remain Nov 20–22.
- Commit/push and API/worker restart follow; post-restart health and reader checks required.

## 2026-11-20: iteration 3038 — bind settlement to dispatched prices

- Clean main at e1a058dc; no inherited work. Alerts clear, healthz passes, source checks healthy, digest queue zero failures; next edition 15:00 UTC, disk 61%.
- Found caller mutation during pending provider completion could change the provider request and ledger settlement prices after admission.
- BudgetedLlm now copies the admitted request and nested model before dispatch; completion and settlement use that copy.
- Targeted reserved-plan suite: 30 passes, including mutation of prompt, run/model identity and rates during pending completion; original input and exact 8-micro settlement survive. No provider calls.
- No activation or cap/source/schema/UI changes; developing stories remains inactive pending semantic and whole-edition acceptance. Handbook behavior unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3038-{format,lint,check,build}.log); final results follow.
- Read-only check-scheduled-reader.ts 2026-11-19T15:00:00Z passes: five topics, 25 real stories/22 posts. Nov 20–22 reviews remain next.
- Final pnpm check/build pass: 1,282 unit tests; 336 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Commit/push and API/worker restart follow; post-restart health and scheduled reader verification required.

## 2026-11-20: iteration 3039 — bind ordinary reservation to provider input

- Clean main at f591406a; no inherited work. Alerts clear and healthz passes; next scheduled review remains Nov 20 at 15:00 UTC.
- Ordinary requests could change during reservation I/O, allowing provider input to exceed the priced request. Snapshot request/model before admission; reservation and dispatch now share it.
- Scoped callers still recheck original request identity after reservation and release changed requests. No activation, caps, sources, schema, UI or handbook flow changes.
- Targeted reserved-plan suite: 31 passes, including ordinary mutation during admission and prior scoped refusal controls; no live provider calls.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3039-{format,lint,check,build}.log). Final results follow.
- Final pnpm check/build pass: 1,283 unit tests, 336 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Read-only scheduled reader gate passes for Nov 19: five topics, 25 real stories/22 posts; all 38 sources healthy, digest queue zero failures, disk 61%.
- Commit/push and API/worker restart follow; post-restart health and reader verification required.

## 2026-11-20: iteration 3040 — bind cache identity to ordinary request input

- Clean main at a7a79636; no inherited work. Alerts clear; healthz passes; sources healthy, digest queue zero failures, disk 61%.
- Ordinary requests could change during cache lookup, dispatching different input under the original fingerprint. Snapshot request/model before fingerprinting; input checks, cache, dispatch and repair share stable input.
- Scoped requests retain original-reference admission checks; developing stories stays inactive. No caps, source, schema, UI or handbook behavior changes.
- Targeted command: pnpm exec tsx --test apps/api/test/reserved-llm-plan.test.ts — 32 passes, including cache-hit/miss mutation controls; no provider calls.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3040-{format,lint,check,build}.log). Final results follow.
- Read-only reader gate (API NODE_PATH, node --env-file, --import tsx scripts/check-scheduled-reader.ts 2026-11-19T15:00:00Z) verifies five real topics, 25 stories/22 posts.
- Next scheduled reviews remain Nov 20–22 at/after publication; no new reference tooling or paid replay.
- Final pnpm check/build pass: 1,284 unit tests; 336 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Commit/push and API/worker restart follow; post-restart health and reader gates required.
