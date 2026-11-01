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
- [ ] M1 domain foundations (next; keep this thin so M2 real ingestion follows):
  - `libs/ddd` building blocks
  - `profiles` and `topics` modules with the seeded default profile and four
    topics (data, not code)
  - digest schedule value objects (cadence, IANA timezone, ISO-8601 window,
    budgets) with thorough window-math tests
- [ ] M2 first real content (vertical slice):
  - a source port plus RSS/Atom and Hacker News adapters
  - ingestion jobs in BullMQ
  - normalized, deduplicated content items in Postgres
  - real items stored for all four topics, recorded in docs/SOURCES.md
- [ ] M3 first real digest:
  - simple scoring plus the LLM editorial pass through the exe.dev gateway
    (behind `LlmPort`, with usage caps)
  - an immutable digest snapshot for a window
  - the digest page renders it
  - Playwright screenshots
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
  - widen sources per topic (Reddit, Bluesky, more publishers)
  - precision tuning
  - UI polish
  - retention/backup
  - resilience
