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

## 2026-11-09: iteration 1498 — prepare source-health composition

- Clean main/no leftovers; alerts/healthz clear and no failed user units. Live source check finds 36 successful sources/zero stored errors; saved Nov 8 reader retains four topics/19 stories/17 posts.
- Added disconnected gated source-health module and explicit-column database reader: SQL reduces historical errors to presence without fetching text; URLs/ownership/future fields are never selected. Caller retains pool ownership.
- Isolated database/loopback checks cover full catalog/count parity, absent legacy profile table, credential-bearing errors/URLs, nullable and UTC timestamps, generic storage failure and refused writes. Disabled mode opens no storage; unsafe prerequisite flags fail closed.
- Updated response audit/TASKS. No live routes/config/data/migrations/provider calls changed; accounts stay disabled. Runtime installation and frontend integration remain open.
- Verification: targeted HTTP tests, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, authenticated source check, `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` and `git diff --check`.
- Full check passes 725 unit/260 integration tests, four expected skips. Build passes with existing bundle warnings; targeted HTTP and saved-reader checks pass.
- No restart under STEERING 22: live entrypoints do not import this composition. Next: normal 15:00 acceptance, live proxy proof and remaining public-route integration before promotion.

## 2026-11-09: iteration 1499 — compose gated public settings reads

- Clean main/no leftovers; alerts/healthz clear, no failed user units. Authenticated source check finds 36 successful sources/zero stored errors; digest queue has no failures and saved Nov 8 reader retains four topics/19 stories/17 posts.
- Added disconnected aggregate module for schedule, topics, source catalog and source health; all readers share one lazy caller-owned pool. Default-off composition installs no routes/storage; unsafe prerequisites fail before storage opens.
- Combined disposable-storage HTTP checks cover all GET/HEAD responses, secret URL/error omission, refused writes, absent unaudited/legacy routes, isolated missing-settings failure and caller pool reuse after shutdown.
- Updated response audit/TASKS; archived iteration 1481. Article URL/text review remains open, including query-bearing links; no article projection or route promotion attempted.
- No live entrypoints/config/data/migrations/provider calls changed; accounts remain disabled. No restart under STEERING 22 because live entrypoints do not import this composition.
- Verification: targeted disabled-composition HTTP test, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, authenticated sources, `pnpm obs jobs --check`, saved-reader check and `git diff --check`.
- Full check passes 726 unit/261 integration tests, four expected skips; build passes with existing bundle warnings. Targeted disabled HTTP, combined database/HTTP and saved-reader checks pass.
- Next: normal 15:00 UTC Phase 1 acceptance, live proxy proof and remaining public-route/frontend integration before promotion.

## 2026-11-09: iteration 1500 — inventory stored article-link privacy boundaries

- Clean main/no leftovers; alerts/healthz clear and no failed user units. All 36 sources succeeded within two hours, zero stored errors, 1,089 latest-response items; digest queue has no failures. Saved Nov 8 reader retains four topics/19 stories/17 posts.
- Added read-only repeatable-read inventory of every stored canonical article link using a bounded 1,000-row cursor. Output contains only fixed aggregate counters; URL values, hosts, parameter names, parser errors and titles never enter the report.
- Live inventories at 08:34/08:36 UTC agree: 7,299 links, zero malformed/credential-bearing, 7,293 public-HTTPS-policy passes/six rejections, 2,185 query-bearing and zero fragments. These counts do not approve paths/query values for public display; article routes stay restricted.
- Offline adversarial checks cover overlapping risks and encoded delimiters; disposable Postgres verifies all 1,003 fixture rows, unchanged fingerprints and clean connection reuse after a missing-column failure.
- Updated response audit/TASKS; archived iterations 1482–1483. No live app/config/data/migrations/provider calls changed; accounts remain disabled. No restart under STEERING 22 because running services import none of these scripts.
- Verification: targeted unit test, isolated integration suite, two live inventory runs, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, authenticated source freshness, `pnpm obs jobs --check`, saved-reader check and `git diff --check`.
- Fixed archived-note formatting found by the first check; rerun passes 728 unit/262 integration tests, four expected skips. Build passes with existing bundle warnings.
- Next: reviewed article-link display policy/configured text and remaining public-route integration; normal 15:00 UTC Phase 1 acceptance and live proxy proof remain pending.

## 2026-11-09: iteration 1501 — prepare origin-only article-link display

