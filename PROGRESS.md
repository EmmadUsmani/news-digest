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

## 2026-11-11: iteration 1840 — fifth-topic saved-cost gate

- Clean main; no inherited work. Initial alerts zero; healthz/database/Redis healthy and all 36 sources healthy. Item 50 remains stopped under 55; continued item 56.
- Added provider-free, read-only repeatable-read evaluator joining Nov 4–10 saved edition UUIDs to ledger run IDs; checks four topics, positive costs and zero unresolved calls, and reads recent fully AI-complete costs.
- Saved actual costs $0.286904–$0.422356. Equal-share fifth-topic proxy peaks at $0.527945; 1.5× reserve $0.791918 exceeds the approved $0.65 ceiling. Ledger has no topic attribution; estimate explicitly does not claim measured World cost or future admission.
- Recorded figures and next gate in docs/edition-reviews/2026-11-11-fifth-topic-budget.md and TASKS.md. No caps, production topics, provider/model choices or reserve rules changed; no paid calls.
- `pnpm exec tsx scripts/evaluate-fifth-topic-budget.ts --read-only`, `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` pass. Full `pnpm check` passes: 836 unit/283 integration passes, four expected skips; typecheck/lint/format/boundaries green.
- Next: topic data and joint AI event ownership with costed requests/admission below the approved ceiling before coordinated activation; scheduled acceptance still pending.

## 2026-11-11: iteration 1841 — prepared joint story ownership

- Clean main; no inherited work. Initial alerts zero; healthz/database/Redis healthy. Item 50 remains stopped under 55; continued item 56 without provider calls or runtime/cap changes.
- Added opt-in EventGrouping.assignTopics: one budgeted/cached Haiku request jointly groups up to 40 articles from two data-defined scopes and assigns each event one owner. Existing per-topic grouping remains unchanged; no production caller yet.
- Requires complete exclusive article-ID membership, valid owner IDs and strict output shape. Invalid/partial output or budget refusal returns unavailable, with no repair request; singleton events can move to the appropriate scope.
- Eight provider-free contract tests pass for cross-topic grouping, singleton reassignment, cache identity, invalid membership/input and refusal. Test responses do not establish semantic quality; scheduled acceptance remains pending.
- Updated scope assessment and TASKS. No handbook flow or schema change. Filtered handbook check passes (18 pages/39 tables, no drift).
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, targeted `tsx --test` and `git diff --check` pass: 844 unit/283 integration passes, four expected skips. Existing bundle-size warning only.
- `pnpm obs sources --check`: 36 healthy/zero unhealthy; latest saved edition eb6e962e remains available with four topics. `systemctl --user restart news-digest-api.service news-digest-worker.service` passes after push 9b0ad012; both active, healthz/database/Redis healthy, latest edition still serves and zero alerts.
- Next: costed joint-request admission below the approved ceiling, publication integration/unavailable policy and topic/source data; no fifth-topic activation before these gates.

## 2026-11-11: iteration 1842 — joint ownership reservation measurement

