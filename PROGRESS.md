## 2026-11-09: iteration 1477 — composed HTTPS sign-in links

- Clean main/no leftovers; health, alerts, source freshness, jobs and services pass. Phase 1 scheduled acceptance remains due at 15:00 UTC; accounts stay disabled.
- Extended the composed desktop/mobile HTTPS smoke with admin-issued sign-in links using real HTTP handlers, runtime and crypto; fixture link storage enforces exact expiry and single use.
- Browser preview strips the fragment without creating a session; cross-origin redemption fails without consuming the link. Explicit confirmation exchanges it for a secure cookie; logout followed by replay and reload cannot authenticate.
- Saved and inspected desktop/mobile replay screenshots; added desktop/mobile screenshot links and activation coverage. No live account writes, provider calls or runtime changes; archived progress entries 1458–1460.
- Initial browser run exposed same-document fragment navigation in the harness; corrected it to leave the confirmation page before opening a new link. Both viewport checks pass.
- Verification: `pnpm exec tsx scripts/smoke-account-code-lifecycle.ts`, saved-reader check (four topics/19 stories/17 posts), `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, handbook checker and diff check pass.
- First full-check process ended 143 during unit tests with no assertion failure; complete retry passes 707 unit/254 integration tests, four expected skips. Handbook reports expected metadata for unapplied account tables.
- Hourly 05:27 metrics probe: 23 healthy rules, four queries ≤0.710 s, no new evaluator errors/misses; recovery remains open. Next passive check ≥06:27 UTC.
- No service restart needed under STEERING 22. Next: normal scheduled Phase 1 acceptance and live proxy proof; owner two-device acceptance remains required.

## 2026-11-09: iteration 1478 — composed HTTPS account deletion

- Clean main/no leftovers; alerts clear, health passes and no failed user services. Phase 1 scheduled acceptance still awaits 15:00 UTC; accounts remain disabled.
- Extended composed desktop/mobile HTTPS acceptance with two independently issued sessions: cross-origin and incorrect-confirmation deletion requests preserve both sessions and the calling cookie.
- Confirmed deletion clears the calling cookie, refuses both device sessions without renewal and rejects authenticated-cookie deletion replays. Production HTTP/composition/crypto; fixture deletion storage only, no live account writes or provider calls.
- Updated the activation checklist; no UI/runtime/config changes or new screenshots. Existing browser screenshots remain unchanged.
- Verification: `pnpm exec tsx scripts/smoke-account-code-lifecycle.ts` twice, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check, handbook checker and `git diff --check` pass.
- Full check: 707 unit/254 integration tests pass, four expected skips. Saved reader retains four topics/19 stories/17 posts; handbook reports expected metadata for unapplied account tables.
- No restart under STEERING 22. Next: normal Phase 1 scheduled acceptance and live proxy proof; metrics probe not due before 06:27 UTC.

## 2026-11-09: iteration 1479 — composed HTTPS admin revocation

- Clean main/no leftovers; health and alerts clear, all 36 active sources fresh without errors, digest queue zero failures. Accounts remain disabled; Phase 1 acceptance awaits 15:00 UTC.
- Extended desktop/mobile composed HTTPS acceptance with two independently invited friend-device sessions. An ordinary reader cannot issue links or revoke sessions; cross-origin and malformed admin requests preserve both devices and write no fixture audit.
- Successful admin revocation returns only the count, removes both target sessions, records the fixture audit and preserves the issuer's admin access. Replayed target cookies stay signed out without renewal.
- Production HTTP/composition/crypto with fixture storage/admission only; no live writes, provider calls or runtime changes. Updated activation checklist and archived progress entries 1461–1463.
- Initial smoke assertion expected 200 for link exchange; corrected to the existing 204 contract. Final composed smoke passes both widths; saved reader retains four topics/19 stories/17 posts.
- Verification: `pnpm exec tsx scripts/smoke-account-code-lifecycle.ts`, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check, handbook checker and `git diff --check`.
- Full check passes 707 unit/254 integration tests, four expected skips; handbook checker passes with expected unapplied-account metadata notices.
- No service restart under STEERING 22. Next: scheduled Phase 1 acceptance and live proxy proof; metrics probe not due before 06:27 UTC. Owner two-device acceptance remains required.

## 2026-11-09: iteration 1480 — composed HTTPS two-device reader sync

- Clean main/no leftovers; health and alerts clear, services 14/14 and sources 36/36 healthy. Digest queue has no failures; saved edition retains four topics/19 stories/17 posts.
- Replaced the composed browser harness's echo-only sync stub with per-reader fixture persistence using the production merge policy; injected the existing test clock into sync authentication.
- Desktop/mobile independently issued device cookies now exchange topic/bookmark choices through real HTTPS handlers. Newer removals survive stale device replay; cross-origin and injected-user-ID bodies fail without changing state.
- Friend sessions see empty state while the issuer retains its choices; both revoked device sessions cannot sync. Fixture storage/admission only, no live account writes or provider calls.
- Updated the activation checklist. No UI/runtime/config changes; accounts remain disabled, with Phase 1 scheduled acceptance and live proxy proof pending.
- Verification: `pnpm exec tsx scripts/smoke-account-code-lifecycle.ts` twice, `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z`, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, handbook checker and diff check pass.
- Full check: 707 unit/254 integration tests pass, four expected skips. Handbook has expected metadata notices for unapplied account tables; build has its existing chunk-size warning.
- No service restart under STEERING 22. Next: 15:00 UTC scheduled acceptance and live proxy proof; metrics passive check due no earlier than 06:27 UTC.

## 2026-11-09: iteration 1481 — exact admin expiry rejects HTTPS writes

- Clean main/no leftovers; health and alerts clear, 14 services/36 sources healthy, digest queues pass `pnpm obs jobs --check`.
- Extended composed desktop/mobile HTTPS acceptance: link issuance succeeds one millisecond before seven-day admin expiry; at expiry, invitations and session revocation return 403 despite daily cookie renewal.
- Refused writes set no cookie and leave fixture links/sessions/audit unchanged; the same stale admin retains ordinary reader sync. Production transport/composition, fixture storage only; no live account writes or provider calls.
- Updated activation checklist; no runtime/config/UI changes, accounts stay disabled. Discarded an incidental regenerated screenshot; no restart required under STEERING 22.
- Verification: composed browser smoke twice, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check and diff check pass. Full check: 707 unit/254 integration tests pass, four expected skips; saved reader retains four topics/19 stories/17 posts.
- Handbook checker exits 1 solely for 14 existing metadata warnings referencing seven unapplied account tables; 18 pages/diagrams otherwise checked. Previous entries calling this a pass were inaccurate.
- Next: normal 15:00 UTC Phase 1 scheduled acceptance and live proxy proof. Metrics passive check not due before 06:27 UTC.

## 2026-11-09: iteration 1482 — deletion invalidates outstanding HTTP credentials

- Clean main/no leftovers; alerts clear, healthz healthy, 36/36 sources fresh and digest queue has no failures. Historical ingestion/social failures remain retained; recent collections succeed.
- Extended the installed HTTP/storage integration flow with two friend sessions, saved choices, a pending mailbox code and an unused invitation before deletion.
- Deletion clears the caller cookie, refuses both device sessions, removes the identity and mailbox code, and rejects code/link replay without setting cookies or recreating the reader.
- Disposable Postgres/Redis and private temporary mailbox only; no live writes, provider calls or runtime/config/UI changes. Accounts remain disabled. Updated activation checklist and archived iterations 1464–1466.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z`, source/queue snapshots and `git diff --check` pass.
- Full check: 707 unit/254 integration tests pass, four expected skips. Build retains existing bundle warnings; saved reader retains four topics/19 stories/17 posts.
- No restart under STEERING 22: deployed code/config unchanged. Next: normal 15:00 UTC Phase 1 acceptance and live proxy proof; metrics passive check remains due no earlier than 06:27 UTC.

