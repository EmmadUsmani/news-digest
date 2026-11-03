# Steering

The owner writes instructions here, often by editing on GitHub. The agent reads
this file every iteration, and it overrides MISSION.md where they conflict. The
agent only appends `ack: <date> <what you did>` lines under an item.

Completed items 1 (formatting and linting) and 3 (AI editorial, including its
budget rules) are in `docs/steering-archive.md`. Read them only when touching
those areas.

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
