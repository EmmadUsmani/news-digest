# Tasks

Fix failures first. STEERING overrides older notes. [Prior detail through 846](docs/progress-archive/2026-11-05-task-detail-847.md).

## Immediate owner priorities

- [ ] STEERING 36 NOW: group a larger evidence-sized scored pool before selecting 10 stories; replay Nov 5 and Nov 4 World without paid calls, report distinct-story counts and grouping/editor cost within cap/reserve. Deploy before Nov 6 13:00 UTC or defer one day. Then finish UI step 2 and build spec pages; fix coverage-directory cleanup at its source. X rounds still run when due.

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
- [ ] STEERING 33 UI rebuild: after X work; exactly [approved spec](docs/ui-spec.md), five steps in order. TanStack Router/Query, Tailwind v4/shadcn, self-hosted Inter/themes live. Step 2 deny-by-default gate, uncached identity/protected aliases/sanitized reader endpoints prepared; legacy operational routes still need migration; STEERING 36 confirms owner identity is configured.
  - Next: switch UI/scripts and remove legacy routes while gating tools together. Owner authorizes private-VM rollout now; proxy checks apply before future public access. Local denial/cache/method/forwarded-token checks pass. [Access decision](docs/decisions/2026-11-05-admin-access.md).
  - Reader/history/text/themes/recovery and operational replays verified desktop/mobile light/dark with browser writes blocked or replayed and protected snapshots unchanged; screenshots in `docs/screenshots/ui/`.
- [ ] STEERING 28 incremental triage OFF: default-off runtime, shared admission, reserve-safe scoring, exact pools/cutoffs and sibling draining verified. Reassessed after full-AI acceptance (865): Nov 6 morning allowance $0.021736–$0.028915; only 2/65 early fingerprints compatible in post-publication pool. Keep OFF; do not reduce protection. Actual waste/latency unmeasured. [Assessment](docs/edition-reviews/2026-11-05-incremental-admission.md).

## Remaining milestones and lower priorities

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

- [x] Actual World cache probe (870): read-only production-fingerprint lookup for Nov 4/5 ten/forty pools yields four misses; no model story counts claimed. Next: all-topic budget/reserve gate, then bounded ledgered Haiku verification under STEERING 4; do not repeat cache probes.

- [x] Bounded grouping path prepared (869): explicit forty-article selection and wrapper, ten-story editor ceiling; saved reviewed-label replay passes through production helpers. Publication retains ten articles until actual grouping and all-topic budget gate pass.

- [x] World story-pool evidence (868): offline reviewed-label replay supports forty articles before grouping: Nov 5 2→13 stories (ten editor inputs), Nov 4 1→7. Production unchanged; actual model replay/all-topic budget gate and fix remain next. [Evidence](docs/edition-reviews/2026-11-05-world-story-pool.md).

- [x] Scheduled speed comparison (867): retained Nov 5 allowlisted call-usage fixture; measured purpose spans and remaining article-free latency bound, no runtime changes.

- [x] X round preflight (866): reject invalid 24-hour windows, premature starts and duplicate/blank topics before reservations or provider requests; mocked subprocess coverage.

- [x] Incremental admission reassessed (865): measured reserve and same-window turnover support keeping background triage OFF; no paid calls or settings changes.
- Next: X fresh-window rounds after 21:00 UTC Nov 5/6; scheduled editor-v5 evidence Nov 6. Admin identity/proxy rollout and broader job reliability acceptance remain open.
