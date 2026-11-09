# Progress

Earlier entries: [iterations 1570–1576](docs/progress-archive/2026-11-09-1589.md); [iterations 1567–1569](docs/progress-archive/2026-11-09-1581.md); [iterations 1564–1566](docs/progress-archive/2026-11-09-1578.md); [iterations 1560–1563](docs/progress-archive/2026-11-09-1574.md); [iterations 1552–1559](docs/progress-archive/2026-11-09-1568.md); [iterations 1550–1551](docs/progress-archive/2026-11-09-1564.md); [iterations 1548–1549](docs/progress-archive/2026-11-09-1562.md); [through iteration 1547](docs/progress-archive/2026-11-09-1557.md); [through iteration 1539](docs/progress-archive/2026-11-09-1548.md).

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

## 2026-11-09: iteration 1585 — stop disconnected public authorization dispatch

- Clean main/no leftovers; initial alerts and health pass. All 36 sources healthy; digest-generation failed count zero. No paid calls, migrations, flags, UI or generation changes.
- Prepared public authorization checks liveness after asynchronous authentication and durable admin admission, before controller dispatch. Disconnect during authentication also skips audit admission; an audit already started may finish. Accounts/public stay off pending item 53.
- Offline real HTTP tests disconnect during each wait: zero controller calls, expected audit counts, then successful connected recovery. Updated readiness plan/TASKS; no active handbook or source behavior changed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 792 unit, 275 integration/four expected skips; typecheck/lint/format/boundaries green. Targeted public-access HTTP tests pass (2); `pnpm build` passes with existing bundle warnings; `git diff --check` passes.
- API/worker restarted; first health probe raced startup, retry passed. Post-restart health, all 14 monitored services, zero alerts and scheduled-reader check pass: four topics/19 stories/14 posts.
- Next: Phase 4 preparation behind flags; production visitor extraction awaits owner proof. Passive metrics probe due ≥22:36 UTC, not repeated this iteration.

## 2026-11-09: iteration 1586 — preserve account request text integrity

- Clean main/no leftovers; health/alerts pass, all 36 sources healthy, all 14 monitored services active and digest-generation failed count zero. No paid calls, migrations, flag, UI or generation changes.
- Prepared account writes now decode UTF-8 strictly before JSON parsing, refusing damaged bytes rather than silently changing reader data. Accounts/public remain off pending item 53 owner proxy rerun.
- Offline real HTTP tests cover invalid leading bytes, overlong encodings, surrogate encodings and truncated sequences: empty no-store 400, no cookie, zero handler calls. Valid multilingual text, emoji and an intentional replacement character survive byte-wise upload and reach the handler unchanged.
- Updated readiness plan/TASKS; no active source or handbook behavior changed. Targeted account HTTP tests pass (8). `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 793 unit, 275 integration/four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings; `git diff --check` passes.
- API/worker restarted; post-restart health, all 14 services, zero alerts and `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` pass: four topics/19 stories/14 posts.
- Next: Phase 4 preparation behind flags; production visitor extraction awaits owner proof. Passive metrics probe due ≥22:36 UTC, not repeated this iteration.

## 2026-11-09: iteration 1587 — reject unstoreable sync Unicode

- Clean main/no leftovers; health/alerts pass, all 14 monitored services active, sources healthy and digest-generation failed count zero. No paid calls, migrations, flags, UI or generation changes.
- Prepared reader sync rejects escaped lone Unicode surrogates in all six bookmark display fields and both preference-key collections before storage. JSON can carry these despite valid UTF-8; rejection avoids PostgreSQL JSON failures. Valid multilingual text, emoji, supplementary characters and replacement characters remain accepted.
- Offline policy tests cover malformed sequences in every field/key; HTTP checks return empty no-store 400, no cookie and zero storage writes. Updated readiness plan/TASKS; active source and handbook behavior unchanged. Accounts/public remain off pending item 53.
- Targeted `pnpm exec tsx --test apps/api/test/reader-sync.test.ts apps/api/test/reader-sync-http.test.ts` passes (6). `pnpm format`, `pnpm lint:fix`, `pnpm check` and `pnpm build` pass; 794 unit tests, 275 integration passes/four expected skips. Existing bundle warning only; `git diff --check` passes.
- Pushed `9d9aab11`; `systemctl --user restart news-digest-api.service news-digest-worker.service` completed. First health/reader probes raced startup; retries passed. `curl -fsS http://localhost:8000/healthz`, `pnpm obs services --check` (14 healthy), `pnpm obs alerts` (zero), and `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` pass (four topics/19 stories/14 posts).
- Next: continue Phase 4 preparation behind flags; visitor extraction awaits owner proof. Passive metrics probe due ≥22:36 UTC, not repeated this iteration.

