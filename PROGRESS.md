# Progress

[Through iteration 1743](docs/progress-archive/2026-11-10-through-1743.md).

[Iterations 1753–1759](docs/progress-archive/2026-11-11-through-1759.md).

[Iterations 1760–1763](docs/progress-archive/2026-11-11-iterations-1760-1763.md).

[Iterations 1764–1769](docs/progress-archive/2026-11-11-through-1769.md).

[Iterations 1770–1775](docs/progress-archive/2026-11-11-iterations-1770-1775.md).

[Iterations 1776–1781](docs/progress-archive/2026-11-11-iterations-1776-1781.md).

[Iterations 1782–1787](docs/progress-archive/2026-11-11-iterations-1782-1787.md).

[Iterations 1788–1793](docs/progress-archive/2026-11-11-iterations-1788-1793.md).

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

## 2026-11-11: iteration 1796 — prepared export HTTP lifecycle

- Clean main; no inherited work. Alerts clear, healthz healthy and no failed user services. Public mode stays off; no provider calls.
- Added unwired HTTP export handler composing request bounds and buffered transport; invalid method/target refuses before upstream. Successful responses use fixed JSON/no-store/nosniff headers; failures return generic 502 without upstream bytes.
- Real two-server tests cover exact 64 KiB cap, overflow, stalled headers, credential/private-header stripping and actual downstream socket closure. Disconnect must abort upstream within one second, before the five-second deadline.
- Export admission remains denied; route/session composition, upstream work limits and installed-browser acceptance remain open. Updated readiness/review and TASKS.
- Verification: targeted HTTP tests pass (3); pnpm format, pnpm lint:fix; pnpm build and check-handbook.ts observability pass. Narrow live export probe: 15 rows/15 samples, 1,740 bytes; bodies withheld.
- Deployed account checks pass (32); check-scheduled-reader.ts 2026-11-10T15:00:00Z passes (four topics/19 stories/15 posts). All 36 sources healthy.
- Full pnpm check passes: 836 unit and 283 integration tests, four expected skips; typecheck/lint/format/boundaries green. Build/handbook pass; git diff --check clean.
- Next: route/session export composition and upstream work limits before admission; browser acceptance, Grafana capacity evidence and 15:00 UTC NBA review.
- Pushed 51fec609; restarted news-digest-api.service. Post-restart healthz, 32 deployed account boundary checks and saved Nov 10 reader checks pass; no failed user services.

## 2026-11-11: iteration 1797 — export upstream deadline and series-cap rehearsal

- Clean main; no inherited work. Alerts clear, healthz healthy, no failed user services; all 36 sources healthy. Public mode off; no provider calls.
- Prepared export requests now force timeout=2s; caller timeout/output-control overrides refused. Parser and real HTTP tests verify forwarding independently of the five-second transport deadline.
- Reviewed installed v1.155.0 export context propagation and series-limit implementation; linked exact upstream sources in the response review.
- Added disposable installed-binary rehearsal with temporary loopback/store and synthetic data only: reviewed maxExportSeries=32 accepts 32 series and refuses 33, including reduced-memory export. Process/store removed; live service limits unchanged.
- Narrow live bounded read passes: 15 rows/15 samples, 1,737 bytes; operational bodies withheld. No export admission change.
- Verification: targeted telemetry-export tests (3), pnpm format, pnpm lint:fix, pnpm build, check-handbook.ts observability; 32 deployed account boundaries and saved Nov 10 reader check pass (four topics/19 stories/15 posts).
- Next: install/verify server limits, verify deadline expiry, authenticated export composition and browser acceptance before admission; Grafana capacity and Nov 11 15:00 UTC NBA review remain open.
- Full pnpm check passes: 836 unit and 283 integration tests, four expected skips; typecheck/lint/format/boundaries green. Build/handbook pass; git diff --check clean. Isolated rehearsal command: pnpm exec tsx scripts/review-telemetry-export-limits.ts --isolated.
- Pushed 24624b33; systemctl --user restart news-digest-api.service completed. Post-restart healthz, 32 account boundaries and saved Nov 10 reader checks pass; no failed user services.

## 2026-11-11: iteration 1798 — installed metrics export limits

