# Progress

Older entries: [earlier Nov 15](docs/progress-archive/2026-11-15-before-2346.md), [iterations 2339–2347](docs/progress-archive/2026-11-15-2339-2347.md).

Archived: [iterations 2348–2354](docs/progress-archive/2026-11-15-2348-2354.md).

Archived: [iterations 2355–2360](docs/progress-archive/2026-11-15-2355-2360.md).

Archived: [iterations 2361–2367](docs/progress-archive/2026-11-15-2361-2367.md).

Archived: [iterations 2368–2377](docs/progress-archive/2026-11-15-2368-2377.md).

Archived: [iterations 2378–2386](docs/progress-archive/2026-11-15-2378-2386.md).

## 2026-11-15: iteration 2387 — restore public-mode post-context browser checks

- Clean main at 33f56f05; no inherited work. Alerts zero; health database/Redis healthy; API/worker active; all 38 sources healthy. Digest queue has zero failures and next run at 15:00 UTC.
- Reproduced browser-tooling breakage: post-context smoke receives HTTP 429 before reaching its assertions because public-mode visitor admission is missing. Added the loopback visitor header to browser and API requests, granting no identity.
- `pnpm exec tsx scripts/smoke-reader-context-targets.ts` passes six 1440/390/320px light/dark variants against nine actual published notes: source-context agreement, 44px controls, keyboard toggle/focus, touch expansion, overflow and browser errors. GET/HEAD only; external requests blocked. Six screenshots refreshed; 320px light inspected.
- No runtime, generation, source, provider, spend or sharing changes. No handbook update, build or service restart needed; deployment freeze preserved.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Receipts `/tmp/2387-{before,browser,format,lint,check}.log`.
- Next: passive metrics sample ≥13:47 UTC; scheduled publication/access gate and separate editorial recovery review at 15:00 UTC. No deploys/restarts 13:00–16:00 UTC.

## 2026-11-15: iteration 2388 — restore primary-source destination replay

- Clean main at 245087ae; no inherited work. Alerts zero; health database/Redis healthy; API/worker active; all 38 sources healthy. Digest queue has zero failures and next scheduled run at 15:00 UTC.
- Reproduced browser-tooling breakage: primary-source replay fails JSON parsing before opening the browser because public-mode visitor admission is missing. Added the loopback visitor header to API/browser requests and an explicit HTTP-status assertion; grants no identity.
- `pnpm exec tsx scripts/smoke-reader-primary-source.ts` passes desktop/mobile light/dark: primary publisher points to the primary report despite reordered coverage, other publisher points to its report, all three coverage destinations remain intact, no card overflow or browser errors. Existing synthetic coverage replay on a saved edition; GET only, external traffic blocked, no writes.
- Four synthetic-replay screenshots refreshed; mobile light inspected. No runtime, generation, source, provider, spend or sharing changes; no handbook update, build or restart needed. Deployment freeze preserved.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Initial nonpersistent lint process terminated 143; persistent-terminal rerun succeeds. Receipts `/tmp/2388-{before,browser,format,lint,check}.log`.
- Next: passive metrics sample ≥13:47 UTC; scheduled publication/access gate and separate editorial recovery review at 15:00 UTC. No deploys/restarts 13:00–16:00 UTC.

## 2026-11-15: iteration 2389 — passive metrics recovery follow-up

