# Admin access foundation

The owner-approved UI spec requires server-side admin access and local script
access. The middleware runs before static files and tool routing. It protects
reserved `/admin` and `/api/admin` paths and supplies uncached `/api/me`.
Identity GET and HEAD requests (including the trailing-slash path) share
uncached JSON headers; HEAD has no body. Other methods receive uncached 405
with `Allow: GET, HEAD` rather than falling through to the SPA.
Protected `/api/admin/*` aliases now serve topics, profile, status, content
and digest previews through the existing controllers. Legacy operational routes
and tools remain available during the coordinated migration. The app remains private under exe.dev's existing access control.

Admin responses use `Cache-Control: no-store` and vary on both identity
headers, including successful pages, API reads/writes and downstream errors.
Reader routes keep their own caching policy.

## Identity

- Compare `X-ExeDev-Email` with comma-separated `ADMIN_EMAILS`, ignoring case
  and surrounding whitespace; no domain or substring matching.
- Local scripts may send `ADMIN_LOCAL_TOKEN`, compared with the env secret of
  the same name using a constant-time comparison for equal-length values.
- Token access requires a loopback socket and no `Forwarded` or `X-Forwarded-*`
  headers. Socket locality alone never grants access.
- No configured email or token means no admin access. A random local token is installed in the private env file; the owner email
  allowlist remains unconfigured.

## Proxy investigation, November 5

