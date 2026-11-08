## 2026-11-08: iteration 1386 — accept publication and browser-preference phases

- Clean main/no leftovers. Alerts empty; `/healthz` database/Redis healthy, no failed user units; all 36 sources healthy.
- Completed STEERING 50 phase 0/2 acknowledgments after the Nov 8 scheduled publication and detailed editorial/accounting comparisons. Updated plan/current tasks; phase 1 is next, keyword/Bluesky third-edition acceptance still awaits Nov 9.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` again passes: four topics, 19 stories/17 posts. Documented original-ID jq extraction plus `compare-publication-content.ts compare` again verifies all five original complete reader responses unchanged.
- GET-only admin status via `localAdminJson` confirms both development providers charged/held/unresolved $0/$0/0. Retained recorded-provider accounting acceptance (1289), deployed free-test exclusion (1290), inspected browser acceptance (1381); no duplicate paid verification.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` pass: 629 unit/233 integration passes, four expected skips. `git diff --check` passes. Orientation output was initially overbroad; subsequent reads were narrowed.
- Evidence/docs only: no provider calls, source fetches, data writes, deployment or restart during protected 13:00–16:00 UTC window; live application unchanged. VM stays private; phases 5–7 remain owner-gated. Next: additive phase-1 ownership/settings preparation, respecting migration/deployment restrictions.

## 2026-11-08: iteration 1387 — prepare the system-settings foundation

- Clean main/no leftovers. `pnpm obs alerts`: zero alerts; `/healthz` database/Redis healthy, no failed user units. Scheduled-reader Nov 8 check passes: four topics, 19 stories/17 posts.
- Prepared generated migration `0011_system_edition_settings`, schema snapshot and explorer metadata: one constrained system settings row copies the actual configured owner schedule; missing owner schedule aborts the transaction. Existing profile reads/writes are unchanged.
- Isolated PostgreSQL test verifies custom timezone/window/budget backfill, foreign-schedule exclusion, singleton and budget/null constraints, and missing-schedule DDL rollback. Complete schema parity and strict Drizzle no-change tests pass.
- Updated rollout plan, handbook callout and TASKS. Phase 1 remains open: nullable ownership, SYSTEM_OWNERSHIP reads and transactional dual writes are next; do not apply this foundation alone and let it become stale before those writes exist.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check`, `git diff --check` pass: 629 unit/234 integration passes, four expected skips. Offline `drizzle-kit generate --name=system_edition_settings` used; no provider calls.
- `pnpm exec tsx scripts/check-handbook.ts data-model`: 18 pages/three unchanged diagrams render; only two expected metadata warnings for the prepared, unapplied edition_settings table. No changed diagrams or reader UI.
- No live migration, source fetch, deployment or restart: STEERING 50 prohibits generation changes after noon (and all migrations/restarts 13:00–16:00). Live runtime remains unchanged; private backup and restored-copy rehearsal required before a future pre-noon migration. No phase ack or public access change.
- Initial push rejected because origin gained lead-only status commit d797fe90; fetched and merged without editing owner files or rewriting history, then retried push. Runtime code and verification inputs unchanged.

## 2026-11-08: iteration 1388 — prepare nullable system ownership

- Clean main/no leftovers. `pnpm obs alerts`: zero alerts; `/healthz` database/Redis healthy, no failed user units. Nov 8 scheduled-reader check passes: four topics, 19 stories/17 posts.
- Prepared offline migration `0012_nullable_system_ownership`, schema and snapshot: topics, editions and durable job requests/failures accept null ownership; existing ownership, foreign keys, schedule primary key and immutable edition guard remain intact.
- Added isolated migration coverage for complete row preservation, null ownership and invalid-profile rejection across all four tables. First test attempt updated an immutable edition and failed; corrected it to insert a new system-owned edition, retaining the production guard. Full rerun passes.
- Updated rollout plan, handbook callout and TASKS. SYSTEM_OWNERSHIP reads and transactional dual writes remain next; migrations 0011/0012 must wait for that work, private backup and restored-copy rehearsal.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/235 integration passes, four expected skips. `pnpm exec tsx scripts/check-handbook.ts data-model`: 18 pages/three unchanged diagrams pass; only two existing warnings for unapplied edition_settings metadata.
- No live migration, provider call, source fetch, deployment or restart: STEERING 50 forbids edition-generation deployment after noon except breakage. Live runtime remains unchanged; no phase ack or public-access change.
- Orientation output was initially overbroad; subsequent reads were narrowed. No secrets or owner-controlled files changed.
- Initial push rejected because origin gained owner steering commit fc71a5f7. Fetched and merged without conflicts/history changes; new instructions confirm phase 1, then 3/4 with flags off while acceptance waits. Verification inputs unchanged; retried push.

## 2026-11-08: iteration 1389 — prepare atomic system schedule settings

- Clean main/no leftovers. Alerts zero; `/healthz` database/Redis healthy; no failed user units. Nov 8 scheduled-reader check passes: four topics, 19 stories/17 posts.
- Prepared `SYSTEM_OWNERSHIP=1` schedule reads from edition_settings; flag-off reads retain the legacy schedule. Compatibility profile identity remains pending the wider ownership refactor.
- Schedule updates now write both settings tables in one transaction regardless of flag; missing singleton or system-side constraint failure rolls back the legacy write. Rollback keeps either read mode usable.
- Added isolated flag-switch, dual-write, system-side rejection and missing-singleton coverage. Full `pnpm check` passes: 629 unit/236 integration passes, four expected skips; build passes.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` pass. `pnpm exec tsx scripts/check-handbook.ts data-model`: 18 pages/three unchanged diagrams pass; two existing metadata warnings for unapplied edition_settings.
- Updated rollout plan, affected handbook callout and TASKS. No UI/source changes, provider calls or secret access. Initial orientation output was overbroad; subsequent reads narrowed.
- No live migration/deployment/restart: STEERING 50 forbids generation deployment after noon except breakage. Migrations 0011/0012 are required before deploying this adapter; private backup/restored-copy rehearsal still required. Live runtime remains unchanged.
- Next: topic/edition/durable-job system reads and remaining compatibility writes, then preservation comparisons and AI-off/recorded-AI-on acceptance before a pre-noon rollout. Phase 1 remains open; flag stays off.

