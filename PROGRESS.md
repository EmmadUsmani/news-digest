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

## 2026-11-04: iteration 706 — prepare direct fixed A/B dispatch

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 healthy article sources and zero retained failed digest jobs; next edition Nov 5 15:00 UTC.
- Direct xAI adapter now accepts explicit fixed A/B configuration through its port. Extracted the unchanged legacy body builder so production and experiment share exact operators/thresholds without circular imports. No scheduler supplies the new configuration yet.
- Fake HTTP checks verify both styles dispatch the experiment body and retain fetched usage, citations and actual tool inputs; invalid settings/legacy handle combinations fail before dispatch. No paid calls, activation or configuration changes.
- Initial broad direct test invocation included DB tests outside their disposable harness; reran the two new tests explicitly (2/2) and planner/comparison tests (9/9). Initial lint rejected test body stringification; corrected its type guard.
- Updated TASKS/experiment reference; archived iteration 689 to bound PROGRESS. SOURCES/handbook unchanged: operating sources, schedule and data flow remain unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, targeted tests 11/11, `pnpm check` (463 unit/211 isolated integration), `pnpm build` and `git diff --check` passed. API/worker restarted for changed adapter imports; healthz/database/Redis and all 36 sources healthy afterward.
- Next: runtime setting, durable A/B admission and scheduler wiring/removal; then private nightly backups with restore proof. Experiment decision still gates activation; Nov 5 scheduled acceptance takes priority when due.

## 2026-11-04: iteration 707 — durable fixed A/B search admission

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 nonempty sources without current errors and no retained failed digest jobs; latest Nov 4 edition has four topics.
- Added fixed-reactions/fixed-trending ledger types and unique topic/day/style slots under unchanged shared caps. Rejected/uncertain attempts remain consumed across restarts; fixed and legacy scheduled paths cannot mix on a topic/day. Application dispatch records the correct style; runtime remains disconnected/off.
- Generated the first post-baseline Drizzle migration and snapshot; parity now checks the latest snapshot while retaining the historical baseline integrity check. Updated affected handbook migration description, schema metadata and experiment/task reference; archived iterations 690–691.
- Verification: focused application test 1/1, planner/comparison tests 9/9, pnpm format, pnpm lint:fix, pnpm check (463 unit/213 isolated integration), pnpm build and git diff --check passed. Initial check found an unnecessary type assertion; removed it and reran successfully. No test provider calls.
- Saved private custom-format pre-migration pg_dump outside repo (directory 700/file 600); pg_restore --list passed. This is not restore proof or the requested nightly backup system. Applied drizzle/0001 migration; content/social/edition/X-ledger row counts unchanged.
- Restarted API/worker; healthz/database/Redis, all 36 sources and zero-alert/failed-digest checks passed. Handbook validation passed after migration (17 pages/3 diagrams/26 tables, no metadata warnings). SOURCES unchanged: operating discovery and sources unchanged. No paid calls or activation.
- Next: default-off runtime setting, scheduler wiring and old followup replacement; then nightly private backups with real restore proof/stale alert. Experiment decision gates activation; Nov 5 scheduled checks take priority when due.

## 2026-11-04: iteration 708 — wire default-off fixed A/B discovery

- Started clean on main; no leftover work. Zero alerts, healthz/database/Redis healthy, 36 healthy nonempty sources and zero failed retained digest jobs; next edition Nov 5 15:00 UTC.
- Added exact worker opt-in X_FIXED_SEARCH_ENABLED=1 (default off). Fixed A/B replaces legacy open/followup execution when enabled; stored thresholds/exclusions, ranked article windows, shared caps, reserve/settle and verification remain mandatory. Production flag confirmed off; no paid calls or activation.
- A precedes B; live balance checks drop quiet-topic B first. Consumed A slots do not hide affordable B on restart. Settings, enabled topics and time are rechecked before every call; slow work cannot spend after the window closes.
- Fake-only targeted tests passed 10/10, including composed ledger style/verification, budget ordering, restart slots, config changes and cutoff. Initial fixture omitted story budget/verification completion; corrected. Full check initially rejected duplicate type import; combined imports and reran.
- Verification: pnpm format, pnpm lint:fix, pnpm check (468 unit/213 isolated integration), pnpm build, handbook validation (17 pages/2 diagrams/26 tables, no warnings) and git diff --check passed.
- Updated TASKS, experiment reference and affected schedule handbook; archived iteration 692. SOURCES unchanged: active sources and production discovery behavior unchanged. API/worker restarted; healthz, all 36 sources and alerts green, zero failed digest jobs; worker opt-in still off.
- Next: nightly private backups with real throwaway-container restore proof and 26-hour stale alert; then experiment review/second day. Experiment decision gates activation; Nov 5 scheduled acceptance takes priority when due.

