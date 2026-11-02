# Progress

Dated entries of 15 lines or fewer, newest last. Record what changed, how it
was verified (commands and results) and what's next. When this file passes
about 25 KB, keep about 20 entries and move older entries to `docs/progress-archive/`.

Earlier bootstrap and iterations 7–16: [archive](docs/progress-archive/2026-11-01-iterations-7-16.md).

Earlier iterations 17–22: [archive](docs/progress-archive/2026-11-01-iterations-17-22.md).

Earlier iterations 23–37: [archive](docs/progress-archive/2026-11-01-iterations-23-37.md).

Earlier iterations 51–60: [archive](docs/progress-archive/2026-11-01-iterations-51-60.md).

Earlier iterations 61–72: [archive](docs/progress-archive/2026-11-02-iterations-61-72.md).

Earlier iterations 87–100: [archive](docs/progress-archive/2026-11-02-iterations-87-100.md).
Earlier iterations 101–123: [archive](docs/progress-archive/2026-11-02-iterations-101-123.md).
Earlier iterations 124–132: [archive](docs/progress-archive/2026-11-02-iterations-124-132.md).

Earlier iterations 133–134: [archive](docs/progress-archive/2026-11-02-iterations-133-134.md).

Earlier iterations 135–136: [archive](docs/progress-archive/2026-11-02-iterations-135-136.md).

Earlier iterations 137–138: [archive](docs/progress-archive/2026-11-02-iterations-137-138.md).

Earlier iterations 139–140: [archive](docs/progress-archive/2026-11-02-iterations-139-140.md).

Earlier iterations 141–142: [archive](docs/progress-archive/2026-11-02-iterations-141-142.md).

Earlier iteration 143: [archive](docs/progress-archive/2026-11-02-iteration-143.md).

Earlier iteration 157: [archive](docs/progress-archive/2026-11-02-iteration-157.md).

Earlier iterations 161–162: [archive](docs/progress-archive/2026-11-02-iterations-161-162.md).

Earlier iterations 163–164: [archive](docs/progress-archive/2026-11-02-iterations-163-164.md).

Earlier iteration 165: [archive](docs/progress-archive/2026-11-02-iteration-165.md).

Iteration 166: [archive](docs/progress-archive/2026-11-02-iteration-166.md).

Earlier iterations 169–170: [archive](docs/progress-archive/2026-11-02-iterations-169-170.md).

Earlier iterations 171–172: [archive](docs/progress-archive/2026-11-02-iterations-171-172.md).

Earlier iterations 173–174: [archive](docs/progress-archive/2026-11-02-iterations-173-174.md).

Earlier iterations 175–176: [archive](docs/progress-archive/2026-11-02-iterations-175-176.md).

Iteration 177: [archive](docs/progress-archive/2026-11-02-iteration-177.md).

Iteration 178: [archive](docs/progress-archive/2026-11-02-iteration-178.md).

Iteration 179: [archive](docs/progress-archive/2026-11-02-iteration-179.md).

Iteration 180: [archive](docs/progress-archive/2026-11-02-iteration-180.md).

Earlier iteration 181: [archive](docs/progress-archive/2026-11-02-iteration-181.md).

Earlier iteration 182: [archive](docs/progress-archive/2026-11-02-iteration-182.md).

Iteration 183: [archive](docs/progress-archive/2026-11-02-iteration-183.md).

Iteration 184: [archive](docs/progress-archive/2026-11-02-iteration-184.md).

Iteration 186: [archive](docs/progress-archive/2026-11-02-iteration-186.md).

Iteration 187: [archive](docs/progress-archive/2026-11-02-iteration-187.md).

Iteration 188: [archive](docs/progress-archive/2026-11-02-iteration-188.md).

Iteration 189: [archive](docs/progress-archive/2026-11-02-iteration-189.md).

Iteration 192: [archive](docs/progress-archive/2026-11-02-iteration-192.md).

