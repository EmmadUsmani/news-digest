## 2026-11-09: iteration 1458 — stored HTTP multi-device admin revocation acceptance

- Clean main/no leftovers; health/alerts clear, all 36 sources healthy, digest queue zero failures. Phase 1 still awaits Nov 9 15:00 UTC; accounts disabled, migration 0017 unapplied and VM private.
- Extended disposable Postgres/Redis acceptance through the installed HTTP route: two independent target sessions, non-admin refusal preserving both, count-only uncached success without cookie renewal, immediate session-discovery/sync refusal on both devices, and fresh sign-in restoring the target's saved preferences. Existing cross-runtime revocation then removes the new session and repeats with zero count; issuer and unrelated reader survive.
- Test-only change; no live account writes, migration, provider calls, email or UI changes. Direct public HTTPS probe could not connect from this VM; live proxy peer/forged-prefix proof remains pending. No trust configuration changed.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `check-scheduled-reader.ts 2026-11-08T15:00:00Z` and `git diff --check`. Full check passes: 701 unit passes, 254 integration passes/four expected skips; build passes. Saved reader retains four topics/19 stories/17 posts. Commit/push followed by API/worker restart and health/reader/alert checks.
- Next: normal scheduled Phase 1 acceptance, live proxy verification and remaining Phase 3 activation checks; owner two-device acceptance remains open.

## 2026-11-09: iteration 1459 — account flow log hygiene acceptance

- Clean main/no leftovers; initial health/alerts clear, all 36 sources healthy and digest queue zero failures. Accounts disabled, migration 0017 unapplied, VM private; scheduled acceptance awaits 15:00 UTC.
- Stored HTTP/Postgres/Redis acceptance now captures six console methods through code login, links, replay refusal, sync, revocation, logout and deletion and requires zero calls. HTTP failure acceptance separately verifies no logs when a credential-bearing exception occurs; assertions expose counts only, never captured arguments.
- Test-only change; no live account writes, migrations, provider calls, email or UI change. Updated rollout evidence and TASKS; archived iterations 1444–1445 to keep this log small.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check and `git diff --check` pass. 701 unit passes, 254 integration passes/four expected skips. Saved Nov 8 edition retains four topics/19 stories/17 posts. Corrected unsupported jobs CLI options; final jobs snapshot confirms zero digest failures.
- Commit/push then API/worker restart and health/reader/alerts checks. Next: normal Phase 1 scheduled acceptance, live proxy proof and remaining Phase 3 activation checks; owner two-device acceptance remains open.

## 2026-11-09: iteration 1460 — complete account-table reader privacy acceptance

