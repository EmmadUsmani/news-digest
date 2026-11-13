# Tasks

Fix failures first. STEERING Current order wins. Detailed pre-compaction state and completed markers: [iteration 2144 archive](docs/progress-archive/2026-11-13-task-detail-2144.md).

## Open work

- [ ] BREAKAGE (2160): Nov 13 scheduled edition lost 11 candidate-triage calls to local ten-second inference-slot expiry; all stories non-AI, World/U.S. stories withheld. Four dispatched calls succeeded in 16–37 s. Shared four-request pre-reservation admission implemented (2161); five-topic/750-candidate composition and nine-editor/18-call repair ownership pass offline (2162). Saturated cache/deadline composition verified offline (2164): expired queued work creates no hold and slots remain reusable. Deployed API/worker at 16:00 UTC (2165); health/reader/access checks pass. Reader text check now accepts saved topic counts and exposes five empty Tech summaries in Nov 13 (2166). Headline-only fallback repair (2167) filters blank source text before story budgets; AI evidence and saved editions unchanged. Fallback repetition diagnosed (2170): seven Tech/Gaming cards cover three events; incomplete triage bypasses explicit AI grouping. Blank-text repair alone does not restore grouping. Read-only gate now accepts repeated `--require-ai-topic` names for all five sections (2176); Nov 13 Tech correctly fails. Next scheduled run must establish recovery, including Tech/Gaming event diversity; no paid replay/cap changes. [Review](docs/edition-reviews/2026-11-13.md).

- [ ] NBA recurrence (2004): saved Sonnet initial/repair and Haiku repair pass full offline validation (2101); malformed Haiku initial ID remains refused. Nov 13 acceptance failed before editing: local triage queue expiry; no story-editor call exercised the validator. Admission fix deployed after the hold (2165); accept the next scheduled NBA section. Read-only `check-scheduled-reader.ts <window-end> --require-ai-topic NBA` now refuses the saved Nov 13 non-AI edition (2169); publication alone is insufficient. No paid replay.

