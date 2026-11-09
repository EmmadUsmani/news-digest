# Progress

Earlier entries: [through iteration 1547](docs/progress-archive/2026-11-09-1557.md); [through iteration 1539](docs/progress-archive/2026-11-09-1548.md).

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

## 2026-11-09: iteration 1552 — prepare public security headers

- Clean main/no leftovers; alerts clear; health, 14 services, 36 sources and scheduled digest jobs healthy. Hourly metrics probe not due until 17:18 UTC; no extra sample.
- Owner value: the prepared public stack now protects reader/account responses from MIME guessing, referrer disclosure and external framing before public activation.
- Added public-only HSTS (one year, host only), nosniff, no-referrer, SAMEORIGIN and CSP base/object/ancestor restrictions before account transport and authorization. Private mode remains unchanged.
- Wire-level GET/HEAD, account, reader and denied-route checks pass, including forged forwarded protocol; targeted stack/runtime tests pass 4/4.
- Local Chromium synthetic-content check passes: external base URL refused, same-origin tool iframe and scripts work. No live embeds or provider calls; script/connect resource allowlists remain a readiness gate.
- Updated public-access plan, affected handbook and TASKS. Handbook check passes 18 pages/one diagram; expected metadata warnings for unapplied account tables remain.
- Rechecked documented private HTTPS health URL: VM connection refused; no proxy trust established. Accounts/public flags stay off, no migrations/configuration/source changes.
- Verification: pnpm format, pnpm lint:fix, pnpm check, pnpm build and git diff --check pass: 769 unit/272 integration passes, four expected skips; existing bundler warnings only.
- Restarted API/worker outside the hold; initial pre-readiness curl retried successfully. Health and post-restart alerts pass; scheduled reader check passes four topics/19 stories/14 posts.
- Next: live proxy proof/guarded Phase 3 activation; continue Phase 4 resource-policy and remaining public-readiness work while blocked.

## 2026-11-09: iteration 1553 — prepare published-edition caching

- Clean main/no leftovers; alerts, health, 14 services, 36 sources and digest queue healthy. Passive metrics check not due until 17:18 UTC; no extra probe.
- Prepared public mode now allows one-hour browser-private caching of successful published-edition ID responses, only with exact PUBLIC_MODE=1 and READER_PUBLISHED_ONLY=1 gates.
- Latest/history and other ID reads explicitly use no-store. Public errors retain no-store; account/admin cache policy is unchanged. Private cache scope avoids sharing content through the authenticated VM proxy.
- Extended isolated published-reader HTTP acceptance with the real public-read middleware: GET/HEAD, published/hidden/missing/malformed IDs, empty HEAD bodies and off/nonexact/missing filter rollback pass. No account dependencies or live writes.
- Updated TASKS, public-access plan and runtime handbook. Handbook check passes 18 pages/one diagram; existing metadata warnings concern unapplied account tables.
- pnpm format, pnpm lint:fix, pnpm check, pnpm build and git diff --check pass: 769 unit/272 integration passes, four expected skips; existing bundler warnings only.
- Restarted API/worker outside the hold. Health/alerts clear; latest/history response hashes unchanged; deployed private ID GET/HEAD and latest/history return no-store.
- Scheduled reader check passes four topics/19 stories/14 posts. No provider, source, migration or configuration changes; accounts/public stay off.
- Next: live proxy proof and guarded Phase 3 activation; remaining Phase 4 resource-policy/readiness work while blocked. Metrics probe no earlier than 17:18 UTC.

## 2026-11-09: iteration 1554 — constrain public form destinations

