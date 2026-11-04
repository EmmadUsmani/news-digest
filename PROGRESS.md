## 2026-11-04: iteration 581 — convert topic coverage to Drizzle

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 healthy sources and zero failed digest jobs. Latest Bluesky/free-social collections succeeded; Nov 4 scheduled review remains pending.
- Converted topic-coverage discovery unions and correlated counts to typed Drizzle, preserving distinct routes, disabled/empty topics, source-health bounds, publication windows and ordering. Explicit numeric decoding preserves count types.
- Existing characterization assertions unchanged, including non-UTC sessions and both DST transitions. Typecheck caught nullable union topics; a read-only live comparison caught an ambiguous platform alias, fixed before final verification.
- Live old/new comparison in one repeatable-read transaction matched all four topics exactly: article counts 313/120/295/276, X posts 67/18/7/1. No data writes, migrations, activation or paid calls.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 564 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; topic-coverage statement coverage 100%, zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, root HTTP 200, live Status coverage valid, 36 sources without errors and zero alerts. Published edition byte-identical after restart.
- Next: prioritize Nov 4 scheduled review at 15:00 UTC; otherwise continue remaining ORM adapters or historical migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 582 — convert digest preview repository to Drizzle

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 sources without errors and no failed digest jobs. Latest hourly Bluesky collection succeeded; Nov 4 scheduled review remains pending.
- Converted latest/find/history, enabled-topic selection and snapshot publication to typed Drizzle. Preserved session lock before repeatable-read snapshot, scheduled dedupe, rollback, unlock and client release; candidate loaders unchanged.
- Read-only live old/new latest/find/history comparison matched exactly, including pagination and ISO timestamps. Existing characterization assertions unchanged. No migration, activation or paid call.
- Updated TASKS, architecture, decision and handbook stack; archived iterations 565–566. Initial check stopped on new archive formatting; corrected before final verification.
- Publication stub initially recognized only raw-SQL topic reads/inserts; adapted its query-object array rows/JSON parameters without changing assertions. Eight targeted publication tests then passed against isolated services; direct unisolated invocation was correctly blocked by the test guard.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, published edition byte-identical. Playwright rendered 15 story cards with zero page errors; 36 sources without errors, zero failed digest jobs and zero alerts.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise continue remaining ORM adapters/candidate loaders or migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 583 — convert shared article candidates to Drizzle

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 sources without current errors and zero failed digest jobs; Nov 4 15:00 UTC evidence still pending.
- Converted the shared publication/reaction/incremental-triage article loader to typed joins, filters, grouping, ordering and limit. Preserved half-open windows, distinct sorted sources, engagement conversion and the existing 200-item cap; ordered array aggregation retains a documented SQL template.
- Read-only old/new comparison in one repeatable-read live transaction matched all four topic pools exactly (200/122/200/200 candidates). First probe needed a CommonJS async wrapper; corrected and removed temporary files.
- Updated three query stubs for Drizzle array rows and timestamp parameters without changing assertions. First check caught the remaining old incremental stub; corrected before final full check.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 567. No migrations, paid calls, feature activation or UI changes.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed. Loader statement coverage 100%; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical. Playwright found 19 rendered list cards and zero page errors; 36 sources without current errors, zero failed digest jobs and zero alerts.
- Next: prioritize Nov 4 scheduled review at 15:00 UTC; otherwise continue remaining ORM adapters or migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 584 — convert incremental-triage admission to Drizzle

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and zero failed digest jobs. Retained ingestion/social failures remain with current successful collection; Nov 4 edition review pending.
- Converted session advisory acquisition/release to Drizzle on the same checked-out client. PostgreSQL lock functions retain documented SQL templates; contention, error listening, destruction of failed sessions and idempotent cleanup unchanged.
- Existing isolated characterization passed unchanged, including independent workers, loader failure, terminated backend and stale cleanup preserving a successor lock. No migration, activation or paid call; incremental triage stays off.
- Updated TASKS, architecture, decision and handbook stack; archived iterations 568–569 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed. No dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical. Playwright rendered four topics/19 cards with zero page errors; 36 sources without current errors, zero failed digest jobs and zero alerts.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise continue remaining ORM adapters or migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 585 — convert LLM usage reads to Drizzle

