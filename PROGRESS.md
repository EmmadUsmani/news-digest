# Progress

Earlier entries: [iterations 1617–1622](docs/progress-archive/2026-11-10-1694.md); [iteration 1616 and follow-up](docs/progress-archive/2026-11-10-1687.md); [iterations 1614–1615](docs/progress-archive/2026-11-10-1625.md); [iterations 1612–1613](docs/progress-archive/2026-11-10-1623.md); [iterations 1610–1611](docs/progress-archive/2026-11-10-1622.md); [iterations 1608–1609](docs/progress-archive/2026-11-10-1621.md); [iteration 1607](docs/progress-archive/2026-11-10-1620.md); [iterations 1605–1606](docs/progress-archive/2026-11-10-1619.md); [iteration 1604](docs/progress-archive/2026-11-10-1618.md); [iteration 1603](docs/progress-archive/2026-11-10-1616-follow-up.md); [iteration 1602](docs/progress-archive/2026-11-10-1616.md); [iteration 1601](docs/progress-archive/2026-11-10-1615.md); [iteration 1600](docs/progress-archive/2026-11-10-1614.md); [iteration 1599](docs/progress-archive/2026-11-10-1613.md); [iteration 1598](docs/progress-archive/2026-11-10-1611.md); [iteration 1597](docs/progress-archive/2026-11-10-1610.md); [iteration 1596](docs/progress-archive/2026-11-10-1608.md); [iteration 1595](docs/progress-archive/2026-11-10-1607.md); [iteration 1594](docs/progress-archive/2026-11-10-1606.md); [iteration 1593](docs/progress-archive/2026-11-10-1605.md); [iteration 1592](docs/progress-archive/2026-11-10-1604.md); [iteration 1591](docs/progress-archive/2026-11-10-1603.md); [iteration 1590](docs/progress-archive/2026-11-10-1602.md); [iteration 1589](docs/progress-archive/2026-11-10-1601.md); [iteration 1588](docs/progress-archive/2026-11-10-1600.md); [iteration 1587](docs/progress-archive/2026-11-10-1599.md); [iteration 1586](docs/progress-archive/2026-11-10-1598.md); [iterations 1584–1585](docs/progress-archive/2026-11-10-1597.md); [iteration 1583](docs/progress-archive/2026-11-10-1596.md); [iterations 1580–1582](docs/progress-archive/2026-11-09-1594.md); [iterations 1577–1579](docs/progress-archive/2026-11-09-1592.md); [iterations 1570–1576](docs/progress-archive/2026-11-09-1589.md); [iterations 1567–1569](docs/progress-archive/2026-11-09-1581.md); [iterations 1564–1566](docs/progress-archive/2026-11-09-1578.md); [iterations 1560–1563](docs/progress-archive/2026-11-09-1574.md); [iterations 1552–1559](docs/progress-archive/2026-11-09-1568.md); [iterations 1550–1551](docs/progress-archive/2026-11-09-1564.md); [iterations 1548–1549](docs/progress-archive/2026-11-09-1562.md); [through iteration 1547](docs/progress-archive/2026-11-09-1557.md); [through iteration 1539](docs/progress-archive/2026-11-09-1548.md).

## 2026-11-10: iteration 1623 — public topic catalog application and UI wiring

- Clean main; no inherited work. Zero alerts, healthy API/worker and `/healthz`; `pnpm obs jobs --check` confirms normal Nov 10 15:00 UTC edition pending.
- Public-mode topic GET/HEAD now uses the audited system-only projection without overlapping legacy GET registration. Private mode keeps its reader; writes and source catalog remain restricted. Application-owned topic storage closes with Nest; borrowed pools stay open.
- Shared owner-free topic-settings allowlist now drives API and UI parsing, including mutation results. Browser replays cover private/public-shaped rows on desktop/mobile light/dark with intercepted writes only; refreshed screenshots inspected.
- Updated rollout review, data-model handbook and TASKS; archived iterations 1612–1613. No source, provider, generation, migration, budget or schedule changes; public mode stays off. World social coverage/thin Tech reporting remain known limitations; tuning held under item 50.
- Verification: full `pnpm check` passes typecheck/lint/format/boundaries/803 unit tests, then exits 143 during integration without a reported failure; standalone `pnpm test:integration` passes 277 tests/four expected skips. `pnpm format`, `pnpm lint:fix`, `pnpm build` (existing bundle warning), both topic browser suites, handbook check, 32 deployed account-boundary checks, saved-reader parity (four topics/19 stories/14 posts) and `git diff --check` pass.
- Initial full check exposed a stale topic-refusal expectation; moved identity-forgery/session-failure assertions to the restricted profile route. Targeted provider tests and rerun 803 unit tests pass. No human blocker; next: origin-only source catalog/consumers and remaining status/tool wiring, then scheduled Phase 3 acceptance. API/worker restart follows push.

