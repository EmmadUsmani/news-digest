# Progress

[Earlier entries](docs/progress-archive/2026-11-17-progress-before-2575.md).

[Iterations 2575–2582](docs/progress-archive/2026-11-17-iterations-2575-2582.md)

[Iterations 2583–2590](docs/progress-archive/2026-11-17-iterations-2583-2590.md)

## 2026-11-17: iteration 2591 — make room for enlarged topic labels

- Clean main at b5dbc1fb; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; digest-generation zero failed jobs, next edition 15:00 UTC. Metrics checkpoint not due until ≥06:40 UTC.
- Reader weakness / STEERING 33/42: at 320px/300% text, the Contents label leaves only 71px for topic navigation. A text-relative container query substitutes a labeled 44px list icon when space is tight: topic strip 236px, bar 97→85px; visible label retained when it fits.
- Owner value: the complete Tech & AI label fits beside Contents again at enlarged mobile text sizes. Topic text enlargement, minimum targets, horizontal navigation and drawer behavior retained.
- Browser: node /tmp/2591-verify.cjs passes 18 real-edition combinations (320/390/768px, 100–300%, both themes): available strip width, correct icon/label mode, touch targets, topic/story navigation, heading focus, drawer Escape/focus restoration and page bounds. Both docs/screenshots/2591-topic-strip images inspected.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; git diff --check. pnpm check exit 0: 1,062 unit/329 integration passes, four expected integration skips. Receipts /tmp/2591-{format,lint,build,browser,check,sources,jobs,alerts}.log.
- Initial tool-bound lint/deploy shell terminated (143) before deployment; persistent systemd iteration-2591-deploy reran lint successfully and published the web build. Local endpoint verification hit reader rate limiting once; separate reader identity succeeded.
- Public HTTPS 200 using public DNS with curl --resolve; local health passes, final alerts clear. Latest live edition 93aefc45 retains five topics/five stories each and 3/5/1/5/4 posts.
- Web published atomically; no service restart under STEERING 22. No source, generation, provider, budget or handbook behavior changes.
- Next: metrics ≥06:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2592 — enlarge the edition date with reader text

- Clean main at c4714f13; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; digest-generation zero failed jobs, next edition 15:00 UTC. Metrics checkpoint not due until ≥06:40 UTC.
- Reader weakness / STEERING 33/42: the edition date stayed at legacy 18px at 300% reader text. Explicit span font-size inheritance restores 14/28/42px at 100/200/300%; a reader who enlarges text can read the date beside the navigation arrows.
- Browser: node /tmp/2592-verify.cjs passes 18 real-edition combinations (320/768/1440px, 100–300%, both themes): date enlargement, minimum targets, page bounds, keyboard older/newer navigation and archive access. Both docs/screenshots/2592-edition-date images inspected.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; pnpm check exit 0 (1,062 unit/329 integration passes, four expected skips); git diff --check. Receipts /tmp/2592-{format,lint,build,browser,check,sources,jobs}.log.
- Public HTTPS 200 using public DNS with curl --resolve; VM DNS still points at an unreachable private proxy address. Latest live edition 93aefc45 retains five topics/five stories each and 3/5/1/5/4 posts.
- Web published atomically; no service restart under STEERING 22. No source, generation, provider, budget or handbook behavior changes.
- Next: metrics ≥06:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2593 — due metrics recovery measurement

- Clean main at 3ea448b8; no inherited work. Due ≥06:40 UTC checkpoint completed; no production code/config changes.
- Three natural samples 06:41:18–06:43:19: 24/24 healthy fresh rules; six uncached expected-series probes pass, max 0.978 s.
- Against 05:36:38: admission-limit delta zero (23 retained); process-start, queue-timeout, slow-query, evaluator error/missed and max/OOM/kill counters unchanged.
- Small merges +64 / 1,785,031 rows; big merges zero; memory-high +704 (26 during sampling). Ending memory 88,068,096 bytes; lifetime peak 92,995,584. No restart/journal errors; disk 63%.
- Retain CPU 2% / 88 MiB high / 112 MiB max. Resource acceptance open: reclaim persists and natural big-merge evidence absent. Next checkpoint ≥07:45 UTC.
- Commands: pnpm exec tsx scripts/sample-metrics-recovery.ts 2 60; python3 /tmp/2593-summarize.py (baseline assertions pass); systemctl show obs-metrics; journalctl -u obs-metrics; df -h /.
- Health database/Redis true; pnpm obs alerts clear; pnpm obs sources --check all 38 healthy; pnpm obs jobs --check --queue digest-generation --limit 5 zero failed, next 15:00 UTC. State-filtered jobs unsupported in public mode; reran supported counts query.
- Verification: pnpm format; pnpm lint:fix; pnpm check exit 0 (1,062 unit / 329 integration passes; four expected skips); git diff --check passes. Evidence /tmp/2593-*; no paid calls, edition writes, deployment or service restart under STEERING 22.
- Next: metrics ≥07:45 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2594 — enlarge saved item titles with reader text

