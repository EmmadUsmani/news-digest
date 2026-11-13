# Progress

[Through iteration 1743](docs/progress-archive/2026-11-10-through-1743.md).

[Iterations 1753–1759](docs/progress-archive/2026-11-11-through-1759.md).

[Iterations 1760–1763](docs/progress-archive/2026-11-11-iterations-1760-1763.md).

[Iterations 1764–1769](docs/progress-archive/2026-11-11-through-1769.md).

[Iterations 1770–1775](docs/progress-archive/2026-11-11-iterations-1770-1775.md).

[Iterations 1776–1781](docs/progress-archive/2026-11-11-iterations-1776-1781.md).

[Iterations 1782–1787](docs/progress-archive/2026-11-11-iterations-1782-1787.md).

[Iterations 1788–1793](docs/progress-archive/2026-11-11-iterations-1788-1793.md).

[Iterations 1794–1804](docs/progress-archive/2026-11-11-iterations-1794-1804.md).

[Iterations 1805–1810](docs/progress-archive/2026-11-11-iterations-1805-1810.md).

[Iterations 1811–1814](docs/progress-archive/2026-11-11-iterations-1811-1814.md).

[Iterations 1815–1820](docs/progress-archive/2026-11-11-iterations-1815-1820.md).

[Iterations 1821–1827](docs/progress-archive/2026-11-11-iterations-1821-1827.md).

[Iterations 1828–1833](docs/progress-archive/2026-11-11-iterations-1828-1833.md).

[Iterations 1834–1839](docs/progress-archive/2026-11-11-iterations-1834-1839.md).

[Iterations 1840–1849](docs/progress-archive/2026-11-11-iterations-1840-1849.md).

[Iterations 1850–1857](docs/progress-archive/2026-11-12-iterations-1850-1857.md).

[Iterations 1858–1862](docs/progress-archive/2026-11-12-iterations-1858-1862.md).

[Iterations 1863–1869](docs/progress-archive/2026-11-12-iterations-1863-1869.md).

[Iterations 1870–1872](docs/progress-archive/2026-11-12-iterations-1870-1872.md).

[Iterations 1873–1875](docs/progress-archive/2026-11-12-iterations-1873-1875.md).

[Iteration 1876](docs/progress-archive/2026-11-12-iteration-1876.md).

[Iteration 1877](docs/progress-archive/2026-11-12-iteration-1877.md).

[Iterations 1878–1879](docs/progress-archive/2026-11-12-iterations-1878-1879.md).

[Iterations 1880–1881](docs/progress-archive/2026-11-12-iterations-1880-1881.md).

[Iterations 1882–1885](docs/progress-archive/2026-11-12-iterations-1882-1885.md).

[Iterations 1886–2011](docs/progress-archive/2026-11-12-iterations-1886-2011.md).

[Iterations 2012–2020](docs/progress-archive/2026-11-12-iterations-2012-2020.md).

## 2026-11-12: iteration 2021 — bounded settlement admission helper

