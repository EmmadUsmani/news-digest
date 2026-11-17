# Progress

[Earlier entries](docs/progress-archive/2026-11-17-progress-before-2567.md).

## 2026-11-17: iteration 2567 — due metrics recovery checkpoint

- Clean main at 6add2a1c; no inherited edits. Broad orientation output truncated; recovered current tasks/instructions narrowly. Protected paths untouched.
- Due 01:18:05–01:19:06 UTC samples: 24 healthy fresh rules/six uncached expected-series queries ≤0.836 s. Baseline assertions pass: failure counters, process starts and evaluator errors/misses unchanged; no restarts/OOM.
- Since 00:17:05, +542 memory-high events (none during sample), 60 small merges/1,674,898 rows, no big merge; ending memory 79,532,032 bytes. Resource acceptance stays open; retain 2% CPU/88 MiB high/112 MiB max. No tuning, force merge or paid calls.
- All 14 services/38 sources healthy; health database/Redis true; digest queue zero failed/next 15:00 UTC; alerts clear; disk 61%. Recorded evidence in capacity decision and TASKS.md.
- Verification: pnpm format; pnpm lint:fix; pnpm check (1,062 unit/329 integration passes, four expected skips); git diff --check. Sampler and python3 /tmp/2567-summarize.py pass; receipts /tmp/2567-{metrics.jsonl,summary.json,metrics-journal.log,format,lint,check}.
- Documentation only; deployed runtime matches main, no rebuild/restart under STEERING 22/65. Next: metrics ≥02:20 UTC; retention timer receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2568 — preserve enlarged-text social post width

- Clean main at b161247e; no inherited edits. Initial orientation output truncated; recovered applicable instructions/tasks narrowly. Health, 14 services/38 sources and alerts healthy; scheduled checks not due. Protected paths untouched.
- Reader weakness: 320px/300% post-card padding grew to 60px each side, leaving 166px for saved post text. Fixed 20px padding across X/Bluesky/Reddit retains 246px while text scales.
- Deployed real Nov 16 edition: 18 post cards fit at 320/390/1440px, light/dark, 100/200/300% text; context keyboard expand/collapse retains focus, text/page bounds and zero browser errors pass. Screenshots docs/screenshots/2568-posts-{light,dark}.png inspected. External browser requests aborted; no provider calls or fixture content.
- Verification: pnpm format; pnpm lint:fix; pnpm check; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2568-verify.cjs; git diff --check. Initial chained check terminated (143) during lint; standalone full rerun passed (1,062 unit/329 integration, four expected skips).
- Web built/published atomically; no service restart under STEERING 22. No generation, source or budget changes. Health database/Redis true; scheduled digest queue zero failed/next 15:00 UTC.
- Receipts /tmp/2568-{probe,browser,format,lint,check-final,build,jobs}.log. Next: metrics ≥02:20 UTC; retention timer receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2569 — preserve enlarged-text archive width

- Clean main at 84ae7fbd; no inherited edits. Health, 14 services/38 sources and alerts healthy; scheduled evidence not due. Protected paths untouched.
- Reader weakness: Past editions gutters grew to 60px each at 320px/300% text, leaving only 200px for dates and coverage. Fixed 20px mobile/24px desktop gutters preserve 280px on narrow screens while text scales; readers can scan past editions with fewer forced wraps.
- Browser verification: all 14 real archive entries fit at 320/390/1440px, light/dark, 100/200/300% text; all 18 cases pass text/page bounds, keyboard opening a real edition and zero page errors. No provider calls or fixture content. Screenshots docs/screenshots/2569-archive-{light,dark}.png inspected.
- Verification: pnpm format; pnpm lint:fix; pnpm check; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2569-verify.cjs; git diff --check. Full check: 1,062 unit/329 integration passes, four expected skips. Receipts /tmp/2569-{format,lint,check,build,browser}.log.
- Web built/published atomically; runtime matches commit without service restart under STEERING 22. No source, generation or budget changes; health database/Redis true.
- Next: metrics ≥02:20 UTC; retention timer receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2570 — preserve enlarged-text saved-story width

