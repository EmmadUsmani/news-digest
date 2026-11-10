# Progress

[Iteration 1700 archive](docs/progress-archive/2026-11-10-iteration-1700.md).

[Iteration 1701 archive](docs/progress-archive/2026-11-10-iteration-1701.md).

[Iteration 1702 archive](docs/progress-archive/2026-11-10-iteration-1702.md).

[Iteration 1703 archive](docs/progress-archive/2026-11-10-iteration-1703.md).

[Iterations 1704–1708 archive](docs/progress-archive/2026-11-10-iterations-1704-1708.md).

## 2026-11-10: iteration 1709 — prepare published-preview HTTP transport

- Clean main; no inherited work. Added uninstalled default-off preview HTTP module for history/latest/UUID detail, delegating to mandatory published-only projections. No generation, storage or route-policy changes.
- Isolated HTTP checks cover GET/HEAD/no-store, pagination and UUID rejection before storage, generic dependency failures, absent costs/jobs/mutations and disabled-mode routes. Invalid flags fail before reader creation. Four preview unit/HTTP tests pass; no external calls.
- Updated TASKS and public-read rollout review. Next: replace overlapping legacy reads in public-mode composition, preserving admin-only cost/job/write routes, then adapt preview UI. Public mode remains off; Phase 3 awaits a normal scheduled edition.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` pass. Scheduled-reader check verifies Nov 10 four topics/19 stories/15 posts; health database/Redis good, no failed user units or active alerts. GamingBolt recovery remains open, no extra probe.
- No provider calls, migrations, flags, deployments or restarts during 13:00–16:00 UTC hold. Full check result recorded below.
- Final `pnpm check` passes static checks, 817 unit tests and 277 integration tests/four expected skips. Builds pass; final health good and no failed services. Commit/push only; deployment remains held until after 16:00 UTC.

## 2026-11-10: iteration 1710 — compose gated published preview reads

- Clean main; no inherited work. Public-mode digest composition now selects published-only history/latest/detail with no legacy read overlap, sharing the existing repository lifetime. Public mode remains off.
- Split private cost/job/generation handlers from legacy reads; default-off routes retain their responses. Compiled-Nest HTTP rehearsal verifies both selections, mandatory publication arguments and retained private handlers; transport checks pass. No UI change.
- Updated TASKS and rollout review; next adapt preview UI and run complete anonymous authorization rehearsal. Phase 3 still awaits a normal scheduled edition; natural link expiry after Nov 11 00:33:01 UTC. Archived 1698–1699.
- `pnpm build`, targeted preview HTTP/composition tests, `pnpm format`, `pnpm lint:fix` and `git diff --check` pass. Full `pnpm check` result below.
- Scheduled-reader check verifies Nov 10 four topics/19 stories/15 posts. Health database/Redis good; no failed user units or active alerts. GamingBolt recovery remains open under bounded scheduled retries; no direct probe.
- No provider calls, migrations, flag changes, deploys or restarts during 13:00–16:00 UTC hold. Commit/push only; deploy prepared main after 16:00 UTC.
- Final `pnpm check` passes static checks, 817 unit tests and 278 integration tests/four expected skips. Builds pass; final health good and no failed services. Deployment/restart remains held until after 16:00 UTC.

## 2026-11-10: iteration 1711 — prepare sanitized preview browser queries

- Clean main; no inherited work. Prepared uninstalled public latest/history/detail preview queries with reader contracts, separate public cache keys and no private fallback. Private pages and route authorization unchanged; public mode remains off.
- Offline query check verifies sanitized fields, nullable latest, invalid responses, HTTP 401/403/404/503 without fallback, encoded IDs and private-cache separation. Five targeted preview/query/HTTP tests pass. Fixed test fetch-argument lint error before full verification.
- Updated TASKS and rollout review. Next install read-only preview pages, then complete anonymous authorization rehearsal. Phase 3 awaits a normal scheduled edition; natural link expiry after Nov 11 00:33:01 UTC.
- Live GET-only scheduled-reader check passes four topics/19 stories/15 posts; health database/Redis good, no failed user units or active alerts. GamingBolt recovery remains open under scheduled bounded retries; no direct probe or extra metrics sample.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, targeted tests and `git diff --check` pass. Full `pnpm check` result follows.
- No provider calls, migrations, flag changes, deployment or restarts during the 13:00–16:00 UTC hold; prepared main remains undeployed until after 16:00 UTC.
- Final `pnpm check` passes static checks, 818 unit tests and 278 integration tests/four expected skips. Builds pass; final health good and no failed user services. Commit/push only; deployment/restart remains held until after 16:00 UTC.

## 2026-11-10: iteration 1712 — connect sanitized published preview history

- Clean main; no inherited changes. Public-mode edition list now uses isolated sanitized history queries, links to published reader editions and omits generation/cost/job/incoming-content reads. Private list unchanged; route guard unchanged and public mode remains off.
- Four offline Playwright desktop/mobile light/dark views pass pagination, empty history, failure/retry, restricted request set and overflow checks. Saved four screenshots; inspected mobile light and desktop dark views. Replay uses simulated public data and an admin identity, not live anonymous access.
- Next: latest/detail preview compatibility and complete anonymous authorization rehearsal. Phase 3 awaits a normal scheduled edition; GamingBolt recovery remains open under bounded scheduled retries.
- No provider calls, migrations, flag changes, deployments or service restarts during the 13:00–16:00 UTC hold. Deployment waits until the hold ends. Archived oldest progress entry to keep orientation small.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (818 unit, 278 integration/four expected skips), `pnpm build`, `pnpm exec tsx scripts/smoke-public-preview-history.ts` and `git diff --check` pass. `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verifies four topics/19 stories/15 posts. Initial non-TTY check interrupted; complete TTY rerun passes.
- Pushed `3a290ce0`; after 16:00 UTC restarted API/worker with `systemctl --user restart news-digest-api.service news-digest-worker.service`. Health/database/Redis and scheduled-reader checks pass, no failed user units or active alerts. Public mode remains off; no migration or provider call.

