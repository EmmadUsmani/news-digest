# Progress

[Iteration 1700 archive](docs/progress-archive/2026-11-10-iteration-1700.md).

[Iteration 1701 archive](docs/progress-archive/2026-11-10-iteration-1701.md).

## 2026-11-10: iteration 1702 — compose gated operations status API

- Clean main; no inherited work. `OperationsModule.prepare` validates public prerequisites before adapters open and installs exactly one status controller: unchanged private response or sanitized public response. Both share the existing status provider/lifecycle; alerts retain their own route.
- Added offline Nest HTTP composition tests with adapter stand-ins: private/public response selection, GET/HEAD, one reader call, alerts, mutation refusal, concealed dependency failures and invalid prerequisites. Four targeted composition/transport tests pass; no external services called.
- Updated TASKS, rollout review and operations handbook. Status authorization remains admin-only; public page is still uninstalled. Next: compose page selection and anonymous authorization together, then preview/tools.
- Verification: `pnpm format`, `pnpm lint:fix`, API/web builds, `pnpm exec tsx scripts/check-handbook.ts 08-operations` and `git diff --check` pass. First full check raced import autofix and stopped at lint; rerun after autofix passes typecheck/lint/format/boundaries, 813 unit and 277 integration tests/four expected skips.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` passes: four topics/19 stories/14 posts. `/healthz` database/Redis healthy, no failed user services, zero active alerts. GamingBolt incident remains open with bounded scheduled retries; no direct probe.
- No provider calls, live migrations, flag changes, deployments or service restarts during the 13:00–16:00 UTC hold. Public mode off; Phase 3 awaits normal 15:00 UTC edition and natural link expiry after Nov 11 00:33:01 UTC. Metrics sample becomes eligible at 14:34 UTC; no additional probe made this iteration.

## 2026-11-10: iteration 1703 — prepare overview page and loader selection

- Clean main; no inherited work. Prepared uninstalled `OperationsOverviewPage` and `loadOperationsOverview`: public mode selects the sanitized view/query before constructing any private reads; private mode preserves the existing overview/prefetches. Router and anonymous authorization installation remain next, then preview/tools.
- `pnpm exec tsx scripts/check-public-status-view.ts` passes offline: both loader branches, public-mode prefetch/rendering, private-cache isolation, loading/HTTP/schema failure/retry/stale states and no private requests. Updated desktop/mobile light/dark fixture screenshots; reviewed mobile light.
- `pnpm build` and saved-reader check for `2026-11-09T15:00:00Z` pass (four topics/19 stories/14 posts). `/healthz` database/Redis healthy; no failed user services, zero alerts. GamingBolt incident retains bounded retries; no direct probe. Metrics check not due before 14:34 UTC.
- Updated TASKS/rollout review; archived iteration 1625 to keep progress small. Initial lint caught mixed component/function exports; split loader into its own module and reran verification.
- No provider calls, live migrations, flags, deployments or restarts during 13:00–16:00 UTC hold. Uninstalled preparation leaves running app behavior unchanged; public mode off. Phase 3 awaits normal 15:00 UTC edition; natural link expiry after Nov 11 00:33:01 UTC.
- Final verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (813 unit passes; 277 integration passes/four expected skips), API/web builds, offline browser rehearsal, saved-reader check and `git diff --check` pass.

## 2026-11-10: iteration 1704 — authorize sanitized public status reads

- Clean main; no inherited work. Public route policy now permits exact status GET/HEAD against the sanitized controller selected in iteration 1702; private mode retains its existing guard/response. Other methods and unlisted subpaths remain refused.
- Extended offline Nest composition with public authorization and unavailable session storage: status reads bypass authentication, project the private ledger out, retain no-store and conceal dependency failures. Eight targeted composition/transport/policy tests pass. Full-application isolated coverage checks anonymous schema parity and HEAD even with a forged proxy identity.
- Updated TASKS, rollout review and operations handbook; archived iteration 1626 to keep progress small. Overview router/page integration remains next, then preview/tools. Public mode remains off.
- API/web builds, handbook check and saved-reader check pass: Nov 9 four topics/19 stories/14 posts. No UI rendering change.
- Health database/Redis good; no failed user services. RecentJobFailures corresponds to GamingBolt's scheduled 14:16/14:18/14:20 timeouts; bounded retries retained with no direct probe.
- No provider calls, live migrations, flag changes, deployment or restarts during the 13:00–16:00 UTC hold. Phase 3 awaits the normal 15:00 UTC edition; natural link expiry after Nov 11 00:33:01 UTC. Metrics sample becomes eligible at 14:34 UTC; no additional probe made this iteration.
- Initial full check found two obsolete admin-only status expectations in privacy/readiness tests; updated them to the sanitized public contract, and all five focused cases pass. The rerun passed static checks and all 813 unit tests; its integration run exposed a request-count assumption in the existing allowance-exhaustion test. Moved one status read to the separate content visitor, preserving the original ten-request budget.
- Final verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` static/unit stages and final `pnpm test:integration` pass (813 unit; 277 integration/four expected skips). API/web builds, `pnpm exec tsx scripts/check-handbook.ts 08-operations`, saved-reader check and `git diff --check` pass. No application code changed after these checks.

