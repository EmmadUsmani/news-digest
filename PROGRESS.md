## 2026-11-08: iteration 1399 — private reader identity/session schema preparation

- Clean main/no leftovers; `pnpm obs alerts` zero, `/healthz` database/Redis healthy, no failed user units.
- Phase 1 live rollout remains behind the pre-noon cutoff; STEERING 50 authorizes preparing the next phase while awaiting acceptance. Started phase 3 without activating accounts.
- Unapplied additive migration 0013 adds independent users/sessions: normalized unique emails, unique SHA-256 hash-shaped tokens, sign-in admin eligibility, cookie renewal timestamps and cascading deletion. No server session expiry or profile dependency.
- Migration revokes PUBLIC and existing Grafana/metrics-role table privileges. Isolated tests also recreate it under permissive default grants and prove both operational roles cannot read either table.
- Constraint, foreign-key, uniqueness, timezone, cookie-renewal/sign-in preservation and account-deletion checks pass. Application validation, authentication and account routes remain future work; schema alone provides no sign-in.
- Updated rollout plan, affected data-model handbook and schema metadata; compacted TASKS historical detail into existing evidence links.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` pass: 629 unit/243 integration passes, four expected skips. `git diff --check` passes.
- `pnpm exec tsx scripts/check-handbook.ts data-model`: 18 pages/3 unchanged diagrams pass; six metadata warnings reflect three prepared tables absent live (edition_settings/users/sessions).
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z`: four topics, 19 stories/17 posts; no provider calls or live data writes.
- No migration/deployment/restart under the after-noon edition-generation cutoff; account routes remain absent and disabled. Phase 1 rollout/acceptance stays first, then further phase 3 preparation while waiting.

## 2026-11-08: iteration 1400 — offline reader session lifecycle

- Clean main/no leftovers; `pnpm obs alerts` zero, `/healthz` database/Redis healthy, no failed user units.
- Phase 1 awaits its pre-noon rollout; prepared the next phase without connecting account routes, enabling flags or changing generation.
- Added session repository/token ports, Node crypto adapter and application lifecycle: 32 random bytes, SHA-256-only storage, host-only HttpOnly/Secure/SameSite=Lax cookies capped at 400 days.
- Daily cookie renewal uses an atomic repository claim and preserves sign-in age; readers never expire server-side. Admin requires sign-in eligibility, current allowlisting and age strictly below seven days.
- Added single/all-device revocation and six offline tests covering malformed/unknown tokens, renewal races, old readers, exact admin cutoff and allowlist changes.
- Initial lint found floating test promises/unnecessary assertions; corrected them. `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` pass: 635 unit/243 integration passes, four expected skips. `git diff --check` passes.
- Scheduled-reader check: four topics, 19 stories/17 posts. No provider calls, live writes, migrations or restarts; after-noon generation deployment cutoff remains in force.
- Updated TASKS and rollout plan. Next: prepare session database adapter while waiting; phase 1 rollout/live test editions/scheduled acceptance remain first. Accounts stay disabled.

## 2026-11-08: iteration 1401 — isolated session database adapter

- Clean main/no leftovers; `pnpm obs alerts` zero, `/healthz` database/Redis healthy, no failed user units.
- Prepared unregistered Drizzle session repository: joined identity reads, transactional creation, atomic renewal claims and single/all-device revocation; accounts stay disabled.
- Isolated Postgres checks cover timestamp/identity mapping, eight competing renewals with one winner, preserved sign-in age, idempotent sign-out, user isolation, revoked-session renewal refusal, cascading deletion and rejected invalid creation.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` pass: 635 unit/244 integration passes, four expected skips. `git diff --check` passes.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z`: four topics, 19 stories/17 posts. No provider calls or live writes.
- Updated rollout plan/TASKS and archived iterations 1386–1392 to keep PROGRESS small. Initial orientation output was overbroad; subsequent reads were narrowed.
- No live migration or restart: the after-noon generation deployment cutoff remains in force. Prepared code is unregistered; running behavior unchanged.
- Next: pre-noon phase 1 backup/rollout/live test acceptance and scheduled acceptance first; prepare account identity/code exchange while waiting, with flags off.

## 2026-11-08: iteration 1402 — offline login-code lifecycle

- Clean main/no leftovers; alerts zero, `/healthz` database/Redis healthy, no failed user units. Initial orientation output was overbroad; subsequent reads narrowed.
- Prepared disconnected login-code application and admission/delivery/repository ports: normalized emails, generic request response, ten-minute challenges, per-email/client admission and eligibility on request/redemption.
- Crypto uses unbiased six-digit generation, email-bound keyed SHA-256 hashes and constant-time comparison; configuration requires a separate key of at least 32 bytes. No key configured or printed.
- Repository contract requires atomic expiry/future checks, five-attempt accounting and single consumption. Database implementation, Redis limits, mailbox and verified account exchange remain next; in-memory tests do not establish database concurrency safety.
- Six offline tests cover replay, exact expiry, malformed guesses, attempt limits, admission denial and key/email binding. Initial lint failures corrected (test promises and unnecessary assertions).
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 641 unit/244 integration passes, four expected skips. Scheduled-reader check: four topics, 19 stories/17 posts. No provider calls or live writes.
- Updated TASKS and public-access plan. No migration/restart under the after-noon generation cutoff; account code remains disconnected and disabled.
- Next: phase 1 pre-noon private backup/rollout/live test acceptance and scheduled acceptance first; prepare atomic login-code persistence and stand-in mailbox while waiting.

