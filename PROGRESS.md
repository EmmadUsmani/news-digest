# Progress

[Earlier entries](docs/progress-archive/2026-11-17-progress-before-2575.md).

[Iterations 2575–2582](docs/progress-archive/2026-11-17-iterations-2575-2582.md)

[Iterations 2583–2590](docs/progress-archive/2026-11-17-iterations-2583-2590.md)

[Iterations 2591–2597](docs/progress-archive/2026-11-17-iterations-2591-2597.md)

[Iterations 2598–2603](docs/progress-archive/2026-11-17-iterations-2598-2603.md)

[Iterations 2604–2610](docs/progress-archive/2026-11-17-iterations-2604-2610.md)

## 2026-11-17: iteration 2611 — readable edition recovery at enlarged text

- Clean main at 6530fb84; no inherited work. Alerts clear, health database/Redis true, monitored services/active sources healthy (Destructoid paused); generation zero failures, next edition 15:00 UTC.
- Reader benefit / STEERING 38/42: edition retry used a 132px minimum at 300% text and an unwrapped long label. Both initial-load and saved-edition refresh controls now wrap within the viewport, fit their text and retain a 44px minimum target; desktop 300% height is 80px.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2611-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2611-{format,lint,build,browser,check,services,sources,jobs}.log.
- Browser passes all 12 combinations (320/1440px, 100–300%, both themes): simulated malformed API response, full enlarged labels within the button, no horizontal overflow, keyboard retry to real published topics and restored heading focus. Screenshots docs/screenshots/2611-edition-retry-{light,dark}.png; light inspected. Pre-deploy probe reproduced the inflated minimum at 200%.
- Full pnpm check exit 0: 1,062 unit / 329 integration passes, four expected skips; final health and alerts pass, git diff --check clean.
- Web published atomically; no service restart under STEERING 22. Final health/alerts and diff checks pass. No source/generation/budget/handbook behavior changes.
- Next: metrics ≥11:00 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2612 — keep privacy readable with enlarged text

- Clean main at af17f37f; no inherited work. Alerts clear; services/active sources healthy (Destructoid paused), database/Redis true; generation zero failures, next edition 15:00 UTC.
- Reader weakness / STEERING 38/42: at 320px/300%, privacy margins expanded to 60px and pushed the title to 513px. Fixed spacing preserves text enlargement, widens content from 200px to 280px and brings the title to 313px; minimum link targets remain 44px.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2612-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2612-{format,lint,build,browser,check,services,sources,alerts}.log.
- Browser passes 12 combinations (320/1440px, 100–300%, both themes): enlarged text, fixed margins, no horizontal overflow, all privacy sections reachable and keyboard return to real published topics. Screenshots docs/screenshots/2612-privacy-{light,dark}.png; light inspected. Initial probes preceded deployment and then used an overly tight height expectation; final checks use measured layout bounds.
- Full check completed typecheck/lint/format/boundaries and 1,062 unit passes, then exited 143 after integration cases before summary. Separate pnpm test:integration exits 0: 329 passes/four expected skips; coverage completes. Final health/alerts and git diff --check pass.
- Web published atomically; no service restart under STEERING 22. Final health/alerts and diff checks pass. No source/generation/budget/handbook behavior changes. Archived iterations 2598–2603 to keep this file small.
- Next: metrics ≥11:00 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2613 — give enlarged contents more usable height

- Clean main at e4e17eff; no inherited edits. Alerts clear, health database/Redis true, services and active sources healthy; Destructoid remains paused. Generation queue zero failures, next edition 15:00 UTC.
- Reader benefit / STEERING 38/42: desktop contents lost navigation space as text-relative sticky offsets grew. Fixed 16px top gap / 32px vertical allowance preserve enlarged labels and add 64px usable height at 300% text (615px → 679px at 1440×844).
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2613-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2613-{format,lint,build,browser,check,services}.log.
- Browser passes 18 combinations (320/768/1440px, 100–300%, both themes): enlarged labels, minimum 44px targets, keyboard navigation to real published stories, mobile dialog focus return, no horizontal overflow and fixed desktop sticky offsets. Initial pre-deploy assertion reproduced the growing gap at 200%; an earlier unfiltered browser probe timed out.
- Screenshots docs/screenshots/2613-contents-{light,dark}.png show the sticky panel at 300% text. Web published atomically; no service restart under STEERING 22. Final health/alerts and diff checks pass. No source/generation/budget/handbook behavior changes.
- Full check passed static checks, then exited 143 during unit tests without a reported failure. Separate pnpm test:unit and pnpm test:integration exit 0: 1,062 unit / 329 integration passes, four expected skips; final format/lint, health/alerts and diff checks pass. Light screenshot inspected.
- Next: metrics ≥11:00 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2614 — keep archive pagination close at enlarged text

