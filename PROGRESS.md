# Progress

[Iterations 2768–2777](docs/progress-archive/2026-11-18-iterations-2768-2777.md).

[Iterations 2778–2786](docs/progress-archive/2026-11-18-iterations-2778-2786.md).

[Iterations 2875–2880](docs/progress-archive/2026-11-19-iterations-2875-2880.md).

[Iterations 2881–2890](docs/progress-archive/2026-11-19-iterations-2881-2890.md).

[Iterations 2891–2898](docs/progress-archive/2026-11-19-iterations-2891-2898.md).

[Iterations 2899–2910](docs/progress-archive/2026-11-19-iterations-2899-2910.md).

[Iterations 2937–2940](docs/progress-archive/2026-11-19-iterations-2937-2940.md).

[Iterations 2941–2945](docs/progress-archive/2026-11-19-iterations-2941-2945.md).

[Iterations 2946–2958](docs/progress-archive/2026-11-19-iterations-2946-2958.md).

[Iterations 2989–2994](docs/progress-archive/2026-11-19-iterations-2989-2994.md).

[Iterations 2995–3004](docs/progress-archive/2026-11-20-iterations-2995-3004.md).

## 2026-11-20: iteration 3005 — admitted edition execution lifecycle

- Clean main at 8b918bb8; no inherited work. Alerts clear; health/database/Redis and all services pass. Enabled sources healthy (Destructoid inactive); digest queue zero failures, next run Nov 20 15:00 UTC.
- Added inactive reserved-plan runner: atomic feature/protected admission precedes budgeted service construction; unused-hold cleanup completes before returning a result. Execution/cleanup errors retain both causes; uncertain consumed holds remain protected.
- Fifteen targeted offline tests pass, including real edition coordinator no-link/later-matching-refusal composition, two-phase settlement, admission refusal, closed retained ports, uncertainty and cleanup failure. No provider calls, cap changes or activation.
- pnpm format and pnpm lint:fix pass; initial test lint failures corrected. pnpm build and final pnpm check pass: 1,239 unit tests, 335 integration passes/four expected skips. Logs /tmp/3005-{target,format,lint-final,check-final,build}.log.
- Live reader retains 7a747d9c, five topics/25 real stories/22 posts. Archived iterations 2989–2994 to keep PROGRESS small. No UI/source/schema/handbook changes.
- Next: complete exact-request capture wiring and protected obligation derivation, then saved-edition semantic acceptance. Nov 20–22 recall reviews follow scheduled editions. Production enrichment remains inactive.
- Final diff check passes; commit/push and API/worker restart follow. Exact-plan derivation and live semantic acceptance remain unverified.

## 2026-11-20: iteration 3006 — enforce reserved-hold ownership

- Clean main at 0656e374; no inherited work. Alerts clear; health/database/Redis pass; enabled sources healthy. Digest queue zero failures, next run Nov 20 15:00 UTC.
- Inactive reserved ledger now rejects settlement/failure for protected, unused and foreign hold IDs before touching the underlying ledger. Cleanup does not grant execution ownership; consumed feature holds retain normal settlement/failure behavior.
- All 16 targeted offline tests pass, including attempted cross-scope settlement/failure before and after cleanup and a real BudgetedLlm successful dispatch/settlement. No provider calls, cap changes or activation.
- pnpm format, pnpm lint:fix and pnpm check pass: 1,240 unit tests, 335 integration passes/four expected skips. Production build passes. Logs /tmp/3006-{target,format,lint,check,build}.log.
- Public operations expose queue counts only; detailed failed-job probe refused as expected. No UI/source/schema/handbook changes.
- Live latest 7a747d9c retains five topics/25 real stories/22 posts. Next: exact-request capture and complete protected-obligation derivation, then saved-edition semantic acceptance. Nov 20–22 recall reviews follow scheduled editions. Developing enrichment remains inactive.
- Final diff check passes; commit/push and API/worker restart follow.

## 2026-11-20: iteration 3007 — edition-bound exact request captures

