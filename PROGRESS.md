# Progress

Earlier entries: [iterations 1062–1069](docs/progress-archive/2026-11-07-iterations-1062-1069.md).

Earlier entries: [iterations 1070–1074](docs/progress-archive/2026-11-07-iterations-1070-1074.md).

Earlier entries: [iterations 1075–1084](docs/progress-archive/2026-11-07-iterations-1075-1084.md).

Earlier entries: [iterations 1089–1101](docs/progress-archive/2026-11-07-iterations-1089-1101.md).

Earlier entries: [iterations 1191–1199](docs/progress-archive/2026-11-07-iterations-1191-1199.md).

Earlier entries: [iterations 1200–1207](docs/progress-archive/2026-11-07-iterations-1200-1207.md).

Earlier entries: [iterations 1208–1214](docs/progress-archive/2026-11-07-iterations-1208-1214.md).

Earlier entries: [iterations 1215–1222](docs/progress-archive/2026-11-07-iterations-1215-1222.md).

Earlier entries: [iterations 1223–1229](docs/progress-archive/2026-11-07-iterations-1223-1229.md).

Archived: [iterations 1230–1234](docs/progress-archive/2026-11-07-iterations-1230-1234.md).

Archived: [iterations 1235–1242](docs/progress-archive/2026-11-07-iterations-1235-1242.md).

Earlier entries: [iterations 1243–1246](docs/progress-archive/2026-11-07-iterations-1243-1246.md).

Earlier entries: [iterations 1247–1254](docs/progress-archive/2026-11-07-iterations-1247-1254.md).

Earlier entries: [iterations 1255–1263](docs/progress-archive/2026-11-07-iterations-1255-1263.md).

Earlier entries: [iterations 1264–1271](docs/progress-archive/2026-11-08-iterations-1264-1271.md).

## 2026-11-08: iteration 1272 — free admin test editions

- Clean main/no leftovers; `/healthz` and alert snapshot healthy. Nov 8 scheduled acceptance remains due at 15:00 UTC; no provider spend or schema changes.
- Added `POST /api/admin/digest-previews/tests`: past-window validation, AI/paid-X defaults off, explicit false accepted and paid/unknown options rejected until isolated wiring exists.
- Shared snapshot builder selects stored articles and X/Reddit posts without editorial services; saves unpublished `kind=test` outside production run context, edition metrics and notifications. Existing manual/scheduled routes keep their behavior.
- Disposable-Postgres HTTP coverage checks stored synthetic content, omitted/false defaults, invalid windows/options, poisoned production editorial access, private reader 404/admin access and unchanged provider/development ledger counts. Fixtures are offline, not live content.
- Owner pipeline handbook/public-access plan updated. Five complete published-reader response fingerprints unchanged; handbook check passes. Full check/build/deployment results follow.
- Initial checks caught explicit-false options reaching the strict window schema; route now validates only window fields there. Fixed offline publication-filter setup and fixture FK cleanup/pool-finally after failed runs; targeted disposable HTTP suite passes 4/4. No application-service fault.
- Next: connect isolated paid test options and retire production-accounted manual test calls; phase-0/2 normal scheduled acceptance and Nov 8 daily review/first-week report remain due. VM stays private.
- Final verification: `pnpm check` passes (600 unit/233 integration, four expected skips); `pnpm build`, handbook, format/lint-fix and diff checks pass. Four app services restarted healthy.
- Explicit live free-test smoke created private test `b931e39b-4384-4089-9a2e-f12a7076cb14` from stored content: four topics/20 stories/15 posts, all non-AI, reader 404/admin 200; all three provider/development ledger counts unchanged. Five published response fingerprints unchanged; health/alerts clear.

## 2026-11-08: iteration 1273 — isolated development editor JSON bridge

- Clean main/no leftovers; health/alerts clear, all 36 enabled sources healthy, no failed digest jobs; next scheduled edition remains Nov 8 15:00 UTC.
- Added per-test-edition JSON bridge for existing editorial classes: fixed Haiku/Sonnet role mapping, unique concurrent-call attempt IDs, no production cache/ledger or automatic repair calls.
- Refusal, replay, disabled/input-limit, provider uncertainty and report-required outcomes latch off further calls and throw past editor model fallback. Invalid completed output stays charged and may use a separately reserved fallback.
- Five offline cases cover concurrency, invalid JSON/schema, every stopped result, uncertain errors and real shortlist-editor success/fallback/stop behavior. Initial fixture lacked topic guidance; corrected before verification. No provider calls or spend.
- Updated public-access plan/TASKS and corrected stale budget handbook text about free test editions. Paid HTTP options remain disabled; full test-edition composition/manual-call migration is next.
- Verification: targeted tests 5/5, `pnpm build`, budget handbook check and all five complete published-reader response comparisons pass. Full check/final deployment results follow.
- Nov 8 normal scheduled phase-0/2 acceptance, daily edition review and first-week report remain due; VM stays private.
- Final results: `pnpm check` passes (605 unit/233 integration, four expected skips); format/lint-fix and diff checks pass. Four rebuilt services restarted healthy, `/healthz` reports database/Redis OK and alerts remain clear.

