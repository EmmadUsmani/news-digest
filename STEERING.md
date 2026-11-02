# Steering

The owner writes instructions here, often by editing on GitHub. The agent reads
this file every iteration, and it overrides MISSION.md where they conflict. The
agent only appends `ack: <date> <what you did>` lines under an item.

## 1. TOP PRIORITY: formatting and linting (2026-11-01)

Do this before any other task, at the start of the next iteration that has
model quota. The code has no formatter, and the only ESLint config is a single
line using the basic `recommended` rules. Fix that across the whole repo:

- **Prettier:**
  - Add Prettier with a root config (`.prettierrc`), `.prettierignore`
    (dist, lockfile, generated output) and `.editorconfig`.
  - Add root scripts `format` (write) and `format:check`.
- **ESLint:**
  - Replace `eslint.config.mjs` with a real flat config:
    - `typescript-eslint` type-checked rules for `apps/api`, `packages/*` and
      `scripts`
    - React (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) for
      `apps/web`
    - import hygiene (sorted, no duplicate or unused imports)
    - `eslint-config-prettier` last, so lint and format never conflict
  - Lint every TS/TSX file in the workspace, including tests, the SPA and the
    configs.
  - Add `lint:fix`.
- **Make it enforced:**
  - Add `format:check` and lint (zero warnings) to `pnpm check`.
  - Add a one-line rule to AGENTS.md: run `pnpm format` and `pnpm lint:fix`
    before every commit.
- **Reformat everything:**
  - Run Prettier over the whole repo as one formatting-only commit with no
    behavior changes.
  - Add that commit's hash to `.git-blame-ignore-revs`.
  - Then fix what `eslint --fix` can't, in separate small commits.
  - If a rule would need a large risky rewrite, disable it in the config with
    a comment saying why, and add a follow-up to TASKS.md. Do not leave the
    build red.
- **Verify:**
  - `pnpm check` (typecheck, lint, format check, boundaries, all tests and
    specs) passes.
  - The API and web build.
  - The services restart healthy, `/healthz` is ok, and the digest page still
    renders (Playwright screenshot).

Only after this is green, resume the normal task order.

ack: 2026-11-01 iteration 51 — configured/enforced Prettier and typed ESLint, isolated formatting commit in blame-ignore, fixed imports and documented scoped legacy-rule follow-ups; 43 tests/build/browser checks pass.

## 2. LOWER PRIORITY: real DB verification, then an ORM (2026-11-01)

Do this after item 1. It ranks below the milestone in progress: add it to
TASKS.md as two tasks, 2a and 2b. Work on it when the current milestone is done
or blocked (for example, M3 waiting on an LLM model decision). The owner does
not want raw SQL queries in the app. **2a must be finished and green before 2b
starts.**

### 2a. Verification infrastructure strong enough for a data-layer refactor

- **Containers:** add DB integration tests that use Testcontainers (Docker
  works on this VM).
  - Postgres uses the same image and major version as `compose.yaml`
    (including pgvector if used). Redis is there for BullMQ flows.
  - Each test run starts fresh containers, runs every migration from zero,
    and seeds from fixtures.
  - Tests must never touch the live database.
- **Repository characterization tests:** cover every repository and every
  query against the current raw-SQL code, so the tests pin today's behavior.
  - Include create/read/update/delete, filters, ordering, limits, dedupe,
    unique constraints, upserts, transactions and rollback, and JSON columns.
  - Include timestamp and time-zone handling, window boundaries, and topic
    deletion and reordering.
  - Also cover `operations.status` and anything else that queries the DB
    directly.
- **API tests:** add end-to-end tests that boot the NestJS app against the
  containers and call the real HTTP endpoints. Cover health, topics, settings,
  digests and editions.
- **Golden test:** given fixed fixture content, the generated digest edition
  stays the same.
- **Commands:**
  - Add `pnpm test:integration` and include it in `pnpm check`.
  - Keep fast unit tests separate, so they still run quickly.
  - Report coverage for the `database/` layers and document the commands in
    README.
- The tests must be written so they pass unchanged after the ORM swap. Test
  through repository ports and HTTP, not through SQL strings.

### 2b. Replace raw SQL with an ORM

- **Default: Drizzle ORM** plus drizzle-kit. It is type-safe, thin and
  SQL-shaped, works with pgvector, and suits the hexagonal layout. You may
  pick another ORM only if you write down a clear reason in
  `docs/decisions/`. Record the choice there either way.
