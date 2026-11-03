# Observability plan

Owner-approved design (2026-11-03) for STEERING item 24. Low priority:
work on it only when product work is done or blocked. It is split into
independent pieces (O1–O11). Tick a piece off here when it is shipped and
verified.

## Goal

See everything that happens on the VM: logs, errors, requests, jobs, host and
service resources, the database, Redis, product numbers and the agent
harness. Use only free, open-source tools running on the VM, with low
resource use and fixed retention. There must be:

- **UIs for the owner** in the browser, behind the exe.dev login;
- **query APIs and an `obs` CLI** for the agent and for Claude over SSH.

## Constraints

| Constraint             | Rule                                                                                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cost                   | Free, open-source, self-hosted. No paid services, no third-party log or metric hosting.                                                                           |
| Hosting                | Everything runs on the VM, bound to 127.0.0.1. The VM stays private.                                                                                              |
| CPU (2 cores)          | Under 5% of one core on average for the whole stack. Scrape every 30 s.                                                                                           |
| Memory (8 GB, no swap) | About 500 MB total for the stack. Every unit has `MemoryMax=`.                                                                                                    |
| Disk (11 GB free)      | About 3 GB total. Metrics 30 days, logs 14 days and 2 GB hard cap, journald `SystemMaxUse=500M`. Alert at 80% disk.                                               |
| Priority               | Observability services lose contention: `Nice=10`, low `CPUWeight=`/`IOWeight=`, `CPUQuota=`.                                                                     |
| Critical path          | Units are named `obs-*`, not `news-digest-*`, so the supervisor's health gate never blocks product work on them. Their health is reported through alerts instead. |
| Supply chain           | Official release binaries at pinned versions, verified with SHA-256. All config in `ops/observability/`, with an idempotent install script.                       |
| Secrets                | Never in logs, labels or dashboards. Redaction is enforced in code and tested.                                                                                    |
| Scheduled edition      | Never restart Postgres or Redis within 2 h of the 07:00 America/Los_Angeles edition.                                                                              |

## Stack

| Need                                           | Tool                                                    | Approx. RAM |
| ---------------------------------------------- | ------------------------------------------------------- | ----------- |
| Log store, query API and UI                    | VictoriaLogs                                            | 50–100 MB   |
| Metric store, scraper, query API and UI        | VictoriaMetrics (single node, `-promscrape.config`)     | 50–100 MB   |
| Dashboards (Prometheus + Postgres datasources) | Grafana, provisioned from the repo                      | 120–180 MB  |
| Host, systemd units, textfile metrics          | node_exporter (`--collector.systemd`, textfile dir)     | ~15 MB      |
| Postgres                                       | postgres_exporter, `pg_stat_statements`, slow-query log | ~20 MB      |
| Redis                                          | redis_exporter                                          | ~15 MB      |
| BullMQ                                         | bull-board inside the API (read-only), queue metrics    | ~0          |
| Log shipping                                   | systemd-journal-upload, or Fluent Bit if needed         | 10–20 MB    |
| Alerts                                         | vmalert, rules in the repo                              | ~20 MB      |

Not used, on purpose:

- **Sentry or GlitchTip:** too heavy. Errors are structured log lines with
  stacks, an Errors dashboard and an alert.
- **Loki or Prometheus:** heavier than the Victoria tools for the same job.
- **Automatic OpenTelemetry tracing:** too much CPU on 2 cores. Correlation
  IDs in logs come first; see O11.

Swapping a tool needs a short note in `docs/decisions/`.

## Access

| Who      | How                                                                                                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner    | `/grafana/`, `/logs/` (VictoriaLogs UI), `/metrics/` (VictoriaMetrics UI) and `/queues/` (bull-board), forwarded by the API like `/docs/` and `/db/`. All sit behind the exe.dev login. |
| Agent    | Local query APIs plus `obs`: `obs errors --since 1h`, `obs logs --service worker --grep x_search`, `obs metric '<PromQL>'`, `obs jobs`, `obs alerts`.                                   |
| Claude   | The same `obs` CLI over SSH.                                                                                                                                                            |
| Fallback | If the API is down: `ssh -L <port>:localhost:<port> news-digest.exe.xyz`. The handbook lists the ports.                                                                                 |