## 2026-11-08: iteration 1274 — isolated development editorial composition

- Clean main/no leftovers; health/alerts clear. Source/job checks pass; scheduled Nov 8 acceptance remains due at 15:00 UTC.
- Composed article/social triage and editors plus opt-in grouping over one development JSON bridge, fixed model prices and a shared stop latch. Per-edition memory cache never accesses production scores or persists between tests.
- Three offline cases verify cache reuse/edition and content-type isolation, real editor success with distinct attempts, and refusal propagation across triage and both editors. No provider calls or spend; paid HTTP options remain disabled.
- Updated TASKS/public-access plan. `pnpm exec tsx --test apps/api/test/development-editorial.test.ts` passes 3/3; `pnpm build` passes; five complete published-reader fingerprints unchanged.
- Initial full check caught two unnecessary async cache methods; replaced them with resolved promises. Full checks and final deployment results follow. Next: connect isolated paid test-edition options, then retire production-accounted manual test calls. VM stays private.
- Final verification: `pnpm check` passes (608 unit/233 integration, four expected skips); `pnpm format`, `pnpm lint:fix`, rebuilt app and diff checks pass. Committing/pushing and restarting four app services, then checking health/alerts.

## 2026-11-08: iteration 1275 — isolated editors in private test snapshots

- Clean main/no leftovers; health/alerts clear, all 36 enabled sources healthy and digest queue has zero failed runs. Nov 8 scheduled review remains due at 15:00 UTC.
- Test snapshot builder now accepts an explicit factory keyed by the saved edition ID. Omitted factories stay free; supplied development editors bypass production context, editorial services, metrics and notifications.
- Expanded disposable-Postgres HTTP case exercises isolated editor calls over stored synthetic content, fallback persistence, private reader 404, unchanged provider/development ledger counts and rollback on report-required budget refusal. No provider calls or spend.
- Updated TASKS/public-access plan; paid HTTP options remain disabled. Next: compose development runtime at the admin boundary, then migrate production-accounted manual callers.
- Five published-reader fingerprints unchanged; handbook check passes. Full check/build and final deployment results follow. VM remains private.
- Final verification: `pnpm check` passes (608 unit/233 integration, four expected skips); `pnpm build`, handbook check and five complete published-reader comparisons pass. Required final format/lint-fix running before commit/push and four-service restart.

## 2026-11-08: iteration 1276 — admin development AI test editions

- Clean main/no leftovers; health/alerts clear and all 36 enabled sources healthy. Nov 8 scheduled acceptance remains due at 15:00 UTC.
- Admin tests accept explicit `aiEditing: true`, composing isolated development-funded editors on demand; free defaults remain, disabled runtime returns 503, paid X stays rejected.
- Found and fixed the integration mismatch between editor sequence IDs and UUID ledger keys using deterministic Anthropic attempt mapping; retries retain the same hold.
- Expanded recorded-provider HTTP/disposable-Postgres verification through real runtime/ledger: private test saves, confirmed development charges, unchanged production accounting, disabled runtime and stopped-edit rollback. No live provider calls or spend.
- Updated affected handbook pages/public-access plan/TASKS. Five complete published-reader fingerprints unchanged; handbook check passes. Initial full check caught import sorting during the runtime fix; final format/lint-fix and full checks rerun below.
- Next: paid X test-edition composition and migration of production-accounted manual callers; normal scheduled phase-0/2 acceptance and daily review remain due. VM stays private.
- Final verification: `pnpm check` passes (608 unit/233 integration, four expected skips); `pnpm build`, full handbook check (18 pages/22 diagrams), five reader fingerprints and diff checks pass. Final format/lint-fix precede commit/push and four-service restart; no provider spend.

## 2026-11-08: iteration 1277 — development-funded Anthropic smoke

