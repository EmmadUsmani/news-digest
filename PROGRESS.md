## 2026-11-08: iteration 1430 — prepared cascading reader sync storage

- Clean main/no leftovers; alerts clear, health good, no failed user units. All 36 sources healthy; digest-generation queue has zero failures and next scheduled run Nov 9 15:00 UTC.
- Prepared unapplied migration 0016 and Drizzle schema for per-user hidden-topic changes and bookmark display copies/removal tombstones. Composite keys, bounded keys/JSON and cascading identity ownership preserve historical items without content foreign keys.
- Explicitly revoke PUBLIC/operational-reader grants, including inherited defaults. Isolated tests verify privacy, invalid rows, duplicate/orphan rejection, time-zone handling, tombstones, deletion/rollback and another account's survival.
- Accounts remain disabled and VM private. No live migration, provider call or edition-generation change. Sync repositories, merge/admission limits and main wiring remain pending; Phase 1 awaits pre-noon rollout and scheduled acceptance.
- Updated rollout plan and schema metadata; archived progress entries 1412–1421 to keep orientation small. No handbook behavior changed because storage remains unapplied.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `pnpm build` pass: 670 unit tests, 252 integration passes/four expected skips, schema parity and static checks green. Handbook plan check reports only expected notes for unapplied tables.
- Saved-reader check verifies four topics/19 stories/17 posts. Commit/push then restart API/worker and repeat health/reader checks to match main. Next: sync repository and bounded merge preparation, then Phase 1 rollout in its allowed window.

## 2026-11-08: iteration 1431 — bounded reader sync merge policy

- Clean main/no leftovers; alerts clear, health good, all 36 sources healthy. Digest queue has zero failed jobs and next run Nov 9 15:00 UTC.
- Prepared server merge validates bounded keys, timestamps and display copies; latest changes win with browser-compatible ties. Removal tombstones survive and count toward 1,000 bookmark/1,000 topic key limits; invalid or over-capacity unions reject without changing inputs.
- Offline coverage verifies browser parity, convergence, equal-clock removals, newest topic choices, prototype-shaped keys, copy isolation and fail-closed validation/capacity. Persistence must serialize read/merge/write per reader before wiring.
- Accounts remain disabled; VM private. No live migration, provider call or edition-generation change. Updated TASKS and rollout plan; no handbook behavior changed.
- Initial build caught TypeScript indexed narrowing; lint caught missing void on tests. Both corrected. Targeted tests (4), pnpm format, pnpm lint:fix and final pnpm build pass; handbook plan check has only expected unapplied-table notes.
- Final pnpm check passes: static checks, 674 unit passes, 252 integration passes/four expected skips. git diff --check passes. Saved-reader check retains four topics/19 stories/17 posts. Commit/push then restart API/worker and repeat health/reader checks to match main. Next: per-reader locking sync repository, then Phase 1 pre-noon backup/rollout and scheduled acceptance.

## 2026-11-08: iteration 1432 — prepared locking reader sync repository

- Clean main/no leftovers; alerts clear, health good, no failed user units. All 36 sources have no current errors; digest queue has zero failures and next scheduled run Nov 9 15:00 UTC. Retained ingestion/social failures unchanged.
- Prepared unregistered repository locks the identity row across read/merge/write, serializing first sync, concurrent devices and account deletion. Validates/copies incoming changes before waiting; bounded replacement preserves display copies and tombstones.
- Isolated acceptance passes for concurrent devices, millisecond display-copy round trips, stale updates, reader isolation, capacity/validation rejection, injected write rollback and deleted-identity rejection.
- Accounts remain disabled and VM private. No live migration, provider call or edition-generation change. Updated TASKS and rollout plan; HTTP/browser sync wiring remains pending. Phase 1 still awaits pre-noon backup/rollout and scheduled acceptance.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and handbook plan check pass (expected unapplied-table notes). Saved-reader check verifies four topics/19 stories/17 posts. Final `pnpm check` passes: static checks, 674 unit passes, 253 integration passes/four expected skips. `git diff --check` passes.
- Commit/push then restart API/worker and repeat health/reader checks to match main. Next: sync application/HTTP wiring preparation, then Phase 1 rollout in its permitted window.

