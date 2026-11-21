# Progress

Earlier entries: [through iteration 3300](docs/progress-archive/2026-11-21-through-3300.md).

## 2026-11-21: iteration 3348 — authorized paid matching acceptance

- Clean main at c9aa122a; no inherited changes. Health/database/Redis and zero alerts pass; no failed digest jobs. New owner item 73 overrides the old paid-replay/blocker interpretation.
- Existing request capture: eight requests, total conservative reservation $0.031672; today's spend $0.525356/no holds before dispatch, within $0.65. Did not rerun the accepted whole-edition preflight ($0.613774).
- One live matching run `developing-acceptance-3348`, configured Haiku/Anthropic and existing budgeted ledger/cache: eight calls, actual $0.009843. No repairs, retries, provider changes or cap changes. Temporary runner removed.
- All eight partitions contain valid, unique supplied references. Seven current stories link to twelve earlier occurrences; reviewed every current/earlier pair, no plainly wrong link. All twelve model pairs recorded in item 73 ack; no threshold change/cache rerun. Historical-only groups create no developing links.
- Removed obsolete human blocker; updated task and reader plan. This is substantive semantic acceptance, not a routine checkpoint. Production wiring remains unfinished; no developing publication claimed.
- Commands: pnpm obs alerts/jobs/sources; curl -fsS localhost:8000/healthz; prepare-developing-story-requests.ts; temporary opt-in LLM_LIVE runner; Python partition/pair assertions; pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts reader-features; check-scheduled-reader.ts 2026-11-21T15:00:00Z; git diff --check. Results below.
- Next: wire existing developing enrichment into scheduled publication and deploy outside 13:00–16:00; Nov 22 daily review/root-cause tally remain first when due. Item 69 event-budget build work is unrestricted by the labels-only daily commit limit.
- Final verification: pnpm check exits 0 (1,360 unit passes; 339 integration passes/four expected skips); build and handbook check pass (19 pages/40 tables). Live Nov 21 reader passes five topics/25 stories/15 posts; all 38 monitored sources healthy. No runtime behavior changed.

## 2026-11-21: iteration 3349 — scheduled developing-story enrichment

- Clean main at 232b5d95; no inherited changes. Zero alerts, healthy healthz/database/Redis, all 38 monitored sources healthy and no failed digest jobs.
- Connected existing all-topic enrichment after normal scheduled story/post selection. Uses original editor evidence, seven same-profile/topic published editions, configured Haiku matching/Sonnet rewrite and shared ledger/cache; no cap/provider changes or paid verification calls.
- Matching/rewrite refusal preserves original selections atomically; manual/private test editions skip enrichment. Saved IDs/order/source links and rationale retained; rewritten headlines refresh the topic brief.
- Added publication-path regressions for saved prose/earlier links, current source evidence, budget refusal and manual/private isolation. Existing synthetic harness only; no new semantic references or fixtures.
- Updated reader plan and owner pipeline page. Real Nov 22 developing links/prose/screenshots remain pending; no developing live-publication claim.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 04-edition-pipeline; check-scheduled-reader.ts 2026-11-21T15:00:00Z; pnpm obs alerts/jobs/sources; curl localhost:8000/healthz; git diff --check. Final results below.
- Direct targeted invocation was rejected by the isolation guard; verification uses disposable services. First full check caught enrichment of legacy integration-key private tests; fixed caller to use shared publication policy. Handbook length failure fixed by shortening the bullet.
- Next: Nov 22 daily review and three-edition miss-cause tally/fix first; developing reader acceptance, then Sunday weekly acceptance. Event-budget implementation remains open and authorized.
- Final pnpm check exits 0: 1,360 unit passes; 341 integration passes/four expected skips; all static checks pass. Build and handbook (19 pages/40 tables) pass. API/worker restarted active; health, Nov 21 local reader (five topics/25 stories/15 posts) and zero alerts pass. Public HTTPS remains unreachable from this VM (curl exit 7/status 000); no external HTTPS acceptance claimed. Logs /tmp/3349-*.log.

