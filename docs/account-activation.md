# Phase 3 activation checklist

Account migrations through 0018 and invite-only server/web account gates are
live (iteration 1591). Public mode remains disabled and the VM stays private.
Live lifecycle and owner two-device/proxy/TLS checks passed. The Nov 10
scheduled edition published with NBA story-validation fallback; assess that
degraded outcome before accepting Phase 3. See the
[daily review](edition-reviews/2026-11-10.md).
[The public-access plan](public-access-plan.md) defines acceptance and owner gates.

## Prerequisites

- Phase 1 passed the Nov 9 scheduled edition and reader comparison
  ([receipt](edition-reviews/2026-11-09.md#phase-1-scheduled-acceptance--iteration-1544)).
- Work outside 13:00–16:00 UTC. Preserve the edition-generation noon cutoff.
- Verify health, alerts, sources and digest jobs before starting.
- Proxy proof is accepted under STEERING 53: the Nov 9 19:47 UTC private
  receipt records a loopback peer and two stable appended entries after forged
  prefixes; the owner confirmed both entries match the visitor. Retain the
  last-entry selector. Explicit loopback peers (`127.0.0.1,::1`) are configured
  in the private environment; invite-only account gates are now enabled.
  Offline policy and real HTTP tests cover zero, one and two forged prefixes.
- Run `pnpm check`, `pnpm build` and the account browser smokes before deployment.
  Include `pnpm exec tsx scripts/smoke-account-code-lifecycle.ts` for the composed
  code-login flow over a temporary loopback HTTPS server, with isolated storage
  and admission. It covers the production HTTP adapter, browser cookie exchange,
  session lookup, daily cookie renewal, seven-day admin freshness, persistent
  reader access, two independent device cookies, device-scoped/all-device logout,
  revoked-cookie replay, expiry, exhaustion, code replay and cross-origin refusal.
  At the exact seven-day boundary, renewed cookies cannot issue links or revoke
  sessions; refused writes preserve fixture storage while reader sync still works.
  Admin-issued links also cross the real HTTPS boundary: fragment-only preview,
  exact expiry, explicit confirmation, secure session exchange and replay/reload
  refusal. Deletion rejects incorrect confirmation and cross-origin requests, then
  clears the calling cookie and refuses both devices and deletion replays. These
  checks use fixture storage and make no live account writes. Admin revocation
  also crosses composed HTTPS: two friend-device sessions are refused afterward,
  the issuer stays active, and ordinary readers cannot issue links or revoke sessions.
  Two independently authenticated devices also verify preference/bookmark sync,
  removal tombstones, stale-update refusal, cookie-derived reader isolation and
  sync refusal after all-device logout, using fixture persistence.
  The disposable Postgres/Redis HTTP check also deletes a reader with two active
  devices, saved choices, an unused code and an unused invitation. Both devices
  and outstanding credentials are refused afterward; mailbox cleanup and identity
  removal are verified without recreating the deleted reader through replay.
  Fixture browser checks are preparation; they do not replace live acceptance.

## Private configuration

Store values only in `~/.config/news-digest/env` (mode 600). Never paste their
contents into progress entries, command output, screenshots or logs.

| Setting                       | Activation value                                                   |
| ----------------------------- | ------------------------------------------------------------------ |
| `ACCOUNTS_ENABLED`            | `1`, only after the prerequisites and migration checks             |
| `SIGNUP_MODE`                 | `invite`; never `open` with the stand-in mailbox                   |
| `ACCOUNT_ORIGIN`              | `https://news-digest.exe.xyz`, exact origin without trailing slash |
| `ACCOUNT_SECRET_KEY`          | Stable 32 random bytes encoded as 64 hex characters                |
| `ACCOUNT_MAILBOX_PATH`        | Absolute private directory owned by the service user, mode 700     |
| `ACCOUNT_TRUSTED_PROXY_PEERS` | Comma-separated verified immediate IP peers; no guessed trust      |
| `ADMIN_EMAILS`                | Existing owner-approved allowlist; normalize addresses             |
| `VITE_READER_ACCOUNTS`        | `1` at web build time; independent of the server gate              |

The API and worker load the private env file through their user units. Vite
requires its account flag in the build environment; restarting the API alone
does not change the compiled reader panel. The non-secret flag is persisted in
the ignored `apps/web/.env.production.local` so ordinary production rebuilds
preserve the enabled panel. Keep `PUBLIC_MODE` unchanged.

## Migration and deployment

1. Take a fresh private backup. Rehearse on an isolated restore of that backup,
   with no network or provider credentials, before applying any live migration.
   Run `python3 ops/backups/rehearse_accounts.py`: it takes the fresh backup,
   restores it without network access and writes a private
   `~/backups/news-digest/account-migration-proof.json` receipt.
   The existing system-ownership rehearsal stops at 0012; use the account script
   for this phase before migrations 0013–0018 are applied. This pre-migration
   rehearsal requires those tables to be absent; after deployment, use the saved
   private receipt rather than rerunning it against a migrated backup.
2. Require a successful receipt from that run: the script invokes the real
   migration runner through `MIGRATE_THROUGH=0018_admin_write_admissions`
   twice, checks injected-failure rollback, unchanged original table fingerprints
   and migration-ledger idempotence, and confirms all eight account tables deny
   operational/PUBLIC readers. The disposable restore is removed automatically.
3. With accounts still disabled, apply the same bounded migration runner to live
   storage, loading database credentials privately. The command is `pnpm migrate`
   with the explicit stopping tag above. Do not run an unbounded migration.
   Completed Nov 9 (iteration 1590): six migrations applied, bounded rerun
   unchanged; eight empty tables deny PUBLIC and both operational reader roles.
   Private receipts: `account-migration-proof.json` and
   `account-live-migration-proof.json` in `~/backups/news-digest/`.
4. Enable the server gate and build the web app with its account flag. Restart
   `news-digest-api.service` using `systemctl --user`. Restart the worker only
   if worker code changes. Completed Nov 9 (1591): stable private key, exact
   origin, mode-700 mailbox and existing admin allowlist; public mode unchanged.
   Anonymous desktop/mobile light/dark browser checks pass without account writes.
   Check `/healthz`, alerts, source freshness and the saved scheduled reader.
5. Verify code login, admin-issued links, replay/expiry refusal, sync, sign-out,
   all-device revocation and deletion with dedicated acceptance identities.
   Verify an ordinary friend cannot issue links or revoke another reader.
   Inspect only credential-free response shapes; retain no codes, links or cookies.
   Deployed-loopback preflight: run
   `pnpm exec tsx scripts/check-live-account-boundary.ts`. Iteration 1592 passes
   32 checks for anonymous privileged writes, origin/content-type refusal,
   malformed login payloads and signed-out sessions without requesting credentials
   or changing accounts. This checks deployed handlers, not proxy/TLS behavior
   or authenticated lifecycle acceptance.
   Authenticated deployed-loopback acceptance: explicitly run
   `pnpm exec tsx scripts/check-live-account-lifecycle.ts --live`.
   This requests one owner admin code, reads it privately, issues invitations to
   a random reserved-domain reader and changes only that reader’s topic state.
   Iteration 1593 passes 30 checks: code/link login and replay refusal,
   two-device topic sync/stale refusal, ordinary-reader privilege refusal,
   all-device logout, deletion replay and mailbox cleanup. The disposable reader
   is deleted and the temporary owner session is signed out. Credentials never
   enter output. Iteration 1594 extends this to 31 checks: bookmark display copies sync to
   the second device; removal tombstones persist and reject stale-device replay.
   Iteration 1595 passes 41 checks: admin revocation removes both disposable
   reader sessions, both cookies lose sync access, one audit row is stored and
   the issuer stays active. The reader can sign in again and delete the account.
   Iteration 1596 adds desktop/mobile Chromium checks using real issued cookies
   seeded into isolated contexts: synced account panels, HttpOnly isolation and
   signed-out panels after admin revocation/reload. Requests reach the deployed
   local service through browser routing with the configured app origin and a
   synthetic visitor header; external embeds are blocked. Proxy/TLS cookie exchange and
   live link expiry still need acceptance before the owner check.
   Iteration 1597 adds a browser cookie-expiry check: only an isolated context's
   cookie lifetime is shortened. Chromium drops it, reload shows Sign in and
   sync returns 401; the same server session remains valid on another device.
   Server reader sessions intentionally have no expiry. This does not exercise
   the production 400-day cookie lifetime or code/link expiry.
   For a natural login-code expiry check, add `--wait-code-expiry` to the live
   lifecycle command. It waits ten minutes with the disposable reader’s unused
   code in memory, checks mailbox and HTTP refusal, then signs in with a fresh
   code. It reads only that reader’s challenge timestamps; expiry settings,
   clocks and stored challenges stay unchanged. Sign-in links last 24 hours
   and require a separate live expiry check. Run
   `pnpm exec tsx scripts/check-live-link-expiry.ts --live verify` after
   **2026-11-11 00:33:01 UTC**. Iteration 1599 issued an unredeemed disposable
   link with a verified 86,400-second lifetime; its mode-600 receipt lives at
   `~/.local/state/news-digest/link-expiry-acceptance.json`. An early verify
   reports pending without redeeming. After expiry it checks HTTP 401, no
   cookie, no reader identity and an unchanged unconsumed link. Keep the
   receipt private; do not rerun `prepare` over a pending receipt. Iteration 1598 passes all 52 live
   lifecycle checks with natural code expiry, no-cookie HTTP 401, surviving
   reader session and fresh-code recovery.
6. Owner two-device steps are ready in `NEEDS_FROM_HUMAN.md` (iteration 1600).
   Phase 3 also requires a normal scheduled edition with the account flag on.
   Record its reader/content checks, then ack Phase 3; Phase 4 follows.

## Owner two-device check — passed Nov 10

The owner reported two-browser sign-in and saved-item sync passed at about
03:50 UTC Nov 10, completing the proxy/TLS cookie check.
[Acceptance record](../NEEDS_FROM_HUMAN.md#owner-two-device-acceptance--passed-nov-10).
Phase 3 still needs the normal-edition decision above; natural link expiry runs
separately.

## Rollback

Set `ACCOUNTS_ENABLED=0` in the private environment and
`VITE_READER_ACCOUNTS=0` in the ignored production build file, then rebuild.
Restart the API outside the protection window (worker only if its code changes).
Confirm healthy reader routes and
normal job processing. Leave additive account tables and stored preferences
intact; do not drop tables, restore over live storage or rotate the account key.
A failed or abnormal scheduled edition takes priority: turn the newest flag off,
then diagnose under the public-access plan's breakage exception.
