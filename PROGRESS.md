# Progress

[Iterations 1696–1697 archive](docs/progress-archive/2026-11-10-iterations-1696-1697.md).

[Iterations 1694–1695 archive](docs/progress-archive/2026-11-10-iterations-1694-1695.md).

[Iterations 1686–1693 archive](docs/progress-archive/2026-11-10-iterations-1686-1693.md).

[Iteration 1626 archive](docs/progress-archive/2026-11-10-iteration-1626.md).

[Iteration 1625 archive](docs/progress-archive/2026-11-10-iterations-1625.md).

Earlier entries: [iterations 1623–1624](docs/progress-archive/2026-11-10-1701.md); [iterations 1617–1622](docs/progress-archive/2026-11-10-1694.md); [iteration 1616 and follow-up](docs/progress-archive/2026-11-10-1687.md); [iterations 1614–1615](docs/progress-archive/2026-11-10-1625.md); [iterations 1612–1613](docs/progress-archive/2026-11-10-1623.md); [iterations 1610–1611](docs/progress-archive/2026-11-10-1622.md); [iterations 1608–1609](docs/progress-archive/2026-11-10-1621.md); [iteration 1607](docs/progress-archive/2026-11-10-1620.md); [iterations 1605–1606](docs/progress-archive/2026-11-10-1619.md); [iteration 1604](docs/progress-archive/2026-11-10-1618.md); [iteration 1603](docs/progress-archive/2026-11-10-1616-follow-up.md); [iteration 1602](docs/progress-archive/2026-11-10-1616.md); [iteration 1601](docs/progress-archive/2026-11-10-1615.md); [iteration 1600](docs/progress-archive/2026-11-10-1614.md); [iteration 1599](docs/progress-archive/2026-11-10-1613.md); [iteration 1598](docs/progress-archive/2026-11-10-1611.md); [iteration 1597](docs/progress-archive/2026-11-10-1610.md); [iteration 1596](docs/progress-archive/2026-11-10-1608.md); [iteration 1595](docs/progress-archive/2026-11-10-1607.md); [iteration 1594](docs/progress-archive/2026-11-10-1606.md); [iteration 1593](docs/progress-archive/2026-11-10-1605.md); [iteration 1592](docs/progress-archive/2026-11-10-1604.md); [iteration 1591](docs/progress-archive/2026-11-10-1603.md); [iteration 1590](docs/progress-archive/2026-11-10-1602.md); [iteration 1589](docs/progress-archive/2026-11-10-1601.md); [iteration 1588](docs/progress-archive/2026-11-10-1600.md); [iteration 1587](docs/progress-archive/2026-11-10-1599.md); [iteration 1586](docs/progress-archive/2026-11-10-1598.md); [iterations 1584–1585](docs/progress-archive/2026-11-10-1597.md); [iteration 1583](docs/progress-archive/2026-11-10-1596.md); [iterations 1580–1582](docs/progress-archive/2026-11-09-1594.md); [iterations 1577–1579](docs/progress-archive/2026-11-09-1592.md); [iterations 1570–1576](docs/progress-archive/2026-11-09-1589.md); [iterations 1567–1569](docs/progress-archive/2026-11-09-1581.md); [iterations 1564–1566](docs/progress-archive/2026-11-09-1578.md); [iterations 1560–1563](docs/progress-archive/2026-11-09-1574.md); [iterations 1552–1559](docs/progress-archive/2026-11-09-1568.md); [iterations 1550–1551](docs/progress-archive/2026-11-09-1564.md); [iterations 1548–1549](docs/progress-archive/2026-11-09-1562.md); [through iteration 1547](docs/progress-archive/2026-11-09-1557.md); [through iteration 1539](docs/progress-archive/2026-11-09-1548.md).

## 2026-11-10: iteration 1698 — prepare public production budget totals

- Clean main; no inherited work. Extended the uninstalled status projection with explicit production-only Anthropic/X budget schemas: UTC day/month charges, unresolved holds, caps and available allowance; X retains its blocked boolean.
- Private call history, model/purpose details, provider errors, reserve outcomes, development pools and future fields stay excluded. Missing summaries remain absent; malformed supplied totals fail with generic 503. Adversarial unit and isolated HTTP checks pass.
- Updated rollout review/TASKS: existing status UI requires private runs/errors/ledger/development fields; next is a separate public contract/rendering before composition, then preview/tools. Public mode remains off; Phase 3 awaits normal 15:00 UTC edition.
- Verification: `pnpm format`, `pnpm lint:fix`, targeted status tests (5 passes), `pnpm check` (810 unit passes; 277 integration passes/four expected skips), `pnpm --filter @digest/api build`, `git diff --check` pass. Saved-reader check verifies four topics/19 stories/14 posts; health database/Redis healthy, no failed user services.
- Alert triage: RecentJobFailures is the existing GamingBolt incident; scheduled 13:16–13:20 UTC attempts timed out three times. Retained bounded retries; no direct source probe or configuration change.
- No live provider calls, migrations, flags, deployment or restart during 13:00–16:00 UTC freeze; uninstalled additions leave running application behavior unchanged. Natural link expiry remains after Nov 11 00:33:01 UTC.