- Clean main; no inherited work. Alerts clear, healthz healthy, all 36 sources healthy; no provider calls. Public mode/export admission remain off.
- Installed rehearsed `search.maxExportSeries=32` and `search.maxExportDuration=2s` in the metrics unit; other CPU/memory/query settings unchanged. Restarted obs-metrics outside the edition hold.
- First process-argument check raced ExecStartPre; immediate read probes also ran before readiness. After startup, running process flags and loopback health pass; no configuration rollback required.
- Disposable installed-binary review passes: 32 synthetic series accepted, 33 refused. Command: pnpm exec tsx scripts/review-telemetry-export-limits.ts --isolated.
- Live review-native-telemetry-export.ts --live passes (13 rows/samples, 1,515 bytes); check-live-admin-telemetry.ts --live passes metrics/log/metadata and refusal checks. Operational bodies withheld.
- check-live-account-boundary.ts passes 32 checks; check-scheduled-reader.ts 2026-11-10T15:00:00Z passes (four topics/19 stories/15 posts). pnpm obs sources --check: 36/36 healthy; pnpm obs alerts: none.
- Updated affected handbook, response review, readiness and TASKS. pnpm build and check-handbook.ts observability pass; pnpm format and pnpm lint:fix pass.
- Next: deadline-expiry acceptance, authenticated export composition and browser acceptance before admission; Grafana capacity evidence and Nov 11 15:00 UTC NBA review remain open.
- Full pnpm check passes: 836 unit and 283 integration tests, four expected skips; typecheck/lint/format/boundaries green. git diff --check clean.
- Pushed 93129cdd; restarted news-digest-api.service. Post-restart healthz, 32 deployed account boundaries and saved Nov 10 reader checks pass; no failed user services.

## 2026-11-11: iteration 1799 — installed-binary export deadline expiry

- Clean main; no inherited work. Alerts clear, healthz healthy, no failed user services; 36/36 sources healthy and job check passes. No provider calls.
- Extended review-telemetry-export-limits.ts --isolated with a second disposable installed-binary process: shortened 1 ms server cap overrides the exact prepared timeout=2s request and returns native request-timeout refusal.
- Buffered transport rejects the deadline response; process health remains good. Normal two-second 32/33-series rehearsal retained; synthetic processes/stores removed. No live configuration/admission changes.
- Installed deadline rounds down to Unix seconds, permitting cheap expiry verification. Expensive-work timing at the live two-second limit remains unmeasured; documented this scope.
- Live review-native-telemetry-export.ts --live passes (16 rows/samples, 1,858 bytes); check-live-account-boundary.ts passes 32 checks; check-scheduled-reader.ts 2026-11-10T15:00:00Z passes (four topics/19 stories/15 posts).
- pnpm build and check-handbook.ts observability pass. Archived iterations 1782–1787 to keep orientation small; updated readiness, response review and TASKS.
- Next: authenticated export route composition and installed-browser acceptance before admission; Grafana capacity evidence and Nov 11 15:00 UTC NBA review remain open. Public mode stays off.
- Verification: pnpm format, pnpm lint:fix, pnpm build and full pnpm check pass (836 unit/283 integration tests, four expected skips); git diff --check clean. Repeated isolated deadline/series rehearsal passes after formatting.

## 2026-11-11: iteration 1800 — native bounded export browser composition

- Clean main; no inherited work. Alerts clear, healthz healthy, no failed user services; source/job checks pass. No provider calls.
- Installed Raw Query now rehearses a one-minute up export through the prepared buffered HTTP handler and isolated synthetic upstream; fixture series renders in Chromium.
- Browser confirms numeric start/end and exact 60-second window; upstream timeout/per-line/reduced-memory parameters and credential stripping checked. Response no-store/nosniff/no-cookie checked.
- Existing native UI global time state survives hash navigation: reload after setting one-minute hash to apply it. Explicit 30-minute refusal performs no upstream work.
- Updated fixture Raw Query screenshot, response review, readiness and TASKS; production admission/public mode remain off. Stored-session composition and broader live navigation remain next; Nov 11 15:00 UTC NBA review still due.
- Verification: pnpm format and pnpm lint:fix pass; initial concurrent lint check caught import ordering, rerun full pnpm check passes (836 unit/283 integration, four expected skips). pnpm build and check-handbook.ts observability pass; git diff --check clean.
- Browser command: pnpm exec tsx scripts/review-native-telemetry-ui.ts --proxy-assets passes; screenshot inspected. check-live-account-boundary.ts passes 32 checks; check-scheduled-reader.ts 2026-11-10T15:00:00Z passes (four topics/19 stories/15 posts).

