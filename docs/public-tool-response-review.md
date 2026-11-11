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

## Live admin telemetry composition (iteration 1783)

`pnpm exec tsx scripts/check-live-admin-telemetry.ts --live` binds an ephemeral
loopback proxy using the prepared public admission and tool selection. Real
VictoriaMetrics instant/range queries return positive scrape counts; a bounded
VictoriaLogs query returns exactly one recent row. Bodies are never printed.
Anonymous, reader and stale-admin simulated principals receive empty 404s before
proxy forwarding; only the simulated fresh admin reaches the live stores.
Mutation and UI refusals are counted before upstream access, so the rehearsal
never sends writes to either service. This checks live upstream composition;
principal authentication uses the separate deployed-account/Nest checks.
Public mode stays off. UI route review and full Phase 4 acceptance remain open.

## Stored-session telemetry rehearsal (iteration 1784)

The compiled public application now mounts the prepared telemetry proxy in its
isolated-storage rehearsal. Real code redemption creates the admin cookie;
instant/range metrics and log queries reach only a recording fixture upstream.
Anonymous visitors, an invited reader, an admin session aged beyond seven days,
and the logged-out admin receive empty 404s without upstream forwarding. Restoring
the stored creation time restores access. Forwarded requests contain no caller
credentials; upstream cookies/private headers are removed and responses use no-store.

Native landing-page review found operational links, including metrics reload;
the logs UI also references additional query/metadata APIs. Landing pages and UI
assets remain closed pending their own route review. No live operational bodies
or provider calls are needed for this rehearsal; public mode stays off.

## Logs read API inventory (iteration 1785)

Installed VictoriaLogs UI assets reference hit counts, statistics, field/stream
metadata and query time bounds alongside the existing log query. Bounded live
GET probes returned JSON/200 for all eight additional endpoints without printing
operational bodies. The prepared fresh-admin allowlist now admits exact GETs for
`hits`, `stats_query`, `stats_query_range`, `field_names`, `field_values`,
`stream_field_names`, `stream_field_values` and `query_time_range` under
`/logs/select/logsql/`. Shared admission and restricted proxy use the same list.

These responses contain operational data and remain unavailable to anonymous,
reader, stale-admin and logged-out sessions. Caller credentials and upstream
cookies stay stripped; responses use no-store. POSTs, streaming `tail`, inserts,
UI pages/assets and unknown paths remain denied. Native UI POST transport and
asset admission still need review before enabling the UI. Public mode stays off.

## Native UI browser transport review (iteration 1786)

Run `pnpm exec tsx scripts/review-native-telemetry-ui.ts --live-assets` to load
installed loopback UI documents and JavaScript/CSS assets in Chromium. Every
non-asset request receives an intercepted fixture; no live operational queries,
POSTs or external requests are forwarded. The report prints methods and paths,
without query strings, bodies, credentials or external hostnames. It asserts
successful asset loading, mounted controls and native POST query requests.

| Installed UI              | Observed native requests beyond assets                                                                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Metrics `/metrics/vmui/`  | POST `/metrics/prometheus/api/v1/query_range`; GET `/metrics/prometheus/vmui/{config.json,custom-dashboards,timezone}`; dashboard JSON `/metrics/vmui/dashboards/perJobUsage.json` |
| Logs `/logs/select/vmui/` | POST `/logs/select/logsql/{query,hits,stream_field_names}`; GET `/logs/select/{buildinfo,tenant_ids}`                                                                              |

The metrics request used the synthetic expression `up`; all returned data was
fixture data. Logs query execution likewise used fixtures. These are native
transport observations, not live data or complete UI acceptance. The asset report
records the currently installed hashed bundles; upgrades require another review.

The prepared GET query allowlist cannot yet support either native UI: metrics
also adds the `/prometheus` alias to its API target. Before admitting UI pages,
review exact static/configuration routes, bounded form POST transport, same-origin
checks and its interaction with the admin-write audit. Keep tail, mutation,
reload and unreviewed metadata routes denied. Native bundles offer configurable
server URLs and external links: constrain browser connections with a same-origin
CSP when serving them. Do not broadly admit `/metrics/` or `/logs/` prefixes.
Public mode remains off; no admission or proxy behavior changed in this review.

## Bounded native query transport (iteration 1787)

