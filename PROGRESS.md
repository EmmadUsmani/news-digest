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

## 2026-11-09: iteration 1494 — prepare public source-catalog runtime

- Clean main/no leftovers; alerts/healthz clear, no failed user units; all 36 sources healthy and four queue workers available. Scheduled Phase 1 acceptance awaits 15:00 UTC.
- Added unregistered `PublicSourcesModule.prepare` and explicit-column catalog reader. Default-off mode registers no route/storage; unsafe flags and missing system/published prerequisites fail before dependencies.
- Isolated HTTP/database checks match the full existing catalog after profile rename and private future-column/URL-token injection; GET/HEAD, refused writes, unsafe-origin generic 503 and shared-pool ownership pass.
- Updated response audit/TASKS; archived iteration 1477. No live routes/config/data/migrations/provider calls changed; accounts remain disabled. Frontend origin integration and authorization remain open.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, scheduled-reader check and `git diff --check` pass. First check stopped on archive formatting; formatted and full retry passes 721 unit/259 integration tests, four expected skips. Build retains existing bundle warnings.
- Saved reader retains four topics/19 stories/17 posts. No restart under STEERING 22: live entrypoints do not import this module. Next: scheduled acceptance, live proxy proof and remaining public-route boundaries before promotion.

## 2026-11-09: iteration 1495 — source catalog reader compatibility

- Clean main/no leftovers; alerts/healthz clear and no failed user units. Scheduled Phase 1 acceptance remains due at 15:00 UTC.
- Topic editor now parses only source IDs/names through a shared contract, discarding transport fields before caching; legacy feed-URL and prepared origin-only catalogs both work.
- Read-only Playwright replay checks all 36 saved catalog entries and existing connections at desktop/mobile widths for both shapes, plus malformed-catalog refusal. Public responses are simulated; no writes or provider calls.
- Updated response audit/TASKS and desktop/mobile screenshots; archived iteration 1478. Live routes/access/config and disabled account gates unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/smoke-source-catalog-compatibility.ts`, scheduled-reader check and `git diff --check`.
- Full check passes: 721 unit tests and 259 integration tests, four expected skips; build passes with existing bundle warnings. Saved reader retains four topics/19 stories/17 posts.
- API restarted for rebuilt frontend; health passes. Next: scheduled acceptance, live proxy proof and remaining public-route boundaries before promotion.

## 2026-11-09: iteration 1496 — prepare public source health projection

- Clean main/no leftovers; alerts/healthz clear and no failed user units. Authenticated source check finds 36 sources with successful collection and zero stored errors; saved Nov 8 reader retains four topics/19 stories/17 posts.
- Added disconnected source-health allowlist: IDs/names, normalized UTC attempt/success timestamps, nonnegative safe item counts and failure presence only. Configured URLs, topic ownership, historical error text and future columns are omitted.
- Offline adversarial checks cover credential-bearing stored errors/URLs, null timestamps, empty errors, mixed malformed catalogs, invalid counts/dates and exact generic 503 bodies. Existing GET/HEAD remains admin-classified; transport/storage/frontend integration remains open.
- Updated response audit/TASKS; archived iteration 1479. No live routes/config/data/migrations/provider calls changed; accounts remain disabled.
- Verification: targeted source-health tests, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, scheduled-reader check and `git diff --check`.
- Full check passes 723 unit/259 integration tests with four expected skips. Build passes with existing bundle warnings; saved-reader parity passes.
- No restart under STEERING 22: live entrypoints do not import this projection. Next: scheduled 15:00 acceptance, live proxy proof and remaining public-route boundaries before promotion.

## 2026-11-09: iteration 1497 — prepare source-health HTTP boundary

- Clean main/no leftovers; alerts and healthz clear, no failed user units. Authenticated source check finds 36 successful sources and zero stored errors; saved Nov 8 reader retains four topics/19 stories/17 posts.
- Added unregistered source-health GET/HEAD controller using the prepared strict projection, no-store responses and generic storage/validation failures; configured URLs, historical credentials and future fields never enter the HTTP response.
- Real isolated loopback HTTP checks verify UTC normalization, omitted secrets, bodyless HEAD, malformed mixed results and refused writes without storage reads.
- Updated response audit/TASKS; archived iteration 1480. No live routes/config/data/migrations/provider calls changed; accounts stay disabled. Storage/runtime/frontend integration remains open.
- Verification: targeted HTTP test, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, authenticated source check, scheduled-reader check and `git diff --check`.
- Full check passes 724 unit/259 integration tests, four expected skips. Build passes with existing bundle warnings. No restart under STEERING 22: live entrypoints do not import this controller.
- Next: complete source-health composition; normal 15:00 UTC Phase 1 acceptance and live proxy proof remain pending.
