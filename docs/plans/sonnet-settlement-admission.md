# Sonnet settlement admission contract

Iteration 2014 design; bounded production waiting enabled in iteration 2026.
Iteration 2015 implements typed atomic results and initial hold snapshots, with
legacy callers preserved. Snapshots exceeding 64 holds return an explicit overflow
flag and no partial IDs. Iteration 2016 adds bounded original-ID follow-up queries,
filtered to the original model and pending status without expanding the ID set.
Iteration 2017 bounds process-local inference slot waiting to ten seconds and
releases proven undispatched holds without blocking the provider. Shared caller
deadlines are supported at the BudgetedLlm/provider boundary (2019), including
repair reuse and execution-scoped in-flight coalescing. Scheduled generation now supplies one 600-second context (2020), inherited through
async-local execution scope by all BudgetedLlm work, including editorial fallback.
Nested manual/unrelated edition work clears this context independently of budget
ownership. Iteration 2021 adds an unwired admission helper with a frozen original-hold set,
250 ms polling, five-second/21-attempt limits and 300-second completion headroom.
It rechecks cancellation/deadline after timer and ledger waits; only a new atomic
reservation admits spending. Missing context, manual/non-Sonnet callers and mixed
refusals remain immediate. Ledger errors propagate.
BudgetedLlm now composes the helper through an optional internal policy, repeated
for each separately funded repair. The editorial factory supplies the configured
Sonnet identity and trusted scheduled-ledger context through an internal code gate
(enabled in iteration 2026);
manual callers, Haiku and legacy ledgers retain immediate admission. Bounded logs
contain stop category, elapsed time, attempts and original-hold count, never IDs.
Offline composed controls cover repair, Haiku fallback, late wake-up, manual and
disabled admission. Iteration 2023 exercises the production ShortlistEditor with
the enabled internal policy offline: initial and repair settlement admission,
settled-but-still-refused Haiku fallback, expiry during waiting, missing execution
context and legacy/partial-ledger immediate paths. It verifies model dispatch,
shared context, separately settled reservations and no dispatch after expiry.
Iteration 2024 adds a real Postgres composition control: two waiting callers
freeze the same original hold, settle it during sleep, and race atomic admission.
Exactly one obtains a reservation; the other stops after original settlement,
with no duplicate insertion or extension by the winning hold. Settlement from
inside the sleep callback verifies that no admission lock is retained.
Iteration 2025 adds an expired scheduled-execution control through the production
preview repository and real Postgres: source-excerpt editions remain published
and retrievable by scheduled key and published ID, with no new reservation or
provider dispatch. The offline fixture does not alter saved live editions.
Iteration 2026 reviewed the implementation gates below and enabled the internal
editorial policy after the isolated composition and publication controls passed.
No paid replay is needed; review the next natural scheduled edition.
Keep all caps, allocations,
estimates, provider routes and scheduled ownership checks unchanged.

## Ledger result

Add `reserveDetailed` to `LlmLedger`; retain `reserve` as a compatibility wrapper
mapping admission to its ID and refusal to null. Both use one implementation and
one advisory-locked transaction; neither calls the other after an admission.

| Result       | Required fields                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| Admitted     | `status: admitted`, reservation ID                                                                                  |
| Refused      | `status: refused`, complete typed reason set, estimate, available shared/model microdollars, original pending holds |
| Pending hold | ID, model, reserved microdollars, created timestamp                                                                 |

Reasons are `verification-cap`, `provider-blocked`, `monthly-cap`, `daily-cap`,
`scheduled-reserve`, `model-allocation`. Compute all applicable reasons rather
than returning early for verification. Throw on invalid estimates or DB errors;
never interpret an exception as a retryable refusal. Return finite integers or
null for an inapplicable model limit, never Infinity in the contract.

Read holds from the same locked transaction as the refusal totals, filtered to
the requested model and `status = pending`. Include old-period outstanding holds
as the current accounting does. Uncertain holds still consume budget but cannot
justify waiting. Do not return prompts, responses, secrets or unrelated run data.
Follow-up calls accept the bounded original ID set and return which still have
`pending` status; missing/settled/failed/uncertain IDs do not qualify. Refuse
waiting if the initial snapshot exceeds the implementation hold-count bound
(candidate 64); never truncate IDs and silently change eligibility.
Concurrent settlement may make the snapshot stale immediately; only a later
atomic reservation can authorize spending.

## Caller time contract

The scheduled processor in `scheduled-digests.ts` owns the time allowance. Capture
one monotonic end time before generation, after queue acquisition. Pass a trusted
execution context through preview generation, editorial services and BudgetedLlm;
keep it separate from prompts, request fingerprints and scheduled ownership.
Missing context means immediate admission, including HTTP/manual/development
callers. Never derive ownership or deadlines from HTTP input or request purpose.

Proposed offline planning values are a 600-second generation allowance, a
10-second slot allowance, 200 seconds per logical provider call and 90 seconds
reserved for fallback, settlement and publication. They are candidate policy,
not measured publication guarantees. Share one absolute end time across topics,
repairs and model fallback; never reset it per request, poll or repair.
Scope in-flight coalescing to that execution context; a short-lived caller must
not inherit another caller's longer deadline or scheduled privileges. Cache keys
remain based on content, independent of execution context.