## 2026-11-10: iteration 1624 — public source catalog application wiring

- Clean main; no inherited work. Zero alerts, healthy services and `/healthz`; source and job checks pass. Normal Nov 10 15:00 UTC scheduled Phase 3 acceptance remains pending.
- Public-mode source catalog GET/HEAD now uses the audited origin-only projection; private mode keeps legacy catalog reads without overlapping routes. Configured feed paths/tokens stay restricted. Application-owned storage closes with Nest; borrowed pools remain open.
- Full-application anonymous GET/HEAD, no-store, mutation refusals and owned/borrowed lifecycle coverage added. Initial integration caught topic-write middleware intercepting the catalog as an invalid topic ID; added exact catalog pass-through. Rebuilt full-application rehearsal passes.
- Updated rollout review, data-model handbook and TASKS. No UI, source configuration, provider, generation, migration, budget or schedule changes; public mode remains off. Source catalog UI consumer migration is next, then status/tool projections.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` passes typecheck/lint/format/boundaries/804 unit tests; initial integration 276 pass/one routing failure/four expected skips. After fix, 13 focused tests and standalone `pnpm test:integration` pass (277/four expected skips). `pnpm build` passes (existing bundle warning), handbook check passes 18 pages/schema metadata; 32 deployed account-boundary checks and saved Nov 9 reader parity pass (four topics/19 stories/14 posts). `git diff --check` passes.
- API/worker restart follows push, outside protected hours. Phase 3 scheduled acceptance and natural link expiry remain pending; no new human blocker. World weak posts/thin Tech reporting remain known limitations; tuning held under item 50.

## 2026-11-10: iteration 1625 — reader comparison and cleanup verification repair

- Clean main; no inherited work. Zero alerts, healthy `/healthz`, all 36 sources healthy; `pnpm obs jobs --check` confirms normal 15:00 UTC edition pending.
- Followed newest STEERING 50 waiting instruction rather than continuing small public-read wiring. Read all served briefs, 19 summaries and 14 post texts/context across four topics.
- Largest weakness remains World's two low-engagement article shares/no X; Tech has four headline-level summaries. Causes already diagnosed, social/source tuning held. NBA's cut-off-excerpt commentary is covered by current editor v13; await scheduled output rather than stack instructions. No content fix claimed.
- Added Nov 10 review with concrete baseline/comparison criteria and Phase 3 acceptance gates; updated TASKS and noted the priority/held-work constraint in NEEDS_FROM_HUMAN without asking a question. Archived iterations 1614–1615.
- Full check and unit rerun exposed repeated conservative temp-cleanup assertion failures (803/804); focused test passed. Gave the killed-run assertion a bounded 10-second rescan window; retained final deletion requirement and rechecked all protected folders. Production deletion policy unchanged. Final `pnpm check` passes typecheck/lint/format/boundaries, 804 unit and 277 integration tests/four expected skips; focused cleanup and separate unit/integration runs pass.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` (existing bundle warning), saved-reader parity, 32 deployed account-boundary checks and `git diff --check` pass. API/worker restart follows push; no provider calls or live data/flag changes.
- Next: normal Nov 10 scheduled review, then Phase 3 acknowledgement if normal/accounts-on; migration 0019/public activation stay held. Natural link expiry after Nov 11 00:33:01 UTC runs separately.

## 2026-11-10: iteration 1626 — passive recovery evidence and publication guard

