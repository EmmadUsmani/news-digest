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
