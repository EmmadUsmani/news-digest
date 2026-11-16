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

Archived: [iterations 2482–2489](docs/progress-archive/2026-11-16-2482-2489.md).

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

## 2026-11-16: iteration 2493 — metrics capacity and public-route triage

- Clean main at 040ec4d7; no inherited work. Owner value: check that monitoring remains responsive under verification load without disturbing the public reader.
- Initial health/services/sources/jobs checks pass; saved scheduled reader retains five topics/23 stories/16 posts. No stalled source or failed digest run.
- Pending disk warning: current disk 79%, no abandoned integration directories; daily scratch cleanup already used. No deletion or retention change.
- Direct public hostname resolves to the VM-local route and refuses HTTPS; public-DNS-resolved HTTPS health passes with database/Redis healthy. No public outage established.
- Metrics 10:51–10:57: 13 samples/24 healthy rules, 26 queries ≤1.670 s; no admission/timeouts/evaluator failures/restarts. Since 09:56 +387 high events (38 during sample), 64 small merges/1,666,342 rows, no big merge; acceptance open, next ≥11:58 UTC.
- No runtime/source/budget changes, provider calls, rebuild or restart; live services already match main under STEERING 63.
- Receipts: `/tmp/2493-{health,services,sources,jobs,reader,format,lint,check}.log`; metrics/summary/compare/journal receipts linked in capacity decision.
- Next: scheduled publication/public HTTPS acceptance at 15:00 UTC and Bluesky export by 20:36 UTC; protect 13:00–16:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration passes, four expected skips. Final health passes; alerts zero firing/pending.

## 2026-11-16: iteration 2494 — enlarged published post identity acceptance

- Clean main at b5c66182; no inherited work. Reader concern: author and publication-time links must remain reachable at 200% text on narrow screens.
- Initial health/services/sources/jobs checks pass; saved scheduled reader retains five topics/23 stories/16 posts. No stalled source or failed digest run.
- Disk 79%, pending warning; no abandoned integration directories and daily scratch cleanup already used. No deletion.
- Restored byline smoke to the established loopback public visitor-admission setup after initial rate-limited loading timeout; checks now compare card count with the real published API response.
- At 200% text, all published post author/timestamp links pass horizontal bounds, 44px targets, external-link attributes and keyboard focus at 320/390/1440px in both themes. Refreshed six screenshots; inspected narrow light capture.
- GET/HEAD only; external requests blocked. No runtime/source/budget changes or provider calls; no rebuild/restart required under STEERING 63.
- Receipts: `/tmp/2494-{health,services,sources,jobs,reader,byline,format,lint,check}.log`.
- Next: metrics ≥11:58 UTC, natural edition/public publication acceptance 15:00 UTC, Bluesky export by 20:36 UTC; protect 13:00–16:00 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (retry after exit 143 during format check without diagnostics) and `git diff --check` pass: 1,056 unit/329 integration passes, four expected skips. Final health passes.

## 2026-11-16: iteration 2495 — enlarged published headline acceptance

- Clean main at 625e662b; no inherited work. Reader concern: long story headlines must retain their titles, source links and keyboard access at 200% text.
- Health/services/sources/jobs checks pass; saved scheduled reader retains five topics/23 stories/16 posts. No stalled source or failed digest run.
- Pending disk warning at 79%; daily scratch cleanup already used, no deletion.
- Updated published-headline smoke with shared contract validation, 200% text and per-headline horizontal bounds/keyboard reachability checks.
- All 23 real published headlines pass at 320/390/1440px in both themes, retaining exact titles/URLs and 44px targets. Six screenshots refreshed; inspected narrow light capture.
- GET/HEAD only, external traffic blocked; no provider calls or runtime/source/budget changes. No rebuild/restart required under STEERING 63; live services match main.
- Receipts: `/tmp/2495-{health,services,sources,jobs,reader,headlines,format,lint,check}.log`.
- Next: metrics ≥11:58 UTC; natural edition/public HTTPS acceptance at 15:00 UTC; Bluesky export by 20:36 UTC; protect 13:00–16:00 UTC.
- `pnpm format`, `pnpm lint:fix` (retry after exit 143 without diagnostics), `pnpm check` and `git diff --check` pass: 1,056 unit/329 integration passes, four expected skips. Final health passes; alerts zero firing/one pending disk warning.

