# Progress

Earlier entries: [through iteration 3369](docs/progress-archive/2026-11-22-through-3369.md).

## 2026-11-22: iteration 3418 — recover Sunday backup restore verification

- Clean main at 3f2576df; no inherited changes. Alerts zero; healthz database/Redis healthy. Found failed 03:20 Sunday restore unit during service triage; reproduced without exposing private SQL/data.
- Kernel confirms cgroup OOM: tmpfs database data counted against the restore container’s 384 MB cap as the backup grew. Use Postgres’s disposable anonymous disk volume instead; unchanged memory/CPU/network limits, existing docker rm -fv removes the volume.
- Restarted restore-check successfully: real Nov 22 backup checksum/count verification passes, 40 tables/187,697 rows; no leftover restore containers. Four Python backup tests pass. Handbook/TASKS updated.
- pnpm format, pnpm lint:fix, pnpm build, handbook checker and signed-out Nov 21 reader probe pass (five topics/25 stories/15 posts). Full pnpm check running; final results below.
- No paid calls or selection changes. Next: Nov 22 daily/developing acceptance after 15:00 UTC, three-edition miss-cause fix, weekly acceptance after 17:00 UTC.
- Final: pnpm check passes (1,385 unit passes; 341 integration passes/four expected skips); git diff --check passes. Build/format/lint/handbook and real restore/reader verified; commit/push and API/worker restart follow. Logs: /tmp/3418-*.log.

## 2026-11-22: iteration 3424 — locate not-shortlisted bottleneck

- Clean main at 013e268f; no inherited work. Alerts zero, healthz database/Redis healthy; no new service failures (only historical transient check units).
- Item 74 step 1: traced all 46 Nov 20/21 topic-event misses using saved grouping/ownership, triage and editor memberships; full stage/topic table and every route in Nov 21 review.
- Largest stage is pre-ownership 20-report cap: 18 misses; pre-group 40-report cap six, final ten-event admission ten, triage nine, earlier candidate stages three.
- Read-only candidate/source/timestamp probes explain newest-200 Kyiv exclusion, late-arriving prison report and Tech-only datacenter routing. No model calls, scripts, schemas or selection changes.
- Owner accepts event-budget rejection: closed TASKS step 2 and removed its obsolete NEEDS_FROM_HUMAN entry.
- Next: general pre-group bottleneck fix and saved Nov 20/21 reach/input/cost replay; hold deployment for Nov 22 tally and daily-cap gate.
- Verification: pnpm format; pnpm lint:fix; pnpm check (1,385 unit passes; 341 integration passes/four expected skips); pnpm build; handbook/schema checker; git diff --check pass. Signed-out scheduled reader verifies Nov 21 five topics/25 stories/15 posts. Logs /tmp/3424-*.log.
- Commit/push and API/worker restart/final health follow; no selection deployment.

## 2026-11-22: iteration 3425 — prepare shared politics pool backfill

- Clean main at 6b78f75a; no inherited work. Alerts zero; healthz database/Redis healthy; failed units are historical check commands.
- Prepared fillSharedStoryPool, intentionally unconnected to publication: retain both top-20 baselines and fill overlap vacancies round-robin from the scored tails, never exceeding 40 unique reports. No publisher/event/wording rules or cap changes.
- Four targeted politics tests pass, including overlap 0/5/20, baseline report preservation, deterministic admission, sparse pools and unchanged inputs. Report preservation alone does not establish final editor-event preservation.
- Item 74 remains open: saved Nov 20/21 reach/input/cost measurement and final editor-event preservation are next; no saved-pool improvement or cost result claimed. Wiring/deploy held for Nov 22 tally and budget gate.
- No model calls, source changes or live selection changes. Full verification results below.
- Verification: pnpm format; pnpm lint:fix; pnpm check (1,386 unit passes; 341 integration passes/four expected skips); pnpm build; git diff --check pass. Signed-out Nov 21 reader: five topics/25 stories/15 posts. Logs /tmp/3425-*.log. Commit/push and API/worker restart follow.

## 2026-11-22: iteration 3426 — reject ineffective overlap backfill

- Clean main at 070dd4d7; no inherited changes. pnpm obs alerts clear; healthz database/Redis healthy.
- Replayed production editorialShortlist against the union of saved Nov 20/21 candidate pools and saved triage. Exact baseline ownership ID equality and ordered backfill identity assertions pass for both days.
- Both shared pools already have 40 unique reports; policy adds zero reports/missed events, editor input +0 bytes and estimate +$0. All topics retain baseline editor reach/events. Separate source-pool reconstruction was rejected because publication uses the union.
- Saved ownership has 23/28 events in 40 reports: within-event report redundancy is the remaining bottleneck. Removed unused helper and synthetic helper tests; no live selection changes or model calls. Review/TASKS record rejection and per-topic 0/0 miss reach.
- Next: event-level admission preserving baseline events within unchanged caps, saved-pool measurement, then Nov 22 tally/deployment gate. No claim that item 74 fix or budget acceptance is complete.
- Verification running: pnpm format; pnpm lint:fix; pnpm check; pnpm build; handbook checker; signed-out Nov 21 scheduled reader. Logs /tmp/3426-*.log. Final results below.
- Final: pnpm check passes (1,385 unit passes; 341 integration passes/four expected skips); format/lint/build/handbook and signed-out reader pass (five topics/25 stories/15 posts). Exact saved-pool identity assertions pass; git diff --check clean. Commit/push and API/worker restart follow.