- **Hexagonal boundaries:**
  - The ORM lives only in each module's `database/` adapters and `libs/db`.
  - Mappers convert rows to domain entities.
  - The domain and application layers never import the ORM. Enforce this with
    dependency-cruiser and ESLint rules.
  - After the swap, ban direct `pg` / `pool.query` use outside `libs/db`.
- **Schema and migrations:**
  - Write a Drizzle schema that exactly matches the current migrated
    database. Prove it with a test: running drizzle-kit against a freshly
    migrated container shows no difference.
  - Then move future migrations to drizzle-kit, keeping the existing 001–014
    history valid.
  - Back up the live database with `pg_dump` before running the first new
    migration. Migrations must never drop data.
- **Swap gradually:** convert one repository or module per commit. The 2a
  suite must pass unchanged after every commit.
  - Use Drizzle's typed `sql` template only where the query builder can't
    express something (for example, complex CTEs or vector operators). Keep
    those inside repositories and comment why.
- **Done when:**
  - No raw-SQL query strings remain in the application code.
  - `pnpm check` (including integration tests) passes.
  - Services restart healthy and the live data is intact.
  - The digest page still renders.
  - Update the architecture notes in README/docs.

## 3. HIGH PRIORITY (after item 1, before item 2): AI editorial for M3 (2026-11-01)

This answers the M3 model question in NEEDS_FROM_HUMAN.md. Do it right after
item 1, ahead of item 2.

**Status (2026-11-01 21:40 UTC): the key is installed and verified.**
- `ANTHROPIC_API_KEY` is in `~/.config/news-digest/env`.
- A real Haiku test call succeeded.
- `news-digest-api` and `news-digest-worker` were restarted, and both have the
  key loaded.

Build the real Anthropic adapter now (right after item 1), not a placeholder.
The "if the key isn't there yet" fallback below no longer applies.

### Provider and key

- Use the Anthropic API directly with the official `@anthropic-ai/sdk`. Do not
  use the exe.dev gateway or any OpenAI/ChatGPT route for app inference.
- The key is `ANTHROPIC_API_KEY` in `~/.config/news-digest/env`. The owner
  adds it, and the API/worker services already load that file.
- The key belongs to a dedicated Anthropic workspace with a **hard $15/month
  spend limit**. Never print, log or commit it.
- If the key isn't there yet, build everything against a fake `LlmPort`
  adapter with tests. Keep the non-AI ranking as the live behavior, and check
  for the key again each iteration.

### Models (hybrid)

- **Triage with `claude-haiku-5-5`**:
  - Score every candidate item for each topic: relevance, importance, and
    whether it duplicates or belongs to the same story as another item.
  - Use compact item text (title, short excerpt, source).
  - Send batches, and keep every Haiku prompt **under 100k input tokens**.
    Above that, Haiku 5.5 costs 5x as much.
- **Final edit with `claude-sonnet-5-5`**:
  - Work from the shortlist only.
  - Pick the final stories per topic within the digest budgets and write the
    brief.
  - Write 2–3 sentence neutral summaries of the chosen stories, using only
    facts from the source. Use full article text where fetched, at most about
    2.5k tokens per story.
- Use prompt caching for the shared instructions. Use structured JSON output
  validated with a schema; on invalid JSON, do one repair retry.
- Use the Message Batches API (50% off) where latency doesn't matter, for
  example for scheduled triage.
- Make model IDs and the price table configuration, not code constants.
  Prices per 1M tokens:
  - Haiku: $0.10 in, $0.01 cache read, $0.50 out.
  - Sonnet: $2 in, $0.10 cache read, $10 out.

### Budget (the app's own caps on top of the provider's hard cap)

- **Ledger:** record every call in Postgres:
  - model, purpose, digest/run
  - input, cache-write, cache-read and output tokens
  - computed cost
- **Monthly app cap:** `LLM_MONTHLY_BUDGET_USD=14`, kept just under the $15
  provider limit.
- **Daily cap:** whatever is left of the month's budget divided by the days
  left in the month, with a ceiling of `LLM_DAILY_MAX_USD=1.00`. Unspent days
  roll forward, but a bug can never spend the month in one day.
- **Check before every call:** estimate the cost, including `max_tokens`
  worst case, and reserve it. Refuse the call if it would go over.
- **Fallbacks:**
  - When Sonnet's share is used up, finish with Haiku.
  - When everything is used up, publish the digest with the existing non-AI
    ranking and mark the edition as "non-AI" in the UI.