## 2026-11-21: iteration 3350 — event-budget deletion feasibility

- Clean main at 2c2071f1; no inherited changes. Zero alerts, healthy healthz/database/Redis, 38 monitored sources healthy and no failed digest jobs.
- Item 73 authorizes event-budget build work now. Both social routes already receive selected-story context; no extra prompt-only deployment made.
- Extended the existing offline evaluator to enumerate all 168 post subsets in existing Nov 17–18 labels, preserving stories, labelled events and every slot marked as adding material facts; 15 subsets admissible. No new labels/fixtures, provider calls or runtime selection changes.
- Only Nov 18 NBA (33.33%→14.29%) and U.S. (22.22%→12.50%) improve. Gaming cannot beat its original 30%; deleting WoW raises it to 33.33%. Nov 17 cannot improve by deletion; NBA provisional event membership unchanged.
- Rejected deletion-only implementation as a complete event budget, beyond the prior single manual-subset rejection. Candidate replacement and Nov 12–16/full-window replay remain open; no overall item 69 acceptance claimed. Updated TASKS/RANKING and existing comparison.
- Commands: pnpm obs alerts/jobs/sources; curl -fsS localhost:8000/healthz; pnpm exec tsx scripts/evaluate-saved-nba-event-breadth.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-scheduled-reader.ts 2026-11-21T15:00:00Z; git diff --check. Final results follow.
- Next: Nov 22 edition review and three-edition miss-cause fix first; developing reader acceptance; candidate-replacement event-budget build and Sunday weekly acceptance.
- Final verification: pnpm check exits 0 (1,360 units; 341 integrations/four expected skips), build and exhaustive evaluator pass; diff clean. API/worker restarted active and healthy; local Nov 21 reader passes five topics/25 stories/15 posts. No UI/runtime change or paid replay. Logs /tmp/3350-*.log.

## 2026-11-21: iteration 3351 — bounded event replacement planner

- Clean main at b50ced8e; no inherited changes. Zero alerts, healthy healthz/database/Redis, all 38 sources healthy and no failed digest jobs; next edition Nov 22 15:00 UTC.
- Added a domain planner over at most ten already-qualified annotated post candidates, with stories fixed. Exhaustively searches replacements/deletions within the post budget, preserving every original event and event-scoped material fact; changes picks only for a strictly lower largest-event share.
- Equal-share improving alternatives prefer more events, then retained original picks. No improvement preserves editor order. Rejects missing event labels, invalid budgets, duplicate/unknown IDs and unbounded searches.
- Existing Nov 17–18 evaluator checks planner shares against its independent 168-subset oracle; all ten topic results match. Six synthetic unit regressions test replacement and preservation, including combining facts into one post to free a different-event slot.
- No new reference labels/fixtures, model calls, prompt changes or production selection change. Candidate semantic annotations and Nov 12–18 real-selector/material-fact acceptance remain open; planner alone does not solve Gaming's saved 30% concentration. TASKS/RANKING updated; no owner handbook behavior changed.
- Commands: pnpm obs alerts/jobs/sources; curl localhost:8000/healthz; tsx --test apps/api/test/joint-event-budget.test.ts; evaluate-saved-nba-event-breadth.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-scheduled-reader.ts; git diff --check. Final results follow.
- Next: Nov 22 daily review/three-edition miss-cause fix first, developing reader acceptance; integrate evidence-backed replacement annotations and finish bounded event-budget comparison; Sunday weekly acceptance.
- Final verification: pnpm check exits 0 (1,366 unit passes; 341 integration passes/four expected skips); build, independent oracle and formatting/diff checks pass. API/worker restarted active; healthz, local scheduled reader (five topics/25 stories/15 posts) and zero alerts pass. Logs /tmp/3351-*.log. No paid replay or runtime selection change.

## 2026-11-21: iteration 3352 — evidence-bound event selection bridge

