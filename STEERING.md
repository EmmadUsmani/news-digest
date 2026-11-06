# Steering

The owner writes instructions here, often by editing on GitHub. The agent reads
this file every iteration, and it overrides MISSION.md where they conflict. The
agent only appends `ack: <date> <what you did>` lines under an item, and tidies
Current order as `AGENTS.md` allows.

Completed items 1 (formatting and linting) and 3 (AI editorial, including its
budget rules) are in `docs/steering-archive.md`. Read them only when touching
those areas.

## Current order

**This list wins if an item's wording says otherwise.** It sets the order only:
details, budgets and rules stay in the items. Every new item goes on this list.

1. Breakages and protecting the morning edition.
2. X search: reliability fixes and test rounds (items 39, 34).
3. Nov 6 edition review: World stories, cost (item 36).
4. Bluesky in editions: show why, fix failures, hold a slot, alerts (items 40, 41).
5. UI rebuild: admin pages, then final reader (item 33).
6. Then item 38's list for choosing meaningful work. While 2–4 wait on a time
   or on evidence, item 42 says what to do first.

Blocked on the owner: R2 backups (item 37).

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

ack: 2026-11-03 item 7 measurement — iteration 425 observed the scheduled edition (777fdd95-0bcd-4ca7-9ea6-36c654effcca): 231.829 s worker duration, 748 article candidates, $0.339524 Anthropic/43 calls. The under-60-second target is NOT met; keep item 7 open. Three story sections used AI, NBA stories fell back despite complete triage, and World selected no posts. Investigate editor validation/admission and latency offline before another paid run.

ack: 2026-11-06 item 7 — iteration 970: replayed Nov 5 topic stages and HTTP occupancy; Tech post selection takes 55.895 s, and the final 8.804 s has at most one active call (social triage then Bluesky editing). Recorded the serialized slot dependency and a budget-preserving scoring-split candidate for after the Nov 6 gate; no paid calls or runtime changes. Speed target remains open.

## 8. PARKED by the owner (see item 14): Reddit, the owner's #2 social source (2026-11-02)

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
explicit/manual. Do this now; it no longer waits on item 8 (see item 14).

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

ack: 2026-11-02 item 10 — iteration 177 added rolling 24-hour per-topic distinct articles, verified X/Reddit posts and connected/healthy source counts to Status. Live baseline: NBA 74 articles, World 9 X posts are the respective minima; no sources added.

## 11. Fix the digest schedule (2026-11-02)

The saved schedule is `40 20 * * *` UTC with a `PT6H` window. That looks like
an interrupted smoke test overwrote it.
- Restore the owner's default: **daily at 07:00 America/Los_Angeles, with a
  `P1D` window**. The owner can change it in the settings UI.
- Make sure smoke tests and verification can never write to the live
  schedule again (use the isolated verification database).

ack: 2026-11-02 item 11 — iteration 166 restored daily 07:00 America/Los_Angeles P1D, preserved story/post budgets, replaced browser schedule writes with in-memory replay, and disabled the live scheduler probe; disposable-service scheduling tests remain.

## Housekeeping

Append `ack:` lines under items 5 and 6 (and each new item as you finish it),
as this file's header asks, so the owner can follow progress here.

## 12. NOW (quick, before item 7): shrink the per-iteration reading (2026-11-02)

**Why:** every iteration starts by reading about 115 KB of orientation files.
Because each later step re-sends that context, it makes up most of the roughly
1.6M input tokens each iteration uses.

- **TASKS.md** (now 26 KB) is for open work only, plus one-line done markers.
  Move completed detail into `docs/progress-archive/`. Target under 8 KB.
- **PROGRESS.md** (now 61 KB): keep the latest ~20 entries and move the rest
  to `docs/progress-archive/`. Keep it under 25 KB from now on.
- Follow AGENTS.md "Token efficiency" (new) from now on.
- Ack here when done.


ack: 2026-11-02 item 12 — iteration 154 archived completed TASKS detail and older PROGRESS entries; compact files preserve open work and prioritize items 7–11.

## 13. TOP PRIORITY, before Nov 3 15:00 UTC: protect the scheduled edition's AI budget (2026-11-02)

**The problem:** the Nov 2 07:00 PT (15:00 UTC) scheduled edition was published
with non-AI fallback selection. By then, development calls and the owner's
manual "create latest edition" clicks had used about $0.48 of that UTC day's
$0.48 cap. The scheduled edition is the product; it must get AI editing first.

- **Reserve:** until the day's scheduled edition has run, every other
  Anthropic spend can use only `dailyCap - reserve`. That includes manual
  create/regenerate, verification, smoke scripts and development.
  - Size the reserve from the measured cost of recent full AI editions, with
    headroom (for example 1.5x), never more than the daily cap. Make it
    configurable.
  - Release it once the scheduled edition finishes or definitively fails.
  - Work out the timing against the UTC budget day; the schedule can change in
    settings, so don't hard-code 15:00.
  - Enforce it in the shared ledger under the same lock, so concurrent jobs
    can't race past it.
- **Visibility:** when a manual run is limited by the reserve, the UI says so
  plainly ("AI budget reserved for the 07:00 edition"); don't fall back
  silently. Status shows the reserve and whether the last scheduled edition
  used AI or fallback, and why.
- **Item 7 timing:** use the next scheduled edition as the live speed test.
  No separate paid trial beyond the verification cap.
- **Tests:** fakes and Testcontainers only; no paid calls to verify the reserve.
- Ack here once Nov 3's scheduled edition runs with AI editing, with its cost
  and duration.

ack: 2026-11-03 item 13 measured, partial — iteration 425 verified the scheduled reserve protected the entire $0.482788 daily cap while running, then released with zero holds on publication at 15:03:51.856 UTC. Edition 777fdd95-0bcd-4ca7-9ea6-36c654effcca cost $0.339524 and took 231.829 s. Outcome is mixed: Tech/AI, Gaming and World stories AI-edited; NBA stories non-AI. Reserve behavior verified; full-AI acceptance remains open rather than claiming completion.

ack: 2026-11-05 item 13 accepted — iteration 847 reviewed scheduled edition 7d99b279-cb6a-4cf0-b0a2-d94c5645f0b7: every story/social section AI-edited, zero unscored IDs, NBA five AI stories. $0.315445/46 settled calls, 152.320 s; reserve released, zero holds, full-ai outcome. Speed target remains unmet. See docs/edition-reviews/2026-11-05.md.

## 14. Owner decision: park Reddit, move to scheduled X search (2026-11-02)

Reddit has returned 403 to the VM on every attempt. Reports say Reddit ends RSS
on Nov 13 and now gates new API access behind an approval process that is
rarely granted.

- **Park item 8.** Keep the code, but disable and unschedule Reddit
  collection. Show it as "parked by owner" in docs/SOURCES.md and on Status,
  not as an error.
- **No more Reddit HTTP requests,** including probes, unless the owner
  re-enables Reddit here. Never bypass access controls.
- **Item 6's "done when"** now needs real X posts only, not Reddit.
- **Do item 9 next.** Order: 13, then 7 (finish using the scheduled edition's
  timing), then 9, then 10. Items 2 and 4 stay lower priority.
- **Owner decision 2026-11-02: Reddit stays parked.** Reddit ends RSS on
  Nov 13, 2026, so RSS, `.json` endpoints and scraping are not ways back in;
  don't propose them. The only re-entry path is the official Reddit Data API,
  using an owner-approved OAuth app with credentials the owner adds to
  `~/.config/news-digest/env`. Wait for the owner to say so here.

ack: 2026-11-02 item 14 — iteration 211 confirmed Reddit has no production collector, worker or schedule; Status/settings and docs now say parked by owner. No Reddit requests. Social completion now requires X only.

## 15. Owner decision: scheduled X search for every topic, every day (2026-11-02)

Item 9 currently allows **one scheduled `x_search` per day in total**, for the
weakest topic. The owner wants every topic covered daily. Searches so far cost
about $0.02 each, so four a day is about $0.10, well inside the caps.

- **Each scheduled run:** one search per enabled topic per day, before the
  edition.
  - Run them in weakest-first order (fewest verified free X posts), so if a cap
    is hit, the topics that need it most were already served.
  - Concurrency is fine within xAI rate limits.
- **Second search:** allowed for a topic only when its first search added
  fewer than about 3 verified posts, and only if the day's projected spend
  stays under the cap.
- **Admission:** change the durable daily admission from "one per UTC day" to
  "one (or two, per the rule above) per topic per UTC day". Keep it atomic
  under the shared budget lock, before any HTTP call.
- **Caps unchanged:** $0.40/day and $12/month for X; the xAI prepaid credit is
  the hard backstop. Keep the post-count-minimizing rules in item 6.
- **Report:** keep the daily report of per-topic cost and incremental
  verified posts for the first week.
- **Tests:** use fakes only; no paid calls to verify admission.
- Ack here after the first full scheduled run, with per-topic cost and yield.

ack: 2026-11-03 item 15 — iteration 425 read the first full scheduled account-list run: World $0.036680/5 new verified posts, Gaming $0.036815/5, NBA $0.037582/5, Tech/AI $0.025979/3; total $0.137056, 18 fetched/new verified, zero holds. All four calls succeeded, no outside-list additions. Daily/first-week reporting continues under item 9; no extra paid verification.

## 16. NEXT PRIORITY: open X discovery, not just account lists (2026-11-02)

**Why:** the owner wants the cool, viral and newsworthy posts in each field,
and many of those come from small or unknown accounts that blow up. Today
nothing searches for them:
- free harvesting only finds tweets that articles already embed, so it lags;
- the paid `x_search` adapter *requires* 1–20 curated handles and asks for at
  most 5 posts from them;
