# Progress

Earlier entries: [through iteration 3182](docs/progress-archive/2026-11-21-through-3182.md).

## 2026-11-21: iteration 3183 — public weekly reader API

- Clean main at abff786b; no inherited work. Zero alerts, healthy health/database/Redis and all active sources; no failed digest jobs. Nov 21 review awaits 15:00 UTC.
- Added public weekly history and UUID detail endpoints, explicitly scoped to null-profile publications. Strict response contracts expose weekly summaries, quiet topics and saved daily coverage links while removing profile, model, opaque references and evidence text. Daily latest/history remain separate.
- Shared the existing PostgreSQL daily input repository through a Nest alias; weekly reads use the saved publication adapter. No generation trigger, scheduled jobs, paid calls or fabricated live weekly content.
- Added projection/scope, admission and real Nest HTTP regressions for UUIDs, offset bounds, missing IDs, HEAD, no-store and unsupported writes. Three targeted tests pass. Updated reader plan and affected pipeline handbook; UI and Sunday scheduling remain unfinished.
- Commands: pnpm format; pnpm lint:fix; pnpm build; pnpm check; pnpm exec tsx --test apps/api/test/reader-weekly.test.ts; pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline; pnpm obs alerts/sources/jobs; git diff --check. Full-check and restart results follow.
- Build/typecheck and handbook pass (19 pages/one unchanged diagram/40 tables); logs /tmp/3183-{check,build,target,handbook,sources,jobs}.log.
- Next: Nov 21/22 reviews first, then weekly reader UI/history labels and Sunday scheduling. Developing remains blocked/disabled.
- Final pnpm check passes: 1,353 units, 338 integrations/four expected skips; all static checks green. API/worker restarted active; health/database/Redis, Nov 20 daily reader and zero alerts pass. Weekly live local history is empty, missing UUID 404 and invalid offset 400 using the existing reader-check visitor header; bare requests correctly fail visitor admission (429). External hostname connection from VM failed; no external verification claimed.

## 2026-11-21: iteration 3184 — weekly reader pages

- Clean main at 36387361; no inherited work. Zero alerts, healthy health/database/Redis and active sources; no failed digest jobs. Nov 21 review awaits 15:00 UTC.
- Added “Week in review” link in Past editions, separate paginated weekly history and UUID detail pages with saved summaries, quiet topics and daily coverage links. Daily home/latest remains unchanged; posts link to the daily topic’s posts section because saved weekly post references lack platform identity.
- Added explicit GET/HEAD admission for both reader routes, including malformed-path/write denials. Browser reload caught the missing route policy before completion; repaired and targeted policy tests pass.
- Live weekly history is empty: no weekly publication or AI call was triggered. Synthetic detail responses are labelled in screenshots and smoke script; they are not live editions. Scheduling and developing acceptance remain unfinished.
- Browser checks pass: 390/1440 light/dark, empty live history, synthetic summaries/daily links/quiet topic, pagination, keyboard entry, 404, no overflow or browser errors. Eight screenshots under docs/screenshots/ui/weekly-{live-history,synthetic-detail}-*; mobile light and desktop dark inspected.
- Updated TASKS, reader plan and affected pipeline handbook. No schema or diagram change.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; targeted API/web builds; pnpm exec tsx --test apps/api/test/public-route-policy.test.ts; pnpm exec tsx scripts/smoke-reader-weekly.ts; pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; pnpm obs alerts/sources/jobs; git diff --check.
- Build, handbook (19 pages/one unchanged diagram/40 tables), policy tests and live Nov 20 reader (9c810e64, five topics/25 stories/20 posts) pass. Logs: /tmp/3184-*.log. Full-check static stages and 1,353 units pass; combined process ended 143 during integrations. Separate pnpm test:integration exits 0: 338 pass/four expected skips; final web typecheck and lint:fix pass.
- Next: Nov 21/22 scheduled reviews first, then weekly Sunday scheduling. Developing remains blocked/disabled; no paid calls.
- Final API/worker restart active; health/database/Redis, live Nov 20 reader and zero alerts pass. No schema changes, generation triggers or paid calls.

