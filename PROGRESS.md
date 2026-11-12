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

## 2026-11-12: iteration 1886 — scheduled fifth-topic collection readback

- Clean main/no inherited work. API/database/Redis healthy, all 38 sources without errors, zero alerts; staffed digest queue zero failures, next scheduled edition Nov 12 15:00 UTC.
- First post-fix hourly Bluesky job completed naturally at 03:54:53 UTC in 9.079 s. Read retained BullMQ returnvalue: complete, five topics explicitly present, Tech/NBA/Gaming/World fetched/submitted 50/49/50/47; U.S. dedicated query fetched/submitted zero.
- `pnpm exec tsx scripts/report-bluesky-coverage.ts` at 03:55 UTC confirms updated observations for the other four topics and zero stored U.S. observations. This closes scheduler invocation evidence, not U.S. content coverage or editorial acceptance. No collection/provider call was triggered by the agent.
- Updated SOURCES/TASKS; query tuning stays paused under item 58/current order. Item 58 still awaits authenticated exe.dev proxy checks and scheduled post-fix publication. Public mode/budgets unchanged; no accepted-screen reruns. Archived iterations 1873–1875 to keep progress bounded.
- Corrected a pnpm banner/JQ pipeline with `--silent`; redis-cli unavailable, used installed ioredis for a single read-only HGET. No secrets printed or persisted.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (878 unit/286 integration passing, four expected skips), `pnpm build`, full handbook check (18 pages/22 diagrams/39 tables), and `git diff --check` pass; existing bundle warning only. Docs restart and final health check follow commit/push.
- Next: pending authenticated proxy evidence and Nov 12 15:00 edition; metrics probe no earlier than 04:13 UTC.

## 2026-11-12: iteration 1887 — mixed launch and sales-pitch selection proposal

- Clean main/no inherited work. Zero alerts; API/database/Redis and 38 sources healthy. Digest queue staffed, zero failures, next scheduled edition Nov 12 15:00 UTC. Corrected initial unsupported queue alias `digest` to `digest-generation`.
- Read the saved Nov 11 edition topic by topic. Owner value: distinguish an interesting technical launch from a sales offer competing for one of five Tech post slots.
- FishAudio card combines a full-duplex model announcement with enterprise-demo and free-agent reply solicitation; its saved metrics are empty. This is a comparison question, not proof the selection is wrong.
- Added a bounded proposal in `docs/ideas.md`: compare saved alternatives/cached scoring, preserve original text and avoid phrase filters or blanket rejection of commercial launches. No provider calls or tuning; item 50 still takes priority.
- Authenticated proxy evidence and scheduled post-fix acceptance remain unavailable; no accepted-screen reruns. SOURCES and NEEDS_FROM_HUMAN unchanged because no collection or new owner gate changed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (878 unit/286 integration passing, four expected skips), full handbook check (18 pages/22 diagrams/39 tables), targeted Prettier check and `git diff --check` pass.
- No app/config/UI change; no rebuild, screenshots or restart needed. Healthy services stay running under STEERING 22.

## 2026-11-12: iteration 2004 — first five-topic edition and NBA recurrence