Earlier iteration 195: [archive](docs/progress-archive/2026-11-02-iteration-195.md).

Earlier iterations 198–199: [archive](docs/progress-archive/2026-11-02-iterations-198-199.md).

Earlier iterations 200–201: [archive](docs/progress-archive/2026-11-02-iterations-200-201.md).

Earlier iterations 202–203: [archive](docs/progress-archive/2026-11-02-iterations-202-203.md).

Iterations 204–205: [archive](docs/progress-archive/2026-11-02-iterations-204-205.md).

Earlier iteration 206: [archive](docs/progress-archive/2026-11-02-iteration-206.md).

Iteration 207: [archive](docs/progress-archive/iteration-207.md).

Iteration 208: [archive](docs/progress-archive/iteration-208.md).

Earlier iteration 210: [archive](docs/progress-archive/2026-11-02-iteration-210.md).

Iteration 212: [archive](docs/progress-archive/2026-11-02-iteration-212.md).

## 2026-11-02: iteration 213 — durable X search topic attribution

- Started clean on main; health, services, queues and 32 sources healthy. No leftover work.
- X reservations now snapshot requested topic ID/name before HTTP, retaining failed/zero-citation attribution through topic rename/deletion; historical calls remain NULL rather than guessed.
- Additive migration 041 and UTC daily report expose the snapshot separately from citation-derived/current verification evidence.
- Unit orchestration asserts attribution at reservation; isolated test covers rejection, empty success, rename/deletion and report retention.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed: 113 unit/115 isolated integration tests; `pnpm build` and `git diff --check` passed.
- `pnpm migrate` applied 041; API/worker restarted. `/healthz` DB/Redis true, SPA 200, four queues available, 32 sources without errors.
- `pnpm exec tsx scripts/report-x-discovery.ts 2026-11-02`: existing search $0.023382, two currently verified/dated citations; snapshot correctly NULL for historical call.
- Read-only `scripts/report-edition-timing.ts`: next edition Nov 3 15:00 UTC; prior 856 ms fallback remains insufficient AI evidence. No inference or Reddit requests.
- Updated README/SOURCES/TASKS; archived iterations 196–197 to keep orientation small. No UI change.
- Next: incremental verified additions, then capped pre-edition X scheduling. Items 13/7 await Nov 3 scheduled cost/timing evidence.

## 2026-11-02: iteration 214 — incremental X discovery yield

- Started clean on main; API/worker, health, four queues and 32 sources healthy. No leftover work.
- New citations snapshot first-search candidates absent from verified storage; serialized saves prevent repeat/concurrent attribution. Historical baselines stay NULL.
- Daily report adds new candidates/current verified yield and unknown baselines per search/topic; documents attribution versus causation or relevance.
- Isolated regression covers concurrent saves, existing/unverified posts, historical citations and idempotency. Corrected fixture cost and numeric-ID constraints after initial failures.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (113 unit/116 isolated integration); `pnpm build` and `git diff --check` passed.
- Applied migration 042; API/worker restarted; `/healthz` DB/Redis true, SPA 200, 32 sources without errors and four queues available.
- Read-only daily report: existing World search $0.023382; two verified/dated citations, both historical baselines unknown. No inference or Reddit requests.
- Timing report: next scheduled edition Nov 3 15:00 UTC; prior 856 ms fallback remains insufficient AI evidence.
- Updated README/SOURCES/TASKS; archived iterations 198–199. No UI change.
- Next: capped pre-edition X scheduling; unchanged full-day reservation. Items 13/7 await Nov 3 scheduled cost/timing evidence.

## 2026-11-02: iteration 215 — durable scheduled X admission

