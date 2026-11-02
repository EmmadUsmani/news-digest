# Progress

Dated entries of 15 lines or fewer, newest last. Record what changed, how it
was verified (commands and results) and what's next. When this file passes
about 400 lines, move older entries to `docs/progress-archive/`.

Earlier bootstrap and iterations 7–16: [archive](docs/progress-archive/2026-11-01-iterations-7-16.md).

Earlier iterations 17–22: [archive](docs/progress-archive/2026-11-01-iterations-17-22.md).

Earlier iterations 23–37: [archive](docs/progress-archive/2026-11-01-iterations-23-37.md).

## 2026-11-01: iteration 51 — recovered ranking benchmark

- Found uncommitted Tech benchmark, diagnostics, fixtures and source notes from the previous session; deliberately finished and retained them.
- `pnpm check` passed typecheck, lint, boundaries and all 43 tests; services and `/healthz` healthy.
- Tech's agent-labeled window finds 0/5 targets; no ranking changes or precision improvement claimed.
- Proceeding immediately to STEERING item 1 before further product work.

## 2026-11-01: iteration 51 — enforce formatting and workspace lint

- Recovered previous benchmark separately in `8eb77e2`; new STEERING instructions take priority over the stale prior summary.
- Added Prettier/config/ignore, EditorConfig, format scripts and mandatory precommit format/lint rule; owner files excluded.
- Isolated formatting-only commit `817d3be` in `.git-blame-ignore-revs`; setup is `7fe325d`.
- Typed ESLint covers API/contracts/scripts, React hooks/refresh covers web; sorted/duplicate/unused imports enforced across workspace, zero warnings required.
- Fixed imports, explicit Node test promise discards, rejection normalization and App export; scoped legacy I/O/coercion/loading-effect exemptions have comments and TASKS follow-ups.
- `pnpm check` passed typecheck, lint, format, boundaries and all 43 tests; `pnpm build` passed (existing upstream Zod warnings only).
- Rebuilt/restarted API/worker; `/healthz` healthy. `smoke-ui.ts` and `smoke-status.ts` passed desktop/mobile; screenshots refreshed/mobile inspected.
- `smoke-ingestion.ts` passed two queued live passes: 706 real URLs, four topics, seventeen healthy sources; `smoke-previews.ts` passed immutable/history/windows (5/5/5/5).
- Corrected stale editorial blocker: STEERING 3 authorizes installed Anthropic key and configured Haiku/Sonnet; next implement real capped/cached adapter and ledger before 2a/2b.
- No app inference calls made this iteration ($0 incremental); provider/model/billing unchanged. Added ordered 2a integration infrastructure and 2b ORM tasks.
- `smoke-scheduled-digests.ts` observed actual 23:59 UTC generation with exact 6h slot and completed run; original schedule restored. Final format/lint/diff checks passed.

## 2026-11-02: iteration 52 — bounded real Anthropic transport and visible costs

- Started clean on main; baseline checks, both services and `/healthz` healthy. No leftover work to recover.
- Added official Anthropic SDK LlmPort, configured Haiku/Sonnet prices, JSON validation/one reserved repair, prompt caching and validated-result cache; no automatic SDK retries.
- Migration 015 adds microdollar ledger/reservations, usage counters, persistent provider-month blocks and cache. Advisory locks serialize callers; uncertain/crash-left calls retain funds across months.
- `pnpm exec tsx apps/api/scripts/smoke-anthropic.ts` scored three real stored headlines with configured Haiku: 336 input/225 output tokens, $0.000147 total today/month; identical repeat used cache without a call.
- Added status usage/caps/reservations, monthly model calls and sanitized provider errors through a curation public facade. Published editions still use signals-v6; no editorial quality claim.
- `pnpm check` passed types/lint/format/boundaries and all 53 tests, including mocked SDK spend-limit responses; `pnpm build` passed (existing upstream Zod warnings).
- `pnpm exec tsx apps/api/scripts/smoke-llm-ledger.ts` passed disposable Postgres 17 concurrency, settlement, cache, usage, block rollover and uncertainty checks; never queried live DB.
- `pnpm migrate`, `smoke-ingestion.ts` (708 real URLs/seventeen healthy sources), `smoke-previews.ts` (immutable history/windows, 5/5/5/5 selections) and `scripts/smoke-ui.ts` passed.
- `scripts/smoke-status.ts` passed desktop/mobile real spend and synthetic error/block rendering; screenshots refreshed and mobile usage visually inspected.
- Scheduled smoke was interrupted (143) before cleanup; verified actual 00:08 UTC edition/exact 6h window/completed job manually, restored prior 20:40 UTC/PT6H settings from retained evidence and verified Redis restoration.
- Services rebuilt/restarted healthy. Documented safeguards/limitations in docs/LLM.md; no provider/model/billing changes or owner blockers.
- Next: per-item semantic Haiku triage, Sonnet editing/Haiku fallback, immutable AI editions, briefs/rationale and scheduled batches; coalesce cache misses. M3 remains open.

