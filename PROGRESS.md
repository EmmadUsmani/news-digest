# Progress

[Through iteration 1743](docs/progress-archive/2026-11-10-through-1743.md).

[Iterations 1753–1759](docs/progress-archive/2026-11-11-through-1759.md).

[Iterations 1760–1763](docs/progress-archive/2026-11-11-iterations-1760-1763.md).

[Iterations 1764–1769](docs/progress-archive/2026-11-11-through-1769.md).

[Iterations 1770–1775](docs/progress-archive/2026-11-11-iterations-1770-1775.md).

## 2026-11-11: iteration 1776 — compose explorer credential lifecycle rollback

- Clean main; no inherited work. No active alerts or failed services; source/job checks and `/healthz` pass. Saved Nov 10 reader serves four topics/19 stories/15 posts.
- Extended the disposable SCRAM rehearsal through NOLOGIN, pool closure, authentication restoration, exact extension-ACL restoration and restricted-role reactivation. NOLOGIN preserves an existing pooled session; closing the pool removes its backend; fresh rollback logins fail. Reactivation restores the same structural table catalog and still denies application-row reads.
- This is isolated synthetic-credential evidence, not live credential rollback. No live credentials, grants, flags or provider spending changed. Updated readiness and response-review evidence; live credential/environment rollback and reader admission remain open.
- Targeted credential test, `pnpm build`, deployed account boundary (32 checks), `check-scheduled-reader.ts 2026-11-10T15:00:00Z`, handbook/schema check and `git diff --check` pass. `pnpm format`, `pnpm lint:fix` and `pnpm check` pass (829 unit, 283 integration passes/four expected skips).
- Next: live credential/environment/authentication rollback; explicit reader admission; Grafana scheduled-load/compaction capacity; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1777 — live explorer credential rollback

- Clean main; no inherited work. Alerts clear, no failed user services, `/healthz` healthy; scheduled digest queue healthy and recent free/social collection succeeds.
- `python /tmp/catalog-1777.py` passed live rollback/reactivation. Fresh private snapshots and the rehearsal script are in `~/.local/state/news-digest/catalog-1777/`. Removed explorer URL/drop-in, restarted, verified exact private response and zero restricted-role sessions; applied NOLOGIN, original parsed authentication and preserved extension ACL restoration. App health remained green.
- Finally restored scoped authentication, hardened grants, LOGIN, exact environment/drop-in and restarted. Exact response/extension ACL comparisons, restricted-role sessions and password/privilege preflight pass. Public/structural flags remain off; no provider spending.
- Build, deployed account boundary (32 checks), saved-reader check (four topics/19 stories/15 posts), handbook/schema check (39 tables/no warnings) and anonymous `/db/` 404 pass. Corrected an initial boundary-command filename typo; actual deployed check passes.
- Updated readiness/evidence/TASKS and archived iterations 1760–1763 to keep this file small. `pnpm format`, `pnpm lint:fix`, `pnpm check` (829 unit/283 integration passes; four expected skips) and `git diff --check` pass.
- Next: explicit explorer reader admission; Grafana scheduled-load/compaction capacity; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1778 — enforce structural explorer upstream

- Clean main; no inherited work. Alerts clear, no failed user services, `/healthz` and scheduled queue checks pass.
- Prepared public proxy selection requires the explorer's structural-only marker and exact GET routes; private upstream responses fail closed. Incoming credentials and upstream cookies are removed. Public route admission remains closed and live flags stay off.
- Targeted HTTP/proxy tests pass (4); structural/private rollback verifies marker state alongside field filtering. No UI changes or provider calls.
- Build, deployed account boundary (32 checks), saved Nov 10 reader (four topics/19 stories/15 posts), handbook/schema check (39 tables/no warnings) pass. Updated TASKS and response/readiness evidence.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (830 unit/283 integration passes, four expected skips), `pnpm build` and `git diff --check` pass.
- Next: compose explicit explorer reader admission behind the public flag; Grafana scheduled-load/compaction capacity; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1779 — compose explorer reader admission

