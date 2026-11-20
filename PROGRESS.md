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