## 2026-11-02: iteration 53 — reusable semantic candidate triage

- Started clean on main; baseline 53 tests, API/worker and `/healthz` healthy. No leftover work.
- Added Haiku candidate triage service: up to 200 candidates before lexical filtering, three-item bounded batches, semantic relevance/importance, rationale and advisory event labels.
- Exact-ID/schema validation uses the reserved single repair; failures stop subsequent batches and return explicit unscored IDs. Event labels are not verified clusters or independent outlets.
- Per-item validated cache includes model/instructions/topic/text; reordered/regrouped regeneration reuses scores. Concurrent cache-miss coalescing remains open.
- `pnpm exec tsx apps/api/scripts/smoke-triage.ts` scored 24 real last-24h articles across four topics in eight calls ($0.003301); reordered repeats made no new calls.
- Actual today/month ledger cost $0.003448, zero reservations/errors; daily cap $0.482758, monthly $14. Provider/model/billing unchanged.
- `pnpm check` passed types/lint/format/boundaries and all 58 tests; `pnpm build` passed (existing upstream Zod warnings only).
- `smoke-ingestion.ts` passed two queued passes: 709 real URLs, seventeen healthy sources; retained DeepMind failed job is historical and current fetches pass.
- `smoke-previews.ts` passed immutable/history/window checks with 5/5/5/5 selections; `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed, mobile usage inspected.
- Rebuilt/restarted API/worker; `/healthz` healthy. `/api/status` confirms completed 00:08 UTC scheduled run and next 20:40 UTC slot; no schedule mutation this iteration.
- Updated TASKS/docs/LLM. Published editions still use signals-v6; triage service is not wired into publication. No owner blockers.
- Next: integrate triage and Sonnet shortlist editor into immutable editions, Haiku/non-AI fallback labels, then scheduled Message Batches. M3 remains open.

## 2026-11-02: iteration 54 — bounded shortlist editor

- Started clean on main; no leftover work. API/worker and `/healthz` healthy.
- Added standalone Sonnet shortlist editor: bounded source-only prompts, supplied unique IDs, budgets, brief/headline/summary/significance/rationale schemas and recorded model; no publication wiring yet.
- Sonnet refusal/invalid output falls back to configured Haiku through the same capped ledger; total refusal returns null. Empty inputs/zero budgets spend nothing; quiet selections may be empty.
- `pnpm exec tsx --test apps/api/test/editor.test.ts` passed five offline cases (cache, fallbacks, invalid output/repair, quiet budgets, escaped input bound).
- Explicit `smoke-editor.ts` checks used three real Tech and three NBA items: both returned valid empty selections, one Sonnet call each, costing $0.003958/$0.002828; identical repeats made no calls. Live summary quality is unverified.
- Today/month actual ledger $0.010234; zero reservations/errors, daily cap $0.482758, monthly $14. Provider/model/billing unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (63 tests/types/lint/format/boundaries) and `pnpm build` passed; existing upstream Zod build warnings only.
- `smoke-ingestion.ts` passed two live passes: 712 real URLs, seventeen healthy sources. Initial overlapping preview failed on changed candidate counts; rerun after collection/checks passed immutable/history/windows, selections 5/5/5/5.
- `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed/mobile inspected. Rebuilt/restarted services and `/healthz` healthy; schedule unchanged.
- M3 remains open: connect triage/editor to immutable editions, verify nonempty live summaries, Sonnet allocation/non-AI labels, scheduled batches and cache-miss coalescing. No owner blockers.

