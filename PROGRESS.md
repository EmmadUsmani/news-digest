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
