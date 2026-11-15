# Progress

Older entries: [through iteration 2288](docs/progress-archive/2026-11-14-through-2288.md), [2289–2294](docs/progress-archive/2026-11-14-2289-through-2294.md), [2295–2298](docs/progress-archive/2026-11-14-2295-through-2298.md).

Archived continuation: [2299–2304](docs/progress-archive/2026-11-14-2299-through-2304.md).

Archived continuation: [2305–2314](docs/progress-archive/2026-11-14-2305-through-2314.md).

## 2026-11-14: iteration 2315 — repair saved-reader browser verification

- Clean main; no inherited work. Alerts zero; health/database/Redis healthy and source check passes. Scheduled Gaming/World/U.S. recovery still awaits Nov 15; public mode remains off and VM private.
- Reader weakness: linked-site attribution shipped, but the broad saved-reader layout smoke still expected feed-only labels and could not verify the current edition. Owner benefit: outlet identity, report links and navigation are again checked together across desktop/mobile light/dark.
- Reproduced stale `via Hacker News` expectation against real saved Reuters coverage; updated collapsed/expanded attribution and URL/favicon assertions to use each report's own destination, without attributing aggregate feeds to the primary report.
- Fixed the smoke's second stale expectation (`1d ago`): day-old reports show their publication date. No reader behavior or saved content changed. Full GET-only browser smoke passes in all four views, including coverage/deep links, contents tracking, time updates and overflow; external requests blocked.
- Refreshed four reader-layout screenshots and inspected desktop/mobile output. Discarded other incidental smoke screenshots deliberately. Trimmed old TASKS done markers; history remains in PROGRESS.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `pnpm build` pass (1,025 unit/329 integration passes, four expected skips; existing bundle warning). First combined verification process terminated with exit 143 during unit tests, no assertion failure; standalone full rerun passes. `git diff --check` clean.
- API/worker restarted and active; health retry confirms database/Redis healthy after startup. No app/source/schema/system-flow change, provider calls, edition writes or runtime setting changes; SOURCES/handbook unchanged. Receipts `/tmp/2315-*`. Next: normal five-topic scheduled acceptance; passive metrics probe no earlier than 23:24 UTC.

## 2026-11-14: iteration 2316 — restore saved Bluesky link verification

- Clean main; no inherited work. Alerts zero and health/database/Redis healthy. Gaming/World/U.S. scheduled recovery remains pending; public mode off, VM private.
- Reader concern: source-link verification failed on the current edition because the first Bluesky post has no inline URL. Owner benefit: real linked reporting is again checked with original-post navigation, focus and mobile layout.
- Reproduced `Saved post exercises inline source links`; select a saved post containing a source URL, locate its actual card, and compare rendered `displayText` with raw-text fallback. Sky News' saved display text correctly expands its short URL; discarded the initial unnecessary bare-link UI change after checking this. Reader behavior/content unchanged.
- GET-only smoke passes desktop/mobile light/dark against real saved reporting; four refreshed screenshots inspected. Post-byline smoke also passes six views; discarded incidental byline/clipped-link screenshot changes deliberately. No external requests/provider calls or edition writes.
- Due 23:24:15–23:24:46 passive metrics sample: 24 healthy rules, zero new evaluator errors/misses, one small 28,120-row merge, no big merge; uncached probes ≤0.487 s. Second comparable natural merge remains unobserved. Next probe no earlier than Nov 15 00:25 UTC.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, final Bluesky browser smoke and full `pnpm check` pass (1,025 unit/329 integration passes, four expected skips; existing bundle warnings). Initial combined format and direct check processes exited 143 without assertion failures; standalone format and background user-unit full rerun pass. All 38 sources healthy; `git diff --check` clean.
- No app/source/schema/system-flow change, provider calls, edition writes or runtime settings changed; SOURCES and handbook unchanged. Final build restores unchanged reader code. Receipts `/tmp/2316-*`; next work is normal five-topic scheduled acceptance, with public mode still off.

## 2026-11-14: iteration 2317 — explain World X breadth before tuning

- Clean main; no inherited work. Initial alerts zero; health/database/Redis healthy. Public mode remains off, VM private; scheduled Gaming/World/U.S. recovery still pending.
- Reader weakness: World's two X picks are political claims with no independent reporting in saved text. Owner benefit: next acceptance can distinguish missing alternatives from an editor/ranking failure rather than changing the wrong control.
- Saved preview shows 16 unique scored candidates, no unscored IDs, and only three passing relevance ≥6/interestingness ≥4. Two carry the same Putin quote; the editor explicitly keeps one. The other selected claim was already scored as unverified/hype-style.
- All three qualifying IDs have interestingness four; a threshold of five leaves zero. Three cannot overflow the ten-candidate shortlist. Recorded the cause/decision and linked a concrete Nov 15 supply/contribution comparison. No threshold, prompt, generation or runtime change justified.
- Contract-parsed preview/reader assertions pass for complete scores, gates, duplicate event labels, selected order and every public X field. Initial whole-object equality included private preview metadata; corrected projection passes. No actual reader mismatch. Temporary assertion script removed; receipt `/tmp/2317-world-x.json`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warnings only. `check-scheduled-reader.ts 2026-11-14T15:00:00Z` verifies five topics/14 stories/19 posts and scheduled provenance; `pnpm obs sources --check` passes for all 38 sources. Receipts `/tmp/2317-*`.
- API/worker restarted and active; post-restart `/healthz` confirms database/Redis healthy.
- No app/UI/source/schema/system-flow change, provider/source/media calls, edition or database writes. SOURCES, handbook and screenshots unchanged. Next: normal all-topic acceptance; metrics probe no earlier than Nov 15 00:25 UTC.