## 2026-11-09: iteration 1483 — prepare default-deny public route classes

- Clean main/no leftovers; alerts and healthz clear, 14/14 services and 36/36 sources healthy. Digest queue has no failures; next normal run remains 15:00 UTC.
- Added an unregistered Phase 4 method/path classifier for current edition/account APIs and administrative controllers. Unknown operations and encoded, dot-segment, separator or case ambiguities return no class; no prefix-wide grants.
- Anonymous credential exchanges remain admission-protected by account handlers; sync/deletion/logout classify as user, invitations/revocation as admin. Administrative reads stay restricted until their response audit.
- Tests verify role separation, unsupported verbs, malformed paths, numeric job IDs and source IDs. Tools, assets, admin SPA, telemetry and identity discovery still need explicit audit; classifier performs no authentication and is not installed.
- Updated the public-access plan and TASKS. Accounts stay disabled; no live data/config/access changes or provider calls. No restart under STEERING 22 because deployed entrypoints do not import the new module.
- Verification: targeted policy tests, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, API rebuild and saved-reader check pass. Full check: 709 unit/254 integration tests pass, four expected skips; build retains existing chunk warning.
- Saved Nov 8 reader unchanged: four topics/19 stories/17 posts. `git diff --check` passes. Next: Phase 1 normal scheduled acceptance and live proxy proof; continue gated public-read response audit while waiting. Metrics passive check due no earlier than 06:27 UTC.

