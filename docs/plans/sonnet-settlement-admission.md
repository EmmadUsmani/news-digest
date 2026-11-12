# Sonnet settlement admission contract

Iteration 2014 design; production admission remains immediate.
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
Sonnet identity and trusted scheduled-ledger context behind a hard false code gate;
manual callers, Haiku and legacy ledgers retain immediate admission. Bounded logs
contain stop category, elapsed time, attempts and original-hold count, never IDs.
Offline composed controls cover repair, Haiku fallback, late wake-up, manual and
disabled admission. Iteration 2023 exercises the production ShortlistEditor with
the enabled internal policy offline: initial and repair settlement admission,
settled-but-still-refused Haiku fallback, expiry during waiting, missing execution
context and legacy/partial-ledger immediate paths. It verifies model dispatch,
shared context, separately settled reservations and no dispatch after expiry.
Waiting stays disabled. Implement the
contracts and offline tests before enabling a wait. Keep all caps, allocations,
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
stops at expiry; existing fallback and publication continue. Before enabling waits,
implement settlement admission with reserved completion headroom. A pre-dispatch expiry releases
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
