# Progress

Earlier entries: [iterations 1062–1069](docs/progress-archive/2026-11-07-iterations-1062-1069.md).

Earlier entries: [iterations 1070–1074](docs/progress-archive/2026-11-07-iterations-1070-1074.md).

Earlier entries: [iterations 1075–1084](docs/progress-archive/2026-11-07-iterations-1075-1084.md).

Earlier entries: [iterations 1089–1101](docs/progress-archive/2026-11-07-iterations-1089-1101.md).

Earlier entries: [iterations 1191–1199](docs/progress-archive/2026-11-07-iterations-1191-1199.md).

Earlier entries: [iterations 1200–1207](docs/progress-archive/2026-11-07-iterations-1200-1207.md).

Earlier entries: [iterations 1208–1214](docs/progress-archive/2026-11-07-iterations-1208-1214.md).

Earlier entries: [iterations 1215–1222](docs/progress-archive/2026-11-07-iterations-1215-1222.md).

Earlier entries: [iterations 1223–1229](docs/progress-archive/2026-11-07-iterations-1223-1229.md).

Archived: [iterations 1230–1234](docs/progress-archive/2026-11-07-iterations-1230-1234.md).

## 2026-11-07: iteration 1235 — distinguish saved X transcripts

- Owner impact (STEERING 42/43): saved X transcript controls all said “Saved post text”; accessible names now identify author and exact publication time so readers can distinguish posts. Visible text and saved content unchanged; no paid calls.
- Clean main/no leftover work. Alerts clear, 14 services/36 sources healthy, latest digest completed and Nov 8 15:00 UTC queued; `/healthz` database/Redis OK. Metrics trial untouched; no repeat probe inside hourly limit.
- `pnpm exec tsx scripts/smoke-reader-x-media.ts` passes all 15 real saved X labels plus keyboard focus, transcript toggle, theme/resize and media recovery in desktop/mobile light/dark. External requests blocked; successful media uses an explicitly local stub.
- Four saved-transcript screenshots updated; mobile light inspected, unrelated regenerated images discarded. No handbook system-flow change.
- `pnpm build`, `pnpm format`, `pnpm lint:fix` and `git diff --check` pass; rebuilt API restarted healthy. `pnpm check` passes: 563 unit and 229 integration tests, four expected skips.
- Next: Nov 8 scheduled X/Bluesky/quality/cost/speed acceptance and first-week report. Metrics recovery remains open, passive check no sooner than 20:14 UTC.
- Initial push rejected: owner handbook palette commits landed remotely. Merged all three without rewriting history; docs-site typecheck/tests pass and docs service restarted. Reader verification remains applicable.

## 2026-11-07: iteration 1236 — hourly recovery evidence

- Clean main/no leftover work. Highest-priority open breakage remains metrics recovery; scheduled X/Bluesky/content acceptance awaits Nov 8 15:00 UTC. No provider calls or generation changes.
- `pnpm obs alerts`, `services --check`, `sources --check`, `jobs --check`: no active alerts, 14 services/36 sources healthy, next edition queued; latest social collection completed. App database/Redis health passes.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`: 20:15:10–20:15:40 UTC, 23 healthy rules, four uncached queries ≤0.098 s; zero new evaluator errors/misses, admission hits unchanged at two, no queue timeouts/slow queries. No merges; incident stays open.
- Metrics unchanged since 16:00:24 UTC/zero restarts. Updated decision 0004/TASKS with evidence and next passive check ≥21:15 UTC. No service restart needed for evidence-only changes; deployed app stays unchanged.
- Initial Grafana health request assumed port 3000 and failed; repository config identifies 3001/grafana, corrected health request passes.
- Verification: `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass: 563 unit/229 integration tests, four expected skips; typecheck/lint/format/boundaries green. Evidence-only change, no rebuild required.

## 2026-11-07: iteration 1237 — preserve keyboard focus through X recovery

