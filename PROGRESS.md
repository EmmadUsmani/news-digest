# Progress

Earlier entries: [iterations 1062–1069](docs/progress-archive/2026-11-07-iterations-1062-1069.md).

Earlier entries: [iterations 1070–1074](docs/progress-archive/2026-11-07-iterations-1070-1074.md).

Earlier entries: [iterations 1075–1084](docs/progress-archive/2026-11-07-iterations-1075-1084.md).

Earlier entries: [iterations 1089–1101](docs/progress-archive/2026-11-07-iterations-1089-1101.md).

## 2026-11-07: iteration 1191 — triage metrics-store scrape outage

- Clean main/no leftovers. New breakage outranks pending X/Bluesky acceptance: metrics-store ScrapeTargetDown pending at 13:45, firing by 13:46 (active since 13:42); dispatcher recorded firing at 13:45:44.
- pnpm obs services --check times out; direct service-status PromQL returns HTTP 200 in 12.963 s. Self-scrape/alert queries time out or take 6–9 s; metrics health still OK.
- Unit CPUQuota=1%; sampled 77/77 additional periods throttled. MemoryCurrent 92,073,984 vs MemoryHigh 92,274,688 bytes, 7,114 reclaim events, no OOM; full pressure avg60 0.79%. CPU starvation confirmed; reclaim contribution not isolated. Evidence/recovery plan in capacity decision and top TASKS breakage.
- curl /healthz: DB/Redis OK; reader HTTP 200. pnpm obs sources --check: 36/36 healthy. Authenticated localAdminJson status: digest-generation failed=0, delayed=1, next Nov 7 15:00 UTC. No provider calls or secrets printed.
- No runtime changes, restart or deployment during protected 13:00–16:00 UTC. Publisher branch remains gated on actual Nov 7 review plus 16:00 UTC. Handbook/SOURCES/NEEDS_FROM_HUMAN unchanged; no system behavior/source changes or owner action needed.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass; 543 unit tests and 226 integration tests pass (four previously passed rehearsals skipped). git diff --check passes. No UI changes/screenshots; docs-only commit keeps live runtime on main.
- Next: prioritize Nov 7 publication review when saved; after 16:00 diagnose current metrics CPU/reclaim deltas, tune modestly and verify self-scrape/query latency/alert recovery plus ~800 MiB/<5% whole-stack budget before publisher deployment.

## 2026-11-07: iteration 1192 — distinguish scrape recovery from metrics latency

- Clean main/no leftovers. Owner value: preserve trustworthy monitoring and a concrete post-window repair instead of treating a cleared alert as recovery.
- Initial pnpm obs alerts: zero pending/firing; dispatcher records automatic resolution at 13:47:01. No restart (NRestarts=0, process start Nov 5); all 14 service checks now pass.
- Direct serial PromQL probes: self-scrape up=1 in 0.635 s, service status 4.803 s, aggregate process RSS 11.597 s, aggregate process CPU 3.403 s. Aggregate process metrics are not whole-stack budget evidence.
- Across probes plus 15 s: 355/355 periods throttled, high events +13, zero OOM; current memory 85,610,496→84,336,640 bytes. CPU contention persists below memory ceiling; repair remains open.
- Journal: 5,043,833-row merge ran 481.399 s, ended 13:46:41; another ended 13:46:56 before alert resolution. Compaction is a plausible contributor, not proven cause. Updated capacity decision and top TASKS handoff.
- curl /healthz DB/Redis OK; pnpm obs sources --check 36/36 healthy; authenticated localAdminJson status digest-generation failed=0, next Nov 7 15:00 UTC. Reader HTTP 200/four saved Nov 6 topics; two historical ingestion failures retained.
- No runtime/UI/schema/source changes, paid requests or protected-window restarts/deploys. SOURCES/handbook/NEEDS_FROM_HUMAN unchanged; publisher remains gated.
- Next: Nov 7 production review on publication; after 16:00 measure modest CPU headroom first, then decide memory changes and verify ~800 MiB/<5% whole-stack usage before publisher deployment.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass; 543 unit/226 integration tests pass (four previously passed rehearsals skipped). git diff --check passes. Docs-only step; protected-window services remain on unchanged main runtime.

## 2026-11-07: iteration 1193 — confirm alert-evaluation impact of metrics contention

