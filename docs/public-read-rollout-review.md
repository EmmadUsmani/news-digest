# Public read rollout review — iteration 1620

Reviewed Nov 10, 2026, updated iteration 1621, before the Phase 3 scheduled-edition gate. Public mode
remains off. This is an implementation review, not Phase 4 acceptance.

## Current application boundary

`main.ts` mounts the access runtime before tool proxies, queue browser, controllers
and static files. Public mode uses exact route classification and an empty-body
exception filter. Unlisted routes receive an empty 404; it has no tool prefix grant.
The application still imports the legacy topics, ingestion, profiles and operations
controllers. `PublicReadModule` is not imported. The application now imports its schedule
child directly behind `PUBLIC_MODE`; other projections remain disconnected. HEAD inherits the GET class.

| Read surface                              | Prepared public-mode behavior                                                                  | Remaining work                                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Published edition list/latest/detail      | Anonymous, published-only reader                                                               | Preserve publication boundary and saved-content parity                                                      |
| Health                                    | Anonymous database/Redis booleans and status                                                   | No private response fields found                                                                            |
| Account session                           | Anonymous-capable caller-only identity                                                         | Retain private/no-store headers; never enumerate accounts                                                   |
| Alert counts                              | Anonymous timestamp/counts; fixed unavailable error                                            | No alert labels, annotations or upstream payloads exposed                                                   |
| Topics/source catalog                     | Fresh admin required; legacy full rows                                                         | Replace with prepared allowlists/origin-only catalog, then promote GET/HEAD                                 |
| Profile/schedule                          | System-only schedule GET/HEAD is anonymous in public mode; legacy profile requires fresh admin | UI uses system endpoint with explicit private-mode 404 fallback                                             |
| Content/source health                     | Fresh admin required                                                                           | Wire origin-only article and count/timing source-health readers; keep window route restricted until audited |
| Detailed status                           | Fresh admin required                                                                           | Project stored source errors, job return strings and accounting fields before anonymous reads               |
| Preview history/detail/latest/cost/job    | Fresh admin required                                                                           | Separate public publication/accounting/progress views from unpublished/test snapshots                       |
| Admin page HTML                           | Unlisted, denied                                                                               | Expose approved read-only pages with safe API contracts and disabled writes                                 |
| Handbook/DB explorer/Grafana/jobs browser | Unlisted, denied                                                                               | Audit each tool response/data source and add bounded read-only routing                                      |
| Logs/metrics                              | Unlisted, denied even for signed-in admin                                                      | Add session-authorized tool routing; retain mutation restrictions                                           |

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
   Topics, sources, schedule, article origins and source-health readers already
   have isolated coverage. Replace overlapping legacy GET controllers in public
   mode; preserve private rollback and writes. Update API consumers for changed
   shapes, including aggregator origins and removal of the legacy profile wrapper.
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

Next available implementation step: promote the audited catalog reads and
continue status/preview/tool projections.
Phase 3 scheduled acceptance still precedes live Phase 4 activation. Migration
0019, public flags, proxy sharing and generation settings were unchanged here.