- selection judges relevance only, with no engagement or virality signal.

**Build:**
- **Open topic search (main path).** One scheduled `x_search` per topic per
  day with **no `allowed_x_handles`**. Ask for the most-engaged, fastest-rising
  original posts on the topic in the last ~24 hours, using keyword plus
  semantic search.
  - Derive the queries from the topic's name and guidance.
  - Exclude bait, crypto/giveaway spam, engagement farming and reposts of
    plain headlines.
  - Allow requests without handles in the adapter and contracts. Keep handle
    validation for the account-list path.
- **Top-story reactions.** After open topic search, if budget remains, search
  X for the most-engaged posts about the day's 1–2 biggest stories per topic.
  These are known from the article pipeline. This is how a random user's
  viral take on a news event gets found.
- **Account lists become secondary.** The curated-handle search runs only
  with budget left over after open search. It's an input, never the only
  paid path.
- **Engagement signal:** have each search return per-post like, repost, reply
  and view counts, plus post time, alongside the URLs.
  - Store them as `reported_by: xai_search` with an observed-at time. Never
    label them as verified.
  - Rank X posts on engagement and velocity (relative to post age) combined
    with topic relevance, not relevance alone.
  - Every post still has to pass the existing official oEmbed check before it
    is shown.
- **Budget: keep the current caps** of $0.40/day and $12/month for X (owner
  decision); the prepaid credit stays the backstop.
  - Search fees are $5 per 1k posts fetched, so fit open search inside the
    cap: tight prompts, few results per search, `max_turns` 1–2.
  - Measure `x_posts_fetched` and the cost per search, then tune.
  - Priority order within the cap: open topic search for every topic, then
    top-story reactions, then account lists.
- **Item 15:** its per-topic daily search becomes the open search. Ack 15 from
  the first scheduled run as planned, then switch.
- **Report** per topic and per search type: posts fetched, cost, new verified
  posts, and how many came from accounts not on any curated list.
- **Done when:** an edition shows X posts in all four topics that include
  high-engagement posts from accounts outside the curated lists, within the
  caps, with desktop/mobile screenshots.

## 17. LOWER: better curated X account lists (2026-11-02)

After item 16. Review each topic's curated handles (up to 20) against the bar
"accounts whose posts are often viral, newsworthy or first-hand". Think
insiders, reporters, builders, researchers and leakers, not just official
brand accounts. Keep them editable in settings and record the choices in
docs/SOURCES.md. This supplements item 16 and never replaces it.

ack: 2026-11-03 item 17 — iteration 315 followed item 22: reviewed and saved all four editable curated lists (11/10/12/11 handles), added builders/reporters/players/developers, documented every retained/added/removed group in docs/SOURCES.md, verified API readback and desktop/mobile editing views. No paid search; effectiveness awaits scheduled evidence.

ack: 2026-11-03 item 17 follow-up — owner item 23 arrived before push; restored and read back the original live lists (8/8/9/9). Reviewed lists and screenshots remain documented, pending activation after the Nov 3 run is measured and acknowledged.

ack: 2026-11-03 item 17 activation — iteration 431 saved and read back the reviewed 11/10/12/11 lists after the Nov 3 run was measured and acknowledged. Read-only desktop/mobile checks match all four live lists; open-topic search remains primary. No paid calls; effectiveness awaits scheduled evidence.

## 18. NEXT: Bluesky as the #3 social source, open discovery first (2026-11-02)

After items 16–17. Use the official public AT Protocol / Bluesky API only;
no scraping.
- **Open discovery first**, the same idea as item 16:
  - per-topic `searchPosts` with `sort=top` over the last ~24 hours;
  - relevant public feeds (for example trending or topic feeds) if they're
    useful.
  - Curated accounts are secondary.
  - Bluesky returns real like, repost and reply counts: store them and rank
    on engagement, velocity and relevance.
- **Auth (owner provided, 2026-11-03):** `BLUESKY_HANDLE` and
  `BLUESKY_APP_PASSWORD` (an app password, no DM access) are in
  `~/.config/news-digest/env`. Log in with `com.atproto.server.createSession`
  on `https://bsky.social`, reuse and refresh the session rather than logging
  in per request, and send searches to the account's PDS with the token.
  Verified then: login 200, and logged-in `searchPosts` with `sort=top` and
  `since` returns 25 posts per page, cursor pagination included.
  Logged-out search on `public.api.bsky.app` returns 403 and `api.bsky.app`
  is undocumented; use them only as a fallback when the variables are
  missing. Never log the password or tokens.
- **Fetching:** respect rate limits and back off. Store posts as `SocialPost`
  with platform `bluesky`.
- **Rendering:** Bluesky's official embed or a faithful card.
- **Ranking:** below X, the same as Reddit was meant to be.
  > **Changed by item 40 (2026-11-05):** Bluesky may now take one X slot per
  > topic. Item 40 wins where the two differ.
- **Done when:** real Bluesky posts appear in a generated edition for the
  topics where Bluesky has real activity, with screenshots. Record per-topic
  yield in docs/SOURCES.md; it's fine if some topics have little.

## 19. NEXT: group duplicate stories (2026-11-02)

> **Superseded by item 26 (2026-11-03):** no wording rules in code; grouping
> is decided by an AI pass. The bullets below about non-AI clustering no
> longer apply.

After item 18. An edition shouldn't show near-duplicate stories from
different outlets about the same event.
- **Cluster articles about the same event:** shared links or X citations,
  title and entity similarity, and time proximity.
  - Start without AI (no budget needed).
  - Later, an AI pass may confirm borderline merges within the existing
    budget, never spending the scheduled-edition reserve.
- **Show one story per event,** with its best summary plus "also covered by"
  outlet links.
- **Use cluster size** (independent outlets) as an importance signal in
  ranking.
- **Never merge different events.** Test with fixtures built from real items,
  with hand-checked labels for same and different events. Report precision on
  them.
- This covers M5's "semantic event clustering".

## 20. Owner priorities and exclusions (2026-11-02)

- **Order now:**
  1. When the Nov 3 scheduled runs happen, verify and ack items 13, 7 and 15,
     fixing anything they show.
  2. Otherwise: 16 → 17 → 18 → 19.
  3. Then item 10.
  4. Items 2a/2b and 4 go to the bottom. Don't keep adding database
     characterization tests while these items are open.
- **Not now:** feedback buttons (👍/👎, "less like this") and email delivery.
  Don't build them unless the owner asks.
- **Fix:** docs/SOURCES.md labels ESPN NBA RSS "parked by owner". It was never
  parked by the owner: it returned empty responses and was replaced by CBS.
  Correct the label.

## 21. Owner work in progress: handbook, docs site and DB schema explorer (2026-11-02)

The owner and Claude added system documentation and two internal tools:
- `docs/handbook/` (Markdown + Mermaid), served at `/docs/` by
  `apps/docs-site` (unit `news-digest-docs`, loopback :8100);
- a live DB schema explorer at `/db/`, from `apps/schema-explorer` (unit
  `news-digest-schema`, loopback :8200), plus `docs/schema-meta.json`;
- `apps/api/src/internal-tools.ts`: the API forwards `/docs/*` and `/db/*`
  to those services.

**Update (2026-11-03): the owner approved the handbook and the explorer.**
- **The "don't edit" rule is lifted.** Maintaining `docs/handbook/` and
  `docs/schema-meta.json` is now a standing duty: see AGENTS.md, "Owner
  handbook and DB explorer metadata".
- **Keep both services running and green,** like any other `news-digest-*`
  service.
- **Don't spend iterations adding features to the docs site or explorer
  tools** unless they break or the owner asks.
- **Ack here once you've confirmed** `scripts/check-handbook.ts` passes, and
  you've assigned any tables added since 2026-11-02.

ack: 2026-11-03 item 21 — iteration 295 ran the full handbook check: 16 pages, 21 diagrams, no rendering or link errors; all 24 live tables assigned with no schema metadata warnings. Docs and schema services are active and their proxied endpoints return HTTP 200.

## 22. Don't idle while waiting for evidence (2026-11-03)

Iterations 296–314 only recorded "pending scheduled evidence", each one
rerunning the full suite, restarting services and committing a status note.
- **Blocked only on live evidence? Move on.** If the current item can't
  progress until a scheduled run produces evidence (now: activating item 16
  and the item 13/7/15 acks wait on the Nov 3 15:00 UTC run), start the next
  item in the item 20 order: **17 now, then 18**. Return to the blocked item
  as soon as the evidence exists; that takes priority again.
- **No status-only commits while waiting.** Don't commit just to record that
  evidence is still pending or that services are healthy.
- **Don't restart services** unless code or config they run has changed, or
  they are unhealthy.
- No ack needed; the next commits show it.

## 23. Protect the Nov 3 scheduled run (2026-11-03)

The 15:00 UTC run is the evidence for items 13, 7 and 15 and the gate for
activating item 16. It must test today's production behavior.
- **Build and test freely overnight**, but anything that changes what a
  production edition contains or costs stays **switched off in production**
  until that run's results are recorded and acked. This includes Bluesky
  posts in editions, story grouping and ranking changes, and open X search.
  Use a setting or flag that is off by default.
- **Bug fixes for the current pipeline are still fine.** Keep the services
  green, and finish deploys and restarts by 14:30 UTC.
- **Item 18 has its Bluesky login,** so it isn't blocked: build and test it
  live, but keep Bluesky out of production editions until the run is acked.

