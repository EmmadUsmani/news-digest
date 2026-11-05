# Admin access foundation

The owner-approved UI spec requires server-side admin access and local script
access. The middleware runs before static files and tool routing. It protects
reserved `/admin` and `/api/admin` paths and supplies uncached `/api/me`.
Existing operational routes and tools are not yet migrated or protected by this
middleware. The app remains private under exe.dev's existing access control.

## Identity

- Compare `X-ExeDev-Email` with comma-separated `ADMIN_EMAILS`, ignoring case
  and surrounding whitespace; no domain or substring matching.
- Local scripts may send `ADMIN_LOCAL_TOKEN`, compared with the env secret of
  the same name using a constant-time comparison for equal-length values.
- Token access requires a loopback socket and no `Forwarded` or `X-Forwarded-*`
  headers. Socket locality alone never grants access.
- No configured email or token means no admin access. No secrets were created
  or owner email inferred in this step.

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
The existing browser still uses the old endpoints. Archive pagination and the
coordinated admin route migration remain unfinished.

## Next rollout slice

Configure the owner email allowlist before moving current operational routes.
Migrate those endpoints, browser calls and local scripts together; gate tool
paths and return reader-only edition payloads. Keep the reader working during
that migration. The current foundation is not the completed admin milestone.
