## 2026-11-08: iteration 1407 — account request boundary preparation

- Clean main/no leftovers; `pnpm obs alerts` zero, `/healthz` database/Redis healthy, no failed user services.
- Prepared disconnected transport checks: exact configured HTTPS Origin, JSON-only writes, bounded login bodies rejecting caller identity/permission fields, strict host-session cookie parsing rejecting duplicates and encoding ambiguity.
- Three offline tests cover cross-origin requests, content types, privilege injection, malformed guesses and ambiguous credentials. No route/module registration; accounts remain disabled.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` pass: 645 unit/247 integration passes, four expected skips. `git diff --check` passes.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes: four topics, 19 stories/17 posts.
- Updated TASKS and rollout plan. No provider calls/live writes/migrations/restarts; disconnected preparation leaves runtime unchanged and respects generation deployment cutoff.
- Next: pre-noon phase 1 backup/rollout/live checks and scheduled acceptance first; connect account HTTP routes and signup policy with flags off while waiting.

## 2026-11-08: iteration 1408 — signup eligibility preparation

- Clean main/no leftovers; `pnpm obs alerts` zero, `/healthz` database/Redis healthy, no failed user services.
- Prepared disconnected signup policy: existing readers retain login with signup off/invite; invite code bootstrap permits only configured admins. Friends require separately verified admin links (still pending).
- Unknown modes/open stand-in signup rejected at construction; malformed identities and lookup failures denied. No runtime registration or account activation.
- Three offline tests verify mode matrix, normalized lookup, exact admin matching, malformed identities and fail-closed storage errors.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` pass: 648 unit/247 integration passes, four expected skips. `git diff --check` passes.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes: four topics, 19 stories/17 posts. Updated TASKS and rollout plan.
- No provider calls or migrations. API/worker restart and health/reader checks complete after commit; accounts remain disabled and VM private.
- Next: pre-noon phase 1 private backup/rollout/live checks, then scheduled acceptance; prepare account routes with flag off while waiting.

## 2026-11-08: iteration 1409 — disconnected account transport orchestration

- Clean main/no leftovers; `pnpm obs alerts` zero, `/healthz` healthy, no failed user services. All 36 active sources have recent successful collection/no current errors; scheduled digest completed and next run queued.
- Prepared unregistered account handlers composing request checks, code request/redemption, current session and single/all-device logout. No account routes exposed or flags enabled.
- Three offline tests cover side-effect-free boundary rejection, privilege injection, generic code rejection, cookie-only exchange, credential-free session JSON and authenticated all-device identity.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` pass: 651 unit/247 integration passes, four expected skips; targeted handler tests pass 3/3. Initial lint caught missing `void` on test promises; corrected before rerunning.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes: four topics, 19 stories/17 posts. `git diff --check` passes.
- Updated TASKS and rollout plan. No provider calls, migrations or generation changes; accounts disabled, VM private. API/worker restart and health/reader checks follow commit.
- Next: pre-noon phase 1 private backup/rollout/live checks, then normal scheduled acceptance; prepare account route registration with flag off while waiting.

## 2026-11-08: iteration 1410 — guarded account HTTP adapter preparation

- Clean main/no leftovers; alerts zero, health/database/Redis good, no failed user services. All 36 active sources healthy; no failed digest runs.
- Added uninstalled HTTP adapter for code request/redemption, session lookup and single/all-device logout. Accounts remain disabled; main does not install routes.
- Explicit enable gate, injected verified client key, streamed 2 KiB JSON limit, no-store/cookie variance and generic dependency failures; no forwarded-header identity trust.
- Loopback HTTP test verifies disabled routes, denied client/origin, malformed/oversized payloads, cookie-only redemption, session privacy and suppressed exception details.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` pass: 652 unit/247 integration passes, four expected skips. Targeted HTTP test passes; `git diff --check` passes.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes: four topics, 19 stories/17 posts. Jobs query confirms next digest Nov 9 15:00 UTC; initial unsupported filtered `--check` invocation corrected to read-only jobs query.
- Updated TASKS/rollout plan; archived iterations 1393–1398 as PROGRESS exceeded 25 KB. No provider calls, migrations or generation changes; VM private.
- Next: pre-noon phase 1 backup/rollout/live checks and scheduled acceptance; runtime account registration/proxy verification remains pending. API/worker restart and health/reader checks follow commit.

## 2026-11-08: iteration 1411 — account runtime composition preparation

- Clean main/no leftovers; `pnpm obs alerts` zero, `/healthz` healthy, no failed user services. All 36 active sources recently successful/no current errors; digest queue has zero failures.
- Prepared unregistered runtime factory composing account handlers, services, crypto, Redis admission and stand-in delivery through injected repository ports. Main does not call it; accounts remain disabled.
- Disabled mode creates no dependencies; invalid flag/origin/key/mailbox/admin/signup configuration fails before resources. Separate HMAC-derived code/admission keys share one private 32-byte configuration secret.
- Two offline tests verify configuration rejection/lazy disable and temporary-mailbox code-to-session flow, normalized admin allowlisting, hashed tokens, replay rejection and all-device logout. No live provider calls or migrations.
- `pnpm format`, corrected `pnpm lint:fix`, `pnpm build`, full `pnpm check` pass: 654 unit/247 integration passes, four expected skips; initial lint found an unnecessary async validation callback, corrected before final checks.
- Scheduled reader check for Nov 8 passes: four topics, 19 stories/17 posts. Handbook checker exits zero; existing metadata warnings match unapplied edition/account tables. Updated TASKS and rollout plan.
- After verified commit: push main and restart API/worker; repeat health/reader checks. VM remains private. Phase 1 generation rollout waits for pre-noon window; activation waits for scheduled acceptance.

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
