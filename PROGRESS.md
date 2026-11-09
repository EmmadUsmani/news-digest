# Progress

Earlier entries: [through iteration 1528](docs/progress-archive/2026-11-09-1540.md).

## 2026-11-09: iteration 1529 — prepare exclusive public access stack

- Clean main/no leftovers; alerts and healthz healthy, all 36 sources healthy, jobs check passes and no failed user services.
- Prepared unmounted access-stack selector constructs either public authorization or the legacy header guard, never both. Account transport runs first; public composition without account transport fails before constructing authorization resources.
- Offline loopback checks verify account transport termination, anonymous reader access, rejection of proxy-email admin bypass and refusal of unclassified tool routes before downstream handlers. Private mode keeps legacy authorization without constructing public resources.
- Updated rollout plan/TASKS. No live flags, routes, migrations, UI, generation or provider calls changed; accounts remain disabled.
- Verification: focused HTTP tests (2 pass), pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass. Full check: 755 unit/268 integration passes, four expected skips; existing bundle warnings only.
- No restart: uninstalled preparation is not loaded by live services (STEERING 22), and the 13:00–16:00 deployment hold applies. Next: live mounting, atomic queue effects/proxy proof and Nov 9 15:00 scheduled acceptance.

## 2026-11-09: iteration 1530 — combine prepared access runtime ownership

- Clean main/no leftovers; alerts and healthz healthy, source/job checks pass and no failed user services. Scheduled Nov 9 edition remains queued for 15:00 UTC.
- Prepared combined runtime joins bounded account transport, account-backed transactional source routing and exclusive public/legacy authorization. Missing public transport refuses before storage acquisition; private mode opens no public resources.
- Exposes repeatable source-pool shutdown for application ownership and cleans up on stack-construction failure; account/ordinary admission resources remain caller-owned.
- Offline HTTP/resource checks verify account-first routing, public reader access, rejection of proxy identity and foreign-origin source writes, single pool shutdown and private-mode isolation. Corrected the initial test's expected source-boundary refusal status from 403 to its existing 400 contract.
- Updated rollout plan/TASKS. No live flags, generation, migrations, provider calls or UI changed; accounts remain disabled.
- Verification: focused tests (2 pass); pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass. Full check: 757 unit/268 integration passes, four expected skips; existing bundle-size warning only.
- No restart: unmounted preparation is not loaded by services (STEERING 22); 13:00–16:00 deployment hold remains active. Next: live mounting, atomic queue effects/proxy proof and 15:00 scheduled acceptance.

## 2026-11-09: iteration 1531 — own shared account and access storage

- Clean main/no leftovers; alerts/healthz healthy, all 36 sources healthy, jobs available, no failed user services; latest saved reader returns four topics.
- Prepared stored access composition shares the same account handlers between bounded login transport and public authorization, and owns account, source and lazy standalone-admission storage together. Existing private bootstrap preserves its middleware-only contract.
- Shutdown attempts every owner despite cleanup failures, returns one repeatable promise and refuses subsequent requests. Missing account transport cleans up before source storage opens.
- Five focused HTTP/bootstrap/Nest tests pass; persisted login acceptance now verifies that the shared authorization handler resolves the fresh admin session and refuses invalid credentials.
- Updated rollout plan/TASKS. No flags, migrations, provider calls, UI or edition-generation changes; accounts remain disabled and public runtime unmounted.
- Verification: pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass. Full check: 759 unit/268 integration passes, four expected skips; existing bundle-size warning only. No live external test calls.
- No restart/deployment during STEERING 50's 13:00–16:00 UTC hold. Disabled-path bootstrap refactor awaits the next permitted deployment; live mounting, atomic queue effects/proxy proof and 15:00 scheduled acceptance remain open.

## 2026-11-09: iteration 1532 — prepare Nest access runtime ownership

