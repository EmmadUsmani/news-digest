# Progress

Older entries: [earlier Nov 15](docs/progress-archive/2026-11-15-before-2346.md), [iterations 2339–2347](docs/progress-archive/2026-11-15-2339-2347.md).

Archived: [iterations 2348–2354](docs/progress-archive/2026-11-15-2348-2354.md).

Archived: [iterations 2355–2360](docs/progress-archive/2026-11-15-2355-2360.md).

Archived: [iterations 2361–2367](docs/progress-archive/2026-11-15-2361-2367.md).

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

## 2026-11-15: iteration 2376 — enlarge desktop contents targets

- Clean main at d2355f50; no inherited work. Alerts zero; health confirms database/Redis healthy. Public source-health read reports all 38 sources hold content with no errors.
- Owner-visible weakness: desktop contents topic/story/post links had 32px targets, making adjacent entries harder to select. All contents links now have at least 44px height, matching mobile.
- `pnpm exec tsx scripts/smoke-reader-contents-controls.ts` passes 1440/390/320px light/dark: all contents targets, keyboard focus, archive navigation and no page errors. Six screenshots updated; desktop light inspected (`/tmp/2376-browser.log`).
- Browser verification captures and validates the published latest/history once, then replays that real content across variants. Initial startup probe raced API restart; following loopback read stalled on loading. Capture-based run passes without repeated edition queries.
- Public `VITE_PUBLIC_MODE=1 pnpm build` passes; API restarted and health passes. No generation, budget, provider or sharing changes; public mode ON and VM private.
- Verification: `pnpm format`, `pnpm lint:fix`, targeted final lint/format and `git diff --check` pass. Initial full check caught script import order during editing; autofixed, then full `pnpm check` exits 0: 1,040 unit/329 integration pass, four expected skips (`/tmp/2376-check-final.log`).
- Next: passive metrics sample ≥11:39 UTC; public-mode scheduled publication/access gate and separate editorial review at 15:00 UTC.

## 2026-11-15: iteration 2377 — repair public-mode saved-post link check

- Clean main at 20459ad9; no inherited work. Alerts zero; health confirms database/Redis healthy.
- Actual breakage: `pnpm exec tsx scripts/smoke-saved-post-links.ts` fails parsing an empty response. Unidentified loopback requests receive empty 429 in public mode; the script also required a historical Patch notes post absent from the current edition.
- Fixed trusted loopback visitor metadata, bounded/status-checked publication capture and selection of a currently published Bluesky source link. Replay that captured real edition across browser variants; no fixture labelled live.
- Owner benefit: the saved-post source-link regression check works again after public activation and edition turnover, protecting direct access to underlying reporting. No reader UI or generation change.
- Browser check passes desktop/mobile light/dark: source destination, excerpt/publication dates, reload, legacy undated saves, readable link type and no overflow/errors. Four screenshots refreshed; mobile light inspected (`/tmp/2377-{before,browser}.log`). GET-only; external traffic blocked; saves are browser-local.
- Public `VITE_PUBLIC_MODE=1 pnpm build` passes; API restarted and health recovered. Public mode ON, VM private; no paid calls, budget or provider changes.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips (`/tmp/2377-{format,lint-final,check}.log`). First concurrent lint-fix process exited 143; explicit rerun exits 0. Archived iterations 2361–2367 to keep this file small.
- Next: metrics sample ≥11:39 UTC; scheduled public-reader/private-route gate and separate editorial review at 15:00 UTC. World pilot remains OFF pending public-mode scheduled acceptance.

## 2026-11-15: iteration 2378 — due natural compaction follow-up

- Clean main at cb2d60c8; no inherited work. `pnpm obs alerts`: zero alerts; `/healthz`: database/Redis healthy. API/worker active.
- Due recovery evidence: `pnpm exec tsx scripts/sample-metrics-recovery.ts 6 30` passes at 11:39:11–11:42:13 UTC: 24 fresh healthy rules, 14 uncached probes ≤1.310 s; five small merges/152,821 rows, no big merge. Receipt `/tmp/2378-metrics.jsonl`.
- Compared with 10:38 receipt: 62 small merges/5,072,637 rows; volume across many merges does not prove a comparable individual compaction. No new evaluator failures/misses, admission hits, queue timeouts or slow queries; process starts unchanged. Retain 2% CPU trial, zero metrics restarts.
- Journal check: user metrics/alerts warning journal empty since 10:38; system metrics journal has one 11:30 API scrape refusal during the previous iteration's restart. Current app/metrics probes pass; no new runtime change warranted.
- Owner value: preserves the natural-compaction recovery decision using new due evidence without forced work or limit changes. Recovery remains open; next passive sample ≥12:43 UTC.
- Disk 77%; cleanup already performed today in 2339, so no further deletion. Public mode ON, VM private; no paid calls or generation/config changes. Services not restarted under STEERING 22.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips (`/tmp/2378-{format,lint,check}.log`). Documentation-only; no build or restart needed. Next: 15:00 UTC scheduled publication/access gate and separate editorial review.

## 2026-11-15: iteration 2379 — readable narrow archive pagination

