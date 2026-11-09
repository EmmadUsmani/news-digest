## 2026-11-08: iteration 1436 — prepared browser sync lifecycle

- Clean main/no leftovers; alerts clear, health good and no failed user units. Sources healthy; digest-generation has zero failed jobs and next run Nov 9 15:00 UTC.
- Prepared disconnected account-sync lifecycle subscribes to store changes, uploads edits made during requests, suppresses server-write loops and reports failure with explicit/next-edit retry. Outages do not trigger repeated requests.
- Logout teardown cancels transport and unsubscribes before local clearing; offline tests verify queued uploads, retained choices after failure and late-response isolation. React store/account UI wiring remains pending.
- Accounts remain disabled and VM private; no migration, provider call or edition-generation change. Phase 1 awaits its pre-noon rollout window. Updated TASKS and rollout plan; no live handbook behavior changed.
- `pnpm format`, `pnpm lint:fix`, targeted lifecycle tests (3), `pnpm build` and handbook plan check pass (expected unapplied-table notes). Saved-reader check retains four topics/19 stories/17 posts. `pnpm check` passes: static checks, 682 unit tests and 253 integration tests/four expected skips. `git diff --check` passes.
- Commit/push then restart API/worker and repeat health/reader checks to match main. Next: React store/account UI integration with accounts disabled, then Phase 1 rollout in its permitted window.

## 2026-11-08: iteration 1437 — prepared browser account controller

- Clean main/no leftovers; alerts clear, health good and no failed user units. All 36 sources healthy; digest-generation has zero failed jobs and next run Nov 9 15:00 UTC.
- Prepared disconnected controller connects bounded session discovery, automatic sync, retry and single/all-device sign-out. Cancels uploads and invalidates delayed discovery before logout; confirmed logout/session loss clears account choices, initial signed-out discovery retains anonymous choices.
- Failed logout retains choices with uploads paused until explicit refresh. Seven offline tests cover discovery coalescing, logout races, delayed sync, malformed/oversized sessions, session loss and teardown. React store/account UI wiring pending.
- Accounts remain disabled and VM private; no migration, provider call or edition-generation change. Phase 1 awaits its pre-noon rollout window. Updated TASKS and rollout plan; no live handbook behavior changed.
- `pnpm format`, `pnpm lint:fix`, targeted controller tests (7), `pnpm build` and handbook plan check pass (expected unapplied-table notes). Saved-reader check retains four topics/19 stories/17 posts.
- Initial full check caught unsafe test-only request stringification; corrected the helper and reran targeted lint/tests plus the complete check. Final `pnpm check` passes: static checks, 689 unit tests and 253 integration tests/four expected skips; schema parity green. `git diff --check` passes.
- Commit/push then restart API/worker and repeat health/reader checks to match main. Next: React store/account UI wiring with accounts disabled, then Phase 1 rollout in its permitted window.

## 2026-11-08: iteration 1438 — prepared React account preference bridge

- Clean main/no leftovers; alerts clear, health good and no failed user units. All 36 sources healthy; digest-generation has zero failures and next run Nov 9 15:00 UTC.
- React preferences now expose a stable account read/write/subscribe/clear bridge. Local edits and cross-tab changes notify sync; server merges render and persist; confirmed logout removes browser storage. Blocked storage reports failure while updating the active reader.
- Three offline tests verify persistence/subscription teardown, blocked storage and the actual controller-to-bridge sync/logout path. Initial test callback lint errors corrected before the final complete check.
- Accounts remain disabled and VM private; no migration, provider call or edition-generation change. Updated TASKS and rollout plan; account UI wiring pending, Phase 1 awaits its pre-noon window. No live handbook behavior changed.
- `pnpm format`, `pnpm lint:fix`, targeted tests (3), `pnpm build` and plan handbook check pass (expected unapplied-table notes). `pnpm check` passes: 692 unit tests, 253 integration passes/four expected skips; static checks/schema parity green.
- `pnpm exec tsx scripts/smoke-reader-storage-reset.ts` passes desktop/mobile in both themes; four screenshots refreshed and mobile light inspected. `check-scheduled-reader.ts 2026-11-08T15:00:00Z` retains four topics/19 stories/17 posts. API/worker restarted healthy; `git diff --check` passes.
- Commit/push then repeat service restart and health/reader checks to match main. Next: account UI wiring with accounts disabled, then Phase 1 rollout in its permitted window.

