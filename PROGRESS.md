## 2026-11-04: iteration 519 — prepare reserve-safe background triage

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, all 36 sources error-free and all four queues available; Nov 4 edition evidence is still future work.
- Added an incremental triage entry point behind LLM_INCREMENTAL_TRIAGE_ENABLED=0. No collector/scheduler invokes it. Enabling requires scheduled reserve enforcement; background work clears inherited edition privileges and has a separate request coordinator while sharing the normal ledger/item cache.
- Unit tests cover disabled/invalid configuration and async context restoration. Isolated Postgres plus fake provider verifies full-reserve refusal inside a genuine claimed edition, ordinary-budget admission/settlement, and a different edition reusing cached scores without another call.
- No paid calls, source changes, production activation, UI or schema changes. Real arrival/pool waste, batching and scheduled latency remain unmeasured; grouping remains off pending Nov 4 review.
- Updated TASKS, RANKING and budget handbook; archived iterations 479–482 to keep PROGRESS under 25 KB. No diagrams or UI changed; screenshots unnecessary.
- Verification: targeted tests 2/2; pnpm format, pnpm lint:fix, pnpm check (300 unit/183 isolated integration), pnpm build, handbook check (17 pages/two unchanged diagrams, 25 tables), git diff --check. Zero dangling Docker volumes.
- Rebuilt/restarted API and worker; healthz/root healthy, zero alerts, 36 error-free sources/four available queues after restart. Next: recorded arrival/pool evidence and bounded scheduler batching, with activation gated on Nov 4 review.

## 2026-11-04: iteration 520 — support production-sized offline triage pools

- Started clean on main; no leftover work. Healthy healthz/root, zero alerts, 36 error-free sources (3,193 stored items) and four available queues. Nov 4 edition remains scheduled for 15:00 UTC.
- Fixed offline incremental replay failing above the triage entry point's 200-candidate bound: split complete pools into bounded invocations without dropping articles or changing production code/config.
- Synthetic 1,500-item arrival/pool regression scores each article once despite shifted chunk boundaries; 1,499 remain eligible, one pretriaged article counts as waste. Cold replay scores 1,499 once. This is accounting/scale verification, not real arrival/waste/cost/latency evidence.
- Existing recorded hourly minimum-25 replay stays at 153 scored articles, six requests and 47 edition-time items. No paid calls, activation, source changes, schema or UI changes; screenshots/handbook changes unnecessary.
- Updated TASKS and RANKING. Verification: targeted replay tests 6/6, recorded CLI, pnpm format, pnpm lint:fix, pnpm check (301 unit/183 isolated integration), pnpm build, git diff --check, healthz/root, status and pnpm obs alerts passed; no dangling Docker volumes.
- Services left running under STEERING 22 because only offline scripts/tests/docs changed; running application code matches main. Next: real arrival/pool evidence and bounded scheduler batching; Nov 4 scheduled review takes priority.

## 2026-11-04: iteration 521 — replay real first-fetch arrivals

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 error-free sources. Nov 4 scheduled evidence remains future work.
- Added read-only repeatable-read export: completed windows up to 48 hours, all source-associated candidates, per-topic exclusive mode-600 files outside repo; no model/job/settings writes. Tests reject invalid/future/oversized windows before DB access.
- Live Nov 3 UTC export: Tech/NBA/Gaming/World 332/159/296/236 articles; 6/3/2/2 arrived after midnight, none before publication. Global first fetch is not first topic observation; text/connections are current. No historical eligible-pool snapshots, so waste remains unknown.
- Offline hourly/minimum-25/two-hour-cutoff replay pretriaged 288/120/248/194, leaving 38/36/46/40 edition-time articles; 14/5/10/8 synthetic requests, zero repeat scoring. Not provider latency, settled cost or quality evidence. Exports: /tmp/triage-arrivals-521/.
- Updated TASKS/RANKING. No paid calls, feature activation, source/schema/UI or handbook flow changes; screenshots unnecessary. Next: historical pool evidence and bounded scheduler batching; Nov 4 review takes priority.
- Verification: targeted test 1/1; live export and all four replay CLIs; pnpm format, pnpm lint:fix, pnpm check (302 unit/183 isolated integration), pnpm build, git diff --check, healthz/root and pnpm obs alerts passed. Initial check caught a missing void test marker; fixed and reran. Zero dangling Docker volumes.
- Services left running under STEERING 22: only tooling/tests/docs changed, so application code matches main.

