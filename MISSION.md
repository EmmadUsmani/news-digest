# MISSION: News Digest

The owner's brief. Every autonomous iteration reads it first. Do not edit this
file. `STEERING.md` holds newer owner instructions and overrides this file where
they conflict. If something here is unclear or impossible, record it in
NEEDS_FROM_HUMAN.md, make the most reasonable call, and keep working.

## 1. Product

A personal **news and social-media digest**. A person's attention is limited,
so instead of feeds to scroll, the app delivers **a small, curated set of the
most important and newsworthy items** for each of the person's topics over a
time period (daily to start). It covers news articles **and** social posts.
Posts on X (Twitter) are especially important.

Success looks like this: once a day the owner opens one page and, in about
10 minutes, knows what mattered in each topic. Nothing important is missing,
and nothing is filler.

### Starting topics (seed data, not hard-coded)

1. **Tech & AI.** Technology, programming, AI, and product/digital design,
   plus general tech-industry news. Heavy emphasis on AI and building with AI
   (models, tools, agents, launches, research that matters to builders).
2. **NBA.** NBA basketball only. No other sports.
3. **Gaming.** The gaming industry as a whole: releases, studios, platforms,
   business, major announcements.
4. **World news & politics.** US and global news and politics, and the
   important issues within them.

Topics are **data, not code**. Each topic is configurable: name, description,
include/exclude guidance for relevance, the sources and queries it uses, X
accounts and search queries, and per-topic item budgets. Seed these four for
the default profile. Users must be able to create, edit, disable and reorder
topics through the UI and API without code changes.

### Profiles now, accounts later

There are no signups or authentication yet. Still, model a `Profile` (the
person whose interests drive a digest) from day one, and seed a single default
profile. Everything user-specific hangs off the profile: topics, schedule,
budgets and digests. Adding real users later should mean adding auth and
mapping users to profiles, not refactoring the domain.

### Time windows are parameters

The first cadence is daily, but nothing may assume "daily". Model a digest
schedule per profile as:
- a cadence (cron or similar)
- an IANA timezone (default `America/Los_Angeles`)
- a coverage window (for example `P1D`, an ISO-8601 duration)
- per-topic item budgets

A digest is generated for a concrete `[windowStart, windowEnd)` period. You
must also be able to generate one on demand for any window ("last 6 hours",
"this week"). Weekly or hourly digests later should be a config change.

## 2. What a digest contains

For each enabled topic, within the window:

- **A short brief.** 2–4 bullet "what happened" lines for the topic.
- **Top stories (default budget: 5).** Each story is a cluster of articles about
  the same event. Show:
  - a rewritten, informative headline
  - a 2–4 sentence summary
  - why it matters, in one line
  - the source count
  - a link to the best original article, plus links to other coverage
  - publish time
  - the lead image if available
  Summarize; never reproduce full article text.
- **Top posts (default budget: 5), especially from X.**
  - Show the **whole post** with its media (images, video, GIFs), author,
    time, a link to the original, and engagement where available. Posts are
    short, so don't summarize them, but add one line of context if the post
    needs it.
  - For long-form posts (X Articles, long threads), show the opening plus a
    summary and link.
  - Prefer X's official embed (oEmbed / widgets.js) or the platform's own
    rendering. Showing posts faithfully is better than re-hosting media.
- Budgets are configurable per topic and per profile. The defaults aim for
  roughly 10 minutes of reading in total. If a quiet window has fewer than
  the budget's worth of truly important items, show fewer; never pad with
  filler.

Also keep **digest history**: each generated digest is an immutable snapshot
that can be browsed later. Regenerating creates a new version rather than
mutating the old one.

## 3. Finding what's important

This is the core of the product. The goal is high precision at very small
budgets.

**Collect broadly, select ruthlessly:**

1. **Ingest** candidate items continuously (or on a schedule) from many
   sources per topic, deduplicated and normalized: URL canonicalization,
   source, author, published time, text/excerpt, media, engagement, language.
2. **Cluster** articles about the same story across outlets. Embeddings and
   title/entity similarity are both fine; choose what works and measure it.
   Coverage breadth (how many independent outlets cover a story) is one of the
   strongest newsworthiness signals.
3. **Score** with explainable signals: cross-source coverage, source
   authority/quality, recency within the window, engagement and its velocity
   (likes/reposts/comments/points), whether known key accounts are involved
   (team accounts, reporters, company/founder accounts), and topical relevance
   to the topic description. Penalize duplicates, clickbait, listicles, SEO
   spam, rumor-only items without credible sourcing, and promotional content.
4. **Editorial pass with an LLM.** Give the top-K candidates per topic to an
   LLM acting as an editor. It picks the final set, writes headlines and
   summaries, and explains the choice briefly. Store the scores and the
   editor's rationale with the digest so selection can be audited and tuned.
5. **Evaluate.** Keep a small labeled set of past windows (for example,
   "these were obviously the top NBA stories on day X") and a regression
   check that the pipeline surfaces them. Record precision observations in
   `docs/RANKING.md`.

