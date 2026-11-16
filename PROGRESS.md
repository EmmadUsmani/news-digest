# Progress

Older entries: [earlier Nov 15](docs/progress-archive/2026-11-15-before-2346.md), [iterations 2339–2347](docs/progress-archive/2026-11-15-2339-2347.md).

Archived: [iterations 2348–2354](docs/progress-archive/2026-11-15-2348-2354.md).

Archived: [iterations 2355–2360](docs/progress-archive/2026-11-15-2355-2360.md).

Archived: [iterations 2361–2367](docs/progress-archive/2026-11-15-2361-2367.md).

Archived: [iterations 2368–2377](docs/progress-archive/2026-11-15-2368-2377.md).

Archived: [iterations 2378–2386](docs/progress-archive/2026-11-15-2378-2386.md).

Archived: [iterations 2387–2397](docs/progress-archive/2026-11-15-2387-2397.md).

Archived: [iterations 2398–2402](docs/progress-archive/2026-11-15-2398-2402.md).

Archived: [iterations 2403–2410](docs/progress-archive/2026-11-15-2403-2410.md).

Archived: [iterations 2411–2420](docs/progress-archive/2026-11-15-2411-2420.md).

Archived: [iterations 2421–2429](docs/progress-archive/2026-11-15-2421-2429.md).

Archived: [iterations 2430–2435](docs/progress-archive/2026-11-15-2430-2435.md).

Archived: [iterations 2436–2441](docs/progress-archive/2026-11-15-2436-2441.md).

## 2026-11-16: iteration 2442 — publish the full public handbook

- Clean main at 62ee6333; no inherited work. Alerts zero, health green. Completed STEERING 63 step 3; no spend, sharing changes or worker restart.
- Reviewed the 18 Markdown pages and served inventory; scan against installed credential values and key/private-key patterns found none. Removed concrete backup bucket configuration and corrected stale private-sharing/reader-guide descriptions. No private operational data is exposed by the handbook APIs.
- Public `/docs/` now uses the full handbook service on 8100. Exact GET/HEAD viewer/tree/corpus/page routes share public admission; page reads stay inventory-bound, writes/unknown paths denied. Proxy strips credentials/cookies, checks the handbook upstream marker and applies restrictive local-only script CSP.
- Pinned DOMPurify/marked/Mermaid/ELK and esbuild; browser bundle builds to an atomic file swap. No CDN imports or CSP widening. Corrected root-relative app links and public tool shortcuts; fixed narrow footer overflow and wrapping while retaining table scrolling.
- Targeted route/proxy/access-stack tests: 17 pass. Staged real viewer under restrictive proxy CSP renders successfully. Initial browser harness corrected section “Overview” label assumption; initial mobile check caught and fixed footer overflow. Initial handbook check caught 102/101 prose lines; page shortened to 100 and rechecked.
- Public signed-out HTTPS Playwright: desktop 1440/mobile 390 each verify all 18 pages/21 diagrams, sidebar navigation, search, direct refresh, no page overflow, cookies, external requests or console/page/HTTP errors. Four screenshots saved and inspected; rendered diagram contact sheet inspected.
- Verification: `pnpm format`, `pnpm lint:fix`, detached `pnpm check`, docs/API builds, `check-handbook.ts --owner-services`, corrected operations handbook check, `check-live-reader-handbook.ts`, scheduled reader, sources/jobs, health and `git diff --check`; final CI result follows. Receipts `/tmp/2442-*`.
- Restarted changed docs/API roles only; worker/web unchanged. Sources 38/38 healthy; Nov 15 published reader retains five topics/23 stories/16 posts. No restart for subsequent viewer/Markdown edits.
- Full CI initially found a stale readiness matrix expecting the now-authorized handbook API to be closed; updated anonymous/reader/admin GET/HEAD coverage and retained traversal/write refusals. Targeted matrix passes; docs-site tests 10/10 pass. Final detached rerun exits 0: 1,052 unit/329 integration tests pass, four expected skips; final detached `pnpm lint:fix` exits 0.
- Archived progress 2430–2435 after crossing 25 KB; updated TASKS with the owner’s public sharing decision. Final reader/browser/health/alerts and formatting checks pass; no deployment/push blocker.
- Next: STEERING 64 fresh-admin direct New edition loads, then Nov 16 scheduled public-edition acceptance. Retained Bluesky export remains due 06:56 UTC; metrics follow-up still open.

