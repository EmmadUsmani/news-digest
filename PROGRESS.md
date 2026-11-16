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

Archived [iterations 2442–2447](docs/progress-archive/2026-11-16-iterations-2442-2447.md).

Archived: [iterations 2448–2455](docs/progress-archive/2026-11-16-2448-2455.md).

Archived: [iterations 2456–2459](docs/progress-archive/2026-11-16-2456-2459.md).

Archived: [iterations 2460–2467](docs/progress-archive/2026-11-16-2460-2467.md).

Archived: [iterations 2468–2470](docs/progress-archive/2026-11-16-2468-2470.md).

Archived: [iterations 2471–2473](docs/progress-archive/2026-11-16-2471-2473.md).

## 2026-11-16: iteration 2474 — contain enlarged reader loading placeholders

- Clean main at beb9bae8; no inherited work. Health, 14 services, 38 sources and queues pass; zero firing/pending alerts. Scheduled content acceptance remains due at 15:00 UTC; metrics not due until ≥07:35.
- Reader-visible weakness: the fixed-width skeleton heading extended to 352px in a 320px viewport at 200% text, causing horizontal scrolling while an edition loads. Capped its width at its container; content and generation unchanged.
- Extended the existing loading/recovery browser check to 320/390/1440px and 200% text in both themes: six cases pass using the real saved edition. Signed-out public HTTPS narrow checks also pass in both themes and resolve to all five topics. Updated screenshots; narrow light inspected.
- Web built off-line and published atomically; eight public HTML/previous-asset pairs pass across the final deployment. An earlier 45-second probe process exited 143 before reporting; bounded replacement succeeds. API/worker unchanged, so no restart under item 63. No provider calls, source/budget changes or handbook changes.
- Saved Nov 15 scheduled reader provenance passes: five topics/23 stories/16 posts. Receipts `/tmp/2474-{format,lint,check,deploy,loading,public-browser,deploy-probe-final,reader,health,services,sources,jobs,alerts}.log`.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration tests, four expected skips; isolated API and web builds pass. Final health remains healthy with zero firing/pending alerts.
- Next: metrics ≥07:35 UTC, Bluesky export by 14:36, scheduled public/content review 15:00; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2475 — verify transient disk-alert recovery

- Clean main at 1e0aa5b0; no inherited work. Initial DiskSpaceLow pending at 07:13:28 UTC cleared by 07:13:59 without intervention; filesystem 79%, 5.48 GB available. Previous verification completed at 07:12, consistent with temporary coverage pressure.
- No abandoned integration directories remain. Daily scratch cleanup already applied in 2446; no repeated deletion, age bypass or runtime changes. Preserve protected 13:00–16:00 UTC window.
- Health database/Redis, all 14 services/38 sources and scheduled queues pass. Historical retained ingestion/social failures remain, with healthy current sources and no recent-failure alert. Scheduled digest queue has zero failures; next edition 15:00 UTC.
- Read-only scheduled-reader provenance passes against Nov 15 15:00 UTC: five topics/23 stories/16 posts. Receipts `/tmp/2475-{services,sources,jobs,reader}.log`.
- No provider calls, budget/source/handbook changes or restart required under item 63. Next: metrics ≥07:35 UTC, Bluesky export by 14:36, natural edition review 15:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration tests, four expected skips. Public HTTPS health passes with public DNS (VM default hostname resolves locally without port 443). No rebuild needed for records only.
- This verification also briefly crossed the disk threshold. At 07:24:49 UTC node-exporter reports 5,481,598,976 available / 26,309,095,424 total bytes (20.84% available); no leftover integration roots. Alert snapshot still pending (zero firing) at 07:24:43; next iteration should confirm its delayed clearance. Check receipts `/tmp/2475-{format,lint,check,alerts-final}.log`.

## 2026-11-16: iteration 2476 — keep enlarged account actions within the panel