- Clean main; no inherited work. Alerts zero, healthz/database/Redis healthy; 36 sources healthy, latest saved edition eb6e962e serves four topics. Item 50 remains stopped under 55; continued 56.
- Added offline evaluator using actual EventGrouping/BudgetedLlm request construction and admission estimate, refusing in-memory ledger and prohibited provider. No DB, provider calls, runtime/cap/topic changes or ledger writes.
- Seven saved-summary proxies reserve $0.002543–$0.002789; 40 maximum-length ASCII articles reserve $0.010156. Multibyte stress refuses before reservation; exactly one reservation/no repair for valid inputs. These are size probes, not semantic or full-edition admission evidence.
- Conservative combined five-topic proxy reserve $0.807152 exceeds $0.65. Recorded request limits and activation gate in fifth-topic budget review/TASKS; archived progress 1828–1833 to keep orientation small.
- Initial check caught four require-await lint errors in new in-memory adapters; corrected to explicit promises and reran probes successfully. `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, offline probes, filtered handbook check and `git diff --check` pass: 844 unit/283 integration passes, four expected skips.
- API/worker systemd restart passes; both active, healthz/database/Redis healthy; latest edition still serves four topics, zero alerts. Push and post-push restart follow; no runtime code changed.
- Next: cost actual publication plan and measured savings below the ceiling, then publication integration/unavailable policy and topic/source data. No activation from proxy figures alone.

## 2026-11-11: iteration 1843 — grouping savings ceiling

- Clean main; no inherited work. Alerts zero; healthz/database/Redis healthy. Item 50 remains stopped under 55; continued item 56 with no provider calls.
- Extended read-only saved-cost evaluator through the existing repository ledger reader; exact per-run totals reconcile, unresolved calls refuse, model/purpose costs and charged repairs remain visible.
- Nov 4–10 grouping costs $0–$0.007571. Even crediting all four topics' grouping as free (more savings than authorized), with no replacement charge, five-topic proxy reserve peaks at $0.780561: $0.130561 above $0.65. Grouping replacement alone cannot close this proxy gate.
- Peak day's Sonnet story/social editing costs $0.211287/$0.123422; absent topic attribution, no World savings claimed. Recorded evidence in fifth-topic review and TASKS. No caps, models, runtime topics or editorial policies changed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, read-only evaluator, filtered handbook check and `git diff --check` pass: 844 unit/283 integration passes, four expected skips. Existing bundle-size warning only.
- Source check: 36 healthy/zero unhealthy; latest saved edition eb6e962e serves four topics. Commit/push and post-push API/worker restart follow; no runtime code changed.
- Next: cost actual combined shortlist/publication marginal requests without paid calls; publication integration/topic data remain gated on admission.

## 2026-11-11: iteration 1844 — exclusive story editor reservation costs

- Clean main; no inherited work. Initial alerts zero; healthz/database/Redis healthy. Item 50 remains stopped under 55; continued 56 without provider calls or runtime/cap changes.
- Extended offline joint-budget evaluator through production ShortlistEditor/BudgetedLlm request construction, with a refusing in-memory ledger and prohibited provider. Compares unsplit saved World inputs to exclusive manual World/U.S. labels.
- Both-scope windows add $0.062630 initial Sonnet reservation; split lists reserve $0.063548–$0.068173 each. Haiku refusal alternatives reserve $0.003178–$0.003409; assertions enforce model order and zero provider calls.
- Recorded seven-window figures and limits in fifth-topic budget review/TASKS. Saved summaries are size proxies; repairs, raw triage/social work and new domestic candidates remain unmeasured. No combined publication admission or semantic ownership claim; activation stays gated.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, offline probe, filtered handbook check and `git diff --check` pass: 844 unit/283 integration passes, four expected skips. Existing build warnings only.
- `pnpm obs sources --check`: all 36 healthy; latest saved edition eb6e962e serves four topics. Commit/push and post-push API/worker restart follow; no runtime code changed.
- Next: cost raw candidate triage/social work and repair admission, then publication integration/unavailable policy and topic/source data within the approved ceiling.

## 2026-11-11: iteration 1845 — separately budgeted story repairs

- Clean main; no inherited work. Zero alerts, healthz/database/Redis healthy; item 50 remains stopped under 55, continued 56.
- Added offline production editor/BudgetedLlm probe with synthetic invalid schema responses and in-memory ledger; no network client, DB, paid calls or production writes.
- Assertions cover Sonnet initial/repair and Haiku initial/repair, settlement before retry, refusal of both repairs, unavailable result and no invalid cache writes.
- Saved both-scope windows add $0.131605–$0.131606 across four sequential reservation estimates; this is neither charges nor simultaneous holds. Shortened metadata and saved summaries isolate repair mechanics, not full candidate admission.
- Recorded figures and limitations in fifth-topic cost review/TASKS; no runtime, cap, model, topic or handbook behavior changes.
- Verification: `pnpm format`, `pnpm lint:fix`, offline repair probe, `pnpm build`, filtered handbook check and `git diff --check` pass; `pnpm check` passes: 844 unit/283 integration tests, four expected skips.
- All 36 sources healthy; latest saved edition eb6e962e serves four topics. Commit/push and post-push API/worker restart follow.
- Next: measure raw triage/social requests and actual whole-edition admission; publication integration/topic data remain gated on approved ceiling.

## 2026-11-11: iteration 1846 — raw article triage reservations

- Clean main; no inherited work. Initial alerts zero and healthz/database/Redis healthy; item 50 stopped under 55, continued 56.
- Added read-only saved-window probe using production article loader, eligibility filter, CandidateTriage and BudgetedLlm; refusing in-memory ledger, empty cache and prohibited provider. No paid calls, production writes or cap/topic changes.
- Nov 4–10 pools contain 149–200 eligible candidates. Both provisional scopes see the same pool; marginal sequential initial reservations $0.022930–$0.032702, not charges or simultaneous holds. Four windows hit the 200-item loader limit.
- Assertions verify batch size/model/purpose, exact candidate accounting, unavailable scores and zero provider calls. Current source connections/text/settings do not reconstruct historical requests; new domestic volume and cache warming remain unbounded.
- Updated TASKS and fifth-topic budget review; no runtime or handbook behavior change. Next: social requests and whole-edition admission before publication/topic activation.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, read-only probe, filtered handbook check and `git diff --check` pass: 844 unit/283 integration tests, four expected skips. Existing build warnings only.
- All 36 sources healthy; latest saved edition eb6e962e serves four topics. Commit/push and post-push API/worker restart follow; no runtime code changed.

## 2026-11-11: iteration 1847 — saved social request reservations

- Clean main; no inherited work. Initial alerts zero, healthz/database/Redis healthy; item 50 remains stopped under 55, continued 56.
- Added read-only saved-post probe through production social CandidateTriage, SocialPostEditor and BudgetedLlm with refusing in-memory ledger and prohibited provider. Zero provider calls, production writes or cap/topic changes.
- Nov 5–10 saved World picks add $0.063520–$0.133683 sequential reservation estimates when duplicated across proposed scopes; Nov 4 has no saved posts. Includes Sonnet refusal/Haiku fallback, not charges or simultaneous holds.
- Synthetic editor scores isolate sizes; selected posts omit full social volume and engagement evidence. Current settings and repeated candidates do not establish semantic routing or historical costs. Whole-edition admission and full social pools remain next; activation gated.
- Updated TASKS and fifth-topic cost review. No runtime or handbook behavior changes. Read-only probe repeats identically; filtered handbook check and build pass; all 36 sources healthy, latest saved edition serves four topics/19 stories/19 posts.
- Verification: `pnpm format`, `pnpm lint:fix`, corrected script formatting, `pnpm check`, `pnpm build`, repeated read-only probe, filtered handbook check and `git diff --check` pass: 844 unit/283 integration tests, four expected skips. Existing build warnings only.
- Commit/push and post-push API/worker restart follow; no runtime code changed.

## 2026-11-11: iteration 1848 — stored social candidate pool reservations

- Clean main; no inherited work. Alerts zero, healthz/database/Redis healthy; item 50 remains stopped under 55, continued 56.
- Added read-only production X/Reddit selection and Bluesky shortlist probe through CandidateTriage/BudgetedLlm; empty cache, refusing in-memory ledger, prohibited provider/editor. Zero paid calls or production writes.
- Nov 4–10 admitted pools: 7–30 X, zero Reddit, 18–50 eligible Bluesky from 543–744 observations. Both scopes reuse each pool; marginal initial triage reservation estimates $0.004729–$0.011306, not charges.
- Uses exact social-publication baseline guidance and engagement evidence. Bluesky assumes a slot; current exclusions/reader caps apply. New domestic volume, semantic ownership and whole-edition admission remain open; no runtime/cap/topic changes.
- Updated TASKS and fifth-topic review; repeated read-only probe is byte-identical. Filtered handbook check passes (18 pages/39 tables); all 36 sources healthy, latest edition four topics/19 stories/19 posts.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, repeated probe, filtered handbook check and `git diff --check` pass: 844 unit/283 integration tests, four expected skips. Existing build warnings only.
- Committed/pushed this step and restarted API/worker; post-deploy health/source/edition checks recorded before final handoff.

## 2026-11-11: iteration 1849 — whole-edition allowance gate

- Clean main; no inherited work. Alerts zero, healthz/database/Redis healthy; item 50 stopped under 55, continued 56.
- Extended read-only fifth-topic probe with production usage/monthly allowance/reserve policies at hypothetical approved $0.65 daily maximum. Zero provider calls, ledger writes, cap or topic changes.
- Monthly spend $3.701783/zero holds; effective cap $0.534679 today, conditional $0.542011 Nov 12. Both fall below $0.791918 equal-share proxy reserve; shortfalls $0.257239/$0.249907. Clamped protection does not establish full headroom.
- Next-day estimate assumes no intervening spend/hold settlement; no per-request/model or new domestic volume proof. Activation remains gated on achievable cost reduction and volume evidence.
- Updated TASKS/cost review; archived progress 1834–1839 to keep this file small. No runtime or handbook behavior changes.
- Verification: read-only probe and assertions, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check`; 844 unit/283 integration tests pass, four expected skips; filtered handbook check passes. Existing build warnings only.
- All 36 sources healthy; latest saved edition eb6e962e serves four topics. Commit/push and API restart follow; worker code unchanged.

