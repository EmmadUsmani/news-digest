# AI & budgets

The app makes two kinds of paid calls, each with its own provider, ledger and
caps. In both cases, **the provider enforces the hard limit**, so a bug in
the app can never overspend.

| Purpose                  | Provider / model                                   | Hard limit (provider)            | App-side caps                           |
| ------------------------ | -------------------------------------------------- | -------------------------------- | --------------------------------------- |
| Edition triage + editing | Anthropic: Haiku 5.5 (triage), Sonnet 5.5 (editor) | Workspace limit **$15/month**    | $20/month, spread per day (≤ $0.65/day) |
| X search                 | xAI: `x_search` with grok-4.3                      | Prepaid **$15**, auto top-up off | $0.50/day, $15/month                    |

> [!WARNING]
> The coding agent runs on the owner's ChatGPT subscription, which is a
> separate thing. App traffic must never use that subscription.

## How the Anthropic budget is split

```mermaid
flowchart TB
  m["Monthly cap $20"] -->|"remaining ÷ days left<br/>(max $0.65)"| d["Today's cap<br/>(UTC day)"]
  d --> res{"Scheduled edition<br/>run yet today?"}
  res -- no --> hold["Reserve held for it<br/>(1.5× a typical edition)"]
  res -- yes --> free["Whole remainder available"]
  hold --> other["Everything else may use<br/>today's cap − reserve"]
  d --> son["Sonnet may use at most 80%<br/>of today's cap"]
  d --> ver["Agent's test calls<br/>≤ $0.05/day"]
```

- **Daily cap** = what's left of the month divided by the days left, at most
  $0.65. Unspent money rolls forward.
- **Reserve:** until the morning edition runs, manual editions and tests
  can't eat into its share. The admin form creates private development tests.
- **Background triage:** its prepared entry point is disabled by default
  (`LLM_INCREMENTAL_TRIAGE_ENABLED=0`). When enabled, the worker checks once
  a minute, rotates topics and prepares at most 25 pending articles per pass,
  stopping two hours before publication. It requires reserve protection, shares
  the daily ledger and item cache, clears scheduled-edition privileges, and
  leaves refused items for the edition. Without an explicit reserve amount or
  a measured complete AI edition, the reserve protects the whole daily cap
  until the scheduled run finishes;
  background work then has no allowance before publication.
- **Model split:** Sonnet (the expensive editor) is capped at 80% of the day,
  leaving room for Haiku triage.

- Scheduled Sonnet editing can wait up to five seconds when its model allowance
  is temporarily held by other pending calls. Admission still reserves the full
  estimate atomically; daily, monthly and model caps stay the same.
- Waiting requires at least 300 seconds left in the shared ten-minute generation
  allowance. If admission still fails, the edition uses its normal fallback.

## Every call goes through a ledger

Spending is enforced before calling, not discovered afterwards.

```mermaid
sequenceDiagram
  participant L as Ledger (Postgres)
  participant P as Pipeline
  participant A as Anthropic / xAI
  P->>L: reserve worst-case cost (under a lock)
  alt over a cap
    L-->>P: refused, so use the fallback
  else allowed
    L-->>P: reservation id
  end
  P->>A: call (only if allowed)
  A-->>P: response + token usage
  P->>L: settle with the actual cost
```

- **Reserve, then settle.** Concurrent jobs can't race past a cap, because
  reservations and caps are checked under one database lock.
- **Inference admission:** each process admits four AI requests across topics,
  editing and repairs before taking budget holds. Up to 64 requests wait FIFO
  for at most 200 seconds, bounded by the generation deadline. Cache hits skip
  admission. The provider also retains its four-call/ten-second safety queue.
  Once admitted, each logical call has a 200-second allowance including provider queueing and backoff;
  HTTP attempts use at most 60 seconds and shrink to the remaining allowance.
  Scheduled generation shares one ten-minute deadline across topics, repairs,
  model fallback and slot admission. Expired AI work uses the existing non-AI
  fallback; saving the edition can finish. Manual runs have separate allowances.
- **Uncertain calls stay charged.** A timeout or unknown error keeps the full
  reservation, so spend is never undercounted.
- **Provider refusals** (limit reached, credits depleted) are recorded and
  stop further calls until the next period.
- **Visibility:** the Status page shows today's and this month's spend by
  purpose, plus the reserve.

Tables: `llm_calls`, `llm_cache`, `scheduled_ai_budget_days`,
`x_discovery_calls` (see [Data model](07-data-model.md)).

## Development allowance storage

- Separate development tables hold lifetime allowances: Anthropic $5 and xAI $2.
- Reservations persist until confirmed billing replaces the hold; admission stops
  at 75% of the allowance and never resets by date.
- A separate Anthropic runtime requires `LLM_LIVE=1`, uses fixed Haiku/Sonnet
  pricing and never retries calls. A separate direct-xAI runtime requires
  `X_SEARCH_LIVE=1`, holds $0.40 before each call and settles all reported token
  and fetched-item costs at fixed prices without retries.
- The Anthropic smoke command uses one development-funded Haiku call and
  verifies durable replay suppression without production accounting.
- Admin test editions accept `aiEditing: true` through the isolated Anthropic
  runtime; `paidXSearch: true` selects the separate development X runtime.
- The admin edition form defaults to free private tests using stored content.
  AI editing and paid X search have independent opt-ins using development funds.

- Admin → Spend shows each development provider’s charged amount, unresolved
  holds, cap, 75% stop threshold and remaining allowance before that stop.