Read the documented [proxy](https://exe.dev/docs/proxy.md) and
[authentication](https://exe.dev/docs/login-with-exe.md) behavior. The proxy adds
`X-Forwarded-*` and authenticated `X-ExeDev-*` headers. The documentation does
not establish the socket source seen inside this VM or explicitly guarantee
replacement of client-supplied identity headers.

A request from this VM to `https://news-digest.exe.xyz/healthz` failed to connect
(curl exit 7); no proxied request reached the app for observation. Therefore
loopback was **not** established as safe and is never an automatic bypass.
Authenticated proxy origin and forged-header replacement checks remain open.
Before making the VM public, verify the proxy strips/replaces a forged
`X-ExeDev-Email`; never treat the local tests as evidence of that behavior.

## Live gate verification

Run `pnpm exec tsx scripts/smoke-admin-gate.ts` against the local deployment.
It checks GET/HEAD denial for the reserved admin pages and API aliases,
case/encoded paths, uncached anonymous identity, invalid credentials and direct
local script access. Valid local tokens with any `Forwarded` or tested
`X-Forwarded-*` header must receive 404, including empty header values.
Requests are read-only, credentials stay in Node, redirects fail, and the saved
reader edition must remain unchanged. This does not test exe.dev's replacement
of client-supplied identity or the still-unmigrated legacy/tool routes.

## Reader payload preparation

`/api/editions/latest` and `/api/editions/:id` use shared allowlist schemas
to return briefs, stories and posts without operational metadata. Missing
historical briefs and posts become empty arrays; non-AI briefs are omitted.
`/api/editions?offset=0` exposes stable 20-entry archive pages with only IDs
and dates, plus `hasMore`. Browser history now uses this reader endpoint and
omits generation methods. Browser edition detail also uses the reader endpoints;
its stories and posts render without scores, selection reasons or editorial
diagnostics. The coordinated admin route migration remains unfinished.

## Local operations scripts

`pnpm obs sources`, `pnpm obs jobs` and the edition timing report use
`/api/admin/status`. The timing report also reads protected digest previews;
the Bluesky coverage report reads protected topics.
The Bluesky probe reads protected topics, and Grafana checks read protected
status for schedule and completed-job comparisons.
Each script reads its local token from the private env file only for protected
API requests to `http://127.0.0.1:8000`. Credentialed requests refuse redirects.
Health, alerts, logs and metrics retain their existing read-only endpoints.
Schedule recovery also reads and restores through protected profile endpoints.
It normalizes localhost requests to the token adapter’s fixed loopback origin,
while preserving the saved target for compatibility with older recovery records.
No legacy-route fallback is used for protected requests.
The saved-post browser verifier uses only the reader edition API and needs no
admin credentials; its link, timestamp and text checks match the public contract.

Topic create/delete/reorder/availability and schedule browser replays read their live baselines and final
immutability checks through protected Node requests with a 15-second timeout.
Their browser writes stay in memory, and the browser receives no local token.
The schedule and availability replays also snapshot content/status in Node, disable service workers,
prove unexpected writes are blocked and check failed-save recovery on both viewports.
Availability also verifies disabled/enabled state survives replay reloads and
compares the full saved edition, topics and profile after both viewports.

The status browser verifier reads protected status and source-catalog snapshots in
Node, then replays the real status snapshot for rendering and refresh checks.
Synthetic failure responses remain browser-only; no token enters the browser.
AI-spend and topic-coverage browser checks also replay protected status snapshots
read in Node, including the parked Reddit display. Coverage and X-schedule guidance
checks disable service workers, block browser writes with an explicit probe,
check credential absence and confirm full saved-edition immutability. Manual-reserve, scheduled-reserve
and run-duration checks use the same protected snapshot pattern; budget, job
and timing variants remain browser-only replays.

Reviewed X-account and parked-Reddit community settings checks also read protected
Node snapshots and verify live topics remain unchanged. Account rendering uses
replayed snapshots; community writes remain browser-only, with no Reddit calls.

The shared-query browser check reads protected content, topic, profile and status
snapshots in Node and replays them through context routes. Page-level malformed
responses can be removed to recover the original snapshot without legacy reads.

The source-connection browser check also replays protected topic, source catalog
and incoming-content snapshots. Save failures, retries, reload and disconnect
stay in the browser; unexpected API writes are blocked. It no longer creates
live topics, generates editions or deletes database rows directly.

The custom-feed browser check also uses protected topic/catalog/content snapshots.
Validation and failure responses, retries, reload and disconnect are browser-only;
it never creates topics, connects a live publisher or waits for collection.
Server URL validation remains covered by isolated API tests.

The X-account editing check reads protected topic/edition snapshots in Node.
Its disabled topic and saves exist only in browser replay memory; duplicate
handles are rejected before a request, and unexpected API writes are blocked.
Server account validation remains covered by isolated settings tests.

The general topic-editing check now uses protected topic/edition snapshots.
Name, story budget, relevance and enabled-state saves/reloads stay in browser
memory; it creates no previews and blocks unexpected API writes. Server
validation and generated-budget behavior remain covered by isolated tests.

The handbook verifier also reads `/docs` pages, assets and API responses and
`/db/api/schema` through the fixed loopback credential adapter. Playwright
receives only the response bodies; credentials stay in Node. Redirects fail,
and non-local `APP_URL` values are rejected. Tool access is still awaiting
the coordinated route migration.

The async-edition browser check reads protected content, topics, profile and
status snapshots in Node. Job submission, progress, reconnect, completion and
failure stay in browser replay memory. It blocks unexpected browser writes,
checks that no credentials reach the browser, and verifies the full saved
edition, topics and profile remain unchanged.

The queue browser verifier reads queue APIs, pages and assets through the fixed
loopback credential adapter in Node. Playwright receives response bodies only;
browser writes are blocked and the saved edition must remain unchanged. The
shared queue checker uses the same adapter and still verifies the server's
405 mutation barrier without a mutation payload. Queue tool gating remains
part of the coordinated rollout.

The topic-edit browser verifier also replays protected operational snapshots,
blocks unexpected writes and browser credentials, and compares the complete
saved edition, topics and profile after failed-save/retry checks. The topic-create
verifier applies the same protections to failed creation, retry and reload.
The topic-delete verifier also checks cancellation, failure, retry and reload
with these protections and full saved-data comparisons. The topic-order verifier
uses the same protections for failed reorder, retry, saved positions and reload.

The X-account verifier applies the same protections to failed saves, retained
handles, retry, normalization, duplicate prevention and reload.

The source-connection verifier also replays operational snapshots, blocks service
workers and browser writes, probes the write guard and checks credential absence.
Failed selections, retry, stored incoming content, reload and disconnect preserve
full live edition, topic and profile snapshots.

The news-query verifier uses these protections for validation errors, failed
connections, retained input, retry, reload and disconnect, with full saved-data
comparisons and desktop/mobile failure screenshots.

The status verifier replays protected operational snapshots, blocks service workers
and unexpected browser writes, probes the write guard and checks credential absence.
Desktop/mobile refresh failure and retry, saved-edition links and synthetic
operational failures preserve full live edition, topics and profile snapshots.

## Next rollout slice

Configure the owner email allowlist before moving current operational routes.
Migrate those endpoints, browser calls and local scripts together; gate tool
paths and return reader-only edition payloads. Keep the reader working during
that migration. The current foundation is not the completed admin milestone.
