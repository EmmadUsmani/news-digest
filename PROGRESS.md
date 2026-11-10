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

## 2026-11-10: iteration 1738 — rehearse export target SCRAM authentication

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass.
- Replaced disposable aggregate target trust authentication with SCRAM; synthetic owner/reader/writer passwords only, no live credentials or grants.
- Verified SCRAM verifiers, successful restricted reader/writer login, wrong-password SQLSTATE 28P01 and exporter rejection preserving the committed capture. Source fixture still uses trust; listener isolation remains unverified.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit; 280 integration/four expected skips), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts` (18 pages/22 diagrams/39 tables), and `git diff --check` pass.
- Live account boundary 32 checks pass; scheduled reader four topics/19 stories/15 posts. No paid calls, exporter installation or public activation.
- Next: source authentication/listener isolation, freshness alerts, capacity/provisioning/rendering gates; Nov 11 natural link expiry and scheduled NBA acceptance remain pending.
- Push followed by API/worker restart and post-deploy health/reader/alerts checks.

## 2026-11-10: iteration 1739 — rehearse export source SCRAM authentication

- Clean main; no inherited work. Alerts zero; health/database/Redis pass. Nov 11 natural expiry and scheduled NBA acceptance remain pending.
- Replaced trust-auth source in the disposable aggregate transport rehearsal with a separate SCRAM Postgres instance and SELECT-only producer login; seeded synthetic published/unpublished records and private source errors.
- Correct source credentials transfer aggregate counts; wrong source password fails with SQLSTATE 28P01 and preserves committed capture. Producer writes fail with 42501 even after resetting read-only defaults. Target SCRAM and aggregate-only reader checks still pass.
- No live schema/grants, credentials, exporter installation, public activation or paid calls. Listener isolation remains unverified; freshness alerts, capacity, provisioning/rendering/query-route gates remain.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts` and `git diff --check` pass; 827 unit and 280 integration tests pass, four expected skips; handbook 18 pages/22 diagrams/39 tables.
- Live account boundary 32 checks pass; scheduled reader four topics/19 stories/15 posts.
- Next: listener isolation and remaining Phase 4 gates; Nov 11 link expiry after 00:33:01 UTC and scheduled NBA acceptance.
- Pushed after verification; API/worker restart and post-deploy health/reader/alerts checks follow.

## 2026-11-10: iteration 1740 — rehearse dedicated export listener

- Clean main; no inherited work. Initial alerts clear and health/database/Redis pass; Nov 11 expiry/NBA acceptance remain pending.
- Prepared an uninstalled, separate Postgres Compose project: SCRAM, required owner password, loopback port 5543, dedicated bridge/volume, ten connections and provisional 128 MiB/0.1 CPU caps pending capacity acceptance.
- Disposable rehearsal resolves that definition with tmpfs/ephemeral port/no restart; Docker confirms loopback-only binding and sole network membership. Real loopback SQL passes; every VM non-loopback IPv4 connection refuses.
- Initial internal-network trial suppressed port publication; deliberately replaced with a dedicated bridge, which permits outbound traffic. No claim of live listener installation/firewall acceptance.
- Updated owner observability page/readiness review. No live schema/grants, exporter/database installation, public activation or paid calls.
- Verification: `pnpm format`, `pnpm lint:fix`, targeted listener test, `pnpm check` (827 unit; 281 integration/four expected skips), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts` (18 pages/22 unchanged diagrams/39 tables), `git diff --check` pass.
- Live account boundary 32 checks pass; scheduled reader four topics/19 stories/15 posts. Push followed by API/worker restart and health/reader/alerts checks.
- Initial push rejected by concurrent owner lead-note update `3359eb48`; merged without rewriting history. Post-restart health and reader pass, alerts zero.
- Next: freshness alerts, whole-stack capacity and provisioning/rendering/query-route gates; verify actual listener at installation. Nov 11 natural link expiry after 00:33:01 UTC and NBA scheduled acceptance.

## 2026-11-10: iteration 1741 — bounded owner-requested Sonnet NBA trial

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass.
- Followed new evening item 54 instruction before Phase 4. Added single-use production-order replay and run-ID-scoped ledger verification exception; default $0.05 and other shared caps unchanged.
- Run 1: Sonnet initial rejects supported Charlotte lineup paraphrase; Sonnet repair refused daily/model caps; Haiku initial validates. Run 2: Sonnet refused shared caps, Haiku supported paraphrase rejected; repair refused conservative local ceiling. Run 3: no paid calls.
- Three settled calls cost $0.037107; item 54 cumulative $0.044978/$0.25. Preserved exclusive claim/raw responses/report; no cache/publication writes, prompt/guard changes or public activation.
- Two-of-three Sonnet test incomplete: continue after UTC shared-cap reset before Nov 11 noon with audited fresh claim and actual-spend accounting ($0.205022 remains). Do not reuse consumed claim or treat local $0.249931 conservative reservations as spend.
- Exact rejected sentences/rules and supplied support recorded in Nov 10 review; no original invalid-JSON claim recovered.
- Verification: targeted ledger tests, `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit; 281 integration/four expected skips), `pnpm build` and `git diff --check` pass. Live account boundary 32 checks pass; reader four topics/19 stories/15 posts.
- Next: finish bounded Sonnet trials, computable supported-paraphrase fix if warranted and one confirmation; Nov 11 natural link expiry and scheduled NBA acceptance. Phase 4 waits.
- Concurrent owner lead-note update `1547371d` merged without rewriting history; push and API/worker restart followed by health/reader/alerts checks.

