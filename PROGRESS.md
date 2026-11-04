## 2026-11-04: iteration 564 — characterize final Bluesky snapshot failure

- Started clean on main; no leftover work. Healthz passed, 36 sources have no current errors, no failed digest jobs and zero alerts. Nov 4 scheduled evidence remains pending.
- Added isolated snapshot-table constraint failure after the current-post upsert. Rollback preserves current metadata and both topic histories; removing the constraint permits retry and idempotent replay without changing the other topic.
- Updated TASKS and database verification notes. No provider requests, production changes or restart required under STEERING 22.
- Verification: pnpm format, pnpm lint:fix and pnpm check passed (363 unit/196 isolated integration); pnpm build and git diff --check passed. Archived iteration 545 to keep PROGRESS small.
- Next: prioritize Nov 4 15:00 UTC edition review; grouping/incremental triage stay gated. Repository characterization and recorded-response golden remain open.

## 2026-11-04: iteration 565 — pin Bluesky publisher transaction reads

- Started clean on main; no leftover work. Healthz and alerts green; Nov 4 scheduled evidence remains pending.
- Added isolated regression through the publisher-facing observation reader: transaction-local topic disabling and snapshot deletion are visible only inside that transaction; rollback restores reads. Independent repository reads retain committed configuration/history.
- Updated TASKS and database verification notes. No provider requests or production changes; no restart under STEERING 22.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/197 isolated integration) and pnpm build passed. Final healthz healthy, alerts clear and zero dangling Docker volumes.
- Next: prioritize Nov 4 15:00 UTC edition review; grouping and incremental triage remain gated. Repository characterization and recorded-response golden remain open.
- Push initially rejected because owner commit 13d9e7d arrived; merged without rewriting history. New STEERING 29 prioritizes production console during downtime and stops further characterization beyond ORM needs. Next iteration follows that queue.

## 2026-11-04: iteration 566 — production console

- Started clean on main; no leftover work. Healthz and alerts green; 36 sources error-free. Nov 4 scheduled evidence still pending.
- Followed STEERING 29: pnpm console loads the owner env file and starts an isolated Nest application context with repositories, tokens, app/get and db.query, a production prompt and history outside the repo.
- Isolated regression blocks startup timers, listeners and network connections, then checks real repository/SQL bindings against disposable Postgres. Initial alias/token overwrite and import ordering caught and fixed.
- Live read-only REPL smoke returned four topics and matching repository token/alias; history mode 600. No provider calls, schema changes or edition activation.
- Updated TASKS and handbook Operations; check-handbook passed (17 pages, one unchanged diagram, 25 tables). Archived iteration 546 to keep PROGRESS small.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/198 isolated integration), pnpm build and git diff --check passed. Final healthz green, zero alerts and dangling Docker volumes.
- No service restart under STEERING 22: console-only entry points are not loaded by running services.
- Next: Nov 4 15:00 UTC edition review first; otherwise STEERING 29 ORM prerequisite review, then one repository conversion with 2a green.

## 2026-11-04: iteration 567 — ORM prerequisite query inventory

- Started clean on main; no leftover work. Healthz healthy and zero alerts; Nov 4 15:00 UTC edition evidence pending.
- Reviewed ORM prerequisites under STEERING 29. Inventoried adapter suites and SQL outside database directories; these facades must be included in the eventual conversion.
- Found incremental-triage/reaction topic reads had only fake query tests. Added isolated PostgreSQL coverage for independent budgets, disabled/deleted topics, transactional configuration, source dedupe, exact non-UTC windows and semantic versus lexical eligibility.
- Clarified that the existing synthetic fixed-input edition golden satisfies the 2a golden clause; real raw-response recording remains a separate item 4 gap. 2a source/behavior reconciliation stays open; no premature ORM start.
- Updated TASKS/database verification notes and archived iteration 547. No provider calls, production changes or restart under STEERING 22.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/199 isolated integration), pnpm build, final pnpm typecheck/format:check and git diff --check passed. Live healthz/alerts green, 36 sources error-free, zero dangling Docker volumes.
- Next: Nov 4 scheduled review first; otherwise finish concrete ORM prerequisite reconciliation, avoiding unrelated characterization tests.

