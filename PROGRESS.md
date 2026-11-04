## 2026-11-03: iteration 479 — add NBA syndication coverage

- Started clean on main; no leftovers. Zero alerts; priority provider/social evidence still awaits Nov 4. Grouping stays parked. No paid calls, new editions or Reddit requests.
- Item 10 baseline articles/healthy sources: Tech 327/6, NBA 156/6, Gaming 280/18, World 224/5. Added Yardbarker NBA numeric public RSS via migration 053 without recreating a deleted topic.
- Feed returned 20 dated NBA entries; normal worker stored all 20 at 20:46:53 UTC without error. NBA rolling-day coverage reached 166 articles/seven healthy sources; all 36 sources healthy. Syndication/commentary is not independent reporting.
- Two recorded entries pin bylines, EST-to-UTC dates, excerpts, media links and no invented X citations. Tests never use live HTTP. Documented rejected candidates: NBA/SI 404, TalkBasket 403, Sporting News malformed links, named Yardbarker path stale/off-topic. No bypass.
- Updated SOURCES, TASKS and affected handbook prose; no diagrams, tables/relationships or UI changed.
- Verification: two targeted fixture tests; pnpm check passed (263 unit/180 isolated integration, typecheck/lint/format/boundaries); pnpm build, handbook check (17 pages/14 unchanged diagrams/25 assigned tables), pnpm format, pnpm lint:fix and git diff --check passed. Zero dangling volumes.
- Migration applied and worker restarted for source configuration. API/worker/docs/schema active; pnpm obs health --check passed, root HTTP 200. No further restart under STEERING 22: running application code unchanged.
- Next: Nov 4 scheduled latency/NBA fallback, open-X and Bluesky selections/screenshots; avoid extra paid verification.

## 2026-11-03: iteration 480 — harvest NBA team and highlight X citations

- Started clean on main; no leftovers. Zero alerts and healthy services. Nov 4 latency/NBA fallback and social selection evidence remain pending; grouping stays parked.
- Enabled free exact-host Yardbarker NBA article discovery through migration 054, using existing eight-page hourly rotation, host validation and one-day failure cooldown. No new feed, recursive crawl, paid calls, editions or Reddit requests.
- Public Westbrook article returned 200 with OKC team and Swish Cultures clip embeds. Recorded unmodified embed fragments; offline test pins canonical IDs/named verification URLs. Initial assertion expected x.com; corrected it to the adapter's existing twitter.com normalization.
- Applied migration. Normal bounded pass checked eight pages/two Yardbarker, zero links/errors. Explicit one-page collection of the stored researched article persisted two real citations at 20:54:25 UTC, zero errors. Citations are not verified posts, virality or edition selections.
- Basketball Insiders article returned 200 but no X links; discovery left off. NBA remains weakest for articles (166), World weakest for verified X (zero); no extra paid discovery.
- Updated SOURCES/TASKS and affected handbook; archived iterations 465–466 to keep PROGRESS bounded. No table/relationship, diagram or UI change.
- Verification: targeted fixture test, pnpm format, pnpm lint:fix, pnpm check (263 unit/181 isolated integration), pnpm build, filtered handbook check (17 pages/one unchanged diagram/25 assigned tables) and git diff --check passed; zero dangling volumes.
- API/worker/docs/schema active; pnpm obs health --check passed, root HTTP 200, zero alerts. No restart under STEERING 22: application code unchanged; publisher host configuration is read each pass.
- Push rejected by concurrent owner commit 09c9fa0 (STEERING 27); merged without rewriting history. Owner freezes new sources/features until Nov 4 evidence. Migration 055 disables the just-added Yardbarker host; existing feed and real citations remain. Fixture remains prepared; live host confirmed null, repeated pnpm check passed (263 unit/181 integration), handbook rechecked.
- Next under item 27: offline World social/NBA fallback fixes, tighter triage prefilter, then restore/relabel same-story AI grouping; production grouping stays off until Nov 4 evidence and conditional Nov 5 activation.

## 2026-11-03: iteration 481 — skip hard exclusions before article triage

