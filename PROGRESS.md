# Progress

Earlier entries: [iterations 1062–1069](docs/progress-archive/2026-11-07-iterations-1062-1069.md).

Earlier entries: [iterations 1070–1074](docs/progress-archive/2026-11-07-iterations-1070-1074.md).

Earlier entries: [iterations 1075–1084](docs/progress-archive/2026-11-07-iterations-1075-1084.md).

Earlier entries: [iterations 1089–1101](docs/progress-archive/2026-11-07-iterations-1089-1101.md).

Earlier entries: [iterations 1191–1199](docs/progress-archive/2026-11-07-iterations-1191-1199.md).

## 2026-11-07: iteration 1200 — distinguish unconfirmed X execution in logs

- Clean main/no leftovers. Paid X responses logged only transport success, hiding Gaming/World-style unconfirmed searches from warning-level operational searches.
- External-call logs now include execution separately from transport outcome and warn when execution is unconfirmed. Confirmed empty searches stay informational; billing, retries, queries, models and caps unchanged.
- Offline log regression verifies unconfirmed execution despite positive fetched usage, completed empty execution, correlation, one event per attempt and private-data exclusion. Handbook and pending-deployment task updated.
- Orientation: alerts clear, services 14/14, sources 36/36, /healthz database/Redis healthy. No paid calls or production writes/restarts; protected-window deployment remains deferred until after 16:00 UTC.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass; 543 unit/227 integration tests pass, four rehearsals skipped. Targeted log test, handbook filter and git diff --check pass.
- Next: actual 15:00 edition review; after 16:00 measure CPU-only metrics trial and deploy queued X diagnostics. Publisher merge remains gated on committed review.

## 2026-11-07: iteration 1201 — review actual keyword/reserved-slot edition

- Clean main/no leftovers. Committed actual Nov 7 edition review and six desktop/mobile screenshots; edition 0b73eb47-19cf-48e8-8190-f9500c140fa4 saved 20 stories/18 posts in 180.570 s for $0.380173, mixed AI.
- NBA article editing exhausted Sonnet initial/repair (unsupported absence), Haiku initial (schema)/repair (unsupported absence); non-AI fallback excerpts readable, empty brief. Zero budget refusals; rejected text unavailable. Offline diagnosis remains next before tuning.
- Six keyword calls/$0.166127/zero holds: Tech/NBA completed, Gaming/World unconfirmed after retries (4/6 attempts). Three new Tech citations selected; NBA selected citation already verified. All 20 citations have reported likes; selected X public metrics remain unknown.
- First reserved-slot edition: NBA/Gaming/World one distinct Bluesky pick each; Tech zero with two unsupported drops. No X replacement, cached X IDs agree; scoring/editing $0.061842. Per-topic outcomes, costs, IDs, engagement and limits in actual review/SOURCES. Two more scheduled reviews remain.
- World five distinct stories; no clearly unrelated selected merge. Tech launch repetition improved; NBA fallback routine items and Gaming/World post repetition remain. No prompt/source/model/query/cap changes or paid verification.
- Verification: pnpm check (543 unit/227 integration pass; four rehearsals skipped), pnpm build; read-only timing/discovery/week reports, worker journal and Drizzle snapshot/cache/citation SELECTs. Playwright 1440×1100/390×844: 20 headings/non-empty text, 18 posts, zero page errors; screenshots visually checked.
- pnpm obs alerts clear; services 14/14, sources 36/36 healthy; /healthz database/Redis OK. pnpm format, pnpm lint:fix and git diff --check pass. Handbook/NEEDS_FROM_HUMAN unchanged.
- No protected-window deployment/restart; documentation-only step leaves running artifacts unchanged. After 16:00 metrics CPU trial/deploy queued diagnostics first, then gated publisher merge; review gate now satisfied once pushed.

## 2026-11-07: iteration 1202 — diagnose NBA validation fallback offline

