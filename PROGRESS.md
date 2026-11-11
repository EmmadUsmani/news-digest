# Progress

[Through iteration 1735](docs/progress-archive/2026-11-10-through-1735.md).

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

## 2026-11-10: iteration 1753 — complete scheduled export-alert rehearsal

- Recovered and finished three uncommitted files from the interrupted 1744 iteration. Initial alerts zero; health, 14 services and 36 sources pass. Recent Gamingbolt timeout alert resolved, with source success at 22:46 UTC; digest queue has zero failures.
- Disposable Grafana and isolated Postgres with synthetic credentials pass exact provisioned SQL/threshold cases. Unchanged one-minute evaluation/five-minute pending settings: missing capture and revoked reader SELECT each reach pending then firing; fresh capture and restored grant each clear the alert. SMTP disabled; no live provisioning or public flag change.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit, 281 integration/four expected skips), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 09-observability`, and `git diff --check` pass.
- Live account boundary 32 checks pass; scheduled reader four topics/19 stories/15 posts. Item 54 Sonnet trials still await UTC shared-cap reset; no paid call. Next: finish bounded Sonnet trials before Nov 11 noon, natural link expiry after 00:33 UTC, then scheduled NBA acceptance. Export alert capacity, live installation and public query-route checks remain.
- First push rejected because the lead advanced origin/main with a reliability note; fetched, merged cleanly and pushed `c8d408e6` without rewriting history. API/worker/docs/schema restarted; post-restart health, 14 services, zero alerts and published reader pass. Working tree clean.

## 2026-11-10: iteration 1754 — prepare bounded NBA Sonnet continuation

- Clean main; no inherited work. Initial API scrape alert was pending immediately after an API restart, then cleared; direct metrics and `/healthz` returned 200. Health/database/Redis, all 14 services and 36 sources pass. Digest queue has zero failed runs.
- Added one-time post-UTC-reset continuation for owner item 54. It requires the saved original trial, exact seven settled ledger calls/$0.044978, original NBA input, fresh exclusive claim, Nov 11 pre-noon window and $0.25 cumulative reservation ceiling. It saves raw responses and per-run diagnostics privately; no cache or edition writes.
- Verification: standalone strict TypeScript check, `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit pass; 281 integration pass/four expected skips), `pnpm build`, `git diff --check` pass. Live reader: four topics/19 stories/15 posts; account boundary: 32 pass.
- No provider call, guard, prompt or publication change. Original claim remains untouched. Next: run the continuation after UTC reset, decide whether supported paraphrase needs a computable guard fix, and verify the natural link expiry after 00:33 UTC.

## 2026-11-11: iteration 1755 — run post-reset NBA Sonnet continuation

- Clean main; zero active alerts, `/healthz` and database/Redis healthy, 36 sources healthy, digest queue zero failures. Previous 1754 work was committed and pushed; no leftovers.
- One-time owner-authorized continuation made four Anthropic calls. Run 2 Sonnet initial rejected a supported Charlotte/Brandon Miller paraphrase (`unsupported-absence`); Sonnet repair validated. Run 3 Sonnet was refused by the local reservation ceiling; Haiku initial fenced JSON failed, repair validated. The original run 1 validated on Haiku.
- New settled spend $0.064449; item 54 total $0.109427/$0.25 across eleven settled calls. Private claim/responses kept. No guard, prompt, cache or publication change.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit pass; 281 integration pass/four expected skips), `pnpm build`, `git diff --check` pass. Live Nov 10 scheduled reader: four topics/19 stories/15 posts; `/healthz` passes.
- Next: implement a computable supported-paraphrase guard correction, preserve the “no return timeline” failure, confirm with one bounded replay and deploy before Nov 11 noon. Natural sign-in-link expiry check is due after 00:33:01 UTC; Nov 11 scheduled NBA acceptance follows.
- First push rejected because the lead advanced origin/main; fetched and merged without rewriting history. Merged alert check passed. Lead's observability page reached 101 lines; shortened one sentence, then reran the handbook check before push.

## 2026-11-11: iteration 1756 — accept sourced NBA injury rewrites

- Clean main at start; no leftovers. Zero active alerts, health/database/Redis good, 14 services and 36 sources healthy, and zero failed digest jobs.
- NBA summaries accept the saved Brandon Miller rewrite only when one evidence sentence matches the attributed coach, player, injury and qualified expectation. The real invented “no return timeline” still fails; headlines and other fields retain their checks.
- Offline saved Sonnet initial now reaches a separate Porzingis headline rejection (the rewrite drops the draft-pick qualification). Saved Sonnet repair validates five stories/four bullets. No provider or edition writes; item 54 remains $0.109427/$0.25.
- Verification: editor tests 26/26; `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit, 281 integration, four expected skips), `pnpm build` and `git diff --check` pass. `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics/19 stories/15 posts.
- Fast-forwarded two upstream lead-doc commits; push and restart API/worker, then recheck health, reader, services, sources and queue.
- Next: natural sign-in-link expiry after 00:33:01 UTC and Nov 11 scheduled NBA acceptance after the 15:00 UTC generation run.

## 2026-11-11: iteration 1757 — verify natural sign-in link expiry

