# Tasks

Fix failures and stalled sources first. [Completed markers](docs/progress-archive/2026-11-03-completed-task-markers-427.md).
STEERING overrides older milestone notes; implementation history is in PROGRESS.md and its archives.

## Immediate owner priorities

- [ ] STEERING 30: top product priority after breakages/Nov 5 checks: follow [X search plan](docs/x-search-plan.md) exactly. Story reactions primary; X-side Top/operators/thresholds; persist actual queries. Experiment cap $2.50 total/$1 per UTC day, outside 13:00–16:00 UTC; production caps unchanged. Replaces optional/followup machinery when shipped.

  - Instrumentation (674): actual provider custom-tool function/input pairs now settle atomically beside cost, including calls with unusable citations; historical traces unknown. Per-topic threshold settings completed (675): approved A/B minima and NBA exclusions stored with topic deletion cleanup; missing custom-topic settings remain explicit. Capped comparison remains next; production search/schedule unchanged.

- [ ] STEERING 27: verify Nov 5 scheduled grouping admission, accuracy, cost, latency and desktop/mobile screenshots. Nov 4 review: 151.532 s/$0.291162, NBA fallback, World no posts, paid open-X picks 0/19 ([review](docs/edition-reviews/2026-11-04.md)).
  - Same-story pass enabled for Nov 5 (650), following passed sampled gate: labelled precision 141/141, recall 141/157; zero clearly unrelated and one borderline among 155 reviewed merges. Four-call reservation bound $0.058192; reserve protects full daily cap. No wording grouping rules. Actual grouped edition remains unverified.
- [ ] STEERING 13: full-AI scheduled acceptance remains open. Reserve/fencing/UI implemented; Nov 3 $0.339524/231.829 s, Nov 4 $0.291162/151.532 s, reserve released/zero holds. NBA Sonnet and Haiku initial+repair failures proved by fingerprints, all candidates scored. Numeric No. rank false positives fixed (647), bounded diagnostics (648) and field-specific repair hints (653) shipped. Await actual NBA outcome; rejected wording unavailable.
- [ ] STEERING 7: generation targets <60 s/current volume and <2 min/1,500 items remain unmet. Async BullMQ flow, dedupe/progress/durations implemented. Use scheduled timing, no paid trial.
  - Offline concurrency assessment (662): peak four, eight-slot optimistic bound 63.327 s; removing article triage still leaves four-slot bound 65.878 s. [Evidence](docs/edition-reviews/2026-11-04-concurrency.md). Compare Nov 5 NBA repairs and Bluesky tail before tuning.
  - Recorded usage replay (670): triage emits 77.4% of Nov 4 output tokens and consumes 64.5% of aggregate HTTP time; no output-limit stops. Cached field measurement (671): article event/rationale p95 46/58 chars, social 43/53; no guidance overruns. Compare Nov 5 before batch-size changes; no speedup inferred ([evidence](docs/edition-reviews/2026-11-04-concurrency.md)).
  - Shipped compact triage output/wire IDs, bounded bulk cache reads (664), wrapper forwarding (665), atomic batch writes (666), exact linear prompt-size accounting (667), shared-context fingerprint hashing (669), social-editor wire aliases (663). Prompts/cache identity preserved where documented; no measured live speed improvement. Recency pool caps rejected because they lose stories. Details in [RANKING](docs/RANKING.md).
  - Offline batching accepts typed local article/social pools with real kind-specific prompts and caller-barrier/cache checks (673). Synthetic social example verified; real social pool timing remains unmeasured. No production batching change.
  - Triage coverage repair now explains missing/duplicate/extra/original IDs (672); article/social fake-provider recovery and warm-cache reuse verified. Live repair incidence/latency remains unmeasured.
  - Invalid social-ID/duplicate/over-budget repairs now receive fixed guidance (668), motivated by two Nov 4 Bluesky Sonnet validator failures. Offline X/Bluesky recovery verified; live repair/latency outcome remains unmeasured.
- [ ] STEERING 16: open X search active, with durable low-yield followups, reported engagement/velocity and budget-permitting reactions/account-list paths. First all-topic scheduled account-list run acknowledged (425); open search enabled (430).
  - Nov 4: $0.149447/19 new verified outside-list posts, only 13 in-window, NBA five betting promotions, reported likes at most 12; none selected. Tightened discovery instructions (651), no paid trial. Final editor now receives engagement provenance/unknowns (656). Need quality/viral acceptance and real X picks across all four topics.
