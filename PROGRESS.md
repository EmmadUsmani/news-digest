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

## 2026-11-17: iteration 2636 — resolve Tech grouping replay and diversity baseline

- Clean main at ec22db91; no inherited changes. Alerts clear; database/Redis health pass.
- Read-only forty-article grouping cache hit validates five groups; rank reproduces all ten actual editor candidate IDs in order (asserted), closing the nine-ID mismatch.
- Actual grouped input still has one prose-bearing candidate. Semantic-order control with cached membership has four prose-bearing events/three nonempty leads, versus two articles in the duplicate-heavy ungrouped control.
- Eight of the first ten semantic articles cover California's OpenAI lawsuit; retaining non-lead group evidence matters. China restriction/distillation/buyer-risk boundaries still need independent review.
- Updated review/tasks; no production ranking/source/cap changes or provider calls. No restart under protected window; documentation-only change leaves live code aligned.
- Verification: pnpm exec tsx /tmp/2636-replay.ts --read-only-cache; ordered-ID equality and independent prose/group-count assertions pass. Receipts /tmp/2636-replay.{ts,json}.
- Verification: pnpm format; pnpm lint:fix; pnpm check (exit 0: 1,062 unit/329 integration passes, four expected skips); git diff --check. Logs /tmp/2636-{format,lint,check}.log.
- Next: China event-boundary and story-value comparison before proposing ranking changes; metrics checkpoint ≥16:40 UTC.

## 2026-11-17: iteration 2637 — close Tech boundary and story-value comparison

- Clean main at 92e1726b; no inherited changes. Alerts clear; database/Redis health pass; disk 70%.
- Offline event-set assertions pass: four shared events/six substitutions between actual and grouped semantic controls; both China singleton excerpts empty. Receipt /tmp/2637-comparison.json.
- Title-level review separates model distillation from compute restrictions provisionally; buyer warning has no supported separate development. Eight-member access group still lacks article-level boundary validation.
- California lawsuit/Google attack rank strongly in saved triage but miss actual ten; semantic control also loses relevant Windows tooling coverage. Retain ranking; no paid calls or production writes.
- Review/tasks updated; next preserve attributed non-lead prose within existing editor-input bounds (California positive/all-empty China negative). Bounded ranking comparison closed.
- Verification: offline Python set/excerpt assertions; pnpm format; pnpm lint:fix; pnpm check; git diff --check. Receipts /tmp/2637-{format,lint,check}.log.
- Full check exit 0: 1,062 unit / 329 integration passes, four expected skips; diff check passes.
- Documentation-only change; live application code remains aligned, no rebuild/restart required. No new blockers or source changes.

## 2026-11-17: iteration 2638 — verify existing non-lead Tech evidence transport

- Clean main at 3a2a1485; no inherited work. Alerts clear; /healthz database/Redis pass.
- Read-only cached replay records California nine-member/China eight-member groups as offline regression inputs, not accepted event-boundary labels.
- Existing projection already carries the California non-lead Verge report: empty representative, separately sourced 600/649 characters, unchanged IDs/order and saved URL/source attribution.
- Both local editor attempts fit existing byte/member bounds; all-empty China stays empty. Recorded publisher is null; The Verge source label survives without guessing publisher metadata.
- Added recorded fixture and regression; corrected review/tasks to close the proposed transport fix as already implemented. No ranking/runtime/source changes, provider calls or production writes.
- Verification: pnpm exec tsx /tmp/2638-replay.ts --read-only-cache; targeted tech-group-evidence test; pnpm format; pnpm lint:fix; pnpm check; git diff --check.
- Full check exit 0: 1,063 unit / 329 integration passes, four expected skips. Receipts /tmp/2638-{targeted,format,lint,check}.log.
- Tests/docs only; live code remains aligned, no rebuild/restart needed. Generation restriction after 12:00 UTC retained.
- Next: define bounded semantic admission with event diversity and Windows tooling tradeoff; implement only in an allowed generation-change window. Metrics checkpoint remains due ≥16:40 UTC.

## 2026-11-17: iteration 2639 — bound the Tech admission proposal

- Clean main at 882faa7c; no inherited work. Alerts clear; /healthz database/Redis pass.
- Defined a proposed two-event semantic reservation plus eight baseline slots in docs/RANKING.md; no runtime or ranking change.
- Preserves current group representatives, coverage and evidence; no prose bonus, extra provider calls, budgets or synthetic ranking sweep.
- Nov 17 expected tradeoff retains Windows rank one; California/Google enter, macOS permissions/U.S.–China overview leave. No claim of superior final selections.
- Grouping/triage failure must keep baseline; implementation needs an explicit grouping-success result, Tech-only default-off switch and bounded offline tests.
- Next: implement before noon in an allowed window, accept on a natural edition; metrics checkpoint remains due >=16:40 UTC.
- Verification: pnpm format; pnpm lint:fix; pnpm check; git diff --check. Receipts /tmp/2639-{format,lint,check}.log.
- Full check exit 0: 1,063 unit / 329 integration passes, four expected skips. Documentation-only change leaves live application code aligned; no rebuild/restart needed.