## 2026-11-10: iteration 1705 — integrate the gated overview router

- Clean main; no inherited work. Installed overview page/loader selection in the application router, using explicit default-off `VITE_PUBLIC_MODE`. Public mode bypasses private identity only for exact `/admin` and `/admin/`; public server GET/HEAD policy permits the same paths. Other pages retain their private guard.
- Offline `pnpm exec tsx scripts/check-public-status-view.ts` passes with the actual router: anonymous overview makes only the sanitized status read, Tools navigation is refused, and a fresh private-mode module graph restores identity refusal. Desktop/mobile light/dark fixture screenshots saved; mobile light reviewed. Existing query recovery/cache-isolation checks pass.
- Activation/rollback checklist now requires matching web-build/server mode flags. Updated operations handbook and rollout review; archived iterations 1686–1693 to keep PROGRESS small. Preview/tools remain next.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, four targeted public-policy tests, operations handbook check and Nov 9 saved-reader check pass (four topics/19 stories/14 posts). First full check raced import autofix and stopped at lint; final check follows completed autofix/browser cleanup.
- Health database/Redis healthy; no failed user services or active alerts. GamingBolt incident remains open under bounded scheduled retries; no direct source probe. Passive metrics sample 14:42 UTC: 23 healthy rules, zero new evaluator errors/misses, four queries ≤0.693 s, no merge. Next sample ≥15:43 UTC.
- No provider calls, live migrations, flag changes, deployment or service restarts during the 13:00–16:00 UTC hold. Public mode off; Phase 3 normal 15:00 UTC edition review takes precedence when due; natural link expiry after Nov 11 00:33:01 UTC.
- Final `pnpm check` passes static checks, 813 unit tests and 277 integration tests/four expected skips. `git diff --check` and final health/service checks pass. No application changes after verification; commit/push only, deployment remains held until after 16:00 UTC.

## 2026-11-10: iteration 1706 — prepare published-only preview reads

- Clean main; no inherited work. Added uninstalled `PublicPreviewReads` for history/latest/detail, always using published-only repository reads independent of private reader flags. Reuses reader contracts, excluding operational/editorial metadata; no generation code or storage changes.
- Adversarial offline tests pin mandatory publication filters, pagination rejection before storage, field omission, empty/latest/missing states, fixed storage/schema failures and unchanged admin route classification. Nine targeted preview/reader tests pass; no external calls.
- Updated TASKS and public-read rollout review (including stale overview completion row). Next: compose published preview reads without legacy overlap and adapt read-only admin UI; private snapshots/cost/jobs/writes remain restricted. Public mode off.
- `pnpm format`, `pnpm lint:fix`, API/web builds, Nov 9 saved-reader check (four topics/19 stories/14 posts) and `git diff --check` pass. Full `pnpm check` result recorded below.
- `/healthz` database/Redis healthy; no failed user services. Alert traced to GamingBolt scheduled attempts at 14:46/14:48/14:50 UTC; retain bounded retries, no direct probe or source changes. Metrics sample not due until 15:43 UTC.
- No provider calls, migrations, flags, deployment or restarts during 13:00–16:00 UTC hold. Phase 3 scheduled 15:00 UTC edition review takes precedence when published; natural link expiry remains after Nov 11 00:33:01 UTC.
- Final `pnpm check` passes static checks, 815 unit tests and 277 integration tests/four expected skips. Builds and final health pass. At 15:03 UTC Nov 10 reader check reports pending publication (Nov 9 still latest); review the normal scheduled edition first next iteration. Deployment/restart remains held until after 16:00 UTC.