- Clean main/no leftovers; health/alerts clear, all 36 sources healthy, digest queue has no failures. Nov 8 scheduled review remains due at 15:00 UTC.
- Migrated `smoke-anthropic.ts` from production ledger/cache to explicit development runtime: one fixed-price Haiku call, no repairs/retries, unique invocation ID and durable replay suppression.
- Added offline real-adapter/recorded-HTTP coverage for development reservation/settlement and single execution; refusal and 75% report threshold stop without retry. No live provider calls or spend.
- `pnpm exec tsx --test apps/api/test/development-smoke.test.ts`: 2/2 pass; disabled CLI exits 1 before DB/provider access. `pnpm build` and affected handbook check pass; all five complete reader fingerprints unchanged.
- Updated handbook/public-access plan/TASKS. Full checks and final deployment results follow. Next: migrate manual edition callers and compose paid X tests; normal scheduled acceptance remains due. VM stays private.
- Final verification: `pnpm check` passes (610 unit/233 integration, four expected skips) and rebuild passes. Initial runs caught post-lint formatting and the disabled CLI message contract; both corrected. Required format/lint-fix pass; five reader fingerprints and handbook check pass. Committing/pushing and restarting four services, then verifying health/alerts.

## 2026-11-08: iteration 1278 — private development preview smoke

- Clean main/no leftovers; alerts and health clear, all 36 enabled sources healthy, no failed digest runs. Nov 8 scheduled review remains due at 15:00 UTC.
- Migrated preview smoke from two production-accounted manual editions to one private test edition; default is free, `LLM_LIVE=1` explicitly enables development AI, paid X stays off. Removed the obsolete shared-production-cache repeat assertion.
- Offline request/refusal coverage verifies private route, forced options and no retries/production fallback. Real stored-content smoke saved test `35106034-6979-49da-8420-e2af4a117a27`: four topics/20 stories, non-AI, private metadata/reader 404, unchanged latest, full admin history verified. No provider calls or spend.
- Updated affected handbook/public-access plan/TASKS. Five full reader fingerprints unchanged; affected handbook check passes. Full check/build and deployment results follow.
- Next: paid X test composition and admin manual-edition caller migration; normal scheduled acceptance remains due. VM stays private.
- Final verification: `pnpm check` passes (611 unit/233 integration, four expected skips); `pnpm build`, affected handbook check, five complete reader fingerprints and `git diff --check` pass. Final format/lint-fix precede commit/push and four-service restart; no provider spend.

## 2026-11-08: iteration 1279 — private admin test-edition form

- Clean main/no leftovers; alerts and `/healthz` clear. Scheduled Nov 8 acceptance remains due at 15:00 UTC.
- Admin edition form moved from production jobs to private test endpoint; free default, explicit development AI, paid X off. Existing queued-job status recovery retained; new tests wait on the page and never retry uncertain saves.
- `pnpm exec tsx scripts/smoke-test-edition-form.ts` passes four desktop/mobile light/dark views: default/explicit AI request, success/refusal, no production writes/retries, no overflow/page errors. Requests intercepted using a real saved snapshot; no live provider calls/spend. Four screenshots saved and mobile dark inspected.
- Five complete reader fingerprints unchanged (`inventory-editions.ts` and `compare-publication-content.ts compare`). Updated affected handbook/public-access plan/TASKS.
- Initial browser script exposed CommonJS top-level-await incompatibility; corrected. Handbook first attempt interrupted by API restart; rerun after healthy startup.
- Full check/build and final deployment verification follow. Next: paid X test composition, normal scheduled acceptance/daily review. VM remains private.
- Final verification: `pnpm check` passes (611 unit/233 integration, four expected skips); `pnpm build`, full handbook check (18 pages/22 diagrams), final format/lint-fix and diff checks pass. All 36 enabled sources recent/error-free; digest queue has no failures. Committing/pushing and restarting four services before final health/alert check.

## 2026-11-08: iteration 1280 — durable development X attempt identity

- Clean main/no leftovers; alerts, health and services clear, all 36 sources healthy, no failed digest jobs. Scheduled Nov 8 review remains due at 15:00 UTC.
- Found development X runtime forwarding arbitrary attempt strings into the UUID reservation key; mapped them to deterministic xAI-namespaced UUIDs, separate from Anthropic identities.
- Five focused runtime tests pass. Added recorded-provider/disposable-Postgres coverage for actual UUID admission, exact 35,023-micro settlement, fresh-runtime replay suppression and unchanged production ledger/reserves. No live provider calls/spend.
- Five complete published reader responses unchanged via inventory and compare commands. Archived iterations 1264–1271 to keep this file small.
- `pnpm check` passes (611 unit/233 integration, four expected skips); five runtime tests and five reader fingerprints pass. `pnpm build`, required format/lint-fix and diff checks pass; committing/pushing and restarting four services before final health/alerts check. Next: paid X test-edition composition; scheduled phase-0/2 acceptance/daily review remain due. VM stays private.

