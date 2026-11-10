# Public read rollout review — iteration 1620

Reviewed Nov 10, 2026, updated iteration 1694, before the Phase 3 scheduled-edition gate. Public mode
remains off. This is an implementation review, not Phase 4 acceptance.

## Current application boundary

`main.ts` mounts the access runtime before tool proxies, queue browser, controllers
and static files. Public mode uses exact route classification and an empty-body
exception filter. Unlisted routes receive an empty 404; it has no tool prefix grant.
The application still imports the legacy topics, ingestion, profiles and operations
controllers. `PublicReadModule` is not imported. Its schedule, topics, source catalog,
article and source-health children are imported directly behind `PUBLIC_MODE`.
HEAD inherits the GET class.

| Read surface                              | Prepared public-mode behavior                                                                            | Remaining work                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Published edition list/latest/detail      | Anonymous, published-only reader                                                                         | Preserve publication boundary and saved-content parity                                                    |
| Health                                    | Anonymous database/Redis booleans and status                                                             | No private response fields found                                                                          |
| Account session                           | Anonymous-capable caller-only identity                                                                   | Retain private/no-store headers; never enumerate accounts                                                 |
| Alert counts                              | Anonymous timestamp/counts; fixed unavailable error                                                      | No alert labels, annotations or upstream payloads exposed                                                 |
| Topics/source catalog                     | Public-mode topics GET/HEAD uses the system-only allowlist; source catalog GET/HEAD returns origins only | Complete; UI accepts legacy and public catalog options                                                    |
| Profile/schedule                          | System-only schedule GET/HEAD is anonymous in public mode; legacy profile requires fresh admin           | UI uses system endpoint with explicit private-mode 404 fallback                                           |
| Content/source health                     | Anonymous origin-only articles and count/timing source health                                            | Complete for GET/HEAD; window route remains admin-only; no active UI consumers; status projection remains |
| Detailed status                           | Fresh admin required                                                                                     | Project stored source errors, job return strings and accounting fields before anonymous reads             |
| Preview history/detail/latest/cost/job    | Fresh admin required                                                                                     | Separate public publication/accounting/progress views from unpublished/test snapshots                     |
| Admin page HTML                           | Unlisted, denied                                                                                         | Expose approved read-only pages with safe API contracts and disabled writes                               |
| Handbook/DB explorer/Grafana/jobs browser | Unlisted, denied                                                                                         | Audit each tool response/data source and add bounded read-only routing                                    |
| Logs/metrics                              | Unlisted, denied even for signed-in admin                                                                | Add session-authorized tool routing; retain mutation restrictions                                         |

## Findings that block acceptance

1. **Safe refusal does not meet the public read-only product requirement.**
   The plan makes admin pages, handbook, DB explorer, Grafana and jobs browser
   publicly viewable; current classifier tests deliberately deny all of them.
   Do not mark the response audit or Phase 4 complete merely because refusals pass.
2. **An empty exception filter does not sanitize successful responses.**
   Legacy source status includes persisted `lastError`; detailed status includes
   source results, job `skipped` strings and development accounting. Preview readers
   expose unpublished history and stored snapshots. Keep these restricted until
   explicit public schemas and adversarial storage/HTTP tests replace them.
3. **Prepared projections need application composition and UI integration.**
   Topics and schedule now use their audited readers in public-mode composition.
   Sources, article origins and source-health readers have application composition and isolated coverage.
   Replace the remaining overlapping legacy GET controllers in public mode; preserve private rollback and writes. Topic source selection already accepts both catalog shapes through an ID/name-only contract; schedule consumers already use the system endpoint.
4. **Tools need their own data review.** The proxy streams upstream bodies and
   headers; granting a prefix would expose every upstream API method/path.
   Audit handbook artifacts, DB metadata/roles, dashboard data sources and queue
   payloads before granting reads. Logs/metrics remain admin-only in the plan;
   their existing all-user refusal is temporary, not accepted admin access.

## Evidence and next step

Source review: `public-route-policy.ts`, `public-access.ts`, `main.ts`, `app.ts`,
`internal-tools.ts`, `public-write/access-stack.ts`, `public-write/public-error-filter.ts`,
`public-read/public-read.module.ts`, operations status/source readers and digest
preview controller. Existing policy tests pin denied tools/admin HTML; the full
application storage test checks tool refusal with anonymous and valid admin sessions.
The earlier [field audit](public-read-response-audit.md) and
[configured snapshot](public-read-configured-review.md) remain supporting evidence;
the Nov 9 snapshot needs refreshing before promotion.

Iteration 1621 installs the system schedule GET/HEAD in public-mode application
composition, with a shutdown-owned pool and no private-mode storage or route.
Full-application isolated HTTP checks compare the response to system settings,
reject mutations and preserve anonymous legacy-profile refusal. Private rollback
keeps the existing profile contract.

Iteration 1622 migrates the schedule UI to the system endpoint. Only a 404
permits the private-mode profile fallback; other failures show retry. Editing
requires a confirmed admin identity. Browser replays cover system reads, private
fallback, failure/retry and disabled reader controls without live writes.
Admin HTML and router access promotion remains part of the later rollout.