- Clean main at 91ae832b; no inherited edits. Initial broad orientation truncated; recovered task-specific instructions narrowly. Health, 14 services/38 sources and alerts healthy; scheduled checks not due. Protected paths untouched.
- Reader weakness: Saved items page/card padding expanded with text, leaving just 102px at 320px/300%. Fixed 16px page/20px card padding preserves 246px for saved stories while text scales.
- Browser verification: 18 cases at 320/390/1440px, both themes, 100/200/300% text; real Nov 16 story saved, text/page bounds and keyboard account/remove focus pass, zero page errors. Initial probe needed to await dialog focus restoration; no product focus change. Screenshots docs/screenshots/2570-saved-{light,dark}.png inspected. No paid/provider calls or fixture content.
- Verification: pnpm format; pnpm lint:fix; pnpm check; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2570-verify.cjs; git diff --check. Full rerun passed: 1,062 unit/329 integration passes, four expected skips; initial concurrent check terminated during lint (143).
- Web built/published atomically; no service restart under STEERING 22. No generation/source/budget changes. Receipts /tmp/2570-{format,lint,check-final,build,browser}.log. Final health database/Redis true; alerts clear.
- Next: metrics ≥02:20 UTC; retention timer receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2571 — preserve enlarged-text edition brief width

- Clean main at 29d208b7; no inherited edits. Initial broad orientation truncated; recovered applicable sections narrowly. All 14 services/38 sources healthy; alerts clear, health database/Redis true; digest queue zero failed/next 15:00 UTC.
- Reader weakness/owner value: bullet indentation consumed 60px at 320px/300% text, leaving 228px for each brief line. Fixed 24px indentation retains 264px; the reader can scan the edition with fewer forced wraps.
- Browser verification: all 20 real Nov 16 brief lines across five topics fit at 320/390/1440px, light/dark, 100/200/300% text; all 18 cases pass page/text bounds and keyboard story destination focus. No browser errors or provider calls; external requests aborted. Screenshots docs/screenshots/2571-brief-{light,dark}.png inspected.
- Verification: pnpm format; pnpm lint:fix; pnpm check; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2571-verify.cjs; git diff --check. Standalone full rerun passed: 1,062 unit/329 integration tests, four expected skips; initial chained check terminated during lint (143).
- Web built/published atomically; no service restart under STEERING 22. No generation/source/budget changes. Initial browser probe without a distinct forwarded client hit public rate limiting; isolated browser client passed. Receipts /tmp/2571-{format,lint,check-final,build,browser,jobs}.log.
- Next: metrics ≥02:20 UTC; retention timer receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2572 — due metrics recovery checkpoint

- Clean main at 77ad6a4a; no inherited edits. All 14 services/38 sources healthy; health database/Redis true and alerts clear. Protected paths untouched.
- Due 02:20:05–02:21:06 read-only checkpoint: 24 healthy/fresh rules and six uncached queries ≤0.569 s; baseline assertions pass. Failures/process starts/restarts unchanged; 61 small merges/2,017,283 rows, no big merge.
- Memory-high +492 since prior checkpoint, +13 during sampling; max/OOM/kill unchanged at zero. Ending memory 88,948,736 bytes; peak 92,995,584. Journal empty; disk 62%. Retain CPU 2%/88 MiB high/112 MiB max; resource acceptance remains open.
- Receipts /tmp/2572-{metrics-early.jsonl,metrics.jsonl,summary.json,metrics-journal.log}; sampled seven times with `pnpm exec tsx scripts/sample-metrics-recovery.ts 6 30`, retained last three due samples; `python3 /tmp/2572-summarize.py` passes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm exec tsx scripts/check-handbook.ts observability; git diff --check. Full check passes: 1,062 unit/329 integration tests, four expected skips; API rebuilt. Handbook passes (19 pages, 39 tables).
- Documentation/evidence only; runtime unchanged, no restart under STEERING 22. No provider calls or generation/source/budget changes. Initial obs queue name `digest` rejected; unfiltered jobs check succeeded.
- Next: metrics ≥03:22 UTC; retention timer receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2573 — preserve enlarged-text topic navigation

- Clean main at 5f6594b0; no inherited edits. Health database/Redis true, sources healthy and alerts clear; next digest 15:00 UTC, no failed digest jobs. Retention/metrics checkpoints not due. Protected paths untouched.
- Reader weakness/owner value: enlarged-text spacing squeezed the mobile topic strip. Fixed 16px gutters, 8px control gap, 8px Contents padding and 12px chip padding preserve 71px of topic viewport at 320px/300%, with text scaling retained.
- Browser verification: 18 cases at 320/390/768px, both themes, 100/200/300% text; all five real Nov 16 topic destinations and keyboard Contents open/close pass, no page overflow or browser errors. Screenshots docs/screenshots/2573-topic-bar-{light,dark}.png inspected. Initial probe needed reduced motion before checking destination position; no product scrolling change.
- Verification: pnpm format; pnpm lint:fix; pnpm check; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2573-verify.cjs; git diff --check. Full check passes: 1,062 unit and 329 integration tests, four expected skips. Final health database/Redis true and alerts clear. No provider calls or generation/source/budget changes.
- Web published atomically; no service restart under STEERING 22. Receipts /tmp/2573-{format,lint,check,build,browser}.log.
- Next: metrics ≥03:22 UTC; retention timer receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2574 — keep enlarged-text anchor destinations visible

