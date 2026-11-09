## 2026-11-09: iteration 1505 — compose gated public article reads

- Clean main/no leftovers; alerts/healthz clear and no failed user services. All 36 sources healthy; digest queue has no failures, with historical ingestion/social failures retained and current collection succeeding.
- Connected the prepared article module to the disconnected default-off public-read composition. Five readers share one lazy caller-owned pool; disabled and unsafe prerequisite checks include the article route.
- Expanded isolated HTTP/storage coverage with a nonempty article fixture, private URL/query/fragment/excerpt/future-column omission, GET/HEAD/no-store/refused writes, generic article storage failure and healthy sibling routes. Unreviewed content/window remains absent; app shutdown preserves the shared pool.
- Updated TASKS and response audit; archived iterations 1488–1489. Configured text/hostname review, legacy-controller replacement, authorization and proxy proof remain rollout gates. Accounts/public mode remain disabled; no live entrypoints/config/data/migrations/provider calls changed.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (736 unit/263 integration passes, four expected skips), `pnpm build`, source/job checks, saved-reader check and `git diff --check`. Saved Nov 8 reader retains four topics/19 stories/17 posts; build retains existing bundle warnings.
- No restart under STEERING 22 because live entrypoints do not import the disconnected composition.
- Next: configured article text/hostname review and live proxy proof; normal 15:00 UTC Phase 1 scheduled acceptance remains pending.

## 2026-11-09: iteration 1506 — review configured public-read snapshot