- Clean main at e86b3dd1; no inherited work. Initial alert snapshot has zero firing/pending; health database/Redis and services pass. Previous transient disk alert cleared.
- Reader-visible weakness: at 320px/200% text, the account panel’s “Retry sign-in check” extends beyond the viewport. Account actions now wrap and grow vertically, including sign-out, deletion and admin actions; no account behavior or permissions changed.
- Existing isolated account browser check first reproduces the overflow, then passes at 320/390/1440px in both themes with 44px targets, confirmation/focus checks and mocked actions. Updated screenshots; narrow enlarged deletion panel visually inspected. Fixtures are not live account operations.
- Public web build published atomically; 12 public HTML/previous-asset pairs pass during deployment. No API/worker restart under item 63. Initial probe exceeded its output buffer reading the bundle; corrected probe completes successfully.
- Saved Nov 15 scheduled reader provenance passes: five topics/23 stories/16 posts. No provider calls, source/budget changes or handbook changes.
- Verification receipts `/tmp/2476-{format,lint,check,account,deploy,deploy-probe,public-browser,reader,services,sources,jobs}.log`. Next: metrics ≥07:35 UTC, Bluesky export by 14:36, scheduled edition review at 15:00; protect 13:00–16:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration tests, four expected skips. Initial combined verification command exited 143 during lint; standalone lint and full check both finish successfully. Final health passes; zero firing/pending alerts. Metrics checkpoint now due next iteration.

## 2026-11-16: iteration 2477 — due metrics-store checkpoint

- Clean main at 84705a39; no inherited work. Health, 14 services, 38 sources and queues pass. Initial pending DiskSpaceLow cleared by 07:39:49 without intervention; disk 79%.
- Due read-only checkpoint 07:39:21–07:44:26 UTC overlaps repository verification: 11 samples, all 24 rules fresh/healthy, 22 uncached expected-series queries ≤1.877 s. Both starts and evaluator/admission/timeout/slow-query counters unchanged; max/OOM/kill zero; NRestarts=0; service journal empty.
- Since 06:34: +75 small merges/1,652,402 rows, no big merge; +490 memory-high events (27 during sample). Final usage 88,211,456 bytes; lifetime peak 92,995,584. Retain CPU 2%/88 MiB high/112 MiB max; resource acceptance remains open. Updated decision evidence and TASKS; next check ≥08:45 UTC, preferably after natural big merge.
- Saved Nov 15 scheduled reader provenance passes: five topics/23 stories/16 posts. No provider calls, source/budget changes or runtime changes; no rebuild/restart required under item 63.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration tests, four expected skips. Receipts `/tmp/2477-{format,lint,check,metrics.jsonl,summary.json,compare.py,metrics-journal.log,reader,health-final,services,sources,jobs,alerts-final}.log` (metrics/summary/compare paths use their named extensions).
- Verification again briefly crossed disk threshold: 07:48:46 alert pending/zero firing, disk recovered to 79%/5.1 GiB available by 07:48:50; alert cleared by 07:50:03 (zero firing/pending). Health remains healthy.
- Next: Bluesky export by 14:36 UTC; scheduled public/content review 15:00; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2478 — enlarge sign-in return touch targets

- Clean main at f1270bb8; no inherited work. Initial alerts zero; all 14 services/38 sources and health database/Redis pass. Timed metrics, export and edition acceptance remain pending.
- Reader weakness: sign-in “Back to the digest” link has a touch target below 44px; isolated browser check reproduces the failure. Shared sign-in styles now provide a 44px minimum with vertically centered text on code and link-confirmation pages.
- Extended existing isolated code-login browser check to 320/390/1280px, both themes, normal/200% text; viewport/action fit, focus, request/refusal/retry/redemption and privacy checks pass. Link-confirmation transport/keyboard checks pass. Fixture actions only; no real account request, provider call or notification.
- Updated screenshots and visually inspected narrow enlarged code page. Topics panel enlarged-text inspection found no overflow; no change there. No source, budget, permissions or handbook behavior change.
- Verification receipts: `/tmp/2478-{format,lint,check,login,confirmation,build,services,sources,jobs}.log`; full check and deployment results recorded below.
- API build passes; API-only restart applied (health retries covered startup). Live GET-only browser verifies 44px return target and Enter navigation. Health database/Redis and saved Nov 15 reader pass: five topics/23 stories/16 posts. Worker/web unchanged.
- `pnpm format`, `pnpm lint:fix`, typecheck/lint/format/boundaries and all 1,056 unit tests pass. Combined `pnpm check` exited 143 during integration without a test assertion; standalone `pnpm test:integration` passes 329 tests/four expected skips. `git diff --check` passes.
- Final alerts zero firing/pending; services healthy. Next: metrics ≥08:45 UTC, Bluesky export by 14:36, scheduled public/content review at 15:00; preserve 13:00–16:00 UTC window. No new blocker.