## 2026-11-02: iteration 55 — publish immutable AI editions

- Started clean on main; no leftover work. API/worker and `/healthz` healthy.
- Manual/scheduled editorial-v1 editions now triage before lexical inclusion, edit a bounded shortlist, preserve source links/excerpts/coverage and store scores, rationale, model, summaries and significance.
- Explicit exclusions/quality rules remain hard filters. Incomplete triage/editor refusal uses labeled per-topic non-AI ranking; valid quiet selections stay empty.
- A live free-form brief mentioned omitted stories; publication now derives bullets from selected rewritten headlines. Spot-inspected four lead summaries; no independent precision/factual-accuracy claim.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and 66 tests; `pnpm build` passed with existing upstream Zod warnings only.
- `smoke-ingestion.ts` passed two queued live passes: 712 URLs, seventeen healthy sources. No source configuration changes.
- Final `smoke-previews.ts` passed history/preservation/contracts and cached identical regeneration with no new calls: 74/45/22/50 candidates, five Sonnet summaries per topic.
- Initial NBA triage validation failed after repair and published labeled fallback; retry completed coverage. Updated smoke to distinguish recovery from stable cached regeneration; legacy local-DB test explicitly disables external inference.
- `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; fixed stale omission selector, updated screenshots and visually inspected mobile. Extra paid creation/window browser checks are now opt-in; fixtures reuse GET snapshots.
- Today/month ledger $0.264979 (increment $0.254745), zero reservations/provider errors, below $0.482758 daily/$14 monthly caps. Provider/model/billing unchanged.
- Rebuilt/restarted services, `/healthz` healthy; schedule unchanged. Archived iterations 17–22; no owner blockers.
- Next: Sonnet allocation, scheduled Message Batches, cache-miss coalescing/cross-window ordering, and recorded-window editorial precision. M3 remains open.

## 2026-11-02: iteration 56 — coalesce overlapping editorial requests

- Started clean on main; no leftover work. Both services, `/healthz`, sources and retained scheduled runs healthy; schedule unchanged.
- Identical concurrent JSON requests now share cache lookup, reservation, provider call, validation/repair and cache write within one BudgetedLlm; publication services reused per database pool.
- First caller owns ledger run attribution; joiners validate results. Refusal, provider failure and ledger exceptions release in-flight entries for later budget-checked attempts.
- Three offline regressions cover twelve concurrent runs sharing one repair/two charges, uncertain failure recovery, independent prompts and database exceptions; no live inference used for these tests.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and all 69 tests; `pnpm build` passed with existing upstream Zod warnings only.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 713 real URLs, four topics, seventeen healthy sources.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed, mobile digest visually inspected.
- `/api/status` confirms $0.264979 today/month, zero reservations/errors, $0.482758 daily/$14 monthly caps; $0 incremental inference. Provider/model/billing unchanged.
- Updated TASKS/docs/LLM; no source changes or owner blockers. Coalescing is process-local; simultaneous API/worker requests and differing triage batch compositions remain open.
- Next: recorded-window editorial precision, Sonnet allocation, scheduled Message Batches, cross-process coordination and canonical cross-window ordering; M3 remains open.

## 2026-11-02: iteration 57 — keep verification out of the live database

- Started clean on main; API/worker, `/healthz`, seventeen sources and retained digest runs healthy. No leftover work.
- Triage found the scheduled-digest test publishing non-AI snapshots into the live DB on every check, displacing the real AI edition; other repository tests also used live state.
- `pnpm test` now creates disposable Postgres 17/Redis 7 Docker containers, applies all fifteen migrations, overrides inherited service URLs and clears the Anthropic key; containers are removed after success/failure.
- Database/Redis clients reject direct Node test execution outside the isolated runner; BullMQ test uses the disposable Redis port. Scheduled characterization seeds a synthetic article and verifies selection/image persistence.
- `pnpm check` passed typecheck/lint/format/boundaries and all 69 tests on fresh containers; `pnpm build` passed (existing upstream Zod warnings only).
- A second `pnpm test` passed 69/69; the production edition remained byte-for-byte unchanged and only live containers remained. Direct infrastructure-test invocation failed before DB connection as intended.
- Regenerated the former AI window through the API: Tech/NBA/Gaming reused summaries; one World candidate failed triage twice, leaving an explicit per-topic non-AI fallback. No snapshots were mutated/deleted.
- Recovery cost $0.001097 total: today/month $0.266076, zero reservations/provider errors, $0.482758 daily/$14 monthly caps. No provider/model/billing changes; no further retries.
- `smoke-ingestion.ts` passed two queued live passes: 713 real URLs, four topics, seventeen healthy sources; no source changes.
- Rebuilt/restarted services; `/healthz` healthy. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; refreshed screenshots and visually inspected mobile digest.
- This fixes a live regression; full STEERING 2a Testcontainers/characterization/HTTP/coverage work remains pending after M3. No owner blockers; next investigate World triage failure, then editorial precision and Sonnet allocation.

## 2026-11-02: iteration 58 — recover World AI triage with explicit field bounds

- Started clean on main; no leftover work. API/worker, `/healthz`, seventeen sources and scheduled runs healthy; schedule unchanged.
- Reproduced World's single unscored candidate: both successful Haiku responses exceeded the strict 300-character rationale limit; the prompt had not stated it.
- New triage requests/repairs carry explicit event/rationale lengths and integer score ranges. Validation still fails closed; validated per-item cache identities are preserved.
- Regression verifies limits on both attempts and rejects/caches none of an overlong response. No external services in tests.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and all 70 tests in disposable databases; `pnpm build` passed (existing upstream Zod warnings only).
- Explicit budgeted candidate diagnosis passed first attempt after the fix; API regeneration of the previous window recovered five AI stories per topic, reusing Sonnet summaries.
- Identical regeneration made no new calls and matched topic snapshots; GET of the previous fallback edition remained byte-for-byte equivalent after JSON parsing.
- Diagnosis/recovery: four Haiku calls, $0.001053 increment; actual day/month $0.267129, zero reservations/errors, $0.482758 daily/$14 monthly caps. Provider/models/billing unchanged.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 716 real URLs, four topics, seventeen healthy sources; no source changes.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed and mobile digest visually inspected. Services rebuilt/restarted, `/healthz` healthy.
- Updated TASKS/docs/LLM; no owner blockers. Next: recorded-window editorial precision, Sonnet allocation, scheduled Message Batches and cross-process coordination; M3 remains open.

## 2026-11-02: iteration 59 — recorded NBA AI selection evaluation

- Started clean on main; no leftover work. API/worker, health, seventeen sources and retained digest runs healthy; schedule unchanged.
- Extracted unchanged production semantic shortlist rules for shared offline replay; regression protects thresholds, quality/exclusion rules and include-phrase recovery.
- Recorded configured Haiku/Sonnet inference over the existing frozen 52-candidate NBA window; labels never entered prompts. No fixture content inserted or edition published.
- `pnpm evaluate:editorial` validates fixture SHA, complete scores, exact production shortlist and unique valid selections without network/DB. AI found 5/5 prior target events versus signals 2/5, zero four labeled omissions.
- This is provisional agent-labeled target recall/yield, not independent precision/factual verification. Manual audit found concrete summary claims in supplied shortlist excerpts/headlines; questionable source claims remain unverified.
- Audit exposed mixed-shortlist facts without guaranteed coverage links. TASKS/docs/RANKING prioritize validated evidence IDs/links, then broader independently reviewed windows; no scoring fitted to labels.
- Six new calls (five Haiku, one Sonnet) cost $0.026394; actual day/month $0.293523, zero reservations/errors, $0.482758 daily/$14 monthly caps. Provider/models/billing unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and 72 tests in disposable DBs; `pnpm build` passed (existing upstream Zod warnings).
- `smoke-ingestion.ts` passed two queued live passes: 716 real URLs, four topics, seventeen healthy sources; no source changes.
- `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; refreshed status screenshots and inspected mobile digest. Services rebuilt/restarted; `/healthz` healthy.
- Live API regeneration of the prior exact window retained five AI stories per topic, identical snapshots and zero new LLM calls; prior edition reread unchanged.
- No owner blockers. M3 remains open: evidence provenance, Sonnet allocation, scheduled Message Batches, cross-process coordination and broader evaluation.

