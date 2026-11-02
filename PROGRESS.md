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

## 2026-11-02: iteration 206 — verify lifecycle/admission lock ordering

- Started clean on main; API/worker and health healthy. No leftover work.
- Added disposable-Postgres tests queueing operations behind the actual advisory lock; observed lock wait establishes ordering.
- Claim-before-admission grants current scheduled access; retry-before-admission fences it; admission-before-failure stays denied until committed release.
- Yesterday's running claim cannot use today's reserve; released funds still obey the daily cap.
- Reserve enforcement remains OFF. No provider calls, Reddit requests or UI changes.
- Compressed completed TASKS detail and archived iteration 190 to keep orientation bounded.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (113 unit/111 isolated integration), `pnpm build`, `git diff --check` passed.
- Live reads: four queues, 32 sources without errors, latest edition four topics/10 posts. API/worker restarted healthy after push.
- Next: verified no-occurrence-day release, manual/Status visibility, then enforcement enablement before Nov 3 15:00 UTC.

## 2026-11-02: iteration 207 — release verified no-occurrence days

- Started clean on main; API/worker, health and 32 sources healthy. No leftover work.
- Production admission resolves the saved schedule under the ledger transaction when today's lifecycle row is absent; only a verified no-occurrence day releases funds.
- Shared row lock fences concurrent settings updates; missing/invalid settings fail closed, existing pending/running identities retain protection, and daily caps still apply.
- Disposable-Postgres coverage verifies the LA DST no-occurrence/adjacent day, settings lock, admission cap and production resolver wiring; no provider calls.
- First integration run caught an incorrect test method name; corrected before the final full check.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (113 unit/112 isolated integration), `pnpm build`, `git diff --check` passed.
- Live reads: four queues, 32 sources without errors, latest real edition four topics/10 posts; SPA 200, health DB/Redis true.
- Updated reserve decision/TASKS; archived iteration 191. No UI changes, paid inference or Reddit HTTP requests.
- Reserve enforcement remains OFF. Next: manual/Status visibility, then enablement before Nov 3 15:00 UTC.

## 2026-11-02: iteration 208 — show scheduled AI budget protection on Status

- Started clean on main; API/worker, health and 32 sources healthy. No leftover work.
- Added repeatable-read, ledger-locked reserve telemetry: UTC lifecycle, target/protected funds, other-run limits/availability and latest terminal outcome/reason.
- Status distinguishes disabled protection, active manual limits and release; older editions without durable records are not inferred.
- Disposable-Postgres test covers disabled/pending/running/retrying/released telemetry and synthetic fallback evidence.
- Initial checks caught an invalid async parameter initializer and UI formatting; corrected before passing full verification.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (113 unit/113 isolated integration), `pnpm build`, `git diff --check` passed.
- `pnpm exec tsx scripts/smoke-reserve-status.ts` passed live desktop/mobile rendering plus browser-only synthetic protected/released states; saved live screenshots.
- Restarted API/worker healthy; health DB/Redis true, SPA 200, four queues, 32 sources without errors; retained real edition four topics/10 posts.
- Live Status reports Nov 2 fallback reason, protection disabled, $0.000848 available; next scheduled run Nov 3 15:00 UTC. No inference or Reddit requests.
- Updated README/decision/TASKS and archived iteration 192. Next: manual-run limitation notices, then enable protection before Nov 3 scheduled run.

## 2026-11-02: iteration 209 — explain manual edition reserve limits

- Started clean on main; API/worker, health and 32 sources healthy. No leftover work.
- Manual creation now shows active scheduled protection, remaining other-run AI allowance and the possibility of labeled non-AI ranking.
- Refreshes telemetry on page load and before submission; failed status reads show an explicit warning. Notices persist through job completion/failure.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (113 unit/113 isolated integration), `pnpm build`, `git diff --check` passed.
- `pnpm exec tsx scripts/smoke-manual-reserve.ts` passed desktop/mobile protected, submission-refresh, released and unavailable states using synthetic browser responses; saved live screenshots.
- Live reads: four queues, 32 sources without errors, latest real edition four topics/10 posts; health DB/Redis true. No paid inference, live jobs or Reddit requests.
- Updated reserve decision/TASKS and archived iteration 193. Reserve enforcement remains OFF; next: enable protection before Nov 3 15:00 UTC and measure scheduled cost/duration.

