## 2026-11-03: iteration 467 — remove wording-based story grouping

- Started clean on main; no leftovers, zero alerts, healthy API/DB/Redis and 33 sources. Continued STEERING 26 after iteration 466's offline triage reduction; NBA rejection/live speed still need scheduled evidence.
- Removed word-overlap/action/number-order matching, all five game/studio/preload/remake/title-reveal rule modules, their flag, rule tests and CLI options. Production now does no grouping, including identical titles; canonical-URL ingestion dedupe stays.
- Kept generic complete-link matcher plumbing, coverage links and every recorded label unchanged. Disabled baseline: 98 pairs, zero merges, null precision/zero recall; this is not AI quality evidence.
- Updated publication coverage golden for three separate recorded Gaming stories in fallback/synthetic-AI modes. Full checks exposed two old duplicate-title assumptions in reaction/ranking tests; updated them. One check also caught archived Markdown formatting; corrected it.
- Final pnpm format, pnpm lint:fix, pnpm check (259 unit/177 isolated integration), pnpm build and git diff --check passed. Handbook check passed; corrected and visually inspected the pipeline diagram.
- Restarted API/worker; health passed after startup retry, root HTTP 200, all 33 sources healthy, zero alerts/dangling volumes. No paid calls, new editions or Reddit requests.
- Updated TASKS/RANKING/handbook and acknowledged removal in STEERING; archived iteration 451 to bound PROGRESS. Next: ledger/cache-backed one-Haiku-call-per-topic AI grouping, then gated evaluation; Nov 4 scheduled latency/NBA and social evidence takes priority when available.

## 2026-11-03: iteration 468 — inactive budgeted AI grouping component

- Started clean on main; no leftovers, zero alerts, healthy API/DB/Redis and 33 sources. Nov 4 provider/social evidence remains pending.
- Added an inactive one-topic, 2–40 article AI grouping component with bounded title/outlet/time/excerpt input and strict known/unique ID validation. Mixed-topic inputs never spend; invalid/unavailable/over-budget responses keep articles separate.
- Uses the existing ledger and request cache; added opt-out from JSON repairs to enforce one provider call for grouping. Existing editorial repair defaults remain unchanged. No production caller, grouping activation or ranking bonus.
- Nine fake-provider cases verify validation, budget refusal, cache reuse/invalidation, settlement and no repair. No paid calls, new editions or Reddit requests.
- Updated TASKS/RANKING; archived iteration 452 to keep PROGRESS bounded. Production flow unchanged, so no handbook/UI changes.
- Verification: targeted tests 9/9; pnpm format, pnpm lint:fix, pnpm check (268 unit/177 isolated integration), pnpm build and git diff --check passed. First check caught floating promises in new tests; fixed explicitly. Zero dangling volumes.
- Restarted API/worker; pnpm obs health --check passed, root HTTP 200, zero alerts. Healthy sources and completed scheduled digest/hourly social jobs confirmed; no fresh edition generated.
- Next: add approved shared-link/X prompt hints and evaluation wiring; run the owner's capped quality evaluation before any activation. Nov 4 NBA/full-AI/latency and social selection evidence still takes priority when available.

## 2026-11-03: iteration 469 — bounded shared-reference grouping hints

- Started clean on main; no leftovers, zero alerts, healthy API/DB/Redis and all 33 sources. Nov 4 scheduled latency/NBA/social evidence remains pending.
- Inactive grouping v2 accepts bounded optional outbound links; exact shared links and normalized X post IDs become prompt hints only. Model decides membership; no automatic merges, extraction/caller wiring or production activation.
- Deduplicates article citations, strips fragments, rejects credentials/non-HTTP references and bounds link count/length. Prompt explicitly warns that shared references can cover distinct events; changed hints invalidate the existing request cache.
- Targeted fake tests 12/12 cover X aliases, unrelated links, no model merge despite hints, bounds and cache changes. No paid calls, new editions or Reddit requests.
- Updated TASKS/RANKING; archived iteration 453 to keep PROGRESS bounded. No production flow/UI/handbook change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (271 unit/177 isolated integration), pnpm build and git diff --check passed. First check found archived Markdown formatting; fixed before rerun.
- Pushed f4e5757; restarted API/worker. pnpm obs health --check passed, root HTTP 200, zero alerts; sources 33/33 healthy and scheduled digest queue healthy.
- Next: evaluation/caller wiring and owner-capped labelled-day evaluation; activation requires zero wrong merges and recall above 13/32. Check Nov 4 scheduled provider/social evidence first when available.

## 2026-11-03: iteration 470 — offline saved AI membership evaluation

