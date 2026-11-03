# Progress

Earlier entries: [progress archive](docs/progress-archive/).

## 2026-11-03: iteration 411 — prevent test data volume leaks

- Started clean on main; no leftover work. Push access restored; fetched and merged owner commit `e52c008` without rewriting history. STEERING 25 makes the disk leak urgent and O9 alerts next.
- Testcontainers Postgres and Redis now mount their image-declared data directories as tmpfs. No production database, service, schedule, content or budget changes.
- Interrupted a real runner with SIGKILL after both containers started; inspected no volume mounts, cleaned up only that run's containers, and confirmed zero dangling volumes. Full-run Docker inspection confirmed both tmpfs paths.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (260 unit/172 integration), `pnpm build`, handbook 08 and `git diff --check` passed. Dangling volumes remained zero after the full check; no pruning needed. Disk 42% used.
- Live health/dependencies and queue readiness passed; real free social collection continues (latest observed 10 verified posts). Scheduled digest/social queues have no failures; two historical ingestion failures remain.
- Updated test documentation, handbook and TASKS; no diagrams/UI changed. No restart needed under item 22: only test runner/docs changed. No paid calls or Reddit requests.
- Next: O9 alerts (including disk and iteration-start `pnpm obs alerts`), then O7/O8/O10. Scheduled Nov 3 cost/yield/AI timing and acks take priority when available.

## 2026-11-03: iteration 412 — local host and service alerts

- Started clean on main; no leftover work. Health, four queues and 32 sources healthy; two historical ingestion failures remain. Scheduled evidence still awaits 15:00 UTC; production content/cost behavior unchanged.
- Installed loopback-only vmalert with 48 MiB/1% ceilings and no notification receiver. Five rules cover >80% disk use, inactive units, failed scrapes, stale/missing unit snapshots and host memory pressure; unit inventory now includes the evaluator (13 total).
- Added bounded `pnpm obs alerts` pending/firing output with response validation and an iteration-start AGENTS instruction. Updated handbook, plan and TASKS; O9 remains open for job/error-rate/missed-edition/spend/per-service-budget rules.
- A temporary synthetic rule fired through the deployed evaluator and CLI, then was removed in cleanup; five production rules healthy, zero active alerts. Offline disk tests verify threshold, sustained duration and recovery. Evaluator sampled ~4 MiB; disk 43% used.
- Verification: `pnpm format`, `pnpm lint:fix`, another format pass after import sorting, `pnpm check` (261 unit/172 integration), `pnpm build`, `check-observability.ts --verify-alerts`/`--verify-cli`, handbook 09 and `git diff --check` passed. First check stopped at formatting; corrected before rerunning.
- API/worker/docs/schema remain active; health and all sources green. Latest real free collection verified 10 posts; digest/social failures zero; dangling Docker volumes zero. Only alert service installed/reloaded and unit collector refreshed; no app/DB/Redis restart, UI changes, paid calls or Reddit requests.
- Next: scheduled Nov 3 cost/yield/AI timing and acks when available; otherwise finish remaining O9 alert rules before O7/O8/O10.

## 2026-11-03: iteration 413 — job and API error alerts

- Started clean on main; no leftover work. Health, 32 sources and four queues healthy; two historical ingestion failures remain. Scheduled evidence still awaits 15:00 UTC.
- Added local recent-worker-failure and sustained API 5xx rules: ten-minute failed-attempt increase/one-minute hold; >5% 5xx with >=20 requests in five minutes/two-minute hold. No notifications or production-content/cost changes.
- Offline vmalert cases cover sustained thresholds, recovery/expiry, low traffic, exact 5% boundary, historical counters and resets. Used increase_prometheus after tests exposed default MetricsQL first-sample counting; retained historical failures must not fire.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (261 unit/172 integration), `pnpm build`, vmalert dry-run/unittest, `check-observability.ts --verify-alerts`, handbook 09 and `git diff --check` passed. Zero dangling Docker volumes.
- Deployed rule config and restarted only obs-alerts; seven rules healthy, zero pending/firing. Live /healthz green; latest real free collection verified ten posts. No app/DB/Redis restart, paid calls, Reddit requests or UI changes.
- Updated handbook, plan and TASKS. Next: scheduled Nov 3 cost/yield/AI timing and acks first; otherwise missed-edition/spend/per-service-budget alerts before O7/O8/O10.

