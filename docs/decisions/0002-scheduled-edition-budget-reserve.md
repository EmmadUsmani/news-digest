# Scheduled edition Anthropic reserve

Owner instruction: STEERING item 13, 2026-11-02. The scheduled edition must
retain funds even when manual editions and verification share the daily cap.

## Sizing and admission policy (iteration 192)

`curation/domain/scheduled-reserve.ts` defines the pure policy. It is preparation;
the live ledger does not enforce this reserve yet.

- Use the largest measured recent **complete full-AI edition** cost, with
  configurable headroom (initial recommendation: 1.5). Include article and social
  inference for the edition, not just the editor. Partial/fallback editions must
  not establish the cost of a full edition.
- Round up to integer microdollars. An explicit configured microdollar amount
  overrides measured sizing; zero deliberately disables the reserve.
- Bound the reserve by the current daily cap. Without a positive measured cost,
  reserve the entire daily cap until a measurement or explicit override exists.
  Cache-only zero-cost editions cannot predict fresh inference costs.
- Other spend may use at most `dailyCap - reserve - todayUsed`, further bounded
  by the ordinary remaining monthly/daily allowance. Verification retains its
  additional $0.05 cap. This conservative rule keeps the whole reserve during
  scheduled execution, even as its own calls settle.
- Scheduled work uses the ordinary remaining allowance and existing model
  allocation. A reserve grants no extra money and cannot bypass provider blocks.
- Pending, running and retrying scheduled work retain protection. Only successful
  completion or definitive failure releases it. A failed attempt with retries
  remaining is not definitive failure.

## Remaining integration (required before claiming protection)

The ledger must evaluate this policy inside advisory transaction lock 756282,
with its database UTC clock, durable scheduled-run identity and state. Determine
which scheduled slot belongs to each UTC budget day from the current saved cron
and timezone; never hard-code 15:00 UTC. Settings changes, DST, midnight-crossing
runs, retries, skipped obsolete jobs and worker restarts require isolated tests.
A request's arbitrary purpose text must not grant scheduled privileges.

Read full-AI historical edition costs without paid provider calls. Persist
scheduled lifecycle transitions and distinguish final failure from BullMQ retry.
Expose reserve/other-spend limits and the last scheduled AI/fallback outcome on
Status, with an explicit explanation in manual edition flows when limited.
Verify admission and lifecycle races through disposable Postgres/Redis tests.
Use the next scheduled edition for actual cost and speed evidence; no paid trial.

## Durable lifecycle foundation (iteration 193)

Migration 040 and `ScheduledBudgetRepository` store a single identity for each
UTC budget day, deriving the day from the supplied scheduled timestamp. All
lifecycle writes take ledger lock 756282. Concurrent registration keeps the
first identity; concurrent claims admit one worker. Attempts increment on retry,
and completion compares the attempt number so a late old worker cannot release
protection. Only running attempts may finish; terminal days cannot be reopened.
Successful completion retains edition ID, AI/mixed/fallback mode and reason.

This adapter is not wired to scheduling or ledger admission yet. Registration
expects a trusted scheduler-computed timestamp; it does not compute cron slots.
The integration must explicitly reconcile a changed pending schedule (rather
than silently replace a running/terminal identity), recover abandoned running
attempts using queue evidence, and handle obsolete jobs and midnight crossings.
Missing day state must fail closed when ledger enforcement is connected.

## Historical cost measurements (iteration 194)

`readFullAiEditionCosts` reads the ten most recent qualifying editions in an
inclusive 30-day lookback. It sums all succeeded Anthropic calls by edition/run
ID, including article and social work and every model. Failed released calls add
no cost; pending or uncertain calls disqualify the edition. Verification-tagged
editions and zero-cost/cache-only editions cannot establish fresh production cost.
Future snapshots and partial triage (unscored IDs) are excluded.

