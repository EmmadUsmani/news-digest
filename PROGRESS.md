## 2026-11-05: iteration 874 — finish the private admin gate rollout

- Started clean on main; no leftover work. Initial alerts clear, services and /healthz healthy; all 36 sources returning data, latest scheduled edition completed with four topics/17 stories/14 posts.
- Moved operational controllers/callers to /api/admin; removed legacy routes, including writes and generation jobs. Isolated HTTP coverage verifies anonymous denial and legacy 404 even for admins.
- Applied the existing gate to docs/DB/Grafana/logs/metrics/queues, including assets and query APIs. Tool responses retain no-store/identity Vary despite upstream cache headers.
- Reader loads only edition/history data, with no operational requests, settings, generation controls or admin links. Existing management controls now live at /admin behind uncached identity; dedicated shadcn pages remain step 3.
- Migrated local scripts and browser replays together. Node-only token bridges cover admin documents and tool reads/queries; browser writes remain blocked or simulated, redirects refused, saved data unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (505 unit/218 isolated integration passed); pnpm build; final web typecheck/lint and git diff --check. Handbook checker: 18 pages/22 diagrams; corrected Operations length, targeted recheck passed, 28 schema tables.
- Browser: admin-gate (24 denied GET/HEAD paths, forwarded-token denial, legacy removal), admin-separation (desktop/mobile light/dark), ui, ui-routing, topics, edition-jobs, metrics, logs, queues and slow-queries passed. Eight new split screenshots plus reader-route evidence retained; unrelated generated screenshot churn restored.
- Final Grafana check found an active but stalled service: direct and proxied health timed out with sustained memory-high pressure. Restart restored direct/proxied health (200, database ok, no-store); no resource-limit changes.
- Updated TASKS, access decision and affected runtime/Operations handbook; archived iterations 860–861. No paid calls, saved-edition/settings writes, new sources or schema changes; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Next: step 3 dedicated admin pages; X fresh-window rounds after 21:00 UTC Nov 5/6; review Nov 6 story grouping/editor-v5 and spend. Proxy forged-header check remains required before future public access; VM stays private.

## 2026-11-05: iteration 875 — admin navigation and dedicated Tools page

- Started clean on main; alerts clear, API/worker and /healthz healthy; no leftover work. All 36 sources active, returning items without errors; digest/social queues show completed runs.
- Began UI step 3 with shared admin layout, desktop sidebar, active navigation and mobile shadcn/Radix sheet with keyboard dismissal. Overview retains unmigrated controls; removed its old hero, duplicate header and footer.
- Added /admin/tools with six shadcn cards for Grafana, Logs, Metrics, Queues, DB explorer and Handbook; new tabs retain the existing server gate. Tools loads identity only, without operational API requests.
- Extended Node-only browser document bridge to protected child routes; tokens stay outside the browser. Added repeatable smoke-admin-tools.ts and retained four Tools plus four updated Overview screenshots.
- Verification: pnpm format; pnpm lint:fix; pnpm check (505 unit/218 isolated integration passed); pnpm build and final web build; git diff --check. Handbook checks for Operations/runtime passed (18 pages, 1 diagram each, 28 schema tables); no diagrams changed.
- Browser: smoke-admin-tools, smoke-admin-separation and smoke-admin-gate passed; desktop/mobile light/dark, deep reload, menu open/Escape/link dismissal, six links, no overflow/writes/browser credentials. Saved real edition unchanged. Visually checked Tools desktop light/mobile dark; corrected legacy heading styles before final captures.
- API restarted for built web; worker unchanged under STEERING 22. Health/alerts clear; saved edition four topics/17 stories/14 posts. No paid calls, settings/edition writes, source or schema changes; SOURCES and NEEDS_FROM_HUMAN unchanged; archived iteration 862.
- Next: continue dedicated admin pages (Overview, Editions/creation/inspector, Sources, Topics, Schedule, Spend), then reader. X fresh-window rounds after 21:00 UTC Nov 5/6; Nov 6 scheduled editorial review. Public proxy check remains deferred until public access.

## 2026-11-05: iteration 876 — compact operations Overview

