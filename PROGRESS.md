# Progress

[Earlier entries](docs/progress-archive/2026-11-17-progress-before-2575.md).

## 2026-11-17: iteration 2575 — reclaim enlarged-text reading space from the header

- Clean main at 9f405316; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; no failed digest jobs. Metrics/retention acceptance not due; protected paths untouched.
- Reader weakness/owner value: at 320px/300% text the fixed edition header occupied 409px. Date arrows and empty neighbor placeholders scaled to 132px each; the theme icon also grew. Fixed 44px targets and a 20px theme icon reduce the header to 205px, giving readers 204px more space while date text remains enlarged.
- Browser verification: node /tmp/2575-verify.cjs passes 18 width/text/theme cases, date-control bounds and keyboard theme switching; real older/newer/archive navigation and shared theme control on archive/Saved/Privacy pass. node /tmp/2575-anchors.cjs passes all 18 real-content topic/brief/story/posts anchor cases. Screenshots docs/screenshots/2575-reader-header-{light,dark}.png inspected.
- First browser probe manually changed the theme class without syncing React state; corrected the probe to use the theme storage event and reran. Initial localhost edition curl hit shared-client 429; isolated test client confirmed Nov 16 edition, five topics/25 stories/18 posts.
- Verification: pnpm format; pnpm lint:fix; pnpm check; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; git diff --check. Two attached checks ended with SIGTERM during unit tests without failure summaries. Detached full check completed with exit 0: 1,062 unit and 329 integration tests pass, four expected skips; API rebuilt.
- Public HTTPS 200; final alerts clear. Web published atomically; no service restart under STEERING 22. No provider calls or generation/source/budget changes. Receipts /tmp/2575-{format,lint,format-final,lint-final,check,check-final,check-complete,build,browser,anchors}.log and /tmp/2575-check-complete.exit (0).
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

## 2026-11-17: iteration 2583 — fit Save controls around enlarged text

- Clean main at 17cb4c66; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; digest-generation zero failed jobs and next edition 15:00 UTC. Disk 62%; metrics checkpoint not due until ≥05:35 UTC.
- Owner value: every story/post Save control occupied 132px height and 36px side padding at 300% text. Fixed 44px target minimum and 12px/8px padding let controls grow around enlarged labels: 44/60/80px at 100/200/300%, preserving more room for content.
- Browser: node /tmp/2583-verify.cjs passes 36 real-edition story/post cases across 320/390/1440px, 100–300% text and both themes; font enlargement, touch targets, keyboard save/unsave, pressed state, retained focus and page bounds pass. Both docs/screenshots/2583-save-{light,dark}.png inspected.
- Verification: pnpm format; pnpm lint:fix; pnpm check (exit 0: 1,062 unit/329 integration passes, four expected skips); VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; git diff --check. Receipts /tmp/2583-{format,lint,check,build,browser,sources,jobs}.log.
- Atomic web publication; no restart under STEERING 22. Public HTTPS 200 and local health pass. No generation, source, provider, budget or handbook behavior changes.
- Archived older progress and completed task markers to keep orientation files compact; original evidence links retained.
- Next: metrics ≥05:35 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2584 — fit saved-item actions around enlarged text

- Clean main at add353e7; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; digest-generation zero failed jobs and next edition 15:00 UTC. Metrics checkpoint due ≥05:35 UTC.
- Owner value: saved-items Remove occupied 132px height with 48px side padding at 300% text. Fixed 44px target minimum and 12px/8px padding give 44/60/80px heights at 100/200/300%; View edition also retains a fixed 44px target minimum.
- Browser: node /tmp/2584-verify.cjs passes 18 real-edition combinations (320/390/1440px, 100–300%, both themes), two saved items each: enlarged text, touch targets, keyboard removal, neighbor/final-heading focus, reload persistence, empty state and page bounds pass. Both docs/screenshots/2584-saved-{light,dark}.png inspected.
- Verification: pnpm format; pnpm lint:fix; web rebuilt/published with VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; git diff --check. pnpm check retry exit 0 (1,062 unit/329 integration passes, four expected skips), receipt /tmp/2584-check-retry.log. First combined command ended SIGTERM during format:check after typecheck/lint passed; separate rerun passed.
- Atomic web publication; no restart under STEERING 22. Public HTTPS 200 and local health pass. No generation, source, provider, budget or handbook behavior changes.
- Next: metrics ≥05:35 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2585 — preserve archive space with enlarged text

- Clean main at 28694c01; no inherited edits. RecentJobFailures traced to one feed HTTP 429 at 05:04:08 UTC; automatic attempt 2 succeeded 05:05:09. All 38 sources healthy, digest-generation zero failed jobs/next edition 15:00 UTC; disk 62%, local/public health passes.
- Reader weakness: archive header consumed 537px at 320px/300% text. Fixed 20px header padding/12px gaps and 44px navigation target minimums reduce it to 337px while labels enlarge and wrap; page links retain 44px minimums.
- Browser: node /tmp/2585-verify.cjs passes 18 real-archive combinations (320/390/1440px, 100–300%, both themes), target sizes, enlarged labels, page-heading focus, bounds and keyboard opening of real editions. Light/dark docs/screenshots/2585-archive images inspected.
- Browser probes corrected for the real ?page=1 route and local reader rate limiting; first baseline expected Older despite only 14 editions. HTTPS uses the public DNS address with curl --resolve because /etc/hosts maps the name directly to the VM.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; git diff --check. pnpm check exit 0: 1,062 unit/329 integration passes, four expected skips; final alerts zero firing/pending. Receipts /tmp/2585-{format,lint,check,build,browser,sources,jobs}.log.
- Public HTTPS 200; final alerts clear. Web published atomically; no service restart under STEERING 22. No source, generation, provider, budget or handbook behavior changes.
- Next: metrics ≥05:35 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2586 — preserve saved-items header space with enlarged text

