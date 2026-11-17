# Progress

[Earlier entries](docs/progress-archive/2026-11-17-progress-before-2575.md).

[Iterations 2575–2582](docs/progress-archive/2026-11-17-iterations-2575-2582.md)

[Iterations 2583–2590](docs/progress-archive/2026-11-17-iterations-2583-2590.md)

[Iterations 2591–2597](docs/progress-archive/2026-11-17-iterations-2591-2597.md)

## 2026-11-17: iteration 2598 — compact saved-page spacing with enlarged text

- Clean main at a38ba0c9; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; digest-generation zero failed jobs, next edition 15:00 UTC. Metrics checkpoint not due until ≥07:45 UTC at orientation.
- Reader weakness / STEERING 38/42: saved heading/sync spacing and gaps between cards enlarged with reader text. Fixed 32px heading margin, 8px heading-row gap, 16px sync margins and 24px card gaps preserve enlarged type. Owner-visible benefit: at 300%, 128px less spacing above the saved list and 48px less between cards.
- Before-change browser assertion reproduced 64px heading margin at 200%. node /tmp/2598-verify.cjs passes 18 combinations (320/390/1440px, 100–300%, both themes): fixed spacing, two real saved stories, enlarged titles, no horizontal overflow, theme/archive/home keyboard navigation and removal to empty state. Both docs/screenshots/2598-saved-spacing images inspected.
- Initial two-card probe needed first() for the removal wait; corrected the probe and reran all combinations. First pnpm check terminated with exit 143 during unit tests without a reported failure; full retry passed. Archived iterations 2583–2590 to keep PROGRESS.md under 25 KB.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2598-verify.cjs; git diff --check. pnpm check retry exit 0 (1,062 unit / 329 integration passes, four expected skips); handbook check passes (19 pages/21 diagrams/39 tables). Receipts /tmp/2598-{format,lint,build,browser,check-retry,handbook}.log.
- Public /saved HTTPS 200 via public DNS/curl --resolve; local health passes. VM-local DNS resolves to an unreachable proxy address; public DNS succeeds.
- Web published atomically; no service restart under STEERING 22. No generation, source, provider, budget or handbook behavior changes.
- Due metrics checkpoint: three samples 07:44–07:46, 24 healthy rules/six passing queries (≤1.135 s), no new admission-limit/failure events; +835 memory-high events/63 small merges, no big merge. Limits unchanged; acceptance open. Decision 0004/TASKS updated; next ≥08:50 UTC.
- Next: scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2599 — compact archive rows with enlarged text

- Clean main at a17dde37; no inherited work. Alerts clear, local health database/Redis true, all 38 sources healthy; digest-generation zero failed jobs, next edition 15:00 UTC. Metrics next due ≥08:50 UTC.
- Reader weakness / STEERING 38/42: archive link padding enlarged from 40px to 120px combined at 300% text. Fixed 20px top/bottom padding preserves enlarged dates and coverage text. Owner-visible benefit: 80px less scrolling per row; 14 real archive rows shrink from 14,712px to 13,592px at 320px/300%.
- Browser: node /tmp/2599-verify.cjs passes 18 combinations (320/768/1440px, 100–300%, both themes): 14 real edition links, fixed padding, enlarged dates, no horizontal overflow, keyboard opening and return. Pagination assertions are conditional; current archive has one page. Both docs/screenshots/2599-archive-rows images inspected.
- First browser attempt hit local API rate limiting; separate local test client addresses resolved it. First pnpm check ended with exit 143 during unit tests without a reported failure; full retry passed.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2599-verify.cjs; pnpm check retry exit 0 (1,062 unit / 329 integration passes, four expected skips); git diff --check. Receipts /tmp/2599-{format,lint,build,browser,check-retry}.log.
- Public archive HTTPS 200 via public DNS/curl --resolve; local health passes. Web published atomically; no service restart under STEERING 22. Sources, generation, providers and budgets unchanged; no handbook behavior changed.
- Next: metrics ≥08:50 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2600 — compact enlarged-text contents menu

- Clean main at eaa2ff33; no inherited edits. Pending RecentJobFailures was a feed HTTP 429 at 08:04; automatic retry succeeded at 08:05. All 38 sources/14 monitored services healthy, local health passes, digest-generation zero failed jobs and next edition 15:00 UTC. Metrics next due ≥08:50 UTC.
- Reader weakness / STEERING 38/42: contents link minimum heights grew to 132px at 300% text, with padding and gaps adding scrolling. Fixed 44px minimum targets, 4px padding and fixed section spacing preserve 42px labels. At 320px/300%, the real edition's menu shrinks from 4,668px to 4,112px (556px less); desktop also saves 556px.
- Browser: node /tmp/2600-verify.cjs retry passes all 18 combinations (320/768/1440px, 100–300%, both themes): enlarged labels, fixed minimum/padding, no overflow, focused-link visibility, keyboard story navigation and drawer focus return. Initial visibility assertion sampled smooth scrolling too early; retry waits for visibility. Screenshot probe rerun at 320px with first topic focused; both docs/screenshots/2600-contents-spacing images inspected.
- First pnpm check ended with exit 143 during unit tests without a reported failure; full retry exit 0 (1,062 unit / 329 integration passes; four expected skips). Verification receipts /tmp/2600-{format,lint,build,browser-retry,check-retry}.log; pnpm format, pnpm lint:fix, VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py, git diff --check.
- Public HTTPS 200 via public DNS/curl --resolve; local health database/Redis true. Web published atomically; no service restart under STEERING 22. Sources, generation, providers and budgets unchanged; no handbook behavior changed.
- Next: metrics ≥08:50 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2601 — pause access-blocked Destructoid feed