- Started clean on main; no leftover work. Initial alerts clear, /healthz healthy and all 36 sources returning content. Latest scheduled edition remains four topics/17 stories/14 posts; digest queue has no failures.
- Added shadcn Overview cards for health, active source health and AI/X daily spend/caps; latest saved edition shows per-topic story/post modes/counts, retained worker duration and reader link. Source issues and next edition/social runs are visible without opening detailed controls.
- Existing edition/topic/schedule/status controls remain in a collapsed section and mount only when opened; Overview no longer fetches content/topics/profile. Dedicated management pages still replace those controls next. Inline alert count and per-edition cost remain open; alerts link to Grafana.
- Added repeatable smoke-admin-overview: four viewport/theme combinations, anonymous denial, reload, mobile menu, stale-data refresh failure/recovery and no browser credentials/writes/overflow. Anchored the Node-only document bridge so API scenario routes are no longer shadowed.
- Browser: smoke-admin-overview, smoke-admin-separation, smoke-admin-tools and smoke-admin-gate passed; final layout rechecked with Overview/separation. Four Overview and four updated controls screenshots retained; visually checked desktop light/mobile dark. Saved real edition unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (505 unit/218 isolated integration passed); pnpm build; final web build/typecheck; git diff --check. Unit/integration counts: 505/218 passed. First full command exited 143 after passing tests; retry caught formatting of newly archived entry, corrected before final rerun.
- Handbook Operations/runtime checks passed (18 pages, 2/1 unchanged diagrams, 28 assigned tables). API restarted for built web and readiness confirmed; worker unchanged. No paid calls, saved settings/edition writes, source/schema/access changes; SOURCES and NEEDS_FROM_HUMAN unchanged; archived iteration 864.
- Updated TASKS and affected handbook; archived iteration 863. Next: complete Overview alert count/cost and dedicated Editions/creation/inspector, then remaining admin pages; X rounds after 21:00 UTC Nov 5/6; review Nov 6 edition. Private proxy check remains required before public access.

## 2026-11-05: iteration 877 — dedicated source collection page

- Started clean on main; no leftover work. Alerts clear, API/worker and /healthz healthy; all 36 sources collecting. X fresh-window experiments remain due after 21:00 UTC.
- Owner-visible value: a dedicated Sources page replaces scattered source cards with one collection-health table.
- Added protected `/admin/sources` and shared navigation/mobile title, a shadcn-style table for collection state, timestamps, last response/stored article counts and errors, plus X/Bluesky/parked Reddit/deferred YouTube rows.
- Removed the replaced source cards and Reddit explanation from the legacy status panel. Sources is a partial spec step: topic links, 24-hour/7-day counts, enable switches and Add feed remain open; existing counts are explicitly labelled.
- Browser: smoke-admin-sources passed four viewport/theme combinations, 36 live source rows, anonymous denial, deep reload, mobile navigation, refresh failure/recovery, no overflow/writes/browser credentials. Four screenshots retained; desktop light/mobile dark visually inspected. Initial browser attempt preceded API readiness; retried after healthy /healthz. Combined verification command exited 143 during integration after 505 unit passes; standalone check rerun passed.
- Verification: pnpm format; pnpm lint:fix; pnpm check (505 unit/218 isolated integration passed); pnpm build; git diff --check. Handbook Operations check passed (18 pages, one unchanged diagram, 28 assigned tables); admin gate passed 24 denied paths and forwarded-token denial; smoke-admin-overview passed.
- API restarted for built web; worker unchanged. Final health/alerts clear. No paid calls, saved-data writes, source/schema/access changes; SOURCES and NEEDS_FROM_HUMAN unchanged; archived iteration 864.
- Push initially rejected after owner STEERING-only commits landed; merged item 38 without rewriting history.
- Next: finish dedicated admin pages and Sources management, then final reader; Overview alert count/cost remain. X rounds after 21:00 UTC Nov 5/6 and scheduled Nov 6 editorial/story-pool review stay ahead when due.

## 2026-11-05: iteration 878 — dedicated edition schedule

