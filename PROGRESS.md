## 2026-11-04: iteration 557 — characterize concurrent Bluesky collection

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 healthy sources and zero failed digest jobs; Nov 4 15:00 UTC review remains pending.
- Added isolated repository coverage racing independent collectors across topics in both invocation orders: newest complete metadata wins, topic histories stay separate, concurrent replay dedupes rows and snapshots.
- Updated TASKS/database verification notes. No production/source/schema/UI/handbook flow changes or paid calls; no restart under STEERING 22 because only tests/docs changed.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/191 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes. New concurrency test passed.
- Next: review Nov 4 scheduled evidence first; incremental triage/grouping activation stays gated. Remaining repository characterization and recorded-response golden remain open.

## 2026-11-04: iteration 558 — characterize Bluesky configuration races

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and zero failed digest jobs. Recent hourly collections completed; Nov 4 15:00 UTC review remains pending.
- Added isolated repository coverage that observes a collector blocked behind a topic lock, then commits disable or deletion. Collection resumes without creating current posts or immutable observations in either case.
- Updated TASKS/database verification notes; archived iteration 539 to keep PROGRESS small. No production/source/schema/UI/handbook flow changes or paid calls; no restart under STEERING 22.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/192 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes. Initial check caught archive formatting; corrected before passing rerun.
- Next: review Nov 4 scheduled evidence first; production incremental triage/grouping activation remains gated. Repository characterization and recorded-response golden remain open.

## 2026-11-04: iteration 559 — reclaim Grafana filesystem cache

- Started clean on main; no leftover work. Healthz passed; pending Grafana memory warning took priority over background tests.
- Grafana used ~255 MiB of its 256 MiB ceiling: ~105 MiB anonymous and ~149 MiB filesystem cache. Added MemoryHigh=208M, retaining hard memory/CPU ceilings; updated the handbook and deployed/restarted only Grafana.
- After dashboard queries: ~202 MiB, zero automatic restarts; Grafana memory alert cleared. This is short-run evidence, not sustained-memory acceptance.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/192 isolated integration), pnpm build, handbook 09-observability check and focused check-observability --verify-grafana --grafana-database-only passed; zero dangling Docker volumes.
- Full Grafana verification twice failed on retained social-collection next-run metric versus current Status; recorded an open task. Generated unchanged-layout screenshots discarded. Restart 502s temporarily triggered the rolling API error alert; final snapshot has zero alerts.
- No paid calls or edition changes. Next: investigate schedule metric freshness, monitor memory, then prioritize Nov 4 15:00 scheduled edition evidence.

## 2026-11-04: iteration 560 — report the earliest recurring social run

- Started clean on main; no leftover work. Healthz passed, 36 sources without current errors; pending API error alert cleared without intervention.
- Traced repeated Grafana/Status mismatch to Status reading BullMQ schedulers descending: it reported the later of two social schedules. Read only the earliest schedule, matching metrics; no schedule or edition behavior changed.
- Added isolated two-schedule regression including removal of the earliest schedule. Initial test cleanup used optional id instead of scheduler key; corrected and reran successfully.
- Removed duplicate browser viewport shrink hiding lower Jobs/Product panels; focused Grafana check passed all 8 populated panels, with refreshed desktop/mobile screenshots.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/193 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes. API restarted; healthz and live Status passed.
- Full check-observability --verify-grafana passed desktop checks then timed out on Agent mobile Supervisor active; follow-up recorded. Final alerts clear; archived iteration 541 to keep PROGRESS small.
- No paid calls, production feature activation or source changes. Next: prioritize Nov 4 15:00 edition evidence; grouping/incremental triage stay gated.

## 2026-11-04: iteration 561 — finish Grafana mobile verification

- Started clean on main; no leftover work. Healthz passed, 36 healthy sources, zero alerts; recent free-social and Bluesky collection jobs completed. Nov 4 15:00 UTC evidence remains pending.
- Fixed Agent mobile verification waiting on an unmounted Supervisor panel: bounded scrolling now mounts the virtualized panel before locating it, matching the existing Runtime approach.
- Full read-only `pnpm exec tsx scripts/check-observability.ts --verify-grafana` passed all ten dashboards and desktop/mobile captures. Inspected and retained Agent mobile screenshot; discarded unrelated screenshot refreshes.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/193 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes and final alerts clear.
- Updated TASKS; archived iteration 542 to keep PROGRESS small. No running code/config changed, so no restart under STEERING 22; no paid calls or production activation.
- Next: prioritize Nov 4 scheduled edition review; grouping/incremental triage remain gated. Repository characterization remains available while waiting.

## 2026-11-04: iteration 562 — characterize equal-time Bluesky conflicts

- Started clean on main; no leftover work. Healthz passed, all 36 sources have no current errors, digest queue has zero failed jobs and alerts are clear. Nov 4 scheduled evidence remains pending.
- Added isolated repository regression: equal-time conflicts preserve first current metadata and independently preserve each topic's first snapshot; missing media normalizes to an empty current array. A one-millisecond-newer observation leaves the other topic's history unchanged.
- Initial verification caught documentation formatting and an invalid synthetic post ID; both corrected. No production code changes or provider requests.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/194 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes. Final alerts clear.
- Updated TASKS/database verification notes and archived iteration 543 to keep PROGRESS small. No restart under STEERING 22: running code/config unchanged.
- Next: prioritize Nov 4 15:00 UTC edition review; grouping and incremental triage remain gated. Repository characterization and recorded-response golden remain open.

## 2026-11-04: iteration 563 — characterize Bluesky topic lifecycle

- Started clean on main; no leftover work. Healthz passed, 36 sources healthy, no failed digest jobs and zero alerts; retained source/social failures are historical. Nov 4 scheduled review remains pending.
- Added isolated repository regression for disable/re-enable history retention, skipped disabled writes, resumed collection and delete/recreate isolation. Another topic's snapshots and newer shared current metadata survive deletion and older replay.
- Verification: pnpm format, pnpm lint:fix and pnpm check passed (363 unit/195 isolated integration). Initial check caught archive formatting, corrected before rerun. No provider requests or production changes.
- Updated TASKS/database verification notes; archived iteration 544 to keep PROGRESS small. No restart under STEERING 22: running code/config unchanged.
- Final checks: pnpm build and git diff --check passed; healthz healthy, zero alerts and zero dangling Docker volumes.
- Next: prioritize Nov 4 15:00 UTC edition review; grouping/incremental triage remain gated. Repository characterization and recorded-response golden remain open.

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
