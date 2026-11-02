# Anthropic editorial transport and cost ledger

Iteration 52 implements a real, bounded SDK transport and exposes its recorded
usage under Source & run status. Published editions still use signal ranking;
this is not yet the M3 editorial pipeline. One explicit live verification scored
three stored headlines with Haiku. It did not publish those scores as a digest.

`curation/domain/LlmPort` isolates provider calls; `LlmLedger` isolates persistence.
The Anthropic adapter uses the official SDK, direct API, a 60-second timeout and
zero automatic retries. Shared instructions request five-minute prompt caching;
short prompts may not meet Anthropic's cache threshold. JSON is locally validated
by a supplied schema. Invalid JSON/schema gets one separately reserved repair.
No other provider, model substitution or billing route is used.

Migration 015 stores calls, sanitized error codes, provider month blocks and
validated result caches. Calls record model, purpose, run ID, each of the four
usage counters, actual cost and worst-case reservation in integer microdollars.
Raw provider errors, keys and prompts are not saved in the ledger. Cache keys
hash model/instructions/input/output limit; only validated output is cached.
Repeated identical input across run IDs reuses the cached result. Concurrent
cache misses can each call the provider, but cannot bypass budget reservations;
per-item triage keys and cross-process cache-miss coalescing remain pipeline work.

A database transaction advisory lock serializes reservations across API/worker
processes, without holding a transaction during HTTP. Input reservation uses a
conservative UTF-8 byte bound plus 2,048 framing tokens at the highest input/cache
rate, and the requested maximum output tokens. Reject prompts whose bound reaches
100k and output limits outside 1–16,000. Actual usage settles the reservation.
Network/unknown failures retain the full reservation as uncertain; crash-left
pending calls do too. They remain charged against future day/month budgets until
manually reconciled from provider usage. Never automatically expire or retry them.

Caps default to $14/month and $1/day maximum; environment overrides can lower
these limits, never raise them. Today's allocation is remaining monthly funds
at the start of the UTC day divided by days remaining including today. Pending
and uncertain reservations reduce availability. Unspent days roll forward.
Status shows actual spend, reservations, availability, monthly calls per model,
last sanitized provider error and any provider-block expiry.

HTTP 400 workspace API usage limits and 429 enforced_spend_limit_reached persist
a block through the end of the UTC month. Ordinary rate limits are not mistaken
for monthly blocks, but no hidden SDK retry is allowed. Budget/provider failures
return no result, allowing the future editor to retain signal ranking. Sonnet
allocation, Haiku editor fallback, scheduled Message Batches, per-item triage and
immutable AI edition contracts remain unfinished.

Configuration (all rates USD per million tokens):

| Variable prefix | Default model       | Input | Cache write (5m) | Cache read | Output |
| --------------- | ------------------- | ----: | ---------------: | ---------: | -----: |
| `LLM_TRIAGE_`   | `claude-haiku-5-5`  |  0.10 |            0.125 |       0.01 |   0.50 |
| `LLM_EDITOR_`   | `claude-sonnet-5-5` |     2 |             2.50 |       0.10 |     10 |

Suffixes: `MODEL`, `INPUT_USD_PER_MILLION`, `CACHE_WRITE_USD_PER_MILLION`,
`CACHE_READ_USD_PER_MILLION`, `OUTPUT_USD_PER_MILLION`. The owner-selected defaults
come from STEERING 3; cache creation uses the five-minute 1.25x input rate.
Budget variables: `LLM_MONTHLY_BUDGET_USD`, `LLM_DAILY_MAX_USD`. Secrets are loaded
only from the configured service environment. Never print them.

Verification:

```sh
pnpm exec tsx --test apps/api/test/llm.test.ts
pnpm exec tsx apps/api/scripts/smoke-llm-ledger.ts
```

The second command creates and destroys a fresh `postgres:17-alpine` container;
it ignores DATABASE_URL and never queries the live database. It verifies
concurrent reservations, settlement, JSON cache persistence, usage reporting,
provider-block rollover and uncertainty carried across months. This targeted
check is separate from the future STEERING 2a full integration suite.

Explicit live verification, after `pnpm migrate`, with the configured secrets
environment loaded (up to two tiny Haiku calls, including one repair):

```sh
pnpm exec tsx apps/api/scripts/smoke-anthropic.ts
```

It scores three real stored headlines, validates IDs and score bounds, verifies
cache reuse, and prints only sanitized ledger counters and costs. It is never
part of `pnpm check`. On 2026-11-02 the first call used 336 input/225 output tokens,
no cache tokens, and cost $0.000147 at the configured rates. Provider-side earlier
owner verification calls are outside this application's ledger.
