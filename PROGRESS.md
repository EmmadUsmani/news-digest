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

## 2026-11-05: iteration 884 — edition inspector AI cost

- Started clean on main; no leftover work. Alerts clear, health healthy, API/worker active; X rounds still due after 21:00 UTC.
- Owner-visible value: the edition inspector now shows recorded AI cost and unresolved holds by model/purpose, making the cost of a saved edition directly inspectable.
- Added a protected, UUID-validated cost endpoint through the repository port and existing run-ID ledger reader; checks edition/profile existence. No calls recorded is explicit, not an inferred free run. Retries stay attributed by run ID; overlapping jobs are excluded.
- Latest real edition: $0.315445, 46 calls/eight model-purpose groups, zero unresolved holds; four topics/17 stories/14 posts unchanged. 36 sources/zero current errors; no retained queue failures. No paid calls, source changes or saved-data writes.
- HTTP integration coverage checks empty-ledger editions, invalid/missing IDs and anonymous denial; existing isolated ledger coverage pins cross-day identity, overlapping-run exclusion and unresolved/failed holds.
- Initial browser launch raced API startup; reran after healthy response. Browser then caught mobile table overflow; fixed grid card minimum sizing, rebuilt and reran. Updated Operations and TASKS; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Full check passed typecheck/lint/format/boundaries and 505 unit tests; first integration pass was 217/218 because anonymous denial was asserted in an app without its guard. Moved the assertion into the existing guarded HTTP test; reran isolated integration. Live gate was already passing.
- Final verification: pnpm test:integration 218/218 passed; pnpm build and final web build passed; pnpm format, pnpm lint:fix, git diff --check; handbook Operations checker 18 pages/two unchanged diagrams/28 tables. Browser smoke-admin-editions, smoke-admin-gate and smoke-admin-separation passed desktop/mobile light/dark, anonymous denial, no overflow/writes/external calls/browser credentials; four inspector captures updated and desktop light/mobile dark inspected.
- Archived iterations 874–875. API/worker restarted for built app; health/alerts green. Next: Topics admin pages; list/Overview edition cost and remaining Sources/Spend controls remain. X fresh-window rounds due after 21:00 UTC Nov 5/6; Nov 6 scheduled edition review takes priority when due.

## 2026-11-05: iteration 885 — first revised X search round

- Started clean on main; no leftover work. Owner would care: this tests whether paid X discovery finds viral posts beyond the free links, before changing the real feed.
- Dispatched all eight revised Grok 4.3 keyword/semantic cells after 21:00 UTC on Nov 4–5 21:00 UTC, using configured direct xAI and unchanged reservation/caps. Continuations attempted only untouched cells; no retries.
- Five settlements: $0.278606, 41 fetched/cited unique posts, all 41 official embeds verified. NBA keyword tool failed without usage; Gaming timed out; World supplied no execution/usage. Three $0.15 holds retained; today charged $0.728606, overall $1.260937.
- Tech keyword: 10 results despite requested 16; Top/OR/exact UTC/threshold/exclusions matched, reported median/max likes 1,580/7,441, all ten in window. Semantic: 31 citations, 16 ID-dated inside window, all likes unknown. World separately: seven semantic/four in window; unresolved keyword. No usable-yield claim/winner/activation.
- Saved private raw evidence, manifest, extracted evidence/reports, official embeds and read-only old-search/free-link snapshot (four production calls/$0.143191/19 citations, 1,000 free-link rows). No experiment ingestion, edition writes or Anthropic calls.
- Fixed a real extraction failure: revised requests inject mandatory -giveaway but saved settings omit it. Reconstruct effective exclusions for revised styles; preserve historical behavior. Regression covers empty/nonempty saved exclusions and settlement mismatch. Initial targeted failure was the old missing-exclusion rejection assertion; corrected for the now-valid input, then all five tests passed.
- Updated TASKS, SOURCES, experiment reference and dated review; NEEDS_FROM_HUMAN/handbook unchanged (no source/runtime/access change).
- Verification: pnpm format; pnpm lint:fix; targeted extractor 5/5; saved-evidence assertions (eight unique attempts/five settlements/three holds/41 verified/private permissions/unknown usable yield); pnpm build; git diff --check. Full pnpm check passed typecheck/lint/format/boundaries, 505 unit and 218 isolated integration tests.
- Live health/database/Redis green, four services active, 36 sources/zero unhealthy, latest saved reader four topics, alerts clear. No restart under STEERING 22: only offline script/tests/docs changed.
- Next: score/review saved Nov 5 candidates and compare retained free links/old baseline; Nov 6 fresh round after 21:00 UTC. Nov 6 scheduled grouping/editor-v5 review takes priority; build Topics admin while X waits.

