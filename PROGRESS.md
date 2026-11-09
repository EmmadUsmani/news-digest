# Progress

Earlier entries: [iterations 1567–1569](docs/progress-archive/2026-11-09-1581.md); [iterations 1564–1566](docs/progress-archive/2026-11-09-1578.md); [iterations 1560–1563](docs/progress-archive/2026-11-09-1574.md); [iterations 1552–1559](docs/progress-archive/2026-11-09-1568.md); [iterations 1550–1551](docs/progress-archive/2026-11-09-1564.md); [iterations 1548–1549](docs/progress-archive/2026-11-09-1562.md); [through iteration 1547](docs/progress-archive/2026-11-09-1557.md); [through iteration 1539](docs/progress-archive/2026-11-09-1548.md).

## 2026-11-09: iteration 1570 — rehearse configured public HTTP access

- Clean main/no leftovers. Health passed; Kotaku remains the only unhealthy source (last success 18:26 UTC/20 items, upstream HTTP 522 retries at 19:30). Digest-generation queue has zero failed runs. No paid calls, migrations, flags or generation changes.
- Added configured Nest HTTP readiness matrix with session/storage stand-ins: anonymous, reader, fresh-admin, then revoked-admin eligibility. This is isolated acceptance evidence, not live accounts or proxy proof.
- Tool/queue routes, unknown assets and ambiguous paths refuse GET/HEAD/POST before authentication/downstream, despite forged proxy identity and a token. Direct-local credentials also cannot grant tool routes. Refused responses are empty/no-store and retain CSP.
- Reader GET/HEAD needs no session; admin reads require current eligibility; invalid write origins refuse before session/storage. Owned account/source resources close. Updated readiness plan, TASKS and source health note; no UI or handbook behavior changed.
- Targeted `pnpm exec tsx --test apps/api/test/public-readiness-http.test.ts apps/api/test/access-provider.test.ts`: 7/7 pass. `pnpm exec tsx scripts/check-public-policies.ts`: all nine synthetic browser policies/private rollback pass.
- `pnpm format`, `pnpm lint:fix`, workspace build and `git diff --check` pass; build retains existing bundle-size warning. `pnpm check` passes typecheck/lint/format/boundaries, 775 unit and 272 integration tests (four expected skips).
- API/worker restarted after build; initial health probe raced startup, retry `pnpm obs health --check` passes. Scheduled reader gate for 2026-11-09T15:00:00Z passes four topics/19 stories/14 posts. Alerts clear at 19:46 UTC.
- Initial push rejected (remote advanced with owner commit `85d7ba72`, lead-session note only). Fetched and merged without rewriting history or editing owner content; verified app code is unchanged.
- Next: owner item 53 rerun before Phase 3 activation; finish full Phase 4 acceptance behind flags. Accounts/public remain off; metrics probe not due until 20:36 UTC.

## 2026-11-09: iteration 1571 — verify sign-in request log privacy

- Owner value: public readiness now checks that sign-in traffic retains useful request diagnostics without leaking account credentials or identities.
- Clean main/no leftovers. Health and alerts pass; Kotaku remains the only unhealthy source at 19:52 UTC (HTTP 522, last success 18:26/20 items). No bypass, paid calls, migrations, flags or generation changes.
- Added composed production request-logger/account-HTTP rehearsal using handler service stand-ins and no secret-value redaction. Nine outcomes cover login page, code request, code/link redemption, session read, logout, reused code, foreign Origin and dependency failure.
- Exactly one request-ID-correlated status/timing record per response; no email, code, token, cookie, session ID or client address. Error responses remain generic. This is offline evidence; live proxy/account acceptance remains open.
- Targeted `pnpm exec tsx --test apps/api/test/account-request-logging.test.ts apps/api/test/account-http.test.ts apps/api/test/logging.test.ts`: 12/12 pass. Updated readiness plan, TASKS and source-health note; no product behavior or UI changes.
- Workspace build passes with existing bundle warning. Scheduled-reader gate for 2026-11-09T15:00:00Z passes four topics/19 stories/14 posts; digest-generation queue has zero failed runs.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 776 unit and 272 integration tests/four expected skips. `git diff --check` passes.
- API/worker restarted; initial health raced startup, retry health and service checks pass. Post-restart scheduled-reader gate passes; alerts clear at 19:55 UTC.
- Next: owner item 53 proxy rerun before Phase 3 activation; remaining Phase 4 acceptance. Metrics probe not due until 20:36 UTC.