## 2026-11-10: iteration 1713 — connect sanitized published preview detail

- Clean main; no inherited work. Public-mode admin edition detail now reads only sanitized published preview data, shows topic briefs/counts and links to the full reader edition. Private inspector and route authorization unchanged; public mode stays off.
- Four offline Playwright desktop/mobile light/dark views pass restricted reads, empty topics and 401/403/404/503 recovery; failures hide stale content. Saved four screenshots and inspected mobile light/desktop dark. Simulated responses/admin identity, not live anonymous access.
- Updated TASKS and rollout review. Next: latest-preview compatibility, then complete anonymous authorization rehearsal. Phase 3 awaits a normal scheduled edition; natural link expiry after Nov 11 00:33:01 UTC. GamingBolt recovery remains open under scheduled retries.
- `pnpm format`, `pnpm lint:fix`, `pnpm exec tsx scripts/smoke-public-preview-detail.ts`, `git diff --check` and scheduled-reader check pass (four topics/19 stories/15 posts). Full check/build results and deployment follow below.
- Health/database/Redis good; no failed user services or active alerts. No provider calls, migrations or public flag changes.
- Final TTY `pnpm check` passes: 818 unit tests, 278 integration tests/four expected skips; build passes. Initial non-TTY run terminated during integration cleanup; complete TTY rerun exits zero. No code change required.
- Pushed `daa828f0`; restarted API/worker after 16:00 UTC. Immediate startup probes preceded listening; repeat health/database/Redis and scheduled-reader checks pass, no failed units. `RecentJobFailures` now fires for existing scheduled GamingBolt 20-second timeouts (journal confirms bounded retries); source incident remains open.

## 2026-11-10: iteration 1714 — connect latest published preview

- Clean main; no inherited changes. Public-mode published history now reads sanitized latest data with a published reader link, nullable latest handling and failure recovery that hides cached latest content. Private mode and existing route authorization unchanged; public mode stays off.
- Four offline Playwright desktop/mobile light/dark views pass restricted GETs, pagination, empty latest and 401/403/404/503 recovery. Updated screenshots; inspected mobile light and desktop dark. Simulated responses/admin identity, not live anonymous access.
- GamingBolt third scheduled retry timed out at 16:20 UTC; retain bounded retries and existing source incident. Health/database/Redis pass, no failed user services. Scheduled-reader check retains four topics/19 stories/15 posts.
- Updated TASKS, rollout review and operations handbook. Next: complete anonymous authorization rehearsal. Phase 3 awaits a normal scheduled edition; natural link expiry after Nov 11 00:33:01 UTC. No provider calls, migrations or flag changes.
- `pnpm format`, `pnpm lint:fix`, browser smoke, `check-handbook.ts 08-operations`, scheduled-reader check and `git diff --check` pass. Full check/build and deployment results follow.
- Final TTY `pnpm check` passes: 818 unit tests and 278 integration tests/four expected skips; `pnpm build` passes. Final format/lint-fix pass. Commit/push and post-16:00 service restart follow; no live migration or provider call.
- Pushed `a030f86d`; restarted API/worker after 16:00 UTC. Post-restart health/database/Redis and scheduled-reader checks pass (four topics/19 stories/15 posts), no failed user units; working tree clean before recording deployment.