## 2026-11-04: iteration 568 — expose public SQL coverage and concrete ORM gaps

- Started clean on main; no leftover work. Healthz healthy, zero alerts; Nov 4 edition review remains pending.
- Expanded isolated integration coverage to all six SQL-bearing public facades, previously absent from the report. All source database adapters appear; documented health/console/migration coverage separately.
- Reconciled facade results with actual assertions. Concrete remaining 2a risks: usage rollback/release, missing schedule, social engagement as-of observation and tied-call ordering. No ORM conversion or unrelated characterization added.
- Updated TASKS/database verification and archived iteration 548. No provider calls or production changes; no restart under STEERING 22.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/199 isolated integration) and pnpm build passed. Final healthz/alerts green and zero dangling Docker volumes.
- Next: Nov 4 scheduled review first; otherwise close the three concrete prerequisite gaps before starting 2b.

## 2026-11-04: iteration 569 — usage failure cleanup before ORM

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 sources without current errors and no failed digest jobs; Nov 4 15:00 UTC review still pending.
- Added isolated PostgreSQL regression for missing default schedule, both directly and through usage reporting. Failure must return the only pooled client and release the shared ledger lock to an independent session; restoring the schedule permits retry.
- Updated TASKS/database verification; the remaining concrete 2a prerequisite is social engagement as-of/tied-call ordering. No ORM conversion or provider calls.
- Archived iteration 549 to keep PROGRESS small. No source/schema/UI/handbook flow change; no service restart under STEERING 22 because running code/config is unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/200 isolated integration), pnpm build and git diff --check passed. API/worker active, healthz healthy, zero alerts and dangling Docker volumes.
- Next: Nov 4 scheduled edition review first; otherwise close social engagement snapshot ordering before 2b.

## 2026-11-04: iteration 570 — recover rejected Bluesky sessions; close ORM prerequisite

- Started clean on main; no leftover work. Zero alerts and healthy healthz; 36 sources healthy and no failed digest jobs. Nov 4 15:00 UTC evidence pending.
- Triage found a newer 04:54 Bluesky failure: search HTTP 400 followed by refresh HTTP 400. Clear cached session on rejected refresh so the next collection signs in again; no immediate login retry. Fake next-call recovery passes.
- Free read-only official probe authenticated and returned Tech/AI 48, NBA 48, Gaming 49 and World 50 real posts; no writes or paid calls. Sustained hourly recovery remains to verify.
- Added isolated PostgreSQL assertions for engagement cutoff (inclusive/non-UTC), ascending call UUID ties, older fallback, topic isolation and null/future reports; reported counts remain separate from verified metrics.
- Identified 2a prerequisite reconciliation is complete; next iteration can begin one ORM conversion with the suite green. Updated TASKS/database verification/SOURCES; archived iteration 550.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/201 isolated integration), pnpm build and git diff --check passed. Early checks caught formatting while edits were still in flight; final check rerun after formatting.
- Rebuilt/restarted API and worker for adapter fix; final healthz/alerts green. No schema, UI or handbook flow changes.
- Next: verify hourly Bluesky recovery, then Nov 4 scheduled review when due; otherwise STEERING 29 first ORM conversion.

## 2026-11-04: iteration 571 — first Drizzle repository conversion

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and no failed digest jobs. Nov 4 scheduled evidence remains pending at 15:00 UTC.
- Converted profile schedule reads/updates to Drizzle query builder over the existing observed, test-isolated pg pool; explicit domain mapping, missing-row errors and shutdown preserved. Existing 2a tests unchanged; removed profile unsafe-row lint exemptions.
- Added Drizzle/drizzle-kit, mapped the two profile tables and enforced ORM import boundaries in ESLint/dependency-cruiser. Decision documents partial schema: migration generation stays disabled until full-schema zero-diff proof. No migrations, schema changes or owner grant changes.
- Updated architecture/handbook/TASKS; archived iteration 551. No paid calls. Stored Bluesky latest observations remain 03:54 UTC; next hourly recovery still pending, not claimed verified.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/201 isolated integration), pnpm build, handbook check for 01-stack-and-runtime and git diff --check passed; zero dangling Docker volumes.
- Rebuilt/restarted API and worker well outside edition freeze. Both active; healthz healthy, root HTTP 200, zero alerts; live GET /api/profile byte-identical before/after restart, including owner's 07:00 Los Angeles schedule.
- Next: verify hourly Bluesky recovery and Nov 4 scheduled edition when due; otherwise complete full Drizzle schema mapping/parity before migration tooling adoption.

