## 2026-11-09: iteration 1448 — gated email-code sign-in page

- Clean main/no leftovers. Initial alerts and health clear; all 36 sources healthy, scheduled reader retains four topics/19 stories/17 posts. Phase 1 acceptance waits for Nov 9 15:00 UTC.
- Prepared `/account/login` behind the disabled account flag: email-code request, keyboard redemption, private eligibility message, safe refusal/retry and success redirect. Restrictive CSP, same-origin POSTs and no credential URLs/storage; submitted codes are cleared.
- Isolated Playwright checks pass on desktop/mobile with fixture HTTP responses only; inspected both new screenshots. Existing friend-link confirmation smoke still passes. Updated rollout plan, affected handbook note, screenshots index and TASKS; archived iterations 1434–1435 to keep this file small.
- Accounts remain disabled, VM private, migrations pending; no provider calls, real email or live proxy trust changes. Reader navigation wiring remains pending.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, both account browser smokes, saved reader check and `git diff --check`; all pass (698 unit tests, 253 integration passes/four expected skips). Handbook filter reports existing metadata for unapplied account tables; no diagrams changed.
- Next: scheduled Phase 1 acceptance, live proxy proof and gated reader account UI; phase 3 activation stays blocked on phase 1 acceptance.

## 2026-11-09: iteration 1449 — gated reader account panel

- Clean main/no leftovers; alerts and health clear, no failed user units. Sources healthy, latest reader retains four topics/19 stories/17 posts; next scheduled digest is Nov 9 15:00 UTC.
- Prepared an unmounted gated account panel for sign-in, sync status/failure/retry, session-check retry and single/all-device sign-out. Busy actions are disabled; failed sign-out retains controller state and choices. No account identities are displayed or stored by the panel.
- Isolated desktop/mobile Playwright fixture checks pass for those controls, rejected actions and disabled UI. Inspected both screenshots; updated screenshot index, rollout plan, affected handbook note and TASKS. Accounts remain disabled, migrations pending, VM private; no provider calls or real email.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/smoke-reader-account.ts`, saved reader check and `git diff --check`. Full check passes (698 unit tests; 253 integration passes/four expected skips). Handbook filter reports existing metadata for unapplied account tables; no diagrams changed. Initial build found unsupported button variant; corrected before final checks. Initial smoke required an async entrypoint; corrected.
- Commit/push then restart API/worker and recheck health/reader/alerts so live matches main. Next: normal flag-on Phase 1 scheduled acceptance, live proxy proof and gated header mounting; phase 3 activation follows phase 1 acceptance.

## 2026-11-09: iteration 1450 — gated reader header account wiring

- Clean main/no leftovers; initial alerts and health clear, no failed user units. Sources healthy, digest queue has no failures; next scheduled run Nov 9 15:00 UTC.
- Wired prepared account controls/controller to the edition and saved-item preference bridges behind explicit `VITE_READER_ACCOUNTS=1`; default is off. Phase 1 scheduled acceptance, proxy proof and activation remain pending. No migrations, provider calls or real email.
- Desktop/mobile Playwright integration uses saved edition content and fixture account HTTP: discovery, sync, saved-route navigation, sign-out, cleared local storage and no overflow/errors pass. Deployed default-off reader shows no account button and makes no account requests. Inspected both screenshots; updated rollout plan, handbook and screenshot index; archived iterations 1436–1437 to keep PROGRESS small.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/smoke-reader-account-integration.ts`, `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z`, and `git diff --check`. Full check passes (698 unit tests; 253 integration passes/four expected skips); build passes. Saved reader retains four topics/19 stories/17 posts. Handbook filter reports existing metadata notes for unapplied account tables.
- Initial browser harness used Node fetch's restricted port 4190; changed to 4188 and passed. Corrected missing scheduled-reader timestamp argument. Initial combined format/check shell ended with signal 143 after formatting; reran lint/full checks separately.
- Commit/push then restart API/worker and recheck health, default-off browser/reader and alerts. Next: normal flag-on Phase 1 scheduled acceptance, live proxy verification; keep accounts disabled until acceptance.

## 2026-11-09: iteration 1451 — stored HTTP two-device account acceptance

