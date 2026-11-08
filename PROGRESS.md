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

## 2026-11-08: iteration 1427 — coordinated sign-in-link redemption

- Clean main/no leftovers; alerts clear, health good, no failed user units. All 36 sources healthy; scheduled digest completed, retained ingestion/social failures unchanged.
- Prepared link redemption reads the stored recipient to select the shared lock, rechecks atomic consumption after waiting, and holds coordination through identity/session persistence. A deletion while waiting prevents identity recreation; lock failure consumes nothing.
- Added read-only recipient lookup to the unregistered repository. Offline tests cover waiting/deletion, lock errors, session-write coverage and single-use replay; isolated storage checks cover validity boundaries, repeatable lookup and consumed links.
- Accounts remain disabled and VM private. No live migration, generation change or provider call. Deletion coordination remains pending before activation; Phase 1 awaits the pre-noon rollout window.
- Updated TASKS and rollout plan. Targeted tests pass (10); build and handbook plan check pass (expected metadata notes for unapplied tables). Saved-reader verification retains four topics/19 stories/17 posts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: static checks, 670 unit passes, 251 integration passes/four expected skips. API/worker restarted; health and scheduled-reader verification pass. Commit/push then repeat restart/check to match main.
- Next: coordinate deletion before activation; pre-noon Phase 1 backup/rollout and scheduled acceptance remain next for deployment.

## 2026-11-08: iteration 1428 — coordinated account deletion

- Clean main/no leftovers; alerts clear, health good, all 36 sources healthy and digest queue has no failures. Accounts remain disabled; VM private.
- Prepared deletion resolves its recipient from the stored session, requires the shared recipient lock before opening its transaction, then rechecks session ownership. Coordination failure performs no cleanup or deletion; the lock covers mailbox cleanup and commit.
- Isolated storage coverage adds deterministic logout while waiting and fail-closed lock failure; existing concurrent deletion, rollback and recipient isolation checks retained. First integration run caught an undefined test-harness callback; fixed before final verification.
- Updated TASKS and rollout plan. No live migration, provider call or edition-generation change. Runtime deletion injection and sync-data cascades remain pending; Phase 1 awaits pre-noon backup/rollout.
- `pnpm format`, `pnpm lint:fix`, build and handbook plan check pass (expected notes for unapplied account tables). API/worker restarted; health and scheduled-reader check verify four topics/19 stories/17 posts.
- Final `pnpm check` passes: static checks, 670 unit tests, 251 integration passes/four expected skips. `git diff --check` passes. Commit/push then restart and repeat health/reader checks to match main. Next: runtime deletion composition, then Phase 1 rollout in its allowed window.

## 2026-11-08: iteration 1429 — composed account deletion

- Clean main/no leftovers; alerts clear, health good, all 36 sources healthy and digest queue has no failures. Retained ingestion/social failures unchanged; accounts disabled and VM private.
- Prepared runtime now requires a deletion repository and supplies its configured mailbox cleanup to the lazy dependency factory. Isolated composition uses the same recipient coordinator for issuance, redemption and deletion; main still installs no account routes.
- Extended cross-runtime storage acceptance to delete a friend without affecting the owner, revoke sessions across runtimes, remove the owner's mailbox code, clear the cookie and reject repeated deletion. Sync-data cascades remain pending before activation.
- Updated TASKS and rollout plan. No live migration, provider call or edition-generation change; Phase 1 awaits pre-noon private backup/rollout and scheduled acceptance.
- Targeted runtime tests pass (2); `pnpm format`, `pnpm lint:fix`, `pnpm build` and handbook plan check pass (expected metadata notes for unapplied tables). API/worker restarted; health and scheduled-reader check retain four topics/19 stories/17 posts.
- Final `pnpm check` passes: static checks, 670 unit tests, 251 integration passes/four expected skips. `git diff --check` passes. Commit/push then restart and repeat health/reader checks to match main. Next: sync-data cascades and main registration; Phase 1 rollout remains gated on its allowed window.

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