### Content sources (you research and choose; record everything in docs/SOURCES.md)

Prefer official APIs and feeds. Don't build scraping that depends on evading
bot protection. That was the failure mode of a previous project: a whole
day's work produced almost no data. **Get real content flowing early and
widen coverage continuously.**

- **News:**
  - Publisher RSS/Atom feeds for each topic (for example The Verge, Ars
    Technica, TechCrunch, AP, Reuters, BBC, NPR, ESPN/The Athletic NBA, Polygon,
    IGN, Game Developer and many more; research the best)
  - Google News RSS for topic and search queries
  - The Hacker News API (strong for the Tech & AI topic)
  - Official blogs (OpenAI, Anthropic, Google DeepMind, NBA.com, platform
    holders)
  - Free news APIs where useful
- **X (Twitter): important.** Options to evaluate, in order:
  1. **xAI's Grok API with the built-in `x_search` tool** through the exe.dev
     LLM gateway already attached to this VM (`https://llm.int.exe.xyz`,
     xAI provider; no key on the VM). It searches X posts, users and threads
     and returns citations with post URLs/IDs. Use it to discover the most
     important posts per topic and window. Check that xAI routing actually
     works through the gateway (`/v1/models` and the docs at
     https://exe.dev/docs/integrations-llm) before relying on it.
  2. **X's official oEmbed / embed widget** (`publish.twitter.com/oembed`,
     `platform.twitter.com/widgets.js`) to render full posts with media for
     known post URLs, with no API key.
  3. **The official X API (pay-per-use).** Only if the owner provides
     `X_BEARER_TOKEN`. Build the adapter behind the same port so it switches on
     when the key appears. Enforce a hard daily spend/read cap in code.
  4. Curated lists of high-signal accounts per topic (reporters, insiders,
     teams, labs, studios) as seed data that improves search quality.
  Don't scrape x.com directly or use unofficial mirrors that evade X's
  controls.
- **Other social:** Reddit (public RSS/JSON for subreddits such as r/nba,
  r/technology, r/MachineLearning, r/LocalLLaMA, r/gaming, r/Games,
  r/worldnews, r/politics) and Bluesky's public API are useful signals and
  candidates, ranked below X.

Mark every source as `live`, `needs key`, `blocked`, `rejected` or `not yet
tried`. A source is `live` only when real fetched content is stored. Fixtures
and mock data never count as live. Follow each source's rate limits and
`Retry-After`, back off on errors, and use one shared HTTP client with
per-domain rate limiting and caching.

### LLM usage inside the app

Decided by the owner on 2026-11-01; the rationale is in
`docs/decisions/0001-app-llm-provider-and-budget.md`. The detailed build
instructions are in STEERING.md item 3.

- **Provider:** the Anthropic API directly via `@anthropic-ai/sdk`, using
  `ANTHROPIC_API_KEY` from `~/.config/news-digest/env`. The key belongs to a
  dedicated Anthropic workspace with a hard $15/month spend limit set by the
  owner.
- **Routes not to use:** the exe.dev gateway for editorial/summarization
  calls. It has no spend caps. It stays fine for the xAI `x_search` evaluation
  above. Never send app traffic through the OpenAI ChatGPT-subscription
  provider: that quota is shared with the Codex agent building this app.
- **Models (hybrid):**
  - `claude-haiku-5-5` triages and scores all candidates. Keep each prompt
    under 100k input tokens; above that Haiku costs 5x as much.
  - `claude-sonnet-5-5` makes the final editorial pass on the shortlist and
    writes the summaries.
- **Abstraction:** keep it behind an `LlmPort` with adapters, so the provider
  and models stay configuration choices.
- **Budget:** usage is recorded in a cost ledger. The app adds its own caps
  under the provider's: $14/month, and a daily cap equal to the remaining
  monthly budget divided by the days left, at most $1.00.
- **Graceful degradation:**
  - When Sonnet's share is spent, finish with Haiku.
  - When the budget is gone, fall back to non-AI ranking and label the
    edition as such.
  - When the provider's spend limit is hit, stop until next month; never
    retry-loop on it.
- Cache per-item results so a regeneration doesn't pay twice.

## 4. Notifications (architecture only for now)

Real delivery (for example email via Resend) comes later. Build a minimal
`DigestPublished` domain event and a notification port with a log/in-app
adapter, so that adding email later means adding an adapter. Don't build email
sending or signups now.

## 5. Tech stack and architecture

- **Full-stack TypeScript in one pnpm workspace:**
  - `apps/web`: React single-page app (Vite)
  - `apps/api`: NestJS
  - `packages/*`: shared contracts/types (for example Zod schemas shared by
    the API and web)
