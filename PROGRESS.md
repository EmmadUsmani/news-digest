## 2026-11-04: iteration 626 — quantify provider capacity for timing targets

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 sources without current errors and no failed digest jobs; retained Bluesky failure is the historical 04:54 event.
- Extended the offline concurrency report with necessary 60/120-second capacity bounds, individual-call excess and aggregate work reduction at four slots; tested empty evidence, exact capacity, long failed calls and recorded totals.
- Nov 3 fixed durations require at least 14 slots by capacity for 60 s. Even ideal article caching requires at least 5, or at least 54,225 ms (18.4%) less aggregate work at four slots. These are necessary conditions only; dependencies/non-provider work remain, and 120 s figures do not establish 1,500-item performance.
- Updated TASKS and RANKING; archived iteration 608 to keep PROGRESS bounded. No paid calls, prompts, recordings, production settings or activations changed.
- Verification: targeted concurrency tests 6/6 and offline CLI; pnpm format, pnpm lint:fix, pnpm check (370 unit/205 isolated integration), pnpm build and git diff --check passed. Final healthz healthy, zero alerts and zero dangling Docker volumes.
- Offline tool only; no running-service code/config changed, so no restart under STEERING 22. Grouping and incremental triage remain off.
- Next: Nov 4 15:00 UTC scheduled review takes priority: World posts, open-X/Bluesky selections, NBA validation and live timing/cost.

## 2026-11-04: iteration 627 — isolate recorded provider inputs

- Started clean on main; no leftover work. Zero alerts, healthy healthz and no failed systemd user services. Nov 4 15:00 UTC edition evidence remains pending.
- Fixed the opt-in LLM recorder to clone the complete invocation before fingerprinting and dispatch. A provider that reads inputs asynchronously now sees the original prompt, instructions, model, token limit and billing metadata even if the caller mutates its request.
- Added a delayed-provider regression that verifies original inputs and successful original-fingerprint replay; changed requests still fail closed. Synthetic responses only, no paid calls or fixture re-recording.
- Updated TASKS; archived iteration 609 to keep PROGRESS bounded. No production adapter wiring, prompts, settings or activations changed; no handbook behavior changed.
- Verification: targeted recorded-LLM tests 7/7; pnpm format, pnpm lint:fix and pnpm check passed (371 unit/205 isolated integration). Build and final health checked before commit; zero dangling Docker volumes.
- Offline adapter only, unused by production services: no restart under STEERING 22. Grouping and incremental triage remain off.
- Next: review Nov 4 scheduled edition for World posts, open-X/Bluesky selections, NBA validation and live timing/cost.

## 2026-11-04: iteration 628 — baseline provider output usage

- Started clean on main; no leftover work. Healthy healthz, zero alerts and 36 sources without current errors. Social collection completed at 12:54 UTC; retained 04:54 failure is historical.
- Added an offline per-purpose output report with paired usage/limit utilization, explicit unknowns, failed-work retention, completion-reason coverage and safe-integer checks.
- Exported only allowlisted metadata from the 43 Nov 3 scheduled calls, without inference or response bodies: article triage 133,175 output tokens; remaining calls 57,488 (editors 35,825). No output limits/stop reasons were recorded, so reservation utilization and truncation remain unknown.
- Updated TASKS and RANKING; archived iteration 610 to keep PROGRESS bounded. No prompts, production configuration, source behavior or paid calls changed; no handbook behavior changed.
- Verification: targeted output tests 4/4 and offline CLI; pnpm format, pnpm lint:fix, pnpm check (375 unit/205 isolated integration), pnpm build and git diff --check passed. Final healthz healthy, zero alerts and zero dangling Docker volumes.
- Offline tool only: no running-service code/config changed, so no restart under STEERING 22. Grouping and incremental triage remain off.
- Restarted worker only; final healthz healthy, zero alerts/failed units/dangling volumes. Saved Nov 3 edition still serves 19 real stories/11 X posts. No Postgres/Redis restart.
- Next: Nov 4 15:00 UTC edition review takes priority: World posts, open-X/Bluesky selections, NBA validation and live timing/cost; compare the new completion metadata with this baseline.

## 2026-11-04: iteration 629 — expose per-call output saturation

