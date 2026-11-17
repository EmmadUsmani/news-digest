# Progress

[Earlier entries](docs/progress-archive/2026-11-17-progress-before-2575.md).

[Iterations 2575–2582](docs/progress-archive/2026-11-17-iterations-2575-2582.md)

[Iterations 2583–2590](docs/progress-archive/2026-11-17-iterations-2583-2590.md)

[Iterations 2591–2597](docs/progress-archive/2026-11-17-iterations-2591-2597.md)

[Iterations 2598–2603](docs/progress-archive/2026-11-17-iterations-2598-2603.md)

[Iterations 2604–2610](docs/progress-archive/2026-11-17-iterations-2604-2610.md)

[Iterations 2611–2618](docs/progress-archive/2026-11-17-iterations-2611-2618.md)

[Iterations 2619–2626](docs/progress-archive/2026-11-17-iterations-2619-2626.md)

[Iterations 2627–2635](docs/progress-archive/2026-11-17-iterations-2627-2635.md)

[Iterations 2636–2645](docs/progress-archive/2026-11-17-iterations-2636-2645.md)

## 2026-11-17: iteration 2646 — hourly metrics recovery checkpoint

- Clean main at 4ea97841; no inherited work. Alerts clear; services, active sources, digest jobs and /healthz pass.
- Three read-only samples at 17:49:49–17:50:50 UTC, more than an hour after prior checkpoint: 24 healthy rules, six queries ≤0.874 s.
- No new admission-limit, queue-timeout, slow-query, evaluator error/missed, process restart or OOM events.
- Small merges +56 / 2,191,388 rows; memory-high +731 (25 during sampling); no big merge. Disk 69%, NRestarts=0, journal empty.
- Retain existing limits; continued reclaim and missing natural big-merge comparison keep resource acceptance open.
- Archived progress iterations 2627–2635 after PROGRESS.md exceeded 25 KB; recent entries now under 18 KB. No runtime changes.
- Verification: pnpm obs alerts; pnpm obs {services,sources,jobs} --check; curl /healthz; pnpm exec tsx scripts/sample-metrics-recovery.ts 2 30; python3 /tmp/2646-summarize.py; pnpm format; pnpm lint:fix; pnpm check; git diff --check.
- Receipts: /tmp/2646-{metrics.jsonl,metrics-error.log,summary.json,metrics-journal.log,services.json,sources.json,jobs.json,format.log,lint.log,check.log}.
- Full pnpm check exit 0: 1,070 unit / 329 integration passes, four expected skips.
- No provider calls, generation changes or restarts required; running application code remains aligned with main.
- Next: metrics checkpoint ≥18:55 UTC; runtime Tech grouping-status/default-off switch in the next pre-noon window, then scheduled acceptance.

## 2026-11-17: iteration 2647 — readable enlarged topic navigation

- Clean main at 76487e6c; no inherited work. Alerts clear; services, active sources, digest jobs and /healthz pass.
- Live 320px/300% reader exposed World/U.S. chips measuring 455/419px inside a 236px scroll area; their full labels could not be revealed.
- Chips now wrap within the available width; focus and active-topic changes reveal them horizontally without moving the edition vertically.
- Real published content passes all five topic anchors at 320/390px, light/dark and 100/200/300% text (12 combinations); targets remain below sticky navigation.
- Screenshots: docs/screenshots/ui/enlarged-topic-chips-{light,dark}.png; no generation, source or spending changes.
- Public HTTPS health and enlarged-label browser checks pass with public DNS; VM-local hostname mapping remains stale.
- Verification: pnpm build; pnpm exec tsx scripts/smoke-enlarged-topic-chips.ts; pnpm format; pnpm lint:fix; pnpm check; git diff --check.
- Receipts: /tmp/2647-{services.json,sources.json,jobs.json,build.log,build-web.log,browser.log,public.log,format.log,lint.log,check.log}.
- Full check exit 0: 1,070 unit / 329 integration passes, four expected skips; atomic web build deployed.
- Restarted news-digest-api.service after push; localhost /healthz passes.
- Next: metrics checkpoint ≥18:55 UTC; runtime Tech grouping-status/default-off switch in the next pre-noon window, then scheduled acceptance.