## 2026-11-10: iteration 1742 — prepare export freshness alert

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. Item 54 Sonnet trials await UTC shared-cap reset; no paid retry or editorial change.
- Prepared uninstalled Grafana alert for the separate aggregate store: restricted-reader SQL reports missing/future/stale captures, 15-minute freshness limit, one-minute evaluation/five-minute pending period; query errors/no-data alert. No contact point or notification delivery configured.
- Extended disposable real-login checks to run the exact provisioned SQL across missing/future/current/fresh/nearly stale/stale captures and recovery; updated affected owner page and readiness review.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 09-observability`, `git diff --check`; all pass (827 unit; 281 integration/four expected skips; handbook 18 pages/one unchanged diagram/39 tables).
- Live `check-live-account-boundary.ts`: 32 pass; `check-scheduled-reader.ts 2026-11-10T15:00:00Z`: four topics/19 stories/15 posts.
- Next: finish Sonnet trials after UTC reset; natural link expiry after Nov 11 00:33:01 UTC; scheduled NBA acceptance. Export alert still needs Grafana provisioning/runtime rehearsal, capacity and installation gates. Public mode stays off.
- Pushed verified step; API/worker restart and post-deploy health/reader/alerts checks follow.

## 2026-11-10: iteration 1743 — rehearse export alert in disposable Grafana

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. Item 54 paid Sonnet trials still await UTC shared-cap reset; no editorial change or paid call.
- Added explicit disposable runtime rehearsal using the installed Grafana binary, temporary SQLite/provisioning/plugin paths, loopback listener and separate disposable Postgres with restricted reader credentials.
- Exact prepared alert provisions and reads back correctly; Grafana SQL/threshold evaluation passes missing/future/fresh/stale captures and recovery. Synthetic data only; scheduler/SMTP disabled; temporary process/container/files removed.
- Scheduled pending/firing timing, query-error state transitions, capacity, live installation and public query-route acceptance remain open. Updated readiness/review notes; public mode stays off.
- Verification: runtime rehearsal, standalone strict script typecheck, `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit; 281 integration/four expected skips), `pnpm build`, handbook check (18 pages/22 unchanged diagrams/39 tables) and `git diff --check` pass.
- Live account boundary: 32 pass; scheduled reader: four topics/19 stories/15 posts.
- Next: Sonnet trials after UTC reset; natural link expiry after Nov 11 00:33:01 UTC; scheduled NBA acceptance. Continue remaining export runtime/capacity gates while those wait. Push followed by API/worker restart and health/reader/alerts checks.
