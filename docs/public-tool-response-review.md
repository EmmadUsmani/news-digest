# Public tool response review — iteration 1716

Reviewed Nov 10, 2026 against main after the published-preview rollout.
Public mode remains off. This review completes the initial producer inventory;
it does not accept the tools or authorize public routing.

## Findings and required changes

| Surface            | Current producer and response                                                                                                                                                                                                                                        | Required before anonymous access                                                                                                                                                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Handbook `/docs`   | `apps/docs-site/src/server.ts` serves handbook tree, individual Markdown and all-page search; `/files/*` permits image extensions anywhere under `docs/`.                                                                                                            | Review the actual handbook/search corpus and referenced images; restrict image delivery to reviewed artifacts. Enumerate static/API GET routes; upstream currently refuses HEAD.                                                                                                            |
| Explorer `/db`     | `apps/schema-explorer/src/introspect.ts` reads catalogs, never application rows. `model.ts` emits table row estimates/bytes, defaults, comments, constraints and triggers, including account tables.                                                                 | Preserve the schema diagram while removing private account activity estimates/bytes and reviewing executable-definition strings/comments. Use a catalog-only role rather than the current default postgres connection. Enumerate assets and `/api/schema`; upstream currently refuses HEAD. |
| Grafana `/grafana` | Anonymous Viewer is configured. Product datasource uses `grafana_product`; metrics datasource proxies VictoriaMetrics.                                                                                                                                               | Replace unsafe product grants with audited projections, then review dashboard responses and both datasource query APIs. Viewer permissions alone do not sanitize data. Grafana uses read queries over POST, so GET-only prefix admission will not make dashboards work.                     |
| Jobs `/queues`     | `jobs-browser.ts` blocks mutations and enables Bull Board read-only mode. Installed Bull Board 9.11.0 still serializes job data, options, return values, failures, stack traces and worker identity. Separate handlers return job logs and Redis server information. | Provide explicit safe job projections and bounded endpoints, excluding raw payload/result/log/error/Redis handlers. Hiding write buttons or formatting only `data`/`returnValue` leaves other fields exposed.                                                                               |
| Logs/metrics       | `internal-tools.ts` streams upstream requests and responses, including arbitrary methods/subpaths.                                                                                                                                                                   | Admit only reviewed routes for authenticated admins; preserve upstream mutation-key protections. Do not make either prefix anonymous.                                                                                                                                                       |

## Grafana publication-boundary blocker

`ops/observability/grafana/sql/product-reader.sql` grants
`SELECT (id, created_at, snapshot) ON digest_previews` without a publication
predicate. It also grants `content_sources.last_error`. An anonymous datasource
query could therefore retrieve private development snapshots and persisted raw
errors even if every provisioned dashboard happened to avoid those columns.
Fix the role boundary itself with safe views/projections and revoke the old
column privileges; test arbitrary datasource-accessible SQL against unpublished
fixtures and injected errors. Audit the remaining explicit column grants and
metrics labels before admitting query routes. Keep private-mode operational
requirements visible when choosing the replacement datasource role/views.

Account migrations 0013–0018 explicitly revoke account-table access from PUBLIC
and named operational readers. `apps/api/test/accounts-schema.test.ts` exercises
hostile inherited default grants. These checks must remain green, including 0019
on isolated storage; live 0019 was applied after Phase 3 acceptance (1730).

## Shared transport boundary

`apps/api/src/main.ts` installs access control before tools and Bull Board.
Unlisted public-mode tool paths remain denied, including for admins. Keep that
safe default until each tool has its own reviewed method/path set. The proxy
currently forwards caller headers wholesale (including cookies and identity)
and copies upstream headers wholesale. Review credential forwarding, redirects,
cookies, cache headers and outer security-header preservation as part of the
same tool installation; a prefix grant is insufficient.

## Next implementation step

Start with the Grafana role/projection boundary, because raw snapshots would
bypass the published-only reader API. Prepare additive SQL and isolated tests
with public mode off; do not apply live migrations or change role grants until
their deployment gate is satisfied. Then compose the reviewed tools individually,
with complete browser request traces and private rollback coverage. Handbook,
explorer, jobs and admin-only logs/metrics remain unfinished acceptance work.