## 2026-11-08: iteration 1390 — prepare system topic operations

- Clean main/no leftovers. `pnpm obs alerts`: zero alerts; `/healthz` database/Redis healthy; no failed user units. Nov 8 scheduled-reader check passes: four topics, 19 stories/17 posts.
- Prepared `SYSTEM_OWNERSHIP=1` topic reads and mutations against the shared catalog, including nullable/foreign ownership. Flag-off operations retain default-profile isolation; new topics retain the default profile for rollback.
- Isolated coverage checks unchanged original reads, flag-off mutation refusal, system updates/connections/custom feeds, preserved ownership, compatibility creation, complete reorder validation and contiguous deletion positions.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/237 integration passes, four expected skips. `pnpm exec tsx scripts/check-handbook.ts data-model` and `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` pass.
- Updated TASKS, rollout plan and affected handbook callout. Handbook validation passes: 18 pages/three unchanged diagrams; two existing metadata warnings for unapplied edition_settings. No UI/source changes or provider calls.
- No live migration/deployment/restart: STEERING 50 forbids edition-generation deployment after noon except breakage. Prepared migrations and ownership adapters remain undeployed; flag stays off.
- Next: edition/durable-job system reads and remaining compatibility writes, then private backup/restored-copy rehearsal and preserved-response/AI-off/recorded-AI-on acceptance before pre-noon rollout. Phase 1 remains open.

## 2026-11-08: iteration 1391 — prepare system durable-job recovery

- Clean main/no leftovers. `pnpm obs alerts`: zero alerts; `/healthz` database/Redis healthy; no failed user units. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- Prepared `SYSTEM_OWNERSHIP=1` request/failure reads across null and foreign ownership. Flag-off reads retain default-profile isolation; new records retain compatibility ownership for rollback.
- Isolated test verifies missing records, both ownership types, idempotent inserts without ownership/duration changes, and flag-off recovery of newly written records.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/238 integration passes, four expected skips. First check stopped on a trailing blank line introduced during progress archival; corrected and full rerun passed.
- `pnpm exec tsx scripts/check-handbook.ts data-model` passes: 18 pages/three unchanged diagrams, two existing unapplied edition_settings metadata warnings. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes.
- Updated rollout plan, handbook callout and TASKS; archived iterations 1337–1344 to keep PROGRESS small. No UI/source changes, provider calls or secret access.
- No live migration/deployment/restart: STEERING 50 forbids generation deployment after noon except breakage. Prepared migrations/adapters remain undeployed; system flag stays off.
- Next: edition system reads and generation topic scope, preserved responses, private backup/restored-copy rehearsal and AI-off/recorded-AI-on acceptance before pre-noon rollout. Phase 1 remains open.

## 2026-11-08: iteration 1392 — prepare system edition scope