## 2026-11-11: iteration 1850 — proposed domestic feed volume

- Clean main; no inherited work. Initial alerts zero; healthz/database/Redis healthy; item 50 stopped under 55, continued 56.
- Recorded three free RSS responses through SharedHttpClient/parseFeed, HTTP 200 each. Guardian US/NPR Politics/PBS Politics retain 33/10/20 items; 13/8/13 dated in latest edition window, 34 distinct URLs.
- Added offline snapshot evaluator and five manual domestic event examples; impeachment/House-leader events each have three publisher reports. No runtime classifier, source/topic activation, production writes, provider calls or cap changes.
- Window excerpts >=200 characters: 12/0/6. After-cutoff retention is not historical availability; five headline-reviewed examples are not AI-selected publication-ready stories. Cost reduction and joint ownership/publication remain next.
- Updated TASKS, SOURCES and scope assessment; offline replay, build and filtered handbook check pass (18 pages/39 tables). `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, filtered handbook check and `git diff --check` pass: 844 unit/283 integration, four expected skips. Existing build warnings only.
- Latest edition eb6e962e still serves four topics; API restart/post-push health verification follows. No worker runtime change.

## 2026-11-11: iteration 1851 — joint ownership to ranked shortlists

- Clean main; no inherited work. Alerts zero; healthz/database/Redis healthy; all 36 sources ok. Item 50 remains stopped for owner/lead review; continued 56.
- Added prepared jointStoryShortlists bridge from AI ownership to existing ranking: one bounded request, complete exclusive membership, whole-event moves, coverage/publisher preservation and no score bonus.
- Null/refused/failed/invalid ownership aborts the entire split; duplicate input IDs refuse before inference. No production caller, paid calls, cap/flag changes or source activation.
- Four offline tests cover cross-topic event movement, provenance/scores, empty scope, refusal and real EventGrouping parser composition with a recorded response.
- Updated TASKS and scope assessment. Shared-pool deduplication, triage/editor orchestration and achievable whole-edition headroom remain required before activation.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, targeted tests and `git diff --check` pass: 848 unit/283 integration tests, four expected skips. Existing build warnings only.
- Latest saved edition eb6e962e still lists four topics. Commit/push and API/worker restart follow; post-deploy checks recorded before handoff.

## 2026-11-11: iteration 1852 — shared article admission

- Clean main; no inherited work. Initial alerts zero and healthz/database/Redis healthy; item 50 stopped under 55, continued 56.
- Prepared joint shortlist bridge consolidates shared article IDs before its 40-report limit; source labels merge without mutating input or giving a score bonus. AI still owns destination/event decisions.
- Conflicting snapshots refuse before inference; distinct report IDs stay separate for semantic grouping. No production caller, paid requests, activation or cap changes.
- Seven targeted offline tests pass, including shared movement/provenance, 80 observations of 40 unique reports, conflict refusal and existing recorded-parser composition.
- Updated TASKS/scope assessment. Joint triage/editor orchestration and achievable whole-edition headroom remain next; no handbook/runtime behavior change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, targeted tests and `git diff --check` pass: 851 unit/283 integration tests, four expected skips. Existing build warnings only.
- All 36 sources have nonempty successful latest collections/no errors; latest edition eb6e962e serves four topics. Commit/push and API/worker restart follow; post-deploy health verification before handoff.

## 2026-11-11: iteration 1853 — paired ownership/editor handoff

- Clean main; no inherited work. Alerts zero; healthz/database/Redis healthy; item 50 remains at owner/lead stop, continued 56.
- Prepared jointStoryEdits runs exclusive owned ranked shortlists through sequential topic editors; returns both results together or null, with original report coverage.
- First refusal stops later editing; second refusal, exceptions, cross-scope selection/evidence, duplicate selections and budget overflow refuse the pair. No persistence or independent fallback.
- Ten targeted offline tests pass, including three new paired-handoff tests. Recorded ports only; no production caller, paid requests, source activation or cap/flag changes.
- Updated TASKS and scope assessment. Complete triage orchestration and achievable whole-edition budget headroom remain next; no live workflow/handbook change.
- Verification: pnpm format, pnpm lint:fix, pnpm check, pnpm build, targeted tests, filtered handbook check and git diff --check pass: 854 unit/283 integration tests, four expected skips. Existing build warnings only.
- Protected local source snapshot: 36 sources, 36 nonempty latest collections, zero errors. Latest edition eb6e962e still serves four topics. Commit/push and API/worker restart follow, with post-deploy health checks before handoff.

## 2026-11-11: iteration 1854 — complete paired triage gate

- Clean main; no inherited work. Alerts zero; healthz/database/Redis healthy. Item 50 remains stopped for owner/lead review; continued 56.
- Prepared jointStoryTriage scores a unique shared report pool against both scopes independently, retaining separate relevance/importance without filtering or assigning ownership.
- Complete exact score coverage required; partial/duplicate/foreign/invalid/failed results and exceptions refuse the pair. First refusal stops later spending; empty pools make no calls.
- Three targeted offline tests pass. No production caller, paid requests, source activation or cap/flag changes.
- Updated TASKS and scope assessment. Score-aware ownership/editor composition and achievable whole-edition budget headroom remain required before activation.
- Verification: pnpm format, pnpm lint:fix, pnpm build, targeted tests, filtered handbook check and git diff --check pass; pnpm check passes: 857 unit/283 integration tests, four expected skips. Existing build warnings only.
- Protected local source snapshot: 36 sources, 36 nonempty latest collections, zero errors. Latest edition eb6e962e still serves four topics.
- API/worker restarted successfully; post-restart healthz/database/Redis healthy and both units active. Commit/push follows; split remains disabled.