- Clean main; no inherited work. Alerts clear, no failed user services, `/healthz` healthy; all 36 sources and four job queues healthy. Nov 10 saved reader has four topics/19 stories/15 posts.
- Prepared public policy admits only exact structural explorer GET routes; query variants, HEAD and writes stay denied before proxying. Anonymous admission composes with the credential-stripping structural-marker proxy; private upstream still fails closed.
- `pnpm exec tsx scripts/check-schema-proxy.ts` passes captured-live-catalog private/structural/private HTTP and desktop/mobile checks. Inspected both new anonymous screenshots. No live flags, credentials, grants or provider spend changed.
- Targeted route/proxy tests pass (9); `check-live-account-boundary.ts` passes 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` and `check-handbook.ts` pass (39 tables/no warnings). Updated readiness, response review and TASKS.
- Initial full check caught the old readiness matrix denying reviewed explorer routes; updated it to verify all principals’ exact GET admission and HEAD/write refusal. Full rerun passes: 831 unit/283 integration tests, four expected skips; `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass.
- `pnpm build` passes. Restarted `news-digest-api.service`; retrying `/healthz` passes after startup and anonymous `/db/` stays 404. Post-restart account boundary and saved-reader checks pass.
- Next: live structural-mode activation and broader Phase 4 gates; Grafana scheduled-load/compaction capacity; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1780 — activate live structural explorer

- Clean main; no inherited work. Alerts clear, services/healthz healthy, all 36 sources and scheduled job queues pass local checks. No provider spending.
- Installed tracked structural-only explorer drop-in; `pnpm exec tsx scripts/check-live-schema-structural.ts --live` passes private/structural/private/structural restarts. Exact 39-table structural response and authenticated proxy parity pass; rollback preserves all private catalog fields except changing timestamp/row estimates/sizes. Public mode stays off; anonymous `/db/` is 404.
- Live desktop/mobile checks pass without interception; inspected both screenshots in `docs/screenshots/schema/live-structural-{1440,390}.png`. Existing `check-schema-proxy.ts` and `check-schema-structural-ui.ts` rehearsals pass using the restricted catalog role directly for private inputs.
- Handbook check initially expected removed warning fields; changed it to read private catalog diagnostics through the restricted role and verify served structural parity. Updated owner data-model page, rollout/readiness docs and TASKS.
- `pnpm build`, deployed account boundary (32 checks), and saved Nov 10 reader (four topics/19 stories/15 posts) pass. Initial full check caught an unused import; `pnpm lint:fix` removed it.
- `pnpm format`, `pnpm lint:fix`, final `pnpm check` (831 unit/283 integration passes; four expected skips), handbook/schema (18 pages/22 diagrams/39 tables) and `git diff --check` pass. Handbook rerun after a rollout-restart 502 passes. Restarted API/explorer; startup-boundary retry and saved-reader check pass with healthy services.
- Next: remaining Phase 4 tool installations/full public rehearsal; Grafana capacity under scheduled load or compaction; Nov 11 15:00 UTC NBA review.

## 2026-11-11: iteration 1781 — install reader handbook service

- Clean main; no inherited work. Alerts clear, no failed user services, `/healthz` healthy; `pnpm obs sources --check` and `pnpm obs jobs --check` pass (36 sources/four queues). No provider calls.
- Installed/enabled tracked `news-digest-reader-docs.service`; listener is `127.0.0.1:8110`. Public mode stays off; owner handbook remains on 8100 and anonymous live `/docs/` stays 404.
- Added `pnpm exec tsx scripts/check-live-reader-handbook.ts`: exact installed GET/HEAD corpus, prepared public proxy, redirect, no-store/CSP and legacy/query/write refusals pass. Stop/start rehearsal removes/restores listener while `/healthz` stays healthy; acceptance rerun passes.
- Playwright desktop light/mobile dark checks pass without interception or horizontal overflow; inspected both new `docs/screenshots/reader-handbook-live-*.png` images. Updated runtime handbook, response review, readiness and TASKS.
- `pnpm build`, deployed account boundary (32 checks), saved Nov 10 reader (four topics/19 stories/15 posts) pass. Handbook initially rejected 104 lines; condensed runtime addition to its existing paragraph.
- First combined format/lint/check process received SIGTERM during unit tests without an assertion failure; separate `pnpm check` rerun passes (831 unit/283 integration passes, four expected skips). `pnpm format`, `pnpm lint:fix`, handbook/schema rerun and `git diff --check` pass. Archived iterations 1764–1769 to keep this file small.
- Next: remaining Phase 4 tool gates/full public rehearsal; Grafana scheduled-load/compaction capacity; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1782 — fresh-admin telemetry queries