- Started clean on main; API/worker, health, four queues and 32 sources healthy. No leftover work.
- Migration 043 adds nullable unique scheduled UTC day; ledger atomically admits at most one scheduled attempt across topics/day under the shared budget lock, before HTTP.
- Rejected/uncertain attempts consume the day; budget denial does not. Stale/future days fail closed. Manual calls and full-day per-call hold remain unchanged.
- Isolated tests verify competing connections/topics, restart, rejection, uncertainty, rollover, unique constraint and no repeated fake HTTP after provider rejection.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed: 113 unit/118 isolated integration tests; `pnpm build` and `git diff --check` passed.
- `pnpm migrate` applied 043; API/worker restarted; `curl /healthz` DB/Redis true, SPA 200, 32 sources without errors and four queues available.
- Read-only `scripts/report-x-discovery.ts 2026-11-02`: $0.023382, two verified/dated historical World citations; baseline unknown. No inference or Reddit requests.
- `scripts/report-edition-timing.ts`: next Nov 3 15:00 UTC; prior 856 ms fallback remains insufficient AI evidence.
- Updated README/SOURCES/TASKS; no UI change. Next: pre-edition timer and weakest-topic choice using durable admission; items 13/7 await scheduled evidence.

## 2026-11-02: iteration 216 — pre-edition X search planning

- Started clean on main; API/worker and health healthy, 32 sources without errors. No leftover work.
- Added planner selecting fewest verified free-harvested X posts; ties preserve owner order, invalid/empty curated accounts skip.
- Repository counts distinct publisher/river post IDs in a half-open rolling 24-hour window; disabled/zero-budget topics excluded. Paid and Reddit citations do not affect scarcity.
- Planner accepts only 5–30 minutes before an edition and produces bounded UTC dates; no I/O or production paid scheduling yet.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` passed; 115 unit and 118 isolated integration tests passed.
- Read-only X report: $0.023382, two verified/dated historical World citations, unknown incremental baseline. No inference or Reddit requests.
- Timing report: next Nov 3 15:00 UTC; prior 856 ms fallback remains insufficient AI latency evidence.
- Updated TASKS/SOURCES; archived iterations 200–201. API/worker restarted; health DB/Redis true, SPA 200. Next: timer/search/official verification wiring with schedule-change and midnight tests; items 13/7 await Nov 3 evidence.

## 2026-11-02: iteration 217 — search-scoped official verification

- Started clean on main; API/worker and health healthy, 32 sources without errors and four queues available. No leftover work.
- Search completion exposes its durable call ID; repository selects up to ten unverified citations for that call, honoring enabled/positive-budget topics and persisted one-day cooldown.
- Extracted shared bounded verifier used by hourly collection: dedupe, at most ten requests, store before success acknowledgement, stop on first unavailable embed; no retry burst.
- Fake tests cover request bounds/dedupe, safe failure persistence and storage failures; isolated search test covers call scope, cooldown expiry and already-verified exclusion.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` passed; 117 unit and 118 isolated integration tests passed.
- Read-only X report: $0.023382, two verified/dated historical World citations, unknown incremental baseline. No inference or Reddit requests.
- Timing report: next Nov 3 15:00 UTC; prior 856 ms fallback remains insufficient AI latency evidence.
- Updated TASKS/SOURCES; API/worker restarted, health DB/Redis true and SPA 200. No UI change. Next: production timer/search/verification composition with schedule-change and midnight tests; items 13/7 await scheduled evidence.

## 2026-11-02: iteration 218 — automatic pre-edition X discovery