- Clean main/no leftovers; alerts/healthz clear, no failed user units. All 36 sources succeeded within two hours, zero stored errors, 1,089 latest-response items; digest queue has no failures. Historical ingestion failures remain retained; current collection succeeds.
- Prepared publisher-origin-only display helper: every path/query/fragment is omitted, malformed/ineligible/credential-bearing links return null, and stored URLs never serve as fallbacks. Original article permalinks remain restricted; hostname/text review and public transport are still required.
- Three offline tests cover private paths/queries/redirects, encoded delimiters, normalization, credentials/local addresses and unchanged GET/HEAD route classification.
- Updated response audit/TASKS; archived iterations 1484–1485. No live entrypoints/config/data/migrations/provider calls changed; accounts remain disabled. No restart under STEERING 22 because running services import none of this preparation.
- Verification: targeted tests, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, authenticated source freshness, `pnpm obs jobs --check`, saved-reader check and `git diff --check`.
- Full check passes 731 unit/262 integration tests, four expected skips; build passes with existing bundle warnings. Saved Nov 8 reader retains four topics/19 stories/17 posts.
- Next: hostname/configured-text review and remaining public transport integration; normal 15:00 UTC Phase 1 acceptance and live proxy proof remain pending.

## 2026-11-09: iteration 1502 — prepare explicit article-list response boundary

- Clean main/no leftovers; alerts/healthz clear, no failed user units. All 36 sources succeeded within two hours with zero stored errors; digest queue has no failures. Historical ingestion failures remain retained; current collection succeeds.
- Added disconnected article-list projection: explicit topic/article fields, origin-only publisher display, nested extra-column stripping, independent null origins for rejected links and fixed storage/schema failure responses. Ordering and empty groups are retained.
- Three offline tests cover private path/query/extra-column omission, mixed malformed URLs and storage/schema errors without validation details.
- Updated response audit/TASKS. Configured title/source text and hostname approval, dedicated system reader and transport remain open; no route classification changes.
- No live entrypoints/config/data/migrations/provider calls changed; accounts remain disabled. No restart under STEERING 22 because running services import none of this preparation.
- Verification: targeted tests, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, authenticated source freshness, `pnpm obs jobs --check`, saved-reader check and `git diff --check`.
- Full check passes 734 unit/262 integration tests, four expected skips; build passes with existing bundle warnings. Saved Nov 8 reader retains four topics/19 stories/17 posts.
- Next: normal 15:00 UTC Phase 1 acceptance, live proxy proof and remaining article review/reader/transport integration before promotion.

## 2026-11-09: iteration 1503 — prepare system article database reader

- Clean main/no leftovers; alerts/healthz clear, no failed user units. All 36 sources healthy; digest queue has no failures. Historical ingestion failures remain retained; current collection succeeds.
- Added disconnected `PublicArticlesReader`: explicit system topic/source/article columns, five newest distinct articles per enabled topic, empty groups and deterministic date/ID ordering; existing betting-path exclusion retained. Pool remains caller-owned; legacy profiles and ownership flags are never consulted.
- Isolated storage test covers duplicate source observations, source-name selection, limits, ordering, disabled/empty topics, unset/off/on flags, absent legacy table, future private column, omitted private URL values and fixed missing-column errors with clean rollback/pool reuse.
- Updated response audit/TASKS; archived iterations 1486–1487. Configured text/hostname review and transport integration remain required; routes stay restricted and accounts disabled. No live config/data/migrations/provider calls changed.
- No restart under STEERING 22: live entrypoints do not import the new reader.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm obs sources --check`, `pnpm obs jobs --check`, saved-reader check and `git diff --check`. Initial check found archive formatting; fixed before rerun. Build passes with existing bundle warning; saved Nov 8 reader retains four topics/19 stories/17 posts.
- Full check passes 734 unit/263 integration tests with four expected skips; build passes.
- Next: normal 15:00 UTC Phase 1 acceptance, live proxy proof, configured article text/host review and gated article transport.

## 2026-11-09: iteration 1504 — prepare gated article HTTP transport

- Clean main/no leftovers; alerts and healthz clear, no failed user services. All 36 sources healthy; jobs check passes and saved Nov 8 reader retains four topics/19 stories/17 posts.
- Added disconnected article GET/HEAD controller and flag-gated module; disabled mode opens no storage/routes, unsafe prerequisites fail before storage opens. No write handlers or window endpoint.
- Revalidate projected system-reader output at HTTP boundary: explicit fields, nested extra-column stripping, origin-only normalization with no stored-URL fallback and fixed 503 errors. Offline HTTP checks cover GET/HEAD, no-store, refused writes, malformed/empty groups, rejected origins, private columns/URLs and storage failures.
- Updated TASKS and response audit. Configured title/source text and hostname review, combined installation and authorization remain required; accounts/public mode remain disabled.
- No live entrypoints/config/data/migrations/provider calls changed; no restart under STEERING 22 because running services import none of this preparation.
- Verification: targeted HTTP tests, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm obs sources --check`, `pnpm obs jobs --check`, `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` and `git diff --check`.
- Full check passes 736 unit/263 integration tests with four expected skips; build passes with existing bundle warnings.
- Next: configured article text/hostname review and combined transport installation; normal 15:00 UTC phase-1 scheduled acceptance and live proxy proof remain pending.

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
