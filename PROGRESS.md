# Progress

Older entries: [earlier Nov 15](docs/progress-archive/2026-11-15-before-2346.md), [iterations 2339–2347](docs/progress-archive/2026-11-15-2339-2347.md).

Archived: [iterations 2348–2354](docs/progress-archive/2026-11-15-2348-2354.md).

Archived: [iterations 2355–2360](docs/progress-archive/2026-11-15-2355-2360.md).

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

## 2026-11-15: iteration 2368 — verify usable archive/saved navigation

- Clean main at 772e71ed; no inherited work. Alerts zero; health and all 38 enabled sources pass (`/tmp/2368-{health,sources}.log`).
- Reader weakness: navigation smoke accepted page headings without checking history dates or error alerts. Baseline passed despite this gap (`/tmp/2368-before.log`).
- Capture checked published history through an explicit documentation-range visitor; replay it while blocking external requests, admin routes and writes. Require published date links, correct edition destinations, saved-items empty state and no alerts.
- `pnpm exec tsx scripts/smoke-reader-navigation.ts` passes desktop/mobile light/dark: keyboard navigation, 44px targets, usable content, no errors or overflow. Eight screenshots refreshed; inspected mobile dark archive (`/tmp/2368-browser.log`).
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass: 1,040 unit/329 integration passes, four expected skips; API rebuild included. Receipts `/tmp/2368-{format,lint,check}.log`. `git diff --check` passes.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private; no paid calls or sharing changes.
- Next: metrics probe ≥10:35 UTC; 15:00 scheduled publication/access gate and separate editorial recovery review.

## 2026-11-15: iteration 2369 — require published content after returning home

- Clean main at dc12cc7e; no inherited work. `pnpm obs alerts`: zero; `pnpm obs health --check` and `pnpm obs sources --check`: healthy/all 38 enabled sources pass (`/tmp/2369-{health,sources}.log`).
- Home-link smoke accepted a visible main container even when public-mode content failed admission. Baseline passed despite this gap (`/tmp/2369-before.log`).
- Capture schema-checked published history/latest with an explicit documentation-range visitor; replay content while blocking writes, admin and external requests. Require usable archive/saved content and every published topic after keyboard navigation home, with no alerts.
- `pnpm exec tsx scripts/smoke-reader-home-links.ts` passes desktop/mobile light/dark: keyboard focus, 44px targets, real published topic IDs, no errors or overflow. Eight screenshots refreshed; inspected mobile dark archive (`/tmp/2369-browser.log`).
- Archived older completed task markers to keep orientation small. Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private; no paid calls or sharing changes.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass: 1,040 unit/329 integration passes, four expected skips; API rebuild included. Receipts `/tmp/2369-{format,lint,check}.log`. `git diff --check` passes.
- Next: metrics probe ≥10:35 UTC; 15:00 scheduled publication/access gate and separate editorial recovery review.

## 2026-11-15: iteration 2370 — require content at keyboard skip destinations

- Clean main at 8088d6af; no inherited work. `pnpm obs alerts`: zero; `pnpm obs health --check` and `pnpm obs sources --check`: healthy/all 38 enabled sources pass (`/tmp/2370-{health,sources}.log`).
- Reader weakness: keyboard skip-link smoke could accept archive focus without confirming published entries or checking reader errors. Baseline passed despite the gap (`/tmp/2370-before.log`).
- Capture schema-checked published history, require latest/history agreement, replay it while blocking writes/admin/external requests. Require all published topic targets, archive entry count/latest destination and no alerts before keyboard checks.
- `pnpm exec tsx scripts/smoke-reader-skip-link.ts`: desktop/mobile light/dark pass; keyboard focus, visible destination, next content link and no overflow/page errors. Refreshed edition screenshots; archive screenshots unchanged; inspected mobile dark archive (`/tmp/2370-browser.log`).
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass: 1,040 unit/329 integration passes, four expected skips; API rebuild included. `git diff --check` passes; receipts `/tmp/2370-{format,lint,check}.log`.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private; no paid calls or sharing changes.
- Next: metrics probe ≥10:35 UTC; scheduled publication/access gate and separate editorial recovery review at 15:00 UTC.