## 2026-11-02: iteration 60 — preserve summary evidence links

- Started clean on main; no leftover work. API/worker, health, seventeen sources and retained digest runs healthy; schedule unchanged.
- Editor v2 requires unique supplied evidence IDs including the selected lead; unknown/missing/duplicate IDs fail closed through existing repair/fallback. Changed editor prompts invalidate only editor caches.
- Immutable stories copy original evidence titles, URLs, excerpts, source labels and times; Summary sources disclosures distinguish editor inputs from headline-based coverage. Historical snapshots remain unchanged.
- Attribution is model-reported, not completeness/entailment or independent fact-checking. Added invalid-ID, supporting-input and cross-cluster persistence regressions.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and 74 isolated tests; `pnpm build` passed (existing upstream Zod warnings). Initial check stopped on formatting after a concurrent test edit; formatted and full rerun passed.
- `pnpm evaluate:editorial` passes unchanged historical NBA replay; no new quality benchmark claimed.
- `smoke-ingestion.ts` passed two queued live passes: 716 real URLs, seventeen healthy sources. No source changes.
- Exact prior-window API generation produced 4/5/5/5 AI stories with evidence (NBA includes two/three-input summaries); quiet Tech selection intentionally unpadded. Identical regeneration made zero calls and matched snapshots; previous edition reread unchanged.
- Four Sonnet calls cost $0.093172; day/month actual $0.386695, zero reservations/errors, $0.482758 daily/$14 monthly caps. Provider/models/billing unchanged.
- `scripts/smoke-ui.ts`, `scripts/smoke-status.ts` and explicit real evidence disclosure/link checks passed desktop/mobile; screenshots refreshed and mobile evidence screenshot visually inspected.
- Rebuilt/restarted API/worker; `/healthz` healthy. No owner blockers; next broader editorial evaluation, Sonnet allocation, scheduled Message Batches and cross-process coordination.

