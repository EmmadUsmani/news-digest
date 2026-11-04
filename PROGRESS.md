## 2026-11-04: iteration 529 — join successful triage work to final fingerprints

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root/api/status, 36 error-free sources and four available queues. Nov 4 review remains pending.
- Added offline scoring-evidence CLI: successful attempts join final eligible fingerprints by topic/article; separates absent articles, changed inputs, repeat compatible scores and failed attempts. Rejects duplicate evidence, pre-final observations and out-of-window scoring.
- Synthetic regressions only; no production scoring exporter, actual waste/cost/latency observation, paid calls or activation. Compatibility does not prove cache consumption. TASKS/RANKING document the input contract and limits.
- Verification: targeted regressions 3/3; pnpm format, pnpm lint:fix, pnpm check (323 unit/184 isolated integration), pnpm build and git diff --check passed; no dangling Docker volumes. Initial status probe used a nonexistent route; correct /api/status is healthy.
- Services remain running under STEERING 22: only offline tooling/tests/docs changed. Next: scheduler/export wiring and actual scoring evidence; Nov 4 scheduled review takes priority when available.

## 2026-11-04: iteration 530 — prepare bounded multi-topic triage ticks

- Started clean on main; no leftover work. Zero alerts; healthz/status healthy, 36 sources without current errors and four available queues. Nov 4 review remains pending.
- Added prepared round-robin scheduler: one topic per tick bounds total work; overlap skips, completed/error passes rotate, busy/cutoff preserves turn. Current topic membership is supplied each tick; duplicate/blank IDs and loader identity mismatch fail safely.
- Three fake regressions cover work bounds, membership changes, overlap, failure recovery, contention/cutoff and invalid inputs. No production timer/pool caller, export, activation or paid calls; no live speed/cost/waste claim.
- Updated TASKS/RANKING. Services remain running under STEERING 22 because prepared code is not imported by running code; no UI/schema/source/handbook flow change.
- Next: production caller/export wiring with shared admission and reserve-safe services; Nov 4 edition review takes priority when available.
- Verification: targeted tests 3/3; pnpm format, pnpm lint:fix, pnpm check (326 unit/184 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes.

## 2026-11-04: iteration 531 — prepare actual triage item-write evidence

- Started clean on main; no leftover work. Zero alerts; healthy healthz/status, 36 sources without current errors and four available queues. Nov 4 review remains pending.
- Added per-invocation item-cache observation with exact production fingerprint, original article ID and completion time. Records successful writes only; excludes warm hits, request/social cache writes and failed persistence; retains partial successes.
- Two fake-provider/cache regressions exercise real CandidateTriage and the offline report join, changed inputs, failures and snapshot isolation. Initial test used the wrong report field name; corrected before verification.
- No production caller, persistent export, paid calls or activation; no measured waste/cost/latency claim. TASKS/RANKING updated; no source/schema/UI/handbook flow changes.
- Verification: targeted tests 2/2; pnpm format, pnpm lint:fix, pnpm check (328 unit/184 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes.
- Services remain running under STEERING 22 because this prepared adapter is not imported by running code. Next: caller/private export wiring and final eligible fingerprints; scheduled Nov 4 review takes priority.

## 2026-11-04: iteration 532 — prepare private scoring-evidence persistence

- Started clean on main; no leftover work. Zero alerts; healthz healthy, 36 sources without current errors and four available queues. Nov 4 edition review remains pending.
- Added bounded private evidence exporter: mode-600 files, synced temporary writes and exclusive atomic publication; concurrent exports remain distinct. Invalid/duplicate rows rejected, extra fields stripped, empty snapshots skipped and failures propagated.
- Fake cache-write regression verifies persistence, permissions, concurrency and final-pool report compatibility. No production caller, paid calls, activation or actual waste/cost/latency measurement.
- Updated TASKS/RANKING; no source/schema/UI/handbook flow changes. Services remain running under STEERING 22 because prepared adapter is not imported by running code.
- Next: caller/export wiring and actual scored-work evidence; Nov 4 scheduled review takes priority when available.
- Verification: targeted exporter test 1/1; pnpm format, pnpm lint:fix, pnpm check (329 unit/184 isolated integration), pnpm build and git diff --check passed; live root/healthz healthy, zero dangling Docker volumes.

## 2026-11-04: iteration 533 — wire service-level incremental scoring exports

- Started clean on main; no leftover work. Zero alerts; healthz/status healthy, 36 sources without current errors, four available queues and recent successful collections. Nov 4 15:00 UTC edition remains pending.
- Wired per-invocation write evidence and private export into the prepared reserve-safe service; random attempt IDs isolate concurrent topics. Partial successful writes export on scoring failure; export failures propagate and dual failures retain both errors.
- Enabling with credentials now requires an absolute evidence-directory setting. No production timer/pool caller, activation, paid calls or actual scored-work/waste measurement; no live behavior, UI, source, schema or handbook flow change.
- Updated TASKS/RANKING; archived iterations 515–518 to keep PROGRESS below 25 KB. Initial full check caught archive formatting; fixed and reran successfully.
- Verification: targeted tests 3/3; pnpm format, pnpm lint:fix, pnpm check (330 unit/184 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes.
- Services remain running under STEERING 22 because this module has no production caller. Next: scheduler/pool composition and longer-span evidence; scheduled Nov 4 review takes priority.

## 2026-11-04: iteration 534 — compose shared-admission incremental scheduler

- Started clean on main; no leftover work. Zero alerts; healthy healthz/status, 36 sources without current errors, four available queues and recent successful collection. Nov 4 scheduled review remains pending.
- Added prepared public scheduler factory joining reserve-safe evidence-writing services, bounded round-robin ticks and mandatory Postgres admission. Default-off returns before schedule/database access; no timer or production pool caller.
- Isolated fake-scorer/Postgres regression verifies independent-worker contention skips pool loading, 25-item bound, scoring-failure lock release/recovery and cutoff. No paid calls, activation or actual waste/latency measurement.
- Updated TASKS/RANKING; no source/schema/UI/handbook flow changes. Services remain running under STEERING 22 because this module has no production caller.
- Verification: pnpm format, pnpm lint:fix, pnpm check (330 unit/185 isolated integration), pnpm build and git diff --check passed; root/healthz healthy and zero dangling Docker volumes.
- Next: exact edition-pool and current-schedule caller wiring; longer-span pool/scored-work evidence. Nov 4 scheduled review takes priority when available.

## 2026-11-04: iteration 535 — prepare exact edition-pool boundary

- Started clean on main; no leftover work. Zero alerts; healthz healthy, 36 sources without current errors, recent successful ingestion and no failed digest jobs. Nov 4 15:00 UTC review remains pending.
- Added read-only incremental pool boundary using the edition's current-window newest-200 query and current enabled/positive-story-budget topic settings; invalid windows fail before DB access, unavailable topics return null.
- Extracted shared edition/background input builder to preserve guidance, hard exclusions, semantic recovery and cache fingerprints. Prepared loader has no worker/timer caller; no activation, paid calls or actual waste/latency claim.
- Updated TASKS/RANKING; no source/schema/UI/handbook flow changes. Next: current-schedule/timer wiring and longer-span scored-work evidence; Nov 4 review takes priority.
- Verification: targeted loader test 1/1; pnpm format, pnpm lint:fix and pnpm check passed (331 unit/185 isolated integration), including edition goldens.
- pnpm build and git diff --check passed; API/worker restarted (shared edition import changed), root HTTP 200 and healthz healthy; zero dangling Docker volumes.

## 2026-11-04: iteration 536 — prepare current-schedule triage window

- Started clean on main; no leftover work. Zero operational alerts; healthz reports database/Redis healthy. Nov 4 15:00 UTC scheduled review remains pending.
- Added prepared current-settings cron/timezone boundary producing edition coverage and two-hour incremental cutoff. Exact publication instant retains its slot; elapsed coverage survives DST.
- Offline tests cover settings changes, local/UTC times, exact-slot rollover, DST and invalid input. No timer/caller, activation, paid requests or live waste/latency claim.
- Updated TASKS/RANKING; no live flow, source, schema, UI or handbook change. Services remain running under STEERING 22 because prepared adapter has no production caller.
- Verification: targeted tests 3/3; pnpm format, pnpm lint:fix, pnpm check (334 unit/185 isolated integration), pnpm build and git diff --check passed; root HTTP 200 and zero dangling Docker volumes.
- Next: timer/pool composition; actual scored-work evidence after activation gate. Nov 4 scheduled review takes priority when available.

## 2026-11-04: iteration 537 — prepare settings/pool tick composition

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and four available queues; no failed digest jobs. Nov 4 review still pending.
- Joined current settings, pinned publication windows and lazy topic pools to a persistent bounded scheduler. Default-off avoids reads; overlap skips, settings failures recover, unavailable topics produce empty work.
- Pinned cutoff to the loaded window so publication-crossing pool reads cannot shift it to tomorrow. Four offline regressions pass; no paid requests, activation or worker/timer caller.
- Updated TASKS/RANKING; archived iteration 519 to keep PROGRESS below 25 KB. No production flow/source/schema/UI changes; services stay running under STEERING 22.
- Verification: targeted tests 4/4; pnpm format, pnpm lint:fix, pnpm check (338 unit/185 isolated integration), pnpm build and git diff --check passed. Root HTTP 200, healthz healthy, zero dangling Docker volumes. Initial lint caught missing void on test promises; fixed before rerun.
- Next: production dependency/timer wiring behind the Nov 4 gate, longer-span pool comparisons and actual scored-work evidence; scheduled review takes priority.

## 2026-11-04: iteration 538 — prepare incremental timer lifecycle

- Started clean on main; no leftover work. Zero alerts; healthz healthy, 36 sources with successful ingestion/no current errors and zero failed digest jobs. Nov 4 review remains pending.
- Added prepared periodic lifecycle: skips overlap, reports failures and recovers, validates Node timer bounds, drains active scoring on stop before future DB shutdown. Four offline tests cover shutdown, recovery and reporter failure.
- No worker import, production timer, activation or paid calls. Updated TASKS/RANKING; no live flow, source, schema or UI change. Services stay running under STEERING 22 because their code is unchanged.
- Verification: targeted tests 4/4; pnpm format, pnpm lint:fix, pnpm check (342 unit/185 isolated integration), pnpm build and git diff --check passed. Root HTTP 200, healthz healthy, zero dangling Docker volumes.
- Next: production dependency/lifecycle wiring behind the Nov 4 review gate; longer-span comparisons and actual scored-work waste evidence remain open.

## 2026-11-04: iteration 539 — prepare incremental runtime dependency composition

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 sources with no current errors and zero failed digest jobs. Nov 4 review still pending.
- Composed caller-owned database, settings reader, shared article pool, reserve-safe scheduler and draining timer. Default-off constructs no timer and reads no settings/content; scheduler identity persists across ticks.
- Two offline contract tests pass. No worker import, production activation or paid calls; no live latency/waste claim. Next: worker-owned settings/database lifecycle wiring after the review gate permits activation.
- Updated TASKS/RANKING and archived iteration 520 to keep this file small. No source/schema/UI or live handbook flow changes; services stay running under STEERING 22.
- Verification: targeted tests 2/2; pnpm format, pnpm lint:fix, pnpm check (344 unit/185 isolated integration), pnpm build and git diff --check passed. Initial checks caught two unbound-method lint errors; fixed before the successful full rerun. Root HTTP 200, healthz healthy and zero dangling Docker volumes.

## 2026-11-04: iteration 540 — prepare worker resource ownership

- Started clean on main; no leftover work. Zero alerts, healthy root/healthz, 36 sources with recent nonempty successful collections and no current errors; no failed digest jobs. Nov 4 scheduled review remains pending.
- Added prepared worker entry point owning scoring DB and existing settings/topic repositories. Disabled mode allocates nothing; current settings filter enabled topics. Startup failures clean up, repeated shutdowns share one drain, and connections close after scoring stops.
- Four offline lifecycle tests and one isolated persisted-settings/topic integration test pass. No production worker import, activation or paid requests; no live latency/waste claim. Next: gated worker connection after review, longer-span pool/waste evidence.
- Updated TASKS/RANKING; archived iteration 521 to keep PROGRESS small. No source/schema/UI or live handbook flow change. Services stay running under STEERING 22 because prepared code has no production caller.
- Verification: targeted tests 4/4; pnpm format, pnpm lint:fix, pnpm check (348 unit/186 isolated integration), pnpm build, git diff --check; root HTTP 200, healthz healthy, zero alerts and zero dangling Docker volumes. Initial test synchronization and cleanup-error typing failures fixed before successful full checks.

## 2026-11-04: iteration 541 — respect ranked pools in offline triage replay

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 nonempty successful sources without current errors and no failed digest jobs. Historical social failure is the already investigated Nov 3 23:54 event; Nov 4 review remains pending.
- Fixed bounded offline replay to consume snapshot ranking instead of candidate catalogue order, avoiding incorrect remainder/waste estimates. Changing-rank regression proves catalogue-order independence; all eight targeted offline tests pass.
- Production incremental triage remains off; no paid calls or actual waste/latency claim. No running code/config changed, so no restart under STEERING 22.
- Updated TASKS/RANKING; archived iteration 522 to keep PROGRESS small. No source/schema/UI or handbook flow changes.
- Verification: pnpm format, pnpm lint:fix, pnpm check (349 unit/186 isolated integration), pnpm build, targeted replay (8/8) and git diff --check passed; root HTTP 200 and healthy healthz. Zero dangling Docker volumes.
- Next: Nov 4 scheduled review first, then gated worker connection and actual scored-work waste evidence.

## 2026-11-04: iteration 542 — report observed triage work per topic

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 nonempty successful sources without current errors and zero failed digest jobs. Nov 4 scheduled review remains pending.
- Added sorted per-topic counts to offline scoring-evidence report, preserving global totals. Includes scoring-only/final-only topics, repeated compatible scores, changed fingerprints, absent items and unscored attempts.
- Four targeted tests pass; regression verifies all counts reconcile, topic isolation and input-order independence. Synthetic evidence only; no paid calls, production activation or actual waste/latency claim.
- Updated TASKS/RANKING; archived iteration 523 to keep PROGRESS small. No source/schema/UI or handbook flow changes; no restart under STEERING 22 because running code/config is unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check (350 unit/186 isolated integration), pnpm build, targeted report tests (4/4), git diff --check; root HTTP 200 and healthy healthz, zero dangling Docker volumes.
- Next: Nov 4 scheduled review first; then gated worker connection and actual scored-work waste evidence.

## 2026-11-04: iteration 543 — measure longer real triage-pool compatibility

- Started clean on main; no leftovers. Zero alerts, healthy healthz/root, all 36 sources returning nonempty collections; no failed digest jobs. Nov 4 review remains pending.
- Read-only capture `/tmp/triage-pool-543.json` extends the same edition-window observation from 01:07 to 02:40 UTC (93m36s). Retains all 492 earlier eligible IDs, adds 32; 484 compatible fingerprints, eight changed (2 Tech/6 World), unchanged settings. Title/excerpt updates demonstrate that membership alone overstates reuse.
- Reproduced with `pnpm exec tsx scripts/compare-triage-cache.ts /tmp/triage-pool-525.json /tmp/triage-pool-543.json claude-haiku-5-5`; Node assertions reconcile totals and every topic. Private captures stay outside git. No actual scored-work waste, cache-hit, cost or latency measurement; no paid calls or activation.
- Updated TASKS/RANKING with counts, interpretation and limits. No source/schema/UI or handbook flow changes; no restart under STEERING 22 because running code/config is unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check (350 unit/186 isolated integration), pnpm build and git diff --check passed; root HTTP 200, healthy healthz, zero dangling Docker volumes.
- Next: Nov 4 scheduled review first; gated worker connection and actual scoring/final-pool waste evidence thereafter.

## 2026-11-04: iteration 544 — attribute prospective cache invalidation

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 successful sources without current errors and no failed digest jobs. Two retained historical ingestion failures remain; Nov 4 review is pending.
- Offline cache comparator partitions changed retained keys into article-only, topic-only and combined causes using production-key counterfactuals, respecting prompt truncation. Five targeted tests pass, including reconciliation and eligibility loss.
- Replayed private 525/543 captures to `/tmp/triage-cache-544.json`: all eight changes are article-only (2 Tech/6 World); zero topic-only or combined. No actual scored-work waste, cost, latency, activation or paid calls.
- Updated TASKS/RANKING and archived iteration 524 to keep PROGRESS small. No source/schema/UI or handbook flow changes. No restart under STEERING 22 because running code/config is unchanged.
- Next: Nov 4 scheduled review first, then gated worker connection and actual scoring/final-pool waste measurements.
- Verification: pnpm format, pnpm lint:fix, pnpm check (351 unit/186 isolated integration), pnpm build, targeted comparator tests (5/5) and git diff --check passed; root HTTP 200, healthy healthz and zero alerts.

## 2026-11-04: iteration 545 — join final captures to observed scoring exports

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 nonempty error-free sources; latest Bluesky collection succeeded with zero discovery/verification errors. Retained Nov 3 token failure is historical. Nov 4 review remains pending.
- Added offline `report-captured-triage-work.ts`: derives production fingerprints from final eligible captures and joins atomic scoring exports into the per-topic waste report. Rejects early observations, duplicate pool identities/score evidence and malformed records.
- Seven targeted tests pass, including synthetic end-to-end retained/changed/excluded/repeated work. CLI rejects the real early 543 capture as a final observation. No actual scoring, provider calls, production activation or cost/latency claims.
- Updated TASKS/RANKING and archived iteration 525. No source/schema/UI or handbook flow changes; no restart under STEERING 22 because running code/config is unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check (353 unit/186 isolated integration), pnpm build and git diff --check; root HTTP 200, healthy healthz, zero dangling Docker volumes.
- Next: Nov 4 scheduled review first; gated worker connection and actual scoring/final-pool waste evidence thereafter.

## 2026-11-04: iteration 546 — verify admission recovery after database session loss

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 nonempty error-free sources and no failed digest jobs. Nov 4 review remains pending.
- Added isolated Postgres regression terminating only its dedicated test backend: session lock releases, another worker acquires it, stale cleanup cannot unlock the successor, and the original pool replaces its dead client and reacquires admission.
- Recovery is not provider-call fencing: an in-flight request may outlive the session. No provider calls, production activation or cost/latency claims; incremental triage stays off.
- Updated TASKS/RANKING and archived iteration 526. No source/schema/UI or handbook flow changes. No restart under STEERING 22: only tests/docs changed.
- Verification: pnpm format, pnpm lint:fix, pnpm check (353 unit/187 isolated integration), pnpm build and git diff --check passed; root HTTP 200, healthy healthz, zero alerts and dangling Docker volumes.
- Next: Nov 4 scheduled review first; gated worker connection and actual scoring/final-pool waste evidence thereafter.

## 2026-11-04: iteration 547 — contain admission session errors

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, all 36 sources nonempty/error-free and no failed digest jobs; latest social collection completed. Retained ingestion/social failures are historical; Nov 4 review remains pending.
- Fixed the prepared admission adapter's missing checked-out client error listener: database loss during scoring is contained, failed clients are destroyed and cleanup reports the session error. No activation or provider calls.
- Isolated backend-termination regression no longer installs a masking test error handler; verifies adapter listener removal, successor safety and pool recovery. Initial cleanup assertion incorrectly counted pg internal listeners; corrected to track only adapter-owned listeners.
- Updated TASKS/RANKING and archived iteration 527. No schema/source/UI or handbook flow changes. No restart under STEERING 22: this adapter remains outside the production worker import graph.
- Verification: pnpm format, pnpm lint:fix, pnpm check (353 unit/187 isolated integration), pnpm build and git diff --check passed. Initial archive formatting failure corrected before final full check.
- Next: Nov 4 scheduled review first; gated worker connection and actual scoring/final-pool waste evidence thereafter.

## 2026-11-04: iteration 548 — preserve simultaneous triage failures

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 edition review remains pending.
- Fixed prepared runner cleanup hiding loader/cache/provider failures when admission release also fails. AggregateError now retains both original values, including a thrown undefined; single failures retain existing behavior.
- Regression covers all three work stages plus next-tick recovery and exactly-once release. No provider calls or activation; admission still cannot fence in-flight provider work.
- Condensed the incremental-triage TASKS history into current state; archived iteration 528. No source/schema/UI or handbook flow change. No restart under STEERING 22: prepared runner remains outside production worker imports.
- Verification: pnpm format, pnpm lint:fix, pnpm check (354 unit/187 isolated integration), pnpm build and git diff --check passed; root HTTP 200, healthy healthz, zero alerts/dangling volumes. Initial lint rejected intentional non-Error throws; added narrow documented test exceptions before rerunning checks.
- Next: Nov 4 scheduled review first; gated worker connection and actual scoring/final-pool waste measurements thereafter.
