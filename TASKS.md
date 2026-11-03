# Tasks

Fix regressions, broken services and stalled sources first.

## Immediate owner priorities (STEERING overrides older milestone notes)

- [x] STEERING 21 (295): all 16 handbook pages/21 diagrams and 24-table metadata check pass; owner approval acknowledged.

- [ ] STEERING 16 (next implementation): open per-topic X search without handle restrictions; reported engagement/velocity, then budget-permitting story reactions and secondary account lists. Keep caps; item 15's first scheduled run is acknowledged before switching. Report search type, cost/yield and outside-list accounts; finish with real editions/screenshots.
  - Open/engagement reporting and durable optional execution are wired and fake-tested (271–294). Production remains account-list pending scheduled evidence/acks; activation remains. Iteration 296 adds daily topic/type cost and incremental-yield summaries with explicit unknowns.

- [ ] STEERING 17 (315, advanced under item 22): reviewed four editable X lists (11/10/12/11), rationale in docs/SOURCES.md; API/browser verified. Item 23 arrived before push: restored original live lists (8/8/9/9); activate reviewed lists after the Nov 3 run is acknowledged.
- [ ] STEERING 18 (325: authenticated discovery, semantic/final editing, storage/cards and default-off edition assembly prepared; default-off production caller prepared; activation next): official Bluesky open discovery, engagement ranking and cards; owner login configured. Build/test live, keep production edition inclusion off until Nov 3 scheduled evidence is acknowledged.
- [ ] STEERING 19 (327: opt-in score-based game grouping prepared; after 18): conservative event grouping with fixture precision, one story per event and additional outlet links. Baseline 1/11; opt-in game matcher 4/11 same-event pairs, 0/10 false merges. No production caller; next broaden recorded negatives/dates before gated publication wiring.
- [x] STEERING 20 (270): priorities recorded; no further database characterization while 16–19 remain open. ESPN source label corrected to empty-response replacement, not owner parking.

- [ ] STEERING 15: scheduled X search for every enabled topic daily, weakest first; atomic per-topic/day admission, optional second search only below three verified additions and within projected caps. Fake tests only; acknowledge after first full scheduled run with per-topic cost/yield. Iteration 236 implements weakest-first coverage of all eligible topics, atomic per-topic/day admission and $0.10 scheduled projections; optional second searches stay disabled. Next: observe Nov 3 and acknowledge with actual per-topic cost/yield (315: pending at 02:54 UTC; 32 sources healthy; rolling-day X coverage 53/32/16/3).

- [ ] STEERING 13 TOP PRIORITY before Nov 3 15:00 UTC: reserve configurable Anthropic budget for the scheduled edition under the shared ledger lock; limit all other spend until completion/failure; expose reserve/manual limits and scheduled AI/fallback outcome. Fake/Testcontainers verification only. Measure next scheduled edition cost/duration for item 7.
  - Iterations 192–210: reserve lifecycle/admission, sizing, fencing and UI implemented; production uses 1.5x headroom. Next: observe Nov 3 AI cost/duration before acknowledging item 13; see reserve decision and PROGRESS.

- [x] STEERING 14 (211): Reddit parked and unscheduled; no HTTP requests. Social completion requires X only. Priority: 13, 7 timing, 9 X, 10 coverage; 2/4 lower.

- [ ] STEERING 7, first: async BullMQ creation/regeneration, window dedupe, progress UI and last-run duration. Fake job/publication flows verified; measure live provider timing against <60s/current-volume and <2min/1,500-item targets. Repository fake baseline is documented; not a live latency claim. Iteration 282 adds per-edition settled ledger cost/holds and reserve outcome to the read-only timing report, excluding unrelated jobs and unpublished retries.
  - Read-only `scripts/report-edition-timing.ts` links retained durations to edition modes/candidates and budget. Iteration 169's scheduled run: 856 ms, four topics, non-AI fallback; not AI latency evidence. Next run Nov 3 15:00 UTC; use it for timing, without a paid trial.
- [ ] STEERING 8, PARKED by owner under item 14: curated editable Reddit communities, public rate-limited JSON/RSS ingestion, social storage/cards and X citation extraction; real posts across four topics. Respect access denial; no bypass.
  - Prepared storage/cards/editorial wiring (168–176), synthetic verification only. Access 403; no requests until owner re-enables.
- [ ] STEERING 9, after 13/7 (no Reddit dependency): schedule capped direct xAI discovery before digest; report daily spend and verified yield for first week. Item 14 removes the Reddit prerequisite.
  - Iterations 212–218: daily cost/yield report, durable per-topic/day admission and attribution, weakest-topic planning and bounded official verification implemented. Worker polls the saved schedule each minute and searches 5–30 minutes before publication. Iteration 298 adds a read-only seven-day daily/topic/type report. Next: observe first automatic search and record first-week spend/yield.
- [x] STEERING 10: per-topic coverage on Status and live baseline (iteration 177); reassess before adding sources.
- [x] STEERING 11 (166): restored daily 07:00 America/Los_Angeles P1D; all schedule verification isolated.
- [ ] STEERING 4 (lower priority): fingerprinted LlmPort replay and separate verification spend are implemented (178–182); real raw-response golden remains open. Do not re-record unchanged prompts or spend merely to test replay. See docs/DATABASE-VERIFICATION.md.

Completed detail: [archive](docs/progress-archive/2026-11-02-tasks-through-143.md).
M0–M2 and foundational M3/M6/M7 functionality are implemented; remaining work follows.

## Remaining milestones

- [ ] M3 first real digest (in progress):
  - [x] Anthropic editorial publication with capped triage/editor and immutable evidence (iterations 55–72).
  - Audit work closed for now under STEERING 5: existing recorded/synthetic coverage is summarized in docs/RANKING.md. Resume only for a real unsupported digest summary.
  - Deferred: scheduled Message Batches, cross-process cache coordination, full-article retrieval and larger editor shortlists.
- [ ] M4 Social posts (current priority; STEERING 6):
  - Next: observe the first scheduled semantic social edition and measure relevant Gaming discovery. Scheduled X holds use $0.10 per topic under STEERING 15; manual holds retain the full day. Semantic selection is not a virality measurement.
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

- [ ] STEERING 2a (lower priority): finish repository/HTTP characterization before ORM. Disposable Postgres/Redis, fresh migrations, HTTP/worker flows, fallback and synthetic-AI goldens implemented (183–270). Coverage and remaining gaps: [database verification](docs/DATABASE-VERIFICATION.md). Never touch live DB; finish 2a before ORM. Recorded-response golden remains open.
- [ ] STEERING 2b (only after 2a is green): record Drizzle decision/schema parity, back up live DB, gradually replace raw SQL behind ports and enforce boundaries.

- [ ] STEERING 24 (low priority/background): implement owner-approved [observability plan](docs/observability-plan.md) O1–O11 one verified piece at a time, only when product work is done or blocked. Keep resource limits, local-only free tools and scheduled-run protection.
