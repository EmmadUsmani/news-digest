# Progress

Older entries: [earlier Nov 15](docs/progress-archive/2026-11-15-before-2346.md), [iterations 2339–2347](docs/progress-archive/2026-11-15-2339-2347.md).

Archived: [iterations 2348–2354](docs/progress-archive/2026-11-15-2348-2354.md).

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

## 2026-11-15: iteration 2363 — restore public-mode preference reset verification

- Clean main at 4344ca03; no inherited work. `pnpm obs alerts` zero; `pnpm obs health --check` and all 38 enabled sources pass (`/tmp/2363-sources.log`).
- Reader verification weakness: storage-reset smoke failed parsing the public-mode admission refusal before exercising browser reset (`/tmp/2363-before.log`). Capture one checked public reader response with an explicit test visitor and replay it across tabs; refuse server writes, admin requests and external traffic.
- `pnpm exec tsx scripts/smoke-reader-storage-reset.ts` passes desktop/mobile light/dark: removing the preference key and clearing local storage reset saved items and hidden topics across three tabs. Reload retains default topics/unsaved controls and does not recreate the removed key; zero page errors/server writes. Four screenshots refreshed; inspected mobile dark. Receipt `/tmp/2363-browser.log`.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. API rebuild included in integration checks. Receipts `/tmp/2363-{format,lint,check}.log`.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private; no paid calls, source/editorial/budget or sharing changes.
- Next: metrics probe ≥09:31 UTC; 15:00 scheduled publication/access gate and separate editorial recovery review.

## 2026-11-15: iteration 2364 — restore public-mode storage-read recovery verification

- Clean main at 6e5b9fa9; no inherited work. Alerts zero; `pnpm obs health --check` and all 38 enabled sources pass (`/tmp/2364-sources.log`).
- Reader verification weakness: storage-preservation smoke failed parsing public-mode admission refusal before exercising recovery (`/tmp/2364-before.log`). Capture one checked public reader response with an explicit test visitor and replay it; refuse server writes, admin requests and external traffic.
- `pnpm exec tsx scripts/smoke-reader-storage-preservation.ts` passes desktop/mobile light/dark: failed reads preserve the original saved fixture; recovery merges it with pending saves/topic choices and clears transient warnings. Fixture remains explicitly offline. Eight screenshots refreshed; inspected mobile dark (`/tmp/2364-browser.log`).
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. API rebuild included in integration checks. Receipts `/tmp/2364-{format,lint,check}.log`.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private; no paid calls, source/editorial/budget or sharing changes.
- Next: metrics probe ≥09:31 UTC; 15:00 scheduled publication/access gate and separate editorial recovery review.

## 2026-11-15: iteration 2365 — restore concurrent-tab preference race verification

- Clean main at 62617724; no inherited work. Alerts zero; `pnpm obs health --check` and all 38 enabled sources pass (`/tmp/2365-{health,sources}.log`).
- Concurrent-tab smoke failed parsing public-mode refusal before testing preservation (`/tmp/2365-before.log`). Capture a checked published reader response with an explicit test visitor and replay across tabs; refuse server writes, admin and external requests.
- `pnpm exec tsx scripts/smoke-reader-preference-race.ts` passes desktop/mobile light/dark: saved story and independent hidden-topic choice survive stale writes/reload; storage settles. Four screenshots refreshed; inspected mobile dark (`/tmp/2365-browser.log`).
- Ran `pnpm format` and `pnpm lint:fix`; first full-check process ended with signal 143. Retry identified archive formatting; corrected it before rerunning full `pnpm check`. Final full check passes: 1,040 unit/329 integration passes, four expected skips; API rebuild included. Receipt: `/tmp/2365-check.log`.
- Archived progress entries 2348–2354 to keep orientation small. Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private; no paid calls or sharing changes.
- Next: metrics probe ≥09:31 UTC; 15:00 scheduled publication/access gate and separate editorial recovery review.

## 2026-11-15: iteration 2366 — restore hidden-destination verification

- Clean main at 61fc12d6; no inherited work. Alerts zero; health and all 38 enabled sources pass (`/tmp/2366-{health,sources}.log`).
- Hidden-destination smoke failed parsing public-mode admission refusal before testing reader links (`/tmp/2366-before.log`). Capture one checked published edition with an explicit test visitor and replay it; refuse server writes, admin and external requests.
- `pnpm exec tsx scripts/smoke-reader-hidden-destination.ts` passes desktop/mobile light/dark: hidden story/post links offer topic reveal, focus the destination after reveal and retain visibility on reload. Zero page errors or horizontal overflow. Four screenshots refreshed; inspected mobile dark (`/tmp/2366-browser.log`).
- Ran `pnpm format` and `pnpm lint:fix`; first full check terminated with signal 143 during formatting. Clean `pnpm check` rerun passes: 1,040 unit/329 integration passes, four expected skips; API rebuild included. Receipts `/tmp/2366-{format,lint,check-retry}.log`. `git diff --check` passes.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private; no paid calls or sharing changes.
- Next: metrics probe ≥09:31 UTC; 15:00 scheduled publication/access gate and separate editorial recovery review.

## 2026-11-15: iteration 2367 — restore reading-position verification

- Clean main at 562207b2; no inherited work. Alerts zero; health and all 38 enabled sources pass (`/tmp/2367-{health,sources}.log`).
- Reading-position smoke failed parsing public-mode refusal before testing navigation (`/tmp/2367-before.log`). Capture a checked published reader response with a documentation-range visitor; block writes, admin and external requests.
- Corrected replay navigation: keyboard input ends opening-anchor stabilization; settle native scrolling before recording the later position. Script-only scrolling had left stabilization active.
- `pnpm exec tsx scripts/smoke-reader-position.ts` passes desktop/mobile light/dark: opening deep links align, changed background refresh preserves later reading position/hash, no page errors or overflow. Four screenshots refreshed; inspected mobile dark (`/tmp/2367-browser.log`).
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass: 1,040 unit/329 integration passes, four expected skips; API rebuild included. Receipts `/tmp/2367-{format,lint,check}.log`. `git diff --check` passes.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private; no paid calls or sharing changes.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 6 30`: 09:31–09:34, 24 healthy rules, four small merges/149,209 rows, no big merge or new failures/admission hits/timeouts/slow queries. User warning journal empty since 08:30; second comparable natural merge still pending. Limits unchanged (`/tmp/2367-metrics.log`).
- Next: metrics probe ≥10:35 UTC; 15:00 scheduled publication/access gate and separate editorial recovery review.