- Started clean on main; no leftovers, zero alerts, healthy API/DB/Redis and all 33 sources. Nov 4 scheduled provider/social evidence remains pending.
- Added offline `--memberships` input to the recorded grouping evaluator. Strict per-window IDs, unique membership and group sizes reject malformed/cross-window output; omitted windows/articles stay separate.
- Preserved all-pair cluster review, unlabelled merge reporting and order checks alongside labelled precision/recall. No provider calls, production caller, grouping activation, new editions or Reddit requests.
- Seven targeted fake/saved-output tests pass, including wrong merges, unlabelled pairs and invalid membership. CLI synthetic example: 1 TP, 0 FP, precision 1, recall 1/57; evaluator verification only, not AI quality. Disabled baseline remains 98 pairs/zero merges.
- Updated TASKS/RANKING; archived iteration 454 to bound PROGRESS. No production flow/UI/handbook change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (274 unit/177 isolated integration), pnpm build and git diff --check passed. Zero dangling Docker volumes.
- Restarted API/worker; health/root/source/job/alert checks passed. All 33 sources healthy; retained scheduled digest and hourly social jobs healthy.
- Next: bounded AI evaluation runner and unseen recent-day labels, then the owner's $0.10/outside-13–16-UTC evaluation. Activation still requires zero wrong merges and recall clearly above 13/32; Nov 4 evidence takes priority when available.

## 2026-11-03: iteration 471 — bounded recorded-window evaluation runner

- Started clean on main; no leftovers. Zero alerts, healthy API/DB/Redis and 33 sources; Nov 4 scheduled provider/social evidence remains pending.
- Added offline `--plan` and injectable serial evaluation runner: six topic/day windows, at most 40 candidates each, all labelled endpoints preserved before filling in recorded order. Label-aware samples are not production ranking evidence.
- Runner sends only article facts through the existing grouping component, returns saved memberships plus the all-pair quality report, and rejects invalid memberships before another window. No retries or provider permutation reruns.
- Three targeted tests pass with a fake provider, including six calls, full cache reuse and immediate invalid-output stop. No paid calls, production activation, new editions or Reddit requests.
- Updated TASKS/RANKING; archived iteration 455 to keep PROGRESS bounded. Live capped entrypoint/time gate and unseen-day labels remain next; no handbook/UI flow changed.
- Verification: pnpm format, pnpm lint:fix, pnpm check (277 unit/177 isolated integration), pnpm build, offline --plan and git diff --check passed. Zero dangling Docker volumes.
- Live root HTTP 200; pnpm obs health/sources/jobs --check pass, zero alerts. No service restart: running service code/config unchanged, per STEERING 22.
- Next: add owner-capped live evaluation admission and new-day labels; evaluate before activation. Check Nov 4 NBA/full-AI/latency and social evidence when available.

## 2026-11-03: iteration 472 — fail-closed grouping evaluation admission

- Started clean on main; no leftovers. Zero alerts, healthy API/DB/Redis and all 33 sources; Nov 4 scheduled evidence remains pending.
- Added evaluation-only ledger decorator: explicit live opt-in, valid UTC clock, 13–16 UTC exclusion checked before every reservation, bound run/model/purpose and at most $0.10 per execution.
- Claims conservative estimates synchronously before shared admission; no refunds on refusal/failure/settlement. Shared caps, scheduled reserve, verification limits, settlement and cache remain authoritative.
- Five fake tests cover time boundaries/crossing, invalid estimates/identities, concurrent admissions, shared refusal, uncertain failure, settlement, budgeted abstention and cache reuse. No paid calls, new editions, Reddit requests or production activation.
- Updated TASKS/RANKING; archived iteration 456 to bound PROGRESS. No production flow/UI/handbook change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (282 unit/177 isolated integration), pnpm build and git diff --check passed. Root HTTP 200; health/sources/jobs checks pass, zero alerts.
- Services unchanged: no restart under STEERING 22 because running code/config did not change.
- Next: durable once-only live entrypoint and unseen-day labels before the owner-capped evaluation. Activation requires zero wrong merges and recall above 13/32; Nov 4 provider/social evidence takes priority when available.

## 2026-11-03: iteration 473 — durable once-only evaluation guard

