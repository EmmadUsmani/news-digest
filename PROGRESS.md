# Progress

Earlier entries: [through iteration 3358](docs/progress-archive/2026-11-21-through-3358.md).

## 2026-11-21: iteration 3359 — real-selector event-budget preview

- Clean main at d74eb47b; no inherited work. Healthz healthy, zero alerts, sources check passes; digest-generation counts show zero failed/active, next run Nov 22 15:00 UTC.
- Added explicit evaluation-only event-budget preview to the real X/Reddit selector: normal triage/shortlist, one outcome call, complete-summary request and upstream truncation metadata retained. No scheduled caller opts in; original picks unchanged.
- Preview maps back to full snapshots/metrics/display text and semantic/editor provenance. If X preference would remove a planned post, refuse the entire preview rather than silently lose an event/fact. Invalid previews preserve original picks; failed outcomes do not retry.
- Targeted selector tests pass 15/15; saved Nov 17–18 editor replay still passes with zero external calls. TASKS/RANKING updated; owner handbook behavior unchanged.
- Verification/deployment results follow below; logs /tmp/3359-*.log. No paid calls, new reference labels or fixtures, cap changes or UI changes.
- Next: Nov 22 daily/developing reader acceptance and three-edition miss-cause fix; semantic event annotations/full Nov 12–18 comparison and cross-platform acceptance; Sunday weekly publication acceptance.
- Final: pnpm format/lint:fix/check/build pass (1,375 unit, 341 integration/four expected skips). First check caught an opt-out null preview leaking into saved snapshots; fixed by omitting the field unless requested, then reran the full suite. git diff --check passes; deployment/reader/alerts checked after push.

## 2026-11-21: iteration 3360 — Bluesky event-budget preview

- Clean main at f3c12ae2; no inherited work. Healthz/alerts healthy; all 38 monitored sources healthy; digest queue zero failed/active, next scheduled Nov 22 15:00 UTC.
- Extended the real Bluesky shortlist/editor path with explicit event-budget preview: one outcome call, complete-story evidence request, truncation metadata and full stored observation/score/rationale mapping. Ordinary scheduled callers remain unchanged.
- Reject unknown/duplicate/excess preview picks and refuse when existing platform picks lack stable event-review IDs. Empty previews remain valid. Cross-platform review is still required before production admission.
- Targeted Bluesky tests pass 8/8; existing saved Nov 17–18 evaluator passes with zero external calls and unchanged results. No paid calls, new labels/fixtures, cap or UI changes; owner handbook behavior unchanged.
- TASKS/RANKING updated. Full verification and deployment recorded below; logs /tmp/3360-*.log.
- Next: Nov 22 daily/developing reader acceptance and three-edition miss-cause fix; complete semantic event-budget comparison for Nov 12–18 and joint cross-platform admission; Sunday weekly acceptance.
- Final: pnpm format, pnpm lint:fix, pnpm check (1,377 unit passes; 341 integration passes/four expected skips), pnpm build and git diff --check pass. Scheduled reader probe verifies Nov 21 five topics/25 stories/15 posts. API/worker health and alerts checked after push/restart.

## 2026-11-21: iteration 3361 — joint cross-platform event review

- Clean main at 7a575fcc; no inherited work. Alerts zero and healthz healthy; source/queue snapshots saved in /tmp/3361-{sources,jobs}.json.
- Added evaluation-only joint editor entry point for already-qualified X/Reddit/Bluesky shortlists: one shared event/fact namespace, exact snapshot/evidence binding, existing score gates, bounded inputs and X-preference refusal.
- One real-editor scripted/cache regression preserves all three platform snapshots and removes a redundant launch post; refusal/unavailable/zero-budget cases avoid fallback calls. No paid calls, new labels/fixtures, UI or scheduled behavior changes.
- TASKS/RANKING updated; handbook system behavior unchanged. Initial targeted run caught wrong scripted short IDs; corrected to actual supplied IDs.
- Verification/deployment results follow. Next: Nov 22 daily/developing acceptance and miss-cause fix; full saved event-budget comparison/semantic acceptance; Sunday weekly acceptance.
- Final: pnpm format, pnpm lint:fix, pnpm check (1,379 unit; 341 integration passes/four expected skips), pnpm build and git diff --check pass. Targeted editor tests 33/33 and saved Nov 17–18 evaluator pass with zero external calls. Reader confirms five topics/25 stories/15 posts; API/worker restart and final health/alerts checked after push. Logs /tmp/3361-*.log.

## 2026-11-21: iteration 3362 — saved joint-platform acceptance replay