- Clean main/no leftovers. Prioritized the actual NBA story-editing failure while metrics tuning/deployment remain protected until after 16:00 UTC.
- Added synthetic real-editor/BudgetedLlm regression reproducing the observed Sonnet absence/absence then Haiku schema/absence sequence: exactly four calls, no AI result. This is not recovered provider output.
- Complete supplied negative sentence and supported positive summary each recover on Sonnet repair in two calls; contraction paraphrase fails the existing verbatim guard. No prompt, validation, retry, model, budget or runtime changes.
- Confirmed Haiku starts fresh; its schema repair receives generic JSON feedback without Sonnet's absence-specific feedback. Production causality and exact rejected text/schema defect remain unknown; review/TASKS updated.
- Verification: targeted editor tests 21/21; pnpm format, pnpm lint:fix, pnpm check and pnpm build pass. Full suite: 544 unit/227 integration pass, four rehearsals skipped; git diff --check passes.
- pnpm obs alerts clear; services/sources checks healthy; /healthz database/Redis OK. No paid calls, live content mutations, UI changes or protected-window restart; test/docs-only commit requires no runtime deployment.
- Next: after 16:00 UTC metrics CPU-only trial and queued X diagnostic deployment, then publisher merge; next scheduled NBA output remains quality acceptance evidence.

## 2026-11-07: iteration 1203 — identify schema rejection categories safely

- Clean main/no leftovers. Alerts clear; services 14/14 and sources 36/36 healthy; /healthz reports database/Redis OK. Metrics trial and deployments remain protected until after 16:00 UTC.
- NBA's unknown Haiku schema failure motivates fixed Zod issue-code diagnostics on initial/repair/cache rejection; unknown runtime codes become unknown, duplicate codes collapse. No rejected text, paths, expected values, custom metadata or messages retained.
- Diagnostic snapshots copy issue arrays so callers cannot mutate stored evidence. Offline tests cover mixed schema failures, custom/unknown codes, cache errors, repair and exactly two existing calls. Synthetic NBA failure now exposes invalid_type/too_big; this is not recovered production evidence.
- No prompt, validation guard, provider, model, budget, retry or UI changes. Handbook and production-acceptance task updated; exact Nov 7 production schema cause remains unknown.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass; 546 unit/227 integration tests pass, four rehearsals skipped. Targeted llm/editor tests 50/50, handbook filter (18 pages/one unchanged diagram/28 tables) and git diff --check pass.
- Runtime changes queued with X diagnostics for deployment after 16:00 UTC; no protected-window restart or paid calls. Next: metrics CPU-only trial/recovery, diagnostic deployment, then publisher merge.

## 2026-11-07: iteration 1204 — scope metrics contention before CPU trial

- Clean main/no leftovers. Read-only incident analysis found 122 slow-query warnings since 13:00 UTC; simple backup-failure selector peaked at 65.902 s, schedule 48-hour expression at 27.200 s. Logged durations overlap and are not CPU time.
- Broad contention supports the prepared isolated CPU trial; no single-rule or cardinality cause established. Added evidence to capacity decision and immediate TASKS entry; no alert semantics or settings changed.
- Another 167,309-row merge completed at 14:38:14 UTC. All 23 rules healthy at the 15:27 snapshot, backup-staleness evaluation successful. Select-limit hits 457 (+7), timeouts 66 (unchanged); same process remains at 1% CPU. Incident stays open.
- Verification: direct metrics/rules HTTP snapshots, decoded slow-query journal aggregation, systemctl limits/process lifetime; /healthz database/Redis OK, services/sources checks pass, alerts clear. pnpm format, pnpm lint:fix, pnpm check (546 unit/227 integration pass; four rehearsals skipped), pnpm build and git diff --check pass.
- No paid calls, production data changes, UI changes or protected-window deployment/restart. Running artifacts unchanged by documentation-only step; SOURCES/handbook/NEEDS_FROM_HUMAN unchanged.
- Next after 16:00 UTC: CPU-only metrics trial with compaction/alert-evaluation and whole-stack resource verification, deploy queued diagnostics, then publisher merge.

## 2026-11-07: iteration 1205 — prepare cleaner NBA fallback reader text

