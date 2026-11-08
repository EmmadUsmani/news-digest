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

## 2026-11-08: iteration 1264 — deploy publication metadata and future saves

- Clean main/no leftovers; initial alerts clear and health database/Redis OK. All 36 enabled sources healthy/nonempty/successful within two hours. Work began after midnight in the permitted generation-change window.
- Registered additive Drizzle publication migration/schema and rehearsed owner-approved backfill. Future repository saves apply the publication policy; reader uses typed metadata predicates, with its switch still off.
- Private backup `news-digest-20261108T000202Z` completed before `pnpm migrate`. Live result: five published scheduled/476 private manual/65 private test editions; original 546 full records hash-identical after excluding new metadata, immutability trigger enabled.
- Offline save-path assertions cover private manual, published scheduled/exact save timestamp and private legacy integration saves. Reader HTTP tests use authoritative migrated columns; disposable schema parity passes. A direct targeted invocation was rejected by test isolation; verification used the required disposable integration runner.
- `pnpm check` passes: 582 unit/232 integration passes/four expected skips; typecheck/lint/format/boundaries green. `pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime` passes; affected runtime handbook and DATABASE-VERIFICATION updated.
- `compare-publication-content.ts compare` verifies all five complete saved-reader responses; `smoke-publication-candidates.ts` verifies their API/per-topic counts and titles in 20 desktop/mobile light/dark views after migration. No paid calls or production cap changes.
- Next: actual saved-reader off/on comparison before enabling filtering; development-pool authoritative migration/runtime/test-edition wiring. Phase-0 and phase-2 normal-scheduled-edition acceptance remain due; Nov 8 15:00 UTC review/first-week report still due.
- `pnpm build`, final `pnpm format`/`pnpm lint:fix` and diff checks pass. Four app services restarted/active; deployed health/alerts clear, all five fingerprints and 20 browser views pass again. Archived iterations 1247–1254 to keep this file below 25 KB.

## 2026-11-08: iteration 1265 — enable the published-only reader

- Clean main/no leftovers; initial health/alerts clear. All 36 enabled sources healthy/nonempty/successful within two hours; digest queue has zero failures.
- Compared all five Nov 3–7 published editions before/after enabling `READER_PUBLISHED_ONLY=1` in the private env and restarting API: complete response fingerprints unchanged; API/inventory/per-topic counts and titles pass in 20 desktop/mobile light/dark views per state.
- New GET-only `smoke-publication-visibility.ts` verifies latest/history contain exactly those five IDs; all 541 private reader links return 404 while every original admin ID remains accessible. Four archive browser views pass; screenshots saved and mobile light inspected.
- Initial post-restart comparison raced API startup and returned fetch failed; retried after healthy startup, all comparisons pass. No content/ID/schema/generation/sharing changes or provider calls.
- Updated TASKS, publication plan, runtime handbook and DATABASE-VERIFICATION. `pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime`, `pnpm build` and diff checks pass.
- Next: authoritative development-pool migration/runtime/test-edition wiring. Phase 0/2 normal scheduled acceptance and Nov 8 15:00 UTC review/first-week report remain due; public sharing stays private.
- `pnpm check` passes: 582 unit/232 integration passes/four expected skips; typecheck/lint/format/boundaries green. Final `pnpm format`, `pnpm lint:fix` and diff checks pass. Four app services restarted/active; deployed health/alerts clear, all five fingerprints and private/admin/archive acceptance pass again.

## 2026-11-08: iteration 1266 — verify development-ledger reconnect recovery

- Clean main/no leftovers; health database/Redis OK and alerts clear. All 36 enabled sources healthy; digest queue has zero failures. Existing retained ingestion/social failures remain historical, with current sources healthy.
- Disposable Postgres now verifies unresolved development holds survive closing/recreating independent connection pools; duplicate reservation returns replay, confirmed settlement retries charge once and unrelated holds remain intact.
- Full-row fingerprints of production Anthropic/X ledgers and scheduled reserves remain unchanged throughout development-ledger operations. Candidate schema/adapter remain unwired; no provider calls or live data/schema changes.
- Updated TASKS and DATABASE-VERIFICATION. `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime` and complete saved-reader comparison (five responses) pass.
- Next: authoritative development-pool migration/runtime/test-edition wiring. Phase-0/2 scheduled acceptance and Nov 8 15:00 UTC review/first-week report remain due; public sharing stays private.
- `pnpm check` passes: 582 unit/232 integration passes/four expected skips; typecheck/lint/format/boundaries green. Final `pnpm format`, `pnpm lint:fix` and diff checks pass.