Prepared public mode admits GET and POST on the exact reviewed query paths,
including metrics `/metrics/prometheus/api/v1/{query,query_range}` aliases.
POST accepts only uncompressed `application/x-www-form-urlencoded` (optional
UTF-8 charset), buffers at most 16 KiB and times out uploads after five seconds.
Unsupported media/encoding or declared oversize returns 415; chunked oversize
returns 413. Rejections happen before creating an upstream request. Only generated
content type/length and loopback host headers accompany the buffered body;
credentials and upstream cookies remain stripped and responses use no-store.
These are read queries and bypass mutation auditing; session freshness still
applies. The full application retains exact configured-origin and duplicate-header
checks for POST; only these query paths accept forms through its provenance guard. UI documents/assets, streaming tails and mutations remain denied.

Fixture HTTP covers body preservation, missing freshness, media/encoding and
declared/chunked size refusal. The compiled application rehearses both methods
with anonymous, invited-reader, fresh/stale admin and logged-out stored sessions.
Explicit bounded live upstream POSTs returned success/eight metrics series and
one recent log row; no operational bodies were printed. Public mode stays off.
Next: exact static/configuration and build/tenant metadata review, same-origin
CSP and complete native browser acceptance before opening UI routes.

## Native UI CSP rehearsal (iteration 1788)

The installed-asset browser review now injects a candidate response CSP into
both native UI documents. Scripts, fonts and connections are limited to the same
origin; inline scripts, workers, frames, objects and forms are denied. Images
allow same-origin and data URLs; styles allow same-origin and inline CSS for the
native controls. The normal mount/query flow produces no CSP violations with
intercepted fixture responses. Deliberate inline-script and external-fetch probes
are refused, and the external request never reaches browser request routing.

This policy is a rehearsed candidate, not a deployed header. Public native UI
admission stays closed. Exact assets/configuration/build/tenant response review,
proxy header composition and broader UI navigation remain required before opening
these routes. Run `pnpm exec tsx scripts/review-native-telemetry-ui.ts --live-assets`
after an upstream UI upgrade; it reports directive names without blocked URLs.

## Exact installed responses (iteration 1789)

The Chromium review now records byte counts, content types and SHA-256 hashes
for every loaded document, script and stylesheet, refuses unexpected MIME types,
checks a 4 MiB asset limit and rejects asset cookies. The reviewed inventory is
[native-telemetry-asset-review.json](native-telemetry-asset-review.json): seven
metrics resources and six logs resources. This covers the mounted query flow;
other navigation can load additional bundles and requires another review.

`pnpm exec tsx scripts/review-native-telemetry-metadata.ts --live` separately
reads six exact loopback GET responses with five-second/16 KiB limits, refuses
redirects/cookies and checks their JSON shapes. It prints shapes and byte counts,
never metadata values or tenant identifiers.

| Exact response                               | Reviewed contents                            | Prepared admission decision                       |
| -------------------------------------------- | -------------------------------------------- | ------------------------------------------------- |
| `/metrics/prometheus/vmui/config.json`       | Version, license type, alerting enabled flag | Fresh admin only                                  |
| `/metrics/prometheus/vmui/custom-dashboards` | Empty dashboard settings                     | Fresh admin only; re-review configured dashboards |
| `/metrics/prometheus/vmui/timezone`          | Timezone string                              | Fresh admin only                                  |
| `/metrics/vmui/dashboards/perJobUsage.json`  | Static CPU/RSS/disk query panels             | Fresh admin only                                  |
| `/logs/select/buildinfo`                     | Status and version                           | Fresh admin only                                  |
| `/logs/select/tenant_ids`                    | Numeric account/project identifiers          | Fresh admin only; never anonymous or reader       |

These are live metadata reads; browser query results still use fixtures. No
runtime admission changed. Next compose the exact asset/metadata routes with
fresh-admin authentication, credential stripping, no-store and the rehearsed CSP,
then verify the native UI through that proxy. Unknown paths and mutations stay
closed; public mode remains off.

## Prepared native metadata admission (iteration 1790)

Six reviewed metadata paths are now GET-only behind the shared fresh-admin
route and proxy boundary: metrics configuration, custom dashboards, timezone and
per-job dashboard, plus logs build information and tenant IDs. No query suffix,
trailing slash, encoded alias, POST or HEAD is admitted for these paths.
Caller credentials and upstream cookies/headers remain stripped; responses are
no-store. UI documents/assets, tails and mutations remain closed.

