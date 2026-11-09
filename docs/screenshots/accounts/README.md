# Prepared friend-link confirmation

`pnpm exec tsx scripts/smoke-account-confirmation.ts` starts an isolated loopback
server using the gated account HTTP adapter. Redemption responses and the
digest destination are fixtures; these images do not show live accounts.

- Desktop: [confirmation](link-confirmation-desktop.png)
- Mobile: [confirmation](link-confirmation-mobile.png)

The browser check verifies disabled routing, GET/HEAD previews, fragment removal,
no redemption before a click, explicit POST, success navigation, rejected replay
and missing-token reload behavior. No live service, database or provider is used.

## Prepared email-code sign-in

`pnpm exec tsx scripts/smoke-account-login.ts` runs the gated login page on an
isolated loopback server with fixture HTTP responses, without live accounts.

- Desktop: [code sign-in](code-login-desktop.png)
- Mobile: [code sign-in](code-login-mobile.png)

The browser check covers disabled routing, CSP, no preview writes, code requests,
refused codes, retry, keyboard redemption, success navigation and URL/storage privacy.

## Prepared reader account panel

`pnpm exec tsx scripts/smoke-reader-account.ts` exercises isolated fixture state
and actions, including sign-in, sync failure/retry, both sign-out actions, busy
controls, typed deletion confirmation, refusal and cancellation, and the disabled gate. The live reader keeps the account flag off.

- [Desktop account panel](reader-account-1440.png)
- [Mobile account panel](reader-account-390.png)

## Gated reader header integration

`pnpm exec tsx scripts/smoke-reader-account-integration.ts` checks actual reader
and saved-item headers with fixture account HTTP and saved edition content.
Successful deletion clears local account choices on both screen widths.
The deployed default-off reader makes no account requests.

- [Desktop header](reader-header-1440.png)
- [Mobile header](reader-header-390.png)

## Prepared admin invitations

The account-panel fixture check also verifies admin-only invitation creation,
refusal/retry, one-time fragment-link display and dismissal. No real invites
are issued or sent.

- [Desktop invite](admin-invite-1440.png)
- [Mobile invite](admin-invite-390.png)

## Prepared admin reader sign-out

Desktop/mobile fixtures verify admin-only access, target-change confirmation
reset, refusal/retry and removed-session counts (including zero). No live
sessions are revoked.

- [Desktop reader sign-out](admin-revoke-1440.png)
- [Mobile reader sign-out](admin-revoke-390.png)

## Composed HTTPS sign-in links

Real account handlers and browser HTTPS with fixture storage verify admin-issued
links, preview without redemption, expiry, secure cookies and replay refusal.
These checks make no live account writes.

- [Desktop replay refusal](link-composed-replay-1280.png)
- [Mobile replay refusal](link-composed-replay-390.png)
