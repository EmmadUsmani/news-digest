# Tasks

Prioritized. The agent owns this file; reorder and split tasks as you learn.
Fix regressions, broken services and stalled sources before starting new work.

## Immediate owner priorities (STEERING overrides older milestone notes)

- [x] STEERING 12: shrink orientation files and archive completed detail (iteration 154).
- [x] STEERING 7 partial: article/social triage batches up to 50, conservative 60 KB bound, four concurrent calls, scaled output limits and unchanged per-item caches (iteration 155; fake-based verification). Existing adapter caches shared instructions.
- [x] STEERING 7 partial: bounded Anthropic 429 backoff honors Retry-After, preserves reservations and never retries spend-limit/uncertain failures (iteration 156; fake HTTP verification).
- [x] STEERING 7 partial: process-wide four-call Anthropic limit across adapter instances, shared by article/social triage and editors, retaining slots through backoff (iteration 157; fake HTTP verification).
- [x] STEERING 7 partial: four concurrent topic pipelines/editors, ordered publication and failure draining (iteration 158; fake-based verification).
- [x] STEERING 7 partial: async enqueue/poll API and on-demand worker path, atomic active-window dedupe, idempotent publication keys, sanitized failure/duration results (iteration 159; isolated Redis + fake generator). Existing UI remains synchronous.
- [ ] STEERING 7, first: async BullMQ creation/regeneration, window dedupe, progress UI and last-run duration. Verify fake-based flows and measure full-edition timing against <60s/current-volume and <2min/1,500-item targets. Synthetic triage timing is not full-edition timing.
- [ ] STEERING 8, next: curated editable Reddit communities, public rate-limited JSON/RSS ingestion, social storage/cards and X citation extraction; real posts across four topics. Respect access denial; no bypass.
- [ ] STEERING 9, after Reddit: schedule capped direct xAI discovery before digest; report daily spend and verified yield for first week. This supersedes older notes to leave paid scheduling off once prerequisites are met.
- [ ] STEERING 10: per-topic source and verified-item/post coverage on Status; measure weakest topic before adding sources.
- [ ] STEERING 11: restore 07:00 America/Los_Angeles daily P1D schedule; isolate all schedule-changing verification from live settings.
- [ ] STEERING 4 (lower priority): fingerprinted recorded/fake LlmPort responses; no live test calls; explicit opt-in development calls <=$0.05/iteration, tagged verification. Use recordings/cache for ranking replay.

Completed milestone detail: [archive](docs/progress-archive/2026-11-02-tasks-through-143.md).
M0–M2 and foundational M3/M6/M7 functionality are implemented; remaining work follows.

## Remaining milestones

- [ ] M3 first real digest (in progress):
  - [x] Anthropic editorial publication with capped triage/editor and immutable evidence (iterations 55–72).
  - Audit work closed for now under STEERING 5: existing recorded/synthetic coverage is summarized in docs/RANKING.md. Resume only for a real unsupported digest summary.
  - Deferred: scheduled Message Batches, cross-process cache coordination, full-article retrieval and larger editor shortlists.
- [ ] M4 Social posts (current priority; STEERING 6):
  - Next: observe the first scheduled semantic social edition and measure relevant Gaming discovery. Keep full-day X reservation and paid scheduling off. Semantic selection is not a virality measurement.
  - [x] SocialPost storage, bounded discovery, immutable selections and official X embeds (iterations 87–143).
  - Reddit per-topic communities and faithful cards; no bot-protection workarounds. Bluesky optional; YouTube deferred.
  - [x] Direct capped xAI adapter and ledger implemented; scheduled use remains STEERING 9. Never use gateway.
  - [x] Semantic triage/editor and citation-based story links implemented; semantic same-event links and virality validation remain open.
  - Finish with real X/Reddit posts across four topics and desktop/mobile screenshots.
- [ ] M5 ranking quality:
  - Semantic event clustering and verified outlet independence remain unfinished.
  - explainable scores
  - per-topic relevance guidance
  - Next: independently reviewed labels, different dates and Gaming; these agent-labeled windows are not general quality estimates.
- [ ] M6 configuration UI: topics CRUD/reorder/enable, schedule and budgets,
      on-demand digest for any window.
  - Next: Reddit community configuration when legitimate access is available; automatic generation and run/status visibility are connected under M7.
- [ ] M7 scheduled operation: the cadence scheduler generates digests
      automatically, plus the status page (sources, queues, runs, LLM usage).
  - Next: durable recovery beyond retained Redis jobs.
    `DigestPublished` event plus notification port with a log/in-app adapter.
- [ ] Ongoing:
  - widen sources per topic (Reddit, Bluesky, more publishers)
  - precision tuning
  - UI polish
  - retention/backup
  - resilience

- [ ] STEERING 2a (after M3): isolated Testcontainers Postgres/Redis migration, repository/HTTP characterization, golden edition and database coverage; include `test:integration` in `check`. Never touch live DB.
- [ ] STEERING 2b (only after 2a is green): record Drizzle decision/schema parity, back up live DB, gradually replace raw SQL behind ports and enforce boundaries.