- Started clean on main; no leftover work. Healthy healthz, zero alerts, 36 sources without current errors and zero failed digest jobs. Retained ingestion/social failures have newer successful collection; Nov 4 edition review remains pending.
- Converted usage totals, purposes, models, provider blocks and model allocation reads to typed Drizzle. Filtered aggregates retain documented templates; unresolved holds still count across budget periods and caller transaction clients remain supported.
- Read-only old/new comparison in one live repeatable-read transaction matched both plain and model-allocation caps exactly. Database-clock probe caught Drizzle timestamp strings; explicit date conversion fixed it. Initial typechecks caught clock builder/nullability issues, corrected before final checks.
- Existing characterization assertions unchanged; usage reader statement coverage 100%. No migrations, activations or paid calls.
- Updated TASKS, architecture, decision and handbook stack; archived iterations 570–571 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical. Playwright root rendered 63 article elements with zero page errors; 36 sources without errors, zero failed digest jobs and zero alerts.
- Next: prioritize Nov 4 15:00 UTC scheduled review; otherwise continue remaining ORM adapters or migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 586 — convert topic repository to Drizzle

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 sources without current errors and zero failed digest jobs; Nov 4 15:00 UTC edition evidence pending.
- Converted topic CRUD, catalog/feed registration, connections and ordering to typed Drizzle. Preserved parent/topic row locks, catalog advisory lock, limits, JSON omission behavior and transaction rollback; native constraint errors remain exposed.
- Ordered source JSON, window positions and bulk ordinality retain documented SQL templates. No migration, activation, paid call or UI change; owner database grants untouched.
- Existing assertions unchanged. Initial typecheck caught an aliased field type; first integration run found an unqualified derived position during deletion (and three downstream failures from unrestored test settings). Qualified the field; fresh full check passes all cases.
- Read-only new repository comparison matched all four live topics. After deployment, topic values match (JSON key order differs), and saved edition is byte-identical.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 572 to keep PROGRESS bounded. Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes. Topic statements 98.94% covered.
- Restarted API/worker outside freeze; both active, healthz healthy. Playwright root: 63 article elements, zero page errors. All 36 sources without current errors, zero failed digest jobs and zero alerts.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise continue remaining ORM adapters or migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 587 — convert X verification/discovery to Drizzle

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 sources without current errors and zero failed digest jobs; Nov 4 15:00 UTC edition review pending.
- Converted social repository topic reads, discovery sources/citations, verification URL unions, post/check upserts and missing-time recovery to typed Drizzle. Candidate citation/window-ranking query retains a documented template for topic fairness and refresh priority.
- Preserved transaction rollback/native errors, citation URL coalescing, immutable discovery fields, conditional missing-time updates and Date return values. No migration, activation or paid call; owner grants untouched.
- Read-only old/new live comparison matched 623 topic-post associations across four topics, discovery sources, 20 verification URLs and candidate limits 1/8/50. Temporary comparison files removed.
- Initial typecheck caught existing string timestamp contracts; fixed before checks. First full check stopped on handbook table formatting; formatted and reran successfully. Existing test assertions unchanged; social repository statement coverage 100%.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Updated TASKS, architecture, decision and handbook stack. Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical. Post-restart Playwright rendered four digest sections/19 article elements with zero page errors; 36 sources without errors, zero failed digest jobs and alerts.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise continue remaining ORM adapters or migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 588 — convert operations source status to Drizzle

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 error-free sources and zero failed digest jobs; Nov 4 15:00 UTC edition review pending.
- Moved operations source reads into a database adapter using typed Drizzle joins, counts and correlated enabled-topic existence. Preserved empty sources, ordering, observation counts and HTTP UTC timestamps; queue telemetry unchanged.
- Read-only old/new comparison matched all 36 live source rows in one repeatable-read snapshot. No migration, activation, paid call or UI change; owner grants untouched.
- Existing characterization assertions unchanged; new reader statement coverage 100%. Initial typechecks caught timestamp contract and untyped EXISTS results; fixed with UTC normalization and boolean decoder. First otherwise-green check stopped on newly archived progress formatting; corrected before final run.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 573 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical. Playwright root: 63 article elements, zero page errors. All 36 sources error-free, zero failed digest jobs and zero alerts.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise continue remaining ORM adapters or migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 589 — convert social selection/citation reads to Drizzle