## 2026-11-15: iteration 2371 — make account actions easier to tap

- Clean main at 66dd1ad0; no inherited work. Alerts zero; health and all 38 enabled sources pass (`/tmp/2371-{health,sources}.log`).
- Owner-visible weakness: reader Account and account actions were only 36px tall. Enlarged trigger, retry, sign-out and deletion buttons to at least 44×44px; no account behavior or generation changes.
- Added touch-target assertions to existing account browser checks; baseline fails on Account, fixed desktop/mobile fixture checks pass (`/tmp/2371-{before,browser}.log`).
- `pnpm exec tsx scripts/smoke-reader-account-integration.ts` passes two-device sync with fixture accounts and saved published content; desktop/mobile light/dark screenshots refreshed and mobile dark inspected.
- `pnpm --filter @digest/web build` passes; restarted API. First browser probe raced startup; retry after healthy `/healthz` passes: deployed Account 94×44px at 1440/390 widths, sign-in visible, no overflow (`/tmp/2371-deployed.log`).
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Receipts `/tmp/2371-{format,lint,check}.log`. Archived iterations 2355–2360 to keep progress small.
- Public mode ON, VM private; no paid calls or sharing changes. Known edition recovery remains awaiting natural scheduled evidence.
- Next: metrics probe ≥10:35 UTC; scheduled publication/access gate and separate editorial recovery review at 15:00 UTC.

## 2026-11-15: iteration 2372 — keep keyboard focus during account deletion

- Clean main at 987fdd1f; no inherited work. Alerts zero; health and all 38 enabled sources pass (`/tmp/2372-{health,sources}.log`).
- Reader-visible weakness: opening deletion removed the focused button without focusing confirmation. Focus now moves to the confirmation input and returns to Delete account on cancellation; deletion behavior unchanged.
- `pnpm exec tsx scripts/smoke-reader-account.ts` passes desktop/mobile fixture checks, including both focus transitions; account screenshots refreshed and mobile inspected (`/tmp/2372-browser.log`).
- Public web build passes; restarted API and health recovered. Initial deployed smoke hit shared loopback HTTP 429; temporary documentation-range visitor header passes desktop/mobile light/dark signed-out entry with zero writes. Probe script restored (`/tmp/2372-deployed-visitor.log`).
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips; API rebuild included (`/tmp/2372-{format,lint,check}.log`). Latest published endpoint returns b9d55088 with five topics.
- Public mode ON, VM private; no paid calls, generation changes or sharing changes. Natural recovery/publication gate still awaits 15:00 edition.
- Next: metrics probe ≥10:35 UTC; scheduled publication/access gate and separate editorial recovery review at 15:00 UTC.

## 2026-11-15: iteration 2373 — explain saved posts without text

- Clean main at 8d2be6cd; no inherited work. Alerts zero; health and all 38 enabled sources pass (`/tmp/2373-{health,sources}.log`).
- Owner-visible weakness: saved social posts with empty text lacked an explanation and explicit source action. They now show “Post text unavailable.” and Read source; saved-story behavior retained.
- Extended `pnpm exec tsx scripts/smoke-saved-post-continuation.ts` with empty X/Bluesky/Reddit fixtures and signed-out session replay. Old build fails missing-message assertion; rebuilt desktop/mobile light/dark pass destinations, focus, reload and layout (`/tmp/2373-{before,browser}.log`). Four screenshots refreshed; mobile light inspected.
- Public web build passes; restarted API and `/healthz` confirms database/Redis healthy. Browser verification uses deployed assets and explicit offline bookmarks. Separate latest-edition GET hit shared-loopback HTTP 429; no publication failure inferred.
- Verification: `pnpm format`, `pnpm lint:fix`, targeted final script lint/format and `git diff --check` pass; full `pnpm check` passes: 1,040 unit/329 integration passes, four expected skips. Receipts `/tmp/2373-{format,lint,build,check}.log`.
- Due passive metrics sample: 10:35–10:38, 24 healthy rules, three small merges/131,212 rows, no big merge/new evaluator failures/timeouts/slow queries; one admission hit, max uncached query 1.135 s. User warning journal empty since 09:34; comparable recovery pending, limits unchanged (`/tmp/2373-metrics.log`).
- Public mode ON, VM private; no paid calls, generation or sharing changes. Next: metrics sample ≥11:39 UTC; scheduled publication/access gate and separate editorial recovery review at 15:00 UTC.