- Clean main/no leftovers; alerts and healthz healthy, all 36 sources healthy, scheduled jobs available and no failed user services.
- Prepared unregistered Nest access provider awaits the shared stored runtime before exposing middleware and delegates application shutdown to its owner. It must replace the separate account provider when mounted.
- Two focused tests pass: actual Nest HTTP mounting handles malformed JSON before body parsers, shutdown runs once, and startup refusal propagates without publishing middleware.
- Updated rollout plan/TASKS. No live flags, routes, migrations, UI, generation or provider calls changed; accounts remain disabled.
- Verification: pnpm exec tsx --test apps/api/test/access-provider.test.ts, pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass. Full check: 761 unit/268 integration passes, four expected skips; existing bundle warnings only. Final healthz healthy.
- No deployment/restart during STEERING 50's 13:00–16:00 UTC hold; provider remains unregistered. Next: 15:00 scheduled acceptance, live mounting, atomic queue effects and proxy proof.

## 2026-11-09: iteration 1533 — prepare access environment selection

- Clean main/no leftovers; alerts/healthz healthy, all 36 sources healthy, collection jobs completing and no failed user services.
- Prepared unregistered environment-configured access provider: PUBLIC_MODE defaults off, accepts only 0/1 and requires enabled accounts plus an exact HTTPS ACCOUNT_ORIGIN before public storage opens.
- Existing admin email/local-token configuration flows to private authorization; configured factory remains lazy and delegates runtime shutdown to Nest.
- Four focused tests pass, including six invalid public configurations refused before storage acquisition and private/public forwarding. Updated rollout plan/TASKS; no live flags, routes, migrations, UI, generation or provider calls changed.
- Verification: pnpm exec tsx --test apps/api/test/access-provider.test.ts, pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass; 763 unit/268 integration passes, four expected skips. First full check stopped on progress-entry formatting; corrected and rerun green. Existing bundle-size warning only.
- No deployment/restart under STEERING 50's 13:00–16:00 UTC hold; provider remains unregistered and accounts disabled. Next: normal 15:00 scheduled acceptance, live mounting, atomic queue effects and proxy proof.

## 2026-11-09: iteration 1534 — register one application access owner

- Clean main/no leftovers; alerts and healthz healthy at orientation.
- AppModule now imports one AccessModule instead of AccountsModule; main mounts the combined runtime before body parsers/tool proxies and removes its separate legacy guard. Private selection preserves the existing guard and disabled accounts open no resources.
- Five focused access-provider tests pass, including real registered-module HTTP acceptance: private admin refusal/allow, identity response, reader and disabled account pass-through, and no old ACCOUNT_HTTP provider. Initial disabled-account assertion incorrectly expected 404 from a catch-all test handler; corrected to verify pass-through.
- Updated rollout plan/TASKS; no flags, migrations, UI, generation or live provider calls changed. Public/accounts activation remains disabled.
- Verification: pnpm exec tsx --test apps/api/test/access-provider.test.ts, pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass; 764 unit/268 integration passes, four expected skips. Existing bundle-size warning only. Final healthz healthy; latest saved edition available; no failed user services.
- No deployment/restart during the 13:00–16:00 UTC owner hold. Next: 15:00 scheduled acceptance, permitted deployment, public activation prerequisites and atomic queue effects.

## 2026-11-09: iteration 1535 — public Nest boundary acceptance

- Clean main/no leftovers; alerts and healthz healthy, no failed user services, latest saved edition available.
- Added configured public-provider acceptance through a real Nest HTTP server and the complete stored access composition, with isolated session/storage stand-ins and no live external calls.
- Anonymous reader requests pass; proxy identity headers cannot authorize admin reads/writes; unknown tool routes refuse; invalid write provenance stops before session lookup, admission storage or controllers. Session outages return empty 503; Nest closes both resource owners.
- First focused run expected 403 for both provenance boundaries; corrected the source expectation to its existing 400 contract. Six focused tests pass.
- No runtime behavior, flags, migrations, UI or generation changes. Updated rollout plan/TASKS; public/accounts remain disabled.
- Verification: pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass; 765 unit/268 integration passes, four expected skips; existing bundle warning only. First full check hit intermittent integration-temp cleanup refusal (expected stale removal, got none); isolated rerun and full retry pass without code changes. No live external calls.
- No deployment/restart during the owner's 13:00–16:00 UTC hold. Next: 15:00 scheduled acceptance, permitted deployment, proxy proof and atomic queue effects.

## 2026-11-09: iteration 1536 — prepare atomic topic-enable persistence

