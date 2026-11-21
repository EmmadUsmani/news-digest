# Tasks

Fix failures first. STEERING Current order wins. Complete pre-compaction detail and completed markers: [iteration 2300 archive](docs/progress-archive/2026-11-14-task-detail-2300.md).

## Next scheduled acceptance

- **Nov 21 recovery accepted (3300):** scheduled `61c32e18` publishes 25 AI-edited stories/15 posts; Tech/Gaming v16 Sonnet recovery passes, NBA/World Sonnet and U.S. Haiku pass; two U.S. Bluesky posts. [Daily review](docs/edition-reviews/2026-11-21.md) records per-topic event recall and every miss cause. Nov 20's immutable fallback edition remains unchanged. No deploy before 16:00 UTC.

- Nov 20 fallback (3079–3082): Tech/Gaming non-AI fallback diagnosed offline and all-topic v16 concise/complete-sentence guidance deployed. [Incident and subsequent recovery](docs/editorial-fallback-2026-11-20.md).

- Nov 19 review (2937): `7a747d9c`, five Sonnet story sections/25 stories/22 posts; NBA AI recovery and all public gates pass. Tech 5/5 selected evidence sets have text; U.S./World IDs disjoint. Missed audit closed partial under item 71; event recall unavailable; Tech Gemini occupies 5/10 slots. [Review](docs/edition-reviews/2026-11-19.md).

- Nov 17 scheduled public edition accepted (2632): `6216cb7a`, five AI story sections/25 stories/20 posts; World Haiku, others Sonnet, no unscored stories. World/U.S. coverage disjoint; NBA spoof absent. Tech four empty evidence sets; admission enabled for Nov 18. [Review](docs/edition-reviews/2026-11-17.md).
- Nov 18 review (2760): public delivery passes, Tech saved text 56/200 (28%) vs 29/200; selected evidence 5/5 vs 1/5. **NBA non-AI fallback fails editorial acceptance** after four absence-validation rejections. Offline diagnosis and NBA-only guidance deployed (2768–2769); next scheduled NBA acceptance. No paid replay or cap changes. [Review](docs/edition-reviews/2026-11-18.md). [Prior acceptance and completed detail](docs/progress-archive/2026-11-18-task-handoff-2680.md).

Full historical evidence: [2785 handoff](docs/progress-archive/2026-11-18-open-task-detail-2785.md).

## Open work

- [ ] STEERING 72/73: paid matching acceptance passes (3348), eight calls/$0.009843; seven current stories/twelve predecessor occurrences, every model pair in STEERING ack. Budget accepted by item 73 at $0.613774/$0.65; do not rerun preflight or paid matching. Cached responses retained under run `developing-acceptance-3348`. 3349 connects scheduled enrichment after normal selection using shared budget/cache and original editor evidence; refusal preserves the edition. Deployed outside 13:00–16:00; real Nov 22 edition/links/prose/screenshots acceptance remains. Item 69 step 2 event-budget implementation is also authorized without the labels-only daily commit limit.

- [ ] STEERING 68/71: Nov 19 Missed audit closed **partial**; no further census, routing or evidence extensions. Saved census has 153 important article routes: 23 published memberships, eight admitted/unselected, one grouped/not admitted, one selected-evidence-only and 120 unresolved; these are not event recall. Preserve the [Nov 19 review](docs/edition-reviews/2026-11-19.md). Nov 20 review complete (3083): event recall Tech 3/13, NBA 6/13, Gaming 5/11, World 5/10, U.S. 3/15; 40 misses = 22 not shortlisted, ten final-selection losses, eight collection gaps. [Daily review](docs/edition-reviews/2026-11-20.md). Nov 21 review complete (3300): event recall Tech 3/13, NBA 4/11, Gaming 3/6, World 2/11, U.S. 1/12; 40 misses = 24 not shortlisted, seven final-selection losses, nine collection gaps. [Daily review](docs/edition-reviews/2026-11-21.md). Review Nov 22 using saved memberships, with per-topic recall and each miss's cause. After Nov 22, tally causes, fix the largest (tie: more distinct events), measure on saved pools, then deploy. No new reference tooling or paid replay. Waiting work follows items 69 and 70.