Notes on serving:

- **Sub-paths.** Grafana needs `root_url` and `serve_from_sub_path`, and its
  live websocket should be disabled. The Victoria tools take
  `-http.pathPrefix`. `proxyInternalTools` needs an option to keep the
  prefix, instead of stripping it, for tools configured this way.
- **Grafana login.** Use anonymous Viewer access behind the exe.dev login.
  Keep the admin password in `~/.config/news-digest/env`.

## What to observe

1. **Logs (base layer).**
   - **pino JSON logs** in the API and worker, written to stdout and the
     systemd journal.
   - **What gets a log line:**
     - every HTTP request: method, route, status, duration;
     - every job start, finish, failure and retry;
     - every external call, with target, duration, outcome and cost if any:
       feeds, Hacker News, Anthropic, xAI, X oEmbed, Bluesky;
     - budget admissions and refusals;
     - edition pipeline steps;
     - `uncaughtException` and `unhandledRejection`, with stacks;
     - Nest exception filters;
     - browser errors (O10).
   - **Fields on every line:** `service` and `level`, plus whichever of
     `requestId`, `jobId`, `queue`, `runId`, `topic` and `editionId` apply.
     They are carried through with AsyncLocalStorage.
   - **Redaction:** auth headers, cookies, tokens, API keys and anything read
     from the env file are redacted, with a unit test that proves it.
   - **Also shipped:**
     - the docs and schema services;
     - Postgres and Redis container logs, including Postgres slow queries
       (`log_min_duration_statement=250ms`);
     - `~/agent-control/logs/supervisor.log`, but not the Codex `.jsonl`
       transcripts.
2. **Host and services.**
   - CPU, memory, disk, IO, network, load and file descriptors.
   - Per systemd unit: state, restarts, CPU and memory.
   - Docker container CPU and memory, from cgroups or the textfile
     collector. Don't add cAdvisor unless it fits the budget.
3. **App internals.** `prom-client` on each Node service, exposed on a
   loopback-only `/metrics` endpoint:
   - default metrics: event-loop lag, heap, GC, handles;
   - HTTP request rate, errors and latency per route;
   - external call duration and outcome per target.
4. **Jobs.**
   - Queue counts by state: waiting, delayed, active, completed, failed,
     paused.
   - Job duration and failure count by name.
   - Scheduled and repeatable jobs with their next run time.
   - Last success time of each scheduled job.
5. **Database.**
   - Connections, locks, cache hit rate, table and index sizes, dead rows
     and vacuum.
   - `pg_stat_statements` top queries by total and mean time.
   - The slow-query log.
6. **Redis.** Memory, keys, evictions, clients and commands.
7. **Product.** Grafana reads Postgres through a read-only role, with no new
   instrumentation:
   - edition runs: duration, AI or fallback, cost;
   - Anthropic and X spend against daily and monthly caps, and the reserve;
   - source health and articles per source;
   - social yield and verification by platform and topic.
8. **Agent harness.** The supervisor writes a node_exporter textfile with:
   - iteration count, result, duration;
   - tokens and weekly quota %;
   - commits per iteration;
   - pacing waits and no-progress streak.

## Pieces

Do roughly in this order. Each piece must be useful on its own and is done
only when its check passes.

- [ ] **O1 Structured logging.**
  - API/worker JSON request, job and fatal-error logging with context and redaction shipped in iteration 343. Feed/Hacker News HTTP attempts added in iteration 344 (status, outcome, duration and inherited context; no URLs/bodies). Other provider calls, budget decisions and edition steps remain before O1 can be ticked.
  - **Scope:** pino, request logs, correlation IDs, redaction, error handlers
    and external-call logs in the API and worker. Replace stray
    `console.*` calls.
  - **Done when:**
    - every request and job writes a JSON line;
    - the redaction test passes;
    - a forced uncaught error is logged with its stack.