- Clean main/no leftovers; local alerts and healthz healthy, no failed user services; latest saved edition responds with four topics.
- Added disconnected PublicTopicWriter for the system catalog: exact UUID/PUT target and boolean validation, row-locked enable changes, and changed/unchanged audit outcomes in one transaction. Caller retains authorization and pool ownership; no runtime/controller registration.
- Isolated database acceptance verifies missing-topic rollback, concurrent identical toggles, target refusal, invalid-actor refusal, outcome-storage failure rolling back the topic and admission, and successful recovery.
- Updated rollout plan/TASKS. No migrations, live flags, UI, generation or external calls changed; accounts/public mode remain off.
- Verification: pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass; 765 unit/269 integration passes, four expected skips. Existing bundle-size warning only. Final healthz healthy.
- No deployment/restart during the owner's 13:00–16:00 UTC hold. Next: scheduled 15:00 acceptance, permitted deployment, topic HTTP replacement, proxy proof and atomic queue effects.

## 2026-11-09: iteration 1537 — prepare topic-enable HTTP boundary

- Clean main/no leftovers; alerts and healthz healthy, no failed user services.
- Added uninstalled topic-enable transport: exact UUID/PUT target, bounded one-field JSON, wire-header multiplicity and Origin checks before fresh-admin lookup; writer owns atomic admission/mutation.
- Real loopback HTTP checks cover changed/unchanged/missing results, stale/absent/invalid actors, cookies, malformed and oversized bodies, streamed limits, duplicate headers, private errors and direct-local script provenance. First run found a copied source-ID expectation; corrected to the topic UUID.
- Updated rollout plan/TASKS. No registration, migrations, live flags, UI, edition generation or external calls changed; public/accounts remain off.
- Verification: focused HTTP tests, pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass; 767 unit/269 integration passes, four expected skips; existing bundle warning only.
- No deployment/restart during the owner's 13:00–16:00 UTC hold. Next: 15:00 scheduled acceptance, permitted deployment, topic runtime/controller replacement, proxy proof and atomic queue effects.

## 2026-11-09: iteration 1538 — wire atomic topic-enable public routing

- Clean main/no leftovers; alerts and healthz healthy, no failed user services; latest saved edition has four topics.
- Wired topic-enable transport and transactional writer into the default-off public runtime; source/topic writers share its owned pool and bypass standalone admission and legacy controllers.
- Routing acceptance covers successful source/topic writes, malformed topic targets, unsupported methods, disabled resource laziness and shared shutdown. Initial focused run caught topic-order interception; exempted its exact route and retained ordinary authorization/provenance checks.
- Updated rollout plan/TASKS. Public/accounts flags remain off; no migrations, generation changes or live external calls.
- Verification: focused router/topic HTTP/access tests, pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass; 767 unit/269 integration passes, four expected skips; existing bundle warning only.
- No deployment/restart during the owner's 13:00–16:00 UTC hold. Next: 15:00 scheduled acceptance, permitted deployment, proxy proof and atomic queue effects.

## 2026-11-09: iteration 1539 — verify combined topic HTTP/database transactions

- Clean main/no leftovers; pnpm obs alerts reports zero active alerts, healthz database/Redis healthy, no failed user services; latest live saved edition serves four topics.
- Added isolated combined public-access runtime acceptance over real loopback HTTP and migrated Testcontainers Postgres. Concurrent identical toggles persist exactly one changed and one unchanged audit outcome, bypassing standalone admission and legacy controllers.
- Invalid persisted actors refuse with empty 503 and no mutation/admission; missing topics refuse with empty 404 and no extra admission. Injected audit-outcome failure returns empty 503, rolls back the topic change and leaves audit count unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass; 767 unit/270 integration passes, four expected skips. First check raced the unfinished import-sort autofix; sequential retry passes. Existing build warnings only; no live external calls.
- Updated TASKS; no runtime behavior, migrations, flags, UI or generation changes. Public/accounts remain off. No deployment/restart during the owner's 13:00–16:00 UTC hold.
- Next: 15:00 scheduled edition acceptance, permitted deployment after 16:00, live proxy proof and atomic queue effects.

## 2026-11-09: iteration 1540 — prepare atomic topic reordering

