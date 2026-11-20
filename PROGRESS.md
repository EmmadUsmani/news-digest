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

[Iterations 3005–3009](docs/progress-archive/2026-11-20-iterations-3005-3009.md).

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

## 2026-11-20: iteration 3014 — request-derived protected-work budget

- Clean main at 50883786; no inherited work. Alerts clear and health passes; API/worker running. Scheduled Nov 20 edition not yet due.
- Offline captured-plan checker now accepts concrete protected requests and derives both shared and per-model obligations from the same conservative request bounds. Foreign-edition protection refuses; oversized protected input cannot report a fit. Repeated requests count separately for repair/fallback obligations.
- Targeted test covers allocated-model refusal despite shared capacity, shared refusal, empty protection, foreign attribution and oversized input. Six captured-plan tests pass.
- This evaluates a supplied plan, not completeness of morning work or semantic success. Legacy numeric preflight remains supported; feature stays inactive, no provider calls or cap changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3014-{format,lint,check,build}.log). Final results recorded below.
- No production behavior, source, schema or handbook changes. Next: populate complete morning obligations from saved edition execution, semantic review and whole-edition admission; Nov 20–22 recall reviews await scheduled editions.
- Final rerun passes after formatting a late test edit: 1,250 unit tests, 335 integration passes/four expected skips; typecheck/lint/format/boundaries and production build pass. Scheduled-reader gate verifies real Nov 19 edition (25 stories/22 posts). Disk 62%; diff clean. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3015 — supported update and repeat-only semantic references

- Clean main at 936cd75a; no inherited work. Alerts clear and local health passes; Nov 20 scheduled edition not yet due.
- Reviewed exact saved Peltola/Zelda current evidence against prior coverage. Peltola supports a conditional-race → victory update; Zelda adds no milestone beyond Nov 11/17, so the combined successful transport control cannot establish semantic acceptance.
- Added an agent-authored Peltola reference summary through the actual offline captured coordinator: rewritten fields and all five IDs/order pass, other selections and saved inputs remain unchanged. Scripted response only; no provider calls or activation.
- Recorded source-bound reference/refusal criteria in docs/edition-reviews/2026-11-20-developing-semantic-reference.md. Actual model quality, protected morning-plan completeness and whole-edition admission remain open.
- Targeted: pnpm exec tsx --test apps/api/test/capture-developing-execution.test.ts (three pass). Initial identity assertion corrected to compare unchanged successful output values; refusal identity checks remain intact.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build, logs /tmp/3015-{format,lint,check,build}.log. Final results follow.
- Full checks pass: 1,250 unit tests, 335 integration passes/four expected skips; format/lint/typecheck/boundaries pass. Scheduled-reader gate verifies real Nov 19 edition (25 stories/22 posts). Disk 62%; no UI/source/schema/handbook behavior changes. Build/commit/push and API/worker restart follow.

## 2026-11-20: iteration 3016 — bound remaining social repair/fallback work

- Clean main at 61b18312; no inherited work. Alerts clear and /healthz passes; scheduled Nov 20 edition not yet due.
- Confirmed enrichment must precede social editing, which consumes final story text. Per-topic insertion also leaves later topic work; zero protected obligations cannot be justified by moving after social.
- Added an offline supplied-context social obligation builder using the real SocialPostEditor: both Sonnet/Haiku initial and possible repair requests. Shared production repair formatting and longest fixed schema/factual-support feedback prevent omitted repair bytes.
- Bounds are not executable captures/exact holds and do not establish complete morning admission. Topic/platform/triage and dynamic context coverage remain open; developing stories stays inactive. No provider calls, cap changes or public behavior change.
- Targeted: pnpm exec tsx --test apps/api/test/protected-social-obligations.test.ts (two pass): actual BudgetedLlm four-dispatch paths for both platforms/schema and JSON failures, Unicode byte/cost dominance, quiet no-call path and all fixed feedback/schema combinations.
- Initial test used null instead of undefined for a cache miss; corrected the fixture to match the ledger contract.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3016-{format,lint,check,build}.log); final results below.
- No UI/source/schema/handbook behavior change. Next: complete remaining morning plan and semantic acceptance; Nov 20–22 recall reviews await scheduled editions.
- Final checks/build pass: 1,252 unit tests, 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Reader gate verifies real Nov 19 edition (25 stories/22 posts); disk 61%, diff clean. Lint initially rejected two unnecessary async declarations; corrected before the passing run. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3017 — protect remaining story editing