- Clean main/no leftovers; health and alerts clear, sources healthy, digest queue zero failures and next normal run queued for 15:00 UTC. Accounts disabled; account migrations unapplied and VM private.
- Extended isolated schema acceptance to recreate login challenges alongside the other six account tables under broad default SELECT grants. Both operational reader roles and an unrelated PUBLIC-only role have no SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER privileges; actual SELECTs fail for every table. Transaction rolls back all rehearsal tables, roles and defaults.
- Test-only change with rollout evidence updated; no live migrations, account writes, provider calls or email. Documented proxy behavior reviewed; direct public HTTPS probe still cannot connect from this VM, so live peer/forged-prefix proof remains open.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm obs sources --check`, saved-reader check and `git diff --check` pass. Full check: 701 unit passes, 254 integration passes/four expected skips. Saved Nov 8 edition retains four topics/19 stories/17 posts.
- Commit/push then restart API/worker and recheck health, reader and alerts. Next: 15:00 UTC Phase 1 scheduled acceptance, live proxy proof and remaining Phase 3 activation checks; owner two-device acceptance remains open.

## 2026-11-09: iteration 1461 — Phase 3 activation and rollback checklist

- Clean main/no leftovers; health/alerts clear, all 36 sources healthy, digest queue zero failures and normal 15:00 UTC run queued. Accounts remain disabled and VM private.
- Added a concrete activation checklist: prerequisites, exact private configuration names, separate server/web gates, bounded 0017 migration, owner two-device steps and additive rollback. Linked it from the rollout plan and made the missing account-specific fresh-restore rehearsal explicit in TASKS; existing system rehearsal stops at 0012 and cannot satisfy it.
- Documentation only; no account writes, migrations, provider calls, email or settings changes. Owner check is staged in the checklist; no request for human action until the live flow is ready.
- Verification: configuration/migration tag checked against runtime/runner; local links and `git diff --check` pass. `pnpm build` and saved-reader check pass (four topics/19 stories/17 posts). `pnpm format`, `pnpm lint:fix` and `pnpm check` pass: 701 unit passes, 254 integration passes/four expected skips.
- Next: prepare account-specific fresh-backup restore rehearsal; Phase 1 normal scheduled acceptance and live proxy proof still gate activation. Commit/push followed by API/worker restart and health/reader/alerts checks.

## 2026-11-09: iteration 1462 — fresh-backup account migration rehearsal

- Clean main/no leftovers; health/alerts clear, all 36 sources healthy, digest queue zero failures and normal 15:00 UTC run queued. Accounts remain disabled and VM private.
- Added `python3 ops/backups/rehearse_accounts.py`: fresh private snapshot, networkless disposable Postgres/private Unix socket, sanitized runner environment, bounded 0013–0017 migrations, injected transaction rollback, actual runner twice and migration-ledger idempotence. No live account migration or provider calls.
- Executed successfully: backup restores 31 tables/57,555 rows; all 30 original application-table fingerprints unchanged. Seven account tables deny all seven table privileges and actual SELECTs for both operational readers and a PUBLIC-only role despite broad default grants. Scratch container removed; private receipt mode 600 in `~/backups/news-digest/account-migration-proof.json`.
- Updated activation checklist, rollout plan, backup handbook and TASKS; archived iterations 1446–1447 to keep this log small. Live proxy proof and normal Phase 1 scheduled acceptance still gate activation.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `python3 -m py_compile ops/backups/rehearse_accounts.py`, saved-reader check and `git diff --check`. Full check passes: 701 unit and 254 integration passes/four expected skips. Initial check stopped on archived-progress formatting; formatted and reran. Handbook check: 18 pages/zero diagrams, existing unapplied-account metadata warnings only. Saved reader: four topics/19 stories/17 posts.
- Commit/push followed by API/worker restart and health/reader/alert checks. Next: normal 15:00 UTC Phase 1 acceptance, live proxy proof and remaining account activation checks; owner two-device acceptance stays gated.

## 2026-11-09: iteration 1463 — verify proxy admission on the HTTP wire

- Clean main/no leftovers; health and alerts clear, all 36 sources healthy. Normal Phase 1 scheduled acceptance still awaits 15:00 UTC; accounts remain disabled.
- Added actual loopback HTTP checks for Node's raw forwarding headers: three forged prefixes cannot alter the final client, duplicate mixed-case fields fail closed, malformed/missing final clients fail closed, and untrusted socket peers never admit forwarded clients.
- This is isolated transport acceptance, not live exe.dev proxy proof; no account activation, migrations, credentials, provider calls or UI change. The live proxy gate remains open.
- Verification: targeted proxy tests pass (3/3); `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build` and `git diff --check` run before commit. Full check: 702 unit/254 integration passes, four expected skips. Corrected missing test Host header and lint rejection typing before rerunning.
- Commit/push followed by API/worker restart and health/alerts/saved-reader checks. Next: normal scheduled Phase 1 acceptance, live proxy proof and account activation prerequisites.

## 2026-11-09: iteration 1464 — unfinished account upload acceptance

- Clean main/no leftovers; health and alerts clear, all 36 sources healthy. Phase 1 still awaits the normal 15:00 UTC edition; accounts remain disabled.
- Added real HTTP regression coverage for unfinished chunked uploads exceeding the login 2 KiB and sync 16 MiB limits. Both receive 413 without waiting for upload completion or invoking account handlers; no runtime fix needed.
- No live account writes, migrations, provider calls, email, proxy trust changes or UI changes. Archived iterations 1448–1449 to keep this log small.
- Verification: targeted account HTTP tests pass (3/3); `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check and `git diff --check` pass. Full suite: 703 unit passes, 254 integration passes/four expected skips. Saved reader retains four topics/19 stories/17 posts. Commit/push followed by API/worker restart and health/alerts checks.
- Next: normal Phase 1 scheduled acceptance, live proxy proof and account activation prerequisites. Accounts stay disabled until those gates pass.

## 2026-11-09: iteration 1465 — reject declared oversized account uploads early