## 2026-11-08: iteration 1439 — prepared React account lifecycle

- Clean main/no leftovers; alerts clear, health good and no failed user units. All 36 sources healthy; digest-generation has zero failures and next run Nov 9 15:00 UTC.
- Prepared gated React account hook owns controller discovery, refresh on visible tab return, retry/sign-out actions and request/listener teardown. Disabled binding makes no requests and leaves anonymous choices intact; unmount suppresses late callbacks.
- Three offline binding tests cover disabled/hidden gates, coalesced browser events and delayed discovery after cancellation. Isolated Playwright React StrictMode harness verifies disabled gate, discovery/sync, logout storage removal and gate-off/unmount cleanup; fixture account responses only, no live accounts.
- Initial full check caught React's effect-state rule; replaced redundant effect reset with disabled-state rendering. Accounts remain disabled; no migration, provider call or edition-generation change. Phase 1 awaits its pre-noon window; account UI wiring next.
- Verification: `pnpm format`, `pnpm lint:fix`, targeted binding tests (3), `pnpm build`, `pnpm check`, `check-handbook.ts public-access-plan` and `git diff --check`. Final full check passes: 695 unit tests, 253 integration passes/four expected skips; static checks/schema parity green. Handbook notes only expected unapplied account tables. Saved reader remains four topics/19 stories/17 posts via `check-scheduled-reader.ts 2026-11-08T15:00:00Z`.
- Archived iterations 1422–1426 to keep PROGRESS under 25 KB. Commit/push then restart API/worker and repeat health/reader checks so live matches main. No live handbook behavior changed; rollout plan and TASKS updated.

## 2026-11-09: iteration 1440 — bound Phase 1 migration rollout

- Clean main/no leftovers; alerts clear, `/healthz` good and no failed user units. Pre-noon window opened during this iteration; Phase 1 takes priority over further account UI preparation.
- Found ordinary `pnpm migrate` would also apply prepared account migrations. Added exact `MIGRATE_THROUGH` journal-tag stopping point; unknown/empty tags roll back. Default remains all pending migrations. Database acceptance covers bounded rollout then concurrent completion and rollback recovery.
- Fresh private backup and `python3 ops/backups/rehearse_system.py` pass: actual runner twice through 0012 only, account migrations pending; 29 original table fingerprints, injected rollback, settings parity, unchanged foreign keys, complete adapter/HTTP off/on/off comparisons. Restore verifies 30 tables/56,630 rows.
- Updated rollout plan and affected handbook pages. No live migration, flag activation, provider call or account route registration; Phase 1 live rollout is next within the open pre-noon window.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` pass (695 unit, 253 integration passes/four expected skips; schema parity green). `check-handbook.ts stack-and-runtime` and `10-backups` render/link checks pass with expected unapplied-table metadata notes. `check-scheduled-reader.ts 2026-11-08T15:00:00Z` retains four topics/19 stories/17 posts. No UI change.
- Commit/push then restart API/worker and repeat health/reader/alerts checks to match main. Next: fresh backup immediately before each live Phase 1 migration, bounded through 0012, then flag-on AI-off/AI-on private tests and scheduled acceptance.

## 2026-11-09: iteration 1441 — apply live Phase 1 foundation

- Clean main/no leftovers; alerts clear, health good and no failed user units. Sources continue returning real content; digest queue has zero failures, next run Nov 9 15:00 UTC.
- Fresh `python3 ops/backups/rehearse_system.py` passes actual runner twice, injected rollback, 29 original fingerprints and complete adapter/HTTP off/on/off parity for 550 saved editions; restore verifies 30 tables/56,643 rows.
- Applied live `MIGRATE_THROUGH=0011_system_edition_settings pnpm migrate` after private backup `20261109T000639Z`; applied `MIGRATE_THROUGH=0012_nullable_system_ownership pnpm migrate` after separate private backup `20261109T000647Z`. No account migrations applied.
- Live SQL verifies exact schedule parity, four nullable ownership columns and zero null ownership rows. `SYSTEM_OWNERSHIP` remains off; accounts remain disabled and VM private. No provider calls or development spend.
- Updated rollout plan, affected data-model handbook and TASKS. Phase 1 acceptance remains open; next activate system scope before noon, verify private AI-off/AI-on generation, then normal scheduled acceptance.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (695 unit; 253 integration/four expected skips), `pnpm build`, `check-handbook.ts 07-data-model` (31 live tables; only expected pending-account metadata notes), `git diff --check` pass. No UI change.
- `check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes before/after migrations: four topics/19 stories/17 posts. Commit/push, then restart API/worker and repeat health, source, queue and alerts checks to match main.

