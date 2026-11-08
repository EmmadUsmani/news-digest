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

## 2026-11-08: iteration 1320 — readable desktop contents

- Clean main/no leftover work. Alerts, services, sources, jobs and `/healthz` pass; 36 healthy sources. Scheduled phase-0/phase-2 acceptance waits until 15:00 UTC; metrics probe due ≥08:24 UTC.
- Reader weakness: desktop Contents clipped published titles, hiding distinguishing details (including the Anthropic IPO headline). Full titles now wrap, with explicit keyboard focus outlines, matching the mobile improvement.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-desktop-contents-titles.ts` pass at 1024/1440px light/dark against actual published content; full title wrapping, keyboard focus/activation and no overflow/browser errors. Four screenshots saved; 1024px dark inspected.
- Latest published edition retains four topics/20 stories/18 posts. Thin Tech evidence and the historical Davis cutoff already have documented causes and deployed future-publication changes; no further editorial tuning or provider spend.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` and standalone `pnpm check` pass: 629 unit/233 integration passes, four expected skips. Initial full check received signal 15 during unit tests; complete standalone rerun passed. Mobile regression smoke also passes all four variants. Commit/push and four-service restart follow passing checks; VM stays private. Next: passive metrics probe ≥08:24 UTC; scheduled acceptance at 15:00 UTC.

## 2026-11-08: iteration 1321 — hourly metrics trial evidence

- Clean main/no leftovers. Due passive check: `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` passed at 08:24:11–08:24:41 UTC.
- All 23 rules healthy; four uncached queries ≤0.576 s; zero new evaluator errors/missed runs. One small merge/16,188 rows, zero big merges; comparable five-million-row compaction still unobserved. Admission-limit hits 2, queue timeouts/slow queries 0.
- `pnpm obs alerts`, `services --check`, `sources --check`, `jobs --check` pass: zero alerts, 14 services and 36 sources healthy; latest free-social collection verified 10 posts without errors. Scheduled edition remains queued for 15:00 UTC.
- App `/healthz` and Grafana `:3001/grafana/api/health` pass. Initial Grafana check used the wrong port 3000; corrected to documented 3001. Metrics process has zero restarts since Nov 7 16:00:24 UTC.
- Updated recovery handoff only; no code, provider calls, limits or edition-generation changes. Next passive check ≥09:25 UTC; scheduled phase-0/phase-2 acceptance at 15:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 629 unit, 233 integration, four expected skips. Documentation-only commit; existing runtime build retained; normal four-service restart follows push.

## 2026-11-08: iteration 1322 — easier report links in expanded coverage

- Clean main/no leftovers. `pnpm obs alerts`, `services --check`, `sources --check`, `jobs --check` pass: no active alerts, 14 services and 36 sources healthy; scheduled edition queued for 15:00 UTC. Metrics next due ≥09:25 UTC, not sampled early.
- Read published edition: thin Tech reporting and historical Davis cutoff already have documented causes/future fixes. Reader-visible improvement: expanded coverage report titles now have 44px minimum touch targets and explicit keyboard focus, making original reports easier to open.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-coverage-labels.ts` pass: all 20 published story coverage controls, report destinations, touch targets, focus outlines and layout in desktop/mobile light/dark. Four screenshots refreshed; mobile dark inspected. GET-only traffic, external requests blocked, no provider spend.
- Latest reader endpoint returns four topics, 20 stories and 18 posts; `/healthz` passes. No data-flow or public-access change; VM stays private.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 629 unit and 233 integration passes, four expected skips. Normal four-service restart follows commit/push. Next: metrics probe ≥09:25 UTC and scheduled phase-0/phase-2 acceptance at 15:00 UTC.

## 2026-11-08: iteration 1323 — accessible saved headlines

- Clean main/no leftover work. Alerts, services, sources and jobs pass: no active alerts, 14 services/36 sources healthy; `/healthz` passes. Scheduled acceptance waits until 15:00 UTC; metrics next due ≥09:25 UTC.
- Owner-visible weakness: saved-item headline links lacked the touch-target sizing and clear focus treatment used by adjacent controls. Headlines now occupy at least 44px height and show an explicit keyboard outline.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-saved-excerpt.ts` pass in desktop/mobile light/dark: published headline destination, flex layout, 44px target and keyboard focus verified; existing explicitly offline long-excerpt/reload checks retained. Four published-content screenshots saved; mobile dark inspected.
- GET/HEAD-only browser traffic, external requests blocked; no provider spend. Existing thin Tech evidence and historical cutoff causes already have deployed changes awaiting publication; no editorial retuning.
- Final `pnpm check` passes: 629 unit/233 integration passes, four expected skips. Initial combined run received signal 15; first standalone rerun caught newly archived progress formatting, corrected with Prettier before the successful full run. `pnpm format`, `pnpm lint:fix` and `git diff --check` pass; older progress archived to keep orientation small.
- Reader latest endpoint retains four topics/20 stories/18 posts. Commit/push and normal four-service restart follow passing checks; VM stays private. Next: metrics probe ≥09:25 UTC; scheduled phase-0/phase-2 acceptance at 15:00 UTC.