## 2026-11-09: iteration 1484 — audit public administrative read boundaries

- Clean main/no leftovers; alerts/healthz clear, 14 services and 36 sources healthy, digest queue has no failures. Historical ingestion/social failures retained; recent collection succeeds.
- Audited administrative GET response paths and recorded remaining identity, whole-row, stored URL/error, unpublished-preview and operational-accounting boundaries in `docs/public-read-response-audit.md`.
- Prepared count-only alerts as public-read in the unregistered classifier. Offline adversarial tests verify private upstream fields are discarded, transport/HTTP/validation failures return an exact generic 503, and other admin reads stay restricted for GET/HEAD.
- No live access/config/account/data changes or provider calls; accounts stay disabled. No restart under STEERING 22: deployed entrypoints do not import the classifier. Archived iterations 1467–1468 to keep this log small.
- Verification: six targeted tests, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check and `git diff --check` pass. Full check: 711 unit/254 integration pass, four expected skips; existing bundle warning remains. Saved reader retains four topics/19 stories/17 posts.
- Due 06:27 UTC passive metrics check (`pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`): 23 healthy rules, four queries ≤0.083 s, zero new evaluator errors/misses; one small merge/3,644 rows, no large merge. Recovery remains open; next check ≥07:27 UTC.
- Next: normal 15:00 UTC Phase 1 scheduled acceptance and live proxy proof; prepare explicit public response projections while waiting. Gate remains unregistered and VM private.

## 2026-11-09: iteration 1485 — prepare public settings response allowlists

- Clean main/no leftovers; alerts/healthz clear, 14 services and 36 sources healthy. Digest queue has no failures; historical collection failures remain retained with recent successful collection.
- Prepared disconnected schedule/topic readers with explicit field allowlists: no legacy profile identity or arbitrary future top-level columns. Configured topic fields are retained; nested strict schemas refuse unknown fields.
- Storage/validation failures return exact generic 503s without exception details; adversarial offline checks cover private markers, malformed values and nested additions. Existing profile/topic GET/HEAD remain admin-classified.
- Updated public response audit and TASKS. No controller wiring, live configuration/data/access change, migrations or provider calls; accounts remain disabled. No restart under STEERING 22 because running entrypoints do not import these readers.
- Verification: targeted tests, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check and `git diff --check` pass. Full check: 713 unit/254 integration pass, four expected skips. Saved reader retains four topics/19 stories/17 posts; existing bundle warnings remain.
- Next: normal 15:00 UTC Phase 1 scheduled acceptance and live proxy proof; wire system-only settings transport before any public promotion. Metrics passive check remains due no earlier than 07:27 UTC.

## 2026-11-09: iteration 1486 — prepare origin-only public source catalog

- Clean main/no leftovers; alerts clear and healthz healthy. Administrative status confirms 36 sources and no failed digest jobs; next scheduled run remains 15:00 UTC.
- Added disconnected source-catalog projection returning IDs, names and publisher origins. Configured feed paths, queries and fragments may contain subscription tokens and are omitted; future columns cannot leak automatically.
- Existing public HTTPS policy rejects credentials, custom ports and literal private/local origins. Invalid rows and repository errors return an exact generic 503; adversarial offline checks pass. No DNS/network checks are performed by the helper.
- Existing GET/HEAD routes remain admin; frontend integration and transport review precede public promotion. Updated response audit and TASKS; no live config/data/access changes, provider calls or migrations.
- Verification: four targeted tests, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check and `git diff --check` pass. Full check: 715 unit/254 integration pass, four expected skips; existing bundle warning remains. Saved Nov 8 reader: four topics/19 stories/17 posts.
- No restart under STEERING 22: deployed entrypoints do not import this helper. Next: normal 15:00 UTC Phase 1 acceptance, live proxy proof and system-only settings transport; metrics passive check due no earlier than 07:27 UTC.