## 2026-11-08: iteration 1267 — install authoritative development ledger

- Clean main/no leftovers; alerts/health clear, all 36 enabled sources healthy and jobs snapshot passes. No failed scheduled edition; Nov 8 acceptance remains due at 15:00 UTC.
- Added Drizzle migration/schema for separate lifetime development pools and persistent reservations; adapter now imports authoritative tables, disposable tests no longer create/drop candidate tables. Removed candidate SQL; provider/runtime/test-edition callers remain unwired.
- Initial integration parity caught PostgreSQL truncating an auto-generated foreign-key name; explicit short name fixes it. Regenerated snapshot formatting corrected before the final full check.
- Private backup `news-digest-20261108T002621Z` completed. Scratch-restore helper needed bounded row hashing and quoting corrections; corrected migration rehearsal preserves all 28 existing table fingerprints, seeds two pools and leaves zero reservations.
- `pnpm check` passes: 582 unit/232 integration passes/four expected skips, including complete schema/snapshot parity and zero proposed Drizzle changes. `pnpm build` passes; final formatting/lint and diff checks pass.
- `pnpm migrate` applied `drizzle/0010_development_spend.sql`; live Anthropic/xAI caps are $5/$2 with zero reservations. No provider calls, production cap changes or publication changes.
- Handbook budget page, schema metadata, public-access plan, DATABASE-VERIFICATION and TASKS updated. `pnpm exec tsx scripts/check-handbook.ts 06-ai-and-budgets` passes: 30 tables, no metadata warnings.
- All five complete saved-reader fingerprints unchanged after migration. Four app services restarted/active; health database/Redis OK and alerts zero.
- Next: development-pool runtime/provider/test-edition wiring; phase-0/2 normal-scheduled acceptance and Nov 8 review/first-week report still due. VM sharing stays private.

## 2026-11-08: iteration 1268 — guard isolated development calls

- Clean main/no leftovers; health/alerts clear, all 36 enabled sources healthy and digest queue has no failures. Nov 8 scheduled acceptance remains due at 15:00 UTC.
- Added development-only call orchestration: explicit opt-in, durable reserve-before-call, replay/refusal suppression, confirmed-cost settlement and threshold reporting. Unknown provider outcomes/invalid billing/settlement failures retain holds; no automatic retry or release.
- Five offline cases cover both providers, zero and unexpectedly high actual bills, database/provider errors and replay protection. Disposable Postgres races independent runners, proves exactly one callback/charge and retains uncertain holds; production ledger/reserve fingerprints unchanged.
- Provider/test-edition composition remains unwired; no live provider calls, schema changes or production-budget changes. Updated TASKS, public-access plan and DATABASE-VERIFICATION.
- Verification: `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 06-ai-and-budgets`, complete saved-reader fingerprint comparison and final format/lint/diff checks (results below).
- Next: compose provider/test-edition runtime with conservative per-provider bounds; normal-scheduled phase-0/2 acceptance and Nov 8 edition review/first-week report remain due. VM sharing stays private.
- Results: `pnpm check` passes (587 unit, 232 integration, four expected skips); build/handbook/five complete reader comparisons pass. Final `pnpm format`, `pnpm lint:fix` and diff checks pass.

## 2026-11-08: iteration 1269 — bridge development LLM billing

