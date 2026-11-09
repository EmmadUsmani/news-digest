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

## 2026-11-09: iteration 1476 — HTTPS multi-device session revocation

- Clean main/no leftovers; health and alerts clear, no failed user services. Normal Phase 1 scheduled acceptance awaits 15:00 UTC; metrics probe not due before 05:27 UTC.
- Extended composed desktop/mobile HTTPS acceptance with independently redeemed device cookies: single-device logout preserves the second session; a new login plus all-device logout revokes both. Replaying either revoked cookie cannot authenticate.
- Fixture storage now models separate sessions and scopes deletes by token/user; sign-out shares the simulated server clock. The other device retains an inert cookie without renewal after revocation.
- Real production HTTP/composition/crypto with fixture storage/admission only; no live writes, migrations or provider calls. Accounts remain disabled; updated activation checklist.
- Verification: `pnpm exec tsx scripts/smoke-account-code-lifecycle.ts`, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z`, handbook checker and diff check pass.
- Full check: 707 unit/254 integration pass, four expected skips. Saved reader: four topics/19 stories/17 posts. Handbook reports expected metadata for unapplied account tables.
- No runtime code/config changes; no service restart under STEERING 22. Next: scheduled Phase 1 acceptance and live proxy proof; owner two-device acceptance remains required.

## 2026-11-09: iteration 1477 — composed HTTPS sign-in links

- Clean main/no leftovers; health, alerts, source freshness, jobs and services pass. Phase 1 scheduled acceptance remains due at 15:00 UTC; accounts stay disabled.
- Extended the composed desktop/mobile HTTPS smoke with admin-issued sign-in links using real HTTP handlers, runtime and crypto; fixture link storage enforces exact expiry and single use.
- Browser preview strips the fragment without creating a session; cross-origin redemption fails without consuming the link. Explicit confirmation exchanges it for a secure cookie; logout followed by replay and reload cannot authenticate.
- Saved and inspected desktop/mobile replay screenshots; added desktop/mobile screenshot links and activation coverage. No live account writes, provider calls or runtime changes; archived progress entries 1458–1460.
- Initial browser run exposed same-document fragment navigation in the harness; corrected it to leave the confirmation page before opening a new link. Both viewport checks pass.
- Verification: `pnpm exec tsx scripts/smoke-account-code-lifecycle.ts`, saved-reader check (four topics/19 stories/17 posts), `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, handbook checker and diff check pass.
- First full-check process ended 143 during unit tests with no assertion failure; complete retry passes 707 unit/254 integration tests, four expected skips. Handbook reports expected metadata for unapplied account tables.
- Hourly 05:27 metrics probe: 23 healthy rules, four queries ≤0.710 s, no new evaluator errors/misses; recovery remains open. Next passive check ≥06:27 UTC.
- No service restart needed under STEERING 22. Next: normal scheduled Phase 1 acceptance and live proxy proof; owner two-device acceptance remains required.

## 2026-11-09: iteration 1478 — composed HTTPS account deletion

- Clean main/no leftovers; alerts clear, health passes and no failed user services. Phase 1 scheduled acceptance still awaits 15:00 UTC; accounts remain disabled.
- Extended composed desktop/mobile HTTPS acceptance with two independently issued sessions: cross-origin and incorrect-confirmation deletion requests preserve both sessions and the calling cookie.
- Confirmed deletion clears the calling cookie, refuses both device sessions without renewal and rejects authenticated-cookie deletion replays. Production HTTP/composition/crypto; fixture deletion storage only, no live account writes or provider calls.
- Updated the activation checklist; no UI/runtime/config changes or new screenshots. Existing browser screenshots remain unchanged.
- Verification: `pnpm exec tsx scripts/smoke-account-code-lifecycle.ts` twice, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check, handbook checker and `git diff --check` pass.
- Full check: 707 unit/254 integration tests pass, four expected skips. Saved reader retains four topics/19 stories/17 posts; handbook reports expected metadata for unapplied account tables.
- No restart under STEERING 22. Next: normal Phase 1 scheduled acceptance and live proxy proof; metrics probe not due before 06:27 UTC.

## 2026-11-09: iteration 1479 — composed HTTPS admin revocation