## 2026-11-16: iteration 2443 — restore admin direct New edition loads

- Clean main at 3b28b100; no inherited work. Alerts zero; followed STEERING 64 after item 63 steps 1–3.
- Exact GET/HEAD `/admin/editions/new` now classified admin; other routes/methods unchanged. Policy/HTTP tests cover anonymous/reader refusal and fresh-admin admission (10 tests pass).
- Real browser acceptance exposed a second blocker: client guard called closed `/api/me`. Public-mode protected-page guard now reads `/api/account/session`; private identity path unchanged.
- Built/restarted changed API only; initial immediate health probe preceded readiness, subsequent `/healthz` green. Built web with atomic release procedure; no worker/web restart.
- HTTPS browser harness initially hit Node request DNS failure, then shared loopback rate limit; corrected to Chromium-resolved requests and dedicated existing forwarded-IP pattern. First real form check found the client guard failure above.
- Final public HTTPS acceptance: signed-out GET/HEAD 404; fresh stored admin session GET/HEAD 200; typed URL and reload show Create an edition at 1440/390px, no overflow/browser errors. Screenshots saved; mobile inspected. Local file-mailbox authentication only; session logged out; no real email, edition creation or paid calls.
- Updated operations handbook; `check-handbook.ts 08-operations` passes (18 pages, 39 tables, no changed diagrams). Sources 38/38 healthy; scheduled-reader verifies Nov 15 five topics/23 stories/16 posts; scheduled queue remains healthy.
- Verification: `pnpm format`, `pnpm lint:fix`, detached `pnpm check`, API/web builds, policy/access tests, live browser, scheduled reader, sources/jobs and `git diff --check`; final completion receipt follows. Receipts `/tmp/2443-*`.
- Next: Nov 16 15:00 UTC scheduled public-publication/editorial acceptance; protect 13:00–16:00 UTC. Retained Bluesky export due 06:56 UTC and metrics follow-up remain pending.
- Final detached `pnpm check` exits 0: 1,053 unit/329 integration tests pass, four expected skips. Detached `pnpm format`/`pnpm lint:fix` exit 0; targeted final client/browser-script lint and handbook verification pass. Shell-attached style rerun was terminated (143), so used the detached receipt. Both screenshots inspected.
- Atomic web deployment poll: 21 public reader/old/current asset samples, zero failures. Final alerts zero and `/healthz` green; no deployment/push blocker.

## 2026-11-16: iteration 2444 — overnight metrics resource acceptance