## 2026-11-10: iteration 1715 — prepare anonymous published-preview access

- Clean main; no inherited work. Public-mode GET/HEAD now admits sanitized published-preview history/latest/detail and their history/UUID HTML pages. Public web guard admits these reviewed pages; private mode keeps its existing guard. Costs, jobs, generation and other admin pages remain restricted. Live public mode stays off.
- Disposable compiled-application HTTP coverage checks anonymous published-only history/latest/detail, no-store/empty HEADs, private-edition refusal, invalid pagination and restricted costs/jobs with forged proxy identity. Signed-out offline browser replays cover eight desktop/mobile light/dark views and new-edition/spend/tools refusals. Screenshots updated; inspected mobile history and desktop detail.
- Initial targeted tests pass (9); browser scripts, handbook check and scheduled-reader check pass (four topics/19 stories/15 posts). Full check/build and deployment results follow.
- Updated TASKS, rollout review, readiness checklist and operations handbook; archived iteration 1701 to keep orientation small. No provider calls, live migrations or flag changes. GamingBolt recovery remains open under bounded retries; health/database/Redis good and no active alerts or failed services at orientation.
- Next: remaining full Phase 4 rehearsal and tool review. Phase 3 still awaits a normal scheduled edition; natural link expiry after Nov 11 00:33:01 UTC.
- Final TTY `pnpm check` passes: 819 unit tests and 278 integration tests/four expected skips. `pnpm format`, `pnpm lint:fix`, both browser smokes, `check-handbook.ts 08-operations`, scheduled-reader check and `git diff --check` pass. `pnpm build` passes; post-push restart follows below.
- Pushed `ce79614d`; restarted API/worker with `systemctl --user restart news-digest-api.service news-digest-worker.service`. Post-restart health/database/Redis, scheduled-reader (four topics/19 stories/15 posts), no failed user units and zero active alerts pass. Public mode remains off; working tree clean before recording deployment.

## 2026-11-10: iteration 1716 — review internal-tool response producers

- Clean main; no inherited work. Health/database/Redis pass, no failed services and zero active alerts. GamingBolt incident remains open with bounded scheduled retries.
- Completed initial tool producer inventory in `docs/public-tool-response-review.md`. Grafana role grants expose unpublished snapshots/raw source errors; Bull Board read-only handlers retain payloads/results/stacks/logs/Redis details. Explorer account activity estimates, handbook image scope and shared proxy forwarding need reviewed boundaries before routing.
- Updated rollout/readiness and TASKS with concrete next work: prepare Grafana role/projections and isolated adversarial SQL checks. No runtime changes, provider calls, live migrations or role changes; public mode stays off. Phase 3 still awaits a normal scheduled edition.
- Live `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-10T15:00:00Z` passes: four topics/19 stories/15 posts. `pnpm build` passes. `pnpm format`, `pnpm lint:fix`, `pnpm check` (819 unit, 278 integration/four expected skips) and `git diff --check` pass. Commit/push and post-16:00 restart follow.
- Pushed `4dd52014`; restarted API/worker after 16:00 UTC. Post-restart health/database/Redis and scheduled reader (four topics/19 stories/15 posts) pass; no failed user units. Final alert snapshot has zero active alerts. Public mode remains off.

## 2026-11-10: iteration 1717 — prepare separate Grafana public reader

