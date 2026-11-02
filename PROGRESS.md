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

## 2026-11-02: iteration 180 — show AI spend by purpose

- Started clean on main; no leftover work. API/worker, health and 32 sources healthy; two historical ingestion failures retained, no failed digest/social jobs.
- Status shows UTC-day/month spend and unresolved reservations per ledger purpose, including development verification. Historical tags stay visible with an explicit warning that older development/editorial spend cannot reliably be separated.
- Isolated transactional test covers mixed purposes, failed calls, old uncertain holds, expired settled calls and reconciliation to overall totals. Existing app/model budgets unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (181 tests); `pnpm build` passed. `pnpm exec tsx scripts/smoke-ai-spend.ts` passed read-only desktop/mobile checks; screenshots saved and mobile inspected.
- Restarted API/worker; `/healthz` database/Redis true. Read-only timing report confirms latest real edition four topics/10 posts; available budget unchanged at 848 micros. No inference, settings writes or source changes.
- Updated TASKS/docs/LLM. Next: fingerprinted LlmPort replay; legitimate Reddit access/live AI timing remain blocked, paid xAI scheduling follows Reddit.

## 2026-11-02: iteration 181 — fingerprinted offline LLM replay

- Started clean on main; no leftover work. API/worker, health, 32 sources and queues available. Higher priorities still await legitimate Reddit access and live AI timing budget (848 micros available).
- Extracted unchanged production cache fingerprint and added fail-closed replay plus response-recording LlmPort adapters. Repeated requests replay in order; changed prompts/models fail without network fallback.
- Guarded historical recorder now saves raw successful responses/model/fingerprint to new fixtures even when later validation fails; preserves opt-in, verification cap and existing snapshot refusal. No keys/headers/request text/provider errors recorded.
- Added explicitly synthetic transport fixture; no paid recording or inference. Full editorial golden wiring to raw recordings remains open; older validated snapshots cannot faithfully supply transport responses.
- Targeted `pnpm exec tsx --test apps/api/test/recorded-llm.test.ts apps/api/test/llm.test.ts` passed (23 tests). Fixed replay method lint error before final checks.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (184 tests); `pnpm build` passed. No UI changes; no browser check needed.
- Restarted API/worker; `/healthz` DB/Redis true. Read-only `scripts/report-edition-timing.ts`: latest real scheduled edition four topics/10 X posts; spend unchanged. No settings/content writes or source changes.
- Updated TASKS/docs/LLM; archived iteration 167 to keep orientation small. Next: full editorial fixture replay; Reddit/live AI timing blockers unchanged, scheduled xAI follows Reddit per owner order.

## 2026-11-02: iteration 182 — article publication transport replay

