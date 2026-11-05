# Tasks

Fix failures first. STEERING overrides older notes. [Prior detail through 846](docs/progress-archive/2026-11-05-task-detail-847.md).

## Immediate owner priorities

- [ ] STEERING 36 NOW: forty-article grouping pool activated (872), ten-story editor cap unchanged. Actual World replay: Nov 4 1→10 editor inputs / 1→5 reviewed labels; Nov 5 3→10 inputs / 2→7 labels; four verification calls $0.005837. All-topic scenario $0.464371 within reserve. Review Nov 6 edition. Next finish dedicated admin pages; coverage cleanup fixed in 873 (1.85 GB reclaimed). X rounds still due after 21:00 UTC.

- [x] STEERING 35: saved reader text restored without snapshot writes (738); Nov 5 NBA now has five AI stories with text, verified desktop/mobile light/dark (847). No fallback investigation needed for this run.
- [x] STEERING 13 / M3 scheduled full-AI acceptance (847): Nov 5 edition `7d99b279-cb6a-4cf0-b0a2-d94c5645f0b7`, all story/social sections AI, zero unscored; $0.315445/152.320 s, reserve released/zero holds. [Review](docs/edition-reviews/2026-11-05.md). Speed and editorial quality remain open below.

- [ ] STEERING 34 NOW: follow [X search plan](docs/x-search-plan.md). Query/runtime/experiment preparation migrated (720–725); Grok 4.3 and caps unchanged, production fixed search OFF. Scorer author/reported likes/media inputs shipped (848), cache-only probes aligned; missing counts/media remain unknown. **Next: two fresh-window test rounds.** Two fresh-window keyword + semantic test rounds after 21:00 UTC Nov 5/6, then same-day old-search baseline and decision. Earliest production edition Nov 7. No more round-1 analysis or model round; World reported separately.
- [ ] STEERING 30/31: experiment $2.50 total/$1 per UTC day, outside 13:00–16:00 UTC, $0.15 per-call reservation. Round 1 charged $0.532331 including unresolved Gaming timeout; no winner/activation. [Experiment](docs/x-search-experiment.md), [review](docs/edition-reviews/2026-11-04-x-experiment-review.md).
- [ ] STEERING 27 grouping: Nov 5 four calls admitted, $0.002103; four published multi-article groups reviewed, no clearly unrelated event observed. NBA groups 4/2/2 reports; World eight election results/reactions/consequences (broadest). Raw group responses/recall unverified. **Editorial evidence inspected (849):** both second sources are saved in `evidence`; Sony PS6 comments explicitly accompany the earnings release (resolved). Tech Moonshot/Hong Kong remains a separate-development editorial combination; editor v5 now instructs same-story composition (850); verify next scheduled edition, no wording-based grouping. [Review](docs/edition-reviews/2026-11-05.md).
  - Same-story production pass enabled (650) after sampled gate: labelled precision 141/141, recall 141/157, zero clearly unrelated/one borderline among 155 reviewed merges; no wording grouping rules. Four-call reservation bound $0.058192.
