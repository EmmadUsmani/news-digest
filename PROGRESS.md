# Progress

Earlier entries: [iterations 1062–1069](docs/progress-archive/2026-11-07-iterations-1062-1069.md).

Earlier entries: [iterations 1070–1074](docs/progress-archive/2026-11-07-iterations-1070-1074.md).

Earlier entries: [iterations 1075–1084](docs/progress-archive/2026-11-07-iterations-1075-1084.md).

Earlier entries: [iterations 1089–1101](docs/progress-archive/2026-11-07-iterations-1089-1101.md).

Earlier entries: [iterations 1191–1199](docs/progress-archive/2026-11-07-iterations-1191-1199.md).

Earlier entries: [iterations 1200–1207](docs/progress-archive/2026-11-07-iterations-1200-1207.md).

Earlier entries: [iterations 1208–1214](docs/progress-archive/2026-11-07-iterations-1208-1214.md).

Earlier entries: [iterations 1215–1222](docs/progress-archive/2026-11-07-iterations-1215-1222.md).

Earlier entries: [iterations 1223–1229](docs/progress-archive/2026-11-07-iterations-1223-1229.md).

Archived: [iterations 1230–1234](docs/progress-archive/2026-11-07-iterations-1230-1234.md).

Archived: [iterations 1235–1242](docs/progress-archive/2026-11-07-iterations-1235-1242.md).

Earlier entries: [iterations 1243–1246](docs/progress-archive/2026-11-07-iterations-1243-1246.md).

Earlier entries: [iterations 1247–1254](docs/progress-archive/2026-11-07-iterations-1247-1254.md).

Earlier entries: [iterations 1255–1263](docs/progress-archive/2026-11-07-iterations-1255-1263.md).

Earlier entries: [iterations 1264–1271](docs/progress-archive/2026-11-08-iterations-1264-1271.md).

Earlier entries: [iterations 1272–1282](docs/progress-archive/2026-11-08-iterations-1272-1282.md).

Earlier entries: [iterations 1283–1291](docs/progress-archive/2026-11-08-iterations-1283-1291.md).

## 2026-11-08: iteration 1292 — visible development allowances

- Owner-visible improvement: paid private-test options now have matching lifetime allowance figures on admin Spend, including charges, unresolved holds, caps, 75% stop thresholds, available funds and stop/report warnings.
- Clean main/no leftovers; alerts/health clear, all 36 sources healthy and zero failed digest jobs. Normal scheduled publication remains due at 15:00 UTC; metrics passive check not yet due (≥05:21 UTC).
- Added read-only development totals through the digests public boundary and typed operations contract; production ledger and admission behavior unchanged. Handbook updated in the same change.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (625 unit/233 integration pass, four expected skips), `pnpm build`, handbook check and `git diff --check` pass. First check caught import ordering in the updated test; fixed before the successful full rerun.
- `pnpm exec tsx scripts/smoke-development-spend.ts` passes four desktop/mobile light/dark views: real totals, fixture stop/unavailable states, no overflow/errors/writes. Screenshots updated and mobile light/desktop dark inspected; published-content comparison verifies all five complete reader responses unchanged.
- Four app services restarted; health/alerts clear. Archived iterations 1272–1282 to keep PROGRESS.md small. Committing/pushing and restarting services against main; no provider calls/spend, VM private, phase 0/2 scheduled acceptance still open.

## 2026-11-08: iteration 1293 — actionable private-test refusals

- Clean main/no leftovers; alerts/health clear, all 36 sources healthy, zero failed digest jobs. Phase 0/2 scheduled acceptance remains due at 15:00 UTC; metrics passive check not due until ≥05:21 UTC.
- Private-test form previously treated disabled development providers as an uncertain save. Exact known AI/X refusals now explain the disabled option, retry action and that no test was saved; unknown failures retain duplicate-prevention guidance. Linked development allowances beside the paid options.
- Updated pipeline handbook and four screenshots. `pnpm exec tsx scripts/smoke-test-edition-form.ts` passes desktop/mobile light/dark with intercepted real saved snapshot, both disabled-provider refusals, unknown-error fallback and no actual writes/provider calls; mobile light screenshot inspected.
- `pnpm build`, web rebuild and `check-handbook.ts 04-edition-pipeline` pass; full five-response publication comparison unchanged. Required `pnpm format`/`pnpm lint:fix` run; full check result below.
- Four app services restarted and health passes. VM stays private, no provider spend or later-phase work.
- Final `pnpm check` passes: 625 unit/233 integration, four expected skips; `git diff --check` clean. Committing/pushing, then restarting four services against main and checking health/alerts. Next: passive metrics check ≥05:21 UTC and scheduled acceptance at 15:00 UTC.

