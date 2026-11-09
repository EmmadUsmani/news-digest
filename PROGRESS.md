## 2026-11-09: iteration 1511 — repair free private-test browser verification

- Clean main/no leftovers. Alerts clear, healthz passes, no failed user services; source/queue checks pass. Published Nov 8 reader still has four topics/19 stories/17 posts and next scheduled run remains 15:00 UTC.
- Repaired `smoke-admin-new-edition.ts` for the current synchronous private-test endpoint, free-default copy and create-test button. Intercepted responses cover custom-window rejection, successful inspection link, failure recovery and empty legacy job storage; both paid options must remain false. Unexpected browser writes remain blocked.
- Desktop/mobile light/dark replay passes with no real writes or provider calls; latest protected preview unchanged. Refreshed and visually inspected all four screenshots. No product/handbook changes.
- Legacy edition-jobs exploration deliberately reverted: its resumed-job recovery scenarios need separate adaptation, rather than conflating latest private and published editions. TASKS retains that follow-up. Archived iterations 1496–1498.
- Verification: browser replay and build pass (existing bundle warning). Initial full check was SIGTERM-terminated during unit tests; retry caught script import formatting after an edit, fixed with required autofix. Final `pnpm check` passes (741 unit/263 integration, four expected skips); `pnpm format`, `pnpm lint:fix` and `git diff --check` pass.
- No restart under STEERING 22: only verification scripts/screenshots/docs changed. Accounts/public mode stay off; next product work is audit enforcement/controller replacement/proxy proof, then normal scheduled acceptance.

## 2026-11-09: iteration 1512 — repair resumed legacy-job browser verification

- Clean main/no leftovers; alerts, healthz and user services healthy. Source/queue checks pass; Nov 9 scheduled run remains 15:00 UTC and existing historical failed attempts have recovered successors.
- Repaired `smoke-edition-jobs.ts` for resumed legacy jobs: seed session storage instead of submitting through the retired create flow, validate private-preview and published-reader records independently, and link completion to the private preview.
- Desktop/mobile light/dark replay covers queued/active stages, reload, reconnect, malformed/mismatched responses, real polling deadline, completion, failure and expired-job cleanup. All unexpected browser writes are blocked; no browser credentials or provider calls. Full saved preview, reader edition, topics and profile unchanged.
- First replay exposed a mobile test setup race: storage could be consumed before reload while the page mounted. Waiting for the create form before seeding fixes it; complete four-case rerun passes. Refreshed and visually inspected 12 screenshots.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, browser replay and `git diff --check` pass; existing bundle warnings. Combined check received SIGTERM after all 741 unit/263 integration passes (four skips); standalone `pnpm check` retry exits successfully with the same counts.
- No restart under STEERING 22: only verification/screenshots/task records changed. Accounts/public mode remain off. Next: account audit enforcement/controller replacement/proxy proof and normal 15:00 scheduled Phase 1 acceptance.

## 2026-11-09: iteration 1513 — prepare fail-closed admin-write audit admission

- Clean main/no leftovers; alerts clear, healthz/services healthy, 36 sources and four queues pass checks. Saved reader remains four topics/19 stories/17 posts; no provider calls, live migrations or configuration changes.
- Prepared public authorization now requires a trusted UUID/local-script actor and an awaited audit recorder before any classified admin write reaches its handler. Missing recorder/actor, invalid UUID or persistence failure returns empty no-store 503; unauthorized requests do not record or execute.
- Admission entries copy only actor, method, classified path and time, excluding query strings, request bodies and credentials. They record attempted execution, not successful mutation; transactional outcome audit remains necessary.
- Real HTTP tests verify delayed persistence blocks execution, storage failures prevent writes, refusals stay private, reads/disabled mode bypass recording and both actor types work. Existing authorization test now expects writes without a recorder to refuse.
- Updated TASKS/public-access plan. Durable recorder, trusted account/local actor composition, transactional mutation audit, controller replacement and live proxy proof remain open. Normal 15:00 scheduled Phase 1 acceptance still required.
- Verification: five targeted HTTP tests, pnpm format, pnpm lint:fix, pnpm build and pnpm check pass (742 unit/263 integration, four expected skips); existing bundle warning only. git diff --check passes.
- No restart under STEERING 22: live entrypoints do not import this prepared policy. Accounts/public mode remain off.

## 2026-11-09: iteration 1514 — compose trusted admin-write audit actors

