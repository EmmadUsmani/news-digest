## 2026-11-08: iteration 1393 — rehearse system ownership on private restore

- Clean main/no leftovers; alerts zero, `/healthz` database/Redis healthy, no failed user units. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- Added `python3 ops/backups/rehearse_system.py`: fresh private snapshot backup, checksum/count-verified networkless restore, pending 0011/0012 SQL in one transaction, unconditional container cleanup.
- Final rehearsal: backup `news-digest-20261108T165928Z`, 30 tables/54,484 rows restored; all 29 original data-table full-row fingerprints and existing foreign keys unchanged. Schedule copied exactly; four ownership columns nullable.
- Injected failure after both migration files rolls back DDL, data and ledger entries. Receipt links backup/migration SHA256 checksums at `~/backups/news-digest/system-ownership-proof.json` (600); no row content printed, provider calls or secret reads.
- SQL rehearsal does not run the TypeScript migration runner or adapter/HTTP/AI acceptance; those remain separate gates. Updated TASKS, rollout plan and backup handbook command.
- Verification: four backup unit tests pass; handbook check passes (18 pages, no changed diagrams), with two existing unapplied edition_settings metadata warnings. `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/239 integration passes, four expected skips.
- No live migration/deployment/restart: STEERING 50's after-noon generation cutoff remains in force. Scratch container removed; live health remains green.
- Next: every-edition preserved-response comparisons, actual runner/adapter checks and AI-off/recorded-AI-on acceptance before pre-noon rollout. Phase 1 remains open.

## 2026-11-08: iteration 1394 — system ownership HTTP preservation

- Clean main/no leftovers; alerts zero, health database/Redis healthy, no failed user units. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- Extended isolated Nest HTTP acceptance to capture complete latest/direct/history responses for every original-owner fixture edition and all original history entries across every page, including private-edition 404s.
- Deep comparisons cover SYSTEM_OWNERSHIP off/on/off rollback with publication filtering enabled and disabled. Pagination must advance and terminate; original flag values restored after test.
- Initial full check exposed intentional foreign-owner history expansion from earlier fixtures; comparison now preserves original-owner entries while checking all pages and termination.
- This verifies isolated fixtures only; restored-production response preservation, actual restored-copy runner/adapter and AI-off/recorded-AI-on acceptance remain open.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/239 integration passes, four expected skips.
- `pnpm exec tsx scripts/check-handbook.ts public-access` checks 18 pages/no diagrams; exits 1 only for the two existing unapplied edition_settings metadata warnings. No handbook behavior changed.
- Updated TASKS and rollout plan. No provider calls, source/UI changes, secret reads or live data writes.
- No live migration/deployment/restart: STEERING 50 after-noon generation cutoff remains in force; flag stays off.
- Next: restored-copy migration runner and every-edition HTTP comparisons, then AI acceptance before pre-noon rollout. Phase 1 remains open.

## 2026-11-08: iteration 1395 — actual migration runner on private restore

- Clean main/no leftovers; alerts zero, live health database/Redis healthy, no failed user units. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- Extended `python3 ops/backups/rehearse_system.py` to execute the production TypeScript migration entry point twice against a fresh networkless restored backup, through a private Unix socket with no live configuration/provider credentials.
- Final backup `news-digest-20261108T172201Z`: 30 tables/54,514 rows restored; 29 original data-table fingerprints, foreign keys and schedule parity preserved; four ownership columns nullable. Second run preserves complete data and migration-ledger fingerprints including timestamps.
- Existing injected SQL failure still rolls back both pending migrations. Private receipt records actual-runner/idempotence checks and backup/migration hashes. Initial cleanup permission failure fixed; final run exits zero and removes scratch container/socket directory.
- Four backup unit tests pass. `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/239 integration passes, four expected skips.
- Handbook check (`backups`) renders 18 pages/no diagrams; only two existing unapplied edition_settings metadata warnings. Updated affected backup handbook, rollout plan and TASKS; archived iterations 1381–1385 to keep PROGRESS small.
- No provider calls, source/UI changes, live migration/deployment/restart: STEERING 50 after-noon generation cutoff remains in force; flag stays off.
- Next: restored-copy adapter/HTTP response comparisons and AI-off/recorded-AI-on acceptance before pre-noon rollout; phase 1 remains open.

