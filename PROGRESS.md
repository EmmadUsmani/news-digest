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

## 2026-11-08: iteration 1336 — easier contents and archive navigation

- Clean main/no leftovers. Alerts empty; health, 14 services, 36 sources and digest jobs healthy. An initial service snapshot caught the previous handbook restart; direct systemd status and refreshed snapshot confirm recovery.
- Read the four published topics (20 stories/18 posts). Known content fixes await scheduled acceptance. Reader Contents button and its archive link still had small tap targets; archive link lacked explicit keyboard focus. Both now have 44px targets and the link has visible focus, making the existing navigation easier on phones/by keyboard.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-contents-controls.ts` pass: 1440/390/320px, both themes, target sizes, keyboard focus, Escape/trigger focus return, archive navigation and no overflow/page errors. Six screenshots saved; 320px dark inspected.
- Browser uses published content, GET/HEAD-only traffic and blocked external requests. No provider spend, publication or backend changes. VM stays private; phase acceptance waits for 15:00 UTC. Next passive metrics check remains ≥10:26 UTC.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 629 unit/233 integration passes, four expected skips. First full-check process received SIGTERM during lint without diagnostic; full rerun passed. Normal API/worker/docs/schema restart follows commit/push.

## 2026-11-08: iteration 1337 — overnight metrics recovery evidence

- Clean main/no leftovers. Alerts empty; health, 14 services, 36 sources and jobs checks pass. Read all four published topic headline lists; known editorial fixes and phase acceptance await the normal 15:00 UTC publication.
- Owner benefit: the morning edition's metrics dependency now has an overnight history check rather than only isolated short probes; the recovery gate stays honest. No product/runtime change or provider spend.
- Eight uncached local range queries, Nov 7 19:05:30–Nov 8 10:25:30: 1,841 returned points each, no timestamp gaps/resets; 34,728,242 small rows across 2,002 merges, largest adjacent increase 4,454,018 rows. No five-million-row candidate/big merge; process identity constant, sampled up=1, admission hits=2, timeouts/slow queries=0. Historical evaluator counters remain unavailable.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` at 10:26:09–10:26:40: 23 healthy/fresh rules, four queries ≤0.803 s, zero new evaluator errors/missed iterations, no merges. Metrics has zero restarts since Nov 7 16:00:24. Recovery remains open; next passive probe ≥11:26 UTC.
- App `/healthz` and configured Grafana health pass. Initial Grafana checks used the wrong port/unauthenticated proxy; corrected to configured local port 3001, database=ok. No service failure.
- Recorded evidence in capacity decision and TASKS; VM remains private, no phase acknowledgment. Next: normal 15:00 scheduled acceptance and first-week report.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `pnpm build` and `git diff --check` pass: 629 unit/233 integration passes, four expected skips. No UI change, so no browser/screenshot change. Normal API/worker/docs/schema restart follows commit/push.

## 2026-11-08: iteration 1338 — easier theme switching