- Clean main at 3e5ef7c2; no inherited edits. Alerts clear, health database/Redis true, monitored services/active sources pass (Destructoid paused); digest-generation check passes.
- Reader benefit / STEERING 38/42: archive pagination used text-relative margins/gaps, adding blank scrolling with enlarged text. Fixed 32px top margin / 12px gap save 64px before controls at 300%, preserving enlarged labels and minimum 44px targets.
- Browser passes 12 combinations (320/1440px, 100–300%, both themes): fixed margins/gaps, enlarged labels, no horizontal overflow, keyboard navigation from empty page 2 to real saved page-1 dates and restored heading focus. Initial probe incorrectly expected dates on empty page 2; corrected to its actual recovery flow.
- Screenshots docs/screenshots/2614-archive-pages-{light,dark}.png; light inspected. Web rebuilt and published atomically; no service restart under STEERING 22. Final health/alerts and diff checks pass. No source/generation/budget/handbook behavior changes.
- Due metrics checkpoint: 24 healthy rules/six uncached queries ≤0.769s; unchanged failure/process counters, +59 small merges/+757 memory-high events, no big merge/OOM. Retain limits; next ≥12:05 UTC. Evidence in docs/decisions/0004-observability-capacity.md.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2614-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2614-{format,lint,build,browser,check,services,sources,jobs,alerts-final}.log.
- Full pnpm check exits 0: static checks, 1,062 unit / 329 integration passes, four expected skips. Final health/alerts and git diff --check pass.
- Next: natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2615 — keep reader navigation compact with enlarged text

- Clean main at 1e73ced4; no inherited work. Alerts clear; services/active sources healthy (Destructoid paused), health database/Redis true; generation queue zero failures, next edition 15:00 UTC.
- Reader benefit / STEERING 38/42: text-relative minimum link targets inflated sticky header height. Fixed 44px minimums preserve enlarged labels, shrinking the 300% header from 205px to 145px mobile and 133px to 85px desktop; source-reading/footer links use the same minimums.
- Browser passes 12 combinations (320/1440px, 100–300%, both themes): all 25 real story titles enlarge, minimum 44px targets, no horizontal overflow, keyboard Saved items / browse-latest round trip. Previous header measurements restore the original minimums temporarily in the browser.
- Headline-only probe showed no saved height in current wrapped titles, so scope includes visible header/navigation. Initial probes lacked a visitor header and incorrectly scoped Saved items within the header; corrected probes pass.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2615-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2615-{format-final,lint-final,build,browser,check-final,integration,listener-a,listener-b,services,sources,jobs,alerts-final}.log.
- Initial full check passed static checks/1,062 unit tests then exited 143. Separate integration found a fixed Compose network name shared by overlapping runs (328 pass/one fail/four skips); removed the rendered name so each test project gets an isolated network. Two concurrent targeted listener tests pass; fresh full pnpm check exits 0: 1,062 unit / 329 integration passes, four expected skips, coverage complete.
- Screenshots docs/screenshots/2615-reader-navigation-{light,dark}.png; light inspected. Web published atomically; no service restart under STEERING 22. Final health/alerts and diff checks pass. No source/generation/budget/handbook behavior changes.
- Next: metrics ≥12:05 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2616 — keep social-post spacing compact with enlarged text

