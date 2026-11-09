# Private live account entry

Run `pnpm exec tsx scripts/smoke-live-account-entry.ts` against the deployed app.
The check opens the Account panel and sign-in page, verifies the anonymous
no-store session response and records desktop/mobile light/dark screenshots.
It requests no codes and makes no account writes. It does not sign in.

- `live-entry-{desktop,mobile}-{light,dark}.png`: served reader account panel.
- `live-login-{desktop,mobile}-{light,dark}.png`: served code-login page.

These are live anonymous pages, separate from the fixture lifecycle screenshots.