- Clean main/no leftovers; alerts clear and local health/API/worker healthy. Passive metrics probe not due until 17:18 UTC; no extra sample.
- Prepared default-off public CSP now includes form-action self, preventing forms from sending reader data to another origin. Account login/link pages retain their stricter form-action none.
- Added reusable synthetic local Chromium proof: external POST blocked with form-action violation and zero foreign submissions, same-origin POST succeeds, private rollback permits the foreign POST. No external traffic or live account writes.
- Initial browser harness navigation waits timed out on CSP-blocked navigation; corrected to observe the violation and use a separate page for the permitted submission. Final replay passes.
- Public-stack HTTP checks pass 2/2 across account, reader GET/HEAD and denied routes; updated public-access plan, affected runtime handbook and TASKS.
- pnpm format, pnpm lint:fix, pnpm check (769 unit/272 integration passes, four expected skips), pnpm build and git diff --check pass; handbook check passes 18 pages/one diagram with existing unapplied-account metadata warnings. Existing bundler warning only.
- Restarted API/worker; first pre-readiness health probe retried successfully. Health/alerts clear; latest/history bytes unchanged. Scheduled reader check passes four topics/19 stories/14 posts. No provider, source, migration or configuration changes; accounts/public stay off.
- Next: live proxy proof and guarded Phase 3 activation; remaining Phase 4 resource allowlist/readiness. Metrics probe no earlier than 17:18 UTC.
- First push rejected (remote advanced); fetched and merged owner status commit 712bec1e unchanged in docs/lead. No application overlap; retrying push without rewriting history.

## 2026-11-09: iteration 1555 — restrict public frame sources

- Clean main/no leftover work; alerts and health clear. Passive metrics probe was not due at orientation; next eligible check remains 17:18 UTC.
- Default-off public CSP now permits frames only from the same origin, platform.twitter.com and syndication.twitter.com over HTTPS; Bluesky cards need no frames. Account/public flags remain off.
- Added intercepted synthetic Chromium proof: local tool and both X hosts load; unrelated, lookalike and HTTP origins are refused before requests; private rollback allows the foreign frame. No provider traffic or live account writes.
- Initial assertion expected full blocked URLs; Chromium reports cross-origin violations as origins. Corrected the assertion; final frame and existing form browser checks pass. Public-stack HTTP checks pass 2/2.
- Updated public-access plan, affected runtime handbook and TASKS. Handbook check passes 18 pages/one diagram; existing unapplied-account metadata warnings remain. Live X compatibility and full script/connect policy review remain readiness gates.
- pnpm format, pnpm lint:fix, pnpm check (769 unit/272 integration passes, four expected skips), pnpm build and git diff --check pass; existing bundler warning only.
- Restarted API/worker outside the hold; health/alerts clear, latest reader bytes unchanged. Scheduled reader check passes four topics/19 stories/14 posts.
- No source, provider, migration or configuration changes. Next: live proxy proof/guarded Phase 3 activation, remaining Phase 4 resource-policy readiness; metrics passive check eligible after 17:18 UTC.

## 2026-11-09: iteration 1556 — live X compatibility under prepared CSP

