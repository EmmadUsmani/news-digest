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

Iteration 221: [archive](docs/progress-archive/2026-11-02-iteration-221.md).

Earlier iteration 229: [archive](docs/progress-archive/2026-11-02-iteration-229.md).

Iteration 232: [archive](docs/progress-archive/2026-11-02-iteration-232.md).

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

## 2026-11-02: iteration 235 — database-backed AI edition golden

- Started clean on main; health, API/worker, 32 sources and four queues healthy. No leftover work.
- Priority 13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added synthetic LlmPort triage/editor responses and a complete stable AI edition golden.
- Real parsing/triage/editor services publish and retrieve fixture content through disposable PostgreSQL.
- Pins evidence, semantic scores, editor text, rejection and window boundaries; warm-cache regeneration stays identical with a new ID and preserves the first edition.
- Responses are synthetic, not live recordings; ledger/cache are in memory. No provider or Reddit requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (120 unit, 134 integration), `pnpm build` and `git diff --check` passed.
- Updated TASKS/database notes; remaining repository gaps and recorded-response golden stay open.
- Initial push rejected: owner added STEERING 15. Fetched/merged instructions-only commit without rewriting history; queued daily X search for every topic as next work.
- Deployment: API/worker restarted healthy; DB/Redis true, SPA 200, 32 error-free sources, four available queues.
- Next: observe Nov 3 14:30 UTC X discovery and 15:00 edition cost/duration; fallback timing is not AI latency evidence.

## 2026-11-02: iteration 236 — daily X search for every topic

- Started clean on main; health, services, 32 sources and four queues healthy. No leftover work.
- STEERING 15: scheduler visits every eligible topic weakest-free-coverage first, preserving owner-order ties.
- Rechecks settings/time before each sequential call; late searches skip. Second searches remain disabled.
- Migration 044 preserves calls and replaces global daily uniqueness with topic/day uniqueness under the shared budget lock.
- Scheduled holds project $0.10/call (~5x observed cost), settling actual usage before the next search; manual full-day holds and $0.40/day/$12/month caps remain.
- Fakes/disposable DB pin all-topic ordering, late-window stopping, concurrent projections, restart/rejection dedupe and direct-write uniqueness.
- Verification: `pnpm check` passed (122 unit, 135 integration); `pnpm build`, `pnpm format`, `pnpm lint:fix`, `git diff --check` passed.
- Applied `pnpm migrate`; restarted API/worker healthy; DB/Redis true, SPA 200, 32 error-free sources, four available queues.
- No paid/provider or Reddit requests; X ledger unchanged at $0.023382 today, no pending holds. Updated TASKS/SOURCES; archived iteration 220.
- Next: observe Nov 3 14:30 UTC all-topic discovery, report per-topic cost/yield and acknowledge STEERING 15; measure 15:00 AI edition/reserve outcome for 13/7.

## 2026-11-02: iteration 237 — queue failure isolation characterization