- Clean main at start; no leftovers. `pnpm obs alerts`, service/source checks and `/healthz` pass: no active alerts, 14 healthy services, 36 healthy sources, database/Redis up, and zero failed digest-generation jobs.
- After the stored deadline, `pnpm exec tsx scripts/check-live-link-expiry.ts --live verify` passed against the deployed API. The naturally expired disposable link returned HTTP 401 with no cookie or reader identity and remained unconsumed. The private receipt was retained; no expiry settings changed.
- Updated the Phase 4 entry checklist and accepted Phase 3 notes. `check-live-account-boundary.ts` passed all 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics, 19 stories and 15 posts. No model calls or public activation.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit, 281 integration, four expected skips), `pnpm build`, changed-document Prettier and `git diff --check` passed.
- Next: continue Phase 4 with Grafana export listener and capacity gates; review scheduled NBA editing after the Nov 11 15:00 UTC run.

## 2026-11-11: iteration 1758 — measure the Grafana export listener footprint

- Clean main; no inherited work. Alerts clear; API and Grafana health pass, 14 healthy services, 36 healthy sources, zero failed digest jobs.
- Ran the exact prepared Compose file at 127.0.0.1:5543 in a disposable project. SCRAM login passed, wrong password returned 28P01, four non-loopback IPv4 probes failed to connect, and restricted roles wrote/read 30 synthetic daily rollups.
- `sample-observability-capacity.ts 12 5`, 120-second paired cgroup sample and 24-hour VictoriaMetrics history: 763.57 MiB/2.64% CPU together in the quiet trial; prior stack peak 771.25 MiB plus export lifetime peak 72.57 MiB projects 843.82 MiB against ~800 MiB. No OOM kills; volume used 47 MiB.
- Compose container, volume and bridge removed; port free. No production listener, datasource, model call, data write or public activation.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, changed-document Prettier and `git diff --check` pass. Live account boundary passes all 32 checks; the Nov 10 reader serves four topics, 19 stories and 15 posts.
- Next: verify loaded and cold-start memory headroom before installation, and review scheduled NBA editing after the Nov 11 15:00 UTC generation run.

## 2026-11-11: iteration 1759 — measure export startup alongside dashboard-style reads

- Clean main; no inherited work. Initial `pnpm obs alerts`, services/sources checks, digest queue and health probes: zero active alerts, 14 healthy services, 36 healthy sources, zero failed digest jobs.
- Compared two 75-second, 250 ms cgroup samples: eight observability units alone, then plus the prepared Compose database starting from an empty volume. Five read batches per window passed (Grafana health, live reader and uncached VictoriaMetrics ranges); candidate also passed 12 restricted-reader SQL checks against synthetic rollups.
- Baseline 704.59 MiB/2.19% mean CPU; candidate 772.36 MiB at startup and 769.04 MiB during reads, 4.85% mean CPU and zero OOM kills. Removed disposable container, volume and bridge; port 5543 free. No provider calls, public activation or production data changes.
- `check-live-account-boundary.ts` passed 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics, 19 stories and 15 posts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit and 281 integration passes; four expected skips), `pnpm build`, changed-document Prettier and `git diff --check` pass. Push and restart API/worker, then recheck health, reader, sources and digest queue.
- Next: keep export installation gated on sustained CPU and paired memory during scheduled load or natural compaction. Review NBA editing after the Nov 11 15:00 UTC run.

## 2026-11-11: iteration 1760 — prepare a public queue status projection

- Clean main; no inherited work. `pnpm obs alerts`, health/services/sources and jobs checks: zero active alerts, 14 healthy services, 36 healthy sources, zero failed digest jobs.
- Prepared an unmounted GET/HEAD queue status handler for four fixed queues, five counts and one scheduler timestamp per queue. No raw Bull Board route fallback, private records, logs, Redis details, or upstream errors in the response.
- Targeted HTTP test passed with synthetic queue results, including private-data exclusion, legacy route refusals, 405 for mutation, HEAD, and generic 503. Private jobs browser unchanged; no provider calls or activation.
- `check-live-account-boundary.ts` passed 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics, 19 stories and 15 posts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (828 unit and 281 integration passes, four expected skips), `pnpm build`, changed-document Prettier and `git diff --check` passed. Push and restart API/worker, then verify live health, reader and private queues.
- Next: rehearse exclusive public queue routing and request admission. Grafana installation still needs scheduled-load or natural-compaction capacity evidence; review NBA after Nov 11 15:00 UTC.

## 2026-11-11: iteration 1761 — route public queue status through API admission

- Clean main; no inherited work. `pnpm obs alerts` clear; `/healthz` passed, `pnpm obs services/sources/jobs` showed 14 healthy services, 36 healthy sources and zero failed digest jobs.
- Public mode selects only `GET/HEAD /api/queues` behind API admission; private mode retains the read-only Bull Board. No live flag, sharing, generation or provider changes.
- Compiled Nest and disposable Redis rehearsal: anonymous GET/HEAD expose only queue counts and next runs; legacy routes denied for anonymous and signed-in admins. Queue and account requests share the reader quota, with 429 for missing identity or exhaustion.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (828 unit and 281 integration passes, four expected skips), `pnpm build`, handbook check for `09-observability` and `git diff --check` passed. Push and restart only the API; verify private jobs, account boundary and scheduled reader.
- Next: rehearse remaining public tool surfaces. Grafana installation still needs capacity evidence under scheduled load or natural compaction; review NBA editing after the Nov 11 15:00 UTC edition.