## 2026-11-08: iteration 1281 — stopped-pool development X search bridge

- Clean main/no leftovers; alerts and health clear, all 36 sources healthy, no failed digest runs. Nov 8 scheduled review remains due at 15:00 UTC.
- Prepared a per-test-edition X search port: serialized topic admission, distinct attempt identities and a stop latch for refusal/replay/report threshold/unconfirmed execution/provider errors. Queued and future calls cannot continue after a stop; no production storage or accounting path is introduced.
- Four focused offline tests pass, including actual development-runtime composition with a recorded xAI response: full 35,023-micro settlement precedes threshold stop, with exactly one reserve/HTTP/settlement across queued topics. No live provider calls or spend.
- Five complete published reader responses unchanged via inventory/content comparison; build passes. Updated public-access plan/TASKS; snapshot/HTTP paid X composition remains next, with paid X still rejected by the admin route.
- `pnpm check` passes: 615 unit tests, 233 integration tests and four expected skips; typecheck/lint/format/boundaries pass. `pnpm build`, required format/lint-fix and diff checks pass. Committing/pushing and restarting four services before final health/alerts. VM stays private; phase-0/2 scheduled acceptance remains due.

## 2026-11-08: iteration 1282 — shared in-memory X candidate selection

- Clean main/no leftovers; alerts and health clear, all 36 enabled sources healthy; digest queue has no failures and Nov 8 review remains due at 15:00 UTC. Two retained ingestion failures coexist with successful current sources.
- Extracted X screening/ranking into a database-independent selector, shared by the existing stored-post path and future isolated development results. No production query, ranking or publication behavior changed; paid X snapshot/HTTP composition remains next.
- Three focused offline tests cover official paragraph evidence/display links, unknown metrics, time boundaries, safety/positive-phrase rules, semantic candidates, duplicates, deterministic ties, bounded budgets and input immutability. No live provider calls or spend.
- `pnpm exec tsx scripts/inventory-editions.ts` plus `compare-publication-content.ts compare` verifies all five complete published reader responses unchanged. `pnpm obs sources --check`, health and alerts pass; corrected unsupported combined jobs-check options and used digest queue filter.
- `pnpm check` passes (618 unit, 233 integration, four expected skips); `pnpm build`, required `pnpm format`/`pnpm lint:fix` and diff checks pass. Committing/pushing and restarting four services before final health/alerts. VM remains private.

## 2026-11-08: iteration 1283 — isolated development X official candidates

- Clean main/no leftovers; health/alerts clear, all 36 sources current, digest queue has no failed jobs; scheduled review due at 15:00 UTC.
- Added isolated search→official-embed→shared-selection bridge: at most 20 distinct verifications, no repository/cache writes, unavailable/undated/mismatched posts omitted, stopped/unconfirmed searches abort before verification. Paid X HTTP/snapshot composition stays unwired.
- Three focused offline tests pass for official-only evidence, duplicate discovery, verification failures/identity/time, network bounds, invalid budgets and stopped-pool propagation. No provider calls or spend.
- `pnpm build` passes; inventory plus content comparison verifies five complete published reader responses unchanged. Updated public-access plan/TASKS.
- Verification initially used unsupported jobs-check/filter combinations and omitted content-comparison arguments; corrected to `pnpm obs jobs --queue digest-generation --state failed --limit 1` and explicit inventory/baseline files.
- Final verification: `pnpm check` passes (621 unit/233 integration, four expected skips); handbook check (18 pages, schema metadata), full format/lint-fix and diff checks pass. Committing/pushing and restarting four services before health/alerts. Next: paid X snapshot/HTTP composition; normal scheduled acceptance remains due. VM stays private.

## 2026-11-08: iteration 1284 — per-edition isolated X composition

