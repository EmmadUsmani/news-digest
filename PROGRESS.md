# Progress

[Earlier entries](docs/progress-archive/2026-11-17-progress-before-2575.md).

[Iterations 2575–2582](docs/progress-archive/2026-11-17-iterations-2575-2582.md)

[Iterations 2583–2590](docs/progress-archive/2026-11-17-iterations-2583-2590.md)

[Iterations 2591–2597](docs/progress-archive/2026-11-17-iterations-2591-2597.md)

[Iterations 2598–2603](docs/progress-archive/2026-11-17-iterations-2598-2603.md)

## 2026-11-17: iteration 2604 — compact publisher targets with enlarged text

- Clean main at 1a209d67; no inherited work. Alerts clear, all 14 monitored services healthy, active sources healthy (Destructoid paused), health database/Redis true; digest queue zero failures, next edition 15:00 UTC.
- Reader weakness / STEERING 38/42: publisher and coverage links used rem-based minimum targets that grew to 132px at 300%. Fixed 44px minimum targets and 8px coverage-title padding preserve enlarged labels and natural wrapping. The owner sees less empty space around publisher links; tested desktop link now 48px tall at 300%.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2604-verify.cjs. Browser passes 12 combinations (320/1440px, 100–300%, both themes): real published sources, enlarged fonts, minimum targets, keyboard coverage disclosure/focus and no horizontal overflow. Screenshots docs/screenshots/2604-story-sources-{light,dark}.png.
- Initial browser probe timed out because its anonymous requests lacked the separate test-client header used by prior browser checks; rerun with isolated client headers passes. Receipts /tmp/2604-{format,lint,build,browser,check}.log.
- Full pnpm check exit 0: 1,062 unit / 329 integration passes, four expected skips; git diff --check passes. Web published atomically; no service restart under STEERING 22. No source, generation, budget or handbook behavior changed.
- Next: metrics ≥09:55 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid remains paused pending documented publisher access.

## 2026-11-17: iteration 2605 — compact social bylines with enlarged text

- Clean main at c756e370; no inherited edits. Alerts clear; health database/Redis true, all monitored services active, active sources healthy (Destructoid paused); digest queue zero failures, next edition 15:00 UTC.
- Reader weakness / STEERING 38/42: X and Bluesky author/timestamp links inherited 132px minimum height at 300% text. Fixed 44px minimum targets preserve enlarged labels/wrapping; first live author link now 48px tall. Readers reach post text sooner.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2605-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2605-{format,lint,build,browser,check}.log.
- Browser passes 12 combinations (320/1440px, 100–300%, both themes), checking all live social byline links, enlarged fonts, keyboard focus and no horizontal overflow. Screenshots docs/screenshots/2605-social-byline-{light,dark}.png. Initial probe hit the previous bundle before deployment; rerun passes.
- Full pnpm check exit 0: 1,062 unit / 329 integration passes, four expected skips. Web published atomically; no service restart under STEERING 22. No source/generation/budget/handbook behavior changes. Archived progress iterations 2591–2597 to keep this file small.
- Next: metrics ≥09:55 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2606 — compact X fallback controls with enlarged text

