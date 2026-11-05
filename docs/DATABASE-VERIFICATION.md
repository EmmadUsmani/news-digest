# Database verification

Run `pnpm test:integration` with Docker available, or `pnpm check` for the full
verification chain. The runner starts fresh PostgreSQL 17 and Redis 7 containers,
applies every migration, runs the explicitly registered integration suite, and
prints Node's native V8 line/branch/function coverage. It never uses the live DB.
Each run owns a temporary root for child processes and Node coverage files;
the runner removes it after success or failure, without sweeping shared `/tmp`.
Postgres (`/var/lib/postgresql/data`) and Redis (`/data`) use tmpfs, so their
image-declared data directories cannot leave anonymous disk volumes behind, even
if the runner is killed. Test data is ephemeral and disappears with the containers.

## ORM prerequisite review (iteration 567)

STEERING 29 stops broad characterization work. Add tests only for a concrete
query boundary needed by the ORM conversion; a green suite alone does not
certify that every SQL statement is covered. The current source inventory is:

| Adapter group                                  | Existing isolated suite anchors                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Profiles and topics                            | `profile-repository`, `topic-repository`, `settings`, `api-http`                                     |
| Content ingestion                              | `content-repository`, `ingestion`                                                                    |
| Edition candidates and snapshots               | `edition-golden`, `editorial-publication`, `preview-history`, `digests`, `article-pool-database`     |
| LLM ledger, usage and edition costs            | `model-allocation`, `usage-purpose`, `verification-budget`, `reserve-status`                         |
| Scheduled budget and incremental admission     | `scheduled-budget`, `reserve-admission`, `incremental-triage-lock`, `incremental-triage-composition` |
| Publisher/river X discovery and verified posts | `article-discovery`, `river-discovery`, `social-candidates`, `social-selection`, `citing-stories`    |
| Paid X search, ledger and reports              | `x-search`, `x-discovery-ledger`, `x-discovery-report`                                               |
| Reddit and Bluesky storage                     | `reddit-collection`, `reddit-communities`, `bluesky-storage`                                         |
| Operations, coverage and DB instrumentation    | `operations`, `topic-coverage`, `query-stats`, `slow-query-database`                                 |

Names above refer to `apps/api/test/<name>.test.ts`. They identify where to
validate a conversion, not a claim of exhaustive query coverage. Since iteration
568 the runner reports SQL in public facades too. Include these in the conversion
inventory: `curation/public/usage.ts`, `profiles/public/budget-day.ts`,
`digests/public/incremental-triage-pool.ts`, `digests/public/reaction-stories.ts`,
`social/public/selection.ts` and `social/public/citing-stories.ts`. Also account
for health SQL in `app.ts`, direct operations SQL, and the console's intentional
owner SQL helper. Removing SQL only from `database/` would leave the ORM work
unfinished.

The two article-pool facades previously had fake-only query tests.
`article-pool-database.test.ts` now uses real isolated PostgreSQL to pin their
independent story/post budget gates, disabled/deleted configuration, shared-source
dedupe, half-open timestamp window in a non-UTC session, hard exclusions and
semantic recovery versus lexical reaction filtering. Every write rolls back;
neither the default-off worker nor any inference is activated.

The fixed-input synthetic AI edition golden already satisfies the fixed-content
golden part of 2a. Item 4's **real raw-response recording** is a separate open
requirement: all three files under `fixtures/llm/` are explicitly synthetic.
Do not re-label those or spend merely to replace them. Before declaring 2a
complete, reconcile the full source inventory with current coverage and concrete
behavior assertions, including these public facades. Then record Drizzle's
decision/schema parity and convert one repository per commit. Preserve owner
login grants, back up before the first new migration, and observe the two-hour
edition deployment freeze from STEERING 29.

## Public query coverage reconciliation (iteration 568)

The expanded integration report measures these **source** boundaries separately
from their compiled HTTP counterparts. All 363 unit and 199 integration tests
pass. Percentages describe execution, not complete behavior characterization.

