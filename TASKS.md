# Tasks

Fix failures first. STEERING Current order wins. Complete pre-compaction detail and completed markers: [iteration 2300 archive](docs/progress-archive/2026-11-14-task-detail-2300.md).

## Next scheduled acceptance

- **Nov 20 breakage (3079):** published `9c810e64` has non-AI Tech/Gaming fallback; NBA/World/U.S. Sonnet pass. All eight retained attempts diagnosed offline; eight rejected fields pinned in regression fixtures; 3080 adds eight manual field repair controls passing the unchanged guard, with source qualifications retained (not model acceptance). [Incident](docs/editorial-fallback-2026-11-20.md). Fix prompt/repair behavior without weakening support checks, then finish the consolidated daily review with per-topic recall and miss causes; captured references remain `/tmp/3078-reference-stories.json`. No deploy before 16:00 UTC.

- Nov 19 review (2937): `7a747d9c`, five Sonnet story sections/25 stories/22 posts; NBA AI recovery and all public gates pass. Tech 5/5 selected evidence sets have text; U.S./World IDs disjoint. Missed audit closed partial under item 71; event recall unavailable; Tech Gemini occupies 5/10 slots. [Review](docs/edition-reviews/2026-11-19.md).

- Nov 17 scheduled public edition accepted (2632): `6216cb7a`, five AI story sections/25 stories/20 posts; World Haiku, others Sonnet, no unscored stories. World/U.S. coverage disjoint; NBA spoof absent. Tech four empty evidence sets; admission enabled for Nov 18. [Review](docs/edition-reviews/2026-11-17.md).
- Nov 18 review (2760): public delivery passes, Tech saved text 56/200 (28%) vs 29/200; selected evidence 5/5 vs 1/5. **NBA non-AI fallback fails editorial acceptance** after four absence-validation rejections. Offline diagnosis and NBA-only guidance deployed (2768–2769); next scheduled NBA acceptance. No paid replay or cap changes. [Review](docs/edition-reviews/2026-11-18.md). [Prior acceptance and completed detail](docs/progress-archive/2026-11-18-task-handoff-2680.md).

Full historical evidence: [2785 handoff](docs/progress-archive/2026-11-18-open-task-detail-2785.md).

## Open work

- [ ] STEERING 68/71: Nov 19 Missed audit closed **partial**; no further census, routing or evidence extensions. Saved census has 153 important article routes: 23 published memberships, eight admitted/unselected, one grouped/not admitted, one selected-evidence-only and 120 unresolved; these are not event recall. Preserve the [Nov 19 review](docs/edition-reviews/2026-11-19.md). Review Nov 20, 21 and 22 using saved grouping memberships; each daily review must give per-topic important-event recall and each miss's cause. After Nov 22, tally causes, fix the largest (tie: more distinct events), measure on saved pools, then deploy. No new reference tooling or paid replay. Waiting work follows items 69 and 70.

- [ ] STEERING 69: Nov 19 evaluation (2876) grows saved Nov 13 Tech labels 5→8; fallback recall 0/8, unchanged selection, two added events rejected by relevance and one outside top 20. See docs/RANKING.md. Nov 19 evaluation commit used; no tuning or paid replay. 2995 adds all 44 Nov 18 story/post slots and 37 manual topic-event labels: conservative subset retains all events in 40 slots; NBA largest share 33.33%→14.29%, U.S. 22.22%→12.50%, but Gaming rises 30%→33.33%. Reject simple deletion as sufficient; production unchanged. Nov 20 evaluation commit used. Nov 12–17 comparison and real-selector/material-fact acceptance remain open. [Joint comparison](docs/edition-reviews/2026-11-18-joint-event-comparison.md).
- [ ] STEERING 70: Developing stories stays inactive pending semantic and whole-edition budget acceptance. Selection → source-evidence matching → fixed-selection rewrite, atomic edition fallback and scoped budget admission are prepared and verified offline. Full-shortlist capacity fails (12/35 fit); original editorial evidence exists for nine/35 windows. [Detailed implementation/evidence through 3040](docs/progress-archive/2026-11-20-task-detail-3040.md). Continue acceptance without paid replay or cap changes; later reader features wait.

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