- Clean main; no inherited work. Zero alerts; `/healthz` reports database/Redis healthy. `pnpm obs sources --check` reports all 36 sources healthy; `pnpm obs jobs --check` confirms the normal 15:00 UTC edition pending.
- Overdue `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` passes: 23 healthy rules, four uncached queries ≤0.272 s, no new evaluator errors/misses/timeouts/slow queries; stable process starts within sample. One 3,395-row small merge, no large-tier merge; recovery stays open. Next probe ≥07:13 UTC.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` passes saved latest/direct/history parity: four topics, 19 stories, 14 posts. Existing reader weaknesses and owner tuning/source holds remain; no speculative hardening or content changes.
- Updated TASKS and capacity evidence only. No provider calls, migrations, flags, runtime configuration or application code changes; live services already match application main, so no restart needed.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (typecheck/lint/format/boundaries, 804 unit and 277 integration tests/four expected skips) and `git diff --check` pass. Next: normal Nov 10 15:00 scheduled review/Phase 3 acceptance; migration 0019/public mode held, natural link-expiry check after Nov 11 00:33:01 UTC.

## 2026-11-10: iteration 1686 — GamingBolt source outage triage

- Clean main; no inherited work. Pending RecentJobFailures alert traced to GamingBolt RSS collection, with repeated 20-second AbortError timeouts. Direct `curl --max-time 25` also receives zero bytes and times out; external recovery remains pending.
- `pnpm obs sources --check`: 35 healthy, GamingBolt error; last success 11:16:24 UTC, 10 items/160 stored. Existing scheduled bounded retries retained; no bypass, provider call or runtime change.
- `/healthz` passes database/Redis; no failed user services. `pnpm obs jobs --check` shows scheduled 15:00 UTC digest pending, no failed digest runs. Saved-reader parity passes four topics/19 stories/14 posts.
- Recorded incident in TASKS and SOURCES. Phase 3 still waits for scheduled edition; migration 0019/public activation and content tuning remain held. Metrics probe not due before 12:28 UTC.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (804 unit tests; 277 integration passes/four expected skips), saved-reader parity and `git diff --check` pass. Documentation only; running application already matches main, no restart needed.

## 2026-11-10: iteration 1687 — GamingBolt response-timeout diagnosis

- Clean main; no inherited work. GamingBolt remains the sole unhealthy source; third scheduled attempt also failed at the 20-second limit. Other 35 sources healthy; no failed digest runs or user services, `/healthz` passes database/Redis.
- Public-feed probes time out with zero bytes at 25 and 12 seconds. DNS 0.002 s, TCP 0.059 s, TLS 0.119 s localize the latter failure after successful server connection; no DNS or certificate fix justified. Retained bounded scheduled retries; recovery remains open.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` passes four topics/19 stories/14 posts. Reader weaknesses retain existing owner holds; no generation change or paid calls.
- Updated TASKS/SOURCES and archived oldest progress entries to keep orientation small. Documentation only; live application already matches main, no restart needed.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (804 unit tests; 277 integration passes/four expected skips), saved-reader parity and `git diff --check` pass. Next: GamingBolt scheduled recovery; 15:00 UTC normal/accounts-on edition for Phase 3 acceptance. Metrics probe not due before 12:28 UTC; migration 0019/public activation remain held.

## 2026-11-10: iteration 1692 — hourly passive metrics evidence

- Clean main; no inherited work. GamingBolt remains the sole unhealthy source (last attempt 12:20 UTC; last success 11:16 UTC); existing bounded retries retained. RecentJobFailures firing; other 35 sources healthy.
- `/healthz` passes database/Redis; no failed user services. Saved-reader parity passes four topics/19 stories/14 posts; normal 15:00 UTC edition still pending.
- Due `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` passes: 23 healthy rules, four queries ≤0.061 s, no new evaluator errors/misses/timeouts/slow queries or process restarts. Two small merges/9,356 rows; no large-tier merge, recovery remains open. Next probe ≥13:29 UTC.
- Updated TASKS and capacity evidence only; no provider calls, flags, migrations or application changes. Running services already match application main; no restart needed.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (804 unit tests; 277 integration passes/four expected skips) and `git diff --check` pass. Next: source recovery and scheduled Phase 3 acceptance; migration 0019/public activation remain held.

## 2026-11-10: iteration 1693 — correct the remaining public-read handoff

- Owner value: remove an already-shipped UI migration from the Phase 4 queue so the next build targets missing public readers. Clean main; no inherited work.
- Source-catalog compatibility already shipped in `564ecb6b`; corrected the stale rollout review and TASKS. Remaining available work is article/source-health wiring, then status/preview/tools; public activation stays gated on Phase 3.
- `pnpm exec tsx scripts/smoke-source-catalog-compatibility.ts` passes 36 saved sources across legacy/public/invalid responses and desktop/mobile, zero writes. Public responses are simulated; tracked screenshots unchanged.
- Zero active alerts; `/healthz` database/Redis healthy; no failed user services or digest runs. Normal 15:00 UTC run pending. GamingBolt remains the sole unhealthy source: direct 20-second feed probe receives zero bytes; bounded scheduled retries retained.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass (804 unit tests; 277 integration passes/four expected skips). No application/runtime changes; services already match application main, no restart needed. No provider calls, migrations or flags changed.
- Next: article/source-health public-mode composition; scheduled Phase 3 acceptance at 15:00 UTC. Metrics probe not due before 13:29 UTC; natural link expiry after Nov 11 00:33:01 UTC.

## 2026-11-10: iteration 1694 — compose public article and source-health readers

