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
  - [x] Real official Anthropic SDK transport, configured models/prices, serialized Postgres reservations/ledger, validated JSON with one reserved repair, cache and provider-month blocks (iteration 52); one tiny live Haiku triage check costs $0.000147, cache reuse verified.
  - [x] Bounded Haiku candidate triage service with semantic relevance/importance, advisory event labels/rationale, exact-ID validation and per-item cache independent of batch/order (iteration 53); explicit real four-topic smoke, not yet used by published editions.
  - [x] Bounded shortlist editor with validated IDs/briefs/story text, cached Sonnet calls and budgeted Haiku fallback (iteration 54); standalone only, live checks returned empty selections.
  - [x] Manual/scheduled immutable editorial-v1 publication with semantic triage, bounded shortlist, briefs/summaries/rationale, source provenance and per-topic non-AI fallback labels (iteration 55).
  - [x] Real end-to-end four-topic Sonnet edition with twenty summaries and identical cached regeneration (iteration 55); spot inspection is not a precision benchmark.
  - [x] Coalesce identical overlapping LLM requests within each publication process, including reserved repairs and safe failure release (iteration 56); API/worker cross-process and different triage batch compositions remain open.
  - [x] Diagnose World fallback from overlong Haiku rationales; supply explicit field bounds without invalidating validated per-item caches, recover all four AI topics and verify cached regeneration (iteration 58).
  - [x] First frozen NBA AI selection replay against pre-existing labels: 5/5 target events versus 2/5 signals baseline, zero labeled omissions; offline replay and shortlist parity checks (iteration 59). This is target recall, not general precision.
  - [x] Require validated shortlist evidence IDs and preserve source links/excerpts separately from headline coverage; expose summary sources without changing historical snapshots (iteration 60). Attribution is not factual verification.
  - [x] Separate configured Sonnet daily allocation inside shared caps; serialized reservations include old pending/uncertain calls, Haiku fallback and cache reuse verified in isolated Postgres; status shows allocation (iteration 61).
  - [x] Replay World/Tech frozen windows with withheld pre-existing labels, evidence-input audit and offline regressions: each 3/5 targets, zero labeled omissions, Haiku fallback (iteration 62). Provisional labels, not precision.
  - [x] Editor v3 explicitly forbids inferring absence from omitted excerpt facts; recorded Tech replay removes Apple non-confirmation from summary with unchanged 3/5 recall (iteration 63). Prompt mitigation only; rationale/absence wording still needs factual validation.
  - Next (highest priority): validate factual support beyond prompting (remaining Apple rationale/announcement wording and benchmark verification caveat); extend editorial evaluation across topics/dates with independent labels; add scheduled Message Batches and cross-process cache-miss coalescing. Full-article retrieval remains unfinished; ten-candidate editor bounds may return fewer than larger topic budgets.
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
  - [x] Status shows real Anthropic spend/reservations, daily/monthly caps, calls per model and sanitized provider errors (iteration 52); automated editing is still pending.
  - Next: durable recovery beyond retained Redis jobs.
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
  - Make schedule-changing smoke checks persist recovery settings and restore on termination; iteration 52 required manual restoration after signal 143.

- [x] Stop verification from replacing live AI editions: run the existing suite in disposable Postgres/Redis containers with cleared inference credentials, migrated seeds and guarded direct test connections (iteration 57; regression repair).
- [ ] STEERING 2a (after M3): isolated Testcontainers Postgres/Redis migration, repository/HTTP characterization, golden edition and database coverage; include `test:integration` in `check`. Never touch live DB.
- [ ] STEERING 2b (only after 2a is green): record Drizzle decision/schema parity, back up live DB, gradually replace raw SQL behind ports and enforce boundaries.
