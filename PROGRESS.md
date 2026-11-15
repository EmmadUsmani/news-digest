# Progress

Older entries: [earlier Nov 15](docs/progress-archive/2026-11-15-before-2346.md), [iterations 2339–2347](docs/progress-archive/2026-11-15-2339-2347.md).

Archived: [iterations 2348–2354](docs/progress-archive/2026-11-15-2348-2354.md).

Archived: [iterations 2355–2360](docs/progress-archive/2026-11-15-2355-2360.md).

Archived: [iterations 2361–2367](docs/progress-archive/2026-11-15-2361-2367.md).

Archived: [iterations 2368–2377](docs/progress-archive/2026-11-15-2368-2377.md).

Archived: [iterations 2378–2386](docs/progress-archive/2026-11-15-2378-2386.md).

Archived: [iterations 2387–2397](docs/progress-archive/2026-11-15-2387-2397.md).

## 2026-11-15: iteration 2398 — scheduled public-mode gate accepted

- Clean main at fe5e8305; no inherited work. Alerts zero, health database/Redis healthy, API/worker active; all 38 sources and jobs checks pass before/after publication.
- Natural scheduled edition `a0fa3916-f1dc-4fbd-8d76-2884d5e01c06` published 15:03:33.094 UTC: five topics, 23 stories, 16 posts. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` verifies scheduled provenance and signed-out latest/direct/history agreement.
- Explicit Playwright probe passes latest/history/direct on desktop 1440px and mobile 390px: real published content, no page errors/overflow; external requests blocked. Two screenshots saved; mobile inspected.
- `pnpm exec tsx scripts/check-live-account-boundary.ts`: 32 passes. Targeted private profile/cost reads/admin writes return 404, account sync 401, no cookies. Initial probe expected 403 rather than deployed 404 and wrongly expected public structural explorer denial; corrected interpretation, no runtime defect.
- Item 50 acknowledged under STEERING 62; readiness/activation/plan and owner handoff updated. Public mode remains ON; VM sharing private, awaiting owner decision. No deployment/restart during freeze, generation/source/provider/budget changes or paid verification.
- Preliminary saved snapshot: Tech/NBA/Gaming/U.S. AI story text/order agrees with reader; World source fallback. Gaming recovers; full ownership/social/evidence/ledger review remains next. Optional AI CLI cannot parse public preview projection; used read-only saved snapshot plus existing assessor instead; diagnostic repair remains open.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `git diff --check`; receipts `/tmp/2398-{format,lint,check,reader,browser,boundary}.log` and `/tmp/2398-editorial-db.json`. All pass: 1,040 unit and 329 integration tests, four expected skips.
- Next: finish Nov 15 editorial review/World diagnosis, repair AI diagnostic; passive metrics sample ≥15:49 UTC. Stop before sharing.

## 2026-11-15: iteration 2399 — restore saved AI diagnostic in public mode

- Clean main at 20665f15; no inherited work. Alerts zero; health database/Redis healthy; all 38 sources and scheduled jobs checks pass. Receipts `/tmp/2399-{sources,jobs}.log`.
- Fixed optional `check-scheduled-reader.ts --require-ai-topic` to parse the immutable local database snapshot; the public-mode admin projection intentionally omits editorial evidence. Publication output retains only provenance, never the snapshot.
- Natural Nov 15 edition a0fa3916: saved selection/order/summary and complete-triage checks accept Tech/NBA/Gaming/U.S. (4/4/5/5 stories); World correctly returns `editorial-refused` for non-AI source fallback. All-topic receipt `/tmp/2399-reader.log`; Gaming-only returns `reader-verified`; publication-only also passes.
- Updated daily review and task handoff. This is a local CLI fix; no runtime artifact changes, deployment/restart during freeze, inference, edition writes, budget or sharing changes.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `git diff --check`; receipts `/tmp/2399-{format,lint,check}.log`. All pass: 1,040 unit/329 integration tests, four expected skips.
- Next: complete saved ownership/editor/social/ledger review and World fallback diagnosis; passive metrics sample ≥15:49 UTC. VM remains private pending owner sharing decision.

## 2026-11-15: iteration 2400 — diagnose natural World fallback

- Clean main at 368b332a; no inherited work. Alerts zero; health database/Redis healthy; all 38 sources and jobs checks pass (`/tmp/2400-{sources,jobs}.log`).
- Exact saved World prompts/responses reproduce the failure: Sonnet initial/repair and Haiku repair paraphrase a supplied summit warning containing “must not”; verbatim absence guard refuses it. Sonnet initial also rewrites the ICJ “never” statement; Haiku initial has JSON fences.
- Temporary offline production-guard probe verifies all story fields without inference/cache writes; receipt `/tmp/2400-absence.log`. Diagnosis and narrow repair-study handoff in `docs/edition-reviews/2026-11-15-world-fallback.md`.
- Read-only snapshot/ledger capture: World/U.S. selected plus coverage IDs disjoint; 55 calls all succeeded, total $0.518206, including validation-rejected responses. No pending/uncertain calls; receipts `/tmp/2400-{snapshot,ledger}.json`.
- Documentation-only change; no build/restart needed or permitted during freeze. No generation, source, provider, budget, sharing or secret changes. Archived older progress entries after 25 KB threshold.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `git diff --check`; receipts `/tmp/2400-{format,lint,check}.log`. All pass: 1,040 unit/329 integration tests, four expected skips.
- Next: offline narrow World repair study; finish NBA/social quality and Tech evidence-depth review. Passive metrics sample due ≥15:49 UTC. Public mode ON, VM private pending owner sharing decision.

## 2026-11-15: iteration 2401 — full-validator World repair study

- Clean main at 00517043; no inherited work. Alerts zero, `/healthz` database/Redis healthy; 38/38 sources healthy and every queue has a worker (`/tmp/2401-{sources,jobs}.log`).
- Offline fake-adapter replay exercises the full production ShortlistEditor validator against all four saved World responses, without provider/DB/cache/ledger access. Receipt/script `/tmp/2401-study.{log,ts}`.
- Summary-only summit repair validates Sonnet repair's five stories, but exposes a hidden Haiku repair brief failure; stripping Haiku initial's JSON fences exposes a separate ICJ summary refusal. Original responses remain unchanged.
- Manual omission counterfactuals validate five stories in all four responses (Haiku initial also needs fences removed). Three attribution/modality/scope mutations still fail the unchanged guard. This is offline validation, not generated or published recovery.
- Recorded result matrix and next repair constraints in the World review/TASKS. Existing fixed feedback already requests all-field review; repeating that hint alone is not justified. No prompt/guard/runtime changes, spend, sharing or restart during freeze.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `git diff --check`; receipts `/tmp/2401-{format,lint,check}.log`. All pass: 1,040 unit/329 integration tests, four expected skips.
- Next: focused supported-warning equivalence with adversarial coverage; remaining NBA/social/Tech daily review. Passive metrics sample due ≥15:49 UTC; public mode ON, VM private.

## 2026-11-15: iteration 2402 — complete remaining daily content review

- Clean main at 9b414719; no inherited work. Alerts zero, `/healthz` database/Redis healthy; 38/38 sources healthy and all four queues have workers (`/tmp/2402-{sources,jobs}.log`).
- Reviewed remaining NBA/Gaming/Tech stories and all 16 saved posts in edition a0fa3916. NBA stories are distinct; GG Jackson post adds preliminary coach/test context. Gaming's two GTA stories cover separate developments. U.S. Bluesky recovers three substantive picks.
- Found concrete NBA credibility failure: NBACentel X post 2121689455056613397 cites spoof `@SharmsCharania`; saved triage/editor label it reputable injury news, published context empty. Exact candidate/reasons and bounded source-quality fix handoff recorded in the daily review/TASKS.
- Tech remains thin: three of four stories have empty saved evidence excerpts; Nvidia has 600 characters and two attributed sentences. No admission/query tuning justified. All 11 X posts lack verified engagement metrics; viral quality remains open.
- Documentation-only step; no runtime changes, inference, edition writes, spend or restart/deployment during freeze. World repair remains open; next trace/exclude the known spoof source with genuine-reporter controls. Passive metrics sample due ≥15:49 UTC. Public mode ON, VM private.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `git diff --check`; receipts `/tmp/2402-{format,lint,check}.log`. All pass: 1,040 unit/329 integration tests, four expected skips. Documentation-only; live runtime still matches main's application artifacts.

## 2026-11-15: iteration 2403 — exclude known NBA spoof source

- Clean main at 78affa5d; no inherited work. Alerts zero, `/healthz` database/Redis healthy; 38 sources and all queue-worker checks pass (`/tmp/2403-{sources,jobs}.log`).
- Traced saved NBACentel post 2121689455056613397 through shared stored/development X selection: embed existence/text verification had no source-credibility exclusion before lexical fallback or semantic triage.
- Added exact official-author-URL exclusion for TheNBACentel before both paths. Saved claim/identity regression plus genuine ShamsCharania, quoted-spoof and similar-handle synthetic controls pass; no blanket humour ban or live calls. Discovery/storage and immutable Nov 15 edition unchanged.
- Updated source inventory, daily review, tasks and affected handbook page; handbook check passes (18 pages, one unchanged diagram, 39 tables). No model/provider/budget/sharing changes.
- Passive 15:53 metrics sample: 24 healthy rules, uncached queries ≤0.972 s, two new admission-limit hits, no evaluator failures/timeouts/slow queries. No merge during sample; 60 small merges/2,158,432 rows since 14:48. Recovery open; next sample ≥16:54 UTC.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check`, targeted selection tests, handbook check and `git diff --check` pass: 1,041 unit/329 integration tests, four expected skips. Receipts `/tmp/2403-{format,lint,check,handbook,targeted}.log`.
- `VITE_PUBLIC_MODE=1 pnpm build` passed; API/worker restarted at 16:04 UTC outside freeze (concrete credibility breakage fix). Health and all 38 sources/four queue-worker checks pass. Reader latest is byte-equivalent JSON before/after, edition a0fa3916/five topics. Bare loopback reader probes were rate-limited; standard documented local probe identity succeeds. No new edition/inference/spend.
- Next: focused supported-warning World repair with adversarial controls; natural acceptance of NBA exclusion and Tech evidence depth. Public mode ON, VM private pending owner sharing decision.