## 2026-11-22: iteration 3427 — prepare bounded event admission

- Clean main at 85afcc85; no inherited work. Alerts clear; healthz database/Redis healthy; API/worker running.
- Added inactive general regrouping-input admission: retain highest-ranked representative per validated baseline event, fill unseen ranked reports before corroboration, preserve input ranking/cap. No wording heuristics or production connection.
- Three targeted tests pass: all 1–40 event counts, baseline-event retention, deterministic order, sparse tails, immutability and invalid partitions/caps.
- Saved ownership partition capacity check retains Nov 20 23/23 and Nov 21 28/28 baseline groups, releasing 17/12 slots within 40. Baseline input order used: not a scored-tail replay, missed-event reach or final editor preservation acceptance.
- No model calls or live input/cost changes. Original coverage retention, expanded-input grouping, scored-tail reach/input/cost and final editor-event preservation remain next. Deployment held for Nov 22 tally.
- Verification: pnpm format; pnpm lint:fix; pnpm check passes (1,388 unit, 341 integration, four expected skips); handbook/schema checker and signed-out Nov 21 reader pass (five topics/25 stories/15 posts). pnpm build and git diff --check pass. Commit/push and API/worker restart/final health follow; logs /tmp/3427-*.log.

## 2026-11-22: iteration 3428 — preserve baseline regrouping coverage

- Clean main at 7b45c586; no inherited changes. Alerts clear; healthz database/Redis healthy; API/worker running.
- Added inactive restoreEventCoverage guard alongside bounded admission. Restores omitted corroborating IDs; rejects baseline splits/merges/topic reassignment, missing events and malformed partitions. New reports/events remain allowed; inputs unchanged.
- Five targeted admission/restoration tests pass. Synthetic checks only: actual saved ranked-tail replay, final editor-event retention and whole-day cost gates remain open. Production unconnected; no model calls or selection changes; Nov 22 tally/deploy hold retained.
- Signed-out scheduled reader passes: Nov 21, five topics/25 stories/15 posts. Handbook/schema checker passes (40 tables). No affected handbook behavior or source changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build. First check caught review-note whitespace added after format; corrected with Prettier and reran. Final results recorded below. Logs /tmp/3428-*.log.
- Final: pnpm check passes (1,390 unit passes; 341 integration passes/four expected skips); build and git diff --check pass. Commit/push and API/worker restart follow; saved replay and final editor/cost acceptance remain next.

## 2026-11-22: iteration 3429 — protect baseline final editor admission

- Clean main at f752f486; no inherited work. Alerts clear; healthz database/Redis healthy.
- Added inactive per-topic final editor admission: reserve every baseline event, then fill by ranking within unchanged cap. Reject missing coverage, split/merged events, mixed scopes and invalid caps.
- Seven targeted tests pass, including all zero-to-ten baseline occupancies displaced below the cutoff. No model calls or production changes.
- Saved ranked-tail reach, real editor-input retention/size/cost and Nov 22 tally/deployment gate remain open. No affected handbook behavior or source changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; handbook/schema checker; signed-out scheduled reader. Results below; logs /tmp/3429-*.log.
- Final: pnpm check passes (1,392 unit passes; 341 integration passes/four expected skips); build, handbook/schema, signed-out Nov 21 reader (five topics/25 stories/15 posts), and git diff --check pass. Archived entries through 3369. Commit/push and API/worker restart follow.

## 2026-11-22: iteration 3430 — reject saturated event-preserving admission

- Clean main at ce7bdef2; no inherited work. Alerts clear; healthz database/Redis healthy.
- Read-only saved Nov 20/21 candidatePrompt inspection: nine of ten topic inputs have ten candidates, Nov 20 World nine. Politics candidates map to distinct saved ownership groups in their topic.
- Preserving every baseline event within ten slots permits at most one new event total, none in U.S. on either day, regardless of ranked-tail order. This invalidates the proposed root fix before further regrouping/replay.
- Removed inactive 3427–3429 helpers/tests; no production selection/prompt/cap changes or model calls. Reach remains 0/0 per-topic; input/cost delta zero, not counterfactual acceptance.
- Added rejection/capacity table to Nov 21 review; TASKS and NEEDS_FROM_HUMAN record unfinished replacement and constraints. No source/handbook behavior changes. Nov 22 tally/deploy hold retained; next independent work is item 70.
- Verification: pnpm format; pnpm lint:fix; pnpm check passes (1,385 unit; 341 integration; four expected skips); pnpm build; handbook/schema checker; signed-out Nov 21 reader (five topics/25 stories/15 posts); git diff --check. Read-only node /tmp/3430-fetch.cjs and Python membership/capacity assertions pass. Logs /tmp/3430-*.log.
- Commit/push and API/worker restart/final health follow.