## 2026-11-17: iteration 2640 — execute the bounded Tech admission control offline

- Clean main at 726326e8; no inherited work. Alerts clear and /healthz database/Redis pass; active sources healthy, digest queue zero failures/next run Nov 18 15:00 UTC.
- Owner value: makes the proposed Tech evidence-admission tradeoff reproducible before risking the next natural edition; noon cutoff keeps production unchanged.
- Recorded all forty eligible articles/21 ranked events and saved scores; first ten IDs reproduce the published editor admission. Cached grouping is provisional, not accepted boundary truth.
- Pure offline control defaults off, requires explicit Tech/complete triage/validated grouping, reserves two events and preserves original event objects/coverage/order; invalid membership or scores keep baseline.
- California/Google enter; Windows remains; macOS permissions/U.S.–China overview leave. California keeps ranked Black Chronicle lead, rather than semantic-order Washington Times lead.
- Four control tests cover recorded tradeoff, zero/one/two replacements, short pools, ties, preserved membership/identity and fallback; existing California/China evidence regression also passes (five targeted tests).
- Verification: pnpm exec tsx scripts/evaluate-tech-admission.ts --recorded-tech; targeted control/evidence tests; pnpm format; pnpm lint:fix; pnpm check; git diff --check. Receipts /tmp/2640-control.json and /tmp/2640-{targeted,cleanup-targeted,format,lint,check-rerun}.log.
- First check found cleanup-test /proc scan race (1,066/1,067 units passed); initial stale-folder assertion now retries the same fail-closed scan outcome as its existing post-kill check. Targeted cleanup passes; full rerun exit 0: 1,067 unit/329 integration passes, four expected skips.
- No provider calls, runtime imports, source changes, rebuild or service restart needed; live application code remains aligned.
- Next: explicit grouping-success result/default-off runtime switch before noon; natural scheduled acceptance afterward. Metrics checkpoint remains due >=16:40 UTC.

## 2026-11-17: iteration 2641 — due metrics recovery checkpoint

- Clean main at f9501ea3; no inherited changes. Alerts clear; /healthz database/Redis pass.
- Three read-only samples: 24 healthy rules/six passing uncached queries, maximum 2.783 s; one admission-limit event occurred during sampling.
- Since 2635: +74 small merges/1,880,099 rows, no big merge; +981 memory-high events (21 during sampling), no max/OOM/kill events.
- Queue-timeout, slow-query, process-start and evaluator error/missed counters unchanged; NRestarts=0, journal empty, disk 70%.
- Services 14/14, active-source checks and digest queue pass (zero failed, next Nov 18 15:00 UTC); Destructoid remains paused.
- Retain CPU 2%/88 MiB high/112 MiB max; resource acceptance open. Next passive check >=17:55 UTC.
- Corrected Tech handoff to the next pre-noon deployment window; current time is after the generation cutoff. No provider calls or runtime changes.
- Verification: pnpm exec tsx scripts/sample-metrics-recovery.ts 2 30; python3 /tmp/2641-summarize.py; pnpm obs services/sources/jobs --check; pnpm format; pnpm lint:fix; pnpm check; git diff --check.
- Receipts: /tmp/2641-{metrics.jsonl,metrics-error.log,summary.json,services.json,sources.json,jobs.json,format.log,lint.log,check.log}.
- Full check exit 0: 1,067 unit/329 integration passes, four expected skips. Documentation-only checkpoint; running application code remains aligned, so no rebuild or restart needed.

## 2026-11-17: iteration 2642 — keep saved-item removal focus visible

- Clean main at e0d70b46; no inherited changes. Alerts clear, 14 services healthy; /healthz database/Redis pass, active sources and digest queue pass (next Nov 18 15:00 UTC).
- Owner value: keyboard readers can remove saved items without losing their place offscreen. Generation work stays deferred to the next pre-noon window.
- Real five-story reproduction at 390px/200% left the next focused Remove button 1,188–2,208px below the viewport after deletion.
- Focus now moves after bookmark layout updates; nearest scrolling and 8px scroll margins keep the neighbor or final heading visible, including the focus ring.
- Browser-local saves of published stories; first/middle/last/final removal verified at 1440/390/320px, both themes and 100%/200% text (60 removals). No server writes or external calls.
- Verification: pnpm exec tsx scripts/smoke-reader-saved-removal.ts; pnpm format; pnpm lint:fix; pnpm check; python3 scripts/deploy-web.py; git diff --check. Receipts /tmp/2642-{browser,format,lint,check,build}.log; screenshots docs/screenshots/ui/saved-removal-{light,dark}.png.
- Atomic web publication updates live assets without app downtime or a service restart; no generation, source, budget or handbook behavior change.
- Public HTTPS curl could not connect from this VM; local latest endpoint serves 6216cb7a with five topics/25 stories. Public-path acceptance not claimed.
- Initial combined verification command was terminated (143) during format:check after passing typecheck/lint. Separate full rerun exit 0: 1,067 unit/329 integration passes, four expected skips; receipt /tmp/2642-check-rerun.log.
- Next: metrics checkpoint >=17:55 UTC; Tech explicit grouping result/default-off switch in the next pre-noon deployment window.