## 2026-11-08: iteration 1403 — private stand-in mailbox preparation

- Clean main/no leftovers; alerts zero, `/healthz` database/Redis healthy, no failed user units.
- Prepared unregistered file delivery adapter: atomic replacement, owner-only directory/files, hashed recipient filenames, permission/ownership checks and no-follow message reads. No messages go to service logs.
- Added explicit owner retrieval CLI and SSH command in the public-access plan; expired/missing messages return no code. No live mailbox configured and accounts remain disabled.
- Offline test covers recipient isolation, eight concurrent replacements, expiry, temporary-file cleanup, unsafe permissions and directory symlinks.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass; 642 unit/244 integration passes, four expected skips.
- Scheduled-reader check passes: four topics, 19 stories/17 posts. No provider calls, live writes or migrations; no restart because adapter is disconnected and generation deployment cutoff remains in force.
- Updated TASKS and rollout plan. Next: phase 1 pre-noon backup/rollout/live tests/scheduled acceptance; prepare atomic login-code persistence and Redis limits while waiting.

## 2026-11-08: iteration 1404 — shared Redis login admission preparation

- Clean main/no leftovers; alerts zero, `/healthz` database/Redis healthy, no failed user units. Initial orientation output was overbroad; follow-up reads narrowed.
- Prepared unregistered Redis login admission: shared ten-minute windows, 10 attempts/email and 50/client across requests/redemption; atomic counters include blocked attempts in both dimensions.
- Counter keys use keyed SHA-256 hashes; Redis errors deny admission without exposing backend detail. Eligibility remains a separate injected policy; verified proxy client extraction is required before registration.
- Isolated Redis checks cover competing adapters, normalized email limits, independent client limits, TTL/expiry, hashed keys, policy delegation, invalid configuration and backend failure.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 642 unit/245 integration passes, four expected skips.
- Scheduled-reader check passes: four topics, 19 stories/17 posts. No provider calls, live writes or migrations; accounts remain disabled.
- No restart: disconnected adapter does not change runtime behavior; generation deployment remains barred after noon. Updated TASKS and rollout plan.
- Next: pre-noon phase 1 private backup/rollout/live tests and scheduled acceptance; prepare atomic database challenges/account exchange with flags off while waiting.

## 2026-11-08: iteration 1405 — atomic database login challenge preparation

- Clean main/no leftovers; `pnpm obs alerts` zero, `/healthz` database/Redis healthy, no failed user units.
- Prepared unapplied additive migration 0014 and unregistered Drizzle challenge adapter: keyed hashes only, normalized email, expiry/attempt constraints and explicit operational-role/PUBLIC denial.
- Row locks serialize guesses and successful consumption across adapters; replacement resets attempts and consumed state. Comparison exceptions roll back.
- Isolated PostgreSQL test verifies twelve competing redemptions yield one winner, twelve bad guesses stop at five, exact expiry/future rejection, replacement, rollback and no reader-role grants.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` pass: 642 unit/246 integration passes, four expected skips. `git diff --check` passes.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes: four topics, 19 stories/17 posts. No provider calls or live writes.
- Handbook `check-handbook.ts 07-data-model`: pages/diagrams checked; metadata warnings remain for deliberately unapplied edition_settings/users/sessions/login_codes tables. Updated account table metadata and preparation note.
- No migration/restart: accounts remain disconnected and disabled; generation deployment cutoff respected. Updated TASKS and rollout plan.
- Next: pre-noon phase 1 private backup/rollout/live checks and scheduled acceptance first; account exchange/routes with flags off while waiting.

## 2026-11-08: iteration 1406 — verified login exchange preparation

- Clean main/no leftovers; `pnpm obs alerts` zero, `/healthz` database/Redis healthy, no failed user services.
- Prepared disconnected code-to-session exchange: only the normalized identity proven by an atomically consumed challenge can create a reader session. No caller identity/admin flags accepted.
- Added unregistered Drizzle identity adapter; concurrent first logins reuse one identity and preserve creation time. No migration needed beyond pending 0013/0014.
- Isolated test covers competing first logins/redemptions, replay and admission rejection, identity reuse, secure cookies, hashed session storage, revocation and consumed-proof rejection after storage failure.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` pass: 642 unit/247 integration passes, four expected skips. `git diff --check` passes.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes: four topics, 19 stories/17 posts.
- `pnpm exec tsx scripts/check-handbook.ts 07-data-model`: 18 pages/three diagrams checked; expected metadata warnings remain for deliberately unapplied tables. Updated affected handbook and rollout plan.
- No provider calls/live writes/migrations/restarts: adapters remain disconnected and accounts disabled; edition-generation deployment cutoff respected.
- Next: pre-noon phase 1 backup/rollout/live checks and scheduled acceptance first; prepare flag-off account HTTP boundary and signup policy while waiting.

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
