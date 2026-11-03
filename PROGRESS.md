# Progress

Archived: [iterations 317–318](docs/progress-archive/2026-11-03-iterations-317-318.md), [iterations 315–316](docs/progress-archive/2026-11-03-iterations-315-316.md), [iterations 313–314](docs/progress-archive/2026-11-03-iterations-313-314.md), [iterations 311–312](docs/progress-archive/2026-11-03-iterations-311-312.md), [iterations 309–310](docs/progress-archive/2026-11-03-iterations-309-310.md), [iterations 307–308](docs/progress-archive/2026-11-03-iterations-307-308.md), [iterations 305–306](docs/progress-archive/2026-11-03-iterations-305-306.md), [iterations 303–304](docs/progress-archive/2026-11-03-iterations-303-304.md), [iteration 302](docs/progress-archive/2026-11-03-iteration-302.md), [iteration 301](docs/progress-archive/2026-11-03-iteration-301.md), [iteration 300](docs/progress-archive/2026-11-03-iteration-300.md), [iteration 299](docs/progress-archive/2026-11-03-iteration-299.md), [iteration 298](docs/progress-archive/2026-11-03-iteration-298.md), [iteration 297](docs/progress-archive/2026-11-03-iteration-297.md), [iteration 296](docs/progress-archive/2026-11-03-iteration-296.md), [iteration 295](docs/progress-archive/2026-11-03-iteration-295.md), [iteration 294](docs/progress-archive/2026-11-03-iteration-294.md), [iteration 293](docs/progress-archive/2026-11-03-iteration-293.md), [iteration 292](docs/progress-archive/2026-11-03-iteration-292.md), [iteration 291](docs/progress-archive/2026-11-03-iteration-291.md), [iteration 290](docs/progress-archive/2026-11-03-iteration-290.md), [iteration 288](docs/progress-archive/2026-11-03-iteration-288.md), [iteration 285](docs/progress-archive/2026-11-03-iteration-285.md), [286](docs/progress-archive/2026-11-03-iteration-286.md).

Earlier entries: [iterations 269–270](docs/progress-archive/2026-11-03-iterations-269-270.md), [271–272](docs/progress-archive/2026-11-03-iterations-271-272.md), [273–274](docs/progress-archive/2026-11-03-iterations-273-274.md), [275–276](docs/progress-archive/2026-11-03-iterations-275-276.md), [277–278](docs/progress-archive/2026-11-03-iterations-277-278.md), [279–280](docs/progress-archive/2026-11-03-iterations-279-280.md), [282](docs/progress-archive/2026-11-03-iteration-282.md), [283](docs/progress-archive/2026-11-03-iteration-283.md), [284](docs/progress-archive/2026-11-03-iteration-284.md).

## 2026-11-03: iteration 319 — isolated Bluesky observation persistence

- Started clean on main; no leftover work. API/worker/docs/schema services healthy, 32 sources without current errors, no failed digest jobs; two retained ingestion failures remain recovered. Nov 3 15:00 UTC scheduled evidence pending.
- Added Bluesky storage port and PostgreSQL adapter, additive migration 049: platform-specific SocialPost identity/metadata and immutable per-topic text/media/metrics snapshots. Out-of-order arrivals cannot replace newer current metadata; replay cannot rewrite snapshots.
- Reads enforce publication window, observation cutoff, topic isolation and enabled status. Topic deletion cascades observations; complete write batches roll back on invalid identity or metrics. No worker/scheduler/edition caller, keeping production inclusion off under item 23.
- Two disposable-Postgres tests cover media round-trip, replay, out-of-order snapshots, cutoff/window boundaries, topic isolation, rollback and disable/delete. No live collection, paid calls or Reddit requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (174 unit/170 integration tests, typecheck/lint/format/boundaries), `pnpm build`, `pnpm migrate` (049 applied), `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` (16 pages, 1 unchanged diagram, 25 assigned tables, no errors), `git diff --check`.
- Updated source evidence, social handbook and schema metadata; archived iterations 301–302 to bound progress. Health OK and app/docs/db HTTP 200. No restart: no running service path/config changed (item 22); schema change is additive and storage has no production caller.
- Initial push rejected because owner added item 24/observability plan remotely; fetched and merged without rewriting history. Recorded its low priority in TASKS; no observability implementation.
- Next: explicit bounded Bluesky collection, semantic selection and faithful cards, keeping edition inclusion off until scheduled evidence/acks. Scheduled results take priority when available.

## 2026-11-03: iteration 320 — explicit bounded Bluesky collection

