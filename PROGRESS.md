# Progress

Earlier entries: [iterations 1580–1582](docs/progress-archive/2026-11-09-1594.md); [iterations 1577–1579](docs/progress-archive/2026-11-09-1592.md); [iterations 1570–1576](docs/progress-archive/2026-11-09-1589.md); [iterations 1567–1569](docs/progress-archive/2026-11-09-1581.md); [iterations 1564–1566](docs/progress-archive/2026-11-09-1578.md); [iterations 1560–1563](docs/progress-archive/2026-11-09-1574.md); [iterations 1552–1559](docs/progress-archive/2026-11-09-1568.md); [iterations 1550–1551](docs/progress-archive/2026-11-09-1564.md); [iterations 1548–1549](docs/progress-archive/2026-11-09-1562.md); [through iteration 1547](docs/progress-archive/2026-11-09-1557.md); [through iteration 1539](docs/progress-archive/2026-11-09-1548.md).

## 2026-11-09: iteration 1583 — reject ambiguous account write headers

- Clean main/no leftovers; alerts and health pass. All 36 sources healthy; digest-generation queue has zero failed jobs. No paid calls, migrations, flags, UI or generation changes.
- Prepared account HTTP writes now require exactly one wire-level Origin and Content-Type before body reading or handler dispatch, matching the atomic admin transports. Accounts/public remain off pending item 53 owner proxy rerun.
- Offline real HTTP test rejects repeated identical/conflicting values and mixed casing with empty no-store responses, no cookie and zero handler calls; a subsequent valid request succeeds. Existing unfinished-upload size test now supplies valid write headers.
- Updated readiness plan/TASKS; no active source or handbook behavior changed. `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 790 unit, 275 integration/four expected skips, typecheck/lint/format/boundaries. `pnpm build` passes with existing bundle warnings.
- API/worker restarted; first curl raced startup, retry passed. Post-restart health, alerts and `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` pass: four topics/19 stories/14 posts.
- Next: continue Phase 4 preparation behind flags; production visitor extraction still blocked. Passive metrics probe due ≥22:36 UTC; not repeated this iteration.

## 2026-11-09: iteration 1584 — reject ambiguous account Cookie fields

- Clean main/no leftovers; alerts/health pass, all 36 sources healthy, all 14 services active and digest-generation failed count zero. No paid calls, migrations, flag, UI or generation changes.
- Owner value: future sign-in and account writes now refuse ambiguous wire-level session input before authentication or mutation. Prepared account transport rejects multiple Cookie fields, including mixed-case names; accounts/public stay off pending item 53.
- Offline real HTTP checks cover session reads, redemption and logout-all: identical/conflicting/unrelated repeated fields return empty no-store 400 without cookies or handler calls. One Cookie field with unrelated cookies and cookie-free redemption still reach their handlers.
- Updated readiness plan/TASKS; no active source or handbook behavior changed. Targeted `pnpm exec tsx --test apps/api/test/account-http.test.ts` passes all seven tests.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 791 unit, 275 integration/four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings; `git diff --check` passes.
- Pushed `5da85e54`; restarted API/worker. Post-restart health, zero alerts, all 14 services and scheduled-reader verification pass: four topics/19 stories/14 posts.
- Next: Phase 4 preparation behind flags; production visitor extraction remains blocked. Passive metrics probe due ≥22:36 UTC; not repeated this iteration.

## 2026-11-09: iteration 1585 — stop disconnected public authorization dispatch

- Clean main/no leftovers; initial alerts and health pass. All 36 sources healthy; digest-generation failed count zero. No paid calls, migrations, flags, UI or generation changes.
- Prepared public authorization checks liveness after asynchronous authentication and durable admin admission, before controller dispatch. Disconnect during authentication also skips audit admission; an audit already started may finish. Accounts/public stay off pending item 53.
- Offline real HTTP tests disconnect during each wait: zero controller calls, expected audit counts, then successful connected recovery. Updated readiness plan/TASKS; no active handbook or source behavior changed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 792 unit, 275 integration/four expected skips; typecheck/lint/format/boundaries green. Targeted public-access HTTP tests pass (2); `pnpm build` passes with existing bundle warnings; `git diff --check` passes.
- API/worker restarted; first health probe raced startup, retry passed. Post-restart health, all 14 monitored services, zero alerts and scheduled-reader check pass: four topics/19 stories/14 posts.
- Next: Phase 4 preparation behind flags; production visitor extraction awaits owner proof. Passive metrics probe due ≥22:36 UTC, not repeated this iteration.

## 2026-11-09: iteration 1586 — preserve account request text integrity

- Clean main/no leftovers; health/alerts pass, all 36 sources healthy, all 14 monitored services active and digest-generation failed count zero. No paid calls, migrations, flag, UI or generation changes.
- Prepared account writes now decode UTF-8 strictly before JSON parsing, refusing damaged bytes rather than silently changing reader data. Accounts/public remain off pending item 53 owner proxy rerun.
- Offline real HTTP tests cover invalid leading bytes, overlong encodings, surrogate encodings and truncated sequences: empty no-store 400, no cookie, zero handler calls. Valid multilingual text, emoji and an intentional replacement character survive byte-wise upload and reach the handler unchanged.
- Updated readiness plan/TASKS; no active source or handbook behavior changed. Targeted account HTTP tests pass (8). `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 793 unit, 275 integration/four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings; `git diff --check` passes.
- API/worker restarted; post-restart health, all 14 services, zero alerts and `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` pass: four topics/19 stories/14 posts.
- Next: Phase 4 preparation behind flags; production visitor extraction awaits owner proof. Passive metrics probe due ≥22:36 UTC, not repeated this iteration.

