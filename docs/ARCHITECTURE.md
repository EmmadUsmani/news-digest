# Architecture

The pnpm workspace contains a NestJS API serving a React/Vite SPA and shared
Zod contracts. Node 22 is required. The API binds to port 8000 on all interfaces;
PostgreSQL 17 and Redis 7 bind only to VM loopback through Docker Compose.
Volumes survive container replacement. PostgreSQL currently trusts loopback
connections: this is a single-owner VM, not a deployment for untrusted local users.

Data access is moving incrementally to Drizzle ORM over the existing `pg` pools.
Converted adapters cover profiles, Bluesky, Reddit, publisher-article discovery,
X-search, X verification/discovery, social selection/citation reads, operations source status, ingestion, edition costs, topic coverage, digest previews (with ORM-managed publication transactions), article candidates and reaction/incremental topic settings and budget-day schedule reads and reserve-status snapshot reads, incremental-triage admission, LLM usage reads (with ORM-managed repeatable-read snapshots) and ledger reservation/settlement/failure/cache operations (with ORM-managed admission/failure transactions), X discovery daily evidence reports and ledger ORM-managed transactions, scheduled admission, totals/reservation inserts and completion/failure writes, topics and scheduled budgets (including Drizzle-managed lifecycle transactions); other
adapters still use SQL. ORM imports stay inside database adapters and `libs/db`. See the
[decision and migration gate](decisions/0003-drizzle-data-access.md).
Explicit SQL migrations remain authoritative: `schema_migrations` records
applied filenames, and migrations run atomically under a transaction advisory
lock. Run `pnpm migrate` from the repository root before starting services.

Future contexts live under `apps/api/src/modules/<context>` with domain,
application use cases, repository ports/adapters and transport controllers.
Dependency-cruiser prevents domain imports of frameworks/I/O and imports of
another context's internals; cross-context public facades go in `public/`.
The operations BullMQ worker runs a local heartbeat every minute, retaining ten
successful/failed jobs. The separate ingestion queue polls persisted source
configuration every 30 minutes (first job immediately), with one worker, three
attempts and exponential retry backoff. Editorial selection remains M3; preliminary signal ranking is available.

`/healthz` checks actual database and Redis connections and returns 503 on
failure. Both processes use graceful shutdown and systemd automatic restart.
The default profile, four topics and schedule are persisted by migrations.
`GET /api/profile` and `GET /api/topics` expose read-only settings through
repository ports; editing remains M6. Topic configuration includes guidance,
source/query/account arrays, order, enablement and item budgets. Five live sources are seeded in migration 003. The SPA displays persisted
topics, budgets and five latest incoming articles per topic, explicitly labeled
as unreviewed incoming headlines. These incoming items remain separate from the preliminary ranked edition.

The schedule domain validates IANA timezones, daily local-time cron expressions,
ISO elapsed durations (days/hours/minutes/seconds), and 0–20 item budgets.
`coverageWindow` produces a concrete half-open `[start, end)` interval for any
provided end instant; P1D means 24 elapsed hours even across DST transitions.
Calendar months/years are rejected. Scheduling execution and broader cron support
remain M7; there is no claim that daily jobs run yet. Shared contracts publish
CommonJS for NestJS and an ES module build for Vite runtime validation.

Ingestion has source/HTTP/repository ports, RSS/Atom and official HN adapters,
and transactional PostgreSQL persistence. Canonical HTTP(S) URLs remove fragments
and common tracking parameters; a unique URL and unique source observation make
repeated collection idempotent while retaining cross-source associations.
Source health records last attempt/success, usable item count and sanitized errors.
`GET /api/content` and `/api/content/sources` are read-only views. The incoming
view omits `/betting/` URLs; comprehensive topical filtering/ranking remains M3/M5.
The shared worker HTTP client serializes each domain with a one-second floor,
caches for five minutes, applies Retry-After/error backoff, times out after 20s,
and limits each response to 2 MB. Feeds cap at 60 items and HN at 20 stories.
Only excerpts are stored; no article-page crawling or LLM calls occur.
Recorded feed/HN fixtures are offline-only. Integration tests create and clean
isolated fixture records; the explicit live smoke script queues two bounded
passes and checks item counts remain unchanged. Source schedules are refreshed
on worker startup; runtime configuration refresh and source-edit UI remain M6.

