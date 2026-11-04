# Drizzle for incremental data access conversion

Use Drizzle ORM with the existing node-postgres pools. Its typed query builder
fits the repository adapters without generated clients or changes to domain
ports. Keeping pool construction in `libs/db` preserves test isolation and
slow-query observation. Drizzle imports are restricted by ESLint and
dependency-cruiser to `database/` adapters and `libs/db`.

The first converted adapter is profiles: join the default profile and schedule,
and replace the complete schedule with the same missing-row errors and database
constraints. The existing repository and HTTP characterization suite remains
unchanged. Rows are mapped explicitly to the existing domain contract.

The Bluesky adapter also uses the query builder for collection and edition reads.
Its transaction retains the topic share lock, conditional latest-observation
upsert and append-only snapshots; reads retain the publisher transaction,
exclusive window end, inclusive observation cutoff and stable ordering. Existing
Bluesky characterization tests remain unchanged.

The scheduled-budget adapter uses typed reads and compare-and-swap writes. It
retains the shared Anthropic advisory lock, transaction rollback and client
release, first-registration identity, recovery attempt fencing and publication
snapshot reconciliation. Its mapper preserves Date timestamps and JSON outcomes;
database failures retain the original PostgreSQL error after rollback. Existing
scheduled-budget characterization tests remain unchanged.

The Reddit adapter uses typed transactional upserts, citation replacement and
configuration-checked topic associations. Edition reads retain the publisher's
transaction, seven-day lookback, exclusive end and deterministic ordering.
PostgreSQL JSON set expansion and ordered distinct aggregation use typed SQL
expressions. Existing Reddit characterization tests remain unchanged; collection
stays parked under the owner's access restrictions.

The publisher-article X discovery adapter uses typed transactional citation and
check upserts. Its two window rankings and grouped minimum ordering remain a
Drizzle SQL template to preserve publisher/topic fairness and host backoff.
Writes recheck enabled source connections, preserve citation metadata on conflict
and roll back the check together with citations. Existing characterization tests
remain unchanged.

The X-search adapter uses typed CTE/union and correlated counts for scheduled
coverage, completed-search evidence and verification candidates. Citation writes
retain the shared first-attribution advisory lock, conflict-ignore behavior,
JSON engagement reports and atomic rollback with original PostgreSQL errors.
Existing X-search characterization tests remain unchanged.

`libs/db/schema.ts` maps all 25 public tables, including the historical migration
ledger, from migrations 001–055. The isolated `schema-parity` test creates an
empty comparison database from Drizzle's generated DDL, compares PostgreSQL's
normalized columns, defaults, constraints and indexes with the migrated database
and requires no differences. The comparison database is dropped afterward. This also
catches checks, composite foreign keys and operator-class differences that the
push planner alone can miss.

The initial introspection needed corrections for an empty-string default, a
boolean check expression, composite foreign-key column ordering, regex escaping
and multi-column index operator classes. Do not treat future generated mappings
as verified until the catalog comparison passes.

**Drizzle-kit zero-diff gate passes with a pinned pnpm patch (iteration 573).**
Version 0.31.11 joined source and target FK columns independently with `ANY`,
creating a Cartesian product and losing composite-key order. The patch unnests
`conkey` and `confkey` together with ordinality and orders by constraint/position,
preserving each source/target pair. It covers the CLI and both API module builds.
Remove the patch only when an upstream version passes the same regression.

The isolated suite also runs the real strict/verbose CLI push planner against
fresh migrations with PostgreSQL-enforced read-only connection options. It must
report "No changes detected" and propose no table DDL. The independent generated-DDL
catalog comparison remains required because the planner ignores some differences.
The programmatic `pushSchema` helper still drops query parameters during
introspection, so use the CLI for this gate; no programmatic workaround is applied.

Existing SQL migrations remain authoritative; no production schema change or
new migration is part of this mapping. Migration generation is not yet exposed
as an application command.
Before adopting drizzle-kit migrations, keep the complete schema parity test green on a freshly migrated
isolated container and define the historical migration baseline. Preserve historical SQL
migrations and take a private `pg_dump` backup before the first new migration.
Keep owner read-only/read-write grants intact. Convert remaining repositories
one at a time, retaining the unchanged 2a suite; enforce the final direct-pg ban
only once legacy adapters have been removed.

The ingestion adapter uses typed transactional upserts for items, observations
and X citations, plus typed source eligibility and health reads. Its nested
per-topic top-five JSON aggregation uses a documented Drizzle SQL template to
preserve PostgreSQL JSON timestamp representation and grouping semantics.
Existing ingestion characterization tests remain unchanged.

The edition-cost reader uses typed Drizzle grouped aggregates for run-attributed
spend and full-AI measurements. JSON snapshot completeness remains a documented
SQL predicate; the caller’s transaction client is preserved for budget locking.
Existing edition-cost and scheduled-budget characterization tests are unchanged.

The topic-coverage reader uses typed Drizzle unions and correlated aggregates.
Distinct discovery routes, source-health bounds and elapsed 24-hour windows
retain their existing characterization tests, including non-UTC and DST cases.

The digest preview repository uses typed Drizzle reads and snapshot inserts.
Session advisory locks still precede the repeatable-read transaction, preserving
scheduled retry visibility and publication dedupe. Transaction-control and lock
commands use SQL templates because they operate on the existing session; JSON
method extraction uses PostgreSQL's JSON operator. Article/social candidate
loaders remain separate conversion work. Existing publication, history, golden
and failure characterization tests remain unchanged.

The shared article-candidate loader uses typed joins, window filters, grouping
and limits for publication, reaction discovery and incremental triage. Its
ordered distinct source-name array retains a PostgreSQL aggregate template.

The incremental-triage admission adapter binds Drizzle to its checked-out client.
Session advisory lock functions retain SQL templates because no query builder
represents them. Contention, idempotent release, provider-work error listening
and destroying failed sessions preserve the existing characterization behavior.

The LLM usage reader uses typed Drizzle filters, grouping and ordering. Filtered
PostgreSQL sums retain documented templates. All unresolved holds continue to
count across budget periods, and reads accept the caller's transaction client.

The topic repository uses typed Drizzle CRUD, connections and transactions.
Parent/topic row locks and the catalog advisory lock preserve concurrent writes;
ordered source aggregation, window ranking and bulk ordinality retain documented
SQL templates. Existing limits, JSON settings and deletion ordering are preserved.

The X verification/discovery repository uses typed Drizzle reads, upserts and
transactions. Its citation-union/window-ranking candidate query retains a
documented SQL template to preserve topic fairness and refresh priority.
Topic post timestamps map back to Dates; missing-time updates remain conditional,
and citation failures roll back with native PostgreSQL errors.

The operations source-status reader uses typed Drizzle joins, counts and a
correlated enabled-topic existence check. It preserves empty sources, source
ordering, observation counts and UTC timestamps without counting topic links
as additional observations. Queue telemetry remains unchanged.

Social selection and citing-story reads use a database adapter with typed Drizzle
filters, correlated citation existence, a scalar engagement subquery and distinct
story links. The JSON observation-time cast retains a documented SQL expression.
The publisher client, half-open window, observation cutoff/tie ordering and
500-candidate limit are preserved; selection and ranking rules are unchanged.
