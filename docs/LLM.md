# Anthropic editorial transport and cost ledger

Manual and scheduled editions use bounded Anthropic triage and editing, with
immutable source evidence and labeled per-topic signal fallback. Status reports
real usage and the separate editor allocation. The sections below retain the
implementation and verification history; current publication behavior is described
under Immutable publication, Editor evidence provenance and Sonnet allocation.

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
allocation, publication fallback labels, scheduled Message Batches and
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
LLM_LIVE=1 pnpm exec tsx apps/api/scripts/smoke-llm-ledger.ts
```

The second command creates and destroys a fresh `postgres:17-alpine` container;
it ignores DATABASE_URL and never queries the live database. It verifies
concurrent reservations, settlement, JSON cache persistence, usage reporting,
provider-block rollover and uncertainty carried across months. This targeted
check is separate from the future STEERING 2a full integration suite.

Explicit live verification, after `pnpm migrate`, with the configured secrets
environment loaded (up to two tiny Haiku calls, including one repair):

```sh
LLM_LIVE=1 pnpm exec tsx apps/api/scripts/smoke-anthropic.ts
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
(with configured secrets loaded) is `LLM_LIVE=1 pnpm exec tsx apps/api/scripts/smoke-triage.ts`:
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

## Shortlist editor (iteration 54)

`ShortlistEditor` accepts up to ten unique candidates and a 0–10 story budget.
It asks configured Sonnet for selected IDs, headlines, 2–3 sentence summaries,
significance, selection rationale and 2–4 brief bullets. Prompts require source-only
facts, attribution and uncertainty, treating source text as untrusted. Schema
validation enforces bounded text, unique supplied IDs, budget and brief cardinality;
it cannot establish factual accuracy or enforce sentence counts. Source links
remain the caller's responsibility, never model-generated URLs.

The prompt bounds topic fields and each candidate to a 300-character title,
600-character excerpt and three 80-character source labels. This deliberately
small excerpt-only first step does not retrieve full articles. Empty input or a
zero budget spends nothing. Quiet selections may be empty. Sonnet refusal or
invalid output after its single repair tries configured Haiku through the same
reservation ledger; total refusal returns null for future non-AI publication.
A separate Sonnet spending allocation is not implemented. Identical complete
editor requests reuse validated transport cache, including empty selections.

Offline checks: `pnpm exec tsx --test apps/api/test/editor.test.ts`.
Explicit paid check with configured secrets loaded:
`LLM_LIVE=1 pnpm exec tsx apps/api/scripts/smoke-editor.ts`. It uses three real recent NBA
items, budget two, and checks identical regeneration without another call. No
edition is published. Initial Tech and NBA checks both returned valid empty
selections in one Sonnet call each ($0.003958 and $0.002828). These verify quiet
output and cache behavior, not live summary quality or editorial precision.
Today's/month's ledger total after these checks is $0.010234, zero reservations
or provider errors. Publication wiring, immutable editorial contracts, Sonnet
allocation and scheduled batches remain unfinished; M3 is still open.

## Immutable publication (iteration 55)

Manual and scheduled generation now share `editorial-v1`: score up to the
existing 200 latest window candidates per topic before lexical inclusion rules.
A complete triage uses relevance >=6 and importance >=4, ordered by importance,
then relevance and ID. Explicit exclusion phrases and quality rules stay hard
filters. The top ten eligible candidates form a headline-clustered shortlist;
the editor may choose fewer, including zero, with a maximum ten-story budget.
Larger configured budgets remain upper bounds, not targets.

Each snapshot keeps triage scores/event labels/rationale, unscored IDs, editor
model, brief, summary, significance and selection rationale. Source URLs,
original excerpts and original coverage headlines remain attached. Semantic
labels do not establish verified clusters or outlet independence. AI summaries
use only the supplied excerpts; full-article retrieval is still unfinished.
Incomplete triage, missing credentials or editor refusal publishes the original
lexical/ranked selection with an explicit per-topic non-AI label, never a mixture
of partially scored semantic candidates. A valid empty editor selection stays
empty. Older snapshots remain unchanged and readable.

`smoke-previews.ts` is now an explicit paid end-to-end publication check (not an
offline test); repeated identical input reuses validated caches. Publication
regressions use a fake repository connection and fake editorial services without
external calls. Sonnet allocation, scheduled Message Batches and concurrent
cache-miss coalescing remain follow-ups; M3 is still open.

The first live editor brief mentioned candidates absent from its final stories.
Publication therefore derives up to four brief bullets from selected rewritten
headlines, discarding the model's free-form brief. A one-story quiet topic has
one bullet. This structurally prevents unselected stories appearing in the brief;
it does not independently verify generated headlines or summaries.