- [ ] Morning edition admission (2026): bounded Sonnet settlement waiting deployed; caps unchanged. Log event-name filtering repaired (2179); message/event queries reconcile all 14 saved admission records. Nov 13: 14 immediate Sonnet admissions, no waits/refusals, $0.236599 settled; natural recovery unobserved. Review the next normal run using the [checklist](docs/plans/sonnet-settlement-admission.md#natural-scheduled-review). Offline gates pass.

- [ ] STEERING 58: security fixes/rehearsals deployed; owner proxy port/email replacement recorded and STEERING 59 closes the proxy block. After normal scheduled publication with NBA AI editing, ack item 58 with edition ID; lead review proceeds in parallel. [Handoff](docs/phase4-security-handoff.md).

- [ ] STEERING 56/57: World/U.S. split deployed; review three consecutive scheduled editions. Nov 12 scope passes, but NBA fallback/admission refusals prevent acceptance. Nov 13 World/U.S. stories withheld after triage queue expiry; no accepted story observation. Effective approved caps AI $20/month/$0.65/day; X $15/month/$0.50/day. [Review](docs/edition-reviews/2026-11-12.md).

- [ ] STEERING 50: public mode OFF, VM private; private accounts accepted. Full public rehearsal complete (2104), Grafana excluded, Spend allowed. After NBA/item 58 scheduled acceptance: refresh [baseline/rollback](docs/public-activation-record.md), enable server/web public mode with sharing private, accept its next scheduled edition, then ack/stop for owner sharing decision. Rollback preparation (2148): private DB snapshot restored in isolation, 39 tables/98,127 rows matched; mode-600 environment copy verified. Refresh these after scheduled acceptance. Follow [readiness](docs/public-readiness.md). No deploy 13:00–16:00 UTC; no generation changes after noon except breakages.

- [ ] Breakage / metrics-store: retain Nov 7 CPU-only 2% trial. Natural compaction confirmed Nov 8; second comparable natural-merge sample needed for recovery acceptance; Nov 13 18:34 passive probe has 24 healthy rules/no new failures; one small merge/15,189 rows remains below comparable threshold (2180). No capacity retuning or public Grafana launch work. [Evidence](docs/decisions/0004-observability-capacity.md).

- [ ] STEERING 34: fixed keyword X search ON; semantic dropped, Grok/caps unchanged. Continue daily quality review: [Nov 13 saved-text review](docs/edition-reviews/2026-11-13-x-quality.md) (2163) finds eight of 16 picks in daily-search citations (all outside-list), missing official metrics throughout, overlapping Tech launch coverage and weak teasers. Gaming translation/repetition and Tech overlap fixes await natural acceptance; viral quality unaccepted. Do not infer engagement from missing official metrics.

- [ ] STEERING 27 grouping: verify same-event quality on later editions; Nov 5 Tech combined separate developments. Same-story production pass enabled, four-call bound $0.058192. No wording rules. [Review](docs/edition-reviews/2026-11-05.md).

- [ ] STEERING 7 speed: Nov 12 fifth-topic delay diagnosed; isolated staged scheduler demonstrates NBA repair admission risk. Failure draining/cycle controls pass offline; production unchanged. Protected ownership/handoff design follows NBA scheduled acceptance. Targets <60 seconds/current volume and <2 minutes/1,500 unmet. [Evidence](docs/edition-reviews/2026-11-12-social-latency.md).

- [ ] STEERING 16 / M4 Social posts: all-topic presence achieved; viral/outside-list quality remains open. Retain original post/media and official embeds; missing X metrics are unknown.

- [ ] STEERING 9/15 first-week report: Nov 2–8 $1.036785/28 calls/zero holds, 131 new verified candidates/115 outside-list. Novelty/viral-quality acceptance remains open; do not equate outside-list with viral.

- [ ] STEERING 18 Bluesky: collection/session refresh healthy. Repaired U.S. Congress query (2105) now reaches natural selection: Nov 13 511 read/10 shortlisted/two concrete published posts; restored presence accepted, overall quality open. Scheduled U.S. trace (2174): all 50 cached scores reconcile; three RFK candidates become one detailed pick, election adds a distinct event, leadership overlap is omitted; retain Congress query. Free four-query comparison (2181): Senate exposes a first-person leadership announcement but repeats selected X coverage; House repeats the election report/adds foreign-policy scope, broad US politics adds commentary. Retain `Congress`; production unchanged. [Selection evidence](docs/edition-reviews/2026-11-13-us-bluesky.md). [Scheduled review](docs/edition-reviews/2026-11-13.md). [Saved-pool/selection evidence](docs/edition-reviews/2026-11-12-bluesky-pool.md) retains weak World supply, Tech/Gaming overlap and U.S. 55-post reporting baseline. NBA saved-pool trace (2171): 593 observations/54 distinct posts, six of ten shortlisted posts overlap X-covered events; milestone pick fills an empty slot, no X displacement. Media trace (2172): zero safe attached-video posts; sole stored video is an NFT-tagged game chart, correctly excluded. Free four-query comparison (2173): NBA/#NBA/highlights/basketball yield 0/1/0/3 safe videos; broader supply includes off-topic/repeated material. Comparison complete; retain production query until gated trial. [Evidence](docs/edition-reviews/2026-11-13-nba-bluesky.md). World 12/6/6 baseline/Ukraine/Gaza discovery pilot is default-off and fully rehearsed offline (2149–2155): 120 daily searches, override/admission/failure/rollover contracts, scheduler configuration and read-only job export; retained 24 baseline passes have shared-retention limits. [Rollout contract and evidence](docs/plans/world-bluesky-discovery.md). Deployment/activation follows NBA/item 58/private public-mode gates; production query unchanged, no paid replay. Tech free four-query comparison (2177): baseline/product-name/demo queries expose commentary, ambiguous names and game promotions; none establishes a better standalone launch/demo query. Retain production query and semantic gates. [Evidence](docs/edition-reviews/2026-11-13-tech-bluesky.md). Gaming comparison (2178): gaming vocabulary adds commentary/old clips; title query repeats the already-selected beta update. Retain `game`. [Evidence](docs/edition-reviews/2026-11-13-gaming-bluesky.md).

- [ ] STEERING 28 incremental triage OFF: reserve-safe pools/cutoffs/draining verified; only 2/65 early fingerprints compatible. Waste/latency unmeasured. [Evidence](docs/edition-reviews/2026-11-05-incremental-admission.md).

- [ ] M5 grouping: independent labels, different dates and Gaming coverage still needed; agent-labelled windows are not general quality estimates.

- [ ] STEERING 4: fake/replay LlmPort and verification ledger implemented; real raw-response golden open. No paid replay or re-recording unchanged prompts. [Database verification](docs/DATABASE-VERIFICATION.md).

- [ ] STEERING 8 PARKED under 14: Reddit disabled/access denied; no requests without owner re-enabling official API credentials. YouTube deferred; no bypass.

- [ ] STEERING 10 source balance paused under 27: Yardbarker prepared/disabled; no new source without coverage review.

- [ ] STEERING 24/25 background: O1–O10 done except O8 unknown; O11 benchmark deferred. Stop CLI/dashboard refinements. Retain existing limits; Grafana capacity excluded from public launch. [Capacity](docs/decisions/0004-observability-capacity.md).

- [ ] Tech feed evidence depth (2185): live Ars RSS supplies 593–1,500 bounded body characters, but parser selects 52–101-character teasers for all 20 articles. Before noon UTC, prefer explicit feed content over descriptions with blank fallback; preserve the existing text cap and no-crawl rule. Recorded Ars fragment and offline metadata/body/cap/X-link safety checks prepared (2186); unchanged-fragment precedence assertions remain for implementation. Isolated storage-to-candidate enrichment, repeat-ingestion and blank-observation safety verified (2187). No production change after today’s cutoff. [Evidence and implementation](docs/edition-reviews/2026-11-13-tech-feed-depth.md).

- [ ] Gaming same-ceremony repetition (2131): editor v9 guidance verified offline; review natural selection for repeated Resident Evil awards across platforms. [Evidence](docs/edition-reviews/2026-11-12-social-awards.md).

- [ ] World link-list social quality (2132): editor v10 refuses inference from URL slugs alone; offline transport/selection verified. Review next natural picks. [Evidence](docs/edition-reviews/2026-11-12-social-link-list.md).

- [ ] Tech story/post repetition (2134, 2138): bounded selected-story context supplied to both social routes; offline saved overlap/model controls pass. Natural acceptance pending. [Evidence](docs/edition-reviews/2026-11-12-social-story-overlap.md).

- [ ] Gaming English context (2135, 2139): editor v11 translation guidance and Gaming calendar-date guard refuse saved invented launch date offline. Review natural notes. [Evidence](docs/edition-reviews/2026-11-12-social-translation.md).

## Completed and deferred

- [x] Truncated story continuation (2189): saved summaries ending in an ellipsis now offer an explicit source continuation link; text and generation unchanged. Nov 13 actual-edition desktop/mobile light/dark checks cover all truncated and complete stories.

- [x] Historical empty-post wording (2188): Nov 4 World section now says “No posts in this edition”; avoids an unsupported quality claim and calling saved history “today”. Actual saved-edition desktop/mobile light/dark checks pass; generation unchanged.

- [x] Saved X excerpt continuation (2184): three Nov 13 posts ending in ellipses now offer “Continue reading on X”; original saved text remains intact.

- [x] Missing reader summaries (2183): headline-only cards disclose “Summary unavailable” and offer a labelled source link; saved content and generation unchanged.

- [x] Reader empty-story wording (2182): saved World/U.S. sections now say “No stories in this edition” rather than claiming a quiet news day after failed triage. Actual saved-edition desktop/mobile light/dark checks pass; generation and snapshots unchanged.

- [x] STEERING 30/31 historical accounting reconciled (2175): 33 calls, $1.168639 settled + two $0.15 unknown Gaming holds = $1.468639 charged. Holds stay charged; reopen only with request-specific usage evidence. No further experiment authorized. [Evidence](docs/x-search-experiment.md#historical-accounting-reconciled--nov-13-iteration-2175).

- [x] NBA item 54 accepted Nov 11 (1824); Nov 12 recurrence remains open above.
- [x] Tech evidence depth: direct publisher cluster excerpts and bounded immutable snapshots verified offline through budgeted production editing (2130–2137); natural summary quality still needs scheduled review. [Evidence](docs/edition-reviews/2026-11-12-tech-depth.md).
- [x] Iteration 2144: compacted task handoff with all 23 open items preserved; scheduled review follows STEERING 59 proxy decision.
- Editorial audit closed under STEERING 5; reopen only for an actual unsupported saved summary. Message Batches, cross-process cache coordination, full articles and larger editor shortlists deferred.