Qualification is deliberately conservative: every topic must have both story and
social editorial mode `ai` and no unscored candidates. Empty/disabled sections
that retain non-AI mode therefore cannot establish a measurement. If no edition
qualifies, the existing policy protects the whole daily cap unless overridden.
The reader accepts a transaction client for use inside the ledger admission lock;
it does not itself lock, mutate state, call providers or enforce live protection.
Isolated Postgres fixtures verify lookback boundaries, costs, holds and exclusions.

## Pending settings reconciliation (iteration 195)

`reconcilePending` replaces an unclaimed identity only when its expected run ID
still matches. It shares ledger lock 756282 with admission and claims; obsolete
jobs cannot claim the replaced identity, and stale refreshes cannot overwrite a
newer settings snapshot. Running, retrying and terminal records are preserved.
Replacement requires a distinct run ID, so completion and queue identity cannot
be reused accidentally. Cross-UTC-day replacement is rejected: each budget day
must be reconciled independently, retaining prior-day running work and protection.

This is an adapter primitive, not live scheduling or reserve enforcement. The
scheduler must still calculate slots from cron/timezone, register/reconcile each
applicable UTC day, handle days without slots and obsolete jobs, and wire worker
retry/recovery and outcomes before ledger admission is connected.

## UTC-day slot resolution (iteration 196)

`profiles/adapters/budget-day-slot.ts` resolves the configured daily local cron
against UTC midnight, using cron-parser 4.9.0 (the version used by BullMQ). It
includes midnight and excludes the next midnight, and retains past slots when
called after the scheduled time. Invalid days, timezones and unsupported schedules
fail closed. No current clock time or hard-coded 15:00 is used.

DST can leave a UTC day without a local daily occurrence; the resolver returns
null rather than moving tomorrow's reserve into today. If a UTC day contains
multiple occurrences, its single reserve identity belongs to the first. Spring
gaps and autumn repeated times follow BullMQ's parser behavior. Tests compare
100 timezone/date/cadence combinations directly with BullMQ's repeat strategy.
This resolver is not wired into the scheduler or live admission yet. Pending
identity reconciliation must preserve claim fencing and avoid stale settings
snapshots when that wiring is added.

## Scheduler registration (iteration 197)

The worker's ten-second schedule refresh now registers the current UTC day's
resolved slot before updating BullMQ. Identity uses the existing publication key
(`profileId:slotMilliseconds`), surviving restart and independent of LLM purpose.
It reads the expected identity before loading settings, so a slow settings
snapshot cannot overwrite a newer registration/reconciliation. Lost compare-and-swap
updates are left for the next refresh; running, retrying and terminal work survives.
Days without a cron occurrence create no identity. Prior-day records are retained.

This does not yet enforce spend protection. Worker claim/retry/stall recovery,
terminal outcomes, obsolete/missed-slot release and days that lose their slot on
settings changes still need wiring before enabling ledger admission. Registration
is deliberately independent of whether today's slot is already in the past.

## Worker attempts (iteration 198)

The scheduled processor claims the matching daily identity before generation,
retains protection through retryable exceptions, and records terminal success or
last-attempt failure. Published outcomes conservatively require all article/social
sections to have AI editing and no unscored items for `full-ai`; otherwise they
are mixed or fallback and retain the published explanations. Manual jobs do not
enter this wrapper; extra daily cron slots do not own the first slot's identity.

BullMQ `attemptsStarted` (including stalled redeliveries) permits recovery of an
observed running attempt only after reacquiring the queue job lock. Recovery
compares the observed attempt under the ledger lock and increments it; late
old-worker completion cannot release the replacement attempt's reserve.
Isolated tests cover retries, final exceptions, recovery races and outcome modes.
Queue-final stall failures outside the processor are reconciled from the worker's
failed event and a bounded scan of the 100 retained failed jobs during scheduler
refresh (iteration 199). Only matching scheduled slots still running can finish;
Redis must report terminal failure after the database attempt is observed, and
compare-and-swap fences a competing redelivery. Retryable, manual, mismatched and
already-terminal jobs do not release protection. Retained queue evidence is
required; durable recovery beyond Redis retention remains future work.
When changed settings resolve to no occurrence in today's UTC budget day,
scheduler refresh deletes only the previously observed pending, attempt-zero
identity under the ledger lock (iteration 200). Newer replacements, claims,
retries and terminal outcomes survive a stale refresh. Restoring a same-day
schedule can register a new identity; no-occurrence days require no reserve.
Missed and published-slot reconciliation follow below. Ledger admission and
manual/Status visibility remain unfinished; this is not live budget protection.

