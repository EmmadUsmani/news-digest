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

## 2026-11-04: iteration 680 — offline batch fill and warm social dispatch

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 sources without current errors and no failed retained digest jobs. Next edition Nov 5 15:00 UTC.
- Offline batching evaluator now reports actual per-pass request item counts, full/partial batch fill and overlapping fake calls through the real worker loop. Supplied article/social pools accept validated warm IDs; preparation stays separately counted.
- Recorded Nov 1 article cold pools at caller size 200: NBA 52 items → 50/2 (peak two fake calls), World 47 → 47 (peak one), Tech 54 → 50/4 (peak two). No live latency or quality claim.
- Synthetic 200-post social pool, alternating half warm: size-50 passes produce four sequential 25-item calls; size-200 pass produces two concurrent 50-item calls. All pending/prepared items preserved; repeat pass and fully warm pools issue zero calls.
- Added regression coverage for dispatch/fill, warm social fragmentation, empty/warm inputs and invalid warm IDs. Updated TASKS and concurrency evidence; SOURCES/handbook unchanged because no running-system/source behavior changed.
- Verification: targeted tsx triage-batching tests 8/8; standalone tsc --strict check passed (initial ad-hoc command omitted strict mode; corrected). pnpm format, pnpm lint:fix, pnpm check (430 unit/209 isolated integration), pnpm build and git diff --check passed. Archived iterations 665–666 to keep this file small.
- No paid calls or production code/config changes; no restart under STEERING 22. X experiment remains blocked on a supported cost bound or owner decision. Next: prioritize Nov 5 grouping/NBA/cost/latency/screenshots; compare actual batching before production tuning.

## 2026-11-04: iteration 681 — offline topic context and byte pressure

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 nonempty sources without current errors, no failed retained digest jobs; next edition Nov 5 15:00 UTC.
- Offline batching report separates serialized topic bytes from framing and reports maximum conservative wire input plus the real splitter's 2,048-byte allowance. No production changes or paid calls.
- Synthetic 50-post Unicode pool: empty context yields five 10-item calls/281,035 input bytes; long clipped context yields six 8-item calls plus two items/368,053 bytes. Repeated topic bytes 310 vs 84,434; both remain under 60,000 conservative bytes per call. No live speed/cost claim or guidance change.
- Regression covers real splitting, clipped context, UTF-8 accounting, complete scoring/cache reuse and empty pools. Updated TASKS and concurrency evidence; SOURCES/handbook unchanged because running-system/source behavior is unchanged.
- Verification: targeted tsx batching tests 9/9 and standalone strict tsc passed. pnpm format, pnpm lint:fix, pnpm check (431 unit/209 isolated integration), pnpm build and git diff --check passed. Final healthz healthy and zero alerts.
- No restart under STEERING 22: services do not import this offline evaluator. X experiment still requires supported per-call bound or owner decision; Nov 5 grouping/NBA/cost/latency/screenshots remain next.

## 2026-11-04: iteration 682 — saved X experiment report command

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 healthy nonempty sources and zero failed digest jobs; next edition Nov 5 15:00 UTC.
- Added offline CLI for saved X experiment evidence: strict input validation, unknown labels preserved, JSON output, no winner selection or application/provider imports. Invalid inputs fail without echoing private contents; saved evidence remains unchanged.
- Updated TASKS and experiment usage docs. No source/runtime behavior change; SOURCES/handbook unchanged. No paid calls; existing dispatch cost-bound blocker remains.
- Verification: targeted report tests 8/8, standalone strict tsc, pnpm format, pnpm lint:fix, pnpm check (433 unit/209 isolated integration), pnpm build and git diff --check passed. Final healthz healthy and zero alerts.
- No restart under STEERING 22: running services do not import the offline command. Next: Nov 5 grouping/NBA/cost/latency/screenshots; paid experiment awaits supported bound or owner decision.