- Started clean on main; no leftover work. Initial alerts clear and API/worker active; /healthz database/Redis healthy. X fresh-window work remains due after 21:00 UTC.
- Owner-visible value: schedule controls now have a focused, directly linked page instead of being buried in legacy Overview controls.
- Added protected /admin/schedule, desktop/mobile navigation and next-edition time/queue warning; moved the daily time, timezone, coverage and default budgets form into a styled Card with shared Button. Removed duplicate legacy controls.
- Browser: smoke-admin-schedule covers four viewport/theme combinations, anonymous denial, reload, mobile navigation, no overflow/browser credentials, simulated save and failed-save draft retention. PUTs are replayed in memory; no live schedule changes. Four screenshots retained; desktop light/mobile dark visually inspected.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; git diff --check; handbook operations check; smoke-admin-gate. Passed 505 unit/218 isolated integration tests and build; handbook 18 pages/2 unchanged diagrams/28 tables; admin gate 24 denied paths and forwarded-token checks passed.
- Migrated existing smoke-schedule to the dedicated route and loopback address; retained its validation, uncertain-save/reload and unchanged-live-data checks. Archived iteration 865.
- Initial browser script needed an async wrapper for the repo's CommonJS config; corrected. Operations page exceeded its line cap by one; condensed before rerunning.
- API restarted for built web; worker unchanged. Final alerts clear; 36 sources/no errors, saved edition four topics and no failed queues. Overview regression and both schedule browser suites passed; retained updated captures. No paid calls, source/schema changes or saved-data writes; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: dedicated Editions/creation/inspector, Topics and Spend; finish Sources controls and Overview cost/alerts. X rounds after 21:00 UTC Nov 5/6; Nov 6 editorial review.

## 2026-11-05: iteration 879 — dedicated spending page

- Started clean on main; no leftover work. Alerts clear, /healthz healthy, API/worker active; all 36 sources have no current error. X fresh-window rounds remain due after 21:00 UTC.
- Owner-visible value: AI/X costs, caps and the scheduled edition reserve now have a directly linked Spend page instead of being buried in legacy status controls.
- Added protected /admin/spend with shared desktop/mobile navigation, UTC daily/monthly tables, outstanding holds, availability, provider stops, reserve/last result, purpose/model totals and Grafana Product link. Removed duplicate legacy usage panels.
- Individual recent-call rows remain open; this ships the budget/reserve portion of the approved Spend page. No API, source, schema, access or budget changes; no paid calls or saved-data writes. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Browser: smoke-admin-spend passed all four viewport/theme combinations, live totals, anonymous denial, reload, mobile navigation, refresh failure/recovery and no overflow/writes/browser credentials. Four captures retained in docs/screenshots/ui; desktop light/mobile dark visually inspected.
- Migrated smoke-ai-spend and smoke-reserve-status to Spend; both passed, including synthetic protected/released reserve states and unchanged saved edition. Migrated legacy status/X-copy checks away from replaced panels; both passed alongside admin gate and Overview regression. Updated status captures.
- Verification: pnpm format; pnpm lint:fix; pnpm check (505 unit/218 isolated integration passed); pnpm build; final web build; targeted ESLint/Prettier; git diff --check. Handbook Operations check passed (18 pages, two unchanged diagrams, 28 assigned tables). Archived iterations 866–867 and trimmed old completed TASKS markers.
- Initial typecheck caught an unsupported Button variant; fixed. Browser caught mobile table sizing; fixed and rerun. Final restart browser attempt preceded API readiness; rerun after healthy /healthz passed. Handbook line cap corrected before recheck. Combined verification exited 143 during integration after 505 unit passes; standalone check rerun. Legacy scripts needed the existing controls toggle and removal of replaced source assertions.
- API restarted for final built web; worker unchanged. Final alerts clear and health green. Next: dedicated Editions/creation/inspector and Topics, Sources management, Spend recent calls; X rounds after 21:00 UTC Nov 5/6 and Nov 6 edition review.

## 2026-11-05: iteration 880 — saved editions and topic inspector