Evidence is source inspection of the producers named above, Grafana datasource
provisioning/configuration, account revocations/tests and the installed Bull Board
`dist/handlers/queues.js`, `jobLogs.js` and `redisStats.js`. No production job
payloads, account rows, log bodies or credentials were fetched for this review.

## Prepared public Grafana datasource boundary (iteration 1717)

`ops/observability/grafana/sql/public-product-reader.sql` is a standalone,
uninstalled candidate. It creates a separate `grafana_public_product` role and
three owner-executed security-barrier views in `grafana_public`:

- `published_editions`: UTC publication-day counts, excluding unpublished rows;
  no snapshots, profile IDs, run IDs or edition IDs.
- `published_content`: UTC publication-day topic/story/post totals; array lengths
  only, with no topic names, content text or identifiers. Missing or malformed
  arrays count as zero. Unpublished editions contribute nothing.
- `source_health`: source ID, enabled flag, collection timestamps/item count and
  an error boolean; no source names, URLs or persisted error bodies.

The role has SELECT only on those views, no raw application-table grants or
membership in the private datasource role. Isolated SQL coverage exercises
repeat installation, private/published snapshot markers, injected source errors,
account/session refusals and attempted writes/schema creation. This is not a
complete datasource approval: remaining dashboard aggregates, inherited PUBLIC
function/catalog access, metrics labels and query-route admission still need
review. Private dashboards continue using the existing operational role; never
route public queries to that datasource. No live role or datasource changes.

## Published content aggregate follow-up (iteration 1718)

The prepared daily content view replaces the count-only portion of the private
"Recent retained editions" panel. It does not expose editorial modes, reasons,
triage IDs or per-topic fields. Disposable coverage checks private topic markers,
story text, malformed arrays, empty days and exact output fields/counts.
Existing dashboard SQL must still be rewritten before using the public role:
latest-edition modes, selection coverage and social-platform panels read raw
snapshots; spend, ledger, X calls and reserve panels expose internal activity.
No existing panel is approved merely because its datasource is read-only.

## Prepared public overview dashboard (iteration 1719)

`ops/observability/grafana/prepared/public-overview.json` is outside the
installed dashboard directory. It uses only the separate
`public-product-postgres` datasource UID, which is not provisioned yet.
Its three table panels show the latest 30 publication days of edition/content
counts and current aggregate source health. The time picker does not filter
these tables; the description states their fixed scope.

Disposable PostgreSQL coverage executes every panel's exact SQL as
`grafana_public_product`, checking bounded results, publication counts and
private/error-marker exclusion. No raw snapshots, ledger, reserve, social
identifiers or metrics datasource are used. This is the candidate public
replacement for the operational dashboard set; the existing private dashboards
must never be copied into a public instance or exposed through its datasource.
Rendering and browser request traces remain unverified until an isolated
Grafana rehearsal. Datasource isolation, inherited function/catalog access,
metrics labels and query-route admission remain open before installation.

## Inherited privilege and catalog review (iteration 1721)

Disposable PostgreSQL coverage now checks that the prepared role has no elevated
role attributes, no other role memberships, and no executable application
SECURITY DEFINER functions. Attempts to read server files,
read password catalogs or execute a server program are denied. These checks run
alongside the exact dashboard queries after repeat SQL installation. A real
login-session rehearsal is still required for SET ROLE restrictions: the
superuser test connection retains its session identity after SET LOCAL ROLE.

**Same-database arbitrary SQL remains unapproved.** PostgreSQL catalog reads
still expose table comments and view definitions despite the table SELECT
boundary. The test deliberately adds a private comment marker on `users` and
reads it through `obj_description` as the public role; `pg_get_viewdef` also
reveals the underlying digest table. The marker is synthetic, transaction-local
and rolled back; this is not evidence of a leaked live comment or account row.
NOINHERIT and read-only defaults do not remove PUBLIC catalog/function access.

