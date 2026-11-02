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

Free social discovery (also scheduled hourly for rivers and opted-in publisher pages): run
`pnpm exec tsx apps/api/scripts/harvest-social-rivers.ts` to collect bounded
X references from enabled topic rivers, then
`pnpm exec tsx apps/api/scripts/verify-x-embeds.ts` to verify at most ten
candidates through official oEmbed. These commands use no inference. Discovery
references are not publishable posts; new editions select qualifying verified
posts and show them with lazy official widgets and saved-text fallbacks.
Run `pnpm migrate` before using them. An additional explicit command,
`pnpm exec tsx apps/api/scripts/harvest-article-x-links.ts`, checks at most eight
recent (three-day) articles from opted-in publisher hosts across enabled topics.
It stores only X citations, with item/source provenance; full pages are discarded.
Successful pages cool down seven days, failures one day; a failed host stops for
that pass. It uses the same bounded public HTTP client, with no recursive crawl,
bot-protection workaround or inference. The hourly job also runs this bounded article pass. Inspect stored posts without HTTP,
inference or publication using
`pnpm exec tsx apps/api/scripts/screen-social-posts.ts START_ISO END_ISO`
(default: last 24 hours). This reports per-post eligibility reasons against saved
topic phrase rules and verified timestamps. It also reports safety exclusions,
pre-deduplication counts, and the exact bounded, deduplicated semantic candidate
pool used by publication (empty when the post budget is zero). The `selected`
field remains the lexical fallback for UI replays. These are availability checks,
not relevance, virality or editorial scores. For a future scheduled window, only
posts collected so far are represented; rerun after collection progresses.

For a read-only desktop/mobile post UI replay, save the screening JSONL output
to a temporary file, then run
`pnpm exec tsx scripts/smoke-posts.ts /tmp/post-screen.jsonl`. It uses actual
selected candidates with stubbed widget success and blocked-script checks, without
publishing an edition. `POST_EMBED_LIVE=1` explicitly enables separate official
widget requests instead; these are external checks, not automated tests.
New snapshots preserve visible URL labels and line breaks in the saved plain-text
fallback, including when the official widget is blocked. Historical snapshots use
their existing text. Screening/editorial evidence continues to exclude URLs; raw
embed HTML is never rendered by the fallback. Failed widgets show an explanation
and a Retry X media button; retrying keeps the saved text and original link
available. Widget creation times out after 15 seconds and offers the same retry; late widget results cannot replace a newer attempt. The replay verifies blocked-script and timed-out-widget recovery on desktop/mobile.

Free social discovery runs hourly in the worker via the `social-collection`
BullMQ queue. It harvests enabled public rivers, checks at most eight opted-in
publisher pages, then verifies at most ten X
oEmbeds per run, stopping verification on the first failure with a persisted
one-day cooldown. Status shows this queue, its next collection time and up to
20 retained runs with river/page citation observations, successful embed checks
and separate error counts. Completed jobs can contain partial errors; checks
include refreshes and do not establish new posts, relevance or virality. Older
results without the current counter shape show counts unavailable. No inference
is used. `pnpm exec tsx apps/api/scripts/smoke-social.ts` explicitly queues one live
pass and reports its saved result, including page successes/errors/citations.
The explicit harvest/verification commands remain available for diagnosis.

X-discovery funds are tracked separately from Anthropic editorial usage. Source &
run status shows the $0.40/day and $12/month UTC caps, outstanding reservations
and a durable prepaid-credit depletion block. Read the same live ledger without
external requests using `pnpm exec tsx apps/api/scripts/x-discovery-status.ts`.
The direct adapter is available through an explicit, dry-run-by-default command:

```sh
pnpm exec tsx apps/api/scripts/discover-x.ts 00000000-0000-4000-8000-000000000014 2026-11-01 2026-11-02
```

It uses enabled topics' saved `accounts` lists and whole UTC dates (at most seven
days). Migration 022 seeds curated accounts only where the list was empty.
`X_DISCOVERY_LIVE=1` opts into one real direct xAI request, with the installed
`XAI_API_KEY` loaded from the secrets file; never put the key in shell arguments.
No live paid validation has been performed yet. Paid discovery is not scheduled.
One call reserves the entire $0.40 daily cap; this is conservative admission
control, **not a provider-enforced per-request dollar ceiling**. A tool can fetch
more posts/parents than requested, and output limits exclude reasoning tokens.
Measure the first call before reducing reservations or enabling any scheduling.
Only API citation annotations become discovery records; generated prose and metrics
are ignored. The free verification worker then checks their official embeds before
posts can enter selections. Spend settles before citations are stored.
Timeouts, malformed/missing usage and ambiguous HTTP errors keep reservations
charged until reconciled; depleted credits block until explicit operator review.
The adapter never retries, follows redirects or uses the gateway. `pnpm test`
uses disposable services and clears both inference-provider keys.

Inspect the last twenty direct X discovery calls without HTTP or inference:

```sh
pnpm exec tsx apps/api/scripts/report-x-discovery.ts
```

The report compares settled ledger cost and fetched items with stored citations,
author-qualified URLs and current official verification. These counts do not
measure editorial quality or demonstrate eligibility for a digest window.

Social semantic triage diagnostics (no HTTP, inference or publication):
`pnpm exec tsx apps/api/scripts/triage-social-posts.ts START_ISO END_ISO`.
This uses publication's shared candidate selector, including source scope,
window, safety exclusions, text/link deduplication, zero budgets and the 200-post
cap, then checks separate social triage caches. Missing scores are reported
as unscored; positive phrase rules are reserved for non-AI fallback.
Manual and scheduled publication now triage up to 200 safety-screened, deduplicated
verified posts per topic with configured Haiku. Complete triage supplies at most
ten posts (relevance ≥6, interestingness ≥4) to the budgeted Sonnet editor with
Haiku fallback. Editions freeze original text, context, scores and selection
method. Incomplete triage or unavailable editing retains lexical selection and
labels it non-AI. Empty verified candidate pools skip both social AI services and
explain that no social AI calls were needed; incomplete triage has a separate
fallback reason. Unknown engagement and media contents are never inferred.
Read-only UI verification can use `POST_EDITORIAL_REPLAY=1` with `smoke-posts.ts`;
its context is explicitly synthetic and it publishes no edition.

Schedule-changing smoke checks save the original profile schedule exclusively to
`~/.local/state/news-digest/schedule-recovery.json` before editing it. Normal exit,
SIGINT and SIGTERM restore and verify the saved schedule. If the VM stops or the
process receives SIGKILL, the record remains and another probe refuses to start.
Run `pnpm exec tsx scripts/recover-schedule.ts` once the API is healthy to restore
that record; failed restoration retains it. Do not run schedule probes concurrently
or edit the schedule while a probe is active. These probes can publish editions;
use the isolated suite for routine verification rather than the live scheduler probe.