- Started clean on main; no leftover work. Healthy healthz, zero alerts, 36 error-free sources and zero failed digest jobs. Recent social collections completed; two historical Bluesky failures remain retained.
- Moved social selection and citing-story reads into a typed Drizzle database adapter. Preserved publisher transaction reuse, four citation paths, half-open windows, engagement cutoff/tie ordering, 500-post cap and distinct selected-story links; ranking unchanged.
- Read-only old/new comparison matched 91 live posts across all four topics in one repeatable-read snapshot. No migration, activation, source, paid call or owner grant change.
- Initial typecheck caught the partial-client type; aligned with existing adapter casting. First full suite found one object-row unit stub; updated to Drizzle array rows without changing assertions. Targeted ranking tests passed.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 574 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; selection reader statement coverage 100%, zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical. Playwright root: four digest sections/19 article elements, zero page errors; zero alerts.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise continue remaining ORM adapters or migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 590 — convert article topic settings reads to Drizzle

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 healthy sources and zero failed digest jobs; Nov 4 15:00 UTC review remains pending.
- Moved reaction-story and incremental-triage topic settings into a shared typed Drizzle database reader. Preserved independent post/story budgets, enabled filters, transaction reuse, guidance, validation and ranking.
- Existing PostgreSQL characterization assertions unchanged; unit stubs now supply positional Drizzle rows/bound filters. Three targeted tests passed. Read-only old/new comparison matched both reads for all four live topics; temporary script removed after correcting its CommonJS async wrapper.
- No migration, activation, source, paid call or owner grant change. Updated TASKS, architecture, decision and handbook stack; archived iteration 575 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; reader statement coverage 100%, zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical. Playwright root rendered four digest sections/19 article elements with zero page errors; zero alerts.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise remaining ORM adapters or historical migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 591 — convert budget-day schedule reader to Drizzle

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 error-free sources and zero failed digest jobs; Nov 4 15:00 UTC review remains pending.
- Moved the budget-day schedule projection from its public facade into a typed Drizzle database reader. Reuses the admission transaction and preserves FOR SHARE locking, UTC/DST occurrence resolution and missing-schedule failure; no migration or budget-policy change.
- Existing characterization assertions unchanged: concurrent schedule updates remain blocked, DST-day admission stays correct and missing schedules release connections safely. No paid calls, activation, source change or owner grant change.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 576 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical. Read-only Playwright root rendered four digest sections/19 articles without page errors; zero alerts. Latest Bluesky 07:54 UTC and free-social 07:38 UTC runs completed.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise remaining ORM adapters or historical migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 592 — convert reserve-status snapshot reads to Drizzle

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 healthy sources and zero failed digest jobs; Nov 4 15:00 UTC edition review remains pending.
- Moved usage-report database clock, budget-day state and latest completed outcome reads into a typed Drizzle database adapter. Preserved the facade's repeatable-read transaction, shared ledger lock, reserve policy, ordering and rollback/client release.
- Existing characterization assertions unchanged. Read-only old/new comparison matched live day state, last outcome and database clock; temporary script removed. No migration, activation, source change or paid call.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 577 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; reader statement coverage 100%, zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical. Read-only Playwright confirmed four digest topics/15 digest articles and no page errors; corrected the initial section selector to match article markup. Zero alerts; latest free-social run completed 08:39 UTC.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise remaining ORM adapters or historical migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 593 — convert LLM ledger completion and cache operations

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and zero failed digest jobs; Nov 4 15:00 UTC edition review remains pending.
- Converted settlement, failure transitions, provider-block inserts and cache reads/inserts to typed Drizzle. Preserved pending-only updates, database transaction time, UTC month, shared failure lock/rollback and first-writer JSON cache semantics. Reservation SQL remains to convert.
- Existing characterization assertions unchanged; no migration, activation, source change or paid call. Updated TASKS, architecture, decision and handbook stack; archived iteration 578 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed. Ledger statement coverage 96.83%; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical. Read-only Playwright rendered 63 article elements without page errors; zero alerts. Initial latest-edition probe used an incorrect route (404), corrected to /api/digest-previews/latest.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise remaining ORM adapters or historical migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 594 — convert LLM reservation admission to Drizzle

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 healthy sources and zero failed digest jobs; Nov 4 15:00 UTC edition review remains pending.
- Converted provider-block, usage totals, verification/model allowance, scheduled-slot reads and pending reservation inserts to Drizzle under the same client transaction and shared lock. Conditional CASE sums retain documented SQL templates; older pending/uncertain holds and reserve policy are unchanged.
- Existing database characterization assertions unchanged. Updated the logging unit stub for Drizzle query/array rows after its SQL-format assumption failed; targeted regression and final full check pass. An intermediate check caught archive formatting; corrected before final green run.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 579. No migration, activation, source change or paid call.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed. Ledger statement coverage 97.13%; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical. Read-only Playwright rendered four digest topics/19 article entries without page errors; zero alerts.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise remaining ORM adapters or historical migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 595 — convert X discovery ledger completion writes

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and zero failed digest jobs; Nov 4 15:00 UTC review remains pending.
- Converted verification completion, settlement, failure transitions and depleted-credit block inserts to Drizzle. Preserved the client transaction/shared lock, first verification timestamp, terminal-state guards, uncertain settlement and estimate-exceeded comparison. Admission/totals remain for a later step.
- Existing characterization tests unchanged; no migration, activation, source change or paid call. Updated TASKS, architecture, decision and handbook stack; archived iteration 580 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy and saved edition byte-identical. Read-only Playwright rendered 19 article elements without page errors; zero alerts. Latest free-social run completed 08:54 UTC.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise remaining ORM adapters or historical migration baseline. Private pg_dump before first new migration.