Iteration 1623 installs the system-only topic GET/HEAD in public-mode application
composition, replacing the legacy GET without registering overlapping routes.
Writes remain admin-only; private mode keeps legacy reads.
Application-owned storage closes with Nest. Full-application checks compare
anonymous responses with the audited projection and retain admin mutation and
revocation coverage. The UI consumes the shared owner-free topic-settings
contract for reads and mutation results; private responses remain compatible.
Desktop/mobile light/dark browser replays exercise both response shapes.

Iteration 1624 promotes source catalog GET/HEAD in public-mode application
composition, replacing the legacy route. Responses expose only IDs, names and
publisher origins; configured feed paths and tokens stay restricted. Owned storage
closes with Nest; borrowed storage remains open. Private mode retains its catalog.

Source catalog UI compatibility shipped in `564ecb6b`: the topic editor parses
only IDs and names from either response shape. Iteration 1693 confirms all 36
saved options, existing selections and invalid-response refusals in desktop/mobile
read-only browser replays. Public-shape responses are simulated, not live public mode.

Iteration 1694 installs origin-only article and count/timing source-health GET/HEAD
readers in public-mode application composition. Legacy latest/source-health handlers
are absent in public mode; the window handler remains admin-only. Private mode
retains the previous contracts. Each new application reader owns its shutdown pool.
Full-application isolated HTTP checks compare both responses to audited projections,
check empty HEAD bodies and reject writes and anonymous window reads.

Iteration 1695 confirms neither content reader has an active UI consumer. Removed
the unused legacy article query. The source-management page consumes operations
status, including collection controls and recent counts absent from source health.
`smoke-content-read-consumers.ts` replays 36 saved sources at desktop/mobile sizes
with content routes unavailable, verifies collection settings and zero content
reads/writes. Screenshots: `docs/screenshots/ui/content-read-consumers-*.png`.
This is private UI evidence; public status projection and page access remain open.

Next available implementation step: status/preview projections, then tools. Public activation still waits for Phase 3 acceptance.

Iteration 1696 prepares `readPublicStatus` without installing a route. It retains
coverage, source collection controls/counts/timestamps and allowlisted queue
counts/availability. Historical source failures become `hasError`; job IDs,
results, skip strings, provider usage and development accounting are omitted.
Unknown fields are stripped and malformed retained data fails with a generic 503. Adversarial unit checks cover stored secrets and dependency failures.
Detailed status remains admin-only: transport composition, public UI compatibility
and the decision about public budget summaries remain unfinished. No deployment
or restart during the 13:00–16:00 UTC protected window.

Iteration 1697 prepares an uninstalled `PublicStatusModule` and HTTP controller.
Isolated Nest HTTP checks verify sanitized GET, empty HEAD, no-store on success
and generic 503 failures, absent mutation/alerts routes and disabled-mode 404s.
Invalid flags fail before reader construction. Application composition and route
policy are unchanged; status remains admin-only. Next: public UI compatibility
and budget-summary decision before composition, then preview/tools boundaries.

Iteration 1698 adds production-only budget aggregates to the uninstalled status
projection: UTC day/month charges, unresolved holds, caps and available allowance;
X also retains its blocked boolean. Separate nested schemas omit call histories,
models, purpose strings, provider errors, reserve outcomes and development pools.
Missing summaries remain absent; malformed supplied totals fail closed. Adversarial
unit and HTTP checks cover these exclusions. The existing UI still requires the
private operations contract (overview runs/errors, spend ledger/development pools);
it needs a separate public contract and rendering before status composition.
No route promotion, deployment or restart during the protected window.

Iteration 1699 adds a shared public wire contract, separate from private operations
status. The projection derives its output fields from this contract, converting
stored errors into booleans before transport. Round-trip checks reject private
source shapes and malformed public values and strip nested private fields.
No UI query, rendering, route composition or rollout change is installed. Next:
public rendering for overview/source health/budget totals, then preview/tools.

Iteration 1700 prepares `PublicStatus`, consuming only the shared public contract:
source collection state/counts/timestamps, queue counts/availability, topic coverage
and production budget totals/holds. Missing budgets/coverage and empty lists have
explicit unavailable states. It has no mutation controls or private queries.
`pnpm exec tsx scripts/check-public-status-view.ts` rehearses fixture rendering
offline at desktop/mobile widths in both themes; screenshots are
`docs/screenshots/ui/public-status-fixture-{390,1440}-{light,dark}.png`.
Route/query composition remains pending; running private pages are unchanged.
Next: compose the gated public status reader/view, then preview/tools.

Iteration 1701 composes the uninstalled public query and view in `PublicStatusPage`.
Its query uses the public schema and a separate cache key, with no private fallback;
loading disables refresh, HTTP/schema failures show a generic retry message, and
failed refreshes retain the previous public data with an explicit stale warning.
The offline browser check covers these states and a seeded private cache, verifies
only status GET requests, and saves `public-status-page-fixture-*` screenshots.
No application route, API authorization or deployment changed. Next: install the
gated status API/page composition without legacy overlaps, then preview/tools.