- Clean main/no leftovers; health/alerts clear, all 36 sources healthy, no failed digest jobs. Scheduled Nov 8 acceptance/review remains due at 15:00 UTC.
- Added explicit per-private-edition X composition: exact UTC windows, one shared discovery/verification per topic, conflicting-input rejection and independent consumer copies. Concurrent/retained budget stops cannot admit another search. HTTP/snapshot paid X remains disabled pending wiring.
- Two focused offline tests pass for concurrent sharing, request bounds, input/result isolation, conflicting inputs, invalid windows and queued/repeated refusal. No live provider calls or spend.
- `pnpm check` passes (623 unit/233 integration, four expected skips); `pnpm build`, `pnpm format`, `pnpm lint:fix`, handbook check (18 pages/22 diagrams) and diff checks pass. Inventory/content comparison verifies all five complete published reader responses unchanged.
- Committing/pushing and restarting four app services before final health/alerts. Next: snapshot/HTTP paid X wiring and normal scheduled phase-0/2 acceptance. VM remains private.

## 2026-11-08: iteration 1285 — isolated X snapshot selection hook

- Clean main/no leftovers; health/alerts clear, all 36 enabled sources healthy, digest queue has no failures. Nov 8 scheduled review remains due at 15:00 UTC.
- Private snapshot builder now accepts an explicit per-edition X factory. One positive-budget-topic callback supplies both fallback and editorial pools; omitted factories retain stored-post behavior. Paid runtime/HTTP composition remains disabled/pending.
- Extended disposable-database HTTP characterization covers exact windows/budget, edition identity, one topic callback, supplied X snapshot content, reader exclusion/private metadata and rollback on discovery failure. No live provider calls or spend.
- `pnpm build` passes; inventory plus complete publication-content comparison verifies five published reader responses unchanged. Handbook check passes (18 pages/schema metadata); no diagram/UI changes.
- `pnpm check` passes (623 unit/233 integration, four expected skips); required `pnpm format`/`pnpm lint:fix` and diff checks pass. Committing/pushing and restarting four app services before final health/alerts. Runtime/HTTP X wiring remains next; VM stays private.

## 2026-11-08: iteration 1286 — private test X runtime composition

- Clean main/no leftovers; health/alerts clear, enabled sources current, digest queue has no failures; Nov 8 scheduled acceptance remains due at 15:00 UTC.
- Explicit private-test paid-X generation now composes the isolated development runtime, saved topic keyword settings and official embeds. Disabled runtime refuses before persistence; missing settings/zero budgets skip spending. HTTP paid-X remains disabled pending its wiring.
- One discovery supplies independent lexical fallback and semantic editorial pools, preserving broader editorial candidates without another search. Per-edition sharing and stop latch remain intact; no production discovery/cache writes.
- Seven focused offline tests pass; disposable-database characterization verifies disabled-runtime refusal/no save and configured-runtime private snapshot/reader exclusion. No live provider calls or spend.
- `pnpm check` passes (625 unit, 233 integration, four expected skips); `pnpm build`, required `pnpm format`/`pnpm lint:fix`, handbook check (18 pages/schema metadata) and diff checks pass. Inventory plus publication-content comparison verifies all five complete published reader responses unchanged.
- Committing/pushing and restarting four app services before final health/alerts. Next: HTTP paid-X wiring and normal scheduled acceptance; VM remains private.

## 2026-11-08: iteration 1287 — private paid-X HTTP option

- Clean main/no leftovers; health/alerts clear, all 36 sources healthy, no failed digest jobs. Nov 8 scheduled acceptance remains due at 15:00 UTC.
- Private test-edition HTTP now accepts explicit boolean paid-X opt-in through the isolated development runtime; free defaults and production caps unchanged. Updated repository port and affected handbook/plan pages.
- Offline HTTP/database characterization verifies invalid options, disabled-runtime 503/no save, configured discovery/private snapshot/reader exclusion and budget-stop rollback. No live provider calls or spend; no UI changes.
- `pnpm check` passes (625 unit/233 integration, four expected skips); `pnpm build`, required `pnpm format`/`pnpm lint:fix`, handbook check (18 pages/22 diagrams) and diff checks pass. Inventory/content comparison verifies all five complete published reader responses unchanged.
- Committing/pushing and restarting four app services before final health/alerts. Next: admin paid-X opt-in UI and normal scheduled acceptance; VM stays private.

## 2026-11-08: iteration 1288 — admin development paid-X control