- Started clean on main; API/worker and health healthy, 32 sources without errors and four queues available. No leftover work.
- Social worker polls saved daily schedule every minute; 5–30 minutes before publication, searches the weakest eligible free-X topic through direct capped xAI and immediately verifies up to ten call-scoped candidates.
- Existing full-day hold and durable once-per-UTC-day admission remain unchanged; no provider retries. Rechecks saved settings after coverage I/O, skips late/disabled windows and missing keys.
- Only current-UTC-day editions qualify, preventing duplicate budget-day searches around midnight; editions before 00:05 UTC skip discovery.
- Fake tests cover saved timezone, stable run identity, replaced settings, delayed reads, midnight and zero post budget. Existing isolated tests cover durable admission and call-scoped verification.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check`; 120 unit and 118 isolated integration tests passed.
- Read-only `scripts/report-x-discovery.ts 2026-11-02`: $0.023382, two verified/dated historical World citations; incremental baseline unknown. No inference or Reddit requests.
- `scripts/report-edition-timing.ts`: next Nov 3 15:00 UTC; prior 856 ms fallback remains insufficient AI evidence. First automatic X search expected Nov 3 14:30 UTC if settings remain unchanged.
- API/worker restarted; health DB/Redis true, SPA 200, 32 sources without errors and four queues available. Updated TASKS/SOURCES; archived iterations 202–203. No UI change. Next: observe automatic search cost/yield and Nov 3 scheduled AI cost/duration for items 13/7.

## 2026-11-02: iteration 219 — edition history characterization

- Started clean on main; API/worker, health, 32 sources and four queues healthy. No leftover work.
- Items 13/7/9 await Nov 3 scheduled evidence; advanced lower-priority STEERING 2a using disposable services only.
- Added repository-port assertions for profile isolation, unknown IDs, exact snapshot JSON, detached read results, stable UUID ordering at tied timestamps, 20-entry pagination/end offsets and timezone normalization.
- Historical fixtures cannot replace newer default-profile editions; a newer foreign-profile fixture verifies latest/history isolation. Registered the test in the isolated suite and documented coverage in README/TASKS.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`; 120 unit and 119 isolated integration tests passed. No application behavior or UI change.
- Read-only timing report: next Nov 3 15:00 UTC; prior 856 ms fallback is not AI latency evidence. X report Nov 2: $0.023382, two verified/dated historical World citations, incremental baseline unknown.
- No inference or Reddit requests. API/worker restarted; health DB/Redis true, SPA 200, 32 sources without errors and four queues available. `git diff --check` passed. Next: observe Nov 3 14:30 X discovery and 15:00 scheduled AI cost/duration; 2a remains incomplete.

## 2026-11-02: iteration 220 — profile repository characterization

- Started clean on main; API/worker and health healthy, 32 sources without errors and all four queues available. No leftover work.
- Items 13/7/9 await Nov 3 scheduled evidence; advanced lower-priority STEERING 2a against disposable containers only.
- Added repository-port coverage for foreign-profile schedule isolation, detached reads, inclusive story/post budget bounds, atomic rejection of invalid budgets and explicit missing-schedule errors without foreign-profile fallback.
- Test restores the default schedule and removes foreign fixtures; registered in the isolated suite and documented in README/TASKS. No application behavior or UI change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check`; 120 unit and 120 isolated integration tests passed.
- Read-only timing report: next Nov 3 15:00 UTC; prior 856 ms fallback is not AI latency evidence. X report Nov 2: $0.023382, two verified/dated historical World citations, incremental baseline unknown.
- No inference or Reddit requests. API/worker restarted; health DB/Redis true and SPA 200. Next: observe Nov 3 14:30 X discovery and 15:00 scheduled AI cost/duration; 2a remains incomplete.

## 2026-11-02: iteration 221 — topic source connection characterization

- Started clean on main; API/worker and health healthy, 32 sources without errors and four queues available. No leftover work.
- Items 13/7/9 await Nov 3 scheduled evidence; advanced lower-priority STEERING 2a using disposable containers only.
- Added repository-port assertions for atomic source replacement/rejection, duplicate/unknown source rejection, sorted connections, disconnects and missing-topic registration rollback.
- Custom-feed URL dedupe is pinned across repeated registration and multiple topics; deleting a connected topic preserves the catalog entry for reuse. No feed fetches occur.
- Registered isolated test and updated README/TASKS; archived iteration 206 to keep PROGRESS bounded. No application behavior or UI change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check`; 120 unit and 121 isolated integration tests passed.
- Live read-only status: next scheduled edition Nov 3 15:00 UTC; prior 856 ms fallback remains insufficient AI timing evidence. No inference or Reddit requests.
- API/worker restarted; health DB/Redis true, SPA 200. Next: observe Nov 3 14:30 X discovery and 15:00 scheduled AI cost/duration; 2a remains incomplete.