- Clean main; no inherited work. Alerts clear, services/healthz healthy; `pnpm obs sources --check` and `pnpm obs jobs --check` pass (36 sources/four available queues). No provider calls.
- Prepared public mode admits only fresh-admin GETs for metrics instant/range queries and VictoriaLogs log queries. Shared admission/proxy allowlist denies other paths/methods; proxy strips incoming credentials/identity and upstream cookies/custom headers, retaining no-store. Public mode stays off; private proxy unchanged.
- Targeted `pnpm exec tsx --test apps/api/test/internal-tools.test.ts apps/api/test/public-route-policy.test.ts apps/api/test/public-readiness-http.test.ts` passes 11 tests. Fixture HTTP checks cover anonymous/reader/stale-admin/admin, mutation refusal, direct proxy refusal and unavailable upstream. Configured Nest checks verify admin-only forwarding.
- Explicit live loopback GET queries return eight metrics series and one bounded log row; no log content printed. Updated rollout/tool/readiness docs, observability handbook and TASKS. Telemetry UIs/assets remain denied pending review.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 832 unit/283 integration passes, four expected skips. `pnpm build`, `check-handbook.ts observability` (18 pages/one diagram/39 tables) and `git diff --check` pass.
- Restarted `news-digest-api.service`; retrying `/healthz` passes. Post-restart `check-live-account-boundary.ts` passes 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` preserves four topics/19 stories/15 posts. Source/job checks pass again.
- Next: remaining Phase 4 UI/tool gates and full public rehearsal; Grafana capacity under scheduled load or natural compaction; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1783 — live telemetry proxy acceptance

- Clean main; no inherited work. Alerts clear, no failed user services, `/healthz` healthy; source/job checks pass (36 sources/four queues). No provider calls or public activation.
- Added explicit `pnpm exec tsx scripts/check-live-admin-telemetry.ts --live`: prepared public admission/proxy sends bounded instant/range metrics and one-row recent-log reads to installed loopback stores. Positive scrape counts and recent log timestamp verified; bodies withheld from output/errors.
- Simulated anonymous/reader/stale-admin principals refuse before forwarding; simulated fresh admin succeeds. Mutation/UI refusals counted before real upstream access. This is live upstream composition, not deployed session-authentication evidence; existing Nest/account checks cover that boundary.
- Updated response review/readiness and TASKS. No runtime behavior or handbook-described system flow changed; telemetry UIs/full Phase 4 rehearsal remain open.
- `pnpm build`, deployed account boundary (32 checks), saved Nov 10 reader (four topics/19 stories/15 posts) and live telemetry replay pass. Initial lint caught an unnecessary async callback; replaced with an explicit resolved promise.
- `pnpm format`, corrected `pnpm lint:fix`, `pnpm check` (832 unit/283 integration passes; four expected skips), and `git diff --check` pass. Restarted API; retrying `/healthz` and post-restart account/saved-reader checks pass.
- Next: remaining Phase 4 UI/tool gates/full public rehearsal; Grafana capacity during scheduled load or natural compaction; Nov 11 15:00 UTC NBA review.

## 2026-11-11: iteration 1784 — stored-session telemetry composition

- Clean main; no inherited work. `pnpm obs alerts` clear; no failed user services, `/healthz` healthy; `pnpm obs sources --check` and `pnpm obs jobs --check` pass (36 sources/four queues). No provider calls.
- Compiled full public application now mounts the prepared telemetry proxy against an isolated recording fixture. Real code login forwards all three query APIs; anonymous/invited-reader/stale-admin/logged-out-admin sessions refuse before forwarding. Eight-day stored-session aging preserves reader identity; restoring creation time restores admin access.
- Verifies exact forwarded query targets, stripped caller credentials, stripped upstream cookies/private headers and no-store. Tests use disposable Postgres/Redis and fixture HTTP only, never live telemetry or LLM services. Public mode remains off.
- Native UI landing review found operational links (including metrics reload) and additional logs query/metadata APIs; UI routes remain closed. Updated tool response review, readiness and TASKS; no system flow or handbook behavior changed.
- `pnpm build`, `check-live-account-boundary.ts` (32 checks) and `check-scheduled-reader.ts 2026-11-10T15:00:00Z` (four topics/19 stories/15 posts) pass. First two full-check attempts stopped at import order/formatting while autofix settled; corrected with final format.
- `pnpm format`, `pnpm lint:fix`, final `pnpm check` pass: 832 unit/283 integration passes, four expected skips. New compiled-app rehearsal passes; `git diff --check` clean.
- Restarted `news-digest-api.service`; retrying `/healthz` and post-restart account-boundary/saved-reader checks pass.
- Next: native telemetry UI route review/full Phase 4 rehearsal; Grafana capacity under scheduled load or natural compaction; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1785 — fresh-admin logs read APIs

- Clean main; no inherited work. Alerts clear, no failed user services, healthz healthy; source/job checks pass (36 sources/four queues). No provider calls; public mode stays off.
- Installed UI bundle inventory identified eight additional logs read endpoints. Bounded live GETs returned JSON/200 for hits, instant/range statistics, field/stream names/values and query time bounds; no operational bodies printed.
- Prepared shared admission/proxy now allows these exact GETs only to fresh admins. Expanded fixture HTTP and compiled-app stored-session rehearsals cover reader/anonymous/stale/logout refusals, stripped credentials/cookies and no-store. UI assets, POSTs, tail and mutations stay denied.
- Initial full check found an unrelated explorer pool-shutdown race (Postgres backend cleanup lagged client closure). Added bounded observation of the exact backend disappearing, retaining NOLOGIN/authentication checks; rerun passes.
- Targeted 11 tests, `pnpm build`, `check-handbook.ts observability` (18 pages/one diagram/39 tables), `pnpm format`, `pnpm lint:fix`, final `pnpm check` pass: 832 unit/283 integration passes, four expected skips. Updated affected handbook, rollout review/readiness and TASKS.
- Restarted API; retrying healthz, 32 deployed account-boundary checks and `check-scheduled-reader.ts 2026-11-10T15:00:00Z` pass (four topics/19 stories/15 posts). `git diff --check` clean.
- Next: native telemetry UI assets/POST transport review and full Phase 4 rehearsal; Grafana scheduled-load/natural-compaction capacity evidence; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1786 — native telemetry UI transport review

- Clean main; no inherited work. Alerts clear, no failed user services, `/healthz` healthy; source/job checks pass (36 sources/four queues). No provider calls; public mode remains off.
- Added `pnpm exec tsx scripts/review-native-telemetry-ui.ts --live-assets`: Chromium loads installed native UI documents/assets; every operational/external request receives fixture data before forwarding. Prints only methods/paths and asset inventory, never queries, bodies or credentials.
- Both UIs mount; installed assets return successfully. Assertions observe metrics POST `/metrics/prometheus/api/v1/query_range` and logs POST query/hits/stream-field-names. Logs also requests build/tenant metadata; metrics requests configuration/dashboard/timezone resources. This is transport review, not live-query/UI acceptance.
- Updated tool review/readiness/TASKS with exact gaps: POST form transport, metrics alias, metadata/static route review and same-origin CSP. Existing GET allowlist cannot support native UI; no runtime admission changed. Archived progress 1770–1775 to keep orientation small.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and native browser review pass. Final `pnpm check` passes: 832 unit/283 integration tests, four expected skips. Initial check stopped on newly archived progress formatting; corrected. Restarted API; retrying healthz, 32 account-boundary checks and saved Nov 10 reader (four topics/19 stories/15 posts) pass.
- Next: implement reviewed bounded native query transport/assets behind the off flag; Grafana scheduled-load/natural-compaction capacity evidence; Nov 11 15:00 UTC NBA review.

## 2026-11-11: iteration 1787 — bounded native telemetry POST reads

- Clean main; no inherited work. `pnpm obs alerts` clear, no failed user services, `/healthz` healthy; source/job checks pass (36 sources/four queues). No provider calls; public mode remains off.
- Prepared shared query allowlist admits GET/form POST and metrics `/prometheus` instant/range aliases. Proxy buffers at most 16 KiB, permits uncompressed forms only and stops stalled uploads after five seconds before opening upstream. Caller credentials/upstream cookies stripped; no-store retained; UI assets/metadata, tails and mutations stay closed.
- Read queries bypass mutation auditing. Scoped provenance exception permits forms only on these query paths while preserving exact configured-origin and duplicate-header checks. Initial full check found the compiled fixture missing this origin/form composition; fixed guard and fixture, retaining cross-origin refusals.
- Fixture tests verify exact body/headers, freshness, media/encoding, declared/chunked oversize and upload timeout. Compiled full application verifies both methods across anonymous, invited reader, fresh/stale admin and logged-out stored sessions.
- `check-live-admin-telemetry.ts --live` now covers GET and POST, bounded metrics/log reads and simulated-principal isolation. Direct bounded alias POST returns eight metrics series; logs POST returns one recent row. No operational bodies printed.
- `pnpm format`, `pnpm lint:fix`, final `pnpm check` pass: 833 unit/283 integration tests, four expected skips. `pnpm build`, `check-handbook.ts observability` (18 pages/one unchanged diagram/39 tables) and `git diff --check` pass. Updated affected handbook, review/readiness and TASKS.
- Restarted API; retrying healthz, 32 deployed account-boundary checks and saved Nov 10 reader check pass (four topics/19 stories/15 posts). No failed user services.
- Next: exact native UI assets/configuration and build/tenant metadata review, same-origin CSP and full Phase 4 rehearsal; Grafana scheduled-load/natural-compaction capacity evidence; Nov 11 15:00 UTC NBA review.

## 2026-11-11: iteration 1788 — native telemetry CSP browser rehearsal

- Clean main; no inherited work. Alerts clear, no failed user services, healthz healthy; 36 sources healthy and four queues available. Saved Nov 10 reader verifies four topics/19 stories/15 posts. No provider calls; public mode remains off.
- Extended `review-native-telemetry-ui.ts --live-assets` to inject a candidate CSP into installed loopback UI documents. Native metrics/logs mount and fixture POST query flows have zero policy violations. Same-origin scripts/connections, no inline scripts/workers/frames/forms; inline styles retained for native controls.
- Deliberate inline-script and external-fetch probes are blocked in both browsers; external fetch never reaches request routing. Reports include directive names only. Operational requests remain intercepted fixtures; no live-query or full-navigation acceptance claimed.
- Updated tool response review, public readiness and TASKS. Runtime headers/admission unchanged; handbook system behavior unchanged.
- Verification passed: `pnpm format`, `pnpm lint:fix`, `pnpm check` (833 unit/283 integration passes, four expected skips), `pnpm build`, repeated native Chromium review, `check-live-account-boundary.ts` (32 checks), `check-scheduled-reader.ts 2026-11-10T15:00:00Z`, and `git diff --check`.
- Next: exact static/configuration/build/tenant response review, deployed CSP composition and full Phase 4 rehearsal; Grafana scheduled-load/natural-compaction capacity evidence; Nov 11 15:00 UTC NBA review.

## 2026-11-11: iteration 1789 — exact telemetry assets and metadata review

- Clean main; no inherited work. Alerts clear, no failed user services, healthz healthy; all 36 sources healthy and four queues available. No provider calls; public mode remains off.
- Native Chromium review now inventories 13 installed documents/scripts/styles by exact path, SHA-256, bytes and MIME; asset cookies and unexpected MIME/size fail. Normal fixture queries and deliberate inline-script/external-fetch CSP refusals still pass.
- Added `review-native-telemetry-metadata.ts --live`: six exact loopback GETs, five-second/16 KiB bounds, redirect/cookie refusal and expected JSON-shape checks. Reports omit values and tenant IDs. Dashboard contains static resource query panels; tenant/config/build metadata remains a fresh-admin-only candidate.
- Saved asset-only inventory and updated response review/readiness/TASKS. Runtime UI admission and response headers unchanged; handbook behavior unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (833 unit/283 integration passes, four expected skips), `pnpm build`, repeat native Chromium/metadata reviews and `check-handbook.ts observability` pass. All 13 saved asset hashes match the repeat review.
- Restarted API; retrying healthz, 32 account-boundary checks and `check-scheduled-reader.ts 2026-11-10T15:00:00Z` pass (four topics/19 stories/15 posts). No failed user services; `git diff --check` passes.
- Next: exact UI/metadata fresh-admin proxy admission with CSP composition and broader native navigation; Grafana scheduled-load/natural-compaction evidence; Nov 11 15:00 UTC NBA review.

## 2026-11-11: iteration 1790 — fresh-admin native metadata admission

- Clean main; no inherited work. `pnpm obs alerts` clear; healthz healthy, no failed user services, all 36 sources healthy and four queues available. No provider calls; public mode remains off.
- Six reviewed metadata routes now admit exact GET only through the shared fresh-admin policy/proxy: metrics config/custom dashboards/timezone/per-job dashboard and logs build/tenant metadata. UI assets and mutations stay closed. Credentials/cookies stripped; no-store preserved.
- Proxy fixtures verify anonymous/reader/stale-admin refusal, fresh-admin reads, POST/HEAD refusal and suffix/slash/encoded-alias rejection. Compiled-app stored-session coverage includes metadata GET/POST across login, freshness loss and logout.
- `check-live-admin-telemetry.ts --live` passes six bounded metadata reads plus existing metrics/log queries through the prepared proxy, with simulated-principal isolation and no printed values/tenant IDs. `review-native-telemetry-metadata.ts --live` confirms all six shapes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 833 unit and 283 integration tests, four expected skips. `pnpm build`, `check-handbook.ts observability` (18 pages/one unchanged diagram/39 tables) and `git diff --check` pass. Updated affected handbook, readiness/review and TASKS.
- Restarted API; retrying healthz, 32 deployed account-boundary checks and saved Nov 10 reader check pass (four topics/19 stories/15 posts); no failed user services.
- Next: exact native UI asset admission with proxy/CSP composition and broader navigation; Grafana scheduled-load/natural-compaction capacity evidence; Nov 11 15:00 UTC NBA review.