- Clean main/no leftovers; alerts and healthz clear, no failed user services. All 36 sources pass freshness checks; four queues available. Saved reader remains four topics/19 stories/17 posts.
- Prepared account authorization now derives the audit UUID directly from persisted sessions, recomputes freshness/allowlisting, and keeps identity out of current-session JSON. Validated direct local scripts receive an explicit script actor.
- Prepared public composition accepts an awaited audit recorder and shared clock. Missing/failed recording still blocks writes; forwarded requests cannot use script credentials. No durable recorder or transactional outcome audit is claimed.
- Three targeted HTTP tests pass, including actor identity, query exclusion, failed storage, local-script refusal through forwarding, removed admin allowlisting, expiry, renewal, revocation and lazy disabled composition.
- Updated TASKS/public-access plan; archived iterations 1499–1501. No live configuration, migrations, provider calls or UI changes. Policy remains uninstalled/accounts disabled; no restart under STEERING 22.
- Verification: pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass; 742 unit/263 integration passes, four expected skips. Existing build bundle warning only.
- Next: durable audit recorder storage, transactional mutation outcomes, controller replacement and proxy proof; normal scheduled Phase 1/X/Bluesky acceptance remains due at 15:00 UTC.

## 2026-11-09: iteration 1515 — prepare durable admin-write admission storage

- Clean main/no leftovers; alerts, healthz and user services healthy. `pnpm obs sources --check` passes all 36 sources; `pnpm obs jobs --check` passes four available queues. Saved reader remains four topics/19 stories/17 posts.
- Prepared additive migration 0018 and unregistered Drizzle recorder store only user/local-script actor, method, classified path and time. Actor exclusivity, bounded paths and methods are constrained; user deletion cascades personal admission rows. No query strings, bodies or credentials are stored.
- Isolated acceptance covers both actors, rejected paths/reads/invalid time/unknown identity, database refusal without partial records and identity cleanup. Extended inherited-default-grant checks deny all privileges to operational/PUBLIC readers on the new table; schema parity covers its columns, checks and foreign key.
- First full check exposed a test assertion expecting the raw trigger error; Drizzle wraps it as the cause. Corrected the assertion to inspect that cause; no adapter behavior change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` and `git diff --check` pass. Handbook checker renders 18 pages/three diagrams with no link/render failures; schema metadata warns because eight prepared account tables remain unapplied on live DB.
- Updated TASKS, rollout plan, handbook and schema metadata. No provider calls, live migrations, configuration changes or UI changes. No restart under STEERING 22: this recorder remains unregistered and the policy uninstalled; accounts/public mode stay off.
- Next: inject durable recorder, transactional mutation outcomes, controller replacement and proxy proof; scheduled Phase 1/X/Bluesky acceptance remains due at 15:00 UTC. Backup account rehearsal currently stops at 0017; extend through 0018 before any live account migration.

## 2026-11-09: iteration 1516 — extend private account restore rehearsal through 0018

- Clean main/no leftovers; alerts and healthz clear, no failed user services. All 36 sources and four queues pass; saved reader remains four topics/19 stories/17 posts.
- Extended account rehearsal through unapplied migration 0018, including its admission table in rollback, exact table-set, idempotence and operational/PUBLIC privilege checks. Runner stop tag and boundary assertion now derive from the last listed migration.
- `python3 ops/backups/rehearse_accounts.py` passes against a fresh private backup/networkless restore: 30 original application-table fingerprints unchanged, injected rollback, actual runner twice, eight private tables and three reader roles denied. Restore verifies 31 original tables/59,873 rows; private receipt mode 600.
- Updated activation checklist, rollout plan, backup handbook and TASKS. No live migrations, provider calls, configuration or UI changes; accounts/public mode remain off. No restart under STEERING 22: only the manual rehearsal and documentation changed.
- Handbook page check: no page/link/render errors; exits 1 for existing schema metadata warnings because eight prepared account tables remain unapplied on live DB.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` and `git diff --check` pass: 742 unit/264 integration tests, four expected skips. Existing bundle-size warning only.
- Next: inject durable recorder, transactional mutation outcomes, controller replacement and live proxy proof; scheduled Phase 1/X/Bluesky acceptance remains due at 15:00 UTC.

## 2026-11-09: iteration 1517 — inject durable public admin admission storage

