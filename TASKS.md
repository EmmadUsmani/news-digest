# Tasks

Prioritized. The agent owns this file; reorder and split tasks as you learn.
Fix regressions, broken services and stalled sources before starting new work.

## Immediate owner priorities (STEERING overrides older milestone notes)

- [ ] STEERING 13 TOP PRIORITY before Nov 3 15:00 UTC: reserve configurable Anthropic budget for the scheduled edition under the shared ledger lock; limit all other spend until completion/failure; expose reserve/manual limits and scheduled AI/fallback outcome. Fake/Testcontainers verification only. Measure next scheduled edition cost/duration for item 7.
  - Iterations 192–205: durable UTC-day lifecycle, scheduler/worker fencing, historical sizing, opt-in shared-lock admission and trusted configurable composition implemented. Enforcement initially stayed off. Iterations 206–207 verify lifecycle/admission ordering, prior-day fencing and saved-schedule no-occurrence release. Iteration 208 adds ledger-consistent Status reserve/manual allowance and last scheduled outcome visibility. Iteration 209 adds manual-create reserve notices and submission-time refresh. Iteration 210 enables production enforcement with measured sizing and 1.5x headroom; no fixed override. Next: observe Nov 3 scheduled AI cost/duration before acknowledging item 13. See reserve decision and PROGRESS for detail.

- [x] STEERING 14 (211): park Reddit collection in docs/Status, disable scheduling; no further Reddit HTTP requests. Social completion now requires X only. Priority order: 13, 7 scheduled timing, 9 scheduled X, 10 coverage; 2/4 lower priority.

- [x] STEERING 12: shrink orientation files (154).
- [x] STEERING 7 infrastructure (155–165): [batching, async jobs and fake timing](docs/progress-archive/2026-11-02-tasks-155-165.md).
- [ ] STEERING 7, first: async BullMQ creation/regeneration, window dedupe, progress UI and last-run duration. Fake job/publication flows verified; measure live provider timing against <60s/current-volume and <2min/1,500-item targets. Repository fake baseline is documented; not a live latency claim.
  - Read-only `scripts/report-edition-timing.ts` links retained durations to edition modes/candidates and budget. Iteration 169's scheduled run: 856 ms, four topics, non-AI fallback; not AI latency evidence. Next run Nov 3 15:00 UTC; use it for timing, without a paid trial.
- [ ] STEERING 8, PARKED by owner under item 14: curated editable Reddit communities, public rate-limited JSON/RSS ingestion, social storage/cards and X citation extraction; real posts across four topics. Respect access denial; no bypass.
  - Iterations 168–176: editable communities, bounded collection/storage, X citations, historical-strength ranking, X-preferred editorial selection and immutable faithful cards are wired through publication. Synthetic/isolated verification only. Public access remains 403; collection unscheduled. No further HTTP requests unless owner re-enables. Current snapshots require five prior community observations before Reddit qualifies.
- [ ] STEERING 9, after 13/7 (no Reddit dependency): schedule capped direct xAI discovery before digest; report daily spend and verified yield for first week. Item 14 removes the Reddit prerequisite.
  - 212–214: daily cost/yield report, durable requested-topic snapshots and serialized first-search attribution. 215: durable once-per-UTC-day admission across topics/retries, including rejected calls. Next: pre-edition timer and weakest-topic choice.
- [x] STEERING 10: per-topic coverage on Status and live baseline (iteration 177); reassess before adding sources.
  - Iteration 177: rolling 24-hour distinct article and verified X/Reddit coverage plus connected/healthy source counts added to Status. Counts indicate collection scope, not semantic relevance. Live baseline: NBA fewest articles (74); World fewest verified X posts (9). All 32 connected sources healthy; no new sources added.
- [x] STEERING 11: restored 07:00 America/Los_Angeles daily P1D; browser smoke uses intercepted in-memory profile, retired live scheduler probe; scheduling tests use disposable services (iteration 166).
- [ ] STEERING 4 (lower priority): fingerprinted LlmPort replay and separate verification spend on Status. Iteration 178: three Anthropic smoke scripts require LLM_LIVE=1, tag verification and share a serialized $0.05/day cap. Iteration 179: historical recording entrypoint guarded and verification-capped. Iteration 180: Status now separates tagged verification and all other purpose totals, including old unresolved holds; historical editorial tags remain explicitly mixed. Iteration 181: shared stable cache fingerprint, fail-closed replay/recording LlmPort adapters, synthetic transport fixture and guarded recorder capture added. Iteration 182: raw synthetic transport replay now covers real article triage/editor through publication against a frozen topic snapshot, with fresh caches. Real raw-response golden coverage remains open; do not re-record unchanged prompts or spend merely to test replay.

Completed milestone detail: [archive](docs/progress-archive/2026-11-02-tasks-through-143.md).
M0–M2 and foundational M3/M6/M7 functionality are implemented; remaining work follows.

## Remaining milestones

- [ ] M3 first real digest (in progress):
  - [x] Anthropic editorial publication with capped triage/editor and immutable evidence (iterations 55–72).
  - Audit work closed for now under STEERING 5: existing recorded/synthetic coverage is summarized in docs/RANKING.md. Resume only for a real unsupported digest summary.
  - Deferred: scheduled Message Batches, cross-process cache coordination, full-article retrieval and larger editor shortlists.
- [ ] M4 Social posts (current priority; STEERING 6):
  - Next: observe the first scheduled semantic social edition and measure relevant Gaming discovery. Keep full-day X reservation unchanged; enable capped paid scheduling only through verified STEERING 9 work. Semantic selection is not a virality measurement.
  - [x] SocialPost storage, bounded discovery, immutable selections and official X embeds (iterations 87–143).
  - Reddit per-topic communities and faithful cards; no bot-protection workarounds. Bluesky optional; YouTube deferred.
  - [x] Direct capped xAI adapter and ledger implemented; scheduled use remains STEERING 9. Never use gateway.
  - [x] Semantic triage/editor and citation-based story links implemented; semantic same-event links and virality validation remain open.
  - Finish with real X posts across four topics and desktop/mobile screenshots.
- [ ] M5 ranking quality:
  - Semantic event clustering and verified outlet independence remain unfinished.
  - explainable scores
  - per-topic relevance guidance
  - Next: independently reviewed labels, different dates and Gaming; these agent-labeled windows are not general quality estimates.
- [ ] M6 configuration UI: topics CRUD/reorder/enable, schedule and budgets,
      on-demand digest for any window.
  - Reddit communities editable (169); automatic generation and run/status visibility connected under M7.
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

- [ ] STEERING 2a (lower priority): finish repository/HTTP characterization, nonempty golden edition and database coverage. Iterations 183–191 added isolated Postgres/Redis, fresh migrations, HTTP/worker flows, content/Reddit/publisher/X repositories, source telemetry and X budget boundary/rollback tests (99 unit/95 integration). See README/PROGRESS for coverage. Never touch live DB; finish 2a before ORM.
- [ ] STEERING 2b (only after 2a is green): record Drizzle decision/schema parity, back up live DB, gradually replace raw SQL behind ports and enforce boundaries.
