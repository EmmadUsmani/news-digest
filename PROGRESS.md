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

## 2026-11-04: iteration 702 — isolate topic-reorder browser verification

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 healthy article sources and no failed retained digest jobs. Nov 5 evidence remains future; paid X dispatch still lacks a documented per-call bound.
- Replaced topic-reorder production PUTs and digest generation with browser-only replay. Unknown browser writes fail; direct API requests only read live topics and the saved edition for unchanged-state assertions.
- Desktop/mobile checks cover failed save preserving order, successful retry, contiguous positions, reload, grid order and overflow. Screenshots reviewed. This verifies browser behavior; isolated HTTP/repository tests retain server persistence and invalid-order atomicity coverage.
- Verification: `pnpm exec tsx scripts/smoke-topic-order.ts` and strict standalone tsc passed; `pnpm format`, `pnpm lint:fix`, `pnpm check` (455 unit/209 isolated integration), `pnpm build` and `git diff --check` passed.
- Updated TASKS; archived iteration 685 to bound PROGRESS. SOURCES/handbook unchanged: verification script only. No paid calls or production changes; no restart under STEERING 22 because running services do not import this script.
- Initial push rejected: owner added STEERING 31–32 remotely. Fetched and merged without rewriting history; removed resolved human blocker and updated TASKS. Next: authorized X round 1 tonight ($0.15 reserve/call), then disabled A/B schedule and backups; Nov 5 acceptance still takes priority when due.

## 2026-11-04: iteration 703 — dispatch authorized X comparison round 1

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 healthy article sources and zero retained failed digest runs. Nov 5 acceptance remains future.
- Added explicit-opt-in direct-xAI runner using existing $0.15 reservations/claims/settlements and one private shared journal. Saves raw requests/responses/usage without headers or keys; no production ingestion/config changes. Continue mode visits only never-attempted cells within the original hour.
- Twelve cells attempted at 21:46–21:53 UTC; eleven settled/$0.382331/47 fetched. Gaming current returned no response at the 60 s transport deadline; $0.15 hold retained, never retried. Charged total $0.532331; maximum known call $0.056935. No overrun or paid retry.
- Trending: 32 fetched/$0.226258, observed median/max likes 1714/16089; current: 13/$0.101068, 8/42; reactions: 2/$0.055005, likes unknown. All trending queries omit the separator before the reply filter; reaction operator inputs match. World reaction article pool includes NFL. Unknown reviews and missing baseline cell prevent a winner.
- Private evidence/report: ~/.local/state/news-digest/x-experiment/2026-11-04T21-46-02-565Z/. Report excludes unknown costs; journal retains their holds. No production activation; current raw responses are not verified/ingested posts.
- Verification: strict standalone tsc for runner/preparer/test; synthetic runner/budget/request tests 13/13 and runner/report/comparison 23/23; pnpm format, pnpm lint:fix, pnpm check (455 unit/209 isolated integration), pnpm build, live offline-report CLI and git diff --check passed. Three new runner tests cover settlement, overrun stop and continuation without unknown-call retries; no test provider calls.
- Updated TASKS/SOURCES/experiment reference and acked STEERING 31; archived iteration 686. No restart under STEERING 22: running services do not import these scripts. Next: disabled A/B schedule, backups; offline query/article-pool review and second independent news day; Nov 5 scheduled acceptance takes priority when due.

## 2026-11-04: iteration 704 — preserve X query operator separator

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 nonempty sources without errors, zero retained failed digest jobs; next edition Nov 5 15:00 UTC.
- Corrected the round-1 trending concatenation defect in comparison request construction: operator suffix includes its leading space and a code-built query template exposes the keyword substitution point. Both A/B styles use it; current baseline and saved round-1 evidence stay unchanged.
- Regression checks substitute single-word, multi-word and OR keywords and preserve filters/exclusions/thresholds. No paid calls or production activation; actual next-round tool compliance remains unverified.
- Initial lint found three floating test declarations from iteration 703; marked them explicitly void. Targeted comparison/input/runner tests 11/11 and standalone strict tsc passed.
- Verification: pnpm format, pnpm lint:fix, pnpm check (458 unit/209 isolated integration) and pnpm build passed. Updated TASKS/experiment reference; archived iteration 687 to bound PROGRESS. SOURCES/handbook unchanged for experimental request formatting only.
- No restart under STEERING 22: production services do not import the comparison helper. Next: disabled fixed A/B schedule, private nightly backups, World article-pool review and second independent comparison day; Nov 5 scheduled acceptance takes priority when due.

## 2026-11-04: iteration 705 — prepare disabled fixed A/B search plans

- Started clean on main; no leftover work. Zero alerts, healthy healthz/services, 36 healthy nonempty sources and zero retained failed digest jobs; next edition Nov 5 15:00 UTC.
- Added default-off pure schedule planner: reactions for top 2–3 distinct ranked stories precede trending; stored thresholds/exclusions have no fallback defaults. Uses existing pre-edition/window rules without new AI calls.
- Budget projection keeps A first and drops B from quiet article pools first. Missing settings skip topics; fewer than two distinct stories skip A. Shares configuration type with comparison request builder; tests construct both request styles with exact operators/window.
- Preparation only: no runtime caller, paid calls or production changes. Runtime setting, durable A/B admission, executor wiring and old followup removal remain; experiment decision gates activation. Backups follow this disabled-schedule work.
- Verification: `pnpm exec tsx --test apps/api/test/fixed-search-schedule.test.ts apps/api/test/x-search-comparison.test.ts` (9/9), `pnpm format`, `pnpm lint:fix`, `pnpm check` (463 unit/209 isolated integration), `pnpm build` and `git diff --check` passed. Updated TASKS/experiment reference; archived iteration 688 to bound PROGRESS. SOURCES/handbook unchanged because operating sources/services are unchanged. No restart under STEERING 22: services import neither helper.
- Initial push rejected because owner added STEERING 33/UI spec remotely. Fetched and merged without rewriting history; added the UI rebuild to TASKS after 30–32/Nov 5 checks and before fallback work. Remote changes are instructions/spec only; verified application code unchanged.
