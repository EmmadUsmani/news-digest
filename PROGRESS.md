## 2026-11-08: iteration 1412 — disconnected friend sign-in-link lifecycle

- Clean main/no leftovers; `pnpm obs alerts` zero, `/healthz` healthy, no failed user services. Status confirms 36 active sources recently successful/no errors and zero failed digest jobs.
- Prepared unregistered link service and repository contract: fresh authenticated admin issuance, normalized recipient, random 32-byte hash-only token, 24-hour expiry and required atomic issuance audit.
- Redemption refuses GET/HEAD previews and malformed tokens before storage access; atomic consume returns the stored recipient for verified identity/session creation. Failed session creation leaves the link consumed.
- Three offline tests pass for authorization, hash-only storage, audit failure, previews, expiry/future bounds, concurrent single use, replay and failed session exchange. Persistence and HTTP/UI integration remain pending; no claim of database concurrency verification.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and targeted `pnpm exec tsx --test apps/api/test/sign-in-links.test.ts` pass. Full `pnpm check` passes: 657 unit/247 integration passes, four expected skips; typecheck, lint, formatting and boundaries green.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes: four topics, 19 stories/17 posts. Updated TASKS and rollout plan; no handbook behavior changes.
- No provider calls, migrations or generation changes; accounts disabled, VM private. After commit/push, restart API/worker and repeat health/reader checks. Phase 1 awaits pre-noon rollout and scheduled acceptance; link persistence/transport remain next preparation work.

## 2026-11-08: iteration 1413 — private friend-link persistence preparation

- Clean main/no leftovers; alerts zero, health good, no failed user services. Authenticated status confirms 36 recently successful sources/no current errors and zero failed digest jobs; unauthenticated admin status correctly returned 404.
- Prepared unapplied migration 0015 and unregistered Drizzle adapter: private hash-only links, bounded 24-hour expiry and single-use conditional update; link insertion and issuer audit commit or roll back together.
- Isolated storage checks cover 16 concurrent attempts/one winner, unknown/future/expired/replayed tokens, invalid rows, duplicate issuance and failed-audit rollback. Extended inherited-default-grant privacy rehearsal to both new tables.
- Initial full `pnpm check`: static checks and 657 unit tests pass; integration exposed outdated table-drop dependency and assertions ignoring Drizzle's wrapped cause. Corrected both; fresh `pnpm test:integration` rerun passes 248 tests/four expected skips.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, final `pnpm typecheck` and `git diff --check` pass. Handbook checker rendered 18 pages/three diagrams, exits 1 solely for metadata entries for unapplied edition/account tables; no diagram edits.
- Scheduled reader check for Nov 8 passes: four topics, 19 stories/17 posts. Updated rollout plan, data-model note, schema metadata and TASKS. No provider calls or live migration; accounts disabled, VM private.
- After commit/push, restart API/worker and repeat health/reader checks. Next: pre-noon phase 1 rollout and scheduled acceptance; friend-link transport, confirmation UI and runtime/proxy wiring remain pending.

## 2026-11-08: iteration 1414 — private friend-link HTTP preparation

- Clean main/no leftovers; alerts zero, health good and no failed user services. All 36 active sources recently successful/no current errors; digest queue has zero failures. Ingestion/social queues retain two failed jobs each; all active sources currently collect successfully.
- Prepared uninstalled link HTTP routes: fresh-admin issuance through the session cookie and strict POST redemption with exact Origin/JSON checks, bounded bodies and one token field. Issuance returns the secret only after atomic audited storage; redemption returns only a secure session cookie.
- Offline loopback test composes the real link service with memory ports: missing/stale admin, cross-origin writes, GET/HEAD previews, extra fields and replay are refused; issuance is hashed and single-use exchange succeeds. Existing disabled routing remains unchanged; runtime injection, confirmation UI and fragment URLs remain pending.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, targeted link HTTP test and `git diff --check` pass. Full `pnpm check` passes: 658 unit/248 integration tests, four expected skips; typecheck, lint, formatting and boundaries green.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes: four topics, 19 stories/17 posts. Handbook check reports only existing metadata entries for unapplied edition/account tables; no diagrams changed.
- Updated TASKS and rollout plan. No provider calls, migrations or generation changes; accounts disabled and VM private. Phase 1 waits for pre-noon rollout and scheduled acceptance.
- After verified commit/push, restart API/worker and repeat health/reader checks so live matches main.