- Clean main at 75a188ca; no inherited edits. Alerts clear, local health database/Redis true, all 38 sources healthy; digest-generation zero failed jobs, next edition 15:00 UTC. Metrics checkpoint not due until ≥05:35 UTC.
- Owner value: Saved items header consumed 453px at 320px/300% text. Fixed 10px vertical padding, 12px gaps and 44px link target minimums reduce it to 293px while labels enlarge and wrap, leaving more room for saved content.
- Browser: node /tmp/2586-verify.cjs passes 18 real-edition combinations (320/390/1440px, 100–300%, both themes): saved story retention, font enlargement, target sizes, page bounds, theme switching and keyboard archive/home navigation. Both docs/screenshots/2586-saved-header images inspected.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; git diff --check. pnpm check exit 0 (1,062 unit/329 integration passes, four expected skips); receipts /tmp/2586-{format,lint,check,build,browser,sources,jobs,alerts}.log.
- Web published atomically; no restart under STEERING 22. Public HTTPS /saved 200 (public DNS via curl --resolve), local health passes, final alerts zero firing/pending. No source, generation, provider, budget or handbook behavior changes.
- Next: metrics ≥05:35 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2587 — metrics recovery checkpoint

- Clean main at 418046e5; no inherited edits. Alerts clear, health database/Redis true; all 38 sources healthy, digest-generation zero failed jobs and next edition 15:00 UTC.
- Owner value: check whether constrained metrics resources can be accepted without weakening morning-edition monitoring. Ten natural samples span the ≥05:35 UTC checkpoint; no forced merge or runtime change.
- Result: 24 healthy/fresh rules, 20 successful uncached queries ≤1.619 s; admission-limit +1 (22→23), small merges +63 / 1,695,972 rows, no big merge. Memory-high +642 (100 during sampling), ending 84,545,536 bytes; max/OOM/kill zero.
- Baseline assertions pass: stable process identities, queue-timeout/slow-query/evaluator error/missed counters unchanged. NRestarts=0; metrics journal empty since prior checkpoint; disk 62%. Retain CPU 2% / MemoryHigh 88 MiB / MemoryMax 112 MiB; acceptance open.
- Verification: pnpm format; pnpm lint:fix; pnpm check exit 0 (1,062 unit/329 integration passes, four expected skips). Receipts /tmp/2587-{check,format,lint,sources,jobs}.log; sampler and summary receipts linked in capacity decision.
- Evidence/task update only; running app already matches main, no rebuild or service restart required. No source, generation, provider, budget or handbook behavior changes.
- Next: metrics ≥06:40 UTC, preferably after natural big merge; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2588 — preserve reading space below mobile topics

- Clean main at 4dd3041d; no inherited edits. Alerts clear, local health database/Redis true; sources healthy and digest-generation zero failed jobs/next edition 15:00 UTC. Next metrics checkpoint ≥06:40 UTC.
- Owner value: mobile fixed topic bar consumed 181px at 320px/300% text. Fixed padding/gaps and 44px minimum targets reduce it to 97px while labels still enlarge, freeing 84px for real edition content.
- Browser: node /tmp/2588-verify.cjs passes 12 real-edition combinations (320/390px, 100–300%, both themes): label enlargement, touch targets, topic/story navigation, heading focus, drawer Escape/focus restoration and page bounds. Both docs/screenshots/2588-topic-bar images inspected.
- Browser probes corrected for local reader rate limiting, actual 97px line-box height and asynchronous drawer focus restoration; no product behavior change required for those probes.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; git diff --check. pnpm check exit 0: 1,062 unit/329 integration passes, four expected integration skips. Receipts /tmp/2588-{format,lint,build,browser,check,sources,jobs}.log.
- Initial tool-bound check terminated (143) without assertion failure/OOM; detached shell did not persist. Transient systemd iteration-2588-check completed the full check successfully.
- Latest live edition 93aefc45 has all five topics, each with five stories; post counts 3/5/1/5/4. Public HTTPS 200; final alerts clear. Web published atomically; no service restart under STEERING 22. No generation, source, provider, budget or handbook behavior changes.
- Next: metrics ≥06:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2589 — enlarge contents labels with reader text

- Clean main at f0b749fb; no inherited edits. Alerts clear, local health database/Redis true, all 38 sources healthy; digest-generation zero failed jobs, next edition 15:00 UTC. Metrics checkpoint not due until ≥06:40 UTC.
- Owner value: contents story/topic labels stayed at legacy 18px at 300% reader text. Explicit font-size inheritance restores 14/28/42px labels at 100/200/300% in both desktop sidebar and mobile drawer; fixed-size decorative markers retained.
- Browser verification: node /tmp/2589-verify.cjs passes 12 real-edition combinations (320/1440px, 100–300%, both themes): label enlargement, wrapping, minimum targets, scroll/focus reachability, keyboard story navigation and drawer Escape/focus restoration. Both docs/screenshots/2589-contents-text images inspected.
- Initial browser probe hit local rate limiting; browser matrix started before atomic deployment and correctly found the old 18px label. Re-run after publication is the acceptance check.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; pnpm check exit 0 (1,062 unit/329 integration passes, four expected skips); git diff --check. Receipts /tmp/2589-{format,lint,build,browser,check}.log.
- Public HTTPS 200 (public DNS via curl --resolve), local health passes, final alerts clear; latest live edition 93aefc45 retains five topics/five stories each and 3/5/1/5/4 posts.
- Web published atomically; no service restart under STEERING 22. No source, generation, provider, budget or handbook behavior changes.
- Next: metrics ≥06:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.