- STEERING 42/43 reader weakness: after loaded X media failed during replacement, keyboard retry focused saved prose that hides on recovery. Actual saved-post browser reproduction failed the focus assertion before the fix.
- Retry now focuses the visible saved-transcript control, falling back to saved prose on first load. Keyboard readers retain their place while collapsed text stays collapsed. No generation/provider/budget changes or paid calls.
- Clean main/no leftover work. Initial alerts clear; services 14/14, sources 36/36 and jobs healthy; latest edition completed, social collection returns data. `/healthz` database/Redis OK. No metrics probe inside hourly limit.
- `pnpm exec tsx scripts/smoke-reader-x-media.ts` passes saved-post loading/failure/retry, theme/resize and keyboard replacement recovery on desktop/mobile light/dark; GET-only, external calls blocked, successful media is explicitly a local stub. Four recovery screenshots added; desktop/mobile inspected, unrelated regenerated screenshots discarded.
- `pnpm build` passes; rebuilt API restarted and health passes. Older progress entries archived; no handbook system-flow change.
- `pnpm check`: typecheck/lint/format/boundaries, 563 unit and 229 integration tests pass/four expected skips; outer command exited 143 after coverage. Separate `pnpm test:integration` rerun exits 0 with 229 pass/four skips. Final `pnpm format`, `pnpm lint:fix` and `git diff --check` pass.
- Next: Nov 8 scheduled X/Bluesky/content/cost/speed acceptance and first-week report. Metrics recovery remains open; next passive check ≥21:15 UTC.

## 2026-11-07: iteration 1238 — identify failed X media actions

- STEERING 42/43 reader weakness: failed X cards repeated identical retry/original link names in the screen-reader control list. Accessible names now include saved author and exact publication time; visible labels and destinations remain unchanged.
- Clean main/no leftover work. Initial `pnpm obs alerts`, services/sources/jobs checks and `/healthz` pass; 14 services/36 sources healthy, latest edition completed and Nov 8 15:00 UTC queued. No paid calls or generation changes; metrics probe not due until ≥21:15 UTC.
- `pnpm exec tsx scripts/smoke-reader-x-media.ts` reproduces the missing identity before the fix, then passes all 15 saved X action labels/destinations plus loading/failure/keyboard retry/theme/resize recovery in desktop/mobile light/dark. GET-only, external requests blocked; successful media is an explicit local stub.
- `pnpm exec tsx scripts/smoke-reader-scroll.ts` passes forward/backward saved-story navigation in all four views. Four failure screenshots refreshed; desktop dark/mobile light inspected, unrelated regenerated screenshots discarded. No handbook system-flow change.
- `pnpm build`, `pnpm format`, `pnpm lint:fix` and `git diff --check` pass. API restarted after the completed build; database/Redis health and final alerts/services/sources checks pass.
- Full `pnpm check` exits 0: typecheck/lint/format/boundaries, 563 unit tests and 229 integration tests pass; four expected integration skips.
- Next: Nov 8 scheduled X/Bluesky/content/cost/speed acceptance and first-week report. Metrics recovery stays open; next passive check ≥21:15 UTC.

## 2026-11-07: iteration 1239 — identify Bluesky media actions

- STEERING 42/43 reader weakness: Bluesky image links exposed only their supplied image description (or generic fallback), without naming the open-image action or saved post. Media links now name image position/video action, saved author and exact publication time, preserving supplied descriptions and destinations.
- Clean main/no leftover work. Initial alerts clear; 14 services/36 sources healthy, latest social collection completed with ten verified posts; scheduled acceptance waits for Nov 8 15:00 UTC. No paid calls, generation changes or hourly metrics probe before its due time.
- `pnpm exec tsx scripts/smoke-reader-bluesky-image-recovery.ts`: 16 loaded/recovered/failed/same-URL image cases pass with link identity, keyboard focus and destinations on desktop/mobile light/dark. First run exposed unrelated lazy-image requests in the harness; restricted recovery request accounting to the injected URLs.
- `pnpm exec tsx scripts/smoke-reader-bluesky-video.ts`: 12 loaded/failed/missing-preview cases pass with action/author/description labels. Both replays use saved post text plus explicitly synthetic media, GET-only/external blocked; eight screenshots refreshed, mobile light/desktop dark inspected.
- `pnpm build` passes; rebuilt API restarted, `/healthz` database/Redis OK. No handbook system-flow change.
- Verification: `pnpm format`, `pnpm lint:fix`, `git diff --check` and full `pnpm check` pass (563 unit/229 integration tests; four expected skips).
- Final bulk formatting command exited 143 after listing all files; targeted formatting of all changed text files passes, with standalone `pnpm lint:fix` rerun. Initial full formatting/lint pass remains valid.
- Next: Nov 8 scheduled X/Bluesky/content/cost/speed acceptance and first-week report; metrics recovery stays open, next passive check ≥21:15 UTC.
- Initial push rejected by three newer owner commits; merged cleanly without history rewrite. STEERING 50 now prioritizes public access: next iteration starts phase 0 (phase 2 if owner publication decisions block it); daily edition reviews remain required. Remote changes are steering/planning only; verified app remains unchanged.