- Clean main/no leftovers; health and alerts clear, all 36 sources healthy, no recent worker errors and the normal 15:00 UTC digest queued. Accounts remain disabled.
- Account HTTP now rejects an oversized Content-Length before reading the body; actual streamed-byte limits still apply independently (2 KiB login, 16 MiB sync). Real HTTP tests send only one byte of each declared oversized upload and receive 413 without invoking handlers; unfinished chunked coverage remains.
- No UI, migrations, live account writes, provider calls or proxy trust changes. Phase 1 scheduled acceptance and live proxy proof still gate activation.
- Verification: targeted account HTTP tests (3/3), `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` and saved-reader check. Full check: 703 unit passes and 254 integration passes/four expected skips. Saved reader: four topics/19 stories/17 posts.
- Commit/push followed by API/worker restart and health/alerts/saved-reader checks. Next: normal 15:00 UTC acceptance and live proxy proof before account activation.

## 2026-11-09: iteration 1466 — reject invalid account headers before uploads

- Clean main/no leftovers; alerts clear and API/worker healthy. Saved Nov 8 reader retains four topics/19 stories/17 posts; normal Phase 1 acceptance still awaits 15:00 UTC.
- Account HTTP now checks the existing exact Origin/JSON policy before reading any POST body. Missing or invalid headers return 400 immediately; handlers retain their independent boundary checks.
- Real HTTP checks leave chunked login/sync uploads unfinished and verify all eight invalid/missing Origin/Content-Type combinations return 400 without calling account operations. Existing declared/chunked size checks remain green.
- Accounts remain disabled. No UI, migrations, live account writes, provider calls or proxy trust changes; scheduled acceptance and live proxy proof still gate activation. Archived iterations 1450–1451 to keep this log small.
- Verification: targeted account HTTP tests (4/4), `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` and saved-reader check. Full check: 704 unit passes, 254 integration passes/four expected skips. Commit/push followed by API/worker restart and health/alerts checks.
- Next: normal 15:00 UTC Phase 1 acceptance and live proxy proof before account activation.

## 2026-11-09: iteration 1467 — private proxy verification diagnostic

- Clean main/no leftovers; health, alerts, source and job checks pass. Normal Phase 1 scheduled acceptance still awaits 15:00 UTC; accounts remain disabled.
- Added a temporary five-minute diagnostic on a documented private alternate port. Its authenticated-browser flow checks the baseline and three forged forwarding prefixes using the actual admission parser; receipts contain only the observed socket peer and booleans/counts, never client addresses or identity headers. No trust configuration is written.
- Ordered single-use checks fail closed for missing/overwritten/changed forwarding. Client comparison stays in memory and is cleared on completion/refusal; the process closes after a receipt or timeout. Updated activation instructions and recorded the pending live proof.
- Live HTTPS attempt: `curl https://news-digest.exe.xyz/healthz` cannot connect from this VM. Local tests and the browser smoke simulate forwarding; neither is live proxy proof. No account activation, migrations, provider calls or sharing changes.
- Verification: two targeted HTTP tests and `pnpm exec tsx scripts/smoke-account-proxy-probe.ts` pass; inspected `docs/screenshots/accounts/proxy-probe-fixture.png`. Format, lint fix, full `pnpm check` (706 unit/254 integration passes; four expected skips), build, diff and saved-reader checks pass (four topics/19 stories/17 posts). Handbook check passes with existing pending-account-table notices.
- Next: normal 15:00 UTC Phase 1 acceptance and authenticated live proxy proof before activation. Commit/push followed by API/worker restart and health/alerts checks.

## 2026-11-09: iteration 1468 — account expiry after slow uploads

- Clean main/no leftovers; health and alerts clear, all 36 sources healthy, jobs pass and no recent worker errors. Normal Phase 1 scheduled acceptance still awaits 15:00 UTC.
- Fixed account write validation using a timestamp captured before reading the body. Expiry and admin freshness now use the time after the complete bounded upload, so a slow transfer cannot redeem against its earlier arrival time.
- Added real loopback HTTP regression with a controlled clock: start a valid request, advance beyond code expiry during transfer, finish the body and require 401/no session cookie. It fails on the previous implementation and passes with the fix.
- Verification: targeted HTTP tests 5/5; `pnpm format`, `pnpm lint:fix`, `pnpm check` (707 unit and 254 integration passes/four expected skips), `pnpm build`, `git diff --check` and saved-reader check pass (four topics/19 stories/17 posts).
- Accounts remain disabled; no UI, migration, live account write, provider call or proxy configuration change. Commit/push followed by API/worker restart and health/alerts/saved-reader verification.
- Next: normal 15:00 UTC Phase 1 scheduled acceptance and live authenticated proxy proof before account activation.