- Clean main at c66b2f36; no inherited work. Alerts clear; health database/Redis true, monitored services/active sources healthy (Destructoid paused); generation queue zero failures, next edition 15:00 UTC.
- Reader benefit / STEERING 38/42: text-relative social-section margins/padding/gaps added blank scrolling. Fixed spacing saves 120px before the first post at 300% text, 32px per card gap and 16px above each Save button; labels still enlarge.
- Browser passes 12 combinations (320/1440px, 100–300%, both themes): 18 real published posts, fixed section/heading/card/save spacing, enlarged headings, minimum 44px Save targets, keyboard save/remove and no horizontal overflow.
- Screenshots docs/screenshots/2616-post-spacing-{light,dark}.png; light inspected. Corrected screenshot positioning to use instant scrolling after initial smooth-scroll capture showed the card bottom.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2616-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2616-{format,lint,build,browser,check,services,health-final,alerts-final}.log.
- Combined pnpm check passed static checks/1,062 unit tests, then exited 143 near integration completion without a reported failure. Separate pnpm test:integration exits 0: 329 passes/four expected skips, coverage complete; /tmp/2616-integration.log. Final format/lint and diff checks pass.
- Web published atomically; no service restart under STEERING 22. Final health/alerts and diff checks pass. No source/generation/budget/handbook behavior changes.
- Next: metrics ≥12:05 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.
- Push blocker: commit 5f7413b3 verified/deployed locally; git push origin main returns HTTP 403, permission denied to exe-dev-github-integration[bot]. Recorded in NEEDS_FROM_HUMAN.md; no remote/credential changes.
- Push recovered on the next attempt: origin/main now includes 5f7413b3 and 2587c50c. Cleared the temporary owner-action notice; working tree clean after follow-up documentation commit.

## 2026-11-17: iteration 2617 — compact saved-item details with enlarged text

- Clean main at a77d2207; no inherited work. Alerts clear; health database/Redis true; services/active sources healthy (Destructoid paused); generation queue zero failures, next edition 15:00 UTC.
- Reader benefit / STEERING 38/42: saved-item metadata, excerpts, context, continuation links and action gaps grew with text size. Fixed spacing keeps enlarged text readable with less blank scrolling: at 300%, attribution saves 16px, each date gap 8px, each excerpt/context margin 24px and wrapped action gap 32px.
- Browser passes all 12 combinations (320/1440px, 100–300%, both themes) using a real published story: save, enlarged title, fixed spacing, no horizontal overflow, keyboard edition return/removal, 44px Remove target and heading focus after last removal.
- Screenshots docs/screenshots/2617-saved-spacing-{light,dark}.png; light inspected. Adjusted initial screenshot from long title to changed metadata/excerpt spacing.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2617-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2617-{format,lint,build,browser,check,services,sources,jobs}.log.
- Initial combined check exited 143 during unit tests after passing static checks; nohup retry ended before completion. A setsid detached full pnpm check exits 0: 1,062 unit / 329 integration passes, four expected skips, coverage complete; /tmp/2617-check-detached.log.
- Web published atomically; no service restart under STEERING 22. Final health/alerts and diff checks pass. No source/generation/budget/handbook behavior changes.
- Next: metrics checkpoint now due (≥12:05 UTC); natural edition/Tech/social review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2618 — due metrics recovery checkpoint

- Clean main at 139b74c5; no inherited work. Health, services, active sources and jobs checks pass; Destructoid remains paused, alerts clear.
- Three read-only samples at 12:09–12:10 UTC: 24 healthy rules/six uncached queries ≤1.316 s; failure/process counters unchanged, no new admission-limit events.
- Since 11:00 UTC: 68 small merges/1,946,215 rows, no big merge; +756 memory-high events (15 during sampling), no max/OOM/kill. Current memory 86,495,232 bytes; lifetime peak 93,560,832.
- Retained CPU 2%/88 MiB high/112 MiB max; acceptance open. NRestarts=0, journal empty since prior checkpoint; disk 68%. No service or app changes; no restart required under STEERING 22/49.
- Updated decision 0004/TASKS; archived iterations 2604–2610 to keep PROGRESS below 25 KB. No handbook/source behavior changes or paid calls.
- Verification: pnpm obs alerts; pnpm obs {health,services,sources,jobs} --check; pnpm exec tsx scripts/sample-metrics-recovery.ts 2 30; python3 /tmp/2618-summarize.py; systemctl show; journalctl; df -h /.
- Final verification: pnpm format; pnpm lint:fix; pnpm check exits 0 (1,062 unit / 329 integration passes, four expected skips); git diff --check. Receipts /tmp/2618-{check,format-final,lint-final}.log.
- Next: metrics ≥13:15 UTC, natural edition/Tech/social acceptance review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2619 — compact archive metadata with enlarged text

