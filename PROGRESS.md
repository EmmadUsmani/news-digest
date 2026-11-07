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

## 2026-11-07: iteration 1230 — retain cleared evaluator failures in recovery evidence

- Owner impact (Current order 1): recovery health snapshots could miss alert-evaluation failures that clear between samples. Clean main/no leftovers; highest-priority incident remains open.
- Recovery probe now captures evaluator identity, lifetime execution errors and summed missed iterations across groups, plus interval deltas. New failures remain visible after rules recover; restarts/resets/nonfinite counters invalidate intervals. Offline regression covers these paths.
- Confirmed evaluator is not a configured scrape target: correct counter-name history queries return no series; journal since trial start is empty. No historical no-error claim, scrape change, forced compaction, production write or paid call.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 2 30`, 19:13:55–19:14:55 UTC: zero new errors/misses (lifetime 14/25), 23 healthy/fresh rules, six uncached queries/max 0.162 s; two small merges/7,015 rows, no big merge. Admission hits two, zero timeouts/slow queries; process unchanged/zero restarts.
- `pnpm exec tsx scripts/sample-observability-capacity.ts 6 10`: 60.045 s, 1.174% whole-stack CPU/681.0 MiB peak; metrics 0.375% CPU, 65/199 periods throttled; every unit zero memory-high/OOM events.
- Services 14/14, sources 36/36 and jobs healthy; no active alerts; app database/Redis and Grafana database health pass. TASKS and capacity evidence updated; initial deployment hold was superseded by owner STEERING 49 during push recovery; see deployment entry below.
- Verification: `pnpm check` passes (563 unit/229 integration, four expected skips); `pnpm build`, `pnpm format`, `pnpm lint:fix`, targeted recovery tests, final live probe smoke and `git diff --check` pass. No app runtime changes or restart.
- Next: comparable compaction evidence, queued deployment, Nov 8 scheduled acceptance and first-week report. Probe output now carries evaluator deltas for subsequent recovery observations.

## 2026-11-07: iteration 1230 — deploy queued fixes under new owner item 49

- Initial push of `012129a4` rejected: owner commits `8b040128`/`6ef4e2ee` added STEERING 49, removing the indefinite app-deployment hold. Fetched/merged without rewriting history or editing owner files; followed new priority immediately.
- Deployed merged main `96457a35` at 19:20 UTC: all queued publisher, NBA repair/preview/fallback/cutoff, Bluesky link/repair and X/schema diagnostics are live. Production quality acceptance remains due Nov 8; no paid rerun.
- `python3 ops/backups/database.py backup`: private 8,973,151-byte dump, 28 tables. `pnpm migrate`: applied `drizzle/0008_content_publisher.sql`; live ledger and `content_items.publisher:jsonb` verified. No rollback.
- Restarted API/worker/docs/schema with systemctl user units. Metrics service/trial unchanged; STEERING 49 replaces the deployment hold, incident stays open with at most one short passive check per hour.
- Services 14/14, sources 36/36, jobs, app database/Redis and Grafana database health pass; no active alerts. `pnpm exec tsx scripts/smoke-ui.ts`: actual saved Nov 7 reader, summaries, images, archive/reload and desktop/mobile layouts pass; no API writes/browser errors; four screenshots updated and mobile inspected.
- Removed stale hold wording in TASKS/decision 0004 and data-model handbook; Nov 8 plan records deployed revision. Earlier probe/check/build results above remain applicable: merged owner changes are instructions/status only.
- `pnpm exec tsx scripts/check-handbook.ts 07-data-model`: 18 pages, three diagrams and 28-table metadata pass; no diagrams changed. Final formatting/lint and diff checks pass.
- Next: Nov 8 scheduled selection/quality/cost/speed acceptance and first-week report; do not hold reader work on natural compaction.

## 2026-11-07: iteration 1231 — expose post publication dates to screen readers

- Owner impact (STEERING 42/43): the 18 actual Nov 7 X/Bluesky timestamp links announced only generic destinations, hiding publication dates from screen-reader link navigation. Bigger content fixes await Nov 8 acceptance; clean main/no leftover work, no active alerts or broken services/sources/jobs.
- Replaced overriding accessible labels with visually hidden platform context; existing exact timestamp labels now contribute to each link name. Visible ages, destinations, saved content and generation unchanged. No paid calls.
- New GET-only browser check reproduces the old accessible-name failure, then verifies all 18 real saved posts, destinations, date names, focus and containment on desktop/mobile light/dark; external traffic blocked. Four screenshots added; mobile light inspected. Existing sizing/layout selectors updated for descriptive names.
- `pnpm check`: 563 unit and 229 integration pass, four expected skips; `pnpm build`, `pnpm format` and `pnpm lint:fix` pass. `pnpm exec tsx scripts/smoke-post-timestamps.ts` and `scripts/smoke-post-sizing.ts` pass; sizing uses explicitly stubbed widgets. `pnpm exec tsx scripts/smoke-reader-layout.ts` passes four saved-edition device/theme views with external embeds blocked; unrelated regenerated screenshots discarded.
- Restarted API to serve rebuilt reader; `/healthz` database/Redis OK. Metrics trial untouched; no repeat probe inside the hourly limit. TASKS/STEERING updated; no handbook system-flow change.
- Initial push of `e9ad5319` rejected because owner lead-status commit `59080b41` landed remotely. Fetched/merged its two owner-note changes without editing them or rewriting history; application checks remain applicable.
- Next: Nov 8 scheduled X/Bluesky/quality/cost/speed acceptance and first-week report. Metrics recovery remains open; next passive check no sooner than 20:14 UTC.

## 2026-11-07: iteration 1232 — make original X posts easy to open after embed failure

- Owner impact (STEERING 42/43): saved Nov 7 X posts include incomplete sentences, but failed media offered only an explicit retry action. Added “Open original on X” beside retry so readers can continue at the original. Generation/content unchanged; no paid calls.
- Clean main/no leftovers; alerts clear, 14/14 services and 36/36 sources healthy, latest digest completed and Nov 8 15:00 UTC queued. Metrics trial untouched; no repeat probe inside hourly limit.
- Updated saved-data `pnpm exec tsx scripts/smoke-reader-x-media.ts`: missing-link assertion fails against old reader, then destinations, keyboard focus, wrapping, saved text and retry/theme/resize recovery pass desktop/mobile light/dark after rebuild. External requests blocked; successful embeds use an explicitly local stub.
- Four failure screenshots updated; mobile light inspected. Discarded unrelated loading/recovery screenshots. Handbook already describes opening originals after media failure; no system-flow change.
- Verification: `pnpm check` passes (563 unit/229 integration, four expected skips); `pnpm build`, `pnpm format`, `pnpm lint:fix`, browser smoke and `git diff --check` pass. API restarted to serve rebuild; initial immediate browser attempt hit startup connection refusal, retry after healthy `/healthz` passed.
- Next: Nov 8 scheduled X/Bluesky/quality/cost/speed acceptance and first-week report. Metrics recovery remains open; next passive check no sooner than 20:14 UTC.

## 2026-11-07: iteration 1233 — identify each story's coverage control

- Owner impact (STEERING 42/43): all 20 saved Nov 7 story-coverage labels named only the article count, leaving screen-reader navigation without story context. Included the story title; visible counts, reporting, selection and generation unchanged. No paid calls.
- Clean main/no leftover work. `pnpm obs alerts`, `services --check`, `sources --check`, `jobs --check` and `/healthz`: no active alerts, 14 services/36 sources healthy, no failed digest runs; next edition Nov 8 15:00 UTC. Metrics trial untouched; hourly probe not yet due.
- `pnpm check`: 563 unit/229 integration pass, four expected skips; `pnpm build` passes. API restarted; database/Redis healthy.
- `pnpm exec tsx scripts/smoke-reader-coverage-labels.ts`: all 20 real saved controls retain story-specific labels, keyboard expansion/collapse, report URLs and containment in desktop/mobile light/dark. GET-only/external traffic blocked; four screenshots added, mobile light inspected.
- Initial browser selector assumed a native summary matched Playwright's button role; corrected to the summary element and explicit label assertion. Updated existing reader-layout label expectation. No handbook system-flow change.
- `smoke-reader-layout.ts` hit existing deep-link offset timeout twice at line 770; standalone cold pages confirmed 228 px desktop/351 px mobile instead of 96/144 px. Font-wait attempt did not resolve drift and was deliberately discarded; source-label/keyboard checks pass. Recorded next reader issue in TASKS; unrelated regenerated screenshots discarded.
- Final `pnpm format`, `pnpm lint:fix` and diff checks pass. Next: diagnose deep-link drift; Nov 8 scheduled acceptance/first-week report. Metrics recovery remains open, passive check no sooner than 20:14 UTC.

## 2026-11-07: iteration 1234 — keep opening story links below navigation

- Owner impact (STEERING 42/43): saved-story reloads landed too far below navigation. Cold-page comparison isolated smooth scrolling plus earlier topic resizing; instant scrolling alone still drifted to 128/212 px. Clean main/no leftover work.
- Opening anchors now restore instantly through font/lazy-card size changes; wheel, touch, pointer, keyboard or hash navigation disconnects restoration. No content, selection, provider or budget changes; no paid calls.
- `pnpm exec tsx scripts/smoke-reader-layout.ts` passes all four real saved-edition desktop/mobile light/dark views with strict 96/144 px alignment and resize-after-user-scroll release checks. External embeds blocked, GET-only. Four deep-link screenshots added; mobile light inspected. Unrelated regenerated screenshots discarded.
- `pnpm check` passed typecheck/lint/format/boundaries and 563 unit tests, then exited 143 after logging all 233 integration cases without a final summary; `pnpm test:integration` rerun passes (229 pass/four expected skips). `pnpm build`, final `pnpm format`, `pnpm lint:fix` and `git diff --check` pass. API restarted with rebuilt reader; `/healthz` database/Redis OK.
- Initial alerts clear; 14 services/36 sources healthy, latest digest complete and fresh social collection returning data. No repeat metrics probe inside hourly limit. No handbook system-flow change.
- Next: Nov 8 scheduled X/Bluesky/quality/cost/speed acceptance and first-week report. Metrics recovery remains open; passive check no sooner than 20:14 UTC.

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