- Started clean on main; no leftover work. API/worker and health healthy; 32 sources and all queues available, no retained failed jobs.
- Added authored synthetic raw triage/editor responses and frozen topic golden. Replaying LlmPort now traverses real budgeting, triage, editor validation and publication mapping with fake ledger/SQL; two fresh-cache runs match all topic fields and retain progress/commit assertions.
- This is article-path synthetic coverage, not real provider recordings, social selection or SQL integration. No prompt changes, re-recordings, paid inference, live content/settings writes or source changes.
- First direct targeted run hit the existing isolation guard; rerun with isolated flag and invalid DB URL passed 7/7 without connecting. Full disposable-service suite passed 185/185.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build` passed; no UI changes/browser check needed.
- Restarted API/worker; healthy `/healthz` DB/Redis true. Read-only timing report: latest real edition four topics/10 posts; available app budget unchanged at 848 micros.
- Updated TASKS/docs/LLM. Next: real raw-response golden coverage when legitimately captured; Reddit access/live AI timing still blocked, scheduled xAI follows Reddit per owner order.

## 2026-11-02: iteration 183 — Testcontainers verification infrastructure

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without current errors, all queues available; two historical ingestion failures retained, no failed digest/social jobs.
- Higher priorities remain blocked: real AI latency has only 848 micros available; Reddit access remains denied. No paid calls or live settings/content writes.
- Replaced manual Docker lifecycle with Testcontainers PostgreSQL 17/Redis 7 matching compose, fresh migrations/seeds, readiness waits, cleanup and resource reaper.
- Added separate `pnpm test:unit` (99 tests, no Docker, database access blocked) and `pnpm test:integration` (86 tests, disposable services); `pnpm test`/`check` include both. Both clear inference keys and live opt-in; mixed files remain integration.
- Targeted commands passed 99/99 and 86/86. `pnpm format`, `pnpm lint:fix`, `pnpm check` passed all 185 tests; `pnpm build` passed. Temporary database/Redis containers removed; no UI changes/browser check needed.
- Updated README/TASKS; archived completed speed detail to keep TASKS under 8 KB. STEERING 2a is partial: full repository/HTTP characterization, golden SQL edition and coverage reporting remain before ORM work.
- Restarted API/worker after build; `/healthz` DB/Redis true. Read-only timing report confirms latest real scheduled edition four topics/10 X posts; budget unchanged. No source changes.
- Next: expand repository/HTTP characterization while Reddit/live AI evidence is blocked; scheduled xAI still follows Reddit per owner order.

## 2026-11-02: iteration 184 — production-module HTTP characterization

- Started clean on main; no leftover work. API/worker/health healthy, all 32 sources recently successful, no digest/social failures; two retained historical ingestion failures unchanged.
- Higher priorities still blocked by Reddit access and live AI timing budget (848 micros available). No paid inference, live content/settings writes or source changes.
- Extracted the unchanged production Nest module from bootstrap so HTTP tests boot the same app on an ephemeral loopback port. Integration runner builds API first to preserve Nest constructor metadata.
- Added HTTP characterization for healthy DB/Redis, topic create/read/update/delete, JSON fields, reorder/position closure, catalog/connections, missing/invalid IDs and atomic rejected writes.
- Profile HTTP tests persist an Asia/Kolkata schedule and budgets, reject invalid timezone/window/budget changes without mutation and restore fixture settings. App shutdown is registered even on assertion failure.
- `pnpm test:integration` passed 87/87; `pnpm format`, `pnpm lint:fix`, full `pnpm check` passed 99 unit/87 integration tests; `pnpm build` passed. No UI changes/browser check needed.
- Updated README/TASKS; archived iterations 169–170 to keep orientation small. STEERING 2a remains partial; digest/edition HTTP, remaining repository characterization and database coverage precede ORM work.
- Restarted API/worker; `curl /healthz` DB/Redis true, SPA HTTP 200 and `/api/status` all queues available. Latest real edition still has four topics/10 X posts; source successes remain current. Read-only timing report confirms spend unchanged.
- Next: digest/edition HTTP characterization and remaining repository-port coverage; Reddit/live AI evidence blockers unchanged, scheduled xAI still follows Reddit per owner order.

## 2026-11-02: iteration 185 — digest and edition HTTP characterization

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without current errors, no failed digest/social jobs; two historical ingestion failures unchanged.
- Added production-module HTTP tests against disposable Postgres/Redis for synchronous publication, retrieval/latest/history offsets, rejected windows/IDs/offsets and preservation of earlier snapshots.
- A real BullMQ worker calls the real repository: overlapping HTTP creation requests dedupe, complete, expose duration/edition ID and publish retrievable immutable editions. Empty historical content fixes transport/persistence behavior; this is not a nonempty editorial golden.
- `pnpm test:integration` passed 88/88; typecheck passed. Initial lint found an assertion style issue (fixed); a check then caught formatting in the newly archived progress entries (fixed).
- No paid inference, live settings/content writes, source changes or UI changes; browser verification unnecessary. Updated README/TASKS and archived iterations 171–172 to keep orientation small.
- Final `pnpm format`, `pnpm lint:fix`, `pnpm check` (99 unit/88 integration) and `pnpm build` passed. Restarted API/worker; health DB/Redis true, SPA 200, all queues available and 32 sources without errors; latest real edition retains four topics/10 X posts.
- Next: remaining repository characterization, nonempty SQL golden and database coverage before ORM work. Reddit access/live AI timing blockers persist; scheduled xAI follows Reddit.

## 2026-11-02: iteration 186 — ingestion repository characterization

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without errors, queues available; two historical ingestion failures unchanged.
- Added disposable-Postgres characterization of connected/enabled source eligibility, empty/latest views, shared observations, URL dedupe, five-item order/limit and betting exclusion.
- Pinned timezone normalization, stable item identity, title/excerpt updates and merged engagement JSON while original author/image/publication time persist.
- Covered 300-character failure truncation, preserved last success, atomic batch rollback of inserts and existing updates, empty-store recovery and disabled-topic visibility. Assertions use repository methods; SQL only seeds/cleans fixtures and inspects fields lacking public readers.
- `pnpm test:integration` passed 89/89; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (99 unit/89 integration) and `pnpm build` passed. No paid inference, live mutations, source or UI changes; browser verification unnecessary.
- Read-only timing report confirms 848 micros available and latest real edition four topics/10 X posts; 856 ms fallback run is not live AI latency evidence. Reddit denial remains unresolved; paid scheduling follows Reddit.
- Restarted API/worker; health DB/Redis true, SPA 200, all four queues available and 32 sources without errors. Updated README/TASKS. Next: remaining repository characterization, nonempty SQL golden and database coverage before any ORM swap.

## 2026-11-02: iteration 187 — Reddit observation characterization

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without errors; two historical ingestion failures unchanged.
- Disposable-Postgres tests pin inclusive seven-day lookback, exclusive end, timezone normalization, timestamp tie ordering, shared-topic dedupe and case-insensitive community aggregation.
- Covered disabled/removed communities, write-time association checks, topic deletion isolation and rollback of existing metadata, new posts and X citations after a later invalid insert.
- Initial integration run caught an overlong synthetic Reddit ID; corrected to the schema limit. Full `pnpm check` passed 99 unit/90 integration tests; `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` passed.
- Restarted API/worker; health DB/Redis true, SPA 200, all queues available, no current source errors. Latest real edition has four topics/10 posts. No paid inference, live mutations or UI changes.
- Updated README/TASKS. Next: remaining repository coverage, nonempty SQL golden and database coverage before ORM work. Reddit access/live AI timing blockers persist; paid scheduling follows Reddit.

## 2026-11-02: iteration 188 — publisher citation transaction characterization

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without errors; two historical ingestion failures unchanged.
- Added disposable-Postgres publisher coverage for shared-topic candidate dedupe, enabled/deleted topic connections, removed opt-in hosts and stale-candidate writes.
- Pinned engagement JSON, verification URL updates and stable first-seen provenance. A fixture-only final-write constraint failure proves citation inserts/updates and check state roll back together; successful retry recovers.
- Initial integration run found fixture cleanup violating an observation FK and contaminating a later count; fixed cleanup order. A full check caught new archive formatting; corrected. Final `pnpm check` passed 99 unit/91 integration tests.
- Updated README/TASKS and archived iterations 173–174 to keep PROGRESS below 25 KB. No paid inference, live settings/content writes or UI changes; browser verification unnecessary.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` passed. Restarted API/worker; health DB/Redis true, SPA 200, queues available and no current source errors; latest real edition retains four topics/10 posts.
- Next: remaining repository coverage, nonempty SQL golden and database coverage before ORM work. Reddit access/live AI timing blockers persist; paid scheduling follows Reddit.

