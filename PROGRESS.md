## 2026-11-04: iteration 611 — typed per-topic X discovery evidence

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 15:00 UTC edition review remains pending.
- Converted per-topic X report joins/grouping and correlated edition-membership lookup to Drizzle builders. SQL expressions retain PostgreSQL JSON expansion/aggregation and filtered counts.
- Read-only old/new comparison caught ambiguous CTE handle aliases; explicitly qualified them, then matched complete Nov 2–4 reports (1/4/0 calls) in one repeatable-read snapshot. Existing characterization assertions unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; healthz healthy, saved edition byte-identical, Anthropic/X spend unchanged. Read-only Playwright rendered four real saved topics without page errors; 36 sources without current errors, zero failed digest jobs and zero alerts.
- Updated TASKS and ORM decision; archived iteration 596 to keep PROGRESS bounded. No migration, source, activation, owner grant or paid call changes; no handbook system behavior changed.
- Next: prioritize Nov 4 edition review; otherwise final raw-SQL audit and remaining ORM adapters. Keep private backups before new migrations and preserve owner grants.

## 2026-11-04: iteration 612 — typed curation clocks and advisory locks

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 15:00 UTC edition review remains pending.
- Converted curation clock reads and session/transaction advisory-lock statements to Drizzle select builders; a singleton VALUES source executes each PostgreSQL function once. Preserved database wall clock, shared client/lock scope, contention and cleanup behavior.
- Typecheck caught unsupported FROM-less projections; corrected with the singleton source. Updated logging stub for Drizzle array rows; all assertions and repository characterization tests unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes. Targeted reserve-logging test passed after stub correction.
- Restarted API/worker outside freeze; healthz healthy, saved edition byte-identical, Anthropic/X spend unchanged. Read-only Playwright rendered four real saved topics without page errors; 36 sources without current errors, zero failed digest jobs and zero alerts.
- Updated TASKS and ORM decision; archived iteration 597 to keep PROGRESS bounded. No migration, source, activation, owner grant or paid call changes; no handbook system behavior changed.
- Next: prioritize Nov 4 edition review; otherwise remaining digest/social lock statements and final raw-SQL audit. Keep private backups before new migrations and preserve owner grants.

## 2026-11-04: iteration 613 — typed digest and social advisory locks

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 15:00 UTC edition review remains pending.
- Converted digest publication session lock/unlock and social X attribution/budget transaction locks to Drizzle select builders over a singleton VALUES source. Preserved single execution, snapshot/retry visibility, checked-out client ownership and lock scope.
- Existing characterization assertions unchanged; no migration, feature activation, source change, owner grant or paid call changes.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; healthz healthy, saved edition byte-identical and Anthropic/X spend unchanged. Read-only Playwright rendered four saved topics without page errors; 36 sources without current errors, zero failed digest jobs and zero alerts.
- Updated TASKS and ORM decision; archived iteration 598 to keep PROGRESS bounded. No handbook system behavior changed.
- Next: prioritize Nov 4 edition review; otherwise final raw-SQL audit and remaining adapters. Private pg_dump before new migrations; preserve owner grants.

## 2026-11-04: iteration 614 — typed custom-feed catalog lock

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 15:00 UTC edition review remains pending.
- Converted the topic repository's custom-feed catalog transaction lock to a Drizzle select builder over one VALUES row, preserving single execution and transaction serialization. Existing characterization assertions unchanged, including concurrent competition for the final catalog slot.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; healthz healthy, saved edition byte-identical and Anthropic/X spend unchanged. Read-only Playwright rendered four saved topics without page errors; 36 sources without current errors, zero failed digest jobs and zero alerts.
- Updated TASKS and ORM decision; archived iteration 599 to keep PROGRESS bounded. No migration, source, activation, owner grant or paid call changes; no handbook system behavior changed.
- Next: prioritize Nov 4 edition review; otherwise remaining X admission scalar query, connectivity probe and final raw-SQL audit. Private pg_dump before new migrations; preserve owner grants.

