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
