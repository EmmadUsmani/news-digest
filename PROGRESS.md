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

## 2026-11-08: iteration 1311 — recover saved destinations in hidden topics

- Clean main/no leftover work. Alerts/health pass; 36 sources have no current error and no failed digest-generation jobs. Published reader has four topics, 20 stories and 18 posts. Scheduled acceptance waits for 15:00 UTC; metrics probe is not due until ≥07:23 UTC.
- Reader-visible weakness: View edition on a saved item can lead to an absent destination when its topic is hidden. The reader now explains the hidden topic and offers an explicit Show topic action; it restores that preference, scrolls to the requested story/post and places keyboard focus there.
- New `pnpm exec tsx scripts/smoke-reader-hidden-destination.ts` reproduced the missing recovery action before the fix and passes desktop/mobile light/dark afterward, including persistence, focus, 44px controls and overflow. Fixed partial router decoding of post anchors found during verification. Four screenshots added; desktop light/mobile dark inspected. Uses actual published content with GET-only traffic and blocked external requests.
- `pnpm build`, subsequent web build/typecheck, `pnpm check` and `git diff --check` pass: 627 unit and 233 integration passes, four expected skips. Existing bookmark smoke initially timed out removing a historical saved post; rerun results recorded below. No provider calls/spend, backend/data-flow change or public-access change; VM stays private.
- Existing `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` rerun passes all four viewport/theme combinations, including historical story/post destinations and removals. Discarded unrelated screenshot rendering noise. Final `pnpm format`/`pnpm lint:fix` run before commit; commit/push and four-service restart follow passing verification.

## 2026-11-08: iteration 1312 — preserve unseen saves during storage read failures

- Clean main/no leftover work; initial alerts and `/healthz` pass. Scheduled phase-0/2 acceptance still waits for 15:00 UTC; hourly metrics probe remains due ≥07:23 UTC.
- Found a reader data-loss path: topic/bookmark changes merged an empty fallback after a failed localStorage read, then overwrote unseen saves if writes still worked. Both actions now keep changes in memory and retain the storage warning; the next successful read merges stored saves and pending choices before writing.
- New `pnpm exec tsx scripts/smoke-reader-storage-preservation.ts` passes desktop/mobile light/dark: blocked reads with working writes leave storage byte-for-byte unchanged, and recovery preserves an offline fixture save plus a real published story and topic choices. GET-only app traffic, external requests blocked; fixture is explicitly labelled offline. Four screenshots added; desktop light/mobile dark inspected.
- `pnpm build` and subsequent web build pass. Existing `pnpm exec tsx scripts/smoke-reader-preference-race.ts` passes all four variants; discarded unrelated screenshot rendering noise. Initial smoke harness needed a string init script to avoid transpiler helpers, then its alert selector needed scoping; corrected harness passes.
- Full check initially caught an unbound-method lint issue in the smoke harness; fixed by using the browser script string. Final verification and deployment results follow below. No provider calls/spend or public-access change; VM remains private.
- Existing `pnpm exec tsx scripts/smoke-reader-preferences.ts` passes desktop/mobile light/dark; discarded unrelated screenshot noise. `pnpm format`, `pnpm lint:fix` and `git diff --check` pass. Full check passed 627 unit tests then ended with signal 15 during integration tests; clean full-check rerun passes: 627 unit and 233 integration passes, four expected skips. Live reader: four topics/20 stories/18 posts; all 36 sources have no current error, digest queue has zero failed jobs, alerts clear.
- Final `pnpm exec prettier --check TASKS.md PROGRESS.md scripts/smoke-reader-storage-preservation.ts apps/web/src/use-reader-preferences.ts` and `git diff --check` pass. Commit/push and four-service restart follow passing verification; next scheduled acceptance 15:00 UTC, next passive metrics probe ≥07:23 UTC.

## 2026-11-08: iteration 1313 — clear recovered browser-storage warnings

