# Progress

Earlier entries: [through iteration 1539](docs/progress-archive/2026-11-09-1548.md).

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

## 2026-11-09: iteration 1546 — verify selected paid-candidate novelty

- Clean main/no leftovers; pnpm obs alerts clear; obs health/services/sources --check pass: DB/Redis, 14 services and 36 sources healthy.
- Matched all ten immutable selected X posts to today's forty keyword citations in a read-only database transaction; saved allowlisted evidence in the daily review JSON.
- Two selected NBA candidates (Hoop Central Acuff statistics, Kyle Ingram LaMelo dunk) are new/outside current lists, with zero earlier search or retained free-link/feed/Reddit citations. Other topics select no paid citations.
- Reported likes 3,235/1,664 are unverified; all ten selected X official metrics remain empty. Novel selected candidates fall from eight on Nov 8 to two today; quality/virality acceptance remains open.
- Read-only evidence assertions pass: forty citations, exactly two novel NBA picks, empty official metrics and zero retained free provenance. check-scheduled-reader.ts 2026-11-09T15:00:00Z passes four topics/19 stories/14 posts.
- Updated daily review, SOURCES and TASKS. pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 769 unit/272 integration passes, four expected skips; API rebuild included in isolated suite.
- Documentation/evidence only; no provider calls, source fetches, application-data writes, flags, migrations or UI changes. No restart/deployment during 13:00–16:00 UTC hold; live runtime unchanged.
- Next: saved Bluesky destination acceptance; live proxy proof/guarded activation remains blocked, prepared runtime deployment waits until after 16:00 UTC.

## 2026-11-09: iteration 1547 — verify saved Bluesky destinations

- Clean main/no leftovers; pnpm obs alerts clear; obs health/services/sources --check pass: DB/Redis, 14 services and 36 sources healthy.
- GET/HEAD-only Playwright replay of immutable Nov 9 reader passes all four Bluesky cards on desktop/mobile light/dark: exact saved display text, original/expanded hrefs, no nested links/overflow/page errors; external requests blocked.
- Independent retains its article URL; Alberta expands to Global News surgical-fees article and separately links publisher homepage. WIRED/Warriors supply no inline article URL. Saved allowlisted href evidence and inspected desktop/mobile screenshots; no fixtures or content rewrites.
- Initial replay expected raw text; corrected assertion to saved displayText, which intentionally expands shortened links. No application defect found.
- check-scheduled-reader.ts 2026-11-09T15:00:00Z passes four topics/19 stories/14 posts. Updated daily review, SOURCES and TASKS; World social quality remains open.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 769 unit/272 integration passes, four expected skips; API rebuild included in isolated suite.
- Documentation/evidence only; no provider calls, source fetches, application writes, flags, migrations or runtime changes. No restart/deployment during 13:00–16:00 UTC hold.
- Next: live proxy proof and guarded Phase 3 activation remain blocked; prepared runtime deployment waits until after 16:00 UTC. Complete remaining third-edition social acceptance without tuning.

## 2026-11-09: iteration 1548 — deploy prepared default-off API runtime

- Clean main/no leftovers; initial alerts clear, health/services/sources/jobs checks pass. Deployment hold ended at 16:00 UTC.
- Deployed API runtime from `5fc1fac0`; news-digest-api restarted at 16:06:57 UTC, healthy with zero restarts. No generation-code changes since the previous API start; worker left running under noon cutoff.
- Accounts/public remain unset (disabled), SYSTEM_OWNERSHIP=1; no environment changes, migrations, account writes or provider verification calls. Proxy proof still blocks activation.
- Latest/history GET response SHA-256 hashes identical before/after restart; check-scheduled-reader.ts 2026-11-09T15:00:00Z passes four topics/19 stories/14 posts.
- pnpm obs health, services --check, sources --check, jobs --check pass: 14 services/36 sources healthy, zero failed/active digest jobs, Nov 10 15:00 UTC next. Alerts clear.
- Read-only Playwright desktop/mobile reader checks pass with external requests blocked and no page errors. Initial mobile selector hit a hidden navigation label; corrected to visible topic heading. Initial /api/topics baseline probe returned 404; used published latest/history routes instead.
- pnpm format, pnpm lint:fix, pnpm check, pnpm build pass: 769 unit/272 integration, four expected skips; existing web chunk-size warning only. git diff --check passes.
- Updated TASKS/public-access preparation receipt; archived older progress to keep orientation small. No product behavior or handbook change.
- Next: documented live proxy proof and guarded Phase 3 activation; complete remaining third-edition social acceptance without tuning. No sharing changes.

