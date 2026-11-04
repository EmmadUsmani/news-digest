## 2026-11-04: iteration 515 — measure incremental triage cache reuse offline

- Started clean on main; no leftover work. Healthz healthy, zero alerts, all 36 sources error-free (latest success 00:12:57 UTC). Nov 4 edition evidence is still future work.
- Added offline recorded-window replay using real CandidateTriage batching/item cache and synthetic scores, with 1/3/6/24-hour passes. No DB, HTTP, keys, production setting or activation. Updated TASKS and RANKING; system behavior/handbook unchanged.
- All 153 in-window articles scored once at every cadence. Hourly passes leave 7 edition items versus 153 cold, but create 50 total requests versus 5 cold. Prompt bytes 121,066 versus 65,824; reserved output tokens 70,000 versus 27,070. Neither measure is actual token usage/spend.
- Publication times are optimistic availability proxies; ingestion lag, discarded-pool waste, Gaming, production latency and reserve admission remain unmeasured. No quality or equal-cost claim. Next: off-by-default budget-safe implementation and recorded arrival/pool evidence.
- Verification: targeted replay tests 2/2; pnpm format, pnpm lint:fix, pnpm check (295 unit/182 isolated integration), pnpm build and git diff --check passed. Initial fake-adapter lint and overly broad reservation assertion corrected before green full check.
- Rebuilt and restarted API/worker; healthz recovered healthy, zero alerts, no dangling Docker volumes. No paid calls, editions, new sources, UI/schema changes or feature activation; screenshots unnecessary. Grouping stays off pending Nov 4 review.

## 2026-11-04: iteration 516 — replay arrival lag and discarded triage pools offline

- Started clean on main; no leftover work. Healthz/root healthy, zero alerts, all 36 sources error-free; newest success 00:21:35 UTC and 3,180 stored source items. Nov 4 scheduled evidence remains future work.
- Extended offline incremental replay with optional complete arrival times and ordered pool snapshots, plus a JSON input path. Counts unavailable-at-edition articles, distinct wasted pretriage and repeated scoring; disappearing/returning articles reuse cache. Invalid/partial evidence is rejected.
- Synthetic regression: one wasted score, one edition-boundary arrival unavailable, one late article scored at edition, zero repeat scores. These are synthetic results, not real lag/waste evidence. Existing three recorded windows remain unchanged (153 scored once; seven hourly edition items); their waste stays unknown.
- Updated TASKS and RANKING. No paid calls, DB writes, sources, scheduler/settings, production behavior or activation. Grouping stays off. No handbook/schema/UI changes; screenshots unnecessary.
- Verification: targeted replay tests 3/3; pnpm format, pnpm lint:fix, pnpm check, pnpm build, recorded replay CLI, healthz/root, source/queue status, pnpm obs alerts and git diff --check. Full suite passed: 296 unit and 182 isolated integration tests; no dangling Docker volumes.
- Services left running under STEERING 22: only offline scripts/tests/docs changed, so deployed application code still matches main. Next: capture real arrival/pool evidence and prepare off-by-default reserve-safe pretriage; Nov 4 scheduled review takes priority when available.

## 2026-11-04: iteration 517 — reduce offline pretriage request fragmentation

- Started clean on main; no leftover work. Healthz/root healthy, zero alerts, all 36 sources error-free; newest success 00:26:03 UTC, 3,181 stored source items. Nov 4 scheduled evidence remains future work.
- Added offline minimum-pending gate and CLI option; counts uncached available items, defers small passes, and always flushes the edition remainder. Default replay unchanged; no production scheduler, setting or activation.
- Recorded hourly replay at minimum 25: six requests versus 50 ungated (five cold), all 153 items scored once, 47 edition items versus seven ungated. NBA/World/Tech remainders 0/22/25. Prompt bytes 67,051; reserved output tokens 25,416. Neither is settled spend or live latency.
- Regression covers cache-miss gating, deferred passes, unconditional final flush and invalid thresholds. Recorded windows retain every article; real arrival/pool waste and reserve-safe budget admission remain unmeasured.
- Updated TASKS and RANKING; handbook/schema/UI unchanged, screenshots unnecessary. No paid calls, editions, source changes or feature activation; grouping remains off pending Nov 4 review.
- Verification: targeted replay tests 4/4, threshold CLI, pnpm format, pnpm lint:fix, pnpm check, pnpm build, healthz/root, source/queue status, pnpm obs alerts and git diff --check. Full suite passed: 297 unit and 182 isolated integration tests; zero dangling Docker volumes.
- Services stay running under STEERING 22: only offline files changed, so running application code matches main. Next: real arrival/pool evidence and off-by-default reserve-safe pretriage; Nov 4 scheduled review takes priority.

## 2026-11-04: iteration 518 — measure an offline pretriage cutoff

- Started clean on main; no leftover work. Healthz/root healthy, zero alerts; all 36 sources error-free, 3,183 stored source items, all four queues available. Nov 4 edition remains future evidence.
- Added offline `--stop-before-edition-hours` (default zero): skip pretriage at/after the relative cutoff, always flush remaining items at edition time. Accepts fractional hours; rejects invalid bounds. No production code/config or activation.
- Hourly recorded replay, minimum 25, two-hour cutoff: NBA/World/Tech edition remainders 26/22/25 (73 versus 47 without cutoff). All 153 articles scored once in six requests; 67,051 prompt bytes and 25,416 reserved output tokens unchanged.
- These use synthetic scores and publication proxies, not live latency, settled spend or ledger admission. A quiet period alone does not establish reserve safety. Real arrival/pool evidence and off-by-default budget-safe implementation remain next; Nov 4 review takes priority when available.
- Updated TASKS/RANKING; handbook/schema/UI unchanged. No paid calls, editions, sources or feature activation; grouping stays off. No screenshots needed.
- Verification: targeted tests 5/5, cutoff CLI, pnpm format, pnpm lint:fix, pnpm check (298 unit/182 isolated integration), pnpm build, git diff --check, healthz/root, status and pnpm obs alerts passed; zero dangling Docker volumes.
- Services stay running under STEERING 22: only offline scripts/tests/docs changed, so running application code matches main. Initial status probe used an incorrect path (404); canonical /api/status succeeded.

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
