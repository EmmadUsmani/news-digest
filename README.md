# news-digest

A personal news and social digest. Every morning it publishes an edition: for
each topic, a short brief, the top stories and the most interesting X and
Bluesky posts.

A Codex agent builds this repo autonomously on an exe.dev VM. The owner steers
it through [STEERING.md](STEERING.md).

**Start with the [owner handbook](docs/handbook/README.md)**, which explains
how the app and the agent harness work.

## Links

The app and its tools are private, behind the exe.dev login.

| What               | Where                                                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App                | https://news-digest.exe.xyz/                                                                                                                                                                       |
| Handbook           | [/docs/](https://news-digest.exe.xyz/docs/), or [docs/handbook/](docs/handbook/README.md) on GitHub                                                                                                |
| DB explorer        | [/db/](https://news-digest.exe.xyz/db/)                                                                                                                                                            |
| Observability      | [/grafana/](https://news-digest.exe.xyz/grafana/), [/logs/](https://news-digest.exe.xyz/logs/), [/metrics/](https://news-digest.exe.xyz/metrics/), [/queues/](https://news-digest.exe.xyz/queues/) |
| Agent plan         | [MISSION.md](MISSION.md), [TASKS.md](TASKS.md), [PROGRESS.md](PROGRESS.md), [NEEDS_FROM_HUMAN.md](NEEDS_FROM_HUMAN.md)                                                                             |
| VM and agent setup | [BOOTSTRAP.md](BOOTSTRAP.md), [ops/agent-control/](ops/agent-control/README.md)                                                                                                                    |

## Run locally

You need Node 22, pnpm and Docker.

```sh
pnpm install --frozen-lockfile
docker compose up -d   # Postgres 17 + Redis 7 on loopback
pnpm build
pnpm migrate           # safe to repeat
pnpm check             # format, lint, types, boundaries, unit + integration tests
```

| Command                        | What it does                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| `pnpm test:unit`               | Fast offline tests; database access is blocked                                      |
| `pnpm test:integration`        | Fresh Postgres and Redis containers, all migrations from zero, real HTTP and BullMQ |
| `pnpm format`, `pnpm lint:fix` | Fix formatting and lint                                                             |

**Tests never call paid APIs or touch the live database.** Anything that
spends money needs an explicit opt-in variable, such as
`SMOKE_CREATE_EDITION=1` or `X_DISCOVERY_LIVE=1`.

## Production (on the VM)

The API (port 8000), worker, docs site and schema explorer run as systemd
**user** units named `news-digest-*`. Postgres and Redis run in Docker on
loopback. Secrets live only in `~/.config/news-digest/env` (mode 600), never
in the repo.

```sh
systemctl --user restart news-digest-api news-digest-worker
journalctl --user -u news-digest-api -u news-digest-worker -f
curl --fail http://localhost:8000/healthz
pnpm console   # production REPL with the app loaded; no web server or workers
pnpm obs alerts
```

To deploy: pull, then `pnpm build && pnpm migrate`, then restart the
services. Details, and how to connect a database client from your laptop, are
in [Operations](docs/handbook/01-app/08-operations.md).

## Useful scripts

All of these are read-only unless noted. Run them with
`pnpm exec tsx <script>`.

| Script                                | Purpose                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `scripts/report-edition-timing.ts`    | Duration, cost and AI or fallback mode of recent editions                |
| `scripts/report-x-discovery.ts [day]` | X search spend and yield for one UTC day (`report-x-week.ts` for 7 days) |
| `scripts/report-bluesky-coverage.ts`  | Stored Bluesky posts per topic over the last 24 hours                    |
| `scripts/check-handbook.ts`           | Renders every handbook page and checks schema metadata                   |
| `scripts/check-observability.ts`      | Checks the monitoring stack end to end                                   |
| `scripts/smoke-ui.ts`                 | Desktop and mobile screenshots of saved editions (paid only with opt-in) |

More smoke and diagnostic scripts live in `scripts/` and `apps/api/scripts/`.

## Docs

- [Architecture](docs/ARCHITECTURE.md): code layout, Drizzle data access,
  migrations.
- [LLM](docs/LLM.md): models, budgets, the scheduled reserve.
- [Ranking](docs/RANKING.md): ranking, triage and evaluation results.
- [Sources](docs/SOURCES.md): feeds, X accounts, Bluesky.
- [Database verification](docs/DATABASE-VERIFICATION.md): what the
  integration suite covers.
- [Decisions](docs/decisions/): design records.
