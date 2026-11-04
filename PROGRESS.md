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

## 2026-11-04: iteration 596 — convert X discovery totals and reservation inserts

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and zero failed digest jobs; retained social failures have later successful collections. Nov 4 15:00 UTC review remains pending.
- Converted budget totals/provider-block projection and pending reservation inserts to Drizzle under the same client transaction/shared lock. Documented conditional PostgreSQL aggregates preserve UTC day/month bounds, failed exclusion and older pending/uncertain holds. Scheduled optional-search admission remains SQL.
- Existing characterization tests unchanged; no migration, activation, source change or paid call. Initial typecheck caught the provider-block singleton column name; corrected before full check. Updated TASKS, architecture, decision and handbook stack; archived iteration 581.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical and live X budget snapshot unchanged. Read-only Playwright rendered 63 article elements without page errors; zero alerts and no source errors.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise remaining ORM adapters/admission or historical migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 597 — convert scheduled X admission to Drizzle

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources returning items without current errors and zero failed digest jobs; recent social collections succeeded after retained historical failures. Nov 4 15:00 UTC review remains pending.
- Converted scheduled X admission to typed correlated Drizzle subqueries: consumed topic/day attempts, enabled topics, completed open parents, classified citations, fewer than three new verified posts and all-topic completion. Preserved the client transaction/shared budget lock, UTC database clock and optional-slot semantics.
- Existing characterization assertions unchanged. Initial typecheck caught alias-column and projection typing; corrected before green full check. No migration, activation, source change or paid call.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 582 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical and live X budget unchanged. Read-only Playwright rendered 63 article elements without page errors; zero alerts and no source errors. Initial status probe used an incorrect route (404), corrected to /api/status.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise remaining ORM adapters/transaction infrastructure or historical migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 598 — Drizzle scheduled-budget transactions

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources returning items without current errors and zero failed digest jobs; Nov 4 15:00 UTC review pending.
- Converted scheduled-budget lifecycle transaction control to Drizzle on the same checked-out client. Shared Anthropic advisory lock, post-commit logs, rollback, client release and PostgreSQL error identity remain intact.
- Adapted nested-fixture and logging stubs to driver query objects/lowercase transaction commands; behavior assertions unchanged. Initial check caught archive formatting, then the logging stub casing; corrected and reran green.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 583. No migration, feature activation, source change or paid call.
- Verification: pnpm format, pnpm lint:fix, targeted reserve-lifecycle-logging test, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy and saved edition byte-identical. Read-only Playwright rendered four topics/19 articles without page errors; no current source errors or failed digest jobs.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise remaining ORM transaction infrastructure or historical migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 599 — Drizzle X discovery ledger transactions

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and zero failed digest jobs. Retained social failures have subsequent successful collections; Nov 4 15:00 UTC review remains pending.
- Converted X discovery ledger transaction control to Drizzle on the same checked-out client. Shared X advisory lock, all ledger queries, rollback, client release and original PostgreSQL error causes remain intact.
- Existing characterization assertions unchanged; ledger statements 100% covered. No migration, activation, source change or paid call; owner database grants untouched.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 584 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical and X budget snapshot unchanged. Read-only Playwright rendered four topics/19 stories without page errors; zero alerts, source errors or failed digest jobs.
- Push: first attempt rejected by Git integration with `fatal error in commit_refs_rules`; immediate retry pushed d75df35 successfully.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise remaining ORM adapters/transaction infrastructure or historical migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 600 — Drizzle Anthropic ledger transactions

- Started clean on main; no leftover work. Healthy healthz, 36 sources without current errors and zero failed digest jobs. Initial pending metrics-memory warning cleared on the next snapshot; Nov 4 15:00 UTC review remains pending.
- Converted Anthropic ledger admission/failure transaction control to Drizzle on the same checked-out client, preserving the shared budget lock, rollback, client release and original PostgreSQL error causes. Admission/refusal logs remain after successful commit.
- Existing characterization assertions unchanged; logging stub accepts Drizzle transaction-command casing. No migration, activation, source change or paid call; owner database grants untouched.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 585. First full check stopped on archive formatting; corrected and reran green.
- Verification: pnpm format, pnpm lint:fix, targeted reserve-logging test, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical and X budget snapshot unchanged. Read-only Playwright rendered without page errors; zero current source errors or failed digest jobs.
- Push: Git integration initially rejected main with Internal Server Error; immediate retry successfully pushed 18e3eb6.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise remaining ORM adapters/transaction infrastructure or historical migration baseline. Private pg_dump before first new migration.

