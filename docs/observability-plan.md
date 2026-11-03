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

- [x] **O1 Structured logging.**
  - Completed in iterations 343–354: API/worker request/job/fatal logs, all six provider targets, budget/reserve decisions and edition stages. `pnpm exec tsx scripts/check-observability.ts --verify-o1` verifies runtime fields and nine offline suites, including forced fatal children and redaction. Provider/edition paths absent from the live sample are verified offline; no paid run is triggered. Migration CLI console output is outside API/worker runtime scope.
  - **Scope:** pino, request logs, correlation IDs, redaction, error handlers
    and external-call logs in the API and worker. Replace stray
    `console.*` calls.
  - **Done when:**
    - every request and job writes a JSON line;
    - the redaction test passes;
    - a forced uncaught error is logged with its stack.
- [x] **O2 Logs store.**
  - Iteration 355: pinned VictoriaLogs/Fluent Bit, four app journals plus production Postgres/Redis and supervisor logs; loopback store and private `/logs/` forwarding. Retention 14 days, 1.8 GB partition pruning and a hard 2 GB filesystem; bounded 32 MB shipper buffer. `--verify-o2` checks seven actual sources, fresh request delivery under 60 s, limits and isolated redaction. Quieter services use existing entries; supervisor backfill uses collection timestamps. No Codex transcripts or provider calls.
  - **Scope:** VictoriaLogs, journal shipping, container and supervisor logs,
    `/logs/`.
  - **Done when:**
    - a test line from each service can be queried within 60 s;
    - the retention period and the 2 GB cap are set.
- [x] **O3 Jobs UI.** bull-board at `/queues/`, read-only. Iteration 356: four existing queue connections, 35 live schedules, hidden mutation controls and HTTP write barrier. `--verify-o3` checks queues/schedules/read-only enforcement; desktop/mobile screenshots verify overview and scheduler navigation. No new service, polling collector or production pipeline change.
- [x] **O4 Metrics store and host.** Iteration 357: SHA-256-pinned VictoriaMetrics 1.155.0/node_exporter 1.12.1, loopback-only store/exporter, private `/metrics/vmui/`. Host samples and nine explicit app/agent/observability units expose active state, CPU, memory, tasks and restarts; atomic textfile snapshots every 30 s. Retention 30 days, hard 700 MB filesystem and 50 MB free-space ingestion guard. Bounded memory/CPU/query concurrency; `--verify-o4`, installer reconciliation and desktop/mobile real-sample checks pass. No agent-control edits or product/provider changes.
- [x] **O5 App metrics.** `prom-client` endpoints on all Node services, plus
      queue metrics. Done when HTTP, event-loop, external-call and job metrics
      are scraped.
  - Iteration 358: API/worker runtime metrics on separate loopback listeners
    (9464/9465), fixed service labels and 30-second scraping. Remaining:
    external-call and queue/job metrics.
  - Iteration 359: API HTTP duration/count histogram uses route templates, bounded
    methods/statuses and completion/disconnect; offline privacy/deduplication
    coverage and runtime health-request sample checks.
  - Iteration 360: docs/schema runtime listeners on loopback 9466/9467,
    fixed labels and 30-second scraping; offline listener/privacy coverage and
    live assertions for all four Node services.
  - Iteration 361: worker job attempt duration/count by allowlisted queue/name and
    completion/failure; retries counted separately. Offline behavior/privacy coverage
    and scraped scheduled heartbeat assertion. Provider and queue-state metrics remain.
  - Iteration 362: shared HTTP attempt duration/count for feed, Hacker News and
    official X embeds, with bounded target/status/outcome labels. Offline cache,
    redirect, failure and privacy assertions plus live registry checks via
    `--verify-external-http-metrics`. Anthropic/xAI/Bluesky and queue-state metrics remain.
  - Iteration 363: Anthropic/xAI/Bluesky fetch attempts added to the fixed-target
    histogram; durations end at headers, retries/auth requests counted separately.
    Offline transport identity, status/error and privacy checks; queue-state metrics remain.
  - Iteration 364: API scrape-time retained queue jobs by six states, recurring
    schedule counts and pause state on existing connections. Fixed queue labels;
    failed reads return a failed scrape, with offline recovery/privacy verification.
    `--verify-queue-metrics --verify-o4` checks runtime and stored samples across
    all four queues. All O5 families are scraped; paid-provider paths verified offline.