## 2026-11-04: iteration 683 — offline failed-batch recovery measurement

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis and 36 healthy nonempty sources; no failed retained digest jobs. Next edition Nov 5 15:00 UTC.
- Added offline first-call refusal/throw probe through real article/social triage loops, with explicit recovery and a final cache-only pass. No provider, DB or secret access; no production retry change or paid calls.
- Synthetic 200-item pool: size-200 caller passes retain 150 sibling scores after failure and recover with one 50-item call; size-25 passes retain zero and recover with eight 25-item calls. Total requested items 250 vs 225; all 200 score successfully once, repeat zero calls. No live latency/cost/failure-rate claim.
- Updated TASKS/concurrency evidence; archived iterations 667–668 to keep PROGRESS small. SOURCES/handbook unchanged because runtime/source behavior is unchanged.
- Verification: targeted recovery tests 2/2, standalone strict tsc, pnpm format, pnpm lint:fix, pnpm check (435 unit/209 isolated integration), pnpm build and git diff --check passed. Initial lint/check caught require-await in fake cache methods; fixed before final checks.
- Final healthz healthy, zero alerts and 36 healthy nonempty sources. No restart under STEERING 22: running services do not import the offline probe.
- X experiment remains blocked on supported per-call bound or owner decision. Next: Nov 5 grouping/NBA/cost/latency/screenshots; compare actual batching/repair evidence before tuning.

## 2026-11-04: iteration 684 — offline X comparison coverage gate

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis and 36 healthy nonempty sources; zero failed digest jobs. Next edition Nov 5 15:00 UTC.
- Added optional saved-round manifest to the offline X report CLI. Checks four topics/three styles, same model/window, dispatches within one hour/UTC day, and repeat coverage on a second day. Lists unassigned evidence; rejects reused/unknown requests and mislabelled metadata.
- Per-style cost/yield keeps unknown reviews visible; incomplete rounds get no comparable yield ratio. Coverage is structural only: no winner, operator acceptance or live experiment claim. No paid calls or production changes.
- Verification: targeted report/comparison/CLI tests 13/13; standalone strict tsc; pnpm format, pnpm lint:fix, pnpm check (440 unit/209 isolated integration), pnpm build and git diff --check passed.
- Updated TASKS and experiment reference; SOURCES/handbook unchanged because runtime/source behavior is unchanged. Final healthz healthy, zero alerts and 36 healthy sources. No restart under STEERING 22: services do not import this offline command.
- Paid dispatch still needs supported cost bound or owner decision. Next: Nov 5 grouping/NBA AI/cost/latency/screenshots; then complete capped two-day comparison when dispatch is unblocked.

## 2026-11-04: iteration 685 — saved X experiment budget/time diagnostics

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 healthy sources and no failed digest jobs in inspected history.
- Offline comparison now reports supplied-call total spend against $2.50, assigned UTC-day totals against $1 and dispatches during 13:00–16:00 UTC. Multiple rounds share daily accounting; unassigned calls count toward total but leave compliance unknown. Empty evidence is unknown; known violations stay false.
- Structural two-day coverage remains separate. Saved evidence cannot establish complete ledger spend or outstanding holds; no dispatch, paid calls or production changes.
- Added UTC-offset/blackout boundaries, shared-day spend, exact caps, overflow, empty/unassigned evidence and CLI output checks. Initial full check caught stale CLI output expectation; updated and targeted comparison/CLI tests passed 10/10.
- Verification: standalone strict tsc, pnpm format, pnpm lint:fix, pnpm check (443 unit/209 isolated integration), pnpm build and git diff --check passed. Final healthz healthy and zero alerts.
- Updated TASKS/experiment reference; archived iterations 669–670 to keep PROGRESS small. SOURCES/handbook unchanged because source/runtime behavior is unchanged. No restart under STEERING 22: services do not import this offline helper.
- X paid dispatch still needs supported cost bound or owner decision. Next: Nov 5 grouping admission/accuracy, NBA AI, cost, latency and screenshots.