Iteration 10 adds the `digests` context and append-only `digest_previews` snapshots.
POST `/api/digest-previews` accepts ISO `windowStart`/`windowEnd`, a positive past
window up to 31 elapsed days; GET `/api/digest-previews/latest` returns the latest
snapshot or null. This single-owner API uses the seeded profile. A repeatable-read
transaction captures enabled topic names/budgets and up to 200 newest candidates
per topic, ranks them, and saves copied excerpts, URLs, publication times, source
names and signal reasons. Regeneration inserts a new UUID; a PostgreSQL trigger
rejects UPDATE/DELETE. Selection is synchronous and local, with no LLM/API spend.
The home button uses the last 24 hours; arbitrary-window controls and scheduled generation remain later work. No summaries, briefs or
editorial rationale are fabricated. `signals-v1` is explicitly preliminary.

Topic relevance (iteration 11): migration 005 adds data-driven phrase policies.
The domain evaluates headline/excerpt evidence without I/O; the preview adapter
loads policies in the same repeatable-read transaction as candidate content.
The topic API exposes these settings. Immutable signals-v2 snapshots preserve
the rules, filtering counts and matching reasons; contracts still accept
signals-v1 history. No LLM adapter or provider/model change is part of this step.

Iteration 13 adds signals-v3 quality omissions through a pure domain function.
The repository copies rejected item IDs/headlines/rules/reasons into each new
snapshot; contracts and UI still accept signals-v1/v2 history. Rejections occur
after topic eligibility, before ranking/budgeting, and are visible in expandable
home-page details. No migration is required for the JSON snapshot format.
These are lexical rules, not LLM review. No app provider/model is configured;
no provider was selected or changed and no LLM calls were made.

Iteration 15 exposes saved preliminary history through the repository port:
GET `/api/digest-previews?offset=0` returns 20 metadata entries and `hasMore`,
ordered by creation time then UUID descending. Offset is a bounded nonnegative
integer. GET `/api/digest-previews/:id` validates UUIDs and returns the seeded
profile's immutable snapshot (404 if missing). No database migration is needed.
Home's history browser loads full snapshots only on selection; `?edition=<uuid>`
reopens that version on reload. New editions and latest navigation update the
URL. Offset pages can shift if another edition is created while browsing;
immutable direct URLs remain stable. History is preliminary, not editorial output.

Iteration 16 adds browser coverage controls over the existing explicit-window
POST endpoint: 6h/24h/7d presets are elapsed durations ending at submission;
custom datetime-local inputs use the browser timezone and convert to UTC.
Client and server reject reversed, future and >31-day windows. Snapshots copy
the exact half-open UTC window and remain immutable; selection uses only
stored content, without fetching historical coverage. The UI states this limit.
Playwright checks the Los Angeles fall-back transition (16 wall-clock hours
become 17 elapsed hours), custom validation and saved-edition reloads.

Iteration 17 adds complete validated PUT `/api/topics/:id` settings for the
seeded profile through TopicRepository. Editable fields are name, description,
enabled, story/post budgets, include/exclude guidance and explicit phrase rules.
Unknown fields are rejected; IDs are UUID-validated and missing topics return 404. Source wiring, position, profile and discovery configuration cannot be
changed by this endpoint. Disabled topics are omitted from incoming cards and future editions. Since
iteration 21, collection continues only if an enabled topic connects that source. Existing snapshots are unchanged. Descriptive
guidance is stored, while current ranking uses explicit phrase policies only.
The Manage topics editor uses the shared schema and reports save errors inline.

Iteration 20 adds POST `/api/topics` using the same strict complete settings
contract as topic updates. The server supplies UUID, default profile, appended
zero-based position and empty sources/queries/accounts. Creation and reorder
serialize on the parent profile row, so concurrent creations get distinct
positions and a stale full-list reorder fails atomically. No migration needed.
The shared editor creates or edits topics; new source-less cards explain why
collection is empty. Creation does not discover feeds or modify saved editions.