## 2026-11-09: iteration 1587 — reject unstoreable sync Unicode

- Clean main/no leftovers; health/alerts pass, all 14 monitored services active, sources healthy and digest-generation failed count zero. No paid calls, migrations, flags, UI or generation changes.
- Prepared reader sync rejects escaped lone Unicode surrogates in all six bookmark display fields and both preference-key collections before storage. JSON can carry these despite valid UTF-8; rejection avoids PostgreSQL JSON failures. Valid multilingual text, emoji, supplementary characters and replacement characters remain accepted.
- Offline policy tests cover malformed sequences in every field/key; HTTP checks return empty no-store 400, no cookie and zero storage writes. Updated readiness plan/TASKS; active source and handbook behavior unchanged. Accounts/public remain off pending item 53.
- Targeted `pnpm exec tsx --test apps/api/test/reader-sync.test.ts apps/api/test/reader-sync-http.test.ts` passes (6). `pnpm format`, `pnpm lint:fix`, `pnpm check` and `pnpm build` pass; 794 unit tests, 275 integration passes/four expected skips. Existing bundle warning only; `git diff --check` passes.
- Pushed `9d9aab11`; `systemctl --user restart news-digest-api.service news-digest-worker.service` completed. First health/reader probes raced startup; retries passed. `curl -fsS http://localhost:8000/healthz`, `pnpm obs services --check` (14 healthy), `pnpm obs alerts` (zero), and `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` pass (four topics/19 stories/14 posts).
- Next: continue Phase 4 preparation behind flags; visitor extraction awaits owner proof. Passive metrics probe due ≥22:36 UTC, not repeated this iteration.

## 2026-11-09: iteration 1588 — bound sync clocks to storage-safe years

- Clean main/no leftovers; health/alerts, all 14 services and sources pass; digest-generation failed count zero. Accounts/public remain off pending item 53 proxy proof. No paid calls, migrations, flag, UI or generation changes.
- New isolated PostgreSQL boundary test reproduced a real failure: year 10000 emits expanded ISO syntax rejected on insert. Prepared sync now refuses clocks beyond year 9999 before storage for both preference collections; HTTP returns empty no-store 400 with no cookie/writes.
- PostgreSQL tests verify epoch/year-9999 round-trips and rejected clocks preserve stored state. Policy/HTTP targeted tests pass (7); updated plan/TASKS. Active source/handbook behavior unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 795 unit, 275 integration/four expected skips; typecheck/lint/format/boundaries green. Initial boundary experiment failed as expected before the fix.
- Passive `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 10` at 22:36: 23 healthy rules, four queries ≤0.031 s, zero new evaluator errors/misses, no merges/restarts. Recovery remains open; next probe ≥23:36 UTC. Limits unchanged.
- `pnpm build` passes with the existing bundle-size warning; `git diff --check` passes. Final formatting/lint pass before commit.
- Push initially rejected because owner commits advanced main. Fetched and merged without rewriting history; new STEERING 53 says both appended entries are the visitor, retain last-entry selection, trust loopback, add observed-shape tests then start Phase 3. Read the private receipt metadata; removed obsolete rerun request and updated TASKS. No activation this step.
- API/worker restart preceded discovery of new API-only restart guidance; future API-only changes restart API alone. Post-restart health/services/alerts pass; `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` passes: four topics/19 stories/14 posts.

