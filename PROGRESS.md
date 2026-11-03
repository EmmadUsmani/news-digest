# Progress

Archived: [iteration 325](docs/progress-archive/2026-11-03-iteration-325.md), [iteration 324](docs/progress-archive/2026-11-03-iteration-324.md), [iteration 321](docs/progress-archive/2026-11-03-iteration-321.md), [iteration 320](docs/progress-archive/2026-11-03-iteration-320.md), [iteration 319](docs/progress-archive/2026-11-03-iteration-319.md), [iterations 317–318](docs/progress-archive/2026-11-03-iterations-317-318.md), [iterations 315–316](docs/progress-archive/2026-11-03-iterations-315-316.md), [iterations 313–314](docs/progress-archive/2026-11-03-iterations-313-314.md), [iterations 311–312](docs/progress-archive/2026-11-03-iterations-311-312.md), [iterations 309–310](docs/progress-archive/2026-11-03-iterations-309-310.md), [iterations 307–308](docs/progress-archive/2026-11-03-iterations-307-308.md), [iterations 305–306](docs/progress-archive/2026-11-03-iterations-305-306.md), [iterations 303–304](docs/progress-archive/2026-11-03-iterations-303-304.md), [iteration 302](docs/progress-archive/2026-11-03-iteration-302.md), [iteration 301](docs/progress-archive/2026-11-03-iteration-301.md), [iteration 300](docs/progress-archive/2026-11-03-iteration-300.md), [iteration 299](docs/progress-archive/2026-11-03-iteration-299.md), [iteration 298](docs/progress-archive/2026-11-03-iteration-298.md), [iteration 297](docs/progress-archive/2026-11-03-iteration-297.md), [iteration 296](docs/progress-archive/2026-11-03-iteration-296.md), [iteration 295](docs/progress-archive/2026-11-03-iteration-295.md), [iteration 294](docs/progress-archive/2026-11-03-iteration-294.md), [iteration 293](docs/progress-archive/2026-11-03-iteration-293.md), [iteration 292](docs/progress-archive/2026-11-03-iteration-292.md), [iteration 291](docs/progress-archive/2026-11-03-iteration-291.md), [iteration 290](docs/progress-archive/2026-11-03-iteration-290.md), [iteration 288](docs/progress-archive/2026-11-03-iteration-288.md), [iteration 285](docs/progress-archive/2026-11-03-iteration-285.md), [286](docs/progress-archive/2026-11-03-iteration-286.md).

Earlier entries: [iterations 269–270](docs/progress-archive/2026-11-03-iterations-269-270.md), [271–272](docs/progress-archive/2026-11-03-iterations-271-272.md), [273–274](docs/progress-archive/2026-11-03-iterations-273-274.md), [275–276](docs/progress-archive/2026-11-03-iterations-275-276.md), [277–278](docs/progress-archive/2026-11-03-iterations-277-278.md), [279–280](docs/progress-archive/2026-11-03-iterations-279-280.md), [282](docs/progress-archive/2026-11-03-iteration-282.md), [283](docs/progress-archive/2026-11-03-iteration-283.md), [284](docs/progress-archive/2026-11-03-iteration-284.md).

## 2026-11-03: iteration 326 — strict event-grouping benchmark

- Started clean on main; no leftover work. Four app services/health healthy, 32 sources without errors, available queues with no retained failed runs. Nov 3 15:00 UTC evidence remains pending.
- Prepared item 19's offline benchmark: 21 explicit agent-reviewed pairs reference existing real November 1 Tech/NBA/World recordings. Strict event identity differs from broader ranking coverage labels; each pair records its reason.
- Current lexical baseline: 1/11 true same-event merges, 0/10 false merges, precision 1/1 and recall 9.1%. Sole positive is syndication; no claim of general precision or independent reporting. Report lists missed paraphrases and titles.
- Added offline evaluation command and regression test; documented limits and next work in RANKING/TASKS. No production behavior/config changes, collection, paid calls or Reddit requests.
- Verification: targeted test, `pnpm format`, `pnpm lint:fix`, full `pnpm check` (192 unit/170 integration passed, typecheck/lint/format/boundaries), `pnpm build`, `git diff --check`.
- App/docs/db/health HTTP 200. No service restart: no runtime code/config changed (item 22). Next: default-off conservative grouping with the benchmark; scheduled evidence/acks take priority when available.

## 2026-11-03: iteration 327 — opt-in score-based game grouping