- Clean main at 0d53d5c4; no inherited work. Initial disk alert pending; current disk 78%, no leftover integration directories. Alert cleared without deletion; no daily scratch cleanup performed.
- Followed open metrics breakage under Current order 1; kept CPU 2%/MemoryHigh 88 MiB/MemoryMax 112 MiB. No forced compaction, paid calls, runtime changes or service restarts; deployed app remains main.
- `sample-metrics-recovery.ts 10 60`: 00:23:16–00:33:23 UTC, 11 samples/24 fresh healthy rules, 22 successful uncached queries ≤2.832 s. Unchanged metrics/evaluator processes; no new errors/missed evaluations/admission hits/timeouts/slow counters.
- Compared Nov 15 22:04:59 baseline: +940 memory-high events (+74 during sampling), max/OOM/kill=0; 161 small merges/3,860,439 rows, no big merge. Ending memory 84.6 MiB, peak 88.7 MiB, NRestarts=0. `/tmp/2444-compare.py` assertions pass.
- `sample-observability-capacity.ts 6 10`: stack 1.696% CPU/636.1 MiB sampled peak; metrics 0.550% CPU, throttled 114/266 periods, five memory-high events, no OOM/kill. Full-check load overlapped samples.
- `pnpm obs sources --check`: 38/38 healthy; `pnpm obs jobs --check`: scheduled queue zero failures, next Nov 16 15:00 UTC. `check-scheduled-reader.ts 2026-11-15T15:00:00Z`: five topics/23 stories/16 posts. Grafana health and `/healthz` green; final alerts zero.
- Detached `pnpm check` exit 0: 1,053 unit/329 integration pass, four expected skips; no integration roots remained. Evidence `/tmp/2444-{metrics.jsonl,capacity.json,compare.py,metrics-journal.log,check.log}`; decision and TASKS updated.
- Resource acceptance remains open due to reclaim/slower probe; next sample ≥01:34 UTC, preferably natural big merge. No retuning. Next product gate: Nov 16 15:00 scheduled review, protect 13:00–16:00; retained Bluesky export due 06:56.
- Final `pnpm format`/`pnpm lint:fix` exit 0; changed Markdown formatting and `git diff --check` pass. Documentation-only commit; no build/deployment/service restart needed. No new blocker.

## 2026-11-16: iteration 2445 — preserve and review complete Bluesky day

- Clean main at 54a28264; no inherited work. Alerts zero, health green, 38 sources healthy; next edition Nov 16 15:00 UTC. Metrics follow-up not due until ≥01:34.
- Owner value: preserve expiring intake evidence and identify real evening Gaming creator contributions for the next reader edition, rather than equating popularity with relevance.
- Read-only `report-bluesky-collections.ts` preserves all 24 Nov 15 hourly jobs (18 new); each completed with all five topics. Asserted one job/hour, complete results and fetched=submitted for every topic.
- `report-bluesky-coverage.ts --window-end 2026-11-16T00:00:00Z --examples 5`: fixed UTC-day distinct Tech/NBA/Gaming/World/U.S. 53/51/50/158/53; no 5,000-row cap reached. Saved both reports and reviewed 25 strongest examples.
- Two Gaming creator posts were published after the prior edition cutoff; Tech leaders remain commentary-heavy. Retain queries/pilot/budgets/gates; mixed activation day does not isolate pilot effects or accept selection quality.
- Updated TASKS/SOURCES and day review. Next export by Nov 16 12:36 UTC; first full rotation-day review after Nov 17 00:00 UTC. Natural edition review remains 15:00; protect 13:00–16:00.
- Scheduled-reader check passes: Nov 15 five topics/23 stories/16 posts. No paid calls, collection writes, runtime changes or restarts; documentation-only work leaves deployed app unchanged.
- Verification: `pnpm format`/`pnpm lint:fix` exit 0; `pnpm check` exit 0 (1,053 unit/329 integration pass, four expected skips). Final alerts zero; `git diff --check` clean. Receipts `/tmp/2445-{check,format,lint,reader}.log`; no new blocker.

## 2026-11-16: iteration 2446 — daily scratch cleanup after disk alert

- Clean main at 102f9470; no inherited work. Pending DiskSpaceLow took priority; current filesystem 78% before cleanup.
- Owner value: recover stale build/browser screenshot scratch without disturbing edition generation or retained operational evidence. Applied STEERING 61 once for Nov 16, outside protected hours.
- Verified every entry owned by current user, all descendant mtimes >7 days old, no symlinks, and `lsof` exit 1/no open handles immediately before deletion.
- Deleted `/tmp/news-digest-drizzle-patch` 10,268,358 bytes; `/tmp/claude-ui-desktop.png` 2,316,319 bytes; `/tmp/claude-ui-mobile.png` 2,193,520 bytes; `/tmp/812-failures.png` 776,598 bytes. Total 15,554,795 bytes (14.8 MiB); disk 78%→78%.
- Preserved backups, logs, metrics and browser profiles/sessions. No app behavior/configuration changes or paid calls; docs-only commit needs no build or service restart.
- Health green; `pnpm obs sources --check` passes 38 sources; `pnpm obs jobs --check` passes, scheduled queue zero failures and next edition Nov 16 15:00 UTC.
- `check-scheduled-reader.ts 2026-11-15T15:00:00Z` passes five topics/23 stories/16 posts. Verification receipts `/tmp/2446-{format,lint,check,reader}.log`; final results below.
- Next: metrics sample ≥01:34 UTC; Bluesky export by 12:36; scheduled acceptance at 15:00, protect 13:00–16:00. No further daily scratch cleanup Nov 16.
- Final `pnpm format`/`pnpm lint:fix`/`pnpm check` exit 0: 1,053 unit and 329 integration tests pass, four expected skips. Changed Markdown formatting and `git diff --check` pass; final alerts zero. No new blocker.

