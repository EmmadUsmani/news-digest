# Progress

Earlier entries: [iterations 1062–1069](docs/progress-archive/2026-11-07-iterations-1062-1069.md).

## 2026-11-07: iteration 1070 — keep publisher links on the primary report

- Advanced STEERING 33/43 while Nov 7 scheduled X/Bluesky acceptance waits. Clean main, no leftovers; alerts clear, health DB/Redis OK, sources 36/36 healthy; digest queue zero failed.
- Reader weakness reproduced in browser: with two reports from one publisher, its source-row link opened secondary coverage instead of the headline article. Prefer the primary report for matching source labels; expanded coverage retains every article and its own destination.
- pnpm exec tsx scripts/smoke-reader-primary-source.ts failed against the old build with secondary/primary URL mismatch, then passed desktop/mobile light/dark after rebuilding. Four destination screenshots saved; mobile light inspected. Synthetic coverage over saved edition, GET-only/external requests blocked.
- pnpm exec tsx scripts/smoke-reader-layout.ts passed saved-content/navigation/coverage checks in all four layouts after updating its stale whole-post X link selector for the linked-text cards. Discarded unrelated layout screenshot churn.
- Passed pnpm format, pnpm lint:fix, pnpm build and git diff --check. Full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- systemctl --user restart news-digest-api news-digest-worker completed; curl --retry /healthz DB/Redis OK after startup; pnpm exec tsx scripts/obs.ts alerts clear and sources 36/36 healthy.
- No paid calls or edition writes. Saved edition four topics/20 stories/17 posts. No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Next: review first Nov 7 scheduled keyword-X and reserved-slot Bluesky picks, costs and Tech repetition. Observability RAM target remains unmet.

## 2026-11-07: iteration 1071 — read full post context on mobile

- Advanced STEERING 33/43 while Nov 7 scheduled X/Bluesky acceptance waits. Clean main, no leftovers; health/alerts clear and sources 36/36 healthy.
- Reader weakness: compact post context exposed its full text only on hover, leaving touch readers unable to read truncated notes. Native disclosures now expand/collapse by touch, Enter or Space while retaining one-line collapsed notes and duplicate-text suppression.
- pnpm exec tsx scripts/smoke-reader-post-context.ts passed touch/keyboard/collapse/wrapping checks in desktop/mobile light/dark. Four screenshots saved; mobile light inspected. Synthetic context over a saved edition, GET-only/external traffic blocked.
- Initial targeted smoke caught missing truncation; corrected the layout. Screenshot inspection caught bottom-aligned disclosure marker; replaced it with a top-aligned chevron. Final targeted replay passed.
- pnpm exec tsx scripts/smoke-reader-layout.ts passed all four layouts, contents/deep links/coverage/overflow. Initial run overlapped rebuilding and timed out on navigation; rerun after the final build passed. Discarded unrelated screenshot churn.
- Passed pnpm format, pnpm lint:fix, pnpm build, git diff --check and full pnpm check: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- API/worker restarted; curl --retry /healthz DB/Redis OK after startup; pnpm obs alerts clear, sources 36/36 healthy, digest queue zero failed. Saved edition four topics/20 stories/17 posts.
- No paid calls or edition writes. No source/schema/system-flow changes; SOURCES unchanged.
- Initial push rejected: concurrent lead status-doc commit 7cb32a12 on origin/main. Merged without rewriting history; no application overlap.
- Second push rejected by concurrent owner steering 69445946; preserved item 45 and completed its step 1: ~800 MiB RAM target documented in decision/handbook, resolved human request removed, limits unchanged; check-handbook passed.
- Next: item 45 real-edition/spec gap checklist, close item 33, then B2 backups; scheduled X/Bluesky acceptance still awaits publication.

## 2026-11-07: iteration 1072 — freeze the real-reader acceptance list