## 2026-11-10: iteration 1707 — review the scheduled edition and NBA degradation

- Clean main; no inherited work. Nov 10 published as dbbf2d66-424c-4c74-ac11-59b04f6830a4: four topics, 19 stories, 15 posts; one attempt/220.195 s, mixed mode, 754 candidates/728 saved triage scores/zero unscored IDs.
- Anthropic $0.422356/52 settled calls, zero holds/unresolved/refusals. NBA story editing exhausted Sonnet unsupported-absence twice, Haiku invalid JSON then unsupported-absence. Social Sonnet invalid JSON twice recovered through Haiku. No rejected output is cached; no paid reconstruction or generation change.
- All 19 reader stories have text; NBA five summaries preserve source excerpts after boilerplate removal. No observed account failure or reason to roll back accounts. Phase 3 acceptance stays pending degraded-outcome assessment; natural link expiry remains after Nov 11 00:33:01 UTC.
- Daily X/Bluesky figures, saved-summary/evidence review, NBA replacement and zero exact-ID reuse versus Nov 7–9 recorded; destination checks remain open in docs/edition-reviews/2026-11-10.md; TASKS, SOURCES and NEEDS updated. Archived 1694–1695 to keep progress small.
- `check-scheduled-reader.ts 2026-11-10T15:00:00Z`, stored timing/X reports and 32 `check-live-account-boundary.ts` checks pass. Health database/Redis good; no failed user units or active alerts. GamingBolt remains stalled at 11:16 UTC under bounded scheduled retries; no direct probe.
- No provider calls, migrations, flags, deployment or restarts during the 13:00–16:00 UTC hold. Prepared application changes remain undeployed; this step changes documentation only.
- Final verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (815 unit; 277 integration/four expected skips), `pnpm build` and `git diff --check` pass. Final health good; no application edits. Commit/push only; deployment/restart remains held until after 16:00 UTC.

## 2026-11-10: iteration 1708 — verify saved social destinations

- Clean main; no inherited work. Four Nov 10 saved Bluesky cards pass desktop/mobile light/dark exact display text, original/expanded hrefs, nesting, overflow and page-error checks. Inspected mobile dark World card and desktop NBA screenshot; retained 24 screenshots.
- Added reusable GET-only `check-saved-bluesky-destinations.ts`; blocks all writes and third-party requests. Global News fire-update links retain full supplied destinations; other cards supply no inline URL. Article availability not tested.
- Repaired stale `verify-saved-posts.ts` original-link selector and saved display-text assertion. Live read-only rerun passes all 15 posts at both widths; X frames loaded 5/11 desktop and 8/11 mobile, others retain saved-text fallback; zero app/widget errors. No all-media-loaded claim.
- Phase 3 remains unaccepted: mixed NBA validation fallback fails the normal scheduled-edition gate. No account regression or rollback justification; public mode stays off. Next normal scheduled edition gates acceptance; default-off Phase 4 preview integration may proceed.
- `check-scheduled-reader.ts 2026-11-10T15:00:00Z` passes four topics/19 stories/15 posts. `/healthz` database/Redis healthy; no failed user units or active alerts. GamingBolt recovery remains open; no extra probe or metrics sample.
- No provider calls, migrations, flag changes, deployment or restarts during the 13:00–16:00 UTC hold. Only scripts/docs/screenshots changed; live application code unaffected. `pnpm format`, `pnpm lint:fix`, full `pnpm check` (815 unit; 277 integration/four expected skips), `pnpm build` and `git diff --check` pass. Archived 1696–1697.

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
