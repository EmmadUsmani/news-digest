# Progress

Earlier entries: [iterations 1062–1069](docs/progress-archive/2026-11-07-iterations-1062-1069.md).

Earlier entries: [iterations 1070–1074](docs/progress-archive/2026-11-07-iterations-1070-1074.md).

Earlier entries: [iterations 1075–1084](docs/progress-archive/2026-11-07-iterations-1075-1084.md).

Earlier entries: [iterations 1089–1101](docs/progress-archive/2026-11-07-iterations-1089-1101.md).

Earlier entries: [iterations 1191–1199](docs/progress-archive/2026-11-07-iterations-1191-1199.md).

Earlier entries: [iterations 1200–1207](docs/progress-archive/2026-11-07-iterations-1200-1207.md).

## 2026-11-07: iteration 1208 — sustained metrics trial follow-up

- Clean main/no leftovers; 14 services, 36 sources, digest queue and /healthz healthy, no active alerts. Existing retained ingestion/social failures have no matching failed digest runs; all queues available/unpaused with workers.
- Unchanged 2% metrics trial: 300.287 s sample, 1.393% whole-stack CPU/735.42 MiB peak; metrics 0.463% CPU, 465/1,151 periods throttled, zero memory-high/OOM. Full checks/build overlapped sample.
- Nine 30-second rule/query probes: all 23 rules healthy; both uncached real selectors return one series throughout, max 0.276 s. Backup-staleness evaluation advances to 16:11:18 in 0.098 s. Grafana configured health endpoint database OK.
- At 16:12 new-process admission hits/timeouts/slow queries remain zero; small-storage/indexdb rows merged 131,674/6,528, large-storage zero. Comparable five-million-row compaction still unobserved: incident and queued deployments remain open.
- Updated capacity evidence, condensed TASKS incident history and archived older PROGRESS entries. Discarded preliminary wrong-name empty-series probe; restarted nine valid probes. Default Grafana-port probe failed; configured :3001/grafana/api/health passes.
- Verification: pnpm check passes (547 unit, 227 integration/four expected skips), pnpm build passes; pnpm format and pnpm lint:fix run. Read-only capacity sampler, repeated direct queries/rules, services/sources/jobs/alerts checks pass.
- No paid calls, runtime/config/data changes or restarts; live runtime deliberately retains the isolated trial while app deployments wait. SOURCES/handbook/NEEDS_FROM_HUMAN unchanged because behavior and owner requirements did not change.
- Next: inspect natural comparable compaction and continued query/alert health; then queued diagnostic/reader deployment and publisher merge, respecting owner deployment restrictions.

## 2026-11-07: iteration 1209 — integrate verified publisher attribution

- Owner value: future editions can distinguish CNBC/Reuters publisher labels from Google News discovery provenance, without rewriting old editions.
- Clean main/no leftovers; alerts clear, 14 services/36 sources healthy, /healthz database/Redis OK and scheduled queue available. Metrics admission/timeouts remain zero; merged small-storage rows 266,819, large-storage zero, so comparable-compaction recovery remains open.
- Both owner merge gates met: after 16:00 UTC and actual Nov 7 review committed in 1201. Merged publisher-attribution through 0ba83c73; resolved only TASKS/PROGRESS conflicts by retaining current main status and archiving branch evidence.
- Nullable publisher migration, RSS parsing/upsert preservation, immutable snapshot propagation and reader provenance labels integrated with later diagnostics/fallback changes. No title/hostname inference, external calls or historical rewrites.
- Local Vite preview + pnpm exec tsx scripts/smoke-reader-publisher.ts pass desktop/mobile light/dark: CNBC/Reuters labels, all three report links, unknown historical metadata and no console errors. Four screenshots refreshed; visually inspected desktop light/mobile dark. This is synthetic replay, not live publisher evidence.
- pnpm build and pnpm exec tsx scripts/check-handbook.ts 07-data-model pass; data-model page explicitly marks deployment pending. No diagram/schema-meta change: no tables/relations added. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Live migration and API/worker restarts remain deliberately deferred to preserve the isolated metrics CPU trial. Next: natural comparable compaction health evidence, then migrate/deploy queued publisher/diagnostic/reader changes; Nov 8 second scheduled acceptance.
- Final verification: pnpm check passes (551 unit, 228 integration; four expected skips); pnpm format, pnpm lint:fix, pnpm build, handbook validation and git diff --check pass. No paid calls or live migration/restart.