## 2026-11-09: iteration 1549 — complete third-edition social diversity review

- Clean main/no leftovers; alerts clear. obs health/services/sources/jobs checks pass: DB/Redis, 14 services and 36 sources healthy; no failed digest run.
- GET-only comparison of Nov 7–9 immutable published editions retains 49 selected posts (37 X/12 Bluesky), zero repeated platform/external-ID pairs. Evidence fields rechecked against all three reader responses.
- Read all fourteen Nov 9 originals: four Bluesky contributions distinct from today's X. Tech has three Gurman/Apple X picks; Gaming only GTA VI. World has no X and weak Bluesky engagement.
- Diversity/text review complete; overall viral-quality acceptance not met. Exact-post uniqueness does not settle semantic repetition across days; no media inspection or new provider/source requests.
- Updated daily review, SOURCES and TASKS with decision and retained allowlisted evidence. No collection/ranking/budget/flag/migration/application-data changes; tuning waits for item 50.
- check-scheduled-reader.ts 2026-11-09T15:00:00Z passes four topics/19 stories/14 posts; evidence assertions pass all 49 unique IDs and stored fields.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 769 unit/272 integration passes, four expected skips; API rebuild included in isolated suite.
- Documentation/evidence only; deployed application runtime already matches main, no service restart needed. Account/public flags remain off; live proxy proof still gates activation.
- Next: item 50 live proxy proof/guarded activation; continue daily edition reviews without social tuning.

## 2026-11-09: iteration 1550 — passive recovery follow-up

- Clean main/no leftovers; alerts clear; obs health/services/sources/jobs checks pass, 14 services and 36 sources healthy.
- Owner value: verify monitoring remains responsive while keeping account activation behind the required live proxy proof.
- Rechecked documented private HTTPS health URL with bounded curl: connection refused from this VM; accounts/public remain off. No sharing changes or undocumented access attempted.
- Permitted short passive metrics sample at 16:18 UTC: 23 fresh healthy rules, four uncached queries ≤0.186 s, zero new evaluator errors/missed iterations. Neither tier merged; compaction recovery remains open.
- Updated capacity evidence/TASKS and corrected stale next-step text: Nov 9 social reviews complete; overall viral-quality acceptance remains unmet.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 769 unit/272 integration passes, four expected skips. Scheduled reader check passes four topics/19 stories/14 posts; API rebuild included in isolated suite.
- No runtime, provider, source, migration or application-data changes; deployed runtime already matches main, no restart needed.
- Next: live proxy proof/guarded Phase 3 activation; next passive metrics check no earlier than 17:18 UTC.

## 2026-11-09: iteration 1551 — ship the privacy page

- Clean main/no leftovers; alerts clear; health, 14 services, 36 sources and digest jobs healthy. Hourly metrics probe not due until 17:18 UTC; no extra sample.
- Owner value: readers can now understand what the app stores and how to remove it, completing the missing Phase 4 privacy page while Phase 3 waits on proxy proof.
- Added `/privacy` and reader footer link: browser choices, technical error reports, third-party embeds/proxy, flag-aware account storage, deletion and backup retention. GET/HEAD classified public-read; no account/public activation.
- `pnpm exec tsx scripts/smoke-privacy.ts` passes desktop/mobile light/dark with accounts off/on, reload, overflow and zero API/external requests. Four screenshots saved and inspected; corrected inherited section spacing.
- `pnpm check` passes typecheck/lint/format/boundaries and 769 unit tests, but its integration child was terminated (143); separate attached retry also terminated without assertions failing. Detached `pnpm test:integration` exits 0: 272 passes, four expected skips.
- `pnpm build` and final web rebuild pass (existing chunk warning). Handbook check passes 18 pages/one diagram; expected metadata warnings for unapplied account tables remain.
- Restarted API/worker; first immediate probe preceded readiness, retry healthy. Deployed desktop/mobile footer→privacy→reload→latest browser checks pass without page errors.
- Latest/history response hashes unchanged; scheduled reader check passes four topics/19 stories/14 posts. Post-restart alerts clear, services/sources/queues healthy.
- Updated TASKS, public-access plan, affected handbook and screenshot receipt. No providers, migrations, configuration, source requests or live account writes.
- Next: Phase 3 live proxy proof/guarded activation; continue unfinished Phase 4 readiness while blocked. Accounts/public remain off; metrics recovery remains open.