- Clean main at 96dc8f76; no inherited changes. Zero alerts, healthz healthy, all 38 sources healthy, no failed digest jobs; next edition Nov 22 15:00 UTC.
- Added a public bridge from complete editorial event/fact annotations to the bounded planner. Exact current-text excerpts required; missing, duplicate, unknown or stale reviews preserve baseline objects/order. Invalid caller selections still fail.
- Returns original qualified candidate objects so source metadata/rationale survive replacement. Exact excerpts bind text only, not semantic correctness or complete fact coverage; production remains unconnected.
- Existing ten Nov 17–18 comparisons now traverse the bridge and agree with planner/oracle; no new labels/fixtures or provider calls. Two regressions cover metadata identity, evidence refusal and invalid baseline handling.
- TASKS/RANKING updated. No owner handbook behavior changed. Nov 12–16 comparison, semantic replacement annotations and full acceptance remain open.
- Verification: targeted eight tests pass; existing saved evaluator passes; pnpm format; pnpm lint:fix. Full check/build and service verification results follow.
- Next: Nov 22 daily review/three-edition miss-cause fix, developing reader acceptance; finish real candidate event-budget comparison; Sunday weekly acceptance.
- Final: pnpm check exits 0 (1,368 unit passes; 341 integration passes/four expected skips); build, saved evaluator and diff checks pass. API/worker restarted active; startup probe initially raced readiness, retry healthz and Nov 21 local reader pass (five topics/25 stories/15 posts); zero alerts. Logs /tmp/3352-*.log.

## 2026-11-21: iteration 3353 — same-call semantic event review

- Clean main at 1e86cff8; no inherited changes. Zero alerts, healthy healthz/database/Redis, 38 monitored sources healthy and no failed digest jobs. Nov 22 scheduled review remains first when available.
- Added evaluation-only event/fact annotations to the existing social selection request, with no separate model call. Exact bounded per-item evidence, complete coverage, collision-safe story IDs and restored post aliases connect editor output to the existing evidence bridge.
- Invalid/missing reviews preserve valid original picks and return null without retry; cache reads revalidate evidence. Previously selected posts are refused in this mode because their unannotated slots would make review incomplete. Normal scheduled requests/picks and model/token caps unchanged.
- This is an annotation transport, not semantic acceptance or qualification of rejected replacements. No live model call, reference labels/fixtures or production event-budget change. TASKS/RANKING updated; no owner handbook behavior changed.
- Verification: social-editor targeted suite 29/29 and existing saved event evaluator pass; pnpm format/lint:fix; full check/build and service results follow. Logs /tmp/3353-*.log.
- Next: Nov 22 daily review/three-edition miss-cause fix and developing reader acceptance; finish real candidate event-budget comparison; Sunday weekly acceptance.
- Final: pnpm check exits 0 (1,370 unit passes; 341 integration passes/four expected skips); pnpm build and git diff --check pass. API/worker restarted active; healthz healthy, local Nov 21 scheduled reader verifies five topics/25 stories/15 posts; zero alerts. Reader's unnecessary explicit env-file attempt failed because that file is absent; normal configured invocation passes without reading secrets.

## 2026-11-21: iteration 3354 — independently qualified event-budget preview