## 2026-11-07: iteration 1240 — inventory public archive before backfill

- Clean main/no leftover work. Alerts clear; services/sources and `/healthz` healthy, latest edition completed and next scheduled for Nov 8 15:00 UTC. No hourly metrics probe before ≥21:15 UTC.
- STEERING 50 phase 0: added `pnpm exec tsx scripts/inventory-editions.ts`, a repeatable-read/read-only inventory with 15 s statement timeout; exports IDs/windows/counts/field shapes without article text or provider errors. No migration, generation, visibility, sharing or cap change; development spend $0.
- Inventory: 546 editions, 458 manual/88 keyed; six topic shapes. Manual editions occur only Nov 1–2; none on UTC days without keyed editions. Documented snapshot evolution and Nov 3–7 counts.
- Found 65 explicit `integration:` keys: the plan's blanket keyed-edition publication would include test records. Recorded this conflict and manual-publication confirmation in NEEDS_FROM_HUMAN.md; no fixture called live and no publication decision inferred.
- Inventory rerun matches all IDs/counts/structures; independent `docker exec news-digest-postgres-1 psql ...` aggregate confirms 546/88/65. First redirected rerun exposed slow-query logs contaminating JSON; standalone inventory now silences its own logger and JSON verification passes. Host psql unavailable; container psql used.
- `pnpm check` exits 0: typecheck/lint/format/boundaries, 563 unit tests and 229 integration tests pass/four expected skips. `pnpm build`, `pnpm format`, `pnpm lint:fix`, inventory JSON/aggregate assertions and `git diff --check` pass. Four app services restarted; health database/Redis OK and final alerts clear/14 services healthy. No UI/system-flow change; no browser or handbook edit required.
- Next: phase 2 browser preferences while publication decisions wait; phase 0 metadata/pools/test editions remain open. Daily Nov 8 acceptance and first-week report remain required.

## 2026-11-07: iteration 1241 — browser-local topic hiding

- Clean main/no leftover work. Alerts clear; 14 services/36 sources healthy, `/healthz` database/Redis OK; scheduled queue points to Nov 8 15:00 UTC. Metrics probe not due before 21:15 UTC.
- STEERING 50 waiting path: started phase 2 with a Topics menu listing the viewed edition's saved topics; hidden topics leave the content/sidebar/mobile chips, new topics default visible, and all-hidden readers can restore topics. No generation, publication, sharing or provider changes; development spend $0.
- One versioned localStorage key stores per-topic hidden/restored state and timestamps (restore tombstones); reload and other tabs observe choices. Corrupt/unavailable storage falls back safely; failed writes show a warning while retaining current-page choices. Rollback build: `VITE_READER_PREFERENCES=0`.
- `pnpm exec tsx scripts/smoke-reader-preferences.ts`: actual saved latest/older editions, hide/restore/all-hidden, reload, cross-tab, tombstones and corrupt/blocked storage pass in desktop/mobile light/dark; GET-only, external requests blocked. Eight screenshots saved; mobile light and desktop dark inspected.
- Initial build needed Vite environment types; initial smoke needed the repository's async-main pattern and hidden-status lookup behind the modal; initial lint required moving the hook out of the component file. Corrected before final verification.
- Updated affected handbook page; `pnpm exec tsx scripts/check-handbook.ts 01-app/README` passes (18 pages, one unchanged diagram, 28 tables).
- Final `pnpm check` exits 0: typecheck/lint/format/boundaries, 563 unit and 229 integration tests pass/four expected skips. `pnpm format`, `pnpm lint:fix`, final `pnpm build` and `git diff --check` pass. Four app services restarted; first replay raced API readiness, then all four views pass after `/healthz` became ready. Final alerts clear, database/Redis OK, 14 services/36 sources healthy.
- Next: phase 2 bookmark ID stability, bounded saved copies and `/saved`; phase 0 publication decisions remain recorded in NEEDS_FROM_HUMAN.md. No phase completion claimed; normal scheduled-edition acceptance still required. Nov 8 daily review/first-week report remain due.