- Clean main/no leftovers; alerts/healthz clear, no failed user services; source/job checks pass and all 36 sources healthy. Saved Nov 8 reader retains four topics/19 stories/17 posts.
- Inspected actual prepared live readers without installing routes: all four complete topic configurations, 36 source names/35 origins and 20 preview titles/source labels across four groups. No private material observed in those projected values.
- Added scoped review/origin inventory and snapshot fingerprint; Google News origins identify the aggregator, so public UI must call these source origins and never article links. Current snapshot does not approve all historical/future values; recheck changes before promotion.
- Temporary inspection script/snapshot deleted; first invocation failed at compilation on top-level await, corrected with async main before any database read. No config/data/migrations/provider calls changed.
- Verification: prepared readers, source/job checks, saved-reader check, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build` and `git diff --check` (final results below).
- Full check passes 736 unit/263 integration tests with four expected skips; build passes with existing bundle warnings.
- No restart under STEERING 22: documentation-only change, live runtime unchanged. Accounts/public mode remain off.
- Next: controller replacement/authorization and live proxy proof; normal 15:00 UTC Phase 1 scheduled acceptance remains required before account activation.

## 2026-11-09: iteration 1507 — prepare public authorization enforcement

- Clean main/no leftovers; alerts and healthz clear, no failed user services. Source/job checks pass; saved Nov 8 reader retains four topics/19 stories/17 posts.
- Added uninstalled default-off authorization middleware enforcing the prepared route classifier before downstream handlers. Unknown routes deny; user/admin routes require session/fresh-admin resolution; forged proxy identity headers grant nothing; dependency failures return empty 503 and responses are no-store.
- Real HTTP tests cover anonymous exchanges, GET/HEAD, unknown/encoded routes, forged headers, user versus fresh-admin writes, resolver failure and disabled-path isolation. No provider calls or live configuration/data changes.
- Updated TASKS and public-access plan. Session/local-token wiring, write origin/audit enforcement, controller replacement and live proxy proof remain promotion gates; accounts/public mode remain disabled.
- Verification: targeted HTTP test, `pnpm format`, `pnpm lint:fix`, `pnpm check` (737 unit/263 integration passes, four expected skips), `pnpm build`, source/job checks, saved-reader check and `git diff --check`. Build retains existing bundle warning.
- No restart under STEERING 22: live entrypoints do not import the disconnected middleware. Next: compose account-backed authorization; normal 15:00 scheduled phase-1 acceptance remains required.

## 2026-11-09: iteration 1508 — compose account-backed public authorization

- Clean main/no leftovers. Triaged Basketball Insiders' two 20-second poll timeouts: direct feed returned 200 in 0.48 s and automatic retry recovered at 09:44:46; all 36 sources healthy. One guarded manual retry refused before enqueue because the job was no longer failed; temporary script removed. Healthz and user services healthy; digest schedule unchanged.
- Added uninstalled default-off account-backed public authorization using existing strict cookie/session handlers. Per-request allowlisting/freshness and revocation are enforced; daily secure-cookie renewal reaches the response. Enablement without accounts refuses; disabled path constructs no dependencies.
- Real loopback HTTP tests cover duplicate/malformed cookies, forged identity headers, secure renewal once daily, allowlist removal, seven-day admin expiry, ordinary user access, revocation and generic storage failure with public-reader independence. No provider calls, migrations or live config changes; accounts/public mode remain off.
- Updated TASKS/public-access plan and archived iterations 1490–1492. Local script credentials, write origin/audit enforcement, controller replacement and proxy proof remain open.
- Verification: targeted HTTP test and saved-reader check pass (four topics/19 stories/17 posts). First full check caught an unnecessary async callback; corrected. Final `pnpm format`, `pnpm lint:fix`, `pnpm check` (738 unit/263 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warnings remain. Recent-failure alert cleared by 09:53 UTC.
- No restart under STEERING 22: live entrypoints do not import this composition. Next: remaining authorization wiring and normal 15:00 scheduled phase-1 acceptance.

## 2026-11-09: iteration 1509 — prepare direct-local administrative credentials

- Clean main/no leftovers; alerts and healthz clear, no failed user services. All 36 sources report no errors; scheduled digest queue healthy and Nov 9 15:00 run pending. Two historical ingestion failures remain after the previous recovered source timeout.
- Prepared uninstalled exact-token authentication for direct-loopback administrative APIs, using constant-time comparison. Duplicate headers, any forwarding header, remote peers and missing configuration refuse; proxy identity grants nothing. Tokens cannot impersonate readers or authorize account administration.
- Real loopback HTTP checks cover credentials, duplicate/forwarded/forged requests, unknown routes and account isolation. No live configuration, migrations or provider calls; accounts/public mode remain off.
- Saved-reader check passes (four topics/19 stories/17 posts); queue browser check passes four queues/40 schedules desktop/mobile. Generated queue screenshots restored as unrelated.
- Two older UI smoke scripts fail on stale assumptions/copy: legacy edition-jobs conflates latest private/published records and expects an old button; current new-edition expects obsolete warning text. Exploratory legacy-script edit deliberately reverted; follow-up recorded in TASKS.
- Verification: targeted HTTP tests, `pnpm format`, `pnpm lint:fix`, `pnpm check` (740 unit/263 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warnings remain. Archived iterations 1493–1495.
- No restart under STEERING 22: live entrypoints do not import this prepared composition. Next: write-origin/audit enforcement, controller replacement, live proxy proof and scheduled Phase 1 acceptance.
- Main change pushed as `b1bbd2e3`; final narrow format check caught an extra archive blank line after the full check. Corrected in a follow-up formatting commit; no runtime changes.

## 2026-11-09: iteration 1510 — prepare public write provenance enforcement

- Clean main/no leftovers; alerts/healthz and user services healthy. `pnpm obs sources --check` passes 36 sources; `pnpm obs jobs --check` passes four available queues. No provider calls, migrations or live configuration changes.
- Added uninstalled write guard requiring one exact HTTPS Origin and JSON Content-Type for every classified non-GET/HEAD request. Duplicate headers, foreign/null/missing origins and unknown/encoded routes refuse before downstream handlers. Only authenticated direct-loopback administrative scripts may omit Origin; forwarded traffic and account routes cannot use that exception.
- Real HTTP tests cover browser/account writes, DELETE, duplicates, cross-site attempts, local scripts, forwarding and disabled-path isolation. Guard checks provenance only; existing authorization remains required.
- Updated TASKS/public-access plan. Accounts/public mode remain off; audit enforcement, controller replacement and live proxy proof remain open. Normal 15:00 scheduled Phase 1 acceptance still required.
- Verification: targeted HTTP test and saved-reader check pass (four topics/19 stories/17 posts); build passes with existing bundle warning. `pnpm format`, `pnpm lint:fix`, `pnpm check` (741 unit/263 integration passes, four expected skips) and `git diff --check` pass. Initial full check caught test-only lint, corrected.
- Extra handbook check renders no changed diagrams and reports existing metadata for seven intentionally unapplied account tables; no migrations applied to silence it.
- No restart under STEERING 22: live entrypoints do not import this prepared guard.

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
