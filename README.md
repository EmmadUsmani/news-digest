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
checks against fresh disposable PostgreSQL 17/Redis 7 Docker containers.
The test runner overrides inherited database/Redis URLs, clears the Anthropic
key, applies all migrations, and removes containers on completion. Docker is
required; tests never fall back to the live database or contact external services.
Database tests must run through `pnpm test`; direct Node test invocations that
construct database clients fail before connecting.
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

The default browser check reads saved editions. Opt in to paid inference with
`SMOKE_CREATE_EDITION=1` (24h creation) or `SMOKE_EXTENDED_WINDOWS=1`
(6h/7d/custom-window creation).

The page shows immutable editions with AI briefs, source-based summaries and
selection evidence, or labeled non-AI ranking when editing is unavailable, plus
real incoming articles for all four topics. Use the
period controls to save a new edition for the last 6 hours, 24 hours, 7 days,
or a custom period of up to 31 days. Custom times use the browser timezone;
the start is included and the end excluded. Only collected articles are used,
so older coverage may be incomplete. Quiet sections remain
empty. Browse saved editions to reopen an immutable version by URL; history lists
20 versions per page with their creation time, coverage period and ranking method.
The worker ingests seventeen sources every 30 minutes and generates editions at
the saved daily local time. New editions and UI creation checks make budgeted
Anthropic calls; offline tests never call external services.
Schedule changes reach the worker within 10 seconds. Coverage ends at the scheduled
slot, even if a queued job is delayed; repeated jobs reuse the same edition.
BullMQ retains 100 successful/failed runs and retries failures three times with
exponential backoff. Downtime does not backfill every missed daily edition.
Further curation and configuration work is tracked in [TASKS.md](TASKS.md).

Explicit live verification (contacts publishers and HN; never part of tests):

```sh
pnpm exec tsx apps/api/scripts/smoke-ingestion.ts
curl --fail http://localhost:8000/api/content/sources
```

The smoke check queues two passes: one request per connected feed plus the HN
list and up to 20 items per pass, before cache/redirects. It verifies connected
enabled topics and idempotent storage. Add public HTTPS RSS/Atom feeds under
Manage topics → Sources; collection starts within one minute. Inspect Source &
run status for first success or errors; registration alone does not verify a feed.

Local snapshot/API verification (uses stored real content, no external calls):

```sh
pnpm exec tsx apps/api/scripts/smoke-previews.ts
```

Verify automatic generation using stored real content (temporarily schedules the
next UTC minute with 6h coverage, then restores the original schedule):

```sh
pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts
```

Run schedule-changing smoke scripts sequentially. The worker must be running.

Workspace formatting and linting:

```sh
pnpm format
pnpm lint:fix
pnpm check
```

`check` enforces Prettier, zero-warning ESLint, type checks, dependency boundaries
and tests. ESLint covers all workspace TS/TSX and configuration files; API,
contracts and scripts use typed rules via `tsconfig.eslint.json`. Legacy untyped
I/O boundaries and two React loading effects have scoped, commented exemptions
tracked in TASKS.md. Owner-controlled files are excluded from formatting.
Use `git config blame.ignoreRevsFile .git-blame-ignore-revs` to hide the isolated
formatting commit in local blame output.

Anthropic transport and budget verification:

```sh
pnpm exec tsx --test apps/api/test/llm.test.ts
pnpm exec tsx apps/api/scripts/smoke-llm-ledger.ts
```

The ledger check uses a fresh disposable Postgres 17 Docker container and never
reads live DB settings. AI usage, caps and sanitized errors appear in Source &
run status; published editions still use signal ranking. See [docs/LLM.md](docs/LLM.md)
for configuration, remaining editorial work and the explicit paid live check.

Free social discovery (explicit, not yet scheduled): run
`pnpm exec tsx apps/api/scripts/harvest-social-rivers.ts` to collect bounded
X references from enabled topic rivers, then
`pnpm exec tsx apps/api/scripts/verify-x-embeds.ts` to verify at most ten
candidates through official oEmbed. These commands use no inference. Discovery
references are not publishable posts; new editions select qualifying verified
posts and show them with lazy official widgets and saved-text fallbacks.
Run `pnpm migrate` before using them. Inspect stored posts without HTTP,
inference or publication using
`pnpm exec tsx apps/api/scripts/screen-social-posts.ts START_ISO END_ISO`
(default: last 24 hours). This reports per-post eligibility reasons against saved
topic phrase rules and verified timestamps; it is not a virality or editorial score.

For a read-only desktop/mobile post UI replay, save the screening JSONL output
to a temporary file, then run
`pnpm exec tsx scripts/smoke-posts.ts /tmp/post-screen.jsonl`. It uses actual
selected candidates with stubbed widget success and blocked-script checks, without
publishing an edition. `POST_EMBED_LIVE=1` explicitly enables separate official
widget requests instead; these are external checks, not automated tests.

Free social discovery runs hourly in the worker via the `social-collection`
BullMQ queue. It harvests enabled public rivers and verifies at most ten X
oEmbeds per run, stopping verification on the first failure with a persisted
one-day cooldown. Status shows this queue and its next run; no inference is
used. The explicit harvest/verification commands remain available for diagnosis.