## 2026-11-04: iteration 615 — typed X scheduled admission

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 15:00 UTC review remains pending.
- Converted the X discovery ledger admission scalar query to a Drizzle select builder over one VALUES row; preserved current UTC day, consumed-attempt and optional-parent/completed-topic gates in the same transaction. Existing characterization assertions unchanged.
- Initial typecheck rejected an optional and() projection; added an explicit boolean SQL expression and reran verification successfully.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker outside freeze; healthz healthy, saved edition byte-identical and Anthropic/X spend unchanged. Read-only Playwright rendered four saved topics without page errors; sources have no current errors, zero alerts.
- Updated TASKS and ORM decision; no migration, source, activation, owner grant or paid call changes; no handbook system behavior changed.
- Next: prioritize Nov 4 edition review; otherwise connectivity probe and final raw-SQL audit. Private pg_dump before new migrations; preserve owner grants.

## 2026-11-04: iteration 616 — typed database connectivity probe

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 15:00 UTC review remains pending.
- Converted the constant connectivity probe to a Drizzle select builder over one VALUES row, without application-table access. Existing HTTP health characterization remains unchanged.
- Runtime query/execute audit found only historical migration-runner driver SQL in libs/db; remaining adapter SELECT expressions implement PostgreSQL JSON expansion/aggregation. Migration infrastructure review remains open.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; healthz healthy, saved edition byte-identical and Anthropic/X spend unchanged. Read-only Playwright rendered four topics without errors; zero current source errors, failed digest jobs or alerts.
- Updated TASKS and ORM decision; archived iteration 600 to keep PROGRESS bounded. No migration, source, activation, owner grant or paid call changes; no handbook system behavior changed.
- Next: prioritize Nov 4 edition review; otherwise review historical migration-runner SQL and finish item 2b acceptance. Private pg_dump before new migrations; preserve owner grants.

## 2026-11-04: iteration 617 — typed migration ledger

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 15:00 UTC review remains pending.
- Converted historical/generated migration ledger reads/inserts and advisory transaction lock to Drizzle builders on the same dedicated client. Driver SQL remains only for transaction control, bootstrap DDL and multi-statement migration-file execution, documented beside the code.
- Existing migration characterization unchanged: concurrent reruns, ordering, stable ledger timestamps, atomic DDL/data/ledger rollback and recovery all pass.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker outside freeze; healthz healthy, saved edition byte-identical and Anthropic/X spend unchanged. Read-only Playwright rendered four topics without errors; zero current source errors, failed digest jobs or alerts.
- Updated TASKS and ORM decision; archived the oldest progress entry. No new migration, live migration execution, source, activation, owner grant or paid call changes; no handbook system behavior changed.
- Next: Nov 4 edition review takes priority; otherwise final item 2b acceptance and architecture notes. Private pg_dump before any new migration.

## 2026-11-04: iteration 618 — ORM acceptance and architecture notes

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 15:00 UTC product review remains pending.
- Closed STEERING 2b acceptance; replaced the architecture conversion inventory with the completed ORM boundary, and updated handbook/README factual data-access notes. No schema, production feature or activation changes.
- Runtime query audit: direct driver SQL only in libs/db migration infrastructure; owner console helper preserved. Typed PostgreSQL expressions remain documented exceptions.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build, git diff --check and handbook code-structure check (25 tables, no metadata warnings) passed.
- Restarted API/worker outside freeze; healthz healthy, saved edition byte-identical, provider spend unchanged, zero source errors/alerts. Read-only Playwright verified all four saved topic names without page errors after correcting heading selectors.
- Archived oldest progress entry. No paid verification calls, source requests added, live migration execution or owner grant changes.
- Next: prioritize Nov 4 edition evidence/acks; grouping and incremental triage stay off pending review. Private pg_dump before any new migration.

## 2026-11-04: iteration 619 — sustained Bluesky collection evidence