## 2026-11-08: iteration 1294 — identifiable saved-edition links

- Clean main/no leftovers; alerts/health clear, all 36 sources healthy and zero failed digest jobs. Normal scheduled acceptance remains due at 15:00 UTC; passive metrics check ≥05:21 UTC.
- Saved cards repeated the same accessible “View edition” link name. Each link now includes its saved story/post title, so assistive navigation identifies the destination context. Visible text and saved copies unchanged.
- Extended existing actual-content bookmark browser checks for current/historical edition link names across desktop/mobile light/dark; screenshots refreshed. No provider calls or backend writes.
- `pnpm build`, `pnpm format`, `pnpm lint:fix`, `pnpm check` pass (625 unit/233 integration, four expected skips). `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` passes all four views; saved desktop screenshot inspected.
- `compare-publication-content.ts compare` verifies five complete reader responses unchanged; `git diff --check` clean. No handbook flow change. Committing/pushing and restarting four app services; VM remains private, no spend.

## 2026-11-08: iteration 1295 — accurate phase acceptance handoff

- Clean main/no leftover work. Alerts clear, health passes, all 36 sources healthy; digest-generation has zero failed jobs and next run Nov 8 15:00 UTC.
- TASKS.md had accumulated 33.9 KB of checkpoints, including obsolete claims that deployed development runtimes were unwired. Consolidated phase-0/phase-2 status and the remaining scheduled-publication gate; archived completed checkpoints without losing their evidence.
- TASKS.md is now about 9 KB. Verified every local link in the updated task list and archive; archive links now resolve from their new location. No application behavior or owner priority changes; phase 1 remains gated, VM private, no provider calls/spend.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (625 unit/233 integration pass, four expected skips), `pnpm build` and `git diff --check` pass. Committing/pushing and restarting four services against main; final health/alerts follow. Next: passive metrics check ≥05:21 UTC, scheduled phase acceptance at 15:00 UTC.

## 2026-11-08: iteration 1296 — readable saved post formatting

- Clean main/no leftover work. Alerts clear, health passes and source checks pass; digest-generation has zero failed jobs and next run 15:00 UTC. Metrics passive check not due until ≥05:21 UTC.
- Reader weakness: Saved items collapsed original post line breaks, flattening paragraphs/lists. Preserve excerpt newlines and wrap long links within cards. The owner would notice saved posts retain their readable structure on mobile and desktop.
- Extended actual-content bookmark browser verification for excerpt whitespace and post overflow; no provider calls, backend writes, publication or selection changes. No handbook flow change.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` (625 unit/233 integration pass, four expected skips) and `git diff --check` pass. First combined format/lint/check process was terminated during unit tests without a reported test failure; standalone full check rerun passed.
- `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` passes desktop/mobile light/dark, current/historical copies, cross-tab updates, formatting and overflow. Refreshed four saved-page screenshots; inspected mobile light. Discarded unrelated reader screenshot rendering noise.
- Committing/pushing and restarting four app services against main; final health/alerts checked after restart. VM private, no provider spend. Next: metrics check ≥05:21 UTC and scheduled acceptance at 15:00 UTC.

## 2026-11-08: iteration 1297 — easier topic selection on touch screens

- Clean main/no leftover work. Alerts/health and source checks pass; digest-generation has zero failed jobs and next run 15:00 UTC. Metrics passive check not due until ≥05:21 UTC.
- Reader weakness: topic-picker labels had small touch targets. Each full row now offers at least 44 pixels of height, a larger checkbox and a visible keyboard-focus outline. The owner can hide/restore topics more easily on mobile.
- Extended `pnpm exec tsx scripts/smoke-reader-preferences.ts`: verifies every target's dimensions and restores a topic by tapping row padding. All desktop/mobile light/dark checks pass, including persistence, historical editions, cross-tab changes and blocked storage.
- Refreshed four topic-menu screenshots; inspected mobile light. Discarded unrelated reader screenshot rendering noise. No backend writes/provider calls or handbook flow changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` (625 unit/233 integration pass, four expected skips) and `git diff --check` pass. Committing/pushing and restarting four services against main; scheduled phase acceptance remains due at 15:00 UTC, VM private.