- Clean main at 5de3eeb9; no inherited work. Pending RecentJobFailures exposed a new Destructoid breakage: scheduled HTTP 403 at 08:18/08:19 UTC, last success 07:48 UTC. Health/database/Redis and all 14 monitored services pass; scheduled digest queue has zero failed jobs, next edition 15:00 UTC.
- One direct GET of the configured official feed confirmed Cloudflare HTTP 403 / “Sorry, you have been blocked”. No alternative host, proxy, challenge solver or access workaround attempted.
- Paused Destructoid via existing PostgresTopicRepository.setSourceEnabled; retained all 304 observations and topic connections. Owner-visible benefit: remaining Gaming feeds continue without repeatedly requesting an access-blocked publisher; previously collected stories remain usable.
- Temporary live repository probe asserts disabled source absent from 37-source active catalog, ingest returns without calling either adapter, and observation count unchanged. Initial probe failed before execution because root scripts use CJS; wrapped main and reran successfully, then deleted probe.
- Source snapshot now reports zero unhealthy sources (38 configured, one paused). TASKS, SOURCES and NEEDS_FROM_HUMAN record the access blocker; no immediate owner action needed. Resume only with documented publisher access.
- Verification: pnpm format; pnpm lint:fix; pnpm check exit 0 (1,062 unit / 329 integration passes, four expected skips; receipts /tmp/2601-{format,lint,check}.log); git diff --check. No runtime code/config artifacts changed, so no rebuild or service restart under STEERING 22; live database pause is already effective.
- Next: metrics ≥08:50 UTC; scheduled edition/Tech/social review after 15:00 UTC. Destructoid remains paused pending documented access.

## 2026-11-17: iteration 2602 — reach the first topic sooner with enlarged text

- Clean main at e9dccc29; no inherited work. Alerts clear; health database/Redis true; source snapshot zero unhealthy (Destructoid paused), all 14 monitored services active; digest queue zero failed jobs, next edition 15:00 UTC.
- Reader weakness / STEERING 38/42: blank space before the first topic scaled from 80px to 240px mobile and 40px to 120px desktop at 300% reader text. Fixed spacing preserves enlarged text and saves 160px/80px of blank scrolling before real content.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2602-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2602-{format,lint,build,browser,check}.log.
- Browser checks cover 18 combinations (320/768/1440px, 100–300%, both themes): five real topics, fixed top spacing, no horizontal overflow and keyboard focus on story save control. Screenshots docs/screenshots/2602-edition-spacing-{light,dark}.png.
- First pnpm check ended with exit 143 after integration case 333, without a reported assertion failure; full retry exit 0 (1,062 unit / 329 integration passes, four expected skips); receipt /tmp/2602-check-retry.log. Public HTTPS 200 via public DNS/curl --resolve; local lookup resolves to unreachable private address.
- Web published atomically; no service restart under STEERING 22. No generation/source/budget or handbook behavior changes.
- Next: metrics ≥08:50 UTC; scheduled edition/Tech/social review after 15:00 UTC. Destructoid remains paused pending documented access.

## 2026-11-17: iteration 2603 — due metrics recovery checkpoint

- Clean main at 1a6350ba; no inherited work. Alerts clear; health database/Redis true, services/active sources checks pass (Destructoid remains paused). Digest generation has zero failed jobs, next edition 15:00 UTC. Historical social failed-count remains four; public mode correctly denies private job-state inspection.
- Three read-only samples at 08:49:48–08:50:50 span the due checkpoint: all 24 rules fresh/healthy, six uncached expected-series queries ≤1.175 s. Baseline assertions pass for process-start, timeout, slow-query, evaluator and OOM counters. Admission-limit +1 (23→24); memory-high +769 (zero during sampling), 64 small merges/4,513,669 rows, no big merge.
- Retain CPU 2% / 88 MiB high / 112 MiB max. NRestarts=0, unit journal empty since prior checkpoint; ending memory 85,204,992 bytes, lifetime peak 92,995,584; disk 66%. Acceptance remains open; no restart, force merge or provider calls. TASKS and decision 0004 updated.
- Verification: pnpm exec tsx scripts/sample-metrics-recovery.ts 2 30; python3 /tmp/2603-summarize.py; pnpm obs alerts; pnpm obs services/sources/jobs --check; curl local /healthz; systemctl show; journalctl; df. Receipts /tmp/2603-*; initial summary assertion ran before the third sample, final complete-sample assertions pass.
- First pnpm check: 1,062 unit passes; 328 integration passes / one failure / four expected skips. Aggregate-listener test received administrator connection termination during startup; strengthened readiness to await both fresh Postgres startup messages plus Compose health, matching isolated harness. Focused NEWS_DIGEST_ISOLATED_TEST=1 pnpm exec tsx --test apps/api/test/grafana-export-listener.test.ts passes. No runtime changes; no rebuild/restart needed under STEERING 22. No source/handbook behavior changed.
- Final verification: pnpm format and pnpm lint:fix pass; full pnpm check retry exit 0 (1,062 unit / 329 integration passes, four expected skips), including listener test. Receipts /tmp/2603-{format-retry,lint-retry,check-retry,listener}.log; git diff --check passes.
- Next: metrics ≥09:55 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

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
