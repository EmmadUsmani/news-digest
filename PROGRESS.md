# Progress

[Through iteration 1729](docs/progress-archive/2026-11-10-through-1729.md).

## 2026-11-10: iteration 1730 — apply approved admission-outcome migration

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. NBA correction retained unchanged, scheduled acceptance Nov 11.
- Owner-approved Phase 3 acceptance permits 0019; public mode and sharing remain off/private. Corrected stale Phase 3/migration gates in plan, readiness, tasks and owner notes.
- `python3 ops/backups/rehearse_admission_outcome.py`: fresh private backup `news-digest-20261110T192854Z`, isolated restore 39 tables/73,420 rows; 38 original-table fingerprints preserved, rollback/idempotence/outcome/private-grant checks pass.
- Applied live with `MIGRATE_THROUGH=0019_admin_write_outcomes`; bounded runner twice leaves exactly one ledger entry/no later migrations, original admissions unchanged and outcomes null. Private receipt `~/backups/news-digest/admission-outcome-live-migration-proof.json`.
- All 112 privilege checks deny both operational reader roles across eight private tables. No paid calls, account credentials, publication writes or public activation. Handbook reflects live outcome column and current-backup restore use.
- Verification: format/lint fix, full check, build, handbook and diff checks; 32 deployed account-boundary checks and scheduled reader four topics/19 stories/15 posts. Full `pnpm check`: 826 unit, 280 integration/four expected skips; `pnpm build` and handbook pass. Push then API/worker restart and post-deploy health/reader/alerts follow.
- Next: finish Phase 4 data boundaries behind flags; natural link-expiry after Nov 11 00:33:01 UTC and scheduled NBA acceptance remain due.

## 2026-11-10: iteration 1731 — prepare bounded atomic Grafana aggregate refresh

- Clean main; no inherited work. Initial alerts zero; `/healthz` database/Redis healthy. NBA correction unchanged, Nov 11 scheduled acceptance pending.
- Added uninstalled separate-store refresh helper: explicit aggregate parameters, at most 30 unique UTC days, nonnegative safe counts and source-count bounds. Replacement prunes stale rows; transaction/table locks serialize complete snapshots.
- Disposable real-login coverage exercises repeated refresh, stale-row removal, invalid/duplicate/future/expired dates, negative counts and database failure after deletes retaining prior content/source totals.
- No live exporter, credentials, timer, datasource, role grants or public-mode activation. Producer, writer/transport, freshness, capacity and Grafana rendering/query review remain before deployment. No paid calls.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, handbook check and `git diff --check`; deployed account boundary 32 checks and scheduled reader four topics/19 stories/15 posts. Full check passes: 826 unit, 280 integration/four expected skips. Build/handbook pass; push then API/worker restart and health/reader/alerts checks.
- Next: continue Phase 4 data boundaries behind flags; natural link expiry after Nov 11 00:33:01 UTC, then Nov 11 NBA scheduled acceptance.

## 2026-11-10: iteration 1732 — prepare restricted aggregate export writer

- Clean main; no inherited work. Initial alerts zero and `/healthz` database/Redis healthy. NBA correction unchanged; Nov 11 scheduled acceptance pending.
- Prepared dedicated-instance writer login with INSERT/DELETE on aggregate tables only, no ownership/read/update/truncate/schema or role-switch access; one connection, five-second statement and 500 ms lock defaults.
- Disposable real-login refresh now verifies replacement, retention, invalid inputs and database-failure rollback through this restricted writer. Conflicting lock refuses with `55P03`, preserves prior content and permits later pool reuse.
- No live role grants, exporter, credentials, transport, datasource or public activation. Producer aggregation, network/TLS, freshness, capacity and Grafana query/rendering gates remain. No paid calls.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, handbook check and `git diff --check`; live account boundary 32 checks and scheduled reader four topics/19 stories/15 posts. Full check passes: 826 unit, 280 integration/four expected skips. Build/handbook pass; push then API/worker restart and health/reader/alerts checks.
- Next: continue Phase 4 data boundaries; natural link expiry after Nov 11 00:33:01 UTC and Nov 11 NBA scheduled acceptance remain due.

## 2026-11-10: iteration 1733 — prepare published-only aggregate producer

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. NBA correction unchanged; Nov 11 scheduled acceptance pending.
- Prepared trusted application-side producer returning only daily edition/topic/story/post counts and source totals in one statement/database snapshot; no raw content, identifiers or errors leave it.
- UTC today plus preceding 29 days only; unpublished, future-day and expired editions excluded. Malformed topic collections count empty; disabled source errors excluded from enabled/error totals.
- Disposable timezone test caught implicit date conversion admitting the next UTC day; explicit timestamp conversion fixes it. Coverage checks private markers, exact counts, malformed snapshots, retention and Pacific/Honolulu equivalence.
- No producer registration, schedule, live grants, exporter, credentials, transport, datasource or public activation; no paid calls. Transport/TLS, freshness, capacity and Grafana query/rendering gates remain.
- Verification: format/lint fix, full check, build, handbook and diff checks; live account boundary 32 checks and scheduled reader four topics/19 stories/15 posts. Full check passes: 826 unit, 280 integration/four expected skips; build/handbook pass. Push then API/worker restart and post-deploy health/reader/alerts checks.
- Next: Phase 4 data boundaries; natural link expiry after Nov 11 00:33:01 UTC and Nov 11 NBA scheduled acceptance remain due.

