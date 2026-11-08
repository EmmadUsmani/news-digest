# Prepared friend-link confirmation

`pnpm exec tsx scripts/smoke-account-confirmation.ts` starts an isolated loopback
server using the unregistered account HTTP adapter. Redemption responses and the
digest destination are fixtures; these images do not show live accounts.

- Desktop: [confirmation](link-confirmation-desktop.png)
- Mobile: [confirmation](link-confirmation-mobile.png)

The browser check verifies disabled routing, GET/HEAD previews, fragment removal,
no redemption before a click, explicit POST, success navigation, rejected replay
and missing-token reload behavior. No live service, database or provider is used.
