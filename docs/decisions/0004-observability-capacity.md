# Keep correlation logs; defer optional tracing and a second proxy

Date: 2026-11-04. Status: accepted capacity decision for O11; no installation.

## Decision

Keep the existing request/job/run IDs, structured logs and dashboards. Defer
both optional O11 additions: a trace collector/store and a Caddy front door.
The stack exceeded the then-approved approximate 500 MiB memory target in
the observed day. On Nov 7 the owner raised that target to about 800 MiB
(STEERING item 45); CPU and disk budgets remain unchanged. A second proxy would also add routing and access-control
configuration for an outage case already covered by documented SSH forwards.
No production service, port, proxy or edition behavior changes.

This does not establish that tracing cannot fit. Neither candidate has been
benchmarked, and available CPU alone is insufficient evidence for adding it.
Reconsider when an actual incident cannot be diagnosed with correlation logs,
or API downtime makes SSH access inadequate. Before installation, compare an
isolated candidate against a baseline under representative traffic, including
edition bursts; measure additional CPU, cgroup memory, retained disk and
request latency. Keep the existing stack plus candidate within the approved
resource budget, or first reduce existing usage. Do not benchmark by issuing
paid provider calls or stopping production services.

## Measured baseline

Read-only snapshot at 2026-11-04 12:07 UTC, with VictoriaMetrics history over
the preceding 24 hours. Eight long-running system units: alerts, Grafana,
logs, metrics, node, Postgres exporter, Redis exporter and shipper.

| Measurement                                                   | Observed                        |
| ------------------------------------------------------------- | ------------------------------- |
| Aggregate current cgroup memory                               | 422.10 MiB                      |
| Maximum aggregate memory, sampled once per minute over 24 h   | 548.72 MiB                      |
| Mean aggregate CPU, five-minute rates sampled once per minute | 1.435% of one core              |
| Maximum aggregate five-minute CPU rate                        | 2.550% of one core              |
| Allocated backing-image directory space                       | 310,251,520 bytes (295.88 MiB)  |
| Log filesystem used / usable capacity                         | 7,401,472 / 1,929,150,464 bytes |
| Metrics filesystem used / usable capacity                     | 12,763,136 / 670,818,304 bytes  |

All eight units were active and below their individual hard memory ceilings.
The memory figure includes cgroup filesystem cache; it is not heap or RSS.
The aggregate peak is a peak of the sum, not a sum of unrelated unit peaks.
The history contains 2,870 samples for seven units and 2,680 for alerts;
missing samples are not evidence of zero resource use. Five-minute CPU rates
hide short bursts. Short-lived textfile collection, app instrumentation,
journald and kernel overhead are outside these eight-unit aggregates. Disk
figures exclude installed binaries, Grafana state and journald, so they do
not establish total stack disk usage or a retention-growth forecast.
The history spans restarts and earlier memory-reclaim configurations; its peak
is not proof that the current configuration will repeat that peak. Conversely,
the current 422 MiB snapshot does not guarantee sustained memory headroom.

## Reproduce

Use the local VictoriaMetrics query API at
`http://127.0.0.1:8428/metrics/api/v1/query`, with URL-encoded PromQL:

```promql
sum(news_digest_unit_memory_bytes{scope="system",unit=~"obs-.*"}) / 1024 / 1024
max_over_time((sum(news_digest_unit_memory_bytes{scope="system",unit=~"obs-.*"}) / 1024 / 1024)[24h:1m])
avg_over_time((sum(rate(news_digest_unit_cpu_seconds_total{scope="system",unit=~"obs-.*"}[5m])) * 100)[24h:1m])
max_over_time((sum(rate(news_digest_unit_cpu_seconds_total{scope="system",unit=~"obs-.*"}[5m])) * 100)[24h:1m])
count_over_time(news_digest_unit_memory_bytes{scope="system",unit=~"obs-.*"}[24h])
```