## 2026-11-09: iteration 1469 — account activation browser readiness

- Clean main/no leftovers; health and alerts clear, all 36 sources healthy. Phase 1 scheduled acceptance still awaits 15:00 UTC; accounts remain disabled and VM private.
- Ran all four account browser smokes together against the current activation candidate: code login, fragment-link confirmation, account controls and mounted-reader integration pass at desktop/mobile widths. Responses are fixture accounts; mounted reader uses the real saved edition. No live account writes or provider calls.
- Verified disabled deployed UI makes no account requests; fixture flows cover refusal/retry, explicit exchange, replay, sync, sign-out and deletion. Inspected refreshed deletion screenshots and mobile mounted-reader screenshot. No product code changed.
- Saved reader retains four topics/19 stories/17 posts. Archived iterations 1452–1453 to keep this log small.
- Verification: all four `pnpm exec tsx scripts/smoke-*.ts` account commands above; `pnpm format`, `pnpm lint:fix`, `pnpm check` (707 unit/254 integration passes; four expected skips), `pnpm build`, `check-scheduled-reader.ts 2026-11-08T15:00:00Z` and `git diff --check` pass. Commit/push followed by API/worker restart and health/alerts checks.
- Next: normal Nov 9 15:00 UTC scheduled acceptance, then live authenticated proxy proof before activation; fixture browser results do not replace either gate.

## 2026-11-09: iteration 1470 — natural compaction evidence

- Owner value: replaces an indefinite wait for compaction with confirmed natural-load evidence and a precise remaining recovery gap.
- Clean main/no leftovers; health, Grafana, 14 services, all 36 sources, jobs and alerts pass; next digest remains 15:00 UTC.
- Journal confirms Nov 8 17:48 natural 49,279,202-row merge in 164.103 s under unchanged 2% CPU trial; zero restarts. No forced merge, provider calls or settings changes.
- Eight uncached stored-history queries cover Nov 8 11:26–Nov 9 04:26 (2,041 points/series); metrics scrape samples one, admission hits two, queue timeouts/slow queries zero. Resource window shows stack ≤686.8 MiB/2.361% five-minute CPU.
- Recovery stays open: historical evaluator counters/per-rule health unavailable. Current `sample-metrics-recovery.ts 1 30` passes 23 rules/four probes ≤0.833 s/zero new errors or misses. Next passive check ≥05:27 UTC.
- Updated capacity decision and TASKS; accounts still disabled awaiting scheduled acceptance/live proxy proof. No product or schema change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (707 unit/254 integration passes, four expected skips), `pnpm build`, `git diff --check` and saved-reader check (four topics/19 stories/17 posts) pass. Commit/push and API/worker restart followed by health/alerts checks.

## 2026-11-09: iteration 1471 — two-device browser sync acceptance

- Clean main/no leftovers; health, 14 services, all 36 sources and jobs pass, alerts clear; next normal digest is 15:00 UTC. Metrics check not due until 05:27 UTC.
- Extended mounted-reader browser acceptance with independent desktop/mobile contexts sharing only fixture account transport: desktop bookmark downloads to mobile, mobile removal downloads to desktop, removal tombstone persists and neither device resurrects it after navigation/reload.
- Uses the real saved edition with fixture accounts; no live account writes, migrations, provider calls or product changes. Inspected new mobile saved-item screenshot. Accounts remain disabled.
- Verification: `pnpm exec tsx scripts/smoke-reader-account-integration.ts`, format, lint fix, full check, build, diff check and `check-scheduled-reader.ts 2026-11-08T15:00:00Z` (four topics/19 stories/17 posts). 707 unit and 254 integration passes/four expected skips. Archived iterations 1454–1455; API/worker restart follows push.
- Next: Phase 1 normal 15:00 scheduled acceptance and authenticated live proxy proof before activation; owner's real two-device test remains required.

## 2026-11-09: iteration 1472 — composed browser code lifecycle