- Clean main/no leftovers; alerts and healthz clear, no failed user services. All 36 sources and four queues pass; latest scheduled digest completed and next remains 15:00 UTC.
- Prepared stored public policy injects the durable recorder into session-backed authorization, opens storage lazily on admitted writes, and owns repeatable shutdown. Closed policies refuse requests, including authorization already pending at shutdown.
- Isolated HTTP coverage checks persisted actor/method/classified path/time, unauthorized refusal, empty private 503 on database rejection, repeated close and pending-authorization shutdown. No request bodies or query strings enter admission rows.
- Updated TASKS, rollout plan and data-model handbook; archived iterations 1502–1504 to keep this file small. First full check caught unsorted new imports; fixed before rerun.
- No live entrypoints, migrations, configuration, provider calls or UI changes. Accounts/public mode stay off. No restart under STEERING 22: running services do not import this preparation.
- Handbook checker: 18 pages/three diagrams, no page/link/render errors; existing metadata warnings for eight unapplied private account tables remain.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` and `git diff --check` pass; 742 unit/265 integration passes, four expected skips. API rebuilt by isolated runner; existing web bundle warning only. Live reader retains four topics/19 stories/17 posts.
- Next: transactional mutation outcomes, controller replacement and live proxy proof; scheduled Phase 1/X/Bluesky acceptance due at 15:00 UTC.

## 2026-11-09: iteration 1518 — prepare transaction-bound admin admission

- Clean main/no leftovers; alerts and healthz clear, no failed user services. All 36 sources and four queues pass; live reader retains four topics/19 stories/17 posts.
- Extracted shared admission validation/insertion and prepared a caller-owned transaction boundary: admission and database mutation commit together; callbacks receive the same Drizzle transaction. No new schema or live registration.
- Isolated source-setting checks cover commit/returned values, callback refusal, database failure after mutation, audit refusal before callback, deferred COMMIT failure and pool reuse. Failed writes leave neither mutation nor additional admission.
- This is a foundation for controller adoption, not explicit outcome tracking: existing middleware still records attempts separately. Queue/external effects need an outbox; authorization remains the caller's responsibility.
- Updated TASKS, rollout plan and data-model handbook. No provider calls, migrations, configuration or UI changes; accounts/public mode remain off. No restart under STEERING 22: running services do not import this preparation.
- Handbook check: 18 pages/three diagrams, no page/link/render errors; existing schema metadata warnings for eight unapplied account tables remain. Build passes with existing web bundle warning.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` and `git diff --check` pass: 742 unit/266 integration passes, four expected skips. API rebuilt by isolated runner; no external test calls.
- Next: adopt transaction-bound admission in prepared controllers, explicit outcome tracking, queue atomicity, controller replacement and proxy proof; Nov 9 scheduled acceptance remains due at 15:00 UTC.

## 2026-11-09: iteration 1519 — prepare atomic source-enable writes

- Clean main/no leftovers; alerts, healthz and user services clear. All 36 sources healthy; four queues available, latest scheduled digest completed and next due 15:00 UTC. Reader retains four topics/19 stories/17 posts.
- Prepared source-enable database writer binds actor admission to the exact PUT target and locks the source row. Changed/unchanged results return after commit; not-found rolls back admission. Caller retains authorization and pool ownership.
- Isolated checks verify simultaneous identical toggles yield one changed/one unchanged result, missing-source rollback, target mismatch refusal, invalid-actor refusal without mutation and subsequent pool reuse. Existing boundary checks cover callback/database/commit rollback.
- Updated TASKS, public rollout plan and data-model handbook. Results are returned, not persisted outcomes; controller adoption and queue atomicity remain open.
- No live entrypoints, migrations, configuration, UI or provider calls changed. Accounts/public mode stay off; no restart under STEERING 22 because running services do not import this preparation.
- Verification: pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass: 742 unit/267 integration passes, four expected skips. Existing web bundle warning only.
- Handbook checker: 18 pages/three diagrams, no page/link/render errors; exit 1 for existing schema metadata warnings from eight unapplied account tables.
- Next: controller wiring, persisted mutation outcomes, atomic queue effects and live proxy proof; Nov 9 scheduled Phase 1/X/Bluesky acceptance remains due 15:00 UTC.

## 2026-11-09: iteration 1520 — prepare atomic source-write HTTP boundary