- Clean main at 82faf3b3; no inherited work. Alerts zero, healthz healthy, sources check passes (38 monitored); no failed digest jobs, next daily Nov 22 15:00 UTC.
- Extended existing Nov 17–18 evaluator through the joint platform helper with saved identities/platforms/prose and explicit placeholders for unsaved observation fields; no new labels/fixtures or paid calls.
- Ten fresh/cache replays pass, zero preference refusals; retained snapshot fields, all labelled events and material facts survive. Nov 18 NBA largest share 33.33%→14.29%, U.S. 22.22%→12.50%; eight others unchanged.
- TASKS/RANKING updated. Semantic qualification, real observation/replacement-pool acceptance and Nov 12–16 comparison remain open; scheduled behavior unchanged.
- Verification: saved evaluator and scheduled-reader probe pass (five topics/25 stories/15 posts); pnpm build passes. Full check/deployment results follow; logs /tmp/3362-*.log.
- Next: Nov 22 daily/developing acceptance and three-edition miss-cause fix; complete event-budget acceptance; Sunday weekly publication acceptance.
- Final: pnpm format, pnpm lint:fix, pnpm check (1,379 unit; 341 integration passes/four expected skips), pnpm build and git diff --check pass. API/worker restart and final reader/health/alerts verified after push.

## 2026-11-21: iteration 3363 — qualified joint topic event review

- Clean main at 31ac5455; no inherited work. Healthz/alerts healthy; 38 monitored sources healthy, no failed digest jobs.
- Added evaluation-only orchestration using normal X/Reddit triage/shortlist and safe Bluesky qualification before one bounded joint editor request; no independent platform editor calls.
- Shared Bluesky editorial evidence mapper retains observation time/metrics/growth/media evidence; original snapshots and X preference preserved. Incomplete qualification refuses the preview; zero budgets/empty qualified pools avoid final editor calls.
- Targeted qualification/Bluesky tests pass 10/10 with scripted ports, zero external calls. Initial typecheck caught widened Bluesky platform literal; fixed with literal typing before full checks.
- TASKS/RANKING updated; scheduled behavior and handbook system behavior unchanged. No new reference labels/fixtures or paid calls.
- Verification/deployment results follow; logs /tmp/3363-*.log. Next: Nov 22 daily/developing acceptance and miss-cause fix; saved semantic event-budget comparison; Sunday weekly acceptance.
- Final: pnpm format/lint:fix/check pass (1,381 unit; 341 integration/four expected skips); pnpm build and git diff --check pass. Saved evaluator passes with zero external calls. API/worker restarted active, healthz/alerts healthy; reader probe initially raced startup, then verifies five topics/25 stories/15 posts. Push and final service restart follow.

## 2026-11-21: iteration 3364 — Reddit evidence for joint event review

- Clean main at 2d0bc6a4; no inherited work. Healthz/alerts healthy, 38 monitored sources healthy, no failed digest jobs; next daily Nov 22 15:00 UTC. Historical ingestion/social failures remain in queue counts with no current source alert.
- Joint qualification now supplies saved Reddit score, comment count, upvote ratio and observation time to the shared editor; preserves zero values, original snapshots and explicit unknown growth/media. Scheduled selection unchanged.
- Three scripted qualification tests pass, including all-platform evidence and zero metrics. Existing saved Nov 17–18 evaluator passes with zero provider calls; no new labels/fixtures or paid calls.
- TASKS/RANKING updated; handbook behavior unchanged. Full verification/deployment results follow in final line; logs /tmp/3364-*.log.
- Next: Nov 22 daily/developing acceptance and three-edition miss-cause fix; saved event-budget semantic acceptance/Nov 12–16 comparison; Sunday weekly acceptance.
- Final verification: pnpm format; pnpm lint:fix; pnpm check (1,382 unit passes, 341 integration passes/four expected skips); pnpm build; git diff --check pass. Saved evaluator and scheduled-reader probe pass (five topics/25 stories/15 posts). Push/restart and final health/alerts follow.

## 2026-11-21: iteration 3365 — search event budgets within platform limits

- Clean main at d1a2d2c2; no inherited work. Healthz/alerts healthy; sources check passes, no failed digest jobs; next daily Nov 22 15:00 UTC. Old ingestion/social failures remain in queue counts.
- Fixed opt-in event search to respect the existing X reservation while enumerating qualified alternatives, instead of rejecting an unconstrained optimum and overlooking feasible improvements. Existing event/fact guarantees and final wrapper refusal remain; scheduled selection unchanged.
- Added quota validation and feasible-alternative/fresh-cache regressions; 43 targeted tests pass. Initial regression expectations and editor API invocation corrected before final verification. No new semantic fixtures/labels or paid calls.
- TASKS/RANKING updated; handbook system behavior unchanged. Saved Nov 17–18 comparison passes with zero provider calls.
- Verification/deployment results follow; logs /tmp/3365-*.log. Next: Nov 22 daily/developing acceptance and miss-cause fix; complete saved event-budget acceptance; Sunday weekly acceptance.
- Final verification: pnpm format; pnpm lint:fix; pnpm check (1,384 unit passes; 341 integration passes/four expected skips); pnpm build; git diff --check pass. Saved evaluator and reader probe pass (five topics/25 stories/15 posts). Push/restart and final health/alerts follow.

## 2026-11-21: iteration 3366 — keep stronger joint shortlist alternatives

