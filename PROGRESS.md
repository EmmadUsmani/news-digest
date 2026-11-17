# Progress

[Earlier entries](docs/progress-archive/2026-11-17-progress-before-2575.md).

[Iterations 2575–2582](docs/progress-archive/2026-11-17-iterations-2575-2582.md)

[Iterations 2583–2590](docs/progress-archive/2026-11-17-iterations-2583-2590.md)

[Iterations 2591–2597](docs/progress-archive/2026-11-17-iterations-2591-2597.md)

[Iterations 2598–2603](docs/progress-archive/2026-11-17-iterations-2598-2603.md)

[Iterations 2604–2610](docs/progress-archive/2026-11-17-iterations-2604-2610.md)

[Iterations 2611–2618](docs/progress-archive/2026-11-17-iterations-2611-2618.md)

[Iterations 2619–2626](docs/progress-archive/2026-11-17-iterations-2619-2626.md)

## 2026-11-17: iteration 2627 — compact expanded story coverage

- Clean main at 821a3093; no inherited work. Health database/Redis pass, alerts clear, disk 69%. Destructoid remains blocked pending documented publisher access.
- Reader benefit / STEERING 38/42: expanded coverage spacing grew threefold at 300% text, adding scrolling between real reports. Fixed report, metadata and outlet gaps preserve text enlargement while keeping related coverage together.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2627-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2627-{format,lint,build,browser,check}.log.
- Browser matrix: 320/1440px, 100–300%, both themes; actual saved coverage, fixed 12px report gaps, enlarged article text, keyboard disclosure/link access and no horizontal overflow. Screenshots docs/screenshots/2627-coverage-{light,dark}.png.
- Full pnpm check exits 0: 1,062 unit and 329 integration passes, four expected skips. Final health, alerts, formatting/lint and diff checks pass.
- Screenshots inspected in both themes. Initial browser assertion used the wrong margin side; corrected for Tailwind’s end-margin spacing, then all 12 combinations passed.
- Atomic web publication; no restart under STEERING 22. No source, generation, budget or handbook behavior changes; no paid calls.
- Next: metrics ≥14:20 UTC; edition/Tech/social review after 15:00 UTC. Protect scheduled generation.

## 2026-11-17: iteration 2628 — keep video previews visible with enlarged text

- Clean main at 179e256b; no inherited work. Health database/Redis pass, alerts clear, disk 69%; 14 monitored services and source-health checks pass. Destructoid remains paused pending documented publisher access.
- Reader benefit / STEERING 38/42: the real NBA Bluesky video’s decorative play badge grew to 120×120px at 300% text, obscuring the preview. Keep its size at 40px, inset at 12px and glyph at 16px while post text continues to enlarge.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2628-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2628-{format,lint,build,browser,check}.log.
- Browser matrix covers 320/1440px, 100–300%, both themes: actual NBA video thumbnail, fixed badge geometry, enlarged post text, named original-video link, keyboard focus and no horizontal overflow. Screenshots docs/screenshots/2628-video-{light,dark}.png.
- Browser probe fixes: wait for the actual video link, allow the thumbnail CDN redirect, decode the lazy image and select the nearest post article. All 12 combinations pass; both screenshots inspected.
- Full pnpm check exits 0: 1,062 unit / 329 integration passes, four expected skips. Final health, alerts and diff checks pass.
- Atomic web publication; no service restart under STEERING 22. No source, budget or handbook behavior changes; no paid calls.
- Next: metrics ≥14:20 UTC; edition/Tech/social review after 15:00 UTC. Protect scheduled generation.

## 2026-11-17: iteration 2629 — bounded metrics recovery checkpoint

- Clean main at fce81d80; no inherited work. Health database/Redis pass, alerts clear, 14 monitored services active, active-source checks pass; Destructoid remains paused. Digest queue has zero failures; next scheduled run 15:00 UTC. Disk 69%.
- Owner benefit / Current order 1: measured whether the constrained metrics store can still protect the scheduled edition; three samples spanning the due 14:20 checkpoint establish fresh rules and responsive queries without changing production.
- All 24 rules healthy/fresh; six expected-series queries ≤0.658 s. Since 13:15:57: no admission/query/evaluator failures or restarts, +66 small merges/4,972,131 rows, +737 memory-high events, no big merge or OOM. Resource acceptance remains open; retain limits.
- Evidence: pnpm exec tsx scripts/sample-metrics-recovery.ts 2 30; python3 /tmp/2629-summarize.py; systemctl show obs-metrics; journalctl since previous checkpoint (no entries). Receipts /tmp/2629-{metrics.jsonl,summary.json,metrics-error.log,metrics-journal.log}.
- No app/config changes, paid calls, force merge or service restart; running app remains aligned with main under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check (exit 0: 1,062 unit / 329 integration passes, four expected skips); pnpm exec tsx scripts/check-handbook.ts observability (19 pages, one diagram, 39 tables pass); git diff --check. Receipts /tmp/2629-{format,lint,check,handbook}.log.
- Next: natural edition/Tech/social review after 15:00 UTC; bounded metrics checkpoint ≥15:25 UTC.