- [ ] STEERING 9/15: continue first-week daily per-topic/type cost and incremental verified yield. Nov 3 $0.137056/18 new verified; Nov 4 $0.149447/19. Seven-day ledger at Nov 4 review: $0.309885/9 calls including unattributed Nov 2. Four topics daily, weakest-first; scheduled per-topic hold $0.10; unchanged $0.40/day/$12/month cap.
- [ ] STEERING 18: hourly authenticated Bluesky collection and edition inclusion active. ExpiredToken refresh/re-login fixes shipped; seven consecutive hourly runs through Nov 4 11:54 verified (619), but frequent restarts leave long-lived refresh unverified.
  - Nov 4: one Tech pick, 767 likes/329 replies/342 reposts, Haiku edited; screenshots saved. It duplicates X. Existing-pick context (652), same-moment guidance (654), engagement guidance (658), completed semantic gates on fallback (657), exact coverage/score checks (659), final shortlist identity checks (660) and empty-pool early return (661) shipped. Broader topic quality and duplicate reduction await scheduled evidence.
- [ ] STEERING 28 / speed: incremental triage stays OFF. Default-off runtime, shared admission, reserve-safe scoring, exact pools, cutoff checks and sibling draining verified. Replays measure threshold/rotation skips and reusable/wasted versions; real waste/latency unmeasured.
  - Activation assessment (655): no qualifying full-AI editions; Nov 5 reserve uses full projected daily cap ($0.495028 without more spend), leaving $0 background allowance. [Assessment](docs/edition-reviews/2026-11-04-incremental-admission.md). Reassess after full-AI acceptance without reducing protection.
- [ ] STEERING 4 (lower priority): fake/replay LlmPort and verification spend implemented; real raw-response golden remains open. Recording concurrency, metadata/request isolation and integer usage verified (621–630). Do not re-record unchanged prompts or spend only to test replay. See [database verification](docs/DATABASE-VERIFICATION.md).
- [ ] STEERING 8 PARKED under item 14: Reddit code prepared, access denied; no HTTP requests until owner re-enables with official API credentials. YouTube deferred. No bypass.

## Remaining milestones

- [ ] M3: first fully AI-edited scheduled digest; NBA acceptance above. Audit work closed under STEERING 5; resume only for an actual unsupported summary. Deferred: Message Batches, cross-process cache coordination, full articles and larger editor shortlists.
- [ ] M4 Social posts: real X picks across all four topics; Nov 4 X counts Tech/NBA/Gaming/World 4/5/5/0, plus one Tech Bluesky. Immutable storage, official embeds, capped discovery, semantic editing and citation links implemented. Semantic same-event links and virality acceptance remain open. Reddit parked; Bluesky secondary.
- [ ] M5: grouping activation evidence above; verified outlet independence, explainable scores and per-topic guidance. Need independently reviewed labels, different dates and Gaming; agent-labelled windows are not general quality estimates.
- [ ] M6: topics CRUD/reorder/enable, schedule/budgets and on-demand window UI; editable Reddit communities and automatic schedule/run visibility already connected.
- [ ] M7: durable recovery beyond retained Redis jobs; DigestPublished event and log/in-app notification adapter. No real notifications.
- [ ] Ongoing: source balance (item 10) paused under 27; Yardbarker prepared/disabled. Precision, UI, retention/backups, resilience.
- [ ] STEERING 24/25 background only: [observability plan](docs/observability-plan.md). O1–O10 verified (442); O8 unavailable counts remain unknown. Stop CLI/dashboard refinements. O11 deferred (620): observed 548.72 MiB daily peak exceeds approximate 500 MiB target; require isolated overhead benchmark before reconsidering. Monitor metrics/log/Grafana cache refill under existing soft/hard memory limits.

## Done markers

- [x] STEERING 17: reviewed editable account lists active (431), read back 11/10/12/11 on Nov 4.
- [x] STEERING 29 console (566): isolated context, production prompt, external history, repository/SQL access; no worker/timer startup.
- [x] STEERING 2a (570): isolated fresh Postgres/Redis migrations, repository/HTTP/worker characterization, synthetic golden and coverage inventory.
- [x] STEERING 2b (618): Drizzle conversion, zero-diff gates, unchanged characterization, healthy live data/UI; future migration requires private pg_dump and owner grants.
- [x] Grafana desktop/mobile sweep (561); social next-run mismatch (560); Bluesky recovery shipped (513/570).
