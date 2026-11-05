# Tasks

Fix failures first. [Completed markers](docs/progress-archive/2026-11-03-completed-task-markers-427.md).
STEERING overrides older milestone notes; implementation history is in PROGRESS.md and its archives.

## Immediate owner priorities

- [x] STEERING 35 reader text restored (738): AI summary or saved excerpt, no snapshot writes; Nov 4 NBA 5/5 non-empty via reader API and desktop/mobile screenshots, topic labels pass. Nov 5 scheduled NBA outcome remains FIRST when available at 15:00 UTC; investigate fallback before items 33/34.

- [ ] STEERING 34 NOW: follow [X search plan](docs/x-search-plan.md). Query/runtime/preparation/runner/report/extractor/comparison migrated (720–725): fresh viral keywords, exact UTC windows, -giveaway, 16 viral/eight test-only semantic results, saved likes thresholds, explicit free-link novelty and eight-cell round coverage. Unknown evidence stays unknown; World reported separately. Grok 4.3 and caps unchanged; production fixed schedule off, no paid calls. Next scorer after Nov 5 edition; two fresh-window rounds after 21:00 UTC Nov 5/6, then same-day old-search baseline review and decision. Earliest production edition Nov 7; no round-1 analysis or model round.

- [x] STEERING 32 (705–709): default-off fixed A/B runtime prepared; production remains off pending experiment decision. Private nightly backups, seven-day retention, weekly isolated restore proof and 26-hour vmalert deployed. First restore matched all 26 application tables; details in [Operations](docs/handbook/01-app/10-backups.md).

- [ ] STEERING 30/31: experiment caps/reporting still apply under item 34 ($2.50 total/$1 per UTC day, outside 13:00–16:00 UTC; $0.15 per-call reservation). Round 1 charged $0.532331 including unresolved Gaming timeout; no winner or activation. Historical evidence: [experiment](docs/x-search-experiment.md), [review](docs/edition-reviews/2026-11-04-x-experiment-review.md). No further round-1 analysis or model round.

- [ ] STEERING 27: verify Nov 5 scheduled grouping admission, accuracy, cost, latency and desktop/mobile screenshots. Nov 4 review: 151.532 s/$0.291162, NBA fallback, World no posts, paid open-X picks 0/19 ([review](docs/edition-reviews/2026-11-04.md)).
  - Same-story pass enabled for Nov 5 (650), following passed sampled gate: labelled precision 141/141, recall 141/157; zero clearly unrelated and one borderline among 155 reviewed merges. Four-call reservation bound $0.058192; reserve protects full daily cap. No wording grouping rules. Actual grouped edition remains unverified.
- [ ] STEERING 13: full-AI scheduled acceptance remains open. Reserve/fencing/UI implemented; Nov 3 $0.339524/231.829 s, Nov 4 $0.291162/151.532 s, reserve released/zero holds. NBA Sonnet and Haiku initial+repair failures proved by fingerprints, all candidates scored. Numeric No. rank false positives fixed (647), bounded diagnostics (648) and field-specific repair hints (653) shipped. Await actual NBA outcome; rejected wording unavailable.
- [ ] STEERING 7: generation targets <60 s/current volume and <2 min/1,500 items remain unmet. Async BullMQ flow, dedupe/progress/durations implemented. Use scheduled timing, no paid trial.
  - Offline concurrency assessment (662): peak four, eight-slot optimistic bound 63.327 s; removing article triage still leaves four-slot bound 65.878 s. [Evidence](docs/edition-reviews/2026-11-04-concurrency.md). Compare Nov 5 NBA repairs and Bluesky tail before tuning.
  - Offline batching (662–688): no gain in saved Bluesky/X pools. Compact IDs, caching, repair and sibling recovery shipped; compare Nov 5 incidence/speed ([evidence](docs/edition-reviews/2026-11-04-concurrency.md)).
- [ ] STEERING 16: open X search active, with durable low-yield followups, reported engagement/velocity and budget-permitting reactions/account-list paths. First all-topic scheduled account-list run acknowledged (425); open search enabled (430).
  - Nov 4: $0.149447/19 new verified outside-list posts, only 13 in-window, NBA five betting promotions, reported likes at most 12; none selected. Tightened discovery instructions (651), no paid trial. Final editor now receives engagement provenance/unknowns (656). Need quality/viral acceptance and real X picks across all four topics.
- [ ] STEERING 9/15: continue first-week daily per-topic/type cost and incremental verified yield. Nov 3 $0.137056/18 new verified; Nov 4 $0.149447/19. Seven-day ledger at Nov 4 review: $0.309885/9 calls including unattributed Nov 2. Four topics daily, weakest-first; scheduled per-topic hold $0.10; unchanged $0.40/day/$12/month cap.
- [ ] STEERING 18: hourly authenticated Bluesky collection and edition inclusion active. ExpiredToken refresh/re-login fixes shipped; seven consecutive hourly runs through Nov 4 11:54 verified (619), but frequent restarts leave long-lived refresh unverified. Refresh body bug fixed (698); official API and hourly recovery verified.
  - Nov 4: one Tech Bluesky pick (767 likes/329 replies/342 reposts), duplicates X. Existing-pick context, same-moment/engagement guidance, fallback semantic gates and exact identity/coverage checks shipped (652–661). Broader quality and duplicate reduction await scheduled evidence.