- Started clean on main; zero alerts, services and healthz healthy. No leftovers, paid calls, new editions, source changes, Reddit requests or grouping activation.
- Item 27 offline step: article triage now skips existing quality-rule rejections and explicit excluded topic phrases, matching final-shortlist gates. Missing include phrases still reach semantic triage; no arbitrary top-N cutoff.
- Recorded Nov 1 NBA fixture admits 43/52 articles (nine unnecessary scores avoided). This is offline workload evidence, not measured live speed/cost improvement.
- Regression pins skipped inputs, semantic recovery, AI publication, original candidate totals/quality omissions and complete admitted coverage. Synthetic golden now omits the skipped betting score; selected stories unchanged.
- First direct test invocation correctly refused without isolated services; first full check found stale synthetic golden response (181/182 integration). Updated synthetic response/expected metadata; no real response re-recording.
- Updated RANKING, affected handbook and TASKS. World date-bound fix already shipped (428); original NBA rejected responses were not retained, so cause still awaits next-run validation logs.
- Verification: pnpm format, pnpm lint:fix, pnpm check (263 unit/182 isolated integration), pnpm build, filtered handbook check (17 pages/one unchanged diagram/25 tables), git diff --check passed.
- Restarted API/worker; pnpm obs health --check passed, root HTTP 200, zero alerts/dangling volumes. Live rolling article counts Tech/NBA/Gaming/World: 329/161/281/222, all 36 sources healthy.
- Next: further bounded offline triage reduction if warranted, then item 27 same-story grouping restoration/relabel/evaluation; keep grouping off. Nov 4 scheduled evidence takes priority, including NBA/World outcomes and latency.

## 2026-11-03: iteration 482 — restore inactive same-story AI pass

- Started clean on main; no leftovers. Health passed; pending API metrics scrape alert cleared and metrics returned 200 without intervention.
- Item 27: restored the inactive budgeted/cached AI component and fake tests from before 364cb1b. New same-story prompt includes direct follow-ups, reactions and consequences; unrelated stories sharing entities/themes stay separate.
- New story-grouping-v3 purpose/instructions invalidate old same-event cache results. Known-ID, unique-membership, single-topic, shortlist, budget and provider-failure safeguards retained; no wording matcher or production caller.
- No paid calls, new editions, sources, Reddit requests or grouping activation. Fake prompt/validation tests are not semantic accuracy evidence.
- Updated TASKS, RANKING and affected handbook prose. Next: relabel 138 pairs plus 57 previously unlabelled merges, then one $0.05-capped evaluation outside 13:00–16:00 UTC; production stays off pending Nov 4 review.
- Verification: pnpm format, pnpm lint:fix, pnpm check (276 unit/182 isolated integration), pnpm build, filtered handbook check (17 pages/one unchanged diagram/25 tables) and git diff --check passed.

## 2026-11-03: iteration 483 — review same-story labels without changing history