## 24. LOW PRIORITY, background: observability (2026-11-03)

Owner-approved design: [docs/observability-plan.md](docs/observability-plan.md).
The goal is as much observability as the VM can afford: logs, errors,
requests, jobs, host, services, database, Redis, product numbers and the
agent harness. It must be free, open source and run on the VM only, with UIs
for the owner and query APIs plus an `obs` CLI for the agent.
- **Only when product work is done or blocked** (item 20 order, item 22).
  Product work always comes first; when a product item becomes unblocked,
  return to it immediately.
- **One piece at a time** (O1–O11 in the plan). Finish and verify each piece
  with `scripts/check-observability.ts`, update the handbook, and tick it in
  the plan before starting another. Never leave a service half-installed.
- **Resource budget:** about 500 MB RAM, under 5% of one CPU and about 3 GB
  disk for the whole stack, enforced with unit limits. If a tool exceeds
  its budget, scale it back or remove it.
- **Never restart Postgres or Redis within 2 hours of the scheduled
  edition.** Item 23's freeze before the Nov 3 run also applies.
- **No paid services** or third-party log or metric hosting. Don't swap a
  chosen tool without a short note in `docs/decisions/`.
- **Logs must never contain secrets.**
- No ack needed; ticked pieces in the plan show progress.

## 25. Stop the test-volume leak; observability focus (2026-11-03)

- **Disk leak (fix soon, small):** `scripts/test-isolated.ts` left 266
  anonymous Docker volumes (5.6 GB). Disk went from 57% to 64% overnight.
  The owner pruned them on Nov 3 (disk now 42%).
  - Give the test Postgres and Redis containers tmpfs data dirs
    (`withTmpFs`), so no volume is created, even when a run is killed or
    times out.
  - Verify that `docker volume ls -qf dangling=true` stays at 0 across
    `pnpm check` and an interrupted run.
  - Also prune dangling volumes if any appear.
- **Observability (item 24): next is O9 alerts, then O7, O8, O10.**
  - Stop refining the `obs` CLI and existing dashboards unless they're
    broken.
  - O9 must include a disk alert (it would have caught this leak), the
    other alerts in the plan, and `obs alerts` at iteration start.
  - Grafana uses about 280 MB, which puts the stack slightly over budget.
    Trim it if that's easy (disable unused plugins and features).

## 26. Story grouping: remove wording rules, use AI (2026-11-03)

Supersedes item 19's approach. **The owner does not want hand-written wording
rules for grouping anywhere in the codebase.**

**Priority:** first check the Nov 4 scheduled run and fix item 7 (NBA's AI
fallback and the 232 s edition). Then do this item, removal first.
- **Clarification (2026-11-03 19:30 UTC): don't wait for the Nov 4 run.**
  Under item 22, waiting for it only blocks the *verification*. Now:
  1. Investigate and fix item 7 offline with recorded data.
  2. Do the removal below.
  3. Then build the AI pass.

  Check the Nov 4 run when it happens; that takes priority again then.

**1. Remove (small, do it first):**
- `sameEvent`'s word-overlap, verb-list and number-order logic in
  `domain/cluster.ts`;
- `studio-event.ts`, `game-event.ts`, `preload-event.ts`,
  `remake-event.ts`, `title-reveal-event.ts` and their tests;
- `EDITION_EVENT_GROUPING_ENABLED`, and the rule-specific parts of
  `scripts/evaluate-event-grouping.ts`.
- **Keep:**
  - the generic plumbing that groups by any matcher;
  - the edition's "also covered by" coverage links;
  - the 60 labelled pairs in `event-grouping-pairs.json`, as the evaluation
    set.
- **Until the AI pass ships, production does no grouping.** Same-URL dedupe
  at ingestion stays. Update RANKING.md, the handbook and the golden
  fixtures to match.

**2. Build the AI pass:**
- **One Haiku call per topic** over the ranked shortlist (about 25–40
  candidates: id, title, outlet, time, short excerpt). It returns groups of
  ids that report the same real-world event. The instructions say that when
  unsure, it keeps them separate, because precision matters more than
  recall.
- **Hints, owner-approved:** pairs that share an outbound link or cite the
  same X post are passed in the prompt as hints. The model decides; code
  never merges on them.
- **Validate the answer:**
  - only known ids;
  - each id in at most one group;
  - nothing across topics.
- **If the answer is invalid, or AI is unavailable or over budget, skip
  grouping;** the edition still publishes.
- **Budget:** part of the edition's normal AI budget, through the ledger
  and `llm_cache`. Measure its real cost and resize the scheduled reserve if
  needed.
- **Ranking:** cluster size as a ranking signal comes later, only after
  activation proves accurate.

**3. Evaluate, then activate:**
- **Run it once offline,** capped at $0.10 and outside 13:00–16:00 UTC,
  on:
  - the 60 labelled pairs;
  - one newly labelled recent day it hasn't seen.
- **Report precision and recall.** Activate only with **zero wrong merges**
  and recall clearly above the old 13/32. Then show a real edition with
  screenshots.
- **If it can't meet that, park item 19:** say so here, and leave no
  grouping code behind except the generic plumbing.
- Ack here when the removal ships, and again at activation or parking.

ack: 2026-11-03 item 26 removal — iteration 467 removes wording matchers, their flag and rule-specific tests/CLI options. Production does no grouping; generic plumbing, coverage links and recorded labels remain. AI pass and activation evidence remain open.

ack: 2026-11-03 item 26 parking — iteration 476 ran the once-only seven-window Haiku evaluation at 20:25–20:26 UTC: 7 successful calls, $0.008275; 138 labelled pairs, precision 76/78 (97.44%), recall 76/77 (98.70%), two wrong merges. Fresh NBA window: 20/20 positives, one wrong merge. Zero-wrong-merge gate failed, so item 19 is parked; inactive AI pass and paid runner removed, production keeps stories separate. Frozen memberships/labels and generic offline evaluator remain; no retries or activation.

## 27. Tonight's order; un-park grouping as "same story" (2026-11-03)

The Nov 4 07:00 PT edition is the first with open X search, the reviewed
lists, Bluesky and the compact triage output all live. Keep it a clean
read, and spend tonight on the daily-quality bugs.

**Order:**
1. **Item 7 bugs, offline, now:**
   - **World selected no social posts on Nov 3.** Find out why: was it
     collection, relevance, verification or the selection rules? Fix it.
   - **NBA stories fall back to non-AI every day.** Find the cause from the
     recorded data and the new validation logs, and fix what you can before
     the run.
   - **Edition time is 232 s against a 60 s target.** The next lever after
     compact output is triaging fewer of the 748 candidates, for example a
     tighter non-AI prefilter per topic.

   These fixes may ship to production, deployed and verified by 14:30 UTC.
2. **Item 19/26 un-parked: grouping by "same story"** (owner decision).
   The two "wrong" merges in the evaluation were the same story: an ejection
   plus teammates' reaction, and a cancellation trend plus one chief's
   action.
   - **New definition:** articles about the same news story within the
     edition window go together, including direct follow-ups, reactions and
     consequences. Clearly separate events that merely share people,
     teams, companies or a theme stay apart.
   - **Restore the inactive AI pass** from git history (it was removed in
     `364cb1b`), with the new definition in the prompt. No wording rules.
   - **Relabel against the new definition:**
     - the 138 pairs;
     - the 57 previously unlabelled merged pairs.
   - **Run one capped evaluation:** $0.05 at most, outside 13:00–16:00 UTC.
   - **Pass:** no merges of clearly unrelated stories, and at most about 1
     in 20 merges borderline. Report precision and recall.
   - **Keep it switched off in production until the Nov 4 run is checked.**
     If it passed, turn it on for the **Nov 5** edition and show
     screenshots. If it failed, park it again with the numbers.
3. **Nov 4 run (takes priority as soon as it happens).** Check and ack:
   - open X (cost, yield, outside-list authors);
   - Bluesky posts in the edition;
   - the reviewed lists;
   - edition time;
   - NBA AI or fallback, and its cause from the logs;
   - World social posts.
4. Then observability (item 24) in the background.

**Until the Nov 4 run is checked:**
- No new sources, and no other new production feature or activation.
- Item 7 bug fixes are fine (see step 1).

ack: 2026-11-04 item 27 scheduled review — iteration 646 checked edition 3bf10f5b-4c00-48b2-85bd-8e6dac7e3238: 151.532 s, $0.291162 Anthropic, mixed outcome, reserve released/zero holds. NBA Sonnet and Haiku each failed initial+repair unsupported-absence validation, proved by exact request fingerprints; no unscored NBA candidates. X picks Tech/NBA/Gaming/World 4/5/5/0, none from today's $0.149447/19-post open discovery; 11 selected posts outside current lists but no saved engagement reports. One Tech Bluesky pick with observed 767 likes/329 replies/342 reposts duplicates a selected X post. Reviewed 11/10/12/11 lists read back; desktop/mobile screenshots saved. World still empty; viral/all-topic and full-AI/speed acceptance remain open. See docs/edition-reviews/2026-11-04.md. No activation in this review; grouping/incremental triage remain off, NBA repair takes priority.

ack: 2026-11-04 item 27 activation — iteration 650 enabled LLM_STORY_GROUPING_ENABLED=1 for Nov 5 after the Nov 4 review and passed same-story gate (141/141 labelled precision, 141/157 recall; zero clearly unrelated/one borderline among 155 reviewed merges). Four grouping calls reserve at most $0.058192 combined at current prices, within $0.196315 remaining Nov 4 headroom; Nov 4 edition plus that bound is $0.349354, below today's $0.487477 cap. Existing 1.5x scheduled reserve already covers the full daily cap; no cap/model/provider changes or paid trial. Actual Nov 5 grouping cost, admission, accuracy, latency and real-edition screenshots remain to verify; NBA full-AI and World posts remain open.