- Clean main/no leftovers. Read-only incident diagnosis confirms metrics contention also interrupted OffsiteDatabaseBackupStale evaluation: metrics queue timeout at 13:46:01, vmalert HTTP 429 at 13:46:43 for the 13:44 evaluation. One queue rejection in 13:30–14:05 journal interval; no claim a backup was stale.
- Serial self-scrape/RSS probes 0.438/0.500 s; 15.94 s sample consumed 109,148 µs CPU, throttled 101/124 periods and added four memory-high events, zero OOM. Effective quota 1 ms/100 ms; GOMAXPROCS already one. Faster probes do not close intermittent contention.
- Capacity decision and top TASKS now require successful backup-rule evaluation/no new 429s across compaction after repair, alongside scrape/query and whole-stack budget checks. No deadline/concurrency relaxation proposed.
- pnpm obs alerts clear; pnpm obs services --check passes 14 units; pnpm obs sources --check passes 36 sources; curl /healthz reports DB/Redis OK. No runtime/UI/source/schema/provider changes or protected-window restart/deploy; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged.
- Next: Nov 7 scheduled edition review at publication; after 16:00 repair metrics with modest measured CPU headroom, then verify alert evaluations and ~800 MiB/<5% stack budget. Publisher merge still requires actual committed review and 16:00 UTC.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass; 543 unit and 226 integration tests pass (four rehearsals skipped). git diff --check passes. Docs-only change; live runtime unchanged, no UI screenshots needed.

## 2026-11-07: iteration 1194 — prepare CPU-only metrics recovery trial

- Clean main/no leftovers. Owner value: restore trustworthy scrape and backup-alert evaluation after the observed outage, with a concrete repair ready for the permitted window.
- Prepared obs-metrics.service CPUQuota 1→2% in the repo; installed production unit remains 1%. Memory 88/112 MiB, GOMAXPROCS=1, query admission/deadlines unchanged. No claim of measured recovery.
- Capacity decision records isolated-unit deployment and acceptance: before/after cgroup and uncached query measurements, successful backup-rule evaluation/no new 429 across compaction, whole-stack ~800 MiB/<5% CPU. Avoid the all-metrics installer and unrelated collector restarts.
- pnpm obs alerts: zero active; pnpm obs services --check: 14 healthy; pnpm obs sources --check: 36 healthy; curl /healthz: database/Redis OK. systemd-analyze verify passes the staged unit; installed-file difference confirms it is not deployed.
- No runtime/provider/UI/schema/source changes or protected-window restart. Handbook/SOURCES/NEEDS_FROM_HUMAN unchanged: current deployed behavior unchanged; publisher merge remains gated.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass; 543 unit/226 integration tests pass (four rehearsals skipped). git diff --check passes.
- Next: review Nov 7 edition at 15:00 UTC; after 16:00 deploy/measure the CPU-only metrics trial before closing recovery. Publisher requires committed Nov 7 review and the time gate.

## 2026-11-07: iteration 1195 — establish the metrics trial resource baseline

- Clean main/no leftovers. Owner value: judge the proposed monitoring repair against measured whole-stack headroom while protecting the scheduled edition.
- Python read-only cgroup sampling via systemctl ControlGroup/ActiveState and cpu.stat/memory.current/memory.events: eight units, seven snapshots over 60.325 s; 2.194% of one core, 752.91→754.62 MiB, sampled peak 757.81 MiB. Scope excludes app/containers/transient collectors/host overhead.
- Metrics alone consumed 0.941% CPU; throttled 553/573 active periods, memory-high +1, OOM +0. No other unit added high/OOM events. Installed CPU remains 1%; repo-only 2% trial remains undeployed.
- curl vmalert /api/v1/rules: backup-staleness rule health=ok/empty lastError on two evaluations, 0.299/0.100 s; rule errors remain one. journalctl warning query since 13:46:44 finds no entries. Sustained recovery across compaction remains unverified.
- pnpm obs alerts clear; pnpm obs services --check 14/14 and pnpm obs sources --check 36/36 healthy; curl /healthz database/Redis OK. Capacity decision and TASKS updated with baseline and measurement method.
- No runtime/UI/schema/source/provider changes, paid calls or protected-window restart/deployment. Handbook/SOURCES/NEEDS_FROM_HUMAN unchanged; live runtime unchanged.
- Next: review Nov 7 15:00 edition, then after 16:00 deploy/measure CPU-only metrics trial; publisher merge still needs the committed actual review and time gate.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass; 543 unit/226 integration tests pass, four rehearsals skipped. git diff --check passes. Docs-only change; protected-window services stay on unchanged runtime.

## 2026-11-07: iteration 1196 — make incident trial measurements repeatable