Compare `systemctl show obs-<role>.service` fields `ActiveState`,
`MemoryCurrent` and `MemoryMax`. Check mounted filesystem usage with
`df -B1 /var/lib/news-digest-logs /var/lib/news-digest-metrics` and allocated
backing files with `du -B1 -s /var/lib/news-digest-observability`.
The normal runtime checker (`pnpm exec tsx scripts/check-observability.ts`)
passed: 476 structured records validated, including a matched request and
worker jobs. This is a baseline/capacity assessment, not a tracing benchmark.

## Nov 6: Grafana cold-cache recurrence (iteration 1059)

A warm restart hid the cost of the 460 MiB Grafana executable: existing file
cache was charged outside the new unit. Stopping Grafana and applying
`os.posix_fadvise(fd, 0, 0, os.POSIX_FADV_DONTNEED)` to that executable
reproduced reclaim thrashing at the old ceiling. The process read about
159 GiB from disk while repeatedly faulting executable pages. Reducing the Go
target to 96 MiB did not make 288 or 352 MiB reclaim ceilings sufficient.

Runtime reclaim/maximum are now 448/512 MiB, with the Go target at 96 MiB.
Start/stop hooks allow 512/544 MiB and 50% CPU; an HTTP/database health wait
precedes restoring 3% CPU and the runtime limits. Grafana's systemd READY
notification arrives before HTTP is ready, so it cannot replace that probe.
The final cold start read about 398 MiB, without ongoing reclaim thrashing.
The eight-unit stack is 754.1 MiB at the 30-minute check, within the approximate
800 MiB whole-stack target approved on Nov 7 (STEERING item 45). No unit limits
changed for that approval; no service or paid traffic added.

At 23:03:50 UTC (30.43 minutes after the final cold start), 61/61 health probes
passed, with a 203 ms maximum and 37 ms final response. Grafana used 416.7 MiB
and averaged 0.81% CPU; the stack's five-minute CPU rate was 2.05%. There were
no OOM events or restarts; reclaim events stopped increasing after the first
minute, and current memory pressure was zero.

## Nov 7 metrics-store scrape outage (iteration 1191)

At 13:45 UTC, `ScrapeTargetDown{job="metrics-store"}` moved from pending
to firing (active since 13:42 UTC). The standalone dispatcher recorded the
firing event at 13:45:44 UTC. This is a new unresolved incident.

- `pnpm obs services --check` timed out; the same direct PromQL query
  (`news_digest_unit_active or news_digest_unit_snapshot_timestamp_seconds`)
  returned HTTP 200 in 12.963 seconds. Journal records self-scrape timeouts
  and alert queries taking 6–9 seconds.
- The unit remains active; `/metrics/health` returns OK. Its CPU quota is
  1% and memory limits are 88/112 MiB. Two cgroup samples show 77 additional
  CPU periods, all 77 throttled, with 80,212 microseconds of CPU consumed.
  MemoryCurrent reached 92,073,984 bytes against MemoryHigh 92,274,688;
  memory.events has 7,114 high events and zero OOM/OOM-kill events.
  Full memory pressure avg60 was 0.79%; CPU starvation is evident, while
  these samples alone do not isolate the contribution of memory reclaim.
- Host memory available was 6,852 MiB and load average 0.22. The app's
  `/healthz` reports database/Redis healthy and the reader returns HTTP 200.

No limits, files under `/etc`, or live services were changed in the
13:00–16:00 UTC protected window. After 16:00, inspect current CPU/reclaim
deltas, tune the metrics unit modestly (starting with CPU headroom if it
still saturates), and verify query latency, self-scrape/alert recovery and
whole-stack usage against the existing ~800 MiB/<5% CPU budget. Do not
restart the app or generation worker to repair the metrics store. The Nov 7
production edition review remains required before the publisher merge.

### Protected-window follow-up (iteration 1192)

The dispatcher recorded resolution at 13:47:01 UTC, without a restart or
configuration change (`NRestarts=0`, process start Nov 5). At 13:53,
`pnpm obs services --check` passed all 14 units and `pnpm obs alerts` had
zero pending/firing alerts. Resolution does not close the latency incident:
serial direct PromQL probes took 0.635 s for self-scrape (`up=1`), 4.803 s
for the service-status query, 11.597 s for aggregate process RSS and 3.403 s
for aggregate process CPU. The last two queries cover instrumented processes,
not the complete observability stack, so they are not budget measurements.