- Clean main/no leftovers; alerts and health clear, all 36 sources healthy, no failed user units or digest jobs. Saved reader retains four topics/19 stories/17 posts. Historical ingestion/social failed jobs remain retained with healthy current collection.
- Extended isolated Postgres/Redis account HTTP acceptance with independently redeemed device sessions, saved-story copy/removal convergence, stale-write protection and friend-reader isolation. Single logout preserves the second device; all-device logout revokes two active sessions while the other reader survives. Account deletion expires the cookie and refuses subsequent sync.
- Updated rollout evidence and TASKS. Accounts stay disabled, account migrations pending, VM private; no live provider calls, real email or proxy configuration changes. No product behavior or handbook diagrams changed.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z`, `git diff --check`; all pass (698 unit tests, 253 integration passes/four expected skips). No UI changed; browser checks were not repeated.
- Next: Nov 9 15:00 UTC scheduled Phase 1 acceptance, then live proxy proof and gated account activation; owner two-device acceptance remains open.

## 2026-11-09: iteration 1452 — gated account deletion control

- Clean main/no leftovers; health and alerts clear, no failed user units; all 36 sources healthy. Phase 1 awaits Nov 9 15:00 UTC scheduled acceptance; accounts remain disabled, VM private, account migrations pending.
- Added typed DELETE confirmation and cancellation to the gated account panel. Deletion pauses uploads and blocks concurrent session actions; failed requests retain choices, successful requests clear local state. Shared logout/deletion controller retains existing logout behavior.
- Controller acceptance verifies refusal, retry, concurrent-action suppression and late-sync cancellation. Desktop/mobile Playwright fixture checks cover confirmation, cancellation, busy state, refusal and successful deletion through the mounted reader. Inspected refreshed panel screenshots; updated screenshot index, rollout plan and affected handbook note. Archived iterations 1438–1439 to keep this file small.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, targeted controller tests, both reader-account browser smokes, `check-scheduled-reader.ts 2026-11-08T15:00:00Z`, handbook data-model check and `git diff --check`. Full check passes: 699 unit tests, 253 integration passes/four expected skips; build passes. Reader retains four topics/19 stories/17 posts; handbook reports existing metadata notes for unapplied account tables. No provider calls or real email.
- Initial combined format/lint/check shell ended with signal 143 during unit tests; reran full check separately. Archive helper initially used the wrong date in a heading; corrected without losing content.
- Commit/push then restart API/worker and recheck health/reader/alerts. Next: scheduled Phase 1 acceptance, live proxy proof and gated account activation; owner two-device acceptance remains open.

## 2026-11-09: iteration 1453 — gated admin friend invitations

- Clean main/no leftovers; initial health/alerts clear, all 36 sources have successful collection and no current errors. Digest queue has zero failures; normal Phase 1 acceptance awaits Nov 9 15:00 UTC.
- Added an admin-only invitation form to the gated account panel: explicit email POST, same-origin fragment-link validation, refusal/retry and dismissible private link display. Recipient/link stay in component memory; unmount aborts pending requests. No live invitations, delivery, provider calls or account activation.
- Desktop/mobile Playwright fixtures verify non-admin hiding, refusal preserving the recipient, retry/success, dismissal, foreign-origin rejection and empty browser storage. Inspected both new invite screenshots; updated screenshot index, rollout plan, affected handbook note and TASKS. Accounts remain disabled; account migrations and live proxy proof remain pending.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, both reader-account browser smokes, `check-scheduled-reader.ts 2026-11-08T15:00:00Z`, handbook data-model check and `git diff --check`. Full check passes (699 unit tests; 253 integration passes/four expected skips); build and browser checks pass. Saved reader retains four topics/19 stories/17 posts; handbook reports existing metadata notes for unapplied account tables. No diagrams changed.
- Unauthenticated local admin status correctly returned 404; protected helper confirmed healthy sources/queues. Commit/push then restart API/worker and recheck health/reader/alerts. Next: scheduled Phase 1 acceptance, live proxy verification and account activation; owner two-device acceptance remains open.

## 2026-11-09: iteration 1454 — prepared audited admin session revocation

- Clean main/no leftovers; health/alerts clear, all 36 sources healthy, digest queue has zero failures. Normal Phase 1 acceptance still awaits Nov 9 15:00 UTC; accounts stay disabled and VM private.
- Added unregistered admin session-revocation application/port/storage. Storage locks and rechecks the active issuer, original eligibility, current allowlist and seven-day freshness; deletes the target’s device sessions and records the stored target email in one transaction. No bearer tokens reach audit rows. Prepared migration 0017 expands allowed audit actions; no live migration or activation.
- Offline acceptance covers malformed credentials/targets, current allowlist, unknown/non-admin/stale issuers, exact freshness boundary, target isolation, self-revocation, audit-failure rollback and row-lock waiting behind concurrent logout. Updated rollout plan, handbook and audit metadata; archived iterations 1440–1441 to keep this file small. No UI change, provider calls or real email.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z`, `pnpm exec tsx scripts/check-handbook.ts 07-data-model` and `git diff --check` pass. Full check: 700 unit tests, 254 integration passes/four expected skips, including schema parity and new rollback/logout-race acceptance. Saved reader retains four topics/19 stories/17 posts; handbook reports existing pending-account metadata notes. Commit/push then restart API/worker and recheck health/reader/alerts.
- Next: normal scheduled Phase 1 acceptance, live proxy proof; prepare guarded revocation HTTP/admin controls while accounts remain disabled. Owner two-device acceptance remains open.

