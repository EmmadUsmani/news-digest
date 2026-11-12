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

## 2026-11-12: iteration 2012 — explain scheduled Sonnet admission refusals

- Clean main/no inherited work; zero alerts, healthy database/Redis, no failed units, all 38 sources healthy. Initial orientation output was too broad; subsequent reads bounded.
- Offline production NBA replay confirms complete Haiku repair still validates; other saved refusals remain protected. No further guard expansion; next scheduled acceptance stays open.
- Reconciled all three Nov 12 refused Sonnet admissions against read-only ledger history and worker journal. Each matches exact settled-plus-pending totals and solely `model-allocation`; shared daily/monthly/provider/reserve limits did not cause these refusals.
- Sonnet shortfalls $0.000297/$0.003016/$0.000754 occurred while pending reservations later released $0.044117/$0.062898 after 1.544–4.434 seconds. Final Sonnet/Haiku charges $0.402316/$0.115341; 70 successful calls, zero pending.
- Evidence/calculation assertions: `node /tmp/iteration-2012-admission.cjs` passes in a READ ONLY transaction; initial connection default corrected to the app's normal local DB fallback. No inference, ledger writes, jobs, saved-edition writes or cap/allocation/provider changes.
- Updated daily review and TASKS with bounded settlement-wait evaluation as the next admission step, retaining competing-request/deadline constraints. No UI/handbook/source/owner-gate changes; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (888 unit/286 integration pass, four expected skips), `pnpm build`, offline NBA replay and `git diff --check` pass. Existing bundle warning only.
- API/worker restarted outside protected hours; `/healthz` healthy, no failed units/zero alerts. Scheduled timing readback: latest run completed, zero retained failures, next edition Nov 13 15:00 UTC. Next: offline bounded-wait evaluation; scheduled NBA acceptance remains pending.

## 2026-11-12: iteration 2013 — evaluate bounded settlement waits offline

- Clean main/no inherited work; `/healthz` healthy, no failed units/alerts, all 38 sources healthy. Initial orientation output truncated; subsequent reads bounded.
- Added `scripts/evaluate-settlement-wait.ts`: deterministic saved-ledger snapshots, production allocation arithmetic, no database/secrets/provider calls or runtime changes. Reconfirmed Nov 12 figures with `node /tmp/iteration-2012-admission.cjs` in a read-only transaction.
- Candidate 250-ms polls/five-second bound individually admit the three estimates after 1.750/4.500/2.750 seconds. At the later shared snapshot only one competing request fits; both atomic reservation orders preserve caps. This is local counterfactual evidence, not a whole-edition replay or guaranteed improvement.
- Thirteen controls pass for missing/late settlement, absent original hold, no/negative release, initial/new other-gate refusal, deadlines, cancellation and exact wait boundary. At most 21 attempts/request; full pending estimates remain charged until settlement.
- Production ledger still returns null on refusal; caller has no propagated edition deadline. Next: structured refusal/original-hold visibility and caller deadline before wiring any bounded wait. Scheduled NBA acceptance remains open.
- Verification: `pnpm exec tsx scripts/evaluate-settlement-wait.ts`, `pnpm format`, `pnpm lint:fix`, `pnpm check` (888 unit/286 integration pass, four expected skips), `pnpm build`, `git diff --check` pass. Existing bundle warning only.
- API/worker restarted outside protected hours; startup retry reaches healthy database/Redis, zero failed units/alerts, 38 healthy sources. Digest queue staffed, zero active/failed jobs; next scheduled edition Nov 13 15:00 UTC.
- Updated TASKS/daily review; no UI, handbook, source, owner-gate, budget/allocation or published-edition changes. SOURCES/NEEDS_FROM_HUMAN unchanged; no new provider spend.

## 2026-11-12: iteration 2014 — specify safe settlement admission contracts

- Clean main/no inherited work; health green, no failed units/alerts, 38 healthy sources. No actionable new private proxy receipt; owner gates remain unchanged.
- Added implementation design for typed atomic refusal/original-hold snapshots, legacy reserve compatibility, bounded original-ID tracking, trusted caller deadlines and adapter cancellation/accounting gates. Waiting stays disabled.
- Found a deadline gap: 60 seconds is one HTTP attempt; current logical calls also have an unbounded inference queue and up to two 429 retries/backoffs. Design requires bounding these before enabling waits.
- Strengthened offline evaluation with candidate 200-second logical-call, ten-second slot and 90-second completion allowances in a 600-second caller budget. These are proposals, not runtime limits or measured publication guarantees.
- All 15 controls pass, including ready-but-insufficient deadline and combined-headroom boundaries; historical individual/competing admission results unchanged with sufficient time.
- Verification: `pnpm exec tsx scripts/evaluate-settlement-wait.ts`, `pnpm format`, `pnpm lint:fix`, `pnpm check` (888 unit/286 integration pass, four expected skips), `pnpm build`, `git diff --check` pass. Existing bundle warning only.
- Restarted API/worker outside protected hours; `/healthz` database/Redis healthy, zero alerts/failed units, 38 healthy sources. Digest queue staffed, zero active/failed jobs; next edition Nov 13 15:00 UTC.
- Updated TASKS/daily review; no runtime, cap/allocation, provider, edition, UI, handbook or source changes; SOURCES/NEEDS_FROM_HUMAN unchanged. No provider spend.
- Next: implement structured ledger results with waiting disabled, then enforce shared deadlines through queue/retries/fallback. Scheduled NBA acceptance remains pending.