## 2026-11-17: iteration 2648 — visible desktop contents focus rings

- Clean main at e0ec89a9; no inherited work. Alerts, services, active sources, digest jobs and /healthz pass.
- Live desktop contents links start at the scroll panel's left edge; their 2px outline/2px offset clipped four pixels of keyboard focus.
- Contents-panel focus outlines now sit inside links, preserving link geometry and the edition position.
- Published content passes forward/backward focus and story navigation at 1280/1440px, light/dark, 100/200/300% text; screenshots refreshed.
- Verification: pnpm build; pnpm exec tsx scripts/smoke-contents-focus-ring.ts; pnpm format; pnpm lint:fix; pnpm check; git diff --check.
- Receipts: /tmp/2648-{services.json,sources.json,jobs.json,build.log,browser.log,format.log,lint.log,check.log}.
- Full check exit 0: 1,070 unit / 329 integration passes, four expected skips; git diff --check passes.
- Pushed 747895bb; atomic web build deployed and API restarted. Local/public HTTPS health pass (public DNS; default VM mapping stale).
- No provider calls or generation changes; Tech runtime work remains restricted to the next pre-noon window.
- Next: metrics checkpoint ≥18:55 UTC; explicit grouping result/default-off Tech switch before noon, then scheduled acceptance.

## 2026-11-17: iteration 2649 — visible mobile contents focus rings

- Clean main at 14c7bf2b; no inherited work. Alerts, services, active sources, digest jobs and /healthz pass.
- Reader weakness: mobile contents keyboard focus outlines clip when links reach the scroll area's top/bottom edges.
- Mobile contents links now draw outlines inside their bounds; geometry and story targets are preserved.
- Real published content passes forward/backward focus and Enter navigation at 320/390px, light/dark, 100/200/300% text.
- Removing the fix in-browser reproduces the failing visibility check; screenshots updated in docs/screenshots/ui/mobile-contents-focus-{light,dark}.png.
- Verification: pnpm build; pnpm exec tsx scripts/smoke-mobile-contents-focus.ts; pnpm format; pnpm lint:fix; pnpm check; git diff --check.
- Receipts: /tmp/2649-{build.log,browser.log,baseline.log,format.log,lint.log,check.log}.
- Full check exit 0: 1,070 unit / 329 integration passes, four expected skips; git diff --check passes. Initial check interrupted at lint; complete rerun passed.
- Pushed 7146b56b; atomic web build deployed and API restarted. Local/public HTTPS health pass (public DNS override); no provider calls or generation changes.
- Next: metrics checkpoint ≥18:55 UTC; Tech runtime grouping result/default-off switch in the next pre-noon window.

## 2026-11-17: iteration 2650 — natural metrics big-merge checkpoint

- Clean main at c33e1930; no inherited work. Owner value: verify metrics survives natural compaction without weakening morning-edition protection.
- Nine read-only samples span 18:48–18:56 UTC; 24 healthy rules and 18 uncached expected-series queries pass.
- Natural 28,008,902-row/14-part big merge completed 18:09:56 in 103.802 s; eight historical up points across the merge equal 1.
- No new admission, timeout, slow-query, evaluator error/missed, process-start or OOM events since 17:50:50.
- Memory-high pressure continues; keep CPU 2% / 88 MiB high / 112 MiB max and resource acceptance open.
- Verification: pnpm obs alerts/services/sources/jobs (--check where supported); local/public HTTPS health; pnpm build; pnpm check; pnpm format; pnpm lint:fix; git diff --check.
- Full check: 1,070 unit / 329 integration passes, four expected skips. Atomic web build deployed; no provider calls or generation changes.
- Receipts: /tmp/2650-{metrics.jsonl,summary.json,metrics-journal.log,merge-up.json,check.log,build.log,format.log,lint.log,public.log}.
- Next: metrics ≥20:00 UTC; Tech runtime grouping-status/default-off switch in next pre-noon window.

## 2026-11-17: iteration 2651 — compact story summary spacing