- Started clean on main; no leftover work. Healthz healthy and zero alerts; Nov 4 scheduled evidence remains pending.
- Extended the offline output report with peak per-call utilization and the count reaching/exceeding recorded limits. Aggregate utilization can hide individual saturated calls; neither metric infers truncation.
- Added a synthetic low-aggregate/saturated-call regression including failed calls, above-limit usage and missing metadata; Nov 3 limits remain unknown. No paid calls or production changes.
- Updated TASKS and RANKING; archived iteration 611 to keep PROGRESS bounded. No handbook system behavior changed.
- Verification: targeted output tests 5/5 and offline CLI; pnpm format, pnpm lint:fix, pnpm check (376 unit/205 isolated integration), pnpm build and git diff --check passed. Final healthz healthy, zero alerts and zero dangling Docker volumes.
- Offline tool only; no running-service code/config changed, so no restart under STEERING 22. Grouping and incremental triage remain off.
- Next: review Nov 4 15:00 UTC edition for social picks, NBA validation, timing/cost and completion metadata.

## 2026-11-04: iteration 630 — reject inexact replay token counts

- Started clean on main; no leftover work. Healthz healthy, zero alerts and no failed user services. Nov 4 scheduled evidence remains pending.
- Recording/replay fixture validation now rejects token counts above JavaScript's safe-integer boundary instead of accepting inexact usage metadata.
- Added synthetic regressions for all four usage fields: negative, fractional, non-finite and unsafe values fail closed; the maximum safe integer round-trips. Rejected recordings leave no partial record. No paid calls or fixture re-recording.
- Updated TASKS; archived iteration 612 to keep PROGRESS bounded. No production wiring, prompt, source, setting or handbook behavior changes.
- Verification: targeted replay tests 8/8; pnpm format, pnpm lint:fix, pnpm check (377 unit/205 isolated integration), pnpm build and git diff --check passed. Initial format check caught archived-entry whitespace; corrected before rerunning check.
- Final healthz healthy, zero alerts and zero dangling Docker volumes. Offline adapter only: no service restart under STEERING 22; grouping/incremental triage remain off.
- Next: review Nov 4 15:00 UTC edition for social picks, NBA validation and live timing/cost.

## 2026-11-04: iteration 631 — connect default-off background triage

- Started clean on main; no leftover work. Healthz healthy, zero alerts, no failed user services and 36 sources without current errors.
- Connected the prepared incremental-triage worker entry point and shutdown drain. Startup errors stop the worker; tick errors are logged. Disabled mode allocates no scoring resources or timer.
- Production enable setting is unset (default off); Nov 4 review remains the activation gate. No paid calls, prompt changes, grouping activation or database/Redis restart.
- Updated TASKS, RANKING, stale composition comments and the Jobs & schedules handbook page.
- Verification: targeted lifecycle tests 10/10; pnpm format, pnpm lint:fix, pnpm check (377 unit/205 isolated integration), pnpm build, handbook check (17 pages/two unchanged diagrams/25 tables) and git diff --check passed.
- Restarted only news-digest-worker; running-process gate confirmed off. Healthz healthy, zero alerts/failed units/dangling Docker volumes; immutable Nov 3 edition still serves real stories/posts. No UI changes.
- Next: Nov 4 15:00 UTC review of open-X/Bluesky selections, World posts, NBA validation and timing/cost; then consider incremental-triage activation and measure real waste.

## 2026-11-04: iteration 632 — reject incomplete incremental activation

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 sources without errors and four available queues with no failed runs. Nov 4 evidence remains pending.
- Explicitly enabled incremental triage now fails startup for missing, empty or whitespace-only Anthropic credentials instead of silently staying idle. Default-off behavior is unchanged.
- Offline regression uses a database proxy that fails on access; no provider calls, activation, prompts, sources, schema or UI changes. Updated TASKS, RANKING and Jobs & schedules; archived iteration 613 to keep PROGRESS bounded.
- Verification: targeted admission/worker tests 7/7; pnpm format, pnpm lint:fix, pnpm check (377 unit/205 isolated integration), pnpm build, handbook jobs check (17 pages/two unchanged diagrams/25 tables) and git diff --check passed; zero dangling Docker volumes.
- Restarted worker only; final healthz/alerts and saved Nov 3 real edition checked. No Postgres/Redis restart; incremental triage and grouping remain off.
- Next: review Nov 4 15:00 UTC edition for open-X/Bluesky picks, World posts, NBA validation and live timing/cost before activation.

## 2026-11-04: iteration 633 — stop incremental cache reads at cutoff