- Clean main at 6f43d48a; no inherited work. Healthz/alerts healthy; sources check passes.
- Fixed opt-in X/Reddit and cross-platform shortlist preparation: reserve required X choices, then rank remaining slots by qualification scores. Ten X candidates no longer hide stronger Reddit/Bluesky alternatives before review. Scheduled shortlist unchanged.
- Crowded-pool regression verifies both preparation stages, required X choices, one shared editor call, accepted snapshots and unchanged scheduled shortlisting; four qualification tests pass, zero external calls.
- TASKS/RANKING updated; archived progress through 3358 after exceeding 25 KB. No system behavior/handbook change or new labels/fixtures.
- Verification/deployment results follow; logs /tmp/3366-*.log. Next: Nov 22 scheduled acceptance/miss-cause fix, saved event-budget acceptance, Sunday weekly acceptance.
- Final: pnpm format; pnpm lint:fix; pnpm check (1,385 unit passes; 341 integration passes/four expected skips); pnpm build; git diff --check pass. Build initially caught optional platform typing; fixed using saved snapshot platform. Saved evaluator passes with zero external calls; dated reader probe confirms five topics/25 stories/15 posts. Push/restart/final health follow.

## 2026-11-21: iteration 3367 — preserve mixed-platform editor guidance

- Clean main at 8589ad78; no inherited work. Alerts zero; healthz database/Redis healthy. Nov 21 signed-out reader verifies five topics/25 stories/15 posts; next daily acceptance due Nov 22.
- Fixed mixed-platform review instructions: adding Bluesky no longer erases X/Reddit provenance or the existing X preference. Bluesky remains explicitly an API observation, not a fact-checked claim. Single-platform guidance and scheduled callers unchanged.
- Real-editor fresh/cache regression checks all three provenance statements and X preference; all 34 social-editor tests pass. Saved Nov 17–18 event comparison passes with zero external calls.
- TASKS/RANKING updated; no handbook behavior change, semantic labels, fixtures or paid calls. Reader probe with an unnecessary env-file flag failed before execution; ordinary existing local DB defaults pass.
- Full verification/deployment results follow; logs /tmp/3367-*.log. Next: Nov 22 daily/developing acceptance and miss-cause fix; event-budget real-pool acceptance/Nov 12–16 comparison; Sunday weekly acceptance.
- Final: pnpm format; pnpm lint:fix; pnpm check (1,385 unit passes; 341 integration passes/four expected skips); pnpm build; git diff --check pass. API/worker restarted active; healthz/alerts healthy, signed-out reader confirms five topics/25 stories/15 posts. Commit/push follow.

## 2026-11-21: iteration 3368 — reject scripted preview for deployment

- Clean main at 1d1c4978; no inherited work. Alerts zero, healthz healthy, all 38 sources healthy; digest queue has zero failures and Nov 21 signed-out reader passes (25 stories/15 posts).
- Re-ran saved joint-platform evaluation: two of ten Nov 17–18 topic-editions improve (NBA 33.33%→14.29%, U.S. 22.22%→12.50%); all 81 labelled topic-events/material facts survive; zero provider calls.
- Explicitly rejected current scripted preview for deployment; scripted labels/placeholder snapshots cannot establish real-pool semantic acceptance. Full item 69 remains open; Nov 12–16 shares unmeasured. Scheduled selection unchanged.
- TASKS/RANKING/comparison record decision and stop infrastructure-only preview extensions. No new reference fixtures, labels, paid calls or handbook behavior change.
- Verification/deployment results follow; logs /tmp/3368-*.log. Next: real saved-pool/missing-date acceptance evidence, Nov 22 daily/developing review and miss-cause fix; Sunday weekly acceptance.
- Final: pnpm format; pnpm lint:fix; pnpm check (1,385 unit passes; 341 integration passes/four expected skips); saved evaluator; handbook/schema checker; git diff --check pass. pnpm build passes. Push/restart and final health follow. Queue probes initially used an unknown name/private state filter; corrected public digest-generation counts pass.

## 2026-11-22: iteration 3369 — resolve event-budget input availability

- Clean main at ff60bfe4; no inherited changes. Alerts zero; healthz database/Redis healthy.
- Read-only live cache census: 22,369 entries, zero eventAnnotations/eventReview/eventBudgetPreview keys; parsed editor responses are stored directly. No real cached semantic acceptance output exists.
- Existing joint evaluator covers Nov 17–18 only; Nov 12–16 editions/social reviews do not supply complete joint labels. Missing shares remain unmeasured.
- Recorded concrete input blocker in comparison/TASKS/NEEDS_FROM_HUMAN; retain deployment rejection and stop repeat cache/infrastructure work without new inputs. No paid calls, new labels/fixtures or product changes.
- Signed-out scheduled reader passes Nov 21: five topics/25 stories/15 posts. Weekly Nov 22 gate correctly pending; daily/developing acceptance due 15:00 UTC.
- `pnpm console sources check` opened the interactive console without running a check; no source-check success claimed.
- Verification and deployment results follow. Next: Nov 22 daily/developing review, three-edition cause tally/fix, first Sunday weekly acceptance.
- Final: pnpm format; pnpm lint:fix; pnpm check (1,385 unit passes; 341 integration passes/four expected skips); pnpm build; handbook/schema checker; git diff --check pass. Logs /tmp/3369-*.log. Commit/push and API/worker restart/final health follow.

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