Across those probes plus a 15-second wait, all 355 additional CPU periods
were throttled. Memory high events rose 7,144→7,157, with no OOM; current
memory fell 85,610,496→84,336,640 bytes and full pressure avg60 fell
0.27→0.15%. CPU contention remains present even below the reclaim ceiling.
These samples cannot establish how much extra CPU or memory is sufficient.

The journal records a 5,043,833-row merge lasting 481.399 seconds and ending
at 13:46:41 UTC, then another merge ending at 13:46:56. Both precede alert
resolution. Compaction competing with queries under the 1% CPU quota is a
plausible contributor, not an isolated causal result. After 16:00, measure
query latency and cgroup deltas under modest CPU headroom before deciding
whether memory also needs changing; verify the whole-stack budget separately.
Do not weaken scrape/alert deadlines or disable compaction to hide this outage.

App health still reports DB/Redis OK, 36/36 sources are healthy, the saved
Nov 6 reader has four topics and digest-generation has zero failed jobs with
the next scheduled run at Nov 7 15:00 UTC. Two retained ingestion failures
remain historical while all current source checks pass. No runtime change,
provider request, restart or deployment was made during this investigation.

### Alert-evaluation impact (iteration 1193)

Read-only journal correlation found one query-queue rejection between 13:30
and 14:05 UTC. At 13:46:01 the metrics store rejected the offsite database
staleness query after its 10-second queue deadline, with both permitted
query slots occupied. At 13:46:43 vmalert logged HTTP 429 for the
`OffsiteDatabaseBackupStale` evaluation scheduled at 13:44. This establishes
that contention interrupted a backup-alert evaluation as well as scraping;
it does not establish a stale backup or that a notification was missed.

At about 14:02, serial self-scrape and process-RSS queries took 0.438/0.500 s.
Across 15.94 seconds, CPU usage increased 109,148 microseconds (0.685% of
one core), 101/124 active CPU periods throttled, throttled time increased
11.730 s and memory-high events increased four, with no OOM. Effective
`cpu.max` is `1000 100000`: one millisecond per 100-millisecond period.
The repository already sets `GOMAXPROCS=1`; excess Go parallelism is not
an unconfigured setting to fix. Thirteen OS threads do not contradict that
Go execution limit. These short probes do not close intermittent contention.

After 16:00, retain the two-query admission limit and current deadlines while
testing modest CPU headroom first. In addition to self-scrape and query
latency, verify vmalert has no new failed evaluations/429s across a compaction
and check the backup-staleness rule evaluates successfully. Measure whole-stack
memory/CPU separately against ~800 MiB/<5%; only persist a limit change after
verification. No runtime settings or services changed in this protected window.

### Prepared CPU headroom (iteration 1194; not deployed)

The repository unit now proposes `CPUQuota=2%` instead of 1%: two milliseconds
per 100-millisecond period instead of one. This is a first measured trial,
not a demonstrated recovery. Memory limits, Go parallelism, two-query
admission and deadlines stay unchanged so the first trial isolates CPU headroom.
The installed unit remains at 1%; do not install or restart before 16:00 UTC.

After the protected window, capture cgroup CPU/memory counters and serial
uncached self-scrape/service-status query timings before and after installing
only `ops/observability/obs-metrics.service` and restarting `obs-metrics`.
Do not run the all-metrics installer: it also restarts unrelated collectors.
Verify successful backup-staleness evaluations and no new queue rejections
through a compaction, then check whole-stack ~800 MiB/<5% CPU usage. If the
trial fails, retain the open incident and use measured deltas to choose the
next change; do not call a quiet short sample recovery. The additional one
percentage point is a ceiling, not evidence of actual CPU consumption.

### Pre-trial whole-stack baseline (iteration 1195)