## 2026-11-08: iteration 1298 — keyboard shortcut for Saved items

- Clean main/no leftover work. Alerts/health pass, all 36 sources healthy; digest-generation has zero failed jobs and next run 15:00 UTC. Metrics passive check completed below.
- Reader weakness: Saved items lacked the keyboard skip shortcut available on the edition/archive. Added the shared shortcut targeting its focusable heading; keyboard readers can bypass the repeated header in populated and empty lists.
- Extended `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` for first-Tab access and heading focus in both states across desktop/mobile light/dark; four focused-shortcut screenshots added, desktop light inspected. Initial browser attempt pressed Tab before React rendered; explicit attached-state wait fixes the check.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` and `git diff --check` pass (625 unit/233 integration, four expected skips). Discarded unrelated bookmark screenshot rendering noise. No handbook flow change, backend writes, provider calls or spend.
- Committing/pushing and restarting four app services against main; final health/alerts follow. VM remains private; scheduled phase acceptance still waits for Nov 8 15:00 UTC.
- Due hourly probe `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` (05:21:08–39): 23 healthy rules, four uncached queries ≤0.263 s, zero new evaluator errors/misses; one small merge/3,491 rows, no big merge. Admission hits 2, queue timeouts/slow queries 0; comparable compaction still open. Next ≥06:22 UTC.

## 2026-11-08: iteration 1299 — announce Saved items removal

- Clean main/no leftover work. Alerts and health pass; all 36 sources have successful collection and no current errors. Digest-generation has zero failed jobs and next run 15:00 UTC. Metrics probe not due until ≥06:22 UTC.
- Reader weakness under item 50 phase 2: removing a saved item moved focus but gave no screen-reader confirmation. Added a polite atomic status naming the removed item and remaining count, including the empty list; readers can confirm the action without searching the page.
- Extended `pnpm exec tsx scripts/smoke-reader-bookmarks.ts`: removed title/count and last-item announcement pass with existing focus, persistence, historical-copy and cross-tab checks in desktop/mobile light/dark. Inspected mobile light screenshot; discarded unrelated raster rendering noise and updated screenshot index for this nonvisual change.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` (625 unit/233 integration pass, four expected skips) and `git diff --check` pass. No handbook flow change, backend writes, provider calls or spend.
- Committing/pushing and restarting four app services against main; final health/alerts follow. VM private; scheduled phase acceptance remains due Nov 8 15:00 UTC.

## 2026-11-08: iteration 1300 — larger Save touch targets

- Clean main/no leftover work. Alerts/health pass; all 36 sources have successful collection and no current errors. Digest-generation has zero failed jobs, next run 15:00 UTC; metrics probe not due until ≥06:22 UTC.
- Reader weakness under item 50 phase 2: story/post Save controls were only 36 px tall. Both now have at least 44 × 44 px touch targets; mobile readers can bookmark more easily without needing precise taps.
- Extended `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` to measure story and every saved-edition post control. Desktop/mobile light/dark checks pass with persistence, historical copies, removal and cross-tab behavior. Four focused screenshots added, four edition screenshots refreshed; inspected desktop/mobile light.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` and `git diff --check` verified before commit; 625 unit/233 integration pass with four expected skips. No handbook flow change, backend writes, provider calls or spend.
- Commit/push and four-service restart follow verification; VM remains private. Scheduled phase acceptance still waits for Nov 8 15:00 UTC.

## 2026-11-08: iteration 1301 — easier Saved items actions on mobile

- Clean main/no leftover work. Alerts/health pass; all 36 sources have successful collection and no current errors. Digest-generation has zero failed jobs and next run 15:00 UTC; metrics probe not due until ≥06:22 UTC.
- Reader weakness under item 50 phase 2: Saved items Remove and View edition targets were smaller than the edition Save controls. Both now offer at least 44 × 44 px targets; the edition link also has a visible keyboard-focus outline. The owner can revisit or remove bookmarks more easily on mobile.
- `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` passes desktop/mobile light/dark with actual saved stories, X and Bluesky copies, historical editions, persistence, cross-tab updates and removal focus/announcements. Refreshed four saved-page screenshots; inspected desktop/mobile light. Discarded unrelated screenshot rendering noise.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` (625 unit/233 integration pass, four expected skips) and `git diff --check` pass. No handbook flow change, backend writes, provider calls or spend.
- Scheduled phase acceptance remains due Nov 8 15:00 UTC; VM remains private. Commit/push and four-service restart follow verification.