- [ ] STEERING 69: Nov 19 evaluation (2876) grows saved Nov 13 Tech labels 5→8; fallback recall 0/8, unchanged selection, two added events rejected by relevance and one outside top 20. See docs/RANKING.md. Nov 19 evaluation commit used; no tuning or paid replay. 2995 adds all 44 Nov 18 story/post slots and 37 manual topic-event labels: conservative subset retains all events in 40 slots; NBA largest share 33.33%→14.29%, U.S. 22.22%→12.50%, but Gaming rises 30%→33.33%. Reject simple deletion as sufficient; production unchanged. Nov 20 evaluation commit used. 3166 adds all 45 Nov 17 slots and 44 provisional events (43 if unresolved NBA game pair joins); all retained, macOS post adds interface facts, so blanket deletion rejected. Nov 21 evaluation commit used. 3350 exhaustively searches 168 Nov 17–18 post subsets (15 fact/event-preserving): only Nov 18 NBA/U.S. can improve; Gaming cannot beat 30% by deletion. Deletion-only implementation rejected. 3351 adds a bounded replacement planner, preserving existing events and event-scoped material facts; it matches the Nov 17–18 exhaustive oracle and passes replacement regressions. 3352 adds an evidence-bound selection bridge: complete annotations must quote the exact current story/post text; invalid reviews retain original objects/order. Existing ten Nov 17–18 comparisons traverse the bridge. 3353 adds opt-in same-call editor event/fact annotations with exact bounded-text validation and cache-safe refusal; no additional call or scheduled behavior change. 3354 adds same-call independent replacement qualification and a fact/event-preserving preview; invalid qualification preserves original picks without retry. 3355 refuses previews when baseline post/story text was shortened, retaining upstream truncation metadata and rechecking it on cache reads. 3356 also refuses qualified replacements whose text was shortened, preserving original picks without retry; exact 1,200-character replacement text remains eligible. 3357 replays all ten Nov 17–18 topic-editions through actual editor validation/cache using existing labels and scripted responses: four shortened-evidence refusals, zero share improvements, all events/facts retained. Reject the bounded published-picks-only preview as a deployment candidate; planner gains are not editor results. Scheduled behavior unchanged. 3358 adds opt-in complete story summaries (1,200-character bound); ten fresh/cache replays now refuse none, retaining all events/facts. Nov 18 NBA 33.33%→14.29%, U.S. 22.22%→12.50%; eight other topic-editions unchanged. Scheduled inputs remain unchanged. 3359 adds an opt-in preview through the real X/Reddit selector: shared shortlist/gates, single outcome call, full snapshot metadata and X-preference refusal; ordinary picks unchanged. 3360 adds opt-in Bluesky shortlist/editor preview with full observation mapping and refusal when prior platform picks lack review IDs; scheduled selection unchanged. 3361 adds a single cross-platform editor preview for already-qualified X/Reddit/Bluesky shortlists, with shared event IDs, snapshot preservation and X-preference refusal; real-editor scripted/cache coverage passes. 3362 replays all ten saved Nov 17–18 topic-editions through the joint platform helper with scripted editor/cache responses and saved identities/prose: zero refusals; NBA/U.S. Nov 18 gains survive platform preference, all events/facts retained; other snapshot fields are explicit placeholders. 3363 connects normal X/Reddit triage and safe Bluesky shortlisting to a single bounded joint review, carrying observation/engagement evidence and original snapshots without independent platform editor calls. Offline qualification integration passes; scheduled callers remain unchanged. 3364 supplies saved Reddit score/comment/upvote-ratio/observation evidence to joint qualification; zero metrics preserved, no inferred growth/media. 3365 searches event/fact-preserving alternatives within the existing X reservation, so an infeasible unconstrained optimum no longer hides a feasible improvement; fresh/cache regression passes. Not wired to production: semantic candidate annotations, Nov 12–16 comparison and saved real-pool/material-fact acceptance remain open. [Joint comparison](docs/edition-reviews/2026-11-18-joint-event-comparison.md).
- [ ] STEERING 70: Why this accepted live (3174), Nov 20 edition `9c810e64`: saved editor rationale in collapsed story/post disclosures; 390/1440 light/dark screenshots and keyboard checks pass. No AI calls/backfill; public scores and operational reasons remain omitted. Developing acceptance incomplete under item 72. Week in review input selection implemented (3175): seven-day published daily snapshots, latest regeneration per coverage window, saved stories/posts with edition provenance. Weekly editor evidence/output contract added (3176): at most five summaries, saved daily provenance, atomic unknown/reused-reference rejection. Budgeted single-attempt editor execution added (3177), with existing ledger/cache and no repair/fallback; production trigger remains unconnected. PostgreSQL input loading added (3178), with publication/profile/window filtering and saved regeneration selection. Publication workflow added (3179): Sunday daily prerequisite, quiet-topic skip, all-topic atomic save contract and generation-key retry/regeneration behavior. PostgreSQL publication storage added (3180): separate immutable weekly table, concurrent retry keys and Sunday published-daily prerequisite. Production generation entry point connected (3181): lazy shared budgeted editor, saved-input loading and atomic publication; no automatic calls. Weekly storage history/ID lookup added (3182): explicit profile scope, bounded pagination and stable newest-first ordering preserve regeneration versions. Public weekly history/detail API added (3183): null-profile reads, bounded offsets, saved daily coverage links and strict public projection; no scheduled calls. Weekly reader UI added (3184): linked history, immutable detail summaries, daily coverage links, quiet topics and empty/error states; live weekly history still empty. Scheduled admission added (3185): exact Sunday UTC slots, six-hour recovery bound, stable public retry keys and retryable prerequisite/editor refusal. Queue registration/worker lifecycle connected (3186): shared single-concurrency digest queue, Sunday 17:00 UTC, three bounded retries, lazy editor and draining storage shutdown. First scheduled weekly publication awaits acceptance; Nov 21/22 reviews still first.