## 2026-11-03: iteration 414 — observability memory budget warnings

- Started clean on main; no leftover work. Health, 32 sources and scheduled queues healthy; latest free collection verified ten real X posts. Scheduled AI/X evidence still awaits 15:00 UTC.
- Added a five-minute warning above 90% of each observability unit's actual MemoryMax; collector exports finite ceilings. Offline cases cover threshold, duration, recovery, app exclusion and zero/missing limits. Eight ceilings verified live.
- Rule exposed VictoriaMetrics near its 112 MiB ceiling. Reduced cache allowance 32→16 MiB and Go target 80→64 MiB; reset expendable saved caches (moved to /tmp), preserving stored metric history. Only collector, evaluator and metrics service changed/restarted; app/Postgres/Redis untouched.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (261 unit/172 integration), `pnpm build`, vmalert dry-run/unittest and handbook 09 passed. Runtime metrics/rule checks initially raced slow startup; reruns passed.
- `check-observability.ts --verify-o4` confirms eight targets and retained metrics; metrics-store memory settled around 50 MiB after cache reset. Eight deployed alert rules healthy, zero pending/firing after natural recovery. Health/services/targets green; zero dangling Docker volumes.
- Updated handbook, observability plan and TASKS; archived iterations 402–404 to keep PROGRESS under 25 KB. No UI, paid calls or Reddit requests.
- Next: scheduled Nov 3 cost/yield/AI timing and acks first; otherwise remaining O9 missed-edition/spend rules, then O7/O8/O10.

## 2026-11-03: iteration 415 — overdue recorded schedule alert

- Started clean on main; no leftover work. Health, 32 sources and four queues healthy; two historical ingestion failures unchanged. Scheduled evidence still awaits 15:00 UTC.
- Added read-only Postgres-exporter schedule lifecycle aggregate and warning after latest due unresolved/failed record exceeds 15 minutes plus two-minute hold. Newer success clears old failures; future records cannot hide overdue work. Success includes fallback; missing records/publication integrity remain outside coverage.
- Column-only schedule grants, existing read-only role/timeouts and resource ceilings retained. Restarted only obs-postgres and obs-alerts; no app/Postgres/Redis restart, provider calls, Reddit requests or production edition changes.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (261 unit/173 integration), `pnpm build`, vmalert dry-run/unittest, `check-observability.ts --verify-alerts`/`--verify-o4`, handbook 09 and `git diff --check` passed. SQL fixture cases run against isolated Testcontainers; zero dangling Docker volumes.
- Nine deployed rules healthy, zero pending/firing; live schedule metric zero and exporter scrape error zero. Eight scrape targets healthy; latest free collection verified ten real posts without errors. Updated handbook, plan and TASKS.
- Next: scheduled Nov 3 cost/yield/AI timing and acks first; otherwise O9 spend and missing-schedule detection before O7/O8/O10.

## 2026-11-03: iteration 416 — provider cap warnings

- Started clean on main; no leftover work. Health, 32 sources and four queues healthy; two historical ingestion failures unchanged. Scheduled evidence still awaits 15:00 UTC.
- Added read-only UTC daily/monthly ledger spend plus all outstanding pending/uncertain holds, including older holds, for Anthropic/xAI. Column-only monetary/status/time grants; no prompts, keys or provider calls. Empty ledgers export zero.
- Added >=90% configured-cap warning with two-minute hold; joins existing ceiling metrics by provider/period. Zero/missing caps do not infer allowance; this does not measure prepaid credit or scheduled reserve availability.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (261 unit/174 integration), `pnpm build`, vmalert dry-run/unittest, handbook 09, `check-observability.ts --verify-alerts`/`--verify-o4` and `git diff --check` passed. Isolated SQL fixtures cover UTC boundaries, empty ledgers, older holds and failed-call release; zero dangling Docker volumes.
- Restarted only obs-postgres and obs-alerts. Ten rules healthy, zero active alerts; four provider/period gauges and scrape-error zero verified live. Eight scrape targets healthy; latest real free collection completed. No app/Postgres/Redis restart, paid calls, Reddit requests or UI changes.
- Updated handbook, observability plan and TASKS. Next: Nov 3 scheduled AI timing/cost/X yield and acks first; otherwise missing-schedule detection, then O7/O8/O10.