- Clean main/no leftovers. Alerts zero; `/healthz` database/Redis healthy; no failed user units. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- Prepared `SYSTEM_OWNERSHIP=1` latest/direct/history/generation-key reads and generation topic selection across null/foreign ownership. Publication filters and saved snapshots remain intact; flag-off reads retain profile isolation.
- New editions retain default-profile ownership for rollback. Isolated coverage verifies ordering, publication exclusion, shared-topic generation, scheduled replay and recovery after flag-off.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/239 integration passes, four expected skips.
- Initial integration attempts exposed fixture cleanup against the immutable-edition trigger and an invalid published test fixture; corrected transactional cleanup and publication metadata, then full check passed.
- `pnpm exec tsx scripts/check-handbook.ts data-model` passes: 18 pages/three unchanged diagrams, two existing unapplied edition_settings warnings. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z` passes.
- Updated TASKS, rollout plan and affected handbook callout. No UI/source changes, provider calls or secret access.
- No live migration/deployment/restart: STEERING 50 forbids generation deployment after noon except breakage. Prepared migrations/adapters remain undeployed; system flag stays off.
- Next: private backup/restored-copy rehearsal, every-edition response preservation and AI-off/recorded-AI-on acceptance before pre-noon rollout. Phase 1 remains open.

## 2026-11-08: iteration 1393 — rehearse system ownership on private restore

- Clean main/no leftovers; alerts zero, `/healthz` database/Redis healthy, no failed user units. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- Added `python3 ops/backups/rehearse_system.py`: fresh private snapshot backup, checksum/count-verified networkless restore, pending 0011/0012 SQL in one transaction, unconditional container cleanup.
- Final rehearsal: backup `news-digest-20261108T165928Z`, 30 tables/54,484 rows restored; all 29 original data-table full-row fingerprints and existing foreign keys unchanged. Schedule copied exactly; four ownership columns nullable.
- Injected failure after both migration files rolls back DDL, data and ledger entries. Receipt links backup/migration SHA256 checksums at `~/backups/news-digest/system-ownership-proof.json` (600); no row content printed, provider calls or secret reads.
- SQL rehearsal does not run the TypeScript migration runner or adapter/HTTP/AI acceptance; those remain separate gates. Updated TASKS, rollout plan and backup handbook command.
- Verification: four backup unit tests pass; handbook check passes (18 pages, no changed diagrams), with two existing unapplied edition_settings metadata warnings. `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/239 integration passes, four expected skips.
- No live migration/deployment/restart: STEERING 50's after-noon generation cutoff remains in force. Scratch container removed; live health remains green.
- Next: every-edition preserved-response comparisons, actual runner/adapter checks and AI-off/recorded-AI-on acceptance before pre-noon rollout. Phase 1 remains open.

## 2026-11-08: iteration 1394 — system ownership HTTP preservation

- Clean main/no leftovers; alerts zero, health database/Redis healthy, no failed user units. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- Extended isolated Nest HTTP acceptance to capture complete latest/direct/history responses for every original-owner fixture edition and all original history entries across every page, including private-edition 404s.
- Deep comparisons cover SYSTEM_OWNERSHIP off/on/off rollback with publication filtering enabled and disabled. Pagination must advance and terminate; original flag values restored after test.
- Initial full check exposed intentional foreign-owner history expansion from earlier fixtures; comparison now preserves original-owner entries while checking all pages and termination.
- This verifies isolated fixtures only; restored-production response preservation, actual restored-copy runner/adapter and AI-off/recorded-AI-on acceptance remain open.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/239 integration passes, four expected skips.
- `pnpm exec tsx scripts/check-handbook.ts public-access` checks 18 pages/no diagrams; exits 1 only for the two existing unapplied edition_settings metadata warnings. No handbook behavior changed.
- Updated TASKS and rollout plan. No provider calls, source/UI changes, secret reads or live data writes.
- No live migration/deployment/restart: STEERING 50 after-noon generation cutoff remains in force; flag stays off.
- Next: restored-copy migration runner and every-edition HTTP comparisons, then AI acceptance before pre-noon rollout. Phase 1 remains open.

## 2026-11-08: iteration 1395 — actual migration runner on private restore

