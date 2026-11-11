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

## Prepared loopback export runner (iteration 1737)

`apps/api/scripts/export-grafana.ts --run-once` is an uninstalled one-shot
producer-to-writer path. It requires explicit `GRAFANA_EXPORT_SOURCE_*` and
`GRAFANA_EXPORT_TARGET_*` HOST, PORT, DATABASE, USER and PASSWORD values from
the service environment; no credential file is committed or automatically read.
Both hosts must be literal `127.0.0.1`, with distinct ports. Remote transport
is refused; this local-only path uses no TLS. Installation must independently
verify the ports reach separate PostgreSQL instances and require password auth.
The target login must be `grafana_export_writer`; source sessions start read-only.
Each pool has one connection, three-second connection and five-second statement
limits. Both pools close after success or failure; CLI failures print no driver
details. A failed producer leaves the last committed export intact.
Disposable SCRAM-authenticated containers cover the complete path, including wrong-password capture preservation and producer grant-level write denial (1738–1739). Installation, freshness alerts and capacity gates remain open.

## Prepared export listener (iteration 1740)

`grafana/prepared/compose.yaml` defines a separate, uninstalled Postgres 17
service. It publishes only `127.0.0.1:5543`, joins its own dedicated Docker bridge
network, requires an explicit owner password and uses SCRAM host authentication.
Its separate volume holds aggregate data only; it never mounts application data.
Ten connections, 16 MiB shared buffers, 128 MiB memory and 0.1 CPU are provisional
limits pending the whole-stack capacity gate. Do not merge this file into the
application compose project or attach application services to its network.

The disposable listener rehearsal resolves this exact Compose definition, swaps
only persistent storage for tmpfs, restart policy for no restart and the host
port for an ephemeral port. It checks Docker bindings/network isolation, a real
loopback SQL connection and refusal through every VM non-loopback IPv4 address.
The bridge allows outbound networking; only the host listener is restricted to loopback. An initial internal-network trial suppressed Docker port publication and was replaced with this dedicated bridge. Live installation and firewall review remain.

## Prepared export freshness alert (iteration 1742)

`grafana/prepared/export-freshness-alert.json` is an uninstalled Grafana
provisioning group for the dedicated `public-product-postgres` datasource.
Its restricted-reader SQL always returns one numeric value: healthy captures
are at most 15 minutes old and not in the future. Missing/stale/future captures
return unhealthy; query errors and no-data use Grafana's Alerting state.
Evaluation is once per minute with a five-minute pending period. No contact
point or external notification is configured.

Disposable real-login checks execute the exact provisioned SQL for empty,
future, current, fresh, nearly stale and stale captures, including recovery.
`pnpm exec tsx apps/api/scripts/check-grafana-export-alert.ts` rehearses the
installed Grafana binary in a separate loopback process with temporary SQLite,
provisioning, plugins and a disposable Postgres. It provisions the exact rule
and a restricted-reader datasource, reads back the rule, and evaluates its SQL
and threshold through Grafana for missing/future/fresh/stale captures and recovery.
Synthetic credentials and data only; SMTP is disabled. Scheduled execution is
enabled only with the explicit `--scheduled` option.
The process, container and temporary files are removed on completion.

Iteration 1743 passes provisioning and query/expression evaluation. The optional
scheduled rehearsal (1753) keeps the exact one-minute evaluation interval and
five-minute pending duration: removing the capture reaches pending then firing,
restoring a fresh capture clears it, revoking the reader table grant fires with
query-error health, and restoring the grant clears it again.
Public query-route acceptance remains unverified. This file stays outside
installed provisioning; capacity and datasource installation remain open.

## Fixed-port and capacity rehearsal (iteration 1758)

Ran `docker compose -p news-digest-export-capacity-1758 -f ops/observability/grafana/prepared/compose.yaml up -d --wait`
on the live VM with a synthetic password and the intended `127.0.0.1:5543`. Docker reported one loopback binding, one
dedicated bridge with only the export container attached, and one private
export volume. PostgreSQL accepted authenticated loopback SQL, rejected the
wrong password (28P01), and the four non-loopback IPv4 probes could not connect.
Applied only the prepared export schema, inserted 30 synthetic daily rollups
as the restricted writer, and counted them as the restricted reader.