Iteration 201 bounds never-claimed pending protection to the worker's six-hour
recovery window. Refresh registers/reconciles the current slot, then marks it
failed only when strictly more than six hours late. The shared-ledger lock and
identity/state/attempt-zero predicate preserve concurrent claims, retries,
replacements and terminal outcomes. Restart after the cutoff records failure
without inventing an edition or AI outcome. Exact-cutoff slots remain eligible.
Published-slot reconciliation follows below; ledger admission remains unfinished.

Iteration 202 reconciles committed editions by the exact scheduled publication key
before applying the missed-slot cutoff. Under the shared ledger lock, only the
observed identity and attempt in pending/running/retrying state can succeed.
The immutable snapshot supplies the same full-AI/mixed/fallback classification
used by the worker. Startup after publication recovers without generating a new
edition or inventing an attempt; manual/other-key editions and terminal records
are ignored. A concurrent redelivery or settings replacement fences stale recovery.
No retained Redis job is needed for this publication evidence. Ledger enforcement
and manual/Status visibility remain unfinished.

## Ledger admission primitive (iteration 203)

`PostgresLlmLedger` now accepts optional trusted reserve composition. When enabled,
it reads the UTC day's lifecycle, historical costs and all holds inside lock
756282 before inserting a reservation. Concurrent ordinary calls share the same
remaining allowance. Missing lifecycle state protects the configured/measured
reserve; terminal state releases it. Existing provider, model and verification
ceilings still apply.

Only a trusted context matching the running slot identity, current attempt and
request edition ID can access protected funds. Purpose text grants no privilege;
verification mode or purpose always uses the ordinary limit. Retries and stale
contexts cannot borrow privileges from a new attempt. A context for yesterday's
slot cannot access today's reserve across midnight.

This is **not enabled in production composition yet**. Worker context now flows
through edition creation (iteration 204). Next load configurable policy for every Anthropic entrypoint,
and handle verified no-occurrence days without treating a missing record as
release evidence. Add lifecycle/admission race and midnight integration coverage,
then expose manual limitation reasons and Status fields before claiming protection.

## Trusted execution context (iteration 204)

After a successful durable claim, the scheduled worker scopes the slot and
attempt with AsyncLocalStorage. Edition generation binds its newly allocated
UUID only when its scheduled key matches that claim. Manual and unrelated nested
generation clear inherited privileges. Concurrent topics, retries and stalled
workers retain separate async scopes; the ledger still fences stale attempts
against durable state on every admission. No HTTP parameter or purpose grants a
claim. This prepares `scheduledLedgerContext` for policy composition; production
ledger construction still leaves admission disabled until configuration and
remaining lifecycle races are verified. Tests cover overlapping scopes, cleanup,
manual isolation, worker retry binding and real isolated ledger admission.

## Shared deployment configuration (iteration 205)

Publication (manual and scheduled), the guarded recorder and all three paid
smoke scripts now construct their ledger through `configuredLlmLedger`. Cache-only
social diagnostics use the same composition. The isolated ledger smoke retains
direct construction and never accesses production data or a provider.

- `LLM_SCHEDULED_RESERVE_ENABLED=1` opts in; default `0` keeps enforcement off
  while lifecycle races and visibility are unfinished. Other values fail ledger construction.
- `LLM_SCHEDULED_RESERVE_MICROS` optionally overrides measured sizing with a
  nonnegative integer microdollar amount (including intentional zero).
- `LLM_SCHEDULED_RESERVE_HEADROOM` defaults to `1.5` and must be finite and at
  least one. Invalid configuration fails even when enforcement is disabled.