## 2026-11-03: iteration 417 — lost digest scheduler warning

- Started clean on main; no leftover work. Health, 32 sources and scheduled queues healthy; two historical ingestion failures unchanged. Nov 3 AI/X evidence awaits 15:00 UTC.
- Added two-minute warning when the daily digest queue has zero recurring schedulers or is paused. Uses existing API queue gauges; no new collector. Missing lifecycle after a registered scheduler advances remains open.
- Offline evaluator cases verify threshold/hold/recovery, healthy/missing samples and queue/scrape-job isolation. Runtime check now requires digest scheduler/pause samples from the actual API exporter.
- Deployed config and restarted only obs-alerts before 14:30 UTC; eleven healthy rules, zero active alerts. Eight scrape targets healthy; latest free collection verified ten real X posts without errors. No app/DB/Redis restart, paid calls, Reddit requests or UI changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (261 unit/174 integration), `pnpm build`, vmalert dry-run/unittest, handbook 09, observability --verify-alerts/--verify-o4 and health checks passed. Initial check stopped on archive formatting; fixed and full rerun green. Zero dangling Docker volumes.
- Updated handbook, plan and TASKS; archived iterations 405–407 to keep PROGRESS below 25 KB.
- Next: Nov 3 scheduled AI timing/cost/X yield and acks first; otherwise missing lifecycle/publication detection, then O7/O8/O10.

## 2026-11-03: iteration 418 — stalled registered scheduler warning

- Started clean on main; no leftover work. Health, 32 sources and four queues healthy; two historical ingestion failures unchanged. Nov 3 scheduled AI/X evidence still awaits 15:00 UTC.
- Added warning when the digest scheduler's next run remains >15 minutes overdue for two minutes. Uses existing API timestamp; excludes other queues/exporters and zero/absent values. Schedule advancement clears it; missing lifecycle after advancement remains open.
- Offline evaluator verifies strict threshold, hold, recovery and future/zero/absent samples. Corrected test timestamps to vmalert's documented 2000-01-01 epoch before passing.
- Deployed and restarted only obs-alerts at 14:23 UTC. Twelve healthy rules, no active alerts; eight scrape targets healthy. Latest free collection verified ten real X posts, no errors; no provider calls or Reddit requests initiated.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, vmalert dry-run/unittest, handbook 09, observability `--verify-alerts`/`--verify-o4`, health/status and `git diff --check` passed (261 unit/174 integration); zero dangling Docker volumes.
- Updated handbook, observability plan and TASKS. No edition behavior, UI or app/DB/Redis restart.
- Next: scheduled Nov 3 AI timing/cost/X yield and acks first; otherwise missing lifecycle/publication detection, then O7/O8/O10.

## 2026-11-03: iteration 419 — incomplete schedule metrics warning

- Started clean on main; no leftover work. Health, 32 sources and four queues healthy; two historical ingestion failures unchanged. Scheduled evidence still awaits 15:00 UTC.
- Added two-minute warning when a successful API scrape lacks any digest scheduler count, pause or next-run gauge. This closes a silent partial-exporter failure; missing lifecycle/publication after advancement remains open.
- Offline evaluator covers each missing gauge, healthy/down scrapes, hold, recovery and unrelated queue/exporter isolation. Runtime verification requires the thirteenth rule.
- Deployed and restarted only obs-alerts at 14:29:08 UTC, before freeze. Thirteen healthy rules, zero active alerts; eight scrape targets healthy. No app/DB/Redis restart, paid calls, Reddit requests, UI or edition changes.
- Latest free social collection verified ten real X posts without errors. Updated handbook, plan and TASKS.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, vmalert dry-run/unittest, handbook 09, observability `--verify-alerts`/`--verify-o4`, health/jobs/sources and `git diff --check`; zero dangling Docker volumes.
- Next: Nov 3 scheduled AI timing/cost/X yield and acks first; otherwise missing lifecycle/publication detection, then O7/O8/O10.

## 2026-11-03: iteration 425 — first scheduled AI/X evidence

