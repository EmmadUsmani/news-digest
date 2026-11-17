# Progress

[Earlier entries](docs/progress-archive/2026-11-17-progress-before-2561.md).

## 2026-11-17: iteration 2561 — full rotation-day Bluesky comparison

- Clean main at a8572399; no inherited edits. Initial broad orientation truncated; recovered relevant instructions narrowly. Protected files untouched.
- Completed due Nov 16 full UTC-day review: all 24 jobs/120 positive matched topic counts; durable job record now includes final hours. Fixed-end read-only coverage preserves 25 strongest safe saved texts/URLs and all five topic counts.
- World 155 distinct posts versus 158 on mixed Nov 15; other topics 52–57. Concrete reporting leads coexist with commentary/keyword noise; no demonstrated supply growth or causal rotation effect. Retain queries, cadence, gates and budgets; natural Nov 17 selection remains next evidence.
- Updated source yield/tasks and review; no provider calls, collection, publication or runtime changes. No rebuild/restart needed under STEERING 22; live runtime already matches main.
- Health database/Redis, 14 services and 38 sources pass; alerts zero. Incorrect queue alias `digest` rejected without action; corrected digest-generation check retained privately.
- Verification: fixed-end coverage report, Python hourly/count/window/read-limit assertions; pnpm format, pnpm lint:fix, pnpm check (1,062 unit/329 integration passes, four expected skips) and git diff --check pass. Receipts /tmp/2561-{coverage.json,format,lint,check,health.json,services,sources,jobs}.log where applicable.
- Next: metrics checkpoint ≥00:16 UTC; retention timer 04:40 UTC; natural Tech/editor and social inputs Nov 17 at 15:00 UTC.

## 2026-11-17: iteration 2562 — due metrics checkpoint

- Clean main at 0b49d3b2; no inherited edits. Broad orientation output truncated; recovered task-relevant instructions narrowly. Protected paths untouched.
- Due 00:16:04–00:17:05 read-only checkpoint: 24 healthy rules/three samples, six uncached queries ≤1.736 s. Admission-limit counter rose 19→20 during sampling; unchanged-counter assertion correctly failed, inspected raw samples and retained actual delta.
- Queue-timeout/slow-query/evaluator error/missed/process-start counters unchanged; 74 small merges/1,689,754 rows, no big merge. Memory-high +744 (22 during sample), max/OOM/kill zero; metrics NRestarts=0 and journal empty. Disk 61%. Limits unchanged; acceptance open.
- Health database/Redis, 14 services and 38 sources healthy; alerts clear; digest-generation zero failed jobs/next run 15:00 UTC. Incorrect positional jobs option rejected read-only; corrected --queue command passes.
- Updated decision evidence/task handoff only; no runtime change, rebuild or restart under STEERING 22/65. No provider calls.
- Verification: pnpm format; pnpm lint:fix; pnpm check (1,062 unit/329 integration passes, four expected integration skips); read-only sampler and explicit raw-counter comparison; git diff --check. Receipts /tmp/2562-{format,lint,check,metrics.jsonl,summary.json,services.json,sources.json,jobs.json,alerts-final.log}.
- Next: metrics ≥01:18 UTC; retention timer receipt 04:40 UTC; Nov 17 scheduled edition/Tech/social review at 15:00 UTC.

## 2026-11-17: iteration 2563 — Privacy enlarged-text reflow

- Clean main at 9857d6c2; no inherited work. Protected paths untouched. Retention/metrics/edition evidence not yet due; followed item 42 reader work.
- Reader weakness reproduced: Privacy at 320px/300% text scrolls to 370px and places theme button beyond the viewport. Header now wraps; article permits long words to wrap at enlarged sizes. No content, budget or generation changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check (1,062 unit/329 integration passes, four expected skips); VITE_PUBLIC_MODE=1 pnpm --filter @digest/web build; deployed Playwright at 320/390/1440px, 100/200/300% text, both themes checks overflow, visible theme control, keyboard activation and return link. Screenshots docs/screenshots/2563-privacy-300-{light,dark}.png.
- First browser pass exposed remaining article text overflow; added article wrapping and rebuilt before final verification. Public HTTPS connection refused from VM; signed-out browser checks use local deployed endpoint. Local reader/assets return 200; atomic web deployment needs no service restart.
- Health database/Redis, 14 services and 38 sources healthy; alerts clear. Receipts /tmp/2563-{format,lint,check,build,browser}.log; source/queue snapshots retained privately.
- Next: metrics ≥01:18 UTC; retention timer receipt 04:40 UTC; scheduled Tech/social/edition review 15:00 UTC.