## 2026-11-07: iteration 1242 — verify bookmark identity across saved editions

- Clean main/no leftover work. Alerts clear; `/healthz` database/Redis OK, 36 sources healthy, recent social collection completed with ten verified posts, next digest Nov 8 15:00 UTC. Metrics probe not due before 21:15 UTC.
- STEERING 50 phase-2 prerequisite: added `pnpm exec tsx scripts/audit-bookmark-identity.ts`; repeatable-read/read-only transaction, 15 s timeout, aggregate-only output. No app UI, preference writes, generation, publication, provider, budget or sharing changes; development spend $0.
- All 546 stored editions: 9,793 story occurrences/223 IDs, 101 post occurrences/90 platform-plus-external-ID keys; zero missing identities or conflicting ID/URL mappings. 118 story IDs/eight post identities recur across editions. Explicit integration editions separated; Nov 3–7 daily cohort has no repeated items, so earlier stored editions supply reuse evidence.
- Chose namespaced story IDs and unambiguous platform/external-ID tuples; canonical-URL fallback unnecessary for current archive. Underlying ingestion canonical-URL upsert/ranking passthrough and social composite primary key agree. Evidence/limitations: `docs/edition-reviews/2026-11-07-bookmark-identity.md`.
- Two live read-only script runs produce identical aggregates; independent container `psql` counts confirm 9,793/223/223, 101/90/90 and repeated/conflicting mappings 118/0 and 8/0. Four targeted offline tests pass, covering drift, aliases, platform separation, same-edition duplication, missing fields and output privacy; no external calls.
- Final `pnpm check` exits 0: typecheck/lint/format/boundaries, 567 unit and 229 integration tests pass/four expected skips. `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` pass. Initial check caught four unmarked test promises; explicit `void test(...)` fixed them. No browser/handbook change for a standalone diagnostic; archived iterations 1230–1234 to keep this file small.
- Next: bounded display copies/bookmark timestamps and tombstones in the existing browser-store key, story/post controls and `/saved`; phase 0 owner publication decisions remain open. Nov 8 daily review/first-week report remain required; phase 2 acceptance still needs bookmarks and a normal scheduled edition.

## 2026-11-07: iteration 1243 — bounded bookmark storage foundation

- Clean main/no leftover work. Alerts and `/healthz` healthy; all four topics' connected sources healthy (36 total), saved Nov 7 edition readable, next scheduled digest Nov 8 15:00 UTC. No paid calls or publication/sharing changes.
- STEERING 50 waiting path: extracted the version-1 browser store; existing hidden-topic records remain compatible and topic writes preserve bookmark records. Added bounded display copies (title 300, excerpt 600, attribution 200, URL 2,048, platform 40, edition ID 200 characters), HTTP(S)-only destinations and no credentials/unknown fields.
- Bookmark writer permits 1,000 distinct identities including removal tombstones, refuses new identities at capacity, and permits existing saves/removals. Per-key timestamps advance despite clock rollback; newest-record merging preserves stale-tab removals. Controls, cross-tab bookmark mutation and `/saved` remain next; no phase completion claimed.
- Five offline store tests pass: legacy reload, stale merge/removal/re-save, limits/unsafe destinations/field stripping, capacity and prototype-shaped identities. Browser `pnpm exec tsx scripts/smoke-reader-preferences.ts` passes desktop/mobile light/dark, now asserting topic writes preserve an explicit offline bookmark fixture; refreshed screenshots, mobile light inspected. Fixture never rendered or called live.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 2`: 21:16 UTC passive sample, 23 healthy rules, four queries ≤0.194 s, no new evaluator errors/misses or merges. Incident stays open; next probe ≥22:16 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` pass. Four app services restarted; final alerts clear and database/Redis healthy. Internal store change needs no handbook/schema/source update.
- Full `pnpm check` exits 0: typecheck/lint/format/boundaries, 572 unit tests and 229 integration tests pass/four expected skips. Browser regression and final formatting also pass. Next: connect bookmark controls and `/saved`; Nov 8 edition review/first-week report and phase-0 publication decisions remain open.

## 2026-11-07: iteration 1244 — story bookmarks and saved-items page

