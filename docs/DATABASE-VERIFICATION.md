# Database verification

Run `pnpm test:integration` with Docker available, or `pnpm check` for the full
verification chain. The runner starts fresh PostgreSQL 17 and Redis 7 containers,
applies every migration, runs the explicitly registered integration suite, and
prints Node's native V8 line/branch/function coverage. It never uses the live DB.

## Baseline: iteration 223, November 2, 2026

All 122 integration tests passed. The report includes all 16 source database
adapters/helpers plus the direct operations-status adapter. Migration execution
is a separate setup process and is not included in coverage. The test suite also
loads compiled adapters through the Nest HTTP app; those appear separately under
`dist/`. Their percentages must not be combined with the `src/` measurements.
Native V8 coverage lists only loaded files; check the source inventory before
interpreting missing rows:

```sh
rg --files apps/api/src | rg '/(database|libs/db)/|/operations/adapters/operations.status.ts$'
```

Source rows with branch coverage below 85% in this baseline:

| Source file                                |   Lines | Branches | Functions |
| ------------------------------------------ | ------: | -------: | --------: |
| `libs/db/connections.ts`                   |  85.71% |   60.00% |    83.33% |
| `curation/database/edition-cost.reader.ts` | 100.00% |   80.00% |    75.00% |
| `curation/database/usage.reader.ts`        |  99.12% |   42.86% |    66.67% |
| `operations/adapters/operations.status.ts` |  89.73% |   79.41% |    83.33% |
| `operations/database/topic-coverage.ts`    | 100.00% |   75.00% |    66.67% |
| `topics/database/topic.repository.ts`      |  93.60% |   80.70% |    94.12% |

Module paths above are relative to `apps/api/src/modules/`, except `libs/db`.
The runtime report identifies uncovered line numbers. Remaining source rows have
at least 85% branch coverage; that does not prove every query behavior is pinned.
High line coverage can coexist with missing error paths, JSON shapes, transaction
outcomes or boundary assertions. No coverage threshold currently certifies the
ORM migration as safe. Continue characterization through repository ports and
HTTP, and finish AI golden coverage before declaring STEERING 2a complete.

## Usage reader characterization (iteration 224)

`usage-purpose.test.ts` also pins an empty ledger, UTC day/month inclusion
(including an offset timestamp at midnight), per-model ordering and totals,
failed-reservation exclusion, pending and older uncertain holds, latest error
selection, and current-month versus expired provider blocks. All assertions use
the reader API against disposable PostgreSQL; no provider requests are made.
The 123-test integration run measures this source reader at 100% lines and
92.86% branches (previously 99.12% and 42.86%). The iteration 223 table above
remains the historical baseline. AI golden and other behavior gaps remain open.

## Historical edition-cost characterization (iteration 225)

`scheduled-budget.test.ts` pins the reserve-sizing reader's complete-AI snapshot
requirements, including absent editorial fields, partially scored social topics,
empty topics and other generation methods. It also checks empty history,
deterministic ID ordering when timestamps tie, limits, millisecond lookback/future
boundaries, and exact safe-integer conversion of PostgreSQL bigint costs. Values
above JavaScript's safe integer range fail closed. These are disposable-database
assertions through the reader API; they make no inference calls.

The 124-test integration run measures this source reader at 100% lines and
92.31% branches (baseline 80% branches); AI golden and other behavior gaps remain.

## Topic coverage characterization (iteration 226)

`topic-coverage.test.ts` now pins empty topic counts and tied-position ordering,
river/search/Reddit-X citation deduplication, topic isolation and reassignment,
and topic deletion. It checks the inclusive one-hour source-health interval,
failed/never-successful/future sources, and millisecond publication boundaries
with an offset timestamp and a non-UTC database session. Synthetic Reddit rows
are isolated fixtures; no Reddit or provider requests occur. Citation age and
search-call failure do not exclude an otherwise verified post from coverage.
AI golden and other repository behavior assertions remain open.

## Custom-feed capacity characterization (iteration 227)

`settings.test.ts` pins the 500-source catalog and 100-connection per-topic
admission boundaries through the topic repository API. At capacity, repeating an
existing connection succeeds without changing the catalog; an existing catalog
URL can fill the last available topic slot. New URLs and new connections are
rejected at their respective limits without leaving catalog or connection rows.
All 500-source fixtures live only in disposable PostgreSQL and are cleaned up.
No feed, Reddit or inference requests occur.

## Ingestion citation characterization (iteration 228)