- Started clean on main; no leftover work. Healthz healthy, zero alerts and 36 sources without current errors. Two retained ingestion failure counters have no matching reported runs; no worker errors in the last hour.
- Default-off incremental runner now checks cutoff before every cache chunk and detects a boundary crossed during an empty read. Later chunks and scoring stop; in-flight reads can finish and shared admission is released.
- Synthetic regression covers a 601-item scan crossing exact cutoff, admission release and a subsequent single empty read. No paid calls, activation, prompt, source, schema or UI changes.
- Updated TASKS/RANKING; archived iteration 614 to keep PROGRESS bounded. Internal cutoff fix needs no handbook change.
- Verification: runner tests 6/6; pnpm format, pnpm lint:fix, pnpm check (378 unit/205 isolated integration), pnpm build and git diff --check passed. Initial full check caught archived-entry whitespace; corrected and reran.
- Restarted worker only; final healthz healthy, zero alerts/failed units/dangling volumes. Saved Nov 3 edition still serves 19 real stories/11 X posts. No Postgres/Redis restart.
- Next: Nov 4 15:00 UTC edition review for open-X/Bluesky picks, World posts, NBA validation and live timing/cost before activation.

## 2026-11-04: iteration 634 — measure pending-threshold tradeoff offline

- Started clean on main; no leftover work. Healthz healthy, zero alerts, current sources healthy and retained queues available. Nov 4 scheduled evidence remains pending.
- Compared pending thresholds 1/10/25 with fixed 25-item pass cap and two-hour cutoff on three recorded Nov 1 windows; synthetic scores, no external calls.
- Threshold 25 versus 1 cuts 46→7 requests and 116,120→68,264 prompt bytes, but increases edition remainder 32→53. Every variant scores all 153 articles once; waste, billed cost and live latency remain unknown.
- Documented reproduction, per-topic remainders and limits in RANKING/TASKS: independent hourly topic passes do not model the rotating worker, and publication times are arrival proxies. No setting, prompt, source or feature activation.
- Archived iterations 615–616 to keep PROGRESS below 25 KB. No handbook system behavior changed.
- Verification: replay aggregate assertions, incremental tests 11/11, pnpm format, pnpm lint:fix, pnpm check (378 unit/205 isolated integration), pnpm build and git diff --check passed.
- Restarted worker only; healthz healthy, zero alerts/failed units/dangling volumes. Saved Nov 3 edition serves four topics/19 stories/11 X posts. No Postgres/Redis restart or paid calls.
- Next: review Nov 4 15:00 UTC edition for open-X/Bluesky picks, World posts, NBA validation and timing/cost before activation; use actual arrival/cache evidence to choose a threshold.

## 2026-11-04: iteration 635 — replay rotating topic capacity offline

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 sources without current errors and four available queues with no failed retained runs. Nov 4 evidence remains pending.
- Added optional rotating topic slots to the offline replay, with per-phase metadata/pass counts and validated positions; existing independent scheduling stays the default.
- Compared thresholds 1/10/25 across four positions with hourly global ticks, 25-item cap and two-hour cutoff. World leaves all 47 candidates for publication in two positions at threshold 25; per-topic envelopes are not aggregate edition estimates.
- Synthetic responses use real request/cache logic; all final candidates scored once. Publication times remain arrival proxies; waste, cost, provider duration and real timer/admission behavior remain unknown. No paid calls or production activation.
- Updated TASKS/RANKING; archived iteration 617 to keep PROGRESS bounded. No system behavior or handbook change.
- Verification: targeted replay tests 12/12, aggregate replay assertions, pnpm format, pnpm lint:fix, pnpm check (379 unit/205 isolated integration), pnpm build and git diff --check passed.
- Restarted worker only; healthz/alerts and saved Nov 3 edition (four topics/19 stories/11 posts) verified. No Postgres/Redis restart; zero dangling volumes/failed units.
- Next: review Nov 4 15:00 UTC open-X/Bluesky selections, World posts, NBA validation and timing/cost; keep incremental triage/grouping off until review.

## 2026-11-04: iteration 636 — enforce background cutoff before scorer batches

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 healthy sources and 13 healthy services. Retained historical social failures coexist with successful current collection; Nov 4 edition evidence remains pending.
- Fixed default-off background scoring starting provider batches after its own cache scan crossed cutoff. Runner now supplies a live per-batch gate; later batches stop while in-flight results finish/cache and untouched IDs remain unscored.
- Regression uses the real scorer crossing exact cutoff during cache recheck; verifies no provider call and admission release. Partial-batch regression verifies retained cache and later completion.
- Updated TASKS/RANKING; archived iteration 618 to keep PROGRESS bounded. Internal bug fix needs no handbook change; no source, schema, prompt, feature activation or paid calls.
- Verification: targeted tests 23/23; pnpm format, pnpm lint:fix, pnpm check (381 unit/205 isolated integration), pnpm build and git diff --check passed. Strengthened final regression also passed targeted tests, API typecheck and ESLint.
- Restarted API/worker; healthz healthy, zero alerts/failed user units/dangling volumes. Saved Nov 3 edition still serves four topics/19 stories/11 X posts. No Postgres/Redis restart.
- Next: review Nov 4 15:00 UTC edition for open-X/Bluesky picks, World posts, NBA validation and timing/cost before activation.

