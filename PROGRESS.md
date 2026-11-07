# Progress

Earlier entries: [iterations 1062–1069](docs/progress-archive/2026-11-07-iterations-1062-1069.md).

Earlier entries: [iterations 1070–1074](docs/progress-archive/2026-11-07-iterations-1070-1074.md).

Earlier entries: [iterations 1075–1084](docs/progress-archive/2026-11-07-iterations-1075-1084.md).

Earlier entries: [iterations 1089–1101](docs/progress-archive/2026-11-07-iterations-1089-1101.md).

Earlier entries: [iterations 1191–1199](docs/progress-archive/2026-11-07-iterations-1191-1199.md).

Earlier entries: [iterations 1200–1207](docs/progress-archive/2026-11-07-iterations-1200-1207.md).

Earlier entries: [iterations 1208–1214](docs/progress-archive/2026-11-07-iterations-1208-1214.md).

Earlier entries: [iterations 1215–1222](docs/progress-archive/2026-11-07-iterations-1215-1222.md).

## 2026-11-07: iteration 1223 — two-hour metrics recovery observation

- Highest-priority breakage: verify unchanged CPU trial before queued reader/editor deployment. Clean main/no leftovers; no runtime or production-data changes.
- Trial remains active since 16:00:24 UTC, zero restarts. Three-minute cgroup sample: 1.335% whole-stack CPU/715.40 MiB peak; metrics 0.450% CPU, 269/684 periods throttled; every sampled unit zero memory-high/OOM events.
- Services 14/14, sources 36/36, jobs checks, app/Grafana health pass; alerts clear. All 23 rules healthy at both endpoint checks; backup staleness evaluated successfully at 18:20:48 UTC (0.099 s).
- Uncached self-scrape/API selectors one series each (0.235/0.002 s); admission/timeouts/slow-query counters zero. Small merged rows 4,362,390 cumulative, indexdb 20,222, large zero; comparable single five-million-row compaction unobserved. Recovery stays open.
- Updated TASKS and capacity evidence. Verification: pnpm check passes (558 unit/229 integration, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass.
- Deployment/restart deferred to preserve the existing recovery gate. Next: comparable natural compaction, queued deployment, Nov 8 scheduled acceptance/first-week report. No paid calls.

## 2026-11-07: iteration 1224 — correlate compaction recovery evidence

- Highest-priority breakage: added bounded, read-only `scripts/sample-metrics-recovery.ts` to correlate small/big merge deltas, process identity, uncached queries, query-failure totals and fresh rule evaluations. No settings changes, forced compaction or provider calls.
- Large interval totals are candidates requiring journal confirmation, never automatic recovery; offline tests reject cumulative-total confusion, resets, invalid counters and changed processes. Invalid CLI arguments rejected before sampling.
- Live `pnpm exec tsx scripts/sample-metrics-recovery.ts 2 30` at 18:25:09–18:26:09 UTC: 171,517/3,476 small rows in one merge each, big zero, all 23 rules healthy/fresh, six queries healthy/max 0.167 s; admission/timeouts/slow queries zero.
- `pnpm exec tsx scripts/sample-observability-capacity.ts 6 10`: 60.038 s, 1.592% CPU/717.79 MiB peak; metrics 0.619% CPU/145 of 265 periods throttled; all units zero memory-high/OOM events. CPU trial unchanged since 16:00:24, zero restarts; no comparable large compaction.
- Clean main/no leftovers initially; services 14/14, sources 36/36, jobs and /healthz pass, alerts clear. Updated TASKS and capacity evidence; item 33 closed and items 39/34 await Nov 8 production evidence.
- Verification: pnpm check passes (560 unit/229 integration, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass. Grafana health HTTP 200/database OK.
- Deployment/restart remains deferred to preserve the recovery gate. Next: use correlated probe alongside cgroup sampling through natural comparable compaction, then queued deployment and Nov 8 acceptance/first-week report.

## 2026-11-07: iteration 1225 — paired recovery observation

- Clean main/no leftovers. Highest-priority metrics recovery gate remains open; no runtime changes, forced compaction, production writes or paid calls.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 6 30` at 18:31:04–18:34:06 UTC: seven small merges/46,332 rows, no big merges; all 23 rules healthy/fresh, fourteen uncached queries passed/max 0.581 s; admission/timeouts/slow queries zero.
- Paired `pnpm exec tsx scripts/sample-observability-capacity.ts 18 10`: 180.177 s, 1.297% whole-stack CPU/723.57 MiB sampled peak; metrics 0.421% CPU, 232/653 periods throttled; every unit zero memory-high/OOM events. Trial unchanged since 16:00:24, zero restarts.
- `pnpm obs services --check`, `sources --check`, `jobs --check`, `alerts`: 14/14 services, 36/36 sources, jobs healthy, no active alerts. App health/database/Redis and Grafana HTTP/database OK; initial Grafana probe used wrong port, corrected to configured 3001.
- Updated TASKS and capacity evidence. Verification: pnpm check (560 unit/229 integration, four expected skips), pnpm build, pnpm format, pnpm lint:fix and git diff --check pass.
- Deployment/restarts remain deferred: comparable natural five-million-row compaction unobserved. Next: capture recovery evidence, deploy queued changes, then Nov 8 scheduled acceptance/first-week report.

## 2026-11-07: iteration 1226 — identify Nov 7 publication critical path

- Owner-visible reason: reduce the wait for editions by targeting the actual slow topic; Nov 7 changed from Tech to NBA. Clean main/no leftovers; recovery waiting on natural evidence, so followed STEERING 38 to available speed work.
- Exported 71 allowlisted real worker events/51 Anthropic HTTP calls into an offline timeline fixture; no prompts, outputs, credentials, new provider calls or production writes. Excluded concurrent ingestion events.
- NBA: 42.508 s triage, 90.426 s story stage, 47.583 s posts. Last-topic tail 42.522 s includes X triage/absence repair and Bluesky triage/editing; 41.986 s HTTP, 0.536 s other work. Four-call occupancy 71.84%; conserved 582,862 ms HTTP work and 180,540 ms edition span.
- Recorded findings in Nov 7 latency review; updated TASKS, Nov 7 review and Nov 8 acceptance comparison. Keep concurrency/admission unchanged; queued story-repair fixes need deployed production evidence.
- Recovery probe `sample-metrics-recovery.ts 6 30` (18:36:47–18:39:50): four small merges/25,021 rows, big zero, 23 healthy/fresh rules, 14 healthy queries/max 0.561 s. First post-restart admission-limit hit (one); no queue timeout/slow query. Recovery remains open, no comparable compaction.
- `sample-observability-capacity.ts 6 10`: 60.052 s, 1.838% CPU/721.63 MiB peak; metrics 0.612% CPU, 128/278 periods throttled; all units zero memory-high/OOM events. Trial unchanged since 16:00:24, zero restarts. Services 14/14, sources 36/36, jobs and app/Grafana health pass.
- Verification: pnpm check passed typecheck/lint then stopped on new PROGRESS formatting; corrected with pnpm format. pnpm format:check, pnpm boundaries and pnpm test pass (560 unit/229 integration, four expected skips); pnpm build, pnpm lint:fix, offline timeline conservation/allowlist/link checks and git diff --check pass. No runtime code changes; restarts/deployment remain deferred behind metrics recovery.
- Next: natural comparable compaction evidence, queued deployment, then Nov 8 scheduled quality/cost/speed acceptance and first-week report.

## 2026-11-07: iteration 1227 — ten-minute paired metrics observation

- Owner impact: establish whether the metrics CPU trial protects alerts before queued reader/editor changes deploy. Clean main/no leftovers; highest-priority recovery remains open.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 20 30`, 18:45:27–18:55:36 UTC: fourteen small merges/130,682 rows, no big merges, 23 healthy/fresh rules, 42 successful uncached queries/max 1.076 s. Admission-limit hits 1→2 at 18:54:34; zero queue timeouts/slow queries. No comparable natural five-million-row compaction.
- Paired `pnpm exec tsx scripts/sample-observability-capacity.ts 60 10`: 600.547 s, 1.680% whole-stack CPU/672.95 MiB sampled peak; metrics 0.573% CPU, 1,220/2,670 periods throttled. Every unit zero memory-high/OOM events; CI/build overlapped. Trial unchanged since 16:00:24, zero restarts.
- `pnpm obs services --check`, `sources --check`, `jobs --check`, `alerts`: services 14/14, sources 36/36, jobs healthy, no active alerts. App database/Redis and Grafana HTTP/database healthy. Updated TASKS and capacity evidence; no production writes or paid calls.
- Verification: pnpm check (560 unit/229 integration passing, four expected skips), pnpm build, pnpm format, pnpm lint:fix, pnpm format:check and git diff --check pass.
- Deployment/restarts remain deferred behind recovery gate. Next: capture comparable natural compaction, deploy queued fixes, then Nov 8 scheduled keyword/Bluesky quality/cost/speed acceptance and first-week report.

## 2026-11-07: iteration 1228 — preserve Bluesky absence-repair feedback

- Owner impact (STEERING 42/43, following waiting 39/34/33): help Bluesky repairs address unsupported claims instead of wasting attempts on ID guidance; Nov 7 Tech dropped two claims before selecting none. Clean main/no leftovers.
- Entirely rejected Bluesky replies now preserve the first fixed absence-support error and field hint. Partial valid picks and deliberate empty replies keep existing behavior; rejected text never enters feedback. No model, provider, budget, concurrency or retry-count change.
- Fake-provider tests cover significance/rationale repair, feedback privacy, sanitized cache reuse and four-call exhaustion/drop counts; existing partial/empty/selection tests pass. No recovered production output or paid calls; next deployed scheduled edition must establish reader benefit.
- Updated TASKS, STEERING ack and Nov 7 review. Deployment/restarts remain deferred behind metrics recovery; historical editions unchanged.
- `sample-metrics-recovery.ts 6 30` at 18:58:35–19:01:37 UTC: six small merges/58,271 rows, no big merges; 23 healthy/fresh rules, 14 queries pass/max 0.403 s; admission hits unchanged at two, zero timeouts/slow queries. Comparable natural compaction remains unobserved.
- `sample-observability-capacity.ts 6 10`: 60.053 s, 1.351% whole-stack CPU/674.29 MiB peak; metrics 0.395% CPU, 72/223 periods throttled, all units zero memory-high/OOM events. Trial unchanged since 16:00:24 UTC, zero restarts.
- `pnpm obs services --check`, `sources --check`, `jobs --check`, `alerts`, app/Grafana health: 14/14 services, 36/36 sources and jobs healthy; no active alerts, database/Redis/Grafana database OK.
- Verification: `pnpm check` passes (562 unit/229 integration, four expected skips); `pnpm build`, `pnpm format`, `pnpm lint:fix`, targeted social-editor tests and `git diff --check` pass. No UI change or service restart.
- Next: comparable natural compaction evidence, queued deployment, then Nov 8 scheduled keyword/Bluesky quality/cost/speed acceptance and first-week report.

## 2026-11-07: iteration 1229 — check gaps in metrics recovery history

- Owner impact (Current order 1): check whether an unobserved large compaction already permits queued reader/editor deployment. Clean main/no leftovers; recovery remains unfinished, not a re-check of closed work.
- Queried stored metrics across 16:01:00–19:05:30 UTC at 30-second steps (370 points). Small-storage total 5,415,018 rows/353 merges; largest interval 908,421 rows. Big-storage zero; no five-million-row candidate between earlier probes. Updated TASKS and capacity evidence.
- Stored process start unchanged, sampled self-scrape up always one; admission hits two, timeouts/slow queries zero. Rule-error metrics have no stored series under queried names, so no historical rule-error conclusion. No production writes, paid calls or forced compaction.
- Current recovery probe `pnpm exec tsx scripts/sample-metrics-recovery.ts 2 30`: 23 healthy/fresh rules, six successful queries/max 0.4724 s; admission hits unchanged/two, no timeout/slow query or big merge.
- Paired `pnpm exec tsx scripts/sample-observability-capacity.ts 6 10`: 60.051 s, 1.243% whole-stack CPU/674.29 MiB peak; metrics 0.448% CPU, 92/223 periods throttled. Every unit zero memory-high/OOM events. Trial unchanged since 16:00:24, zero restarts.
- Services 14/14, sources 36/36 and jobs healthy; no active alerts, `/healthz` database/Redis OK. Recovery and deployment/restarts stay deferred; items 39/34 production acceptance await Nov 8, item 33 remains closed.
- Archived progress entries 1215–1222 after PROGRESS exceeded 25 KB; current history retains archive links. `pnpm check` passes (562 unit/229 integration, four expected skips); `pnpm build`, `pnpm format`, `pnpm lint:fix`, changed-document Prettier checks and `git diff --check` pass. App/Grafana health healthy.
- Initial push rejected because owner lead-status commit `90d75baf` landed remotely. Fetched and merged without changing owner files or rewriting history; retrying push.
- Next: comparable natural compaction evidence, queued deployment, Nov 8 scheduled acceptance and first-week report. Prefer reader work while waiting; do not mistake many small merges for one comparable merge.

## 2026-11-07: iteration 1230 — retain cleared evaluator failures in recovery evidence

- Owner impact (Current order 1): recovery health snapshots could miss alert-evaluation failures that clear between samples. Clean main/no leftovers; highest-priority incident remains open.
- Recovery probe now captures evaluator identity, lifetime execution errors and summed missed iterations across groups, plus interval deltas. New failures remain visible after rules recover; restarts/resets/nonfinite counters invalidate intervals. Offline regression covers these paths.
- Confirmed evaluator is not a configured scrape target: correct counter-name history queries return no series; journal since trial start is empty. No historical no-error claim, scrape change, forced compaction, production write or paid call.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 2 30`, 19:13:55–19:14:55 UTC: zero new errors/misses (lifetime 14/25), 23 healthy/fresh rules, six uncached queries/max 0.162 s; two small merges/7,015 rows, no big merge. Admission hits two, zero timeouts/slow queries; process unchanged/zero restarts.
- `pnpm exec tsx scripts/sample-observability-capacity.ts 6 10`: 60.045 s, 1.174% whole-stack CPU/681.0 MiB peak; metrics 0.375% CPU, 65/199 periods throttled; every unit zero memory-high/OOM events.
- Services 14/14, sources 36/36 and jobs healthy; no active alerts; app database/Redis and Grafana database health pass. TASKS and capacity evidence updated; initial deployment hold was superseded by owner STEERING 49 during push recovery; see deployment entry below.
- Verification: `pnpm check` passes (563 unit/229 integration, four expected skips); `pnpm build`, `pnpm format`, `pnpm lint:fix`, targeted recovery tests, final live probe smoke and `git diff --check` pass. No app runtime changes or restart.
- Next: comparable compaction evidence, queued deployment, Nov 8 scheduled acceptance and first-week report. Probe output now carries evaluator deltas for subsequent recovery observations.

## 2026-11-07: iteration 1230 — deploy queued fixes under new owner item 49

- Initial push of `012129a4` rejected: owner commits `8b040128`/`6ef4e2ee` added STEERING 49, removing the indefinite app-deployment hold. Fetched/merged without rewriting history or editing owner files; followed new priority immediately.
- Deployed merged main `96457a35` at 19:20 UTC: all queued publisher, NBA repair/preview/fallback/cutoff, Bluesky link/repair and X/schema diagnostics are live. Production quality acceptance remains due Nov 8; no paid rerun.
- `python3 ops/backups/database.py backup`: private 8,973,151-byte dump, 28 tables. `pnpm migrate`: applied `drizzle/0008_content_publisher.sql`; live ledger and `content_items.publisher:jsonb` verified. No rollback.
- Restarted API/worker/docs/schema with systemctl user units. Metrics service/trial unchanged; STEERING 49 replaces the deployment hold, incident stays open with at most one short passive check per hour.
- Services 14/14, sources 36/36, jobs, app database/Redis and Grafana database health pass; no active alerts. `pnpm exec tsx scripts/smoke-ui.ts`: actual saved Nov 7 reader, summaries, images, archive/reload and desktop/mobile layouts pass; no API writes/browser errors; four screenshots updated and mobile inspected.
- Removed stale hold wording in TASKS/decision 0004 and data-model handbook; Nov 8 plan records deployed revision. Earlier probe/check/build results above remain applicable: merged owner changes are instructions/status only.
- `pnpm exec tsx scripts/check-handbook.ts 07-data-model`: 18 pages, three diagrams and 28-table metadata pass; no diagrams changed. Final formatting/lint and diff checks pass.
- Next: Nov 8 scheduled selection/quality/cost/speed acceptance and first-week report; do not hold reader work on natural compaction.

## 2026-11-07: iteration 1231 — expose post publication dates to screen readers

- Owner impact (STEERING 42/43): the 18 actual Nov 7 X/Bluesky timestamp links announced only generic destinations, hiding publication dates from screen-reader link navigation. Bigger content fixes await Nov 8 acceptance; clean main/no leftover work, no active alerts or broken services/sources/jobs.
- Replaced overriding accessible labels with visually hidden platform context; existing exact timestamp labels now contribute to each link name. Visible ages, destinations, saved content and generation unchanged. No paid calls.
- New GET-only browser check reproduces the old accessible-name failure, then verifies all 18 real saved posts, destinations, date names, focus and containment on desktop/mobile light/dark; external traffic blocked. Four screenshots added; mobile light inspected. Existing sizing/layout selectors updated for descriptive names.
- `pnpm check`: 563 unit and 229 integration pass, four expected skips; `pnpm build`, `pnpm format` and `pnpm lint:fix` pass. `pnpm exec tsx scripts/smoke-post-timestamps.ts` and `scripts/smoke-post-sizing.ts` pass; sizing uses explicitly stubbed widgets. `pnpm exec tsx scripts/smoke-reader-layout.ts` passes four saved-edition device/theme views with external embeds blocked; unrelated regenerated screenshots discarded.
- Restarted API to serve rebuilt reader; `/healthz` database/Redis OK. Metrics trial untouched; no repeat probe inside the hourly limit. TASKS/STEERING updated; no handbook system-flow change.
- Initial push of `e9ad5319` rejected because owner lead-status commit `59080b41` landed remotely. Fetched/merged its two owner-note changes without editing them or rewriting history; application checks remain applicable.
- Next: Nov 8 scheduled X/Bluesky/quality/cost/speed acceptance and first-week report. Metrics recovery remains open; next passive check no sooner than 20:14 UTC.

## 2026-11-07: iteration 1232 — make original X posts easy to open after embed failure

- Owner impact (STEERING 42/43): saved Nov 7 X posts include incomplete sentences, but failed media offered only an explicit retry action. Added “Open original on X” beside retry so readers can continue at the original. Generation/content unchanged; no paid calls.
- Clean main/no leftovers; alerts clear, 14/14 services and 36/36 sources healthy, latest digest completed and Nov 8 15:00 UTC queued. Metrics trial untouched; no repeat probe inside hourly limit.
- Updated saved-data `pnpm exec tsx scripts/smoke-reader-x-media.ts`: missing-link assertion fails against old reader, then destinations, keyboard focus, wrapping, saved text and retry/theme/resize recovery pass desktop/mobile light/dark after rebuild. External requests blocked; successful embeds use an explicitly local stub.
- Four failure screenshots updated; mobile light inspected. Discarded unrelated loading/recovery screenshots. Handbook already describes opening originals after media failure; no system-flow change.
- Verification: `pnpm check` passes (563 unit/229 integration, four expected skips); `pnpm build`, `pnpm format`, `pnpm lint:fix`, browser smoke and `git diff --check` pass. API restarted to serve rebuild; initial immediate browser attempt hit startup connection refusal, retry after healthy `/healthz` passed.
- Next: Nov 8 scheduled X/Bluesky/quality/cost/speed acceptance and first-week report. Metrics recovery remains open; next passive check no sooner than 20:14 UTC.

## 2026-11-07: iteration 1233 — identify each story's coverage control

- Owner impact (STEERING 42/43): all 20 saved Nov 7 story-coverage labels named only the article count, leaving screen-reader navigation without story context. Included the story title; visible counts, reporting, selection and generation unchanged. No paid calls.
- Clean main/no leftover work. `pnpm obs alerts`, `services --check`, `sources --check`, `jobs --check` and `/healthz`: no active alerts, 14 services/36 sources healthy, no failed digest runs; next edition Nov 8 15:00 UTC. Metrics trial untouched; hourly probe not yet due.
- `pnpm check`: 563 unit/229 integration pass, four expected skips; `pnpm build` passes. API restarted; database/Redis healthy.
- `pnpm exec tsx scripts/smoke-reader-coverage-labels.ts`: all 20 real saved controls retain story-specific labels, keyboard expansion/collapse, report URLs and containment in desktop/mobile light/dark. GET-only/external traffic blocked; four screenshots added, mobile light inspected.
- Initial browser selector assumed a native summary matched Playwright's button role; corrected to the summary element and explicit label assertion. Updated existing reader-layout label expectation. No handbook system-flow change.
- `smoke-reader-layout.ts` hit existing deep-link offset timeout twice at line 770; standalone cold pages confirmed 228 px desktop/351 px mobile instead of 96/144 px. Font-wait attempt did not resolve drift and was deliberately discarded; source-label/keyboard checks pass. Recorded next reader issue in TASKS; unrelated regenerated screenshots discarded.
- Final `pnpm format`, `pnpm lint:fix` and diff checks pass. Next: diagnose deep-link drift; Nov 8 scheduled acceptance/first-week report. Metrics recovery remains open, passive check no sooner than 20:14 UTC.

## 2026-11-07: iteration 1234 — keep opening story links below navigation

- Owner impact (STEERING 42/43): saved-story reloads landed too far below navigation. Cold-page comparison isolated smooth scrolling plus earlier topic resizing; instant scrolling alone still drifted to 128/212 px. Clean main/no leftover work.
- Opening anchors now restore instantly through font/lazy-card size changes; wheel, touch, pointer, keyboard or hash navigation disconnects restoration. No content, selection, provider or budget changes; no paid calls.
- `pnpm exec tsx scripts/smoke-reader-layout.ts` passes all four real saved-edition desktop/mobile light/dark views with strict 96/144 px alignment and resize-after-user-scroll release checks. External embeds blocked, GET-only. Four deep-link screenshots added; mobile light inspected. Unrelated regenerated screenshots discarded.
- `pnpm check` passed typecheck/lint/format/boundaries and 563 unit tests, then exited 143 after logging all 233 integration cases without a final summary; `pnpm test:integration` rerun passes (229 pass/four expected skips). `pnpm build`, final `pnpm format`, `pnpm lint:fix` and `git diff --check` pass. API restarted with rebuilt reader; `/healthz` database/Redis OK.
- Initial alerts clear; 14 services/36 sources healthy, latest digest complete and fresh social collection returning data. No repeat metrics probe inside hourly limit. No handbook system-flow change.
- Next: Nov 8 scheduled X/Bluesky/quality/cost/speed acceptance and first-week report. Metrics recovery remains open; passive check no sooner than 20:14 UTC.

## 2026-11-07: iteration 1235 — distinguish saved X transcripts

- Owner impact (STEERING 42/43): saved X transcript controls all said “Saved post text”; accessible names now identify author and exact publication time so readers can distinguish posts. Visible text and saved content unchanged; no paid calls.
- Clean main/no leftover work. Alerts clear, 14 services/36 sources healthy, latest digest completed and Nov 8 15:00 UTC queued; `/healthz` database/Redis OK. Metrics trial untouched; no repeat probe inside hourly limit.
- `pnpm exec tsx scripts/smoke-reader-x-media.ts` passes all 15 real saved X labels plus keyboard focus, transcript toggle, theme/resize and media recovery in desktop/mobile light/dark. External requests blocked; successful media uses an explicitly local stub.
- Four saved-transcript screenshots updated; mobile light inspected, unrelated regenerated images discarded. No handbook system-flow change.
- `pnpm build`, `pnpm format`, `pnpm lint:fix` and `git diff --check` pass; rebuilt API restarted healthy. `pnpm check` passes: 563 unit and 229 integration tests, four expected skips.
- Next: Nov 8 scheduled X/Bluesky/quality/cost/speed acceptance and first-week report. Metrics recovery remains open, passive check no sooner than 20:14 UTC.
- Initial push rejected: owner handbook palette commits landed remotely. Merged all three without rewriting history; docs-site typecheck/tests pass and docs service restarted. Reader verification remains applicable.

## 2026-11-07: iteration 1236 — hourly recovery evidence

- Clean main/no leftover work. Highest-priority open breakage remains metrics recovery; scheduled X/Bluesky/content acceptance awaits Nov 8 15:00 UTC. No provider calls or generation changes.
- `pnpm obs alerts`, `services --check`, `sources --check`, `jobs --check`: no active alerts, 14 services/36 sources healthy, next edition queued; latest social collection completed. App database/Redis health passes.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`: 20:15:10–20:15:40 UTC, 23 healthy rules, four uncached queries ≤0.098 s; zero new evaluator errors/misses, admission hits unchanged at two, no queue timeouts/slow queries. No merges; incident stays open.
- Metrics unchanged since 16:00:24 UTC/zero restarts. Updated decision 0004/TASKS with evidence and next passive check ≥21:15 UTC. No service restart needed for evidence-only changes; deployed app stays unchanged.
- Initial Grafana health request assumed port 3000 and failed; repository config identifies 3001/grafana, corrected health request passes.
- Verification: `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 563 unit/229 integration tests, four expected skips; typecheck/lint/format/boundaries green. Evidence-only change, no rebuild required.