## 2026-11-08: iteration 1396 — restored-copy adapter preservation

- Clean main/no leftovers; alerts zero, healthy live database/Redis, no failed user units. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- Added private restored-copy read-adapter acceptance to `python3 ops/backups/rehearse_system.py`: all 550 stored editions, complete latest/direct/paginated history with both publication filters, topics and schedule settings match SYSTEM_OWNERSHIP off/on/off.
- Fresh backup `news-digest-20261108T173020Z` restores 30 tables/54,524 rows; migration runner twice and injected rollback still pass. PostgreSQL enforces read-only comparison sessions; all data/ledger fingerprints unchanged after comparisons. Private receipt records parity; scratch socket/container removed.
- No restored content printed, provider calls or live writes. Updated TASKS, rollout plan and affected backup handbook; restored-copy HTTP and AI acceptance remain separate gates.
- Verification: four backup unit tests, `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass. Handbook (`backups`) checks 18 pages/no diagrams; only two existing unapplied edition_settings metadata warnings.
- Full check totals: 629 unit and 239 integration passes; four expected integration skips.
- No live migration/deployment/restart: STEERING 50 after-noon generation cutoff remains in force; flag stays off.
- Next: restored-copy HTTP comparisons and AI-off/recorded-AI-on acceptance before pre-noon rollout. Phase 1 remains open.

## 2026-11-08: iteration 1397 — restored-copy reader HTTP preservation

- Clean main/no leftovers; alerts zero, live database/Redis healthy, no failed user units. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- Extended the private restore harness with the production Nest reader controller/repository, bound only to loopback without worker/provider composition.
- Complete latest/direct/history HTTP responses for all 550 saved editions match ownership off/on/off with publication filtering enabled and disabled, including private 404s and terminating pagination.
- Fresh backup `news-digest-20261108T173745Z`: 30 tables/54,528 rows restored; read-only sessions and unchanged complete data/ledger fingerprints verified. Actual migration runner twice and injected rollback still pass.
- First rehearsal passed comparisons but failed cleanup because Nest and the script both closed the repository pool; removed duplicate close. Final rehearsal exits zero, writes the private receipt and cleans scratch resources.
- Four backup unit tests pass; scheduled-reader command: `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z`.
- Updated TASKS, rollout plan and backup handbook. Handbook check (`backups`) checks 18 pages/no diagrams; only two existing unapplied edition_settings metadata warnings.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/239 integration passes, four expected skips.
- No provider calls, live data writes, migration/deployment/restart: STEERING 50 after-noon generation cutoff remains in force; flag stays off.
- Next: AI-off/recorded-AI-on acceptance before pre-noon rollout; phase 1 remains open.

## 2026-11-08: iteration 1398 — isolated system test-edition generation

- Clean main/no leftovers; `pnpm obs alerts` zero, `/healthz` database/Redis healthy, no failed user units.
- Extended edition golden integration cases with SYSTEM_OWNERSHIP on: AI-off and synthetic fixture-AI private test editions preserve complete expected topic/story snapshots across two generations.
- Tests assert kind=test, unpublished state, published-reader exclusion and default-profile ownership; flag-off retrieval preserves the complete saved response.
- Development editors use a fresh per-edition cache; production repeats retain their existing cache assertions. No provider calls or live data writes.
- Initial checks found the fixture bridge omitted model/purpose stripped by development-json; first replacement missed formatted source, then corrected reconstruction from the development role.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/241 integration passes, four expected skips. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- No live migration/deployment/restart: STEERING 50 after-noon generation cutoff applies. Live flag-on test runs and normal scheduled acceptance remain open; synthetic fixtures do not close phase 1.
- Next: pre-noon private backup/migration/rollout and live test acceptance, then normal scheduled publication before phase 3 activation.

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
