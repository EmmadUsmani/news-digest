# Tasks

Prioritized. The agent owns this file; reorder and split tasks as you learn.
Fix regressions, broken services and stalled sources before starting new work.

- [x] M0 skeleton (iteration 7):
  - pnpm workspace (`apps/api` NestJS, `apps/web` React+Vite, `packages/contracts`)
  - Postgres and Redis running locally (Docker Compose or native)
  - migrations
  - `GET /healthz` with DB/Redis checks
  - the API serves the built SPA on :8000
  - systemd user units `news-digest-api.service` / `news-digest-worker.service`
  - one `pnpm check` command (typecheck, lint, dependency boundaries, tests)
  - README run/stop/log commands
- [x] M1 domain foundations (iteration 8; read-only APIs and topic overview):
  - `libs/ddd` building blocks
  - `profiles` and `topics` modules with the seeded default profile and four
    topics (data, not code)
  - digest schedule value objects (cadence, IANA timezone, ISO-8601 window,
    budgets) with thorough window-math tests
- [x] M2 first real content (iteration 9; incoming articles visible for all topics):
  - a source port plus RSS/Atom and Hacker News adapters
  - ingestion jobs in BullMQ
  - normalized, deduplicated content items in Postgres
  - real items stored for all four topics, recorded in docs/SOURCES.md
- [ ] M3 first real digest (in progress):
  - simple scoring plus the LLM editorial pass through the exe.dev gateway
    (behind `LlmPort`, with usage caps)
  - [x] Immutable preliminary ranked snapshots for explicit windows (iteration 10); database rejects mutation.
  - [x] Home renders latest preliminary edition with excerpts, scores and quiet sections.
  - [x] Desktop/mobile Playwright screenshots and create/reload checks.
  - [x] Data-driven topic phrase relevance, auditable rules/rejection counts, 14 labeled regression cases (iteration 11).
  - [x] Auditable quality exclusions for routine previews, schedules and discussion threads, with omission reasons (iteration 13).
  - Next: LlmPort/editorial summaries once an allowed provider/model is explicitly configured (currently absent), bounded usage/cache; semantic relevance beyond phrase rules; promote previews only after editorial review.
- [ ] M4 X posts:
  - check xAI `x_search` through the gateway
  - post discovery per topic
  - faithful rendering with the official embed, media included
  - X API adapter behind the same port, enabled only by `X_BEARER_TOKEN`
- [ ] M5 ranking quality:
  - [x] Conservative headline clustering with copied coverage links, one-slot groups and no unverified syndication bonus (iteration 14).
  - Semantic event clustering and verified outlet independence remain unfinished.
  - explainable scores
  - per-topic relevance guidance
  - labeled evaluation windows and docs/RANKING.md
- [ ] M6 configuration UI: topics CRUD/reorder/enable, schedule and budgets,
  on-demand digest for any window.
  - [x] Paginated immutable edition history and direct edition URLs (iteration 15).
  - [x] On-demand 6h/24h/7d and custom-window UI with validation and timezone labels (iteration 16).
  - [x] Edit existing topic names/descriptions, guidance, phrase rules, enable state and budgets through UI/API (iteration 17).
  - [x] Reorder topics through accessible desktop/mobile controls and atomic validated API; new editions preserve reading order (iteration 18).
  - [x] Repair zero-based positions after reordering; regression checks remain green after live UI use (iteration 19).
  - [x] Create topics through validated UI/API with saved phrase rules/budgets, appended reading order and clear source-less state (iteration 20).
  - [x] Connect/disconnect existing catalog sources per topic via UI/API; shared ingestion and immediate stored articles, immutable history (iteration 21).
  - [x] Persist daily schedule time/timezone, elapsed coverage window and new-topic budget defaults through validated UI/API (iteration 22). Automatic preliminary generation connected in iteration 23 (M7).
  - [x] Delete topics through profile-scoped API and desktop/mobile confirmation UI; close reading-order gaps while retaining shared sources, collected articles and immutable editions (iteration 25).
  - Next: custom feeds/query/account configuration; automatic generation and run/status visibility are connected under M7.
- [ ] M7 scheduled operation: the cadence scheduler generates digests
  automatically, plus the status page (sources, queues, runs, LLM usage).
  - [x] Saved daily cadence/timezone drives automatic preliminary editions, exact slot windows, bounded retries and idempotent persistence (iteration 23).
  - [x] Source/run status panel and API: source freshness/errors/counts, queue availability/workers/pause/counts, next edition, retained run states and edition links (iteration 24).
  - [x] Bounded missed-run policy: retained slots up to six hours late keep original windows; older slots skip visibly, without daily backfill; settings/status explain custom-window recovery (iteration 26).
  - Next: bounded LLM usage/cap reporting once editorial integration is configured; durable recovery beyond retained Redis jobs.
  `DigestPublished` event plus notification port with a log/in-app adapter.
- [ ] Ongoing:
  - [x] Wider NBA/Gaming publisher coverage: Yahoo NBA + Eurogamer (iteration 12), 110 additional stored URLs.
  - widen sources per topic (Reddit, Bluesky, more publishers)
  - precision tuning
  - UI polish
  - retention/backup
  - resilience