## 2026-11-04: iteration 522 — bound offline background triage passes

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors; Nov 4 edition remains scheduled for 15:00 UTC.
- Offline replay now accepts --maximum-items-per-pass, carries excess pending work to later ticks, reports bounded passes/peak backlog and leaves final edition scoring uncapped. Default behavior is unchanged.
- Nov 3 first-fetch exports, hourly/minimum-25/max-25/two-hour cutoff: Tech/NBA/Gaming/World pretriaged 275/125/250/200, edition remainder 51/31/44/34 (160 total), requests 13/6/12/9, zero repeats. Global fetch times still do not prove topic arrival; historical waste, settled cost, quality and latency remain unknown.
- Regression verifies backlog carryover, cutoff, complete final scoring and invalid bounds. Updated TASKS/RANKING; no paid calls, production activation, schema, source, UI or handbook flow changes.
- Verification: targeted replay tests 7/7; recorded fixture CLI and all four real-export CLIs; pnpm format, pnpm lint:fix, pnpm check (303 unit/183 isolated integration), pnpm build, git diff --check; live root/healthz/status healthy, 3,200 stored source items and zero alerts. No dangling Docker volumes.
- Services left running under STEERING 22 because only offline tooling/tests/docs changed. Next: historical pool evidence and scheduler wiring; Nov 4 edition review takes priority before activation.

## 2026-11-04: iteration 523 — prepare cache-aware bounded background passes

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 sources without current errors and four available queues; Nov 4 scheduled review remains pending.
- Added a read-only pending probe sharing edition scoring's unchanged fingerprints/validation, plus prepared bounded pass orchestration: chunk large pool probes, wait for minimum uncached work, carry backlog and leave refused scores pending.
- Fake-provider tests cover 450-item backlog, disjoint passes, budget-refusal retries, changed text/topic and corrupt-cache invalidation. A 60-item pool scores 25/25 before edition and flushes the 10-item tail once.
- No scheduler caller, activation or paid calls. Serialization, cutoff enforcement, historical eligible-pool/waste evidence and live cost/latency remain open; no schema/source/UI or handbook flow changes.
- Updated TASKS/RANKING. Verification: targeted tests 17/17; pnpm format, pnpm lint:fix, pnpm check (307 unit/183 isolated integration), pnpm build, git diff --check; no dangling Docker volumes.
- Rebuilt/restarted API and worker because shared triage code changed; healthz/root/status healthy, 36 error-free sources/four available queues and zero alerts after restart. Next: serialized scheduler wiring/cutoff and pool evidence; Nov 4 edition review takes priority.

## 2026-11-04: iteration 524 — serialize prepared background triage and enforce cutoff

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 error-free sources and four available queues. Nov 4 scheduled review remains pending.
- Prepared worker-local runner skips overlapping ticks before pool loading; one shared instance serializes all topics. It checks current schedule/clock before and after pool loading and again before scoring after cache reads; exact cutoff refuses scoring. In-flight calls may finish.
- Fake regressions cover concurrent ticks, schedule changes across cache reads, cutoff retries and loader/cache/provider/configuration failures releasing admission. No timer wiring, cross-process lock, activation or paid calls; eligible-pool/waste measurement remains open.
- Updated TASKS/RANKING; archived iterations 483–504 to keep PROGRESS under 25 KB. No source/schema/UI or handbook flow changes; screenshots unnecessary.
- Verification: targeted runner/replay tests 10/10; pnpm format, pnpm lint:fix and pnpm build passed. pnpm check passed (310 unit/183 isolated integration), git diff --check and live root/healthz/status passed; zero alerts and no dangling Docker volumes. Initial check caught archive formatting; corrected and reran.
- Services left running under STEERING 22: the new runner is not imported by running code, and existing runtime code/config is unchanged. Next: scheduler wiring and pool evidence; Nov 4 edition review takes priority.