## 2026-11-08: iteration 1302 — return from empty Saved items

- Clean main/no leftover work. Alerts/health and source checks pass; digest-generation has zero failed jobs and next run 15:00 UTC. Metrics probe not due until ≥06:22 UTC.
- Reader weakness under item 50 phase 2: the empty saved list explained Save but offered no direct edition action. Added a keyboard-accessible Browse the latest edition link, so first-time readers and readers removing their last bookmark can return directly to real content.
- `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` verifies keyboard activation, latest-edition destination/story and existing bookmark behavior in desktop/mobile light/dark. First run hit a post re-save visibility timeout in mobile dark, after the new navigation passed; complete unchanged retry passes all four combinations. Refreshed four empty-state screenshots, inspected mobile light, discarded unrelated rendering noise.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` and `git diff --check` verified before commit; 625 unit/233 integration pass, four expected skips. Archived iterations 1283–1291 to keep this file small. No handbook system-flow change, backend writes, provider calls or spend.
- Scheduled phase acceptance waits for Nov 8 15:00 UTC; VM remains private. Commit/push and four-service restart follow verification.

## 2026-11-08: iteration 1303 — easier access to saved items

- Clean main/no leftover work. Health/alerts pass; all 36 sources have no current error. Digest-generation has zero failed jobs and next run 15:00 UTC. Metrics probe not due until ≥06:22 UTC.
- Reader weakness under item 50 phase 2: the edition Saved items navigation was a small text-only touch target. Mobile screenshot inspection also found the fixed topic bar covered the link; moved navigation below it. It now offers at least 44 × 44 px and a visible keyboard-focus outline; mobile readers can open their bookmarks more easily.
- Extended `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` to measure the navigation target and activate it with the keyboard into the actual saved list in desktop/mobile light/dark. Initial check ran before the build completed and correctly rejected the old target; rebuilt app passes. Captured focused navigation screenshots; final capture starts at the header so sticky topic navigation does not obscure the link.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` and `git diff --check` are the verification commands; all pass (625 unit tests, 233 integration passes, four expected skips). Desktop/mobile light/dark browser checks pass; desktop/mobile light captures inspected. Refreshed edition/navigation screenshots and discarded unrelated rendering noise. Commit/push and four-service restart follow. No handbook system-flow change, provider calls or spend. VM remains private; scheduled phase acceptance waits for 15:00 UTC.

## 2026-11-08: iteration 1304 — return directly to saved stories and posts