- Clean main/no leftovers; alerts zero, live health database/Redis healthy, no failed user units. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- Extended `python3 ops/backups/rehearse_system.py` to execute the production TypeScript migration entry point twice against a fresh networkless restored backup, through a private Unix socket with no live configuration/provider credentials.
- Final backup `news-digest-20261108T172201Z`: 30 tables/54,514 rows restored; 29 original data-table fingerprints, foreign keys and schedule parity preserved; four ownership columns nullable. Second run preserves complete data and migration-ledger fingerprints including timestamps.
- Existing injected SQL failure still rolls back both pending migrations. Private receipt records actual-runner/idempotence checks and backup/migration hashes. Initial cleanup permission failure fixed; final run exits zero and removes scratch container/socket directory.
- Four backup unit tests pass. `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/239 integration passes, four expected skips.
- Handbook check (`backups`) renders 18 pages/no diagrams; only two existing unapplied edition_settings metadata warnings. Updated affected backup handbook, rollout plan and TASKS; archived iterations 1381–1385 to keep PROGRESS small.
- No provider calls, source/UI changes, live migration/deployment/restart: STEERING 50 after-noon generation cutoff remains in force; flag stays off.
- Next: restored-copy adapter/HTTP response comparisons and AI-off/recorded-AI-on acceptance before pre-noon rollout; phase 1 remains open.

## 2026-11-08: iteration 1396 — restored-copy adapter preservation

- Clean main/no leftovers; alerts zero, healthy live database/Redis, no failed user units. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- Added private restored-copy read-adapter acceptance to `python3 ops/backups/rehearse_system.py`: all 550 stored editions, complete latest/direct/paginated history with both publication filters, topics and schedule settings match SYSTEM_OWNERSHIP off/on/off.
- Fresh backup `news-digest-20261108T173020Z` restores 30 tables/54,524 rows; migration runner twice and injected rollback still pass. PostgreSQL enforces read-only comparison sessions; all data/ledger fingerprints unchanged after comparisons. Private receipt records parity; scratch socket/container removed.
- No restored content printed, provider calls or live writes. Updated TASKS, rollout plan and affected backup handbook; restored-copy HTTP and AI acceptance remain separate gates.
- Verification: four backup unit tests, `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass. Handbook (`backups`) checks 18 pages/no diagrams; only two existing unapplied edition_settings metadata warnings.
- Full check totals: 629 unit and 239 integration passes; four expected integration skips.
- No live migration/deployment/restart: STEERING 50 after-noon generation cutoff remains in force; flag stays off.
- Next: restored-copy HTTP comparisons and AI-off/recorded-AI-on acceptance before pre-noon rollout. Phase 1 remains open.

## 2026-11-08: iteration 1397 — restored-copy reader HTTP preservation

- Clean main/no leftovers; alerts zero, live database/Redis healthy, no failed user units. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- Extended the private restore harness with the production Nest reader controller/repository, bound only to loopback without worker/provider composition.
- Complete latest/direct/history HTTP responses for all 550 saved editions match ownership off/on/off with publication filtering enabled and disabled, including private 404s and terminating pagination.
- Fresh backup `news-digest-20261108T173745Z`: 30 tables/54,528 rows restored; read-only sessions and unchanged complete data/ledger fingerprints verified. Actual migration runner twice and injected rollback still pass.
- First rehearsal passed comparisons but failed cleanup because Nest and the script both closed the repository pool; removed duplicate close. Final rehearsal exits zero, writes the private receipt and cleans scratch resources.
- Four backup unit tests pass; scheduled-reader command: `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z`.
- Updated TASKS, rollout plan and backup handbook. Handbook check (`backups`) checks 18 pages/no diagrams; only two existing unapplied edition_settings metadata warnings.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/239 integration passes, four expected skips.
- No provider calls, live data writes, migration/deployment/restart: STEERING 50 after-noon generation cutoff remains in force; flag stays off.
- Next: AI-off/recorded-AI-on acceptance before pre-noon rollout; phase 1 remains open.

## 2026-11-08: iteration 1398 — isolated system test-edition generation

- Clean main/no leftovers; `pnpm obs alerts` zero, `/healthz` database/Redis healthy, no failed user units.
- Extended edition golden integration cases with SYSTEM_OWNERSHIP on: AI-off and synthetic fixture-AI private test editions preserve complete expected topic/story snapshots across two generations.
- Tests assert kind=test, unpublished state, published-reader exclusion and default-profile ownership; flag-off retrieval preserves the complete saved response.
- Development editors use a fresh per-edition cache; production repeats retain their existing cache assertions. No provider calls or live data writes.
- Initial checks found the fixture bridge omitted model/purpose stripped by development-json; first replacement missed formatted source, then corrected reconstruction from the development role.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/241 integration passes, four expected skips. Scheduled-reader check passes: four topics, 19 stories/17 posts.
- No live migration/deployment/restart: STEERING 50 after-noon generation cutoff applies. Live flag-on test runs and normal scheduled acceptance remain open; synthetic fixtures do not close phase 1.
- Next: pre-noon private backup/migration/rollout and live test acceptance, then normal scheduled publication before phase 3 activation.