## 2026-11-08: iteration 1415 — disabled friend-link runtime composition

- Clean main/no leftovers; alerts zero, health good and no failed user services. `pnpm obs sources` confirms all 36 sources healthy; `pnpm obs jobs --state failed --limit 2` shows zero digest failures, with two retained ingestion/social failures each as before.
- Prepared runtime now requires an injected link repository and shares verified identity/session services between code and friend-link login. Main remains unregistered; disabled composition opens no resources.
- Extended offline composition check: mailbox code creates fresh admin, audited hash-only friend issuance succeeds, redemption creates a non-admin session, replay fails and friend logout clears authentication. Memory ports only; database concurrency remains covered by existing isolated tests.
- Targeted `pnpm exec tsx --test apps/api/test/account-runtime.test.ts` passes both tests; `pnpm build` passes. `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 658 unit/248 integration passes, four expected skips; typecheck, lint, formatting and boundaries green.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes: four topics, 19 stories/17 posts. Updated TASKS and rollout plan; no handbook behavior change, UI change, migration or provider calls.
- Accounts remain disabled and VM private. After commit/push, restart API/worker and repeat health/reader checks. Next: pre-noon phase 1 rollout/normal scheduled acceptance; main registration, confirmation UI and verified proxy wiring remain pending.

## 2026-11-08: iteration 1416 — private friend-link confirmation preparation

- Clean main/no leftovers; alerts zero, health good, no failed user services. Active sources healthy; digest queue zero failures, two retained ingestion/social failures each unchanged.
- Prepared issuance includes an origin-pinned fragment URL. Uninstalled gated confirmation page clears the fragment immediately, keeps tokens out of browser storage and redeems only on explicit button POST; success replaces history, failed attempts discard tokens.
- Hash-based CSP allows only the fixed script/style and same-origin fetch; no framing, referrers or remote resources. Accounts remain disabled/main unregistered; no live migration or provider calls.
- `pnpm exec tsx scripts/smoke-account-confirmation.ts` passes isolated desktop/mobile disabled gate, preview, fragment privacy, explicit POST, success, replay and reload checks. Screenshots inspected; README explicitly labels fixture responses.
- Targeted account HTTP/runtime tests pass (4); `pnpm build`, `pnpm format`, `pnpm lint:fix` and `git diff --check` pass. Full `pnpm check` static checks/658 unit/248 integration tests pass, four expected skips, but wrapper exits 143 after coverage/cleanup; `pnpm test:integration` rerun exits 0 with 248 passes/four skips and clean container cleanup.
- Saved-reader check for Nov 8 passes: four topics, 19 stories/17 posts. Handbook checker renders 18 pages/three unchanged diagrams; exits 1 only for existing metadata entries for unapplied edition/account tables.
- Updated TASKS/rollout plan and archived progress iterations 1399–1406 to keep orientation small. `systemctl --user restart news-digest-api.service news-digest-worker.service` succeeds; both active, health and saved-reader checks pass. Next: pre-noon phase 1 rollout/acceptance, then main registration and verified proxy wiring.

## 2026-11-08: iteration 1417 — prepared trusted-proxy client admission

- Clean main/no leftovers; alerts zero, health good, no failed user services. All 36 active sources healthy; digest queue zero failures, two retained ingestion/social failures each unchanged.
- Read documented exe.dev proxy behavior: observed client is appended to X-Forwarded-For. Prepared unregistered parser requires explicit immediate socket-peer trust and uses only the final address; no network or proxy address is assumed trusted.
- Canonical IPv6 and IPv4-mapped forms share admission buckets. Offline tests reject untrusted peers, duplicate/missing/oversized headers, invalid final addresses and zone identifiers; forged prefixes cannot change the bucket. Live peer/forged-prefix verification remains pending before wiring.
- `pnpm exec tsx --test apps/api/test/proxy-client.test.ts` passes both tests. `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` and full `pnpm check` pass: 660 unit/248 integration passes, four expected skips; static checks green and clean exit 0.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes: four topics, 19 stories/17 posts. `pnpm exec tsx scripts/check-handbook.ts public-access` exits 0 with existing metadata notes for unapplied edition/account tables; no handbook behavior or diagrams changed.
- Updated TASKS/rollout plan. No migrations, provider calls or activation; accounts disabled and VM private. Phase 1 rollout waits for the next pre-noon window, then scheduled acceptance; prepared phase 3 remains off until acceptance.
- After commit/push, restart API/worker and repeat health/reader checks so live matches main.

## 2026-11-08: iteration 1418 — composed account storage acceptance

- Clean main/no leftovers; alerts zero, health good, no failed user services; all 36 active sources healthy. Digest queue zero failures; two retained ingestion/social failures each unchanged.
- Added isolated composition acceptance with actual Postgres repositories, Redis admission and owner-only stand-in mailbox. Two runtime instances share persisted admin login and sessions; replay fails, concurrent friend-link redemption creates exactly one non-admin session, friend issuance is refused and all-device logout preserves the admin session.
- Registered the check in the integration suite; runtime remains unregistered, accounts disabled and VM private. No migration, provider calls or live generation changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` pass. Full `pnpm check`: static checks/660 unit/249 integration tests pass, four expected skips.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes: four topics, 19 stories/17 posts. Handbook public-access check reports existing metadata for unapplied edition/account tables (exit 1); no handbook behavior or diagrams changed.
- Updated TASKS/rollout plan. Next: pre-noon phase 1 backup/rollout and scheduled acceptance, then account registration and verified proxy wiring. Restart API/worker after commit/push and repeat health/reader checks.