- Clean main at 230ae5f0; no inherited edits. Alerts clear, health database/Redis true, sources healthy; no failed digest jobs, next edition 15:00 UTC. Metrics/retention checks not due; protected paths untouched.
- Reader weakness/owner value: selecting NBA at 320px/300% text positioned its heading below the 844px viewport. Relative anchor margins compounded page scroll padding; earlier navigation probes only checked a nonnegative destination position.
- Measure the mobile topic-bar height and use one page scroll offset below the fixed controls. Removed redundant margins from topic/story/posts/post destinations; measurement clears on route exit. Readers now see the heading they choose.
- Verification: pnpm format; pnpm lint:fix; pnpm check; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2574-verify.cjs; git diff --check. Browser checks cover real Nov 16 content at 320/390/1440px, both themes, 100/200/300% text; all 18 cases pass with topic headings below fixed controls and inside the viewport; brief/story/posts and individual post anchors pass. Full check: 1,062 unit and 329 integration tests pass, four expected skips.
- Screenshots docs/screenshots/2574-anchor-{light,dark}.png inspected; receipts /tmp/2574-{format,lint,check,build,browser}.log. Initial probe had a nonmatching posts selector and used the wrong theme attribute; corrected both and reran all 18 cases. No provider calls or generation/source/budget changes; atomic web publication, no service restart under STEERING 22.
- Next: metrics ≥03:22 UTC; retention timer receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2575 — reclaim enlarged-text reading space from the header

- Clean main at 9f405316; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; no failed digest jobs. Metrics/retention acceptance not due; protected paths untouched.
- Reader weakness/owner value: at 320px/300% text the fixed edition header occupied 409px. Date arrows and empty neighbor placeholders scaled to 132px each; the theme icon also grew. Fixed 44px targets and a 20px theme icon reduce the header to 205px, giving readers 204px more space while date text remains enlarged.
- Browser verification: node /tmp/2575-verify.cjs passes 18 width/text/theme cases, date-control bounds and keyboard theme switching; real older/newer/archive navigation and shared theme control on archive/Saved/Privacy pass. node /tmp/2575-anchors.cjs passes all 18 real-content topic/brief/story/posts anchor cases. Screenshots docs/screenshots/2575-reader-header-{light,dark}.png inspected.
- First browser probe manually changed the theme class without syncing React state; corrected the probe to use the theme storage event and reran. Initial localhost edition curl hit shared-client 429; isolated test client confirmed Nov 16 edition, five topics/25 stories/18 posts.
- Verification: pnpm format; pnpm lint:fix; pnpm check; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; git diff --check. Two attached checks ended with SIGTERM during unit tests without failure summaries. Detached full check completed with exit 0: 1,062 unit and 329 integration tests pass, four expected skips; API rebuilt.
- Web published atomically; no service restart under STEERING 22. No provider calls or generation/source/budget changes. Receipts /tmp/2575-{format,lint,format-final,lint-final,check,check-final,check-complete,build,browser,anchors}.log and /tmp/2575-check-complete.exit (0).
- Final triage: RecentJobFailures fired for scheduled feed-7c2f40dc HTTP 429 at 03:04:09 UTC; ordinary retry completed 03:05:09 with HTTP 200/60 items. All 38 sources healthy, health database/Redis true; no failed digest jobs. Alert remains inside its ten-minute lookback; no manual fetch or retry-policy change.
- Next: metrics ≥03:22 UTC; retention timer receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2576 — keep the keyboard skip link on screen