- Clean main at 7a17a681; no inherited work. Alerts clear; services/active sources checks pass (Destructoid paused), health database/Redis true, digest queue zero failures and next edition 15:00 UTC.
- Reader weakness / STEERING 38/42: X media fallback controls inherited a 132px minimum height at 300% text. Fixed 44px minimum targets and pixel padding/gaps preserve enlarged labels and wrapping. The owner reaches subsequent posts sooner; desktop original link is now 56px tall, mobile 104px with two-line wrapping.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2606-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2606-{format,lint,build,browser,check}.log.
- Browser passes 12 combinations (320/1440px, 100–300%, both themes), checking real published post text, 44px targets, enlarged fonts, original URLs, keyboard focus/retry, saved-text retention and no horizontal overflow. External media deliberately blocked to exercise fallback; no provider calls. Separate simulated successful-embed check passes enlarged saved-text disclosure and keyboard opening (44px minimum / 8px padding / 48px text). Screenshots docs/screenshots/2606-x-fallback-{light,dark}.png.
- Initial browser probes preceded deployment and scrolled to the card rather than the lazy embed; final probe targets the embed and passes against the deployed bundle.
- Full pnpm check exit 0: 1,062 unit / 329 integration passes, four expected skips; git diff --check passes. Archived completed task markers before 2600 to keep the task list small.
- Web published atomically; no service restart under STEERING 22. No source/generation/budget/handbook behavior changes.
- Next: metrics ≥09:55 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2607 — compact saved-list links with enlarged text

- Clean main at 9d3cf4f9; no inherited work. Alerts clear, all 14 monitored services healthy, active sources healthy (Destructoid paused), health database/Redis true; digest queue zero failures, next edition 15:00 UTC.
- Reader weakness / STEERING 38/42: saved-title, continuation and empty-list browse links inherited 132px minimum targets at 300% text. Fixed 44px minimum targets preserve enlarged labels and natural wrapping. Readers get less blank space; desktop browse link now 60px tall at 300%.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2607-verify.cjs; pnpm check; pnpm test:integration; git diff --check. Receipts /tmp/2607-{format,lint,build,browser,check,integration}.log.
- Browser passes 12 combinations (320/1440px, 100–300%, both themes): saving a real published story, saved title/URL, enlarged fonts, 44px minimum targets, keyboard focus, removal, empty-list return and no horizontal overflow. Screenshots docs/screenshots/2607-saved-{links,empty}-{light,dark}.png; light saved-title/dark empty-list images inspected.
- Full check passed typecheck/lint/format/boundaries and 1,062 unit tests, then exited 143 during integration without reported assertion failure; isolated integration rerun exit 0: 329 passes / four expected skips.
- Web published atomically; no service restart under STEERING 22. No source/generation/budget/handbook behavior changes.
- Next: metrics ≥09:55 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2608 — hourly metrics recovery evidence

- Clean main at 3f62b7d0; no inherited edits. Alerts clear; all 14 monitored services and active sources healthy (Destructoid paused); health database/Redis true; digest generation zero failures, next edition 15:00 UTC.
- Owner benefit / STEERING 44/49: verified that the previous checkpoint's admission-limit increase did not recur, preserving monitoring capacity while protecting the next edition. No production limits, source configuration or generation behavior changed.
- Due checkpoint: five samples through 09:55:02 UTC; 24 healthy/fresh rules, ten uncached queries ≤1.234 s. No new admission-limit/timeouts/slow queries/evaluator failures/process changes. Small merges +62 / 2,127,345 rows; big merges unchanged.
- Memory-high +690 since 08:50:50 (+55 during sampling), max/OOM/kill zero; ending memory 89,296,896 bytes, lifetime peak 92,995,584; disk 65%, NRestarts=0 and no unit journal entries. Retain 2% CPU / 88 MiB high / 112 MiB max; resource acceptance remains open.
- Evidence: pnpm exec tsx scripts/sample-metrics-recovery.ts 2 60; final 1 1 sample; python3 /tmp/2608-summarize.py. Receipts /tmp/2608-{metrics.jsonl,metrics-error.log,summary.json,metrics-journal.log}. Updated decision 0004 and TASKS checkpoint.
- Verification: pnpm format; pnpm lint:fix; pnpm check exit 0 (1,062 unit / 329 integration passes, four expected skips); pnpm exec tsx scripts/check-handbook.ts observability (19 pages / one diagram / 39 tables); focused Prettier and git diff --check pass. Receipts /tmp/2608-{format,lint,check,handbook,doc-format,alerts}.log. Documentation-only change; no rebuild or restart under STEERING 22.
- Next: metrics ≥11:00 UTC; natural edition/Tech/social acceptance after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2609 — compact Topics preference button