| Public SQL boundary                         | Lines / branches | Existing behavior assertions                                                                                      |
| ------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `curation/public/usage.ts`                  | 94.39% / 70.00%  | `reserve-status`: pending/running/retry, disabled policy, completed fallback and immutable outcome                |
| `profiles/public/budget-day.ts`             | 100% / 60.00%    | `reserve-admission`: no-occurrence day, occurrence day, schedule row lock and concurrent settings                 |
| `digests/public/incremental-triage-pool.ts` | 100% / 71.43%    | `article-pool-database`: budgets, disabled/deleted topic, transaction visibility, exact windows and semantic pool |
| `digests/public/reaction-stories.ts`        | 100% / 77.78%    | `article-pool-database`: independent post budget, deduped sources, lexical rules and window ordering              |
| `social/public/selection.ts`                | 100% / 91.67%    | `social-selection`: scoped verified posts, window end exclusion, duplicate routes, budgets and frozen snapshots   |
| `social/public/citing-stories.ts`           | 100% / 85.71%    | `citing-stories`: selected lead/coverage/evidence only, topic isolation and frozen titles                         |

Every current source `database/` adapter appears in this run, including the
default-off incremental admission adapter. `libs/db/migrate.ts` runs separately
from zero against the disposable database. Health's `SELECT 1` is exercised by
`api-http`; the intentional console SQL escape hatch by `console`. Neither is a
repository query to translate into an ORM builder. Instrumentation stays in
`libs/db`; operations remains in the conversion inventory above.

Iteration 569 adds a direct missing-schedule assertion and exercises the same
failure through `readLlmUsage` against isolated PostgreSQL. A one-connection pool
must return its checkout after rejection; a separate session must acquire the
shared ledger lock, proving rollback released it. Restoring the schedule permits
a successful usage read on the same pooled session. The fixture restores both
the saved schedule and today's lifecycle rows.

Iteration 570 closes the remaining concrete social selection gap against isolated
PostgreSQL: latest observation at or before the edition cutoff (including an
equivalent non-UTC timestamp), ascending call UUID for equal instants regardless
of insertion order, older-observation fallback, future and other-topic exclusion,
and null reports. Assertions inspect the public selection's `xSearchRanking`;
reported counts never become verified metrics. The identified 2a prerequisite
reconciliation is complete; keep this suite green through each ORM conversion.
The unexecuted `configuredLlmCaps` export is not a database gap.

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

## Connection isolation guards (iteration 238)

`connection-isolation.test.ts` runs without external services. It verifies that
both connection factories reject a test process unless its isolation flag is
exactly `1`, even with inherited production-shaped URLs. It also checks that
the shared test runner environment replaces service addresses, clears provider
keys and live-call opt-ins, and leaves the parent environment unchanged.
Disposable integration tests continue to exercise admitted connections. These
checks do not certify all repository behavior or complete STEERING 2a.

## Rolling coverage across daylight saving (iteration 239)

`topic-coverage.test.ts` pins an elapsed 24-hour article window across both
America/Los_Angeles daylight-saving transitions in a non-UTC database session.
The previous local start hour shifts in opposite directions in spring and fall;
articles exactly at the start count, while those one millisecond before the
start or exactly at the end do not. Connected-source and exact one-hour health
counts remain available. Fixtures and transaction rollback use only disposable
PostgreSQL; there are no provider or Reddit requests. Remaining repository gaps
and recorded-response golden coverage stay open.

## Scheduled X verification admission (iteration 240)

`x-discovery-report.test.ts` pins the verification candidate reader through its
repository API: per-call isolation, the ten-post cap, numeric-length ordering,
verified-post exclusion, disabled topics and zero post budgets. In a non-UTC
transaction, a check exactly one day old is still suppressed, one millisecond
older is eligible, and newer/future checks remain suppressed regardless of their
error field. Re-enabling the topic restores the same candidates. All fixtures
roll back in disposable PostgreSQL; no X, Reddit or inference requests occur.
Remaining repository gaps and recorded-response golden coverage stay open.

## Missing X publication-time recovery (iteration 241)

`x-post-time.test.ts` pins the maintenance reader/writer in a rolled-back,
non-UTC transaction: exact observation-time inclusion, future time exclusion
at one millisecond and later recovery, legacy/overflow ID rejection,
existing publication preservation and non-X exclusion. Full-row comparisons
ensure recovery changes only publication time; repeated runs return zero.
Synthetic Reddit rows test platform isolation without network requests.