- Started clean on main; no leftover work. Healthz healthy and zero alerts; Nov 4 edition not due yet.
- Verified seven consecutive scheduled Bluesky completions, 05:54–11:54 UTC (8.154–8.360 s), 56 search HTTP 200s and no failed attempts. Deployment restarts caused seven fresh logins: long-lived refresh remains unverified.
- Read-only stored report at 12:01 UTC: distinct posts Tech/AI 52, NBA 55, Gaming 71, World 77; all four topics fresh through 11:54. World has 46 safe engaged candidates but no lexical shortlist; semantic selection remains pending.
- Updated TASKS and SOURCES with bounded evidence and caveats. No feature, activation, collection, inference, edition, schema or handbook behavior changes.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; healthz healthy and zero alerts. No paid verification calls.
- Next: Nov 4 15:00 UTC edition review takes priority; verify open-X yield/authors, Bluesky picks/screenshots, World posts, NBA outcome/logs and time. Grouping/incremental triage remain off.

## 2026-11-04: iteration 620 — optional observability capacity decision

- Started clean on main; no leftover work. Healthz healthy and zero alerts; Nov 4 15:00 UTC edition evidence not yet available.
- Assessed O11 against 24-hour local metrics: eight units at 422.10 MiB currently, aggregate sampled peak 548.72 MiB; mean CPU 1.435% of one core, maximum five-minute rate 2.550%.
- Decision 0004 defers tracing and a second proxy, retaining correlation logs/SSH access. Documents reproducible queries, missing samples, restarts/configuration changes, excluded overhead and isolated benchmark criteria; no candidate overhead claim.
- Updated plan/TASKS and corrected the handbook's stale planned-dashboard/browser-error note. Archived iteration 602 to keep PROGRESS below 25 KB.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts observability and git diff --check passed.
- Runtime observability check validated 476 structured records; latest immutable Nov 3 edition serves four topics; 36 sources without current errors, no retained failed digest jobs, zero alerts or dangling Docker volumes.
- Documentation only; no service restart per STEERING 22, no paid calls or source/edition/configuration changes. Handbook reads files per request.
- Next: Nov 4 scheduled edition review takes priority; grouping and incremental triage stay off pending that review. O11 remains optional/deferred, not installed.

## 2026-11-04: iteration 621 — deterministic concurrent LLM recordings

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 sources without current errors and no retained failed digest jobs.
- Fixed RecordingLlmAdapter to preserve invocation order when concurrent identical requests finish out of order; failed calls remain omitted. Offline regression reverses completions with a failed middle call, then verifies exact replay order and exhaustion.
- Updated LLM recording documentation and TASKS; archived iteration 604 to keep this file below 25 KB. Real raw-response golden remains open: validated historical results cannot supply raw transport responses.
- Verification: targeted recording tests 4/4; pnpm format, pnpm lint:fix, pnpm check (365 unit/205 isolated integration), pnpm build and git diff --check passed. First check caught formatting in the newly moved archive; fixed before the final run.
- Recorder is imported only by the explicit historical recording script; no running service code/config changed, so no restart under STEERING 22. No paid calls, prompts, fixture recordings, production flags or edition behavior changed.
- Next: Nov 4 15:00 UTC edition review; grouping and incremental triage remain off until that review.

## 2026-11-04: iteration 622 — refuse incomplete LLM recording exports

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 healthy sources and retained job checks green.
- Recording snapshots now refuse while provider calls are pending, preventing silently truncated replay fixtures. Settled failures release the guard without being recorded.
- Extended concurrent reversal regression to check partial exports; added synchronous-provider and malformed-response failure coverage. Updated TASKS and LLM recording documentation.
- Verification: targeted recording tests 5/5; pnpm format, pnpm lint:fix, pnpm check (366 unit/205 isolated integration), pnpm build and git diff --check passed.
- Explicit recording tool only; no running-service code/config changes, so no restart under STEERING 22. No paid calls, prompt changes, new recordings or production activations.
- Next: Nov 4 15:00 UTC edition review; grouping and incremental triage remain off pending that review. Real raw-response golden remains open.