## 2026-11-16: iteration 2496 — disk-pressure Git compaction

- Clean main at 121dd0fb; no inherited work. Pending disk warning takes priority over reader acceptance work.
- `pnpm obs health|services|sources|jobs --check` pass; published API retains five topics/23 stories/16 posts and next digest is scheduled for 15:00 UTC.
- Disk 79%; no abandoned integration roots. Daily scratch cleanup already used; no scratch deletion.
- `git gc --no-prune` compacted existing objects: `.git` 533→489 MiB; loose objects 5,668→0 and packs 6→2. No history rewrite or object pruning; disk remains 79%.
- `git fsck --connectivity-only --no-dangling` passes; prior five commits and clean working tree preserved before this log update.
- No runtime/source/budget changes or provider calls; no rebuild/restart needed under STEERING 63. Live services already match main.
- Receipts: `/tmp/2496-{alerts,health,services,sources,jobs,gc,fsck,format,lint,check}.log`, `/tmp/2496-reader.json`.
- Next: metrics ≥11:58 UTC; natural edition/public publication acceptance at 15:00 UTC; Bluesky export by 20:36 UTC; protect 13:00–16:00 UTC.
- Final alert snapshot: zero firing/pending; disk remains 79%. Warning cleared during verification.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, final `/healthz` and `git diff --check` pass: 1,056 unit/329 integration passes, four expected skips.

## 2026-11-16: iteration 2497 — disk-alert verification burst diagnosis

- Clean main at ddcaea2d; no inherited work. Reader impact: establish whether recurrent disk warnings threaten scheduled publication before changing production.
- Initial pending DiskSpaceLow cleared without deletion; health/services/sources/jobs pass. Published edition a0fa3916 retains five topics/23 stories/16 posts.
- Read-only inventory: `/tmp` 2.3 GiB, repo 1.3 GiB, observability 1.1 GiB, journal 468 MiB; protected data untouched. Daily scratch cleanup already used.
- Sampled required verification every five seconds: used bytes 19,534,794,752→19,829,514,240 (+281.1 MiB), crossing 79→80% while isolated test containers ran.
- After test teardown, usage returned to 19,544,076,288 bytes/79%; this reproduces verification-related threshold crossings, without establishing the cause of the initial warning.
- No runtime/source/budget changes or provider calls; no rebuild/restart needed under STEERING 63. Live services match main.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 1,056 unit/329 integration passes, four expected skips. Receipts `/tmp/2497-{health,services,sources,jobs,reader,format,lint,check,alerts*,disk-*}.*`.
- Next: metrics ≥11:58 UTC; Nov 16 natural edition/public HTTPS acceptance 15:00 UTC; Bluesky export by 20:36 UTC. Protect 13:00–16:00 UTC; no extra scratch cleanup today.
- Final `/healthz` passes; temporary test containers removed, disk 79%, zero firing/pending alerts. `git diff --check` passes.

## 2026-11-16: iteration 2498 — published social text link acceptance

- Clean main at 34544b84; no inherited work. Owner value: enlarged social post text and inline destinations remain readable and reachable on narrow phones.
- `pnpm obs alerts` reports zero firing/pending; `pnpm obs health|services|sources|jobs --check` pass. Scheduled edition remains due at 15:00 UTC.
- Added GET/HEAD-only published-reader browser check; external requests blocked, no provider calls or server writes.
- All 16 real published post texts/27 inline links retain saved text at 200% across 320/390/1440px and both themes; every inline fragment stays in bounds, keyboard focus and page overflow pass.
- Six screenshots saved in `docs/screenshots/ui/reader-post-text-links-*`; narrow light capture inspected. Blocked X widgets exercise saved-text fallback, not live embeds.
- No runtime/source/budget change; rebuild/restart unnecessary under STEERING 63, preserving public service availability.
- Verification: `pnpm exec tsx scripts/smoke-reader-post-text-links.ts`, `pnpm format`, `pnpm lint:fix`, `pnpm check`, `git diff --check` (results below).
- Receipts: `/tmp/2498-{health,services,sources,jobs,post-text,format,lint,check}.log`.
- Next: metrics ≥11:58 UTC; Nov 16 natural edition/public HTTPS acceptance at 15:00 UTC; Bluesky export by 20:36 UTC. Protect 13:00–16:00 UTC.
- Full verification passes: 1,056 unit/329 integration tests, four expected skips. Archive formatting failure corrected before the successful full rerun; `git diff --check` and final health pass. Final alerts: zero firing/one pending disk warning after isolated verification.