## 2026-11-17: iteration 2630 — keep topic names readable with enlarged text

- Clean main at e2a38c7b; no inherited work. Health database/Redis pass, alerts clear, 14 monitored services active and active-source checks pass; disk 69%. Destructoid remains paused pending publisher access.
- Reader benefit / STEERING 38/42: topic checkboxes grew from 16px to 48px at 300% text, crowding real topic names on mobile. Keep controls at 16px while labels enlarge and their full rows remain clickable (minimum 44px).
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2630-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2630-{format,lint,build,browser,check}.log.
- Browser matrix: 320/1440px, 100–300%, both themes; all 12 combinations pass checkbox geometry, enlarged labels, 44px rows, keyboard hide/restore and focus return. Screenshots docs/screenshots/2630-topics-{light,dark}.png inspected.
- Full pnpm check exits 0: 1,062 unit / 329 integration passes, four expected skips. Final health, alerts and diff checks pass.
- Public HTTPS reader HTTP 200 and health database/Redis pass using public DNS from 1.1.1.1 with TLS verification intact; VM hosts entry points at an unreachable local address (known).
- Atomic web publication; no service restart under STEERING 22. No source, generation, budget or handbook behavior changes; no paid calls.
- Next: natural edition/Tech/social review after 15:00 UTC; metrics checkpoint ≥15:25 UTC.

## 2026-11-17: iteration 2631 — compact Bluesky media spacing with enlarged text

- Clean main at 9e899690; no inherited work. Health database/Redis pass, alerts clear, monitored services and active-source checks pass; disk 69%. Destructoid remains paused; digest queue has zero failures.
- Reader benefit / STEERING 38/42: the real NBA video caption's 8px margin became 24px at 300% text. Keep media/caption gaps at 8px and media minimum targets at 44px while caption/post text enlarges.
- Baseline browser probe reproduced 16px caption margin at 200% (expected 8px). No stored content, destinations, source, budget or generation changes; no paid calls.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2631-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2631-{format,lint,build,browser,check}.log.
- Browser matrix covers 320/1440px, 100–300%, both themes: real NBA thumbnail, 8px gaps, 44px minimum target, enlarged caption/post text, named original-video destination, keyboard focus and no overflow. Screenshots docs/screenshots/2631-video-{light,dark}.png.
- Full pnpm check exits 0: 1,062 unit / 329 integration passes, four expected skips; /tmp/2631-check-final.log. Initial foreground process ended with signal 143; reran via transient systemd user unit. Both screenshots inspected.
- Public HTTPS reader HTTP 200, health database/Redis pass, final alerts clear and diff check pass.
- Atomic web publication; no service restart under STEERING 22. Next: natural edition/Tech/social review after 15:00 UTC; metrics checkpoint ≥15:25 UTC.

## 2026-11-17: iteration 2632 — accept the scheduled public edition

- Clean main at 13ac3e73; no inherited work. Preflight/final health database/Redis pass, alerts clear, 14 services active, 37 active sources healthy; Destructoid paused. Disk 70%.
- Current order 1/3: accepted Nov 17 scheduled edition 6216cb7a at 15:04:07.594 UTC: 25 stories/20 posts, five AI story sections/zero unscored; World Haiku, other four Sonnet. Public latest/direct/history agree.
- World/U.S. selected/coverage IDs disjoint; NBA selected spoof absent. Gaming four X/one Bluesky, U.S. one X/two Bluesky. NBA saved context lines empty; Tech four empty selected excerpt sets remain. Review docs/edition-reviews/2026-11-17.md.
- Pre-run loader capture: Tech 29/200 nonempty eligible texts vs yesterday's initial 14; actual selection still headline-bound except Grok report. No generation change inferred from prospective supply.
- Edition ledger: $0.556285/65 successful calls, zero failures/unresolved/holds. Publication delay 247.594 s; timing reporter unavailable against public projection, worker duration unmeasured.
- Verification: pnpm format; pnpm lint:fix; pnpm check (exit 0: 1,062 unit / 329 integration passes, four expected skips); public scheduled-reader all-five-topic gate; node /tmp/2632-browser.cjs; git diff --check.
- Browser public HTTPS 390/1440px: latest/direct/history render, private routes 404, no page errors/overflow; screenshots /tmp/2632-{390,1440}.png inspected. Corrected probe's hidden contents match and separate request-client DNS; Chromium public DNS keeps TLS verification.
- First full check caught draft formatting; formatted and reran fully. Receipts /tmp/2632-{check-final,public-reader,browser-final}.log and private snapshot/summary/ledger/pool JSON. Digest queue 32 completed/zero failed or active; next Nov 18 15:00 UTC.
- No deployment/restart under STEERING 22 hold; documentation-only commit leaves running app aligned. No paid replay, manual generation, source, cap or sharing change.
- Next: investigate saved World Haiku outcome and Tech admission evidence without paid calls; bounded metrics checkpoint ≥15:25 UTC; retain NBA context and three-edition scope acceptance as open.