## 2026-11-08: iteration 1419 — prepared session-owned account deletion

- Clean main/no leftovers; alerts zero, health good, no failed user services; all 36 active sources healthy. Digest queue zero failures; retained ingestion/social failures unchanged at two each.
- Prepared disconnected deletion application/port and Drizzle transaction: derive identity from session hash, lock/recheck ownership, remove pending codes/links and personal audit rows, cascade all sessions through identity deletion. No caller user ID is accepted.
- Added isolated storage acceptance for unknown/revoked tokens, concurrent two-device requests, another account's isolation and rollback after an injected final-delete failure. Route confirmation, mailbox/sync cleanup and in-flight issuance coordination remain prerequisites to activation.
- Accounts remain disabled/unregistered and VM private; no live migration, generation change or provider call. Phase 1 rollout waits for the next pre-noon window.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` pass. Full `pnpm check`: static checks/660 unit tests pass; initial integration run caught a test assertion inspecting Drizzle’s wrapper instead of its cause. Corrected assertion; `pnpm test:integration` exits 0 with 250 passes/four expected skips. Final format/lint pass.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes: four topics, 19 stories/17 posts. Handbook public-access check reports existing metadata for unapplied edition/account tables; no handbook behavior or diagrams changed.
- Updated TASKS/rollout plan. After commit/push, restart API/worker and repeat health/reader checks. Next: pre-noon phase 1 rollout/acceptance, then account registration, sync and verified proxy wiring.

## 2026-11-08: iteration 1420 — prepared account-deletion transport

- Clean main/no leftovers; alerts zero, health good, no failed user services; all 36 active sources healthy and digest queue has zero failures.
- Prepared uninstalled POST `/api/account/delete`: exact Origin/JSON, explicit single-field DELETE confirmation and unambiguous cookie required. Ownership comes only from the session credential; caller identity fields are rejected before side effects.
- Deletion dependency is optional/uninjected. Successful deletion alone clears the secure host-only cookie; revoked/replayed credentials return 401 and dependency failures return private 503 without clearing it. Main still exposes no account routes.
- Loopback HTTP checks cover disabled/uninjected routes, non-POST methods, malformed confirmation, injected identities, cross-origin/content-type rejection, absent/duplicate credentials, unknown clients, revoked credentials, failure privacy, success and replay.
- Accounts remain disabled and VM private. No live migration, provider call or generation change. Mailbox cleanup, sync cascades and in-flight issuance coordination remain activation prerequisites; phase 1 waits for pre-noon rollout and scheduled acceptance.
- `pnpm exec tsx --test apps/api/test/account-http.test.ts` passes both loopback tests. `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` and full `pnpm check` pass: static checks, 661 unit tests and 250 integration tests, four expected skips. Final format/lint pass.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` verifies four topics, 19 stories/17 posts. Updated TASKS and rollout plan; no current handbook behavior changed. After commit/push, restart API/worker and repeat health/reader checks.
- Next: pre-noon phase 1 backup/rollout and scheduled acceptance; finish deletion cleanup/issuance coordination before runtime injection.