- Clean main/no inherited work. Alerts and `/healthz` healthy; source readiness passes and digest queue staffed with zero failed jobs. Next scheduled edition Nov 13 15:00 UTC.
- Implemented an unwired application helper: initial atomic admission, trusted scheduled/Sonnet/context gates, exactly model-allocation refusals, bounded frozen original hold IDs and no locks during sleep.
- Polls every 250 ms for at most five seconds/21 atomic attempts. Preserves 300 seconds for queue, logical provider call and completion; cancellation/deadline rechecked after timer and ledger waits. Late wake-ups stop; competing holds never extend eligibility; errors propagate.
- Eight fake-clock tests cover settlement/competition, all refusal categories, immediate admission, deadline/cancellation boundaries, late asynchronous work and ledger errors. Production still uses immediate reserve; waiting remains disabled.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (908 unit/287 integration pass, four expected skips), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 06-ai-and-budgets`, `pnpm exec tsx scripts/evaluate-settlement-wait.ts` (15 controls) and `git diff --check` pass. Existing bundle warning only.
- Updated TASKS and admission plan. No live provider calls, caps/models/source/UI/publication changes; handbook runtime description, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: wire trusted scheduled admission and bounded diagnostics into BudgetedLlm; verify repair/fallback composition before enabling waits. Natural NBA AI-edited acceptance remains pending.

## 2026-11-12: iteration 2022 — gated BudgetedLlm settlement composition

- Clean main/no inherited work. Initial alerts and health green; 38 healthy sources, staffed digest queue/zero failed jobs. Next scheduled edition Nov 13 15:00 UTC.
- BudgetedLlm now optionally composes bounded settlement admission for configured Sonnet with execution context and trusted scheduled eligibility. Each repair reserves separately; legacy/manual/Haiku callers keep immediate admission.
- Editorial composition supplies scheduled-ledger eligibility behind a hard false code gate. Production waiting remains disabled; caps, models, provider and publication behavior unchanged.
- Bounded diagnostics expose stop category, wait duration, attempt count and original-hold count without hold IDs. Six offline composed cases cover repair, fallback, deadline wake-up and manual/disabled/Haiku paths; all 47 focused LLM tests pass.
- Fixed a floating test promise found by lint. Format/lint-fix, full check/build/deployment results recorded below; offline settlement evaluation passes 15 controls and handbook check passes.
- Updated TASKS/admission plan. No live LLM calls or source/UI/schema changes; handbook runtime description, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: exercise production ShortlistEditor repair/fallback with this policy and missing-context/legacy-ledger paths before enabling waits. Natural scheduled NBA AI-edited acceptance remains pending.
- Final verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` pass (914 unit/287 integration, four expected skips); `pnpm build` passes with existing bundle warning. Handbook, settlement evaluation and `git diff --check` pass.
- API/worker restarted active outside protected hours; `/healthz` database/Redis healthy, zero alerts, digest queue staffed/zero failures. Live edition unchanged at five topics/25 stories.

## 2026-11-12: iteration 2023 — production editor settlement admission controls

- Clean main/no inherited work. Initial alerts and health green; all 38 sources healthy, digest-generation staffed/zero failures. Next scheduled edition Nov 13 15:00 UTC.
- Added six offline production ShortlistEditor controls with the internal settlement policy enabled: separately reserved/settled initial and repair calls, settled-but-still-refused Haiku fallback, shared deadline expiry, missing execution context, legacy ledger and partial-ledger capability.
- Asserted model dispatch, unchanged shared execution context, repair feedback, exact admission/sleep counts and reservation settlements. Deadline expiry prevents all provider dispatch and further reservations.
- Production waiting remains disabled; no paid calls, cap/model/provider changes, source changes or saved-edition mutation. Updated TASKS and admission plan; runtime handbook, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: focused editor suite 33/33; `pnpm format`, `pnpm lint:fix`, `pnpm check` (920 unit/287 integration pass, four expected skips), `pnpm build`, handbook check, settlement evaluation (15 controls) and `git diff --check` pass. Existing bundle warning only.
- Next: review remaining admission rollout gates before enabling waits. Natural scheduled NBA AI-edited acceptance remains pending.

## 2026-11-12: iteration 2024 — real ledger settlement composition

- Clean main/no inherited work. Initial alerts and health green; all 38 sources healthy, digest queue staffed/zero failures; next scheduled edition Nov 13 15:00 UTC.
- Added an isolated real-Postgres settlement control: two waiters freeze the same original hold; settlement during sleep frees budget; exactly one atomic admission wins and the other stops without extending to the new hold.
- Verified two ledger rows, one pending reservation, 60,000 microdollars accounted, two attempts/250 ms per caller and released admission locks during sleep. Production waiting remains disabled.
- Corrected two test-fixture mistakes found by integration runs: insufficient shared allowance caused a mixed refusal; raw bigint strings required numeric SQL projections. Focused disposable-container file then passed 5/5.
- One repeated unit run stalled in unchanged telemetry transport coverage; stopped it, standalone file passed 3/3, subsequent full unit runs passed. No production telemetry changes.
- Final verification: pnpm format, pnpm lint:fix, pnpm check (920 unit/288 integration pass, four expected skips), pnpm build, handbook check, settlement evaluation (15 controls), git diff --check pass. Existing bundle warning only.
- Updated TASKS and admission plan. No live LLM calls or source/UI/schema/publication changes; SOURCES, NEEDS_FROM_HUMAN and runtime handbook unchanged.
- API/worker restart and health readback recorded after push. Live latest edition retains five topics/25 stories.
- Next: verify scheduled publication after AI deadline expiry before enabling settlement waits; natural scheduled NBA AI-edited acceptance remains pending.

## 2026-11-12: iteration 2025 — publication survives AI deadline expiry