## 2026-11-16: iteration 2447 — close unavailable NBA rejection reconstruction

- Clean main at 5807e2df; no inherited work. Alerts zero; source/job checks healthy, next scheduled edition Nov 16 15:00 UTC. Metrics not due until ≥01:34; no scratch cleanup repeated.
- Owner value: distinguish a real empty NBA social slot from an unproven false rejection, without changing selection rules on incomplete evidence.
- Read-only cache inspection finds one matching accepted Nembhard rationale at 15:02:36.208: one accepted post, unsupportedClaim=1, other drops zero; exact envelope/post field assertions pass.
- Traced sanitizer→validated cache and allowlisted provider logging: rejected identity/wording are not retained. Historical reconstruction closed; no inference that OPB was rejected. Content/time match does not establish exact historical request identity.
- Updated NBA review and TASKS; natural selection quality/spoof exclusion remain pending. Private receipt `/tmp/2447-cache.{ts,json}`; no paid calls, writes to app data, runtime changes or service restart needed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,053 unit/329 integration pass, four expected skips. Receipts `/tmp/2447-{format,lint,check}.log`; `git diff --check` clean.
- Next: metrics ≥01:34, Bluesky export by 12:36, scheduled review 15:00; protect 13:00–16:00 UTC. No new blocker.

## 2026-11-16: iteration 2448 — metrics recovery under verification load

- Clean main at e6bd4e25; no inherited work. Alerts zero, 38 sources healthy, scheduled queue no failures; reader five topics/23 stories/16 posts.
- Owner value: keep the metrics incident open on measured resource pressure rather than accepting query health alone; retain edition protection and existing limits.
- Read-only `sample-metrics-recovery.ts 10 60` ran early, 01:10:23–01:20:27, overlapping checks rather than waiting for 01:34. Eleven samples/24 healthy rules; 22 probes ≤1.772 s.
- Since 00:33:23: unchanged processes, no new evaluator/admission/timeout/slow-query failures; +300 memory-high events (+76 during sample), max/OOM/kill zero; 43 small merges/1,432,343 rows, no big merge. Comparison assertions pass.
- `sample-observability-capacity.ts 6 10`: stack 1.513% CPU/641.7 MiB peak; metrics 0.447% CPU, 80/240 periods throttled, five memory-high events. No runtime changes, paid calls or restart; disk 78%.
- Updated capacity decision/TASKS. Archived iterations 2436–2441 when PROGRESS exceeded 25 KB. First check caught archive formatting introduced after formatter started; corrected and reran sequentially.
- Receipts `/tmp/2448-{metrics.jsonl,summary.json,compare.py,capacity.json,metrics-journal.log,format.log,lint.log,check.log,reader.log}`.
- Next resource sample ≥02:22 UTC, preferably a natural big merge; Bluesky export by 12:36; scheduled acceptance 15:00, protect 13:00–16:00. No new blocker.
- Final `pnpm format`, `pnpm lint:fix`, `pnpm check` exit 0: 1,053 unit/329 integration pass, four expected skips; final alerts zero and `git diff --check` clean. Documentation-only deployment remains unchanged.