ack: 2026-11-05 item 27 scheduled grouping measurement — iteration 847 verified four admitted grouping calls, $0.002103 combined, with four published multi-article groups: NBA historic game/injury/payment dispute and World midterm results/reactions/consequences. No clearly unrelated published coverage merge observed; raw grouping responses and recall remain unknown. All topics now AI-edited, World one X pick, no Bluesky picks. Separate editorial cross-story evidence concerns remain for Tech chip reports/Gaming Sony commentary; see docs/edition-reviews/2026-11-05.md and desktop/mobile light/dark screenshots docs/screenshots/ui/nov5-stories-*.png.

## 28. Never idle: work allowed before the Nov 4 run (2026-11-03)

Iterations 486–507 exited with no work for about two hours. Item 27 was
read as gating everything on the Nov 4 run. That was not the intent.
- **Observability (item 24) is allowed now.** It is not an edition feature.
  - **Next pieces:** the remaining O7 slow-query view, completing O9 alert
    coverage, and O10 if anything is left.
  - **Existing limits:** no Postgres or Redis restarts within 2 h of the
    edition, and deploys done by 14:30 UTC.
- **Edition speed (item 7): try other approaches offline.** Capping the
  candidate pool is ruled out (it lost stories).
  - **The main lever:** triage articles incrementally through the day as
    they're collected, so the 07:00 PT run only triages the remainder.
    - Each article is still triaged once, through `llm_cache`, so the cost
      stays about the same.
    - It uses the normal daily budget and never the scheduled reserve.
    - Articles that are never used still cost money: measure that waste.
  - **Other levers worth measuring:** concurrency, batch size and prompt
    size.
  - **Build it behind a setting that is off by default,** and test it on
    recorded windows. It goes live only after the Nov 4 run is checked.
- **Standing rule:** if every item in the current order is waiting on
  evidence, work down this list. Never end an iteration without useful
  work.
  1. Observability (item 24).
  2. Offline item 7 speed work.
  3. Items 2a/2b and 4.

## 29. Downtime queue: console, ORM; owner DB logins (2026-11-04)

These rank **below all product work** (items 7, 16–18, 26–28 and the
Nov 4 checks). When product work is blocked, the order is:
1. **Prod console (small).** Add `pnpm console` for use on the VM.
   - **What it does:** boots a Nest *application context* (no HTTP
     listener, no BullMQ workers, schedulers or timers) with the env file
     loaded, then opens a Node REPL. It exposes `app`, `get(Token)`,
     the repositories and a `db.query` helper.
   - **Prompt:** it shows that it is connected to production.
   - **History:** goes to a file outside the repo.
   - **Done when:** it's documented in the handbook Operations page, and a
     test proves no worker or timer starts.
2. **ORM refactor (item 2b)**, as specified there, one repository per
   commit with the 2a suite green.
   - Never deploy within 2 h of the scheduled edition.
   - Back up with `pg_dump` before the first new migration.
3. **Remaining observability pieces** (item 24).
4. **Stop adding new characterization tests** beyond what 2b needs
   (item 20).

**Owner database logins** (done by Claude on 2026-11-04):
- `owner_ro`: read-only, with a 60 s statement timeout.
- `owner_rw`: can change rows, but can't change schema.
- Their passwords are in the env file as `OWNER_DB_*`.
- Default privileges cover new tables created by `postgres`.
- **Keep them working through the ORM work.** If migrations create tables
  as another role, grant these logins access too.
- Never print the passwords.

**Docs tightening: done by Claude (2026-11-04).**
- **Rewritten:** README (465 → 92 lines), Observability (620 → 104), Social
  posts and Operations.
- **The editor role resumes** under the new "Short and plain" rule in
  AGENTS.md. `check-handbook.ts` now fails any page, or the README, over 100
  lines outside code blocks.
- **Moved content:** the removed caveats and test details are in git
  history. Put anything still needed in PROGRESS.md or the `docs/`
  references, not in the owner pages.

## 30. NEXT, top product priority: X search quality (2026-11-04)

Open X search is live, but on Nov 4 none of its 19 posts made the edition:
the NBA posts were betting promotions, World got roundups, and the best had
12 likes. The owner approved a redesign.
**Follow [docs/x-search-plan.md](docs/x-search-plan.md) exactly.**
**Item 34 replaces the design, experiment steps and model choice below.**
- **Priority:** this ranks above item 7 speed work and observability. Breakages,
  the Nov 5 checks of item 27 (grouping, NBA AI) and the morning-edition
  protections still come first.
- **Design:**
  - X ranks and filters, using Top sort, `min_faves` and the
    reply/retweet/language filters.
  - Story-reaction search is primary, topic-trending search secondary.
  - Code builds the operators and thresholds; Grok writes only keywords.
  - Store the queries Grok actually ran.
- **Experiment budget** (the owner added $5 of xAI credit): at most $2.50 in
  total and $1.00 per UTC day for the experiment, recorded apart from
  production spend. Never between 13:00 and 16:00 UTC.
  - **Raised 2026-11-04 by the owner, from $1.00/$0.50.** Use the extra to
    repeat the comparison on a second day and to calibrate thresholds, as
    in the plan.
  - Leave at least half of the top-up untouched.
- **Model:** the owner has no attachment to Grok 4.3. Pick the cheapest
  model that passes the plan's decision rule.
- **Production stays $0.40/day and $12/month.**
- **Replace, don't add:** delete the old follow-up and optional-slot
  machinery once the new schedule ships. No new prompt wording rules.
- **Acks:** one after the experiment decision (with its numbers), and one
  after 3 editions meet the plan's done criteria.

## 31. Owner decision: run the X experiment now (2026-11-04)

This resolves the "X comparison dispatch blocker" in NEEDS_FROM_HUMAN.md.
The owner **accepts the same per-call exposure production X search already
has.** No hard per-request cap is needed. The prepaid balance is the hard
ceiling.
- **Reserve $0.15 per experiment call** (about 4× the most expensive call so
  far), using the existing reserve-then-settle ledger.
- **Before each call,** don't start it if its reservation could push the
  total past $1.00 per UTC day or $2.50 overall.
- **After each call,** check the cumulative settled spend.
- **If any call settles above its $0.15 reservation, stop the experiment**
  and report the numbers. Going over by one call is accepted.
- **Run round 1 tonight,** outside 13:00–16:00 UTC, with the machinery that
  already exists.
  - **Stop adding experiment safeguards:** no more fencing, claims or
    validation layers. Item 30's time limit applies, and the harness is
    already past it.
  - **Next steps:** the second day, threshold calibration and the model
    round follow per the plan.
- Remove the blocker from NEEDS_FROM_HUMAN.md, and ack here with round 1's
  numbers.

ack: 2026-11-04 item 31 round 1 — iteration 703 dispatched all 12 cells at 21:46–21:53 UTC against Nov 3–4 21:00 UTC. Eleven settled calls cost $0.382331, fetched 47 posts; Gaming current returned no response at the 60 s transport deadline and retains $0.15 (total charged $0.532331), never retried. No settled call exceeded $0.15 (maximum $0.056935). Trending: 32 fetched/$0.226258, observed median/max likes 1714/16089; current: 13/$0.101068, 8/42; reactions: 2/$0.055005, likes unknown. All trending inputs joined the topic directly to -filter:replies; reaction Top/threshold/filters/OR matched. Coverage and reviews remain incomplete; no winner or production activation. Private raw evidence and offline report saved; details in docs/x-search-experiment.md. Next: disabled schedule/backups, offline query construction and review, second independent day under unchanged experiment caps.

## 32. Tonight's queue: X schedule switched off, nightly DB backups (2026-11-04)

These go after item 31's round 1 and before the fallback list (item 28).
**Item 34 replaces the A/B schedule in point 1 with one search per topic.**
1. **Build the new X search schedule now, switched off** (item 30, plan step 3).
   - Build the fixed A/B schedule (story reactions and topic trending) using
     the stored per-topic thresholds and exclusions, behind a setting that
     is **off by default**.
   - Prepare removal of the old follow-up and optional-slot machinery in the
     same change, to take effect when the setting flips.
   - Only the parameters wait for the experiment: style weighting, final
     thresholds and model.
   - Switch it on only after the experiment decision is acked. Never between
     13:00 and 16:00 UTC.
2. **Nightly database backups (small).**
   - A worker job, or a systemd timer, running `pg_dump` of `news_digest`
     nightly, away from 13:00–16:00 UTC.
     - Compressed custom format.
     - Written to `~/backups/news-digest/`, mode 700, outside the repo.
     - Keep 7 days.
   - **Prove a restore works:** restore the latest dump into a throwaway
     Postgres container, compare row counts for the main tables, then remove
     the container. Do this once now, then weekly.
   - **Alert** (vmalert, item 24) when no successful backup exists in the
     last 26 hours.
   - Document it in the handbook Operations page: where backups are, and how
     to restore.
   - Backups must not contain or print secrets beyond the data itself.
   - **Off-VM copies are out of scope.** They need an owner decision on
     where to store them.