- Started clean on main; no leftover work. Health, 32 sources, services and queues healthy; zero alerts; two historical ingestion failures unchanged.
- Observed Nov 3 scheduled edition `777fdd95-0bcd-4ca7-9ea6-36c654effcca`: 15:00:00.057 start, 15:03:51.886 finish, 231.829 s worker duration, 748 article candidates. Item 7 speed target missed; remains open.
- Anthropic: $0.339524/43 settled calls, zero holds. Entire $0.482788 day protected while running; reserve released after publication. Partial item 13 ack: mixed outcome, NBA story fallback despite complete triage; other three story sections AI. Full-AI acceptance remains open.
- First full scheduled X run/item 15 acknowledged: World $0.036680/5 new verified, Gaming $0.036815/5, NBA $0.037582/5, Tech/AI $0.025979/3; total $0.137056/18 fetched and incremental verified, zero holds/outside-list additions. Continue first-week reporting.
- Published X picks: Tech/AI 4, NBA 4, Gaming 3, World 0. World saved triage has one low-context candidate (relevance 3); discovery yield does not establish in-window selection coverage.
- Read-only Playwright checked four topics/11 real X cards and no page errors on desktop/mobile; inspected screenshots in docs/screenshots/scheduled-nov3-*.png. No embed/media-success claim.
- Verification: read-only report-edition-timing.ts --scheduled-only --limit 1 and report-x-discovery.ts 2026-11-03; pnpm obs alerts/health --check/sources/jobs; pnpm format, pnpm lint:fix, pnpm check and pnpm build; git diff --check. All passed; zero dangling Docker volumes.
- Updated TASKS, SOURCES and steering evidence; archived iterations 408–409 to keep this file small. No production code/config changes, restarts, extra paid calls or Reddit requests.
- Next: fix item 7 latency and NBA editor fallback using saved responses/fixtures; investigate World candidate eligibility. Keep open X/Bluesky/grouping disabled while those results are resolved; do not claim items 13/7 complete.

## 2026-11-03: iteration 426 — preserve editorial rejection evidence

- Started clean on main; no leftover work. Health, 32 sources and queues healthy; no alerts; two historical ingestion failures unchanged.
- Read-only Nov 3 journal analysis: all 43 calls admitted, no budget refusals. Article triage: 17 calls, 133,175 output tokens, 517,143 ms aggregate; all inference: 811,368 ms. Four slots imply ~203 s at observed call times, before other work; reducing output/provider work is necessary for item 7.
- Rejected responses were not cached and validation categories were memory-only, so the NBA rejection cause cannot be reconstructed from saved responses. Added structured llm.validation events with fixed category, initial/repair/cache phase, run/model and original request fingerprint; external call fingerprints link initial rejections to purpose/timing. No prompts, rejected text, schema details or error messages logged.
- Fake tests cover parse/schema/selection/absence/validator categories, successful repair/cache silence, invalid-cache logging, fingerprint correlation and content exclusion. Corrected a test expectation to hash its customized private fixture request; targeted 21/21 passed.
- Updated handbook/TASKS; archived iteration 410 to keep this file small. No UI/edition behavior changes, paid calls or Reddit requests. NBA fallback, World eligibility and items 13/7 remain open.
- Verification: pnpm format, pnpm lint:fix, pnpm check (261 unit/174 isolated integration), pnpm build, targeted llm.test.ts (21), check-handbook.ts 09-observability and git diff --check passed; real edition GET still returns 19 stories/11 X posts. Zero dangling Docker volumes.
- Next: reduce triage output/provider work using saved scores/fakes, then resolve NBA rejection and World eligibility; no paid trial. Items 13/7 stay open.
- Deployment: pushed 3c98bf1; systemctl --user restart news-digest-api.service news-digest-worker.service. Initial pnpm obs health --check raced startup; repeat passed at 15:15:44 UTC (DB/Redis healthy), both services active; edition GET preserved 19 stories/11 posts, zero alerts.

## 2026-11-03: iteration 427 — compact triage output

