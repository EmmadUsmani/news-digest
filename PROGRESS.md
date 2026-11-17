# Progress

[Earlier entries](docs/progress-archive/2026-11-17-progress-before-2575.md).

[Iterations 2575–2582](docs/progress-archive/2026-11-17-iterations-2575-2582.md)

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

## 2026-11-17: iteration 2590 — keep social context previews visible

- Clean main at 2914815a; no inherited edits. Alerts clear, health database/Redis true, all 38 sources healthy; digest-generation zero failed jobs, next edition 15:00 UTC. Metrics checkpoint not due until ≥06:40 UTC.
- Reader weakness: at 320px/300% text, collapsed social context previews shrink to one pixel. Wrapping flex layout with a 12-character preview basis moves the preview onto its own line when needed; fixed padding/gaps preserve reading space and 44px targets.
- Browser: node /tmp/2590-verify.cjs passes 12 real-edition combinations (320/1440px, 100–300%, both themes), each covering nine context notes: preview width/font enlargement, keyboard expand/collapse, complete note text, wrapping and page bounds. Both docs/screenshots/2590-post-context images inspected.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; pnpm check exit 0 (1,062 unit/329 integration passes, four expected skips); git diff --check. Receipts /tmp/2590-{format,lint,build,browser,check,sources,jobs,alerts}.log.
- Public HTTPS 200 using public DNS with curl --resolve; local health passes and final alerts clear. Recent resolved ingestion failure was HTTP 429; all sources subsequently succeeded. Direct VM DNS resolved to an unreachable private proxy address.
- Web published atomically; no service restart under STEERING 22. No source, generation, provider, budget or handbook behavior changes.
- Next: metrics ≥06:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

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
