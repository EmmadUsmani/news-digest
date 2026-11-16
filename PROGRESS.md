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

Archived: [iterations 2474–2481](docs/progress-archive/2026-11-16-2474-2481.md).

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

## 2026-11-16: iteration 2487 — enlarged attribution across the published edition

- Clean main at d623e302; no inherited work. Owner value: enlarged-text readers can reach publisher attribution and every supporting report across the real edition.
- Health, services and sources pass; alerts initially clear, digest queue check passes. Latest saved reader passes five topics/23 stories/16 posts. Thin Tech/World evidence remains scheduled acceptance, with no new generation changes.
- Expanded source-target browser acceptance from the first story to every story/coverage link at 200% text, 320/390/1440px in both themes. Checks HTTP destinations, 44px targets, horizontal reachability and keyboard focus; local real GETs only, no writes/provider calls.
- Refreshed six screenshots; screenshot-only styling hides fixed navigation so it cannot obscure the captured attribution. No runtime/source/budget/handbook changes; no rebuild/restart under STEERING 63.
- Receipts `/tmp/2487-{health,services,sources,jobs,reader,source,format,lint,check}.log`. Final verification results follow.
- Next: due metrics ≥09:51, Bluesky export by 14:36, scheduled review 15:00 UTC; protect 13:00–16:00. Move away from additional small reader acceptance work unless it reveals a defect.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration passes, four expected skips. Final health passes; DiskSpaceLow pending after verification, zero firing alerts (`/tmp/2487-alerts-final.log`). Inspected refreshed narrow dark screenshot; all six final browser cases pass.

## 2026-11-16: iteration 2488 — due metrics verification-load checkpoint

- Clean main at 259dee22; no inherited work. Chose due capacity acceptance instead of more small reader checks.
- Initial database/Redis, 14 services and 38 sources healthy; digest queue zero failures. Disk warning pending at 79%; final alert snapshot clear, no cleanup performed.
- Read-only metrics sampler: 09:51:22–09:56:27 UTC, 11 samples, 24 fresh healthy rules, 22 uncached queries ≤1.473 s during repository verification.
- Since 08:50: +513 memory-high events (33 during sample), 67 small merges/5,568,263 rows; no big merge. Admission/timeouts/slow queries/evaluator failures/process starts unchanged; no OOM/restarts or journal entries.
- Retained CPU 2%/88 MiB high/112 MiB max. Resource acceptance remains open because reclaim continues and natural big-merge evidence is absent. Decision record/task updated.
- Saved scheduled reader passes five topics/23 stories/16 posts; final health passes. No runtime/source/budget/handbook change, provider calls or restart under STEERING 63.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 1,056 unit/329 integration passes, four expected skips. Receipts `/tmp/2488-{metrics.jsonl,summary.json,compare.py,metrics-journal,services,sources,jobs,reader,format,lint,check,alerts-final}.log` (metrics/summary suffixes as named).
- Next: metrics ≥10:57, Bluesky export by 14:36, natural edition review 15:00 UTC; protect 13:00–16:00 UTC.

## 2026-11-16: iteration 2489 — preserve natural Bluesky intake evidence

- Clean main at ae8c6ef5; no inherited work. Owner value: preserve real hourly intake evidence for the full-day social-quality decision before shared queue retention expires.
- Initial alerts clear; `pnpm obs health --check`, `services --check`, `sources --check`, `jobs --check` pass. Scheduled reader passes five topics/23 stories/16 posts using Nov 15 15:00 UTC cutoff.
- Read-only `report-bluesky-collections.ts` export preserved six additional jobs (04:54–09:54 UTC) in the Nov 16 day evidence. All ten consecutive UTC hours complete for five distinct topics; 50 fetched/submitted matches and exact baseline/Ukraine/baseline/Gaza rotation verified. Previously retained job payloads unchanged.
- Query observation totals: AI 492, NBA 481, game 493, World baseline 243/Ukraine 144/Gaza 100, Congress 499. These include repeated snapshots, not unique relevant posts; no new DB-count or quality claim.
- No partial-pass quality review, runtime/source/budget/handbook changes, provider calls or restart under STEERING 63. First full rotation-day review remains after Nov 17 00:00 UTC; next retention export by 20:36 UTC.
- Initial jobs probe used unsupported queue `digest`; corrected to default `jobs --check`, which passes. Receipts `/tmp/2489-{health,services,sources,jobs,reader}.log`, raw export `/tmp/2489-bluesky.json`.
- Next: metrics ≥10:57 UTC and natural edition review 15:00 UTC; protect 13:00–16:00 UTC. Verification results follow.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration passes, four expected skips. Final health passes; alerts 0 firing/1 pending. No restart required for evidence-only changes.