Each enabled ledger reads the trusted async context per admission; it never
captures a worker identity at construction. Verification ledgers retain the
shared daily verification cap and cannot use a scheduled claim. Tests exercise
this production factory with disposable Postgres and no provider requests.

## Lifecycle/admission ordering verification (iteration 206)

Disposable Postgres coverage now holds the real shared advisory lock and observes
queued lock acquisition before starting competing operations. A committed claim
permits its matching admission; a committed retry removes privileges. An ordinary
admission queued before definitive failure is denied, and the next admission uses
the released funds within the ordinary cap. A running prior-UTC-day identity
cannot access today's protected funds. These checks make no provider requests.
Verified no-occurrence-day release and manual/Status visibility remain unfinished;
production enforcement stays off.

## Verified no-occurrence admission (iteration 207)

Production admission now resolves the saved schedule when today's lifecycle row
is absent. Only a verified absence of an occurrence releases the reserve; a
missing or invalid schedule throws, and any existing lifecycle identity keeps
its normal state policy. The profile adapter uses `FOR SHARE` in the ledger's
transaction so a concurrent settings update cannot install an occurrence before
admitted spend commits. Resolution uses the ledger's PostgreSQL UTC date.

Disposable-Postgres coverage uses the actual LA fall-back no-occurrence schedule
with a frozen resolver date, verifies the adjacent day's occurrence, row-lock
exclusion of settings updates, full daily allowance (and cap), preservation of
pending/running identities, and invalid settings failure. Production composition
also verifies missing-state protection on occurrence days and resolver wiring.
Enforcement remains OFF pending manual/Status visibility and enablement.

## Status visibility (iteration 208)

`readLlmUsage` now reads usage, saved schedule, durable lifecycle and measured
reserve sizing under one shared ledger lock and PostgreSQL clock. Status shows
the UTC day/state, active protection versus disabled configuration, target,
protected funds and remaining allowance for all other callers. Model and
verification caps can further restrict that allowance. It reports the most
recent terminal durable record's AI/mixed/fallback evidence and reason, or
failure; it does not infer outcomes for editions predating lifecycle tracking.
Disposable-Postgres tests cover disabled/pending/running/retrying/released
telemetry and a synthetic fallback outcome. Enforcement remains OFF pending
manual-run notices and enablement.

## Manual creation visibility (iteration 209)

The coverage-period form reads ledger-consistent Status telemetry on mount and
again before submitting a manual job. Active protection shows the remaining
other-run AI allowance and warns that topics may use labeled non-AI ranking.
The notice remains visible through completion/failure; released or disabled
protection clears it on the next refresh. Failed telemetry shows an explicit
availability warning without blocking creation or bypassing ledger enforcement.
These are current allowance estimates, not a promise of AI editing or proof
that the reserve caused any particular topic's fallback. Browser checks use
synthetic status/job responses; live screenshots are read-only. Enforcement
remains OFF pending the separate operational enablement step.

## Production enablement (iteration 210)

Enabled `LLM_SCHEDULED_RESERVE_ENABLED=1` in the shared service environment,
with `LLM_SCHEDULED_RESERVE_HEADROOM=1.5` and no fixed microdollar override.
Sizing uses the largest qualifying cost among the ten most recent full-AI
editions within 30 days, capped by the daily allowance; absent measurements it
protects the full daily cap. This changes no provider, model or billing cap.

Both restarted API and worker processes loaded these settings. Live Status
reports enabled protection, Nov 2 succeeded/fallback, target $0.482758 and
$0 protected because today's scheduled edition is terminal. The Nov 3 run
remains queued for 15:00 UTC; its UTC day will get separate protection.
Desktop/mobile Status screenshots show the enabled configuration. Browser
protected/released variants remain synthetic and issue no provider requests.

No paid trial or new edition was triggered. Item 13 remains open until the
Nov 3 scheduled run demonstrates AI editing with measured cost and duration;
do not acknowledge completion from enablement or today's fallback alone.