- Clean main/no leftovers; alerts/health clear, all 36 sources healthy and scheduled queue has no failures. Nov 8 scheduled review remains due at 15:00 UTC.
- Added explicit development-only LLM composition through the durable call guard: conservative UTF-8/input-envelope/worst-cache estimate, under-100k input ceiling and actual token-cost settlement. No production ledger/cache/fallback dependencies or automatic retries.
- Three offline tests verify reservation before execution, exact usage billing, stop/report propagation, disabled/input-limit/refusal/replay suppression and retained holds on transport or invalid billing outcomes.
- Runtime/test-edition routes remain unwired; no live provider calls, schema changes or spend. Public-access plan and TASKS updated.
- Verification: targeted tests 3/3; `pnpm build` and handbook budget check pass; five complete saved-reader fingerprints unchanged. Full `pnpm check` result recorded below.
- Next: compose development runtime/test-edition routes and xAI bounds; phase-0/2 normal scheduled acceptance and Nov 8 review remain due. VM stays private.
- Final results: `pnpm check` passes (590 unit/232 integration passes, four expected skips); `pnpm format`, `pnpm lint:fix` and diff checks pass. Build and handbook checks pass.

## 2026-11-08: iteration 1270 — compose isolated development Anthropic runtime

- Clean main/no leftovers; alerts/health clear, all 36 sources healthy and scheduled queue has no failures. Nov 8 scheduled acceptance remains due at 15:00 UTC.
- Added explicit `LLM_LIVE=1` runtime composing authoritative development repository, durable guard and Anthropic bridge. Disabled composition touches neither key nor database; enabled composition requires a key.
- Runtime fixes known Haiku/Sonnet model-price pairs independently of production env overrides, validates output/attempt inputs and disables adapter retries without changing production retry defaults.
- Five offline HTTP tests cover both model reservations/actual charges, stop/report propagation, opt-in/key gates, refusal/replay/input suppression and one-attempt 429 retention. Initial lint caught unsafe fixture-body stringification; corrected to a checked string.
- Test-edition routes and xAI composition remain unwired. No live provider calls, spend, schema changes or production-budget changes; VM remains private.
- Verification: targeted tests 5/5; `pnpm build`, handbook budget check and five complete saved-reader fingerprint comparisons pass. Full check and final service results below.
- Next: compose test-edition generation with free defaults and isolated paid options; phase-0/2 normal scheduled acceptance and Nov 8 edition review/first-week report remain due.
- Final results: `pnpm check` passes (595 unit/232 integration passes, four expected skips); final `pnpm format`, `pnpm lint:fix`, build, handbook and diff checks pass. Four app services restarted healthy after push; health and alerts rechecked below.

## 2026-11-08: iteration 1271 — compose isolated development X runtime

- Clean main/no leftovers; health/alerts clear, all 36 enabled sources healthy and digest queue has no failures. Nov 8 scheduled acceptance remains due at 15:00 UTC.
- Added explicit `X_SEARCH_LIVE=1` composition of direct xAI and the authoritative development ledger/guard. Disabled composition avoids keys/database; enabled calls validate the fixed keyword recipe before reserving.
- Uses the existing conservative manual-call $0.40 hold (not a provider ceiling); fixed token/fetched-item prices include the long-context tier, and actual bills above the estimate settle in full. Unknown outcomes retain holds with no retries or production-ledger dependency.
- Five offline cases cover opt-in/key gates, reservation-before-HTTP, ordinary/long-context/over-estimate billing, reporting, validation, replay/refusal suppression and uncertain usage/HTTP failures. No live provider calls or spend.
- Updated owner budget page/public-access plan/TASKS; archived iterations 1255–1263 to keep PROGRESS small. Test-edition routing remains unwired; VM stays private.
- Verification: targeted test 5/5; full checks/build/handbook/reader results recorded below when complete.
- Next: free-default admin test-edition routing, then isolated paid options; Nov 8 normal scheduled phase-0/2 acceptance and edition review/first-week report remain due.
- Initial push rejected a concurrent lead-docs commit; fetched/merged without rewriting history. No code or owner-priority changes; retrying the push.
- Final results: `pnpm check` passes (600 unit and 232 integration passes, four expected skips); `pnpm build`, handbook budget check and five complete saved-reader comparisons pass. `pnpm format`, `pnpm lint:fix` and `git diff --check` pass; four app services restarted after push with healthy endpoints/alerts.

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