## 2026-11-09: iteration 1572 — prepare general API admission

- Clean main/no leftovers. Health passes; Kotaku remains upstream HTTP 522 (latest attempt 19:57 UTC, last success 18:26/20 items), explaining RecentJobFailures. No bypass, paid calls, migrations, flags or generation changes.
- Added unregistered Redis general API admission: atomic shared fixed windows, HMAC client keys, provisional 120 requests/minute, no expiry extension on refused attempts. Missing identity and Redis errors refuse.
- Isolated Redis integration verifies concurrent instances admit exactly the allowance, client separation, private keys, real expiry/reset, bounded inputs, invalid settings and dependency failure. No live Redis or external providers used by tests.
- Updated public readiness plan, TASKS and source note. HTTP registration awaits verified visitor extraction (item 53); preference-write throttling remains open. No UI or current system behavior changed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 776 unit and 273 integration tests/four expected skips. Workspace build passes with existing bundle-size warning; `git diff --check` passes.
- API/worker restarted after build; `pnpm obs health --check` and `pnpm obs services --check` pass (14 services). Scheduled-reader gate for 2026-11-09T15:00:00Z passes four topics/19 stories/14 posts. Digest queue has zero failed runs; alerts retain explained upstream source failures.
- Next: item 53 owner rerun before Phase 3; Phase 4 HTTP rate enforcement and preference-write limits behind disabled flags. Metrics passive probe not due until 20:36 UTC.

## 2026-11-09: iteration 1573 — prepare HTTP API rate enforcement

- Clean main/no leftovers. Health passes; Kotaku's scheduled 20:00 UTC attempt remains upstream failure, last success 18:26/20 items; 35 other sources healthy. No bypass, paid calls, flags, migrations or generation changes.
- Added unregistered HTTP admission using caller-supplied verified visitor identity. API GET/HEAD/writes share admission; missing identity, extraction errors and admission failures return empty no-store 429 before downstream work. Health/static routes pass through; disabled mode opens no dependency.
- Offline HTTP tests verify denial, method coverage, query paths, forged forwarding/cookie independence, error privacy and disabled rollback. Registration still waits for item 53 visitor proof; preference-write limits remain open.
- Updated readiness plan, TASKS and source-health note. No UI or current runtime behavior changed; no handbook update required.
- Targeted `pnpm exec tsx --test apps/api/test/api-admission-http.test.ts`: 2/2 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 778 unit and 273 integration tests/four expected skips. Build passes with existing bundle-size warning; `git diff --check` passes.
- API/worker restarted; `pnpm obs health --check` and `pnpm obs services --check` pass (14 services). Scheduled-reader check for 2026-11-09T15:00:00Z passes four topics/19 stories/14 posts. Digest-generation queue has zero failed runs; alerts clear at 20:11 UTC.
- Next: preference-write limits behind disabled flags; owner item 53 rerun still blocks activation. Metrics passive probe not due until 20:36 UTC.

## 2026-11-09: iteration 1574 — prepare reader preference write admission

- Clean main/no leftovers. Initial alerts/health clear; Kotaku remains the only unhealthy source (last attempt 20:00 UTC, last success 18:26/20 items). No paid calls, migrations, flag or generation changes.
- Added unregistered Redis preference-write admission: provisional 30/minute per authenticated reader, shared atomic windows, separate HMAC keys, no expiry extension on refusal, fail closed on dependency errors.
- Added optional sync-handler boundary after provenance/session/payload validation and before storage mutation. Denial/errors return empty 429; handler tests verify authenticated identity, rejected identity injection and zero refused writes. Runtime construction/registration remains pending; public/accounts stay off.
- Isolated Redis verifies shared allowance, reader separation, independence from general API traffic, private keys, expiry/reset and dependency refusal. Updated readiness plan/TASKS/source note; archived iterations 1560–1563 to keep this file small. No UI or active runtime behavior changed.
- Targeted `pnpm exec tsx --test apps/api/test/account-handlers.test.ts`: 4/4 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 779 unit and 274 integration tests/four expected skips. `pnpm build` passes with existing bundle warnings; `git diff --check` passes.
- API/worker restarted; initial health raced startup, retry passes. `pnpm obs health --check`, `pnpm obs services --check` pass (14 services); scheduled-reader check for 2026-11-09T15:00:00Z passes four topics/19 stories/14 posts. Digest-generation failed count zero; alerts clear at 20:25 UTC.
- Next: construct/register preference admission in prepared account runtime, preserving disabled-mode dependency behavior; item 53 owner rerun still blocks activation. Metrics passive probe not due until 20:36 UTC.

