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

## 2026-11-04: iteration 605 — historical Drizzle migration baseline

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and zero failed digest jobs; Nov 4 15:00 UTC review pending.
- Committed the generated schema snapshot/journal after migrations 001–055 with a no-op baseline SQL file; historical migrations still create schema and seed data. Added an offline drizzle-kit generation config.
- Added snapshot-to-schema and real CLI zero-diff generation gates using a temporary copy. No production migration, activation, source change, paid call or owner grant change.
- First full check exposed drizzle-kit's absolute output-path bug in the new test and forced mirror-database teardown failure. Used relative output and normal DROP DATABASE; catalog and baseline gates passed on rerun. Existing characterization assertions unchanged.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 590. Generated migration execution remains unwired; private pg_dump required before first new migration.
- Verification: pnpm format, pnpm lint:fix, final pnpm check (364 unit/204 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; active and healthz healthy. Saved edition byte-identical, LLM/X budget snapshots unchanged. Read-only Playwright rendered four real saved-edition topics without page errors after scoping a duplicate heading locator; no UI changes.
- Final snapshot: 36 sources without current errors, zero failed digest jobs and zero alerts.
- Next: prioritize Nov 4 15:00 UTC edition review; otherwise connect generated migrations to the atomic historical runner, preserving history, data and owner grants.

## 2026-11-04: iteration 606 — connect generated migrations to the atomic runner

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and zero failed digest jobs; Nov 4 15:00 UTC review pending.
- Extracted the existing migration transaction/lock into a reusable runner. Historical SQL executes first, then generated SQL in journal order; generated names use a drizzle/ prefix in the existing ledger. No second ledger or schema change.
- Added isolated migration coverage for seed preservation, multi-statement generated DDL/data, concurrent reruns, unchanged ledger timestamps, atomic DDL/data/ledger rollback and recovery. Existing characterization assertions unchanged.
- Took a private mode-600 pg_dump at ~/.local/state/news-digest/backups/iteration-606-before-drizzle.dump; archive catalog readable. Applied only the SELECT 1 baseline with pnpm migrate; second run applied nothing. Owner grants unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Saved edition byte-identical and LLM/X budget snapshots unchanged. Read-only Playwright rendered all four real saved-edition topics without page errors. Healthz healthy, 36 error-free sources, zero failed digest jobs and zero alerts.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 591. No runtime service code/config changed, so services stayed running under STEERING 22; migration CLI deployed directly. No paid calls or activation.
- Next: prioritize Nov 4 15:00 UTC review; otherwise finish remaining ORM adapters/final raw-SQL audit. Keep private backups before new schema migrations and preserve owner grants.

## 2026-11-04: iteration 607 — typed latest-content query

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 15:00 UTC review remains pending.
- Converted the content repository's latest-items joins, filters, grouping, source aggregation, ordering and per-topic five-item limit to Drizzle builders. Only nested JSON aggregation remains a documented SQL expression.
- Preserved empty topics and PostgreSQL JSON timestamp representation; existing characterization assertions unchanged. No schema, source, activation, owner grant or paid call changes.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker outside freeze; live content JSON exactly matches the prior snapshot, saved edition unchanged and LLM/X spend totals unchanged. Read-only Playwright rendered four real saved-edition topics without page errors.
- Healthz healthy, 36 sources without current errors, zero failed digest jobs and zero alerts. Updated TASKS and ORM decision; archived iteration 592 to keep PROGRESS bounded. No handbook system behavior changed.
- Next: prioritize Nov 4 edition review; otherwise remaining ORM adapters and final SQL audit. Keep private backups before new migrations and preserve owner grants.

## 2026-11-04: iteration 608 — typed social verification candidates

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 15:00 UTC edition review remains pending.
- Converted social verification candidate CTEs, citation unions, joins, filters and final grouping/ordering to Drizzle builders. SQL expressions retain window ranking, aggregates, provenance labels and cooldown arithmetic.
- Preserved topic fairness, unverified-before-refresh priority, all four citation channels, deduplication and 1–50 limit bounds. Existing characterization assertions unchanged; live old/new comparison matched ordered IDs at requested limits 0, 1, 4, 50 and 500.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; healthz healthy, saved edition byte-identical, Anthropic/X spending unchanged. Read-only Playwright rendered four real saved-edition topics without page errors; 36 sources without current errors and zero failed digest jobs.
- Updated TASKS and ORM decision; archived iteration 593 to keep PROGRESS bounded. No schema, source, activation, owner grant or paid call changes; no handbook system behavior changed.
- Next: prioritize Nov 4 edition review; otherwise publisher article-discovery adapter and final SQL audit. Keep private backups before new migrations and preserve owner grants.

## 2026-11-04: iteration 609 — typed publisher article-discovery candidates

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 15:00 UTC edition review remains pending.
- Converted publisher candidate CTEs, joins, correlated host-backoff subquery, filters, grouping and ordering to Drizzle builders. SQL expressions retain window ranks, aggregate minima and interval/host calculations.
- Preserved publisher/topic fairness, exact host opt-in, cooldowns, enabled-topic checks and eight-item bound. Existing characterization assertions unchanged; live read-only old/new comparison matched all eight ordered candidates.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; healthz healthy, saved edition byte-identical, Anthropic/X spend totals unchanged. Read-only Playwright rendered all four real saved-edition topics without page errors; 36 sources without current errors, zero failed digest jobs and zero alerts.
- Updated TASKS and ORM decision; archived iteration 594 to keep PROGRESS bounded. No schema, source, activation, owner grant or paid call changes; no handbook system behavior changed.
- Next: prioritize Nov 4 edition review; otherwise final raw-SQL audit and remaining ORM adapters. Keep private backups before new migrations and preserve owner grants.

## 2026-11-04: iteration 610 — typed X discovery report queries

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 15:00 UTC edition review remains pending.
- Converted curated-handle/verified-post CTEs and the report's call projection, UTC bounds and ordering to Drizzle builders. The documented per-topic lateral JSON/selection aggregate remains a SQL expression.
- Read-only old/new comparison caught stripped outer-column qualification; explicitly qualified correlated references, then matched complete Nov 2–4 reports (1/4/0 calls) within one repeatable-read snapshot. Existing characterization assertions unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker outside freeze; healthz healthy, saved edition byte-identical, Anthropic/X spend unchanged. Read-only Playwright rendered four real saved topics without page errors; 36 sources without current errors, zero failed digest jobs and zero alerts.
- Updated TASKS and ORM decision; archived iteration 595 to keep PROGRESS bounded. No migration, source, activation, owner grant or paid call changes; no handbook system behavior changed.
- Next: prioritize Nov 4 edition review; otherwise finish remaining report SQL builders and final raw-SQL audit. Keep private backups before new migrations and preserve owner grants.

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
