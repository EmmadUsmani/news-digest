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