- Clean main/no leftover work. Initial alerts, `/healthz`, `pnpm obs services --check`, `sources --check` and `jobs --check` pass; scheduled phase-0/2 acceptance still waits for 15:00 UTC.
- Reproduced a stale warning after a failed storage-event read followed by a successful identical read: the hook cleared the warning only when it wrote a merged repair. It now clears the warning when storage already contains every current choice.
- Extended `pnpm exec tsx scripts/smoke-reader-storage-preservation.ts`: new recovery assertion fails before the fix, then passes desktop/mobile light/dark. Existing blocked-read preservation and pending-save merge assertions still pass. Four recovery screenshots added; mobile dark inspected. Discarded unrelated screenshot rendering noise.
- `pnpm build` passes; `pnpm exec tsx scripts/smoke-reader-preference-race.ts` passes all four combinations with stable storage and saves surviving reload. No provider calls/spend, generation/data-flow change or public-access change; VM remains private.
- Hourly `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` at 07:23:11–07:23:41 UTC: 23 healthy rules, four uncached queries ≤0.180 s; zero new evaluator errors/missed runs; two small merges/5,061 rows, no big merges. Admission hits 2, queue timeouts/slow queries 0; metrics service zero restarts. Comparable compaction still unobserved; next probe ≥08:24 UTC.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` pass. First `pnpm check` process ended with signal 15 during unit tests; clean full rerun passes: 627 unit and 233 integration passes, four expected skips. Live reader retains four topics/20 stories/18 posts. Desktop light recovery screenshot also inspected. Commit/push and four-service restart follow passing checks.

## 2026-11-08: iteration 1314 — retain concurrent saves at browser capacity

- Clean main/no leftover work. Alerts, `/healthz`, `pnpm obs services --check`, `sources --check` and `jobs --check` pass; all 36 sources healthy, no failed digest-generation jobs. Scheduled acceptance waits for 15:00 UTC; metrics probe not due until ≥08:24 UTC.
- Owner-visible value: saves must not disappear on reload after two browser tabs each save their final available item. Found parsing silently discarded records beyond 1,000 even though cross-tab merges could validly exceed that count. Reads now preserve the complete validated union; new identities remain blocked at capacity, and removals/re-saves still work.
- Read the current published edition; the NBA Davis excerpt cutoff already has a deployed future-snapshot fix (1222), so no duplicate generation change. Historical Nov 7 content stays immutable.
- Added a regression covering concurrent saves, reload, capacity refusal and durable removal; it failed before the fix and passes afterward (8 preference-store tests). `pnpm build` passes.
- New `pnpm exec tsx scripts/smoke-reader-preference-capacity.ts` passes desktop/mobile light/dark with an actual published story and explicitly synthetic removal records: 1,001-entry merge survives reload and storage events settle. Four screenshots added; mobile dark inspected. Initial browser run started before the new build finished and reproduced the missing save; post-build rerun passes.
- No provider calls/spend, backend/data-flow change or public-access change; VM remains private. Full verification and deployment results follow below.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` pass. First full-check process ended with signal 15 during unit tests; clean `pnpm check` rerun passes: 628 unit and 233 integration passes, four expected skips. Existing `smoke-reader-preference-race.ts` passes all four variants; discarded unrelated screenshot rendering noise. Desktop light capacity screenshot also inspected. Commit/push and four-service restart follow passing checks.

## 2026-11-08: iteration 1315 — mark shortened saved-item prose

- Clean main/no leftover work; alerts, health, services, sources and jobs checks pass. All 36 sources healthy; scheduled acceptance waits for 15:00 UTC and metrics probe remains due ≥08:24 UTC.
- Owner-visible value: long bookmark titles/excerpts should show an omission rather than silently ending mid-word. Bounded display copies now end with an ellipsis, prefer word boundaries and avoid a dangling UTF-16 surrogate; URLs/edition identities retain their validation.
- Read all four published topics (20 stories/18 posts). The actual Davis summary is already exactly 600 characters in the immutable snapshot: its future-snapshot fix is deployed (1222), and this change does not repair that historical source cutoff. No new editorial tuning or provider calls.
- Nine preference-store tests pass, covering bounds, reload idempotence, word boundaries, unchanged short copy and emoji. First new assertion incorrectly demanded a sentence boundary; corrected it to test the intended word boundary.
- `pnpm build` passes. `pnpm exec tsx scripts/smoke-reader-saved-excerpt.ts` passes desktop/mobile light/dark: explicitly labelled offline long-excerpt fixture, durable reload, no horizontal overflow/errors, then actual published short summary unchanged. GET-only traffic/external requests blocked. Four screenshots added; desktop light/mobile dark inspected.
- Initial smoke correctly rejected the assumption that a published summary exceeded 600 characters; replaced it with the labelled fixture. Initial full check caught import ordering while the new script was being edited; autofixed before clean rerun. Final verification and deployment results follow below.
- Final `pnpm format`, `pnpm lint:fix`, `git diff --check` and clean `pnpm check` pass: 629 unit and 233 integration passes, four expected skips. No provider spend or public-access change; VM remains private. Commit/push and four-service restart follow passing verification. Next: passive metrics probe ≥08:24 UTC; scheduled acceptance at 15:00 UTC.