| Capacity measure                                                     |                         Result |
| -------------------------------------------------------------------- | -----------------------------: |
| Eight observability units alone: 60-second sampled peak and mean CPU | 702.47 MiB / 2.06% of one core |
| Existing stack: last 24 hours, stored peak and peak five-minute CPU  | 771.25 MiB / 2.19% of one core |
| Export container: cgroup lifetime peak, including initialization     |                      72.57 MiB |
| Stack plus export: 120-second sampled peak and mean CPU              | 763.57 MiB / 2.64% of one core |
| Fresh export data volume                                             |                         47 MiB |

Baseline: `pnpm exec tsx scripts/sample-observability-capacity.ts 12 5`.
For the combined sample, read `memory.current`, `cpu.stat` and `memory.events`
every five seconds from the same eight system cgroups and the Docker
container cgroup. Export alone peaked at 64.55 MiB and averaged 0.83% CPU
in that sample, with no OOM kills. The 24-hour comparison uses the [stored resource queries](decisions/0004-observability-capacity.md#reproduce)
with 2,880 samples per unit. This was a quiet window; initialization,
compaction and dashboard traffic were not measured concurrently. Adding the
export lifetime peak to the existing 24-hour peak projects **843.82 MiB**
against the approximate 800 MiB target. These peaks were observed at
different times. Keep installation gated on measured headroom during
startup and representative load, without lowering the working Grafana limits.

`docker compose down --volumes` removed the rehearsal container, volume and
bridge; port 5543 is free again. No application data, scheduled exporter,
persistent listener or datasource was used.

## Paired startup and read rehearsal (iteration 1759)

Compared two adjacent 75-second windows on the live VM, first with the eight
existing observability units and then with the same units plus a fresh export
Compose project. Sampled cgroup memory every 250 ms, beginning before Compose
startup. Every 15 seconds both windows read Grafana health, the live latest
edition and two uncached one-hour VictoriaMetrics range queries (aggregate
memory and five-minute CPU rates, 30-second steps). Once the prepared schema
and 30 synthetic daily rollups were loaded, the candidate also ran all four
prepared panel queries as the restricted reader and checked their row counts.

The metrics reads cover dashboard query work, and the panel reads cover export
SQL. This did not drive a browser dashboard, induce VictoriaMetrics compaction
or cold-start the installed Grafana service. The earlier authenticated
loopback transport check remains separate.

| 75-second window           | Startup or baseline peak | Ready peak | Mean CPU (one core) | Slowest read batch |
| -------------------------- | -----------------------: | ---------: | ------------------: | -----------------: |
| Existing stack             |               704.59 MiB |          — |               2.19% |             463 ms |
| Existing stack plus export |               772.36 MiB | 769.04 MiB |               4.85% |             370 ms |

The export cgroup peaked at 70.50 MiB and schema/seed setup took 18.41 s.
All five read batches passed in each window, including 12 panel SQL checks
across three candidate batches. No cgroup OOM kills were recorded.
`docker compose down --volumes` removed the project, volume and bridge.

This sample meets the ~800 MiB and <5% CPU targets, with only ~28 MiB of
observed startup headroom. The earlier 24-hour peak projection is still
~844 MiB. Keep installation pending until a paired sample covers scheduled
edition load or natural compaction and confirms sustained five-minute CPU
headroom. The short mean includes fresh database initialization.

### Prepared public queue status (iteration 1760)

The separate queue status handler exposes one exact GET/HEAD endpoint for the
four known queues. It returns only five state counts per queue and the earliest
scheduler time (epoch milliseconds, or null). It reads at most one scheduler
per queue. It does not expose scheduler IDs or templates, individual jobs,
logs, worker identities or Redis details. Backend failures return a fixed 503;
unknown routes end at 404, and mutations on the status endpoint return 405.
Responses are not cached.

### Exclusive queue routing and admission (iteration 1761)

Public mode mounts only `GET /api/queues` and its HEAD counterpart, behind
the shared API admission and public route policy. POST and legacy Bull Board
routes return 404. The compiled app rehearsal uses disposable Redis queues:
anonymous requests get the bounded projection, both anonymous and signed-in
admin requests are denied legacy routes, and queue requests share the reader
and account API allowance. Requests without a trusted visitor and requests
over quota return 429. With the live public flag off, the private jobs browser
remains the sole queue tool.

### Handbook response inventory (iteration 1762)

The handbook server accepts GET for the shell, three named assets, health,
tree, search and exact page keys from the tree. Removed the broad docs image
route: the current 18-page corpus has no image references. Direct reads and
search now share the tree inventory. Isolated HTTP checks compared all 18
page bodies and refused docs screenshots, path aliases and unsupported
methods. [Playwright navigation](screenshots/handbook-navigation-1762.png)
verified the home page, search and opening the Observability result.

Keep the handbook private. Its current corpus describes operational details,
including backup storage and private tooling. Public routing still needs a
reviewed publication corpus and a proxy rehearsal.

## Reader handbook candidate (iteration 1763)

The reviewed public corpus is one [reader handbook page](../apps/docs-site/reader/index.html):
reading and revisiting editions, hiding topics, bookmarks and sync, and how AI
helps summarize coverage. It links back to News Digest and needs no scripts or
third-party assets. The existing operational handbook stays private.

Run `node apps/docs-site/src/reader-server.ts` for a standalone loopback rehearsal.
It responds only to GET/HEAD on `/` and `/style.css`; the response inventory
does not read the owner handbook or expose its search corpus. Isolated HTTP checks
verified those two routes and refusals for old Markdown, search, image and asset
paths. Playwright verified desktop light and mobile dark layouts, the return link
target, and no third-party requests. See the
[mobile screenshot](screenshots/reader-handbook-mobile.png).

### Reader handbook proxy rehearsal (iteration 1764)

Public mode selects a separate loopback upstream for the reader handbook. Only
GET/HEAD on `/docs`, `/docs/` and `/docs/style.css` are admitted, without query
strings. The bare path redirects to `/docs/`. The proxy forwards no caller
headers or body, serves responses with no-store and a policy that allows only
same-origin styles, and fails with 502 if the reader upstream is down or answers without its
service marker.
Private mode restores the owner handbook behind its existing access check.

Isolated HTTP checks covered both modes, forged credentials, blocked legacy
routes, headers and an unavailable upstream. Desktop and mobile Playwright
checks followed the redirect and loaded only the page and stylesheet. The
reader service is installed on loopback port 8110 (1781); public mode remains off. Include the boundary in the lead's review.

## Explorer response projection candidate (iteration 1765)

`apps/schema-explorer/src/public-model.ts` prepares a separate structural DTO:
all tables (including account tables), columns/types/nullability/key flags,
primary/unique keys, group labels and foreign/implicit relation endpoints with
delete actions. Objects and arrays are constructed explicitly; new private-model
fields are excluded by default. Activity estimates, storage sizes, generation
timestamps, defaults, catalog comments, executable definitions, index/trigger
names, metadata prose and warnings are absent.

Hostile synthetic catalog coverage retains account relationships while excluding
injected comments/defaults/checks/indexes/triggers and future private fields.
Mutation checks confirm the candidate cannot alter the private explorer model.
This is an uninstalled response boundary, not public explorer acceptance. The
UI now accepts both structural and private responses (iteration 1768). Catalog-only credentials, reviewed group/type/
identifier vocabulary, exact asset/API routes, HTTP/browser traces and private
rollback remain required. Public mode stays off; no live grants or routes change.

## Explorer catalog-role rehearsal (iteration 1766)

`ops/schema-explorer/prepared/catalog-reader.sql` prepares an idempotent,
non-login, non-inheriting role without application table/sequence grants or
explicit schema usage grants. Existing PUBLIC schema privileges remain. It has no superuser, role/database creation, replication or RLS
bypass privileges. Read-only and statement-timeout defaults provide additional
limits. No live role or service credential is installed by this file.

The disposable migrated-database test runs the explorer's actual introspection
and structural projection under this role. It checks schema relationships,
application-row and password-catalog refusal, role-switch refusal and absence
of memberships/table grants. PostgreSQL still exposes comments through catalog
reads: the test demonstrates this and requires their removal by the projection.
The role must only back fixed catalog queries. Credential installation, structural UI and exact HTTP/browser/rollback checks
remain before acceptance; public mode stays off.

## Explorer inherited-function review (iteration 1767)

The disposable migrated-database rehearsal now checks all non-system schemas
for executable SECURITY DEFINER functions and all persistent schemas for CREATE
access under the catalog role. Both inventories must be empty. Actual server
file reads, directory listing, server-program execution, table creation and
SECURITY DEFINER function creation must fail, alongside row reads and role
switching. Session authorization is the catalog role, rather than a superuser
session using SET ROLE. The test transaction rolls every change back.

These checks pin the current migrations and PUBLIC grants; they do not make
arbitrary SQL safe. Fixed introspection queries and structural projection remain
required because catalogs expose comments and definitions. No live credentials,
grants or routes changed. Credential installation and UI/HTTP/rollback rehearsal
remain open before activation.

## Explorer structural UI rehearsal (iteration 1768)

The shared explorer UI omits absent activity counts, storage sizes, definitions
and warnings when given the structural DTO. Table search, detail modes, account
key relationships and column details remain available. Narrow screens wrap the
toolbar and display the selected table within the viewport. The private response
continues to show its counts and definitions. No server response or flag changed.

`pnpm exec tsx scripts/check-schema-structural-ui.ts` uses the live local catalog
(39 tables, 36 relationships), intercepting only the browser schema response
with the structural projection. Desktop/mobile checks cover both response modes,
account details, search, detail controls, browser errors and viewport bounds.
Structural screenshots are in `docs/screenshots/schema/`. Credential installation,
exact HTTP admission and private rollback remain open before public activation.

## Explorer structural HTTP response (iteration 1769)

The explorer server now selects the structural projection when
`SCHEMA_EXPLORER_STRUCTURAL_ONLY=1`. The default retains the private model;
request parameters cannot change the setting. This is a response setting only,
not authorization to expose the listener or proxy prefix. Live configuration is
unchanged and public mode remains off.

The server's real HTTP handler is exercised on an ephemeral loopback listener
with synthetic catalog data. Private/structural/private startup checks preserve
table topology, remove private catalog markers and row estimates, keep schema
responses uncached, reject POST before introspection, serve existing assets and
health, and refuse unknown routes. This rehearsal needs no database credentials
or provider traffic. Catalog-role credentials and exact proxy admission still
need installation and composed browser/rollback checks before activation.

## Restricted catalog HTTP composition (iteration 1770)

The disposable migrated-database rehearsal now serves real introspection results
through the explorer HTTP handler under the restricted catalog session. Three
ephemeral loopback listeners exercise private/structural/private startup. Checks
retain all table names and relationship endpoints, remove catalog comments and
activity fields in structural mode, preserve no-store, refuse POST and unknown
row-like routes, and restore the full private response after rollback. Existing
application-row, role-switch and server-file denials run in the same session.

This uses session authorization, not password authentication: the shared test
container uses trust authentication. Live credential installation and exact
proxy/browser composition remain open; no live flags, credentials or grants change.

## Explorer password-authenticated rehearsal (iteration 1771)

The explorer integration suite now migrates a separate disposable PostgreSQL 17
instance with SCRAM host authentication, installs the prepared catalog role and
enables a synthetic login separately. It checks the SCRAM verifier, rejects a
wrong password, confirms actual session identity and login defaults, and serves
the structural HTTP response through that authenticated connection. Application
rows, password catalogs, identity escalation and server-file reads remain denied;
disabling the read-only default does not grant DELETE access.

A final NOLOGIN check rejects fresh connections. Existing pooled sessions must
be closed during credential rollback; NOLOGIN alone does not disconnect them.
All credentials and schema changes in this rehearsal are disposable fixtures.
Live credential installation and exact proxy/browser acceptance remain open;
public mode and live grants are unchanged.

## Explorer deployment credential preflight (iteration 1772)

`apps/schema-explorer/src/check-credentials.ts` is a read-only deployment gate.
Run `node --env-file=$HOME/.config/news-digest/env apps/schema-explorer/src/check-credentials.ts`
after privately staging `SCHEMA_EXPLORER_DATABASE_URL`. It accepts only a
loopback URL for `schema_catalog_reader` with a password and no query options.
It requires successful real login, a fresh wrong-password refusal (28P01),
expected identity/read-only/timeout defaults and no elevated role, membership,
application-table, persistent-schema CREATE or non-system definer privileges.
The CLI prints no URL, password or driver error.

The disposable SCRAM test passes, rejects an accidental users-table grant and
rejects host `trust` authentication even with a stored SCRAM password. Current
compose configuration uses host `trust`; a scoped password-authentication rule
must precede live credential installation. Do not change authentication for
existing app/observability roles. Live installation, exact proxy/browser checks
and private rollback remain open; public mode stays off.

## Scoped explorer authentication rehearsal (iteration 1773)

Prepared `ops/schema-explorer/prepared/catalog-reader.pg_hba.conf` requires
SCRAM for the catalog role over IPv4 and IPv6 before broader trust rules.
Role scoping accommodates Docker NAT without changing other roles' rules.
The disposable PostgreSQL rehearsal starts from host trust, prepends the
fragment, reloads, checks the parsed rules and passes the credential preflight.
A fresh unrelated owner login retains its original trust behavior; restoring
the original file (preserving ownership and mode) and reloading makes the
preflight refuse trust again.
No live authentication file, credential, grant or public flag changed.
Live installation must preserve a private copy of the original file with its
PostgreSQL ownership and mode intact, validate
`pg_hba_file_rules`, run the credential preflight and check existing service
connections before configuring the explorer. Exact proxy/browser rollback
remains open.

## Live explorer catalog credentials (iteration 1774)

Installed the catalog-only role, scoped IPv4/IPv6 SCRAM rules and the explorer
service credential drop-in. The redacted preflight passes with real login,
wrong-password rejection, session defaults and zero unsafe grants. Existing
application and observability roles retain access; parsed authentication rules
have no errors. Public mode and structural-response flags remain off.

Live preflight initially refused the extension's PUBLIC SELECT grants on
`pg_stat_statements` and `pg_stat_statements_info`. The prepared
`ops/schema-explorer/prepared/query-stats-access.sql` preserves existing named
roles' SELECT before removing those inherited grants. The disposable SCRAM test
now installs the extension, reproduces the refusal and verifies the repair,
repeat application and preserved existing-role access.

Private snapshots of the database, roles, environment, original authentication
file and exact extension-ACL rollback live under
`~/.local/state/news-digest/catalog-1774/` (owner-only). The original container
file is also preserved as `pg_hba.conf.before-catalog-1774`. Never commit these.
The committed `ops/schema-explorer/catalog-credentials.conf` is the installed
systemd drop-in template. Removing it and restarting restores the original
connection; this live rehearsal closed the catalog sessions and preserved the
schema response. Reinstalled the drop-in and restarted onto the restricted role.
All 39 tables and the full response match before/after/rollback, apart from
capture time, with no warnings. Exact structural proxy/browser acceptance and
full credential/authentication rollback remain open.

## Explorer proxy and browser rollback (iteration 1775)

`pnpm exec tsx scripts/check-schema-proxy.ts` captures the live explorer's
restricted-role catalog response (39 tables, 36 relationships), then serves it
through the real explorer HTTP handler and API tool proxy on ephemeral loopback
ports. It does not intercept browser responses or open a database connection.
Private/structural/private server startups preserve the full response after
rollback; structural responses exactly match the explicit projection, including
when query parameters request private data. No-store, bare-prefix redirect,
POST refusal and unknown row-route refusal pass.

Desktop/mobile browsers load the actual proxied assets and schema response,
open account columns and relationships, search, and pass viewport/error checks.
Screenshots: `docs/screenshots/schema/proxy-structural-{1440,390}.png`.
Private admission refuses anonymous/forged identity requests before catalog
loading. The current public route policy refuses all explorer paths even for
a fresh admin: reader admission remains deliberately uninstalled. No live
flags, credentials, authentication rules or services change in this rehearsal.
Full credential/authentication rollback and the explicit reader route decision
remain before public activation.

## Explorer credential lifecycle rollback (iteration 1776)

The disposable PostgreSQL credential rehearsal now composes pool closure,
NOLOGIN, authentication-file restoration, exact extension ACL restoration and
restricted-role reactivation. It proves that NOLOGIN leaves an existing pooled
session usable, closing that pool removes its backend, and a fresh login remains
blocked after rollback. Original extension ACLs match exactly; the existing owner
can still read application tables. Reapplying restricted grants and scoped SCRAM
rules restores credential preflight and the same structural table catalog while
application-row reads remain denied.

This is an isolated regression test with synthetic credentials, not a live
credential rollback. Live service/environment/authentication rollback and the
explicit public reader admission decision remain open. No production credentials,
grants, flags or provider traffic changed.

## Live explorer credential rollback (iteration 1777)

Rehearsed on the private live service with fresh mode-600 snapshots in
`~/.local/state/news-digest/catalog-1777/`. Removed only the explorer URL from
the environment and its service drop-in, then reloaded systemd and restarted
the explorer. Its complete private response matched the restricted-role response
exactly apart from capture time, and no catalog-role backends remained.

Set the catalog role NOLOGIN, restored the pre-install authentication file in
place (preserving ownership/mode), validated zero parsed-rule errors and reloaded
PostgreSQL. Restored the preserved extension ACL script; app health stayed green.
Reactivation restored the current authentication file, hardened extension grants,
LOGIN, exact environment and drop-in, then restarted the explorer. Exact response
and extension ACL comparison, restricted-role backends and the password/privilege
preflight all passed. Cleanup ran through a finally block.

Public/structural flags stayed off, no provider calls were made, and the catalog
login is active again. Explicit reader route admission remains the next explorer
gate; this rehearsal does not enable public access.

## Explorer upstream response enforcement (iteration 1778)

Public tool selection now marks the explorer as a reader upstream. The proxy
allows only GET on the bare prefix, index, app.js, style.css and api/schema,
without queries; it removes incoming credentials and forwards only content type
and no-store on successful responses. It rejects any upstream lacking the
structural-only service marker, including a private explorer after rollback.
The marker is emitted only by structural mode. Public route admission stays
closed; no live flag changes. Tests cover wrong upstream, exact routes,
credential stripping, cookie removal and private/structural/private marker state.

## Explorer reader admission (iteration 1779)

The prepared public policy admits GET only on `/db`, `/db/`, `/db/app.js`,
`/db/style.css` and `/db/api/schema`. Query strings, HEAD, writes, unknown
routes and ambiguous paths stay denied before the proxy. This admission uses
no account authentication; the structural marker check remains mandatory.

`check-schema-proxy.ts` composes the public guard and selected reader proxy
against the captured live restricted-role catalog. Private/structural/private
returns 502/200/502 without private response bodies; the structural response
matches the exact public DTO. Forged identity and admin-token headers do not
change admission. The separate private guard retains its existing behavior.
Anonymous desktop/mobile views of the users schema pass; inspected screenshots:
[desktop](screenshots/schema/public-admission-1440.png),
[mobile](screenshots/schema/public-admission-390.png).

Unit HTTP checks compose admission with credential/cookie stripping, exact
route denial and unavailable/private upstream refusal. No live flags, database
grants or credentials changed. Live structural-mode activation and the remaining
Phase 4 security gates still precede public promotion.

## Live explorer structural activation (iteration 1780)

`pnpm exec tsx scripts/check-live-schema-structural.ts --live` installed the
reviewed structural-only service drop-in. Private/structural/private/structural
restarts passed against the real restricted-role catalog: exact projection of
39 tables, no-store response, structural marker, healthy app/explorer, and
authenticated proxy response parity. Rollback restored private model fields and
reactivation restored the exact structural projection. Failure restores the
initial drop-in. No credentials, grants or public-mode flags changed.

Live desktop/mobile browser checks pass without response interception; screenshots
are `docs/screenshots/schema/live-structural-{1440,390}.png`. Anonymous live
`/db/` remains 404. Existing isolated private/structural proxy and UI rehearsals
now obtain their private input directly through the same restricted catalog role,
so they remain usable after the live server stops returning private fields.
Public-mode activation and the other Phase 4 tool gates remain open.

### Installed reader handbook (iteration 1781)

Installed and enabled the tracked `news-digest-reader-docs.service` on
`127.0.0.1:8110`. `pnpm exec tsx scripts/check-live-reader-handbook.ts`
compares installed HTML/CSS GET and HEAD responses with the tracked corpus
and exercises prepared public proxy selection on an ephemeral loopback server.
Exact bodies, service marker, no-store/CSP, redirect and old corpus/query/write
refusals pass. Installed-service [desktop](screenshots/reader-handbook-live-1440.png)
and [mobile](screenshots/reader-handbook-live-390.png) rendering checks pass. The live private API still refuses anonymous `/docs/`.

Stop/start rollback confirmed listener removal without affecting `/healthz`,
then restored the same acceptance checks. To remove the prepared service, run
`systemctl --user disable --now news-digest-reader-docs.service`; private
routing continues to use the separate owner handbook. Public flags are unchanged.

## Admin telemetry query boundary (iteration 1782)

Prepared public mode admits three exact GET APIs only for a fresh admin session:
metrics instant/range queries and the VictoriaLogs log query. Other methods,
insert/delete/merge/snapshot paths, streaming tails and UI assets remain denied.
The proxy shares the admission allowlist, strips all incoming credentials and
identity headers, drops upstream cookies/custom headers and returns no-store.
Loopback fixture HTTP coverage verifies all three APIs across anonymous, reader,
stale-admin and fresh-admin principals, mutation refusal before upstream access,
proxy-only refusal and service-down behavior. Configured Nest admission also
checks fresh-admin-only forwarding. Live loopback metrics returned eight series;
a one-minute, one-row log query returned one row. No log content was printed.
Public mode remains off; the private proxy is unchanged. Full UI route review
and the complete Phase 4 rehearsal remain open.