## 2026-11-09: iteration 1575 — wire gated preference admission

- Clean main/no leftovers; initial alerts clear. Kotaku naturally recovered at 20:26 UTC with 20 items; all 36 sources healthy. Removed its open breakage marker and updated SOURCES.
- Account runtime now constructs per-reader preference admission with a dedicated derived privacy key and passes it to sync handlers. Disabled accounts still open no dependencies; public/accounts flags remain off pending item 53 owner proof.
- Extended composed stand-in flow: accepted writes reach storage; refusal/Redis errors return empty 429 without writes; recovery resumes writes and reuses private reader bucket. No external test calls, paid calls, migrations, UI or generation changes.
- Updated readiness plan and TASKS. No active system behavior changes or handbook update needed.
- Targeted `pnpm exec tsx --test apps/api/test/account-runtime.test.ts`: 2/2 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 779 unit and 274 integration tests/four expected skips. `pnpm build` passes with existing bundle warning; `git diff --check` passes.
- API/worker restarted; first health request raced startup, retry passes. `pnpm obs health --check`, `pnpm obs services --check`: healthy/14 services. Scheduled-reader gate for 2026-11-09T15:00:00Z passes four topics/19 stories/14 posts; digest queue failed count zero.
- Next: item 53 owner rerun still blocks activation; continue remaining Phase 4 readiness behind flags. Metrics passive probe due no earlier than 20:36 UTC.

## 2026-11-09: iteration 1576 — compose prepared general API admission

- Clean main/no leftovers; alerts clear. All 36 sources healthy, digest-generation failed count zero; no paid calls, migrations, flags, UI or generation changes.
- Added optional general API gate to public access stack/runtime, before account transport and authorization. Refusals retain security headers and empty no-store 429 responses. Stored runtime does not select it; visitor proof/registration remain open and accounts/public remain off.
- Composed offline HTTP tests verify account/reader/admin refusal before downstream work, trusted identity despite forged headers, dependency failure/recovery, health bypass and private rollback without limiter construction. Targeted stack/runtime tests: 5/5 pass.
- Updated readiness plan/TASKS; no active behavior or handbook changes. Hourly passive metrics probe at 20:36:21–23 UTC: 23 healthy rules, four queries ≤0.188 s, zero new evaluator errors/misses, no merges. Recovery remains open; next probe ≥21:36 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 780 unit and 274 integration tests/four expected skips. `pnpm build` passes with existing bundle warning; `git diff --check` passes.
- API/worker restarted; first health request raced startup, retry passes. Health/14-service checks and scheduled-reader gate pass (four topics/19 stories/14 posts); alerts clear. Invalid jobs CLI flag combination rejected; corrected read-only query confirms zero failures.
- Next: item 53 owner rerun still blocks activation; continue Phase 4 preparation behind flags.

## 2026-11-09: iteration 1577 — carry prepared admission through stored runtime

- Clean main/no leftovers; initial alerts/health/14-service checks pass. All 36 sources healthy; digest-generation failed count zero. No paid calls, migrations, flags, UI or generation changes.
- Stored access runtime now accepts the optional verified-client API gate already supported by its lower-level composition. Environment selection still supplies no gate; accounts/public remain off and item 53 owner rerun blocks activation.
- Added composed HTTP/storage lifecycle coverage: public refusal precedes account transport, recovery resumes requests, private rollback never constructs the limiter, closed runtime refuses requests, and limiter startup failure releases both account and write storage.
- Updated readiness plan/TASKS. No active behavior, source configuration or handbook changes.
- `pnpm exec tsx --test apps/api/test/stored-access-runtime.test.ts`: 4/4 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass (782 unit, 274 integration/four expected skips). `pnpm build`: pass with existing bundle warning; `git diff --check`: pass.
- API/worker restarted; initial health raced startup, curl retry passed. Post-restart health/14 services, scheduled-reader gate (four topics/19 stories/14 posts) and alerts pass.
- Next: continue Phase 4 preparation behind flags; production API gate needs proven visitor extraction before registration. Metrics passive probe due no earlier than 21:36 UTC.

## 2026-11-09: iteration 1578 — rehearse shared API admission over HTTP and Redis