- Clean main at da511383; no inherited work. Alerts zero; `/healthz` database/Redis healthy; public source-health reports all 38 sources with stored content and no errors.
- Reproduced reader weakness: both archive direction labels wrap at 320px when a middle page has newer and older editions. Page number now occupies its own small-screen row, preserving single-line labels and 44px targets.
- Added `pnpm exec tsx scripts/smoke-reader-archive-pagination.ts`: captures real published history and simulates middle-page pagination locally; GET-only, external requests blocked. Before fix fails on wrapped labels; after fix all 1440/390/320px light/dark variants pass with no overflow/page errors (`/tmp/2379-browser.log`).
- Six screenshots saved; narrow light inspected. Archived older task completion markers to keep TASKS.md small. No handbook change needed for layout correction.
- Public `VITE_PUBLIC_MODE=1 pnpm build` passes; API restarted; health recovered. Public mode ON, VM private; no generation, provider, budget or sharing changes.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check`, final targeted formatting and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips (`/tmp/2379-check-final.log`). First check terminated 143 during unit tests with no failure; fresh PTY rerun exits 0.
- Next: passive metrics sample ≥12:43 UTC; 15:00 UTC scheduled publication/access gate and separate editorial review. No generation changes after noon; no deploys 13:00–16:00 UTC.

## 2026-11-15: iteration 2380 — escape empty archive pages

- Clean main at 9d65be01; no inherited work. Alerts zero; health database/Redis healthy; source-health reports all 38 sources with stored content and no errors.
- Reader weakness: an out-of-range archive URL (page 999) shows no editions and only steps back one page, making recovery needlessly slow. Added a direct newest-editions link on empty pages after page one.
- `pnpm exec tsx scripts/smoke-reader-archive-empty.ts` fails before the fix (missing link), then passes all 1440/390/320px light/dark variants: keyboard activation, page-one real saved history, heading focus, 44px target, no overflow/errors. Empty page is simulated locally; real saved history is captured read-only, external requests blocked.
- Six screenshots saved; narrow light inspected. No generation, budget, provider, sharing or handbook behavior change. Public mode ON; VM private.
- Public `VITE_PUBLIC_MODE=1 pnpm build` passes; API restarted; `/healthz` healthy. Verification logs: `/tmp/2380-{before,browser,build,format,lint,check}.log`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips.
- Next: passive metrics sample ≥12:43 UTC; 15:00 scheduled publication/access gate and separate editorial review. No generation changes after noon; no deploys 13:00–16:00 UTC.

## 2026-11-15: iteration 2381 — navigation with enlarged text

- Clean main at 9601bba9; no inherited work. Alerts zero; health database/Redis healthy; all 38 sources have stored content and no errors.
- Reproduced horizontal overflow at 320px/200% text: archive 336px, saved-items 435px. Header rows now wrap; saved header grows with its controls, navigation groups wrap, and the empty-state edition link can break across lines.
- `pnpm exec tsx scripts/smoke-reader-enlarged-navigation.ts`: fails before fix, then passes all 1440/390/320px light/dark variants, including real saved history, keyboard route navigation, visible 44px targets and no horizontal overflow. External requests blocked; GET/HEAD only.
- Twelve header screenshots saved; narrow saved light inspected. Default-text layout also checked across both routes/six variants with a read-only Playwright probe.
- Existing `smoke-reader-theme-target.ts` cannot parse its initial history response in public mode (no visitor admission header); used the public-compatible probe above instead. No source/generation/budget/provider/sharing changes.
- Public `VITE_PUBLIC_MODE=1 pnpm build` passes; API restarted; health recovered. Public mode ON, VM private. No handbook change needed for this layout fix.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Logs `/tmp/2381-{before,browser,build,format,lint,check}.log`.
- Next: passive metrics sample ≥12:43 UTC; scheduled publication/access gate and separate editorial review at 15:00 UTC. No generation changes after noon; no deploys 13:00–16:00 UTC.

## 2026-11-15: iteration 2382 — repair public-mode theme smoke

- Clean main at 87df4c8e; no inherited work. Alerts zero; database/Redis healthy; all 38 sources have stored content and no reported errors.
- Reproduced open tooling breakage: theme smoke's initial history read fails JSON parsing because public mode requires visitor admission. Added the existing loopback visitor header to history and browser requests, plus an explicit history HTTP-status assertion.
- `pnpm exec tsx scripts/smoke-reader-theme-target.ts` now passes all six viewport/theme variants across four reader routes; keyboard toggle/focus, 44px targets, persistence and overflow checks pass. GET/HEAD only, external traffic blocked; real saved editions used.
- Refreshed six screenshots; 320px light inspected. No app access policy, generation, source, spend, provider or sharing changes; no handbook change needed.
- `pnpm format`, `pnpm lint:fix`, public `VITE_PUBLIC_MODE=1 pnpm build` and `git diff --check` pass. API restarted before blackout; health recovered.
- Initial full check terminated 143 during lint without an assertion failure; PTY rerun passes: 1,040 unit and 329 integration tests, four expected skips (`/tmp/2382-check-final.log`). Browser/build/format/lint receipts: `/tmp/2382-*.log`.
- Next: passive metrics sample ≥12:43 UTC; scheduled publication/access gate and separate editorial review at 15:00 UTC. No generation changes after noon; no deploys/restarts 13:00–16:00 UTC.