ack: 2026-11-04 item 32 — iterations 705–708 prepared fixed A/B scheduling behind X_FIXED_SEARCH_ENABLED=1, off in production pending the experiment decision. Iteration 709 installed private nightly custom-format backups at 02:20 UTC, seven-day retention, Sunday 03:20 UTC disposable-container restore checks and the 26-hour vmalert. The first service restore matched all 26 application tables and 22,191 rows against the dump's exported snapshot; the container was removed. Backups are in ~/backups/news-digest/ (700/600), with no off-VM copies or paid calls. Operations links the restore instructions.

## 33. MID-LOW: UI rebuild, reader edition + admin (2026-11-04)

The owner finds the current UI busy and low quality. The home page is about
23,000 px tall, and most of it is admin data and system caveats.
**Build exactly [docs/ui-spec.md](docs/ui-spec.md)** (owner-approved).
- **Priority:** after items 30–32 (X search, X schedule, backups) and the
  Nov 5 checks. Ahead of the item 28 fallback list (speed, observability).
- **Stack (owner decisions):**
  - a client-side SPA only, no SSR;
  - **TanStack Router** with a code-based route tree;
  - **TanStack Query**;
  - **Tailwind v4 + shadcn/ui**;
  - Inter, self-hosted.
- **Structure:**
  - the reader sees only the edition (`/`, `/editions`, `/editions/:id`),
    with a contents sidebar;
  - **everything else goes under `/admin`,** gated server-side by
    `X-ExeDev-Email` in `ADMIN_EMAILS`. That covers status, sources, spend,
    scores, settings, the edition inspector and on-demand editions;
  - **settings and on-demand editions are admin-only.** The reader has no
    settings.
- **Reader copy:** no "why it matters", "auto-ranked", scores or other
  system language. The spec lists the forbidden terms, and a test enforces
  them.
- **Build order:** the spec's five shippable steps, in order. **The reader
  page must never break between steps.**
  - **Step 2 (admin gate):** check how proxied requests arrive before
    trusting loopback.
  - Keep the agent's own scripts working.
- **Done when:**
  - every route has desktop and mobile screenshots, light and dark, in
    `docs/screenshots/ui/`;
  - the forbidden-terms test and the admin-404 test pass;
  - the edition page is about 3 desktop screens per topic or less.
  - Ack here with screenshots linked.
- **Guardrails:** no reader features beyond the spec, no other UI libraries,
  and no hand-written component CSS where shadcn has a component. Update the
  handbook (Stack & runtime, Operations) within its length limit.

ack: 2026-11-06 item 33 — iteration 971: repaired the existing selected-edition replay after compact mobile dates changed; saved stories, post text and original links remain selected through delayed latest success/error across desktop/mobile light/dark. No runtime or spend changes.

## 34. NOW: X search redesigned around viral posts (2026-11-04)

The owner clarified the goal, and the plan changed. **Paid search exists to find
viral posts the news hasn't picked up.** The free mined links already work and
already cover posts tied to stories, so paid story reactions would duplicate
them. **[docs/x-search-plan.md](docs/x-search-plan.md) is rewritten: follow it
exactly.** This replaces the design parts of items 30–32. Their budget,
guardrail and reporting rules still apply.

- **Priority:** this goes ahead of item 33. Finish your current UI step
  cleanly, then do step 1 below, then return to the UI whenever X work is
  waiting on a time. Nov 5 checks and edition protections still come first.
- **What changes:**
  - **One paid search per topic.** Drop story reactions and trending as
    separate styles.
  - **Grok writes keywords fresh on each search,** from the topic description:
    a mix of general topic words and well-known names, **not** headlines.
  - **No saved keyword lists.** The owner doesn't want anything to maintain.
  - **Code builds the rest of the query,** including the exact time filter.
  - **Exclude `-giveaway`** on every topic.
  - **16 posts per search,** about $0.37 a day under the unchanged $0.40 cap.
  - **The AI scorer gets author, reported likes and whether a post has media.**
  - **Stay on Grok 4.3.** The model round is dropped.
- **Order:**
  1. **Tonight:** build the query changes in the experiment path and the
     switched-off schedule. No paid calls.
  2. **After the Nov 5 edition, not before:** the scorer change.
  3. **After 21:00 UTC on Nov 5 and on Nov 6:** two test rounds, each on a fresh
     24-hour window. Each round also runs one meaning-based search per topic,
     as a test only. About $0.58 a round, about $1.69 of the $2.50 in total.
  4. **Decide** with the plan's rule, ack the numbers, and ship. The earliest
     edition is Nov 7.
- **Decision rule, changed:** a post counts only if it's in the window, on
  topic, not a promotion after AI scoring, at or above the likes minimum, and
  **not already found by the free links.** Promotions in raw results no longer
  count against a search.
- **Stop:** no more offline analysis of round 1. Its query problems are
  understood.
- **On shipping:** delete the old search, follow-ups, optional slots and
  story-reaction code. Keep the saved account lists.
- **Acks:** one after the decision, with its numbers, and one after 3 editions
  meet the plan's done criteria. Report World separately.

## 35. NOW, small: bring back story text when a topic has no AI summaries (2026-11-05)

The owner noticed NBA stories now show headlines only. **This is a regression
from the UI rebuild,** not lost data:
- NBA fell back to non-AI ranking on Nov 3 and Nov 4, so its stories have no AI
  summary, only an article excerpt.
- The old page showed `story.summary || story.excerpt`. Commit `8d61e17` dropped
  the excerpt: the reader contract leaves it out, and the page shows only
  `summary`.
- The spec wording was unclear, and is now corrected in
  [docs/ui-spec.md](docs/ui-spec.md). It banned the *word* "excerpts" and any
  fallback *label*, not the story text.

**Do this next, before more UI work, and deploy before 13:00 UTC:**
- In the reader mapping, set `summary` to the AI summary, or else the saved
  excerpt. Keep the excerpt as a plain summary: no new field, no label.
- This applies to any story missing a summary, in every saved edition.
- **Test:** the Nov 4 edition's NBA stories all return non-empty text from
  `/api/editions/:id`, and the forbidden-terms test still passes.
- Screenshot NBA on desktop and mobile.
- Don't change stored editions.

**Also check today's edition:** this fix only covers the symptom. If NBA falls
back again on Nov 5, finding out why ranks first, ahead of items 33 and 34. Ack
here with both results.

ack: 2026-11-05 item 35 symptom fixed — iteration 738 reader mapping now uses AI summary or saved article text for every saved edition without changing storage. Nov 4 NBA returns text for all five stories; topic forbidden-label check passes. Screenshots: [desktop](docs/screenshots/ui/nba-story-text-desktop.png), [mobile](docs/screenshots/ui/nba-story-text-mobile.png). Deployed before 13:00 UTC. Nov 5 edition is still due at 15:00 UTC; its NBA outcome and fallback investigation remain first priority when available.

ack: 2026-11-05 item 35 scheduled outcome — iteration 847 verified Nov 5 NBA five AI-edited stories with non-empty reader text; no fallback. All four topics match saved titles/text desktop/mobile light/dark, no writes, edition unchanged. Screenshots docs/screenshots/ui/nov5-stories-1-{desktop,mobile}[-dark].png; review docs/edition-reviews/2026-11-05.md.

## 36. NOW: fix the story limit, get the UI moving, clean up /tmp (2026-11-05)

The Nov 5 edition was the first fully AI-edited one. Well done. The owner approved
these three, in this order. The X test rounds of item 34 still run when due,
after 21:00 UTC.

1. **Keep 10 stories, not 10 articles.**
   - **Bug:** `editorialShortlist` in
     `apps/api/src/modules/digests/domain/editorial-shortlist.ts` sorts by
     importance and does `.slice(0, 10)` **before** grouping. On Nov 5, World had
     71 candidates with relevance and importance of at least 6. The top 10
     articles were 8 midterm reports and 2 Hormuz reports, so they became 2
     stories and nothing else reached the editor.
   - **Fix:** group a larger scored pool first, then keep the top 10 stories
     for the editor. Pick the pool size from evidence. Don't touch the grouping
     prompt, and add no topic-specific logic or wording rules.
   - **Prove it before deploying:** replay the saved Nov 5 World window with no
     paid calls where possible, and show that more distinct stories reach the
     editor. Check Nov 4 World too: confirm whether the same limit caused its
     single story.
   - **Cost:** report how it changes grouping and editing cost. The edition must
     stay inside the daily cap and reserve.
   - **Deploy before 13:00 UTC on Nov 6,** or leave it for the next day. Don't
     risk the morning edition. Review the result in the Nov 6 edition review.
2. **Build the UI now (item 33).** The Nov 5 checks are done.
   - **You are not blocked.** `ADMIN_EMAILS` has been set on the VM since Nov 5
     02:00 UTC, and `/api/me` returns `isAdmin: true` for the owner's email.
     Correct the stale notes in NEEDS_FROM_HUMAN.md and the access decision.
   - **The proxy forged-header check only matters before the VM goes public.**
     The VM is private, and it stays private. Don't wait for it.
   - **Finish step 2, then build the spec's admin pages and final reader,** in
     the spec's order. Delete replaced screens as each new one lands.
   - **Stop hardening what's being replaced:** no more keyboard-focus,
     error-recovery or verification work on old screens, and no more on-demand
     job-link recovery work. Only breakages count.
   - **This overrides item 28's fallback list.** While item 33 is open, UI
     building is what you do when X work is waiting.
3. **Clean up test leftovers (small).** `/tmp` holds 22 `node-coverage-*`
   directories of about 139 MB each, and disk went from 49% to 57%.
   - Find what leaves them behind and fix it at the source, then delete the
     existing ones. Never delete anything else in `/tmp` that a running process
     is using.

**Acks:** one for the story limit, with before and after World story counts and
cost. Item 33's ack stays as written.