- Clean main/no leftovers; alerts/health/14 services pass. All 36 sources healthy; digest-generation failed count zero. No paid calls, migrations, flags, UI or generation changes.
- Added composed HTTP acceptance with two prepared public instances and real isolated Redis connections. A concurrent burst admits exactly six of twenty requests before account/authorization work; forged headers do not replace the injected fixture identity.
- Verified client separation, private hashed keys, empty no-store/security-header refusals, missing identity, expired-window recovery, closed Redis refusal without downstream calls, health bypass and reconnection recovery. Fixture identity is no production visitor proof.
- Corrected readiness plan's stale stored-runtime statement and updated TASKS; archived iterations 1564–1566 to keep PROGRESS small. Active behavior/handbook/source configuration unchanged; accounts/public remain off awaiting item 53 owner rerun.
- `pnpm format`, `pnpm lint:fix` run. First `pnpm check` stopped on newly archived Markdown formatting; corrected it. Final full check passes typecheck/lint/format/boundaries, 782 unit and 275 integration tests/four expected skips. `pnpm build` passes with existing bundle warning; `git diff --check` passes.
- API/worker restarted; initial health request raced startup, retry passes. `pnpm obs health --check`, `pnpm obs services --check`, alerts and `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` pass: four topics/19 stories/14 posts.
- Next: Phase 4 preparation behind flags; production API admission registration still requires verified visitor extraction. Metrics passive probe due no earlier than 21:36 UTC.

## 2026-11-09: iteration 1579 — bound stalled API admission waits

- Clean main/no leftovers; alerts, health and 14 services pass. All 36 sources healthy; digest-generation failed count zero. No paid calls, migrations, flags, UI or generation changes.
- Prepared API HTTP admission now refuses stalled dependency checks after a configurable, validated three-second default deadline. Late allowance/rejection cannot dispatch the timed-out request; timers clear on completion. This bounds HTTP waiting, not the underlying Redis command.
- Offline HTTP tests verify empty no-store timeout refusal, late-result safety, health bypass, recovery and invalid deadlines. Targeted admission tests: 4/4 pass. Accounts/public stay off; item 53 owner proxy rerun still blocks activation.
- First full check exposed existing preference-test isolation: seven Redis keys present vs two expected. Scoped inspection/cleanup to that test's own hashed identities; final full check passes 784 unit and 275 integration tests/four expected skips, plus typecheck/lint/format/boundaries.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build` and `git diff --check` run; build passes with existing bundle warning. Handbook check (`public-access` filter) finds no page/render errors but exits nonzero for existing metadata references to unapplied account tables; migrations remain intentionally pending.
- Updated readiness plan/TASKS. API/worker restarted; first health raced startup, curl retry passed. Post-restart health/14 services, alerts and scheduled-reader check pass (four topics/19 stories/14 posts).
- Next: continue Phase 4 preparation behind flags; verified visitor extraction still required before production gate registration. Next passive metrics probe ≥21:36 UTC.

## 2026-11-09: iteration 1580 — stop disconnected admission dispatch