- Clean main at 6eefc43e; no inherited work. Alerts clear, /healthz passes, API/worker active; Nov 20 scheduled edition not yet due.
- Added offline supplied-context story obligations through the real ShortlistEditor: Sonnet/Haiku initial and repair requests. Haiku bounds include both possible retained Sonnet validation hints, which null-response capture alone omits.
- Targeted test exercises actual BudgetedLlm dispatches for all five topic paths, invalid JSON/schema and unsupported absence; UTF-8 instruction/prompt bounds dominate. Quiet input emits no obligations; duplicate shortlist rejects, inputs unchanged and execution capture callback untouched.
- Supplied-context bounds only: remaining topic/platform/triage coverage and dynamic contexts still need complete morning admission. Developing stories stays inactive; no provider calls, cap changes or public behavior changes.
- Verification: pnpm exec tsx --test apps/api/test/protected-story-obligations.test.ts (one pass); pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3017-{format,lint,check,build}.log). Final results follow.
- Reader gate: pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-19T15:00:00Z verifies real Nov 19 edition, 25 stories/22 posts. No UI/source/schema/handbook changes.
- Next: complete remaining morning plan and semantic acceptance; Nov 20–22 recall reviews await scheduled editions.
- Full checks/build pass: 1,253 unit tests, 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Disk 61%, diff clean. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3018 — bound protected triage batches

- Clean main at 94978115; no inherited work. Alerts clear, /healthz passes, API/worker active; Nov 20 scheduled edition not yet due.
- Added offline supplied-pool article/social triage obligations through real CandidateTriage batching. All-cache-miss scripted valid output visits every batch; each initial request includes a worst-fixed-feedback repair bound. No provider calls or production activation.
- Targeted test passes for 200-item short/Unicode-long pools, both routes, actual BudgetedLlm malformed JSON/schema/coverage repairs, all original IDs, unchanged inputs, empty pools and duplicate refusal.
- Bounds cover supplied pools only; dynamic topic/platform/pool/context completeness and whole-edition admission remain open. Developing stories stays inactive; semantic model acceptance remains pending.
- Verification: pnpm exec tsx --test apps/api/test/protected-triage-obligations.test.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3018-{target,format,lint,check,build}.log). Final results below.
- Scheduled-reader gate verifies real Nov 19 edition: 25 stories/22 posts; disk 61%. No UI/source/schema/handbook behavior change.
- Next: finish whole-morning admission and semantic acceptance; Nov 20–22 recall reviews await scheduled editions.
- Full checks pass: 1,254 unit tests, 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Build passes; commit/push and API/worker restart follow.

## 2026-11-20: iteration 3019 — protect remaining story grouping

- Clean main at 835cce79; no inherited work. Alerts clear and /healthz passes; Nov 20 edition not yet due.
- Added offline supplied-pool grouping obligations through real EventGrouping, covering single-topic grouping and joint U.S./World ownership. Both routes disable repairs and have no model fallback.
- Invalid/oversized pools throw instead of silently becoming successful zero-cost plans; valid empty/small pools follow production no-call behavior. Execution callbacks/deadlines are excluded from offline accounting.
- Targeted tests compare exact requests against real BudgetedLlm dispatches for malformed JSON/schema on both routes; Unicode, 40-candidate pools, shared citations, input immutability and rejection controls covered. No provider calls.
- Initial test fixtures exceeded the input limit and then failed to generate enough distinct shared citations; corrected fixtures before passing verification.
- Developing stories stays inactive. Dynamic pool/context completeness, complete morning admission and actual semantic model acceptance remain open; Nov 20–22 recall reviews await editions.
- Verification: pnpm exec tsx --test apps/api/test/protected-grouping-obligations.test.ts (two pass); pnpm format; pnpm lint:fix; pnpm check; pnpm build. Logs /tmp/3019-{target,format,lint,check,build}.log; final results follow.
- No source/schema/UI/handbook behavior change. Commit/push and API/worker restart follow passing checks.
- Full checks/build pass: 1,256 unit tests, 335 integration passes/four expected skips; typecheck/lint/format/boundaries pass. Reader gate verifies real Nov 19 edition (25 stories/22 posts); disk 61%, diff clean. Archived iterations 3005–3009 to keep this file below 25 KB.

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
