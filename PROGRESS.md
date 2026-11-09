## 2026-11-09: iteration 1444 — live system-owned AI-on private generation

- Clean main/no leftovers; health/alerts clear, all 36 sources healthy and digest queue has zero failures. Next scheduled publication Nov 9 15:00 UTC; accounts disabled and VM private.
- Initial AI-on smoke correctly refused with 503 while service development editing was disabled; immediate post-restart launch hit startup readiness. Enabled private `LLM_LIVE=1` temporarily, waited for health, then generated exactly one private AI-on edition; restored `LLM_LIVE=0` and restarted API afterward.
- Edition `1cd0265e-cab7-4484-be99-cb89691b2a4d`: 465 stored real candidates/four topics/20 stories. Gaming uses Haiku editing; Tech has incomplete-triage fallback, NBA/World use complete-triage unedited fallback. This is not full-AI acceptance. Development Anthropic: 38 calls/$0.211076, zero outstanding holds; no production ledger calls during the check and no paid X.
- Generation returned 201, but smoke asserted keyword reasons for semantic-triage fallback. Corrected that assumption and added read-only `--edition UUID` rechecks to avoid another paid generation. Saved-edition check passes: snapshot/history/detail, unpublished kind=test, direct reader 404 and latest reader unchanged. Default-profile ownership remains rollback-compatible.
- Complete live read-only adapter/HTTP off/on/off parity passes for all 552 editions, both publication filters, topics/settings. `check-scheduled-reader.ts 2026-11-08T15:00:00Z` retains four topics/19 stories/17 posts.
- Updated TASKS and rollout plan. Phase 1 remains open for normal scheduled acceptance; no provider retry or additional paid check. No UI or handbook system behavior change.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (695 unit; 253 integration passes/four expected skips), `pnpm build`, saved-edition read-only smoke and `git diff --check`. An earlier full check stopped at formatting while the smoke fix was being edited; final full check is green. No UI change.
- Commit/push, then restart API/worker and repeat health, reader and alerts checks to match main. Next: normal flag-on scheduled acceptance; no phase closure claimed.

## 2026-11-09: iteration 1445 — gated account HTTP bootstrap

- Clean main/no leftovers. Alerts and health clear, no failed user units; all 36 sources healthy, digest queue zero failures, next scheduled publication Nov 9 15:00 UTC.
- Prepared `prepareAccountHttp` combines the account runtime, bounded HTTP routes and proxy admission. Disabled flag opens no dependencies; activation requires explicit validated IP peers before account resources open. No implicit loopback trust.
- Extended disposable Postgres/Redis composition checks through real loopback HTTP: unrelated-route pass-through, missing forwarded-address refusal, forged-prefix handling, stand-in mailbox login, cookie-only session exchange, authenticated session read and replay refusal.
- Accounts remain disabled; main does not register the bootstrap. No live peer configuration, migration, provider call or public access change. Phase 1 stays open for scheduled acceptance; main composition and live proxy proof remain next-phase work.
- Updated rollout plan/TASKS and corrected its stale Nov 8 next-review marker. Archived iterations 1430–1431 to keep PROGRESS small; no handbook runtime behavior changed.
- Initial targeted bootstrap test expected an origin-specific error but received the existing Invalid URL error; corrected the assertion. Final verification results recorded below before commit.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (696 unit tests; 253 integration passes/four expected skips), `pnpm build`, targeted bootstrap/proxy tests (3), saved reader check and `git diff --check`. No UI change or paid verification.
- Commit/push, then restart API/worker and recheck health/reader/alerts so live matches main. Next: normal Nov 9 scheduled acceptance, then main account composition and verified live proxy wiring with accounts still gated.

## 2026-11-09: iteration 1446 — gated account storage composition

- Clean main/no leftovers; alerts clear, health database/Redis good, no failed user units and all 36 sources healthy. Scheduled Phase 1 acceptance still waits for Nov 9 15:00 UTC.
- Prepared unregistered storage composition for account HTTP: lazy configuration gate, real account repositories/Redis and repeatable shutdown that attempts every owned connection. Added read-only persisted identity lookup for closed signup admission.
- Disposable-storage HTTP check now uses this composition for mailbox login/session/replay; closed signup allows an existing verified reader but gives an unknown reader the same 202 response without sending a code. Disabled composition and repeat shutdown are checked.
- Updated TASKS and rollout plan; no live migrations, trusted-peer configuration, provider calls or account activation. No UI/runtime behavior change; VM private, main registration/live proxy proof pending.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (696 unit; 253 integration passes/four expected skips), plus `pnpm build` and `git diff --check`. Strengthened closed-signup redemption check passes an isolated targeted rerun. Saved reader retains four topics/19 stories/17 posts. Initial lint rejected an unsafe shutdown error type; fixed before the final passing checks. No UI change.
- Commit/push, then restart API/worker and recheck health/reader/alerts so live matches main. Next: normal flag-on scheduled acceptance; phase 3 remains gated.

## 2026-11-09: iteration 1447 — gated account startup registration

- Clean main/no leftovers; initial alerts clear, health database/Redis good and no failed user units. All 36 sources healthy; digest queue has zero failures, next scheduled run Nov 9 15:00 UTC.
- Registered account storage through a Nest lifecycle provider and mounted gated account HTTP before body parsing. Disabled startup opens no account resources; enabled startup requires explicit verified proxy peers before resources open. Nest closes owned connections on shutdown.
- Added actual Nest startup/shutdown checks for the disabled gate and enabled-without-proxy startup refusal; both targeted tests pass. Updated rollout plan, TASKS and affected handbook note; archived iterations 1432–1433 to keep PROGRESS small.
- Accounts remain disabled, VM private and account migrations unapplied. No provider calls, proxy trust configuration or phase acceptance claimed; live proxy proof remains pending after scheduled Phase 1 acceptance.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, saved reader check and `git diff --check` pass. Handbook check renders 18 pages/three diagrams; exits 1 for existing unapplied account-table metadata notes. No diagram/UI change.
- Full `pnpm check` passes (698 unit tests; 253 integration passes/four expected skips). Saved reader retains four topics/19 stories/17 posts. Initial unsupported `obs queues`/combined jobs flags corrected to `pnpm obs jobs --check`; digest queue healthy.
- Commit/push then restart API/worker and recheck health/reader/alerts so live matches main. Next: normal Nov 9 scheduled acceptance and live proxy verification; keep accounts off until Phase 1 acceptance.

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