## 2026-11-05: iteration 886 — revised X free-link overlap review

- Started clean on main; no leftover work. Alerts clear, health/database/Redis healthy; API, worker, docs and schema services active.
- Reviewed all 41 saved official embeds and joined settled candidates against the complete retained free-link snapshot: 1,000 citation rows/863 unique IDs, zero matches. Old paid baseline 19 IDs/zero free matches; two semantic overlaps with it (Gaming outside window, World inside).
- Tech semantic and keyword share no IDs. Other topics have no settled keyword cell; keyword-missed usable yield remains unknown. Two explicit Tech keyword giveaways survived `-giveaway`; NBA semantic includes three betting guides. No new wording rules or threshold changes.
- Private reproducible runner, input hashes, joined evidence and existing reporter output saved (600); original files unchanged. Only free-link labels resolved; relevance/promotion/31 semantic likes remain unknown. No paid calls, ingestion, source changes or production activation.
- Archived iterations 876–877. Updated dated review, SOURCES and TASKS; NEEDS_FROM_HUMAN/handbook unchanged. No runtime changes or restart under STEERING 22.
- Verification: private overlap runner assertions passed; existing offline report accepted all five settled cells and retained unknown usable yields; pnpm format; pnpm lint:fix; pnpm build; git diff --check. pnpm check passed typecheck/lint/format/boundaries, 505 unit and 218 isolated integration tests.
- Next: saved-candidate production social scoring under verification admission; Nov 6 fresh-window round after 21:00 UTC; scheduled editor-v5/grouping review takes priority when due. Topics UI while waiting.

## 2026-11-05: iteration 887 — revised X candidates scored

- Started clean on main; no leftover work. Owner would care: production social scores narrow paid X results toward worthwhile posts before the search decision.
- Health/database/Redis green, four services active, alerts clear. Scored all 41 saved official embeds with production CandidateTriage/socialTriageCandidate and configured Haiku, supplied author/reported likes/media-link hints; unknown media contents/likes stayed unknown.
- Four successful shared-admission verification calls cost $0.003782, run iteration-887-x-experiment; repairs disabled, zero unscored IDs. Saved private runner, exact candidate inputs/scores, ledger rows, joined evidence/report and hashes; originals preserved. No X calls, ingestion or edition writes.
- Tech keyword relevance ≥6: 2/10, both in-window and interestingness ≥4; explicit giveaways 1/0 each. Semantic relevance ≥6/in-window/both gates: Tech 6/4/1, NBA 5/2/1, Gaming 6/3/2, World 7/4/1.
- Promotion booleans remain unknown: production scorer has no separate promotion field, so no label inferred from rationale/score. All 31 semantic likes unknown; incomplete keyword cells prevent all-topic yield/winner. No activation, thresholds or runtime changes.
- Updated TASKS, SOURCES and dated review; NEEDS_FROM_HUMAN/handbook unchanged. No restart under STEERING 22 (private analysis/docs only).
- Verification: private assertions checked 41 scores, original fields unchanged, four settled verification rows/$0.003782 and mode 600; existing offline reporter accepted five scored cells.
- Full pnpm check passed typecheck/lint/format/boundaries, 505 unit and 218 isolated integration tests; pnpm build passed; pnpm format, pnpm lint:fix, git diff --check. Final health/alerts green.
- Next: promotion review and old-baseline comparison, Nov 6 fresh-window round after 21:00 UTC; scheduled editor-v5 review first when due. Dedicated Topics admin pages while waiting.
