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

## 2026-11-04: iteration 689 — timezone-stable X experiment eligibility

- Started clean on main; no leftover work. Zero alerts, healthy healthz and 13 services, all 36 sources healthy; no failed retained digest runs. Next edition Nov 5 15:00 UTC.
- Offline X report now rejects timezone-free/date-only window and publication timestamps; accepts explicit offsets and preserves inclusive-start/exclusive-end eligibility and unknown publication dates. Prevents host timezone from changing measured yield. Production unchanged; no paid calls.
- Verification: targeted report/comparison/CLI 18/18; report tests 7/7 under TZ=America/Los_Angeles; pnpm format, pnpm lint:fix, pnpm check (445 unit/209 isolated integration), pnpm build, handbook validation and git diff --check passed.
- Updated TASKS/experiment reference. SOURCES/handbook unchanged: no source/runtime change. No restart under STEERING 22 for this offline helper.
- Paid X dispatch still awaits a supported cost bound or owner decision. Next: Nov 5 grouping/NBA AI/cost/latency/screenshots.

## 2026-11-04: iteration 690 — fence X experiment dispatch after reservation

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, all 36 sources nonempty without current errors; no failed retained digest jobs. Next edition Nov 5 15:00 UTC.
- Added durable single-use claimDispatch to experiment admission: rechecks protected UTC hours and reservation day immediately before dispatch, refuses settled/unknown/repeated requests and existing overruns. Crash after claim retains the hold and forbids retries. Existing journals remain readable.
- Six targeted tests cover blackout/day rollover, restart/retry fencing, retained budget, settlement, overruns and damaged dispatch evidence. No provider calls, runner wiring or production changes; supported per-call cost bound still required.
- Verification: targeted budget tests 6/6, standalone strict tsc, pnpm format, pnpm lint:fix, pnpm check (447 unit/209 isolated integration), pnpm build, handbook validation (17 pages/22 diagrams/26 tables) and git diff --check passed.
- Updated TASKS/experiment reference; compressed prior batching detail and archived iteration 674 to bound orientation files. SOURCES/handbook unchanged: no source/runtime behavior change. No restart under STEERING 22 for the offline helper.
- Next: Nov 5 grouping/NBA AI/cost/latency/screenshots; paid X experiment awaits supported cost bound or owner decision.

## 2026-11-04: iteration 691 — prepare real reaction-search comparison inputs

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- Added read-only repeatable-read preparation CLI using existing relevance/quality/ranking article pipeline and saved topic thresholds. Produces current/trending/reaction request bodies with one precise window, ranked article identities and explicit missing-story blockers; no provider calls, admission, cache writes or production changes.
- Real Nov 3–4 15:00 UTC window: all four topics supply two distinct ranked titles; A/B thresholds Tech 50/500, NBA 100/1000, Gaming 50/500, World 200/2000. Private snapshot outside repo; current observations are not historical reconstruction.
- Verification: targeted input tests 3/3, standalone strict tsc, invalid CLI timestamp rejection/no stdout, pnpm format, pnpm lint:fix, pnpm check (450 unit/209 isolated integration), pnpm build, handbook validation (17 pages/22 diagrams/26 tables) and git diff --check passed. Final healthz healthy and zero alerts.
- TASKS/experiment reference updated; archived iteration 675 to bound PROGRESS. SOURCES/handbook unchanged because no source/runtime change. No restart under STEERING 22 for offline tooling.
- Paid X dispatch remains blocked on supported cost bound/owner decision. Next: Nov 5 grouping/NBA AI/cost/latency/screenshots.