## 2026-11-02: iteration 189 — X-search repository characterization

- Started clean on main; no leftover work. API/worker/health healthy, all 32 sources without current errors and queues available.
- Added disposable-Postgres coverage for current guidance/account JSON, zero-post budgets, call/post dedupe, first-write topic/URL provenance, shared-topic eligibility and deletion with retained call history.
- Pinned foreign-key rejection and atomic partial-batch rollback/recovery using a fixture-only final-row constraint. Assertions use repository readers; SQL sets up fixtures and cleans them up.
- `pnpm test:integration` passed 92/92; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (99 unit/92 integration), `pnpm build` and `git diff --check` passed.
- Updated README/TASKS. No paid inference, live settings/content writes or UI changes; browser verification unnecessary.
- Restarted API/worker; health DB/Redis true, SPA 200, all queues available, 32 sources without current errors and latest edition four topics/10 posts. Next: remaining repository characterization, nonempty SQL golden and database coverage before ORM work. Reddit access/live AI timing blockers persist; paid scheduling follows Reddit.

## 2026-11-02: iteration 190 — operations source telemetry characterization

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without current errors; two historical ingestion failures unchanged.
- Added disposable-Postgres Status coverage for source name ordering, empty sources, shared-topic observation counts, current enabled connections and disconnects without losing stored telemetry.
- Pinned independent last-item/stored-item counts, persisted fetch errors and timezone-normalized attempt/success timestamps. No paid inference, live mutations or UI changes.
- `pnpm test:integration` passed 93/93; production `pnpm build` passed. Initial full check found archive formatting; corrected with `pnpm format` before rerunning.
- Updated README/TASKS and archived iterations 175–176 to keep PROGRESS below 25 KB. Remaining repository characterization, nonempty SQL golden and database coverage precede ORM work; Reddit access/live AI timing remain blocked.
- Final `pnpm check` passed 99 unit/93 integration tests; `pnpm lint:fix` and `git diff --check` passed. Restarted API/worker; health DB/Redis true, SPA 200, all queues available, 32 sources without errors and latest edition four topics/10 posts. Browser verification unnecessary for test/docs changes.