- Clean main at 5fd4d249; no inherited work. Alerts/health/services/active sources/jobs checks pass; Destructoid remains paused, next edition 15:00 UTC.
- Reader benefit / STEERING 38/42: archive coverage and topic gaps grew with text size. Fixed 4px gaps save 16px per published-edition row at 300%, with dates and metadata still enlarged.
- Browser passes all 12 combinations (320/1440px, 100–300%, both themes): real archive rows, 4px metadata gaps, enlarged date text, minimum 44px links, no horizontal overflow, keyboard opening of real published editions.
- Initial browser attempt timed out; distinct forwarded client addresses passed. Repositioned screenshots to show changed metadata; docs/screenshots/2619-archive-metadata-{light,dark}.png, light inspected.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2619-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2619-{format,lint,build,browser,check}.log.
- Web published atomically; no service restart under STEERING 22. No source/generation/budget/handbook behavior changes or paid calls.
- Next: metrics ≥13:15 UTC; natural edition/Tech/social acceptance review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2620 — compact saved X transcript separation

- Clean main at 9e9df5bc; no inherited work. Alerts/health/services/active sources/jobs checks pass; Destructoid remains paused, next edition 15:00 UTC.
- Reader benefit / STEERING 38/42: the saved X transcript separation grew from 16px to 48px with enlarged text. A fixed 16px margin saves 32px per transcript at 300%, keeping the text enlarged.
- Browser passes all 12 combinations (320/1440px, 100–300%, both themes): fixed 16px separation, enlarged transcript text, no horizontal overflow, real saved post text and keyboard fallback retry. Separate simulated successful embed preserves keyboard disclosure at 300%.
- Screenshots docs/screenshots/2620-x-transcript-spacing-{light,dark}.png; both inspected after repositioning to show attribution and transcript.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2620-{verify,disclosure}.cjs; pnpm check; git diff --check. Receipts /tmp/2620-{format,lint,build,browser,disclosure,check}.log.
- Initial full check terminated with exit 143 during unit tests (no reported assertion failure); detached setsid retry exits 0: 1,062 unit / 329 integration passes, four expected skips; receipt /tmp/2620-check-detached.log. Final health/alerts clear.
- Web published atomically; no restart under STEERING 22. No source/generation/budget/handbook behavior changes or paid calls.
- Next: metrics ≥13:15 UTC; natural edition/Tech/social acceptance review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2621 — compact reader footer with enlarged text

- Clean main at de801366; no inherited work. Alerts/health/services/active sources/jobs pass; Destructoid remains paused, next edition 15:00 UTC.
- Reader benefit / STEERING 38/42: footer separation and padding grew with reader text. Fixed 48px top margin / 16px vertical padding remove 160px of extra blank space at 300%, retaining enlarged Privacy text.
- All 12 browser combinations pass (320/1440px, 100–300%, both themes): computed spacing, enlarged text, minimum 44px target, no horizontal overflow and keyboard navigation to Privacy.
- Screenshots docs/screenshots/2621-reader-footer-{light,dark}.png; both inspected. Initial browser attempt preceded deployment and saw old spacing; rerun after atomic publication passed.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2621-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2621-{format,lint,build,browser,check}.log.
- Full pnpm check exits 0: 1,062 unit / 329 integration passes, four expected skips. Final format/lint, health/alerts and diff checks pass.
- Web published atomically; no restart under STEERING 22. No source/generation/budget/handbook behavior changes or paid calls.
- Next: metrics ≥13:15 UTC; natural edition/Tech/social acceptance review after 15:00 UTC. Destructoid awaits documented publisher access.

## 2026-11-17: iteration 2622 — compact expanded post context

- Clean main at bc69dbc1; no inherited work. Alerts clear, health database/Redis pass, app services running; Destructoid remains paused awaiting documented publisher access.
- Reader benefit / STEERING 38/42: expanded post context used text-scaled padding. Fixed 4px sides / 12px bottom preserve 16px more reading width and remove 24px of blank space at 300%, retaining enlarged text.
- All 12 browser combinations pass (320/1440px, 100–300%, both themes): real published context, computed padding/font size, no horizontal overflow, keyboard expansion/collapse.
- Screenshots docs/screenshots/2622-post-context-{light,dark}.png; both inspected. Early browser attempts ran before deployment and saw old padding; post-publication run passes.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2622-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2622-{format,lint,build,browser,check}.log.
- Full pnpm check exits 0: 1,062 unit / 329 integration passes, four expected skips. Final formatting/lint, health, alerts and diff checks pass.
- Web published atomically; no restart under STEERING 22. No source, generation, budget or handbook behavior change; no paid calls.
- Next: metrics ≥13:15 UTC; natural edition/Tech/social acceptance review after 15:00 UTC. Keep production generation stable during protection window.
