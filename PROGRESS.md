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

## 2026-11-02: iteration 195 — reconcile pending reserve identities

- Started clean on main; API/worker, DB/Redis health and 32 sources healthy. No leftover work.
- Added ledger-lock compare-and-swap replacement for pending, unclaimed scheduled identities. Stale settings snapshots and obsolete jobs cannot replace/claim the new identity.
- Running, retrying and terminal work remains protected; replacements require distinct run IDs and stay within the same UTC day.
- Isolated Postgres tests cover replacement, stale updates, claim races, lifecycle protection, invalid/cross-day identities and shared-lock contention.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (104 unit/99 integration), `pnpm build`, `git diff --check` passed. Initial format check caught a new documentation entry; formatted it and reran the full check successfully.
- Restarted API/worker: both active, `/healthz` DB/Redis true, SPA 200, four queues, 32 sources without errors, latest real edition four topics/10 posts. No UI changes, paid inference or Reddit HTTP requests.
- Updated README, decision 0002 and TASKS; archived iteration 180 to bound this file.
- Live reserve enforcement remains UNFINISHED: next compute cron/UTC slots and wire scheduler/worker lifecycle, then ledger admission/races and manual/Status visibility before Nov 3 15:00 UTC.

## 2026-11-02: iteration 196 — resolve cron slots by UTC budget day

- Started clean on main; API/worker and DB/Redis healthy. No leftover work.
- Added a timezone-aware daily cron slot resolver using the same cron-parser version as BullMQ; validates schedules and UTC dates before resolution.
- Includes UTC midnight, excludes next midnight, keeps past slots, returns null for UTC days without an occurrence and chooses the first occurrence for the single daily identity.
- Five unit tests cover settings changes, DST gaps/repeated times, timezone boundaries and 100 direct comparisons against BullMQ's repeat strategy.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (109 unit/99 isolated integration), `pnpm build` and `git diff --check` passed. No paid inference or Reddit requests; no UI changes.
- Restarted API/worker: both active; health DB/Redis true, SPA 200, four queues, 32 sources without errors, latest real edition four topics/10 posts.
- Updated README, reserve decision and TASKS; archived iteration 181 to bound orientation size.
- Reserve enforcement remains UNFINISHED: wire resolved slots into scheduler/worker lifecycle, shared-lock admission and races, then manual/Status visibility before Nov 3 15:00 UTC.

## 2026-11-02: iteration 197 — register scheduled UTC budget identities