- Clean main, no leftover work. Followed item 45 step 2 while Nov 7 scheduled X/Bluesky checks wait until publication; no paid calls or edition writes.
- Compared real saved Nov 6 edition `1c83e78b-47f9-4a6f-bfb4-93820a691aea` (four topics/20 stories/17 posts) with ui-spec and item 33 Done when; TASKS now has one remaining list, not open-ended reader polishing.
- One-off read-only Playwright measurement at 1440×1100 with external requests blocked: topic heights Tech/NBA/Gaming/World 2832/2719/2517/1974 px (2.57/2.47/2.29/1.79 screens). External embeds enabled and topics scrolled: 2832/3873/3690/2237 px (2.57/3.52/3.35/2.03), eight frames present. Partial lazy loading is sufficient to demonstrate NBA/Gaming exceed the target; don't use blocked-embed measurements for acceptance.
- Remaining list: reduce real loaded-embed length, refresh every route's four screenshots, complete forbidden-label scan coverage. Existing reader/archive scans cover subsets; a raw scan matched “independent” only inside saved content, which the spec exempts. No new product feature or synthetic-only gap.
- pnpm exec tsx scripts/smoke-reader-layout.ts and scripts/smoke-reader-archive.ts passed desktop/mobile light/dark, saved-content/navigation/coverage/overflow and archive recovery. Refreshed eight reader/archive route screenshots; inspected desktop/mobile reader. Discarded 26 incidental detail screenshot refreshes.
- pnpm exec tsx scripts/smoke-admin-gate.ts passed 24 protected GET/HEAD paths, identity/cache/forwarded-token checks; saved edition unchanged. Pre-public proxy header replacement proof still required, private rollout unchanged.
- pnpm build passed (existing chunk-size warning). API/worker restarted; curl --retry /healthz DB/Redis OK, pnpm obs alerts clear, sources --check 36/36 healthy, digest-generation queue available/zero failed/next run 15:00 UTC.
- Archived older PROGRESS entries above 25 KB. No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- pnpm format, pnpm lint:fix, git diff --check and full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- Next: finish only the three acceptance items, close item 33, then begin approved B2 backups. Scheduled keyword-X/reserved-Bluesky acceptance still waits for Nov 7 publication.

## 2026-11-07: iteration 1073 — complete reader forbidden-label coverage

- Clean main, no leftover work; alerts clear, /healthz DB/Redis OK and sources 36/36 healthy. Scheduled Nov 7 acceptance still awaits publication.
- Added scripts/smoke-reader-labels.ts for the actual saved latest edition, archive and a distinct past edition, desktop/mobile light/dark, plus mobile contents sheets. Scans text and accessible labels while exempting editorial text, including coverage headlines; surrounding controls remain scanned.
- pnpm exec tsx scripts/smoke-reader-labels.ts passed all routes/layouts; injected AI-edited label rejection control passed. First attempt exposed a CJS top-level-await incompatibility; corrected. Initial scan caught saved Claude coverage headline, correctly exempted under the spec.
- pnpm exec tsx scripts/smoke-admin-gate.ts passed 24 protected GET/HEAD paths, identity/cache and forwarded-token checks; saved edition unchanged. Proxy header replacement proof remains required before public access.
- pnpm build passed with existing chunk warning. No UI/source/schema/system-flow changes, paid calls or edition writes; screenshots, SOURCES and handbook unchanged.
- pnpm format, pnpm lint:fix, git diff --check and full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green. API/worker restarted; health DB/Redis OK and alerts clear; final reader scan passed against rebuilt app.
- Remaining item 33 work: loaded-embed NBA/Gaming page length and all-route screenshot refresh, then close and begin B2.

## 2026-11-07: iteration 1074 — refresh every spec route screenshot

- Clean main, no leftover work; alerts clear, /healthz DB/Redis OK, sources 36/36 healthy. Nov 7 keyword/Bluesky acceptance still awaits publication.
- Added read-only scripts/capture-spec-routes.ts: 14 routes × desktop/mobile × light/dark = 56 saved-production-data screenshots; indexed in docs/screenshots/ui/spec-routes.md. Includes latest/archive/past edition, not-found and all ten admin routes.
- Capture passed all four layouts: zero writes, browser errors or horizontal overflow; admin token stays in the existing server-side local bridge. External requests blocked; these fallback-card screenshots are not loaded-embed length evidence.
- Inspected overview desktop light, topic editor desktop dark, not-found mobile light and new-edition mobile dark. No product/source/schema/system-flow changes; SOURCES and handbook unchanged.
- Initial capture needed the admin header selector corrected; next attempt overlapped rebuild and hit an admin 404. Restarted services, reran against stable build; all 56 captures passed.
- pnpm build passed with existing chunk warning; pnpm exec tsx scripts/smoke-reader-labels.ts and scripts/smoke-admin-gate.ts passed; saved edition unchanged. Proxy header replacement proof remains required before public access.
- Initial concurrent lint:fix/check processes ended with signal 143 during lint, no diagnostic; sequential pnpm lint:fix and full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green. pnpm format and git diff --check passed.
- Next: reduce real loaded-embed NBA/Gaming desktop length, measure all topics, close item 33, then start B2. No paid calls or edition writes.

## 2026-11-07: iteration 1075 — close reader rebuild with bounded desktop posts

