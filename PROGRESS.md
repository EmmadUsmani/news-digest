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

## 2026-11-08: iteration 1332 — easier X media recovery

- Clean main/no leftovers. Alerts empty; health/services/sources/jobs checks pass: 14 services/36 sources healthy. Metrics probe not due until ≥10:26 UTC; scheduled acceptance remains 15:00 UTC.
- Read the latest four-topic edition (20 stories/18 posts); known editorial fixes await scheduled evidence. Reader-visible weakness: failed X embeds exposed 32px recovery actions. Original-link and retry controls now have 44px targets and explicit keyboard focus; status takes its own row so actions fit on narrow phones.
- Owner benefit: opening the original or retrying unavailable X media is easier by touch and keyboard, advancing the existing reader under items 38/42 without new features.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-x-media.ts` pass: 1440/390/320px light/dark, target dimensions/focus, touch retry, saved text/context, resize/theme/replacement recovery and no overflow/errors/writes. Screenshots refreshed; narrow dark inspected. Recovery uses a labelled local widget stub; external requests blocked, no provider spend.
- Initial smoke raced the build and saw old target dimensions; rerun after build passed all six configurations.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 629 unit/233 integration passes, four expected skips; normal four-service restart follows push. VM stays private; no phase acknowledgment before scheduled acceptance.
- Next: metrics probe ≥10:26 UTC; 15:00 scheduled phase-0/phase-2, keyword/Bluesky acceptance and first-week report.

## 2026-11-08: iteration 1333 — easier saved X text expansion

- Clean main/no leftovers. Alerts empty; health/services/sources/jobs checks pass: 14 services/36 sources healthy. Metrics probe not due until ≥10:26 UTC; scheduled acceptance remains 15:00 UTC.
- Read latest published titles across four topics; known editorial fixes await scheduled evidence. Loaded X embeds still exposed a text-height saved-text disclosure. It now has a 44px target and explicit keyboard focus. Owner benefit: easier access to the saved transcript beside an embedded post on phones and by keyboard.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-x-media.ts` pass: 1440/390/320px light/dark, target dimensions/focus, touch collapse/keyboard expansion, text preservation, recovery/resize/theme behavior and no overflow/errors/writes. Six disclosure screenshots added; related screenshots refreshed; narrow dark inspected.
- Browser media uses a labelled local widget stub; external requests blocked, no provider spend or publication/data-flow changes. VM remains private; no phase acknowledgment before scheduled acceptance.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` pass. `pnpm check` passed typecheck/lint/format/boundaries and 629 unit tests, then received SIGTERM during integration (no assertion failure). Separate `pnpm test:integration` passes: 233 passed/four expected skips. Older progress archived to keep this file small. Normal four-service restart follows push.
- Next: metrics probe ≥10:26 UTC; 15:00 scheduled phase-0/phase-2, keyword/Bluesky acceptance and first-week report.

## 2026-11-08: iteration 1334 — easier post author and original links

- Clean main/no leftovers. Alerts empty; health/services/sources/jobs checks pass: 14 services/36 sources healthy. Metrics probe not due until ≥10:26 UTC; scheduled acceptance remains 15:00 UTC.
- Read latest published titles across all four topics; known evidence-depth/selection fixes await scheduled acceptance. X and Bluesky author/timestamp links still had text-height targets. They now provide 44px targets and explicit keyboard focus. Owner benefit: easier access to authors and original posts on phones and by keyboard.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-post-byline.ts` pass: 18 published posts at 1440/390/320px in both themes; target dimensions, destinations, keyboard focus, no overflow/page errors. Six screenshots saved; narrow dark inspected. Initial smoke counted before content loaded; added visibility wait and reran successfully.
- Extra `smoke-reader-x-links.ts` could not run: latest edition has no saved post matching its joined-prose/URL prerequisite; no product failure observed. Browser traffic GET/HEAD-only with external requests blocked; no provider calls/spend or publication changes.
- VM remains private; no phase acknowledgment before scheduled acceptance. Next: metrics probe ≥10:26 UTC; 15:00 phase-0/phase-2, keyword/Bluesky acceptance and first-week report.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 629 unit/233 integration passes, four expected skips. Normal API/worker/docs/schema restart follows commit/push.

## 2026-11-08: iteration 1335 — accessible Bluesky media recovery

- Clean main/no leftovers. Alerts empty; health, 14 services, 36 sources and jobs checks healthy. Metrics probe not due until ≥10:26 UTC; scheduled acceptance remains 15:00 UTC.
- Read latest published titles across all four topics and saved Bluesky posts. Known editorial fixes await scheduled evidence. Bluesky media links had no explicit keyboard focus and collapsed to a text-height target when images failed.
- Media links now retain a 44px target and visible keyboard focus. Owner benefit: easier image/video access by keyboard and easier failed-image recovery on phones; no new feature or editorial change.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-bluesky-image-recovery.ts` pass: 24 loaded/recovered/failed/same-URL cases at 1440/390/320px in both themes; dimensions, focus, destinations, recovery and no overflow/errors verified. Screenshots refreshed/added; narrow dark failure inspected.
- `pnpm exec tsx scripts/smoke-reader-bluesky-video.ts` passes loaded/failed/missing previews at desktop/mobile in both themes. Media variants are synthetic, based on a saved edition; GET-only browser traffic and external requests blocked, no provider spend.
- VM stays private; phase-0/phase-2 acceptance waits for the normal 15:00 scheduled publication. Next metrics probe ≥10:26 UTC, then daily acceptance and first-week report.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 629 unit/233 integration passes, four expected skips. Initial pipeline terminated during lint without diagnostic; standalone lint and full check rerun passed. Published byline smoke also passes all six viewports/themes. Normal four-service restart follows push.