- [ ] **O6 Dashboards.**
  - Iteration 365: provisioned pinned Grafana with local metrics datasource and Host, Services, HTTP and Jobs dashboards; private `/grafana/`, Viewer-only access, bounded resources. `--verify-grafana` verifies panel queries and browser screenshots. Database, Redis, Product and Agent dashboards remain open; O6 is not complete.
  - Iteration 366: Errors and logs dashboard adds six existing-metric panels and links to retained logs/queues. No new collection or browser error reporting; verified with live queries and screenshots.
  - Iteration 367: Product adds six read-only Postgres tables for spend/holds, edition modes, source freshness, article coverage, X verification and reserve lifecycle. Dedicated column-granted reader, two Grafana connections (three role connections including verification) and five-second timeout. Configured caps/reserve amounts and worker timing remain in app Status; no inferred budget values. Database/Redis/Agent dashboards remain open.
  - Iteration 368: Database adds five read-only current-statistics tables for activity/cache, size, row estimates, maintenance and aggregate locks. Same restricted reader; no SQL/session details, new grants or DB restart. Desktop/mobile and all live queries verified. Top queries remain O7; Redis/Agent and full Product coverage remain open.
  - Iteration 369: Product adds per-source 24-hour article coverage including zero counts, and seven retained edition snapshots with story/post totals and AI mode counts. Existing column grants only; response counts are not new-item yield and snapshot timestamps are not worker duration.
  - Iteration 370: Product adds edition-ID-attributed Anthropic charges, call counts and unresolved holds for the latest seven snapshots. No timestamp attribution; excludes X discovery and unpublished attempts. Reader adds only edition/run ID columns; caps and worker timing remain open.
  - **Scope:** Grafana at `/grafana/`, with datasources and dashboards
    provisioned from `ops/observability/grafana/`.
  - Iteration 371: App runtime adds API/worker resident memory, V8 heap used/allocated, descriptor count/limit use and GC pause rate from existing scrapes. Read-only, no new collector or app restart; desktop/mobile verified. Redis/Agent and remaining Product caps/timing remain open.
  - Iteration 372: App runtime adds per-process CPU as a percentage of one core, active event-loop handles, libuv requests and asynchronous resources. Existing scrapes only; counts are not HTTP traffic. Desktop/mobile verification covers the added panels.
  - **Dashboards:** Host, Services, HTTP, Jobs, Database, Redis, Errors and
    logs, Product, Agent.
  - **Done when:** every dashboard renders with no panel errors (screenshot
    check).
  - Iteration 373: App runtime adds event-loop p99 and maximum delay for all four Node services, using existing scrapes. Panels explain the per-scrape window and approximately 10 ms sampling floor; desktop/mobile verification covers delay. No app changes.
    O6 incremental progress (375): Product graphs rolling 24-hour edition worker mean
    attempt duration and estimated attempt counts by name/outcome from existing metrics.
    No samples before observed attempts; cached/fallback/reused work and retries are
    included, queue wait excluded. Individual run timing and caps remain in app Status.

  - Iteration 376: Product source coverage adds topic names and inclusive rolling seven-day counts alongside 24-hour counts, including quiet sources. Uses existing reader grants; no collection or production changes.

- Iteration 377: Product adds latest-edition story/post selection counts, stored triage/unscored coverage, modes and reasons per topic. Missing metadata remains blank; no fresh-call or rejected-candidate inference. Existing restricted grants only.

- [ ] **O7 Database and Redis.**
  - Iteration 374: Redis collector and O6 Redis dashboard shipped. Pinned/checksummed redis_exporter v1.96.0, loopback INFO-only, 30-second scraping, 32 MB/2% CPU ceiling; no key scanning, app or Redis restart. Eight panels and desktop/mobile checked. Postgres exporter/top queries remain open.
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