## 2026-11-16: iteration 2479 — triage recurring disk pressure

- Clean main at 98df38c9; no inherited tracked work. Initial DiskSpaceLow pending; filesystem already recovered to 79% (5,444,804,608 bytes available). No service or source failure.
- Found abandoned `/tmp/news-digest-integration-whnKT6`, 16 MiB, last modified 07:59:26 UTC; marker PID 2792067 no longer exists. Safeguarded integration startup may reclaim after 08:59:26 UTC. No manual deletion or age bypass; today's general scratch cleanup already used in 2446.
- `pnpm obs services`: 14 healthy; `pnpm obs sources`: all 38 healthy; `pnpm obs jobs`: digest queue has no failures, next edition 15:00 UTC. Historical ingestion/social failed counts coexist with healthy current sources.
- `/healthz` passes database/Redis. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` verifies saved scheduled publication, five topics/23 stories/16 posts. First invocation omitted required date; corrected command passes.
- No runtime, source or budget change; no rebuild/restart under STEERING 63. Receipts `/tmp/2479-{reader,sources,jobs,alerts}.log`. Formatting/lint and final alert outcome recorded below.
- Next: metrics ≥08:45 UTC; eligible integration cleanup ≥08:59:26; Bluesky export by 14:36; scheduled review at 15:00. Preserve 13:00–16:00 UTC window.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration tests, four expected skips. Verification briefly returned disk to 80% with one pending/zero firing alerts at 08:13:55; health remains healthy. Full receipts `/tmp/2479-{format,lint,check,alerts-final}.log`.

## 2026-11-16: iteration 2480 — enlarged public footer acceptance

- Clean main at 576c4362; no inherited work. Initial pending DiskSpaceLow recovered to 79%; zero firing/pending by 08:16 UTC. No cleanup or runtime intervention.
- Existing footer browser check could not read public loopback history (empty response); updated it to the established documentation-range visitor header, bounded fetch and explicit HTTP status assertion.
- Extended latest/historical footer navigation to normal/200% text at 320/390/1440px, both themes: 24 page checks pass for 44px targets, viewport fit, visible keyboard focus and Enter navigation to history. No UI defect found or production change.
- Updated screenshots; visually inspected narrow dark enlarged target. GET/HEAD-only local traffic; external requests blocked. No account writes, provider calls or notifications.
- Health database/Redis passes; all 14 services and 38 sources healthy. Saved scheduled Nov 15 reader verifies five topics/23 stories/16 posts. Receipts `/tmp/2480-{footer,reader,services,sources,jobs,alerts}.log`.
- No build/restart required under STEERING 63: browser verification only. Required formatting/lint/full-check outcome recorded below.
- Next: metrics ≥08:45; eligible abandoned integration cleanup ≥08:59:26; Bluesky export by 14:36; edition review 15:00. Preserve 13:00–16:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration tests, four expected skips. Receipts `/tmp/2480-{format,lint,check}.log`. Final disk 79%; verification briefly returned DiskSpaceLow to pending (zero firing), health remains healthy.

## 2026-11-16: iteration 2481 — live enlarged archive recovery

- Clean main at 9aca65a2; no inherited work. Initial DiskSpaceLow pending, filesystem recovered to 79%; all 14 services healthy and digest queue has no failures. No cleanup eligibility bypass.
- Reader inspection: out-of-range archive recovery previously used simulated history. Replaced replay with real public GETs and checked 200% text at 320/390/1440px in both themes; recovery returns to real saved editions, restores heading focus and preserves 44px targets without overflow. No production defect found.
- Refreshed six full-page screenshots and visually inspected narrow dark recovery. No server writes, external provider calls or notifications; no source/budget/handbook behavior change.
- Health database/Redis and all 38 sources healthy; saved scheduled Nov 15 reader passes, five topics/23 stories/16 posts. Receipts `/tmp/2481-{empty,reader,sources}.log`.
- Verification-only change; no rebuild/restart under STEERING 63. Required formatting/lint/full-check results recorded below.
- Next: metrics ≥08:45 UTC; eligible abandoned integration cleanup ≥08:59:26; Bluesky export by 14:36; edition review 15:00. Preserve 13:00–16:00 UTC window.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration tests, four expected skips. Final health database/Redis passes; alert outcome recorded at commit. Receipts `/tmp/2481-{format,lint,check,alerts-final}.log`. Archived iterations 2468–2470 to keep this file small.

## 2026-11-16: iteration 2482 — due metrics resource checkpoint

- Clean main at 15f275d7; no inherited tracked work. Owner value: confirm constrained monitoring still detects failures while repository verification loads the public VM.
- Initial DiskSpaceLow pending; filesystem recovered to 79%. All 14 services and 38 sources healthy; digest queue has no failures, next scheduled edition 15:00 UTC. No cleanup eligibility bypass.
- `/healthz` passes database/Redis; `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` confirms five topics/23 stories/16 posts. Receipts `/tmp/2482-{reader,sources}.log`.
- Due read-only metrics sample began 08:45 UTC during `pnpm check`; no force merge, provider call, limit change or service restart. Final sample and verification results recorded below.
- No runtime/source/budget change; no rebuild/restart under STEERING 63. Preserve 13:00–16:00 UTC window; abandoned integration cleanup eligible ≥08:59:26; Bluesky export by 14:36; edition review 15:00.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 1,056 unit/329 integration tests, four expected skips. Disk 79%, zero firing/one pending alert. Initial comparison correctly failed unchanged-admission assertion: one new event; comparison now reports its delta while retaining timeout/evaluator/OOM assertions. Receipts `/tmp/2482-{format,lint,check,alerts-final}.log`.
- Final 08:45:04–08:50:11 sample: 11 snapshots, 24 healthy rules, 22 queries ≤2.187 s; admission +1, timeouts/evaluator failures/OOM/restarts unchanged. Since 07:44 +442 memory-high events (31 during sample), 80 small merges/1,966,399 rows, no big merge. Capacity acceptance stays open; next ≥09:51 UTC. [Evidence](docs/decisions/0004-observability-capacity.md#verification-load-checkpoint-iteration-2482).

## 2026-11-16: iteration 2483 — public handbook and disk housekeeping

- Clean main at 0c325202; no inherited work. Owner value: keep the public handbook usable and reclaim eligible abandoned test storage before disk pressure returns.
- Initial alerts clear; health database/Redis, 14 monitored services and 38 sources pass. Digest queue has no failures; next scheduled edition 15:00 UTC.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` passes: five topics/23 stories/16 posts. No provider calls or publication writes.
- `pnpm exec tsx scripts/check-live-reader-handbook.ts` passes over public HTTPS at 390/1440px: all 18 pages/21 diagrams, navigation/search/direct refresh, local assets and no overflow/errors. Incidental screenshot raster differences discarded deliberately; no UI change.
- At 08:59 UTC existing guarded cleanup reclaimed `/tmp/news-digest-integration-whnKT6`, 15,818,752 allocated bytes (15,448 KiB); disk 79%→79%. Age/PID/process-reference safeguards unchanged. First call retained it while its path appeared in the probe shell command; standalone retry removed it. No repeated general scratch cleanup.
- Verification receipts `/tmp/2483-{reader,services,sources,jobs,handbook,format,lint,check}.log`; final checks and cleanup outcome recorded below.
- No runtime change; no rebuild/restart under STEERING 63. Next: metrics ≥09:51, Bluesky export by 14:36, edition review 15:00; protect 13:00–16:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, targeted documentation formatting and `git diff --check` pass: 1,056 unit tests; 329 integration passes/four expected skips. Final database/Redis health passes, disk 79%, zero firing/pending alerts. No source, budget or handbook behavior change.