## 2026-11-08: iteration 1421 — prepared recipient mailbox cleanup

- Clean main/no leftovers. Alerts clear, health good, no failed user units; all 36 sources healthy and digest-generation queue has zero failures. Initial unsupported `obs status` and `--queue digest` queries were corrected to documented local commands; no mutations.
- Prepared idempotent recipient removal in the stand-in mailbox. It validates the owner-only directory, removes only the hashed recipient entry and never follows a symlink target or recursively removes a directory.
- Tests cover recipient isolation, repeated removal, symlink target preservation, refusal of directory entries and unsafe/symlink mailbox roots. Issuance coordination is explicitly required: an in-flight delivery can otherwise recreate a removed message.
- Cleanup remains disconnected; accounts disabled, VM private. No live migration, provider call or edition-generation change. Updated TASKS and rollout plan; current handbook behavior unchanged.
- `pnpm exec tsx --test apps/api/test/file-login-code-delivery.test.ts` passes two tests. `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` and full `pnpm check` pass: 662 unit tests, 250 integration tests/four expected skips.
- API/worker restart and health pass; `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` verifies four topics/19 stories/17 posts. Final format/lint before commit; push and restart again so live matches main.
- Next: pre-noon Phase 1 backup/rollout and scheduled acceptance; coordinate issuance/deletion and cleanup before deletion runtime injection.

## 2026-11-08: iteration 1422 — prepared fail-closed deletion cleanup