## 2026-11-07: iteration 1210 — thirty-minute metrics trial evidence

- Clean main/no leftover work. Breakage remains first priority; 14 services/36 sources, scheduled queue, Grafana and /healthz healthy; alerts clear.
- Unchanged CPU-only trial active >30 minutes, NRestarts=0. Ten-minute sample: 1.577% whole-stack CPU/745.42 MiB peak; metrics 0.504% CPU, 1,018/2,482 periods throttled, zero memory-high/OOM. Checks/build overlapped sample.
- All 21 thirty-second probes pass: all 23 rules healthy, both uncached selectors return one series, max query 0.294 s. Backup rule advances to 16:31:19 in 0.098 s; admission hits/timeouts/slow queries remain zero.
- Cumulative small-storage merges 1,382,722 rows/indexdb 6,528; large-storage zero. No comparable single five-million-row compaction observed: recovery and queued publisher/reader/diagnostic deployment remain open.
- Verification: pnpm check passes (551 unit, 228 integration/four expected skips), pnpm build, pnpm format, pnpm lint:fix and git diff --check pass. Updated capacity decision/TASKS; no application behavior, schema, sources or owner requirements changed.
- No paid calls, runtime/data/config changes or restarts; retained isolated trial deliberately. SOURCES/handbook/NEEDS_FROM_HUMAN unchanged.
- Next: natural comparable compaction evidence, then deploy queued changes subject to owner edition-generation restrictions; Nov 8 scheduled acceptance.

## 2026-11-07: iteration 1211 — preserve factual repair feedback across fallback

- Owner value: NBA story editing should retain its specific factual correction guidance when falling back to Haiku, improving its chance to avoid another excerpt-only edition.
- Clean main/no leftovers; alerts clear, 14 services/36 sources and digest queue healthy; /healthz database/Redis OK. Metrics admission/timeouts/slow queries zero; no comparable large compaction observed, deployments remain queued.
- Followed STEERING 22/38 rather than another status-only iteration: fixed the observed loss of Sonnet absence-check hints across Haiku fallback and its schema repair.
- Editor retains only deduplicated application-owned hints within one edit; no rejected text, extra calls, validation relaxation, model/provider/budget change or historical rewrite. Fallback instruction changes separate cache fingerprints automatically.
- Offline NBA regression verifies four bad responses still fail closed, a supported fourth response succeeds, both Haiku attempts retain factual guidance after schema failure, and the next edit starts clean.
- Targeted editor tests pass 21/21; initial added assertion used an obsolete model name, corrected to configured Haiku 5.5 before verification. Synthetic results establish transport, not production improvement.
- Capacity spot sample (60.052 s): 1.165% stack CPU/746.43 MiB peak, zero metrics memory-high/OOM events; all 23 alert rules healthy. No comparable compaction; this does not close recovery.
- pnpm check passes: 551 unit/228 integration tests, four expected skips; pnpm build, pnpm format, pnpm lint:fix and git diff --check pass. Bug fix needs no handbook/screenshot/schema/SOURCES/NEEDS_FROM_HUMAN changes; edition review and TASKS updated.
- No paid calls, runtime/config/data changes or restarts; retained isolated metrics trial deliberately. Next: comparable natural compaction, then queued deployment and Nov 8 scheduled acceptance.

## 2026-11-07: iteration 1212 — actionable schema repair without rejected data