- Clean main at 4ee6aee7; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; digest-generation zero failed jobs, next edition 15:00 UTC. Metrics checkpoint not due until ≥07:45 UTC.
- Reader weakness / STEERING 33/42: saved item title links stayed at legacy 24px even with enlarged reader text. Inheriting the heading font restores 18/36/54px at 100/200/300%; readers can enlarge titles alongside saved summaries.
- Browser: node /tmp/2594-verify.cjs passes 18 real-edition combinations (320/390/1440px, 100–300%, both themes): exact title sizes, page bounds, saved content, header targets, theme and keyboard archive/home navigation. Both docs/screenshots/2594-saved-title images inspected. Before-change assertion reproduced fixed 24px.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; pnpm check exit 0 (1,062 unit/329 integration passes, four expected skips); git diff --check. Receipts /tmp/2594-{format,lint,build,browser,check,sources,jobs,alerts}.log.
- Initial tool-bound check shell terminated (143) during lint; persistent systemd user unit iteration-2594-check reran the full check successfully.
- Public HTTPS 200 using public DNS with curl --resolve; default VM DNS still points at an unreachable proxy address. Local health passes; real published content saved and reopened in browser verification.
- Web published atomically; no service restart under STEERING 22. No source, generation, provider, budget or handbook behavior changes.
- Next: metrics ≥07:45 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2595 — preserve archive space with enlarged text

- Clean main at 5d3f8919; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; digest-generation zero failed jobs, next edition 15:00 UTC. Metrics checkpoint not due until ≥07:45 UTC.
- Reader weakness / STEERING 33/42: archive heading padding and edition-list margin enlarged with reader text, making 80px of whitespace become 240px at 300%. Fixed pixel spacing preserves enlarged type and removes 160px of unnecessary scrolling; readers reach the edition links sooner.
- Before-change browser assertion reproduced 96px heading padding at 200%. node /tmp/2595-verify.cjs passes 18 combinations (320/768/1440px, 100–300%, both themes): fixed 48/32px spacing, enlarged heading, page bounds and keyboard opening of real editions. Both docs/screenshots/2595-archive-spacing images inspected.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; pnpm check exit 0 (1,062 unit/329 integration passes, four expected skips); git diff --check. Receipts /tmp/2595-{format,lint,build,browser,check,sources,jobs}.log.
- Public archive HTTPS 200 via public DNS/curl --resolve; local health passes. Initial browser attempt lacked a distinct client address and timed out; reran with per-case addresses as in prior browser verification.
- Web published atomically; no service restart under STEERING 22. No generation, source, provider, budget or handbook behavior changes.
- Next: metrics ≥07:45 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2596 — put topic choices before secondary help

- Clean main at a3260b4a; no inherited work. Alerts clear, health database/Redis true, 38 sources healthy; digest-generation zero failed, next edition 15:00 UTC. Metrics checkpoint not due until ≥07:45 UTC.
- Reader weakness / STEERING 38/42: at 320px/300% the topic chooser put its first checkbox at 1,289px, below lengthy instructions and sync text. Shortened the introduction and moved automatic-topic help/sync status below the choices; first checkbox now 587px, saving 702px of scrolling. Owner-visible benefit: topic controls appear in the first viewport with enlarged text.
- Browser: node /tmp/2596-verify.cjs passes 18 combinations (320/768/1440px, 100–300%, both themes): first checkbox visible, enlarged labels, no horizontal overflow, keyboard hide/show, reload persistence and focus return. Both docs/screenshots/2596-topic-choices images inspected.
- Initial browser run caught long-word overflow in the relocated help; restored overflow wrapping and reran all combinations successfully.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; pnpm check exit 0 (1,062 unit / 329 integration passes; four expected skips); git diff --check. Receipts /tmp/2596-{format,lint,build,browser,check}.log.
- Public HTTPS 200 via public DNS/curl --resolve; local health passes. Web published atomically; no service restart under STEERING 22. Generation, sources, providers and budgets unchanged.
- Next: metrics ≥07:45 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2597 — keep enlarged topic choices compact

- Clean main at c403f44c; no inherited edits. Alerts clear, health database/Redis true, 38 sources healthy; digest-generation zero failed, next edition 15:00 UTC. Metrics checkpoint not due until ≥07:45 UTC.
- Reader weakness / STEERING 38/42: topic row padding, minimum height and list gaps enlarged with reader text. Fixed 8px row padding/gaps, 16px list padding and 44px minimum targets preserve enlarged labels/checkboxes while cutting the five-choice list from 1,072px to 734px at 320px/300%. Owner-visible benefit: 338px less scrolling to choose topics.
- Browser: node /tmp/2597-verify.cjs passes 18 combinations (320/768/1440px, 100–300%, both themes): fixed spacing, enlarged labels, no overflow, 44px minimum targets, keyboard hide/show, reload persistence and focus return. Both docs/screenshots/2597-topic-spacing images inspected. Before/after row heights recorded via /tmp/2597-probe.cjs.
- Initial browser assertion read margin-top; Tailwind uses margin-bottom. Corrected the probe to measure the actual gap and reran. No app failure.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; pnpm check exit 0 (1,062 unit / 329 integration passes; four expected skips); git diff --check. Receipts /tmp/2597-{format,lint,build,browser,check}.log.
- Public HTTPS 200 via public DNS/curl --resolve; local health passes. Web published atomically; no service restart under STEERING 22. Generation, sources, providers and budgets unchanged.
- Next: metrics ≥07:45 UTC; scheduled edition/Tech/social review after 15:00 UTC.

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