## 2026-11-21: iteration 3185 — weekly scheduled admission

- Clean main at 722ef363; no inherited work. Zero alerts, health/database/Redis pass, active sources returning data and no failed digest jobs. Nov 21 daily review awaits 15:00 UTC.
- Added scheduled weekly runner and Sunday 17:00 UTC schedule definition. Original queue timestamps pin public scope, coverage and retry keys; invalid/future/non-Sunday slots refuse dispatch, recovery over six hours late skips generation.
- Missing Sunday daily or refused editing throws a retryable failure; storage errors propagate. Existing immutable publication workflow owns prerequisite checks and saved retries. Queue registration/lifecycle remain unconnected; no automatic or paid calls.
- Three targeted regressions pass, including six-hour boundary, delayed attempts, stable keys, public scope and refusal/storage failure. Updated reader plan and TASKS; no runtime service, schema or diagram change.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx --test apps/api/test/scheduled-weekly-review.test.ts; pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; pnpm obs alerts/sources/jobs; git diff --check.
- Build, handbook (19 pages/one unchanged diagram/40 tables) and live Nov 20 reader (five topics/25 stories/20 posts) pass. Full check and final restart results follow; logs /tmp/3185-*.log.
- Next: Nov 21/22 scheduled reviews first, then weekly queue registration/worker lifecycle. Developing remains blocked/disabled.
- Final pnpm check exits 0: 1,356 units and 338 integrations/four expected skips; all static checks pass. Fixed new test registration lint declarations and exposed shared slot policy through the profiles public boundary after initial failures. Rebuild passes; no paid calls. API/worker restart and final reader/health checks follow.

## 2026-11-21: iteration 3186 — weekly queue registration

- Clean main at 8db63ffc; no inherited work. Zero alerts, health/database/Redis pass, all 38 sources healthy and no failed digest jobs. Nov 21 review awaits 15:00 UTC.
- Registered public weekly generation on the existing single-concurrency digest queue for Sundays at 17:00 UTC. Three attempts use five-minute exponential backoff; completed/failed retention stays at 100. Daily, on-demand and weekly work share one execution slot.
- Dispatch uses the original scheduler timestamp, fresh publication UUID and stable retry key; enabled shared topics feed the existing lazy budgeted editor/storage. Ten-minute execution deadline and worker-draining shutdown include weekly resources. No new provider, cap, queue or schema.
- Added queue-dispatch regression and isolated Redis registration coverage; four focused tests pass. First live weekly publication still awaits Sunday acceptance; no manual generation or paid replay.
- Updated reader plan, pipeline/jobs handbook and TASKS. Archived older PROGRESS entries through 3182 after crossing 25 KB. Initial check caught import order (autofixed); initial handbook check caught page length (condensed into existing schedule table).
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx --test apps/api/test/scheduled-weekly-review.test.ts; pnpm exec tsx scripts/check-handbook.ts 03-jobs-and-schedules / 04-edition-pipeline; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; pnpm obs alerts/sources/jobs; git diff --check.
- Final pnpm check exits 0: 1,357 units and 339 integrations/four expected skips; all static stages pass. Build, both handbook checks (19 pages/40 tables) and live Nov 20 reader (five topics/25 stories/20 posts) pass; logs /tmp/3186-*.log.
- API/worker restarted active; health/database/Redis and zero alerts pass. Redis confirms weekly next slot 2026-11-22T17:00:00Z and daily 2026-11-21T15:00:00Z. No generation triggered.
- Next: Nov 21/22 edition reviews first, then first scheduled weekly acceptance. Developing remains blocked/disabled.

## 2026-11-21: iteration 3187 — weekly reader acceptance command