Before deployment, a 60.325-second read-only sample around 14:15 UTC measured
all eight observability system units directly through their cgroups. Aggregate
CPU was 2.194% of one core. Aggregate memory started at 752.91 MiB, ended at
754.62 MiB and peaked at 757.81 MiB among seven ten-second samples. These
figures include cgroup file cache. They exclude the app, database containers,
short-lived collectors and host overhead, matching the eight-unit scope above.

| Unit              | Mean CPU (% of one core) | Ending memory (MiB) |
| ----------------- | ------------------------ | ------------------- |
| alerts            | 0.090                    | 7.55                |
| Grafana           | 0.548                    | 419.73              |
| logs              | 0.255                    | 125.32              |
| metrics           | 0.941                    | 83.24               |
| node exporter     | 0.064                    | 29.60               |
| Postgres exporter | 0.019                    | 24.76               |
| Redis exporter    | 0.165                    | 16.24               |
| shipper           | 0.113                    | 48.18               |

The metrics unit throttled in 553/573 active CPU periods and added one
memory-high event; no other unit added high events and none added OOM events.
Installed metrics limits remain CPU 1%, MemoryHigh 88 MiB and MemoryMax 112 MiB.
The observed aggregate leaves approximately 42 MiB below the 800 MiB target
at its sampled peak; it does not establish peak or edition-time headroom.

Measurement used Python with `systemctl show <unit> -p ControlGroup -p ActiveState`
to locate each active cgroup under `/sys/fs/cgroup`, then read `cpu.stat`,
`memory.current` and `memory.events` seven times, ten seconds apart. Compute
aggregate CPU from summed `usage_usec` deltas divided by monotonic elapsed
microseconds, times 100; sum memory within each snapshot before taking its
maximum. Counters were read sequentially, not atomically. Use the same method
after the trial rather than substituting process RSS or summed unit peaks.

Read-only `GET http://127.0.0.1:8880/api/v1/rules` showed
`OffsiteDatabaseBackupStale` healthy with empty lastError at 14:14:51.760 UTC
(0.299 s) and 14:15:20.460 UTC (0.100 s). Its cumulative rule error counter
remains one; vmalert's warning journal after 13:46:44 contains no entries.
These successful evaluations establish current recovery of that rule, not
sustained recovery across compaction. The CPU trial and incident remain open.

### Repeatable trial sampling (iteration 1196)

Run `pnpm exec tsx scripts/sample-observability-capacity.ts 6 10` before and
after the permitted metrics restart. It samples the same eight cgroups seven
times over approximately 60 seconds and emits one JSON record with aggregate
CPU, starting/ending and sampled peak memory, plus per-unit CPU throttling,
memory-high and OOM deltas. It uses local files and systemctl only, so it
remains usable when metrics queries are saturated. A unit restart or a reset
counter invalidates the run rather than reporting misleading deltas. Optional
arguments select interval count and seconds; defaults reproduce the baseline.
This is an operator measurement tool, not a scheduled collector or an automatic
recovery verdict; the query, alert-evaluation and compaction checks still apply.

### Compaction and alert evaluation before the trial (iteration 1197)

At approximately 14:30 UTC, the direct `/metrics/metrics` endpoint reported
zero active merges, 4,587 completed small-storage merges and 120,564,972 rows
merged. The journal records a 30,284-row merge completing at 14:16:28 UTC
in 40.300 seconds. Four slow-query warnings occurred at 14:15–14:16;
no queue-rejection warning occurred in the inspected journal after 14:15.
The backup-staleness rule evaluated successfully at 14:30:22 UTC in 0.177 s,
with empty lastError and its cumulative rule-error counter still one.
This establishes successful evaluation after a small compaction, not recovery
across the five-million-row compaction associated with the earlier outage.

The store reports cumulative select-limit hits 450 and queue timeouts 66.
These are a new pre-trial baseline, not new failures in this observation window;
compare deltas within each process lifetime, since restart resets them.
Serial uncached service-status query latency was 2.499 s with one series.
An initial self-scrape query used the nonexistent job `victoria-metrics` and
returned zero series; discard that latency as a health measurement. The correct
scrape job is `metrics-store`; its corrected uncached query timed out at the
20-second client deadline around 14:31 UTC. A subsequent alert snapshot showed
`ScrapeTargetDown` pending since 14:31:00 UTC for `metrics-store`, corroborating
continuing scrape/query failure. Production remains at 1% CPU until after 16:00.

