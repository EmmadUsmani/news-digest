# Progress

Older entries: [earlier Nov 15](docs/progress-archive/2026-11-15-before-2346.md), [iterations 2339–2347](docs/progress-archive/2026-11-15-2339-2347.md).

## 2026-11-15: iteration 2348 — correct Nov 14 recovery handoff

- Clean main at 819957c3; no inherited work. Saved review still instructed all-topic recovery before item 58 closure/public activation, contradicting STEERING 62 and deployed state.
- Updated that actionable paragraph to record closure/activation and separate next scheduled publication/access acceptance from Gaming/World/U.S. editorial recovery; historical diagnosis retained.
- Initial alerts zero; health/database/Redis pass and all 38 sources healthy. No paid calls, generation, settings or sharing changes.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,040 unit/329 integration passes, four expected skips); `pnpm exec tsx scripts/check-handbook.ts --owner-services` passes (18 pages, 22 diagrams, 39 tables). Logs `/tmp/2348-{format,lint,check,handbook,sources}.log`.
- Runtime/config unchanged; no restart under STEERING 22. Next: Nov 15 15:00 UTC scheduled publication/access acceptance and separate editorial review; VM stays private.

## 2026-11-15: iteration 2349 — restore stored Bluesky coverage reporting

- Clean main at 9e53e81f; no inherited work. Initial orientation was overbroad; subsequent reads narrowed. Alerts zero.
- Found a real public-mode tooling failure while taking the next source-quality task: coverage report required private `profileId`, omitted by the public topics response. Switched to the existing public `topicSettingsSchema`; no application-policy change.
- Read-only production report now succeeds for all five topics. Tech/NBA/Gaming/World/U.S. distinct stored posts: 52/48/51/46/49; safe engaged candidates capped at 50: 50/43/49/16/48. U.S. Congress collection is returning data; lexical zero is not semantic rejection. Updated SOURCES.
- Verification: `pnpm exec tsx scripts/report-bluesky-coverage.ts --examples 1` with private environment loaded; receipt `/tmp/2349-bluesky.json`. No provider calls or writes. `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,040 unit/329 integration passes, four expected skips); diff checks pass. Logs `/tmp/2349-{format,lint,check}.log`.
- Runtime/config unchanged; no restart under STEERING 22. No generation, budget, query or sharing changes. Next: natural scheduled publication/access acceptance and editorial recovery review at 15:00 UTC; public mode ON, VM private.

## 2026-11-15: iteration 2350 — restore public-mode World rotation rehearsal

- Clean main at 5e7c0e9d; no inherited work. Alerts zero, health/database/Redis healthy and all 38 sources returning data.
- Reproduced a concrete discovery-tool breakage: the offline World rotation rehearsal fails against current public-mode topic metadata because the private topic schema requires `profileId`.
- Changed the rehearsal to the existing public topic-settings contract and documented that contract. No collector, source-query, pilot-flag or admission changes.
- Verification: rehearsal fails before the fix and passes after it: 24 simulated hours, 120 fake searches, 12/6/6 World query allocation, six collector, eight rollover/retry and nine scheduler checks; other-topic queries unchanged; zero live searches/writes. Receipts `/tmp/2350-rotation{,-before}.log`.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and diff checks pass; logs `/tmp/2350-{format,lint,check}.log`.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private; World pilot remains off. Next: scheduled publication/access acceptance and separate natural editorial recovery review at 15:00 UTC.

## 2026-11-15: iteration 2351 — restore live Bluesky probe in public mode

- Clean main at 11e263db; no inherited work. Alerts zero, health/database/Redis healthy, all 38 sources returning data.
- Reproduced probe failure before searches; read-only contract check isolates missing private profile IDs for all five topics. Switched probe to public topic-settings schema.
- Explicit free `pnpm exec tsx scripts/probe-bluesky.ts --world` succeeded after fix: common 24-hour window, baseline/Ukraine/Gaza/geopolitics fetched 45/49/49/47, engaged 19/49/49/35; eight search-page requests, no observation writes or paid calls. Receipts `/tmp/2351-{probe-before,contract}.log`, `/tmp/2351-world.jsonl`.
- Strongest examples mix reporting/commentary and U.S. overlap; zero legacy phrase shortlists do not establish semantic rejection. Updated SOURCES; no production-query or pilot changes.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,040 unit/329 integration passes, four expected skips); diff checks pass. Logs `/tmp/2351-{format,lint,check}.log`.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private. Next: 15:00 UTC publication/access acceptance and separate natural editorial recovery review.

## 2026-11-15: iteration 2352 — restore reviewed X account settings verification

- Clean main at e7f8ad2f; no inherited work. Alerts zero; health/database/Redis pass; all 38 enabled sources returning data with no source errors.
- Reproduced read-only X account smoke failure on missing private profile IDs; switched both snapshots to the public topic-settings contract. No production policy or settings changes.
- `pnpm exec tsx scripts/smoke-reviewed-x-accounts.ts` passes: all four documented lists match live settings in desktop/mobile local browser replays, zero writes/errors/overflow. Refreshed eight screenshots; inspected mobile output. Access is replayed, not signed-out public acceptance.
- Due passive metrics probe: 24 healthy rules, two small merges/17,411 rows below comparable threshold, no new evaluator errors/missed evaluations/admission hits/timeouts/slow queries; warnings journal empty. Next sample ≥07:25 UTC; recovery stays open.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,040 unit/329 integration passes, four expected skips); `git diff --check` passes. Receipts `/tmp/2352-{x-before,x,format,lint,check}.log` and `/tmp/2352-metrics.jsonl`.
- Runtime/config unchanged; no restart under STEERING 22. No paid calls, generation, query, budget or sharing changes. Scratch cleanup already applied today (2339). Next: 15:00 UTC scheduled publication/access acceptance and separate editorial recovery review.

## 2026-11-15: iteration 2353 — restore public-mode source-management verification

- Clean main at 85e953f6; no inherited work. Alerts zero; health/database/Redis pass; all 38 enabled sources returning items, zero source errors.
- Reproduced source-management smoke failure on private status fields, then obsolete hidden-page/profile assumptions. Switched to public status/topic contracts; accepts read-only management shell and preserves public profile refusal.
- `pnpm exec tsx scripts/smoke-admin-sources.ts` passes four desktop/mobile light/dark replays: exact source counts/topic connections, navigation, simulated feed submission and collection pause/resume/failure; no live writes or browser credentials. Refreshed eight screenshots and inspected mobile source view.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips.
- Updated SOURCES and TASKS. Before/final smoke receipts `/tmp/2353-{before,sources}.log`; formatting/lint/check receipts `/tmp/2353-{format,lint,check}.log`.
- Runtime/config unchanged; no restart under STEERING 22. No provider calls, generation, source settings, budgets or sharing changes. Public mode ON, VM private; next: 15:00 UTC scheduled publication/access gate and separate editorial recovery review.

## 2026-11-15: iteration 2354 — correct reader Bluesky engagement labels

- Clean main at e9ac8eb8; no inherited work. Alerts zero; health/database/Redis pass; all 38 sources returning items without errors.
- Owner-visible improvement: saved World Bluesky card displayed “1 likes”; singular likes/reposts/replies now read “1 like”, “1 repost”, “1 reply”. Counts and collection-time labels unchanged.
- Reader review confirms larger editorial weaknesses already await natural scheduled evidence; no generation, source, budget or sharing changes.
- Browser assertion reproduced the saved-card defect before the fix. After public-mode rebuild/API restart, desktop/mobile light/dark pass saved World-card checks plus synthetic 0/1/2/1,000 counts, zero writes/external requests/errors/overflow.
- Four screenshots added under docs/screenshots/ui/reader-bluesky-metrics-*; inspected mobile light. Replay command: `node --input-type=module < /tmp/2354-reader-check.mjs`; receipts `/tmp/2354-browser{,-before}.log`.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build` pass: 1,040 unit/329 integration passes, four expected skips. Receipts `/tmp/2354-{format,lint,check,build}.log`.
- Post-restart health and source flow pass; runtime now serves the public build. Public mode ON, VM private. Next: 15:00 UTC publication/access acceptance and separate editorial recovery review.