## 2026-11-22: iteration 3431 — weekly topic navigation

- Clean main at fd063f53; no inherited changes. Alerts clear; healthz database/Redis healthy.
- Added topic jump links above weekly summaries, including quiet sections; headings accept keyboard focus and leave space above the destination.
- Extended existing Playwright smoke checks for keyboard focus/hash navigation; refreshed four explicitly synthetic detail screenshots and inspected the mobile light image. Live weekly history remains empty before Sunday 17:00 UTC.
- Updated affected owner handbook and TASKS. No model calls, source changes, cap changes or selection changes. Item 74 baseline-capacity constraint and Nov 22 tally/deploy hold remain; developing/weekly real-edition acceptance still due today.
- Verification: pnpm format; pnpm lint:fix; pnpm build; pnpm exec tsx scripts/smoke-reader-weekly.ts (390/1440 light/dark); pnpm exec tsx scripts/check-handbook.ts edition-pipeline (19 pages, 40 tables); pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-21T15:00:00Z (five topics/25 stories/15 posts). An initial reader command without its required cutoff returned usage; corrected command passes.
- Full pnpm check passes: 1,385 unit and 341 integration passes, four expected skips. Build and git diff --check pass. Commit/push and API/worker restart/final health follow. Logs: /tmp/3431-*.log.

## 2026-11-22: iteration 3432 — weekly archive pagination focus

- Clean main at f549dc92; no inherited changes. Alerts clear; healthz database/Redis healthy.
- Weekly archive pagination now focuses and scrolls to its heading after the requested page loads; the heading describes the current page for screen readers.
- Extended Playwright checks for forward/back pagination focus and page descriptions at 390/1440 in light/dark. Screenshots regenerated unchanged; mobile light detail inspected. Live weekly history still empty before 17:00 UTC.
- No model calls, source/selection/cap changes or handbook behavior changes. Item 74 capacity constraint and Nov 22 tally/deploy hold remain; daily/developing acceptance and weekly acceptance still due today.
- Verification: pnpm format; pnpm lint:fix; pnpm build; weekly Playwright smoke; handbook/schema check (19 pages/40 tables); signed-out Nov 21 reader (five topics/25 stories/15 posts); git diff --check. First concurrent check caught import sorting before autofix finished; corrected and reran full check. Logs /tmp/3432-*.log.
- Final verification: full check's typecheck/lint/format/boundaries and 1,385 unit tests pass; combined process terminated with exit 143 before integration summary. Separate pnpm test:integration exits zero: 341 passes/four expected skips. Build, browser, reader, handbook/schema checks pass. Commit/push and API/worker restart/final health follow.

## 2026-11-22: iteration 3433 — identify saved weekly editions

- Clean main at 8997a948; no inherited changes. Alerts clear; healthz database/Redis healthy.
- Weekly detail headings/browser tabs now name the saved cutoff date; archive tabs identify their page. Leaving weekly routes restores the original app title.
- Extended Playwright checks for detail/page/error titles and navigation cleanup at 390/1440 light/dark; refreshed four explicitly synthetic screenshots and inspected mobile light. Live weekly history remains empty before Sunday 17:00 UTC.
- Updated affected owner handbook and TASKS. No model calls, source/cap/selection changes; item 74 constraint/deploy hold and today's real-edition acceptances remain.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; weekly Playwright smoke; handbook/schema checker (19 pages/40 tables); signed-out Nov 21 reader (five topics/25 stories/15 posts); git diff --check. Final check results below; logs /tmp/3433-*.log.
- Final: standalone pnpm check exits zero (1,385 unit passes; 341 integration passes/four expected skips). Initial combined formatting/lint/check process ended with exit 143 after typecheck; standalone rerun passes. Build/browser/reader/handbook and git diff --check pass. Commit/push and API/worker restart follow.

## 2026-11-22: iteration 3434 — weekly original coverage links

- Clean main at 4dd733fb; no inherited changes. Alerts clear; healthz database/Redis healthy. Daily/developing acceptance due after 15:00 UTC, weekly after 17:00.
- Weekly coverage now links directly to saved original articles/posts alongside daily edition links, with descriptive accessible names and keyboard focus. No model calls, source/selection/cap changes.
- Extended existing browser smoke for both original URL kinds/focus at 390/1440 light/dark; refreshed explicitly synthetic screenshots. Inspected mobile light and separated source links onto their own lines; rebuilt and repeated browser verification.
- Updated affected handbook and TASKS. Item 74 capacity constraint/deployment hold remains; Nov 22 tally and real developing/weekly acceptance remain next.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; weekly browser smoke; handbook/schema check (19 pages/40 tables); signed-out Nov 21 reader (five topics/25 stories/15 posts); git diff --check. Final results below; logs /tmp/3434-*.log.
- Final: combined check passed typecheck/lint/format/boundaries but exited 143 during unit tests. Separate pnpm test:unit passes 1,385; pnpm test:integration exits zero (341 passes/four expected skips). Final build/browser and git diff --check pass. Commit/push and API/worker restart/final health follow.