## 2026-11-04: iteration 637 — measure incremental per-pass capacity offline

- Started clean on main; no leftover work. Healthz healthy, zero alerts/failed units and all four queues available. Nov 4 scheduled evidence remains pending.
- Compared per-pass caps 10/25/50/100/200 with minimum pending 1, two-hour cutoff and four rotating positions on three recorded Nov 1 windows; no external calls.
- At hourly global ticks, caps 25–200 produce identical edition remainders, request counts and prompt bytes. Cap 10 increases NBA/World/Tech remainder in some positions without reducing requests. This measures pass capacity, not provider batch size or live speed.
- All 240 replay rows assert every final candidate scored once, zero repeat scoring and unknown waste. Small publication-proxy windows cannot establish actual capacity, cost or latency.
- Updated TASKS/RANKING with reproduction, per-position results and limits; archived iteration 619 to keep PROGRESS bounded. No source, prompt, setting, feature activation or handbook behavior change.
- Verification: replay assertions, pnpm format, pnpm lint:fix, pnpm check (381 unit/205 isolated integration), pnpm build and git diff --check passed.
- Restarted worker; healthz healthy, zero alerts/failed units/dangling volumes. Saved Nov 3 edition serves four topics/19 stories/11 posts. No Postgres/Redis restart or paid calls.
- Next: review Nov 4 15:00 UTC edition for open-X/Bluesky picks, World posts, NBA validation and timing/cost; keep incremental triage/grouping off until review.

## 2026-11-04: iteration 638 — drain failed concurrent triage before releasing admission

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 13 healthy services and 36 healthy sources; Nov 4 edition still pending.
- Fixed thrown provider/cache batch failures returning before sibling calls and cache writes settle. Stop queued batches on exception; await every worker, preserving a single error or aggregating concurrent failures.
- This keeps background admission and caller resources held through in-flight work; successful sibling results remain cached. Applies to article/social triage without changing prompts, budgets, concurrency or feature settings.
- Regressions cover one/two thrown failures, delayed successful siblings, retained cache writes and no queued batch starts; targeted triage tests 18/18 passed.
- Updated TASKS; archived iteration 620 to keep PROGRESS bounded. Internal fix needs no handbook/schema/source update; no paid calls or production activation.
- Verification: pnpm format, pnpm lint:fix, pnpm check (383 unit/205 isolated integration), pnpm build and git diff --check passed; targeted triage 18/18.
- API/worker restarted at 14:08 UTC; healthz healthy, zero alerts/failed units/dangling volumes. Saved Nov 3 edition intact: four topics/19 stories/11 posts. No Postgres/Redis restart.
- Next: review Nov 4 15:00 UTC edition for open-X/Bluesky selections, World social, NBA validation and timing/cost; incremental triage/grouping remain off until review.

## 2026-11-04: iteration 639 — stop triage after admission guard exceptions

- Started clean on main; no leftover work. Healthz healthy, zero alerts, all four queues available and 36 sources; Nov 4 edition still pending.
- Moved the per-batch cutoff/admission guard inside shared failure handling. A thrown schedule/clock lookup now stops sibling workers from starting queued provider calls while already-started work drains and caches.
- Regression covers a guard throwing before any provider call and after one starts, exact error propagation, cached sibling scores and recovery with no repeat scoring; targeted triage 19/19 passed.
- Updated TASKS; archived iteration 621 to keep PROGRESS bounded. Internal bug fix needs no handbook/schema/source update. No paid calls, prompt changes or production feature activation.
- Verification: pnpm format, pnpm lint:fix, pnpm check (384 unit/205 isolated integration), pnpm build and git diff --check passed.
- API/worker restarted at 14:12 UTC; healthz healthy, zero alerts/failed user units/dangling volumes. Saved Nov 3 edition intact: four topics/19 stories/11 posts. No Postgres/Redis restart.
- Next: review Nov 4 15:00 UTC edition for open-X/Bluesky selections, World posts, NBA validation and timing/cost; incremental triage/grouping remain off until review.