## Source health recovery (iteration 242)

`content-repository.test.ts` pins a first failed poll before any success, a
successful nonempty poll, a later failure and repeated empty successful polls.
Failures retain the last-success timestamp and last successful item count;
empty recovery clears the error and reports zero new items while preserving
stored observations and the latest-content response. An independent source's
health remains unchanged. All fixtures use disposable PostgreSQL; no feed,
Reddit or inference requests occur. Remaining repository gaps stay open.

## Shared-feed connection lifecycle (iteration 243)

`content-repository.test.ts` pins one collection entry for a feed connected to
two enabled topics, identical content views in both topics, continued collection
when the legacy owning topic is disabled, and removal from collection when the
last enabled connection is deleted. Re-enabling the original topic restores its
retained content without changing source health or observation counts. All
fixtures use disposable PostgreSQL; no feed, Reddit or provider requests occur.
Remaining repository gaps and recorded-response golden coverage stay open.

## Concurrent catalog admission (iteration 244)

`settings.test.ts` races two different custom-feed registrations from separate
topics against a 499-source catalog. Exactly one succeeds, leaving 500 sources,
one new catalog row and no connection for the rejected feed. The rejected
caller can then connect the winning URL at full capacity, pinning transaction
rollback and lock release. The test uses disposable PostgreSQL only; no feed,
Reddit or provider requests occur. Remaining repository gaps stay open.

## Concurrent content ingestion (iteration 245)

`content-repository.test.ts` races two publishers storing the same canonical
article. It pins one item, both source observations, lossless merging of distinct
engagement keys, and one preview entry with deterministic publisher attribution.
Concurrent repeat batches preserve the item ID and engagement, dedupe observations,
and independently update each source's successful collection count. All writes
use disposable PostgreSQL; no publisher, Reddit or inference requests occur.

## Concurrent topic deletion and ordering (iteration 246)

`settings.test.ts` races a complete reorder against deletion of a middle topic.
It accepts either serialized outcome and compares every remaining topic field,
including contiguous positions. Two further concurrent deletions close both
gaps; repeated deletion and stale reorder fail without changing settings, and
a valid reorder restores the original state. Tests use repository APIs against
disposable PostgreSQL only. No provider, feed or Reddit requests occur.
Remaining repository gaps and recorded-response golden coverage stay open.

## Concurrent LLM cache characterization (iteration 247)

`model-allocation.test.ts` races two ledger instances writing different nested
JSON responses to one cache key. Reads retain one complete winning response,
ignore later replacements and isolate caller mutations. A PostgreSQL-rejected
zero byte leaves another key absent; a valid retry succeeds without changing
the original key. All reads and writes use repository APIs against disposable
PostgreSQL; no inference, X or Reddit requests occur. Remaining repository gaps
and recorded-response golden coverage stay open.

## Concurrent schedule replacement (iteration 248)

`profile-repository.test.ts` races complete schedule replacements through two
repository instances. Each returned and persisted schedule matches one whole
submitted configuration; a writer may read a later committed replacement.
A rejected invalid-budget update racing a valid replacement leaves the valid
configuration intact, and a subsequent update succeeds. Original settings are
restored in disposable PostgreSQL only; live schedules and providers are untouched.

## Scheduled publication failure recovery (iteration 249)

`scheduled-digests.test.ts` injects a progress-reporting failure immediately
before publication. The repository propagates the original error, leaves history
unchanged and persists no scheduled snapshot. Concurrent retries through separate
repository pools then acquire the released session lock and return one identical,
retrievable snapshot with exactly one scheduled row. Editorial services are
disabled; all data lives in disposable PostgreSQL and no provider requests occur.

## Publisher admission time boundaries (iteration 250)

`article-discovery.test.ts` pins the inclusive three-day publication window and
future exclusion at one millisecond, seven-day success and one-day error retry
boundaries, and future-check suppression. A failed article at exactly one day
still waits for retry while its host becomes available to sibling articles;
one millisecond newer suppresses the whole host. Assertions use a frozen
transaction clock in a non-UTC session and roll back disposable PostgreSQL
fixtures. No publisher, X, Reddit or inference requests occur.

## Source diagnostic persistence (iteration 251)