- Clean main at 67845bbf; no inherited work. Zero alerts, healthy healthz/database/Redis, all 38 monitored sources healthy, no failed digest jobs; next edition Nov 22 15:00 UTC.
- Opt-in social event review now asks the same editor call for independently qualified alternatives, with normal rationale/context fields. Only those alternatives and original picks enter a bounded event/fact-preserving preview; annotations alone cannot qualify replacements.
- Strict unknown/duplicate IDs, date and absence-support checks reject bad qualification without retry or changing original picks. Empty qualification permits deletion-only evaluation; missing/invalid qualification returns null preview. Cache reads revalidate and long IDs restore correctly.
- Scripted targeted suite 30/30 passes, including valid replacement, unqualified exclusion, empty/missing qualification, unknown/repeated/original IDs, unsupported absence and cache reuse. Existing saved Nov 17–18 evaluator passes. These are offline checks, not semantic model acceptance.
- No paid calls, new labels/fixtures, scheduled selection changes or cap changes. TASKS/RANKING updated; no owner handbook behavior changed. Full saved Nov 12–18 semantic/material-fact comparison remains open.
- Commands: pnpm obs alerts/jobs/sources; curl localhost:8000/healthz; tsx --test apps/api/test/social-editor.test.ts; evaluate-saved-nba-event-breadth.ts; pnpm format; pnpm lint:fix; pnpm check. Final build/deployment results follow.
- Next: Nov 22 daily review/three-edition miss-cause fix and developing reader acceptance; finish saved event-budget comparison; Sunday weekly acceptance.
- Final: pnpm check exits 0 (1,371 unit passes; 341 integration passes/four expected skips); build, saved evaluator and git diff --check pass. API/worker restarted active; reader probe initially raced readiness, retry verifies Nov 21 five topics/25 stories/15 posts. Healthz healthy and zero alerts. Logs /tmp/3354-*.log.

## 2026-11-21: iteration 3355 — retain picks when event evidence is shortened

- Clean main at 1b0af0a5; no inherited changes. Zero alerts, healthz healthy, all 38 monitored sources healthy; no failed digest jobs, next edition Nov 22 15:00 UTC. Historical ingestion/social failures remain non-active with healthy collectors.
- Found that exact-excerpt annotations could permit replacing a baseline slot whose omitted text carries an unreviewed material fact. Preview now refuses if selected post or covered-story evidence was shortened.
- Story context propagates truncation metadata, including omitted stories; ordinary scheduled prompts/selection retain their bounds. Valid bounded annotations remain available, while refused previews retain original picks without retry.
- Regression covers selected-post/title/summary shortening, upstream shortening/omission, complete-text replacement, and cache completeness revalidation without additional calls. No new reference reviews, labels, fixtures or paid calls.
- TASKS/RANKING updated; no owner handbook behavior changed. Full saved Nov 12–18 comparison and deployment acceptance remain open.
- Verification: pnpm exec tsx --test apps/api/test/social-editor.test.ts (31/31); saved event evaluator; pnpm format; pnpm lint:fix; pnpm check (1,372 unit passes, 341 integration passes/four expected skips); pnpm build; git diff --check all pass. Logs /tmp/3355-*.log.
- Next: Nov 22 edition/miss-cause review and developing reader acceptance; finish event-budget saved comparison; Sunday weekly acceptance.
- Deployment: API/worker restarted active; curl localhost:8000/healthz healthy; check-scheduled-reader.ts 2026-11-21T15:00:00Z verifies five topics/25 stories/15 posts; pnpm obs alerts reports zero alerts.

## 2026-11-21: iteration 3356 — require complete replacement evidence

- Clean main at aa8c1aa5; no inherited work. Zero alerts, healthy healthz/database/Redis, all 38 sources healthy and no failed digest jobs; Nov 22 review remains pending.
- Opt-in event-budget preview now refuses shortened qualified replacements: an omitted trailing correction can reverse the visible development. Original picks and bounded annotations survive without retry; ordinary scheduled selection is unchanged.
- Expanded the existing regression with a correction beyond the 1,200-character bound and an exactly-at-boundary complete replacement; both fresh and cached outcomes pass without an extra provider call.
- No paid calls, new reference labels/fixtures or cap changes. TASKS/RANKING updated; older PROGRESS entries archived to keep the orientation file small. No owner handbook behavior changed.
- Verification: pnpm exec tsx --test apps/api/test/social-editor.test.ts (31/31); pnpm exec tsx scripts/evaluate-saved-nba-event-breadth.ts passes with unchanged saved comparisons. pnpm format/lint:fix/check and deployment results follow; logs /tmp/3356-*.log.
- Next: Nov 22 edition/miss-cause review and developing reader acceptance; full saved Nov 12–18 event-budget comparison and Sunday weekly acceptance remain open.
- Final: pnpm format, pnpm lint:fix, pnpm check (1,372 unit passes; 341 integration passes/four expected skips), pnpm build and git diff --check pass. API/worker restarted active; healthz retry passes, scheduled-reader probe verifies Nov 21 five topics/25 stories/15 posts, and alerts remain zero.

