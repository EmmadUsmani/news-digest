## 2026-11-04: iteration 665 — preserve bulk reads through triage evidence

- Started clean on main; no leftover work. Zero alerts; healthz/database/Redis healthy, all 36 active sources successful/nonempty without current errors.
- Fixed incremental scoring evidence wrapper dropping the optional bulk-cache capability from iteration 664; receiver-bound pass-through preserves failures and single-key compatibility.
- Cold/warm/changed-input scoring now verifies three bulk reads; warm hits produce no work evidence. Regression also covers receiver binding, missing keys, read failure and single-key adapters.
- Incremental triage stays disabled; no paid calls, activation, model/budget changes or claimed live speed improvement.
- Updated TASKS/RANKING; archived iteration 649 to keep PROGRESS bounded. Internal cache forwarding only; no handbook/schema/SOURCES changes needed.
- Verification: targeted tests 16/16; pnpm format, pnpm lint:fix, pnpm check (405 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker; both active, healthz healthy, zero alerts; saved edition remains four topics/14 stories/15 posts.
- Next: Nov 5 grouping/cost/latency/screenshots, NBA full-AI acceptance and World posts; background triage remains off.

## 2026-11-04: iteration 666 — atomic triage cache writes

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis and 36 nonempty successful sources without current errors.
- Article/social triage now persists each validated batch in one atomic insert-only query instead of up to 50 sequential writes; optional single-key adapters remain compatible.
- Existing cache values, fingerprints, prompts, score validation, budgets and models unchanged. Failed batches remain retryable; sibling writes drain before errors return.
- Incremental evidence forwards bulk writes with the ledger receiver and records only committed article work; duplicate guards recover after failed batches. Incremental triage stays off.
- Synthetic tests cover original IDs, warm reuse, retries, sibling draining and evidence; isolated PostgreSQL covers conflicts, duplicate keys, empty input and whole-batch rollback.
- Updated TASKS/RANKING; archived iteration 650 to keep PROGRESS bounded. Internal persistence only; no source/schema/UI/system-flow changes requiring handbook/SOURCES edits.
- Verification: targeted tests 25/25; pnpm format, pnpm lint:fix, pnpm check (407 unit/207 isolated integration), pnpm build and git diff --check passed. No paid calls or claimed live speed improvement.
- Restarted API/worker; both active, healthz healthy, zero alerts/failed services. Saved edition remains four topics/14 stories/15 posts; all 36 sources successful/nonempty, zero errors.
- Next: Nov 5 grouping/cost/latency/screenshots, NBA full-AI acceptance and World posts; background triage stays disabled.

## 2026-11-04: iteration 667 — linear triage batch sizing

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis and 36 nonempty successful sources without current errors.
- Replaced repeated full-prompt serialization while packing triage batches with exact UTF-8 item/framing/comma accounting; batch-local indices reset on splits.
- Preserves article/social prompts, 50-item/60,000-byte boundaries, fingerprints, provider requests, models and budgets. Incremental triage stays off; no paid calls or measured live latency improvement.
- Differential synthetic regression compares every actual prompt against the former full-serialization algorithm for 200 short and Unicode/escaped long candidates in both modes.
- Updated TASKS/RANKING; archived iteration 651 to keep PROGRESS bounded. Internal batch preparation only; no handbook/schema/SOURCES changes needed.
- Verification: targeted tests 28/28; pnpm format, pnpm lint:fix, pnpm check (408 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker: both active, healthz healthy, zero alerts; saved edition four topics/14 stories/15 posts; all 36 sources nonempty with zero errors.
- Next: Nov 5 grouping admission/cost/accuracy/latency/screenshots, NBA full-AI acceptance and World posts; background triage remains disabled.

## 2026-11-04: iteration 668 — repair invalid social selections

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, all 36 sources successful/nonempty with no current errors.
- Nov 4 journal fingerprint links a Bluesky Sonnet request to initial+repair validator-error failures; social code narrows these to unknown IDs, duplicates or excess picks. Rejected output/topic/precise violation remain unknown.
- Those checks now emit invalid-social-selection and fixed application-owned repair guidance for candidate IDs, aliases, uniqueness, budget and optional empty picks; no rejected text/IDs enter feedback.
- Initial prompts/cache keys, support checks, budgets/models/output limits and one repair per model unchanged. No paid calls or measured live latency improvement.
- Fake X/Bluesky tests cover each violation recovering on repair, warm cache reuse and the unchanged four-call maximum. Targeted social/story/LLM tests 46/46 passed.
- Updated RANKING and compacted TASKS below 8 KB; archived iteration 652 to keep PROGRESS bounded. Internal repair change needs no handbook/schema/SOURCES update.
- Verification: pnpm format, pnpm lint:fix, pnpm check (409 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker active; healthz healthy, zero alerts, four available queues and 36 nonempty sources without errors. Saved edition remains four topics/14 stories/15 posts.
- Next: Nov 5 grouping/cost/accuracy/latency/screenshots, NBA full-AI acceptance, World posts and Bluesky repair tail. Incremental triage remains off.

## 2026-11-04: iteration 669 — reuse triage fingerprint context

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- Article/social triage now serializes and hashes shared instructions/model/topic once per pool, copying hash state for each candidate.
- Existing JSON bytes/cache keys, prompts, models, budgets and candidate coverage unchanged; incremental triage remains off.
- Differential synthetic regression covers 200 escaped/Unicode/truncated candidates per mode, reverse-order probes and warm scoring without new calls.
- Local synthetic 60,000-fingerprint benchmark: legacy 1,718 ms, shared context 536 ms. CPU preparation only; no measured live edition speed improvement or paid calls.
- Updated TASKS/RANKING; internal optimization needs no handbook/schema/SOURCES changes.
- Verification: targeted triage 23/23; pnpm format, pnpm lint:fix, pnpm check (410 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker active; healthz healthy, zero alerts, all 36 sources without current errors. Saved edition remains four topics/14 stories/15 posts.
- Next: Nov 5 grouping admission/accuracy/cost/latency/screenshots, NBA full-AI outcome, World posts and Bluesky repair tail.

## 2026-11-04: iteration 670 — replay recorded token work before latency tuning

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis and all 36 sources nonempty without current errors.
- Added offline call-usage evaluator and allowlisted Nov 4 metadata for all 43 Anthropic calls; no prompts, response text, secrets, database access or paid calls.
- Groups by purpose/model, separates cache input, retains failed time, counts unknown usage explicitly and rejects invalid/overflowing totals. HTTP token ratios are not decode throughput or predicted speedups.
- Nov 4: triage emitted 89,087/115,032 output tokens (77.4%) and used 326,931/506,615 aggregate HTTP ms (64.5%); zero output-limit stops. Measure actual event/rationale lengths before changing batches; compare Nov 5's changed pipeline.
- Updated TASKS and concurrency review; archived iteration 653 to keep PROGRESS bounded. No runtime/handbook/schema/SOURCES changes; incremental triage remains off.
- Verification: targeted replay 3/3; pnpm format, pnpm lint:fix, pnpm check (413 unit/207 isolated integration), pnpm build and git diff --check passed. First check found archive formatting; corrected and reran successfully.
- Live saved edition remains four topics/14 stories/15 posts. Services unchanged and healthy, so no restart under STEERING 22.
- Next: Nov 5 grouping admission/accuracy/cost/latency/screenshots, NBA full-AI acceptance and World posts; offline response-length measurement if still waiting.

## 2026-11-04: iteration 671 — measure cached triage field lengths

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- Added read-only aggregate triage-length report: parameterized half-open cache creation window, read-only transaction, 15-second query timeout; no text/IDs or paid calls.
- Nov 4 15:00–15:03 UTC cache sample: 689 article/227 social scores, all event/rationale strings. Article p95 46/58 characters; social 43/53; no prompt-guidance or schema-limit overruns.
- Successful cached fields are already short; do not infer token shares or speedups, or tighten limits from this sample. Reused cache entries, failed attempts and repairs are absent; exact edition membership is not established.
- Updated TASKS/concurrency evidence; archived iteration 654 to keep PROGRESS bounded. No runtime/handbook/schema/SOURCES changes; incremental triage stays off.
- Verification: real read-only sample, empty future window and invalid timestamp rejection; pnpm format, pnpm lint:fix, pnpm check (413 unit/207 isolated integration), pnpm build and git diff --check passed.
- API/worker active, healthz healthy, zero alerts, 36 nonempty sources without errors and four available queues. No restart under STEERING 22: runtime/config unchanged.
- Next: Nov 5 grouping admission/accuracy/cost/latency/screenshots, NBA full-AI acceptance, World posts and Bluesky repairs.

## 2026-11-04: iteration 672 — explain triage coverage repairs

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- Article/social missing, duplicate, extra and original-ID score arrays now emit a fixed coverage diagnostic and specific single-repair guidance; no rejected text/IDs enter feedback.
- Initial prompts, cache identity, candidate coverage, models, budgets and concurrency unchanged. Schema-invalid scores still fail closed; no paid calls or measured live speedup.
- Fake-provider regression covers eight defect/kind cases, corrected original-ID mapping and warm-cache reuse; targeted triage 24/24 passed. Fixed harness parsing so transport repairs actually reach its fake provider.
- Updated TASKS/RANKING; archived iteration 655 to keep PROGRESS bounded. No handbook/schema/SOURCES changes needed for this internal repair.
- Verification: pnpm format, pnpm lint:fix, pnpm check (414 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker active; initial immediate probe preceded listener startup, retry healthy with database/Redis. Zero alerts, 36 nonempty sources without errors; saved edition remains four topics/14 stories/15 posts.
- Next: Nov 5 grouping admission/accuracy/cost/latency/screenshots, NBA full-AI outcome, World posts and Bluesky repair tail.

## 2026-11-04: iteration 673 — extend offline batching to social pools

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- Offline batching now accepts validated local article/social inputs with supplied topic context; invokes the real kind-specific triage prompt, purpose and cache namespace. Existing recorded article mode preserved.
- Reports aggregate shape only; synthetic provider/cache stay in process, with no database/environment/provider dependency or paid calls. Invalid input exits with a bounded diagnostic.
- Synthetic 101-post social probe: caller sizes 10/25/50/200 produced 11/5/3/3 requests; 50/200 share bytes but have sequential `[1,1,1]` versus concurrent-capable `[3]` barriers. No live latency/quality/cost claim or production change.
- Targeted `pnpm exec tsx --test apps/api/test/triage-batching.test.ts`: 7/7; default CLI: 36 article rows, zero repeat requests; supplied social CLI and missing-file rejection checked.
- Updated TASKS/RANKING; archived iteration 656 to keep PROGRESS bounded. No affected handbook/source/schema behavior.
- Verification: pnpm format, pnpm lint:fix, pnpm check (415 unit/207 isolated integration), pnpm build and git diff --check passed. Live: API/worker active, 36 sources/zero current errors, four-topic saved edition, zero alerts.
- Runtime/config unchanged: no restart under STEERING 22. Push initially rejected by new owner commits; fetched and merged docs-only changes without rewriting history.
- Read new STEERING 30 and plan opening; added X search redesign as next product priority. Full plan still needs reading before implementation; production/experiment budgets remain separate.
- Next: STEERING 30 X search plan; Nov 5 grouping/NBA checks take priority when available.

## 2026-11-04: iteration 674 — persist actual X search execution traces

- Started clean on main; no leftover work. Zero alerts; healthy healthz/database/Redis, 36 nonempty sources without current errors and four available queues.
- Read STEERING 30 and full X search plan; completed its tool-call instrumentation slice. Store exact provider-reported custom-tool function/input pairs atomically with settlement cost, including responses with unusable citations. Never infer queries from prompts/prose.
- Added nullable JSONB migration 056, Drizzle schema/baseline, schema metadata and Social posts handbook description. Nine historical calls remain NULL; per-topic threshold settings and experiments remain next.
- Synthetic protocol tests cover keyword/semantic calls, exact query/sort input, malformed/missing tool calls, empty citations, orchestration forwarding and isolated ledger persistence. No paid calls or production search/schedule/model/budget changes.
- Verification: pnpm format, pnpm lint:fix, pnpm check (415 unit/208 isolated integration), pnpm build, git diff --check and social-posts handbook check passed.
- Saved private mode-600 pg_dump outside repo; pg_restore listing readable. Applied pnpm migrate; owner_ro SELECT/owner_rw UPDATE privileges remain valid for the new column.
- Restarted API/worker active; healthz healthy, zero alerts, 36 nonempty sources without errors and four available queues. Updated TASKS; archived iteration 657. SOURCES unchanged: no source behavior change.
- Next: per-topic X thresholds/exclusions, then separately capped two-day comparison under the approved plan. Nov 5 grouping/NBA checks retain priority.

## 2026-11-04: iteration 675 — store approved per-topic X search settings

- Started clean on main; no leftover work. Zero alerts, healthy healthz and 36 current sources; saved edition has four topics/14 stories/15 posts.
- Added migration 057 and Drizzle schema/baseline for per-topic reaction/trending like thresholds and exclusions. Seeded only surviving original topics with approved values; NBA has four betting exclusions. Topic deletion cascades; missing settings return null.
- Database regression checks all four seed values, missing configuration, nonnegative checks, explicit empty exclusions and deletion cleanup. Initial full checks exposed Drizzle CLI drift for equivalent empty-array defaults; removed the default in favor of explicit lists.
- Updated TASKS, schema metadata and Social posts handbook; archived iteration 658. No source behavior change, paid calls, model/provider/cap/schedule change or production search activation; SOURCES unchanged.
- Verification: pnpm format, pnpm lint:fix, final pnpm check (415 unit/209 isolated integration), pnpm build and git diff --check passed; zero CLI/catalog/baseline schema drift. Handbook check passed (26 assigned tables, no warnings).
- Saved private mode-600 pg_dump outside repo and verified pg_restore listing. Applied pnpm migrate; four settings rows and owner_ro SELECT/owner_rw UPDATE grants verified. Restarted API/worker active; healthz/database/Redis healthy, zero alerts, 36 current sources and unchanged four-topic/14-story/15-post saved edition.
- Next: separately capped two-day X comparison under the approved plan; Nov 5 grouping/NBA checks retain priority.

## 2026-11-04: iteration 676 — prepare fixed-filter X comparison requests

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 healthy sources and no failed digest jobs; next edition scheduled Nov 5 15:00 UTC.
- Added offline-only comparison request builder: exact current baseline plus A/B requests using Top sort, fixed reply/retweet/language filters, supplied database thresholds/exclusions and two–three supplied ranked story titles joined with OR.
- Preserves tool dates/exact publication window, disables media understanding, requests eight results with max_turns 2 and rejects unsafe exclusions/invalid thresholds/missing reaction context before calls. Does not select stories or execute requests.
- Four synthetic tests cover baseline equivalence, filters/thresholds, invalid inputs and exact windows. No claim operators work through the live tool; that remains an experiment measurement.
- Verification: targeted tests 4/4, pnpm format, pnpm lint:fix, pnpm check (419 unit/209 isolated integration), pnpm build and git diff --check passed. Initial lint failure for missing void test markers corrected before final checks.
- Updated TASKS; archived iteration 659. No source/UI/schema/handbook behavior changes, paid calls or production schedule/model/budget changes. No service restart under STEERING 22: new helper is not imported by running services.
- Next: separately capped experiment runner/admission and results reporting, then two-day same-window comparison under STEERING 30. Nov 5 grouping/NBA checks retain priority.

## 2026-11-04: iteration 677 — durable X experiment admission

- Started clean on main; no leftover work. Zero alerts; healthz/database/Redis healthy, 36 nonempty sources with no current errors, no failed digest jobs and Nov 5 15:00 UTC next scheduled edition. Two retained ingestion failures have no current source errors.
- Added standalone private-file experiment journal with exclusive locking, fsync/atomic updates, $1 UTC-day/$2.50 lifetime admission and 13:00–16:00 UTC blackout. Unique request reservations survive restart; unknown outcomes never auto-release.
- Known usage settles once; provider overruns are recorded and stop future admissions. Locked/stale or malformed journals fail closed without overwriting evidence. No paid calls or production search, schedule, model, provider or budget changes.
- Four offline tests cover UTC boundaries/invalid amounts, persisted daily/lifetime holds, settlement/headroom/overrun stop, duplicate requests and damaged/locked journals. Targeted 4/4 and explicit helper/test TypeScript check passed.
- Updated TASKS and added docs/x-search-experiment.md for runner requirements; archived iterations 660–661. SOURCES/handbook unchanged: helper is not connected to any production flow.
- Verification: pnpm format, pnpm lint:fix, pnpm check (423 unit/209 isolated integration), pnpm build and git diff --check passed.
- No service restart under STEERING 22: running services do not import this standalone helper.
- Next: wire one fixed external journal path, justify provider per-call reservation bound, add runner/evidence reporting and perform approved two-day comparison. Admission alone cannot bound a provider response. Nov 5 grouping/NBA checks retain priority.

## 2026-11-04: iteration 678 — offline X experiment evidence report

- Started clean on main; no leftover work. Healthz/database/Redis healthy, zero alerts, 36 nonempty sources with no current errors and no failed digest jobs. Next scheduled edition remains Nov 5 15:00 UTC.
- Added offline per-call comparison report preserving topic/model/style/window and actual tool inputs. Measures fetched/returned counts, reported like median/max, exact-window and relevance ≥6 shares, promotions and qualifying non-promotional posts per dollar.
- Unknown timestamps, triage scores and promotion reviews remain explicit and suppress complete yield; missing likes stay separate. Duplicate request/post evidence is rejected. Three synthetic tests cover boundaries, metrics, unknowns, empty/free calls and invalid evidence; no live-result or winner claim.
- Checked official X Search docs: max_turns reduces rounds, not fetched-post count; repeated/parent/quoted/thread posts and profiles count. Prompt result counts do not justify a hard per-call reservation. Paid dispatch remains unwired; no paid calls, production/model/provider/schedule/budget changes.
- Updated TASKS and experiment requirements; archived iteration 662; SOURCES/handbook/NEEDS_FROM_HUMAN unchanged because production behavior and owner access requirements are unchanged.
- Verification: targeted tests 3/3, standalone helper TypeScript check, pnpm format, pnpm lint:fix, pnpm check (426 unit/209 isolated integration), pnpm build and git diff --check passed. Final healthz healthy and zero alerts.
- No restart under STEERING 22: running services do not import the new offline report. Next: establish provider-enforced cost bound, wire fixed-path runner/evidence capture and complete approved two-day comparison; Nov 5 grouping/NBA checks retain priority.

## 2026-11-04: iteration 679 — X experiment execution diagnostics and dispatch blocker

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 healthy nonempty sources and no failed digest jobs; Nov 5 15:00 UTC remains next scheduled edition. Retained ingestion/social failures coexist with successful current collection.
- Offline report now checks actual adapter tool inputs for keyword search, Top, exact threshold, filters, exclusions and story OR. Missing/unreadable evidence stays unknown; quoted operators do not count. Reports below-threshold returned likes and missing likes separately; does not claim X honored operators.
- Six synthetic report tests pass, including multiple calls, conflicts, quotes, malformed/missing inputs and threshold contradictions. No paid calls or production discovery/model/provider/schedule/budget changes.
- Official Responses docs exclude reasoning/function tokens from max_output_tokens; billing docs say postpaid limits do not cap prepaid usage. No documented hard per-call bound found. Reported dispatch blocker in NEEDS_FROM_HUMAN rather than extending preparation indefinitely or changing billing.
- Updated experiment requirements/TASKS, compacted completed speed notes and archived iterations 663–664. SOURCES/handbook unchanged: no source or running-system behavior change.
- Verification: targeted tests 6/6, standalone report/test TypeScript check, pnpm format, pnpm lint:fix, pnpm check (429 unit/209 isolated integration), pnpm build and git diff --check passed. Initial check stopped on new archive formatting; corrected before passing full check.
- Final healthz healthy and zero alerts. No restart under STEERING 22: running services do not import the offline report.
- Next: Nov 5 grouping/NBA/cost/latency/screenshots take priority when available. Paid experiment requires a supported cost bound or owner decision; otherwise continue independent offline speed/replay work, not repeated provider-bound audits.