- Started clean on main; no leftover work. Four app services/health healthy, 32 sources without current errors; no failed digest runs. Two retained ingestion failures have recovered sources. Nov 3 scheduled evidence remains pending.
- Prepared an explicit matcher argument for complete-link clustering; production keeps its existing lexical default. Added NBA team-alias/full-score identity within 18 hours, rejecting ambiguous reports, previews, conflicting scores/outcomes and invalid timestamps.
- Offline recorded benchmark improves from 1/11 to 4/11 same-event merges, still 0/10 false merges (observed precision 4/4, recall 36.4%). Small agent-labeled single-date sample is not general precision evidence; no independence or ranking bonus claims.
- Fake-only adversarial tests cover gates and defaults. No production caller, collection, paid calls, Reddit requests or UI changes. Updated RANKING/TASKS; archived iterations 315–316 to bound PROGRESS.
- Verification: targeted tests, `pnpm format`, `pnpm lint:fix`, full `pnpm check` (194 unit/170 integration passed; typecheck/lint/format/boundaries), `pnpm build`, `git diff --check`. No handbook change: offline preparation changes no production flow.
- Restarted API/worker for the clustering signature change; all four services active, health database/Redis OK and app/docs/db HTTP 200. Live edition retains 20 stories/10 posts; all 32 sources healthy. Next: broaden recorded adversarial evidence before gated publication wiring; scheduled evidence/acks take priority.

## 2026-11-03: iteration 328 — conservative game score attribution

- Started clean on main; no leftover work. Four app services/health healthy, all 32 sources without current errors; no failed digest runs. Two retained ingestion failures have recovered sources. Nov 3 scheduled evidence remains pending.
- Hardened the default-off game matcher: explicit team-score pairs canonicalize loser-first reports; conflicting outcomes and the 18-hour bound override lexical overlap. Bare scores require clear winning wording, rejecting ambiguous/loss-first attribution.
- Added synthetic symmetric regressions for reversed score assignments, loser-first recaps, ambiguous/loss-first headlines and lexical time-bound bypass. Recorded benchmark remains 4/11 positives, 0/10 false merges; synthetic tests are not new live precision evidence.
- Updated RANKING/TASKS. No production caller, configuration change, paid calls, collection, Reddit requests or UI change. No handbook change: production flows remain unchanged.
- Verification: targeted tests (4 passed), `pnpm format`, `pnpm lint:fix`, full `pnpm check` (195 unit/170 integration passed) and `pnpm build`; `git diff --check`; app/docs/db/health HTTP 200. Live coverage: 334/116/285/227 articles and 57/27/9/3 verified X posts across Tech/NBA/Gaming/World; retained edition has 20 stories/10 posts.
- No restart under item 22: changed helper has no runtime caller. Next: broaden recorded dates/negative labels before gated publication wiring; scheduled evidence/acks take priority.

## 2026-11-03: iteration 329 — broader recorded event-grouping evidence

- Started clean on main; no leftover work. Four services/health healthy, all 32 sources without current errors, no retained failed digest jobs; scheduled evidence still due Nov 3 15:00 UTC.
- Recorded 51 selected stored NBA/Gaming feed candidates from November 2 via a read-only transaction; no publisher fetching. Added 34 explicit agent-reviewed pair labels, retaining provenance/timestamps and capped excerpts.
- Benchmark now covers 55 pairs/two dates: lexical 4/27 positives, opt-in 7/27, both 0/28 false merges. Gaming remains 0/8 positives; these selected labels are not independent/general precision evidence. Report now includes per-window counts.
- Added symmetric recorded regression coverage and updated prior benchmark assertions, TASKS and RANKING. Production grouping remains disabled; no configuration/UI/handbook/source changes, paid calls or Reddit requests.
- Verification: targeted grouping tests 5/5; recorded timestamp/URL checks; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (196 unit/170 integration passed), `pnpm build`, `git diff --check`. Initial full check found a stale benchmark-count assertion; corrected and reran successfully.
- App/docs/db/health HTTP 200; live edition retains 20 stories/10 posts, current sources succeeding. No service restart under STEERING 22: only offline evaluator/tests/fixtures/docs changed. Next: conservative paraphrase recall/independent labels; scheduled evidence and acks take priority.

## 2026-11-03: iteration 330 — evaluate full-window cluster membership