- Clean main at 7d39e17f; no inherited work. `pnpm obs alerts` reports zero; `/healthz` database/Redis healthy; API/worker active. `pnpm obs sources --check` passes all 38 sources; `pnpm obs jobs --check` passes, digest failures zero, next edition 15:00 UTC.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` at 13:47:09–39 UTC: 24 fresh healthy rules, four uncached queries ≤1.273 s; no new evaluator errors/missed iterations, admission hits, queue timeouts or slow queries. Both process starts unchanged.
- One small merge/16,413 rows during sample; 57 small merges/1,489,036 rows since previous sample, no big merge. Below comparable-merge threshold; recovery acceptance stays open. Warning-level metrics/alerts user journal since 12:46 UTC has no entries.
- Read-only evidence only; no runtime, generation, source, provider, spend or sharing changes. No build/restart needed; 13:00–16:00 freeze preserved. Receipts: `/tmp/2389-{metrics.jsonl,sources.log,jobs.log}`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Check receipts: `/tmp/2389-{format,lint,check}.log`.
- Next: passive sample ≥14:48 UTC; scheduled public-mode publication/access gate and separate editorial recovery review at 15:00 UTC.

## 2026-11-15: iteration 2390 — restore public-mode headline browser checks

- Clean main at 2768f8fb; no inherited work. Alerts zero; health database/Redis healthy; all 38 sources healthy. Digest queue has zero failures, next run 15:00 UTC.
- Reproduced headline browser check failure: latest-edition request returns 429 without public-mode visitor admission. Added the loopback visitor header to browser/API context; grants no identity.
- `pnpm exec tsx scripts/smoke-reader-headline-targets.ts` passes all 14 published headline titles/destinations, 44px targets, keyboard focus, overflow and browser-error checks across 1440/390/320px light/dark. External requests blocked; no writes.
- Six screenshots refreshed; 320px light inspected. Existing source-target smoke also passes six variants; incidental screenshots discarded deliberately.
- No runtime, generation, source, provider, spend or sharing changes. No handbook update, build or restart needed; 13:00–16:00 deployment freeze preserved.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips; check receipts `/tmp/2390-{before,headline-before,browser,format,lint,check}.log`.
- Next: passive metrics sample ≥14:48 UTC; scheduled publication/access gate and separate editorial recovery review at 15:00 UTC.

## 2026-11-15: iteration 2391 — pre-edition recovery supply evidence

- Clean main at abcdc33d; no inherited work. Alerts zero; health database/Redis healthy; API/worker active; all 38 sources healthy; digest failures zero, next scheduled run 15:00 UTC.
- Reader value: an empty Gaming/World/U.S. section needs diagnosis against available reporting, while thin Tech summaries need comparison with actually supplied prose.
- Read-only `pnpm exec tsx scripts/capture-triage-pool.ts 2026-11-14T15:00:00Z 2026-11-15T15:00:00Z /tmp/2391-pool.json` at 14:08 UTC: eligible Tech/NBA/Gaming/World/U.S. 113/63/61/124/33; no URL-only excerpts; all pools below newest-200 limit.
- Added prospective supply table and concrete review anchors to Nov 15 review. Six World/U.S. shared eligible IDs; Gaming has substantive League reporting; Tech 103/113 excerpts empty and two of ten nonempty entries are a tiny description/shopping roundup. No final selection or recovery acceptance inferred.
- No model/cache/queue calls, generation/source/runtime changes, spend or sharing changes. Documentation only; no build/restart needed; deployment freeze preserved. Sources/jobs receipts `/tmp/2391-{sources,jobs}.log`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Receipts `/tmp/2391-{format,lint,check}.log`.
- Next: passive metrics sample ≥14:48 UTC; scheduled publication/access gate and separate editorial recovery review at 15:00 UTC. Use natural saved inputs, not this prospective pool, for exact editorial attribution.

## 2026-11-15: iteration 2397 — due passive metrics sample

- Clean main at d8b9f496; no inherited work. `pnpm obs alerts` zero; `/healthz` database/Redis healthy; API/worker active. `pnpm obs sources --check` passes all 38 sources; `pnpm obs jobs --check` passes, digest failures zero, next edition 15:00 UTC.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` at 14:48:09–40 UTC: 24 fresh healthy rules, four uncached queries ≤1.829 s; no new evaluator errors/missed iterations, admission hits, queue timeouts or slow queries. Process starts unchanged.
- One small merge/1,482 rows during sample; 64 small merges/1,655,119 rows since previous sample, no big merge. Below five-million-row comparable threshold; recovery acceptance remains open. Metrics/alerts warning journal since 13:47 UTC has no entries.
- Read-only evidence; no runtime, generation, source, provider, spend or sharing changes. No build/restart needed; 13:00–16:00 freeze preserved. Receipts: `/tmp/2397-{metrics.jsonl,sources.log,jobs.log}`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Receipts: `/tmp/2397-{format,lint,check}.log`.
- Next: scheduled public-mode publication/access gate and separate editorial recovery review at 15:00 UTC; passive metrics sample ≥15:49 UTC.

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