## 2026-11-04: iteration 572 — complete Drizzle schema and catalog parity

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 error-free sources and no failed digest jobs; scheduled Nov 4 review pending at 15:00 UTC.
- Mapped all 25 public tables from migrations 001–055, including the migration ledger. Isolated test generates an empty database from Drizzle DDL and compares every column/default, constraint and index to the migrated database; existing characterization tests unchanged.
- Corrected introspection's empty-string default, boolean check, regex escaping, composite FK ordering and index operator classes. Drizzle-kit 0.31.11 still falsely proposes six drop/recreate statements for three identical FKs; programmatic push also drops query parameters. Read-only CLI probe applied nothing; zero-diff/adoption gate remains open. No live migration/grant changes or paid calls.
- Normal 05:54:43 UTC Bluesky job completed in 8.204 s; read-only report confirms fresh stored observations across all four topics. First scheduled recovery verified; sustained collection and real edition selections remain pending.
- Updated TASKS/SOURCES/database verification/decision; archived iteration 552. No UI or handbook flow change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/202 isolated integration), pnpm build, handbook stack check and git diff --check passed; zero dangling Docker volumes. Initial parity failures exposed the corrected mapping/tooling defects.
- Rebuilt/restarted API and worker outside the edition freeze; both active, healthz healthy, root HTTP 200, zero alerts. Live profile response byte-identical before/after restart.
- Next: scheduled edition review when due; otherwise resolve Drizzle introspection gate before migration baseline adoption, then convert remaining repositories individually.

## 2026-11-04: iteration 573 — repair Drizzle composite-key introspection

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 error-free sources and no failed digest jobs; Nov 4 15:00 UTC edition remains pending.
- Fixed drizzle-kit 0.31.11's independent ANY joins with paired unnest/ordinality and ordered FK columns, via a pinned pnpm patch covering CLI/CommonJS/ESM. No application/schema/live data changes or paid calls.
- Added real strict/verbose CLI regression against fresh isolated migrations, with PostgreSQL-enforced read-only URL options; it reports zero changes. Existing generated-DDL catalog parity and characterization tests unchanged. Programmatic push parameter loss remains avoided by using the CLI.
- Updated TASKS/database verification/decision; archived iteration 553. Historical SQL migrations remain authoritative; migration baseline adoption is next, with private pg_dump required before first new migration.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build and git diff --check passed. First full check caught lint's import formatting; reformatted and reran. Separate initial integration run also passed 203 tests; zero dangling Docker volumes.
- Live root HTTP 200, latest real edition has four topics, sources and digest queue healthy. No restart under STEERING 22: only development tooling/tests/docs changed.
- Next: historical migration baseline, then individual ORM repositories; prioritize scheduled Nov 4 edition review when due.

## 2026-11-04: iteration 574 — convert Bluesky repository to Drizzle

