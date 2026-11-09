# Progress

Earlier entries: [iterations 1552–1559](docs/progress-archive/2026-11-09-1568.md); [iterations 1550–1551](docs/progress-archive/2026-11-09-1564.md); [iterations 1548–1549](docs/progress-archive/2026-11-09-1562.md); [through iteration 1547](docs/progress-archive/2026-11-09-1557.md); [through iteration 1539](docs/progress-archive/2026-11-09-1548.md).

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

## 2026-11-09: iteration 1566 — reproducible public script-policy review

- Clean main/no leftovers; initial health/alerts clear. Accounts/public stay off awaiting item 53 owner rerun; no paid calls or configuration changes.
- Added `--review-scripts` to live saved-widget checker: candidate self/platform script policy is report-only alongside actual enforced CSP; all writes/report submissions blocked, source categories/counts only, screenshots untouched.
- Two browser runs pass 40 real saved X views each; every desktop/mobile light/dark view reports one inline-script/13 eval violations and zero enforced violations. Recorded readiness decision; no unsafe exceptions or runtime policy change.
- Build passes with existing bundle warning; `pnpm format`, `pnpm lint:fix` and `git diff --check` pass. `pnpm check` passes typecheck/lint/format/boundaries, 773 unit and 272 integration tests (four expected skips).
- Scheduled-reader gate passes four topics/19 stories/14 posts. Kotaku failed scheduled retries at 19:00 UTC with upstream HTTP 522; explicit GET also 522, last success 18:26/20 items. Recorded source recovery task; no bypass/adapter change. Digest queue zero failed jobs.
- API/worker restart and post-restart health/alerts/reader gate verified before commit. Next: recheck Kotaku recovery; owner proxy rerun before Phase 3; Phase 4 script decision open. Metrics probe ≥19:36 UTC.

## 2026-11-09: iteration 1567 — enforce prepared public script allowlist

- Owner-visible value: resolves the public script-policy blocker while retaining all saved X embeds and reader themes; no unsafe inline/eval exceptions.
- Clean main/no leftovers; health/alerts clear. Kotaku explicit GET remains HTTP 522 at 19:09 UTC; all 36 sources succeeded within an hour, digest queue zero failures. No paid calls or flag/configuration changes.
- Source coordinates trace prior reports to app theme startup and Zod's eval probe/generated validators, correcting earlier widget attribution. Moved theme startup to blocking `/theme.js`; browser-only early `jitless` initialization preserves server behavior.
- Prepared CSP now permits only same-origin/platform.twitter.com scripts. `pnpm exec tsx scripts/check-public-script-policy.ts` passes synthetic admission, inline/eval/lookalike refusal and private rollback; event-handler checker passes.
- Live saved-widget checker passes 40 desktop/mobile light/dark views; second `--review-scripts` run reports zero violations and verifies automatic themes. Refreshed/inspected mobile-dark video screenshot; theme-target smoke passes 24 reader route/view combinations, keyboard/reload included.
- Initial enforcing browser run overlapped the first build and caught old inline/eval assets; discarded that evidence and reran after build completion. Build passes with existing warnings.
- Updated public readiness plan, script review, runtime handbook and owner note. Handbook renders 18 pages/one diagram; exits 1 only for existing unapplied-account metadata warnings.
- `pnpm check` passes typecheck/lint/format/boundaries, 773 unit and 272 integration tests (four expected skips). `pnpm format`, `pnpm lint:fix`, final build and `git diff --check` pass.
- API/worker restart and post-restart health/alerts/scheduled-reader verification recorded before commit.
- Next: item 53 owner rerun before Phase 3; complete public static-resource routing (including `/theme.js`) and full Phase 4 rehearsal. Accounts/public remain off; metrics probe not due until 19:36 UTC.

## 2026-11-09: iteration 1568 — prepare exact public static-file admission

- Clean main/no leftovers; initial health/alerts clear. Accounts/public remain off awaiting item 53 owner rerun; no paid calls, migrations or flag changes.
- Prepared public authorization snapshots deployed theme/JS/CSS/WOFF2 paths once per middleware; no asset-prefix grant. Unknown files, source maps, symlinks, directories, ambiguous spellings and writes stay denied. Missing builds fail closed; restart refreshes the snapshot.
- `pnpm exec tsx --test apps/api/test/public-static-routes.test.ts apps/api/test/public-route-policy.test.ts apps/api/test/public-access.test.ts`: 5/5 pass (fixture files, admission/refusal and HTTP authorization).
- `pnpm exec tsx scripts/check-public-live-embeds.ts --review-routing`: all 40 real saved X views pass desktop/mobile light/dark, five built resources admitted per view, zero denied reader requests or document CSP violations; no remote writes. Existing screenshots remain representative; manifest updated.
- Updated runtime handbook, readiness plan and source health note. `pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime` renders 18 pages/one unchanged diagram; only existing unapplied-account schema metadata warnings remain after fixing the page length.
- Kotaku still the only unhealthy source at 19:24 UTC (35/36 healthy); last success 18:26/20 items, prior scheduled retry HTTP 522. No bypass or source adapter change. Scheduled reader passes four topics/19 stories/14 posts; retained digest queue has zero failures.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (typecheck/lint/format/boundaries, 774 unit, 272 integration/four expected skips), workspace build and final API rebuild pass. `git diff --check` passes. Archived iterations 1552–1559 to keep this file small.
- API/worker restarted; immediate health probe raced startup, subsequent `pnpm obs health --check`, service check, alerts and scheduled-reader gate pass. No generation changes.
- Next: owner proxy rerun before Phase 3 activation; complete broader Phase 4 rehearsal behind flags. Metrics probe not due until 19:36 UTC.

## 2026-11-09: iteration 1569 — restore the composed public policy rehearsal

- Clean main/no leftovers; health passes. RecentJobFailures traces to Kotaku's scheduled HTTP 522 retries, exhausted at 19:30 UTC; last success remains 18:26/20 items. No bypass, paid calls, migrations or flag changes.
- Added `pnpm exec tsx scripts/check-public-policies.ts`: nine sequential offline browser checks against the current prepared stack, fail-fast with a two-minute limit per check. Live widget/proxy acceptance remains separate.
- First run caught a real rehearsal regression: tightened script CSP blocks the form probe's inline observer. Moved observation into Playwright initialization; policy remains unchanged. The runner correctly stopped on failure.
- Rerun passes all nine admission/refusal/private rollback checks (synthetic traffic only). Targeted access-stack/runtime/route/static HTTP tests pass 9/9. No product UI change or screenshot update.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 774 unit, 272 integration/four expected skips. Workspace build passes with the existing bundle-size warning; `git diff --check` passes.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` at 19:36: 23 healthy rules, four queries ≤0.763 s, zero new evaluator errors/misses/timeouts/slow queries, one small merge/no large merge. Next passive probe ≥20:36 UTC.
- API/worker restarted after build; startup health retry then `pnpm obs health --check` passes. Scheduled-reader gate for 2026-11-09T15:00:00Z passes four topics/19 stories/14 posts. Alerts retain only the explained Kotaku warning.
- Updated TASKS, source health and public readiness instructions. Next: Kotaku natural recovery; owner item 53 rerun before Phase 3; broader Phase 4 rehearsal behind disabled flags.

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