## 2026-11-04: iteration 686 — real-text Bluesky batching measurement

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis; all 36 sources nonempty without errors, zero failed retained digest jobs. Next edition Nov 5 15:00 UTC.
- Added read-only stored-observation report with one repeatable-read snapshot, production Bluesky safety/ranking shortlist and actual topic/text inputs to offline fake scoring. Prints aggregates only; no provider calls, cache writes or runtime changes.
- Nov 3–4 15:00 UTC window: 497/630/636/682 observations yield Tech/NBA/Gaming/World shortlists 50/47/50/50. Caller sizes 50 and 200 both dispatch four fake requests, 64,827 input bytes; 197 items scored once, repartitioned repeat zero calls. Larger caller limit offers no batching gain for this pool; no live latency/cost/quality claim.
- Updated TASKS and concurrency evidence with command/results/limitations. SOURCES/handbook unchanged because source/runtime behavior is unchanged.
- Verification: targeted batching/shortlist tests 12/12, standalone strict tsc, invalid-input exit/no-output check and stored-pool count/cache/size assertions passed; pnpm format, pnpm lint:fix, pnpm check (443 unit/209 isolated integration), pnpm build and git diff --check passed. Final healthz healthy and zero alerts.
- X experiment still awaits supported cost bound or owner decision. Next: Nov 5 grouping/NBA AI/cost/latency/screenshots, then compare real repair/cache evidence before tuning. No restart under STEERING 22: services do not import the new script.

## 2026-11-04: iteration 687 — require independent X comparison news windows

- Started clean on main; no leftover work. Zero alerts; healthy services, healthz/database/Redis and all 36 sources. No failed retained digest jobs; latest scheduled edition completed, next Nov 5 15:00 UTC.
- Fixed offline comparison coverage: different dispatch days no longer qualify when they repeat the same or overlapping news window. Round summaries expose normalized windows, or null for inconsistent/empty rounds. Adjacent windows qualify in either input order.
- Synthetic regressions cover same-window reuse, timezone-equivalent reuse, partial overlap and adjacent independent windows; no live experiment or paid calls. Production unchanged.
- Verification: targeted comparison/CLI 11/11, standalone strict tsc, pnpm format, pnpm lint:fix, pnpm check (444 unit/209 isolated integration), pnpm build, handbook validation and git diff --check passed. Initial check caught archive formatting; reformatted and complete rerun passed.
- Updated TASKS/experiment reference; archived iterations 671–672 to keep PROGRESS bounded. SOURCES/handbook unchanged because runtime/source behavior is unchanged. Final healthz healthy and zero alerts; no restart under STEERING 22 for this offline helper.
- X paid dispatch still needs supported cost bound or owner decision. Next: Nov 5 grouping/NBA AI/cost/latency/screenshots, then capped two-day comparison when unblocked.

## 2026-11-04: iteration 688 — measure stored X triage batching

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 nonempty sources without current errors, no failed retained digest jobs; next edition Nov 5 15:00 UTC.
- Added read-only repeatable-read report using production verified X semantic-candidate selection and actual stored text/topic context with offline fake scoring. Aggregates only; no provider calls, cache writes or runtime change.
- Nov 3–4 15:00 UTC publication window: Tech/NBA/Gaming/World pools 96/24/32/11. Sizes 50 and 200 both use five fake requests/53,346 input bytes; all 163 items scored once, repartitioned repeats zero calls. Existing production caller already permits Tech's two-request concurrency. No additional request-count gain; no live speedup claim.
- Current citations/verification can postdate END; historical edition pool/cache is not reconstructed. Updated TASKS/concurrency evidence; archived iteration 673 to bound PROGRESS. SOURCES/handbook unchanged because source/runtime behavior is unchanged.
- Verification: standalone strict tsc, offline aggregate/count/cache assertions, invalid-input exit/no-stdout check and targeted batching tests 9/9 passed. Initial mixed targeted command correctly refused five integration tests without isolated services; full check runs them with disposable services.
- Verification: pnpm format, pnpm lint:fix, pnpm check (444 unit/209 isolated integration), pnpm build, handbook validation and git diff --check passed. Zero dangling Docker volumes, final healthz healthy and zero alerts.
- X paid experiment remains blocked on supported per-call cost bound or owner decision. Next: Nov 5 grouping/NBA AI/cost/latency/screenshots. No restart under STEERING 22: services do not import this offline script.
