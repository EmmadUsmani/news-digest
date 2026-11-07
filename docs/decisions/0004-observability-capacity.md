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