## 2026-11-02: iteration 61 — reserve a separate Sonnet allocation

- Started clean on main; no leftover work. Services/health, seventeen sources and digest runs healthy. Retained ingestion failure was historical invalid XML; all active sources subsequently succeeded.
- Sonnet now has a configurable 80% ceiling inside the shared daily cap (`LLM_EDITOR_DAILY_FRACTION`, 0–1); no extra funds or model/provider/billing changes. Existing Haiku then labeled signal fallback remains.
- Same cross-process reservation lock enforces both caps, including repairs and all old pending/uncertain model charges; settlement releases unused funds and free validated caches remain available.
- Status API/UI displays model allocation, used/reserved amount and effective availability; corrected obsolete signal-only status description. Updated TASKS/docs/LLM; no source changes or owner blockers.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and 76 tests in disposable DBs; `pnpm build` passed (existing upstream Zod warnings). An intermediate concurrent edit caused an import-order check failure; final full rerun passed.
- New isolated Postgres checks cover concurrent model reservations, settlement, prior-month uncertainty, Haiku editor fallback/cache and usage reporting; no live inference in tests.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 717 real URLs, four topics, seventeen healthy sources.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; refreshed screenshots and visually inspected mobile allocation display.
- Exact-window API regeneration preserved 4/5/5/5 AI stories, identical topic snapshots, unchanged historical edition and zero new calls. Schedule unchanged.
- Incremental inference $0; actual day/month $0.386695, zero reservations/errors. Shared daily cap $0.482758; Sonnet allocation $0.386206 with $0.039654 remaining.
- Next: broader independently reviewed editorial evaluation, scheduled Message Batches and cross-process cache-miss coordination; M3 remains open.