- [ ] STEERING 33: after X search/schedule/backups and Nov 5 checks, rebuild reader/admin UI exactly per [approved UI spec](docs/ui-spec.md), five shippable steps in order; ahead of item 28 fallback work. SPA, TanStack Router/Query, Tailwind v4/shadcn, self-hosted Inter; server-side admin gate and desktop/mobile light/dark route screenshots.
  - Foundations complete (717–728): TanStack routing/query resources, validated edition/history navigation, Tailwind v4/shadcn, self-hosted Inter and saved light/dark theme. Screenshots in `docs/screenshots/ui/`.
  - Step 2 started (729): deny-by-default identity middleware, `/api/me`, reserved `/admin` and `/api/admin` protection; no loopback-only trust. Reader latest/by-ID allowlist endpoints prepared (730), excluding operational metadata; reader archive pagination prepared (731) and browser history migrated (732), with stale initial-history cancellation on job completion; browser edition detail migrated to sanitized reader contracts and content-only story/post rendering (733). Protected admin responses are uncached and vary on identity (735). Protected admin API aliases prepared (734) for topics/profile/status/content/digest previews, with isolated gate and write checks; legacy routes remain. Local operations sources/jobs and timing/Bluesky coverage reports, Bluesky probe and Grafana status comparisons now use token-authenticated protected reads (736–739); schedule recovery uses protected profile reads/restoration (740); private local token installed, owner email still unconfigured. Admin migration remains open. Next: configure admin identity, switch UI/scripts and remove legacy routes while gating tools together. Proxy origin/spoof checks remain pending; see [access decision](docs/decisions/2026-11-05-admin-access.md).

- [ ] STEERING 28 / speed: incremental triage stays OFF. Default-off runtime, shared admission, reserve-safe scoring, exact pools, cutoff checks and sibling draining verified. Replays measure threshold/rotation skips and reusable/wasted versions; real waste/latency unmeasured.
  - Activation assessment (655): no qualifying full-AI editions; Nov 5 reserve uses full projected daily cap ($0.495028 without more spend), leaving $0 background allowance. [Assessment](docs/edition-reviews/2026-11-04-incremental-admission.md). Reassess after full-AI acceptance without reducing protection.
- [ ] STEERING 4 (lower priority): fake/replay LlmPort and verification spend implemented; real raw-response golden remains open. Recording concurrency, metadata/request isolation and integer usage verified (621–630). Do not re-record unchanged prompts or spend only to test replay. See [database verification](docs/DATABASE-VERIFICATION.md).
- [ ] STEERING 8 PARKED under item 14: Reddit code prepared, access denied; no HTTP requests until owner re-enables with official API credentials. YouTube deferred. No bypass.

## Remaining milestones

- [ ] M3: first fully AI-edited scheduled digest; NBA acceptance above. Audit work closed under STEERING 5; resume only for an actual unsupported summary. Deferred: Message Batches, cross-process cache coordination, full articles and larger editor shortlists.
- [ ] M4 Social posts: real X picks across all four topics; Nov 4 X counts Tech/NBA/Gaming/World 4/5/5/0, plus one Tech Bluesky. Immutable storage, official embeds, capped discovery, semantic editing and citation links implemented. Semantic same-event links and virality acceptance remain open. Reddit parked; Bluesky secondary.
- [ ] M5: grouping activation evidence above; verified outlet independence, explainable scores and per-topic guidance. Need independently reviewed labels, different dates and Gaming; agent-labelled windows are not general quality estimates.
- [ ] M6: CRUD/reorder/enable topics, schedule/budgets and on-demand UI connected. Enable/Disable verified (692); edition/history races fixed (694/697); create/delete/reorder browser checks replay writes (700–702). Broader acceptance open.
- [ ] M7: durable recovery beyond retained Redis jobs; DigestPublished event and log/in-app notification adapter. No real notifications.
- [ ] Ongoing: source balance (item 10) paused under 27; Yardbarker prepared/disabled. Precision, UI, retention/backups, resilience.
- [ ] STEERING 24/25 background: [observability plan](docs/observability-plan.md). O1–O10 done; O8 unknown. Stop CLI/dashboard refinements. O11 deferred: 548.72 MiB daily peak exceeds ~500 MiB target; isolated benchmark required. Monitor existing limits.

## Done markers

- [x] STEERING 17: reviewed editable account lists active (431), read back 11/10/12/11 on Nov 4.
- [x] STEERING 29 console (566): isolated context, production prompt, external history, repository/SQL access; no worker/timer startup.
- [x] STEERING 2a (570): isolated DB/Redis migrations, repository/HTTP/worker characterization, golden and coverage.
- [x] STEERING 2b (618): Drizzle, zero-diff and unchanged characterization passed; future migration requires private backup/owner grants.
- [x] Grafana desktop/mobile sweep (561); social next-run mismatch (560); Bluesky recovery shipped (513/570).