## 2026-11-09: iteration 1487 — prepare system-only public schedule reads

- Clean main/no leftovers; alerts and healthz clear, 36 sources/no stalled sources, no failed digest jobs. Historical collection failures remain retained; recent social collection succeeds.
- Added unregistered `PublicScheduleReader`: selects only five singleton system settings fields, applies the public projection, never reads legacy profiles/schedules or falls back when the row is missing; caller owns the pool.
- Isolated database test renames both legacy tables inside a rolled-back transaction and checks unset/off/on ownership flags, detached results, missing-row and closed-connection generic 503 failures.
- Updated response audit and TASKS; archived iterations 1469–1470 to keep the active log small. No live config/data/access changes, migrations or provider calls; accounts remain disabled.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `check-scheduled-reader.ts 2026-11-08T15:00:00Z`, and `git diff --check` pass. Full check: 715 unit/255 integration pass, four expected skips. Saved reader retains four topics/19 stories/17 posts; existing bundle warning remains.
- No restart under STEERING 22: deployed entrypoints do not import the reader. Next: normal 15:00 UTC Phase 1 scheduled acceptance, live proxy proof and gated settings transport; metrics passive check remains due no earlier than 07:27 UTC.

## 2026-11-09: iteration 1488 — prepare public system schedule HTTP transport

- Clean main/no leftovers; alerts and healthz clear. Authenticated status confirms 36 sources, no failed digest jobs and next scheduled edition at 15:00 UTC; retained ingestion failures remain historical.
- Added unregistered GET/HEAD `/api/settings/schedule` controller with explicit system-reader injection contract, HTTP allowlist projection, no-store responses and generic 503 failures.
- Real isolated loopback HTTP checks verify projected GET, empty HEAD, refused writes without adapter reads, malformed storage and private adapter exceptions. No module or route classifier installs this controller; live routes remain unchanged.
- Updated response audit/TASKS and archived iteration 1471 to keep this log small. No live data/config/access changes, migrations or provider calls; accounts stay disabled.
- Verification: targeted HTTP test, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check and `git diff --check`; full check passes 716 unit/255 integration tests with four expected skips; saved reader retains four topics/19 stories/17 posts. Existing build warnings remain.
- No restart under STEERING 22: deployed entrypoints do not import this controller. Next: 15:00 scheduled Phase 1 acceptance, live proxy proof and gated public-settings runtime composition.

## 2026-11-09: iteration 1489 — prepare public schedule runtime composition

- Clean main/no leftovers; alerts and healthz clear, 36 sources, no failed digest jobs or failed user units. Next scheduled edition remains 15:00 UTC; retained ingestion/social failures are historical.
- Added unregistered `PublicScheduleModule.prepare`: default-off public gate registers no route and never requests storage; invalid flags and missing system-ownership/published-reader prerequisites fail before dependencies.
- Enabled composition injects the concrete system-only reader. Offline HTTP checks cover disabled routes and unsafe flags; isolated database/HTTP checks cover actual system settings, missing-row generic refusal, writes refused and caller-owned pool reuse after shutdown.
- Updated response audit, public access plan and TASKS; archived iteration 1472. No main imports, live data/config/access changes, migrations or provider calls; accounts remain disabled.
- Verification: targeted HTTP tests, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check and `git diff --check`. Full check passes 717 unit/256 integration tests with four expected skips; build passes with existing bundle warnings. Saved reader retains four topics/19 stories/17 posts.
- No restart under STEERING 22: running entrypoints do not import this module. Next: 15:00 Phase 1 scheduled acceptance, live proxy proof and remaining public response/route boundaries before promotion.

## 2026-11-09: iteration 1490 — prepare system-only public topic reads