`content-repository.test.ts` now pins ingestion's citation persistence boundary:
IDs are derived from validated URLs, duplicate links collapse, lookalike hosts
are rejected, and independent sources retain independent citations. Reobserving
an unnamed URL preserves the named verification URL and first-seen timestamp,
updates last-seen time, and replaces the citation engagement JSON. A later invalid
item rolls back both new citations and updates, together with source health.
All assertions run in disposable PostgreSQL; no X, Reddit or inference calls.

## Publisher-discovery ordering characterization (iteration 229)

`article-discovery.test.ts` pins the eight-candidate cap with twelve eligible
articles, deterministic UUID ordering for tied publication timestamps, topic
position changes, and deduplication when a publisher connects to two topics.
A failed article suppresses the entire publisher host; aging that failure past
the daily cooldown restores the same ordered candidates. Assertions use the
repository port and disposable PostgreSQL, with no publisher or provider calls.
AI golden and other repository behavior gaps remain open.

## River-discovery transaction characterization (iteration 230)

`river-discovery.test.ts` pins duplicate citation collapse, raw collection counts,
canonical URL and first-seen preservation, last-seen refresh, and named
verification URL preservation/replacement. A later invalid citation rolls back
prior inserts, citation updates and source health together. Empty successful
collections clear source errors without removing retained evidence. Assertions
use the repository API with disposable PostgreSQL; no network requests occur.

## X-search transaction characterization (iteration 231)

`x-discovery-report.test.ts` pins rollback when a later citation violates a
required field: neither the earlier insert nor first-search yield attribution
survives. Existing evidence remains unchanged. A successful retry on another
call owns the first attribution; duplicate links and empty saves are idempotent,
and verification candidates reflect only committed citations in descending ID
order. Assertions use repository/report APIs and disposable PostgreSQL, with no
X, Reddit or inference requests. AI golden and other behavior gaps remain open.

## Topic write isolation and rollback (iteration 232)

`settings.test.ts` pins foreign-profile and missing-topic rejection for updates,
source connections, custom feeds, deletion and reorder. Rejections preserve both
profiles and the shared source catalog. Database-rejected JSON writes leave
existing settings and topic order intact; successful creation afterward proves
transaction recovery. Unicode guidance and relevance JSON round-trip, omitted
social lists survive updates, and explicit empty lists clear them. All rows are
disposable fixtures; no Reddit, X or inference requests occur.

## Verified-post refresh characterization (iteration 233)

`social-candidates.test.ts` pins verified X post insert and refresh semantics:
author and embed refresh, a null incoming publication time preserves the stored
time, and a supplied time replaces it with millisecond/offset fidelity. The
original canonical URL and metrics remain unchanged on conflict, and repeated
refreshes leave one row. A database-rejected JSON field leaves every existing
field, including verification time, intact; a later valid refresh recovers.
Assertions use disposable PostgreSQL and make no X, Reddit or inference calls.
AI golden and other repository behavior gaps remain open.

## Edition history boundary characterization (iteration 234)

`preview-history.test.ts` pins chronological ordering ahead of UUID ordering,
tied timestamps, exactly 20 remaining entries without a next-page sentinel,
last-entry and exhausted offsets, and recovery after a rejected negative offset.
Latest reads use persisted timestamps and descending IDs even when immutable
snapshot metadata differs, and caller mutations cannot change later reads.
Offset timestamps normalize to UTC while window milliseconds survive history
mapping. Fixtures exist only in disposable PostgreSQL; no provider calls occur.
AI golden and other repository behavior gaps remain open.

## AI edition golden characterization (iteration 235)

`edition-golden.test.ts` now runs the same fixed content through fallback and
AI publication in disposable PostgreSQL. The AI case injects a synthetic
`LlmPort` with explicit triage/editor responses, exercises real `BudgetedLlm`,
`CandidateTriage` and `ShortlistEditor`, and compares the complete stable
snapshot with `ai-golden.json`. Only edition ID and creation time are excluded.
The golden pins source URLs, excerpts, evidence, semantic scores, editor text,
quality rejection and window boundaries. A second generation produces a new ID
and identical content from cache, without another LLM call; the first stored
edition remains unchanged. The ledger/cache are in memory; no provider or Reddit
requests occur. These are synthetic responses, not recorded live responses.
Remaining repository behavior gaps and recorded-response golden coverage stay
open; this step alone does not complete STEERING 2a or 4.

## Queue failure isolation characterization (iteration 237)

`operations.test.ts` now injects a failure in one queue command against disposable Redis and
checks that Status returns its unavailable shape while retaining the other three
queues, source rows and topic coverage. A real BullMQ scheduler pins the reported
next-run timestamp; pause/resume and scheduler removal update telemetry, and job
payloads stay private. Cleanup removes the isolated scheduler and queue state.
No live services, provider APIs or Reddit endpoints are called. Remaining
repository behavior gaps and recorded-response golden coverage remain open.
