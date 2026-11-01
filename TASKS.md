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
  - Next: LlmPort/editorial summaries using the configured provider/model, bounded usage/cache; semantic relevance beyond phrase rules; promote previews only after editorial review.
- [ ] M4 X posts:
  - check xAI `x_search` through the gateway
  - post discovery per topic
  - faithful rendering with the official embed, media included
  - X API adapter behind the same port, enabled only by `X_BEARER_TOKEN`
- [ ] M5 ranking quality:
  - story clustering across outlets
  - explainable scores
  - per-topic relevance guidance
  - labeled evaluation windows and docs/RANKING.md
- [ ] M6 configuration UI: topics CRUD/reorder/enable, schedule and budgets,
  on-demand digest for any window, digest history.
- [ ] M7 scheduled operation: the cadence scheduler generates digests
  automatically, plus the status page (sources, queues, runs, LLM usage).
  `DigestPublished` event plus notification port with a log/in-app adapter.
- [ ] Ongoing:
  - [x] Wider NBA/Gaming publisher coverage: Yahoo NBA + Eurogamer (iteration 12), 110 additional stored URLs.
  - widen sources per topic (Reddit, Bluesky, more publishers)
  - precision tuning
  - UI polish
  - retention/backup
  - resilience