- Clean main at 7c53c78b; no inherited work. Alerts/health and enabled sources pass; Destructoid remains inactive. Digest queue has zero failures; next run Nov 20 15:00 UTC.
- Offline matching capture now uses the actual edition ID instead of a placeholder run. Rewrite capture refuses mismatched runs; combined-plan checks require matching, rewrite and additional requests to belong to the expected edition. Blank edition/topic coverage refuses.
- Thirteen targeted tests pass, including exact matching attribution, foreign/blank runs across both stages and additional work, and rewrite input preservation. Historical placeholder captures require regeneration; no provider calls, cap changes or activation.
- pnpm format, pnpm lint:fix, pnpm check and pnpm build pass: 1,243 unit tests, 335 integration passes/four expected skips. Logs /tmp/3007-{target,format,lint,check,build}.log.
- Live reader retains 7a747d9c, five topics/25 real stories/22 posts. Direct loopback reader probe hit shared rate limiting; existing local-probe forwarding identity succeeds. No UI/source/schema/handbook changes.
- Next: runtime exact-request capture composition and complete protected-obligation derivation, then saved-edition semantic acceptance. Nov 20–22 recall reviews follow scheduled editions. Developing enrichment remains inactive.
- Final diff check passes; commit/push and API/worker restart follow. Complete exact runtime capture and protected-plan derivation remain unverified.

## 2026-11-20: iteration 3008 — edition-bound runtime admission

- Clean main at 474db237; no inherited work. Alerts/health and enabled sources pass; Destructoid remains inactive. Digest queue zero failures, next run Nov 20 15:00 UTC; public counts retain 20 ingestion/four social failures with healthy current sources.
- Inactive reserved execution now requires an explicit expected edition and refuses blank/foreign feature or protected request run IDs before atomic reservation or service construction. Offline capture validation alone no longer supplies this runtime guarantee.
- All 18 targeted offline tests pass, including six invalid feature/protected plans and three invalid expected editions; no reservation, dispatch, execution callback or release occurs on refusal. Existing successful lifecycle/composition controls pass. No provider calls, cap changes or activation.
- Verification: pnpm exec tsx --test apps/api/test/reserved-llm-plan.test.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build. Final results recorded below. Logs /tmp/3008-{target,format,lint,check,build}.log.
- Live reader 7a747d9c retains five topics/25 stories/22 posts. Detailed failed-job query correctly unavailable in public mode; pnpm obs jobs --check confirms scheduled queue status. No UI/source/schema/handbook changes.
- Next: runtime exact-request capture composition and complete protected-obligation derivation, then saved-edition semantic acceptance; Nov 20–22 recall reviews follow scheduled editions. Developing enrichment remains inactive.
- Final pnpm check passes: 1,245 unit tests, 335 integration passes/four expected skips; production build passes. Formatting/lint/boundaries/typechecks pass; git diff --check clean. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3009 — connect capture coverage to runtime admission

- Clean main at b9d69165; no inherited work. Alerts/health pass; enabled sources healthy, Destructoid inactive. Digest queue zero failures; next run Nov 20 15:00 UTC.
- Extracted shared edition/topic/stage/request coverage validation from the offline budget checker and connected it to inactive atomic reserved execution. Supplied capture requests are copied before admission; offline and runtime use identical checks.
- Runtime refuses missing topic/stage coverage, unavailable captures, stage substitution and foreign additional requests before ledger/provider/execution work. Complete synthetic matching/rewrite dispatch settles both holds and releases protected work at cleanup.
- Targeted offline tests: 24 pass. No provider calls, cap changes or activation; no UI/source/schema/handbook changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build. Logs /tmp/3009-{target,format,lint,check,build}.log; final results below.
- Next: derive captures from actual edition execution and complete protected obligations, then saved semantic/whole-edition acceptance. Supplied capture validation alone does not establish completeness of protected work. Nov 20–22 recall reviews await scheduled editions.
- Final checks pass: 1,246 unit tests, 335 integration passes/four expected skips, production build; diff check clean. Live reader 7a747d9c retains five topics/25 stories/22 posts. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3010 — capture real developing execution requests offline

- Clean main at efafa441; no inherited work. Alerts/health pass, enabled sources healthy; digest queue zero failures and next scheduled run Nov 20 15:00 UTC.
- Added offline-only execution capture: supplied response texts are its sole response source. Requests come from the real edition coordinator, EventGrouping and fixed-selection rewrite builders, preserving attribution, prompts and model prices.
- Two targeted tests pass: successful matching/rewrite capture satisfies shared stage coverage and is deterministic; no-link/missing-response runs never fabricate missing rewrite stages. A failed rewrite still records its attempted request, explicitly distinct from semantic success.
- No provider calls, cap changes or activation. Reader 7a747d9c retains five topics/25 real stories/22 posts. No UI/source/schema/handbook changes.
- Verification: pnpm exec tsx --test apps/api/test/capture-developing-execution.test.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build. Logs /tmp/3010-{target,format,lint,check,build}.log; final results below.
- Next: use saved-edition inputs for execution captures and derive complete protected obligations, then semantic/whole-edition admission acceptance. Developing enrichment remains inactive; Nov 20–22 recall reviews await scheduled editions.
- Final pnpm check passes: 1,248 unit tests, 335 integration passes/four expected skips; formatting/lint/typechecks/boundaries pass. Production build passes; diff check clean. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3011 — saved-edition execution capture