Isolated proxy tests cover anonymous, reader, stale-admin and fresh-admin
principals. The compiled application rehearsal includes real stored sessions,
login, freshness loss and logout; metadata POST is refused before upstream.
The explicit live proxy check reads all six bounded responses without printing
values or tenant identifiers. Live public mode remains off; UI CSP composition
and broader navigation remain open.

## Prepared native UI asset admission (iteration 1791)

Thirteen exact installed asset paths from the saved inventory now share fresh-admin GET admission; unknown assets, suffixes and other methods remain refused. The prepared proxy supplies the same-origin CSP and nosniff while stripping credentials and upstream cookies. No wildcard asset directory is admitted.

Run `pnpm exec tsx scripts/review-native-telemetry-ui.ts --proxy-assets` to load installed assets through the real prepared proxy, assert its headers and exercise fixture-intercepted query flows plus inline-script/external-fetch refusals. This isolated proxy harness has no session middleware; principal refusals are covered by the composed access/proxy tests. Public mode stays off; broader live navigation and stored-session UI composition remain open.

## Stored-session native asset boundary (iteration 1792)

The compiled full-application integration rehearsal now exercises all 13 exact
native asset GETs with real persisted sessions: fresh admin, aged admin,
restored freshness, invited reader, anonymous and logged-out admin. Successful
responses preserve CSP, nosniff and no-store; caller credentials and upstream
cookies/private headers remain stripped. HEAD/POST, unknown assets and document
query aliases never reach the isolated recording upstream. Bodies are fixtures;
this verifies HTTP/session composition, not browser navigation or live queries.
Public mode stays off. Full browser/session composition and broader live
navigation remain open.

## Native hash-route navigation (iteration 1793)

The prepared-proxy Chromium review now visits metrics Raw Query, Dashboards
and Query Analyzer, plus logs Overview. Each screen mounts without uncaught
page errors or normal CSP violations. Admitted operational requests match the shared fresh-admin read policy; Overview adds POST field_names,
which is already admitted. The dashboard uses an explicit fixture panel with empty query results.
Screenshots live under `docs/screenshots/native-*-prepared-proxy.png`.

All operational responses remain intercepted fixtures. Raw Query automatically requests GET `/metrics/prometheus/api/v1/export`,
which remains denied (403) and is asserted as the sole expected refusal.
Review bounded export semantics before admitting it. Full authenticated browser composition, remaining navigation controls and live
query rendering still need acceptance; public mode remains off.

## Native raw-export review (iteration 1794)

`pnpm exec tsx scripts/review-native-telemetry-export.ts --live` performs one
five-second/64 KiB client-bounded upstream read: only `up`, the last 60 seconds,
`max_rows_per_line=1` and `reduce_mem_usage=1`. It verifies JSON-line metric,
value and timestamp shapes without printing labels or samples. The live review
returned 15 lines/15 samples (1,745 bytes), no cookie, and JSON content type.
The script also confirms export GET/POST/HEAD remain outside prepared admission.

The installed Raw Query screen sends only `match[]`, `start` and `end`; the
fixture-intercepted browser review now asserts that parameter-name inventory.
One sample per line still returned 15 lines: `max_rows_per_line` is not a total
response cap. The probe's client deadline/byte cap does not establish server
query-work limits. Keep this route denied until selector/time-window bounds,
upstream cancellation and total response limits are enforced and rehearsed.
No live browser queries, new route admission or public activation occurred.

## Prepared export bounds (iteration 1795)

The live review now uses the prepared export transport rather than its own
reader. Request parsing accepts one exact `up` selector, explicit numeric
second timestamps and a positive window of at most 60 seconds. Duplicate or
unknown parameters, broad selectors, aliases and fragments are refused; the
transport adds one-sample lines and reduced-memory processing.

The transport buffers at most 64 KiB before returning any bytes, with a
five-second deadline covering headers and body. Overflow, timeout, upstream
failure and caller cancellation abort the fetch. Local HTTP tests cover exact
capacity, overflow, stalled headers/body, disconnects, pre-aborted callers,
redirect refusal and invalid content types. A narrow live probe passed again
with 15 rows/15 samples and 1,745 bytes; no operational bodies were printed.

This helper is not wired into public proxy admission. Export GET/POST/HEAD stay
denied. Next: compose response handling, authenticated client disconnects and
upstream work limits in the proxy, then rehearse installed-browser behavior.