- Clean main/no leftovers; alerts and healthz clear, no failed user units. Scheduled Phase 1 acceptance still awaits 15:00 UTC; no early metrics probe.
- Added unregistered `PublicTopicsReader`: explicit public columns, ordered source connections/X discovery settings and topic allowlist; no legacy profile lookup, ownership filter or future-column spread. Caller owns the pool.
- Isolated test compares the complete existing system catalog, renames profiles, nulls ownership and adds a private future column; unset/off/on flags preserve parity. Detached results, malformed stored settings and closed-connection generic 503 errors covered.
- Updated response audit/TASKS; archived iteration 1473. No main imports, live config/data/access changes, migrations or provider calls; accounts remain disabled.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check and `git diff --check` pass. Full check: 717 unit/257 integration tests pass, four expected skips. Saved reader retains four topics/19 stories/17 posts; existing bundle warnings remain.
- No restart under STEERING 22: deployed entrypoints do not import the reader. Next: normal scheduled acceptance, live proxy proof and topic HTTP boundary before public promotion.

## 2026-11-09: iteration 1491 — prepare public topic HTTP transport

- Clean main/no leftovers; alerts and healthz clear, no failed user units. Phase 1 scheduled acceptance still awaits 15:00 UTC.
- Added unregistered GET/HEAD `/api/admin/topics` transport with explicit system-reader injection contract, repeated field projection, no-store responses and generic 503 failures.
- Offline loopback HTTP checks cover allowed catalog fields, private/future-column omission, empty HEAD, refused writes without reads, malformed mixed catalogs and private storage exceptions. Main and route classification unchanged.
- Updated response audit/TASKS; archived iteration 1474. No live config/data/access changes, migrations or provider calls; accounts remain disabled.
- Verification: targeted HTTP test, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, saved-reader check and `git diff --check` pass. Full check: 718 unit/257 integration pass, four expected skips; saved reader retains four topics/19 stories/17 posts. Existing build warnings remain.
- No restart under STEERING 22: running entrypoints do not import this controller. Next: 15:00 scheduled acceptance, live proxy proof and gated topic runtime composition before public promotion.

## 2026-11-09: iteration 1492 — prepare public topic runtime composition

- Clean main/no leftovers; alerts and healthz clear, no failed user units. Phase 1 scheduled acceptance still awaits 15:00 UTC.
- Added unregistered `PublicTopicsModule.prepare`: default-off gate registers no route or storage; invalid flags and missing system-ownership/published-reader prerequisites fail before dependencies.
- Enabled composition injects the concrete system-only reader. Isolated HTTP/database checks verify full catalog parity after profile rename/null ownership, GET/HEAD, no-store, refused writes, malformed-state generic refusal and shared pool reuse after shutdown.
- Updated response audit/TASKS; archived iteration 1475. No live config/data/access changes, migrations or provider calls; accounts remain disabled.
- Verification: format, lint fix, full check, build, desktop/mobile saved-reader browser smoke, scheduled-reader check and diff check. Full check: 719 unit/258 integration pass, four expected skips. Saved reader retains four topics/19 stories/17 posts; build passes with existing warnings. Browser-generated unchanged-scope screenshots discarded deliberately.
- No restart under STEERING 22: running entrypoints do not import this module. Next: scheduled acceptance, live proxy proof and remaining public response/route boundaries before promotion.

## 2026-11-09: iteration 1493 — prepare public source-catalog HTTP transport

- Clean main/no leftovers; alerts and healthz clear, no failed user units. Scheduled Phase 1 acceptance still awaits 15:00 UTC.
- Added unregistered source-catalog GET/HEAD transport with origin-only projection and no-store responses. Loopback HTTP checks verify private feed paths/query tokens/fragments and future columns are omitted, HEAD is empty, writes never read storage, and mixed unsafe catalogs/storage errors return generic 503s.
- Updated response audit/TASKS; archived iteration 1476. No live routes, config, data, migrations or provider calls changed; concrete catalog composition and frontend origin integration remain open.
- Verification: targeted HTTP test, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` and `git diff --check` pass. Full check: 720 unit/258 integration pass, four expected skips; saved reader retains four topics/19 stories/17 posts. Existing build warnings remain.
- No restart under STEERING 22: live entrypoints do not import this controller. Next: scheduled acceptance, live proxy proof and remaining public-route boundaries before promotion.