- Clean main at 178a5f36; no inherited work. Alerts/health pass, enabled sources healthy; Destructoid inactive. Digest queue zero failures; next scheduled edition Nov 20 15:00 UTC. Historical public queue counts retain 20 ingestion/four social failures.
- Actual edition coordinator now has saved Peltola and Zelda capture coverage with their original editorial evidence, full accepted selections and manually labelled predecessors. Matching uses source titles/excerpts; rewrite reaches Sonnet with exact edition/topic attribution. Captures are deterministic and fixture inputs remain unchanged.
- Scripted null rewrite responses restore the identical accepted arrays in both cases. These are offline transport controls, not semantic matching/rewrite acceptance or whole-edition budget admission. No provider calls, activation or cap changes.
- Targeted tests: pnpm exec tsx --test apps/api/test/capture-developing-execution.test.ts (three pass). Full verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; logs /tmp/3011-{target,format,lint,check,build}.log. Final results below.
- No UI/source/schema/handbook behavior changed. Next: complete protected obligations and broader saved-edition plans, then semantic/whole-edition acceptance; Nov 20–22 recall reviews await scheduled editions.
- Final pnpm check passes: 1,249 unit tests, 335 integration passes/four expected skips; format/lint/typecheck/boundaries pass. Production build passes; diff check clean. Local health passes; reader endpoint initially returned HTTP 429 and the public HTTPS hostname was unreachable from this VM. Commit/push and post-restart verification follow.

## 2026-11-20: iteration 3012 — combined saved-edition refusal capture

- Clean main at a6bdf218; no inherited work. Alerts and health pass; sources healthy, digest queue zero failures, next scheduled edition Nov 20 15:00 UTC. Old ingestion/social failure counts unchanged.
- Composed saved Nov 18 Peltola/Zelda inputs through one actual edition coordinator. Both matching responses finish before the first rewrite; scripted null stops the second rewrite and preserves both full accepted arrays by identity.
- Strict capture validation rejects the resulting missing second rewrite. Independent topic captures cannot stand in for a complete combined execution plan after an early refusal. Offline transport evidence only; no provider calls, activation or cap changes.
- Targeted command: pnpm exec tsx --test apps/api/test/capture-developing-execution.test.ts (three pass). Full verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; logs /tmp/3012-{target,format,lint,check,build}.log.
- No UI/source/schema/handbook behavior changes. Next: complete protected obligations and complete saved-edition plans, semantic review and whole-edition admission; Nov 20–22 recall reviews await scheduled editions.
- Final checks pass: 1,249 unit tests, 335 integration passes/four expected skips; formatting/lint/typecheck/boundaries and production build pass. Diff check clean. Reader endpoint still returns HTTP 429 locally; health passes. Commit/push and post-restart health verification follow.

## 2026-11-20: iteration 3013 — complete saved capture through atomic admission

- Clean main at 5d424f23; no inherited work. Alerts/health pass; enabled sources healthy, Destructoid inactive; digest queue has no failures, next run Nov 20 15:00 UTC. Historical ingestion/social failures unchanged; disk 62%.
- Corrected verification diagnosis: direct loopback requests without the required visitor header return 429 by design. GET /api/editions/latest with the existing trusted-proxy probe header returns 200: real edition 7a747d9c, five topics/25 stories/22 posts. No access-policy change needed.
- Combined saved Peltola/Zelda coordinator now captures both matching and both rewrite requests, then replays the exact plan through real BudgetedLlm and atomic admission: one batch, four dispatches, four settlements, no second reservation or unused holds.
- Scripted rewrites reuse saved prose solely to exercise transport; repeat-only Zelda is not semantically accepted. Empty protected obligations are explicit in this isolated control, never production admission. Feature remains inactive; no provider calls or cap changes.
- Targeted: pnpm exec tsx --test apps/api/test/capture-developing-execution.test.ts (three pass). Full commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build. Logs /tmp/3013-{target,format,lint,check,build}.log; final results below.
- No UI/source/schema/handbook behavior changes. Next: derive complete protected obligations, semantic review and whole-edition budget admission; Nov 20–22 recall reviews await scheduled editions.
- Final checks pass: 1,249 unit tests, 335 integration passes/four expected skips; typecheck/lint/format/boundaries and production build pass. Scheduled-reader gate verifies the Nov 19 publication via pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-19T15:00:00Z (secrets sourced without output); diff check clean. Archived iterations 2995–3004 to keep this file below 25 KB. Commit/push and API/worker restart follow.
