# Explorer database credentials

The live service uses `schema_catalog_reader`, a catalog-only PostgreSQL login.
Its URL is stored only in `~/.config/news-digest/env` as
`SCHEMA_EXPLORER_DATABASE_URL`. The service drop-in loads that file. Startup refuses a missing or blank URL;
there is no default database connection.

- Prepare the role with `prepared/catalog-reader.sql`; this deliberately leaves
  it NOLOGIN. Stage a unique password privately before enabling LOGIN.
- Prepend `prepared/catalog-reader.pg_hba.conf` to the active PostgreSQL
  authentication file; preserve its ownership/mode and keep the original.
  Validate `pg_hba_file_rules`, reload and check unrelated service connections.
- Where the query-statistics extension is installed, apply
  `prepared/query-stats-access.sql`. It removes extension-view PUBLIC SELECT
  after preserving existing named roles' effective SELECT. Future roles need
  explicit grants. Keep an exact ACL rollback before applying it.
- Run `node --env-file=$HOME/.config/news-digest/env apps/schema-explorer/src/check-credentials.ts`.
  Install `catalog-credentials.conf` under
  `~/.config/systemd/user/news-digest-schema.service.d/` only after it passes.
- Reload systemd and restart `news-digest-schema.service`. Verify `/healthz`,
  the loopback schema response and the pool's `schema_catalog_reader` identity.

For credential rollback, remove the drop-in, reload systemd and restart the
explorer to close its pools. Without credentials it remains stopped; restore a
reviewed credential URL before bringing it back. Disable the role with NOLOGIN and remove its secret
from the environment file. NOLOGIN alone does not disconnect existing sessions.
Restore the preserved authentication file with ownership/mode intact, reload
and validate its parsed rules. Restore extension ACLs from the private snapshot
if reverting that change too. Recheck application and observability health.

The live service also installs `structural-only.conf`: responses contain only
groups, tables, columns, keys and relationships. Definitions, activity, sizes
and metadata prose are omitted. Public mode remains separate and off.

`pnpm exec tsx scripts/check-live-schema-structural.ts --live` verifies the
private/structural/private/structural rollout, exact projection, private admission
and desktop/mobile views. Run outside the 13:00–16:00 UTC deployment hold.
Failure restores the initial drop-in. For response-only rollback, remove
`structural-only.conf`, reload systemd and restart the explorer; retain the
catalog credentials drop-in.
