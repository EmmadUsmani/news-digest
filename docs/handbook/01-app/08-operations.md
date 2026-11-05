# Operations

## URLs

Reader: `/`. Management: `/admin`, with Overview, Editions, Sources, Topics, Schedule, Spend and Tools navigation (mobile menu).
APIs use `/api/admin/*`; old API paths return 404. `/admin`, its APIs and every tool below require [admin identity](01-stack-and-runtime.md#admin-identity). `/api/me` reports access.
Local scripts read `ADMIN_LOCAL_TOKEN` from the private env file and send it only
to protected paths at `http://127.0.0.1:8000`, refusing redirects. Browser checks
receive response bodies through Node; credentials never enter Playwright.
Scenario checks replay writes in memory and compare saved data afterward.

| What               | URL                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Reader             | https://news-digest.exe.xyz/                                                             |
| Management         | https://news-digest.exe.xyz/admin                                                        |
| Health check       | https://news-digest.exe.xyz/healthz                                                      |
| Handbook           | https://news-digest.exe.xyz/docs/                                                        |
| DB schema explorer | https://news-digest.exe.xyz/db/                                                          |
| Monitoring         | `/grafana/`, `/logs/`, `/metrics/`, `/queues/`: see [Observability](09-observability.md) |

## Services (systemd user units on the VM)

| Unit                 | Runs                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| `news-digest-api`    | API + web UI on :8000; forwards the docs, DB explorer and monitoring UIs |
| `news-digest-worker` | All jobs and timers                                                      |
| `news-digest-docs`   | This handbook (loopback :8100)                                           |
| `news-digest-schema` | DB schema explorer (loopback :8200)                                      |
| `news-digest-agent`  | The build agent's supervisor (see [agent docs](../02-agent/README.md))   |

```bash
systemctl --user status 'news-digest-*'            # are they up?
systemctl --user restart news-digest-api news-digest-worker
journalctl --user -u news-digest-worker -n 100     # recent worker logs
docker compose ps                                  # Postgres + Redis
```

Backups: `~/backups/news-digest/`; [nightly timers and restore](10-backups.md).

## How to tell if things are healthy

- **New edition at `/admin/editions/new`:** choose 6 h, 24 h, 7 d or a custom window; uses AI budget, shows topic progress and links to the saved result.
- **Editions at `/admin/editions`:** saved windows, per-topic story/post modes and retained job type, attempts and final-attempt duration; open an edition for recorded AI cost and unresolved holds by model/purpose, inspect topic stories, scores, selection reasons, grouping and source evidence, browse retained articles published in the window (up to 500 per topic, using current source connections), or view it as a reader.
- **Topics at `/admin/topics`:** drag or arrow ordering, enable controls, story/post budgets and New topic dialog. Open a topic for guidance, budgets, phrase filters, X accounts, Reddit communities, connected feeds and news queries, or deletion. Overview links here for topic and source settings.
- **Schedule at `/admin/schedule`:** next run, daily local time, timezone, coverage and default topic budgets.
- **Sources at `/admin/sources`:** collection health, timestamps, last-response/stored counts and platform status.
- **Overview at `/admin`:** health, daily spend, latest edition, source issues and next runs.
- **`/healthz`:** 200 when Postgres and Redis respond; `pnpm obs alerts` and [Grafana](09-observability.md) cover the rest.

Read-only checks: `pnpm exec tsx <script>`. Protected API reads use the private local admin token:

| Script                               | Shows                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/report-edition-timing.ts`   | Recent editions: duration, cost, AI or fallback, picks per platform. Add `--scheduled-only --limit 20` for scheduled history                                                                                                                                                                                                                                                                                                       |
| `scripts/report-x-discovery.ts`      | X search spend and yield for a UTC day (`report-x-week.ts` for seven days)                                                                                                                                                                                                                                                                                                                                                         |
| `scripts/smoke-admin-gate.ts`        | Admin denial/local access; `smoke-invalid-edition.ts` and `smoke-missing-edition.ts` check link recovery; `smoke-history-recovery.ts` checks archive paging; `smoke-history-refresh.ts` checks saved links during refresh failures; `smoke-edition-refresh.ts` checks cached-content refresh recovery; `smoke-reader-timeout.ts` checks timeout recovery; `smoke-reader-invalid-data.ts` checks schema and malformed-JSON recovery |
| `scripts/report-bluesky-coverage.ts` | Stored Bluesky posts per topic over the last 24 hours                                                                                                                                                                                                                                                                                                                                                                              |

## Production console

`pnpm console`, run from `~/news-digest` on the VM, opens a Node REPL with
the app loaded and a `[PRODUCTION]` prompt. It starts no web server, workers
or timers.

- **Available:** `app`, `get(Token)`, `db.query(sql, params)`, and
  repositories (`profiles`, `topics`, `content`, `digests`, `social`,
  `reddit`, `bluesky`). For example: `await topics.listDefault()`.
- **It's live:** repository calls and SQL change production data, and
  calling digest generation spends the AI budget.
- **Exit** with `.exit` or Ctrl-D. History is saved to
  `~/.local/state/news-digest/console-history`, so don't type secrets.

## Connect to the database from your laptop

Use your own client (Beekeeper Studio, DBeaver) through its built-in SSH
tunnel. No port is opened on the VM.

| Setting       | Value                                                           |
| ------------- | --------------------------------------------------------------- |
| SSH host      | `news-digest.exe.xyz`, port 22, user `exedev`, your SSH key     |
| DB host, port | `127.0.0.1`, `5432` (as seen from the VM)                       |
| Database      | `news_digest`                                                   |
| Read-only     | user `owner_ro`: can't write or change schema, 60 s query limit |
| Read-write    | user `owner_rw`: can change rows, but can't change schema       |

Passwords live only in the VM's env file. To see them, run this in your own
terminal:
`ssh news-digest.exe.xyz 'grep ^OWNER_DB_ ~/.config/news-digest/env'`.

> [!TIP]
> Make read-only your default connection. Save read-write as a second
> connection, colored red.

## How code reaches production

```mermaid
flowchart LR
  a["Agent edits code"] --> b["pnpm check<br/>(typecheck, lint, format,<br/>boundaries, tests)"]
  b --> c["pnpm build<br/>+ migrate"] --> d["restart services"] --> e["verify /healthz,<br/>smoke scripts"] --> f["commit + push main"]
```

## Tests

| Suite                  | Command                 | Uses                                                      |
| ---------------------- | ----------------------- | --------------------------------------------------------- |
| Unit                   | `pnpm test:unit`        | Pure logic, fakes; database access blocked                |
| Integration            | `pnpm test:integration` | Throwaway Postgres + Redis (in memory) via Testcontainers |
| Everything             | `pnpm check`            | Both suites plus typecheck, lint, format and boundaries   |
| Smoke (live, explicit) | `scripts/smoke-*.ts`    | Real browser/UI checks against the running app            |

Tests use fake or recorded AI responses, never live external services.