## 2026-11-08: iteration 1324 — easier return to the edition

- Clean main/no leftovers. Alerts, services, sources and jobs healthy; `/healthz` passes. Metrics probe not due until ≥09:25 UTC; scheduled acceptance remains 15:00 UTC.
- Read latest published content: thin Tech evidence, NBA fallback/cutoff and repeated posts already have documented causes or deployed changes awaiting publication; no new editorial tuning or spend.
- Reader-visible gap: News Digest home links in Saved items and Past editions had small hit areas and lacked explicit keyboard focus. Both now offer 44px targets and clear outlines, making return to the edition easier.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-home-links.ts` pass: both routes, desktop/mobile light/dark, target dimensions, keyboard outline/activation, no horizontal overflow or browser errors. Eight screenshots saved; mobile dark archive inspected.
- Initial smoke script used unsupported top-level await; wrapped its entry point and reran successfully. Browser requests limited to GET/HEAD and external traffic blocked; no provider spend.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 629 unit/233 integration passes, four expected skips. Normal four-service restart follows push. VM stays private; no publication or data-flow changes.

## 2026-11-08: iteration 1325 — easier edition date navigation

- Clean main/no leftovers. Alerts, services, sources and jobs checks pass; no active alerts or stalled sources. Scheduled acceptance remains 15:00 UTC; next metrics probe ≥09:25 UTC, not sampled early.
- Published reader retains four topics/20 stories/18 posts. Known thin reporting and historical selection issues already have documented causes or deployed changes awaiting publication; no editorial retuning.
- Reader-visible weakness: edition navigation arrows had 28×36px targets. Arrows now offer 44×44px targets; the archive date link is also 44px tall, with explicit keyboard focus on all date links.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-date-targets.ts` pass: published older/newer edition and archive navigation, target sizes, focus outlines, no overflow or browser errors at 1440/390/320px in light/dark. Six screenshots saved; 320px dark inspected.
- Browser traffic GET/HEAD-only with external requests blocked; no provider spend. No data flow or public access change; VM stays private.
- Final verification: `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 629 unit/233 integration passes, four expected skips. Normal four-service restart follows commit/push.

## 2026-11-08: iteration 1326 — respect browser storage resets

- Clean main/no leftovers. Alerts, 14 services, 36 sources, jobs and `/healthz` healthy. Scheduled acceptance waits for 15:00 UTC; passive metrics check remains due ≥09:25 UTC.
- Read latest published story data and phase-2 preferences. Reader-visible cause reproduced: clearing the preference key in one tab caused another tab to merge and persist its old saved story/hidden topic, undoing the reset.
- Storage-event handling now discards in-memory choices when current storage is absent; reads current storage first so queued reset events cannot discard a newer stored write. Ordinary entry removals retain tombstone merging.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-storage-reset.ts` pass: actual published story, separate reader/saved/control tabs, key deletion and site-storage clear, restored topic, empty saved list, absent storage key and reload in desktop/mobile light/dark. Original smoke failed before the fix.
- Four reset screenshots saved; mobile dark inspected. Browser-only local preference writes; network GET/HEAD-only, external requests blocked, no provider spend. Handbook explains resets across tabs.
- Existing `smoke-reader-preferences.ts` and `smoke-reader-bookmarks.ts` pass in desktop/mobile light/dark, including cross-tab saves/removals, tombstones, historical destinations, corrupt/blocked storage and reloads. `check-handbook.ts 01-app/README` passes (18 pages/30 tables).
- Initial lint/full-check stopped at a setter declaration-order error in the new reset branch; moved its state declaration above the effect. Final build and reset smoke pass again.
- Final `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 629 unit/233 integration passes, four expected skips. Normal four-service restart follows commit/push; VM stays private. Next: metrics ≥09:25 UTC, scheduled acceptance 15:00 UTC.

## 2026-11-08: iteration 1327 — easier source attribution links

- Clean main/no leftovers. No active alerts; `/healthz`, 14 services and 36 sources healthy. Jobs check passes; two retained ingestion failures have no matching recent runs/current source errors. Scheduled acceptance remains 15:00 UTC; metrics probe not yet due (≥09:25 UTC).
- Reader-visible weakness: publisher/discovery links had small text-sized targets and no explicit focus outline. Both story attribution and expanded coverage attribution now have 44px targets and visible keyboard focus; readers can open the reporting more easily.
- Published latest data retains four topics/20 stories/18 posts. Known evidence-depth/selection changes await the scheduled edition; no editorial tuning or provider spend.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-source-targets.ts` pass against published content at 1440/390/320px in light/dark: link dimensions, keyboard focus, no overflow or browser errors. Six screenshots saved; 320px dark inspected. Browser traffic GET/HEAD-only, external requests blocked.
- Archived iterations 1311–1316 to keep PROGRESS.md under 25 KB. Initial unsupported `obs status` and filtered `jobs --check` invocations corrected to documented commands; health checks pass.
- Final `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 629 unit/233 integration passes, four expected skips. Commit/push and normal API/worker/docs/schema restart follow; no publication or data-flow changes. VM remains private.

## 2026-11-08: iteration 1328 — easier mobile topic navigation

- Clean main/no leftovers. Alerts empty; 14 services, 36 sources, jobs and `/healthz` healthy. Metrics probe not yet due (≥09:25 UTC); scheduled acceptance remains 15:00 UTC.
- Read latest published titles across all four topics (20 stories/18 posts). Known evidence-depth/selection fixes await scheduled publication; no new editorial tuning or provider calls.
- Reader-visible weakness: mobile topic chips had short tap targets and no explicit keyboard outline. Chips now have 44px targets and inset focus outlines that remain inside the horizontal scrolling row; the owner can navigate topics more easily by touch or keyboard.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-topic-targets.ts` pass: actual published four-topic keyboard navigation, target dimensions, focus, active-chip reveal and no page overflow/errors at 390/320px in light/dark. Four screenshots saved; 320px dark inspected.
- Initial smoke raced smooth scrolling while tabbing between chips; deterministic keyboard/geometry verification uses reduced motion and waits for fonts. Browser requests GET/HEAD-only, external traffic blocked; no provider spend or publication/data-flow change.
- Final `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 629 unit/233 integration passes, four expected skips. Commit/push and normal API/worker/docs/schema restart follow; VM stays private. Next iteration: metrics probe now due, scheduled acceptance at 15:00 UTC.

## 2026-11-08: iteration 1329 — easier topic-panel controls

- Clean main/no leftovers. Alerts empty; 14 services, 36 sources, jobs and `/healthz` healthy. Scheduled acceptance remains 15:00 UTC.
- Due passive metrics probe (`sample-metrics-recovery.ts 1 30`): 23 healthy rules, four uncached queries ≤0.103 s, zero new evaluator errors/misses; one small merge/1,436 rows, no big merges. Admission hits 2, no queue timeouts/slow queries, zero restarts. Comparable compaction still unobserved; next check ≥10:26 UTC.
- Reader weakness: Topics trigger and sheet close button were only 36px high. Both now have 44px targets; sheet title reserves room for the larger close button. Shared sheet close sizing also benefits mobile contents and admin menus.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-topic-panel-targets.ts` pass: published four-topic choices, hiding/restoration, persistence, focus return, target dimensions and no overflow/errors at 1440/390/320px in both themes. Six screenshots saved; narrow dark inspected.
- Browser traffic GET/HEAD-only with external requests blocked; local preference writes only. No provider spend, publication or data-flow change.
- Existing `smoke-reader-preferences.ts` and `smoke-reader-contents-titles.ts` pass: cross-tab/reload/history/all-hidden recovery, blocked/corrupt storage and narrow-screen contents keyboard destinations. Refreshed their screenshots for the shared sheet change.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 629 unit/233 integration passes, four expected skips. Latest published reader retains 20 stories/18 posts across four topics. Normal four-service restart follows commit/push; VM stays private.