- Started clean on main; no leftover work. Health, 32 sources and four queues healthy; zero alerts; two historical ingestion failures unchanged.
- Article/social triage now requests compact JSON, event labels ≤80 characters and factual rationale phrases ≤100 (previously 160/300). A 50-UUID-item output reservation drops from 15,000 to 9,964 tokens (33.6%); long escaped IDs retain headroom up to 16,000. This is a ceiling reduction, not measured savings or latency.
- Scoring instructions, full-ID coverage checks and per-item cache keys remain unchanged; historical score schema stays compatible. Fake coverage verifies compact batches, cache reuse, ordering/concurrency, escaped IDs, repair and refusal (11 targeted tests).
- First full check exposed the expected synthetic raw-replay fingerprint mismatch. Re-fingerprinted only its Haiku request offline for the changed prompt; authored response bodies and golden edition unchanged. No provider responses re-recorded or paid calls.
- Updated ranking/owner pipeline docs. Archived completed TASKS markers and replaced the long archive-link index in PROGRESS with its directory link; open priorities remain.
- Verification: pnpm format, pnpm lint:fix, final pnpm check (263 unit/174 isolated integration), pnpm build, targeted triage.test.ts, check-handbook.ts 04-edition-pipeline and git diff --check passed. Zero dangling Docker volumes.
- Restarted API/worker; pnpm obs health --check and alerts passed at 15:24:58 UTC. Existing edition GET retains 19 stories/11 real X posts. No UI changes, Reddit requests or new editions.
- Next: inspect next scheduled triage output/cost/duration and truncation/validation rates; resolve NBA editor fallback and World eligibility offline. Items 13/7 remain open; no speed-target claim or paid trial.

## 2026-11-03: iteration 428 — align scheduled X search with edition coverage

- Started clean on main; no leftover work. Health, 32 sources and all queues healthy; zero alerts; two historical ingestion failures unchanged.
- Read-only World investigation: all five scheduled discoveries were published Nov 2 03:00–13:10 UTC, before the edition's Nov 2 15:00 start. The lone eligible candidate from other discovery says “Some of this morning's arrests”; saved relevance 3/importance 2 appropriately rejected it.
- Fixed scheduled date-only search bounds to include the partial current UTC day. Exact UTC publication interval is supplied in the prompt, from configured edition start through search time, capped at the latest 24 hours. Timestamp/safety/relevance gates still decide publication; spending caps, one-search/five-result limits and disabled features unchanged.
- Fake regression coverage checks current-day bounds, midnight, configured six-hour windows, recent-day cap and invalid intervals. Initial full check caught optional follow-up request type narrowing; explicit port return type fixed it. No paid calls, Reddit requests, new editions or UI changes.
- Updated SOURCES, TASKS and owner schedule handbook. Verification: targeted scheduled tests 17/17, pnpm format, pnpm lint:fix, final pnpm check (267 unit/174 isolated integration), pnpm build, check-handbook.ts 03-jobs-and-schedules and git diff --check passed. Zero dangling Docker volumes.
- Restarted API/worker; health passed at 15:32:40 UTC, zero alerts. Existing edition GET retains 19 stories/11 real X posts; no improved World-yield claim before the next scheduled search.
- Next: observe corrected scheduled World yield and compact triage output/latency; NBA fallback rejection needs the new validation diagnostics. Items 13/7 remain open; open X/Bluesky/grouping remain disabled.

## 2026-11-03: iteration 429 — distinguish provider truncation from validation rejection

- Started clean on main; no leftover work. Zero alerts and healthy DB/Redis/API; existing edition retains 19 stories/11 real X posts.
- NBA's historical rejected response cannot be reconstructed. Added allowlisted completion reason and requested output ceiling to successful Anthropic HTTP logs, correlated by request fingerprint. Future output-limit/refusal responses can be separated from normal completion and subsequent parse/schema/semantic rejection.
- Unknown/null reasons become `unknown`; no response text, stop sequence or arbitrary provider reason is logged. HTTP success still does not imply usable editorial output. No selection, cache, budget, retry or provider changes; no paid calls or Reddit requests.
- Fake-provider regression covers normal completion, output limit, refusal, null/unrecognized reasons, fingerprint/usage correlation and private-content exclusion (22 targeted tests passed). Updated TASKS and owner observability handbook.
- Verification: pnpm format, pnpm lint:fix, pnpm check (268 unit/174 isolated integration), pnpm build, check-handbook.ts 09-observability and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker with rebuilt code; pnpm obs health --check passed at 15:37:37 UTC, zero alerts; edition GET still returns 19 stories/11 posts. No UI change.
- Next: measure compact triage latency/output and corrected World search yield on the next scheduled run; inspect NBA completion/validation diagnostics if it falls back again. Items 13/7 stay open; no latency or full-AI acceptance claim.
