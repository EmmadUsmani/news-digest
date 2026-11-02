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

`pnpm check` runs typechecks, ESLint, dependency boundaries and both test suites.
`pnpm test:unit` runs fast offline tests without Docker, with database access
blocked. `pnpm test:integration` uses Testcontainers to start fresh PostgreSQL
17/Redis 7 containers matching `compose.yaml`, applies every migration from zero
(including fixture seed migrations), and stops the containers on completion.
Testcontainers also supplies crash cleanup through its resource reaper. The runner
builds the API before testing; HTTP characterization boots the production Nest
module from compiled code (including constructor metadata) on an ephemeral
loopback port. Topic CRUD/order/source connections and profile schedule changes
exercise real controllers and repositories against the disposable services. Digest
HTTP tests cover rejected requests, synchronous publication, immutable retrieval,
latest/history offsets and deduplicated async jobs completed by a real BullMQ
worker against the real repository (empty historical window, no inference).
Content repository characterization covers connected/enabled source eligibility, shared
observations, dedupe, five-item ordering/filtering, timezone normalization, JSON
upserts, failure truncation and batch rollback (including existing-row updates).
Reddit repository characterization pins the inclusive seven-day observation lookback,
exclusive end, stable timestamp ties, shared-topic dedupe, configuration filtering,
topic deletion and atomic rollback of updates, inserts and X citations.
Publisher discovery characterization covers shared-topic dedupe, current host/topic
configuration, citation provenance/engagement JSON, cooldowns, publisher rotation
and atomic rollback of citation inserts/updates when the final check fails.
X-search repository characterization covers current topic/account configuration, zero-post
budgets, call/post dedupe, first-write provenance, shared-topic eligibility, deletion,
foreign keys and partial-batch rollback/recovery.
Operations source telemetry characterization covers name ordering, empty sources,
shared observations without count inflation, current enabled connections, disconnects,
persisted failures and timezone-normalized attempt/success timestamps.
X discovery ledger characterization pins inclusive UTC day/month boundaries, expired
settled spend, retained old pending/uncertain holds, exact monthly cap admission and
atomic rollback/retry when persisting a prepaid-credit depletion block fails.
Scheduled-budget lifecycle tests cover UTC slot identity, concurrent claims, durable
retry fencing, terminal outcomes and contention on the Anthropic ledger lock.
Pending reconciliation tests cover settings compare-and-swap, obsolete jobs,
claim races and protection of running/retrying/terminal identities.
Historical reserve-cost tests cover settled article/social totals, inclusive
30-day boundaries, incomplete AI exclusion, unresolved holds and verification spend.
UTC-day cron resolution tests cover midnight, DST gaps/repeated hours, missing
UTC-day slots and 100 combinations compared with BullMQ's repeat strategy.
The scheduler registers the current UTC day before refreshing its BullMQ schedule,
using stable publication keys and compare-and-swap settings reconciliation. Tests
cover delayed snapshots racing registration/reconciliation, restarts, day rollover
and protection of claimed/terminal work. Published-slot recovery tests cover
AI/mixed/fallback snapshots, manual-key exclusion, restart after cutoff and
attempt fencing. Shared-lock reserve admission and lifecycle ordering are covered by isolated tests.
`pnpm test` runs both commands; integration tests remain part of `pnpm check`.
Both runners replace inherited database/Redis URLs, clear Anthropic/xAI keys and
live-inference opt-in. Docker is required only for integration tests; there is no
fallback to live services. Direct Node test invocations constructing database
clients fail before connecting. Suite membership is explicit in
`scripts/test-suites.ts`; mixed files stay in integration until split. New tests
start in the unit suite, where accidental database access fails closed.
This is the infrastructure step of STEERING 2a, not complete repository/HTTP
characterization or database coverage reporting.
The check command builds shared contract declarations automatically.
The `edition-timing.test.ts` integration test prints cold/warm four-topic publication
baselines for synthetic 400- and 1,500-article windows. It runs real database
selection, batching, score caching, ranking and immutable publication, with fake
HTTP responses through the real Anthropic SDK adapter (25 ms per call) and a
fake story editor (25 ms per call). Each topic also has
60 synthetic verified X posts: real social triage, social editor validation and
publication select five posts. Warm passes assert no new article/social triage
calls and reuse the social editor cache. The existing 200-article/topic limit
means only 800 of the 1,500 stored articles are triaged; all 240 posts are scored
in eight batches. Jobs run through BullMQ and the on-demand worker application,
persist publication progress, and report worker duration separately from
enqueue-to-readback timing (including queue wait). The real adapter must reach
and stay within four concurrent HTTP calls. These measurements exclude live
provider/network latency and rate limits; they do not establish the live
<60 s / <2 min targets. Run with `pnpm test` against disposable services, never the live database.

For read-only live evidence, run `pnpm exec tsx scripts/report-edition-timing.ts`
with the API running locally. It only GETs status and the editions linked to the
three latest retained completed jobs; it never enqueues work or calls an LLM.
The report includes final-attempt worker duration, edition creation/window,
candidate counts, editorial modes/reasons and remaining app budget. Queue wait,
prior retries and cold provider latency are not measured. A reused edition,
cached scores or non-AI fallback must not be reported as a cold AI timing result.
On November 2 at 14:49 UTC, retained jobs were older `signals-v6` publications
(73–85 ms, no AI editorial metadata), and only $0.000848 of the daily app budget
remained. Live AI latency targets therefore remain unverified; observe routine
scheduled runs rather than spending the digest budget on development trials.

