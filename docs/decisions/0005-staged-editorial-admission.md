# Staged editorial admission — proposed, not enabled

Iteration 2329, 2026-11-15. NBA scheduled acceptance is recorded in
STEERING 59; the remaining Gaming/ownership recovery still needs its next
scheduled edition. Production keeps whole-topic workers and existing caps.

## Problem and decision

The [Nov 12 timeline](../edition-reviews/2026-11-12-social-latency.md)
shows U.S. editing waiting 53,257 ms after shared politics preparation because
four whole-topic workers include social selection. Releasing editors earlier
can instead consume money needed by an already-running NBA repair. Four HTTP
slots and the existing five-second settlement wait do not protect that money.

Design an owned editorial envelope before implementing a staged scheduler.
Do not ship the simulator's static protected-budget subtraction: it refuses
U.S. work without identifying who may spend the withheld capacity. A global
stories-before-posts barrier alone also leaves editor-versus-editor contention.

## Proposed ownership and accounting

- An envelope belongs to a trusted scheduled occurrence, fenced attempt,
  topic and model. HTTP inputs and purpose strings cannot create ownership.
- It is reserved capacity, not a provider call, settled expense or cache entry.
  Keep it separate from `llm_calls`; a future migration and schema metadata
  update are required. Do not create dummy pending calls.
- Admission counts spent calls, pending/uncertain call holds and untransferred
  envelope balances against the same monthly, daily and model limits. Existing
  scheduled-reserve and provider-block rules still apply to every operation.
- Opening an envelope and transferring capacity into a real call reservation
  use the ledger's existing cross-process advisory-lock transaction. Subtract
  the transferred amount from the envelope exactly when adding the call hold;
  never count both or expose a gap to another worker.
- Only that topic/model/attempt may consume its balance. Unrelated editors,
  social calls and on-demand jobs cannot borrow it. Refused opening leaves no
  partial envelope and no provider dispatch.
- Size initial plus one repair from the actual bounded requests using current
  cost estimation, including maximum repair-feedback input. Reserve the two
  estimates before dispatching the initial call. Do not assume equal sizes or
  size from eventual actual usage. Preserve current output limits.
- Do not pre-reserve every possible fallback model simultaneously. Finish and
  close the Sonnet route before requesting a separately admitted Haiku route.
  This protects an admitted repair; it cannot guarantee every route fits caps.

## Lifecycle and handoff

| Event                       | Required transition                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------- |
| Initial dispatch            | Transfer only its estimate into one real call hold. Retain repair balance.              |
| Initial settles             | Charge actual usage once. Keep unused repair balance owned until validation finishes.   |
| Validation succeeds         | Close the unused balance; story result becomes available to social context.             |
| Validation fails            | Transfer repair estimate atomically; execute the existing single repair.                |
| Repair finishes             | Settle normally; close remaining balance before fallback admission.                     |
| Cache hit                   | Validate first; no provider hold. Close any unused envelope.                            |
| Definitively not dispatched | Release the corresponding call hold through existing failure accounting.                |
| Dispatch outcome uncertain  | Retain the call's conservative charge; never recycle it as envelope credit.             |
| Attempt stops               | Fence new transfers, cancel queued work, drain running work, then close unused balance. |

Lease expiry alone cannot prove a provider call stopped. Recovery must fence
the old attempt using scheduled-job redelivery evidence, retain pending/uncertain
calls and release only untransferred balances. An old worker cannot transfer or
close the new attempt's envelope. Operations need idempotency keys so retries
cannot double-transfer, settle or release. No database lock spans HTTP or waits.

## Scheduler boundary

Retain four process-wide inference slots, including validation/repair ownership.
Shared politics preparation runs once; ownership failure still withholds both
story sections. Ready topic editors enter in configured topic order. Each
topic's social selection receives only its final selected stories, after its
story route finishes. Social work may overlap other editors only after the
latter's envelopes are secured; no speculative posts against unfinished stories.

On unexpected failure, stop dispatch, drain all active branches, then roll back
the preview snapshot. Expected budget refusal follows today's labelled fallback
or withholding rules. Envelope failure must not silently restore ambiguous
World/U.S. ownership or publish partial editorial results.

## Next offline acceptance step

Extend the isolated staged simulator with owned balances and atomic transfers.
Use its existing 11-unit NBA/U.S. counterexample: an NBA repair must either
have protected capacity before initial dispatch or that initial must be refused.
Do not claim both routes fit when their combined worst-case bounds do not.
Cover success release, failed validation, repair growth, cache hits, uncertain
calls, duplicate operations, fenced recovery and failure draining. Compare
per-topic refusals and peak holds with whole-topic scheduling, not just time.

Then measure actual request bounds from saved inputs without provider calls.
If envelopes worsen admission under unchanged caps, reject this design before
any migration or runtime wiring. Nov 12 timestamps do not reconstruct historical
reservation order and cannot establish a speedup. Public activation and the next
scheduled recovery review remain independent gates; no rollout is authorized
by this design note.

## Offline accounting result — iteration 2333

`EditorialEnvelopeModel` is an isolated integer-unit experiment, with no
runtime imports or provider calls. Its seven fixture tests establish:

- At cap 11, NBA owns initial 4 plus repair 6 before dispatch; shared ownership
  preparation uses 1. Early U.S. reservation 6 is refused. NBA's initial settles
  at 1 and its repair transfers 6 without double-counting; peak exposure is 11.
- An initial-plus-repair bound of 10 is refused entirely at cap 9. A growing
  repair cannot consume another owner's balance. Validation success/cache hits
  release unused capacity; definite nondispatch releases the call hold.
- Duplicate transfer/settlement cannot double-charge; conflicting repeats fail.
  Fencing prevents old transfers, and recovery releases only unused capacity.
  Uncertain calls keep their holds and may settle after recovery.
- The whole-topic simulator admits U.S. after NBA repair at the same cap,
  finishing the synthetic scenario at 60 ms. Protecting NBA while refusing an
  early U.S. editor is therefore an admission regression unless a future queue
  can wait safely. These numbers are supplied fixtures, not measured latency.

This step checks accounting transitions only. It does not model durable locks,
trusted occurrence identities, crash-atomic persistence or recovery evidence.
Next: integrate owned admission with the four-slot event simulator, including
failure draining and per-topic comparisons, then size actual saved request
bounds. Do not implement production envelopes or claim a speedup from this
model; unchanged caps and all-topic acceptance remain rejection criteria.
