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
check upserts. Candidate CTEs, joins, host-backoff subquery, filters and grouped ordering use
typed builders; window ranks, aggregate minima and interval/host expressions
remain SQL expressions to preserve publisher/topic fairness and host backoff.
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
new production migration is part of this mapping. Offline generation uses the
committed baseline described below.
Before adopting generated migration execution, keep the complete schema parity
test green on a freshly migrated isolated container. Preserve historical SQL
migrations and take a private `pg_dump` backup before the first new migration.
Keep owner read-only/read-write grants intact. Convert remaining repositories
one at a time, retaining the unchanged 2a suite; ESLint now bans runtime `pg` imports and direct `.query()` calls outside
`libs/db`, while allowing connection type imports. Health and console startup
use a shared Drizzle connectivity probe. The interactive owner console retains
its explicitly requested `db.query` binding; migrations retain driver access
inside `libs/db`.

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

The digest preview repository uses typed Drizzle reads and snapshot inserts,
with a Drizzle-managed repeatable-read publication transaction on the checked-out
client. Session advisory locks still precede the snapshot, preserving scheduled
retry visibility and publication dedupe; unlock and client release follow commit
or rollback. Session lock commands use SQL templates because the query builder
has no advisory-lock operation; JSON method extraction uses PostgreSQL's JSON
operator. Original PostgreSQL error causes remain exposed. Existing publication,
history, golden and failure characterization assertions remain unchanged; the
logging stub normalizes transaction-command casing.

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

Reaction-story and incremental-triage topic settings now use a shared database
adapter with typed Drizzle projections and independent post/story budget filters.
The public facades retain validation and ranking, and reuse the caller connection
so transaction-local topic changes remain visible.

The budget-day schedule reader uses a typed Drizzle projection inside the caller's
admission transaction, retaining `FOR SHARE` to block concurrent schedule edits.
The public facade still resolves UTC-day occurrences and reports missing schedules.

Reserve-status snapshot reads use typed Drizzle day-state and latest-completed
outcome projections. The usage database adapter retains the repeatable-read
transaction and ledger advisory lock, passing its client to every reader. The
PostgreSQL wall clock uses a documented SQL template; reserve policy is unchanged.

LLM ledger settlement, failure and cache operations use typed Drizzle updates,
inserts and projections. Failure handling retains the existing client transaction
and shared advisory lock; pending-only transitions, UTC provider blocks and
first-writer cache semantics remain unchanged. Reservation admission now uses typed
projections and inserts under the same client transaction and lock. Conditional
sums use SQL templates for CASE expressions, preserving earlier pending/uncertain
reservations, verification/model limits and scheduled reserve admission.

X discovery ledger verification completion, settlement and failure writes use typed
Drizzle updates and provider-block inserts. The existing shared advisory lock and
client transaction remain; terminal-state guards, uncertain settlement, persisted
hold comparisons and first verification timestamps are unchanged. Usage totals now use typed Drizzle projections with documented PostgreSQL
FILTER/UTC wall-clock templates, retaining older pending/uncertain holds and
provider blocks. Reservation inserts use the same transaction client; scheduled
optional-search admission now uses typed correlated subqueries for consumed attempts,
completed parent verification, low incremental yield and all-topic coverage. A SQL
template projects their combined predicate without a FROM clause and compares the
UTC database wall clock; JSON topic-id expressions preserve existing semantics.

Scheduled-budget lifecycle writes now use Drizzle-managed transactions on the
checked-out client. The shared Anthropic advisory lock stays inside the
transaction; lifecycle logs follow commit, and failures roll back before client
release. Constraint errors retain their underlying PostgreSQL identity. The
isolated nested-fixture harness accepts both driver query forms and transaction
keyword casing; characterization assertions remain unchanged.

X discovery ledger transaction control now uses Drizzle on the checked-out
client. Its transaction-scoped advisory lock remains shared by API, worker and
explicit discovery; every ledger query uses that same client. Drizzle commits or
rolls back before client release, and wrapped query errors expose their original
PostgreSQL cause. Existing ledger characterization assertions remain unchanged.

Anthropic LLM ledger admission and failure now use Drizzle-managed transactions
on the checked-out client, retaining the shared advisory lock and all budget
reads/writes on that client. Admission decisions are logged only after a successful
commit; refusals commit without inserting a call. Rollback releases the client,
and wrapped driver errors retain their original PostgreSQL cause. Existing
budget, rollback and logging characterization assertions are preserved.

The usage snapshot now lives in a database adapter with a Drizzle-managed
repeatable-read transaction. The public facade delegates without ORM imports.
Every reader uses the checked-out client under the same Anthropic advisory
lock; rollback, client release and original PostgreSQL errors are preserved.

X discovery daily evidence uses typed builders for the curated-handle and
verified-post CTEs, call projection, UTC-day bounds and ordering. The per-topic
JSON aggregate retains lateral expansion, correlated edition membership and
filtered counts as a documented SQL expression. Correlated outer columns are
explicitly qualified because single-table Drizzle projections otherwise strip
qualifiers and permit inner columns to shadow them. The caller's pool or
checked-out client is reused, native PostgreSQL errors are preserved, and
existing report characterization assertions remain unchanged.

## Historical migration baseline

`drizzle/meta/0000_snapshot.json` records the complete schema after historical
SQL migrations 001–055, including `schema_migrations`. The accompanying baseline
SQL is deliberately a no-op: the historical migrations remain required for both
schema creation and seed data. Do not use this baseline to initialize a database
with the Drizzle migrator alone.

Generate future schema diffs offline with
`pnpm --filter @digest/api exec drizzle-kit generate --name <change>`.
The isolated gate compares the committed snapshot with the current schema and
runs the real generate CLI in a temporary copy, requiring no new migration.
Together with catalog parity and the read-only push gate, this proves the
baseline describes the historical migrated database. When introducing a schema
change, advance the snapshot assertion to its latest generated snapshot.

`pnpm migrate` applies historical SQL first, then generated SQL in journal order,
inside the same transaction and advisory lock. The existing ledger records generated
filenames with a `drizzle/` prefix. Repeat runs skip applied entries; any failure
rolls back all SQL and ledger writes from that run. The baseline executes only
`SELECT 1`; no new schema or data migration is introduced. Before the first new
migration, take a private `pg_dump` backup and preserve the owner login grants.
Use this runner rather than the standalone Drizzle migrator; it preserves historical
seed migrations and avoids a second migration ledger.

The content repository's per-topic latest-items read uses a correlated Drizzle
query builder for joins, betting exclusion, item deduplication, source-name
aggregation, ordering and the five-item limit. A small SQL expression wraps the
query in PostgreSQL JSON aggregation, preserving empty topics and timestamp
serialization. Existing repository and HTTP characterization assertions remain
unchanged.

The social repository's embed-verification candidate selection now uses typed
Drizzle CTEs, unions, joins and grouping. SQL expressions remain for PostgreSQL
window ranking, aggregate ordering, provenance labels and the one-day cooldown.
The same topic-fair order prioritizes unverified discoveries before refreshes,
retains all four citation channels and clamps the requested limit to 1–50.
Existing repository characterization assertions remain unchanged.