## 2026-11-04: iteration 525 — capture prospective eligible triage pools

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 error-free sources and four available queues. Nov 4 review remains pending.
- Added read-only capture using the production newest-200 loader and edition hard-exclusion admission, retaining semantic recovery and zero-story-budget behavior. Consistent DB timestamp/text/settings identify each prospective observation; no backdated eligibility claims.
- Captured Nov 3 15:00–Nov 4 15:00 UTC at 01:07 UTC: Tech/NBA/Gaming/World candidates 172/53/175/94; eligible 172/52/174/94. Private mode-600 file /tmp/triage-pool-525.json; exclusive-create overwrite refusal verified.
- Capture alone measures current eligibility, not actual scored-work waste, cost or latency. Compare later snapshots for this same window, then join actual scoring. No paid calls, activation, source/schema/UI or handbook flow changes.
- Verification: targeted capture tests 2/2; live capture/stat/overwrite refusal; pnpm format, pnpm lint:fix, pnpm check (312 unit/183 isolated integration), pnpm build and git diff --check passed; no dangling Docker volumes. Services stay running under STEERING 22: only offline tooling/tests/docs changed.
- Updated TASKS/RANKING. Next: same-window pool comparison, scheduler wiring and actual waste evidence; Nov 4 scheduled edition review takes priority.

## 2026-11-04: iteration 526 — compare successive eligible triage pools

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root/status, 36 error-free sources and four available queues. Nov 4 edition review remains pending.
- Added offline same-window comparison with per-topic retained/new/lost eligibility, absent versus now-ineligible losses, topic additions/removals and setting changes. Rejects mismatched/reversed captures, malformed evidence and duplicate IDs.
- Captured /tmp/triage-pool-526.json (mode 600) at 01:11:49 UTC; comparison with iteration 525's 01:07:11 observation retains all 492 eligible candidates and adds 3 NBA. Short observation only; no actual scored-work waste, final membership, cache reuse, spend or latency claim.
- Updated TASKS/RANKING; no paid calls, activation, source/schema/UI or handbook flow changes. Services stay running under STEERING 22: only offline tooling/tests/docs changed.
- Verification: targeted comparison tests 3/3; live read-only capture/comparison; pnpm format, pnpm lint:fix, pnpm check (315 unit/183 isolated integration), pnpm build and git diff --check passed; no dangling Docker volumes.
- Next: longer-span same-window pool comparisons, scheduler wiring and actual scoring/waste joins; Nov 4 scheduled edition review takes priority.

## 2026-11-04: iteration 527 — prepare cross-process incremental triage admission

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 scheduled review remains pending.
- Added optional admission port and nonblocking Postgres session-lock adapter, separate from the budget lock; busy workers skip pool loading. Runner rechecks cutoff after admission and releases on success, cutoff and failure.
- Isolated Postgres regression covers independent pools, contention, idempotent release and loader-error recovery. Fake regression covers admission/release failures and crossing cutoff during acquisition.
- Session lock is not provider-call fencing after DB disconnection. No scheduler wiring, activation or paid calls; setting remains off. No schema/source/UI or handbook flow changes.
- Updated TASKS/RANKING. pnpm format, pnpm lint:fix, pnpm check (316 unit/184 isolated integration), pnpm build and git diff --check passed; live root/healthz/status healthy, four queues available, zero dangling Docker volumes.
- Services stay running under STEERING 22 because prepared code is not imported by running code. Next: scheduler wiring and longer-span eligibility/scored-work evidence; Nov 4 edition review takes priority.

## 2026-11-04: iteration 528 — compare prospective triage cache compatibility

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root/status, 36 error-free sources, four available queues and latest Bluesky collection completed.
- Added offline fingerprint comparison through production pending-cache probing with an empty local cache and explicit constant model. Reports retained input changes and potentially unusable prior fingerprints; no provider/database calls or cache writes.
- At 01:21 UTC all 492 eligible entries from 01:07 remain fingerprint-compatible; NBA adds three. Private mode-600 capture /tmp/triage-pool-528.json. Four regressions cover changed text/sources/guidance, truncation, eligibility and invalid evidence.
- Compatibility does not prove cached/scored work, waste, spend or latency. Updated TASKS/RANKING; scheduler wiring and successful-scoring joins remain next, with Nov 4 edition review first when available.
- No activation, paid calls, UI/schema/source or handbook flow changes. Services stay running under STEERING 22 because only offline tooling/tests/docs changed.
- Verification: pnpm format, pnpm lint:fix, pnpm check (320 unit/184 isolated integration), pnpm build, live read-only capture/comparison and git diff --check passed. Initial offline-stub require-await lint failure corrected before passing rerun; archived iterations 512–514 to keep orientation small.

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