- Clean main at 73801e96; no inherited work. Alerts clear; monitored services/active sources pass (Destructoid paused); health database/Redis true, generation queue zero failures and next edition 15:00 UTC.
- Reader weakness / STEERING 38/42: Topics button inherited a 132px minimum height at 300% text. Fixed 44px minimum target and pixel padding let it follow the enlarged label; now 80px at 300%, reducing blank space before the edition.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2609-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2609-{format,lint,build,browser,check,alerts}.log.
- Browser passes all 12 combinations (320/1440px, 100–300%, both themes): real published topics, enlarged text, minimum target, keyboard hide/restore, focus return and no horizontal overflow. Screenshots docs/screenshots/2609-topics-{light,dark}.png; light inspected. Initial probe hit local API rate limiting; final probe uses separate test client addresses and passes.
- Full pnpm check exit 0: 1,062 unit / 329 integration passes, four expected skips; git diff --check passes.
- Web published atomically; no service restart under STEERING 22. No source/generation/budget/handbook behavior changes.
- Next: metrics ≥11:00 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2610 — compact archive recovery control

- Clean main at 7a47e9eb; no inherited edits. Alerts clear, monitored services and active sources healthy (Destructoid paused), health database/Redis true; digest-generation queue zero failures, next edition 15:00 UTC.
- Reader benefit / STEERING 38/42: archive retry inherited a 108px fixed height at 300% text. Natural height with pixel padding retains a 44px minimum target and enlarged label, reducing it to 80px.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2610-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2610-{format,lint,build,browser,check,services}.log.
- Browser passes 12 combinations (320/1440px, 100–300%, both themes): simulated archive HTTP failure, enlarged labels, 44px minimum, keyboard retry, recovery to real published history, heading focus and no horizontal overflow. Screenshots docs/screenshots/2610-archive-retry-{light,dark}.png; light inspected. Initial probe before deployment reproduced the old excessive height; post-deploy checks pass.
- Full pnpm check exit 0: 1,062 unit / 329 integration passes, four expected skips; final health and alerts pass, git diff --check clean.
- Web published atomically; no service restart under STEERING 22. No source/generation/budget/handbook behavior changes.
- Next: metrics ≥11:00 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2611 — readable edition recovery at enlarged text

- Clean main at 6530fb84; no inherited work. Alerts clear, health database/Redis true, monitored services/active sources healthy (Destructoid paused); generation zero failures, next edition 15:00 UTC.
- Reader benefit / STEERING 38/42: edition retry used a 132px minimum at 300% text and an unwrapped long label. Both initial-load and saved-edition refresh controls now wrap within the viewport, fit their text and retain a 44px minimum target; desktop 300% height is 80px.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2611-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2611-{format,lint,build,browser,check,services,sources,jobs}.log.
- Browser passes all 12 combinations (320/1440px, 100–300%, both themes): simulated malformed API response, full enlarged labels within the button, no horizontal overflow, keyboard retry to real published topics and restored heading focus. Screenshots docs/screenshots/2611-edition-retry-{light,dark}.png; light inspected. Pre-deploy probe reproduced the inflated minimum at 200%.
- Full pnpm check exit 0: 1,062 unit / 329 integration passes, four expected skips; final health and alerts pass, git diff --check clean.
- Web published atomically; no service restart under STEERING 22. No source/generation/budget/handbook behavior changes.
- Next: metrics ≥11:00 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2612 — keep privacy readable with enlarged text