- Started clean on main; no leftovers. Zero alerts, healthy API/DB/Redis and all 33 sources; Nov 4 scheduled provider/social evidence remains pending.
- Added VM-local evaluation harness: exclusive fixed item-26 claim and file/directory fsync before execution; claim survives crashes, provider errors and report-write failures. Successful reports use exclusive owner-only files and fsync.
- Three temporary-directory/fake-callback tests cover concurrent admission, repeated invocation, empty crash markers, uncertain provider failure, saved output permissions and report-write failure. No paid calls, new editions, Reddit requests or grouping activation.
- Live caller must use one preprovisioned persistent directory plus existing ledger/time/cost admission. This is not distributed authorization; live wiring and unseen-day labels remain unfinished.
- Updated TASKS/RANKING; archived iteration 457 to bound PROGRESS. No production flow/UI/handbook change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (285 unit/177 isolated integration), pnpm build and git diff --check passed. Zero dangling Docker volumes.
- Root HTTP 200; pnpm obs health/sources/jobs checks passed, all 33 sources healthy, zero alerts. No restart under STEERING 22: running service code/config unchanged.
- Next: fixed-state live entrypoint and unseen-day labels, then owner-capped once-only evaluation. Nov 4 scheduled evidence takes priority when available.

## 2026-11-03: iteration 474 — fresh NBA grouping evaluation labels

- Started clean on main; no leftovers. Zero alerts; API/DB/Redis and all 33 sources healthy. Nov 4 scheduled provider/social evidence remains pending.
- Recorded 19 real stored November 3 NBA articles with bounded excerpts and 40 new agent-reviewed pairs (20 same/20 separate), before grouping-provider inference and without prompt tuning.
- Positive cliques cover the Terry signing, fan-wine incident and two game results; hard negatives distinguish previews, third-party reactions and separate events. All 98 previous labels remain unchanged.
- Explicit limitation: fresh topic/day, not an untouched calendar day (Gaming development data also includes Nov 3); selected agent labels are not independent or representative quality evidence.
- Runner/evaluator now cover seven bounded windows and 138 labels; fake provider/cache tests and per-window counts pass. No paid calls, production grouping, new editions or Reddit requests.
- Updated TASKS/RANKING; archived iteration 458 to keep PROGRESS bounded. No production service/config/UI change; no restart under STEERING 22.
- Verification: pnpm format, pnpm lint:fix, pnpm check (285 unit/177 isolated integration), pnpm build, 10 targeted tests, offline --plan and git diff --check pass. Initial format-check failure after timestamp removal fixed before rerun. Root HTTP 200; health/sources/jobs checks pass, zero alerts/dangling volumes.
- Next: fixed persistent-state live entrypoint, then the owner-capped once-only evaluation; report fresh-window results separately. Check Nov 4 scheduled evidence first when available.

## 2026-11-03: iteration 475 — fixed persistent grouping evaluation entrypoint

- Started clean on main; no leftovers. Zero alerts; API/DB/Redis and all 33 sources healthy. Nov 4 scheduled provider/social evidence remains pending.
- Wired explicit live entrypoint to configured Haiku, shared verification ledger/cache, $0.10 conservative ceiling, per-reservation UTC exclusion and durable once-only claim/report.
- Fixed state path outside the repo; provisioned private persistent directory. No CLI/env directory override. Preflight checks ownership, mode, symlinks, labels, configuration, time and DB before claiming.
- Temporary-directory test verifies valid private state and rejection of missing/shared/symlinked state. No-opt-in CLI exits 1 without creating a claim; sanitized failure output exposes no SDK/DB exception text.
- No paid evaluation, new editions, Reddit requests or production activation. Updated TASKS/RANKING; archived iteration 459 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (286 unit/177 isolated integration), pnpm build, targeted preflight test and git diff --check passed. HTTP root 200; health/sources/jobs checks pass; zero alerts/dangling volumes.
- No restart under STEERING 22: running service code/config unchanged. Next: once-only capped evaluation, then accuracy gate; Nov 4 scheduled evidence takes priority when available.

## 2026-11-03: iteration 476 — evaluate AI grouping once, then park it