## 2026-11-09: iteration 1442 — enable live system ownership

- Clean main/no leftovers. Alerts clear, health good and no failed user units; 36 enabled sources have no errors (28 with stored content in the last day). Digest queue has zero failures; next scheduled edition Nov 9 15:00 UTC.
- Added explicit `--live-read-only` mode to the existing complete adapter/HTTP comparison. It forces read-only database connections, verifies that setting, composes no providers/queues and suppresses private content on failure. Default restored-copy guard remains intact.
- Live comparison passes before activation and against rebuilt code: all 550 saved editions, both publication filters, full direct/latest/history responses, topics/settings across off/on/off. Initial CLI launch used pnpm's node shim and failed; direct `/usr/bin/node` works with the private env file and the app's default database URL.
- Enabled `SYSTEM_OWNERSHIP=1` in private service configuration before noon; restarted API/worker and verified both process environments. Served latest/history response hashes unchanged. No migration, account activation or provider call; VM remains private.
- Updated rollout plan, affected data-model handbook and TASKS. Phase 1 stays open: private live AI-off/AI-on generation checks next, then normal scheduled acceptance. Roll back the newest flag first if the scheduled edition is abnormal.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`; live comparison command documented in the plan; `check-scheduled-reader.ts 2026-11-08T15:00:00Z` retains four topics/19 stories/17 posts. `check-handbook.ts 07-data-model` renders/links pass; exit 1 is solely expected pending-account metadata (31 live tables). `pnpm check` passes: 695 unit tests; 253 integration passes/four expected skips; static checks and schema parity green.
- `git diff --check` passes. Commit/push, then restart API/worker and repeat health/reader/alerts checks so live matches main.

## 2026-11-09: iteration 1443 — live system-owned AI-off generation

- Clean main/no leftovers; alerts clear, health good and no failed user units. All 36 sources healthy; digest queue has zero failures and next publication is Nov 9 15:00 UTC. Retained ingestion failures remain unchanged.
- Ran `env LLM_LIVE=0 /usr/bin/node --env-file=/home/exedev/.config/news-digest/env --import tsx apps/api/scripts/smoke-previews.ts` against the live flag-on API. Stored real content supplies 466 candidates and 20 selected stories across four topics, all non-AI.
- Private edition `6146800b-84b6-4b59-9940-7e43a38cb276` stays unpublished, reader direct request returns 404 and latest reader response is unchanged. Admin saved snapshot and every history/detail response pass. SQL assertions confirm default-profile rollback ownership and an empty development spend ledger. No provider calls.
- `/usr/bin/node --env-file=/home/exedev/.config/news-digest/env --import tsx apps/api/scripts/rehearse-system-reads.ts --live-read-only` passes complete adapter/HTTP off/on/off comparisons for all 551 editions, both publication filters, topics and settings.
- Updated TASKS and rollout plan; archived iterations 1427–1429 to keep PROGRESS small. No code/UI/runtime behavior change; accounts disabled, VM private. AI-on generation and normal flag-on scheduled acceptance remain open.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` pass (695 unit; 253 integration passes/four expected skips), plus `pnpm build` and `git diff --check`. `check-scheduled-reader.ts 2026-11-08T15:00:00Z` retains four topics/19 stories/17 posts. No UI change.
- Commit/push, then restart API/worker and repeat health, reader and alerts checks to match main. Next: budgeted live AI-on private generation, then scheduled acceptance; no phase closure claimed.

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