- Clean main at c12f3504; no inherited work. Health/database/Redis, zero alerts, 38 healthy sources and no failed digest jobs; Nov 21 review awaits 15:00 UTC.
- Added read-only signed-out weekly acceptance command with paginated history lookup, exact Sunday/seven-day bounds, summary limits, daily story/post membership, topic/window checks, reused-coverage refusal and daily-latest isolation. No generation or paid calls.
- Three offline regressions pass. Synthetic HTTP exercise passes paginated success and broken daily-topic refusal; synthetic weekly responses are not live publications. Real Nov 22 history is empty and correctly exits 2 (pending).
- Updated TASKS and operations command table; no runtime, UI, schema or diagram change. Initial handbook length failure fixed by removing a surplus blank line.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx --test apps/api/test/weekly-reader-gate.test.ts; pnpm exec tsx scripts/check-handbook.ts 08-operations; pnpm exec tsx scripts/check-weekly-reader.ts 2026-11-22T17:00:00Z; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; pnpm obs alerts/sources/jobs; git diff --check.
- Build, handbook (19 pages/40 tables), live local Nov 20 daily (five topics/25 stories/20 posts) pass. Public HTTPS unreachable from this VM (curl connection refused; Node fetch fails); no public HTTPS acceptance claimed. Logs /tmp/3187-*.log.
- Next: Nov 21/22 daily reviews, then run weekly command after Sunday 17:00 publication and inspect real summaries/browser screenshots. Developing remains blocked/disabled; today's item 69 evaluation commit already used.
- Final pnpm check exits 0: 1,360 unit tests and 339 integrations/four expected skips; all static checks pass. API/worker restarted active; post-restart health, zero alerts, local daily reader and pending weekly checks pass.

## 2026-11-21: iteration 3300 — Nov 21 recovery and missed-event review

- Clean main at 29997312; no inherited work. Zero alerts, healthy database/Redis and all 38 sources; no failed digest jobs.
- Scheduled edition 61c32e18 published 15:03:22.911 UTC: 25 AI stories/15 posts. Tech/Gaming v16 Sonnet recovery accepted; NBA/World Sonnet and U.S. Haiku pass; two U.S. Bluesky posts; World/U.S. story IDs disjoint.
- Frozen ten-feed capture contains 176 observations; all partitioned into 74 important references and 102 exclusions, producing 53 topic-events. Recall: Tech 3/13, NBA 4/11, Gaming 3/6, World 2/11, U.S. 1/12 (13/53 overall).
- 40 misses: nine collection gaps, 24 not shortlisted, seven shortlisted/unpublished. Existing grouping/ownership membership and immutable editor candidate/evidence routes checked with manual assertions. Review and incident recovery updated in this commit.
- Commands: pnpm obs alerts/sources/jobs; curl -fsS localhost:8000/healthz; existing capture-reference-stories.ts and trace-reference-stories.ts; check-scheduled-reader.ts with all five --require-ai-topic names; python3 /tmp/3300-review.py (53 events, 74 important references/102 exclusions; all routes pass); pnpm format; pnpm lint:fix; pnpm check; pnpm build (web publisher interrupted before live switch); pnpm --filter @digest/web exec vite build --outDir /tmp/3300-web-build; git diff --check. Final results follow.
- No provider calls, scoring changes, reference tooling, UI/runtime changes or deployments during the protected 13:00–16:00 window. Existing live code already matches main; documentation does not require service restart.
- Next: Nov 22 review, then three-day cause tally/root fix; Sunday 17:00 weekly acceptance. Developing cache gate blocked, item 69 daily allowance already used, weekly runtime work complete pending real publication.
- Final pnpm check exits 0: 1,360 units and 339 integrations/four expected skips; static checks pass. API/contracts/docs builds and isolated web build pass; normal web publisher stopped before its live switch (exit 143), abandoned stage removed, original live release confirmed unchanged. Health/reader/alerts pass; HTTPS connection refused from VM. No restart needed for documentation-only commit.

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