- Started clean on main; no leftover work. Four services and health healthy; 32 sources without current errors, staffed queues and no retained failed digest runs. Nov 3 15:00 UTC evidence remains pending; reserve 482,788 micros, other Anthropic allowance zero.
- Added single-query collection through search/storage ports: 24-hour maximum window, 50-observation cap, latest duplicate snapshot, publication/observation/metrics validation and propagated search/storage failures. No retries, scheduler or edition caller.
- Probe remains read-only by default; explicit `--store` shares session/backoff across four topic queries, persists observations and reads them back. Reports fetched/submitted separately from stored window observations; replay/disabled writes need not insert rows. Closes DB connections on failure.
- Live free-API `pnpm exec tsx scripts/probe-bluesky.ts --store` at 03:44 UTC: Tech/AI/NBA/Gaming/World stored observations 48/48/47/46; phrase shortlists 5/5/5/0. Unreviewed discovery only, not editorial picks or verified virality. No paid calls or Reddit requests; production inclusion stays off.
- Three fake-only collector tests pass for bounded writes, duplicate/invalid snapshots, invalid requests without I/O and propagated search/rollback failures. Updated source evidence, handbook and TASKS; archived iterations 303–304 to bound progress.
- Verification: targeted `pnpm exec tsx --test apps/api/test/bluesky-collection.test.ts` (3 passed), `pnpm format`, `pnpm lint:fix`, full `pnpm check` (177 unit/170 integration passed), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` (16 pages, 1 unchanged diagram, 25 tables, no errors), `git diff --check`. Initial full check caught archive/source formatting; corrected before rerun.
- App/docs/db HTTP 200; health database/Redis OK. No restart: changed application helper has no running caller; script is explicit and handbook reads disk (item 22). No UI changes.
- Next: Bluesky semantic selection and faithful cards, keeping production inclusion off until scheduled evidence/acks. Scheduled results take priority when available.

## 2026-11-03: iteration 321 — isolated Bluesky semantic shortlist

- Started clean on main; no leftover work. Four services/health healthy, all 32 sources without current errors and no retained failed digest runs; two retained ingestion failures remain recovered. Scheduled Nov 3 15:00 UTC evidence still pending.
- Added bounded semantic preparation using the existing injected budgeted social triage: up to 50 safe observations, relevance/interestingness thresholds, then semantic scores and observed engagement/age ordering. Positive keywords are not required; original post snapshots remain intact.
- Shares snapshot/window/count/safety gates with phrase ranking. Incomplete, duplicate, unknown or invalid scores yield no semantic picks. Zero budgets/empty eligible inputs skip triage. No scheduler, final editor, publication caller or production behavior change.
- Three fake-only tests cover keyword recovery, popular irrelevant rejection, safety filtering, incomplete/malformed responses, candidate bounds and no-I/O cases; existing ranking tests still pass. No paid calls, new live collection or Reddit requests.
- Updated TASKS, source evidence and handbook; archived iterations 305–306 to bound progress. Final editor/cards and real editorial yield remain next; stored observations remain unreviewed.
- Verification: targeted shortlist/ranking tests (6 passed); `pnpm format`, `pnpm lint:fix`, `pnpm check` (180 unit/170 integration passed, typecheck/lint/format/boundaries), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` (16 pages, 1 unchanged diagram, 25 assigned tables), `git diff --check`.
- App/docs/db HTTP 200; health database/Redis OK. No restart: changed helpers have no production caller and handbook reads disk (item 22). No UI changes or screenshots required. Next: final Bluesky editor/cards; scheduled evidence/acks take priority when available.

## 2026-11-03: iteration 322 — isolated Bluesky final editing