## 2026-11-02: iteration 191 — X discovery ledger boundary and rollback characterization

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without current errors; two historical ingestion failures unchanged.
- Added disposable-Postgres tests for inclusive UTC day/month starts, microsecond exclusions, explicit-offset old holds, failed-call exclusion and exact monthly cap admission/release.
- Injected a fixture-only provider-block constraint failure to prove reservation transitions roll back atomically; retry persists depletion across new ledger readers and rejects further reservations or closed-call changes.
- `pnpm test:integration` passed 95/95; `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` passed. Full `pnpm check` passed 99 unit/95 integration tests.
- Updated README/TASKS. Restarted API/worker: health DB/Redis true, SPA 200, queues available, 32 sources without errors and latest edition four topics/10 posts. No paid inference, live content/settings writes or UI changes; browser verification unnecessary.
- Next: remaining repository characterization, nonempty SQL golden and database coverage before ORM work. Reddit access/live AI timing blockers persist; paid scheduling follows Reddit.
- Push initially rejected: owner steering commit e16b300 arrived remotely. Fetched/merged without rewriting history; new items 13/14 override prior next steps: scheduled AI budget reserve first, Reddit parked/no HTTP, then scheduled timing and X discovery. Updated TASKS; lower-priority DB work pauses.

## 2026-11-02: iteration 192 — scheduled AI reserve policy

- Started clean on main; API/worker/health healthy, all 32 sources without current errors. No leftover work. Reddit already unscheduled; no Reddit HTTP or paid inference used.
- Added pure scheduled-reserve sizing/admission policy: largest recent full-AI edition cost plus configurable headroom, bounded explicit override, conservative whole-day protection without measurements, and terminal-only release.
- Five focused tests cover rounding, sizing, exhausted funds, scheduled privilege, retry protection, release and invalid inputs. This is policy groundwork: live ledger enforcement is NOT implemented yet.
- Documented the integration contract in decision 0002 and updated TASKS. Archived iteration 177 to keep orientation small.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (104 unit/95 isolated integration), `pnpm build` and `git diff --check` passed. No UI changes; browser verification unnecessary.
- Restarted API/worker: health DB/Redis true, SPA 200, queues available, 32 sources without errors; latest real edition four topics/10 posts.
- Next, urgently: durable UTC-day scheduled state and measured-cost reader, enforce policy under the shared ledger lock with isolated race tests, then manual/Status visibility. Item 13 remains open; no live reserve protection claim.

## 2026-11-02: iteration 193 — durable scheduled AI budget lifecycle

- Started clean on main; API/worker and DB/Redis health healthy. Latest real edition four topics/10 posts; no leftover work.
- Added migration 040 and a domain-port/database adapter for UTC-day scheduled identity, shared-ledger-lock lifecycle writes, single concurrent claim, numbered retry attempts and stale-worker completion fencing.
- Terminal success/failure cannot reopen; successful completion persists edition ID, AI/mixed/fallback mode and reason. First registration wins across restarts; pending schedule reconciliation is still required.
- Two isolated Postgres tests cover timezone boundaries, duplicate registrations, racing claims, retries, durable outcomes, terminal states, validation and contention with ledger lock 756282.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (104 unit/97 integration) and `pnpm build` passed. `pnpm migrate` applied 040; no paid calls or Reddit requests. No UI changes; browser verification unnecessary.
- Updated decision 0002, README/TASKS; archived iteration 178 to keep orientation small. Live reserve protection remains UNFINISHED: wire cron/settings and worker lifecycle, measured costs and ledger admission next, then manual/Status visibility.
- Restarted API/worker: `/healthz` DB/Redis true, SPA 200, four queues available, 32 sources without current errors and latest edition four topics/10 posts. `git diff --check` passed.

## 2026-11-02: iteration 194 — measured full-AI edition costs

- Started clean on main; API/worker and DB/Redis health healthy. No leftover work; 32 sources without current errors and latest real edition four topics/10 posts.
- Added a read-only historical cost reader for reserve sizing: sums settled article/social/model calls by edition/run ID over an inclusive 30-day lookback, newest ten qualifying editions.
- Excludes fallback/mixed modes, incomplete triage, pending/uncertain holds, verification-tagged runs, future snapshots and cache-only/zero-cost editions. Failed released calls add no cost.
- Conservative qualification requires AI in both sections of every topic; absent measurements retain whole-day protection in the existing policy. Accepts a transaction client for later shared-lock admission integration.
- Added rollback-isolated Postgres fixtures for costs, ordering/limits, UTC lookback boundaries and exclusions. No live inference or Reddit requests; no UI changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (104 unit/98 isolated integration), `pnpm build` and `git diff --check` passed. Updated decision 0002, README and TASKS.
- Live reserve protection remains UNFINISHED. Next: cron/settings reconciliation, worker lifecycle and trusted scheduled identity, shared-lock admission/race tests, then manual/Status visibility before Nov 3 15:00 UTC.
- Pushed `be4b6d2`; restarted API/worker with `systemctl --user restart news-digest-api news-digest-worker`: both active, `/healthz` DB/Redis true, SPA 200, all four queues available, 32 sources without errors, latest real edition four topics/10 posts.