## 2026-11-09: iteration 1588 — bound sync clocks to storage-safe years

- Clean main/no leftovers; health/alerts, all 14 services and sources pass; digest-generation failed count zero. Accounts/public remain off pending item 53 proxy proof. No paid calls, migrations, flag, UI or generation changes.
- New isolated PostgreSQL boundary test reproduced a real failure: year 10000 emits expanded ISO syntax rejected on insert. Prepared sync now refuses clocks beyond year 9999 before storage for both preference collections; HTTP returns empty no-store 400 with no cookie/writes.
- PostgreSQL tests verify epoch/year-9999 round-trips and rejected clocks preserve stored state. Policy/HTTP targeted tests pass (7); updated plan/TASKS. Active source/handbook behavior unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 795 unit, 275 integration/four expected skips; typecheck/lint/format/boundaries green. Initial boundary experiment failed as expected before the fix.
- Passive `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 10` at 22:36: 23 healthy rules, four queries ≤0.031 s, zero new evaluator errors/misses, no merges/restarts. Recovery remains open; next probe ≥23:36 UTC. Limits unchanged.
- `pnpm build` passes with the existing bundle-size warning; `git diff --check` passes. Final formatting/lint pass before commit.
- Push initially rejected because owner commits advanced main. Fetched and merged without rewriting history; new STEERING 53 says both appended entries are the visitor, retain last-entry selection, trust loopback, add observed-shape tests then start Phase 3. Read the private receipt metadata; removed obsolete rerun request and updated TASKS. No activation this step.
- API/worker restart preceded discovery of new API-only restart guidance; future API-only changes restart API alone. Post-restart health/services/alerts pass; `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` passes: four topics/19 stories/14 posts.

## 2026-11-09: iteration 1589 — accept proxy shape and begin Phase 3

- Clean main/no inherited work. Health/alerts, 14 services, source checks and queues pass; digest-generation failed count zero. Inspected private 19:47 receipt: both appended positions stable/public, peer loopback, forged email replaced; owner confirms both entries are the visitor.
- Kept last-entry selection. Added zero/one/two forged-prefix duplicate-visitor tests for IPv4/IPv6 and loopback variants, duplicate-header/untrusted-peer refusal and real HTTP transport. Configured explicit `127.0.0.1,::1` account proxy peers privately; accounts/public flags unchanged.
- Phase 3 started with `python3 ops/backups/rehearse_accounts.py`: fresh private backup, networkless restore, 30 original fingerprints preserved, injected rollback, real runner twice/idempotent, eight private tables and three hostile reader roles denied. Live migrations unchanged; private receipt saved.
- `pnpm exec tsx --test apps/api/test/proxy-client.test.ts` passes (4). `pnpm exec tsx scripts/smoke-account-code-lifecycle.ts` passes desktop/mobile composed HTTPS fixture checks; no live account writes. Discarded regenerated replay screenshot because UI is unchanged.
- Updated activation checklist, readiness plan, TASKS, NEEDS and item 53 ack. `pnpm exec tsx scripts/check-handbook.ts account-activation` passes (18 pages); existing eight pending account-table metadata warnings remain until live migration.
- First `pnpm check` failed one unrelated cleanup test (killed-run folder conservatively retained); isolated `pnpm exec tsx --test apps/api/test/integration-temp.test.ts` passes. Full retry passes; no cleanup implementation changed.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` retry and `pnpm build` pass: 796 unit, 275 integration/four expected skips; existing bundle warning only. API-only restart completed; `/healthz`, 14 services and saved-reader check pass (four topics/19 stories/14 posts). `git diff --check` passes. Archived iterations 1570–1576 to keep PROGRESS small.
- Next: guarded live bounded migrations/account deployment and dedicated acceptance, then exact owner two-device steps once ready. Public mode stays off; no paid calls. Next passive metrics probe ≥23:36 UTC.