- Clean main/no leftovers; alerts, healthz and user services clear. All 36 sources recently successful with no current errors; four queues available, latest scheduled digest completed and next due 15:00 UTC. Reader retains four topics/19 stories/17 posts.
- Prepared uninstalled exact-route PUT transport: HTTPS Origin/JSON checks, strict boolean-only body and 2 KiB declared/streamed limit. Fresh-admin authentication runs after upload; missing actors and authentication/storage failures refuse privately.
- Transport delegates directly to the transaction-bound source writer, bypassing standalone middleware admission. Responses project changed/unchanged results, return empty not-found responses and omit adapter/private error details.
- Offline loopback checks cover malformed/oversized/chunked requests, disabled gate, wrong methods/targets, unauthorized/invalid actors, cookie renewal and private failures. Isolated database HTTP checks cover atomic refusal, changed/unchanged admission counts and missing-source rollback.
- Updated TASKS, rollout plan and affected handbook note; archived iterations 1505–1507. Live controller replacement, persisted mutation outcomes, queue atomicity and proxy proof remain open.
- No live entrypoints, configuration, migrations, UI or provider calls changed. Accounts/public mode stay off; no restart under STEERING 22 because running services do not import this preparation.
- Verification: targeted loopback test, pnpm format, pnpm lint:fix, pnpm build, pnpm check, source/job checks, saved-reader check and git diff --check. Full check passes 743 unit/268 integration tests, four expected skips; no external test calls.
- Handbook checker passes: 18 pages/three diagrams, with existing metadata warnings for eight unapplied private account tables. Build retains existing web bundle warning.
- Next: live controller replacement and persisted mutation outcomes; normal Nov 9 scheduled Phase 1/X/Bluesky acceptance at 15:00 UTC remains pending.

## 2026-11-09: iteration 1521 — prepare persisted atomic source outcomes

- Clean main/no leftovers; alerts, healthz and user services clear. All 36 sources healthy; saved reader retains four topics/19 stories/17 posts. Scheduled acceptance remains due 15:00 UTC.
- Prepared additive migration 0019 adds nullable constrained admission outcome. Existing/standalone admissions remain null (admission only); source writer saves changed/unchanged on the same transaction as its source update.
- Concurrent identical toggles and HTTP calls persist one changed/one unchanged result. Isolated checks reject invalid outcomes, preserve null standalone records and inject outcome-storage failure to verify source/admission rollback and subsequent pool reuse.
- Initial checks caught a wrapped-error assertion and additive-column order mismatch; corrected assertion, schema declaration and snapshot, then reran integration/schema checks.
- Updated rollout plan, schema metadata, affected handbook and TASKS. No new tables/relationships, UI, provider calls or live migration/configuration changes. Account/public mode remains disabled.
- No restart under STEERING 22: running services do not import the prepared writer; migration remains unapplied. Live controller replacement, queue atomicity and proxy proof remain open.
- Verification: pnpm format, pnpm lint:fix, pnpm build, pnpm check (initial failures corrected), full pnpm test:integration rerun and eight focused source/schema checks. Final results: 743 unit/268 integration passes, four expected skips; no live external test calls.
- Handbook checker: 18 pages/three diagrams, no render/link errors; existing unapplied account metadata warnings only. Reader endpoint check and git diff --check pass. Build retains existing bundle warning.
- Next: live controller replacement, atomic queue effects and proxy proof; normal Nov 9 15:00 UTC Phase 1/X/Bluesky scheduled acceptance remains pending.

## 2026-11-09: iteration 1522 — refuse ambiguous source-write headers

- Clean main; alerts/health/services clear, all 36 sources healthy. Reader retains four topics/19 stories/17 posts; jobs check passes (retried without unsupported --limit combination).
- Prepared source HTTP boundary now requires exactly one wire-level Origin and Content-Type before authentication/storage. Node can discard duplicate Content-Type values during normalization.
- Loopback regression cases cover identical/conflicting, mixed-case duplicates; refused requests never authenticate or mutate. Updated rollout plan/TASKS; archived iterations 1508–1510 to keep this log small.
- Verification: targeted HTTP test, pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check; 743 unit/268 integration passes, four expected skips. Build has existing bundle warning only.
- No live routes/config/migrations/providers changed; accounts/public mode off. No restart under STEERING 22: transport remains uninstalled.
- Next: controller adoption, queue atomicity/proxy proof; 15:00 UTC scheduled Phase 1/X/Bluesky acceptance.

## 2026-11-09: iteration 1523 — prepare atomic source routing composition