## 2026-11-16: iteration 2490 — disk triage and public-state handoff correction

- Clean main at f875a1c7; no inherited work. Owner value: remove obsolete private-site instructions that could misdirect public-site recovery.
- Initial health, 14 services, 38 sources and digest jobs pass; saved reader passes five topics/23 stories/16 posts at Nov 15 15:00 UTC cutoff.
- Pending DiskSpaceLow recovered without intervention: disk 79%, 5,399,887,872 bytes available; zero firing/pending alerts at 10:16:23 UTC. No abandoned integration directories; today's item-61 cleanup already used in 2446.
- Read-only disk inventory: /tmp 2.3 GiB, observability data 1.1 GiB, journal 468 MiB; no authorized new cleanup target established. No deletion, retention change or service restart.
- Corrected three stale NEEDS_FROM_HUMAN.md sections: public mode and owner sharing decision are complete; item-63 public HTTPS scheduled acceptance remains agent work. No owner action requested.
- Receipts `/tmp/2490-{health,services,sources,jobs,reader,alerts,format,lint,check}.log`. No runtime/source/budget changes or provider calls; no rebuild/restart under STEERING 63.
- Next: metrics ≥10:57 UTC, natural edition/public HTTPS acceptance at 15:00 UTC, Bluesky retention export by 20:36 UTC; protect 13:00–16:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration passes, four expected skips. Final health passes; alerts zero firing/one pending after verification.

## 2026-11-16: iteration 2491 — enlarged edition-date navigation acceptance

- Clean main at 75b4da48; no inherited work. Owner value: readers using enlarged text can move between real published editions without losing date controls.
- Health, services, sources and jobs pass; saved scheduled reader passes Nov 15 cutoff, five topics/23 stories/16 posts.
- Disk remains 79% with a pending warning; no abandoned integration directories. Today’s item-61 cleanup already used; no deletion or service changes.
- Existing live date-navigation smoke now checks 200% text and horizontal reachability, 44px targets, keyboard focus and older/newer/archive destinations at 320/390/1440px in both themes. All six cases pass; refreshed six screenshots. GET/HEAD only; external traffic blocked.
- Archived iterations 2474–2481 to keep PROGRESS.md below 25 KB. No runtime, provider, source or budget changes; no rebuild/restart required under STEERING 63.
- Receipts: /tmp/2491-{health,services,sources,jobs,reader,dates,format,lint,check,alerts-final}.log.
- Next: metrics ≥10:57 UTC, natural edition/public HTTPS acceptance at 15:00 UTC, Bluesky export by 20:36 UTC; protect 13:00–16:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration passes, four expected skips. First lint was terminated (143) without diagnostics; rerun succeeded. Final health passes; alerts zero firing/one pending disk warning.

## 2026-11-16: iteration 2492 — enlarged published post-context acceptance

- Clean main at 009244d9; no inherited work. Reader concern: expandable context must remain reachable when text is enlarged on narrow screens.
- Initial `pnpm obs alerts` clear; `health --check`, `services --check`, `sources --check`, `jobs --check` pass. No source outage or failed digest run.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z` passes: five topics/23 stories/16 posts from the saved scheduled publication.
- Enhanced `smoke-reader-context-targets.ts` with 200% text and horizontal bounds checks. Six real published notes pass at 320/390/1440px in both themes, with 44px targets, preserved text, keyboard focus/toggle and touch expansion. Refreshed six screenshots; inspected narrow light capture.
- GET/HEAD only, external requests blocked; no runtime/source/budget changes or provider calls. No rebuild/restart required under STEERING 63.
- Receipts `/tmp/2492-{health,services,sources,jobs,reader,context,format,lint,check}.log`.
- Next: metrics ≥10:57 UTC, natural edition/public HTTPS acceptance 15:00 UTC, Bluesky export by 20:36 UTC; protect 13:00–16:00 UTC.
- `pnpm format`, `pnpm lint:fix` (retry after exit 143 without diagnostics), `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration passes, four expected skips. Final health passes; alerts zero firing/one pending disk warning.