ack: 2026-11-05 item 36 story limit — iteration 872 activates forty scored articles before grouping, retaining ten stories for the editor. Actual saved World replay: Nov 4 1→10 editor inputs (1→5 reviewed story labels); Nov 5 3→10 inputs (2→7 labels). Model stories including singletons: Nov 4 1→16, Nov 5 3→20; election fragmentation remains, no returned group crosses reviewed labels. Four Haiku verification calls cost $0.005837, recorded as verification; responses/fingerprints saved for offline replay. All-topic first-attempt grouping/editor scenario $0.464371 fits unchanged $0.473168 reserve and projected cap; future admission still enforced. Deployed before Nov 6 13:00 UTC; review scheduled Nov 6 outcome. Evidence: docs/edition-reviews/2026-11-05-world-story-pool.md. UI step 2 next; cleanup remains open.

## 37. LOW, blocked on the owner: off-VM backups to Cloudflare R2 (2026-11-05)

Backups live only on the VM, so losing the VM loses them too. The owner chose
Cloudflare R2, for both the database and the VM.

**Blocked until the owner adds the settings listed in NEEDS_FROM_HUMAN.md.
Don't build any of this before then.** After that, it ranks below items 33, 34
and 36.

- **Database:** upload each nightly dump after it finishes. Keep 30 days in R2.
- **VM:** first check whether exe.dev offers a whole-VM snapshot we can export.
  If not, make a weekly bundle of what the repo can't rebuild:
  - `~/.config/news-digest/env`;
  - systemd units and `obs-*` service files;
  - `~/.local/state/news-digest/`.

  Keep 8 weekly bundles. Leave out the repo, `node_modules`, caches, and metrics
  and log data. Add anything else a rebuild turns out to need.
- **Encrypt everything before it leaves the VM** with `age`, to the public key
  in `BACKUP_AGE_RECIPIENT`. The VM bundle contains secrets. The private key
  stays with the owner and never goes on the VM.
- **Credentials:** a token limited to this one bucket, stored only in the env
  file. Never print or log it.
- **Prove it works:**
  - Download each new object type once and compare its checksum.
  - Write the exact commands for the owner to download, decrypt and
    `pg_restore --list` a backup on their Mac. The agent can't decrypt.
  - Write a short rebuild-from-nothing guide in the handbook, within its length
    limit.
- **Alert** (vmalert) when no database upload has succeeded in 26 hours, or no
  VM upload in 8 days.
- **A failed upload must never affect editions** or the local backups.
- **Ack** with sizes and monthly storage use.

## 38. Never idle, and choose work that matters (2026-11-05)

Item 28's rule stands: **never stop and never wait.** The list below replaces
its fallback list. On Nov 5,
116 commits went to polishing screens about to be replaced, while the
owner-approved admin pages weren't built. Being busy isn't the goal. Each
iteration should leave the product noticeably better.

**Pick the highest item that has work available:**

1. Breakages and scheduled-edition protection.
2. Open STEERING items, in their stated priority. If one is waiting on a time,
   the owner or evidence, go to the next item. Don't wait for it.
3. **What the reader sees.** Read the latest edition as a reader would, and fix
   the biggest weakness: thin or repeated stories, weak posts, missing topics,
   poor summaries.
4. Bigger gaps that make the app better: edition speed, source coverage,
   milestones in TASKS.md.
5. Smaller tasks. These are fine, and better than stopping, but only once 1–4
   have nothing available.

**Before starting, ask: would the owner notice or care if this shipped?** Write
the one-line answer in PROGRESS.md. If the honest answer is no, look again at
1–4 first.

**Warning signs. Change direction if you see these:**

- Three iterations in a row on the same small area with nothing the owner would
  see.
- Handling a failure that has never happened and isn't likely.
- Adding checks, verification or error handling to code that's being replaced.
- Re-analysing evidence that already answered the question.

**If you think you're blocked, check first.** Read the actual setting or file,
and don't trust an old note. Then keep working on something else.

**Product ideas:** when 1–4 run dry, add your best ideas to `docs/ideas.md`, a
few lines each, with what it would cost. Keep working while the owner reviews
them. Don't build new product features, or anything needing new spend, new
vendors or a change to the owner's decisions, without approval.

All existing budgets and constraints still apply.

## 39. NOW: make X search reliable, then finish the test (2026-11-05)

On Nov 5, only 1 of 4 keyword searches ran. Tech worked: 10 posts, median 1,580
likes, 2 usable, none in the free links. NBA's tool call failed, Gaming hit the
60-second limit, and World's query was written but never run. Grok's queries
looked good, so this is plumbing, and it blocks the decision. **This goes ahead of
item 33.** Item 31's no-retry and hold rules are changed only as written here.

1. **Reliability, in the experiment path and the switched-off schedule:**
   - Make the search actually run. Check xAI's docs for a supported way to
     require the tool, such as `tool_choice`, and use it if there is one.
   - Raise the request time limit to 120 seconds.
   - Retry a call **once** if it fetched no posts: tool failed, tool never ran,
     or timed out. Admission and caps still apply to the retry. A search that
     ran and found nothing is a valid result, so never retry that.
2. **Accounting:**
   - A response that returned token usage settles at its real cost, even when
     `x_posts_fetched` is missing. Treat that as zero fetched.
   - Settle the Nov 5 NBA and World holds from their saved usage. Append to the
     journal, and don't rewrite evidence.
   - Timeouts with no response keep their hold.
3. **Rerun Nov 5's three failed keyword searches (NBA, Gaming, World),** on the
   same Nov 4–5 window, once 1 and 2 are done. Do this after 00:00 UTC on Nov 6,
   never between 13:00 and 16:00 UTC. About $0.20.
4. **Fair semantic test in the Nov 6 round.** The Nov 5 queries were essentially
   the topic description, with its "Exclude:" text and `-` operators. Grok
   also returned an empty list, so likes were lost.
   - The query should ask what's new and getting attention in the topic. Leave
     out the description's exclusions and all operators.
   - Pass the exact window, as the keyword search does.
   - Return likes and other counts where the tool gives them.
   - **Why it stays:** it's the only search that can find a post with no topic
     word in it. If it still finds no popular posts that keywords missed, it's
     dropped.
5. **Decision rule:** the plan now says passing the scorer (relevance ≥ 6,
   interestingness ≥ 4) counts as not a promotion. Don't report promotions as
   unknown or wait on manual labels.

**Result limit:** use what the tool allows, and report what it is. Nov 5 used 10.

**Budget:** about $1.93 of the $2.50 in total, or less after settling. The $1.00
per UTC day limit stands. If the budget runs short, keyword cells go first.

**Timing:** the Nov 7 edition stays the earliest. The decision needs Nov 5 and
Nov 6 data with all four keyword searches run, or a clear report of why not.
**Ack** with the failure rate after these fixes, because it decides whether this
can run in production.


ack: 2026-11-06 item 39 reruns — iteration 910 reran NBA/Gaming/World keywords once each on the unchanged Nov 4–5 21:00 UTC window, with required tool choice and 120 s deadline. Post-fix failure rate 2/3 (66.7%): NBA/World returned failed tool calls and zero posts; Gaming completed with three in-window, officially embed-verified posts (median/max likes 1,058/1,063). All usage settled: $0.048153, lifetime charged $1.025802/$2.50; historical timeout holds preserved. No further reruns, winner or production activation. Scorer review and fair semantic Nov 6 round remain. Evidence: docs/edition-reviews/2026-11-05-x-experiment-review.md.

## 40. NEXT: get real Bluesky posts into editions, and show why when none appear (2026-11-05)

**Why:** Bluesky collects hourly, but only one post has reached an edition, and
it repeated an X pick from the same author. There are two causes:

- **Leftover slots only.** `bluesky-edition.ts` gives Bluesky only the slots X
  left empty. NBA and Gaming had none on Nov 4 or Nov 5, so Bluesky was never
  considered there.
- **Silent editing failures.** The Nov 4 and Nov 5 call records show rejected
  replies. On Nov 4, both topics that reached the editor used all four
  attempts. On Nov 5, one topic used Haiku without any Sonnet call, and nobody
  yet knows why. `preview.repository.ts` ignores the Bluesky status, so a
  failure looks the same as "nothing good today".

**Priority:** after the Nov 6 edition review, ahead of the UI rebuild, as listed
in Current order. If item 39 is waiting on a time window, use that gap for steps
1 and 2.

**Do these in order:**

1. **Find out and show why, per topic.**
   - Read the worker logs for the Nov 4 and Nov 5 editions (Nov 6 too once it
     has run), using `llm.validation` and `budget.decision`. Record for each
     topic: open slots, which models ran, each rejection category, any budget
     refusal, and why Sonnet was skipped on Nov 5. Check the real logs, not
     these notes.
   - One pass only. If the logs can't answer something, say so and move on.
     Rejected text wasn't kept: don't try to recover it, and make no paid
     replays.
   - Save a Bluesky outcome for each topic with every edition: open slots,
     candidates read, candidates shortlisted, posts picked, and one result.
     The results are: no slot, no candidates, nothing passed triage, editor
     chose none, picks made, AI editing failed, budget refused, switched off.
     Today "no slot" also reports as `complete`, so separate them. Older
     saved editions must still load.
   - Add the step (`purpose`) and topic to `llm.validation` and
     `budget.decision`. Today neither line says which step or topic it belongs
     to. Keep the rule that no rejected text enters logs.
   - Show the result as one short plain line per topic in the admin edition
     inspector, such as "Bluesky: AI editing failed". Nothing changes for
     readers.
   - If this is ready before 13:00 UTC on Nov 6, deploy it so the Nov 6 edition
     records outcomes. If not, leave it for the next day.

