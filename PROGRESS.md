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

Earlier iteration 213: [archive](docs/progress-archive/2026-11-02-iteration-213.md).

Archived iteration 216: [entry](docs/progress-archive/2026-11-02-iteration-216.md).

Iteration 217: [archive](docs/progress-archive/2026-11-02-iteration-217.md).

Earlier iteration 218: [archive](docs/progress-archive/2026-11-02-iteration-218.md).

Earlier iteration 219: [archive](docs/progress-archive/2026-11-02-iteration-219.md).

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

## 2026-11-02: iteration 228 — ingestion citation characterization

- Started clean on main; API/worker, health, 32 sources and four queues healthy. No leftover work.
- Items 13/7/9 await Nov 3 scheduled evidence; advanced lower-priority STEERING 2a with isolated ingestion citation assertions.
- Pinned URL-derived IDs, duplicate/host rejection, independent source citations, named verification URL and first-seen preservation, last-seen updates and engagement JSON replacement.
- Invalid later items roll back citation inserts/updates and source health together. No inference or Reddit requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (120 unit, 126 integration); `pnpm build` and `git diff --check` passed.
- Updated TASKS/database notes and archived iteration 213 to bound PROGRESS. AI golden and other repository behavior gaps remain open.
- Deployment: restarted API/worker active; `/healthz` DB/Redis true, SPA 200, 32 error-free sources and four available queues. Retained edition: four topics, 20 stories, 10 posts.
- Next: observe Nov 3 14:30 UTC X discovery and 15:00 edition cost/duration; prior fallback timing is not AI latency evidence.

Archived iteration 214: [entry](docs/progress-archive/2026-11-02-iteration-214.md).

## 2026-11-02: iteration 229 — publisher-discovery ordering characterization

- Started clean on main; health, 32 sources and four queues healthy. No leftover work.
- Items 13/7/9 await Nov 3 scheduled evidence; advanced lower-priority STEERING 2a through the publisher-discovery port.
- Pinned eight-candidate cap, tied UUID ordering, topic reordering, shared-publisher deduplication, host-wide failure cooldown and recovery.
- All fixtures are disposable PostgreSQL rows; no inference, publisher or Reddit requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (120 unit, 127 integration), `pnpm build` and `git diff --check` passed.
- Updated TASKS/database notes and archived iteration 214 to bound PROGRESS. AI golden and other repository behavior gaps remain open.
- Deployment: API/worker restarted active; `/healthz` DB/Redis true after startup retry, SPA 200, 32 error-free sources and four available queues. Retained edition: four topics, 20 stories, 10 posts.
- Next: observe Nov 3 14:30 UTC X discovery and 15:00 edition cost/duration; prior fallback timing is not AI latency evidence.

## 2026-11-02: iteration 230 — river-discovery transaction characterization

- Started clean on main; services and health healthy. No leftover work.
- Priority items 13/7/9 await Nov 3 scheduled evidence; advanced isolated STEERING 2a coverage.
- Pinned river citation duplicate collapse, collection counts, URL/first-seen preservation, last-seen refresh and verification URL replacement.
- A later invalid citation rolls back inserts, updates and source health; empty successful collection clears errors and retains evidence.
- No inference, publisher or Reddit requests. AI golden and remaining repository behavior gaps stay open.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (120 unit, 128 integration), `pnpm build` and `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 215 to bound PROGRESS.
- Deployment: API/worker restarted healthy; DB/Redis true, SPA 200, 32 error-free sources, four available queues; retained edition has four topics.
- Next: observe Nov 3 14:30 UTC X discovery and 15:00 edition cost/duration; fallback timing is not AI latency evidence.

## 2026-11-02: iteration 231 — X-search transaction characterization

- Started clean on main; services, health, 32 sources and four queues healthy. No leftover work.
- Priority items 13/7/9 await Nov 3 scheduled evidence; advanced isolated STEERING 2a coverage.
- Pinned partial-save rollback, unchanged prior yield evidence and committed-only verification candidates.
- Retry on another call owns first-search attribution; duplicate links and empty saves remain idempotent.
- No X, Reddit or inference requests. AI golden and remaining repository behavior gaps stay open.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (120 unit, 129 integration), `pnpm build` and `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 216 to bound PROGRESS.
- Deployment: API/worker restarted healthy; DB/Redis true, SPA 200, 32 error-free sources, four available queues; retained edition has four topics.
- Next: observe Nov 3 14:30 UTC X discovery and 15:00 edition cost/duration; fallback timing is not AI latency evidence.

## 2026-11-02: iteration 232 — topic write isolation and rollback

- Started clean on main; services, health and source collection healthy. No leftover work.
- Priority items 13/7/9 await Nov 3 scheduled evidence; advanced isolated STEERING 2a coverage.
- Pinned foreign/missing-topic rejection across writes without catalog or cross-profile changes.
- Invalid JSON create/update preserves settings/order; later writes recover, round-trip Unicode and preserve/clear social lists.
- Fixed fixture cleanup to delete its child topic before the parent profile after the first integration run caught the foreign key.
- No X, Reddit or inference requests. AI golden and other repository behavior gaps remain open.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (120 unit, 131 integration), `pnpm build` and `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 217 to bound PROGRESS.
- Deployment: API/worker restarted healthy; DB/Redis true, SPA 200, 32 error-free sources, four available queues; retained edition: four topics, 20 stories, 10 posts.
- Next: observe Nov 3 14:30 UTC X discovery and 15:00 edition cost/duration; fallback timing is not AI latency evidence.

## 2026-11-02: iteration 233 — verified-post refresh characterization

- Started clean on main; services, health, 32 sources and four queues healthy. No leftover work.
- Priority items 13/7/9 await Nov 3 scheduled evidence; advanced isolated STEERING 2a coverage.
- Pinned verified-post insert/upsert field preservation, author/embed refresh, timestamp offsets/precision and single-row dedupe.
- Database-rejected JSON leaves the prior row and verification time intact; a later valid refresh recovers.
- No provider or Reddit requests. AI golden and other repository behavior gaps remain open.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (120 unit, 132 integration), `pnpm build` and `git diff --check` passed.
- Initial check stopped on docs formatting after a late docs edit; formatted and reran successfully.
- Updated TASKS/database notes; archived iteration 218 to bound PROGRESS.
- Deployment: API/worker restarted healthy; DB/Redis true, SPA 200, 32 error-free sources, four available queues; retained edition: four topics, 20 stories, 10 posts.
- Next: observe Nov 3 14:30 UTC X discovery and 15:00 edition cost/duration; fallback timing is not AI latency evidence.

## 2026-11-02: iteration 234 — edition history boundaries

- Started clean on main; services, health and all 32 sources healthy. No leftover work.
- Two retained ingestion failures are historical; both sources subsequently collected successfully (50/60 items).
- Priority items 13/7/9 await Nov 3 scheduled evidence; advanced isolated STEERING 2a coverage.
- Pinned timestamp-before-ID ordering, exact 20-entry pagination, exhausted/negative offsets and recovery.
- Latest reads respect persisted sort keys, tied IDs and caller mutation isolation; history retains UTC/millisecond fidelity.
- No provider or Reddit requests. AI golden and other repository behavior gaps remain open.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (120 unit, 133 integration), `pnpm build` and `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 219 to bound PROGRESS.
- Deployment: API/worker restarted healthy; DB/Redis true, SPA 200, 32 error-free sources, four available queues.
- Next: observe Nov 3 14:30 UTC X discovery and 15:00 edition cost/duration; fallback timing is not AI latency evidence.