- Clean main/no leftover work. Alerts clear, `/healthz` database/Redis OK, 14 services/36 sources healthy; next digest Nov 8 15:00 UTC. Metrics passive probe not due before 22:16 UTC. Development spend $0; no provider/publication/sharing changes.
- STEERING 50 waiting path: story Save toggles and `/saved` retain bounded display copies with original/edition links, newest-first ordering and removal tombstones. Cross-tab mutation rereads/merges the browser store; failed writes retain page state with explicit warnings; capacity errors are surfaced. Flag-off build removes controls and the saved route.
- `pnpm exec tsx scripts/smoke-reader-bookmarks.ts`: actual saved edition, original/edition destinations, save/reload/remove/re-save, cross-tab changes, blocked storage and no horizontal overflow pass desktop/mobile light/dark; GET-only/external requests blocked. Eight screenshots saved; saved mobile light inspected.
- Initial added mobile-header overflow assertion caught crowding; moved Saved items below the sticky header, rebuilt and all four views pass. Existing `pnpm exec tsx scripts/smoke-reader-preferences.ts` also passes all four views, including old editions, legacy-topic storage, corrupt/blocked storage and bookmark-envelope preservation; eight screenshots refreshed.
- Updated app handbook; `pnpm exec tsx scripts/check-handbook.ts 01-app/README` passes (18 pages, one unchanged diagram, 28 tables). First handbook call raced API restart/readiness; rerun passes. No schema/source changes.
- Verification: `pnpm check` passed typecheck/lint/format/boundaries and 572 unit tests, then received SIGTERM during integration without reported failures. Separate `pnpm test:integration` exits 0: 229 pass/four expected skips. `pnpm format`, `pnpm lint:fix`, full `pnpm build`, final web rebuild and `git diff --check` pass. Four app services restarted; final health/alerts/services/sources and `/saved` HTTP checks pass.
- Next: post bookmark controls and remaining phase-2 acceptance, including a normal scheduled edition; phase-0 publication decisions remain owner-blocked. Nov 8 edition review/first-week report and metrics incident remain open.

## 2026-11-07: iteration 1245 — bookmark social posts

- Clean main/no leftover work. Initial alerts and `/healthz` healthy; 36/36 connected sources healthy, zero source errors, social collection completed; next digest Nov 8 15:00 UTC. Metrics passive probe not due before 22:16 UTC. Development spend $0.
- STEERING 50 waiting path: Save toggles for X, Bluesky and Reddit use namespaced JSON platform/external-ID tuples and the existing bounded browser store. `/saved` shows platform/author/text with original/edition links and removal controls; story saves remain compatible. No generation, provider, publication, schema or sharing changes.
- `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` exits 0: all 18 actual Nov 7 posts (15 X/three Bluesky), save/reload/original links/remove/re-save/cross-tab updates pass desktop/mobile light/dark. GET-only with external requests blocked; exercises saved-text/embed-failure view, no live Reddit claim. Eight bookmark/saved screenshots refreshed; saved desktop/mobile light inspected.
- `pnpm exec tsx scripts/smoke-reader-preferences.ts` exits 0: old-edition topics, reload, cross-tab/tombstones, corrupt/blocked storage and all-hidden recovery pass four views; screenshots refreshed. Updated app handbook; `pnpm exec tsx scripts/check-handbook.ts 01-app/README` passes (18 pages, one unchanged diagram, 28 tables). No source metadata change.
- Full `pnpm check` exits 0: typecheck/lint/format/boundaries, 572 unit and 229 integration tests pass/four expected skips. `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` pass. Four app services restarted; final health database/Redis OK and alerts clear. Commit/push follows verification.
- Next: remaining phase-2 acceptance (including normal Nov 8 scheduled edition with preferences enabled); phase-0 publication decisions remain owner-blocked. Daily edition/X/Bluesky review and first-week report remain due Nov 8; metrics incident remains open.

## 2026-11-07: iteration 1246 — historical bookmark acceptance

