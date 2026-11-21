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