## 2026-11-21: iteration 3357 — measure event-budget previews through the editor

- Clean main at 3337d5ca; no inherited work. Zero alerts, healthy healthz/database/Redis, all 38 sources healthy; no failed digest jobs. Nov 22 edition/review remains pending.
- Extended the existing saved evaluator through SocialPostEditor, actual story-context bounds, wire aliases, validation and budget/cache wrapper. Ten Nov 17–18 topic-editions use existing labels and scripted responses only; each fresh/cache pair matches with one scripted call, no external calls.
- Actual editor preview improves zero of ten topic-editions. Four refuse shortened story evidence: Tech both days, Nov 18 NBA/U.S. All 81 labelled topic-events and retained-fact slots survive.
- Nov 18 NBA stays 3/9 (33.33%), U.S. stays 2/9 (22.22%); planner-only 1/7 and 1/8 gains are unavailable through this bounded editor path. Reject this published-picks-only version as a deployment candidate, not the entire item 69 proposal.
- TASKS/RANKING/comparison updated. Full Nov 12–16 comparison, semantic annotations, complete comparison evidence and qualified alternatives remain open; no new fixtures, paid calls or scheduled-selection changes. No owner handbook behavior changed.
- Verification: saved evaluator fresh/cache assertions pass; pnpm format/lint:fix/check/build and deployment results follow in final line. Logs /tmp/3357-*.log.
- Next: Nov 22 daily review/three-edition miss-cause fix and developing reader acceptance; event-budget evidence/qualification work; Sunday weekly acceptance.
- Final: pnpm format, pnpm lint:fix, pnpm check (1,372 unit passes; 341 integration passes/four expected skips), pnpm build and git diff --check pass. Saved evaluator passes ten fresh/cache replays; reader verifies Nov 21 five topics/25 stories/15 posts. API/worker restart and final health/alerts are checked after push.

## 2026-11-21: iteration 3358 — complete bounded story comparison evidence

- Clean main at fe9d7d3f; no inherited work. Zero alerts, healthz healthy, all 38 monitored sources healthy; digest queue zero failed/active, next run Nov 22 15:00 UTC.
- Added opt-in 1,200-character complete-summary context for event reviews. Ordinary scheduled prompts remain at 400; overflow/upstream shortening still refuses previews. No paid calls, new labels, fixtures or scheduled selection changes.
- Ten Nov 17–18 fresh/cache scripted editor replays now refuse none and match the exhaustive fact-preserving oracle. Nov 18 NBA largest-event share 33.33%→14.29%, U.S. 22.22%→12.50%; eight others unchanged. All 81 labelled events/retained facts survive.
- Regressions cover expanded summary transport, overflow refusal, upstream truncation and cache consistency. TASKS/RANKING/comparison updated; owner handbook behavior unchanged.
- Verification: targeted social editor/context tests 33/33; saved evaluator passes twenty fresh/cache comparisons (bounded plus expanded), zero external calls; pnpm format, pnpm lint:fix, pnpm build pass. Full check/deployment results below. Logs /tmp/3358-*.log.
- Next: Nov 22 daily/developing acceptance and miss-cause fix; event-budget semantic annotations/qualified alternatives/Nov 12–16 comparison; Sunday weekly acceptance.
- Final: pnpm check passes (1,373 unit, 341 integration/four expected skips), build and diff checks pass. API/worker restarted active; healthz healthy, Nov 21 reader probe passes five topics/25 stories/15 posts, final alerts zero.

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
