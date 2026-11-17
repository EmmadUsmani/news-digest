# Progress

[Earlier entries](docs/progress-archive/2026-11-17-progress-before-2575.md).

[Iterations 2575–2582](docs/progress-archive/2026-11-17-iterations-2575-2582.md)

[Iterations 2583–2590](docs/progress-archive/2026-11-17-iterations-2583-2590.md)

[Iterations 2591–2597](docs/progress-archive/2026-11-17-iterations-2591-2597.md)

[Iterations 2598–2603](docs/progress-archive/2026-11-17-iterations-2598-2603.md)

[Iterations 2604–2610](docs/progress-archive/2026-11-17-iterations-2604-2610.md)

[Iterations 2611–2618](docs/progress-archive/2026-11-17-iterations-2611-2618.md)

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

## 2026-11-17: iteration 2623 — compact brief/story spacing and restore topic gaps

- Clean main at c7122c51; no inherited work. Health/services/active sources/jobs pass; Destructoid remains paused pending documented publisher access. Next edition 15:00 UTC.
- Reader benefit / STEERING 38/42: enlarged reader text inflated brief/list margins and gaps. Fixed 24px margins, 8px brief gaps and 16px story gaps preserve reading density; 300% saves 48px per margin and 32px per story gap.
- Browser discovery: existing zero topic margins suppress parent space-y entirely. Explicit flex-column gap restores 64px separation between topics at every reader size; no changes to generation or costs.
- All 12 browser combinations pass (320/1440px, 100–300%, both themes): computed brief/list/topic spacing, enlarged real content, keyboard brief-to-story navigation and no horizontal overflow.
- Screenshots docs/screenshots/2623-topic-spacing-{light,dark}.png inspected; desktop 200% framing shows brief/story boundary. Initial browser assertion exposed the ineffective topic spacing; final build passes.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2623-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2623-{format*,lint*,build*,browser,check}.log.
- Full pnpm check exits 0: 1,062 unit / 329 integration passes, four expected skips. Atomic web deployment serves final code; no restart under STEERING 22. No paid calls.
- Due metrics 13:14:57–13:15:57: 24 healthy rules/six queries pass; zero admission/failure deltas, 61 small merges, no big merge, +770 memory-high events; disk 68%, NRestarts=0. Retain limits; decision 0004 updated.
- Next: metrics ≥14:20 UTC; natural edition/Tech/social review after 15:00 UTC. Protect production generation during the scheduled window.

## 2026-11-17: iteration 2624 — align loading and loaded edition columns

- Clean main at b4349696; no inherited work. Alerts clear, health database/Redis pass and app services running. Destructoid remains blocked pending documented publisher access.
- Reader benefit / STEERING 38/42: enlarged text expanded the loading sidebar to 720px at 300%, squeezing placeholders before real stories appeared. Fixed 240px sidebar, 24px gap and 80px mobile / 40px desktop top spacing align loading with the loaded reader.
- All 12 browser combinations pass (320/1440px, 100–300%, both themes): delayed actual edition response, accessible loading status, identical loading/loaded story-column position and width, real published content and no horizontal overflow.
- Screenshots docs/screenshots/2624-loading-layout-{light,dark}.png inspected. Delayed network response uses live saved edition data, not fixture content.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2624-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2624-{format,lint,build,browser,check}.log.
- Full pnpm check exits 0: 1,062 unit / 329 integration passes, four expected skips; final format/lint, health, alerts and diff checks pass.
- Atomic web publication serves final code; no service restart under STEERING 22. No generation, source, budget or handbook behavior changes; no paid calls.
- Next: metrics ≥14:20 UTC; natural edition/Tech/social review after 15:00 UTC. Protect production generation during scheduled window.

## 2026-11-17: iteration 2625 — compact archive loading preview

- Clean main at 3bc5ec73; no inherited work. Initial alerts clear, health database/Redis pass and app services running. Destructoid remains blocked pending documented publisher access.
- Reader benefit / STEERING 38/42: archive loading rows inflated to 360px at 300% while loaded rows use fixed padding. Fixed 32px outer margins, 20px row padding, 12px gaps and decorative bar sizes keep each preview row at 120px plus divider.
- All 12 browser combinations pass (320/1440px, 100–300%, both themes): accessible delayed loading, stable list width/position, real archive coverage links, keyboard navigation into published content and no horizontal overflow.
- Screenshots docs/screenshots/2625-archive-loading-{light,dark}.png inspected. Initial geometry assertion omitted the 1px divider; initial archive response hit HTTP 429 on shared loopback. Distinct test client addresses pass; production limits unchanged.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; node /tmp/2625-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2625-{format,lint,build,browser,check}.log.
- Full pnpm check exits 0: 1,062 unit / 329 integration passes, four expected skips. Final formatting/lint, health, alerts and diff checks pass.
- Atomic web publication serves final code; no restart under STEERING 22. No source, generation, budget or handbook behavior change; no paid calls.
- Next: metrics ≥14:20 UTC; natural edition/Tech/social review after 15:00 UTC. Protect scheduled production generation.

## 2026-11-17: iteration 2626 — separate saved-post links after emoji

- Clean main at 7d049cba; no inherited work. Health database/Redis pass, alerts clear, disk 69%; 14 monitored services healthy, sources healthy, digest queue has zero failures.
- Reader benefit / STEERING 38/42: the real Gaming post joins a trophy emoji directly to a URL. Existing visual separation covered words but missed emoji; the rule now covers adjacent symbols while preserving opening brackets, saved text and destinations.
- All 12 browser combinations pass (320/1440px, 100–300%, both themes): actual published Gaming text unchanged, visible separation, exact URL, keyboard focus and no horizontal overflow. Nine focused emoji/text/bracket/whitespace cases pass.
- Screenshots docs/screenshots/2626-post-link-{light,dark}.png inspected. Reframed screenshots around the focused link after the first framing omitted it; final browser matrix passes.
- Verification: pnpm format; pnpm lint:fix; VITE_PUBLIC_MODE=1 python3 scripts/deploy-web.py; pnpm exec tsx /tmp/2626-link-cases.ts; node /tmp/2626-verify.cjs; pnpm check; git diff --check. Receipts /tmp/2626-{format,lint,build,browser,check}.log.
- Full pnpm check retry exits 0: 1,062 unit / 329 integration passes, four expected skips. Initial attempt stopped on new archive formatting; fixed before retry. Archived older progress/task markers with retained links.
- Atomic web publication serves final code; no service restart under STEERING 22. No generation, source, budget or handbook behavior changes; no paid calls.
- Next: metrics ≥14:20 UTC; natural edition/Tech/social review after 15:00 UTC. Destructoid remains blocked pending publisher access; protect scheduled generation.

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