For X discovery evidence, run `pnpm exec tsx scripts/report-x-discovery.ts YYYY-MM-DD`
(defaults to today UTC). This reads the database only: per-call cost, unresolved
holds, fetched counts and per-topic citations with current verified/dated counts.
Costs are counted once even when a call has multiple citations. Zero-citation
calls remain visible. New reservations snapshot the requested topic ID/name before
HTTP, preserving attribution through failures and topic rename/deletion. Historical
calls have no snapshot and remain explicitly unattributed.
New citations snapshot whether the post was absent from verified storage and all
previous X searches. `newCandidates` counts these first-search discoveries;
`newVerifiedNow` counts those currently verified, once across searches. Concurrent
search saves serialize attribution; repeats retain the original baseline.
`unknownBaseline` keeps historical citations explicit. These counts can rise when
later free collection verifies a post: they measure attributed yield, not causation,
relevance or edition selection. No historical baseline is inferred.

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
Scheduler refresh marks never-claimed daily budget slots failed after the same
six-hour recovery window used by the worker; active attempts and retries remain
protected. Shared-ledger admission protects the scheduled edition before other runs.
Async API clients can `POST /api/digest-previews/jobs` with ISO `windowStart`
and `windowEnd` values to receive HTTP 202 and a job ID without waiting for
inference. Poll `GET /api/digest-previews/jobs/:id` for queue state, `editionId`,
`durationMs` (worker processing time), per-topic editorial `progress` and a sanitized error. Concurrent requests
for the exact same normalized window share a job until it completes or fails;
a subsequent request creates a new edition. On-demand jobs make one attempt,
and worker recovery reuses the same publication key. Job history is bounded to
100 completed and 100 failed runs. Scheduled jobs keep their existing retries.
The web UI enqueues and polls these jobs, resumes polling after a reload and opens
the saved edition on completion. Progress reports story triage/editing, social
selection and publication; topics can be at different stages concurrently.
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

Verify scheduling and publication with `pnpm test` (disposable Postgres/Redis,
no live inference). The former live `smoke-scheduled-digests.ts` probe is disabled.
`pnpm exec tsx scripts/smoke-schedule.ts` checks desktop/mobile schedule forms
with intercepted profile requests and in-memory settings, and verifies the live
profile remains unchanged. API validation is covered by the isolated tests.

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

Legacy recovery records may remain at
`~/.local/state/news-digest/schedule-recovery.json`. Inspect any record before
using `scripts/recover-schedule.ts`: it restores the saved value, which may
predate the owner's corrected schedule. Routine verification never uses this
recovery path or writes the live schedule.

Reddit community choices are editable under Manage topics → Edit. Public access
is currently blocked; saving configuration does not fetch posts.
`pnpm exec tsx scripts/smoke-reddit-communities.ts` checks settings on desktop
and mobile with intercepted topic writes and asserts live topics stay unchanged.
Community validation and persistence tests run against disposable SQL in `pnpm check`.

Reddit storage preparation uses `collectReddit` through a listing/repository port.
Migration 038 retains card metadata and metrics in `social_posts` with transactional
per-topic associations; repeated collection updates the snapshot. It is not wired
to scheduling while access is blocked. Migration 039 atomically retains X links
from Reddit external URLs/selftext, including citing scores. They feed bounded X
verification, topic scope and existing official-X selection; citations alone never
verify a tweet. Reddit ranking/cards remain unfinished. Synthetic fixtures are not live content.

Scheduled budget attempts now track worker retries and stalled redeliveries with
compare-and-swap fencing, recording conservative AI/mixed/fallback publication
outcomes. Terminal queue failures are reconciled on failed events and from retained
failed jobs during scheduler refresh, with attempt fencing against redelivery.
A schedule change to a UTC day without an occurrence removes only its observed,
never-claimed budget identity; concurrent claims and replacements are preserved.
Refresh also recovers committed scheduled editions before the missed-slot cutoff,
using immutable publication evidence and identity/attempt fencing under the ledger
lock. Manual editions cannot release scheduled protection.
Reserve implementation and rollout are tracked in
[decision 0002](docs/decisions/0002-scheduled-edition-budget-reserve.md). Ledger
admission uses shared-lock protection with attempt-fenced trusted context.
Production enforcement was enabled in iteration 210.

Anthropic production publication and guarded verification tools share
`configuredLlmLedger`. Reserve deployment settings are
`LLM_SCHEDULED_RESERVE_ENABLED` (`0` default, `1` opt-in), optional integer
`LLM_SCHEDULED_RESERVE_MICROS`, and `LLM_SCHEDULED_RESERVE_HEADROOM` (default
`1.5`, minimum `1`). Invalid values fail immediately. The production environment
enables protection with headroom `1.5` and no fixed amount override. Sizing uses
the largest positive cost among the ten most recent full-AI editions within
30 days; without qualifying
evidence it protects the entire daily cap. Today's completed scheduled edition
releases protection; the next UTC day protects its own scheduled run. No paid
verification run is needed to enable this policy.

Status shows whether scheduled AI reserve protection is enabled, the UTC budget
day and durable run state, protected amount, configured/measured target, and
remaining allowance for other runs before stricter model/verification limits.
It also reports the latest terminal scheduled budget record's AI/fallback mode
and reason (or definitive failure). These fields share a ledger-locked snapshot;
disabled protection displays zero protected funds. Older editions without a
durable budget record are not inferred to have used AI.