## 2026-11-17: iteration 2633 — diagnose saved World and Tech editor outcomes

- Clean main at fbe18345; no inherited changes. Health database/Redis pass, alerts clear, 14 services active; source check passes with Destructoid paused.
- World Sonnet initial/repair admitted; schema then unsupported-absence summary rejection caused Haiku fallback. Haiku token-truncated initial JSON failed; repair accepted. No budget refusal caused this outcome.
- Rejected response text unavailable: correctness of the absence rejection remains unknown; no guard relaxation or paid replay justified.
- Actual saved Tech prompt: 10 candidates, only Grok has a 600-character excerpt; nine have empty excerpts/cluster evidence. Four thin selections came from those nine; richer prospective reports absent from editor input.
- Worker logs recover edition duration 247,524 ms/job 247,535 ms; speed remains open. Evidence and next boundaries in docs/edition-reviews/2026-11-17.md.
- Verification: saved-input assertions; pnpm format; pnpm lint:fix; pnpm check; git diff --check. Receipts /tmp/2633-{format,lint,check}.log and worker JSONL.
- Full check exits 0: 1,062 unit / 329 integration passes, four expected skips; diff check passes.
- Documentation-only change; no generation/source/cap changes or provider calls. No deployment/restart during 13:00–16:00 hold; running code remains aligned with main.
- Next: investigate Tech candidate admission using saved evidence; retain NBA context/scope acceptance. Metrics checkpoint no earlier than 15:25 UTC.

## 2026-11-17: iteration 2634 — locate Tech evidence loss after admission

- Clean main at db2f402d; no inherited changes. Alerts clear; health database/Redis pass.
- Offline actual-score/prospective-pool control: all 200 IDs match; forty-article semantic admission retains eight text-bearing reports, ungrouped ten-item ranking only one (Grok).
- California OpenAI report ranks 2 semantically but 33 by recency/HN score; Microsoft 365 28→29, Intel 30→34. Seven text-bearing admitted reports lose before editing.
- Initial exact editor-ID assertion failed: ungrouped control reproduces nine of ten saved prompt IDs. Documented the mismatch; historical grouping/input differences remain unmeasured, no exact historical rank claimed.
- Saved prompt independently confirms all seven absent. Review updated with scores and next bounded comparison; no generation/ranking change or paid calls.
- Verification: pnpm exec tsx /tmp/2634-replay.ts; 200-ID set assertion; pnpm format; pnpm lint:fix; pnpm check; git diff --check. Receipts /tmp/2634-replay.json and /tmp/2634-{format,lint,check}.log.
- Full check exits 0: 1,062 unit / 329 integration passes, four expected skips; diff check passes.
- No deployment/restart during 13:00–16:00 hold; documentation-only change leaves live code aligned. Next: historical grouping replay/semantic-priority comparison; metrics checkpoint now due (≥15:25 UTC).

## 2026-11-17: iteration 2635 — metrics checkpoint and semantic-order control

- Clean main at d0b7fdc0; no inherited work. Alerts clear; health, 14 services, 37 active sources and digest queue pass; Destructoid remains paused.
- Three metrics samples: 24 healthy rules/six successful queries ≤1.276 s; no new admission-limit, timeout, slow-query, process-start, OOM or evaluator failures.
- Since 14:20:02: +68 small merges/1,907,668 rows, +794 memory-high events; no big merge, zero restarts. Disk 70%; retain limits, next check ≥16:40 UTC.
- Offline Tech semantic-order control retains California OpenAI/Grok text (two of ten vs heuristic one); only one actual editor ID overlaps. Eight candidates still lack prose; historical grouping/quality remain open.
- Updated decision/review/tasks; archived iterations 2619–2626 to keep progress compact. No production/source/cap changes or provider calls.
- Verification: pnpm exec tsx /tmp/2635-replay.ts; metrics sampler and /tmp/2635-summarize.py assertions; pnpm format; pnpm lint:fix; pnpm check; git diff --check.
- Full check exit 0: 1,062 unit / 329 integration passes, four expected skips; diff check passes. Receipts /tmp/2635-{format,lint,check}.log.
- No restart/deployment under 13:00–16:00 hold; documentation-only changes leave live code aligned. Next: historical grouping comparison and event-diversity review before any ranking change.

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