## 2026-11-15: iteration 2355 — preserve clipped social link destinations through punctuation

- Clean main at 88115605; no inherited work. Alerts zero; health/database/Redis pass; all 38 enabled sources return items without errors.
- Owner-visible improvement: clipped social URLs followed by sentence punctuation/closing quotes opened incomplete addresses. They now open the original post for the full link, preserving saved text and complete URL destinations.
- Reproduced before fix with synthetic punctuation in saved-edition browser replay; not a claim that the latest live post contains this punctuation. No editorial, discovery, budget or sharing changes.
- `pnpm exec tsx scripts/smoke-reader-clipped-punctuation.ts` passes six clipped/complete cases in desktop/mobile light/dark, including balanced URL parentheses, keyboard focus, text and no overflow/errors/writes/external traffic. Four screenshots added; inspected mobile light.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Initial check terminated (143) during lint; transient systemd rerun succeeded. Receipts `/tmp/2355-{before,browser,format,lint,check-final,build}.log`.
- API restarted for the public build; health/source flow pass. Initial browser attempt raced startup (connection refused); rerun after health succeeded. Bare loopback reader GET receives expected public admission refusal; explicit test visitor succeeds.
- Public mode ON, VM private. Next: 15:00 UTC scheduled publication/access acceptance and separate editorial recovery review; World discovery pilot stays off pending its gates.