- Started clean on main; API/worker, health and 32 sources healthy. No leftover work.
- Wired ten-second scheduler refresh to register today's cron-resolved UTC slot with the stable edition publication key, before BullMQ schedule updates.
- Read expected identity before loading settings; stale refreshes cannot replace a newer registration/reconciliation. Preserve claimed/retrying/terminal work and prior days; no-slot days create no identity.
- Three isolated Postgres tests cover restart, past-slot retention, settings changes, obsolete claims, running/retrying/failed protection, UTC rollover, stale-snapshot races, missing slots and invalid settings.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (109 unit/102 integration), `pnpm build`, `git diff --check` passed. First check caught import-sort formatting; reformatted and reran successfully.
- Restarted API/worker: both active, health DB/Redis true, SPA 200, four queues available, 32 sources without errors, latest real edition four topics/10 posts. Read-only DB check confirms today's 15:00 UTC identity; next queue slot Nov 3 15:00 UTC.
- Updated README, reserve decision and TASKS; archived iteration 182 to keep orientation bounded. No UI changes, paid inference or Reddit requests.
- Reserve enforcement remains UNFINISHED. Next: worker claim/retry/stall recovery, terminal outcomes and obsolete/missed-slot release (including today's already-published run), then shared-lock ledger admission/races and manual/Status visibility.

## 2026-11-02: iteration 198 — scheduled worker budget attempts

- Started clean on main; services, health and 32 sources healthy. No leftover work.
- Scheduled processor now claims matching daily identities, retains retry protection and records success/last-attempt failure plus published AI/mixed/fallback evidence.
- Stalled redelivery uses BullMQ attemptsStarted and queue lock ownership to recover the observed running attempt via compare-and-swap; old completions remain fenced.
- Three isolated tests cover retries, final exceptions, conservative outcomes, stalled recovery and competing recovery claims. No paid inference or Reddit requests.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (109 unit/105 integration), `pnpm build`, `git diff --check` passed.
- Restarted API/worker: active, `/healthz` DB/Redis true, SPA 200, four queues, 32 sources without errors, latest real edition four topics/10 posts. No UI change.
- Updated README, reserve decision and TASKS; archived iteration 183 to bound orientation size.
- Reserve enforcement remains UNFINISHED: reconcile queue-final stall failure and obsolete/missed/already-published slots, then shared-lock admission/races and manual/Status visibility before Nov 3 15:00 UTC.

## 2026-11-02: iteration 199 — reconcile terminal queue stalls

- Started clean on main; services, health and 32 sources healthy. No leftover work.
- Terminal BullMQ failures now reconcile matching running daily identities from failed events and a bounded retained-failure scan during scheduler refresh, including after downtime.
- Observe the attempt before checking Redis failure; compare-and-swap prevents a racing redelivery or late completion from releasing another attempt. Manual, retryable, mismatched and terminal work is ignored.
- One isolated Postgres test covers terminal stalls, mismatched/manual jobs, missing slots, retry states, redelivery races and late success. Queue state evidence is fake; no live failure was induced.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (109 unit/106 isolated integration), `pnpm build`, `git diff --check` passed.
- Restarted API/worker: active; `/healthz` DB/Redis true, SPA 200, four queues, 32 sources without errors, latest real edition four topics/10 posts.
- Updated README, reserve decision and TASKS; archived iteration 184 to bound orientation size. No UI changes, paid inference or Reddit requests.
- Reserve enforcement remains UNFINISHED: obsolete/missed/already-published slots, shared-lock admission/races, then manual/Status visibility before Nov 3 15:00 UTC. Queue recovery requires retained Redis evidence.

## 2026-11-02: iteration 200 — release obsolete no-occurrence slots

- Started clean on main; services, health and 32 sources healthy. No leftover work.
- Scheduler refresh now removes an observed pending, attempt-zero identity when changed settings have no occurrence in its UTC day, under the shared ledger lock.
- Compare-and-swap preserves newer identities, worker claims, retries and terminal outcomes; restoring a same-day schedule can register again.
- Isolated Postgres coverage verifies DST no-occurrence removal, restoration and stale settings versus replacement/claim/retry/failure/success. No live failure induced.
- First check caught an unsupported monthly cron in the new fixture; replaced it with the supported daily DST no-occurrence case and reran successfully.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (109 unit/107 isolated integration), `pnpm build`, `git diff --check` passed.
- Live health DB/Redis true; 32 sources without errors, four queues, latest real edition four topics/10 posts. No UI changes, paid inference or Reddit requests.
- Updated README, reserve decision and TASKS. Reserve enforcement remains UNFINISHED: missed/already-published slots, shared-lock ledger admission/races, manual/Status visibility before Nov 3 15:00 UTC.

## 2026-11-02: iteration 201 — terminate never-claimed missed slots

- Started clean on main; health, services and 32 sources healthy. No leftover work.
- Refresh now marks unclaimed daily slots failed strictly after the worker's six-hour recovery window, including startup after downtime.
- Shared-lock identity/state/attempt-zero guards preserve claims, retries, replacements and terminal outcomes; no fabricated edition/AI outcome.
- Isolated coverage checks exact cutoff, one millisecond late, restart, idempotence and competing lifecycle transitions. No paid inference or Reddit requests.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (109 unit/108 isolated integration), `pnpm build`, `git diff --check` passed. First check caught archive formatting; corrected and reran.
- Restarted API/worker active; health DB/Redis true, SPA 200, four queues, 32 sources without errors, latest real edition four topics/10 posts.
- Updated README, reserve decision and TASKS; archived iteration 185 to bound orientation size. No UI changes.
- Reserve enforcement remains UNFINISHED: already-published reconciliation, shared-lock admission/races and manual/Status visibility before Nov 3 15:00 UTC.

## 2026-11-02: iteration 202 — recover already-published scheduled slots

- Started clean on main; health/services and 32 sources healthy. No leftover work.
- Scheduler refresh reconciles exact scheduled publication keys before missed-slot termination, including startup after downtime; no Redis evidence required.
- Shared-ledger lock plus identity/attempt/nonterminal predicates preserve replacements, redeliveries and terminal outcomes. Manual/other-key editions cannot release protection.
- Reuses the worker's conservative full-AI/mixed/fallback snapshot classification without generating a new edition or inventing an attempt.
- Added isolated Postgres recovery/fencing coverage; fixture corrections respected positive digest windows and immutable snapshots using transaction savepoints. Initial doc-format check corrected too.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (109 unit/109 isolated integration), `pnpm build`, `git diff --check` passed.
- Restarted API/worker active; `/healthz` DB/Redis true, SPA 200, four queues, 32 sources without errors; latest real edition four topics/10 posts.
- Updated README, reserve decision and TASKS; archived iteration 186. No UI changes, paid inference or Reddit requests.
- Reserve enforcement remains UNFINISHED: shared-lock ledger admission/races, then manual/Status visibility before Nov 3 15:00 UTC.

## 2026-11-02: iteration 203 — add shared-lock reserve admission primitive

- Started clean on main; health/services and 32 sources healthy. No leftover work.
- Opt-in ledger admission reads daily lifecycle, historical costs and holds under lock 756282; concurrent ordinary calls cannot exceed the unreserved limit.
- Protected funds require trusted running-slot identity, attempt and edition ID; arbitrary purpose, verification, stale attempts and other editions gain no privilege.
- Missing state protects funds; retry retains protection; definitive failure releases it. Existing ordinary/provider/model/verification caps remain in force.
- Isolated race fixture initially assumed an empty ledger; corrected it to account for earlier settled fixtures without deleting their data. Rerun passed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (109 unit/110 isolated integration), `pnpm build`, `git diff --check` passed.
- Restarted API/worker active; health DB/Redis true, SPA 200, four queues, 32 sources without errors; latest real edition four topics/10 posts.
- Updated README, reserve decision and TASKS; archived iteration 187. No UI changes, paid inference or Reddit requests.
- Production protection remains OFF: next wire trusted worker/edition context and configurable policy across all Anthropic entrypoints, no-occurrence/midnight/lifecycle races, then manual/Status visibility.

## 2026-11-02: iteration 204 — bind trusted scheduled attempts to editions

- Started clean on main; health/services and 32 sources healthy. No leftover work.
- Claimed worker attempts now establish async-local identity; generation binds its edition UUID only for the matching scheduled key.
- Manual/unrelated nested generation clears privileges; overlapping attempts retain separate contexts. Durable ledger checks still fence stale workers.
- Added unit isolation/cleanup tests and isolated worker retry/contextual ledger admission coverage. Production reserve admission remains OFF.
- First check caught import order in an edited test; fixed before the final full check.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (111 unit/110 isolated integration), `pnpm build`, `git diff --check` passed.
- Restarted API/worker active; health DB/Redis true, SPA 200, 32 sources without errors; latest real edition four topics/10 posts.
- Updated reserve decision/TASKS; archived iteration 188 to bound orientation size. No UI changes, paid inference or Reddit requests.
- Next: policy configuration across every Anthropic entrypoint, no-occurrence/midnight/lifecycle races, then manual/Status visibility before Nov 3 15:00 UTC.

## 2026-11-02: iteration 205 — configure shared reserve composition

- Started clean on main; no leftover work. API/worker, health and all 32 sources healthy.
- Added validated reserve enablement, integer microdollar override and headroom configuration; default remains OFF.
- Shared production factory now supplies policy and per-admission trusted context for manual/scheduled publication, all paid smoke tools and guarded recording; cache-only social diagnostics also use it.
- Unit tests reject malformed deployment values; isolated production-factory admission verifies scheduled access and denial of verification privilege.
- First check caught documentation formatting; corrected before final full check.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (113 unit/110 isolated integration), `pnpm build`, `git diff --check` passed.
- Restarted API/worker active; `/healthz` DB/Redis true, SPA 200, four queues, 32 sources without errors; latest real edition four topics/10 posts.
- Updated README, reserve decision and TASKS; archived iteration 189. No UI changes, paid inference or Reddit requests.
- Next: no-occurrence/midnight and lifecycle admission races, then manual/Status visibility and enforcement enablement before Nov 3 15:00 UTC.