Before connecting a publicly queryable datasource, choose and rehearse either
a separate database containing only sanitized exports, or a server-enforced
fixed-query interface that cannot accept arbitrary SQL. Hiding the query editor
or using Viewer permissions is insufficient. Keep the current prepared SQL and
dashboard uninstalled. A separate Grafana instance still needs datasource,
query-route and browser response review; it alone does not isolate PostgreSQL.

## Separate export-instance rehearsal (iteration 1722)

Prepared `grafana/prepared/export-storage.sql` for a dedicated PostgreSQL
instance, rather than another database in the application cluster. It contains
only daily publication/content counts and one aggregate source-health row;
source IDs, activity timestamps, application catalogs and raw records are absent.
Disposable coverage uses a real reader login, runs the first two dashboard
queries and verifies source totals, denied role switching, catalogs containing
passwords, program execution, writes and schema creation. Resetting the read-only
default still leaves writes denied by grants. Installation is idempotent.

This is a storage-boundary rehearsal with synthetic counts, not a live export.
The exporter, writer credentials, network isolation, aggregate source panel
adaptation and isolated Grafana browser/query
rehearsal remain open. No new live service or datasource is installed. Assess
whole-stack capacity before adding an instance; public mode remains off.

## Prepared atomic export refresh (iteration 1731)

`grafana/prepared/refresh-export.ts` replaces all three aggregate tables in one
transaction, serializing concurrent refreshes with table locks. Each snapshot
contains at most 30 unique UTC days within today and the preceding 29 days;
replacement removes stale days. Counts must be nonnegative safe integers, with
errors ≤ enabled ≤ sources. Only explicit aggregate fields become SQL parameters.
Disposable tests cover repeat refresh, stale-row removal, duplicate/future/expired
and invalid-day refusal, and a database failure after deletes preserving the
previous content and source summary. No exporter, credentials, timer or live
connection is installed. Producer-side aggregation, least-privilege writer,
transport/timeouts, freshness reporting and capacity remain before deployment.

## Prepared export writer boundary (iteration 1732)

The separate-instance SQL now includes a non-owner writer login with only schema
usage and INSERT/DELETE on the aggregate tables and capture status. It can read
only capture status, with no aggregate reads, updates, truncation, schema creation
or role-switch privileges. Refresh runs as
this login in disposable tests, including rollback after partial replacement.
Role defaults bound statements to five seconds, lock waits to 500 ms and idle
transactions to ten seconds; connection limit is one. These defaults constrain
normal exporter work, not arbitrary SQL from a compromised credential.

A held table lock refuses refresh with PostgreSQL lock-timeout status, preserves
the prior snapshot and leaves the writer pool reusable. Credentials, connection
transport/TLS, producer aggregation, freshness reporting and provisioning remain
uninstalled. Reader and writer must connect only to the dedicated export
instance; this preparation does not grant access to the application database.

## Prepared aggregate producer (iteration 1733)

`grafana/prepared/produce-export.ts` reads published edition counts, topic/story/post
counts and aggregate source totals in one database statement. It returns only
explicit count fields and UTC dates for today and the preceding 29 days. Unpublished,
future-day and expired editions are excluded; malformed topic collections count as
empty. Disabled sources contribute to the total but not enabled/error counts.
The trusted application-side connection stays separate from the export writer and
Grafana reader. No producer is registered or scheduled, and no live grants change.
Disposable tests verify private-marker exclusion, published counts, empty/malformed
snapshots, future-day exclusion and retention boundaries. Transport/TLS, credentials,
freshness, capacity and Grafana query/rendering acceptance remain open.

## Prepared export freshness (iteration 1734)

The separate store now has one `export_status.captured_at` timestamp, committed
atomically with all counts. An empty status table means no successful export.
The trusted caller supplies the capture time before producing the snapshot and
must preserve it across retries; reads never advance it. Failed replacement or
lock timeout preserves the previous timestamp together with the previous counts.
The replacement lock also rejects older captures and same-capture retries, so
delayed deliveries cannot roll counts or freshness backward. The writer can read
only the capture status for this comparison.
Only this timestamp is exposed, with no identifiers or raw error text.

Disposable real-login checks cover initial absence, successful replacement,
rollback and recovery. This remains uninstalled. Freshness panels/alerts and
transport/TLS, capacity and provisioning checks remain before activation.