- Clean main/no inherited work. Health/database/Redis and all 38 sources healthy; zero firing alerts or failed services. Observed the natural scheduled run without restart, collection, paid replay or job writes.
- Edition `b1be5a12` published 15:03:52.422 UTC, 232.339 s/one attempt; `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z` passes latest/direct/history: five topics/25 stories/22 posts. Earlier pending reads correctly served Nov 11.
- Read saved briefs/summaries/posts and evidence using reader GETs/protected preview, `report-edition-timing.ts --scheduled-only --limit 1`, `report-x-discovery.ts 2026-11-12` and bounded worker journal. World/U.S. five stories each, no repeated/misplaced event; split acceptance fails because NBA degrades and three Sonnet admissions are refused.
- NBA all four rejected responses retained privately; direct offline `assertAbsenceSupport` replay reproduces supported Curry absence paraphrase refusals. Haiku initial also has an invalid story ID. Added highest-priority full-validator replay/fix task; no guard, prompt, model or budget changes. Item 58 normal post-fix acceptance remains open alongside authenticated proxy evidence.
- AI $0.517657/$0.65 (70 settled responses), X $0.327795/$0.50; zero holds/unresolved. Three Sonnet refused admissions: World social repair, U.S. social initial, World Bluesky initial. Final spend below cap does not close the no-refusal gate.
- Bluesky four picks/no U.S. candidates; Tech/NBA replace one X slot each. Tech repeats a story, Gaming repeats X award event, World has zero likes/reposts. Social tuning remains paused. Updated daily review, TASKS, SOURCES and security handoff; NEEDS_FROM_HUMAN unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (878 unit/286 integration passing, four expected skips), full handbook check (18 pages/22 diagrams/39 tables), targeted final Prettier and `git diff --check` pass. Archived iteration 1876 to keep progress bounded.
- No runtime/UI changes; rebuild/screenshots/restart unnecessary under STEERING 22/55. Next: restore NBA from saved outputs before further phase 4/split work.

## 2026-11-12: iteration 2005 — complete offline NBA rejection replay

- Clean main/no inherited work. Zero alerts, `/healthz` database/Redis healthy and no failed user services. Initial orientation output was too broad; subsequent reads bounded to relevant sections.
- Added a recorded Nov 12 fixture containing the actual bounded NBA inputs and all four rejected outputs, excluding private storage paths/instructions/provider request metadata. No provider calls, job writes, cache writes or spend.
- `pnpm exec tsx apps/api/scripts/replay-nba-rejections.ts` now checks each output through the production `ShortlistEditor` validator with an injected offline adapter. All four still fail: Sonnet initial/repair and Haiku repair summary absence; Haiku initial invalid selection.
- Independent field probes reveal eight refusals: four Curry summaries, three Curry briefs and the initial Sonnet Reaves summary's attributed “No update on AR” quote. A Curry-summary-only fix cannot restore the edition. Saved fixture/test preserves these hidden failures for the corrective step.
- Updated TASKS and daily review. Runtime guards, prompts, models, budgets and current publication unchanged. NBA correction remains highest priority; authenticated proxy and normal post-fix edition gates remain open. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Targeted replay regression, `pnpm format`, `pnpm lint:fix`, `pnpm build` and full handbook check (18 pages/22 diagrams/39 tables) pass; initial full check caught an async lint error, fixed before rerunning. `pnpm check` passes: 879 unit/286 integration tests, four expected skips. Existing bundle warning only. Archived iteration 1877 to keep progress bounded.
- During verification, GamingBolt timed out once; scheduled retry completed HTTP 200 at 15:17:59 UTC. `pnpm --silent obs sources --check` passes all 38 sources at 15:23 UTC; `/healthz` remains healthy. RecentJobFailures cleared by final alert snapshot (zero firing/pending). No manual retry or source change.
- Final targeted Prettier and `git diff --check` pass; digest-generation queue staffed, zero failures, next edition scheduled. No UI changes or accepted-screen reruns; no service restart needed for offline scripts/fixtures/docs.

## 2026-11-12: iteration 2006 — NBA correction negative controls

- Clean main/no inherited work. Zero alerts, healthy `/healthz` database/Redis, no failed user units; all 38 sources healthy at 15:32 UTC. Initial orientation output exceeded the cap; subsequent reads were bounded.
- Added offline safety tests using the actual bounded Nov 12 Curry/Reaves evidence. Twelve synthetic unsupported claims checked in both summary and brief modes (24 refusals): duration, certainty, attribution, subject, return timeline, quote scope/date and unrelated evidence. Exact supplied excerpts still pass both modes.
- These controls constrain the pending supported-paraphrase correction; they do not restore NBA. Saved four-response production replay remains unchanged with zero validated outputs. No runtime/prompt/guard/budget changes, provider calls or job writes.
- Updated TASKS and daily review; SOURCES/NEEDS_FROM_HUMAN unchanged because no source or owner gate changed. No UI or handbook behavior change. No rebuild/restart needed for tests/docs; deployment window remains closed until 16:00 UTC.
- Verification: targeted safety tests pass (2 tests/24 negative checks); `pnpm format`, `pnpm lint:fix`, full `pnpm check` (881 unit/286 integration passing, four expected skips), targeted Prettier and `git diff --check` pass. Next: correct supported paraphrases against both the full recorded replay and these negative controls, then deploy outside the protected window.