`content-repository.test.ts` pins diagnostics below, at and above the 300-character
storage limit, including multibyte text. Failed polls retain successful timestamps,
item counts and observations. A PostgreSQL-rejected zero byte leaves the entire
source status unchanged; a subsequent valid failure and empty successful poll
recover normally. Independent source health and retained content stay unchanged.
All assertions use disposable PostgreSQL; no provider or source requests occur.

## Embed-check retry boundaries (iteration 252)

`social-candidates.test.ts` pins the strict daily embed-check retry cutoff at
one millisecond in a non-UTC transaction. Failed and successful checks both
suppress immediate retries; a rejected zero-byte diagnostic preserves the prior
check and its eligibility, and a valid retry clears the error. Repeated checks
retain one row. All assertions use disposable PostgreSQL, with no X, Reddit or
inference requests.

## Missing publication-time recovery (iteration 253)

`social-candidates.test.ts` pins the global verified-X timestamp backfill through
its repository API. Exactly-now Snowflakes are accepted, one-millisecond future
posts wait until eligible, and invalid, legacy and overflowing IDs stay undated.
Existing publication times, Reddit rows and all other post fields remain intact;
repeating a backfill updates zero rows. The fixture uses a non-UTC transaction
and rolls back all changes in disposable PostgreSQL. No provider or source
requests occur. Recorded-response golden and other repository gaps remain open.

## Concurrent publisher failure recovery (iteration 254)

`article-discovery.test.ts` races two repository instances updating the same
publisher citation. A disposable-database constraint rejects one transaction at
its final check write while the other commits. The rejected transaction leaves
no new citation or author replacement; the winner retains the original first-seen
time and engagement, adds both new citations and records a successful three-link
check. No publisher, X, Reddit or inference requests occur.

## Source replacement failure recovery (iteration 255)

`settings.test.ts` rejects a connection insert after the repository deletes the
previous selection, proving rollback restores the complete topic. A rejected
replacement racing a valid save through another repository leaves exactly the
valid selection. A subsequent disconnect succeeds; the source catalog and all
other topics remain unchanged. A temporary constraint injects failure only in
disposable PostgreSQL. No source, Reddit or provider requests occur.

## Reorder write failure recovery (iteration 256)

`settings.test.ts` injects a position constraint failure after topic membership
validation and row locking. A rejected reorder leaves every topic field intact;
a competing valid reorder through another repository succeeds with contiguous
positions and complete settings. Removing the constraint permits the previously
rejected order, and the original order can then be restored. The shared source
catalog and profile schedule remain unchanged. All fixtures use disposable
PostgreSQL; no source, Reddit or provider requests occur.

## Custom-feed registration rollback (iteration 257)

`settings.test.ts` rejects a new feed connection after catalog insertion, proving
the transaction leaves neither an orphan source nor altered topic settings.
Removing the rejection permits registration; repeating it retains one source
and one connection, while other topics stay unchanged. A temporary constraint
injects failure only in disposable PostgreSQL; no feed or provider requests occur.

## Topic deletion rollback (iteration 259; recovered from 258)

`settings.test.ts` rejects gap closure after a topic deletion has cascaded to
its source connections. The entire topic list, connection and source catalog
survive unchanged. Removing the constraint permits deletion with contiguous
positions; repeated deletion returns missing and cleanup restores the original
settings. All fixtures use disposable PostgreSQL, with no source or provider
requests. Recorded-response golden and other repository gaps remain open.

## Final ingestion-write rollback (iteration 260)

`content-repository.test.ts` rejects the final source-status update after a
batch has updated an existing article, inserted another article and written
both X citations. The entire retained article, citation, preview and source
status snapshot remains unchanged. Removing the constraint permits a successful
retry with the original article ID and citation first-seen time; repeating the
batch retains exactly two articles, observations and citations. All fixtures
use disposable PostgreSQL, with no source or provider requests.

## Concurrent ingestion merge (iteration 261)

`content-repository.test.ts` races separate repository instances ingesting the
same canonical article from two sources. Both engagement keys survive along
with the original metrics, article identity, author, image and publication time.
The winning title and excerpt remain paired. Each source retains its own
observation, citation engagement and healthy status; repeating both concurrent
batches adds no duplicates and preserves citation first-seen times. Fixtures
use disposable PostgreSQL only, with no source or provider requests.