- Clean main/no leftovers; alerts, health and 14 services pass. All 36 sources healthy; digest queue failed count zero. No paid calls, migrations, flags, UI or generation changes.
- Prepared API admission now checks request abortion/response closure after its asynchronous decision, preventing disconnected callers from starting account or controller work. Real HTTP tests cover late allowance and refusal; accounts/public remain off awaiting item 53 owner rerun.
- Updated readiness plan/TASKS. `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 785 unit, 275 integration/four expected skips, typecheck/lint/format/boundaries. `pnpm build` passes with existing bundle warning; `git diff --check` passes.
- API/worker restarted; initial curl raced startup, retry passed. Health/14 services and scheduled-reader verification pass (four topics/19 stories/14 posts). No source or handbook behavior changed.
- Next: Phase 4 preparation behind flags; production visitor extraction remains blocked. Passive metrics probe due no earlier than 21:36 UTC.

## 2026-11-09: iteration 1581 — keep public Nest errors private

- Clean main/no leftovers; alerts, health and 14 services pass. Sources healthy; digest queue failed count zero. No paid calls, migrations, flags or generation changes.
- Added public-mode-only Nest exception filtering: empty no-store responses preserve failure status without exposing parser input, controller exception messages or stack traces. Private mode retains existing handling; accounts/public remain off awaiting item 53 owner rerun.
- Offline real Nest HTTP test checks GET/HEAD errors, invalid JSON, oversized JSON and missing routes (400/404/413/500); rejected parser bodies never reach the controller. Updated readiness plan/TASKS; archived iterations 1567–1569 to keep PROGRESS small. No active source/handbook behavior changed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 786 unit, 275 integration/four expected skips, typecheck/lint/format/boundaries. `pnpm build` passes with existing bundle warning; `git diff --check` passes.
- API/worker restarted; initial curl raced startup, retry passed. Post-restart health/14 services, alerts and scheduled-reader verification pass (four topics/19 stories/14 posts).
- Next: Phase 4 preparation behind flags; production visitor extraction remains blocked. Passive metrics probe due no earlier than 21:36 UTC.

## 2026-11-09: iteration 1582 — stop disconnected atomic admin writes

- Clean main/no leftovers; initial alerts, health and all 14 services pass. All 36 sources healthy; digest-generation failed count zero. No paid calls, migrations, flags, UI or generation changes.
- Prepared source-enable, topic-enable and topic-order HTTP transports now check connection liveness after asynchronous authentication, before cookie handling or transactional writes. Existing transactions are not cancelled. Accounts/public stay off awaiting item 53 owner proxy rerun.
- Three offline real HTTP tests disconnect during delayed authentication: zero mutations; a subsequent connected request succeeds for each transport. Updated readiness plan/TASKS; no active source or handbook behavior changed.
- Hourly passive metrics probe at 21:36 (`pnpm exec tsx scripts/sample-metrics-recovery.ts 1 10`): 23 healthy rules, four queries ≤0.438 s, zero new evaluator errors/misses/timeouts/slow queries; no merges or process restarts. Recovery remains open; next probe ≥22:36 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 789 unit, 275 integration/four expected skips, typecheck/lint/format/boundaries. `pnpm build` passes with existing bundle warning; `git diff --check` passes.
- API/worker restarted; initial curl raced startup, retry passed. Health/all 14 services, alerts and scheduled-reader check pass: four topics/19 stories/14 posts.
- Next: Phase 4 preparation behind flags; production visitor extraction still blocked. Passive metrics probe due ≥22:36 UTC.

## 2026-11-09: iteration 1583 — reject ambiguous account write headers

- Clean main/no leftovers; alerts and health pass. All 36 sources healthy; digest-generation queue has zero failed jobs. No paid calls, migrations, flags, UI or generation changes.
- Prepared account HTTP writes now require exactly one wire-level Origin and Content-Type before body reading or handler dispatch, matching the atomic admin transports. Accounts/public remain off pending item 53 owner proxy rerun.
- Offline real HTTP test rejects repeated identical/conflicting values and mixed casing with empty no-store responses, no cookie and zero handler calls; a subsequent valid request succeeds. Existing unfinished-upload size test now supplies valid write headers.
- Updated readiness plan/TASKS; no active source or handbook behavior changed. `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 790 unit, 275 integration/four expected skips, typecheck/lint/format/boundaries. `pnpm build` passes with existing bundle warnings.
- API/worker restarted; first curl raced startup, retry passed. Post-restart health, alerts and `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` pass: four topics/19 stories/14 posts.
- Next: continue Phase 4 preparation behind flags; production visitor extraction still blocked. Passive metrics probe due ≥22:36 UTC; not repeated this iteration.

## 2026-11-09: iteration 1584 — reject ambiguous account Cookie fields

- Clean main/no leftovers; alerts/health pass, all 36 sources healthy, all 14 services active and digest-generation failed count zero. No paid calls, migrations, flag, UI or generation changes.
- Owner value: future sign-in and account writes now refuse ambiguous wire-level session input before authentication or mutation. Prepared account transport rejects multiple Cookie fields, including mixed-case names; accounts/public stay off pending item 53.
- Offline real HTTP checks cover session reads, redemption and logout-all: identical/conflicting/unrelated repeated fields return empty no-store 400 without cookies or handler calls. One Cookie field with unrelated cookies and cookie-free redemption still reach their handlers.
- Updated readiness plan/TASKS; no active source or handbook behavior changed. Targeted `pnpm exec tsx --test apps/api/test/account-http.test.ts` passes all seven tests.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 791 unit, 275 integration/four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings; `git diff --check` passes.
- Pushed `5da85e54`; restarted API/worker. Post-restart health, zero alerts, all 14 services and scheduled-reader verification pass: four topics/19 stories/14 posts.
- Next: Phase 4 preparation behind flags; production visitor extraction remains blocked. Passive metrics probe due ≥22:36 UTC; not repeated this iteration.