## 2026-11-12: iteration 2007 — preserve complete attributed NBA quotes

- Clean main/no inherited work; zero alerts, healthy database/Redis and no failed user units. Initial orientation output was too broad; subsequent reads bounded.
- Fixed the supported Reaves summary refusal with a narrow existing NBA-summary opt-in: preserve the entire direct quote, resolve its surname to the immediately preceding coach's full name in the same excerpt, and reject negative language outside the quote. No entity-specific rules or changes to other fields/topics.
- Original Reaves prose now passes. Offline production-validator isolation removes only Curry/its brief bullet; all four retained Sonnet stories validate unchanged on the first call. Complete replay still rejects all four outputs (seven absence-field refusals, down from eight); Curry and invalid selection remain open.
- Added 12 quote counterfactual refusals; the prior 24 safety checks still pass. No provider calls, prompt/model/budget changes, job writes or saved-edition changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (883 unit/286 integration passing, four expected skips), `pnpm build` and targeted final tests (9 passing, including the later isolation test) pass. Existing bundle warning only.
- Updated TASKS and daily review; archived iterations 1878–1879 to keep progress bounded. No source/owner-gate/handbook/UI change; SOURCES/NEEDS_FROM_HUMAN and screenshots unchanged.
- API/worker restarted after the protected window at 16:00 UTC; startup retry reaches healthy `/healthz` (database/Redis), all 38 sources healthy, no failed units and zero firing/pending alerts. Digest queue has zero active/failed jobs and the next scheduled edition queued. Final `git diff --check` passes.
- Next: correct supported Curry summaries/briefs while preserving attribution, duration and certainty controls; NBA acceptance remains open.

## 2026-11-12: iteration 2008 — resolve attributed absence through matching departure

- Clean main/no inherited work; initial alert snapshot zero, `/healthz` database/Redis healthy and no failed user units. Initial orientation output was too broad; subsequent reads bounded.
- NBA-summary guard now accepts the saved Haiku repair Curry summary: resolve “him” only through the immediately preceding full-name departure/injury sentence, then match the complete source report with the same team, duration, reporter and outlet. Only game/contest and apostrophe spelling vary; no player-specific exemption.
- Twelve altered summary counterfactuals, unrelated evidence and brief-mode use still fail; evidence-derived replacement player passes. Earlier quote/absence controls remain green. Full offline replay now reaches Haiku repair's brief refusal; six absence-field refusals remain, down from seven. All four complete responses still fail; NBA acceptance remains open.
- Verification: `pnpm exec tsx --test apps/api/test/nba-absence-safety.test.ts apps/api/test/nba-rejection-replay.test.ts apps/api/test/absence-support.test.ts` (10 passing); offline replay; `pnpm format`, `pnpm lint:fix`, `pnpm check` (885 unit/286 integration passing, four expected skips), `pnpm build` pass. Existing bundle warning only.
- API/worker restarted after 16:00 UTC; startup retry reaches healthy `/healthz`, all 38 sources healthy, zero failed units and zero firing/pending alerts. Digest-generation queue staffed, zero failed/active jobs, next edition Nov 13 15:00 UTC.
- Updated TASKS and daily review. No provider calls, prompt/model/budget changes, saved-edition writes or UI/handbook/source changes; SOURCES/NEEDS_FROM_HUMAN unchanged. Next: remaining Curry summaries/briefs with the existing attribution, duration, certainty and selection controls intact.

## 2026-11-12: iteration 2009 — preserve combined attributed absence reports