- Owner value: the editor now receives specific safe correction guidance after a schema failure, helping avoid the excerpt-only NBA fallback observed today.
- Clean main/no leftovers; alerts clear, 14 services/36 sources and scheduled digest queue healthy; /healthz database/Redis OK. All 23 alert rules have no errors.
- Added fixed repair hints for type, upper/lower bounds, extra keys and allowed-value failures. No paths, values, messages or model output enter hints; unknown/custom categories add none.
- Existing factual-support validation, call limits, model/provider configuration and budget admission unchanged. No extra calls or historical rewrites; runtime deployment remains queued behind metrics recovery.
- Offline targeted editor/LLM tests pass 51/51: oversized story recovery, mixed-schema request/log privacy, duplicate hints and unknown categories. Historical NBA schema defect remains unknown; production improvement awaits scheduled acceptance.
- Read-only 30.037 s capacity sample: 1.276% stack CPU/747.77 MiB peak, zero memory-high/OOM; metrics admission/timeouts/slow queries zero. Small merged rows 1,629,016, large zero; no comparable compaction, recovery still open.
- Verification: pnpm check passes (552 unit/228 integration, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass.
- Edition review/TASKS updated; internal repair fix needs no handbook/schema/SOURCES/NEEDS_FROM_HUMAN or screenshot changes. No paid calls, runtime changes or restarts.
- Next: natural comparable compaction, then queued deployment; Nov 8 second scheduled acceptance.

## 2026-11-07: iteration 1213 — verify sustained metrics trial health

- Clean main/no leftovers; prioritized the open metrics incident before queued product deployment.
- Alerts clear; 14 services/36 sources and scheduled digest queue healthy; /healthz database/Redis and Grafana database OK. Latest free-social collection verified ten posts without discovery/verification errors.
- Unchanged CPU-only trial reached 52 minutes, NRestarts=0. Three-minute sample: 1.316% whole-stack CPU/750.21 MiB peak; metrics 0.427% CPU, 243/669 throttled periods, zero memory-high/OOM events. Checks/build overlapped sample.
- Seven thirty-second probes pass: all 23 rules healthy, both uncached selectors return one series, max query 0.299 s. Backup rule advances to 16:52:18; admission/timeouts/slow queries remain zero.
- Small-storage merged rows 1,914,990 cumulative; large-storage zero. No comparable single five-million-row compaction observed; recovery and queued publisher/reader/diagnostic deployment remain open.
- Updated capacity decision/TASKS with evidence; no source/schema/UI/handbook changes needed. pnpm check passes: 552 unit, 228 integration/four expected skips; pnpm build passes.
- pnpm format, pnpm lint:fix and git diff --check pass. No paid calls, production data/config changes or restarts; deliberately retained the isolated trial rather than invalidating observation with deployment.
- Next: comparable natural compaction evidence, then queued deployment subject to edition protection; Nov 8 second scheduled acceptance.

## 2026-11-07: iteration 1214 — one-hour metrics trial observation

- Clean main/no leftovers; prioritized open metrics incident. Alerts clear; services, sources, jobs, app /healthz and Grafana health pass.
- Unchanged CPU-only trial reached 65 minutes without restart. Ten-minute cgroup sample: 1.685% whole-stack CPU/756.21 MiB peak; metrics 0.547% CPU, 1,122/2,617 periods throttled, zero memory-high/OOM.
- Shipper recorded one memory-high event; all other units zero, no OOM/OOM kills anywhere. Checks/build overlapped sample.
- All 21 thirty-second probes pass: 23 healthy rules, both uncached selectors return one series; max latency 0.101 s. Backup rule advances successfully; admission/timeouts/slow queries zero.
- Small merged rows 2,194,548 cumulative/indexdb 13,122/large zero. No comparable single five-million-row merge: recovery/deployment gate remains open.
- pnpm check passes: 552 unit/228 integration tests, four expected skips; pnpm build passes. pnpm format, pnpm lint:fix and git diff --check pass.
- Capacity record updated; condensed TASKS incident summary preserves linked history. No source/schema/handbook/UI changes; no paid calls or runtime/config/data changes.
- Deliberately retained isolated trial rather than restart into queued main changes. Next: comparable natural compaction, then deployment; Nov 8 scheduled acceptance remains due.

## 2026-11-07: iteration 1215 — sustained trial and bounded progress history

- Clean main/no leftovers; prioritized open metrics incident. Alerts clear; 14 services/36 sources, jobs and app/Grafana health pass. Recent free collection verified ten posts without errors.
- Unchanged CPU-only trial exceeds 70 minutes with no restart. Five-minute cgroup sample: 1.322% whole-stack CPU/754.98 MiB peak; metrics 0.411% CPU, 364/1,114 periods throttled. All units zero memory-high/OOM/OOM kills.
- Nine thirty-second probes pass: all 23 rules healthy, both uncached queries return one series; maximum latency 0.401 s. Backup staleness evaluated at 17:11:48 UTC; admission/timeouts/slow-query counters zero.
- Small-storage merged rows 2,281,811 cumulative/indexdb 13,122/large zero. Comparable single five-million-row compaction remains unobserved; recovery and queued deployment stay open.
- Archived iterations 1200–1207 after PROGRESS exceeded 25 KB; linked history retained. Capacity decision/TASKS updated; no source/schema/handbook/UI changes.
- Verification: pnpm build passes. Initial pnpm check stopped on archive formatting; formatted and reran. Final pnpm check passes: 552 unit/228 integration tests, four expected skips; pnpm format, pnpm lint:fix and git diff --check pass.
- No paid calls or runtime/config/data changes; deliberately preserved trial instead of restarting queued app changes. Next: comparable natural compaction, queued deployment, Nov 8 scheduled acceptance.

## 2026-11-07: iteration 1216 — compare repeated reactions and campaigns

- Reader benefit: avoid spending several social slots on the same player return, game campaign or appointment reaction; these repetitions appear in the actual Nov 7 review.
- Clean main/no leftovers; services 14/14, sources 36/36, scheduled queue and app/Grafana health pass; alerts clear.
- With metrics recovery awaiting natural compaction, moved to available STEERING 42 reader work instead of repeating a monitoring-only iteration.
- Social editor v8 explicitly extends its comparison to event reactions/campaign teasers; separate newsworthy decisions, game results and releases remain eligible. No keyword grouping or selection postfilter added.
- Both-model offline request contracts pass (14 focused tests); this verifies guidance delivery, not model compliance. Next scheduled edition after deployment must establish benefit.
- pnpm exec tsx scripts/sample-observability-capacity.ts 18 10: 1.190% whole-stack CPU/759.77 MiB peak; metrics 0.366% CPU, 177/621 periods throttled; zero memory-high/OOM events.
- Nine read-only rules/uncached-query probe rounds pass: all 23 rules healthy, one series per selector, max 0.089 s. Query-failure counters zero; small merged rows 2,544,175/large zero.
- CPU-only trial exceeds 80 minutes without restart; comparable five-million-row compaction still unobserved. Queued deployment/restart remains deliberately deferred to preserve trial.
- No paid calls, runtime/config/data changes or source/schema/UI/handbook changes. Updated review/TASKS and appended item 42 ack.
- Verification: pnpm check passes (552 unit/228 integration, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass.
- Next: natural compaction recovery evidence, queued deployment, Nov 8 scheduled keyword/Bluesky/repetition acceptance.

## 2026-11-07: iteration 1217 — Nov 8 acceptance handoff

- Owner benefit: next scheduled review distinguishes deployed fixes from queued main changes and compares real content against Nov 7 failures.
- Clean main/no leftovers; services 14/14, sources/jobs checks and /healthz pass; alerts clear, all 23 rules healthy.
- Added Nov 8 checklist: exact window/revision evidence, NBA fallback, repeated posts, publisher/credit changes, per-topic X/Bluesky outcomes, cost and first-week report. No production result claimed.
- Corrected stale TASKS next-step text that still requested Nov 7 acceptance and an already-merged publisher branch.
- Metrics trial remains unchanged since 16:00:24 UTC, no restarts; query admission/timeouts/slow queries zero, small merged rows 2,556,000 cumulative, large zero. Comparable five-million-row compaction unobserved; recovery stays open.
- Verification: checklist links/report entrypoints exist; pnpm check passes (552 unit/228 integration tests, four expected skips), pnpm build, pnpm format, pnpm lint:fix and git diff --check pass.
- No paid calls, source/schema/UI changes or runtime changes. Restart deliberately deferred to preserve the isolated metrics trial and deployment gate.
- Next: natural compaction evidence, queued deployment, Nov 8 second-of-three acceptance and Nov 2–8 first-week report.

## 2026-11-07: iteration 1218 — keep dated matchup previews out of news slots

- Reader benefit: Nov 7 NBA fallback spent a story slot on a routine Knicks–Cavaliers game preview instead of substantive news.
- Clean main/no leftovers; alerts clear, services/sources/jobs checks and /healthz pass. Metrics admission/timeouts/slow-query counters zero; small merged rows 2,653,727, no active merge. Comparable large compaction remains unobserved.
- Existing matchup-preview rule missed “Game Preview: Knicks at Cavaliers, November 7, 2026”; extended it for the explicit dated matchup format, without changing grouping or prompts.
- Regression uses the saved headline/excerpt and synthetic counterexamples: both fallback ranking and AI shortlist exclude it even with highest scores; substantive game reporting and ordinary gaming previews remain eligible.
- Focused quality tests pass (4/4). Updated TASKS, item 42 ack and Nov 8 comparison checklist.
- Verification: pnpm check passes (553 unit/228 integration tests, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass. No paid calls, UI/schema/source/handbook changes or production data writes.
- Deployment/restart deliberately deferred to preserve the unchanged metrics trial and existing recovery gate. Next: compaction recovery, queued deployment, Nov 8 acceptance.

## 2026-11-07: iteration 1219 — preserve completed triage when editing fails

- Reader weakness: Nov 7 NBA editor exhaustion discarded complete triage/grouping and reverted to recency; the selected preview scored importance 3, below admission, while five importance-6 candidates covered one Porziņģis event.
- Prepared fallback retains complete triage importance order and validated coverage groups; shows unedited source excerpts, no generated brief. Partial triage and valid-empty editor behavior stay intact. No new calls or wording/grouping rules.
- Clean main/no leftovers; services 14/14, sources 36/36, jobs and /healthz healthy; saved reader still has 20 stories/18 posts. Alerts clear and all 23 rules healthy.
- Metrics trial unchanged since 16:00:24 UTC, no restarts; admission/queue-timeout counters zero, small merged rows 3,491,086, large zero. Comparable large compaction unobserved; recovery/deployment gate remains open.
- Focused quality tests 6/6 pass; direct repository-test invocation was blocked by the isolation guard, then verified through the disposable-database full suite.
- Updated TASKS, item 42 ack, Nov 7 evidence, Nov 8 acceptance checklist and affected handbook page; handbook checker passes (18 pages, one diagram, 28 tables), no diagram change.
- Verification: pnpm check passes (555 unit/229 integration, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass. No paid calls, source/schema/UI or production-data changes.
- Deployment/restart deliberately deferred to preserve the isolated metrics trial. Next: natural compaction recovery, queued deployment, Nov 8 acceptance; check importance/grouped fallback on the next natural editor failure.

## 2026-11-07: iteration 1220 — identify the Tech summary evidence limit

- Owner benefit: named why Tech reads like headlines, so the next review can distinguish missing reporting from editor omissions without speculative prompt tuning.
- Clean main/no leftovers. Read all five saved Tech summaries and their complete evidence lists: four HN excerpts empty; one Google News excerpt repeats its headline/publisher; one evidence article per story.
- HN adapter maps official item text and does not fetch linked articles; feed adapter maps supplied feed text. No evidence in this sample that supplied detail was discarded. Stopped diagnosis at that cause.
- Recorded evidence in Nov 7 review/docs/SOURCES, added Nov 8 evidence-depth comparison and TASKS follow-up; source balance remains paused/full-article work deferred. No new sources, prompts, paid calls, article-page fetches or saved-edition writes.
- Triage: services 14/14, sources 36/36, jobs checks and /healthz pass; alerts clear, all 23 rules healthy. Metrics trial unchanged since 16:00:24 UTC; admission/timeouts/slow queries zero, small merged rows 3,809,910 cumulative, large zero. Comparable natural compaction unobserved.
- Verification: read-only authenticated immutable-edition GET, adapter inspection and documentation target checks pass. pnpm check passes (555 unit/229 integration, four expected skips); pnpm build, pnpm format, pnpm lint:fix and git diff --check pass.
- Deployment/restart deferred to preserve the unchanged metrics trial and existing recovery gate; this step changes documentation only.
- Next: natural compaction evidence, queued deployment, Nov 8 second-of-three acceptance and Nov 2–8 first-week report; compare Tech evidence depth before further editor changes.