- Clean main/no leftovers; health and alerts clear, all 36 active sources fresh without errors, digest queue zero failures. Accounts remain disabled; Phase 1 acceptance awaits 15:00 UTC.
- Extended desktop/mobile composed HTTPS acceptance with two independently invited friend-device sessions. An ordinary reader cannot issue links or revoke sessions; cross-origin and malformed admin requests preserve both devices and write no fixture audit.
- Successful admin revocation returns only the count, removes both target sessions, records the fixture audit and preserves the issuer's admin access. Replayed target cookies stay signed out without renewal.
- Production HTTP/composition/crypto with fixture storage/admission only; no live writes, provider calls or runtime changes. Updated activation checklist and archived progress entries 1461–1463.
- Initial smoke assertion expected 200 for link exchange; corrected to the existing 204 contract. Final composed smoke passes both widths; saved reader retains four topics/19 stories/17 posts.
- Verification: `pnpm exec tsx scripts/smoke-account-code-lifecycle.ts`, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check, handbook checker and `git diff --check`.
- Full check passes 707 unit/254 integration tests, four expected skips; handbook checker passes with expected unapplied-account metadata notices.
- No service restart under STEERING 22. Next: scheduled Phase 1 acceptance and live proxy proof; metrics probe not due before 06:27 UTC. Owner two-device acceptance remains required.

## 2026-11-09: iteration 1480 — composed HTTPS two-device reader sync

- Clean main/no leftovers; health and alerts clear, services 14/14 and sources 36/36 healthy. Digest queue has no failures; saved edition retains four topics/19 stories/17 posts.
- Replaced the composed browser harness's echo-only sync stub with per-reader fixture persistence using the production merge policy; injected the existing test clock into sync authentication.
- Desktop/mobile independently issued device cookies now exchange topic/bookmark choices through real HTTPS handlers. Newer removals survive stale device replay; cross-origin and injected-user-ID bodies fail without changing state.
- Friend sessions see empty state while the issuer retains its choices; both revoked device sessions cannot sync. Fixture storage/admission only, no live account writes or provider calls.
- Updated the activation checklist. No UI/runtime/config changes; accounts remain disabled, with Phase 1 scheduled acceptance and live proxy proof pending.
- Verification: `pnpm exec tsx scripts/smoke-account-code-lifecycle.ts` twice, `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z`, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, handbook checker and diff check pass.
- Full check: 707 unit/254 integration tests pass, four expected skips. Handbook has expected metadata notices for unapplied account tables; build has its existing chunk-size warning.
- No service restart under STEERING 22. Next: 15:00 UTC scheduled acceptance and live proxy proof; metrics passive check due no earlier than 06:27 UTC.

## 2026-11-09: iteration 1481 — exact admin expiry rejects HTTPS writes

- Clean main/no leftovers; health and alerts clear, 14 services/36 sources healthy, digest queues pass `pnpm obs jobs --check`.
- Extended composed desktop/mobile HTTPS acceptance: link issuance succeeds one millisecond before seven-day admin expiry; at expiry, invitations and session revocation return 403 despite daily cookie renewal.
- Refused writes set no cookie and leave fixture links/sessions/audit unchanged; the same stale admin retains ordinary reader sync. Production transport/composition, fixture storage only; no live account writes or provider calls.
- Updated activation checklist; no runtime/config/UI changes, accounts stay disabled. Discarded an incidental regenerated screenshot; no restart required under STEERING 22.
- Verification: composed browser smoke twice, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check and diff check pass. Full check: 707 unit/254 integration tests pass, four expected skips; saved reader retains four topics/19 stories/17 posts.
- Handbook checker exits 1 solely for 14 existing metadata warnings referencing seven unapplied account tables; 18 pages/diagrams otherwise checked. Previous entries calling this a pass were inaccurate.
- Next: normal 15:00 UTC Phase 1 scheduled acceptance and live proxy proof. Metrics passive check not due before 06:27 UTC.

## 2026-11-09: iteration 1482 — deletion invalidates outstanding HTTP credentials

- Clean main/no leftovers; alerts clear, healthz healthy, 36/36 sources fresh and digest queue has no failures. Historical ingestion/social failures remain retained; recent collections succeed.
- Extended the installed HTTP/storage integration flow with two friend sessions, saved choices, a pending mailbox code and an unused invitation before deletion.
- Deletion clears the caller cookie, refuses both device sessions, removes the identity and mailbox code, and rejects code/link replay without setting cookies or recreating the reader.
- Disposable Postgres/Redis and private temporary mailbox only; no live writes, provider calls or runtime/config/UI changes. Accounts remain disabled. Updated activation checklist and archived iterations 1464–1466.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z`, source/queue snapshots and `git diff --check` pass.
- Full check: 707 unit/254 integration tests pass, four expected skips. Build retains existing bundle warnings; saved reader retains four topics/19 stories/17 posts.
- No restart under STEERING 22: deployed code/config unchanged. Next: normal 15:00 UTC Phase 1 acceptance and live proxy proof; metrics passive check remains due no earlier than 06:27 UTC.