## 2026-11-16: iteration 2499 — current public publication runbook

- Clean main at 69e4fe6a; no inherited work. Corrected stale private-sharing status and unfinished Nov 15 gate in public-readiness.md.
- Runbook now links current operations, names atomic web-only build and retains owner-first rollback; Nov 16 public HTTPS gate remains pending.
- Initial disk warning cleared without deletion; health/services/sources/jobs pass. No provider calls, runtime changes, rebuild or restart; STEERING 63 preserves service availability.
- Due metrics checkpoint 12:01–12:06: 11 samples/24 healthy rules, 22 queries ≤1.078 s; no new admission/timeouts/evaluator failures/restarts or big merge.
- Memory-high +456 since 10:57 (+28 sampled); limits unchanged and resource acceptance open. Next short check ≥13:07 UTC.
- Local runbook links verified; pnpm format and pnpm lint:fix pass. Full pnpm check results recorded below.
- Receipts: /tmp/2499-{health,services,sources,jobs,format,lint,check,metrics*,summary.json,compare.py,alerts.log}.
- Next: Nov 16 15:00 scheduled public publication and editorial acceptance; Bluesky export by 20:36 UTC; protect 13:00–16:00 UTC.
- Full pnpm check passes: 1,056 unit/329 integration passes, four expected skips. Final formatting/lint and health pass; zero firing/pending alerts before commit; git diff --check passes.

## 2026-11-16: iteration 2500 — accurate public landing page

- Clean main at 179ccef8; no inherited work. README incorrectly claimed every tool was private and sent readers to closed Grafana.
- Updated public/admin access description, linked public Spend and Queues, and retained admin Logs/Metrics links. No runtime or source changes.
- Health/services/sources/jobs checks pass; next scheduled edition remains Nov 16 15:00 UTC. Initial pending disk warning at 79%; no repeated daily cleanup or protected-data deletion.
- Signed-out Playwright over public HTTPS renders /, /docs/, /db/, /admin/spend and /admin/queues with HTTP 200 and nonempty intended content.
- Default VM DNS initially refused HTTPS; public-DNS browser mapping succeeds, as in existing live checks. No server writes or provider calls.
- Verification: pnpm format, pnpm lint:fix, pnpm exec tsx scripts/check-handbook.ts operations, pnpm check; final results below.
- Receipts: /tmp/2500-{health,services,sources,jobs,public-links-dns,format,lint,handbook,check}.log.
- Documentation only: rebuild/restart unnecessary under STEERING 63; deployed services retain current runtime.
- Next: metrics ≥13:07 UTC; scheduled public publication/editorial acceptance 15:00 UTC; Bluesky export by 20:36 UTC. Protect 13:00–16:00 UTC.
- Full pnpm check passes: 1,056 unit/329 integration passes, four expected skips; handbook check passes (18 pages/one diagram/39 tables). Final health and git diff --check pass; final alerts recorded in /tmp/2500-final-alerts.log.

## 2026-11-16: iteration 2501 — accurate public recovery record

- Clean main at 4ac76e0c; no inherited work. Health/database/Redis and all 38 sources healthy; no active alerts; next digest Nov 16 15:00 UTC.
- Owner would care: the linked recovery record claimed sharing was private and instructed a whole-workspace rebuild during recovery.
- Updated current public-sharing status under STEERING 63; retained dated preparation/activation evidence as historical receipts.
- Recovery now uses atomic web-only deployment, retained hashed assets and the 13:00–16:00 UTC hold; owner-confirmed unsharing still comes first.
- No runtime, source, budget or sharing changes; no paid calls or repeated accepted-screen probes. No rebuild/restart required under STEERING 63.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check (results below); receipt logs /tmp/2501-{health,services,sources,jobs,format,lint,check}.log.
- Next: metrics ≥13:07 UTC; scheduled public publication/editorial acceptance 15:00 UTC; Bluesky export by 20:36 UTC.
- Full pnpm check passes: 1,056 unit/329 integration passes, four expected skips; local file links resolve and git diff --check passes. Final health passes; zero firing/one pending disk warning after isolated verification.