## 2026-11-10: iteration 1734 — prepare atomic aggregate export freshness

- Clean main; no inherited work. Initial alerts zero; `/healthz` database/Redis healthy. Nov 11 NBA scheduled acceptance remains pending.
- Prepared separate-store `export_status` capture timestamp, replaced in the same locked transaction as all counts; no status row means no successful export. Caller must preserve capture time across retries.
- Disposable real reader/writer logins verify missing status, replacement, database-failure rollback retaining old capture time and recovery advancing it. Existing role isolation and lock-timeout checks pass.
- No live schema/role grants, exporter, credentials, datasource or public activation; no paid calls. Transport/TLS, freshness panels/alerts, capacity and rendering/query gates remain.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (826 unit; 280 integration passed/four expected skips), `pnpm build`, handbook (18 pages/22 diagrams) and `git diff --check` pass.
- Pushed `0c1056ec`; API/worker restarted active; health and 32 account-boundary checks pass; reader four topics/19 stories/15 posts. RecentJobFailures reflects GamingBolt timeouts; scheduled third attempt recovered HTTP 200 at 20:20:05 UTC (406 ms), before restart.
- Next: Phase 4 export transport and freshness consumer; natural link expiry after Nov 11 00:33:01 UTC, then Nov 11 NBA scheduled acceptance.

## 2026-11-10: iteration 1735 — prepare dedicated-store Grafana freshness panel

- Clean main; no inherited work. Health/database/Redis pass; initial RecentJobFailures reflects recovered GamingBolt retries, not a stalled source.
- Corrected prepared source-health panel to query dedicated export source_summary rather than the application-only source_health view.
- Added export-age stat: missing/future capture displays No valid export; age turns red at 900 seconds. No installation or live UI change.
- Disposable restricted-reader checks execute all four exact panel queries and verify absent, future, fresh and stale captures; existing replacement/rollback/isolation checks pass.
- Verification: format, lint fix, full check (826 unit; 280 integration/four expected skips), build, handbook (39 schema tables) and diff checks pass. Live account boundary 32 checks; scheduled reader four topics/19 stories/15 posts.
- No paid calls, live grants, credentials or public activation. Transport/TLS, alerts, capacity, provisioning and rendering/query-route gates remain.
- Push then API/worker restart and post-deploy health/reader/alerts checks. Next: Phase 4 export transport; Nov 11 natural link expiry and scheduled NBA acceptance remain due.

## 2026-11-10: iteration 1736 — preserve monotonic aggregate captures

- Clean main; no inherited work. Alerts zero; health/database/Redis pass. Nov 11 NBA acceptance and natural link expiry remain pending.
- Found delayed prepared exports could replace a newer snapshot and move freshness backward. Under the replacement lock, older and equal capture timestamps now leave all committed counts/status unchanged.
- Restricted writer gains SELECT only on capture status; aggregate reads remain denied. Disposable real-login test checks delayed older delivery and altered same-capture retry preserve story/source counts and timestamp; existing rollback, lock-timeout and recovery checks pass.
- No live schema/grants, credentials, transport, exporter installation, public activation or paid calls. Transport/TLS, alerts, capacity, provisioning and rendering/query-route gates remain.
- Verification: targeted disposable export test passes; format/lint fix, full check (826 unit; 280 integration/four expected skips), build, handbook (18 pages/22 diagrams/39 tables) and diff checks pass. Live account boundary 32 checks pass; scheduled reader four topics/19 stories/15 posts.
- Initial direct test invocation refused the missing isolation marker; rerun with explicit isolated flag and export-only test selection passed without live database access.
- Next: finish export transport; Nov 11 link expiry after 00:33:01 UTC and scheduled NBA acceptance. Push followed by API/worker restart and post-deploy health/reader/alerts checks.

## 2026-11-10: iteration 1737 — prepare loopback aggregate export transport

- Clean main; no inherited work. Alerts zero and health/database/Redis pass; Nov 11 expiry/NBA acceptance remain pending.
- Prepared explicit one-shot exporter: separate literal-loopback ports, mandatory source/target credentials, restricted writer, read-only producer, one connection per pool and bounded connection/statements. Remote transport refused; CLI hides driver details and closes pools.
- Disposable two-instance path passes: source writes refused, aggregate transfer/capture succeeds, producer connection failure retains previous capture. Trust-auth fixtures do not verify real passwords; no live exporter, credentials, grants or public activation.
- Initial full check caught a duplicate variable in the added integration test; renamed and reran. An unisolated test-filter attempt refused its isolation marker before database access.
- Verification: format/lint fix, targeted transport test and lint, CLI missing-config refusal, build, handbook (18 pages/one unchanged diagram/39 tables), diff check and `pnpm check` rerun pass (827 unit; 280 integration/four expected skips).
- Live account boundary: 32 pass; scheduled reader four topics/19 stories/15 posts. No paid calls.
- Next: real export password auth/listener isolation, freshness alerts, capacity and provisioning/rendering gates; Nov 11 link expiry after 00:33:01 UTC and scheduled NBA acceptance.
- Pushed after verification; API/worker restart and post-deploy health/reader/alerts checks follow.
