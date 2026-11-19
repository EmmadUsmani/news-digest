# Tasks

Fix failures first. STEERING Current order wins. Complete pre-compaction detail and completed markers: [iteration 2300 archive](docs/progress-archive/2026-11-14-task-detail-2300.md).

## Next scheduled acceptance

- Nov 17 scheduled public edition accepted (2632): `6216cb7a`, five AI story sections/25 stories/20 posts; World Haiku, others Sonnet, no unscored stories. World/U.S. coverage disjoint; NBA spoof absent. Tech four empty evidence sets; admission enabled for Nov 18. [Review](docs/edition-reviews/2026-11-17.md).
- Nov 18 review (2760): public delivery passes, Tech saved text 56/200 (28%) vs 29/200; selected evidence 5/5 vs 1/5. **NBA non-AI fallback fails editorial acceptance** after four absence-validation rejections. Offline diagnosis and NBA-only guidance deployed (2768–2769); next scheduled NBA acceptance. No paid replay or cap changes. [Review](docs/edition-reviews/2026-11-18.md). [Prior acceptance and completed detail](docs/progress-archive/2026-11-18-task-handoff-2680.md).

Full historical evidence: [2785 handoff](docs/progress-archive/2026-11-18-open-task-detail-2785.md).

## Open work

- [ ] STEERING 68: reference lists selected for all five topics in docs/SOURCES.md; explicit free `scripts/capture-reference-stories.ts` captures dated evidence without DB/model calls (2875). Ten feeds pass live; early Nov 19 window capture `/tmp/2875-reference-stories.json` has 166 entries (not importance-labelled or event-deduplicated). Capture again after 15:00 publication, match with existing clustering/embeddings, and add Missed recall/causes within the daily review. Three reviews then one measured root-cause fix remain open.
- [ ] STEERING 69: Nov 19 evaluation (2876) grows saved Nov 13 Tech labels 5→8; fallback recall 0/8, unchanged selection, two added events rejected by relevance and one outside top 20. See docs/RANKING.md. Today’s one evaluation commit used; no tuning or paid replay. Joint story/post event-budget evaluation on saved Nov 12–18 editions remains open.
- [ ] STEERING 70: developing-story history, matching, editor/snapshot flow, DB links and reader presentation prepared but inactive. Full-shortlist capacity fails (12/35 fit), so retain selection → matching → fixed-selection rewrite; strict IDs/prose-only atomic fallback/current-evidence guard/input bounds and single-dispatch orchestration pass offline. Original bounded editorial evidence exists for nine/35 windows (45 selections). 2902 adds positive manual memberships with original evidence: Peltola result progression (two editions), Zelda repeated sales coverage (three; no new milestone). Exact offline rewrite capture passes; saved bounds total $0.038535, not whole-edition admission. **Next:** semantic model/rewrite review, combined whole-edition budget admission, activation and real-edition reader acceptance before the next feature. No provider calls so far. [Decision](docs/decisions/2026-11-19-developing-selection.md). [Evidence/history](docs/edition-reviews/2026-11-19-developing-stories.md). Follow docs/reader-features-plan.md order.

- [ ] STEERING 67 (2770): one-time three-day cause table/general description fallback/bounded backfill complete. Unsupported layouts largest non-block cause 25/74 (33.78%); saved Tech blanks 74/261 (28.35%) → 40/261 (15.33%), 34 exact verified updates. No further recovery work; next scheduled Tech section checked once in daily review. [Cause table/receipt](docs/edition-reviews/2026-11-18-tech-blank-causes.md).

- [ ] Destructoid access blocked (2601): official feed returns Cloudflare HTTP 403; collection paused, 304 observations retained. Resume only after documented publisher access is available; no bypass or replacement source. Other 37 active sources healthy.

- [x] STEERING 65 complete (2582): natural Nov 17 04:40 UTC retention succeeded; 55 expired sessions / 41,185,972 bytes deleted, tmpfiles completed, disk 63%, alerts clear. Nov 18 04:40 UTC also succeeded: 163 files / 89,331,829 bytes; next Nov 19 04:40 UTC. Supervisor log pruning remains lead-owned.

Details and original evidence links: [2455 handoff archive](docs/progress-archive/2026-11-16-task-detail-2455.md). Item order is unchanged.

- [x] STEERING 63/64 complete (2516): Nov 16 scheduled public HTTPS publication and signed-out desktop/mobile reader accepted; latest/direct/history agree. Deployment, `/db/`, handbook and direct admin page previously accepted. Public mode/sharing retained. [Review](docs/edition-reviews/2026-11-16.md#scheduled-public-acceptance--iteration-2516).

- [ ] BREAKAGE: Nov 18 NBA non-AI fallback fails editorial acceptance. Exact saved absence failures reproduced offline (2768); NBA-only guidance deployed (2769), guard unchanged. Next scheduled NBA acceptance; no paid replay or cap changes. [Review](docs/edition-reviews/2026-11-18.md).

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

- [x] 2786: Reader labels fallback story text “Source excerpt”; the five real Nov 18 NBA cards retain identical prose and source destinations. Edited summaries stay unlabelled; scheduled NBA editorial acceptance remains open.

- [x] 2785: Story editor receives representative publisher and article URL separately from cluster coverage labels, addressing the saved U.S. Peltola misattribution. Exact saved null-publisher and known-publisher controls pass both offline model routes; scheduled semantic acceptance pending.

- [x] 2784: Social editor treats clipped quotations/claims as incomplete evidence and marks request-shortened candidate text explicitly; two exact saved X texts and a long control pass offline Sonnet/Haiku transport checks. Full stored/display text retained; scheduled semantic acceptance pending.

- [x] 2783: Feed collection removes inline image-and-caption-only figures before excerpt truncation; recorded Yahoo NBA caption disappears and more reporting fits, with image/destination retained. Stored editions unchanged; scheduled NBA AI acceptance pending.

- [x] 2782: Reader fallback drops unfinished trailing sentences when substantial source text remains; exact saved Warriors/Hawks cases retain omission marks and original links. Saved evidence and AI summaries unchanged; NBA AI acceptance remains pending.

- [x] 2781: X bylines expose the verified embed’s account handle beside its display name, so the saved “PlayStation Support US” post visibly identifies `@PS_Support_US`. All 11 live saved X identities/profile destinations verified at 320/390/1440px in both themes; source authenticity remains unestablished.

- [x] 2780: saved Gaming WoW milestone repeats its selected story; selected-story comparison now reaches every topic, removing the topic whitelist in both social routes. Exact milestone/distinct nomination controls pass offline; scheduled selection acceptance pending.

[Earlier completed steps](docs/progress-archive/2026-11-18-completed-tasks-through-2778.md).
