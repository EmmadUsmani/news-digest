# Progress

Earlier entries: [iteration 1599](docs/progress-archive/2026-11-10-1613.md); [iteration 1598](docs/progress-archive/2026-11-10-1611.md); [iteration 1597](docs/progress-archive/2026-11-10-1610.md); [iteration 1596](docs/progress-archive/2026-11-10-1608.md); [iteration 1595](docs/progress-archive/2026-11-10-1607.md); [iteration 1594](docs/progress-archive/2026-11-10-1606.md); [iteration 1593](docs/progress-archive/2026-11-10-1605.md); [iteration 1592](docs/progress-archive/2026-11-10-1604.md); [iteration 1591](docs/progress-archive/2026-11-10-1603.md); [iteration 1590](docs/progress-archive/2026-11-10-1602.md); [iteration 1589](docs/progress-archive/2026-11-10-1601.md); [iteration 1588](docs/progress-archive/2026-11-10-1600.md); [iteration 1587](docs/progress-archive/2026-11-10-1599.md); [iteration 1586](docs/progress-archive/2026-11-10-1598.md); [iterations 1584–1585](docs/progress-archive/2026-11-10-1597.md); [iteration 1583](docs/progress-archive/2026-11-10-1596.md); [iterations 1580–1582](docs/progress-archive/2026-11-09-1594.md); [iterations 1577–1579](docs/progress-archive/2026-11-09-1592.md); [iterations 1570–1576](docs/progress-archive/2026-11-09-1589.md); [iterations 1567–1569](docs/progress-archive/2026-11-09-1581.md); [iterations 1564–1566](docs/progress-archive/2026-11-09-1578.md); [iterations 1560–1563](docs/progress-archive/2026-11-09-1574.md); [iterations 1552–1559](docs/progress-archive/2026-11-09-1568.md); [iterations 1550–1551](docs/progress-archive/2026-11-09-1564.md); [iterations 1548–1549](docs/progress-archive/2026-11-09-1562.md); [through iteration 1547](docs/progress-archive/2026-11-09-1557.md); [through iteration 1539](docs/progress-archive/2026-11-09-1548.md).

## 2026-11-10: iteration 1600 — due passive metrics recovery check