- Clean main at 397f513e; no inherited work. Alerts clear; 14 services healthy, active sources collecting and digest queue healthy; local health passes.
- Owner value: enlarged-text readers can scan all 25 stories without unnecessary blank space around every summary.
- Story summaries, unavailable-summary notices and continuation links now use fixed 12px vertical margins; fonts still enlarge normally.
- Browser baseline reproduces 36px summary margins at 300% text (48px font); changed margins remain 12px.
- Verification: pnpm build; pnpm exec tsx scripts/smoke-story-summary-spacing.ts; pnpm format; pnpm lint:fix; pnpm check; git diff --check.
- Browser check uses published content only, blocks external requests/writes, checks all 25 summaries and source-link keyboard focus in 12 combinations; screenshots updated.
- Receipts: /tmp/2651-{alerts,services,sources,jobs,build,browser,format,lint,check}.log.
- Full check exit 0: 1,070 unit / 329 integration passes, four expected skips; initial command session terminated during formatting, complete transient-service rerun passed.
- Atomic web build deployed; screenshots visually reviewed; no provider calls or generation changes. Public health passes using public DNS override (default VM mapping stale).
- Next: metrics checkpoint ≥20:00 UTC; Tech grouping-status/default-off switch in the next pre-noon deployment window.

## 2026-11-17: iteration 2652 — remove obsolete reader styles

- Clean main at 0959146b; no inherited work. Alerts clear, 14 services healthy, active sources collecting, digest queue healthy.
- Investigated suspected enlarged-text X fallback spacing; the selector was unused, so no reader defect was claimed or patched.
- Removed 68 lines of unreferenced headline/status/post-method CSS left by earlier UI implementations; active reader rules retained.
- Archived completed TASKS markers 2624–2646; open tasks and priority order unchanged.
- Verification: pnpm build; pnpm exec tsx scripts/smoke-story-summary-spacing.ts (12 combinations, 25 real summaries each); source selector search.
- Read-only browser probe finds zero obsolete-selector matches on reader/archive/saved pages; initial extra /status probe used a nonexistent route.
- No visible layout change; discarded nondeterministic desktop screenshot refreshes. No provider calls or generation changes.
- pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 1,070 unit / 329 integration tests, four expected skips.
- Atomic web build deployed; local/public HTTPS health pass (public DNS override; VM mapping remains stale). API restart at handoff.
- Receipts: /tmp/2652-{build,browser,css-final,format-final,lint-final,check}.log.
- Next: metrics checkpoint ≥20:00 UTC; Tech runtime grouping result/default-off switch in next pre-noon window.

## 2026-11-17: iteration 2653 — compact expanded post explanations

- Clean main at ffb354e4; no inherited work. Alerts clear, 14 services healthy, active sources collecting; digest queue has zero failed jobs.
- Reader weakness: expanded social explanations inherited 42px paragraph margins at 300% text, adding large blank gaps around the note.
- Set explanation margins to fixed 12px while preserving enlarged type, source text and disclosure controls.
- Verification: pnpm build; pnpm exec tsx scripts/smoke-reader-context-targets.ts; pnpm format; pnpm lint:fix; pnpm check; git diff --check.
- Browser: eight real published notes, 18 combinations (320/390/1440px, light/dark, 100/200/300%); margins/type, 44px targets, keyboard/touch disclosure and overflow pass.
- Six screenshots updated; mobile light screenshot visually reviewed. Initial probe lacked trusted-proxy visitor header and timed out; corrected published-content probe passed.
- No provider calls or generation changes. Atomic web build deployed; pnpm check exit 0: 1,070 unit / 329 integration passes, four expected skips. Local/public HTTPS health pass; API restart at handoff.
- Receipts: /tmp/2653-{build,browser,sources,jobs,format,lint,check}.log.
- Next: metrics checkpoint ≥20:00 UTC; Tech runtime grouping result/default-off switch in next pre-noon window.

## 2026-11-17: iteration 2654 — expose explicit grouping outcome