## 2026-11-09: iteration 1589 — accept proxy shape and begin Phase 3

- Clean main/no inherited work. Health/alerts, 14 services, source checks and queues pass; digest-generation failed count zero. Inspected private 19:47 receipt: both appended positions stable/public, peer loopback, forged email replaced; owner confirms both entries are the visitor.
- Kept last-entry selection. Added zero/one/two forged-prefix duplicate-visitor tests for IPv4/IPv6 and loopback variants, duplicate-header/untrusted-peer refusal and real HTTP transport. Configured explicit `127.0.0.1,::1` account proxy peers privately; accounts/public flags unchanged.
- Phase 3 started with `python3 ops/backups/rehearse_accounts.py`: fresh private backup, networkless restore, 30 original fingerprints preserved, injected rollback, real runner twice/idempotent, eight private tables and three hostile reader roles denied. Live migrations unchanged; private receipt saved.
- `pnpm exec tsx --test apps/api/test/proxy-client.test.ts` passes (4). `pnpm exec tsx scripts/smoke-account-code-lifecycle.ts` passes desktop/mobile composed HTTPS fixture checks; no live account writes. Discarded regenerated replay screenshot because UI is unchanged.
- Updated activation checklist, readiness plan, TASKS, NEEDS and item 53 ack. `pnpm exec tsx scripts/check-handbook.ts account-activation` passes (18 pages); existing eight pending account-table metadata warnings remain until live migration.
- First `pnpm check` failed one unrelated cleanup test (killed-run folder conservatively retained); isolated `pnpm exec tsx --test apps/api/test/integration-temp.test.ts` passes. Full retry passes; no cleanup implementation changed.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` retry and `pnpm build` pass: 796 unit, 275 integration/four expected skips; existing bundle warning only. API-only restart completed; `/healthz`, 14 services and saved-reader check pass (four topics/19 stories/14 posts). `git diff --check` passes. Archived iterations 1570–1576 to keep PROGRESS small.
- Next: guarded live bounded migrations/account deployment and dedicated acceptance, then exact owner two-device steps once ready. Public mode stays off; no paid calls. Next passive metrics probe ≥23:36 UTC.

## 2026-11-09: iteration 1590 — deploy bounded private account tables

- Clean main/no leftovers. Initial health, alerts, 14 services, 36 sources and digest-generation queue pass. No paid calls, generation changes, UI changes or account/public activation.
- Fresh `python3 ops/backups/rehearse_accounts.py` passes: private backup `news-digest-20261109T225456Z`, isolated restore, 30 original table fingerprints, injected rollback, real runner twice and eight private tables/three hostile reader roles denied.
- Guarded `pnpm migrate` with `MIGRATE_THROUGH=0018_admin_write_admissions` applied 0013–0018 live; bounded rerun unchanged. Initial guard refused absent DATABASE_URL before writes; used the application's documented loopback default after checking compose configuration. Eight empty tables deny all privileges to both operational readers and PUBLIC; no later migration applied. Credential-free private live receipt saved.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build` pass: 796 unit, 275 integration/four expected skips; existing bundle warning only. Composed HTTPS `smoke-account-code-lifecycle.ts` passes desktop/mobile fixture checks, no live account writes.
- Updated activation checklist, plan, data-model handbook, schema notes and TASKS. Handbook first raced API restart; retry found page length 104, shortened stale phase-1 explanation. Final `pnpm exec tsx scripts/check-handbook.ts account-activation` passes: 18 pages, 39 tables, zero metadata warnings. `git diff --check` passes.
- API-only restart; `/healthz`, all 14 services, all 36 sources, zero alerts and saved-reader check pass (four topics/19 stories/14 posts). Digest failed count zero; historical ingestion failures remain with every source healthy. Worker untouched.
- Push first rejected because owner lead documentation advanced main; fetched and merged without rewriting history or editing owner files.
- Next: configure/enable server and web account gates, dedicated live lifecycle acceptance, then exact owner two-device steps. Phase 3 still awaits owner acceptance and a normal scheduled edition. Migration 0019/public mode remain pending/off. Passive metrics check due ≥23:36 UTC.

