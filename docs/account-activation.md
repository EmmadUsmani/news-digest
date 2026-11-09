# Phase 3 activation checklist

This is the deployment checklist for the prepared account implementation, not an
activation receipt. Accounts are disabled. Keep the VM private throughout.
[The public-access plan](public-access-plan.md) defines acceptance and owner gates.

## Prerequisites

- Accept Phase 1 only after its normal scheduled edition and reader comparison.
- Work outside 13:00–16:00 UTC. Preserve the edition-generation noon cutoff.
- Verify health, alerts, sources and digest jobs before starting.
- Prove the live proxy immediate peer and appended client-address behavior,
  including a forged forwarding prefix, using only documented exe.dev access.
  Record the observed peer without retaining client addresses or identity headers.
  If that proof cannot be obtained, leave accounts disabled.
  Run `pnpm exec tsx scripts/probe-account-proxy.ts 8765` on an unused port,
  then open its printed private alternate-port URL in an authenticated browser
  and click **Run check once**. The five-minute temporary server reports only
  the immediate peer and three preserved-prefix/final-client checks; it never
  configures trust. Confirm the connection uses the documented exe.dev HTTPS
  proxy before treating its receipt as live proof. No client addresses, identity
  headers or cookies are recorded. A refused check requires a fresh probe.
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
does not change the compiled reader panel. Keep `PUBLIC_MODE` unchanged.

## Migration and deployment

1. Take a fresh private backup. Rehearse on an isolated restore of that backup,
   with no network or provider credentials, before applying any live migration.
   Run `python3 ops/backups/rehearse_accounts.py`: it takes the fresh backup,
   restores it without network access and writes a private
   `~/backups/news-digest/account-migration-proof.json` receipt.
   The existing system-ownership rehearsal stops at 0012; use the account script
   for this phase while migrations 0013–0017 are still pending.
2. Require a successful receipt from that run: the script invokes the real
   migration runner through `MIGRATE_THROUGH=0017_reader_session_revocation`
   twice, checks injected-failure rollback, unchanged original table fingerprints
   and migration-ledger idempotence, and confirms all seven account tables deny
   operational/PUBLIC readers. The disposable restore is removed automatically.
3. With accounts still disabled, apply the same bounded migration runner to live
   storage, loading database credentials privately. The command is `pnpm migrate`
   with the explicit stopping tag above. Do not run an unbounded migration.
4. Enable the server gate and build the web app with its account flag. Restart
   `news-digest-api.service` and `news-digest-worker.service` using `systemctl --user`.
   Check `/healthz`, alerts, source freshness and the saved scheduled reader.
5. Verify code login, admin-issued links, replay/expiry refusal, sync, sign-out,
   all-device revocation and deletion with dedicated acceptance identities.
   Verify an ordinary friend cannot issue links or revoke another reader.
   Inspect only credential-free response shapes; retain no codes, links or cookies.
6. Add the owner check below to `NEEDS_FROM_HUMAN.md` when the live flow is ready.
   Phase 3 also requires a normal scheduled edition with the account flag on.
   Record its reader/content checks, then ack Phase 3; Phase 4 follows.

## Owner two-device check, once ready

1. Open the private site on two devices. On each, choose Sign in and request a
   code for the same owner email; retrieve and use each code before requesting
   the next, because the mailbox keeps only the latest code for that email.
2. Retrieve a code explicitly on the owner terminal with
   `ssh news-digest.exe.xyz 'cd ~/news-digest && pnpm exec tsx scripts/read-login-mailbox.ts /absolute/mailbox/path reader@example.com'`,
   replacing the path and email with the configured values. Do not record output.
3. On device A, save a story and hide a topic. Reload device B and verify both
   choices arrive. Save a post on B and reload A to verify the reverse direction.
4. Reload both devices and verify persistence. Sign out of all devices on A;
   reload B and verify it is signed out. Report pass/fail without credentials.

## Rollback

Set `ACCOUNTS_ENABLED=0`, rebuild with `VITE_READER_ACCOUNTS=0`, and restart
API/worker outside the protection window. Confirm healthy reader routes and
normal job processing. Leave additive account tables and stored preferences
intact; do not drop tables, restore over live storage or rotate the account key.
A failed or abnormal scheduled edition takes priority: turn the newest flag off,
then diagnose under the public-access plan's breakage exception.
