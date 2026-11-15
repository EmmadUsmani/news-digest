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

## 2026-11-15: iteration 2320 — bound disk-capacity maintenance

- Clean main; no inherited work. Initial alerts zero; `/healthz` confirms app/database/Redis healthy. Public mode remains off, VM private; scheduled recovery acceptance still pending.
- Protected-edition concern: narrow filesystem headroom permits the verified transient coverage peak to cross 80%. Read-only inventory finds `/tmp/obs355` (242.9 MiB) and `/tmp/news-digest-vmutils.tgz` (137.5 MiB), both last modified Nov 3; together 380.4 MiB exceeds the measured 271.8 MiB test peak. Age/size do not establish deletion safety.
- At 00:16 UTC, `df -B1 --output=size,used,avail,pcent /` reports 5,527,068,672 bytes available, 78% used. One integration directory remains younger than one hour. No deletions, cleanup changes, capacity retuning or alert changes.
- STEERING 51 explicitly forbids touching other `/tmp` content. Recorded exact candidate paths and need for scoped owner maintenance in NEEDS_FROM_HUMAN; updated TASKS to avoid repeating the explained transient diagnosis. No immediate intervention required; preserve caches, sessions, backups and observability data.
- `pnpm obs sources --check`: 38/38 healthy. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-14T15:00:00Z`: five topics/14 stories/19 posts and scheduled provenance verified. Receipts `/tmp/2320-*`.
- No application/UI/source/schema/system-flow changes, provider calls, edition writes or settings changes. SOURCES, handbook and screenshots unchanged. Metrics probe remains due no earlier than 00:25 UTC; no premature probe or waiting loop.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle-size warning only. No app deployment changes; API/worker restart and health verification follow the commit.

## 2026-11-15: iteration 2321 — due passive metrics recovery evidence

- Clean main; no inherited work. Initial disk alert pending; filesystem recovered to 78% used and health confirms database/Redis healthy. Established transient diagnosis not repeated; no deletion or threshold changes.
- Due `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`: 24 fresh healthy rules, four uncached queries ≤1.482 s, no new evaluator/missed/admission/timeout/slow-query failures. Both process starts unchanged; neither tier merged. Comparable natural merge acceptance remains open; CPU-only 2% trial unchanged.
- Warning-level system metrics/alerts journal since Nov 14 23:24 UTC empty. Updated capacity evidence/TASKS; next sample no earlier than Nov 15 01:27 UTC. No forced merge or metrics restart.
- `pnpm obs sources --check`: 38/38 healthy. Saved-reader check for Nov 14 15:00 UTC verifies scheduled provenance, five topics/14 stories/19 posts. Public mode off, VM private; next normal edition must establish Gaming/World/U.S. recovery before activation.
- No application/UI/source/schema/system-flow changes, provider calls, edition writes or settings changes; handbook/SOURCES/screenshots unchanged. Verification receipts `/tmp/2321-*`; full checks/build and service restart results recorded below.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit.

## 2026-11-15: iteration 2322 — trace absent Tech Bluesky selection

- Clean main; no inherited work. Initial alert snapshot zero. Scheduled recovery and metrics probe are not due; followed STEERING 59/42 to an unresolved social-quality question rather than repeating accepted checks.
- Reader weakness: Tech has no Bluesky posts despite three open slots. Cache-only production shortlisting in a repeatable-read read-only transaction verifies 671 observations, 50 uniquely scored candidates and one finalist, matching saved metadata.
- Sole finalist juxtaposes FAA AI adoption and grounding; saved triage flags unverified causation (relevance 7/importance 4). No stronger qualifying alternative is lost to shortlist capacity. Saved publication records editor-chose-none/zero validation drops; exact omission rationale remains unknown. Retained gates, budgets and prompts; forcing this candidate would add no established reporting.
- Added evidence/next-comparison guidance to Nov 14 Tech social review and TASKS. No provider/source requests, publication/database writes, runtime settings or application/UI/schema changes; SOURCES, handbook and screenshots unchanged. Private receipts `/tmp/2322-tech-*`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. `pnpm obs sources --check`: all 38 healthy. Check/build receipts `/tmp/2322-*.log`. API/worker restart and health verification follow commit.

## 2026-11-15: iteration 2323 — diagnose U.S. X breadth

- Clean main; no inherited work. Initial alerts zero; scheduled acceptance and metrics sampling not due.
- Reader weakness: U.S. has two X posts, including an unverified court claim, beside withheld stories. Saved complete triage has 15 unique scores, only three qualifying IDs across two events. Editor explicitly drops JFK in favor of SFO's timed status change; no stronger qualifying alternative is lost to shortlist capacity.
- Recorded supply diagnosis and next-edition comparison; retain gates/prompts/budgets. Court context remains attributed; official X metrics unknown. Ownership recovery remains the existing scheduled gate; public mode off/VM private.
- Read-only local GETs and offline assertions verify IDs, scores, selection, attribution and reader-field agreement. Temporary capture script initially needed a CJS async wrapper; corrected and removed. Private receipts `/tmp/2323-*`.
- No application/UI/source/schema/system-flow changes, provider/source requests, production writes or runtime changes; SOURCES, handbook and screenshots unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit.

## 2026-11-15: iteration 2324 — restore saved X source-link verification

- Clean main; no inherited work. Initial alerts zero. Scheduled recovery and the next metrics sample are not due; public mode remains off and VM private.
- Actual failure: `pnpm exec tsx scripts/smoke-reader-x-links.ts` rejects Nov 14's saved edition before opening the browser because its selector requires a URL glued to prose. Gaming's saved nominee announcement contains a normal spaced source link.
- Prefer joined-URL examples when available, otherwise select a real saved X post containing an HTTP link; retain exact display-text, original/source destination, spacing, keyboard-focus, typography and overflow assertions. No reader or editorial behavior changes. No claim that this edition exercises joined-URL spacing.
- Browser check now passes desktop/mobile light/dark with external traffic blocked; refreshed its four screenshots and inspected mobile light. Synthetic context-expansion check also passes all four views; discarded its unrelated screenshot refreshes.
- No provider/source requests, production writes, runtime settings, schema or system-flow changes; SOURCES and handbook unchanged. Verification receipts `/tmp/2324-*.log`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. `pnpm obs sources --check`: 38/38 healthy. API/worker restart and health verification follow commit.

## 2026-11-15: iteration 2325 — saved X fallback evidence

- Clean main; no inherited work. Alerts zero, health passes and all 38 sources healthy. Scheduled acceptance and metrics probe not due; public mode off/VM private.
- Reader concern: selected X posts must stay readable when third-party media is unavailable. The owner would notice missing text or broken recovery beside already-thin topic sections.
- `pnpm exec tsx scripts/smoke-reader-x-media.ts` passes desktop/mobile/320px light/dark: saved text, all selected failure states, original links, retry/keyboard recovery and theme persistence. Recovery uses a local widget stub, not live X.
- Recorded evidence in Tech social review and refreshed four desktop/mobile fallback screenshots; inspected mobile light. Discarded all other incidental screenshot refreshes. No observed app defect or code change.
- `pnpm exec tsx scripts/smoke-reader-coverage-count.ts` also passes all four views; discarded its screenshot refreshes. No external requests, provider calls, production writes or configuration changes; handbook/SOURCES unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit. Private receipts `/tmp/2325-*.log`.

## 2026-11-15: iteration 2326 — restore saved edition selection verification

- Clean main; no inherited work. Initial alerts zero, health passes, all 38 sources healthy. Scheduled acceptance and metrics probe not due; public mode off/VM private.
- Actual failure: `pnpm exec tsx scripts/smoke-edition-selection.ts` expects a desktop date without the visible weekday, then compares Bluesky rendered text against raw text despite saved display text. Updated assertions to match the current reader contract, preserving exact date/accessibility and content/destination checks; added post URL to mismatch diagnostics.
- Selection and `pnpm exec tsx scripts/smoke-edition-history.ts` pass 16 combined desktop/mobile light/dark delayed-success/error scenarios: late responses preserve the chosen saved edition, without writes or browser errors. External browser traffic blocked. Refreshed eight screenshots; inspected both mobile light views.
- No app behavior, source, schema, runtime settings or editorial changes; handbook/SOURCES unchanged. No provider calls or production writes. Receipts `/tmp/2326-*.log`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit. Next: due passive metrics sample, then scheduled Nov 15 review.

## 2026-11-15: iteration 2327 — due passive metrics recovery sample

- Clean main; no inherited work. Alerts zero, health passes, all 38 sources and 14 monitored services healthy; recent collection jobs completed. Historical failed transient check units are not monitored app services.
- Due read-only sample at 01:31:24–01:31:55 UTC: 24 fresh healthy rules; uncached queries ≤0.456 s; no new evaluator errors, missed iterations, admission hits, timeouts or slow queries. Neither tier merged; process starts unchanged.
- Warning-level system metrics/alerts journal since 00:25:32 UTC has no entries. Comparable natural merge still required; retain CPU-only 2% trial, no retuning/forced merge/restart. Next probe no earlier than 02:32 UTC. Raw receipt `/tmp/2327-metrics.jsonl`.
- Updated recovery evidence and open task. Public mode remains off/VM private; scheduled Nov 15 acceptance still pending. No provider/source requests, production writes, UI/schema/system-flow changes; handbook/SOURCES/screenshots unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit.

## 2026-11-15: iteration 2328 — saved-reader reporting provenance

- Clean main; no inherited work. Alerts zero, health passes and all 38 sources healthy. Scheduled acceptance and metrics sample not due; public mode remains off/VM private.
- Reader weakness under review: thin Tech reporting makes discovery-site versus publisher attribution material, including after bookmarking. No new editorial change is justified before the next natural edition.
- `pnpm exec tsx scripts/smoke-reader-saved-source.ts` passes desktop/mobile light/dark: real Nov 14 discovery and grouped primary-report provenance survives saved-item reload, with exact destinations; explicit synthetic publisher override and legacy fallback also pass. All external browser requests blocked. Refreshed four screenshots; inspected mobile light. No observed app defect.
- `pnpm exec tsx scripts/smoke-reader-story-text.ts` passes all four views for the older saved regression edition: exact story text, five NBA summaries, no writes/errors or saved-data changes. Discarded its incidental screenshot refreshes; this is not Nov 15 acceptance.
- No provider calls, production writes, configuration/schema/source changes; handbook/SOURCES unchanged. Receipts `/tmp/2328-reader.log` and `/tmp/2328-story.log`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit. Next: metrics no earlier than 02:32 UTC, then Nov 15 scheduled recovery acceptance.
- Initial push rejected after concurrent lead commit `50c0295b` (owner notes only); merged without editing owner files or rewriting history. API/worker restarted; `/healthz` confirms database/Redis healthy. Retrying push.