By the 14:34:50 UTC alert snapshot the pending scrape alert had cleared
without intervention. This transient clearance does not close the incident.

### Query contention scope before the trial (iteration 1204)

A read-only review at 15:27 UTC of the metrics journal since 13:00 found
122 slow-query warnings, totaling 1,280.131 seconds of logged request duration.
Durations overlap and include waiting; their sum is not CPU time. The warnings
cover simple instant selectors as well as longer range expressions:

| Query/rule                                   | Slow warnings | Maximum logged duration |
| -------------------------------------------- | ------------: | ----------------------: |
| Schedule observed-due 48-hour comparison     |            11 |                27.200 s |
| Provider spend near cap                      |            12 |                21.302 s |
| Offsite backup last-attempt failure selector |             7 |                65.902 s |
| Host available-memory ratio                  |             7 |                20.701 s |
| Service inactive selector                    |             1 |                49.803 s |

This broad contention does not isolate the schedule range expression as the
cause. Keep the first trial limited to CPU headroom rather than changing alert
semantics or concurrency at the same time. No cardinality attribution was
established by this journal review.

The journal also records a 167,309-row compaction finishing at 14:38:14 UTC
in 35.698 seconds, after the previously recorded 30,284-row compaction.
All 23 rules (11 app-outcomes, 12 host-and-services) reported healthy in the
15:27 snapshot. OffsiteDatabaseBackupStale last evaluated at 15:26:50 UTC
in 0.0006013 seconds with empty lastError. This is current successful evaluation
after another compaction, not sustained recovery through a comparable large merge.

Direct metrics counters at approximately 15:27 were 457 select-limit hits and
66 queue timeouts: seven additional admission-limit hits since iteration 1197,
with no additional timeout. The installed process has not restarted (active
since Nov 5 11:34:23 UTC, NRestarts=0) and still has a 1% CPU ceiling.
No unit, rule, scrape configuration or production data changed.

Evidence commands: `sudo journalctl -u obs-metrics --since '2026-11-07 13:00:00'
-o cat --no-pager` (parse slow-query duration and decoded request query),
`curl -fsS --max-time 15 http://127.0.0.1:8428/metrics/metrics`,
`curl -fsS --max-time 10 http://127.0.0.1:8880/api/v1/rules`, and
`systemctl show obs-metrics -p CPUQuotaPerSecUSec -p NRestarts
-p ActiveEnterTimestamp`. Keep the incident open and perform the prepared
post-16:00 trial before deploying queued application diagnostics.

### CPU-only trial deployed (iteration 1207)

Installed only the repository metrics unit and restarted it at 16:00:24 UTC
on Nov 7, outside the protected window. CPUQuota changed from 1% to 2%;
memory limits, GOMAXPROCS, query concurrency and deadlines are unchanged.
No application, database, Redis or other observability service was restarted.

The valid pre-restart 600.551-second cgroup sample ended before the restart:
whole-stack mean CPU 1.708%, sampled peak memory 766.69 MiB; metrics mean
CPU 0.655%, 3,408/4,259 active periods throttled, 75 memory-high events,
zero OOM events. CI checks/build ran during part of this observation.
The prior 60-second baseline was 1.420% CPU/765.75 MiB peak, metrics
299/398 periods throttled and six memory-high events.

The first post-start minute measured 2.107% whole-stack CPU/728.79 MiB peak;
metrics used 0.936% CPU, throttled 246/351 periods, with no memory-high or
OOM events. Direct uncached self-scrape/API-unit queries returned one series
each: initially 1.375/1.002 seconds, later 0.017/0.001 seconds. All 23 rules
were healthy; backup staleness evaluated successfully after startup.