## 2026-11-15: iteration 2374 — clear dismissed deletion confirmation

- Clean main at 2986baf2; no inherited work. Alerts zero; health, 14 services and all 38 enabled sources pass (`/tmp/2374-{health,services,sources}.log`).
- Reader-visible weakness: dismissing Account retained typed DELETE and an enabled deletion action on reopen. Closing now resets the confirmation and returns to normal account actions; readers must confirm afresh.
- Extended `pnpm exec tsx scripts/smoke-reader-account.ts`: old UI fails; fixed desktop/mobile Escape and close-button checks pass, including restored trigger focus, empty refocused input and disabled deletion (`/tmp/2374-{before,browser}.log`). Account screenshots refreshed; mobile inspected.
- `pnpm exec tsx scripts/smoke-reader-account-integration.ts` passes fixture-account two-device sync (`/tmp/2374-account-integration.log`). No live account writes.
- Public web build passes; API restarted. Immediate health probe raced startup; subsequent health confirms database/Redis healthy (`/tmp/2374-{build,deployed-health}.log`).
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips (`/tmp/2374-{format,lint-final,check}.log`). Initial combined verification shell exited 143; explicit lint and full-check reruns both exit 0.
- Deployed `pnpm exec tsx scripts/smoke-reader-home-links.ts` passes desktop/mobile light/dark with published content (`/tmp/2374-deployed-browser.log`); unrelated generated screenshots discarded.
- Public mode ON, VM private; no paid calls, generation or sharing changes. Scheduled recovery/publication gate still awaits 15:00 UTC; next passive metrics sample no earlier than 11:39 UTC.

## 2026-11-15: iteration 2375 — complete Privacy keyboard navigation

- Clean main at a5d8cf89; no inherited work. `pnpm obs alerts` reports zero alerts; `/healthz` confirms database/Redis healthy.
- Owner-visible weakness: Privacy lacked the skip navigation available on other reader pages. Added a focusable policy heading and shared skip link so keyboard readers can bypass the header.
- `pnpm exec tsx scripts/smoke-privacy.ts` passes desktop/mobile light/dark with accounts off/on, keyboard entry/skip/forward focus, reload, layout and zero API/external requests. Four focused screenshots added; mobile light inspected (`/tmp/2375-privacy-final.log`).
- Higher-priority content fixes await scheduled evidence. World pilot remains OFF: rollout notes require private public-mode acceptance; no provider or environment changes. Offline rotation rehearsal passes; baseline collection export retained at `/tmp/2375-bluesky-baseline.json`.
- Public `VITE_PUBLIC_MODE=1 pnpm build` passes; API restarted and health recovered. Deployed Privacy skip passes after waiting for React heading readiness (initial probe pressed Tab too early). Latest reader endpoint still returns b9d55088 with five topics (`/tmp/2375-{build,deployed-final}.log`).
- Verification: `pnpm format`, `pnpm lint:fix`, standalone `pnpm check` and `git diff --check` pass; 1,040 unit/329 integration passes, four expected skips. Combined format/lint/check shell exited 143 after complete passing summaries; standalone full check exits 0 (`/tmp/2375-check-final.log`).
- Public mode ON, VM private; no paid calls or generation changes. Next: metrics sample ≥11:39 UTC; scheduled public-reader acceptance and separate editorial review at 15:00 UTC.