- Started clean on main; no leftover work. Zero alerts, healthy healthz and 36 healthy sources; no failed digest jobs. Nov 4 15:00 UTC edition review remains pending.
- Converted Bluesky collection and edition reads to typed Drizzle builders/transactions. Preserved topic share locks, atomic rollback, newer-only metadata, immutable snapshot dedupe, exact window/cutoff boundaries, deterministic ordering and publisher transaction reuse.
- Existing 203 database characterization tests unchanged. Updated one unit query stub for Drizzle's array-row protocol; snapshot failure regression caught wrapped errors, so collection rethrows the original PostgreSQL cause after rollback.
- Updated TASKS/architecture/decision; archived iteration 554. No migration, source, UI or handbook flow changes; no paid calls. Historical migration baseline adoption remains open.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, targeted publisher tests (7), git diff --check passed; zero dangling Docker volumes. Earlier checks caught archive formatting, unit stub shape and wrapped database errors; fixed before final green run.
- Read-only stored Bluesky report exercised converted reader before/after restart: four topics have real stored posts (after: Tech 49, NBA 51, Gaming 64, World 70). Counts use a moving 24-hour window; newest observations remain 05:54 UTC, so sustained hourly recovery still awaits evidence.
- Rebuilt/restarted API and worker outside edition freeze; both active, healthz healthy, root HTTP 200, latest real edition four topics, zero alerts. Profile response byte-identical before/after, preserving owner schedule.
- Next: scheduled Nov 4 review when due; otherwise historical migration baseline and remaining individual ORM adapters.

## 2026-11-04: iteration 575 — convert scheduled budget lifecycle to Drizzle

- Started clean on main; no leftover work. Zero alerts, 36 error-free sources and no failed digest jobs; Nov 4 15:00 UTC review remains pending.
- Converted scheduled-budget reads and compare-and-swap writes to Drizzle, preserving shared Anthropic advisory locking, rollback/client release, first identity, attempt fencing, publication recovery and Date/JSON mapping.
- Existing 203 integration characterization tests unchanged. First check found the lifecycle logging unit stub assumed SQL strings; adapted it to query configurations/array rows, retaining assertions. Targeted test passed.
- Updated TASKS/architecture/decision; archived iterations 555–556. No migration, source, UI or handbook flow changes; no paid calls.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, handbook stack check and git diff --check passed; zero dangling Docker volumes.
- Rebuilt/restarted API and worker outside the edition freeze; both active, healthz healthy, root HTTP 200, latest real edition four topics, zero alerts. Owner profile and reserve responses byte-identical across restart; pending reserve remains $0.487477.
- Next: prioritize scheduled Nov 4 review; otherwise historical migration baseline and remaining individual ORM adapters. Back up live DB before the first new migration.

## 2026-11-04: iteration 576 — convert Reddit repository to Drizzle

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 healthy sources and no failed digest jobs; Nov 4 scheduled review remains pending.
- Converted Reddit communities, transactional storage/citation replacement/topic associations and edition reads to Drizzle. Preserved case-insensitive configuration, atomic rollback, PostgreSQL errors, seven-day lookback, exclusive end, stable ordering and publisher transaction reuse.
- Existing repository characterization assertions unchanged. Publication query stub now accepts Drizzle query configurations/array rows. First integration run caught insert-select default-column requirements and that stub; fixed before final green run.
- Updated TASKS/architecture/decision/handbook stack; archived iterations 557–558. Reddit collection remains parked; no migration, activation, paid calls or UI changes.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, handbook stack check and git diff --check passed.
- Rebuilt/restarted API and worker outside edition freeze; both active, healthz healthy, root HTTP 200, 36 healthy sources and zero alerts. Latest real edition response byte-identical across restart (four topics, 19 stories).
- Next: prioritize Nov 4 scheduled review when due; otherwise historical migration baseline or remaining individual ORM repositories. Private pg_dump required before first new migration.

## 2026-11-04: iteration 577 — convert publisher-article discovery to Drizzle

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 sources without current errors and no failed digest jobs. Nov 4 scheduled review remains pending.
- Converted publisher-article X citation/check recording to typed transactional Drizzle upserts; preserved enabled-source rechecks, conflict metadata, atomic rollback and PostgreSQL errors. Complex two-window fairness query uses a documented Drizzle SQL template.
- Existing characterization tests unchanged. Typecheck caught execute-result constraints and insert-select SQL aliases; fixed. Formatting caught the new progress archive; fixed before final green check.
- Updated TASKS, architecture, decision and handbook stack; archived iterations 559–560. No migration, activation, source change or paid call.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, handbook stack check and git diff --check passed; zero dangling Docker volumes.
- Read-only converted live candidate query returned eight articles across five publisher hosts. Latest free collection before restart checked eight pages, found two citations and reported zero discovery errors.
- Rebuilt/restarted API and worker outside freeze; both active, healthz healthy, root HTTP 200, 36 error-free sources, zero failed digest jobs and zero alerts. Latest real edition response byte-identical across restart.
- Next: prioritize Nov 4 scheduled review when due; otherwise historical migration baseline or remaining individual ORM repositories. Private pg_dump required before first new migration.