- Started clean on main; no leftover work. API/worker/docs/schema active, health database/Redis OK, all 32 sources without current errors and no retained failed jobs. Nov 3 scheduled evidence remains due at 15:00 UTC.
- Extended the offline grouping evaluator to run complete-link clustering over all recorded candidates, counting labeled correct/incorrect merges, missed positives and unreviewed merges with IDs/titles. Reversed input reports membership sensitivity; it does not prove arbitrary-order stability.
- Opt-in matcher produces ten merged pairs across five windows: seven labeled positives, three unreviewed, no labeled negative merges; reverse order agrees. Pairwise 7/7 precision does not validate all cluster merges. Gaming remains zero merges.
- Added synthetic regressions for complete-link overlap/order sensitivity, incorrect merges and unknown-label accounting; recorded regression pins current membership coverage. No production code/config/UI/handbook/source changes, paid calls or Reddit requests.
- Updated RANKING/TASKS, compacted task detail and archived iterations 317–318 to keep orientation bounded.
- Verification: targeted evaluator tests 4/4; `pnpm exec tsx scripts/evaluate-event-grouping.ts --game-scores`; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (198 unit/170 integration passed), `pnpm build`, `git diff --check`. Initial check caught archive formatting; fixed and reran successfully.
- App/docs/db/health HTTP 200; retained live edition has 20 stories/10 X posts. No restart under STEERING 22: only offline evaluation/tests/docs changed. Next: review three unlabelled merges and improve conservative paraphrase recall; scheduled evidence/acks take priority.

## 2026-11-03: iteration 331 — close observed cluster label gaps

- Started clean on main; no leftover work. Four services and health healthy, all 32 sources without current errors and no retained failed jobs. Nov 3 scheduled evidence remains due at 15:00 UTC.
- Reviewed three unknown full-window merges from recorded headlines/excerpts/timestamps: same Spurs–Timberwolves game and two syndicated investment-column pairs. Added explicit positive labels with attribution/independence limitations; no publisher requests.
- Benchmark now has 58 pairs: 30 positive/28 negative. Lexical 6/30 and opt-in 10/30 positives, both zero false merges; all ten observed cluster merges labeled positive in both input directions. Gaming remains zero merges; agent labels are not independent/general precision evidence.
- Updated regression expectations, RANKING and TASKS. No matcher, production config/UI/handbook/source changes, paid calls or Reddit requests. Syndicated duplicates must not be treated as independent reporting.
- Verification: targeted tests 7/7; both offline evaluator modes; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (198 unit/170 integration passed), `pnpm build`, `git diff --check`. Targeted test initially exposed stale baseline count; corrected before full check.
- App/docs/db/health HTTP 200; live edition retains 20 stories/10 posts. Rolling articles/X posts: Tech 338/62, NBA 118/32, Gaming 285/7, World 226/3. No restart under item 22: only fixtures/tests/docs changed.
- Next: conservative Gaming/paraphrase recall and independent labels before gated grouping wiring; scheduled evidence/acks take priority.

## 2026-11-03: iteration 332 — opt-in Gaming studio closure grouping

- Started clean on main; no leftover work. Four services/health healthy, all 32 sources without current errors; scheduled evidence remains due Nov 3 15:00 UTC.
- Added offline/default-unused studio-closure matcher composed with the prepared game matcher: explicit same proper studio name and closure assertion, bounded time; rejects uncertain/negated/reopening claims, multiple identities and multiword-name suffix collisions. No production caller or ranking/config changes.
- Reviewed two additional recorded Nagoshi closure pairs: 60 pairs, 32 positive/28 negative. Lexical 6/32, game-only 10/32, combined 13/32 positives (Gaming 3/10), zero labeled false merges. All 13 observed cluster merges labeled; reverse membership agrees. Selected agent labels do not establish general precision or outlet independence.
- Added synthetic boundary/adversarial and full-window recorded regressions; updated RANKING/TASKS and archived iteration 319 to keep PROGRESS bounded. No handbook/source changes, paid calls or Reddit requests.
- Verification: `pnpm exec tsx scripts/evaluate-event-grouping.ts --studio-closures`; `pnpm format`, `pnpm lint:fix`, `pnpm check` (200 unit/170 integration passed), `pnpm build`, `git diff --check`. Initial targeted checks caught stale fixture counts and title-case extraction; corrected before full check.
- App/docs/db/health HTTP 200; live retained edition still 20 stories/10 X posts across four topics. No restart under STEERING 22: matcher has no runtime caller. Next: broaden paraphrase/independent evidence before gated wiring; scheduled evidence and acks take priority.

## 2026-11-03: iteration 333 — reject ambiguous studio closure assertions