## 2026-11-02: iteration 62 — World and Tech editorial evaluation

- Started clean on main; no leftover work. Services, health, active sources and digest runs healthy; retained ingestion failure remains historical, with subsequent source successes.
- Generalized explicit paid recorder/offline replay to existing World/Tech windows; preserved NBA v1. New artifacts require valid evidence IDs; replay includes bounded evidence inputs and exact shortlist/SHA/complete-score checks.
- Withheld pre-existing agent labels: World 3/5 targets vs signals 1/5; Tech 3/5 vs 0/5; all eight omission labels absent. These are one-date provisional target-recall measurements, not precision or factual verification.
- Haiku edited both via existing budgeted fallback: Sonnet's remaining allocation could not cover its reservation. Ten new calls cost $0.007407; day/month actual $0.394102, zero reservations/provider errors, $0.482758 daily/$14 monthly caps. Models/provider/billing unchanged.
- Audited ten summaries against supplied evidence. Found unsupported Apple non-confirmation statement; documented concrete triage/shortlist/editor misses and prioritized factual-support follow-up. No production prompts or scores changed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed typecheck/lint/format/boundaries and 78 isolated tests; `pnpm build` passed with existing upstream Zod warnings only.
- `pnpm evaluate:editorial` passed all three offline replays; recorder refuses existing artifact before inference. No fixture content inserted or editions published by evaluation.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 718 real URLs, seventeen healthy sources; no source configuration changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; refreshed screenshots, visually inspected mobile digest. Schedule unchanged.
- Updated TASKS/docs/RANKING; archived iterations 23–37 to keep progress bounded. No owner blockers. Next: unsupported negative claims, reviewed labels/later dates/Gaming, scheduled batches and cross-process cache coordination.

## 2026-11-02: iteration 63 — mitigate unsupported absence claims

- Started clean on main; no leftover work. Services/health, seventeen sources and digest runs healthy; schedule unchanged.
- Editor v3 distinguishes omitted excerpt facts from real-world absence, permits shorter supported summaries and requests clause review; changed instruction hash invalidates only editor caches.
- Recorded one explicit Tech replay with unchanged triage/shortlist and withheld labels: same 3/5 provisional targets, zero labeled omissions. Apple summary now attributes findings without asserting company non-confirmation.
- This is prompt mitigation, not factual validation: Apple significance/rationale still imply no announcement/confirmation; benchmark summary describes unperformed verification. Documented all-five-summary audit and prioritized remaining support validation.
- Added immutable v3 artifact and offline case regression; recorder supports explicit v3 output and refuses overwrite before inference. No fixture content inserted or editions published.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and 79 isolated tests; `pnpm build` passed (existing upstream Zod warnings). Initial check stopped after concurrent documentation edits; formatted/full rerun passed.
- `pnpm evaluate:editorial` passed historical replays; v3 regression verifies recorded Apple improvement with preserved recall. No general quality estimate claimed.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 720 stored URLs, seventeen healthy sources; no source changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed and mobile digest visually inspected.
- One configured Haiku fallback call cost $0.001691; day/month $0.395793, zero reservations/provider errors, $0.482758 daily/$14 monthly caps. Models/provider/billing unchanged.
- Updated TASKS/docs/LLM/docs/RANKING; no owner blockers. Next: stronger factual-support validation, broader reviewed evaluation, scheduled Message Batches and cross-process coordination.

