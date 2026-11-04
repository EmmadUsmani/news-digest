# Tasks

Fix failures and stalled sources first. [Completed markers](docs/progress-archive/2026-11-03-completed-task-markers-427.md).

## Immediate owner priorities (STEERING overrides older milestone notes)

- [x] Bluesky HTTP 400 ExpiredToken recovery shipped (513); historical failure remains probable, not proven. Sustained hourly collection monitoring stays under item 18.

- [ ] STEERING 27: World date bounds fixed (428); NBA rejection awaits logs. Hard-exclusion prefilter ships (481); then fewer triage candidates; inactive same-story AI pass restored (482); 195 pairs relabelled (483), old saved output 135/135 precision and 135/157 recall; restored-prompt evaluation passed sampled gate (484): $0.008393/7 calls, labelled precision 141/141, recall 141/157; 14 additional merges reviewed same-story, one borderline/155 merges. No new sources/features before Nov 4 evidence; grouping stays off until checked, then Nov 5 activation if passing. Item 27 overrides older parking/order notes below.

- [ ] STEERING 16 (next implementation): open per-topic X search without handle restrictions; reported engagement/velocity, then budget-permitting story reactions and secondary account lists. Keep caps; item 15's first scheduled run is acknowledged before switching. Report search type, cost/yield and outside-list accounts; finish with real editions/screenshots.
  - Open/engagement reporting and durable optional execution are wired and fake-tested (271–294). Item 15 acknowledged (425); open-topic production activated (430), including durable low-yield followups. Next scheduled cost/yield/outside-list picks remain unverified; items 13/7 still await provider evidence. Iteration 296 adds daily topic/type cost and incremental-yield summaries with explicit unknowns.

- [ ] STEERING 18 (325): authenticated Bluesky discovery, engagement/semantic editing, storage/cards and edition caller prepared. Owner login configured; Nov 3 gate acknowledged. Hourly bounded official collection added (432); edition inclusion enabled by default (433), with explicit off switch. Iteration 513 fixes HTTP 400 ExpiredToken refresh (once, preserving pagination); historical 23:54 code unrecorded. Iteration 570 clears rejected refresh sessions after a new 04:54 UTC failure so the next collection can sign in afresh; recovery fake-tested; first scheduled recovery completed Nov 4 05:54 UTC (572), sustained recovery pending. Next: verify sustained hourly collection and scheduled real selections/screenshots. Reports expose immutable platform picks (443) and fresh stored Bluesky candidates across four topics (444); selection evidence pending.

- [ ] STEERING 13 TOP PRIORITY before Nov 3 15:00 UTC: reserve configurable Anthropic budget for the scheduled edition under the shared ledger lock; limit all other spend until completion/failure; expose reserve/manual limits and scheduled AI/fallback outcome. Fake/Testcontainers verification only. Measure next scheduled edition cost/duration for item 7.
  - Reserve/fencing/UI implemented with 1.5x headroom. Nov 3 (425): $0.339524, 231.829 s, zero holds; NBA fallback leaves full-AI acceptance open.

- [ ] STEERING 28 / item 7 speed: incremental triage stays off pending Nov 4 review. Default-off worker/runtime, reserve-safe scoring, shared Postgres admission, exact pools and evidence exports are tested (519–548); no production worker import or paid calls. Offline replay measures changed inputs and wasted scoring versions (549–550). Ten-item batches add 22.3% input bytes (551). Recorded Nov 3 concurrency analysis (552): eight slots still imply ≥101.421 s at fixed call durations; no production speed prediction or concurrency change. Input-byte decomposition (553): excerpts 45.8%, instructions 5.6%; no prompt changes or quality/latency claim. Next: review gate, worker connection, actual waste and live latency/cost. See docs/RANKING.md.

- [ ] STEERING 7, first: async BullMQ creation/regeneration, window dedupe, progress UI and last-run duration. Fake job/publication flows verified; measure live provider timing against <60s/current-volume and <2min/1,500-item targets. Fake timings are not live latency evidence.
  - `scripts/report-edition-timing.ts` retains bounded scheduled evidence/partial failures. Nov 3 (425): 231.829 s, 748 candidates, 43 calls; NBA editor fallback. Offline diagnosis (426): 133,175 triage tokens/517 s aggregate; all calls 811 s, four-slot lower bound ~203 s. Compact triage output (427) reduces 50-item reservation from 15,000 to 9,964 tokens, preserving item caches. Validation/completion logs (426/429) await scheduled evidence; rejected text was not cached. Recorded recency-cap assessment (485): cap 50 loses a Tech target; cap 20 loses 6/15 targets, so no production cap shipped. Batch-local wire IDs (466): 50 UUID items reserve 8,254 vs 9,964 output tokens; live effect and NBA cause remain unverified. No paid trial; fake timings are not live evidence.