## 2026-11-09: iteration 1455 — guarded admin revocation HTTP transport

- Clean main/no leftovers; initial alerts and health clear, all 36 sources healthy and digest queue has zero failures. Phase 1 awaits Nov 9 15:00 UTC scheduled acceptance; accounts remain disabled and VM private.
- Prepared POST-only `/api/account/sessions/revoke` with exact Origin/JSON, strict single-UUID payload, unambiguous cookie, trusted-client admission and bounded body. Optional service injection defaults to unavailable; no runtime revocation registration or live migration. Authorization remains atomic with audit/storage; no preliminary session renewal.
- Isolated loopback HTTP acceptance covers disabled/unconnected gates, methods, malformed/extra fields, foreign Origin, ambiguous cookies, oversized bodies, untrusted clients, authorization refusal, count-only success and private storage failure. Updated rollout plan, affected handbook note and TASKS. No UI change, live provider calls or real email.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, targeted HTTP test, `check-scheduled-reader.ts 2026-11-08T15:00:00Z` and `git diff --check` pass: 701 unit tests, 254 integration passes/four expected skips. Handbook check renders successfully but exits 1 for existing unapplied-account metadata warnings; no diagrams changed. Saved reader retains four topics/19 stories/17 posts.
- Commit/push then restart API/worker and recheck health/alerts/reader. Next: gated runtime revocation injection and admin control; normal scheduled Phase 1 acceptance then live proxy proof. Account migration 0017 remains unapplied; owner two-device acceptance stays open.

## 2026-11-09: iteration 1456 — gated admin revocation runtime

- Clean main/no leftovers; initial health and alerts clear, all 36 sources healthy and digest queue has zero failures. Phase 1 awaits Nov 9 15:00 UTC scheduled acceptance; accounts stay disabled and VM private.
- Composed audited admin session revocation with the current runtime allowlist and required repository dependency; gated storage owns connection shutdown. No live account operation, migration, provider call or email. Migration 0017 remains unapplied; admin controls remain next.
- Extended isolated stored-account acceptance across runtimes: non-admin refusal, target-only removal, immediate HTTP sync refusal, issuer/other-reader survival and repeat zero-count success. Initial test used a pre-login clock and correctly hit the freshness refusal; fixed the test clock and reran integration. Updated rollout plan, handbook and TASKS.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (701 unit passes; initial integration clock failure), corrected `pnpm test:integration`, `pnpm build`, `check-scheduled-reader.ts 2026-11-08T15:00:00Z`, handbook data-model check and `git diff --check`. Corrected integration: 254 passes/four expected skips, zero failures. Saved reader retains four topics/19 stories/17 posts; handbook has existing pending-account metadata warnings.
- Archived iterations 1442–1443 to keep this log small. Commit/push then restart API/worker and recheck health, reader and alerts. Next: gated admin revocation control; scheduled Phase 1 acceptance then live proxy proof. Owner two-device acceptance stays open.

## 2026-11-09: iteration 1457 — gated admin reader sign-out control

- Clean main/no leftovers; health and alerts clear, all 36 sources healthy, digest queue zero failures and no recent errors. Normal Phase 1 acceptance awaits Nov 9 15:00 UTC; accounts stay disabled and VM private.
- Added admin-only reader sign-out form: UUID target, explicit all-device confirmation reset on target changes, refusal/retry, validated removed-session counts and issuer-session refresh after success. Target stays in memory and unmount aborts pending requests. No live account writes, migration, provider calls or email. Migration 0017 remains unapplied.
- Desktop/mobile fixture browser checks cover hidden non-admin/disabled controls, confirmation reset, refusal preserving target, retry, positive/zero counts, malformed success rejection and issuer refresh. Saved-reader header integration passes; refreshed screenshots and affected rollout/handbook notes.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, both reader-account browser smokes, `check-scheduled-reader.ts 2026-11-08T15:00:00Z`, handbook data-model check and `git diff --check`. Full check passes: 701 unit passes, 254 integration passes/four expected skips. Build/browser checks pass; saved reader retains four topics/19 stories/17 posts. Handbook renders but exits 1 for existing unapplied-account metadata warnings; no diagrams changed.
- Commit/push then restart API/worker and recheck health/reader/alerts. Next: normal scheduled Phase 1 acceptance, live proxy proof and remaining Phase 3 activation checks; owner two-device acceptance stays open.

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