## 2026-11-04: iteration 601 — Drizzle LLM usage snapshot transaction

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 active sources without current errors and zero failed digest jobs; Nov 4 15:00 UTC review pending.
- Moved the public LLM usage snapshot into a database adapter with a Drizzle-managed repeatable-read transaction. All readers retain the same checked-out client and Anthropic advisory lock; rollback, client release and original PostgreSQL errors remain intact.
- Existing characterization assertions unchanged, including failed-read rollback, lock release and single-client retry; snapshot adapter statements 100% covered. No migration, activation, source change or paid call; owner database grants untouched.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 586. First full check stopped on PROGRESS formatting after archival; corrected and reran green.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active and healthz healthy. Saved edition byte-identical, LLM reserve and X snapshot unchanged. Read-only Playwright rendered four topics/19 stories without page errors; zero current source errors or failed digest jobs. A pending metrics-memory warning cleared on the 09:54 UTC snapshot; final alerts zero.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise remaining ORM adapters/transaction infrastructure or historical migration baseline. Private pg_dump before first new migration.
- Push: initial d30f491 push rejected by Git integration with Internal Server Error; retry successfully pushed d30f491 without changing history.

## 2026-11-04: iteration 602 — Drizzle digest publication transaction

- Started clean on main; no leftover work. Healthy healthz, 36 active sources without current errors and zero failed digest jobs; Nov 4 15:00 UTC review pending.
- Converted digest publication to a Drizzle-managed repeatable-read transaction on the checked-out client. Scheduled session locking still precedes the snapshot; commit/rollback precedes unlock/release, preserving retry visibility and dedupe.
- Existing characterization assertions unchanged; logging stub normalizes transaction-command casing. No migration, activation, source change or paid call; owner database grants untouched.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 587.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes. Direct targeted test invocation was blocked by the isolation guard; full isolated suite passed.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical and LLM/X budget snapshots unchanged. Read-only Playwright rendered all four topics without page errors after correcting the check's topic label; no UI change.
- Final service snapshot: zero current source errors or failed digest jobs. Metrics-memory warning recurred after testing; restarted the unhealthy metrics service to clear expendable caches, reducing memory from 103 MiB to 34 MiB. Fresh evaluation at 10:04 UTC cleared the alert; final alerts zero.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise remaining ORM adapters or historical migration baseline. Private pg_dump before first new migration.
- Push: initial 493be5b push rejected by Git integration with `fatal error in commit_refs_rules`; retry successfully pushed 493be5b without rewriting history.

## 2026-11-04: iteration 603 — Drizzle X discovery evidence report

- Started clean on main; no leftover work. Zero alerts, healthy services, 36 sources without current errors and zero failed digest jobs; Nov 4 15:00 UTC review pending.
- Converted daily X discovery evidence to Drizzle typed SQL; lateral JSON/correlated aggregates retain the existing query with bound UTC dates. Caller connection reuse and native PostgreSQL error causes remain intact.
- Read-only old/new comparison matched three live UTC days/five calls in one repeatable-read snapshot. It caught Drizzle string timestamps; restored Date values and pinned that contract in the existing isolated report test.
- Initial check caught the in-progress timestamp edit/type constraint; final full check passed. No migration, activation, source change or paid call; owner grants untouched.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 588 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; active and healthz healthy. Saved edition byte-identical and budget snapshots unchanged. Read-only Playwright rendered four topics without page errors; 36 sources without current errors, zero failed digest jobs and zero alerts.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise historical migration baseline or remaining ORM infrastructure. Private pg_dump before first new migration.

## 2026-11-04: iteration 604 — enforce the direct PostgreSQL boundary

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and zero failed digest jobs; Nov 4 15:00 UTC review pending.
- Moved health and console startup probes to shared Drizzle connectivity checking in libs/db. Console retains its owner-requested SQL helper and shutdown behavior.
- ESLint now rejects runtime pg imports and direct dot/bracket query calls outside libs/db; connection type imports remain allowed. Explicit positive/negative lint probes passed; no application direct query calls remain outside libs/db.
- Initial typecheck caught the console's query-only wrapper; added its connectivity method without exposing the pool. Final full check passed. No migration, activation, source change or paid call; owner grants untouched.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 589.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; both active, healthz healthy, saved edition byte-identical and LLM/X budget snapshots unchanged. Read-only Playwright rendered four digest topics without page errors; 36 error-free sources, zero failed digest jobs and zero alerts.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise historical Drizzle migration baseline. Private pg_dump before first new migration.
- Push: Git integration rejected two pushes of 082145b with `Internal Server Error` at 10:20–10:21 UTC; local services run the verified commit. Recording the failure before a final retry; no history or remote changes.