Iteration 21 adds `topic_source_connections` (migration 008), a many-to-many
mapping seeded from the seven existing source assignments. GET `/api/topics/sources`
returns the existing catalog; PUT `/api/topics/:id/sources` replaces connections
through TopicRepository in a topic-row-locked transaction. Unknown/duplicate IDs
fail atomically; empty lists disconnect. Topic responses derive `sources` from
this mapping; the legacy topics.sources JSON and content_sources.topic_id are
retained for migration compatibility and are not used to select topic content.
Incoming articles and digest candidates join the mapping, reusing observations
without copying content or fetching an outlet twice. Historical snapshots do not
change. Collection runs only for sources connected to an enabled topic; the worker
refreshes schedules every minute to activate connections without a restart.
Source status still exposes its original seed topicId; multi-topic status UI is
unfinished. The settings UI refreshes incoming articles after saving connections.
Custom URLs, discovery queries and social accounts remain outside this catalog.

Iteration 22 adds strict PUT `/api/profile/schedule` via ProfileRepository. The
existing daily-cron/timezone/duration domain rules validate the configuration;
the API limits coverage to 31 elapsed days to match on-demand generation.
Schedule settings persist daily local time, IANA timezone, ISO elapsed window
and story/post defaults. Defaults prefill newly opened Create topic forms;
complete topic POST/PUT requests still supply explicit per-topic budgets.
Existing topics and immutable snapshots do not change. The schedule note now
shows actual saved coverage instead of hard-coded 24 hours. Automatic generation
is explicitly not connected yet; the worker still schedules ingestion only.

Iteration 23 connects the default profile schedule to a dedicated BullMQ
`digest-generation` queue in the existing worker. A 10-second refresh upserts a
stable per-profile scheduler using cron and IANA timezone. Jobs reject obsolete
cadence/timezone settings and use BullMQ's `prevMillis` scheduled timestamp as
the half-open coverage end; current saved elapsed coverage supplies the start.
It produces the same explicitly preliminary signals-v4 snapshots as manual
requests, with no LLM calls or notifications. No historical backfill is attempted.
Migration 009 adds a unique nullable scheduled key. A session advisory lock is
acquired before the repeatable-read transaction so concurrent retries see and
return the first committed snapshot. The snapshot and key commit together;
manual requests retain independent immutable versions. Lock release runs before
returning the connection to the pool. Queue retries are bounded to three attempts
with exponential backoff; the last 100 successes/failures retain edition IDs or
errors. Status UI, missed-run policy and publication events remain unfinished.

Iteration 24 exposes read-only GET /api/status through an OperationsReader port
and a Postgres/BullMQ adapter; no cross-context internals are imported. The home
page's expandable Source & run status panel refreshes once per minute (or on
request). Source freshness uses a one-hour threshold against the server's check
time, twice the normal collection interval; disconnected sources show paused.
Queue telemetry distinguishes unavailable Redis, no connected worker and paused
queues, and displays retained counts rather than lifetime totals. Up to 20
retained automatic jobs show state, attempts, slot/finish times and edition links;
the next scheduler slot is explicit. Job payloads, failure stacks and raw job
errors are omitted. Source errors retain the existing ingestion error messages.
The LLM status explicitly remains unimplemented; no usage totals/caps are
invented. Database failure returns an HTTP error; Redis failure degrades queue
telemetry. Old UI data is marked stale on refresh failure. This does not provide
persistent job auditing beyond BullMQ retention, missed-run recovery or worker
liveness beyond connected-worker telemetry.

Iteration 25 adds profile-scoped DELETE /api/topics/:id behind TopicRepository.
Deletion serializes with creation/reorder on the profile row and closes position
gaps in the same transaction. Topic connections cascade; shared sources,
observations, content items and immutable editions remain intact. Migration 010
makes the legacy content_sources.topic_id provenance nullable with ON DELETE
SET NULL; collection eligibility continues to use topic_source_connections.
The Source port reflects this nullable provenance. The API returns the remaining
ordered topics (404 for unknown/other-profile IDs, 400 for invalid UUIDs).
The settings UI requires a separate permanent-delete confirmation, offers
cancellation and disabling guidance, and preserves the confirmation after errors.
Deleting the final connection pauses future collection after scheduler refresh;
already queued jobs and historical content may remain.