2. **One bad post costs only that post.**
   - In Bluesky editing, a reply with one bad post currently loses every pick
     for that topic. Check each post separately. Keep the valid ones and drop
     only those that fail: too-long fields, unknown or repeated IDs, unsupported
     claims, or picks past the budget.
   - Retry only when no valid post remains and the reply wasn't a deliberate
     empty list.
   - Count dropped posts by category in the saved outcome.
   - Change Bluesky only. X selection behaves as it does now.

3. **Hold one slot for Bluesky (owner decision).** Build it behind a setting
   that is off by default.
   - Run the Bluesky editor for every topic with a post budget, asking for at
     least one post even when X filled every slot.
   - If it picks a post and no slot is open, that post replaces the X pick
     ranked last. Check that the saved order really is the editor's ranking.
   - Replace at most one X post per topic. If nothing qualifies, X keeps all its
     slots. The topic total never exceeds its post budget.
   - Bluesky can still fill any other empty slots, as it does now.
   - **Switch it on when both are true,** using the Nov 6 edition:
     - it was fully AI-edited, with no AI step refused for budget;
     - 1.5 × (Nov 6 edition cost + estimated extra Bluesky cost) fits under that
       day's daily cap. Estimate the extra from Nov 6's saved triage and editor
       usage, with no paid test.
   - If either fails, leave it off, ack the numbers and wait for the owner.

4. **Tidy up.** Correct `docs/SOURCES.md` (its table still says "editions off"),
   the "never used by production" comments in `bluesky-ranking.ts` and
   `bluesky-shortlist.ts`, the "never displace" comment in `bluesky-edition.ts`
   once step 3 is live, and the handbook's social posts page.

**While waiting** for the Nov 6 edition: do steps 1, 2 and 4 and build step 3.
If those are finished, go back to Current order.

**Don't:**

- lower the relevance or importance bar, or weaken the unsupported-claim check,
  to force picks. Quiet days may have no Bluesky post;
- let a Bluesky post repeat something X already covers;
- change collection, search queries or caps in this item;
- keep tuning. If three editions after switch-on have clean outcomes and no
  picks, stop and report them. The owner decides what's next.

**Done when:**

- every edition saves a Bluesky outcome for every topic, visible in the
  inspector;
- a failure in Bluesky editing can no longer look like "nothing good today";
- the slot is on, or the ack gives the numbers that kept it off;
- a Bluesky post distinct from the X picks appears in a published edition, with
  screenshots, or three editions show recorded reasons why not.

**Ack with:** what happened per topic on Nov 4 and Nov 5, including the Sonnet
skip. Then, for the first three editions after switch-on, per topic: outcome,
picks, any X post replaced, and added cost.

**Limits:** no deploys between 13:00 and 16:00 UTC, and protect the morning
edition. Existing AI budgets and caps stay. If a budget would need raising, ask
the owner.

ack: 2026-11-06: iteration 914 reconstructed Nov 4–5 per-topic outcomes in
[the historical review](docs/edition-reviews/2026-11-04-05-bluesky-outcomes.md).
NBA/Gaming had no slots; Nov 4 Tech recovered on Haiku, World exhausted four
attempts. Nov 5 Tech Sonnet chose none; World Sonnet was budget-refused, then
both Haiku replies failed validation. Exact budget constraint was not logged;
no paid replay. Historical investigation complete; saved outcomes next.

## 41. NEXT, small: alert when Bluesky fails or goes quiet (2026-11-05)

**Why:** item 40 saves a Bluesky result for every topic, but someone still has
to go and read it. Bluesky got no picks on Nov 5 and nothing flagged it.

**Priority:** as soon as item 40 step 1 is live, because these alerts read its
saved results. Don't wait for the rest of item 40. Bluesky only: other sources
stay as they are.

**What to do:**

1. **Add two alerts** to `ops/observability/alerts.yml`, with cases in
   `alerts.test.yml`. Work them out from saved editions, so a worker restart
   can't clear them. Scheduled editions only.
   - **`BlueskyEditingFailed`:** the latest edition has any topic with the
     result "AI editing failed" or "budget refused", or has no saved Bluesky
     result while Bluesky is on. It clears when the next edition has none of
     these.
   - **`BlueskyNoPicks`:** the last three editions each gave Bluesky a chance
     and each published no Bluesky post in any topic. A chance means at least
     one topic had an open or held slot. It clears on the next edition with a
     Bluesky pick.
   - Editions from before item 40 step 1, and editions with Bluesky switched
     off, don't count towards the three.
2. **Show them the usual way:** `pnpm obs alerts` and the admin Overview. Add no
   email, new service or new vendor.
3. **Update** the alert table in `docs/handbook/01-app/09-observability.md`.

**When one fires:** check the saved results and logs once, report what you found
and go back to Current order. `BlueskyEditingFailed` counts as a breakage to fix.
`BlueskyNoPicks` with clean reasons is not: it may just be quiet days, so report
it and don't tune anything. An alert you've already reported isn't a reason to
keep investigating.

**Don't:** make either alert fire on a single quiet day, or change item 40's
limits on quality bars and budgets.

**Done when:** alert tests cover both firing and clearing, including the
restart case and editions that don't count, `--verify-alerts` passes, and both
alerts load on the VM.

**Ack with:** the test results, and whether either alert is firing on real
editions.

**Limits:** no deploys between 13:00 and 16:00 UTC, and protect the morning
edition.

ack: 2026-11-06 item 41: deployed both durable scheduled-edition Bluesky alerts. pnpm check passed 535 unit/224 isolated integration tests; alert firing/clearing and saved-state restart/exclusion cases passed; --verify-alerts passed with 18 healthy rules. Neither alert fires on real editions (0 failures/0 qualifying no-pick editions; Nov 6 is the first eligible scheduled edition).

## 42. While items wait on a time: read the edition as a reader (2026-11-06)

**Why:** tonight several items wait on a time or on evidence: the meaning-based
X test (after 21:00 UTC on Nov 6), the Nov 6 edition review (item 36) and the
first scheduled Bluesky edition (items 40, 41). The last edition I looked at
had a World section of only 2 stories and 1 post. Waiting time should go to
what readers see, not to re-checking finished work.

**Priority:** this sits inside item 38's list and changes no ranking. Items 39,
34, 36, 40 and 41 still come first whenever they have work available.

**What to do, when those are waiting:**

1. Read the latest edition as a reader would, topic by topic. Use the
   `edition-review` approach and the saved edition data, not commit messages.
2. Pick the single biggest weakness a reader would notice: thin or repeated
   stories, weak posts, a missing topic, a poor summary.
3. Fix it at the cause in the data or code. Don't add wording rules for grouping.
4. When the Nov 6 edition arrives, read it the same way and compare.

**What not to do:**

- Don't polish screens item 33 is replacing.
- Don't add checks for failures that have never happened.
- Don't re-analyse evidence that already answered a question.
- Stop an investigation once it has named a cause and a fix.

**Done when:** each iteration's PROGRESS.md entry names the weakness found, what
changed, and why a reader would notice. The ack reports the same in one line.

**Limits:** no new spend, vendors or product features. Budgets, the
13:00–16:00 UTC window and edition protection still apply.

ack: 2026-11-06 item 42 — iteration 987: reread all four saved topics (17 summaries, 14 posts, 14 brief bullets). World breadth remains the largest weakness; its pool fix and the other observed content fixes already await publication. Saved a concrete Nov 6 comparison checklist instead of stacking further unmeasured prompt changes. No paid calls or runtime changes.

ack: 2026-11-06 (925) Read all four saved topics; World pool fix awaits publication. Fixed hidden post context at the reader API/UI, making Gaming’s Japanese announcement understandable without changing its original text.

ack: 2026-11-06 item 42 — iteration 926: saved X cards repeated a footer link and empty retry spacer; linked original saved text directly and removed the duplicate/spacer, preserving context and official embed recovery. World breadth still awaits the already-deployed pool fix's Nov 6 evidence.

ack: 2026-11-06 item 33 — iteration 928: reader header arrows open adjacent saved editions across archive pages; date opens the archive. Verified saved-edition navigation/reload on desktop/mobile and light/dark. No content, selection or spend changes.

ack: 2026-11-06 item 42 — iteration 930: saved X post cards requested 550px embeds inside narrower reader columns. Request their available width and contain resized frames; verified saved posts with a widget stub on desktop/mobile light/dark, including 320px resize. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 931: World’s active mobile topic chip stayed offscreen while reading. Scroll only the chip row to reveal the current topic; saved-edition forward/backward checks at 390px/320px in light/dark. No spend or selection changes.

ack: 2026-11-06 item 33 — iteration 932: the rebuilt archive called a failed refresh a loading failure and hid older-page navigation despite retaining saved links. Preserve browsing and explain the refresh failure; ported the legacy refresh check to the archive, verified desktop/mobile light/dark. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 933: saved X links replaced their post text with a generic accessibility label. Preserve the saved text in the accessible name with author/destination context; browser replay verified desktop/mobile light/dark. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 935: saved reader content remained visible after refresh failure but the message claimed it could not load (and a 404 claimed it was missing). Show an accurate refresh message and retry; verified existing desktop/mobile light/dark recovery replays. No spend or selection changes.