- Clean main/no leftovers. Added read-only direct-cgroup sampling for the actual metrics outage recovery; no dependency on the saturated query endpoint, no new collector/service or paid calls.
- `pnpm exec tsx scripts/sample-observability-capacity.ts 6 10`: eight units/seven snapshots/60.048 s, 1.374% aggregate CPU, 758.60 MiB sampled memory peak; metrics throttled 252/362 periods, memory-high +4, zero OOM. This is not recovery evidence; installed CPU quota remains unchanged.
- Sampler reports per-unit throttling/high/OOM deltas, rejects restarts/reset counters and validates interval arguments. Node assertions verified aggregate CPU/memory arithmetic, sample count/time and peak bounds against actual output; invalid interval exits nonzero.
- Capacity decision documents the command for the post-16:00 before/after trial. TASKS updated; no source/UI/schema/provider/handbook flow changes or protected-window restart/deployment.
- Health: alerts clear, 14 services and 36 sources healthy; /healthz database/Redis OK. Next: actual 15:00 edition acceptance, then CPU trial after 16:00; publisher merge remains gated.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass; 543 unit/226 integration tests pass, four rehearsals skipped. git diff --check passes; formatted sampler rerun passes. Runtime unchanged; no restart during protected window.

## 2026-11-07: iteration 1197 — confirm metrics failure recurs before trial

- Clean main/no leftovers. Read-only incident check finds corrected uncached `up{job="metrics-store"}` query timing out at its 20 s client deadline around 14:31 UTC; subsequent alert snapshot has ScrapeTargetDown pending since 14:31. Incident stays open, not a recovery claim.
- Direct metrics baseline: select-limit hits/timeouts 450/66; zero active merges, 4,587 small-storage merges/120,564,972 rows. Journal since 14:15 has four slow queries and a 30,284-row merge completing 14:16:28 in 40.300 s, no queue rejection warning.
- Backup rule healthy at 14:30:22, 0.177 s, empty lastError, cumulative errors still one: successful evaluation after small compaction, not large-compaction acceptance. Service-status uncached query 2.499 s/one series. Discarded initial wrong-job empty-series query.
- TASKS/capacity evidence updated. Services 14/14, sources 36/36, /healthz database/Redis healthy at orientation; no app/source/provider changes, paid calls or protected-window deployment/restart. Handbook/SOURCES/NEEDS_FROM_HUMAN unchanged.
- Next: review actual 15:00 edition; after 16:00 deploy/measure staged CPU-only metrics trial before publisher merge (also gated on committed review).
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass; 543 unit/226 integration tests pass, four rehearsals skipped. git diff --check passes. Scrape alert cleared by 14:34:50 without intervention; runtime unchanged, no protected-window restart.

## 2026-11-07: iteration 1198 — record first keyword production results

- Clean main/no leftovers. Read-only Nov 7 production report and Drizzle execution/tool-input inspection distinguish paid transport success from confirmed search completion before the edition.
- Six calls at 14:30–14:32 settled $0.166127, zero holds/profile fetches. NBA/Tech completed: ten fetched each, 19 new verified outside-list candidates combined; all 20 citations currently verified.
- Gaming/World each exhausted initial attempt plus retry, zero fetched/citations and execution=unconfirmed despite ledger status=succeeded. Recorded keyword inputs do not prove completion or an empty search. No extra provider calls or retries.
- SOURCES and TASKS record partial production evidence. Saved picks, engagement/overlap, Bluesky slot outcomes and actual Nov 7 review remain pending 15:00; this entry does not satisfy the publisher merge gate.
- pnpm obs alerts clear; pnpm obs services --check 14/14 and pnpm obs sources --check 36/36 healthy; curl /healthz database/Redis OK.
- No runtime/source/query/cap/schema/UI changes, paid verification or protected-window deployment/restart; handbook/NEEDS_FROM_HUMAN unchanged. Metrics recovery trial still waits until after 16:00.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass; 543 unit/226 integration tests pass, four rehearsals skipped. git diff --check passes.
- Next: review actual 15:00 edition first; then after 16:00 deploy/measure CPU-only metrics trial before gated publisher merge.

## 2026-11-07: iteration 1199 — retain X failure completion evidence

- Clean main/no leftovers. Nov 7 Gaming/World unconfirmed production searches exposed missing diagnostics: saved queries discarded provider tool status.
- Adapter now preserves optional provider-reported tool status with exact input; missing/malformed status stays unknown. No inferred completion, retry, search, model, cap or accounting changes.
- Daily discovery report exposes saved execution and tool calls independently of billing status; existing JSONB storage needs no migration. Read-only live report confirms six succeeded calls, four unconfirmed/two completed, $0.166127/zero holds; historical discarded statuses stay unknown.
- Offline regressions cover failed/completed/in-progress/absent/malformed status, unchanged zero-fetch usage, ledger persistence and succeeded-but-unconfirmed report evidence. Handbook/TASKS updated.
- Health: alert snapshot clear, all 14 services/36 sources healthy; /healthz database/Redis OK. No paid calls, UI changes or protected-window deployment/restart. Runtime change awaits post-16:00 deployment.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass; 543 unit/227 integration tests pass, four rehearsals skipped. Handbook filter and git diff --check pass.
- Next: actual 15:00 edition review, then after 16:00 CPU-only metrics trial and pending diagnostic deployment; publisher merge still gated on committed review.

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