## 2026-11-17: iteration 2564 — Google News AI rate-limit recovery

- Clean main at a3307bcc; no inherited edits. Initial broad orientation truncated; recovered relevant instructions narrowly. Protected paths untouched.
- Triaged firing RecentJobFailures before new work: Google News AI scheduled attempts at 00:34/00:35 returned HTTP 429. Third attempt naturally returned HTTP 200 and finished at 00:37:10.243 UTC; stored source confirms 60 items/2,706 total. No manual collection, paid calls or bypass; policy unchanged.
- Recorded actual recovery in docs/SOURCES.md and task marker. All 38 sources healthy, service inventory healthy, /healthz database/Redis true, digest queue zero failed/next edition 15:00 UTC. Alert cleared by 00:46 UTC after its rolling failure window.
- Verification: pnpm format; pnpm lint:fix; pnpm check (1,062 unit/329 integration passes, four expected skips); git diff --check. Detailed receipts /tmp/2564-{format,lint,check,recovery,alerts-final}.log and /tmp/2564-{sources,services}.json. Invalid obs log option rejected read-only, corrected queue/job filter used.
- Documentation only; deployed runtime matches main, no rebuild/restart under STEERING 22/65.
- Next: metrics ≥01:18 UTC; retention timer receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2565 — enlarged-text topic panel

- Clean main at 36dcbf11; no inherited edits. Alerts, health, services and all 38 sources pass. Scheduled retention/metrics/edition evidence not due; followed item 42 reader work. Protected paths untouched.
- Reproduced real Topics help/labels clipping at 320px/300% text. Help and topic names now wrap; fixed label spacing preserves room beside scaled checkboxes.
- Screenshot inspection exposed shared panel padding/Close growth overlapping the title. Fixed pixel padding and a 44px Close control preserve text space; contents still scroll independently.
- Verification: pnpm format; pnpm lint:fix; pnpm check (1,062 unit/329 integration passes, four expected skips); VITE_PUBLIC_MODE=1 pnpm --filter @digest/web build; deployed Playwright Topics and Contents checks at three widths, both themes and 100/200/300% text. Both 18-case browser matrices pass; git diff --check passes.
- Browser checks use deployed loopback with the existing simulated proxy-header approach and real stored editions; unforwarded loopback API requests correctly return 429. No provider calls or fixture content.
- Screenshots docs/screenshots/2565-{topics-300,contents-*}-{light,dark}.png; receipts /tmp/2565-{format,lint,check,build,browser,contents}.log. Web published atomically; no service restart needed under item 22. No generation, budget or source changes.
- Next: metrics ≥01:18 UTC; retention receipt 04:40 UTC; Nov 17 scheduled edition/Tech/social review after 15:00 UTC.

## 2026-11-17: iteration 2566 — preserve enlarged-text story width

- Clean main at 2ad8df9a; no inherited work. Health, all 14 services/38 sources pass; alerts clear. Scheduled evidence not due; followed item 42 reader work. Protected paths untouched.
- Reproduced expanded real coverage overflow at 320px/300% (102px available/132px scroll width) and a collapsed desktop story column. Root-font-scaled gutters, card padding, gap and fixed sidebar consumed the reading area.
- Kept those structural dimensions in pixels while text continues scaling. At 300%, mobile coverage now has 246px and desktop 654px; reports, publisher labels and dates fit. No generation, source or budget changes.
- Browser verification: deployed real edition at 320/390/1440px, both themes, 100/200/300% text; all 18 cases pass report/date bounds, page overflow, keyboard expand/collapse and retained focus, zero page errors. Screenshots docs/screenshots/2566-coverage-{320,1440}-{light,dark}.png inspected.
- Web built with VITE_PUBLIC_MODE=1 pnpm --filter @digest/web build and published atomically; no service restart under item 22. Health database/Redis true; digest queue zero failed/next 15:00 UTC; alerts clear.
- Verification: pnpm format; pnpm lint:fix; pnpm check (1,062 unit/329 integration passes, four expected skips); git diff --check. First chained check terminated at format verification (143); detached launch did not persist; standalone full rerun passed.
- Receipts /tmp/2566-{format,lint,check-final,build,browser}.log and health/services/sources/jobs snapshots. Next: metrics ≥01:18 UTC; retention receipt 04:40 UTC; scheduled edition/Tech/social review after 15:00 UTC.

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
