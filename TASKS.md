# Tasks

Fix failures first. STEERING overrides older notes. [Prior detail through 846](docs/progress-archive/2026-11-05-task-detail-847.md).

## Immediate owner priorities

- [ ] STEERING 39 NOW, ahead of UI: reliability/accounting shipped (903–909); Nov 5 keyword reruns complete (910), Gaming three posts, NBA/World tool failed again (2/3 failure), $0.048153 settled. Fair semantic preparation shipped (911); scorer review complete (912): Gaming 1/3 usable, no retained free-link overlap, $0.000337 verification. Next: Nov 6 round after 21:00 UTC. Scorer relevance ≥6/interestingness ≥4 counts as non-promotion; unknown likes unusable. $2.50 total/$1 UTC day caps; fixed search OFF, no further Nov 5 reruns. [Evidence](docs/edition-reviews/2026-11-05-x-experiment-review.md).
- [x] STEERING 41 (920): durable scheduled-edition BlueskyEditingFailed/BlueskyNoPicks alerts, aggregate-only DB access and firing/clearing/restart coverage shipped. Neither fires on real editions; first eligible scheduled edition is Nov 6.
- [ ] STEERING 40: purpose/topic diagnostics deployed (913); historical attribution, saved outcomes, inspector and call-scoped refusal reasons shipped (914–919). Per-post validation and saved drop counts shipped (921). Default-off reserved slot built (922), saved editor order verified; Nov 6 cost gate controls activation. Details and limits in STEERING; no collection/query/cap changes.
- [ ] STEERING 36 NOW: forty-article grouping pool live (872), ten-story editor cap unchanged; replay/cost evidence in [review](docs/edition-reviews/2026-11-05-world-story-pool.md). Review Nov 6 edition. Dedicated admin pages next; coverage cleanup done (873). X rounds due after 21:00 UTC.

- [x] Nov 5 full-AI acceptance and saved reader text (847): all sections AI, zero unscored; $0.315445/152.320 s. [Review](docs/edition-reviews/2026-11-05.md).

- [ ] STEERING 34 NOW: [X search plan](docs/x-search-plan.md); Grok 4.3/caps unchanged, fixed search OFF. Nov 5 revised round: 41 embed-verified candidates, zero retained-free overlap; four verification calls/$0.003782, Tech keyword two gate-passers; unknown likes unusable. Next Nov 6 fresh-window round after 21:00 UTC, then baseline/decision; earliest production Nov 7. No more round-1 analysis/model round. [Full evidence](docs/edition-reviews/2026-11-05-x-experiment-review.md).
- [ ] STEERING 30/31: experiment $2.50 total/$1 per UTC day, outside 13:00–16:00 UTC, $0.15 per-call reservation. Historical round 1 charged $0.532331 including unresolved Gaming timeout; Nov 5 revised round evidence now saved; no winner/activation. [Experiment](docs/x-search-experiment.md), [review](docs/edition-reviews/2026-11-04-x-experiment-review.md).
- [ ] STEERING 27 grouping: Nov 5 published multi-article groups had no clearly unrelated event; World broadest. Tech Moonshot/Hong Kong combined separate developments; editor v5 same-story instructions shipped (850), verify Nov 6. Raw responses/recall unverified; no wording grouping. [Review](docs/edition-reviews/2026-11-05.md).
  - Same-story production pass enabled (650) after sampled gate: labelled precision 141/141, recall 141/157, zero clearly unrelated/one borderline among 155 reviewed merges; no wording grouping rules. Four-call reservation bound $0.058192.