- **Provider limit reached:** Anthropic answers HTTP 400 `invalid_request_error`
  "...workspace API usage limits", or 429 with `error_code`
  `enforced_spend_limit_reached`. Treat either as "budget exhausted until next
  month". Never retry-loop on them.
- **Status page:** show today's and this month's spend against both caps,
  calls by model, and the last provider error.
- **Projected cost:** about $0.25/day at expected volume (about 1,500
  items/day). Record the actual daily cost in PROGRESS.md for the first week.

### Done when

- With the key present, one real end-to-end digest is generated, and its cost
  is shown on the status page and is within the caps.
- Tests cover:
  - the budget math (rollover, ceiling, reservation)
  - the fallbacks
  - provider-limit error handling (with mocked responses)
- Update NEEDS_FROM_HUMAN.md to clear the model question.


## 4. LOWER PRIORITY: test against fake/recorded LLM responses (2026-11-02)

Same priority level as item 2: after the current milestone work, not urgent.
Add it to TASKS.md.

**Why:** on 2026-11-02, about $0.40 of the $0.47 daily app budget went on the
agent's own development and verification calls. Most of that was Sonnet. That
crowds out the real digests.

- **Tests:** unit, integration, e2e and golden tests use a fake or replaying
  `LlmPort` adapter. No test may reach the real Anthropic API.
- **Recorded responses:**
  - Record realistic responses once into `apps/api/test/fixtures/llm/`, with
    the request fingerprint, model and response body. Never store the key or
    headers.
  - Replay them by fingerprint.
  - Re-record only when a prompt or schema version changes, and say so in
    the commit.
- **Ranking evaluations and replays:** use these recorded responses or the
  existing `llm_cache`, not fresh calls.
- **Real calls during development:**
  - Allow them only behind an explicit opt-in (for example `LLM_LIVE=1`).
  - Limit them to a few calls and at most $0.05 per iteration, preferring
    Haiku.
  - Tag them `purpose=verification` in the ledger, so the status page shows
    development spend separately from digest spend.
- **The real schedule:** scheduled digest generation stays the only routine
  user of live Sonnet calls.

## 5. NOW: wrap up the editorial audit work (2026-11-02)

The recent run of commits auditing whether summaries are supported by their
sources is good enough for now. Stop adding new audit or challenge variants.

- Finish only what is half-done, keep `pnpm check` green, and write a short
  summary of the audit coverage in docs/RANKING.md.
- Then move on to item 6. Come back to editorial auditing only if a real
  digest shows a wrong or unsupported summary.

## 6. NEXT PRIORITY: social posts milestone (replaces and expands M4) (2026-11-02)

This is the next big product milestone. It comes right after item 5 and ranks
above items 2 and 4. Rewrite M4 in TASKS.md as "Social posts".

**Goal:** each topic's digest shows the coolest, most interesting and viral
social posts in that domain for the window. That means not just news reposts,
but the posts people in that world are actually passing around:
- AI demos and launches
- NBA highlights, plays and insider scoops
- game reveals, clips and studio news
- on-the-ground world events

### Source priority (owner's ranking; weight X heavily)

1. **X (Twitter): by far the most important.**
   - X posts should make up most of the posts section whenever good ones
     exist. For example, about 3–4 of a topic's 5 post slots, with the rest
     filled by other platforms only when they are clearly strong.
   - Rank with virality signals:
     - engagement and its velocity within the window (likes, reposts,
       quotes, replies, views)
     - engagement relative to the account's usual reach
     - notable accounts per topic: reporters, insiders, teams, players, labs,
       founders, studios, developers
     - media (video, images)
   - Penalize engagement bait, spam, crypto/promo, and near-duplicates of the
     same moment.
2. **Reddit: second.**
   - Top posts of the window from curated subreddits per topic, for example
     r/nba, r/LocalLLaMA, r/MachineLearning, r/singularity, r/technology,
     r/programming, r/gaming, r/Games, r/pcgaming, r/worldnews, r/politics.
     Research and store these per topic as data.
   - Use the public RSS/JSON endpoints with a proper User-Agent, respect rate
     limits, and add no scraping workarounds.
3. **Bluesky's public API: optional, last.**

**YouTube is explicitly DEFERRED (owner decision 2026-11-02).** Don't build,
research or plan any YouTube source, and don't ask for a YouTube key, until the
owner explicitly asks to come back to it. Most of it is long-form content the
owner doesn't want in the feed, and it's hard to summarize, so it isn't worth
the effort now. Mark it `deferred` in docs/SOURCES.md.