- Started clean on main; no leftover work. Alerts clear, /healthz healthy, API/worker active. X rounds still due after 21:00 UTC.
- Owner-visible value: saved editions now have a dedicated history and topic inspector, so the owner can review selection evidence without navigating legacy Overview controls.
- Added protected /admin/editions and /admin/editions/:id with shared navigation, paginated saved windows, topic tabs, candidate/rejection counts, modes/reasons, briefs, story scores, why-it-matters, grouping/source evidence, selected posts and reader link. Uses existing saved admin APIs; no new backend/schema/source/budget/access behavior.
- Partial spec delivery: list run type/cost/duration/per-topic modes, incoming-window articles and New edition remain; Topics and other existing UI gaps stay open in TASKS. No inferred metadata presented as recorded data.
- Browser: smoke-admin-editions passed four viewport/theme combinations with real saved data, paging round-trip, all four topics, keyboard tabs, deep reload, mobile navigation, anonymous denial, no overflow/writes/external requests/browser credentials. Eight screenshots retained; desktop light and mobile dark visually inspected. Mobile table wraps and legacy anchor sizing corrected before final captures.
- Updated handbook Operations; archived iterations 868–869 and condensed completed TASKS markers. No paid calls or saved-data writes; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Runtime checks: 36 sources/zero current source errors; latest saved edition four topics/17 stories/14 posts. Retained failed queue jobs date to Nov 1–4 (ingestion/Bluesky); current social collection succeeds and no digest jobs failed. Alerts clear. API restarted for final web build; worker unchanged.
- Initial full check caught documentation formatting during edits; corrected. Handbook line cap condensed; final operations check passed (18 pages/two unchanged diagrams/28 assigned tables). Admin gate and Overview regression passed; Overview captures refreshed for navigation.
- Verification: pnpm format; pnpm lint:fix; pnpm check (505 unit/218 isolated integration passed); pnpm build and final web rebuild; targeted ESLint/Prettier; git diff --check; handbook operations; smoke-admin-gate; smoke-admin-overview; smoke-admin-editions. Final health/alerts green.
- Next: finish Editions metadata, incoming-window list and creation, then Topics and remaining Sources/Spend controls; X rounds after 21:00 UTC Nov 5/6 and Nov 6 scheduled edition review take priority when due.

## 2026-11-05: iteration 881 — dedicated edition creation

- Started clean on main; no leftover work. Alerts clear, /healthz healthy, API/worker active; 36 sources have no current error. X rounds remain due after 21:00 UTC.
- Owner-visible value: New edition is now directly accessible from admin navigation and Editions, with a focused coverage-window form and live topic progress instead of the buried Overview panel.
- Added protected /admin/editions/new: 6 h/24 h/7 d/custom presets, date validation, AI-budget/reserve notice, existing async submission/status polling, session reload recovery, topic stages and saved-inspector result link. Removed replaced creation panel and its admin polling/budget code from the reader component.
- Uses existing endpoints and budget enforcement; no backend, schema, source or access changes. No paid calls or saved-data writes; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Browser: smoke-admin-new-edition passed four viewport/theme combinations, anonymous denial, invalid custom dates, simulated submission/progress/reload/completion/failure and unchanged saved edition. Four captures retained; desktop light/mobile dark visually inspected. Simulated job stages are verification data, not live jobs.
- Migrated smoke-edition-jobs, smoke-manual-reserve and admin-separation to the new route/layout. Job deadlines, uncertain submissions, reconnect, malformed status, completion/failure and unchanged full saved data passed; reserve and Overview checks passed. Gate passed 24 denied paths/eight forwarded-token cases.
- Handbook Operations updated; initial line-cap failure condensed and rerun passed (18 pages/two unchanged diagrams/28 tables). Mobile separation assertion initially targeted hidden desktop navigation; corrected to page content and rerun passed.
- Verification: pnpm format; pnpm lint:fix; pnpm check (505 unit/218 isolated integration passed); pnpm build; git diff --check; handbook operations; smoke-admin-new-edition, smoke-edition-jobs (final stage assertions rerun), smoke-manual-reserve, smoke-admin-overview, smoke-admin-editions, smoke-admin-separation and smoke-admin-gate. Initial combined check exited 143 during integration without assertion failures; standalone full rerun passed.
- Archived iterations 870–871. API restarted for verified built web; worker unchanged. Final health/alerts green; latest real edition remains four topics/17 stories/14 posts. Updated TASKS and retained refreshed route/navigation captures.
- Next: Editions run metadata/incoming-window articles, then Topics and remaining Sources/Spend controls; X fresh-window rounds after 21:00 UTC Nov 5/6 and Nov 6 scheduled edition review take priority when due.