The adapter now bounds slot waiting to ten seconds and each logical call to
200 seconds starting before slot acquisition. Up to three HTTP attempts use at
most 60 seconds each, shortened to the remaining logical allowance. Backoffs
are at most ten seconds and cannot start if they consume the remaining allowance.
The monotonic deadline is rechecked after backoff before retrying. A 60-second start check is
insufficient. Scheduled generation now shares its absolute deadline through
repairs/fallback and constrains logical calls to that context. Only AI dispatch
stops at expiry; existing fallback and publication continue. Settlement admission reserves completion headroom before waiting. A pre-dispatch expiry releases
an unused reservation; any request that might have reached the provider retains
uncertain accounting under the existing failure policy. Never release a hold
merely because a caller stopped waiting. Do not cancel publication mid-write.

## Bounded wait policy

1. Try atomic admission once. Return an admitted ID immediately.
2. Wait only for the configured Sonnet model, a trusted scheduled caller,
   exactly `model-allocation` refusal and at least one original pending hold.
3. Freeze that original ID set. Poll at 250 ms, at most five seconds/21 total
   admission attempts including the initial one. Release DB connections and
   advisory locks before sleeping. Cancellation/deadline checks precede polls.
4. Each poll rechecks all gates and atomically reserves the full estimate if it
   fits. If still refused, stop on any other reason or when no original hold
   remains pending. Newly admitted competing holds never extend eligibility.
5. Stop when remaining time is at most the combined queue, provider and completion
   allowances. At five seconds one final attempt is allowed if time remains.
6. Return the existing `budget-refused` outcome on exhaustion; preserve existing
   Haiku/non-AI fallback. No retry on provider spend limits or uncertain errors.

Emit bounded wait duration, attempt count, stop category and original-hold count.
Keep hold IDs internal, out of metric labels and routine logs. Detailed refusal
results are application contracts, not new public API responses.

## Implementation gates

- Ledger integration: every reason and combined refusals, pending/uncertain and
  old-period holds, concurrent settlement/reservation, no double insertion;
  legacy reserve behavior stays identical.
- Application fake-clock tests: original-ID tracking, competing requests, all
  deadline/cancellation boundaries, no locks during sleep, repair/fallback sharing
  the end time, missing context and non-Sonnet immediate refusal.
- Adapter fake-fetch tests: expired queued calls never dispatch, slot cleanup,
  timeout/retry/backoff bounds and conservative uncertain accounting.
- Wire contracts first with waiting disabled; run the full isolated suite.
  Enable only after deadline enforcement and publication fallback are verified.
  Review the next natural scheduled edition without paid replay.

Evidence: [Nov 12 reconciliation and simulation](../edition-reviews/2026-11-12.md#offline-settlement-wait-evaluation--iteration-2013).

## Rollout review — iteration 2026

| Gate                                                        | Offline evidence                                                            |
| ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| Atomic reasons, original holds and concurrent admission     | Ledger integration (2015–2016), real competing Postgres waiters (2024)      |
| Caller scope, queue and provider deadlines                  | Adapter/queue controls (2017–2019), scheduled scope (2020)                  |
| Bounded polls, completion headroom and immediate exclusions | Fifteen evaluation controls (2014), helper/composition controls (2021–2023) |
| Repairs, fallback and publication after expiry              | Production editor controls (2023), real Postgres publication control (2025) |

Enablement changes only the editorial factory's internal code switch. Roll back
by setting `settlementWaitingEnabled` to `false`, rebuilding and restarting the
API/worker. Do not change caps or release uncertain holds. At the next natural
scheduled edition, review `budget.settlement-admission` stop categories, wait
lengths and attempt counts, ledger refusals, NBA editing and saved publication.
Live acceptance remains open until that review; manual paid generation is unnecessary.

## Natural scheduled review

Next observation: Nov 14, 2026 at 15:00 UTC. Use read-only commands after the
scheduled job finishes; do not enqueue a replay to produce diagnostics.

```sh
pnpm obs health --check
pnpm obs jobs --check --queue digest-generation --limit 2
pnpm obs logs --since 1h --service worker --grep budget.settlement-admission --limit 40
pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-14T15:00:00Z \
  --require-ai-topic NBA --require-ai-topic "Tech & AI" --require-ai-topic Gaming \
  --require-ai-topic "World news & politics" --require-ai-topic "U.S. news & politics"
pnpm obs alerts
```

- Run the log query within one hour of publication; for a later review, extend
  `--since` and correlate `runId` with the scheduled generation logs. If output
  reaches the limit, increase it within the CLI bound or narrow the time range
  before drawing conclusions from missing events.
- Read `runId`, `model`, repair `attempt`, admission `attempts`, `waitedMs`,
  `originalHoldCount` and `stop`. Immediate successful admission also emits an
  event: `admitted` alone does not demonstrate settlement waiting.
- A wait has more than one admission attempt. Check at most 21 attempts and at
  most 64 original holds. The five-second polling policy includes ledger work;
  elapsed logging can include database latency. Investigate overruns rather than
  assuming `waitedMs` is an exact sleep-duration measurement.
- Stops are `admitted`, `ineligible`, `deadline`, `cancelled`, `exhausted` or
  `holds-settled`. A refusal is allowed: confirm normal fallback and publication,
  then reconcile relevant reservations/settlements as in the Nov 12 review.
- Reader verification checks latest/direct/history agreement. Separately review
  saved NBA editing and five-topic content, provider failures, budget refusals
  and spend. Publication agreement alone does not close editorial acceptance.
- If no call needed to wait, record that outcome and leave natural settlement
  recovery unobserved. Missing events before the scheduled run are expected.
- Record the evidence in that day's edition review and update TASKS. Follow the
  STEERING 59 proxy decision: the owner result closes that block. After normal
  scheduled NBA AI editing, ack item 58 and follow [public readiness](../public-readiness.md)
  for activation with sharing private; public mode needs its own scheduled acceptance.