- [ ] STEERING 7 speed: Nov 5 152.320 s/756 candidates versus Nov 4 151.532 s; <60 s/current volume and <2 min/1,500 remain unmet. Provider-duration sum 550.600 s gives four-slot work-only lower bound 137.650 s. Async jobs, dedupe/progress, batching/caching/repair/sibling recovery live. Nov 5 comparison (867): triage 63.8% of HTTP work; even removing article triage leaves a 70.404 s four-slot bound. Measure social/editor dependencies offline; no paid trial. [Offline evidence](docs/edition-reviews/2026-11-04-concurrency.md).
- [ ] STEERING 16 / M4 Social posts: Nov 5 X picks Tech/NBA/Gaming/World 3/5/5/1; all four topics present, no Bluesky picks. Saved X metrics empty: viral/outside-list quality acceptance remains open. Paid old open-search picks 1/19 (Tech); no claim that all-topic presence proves paid discovery quality.
- [ ] STEERING 9/15 first-week report: Nov 5 $0.143191/19 fetched/18 new verified outside-list posts; World $0.032663/3, Gaming $0.038724/5, NBA $0.035104/5, Tech $0.036700/5. Prior Nov 3 $0.137056/18, Nov 4 $0.149447/19. Four topics weakest-first, $0.10 per-topic hold, unchanged $0.40/day/$12/month cap. [Sources](docs/SOURCES.md).
- [ ] STEERING 18 Bluesky: authenticated hourly collection and session refresh verified (788); Nov 5 no selected posts. Quality/diversity acceptance remains open; World phrase shortlist empty. Cross-platform context/semantic gates shipped. [Sources](docs/SOURCES.md#sustained-bluesky-session-recovery--iteration-788-2026-11-05).
- [ ] STEERING 33 UI rebuild: exactly [approved spec](docs/ui-spec.md), five steps in order. Foundations and step 2 admin gate complete: operational APIs moved, legacy routes removed, tools gated, scripts migrated. Reader makes no admin reads; shared navigation/Tools (875) and compact Overview (876) shipped; legacy controls load only when expanded at `/admin`. Schedule page shipped (878). Sources collection table shipped (877); topic links, window counts, enable/Add feed controls remain. Overview alert count and edition cost remain, then other dedicated management pages.
  - Next: step 3 dedicated admin pages with shadcn, then final reader. Private rollout authorized by STEERING 36; forged-header proxy check is required before any future public access. [Access decision](docs/decisions/2026-11-05-admin-access.md).
- [ ] STEERING 28 incremental triage OFF: default-off runtime, shared admission, reserve-safe scoring, exact pools/cutoffs and sibling draining verified. Reassessed after full-AI acceptance (865): Nov 6 morning allowance $0.021736–$0.028915; only 2/65 early fingerprints compatible in post-publication pool. Keep OFF; do not reduce protection. Actual waste/latency unmeasured. [Assessment](docs/edition-reviews/2026-11-05-incremental-admission.md).

## Remaining milestones and lower priorities

- [ ] STEERING 37 LOW: off-VM R2 backups blocked on owner credentials/encryption recipient; do not build before settings arrive.

- [x] STEERING 32: private nightly backups, seven-day retention, weekly isolated restore and 26-hour alert deployed (709); fixed search runtime remains off pending decision. [Operations](docs/handbook/01-app/10-backups.md).
- [ ] M5: grouping quality above; independent labels, different dates and Gaming still needed. Agent-labelled windows are not general quality estimates.
- [ ] M6: topic CRUD/reorder/enable, source/schedule/budgets and on-demand UI connected; broader acceptance and admin separation open. Replay coverage through 846 in archived task detail.
- [ ] M7: saved/failed on-demand links recover from Postgres through Redis pruning/outages and worker requeue (851–862); accepted jobs now retain durable IDs and report confirmed missing jobs clearly (863), without retrying generation. Older unfinished jobs already lost before this deployment cannot be reconstructed. DigestPublished log adapter shipped; no real notifications. A killed isolated worker recovers through a replacement and keeps the accepted link after pruning (864); broader reliability acceptance remains open.
- [ ] STEERING 4: fake/replay LlmPort and verification ledger implemented; real raw-response golden open. Do not re-record unchanged prompts or pay merely to test replay. [Database verification](docs/DATABASE-VERIFICATION.md).
- [ ] STEERING 8 PARKED under 14: Reddit disabled/access denied; no requests until owner re-enables official API credentials. YouTube deferred; no bypass.
- [ ] STEERING 10 source balance paused under 27; Yardbarker prepared/disabled. No new source without coverage review.
- [ ] STEERING 24/25 background: [observability plan](docs/observability-plan.md), O1–O10 done except O8 unknown; stop CLI/dashboard refinements. O11 isolated memory benchmark deferred (548.72 MiB peak versus ~500 MiB target). Monitor limits.
- Editorial audit closed under STEERING 5; resume only for actual unsupported saved summary. Message Batches, cross-process cache coordination, full articles and larger editor shortlists deferred.

## Latest verified step

- [x] Dedicated Schedule (878): protected page with next run and daily time/timezone/window/default-budget form; removed legacy duplicate; replayed save/failure and four viewport/theme checks.

- [x] Sources collection page (877): dedicated protected route, health/timestamps/errors/counts table, platform rows, four viewport/theme checks; replaced legacy source cards removed. Feed management/window counts remain open.

- [x] Compact Overview (876): health/spend cards, latest edition with story/post modes and duration, source issues and next runs; legacy controls lazy-load below it. Monitoring alerts link out; inline alert count and edition cost remain.

- [x] Admin shell + Tools (875): shared sidebar/mobile sheet, protected tool cards, old admin hero removed.

- [x] Admin gate rollout (874): operational APIs/tools protected together; reader/admin controls separated; local scripts use protected paths.

- Next: X fresh-window rounds after 21:00 UTC Nov 5/6; scheduled editor-v5 evidence Nov 6. UI step 3 dedicated admin pages next; proxy check required before future public access.