- Started clean on main; health, services, 32 sources and four queues healthy. No leftover work.
- Priority 13/7/9/15 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added Status characterization for one failed queue command while the other queues, sources and coverage remain available.
- Real disposable BullMQ scheduler pins next-run time, pause/resume and removal; job payloads remain private.
- Initial test setup incorrectly assumed Queue.close disables shared Redis commands; replaced with scoped command failure injection.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (122 unit, 136 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 221 to keep PROGRESS bounded. No provider or Reddit requests.
- Restarted API/worker healthy; DB/Redis true, SPA 200, 32 error-free sources, four available queues; latest edition retains four topics.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI edition reserve/cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 238 — connection isolation guard verification

- Started clean on main; API/worker and health green, 32 sources without current errors; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a verification.
- Added no-network tests for DB/Redis rejection without exact isolation admission and runner environment sanitization.
- Inherited production-shaped URLs, synthetic provider keys and live opt-ins are replaced without mutating the parent.
- Verification: targeted tests, `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 136 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived oldest progress entry. No provider or Reddit requests.
- Restarted API/worker healthy; DB/Redis true, SPA 200, 32 error-free sources, four available queues; latest edition has four topics.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI edition reserve/cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 239 — daylight-saving coverage boundaries

- Started clean on main; services/health green, 32 sources without current errors; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added disposable PostgreSQL coverage for elapsed 24-hour article windows across spring/fall DST in a non-UTC session.
- Pins inclusive start/exclusive end to millisecond precision plus connected-source and exact one-hour health counts.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 137 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 223 to keep PROGRESS bounded. No provider or Reddit requests.
- Restarted API/worker healthy; DB/Redis true, SPA 200, 32 error-free sources and four available queues.
- Read-only timing report confirms latest four-topic fallback edition remains intact; 856 ms is not live AI latency evidence.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI reserve/cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 240 — scheduled X verification admission

- Started clean on main; services/health green, 32 sources without current errors; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added repository characterization for ten-candidate cap, numeric ordering, per-call isolation and verified-post exclusion.
- Pins exact one-day cooldown plus millisecond neighbors, future checks and disabled/zero-budget topic exclusion in a non-UTC transaction.
- Initial fixture omitted the successful-call cost required by a DB constraint; corrected to zero, then the full check passed.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 138 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes. No provider or Reddit requests; all new fixtures roll back in disposable PostgreSQL.
- Restarted API/worker healthy; DB/Redis true, SPA 200, 32 error-free sources, four available queues; latest edition has four topics.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI reserve/cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 241 — missing X publication-time recovery

- Started clean on main; services/health green, 32 sources without current errors; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added maintenance characterization for exact millisecond inclusion, future exclusion/later recovery, legacy/overflow IDs and repeat runs.
- Full-row comparisons pin existing timestamps, non-X rows and all other evidence in a rolled-back non-UTC transaction.
- Initial fixtures violated X ID and Reddit metadata constraints; corrected fixtures without weakening schema or production behavior.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 139 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 224 to keep PROGRESS bounded. No provider or Reddit requests.
- Restarted API/worker healthy; DB/Redis true, SPA 200, 32 error-free sources and four available queues.
- Read-only timing report confirms retained four-topic editions; 856 ms fallback remains no live AI latency evidence.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI reserve/cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 242 — source health recovery

- Started clean on main; API/worker and health green, 32 sources without current errors; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added source-health characterization for first failure, successful collection, later failure and repeated empty recovery.
- Pins retained success timestamps/counts on failure, cleared errors/zero poll count on recovery, retained content and independent source health.
- First check stopped on formatting in the newly archived progress entry; formatted it and reran successfully.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 140 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 225 to keep PROGRESS bounded. No provider or Reddit requests.
- Restarted API/worker healthy; DB/Redis true, SPA 200, 32 error-free sources and four available queues.
- Read-only timing report confirms retained four-topic editions; 856 ms fallback remains no live AI latency evidence.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI reserve/cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 243 — shared-feed connection lifecycle

- Started clean on main; API/worker and health green; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added characterization for one shared-feed collection entry, identical two-topic content and active-connection eligibility independent of legacy ownership.
- Pins disabled-topic hiding, last-active-connection removal and retained observation/health recovery on re-enable.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 141 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 226 to keep PROGRESS bounded. No provider or Reddit requests.
- Restarted API/worker healthy; DB/Redis true, SPA 200, 32 error-free sources and four queues; latest edition has four topics.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI reserve/cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 244 — concurrent catalog capacity

- Started clean on main; API/worker and health green; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added a two-topic race for the last catalog slot: one winner, one rejection, exactly 500 sources and no rejected connection.
- Rejected caller then reuses the winning URL, pinning rollback, lock release and recovery at capacity.
- First check stopped on archived progress formatting; corrected it and reran successfully.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 142 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 227 to keep PROGRESS bounded. No provider or Reddit requests.
- Restarted API/worker healthy; DB/Redis true, SPA 200, 32 error-free sources and four queues.
- Read-only timing report confirms next edition Nov 3 15:00 UTC; retained 856 ms fallback is not AI latency evidence.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI reserve/cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 245 — concurrent canonical ingestion

- Started clean on main; API/worker and health green; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added concurrent publisher writes for one canonical article: one item, merged engagement, both observations and one attributed preview.
- Concurrent duplicate batches preserve identity/engagement and update source health independently without duplicating observations.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 143 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 228 to keep PROGRESS bounded. No provider or Reddit requests.
- Live checks: API/worker active, health DB/Redis true, SPA 200, 32 error-free sources, four available queues and four-topic latest edition.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI reserve/cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 246 — concurrent topic deletion and ordering

- Started clean on main; API/worker, health and all 32 sources healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added reorder-versus-delete and simultaneous-delete races; remaining settings and contiguous positions survive either serialization.
- Repeated deletion and stale order fail without changes; valid ordering restores original settings.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 144 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 229 to keep PROGRESS bounded. No provider or Reddit requests.
- Live checks: SPA 200, four-topic latest edition, 32 error-free sources and four available queues; API/worker restarted healthy.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI reserve/cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 247 — concurrent LLM cache persistence

- Started clean on main; API/worker, health and all 32 sources healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added concurrent ledger cache writes: one complete nested JSON winner, immutable replacement behavior and independent caller reads.
- Invalid JSON leaves a separate key absent; valid retry recovers without changing the winning response.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 145 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 230 to keep PROGRESS bounded. No provider or Reddit requests.
- Restarted API/worker healthy; health DB/Redis true, SPA 200, 32 error-free sources and four available queues.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI reserve/cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 248 — concurrent schedule replacement

- Started clean on main; API/worker and health green; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added concurrent schedule replacements through separate repository instances; returned/persisted configurations remain whole.
- Invalid-budget replacement racing a valid update preserves valid settings; subsequent updates recover normally.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 146 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes. Disposable fixtures only; no live schedule changes, provider or Reddit requests.
- Live checks: health DB/Redis true, four-topic latest edition, 32 error-free sources and four available queues.
- Restarted API/worker healthy; SPA 200. Next: observe Nov 3 X cost/yield and AI edition cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 249 — scheduled publication failure recovery

- Started clean on main; API/worker, health and all 32 sources healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added pre-publication failure coverage: original error propagates, history stays unchanged and no scheduled row persists.
- Independent-pool concurrent retries release/reacquire the session lock and publish exactly one immutable, retrievable snapshot.
- Initial checks caught documentation formatting and a cleanup delete blocked by edition immutability; corrected both.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 147 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 231 to keep PROGRESS bounded. No provider or Reddit requests.
- Restarted API/worker healthy; health DB/Redis true, SPA 200, four-topic latest edition, 32 error-free sources and four available queues.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI reserve/cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 250 — publisher admission time boundaries

- Started clean on main; API/worker, health and 32 sources healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3; advanced isolated STEERING 2a.
- Pinned inclusive publication window, future exclusion and success/error retry cutoffs to one millisecond in a non-UTC transaction.
- Pinned exact-day host recovery independently of the failed article's stricter retry cutoff.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 148 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 232 to keep PROGRESS bounded. No provider or Reddit requests.
- Restarted API/worker healthy; DB/Redis health true, SPA 200, 32 error-free sources, four available queues and four-topic latest edition.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI cost/duration before acknowledging 15/13/7.