- Clean main/no inherited work. Initial alerts and health green; all 38 sources healthy, digest-generation staffed/zero failures; next scheduled edition Nov 13 15:00 UTC.
- Added an isolated real-Postgres scheduled-generation control using production BudgetedLlm, triage, editor and preview repository with an expired shared execution context.
- Two scheduled keys publish source-excerpt editions with the expected selected story IDs; saved snapshots remain readable through published-only retrieval and scheduled-key lookup. No reservation or provider dispatch occurs.
- Synthetic fixture content stays in disposable test storage. No live LLM calls, saved-edition mutation, source/UI/schema/runtime behavior change; settlement waiting remains disabled.
- First check reached lint before concurrent lint-fix finished sorting imports; reran after lint-fix completed. Build and handbook check pass; remaining verification recorded below.
- Updated TASKS and admission plan. Runtime handbook, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: review remaining settlement rollout gates before enabling waiting; natural scheduled NBA AI-edited acceptance remains pending.
- Final verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (920 unit/289 integration pass, four expected skips), `pnpm build`, handbook check, offline settlement evaluation (15 controls) and `git diff --check` pass. Existing bundle warnings only.

## 2026-11-12: iteration 2026 — enable bounded scheduled Sonnet settlement admission

- Clean main/no inherited work. Health and alerts green; 38 sources healthy, digest queue staffed/zero failures; next scheduled edition Nov 13 15:00 UTC.
- Reviewed the ledger, deadlines, original-hold concurrency, production editor and expired-publication controls against all admission rollout gates; enabled the internal editorial factory switch.
- Only trusted scheduled Sonnet calls can wait: five seconds/21 attempts, frozen original holds and 300-second completion headroom; full atomic admission and all caps remain unchanged.
- No paid replay, provider/model change, source change or saved-edition mutation. Natural scheduled wait diagnostics, NBA editing and publication acceptance remain pending.
- Updated TASKS, rollout evidence/rollback procedure and owner budget handbook; archived iterations 2012–2020 after PROGRESS exceeded 25 KB. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (920 unit/289 integration pass, four expected skips), `pnpm build`, focused handbook check, 15-control offline settlement evaluation and `git diff --check` pass. Existing bundle warning only.
- API/worker restart and health/source/edition readback follow push; live publication remains five topics/25 stories.

## 2026-11-12: iteration 2027 — scheduled settlement review handoff

