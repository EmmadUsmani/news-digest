# Anthropic editorial transport and cost ledger

Iterations 52–53 implement a real, bounded SDK transport and candidate triage, exposing recorded
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
triage adds per-item keys below. Cross-process cache-miss coalescing remains unfinished.

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
allocation, Haiku editor fallback, scheduled Message Batches and
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

## Candidate triage (iteration 53)

`CandidateTriage` scores up to 200 unique candidates per topic before lexical
phrase filtering. It sends three compact title/excerpt/source records at a time
to configured Haiku. Topic description and guidance participate in both prompt
and cache identity. Prompts treat supplied text as untrusted data. No article
fetching, alternate models or providers are involved.

Validated output contains relevance and importance (integers 0–10), a bounded
rationale and an advisory event label. Each batch must return every requested ID
exactly once. Duplicate, missing or invented IDs and invalid scores trigger the
transport's single reserved repair; failure stops remaining batches. The result
explicitly lists unscored IDs so future publication cannot silently treat budget
refusal as a relevance judgment. Event labels do not establish duplicate identity
or independent coverage, especially across separate batches.

The service caches each validated item separately using model, instructions,
compact topic and compact item identity. Reordering, adding unrelated items or
changing the edition/run ID reuses unchanged items; changing text or topic
instructions invalidates them. Cache entries remain internal and are not digest
snapshots. Concurrent cache misses may still make duplicate paid requests within
the budget caps. Scheduled Message Batches are not implemented.

Input bounds: 200-character IDs/name, 2,000 characters each for description and
guidance, 500-character titles, 1,800-character excerpts and eight 120-character
source names. Three-item batches stay below the conservative 100k bound even
with JSON escaping. Truncation is a deliberate cost limit; this is excerpt-based
triage, not an evaluation of full article claims.

`pnpm exec tsx --test apps/api/test/triage.test.ts` runs offline schema, coverage,
cache, budget fallback and worst-case prompt tests. The explicit live command
(with configured secrets loaded) is `pnpm exec tsx apps/api/scripts/smoke-triage.ts`:
six stored last-24h items for each of the four topics, then reordered cache checks.
At most sixteen tiny requests including one repair per three-item batch; every
request uses the existing reservation ledger. It publishes no edition. M3 still
needs triage integration, shortlist editing, immutable editorial contracts and
non-AI fallback labels before an end-to-end editorial digest can be claimed.

Live verification on 2026-11-02 scored 24 real articles (six per topic) in eight
Haiku calls costing $0.003301. All reordered repeats reused per-item cache.
The status page showed $0.003448 total today/month, zero reservations and no
provider errors, against the $0.482758 daily allocation and $14 monthly cap.
These are transport/triage checks, not a measured improvement in digest quality.