## River discovery batch recovery (iteration 262)

`social-candidates.test.ts` rejects the final source-health write after updating
an existing citation and inserting another. The complete citation and source-health snapshot
survives unchanged. A valid retry clears the source error, retains first-seen
times and exposes the new verification URL; repeat batches dedupe and preserve
verification URLs when omitted. Disposable PostgreSQL only; no source or provider
requests. Recorded-response golden and other repository gaps remain open.

## Topic post reader scope (iteration 263)

`social-candidates.test.ts` pins exact verified-post payloads and descending
publication order, external-ID tie ordering and null dates last. Multiple river
sources merge without duplicate posts; unverified citations and unrelated posts
stay excluded. Source reassignment changes topic scope immediately, disabled
topics remain readable, and source/topic deletion removes association without
requiring post deletion. Fixtures use disposable PostgreSQL only; no source,
Reddit or provider requests occur. Other discovery paths retain their existing
separate tests; recorded-response golden and other repository gaps remain open.

## Verification URL precedence (iteration 264)

`social-candidates.test.ts` pins newest non-null verification URLs across
publisher, river, stored Reddit and direct-search citations. Offset timestamps
compare by instant; newer null URLs cannot hide older usable evidence, and
missing/all-null citations return no URL. All fixtures use disposable PostgreSQL;
no source or provider requests occur. Equal-time tie selection remains unspecified.
Recorded-response golden and other repository gaps remain open.

## Verification candidate ordering and bounds (iteration 265)

`social-candidates.test.ts` pins citation breadth before freshness, equal-instant
numeric-ID ordering (length before lexical order), exact prefix limits and the
one-to-fifty request clamp. Fifty-five discoveries prove oversized requests stop
at fifty without disturbing priority. Transactional fixtures roll back in disposable
PostgreSQL; no embed, source, Reddit or provider HTTP requests occur.
Recorded-response golden and other repository gaps remain open.

## River source lifecycle (iteration 266)

`social-candidates.test.ts` pins discovery-source ID ordering and exact URL
payloads, enabled-topic filtering, re-enablement, source deletion and topic
cascade deletion. Repeated failures and unknown source IDs preserve successful
poll timestamps, link counts and sibling state; errors remain eligible for retry.
All fixtures roll back in disposable PostgreSQL; no external requests occur.

## Concurrent verified-post refresh (iteration 267)

`social-candidates.test.ts` races separate repository instances refreshing one
verified X post three times. Each outcome must contain a complete matching
author, author URL and embed payload, with exactly one row and the original
identity, canonical URL, engagement metrics and publication time retained.
Disposable PostgreSQL only; no embed, source, Reddit or provider requests occur.

## Concurrent search attribution (iteration 268)

`x-search.test.ts` races two repository instances saving the same two posts in
opposite order. Both calls retain their verification candidates and citation
counts, while the public daily report credits exactly one call with both new
candidates. Repeating both saves preserves the attribution and reports no
verified yield before verification. Disposable PostgreSQL only; no paid calls
or external requests occur.

## Search verification eligibility (iteration 269)

`x-search.test.ts` pins the ten-post verification limit, numeric-ID priority,
exact one-day retry exclusion and millisecond expiry in a non-UTC session.
Verified posts, recent checks (including null-error checks), disabled/zero-budget
and deleted topics stay excluded; re-enabling restores eligible candidates.
All assertions use repository methods in a rolled-back disposable PostgreSQL
transaction; no source, Reddit, embed or paid provider requests occur.

## Scheduled free-post coverage (iteration 270)

`topic-coverage.test.ts` now also characterizes the scheduled-search reader:
exact configuration payloads and tied-position ordering, inclusive start and
exclusive end publication boundaries in a non-UTC session, and exclusion of
undated and unverified posts. Reassigning a river moves free coverage even when
paid-search and stored Reddit evidence preserve Status coverage. Disabled,
zero-budget and deleted topics leave the search plan. Disposable PostgreSQL
only; no source, Reddit or paid provider requests occur.

## Bluesky refresh rollback and retry (iteration 554)