- [x] STEERING 67 (2770, accepted 2937): one-time three-day cause table/general description fallback/bounded backfill complete. Unsupported layouts largest non-block cause 25/74 (33.78%); saved Tech blanks 74/261 (28.35%) → 40/261 (15.33%), 34 exact verified updates. No further recovery work; Nov 19 daily review confirms 5/5 selected evidence sets and 9/9 excerpts have text. [Cause table/receipt](docs/edition-reviews/2026-11-18-tech-blank-causes.md).

- [ ] Destructoid access blocked (2601): official feed returns Cloudflare HTTP 403; collection paused, 304 observations retained. Resume only after documented publisher access is available; no bypass or replacement source. Other 37 active sources healthy.

- [x] STEERING 65 complete (2582): natural Nov 17 04:40 UTC retention succeeded; 55 expired sessions / 41,185,972 bytes deleted, tmpfiles completed, disk 63%, alerts clear. Nov 18 04:40 UTC also succeeded: 163 files / 89,331,829 bytes; next Nov 19 04:40 UTC. Supervisor log pruning remains lead-owned.

Details and original evidence links: [2455 handoff archive](docs/progress-archive/2026-11-16-task-detail-2455.md). Item order is unchanged.

- [x] STEERING 63/64 complete (2516): Nov 16 scheduled public HTTPS publication and signed-out desktop/mobile reader accepted; latest/direct/history agree. Deployment, `/db/`, handbook and direct admin page previously accepted. Public mode/sharing retained. [Review](docs/edition-reviews/2026-11-16.md#scheduled-public-acceptance--iteration-2516).

- [x] NBA non-AI fallback recovered (2937): Nov 19 Sonnet story section and saved-evidence review pass; no guard/cap change or paid replay. [Review](docs/edition-reviews/2026-11-19.md).

- [ ] Morning admission: bounded Sonnet settlement deployed; caps unchanged; Nov 16 all-five-topic Sonnet admission passes (2516); 2517 settlement $0.500315/56 successful calls, zero holds; Nov 17 worker 247.524 s still misses speed target (2633). [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-3).

- [ ] STEERING 56/57: Nov 15 World/U.S. scope/event review passes (2412), IDs disjoint. Nov 16 World AI recovery and disjoint selected/coverage IDs accepted (2516); three consecutive successful scheduled editions remain open. [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-4).

- [ ] Metrics-store: CPU 2% / MemoryHigh 88 MiB / MemoryMax 112 MiB; item 66 permits checks only on alerts, restart or memory above max.

- [ ] STEERING 34: keyword X ON, semantic OFF. Nov 15 World: 13 scored/four qualifying/three selected, no stronger scored alternative; verified metrics unknown. NBA no Murray repetition; Nov 16 selected spoof-source absence accepted (2516). [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-6).

- [ ] STEERING 27 grouping: Nov 17 multi-report review (2677): seven supported/five scope or provenance unresolved; older Helix/Nvidia edges unresolved. Production unchanged, no paid replay. [Review](docs/edition-reviews/2026-11-17-grouping.md).

- [ ] STEERING 7 speed: targets unmet; bounded waiting protects NBA repair but refuses U.S. admission. Retain production; stop synthetic expansion, await scheduled evidence. [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-8).

- [ ] STEERING 16 / M4 Social posts: Nov 16 Gaming one X/U.S. zero despite qualifying pools; weak stored texts explain sparse selection. Nov 17 Gaming four X/one Bluesky and U.S. one X/two Bluesky (2632). 2667 reviews all ten U.S. X texts/four qualifiers: omitted qualifiers lack standalone reporting detail; retain gates, overall quality open. [Detail](docs/progress-archive/2026-11-16-task-detail-2541.md#open-work).

- [ ] STEERING 9/15: Nov 9–15 X $2.100622, 32/32 keyword calls, 312 new verified candidates/305 outside-list, 50 selection matches/44 outside-list. Quality open. [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-10).

- [ ] STEERING 18 Bluesky: Nov 17 UTC-day collection and all top-five texts reviewed (2674); retain queries/gates. Nov 18 eight picks reviewed (2772): NBA Lakers-game repetition; exact comparison complete (2773), shared v12 guidance deployed (2774). Scheduled semantic acceptance pending. [Selection](docs/edition-reviews/2026-11-18-bluesky-selection.md). [Comparison](docs/edition-reviews/2026-11-18-nba-event-comparison.md).

- [ ] STEERING 28 incremental triage OFF: reserve-safe pools/cutoffs/draining verified; only 2/65 early fingerprints compatible. [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-12).

- [ ] M5 grouping: 2779 adds ten Nov 18 NBA injury reports with all 45 pairs labeled: Brown four/McCollum six retained, 24 cross-event merges rejected; published membership passes 34 sampled orders. Agent labels only; independent/semantic evaluation remains open. [Evidence](docs/edition-reviews/2026-11-18-nba-injury-grouping.md). 2678 adds Nov 17 shared Sensor Tower estimate positive control (three pairs/six orders), contrasting Nov 16 separate forecasts. published Nov 16 GTA pair is an offline negative case (2539); merged membership fails/separate control passes. 2556 extends the Helix control to affordability/neural rendering; all ten five-article pairs labeled, correct split/merge passes all 120 orders. 2554 adds Nvidia comeback/fallout positive and separate chip-policy negatives; all three pairs/six orders pass supported membership. Independent labels and semantic evaluation open. [Detail](docs/progress-archive/2026-11-16-task-detail-2541.md#open-work).

- [ ] STEERING 4: fake/replay LlmPort/ledger and saved NBA repair publication transport pass. No live tests or paid replay. [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-14).

- [ ] STEERING 8 PARKED under 14: Reddit disabled/access denied; no requests until owner re-enables official API credentials. YouTube deferred; no bypass. [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-15).

- [ ] STEERING 10 paused under 27: Yardbarker NBA live; article-page X harvesting prepared/disabled (2301). No new source without coverage review. [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-16).

- [ ] STEERING 24/25: O1–O10 done except O8 unknown; O11 deferred. Stop CLI/dashboard refinements; retain limits. Grafana capacity excluded from public launch. [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-17).

- [x] Tech depth / STEERING 66 natural acceptance (2760): Nov 18 prospective text 56/200 vs 29/200; selected evidence 5/5 vs 1/5, materially deeper summaries. Admission enabled; no cap increases or 13:00–16:00 deployment. STEERING 67 closes further recovery work. [Review](docs/edition-reviews/2026-11-18.md).

- [ ] Gaming same-ceremony repetition: v9 deployed; Nov 14 separate developments leave winning-work/ceremony duplicate challenge unexercised. [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-19).

- [ ] World link-list quality: v10 deployed; Nov 14 attributed RAF reporting passes. Bare links rejected in triage; final-editor rejection challenge open. [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-20).

- [ ] Tech story/post repetition: bounded context deployed in both social routes. Nov 14 four stories/two X picks cover six events; Bluesky/editor duplicate challenge unexercised. [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-21).

- [ ] Gaming English context: v11/date guard deployed. Nov 14 source-bound English notes; translation/date challenge unexercised, natural absence-rationale repair succeeded. [Detail](docs/progress-archive/2026-11-16-task-detail-2455.md#open-item-22).

## Latest completed steps

- [x] 3187: Read-only weekly publication acceptance command checks signed-out history/detail, seven-day Sunday bounds, saved story/post membership, coverage reuse and daily latest isolation. Three offline regressions pass; live Nov 22 cutoff correctly pending. First real weekly acceptance remains due Sunday.

- [x] 3184: Weekly reader history/detail UI with “Week in review” labels, daily coverage links, quiet topics and empty/error states. Live empty history and synthetic detail browser checks; scheduling remains unfinished.

- [x] 3181: Connected PostgreSQL weekly generation to the shared budgeted Sonnet editor; prerequisites, quiet topics and retries avoid provider construction. Real saved-input/storage integration with fake provider passes; history and scheduling remain unconnected.

- [x] 3180: Durable weekly publication adapter with separate immutable PostgreSQL snapshots, concurrent generation-key retries, regeneration and Sunday daily prerequisite. Production wiring/history/scheduling remain unconnected.

- [x] 3179: Weekly publication workflow connects saved inputs/editor to an atomic storage port; waits for Sunday daily, aborts partial failures, skips quiet calls and separates retry keys from regeneration. Database adapter and production trigger remain unconnected.

- [x] 3178: PostgreSQL weekly input loading with profile/publication/coverage filtering, Sunday daily inclusion and saved regeneration selection; isolated database regression covers exclusions and immutability. Weekly generation/storage remain unconnected.

- [x] 3177: Weekly editor execution through existing budget ledger/cache; single Sonnet attempt, daily provenance validation on cache hits, no repair/fallback or paid replay. Production trigger/storage remain unconnected.

- [x] 3176: Week in review editor evidence and output validation; cross-day story/post provenance, five-story limit and atomic rejection of invented/reused/post-only coverage. Production execution remains unconnected.

- [x] 3175: Week in review published-daily input selector; seven-day UTC bounds, Sunday daily included, regeneration dedupe, profile/publication isolation and immutable saved selections. Not scheduled or reader-visible yet.

- [x] 3174: Shipped Why this for real published stories/posts; preserved private scores/reasons and immutable snapshots. One-time developing gate recorded; no further historical controls.

- [x] 3173: Combined all three source-reviewed Nov 18 World rewrites; five selections and history metadata retained, unsupported claim in any rewrite restores the entire original selection. Shared manual fixture; model/whole-edition budget acceptance open, production inactive.

- [x] 3172: Source-reviewed Nov 18 Crimea bridge rewrite leads with operation preparation/weapons details and retains all five World selections. Combined World/model/budget acceptance open; production inactive.

- [x] 3171: Source-reviewed manual summit greeting rewrite uses current title/excerpt, omits inherited agenda hopes and outcomes, and retains all five World selections. Combined World/model/budget acceptance remains open; production inactive.

- [x] 3170: Source-reviewed manual E1 contract-delay rewrite retains diplomatic causal denial and caretaker-government objection; unchanged guard and five-selection contract pass. Combined World/model/budget acceptance remains open; production inactive.

- [x] 3169: Nov 18 World matching review adds summit, three-edition bridge and sanctions/contract-delay continuations plus Gaza nonmatch; Iran analysis unresolved. E1 causal denial retained in review; offline controls/snapshots pass, production inactive.

- [x] 3168: Source-reviewed manual Kerch second-day rewrite traverses the current-evidence guard and fixed-selection contract; five IDs/order and four unchanged stories retained. Model/budget acceptance open; production inactive.

- [x] 3167: Nov 17 World developing reference adds second-day Kerch continuity and three explicit nonmatches; peace-talk continuity unresolved. Offline false-link/missing-link checks pass; production inactive.

- [x] 3084: Complete Nov 15 Tech matching labels: Huang recap links Nov 14/12/10 leadership coverage; no new development established. Missing/partial/chip-category controls fail; production inactive.

- [x] 3055: Nov 15 Tech adds two explicit nonmatches; four security/chip false-link challenges fail while the IPO control passes. Huang recap unreviewed; production inactive.

- [x] 3054: Nov 17 Tech review adds four explicit nonmatches; removed unsupported chip-policy negative from active labels, leaving continuity unresolved. Offline category-link challenges pass; production inactive.

- [x] 3053: Reviewed GTA prose passes bounded support but cannot omit Zelda; saved U.S.-first Peltola success followed by Gaming refusal restores all ten selections. Manual responses only; production inactive.

- [x] 3052: Partial Nov 16 Tech developing review adds three event nonmatches alongside Huang continuation; false security/agent category links fail. Chip-rule relationship unresolved; production inactive.

- [x] 3051: Source-bound manual GTA rewrite accepted with claim-by-claim support; launch, stock movement and inherited data-provider claims omitted. Combined Gaming still refuses because Zelda has no new development; model/budget acceptance remains open.

- [x] 3050: Partial NBA developing reference adds Brown/McCollum-Newell injury nonmatches alongside LeBron milestone match. False shared-player/team links fail; Spurs/Warriors remain unresolved without source evidence. Production inactive.

- [x] 3049: Reviewed every Nov 18 Tech selection against 32 earlier stories; five explicit nonmatches now feed existing replay/snapshot checks. False Google-study link rejected; original evidence absent, so rewrite/model acceptance remains open.

- [x] 3048: Saved snapshot/JSON contract checks now cover every reviewed U.S./Gaming selection with simultaneous GTA/Zelda memberships and explicit nonmatches; all IDs/order and independent link copies preserved. Manual controls only; semantic/budget acceptance remains open.

- [x] 3047: Saved end-to-end developing capture now includes both reviewed Gaming continuations (GTA and Zelda), checks every linked rewrite input and exercises complete three-link admission/atomic refusal. Scripted transport only; semantic/budget acceptance remains open.

- [x] 3046: Existing developing matching evaluator checks all ten reviewed U.S./Gaming selections, including explicit nonmatches; missed GTA and false links fail despite a passing legacy Zelda control. Manual partitions only; semantic/rewrite/budget acceptance remains open.

- [x] 3045: Reviewed all five saved Nov 18 Gaming developing-story selections against seven history snapshots: GTA pre-order update, Zelda repeat requiring refusal, three nonmatches. [Semantic reference](docs/edition-reviews/2026-11-20-developing-semantic-reference.md); combined Gaming request remains unacceptable.

- [x] 3044: Reviewed all five saved Nov 18 U.S. developing-story selections against six available history snapshots: one supported Peltola update, four explicit nonmatches. [Semantic reference](docs/edition-reviews/2026-11-20-developing-semantic-reference.md); model/budget acceptance remains open.

- [x] 3043: Inactive developing-edition preflight rejects blank or duplicate story IDs within a historical snapshot before any topic dispatch; recurring IDs across editions/topics remain supported.

- [x] 3042: Inactive developing-edition admission rejects conflicting publication times for the same historical edition across topics; equivalent timezone representations and distinct editions remain supported.

- [x] 3041: Inactive developing-edition admission refuses unordered, duplicate, blank or over-seven-edition history before dispatch; accepted chronological histories retain support.

[Completed implementation history through 3040](docs/progress-archive/2026-11-20-task-detail-3040.md).