- Clean main; no inherited work. Public-mode application now installs audited article-origin and count/timing source-health GET/HEAD readers, replacing overlapping legacy handlers. Each owns its shutdown pool; private rollback retains legacy contracts and window reads remain admin-only.
- Public activation remains off. Next: article/source-health UI compatibility, then status/preview/tools; Phase 3 still awaits normal 15:00 UTC accounts-on edition. No provider calls, migrations or flags changed.
- Full-application isolated HTTP checks match audited projections, verify no-store/empty HEAD, reject mutations and anonymous window reads. Existing adversarial storage/projection tests remain green. Handbook and rollout review updated; oldest progress entries archived.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (805 unit tests; 277 integration passes/four expected skips), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 07-data-model` and `git diff --check` pass.
- Restarted API; `/healthz` database/Redis healthy, no failed services. `smoke-admin-gate.ts` passes (first immediate request hit startup ECONNREFUSED; retry passed). Live private-contract check passes four article groups/36 sources; `check-scheduled-reader.ts 2026-11-09T15:00:00Z` passes four topics/19 stories/14 posts.
- Zero active alerts at orientation; GamingBolt remains the sole unhealthy source, existing bounded retries retained. No new direct probes; metrics probe not due before 13:29 UTC. Natural link expiry check remains after Nov 11 00:33:01 UTC.

## 2026-11-10: iteration 1695 — resolve content-reader UI handoff

- Clean main; no inherited work. Removed the unused legacy article query: no active UI consumes either newly sanitized content endpoint. Source management needs the separate operations-status projection (collection switches and recent counts); do not replace it with the narrower health response.
- Added `smoke-content-read-consumers.ts`: read-only replay of 36 saved sources at 1440/390 px, with content routes unavailable; verifies collection settings, zero content reads/writes and no browser errors. Screenshots saved under `docs/screenshots/ui/content-read-consumers-*.png`; mobile inspected.
- Corrected rollout/TASKS handoff: next status/preview projections, then tools. Public mode remains off; Phase 3 awaits 15:00 UTC. No migrations/provider calls/generation changes.
- GamingBolt remains sole unhealthy source (12:50 attempt, 11:16 last success); known bounded retries retained. Database/Redis healthy, no failed services/digest runs. Metrics probe not due until 13:29 UTC.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, browser replay and `check-scheduled-reader.ts 2026-11-09T15:00:00Z` pass (four topics/19 stories/14 posts). API restarted before 13:00 UTC; replay and `/healthz` pass afterward. Initial full check terminated with SIGTERM during typecheck; separate `pnpm check` retry passes (805 unit tests; 277 integration passes/four expected skips). `git diff --check` passes.

## 2026-11-10: iteration 1696 — prepare a bounded public status response

- Clean main; no inherited work. Added uninstalled `readPublicStatus`: explicit nested schemas retain coverage, collection controls/counts/timestamps and allowlisted queue health. Stored source errors become `hasError`; job IDs/results/skip strings, provider usage and development accounting are omitted.
- Adversarial unit checks cover historical secrets/URLs, future fields, arbitrary queue/count keys, malformed data and dependency failures; failures return generic 503. Detailed status remains admin-only; no route promotion or application composition yet.
- Updated rollout review/TASKS. Next: status transport/UI compatibility, preview boundary, then tools. Phase 3 still awaits normal 15:00 UTC edition; public mode off.
- Verification: `pnpm format`, `pnpm lint:fix`, targeted status tests, full `pnpm check` (807 unit passes; 277 integration passes/four expected skips), `pnpm --filter @digest/api build`, `git diff --check` pass. Latest saved reader verifies four topics/19 stories/14 posts; `/healthz` database/Redis healthy, no failed user services, zero active alerts at orientation.
- GamingBolt remains open with existing bounded retries. No live provider calls, migrations, flag changes, deployment or restart during 13:00–16:00 UTC freeze. New code is uninstalled, so running services retain the same application behavior. Metrics check not due before 13:29 UTC.

## 2026-11-10: iteration 1697 — prepare bounded status HTTP transport

- Clean main; no inherited work. Added uninstalled status controller/module using the audited projection and an injected read port; prerequisites validate before reader construction. Application composition and admin route policy stay unchanged.
- Isolated Nest HTTP checks verify sanitized GET, empty HEAD, no-store including generic 503 failures, absent mutation/alerts routes, disabled GET/HEAD 404s and invalid-flag rejection without opening dependencies.
- Updated rollout review/TASKS. Next: public status UI compatibility and budget-summary decision before composition, then preview/tools. Public mode remains off; Phase 3 awaits normal 15:00 UTC edition.
- Verification: `pnpm format`, `pnpm lint:fix`, targeted HTTP tests, full `pnpm check` (809 unit passes; 277 integration passes/four expected skips), `pnpm --filter @digest/api build` and `git diff --check` pass. Saved-reader check verifies four topics/19 stories/14 posts; health database/Redis healthy, no failed user services.
- Zero active alerts at orientation. GamingBolt remains open with bounded retries; no direct probe. No provider calls, live migrations, flags, deployment or restart during 13:00–16:00 UTC freeze; uninstalled additions leave running application behavior unchanged. Metrics check not yet due at orientation; natural link expiry remains after Nov 11 00:33:01 UTC.

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