- Clean main/no leftovers; zero active alerts, healthz database/Redis healthy, no failed user services. All 36 sources healthy, four queues available, latest published edition has four topics; no failed digest jobs.
- Prepared disconnected system-catalog reorder writer with exact route/method and unique bounded UUID validation. Shares legacy create/delete/reorder catalog lock; ordering and changed/unchanged audit outcome commit together.
- Isolated Postgres acceptance passes concurrent identical ordering, exact persisted outcomes, stale/missing IDs, malformed/duplicate/oversized inputs, invalid actors and audit-outcome failure rollback; subsequent success proves pool reuse.
- Verification: pnpm format, pnpm lint:fix, pnpm build, pnpm check and git diff --check pass; 767 unit/271 integration passes, four expected skips; existing build warnings only. No live external verification calls.
- Updated TASKS/rollout plan; archived iterations 1519–1528 to keep this log small. No HTTP registration, flags, migrations, generation changes or live edition writes; public/accounts remain off.
- No deployment/restart during the owner's 13:00–16:00 UTC hold. Next: 15:00 scheduled edition review, permitted deployment after 16:00, live proxy proof, topic-order HTTP replacement and atomic queue effects.

## 2026-11-09: iteration 1541 — prepare atomic topic-order HTTP boundary

- Clean main/no leftovers; alerts clear, healthz database/Redis healthy, no failed user services; all 36 sources healthy and queue checks pass. Latest published edition serves four topics.
- Prepared unregistered exact-PUT topic-order transport: bounded unique UUID catalog, fresh-admin checks after upload, strict Origin/content-type multiplicity and authenticated direct-script provenance.
- Public responses project changed/unchanged only; stale catalogs return empty 409, invalid actors/dependency failures empty 503. Loopback HTTP tests cover malformed/duplicate/oversized input, streamed limits, session renewal and secret-free failures.
- Updated rollout plan/TASKS. No runtime registration, migrations, flags, generation changes or external calls; public/accounts remain off.
- Verification: focused HTTP tests, pnpm format, pnpm lint:fix, pnpm build and pnpm check and git diff --check pass; 769 unit/271 integration passes, four expected skips. Existing bundle warning only.
- No deployment/restart during owner's 13:00–16:00 UTC hold. Nov 9 15:01 snapshot: scheduled generation active, zero failed jobs. Next: review its completed edition, permitted deployment after 16:00, proxy proof and topic-order runtime registration.

## 2026-11-09: iteration 1542 — review Nov 9 scheduled publication

- Clean main/no leftovers; initial alerts clear. Scheduled edition ab346e19-8800-49e9-a7f7-5c6a5207d1d6 completed once at 15:02:54 UTC: full-ai, 174.631 s, 659 candidates, 19 stories/14 posts.
- Read-only report-edition-timing and report-x-discovery: Anthropic $0.388257/51 settled successful calls, X $0.260092/four completed tools, zero holds. Forty new verified outside-list candidates; two NBA cited selections, zero other topics.
- Read all saved summaries/evidence and posts/context; recorded evidence depth and social observations in docs/edition-reviews/2026-11-09.md and docs/SOURCES.md. World zero X and Tech first recorded Bluesky replacement require diagnosis; no acceptance claimed.
- Local latest/direct/history endpoints expose today's edition. pnpm obs health/services/sources --check pass: DB/Redis, 14 services, 36 sources; digest queue zero failed/active, next run Nov 10 15:00 UTC.
- No code, application-data writes, external calls, flags or migrations. No restart/deployment during owner's 13:00–16:00 hold; live runtime unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass; 769 unit/271 integration passes, four expected skips. Documentation-only step; no build/runtime change.
- Next: saved World X rejection/Tech replacement diagnosis, paid novelty/Bluesky links, phase-1 scheduled parity; then account runtime topic-order wiring and permitted deployment/proxy proof.

## 2026-11-09: iteration 1543 — diagnose saved World X and Tech replacement