- Clean main/no leftovers. Alerts clear, health good, no failed user units; all 36 sources healthy, digest-generation queue has zero failures. Retained ingestion/social failures remain two each.
- The unregistered deletion repository now requires an idempotent external-cleanup port and removes the recipient mailbox entry while session ownership is locked, before committing identity deletion.
- Extended isolated storage acceptance with real owner-only mailbox files: cleanup failure preserves the account/message; a later database failure rolls back identity/proof removal and retry tolerates the already-removed message; concurrent two-device deletion never removes another recipient's message. Unknown credentials invoke no cleanup.
- Accounts remain disabled and VM private; no live migration, provider call or generation change. In-flight login/link issuance coordination, sync-data cascades and runtime injection still precede activation. Phase 1 rollout awaits the pre-noon window.
- Updated TASKS and rollout plan; current handbook behavior unchanged. `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` and full `pnpm check` pass: 662 unit tests, 250 integration tests/four expected skips.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` verifies four topics/19 stories/17 posts. API/worker restarted; health and the same reader check pass. Final format/lint pass; commit/push then repeat restart/health so live matches main.
- Next: pre-noon Phase 1 backup/rollout and scheduled acceptance; finish cross-process issuance/deletion coordination before activation.

## 2026-11-08: iteration 1423 — prepared cross-process recipient lock

- Clean main/no leftovers; alerts clear, health good, no failed user units. All 36 sources healthy; digest-generation queue has zero failures, retained ingestion/social failures unchanged. Unsupported combined jobs/check flags corrected to `pnpm obs jobs --check`.
- Prepared a recipient-coordination port and unregistered PostgreSQL transaction-scoped advisory lock. Same normalized email serializes across independent connections; unrelated recipients proceed. Five-second contention timeout prevents callbacks from running without the lock; transaction completion/failure releases it.
- The primitive stores no recipient text and requires canonical email input. Application callbacks retain their own transactions: common issuance/delivery/redemption/deletion wiring and policy rechecks after waiting remain necessary before activation.
- Accounts remain disabled and VM private; no migration, provider call or generation change. Phase 1 rollout still waits for the next pre-noon window. Updated TASKS and rollout plan; current handbook behavior unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` and full `pnpm check` pass: static checks, 662 unit tests and 251 integration passes/four expected skips. New isolated lock test verifies serialization, recipient isolation, five-second timeout, failure release and invalid-input rejection.
- API/worker restarted; `/healthz` passes. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` verifies four topics/19 stories/17 posts. Archived iterations 1407–1411 to keep PROGRESS below 25 KB. Final format/lint before commit; push then restart again so live matches main.
- Next: pre-noon Phase 1 backup/rollout and scheduled acceptance; wire the shared recipient boundary with post-lock eligibility rechecks before account activation.

## 2026-11-08: iteration 1424 — coordinated login-code issuance

- Clean main/no leftovers; alerts clear, health good, no failed user units. All 36 sources healthy; digest-generation has zero failures, retained ingestion/social failures unchanged.
- Prepared login-code issuance now requires recipient coordination around challenge replacement and awaited mailbox delivery. Eligibility is evaluated after acquiring the lock, so a policy change while waiting prevents issuance.
- Prepared runtime composition requires an explicit coordination port; no production registration or fallback bypass. Exchange/session creation, link operations and deletion still need the common boundary before activation.
- Offline tests verify normalized lock identity, no writes while waiting, changed eligibility, lock held through delayed delivery and fail-closed lock errors. Accounts disabled, VM private; no migration, live provider call or generation change.
- Updated TASKS and rollout plan; current handbook behavior unchanged. Targeted code/runtime tests pass (10); `pnpm format`, `pnpm lint:fix` and `pnpm build` pass. Initial overlapping check caught import ordering before autofix finished; reran after fixes.
- Initial full-suite attempt exposed a missed storage-test composition dependency (250 integration passes/one failure); wired the real PostgreSQL coordinator there and included pool cleanup. Final `pnpm check` passes: static checks, 664 unit tests and 251 integration passes/four expected skips.
- `pnpm exec tsx scripts/check-handbook.ts public-access-plan` passes (expected metadata notes for unapplied tables); `git diff --check` passes. Scheduled-reader check verifies four topics/19 stories/17 posts. Commit/push, then restart API/worker and repeat health/reader checks.
- Next: pre-noon Phase 1 backup/rollout and scheduled acceptance; coordinate complete proof-to-session exchange, links and deletion before activating accounts.

## 2026-11-08: iteration 1425 — coordinated code-to-session exchange

- Clean main/no leftovers; alerts clear, health good, no failed user units. All 36 sources healthy; digest-generation has zero failures, retained ingestion/social failures unchanged.
- Prepared login exchange now requires recipient coordination through proof consumption, identity lookup and session creation. Shared normalization rejects malformed recipients before locking; eligibility is evaluated by code redemption after waiting.
- Runtime composition supplies the same coordination port as issuance. Offline tests cover normalized recipient, no proof work while waiting, full exchange lock coverage and fail-closed lock errors; storage exchange now uses real PostgreSQL coordination.
- Accounts remain disabled and VM private. No live migration, generation change or provider call. Link operations/deletion still need the common boundary before activation; Phase 1 rollout waits for pre-noon.
- Updated TASKS and rollout plan; current handbook behavior unchanged. Targeted exchange tests pass (2); build and handbook check pass (expected metadata notes for unapplied tables). Full pnpm check passes: static checks, 666 unit tests, 251 integration passes/four expected skips. pnpm format, pnpm lint:fix and git diff --check pass.
- API/worker restarted; health and scheduled-reader check verify four topics/19 stories/17 posts. Commit/push then repeat restart/health to match main. Next: finish link/deletion coordination and pre-noon Phase 1 backup/rollout.

## 2026-11-08: iteration 1426 — coordinated sign-in-link issuance

- Clean main/no leftovers; alerts clear, health good, no failed user units. All 36 sources healthy; digest queue has no failures, retained ingestion/social failures unchanged.
- Prepared link issuance now requires shared recipient coordination through audited persistence. Normalized recipients share the login boundary; issuer session/admin eligibility is checked after waiting. Runtime supplies the required port; main remains disconnected.
- Offline tests verify waiting, changed admin eligibility, lock held through delayed audit/write and fail-closed lock errors. Accounts disabled, VM private; no migration, provider call or edition-generation change.
- Updated TASKS and rollout plan. `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` and handbook plan check pass (expected metadata notes for unapplied tables). Targeted tests: 6 passes. Full `pnpm check`: static checks, 668 unit passes, 251 integration passes/four expected skips.
- API/worker restarted; health passes. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` verifies four topics/19 stories/17 posts. Commit/push then restart/check again to match main.
- Next: coordinate link redemption and deletion before activation; Phase 1 rollout still awaits the pre-noon backup/migration window and scheduled acceptance.