- Started clean on main; no leftover work. Four services/health healthy; 32 sources without current errors and no failed digest runs. Scheduled Nov 3 15:00 UTC evidence remains pending; reserve 482,788 micros, other Anthropic allowance zero.
- Added explicit Bluesky final selection after semantic triage: at most ten candidates, budget 0–20, fewer picks allowed, exact original text/media/count snapshots retained alongside context/rationale. Refused, unknown, duplicate or over-budget selections return no picks.
- Bluesky uses isolated observation instructions and `bluesky-social-editor-v1` ledger purpose. Existing X/Reddit prompt and purpose remain unchanged. No scheduler/publication caller; production inclusion remains off under item 23.
- Fake-only tests cover candidate limits, snapshot preservation, invalid/refused responses, zero-budget no-I/O and prompt/purpose isolation. No paid calls, live collection or Reddit requests. No UI change.
- Verification: targeted editor tests (8 passed), `pnpm format`, `pnpm lint:fix`, `pnpm check` (184 unit/170 integration passed, typecheck/lint/format/boundaries), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` (16 pages, 1 unchanged diagram, 25 tables), `git diff --check`.
- Updated source evidence, handbook and TASKS; archived iterations 307–308 to bound progress. Restarted API/worker for shared editor code; four services active, health OK and app/docs/db HTTP 200.
- Next: faithful Bluesky cards, keeping production inclusion off until scheduled evidence/acks. Scheduled results take priority when available.

## 2026-11-03: iteration 323 — faithful Bluesky cards prepared

- Started clean on main; no leftover work. Four services/health healthy; 32 sources without current errors, staffed queues and no failed digest runs. Nov 3 15:00 UTC scheduled evidence remains pending.
- Added discriminated Bluesky snapshot contract and faithful cards: full original text, author/time, saved likes/reposts/replies and observation time, context/rationale, lazy images with alt text/full-size links and video links with optional previews. No streaming player or widget script.
- Production candidate collection and edition inclusion remain off under item 23; existing X/Reddit behavior unchanged. No paid calls, new collection or Reddit requests.
- Synthetic `pnpm exec tsx scripts/smoke-bluesky-cards.ts` passed desktop/mobile: image/text-only cards, video without preview, metrics/original links, literal markup, invalid media/timestamps, no widget calls, page errors or horizontal overflow. Saved and visually inspected both screenshots; these are not real editorial picks.
- Updated TASKS, source evidence and handbook; archived iterations 309–310 to bound progress. Next: prepare gated Bluesky edition wiring; scheduled evidence/acks take priority when available.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (184 unit/170 integration passed, typecheck/lint/format/boundaries), `pnpm build`, handbook check (16 pages, 1 unchanged diagram, 25 tables), `git diff --check`. Initial check caught a late contract formatting edit; corrected before the successful full rerun.
- Restarted API/worker for contract/editor types and rebuilt web; four services active, health database/Redis OK, app/docs/db HTTP 200. Live edition still has 20 stories and 10 X posts, zero Bluesky posts.

## 2026-11-03: iteration 324 — default-off Bluesky edition preparation

- Started clean on main; no leftover work. Four app services/health healthy, all 32 sources without current errors, no failed digest runs; Nov 3 15:00 UTC evidence remains pending.
- Added explicit edition preparation over stored observations at the window cutoff, isolated semantic/final editing and validated immutable snapshots. Gate defaults off with no production caller; existing picks remain and Bluesky uses only unused topic slots.
- Disabled/full selections do no storage or AI work; malformed URLs/media are excluded before triage. Refused/incomplete editing adds no posts. Five fake-only tests cover gates, bounds, X preservation, snapshot independence and failure paths.
- No paid calls, collection or Reddit requests. No UI change. Live edition retains 20 stories/10 X posts and zero Bluesky posts; production inclusion remains off under item 23.
- Updated TASKS, source evidence and handbook; archived iterations 311–312 to bound PROGRESS. Next: production caller behind a default-off flag, then activation only after scheduled evidence/acks.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (189 unit/170 integration passed, typecheck/lint/format/boundaries), `pnpm build`, handbook check (16 pages, 1 unchanged diagram, 25 assigned tables), `git diff --check`. First check caught archive formatting; corrected before full rerun.
- App/docs/db HTTP 200 and health database/Redis OK. No service restart: new helper has no runtime caller; item 22 avoids unnecessary restarts. No screenshots required.

## 2026-11-03: iteration 325 — gated Bluesky publication caller

- Started clean on main; no leftover work. Four app services/health healthy, all 32 sources without current errors; no failed digest jobs. Nov 3 scheduled reserve remains pending, other Anthropic allowance zero. Two retained ingestion failures have no current source errors.
- Wired stored Bluesky observations after X/Reddit selection through the publisher's transaction and existing budgeted AI services. Only exact `BLUESKY_EDITIONS_ENABLED=1` enables inclusion; API/worker opt-in verified absent. No collection or paid calls.
- Existing picks and topic budgets remain intact; disabled/full selections and missing AI services do no Bluesky reads or calls. Separate Bluesky editing is identified in the published selection explanation when additions exist.
- Fake caller tests cover exact opt-in, disabled no-I/O, absent AI services, transaction/window/cutoff forwarding and X preservation. No UI change or new screenshots; real Bluesky editorial yield still awaits activation.
- Updated TASKS, source evidence and handbook; archived iterations 313–314 to bound progress. Next: activate only after the Nov 3 scheduled evidence/acks; otherwise proceed to default-off story grouping under item 19.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (191 unit/170 integration passed; typecheck/lint/format/boundaries), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` (16 pages, one unchanged diagram, 25 tables), `git diff --check`. Initial check/build caught nullable AI services; fixed and full verification rerun passed.
- Live checks: source success at 04:12 UTC, 2,096 stored items, current edition 20 stories/10 X posts; scheduled reserve intact. API/worker restarted for caller/shared reader changes; four app services active and app/docs/db/health healthy.

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
