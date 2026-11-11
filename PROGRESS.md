# Progress

[Through iteration 1743](docs/progress-archive/2026-11-10-through-1743.md).

[Iterations 1753–1759](docs/progress-archive/2026-11-11-through-1759.md).

[Iterations 1760–1763](docs/progress-archive/2026-11-11-iterations-1760-1763.md).

[Iterations 1764–1769](docs/progress-archive/2026-11-11-through-1769.md).

[Iterations 1770–1775](docs/progress-archive/2026-11-11-iterations-1770-1775.md).

[Iterations 1776–1781](docs/progress-archive/2026-11-11-iterations-1776-1781.md).

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

## 2026-11-11: iteration 1791 — exact native telemetry assets and proxy CSP

- Clean main; no inherited work. Alerts clear, healthz healthy and no failed user services. Public mode remains off; no provider calls.
- Prepared fresh-admin admission now includes 13 exact reviewed native UI document/script/style GET paths; unknown assets, suffixes, HEAD and POST refused. No directory prefix grant.
- Prepared proxy supplies the rehearsed same-origin CSP plus nosniff, preserving no-store and stripping caller credentials/upstream cookies. Composed access/proxy fixtures cover anonymous, reader, stale-admin and fresh-admin boundaries across all assets.
- Added `review-native-telemetry-ui.ts --proxy-assets`: installed assets traverse the real prepared proxy, actual headers are asserted, fixture query flows mount and deliberate inline-script/external-fetch probes are refused. Corrected empty log fixtures; saved and visually checked both screenshots. No live-query/full-navigation acceptance claimed.
- Updated affected handbook, readiness/review and TASKS; archived iterations 1776–1781 to keep PROGRESS small.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, proxy Chromium review, `check-handbook.ts observability`, 32 deployed account-boundary checks and saved Nov 10 reader (four topics/19 stories/15 posts) pass. API restarted healthy; `git diff --check` passes.
- Full `pnpm check` passes: 833 unit and 283 integration tests, four expected skips.
- Next: full stored-session native UI composition and broader live navigation; Grafana scheduled-load/natural-compaction capacity evidence; Nov 11 15:00 UTC NBA review.

## 2026-11-11: iteration 1792 — stored-session native telemetry asset boundary

- Clean main; no inherited work. Alerts clear, healthz healthy, no failed user services and all 36 sources healthy. Public mode remains off; no provider calls.
- Extended compiled-app persisted-session rehearsal to all 13 exact native telemetry asset GETs. Fresh/restored admin admits; anonymous, invited reader, aged admin and logged-out admin refuse before upstream forwarding.
- Added HEAD/POST, unknown-asset and document-query-alias refusals across these identities. Successful asset responses retain CSP/nosniff/no-store; caller credentials and upstream cookies/private headers remain stripped.
- Isolated recording upstream serves fixture bodies only; this proves HTTP/session composition, not browser/session navigation or live query acceptance. Updated readiness, response review and TASKS; no runtime behavior or handbook change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `check-handbook.ts observability`, 32 deployed account-boundary checks and saved Nov 10 reader check (four topics/19 stories/15 posts).
- Full check passes: 833 unit and 283 integration tests, four expected skips. Build and handbook verification pass; `git diff --check` clean.
- API restarted after push; healthz and deployed account/reader checks verified.
- Next: full browser/session composition and broader native navigation; Grafana scheduled-load/natural-compaction capacity evidence; Nov 11 15:00 UTC NBA review.

## 2026-11-11: iteration 1793 — native telemetry navigation and export limitation

