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
- [x] STEERING 1: Prettier, EditorConfig, typed ESLint, React hooks/refresh and sorted/unused imports; enforced workspace checks (iteration 51).
  - Follow-up: remove scoped unsafe-value exemptions by adding schemas/types to legacy pg/XML/JSON/BullMQ boundaries and smoke fixtures (coordinate with 2a/2b).
  - Follow-up: characterize unknown-to-text feed coercion, then enable no-base-to-string; refactor DigestPreview/StatusPanel loading effects to enable set-state-in-effect. Immediate Promise-shaped mocks retain require-await exemption.
- [ ] M3 first real digest (in progress):
  - simple scoring plus the Anthropic editorial pass
    (behind `LlmPort`, with usage caps)
  - [x] Immutable preliminary ranked snapshots for explicit windows (iteration 10); database rejects mutation.
  - [x] Home renders latest preliminary edition with excerpts, scores and quiet sections.
  - [x] Desktop/mobile Playwright screenshots and create/reload checks.
  - [x] Data-driven topic phrase relevance, auditable rules/rejection counts, 14 labeled regression cases (iteration 11).
  - [x] Auditable quality exclusions for routine previews, schedules and discussion threads, with omission reasons (iteration 13).
  - Next (highest priority after formatting): implement real Anthropic LlmPort with configured Haiku triage/Sonnet editing, reservations, cost ledger/cache and graceful fallbacks per STEERING 3; key is installed. Semantic relevance and reviewed previews remain unfinished.
- [ ] M4 X posts:
  - check xAI `x_search` through the gateway
  - post discovery per topic
  - faithful rendering with the official embed, media included
  - X API adapter behind the same port, enabled only by `X_BEARER_TOKEN`
- [ ] M5 ranking quality:
  - [x] Conservative headline clustering with copied coverage links, one-slot groups and no unverified syndication bonus (iteration 14).
  - Semantic event clustering and verified outlet independence remain unfinished.
  - [x] Remove unverified source-observation score bonuses while retaining auditable coverage and historical methods (iteration 30).
  - [x] Auditable omission of original Ask HN question threads from news slots, with versioned snapshots and preserved incoming content (iteration 37).
  - explainable scores
  - per-topic relevance guidance
  - [x] First frozen real-candidate NBA window with agent event labels, offline report and baseline recall regression (iteration 31).
  - [x] Second recorded real-candidate World window and per-event top-twenty diagnostics (iteration 33); five-slot recall 1/5 versus NBA 2/5.
  - [x] Recorded Tech & AI window plus per-article phrase/quality/selection diagnostics (iteration 38); five-slot target recall 0/5, exposing lexical false negatives and ranking misses without fitting scores.
  - Next: independently reviewed labels, different dates and Gaming; these agent-labeled windows are not general quality estimates.
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
  - [x] Register and connect custom public HTTPS RSS/Atom feeds through UI/API, shared URL reuse, bounded catalog and safe worker fetches (iteration 27).
  - [x] Connect Google News RSS queries through validated UI/API with shared feed collection, replacement/disconnect and explicit Google links (iteration 28).
  - Next: social account configuration; automatic generation and run/status visibility are connected under M7.
- [ ] M7 scheduled operation: the cadence scheduler generates digests
      automatically, plus the status page (sources, queues, runs, LLM usage).
  - [x] Saved daily cadence/timezone drives automatic preliminary editions, exact slot windows, bounded retries and idempotent persistence (iteration 23).
  - [x] Source/run status panel and API: source freshness/errors/counts, queue availability/workers/pause/counts, next edition, retained run states and edition links (iteration 24).
  - [x] Bounded missed-run policy: retained slots up to six hours late keep original windows; older slots skip visibly, without daily backfill; settings/status explain custom-window recovery (iteration 26).
  - Next: bounded LLM usage/cap reporting once editorial integration is configured; durable recovery beyond retained Redis jobs.
    `DigestPublished` event plus notification port with a log/in-app adapter.
- [ ] Ongoing:
  - [x] Wider NBA/Gaming publisher coverage: Yahoo NBA + Eurogamer (iteration 12), 110 additional stored URLs.
  - [x] Wider world coverage: NPR World + The Guardian World (iteration 29), 55 additional stored publisher articles.
  - [x] Direct platform announcement coverage: PlayStation Blog + Xbox Wire, 20 real stored posts with offline fixtures (iteration 32).
  - [x] Direct AI announcements: OpenAI News + Google DeepMind with bounded compressed feed support (iteration 34).
  - [x] PC Gamer + Rock Paper Shotgun feeds: 110 real articles and broader current Gaming selections, with offline fixtures (iteration 36).
  - widen sources per topic (Reddit, Bluesky, more publishers)
  - precision tuning
  - [x] Publisher lead images in new immutable editions, responsive display and graceful image failures (iteration 35).
  - UI polish
  - retention/backup
  - resilience

- [ ] STEERING 2a (after M3): isolated Testcontainers Postgres/Redis migration, repository/HTTP characterization, golden edition and database coverage; include `test:integration` in `check`. Never touch live DB.
- [ ] STEERING 2b (only after 2a is green): record Drizzle decision/schema parity, back up live DB, gradually replace raw SQL behind ports and enforce boundaries.
