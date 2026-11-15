# Progress

Older entries: [earlier Nov 15](docs/progress-archive/2026-11-15-before-2346.md), [iterations 2339–2347](docs/progress-archive/2026-11-15-2339-2347.md).

Archived: [iterations 2348–2354](docs/progress-archive/2026-11-15-2348-2354.md).

Archived: [iterations 2355–2360](docs/progress-archive/2026-11-15-2355-2360.md).

Archived: [iterations 2361–2367](docs/progress-archive/2026-11-15-2361-2367.md).

Archived: [iterations 2368–2377](docs/progress-archive/2026-11-15-2368-2377.md).

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

## 2026-11-15: iteration 2383 — due natural compaction evidence

- Clean main at 441853c8; no inherited work. Alerts zero; health database/Redis healthy; all 38 sources healthy with stored content. API/worker active; digest queue has no failed jobs and next scheduled run is 15:00 UTC.
- Owner value: tests natural metrics recovery without forced compaction or cap changes, preserving capacity for the scheduled edition.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 6 30`: 12:43–12:46 UTC, 24 healthy rules, 14 uncached queries ≤1.566 s; 3 small merges/132,484 rows, no big merge. No new evaluator failures/misses, admission hits/timeouts/slow queries; process starts unchanged. Receipt `/tmp/2383-metrics.jsonl`.
- Since 11:42: 56 small merges/1,587,353 rows before this sample; no comparable individual compaction established. Keep CPU-only 2% trial; next passive sample ≥13:47 UTC.
- System metrics/alerts warning journal and app error journal empty since 11:42:13 UTC. No provider calls, source/generation/config changes or sharing changes. Public mode ON; VM private.
- Archived ten progress entries (2368–2377), preserving their text; ten-entry count and archive link verified. Condensed completed/open task descriptions for cheaper orientation.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Receipts `/tmp/2383-{check,format,lint}.log`. Documentation-only; no build or restart under STEERING 22.
- Next: 15:00 scheduled publication/access gate and separate editorial recovery review; no deploys/restarts 13:00–16:00 UTC. Disk 77%; daily scratch cleanup already done, no further deletion.

## 2026-11-15: iteration 2384 — keep enlarged saved actions inside cards

- Clean main at ed371755; no inherited work. Alerts zero; database/Redis healthy; all 38 sources returning content. Scheduled digest has no failed jobs; next run 15:00 UTC.
- Owner value: readers using enlarged text can view an item's edition or remove it without controls spilling into the card padding.
- Reproduced on a real published story at 320px/200% text; fixed saved-card action row with flex wrapping. No generation, source, spend, provider or sharing changes.
- `pnpm exec tsx scripts/smoke-reader-saved-actions.ts`: fails before fix at 320px; passes six 1440/390/320px light/dark variants afterward. Checks padded bounds, 44px controls, keyboard order and removal focus; GET/HEAD only, browser-local bookmarks. Six screenshots saved; 320px light inspected.
- Public web/API build passes; API restarted at 12:51 UTC before blackout; health recovered. No handbook change needed for this layout fix.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Initial check terminated 143 during formatting; persistent-terminal rerun succeeds. Receipts `/tmp/2384-*.log` (full check: `check-final`).
- Next: 15:00 publication/access gate and separate editorial recovery review; passive metrics sample ≥13:47 UTC. No deploys/restarts 13:00–16:00 UTC.

## 2026-11-15: iteration 2385 — restore publication-date browser verification

- Clean main at 4faddb7d; no inherited work. Alerts zero; health database/Redis healthy; all 38 sources healthy. Digest queue has zero failures and next scheduled run at 15:00 UTC.
- Reproduced tooling breakage: publication-date smoke fails JSON parsing before opening a browser because public mode requires visitor admission. Added the loopback visitor header to latest-edition and browser requests, plus an explicit HTTP-status assertion.
- `pnpm exec tsx scripts/smoke-reader-publication-dates.ts` passes four desktop/mobile light/dark variants on the actual published edition: relative time, 24-hour calendar boundary, accessible timestamps, overflow and browser-error checks. GET/HEAD only; external requests blocked. Four screenshots refreshed; mobile light inspected.
- No app/runtime code, generation, source, spend, provider or sharing changes; no handbook update or service restart needed. Freeze preserved.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Receipts: `/tmp/2385-{before,browser,format,lint,check}.log`.
- Next: passive metrics sample ≥13:47 UTC; scheduled publication/access gate and separate editorial review at 15:00 UTC. No deploys/restarts 13:00–16:00 UTC.

## 2026-11-15: iteration 2386 — restore date-navigation browser verification

- Clean main at 25d70d56; no inherited work. Alerts zero; database/Redis healthy; all 38 sources healthy. API/worker active; digest queue has zero failures and next run at 15:00 UTC.
- Reproduced existing browser-check breakage: date navigation smoke times out waiting for the older-edition link because requests lack public-mode visitor admission. Added the loopback visitor header to browser requests, granting no account identity.
- `pnpm exec tsx scripts/smoke-reader-date-targets.ts` now passes six 1440/390/320px light/dark variants: older/newer navigation, archive entry, 44px targets, keyboard focus, overflow and browser errors. GET/HEAD only; external requests blocked. Six screenshots refreshed; 320px light inspected.
- No runtime, generation, source, provider, spend or sharing changes. No handbook update, build or service restart needed; deployment freeze preserved.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Receipts `/tmp/2386-{before,browser,format,lint,check}.log`.
- Next: passive metrics sample ≥13:47 UTC; scheduled publication/access gate and separate editorial recovery review at 15:00 UTC. No deploys/restarts 13:00–16:00 UTC.

## 2026-11-15: iteration 2387 — restore public-mode post-context browser checks

- Clean main at 33f56f05; no inherited work. Alerts zero; health database/Redis healthy; API/worker active; all 38 sources healthy. Digest queue has zero failures and next run at 15:00 UTC.
- Reproduced browser-tooling breakage: post-context smoke receives HTTP 429 before reaching its assertions because public-mode visitor admission is missing. Added the loopback visitor header to browser and API requests, granting no identity.
- `pnpm exec tsx scripts/smoke-reader-context-targets.ts` passes six 1440/390/320px light/dark variants against nine actual published notes: source-context agreement, 44px controls, keyboard toggle/focus, touch expansion, overflow and browser errors. GET/HEAD only; external requests blocked. Six screenshots refreshed; 320px light inspected.
- No runtime, generation, source, provider, spend or sharing changes. No handbook update, build or service restart needed; deployment freeze preserved.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Receipts `/tmp/2387-{before,browser,format,lint,check}.log`.
- Next: passive metrics sample ≥13:47 UTC; scheduled publication/access gate and separate editorial recovery review at 15:00 UTC. No deploys/restarts 13:00–16:00 UTC.

## 2026-11-15: iteration 2388 — restore primary-source destination replay

- Clean main at 245087ae; no inherited work. Alerts zero; health database/Redis healthy; API/worker active; all 38 sources healthy. Digest queue has zero failures and next scheduled run at 15:00 UTC.
- Reproduced browser-tooling breakage: primary-source replay fails JSON parsing before opening the browser because public-mode visitor admission is missing. Added the loopback visitor header to API/browser requests and an explicit HTTP-status assertion; grants no identity.
- `pnpm exec tsx scripts/smoke-reader-primary-source.ts` passes desktop/mobile light/dark: primary publisher points to the primary report despite reordered coverage, other publisher points to its report, all three coverage destinations remain intact, no card overflow or browser errors. Existing synthetic coverage replay on a saved edition; GET only, external traffic blocked, no writes.
- Four synthetic-replay screenshots refreshed; mobile light inspected. No runtime, generation, source, provider, spend or sharing changes; no handbook update, build or restart needed. Deployment freeze preserved.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Initial nonpersistent lint process terminated 143; persistent-terminal rerun succeeds. Receipts `/tmp/2388-{before,browser,format,lint,check}.log`.
- Next: passive metrics sample ≥13:47 UTC; scheduled publication/access gate and separate editorial recovery review at 15:00 UTC. No deploys/restarts 13:00–16:00 UTC.

## 2026-11-15: iteration 2389 — passive metrics recovery follow-up

- Clean main at 7d39e17f; no inherited work. `pnpm obs alerts` reports zero; `/healthz` database/Redis healthy; API/worker active. `pnpm obs sources --check` passes all 38 sources; `pnpm obs jobs --check` passes, digest failures zero, next edition 15:00 UTC.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` at 13:47:09–39 UTC: 24 fresh healthy rules, four uncached queries ≤1.273 s; no new evaluator errors/missed iterations, admission hits, queue timeouts or slow queries. Both process starts unchanged.
- One small merge/16,413 rows during sample; 57 small merges/1,489,036 rows since previous sample, no big merge. Below comparable-merge threshold; recovery acceptance stays open. Warning-level metrics/alerts user journal since 12:46 UTC has no entries.
- Read-only evidence only; no runtime, generation, source, provider, spend or sharing changes. No build/restart needed; 13:00–16:00 freeze preserved. Receipts: `/tmp/2389-{metrics.jsonl,sources.log,jobs.log}`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `git diff --check` pass: 1,040 unit/329 integration passes, four expected skips. Check receipts: `/tmp/2389-{format,lint,check}.log`.
- Next: passive sample ≥14:48 UTC; scheduled public-mode publication/access gate and separate editorial recovery review at 15:00 UTC.