## 2026-11-02: iteration 210 — enable scheduled AI budget protection

- Started clean on main; services, health and 32 sources healthy. No leftover work.
- Enabled shared environment reserve protection, 1.5x headroom, no fixed override; API/worker process environments verified without exposing secrets.
- Default measured sizing protects the full daily cap without qualifying full-AI history; existing provider/model/billing caps remain unchanged.
- Live Status: protection enabled, Nov 2 terminal fallback, $0.482758 target/$0 protected; Nov 3 15:00 UTC remains queued.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (113 unit/113 isolated integration), `pnpm build`, `git diff --check` passed.
- `pnpm exec tsx scripts/smoke-reserve-status.ts` passed live desktop/mobile plus synthetic protected/released states; updated screenshots.
- `pnpm exec tsx scripts/report-edition-timing.ts` confirms retained four-topic/10-post fallback; no new AI timing claim.
- Restarted API/worker; health DB/Redis true, SPA 200, 32 sources without errors. No paid inference, live jobs or Reddit requests.
- Updated README/reserve decision/TASKS; archived iteration 194. Item 13 stays open for Nov 3 AI cost/duration evidence; no premature steering ack.
- Next: observe scheduled run and measure AI editing/cost/duration; then scheduled X discovery under item 9.

## 2026-11-02: iteration 211 — finish owner-directed Reddit parking

- Started clean on main; health and both services healthy. No leftover work.
- Confirmed Reddit collection is not wired into production workers, schedulers or HTTP endpoints; retained adapters/tests and saved communities.
- Status/settings now say “parked by owner” and explain collection is disabled/unscheduled pending owner re-enablement; source docs updated and item 14 acknowledged.
- TASKS now requires X-only social completion under item 14; archived iteration 195 to keep orientation small.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed: 113 unit and 113 isolated integration tests; `pnpm build` passed.
- `pnpm exec tsx scripts/smoke-topic-coverage.ts` and `scripts/smoke-reddit-communities.ts` passed desktop/mobile checks; updated screenshots. Settings writes intercepted in-browser only.
- API/worker restarted; `/healthz` DB/Redis true; 32 sources without errors; retained latest edition four topics/10 posts.
- Read-only timing report confirms Nov 3 15:00 UTC next run; prior 856 ms fallback is not live AI latency evidence. No inference or Reddit requests.
- Item 13/7 live evidence still awaits scheduled edition; next actionable work is item 9 capped scheduled X discovery.

## 2026-11-02: iteration 212 — daily X discovery evidence

- Started clean on main; health, four queues and 32 sources healthy. No leftover work.
- Added read-only UTC-day X report with per-call cost/holds/fetched counts and per-topic citations/current verified and dated counts; costs never multiply with citation joins.
- Zero-citation calls remain visible. Historical zero-yield topic attribution and incremental additions cannot be inferred; report explicitly states these limits.
- Isolated test covers UTC boundaries under a non-UTC session, zero-yield/failed/uncertain calls, verification/date gaps, invalid dates and empty days.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (113 unit/114 isolated integration); `pnpm build` and `git diff --check` passed.
- `pnpm exec tsx scripts/report-x-discovery.ts 2026-11-02`: existing World search $0.023382, two citations, both currently verified/dated, no holds. No new paid calls.
- Live coverage: X Tech 29/NBA 37/Gaming 26/World 8; 32 sources without errors. Read-only timing report: Nov 3 15:00 UTC next; prior 856 ms fallback is not AI timing evidence.
- Updated README/SOURCES/TASKS; shortened stale timing notes. No UI changes, inference or Reddit requests.
- Next: durable topic attribution and incremental verified yield, then capped pre-edition X scheduling; full-day per-call reservation remains unchanged. Items 13/7 await Nov 3 evidence.

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