## 2026-11-15: iteration 2404 — accept complete supported World warnings

- Clean main at 3b631378; no inherited work. Alerts zero, health database/Redis OK; 38 sources and all queue-worker checks pass (`/tmp/2404-{sources,jobs}.log`). Disk 77%; daily scratch cleanup already done in 2339.
- Added bounded extraction of complete terminal attributed warnings in summaries/briefs. Retains speaker, modal and full warning scope; only warn/warned and optional “that” vary. Absence-free quoted preceding statements supported without changing the global sentence splitter or NBA rules.
- Offline full-validator replay of four saved World responses: unchanged Sonnet repair now validates five stories. Sonnet initial ICJ, Haiku fenced JSON/ICJ and Haiku repair compound/shortened warnings remain refused. No provider/cache/ledger/edition writes or paid calls; `/tmp/2404-replay.log`.
- Regression controls reject changed attribution, modality, geography, quantity, omitted conditions, negative prefixes and cross-evidence assembly in summary/brief; other fields retain existing rules. Five targeted tests pass; updated World review, ranking notes and tasks.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check`, targeted absence tests and `git diff --check` pass: 1,043 unit/329 integration tests, four expected skips. Receipts `/tmp/2404-{format,lint,check,targeted-final}.log`. `VITE_PUBLIC_MODE=1 pnpm build` passed.
- API/worker restarted outside freeze at 16:16 UTC; health, 38 sources and all queue-worker checks pass. Public reader/latest returns 200 and byte-identical JSON before/after (`/tmp/2404-reader-{before,after}.json`). No source/data-flow/schema changes requiring handbook/source metadata updates.
- Next: natural World recovery and NBA spoof-exclusion acceptance at the next scheduled edition; remaining ICJ/Haiku refusals stay visible. Metrics passive sample due ≥16:54 UTC; no retuning. Public mode ON, VM private pending owner sharing decision.

## 2026-11-15: iteration 2405 — decode complete fenced JSON before validation

- Clean main at 0316f305; no inherited work. Alerts zero; health, all 38 sources and four queue-worker checks pass (`/tmp/2405-{health,sources,jobs}.log`).
- Owner-visible benefit: a complete editorial response can survive its Markdown wrapper without spending a repair call; malformed or unsupported content still requires repair/fallback.
- Budgeted decoder unwraps only one whole-response JSON/untagged fence before existing parsing/schema/editorial validation. Rejects outside commentary, multiple blocks, other language tags and truncated JSON. Model/provider, caps, retry limits and cache identity unchanged.
- Saved Haiku initial wrapper matches and decodes five stories offline; separate ICJ content failure remains. Natural World/NBA acceptance awaits next scheduled edition; immutable reader edition unchanged. No external inference, paid replay, or edition writes.
- Targeted editor tests pass (41): one-call fenced acceptance/cache reuse, invalid selected-ID refusal and malformed-wrapper exhaustion. Updated daily World review and tasks; internal decoder change needs no handbook/source/schema metadata change.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check`, targeted editor tests and `git diff --check` pass: 1,045 unit/329 integration tests, four expected skips. `VITE_PUBLIC_MODE=1 pnpm build` passed; receipts `/tmp/2405-{format,lint,check,targeted,build}.log`.
- API/worker restarted at 16:27 UTC; immediate health probe raced startup, retry and `/healthz` pass. All 38 sources/four queue-worker checks pass; reader latest returns 200 and byte-identical JSON before/after. Public mode ON, VM private; no sharing changes.
- Next: natural World recovery/NBA spoof exclusion acceptance at next scheduled edition; ICJ/Haiku content refusals stay open. Metrics sample due ≥16:54 UTC; no retuning.

