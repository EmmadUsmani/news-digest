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

Earlier entries: [iterations 1292–1301](docs/progress-archive/2026-11-08-iterations-1292-1301.md).

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