- Clean main/no leftover work. Alerts/health pass; all 36 sources have no current error. Digest-generation has zero failed jobs and next run 15:00 UTC; hourly metrics probe not due until ≥06:22 UTC.
- Reader weakness under item 50 phase 2: View edition opened at the top, making readers find their saved item again. Links now jump to the actual story or post; posts have stable anchors and clearance below fixed navigation. The owner can return directly to the bookmarked content.
- Extended `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` to follow historical story/post links and assert the destination is in view, preserving original link, copy, persistence, removal and cross-tab checks. All four combinations pass (mobile dark completed in a focused run after the full browser process terminated). Eight focused screenshots added; desktop light/mobile light and dark inspected; unrelated rendering noise discarded.
- Verification: `pnpm build`, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime` and `git diff --check`. Initial browser attempt preceded build completion and rejected the old link; rebuilt browser checks pass. Handbook updated for direct item navigation. The combined format/lint/check command was terminated during unit tests; reran `pnpm check` separately: all checks pass, 625 unit and 233 integration tests pass, four expected skips.
- Commit/push and four-service restart follow passing checks. No provider calls or spend; VM remains private. Scheduled acceptance remains due at 15:00 UTC.

## 2026-11-08: iteration 1305 — date context for saved items

- Clean main/no leftover work. Alerts/health pass; digest-generation has zero failed jobs and next run 15:00 UTC. Hourly metrics probe not due until ≥06:22 UTC at orientation.
- Reader weakness under item 50 phase 2: Saved items had no visible date context. Each saved story/post now shows its saved date in the reader's locale, using the existing bookmark timestamp and semantic time markup; readers can distinguish older saves from recent ones.
- Verification: `pnpm build`, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` and `git diff --check`. Browser assertions cover a valid visible timestamp on every saved card, alongside existing persistence, cross-tab, removal and historical destination checks. Refreshed four saved-page screenshots; desktop/mobile inspected. Unrelated screenshot rendering noise discarded.
- The combined format/lint/check process was terminated after 625 unit passes, as integration started; reran `pnpm check` separately: all checks pass, 625 unit/233 integration passes and four expected skips. No backend/data-flow or handbook change, provider calls or spend. VM remains private; phase 0/2 scheduled acceptance still waits for 15:00 UTC. Commit/push and four-service restart follow passing verification.

## 2026-11-08: iteration 1306 — recover saved items from invalid dates

- Clean main/no leftover work. Alerts/health pass, all 36 sources healthy, no failed digest jobs; next scheduled run 15:00 UTC. Published reader serves four topics, 20 stories and 18 posts.
- Found a phase-2 reader crash: the browser-store parser accepted safe integers beyond JavaScript's date range, then Saved items' new date display threw. Reproduced acceptance in a failing regression; bounded timestamps to valid dates and guarded monotonic bookmark updates. Invalid records are ignored while valid saves survive.
- `pnpm exec tsx --test apps/api/test/reader-preference-store.test.ts`: initial five passes/one failure; fixed six passes. `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` passes desktop/mobile light/dark, including an injected invalid-date record, retained valid cards and no browser errors. Four recovery screenshots added; desktop light/mobile dark inspected; unrelated screenshot noise discarded.
- Verification: `pnpm build`, `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check`. All checks pass: 626 unit tests and 233 integration passes, four expected skips. Commit/push and four-service restart follow passing verification. No backend/data-flow or handbook change, provider calls or spend. VM stays private; scheduled phase acceptance still waits for 15:00 UTC.
- Due hourly `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` passes: 23 healthy rules, four uncached queries ≤0.090 s, zero new evaluator errors/misses, one small merge/3,494 rows, no big merges; admission hits 2, zero timeouts/slow queries. Comparable compaction remains unobserved; next check ≥07:23 UTC.

## 2026-11-08: iteration 1307 — consistent simultaneous bookmark changes

- Clean main/no leftover work. Alerts and health pass; all 36 sources have no current error. No failed digest jobs; next scheduled publication 15:00 UTC. Reader serves four topics, 20 stories and 18 posts. Hourly metrics check is not due until ≥07:23 UTC.
- Found phase-2 preference merges resolve equal timestamps by argument order: two tabs can disagree and a tied stale save can resurrect a removal. Added deterministic tie resolution: removal wins bookmark ties; competing display copies and topic choices also converge. A later explicit save still wins.
- Regression first reproduced the failure (six passes/one failure), then all seven preference-store tests passed. Full checks, build and browser verification recorded below before commit. No provider calls/spend, system-flow change or public-access change; scheduled acceptance remains pending at 15:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and all four desktop/mobile light/dark variants of `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` pass. Existing cross-tab save/removal/persistence and destination checks pass; discarded unrelated screenshot rendering noise because no visual change was made. `pnpm check` passes: 627 unit and 233 integration passes, four expected skips. `git diff --check` passes. Commit/push and four-service restart follow passing verification.

## 2026-11-08: iteration 1308 — retain concurrent saves after reload