- Clean main/no inherited work; zero alerts, healthy database/Redis, no failed units and all 38 sources healthy. Initial orientation output was too broad; subsequent reads bounded.
- NBA-summary guard now accepts a complete attributed departure/absence report with same-source full-name or surname subject. Team, event, injury, duration, hedge, reporter and outlet must match; no player-specific exemption.
- Saved Haiku initial Curry summary passes; Sonnet initial first sentence passes in isolation but its shortened Kerr uncertainty sentence still fails. Complete offline replay retains four rejected outputs; five absence-field refusals remain, down from six. Invalid selection remains rejected.
- Ten altered claims, unrelated evidence, brief use and non-NBA use fail; evidence-derived renamed player passes. No provider calls, prompt/budget changes or saved-edition writes.
- Verification: targeted absence/replay tests (11 passing); offline production replay; `pnpm format`, `pnpm lint:fix`, `pnpm check` (886 unit/286 integration passing, four expected skips), `pnpm build` pass. Existing bundle warning only.
- API/worker restarted after protected window; initial readiness fetch retried successfully. `/healthz` healthy, all 38 sources healthy, no failed units and zero alerts. Digest queue staffed, zero active/failed jobs, next edition Nov 13 15:00 UTC.
- Updated TASKS/daily review; archived iterations 1880–1881 to bound progress. No UI/handbook/source/owner-gate changes; SOURCES/NEEDS_FROM_HUMAN unchanged. Next: remaining Curry summaries/briefs with existing safety controls intact.

## 2026-11-12: iteration 2010 — retain complete attributed uncertainty

- Clean main/no inherited work; zero alerts, healthy database/Redis, no failed units, all 38 sources healthy. Initial orientation output was too broad; subsequent reads bounded.
- NBA summary guard accepts the saved Sonnet initial uncertainty sentence with unchanged coach, injury reference and both cause/timing uncertainty dimensions, omitting only the source's trailing positive locker-room event clause. No player-specific rule.
- Altered speakers, dropped uncertainty dimensions, extra negative claims, unrelated evidence and qualifying/negative continuations remain refused; other fields/topics unchanged. Full offline production replay now reaches Sonnet initial's brief; four absence-field refusals remain, down from five. All four full outputs still fail; invalid selection remains protected.
- Targeted absence/replay tests: 12 pass. No provider calls, prompt/budget changes, job writes or saved-edition changes. Updated TASKS/daily review; no handbook/UI/source/owner-gate change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (887 unit/286 integration pass, four expected skips), `pnpm build` and `git diff --check` pass. Existing bundle warning only.
- API/worker restarted outside protected hours; startup retry reaches healthy `/healthz`; no failed units/zero alerts. Digest queue staffed with zero active/failed jobs, next edition Nov 13 15:00 UTC. Next: remaining Curry summaries/briefs with safety/selection controls intact.

## 2026-11-12: iteration 2011 — validate complete saved NBA repair

- Clean main/no inherited work; initial alerts zero, healthy database/Redis and no failed units. Initial orientation output was too broad; later reads bounded.
- Complete saved Haiku repair now validates through the production editor (five stories/four briefs). NBA-only brief equivalence keeps player, venue, injury, duration, hedge, reporter and outlet from one source report; Warriors/Golden State identity is explicit, no player exemption.
- Twelve altered brief claims, unrelated evidence and non-NBA use fail; evidence-derived renamed player passes. Earlier summary/quote safety and invalid-selection guards remain green. Three absence-field refusals remain across the other outputs; scheduled NBA acceptance stays open.
- Verification: targeted absence/replay tests (13 pass); `pnpm format`, `pnpm lint:fix`, `pnpm check` (888 unit/286 integration pass, four expected skips), `pnpm build` pass. Existing bundle warning only; `git diff --check` clean.
- Restarted API/worker outside protected hours; `/healthz` database/Redis healthy, all 38 sources healthy, zero failed units/alerts. Digest-generation staffed, zero active/failed jobs, next edition Nov 13 15:00 UTC.
- Updated TASKS/daily review; archived iterations 1882–1885 to bound progress. No provider calls, prompt/model/budget changes, saved-edition writes or UI/handbook/source changes; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Next: review next scheduled NBA acceptance; remaining Sonnet summaries/briefs stay rejected pending equally supported corrections.

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