- Started clean on main; no leftover work. Four services/health healthy, active sources without current errors, queues available; Nov 3 scheduled evidence remains due at 15:00 UTC.
- Hardened the unused studio matcher against questions, conditional/attributed uncertainty, prospective and historical closure claims. Rejected named-studio claims cannot fall through to lexical matching, even for identical titles; explicit closure years are conservatively rejected while founding years remain allowed.
- Added symmetric synthetic regressions, including historical excerpt evidence. Recorded benchmark unchanged: 13/32 positives, zero labeled false merges; these agent labels still do not establish general precision or independence.
- Updated RANKING/TASKS and archived iteration 320 to keep PROGRESS bounded. No production caller/config/UI/handbook/source changes, paid calls or Reddit requests.
- Verification: targeted studio tests 3/3; offline `evaluate-event-grouping.ts --studio-closures`; `pnpm format`, `pnpm lint:fix`, `pnpm check` (201 unit/170 integration passed), `pnpm build`, `git diff --check`. Initial targeted failures exposed lexical fallthrough and overbroad excerpt guards; corrected before full verification.
- App/docs/db/health HTTP 200; retained edition has 20 stories/10 X posts. Rolling articles/X: Tech 331/60, NBA 116/31, Gaming 286/7, World 228/2. No restart under item 22: changed matcher has no runtime caller.
- Next: broader paraphrase/independent evidence before gated grouping wiring; scheduled evidence and acks take priority.

## 2026-11-03: iteration 334 — prepare opt-in ranked event grouping

- Started clean on main; no leftover work. Four services/health healthy, active sources without current errors. Two retained ingestion failures have recovered sources; no failed digest jobs. Nov 3 15:00 UTC evidence remains pending.
- Ranking accepts an explicit matcher while every production caller retains the lexical default. Prepared studio/game grouping runs after exclusions/score ordering and before slot limits; no production content, budget or ranking rule activated.
- Recorded Gaming ranking combines three Nagoshi reports into one slot with all coverage links and unchanged lead score. Synthetic regressions verify slot refill, stable leads, zero budget and exclusion of out-of-window/quality-rejected articles. First targeted run used an unsupported quality-rule example; corrected the fixture to the existing buying-guide rule.
- Updated TASKS/RANKING and archived iteration 321 to bound PROGRESS. No handbook/source behavior changes, paid calls or Reddit requests; independent merge evidence remains open.
- Verification: targeted tests 3/3; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (204 unit/170 integration passed), `pnpm build`, `git diff --check`.
- Restarted API/worker because runtime ranking code changed; four services active, health database/Redis OK, app/docs/db HTTP 200. Retained live edition remains 20 stories/10 X posts. New matcher has no production caller.
- Next: scheduled evidence/acks take priority when available; continue gated grouping integration and broader independent evidence without changing production edition behavior before the gate.

## 2026-11-03: iteration 335 — default-off edition event grouping

- Started clean on main; no leftover work. Four app services/health healthy, 32 sources without current errors; no failed digest jobs. Scheduled Nov 3 15:00 UTC evidence remains pending.
- Added exact `EDITION_EVENT_GROUPING_ENABLED=1` opt-in, captured once per edition and shared by fallback ranking and the AI shortlist. Unset/other values retain lexical matching; verified production API/worker are not opted in.
- Semantic eligibility and shortlist limits stay unchanged. Tests verify exact opt-in, baseline equivalence, coverage/lead score preservation and exclusion of unscored/semantically rejected articles. Initial targeted fixture omitted required policy arrays; corrected before verification.
- Updated RANKING/TASKS and the pipeline handbook; archived iteration 322 to bound PROGRESS. No source/schema/UI changes, paid calls or Reddit requests. Broader independently reviewed grouping evidence remains open.
- Verification: targeted tests 5/5; `pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline` passed; `pnpm format`, `pnpm lint:fix`, `pnpm check` (206 unit/170 integration), `pnpm build`, `git diff --check` passed.
- Restarted API/worker for runtime changes. All four services active; `/healthz` database/Redis OK, app/docs/db HTTP 200, queues available and sources without current errors. Retained real edition: 20 stories/10 X posts; grouping remains off.
- Next: scheduled evidence/acks take priority when available, then activate eligible social features; independent grouping evidence and opt-in end-to-end publication remain before activation.

## 2026-11-03: iteration 336 — verify persisted opt-in story grouping