ack: 2026-11-06 item 33 — iteration 938: replaced legacy two-column desktop posts with one full-width post per row, as approved; saved-content layout and offline widget sizing verified across desktop/mobile light/dark. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 940: saved posts put their paraphrased context before the original; moved context below text/media on all post platforms so readers see the post first, retaining Gaming’s English context. Verified saved X cards with blocked widgets and a local widget stub across desktop/mobile light/dark. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 942: mobile Contents cut off saved headlines, hiding distinguishing details. Let titles wrap in the sheet; real saved-title clipping and navigation checks passed in light/dark, with desktop unchanged. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 943: saved-edition Contents left keyboard focus on the body or mobile menu after choosing a story. Focus the chosen content while preserving Escape restoration; verified saved-edition keyboard paths across desktop/mobile light/dark. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 946: desktop Contents cut off saved headlines including Wembanyama’s game result; wrap full titles in the scrollable sidebar. Verified clipping and keyboard navigation against saved content in light/dark; no spend or selection changes.

ack: 2026-11-06 item 42 — iteration 949: Wembanyama’s 4-article disclosure listed only three reports; include the primary article in expanded coverage so readers can browse the full set. Saved-report titles/links verified desktop/mobile light/dark; no spend or selection changes.

ack: 2026-11-06 item 42 — iteration 950: World's saved Guardian headline credited Al Jazeera first in its grouped source row. Show the primary report's outlets first; saved World attribution and links verified in desktop/mobile light/dark. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 951: World's eight-report story disclosed only an extra outlet count. Always show the article count alongside extra outlets, making saved coverage depth visible before expansion. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 952: World's Guardian US/World feeds filled both visible source slots for the same publisher. Show each publisher once so Al Jazeera is visible alongside the primary Guardian report; all eight reports remain available. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 953: Gaming’s image-dependent release-date post showed only a retry button when X media failed. Explain the missing media beside the retry while retaining saved text/context; verified failure and recovery in desktop/mobile light/dark with local widgets. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 954: changing theme rebuilt X media and closed the saved text a reader had opened. Preserve the disclosure choice through media reloads; saved Gaming content verified across desktop/mobile light/dark with local widgets. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 955: World’s expanded coverage mixed Nov 4 and Nov 5 reports without dates. Show each report’s saved publication date and local time; saved-content browser checks passed across desktop/mobile light/dark. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 956: saved topic briefs repeated story headlines without a direct route to the report. Matching brief headlines now jump to the saved story; keyboard focus and visible destinations verified across desktop/mobile light/dark. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 957: standalone reports exposed only edition-relative ages; show saved publication dates and local times on every story so readers can distinguish earlier reporting from updates. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 959: saved post bylines used long numeric dates with seconds, unlike stories. Apply the same concise date and local time format to all post platforms; verify saved timestamps across desktop/mobile light/dark. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 960: reading the saved edition at 320px showed a two-line wordmark and date. Keep both on one line with a compact mobile date; retain the year for screen readers and wider screens. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 961: saved post commentary had no attribution label; added “Digest context” below original posts so readers can distinguish editorial explanation from the author’s words. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 962: saved X author names were plain text, preventing readers from inspecting an unfamiliar account. Link each name to its saved profile; keyboard and destination checks cover desktop/mobile light/dark. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 963: saved X cards had no indication while media was pending; added an active-request loading status so readers can distinguish waiting from failure, preserving saved text through retries. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 964: saved Tech stories crossed the reading position while Contents still highlighted the topic. Track ordinary scrolling as well as intersections; verify forward/backward story tracking on desktop/mobile light/dark. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 965: saved Gaming X media kept its initial width after viewport changes; rebuild successful media at its settled card width while preserving saved-text state. Reproduced stale 550px media at 320px; verified local widget replay across desktop/mobile light/dark. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 966: saved X text lost keyboard focus when media rebuilt after rotation or theme changes. Keep the saved-text link mounted; verified focus across resizing and system themes in four reader views. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 967: retrying failed X media removed the focused button and dropped keyboard focus to the page body. Move focus to the saved post link before retry; reproduced against HEAD and verified saved-edition recovery in four reader views. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 968: Gaming’s saved-text disclosure lost keyboard focus when media reloads hid it. Keep it visible after the first successful embed; verify focus and collapsed state through system theme changes in four reader views. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 969: saved Gaming media collapsed during theme reloads, shifting the reader’s place. Reserve its previous height until replacement succeeds or fails; four-view saved-edition browser replay verifies pending media space. No spend or selection changes.

ack: 2026-11-06 item 42 — iteration 972: saved Tech exploit summary exposed the supplied excerpt instead of adding news. Editor v6 explicitly requests one concise attributed sentence for headline-only evidence, retaining factual guards; actual wording awaits Nov 6 publication. No paid trial or source changes.

ack: 2026-11-06 item 42 — iteration 974: Gaming’s saved release-date update supplies no date or change in its text. Social editor v3 prefers concrete supplied developments over teasers reliant on unseen media, while preserving concrete highlights; no new calls, spend or source changes. Actual selection quality awaits the Nov 6 edition.

ack: 2026-11-06 item 42 — iteration 975: saved OpenAI/NBA cards repeat their original text in mandatory editor notes. Made notes optional for self-explanatory posts while retaining useful translations; offline selection/cache and desktop/mobile light/dark replay checks passed. Existing saved editions remain unchanged; compare Nov 6 output.

ack: 2026-11-06 item 42 — iteration 976: all 14 saved brief bullets copied the following story headlines. Editor v7 requests a compact factual overview, retaining attribution and distinct events; offline transport/cache/fallback checks only, actual output awaits Nov 6 publication. No spend or selection limits changed.

ack: 2026-11-06 item 42 — iteration 977: saved Tech exploit coverage shortened The Hacker News to Hacker News, making the publisher ambiguous. Editor v8 preserves full supplied publisher names and distinguishes reporting outlets from aggregation feeds; offline contracts only, actual output awaits publication. No spend or source changes.

ack: 2026-11-06 item 42 — iteration 978: saved Tech picks include a truncated Oumi newsletter recap. Social editor v5 prefers firsthand announcements, demos and reporting over generic recaps without guessing provenance; substantive secondhand scoops remain eligible. Offline contracts only; compare Nov 6 output. No paid calls or source changes.

ack: 2026-11-06 item 42 — iteration 979: saved Porziņģis summary mentions only his absence and omits the reported salary withholding. Editor v9 asks summaries to retain the central supported headline development and its uncertainty; offline contracts on both editors only, actual output awaits publication. No paid calls or source changes.

ack: 2026-11-06 item 42 — iteration 980: saved World coverage repeated Guardian US/World labels on the same reports; show one publisher label per report, retaining all saved article links. Verified desktop/mobile light/dark; no spend or selection changes.

ack: 2026-11-06 item 42 — iteration 981: read all four saved topics; single-report stories hid the original headline. Enabled their article disclosure so readers can inspect the original report alongside the rewritten summary. No selection or spend changes.

ack: 2026-11-06 item 42 — iteration 982: Sony’s saved summary cites a PS6 report missing from its article disclosure. Reader projection now includes all saved editorial citations, deduplicated with original coverage; saved data and selection stay unchanged.

ack: 2026-11-06 item 42 — iteration 983: OpenSSH’s author link appeared under the unqualified Hacker News label. Mark Hacker News and Google News discovery links with “via” in source rows and report disclosures so readers can distinguish feeds from reporting outlets; no saved content or spend changes.

ack: 2026-11-06 item 42 — iteration 984: Gaming's saved GTA 6 story omits the original headline's playable-access qualification. Editor v10 preserves supported practical qualifications in headline and summary, respecting verbatim absence evidence; offline contracts only, actual output awaits publication. No paid calls or source changes.

ack: 2026-11-06 item 42 — iteration 985: read all four saved topics; Sony summary adds “he” although supplied reports establish no pronouns. Editor v11 asks for names or roles instead of inferred pronouns; offline primary/fallback contract, no paid calls or saved-edition changes.

ack: 2026-11-06 item 42 — iteration 986: saved OpenAI and Porzingis X text ends mid-sentence; recovery copy now names the whole official post and directs readers to the original, rather than implying only media is missing. No content or spend changes.

ack: 2026-11-06 item 42 — iteration 988: pending World breadth fix still awaits publication. Removed repeated “Digest context” headings so saved post explanations read directly below their originals; no content or spend changes.

ack: 2026-11-06 item 33 — iteration 991: reader heading navigation now starts with a dated edition heading before topic headings, making the saved edition identifiable to screen-reader users without changing visual layout or content.

ack: 2026-11-06 item 36/40/41/42 — iteration 1011: Nov 6 full-AI edition published in 137.059 s for $0.286904; World improved from two to five distinct stories and has one distinct Bluesky pick, with one unsupported pick dropped. No budget refusals or Bluesky alerts. Reserved slot stays OFF: 1.5 × ($0.286904 + 3 × $0.015867) = $0.501758 rounded up, above $0.501698 daily cap; awaiting owner under item 40. Reader review/screenshots in docs/edition-reviews/2026-11-06.md; remaining Tech post repetition noted, no new tuning or paid calls.

ack: 2026-11-06 item 42 — iteration 1013: saved Tech posts split two launches across five slots. Social editor v6 distinguishes accompanying launch details from separate news, preserving independently newsworthy developments. Offline verification only; deployment waits until after 16:00 UTC, and selection quality awaits the next scheduled edition. No paid calls or grouping wording rules.

ack: 2026-11-06 item 42 — iteration 1015: World’s saved Bluesky post cites an article through an inert URL. Prepared clickable web links preserving original text; isolated desktop/mobile light/dark replay passes. No paid calls; deployment waits until after 16:00 UTC.