## 2026-11-04: iteration 623 — preserve recording model identity across awaits

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 healthy sources and all 13 monitored services active.
- Fixed a recording race: model metadata is now captured alongside the invocation fingerprint before awaiting the provider; later caller mutations cannot leave an unreplayable model/fingerprint pair.
- Added an offline regression mutating both model and prompt during a pending call, then replaying the original request and rejecting the changed request. Updated LLM documentation and TASKS; archived iteration 605 to keep PROGRESS bounded.
- Verification: targeted recording tests 6/6; pnpm format, pnpm lint:fix, pnpm check (367 unit/205 isolated integration), pnpm build and git diff --check passed.
- Only the explicit historical recording script imports this adapter; no running-service code/config changes, so no restart under STEERING 22. No paid calls, recordings, prompt changes or production activations.
- Next: Nov 4 15:00 UTC edition review takes priority; grouping and incremental triage remain off. Real raw-response golden stays open.

## 2026-11-04: iteration 624 — measure the ideal article-cache remainder

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and no failed digest jobs. Retained 04:54 Bluesky failure is historical; later hourly jobs completed.
- Extended the offline concurrency tool with an ideal article-cache scenario: remove only candidate-triage calls, retaining social/editorial, failed and unknown-purpose work. Added partition/failure regressions and pinned the recorded Nov 3 result.
- Recorded result: 26 remaining calls, 294,225 ms aggregate HTTP time; four-slot lower bound 73,557 ms, longest-first 75,650 ms. Article pretriage alone cannot meet 60 s at four slots with these fixed observations; dependencies and non-provider work are excluded, so this is not a production speed prediction.
- Updated TASKS and RANKING; archived iteration 606 to keep PROGRESS bounded. No prompts, paid calls, fixture recordings, production settings or provider concurrency changes.
- Verification: pnpm exec tsx --test apps/api/test/call-concurrency.test.ts (4/4); offline CLI; pnpm format, pnpm lint:fix, pnpm check (368 unit/205 isolated integration), pnpm build and git diff --check passed. Healthz healthy; zero dangling Docker volumes.
- Offline analysis only; no running-service code/config changed, so no restart under STEERING 22. Grouping and incremental triage remain off.
- Next: review Nov 4 15:00 UTC edition as soon as available; inspect open-X/Bluesky picks, World coverage, NBA validation and live timing before activation decisions.

## 2026-11-04: iteration 625 — attribute the recorded provider remainder

- Started clean on main; no leftover work. Healthz healthy, zero alerts, source/service checks green and retained collection jobs completing. Nov 4 15:00 UTC edition evidence remains pending.
- Added exact-purpose call/failure/aggregate/longest-duration breakdowns to the offline concurrency report, retaining unknown purposes and failed HTTP work with deterministic ordering.
- Nov 3 ideal article-cache remainder: story editing 144,055 ms (49.0%), social triage 83,770 ms (28.5%), social editing 66,400 ms (22.6%). Editorial work is 71.5%; HTTP success does not establish output validation or explain NBA fallback/retries.
- Pinned recorded totals and synthetic partition/failure/zero-duration coverage; updated TASKS and RANKING. Archived iteration 607 to keep PROGRESS bounded.
- Verification: targeted concurrency tests 5/5; offline CLI; pnpm format, pnpm lint:fix, pnpm check (369 unit/205 isolated integration), pnpm build and git diff --check passed. First check stopped on new archive formatting; corrected and reran successfully.
- Healthz healthy and zero alerts after checks. Offline tool only: no running-service code/config changed, so no restart under STEERING 22; no paid calls, prompts, sources or production activations.
- Next: prioritize Nov 4 scheduled edition review (World posts, open-X/Bluesky, NBA validation and live timing). Grouping and incremental triage remain off pending that review.

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
- Next: Nov 4 15:00 UTC edition review takes priority: World posts, open-X/Bluesky selections, NBA validation and live timing/cost; compare the new completion metadata with this baseline.