## 2026-11-04: iteration 709 — private nightly backups and restore proof

- Started clean on main; no leftover work. Alerts/healthz green, all 36 sources healthy/nonempty, zero retained failed digest jobs; next edition Nov 5 15:00 UTC.
- Installed 02:20 UTC nightly custom-format pg_dump and Sunday 03:20 UTC isolated restore-check user timers. Both skip 13:00–16:00 UTC; private directory/files 700/600, seven-day retention, no off-VM copies or secrets in logs.
- Dump and all 26 application-table counts share an exported repeatable-read snapshot. Atomic completion manifest/checksum and success metric follow successful dump only; failed dumps never prune or advance freshness.
- Real service restore into network-isolated postgres:17-alpine matched 26 tables/22,191 rows; disposable container/volumes removed. Weekly proof receipt stays private. Initial manual backup exposed conflicting subprocess capture options; fixed before installation.
- Added DatabaseBackupStale to local vmalert for missing or >26-hour success; fake cases cover absent, overdue and recovered. Initial recovery test used epoch-zero timestamps; corrected to vmalert's documented Jan 2000 start. Four Python safeguard checks cover retention, partial files, corrupt dumps and failed dumps, included in the unit suite.
- Verification: pnpm format, pnpm lint:fix, pnpm check (469 unit/213 isolated integration), pnpm build, handbook validation (18 pages/22 diagrams/26 tables), systemd unit verification and git diff --check. Initial full check caught missing void on the Node test; fixed and reran. check-observability --verify-alerts passed (16 rules, zero alerts).
- Updated TASKS/STEERING acknowledgement and affected Operations/schedule handbook; split restore instructions to keep pages short; archived iteration 693. SOURCES/NEEDS_FROM_HUMAN unchanged. No app/runtime/provider changes; API/worker restart unnecessary under STEERING 22. Alert service restarted; backup/restore services ran successfully.
- Next: offline experiment review/second independent day under existing caps; Nov 5 grouping/NBA AI/cost/latency/screenshots take priority when due. Fixed X scheduling stays off until the experiment decision.

## 2026-11-04: iteration 710 — review saved X experiment candidates

- Started clean on main; no leftover work. Zero alerts, healthz/database/Redis healthy, all 36 sources active/nonempty without errors, all queues available with workers; next edition Nov 5 15:00 UTC.
- Retrieved official oEmbed for all 47 saved experiment citations, privately (47 successes, no errors). Manual visible-text promotion review: six definite promotions, 26 without explicit promotion in visible text, 15 unresolved. Truncated/media-dependent cases and every social-triage score remain unknown; no fabricated AI scores or winner.
- Found giveaways in Tech/Gaming trending and betting content in NBA current/trending. Saved reviewed evidence/report separately; original responses/journal unchanged. Gaming's unknown $0.15 hold remains charged. No paid calls, ingestion, production parameter changes or fixed-schedule activation.
- Read-only repeatable-read World snapshot reproduces 200/200 eligible candidates: empty required phrases admit Guardian US NFL article, ranked first by recency (9.94 vs midterms 9.93). Recorded exact policy, pool and ranked evidence privately; no new relevance rules or owner-setting edits.
- Added detailed experiment review and linked it from TASKS/experiment reference; archived iterations 695–696 to bound PROGRESS. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no source/runtime changes or new owner blocker. No service restart under STEERING 22 because only documentation changed.
- Verification: private review coverage/assertions and offline report command passed; pnpm format, pnpm lint:fix, pnpm check (469 unit/213 isolated integration), pnpm build, handbook link/metadata check (18 pages/26 tables) and git diff --check passed.
- Next: second independent news day, threshold calibration/model comparison within shared experiment caps; Nov 5 grouping/NBA full-AI/cost/latency/screenshots take priority when due. Production fixed A/B remains off pending decision.