- [ ] STEERING 8, PARKED by owner under item 14: curated editable Reddit communities, public rate-limited JSON/RSS ingestion, social storage/cards and X citation extraction; real posts across four topics. Respect access denial; no bypass.
  - Prepared storage/cards/editorial wiring (168–176), synthetic verification only. Access 403; no requests until owner re-enables.
- [ ] STEERING 9, after 13/7 (no Reddit dependency): schedule capped direct xAI discovery before digest; report daily spend and verified yield for first week. Item 14 removes the Reddit prerequisite.
  - Cost/yield reporting, durable admission, weakest-topic planning and official verification implemented. Worker searches 5–30 minutes before publication; seven-day report available. First automatic run verified (425): $0.137056/18 new verified posts. Continue first-week spend/yield.
- [ ] STEERING 4 (lower priority): fingerprinted LlmPort replay and separate verification spend are implemented (178–182); real raw-response golden remains open. Do not re-record unchanged prompts or spend merely to test replay. See docs/DATABASE-VERIFICATION.md.

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
  - Inactive same-story AI pass passed item 27 sampled evaluation; activation awaits Nov 4 review for Nov 5. Verified outlet independence remains unfinished.
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
  - widen sources (item 10): paused by item 27. Yardbarker page harvesting prepared, disabled (480); existing feeds unchanged.
  - precision tuning
  - UI polish
  - retention/backup
  - resilience

- [x] STEERING 29 production console (566): isolated Nest context, live prompt, env loading, external history and repository/SQL bindings; startup listener/timer regression and isolated DB smoke test.

- [x] STEERING 2a (570): isolated Postgres/Redis, fresh migrations, repository/HTTP/worker characterization, synthetic edition golden and coverage inventory verified. Final prerequisite gaps closed: SQL facades (567–568), usage rollback/client/lock release (569), social engagement cutoff/tie/topic ordering (570). See [database verification](docs/DATABASE-VERIFICATION.md); item 4's real-response recording stays separate.

- [ ] STEERING 2b: first Drizzle conversion is profiles (571), with unchanged characterization suite and ORM import boundaries. Full 25-table generated-DDL/catalog parity added (572); drizzle-kit composite FK introspection repaired with pinned pnpm patch and read-only real-CLI zero-diff regression (573). Bluesky collection/edition reads (574) and scheduled-budget lifecycle (575) and Reddit storage/edition reads (576) converted, preserving unchanged characterization tests. Publisher-article X discovery converted (577), including fair candidate selection and atomic citation/check recording. Next: adopt the historical migration baseline; back up live DB before first new migration, then convert remaining repositories individually. Existing SQL migrations remain authoritative.

- [x] Full Grafana verification (561): scroll to mount virtualized Agent mobile Supervisor panels; all ten dashboard checks and desktop/mobile sweep pass. Refreshed Agent mobile screenshot.

- [x] Fix social next-run mismatch (560): Status now reads the earliest recurring schedule, matching metrics; isolated two-schedule regression added.

- [ ] STEERING 24/25 (background while product blocked): [observability plan](docs/observability-plan.md). O1–O10 verified through metadata-only browser errors (442). O8 unavailable counters stay uninferred. Iteration 514 adds the duration-only slow-call view linked from Database. O11 tracing requires overhead evidence/decision note; stop CLI/dashboard refinements. Product evidence takes priority.
  - Memory warning recovery (454): metrics-store resets all expendable caches on startup; oversized saved storage caches survived the previous query-only reset. Iteration 504 lowers the Go target to 48 MiB after renewed memory warning; hard ceiling/alert threshold unchanged. Monitor cache refill. Iteration 559 adds Grafana 208 MiB soft reclaim after filesystem cache pushed it near its unchanged 256 MiB ceiling. Iteration 512 adds a 128 MiB soft reclaim threshold to the log store after filesystem-cache pressure; hard 160 MiB ceiling unchanged.