## 2026-11-11: iteration 1801 — stored-session bounded export composition

- Clean main; no inherited work. Alerts clear, healthz healthy, no failed user services; source/job checks pass. No provider calls.
- Added prepared authenticated export middleware, unmounted in production. Each request resolves stored-session freshness before bounded buffered transport; authentication errors fail closed.
- Full-application isolated rehearsal uses real code-login cookies and separate stored account handlers against the same disposable database. Synthetic export forwarding passes for fresh admins, including forced upstream parameters and stripped caller credentials/private headers.
- Anonymous/invited readers, aged admins and logout trigger no upstream work; restoring freshness restores access. HEAD/POST, broad windows, alternate selectors and timeout overrides remain refused.
- Updated response review, readiness and TASKS. Public mode/export admission remain off; full browser/session composition and broader live navigation remain open. Nov 11 15:00 UTC NBA review remains due.
- Live check-live-account-boundary.ts passes 32 checks; check-scheduled-reader.ts 2026-11-10T15:00:00Z passes (four topics/19 stories/15 posts). check-handbook.ts observability passes.
- Verification: pnpm format, pnpm lint:fix, pnpm build and full pnpm check pass (836 unit/283 integration tests, four expected skips); git diff --check clean.

## 2026-11-11: iteration 1802 — browser cookie/stored-session export boundary

- Clean main; no inherited work. Alerts clear, healthz healthy, no failed user services; all 36 sources healthy and latest scheduled digest completed. No provider calls.
- Added Chromium cookie-jar transport to the isolated full-application rehearsal: real code-login cookie is Secure/HttpOnly/Strict, unavailable to page JavaScript, and sent on same-origin export fetches.
- Synthetic HTTPS page and export only; every browser request is fulfilled locally. Fresh/restored admins render the synthetic series; anonymous/invited readers, aged and logged-out admins receive empty 404 responses with no export upstream work. Each context repeats the no-store request.
- Updated response review, readiness and TASKS. Installed native UI/stored-session composition and broader live navigation remain open; public mode/export admission stay off. Nov 11 15:00 UTC NBA review remains due.
- pnpm build and check-handbook.ts observability pass; check-live-account-boundary.ts passes 32 checks; check-scheduled-reader.ts 2026-11-10T15:00:00Z passes (four topics/19 stories/15 posts).
- Verification: pnpm format, pnpm lint:fix and full pnpm check pass (836 unit/283 integration tests, four expected skips); git diff --check clean. Chromium cases pass within the full-application integration test. API restarted; healthz healthy.

## 2026-11-11: iteration 1803 — installed Raw Query with stored sessions

- Clean main; no inherited work. Alerts clear, healthz healthy, no failed user services; all 36 sources healthy and digest queue has zero failed runs. No provider calls.
- Added explicit installed metrics asset capture: seven reviewed files match SHA-256, byte count, MIME and no-cookie checks. Captured assets remain temporary and outside git.
- Optional TELEMETRY_INSTALLED_ASSET_FIXTURE composes installed Raw Query with the isolated full application, real code-login cookie, prepared asset proxy and bounded synthetic export. Tests never call live asset/telemetry services.
- Fresh/restored admins render the uniquely tagged synthetic series; anonymous/invited readers, aged and logged-out admins cannot load the document and trigger no telemetry upstream work. Browser cookie forwarding, CSP/nosniff, no-store and no-cookie responses checked.
- Initial integration exposed a rehearsal-local document variable shadowing the browser global; renamed it before the final full check. Production admission/public mode remain off; other native screens/session composition and broader live navigation remain open.
- Updated response review, readiness, TASKS and inspected native stored-session screenshot; archived iterations 1788–1793 after progress passed 25 KB. Nov 11 15:00 UTC NBA review remains due.
- Verification: pnpm format, pnpm lint:fix, pnpm build and TELEMETRY_INSTALLED_ASSET_FIXTURE=/tmp/telemetry-assets-1803.json pnpm check pass (836 unit/283 integration tests, four expected skips); git diff --check clean. Earlier combined check received SIGTERM after its final test; standalone full rerun exits 0.
- check-handbook.ts observability, check-live-account-boundary.ts (32 checks) and check-scheduled-reader.ts 2026-11-10T15:00:00Z pass (four topics/19 stories/15 posts).