- **Backend architecture:** follow **Domain-Driven Hexagon**
  (https://github.com/Sairyss/domain-driven-hexagon):
  - bounded-context modules under `apps/api/src/modules/<context>/` with
    `commands/<use-case>/`, `queries/<use-case>/`, `domain/` (aggregates,
    entities, value objects, domain events, errors), `database/` (repository
    port plus adapter), `dtos/`, mappers, and one controller per transport
  - shared building blocks in `apps/api/src/libs/` (`ddd/`, `db/`, `ports/`,
    `exceptions/`)
  - CQRS through `@nestjs/cqrs`
  - Result types for expected business errors
  - dependencies point inward; the domain imports no framework or I/O; every
    external system is reached only through a port
  - modules talk through the bus, events or public facades, never by importing
    each other's internals
  - enforce the layering with dependency-cruiser (or eslint boundaries) in CI
  - suggested contexts (adjust as you learn): `profiles`, `topics`, `sources`,
    `ingestion` (content items), `curation` (clustering/scoring/editorial),
    `digests`, `notifications`
  Scale patterns to need; trivial CRUD doesn't need ceremony.
- **Everything runs on this one VM, with no external managed services:**
  - PostgreSQL for system-of-record data (pgvector if you use embeddings)
  - Redis plus BullMQ for scheduled and background jobs (ingestion, clustering,
    digest generation, retries)
  - Temporal is not needed unless BullMQ proves insufficient
  - choose the DB access layer (Slonik as in the reference repo, Kysely,
    Drizzle or Prisma) and justify it in `docs/ARCHITECTURE.md`; migrations
    are required
  - prefer Docker Compose for Postgres/Redis if Docker works on the VM,
    otherwise native packages
- **Serving:** the NestJS app serves the API and the built SPA on
  `0.0.0.0:8000`, which exe.dev publishes at `https://news-digest.exe.xyz/`
  (private to the owner by default). Expose `GET /healthz` (DB and Redis
  checks). Background workers may be separate processes.
- **Operations:** run long-lived processes as systemd **user** services named
  `news-digest-<role>.service` (for example `news-digest-api.service`,
  `news-digest-worker.service`), with `Restart=always`. Keep them running the
  latest working `main` all the time. Put start/stop/log commands in the README.

## 6. Web app

- **Digest page (home):** the latest digest, topic by topic: brief, stories,
  posts with embedded media. It must look clean and modern, be easy to scan,
  and work well on mobile and desktop. Treat typography and hierarchy as part
  of the product.
- **Digest history:** browse past digests by date/period.
- **Topics settings:** create, edit, enable/disable and reorder topics; edit
  their descriptions, sources/queries/accounts and item budgets.
- **Schedule settings:** cadence, timezone, window and default budgets.
  Generate an on-demand digest for a chosen window.
- **Status page:** source health (last success, item counts, errors), job
  queue health, the last digest runs, and LLM/API usage against the caps.
- Accessibility basics: semantic HTML, keyboard navigation, alt text.

## 7. How you work

You run unattended and continuously under a supervisor that restarts you and
retries through usage limits. The owner checks GitHub and the live app
whenever they like.

- **Deliver a thin vertical slice first, then widen.** Get to a real digest
  with real content from a few sources for all four topics as early as
  possible. Then improve coverage, ranking quality and UI. Don't spend
  iterations on infrastructure or documentation that doesn't move the
  product forward.
- **Verify everything yourself, and never claim something works without
  evidence:**
  - typecheck, lint and unit tests (domain logic, scoring, clustering, window
    math, budget enforcement)
  - integration tests against the real local Postgres/Redis
  - recorded fixtures for source adapters
  - Playwright end-to-end tests against the running app, with screenshots of
    key pages saved to `docs/screenshots/` so the owner can see progress on
    GitHub
  - checks that live ingestion and scheduled digests actually run
- **Git:** work on `main`. Make small, clear commits and push after every
  verified step. Never force-push, rewrite history or change remotes. Never
  commit secrets, `.env` files, databases, logs, `node_modules` or build
  output.
- **Keep these current:** `TASKS.md` (prioritized), `PROGRESS.md` (dated
  entries of 15 lines or fewer; when it passes about 400 lines, move older
  entries to `docs/progress-archive/`), `NEEDS_FROM_HUMAN.md` (exact steps for
  anything only the owner can do; never stop and wait on it),
  `docs/SOURCES.md`, `docs/ARCHITECTURE.md`, `docs/RANKING.md`.
- **Read `STEERING.md` every iteration.** It is written by the owner, and it
  overrides this mission. Only append "ack: <date> <what you did>" to it.

## 8. Hard limits

- No purchases, paid plans or account signups anywhere.
- No real emails or notifications to real people.
- No changes to exe.dev sharing/visibility, DNS, or anything outside this VM,
  except pushing to `origin`.
- No scraping that depends on evading bot protection: no CAPTCHA solving,
  proxy rotation or fingerprint spoofing.
- Secrets live only in `~/.config/news-digest/env` (mode 600). Never print,
  log or commit them.
- Never modify `MISSION.md`, `BOOTSTRAP.md` or anything in `~/agent-control/`.