- Clean main at 85962694; no inherited work. Initial RecentJobFailures alert matches the recovered 03:04 feed HTTP 429; health database/Redis true, all 38 sources healthy, digest queue has zero failed runs and next edition 15:00 UTC. Public-mode jobs expose counts only; removed unsupported state filter from the triage probe.
- Reader weakness/owner value: at 320px/400% text the focused Skip to content link extended to x=399, clipping its right edge. Fixed pixel insets/padding, viewport-bounded border-box width and word wrapping keep the whole keyboard control visible while preserving enlarged text.
- Verification: pnpm format; pnpm lint:fix; pnpm check; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2576-verify.cjs; git diff --check. Browser checks cover all four reader routes, 320/390/1440px, 100–400% text and both themes; keyboard activation focuses the visible content destination. Screenshots docs/screenshots/2576-skip-link-{light,dark}.png inspected.
- Atomic web publication; no service restart under STEERING 22. No provider calls, generation/source/budget changes or protected-path edits. Attached full check received SIGTERM after integration case 333 without a final summary; detached rerun completed with exit 0: 1,062 unit and 329 integration tests pass, four expected skips. Receipts /tmp/2576-{format,lint,build,check,check-complete,browser}.log and /tmp/2576-check-complete.exit. Final alert snapshot 03:17 UTC: zero firing/pending alerts.
- Next: metrics ≥03:22 UTC; retention timer receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2577 — fourth metrics recovery checkpoint

- Clean main at dfea7582; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; digest queue has zero failed runs, next edition 15:00 UTC. App units running; old failed transient check units are historical, not crashed app services.
- Due passive checkpoint: three samples/24 healthy rules, six uncached expected-series queries ≤3.352 s. Admission-limit counter rose 20→21; initial unchanged-counter assertion failed correctly, then remaining baseline assertions passed with this delta reported separately.
- Since 02:21:06: +62 small merges/4,546,966 rows, no big merge; +622 memory-high events (six during sampling), zero max/OOM/kill. Process starts, timeouts, slow queries, evaluator errors/misses unchanged; NRestarts=0, empty journal. Ending memory 87,158,784 bytes; disk 63%.
- Resource acceptance remains open; retain 2% CPU/88 MiB high/112 MiB max. No runtime/source/provider/budget changes or protected-path edits. No restart under STEERING 22; live services already match main.
- Archived oldest progress entries after file crossed 25 KB; earlier evidence remains linked. Receipts /tmp/2577-{metrics.jsonl,metrics-error.log,summary.json,metrics-journal.log,sources.log,jobs.log}; sample and assertion commands recorded in decision 0004.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass; 1,062 unit/329 integration tests, four expected skips. Initial detached check used the wrong working directory and failed before checking; corrected repository working directory, full rerun exit 0. Receipts /tmp/2577-{format,lint,check-final}.log and /tmp/2577-check-final.exit.
- Next: metrics ≥04:30 UTC; retention timer receipt 04:40 UTC; daily edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2578 — preserve Contents story reading width

- Clean main at 18408f9c; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; digest queue zero failed jobs and next edition 15:00 UTC. Metrics ≥04:30 and retention 04:40 remain pending.
- Reader weakness: at 320px/300% text, Contents story titles had only 188px because indentation, gap and decorative markers enlarged with text. Fixed pixel spacing and marker size preserve 244px for titles (+56px), while reader text stays enlarged.
- Browser verification: node /tmp/2578-verify.cjs covers real-edition Contents at 320/390/768px, 100–400% text, both themes; reading width, scrolling, visible Close, focus return, story destinations and Escape. node /tmp/2578-desktop.cjs checks 1440px/100–400% title widths and keyboard destinations. Light/dark screenshots docs/screenshots/2578-contents-{light,dark}.png inspected.
- Initial browser assertion expected short titles to fill wide panels; corrected the probe to assert minimum reading width rather than full available width. No application change needed.
- Verification: pnpm format; pnpm lint:fix; pnpm check (exit 0: 1,062 unit/329 integration tests pass, four expected skips); VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; git diff --check. Atomic web publication; no restart under STEERING 22. No generation/source/provider/budget changes or protected-path edits. Receipts /tmp/2578-{format,lint,check,build,browser,desktop}.log.
- Next: metrics ≥04:30 UTC; retention timer receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2579 — correct owner retention operations guidance

- Clean main at 3b9220fa; no inherited edits. Alerts clear; health database/Redis true; all 38 sources healthy; digest-generation has zero failed jobs and next run 15:00 UTC.
- Owner value: the agent operations page incorrectly called daily retention pending. It now links the installed 04:40 UTC cleanup and explains separate supervisor-owned seven-day log pruning; the disk page records the same ownership split. No protected-path edits or runtime changes.
- Verified installed timer's next run at 04:40 UTC and repository supervisor pruning/default seven-day setting. Initial job probe used unsupported queue `digest`; corrected to the unfiltered queue snapshot (`digest-generation`).
- Verification: pnpm format; pnpm lint:fix; pnpm check (exit 0: 1,062 unit/329 integration passes, four expected skips); affected-page handbook checks with --owner-services (links/render/schema pass); git diff --check. Receipts /tmp/2579-{format,lint,check,handbook-retention,handbook-operations}.log.
- Handbook Markdown is served per request, so no build or restart needed under STEERING 22. No source, provider, budget or generation changes.
- Next: metrics ≥04:30 UTC; retention timer receipt 04:40 UTC; natural edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2580 — preserve publisher reading width