- Clean main; no inherited work. Health/database/Redis pass, no failed user services, zero active alerts. GamingBolt incident remains open under bounded scheduled retries.
- Prepared standalone, uninstalled SQL for a separate public Grafana role and security-barrier views: published UTC daily counts and bounded source health/error boolean. No raw snapshots, errors, ownership or account grants; private operational datasource unchanged.
- Added disposable SQL tests for idempotence, publication filtering, injected markers, account/session refusal, role escalation and write/schema-creation refusal. Public mode remains off; no live migration, role change or provider call.
- Updated tool review/readiness and observability handbook. Remaining dashboard aggregates, inherited function/catalog access, metrics labels and query-route review remain open. Phase 3 awaits next normal scheduled edition.
- Targeted disposable Postgres test passes after correcting fixture cleanup/window assumptions (immutable editions and strictly positive windows). `pnpm build`, handbook check and live scheduled-reader check pass (four topics/19 stories/15 posts). First full check: 819 unit tests pass; integration exposed the fixture cleanup error. Corrected full rerun and deployment results follow.
- Corrected full `pnpm check` passes: 819 unit tests, 279 integration tests/four expected skips. `pnpm format`, `pnpm lint:fix`, `pnpm build`, `check-handbook.ts 09-observability`, scheduled-reader check and `git diff --check` pass. Commit/push and post-16:00 UTC restart follow.
- Pushed `d1fa2842`; restarted API/worker after 16:00 UTC. Post-restart health/database/Redis and scheduled-reader checks pass (four topics/19 stories/15 posts), no failed user units and zero active alerts. Public mode off; prepared SQL remains unapplied.

## 2026-11-10: iteration 1718 — prepare published Grafana content totals

- Clean main; no inherited work. Health/database/Redis good, no failed user units or active alerts. GamingBolt recovery remains open under bounded scheduled retries.
- Added uninstalled security-barrier daily published topic/story/post counts. No text, topic names, ownership or edition IDs; malformed/missing arrays count as zero. SQL tests cover private markers, published text, exact totals/fields, empty content and withheld unpublished rows.
- Documented which private dashboard panels still require rewrites; updated readiness and observability handbook. Public flag stays off; no live migrations, role changes or provider calls. Phase 3 awaits next normal scheduled edition.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 09-observability` and live scheduled-reader check pass (four topics/19 stories/15 posts). Full check/deployment results follow.
- Next: remaining public dashboard aggregates, inherited function/catalog access and datasource/query-route review.
- Full `pnpm check` passes: 819 unit tests, 279 integration tests/four expected skips, including prepared Grafana SQL coverage. Build and handbook checks pass; `git diff --check` clean. Commit/push and API/worker restart follow; prepared SQL remains unapplied.

## 2026-11-10: iteration 1719 — prepare projection-only public Grafana overview

- Clean main; no inherited work. Health/database/Redis pass, no failed user services and zero active alerts. GamingBolt recovery remains open under bounded scheduled retries.
- Prepared a separate uninstalled three-panel public dashboard: daily published edition/content totals (latest 30 publication days) and aggregate current source health. Dedicated datasource UID is not provisioned; private operational dashboards unchanged.
- Disposable SQL coverage executes every exact panel query as the public role, checks bounded rows/output fields, known publication totals and private/error marker exclusion. Updated rollout/readiness and observability handbook.
- No runtime routes, live migrations, role changes or provider calls. Public mode remains off; Phase 3 awaits next normal scheduled edition. Isolated Grafana rendering/browser traces and datasource/catalog/function/query-route review remain before installation.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` (819 unit tests, 279 integration tests/four expected skips), `pnpm build`, `check-handbook.ts 09-observability`, scheduled-reader check (four topics/19 stories/15 posts) and `git diff --check` pass. Commit/push and post-16:00 API/worker restart follow.

## 2026-11-10: iteration 1720 — restore PC Gamer feed collection

- Clean main; health/database/Redis pass and initial alert snapshot has zero active alerts. GamingBolt recovered through scheduled retries at 17:17:58 UTC (10 items, 169 stored).
- Source triage caught PC Gamer exhausting three attempts: valid HTTP 200 RSS is 2,013,022 bytes, exceeding the old 2 MB cap. Raised shared HTTP wire/expanded bounds to 3 MB; preserved all other collection limits and sanitized size errors.
- Added offline identity/compressed acceptance above the former limit and refusal above the new wire/expanded bounds. Updated source/architecture docs. No provider calls, migration or public flag changes.
- Deliberately discarded this iteration's unfinished Grafana catalog/function test additions when the source failure took priority. Prior committed Grafana preparation remains intact; review remains open.
- Targeted `pnpm exec tsx --test apps/api/test/custom-feeds.test.ts` passes (3 tests). Explicit live SharedHttpClient/parseFeed check passes: 2,013,022 bytes, 50 items. Full checks and deployment follow.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` (819 unit, 279 integration/four expected skips), `pnpm build`, scheduled-reader check (four topics/19 stories/15 posts) and `git diff --check` pass. A later format check caught the newly archived progress file; targeted Prettier correction and `pnpm format:check` pass. No application checks failed. Commit/push and post-16:00 UTC restart follow.
