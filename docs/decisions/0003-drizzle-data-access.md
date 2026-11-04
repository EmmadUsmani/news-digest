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

**Drizzle-kit zero-diff gate remains open.** With 0.31.11, an isolated strict,
verbose CLI push using PostgreSQL-enforced read-only mode proposed six statements:
drop/recreate the composite foreign keys on `reddit_topic_posts`,
`bluesky_observations` and `reddit_x_citations`. The proposed definitions are
identical to the migrated definitions; introspection incorrectly reorders their
columns. The generated-DDL catalog comparison proves the mapping is correct.
Nothing was applied. The programmatic `pushSchema` helper also drops query
parameters during introspection, so it is unsuitable for this check. Resolve
these tooling issues before adopting generated migrations; do not change real
foreign keys to accommodate the faulty introspection.

Existing SQL migrations remain authoritative; no production schema change or
new migration is part of this mapping. Migration generation is not yet exposed
as an application command.
Before adopting drizzle-kit migrations, keep the complete schema parity test green on a freshly migrated
isolated container and define the historical migration baseline. Preserve historical SQL
migrations and take a private `pg_dump` backup before the first new migration.
Keep owner read-only/read-write grants intact. Convert remaining repositories
one at a time, retaining the unchanged 2a suite; enforce the final direct-pg ban
only once legacy adapters have been removed.