- Started clean on main; no leftover work. Four services, health, sources and queues healthy; Nov 3 15:00 UTC evidence remains pending.
- Added disposable-Postgres publication tests for fallback and synthetic-AI editing using three recorded Gaming closure reports. Exact opt-in preserves all coverage links, lead and score; disabling restores baseline and readback preserves every immutable edition across flag changes.
- Initial tests exposed fixture setup mistakes (headline-only selection missed a report; topic seed omitted required guidance); corrected and targeted publication tests passed 4/4 before the full rerun.
- Updated TASKS/RANKING and archived iteration 323 to keep PROGRESS bounded. No runtime, source, schema or UI changes; no paid calls or Reddit requests. Independent labels and production activation remain open.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (206 unit/172 integration passed), `pnpm build`, `git diff --check`; targeted disposable publication suite 4/4.
- Health database/Redis OK; app/docs/db HTTP 200. Retained real edition: 20 stories/10 X posts. No restart under item 22 because only tests/docs changed; grouping remains off.
- Next: scheduled evidence/acks at 15:00 UTC take priority, then eligible social activation; broader independent grouping evidence remains required.

## 2026-11-03: iteration 337 — guard opt-in NBA lexical fallthrough

- Started clean on main; no leftover work. Four services/health healthy, 32 sources without current errors. Two retained ingestion failures have recovered sources; no failed digest jobs. Scheduled evidence remains pending.
- Found rejected game previews could fall back to lexical grouping. Opt-in matcher now refuses two-team preview, historical, conditional and negative titles before fallback; production lexical behavior stays unchanged.
- Seven synthetic pairs verify symmetry and separate slots despite identical titles; unrelated developer preview still uses lexical matching. Existing recorded benchmark remains green; no new independent labels or general quality claim.
- Updated TASKS/RANKING. No source/schema/UI changes, paid calls or Reddit requests; handbook behavior unchanged.
- Verification: targeted game suite 4/4; `pnpm format`, `pnpm lint:fix`, `pnpm check` (207 unit/172 integration), `pnpm build`, `git diff --check` passed.
- Restarted API/worker for runtime changes; all four services active, health database/Redis OK. Retained edition before restart: 20 stories/10 posts; app/docs/db HTTP 200. Grouping remains off.
- Next: Nov 3 scheduled evidence/acks take priority, then eligible social activation; broader grouping evidence remains open.

## 2026-11-03: iteration 338 — refuse ambiguous NBA score fallback

- Started clean on main; no leftover work. Four services/health healthy, sources without current errors, no failed digest jobs. Nov 3 15:00 UTC evidence remains pending.
- Opt-in game matching now rejects multiple, tied or implausible scores and unassignable winners before lexical fallback. Previously identical ambiguous recaps could merge; seven synthetic cases pin separate slots and symmetry, while scoreless lexical matching remains available.
- Updated TASKS/RANKING and archived iteration 324 to bound PROGRESS. No source/schema/UI changes, paid calls or Reddit requests; production grouping remains off and independent evidence remains open.
- Verification: targeted suite 5/5; `pnpm format`, `pnpm lint:fix`, `pnpm check` (208 unit/172 integration), `pnpm build`, `git diff --check`. First full check caught archive formatting added during the run; corrected with Prettier and full rerun passed.
- Restarted API/worker for runtime changes. All four services active, health database/Redis OK; app/docs/db HTTP 200. Retained real edition: 20 stories/10 X posts.
- Next: scheduled evidence/acks take priority when available, then eligible social activation; broader independently reviewed grouping evidence remains open.

## 2026-11-03: iteration 339 — preserve multiword studio identities

- Started clean on main; no leftover work. Services/health healthy, 32 sources without current errors, no failed digest jobs; Nov 3 scheduled evidence still pending.
- Default-off grouping now matches full multiword proper studio names, preserving suffix/prefix distinctions instead of rejecting all multiword names. Synthetic regressions cover matching title/excerpt identities, collisions, multiple closures and uncertainty/history.
- Initial targeted run caught a recorded title-case `As` connective regression; preserved the existing connective handling. Targeted suite then passed 4/4; recorded benchmark remains 13/32 positives and zero labeled false merges. No independent-label or real-world recall claim.
- Updated TASKS/RANKING; archived iteration 325 to bound PROGRESS. No source/schema/UI changes, paid calls or Reddit requests; production grouping remains off.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (209 unit/172 integration), `pnpm build`, `git diff --check` passed.
- API/worker restarted; all four services active, health database/Redis OK, app/docs/db HTTP 200. Retained real edition has four topics, 20 stories and 10 X posts.
- Next: scheduled evidence/acks take priority, then eligible social activation; independent grouping evidence remains open.