## 2026-11-02: iteration 64 — validate lexical absence claims

- Started clean on main; no leftover work. API/worker/health, seventeen sources and digest runs healthy; retained ingestion failure historical with later successes. Schedule unchanged.
- Editor v4 rejects lexical absence sentences unless verbatim in cited bounded inputs; includes rationale and briefs. Existing reserved repair/model fallback applies; only editor cache identity changes.
- Regressions reject recorded v3 Apple/benchmark caveats, uncited/clipped/changed-subject support; supported quotes and repaired outputs pass. Conservative heuristic may reject good paraphrases; broader factual entailment remains open.
- Explicit Tech v4 evaluation returned no validated result after two Haiku calls; no artifact/edition published and no improved recall claimed. Sonnet reservation allocation unavailable. Next: diagnose false rejection/repair feedback before broader factual validation.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and 82 isolated tests pass; `pnpm build` passes (existing upstream Zod warnings). Initial check hit a formatting edit during verification; final full rerun green.
- `pnpm evaluate:editorial` passes historical replays; focused editor/evaluation tests 14/14 pass without external services.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passes two live queued passes: 720 real URLs, four topics, seventeen healthy sources; no source configuration changes.
- Live evaluation cost $0.003047; day/month $0.398840, zero reservations/provider errors. Shared daily cap $0.482758/$14 monthly; models/provider/billing unchanged.
- Updated TASKS/docs/LLM/docs/RANKING; no owner blockers. M3 remains open: factual support, broader reviewed evaluation, scheduled batches and cross-process coordination.
- Rebuilt/restarted API/worker; `/healthz` healthy. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed and mobile digest inspected. First UI attempt raced restart; rerun passed after health recovered.

## 2026-11-02: iteration 65 — explain absence failures to the repair

- Started clean on main; no leftover work. API/worker/health, seventeen active sources and retained digest runs healthy; schedule unchanged.
- Found semantic rejection received only generic JSON repair instructions. Added fixed application-owned absence-support feedback covering every output field; no raw model/source/error text echoed.
- Single separately reserved repair, original input bounds/cache identity, strict support guard and capped model fallback remain. Extended four-field regression to inspect actual repair requests.
- Explicit `record-editorial-evaluation.ts tech v4` still failed closed after two Haiku attempts; no artifact/edition published and no quality or false-rejection improvement claimed.
- Inference cost $0.003279; day/month $0.402119, zero reservations/provider errors, $0.482758 daily/$14 monthly caps. Provider/models/billing unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and all 82 isolated tests; `pnpm build` passed (existing upstream Zod warnings).
- `pnpm evaluate:editorial` passed unchanged historical offline replays. No fixture content inserted or labeled live.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 722 stored real URLs, four topics, seventeen healthy sources; no source configuration changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed and mobile digest visually inspected.
- Updated TASKS/docs/LLM/docs/RANKING; no owner blockers. Next: bounded validation failure categories/diagnostics before another paid replay, then false-rejection audit and broader factual support.

## 2026-11-02: iteration 66 — bounded editorial validation diagnostics

- Started clean on main; no leftover work. Services/health, seventeen active sources and retained digest runs healthy; historical ingestion failure has subsequent source successes. Schedule unchanged.
- Budgeted caller now retains only the last 32 validation failures as closed attempt/category pairs: JSON, schema, selection, absence support or unexpected validator error. Defensive copies; no raw model/source/error text, paths or IDs.
- Editorial facade exposes diagnostics; explicit paid recorder prints them before a refused-result assertion. Process-local/shared across triage and editor, no durable run attribution; no automatic logging or extra inference.
- Tests cover real selection/absence checks, parse/schema separation, unexpected errors, bounds/mutation safety, successful repair/cache reuse and invalid-cache classification; existing reservations/repair/fallback and prompt/cache identities preserved.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass types/lint/format/boundaries and 86 isolated tests; `pnpm build` passes with existing upstream Zod warnings. `pnpm evaluate:editorial` passes historical offline replays.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passes two queued live passes: 722 real URLs, four topics, seventeen healthy sources. No source configuration changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed and mobile digest visually inspected.
- No paid replay or new edition this iteration; no quality improvement claimed. Incremental inference $0; actual day/month $0.402119, zero reservations/provider errors. Provider/models/billing unchanged.
- Updated TASKS/docs/LLM; no owner blockers. Next: bounded diagnostic Tech replay and absence-guard false-rejection audit before changing guard, then broader factual support/evaluation, scheduled batches and cross-process coordination.