## Prepared export HTTP composition (iteration 1796)

`proxyBoundedTelemetryExport` composes the request parser and buffered transport
with real Node HTTP request/response lifecycles. It returns a complete bounded
JSON response with no-store/nosniff headers, or a generic 502 without upstream
bytes. Invalid targets and methods receive 404 before any upstream request.
Caller credentials and upstream private headers are not forwarded. Closing the
downstream response aborts the upstream fetch, including while reading a body.

Local two-server tests cover the exact byte cap, overflow without partial data,
stalled headers, request refusals, credential/header stripping and an actual
client socket disconnect. The disconnect must close upstream within one second,
before the separate five-second transport deadline. This handler remains
unwired: fresh-admin session composition, upstream work limits and installed UI
acceptance are still required before export admission.

## Export upstream work-limit rehearsal (iteration 1797)

Prepared requests now force `timeout=2s`, independently of the five-second
HTTP transport deadline. Caller-supplied timeout and output-control parameters
are refused. The installed v1.155.0 implementation calls
`searchutil.GetContextForExport`, which reads this timeout and caps it at
`-search.maxExportDuration`; it propagates the request context to export work.
Source references: [export handler](https://github.com/VictoriaMetrics/VictoriaMetrics/blob/v1.155.0/app/vmselect/prometheus/prometheus.go)
and [export context](https://github.com/VictoriaMetrics/VictoriaMetrics/blob/v1.155.0/app/vmselect/searchutil/searchutil.go).

`pnpm exec tsx scripts/review-telemetry-export-limits.ts --isolated` starts the
installed binary on a disposable loopback port and temporary store, without
credentials or scraping. With `-search.maxExportSeries=32` and
`-search.maxExportDuration=2s`, the exact prepared reduced-memory export accepts
32 synthetic series and rejects 33 with the upstream series-limit error.
The process and store are removed afterward. This checks series enforcement;
it does not measure deadline expiry under expensive work.

The live service still has its existing export defaults. Applying and verifying
the reviewed server limits, authenticated route composition and installed UI
acceptance remain required before export admission. Export stays denied; public
mode stays off. A narrow live read with the fixed timeout passed (15 samples,
1,737 bytes); operational bodies were withheld.

## Installed export server limits (iteration 1798)

The live metrics service now sets `-search.maxExportSeries=32` and
`-search.maxExportDuration=2s`, matching the disposable installed-binary
rehearsal. Other query, memory and CPU settings are unchanged. The service was
restarted outside the edition protection window; the running process arguments
and loopback health were checked after startup. The narrow live export and
prepared metrics/log-query proxy checks pass; operational bodies are withheld.

Export admission remains closed. Deadline-expiry acceptance, authenticated
route composition and installed UI acceptance remain required. Rollback:
remove these two flags from the unit, reinstall it, reload systemd and restart
`obs-metrics.service`; keep public export admission closed throughout.

## Export deadline-expiry rehearsal (iteration 1799)

`pnpm exec tsx scripts/review-telemetry-export-limits.ts --isolated` now also
starts a second disposable installed-binary process with a shortened 1 ms
server export cap. The exact prepared request still carries `timeout=2s`.
The native export refuses it with `request timeout reached`, the buffered
transport rejects the non-success response, and the process remains healthy.
Both synthetic stores and processes are removed afterward; no live settings
or data change.

The installed implementation rounds context deadlines down to Unix seconds,
so this shortened cap exercises expiry without expensive synthetic load.
This verifies server-cap precedence and native deadline-error handling; it
does not measure expensive exports at the live two-second limit. The normal
32/33-series rehearsal still runs with the live two-second cap. Authenticated
route composition and installed UI acceptance remain before admission.

### Native bounded export browser rehearsal (iteration 1800)

`pnpm exec tsx scripts/review-native-telemetry-ui.ts --proxy-assets` now
composes the installed Raw Query screen with the prepared buffered export
handler and an isolated synthetic upstream. A fresh page with `g0.expr=up`
and `g0.range_input=1m` sends numeric start/end values exactly 60 seconds
apart and renders the `browser-fixture` series. Reloading is necessary when
setting the time-range hash after another screen has initialized shared state.
The handler forces the two-second upstream timeout and per-line/reduced-memory
parameters; credentials never reach the fixture upstream. Browser checks cover
no-store, nosniff and absence of upstream cookies. A 30-minute request remains
refused without upstream work. Updated Raw Query screenshot contains fixtures.
No real exports or provider calls occur. Production admission stays closed;
stored-session composition and broader live navigation remain open.

### Stored-session bounded export composition (iteration 1801)

The prepared authenticated export middleware remains unmounted in production.
The isolated full-application test composes it with the stored account
handlers and buffered export transport. A real code-login cookie admits the
one-minute `up` request and returns a synthetic series; upstream receives the
fixed timeout and memory parameters without caller credentials.
Anonymous readers, invited readers, an eight-day-old admin session and a
logged-out admin receive 404 without upstream work. Restoring freshness
restores access. POST, HEAD, broad windows, alternate selectors and caller
upstream-timeout overrides remain refused. Response checks cover no-store,
nosniff and private-header stripping. The separate account storage owner is
closed during cleanup. No live exports or provider calls occur.
Full browser/session composition and broader live navigation remain open;
export admission and public mode stay off.

### Browser cookie and stored-session export boundary (iteration 1802)

Chromium now sends the real code-login cookie from a Secure, HttpOnly,
SameSite=Strict cookie jar through the isolated full application. A synthetic
HTTPS page fetches and renders the synthetic export; all requests are fulfilled
locally. No installed UI assets, live telemetry or provider calls are used.
Fresh and restored admins receive the series. Anonymous and invited readers,
eight-day-old admins and logged-out admins receive empty 404 responses with
no export upstream work. Each context repeats the request and checks no-store;
page JavaScript cannot read the cookie. This covers browser cookie transport
with stored-session authorization. Installed native UI composition with the
same stored-session boundary and broader live navigation remain open.
Production export admission and public mode stay off.

### Installed Raw Query with stored sessions (iteration 1803)

The explicit `capture-installed-telemetry-assets.ts /tmp/<new-file>.json`
command captures the 13 reviewed metrics and logs assets from loopback, checking
size, SHA-256, MIME and absence of cookies. Set
`TELEMETRY_INSTALLED_ASSET_FIXTURE=/tmp/<new-file>.json` when running
`pnpm check` to add installed Raw Query to the isolated full-application
browser rehearsal. Tests read the captured file; they never fetch live assets
or operational data.

The native page, assets and synthetic export pass through the prepared proxy
and real stored-session authorization. Fresh/restored admins render the
synthetic series without script errors or CSP violations. Anonymous/invited
readers, aged and logged-out admins cannot load the document and cause no
telemetry upstream work. Every browser request stays on the virtual HTTPS
origin and carries the HttpOnly cookie through the proxy. Responses remain
no-store and omit cookies; admitted assets carry CSP and nosniff.

Production admission/public mode remain off. Other native screens with stored
sessions, broader live navigation and the remaining readiness gates stay open.

### Installed metrics navigation with stored sessions (iteration 1804)

The same explicit captured-assets rehearsal now opens Dashboards and Query
Analyzer through full document navigations for every stored-session actor.
Fresh/restored admins mount both screens without missing-dashboard messages,
script errors or CSP violations. Anonymous/invited readers, aged and logged-out
admins receive empty 404 responses and cause no telemetry upstream work.
Every asset/query request retains the same cookie, no-store and proxy checks.
Screenshots use synthetic responses only. Logs UI session composition, remaining
controls and live navigation remain open; production flags remain off.

### Installed logs navigation with stored sessions (iteration 1805)

The explicit asset capture now includes the six reviewed logs assets, with the
same SHA-256, byte-count, MIME and no-cookie checks. The isolated full-application
browser rehearsal opens the logs query screen and Overview for every session
actor. Fresh/restored admins mount both screens and execute the query control;
the query screen requests query, hits and stream-field metadata through the
prepared proxy. Responses are synthetic, including an empty log stream.
Anonymous/invited readers, aged and logged-out admins receive 404 without
telemetry upstream work. Cookie stripping, no-store, CSP/nosniff and absence of
script errors/CSP violations share the metrics checks. Production admission and
public mode remain off; remaining controls and live navigation remain open.

### Open logs screen session freshness (iteration 1806)

The installed logs Query screen now has an action-level stored-session rehearsal.
After a fresh admin mounts it, the isolated database ages that same session past
seven days. Executing another query returns 404 and sends no telemetry upstream
requests, without a document reload. Restoring the saved session creation time
lets the same screen query again with HTTP 200. This models the freshness boundary
with synthetic telemetry; production admission and public mode remain off.

### Open metrics screen session freshness (iteration 1807)

The installed metrics Raw Query screen also rechecks the stored session when
Execute requests another bounded export. Aging its session beyond seven days
returns 404 without telemetry upstream work; restoring the saved creation time
lets the same mounted screen render the synthetic series again with HTTP 200.
The isolated Chromium rehearsal uses captured installed assets and synthetic
telemetry. Production admission and public mode remain off.

### Mounted Raw Query window bounds (iteration 1808)

The captured installed UI now changes its hash-route time window from one minute
to thirty minutes while retaining the same fresh admin session. The full
application refuses the broad export with HTTP 404 and no telemetry upstream
work. Returning to one minute renders the synthetic series again with HTTP 200.
This verifies native window navigation through stored-session admission and the
bounded handler together. Production admission/public mode remain off; remaining
controls and live navigation stay open.

### Mounted Raw Query selector bounds (iteration 1809)

With a fresh stored admin session and the accepted one-minute window, changing
Raw Query from `up` to `count(up)` returns HTTP 404 without telemetry upstream
work. Restoring `up` renders the synthetic series again with HTTP 200 on the
same mounted screen. The isolated Chromium rehearsal uses captured installed
assets; production admission/public mode remain off. Remaining controls and
live navigation stay open.

### Mounted telemetry logout (iteration 1810)

The captured-installed-assets full-application Chromium rehearsal now calls the
real logout endpoint while Raw Query or logs Query stays mounted. It deliberately
retains the browser cookie to verify server-side invalidation: the next Execute
returns HTTP 404 and causes no telemetry upstream work. Both screenshots use
synthetic responses. The deleted session is restored directly in the disposable
test database only to preserve the surrounding actor matrix; production logout
never restores it. Production admission and public mode remain off; remaining
controls and live navigation remain open.

### Live installed metrics navigation (iteration 1811)

`pnpm exec tsx scripts/check-live-admin-telemetry.ts --live` now mounts the
installed Dashboards and Query Analyzer through the prepared proxy with real
loopback assets and metadata. Both screens mount without uncaught errors or CSP
violations; configuration and custom-dashboard metadata are observed, with
no-store and no upstream cookies. Automatic data queries are refused locally
with synthetic HTTP 403 responses before proxying, so this is live asset/metadata
acceptance, not live chart acceptance. Existing explicit bounded live metric/log
reads still run. Simulated anonymous, reader and stale-admin document requests
are refused before upstream work. Stored-session composition remains covered
separately; broader live query controls and production admission remain open.
Public mode stays off.

### Live installed logs navigation (iteration 1812)

The same explicit live check now mounts installed logs Query and Overview through
the prepared proxy with real assets and build/tenant metadata. Both screens pass
uncaught-error and CSP checks; metadata responses have no-store and no upstream
cookies. Automatic query and hits requests are observed and refused locally with
synthetic HTTP 403 responses before proxying. Anonymous, reader and stale-admin
document requests cause no upstream work for both tools. Principals remain
simulated; live stored-session composition, data controls and production
admission remain open. Public mode stays off.

### Live installed metrics chart (iteration 1813)

The explicit live check now renders the installed Query chart using `count(up)`.
Its browser interceptor admits exactly one range request, with only the reviewed
query/start/end/step fields, a current window of at most 65 seconds and a step of
at least 15 seconds. The response must contain one series and one to six positive
samples within that window. Other automatic data queries remain locally refused.

The real response renders a chart canvas without page or CSP errors; the saved
`docs/screenshots/native-metrics-live-count.png` was visually inspected. Principals
remain simulated; real stored-session/live-upstream composition is still open.
Production telemetry admission and public mode remain off. No provider calls.

### Live installed logs result (iteration 1814)

The explicit live check now renders one recent message in installed logs Query.
Its browser interceptor admits exactly one POST with `_time:1m`, limit one and
only query/limit/start/end fields. An explicit end time and one-minute range
avoid the native five-minute default. The response has no-store, no upstream
cookie, at most 16 KiB and exactly one timestamped row within the requested
window. The browser must display that row's actual message without page or CSP
errors. Other automatic data queries remain locally refused. Operational
messages are neither printed nor saved in screenshots.

Principals remain simulated; stored-session/live-upstream composition and
production telemetry admission remain open. Public mode stays off. No provider
calls or service restarts during the deployment hold.

### Live installed Raw Query result (iteration 1815)

The explicit live check now renders an actual `up` export in installed metrics
Raw Query through the prepared bounded export handler. Browser admission permits
one GET, exact export fields and a current one-minute window. Response checks
require no-store, no upstream cookie, at most 64 KiB, at most 32 distinct series,
one sample per row and timestamps inside the requested window. An actual job
label must render without page or CSP errors. Operational labels are never
printed or saved in screenshots. Anonymous, reader and stale-admin requests,
POST, aggregate selectors, thirty-minute windows and caller timeout overrides
are refused without export upstream work.

Export actor selection is explicitly simulated in this isolated server, separate
from the ordinary prepared-public guard: production export admission remains
closed. Stored-session/live-upstream composition remains open. Public mode stays
off; no provider calls, deployment or service restarts during the hold.

### Stored-session/live bounded export HTTP composition (iteration 1816)

`pnpm exec tsx scripts/check-live-stored-telemetry.ts --live` starts disposable
Postgres 17 and Redis 7, migrates the fresh database, and uses real HTTP login
codes delivered only to a temporary owner-only mailbox. No live account data is
read or changed. The prepared export middleware authenticates each request from
the stored session and reaches the live metrics store through a recording relay.

Fresh and restored admins receive two bounded one-minute `up` exports. Anonymous
and reader requests, an eight-day-old admin session, the same cookie after real
logout, POST and caller timeout overrides return empty 404 responses without
upstream work. The relay checks credential stripping and fixed upstream limits;
responses require no-store, no cookies, at most 64 KiB/32 series, one sample per
row and timestamps inside the requested minute. Operational bodies stay in memory.

The rehearsal initially assumed Strict cookies, then matched the existing Lax
policy. A synthetic relay cookie correctly caused the prepared handler to reject
the response; it was removed from the valid-response path. Production flags and
middleware mounting are unchanged. Installed-browser/live-session composition
and the other live telemetry routes remain open.

### Browser cookie/live export composition (iteration 1817)

The same explicit stored-session script now uses Chromium on a disposable
localhost page. It seeds the real HTTP-issued session as a Secure, HttpOnly,
SameSite=Lax cookie; page JavaScript cannot read it. A browser fetch receives one
bounded live export, bringing the rehearsal to three live upstream reads.
Aging the stored admin session refuses the next fetch without relay work.
Real logout also refuses the next fetch while the browser retains its cookie;
clearing that cookie remains refused. Responses are no-store and bounded to
64 KiB/32 rows; operational bodies stay in memory. No screenshots contain data.

This checks browser cookie transport, not browser login or the installed native
UI with live stored sessions. Production flags remain off. No service restart
or deployment is needed for this verification-only change during the hold.

### Browser HTTPS code login/live export (iteration 1818)

The explicit stored-session rehearsal now requests and redeems a code through
Chromium fetch over disposable local HTTPS. Chromium stores the redeem response
cookie itself; Secure, HttpOnly and SameSite=Lax are checked, and page JavaScript
cannot read it. The test mailbox and accounts remain disposable. A test TLS
ingress supplies the trusted proxy visitor header; this is not an exe.dev proxy
check. The self-signed certificate is accepted only by the isolated test browser.

The fresh browser session receives one bounded live export. Aging its stored
session refuses the next read; browser logout deletes the cookie, and restoring
the old cookie still refuses without upstream work. Three live reads overall,
with operational bodies only in memory. Installed native UI composition remains
open; production flags and services stay unchanged during the deployment hold.

### Installed Raw Query with browser login (iteration 1819)

`pnpm exec tsx scripts/check-live-stored-telemetry.ts --live` now loads the
installed metrics Raw Query screen after Chromium redeems a disposable mailbox
code over local HTTPS. The prepared native proxy uses the same stored-session
authenticator as the bounded export handler. One live `up` export renders a
returned metric label; automatic other query calls are refused locally.
The export remains capped at one minute, 64 KiB and 32 series. Four live export
reads occur across the complete rehearsal. An aged session cannot fetch the
native document; export aging and logout checks still pass.

Operational labels and bodies stay in memory; no operational screenshot is
saved. Production flags remain off. Other native screens, CSP coverage for this
composition and the remaining Phase 4 controls still need acceptance.