- Clean main at 9030c8bb; no inherited work. Alerts clear; services, active sources and digest queue checks pass; local health healthy.
- Tech prerequisite: valid empty membership and a refused/failed grouping call previously shared the same empty-array return.
- Added public validated/unavailable grouping result with bounded skip/failure reasons; retained legacy group API, membership, prompts, fingerprint, no-repair behavior and budgets.
- No admission switch/selection change or provider calls. Runtime shortlist consumption/default-off Tech switch remain for the next pre-noon step.
- Targeted: pnpm exec tsx --test apps/api/test/{event-grouping,group-shortlist,event-grouping-evaluation-ledger}.test.ts — 25 pass.
- pnpm format, pnpm lint:fix, pnpm build and corrected-tree pnpm check pass: 1,072 unit / 329 integration passes, four expected skips. Initial full check raced export-sort autofix; rerun passed.
- API/worker restarted; 14 services healthy, digest queue healthy; local/public HTTPS health pass. Public edition serves five topics/25 stories/20 posts.
- Public check uses current public DNS override; default VM hostname mapping still refuses port 443. No UI changes; no screenshot update needed.
- Receipts: /tmp/2654-{targeted,format,lint,build,check-final,services-final,jobs-final}.log; git diff --check passes.
- Next: metrics checkpoint ≥20:00 UTC; wire explicit grouping status into Tech reservation before natural scheduled acceptance.

## 2026-11-17: iteration 2655 — due metrics recovery checkpoint

- Clean main at 5c77994d; no inherited work. Alerts clear; 14 monitored services, active sources and digest queue pass; Destructoid remains paused.
- Six read-only samples 19:56:37–20:01:39 UTC: 24 healthy rules, 12 uncached queries ≤0.753 s; no new admission/timeout/slow-query/evaluator/OOM events or process restart.
- Since prior checkpoint: 65 small merges / 2,151,711 rows; no new big merge. Memory-high +841 (+88 during sampling), ending 89,276,416 bytes / lifetime peak 93,560,832; disk 71%.
- Retain CPU 2% / MemoryHigh 88 MiB / MemoryMax 112 MiB; continued reclaim leaves resource acceptance open. No retuning, forced merge or provider calls.
- Updated capacity evidence/TASKS; archived iterations 2636–2645 to keep PROGRESS below 25 KB. No product/runtime change or screenshot refresh required.
- Verification: pnpm exec tsx scripts/sample-metrics-recovery.ts 5 60; python3 /tmp/2655-summarize.py; pnpm obs services/sources/jobs --check; local/public HTTPS health; five published topics/25 stories/20 posts.
- pnpm check passes: 1,072 unit / 329 integration tests, four expected skips; pnpm format, pnpm lint:fix and git diff --check pass. Documentation-only; existing build retained.
- Receipts: /tmp/2655-metrics.jsonl, /tmp/2655-summary.json and /tmp/2655-{metrics-journal,services,sources,jobs,check,format,lint}.log. API/worker restart and final health at handoff.
- Next: metrics checkpoint ≥21:05 UTC; Tech grouping status/shortlist preparation and default-off switch before the next noon deployment window.

## 2026-11-17: iteration 2656 — prepare explicit shortlist grouping status

- Clean main at b2065ed6; no inherited work. Alerts, services, active sources, queues and local health pass; Destructoid remains paused.
- Owner value: future Tech evidence reservations can distinguish deliberate separate events from failed grouping without risking duplicate event admission.
- Added isolated prepareStoryGrouping transport with validated/unavailable status, explicit matcher and membership; publication remains on the existing path.
- No runtime consumer, switch, selection change or provider calls; deployment/activation remains restricted to before noon UTC.
- Four offline tests cover empty validation, rank/coverage transport, failed/invalid membership and bounded no-call inputs.
- Verification: pnpm exec tsx --test apps/api/test/prepare-story-grouping.test.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build. All pass: 1,076 unit / 329 integration, four expected skips; build succeeds.
- Nine combined targeted tests pass; public HTTPS health and edition pass (five topics/25 stories/20 posts). Initial local reader probe returned 429; public probe succeeded.
- API/worker restart at handoff; receipts /tmp/2656-{targeted-final,format,lint,check,build,services,sources,jobs}.log. No UI change or screenshot refresh.
- Next: connect preparation/default-off Tech runtime switch before noon; metrics checkpoint ≥21:05 UTC.