Counters reset with the new process; pre-restart 457 admission-limit hits
and 66 timeouts are not comparable directly with post-restart zeroes.
The subsequent 180.155-second sample measured 1.895% whole-stack CPU and
733.32 MiB peak; metrics used 0.638% CPU, throttled 426/859 periods, with
zero memory-high/OOM events. Small-storage merged 14,118 rows and indexdb
6,528 rows by 16:03:04; admission-limit hits/timeouts remained zero. All
23 rules were healthy at 16:03:49, with backup staleness evaluated at
16:03:48 in 0.099 seconds. Keep recovery open until a comparable large
compaction and sustained alert evaluation are verified. This short trial does not establish that CPU headroom fixes the
intermittent outage. Queued application deployments remain deferred.

Commands: `pnpm exec tsx scripts/sample-observability-capacity.ts 60 10`,
then `6 10` and `18 10`; direct `/metrics/metrics`, uncached
`/metrics/api/v1/query`, vmalert `/api/v1/rules`; `systemctl show obs-metrics`.

### Sustained evaluation follow-up (iteration 1208)

At 16:06:47–16:11:48 UTC, the unchanged 2% CPU trial measured 1.393%
whole-stack CPU and 735.42 MiB sampled peak memory over 300.287 seconds.
Metrics averaged 0.463% CPU, throttled 465/1,151 active periods, and had
zero memory-high, OOM or OOM-kill events. Full checks and the build overlapped
this sample; it is not an idle-load comparison with the earlier baseline.

Nine probes at 30-second intervals from 16:07:35 through 16:11:35 found
all 23 alert rules healthy with empty lastError. Both uncached selectors
(`up{job="metrics-store"}` and the API's `news_digest_unit_active`)
returned exactly one series on every probe; the maximum latency was 0.276 s.
OffsiteDatabaseBackupStale advanced to 16:11:18 UTC, evaluating in 0.098 s.
Grafana's configured port/path health check returned database OK.

At 16:12 UTC, the new-process admission-limit, queue-timeout and slow-query
counters remained zero. Cumulative merged rows were 131,674 small-storage
and 6,528 indexdb; large-storage merged rows remained zero. These totals do
not demonstrate a merge comparable to the earlier five-million-row event.
The incident therefore remains open; do not force a compaction or deploy the
queued application changes merely to complete this observation. Next check:
a naturally occurring comparable merge with successful rules/queries and
bounded cgroup resource use. No service was restarted in this follow-up.

Commands: `pnpm exec tsx scripts/sample-observability-capacity.ts 30 10`;
nine read-only vmalert `/api/v1/rules` and uncached metrics query probes;
metrics `/metrics/metrics`; Grafana `:3001/grafana/api/health`;
`pnpm obs services --check`, `sources --check`, `jobs --check`, and `alerts`.
A preliminary API-unit selector used the wrong metric name and returned
zero series; it was discarded before restarting all nine probes with the
correct selector. A Grafana probe at the default port 3000 was likewise
invalid; the configured port 3001 passed.

### Thirty-minute uptime follow-up (iteration 1210)

The unchanged 2% CPU trial remained active from 16:00:24 through 16:31 UTC,
with NRestarts=0. A 600.534-second sample starting at 16:21:17 measured
1.577% whole-stack mean CPU and 745.42 MiB sampled peak memory. Metrics
averaged 0.504% CPU, throttled 1,018/2,482 active periods, and recorded zero
memory-high, OOM or OOM-kill events. Checks and build overlapped the sample.

All 21 thirty-second probes found all 23 rules healthy and both uncached
selectors returning exactly one series; maximum query latency was 0.294 s.
Backup-staleness evaluation advanced to 16:31:19, taking 0.098 s. Grafana
health and app health passed. Admission-limit hits, queue timeouts and slow
queries remained zero. Small-storage merged 1,382,722 cumulative rows and
indexdb 6,528; large-storage remained zero. The cumulative small-merge total
is not evidence of a single comparable five-million-row compaction.

Recovery and queued deployments remain open. No service, configuration or
production data changed. Commands: `pnpm exec tsx
scripts/sample-observability-capacity.ts 60 10`, repeated vmalert rules and
uncached query probes, direct metrics counters, Grafana/app health,
`pnpm obs services --check`, `sources --check`, `jobs --check`, and `alerts`.