- Clean main, no leftover work; health DB/Redis OK, alerts clear, sources 36/36 healthy. Nov 7 scheduled acceptance still awaits publication.
- Fully loaded baseline exceeded the earlier partial-load estimate: Tech/NBA/Gaming 5436/4863/5482 px. Bounded desktop posts to a keyboard-accessible 1400 px scroll area; every saved card and full-width official embed remains available. Mobile keeps continuous page flow.
- pnpm exec tsx scripts/smoke-reader-length.ts passed light/dark with all 16 X frames and 17 saved posts: Tech/NBA/Gaming/World 2849/2849/2877/2237 px (2.03–2.62 screens). End-key scrolling, later-card access, no horizontal overflow and unbounded mobile posts passed. Repeated after correcting screenshot positioning.
- pnpm exec tsx scripts/smoke-reader-layout.ts passed four device/theme views, saved content, navigation and coverage; width assertion accounts for the reserved scrollbar gutter. Discarded incidental detail-image refreshes; kept four reader overview captures.
- pnpm exec tsx scripts/capture-spec-routes.ts refreshed 56 route captures; no browser writes/errors/overflow. Added eight loaded-post screenshots and inspected NBA light/Gaming dark. Index links both sets.
- pnpm exec tsx scripts/smoke-reader-labels.ts and scripts/smoke-admin-gate.ts passed; saved edition unchanged (20 stories/17 posts). Public proxy identity proof remains required before public access.
- Updated affected handbook page; pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime passed (18 pages/28 tables, no metadata warnings). No diagram/source/schema changes or paid calls.
- Item 33 closed with linked screenshots and results; removed its completed Current order line. Item 37 B2 backups is next while X/Bluesky publication checks wait; reviewed its encryption, retention and 3 GB limits.
- pnpm build passed (existing chunk warning); API/worker restarted. pnpm format, pnpm lint:fix and git diff --check passed. First full check ended with signal 143 during integration without a diagnostic; sequential pnpm check rerun passed 536 unit/226 isolated integration tests, typecheck/lint/format/boundaries green.
- pnpm obs services --check reports 13/13 healthy; pnpm obs jobs --check passes, digest-generation available/one worker/zero failed. Health and alerts remain clear. No source changes, edition writes or new blocker.

## 2026-11-07: iteration 1076 — first encrypted off-VM B2 backups

- Owner value: losing this VM no longer loses the database, secrets or recovery state. Clean main/no leftover work; /healthz DB/Redis OK, alerts clear, sources healthy and digest queue available. Nov 7 X/Bluesky acceptance still awaits publication.
- Read documented exe.dev VM backup support: AWS-federated disk export does not fit the approved B2 setup; implemented the approved recovery bundle. Installed official age v1.3.2 under ~/.local/bin after verifying its published GitHub asset SHA256; no private key on VM.
- Added SDK-free S3 SigV4/curl adapter (signed headers over stdin), encrypted database/VM uploads, download-SHA256 proof, permanent-version pruning, tiered retention, all-version bucket accounting and single 3,000,000,000-byte cap. Budget refusals preserve newest copies and local backups. Last-30-day upload sizes feed a conservative 60-day growth projection.
- Live database 6,734,672 bytes and VM 345,943 bytes uploaded/download-verified. Encrypted deletion proofs passed through curl; admission also permanently pruned the superseded same-day database version and preserved the newest copies. Fresh listings confirmed disappearance. Ran bash ops/backups/install.sh and systemctl --user start news-digest-backup.service: fresh 28-table local dump plus 8,020,058-byte encrypted upload succeeded. Existing timer now uploads nightly and bundles weekly; no new service.
- Bucket 8,366,001/3,000,000,000 bytes (0.279%); $0.000058/month before shared free allowance, expected $0 within it. VM bundle excludes local dump history, logs, metrics, caches and symlinks. Added Mac download/decrypt/pg_restore-list commands and rebuild guide; Operations records size/budget/cost.
- python3 ops/backups/test_database.py (4) and test_offsite.py (9) passed: under/over/still-over budgets, retention tiers, newest/foreign protection, deletion confirmation, checksum rejection, bundle contents, 30-day projection and signed-header isolation. Added offsite suite to pnpm check. systemd-analyze --user verify passed.
- Prepared stale-database/VM, failed-upload and storage/projection alerts; /opt/news-digest-observability/vmalert-tool-prod unittest -files=ops/observability/alerts.test.yml passed including threshold crossings. Metrics are live; active rules file is root-owned. STEERING 37 explicitly requires stopping at root: no root action attempted; exact owner deployment commands in NEEDS_FROM_HUMAN.md. Item 37 remains open for active-rule verification; partial ack only.
- pnpm build passed (existing chunk warning); pnpm format, pnpm lint:fix, git diff --check and full pnpm check passed: 537 unit/226 isolated integration tests, typecheck/lint/format/boundaries green. Nine offsite checks and real curl listing/download/PUT/DELETE proofs passed after transport verification. Handbook checks passed (18 pages/28 tables, no metadata warnings); no diagrams changed. Archived progress 1062–1069 and shortened task history.
- API/worker restarted after build; /healthz DB/Redis OK after readiness, 13/13 services healthy, alerts clear and saved edition API returns real topics. No app LLM/X spend, source/schema changes or edition writes. Next: owner activates B2 rules, then verify/close 37; while waiting follow item 42 and scheduled Nov 7 acceptance.
