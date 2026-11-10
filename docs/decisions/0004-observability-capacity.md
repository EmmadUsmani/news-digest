# Keep correlation logs; defer optional tracing and a second proxy

> Deployment policy: [STEERING item 49](../../STEERING.md#49-now-stop-holding-app-deployments-behind-metrics-recovery-2026-11-07) removes the app deployment hold. Queued changes deployed in iteration 1230; metrics recovery stays open with at most one short passive check per hour.

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
post-16:00 trial; app deployment follows STEERING 49.

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
intermittent outage. App deployment is independent of recovery under STEERING 49.

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
The incident therefore remains open; do not force a compaction. App deployment follows STEERING 49. Next check:
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

Metrics recovery remains open. No service, configuration or
production data changed. Commands: `pnpm exec tsx
scripts/sample-observability-capacity.ts 60 10`, repeated vmalert rules and
uncached query probes, direct metrics counters, Grafana/app health,
`pnpm obs services --check`, `sources --check`, `jobs --check`, and `alerts`.

### Fifty-minute uptime follow-up (iteration 1213)

At 16:52 UTC the unchanged CPU-only trial had run for 52 minutes without
a restart. A 180.177-second sample starting at 16:49:09 measured 1.316%
whole-stack mean CPU and 750.21 MiB sampled peak memory. Metrics averaged
0.427% CPU, throttled 243/669 active periods, and recorded zero memory-high,
OOM or OOM-kill events. Checks and build overlapped the sample.

Seven thirty-second probes found all 23 rules healthy and both uncached
selectors returning one series; maximum query latency was 0.299 s. Backup
staleness evaluation advanced to 16:52:18 UTC without error. Admission-limit
hits, queue timeouts and slow queries remained zero. Cumulative small-storage
merged rows reached 1,914,990; indexdb remained 6,528 and large-storage zero.
No comparable single five-million-row merge was observed; Metrics recovery remains open. No service restart or runtime change was made.

Commands: `pnpm exec tsx scripts/sample-observability-capacity.ts 18 10`;
seven vmalert rules/uncached query probes using the selectors above; metrics
counters; Grafana/app health; `pnpm obs services --check`, `sources --check`,
`jobs --check`, and `alerts`. Full checks and build also passed.

### One-hour uptime follow-up (iteration 1214)

The unchanged CPU-only trial reached 65 minutes without a restart. From
16:55:47 UTC, a 600.553-second cgroup sample measured 1.685% whole-stack
mean CPU and 756.21 MiB sampled peak memory, including checks and build.
Metrics averaged 0.547% CPU with 1,122/2,617 active periods throttled and
zero memory-high/OOM events. The shipper had one memory-high event; all
other units had zero, and no unit recorded an OOM or OOM kill.

Twenty-one thirty-second probes through 17:06:02 UTC found all 23 rules
healthy and both uncached selectors returning one series; maximum latency
was 0.101 s. Backup staleness evaluated successfully at 17:00:48 UTC.
Admission-limit hits, queue timeouts and slow queries remained zero.
Small-storage merged rows reached 2,194,548 cumulatively, indexdb 13,122,
and large-storage zero. No comparable single five-million-row merge was
observed. Metrics recovery remains open; no runtime changes
or restarts were made.

Commands: `pnpm exec tsx scripts/sample-observability-capacity.ts 60 10`;
21 vmalert rules/uncached query probes using the selectors above; metrics
counters; Grafana/app health; `pnpm obs services --check`, `sources --check`,
`jobs --check`, and `alerts`. `pnpm check` and `pnpm build` passed.

### Seventy-minute follow-up (iteration 1215)

From 17:08:02 UTC, a 300.271-second cgroup sample measured 1.322%
whole-stack CPU and 754.98 MiB sampled peak memory. Metrics averaged
0.411% CPU, with 364/1,114 active periods throttled. Every sampled unit
recorded zero memory-high, OOM and OOM-kill events. Checks/build overlapped
the sample; the CPU-only trial remained unchanged without restart.

Nine thirty-second probes found all 23 rules healthy and both uncached
selectors returning one series. Maximum latency was 0.401 seconds; backup
staleness evaluated successfully at 17:11:48 UTC. Admission-limit hits,
queue timeouts and slow queries remained zero. Small-storage merged rows
reached 2,281,811 cumulatively, indexdb 13,122 and large-storage zero.
No comparable single five-million-row compaction was observed; Metrics recovery remains open. Services, sources, jobs and both
app/Grafana health endpoints passed. No paid calls or runtime changes.

Commands: `pnpm exec tsx scripts/sample-observability-capacity.ts 30 10`;
vmalert rules and uncached selectors above; metrics counters;
`pnpm obs services --check`, `sources --check`, `jobs --check`, `alerts`;
app/Grafana health; `pnpm check`, `pnpm build`, `pnpm format`,
`pnpm lint:fix`, `git diff --check`.

### Two-hour follow-up (iteration 1223)

The CPU-only trial remained unchanged from 16:00:24 UTC with zero restarts.
A 180.171-second cgroup sample beginning 18:16:42 UTC measured 1.335%
whole-stack CPU and 715.40 MiB sampled peak memory while checks ran.
Metrics averaged 0.450% CPU, throttling 269/684 active periods. Every
sampled unit recorded zero memory-high, OOM and OOM-kill events.

All 23 rules were healthy at both endpoint checks. Uncached self-scrape
and API-unit selectors returned one series in 0.235/0.002 seconds;
Grafana and app health passed. Admission-limit, queue-timeout and slow-query
counters stayed zero. Small-storage merged rows reached 4,362,390
cumulatively, indexdb 20,222 and large-storage zero. No comparable single
five-million-row compaction was observed; Metrics recovery remains open. No runtime settings, services or production records changed.

Commands: `pnpm exec tsx scripts/sample-observability-capacity.ts 18 10`;
vmalert rules, uncached selectors and metrics counters; Grafana/app health;
`pnpm obs services --check`, `sources --check`, `jobs --check`, `alerts`.

### Correlated recovery probe (iteration 1224)

`pnpm exec tsx scripts/sample-metrics-recovery.ts 6 30` now emits a baseline
and six thirty-second JSONL observations from local read-only endpoints.
Each observation records small/big storage merge counters, process start,
query admission/timeouts/slow-query totals, rule health and uncached
self-scrape/API-unit query latency. Pair it with the existing cgroup sampler
for resource evidence. Neither command changes settings or forces merges.

The probe fails on HTTP/query failures, absent counters, process changes,
counter resets, unhealthy rules or rule evaluations older than two minutes.
Per-interval row deltas identify windows worth inspecting in the journal;
even five million rows in one interval can represent multiple merges and
non-atomic counters, so the output explicitly requires journal confirmation.
Cumulative totals alone never mark recovery. Offline tests cover cumulative
versus interval totals, multiple-merge ambiguity, resets and process changes.

Live verification (`2 30`) at 18:25:09–18:26:09 UTC captured small-storage
intervals of 171,517 and 3,476 rows, one merge each; big-storage remained
zero. All 23 rules stayed healthy/fresh; six uncached queries returned one
healthy series, maximum 0.167 seconds. Admission/timeouts/slow queries were
zero. A separate 60.038-second cgroup sample starting 18:24:32 measured
1.592% whole-stack CPU/717.79 MiB peak, metrics 0.619% CPU and 145/265
periods throttled; every unit had zero memory-high/OOM events. CPU trial
still starts at 16:00:24 with no restarts. No comparable merge observed;
Metrics recovery remains open.

### Paired three-minute observation (iteration 1225)

At 18:31:04–18:34:06 UTC, six thirty-second recovery intervals captured
seven small merges totaling 46,332 rows and no big merges. All 23 rules
remained healthy/fresh; fourteen uncached queries passed, maximum 0.581 s.
Admission-limit, queue-timeout and slow-query counters stayed zero.
The paired 180.177-second cgroup sample measured 1.297% whole-stack CPU
and 723.57 MiB sampled peak memory; metrics averaged 0.421% CPU with
232/653 active periods throttled. Every unit had zero memory-high/OOM events.
The trial still starts at 16:00:24 UTC with zero restarts. Services 14/14,
sources 36/36, jobs and app/Grafana health passed. No comparable natural
five-million-row compaction occurred; Metrics recovery remains open.

Commands: `pnpm exec tsx scripts/sample-metrics-recovery.ts 6 30` and
`pnpm exec tsx scripts/sample-observability-capacity.ts 18 10`;
`pnpm obs services --check`, `sources --check`, `jobs --check`, `alerts`;
app/Grafana health and metrics unit/journal checks. No runtime changes or paid calls.

### First post-restart admission hit (iteration 1226)

Read-only recovery observation beginning 18:36:47 UTC saw the admission-limit
counter rise from zero to one, first sampled at 18:38:49. Queue timeouts and
slow queries remained zero, all 23 rules stayed healthy/fresh, and uncached
health queries succeeded. An admission-limit hit alone does not establish a
failed query; this does end the earlier zero-admission-hit observation.
The paired 60.052-second cgroup sample beginning 18:37:37 measured 1.838%
whole-stack CPU/721.63 MiB peak; metrics 0.612% CPU, 128/278 periods throttled.
Every unit recorded zero memory-high/OOM events. Metrics remains unchanged
since 16:00:24 UTC with zero restarts. No comparable natural large compaction;
Metrics recovery remains open. No settings or production writes.

Commands: `pnpm exec tsx scripts/sample-metrics-recovery.ts 6 30`;
`pnpm exec tsx scripts/sample-observability-capacity.ts 6 10`;
direct rules/counter reads, app/Grafana health and unit identity checks.

### Ten-minute paired observation (iteration 1227)

Recovery probe at 18:45:27–18:55:36 UTC captured fourteen small merges,
130,682 rows, no big merges, 23 healthy/fresh rules and 42 successful uncached
queries (maximum 1.076 s). Admission-limit hits rose from one to two, first
sampled at 18:54:34; queue timeouts and slow queries remained zero.
No comparable natural five-million-row compaction occurred.

The paired 600.547-second cgroup sample beginning 18:45:28 measured 1.680%
whole-stack CPU and 672.95 MiB sampled peak memory; metrics averaged 0.573%
CPU, with 1,220/2,670 active periods throttled. Every unit had zero memory-high,
OOM and OOM-kill events. Full CI/build ran during part of this observation.
The metrics trial still starts at 16:00:24 UTC with zero restarts. Services
14/14, sources 36/36, jobs, alerts and app/Grafana health passed. Metrics recovery remains open; no runtime changes or paid calls.

Commands: `pnpm exec tsx scripts/sample-metrics-recovery.ts 20 30` paired with
`pnpm exec tsx scripts/sample-observability-capacity.ts 60 10`;
`pnpm obs services --check`, `sources --check`, `jobs --check`, `alerts`;
app/Grafana health and metrics unit identity checks.

### Full trial history gap check (iteration 1229)

Read-only uncached metrics range queries cover 16:01:00–19:05:30 UTC on
Nov 7 at thirty-second steps (370 returned points per series). This checks
between the earlier short observation windows. Small-storage merged rows
rose from zero to 5,415,018 across 353 merges; the largest adjacent-point
increase was 908,421 rows at 16:24:00, followed by 653,727 at 17:32:30.
Big-storage merged rows stayed zero. No interval reached the five-million-row
candidate threshold; cumulative rows across many merges do not meet the gate.

The stored process-start series was constant at 1794067225, and every returned
self-scrape up value was one. Admission-limit hits rose twice, at 18:38:30 and
18:54:30; query timeouts and slow queries stayed zero. These are sampled stored
values, not continuous availability evidence. Alert execution/error counters
have no stored series under the queried names, so this history cannot establish
absence of rule-evaluation failures. Current rules are checked separately.
The metrics unit reports the unchanged 16:00:24 start and zero restarts.
Metrics recovery remains open; no forced compaction or runtime change.

Command: Python urllib requests to local `/metrics/api/v1/query_range` with
`start=1794067260`, `end=1794078330`, `step=30s`, `nocache=1` for
`vm_rows_merged_total` (small/big), `vm_merges_total` (small), process start,
self-scrape up, admission-limit, queue-timeout and slow-query counters.

### Detect cleared evaluation failures during recovery (iteration 1230)

The evaluator exposes `vmalert_execution_errors_total` and per-group
`vmalert_iteration_missed_total`, but scrape.yml has no evaluator target.
Correctly named range queries therefore return no stored series either.
The read-only recovery probe now reads these counters directly, sums missed
iterations across groups, and records interval deltas with evaluator process
identity. Restarts, resets and nonfinite counters invalidate the interval;
new errors or missed iterations mark `noNewFailures: false`, even when all
rules have already returned to healthy. Existing lifetime counts are a
baseline, not evidence of a new failure. No scrape configuration changed.

At 19:13:55–19:14:55 UTC, three samples showed unchanged evaluator identity,
14 lifetime execution errors and 25 lifetime missed iterations (zero deltas).
All 23 rules were healthy/fresh; six uncached queries passed, maximum 0.162 s.
Two small merges covered 7,015 rows; big-storage stayed zero. Admission hits
stayed two, queue timeouts/slow queries zero. Metrics still starts at 16:00:24
with zero restarts. No comparable compaction; app deployment follows STEERING 49.

Commands: `pnpm exec tsx scripts/sample-metrics-recovery.ts 2 30`;
local evaluator `/metrics`, stored range queries and journal since trial start;
`pnpm obs services --check`, `sources --check`, `jobs --check`, `alerts`;
app/Grafana health. Offline tests cover cleared failures and invalid intervals.

### Hourly passive recovery check (iteration 1236)

Nov 7 20:15:10–20:15:40 UTC: all 23 rules healthy/fresh, four uncached
queries passed (maximum 0.098 s), zero new evaluator errors/missed iterations.
Admission-limit hits remained two; queue timeouts and slow queries stayed zero.
No small or big merges occurred in the interval, so the comparable-compaction
gate remains untested. Metrics still starts at 16:00:24 UTC with zero restarts.
No limits, scrape configuration or services changed. Next passive check no
sooner than 21:15 UTC; app deployment remains independent under STEERING 49.

Commands: `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`;
`systemctl show obs-metrics.service -p ActiveEnterTimestamp -p NRestarts`;
`pnpm obs alerts`, `services --check`, `sources --check`, `jobs --check`;
app and Grafana health endpoints.

### Overnight recovery history and hourly probe (iteration 1337)

Nov 7 19:05:30–Nov 8 10:25:30 UTC: eight uncached range queries returned
1,841 points each at 30-second steps, with no returned timestamp gaps or
counter resets. Small-storage merged rows increased 34,728,242 across 2,002
merges. The largest adjacent increase was 4,454,018 rows; no interval met the
five-million-row candidate threshold. Big-storage rows stayed zero. Process
identity stayed constant, sampled self-scrape values were all one, admission
hits stayed two, and query timeouts/slow queries stayed zero. This fills the
overnight stored-history gap; it does not establish continuous availability or
historical evaluator health (those counters are not scraped).

Nov 8 10:26:09–10:26:40 UTC: all 23 rules healthy/fresh, four uncached queries
passed (maximum 0.803 s), zero new evaluator errors/missed iterations, and no
small/big merges. Metrics retains its Nov 7 16:00:24 start with zero restarts.
Recovery remains open pending comparable natural compaction. No limits or
configuration changed; next passive probe no earlier than 11:26 UTC.

Commands: Python urllib GETs to local `/metrics/api/v1/query_range` with
`start=1794078330`, `end=1794133530`, `step=30s`, `nocache=1`, querying small
rows/merges, big rows, process start, self-scrape up, admission hits, queue
timeouts and slow queries; `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`;
`systemctl show obs-metrics.service -p ActiveEnterTimestamp -p NRestarts`;
`pnpm obs alerts`, `services --check`, `sources --check`, `jobs --check`;
app `/healthz` and Grafana's configured local `/grafana/api/health`.

### Nov 8 late-morning recovery history (iteration 1343)

Nov 8 10:25:30–11:26:00 UTC: eight uncached range queries returned 122
points each at 30-second steps, without returned timestamp gaps or counter
resets. Small-storage merged rows increased 2,287,725 across 122 merges;
the largest adjacent increase was 965,106 rows. No interval met the
five-million-row candidate threshold; big-storage rows stayed zero. Process
identity stayed constant, sampled self-scrape values were all one, admission
hits stayed two, and query timeouts/slow queries stayed zero.

Commands: the same eight local `/metrics/api/v1/query_range` GETs as iteration
1337, with `start=1794133530`, `end=1794137160`, `step=30s`, `nocache=1`.
Recovery remains open pending comparable natural compaction; no configuration
or limits changed.

Nov 8 11:26:07–11:26:37 UTC: `pnpm exec tsx
scripts/sample-metrics-recovery.ts 1 30` reports all 23 rules healthy/fresh,
four uncached queries passing (maximum 0.278 s), zero new evaluator errors
or missed iterations, and 31,684 rows across two small merges. No big merges.
Metrics retains its Nov 7 16:00:24 systemd start with zero restarts. App and
Grafana health pass. Next passive check no earlier than 12:26 UTC.

### Natural large compaction confirmed (iteration 1470)

Stored history for Nov 8 11:26–Nov 9 04:26 UTC contains 2,041 points per
series at 30-second steps, with no returned gaps or metrics-process resets.
Small-storage rows increased 39,882,321 over 1,932 merges (largest adjacent
increase 4,896,807). Big-storage rows increased 49,279,202. The metrics journal
confirms one natural 13-part/49,279,202-row merge completed Nov 8 17:48:00.851
UTC in 164.103 seconds. This supplies the previously missing comparable merge.
Self-scrape samples stayed one; admission hits stayed two; queue timeouts and
slow queries stayed zero. Metrics still has its Nov 7 16:00:24 start, no restarts.

During 17:40–17:55 UTC, 31 stored resource samples show whole-stack memory
672.3–686.8 MiB and five-minute CPU rates 1.234–2.361%; metrics memory
73.5–87.8 MiB and CPU 0.371–1.378%. No limits or configuration changed.
The alert evaluator journal has no warnings in that window, but historical
per-rule health and evaluator error/miss counters are not retained. Recovery
therefore remains open for correlated rule/query evidence rather than another
search for an unseen compaction; stored availability samples alone are insufficient.

Commands: eight uncached local `/metrics/api/v1/query_range` GETs as above,
`start=1794137160`, `end=1794198360`, `step=30s`; resource queries use
`news_digest_unit_memory_bytes` and CPU counter five-minute rates for system
`obs-*` units over 17:40–17:55 UTC; `journalctl -u obs-metrics.service` and
`-u obs-alerts.service` for that window. Current `sample-metrics-recovery.ts 1 30`
passes 23 fresh rules, four uncached probes (maximum 0.833 s), zero new evaluator
errors/misses. Health, Grafana health, services, all 36 sources and jobs pass.
Next passive check no earlier than Nov 9 05:27 UTC; keep it short and hourly.

### Hourly follow-up (iteration 1477)

Nov 9 05:27 UTC `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`:
23 fresh healthy rules, four uncached queries at most 0.710 s, zero new
evaluator errors or missed iterations. Two small merges processed 37,821 rows;
no big merge in this interval. No limits, configuration or services changed.
Recovery still needs correlated evidence during a comparable natural merge.
Next short passive check no earlier than 06:27 UTC.

### Hourly follow-up (iteration 1484)

Nov 9 06:27 UTC `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`:
23 fresh healthy rules, four uncached queries at most 0.083 s, zero new
evaluator errors or missed iterations. One small merge processed 3,644 rows;
no big merge in this interval. Limits, configuration and services unchanged.
Recovery still needs correlated evidence during a comparable natural merge.
Next short passive check no earlier than 07:27 UTC.

### Passive follow-up (iteration 1550)

Nov 9 16:18 UTC `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`:
23 fresh healthy rules, four uncached queries at most 0.186 s, zero new
evaluator errors or missed iterations. Neither storage tier merged during
the interval. Recovery still needs correlated evidence during a comparable
natural merge; the earlier confirmed compaction remains valid evidence.
No limits, configuration or services changed. Next short passive check no
earlier than 17:18 UTC.

### Passive follow-up (iteration 1582)

Nov 9 21:36 UTC `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 10`:
23 healthy rules, four uncached queries at most 0.438 s, zero new evaluator
errors or missed iterations, queue timeouts or slow queries. Neither storage
tier merged; process starts unchanged. Recovery still needs correlated evidence
during a comparable natural merge. Limits/configuration unchanged; next passive
check no earlier than 22:36 UTC.

### Passive follow-up (iteration 1588)

Nov 9 22:36 UTC `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 10`:
23 healthy rules, four uncached queries at most 0.031 s, zero new evaluator
errors or missed iterations, queue timeouts or slow queries. Neither storage
tier merged; process starts unchanged. Recovery still needs correlated evidence
during a comparable natural merge. Limits/configuration unchanged; next passive
check no earlier than 23:36 UTC.

### Passive follow-up (iteration 1600)

Nov 10 00:41 UTC `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`:
23 fresh healthy rules, four uncached queries at most 0.590 s, zero new
evaluator errors or missed iterations, queue timeouts or slow queries. Neither
storage tier merged; process starts unchanged. Recovery still needs correlated
evidence during a comparable natural merge. Limits/configuration unchanged;
next short passive check no earlier than 01:41 UTC.

### Passive follow-up (iteration 1604)

Nov 10 01:41 UTC `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`:
23 healthy rules, four uncached queries ≤0.537 s, no new evaluator errors or
missed iterations, no restarts/query timeouts/slow queries. One small 3,690-row
merge and no large-tier merge; no comparable recovery window. Limits unchanged;
next short passive probe no earlier than 02:42 UTC.

### Passive follow-up (iteration 1611)

Nov 10 02:46–02:47 UTC `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`:
23 healthy rules, four uncached queries ≤0.631 s, no new evaluator errors or
missed iterations, query timeouts or slow queries; process starts unchanged.
One small merge processed 18,232 rows; no large-tier merge. Comparable natural
merge recovery remains unproven. Limits/configuration unchanged; next short
passive probe no earlier than 03:48 UTC.

### Passive follow-up (iteration 1626)

Nov 10 06:12 UTC `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`:
23 healthy rules, four uncached queries ≤0.272 s, no new evaluator errors or
missed iterations, query timeouts or slow queries; process starts unchanged
during the sample. One small merge processed 3,395 rows; no large-tier merge.
Comparable natural-merge recovery remains open. Limits/configuration unchanged;
next short passive probe no earlier than 07:13 UTC.
