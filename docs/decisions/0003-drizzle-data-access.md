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