- Clean main/no leftover work. Alerts clear, `/healthz` database/Redis OK, 36/36 sources healthy; next scheduled digest Nov 8 15:00 UTC. Metrics probe not due before 22:16 UTC. Development spend $0.
- STEERING 50 waiting path: extended bookmark browser acceptance to the actual Nov 6 edition `1c83e78b-47f9-4a6f-bfb4-93820a691aea`. Historical story/post display copies retain original destinations and their historical edition link; reload, cross-tab removal and removal reload verified desktop/mobile light/dark.
- `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` exits 0 for all four views, including existing Nov 7 18-post coverage, storage warnings and layout checks. GET-only/external requests blocked; refreshed screenshots, inspected saved desktop/mobile light. First smoke attempt used an incorrect article selector; corrected to the actual list-item structure and rerun passed.
- No product, generation, schema or source changes; handbook/source metadata unchanged. Phase 2 remains open pending a normal scheduled edition with preferences enabled; phase 0 publication decisions remain owner-blocked.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` pass. `pnpm check` passes typecheck/lint/format/boundaries and all 572 unit tests, then SIGTERM during integration without reported failure; separate `pnpm test:integration` exits 0: 229 pass/four expected skips. Four app services restarted; final health/alerts clear.

## 2026-11-07: iteration 1247 — saved-item keyboard focus

- Clean main/no leftover work. Initial alerts and `/healthz` healthy; 36/36 sources have successful nonempty fetches and no errors. Metrics passive probe not due before 22:16 UTC. Development spend $0.
- STEERING 50 phase-2 waiting path: removing a saved item now focuses the next Remove button, the previous one at the end, or the Saved items heading when the list empties; keyboard readers can continue without returning to the page start.
- `pnpm exec tsx scripts/smoke-reader-bookmarks.ts` passes desktop/mobile light/dark with actual saved editions, first/last/only-item keyboard removal, existing bookmark storage/cross-tab/historical checks, GET-only and external requests blocked. Refreshed screenshots; inspected empty desktop/mobile light views.
- Full `pnpm check` exits 0: typecheck/lint/format/boundaries, 572 unit tests and 229 integration tests pass/four expected skips. `pnpm format`, `pnpm lint:fix`, `git diff --check` pass. First full build received SIGTERM after web completion without compilation errors; `pnpm build` retry exits 0.
- Four app services restarted; final `/healthz` database/Redis OK, alerts clear and actual Nov 7 scheduled edition readable with four topics. No generation/schema/source changes; handbook/source metadata unchanged.
- Initial push rejected (remote advanced); fetched/merged owner commits without rewriting history. New STEERING 51 leak cleanup is next; publication decision now resolved in NEEDS_FROM_HUMAN/TASKS. Remote changes are documentation only.
- Next: STEERING 51, then resume phase 0 with approved Nov 3+ non-integration scheduled publication set; Nov 8 phase-2 acceptance/daily X/Bluesky review/first-week report and metrics incident remain open.

## 2026-11-07: iteration 1248 — reclaim killed integration-run folders

- Clean main/no leftover work. Initial alerts clear, health database/Redis OK; 36/36 sources healthy and latest actual Nov 7 edition readable with four topics. Development spend $0; no provider/source/schema/UI changes.
- STEERING 51: removed 41 unused `/tmp/news-digest-integration-*` roots, 2,943,540 KiB (2.81 GiB); disk 71%→59%. First pass removed 39 aged roots; one-off age override removed two recent unused roots with the same process checks. No other temp content touched.
- Startup cleanup removes owned real directories older than one hour only when no live runner PID or same-UID environment/command/cwd/open-file reference exists. PID reuse retains folders. Read-only sudo proc probe handles protected entries and returns matching paths only; inspection failure deletes nothing. Concurrent disappearance tolerated; other runner behavior unchanged.
- `pnpm exec tsx --test apps/api/test/integration-temp.test.ts` passes: stale cleanup, recent/live-runner/orphan-child/unrelated/symlink preservation, killed child with runner marker removed by next cleanup, repeated cleanup harmless. Updated DATABASE-VERIFICATION and STEERING ack/TASKS.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` pass. Initial lint/full check caught missing `void` on test declaration; corrected. Full `pnpm check` retry exits 0: typecheck/lint/format/boundaries, 573 unit tests, 229 integration tests/four expected skips. Zero remaining integration temp roots after success.
- Four app services restarted; first health request raced readiness, subsequent health database/Redis OK. Alerts clear, 36/36 sources healthy, latest scheduled edition still readable. Disk remains 59%.
- Next: STEERING 50 phase 0 metadata/pools/test editions with approved Nov 3+ non-integration scheduled publication set. Nov 8 scheduled/daily X/Bluesky/phase-2 acceptance and first-week report remain due. Metrics passive check next ≥22:16 UTC.