## 2026-11-04: iteration 692 — direct topic availability controls

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 healthy sources and no failed retained digest runs. Nov 5 checks are future; paid X dispatch remains blocked on documented per-call cost bound.
- Added Enable/Disable buttons to Manage topics using the existing validated update endpoint. Updates incoming cards immediately, refreshes content through the existing save flow, reports errors and permits retry; unavailable during editing/deletion to protect pending work.
- Desktop/mobile Playwright checks passed for failure/retry, disable/enable, preserved settings, editor protection and no horizontal overflow. PUT responses were simulated; real topic settings were read back unchanged. Saved screenshots explicitly show this simulated state; no digest generation or provider calls.
- Verification: pnpm format, pnpm lint:fix, pnpm check (450 unit/209 isolated integration), pnpm build, strict standalone smoke-script tsc with workspace paths, handbook validation (17 pages/22 diagrams/26 tables) and git diff --check passed. Initial smoke top-level await corrected to CommonJS-compatible entry; standalone tsc config corrected for workspace aliases/types.
- Updated TASKS and owner handbook; archived iteration 676 to bound PROGRESS. SOURCES unchanged: no collection changes. API restarted after commit to serve rebuilt UI; worker unchanged.
- Next: Nov 5 grouping/NBA AI/cost/latency/screenshots take priority; X experiment awaits supported cost bound or owner decision. M6 broader acceptance stays open.

## 2026-11-04: iteration 693 — require usable reaction experiment articles

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 nonempty sources without current errors and no failed retained digest jobs; next edition Nov 5 15:00 UTC.
- Offline X experiment preparation now rejects blank/oversized article identities and titles and nonfinite scores before ranking; repeated article IDs retain only their highest-ranked version. Reaction readiness requires two usable distinct articles, preventing false readiness from updated titles on one article.
- Added regression coverage for duplicate IDs, invalid fields/scores and recovery with a second usable article. No provider calls or production discovery/configuration changes.
- Verification: targeted inputs 4/4; pnpm format, pnpm lint:fix, pnpm check (451 unit/209 isolated integration), pnpm build, handbook validation (17 pages/22 diagrams/26 tables) and git diff --check passed.
- Updated TASKS and archived iteration 677 to bound PROGRESS. SOURCES/handbook unchanged: no source/runtime change. No restart under STEERING 22 for offline tooling.
- Next: Nov 5 grouping/NBA AI/cost/latency/screenshots. Paid X dispatch still requires supported cost bound/owner decision.

## 2026-11-04: iteration 694 — preserve the reader’s saved-edition selection

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis. Paid X experiment remains blocked; Nov 5 scheduled checks are future.
- Fixed a digest-page race: an initial latest-edition response could overwrite a saved edition opened from history, leaving the URL and displayed content inconsistent. Superseded initial errors are ignored too; publication invalidates older loads.
- Desktop/mobile Playwright delayed-success and delayed-error checks passed using real stored editions and browser-only GET interception, with no writes, generation or provider calls. Saved history screenshots; no horizontal overflow.
- Verification: pnpm format, pnpm lint:fix, pnpm check (451 unit/209 isolated integration), pnpm build, standalone smoke-script strict tsc, handbook (17 pages/22 diagrams/26 tables) and git diff --check passed. Corrected initial smoke-script formatting failure; final full check passed.
- Updated TASKS and archived iteration 678 to bound PROGRESS; SOURCES/handbook unchanged because this is a UI race fix. Rebuilt and restarted API to serve corrected UI; worker unchanged.
- Next: Nov 5 grouping/NBA AI/cost/latency/screenshots. Paid X dispatch still requires a supported cost bound or owner decision.

## 2026-11-04: iteration 695 — require closed windows for X comparisons

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, all 36 sources healthy/nonempty and no failed retained digest runs; next edition Nov 5 15:00 UTC.
- Offline X comparison reports now list searches dispatched before their edition window ended and exclude those rounds from comparable yield and two-day coverage. Their costs remain included in all spend guardrails.
- Added synthetic regressions for one premature call, future windows, equivalent UTC offsets and dispatch exactly at the exclusive window end. No provider calls or production/config changes.
- Verification: targeted comparison tests 10/10; pnpm format, pnpm lint:fix, pnpm check (452 unit/209 isolated integration), pnpm build, handbook validation and git diff --check passed.
- Updated TASKS and experiment reference. SOURCES/owner handbook unchanged: no source/runtime changes. No service restart under STEERING 22 for offline tooling.
- Next: Nov 5 grouping/NBA AI/cost/latency/screenshots. Paid X dispatch remains blocked on supported cost bound/owner decision.