## 2026-11-15: iteration 2356 — restore public-mode saved-item verification

- Clean main at 9344bb5b; no inherited work. Alerts zero; health/database/Redis pass.
- Owner-visible value: verify readers can save stories/posts, keep copies across reloads/tabs and return to the correct historical edition in public mode.
- Reproduced anonymous loopback admission failure; browser smoke now uses an explicit test visitor and validates public history/edition contracts and HTTP status before parsing.
- Updated stale keyboard/account, context-paragraph, publication/save-date and removal-announcement assertions; GET-only, third-party blocking and no-admin-request guards remain enforced.
- `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` passes desktop/mobile light/dark: save/reload, cross-tab sync/removal, keyboard focus/announcements, original destinations, historical story/post jumps, malformed-date recovery and blocked storage. Refreshed screenshots; inspected desktop/mobile light.
- Repeated live reads initially reached HTTP 429; after natural expiry, final replay captures three real responses once, then serves saved bodies across reloads without repeated reader admission. Receipt `/tmp/2356-bookmarks-final.log`; earlier failures `/tmp/2356-bookmarks{,-before}.log`.
- `pnpm obs sources --check` passes all 38 enabled sources; receipt `/tmp/2356-sources.log`.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Receipts `/tmp/2356-{format,lint,check}.log`.
- Runtime/config unchanged; no restart under STEERING 22. No live writes, paid calls, generation, source/budget or sharing changes. Next: 15:00 UTC scheduled publication/access gate and editorial recovery review.

## 2026-11-15: iteration 2357 — make post Save labels readable