- Clean main/no inherited work. Corrected stale disabled-wait wording in active TASKS and the admission plan after iteration 2026 enabled the bounded policy.
- Added a read-only Nov 13 scheduled-review checklist: log commands/fields, immediate-versus-waited admission, stop categories, bounded attempts/holds, publication agreement and separate NBA acceptance.
- No provider calls, runtime changes, budget changes, public activation or accepted-screen reruns. Authenticated-proxy and natural scheduled acceptance gates remain open.
- `pnpm obs health --check`, `pnpm obs sources --check`, `pnpm obs jobs --check --queue digest-generation --limit 1`: healthy, 38 healthy sources, staffed queue/zero failures, next Nov 13 15:00 UTC. Zero alerts.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z`: latest/direct/history agree, five topics/25 stories/22 posts. Last-hour settlement log query empty before next scheduled generation, as expected.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (920 unit/289 integration pass, four expected skips), `pnpm build`, handbook check (18 pages/22 diagrams/39 tables) and `git diff --check` pass. Existing bundle warning only. SOURCES and NEEDS_FROM_HUMAN unchanged.
- API/worker restart and post-push health readback follow commit; runtime code is unchanged.
- Next: review natural wait diagnostics and NBA AI editing after Nov 13 scheduled publication; no paid replay.

## 2026-11-12: iteration 2028 — passive metrics recovery sample

- Owner value: verify alert evaluation and dashboard reads remain healthy during natural storage work without adding load or changing production limits.
- Clean main/no inherited work. Health green, zero alerts, all 38 sources healthy; staffed digest queue has zero failures and next run Nov 13 15:00 UTC.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`: 24 fresh healthy rules, four uncached queries ≤0.416 s, zero new evaluator errors/misses, query admission limits/timeouts/slow queries or restarts.
- One small 1,525-row merge; no large-tier merge. Comparable natural-compaction recovery remains open; next probe ≥21:16 UTC, at most hourly.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z`: latest/direct/history agree on five topics/25 stories/22 posts.
- TASKS and capacity evidence updated; no runtime/source/budget/public-access change or paid provider calls. NBA and settlement acceptance await Nov 13; authenticated proxy evidence still pending.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (920 unit/289 integration pass, four expected skips), `pnpm build`, handbook check (18 pages/22 diagrams/39 tables) and `git diff --check` pass. Existing bundle warning only.
- API/worker restart and post-push health readback follow commit; runtime code unchanged.
- Next: Nov 13 scheduled NBA/settlement acceptance; authenticated proxy evidence and comparable natural-compaction recovery remain open.

## 2026-11-12: iteration 2039 — passive metrics recovery sample

- Owner value: confirm alert evaluation and reader availability during natural storage work without extra production load or changed limits.
- Clean main/no inherited work. Zero alerts, healthy API/DB/Redis, 38 healthy sources; staffed digest queue/zero failures, next edition Nov 13 15:00 UTC.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`: 24 healthy rules, four uncached queries ≤0.488 s, zero new evaluator errors/misses, admission limits/timeouts/slow queries or restarts.
- One small merge/15,288 rows; no large-tier merge. Comparable natural-compaction recovery remains open; next short probe ≥22:21 UTC, at most hourly.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z`: latest/direct/history agree, five topics/25 stories/22 posts.
- TASKS and capacity evidence updated. NBA/settlement acceptance awaits Nov 13; authenticated proxy credentials/trust remain unavailable. No provider calls or runtime/source/budget/public-access change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (920 unit/289 integration pass, four expected skips), `pnpm build`, handbook check (18 pages/22 diagrams/39 tables) and `git diff --check` pass. Existing bundle warning only.
- API/worker restart and post-push health readback follow commit; runtime code unchanged. SOURCES and NEEDS_FROM_HUMAN unchanged.

## 2026-11-12: iteration 2040 — repair malformed editorial selections

- Owner value: help scheduled NBA editing recover from the recorded malformed story ID instead of retrying without correction guidance.
- Clean main/no inherited work. Health green, zero alerts, 38 healthy sources; staffed digest queue/zero failures, next Nov 13 15:00 UTC.
- Found `invalid-selection` supplied no repair feedback. Added fixed guidance covering exact candidate IDs, evidence IDs, uniqueness, budget and brief bounds; factual guards remain intact.
- Offline production BudgetedLlm/ShortlistEditor replay rejects the recorded Haiku initial response, then accepts a simulated repair changing only its malformed ID; no prose changes or production ID remapping.
- Targeted editor/recorded-replay tests: 36 pass. Original four-response replay outcomes unchanged; unsupported Sonnet absence claims and original invalid ID remain refused.
- `pnpm build`, handbook check (18 pages/22 diagrams/39 tables), reader publication gate and `git diff --check` pass. Existing bundle warnings only. `pnpm check` passes: 921 unit/289 integration tests, four expected skips.
- TASKS and edition review updated; SOURCES/NEEDS_FROM_HUMAN unchanged. No paid calls, cap changes or public activation.
- Next: natural NBA/settlement acceptance Nov 13 15:00 UTC; authenticated proxy credentials/trust remain blocked. Metrics probe not repeated before ≥22:21 UTC.
- `pnpm format` and `pnpm lint:fix` pass; API/worker restart and post-push readback follow commit.

## 2026-11-13: iteration 2100 — reconcile owner proxy evidence

- Clean main; no inherited work. Owner's Nov 13 evidence verifies shared port 8000 and replacement of a spoofed email header for a signed-in request.
- Updated TASKS, security handoff and the original human request to stop reporting those checks as wholly pending. UserID-header and future anonymous behavior remain uncovered; public activation stays with the owner.
- `pnpm obs alerts`, `health`, `sources --check`, `services --check` and `jobs --check --limit 1` pass: zero alerts, healthy services/sources, staffed digest queue/zero failures, next edition Nov 13 15:00 UTC.
- Initial `obs jobs --queue digest` was rejected; corrected with the all-queue check (`digest-generation` is the queue name).
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z` passes: five topics/25 stories/22 posts agree across latest/direct/history.
- Documentation-only change; no paid calls, source/budget changes, public activation or repeated accepted-screen checks. SOURCES unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, handbook check (18 pages/22 diagrams/39 tables) and `git diff --check` pass; existing bundle warning only.
- First `pnpm check` stalled in telemetry-export transport test; terminated that test process. Isolated three-test rerun passed; full `pnpm check` retry passed (921 unit/289 integration, four expected skips). No code change or reproduced failure.
- Initial push rejected by newer upstream commits; merged origin/main without rewriting history. New STEERING 59 closes the proxy gate and prioritizes four saved NBA responses, then private-sharing public-mode activation. API/worker restarted; health passes. Next: implement item 59 NBA fixes before noon; sharing remains owner-gated.