- Clean main/no leftovers; health and alerts clear. Phase 1 awaits the normal 15:00 UTC edition; metrics probe not due before 05:27 UTC.
- Added `smoke-account-code-lifecycle.ts`: desktop/mobile login page and CSP call real account handlers/composition, keyed code hashing, private stand-in mailbox and session-token generation through a browser route bridge. Repositories/admission are isolated fixtures.
- Exact ten-minute expiry refuses authentication; a new code sets an HttpOnly/Secure/SameSite=Lax host cookie that authenticates through the real session handler; consumed-code replay refuses a new cookie. Inspected mobile refusal screenshot.
- No live account writes, provider calls, migration or product behavior change. Live HTTP/proxy proof and owner two-device acceptance remain separate gates; accounts stay disabled.
- Verification: composed browser smoke, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check and `git diff --check` pass; 707 unit/254 integration tests pass, four expected skips. Saved reader retains four topics/19 stories/17 posts.
- Next: normal 15:00 Phase 1 scheduled acceptance and live proxy proof before activation. Commit/push followed by API/worker restart and health/alerts verification.

## 2026-11-09: iteration 1473 — browser code exhaustion and recovery

- Clean main/no leftovers. Health and alerts pass; all 36 sources healthy, no failed user services. Normal scheduled acceptance remains due at 15:00 UTC; metrics probe not due before 05:27 UTC.
- Extended composed desktop/mobile login browser check: five incorrect guesses each clear the input and issue no cookie; the correct exhausted code is refused without another attempt. Requesting a replacement restores secure authenticated login.
- Real account handlers/crypto/private stand-in mailbox with fixture repositories and admission only; no live account writes or provider calls. Saved desktop/mobile exhaustion screenshots; mobile inspected.
- Verification: `pnpm exec tsx scripts/smoke-account-code-lifecycle.ts`, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check`, and saved-reader check (four topics/19 stories/17 posts). Commit/push followed by API/worker restart and health/alerts verification.
- Full check: 707 unit and 254 integration tests pass, four expected skips; build passes.
- Next: normal Phase 1 scheduled acceptance and authenticated live proxy proof before account activation. Accounts stay disabled; owner two-device acceptance remains required.

## 2026-11-09: iteration 1474 — composed browser login over real HTTPS

- Clean main/no leftovers; health and alerts clear, no failed user services. Scheduled Phase 1 acceptance still awaits 15:00 UTC; metrics check not due before 05:27 UTC.
- Replaced browser route interception in the composed login acceptance with a temporary loopback HTTPS server and production account HTTP adapter. Temporary self-signed TLS material is removed with the private fixture mailbox.
- Desktop/mobile verify cross-origin refusal, exact expiry, five-guess exhaustion/replacement, secure host cookie, authenticated HTTP session lookup, logout cookie removal and replay refusal. Storage/admission remain fixtures; no live account writes or provider calls. Inspected mobile screenshot; refreshed desktop replay screenshot.
- Updated activation checks/TASKS and archived iterations 1456–1457. Accounts stay disabled; live proxy proof and owner two-device acceptance remain open.
- Verification: composed browser smoke, format, lint fix, build, saved-reader check (four topics/19 stories/17 posts), diff check. First lint-fix process ended 143; retry passed and fixed import ordering caught by initial full check; full check rerun passes (707 unit/254 integration, four expected skips).
- No application code/config changed; healthy services require no restart under STEERING 22. Next: normal scheduled acceptance and live proxy proof before activation.

## 2026-11-09: iteration 1475 — HTTPS session renewal and admin freshness

- Clean main/no leftovers; health and alerts clear, no failed user services. Phase 1 scheduled acceptance remains due at 15:00 UTC; metrics check not due before 05:27 UTC.
- Extended composed desktop/mobile HTTPS acceptance with an eligible fixture admin and atomic fixture renewal: no renewal before 24 hours, renewal at the boundary, same bearer cookie, no duplicate renewal on the next request.
- Seven-day boundary removes admin rights while preserving reader access; advancing the server clock 401 days still authenticates and renews the browser's retained cookie. This does not simulate browser cookie expiration.
- Real account HTTP adapter/composition/crypto with fixture storage/admission only; no live account writes, migrations or provider calls. Accounts remain disabled. Updated activation checklist.
- Verification: composed HTTPS browser smoke, format, lint fix, full check, build, saved-reader check (four topics/19 stories/17 posts), handbook checker and diff check. Handbook reports expected metadata for unapplied account tables.
- Full check passes: 707 unit/254 integration tests, four expected skips; build passes.
- No runtime code/config change; no service restart under STEERING 22. Next: scheduled Phase 1 acceptance and live proxy proof before activation; owner two-device acceptance remains required.