- Clean main/no leftovers. Initial pending API scrape alert followed the prior restart; API/metrics were healthy and alert cleared without intervention.
- Hourly local probe: `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 15`; 23 healthy rules, four queries ≤0.481 s, no new evaluator errors/misses, no merge. Next probe ≥18:19 UTC; compaction recovery remains open.
- Added explicit live browser checker using the actual prepared access-stack CSP, injected into browser document responses only; production flags and middleware unchanged. Blocks non-GET/HEAD requests.
- `pnpm exec tsx scripts/check-public-live-embeds.ts` passes all 10 real saved X widgets × desktop/mobile × light/dark, with no document CSP violations. Saved 40 card screenshots; inspected desktop-light/mobile-dark samples. No fixture substitution or LLM calls.
- Existing synthetic frame/form browser checks pass. Scheduled-reader gate passes four topics/19 stories/14 posts for Nov 9 15:00 UTC.
- Updated TASKS, public-access plan and screenshot index. Handbook check passes 18 pages/22 diagrams; existing unapplied-account metadata warnings remain.
- No source, provider, configuration or migration changes; accounts/public remain off. Live proxy proof and complete resource allowlist still gate activation/readiness.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (769 unit/272 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle-size warning only.
- Restarted API/worker; health retry passed, latest reader hash unchanged and scheduled-reader gate still passes. Health/alerts clear. No live source or digest breakage observed.
- First push rejected: owner advanced main. Merged 2b775125 without application overlap or history rewrite; owner item 52 now comes next: diagnostic proxy-probe receipts and forged-email check before more Phase 4 work. No metrics probe before 18:19 UTC.

## 2026-11-09: iteration 1557 — explain proxy-probe failures

- Clean main/no leftovers; health and alerts clear. Followed STEERING 52 before further Phase 4 work; no paid calls, source/configuration changes or account/public activation.
- Proxy diagnostic records forwarding-field/entry counts, final-IP validity, peer category and allowed header names at every step; continues after a failed baseline and adds absent/replaced/forged email classification. Never retains addresses, emails or cookies.
- CLI saves partial/final timestamped receipts outside the repo at ~/.local/state/news-digest/account-proxy-receipt.json (mode 600); exact owner rerun steps replace the Nov 9 NEEDS_FROM_HUMAN paragraph. Owner live rerun/shape comparison remains pending.
- `pnpm exec tsx --test apps/api/test/proxy-proof.test.ts` passes 4 tests: missing/duplicate/multi-entry/invalid baseline, overwritten/changed forwarding and forged email.
- `pnpm exec tsx scripts/smoke-account-proxy-probe.ts` passes success and failed-baseline/forged-email browser scenarios; saved and inspected two full-page fixture screenshots. These are simulated forwarding, not live proxy proof.
- Simulated CLI exercise verifies all five partial/final disk receipts, mode 600 and clean exit; temporary simulated receipt removed/restored without leaving fake live evidence.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (771 unit/272 integration passes, four expected skips), `pnpm build`, targeted handbook check (18 pages) and `git diff --check` pass. Existing bundle warning/unapplied-account metadata warnings only.
- Restarted API/worker outside the hold; /healthz and alerts clear. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z` passes four topics/19 stories/14 posts; latest reader hash unchanged.
- Updated TASKS, activation checklist and fixture screenshot index; archived iterations 1540–1547 to keep this log small. Item 52 implementation acked; actual proxy evidence still blocks Phase 3.
- Next: inspect the owner's new receipt and report any proxyClient mismatch without redesigning trust; while waiting, continue Phase 4 behind flags. Metrics passive probe no earlier than 18:19 UTC.

## 2026-11-09: iteration 1558 — restrict prepared public document connections

- Clean main/no leftovers; initial alerts/health clear. Owner proxy receipt absent, so followed item 52's permission to continue Phase 4 behind flags.
- Prepared public CSP limits document connections to self and HTTPS syndication.twitter.com; private mode unchanged. Accounts/public remain off; no migration, configuration, source or provider changes.
- `pnpm exec tsx scripts/check-public-connect-policy.ts` passes synthetic same-origin/official-host allowance, foreign/lookalike/HTTP refusal and private rollback; no provider traffic.
- `pnpm exec tsx scripts/check-public-live-embeds.ts` passes all 40 real saved X widget views (desktop/mobile, light/dark), zero document CSP violations. Refreshed screenshots and inspected mobile-dark card.
- Strict self/platform script trial produced official-widget inline/eval violations; removed rather than adding unsafe exceptions. Recorded remaining script/resource gate in public-access plan and NEEDS_FROM_HUMAN.
- Existing form/frame browser checks pass; targeted handbook check passes 18 pages/one diagram (existing unapplied-account metadata warnings).
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (771 unit/272 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundler warnings only.
- `pnpm obs sources --check`: all 36 healthy. Scheduled-reader gate passes four topics/19 stories/14 posts. No paid verification.
- Restarted API/worker; health/alerts clear, latest reader hash unchanged and scheduled-reader gate passes again.
- Next: inspect owner proxy receipt before guarded Phase 3 activation; finish Phase 4 resource/security review behind flags. Metrics passive probe remains no earlier than 18:19 UTC.
