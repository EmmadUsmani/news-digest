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

## 2026-11-04: iteration 696 — preserve confirmed X experiment violations

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis; 36 nonempty sources without current errors and no failed retained digest jobs. Nov 5 15:00 UTC checks remain future.
- Fixed offline execution compliance: a malformed/unreadable sibling tool record no longer masks a confirmed sort, threshold, filter, exclusion or story-OR violation. Known failure takes precedence; valid plus missing evidence remains unknown.
- Added synthetic regressions for all five violation types, mixed record order and valid/unknown controls. No provider calls, production behavior or configuration changes.
- Verification: targeted report tests 8/8, standalone strict tsc, pnpm format, pnpm lint:fix, pnpm check (453 unit/209 isolated integration) and pnpm build passed. Handbook validation (17 pages/22 diagrams/26 tables) and git diff --check passed.
- Updated TASKS and experiment reference; archived iteration 679 to bound PROGRESS. SOURCES/handbook unchanged: no source/runtime change. No restart under STEERING 22 for offline tooling.
- Next: Nov 5 grouping/NBA AI/cost/latency/screenshots; paid X dispatch remains blocked on a supported cost bound or owner decision.

## 2026-11-04: iteration 697 — preserve refreshed edition history

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 sources without current errors and no failed retained digest jobs. Next edition Nov 5 15:00 UTC; paid X experiment still blocked on supported cost bound.
- Fixed saved-history refresh: an obsolete request can no longer replace refreshed entries or show an outdated failure after a background edition completes.
- Browser regression reproduced the missing newest entry before deployment. Desktop/mobile delayed-success and delayed-failure checks now pass using real stored editions and simulated browser-only job completion; no jobs, writes or provider calls. Saved and reviewed screenshots; no horizontal overflow.
- Verification: pnpm format, pnpm lint:fix, pnpm build, standalone smoke-script strict tsc and Playwright passed. pnpm check passed (453 unit/209 isolated integration); handbook passed (17 pages/22 diagrams/26 tables), as did git diff --check. Corrected smoke-script formatting and standalone tsc path setup; retried a handbook render timeout successfully.
- Updated TASKS; archived iteration 680 to bound PROGRESS. SOURCES/handbook unchanged: UI race fix only. Rebuilt and restarted API; worker unchanged.
- Next: Nov 5 grouping/NBA AI/cost/latency/screenshots. No cap, model, provider or production pipeline changes.

## 2026-11-04: iteration 698 — repair bodyless Bluesky session refresh

- Started clean on main; no leftover work. Healthz/services and 36 article sources healthy, zero alerts; triage found the 20:54 hourly Bluesky job failed on refresh HTTP 400. No failed digest jobs; Nov 5 checks remain future.
- Reproduced against the official PDS: refresh POST with JSON `{}` returns HTTP 400 InvalidRequest; bodyless POST returns 200. Fixed the adapter to select POST independently of its body; login/search limits and bounded recovery unchanged.
- Strengthened fixture assertions for refresh method, absent body/content type and between-page recovery. `pnpm exec tsx --test apps/api/test/bluesky-search.test.ts`: 10/10 pass.
- Free adapter probe with simulated access expiry completed a real official refresh and fetched 49 real posts, without storage or paid calls; not a natural-expiry observation. Credentials/tokens never printed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (453 unit/209 isolated integration), `pnpm build`, handbook (17 pages/22 diagrams/26 tables) and `git diff --check` passed. No UI change.
- Restarted worker and retried only the failed hourly Bluesky job once: completed at 21:16 UTC, fetched/submitted 49 real observations per topic (196 total). These are observations, not unique new posts. Healthz/database/Redis remain green, zero alerts.
- Updated TASKS and SOURCES; handbook unchanged for this request-format bug fix. No caps/models/providers changed. Long-lived natural refresh remains to observe.
- Next: Nov 5 grouping/NBA AI/cost/latency/screenshots; paid X experiment remains blocked on a supported cost bound.

## 2026-11-04: iteration 699 — retain confirmed promotions in experiment reports

- Started clean on main; no leftover work. Zero alerts, healthy healthz/services and 36 healthy sources; no failed retained digest jobs. Nov 5 checks remain future; paid experiment remains blocked on a supported per-call cost bound.
- Fixed offline zero-promotion reporting: a confirmed promotion remains a failure beside unreviewed posts, including per-style comparison totals. Missing review still keeps eligible yield unknown.
- Added synthetic regressions for both post orders, unknown-only controls and comparison aggregation. No provider calls or production behavior/config changes.
- Verification: targeted report/comparison tests 20/20, standalone strict tsc, pnpm format, pnpm lint:fix, pnpm check (455 unit/209 isolated integration), pnpm build and git diff --check passed.
- Updated TASKS and experiment reference; archived iteration 682 to bound PROGRESS. SOURCES/handbook unchanged: offline reporting only. No restart under STEERING 22; healthy running services do not import this helper.
- Next: Nov 5 grouping/NBA AI/cost/latency/screenshots; paid X dispatch awaits supported bound or owner decision.

## 2026-11-04: iteration 700 — isolate topic-create browser verification

- Started clean on main; no leftover work. Zero alerts, healthz/database/Redis healthy, 36 healthy sources and no failed retained digest jobs; Nov 5 scheduled evidence still future and paid X dispatch remains blocked on supported cost bound.
- Replaced topic-create smoke production POSTs, direct SQL deletion and digest generation with browser-only topic replay. Unknown browser API writes are rejected; direct API requests only read live topics/edition for unchanged-state assertions.
- Kept desktop/mobile required-name, create/reload, source-less display, order and overflow checks. Request counts prove native validation prevents creation. Replay is synthetic browser behavior, not server persistence evidence; isolated HTTP tests retain server coverage.
- Playwright passed and desktop/mobile screenshots reviewed. No paid calls, production writes or app changes. SOURCES/handbook unchanged; no restart under STEERING 22 because running code is unchanged.
- Verification: pnpm format, pnpm lint:fix, standalone strict tsc, Playwright, pnpm check (455 unit/209 isolated integration), pnpm build and git diff --check passed. Next: Nov 5 grouping/NBA AI/cost/latency/screenshots; other older topic browser scripts may still need write isolation.

## 2026-11-04: iteration 701 — isolate topic-deletion browser verification

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 active error-free article sources and zero retained failed digest jobs. Latest hourly Bluesky recovery completed; Nov 5 evidence remains future.
- Replaced topic-delete smoke production creates, source writes, deletes and digest generation with browser-only synthetic topic replay. Unknown browser writes are rejected; direct API requests only read live topics and the saved edition.
- Desktop/mobile Playwright checks passed: cancel sends no delete, HTTP failure preserves the topic, retry removes it, reload and order remain correct, no overflow. Screenshots updated and reviewed. Server deletion behavior remains covered by isolated HTTP/repository tests; replay is not server-persistence evidence.
- Verification: `pnpm exec tsx scripts/smoke-topic-delete.ts`, strict tsc with repository path mapping, `pnpm format`, `pnpm lint:fix`, `pnpm check` (455 unit/209 isolated integration), `pnpm build` and `git diff --check` passed. Initial standalone tsc lacked workspace alias/Node type mapping; corrected with a temporary config extending repository settings.
- Updated TASKS; archived iteration 683 to bound PROGRESS. SOURCES/handbook unchanged for browser verification only. No paid calls or production configuration changes. No restart under STEERING 22: running services do not import this script.
- Next: Nov 5 grouping/NBA AI/cost/latency/screenshots; paid X experiment blocked on a documented per-call bound. Other older topic browser scripts still need write isolation.