## 2026-11-02: iteration 222 — nonempty fallback golden edition

- Started clean on main; API/worker, health, 32 sources and four queues healthy. No leftover work.
- Items 13/7/9 await Nov 3 scheduled evidence; advanced lower-priority STEERING 2a using disposable containers only.
- Added fixed synthetic inputs and a reviewed golden snapshot for nonempty fallback publication, exact retrieval and regeneration preserving the earlier edition.
- Pins half-open window boundaries, story ordering/scores, source provenance, quality rejection and explicit non-AI labels; only generated edition ID/time are omitted from golden comparison.
- Initial full check caught missing required include_guidance in the test seed; fixed it and passed the isolated targeted test, then reran the full check.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check`; 120 unit and 122 isolated integration tests passed. No application behavior or UI change.
- Updated README/TASKS and archived iteration 207 to bound PROGRESS. AI golden coverage and database coverage reporting remain open; 2a is not complete.
- Read-only timing report: next Nov 3 15:00 UTC; prior 856 ms fallback is not AI latency evidence. No inference or Reddit requests.
- API/worker restarted; health DB/Redis true, SPA 200, 32 sources without errors and four queues available. Next: observe Nov 3 14:30 X discovery and 15:00 scheduled AI cost/duration.

## 2026-11-02: iteration 223 — database coverage reporting

- Started clean on main; API/worker, health, 32 sources and four queues healthy. No leftover work.
- Items 13/7/9 await Nov 3 scheduled evidence; advanced lower-priority STEERING 2a using disposable containers only.
- Integration runner now prints native V8 line/branch/function coverage for database helpers/adapters and direct operations status; included in `pnpm check`, without new dependencies.
- Added measured baseline and gap guidance in docs/DATABASE-VERIFICATION.md and README; source and compiled HTTP rows remain separate, unloaded files are unmeasured, migration setup is excluded.
- All 16 database source helpers/adapters plus operations status appear; usage reader branches are 42.86%, operations status 79.41%. Coverage is not proof of complete query characterization; AI golden remains open.
- Verification: targeted `pnpm test:integration`, then `pnpm format`, `pnpm lint:fix`, `pnpm check` (120 unit/122 isolated integration), `pnpm build` passed. No inference or Reddit requests.
- Read-only timing report confirms next scheduled edition Nov 3 15:00 UTC; previous 856 ms fallback is not AI latency evidence.
- Compacted TASKS and archived iteration 208 to bound orientation files. Next: observe Nov 3 14:30 X discovery and 15:00 edition; continue 2a behavior gaps while waiting.
- Deployment check: API/worker restarted active; health DB/Redis true, SPA 200, 32 sources without errors, four queues available; retained real edition has four topics, 20 stories and 10 posts. Final format check and `git diff --check` passed.

## 2026-11-02: iteration 224 — usage ledger characterization

- Started clean on main; API/worker, health and 32 sources healthy. No leftover work.
- Items 13/7/9 await Nov 3 scheduled evidence; advanced STEERING 2a with disposable-container reader assertions.
- Pinned empty usage, UTC day/month boundaries and offset timestamp, model totals/order/allocation, failed reservations, old uncertain holds, latest errors and expired/current provider blocks.
- Source usage.reader coverage rises from 42.86% to 92.86% branches and 100% lines; characterization is still incomplete, including AI golden. No application/UI change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (120 unit, 123 isolated integration), `pnpm build`, `git diff --check` passed. No inference or Reddit requests.
- Updated TASKS/database verification notes; archived iteration 209 to bound PROGRESS.
- Read-only timing: next Nov 3 15:00 UTC; prior 856 ms fallback is not AI latency evidence. Next: observe 14:30 X search and scheduled edition cost/duration.
- Deployment: API/worker restarted active; DB/Redis healthy, SPA 200, 32 sources without errors, four queues available; retained real edition has four topics, 20 stories and 10 posts.

## 2026-11-02: iteration 225 — historical AI-cost characterization

- Started clean on main; API/worker, health, 32 sources and four queues healthy. No leftover work.
- Items 13/7/9 await Nov 3 evidence; advanced lower-priority STEERING 2a through disposable-database reader assertions.
- Pinned complete-AI snapshot eligibility, missing fields, partial social scores, deterministic tied ordering/limits, millisecond boundaries and bigint safe-integer rejection.
- Historical edition-cost reader: 100% lines, 92.31% branches (baseline 80%); AI golden and remaining repository behavior stay open. No application/UI change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (120 unit, 124 isolated integration); no inference or Reddit requests.
- Updated TASKS/database notes and archived iteration 210 to bound PROGRESS.
- Read-only timing confirms Nov 3 15:00 UTC next edition; prior 856 ms fallback is not AI latency evidence. Next: observe 14:30 X search and scheduled edition cost/duration.
- `pnpm build` and `git diff --check` passed; restarted API/worker active, DB/Redis healthy, SPA 200, 32 error-free sources and four queues available; retained real edition has four topics, 20 stories and 10 posts.

## 2026-11-02: iteration 226 — topic coverage characterization

- Started clean on main; health, 32 sources and four queues healthy. No leftover work. Two retained ingestion failures are historical; both sources recovered.
- Items 13/7/9 await Nov 3 scheduled evidence; advanced lower-priority STEERING 2a with disposable-database coverage assertions.
- Pinned discovery-route unions/deduplication, empty counts, tied ordering, topic isolation/reassignment/deletion, source-health boundaries and millisecond post windows in a non-UTC session.
- Synthetic Reddit rows only; no inference or Reddit requests. AI golden and other repository characterization remain open.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (120 unit, 125 isolated integration), plus `pnpm build`. First check rejected a zero-reservation fixture; corrected to a valid positive reservation before the passing rerun.
- Compacted TASKS below 8 KB and archived iteration 211 to keep PROGRESS below 25 KB; updated database verification notes.
- Read-only Status confirms Nov 3 15:00 UTC next edition; retained 856 ms fallback is not AI latency evidence. Next: observe 14:30 X search and scheduled AI cost/duration.
- Deployment: API/worker restarted active; `/healthz` DB/Redis true, SPA 200, 32 error-free sources and four available queues. `git diff --check` passed.

## 2026-11-02: iteration 227 — custom-feed capacity characterization

- Started clean on main; health, 32 sources and four queues healthy. No leftover work.
- Items 13/7/9 await Nov 3 scheduled evidence; advanced lower-priority STEERING 2a with isolated custom-feed admission assertions.
- Pinned 500 catalog/100 topic-connection limits, unchanged state on rejection, idempotent connections at capacity and existing-URL reuse with one remaining slot.
- Topic repository source coverage: 94.80% lines, 82.46% branches; AI golden and remaining behavior gaps stay open.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (120 unit, 126 integration), `pnpm build`, `git diff --check` passed. Initial check caught archive formatting; formatted and reran successfully.
- Updated TASKS/database verification notes; archived iteration 212 to bound PROGRESS. No inference or Reddit requests.
- Next: observe Nov 3 14:30 UTC X discovery and 15:00 edition cost/duration; prior fallback duration is not AI latency evidence.
- Deployment: API/worker restarted active; `/healthz` DB/Redis true, SPA 200, 32 error-free sources and four available queues; retained edition has four topics, 20 stories and 10 posts.