### Discovering X posts (owner decision 2026-11-02; replaces MISSION.md's X order)

Two layers. Build layer 1 first, because it is free and needs nothing from the
owner.

**Layer 1: free link harvesting (no X access needed).** Humans already pick out
the viral posts and link to them from places we can read legitimately:
- Reddit, especially r/nba, where insider tweets are often top posts.
- Techmeme and Memeorandum, which include tweets in their rivers.
- Hacker News.
- Publisher articles we already fetch, which often embed tweets.

What to do:
- Extract `x.com/…/status/…` and `twitter.com/…/status/…` URLs from these.
- Dedupe by post ID.
- Score by how many independent places cite the post and by the citing
  item's own engagement (Reddit score, HN points).
- Render with the official embed.

**Layer 2: xAI `x_search` with a DIRECT xAI key.**

**Status (2026-11-02 04:50 UTC): `XAI_API_KEY` is installed and verified.**
- `GET /v1/models` returned 200, and `grok-4.3` is available.
- The API/worker services were restarted and both have the key loaded.
- The xAI team runs on prepaid credits ($15) with auto top-up off, so the
  balance is the hard cap.

Build the real layer-2 adapter after layer 1, not just fixtures.

- The owner will add `XAI_API_KEY` to `~/.config/news-digest/env`. The xAI
  team is on prepaid credits only, which xAI enforces as a hard cap: requests
  are rejected when credits run out.
- **Do not route xAI through the exe.dev gateway.** It has no spend cap.
- Until the key exists, build the adapter against recorded fixtures (item 4)
  and check for the key each iteration.
- **Use the cheapest Grok model that supports `x_search`.** Check the models
  page; for example `grok-4.3` at $1.25 in / $2.50 out per 1M tokens, not
  grok-4.6 or grok-4.7.
- **Pricing (since 2026-09-21):** $5 per 1,000 posts fetched and $10 per
  1,000 profiles fetched, plus tokens.
  - Parent posts, quoted posts and thread posts all count. Repeats are not
    de-duplicated.
  - So: avoid profile searches and thread fetches, set `max_turns` low (1–2),
    and use `from_date`/`to_date` for the window.
  - Use `allowed_x_handles` (up to 20) with curated per-topic account lists
    stored as data.
  - Image and video understanding stay off.
- **Volume:** about 1–2 searches per topic per day, aimed at the most viral
  posts. Collect post IDs and whatever engagement Grok returns, then verify
  and render each post with the official embed.
- **Budget:**
  - Record every call (tokens plus posts and profiles fetched) in the ledger
    with `purpose=x-discovery`.
  - App cap: $0.40/day and $12/month for X discovery.
  - Treat xAI's "credits depleted" rejection as budget exhausted, with no
    retry loops. Show X spend on the status page.
- **If this proves too costly or too weak:** write the measurements (cost per
  day and quality of picks per topic) in NEEDS_FROM_HUMAN.md and keep going
  with layer 1 and Reddit. Don't adopt unofficial third-party X data APIs or
  any scraping without explicit owner approval in STEERING.md.

**Rendering:** use only the official embed (`publish.twitter.com/oembed` +
`widgets.js`). Never scrape x.com.

### Rendering (digest page)

- Show the full post with its media via the official X embed. Use Reddit's
  official embed (or a faithful card with title, media thumbnail, score,
  comments and a link). - Show the platform, author, time, engagement and a link to the original.
- Lazy-load embeds so the page stays fast.
- Posts get their own "Top posts" section per topic, separate from the
  stories. Keep the limited budget: 5 per topic by default, configurable.

### Pipeline

- Add a `SocialPost` content type next to articles in the existing ingestion
  and ranking, with platform, external ID, author, metrics snapshot and media.
- Haiku triage scores relevance and "interestingness". The Sonnet editor makes
  the final picks within budget and writes a one-line "why it matters", under
  the same LLM budget caps as item 3.
- Each post links to a related story cluster when it is about the same event.

### Done when

- A real generated digest shows real X posts (if X discovery works) and real
  Reddit posts for all four topics, rendered with media.
- docs/SOURCES.md lists each social source with its status.
- Playwright screenshots of the posts section on desktop and mobile.
- Tests run on recorded fixtures, as in item 4: no live calls in tests.

## 7. TOP PRIORITY NOW: make edition generation fast (2026-11-02)