## 2026-11-09: iteration 1591 — enable private invite-only accounts

- Clean main/no inherited work. Initial alerts/health, 14 services, 36 sources and digest-generation failed count zero pass; saved Nov 9 reader remains four topics/19 stories/14 posts.
- Configured exact account origin, stable random key, mode-700 private mailbox and invite mode in the mode-600 private environment; retained the owner admin allowlist and verified loopback peers. Enabled server gate; public mode/sharing unchanged. No migrations, account writes, paid calls or generation changes.
- Built with `VITE_READER_ACCOUNTS=1`; persisted that non-secret flag in ignored `apps/web/.env.production.local` so future production builds retain the panel. Restarted only `news-digest-api.service`; worker untouched.
- Added `pnpm exec tsx scripts/smoke-live-account-entry.ts`: deployed anonymous panel, sign-in navigation and no-store signed-out session pass desktop/mobile light/dark, zero browser errors/account writes. Saved eight live screenshots; inspected mobile dark panel and desktop light login. Fixture lifecycle smoke also passes; no claim of live authenticated acceptance.
- `pnpm check` passes: 796 unit, 275 integration/four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warning. `pnpm format`, `pnpm lint:fix`, targeted screenshot/script format checks and `git diff --check` pass.
- Updated activation checklist, plan, affected handbook and TASKS/NEEDS. `pnpm exec tsx scripts/check-handbook.ts account-activation` passes: 18 pages, 39 tables, no warnings. Post-restart health/alerts, 14 services, 36 sources and saved-reader check pass.
- Next: dedicated live code/link/sync/revocation/deletion acceptance with disposable identities, then exact owner two-device steps. Phase 3 still needs owner acceptance and a normal scheduled edition. Public mode/migration 0019 remain off/pending; next metrics probe ≥23:36 UTC.

## 2026-11-09: iteration 1592 — verify deployed account refusal boundaries

- Clean main/no inherited work. Initial alerts, health, services, sources and digest queue healthy; no paid calls, account credentials, account writes, migrations, configuration or generation changes.
- Added `pnpm exec tsx scripts/check-live-account-boundary.ts`: 32 deployed-loopback checks pass for anonymous privileged writes, cross-origin/null-origin requests, wrong content types, malformed login payloads and malformed-cookie signed-out state. Every response is no-store and issues no cookie. Uses a reserved documentation client address through the configured loopback trust; this is not public proxy/TLS or authenticated lifecycle proof.
- Live anonymous `smoke-live-account-entry.ts` passes desktop/mobile light/dark with no errors/account writes. Discarded two regenerated desktop screenshots because the UI is unchanged. Saved scheduled reader passes: four topics/19 stories/14 posts; digest-generation failed count zero.
- Updated activation checklist and TASKS; archived iterations 1577–1579 because PROGRESS exceeded 25 KB. Handbook validation passes: 18 pages/39 tables, zero metadata warnings. No owner handbook behavior changed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `pnpm build` pass; existing bundle-size warning only. Final targeted formatting and diff checks pass. API restart and post-restart reader/health checks pass; worker unchanged.
- Next: dedicated authenticated live code/link/sync/revocation/deletion acceptance, then exact owner two-device instructions and a normal scheduled edition. Phase 3 remains open; public mode stays off. Next passive metrics probe remains due ≥23:36 UTC.

## 2026-11-09: iteration 1593 — authenticated deployed account lifecycle