- [ ] **O2 Logs store.**
  - **Scope:** VictoriaLogs, journal shipping, container and supervisor logs,
    `/logs/`.
  - **Done when:**
    - a test line from each service can be queried within 60 s;
    - the retention period and the 2 GB cap are set.
- [ ] **O3 Jobs UI.** bull-board at `/queues/`, read-only. Done when every
      queue and its scheduled jobs are visible.
- [ ] **O4 Metrics store and host.** VictoriaMetrics, node_exporter and
      `/metrics/`. Done when host and per-unit metrics are queryable and 30-day
      retention is set.
- [ ] **O5 App metrics.** `prom-client` endpoints on all Node services, plus
      queue metrics. Done when HTTP, event-loop, external-call and job metrics
      are scraped.
- [ ] **O6 Dashboards.**
  - **Scope:** Grafana at `/grafana/`, with datasources and dashboards
    provisioned from `ops/observability/grafana/`.
  - **Dashboards:** Host, Services, HTTP, Jobs, Database, Redis, Errors and
    logs, Product, Agent.
  - **Done when:** every dashboard renders with no panel errors (screenshot
    check).
- [ ] **O7 Database and Redis.**
  - **Scope:** postgres_exporter, `pg_stat_statements`, slow-query log and
    redis_exporter. The Postgres restart is scheduled at least 2 h away from
    the edition.
  - **Done when:** the Database dashboard shows the top queries.
- [ ] **O8 Agent harness metrics.** The textfile is written by
      `control.py`/`run.sh`. Done when the Agent dashboard is populated.
- [ ] **O9 Alerts and `obs` CLI.**
  - **Scope:** vmalert rules for:
    - disk over 80%;
    - a `news-digest-*` or `obs-*` unit down;
    - error rate;
    - job failures;
    - a missed scheduled edition;
    - spend near a cap;
    - memory pressure;
    - an observability service over its budget.

    Plus the `obs` CLI, and an AGENTS.md line: run `obs alerts` at the
    start of each iteration, cheaply.

  - **Done when:** a test alert fires and `obs alerts` shows it.
- [ ] **O10 Browser errors.**
  - **Scope:** the web app reports `error` and `unhandledrejection` events
    to a rate-limited API endpoint that logs them.
  - **Done when:** a test browser error can be found in the logs.
- [ ] **O11 Optional.** Lightweight tracing, or a Caddy front door so the UIs
      work while the API is down. Only with measured overhead within budget and
      a decision note.

## Verification

`scripts/check-observability.ts` is read-only, like `check-handbook.ts`, and
grows with each piece. It checks that:

- every `obs-*` unit is active and under its memory budget;
- every scrape target is up;
- a test log line and a test error from each service can be found;
- bull-board lists every queue;
- every dashboard renders without panel errors, saving screenshots;
- retention flags are set and observability disk use is under the cap.

Each piece ends with:

- this check passing;
- a note of the stack's measured RAM, CPU and disk;
- an update to the handbook's Observability page, which the first piece
  creates in the App section, and to `schema-meta.json` if a read-only role
  or table changes.

O1 incremental progress (345): Anthropic attempts include retry outcomes, run context,
token usage and computed cost. Provider bodies/prompts are omitted; ledger remains
authoritative. Other providers, budget decisions and edition steps remain open.

O1 incremental progress (346): official X oEmbed HTTP attempts now have their own
`x-oembed` target, including failures, with cache omission and inherited context.
Mocked tests verify categorization and omission of post URLs and embed bodies.
HTTP success does not assert subsequent embed validation success.

O1 incremental progress (347): xAI attempts log model/search type, status, duration,
outcome and safe failure reason, plus successful token/fetched-item/citation counts.
Malformed responses and transport failures are covered with synthetic tests; no
request/provider text is logged. Discovery ledger remains authoritative for cost.

O1 incremental progress (348): Bluesky login, refresh and search attempts log
status, duration and outcome with inherited context. No credentials, queries,
URLs, response content or provider exceptions are logged. Budget decisions and
edition steps remain before O1 completion.