## 2026-11-15: iteration 2406 — resolve natural Tech depth follow-up

- Clean main at 1fd56c87; no inherited work. Alerts zero, `/healthz` database/Redis healthy; all 38 sources and four queue workers healthy (`/tmp/2406-{sources,jobs}.log`).
- Followed owner waiting-edition order to Tech depth. Immutable Nov 15 evidence confirms three of four stories lack prose; Nvidia uses 595 saved characters in two attributed sentences. Added focused daily depth review and updated tasks.
- Read-only production-loader/saved-score reconstruction: 126 current candidates versus 121 saved scores, 11 with text, 29 admitted and only two admitted with prose. Nvidia publishes; substantive Toner interview is outside the first twenty ungrouped ranks. Other text fails saved triage thresholds.
- Exact grouping fingerprint misses cache; historical grouped editor membership is unavailable, so no new admission loss is established. Retain Nov 14 decision and production rules; no ranking variants, external calls, cache writes, source requests or spend.
- Evidence assertions pass via `pnpm exec tsx /tmp/2406-tech.ts`; receipts `/tmp/2406-tech.{ts,json,log}`. No app/source/schema/handbook behavior change. Next: natural World/NBA acceptance and next daily Tech evidence review; metrics sample remains due ≥16:54 UTC.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check`, receipt assertions and `git diff --check` pass: 1,045 unit/329 integration tests, four expected skips. `VITE_PUBLIC_MODE=1 pnpm build` passed; receipts `/tmp/2406-{format,lint,check,build}.log`.

## 2026-11-15: iteration 2407 — second-week X reliability and yield

- Clean main at 19fddff0; no inherited work. Alerts zero; `pnpm obs health`, `pnpm obs sources --check` (38 healthy), and `pnpm obs jobs --check` (four workers) pass.
- Owner value: separates dependable paid discovery from useful selection; 32/32 Nov 9–15 keyword calls completed, $2.100622 spent, zero holds, 312 newly verified candidates/305 outside-list. No paid calls or settings changes.
- Added second-week source report and updated task evidence: 50 saved selection matches/44 outside-list, explicitly not distinct or causal paid yield. Nov 15 spoof remains a quality failure already addressed by deployed exclusion; natural acceptance pending.
- Read-only `report-x-week.ts 2026-11-15` plus seven `report-x-discovery.ts` reports reconcile with Python assertions for costs, calls, holds, candidate totals and selections; private `/tmp/2407-x-*.json` receipts. No source/schema/handbook behavior changes.
- Archived iterations 2387–2397 as PROGRESS exceeded about 25 KB. `pnpm format`, `pnpm lint:fix`, full `pnpm check`, receipt assertions and public-mode build passed: 1,045 unit/329 integration tests, four expected skips. Receipts `/tmp/2407-{format,lint,check,build}.log`.
- Scheduled-reader gate passes: edition a0fa3916, five topics/23 stories/16 posts. API/worker restart and post-restart health verified. Next: natural World/NBA recovery; metrics passive sample due ≥16:54 UTC. Public mode ON; VM private pending owner sharing decision.

## 2026-11-15: iteration 2408 — passive metrics recovery follow-up

- Clean main at 5e243d1a; no inherited work. Owner value: keep the outstanding metrics incident honest without changing the healthy reader or spending provider budget.
- Alerts zero; `pnpm obs health`, `pnpm obs sources --check` and `pnpm obs jobs --check` pass. Scheduled-reader gate passes for Nov 15 15:00 UTC: a0fa3916, five topics/23 stories/16 posts. Initial 13:00 probe refused the wrong expected window; corrected to saved 15:00 schedule.
- Passive sample at 16:54:15–17: 24 healthy rules, uncached queries ≤0.920 s; no new failures/admission hits/timeouts/slow queries. Since 15:53:23, 64 small merges/1,658,148 rows and no big merge; no merge during sample. Process starts unchanged; warning journal empty.
- Counter-delta assertions pass; receipts `/tmp/2408-metrics.jsonl` and `/tmp/2408-metrics-journal.log`. Updated TASKS and capacity decision. Comparable natural-merge recovery remains open; retain CPU-only 2% limits, next short sample ≥17:55 UTC. No provider calls, forced merge, source or app behavior change.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,045 unit/329 integration, four expected skips); counter assertions and `git diff --check` pass. Receipts `/tmp/2408-{format,lint,check,build}.log`. No UI change; no new browser screenshots required.
- Next: natural World/NBA acceptance at the next scheduled edition; metrics sample ≥17:55 UTC. Public mode ON, VM private; sharing remains the owner's decision.
- `VITE_PUBLIC_MODE=1 pnpm build` passed; API/worker restarted. Immediate health probe raced startup; retry passed with database/Redis healthy, and post-restart scheduled-reader gate passed unchanged.