## 2026-11-10: iteration 1699 — share the public status wire contract

- Clean main; no inherited work. Added `PublicOperationsStatus` and its independent runtime schema to shared contracts. The uninstalled API projection derives its retained fields from this schema and converts private stored errors into `hasError`.
- Round-trip checks reject private source shapes/malformed booleans, counts and budget summaries; nested private errors, URLs, job runs and development fields are stripped. No UI query/rendering or application composition enabled; next is public status rendering, then preview/tools.
- Verification: `pnpm format`, `pnpm lint:fix`, six targeted status/HTTP tests, API and web builds pass. Full `pnpm check` passes (811 unit passes; 277 integration passes/four expected skips); `git diff --check` passes. Saved-reader check verifies four topics/19 stories/14 posts; `/healthz` database/Redis healthy, no failed user services, zero active alerts.
- `sample-metrics-recovery.ts 1 2` at 13:33 UTC: 23 healthy rules, four queries ≤0.091 s, zero new evaluator errors/misses/timeouts/slow queries; no merge in short interval. Next probe ≥14:34 UTC; compaction recovery stays open.
- GamingBolt incident remains open with bounded scheduled retries. No provider calls, live migrations, flag changes or service restarts during 13:00–16:00 UTC hold. Public mode off; Phase 3 awaits 15:00 UTC edition and natural link expiry after Nov 11 00:33:01 UTC.

## 2026-11-10: iteration 1700 — prepare public status rendering

- Clean main; no inherited work. Added uninstalled `PublicStatus`, consuming only the public wire contract: source health/counts/timestamps, queue availability/counts, topic coverage and production budget totals/holds. Missing summaries and empty lists show explicit unavailable states; no private queries or mutation controls.
- Offline `pnpm exec tsx scripts/check-public-status-view.ts` passes: healthy/failed sources, blocked X budget, coverage, empty sections, no controls, no horizontal overflow or browser errors. Desktop/mobile light/dark fixture screenshots saved under `docs/screenshots/ui/public-status-fixture-*`; reviewed desktop dark/mobile light.
- Verification: `pnpm format`, `pnpm lint:fix`, API/web builds and `git diff --check` pass. `pnpm check` passed typecheck/lint/format/boundaries and 811 unit tests, then ended with signal 143 during integration; separate `pnpm test:integration` completed with 277 passes/four expected skips, zero failures.
- Saved scheduled-reader check passes: four topics/19 stories/14 posts. `/healthz` database/Redis healthy; no failed user services; zero active alerts at orientation. GamingBolt incident retains bounded retries; no additional source probe.
- Updated TASKS/rollout review. Next: gated public status route/query/view composition, then preview/tools. Public mode off; Phase 3 awaits normal 15:00 UTC edition; natural link expiry after Nov 11 00:33:01 UTC.
- No provider calls, live migrations, flags, deployments or service restarts during 13:00–16:00 UTC hold. Uninstalled view leaves running application behavior unchanged. Metrics check not due before 14:34 UTC.

## 2026-11-10: iteration 1701 — prepare query-backed public status page

- Clean main; no inherited work. Composed the public query/view in uninstalled `PublicStatusPage`: independent public schema/cache, minute refresh, manual retry, loading state and explicit stale-data warning after failed refreshes. No private fallback or additional endpoint reads.
- `pnpm exec tsx scripts/check-public-status-view.ts` passes offline: pending/503/malformed response/recovery/stale data and seeded private-cache isolation; desktop/mobile light/dark screenshots saved as `public-status-page-fixture-*`. Reviewed mobile light/desktop dark. Fixtures remain explicitly labelled.
- API/web builds and `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` pass (four topics/19 stories/14 posts). `pnpm format` and `pnpm lint:fix` pass; `pnpm check` passes typecheck/lint/format/boundaries, 811 unit and 277 integration tests/four expected skips. `git diff --check` passes.
- `/healthz` database/Redis healthy; no failed user services. RecentJobFailures matches existing GamingBolt scheduled failures at 13:46/13:48/13:50 UTC; bounded retries retained, no direct probe. Metrics sample becomes eligible at 14:34 UTC; no additional probe made this iteration.
- Updated TASKS/rollout review; archived iterations 1623–1624 to keep progress small. Next: gated status API/page authorization composition, then preview/tools; Phase 3 awaits normal 15:00 UTC edition and natural link expiry after Nov 11 00:33:01 UTC.
- No provider calls, live migrations, flags, deployments or restarts during the 13:00–16:00 UTC hold. Prepared components remain uninstalled; running app behavior unchanged.

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