## 2026-11-05: iteration 882 — edition list modes and recorded runs

- Started clean on main; no leftover work. Alerts clear, health healthy, API/worker active. X rounds still due after 21:00 UTC.
- Editions now shows saved per-topic story/post modes and retained jobs matched by edition ID: scheduled/manual, attempts and final-attempt duration. Multiple jobs reusing one edition remain separate; absent historical evidence is explicitly not recorded.
- Added compact mode summaries to admin history from immutable snapshots; reader history still strips admin metadata. No schema migration, source, budget or access changes; no paid calls or saved-data writes. Edition cost and incoming-window articles remain open.
- Isolated repository coverage pins mode extraction, unknown post modes, profile isolation and stable paging. Initial integration run caught an outdated reader-history expected projection; corrected it to exclude admin modes, then reran the full check successfully.
- Verification: pnpm format; pnpm lint:fix; pnpm check (505 unit/218 isolated integration passed); pnpm build; git diff --check; handbook operations (18 pages/two unchanged diagrams/28 assigned tables).
- Browser: smoke-admin-editions passed four viewport/theme combinations with live saved modes and retained run details, paging, topic tabs, reload, anonymous denial, no overflow/writes/external calls/browser credentials. Four affected list captures kept; desktop light/mobile dark inspected; unrelated regenerated capture churn discarded.
- smoke-admin-gate and smoke-admin-separation passed; reader makes no admin reads and saved edition unchanged. Live reads: 36 sources/zero current source errors, zero retained digest failures; latest edition remains four topics/17 stories/14 posts.
- Updated Operations and TASKS; SOURCES and NEEDS_FROM_HUMAN unchanged. API/worker restarted for verified build; API, worker, docs and schema active, final health green and alerts clear.
- Next: edition cost/incoming-window list, then Topics and remaining Sources/Spend controls. X fresh-window rounds after 21:00 UTC Nov 5/6; Nov 6 scheduled edition review takes priority when due.

## 2026-11-05: iteration 883 — incoming articles in the edition inspector

- Started clean on main; no leftover work. Alerts clear, /healthz healthy, API/worker active; X fresh-window rounds remain due after 21:00 UTC.
- Owner-visible value: each edition topic now has a browsable incoming-articles list for its coverage window, with source and publication time, instead of only the selected stories.
- Added protected, validated coverage-window reads through the ingestion repository port: inclusive start/exclusive end, deduped observations, newest-first stable ordering, up to 500 per topic. Disabled topics remain inspectable. Default latest-content behavior stays unchanged.
- UI explicitly identifies current retained content/current source connections rather than immutable candidate evidence. Latest window returns Tech/NBA/Gaming/World 282/166/321/242 articles; saved edition remains four topics/17 stories/14 posts.
- Repository characterization covers offset timestamps, window boundaries, more than five results, shared-source dedupe, empty windows and disabled topics. Initial typecheck caught Date arguments against string timestamps; corrected to ISO strings before final check.
- Browser: smoke-admin-editions passed desktop/mobile light/dark, all topic article lists against live reads, window bounds, invalid query 400s, anonymous 404, tabs/reload/paging and no overflow/writes/external calls/browser credentials. Four inspector captures refreshed; desktop light/mobile dark visually inspected.
- smoke-admin-gate and smoke-admin-separation passed; reader makes no admin reads and saved edition unchanged. Unrelated regenerated captures discarded. Handbook Operations updated; checker passed 18 pages/two unchanged diagrams/28 tables.
- No paid calls, source changes or saved-data writes; SOURCES and NEEDS_FROM_HUMAN unchanged. Archived iterations 872–873; updated TASKS.
- Verification: pnpm format; pnpm lint:fix; pnpm check (typecheck/lint/format/boundaries and 505 unit passed; integration interrupted exit 143 without assertion failure); standalone pnpm test:integration (218 passed); pnpm build; git diff --check; handbook operations; browser/access checks above. API/worker restarted for built app; final health/alerts checked before push.
- Next: edition cost, Topics and remaining Sources/Spend controls. X rounds after 21:00 UTC Nov 5/6 and Nov 6 scheduled-edition review take priority when due.