- Clean main/no leftovers; pnpm obs alerts clear, obs health/services/sources --check pass: DB/Redis, 14 services and 36 sources healthy.
- Read-only immutable edition/cache/stored official text: World has 20 scored posts, 19 fail semantic gates; only unsourced Iran missile-range claim qualifies. Retained final editor result is empty; no saved rejection rationale, budget fallback or Bluesky displacement.
- Tech saved editor order verifies reserved-slot replacement removes fifth-ranked Emil Kowalski skills-doc release, retains first four X picks and adds distinct WIRED safety investigation; five posts total. Useful builder material displaced; no superior virality claimed.
- Read-only tsx assertions pass: World gate/sports counts, empty selection, open slots, exact Tech replacement ID and preserved X order. Updated daily review, SOURCES and TASKS; social acceptance remains open.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 769 unit/271 integration passes, four expected skips; API rebuild included in isolated suite. No runtime/UI changes, inference, application-data writes, migrations or flags.
- No restart/deployment during owner's 13:00–16:00 UTC hold; public/accounts remain off. Next: paid novelty, Bluesky destinations and phase-1 scheduled ownership/original-response/browser parity.

## 2026-11-09: iteration 1544 — accept Phase 1 after scheduled publication

- Clean main/no leftovers; alerts clear; obs health/services/sources --check pass: database/Redis, 14 services and 36 sources healthy.
- API/worker read-only process checks verify SYSTEM_OWNERSHIP=1, both started before today's normal full-AI scheduled publication; SQL confirms published scheduled kind/key and rollback default-profile owner.
- Live read-only rehearse-system-reads.ts verifies all 553 saved editions, complete reader/adapter responses, both publication filters, history, topics/settings across process-local off/on/off; no live service flag changes.
- check-scheduled-reader.ts passes four topics/19 stories/14 posts; compare-publication-content.ts verifies five original committed response hashes.
- Fresh inventory-editions.ts plus smoke-publication-candidates.ts passes all seven published editions API/per-topic counts/titles, desktop/mobile light/dark; external traffic and writes blocked. Initial ad hoc SQL omitted default URL and failed; corrected connection passes.
- Phase 1 accepted/acked; updated rollout/activation plan, daily receipt and TASKS. Prior live private AI-off/AI-on and restore/rollback evidence retained; no new provider calls or application writes.
- Development totals remain Anthropic $0.211076/xAI $0. No migrations, deployment or restarts during 13:00–16:00 hold; accounts/public remain off.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 769 unit/271 integration passes, four expected skips; API rebuild included in isolated suite. No runtime/UI changes.
- Next: Phase 3 proxy proof and guarded activation; daily paid-candidate novelty/Bluesky destinations remain open.

## 2026-11-09: iteration 1545 — wire atomic topic ordering into guarded runtime

- Clean main/no leftovers; pnpm obs alerts clear; obs health/services/sources --check pass: DB/Redis, 14 services and 36 sources healthy.
- Documented exe.dev proxy URL remains unreachable from VM (curl connection failure); no browser connector is available. Updated NEEDS_FROM_HUMAN; no inferred proxy trust or account activation.
- Default-off public runtime now routes bounded topic-order PUT through the atomic writer before standalone admission/controllers, sharing account authentication and the owned writer pool. Disabled mode constructs no new resources.
- Targeted HTTP/router tests pass (7/7). New isolated composed HTTP/Postgres check verifies admin refusal, changed/unchanged outcomes, stale-catalog 409 and audit-failure 503 with unchanged ordering/admission count; no standalone recorder/controller execution.
- Updated rollout plan, affected handbook note and TASKS. pnpm exec tsx scripts/check-handbook.ts 07-data-model verifies 18 pages/3 diagrams, but exits 1 solely on existing metadata warnings for unapplied account tables. No diagram changes.
- pnpm build passes. check-scheduled-reader.ts 2026-11-09T15:00:00Z passes four topics/19 stories/14 posts; pnpm obs jobs --check passes, zero failed/active digest jobs, next Nov 10 15:00 UTC. Initial jobs --check with filters refused CLI syntax; corrected unfiltered check passes.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 769 unit/272 integration passes, four expected skips; API rebuild included in isolated suite.
- No provider calls, application writes, migrations, flags or UI changes. No restart/deployment during 13:00–16:00 UTC hold; accounts/public remain disabled, live runtime unchanged.
- Next: live proxy proof and guarded account activation when obtainable; deploy prepared main after 16:00 UTC. Daily paid novelty/Bluesky destination acceptance remains open.
