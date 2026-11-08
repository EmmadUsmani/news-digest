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

## 2026-11-08: iteration 1316 — make archive pagination easier to use

- Clean main/no leftover work. Alerts, `/healthz`, `pnpm obs services --check`, `sources --check` and `jobs --check` pass; 36 healthy sources and active collection. Scheduled acceptance waits for 15:00 UTC; passive metrics probe not due until ≥08:24 UTC.
- Owner-visible value: archive pagination links were only text-height touch targets. They now meet the reader's 44-pixel minimum and show an explicit keyboard focus outline; edition cards also gain explicit focus outlines.
- Read all four published topics (20 stories/18 posts); Tech evidence depth and the historical Davis cutoff already have documented causes/future-publication work, so no duplicate editorial tuning or paid calls.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-archive-focus.ts` pass. Desktop/mobile light/dark checks verify target dimensions, keyboard outlines, delayed pagination, heading focus and resumed date navigation, with GET-only saved-data replay. Eight focused pagination screenshots added; mobile dark inspected. Discarded duplicate generated page screenshots.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 629 unit and 233 integration passes, four expected skips. Desktop light screenshot also inspected. Commit/push and four-service restart follow passing checks. No provider spend, backend/data-flow change or public-access change; VM remains private.

## 2026-11-08: iteration 1317 — make article coverage easier to open

- Clean main/no leftover work. `pnpm obs alerts`, `services --check`, `sources --check`, `jobs --check` and `/healthz` pass; 36 healthy sources, no failed digest-generation jobs. Acceptance waits for 15:00 UTC; metrics probe remains due ≥08:24 UTC.
- Read the latest published edition: thin Tech evidence and the historical Davis cutoff already have documented causes/future-publication work. No duplicate editorial tuning or provider calls.
- Owner-visible value: readers can more easily open the supplied reporting behind a story on a phone. Article-coverage disclosures now have 44-pixel minimum targets and explicit keyboard focus outlines.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-coverage-target.ts` pass desktop/mobile light/dark against actual published coverage, GET-only with external requests blocked. Checks cover target size, keyboard outline, Enter/Space opening/closing, visible reports, no overflow or browser errors. Four screenshots added; mobile dark inspected.
- Initial smoke script used unsupported top-level await; wrapped it in an async function before the successful run. No backend/data-flow or public-access change; VM remains private, no provider spend.
- Final `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 629 unit and 233 integration passes, four expected skips. Desktop light screenshot also inspected. Commit/push and four-service restart follow passing checks. Next: metrics probe ≥08:24 UTC; scheduled acceptance at 15:00 UTC.

## 2026-11-08: iteration 1318 — fit topic chooser to narrow viewports

- Clean main/no leftovers. Alerts, services, sources, jobs and `/healthz` pass; 36 healthy sources. Metrics probe not due until ≥08:24 UTC; scheduled acceptance waits for 15:00 UTC.
- Read all four published topics (20 stories/18 posts): thin Tech evidence and historical Davis cutoff already have documented causes and deployed future-publication fixes; no new editorial tuning.
- Owner-visible value: topic choices and the close button remain reachable on narrow/zoomed screens. Shared drawer now respects viewport width and reserves title space for its close button.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-narrow-topics.ts` pass: 240/320/1440px, light/dark, actual four published topics, persisted hide/show, Escape/Enter close, focus return, no drawer overflow/browser errors. Six screenshots added; 240px dark inspected. GET-only local traffic; no provider spend.
- Initial browser run overlapped the build and saw the old drawer; rerun after build completion passes all six variants. No public-access or backend/data-flow change; VM remains private.
- Final `pnpm format`, `pnpm lint:fix`, `git diff --check` and standalone `pnpm check` pass: 629 unit and 233 integration passes, four expected skips. First combined check process received signal 15 during format verification; fresh complete check passed. Commit/push and four-service restart follow verified checks. Next: passive metrics probe ≥08:24 UTC and scheduled acceptance at 15:00 UTC.

## 2026-11-08: iteration 1319 — readable mobile contents

- Clean main/no leftovers. Alerts, services, sources, jobs and `/healthz` pass; 36 healthy sources. Metrics probe remains due ≥08:24 UTC; scheduled acceptance at 15:00 UTC.
- Owner-visible value: mobile contents previously clipped story titles. Full titles now wrap, links have 44px minimum targets and keyboard focus outlines. Desktop keeps compact titles.
- Browser checks exposed existing reader-header overflow at 320px (351px content width). Reduced control gaps and allowed the brand to shrink, keeping controls reachable.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-contents-titles.ts` pass at 320/390px light/dark: actual published title wrapping, targets, keyboard activation/focus transfer, no page overflow/errors. Four screenshots saved; 320px dark inspected.
- Initial 240/320px checks failed the page-overflow assertion; diagnosed header controls and fixed the cause before four successful checks. GET-only local traffic; external requests blocked, no provider spend.
- Latest edition still has the previously diagnosed thin Tech reporting and historical Davis cutoff; no duplicate editorial tuning. Archived older progress entries to keep this file small.
- Final `pnpm format`, `pnpm lint:fix`, `git diff --check` and standalone `pnpm check` pass: 629 unit, 233 integration passes/four expected skips. Combined initial check received signal 15 during unit tests; full standalone rerun passed. Header also checked at 320/390/1440px: no overflow (brand shortens at 320px).
- Latest published edition retains four topics/20 stories/18 posts. Commit/push and four-service restart follow passing verification; no public-access or backend/data-flow change. Next: metrics probe ≥08:24 UTC; scheduled acceptance at 15:00 UTC.