## 2026-11-11: iteration 1804 — installed metrics navigation with stored sessions

- Clean main; no inherited work. Alerts clear, healthz healthy, no failed user services; all 36 sources healthy and digest queue has zero failed runs. No provider calls.
- Extended the captured-installed-assets Chromium rehearsal to metrics Dashboards and Query Analyzer with full document navigation for each real stored-session actor.
- Fresh/restored admins mount both screens without script errors, CSP violations or missing-dashboard messages; anonymous/invited readers, aged and logged-out admins cannot load either document or trigger telemetry upstream work.
- Reuses same-origin HttpOnly-cookie forwarding, prepared proxy, no-store/no-cookie responses and asset CSP/nosniff checks. Synthetic telemetry only; production flags remain off.
- Updated readiness, response review, TASKS and synthetic browser screenshots. Logs native screens/session composition and live navigation remain open; Nov 11 15:00 UTC NBA acceptance review remains due.
- Live check-live-account-boundary.ts passes 32 checks; check-scheduled-reader.ts 2026-11-10T15:00:00Z passes (four topics/19 stories/15 posts). pnpm build and check-handbook.ts observability pass.
- Initial browser runs exposed two rehearsal issues: native navigation appends time parameters, and Dashboards needs its dedicated rows/panels fixture. Corrected both; the full stored-session browser case now passes and both new screenshots are inspected.
- Verification: pnpm format, pnpm lint:fix and captured-assets pnpm check pass (836 unit/283 integration tests, four expected skips); git diff --check clean. Combined shell received SIGTERM after its passing test report; standalone full check exits 0. API restarted healthy after commit.

## 2026-11-11: iteration 1805 — installed logs UI with stored sessions

- Clean main; no inherited work. Alerts clear, healthz healthy, no failed user services; all 36 sources healthy. No provider calls.
- Explicit asset capture now verifies all 13 installed metrics/logs assets by SHA-256, bytes, MIME and no-cookie checks; captures remain temporary outside git.
- Extended isolated full-application Chromium rehearsal to logs Query and Overview with real stored-session cookies and prepared proxy. Fresh/restored admins mount both; Query executes query/hits/stream-field requests with synthetic responses, including an empty log stream.
- Anonymous/invited readers, aged and logged-out admins receive 404 without upstream work. Cookie stripping, no-store, CSP/nosniff and no script errors/CSP violations pass.
- Inspected both new synthetic screenshots; discarded unrelated timestamp-only regenerated metrics screenshots. Updated TASKS/readiness/response review. Production admission/public mode stay off; remaining controls/live navigation remain open. Nov 11 15:00 UTC NBA review remains due.
- Verification: pnpm format, pnpm lint:fix, pnpm build, check-handbook.ts observability, check-live-account-boundary.ts (32 checks), check-scheduled-reader.ts 2026-11-10T15:00:00Z (four topics/19 stories/15 posts) pass.
- Captured-assets pnpm check reports 836 unit tests and 283 integration passes/four expected skips; initial shell received SIGTERM after passing coverage output; standalone full rerun exits 0. git diff --check clean; API restart/health checked after commit.

## 2026-11-11: iteration 1806 — open logs screen session freshness

- Clean main; no inherited work. Alerts, healthz, sources, jobs and services checks pass. No provider calls.
- Extended installed-assets Chromium/full-application rehearsal: after an admin mounts logs Query, age its real stored session beyond seven days without reloading the screen.
- The next Execute action returns 404 with zero telemetry upstream work; restoring the saved session creation time lets the same screen execute with HTTP 200. Synthetic telemetry only; production admission/public mode remain off.
- Inspected expired-session screenshot (native stream-field 404 shown); retained it and discarded unrelated regenerated timestamp-only screenshots. Updated TASKS, readiness and response review.
- Verification: pnpm format, pnpm lint:fix, pnpm build, check-handbook.ts observability, check-live-account-boundary.ts (32 checks), check-scheduled-reader.ts 2026-11-10T15:00:00Z (four topics/19 stories/15 posts) pass.
- Captured-assets pnpm check exits 0: 836 unit/283 integration passes, four expected skips; git diff --check clean. API restart and health verified after commit. Nov 11 15:00 UTC NBA acceptance review remains due; remaining telemetry controls/live navigation remain open.