- [ ] STEERING 7 speed: Nov 5 152.320 s/756 candidates; <60 s/current volume and <2 min/1,500 unmet. Four-slot work-only bound 137.650 s, or 70.404 s without article triage. Social dependency timeline measured (970): Tech posts 55.895 s; final 8.804 s has at most one HTTP call, social scoring then Bluesky editing. Next: after Nov 6 slot decision, isolate Bluesky scoring from slot-dependent selection without speculative spend or changed admission protection. [Timeline](docs/edition-reviews/2026-11-05-social-latency.md); no paid trial. [Evidence](docs/edition-reviews/2026-11-04-concurrency.md).
- [ ] STEERING 16 / M4 Social posts: Nov 5 X picks Tech/NBA/Gaming/World 3/5/5/1; all four topics present, no Bluesky picks. Saved X metrics empty: viral/outside-list quality acceptance remains open. Paid old open-search picks 1/19 (Tech); no claim that all-topic presence proves paid discovery quality.
- [ ] STEERING 9/15 first-week report: Nov 5 $0.143191/19 fetched/18 new verified outside-list posts; prior Nov 3 $0.137056/18, Nov 4 $0.149447/19. Four topics weakest-first, $0.10 per-topic hold, unchanged $0.40/day/$12/month cap. Per-topic figures: [Sources](docs/SOURCES.md).
- [ ] STEERING 18 Bluesky: authenticated hourly collection and session refresh verified (788); Nov 5 no selected posts. Quality/diversity acceptance remains open; World phrase shortlist empty. Cross-platform context/semantic gates shipped. [Sources](docs/SOURCES.md#sustained-bluesky-session-recovery--iteration-788-2026-11-05).
- [ ] STEERING 33 UI rebuild: follow the five steps in the [approved spec](docs/ui-spec.md). Foundations, navigation, admin pages and topic/source controls shipped (875–899); reader archive shipped (900). Reader contents, mobile chips/sheet and compact story cards shipped (923); source rows/favicons shipped (924); date switching shipped (928); X saved-text links and redundant footer cleanup shipped (926); delete replaced screens as each lands. Prior implementation detail is in PROGRESS and its archive.
  - Next: finish post cards (responsive X width shipped in 930); archive recovery scripts now use rebuilt routes (failed-page 929; cached-refresh 932; delayed archive 933; invalid-data recovery also ported). Private rollout authorized by STEERING 36; forged-header proxy check is required before any future public access. [Access decision](docs/decisions/2026-11-05-admin-access.md).
- [ ] STEERING 28 incremental triage OFF: default-off runtime, shared admission, reserve-safe scoring, exact pools/cutoffs and sibling draining verified. Reassessed after full-AI acceptance (865): Nov 6 morning allowance $0.021736–$0.028915; only 2/65 early fingerprints compatible in post-publication pool. Keep OFF; do not reduce protection. Actual waste/latency unmeasured. [Assessment](docs/edition-reviews/2026-11-05-incremental-admission.md).

## Remaining milestones and lower priorities

- [ ] STEERING 37 LOW: off-VM R2 backups blocked on owner credentials/encryption recipient; do not build before settings arrive.

- [x] STEERING 32: private nightly backups, seven-day retention, weekly isolated restore and 26-hour alert deployed (709); fixed search runtime remains off pending decision. [Operations](docs/handbook/01-app/10-backups.md).
- [ ] M5: grouping quality above; independent labels, different dates and Gaming still needed. Agent-labelled windows are not general quality estimates.
- [ ] M6: topic CRUD/reorder/enable, source/schedule/budgets and on-demand UI connected; broader acceptance and admin separation open. Replay coverage through 846 in archived task detail.
- [ ] M7: durable on-demand job links survive Redis pruning/outages and isolated worker replacement (851–864); confirmed lost jobs report clearly without retrying generation. Predeployment lost jobs unrecoverable. DigestPublished log adapter live; no real notifications. Broader reliability acceptance open.
- [ ] STEERING 4: fake/replay LlmPort and verification ledger implemented; real raw-response golden open. Do not re-record unchanged prompts or pay merely to test replay. [Database verification](docs/DATABASE-VERIFICATION.md).
- [ ] STEERING 8 PARKED under 14: Reddit disabled/access denied; no requests until owner re-enables official API credentials. YouTube deferred; no bypass.
- [ ] STEERING 10 source balance paused under 27; Yardbarker prepared/disabled. No new source without coverage review.
- [ ] STEERING 24/25 background: [observability plan](docs/observability-plan.md), O1–O10 done except O8 unknown; stop CLI/dashboard refinements. O11 isolated memory benchmark deferred (548.72 MiB peak versus ~500 MiB target). Monitor limits.
- Editorial audit closed under STEERING 5; resume only for actual unsupported saved summary. Message Batches, cross-process cache coordination, full articles and larger editor shortlists deferred.

## Latest verified step

- [x] Original social developments (978): social editor v5 prefers firsthand announcements/demos/reporting over newsletter excerpts; concrete secondhand scoops remain eligible. Verify actual Nov 6 picks.

- [x] Publisher attribution (977): editor v8 preserves explicitly named reporting outlets and distinguishes The Hacker News from Hacker News; aggregator labels are not reporting attribution. Verify actual Nov 6 output.

- [x] Compact briefs (976): editor v7 requests a factual overview instead of copying the following story headlines; all 14 saved Nov 5 bullets were exact headline copies. Confirm Nov 6 output after publication.

- [x] Optional post context (975): social editor accepts an empty reader note for self-explanatory posts instead of requiring a paraphrase; translations remain useful context. Verify repetition in Nov 6 picks.

- [x] Concrete social news (974): social editor v3 favors supplied developments over teasers whose news is only in unseen media; concrete highlight stat lines remain eligible. Verify actual Gaming picks in Nov 6 edition.

- [x] Archive coverage periods (973): show saved start/end dates and local times so same-day editions with different windows are distinguishable; browser checks use real saved windows.

- [x] Thin-source summaries (972): editor v6 requests concise attributed news instead of commentary about supplied excerpts; factual validation stays intact. Verify actual wording in the Nov 6 edition.

- [x] Saved-edition selection replay (971): repair compact-date assertions and verify selected stories, posts and original links survive late latest-edition success/error on desktop/mobile light/dark.

- [x] Social latency cause (970): replayable allowlisted timeline identifies serialized social scoring/Bluesky editing at the end of the saved edition; no production or spend changes.

- [x] X media layout continuity (969): reserve the previous media height during theme/width replacements so the embed area does not collapse while loading.

- [x] Saved X disclosure focus (968): keep the disclosure visible through media reloads, preserving keyboard focus and the collapsed choice during theme changes.

- [x] X media retry focus (967): retry moves keyboard focus to the saved post link before removing the retry control, preserving the reader’s place.

- [x] X saved-text focus (966): media reloads keep the saved-text link mounted, preserving keyboard focus through rotation and system theme changes.

- Earlier reader steps through 965: [completed markers](docs/progress-archive/2026-11-06-reader-done-971.md).

- Next: STEERING 42 Nov 5 reader review completed; compare Nov 6 World breadth and post context after publication. STEERING 40 Nov 6 reserved-slot cost/AI gate and edition review after publication; fresh X round after 21:00 UTC. Fixed search stays off.