- Clean main/no leftovers; metrics trial/deployment remain protected until after 16:00 UTC. Alerts clear, services 14/14 and sources 36/36 healthy; /healthz database/Redis OK.
- Fixed the visible Nov 7 Cavaliers fallback boilerplate in the prepared reader projection: remove only a terminal WordPress credit matching the exact story title and a short publisher label. Source snapshots, AI summaries, news sentences and publisher links stay intact.
- Regression covers matching credit, mismatched title, incomplete credit, following reporting, credit-only content and AI text; targeted reader suite 6/6 passes.
- Temporary read-only Playwright replay of the actual Nov 7 snapshot passes desktop/mobile light/dark: 20 stories/18 posts, no page errors/overflow, unchanged saved snapshot. Four screenshots labelled prepared; external requests blocked, no loaded-embed claim.
- Updated affected handbook page, actual review and TASKS; SOURCES/NEEDS_FROM_HUMAN unchanged because collection and owner requirements did not change.
- Verification: pnpm check passed typecheck/lint/format/boundaries and 547 unit tests, then received SIGTERM during integration with no reported failure; separate pnpm test:integration passes 227 (four skipped). pnpm build, reader tests 6/6, handbook filter and git diff --check pass; pnpm format and pnpm lint:fix run before commit.
- No paid calls, edition/settings changes or protected-window restart. Reader fix joins queued X/schema diagnostics after metrics recovery; publisher merge follows.

## 2026-11-07: iteration 1206 — update first-week production X accounting

- Clean main/no leftovers. Alerts clear; services 14/14, sources 36/36 and /healthz database/Redis healthy. Protected-window metrics trial/deployments remain queued.
- Completed Nov 7 daily/rolling-week read-only ledger report in SOURCES, TASKS and steering ack. Per-topic cost/new verified outside-list: Tech $0.065975/10, NBA $0.064192/9, Gaming $0.017667/0, World $0.018293/0.
- Nov 2–7: 24 production calls/$0.776678, 97 fetched, attributed new verified/outside-list 91/80, zero holds. Historical unattributed $0.023382 remains separate; stored verification is not causal discovery or virality evidence.
- Nov 7 selected three novel Tech citations and one existing NBA citation. Gaming/World exhausted retries with four unconfirmed attempts; keyword three-edition acceptance stays open. Continue first-week daily reporting through Nov 8.
- Verification: pnpm exec tsx scripts/report-x-discovery.ts 2026-11-07 and scripts/report-x-week.ts 2026-11-07; independent Python assertions confirm daily/weekly topic agreement and totals. pnpm format, pnpm lint:fix, pnpm check and pnpm build pass (547 unit/227 integration; four rehearsals skipped); git diff --check passes.
- Documentation only; no paid calls, settings/edition writes, UI changes or runtime restart. Existing queued artifacts remain deliberately undeployed during 13:00–16:00 UTC. No handbook or owner-input change needed.
- Next after 16:00 UTC: metrics CPU-only recovery trial, queued diagnostic/reader deployment, then publisher merge; Nov 8 daily and second-edition acceptance next.

## 2026-11-07: iteration 1207 — deploy isolated metrics CPU trial

- Clean main/no leftovers; alerts, services, sources and app health pass. Waited until after 16:00 UTC; restarted only obs-metrics at 16:00:24 with CPUQuota 1→2%. Memory, query admission and deadlines unchanged.
- Valid 600.551 s pre-restart baseline: whole stack 1.708% CPU/766.69 MiB peak; metrics 3,408/4,259 periods throttled, 75 memory-high events, zero OOM. Checks/build overlapped part of baseline.
- Subsequent 180.155 s sample: whole stack 1.895% CPU/733.32 MiB peak; metrics 426/859 throttled, zero memory-high/OOM. Uncached real self-scrape/API-unit queries improve from startup 1.375/1.002 s to 0.017/0.001 s, one series each.
- Small-storage 14,118-row/indexdb 6,528-row merges completed; new-process admission hits/timeouts remain zero. All 23 rules healthy; backup-staleness evaluates at 16:03:48 in 0.099 s. Recovery remains open pending comparable large compaction and sustained evaluation.
- Verification: pnpm check passes (547 unit/227 integration, four expected skips), pnpm build, pnpm format, pnpm lint:fix; direct metrics/rules/Grafana health/app health and cgroup sampler. Updated capacity decision and affected handbook resource cap.
- No paid calls, production data/settings changes or app restart. Queued diagnostics/reader and publisher deployment stay deferred until recovery evidence; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Handbook check initially found 101 lines; condensed the resource paragraph to meet the 100-line limit and rechecked.
- Next: check large-compaction/query/alert stability at 2%, then deploy queued diagnostics/reader and merge publisher branch.

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