- Clean main at 7ae039d5; no inherited work. Alerts zero; health/database/Redis and all 38 sources pass.
- Reader weakness: post Save controls spoke raw ISO timestamps and lowercase platform IDs. They now name X/Bluesky/Reddit and readable local publication times, retaining author/time distinctions for screen-reader navigation.
- Reproduced the raw label on the deployed edition before API restart (`/tmp/2357-before.log`); no generation, source, budget, provider or sharing changes.
- `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` passes desktop/mobile light/dark, including all published post Save labels, saving/reload, removal/cross-tab, keyboard focus and historical story/post jumps. Screenshots refreshed; inspected mobile saved list and bookmark capture. Receipt `/tmp/2357-bookmarks.log`.
- Updated other saved-post smoke selectors for the readable labels. Archived older PROGRESS entries and completed TASKS markers; retained current decisions and evidence links.
- `pnpm format`, `pnpm lint:fix`, `VITE_PUBLIC_MODE=1 pnpm build` pass. Full check initially ended with signal 143 during integration after 1,040 unit passes; transient systemd rerun passes 1,040 unit/329 integration tests, four expected skips. `git diff --check` passes. Receipt `/tmp/2357-check-final.log`.
- Due metrics sample at 07:25: 24 healthy rules, no new failures; since prior sample 58 small merges/1,631,768 rows, no big merge. Recovery still open; next probe ≥08:26 UTC. Receipt `/tmp/2357-metrics.json`.
- API restarted for public build; health and all 38 sources pass afterward. Public mode ON, VM private. Next: 15:00 UTC publication/access acceptance and separate editorial recovery review.

## 2026-11-15: iteration 2358 — restore public-mode account integration verification

- Clean main at ad66f930; no inherited work. Alerts zero; health/database/Redis and all 38 enabled sources pass (`/tmp/2358-sources.log`).
- Reader verification weakness: account integration failed parsing an admission refusal, leaving sign-out/deletion and cross-device saved items unverified after public activation. Reproduced in `/tmp/2358-before.log`.
- Replay now reads saved public edition/history with an explicit test visitor, checks HTTP status/contracts, and runs the public-mode UI with fixture account transport. Removed the obsolete assertion that deployed accounts are disabled.
- Scoped sync assertions to the account dialog (the saved page also announces sync); reject unexpected fixture API requests and check account HTTP methods. Browser traffic stays isolated from live account writes/external services.
- `pnpm exec tsx scripts/smoke-reader-account-integration.ts` passes desktop/mobile light/dark sign-out, deletion/cleared preferences, no admin link, and two-device save/remove/tombstone persistence. Refreshed five screenshots; inspected mobile dark. Receipt `/tmp/2358-browser.log`.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Initial shell verification ended 143 during formatting; transient user-service rerun exited 0. Receipts `/tmp/2358-{format,lint,check}.log`.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private. No paid calls or source/editorial/budget/sharing changes.
- Next: metrics probe ≥08:26 UTC; 15:00 UTC scheduled publication/access gate and separate editorial recovery review.

## 2026-11-15: iteration 2359 — restore public-mode topic preference verification

- Clean main at e381d9ef; no inherited work. Alerts zero; health/database/Redis and all 38 sources pass (`/tmp/2359-sources.log`).
- Reader verification weakness: topic preference smoke failed parsing public-mode admission refusal (`/tmp/2359-before.log`), leaving hide/show persistence and storage recovery unverified.
- Capture latest/history/older edition once with an explicit test visitor and checked HTTP/contracts, then replay those real saved bodies across reloads/tabs. External traffic, writes and admin API requests remain blocked.
- `pnpm exec tsx scripts/smoke-reader-preferences.ts` passes desktop/mobile light/dark: hide/show across reloads and history, all-hidden recovery, cross-tab sync, tombstones, saved-copy preservation and corrupt/blocked storage. Receipt `/tmp/2359-browser.log`; refreshed twelve screenshots and inspected mobile light topic menu.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Receipts `/tmp/2359-{format,lint,check}.log`.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private; no paid calls, source/editorial/budget or sharing changes.
- Next: metrics probe ≥08:26 UTC; 15:00 UTC scheduled publication/access gate and separate editorial recovery review.

## 2026-11-15: iteration 2360 — show topic sync and recover in the picker