- Clean main/no leftovers; health/alerts clear, all 36 sources current with no errors and no failed digest jobs. Scheduled Nov 8 acceptance remains due at 15:00 UTC.
- Admin private test form now offers independent AI editing and paid-X controls, both off by default, with separate development-allowance guidance. Updated affected handbook/plan pages.
- `pnpm exec tsx scripts/smoke-test-edition-form.ts` passes four desktop/mobile light/dark views: all option combinations, private route, refusal/no retries, no overflow or browser errors. Updated screenshots; desktop dark/mobile light visuals inspected. Initial run preceded the new build and saw old assets; rerun after build passes. All writes intercepted; no provider calls or spend.
- `pnpm build` and handbook check (18 pages/22 diagrams/schema metadata) pass. Inventory plus publication-content comparison verifies all five complete published reader responses unchanged.
- First `pnpm check` ended with SIGTERM during unit output, without a reported test failure; full rerun started to obtain complete verification.
- Full rerun `pnpm check` passes (625 unit/233 integration, four expected skips); required `pnpm format`/`pnpm lint:fix` and diff checks pass. Committing/pushing and restarting four app services before final health/alerts. Next: phase-0 acceptance and normal scheduled review; VM remains private.

## 2026-11-08: iteration 1289 — combined development-provider acceptance

- Clean main/no leftovers; health/alerts clear, sources healthy, no failed digest jobs; next scheduled edition Nov 8 15:00 UTC. Unsupported combined jobs-check options corrected to the queue-filtered read command.
- Extended disposable-Postgres admin HTTP acceptance to request AI and paid X together through real runtime compositions with recorded HTTP responses. Both providers must settle positive development charges; provider-call/reservation counts match, reader direct access stays 404 and production ledgers remain unchanged.
- No live provider calls or spend. Phase 0 remains open until a normal scheduled publication; no phase-1 work started.
- Inventory/content comparison verifies all five complete published reader responses unchanged; `pnpm build` passes. Initial checks exposed two test-fixture assumptions (missing completed-search evidence, then one call assumed despite four eligible topics); corrected both. Final `pnpm check` passes (625 unit/233 integration, four expected skips).
- Required `pnpm format`/`pnpm lint:fix` and diff checks before commit; committing/pushing, then restarting four app services and checking health/alerts. No UI/handbook behavior changed. Next: phase-0/phase-2 scheduled acceptance at 15:00 UTC.

## 2026-11-08: iteration 1290 — deployed free-test acceptance and scheduled phase handoff

- Clean main/no leftovers; `pnpm obs alerts`, `health --check`, `sources --check` clear: all 36 sources healthy. Queue-filtered jobs read confirms zero failed digest jobs/next run 15:00 UTC. Corrected unsupported combined jobs-check options before the successful read.
- `LLM_LIVE=0 X_SEARCH_LIVE=0 pnpm exec tsx apps/api/scripts/smoke-previews.ts` passes over real stored content: private test `a49bc894-1134-4025-93c4-2daa985a89b1`, four topics/433 candidates/20 non-AI stories; saved test metadata, full admin history, direct reader 404 and unchanged latest verified. No paid provider calls requested.
- Fresh inventory plus `compare-publication-content.ts compare` verifies all five complete published responses unchanged. Added phase-0/phase-2 scheduled gates, served web preference flag, browser commands and original-five-ID hash comparison to the Nov 8 handoff; executed the documented jq/hash commands successfully.
- `pnpm build` and handbook check pass (18 pages/22 diagrams/30 tables). Full `pnpm check` result recorded below; required format/lint fixes and diff verification before commit. No app behavior changed; phase 0/phase 2 still await a normal scheduled publication, VM stays private.
- Final `pnpm check` passes: 625 unit/233 integration, four expected integration skips. Committing/pushing and restarting four app services before final health/alerts; next scheduled acceptance remains 15:00 UTC.

## 2026-11-08: iteration 1291 — passive metrics recovery evidence

- Clean main/no leftovers; alerts clear, `pnpm obs health --check` passes and `sources --check` reports all 36 healthy. Corrected unknown queue `digest` to `digest-generation`; failed-job read confirms zero failures and next run 15:00 UTC.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` (04:21 UTC): 23 healthy rules, four uncached queries ≤0.406 s, zero new evaluator errors/missed iterations, no small/big merges. Admission-limit hits remain 2; zero queue timeouts/slow queries. Recovery stays open without comparable compaction evidence; next passive check ≥05:21 UTC.
- Phase 0/phase 2 wait for normal scheduled publication; no later phase started, no provider calls/spend, VM stays private. Updated stale recovery handoff in TASKS.md; no application behavior changed.
- Required `pnpm format`/`pnpm lint:fix`, `pnpm check` (625 unit/233 integration pass, four expected skips), `pnpm build` and `git diff --check` pass. Committing/pushing and restarting four app services before final health/alerts.