- Started clean on main; zero alerts and healthy healthz. No leftover work, paid calls, editions, new sources, Reddit requests or production grouping activation.
- Reviewed all 138 original pairs plus 57 previously unlabelled saved merges under item 27. New separate same-story fixture keeps original pair indices, reasons and ten borderline flags; strict-event labels and saved memberships remain untouched.
- Broader definition changes 23 negatives to positives; all 57 added pairs are same-story. Shared entities/themes alone remain insufficient. Agent retrospective review is not independent or representative quality evidence.
- Offline old-output replay: precision 135/135 (100%), recall 135/157 (85.99%), zero unrelated/borderline/unknown merges. These numbers do not validate the restored prompt; no provider call occurred.
- Added --same-story offline evaluator and unrelated/borderline counts. Regression pins every original pair identity, all added labels, new metrics, historical failure and negative/borderline reporting. Targeted test initially caught a syntax typo; corrected, 9/9 pass.
- Updated RANKING, affected handbook and TASKS; archived iterations 467–471 to keep PROGRESS bounded. No source/schema/UI change; no screenshots needed.
- Verification: pnpm format, pnpm lint:fix, pnpm check (277 unit/182 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts edition-pipeline and git diff --check passed.
- Health check passed; root HTTP 200, all 36 sources healthy; live rolling articles Tech/NBA/Gaming/World 327/162/283/221. Digest queue has zero failures; zero alerts. No service restart under STEERING 22: only offline evaluator/tests/docs changed.
- Next: wire/run the single new $0.05-capped restored-prompt evaluation outside 13:00–16:00 UTC with a distinct durable item-27 guard; never delete/reuse the consumed item-26 claim. Grouping stays off pending Nov 4 review and conditional Nov 5 activation.

## 2026-11-03: iteration 484 — once-only same-story evaluation

- Started clean on main; no leftovers, healthz healthy and zero alerts. No production changes, editions, new sources, Reddit requests or grouping activation.
- Restored explicit paid runner with a distinct durable item-27 claim; consumed item-26 claim untouched. Configured Haiku only, $0.05 ceiling, live opt-in, verification tagging/shared ledger and excluded UTC hours enforced; no retries or repairs.
- Run item-27-evaluation-9c53e904-c472-4528-8252-aeb4653d2571: seven successful calls, $0.008393, zero holds. Frozen 195 labels: precision 141/141 (100%), recall 141/157 (89.81%), zero false positives; one borderline merged pair.
- Saved fresh memberships; separately reviewed all 14 unknown merged pairs (13 Sentinel reveal/timing follow-ups; one European-protest roundup explicitly covering Germany). All same-story; original labels/output untouched.
- Complete review: zero clearly unrelated, 1/155 borderline (0.65%), passing sampled gate. Supplemental-label precision 155/155, recall 155/171 (90.64%); retrospective agent review is not independent or general production quality evidence.
- Targeted restored tests initially caught old $0.10 reservation expectations; corrected for $0.05, 12/12 pass. Saved replay and exact supplemental-review coverage assertions passed without provider calls.
- Verification: pnpm format, pnpm lint:fix, pnpm check (289 unit/182 isolated integration), pnpm build, filtered handbook check (17 pages/one unchanged diagram/25 tables), git diff --check passed.
- Root HTTP 200, health check passed; all 36 sources healthy, digest queue zero failures, zero alerts. Live article counts Tech/NBA/Gaming/World 326/161/284/220. No restart under STEERING 22: runtime/config unchanged.
- Updated TASKS, RANKING and affected handbook. No schema/source/UI changes; screenshots unnecessary. Next: Nov 4 scheduled evidence review; conditional grouping activation for Nov 5 only, no more paid evaluations.

## 2026-11-03: iteration 485 — assess smaller triage pools offline

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, all 36 connected sources healthy; digest queue zero failures. Live rolling articles Tech/NBA/Gaming/World 326/162/285/220.
- Added a fully offline recency-cap evaluator using three existing recorded November 1 windows and labels; existing hard exclusions, semantic recovery, exact window bounds and deterministic ties are preserved.
- Cap 20 loses 6/15 reachable target events; cap 50 still loses the Tech Memdoor result. NBA/World already fit one cold batch after hard exclusions; Tech's two-to-one reduction costs a target. No production cap is justified by this sample.
- Reports baseline-missing vs newly lost events, article losses and theoretical cold batches separately. Recorded admission recall is not live latency or editorial quality; Gaming/current 200-item pools remain unmeasured.
- Targeted tests 2/2 passed after correcting fixture topic-name expectations. No provider calls, editions, sources, feature activation, schema or UI changes; no handbook/source updates or screenshots needed.
- Updated TASKS and RANKING. No restart under STEERING 22: only offline scripts/tests/docs changed.
- Verification: pnpm format, pnpm lint:fix, pnpm check (291 unit/182 isolated integration), pnpm build, offline cap report, targeted tests and git diff --check passed. Docker dangling volumes remain zero.
- Next: Nov 4 scheduled evidence review takes priority; NBA rejection still awaits logs. Grouping remains off, with conditional Nov 5 activation only after that review. No additional paid evaluations.

## 2026-11-03: iteration 504 — reduce metrics-store memory pressure

- Started clean on main; no leftover work. Triage found a firing ObservabilityMemoryBudget warning (about 101 MiB against 112 MiB ceiling). Healthz/root and all 36 sources healthy; all four queues staffed, digest queue zero failures.
- Metrics-store cgroup included about 46 MiB filesystem cache alongside runtime memory. Reduced its Go soft target 64→48 MiB, preserving cache budget, hard ceiling, alert threshold and stored samples. Updated handbook, observability plan and TASKS.
- Installed the committed unit configuration and restarted only obs-metrics; no app/DB/Redis restarts. Initial verification encountered startup connection refusal and stale scrape/unit snapshots; subsequent --verify-o4 passed with eight targets and eleven units.
- Post-restart sampled service memory 22–47 MiB through 23:17 UTC; zero automatic restarts, zero firing/pending alerts. This short observation does not establish long-term cache-refill behavior; monitor subsequent iterations.
- Verification: pnpm format, pnpm lint:fix, pnpm check (291 unit/182 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts observability, pnpm obs health --check and git diff --check passed. Docker dangling volumes remain zero.
- No provider calls, editions, source changes, feature activation or UI/schema changes; screenshots unnecessary. Grouping stays off.
- Next: monitor memory after cache refill, then review Nov 4 scheduled open-X/Bluesky picks, duration, NBA validation and World posts; conditional grouping activation for Nov 5 only after that review.

## 2026-11-04: iteration 512 — reclaim log-store filesystem cache before hard limit

- Started clean on main; no leftover work. Healthz/root healthy; pending log-store memory warning triggered triage (about 144 MiB, including 98 MiB file cache and 40 MiB anonymous memory).
- Added systemd MemoryHigh=128M below the unchanged 160 MiB hard ceiling; reclaim may slow log IO. Runtime O2 verification now asserts the deployed threshold. Updated affected handbook/observability plan and TASKS.
- Installed unit, reloaded systemd and restarted only obs-logs. Fresh journal delivery verified in 2.056 s; all seven log sources present, isolated redaction passed. Post-restart memory about 10–12 MiB, zero automatic restarts; alerts cleared; cache-refill behavior remains unproven.
- Found Bluesky hourly collection HTTP 400 at Nov 3 23:54 (22:54 succeeded); recorded next-priority triage, without speculative retries. All four queues available/staffed; digest queue zero failures. Ingestion retains two historical failures.
- Verification: pnpm format, pnpm lint:fix, pnpm check (291 unit/182 isolated integration passed), pnpm build, O2 runtime check, filtered handbook check (17 pages/one unchanged diagram/25 tables), health/root and git diff --check. Docker dangling volumes zero.
- No paid calls, editions, new sources, app configuration or UI changes. Grouping stays off. Next: diagnose Bluesky error, monitor log cache refill, then Nov 4 scheduled evidence.

## 2026-11-04: iteration 513 — recover Bluesky HTTP 400 token expiry

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root. Prior 23:54 hourly collection failed HTTP 400 after a successful first page; historical logs omit provider error code.
- Official PDS auth implementation reports expired JWTs as HTTP 400 ExpiredToken. Adapter previously refreshed only 401; now recognizes the explicit code in at most 4 KiB of error JSON, refreshes once and retries the same page. No response messages/tokens logged or retry loops.
- Added synthetic tests for expiry between pages, cursor/token preservation, unrelated/oversized error bodies and repeated expiry. The historical failure's cause remains probable, not proven; sustained expiry recovery awaits observation.
- Free read-only probe returned 193 real posts (48/48/49/48); no writes. Restarted only the changed worker, then one explicit social-collection recovery job stored 193 real observations (Tech/NBA/Gaming/World 50/48/49/46). No AI/provider spend or edition generation.
- Updated TASKS, SOURCES and jobs handbook; archived iterations 472–478 to keep PROGRESS below 25 KB. No UI/schema/feature activation; screenshots unnecessary.
- Verification: targeted Bluesky tests 9/9; pnpm format, pnpm lint:fix, pnpm check (293 unit/182 isolated integration), pnpm build, filtered handbook check, healthz/root, pnpm obs alerts and git diff --check passed. Docker dangling volumes zero.
- Next: monitor hourly collection and log/metrics cache refill; Nov 4 scheduled evidence remains priority. Grouping stays off until review, with conditional Nov 5 activation only afterward.