- Clean main at 31a3ceb9; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; digest-generation zero failed jobs, next edition 15:00 UTC. Metrics ≥04:30 and retention 04:40 remain pending.
- Owner value: publisher favicon and gap enlarged alongside text, leaving only 186px for source labels at 320px/300%. Fixed 14px icons and 6px gaps preserve 226px (+40px), with source text still 36px.
- Browser verification: node /tmp/2580-verify.cjs checks real published attribution at 320/390/1440px, 100–300% text, both themes; label/icon dimensions, failed-image fallback, keyboard coverage expansion/source focus and page bounds pass. Decorative favicons are controlled layout assets, not live publisher images; story content is the real saved edition. Screenshots docs/screenshots/2580-attribution-{light,dark}.png inspected.
- Verification: pnpm format; pnpm lint:fix; pnpm check; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; git diff --check. Initial attached check reached zero-failure summaries (1,062 unit/329 integration passes, four expected skips), then received SIGTERM without a final exit code; detached full rerun exited 0 with the same passing counts. Receipts /tmp/2580-{format,lint,check,check-complete,build,browser-final}.log.
- Atomic web publication; no restart under STEERING 22. Local health and public HTTPS 200. Initial HTTPS curl followed /etc/hosts to VM port 443; curl --resolve using public DNS reached the documented HTTPS proxy successfully. No generation/source/provider/budget changes or protected-path edits.
- Next: metrics ≥04:30 UTC; retention timer receipt 04:40 UTC; natural edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2581 — keep enlarged-text coverage controls compact

- Clean main at 985fa329; no inherited edits. Alerts clear, health database/Redis true; sources returning data, digest-generation zero failed jobs and next edition 15:00 UTC. Metrics ≥04:30 and retention 04:40 remain pending.
- Reader weakness: coverage disclosure minimum height grew from 44px to 132px at 300% text, with 24px horizontal padding. Fixed 44px touch minimum and 8px padding preserve more space for enlarged labels and linked reporting; labels still wrap naturally.
- Browser verification: node /tmp/2581-verify.cjs passes 18 real-edition combinations (320/390/1440px, 100–300%, both themes): enlarged font, minimum target, keyboard expansion/collapse, article focus and page bounds. Both docs/screenshots/2581-coverage-{light,dark}.png inspected.
- Initial probe lacked a dedicated test identity and hit local API rate limiting; rerun with the established browser test header passed. Baseline receipt /tmp/2581-baseline.log confirms 132px minimum before deployment.
- Verification: pnpm format; pnpm lint:fix; pnpm check (exit 0: 1,062 unit/329 integration passes, four expected skips); VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; git diff --check. Receipts /tmp/2581-{format,lint,check,build,browser}.log. Atomic web publication; public HTTPS 200 and local health pass. No service restart under STEERING 22. No source, generation, provider or budget changes.
- Next: metrics ≥04:30 UTC; retention timer receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2582 — accept scheduled retention and record due metrics

- Clean main at f910855c; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; digest-generation zero failed jobs, next edition 15:00 UTC.
- Item 65 complete: natural system timer ran 04:40:03–04:40:04 UTC, Result=success / ExecMainStatus=0; deleted 55 expired sessions / 41,185,972 bytes. Tmpfiles completed with five unavailable-pipe notices ignored; next run Nov 18 04:40 UTC. Disk 63% before/after; no protected-path edits. Ack added; supervisor pruning remains lead-owned.
- Due metrics: three samples 04:31:32–04:32:34, 24 healthy rules/six passing queries ≤2.185 s; one admission-limit event, +667 memory-high events/63 small merges, no big merge. Baseline process/failure/OOM/evaluator assertions pass. Retain limits; acceptance open, next ≥05:35 UTC. Evidence in capacity decision and /tmp/2582-{metrics.jsonl,summary.json,metrics-journal.log}.
- Verification: pnpm format; pnpm lint:fix; pnpm check (exit 0, 1,062 unit/329 integration passes, four expected skips); git diff --check. No app code/config change, rebuild/restart unnecessary under STEERING 22. Receipts /tmp/2582-{format,lint,check}.log.
- Initial timer probe used user scope; corrected to the installed system timer. No provider, source, generation or budget changes.
- Next: metrics ≥05:35 UTC; natural scheduled edition/Tech/social review after 15:00 UTC.