- Clean main at af17f37f; no inherited work. Alerts clear; services/active sources healthy (Destructoid paused), database/Redis true; generation zero failures, next edition 15:00 UTC.
- Reader weakness / STEERING 38/42: at 320px/300%, privacy margins expanded to 60px and pushed the title to 513px. Fixed spacing preserves text enlargement, widens content from 200px to 280px and brings the title to 313px; minimum link targets remain 44px.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2612-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2612-{format,lint,build,browser,check,services,sources,alerts}.log.
- Browser passes 12 combinations (320/1440px, 100–300%, both themes): enlarged text, fixed margins, no horizontal overflow, all privacy sections reachable and keyboard return to real published topics. Screenshots docs/screenshots/2612-privacy-{light,dark}.png; light inspected. Initial probes preceded deployment and then used an overly tight height expectation; final checks use measured layout bounds.
- Full check completed typecheck/lint/format/boundaries and 1,062 unit passes, then exited 143 after integration cases before summary. Separate pnpm test:integration exits 0: 329 passes/four expected skips; coverage completes. Final health/alerts and git diff --check pass.
- Web published atomically; no service restart under STEERING 22. No source/generation/budget/handbook behavior changes. Archived iterations 2598–2603 to keep this file small.
- Next: metrics ≥11:00 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2613 — give enlarged contents more usable height

- Clean main at e4e17eff; no inherited edits. Alerts clear, health database/Redis true, services and active sources healthy; Destructoid remains paused. Generation queue zero failures, next edition 15:00 UTC.
- Reader benefit / STEERING 38/42: desktop contents lost navigation space as text-relative sticky offsets grew. Fixed 16px top gap / 32px vertical allowance preserve enlarged labels and add 64px usable height at 300% text (615px → 679px at 1440×844).
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2613-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2613-{format,lint,build,browser,check,services}.log.
- Browser passes 18 combinations (320/768/1440px, 100–300%, both themes): enlarged labels, minimum 44px targets, keyboard navigation to real published stories, mobile dialog focus return, no horizontal overflow and fixed desktop sticky offsets. Initial pre-deploy assertion reproduced the growing gap at 200%; an earlier unfiltered browser probe timed out.
- Screenshots docs/screenshots/2613-contents-{light,dark}.png show the sticky panel at 300% text. Web published atomically; no service restart under STEERING 22. No source/generation/budget/handbook behavior changes.
- Full check passed static checks, then exited 143 during unit tests without a reported failure. Separate pnpm test:unit and pnpm test:integration exit 0: 1,062 unit / 329 integration passes, four expected skips; final format/lint, health/alerts and diff checks pass. Light screenshot inspected.
- Next: metrics ≥11:00 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2614 — keep archive pagination close at enlarged text

- Clean main at 3e5ef7c2; no inherited edits. Alerts clear, health database/Redis true, monitored services/active sources pass (Destructoid paused); digest-generation check passes.
- Reader benefit / STEERING 38/42: archive pagination used text-relative margins/gaps, adding blank scrolling with enlarged text. Fixed 32px top margin / 12px gap save 64px before controls at 300%, preserving enlarged labels and minimum 44px targets.
- Browser passes 12 combinations (320/1440px, 100–300%, both themes): fixed margins/gaps, enlarged labels, no horizontal overflow, keyboard navigation from empty page 2 to real saved page-1 dates and restored heading focus. Initial probe incorrectly expected dates on empty page 2; corrected to its actual recovery flow.
- Screenshots docs/screenshots/2614-archive-pages-{light,dark}.png; light inspected. Web rebuilt and published atomically; no service restart under STEERING 22. No source/generation/budget/handbook behavior changes.
- Due metrics checkpoint: 24 healthy rules/six uncached queries ≤0.769s; unchanged failure/process counters, +59 small merges/+757 memory-high events, no big merge/OOM. Retain limits; next ≥12:05 UTC. Evidence in docs/decisions/0004-observability-capacity.md.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2614-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2614-{format,lint,build,browser,check,services,sources,jobs,alerts-final}.log.
- Full pnpm check exits 0: static checks, 1,062 unit / 329 integration passes, four expected skips. Final health/alerts and git diff --check pass.
- Next: natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.