- Clean main; no inherited work. Alerts clear, healthz healthy and no failed user services. Public mode remains off; no provider calls.
- Extended installed-asset Chromium review to metrics Raw Query/Dashboards/Query Analyzer and logs Overview, with delayed query settlement, uncaught-error/CSP checks and inspected screenshots.
- Operational requests are fixtures and checked against shared read admission. Overview POST field_names is already admitted. Raw Query auto-fetches GET /metrics/prometheus/api/v1/export, still refused (403); bounded export semantics remain a readiness gate. No runtime admission change.
- Corrected dashboard fixture to a real panel with empty query results; both --proxy-assets and --live-assets reviews pass. Full stored-session/browser composition and live query navigation remain open.
- Verification: pnpm format, pnpm lint:fix, pnpm build, check-handbook.ts observability, 32 deployed account checks and check-scheduled-reader.ts 2026-11-10T15:00:00Z pass (four topics/19 stories/15 posts).
- First combined verification command ended with SIGTERM during unit tests (no reported failures); standalone pnpm check retry passes: 833 unit and 283 integration tests, four expected skips. Typecheck/lint/format/boundaries pass.
- Updated readiness/review and TASKS; git diff --check passes. Pushed 85818782, restarted API; healthz, 32 deployed account checks and saved Nov 10 reader checks pass; no failed user services.
- Next: bounded raw-export review, full browser/session composition, remaining native controls/live navigation, Grafana capacity evidence and 15:00 UTC NBA review.

## 2026-11-11: iteration 1794 — native raw-export boundary review

- Clean main; no inherited work. Alerts clear, healthz healthy and no failed user services. Public mode stays off; no provider calls.
- Added explicit five-second/64 KiB live export review: only up over 60 seconds, one sample per line, shape/time-window/cookie checks; labels and samples withheld. First probe: 15 rows/15 samples, 1,745 bytes.
- Installed-asset Chromium review asserts Raw Query sends only match[], start and end. Per-line splitting does not cap total output; GET/POST/HEAD export admission stays denied pending enforced selector/window/response bounds and cancellation.
- Updated response review, readiness and TASKS. Generated browser screenshots were deliberately restored: fixture navigation/UI unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm build, proxy-assets Chromium review, live export probe, check-handbook.ts observability, 32 deployed account checks and saved Nov 10 reader check (four topics/19 stories/15 posts) pass.
- Full pnpm check passes: 833 unit and 283 integration tests, four expected skips; typecheck/lint/format/boundaries green. Build and handbook checks pass; git diff --check clean.
- Pushed 537a93d6; systemctl --user restart news-digest-api.service completed. Post-restart healthz, 32 account checks and saved Nov 10 reader checks pass; no failed user services.
- Next: enforced export bounds, full browser/session composition, Grafana capacity evidence and Nov 11 15:00 UTC NBA review.

## 2026-11-11: iteration 1795 — prepared bounded telemetry export transport

- Clean main; no inherited work. Alerts clear, healthz healthy and no failed user services. Public mode remains off; no provider calls.
- Added prepared export parser: one exact up selector, explicit numeric timestamps, positive window ≤60 seconds; unknown/duplicate parameters, broad selectors, aliases and fragments refused.
- Added buffered 64 KiB transport with five-second header/body deadline; overflow, invalid response, timeout and caller cancellation abort upstream fetch. No bytes returned until the full bounded response completes.
- Local HTTP tests cover exact cap/overflow, stalled headers/body, active/pre-aborted callers, upstream connection closure, redirects and content-type refusal. Narrow live probe now uses this helper: 15 rows/15 samples, 1,745 bytes; operational bodies withheld.
- Export GET/POST/HEAD admission stays denied. Proxy/session/client-disconnect composition, upstream query-work limits and installed-browser acceptance remain open; updated readiness/review and TASKS.
- Verification: targeted transport tests, pnpm format, pnpm lint:fix, pnpm check, pnpm build, check-handbook.ts observability, deployed account boundaries and saved Nov 10 reader check.
- Full check passes: 835 unit and 283 integration tests, four expected skips; build, handbook, 32 deployed account checks and saved reader check pass (four topics/19 stories/15 posts). All 36 sources healthy; git diff --check clean.
- Pushed 48313bc8; systemctl --user restart news-digest-api.service completed. Post-restart healthz, 32 account boundaries and saved Nov 10 reader checks pass; no failed user services.
- Next: compose export bounds into prepared proxy before admission; browser/session navigation, Grafana capacity evidence and Nov 11 15:00 UTC NBA review.