- Clean main/no leftovers. Alerts empty; health, 14 services, 36 sources and digest jobs healthy. Scheduled acceptance remains 15:00 UTC; next passive metrics probe ≥11:26 UTC.
- Read all four published topic titles/summaries and saved post excerpts. Known content fixes await scheduled evidence. Reader benefit: the theme switch now has a 44px touch target instead of 36px, making it easier to tap across reader pages.
- Initial keyboard-navigation suspicion was disproved by a browser check: native Contents anchors already focus their destination. No navigation change made.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-theme-target.ts` pass: latest/historical editions, archive and Saved items at 1440/390/320px, both themes (24 cases); target, keyboard Enter/Space, visible focus, reload persistence and no overflow/page errors. Six header screenshots saved; narrow dark inspected.
- Browser used published content with GET/HEAD-only local requests and external requests blocked. No provider spend, feature or backend change. VM remains private; no phase acknowledgment before scheduled acceptance.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 629 unit/233 integration passes, four expected skips. Corrected initial new-script formatting failure; one existing cleanup test conservatively skipped deletion during the next run, then passed in isolation and the complete rerun. No cleanup behavior changed. Normal four-service restart follows push.

## 2026-11-08: iteration 1339 — easier archive access after reading

- Clean main/no leftovers. Alerts empty; health, 14 services and 36 sources healthy; no failed digest jobs, next publication 15:00 UTC. Metrics probe remains due ≥11:26 UTC.
- Read the latest four topic story titles/summaries and post excerpts (20 stories/18 posts); known content fixes await scheduled acceptance. Reader benefit: the end-of-edition Past editions link now has a 44px tap target and explicit keyboard focus, making the archive easier to open after reading.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-footer.ts` pass: latest/historical editions at 1440/390/320px, both themes (12 cases), target size, keyboard focus/Enter, archive destination and no overflow/page errors. Twelve small footer screenshots saved; narrow dark inspected.
- GET/HEAD-only published reader traffic, external requests blocked; no provider spend, publication or backend changes. VM remains private; scheduled phase/X/Bluesky acceptance stays open.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` rerun and `git diff --check` pass: 629 unit/233 integration passes, four expected skips. Initial full check received SIGTERM during unit tests without a failure report; complete rerun passed. Normal API/worker/docs/schema restart follows commit/push.

## 2026-11-08: iteration 1340 — easier reader recovery

- Clean main/no leftovers. Alerts empty; health, services and 36 sources healthy. No failed digest runs; next scheduled publication 15:00 UTC. Retained ingestion/social failures have subsequent successful collections. Metrics probe stays due ≥11:26 UTC.
- Read all four published story headline/summary lists. Thin Tech evidence and NBA fallback remain the largest content weaknesses; prepared fixes await scheduled evidence, so no additional generation changes.
- Reader benefit under items 38/42: edition/archive retry buttons and the missing-edition return link now have 44px touch targets; the return link also has explicit keyboard focus. This makes loading recovery easier on phones and keyboards.
- Browser verification uses deliberately invalid JSON/404 responses intercepted locally, then real published GET responses for recovery; external requests and server writes blocked. No provider spend or publication. VM stays private; phase acceptance remains open.
- `pnpm build` and `pnpm exec tsx scripts/smoke-reader-recovery-targets.ts` pass: 18 recovery cases at 1440/390/320px in both themes, target size, visible keyboard focus/Enter and no overflow/page errors. Six screenshots saved; narrow light retry and dark missing-edition views inspected.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 629 unit/233 integration passes, four expected skips. Fixed new-script formatting after lint import sorting; subsequent run received SIGTERM during unit tests without a failure, complete rerun passed. Normal four-service restart follows push.

## 2026-11-08: iteration 1341 — resume reading after recovery

- Clean main/no leftovers. Alerts empty; health, 14 services and 36 sources healthy. No failed digest runs; next scheduled publication 15:00 UTC. Metrics probe remains due ≥11:26 UTC.
- Read the published topics and post excerpts: thin Tech evidence and NBA fallback remain the largest content weaknesses; prepared fixes await scheduled evidence. Reader benefit: successful edition/archive retries now focus recovered content, so keyboard readers can continue without restarting navigation.
- Browser reproduced lost focus on the previous build. Updated `pnpm exec tsx scripts/smoke-reader-recovery-targets.ts` passes all 18 cases at 1440/390/320px in both themes, including content focus, targets, keyboard activation and no overflow/page errors. Four recovery-focus screenshots saved; narrow edition dark and archive light inspected.
- Initial attempt to test repeated failed retries raced the request; removed that extra test step before recording the baseline focus failure. Recovery replay uses local intercepted invalid JSON/404 responses followed by real published GET responses; external traffic/writes blocked, no provider spend.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/233 integration passes, four expected skips. Live reader remains four topics/20 stories/18 posts. VM stays private; phase acceptance remains open.
- First full-check wrapper exited SIGTERM after all test reports passed; complete rerun exits 0. Archived iterations 1325–1330 to keep PROGRESS.md below 25 KB. Normal API/worker/docs/schema restart follows commit/push. Next: scheduled acceptance at 15:00 UTC; first-week report and passive metrics probe when due.

## 2026-11-08: iteration 1342 — require the right scheduled reader window

- Clean main/no leftovers. `pnpm obs alerts`, health, services/sources checks: zero alerts, healthy API/database/Redis, 14 services and 36 sources. Jobs report no failed digest runs; next publication 15:00 UTC. Corrected unsupported obs CLI forms without changing services.
- Read all four published story/summary lists and post excerpts. Thin Tech evidence and NBA fallback remain the largest weaknesses; prepared fixes await publication. Owner benefit: scheduled acceptance now has a command that cannot count yesterday's latest reader response as today's result.
- Added GET-only `scripts/check-scheduled-reader.ts` and its acceptance-plan command: exact requested UTC window, matching latest/direct content and history window/topics. Exit 2 means pending; exit 1 means invalid input or failure. Job/publication metadata and editorial review remain separate gates.
- Live Nov 7 window passes (four topics/20 stories/18 posts); Nov 8 returns pending/exit 2. Older-than-latest, invalid input, missing input and invalid calendar date return exit 1. Five original response hashes unchanged; private test direct link remains 404. No provider calls, writes or phase acknowledgment.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/233 integration passes, four expected skips. Targeted script typecheck/lint/format pass; broad ad-hoc script typecheck first hit unrelated existing test/config errors, then isolated config passed. Normal four-service restart follows commit/push.
- Next: passive metrics probe ≥11:26 UTC and scheduled publication/first-week acceptance at 15:00 UTC; VM remains private.

## 2026-11-08: iteration 1343 — hourly metrics-recovery evidence

- Clean main/no leftovers. Alerts empty; health, 14 services, 36 sources and jobs checks pass. No failed digest runs; next scheduled publication 15:00 UTC. Nov 7 reader gate passes: four topics/20 stories/18 posts.
- Reader review still finds thin Tech evidence and NBA fallback the largest weaknesses; deployed fixes await the scheduled edition. No additional generation or save-control change justified. Owner benefit: current evidence keeps the open metrics incident visible without changing the protected edition or claiming recovery prematurely.
- At the due hourly check, eight uncached stored-history queries (10:25:30–11:26:00 UTC, 122 points each) show 2,287,725 rows/122 small merges, largest 30-second increase 965,106 rows. No gaps/resets or comparable candidate; sampled scrape values all one, admission hits two, timeouts/slow queries zero.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`: 23 healthy/fresh rules, four queries ≤0.278 s, zero new evaluator errors/missed iterations, 31,684 rows/two small merges, no big merge. Metrics systemd start unchanged/zero restarts; Grafana database healthy. Updated decision 0004 and TASKS; next probe ≥12:26 UTC.
- No provider calls, publication, configuration/limit changes or phase acknowledgments; VM remains private. Scheduled acceptance and first-week report remain due at 15:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, full `pnpm check` and `git diff --check` pass: 629 unit/233 integration passes, four expected skips. A targeted format check initially ran before the full formatter reached PROGRESS; final targeted check passes. Normal four-service restart follows commit/push.
