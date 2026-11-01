# news-digest

A personal news and social-media digest. For each topic you care about, it
surfaces a small set of the most important stories and posts (with X posts
shown in full, media included) for a configurable time window, daily to start.

This repository is built **autonomously** by a Codex agent running on an
exe.dev VM under a never-give-up supervisor.

- Product brief: [MISSION.md](MISSION.md)
- Owner instructions to the agent: [STEERING.md](STEERING.md) (edit on GitHub)
- Plan and status: [TASKS.md](TASKS.md), [PROGRESS.md](PROGRESS.md),
  [NEEDS_FROM_HUMAN.md](NEEDS_FROM_HUMAN.md)
- How the VM and agent loop are set up: [BOOTSTRAP.md](BOOTSTRAP.md),
  [ops/agent-control/README.md](ops/agent-control/README.md)

App (private to the owner): https://news-digest.exe.xyz/

## Run locally (Node 22, pnpm, Docker Compose)

```sh
pnpm install --frozen-lockfile
docker compose up -d
pnpm build
pnpm migrate
pnpm check
```

`pnpm check` runs typechecks, ESLint, dependency boundaries and integration
checks against local PostgreSQL/Redis. Tests do not contact external services.
The check command builds shared contract declarations automatically.
`pnpm migrate` is safe to repeat. Keep secrets only in
`~/.config/news-digest/env` (mode 600), never in the repository.
The API accepts `DATABASE_URL`, `REDIS_URL`, and `PORT`; defaults target the
loopback Compose services and port 8000. The operations worker currently uses
the default loopback Redis instance.

```sh
mkdir -p ~/.config/systemd/user
cp ops/services/*.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now news-digest-api news-digest-worker
systemctl --user restart news-digest-api news-digest-worker
systemctl --user status news-digest-api news-digest-worker
journalctl --user -u news-digest-api -u news-digest-worker -f
systemctl --user stop news-digest-api news-digest-worker
curl --fail http://localhost:8000/healthz
```

After pulling changes, rebuild, migrate, and restart both services. Docker
containers restart automatically; do not use `docker compose down -v` unless
intentionally deleting local data. To reproduce desktop/mobile screenshots:

```sh
pnpm exec playwright install chromium
pnpm exec tsx scripts/smoke-ui.ts
```

The page shows a preliminary ranked edition with saved publisher excerpts and
selection signals, plus real incoming articles for all four topics. Use the
create button to save a new edition for the last 24 hours. Quiet sections remain
empty; LLM editorial summaries and automatic generation are still pending. The worker ingests five sources every 30 minutes. Curated digests
and configuration editing are tracked in [TASKS.md](TASKS.md).

Explicit live verification (contacts publishers and HN; never part of tests):

```sh
pnpm exec tsx apps/api/scripts/smoke-ingestion.ts
curl --fail http://localhost:8000/api/content/sources
```

The smoke check queues two passes, at most 25 upstream requests per pass
before the shared cache, and verifies all four topics and idempotent storage.

Local snapshot/API verification (uses stored real content, no external calls):

```sh
pnpm exec tsx apps/api/scripts/smoke-previews.ts
```