## 2026-11-13: iteration 2101 — accept supported split/reordered NBA reports

- Clean main; no inherited work. Health/services and 38 sources green, zero alerts.
- STEERING 59 breakage first: source-bound Curry report equivalences now accept split summary attribution and reordered reportedly-qualified briefs.
- Offline production four-response replay: unchanged Sonnet initial/repair and Haiku repair pass; Haiku initial retains its malformed-ID refusal. Existing ID-only simulated repair remains valid.
- Twelve targeted tests pass, including changed player/venue/injury/duration, missing hedge/attribution, unrelated evidence and added unsupported absence refusals. No paid calls or saved-publication changes.
- Build and handbook check pass (18 pages/22 diagrams/39 tables); existing bundle warning only. Latest/direct/history agree on five topics/25 stories/22 posts.
- TASKS and Nov 12 evidence updated. SOURCES/NEEDS_FROM_HUMAN unchanged; no source, budget, public-mode or sharing changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (922 unit/289 integration pass, four expected skips), `pnpm build`, handbook check and `git diff --check` pass. First check caught lint-induced formatting; reformatted test and full retry passed.
- API/worker restart and post-push health readback follow commit. Next: natural Nov 13 NBA AI-edited acceptance; meanwhile item 59 public-readiness work.

## 2026-11-13: iteration 2102 — reconcile private launch gates

- Clean main; no inherited work. Zero alerts, healthy services/healthz and all 38 sources; digest worker staffed, zero failed digest runs, next edition Nov 13 15:00 UTC.
- Reconciled public-readiness checklist with STEERING 59: scheduled NBA/item 58 gate retained, lead re-check parallel, private-sharing activation authorized, public Grafana/capacity excluded and Spend allowed.
- Replaced the stale TASKS next step; moved historical rollout/native-tool/page receipts into linked public-readiness-evidence.md, preserving evidence and relative links.
- No runtime, source, provider, budget, sharing or public-mode changes. SOURCES and NEEDS_FROM_HUMAN unchanged; no accepted-screen reruns.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, handbook check (18 pages/22 diagrams/39 tables), readiness relative-link/evidence-preservation check and `git diff --check` pass; existing bundle warning only.
- `pnpm check` passes: 922 unit/289 integration tests, four expected skips. API/worker restart and post-push health readback follow commit.
- Next: finish remaining non-Grafana read-only rollout and full public-mode rehearsal; scheduled NBA acceptance must close item 58 before activation.

## 2026-11-13: iteration 2103 — finish public Tools launch scope

- Clean main; no inherited work. Zero alerts, healthy services/healthz and 38 sources; digest queue staffed, next edition Nov 13 15:00 UTC.
- Removed Grafana's disabled preparation card from public Tools for readers and admins, as STEERING 59 requires. Private Tools retains Grafana; public handbook/explorer/Queues links and admin-only telemetry links remain intact.
- Focused offline Playwright check passes for reader/admin/private variants and four viewport/theme screenshots; inspected mobile capture, no overflow/page errors. First harness attempt timed out because its admin fixture refetched a reader identity; corrected the fixture actor, then reran successfully.
- Reconciled exact installed read-only route/tool inventory and closed its stale rollout checkbox, retaining historical evidence. Runbook now requires a normal public-mode scheduled edition before item 50 stops for sharing.
- Updated affected operations handbook and TASKS. Handbook initially exceeded 100 lines; shortened it and validation passes (18 pages/one diagram/39 tables). Review/checklist relative file links resolve.
- `pnpm format`, `pnpm lint:fix`, final typecheck/build, focused browser check and `git diff --check` pass; existing bundle warning only. Full `pnpm check` retry passes: 922 unit/289 integration, four expected skips; initial command-session run terminated (143) during integration with no reported failure. Retry ran in a transient systemd unit and exited zero.
- Saved Nov 12 latest/direct/history agree: five topics/25 stories/22 posts. No paid calls, source/budget/provider changes or public activation; SOURCES and NEEDS_FROM_HUMAN unchanged.
- API/worker restart and post-push health readback follow commit. Next: complete public-mode rehearsal; Nov 13 scheduled NBA acceptance must close item 58 before activation with sharing private.
