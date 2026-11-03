# Tasks

Fix failures and stalled sources first. [Completed markers](docs/progress-archive/2026-11-03-completed-task-markers-427.md).

## Immediate owner priorities (STEERING overrides older milestone notes)

- [ ] STEERING 16 (next implementation): open per-topic X search without handle restrictions; reported engagement/velocity, then budget-permitting story reactions and secondary account lists. Keep caps; item 15's first scheduled run is acknowledged before switching. Report search type, cost/yield and outside-list accounts; finish with real editions/screenshots.
  - Open/engagement reporting and durable optional execution are wired and fake-tested (271–294). Item 15 acknowledged (425); open-topic production activated (430), including durable low-yield followups. Next scheduled cost/yield/outside-list picks remain unverified; items 13/7 still await provider evidence. Iteration 296 adds daily topic/type cost and incremental-yield summaries with explicit unknowns.

- [x] STEERING 17 (431): editable secondary X lists activated; scheduled effectiveness pending.
- [ ] STEERING 18 (325): authenticated Bluesky discovery, engagement/semantic editing, storage/cards and edition caller prepared. Owner login configured; Nov 3 gate acknowledged. Hourly bounded official collection added (432); edition inclusion enabled by default (433), with explicit off switch. Next: measure scheduled real selections/screenshots. Reports expose immutable platform picks (443) and fresh stored Bluesky candidates across four topics (444); selection evidence pending.
- [ ] STEERING 19: default-off grouping wired through immutable editions (333–342). Recorded review now 98 pairs/three dates (457): lexical 6/57, opt-in studio/game/preload/title-reveal 31/57 positives, 0/41 false merges. Nov 3 Gaming adds 23 real candidates, 25 same-event and 13 distinct-event pairs; preload overviews now recover three same-event pairs; explicit title-reveal headlines including successor framing and publisher confirmation recover ten more pairs; excerpt-confirmed identities now recover five more pairs; other paraphrases remain missed. Synthetic guards cover uncertain/historical claims, including trailing excerpt qualifiers (458), and reversed roles. Hardware-variant guards strengthened (452). Next: broader Gaming paraphrase recall, independent labels and activation; syndication does not prove outlet independence.

- [ ] STEERING 13 TOP PRIORITY before Nov 3 15:00 UTC: reserve configurable Anthropic budget for the scheduled edition under the shared ledger lock; limit all other spend until completion/failure; expose reserve/manual limits and scheduled AI/fallback outcome. Fake/Testcontainers verification only. Measure next scheduled edition cost/duration for item 7.
  - Reserve/fencing/UI implemented with 1.5x headroom. Nov 3 (425): $0.339524, 231.829 s, zero holds; NBA fallback leaves full-AI acceptance open.

- [ ] STEERING 7, first: async BullMQ creation/regeneration, window dedupe, progress UI and last-run duration. Fake job/publication flows verified; measure live provider timing against <60s/current-volume and <2min/1,500-item targets. Fake timings are not live latency evidence.
  - `scripts/report-edition-timing.ts` retains bounded scheduled evidence/partial failures. Nov 3 (425): 231.829 s, 748 candidates, 43 calls; NBA editor fallback. Offline diagnosis (426): 133,175 triage tokens/517 s aggregate; all calls 811 s, four-slot lower bound ~203 s. Compact triage output (427) reduces 50-item reservation from 15,000 to 9,964 tokens, preserving item caches. Safe run/model/fingerprint validation and provider completion/output-ceiling logs (426/429) await next scheduled evidence; past rejected responses were not cached. No paid trial; fake timings are not live evidence.
- [ ] STEERING 8, PARKED by owner under item 14: curated editable Reddit communities, public rate-limited JSON/RSS ingestion, social storage/cards and X citation extraction; real posts across four topics. Respect access denial; no bypass.
  - Prepared storage/cards/editorial wiring (168–176), synthetic verification only. Access 403; no requests until owner re-enables.
- [ ] STEERING 9, after 13/7 (no Reddit dependency): schedule capped direct xAI discovery before digest; report daily spend and verified yield for first week. Item 14 removes the Reddit prerequisite.
  - Cost/yield reporting, durable admission, weakest-topic planning and official verification implemented. Worker searches 5–30 minutes before publication; seven-day report available. First automatic run verified (425): $0.137056/18 new verified posts. Continue first-week spend/yield.
- [ ] STEERING 4 (lower priority): fingerprinted LlmPort replay and separate verification spend are implemented (178–182); real raw-response golden remains open. Do not re-record unchanged prompts or spend merely to test replay. See docs/DATABASE-VERIFICATION.md.

History: [archive](docs/progress-archive/2026-11-02-tasks-through-143.md).
M0–M2; M3/M6/M7 foundations implemented.

## Remaining milestones

- [ ] M3 first real digest (in progress):
  - [x] Anthropic editorial publication with capped triage/editor and immutable evidence (iterations 55–72).
  - Audit work closed for now under STEERING 5: existing recorded/synthetic coverage is summarized in docs/RANKING.md. Resume only for a real unsupported digest summary.
  - Deferred: scheduled Message Batches, cross-process cache coordination, full-article retrieval and larger editor shortlists.
- [ ] M4 Social posts (current priority; STEERING 6):
  - Nov 3 edition (425): X picks Tech/AI 4, NBA 4, Gaming 3, World 0; World eligibility traced (428): all five scheduled discoveries predate edition start; fixed date-only search bounds to include current UTC day with exact-time prompt. Next scheduled World yield remains unverified. Scheduled X holds use $0.10 per topic under STEERING 15; manual holds retain the full day. Semantic selection is not a virality measurement.
  - [x] SocialPost storage, bounded discovery, immutable selections and official X embeds (iterations 87–143).
  - Reddit per-topic communities and faithful cards; no bot-protection workarounds. Bluesky optional; YouTube deferred.
  - [x] Direct capped xAI adapter and ledger implemented; scheduled use remains STEERING 9. Never use gateway.
  - [x] Semantic triage/editor and citation-based story links implemented; semantic same-event links and virality validation remain open.
  - Finish with real X posts across four topics. Nov 3 embeds/media verified desktop/mobile (448); open-X/Bluesky selection screenshots await next edition.
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

- [ ] STEERING 2a (lower priority): finish repository/HTTP characterization before ORM. Isolated DB/Redis, migrations, HTTP/worker and synthetic-AI goldens implemented (183–270); gaps: [database verification](docs/DATABASE-VERIFICATION.md). No live DB; finish 2a before ORM. Recorded-response golden open.
- [ ] STEERING 2b (only after 2a is green): record Drizzle decision/schema parity, back up live DB, gradually replace raw SQL behind ports and enforce boundaries.

- [ ] STEERING 24/25 (background while product blocked): [observability plan](docs/observability-plan.md). O1–O10 verified through metadata-only browser errors (442). O8 unavailable counters stay uninferred. O11 tracing requires overhead evidence/decision note; stop CLI/dashboard refinements. Product evidence takes priority.
  - Memory warning recovery (454): metrics-store resets all expendable caches on startup; oversized saved storage caches survived the previous query-only reset. Limits unchanged.
