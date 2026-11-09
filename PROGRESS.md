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
