# Admin access foundation

The owner-approved UI spec requires server-side admin access and local script
access. The middleware runs before static files and tool routing. It protects
reserved `/admin` and `/api/admin` paths and supplies uncached `/api/me`.
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

The status browser verifier reads protected status and source-catalog snapshots in
Node, then replays the real status snapshot for rendering and refresh checks.
Synthetic failure responses remain browser-only; no token enters the browser.
AI-spend and topic-coverage browser checks also replay protected status snapshots
read in Node, including the parked Reddit display.

## Next rollout slice

Configure the owner email allowlist before moving current operational routes.
Migrate those endpoints, browser calls and local scripts together; gate tool
paths and return reader-only edition payloads. Keep the reader working during
that migration. The current foundation is not the completed admin milestone.
