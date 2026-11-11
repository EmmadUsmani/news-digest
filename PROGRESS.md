# Progress

[Through iteration 1743](docs/progress-archive/2026-11-10-through-1743.md).

[Iterations 1753–1759](docs/progress-archive/2026-11-11-through-1759.md).

[Iterations 1760–1763](docs/progress-archive/2026-11-11-iterations-1760-1763.md).

[Iterations 1764–1769](docs/progress-archive/2026-11-11-through-1769.md).

[Iterations 1770–1775](docs/progress-archive/2026-11-11-iterations-1770-1775.md).

[Iterations 1776–1781](docs/progress-archive/2026-11-11-iterations-1776-1781.md).

[Iterations 1782–1787](docs/progress-archive/2026-11-11-iterations-1782-1787.md).

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
- Verification: pnpm format, pnpm lint:fix and full pnpm check pass (836 unit/283 integration tests, four expected skips); git diff --check clean. Repeated isolated deadline/series rehearsal passes after formatting.

## 2026-11-11: iteration 1800 — native bounded export browser composition

- Clean main; no inherited work. Alerts clear, healthz healthy, no failed user services; source/job checks pass. No provider calls.
- Installed Raw Query now rehearses a one-minute up export through the prepared buffered HTTP handler and isolated synthetic upstream; fixture series renders in Chromium.
- Browser confirms numeric start/end and exact 60-second window; upstream timeout/per-line/reduced-memory parameters and credential stripping checked. Response no-store/nosniff/no-cookie checked.
- Existing native UI global time state survives hash navigation: reload after setting one-minute hash to apply it. Explicit 30-minute refusal performs no upstream work.
- Updated fixture Raw Query screenshot, response review, readiness and TASKS; production admission/public mode remain off. Stored-session composition and broader live navigation remain next; Nov 11 15:00 UTC NBA review still due.
- Verification: pnpm format and pnpm lint:fix pass; initial concurrent lint check caught import ordering, rerun full pnpm check passes (836 unit/283 integration, four expected skips). pnpm build and check-handbook.ts observability pass; git diff --check clean.
- Browser command: pnpm exec tsx scripts/review-native-telemetry-ui.ts --proxy-assets passes; screenshot inspected. check-live-account-boundary.ts passes 32 checks; check-scheduled-reader.ts 2026-11-10T15:00:00Z passes (four topics/19 stories/15 posts).
