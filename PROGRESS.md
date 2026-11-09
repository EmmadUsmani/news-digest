# Progress

Earlier entries: [iterations 1550–1551](docs/progress-archive/2026-11-09-1564.md); [iterations 1548–1549](docs/progress-archive/2026-11-09-1562.md); [through iteration 1547](docs/progress-archive/2026-11-09-1557.md); [through iteration 1539](docs/progress-archive/2026-11-09-1548.md).

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

## 2026-11-09: iteration 1559 — inspect owner proxy rerun and report mismatch

- Clean main/no leftovers; initial health/alerts clear, all 36 sources healthy. No source/provider/configuration changes or paid calls.
- Inspected real private receipt timestamped 17:47:12 UTC: one forwarding field each, entry counts 2/3/4/3/2, final entries valid IPs, loopback peer; proto/host and exe.dev email/userid names present. Forged email replaced.
- Baseline differs from probe's single-entry requirement. proxyClient accepts multiple entries and selects final IP, but failed baseline prevents cross-request stability proof; receipt cannot identify final hop meaning. No identity values copied.
- Followed STEERING 52: stopped for owner trust/probe interpretation; no redesign, trust configuration or activation. Updated ack, NEEDS_FROM_HUMAN, TASKS and public-access plan. Accounts/public remain off.
- Targeted proxy tests pass 7/7; handbook check passes 18 pages (existing unapplied-account metadata warnings). Build passes with existing bundle warning.
- API/worker restarted; /healthz and alerts clear. Scheduled-reader gate passes four topics/19 stories/14 posts before and after restart.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (771 unit/272 integration passes, four expected skips), `pnpm build` and `git diff --check` pass.
- Push rejected after owner advanced main; merged owner item 53 without rewriting history, preserving owner files. Resolved STEERING append conflict by retaining new instructions and moving rerun ack under 53.
- Next: implement item 53 appended-entry categories/stability diagnostic and rerun steps; activation remains blocked. Phase 4 resource gate unchanged; metrics probe no earlier than 18:19 UTC.

## 2026-11-09: iteration 1560 — identify appended proxy positions without values

- Clean main/no leftovers; initial alerts/health clear, all 36 sources healthy. No paid calls or source/configuration changes.
- Item 53 probe now records both appended positions' category and baseline equality even when legacy one-entry validation fails; unexpected counts yield null comparisons. Addresses remain transient and never enter receipts.
- Synthetic tests cover stable public/private/loopback and IPv6 tails, forged prefixes, changes, reordering, invalid and missing entries. Targeted proxy/admin tests pass 8/8.
- Three Playwright probe simulations pass; refreshed fixture screenshots and inspected two-entry screenshot. Original real owner receipt untouched; no simulation presented as live proof.
- Replaced owner rerun steps in NEEDS_FROM_HUMAN; documented observed loopback proxy and mandatory forwarding-header refusal for local admin tokens. Trust/accounts/public unchanged; rerun still blocks visitor selection.
- Live `smoke-admin-gate.ts` passes including eight forwarded-token denials; scheduled-reader gate passes four topics/19 stories/14 posts. Handbook check passes 18 pages/22 diagrams (existing unapplied-account metadata warnings); build passes with existing bundle warning.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (773 unit/272 integration passes, four expected skips), `pnpm build` and `git diff --check` pass.
- Restarted API/worker outside the hold; health/alerts clear and scheduled reader passes again. Next: inspect item 53 real owner rerun before any fixed-hop selector change; Phase 4 may continue behind flags while waiting.

## 2026-11-09: iteration 1561 — restrict prepared public document fonts

- Clean main/no leftovers; initial alerts and health clear, all 36 sources healthy. Real proxy receipt remains 17:47:12 UTC; no new rerun, trust changes or activation. No paid calls.
- Default-off public CSP now admits document fonts only from the app origin; reader uses system fonts. Official widget frames retain their provider policies. Updated runtime handbook and public-access plan.
- `pnpm exec tsx scripts/check-public-font-policy.ts` passes offline same-origin admission, external/official-X/lookalike/HTTP refusal and private rollback; targeted access-stack tests pass 2/2.
- `pnpm exec tsx scripts/check-public-live-embeds.ts` passes 40 real saved X widget views with zero document CSP violations; refreshed screenshots and inspected mobile-dark card.
- Handbook check passes 18 pages/one diagram (existing unapplied-account metadata warnings); build passes with existing bundle warning. Scheduled-reader gate passes four topics/19 stories/14 posts for 2026-11-09T15:00:00Z.
- `pnpm format`, `pnpm lint:fix`, typecheck/lint/format/boundaries pass; full check reports 773 unit and 272 integration passes/four expected skips, then wrapper exits 143 after coverage output (no failing tests). `git diff --check` passes.
- API/worker restarted outside the hold; post-restart health/alerts and scheduled-reader gate verified. Next: owner item 53 rerun before visitor selector changes; remaining Phase 4 resource/script policy behind flags.

## 2026-11-09: iteration 1562 — restrict prepared public document media