## 2026-11-08: iteration 1330 — easier primary story links

- Clean main/no leftovers. Alerts empty; 14 services, 36 sources and `/healthz` healthy. `pnpm obs jobs --check` passes; retained ingestion/social failures have no matching recent failed runs. Next scheduled edition remains 15:00 UTC; hourly metrics check not due until ≥10:26 UTC.
- Reader weakness: primary story headlines had text-sized targets and no explicit focus outline. The owner can now open reporting with a 44px target and visible keyboard focus; this completes the story-link treatment already applied to expanded coverage.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-headline-targets.ts` pass at 1440/390/320px in light/dark: all 20 published titles and destinations retained, target dimensions, keyboard focus and no overflow/browser errors. Six screenshots saved; narrow dark inspected.
- Latest published reader retains four topics/20 stories/18 posts. Browser traffic GET/HEAD-only, external requests blocked; no provider calls or spend, publication or data-flow changes. Known content-quality fixes await scheduled acceptance; no new editorial tuning.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 629 unit/233 integration passes, four expected skips. Normal API/worker/docs/schema restart follows commit/push; VM remains private.
- Next: passive metrics check ≥10:26 UTC, scheduled phase-0/phase-2 and keyword/Bluesky acceptance plus first-week report at 15:00 UTC. No phase acknowledgment before scheduled acceptance.

## 2026-11-08: iteration 1331 — easier post context expansion

- Clean main/no leftovers. Alerts empty; `pnpm obs health`, `services --check`, `sources --check` and `jobs --check` pass: 14 services/36 sources healthy, scheduled edition due 15:00 UTC. Metrics probe not due until ≥10:26 UTC.
- Read latest published titles across four topics; known evidence-depth/selection fixes await scheduled acceptance. Reader-visible weakness: post context notes had text-height tap targets, making explanations hard to open on phones. Their summaries now provide 44px targets with padding and retain visible keyboard focus.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-context-targets.ts` pass: all four published notes retain their wording, touch/keyboard expansion, focus and no overflow/errors at 1440/390/320px in both themes. Six screenshots saved; 320px dark inspected.
- `pnpm exec tsx scripts/smoke-reader-post-context.ts` passes long synthetic-note touch/keyboard expansion; four replay screenshots refreshed. Initial new smoke lacked touch emulation; corrected `hasTouch` before successful rerun.
- Browser requests GET/HEAD-only, external traffic blocked; no provider calls/spend or publication/data-flow changes. VM remains private; no phase acknowledgment before scheduled acceptance.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 629 unit/233 integration passes, four expected skips. Normal API/worker/docs/schema restart follows commit/push; next metrics probe ≥10:26 UTC and scheduled acceptance at 15:00 UTC.