## 2026-11-08: iteration 1433 — prepared authenticated reader sync HTTP

- Clean main/no leftovers; alerts clear, health good, no failed user units. Sources pass `pnpm obs sources --check`; digest-generation has zero failed jobs and next run Nov 9 15:00 UTC.
- Prepared POST `/api/account/sync` derives identity only from the session cookie, requires same-origin JSON, validates/copies versioned changes before persistence and returns merged state with session renewal. Streamed sync bodies are bounded to 16 MiB; login routes retain 2 KiB limits.
- Offline HTTP acceptance covers disabled routes, unauthenticated/cross-origin requests, forged identity fields, invalid state, payloads beyond login limits, stale changes, empty-state reads, oversized rejection and credential-free storage failures. Existing account transport/handler tests also pass (six targeted tests total).
- Accounts remain disabled and VM private; runtime injection/browser wiring pending. No live migration, provider call or edition-generation change. Updated TASKS and rollout plan; no live handbook behavior changed.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and handbook plan check pass (expected unapplied-table notes). `check-scheduled-reader.ts 2026-11-08T15:00:00Z` retains four topics/19 stories/17 posts. Final `pnpm check` passes: static checks, 675 unit passes, 253 integration passes/four expected skips. `git diff --check` passes.
- Commit/push then restart API/worker and repeat health/reader checks to match main. Next: sync runtime injection and browser wiring preparation; Phase 1 rollout remains gated on its permitted window.

## 2026-11-08: iteration 1434 — prepared reader sync runtime injection

- Clean main/no leftovers; alerts clear, health good, no failed user units. All sources pass `pnpm obs sources --check`; digest-generation has zero failures and next run Nov 9 15:00 UTC.
- Prepared account runtime now requires and injects the reader sync repository, retaining lazy disabled composition. Extended isolated runtime acceptance covers shared persisted state, stale changes, reader isolation and rejection after account deletion.
- Accounts remain disabled and VM private; browser wiring and main registration pending. No live migration, provider call or edition-generation change. Phase 1 rollout awaits its pre-noon window and scheduled acceptance.
- Updated TASKS and rollout plan; no live handbook behavior changed. Targeted account runtime tests pass (2); handbook plan check has only expected unapplied-table notes. Saved-reader check retains four topics/19 stories/17 posts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `pnpm build` pass: 675 unit tests, 253 integration passes/four expected skips, static checks and schema parity green. `git diff --check` passes.
- Commit/push then restart API/worker and repeat health/reader checks to match main. Next: browser account-sync wiring preparation, then Phase 1 rollout in its permitted window.

## 2026-11-08: iteration 1435 — prepared browser account-sync transport

- Clean main/no leftovers; alerts clear, health good and no failed user units. All 36 sources healthy; digest-generation has zero failures and next run Nov 9 15:00 UTC.
- Prepared disconnected browser client sends same-origin cookie-authenticated JSON, bounds requests/responses to 16 MiB and rejects malformed state before local writes. Coalesces concurrent requests and merges edits made while awaiting the server.
- Stopping the client aborts transport and invalidates delayed responses before logout clears local data. Failures preserve local choices, hide server details and allow retry; four offline tests cover these paths including invalid local input.
- Accounts remain disabled and VM private; no live migration, provider call or edition-generation change. Updated TASKS and rollout plan; account UI/store wiring pending and Phase 1 awaits its permitted window. No live handbook behavior changed.
- `pnpm format`, `pnpm lint:fix`, targeted tests (4), `pnpm build` and handbook plan check pass (expected unapplied-table notes). Saved-reader verification retains four topics/19 stories/17 posts. Final `pnpm check` passes: 679 unit tests, 253 integration passes/four expected skips; static checks and schema parity green. `git diff --check` passes.
- Two initial observability invocations used unsupported command/flag order; corrected to `pnpm obs jobs --queue digest-generation --limit 2`, which confirmed the healthy queue above.
- Commit/push then restart API/worker and repeat health/reader checks to match main. Next: account UI/store sync wiring preparation, then Phase 1 rollout in its permitted window.

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