- Clean main/no inherited work. Initial health/alerts pass, no failed user services; 36/36 sources healthy, digest-generation failed count zero, next run Nov 10 15:00 UTC. Saved Nov 9 reader remains four topics/19 stories/14 posts.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` at 00:41 UTC: 23 fresh healthy rules, four uncached queries ≤0.590 s, zero new evaluator errors/missed iterations, queue timeouts or slow queries. Process starts unchanged; no small/big merge during interval. Recovery still needs correlated natural-merge evidence; next passive probe ≥01:41 UTC.
- Updated TASKS and capacity decision only; no runtime/configuration/limits, paid calls, account writes or generation changes. Natural link expiry remains due Nov 11 00:33:01 UTC; proxy/TLS and owner/scheduled gates remain, public mode off.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (800 unit/277 integration pass, four expected skips), `pnpm build`, `check-handbook.ts observability`, saved scheduled-reader check and `git diff --check`. Build has existing bundle warnings only; handbook checks 18 pages/one diagram/39 tables.
- Full check passes: 796 unit and 275 integration tests/four expected skips; typecheck/lint/format/boundaries green. API restarted; post-restart health, saved-reader and zero-alert checks pass; worker unchanged. Archived iteration 1588 to keep this file small.
- Push rejected because remote advanced; fetched/merged owner steering without rewriting history. New Nov 10 instruction requires owner steps now: added exact private mailbox command, sequential phone/laptop HTTPS sign-in, save/removal sync, all-device sign-out and report fields. Owner test replaces separate proxy/TLS gate; link expiry runs in parallel. Updated activation page/TASKS; no runtime changes.

## 2026-11-10: iteration 1601 — prepare configured public API admission

- Clean main/no inherited work; health and zero-alert snapshot pass. All 36 sources active/error-free; digest-generation has zero failed jobs and next scheduled run Nov 10 15:00 UTC. Saved reader remains four topics/19 stories/14 posts. Read private proxy receipt; no newer receipt than accepted Nov 9 19:47 result.
- Owner value: future public traffic must share a bounded visitor allowance without letting forged prefixes bypass limits or exposing addresses in Redis keys.
- Added prepared configuration adapter for the existing 120/minute Redis limiter: validated explicit proxy peers, verified last-entry selection, account secret with separate HMAC namespace, idempotent Redis shutdown and zero resource acquisition on private rollback. Invalid configuration fails before connecting.
- Two targeted tests exercise configuration refusal and composed real loopback HTTP with Redis stand-in: zero/one/two forged prefixes share one hashed key; absent client and Redis failure return empty no-store 429; health/static traffic bypass admission. These are offline checks, not live public acceptance.
- Adapter remains unregistered; next compose it into the configured public runtime with startup-failure cleanup, then isolated Phase 4 rehearsal. Public mode stays off; no paid calls, migration, account writes, schedule or generation changes. Phase 3 still awaits owner/scheduled acceptance and Nov 11 00:33:01 UTC natural link expiry. Metrics next probe ≥01:41 UTC.
- Updated TASKS and public plan; archived iteration 1589. No product UI or live data flow changed.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (798 unit, 275 integration/four expected skips), `pnpm build`, `check-handbook.ts account-activation` (18 pages/39 tables) and `git diff --check` pass. Existing bundle warnings only. API-only restart complete; first saved-reader request raced startup, retry passes alongside `/healthz` and zero alerts. Worker unchanged.

## 2026-11-10: iteration 1602 — compose public API admission with owned cleanup

- Clean main/no inherited work; health, zero alerts, services/sources and digest queue healthy. Next scheduled edition Nov 10 15:00 UTC; zero failed digest jobs. Private proxy receipt unchanged from accepted Nov 9 19:47 result.
- Configured public provider now supplies verified-client admission before accounts/authorization. Configuration refuses missing peers before storage; private rollback opens no limiter Redis connection. Public mode remains off.
- Startup failure closes admission Redis; shutdown attempts storage and admission cleanup once even when either fails, retaining both errors. Existing stored runtime handles storage startup cleanup/closed-request refusal.
- Offline provider HTTP acceptance proves zero/one/two forged prefixes share one admission key and receive empty no-store 429 before account dispatch; health bypass and admitted reader routing pass. Startup/cleanup failure aggregation and repeated shutdown pass. No external test calls.
- Updated public plan, runtime handbook and TASKS; archived iteration 1590. No paid calls, migrations, account writes, UI, schedule, generation or worker changes.
- Verification: targeted provider/readiness tests (9 pass), `pnpm format`, `pnpm lint:fix`, `pnpm check` (800 unit, 275 integration/four expected skips), `pnpm build`, handbook account-activation/runtime checks, deployed account boundary (32 refusals), saved Nov 9 reader (four topics/19 stories/14 posts) and `git diff --check`. Build has existing bundle warnings only.
- API-only restart complete; post-restart `/healthz`, saved-reader, 36-source health and zero-alert checks pass; worker stays active and unchanged.
- Next: isolated Phase 4 rehearsal while Phase 3 owner two-device/scheduled acceptance and Nov 11 00:33:01 UTC natural link expiry remain open. Metrics passive probe due ≥01:41 UTC.

## 2026-11-10: iteration 1603 — isolated configured public runtime rehearsal

- Clean main/no inherited work. Initial alerts/health/services pass; 36/36 sources healthy, zero failed digest jobs, next scheduled edition Nov 10 15:00 UTC. Saved Nov 9 reader remains four topics/19 stories/14 posts. Private proxy receipt unchanged (Nov 9 19:47); owner interpretation remains authoritative.
- Added integration rehearsal using configured production account/admission factories, real loopback HTTP and fresh migrated PostgreSQL/Redis. Account session response and login-code persistence/temporary mailbox delivery pass without live accounts or external calls.
- Concurrent 120-request allowance shares one hashed visitor key across observed duplicate entries and zero/one/two forged prefixes. Exhaustion refuses account dispatch; runtime restart retains the fixed window. Independent visitor, missing-client refusal, health/privacy bypass, idempotent shutdown and private rollback pass.
- Reader controllers use a 204 sentinel here; full application rehearsal remains next. Public mode stays off; owner two-device/scheduled acceptance and Nov 11 00:33:01 UTC natural link expiry remain open. Metrics next passive probe ≥01:41 UTC.
- Updated TASKS/public plan; archived iteration 1591. No runtime, UI, migration, schedule, generation, worker or paid-call changes.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (800 unit, 276 integration; four expected skips), `pnpm build`, `check-handbook.ts account-activation`, saved-reader and `git diff --check` pass. Existing bundle warnings only. Mistyped `obs jobs --check` with filters refused; corrected read-only filtered command confirms zero failed jobs.
- API-only restart complete; post-restart health, saved reader and zero alerts pass. Worker remains active and unchanged.

## 2026-11-10: iteration 1604 — full application anonymous public rehearsal

- Clean main/no inherited work. Zero alerts, healthy `/healthz`, all 36 sources healthy and zero failed digest jobs; next scheduled edition Nov 10 15:00 UTC. Saved Nov 9 reader remains four topics/19 stories/14 posts.
- Added isolated full compiled Nest application rehearsal using the production configured access provider, mounted before body parsers, real reader controllers and public error filter. Fresh migrated PostgreSQL/Redis only; no external calls or live account writes.
- Published fixture latest/direct reads pass; newer private fixture is hidden. Anonymous session works, admin topic reads remain restricted, forged owner header cannot grant access, missing-Origin writes refuse before authorization, and controller errors are empty/no-store.
- Real reader HEAD requests exhaust the shared 120/minute visitor allowance and account dispatch then refuses; health bypass survives exhaustion. Immutable fixture cleanup disables/restores its trigger transactionally in isolated storage only.
- Initial full runs exposed test assumptions: immutable deletion refused, admin topic read correctly returned 404, and missing-Origin writes correctly returned 403. Corrected fixture cleanup/expectations; focused disposable-container rehearsal passes. No runtime behavior changed.
- Updated TASKS/public plan. Public mode remains off; Phase 3 owner two-device/scheduled acceptance and Nov 11 00:33:01 UTC link expiry remain open. Next: authenticated/admin full application rehearsal, then remaining Phase 4 readiness gates. Due 01:41 metrics probe passes: 23 healthy rules/four queries ≤0.537 s, zero new evaluator errors/misses; one small 3,690-row merge, no large-tier merge. Next ≥02:42 UTC.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (800 unit, 277 integration/four expected skips), `pnpm build`, `check-handbook.ts account-activation`, saved-reader and `git diff --check` pass; existing bundle warnings only.
- API-only restart and post-restart health/saved-reader/zero-alert checks pass; worker unchanged. No paid calls, migrations, live flags, schedule, generation or UI changes.

## 2026-11-10: iteration 1605 — authenticated full application public rehearsal

- Clean main/no inherited work. Initial alerts/health/services pass; 36/36 sources healthy, zero failed digest jobs, next scheduled edition Nov 10 15:00 UTC. Saved Nov 9 reader remains four topics/19 stories/14 posts. Private proxy receipt unchanged from Nov 9 19:47; owner interpretation in STEERING 53 remains authoritative.
- Extended isolated full compiled Nest application rehearsal through production mailbox code request/redemption, secure HttpOnly admin cookie, authorized topic reads and unchanged topic-enable write, empty reader sync, logout and stale-cookie admin/session refusal. Focused case passes inside the full disposable PostgreSQL/Redis suite; no external calls or live account writes.
- Updated TASKS/public plan and archived iteration 1593. Public mode stays off; owner two-device, normal scheduled edition and Nov 11 00:33:01 UTC natural link-expiry gates remain open. Metrics next passive probe remains ≥02:42 UTC; no early repeat.
- No runtime behavior, UI, migration, live flags, schedule, generation, worker or paid-call changes. Next prepared work: remaining Phase 4 readiness gates, including ordinary-reader full application acceptance.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (800 unit, 277 integration/four expected skips), `pnpm build`, `check-handbook.ts account-activation`, deployed account boundary (32 refusals), saved-reader and `git diff --check` pass. Initial check stopped on newly archived Markdown formatting; corrected and full rerun passed. Existing build bundle warnings only. API-only restart follows push; worker unchanged.

## 2026-11-10: iteration 1606 — invited reader full application rehearsal

- Clean main/no inherited work. Zero alerts, healthy API/worker and `/healthz`, 36/36 sources healthy, zero failed digest jobs; next scheduled edition Nov 10 15:00 UTC. Saved Nov 9 reader retains four topics/19 stories/14 posts.
- Extended isolated compiled public application rehearsal through two independently invited reader sessions, signed-in non-admin identity, topic/bookmark sync, removal tombstone and stale-device replay, and owner preference isolation.
- Forged owner header cannot authorize a reader topic mutation; catalog remains unchanged. Reader invitations refuse; all-device logout revokes both reader sessions. Disposable PostgreSQL/Redis and mailbox only, no external calls or live account writes.
- Updated TASKS/public plan. Public mode remains off; owner two-device acceptance, normal scheduled edition and Nov 11 00:33:01 UTC natural link expiry remain open. Metrics probe not due until ≥02:42 UTC; no repeat.
- No runtime behavior, UI, migration, schedule, generation, worker, live flag or paid-call changes. Initial `obs jobs --queue digest` refused an unknown queue; corrected `digest-generation` confirms zero failures.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (800 unit, 277 integration/four expected skips), `check-handbook.ts account-activation`, `check-live-account-boundary.ts` (32 refusals), saved-reader and `git diff --check` pass. First integration run expected 403 for the hidden admin route; corrected to its intended empty 404 and full rerun passed.
- Archived iteration 1594 to keep PROGRESS small. `pnpm build` passes with existing bundle warnings only. API-only restart follows push; worker unchanged. Next: remaining Phase 4 readiness gates while Phase 3 owner/scheduled acceptance waits.

## 2026-11-10: iteration 1607 — full application account deletion rehearsal

- Clean main/no inherited work. Zero alerts, healthy API/worker and `/healthz`, 36/36 sources healthy, zero failed digest jobs; next scheduled edition Nov 10 15:00 UTC. Saved Nov 9 reader retains four topics/19 stories/14 posts.
- Extended isolated compiled public application rehearsal through two-session account deletion: wrong confirmation preserves preferences; valid deletion clears the cookie, revokes both devices and outstanding invitations, and rejects stale sync/deletion requests.
- Re-inviting the same email creates empty preferences; owner preferences and published fixture edition remain intact. Disposable PostgreSQL/Redis only; no external calls or live account writes.
- Updated TASKS/public plan and archived iteration 1595. Public mode stays off; owner two-device acceptance, normal scheduled edition and Nov 11 00:33:01 UTC natural link expiry remain open. Metrics probe not due until ≥02:42 UTC; no repeat.
- No runtime behavior, UI, migration, schedule, generation, worker, live flag or paid-call changes. Next: remaining Phase 4 readiness gates while Phase 3 owner/scheduled acceptance waits.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (800 unit, 277 integration/four expected skips), `pnpm build`, `check-handbook.ts account-activation`, `check-live-account-boundary.ts` (32 refusals), `check-scheduled-reader.ts 2026-11-09T15:00:00Z` and `git diff --check` pass. Existing build bundle warnings only.
- API-only restart follows push; worker unchanged.

## 2026-11-10: iteration 1608 — full application admin session revocation

- Clean main/no inherited work. Zero alerts, healthy API/worker and `/healthz`, 36/36 sources healthy, zero failed digest jobs; next scheduled edition Nov 10 15:00 UTC.
- Extended isolated compiled public application rehearsal through admin-targeted two-session revocation: reader issuer refused without losing either session, admin removes both, repeated revocation returns zero, issuer session remains usable, and fresh invitation recovers retained preferences.
- Disposable PostgreSQL/Redis/mailbox only; no external calls, live account writes, runtime behavior, UI, migration, schedule, worker, live flag or paid-call changes.
- Updated TASKS/public plan and archived iteration 1596. Public mode stays off; owner two-device acceptance, normal scheduled edition and Nov 11 00:33:01 UTC natural link expiry remain open. Metrics probe not due until ≥02:42 UTC; no early repeat.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (800 unit, 277 integration/four expected skips), `pnpm build`, `check-handbook.ts account-activation`, `check-live-account-boundary.ts` (32 refusals), saved-reader check (four topics/19 stories/14 posts) and `git diff --check` pass. Existing build bundle warnings only.
- API-only restart follows push; worker unchanged. Next: remaining Phase 4 readiness gates while owner/scheduled acceptance waits.

## 2026-11-10: iteration 1609 — full application operations isolation

- Clean main/no inherited work. Zero alerts, healthy API/worker and `/healthz`, 36/36 sources healthy, zero failed digest jobs; next scheduled edition Nov 10 15:00 UTC.
- Added 54 full compiled-application requests proving anonymous and real admin sessions cannot reach logs, metrics/query, Grafana, docs, database or queues through public mode, including encoded paths, GET/HEAD/POST and forged owner/local-token headers.
- Every refusal is an empty no-store 404; the authenticated admin session remains valid. Disposable PostgreSQL/Redis/mailbox only; no external calls or live account writes.
- Updated TASKS/public plan. Public mode stays off; owner two-device acceptance, normal scheduled edition and Nov 11 00:33:01 UTC natural link expiry remain open. Metrics check not due until ≥02:42 UTC; no early repeat.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (800 unit, 277 integration/four expected skips), `pnpm build`, `check-handbook.ts account-activation`, `check-live-account-boundary.ts` (32 refusals), `check-scheduled-reader.ts 2026-11-09T15:00:00Z` (four topics/19 stories/14 posts), and `git diff --check` pass. Existing build bundle warnings only.
- API-only restart follows push; worker unchanged. Next: remaining Phase 4 readiness gates while owner/scheduled acceptance waits.

## 2026-11-10: iteration 1610 — full application cross-site write refusal

- Clean main/no inherited work. Zero alerts, healthy API/worker and `/healthz`, 36/36 healthy sources, zero failed digest jobs; next scheduled edition Nov 10 15:00 UTC.
- Added 25 compiled full-application requests carrying a real admin cookie: missing, null, foreign and misleading origins plus text/plain cannot sync preferences, delete the account, log out one/all devices or toggle a topic.
- Refusals are empty no-store 400s without CORS permission. Subsequent reads prove the admin session, empty preferences and complete topic catalog survive. Disposable PostgreSQL/Redis/mailbox only; no live account writes or external calls.
- Updated TASKS/public plan and archived iteration 1597. Public mode stays off; owner two-device acceptance, normal scheduled edition and Nov 11 00:33:01 UTC natural link expiry remain open. No runtime, UI, schedule, migration or generation changes.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (800 unit, 277 integration/four expected skips), deployed account-boundary check (32 refusals), saved Nov 9 reader (four topics/19 stories/14 posts), handbook account-activation, `pnpm build` (existing bundle warnings only) and diff checks pass.
- API-only restart follows push; worker unchanged. Next: remaining Phase 4 readiness gates while Phase 3 acceptance waits. Metrics check not due at orientation (≥02:42 UTC); no early repeat.

## 2026-11-10: iteration 1611 — due passive recovery evidence

- Clean main; no inherited work. Zero alerts, API/worker active, `/healthz` healthy and 36/36 sources healthy; `pnpm obs jobs --check` passes.
- Due `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` records 23 healthy rules, four queries ≤0.631 s and zero new evaluator errors/misses, timeouts or slow queries through one 18,232-row small merge. No big merge or restart; comparable recovery remains open. Next passive check ≥03:48 UTC.
- `check-live-account-boundary.ts` passes 32 refusals; `check-scheduled-reader.ts 2026-11-09T15:00:00Z` verifies four topics/19 stories/14 posts.
- Updated recovery evidence/TASKS and archived iteration 1598; no runtime, paid calls, flags, migrations or service changes. Public mode stays off. Owner two-device acceptance, Nov 10 15:00 scheduled edition and Nov 11 00:33:01 natural expiry remain pending.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (800 unit/277 integration pass, four expected skips) and `git diff --check` pass. Documentation-only commit needs no rebuild or service restart; live binaries remain unchanged.
- Initial unsupported `obs status` and filtered `obs jobs --check` invocations were corrected to documented commands; no operational failure.

## 2026-11-10: iteration 1612 — full application body refusal

- Clean main; no inherited work. Zero alerts, active API/worker, healthy `/healthz`, 36/36 healthy sources and `pnpm obs jobs --check` passes; next edition Nov 10 15:00 UTC.
- Added ten full compiled-application malformed JSON/oversized same-origin requests carrying a real admin cookie across logout, logout-all, deletion, sync and topic update routes. Empty no-store 400/413 refusals preserve session, preferences and topic catalog.
- Disposable PostgreSQL/Redis/mailbox only; no live account writes, external calls, runtime, UI, migration or generation changes. Updated TASKS/public plan; public mode stays off.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (800 unit/277 integration pass, four expected skips), `pnpm build` (existing bundle warning), `check-handbook.ts account-activation`, `check-live-account-boundary.ts` (32 refusals), saved Nov 9 reader (four topics/19 stories/14 posts) and `git diff --check` pass.
- API-only restart follows push; worker unchanged. Owner two-device acceptance, normal scheduled edition and Nov 11 00:33:01 natural link expiry remain pending. Metrics probe not due until ≥03:48 UTC; no early repeat.

## 2026-11-10: iteration 1613 — full application ambiguous-cookie refusal

- Clean main; no inherited work. Zero alerts, active API/worker, healthy `/healthz`, 36/36 sources healthy and `pnpm obs jobs --check` passes; next edition Nov 10 15:00 UTC.
- Added twelve full compiled-application requests for duplicate valid cookies, valid/malformed cookies in either order and malformed tokens against deletion, all-device logout and topic writes. Empty no-store 401/404s issue no cookie; authenticated reads preserve sessions, preferences and topics.
- Disposable PostgreSQL/Redis/mailbox only; no live account writes, external calls, runtime, UI, migrations or generation changes. Public mode stays off. Updated TASKS/public plan and archived iteration 1599.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (800 unit/277 integration pass, four expected skips), `pnpm build` (existing bundle warning), `check-handbook.ts account-activation`, `check-live-account-boundary.ts` (32 refusals), saved Nov 9 reader (four topics/19 stories/14 posts) and `git diff --check`. Initial checks caught archive formatting and an incorrect test expectation (account routes return 401, admin routes 404); corrected both and reran verification.
- API-only restart follows push; worker unchanged. Owner two-device acceptance, Nov 10 scheduled edition and Nov 11 00:33:01 natural link expiry remain pending. Metrics probe not due until ≥03:48 UTC; no early repeat.
