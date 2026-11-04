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

`libs/db/schema.ts` currently maps only profiles and digest schedules. It is
**not** a complete migration schema. Do not run migration generation against
this partial schema: unrelated tables could be proposed for removal. Drizzle-kit
is installed for the forthcoming full-schema parity work, not yet configured.
Existing SQL migrations remain authoritative and unchanged. No new migration
or production schema change is part of this conversion.

Before adopting drizzle-kit migrations, map the entire migrated schema and prove
zero diff on a freshly migrated isolated container. Preserve historical SQL
migrations and take a private `pg_dump` backup before the first new migration.
Keep owner read-only/read-write grants intact. Convert remaining repositories
one at a time, retaining the unchanged 2a suite; enforce the final direct-pg ban
only once legacy adapters have been removed.
