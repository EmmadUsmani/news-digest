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