- Clean main/no leftovers; initial health/alerts clear, all 36 sources healthy and job check passes. Real proxy receipt remains 17:47:12 UTC; accounts/public stay off. No paid calls or source/configuration changes.
- Default-off public CSP now limits document audio/video to the app origin; official X frames retain their own media policy. Updated runtime handbook/public-access plan and archived iterations 1548–1549.
- `pnpm exec tsx scripts/check-public-media-policy.ts` passes synthetic local-request admission, external/lookalike/HTTP refusal and private rollback. Targeted public-access-stack tests pass 2/2.
- `pnpm exec tsx scripts/check-public-live-embeds.ts` passes 40 real saved X widget views with zero document CSP violations; refreshed screenshots and inspected mobile-dark video card.
- `pnpm format`, `pnpm lint:fix`, typecheck/lint/format/boundaries pass. Full `pnpm check` passes 773 unit tests then is terminated (143) during integration; standalone `pnpm test:integration` completes successfully: 272 passes/four expected skips.
- `pnpm build` passes (existing bundle warning); handbook check passes 18 pages/one diagram (existing unapplied-account metadata warnings). Scheduled-reader gate passes four topics/19 stories/14 posts for 2026-11-09T15:00:00Z.
- Restarted API/worker outside the hold; post-restart /healthz and alerts clear, scheduled-reader gate passes again. `git diff --check` passes.
- Next: owner item 53 rerun before visitor selector changes; remaining Phase 4 script/resource allowlist behind flags. Metrics trial unchanged; no extra probe.

## 2026-11-09: iteration 1563 — block prepared public document workers

- Clean main/no leftovers; initial alerts/health clear. Proxy receipt remains 17:47:12 UTC; accounts/public stay off. No paid calls or source/configuration changes.
- Default-off public CSP forbids document workers; reader uses none and official X frames retain their own policy. Updated runtime handbook/public-access plan.
- `pnpm exec tsx scripts/check-public-worker-policy.ts` passes synthetic same-origin/blob refusal and private rollback execution.
- `pnpm exec tsx scripts/check-public-live-embeds.ts` passes all 40 real saved X widget views without document CSP violations; refreshed screenshots/manifest and inspected mobile-dark video card.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass: 773 unit and 272 integration passes/four expected skips. `pnpm build` passes with existing bundle warning.
- `pnpm exec tsx scripts/check-handbook.ts stack-and-runtime` passes 18 pages/one diagram with existing unapplied-account metadata warnings. Scheduled-reader gate passes four topics/19 stories/14 posts.
- API/worker restarted outside hold; post-restart health/alerts and scheduled-reader gate verified. `git diff --check` passes.
- Next: owner item 53 rerun before visitor selector changes; Phase 4 script/resource allowlist remains open behind flags.

## 2026-11-09: iteration 1564 — restrict prepared public document images

- Clean main/no leftovers; initial health/alerts clear. Proxy receipt remains 17:47:12 UTC; accounts/public stay off. No paid calls or source/configuration changes.
- Default-off public CSP admits same-origin/HTTPS document images for source icons and social previews; HTTP/data images refused. Updated runtime handbook/public-access plan; archived iterations 1550–1551.
- `pnpm exec tsx scripts/check-public-image-policy.ts` passes synthetic admission/refusal and private rollback. `pnpm exec tsx scripts/check-public-live-embeds.ts` passes 40 real X widget views with no document CSP violations; refreshed screenshots and inspected mobile-dark video card.
- Hourly `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 5`: 23 healthy rules, four queries ≤0.728 s, no new evaluator errors/misses or merges; next probe ≥19:36 UTC. All 36 live sources succeeded within one hour; digest queue has zero failed jobs.
- Build passes (existing bundle warning); handbook check passes 18 pages/one diagram with existing unapplied-account metadata warnings. Scheduled-reader gate passes four topics/19 stories/14 posts.
- Initial full check: 772 unit passes/one transient process-inspection cleanup failure; targeted retry passes. Fixed archive formatting found by next check. Final `pnpm check` passes: 773 unit/272 integration, four expected skips. `pnpm format`, `pnpm lint:fix` and `git diff --check` pass.
- API/worker restarted outside hold; readiness retry, health, alerts and scheduled-reader gate pass. Next: owner item 53 rerun before visitor selector changes; Phase 4 script policy/resource review remains open behind flags.

## 2026-11-09: iteration 1565 — block prepared public inline event handlers

- Clean main/no leftovers; initial health/alerts clear. All 36 sources healthy; digest queue zero failed jobs. Accounts/public remain off awaiting item 53 owner proxy rerun; no paid calls or configuration changes.
- Prepared public CSP now blocks inline HTML event handlers, preserving JavaScript listeners. Script elements/eval remain unrestricted pending compatibility/security review. Updated runtime handbook, public-access plan and screenshot manifest.
- `pnpm exec tsx scripts/check-public-event-handler-policy.ts` passes synthetic refusal/listener admission/private rollback; targeted public-access-stack tests pass 2/2 after updating the expected header.
- `pnpm exec tsx scripts/check-public-live-embeds.ts` passes 40 real saved X widget views with zero document CSP violations; refreshed screenshots and inspected mobile-dark video card.
- `pnpm check` passes typecheck/lint/format/boundaries then terminates (143) during units. Standalone units first catch stale expected CSP; corrected rerun passes 773/773. `pnpm test:integration` passes 272/four expected skips.
- `pnpm format`, `pnpm lint:fix`, build and `git diff --check` pass. Handbook renders 18 pages/one diagram; command exits 1 solely for existing unapplied-account schema metadata warnings.
- API/worker restarted outside hold; health, alerts and scheduled-reader gate pass (four topics/19 stories/14 posts). Next: owner proxy rerun before Phase 3 activation; finish Phase 4 script/resource review behind flags. Metrics probe not due until 19:36 UTC.