O1 incremental progress (349): Anthropic budget admissions/refusals log estimates
and attempts; settlements log cost, failures distinguish released and uncertain
holds. Cache reuse is omitted; logs follow successful ledger operations and omit
content. Refusal reasons are not inferred. Discovery/reserve budget decisions and
edition steps remain open; no O1 completion claim.

O1 incremental progress (350): X discovery admission/refusal, settlement and
failure holds log run/topic IDs and search type after ledger operations. Credit
exhaustion records the provider block; request content is omitted. Offline
coverage includes ledger/storage errors and higher input pricing. Scheduled
reserve decisions and edition steps remain open.

O1 incremental progress (351): Anthropic reserve admission logs report the locked
policy state, protected funds, effective availability and committed admission
outcome without request content. Separate early verification-cap refusals do not
evaluate the reserve. Reserve lifecycle transitions and edition steps remain open.

O1 incremental progress (352): reserve lifecycle transactions log committed
observations and applied/unchanged fenced transitions, including retries and
publication reconciliation. Rollbacks produce no lifecycle entry; edition
content and outcome reasons are omitted. Edition steps remain before O1 completion.

O1 incremental progress (353): edition attempts now log start, deduplicated overall
and topic stages, returned publication/reuse and failure with elapsed time.
Topic names, content and exception messages are omitted. Offline tests cover
repeated snapshots, progress callbacks, reuse and failures; the runtime checker
reports observed edition events without triggering a paid run. Final O1 scope
verification remains before ticking completion.

O1 completion (354): runtime checker validates service/severity/time and request/job
fields, and optionally runs nine offline logging suites with disabled provider
credentials and DB/Redis. Forced exceptions/rejections run only in child processes.
Runtime sample: 470 structured records, feed/HN/oEmbed calls and reserve lifecycle
entries; no fresh paid provider or edition events. API/worker measured 46/59 MiB
and 0.6/0.9% average CPU since startup; no added services or log-store disk.

O6 incremental progress (378): Product reserve lifecycle shows its last durable update
and minutes past schedule for open states. Settled rows have no overdue value;
this is neither a heartbeat nor a failure/worker-duration measurement.

O6 incremental progress (379): Product provider spend adds pending/uncertain call
counts across all days and oldest unresolved hold age from call creation. Both
providers remain visible with zero totals when their ledgers are empty; no
unresolved calls means no age. Existing reader grants only; configured caps
and available funds remain in app Status. Synthetic read-only SQL and live
queries cover empty and mixed-state ledgers.

O6 incremental progress (380): Product provider spend includes succeeded/failed call counts for the UTC creation day. Current ledger outcomes only; cache reuse and refused admissions create no row, and uncertain transport failures remain separate. Existing reader grants only.

O6 incremental progress (381): Product adds the latest 30 X discovery calls in seven days, with reservation-time topic/search type, current status, settled cost/holds and reported fetched counts. Null counts stay unknown; fetched posts are not verified yield. Restricted reader gains only the five required operational columns.

O6 incremental progress (382): X call history adds safe failure reason, recorded outcome time and reservation-to-outcome elapsed seconds. Pending values stay blank; uncertain outcomes retain holds. Ledger elapsed includes local work, not provider HTTP latency or subsequent official verification. Reader gains only two operational columns.

O6 incremental progress (383): Product adds the latest 30 Anthropic ledger admissions in seven days, including unpublished attempts, with run/model/purpose/status, settled cost and unresolved hold. Cache hits and refused requests are absent; null cost is unknown. Reader gains only ID/model/purpose columns.

O6 incremental progress (384): Anthropic history adds recorded outcome time and reservation-to-outcome seconds. Pending values stay blank; uncertain outcomes retain holds. Ledger elapsed includes local work and is not HTTP latency or edition duration. Reader gains only completed_at.

O6 incremental progress (385): Product graphs API startup-configured Anthropic/X daily and monthly ceilings in USD. Fixed provider/period labels, no database or ledger locks and no provider calls. Ceilings are not the paced daily allowance, reserve or available funds; these remain on Status.