Final live verification: 191 candidates across four topics produced twenty
Sonnet summaries; identical complete regeneration made no new calls and retained
immutable history. Final day/month ledger was $0.264979, zero reservations/errors,
under the $0.482758 daily/$14 monthly caps. This includes browser creation checks,
not only a single edition. Recency ordering can change editor prompt order across
different windows, so cross-window editorial cache reuse is not guaranteed.
Default `scripts/smoke-ui.ts` now reads existing live editions and uses browser-only
fixtures. Set `SMOKE_CREATE_EDITION=1` for a paid 24h creation check and
`SMOKE_EXTENDED_WINDOWS=1` for paid 6h/7d/custom-window checks. Default fixture
coverage and image-failure checks reuse a GET snapshot and make no LLM calls.

## Concurrent requests (iteration 56)

Within one `BudgetedLlm` instance, identical overlapping JSON requests now share
one in-flight promise, including the cache lookup, reservation, provider call,
validation, single repair and cache write. Run IDs do not affect request identity;
the first caller owns ledger attribution. Each joining caller validates the
result with its own validator. Different prompts/models/output limits remain
independent. Failure, refusal and thrown ledger errors release the in-flight
entry, so a later request can retry through the normal budget safeguards.

Publication services are reused per database pool through a WeakMap, allowing
concurrent manual editions in one API process to share this protection. The
worker has its own process: simultaneous API/worker requests can still duplicate
calls. Different triage batch compositions also remain distinct requests until
per-item results reach the persistent cache. Cross-process coordination,
canonical cross-window ordering, Sonnet allocation and scheduled Message Batches
remain unfinished. No pricing, models, providers or caps changed.

Offline concurrency regressions in `llm.test.ts` verify twelve overlapping runs
share one repair sequence and two ledger charges, failures preserve uncertain
reservations, unrelated prompts proceed independently, and database exceptions
release waiters without contacting the provider. These are fake-provider tests,
not live inference or an editorial-quality measurement.

## Triage field bounds (iteration 58)

The World fallback was reproduced on its single unscored real candidate:
both otherwise valid responses exceeded the rationale schema's 300-character
limit. The original request asked for a short rationale without stating that
limit. New triage prompts now explicitly give event/rationale character limits
and integer score ranges, including on the existing single repair attempt.
Validation remains strict; no text is silently truncated or cached after failure.
These formatting constraints leave the per-item cache identity unchanged, so
already validated scores remain reusable. Batch request identities change only
for cache misses. Explicit bounds reduce this failure risk; they do not guarantee
model compliance or establish editorial accuracy.

The same candidate passed on the first call with the constraints. A new immutable
edition of the prior window recovered five AI stories in all four topics, reusing
the Sonnet summaries. An identical regeneration made no new calls; the old
fallback snapshot was unchanged. Diagnosis and recovery used four Haiku calls
($0.001053), bringing actual day/month spend to $0.267129, with no reservations
or provider errors. Provider, models, pricing and caps are unchanged.

### Editor evidence provenance (iteration 60)

New shortlist-editor-v2 responses require nonempty, unique supplied evidence IDs
for each selection, including its lead ID. Unknown IDs and missing lead evidence
fail validation and follow the existing repair/fallback policy. Instructions ask
for every input supporting the headline, summary or significance. This records
model attribution; it does not prove completeness or factual entailment.

Publication resolves IDs against the exact editor shortlist and copies original
titles, URLs, supplied excerpts, source labels and times into optional story
`evidence`. The UI exposes these as “Summary sources”, separately from
headline-based related coverage. Model output cannot supply URLs. The changed
instructions invalidate editor caches only; triage caches remain reusable.
Historical snapshots and the v1 NBA evaluation remain unchanged and have no
retroactively inferred evidence.

## Sonnet allocation (iteration 61)

`LLM_EDITOR_DAILY_FRACTION` defaults to 0.8 (valid range 0–1). The configured
editor model can spend at most that fraction of the shared UTC daily allowance;
it gets no additional funds. This preserves capacity for Haiku triage and fallback
editing. Both models still obey the shared monthly/daily caps and provider block.
Model IDs must differ so the ledger can distinguish the two allocations.

The reservation transaction checks settled editor charges plus all outstanding
pending/uncertain editor reservations, including older days/months. Every repair
reserves again under the same limits. Successful settlement releases unused
reservation; known failure releases it, uncertain failure retains it. The existing
editor tries Haiku after Sonnet refusal, then publication uses labeled signal
ranking if no AI result is available. Validated cache reads remain free even when
an allocation is exhausted. Model/pricing/provider routes are unchanged.

Source & run status now displays the editor allocation, spent/reserved amount
and effective availability (also constrained by shared funds/provider block).
Isolated Postgres regressions exercise concurrent allocation reservations,
settlement, old uncertainty, real editor fallback with a fake provider, cached
regeneration and status totals. No live inference is needed for these checks.

Iteration 63: `shortlist-editor-v3` adds explicit evidence-of-absence guidance
and permits shorter source-supported summaries instead of padding sparse
excerpts. Instruction hashing invalidates old editor caches only; triage caches
and prior editions remain intact. This is a prompt mitigation, not factual
validation. The recorded Tech replay and remaining unsupported wording are
reported in `docs/RANKING.md`.

### Iteration 64: conservative absence validation