## 2026-11-12: iteration 2015 — implement structured atomic ledger admission

- Clean main/no inherited work; initial health/alerts green, 38 healthy sources. No new failed digest jobs; next scheduled edition Nov 13 15:00 UTC.
- Added optional `LlmLedger.reserveDetailed` capability and production implementation; legacy `reserve` maps the same single transaction to ID/null without double insertion. Waiting remains disabled; caps, models, providers and caller deadlines unchanged.
- Refusals return all applicable typed gates, estimate/shared/effective/model availability and same-model pending-hold snapshots from the admission transaction. Old-period pending holds qualify; uncertain holds consume funds but are excluded. More than 64 holds returns explicit overflow with no partial IDs; hold IDs stay out of logs.
- Added isolated regressions for combined gates, old pending/uncertain accounting, snapshot overflow, invalid estimates and exactly one insertion per admitted legacy/detailed call; scheduled reserve and provider/logging controls now assert detailed contracts. Updated old verification-only log expectations to include simultaneous model refusal.
- Focused `pnpm exec tsx --test apps/api/test/reserve-logging.test.ts` passes (2 tests); offline settlement evaluation retains all 15 controls. Full verification results recorded below.
- No UI/handbook/source/owner-gate or published-edition changes; SOURCES/NEEDS_FROM_HUMAN unchanged. No provider spend. Initial queue probe used invalid `digest`; corrected read-only probe to `digest-generation` succeeds.
- Next: bounded original-ID follow-up tracking and shared caller deadline enforcement through queue/retries/fallback before enabling any settlement wait. Scheduled NBA acceptance remains pending.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (888 unit/287 integration pass, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. Live edition readback has five topics/25 stories.

## 2026-11-12: iteration 2016 — track original pending reservation IDs

- Clean main/no inherited work; initial health/alerts green, 38 healthy sources. Digest queue staffed, zero failed jobs; next scheduled edition Nov 13 15:00 UTC.
- Added optional ledger follow-up capability bounded to 64 original IDs and the original model. Returns only still-pending IDs; missing, succeeded, failed and uncertain holds disappear. New competing holds cannot extend the original set.
- Malformed or oversized snapshots throw before DB access; empty snapshots return immediately. Read-only follow-up neither reserves nor authorizes spending and holds no transaction/advisory lock across caller work.
- Extended isolated ledger coverage for old pending holds, duplicates, wrong model, missing IDs, terminal/uncertain transitions, competing holds, input bounds and unchanged row count. Initial full check caught a fixture violating succeeded/cost integrity; corrected transitions to use real settlement/failure methods and reran checks.
- Waiting remains disabled. No provider spend, cap/allocation, UI, publication or source changes; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged.
- Next: shared caller deadlines through inference queue, retry/backoff, repairs and fallback before enabling bounded settlement waits. Scheduled NBA acceptance remains pending.
- Verification: `pnpm format`, `pnpm lint:fix`, corrected `pnpm check` (888 unit/287 integration pass, four expected skips), `pnpm build`, `pnpm exec tsx scripts/evaluate-settlement-wait.ts` (15 controls) and `git diff --check` pass. Existing bundle warning only.
- Restarted API/worker outside protected hours; `/healthz` database/Redis healthy, zero alerts/failed units, staffed digest queue with zero failed jobs. Live edition readback: five topics/25 stories. Archived progress through iteration 2011 to keep the orientation file small.

## 2026-11-12: iteration 2017 — bound inference slot admission

- Clean main/no inherited work; initial alerts/health green, 38 healthy sources. Digest queue staffed with zero failed jobs; next scheduled edition Nov 13 15:00 UTC.
- Replaced unbounded process-local Anthropic slot waiting with a ten-second allowance, preserving four active calls and direct slot transfer. Expired queue entries are removed; a monotonic check after transfer prevents dispatch when timers run late.
- Added typed adapter proof of no dispatch. Budgeted calls release only these unused holds without setting a provider block; transport failures retain uncertain reservations. Existing provider-spend-limit blocking remains unchanged.
- Offline regressions cover expiry without dispatch, capacity recovery, delayed transfer, work failure and ledger/log release versus provider blocking. Focused LLM suite passes all 33 tests; settlement evaluation retains all 15 controls.
- Updated affected handbook and admission plan. Waiting remains disabled; shared caller deadlines across retries/backoff, repairs and fallback remain next. No provider spend, cap/model/provider, UI or published-edition changes; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: `pnpm format`, corrected `pnpm lint:fix`, `pnpm check` (890 unit/287 integration pass, four expected skips), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 06-ai-and-budgets`, `pnpm exec tsx scripts/evaluate-settlement-wait.ts` and `git diff --check` pass. Initial lint found missing test `void` annotations; corrected before full lint/check passed. Existing build warnings only.
- Restarted API/worker outside protected hours; both active, `/healthz` database/Redis healthy, zero alerts, staffed digest queue with zero failed jobs. Live edition remains five topics/25 stories. Scheduled NBA acceptance remains pending.