## 2026-11-04: iteration 640 — measure caller barriers in offline triage batching

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 sources and all four queues available; Nov 4 edition pending.
- Offline batching now reports cold provider requests per sequential caller pass and equal-duration capacity rounds at one/two/four slots, excluding cache-only repeat work.
- Recorded Nov 1 NBA/Tech windows each need two requests: chunk 50 serializes them; chunk 200 permits overlap. Two/four slots tie in these small windows. World needs one request. These are capacity models, not live timing/cost or optimal-setting evidence.
- Four targeted tests pass, including 201-item partial passes, byte-bound splitting, empty work and cache-preserving repartitioning. No paid calls, production code/settings or feature activation.
- Updated TASKS/RANKING; archived iteration 622 to keep PROGRESS bounded. No source/handbook/schema behavior change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (385 unit/205 isolated integration), pnpm build and git diff --check passed. An initial format check caught the new archive file; formatted it and reran the full check successfully.
- API/worker restarted at 14:21 UTC; healthz healthy, zero alerts/failed units/dangling volumes. Saved Nov 3 edition remains four topics/19 stories/11 posts. No Postgres/Redis restart.
- Next: review Nov 4 15:00 UTC edition for open-X/Bluesky selections, World posts, NBA validation and timing/cost. Incremental triage/grouping stay off pending review.

## 2026-11-04: iteration 641 — measure partially warm triage cache fragmentation

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 healthy sources/13 services, and all four queues available; Nov 4 edition remains pending.
- Extended offline batching replay with validated warmed candidate IDs, real item-cache preparation using synthetic scores, and separate publication-only request totals. CLI compares cold/prefix-half/alternating-half patterns.
- Recorded half-warm NBA/World/Tech pools leave 26/23/27 candidates: chunk 50 still needs 2/1/2 calls, chunk 200 needs 1/1/1. Synthetic 200-item pools show identical hit counts can leave two versus four requests depending on placement. These are sensitivity models, not measured hit rates, cost or latency.
- Five targeted batching tests pass, covering remaining-item accounting, fragmented/prefix caches, all-warm zero work, invalid IDs and cache preservation. Updated TASKS/RANKING; archived iteration 623 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (386 unit/205 isolated integration), pnpm build and git diff --check passed.
- Offline tools/tests/docs only; no running code/config changed, so no restart under STEERING 22. No paid calls, prompts, source/handbook/schema changes or production activation.
- Live saved Nov 3 edition remains four topics/19 stories/11 posts; zero alerts. Next: Nov 4 15:00 UTC evidence review for open-X/Bluesky/World selections, NBA validation and timing/cost before activation decisions.

## 2026-11-04: iteration 642 — count cache preparation in offline batching overhead

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 sources and all four queues available. Nov 4 scheduled edition remains pending.
- Offline batching now reports preparation and combined request/input/output-reservation totals alongside publication work, using the real item cache and synthetic scores.
- At chunk 200, half-warm NBA/World/Tech publication needs 1/1/1 requests, but preparation plus publication needs 2/2/2 versus cold 2/1/2. World adds 1,241 input bytes; NBA/Tech mostly shift work earlier. Bytes/reservations are not billed usage; hourly fragmentation, expired unused items and live latency remain unmeasured.
- Six targeted batching tests pass, including cold/partial/all-warm overhead accounting and exact combined-item preservation. Updated TASKS/RANKING; archived iteration 624 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (387 unit/205 isolated integration), pnpm build and git diff --check passed.
- Offline tools/tests/docs only; no running-service code/config changed, so no restart under STEERING 22. No paid calls, prompts, sources, schema or production activation changed.
- Next: review Nov 4 15:00 UTC edition for open-X/Bluesky/World selections, NBA validation and timing/cost before activation decisions. Incremental triage and grouping stay off.

## 2026-11-04: iteration 643 — explain incremental replay backlog by pass

- Started clean on main; no leftover work. Healthz healthy and zero alerts; Nov 4 edition pending.
- Added per-tick/final-pass replay traces: pending/pool/scored/request counts and scored/cached/threshold/rotation/cutoff outcomes. No production code/config or paid calls.
- Hourly offset-1 rotation with threshold/cap 25 and two-hour cutoff: World/Tech last assigned ticks have 22/24 pending, defer, and leave all 47/54 for publication; NBA prepares 25 and leaves 27. Publication proxies and synthetic scores do not establish live cost/speed.
- Targeted incremental replay tests 13/13 pass, including backlog/threshold traces, cutoff precedence, cached passes and request/item reconciliation.
- Updated TASKS/RANKING; archived iteration 625 to keep PROGRESS bounded. No source/handbook/schema change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (388 unit/205 isolated integration), pnpm build and git diff --check passed. Healthz healthy, zero alerts/dangling volumes; saved edition remains four topics/19 stories/11 posts.
- Offline tools only; no restart under STEERING 22. Incremental triage/grouping remain off; next priority is Nov 4 scheduled edition review.