- Clean main/no inherited work. Initial alerts and later health, all 14 services/36 sources pass; digest-generation failed count zero and next run Nov 10 15:00 UTC. Historical ingestion failures remain with every source healthy.
- Added explicit opt-in `pnpm exec tsx scripts/check-live-account-lifecycle.ts --live`; 30 real deployed-loopback checks pass: owner code/admin session, single-use code/invitation replay refusal, disposable-reader code login, ordinary-reader privilege refusal, two-device topic sync/stale refusal, all-device logout, deletion/replay and mailbox cleanup.
- Codes/tokens/cookies remain private and are never printed. Random reserved-domain reader deleted; temporary owner session signed out without revoking other devices or changing owner preferences. No schedule/generation/configuration/migration/provider changes or paid calls.
- Updated activation checklist and TASKS. Live browser/proxy, bookmarks, expiry and admin-target revocation remain unverified; owner two-device and normal scheduled-edition gates remain open. No Phase 3 completion claim.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (796 unit, 275 integration/four expected skips) and `pnpm build` pass; existing bundle warning only. `check-live-account-boundary.ts` passes 32 refusals; `check-handbook.ts account-activation` passes 18 pages/39 tables/no warnings. No UI changes.
- Restarted API only; `/healthz`, `check-scheduled-reader.ts 2026-11-09T15:00:00Z` (four topics/19 stories/14 posts) and zero alerts pass. Worker untouched. Next: finish remaining live acceptance, then exact owner two-device steps and normal scheduled edition. Public mode stays off; passive metrics probe due ≥23:36 UTC.
- Initial push rejected by concurrent owner lead documentation commit; fetched and merged it without edits or history rewriting, then retried.

## 2026-11-09: iteration 1594 — deployed bookmark sync acceptance

- Clean main/no inherited work. Initial alerts/health pass; all 14 services and 36 sources healthy. Digest-generation failed count zero; next run Nov 10 15:00 UTC. Saved Nov 9 reader remains four topics/19 stories/14 posts.
- Extended explicit live lifecycle acceptance with disposable bookmark display-copy sync, second-device removal, persisted tombstones and stale-device replay refusal; 31 deployed-loopback checks pass. Synthetic bookmark never enters published content. Both disposable readers deleted and temporary owner sessions signed out; no owner preferences, schedule, configuration, migration or provider changes.
- Initial check compared JSON field order and failed despite equal values; changed to structural equality and reran successfully. Added credential-free failure-stage reporting before cleanup so cleanup cannot hide the original endpoint. No credentials printed or retained.
- Updated activation checklist and TASKS. Browser/proxy, expiry and admin-target revocation acceptance remain, followed by owner two-device and normal scheduled-edition gates. Phase 3 remains open; public mode off.
- Hourly passive metrics sample at 23:37: 23 healthy rules, four queries ≤0.417 s, zero new evaluator errors/misses; one small merge/no large merge. Recovery acceptance remains open; next probe ≥00:37 UTC Nov 10.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (796 unit, 275 integration/four expected skips), `pnpm build` and `check-handbook.ts account-activation` pass; existing bundle warning only. Archived iterations 1580–1582 to keep PROGRESS small. Final changed-file formatting and diff checks pass.
- Pushed `e4d2b99e`; restarted API only. Post-restart `/healthz`, `check-scheduled-reader.ts 2026-11-09T15:00:00Z` and `pnpm obs alerts` pass (zero alerts); worker unchanged.

## 2026-11-09: iteration 1595 — audited live admin session revocation

- Clean main/no inherited work. Initial alerts and health pass; services/sources healthy. Digest-generation failed count zero; next run Nov 10 15:00 UTC. Saved Nov 9 reader remains four topics/19 stories/14 posts.
- Extended `pnpm exec tsx scripts/check-live-account-lifecycle.ts --live`: 41 deployed-loopback checks pass, including admin revocation of exactly two disposable-reader sessions, both-cookie session/sync replay refusal, one persisted audit row and issuer survival. Reader signs in again and deletes the account; temporary owner session signed out. Read-only DB queries scoped to the random reader; mutations use HTTP handlers. Cleanup can reauthenticate after revocation.
- Initial run stopped at configuration before account writes because DATABASE_URL is absent from the private env; use the same database fallback as the deployed app. Successful rerun prints no credentials. No paid calls, owner preference, schedule, configuration, migration or generation changes.
- Updated activation checklist/TASKS. Browser/proxy and expiry acceptance remain, then owner two-device and normal scheduled-edition gates. Phase 3 open; public mode off. Metrics probe not due until ≥00:37 UTC Nov 10.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (796 unit, 275 integration/four expected skips), `pnpm build`, `check-handbook.ts account-activation`, `check-live-account-boundary.ts` (32 checks) and `check-scheduled-reader.ts 2026-11-09T15:00:00Z` pass. Existing bundle/dependency annotation warnings only; no UI changes.