## 2026-11-02: iteration 67 — diagnose Tech rejection and state editor bounds

- Started clean on main; no leftover work. API/worker/health, seventeen sources and retained digest runs healthy; historical ingestion failure has subsequent source successes. Schedule unchanged.
- Bounded Tech replay diagnosed initial schema rejection then absence rejection on repair. Categories cannot identify rejected fields/sentences or establish false rejections; guard unchanged.
- Added missing enforced text/array limits and exact-key requirements to editor instructions, including repairs. Instruction hash refreshes editor caches only; no provider/model/billing changes.
- Second explicit Tech replay accepted five stories after one absence repair. New immutable offline v4 artifact retains 3/5 provisional targets and zero labeled omissions; no fixture content or evaluation editions published.
- Audited all five summaries against cited bounded inputs; prior Apple/benchmark absence caveats absent. Significance extrapolation (hospital access versus adoption, benchmark implications) remains; no general factuality/precision claim.
- Added all-field length boundary/repair regressions and offline v4 absence/recall regression; `pnpm evaluate:editorial` now includes v3/v4 snapshots alongside historical NBA/World/Tech replays.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass types/lint/format/boundaries and 88 isolated tests; `pnpm build` passes with existing upstream Zod warnings. Initial check raced the new unformatted artifact; formatted final rerun passed.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 723 real URLs, four topics, seventeen healthy sources. No source configuration changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed and mobile digest inspected.
- Two evaluations/four Haiku calls cost $0.006296; day/month actual $0.408415, zero reservations/provider errors, $0.482758 daily/$14 monthly caps.
- Updated TASKS/docs/LLM/docs/RANKING; no owner blockers. Next: broader factual support/absence false-rejection audit, independent labels/later dates/Gaming, scheduled batches and cross-process coordination.

## 2026-11-02: iteration 68 — reproducible support challenge audit

- Started clean on main; no leftover work. Services/health, seventeen sources and retained digest runs healthy; historical ingestion failure has later successes. Schedule unchanged.
- Added `pnpm evaluate:support`: ten explicitly synthetic challenges plus two actual Tech v4 significance fields linked to SHA-checked bounded cited inputs. Prints labels, reasons, evidence and guard decisions offline; no inference/publication.
- Four supported/eight unsupported cases: two supported paraphrases rejected; six unsupported claims accepted, including dropped attribution, absence synonym, causation, rumor certainty and both recorded significance extrapolations. These are hand-selected agent judgments, not production rates or independent review.
- Production guard/prompts/cache identities unchanged. Tests check accounting, unique labels and recorded-evidence linkage without pinning weaknesses as required behavior; prioritized attribution-preserving lexical matching next.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and all 89 isolated tests; `pnpm build` passed with existing upstream Zod warnings. `pnpm evaluate:editorial` and `pnpm evaluate:support` passed offline.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 724 stored real URLs, four topics, seventeen healthy sources; no source configuration changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed and mobile digest visually inspected.
- Incremental inference $0; day/month actual $0.408415, zero reservations/provider errors, $0.482758 daily/$14 monthly caps. Provider/models/billing unchanged.
- Updated TASKS/docs/RANKING; no owner blockers. Next: repair attribution-dropping matches, broader reviewed clause-support evaluation, scheduled batches and cross-process coordination. M3 remains open.