## 2026-11-14: iteration 2318 — triage transient disk warning

- Clean main; no inherited work. Initial `pnpm obs alerts` reports a new pending DiskSpaceLow warning; `/healthz` confirms database/Redis healthy and API/worker active.
- Protected-edition concern: a full filesystem could stop ingestion/publication. Prioritized the new warning over the already-pending scheduled acceptance and not-yet-due metrics recovery probe.
- Read-only disk metric history (30 minutes, 30-second samples) shows two >80% observations: 23:34:30 at 80.06%, 23:47:00 at 80.08%; subsequent alert snapshot has zero pending/firing alerts. `df` shows 5.2 GiB available; no deleted regular files held open (`sudo lsof +L1`). Cause of the transient writes remains unknown.
- Only one integration root exists, 29 MiB, created 23:25 and younger than the one-hour safeguard. No running integration tests found; no leak established and no folders deleted. Left item 51 boundaries, automatic cleanup and alert thresholds unchanged. Added bounded recurrence follow-up to TASKS; removed old completed markers (history retained here).
- No app/source/UI/schema/system-flow change, provider calls, edition writes or runtime changes. Public mode remains off, VM private; Gaming/World/U.S. natural scheduled recovery still pending. SOURCES/handbook/screenshots and NEEDS_FROM_HUMAN unchanged; no owner action required.
- Verification (finished Nov 15 00:00 UTC): `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `pnpm build` pass: 1,025 unit/329 integration passes, four expected skips; existing bundle warning only. Initial check stopped at TASKS formatting after a late edit; targeted Prettier correction and full rerun pass. `pnpm obs sources --check`: 38/38 healthy; `check-scheduled-reader.ts 2026-11-14T15:00:00Z`: five topics/14 stories/19 posts and scheduled provenance verified.
- API/worker restarted and active; startup-retried `/healthz` confirms database/Redis healthy. Receipts `/tmp/2318-*`. Next: Nov 15 scheduled acceptance; passive metrics recovery probe no earlier than 00:25 UTC; investigate sustained disk recurrence rather than speculative cleanup.

## 2026-11-15: iteration 2319 — attribute recurring disk crossings

- Clean main; no inherited work. Initial DiskSpaceLow pending again; app/database/Redis healthy. Prioritized recurrence over scheduled acceptance, which is not due yet; public mode off, VM private.
- Historical 30-second filesystem samples show three brief >80% crossings at 23:34:30, 23:47:00 and 00:00:00, followed by recovery below 79%; later two coincide with prior full-check completion. No deletions or threshold changes.
- Reproduced with required full check and read-only one-second filesystem/process-I/O/integration-root sampling: available space 5,278.7→4,998.1→5,270.0 MiB. New isolated root peaked at 271.8 MiB, with coverage JSON files, then disappeared normally at 00:12:50. This verifies transient coverage output explains this crossing; prior bursts remain correlation rather than retrospectively proved attribution.
- Existing inactive root remains 28.0 MiB, younger than one hour; safeguards correctly retain it. No current growing-root leak established. Baseline leaves little headroom above the 80% alert; retained a targeted sustained-loss/expired-root follow-up rather than weakening alerts or changing test coverage.
- Archived entries 2305–2314 after PROGRESS crossed 25 KB. No application/UI/source/schema/system-flow changes; SOURCES, handbook and screenshots unchanged. No provider calls, edition writes, settings changes or owner action required.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,025 unit/329 integration passes, four expected skips). Initial check stopped on new archive formatting; targeted Prettier correction and full rerun pass. `pnpm obs sources --check`: 38/38 healthy; `check-scheduled-reader.ts 2026-11-14T15:00:00Z`: five topics/14 stories/19 posts and scheduled provenance verified. Receipts `/tmp/2319-*`.
- Build and `git diff --check` pass (existing bundle warning). Metrics independently captured 80.0798% at 00:13:00, recovering to 78.9950% by 00:13:30. Final alerts zero; API/worker restarted active and `/healthz` confirms database/Redis healthy. Next: normal Nov 15 acceptance; metrics probe no earlier than 00:25 UTC.