**The problem:** the owner clicked "create latest edition" at 13:15 UTC, and
it took more than 5 minutes and 77+ sequential Haiku calls.
- The cause is `triage.ts` scoring **3 items per call, one call at a time**,
  at about 1k input tokens and 3s each.
- Social triage does the same.

Do this before any other item, and ack it when done.

- **Batch:** triage 40–60 items per call, staying under about 60k input
  tokens and the 100k Haiku limit. Use prompt caching for the shared
  instructions and size output limits to match.
  - Run calls concurrently: about 4–6 at a time, within Anthropic rate
    limits, with backoff on 429.
  - Do the same for social triage and per-topic editing (topics in
    parallel).
  - Keep the per-item cache, so a regeneration only scores new items.
- **Async:** "create edition" (and any regenerate action) must start a BullMQ
  job and return at once.
  - The UI shows progress (triage, editing, publishing) and opens the
    edition when it's ready.
  - Deduplicate concurrent requests for the same window, so double-clicks
    don't start a second run.
- **Target:** a full four-topic edition in **under 60 seconds** at the
  current volume, and under 2 minutes at about 1,500 items/day.
  - Measure it and record the timing in PROGRESS.md.
  - Show the duration of the last run on the status page.
- **Budget:** the cost per edition should stay about the same or drop.
  Batching cuts the per-call instruction overhead.
- **Tests:** batching, concurrency limits, cache reuse and the async job flow
  must all run on fixtures or fakes (item 4).

## 8. NEXT: Reddit, the owner's #2 social source (2026-11-02)

None has been built yet: every stored social post is from X. Do it right after
item 7, before adding more RSS feeds.

- Use curated subreddits per topic, stored as data and editable in the topic
  settings (research them and record them in docs/SOURCES.md):
  - **Tech/AI:** r/LocalLLaMA, r/MachineLearning, r/singularity,
    r/technology, r/programming, r/OpenAI, r/ClaudeAI
  - **NBA:** r/nba
  - **Gaming:** r/Games, r/gaming, r/pcgaming, r/GamingLeaks
  - **World:** r/worldnews, r/politics, r/geopolitics
- **Fetching:** use the public `top?t=day` (or hot) JSON/RSS endpoints with a
  descriptive User-Agent and per-domain rate limits, backing off on
  429/`Retry-After`. Use no scraping workarounds.
- **Storage:** store each post as a `SocialPost` with platform `reddit`:
  score, comments, upvote ratio, subreddit, media/thumbnail, permalink and
  the external link.
- **Reddit posts that link to an X post** feed into the X citation layer as
  well: count it as a citation, and show the embedded tweet rather than the
  Reddit wrapper.
- **Ranking:** Reddit ranks below X. Use it to fill post slots only when it's
  clearly strong, judged by score and velocity relative to the subreddit's
  usual levels.
- **Rendering:** Reddit's official embed, or a faithful card (title, media,
  score, comments, subreddit, link).
- **Done when:** real Reddit posts are stored for all four topics and appear
  in a generated edition, with screenshots.

## 9. Run xAI X search on a schedule (2026-11-02)

So far only one real `x_search` call has ever run, because layer 2 is
explicit/manual. Do this after item 8.

- Run it automatically as part of the scheduled social discovery, for example
  1–2 searches per topic per day. Time it so the results land before the
  scheduled digest.
- Stay within the existing X caps ($0.40/day, $12/month) and the
  post-count-minimizing rules in item 6.
- Use it most for topics where free harvesting finds few strong X posts.
- Record the daily X cost and the number of verified posts each search adds
  per topic in PROGRESS.md for the first week.

## 10. ONGOING: balance sources across topics (2026-11-02)

The last session added about 12 Gaming feeds and few for the other topics.

- Before adding any new source, look at per-topic coverage: live sources and
  verified items/posts per day for each topic. Add to the weakest topic
  first.
- Tech/AI (the heaviest-weighted topic), NBA and World need comparable depth
  to Gaming.
- Show per-topic coverage counts on the status page.

## 11. Fix the digest schedule (2026-11-02)

The saved schedule is `40 20 * * *` UTC with a `PT6H` window. That looks like
an interrupted smoke test overwrote it.
- Restore the owner's default: **daily at 07:00 America/Los_Angeles, with a
  `P1D` window**. The owner can change it in the settings UI.
- Make sure smoke tests and verification can never write to the live
  schedule again (use the isolated verification database).

## Housekeeping

Append `ack:` lines under items 5 and 6 (and each new item as you finish it),
as this file's header asks, so the owner can follow progress here.