- Started clean on main; no leftovers. Zero alerts, API/DB/Redis healthy, all 33 sources healthy. Nov 4 scheduled evidence remains pending.
- Executed owner-authorized once-only item 26 evaluation at 20:25–20:26 UTC through fixed persistent claim, configured Haiku and shared ledger: seven succeeded calls, $0.008275 actual/$0.027462 reserved, below $0.10 cap. No retries, repairs or new editions.
- Frozen 138 labels: 76/77 positives matched, two wrong merges, precision 76/78 (97.44%), recall 76/77 (98.70%). Original 60: 31/32 recall, one wrong merge. Fresh NBA: 20/20 recall, one wrong merge. Another 57 merged pairs remain unreviewed, not correct by assumption.
- Zero-wrong-merge gate failed. Parked item 19/26 per owner and acked STEERING; removed inactive AI pass, paid runner, guards and their tests. Generic plumbing, labels and offline evaluator remain; production keeps articles separate. Persistent claim/report preserved; no paid retry path remains.
- Committed frozen memberships and an offline regression; RANKING reports per-window results, failures, limitations and replay command. Updated TASKS/handbook; archived iteration 460 to keep PROGRESS bounded.
- Targeted tests 8/8, saved-membership CLI, handbook check (one unchanged diagram/25 assigned tables), pnpm build and git diff --check passed. Initial full check caught archive formatting during preparation; fixed before final check. Final pnpm check passed (263 unit/177 isolated integration), including typecheck/lint/format/boundaries.
- No restart under STEERING 22: removed code was inactive, running code/config unchanged; handbook serves edited source. API/worker/docs/schema active; healthz HTTP 200 and zero dangling volumes.
- Next: prioritize Nov 4 scheduled NBA/speed, open-X/Bluesky evidence; grouping remains parked unless owner reopens it.

## 2026-11-03: iteration 477 — add NBA coverage and free X highlights

- Started clean on main; no leftovers. Zero alerts and healthy services/sources. Nov 4 scheduled NBA/speed/social evidence remains pending; rejected Nov 3 responses were not retained, so their cause remains unknown. Grouping stays parked.
- Advanced item 10: pre-change NBA was weakest at 151 articles/four healthy sources, versus Tech 329/6, Gaming 282/18 and World 224/5. Added public SB Nation NBA Atom feed via migration 051.
- Recorded two real entries; fixture tests pin authors, publication offsets, plain excerpts and embedded ESPN/NBA X links. Initial unfiltered targeted run correctly refused its DB test outside isolation; reran the two fixture tests successfully, with DB coverage delegated to pnpm check.
- Bounded research: HoopsHype/NBC endpoints 404, SLAM 403 (no bypass); Basketball Insiders returned 25 entries but was not added. No Reddit requests, paid inference or new edition.
- Applied migration and restarted worker to register source schedule. Normal collection stored ten articles and 21 distinct X citations at 20:36:15 UTC; initial feed probe had 18. Citations are not verified posts or independent reporting. NBA now 152 rolling articles/five healthy sources; all 34 sources healthy.
- Updated SOURCES/TASKS and owner handbook; archived iterations 461–462 to keep PROGRESS bounded. No table/relationship metadata change or UI change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (263 unit/178 isolated integration), pnpm build, handbook check (17 pages/one unchanged diagram/25 assigned tables), two targeted fixture tests and git diff --check passed. Zero dangling Docker volumes.
- Worker/API/docs/schema active; health --check passed, root HTTP 200, saved edition schema/content valid (19 stories/11 posts), zero alerts. Next: Nov 4 scheduled provider timing/NBA fallback and open-X/Bluesky selection evidence.

## 2026-11-03: iteration 478 — deepen NBA reporting coverage

- Started clean on main; no leftovers. Zero alerts and healthy services. Nov 4 scheduled provider/social evidence remains pending; grouping stays parked.
- Advanced item 10: pre-change rolling-day articles/healthy sources were Tech 328/6, NBA 152/5, Gaming 280/18, World 227/5. World had zero rolling-day verified X posts; no extra paid search was triggered.
- Added Basketball Insiders public RSS via migration 052, respecting deletion of the original NBA topic. Feed returned 25 dated entries, two recent game reports. Independent reporting and relevance remain caveats.
- Recorded two entries; fixture tests pin dates, authors, plain excerpts, links and no invented X citations. No tests call live HTTP. No paid calls, new editions or Reddit requests.
- Applied migration and restarted worker for source configuration. Normal collection stored 25 articles at 20:41:07 UTC with no error. NBA now 154 rolling articles/six healthy sources; all 35 sources healthy.
- Updated SOURCES/TASKS and affected handbook page; shortened completed task marker and archived iterations 463–464 to keep orientation files bounded. No table/relationship or UI change.
- Verification: two targeted fixture tests, pnpm check (263 unit/179 isolated integration), pnpm build, handbook check (17 pages/14 unchanged diagrams/25 assigned tables), pnpm format, pnpm lint:fix and git diff --check passed.
- API/worker/docs/schema active; pnpm obs health --check passed, root HTTP 200, zero alerts/dangling volumes. Next: Nov 4 scheduled speed/NBA fallback and open-X/Bluesky selection evidence.

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
- Next: Nov 4 scheduled timing/NBA fallback, World yield and open-X/Bluesky selections/screenshots; no extra paid verification.