- Clean main/no leftover work. Alerts/health pass; all 36 sources have no current error and digest-generation has zero failed jobs. Next scheduled publication remains 15:00 UTC; hourly metrics probe not due until ≥07:23 UTC.
- Reproduced a phase-2 reader weakness: a concurrent stale tab write leaves the saved card visible in another tab, but storage has zero bookmarks, so reload loses it. Storage-event merges now persist the union, retain independent topic changes and settle without repeated cross-tab writes. A synchronous ref also keeps event handlers on the latest merged state.
- New `pnpm exec tsx scripts/smoke-reader-preference-race.ts`: failed before fix (expected one stored bookmark, got zero); passes desktop/mobile light/dark after build. Uses actual published content, GET-only app traffic and blocked external requests. Four recovery screenshots added; desktop light/mobile dark inspected.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` pass. Existing `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` and `pnpm exec tsx scripts/smoke-reader-preferences.ts` pass all four desktop/mobile light/dark variants, including removals, historical editions, blocked storage and cross-tab choices. Discarded unrelated screenshot rendering noise. `pnpm check` passes: 627 unit and 233 integration passes, four expected skips.
- No provider calls/spend, backend/data-flow change or public-access change. VM stays private; phase 0/2 scheduled acceptance still waits for 15:00 UTC. Commit/push and four-service restart follow passing checks.

## 2026-11-08: iteration 1309 — warn when saved preferences cannot be read

- Clean main/no leftover work. Alerts/health pass; published reader serves four topics, 20 stories and 18 posts. Metrics probe remains due ≥07:23 UTC; scheduled acceptance waits for 15:00 UTC.
- Fixed a phase-2 reader weakness: opening Saved items when browser storage reads are blocked silently showed an empty list. Initial read failure now displays the existing storage warning immediately; failed storage-event reads preserve current choices without attempting a repair write.
- Extended `pnpm exec tsx scripts/smoke-reader-preferences.ts`: new direct Saved-page blocked-read assertion failed against deployed code, then passes after build in desktop/mobile light/dark. Four warning screenshots added; desktop light/mobile dark inspected. Discarded unrelated screenshot rendering noise.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check` and `git diff --check` pass: 627 unit and 233 integration passes, four expected skips. `pnpm exec tsx scripts/smoke-reader-preference-race.ts` passes all four device/theme combinations; concurrent saves still survive reload and storage settles.
- No provider calls/spend, backend/data-flow change or public-access change; VM remains private. Commit/push and four-service restart follow passing checks. Next: hourly metrics probe ≥07:23 UTC and scheduled phase-0/2 acceptance at 15:00 UTC.

## 2026-11-08: iteration 1310 — connect archive and saved-item navigation

- Clean main/no leftover work. Alerts/health pass, all 36 sources healthy, zero failed digest jobs; next scheduled publication 15:00 UTC. Metrics probe not due until ≥07:23 UTC.
- Reader-visible weakness: Past editions and Saved items required a detour through the latest edition to reach each other. Added direct header links with labelled navigation, visible keyboard focus and 44px touch targets; readers can browse history and their saves directly.
- `pnpm build` passes after correcting the archive link's required page parameter. `pnpm exec tsx scripts/smoke-reader-navigation.ts` passes desktop/mobile light/dark with actual published history, keyboard activation, no overflow/errors/writes; corrected smoke URL expectation to accept the valid page query. Eight screenshots added; desktop light archive/mobile dark saved inspected.
- `pnpm format`, `pnpm lint:fix`, targeted smoke-script ESLint and `git diff --check` pass. No provider calls/spend, backend/data-flow change or public-access change; VM remains private. Scheduled phase-0/2 acceptance waits for 15:00 UTC. Commit/push and four-service restart follow passing verification.
- Existing `pnpm exec tsx scripts/smoke-reader-archive.ts` passes all four viewport/theme variants after fixing its old assumption that page 3 must contain published entries; recovery now accepts an empty page. Updated four archive screenshots and discarded unrelated date-switcher screenshot noise. First full-check process ended with signal 15 before finishing; clean full-check rerun passes: 627 unit and 233 integration passes, four expected skips.