## 2026-11-17: iteration 2643 — explain offline Tech reservations

- Clean main at 397eb56c; no inherited work. Alerts clear; services, active sources, queue and /healthz pass.
- Advances item 59 Tech depth: recorded admission now emits winning member, semantic scores and baseline position independently of the preserved event representative/coverage.
- California's winning non-lead scores 8/9; Google's lead scores 8/8. Both are outside the baseline ten; Windows remains and exactly two baseline events leave.
- Five offline tests pass, including receipt-to-member/score identity, baseline positions, score-order stability and empty receipts on fallback.
- Verification: pnpm exec tsx --test apps/api/test/tech-admission-control.test.ts; pnpm exec tsx scripts/evaluate-tech-admission.ts --recorded-tech; pnpm format; pnpm lint:fix; pnpm check; git diff --check.
- Receipts: /tmp/2643-{targeted.log,control.json,services.json,sources.json,jobs.json,format.log,lint.log,check.log}.
- Full check exit 0: 1,068 unit/329 integration passes, four expected skips.
- No provider calls or runtime changes; no rebuild/restart required, running application code remains aligned with main.
- Next: metrics checkpoint >=17:55 UTC; explicit production grouping status/default-off Tech switch in the next pre-noon window, then scheduled acceptance.

## 2026-11-17: iteration 2644 — verify reserved Tech evidence end to end

- Clean main at bac260b0; no inherited work. Alerts clear; 14 services, active sources, digest queues and /healthz pass.
- Owner value: before activation, prove the proposed California reservation delivers attributed reporting to the editor rather than only another headline.
- Recorded forty eligible public inputs reconstruct all 21 ranked events and the exact published baseline ten through real ranking; cached boundaries remain provisional.
- Enabled control preserves California’s Black Chronicle lead and its Verge member’s 600-character report/source label/original citation URL through real editor serialization.
- China and Google remain headline-only; source-text events rise only 1→2 of ten. Windows stays; displaced evidence is unavailable for citation.
- Seven targeted tests pass, including both locally captured editor attempts, prompt bounds and immutable citation transport; no fabricated edited output or provider calls.
- CLI now reports baseline/control source-text counts and attributed evidence-member lengths without printing prose.
- Verification: pnpm exec tsx --test apps/api/test/{tech-admission-control,tech-admission-evidence,tech-group-evidence}.test.ts; pnpm exec tsx scripts/evaluate-tech-admission.ts --recorded-tech; pnpm format; pnpm lint:fix; pnpm check; git diff --check.
- Receipts: /tmp/2644-{targeted.log,control.json,services.json,sources.json,jobs.json,format.log,lint-final.log,check.log}.
- Full check exit 0: 1,069 unit/329 integration passes, four expected skips. Runtime code unchanged; no rebuild/restart required, live application remains aligned.
- Next: metrics checkpoint >=17:55 UTC; explicit production grouping status/default-off Tech switch in next pre-noon window, then natural scheduled acceptance.

## 2026-11-17: iteration 2645 — explain offline Tech admission fallback

- Clean main at 74dcee82; no inherited work. Alerts clear; services, active sources, queues and /healthz pass.
- Tech's thin evidence remains the reader weakness; offline admission now distinguishes evaluated inputs from exact-baseline fallback before runtime activation.
- Receipts identify disabled/non-Tech, grouping/triage failure, ambiguous IDs and invalid membership/scores; successful short pools remain distinguishable from refusal.
- Eight targeted tests pass; recorded CLI still reports source-text events 1→2, unchanged reservations/evidence transport. Cached semantic boundaries remain provisional.
- Verification: pnpm exec tsx --test apps/api/test/{tech-admission-control,tech-admission-evidence,tech-group-evidence}.test.ts; pnpm exec tsx scripts/evaluate-tech-admission.ts --recorded-tech; pnpm format; pnpm lint:fix; pnpm check; git diff --check.
- Full check exit 0: 1,070 unit/329 integration passes, four expected skips. Receipts: /tmp/2645-{targeted.log,control.json,services.json,sources.json,jobs.json,format.log,lint.log,check.log}.
- No provider calls or runtime changes; no rebuild/restart needed, live application code remains aligned with main.
- Next: metrics checkpoint ≥17:55 UTC; runtime grouping status/default-off Tech switch in the next pre-noon window, then scheduled acceptance.

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