Editor v4 checks every story text field (including selection rationale) against
only its cited, bounded title/excerpt inputs; brief bullets use the selected
stories' cited inputs. Sentences containing lexical absence markers such as
`not`, `no`, `without`, `unconfirmed`, `unverified` or `rather than an announcement`
must occur verbatim in an input (case/whitespace normalized), or validation
fails through the existing reserved repair and capped model fallback. The prompt
explains this restriction; the changed instruction hash invalidates editor caches
only. Historical editions and evaluation artifacts remain unchanged.

This is a deliberately conservative lexical guard, not entailment or independent
verification: it can reject supported paraphrases and harmless uses of these
words, miss other unsupported claims, and accept inaccurate source statements.
Exact matching preserves subjects/qualifiers better than matching a negative
keyword alone. It does not prove the completeness of model-reported evidence IDs.
The recorded v3 Apple significance/rationale and benchmark verification caveats
are offline rejection regressions. An explicit Tech v4 live evaluation exhausted
two Haiku attempts without a validated result ($0.003047); no artifact or edition
was published. Sonnet was unavailable under its reservation allocation. This
shows safe rejection, not improved live recall; evaluate false rejections and
more general factual support next. Provider, model IDs and caps are unchanged.

Iteration 65: validation now passes a fixed application-owned absence-support
hint into the single reserved repair. It asks the editor to review every text
field and return complete corrected JSON with unsupported sentences removed.
Raw model output, source text and exception/schema messages are never appended
as feedback. Generic validation errors retain the existing JSON/schema hint;
input bounds, separate repair reservation, fallback and validated caches apply.
Initial prompts/cache identity and the conservative support rule are unchanged.
Regressions inspect the actual repair request for all four story fields.
An explicit Tech v4 retry still produced no validated result after two calls
($0.003279). No artifact or edition was published; useful feedback alone has
not established recovery or a reduction in false rejections. Structured failure
categories and recorded safe rejection diagnostics are the next step.

Iteration 66: the budgeted caller retains a process-local ring of the last 32
validation failures, exposed as defensive copies through the editorial facade.
Each entry contains only `initial`/`repair`/`cache` and one closed category:
`invalid-json`, `invalid-schema`, `invalid-selection`, `unsupported-absence`, or
`validator-error`. Parsing is separated from validation so validator exceptions
cannot masquerade as JSON failures. No response text, exception messages, schema
paths, candidate/run IDs or source text are retained. Cache failures remain
exceptions; invalid paid outputs still receive at most one separately reserved
repair and never enter the validated cache. No prompt/cache identity changes.

The explicit editorial recorder prints this bounded diagnostic list before
checking for refusal, including on a failed edit. The list is shared by triage
and editing within that process, has no durable/run attribution, and resets on
restart; it is a debugging aid rather than a count of provider errors or factual
accuracy. Reservation refusals and transport errors are not validation failures.
No paid replay was performed in iteration 66. The earlier Tech failures cannot
be diagnosed retroactively; a future explicit bounded replay can now distinguish
absence rejection from schema/selection failure before changing the guard.

Iteration 67: the bounded Tech replay reports `invalid-schema` initially and
`unsupported-absence` on repair, with no accepted artifact. Categories do not
identify the schema field or rejected sentence; no false-rejection conclusion
is possible. Inspection found the editor prompt omitted its enforced field
length limits. Added explicit text/array bounds and exact-key requirements to
both initial and repair instructions; validation and absence guard are unchanged.
The instruction hash changes editor cache identity; triage caches are retained.
Boundary/overlong-field repair tests exercise every bounded text field.

A second explicit Tech replay, after that change, needed one absence repair and
returned five validated stories via configured Haiku fallback ($0.003503).
The frozen v4 artifact supports offline replay, not publication. Both attempts
cost $0.006296 total; actual day/month spend is $0.408415, with zero reservations
or provider errors. No causal or general quality claim follows from one success.

### Development live-call guard

The three Anthropic smoke scripts and historical editorial recorder refuse to
run unless `LLM_LIVE=1`, before
opening a database connection. They tag all reservations (including editorial
fallback and JSON repair) `purpose=verification`. The ledger serializes a shared
$0.05 UTC-day verification allowance across processes, in addition to the normal
app/model caps. Pending and uncertain reservations count until resolved, even
across days; known failures release funds. This daily ceiling is stricter than
the owner's $0.05 per-iteration limit. A cache hit spends nothing. The editor
smoke remains an explicit Sonnet check; prefer the tiny Haiku smoke when a live
check is necessary. Routine tests use fakes and never require this opt-in.

Historical development calls used older purpose tags and are not retroactively
classified. Fingerprinted fixture replay remains open work. No paid calls were made to verify this guard.

Iteration 179: the historical `record-editorial-evaluation.ts` entrypoint now
uses the same verification ledger for triage, editing, repairs and fallback.
Existing snapshots are still never overwritten; incomplete results write no
snapshot. Recording remains an explicit paid operation, not part of checks.

Status now breaks down UTC-day/month spend and unresolved reservations by ledger
purpose, including development verification. Old holds remain visible across
months. Other purpose tags retain their original names because historical
development and digest calls cannot reliably be separated retroactively.