## 2026-11-04: iteration 711 — reuse saved triage for experiment reaction inputs

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 healthy sources and zero failed retained digest jobs; Nov 5 15:00 UTC review remains future.
- Experiment preparation now reads exact-fingerprint article triage in its read-only snapshot. Saved relevance below 6 is excluded; scored articles rank by importance/relevance before unscored heuristic fallback under the saved relevance policy. No new wording rules or paid calls.
- Preserved cache/model/topic/content identity validation and score provenance; missing/corrupt scores stay unscored. Production reaction loader, thresholds, providers and fixed-schedule flag unchanged. Original round evidence untouched.
- Saved private cached-inputs-711.json (600) beside round 1: World's first three titles now cover midterms, each saved relevance 10/importance 9; 80 cached eligible World articles. This current snapshot is not historical or a second independent news day.
- Verification: targeted triage/reaction tests 27/27; pnpm format, pnpm lint:fix, pnpm check (470 unit/213 isolated integration), pnpm build, handbook (18 pages/22 diagrams/26 tables) and git diff --check passed. Initial lint found async-without-await stubs; fixed and reran. Isolated DB checks cover cache reads and semantic recovery/policy fallback.
- Updated TASKS, experiment reference and Social posts handbook; archived iteration 697. SOURCES/NEEDS_FROM_HUMAN unchanged. Rebuilt/restarted API and worker; healthz green, reader HTTP 200, zero alerts.
- Next: second independent experiment day, then calibration/model comparison within shared caps; Nov 5 grouping/NBA full-AI/cost/latency/screenshots take priority. No winner or production activation.

## 2026-11-04: iteration 712 — score saved X experiment candidates

- Started clean on main; no leftover work. Zero alerts, healthz/database/Redis green, all 36 active sources nonempty/error-free, zero failed retained digest jobs; Nov 5 acceptance remains future.
- Scored all 47 saved round-1 citations with production CandidateTriage social instructions and configured Haiku using saved official oEmbed paragraph text and current topic guidance. Four explicit live verification calls, repairs disabled, cost $0.003209; read back four succeeded ledger rows with purpose=verification and exact total. Existing shared app/reserve and $0.05 verification admission applied.
- Relevance ≥6: current 5/13, trending 6/32, reactions 2/2; by topic Tech 5/14, NBA 2/12, Gaming 3/9, World 3/12. Truncated/media-dependent text not inferred. Six definite promotions/15 unresolved labels unchanged; 17 missing publication times and Gaming's unknown outcome still prevent complete eligible yield or a winner.
- Saved private text, candidates/scores, exact runner, usage/fingerprints and separately joined evidence/report (600). Offline reporter and exact topic/post coverage assertions passed. Original evidence, manual promotion labels and X admission journal/hold unchanged. No X calls, ingestion, production parameter/provider/model changes or activation.
- Verification: pnpm format, pnpm lint:fix, pnpm check (470 unit/213 isolated integration), pnpm build, handbook validation (18 pages/22 diagrams/26 tables) and git diff --check passed. Initial check caught an extra blank line in the newly archived entry; formatted it and reran.
- Updated TASKS and experiment review/reference; archived iteration 698 to keep PROGRESS bounded. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no source/runtime change or new owner blocker. No restart under STEERING 22; services run unchanged main code.
- Next: second non-overlapping experiment day, threshold calibration/model comparison within shared caps; Nov 5 grouping/NBA full-AI/cost/latency/screenshots take priority when due. Fixed A/B remains off pending decision.

## 2026-11-04: iteration 713 — recover X experiment publication times

- Started clean on main; no leftover work. Zero alerts, healthz/database/Redis green, reader HTTP 200, all 36 sources active/nonempty/error-free, no failed retained digest jobs; Nov 5 scheduled checks remain future.
- Recovered 17 missing timestamps offline from X Snowflake IDs in a separate private evidence copy. All 47 UTC dates agree with saved official embed labels; all 30 prior timestamps agree within one second. Exact script/audit/evidence/report saved mode 600; original evidence, scores, promotion labels and budget journal untouched.
- In-window: current 10/13, trending 27/32, reactions 0/2. Both reaction citations predate Nov 3 21:00 UTC, despite passing triage. In-window relevance ≥6 counts are 3/6/0; existing visible-text promotion clearance gives 1/5/0, with 2/1/0 unresolved. No winner: raw promotions, unknown Gaming outcome, malformed trending query and second-day requirement remain.
- No HTTP/provider calls for recovery, ingestion, production parameters/models or activation. Updated TASKS and experiment references/review; archived iteration 699. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no runtime/source change or new owner blocker. No restart under STEERING 22; running code unchanged.
- Verification: private recovery assertions and offline report passed; pnpm format, pnpm lint:fix, pnpm check (470 unit/213 isolated integration), pnpm build, handbook validation and git diff --check passed.
- Next: second non-overlapping experiment day, then threshold calibration/model comparison within shared caps; Nov 5 grouping/NBA AI/cost/latency/screenshots take priority when due. Fixed A/B remains off.