`bluesky-storage.test.ts` rejects a later fractional engagement count after a
batch has refreshed an existing verified post and inserted another. The prior
current metadata and both topics' immutable observation histories survive;
neither the new post nor the refreshed observation persists. A valid retry
updates metadata and adds exactly the expected observations; repeating it is
idempotent and leaves the other topic's history unchanged. Assertions exercise
the repository against disposable PostgreSQL, with no Bluesky or LLM requests.
Recorded-response golden and other repository behavior gaps remain open.

## Bluesky observation time boundaries (iteration 555)

`bluesky-storage.test.ts` pins inclusive publication start, exclusive end,
inclusive observation cutoff and one-millisecond neighbors. An offset timestamp
at the start represents the same instant as UTC. Shuffled writes preserve
publication-descending, external-ID and newest-observation ordering, including
multiple immutable snapshots of one post. Invalid dates in every window argument
and an empty window reject. Disposable PostgreSQL only; no provider requests.

## Bluesky snapshot capacity (iteration 556)

`bluesky-storage.test.ts` stores 5,001 immutable observations of one synthetic
post through the repository. Reads retain exactly the newest 5,000 snapshots,
ordered before limiting; the cap counts snapshots rather than distinct posts.
An earlier observation cutoff returns both eligible oldest snapshots, proving
filtering precedes the limit. The other topic receives none. Disposable
PostgreSQL only; no Bluesky or paid provider requests occur.

## Concurrent Bluesky collection (iteration 557)

`bluesky-storage.test.ts` races independent repository instances collecting
newer and older snapshots of one post for different topics, in both invocation
orders. Current metadata retains the entire newest payload; each topic keeps
only its own immutable history. Concurrent replays retain one current row and
no duplicate observations. Disposable PostgreSQL only; no provider requests.

## Bluesky configuration race (iteration 558)

`bluesky-storage.test.ts` holds a topic configuration lock, starts collection
through the repository and observes the collector blocked in PostgreSQL. Both
concurrent disable and deletion commit before collection resumes. Neither case
creates a current post or an immutable observation. This pins eligibility
rechecking after lock waits using disposable PostgreSQL, without provider calls.

## Bluesky equal-time conflicts (iteration 562)

`bluesky-storage.test.ts` pins first-write retention when conflicting observations
share a timestamp: current metadata stays intact, while each topic independently
retains its first immutable snapshot. Missing media normalizes to an empty array
in current metadata. A one-millisecond-newer observation adds history only to its
own topic. Disposable PostgreSQL only; no provider requests.

## Bluesky topic lifecycle (iteration 563)

`bluesky-storage.test.ts` pins disable/re-enable history retention, skipped writes
while disabled, and resumed collection. Deleting a topic removes its snapshots
without changing another topic's history or the shared current post. Recreating
the topic with the same identifier starts empty; collecting an older snapshot
cannot replace newer current metadata. Disposable PostgreSQL only; no provider
requests.

## Bluesky snapshot-write failure (iteration 564)

`bluesky-storage.test.ts` injects a snapshot-table constraint failure after the
current-post upsert. Current metadata and both topics' immutable histories remain
unchanged. Removing the constraint permits retry and idempotent replay, while the
other topic retains its original snapshot. Disposable PostgreSQL only; no provider
requests or production changes.

## Bluesky publisher transaction reads (iteration 565)

`bluesky-storage.test.ts` exercises the publisher-facing observation reader with
an explicit transaction client. Uncommitted topic disabling and snapshot deletion
are visible to that reader while independent repository reads retain committed
configuration and history. Rollback restores both reads. Disposable PostgreSQL
only; no provider requests or production changes.

## ORM schema parity (iteration 572)

`pnpm test:integration` includes a complete 25-table Drizzle parity test against
the fresh migrations. It builds a second empty database from generated DDL and
compares PostgreSQL catalog definitions for columns, defaults, constraints and
indexes with no differences. It never uses the live database.
The real strict/verbose drizzle-kit CLI also must report zero changes over fresh
migrations, with PostgreSQL-enforced read-only connection options. A pinned pnpm
patch preserves composite foreign-key column pairs and order during introspection;
see the Drizzle decision. Historical SQL runs first, followed by generated
Drizzle migrations in the same ledger. Offline generation compares the latest
snapshot with the schema; a new migration must leave both parity gates green.