- Clean main at 7fe64531; no inherited work. Alerts zero; health/database/Redis and all 38 enabled sources pass (`/tmp/2360-sources.log`).
- Reader weakness: the topic picker described choices as browser-only after account sync shipped, and hid sync failures behind Account. The owner can now see topic sync status and retry a failed upload in the picker without losing choices.
- Corrected the browser-only description; reused the mounted account controller/status and explicit retry, with no new requests on opening Topics or background retry loop.
- `pnpm exec tsx scripts/smoke-reader-account-integration.ts` passes desktop/mobile light/dark with real saved reader bodies and fixture account transport: injected 503 retains the changed checkbox, Retry sync recovers, existing sign-out/deletion and two-device bookmark/tombstone checks pass. Eight new screenshots; inspected mobile dark success/failure. Receipt `/tmp/2360-browser.log`.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Initial shell chain ended 143 during lint; transient rerun caught an unsupported button variant, corrected to the existing ghost variant before the final passing run. Receipts `/tmp/2360-{format,lint,check-final,build}.log`.
- API restarted for the public build; health passes. Initial pre-restart browser probe could not find Topics; post-restart desktop/mobile GET-only checks pass deployed signed-out sync guidance with no retry button (`/tmp/2360-deployed-browser-final.log`).
- Public mode ON, VM private; no paid calls, source/editorial/budget or sharing changes. Next: metrics probe ≥08:26 UTC; 15:00 scheduled publication/access gate and editorial recovery review.

## 2026-11-15: iteration 2361 — retry saved-item sync where it fails

- Clean main at 98fc8d9a; no inherited work. Alerts zero; health/database/Redis and all 38 enabled sources pass (`/tmp/2361-sources.log`).
- Reader weakness: Saved items displayed sync failure but required opening Account to retry. Added Retry sync beside the failure using the mounted account controller; it disappears after recovery or a failed session refresh.
- Extended `pnpm exec tsx scripts/smoke-saved-sync-status.ts`: failed retry then successful retry retain a saved fixture without opening Account; signed-out/session-failure states have no retry. Desktop/mobile light/dark pass with fixture account transport, no live account writes. Eight screenshots refreshed; inspected mobile dark failure.
- Updated owner handbook instructions; `pnpm exec tsx scripts/check-handbook.ts 01-app/README --owner-services` passes (18 pages/39 tables).
- `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Receipts `/tmp/2361-{format,lint,check,build,browser}.log`.
- API restarted for public build. Immediate health request raced startup; subsequent `pnpm obs health --check` and deployed browser checks pass (`/tmp/2361-health-final.log`).
- Due passive metrics sample (`pnpm exec tsx scripts/sample-metrics-recovery.ts`): 08:27–08:30, 24 healthy rules, three small merges/33,643 rows, no big merge/new evaluator failures/admission hits/timeouts/slow queries; uncached probes ≤0.976 s. System obs-metrics/obs-alerts warning journal empty since 07:25. Comparable recovery remains pending; next sample ≥09:31.
- Public mode ON, VM private; no paid calls, source/editorial/budget or sharing changes. Next: 15:00 scheduled publication/access gate and editorial recovery review.

## 2026-11-15: iteration 2362 — restore saved-item capacity browser verification

- Clean main at d9326009; no inherited work. `pnpm obs alerts` reports zero; `pnpm obs health --check` and all 38 enabled sources pass (`/tmp/2362-sources.log`).
- Reader verification weakness: capacity smoke failed parsing the public-mode admission refusal before testing saved-copy preservation (`/tmp/2362-before.log`). Capture one checked public reader response with an explicit test visitor and replay it across tabs/reloads; refuse server writes, admin requests and external traffic.
- `pnpm exec tsx scripts/smoke-reader-preference-capacity.ts` passes desktop/mobile light/dark: a saved published story and 1,000 synthetic removal records survive concurrent stale-tab writes and reloads, independent topic choice survives, and storage writes settle. Four screenshots refreshed; inspected mobile dark. Receipt `/tmp/2362-browser.log`.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Receipts `/tmp/2362-{format,lint,check}.log`; API build passes within integration checks.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private; no paid calls, source/editorial/budget or sharing changes.
- Next: metrics probe ≥09:31 UTC; 15:00 scheduled publication/access gate and separate editorial recovery review.