Iteration 26 bounds missed-run recovery in the profile domain. BullMQ's retained
pending slot runs after worker downtime if it is at most six elapsed hours late;
its original slot still ends the coverage window and identifies retries. Runs
more than six hours late complete with an explicit skip reason and no new
snapshot. Future/invalid slot timestamps fail rather than publishing an edition.
The fixed six-hour grace avoids an old edition becoming the latest after a long
outage and bounds recovery to the existing pending slot; historical daily slots
are not synthesized or backfilled. Cadence/timezone changes still skip obsolete
jobs first. Skips appear in retained status history, and both status and schedule
settings explain manual custom-window recovery. This policy requires retained
Redis jobs; it does not recover jobs lost by clearing Redis. Queue retries remain
three attempts and scheduled snapshot keys remain idempotent. Smoke probes use
synthetic slot times against the real worker and real stored articles, remove
probe telemetry, and leave the resulting immutable real-content edition intact.

Iteration 27 adds POST `/api/topics/:id/feeds` with a strict name/URL contract.
Registration and connection are one profile-scoped transaction, serialized by a
catalog advisory lock; identical normalized feed URLs reuse the existing source
without changing its name. Catalog size is capped at 500 and topic connections
at 100. New sources have no legacy topic provenance. The minute worker refresh
schedules collection through the existing ingestion port; registration itself
makes no outbound request and does not assert that a feed is live.

The shared HTTP adapter accepts public HTTPS URLs only, without credentials or
custom ports. Every socket lookup rejects nonpublic IPv4/IPv6 answers and pins a
validated address; redirects repeat URL/DNS checks, domain serialization and
rate limiting, with a four-hop cap. Existing 20-second request timeouts, 2 MB
body caps, cache and Retry-After backoff remain. IP literals are checked before
requests, including Node URL normalization of alternate IPv4 notations.

Iteration 28 adds POST `/api/topics/:id/queries` with a strict 1–100 character
query contract (trimmed, no control characters). It builds a fixed English/US
Google News RSS URL with URLSearchParams and uses the same profile-scoped feed
registration transaction, catalog/connection caps and shared worker collection.
Queries are persisted as named catalog feeds, not a second scheduler or source
kind. Identical query URLs reuse collection across topics. Replace a query by
connecting the new one and disconnecting its old catalog entry; stored articles
and immutable editions remain unchanged. Social accounts remain pending.

Iteration 35 carries optional nullable `imageUrl` through ranked-story contracts
and immutable snapshots. Ranking accepts only credential-free HTTPS media from
the lead candidate; media does not affect scores or clustering. Historical JSON
without the field remains valid. The SPA uses lazy, asynchronous publisher-hosted
images, no-referrer requests, responsive uncropped sizing and a per-URL failure
fallback. No media proxy, download worker or snapshot backfill is introduced.

Iteration 52 adds the curation LLM/ledger ports, official Anthropic SDK adapter,
transactionally serialized reservations, validated JSON cache and usage facade.
Operations reads usage only through `curation/public`; SQL remains in curation's
database adapters. Status displays recorded real call costs and caps. Published
editions used signals-v6 at that point; iteration 55 connects publication below.
See [LLM.md](LLM.md) for budgets, conservative failure handling, configuration,
isolated database checks and the remaining pipeline work.

Iteration 55 connects both manual and scheduled repository generation through
`curation/public/editorial`, retaining the inward context boundary. Immutable
`editorial-v1` snapshots contain per-topic triage evidence, editor model/brief,
source-linked summaries and significance, or an explicit non-AI fallback reason.
Complete semantic triage can recover lexical inclusion misses; explicit exclusions
and quality filters remain hard rules. See LLM.md for thresholds, shortlist bounds
and unfinished Sonnet allocation/batch execution. Generation currently holds its
repeatable-read snapshot connection during capped external calls, plus the existing
scheduled-key advisory lock for idempotence. Moving long runs to resumable queued
stages and coalescing concurrent cache misses remain follow-ups.