## 2026-11-16: iteration 2484 — enlarged keyboard access to real reader

- Clean main at 8e9c6c7b; no inherited work. Owner value: keyboard readers can bypass the enlarged navigation and reach real saved content.
- Initial DiskSpaceLow pending; filesystem recovered to 79%, no abandoned integration directories. No deletion or cleanup-rule bypass.
- Replaced skip-link edition/history replay with real public reader GETs; added 320px coverage and 200% text throughout. Skip target is ≥44px and in view, Enter focuses the destination below the actual header, and Tab continues into content without overflow.
- `pnpm exec tsx scripts/smoke-reader-skip-link.ts` passes at 320/390/1440px, both themes; refreshed 12 screenshots and inspected narrow dark edition. No production defect found; no writes/provider calls.
- Health database/Redis, 14 services and 38 sources healthy; digest queue has no failures. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` passes five topics/23 stories/16 posts.
- Receipts `/tmp/2484-{alerts,services,sources,jobs,reader,skip,format,lint,check}.log`. Full verification results recorded below.
- No runtime/source/budget/handbook change; no rebuild/restart under STEERING 63. Next: metrics ≥09:51, Bluesky export by 14:36, edition review 15:00 UTC; protect 13:00–16:00.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration passes, four expected skips. Final health database/Redis passes; DiskSpaceLow pending again after integration load (zero firing). Archived iterations 2471–2473 to keep this file small.

## 2026-11-16: iteration 2485 — enlarged real-content Contents navigation

- Clean main at 042a4482; no inherited work. Owner value: readers using enlarged text can reach the full edition and its archive through Contents.
- Initial alerts clear; health database/Redis, 14 services and 38 sources healthy. Digest queue has zero failures; next edition 15:00 UTC. Historical source/social failed counts remain retained, with current sources healthy.
- Contents acceptance used captured edition/history and normal text. Removed response replay, added 200% text and horizontal reachability assertions for every section link; real public GETs only, no writes/provider calls.
- Browser check passes 320/390/1440px in both themes: 44px targets, visible keyboard focus, Escape focus return and archive navigation. Refreshed six screenshots; inspected narrow dark panel. No production defect found.
- Scheduled reader passes five topics/23 stories/16 posts. Receipts `/tmp/2485-{alerts,services,sources,jobs,reader,contents,format,lint,check}.log`.
- No runtime/source/budget/handbook change; no rebuild/restart under STEERING 63. Next: metrics ≥09:51, Bluesky export by 14:36, edition review 15:00 UTC; protect 13:00–16:00.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration passes, four expected skips. Final health passes; disk 79%, DiskSpaceLow pending after verification load, zero firing alerts.

## 2026-11-16: iteration 2486 — enlarged real-content Topics panel

- Clean main at 2f850543; no inherited work. Topics-panel acceptance still assumed four topics despite the five-topic public edition; updated it to use the validated published edition count.
- Added 200% text and every-label target/reachability checks; real public GETs only, external requests/server mutations blocked. Local hide/restore and reload persistence pass 320/390/1440px in both themes.
- Six screenshots refreshed; inspected narrow dark panel. No production defect found; no runtime/source/budget/handbook change or restart under STEERING 63.
- Initial health database/Redis, 14 services and 38 sources healthy; digest queue has zero failures. Disk 79%, DiskSpaceLow pending, zero firing alerts. No scratch cleanup.
- Scheduled reader passes five topics/23 stories/16 posts. Receipts `/tmp/2486-{services,sources,jobs,reader,topics,format,lint,check}.log`.
- Full verification and final health results recorded below. Next: metrics ≥09:51, Bluesky export by 14:36, scheduled review 15:00 UTC; protect 13:00–16:00.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration passes, four expected skips. Final database/Redis health passes; disk 79%, DiskSpaceLow pending, zero firing alerts.