## 2026-11-04: iteration 578 — convert X-search repository to Drizzle

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and zero failed digest jobs; Nov 4 scheduled review remains pending.
- Converted scheduled coverage CTE/union, completed-open-search evidence, topic/verification reads and citation writes to typed Drizzle. Preserved inclusive start/exclusive end, cooldown/order/limit, unknown-attribution exclusion, shared advisory lock, conflict-ignore, JSON reports and atomic rollback with PostgreSQL errors.
- Existing characterization assertions unchanged. Typecheck caught nullable union topics and untyped account JSON; corrected explicit projection types before verification.
- Updated TASKS, architecture, decision and handbook stack. No migration, source/feature activation, UI change or paid call.
- Read-only converted live queries returned four topics (67/19/7/1 free X posts), reviewed handle counts 11/10/12/11 and a valid topic lookup. Latest free collection checked eight articles/found two citations with zero errors.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, handbook stack check and git diff --check passed; X-search statement coverage 100%, zero dangling Docker volumes.
- Rebuilt/restarted API and worker outside the freeze; both active, healthz healthy, root HTTP 200, latest real edition byte-identical across restart, 36 error-free sources and zero failed digest jobs/alerts.
- Archived iteration 561 to keep PROGRESS bounded. Next: prioritize Nov 4 scheduled review when due; otherwise historical migration baseline or remaining individual ORM adapters. Private pg_dump before first new migration.

## 2026-11-04: iteration 579 — convert ingestion repository to Drizzle

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 healthy sources and no failed digest jobs; Nov 4 scheduled review remains pending.
- Converted source eligibility/health reads and transactional item, observation and X citation upserts to Drizzle. Nested top-five JSON aggregation retains a documented SQL template; atomic rollback, engagement merging and citation validation preserved.
- Existing characterization assertions unchanged. First integration run caught timestamp decoding and wrapped PostgreSQL errors; fixed Date mapping and error-cause propagation before final green run.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 562. No migration, source/feature activation, UI change or paid call.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, handbook stack check and git diff --check passed.
- Rebuilt/restarted API and worker outside freeze; both active, healthz healthy and root HTTP 200. Converted live reads return five articles per topic, 36 error-free sources/3,357 observations, unchanged published edition bytes, zero alerts and zero dangling Docker volumes.
- Next: prioritize Nov 4 scheduled review when due; otherwise historical migration baseline or remaining ORM adapters. Private pg_dump before first new migration.

## 2026-11-04: iteration 580 — convert edition-cost reader to Drizzle

- Started clean on main; no leftover work. Healthy healthz, zero alerts, 36 error-free sources and zero failed digest jobs; older ingestion/social failures have subsequent successes. Nov 4 scheduled review remains pending.
- Converted run-attributed cost and full-AI measurement queries to typed Drizzle aggregates/joins, preserving transaction clients, completeness, verification/unresolved exclusions, 30-day bounds, ordering and limits. JSON array checks retain a documented SQL predicate.
- Existing DB characterization assertions unchanged. Updated the logging unit stub to accept node-postgres query objects after its string-only implementation failed; targeted regression and final full check pass.
- Updated TASKS, architecture, decision and handbook stack; archived iteration 563. No migration, source/feature activation or paid call.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/203 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts stack and git diff --check passed; zero dangling Docker volumes.
- Read-only live probe returned Nov 3 cost 339,524 micros/43 calls and zero qualifying full-AI measurements. Initial probe omitted the app's default DB URL; reran successfully through its database factory.
- Restarted API/worker outside freeze; both active, healthz healthy, root HTTP 200, published edition byte-identical, 36 error-free sources, zero failed digest jobs and zero alerts.
- Next: prioritize Nov 4 scheduled review when due; otherwise remaining ORM adapters or historical migration baseline. Private pg_dump before first new migration.