- Clean main/no leftovers; alerts and health clear, user services active, all 36 sources healthy. Jobs check passes; saved reader returns four topics.
- Prepared default-off write router places atomic source HTTP before standalone authorization and legacy controllers. Source requests terminate there, including invalid methods/targets; other routes retain authorization.
- Loopback checks verify one writer execution, zero duplicate admissions/legacy fallthrough, unrelated-route authorization and disabled resource laziness.
- Updated rollout plan and TASKS. No live mounting, migrations, flags, UI or provider calls changed; accounts remain off.
- Verification: targeted router tests, pnpm format, pnpm lint:fix, pnpm build, pnpm check, handbook checker and git diff --check. Full check passes 745 unit/268 integration tests, four expected skips; existing bundle/account-metadata warnings only.
- No restart under STEERING 22: running services do not import this preparation. Live route adoption, queue atomicity and proxy proof remain open.
- Next: compose storage-backed route adoption; Nov 9 15:00 scheduled Phase 1/X/Bluesky acceptance remains pending.

## 2026-11-09: iteration 1524 — prepare storage-backed atomic write routing

- Clean main/no leftovers; alerts, healthz and services clear. All 36 sources healthy; source/job checks pass. Scheduled acceptance remains due 15:00 UTC.
- Added uninstalled default-off composition connecting the source HTTP router to the transactional database writer with a caller-owned pool and separate authorization for other routes.
- Isolated HTTP coverage now runs through this composition: changed/unchanged outcomes persist exactly once, invalid actors and missing sources leave no admission, source writes never reach standalone authorization or legacy controllers.
- Added disabled-composition check: invalid unused origin tolerated, no storage/authentication/authorization constructed. Updated rollout plan/TASKS; no live routes, flags, migrations, UI or providers changed.
- Verification: focused router tests (3 pass), pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check. Full check passes 746 unit/268 integration tests, four expected skips; build has existing bundle warnings only. No live external test calls.
- Handbook checker: 18 pages/22 diagrams without render/link errors; exit 1 for existing unapplied-account metadata warnings. Latest reader endpoint responds successfully.
- No restart under STEERING 22: running services do not import this preparation; accounts remain off. Live mounting, queue atomicity and proxy proof remain open.
- Next: prepare controller adoption/atomic queue effects; Nov 9 scheduled Phase 1/X/Bluesky acceptance at 15:00 UTC.

## 2026-11-09: iteration 1525 — prepare owned write-router shutdown

- Clean main/no leftovers; pnpm obs alerts, healthz, services, sources --check and jobs --check healthy; all 36 sources healthy. Latest saved-edition endpoint returns JSON.
- Added uninstalled owned write-router runtime: one source pool, shared repeatable shutdown, cleanup on source/authorization startup failure, and combined error preservation if cleanup also fails.
- Four focused offline tests cover resource ownership, disabled laziness, failed startup cleanup and combined failures. Authorization resources remain caller-owned; live mounting still pending.
- Updated rollout plan/TASKS. No live routes, configuration, migrations, generation, UI or providers changed; accounts stay off.
- Verification: pnpm exec tsx --test apps/api/test/public-write-owned-router.test.ts (4 pass); pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass. Full check: 750 unit/268 integration passes, four expected skips; existing bundle warnings only.
- Handbook checker: 18 pages/22 diagrams checked; exit 1 for existing unapplied-account metadata warnings. No live external test calls.
- No restart under STEERING 22: services do not import this uninstalled preparation. Next: live route composition, atomic queue effects/proxy proof; scheduled Phase 1/X/Bluesky acceptance at 15:00 UTC.

## 2026-11-09: iteration 1526 — prepare account-backed atomic write routing

- Clean main/no leftovers; alerts and healthz healthy, all 36 sources healthy, jobs check passes and latest saved edition returns four topics.
- Prepared uninstalled account-backed write router shares session/local-script authentication with ordinary authorization. Atomic source writes bypass standalone admission; other routes retain the existing account policy.
- Missing account handlers refuse before storage acquisition; disabled composition opens no resources. Source storage keeps the owned runtime lifecycle; accounts/ordinary admission remain caller-owned.
- Offline loopback checks cover cookie renewal, fresh-admin refusal, session-store failure, ordinary admission and resource laziness. Isolated database coverage now exercises this composition with a persisted user and nonexistent-user rollback.
- Updated rollout plan/TASKS. No live flags, routes, migrations, UI or provider calls changed; accounts stay off.
- Verification: pnpm exec tsx --test apps/api/test/public-write-account-router.test.ts apps/api/test/public-account-access.test.ts (3 pass); pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass. Full check: 752 unit/268 integration passes, four expected skips; existing bundle warnings only. Corrected require-await lint error before passing rerun.
- No restart under STEERING 22: running services do not import these prepared modules. Next: live mounting, atomic queue/external effects and proxy proof; Nov 9 15:00 scheduled Phase 1/X/Bluesky acceptance remains pending.
