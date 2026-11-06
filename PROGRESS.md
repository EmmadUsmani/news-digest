## 2026-11-05: iteration 893 — Overview monitoring alerts

- Started clean on main; no leftover work. Owner would care: Overview now shows firing and pending monitoring alerts beside health and spending.
- Added protected `/api/admin/status/alerts` read through a monitoring port/adapter, validated local vmalert response and three-second timeout. No labels or raw provider errors exposed; failure returns 503.
- Overview refreshes the counts every minute and with shared refresh; failed reads display Unavailable rather than stale zero. Source issues remain in the source-health card.
- Browser checks compare actual counts, simulate firing/pending and outage/recovery, verify anonymous endpoint denial and all four viewport/theme combinations. Four screenshots refreshed; mobile light and desktop dark visually inspected. Reader/admin separation passed; unrelated generated screenshots discarded.
- Initial lint caught missing void markers on the two new node:test calls; corrected. Targeted monitoring tests passed (2); full verification results below.
- Updated TASKS and Operations handbook; SOURCES/NEEDS_FROM_HUMAN unchanged. No collection, paid calls, schema, budgets or live settings changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed (507 unit/218 isolated integration tests, typecheck/lint/format/boundaries); pnpm build; smoke-admin-overview.ts; smoke-admin-separation.ts; check-handbook.ts 08-operations; git diff --check. Archived iterations 882–883 to keep PROGRESS small.
- API restarted for built assets; API/worker/docs/schema active, /healthz database/Redis green and alerts clear. Real saved Nov 5 edition and incoming collection remain available.
- Next: remaining dedicated admin pages and final reader; Nov 6 scheduled edition/grouping review, then fresh-window X round after 21:00 UTC. No X activation before decision.

## 2026-11-05: iteration 894 — Spend recent calls

- Started clean on main; no leftover work. Owner would care: Spend now shows the individual AI/X calls behind the budget totals.
- Added bounded newest-first ledger reads (20 per provider) to protected status, exposing model, purpose, start, status, known cost, unresolved hold and input/output tokens. Failed/completed holds display zero; unknown costs/tokens remain unknown. No schema, budget or collection changes.
- Added scrollable recent AI/X tables; four viewport/theme screenshots refreshed. Initial mobile review caught overly tall wrapped tables; bounded their height and gave columns enough width. Final mobile light and desktop dark visually inspected.
- Browser checks compare all displayed rows/costs/holds against saved live records (20 AI/13 X), anonymous denial, reload, navigation, refresh outage/recovery and no overflow/writes/browser credentials. Reader separation renders the real saved edition with no admin reads.
- Initial check stopped on import-format ordering; corrected. Integration then caught an old exact-response expectation and a new X fixture using an invalid purpose; corrected both. Separation initially ran across an asset rebuild and got 404; passed after API restart. Discarded unrelated generated separation screenshots.
- Updated TASKS and Operations handbook; removed an obsolete testing note to keep the page within 100 lines. SOURCES/NEEDS_FROM_HUMAN unchanged; no paid calls or live settings changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries and 507 unit tests; corrected integration failures then pnpm test:integration passed all 219. pnpm build and final @digest/web build; smoke-admin-spend.ts; smoke-admin-separation.ts; check-handbook.ts 08-operations; git diff --check passed.
- API restarted for final assets; all four app services active, /healthz database/Redis green and alerts clear. Fresh source results at 21:51–22:05 UTC and the saved Nov 5 edition verified.
- Next: remaining dedicated admin-page gaps and final reader; Nov 6 scheduled edition/grouping review and fresh-window X round after 21:00 UTC. No X activation before decision.

## 2026-11-05: iteration 895 — Sources recent article counts

- Started clean on main; no leftover work. Owner would care: Sources now shows which feeds contribute recent articles with 24-hour and seven-day counts.
- Added publication-window aggregates to protected source status using the same cutoff as checkedAt; start inclusive/end exclusive, future publications excluded, empty sources zero. Shared topic connections do not multiply articles; each collecting source gets its own count. No migration or collection changes.
- Added both columns and plain count guidance to Sources; refreshed four viewport/theme screenshots. Desktop dark/mobile light visually inspected; mobile table scrolls within its card. Image crop helper lacked Pillow; inspected original screenshots directly.
- Extended isolated repository checks for exact daily/weekly boundaries, future dates, empty sources and multiple topic connections; browser compares every source count with real saved status reads. No writes or paid calls.
- Updated TASKS and Operations handbook; SOURCES/NEEDS_FROM_HUMAN unchanged. Discarded unrelated separation-smoke screenshots.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed (507 unit/219 isolated integration tests, typecheck/lint/format/boundaries); pnpm build; smoke-admin-sources.ts; smoke-admin-separation.ts; check-handbook.ts 08-operations; git diff --check passed.
- All four services restarted and active; /healthz database/Redis green, 36 source checks healthy and alerts clear. Live status has new counts (Aftermath 3/20, Al Jazeera 94/379); saved reader edition returns 200 with four topics.
- Next: remaining dedicated admin-page gaps (source controls, topic discovery settings), then final reader; Nov 6 scheduled edition/grouping review and X round after 21:00 UTC. No X activation before decision.

## 2026-11-05: iteration 896 — Sources Add feed dialog

- Started clean on main; no leftover work. Owner would care: add a feed directly from Sources and choose its topic without visiting the topic editor.
- Added the specified dialog using the existing protected feed endpoint and shared validation; refreshes topic connections, collection status and source catalog after success. No schema, collector, budget or live settings changes.
- Browser verification reads saved live status but intercepts every feed write; example feed is replay data, never collected. Four dialog screenshots added and Sources screenshots refreshed.
- Initial browser run found an ambiguous topic-select label; added an explicit accessible name and rebuilt. Desktop light/mobile dark dialog images visually reviewed.
- Updated TASKS and Operations handbook; SOURCES/NEEDS_FROM_HUMAN unchanged. No paid calls.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed (507 unit/219 isolated integration tests, typecheck/lint/format/boundaries); pnpm build and final web build; smoke-admin-sources.ts; smoke-admin-separation.ts; check-handbook.ts 08-operations; git diff --check. Archived iterations 884–885 to keep PROGRESS small.
- API/worker/docs/schema restarted; /healthz database/Redis green, 36 sources healthy with recent collection and saved reader HTTP 200; alerts clear.
- Next: remaining admin controls and final reader; Nov 6 scheduled edition/grouping review and fresh-window X round after 21:00 UTC. No X activation before decision.

## 2026-11-05: iteration 897 — Sources collection switches

- Started clean on main; no leftover work. Owner would care: pause or resume a feed directly from Sources without losing its topic connections or saved articles.
- Added protected, strictly validated source enable writes and a default-true column through generated Drizzle migration 0004. Ingestion and active-source status honor the setting across topics; already-running collection may finish. Existing feeds stay enabled.
- Isolated repository/HTTP checks cover pause/resume, preserved connections/counts, missing sources, invalid bodies and anonymous denial. Browser checks intercept all writes and verify both states, reload and failed saves; no live setting changes or paid calls.
- Initial browser count comparison raced incoming collection; replayed one saved live snapshot consistently. Refreshed eight Sources/dialog screenshots; desktop light/mobile dark visually reviewed. Discarded unrelated separation screenshots.
- Pre-migration private database backup succeeded; migration applied. Updated TASKS and Operations handbook; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries and 507 unit tests, then ended with signal 143 during integration without an assertion failure. Standalone pnpm test:integration passed all 220, including schema parity. pnpm build; smoke-admin-sources.ts; smoke-admin-separation.ts; check-handbook.ts 08-operations; git diff --check passed.
- All four services restarted and active; /healthz database/Redis green, 36/36 feeds enabled/active with collection through 22:48 UTC; saved reader endpoint 200 and alerts clear.
- Next: remaining topic discovery settings and final reader; Nov 6 scheduled edition/grouping review and fresh-window X round after 21:00 UTC. No X activation before decision.

## 2026-11-05: iteration 898 — Dedicated Bluesky topic query

- Started clean on main; no leftover work. Owner would care: change a topic's Bluesky discovery phrase without changing its news queries.
- Added a 500-character query to the topic editor, protected settings contract and topic storage through generated migration 0005. Hourly discovery prefers it; blank preserves the existing news-query/include-phrase/topic-name fallback. Existing topics remain blank.
- Offline unit coverage checks dedicated-query precedence and blank fallback; isolated HTTP coverage checks default, trim/save and overlength rejection. Browser writes intercepted; save/reload and four viewport/theme screenshots passed. Desktop light/mobile dark visually inspected; discarded unrelated separation/delete screenshots.
- Private database backup succeeded before migration; migration applied and four services restarted. Updated TASKS, SOURCES, social/operations handbook and schema note; NEEDS_FROM_HUMAN unchanged. Archived iterations 886–887 to keep PROGRESS small. No paid calls or live topic setting changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries and 508 unit tests; initial integration 219/220 exposed new-column order mismatch, corrected schema order; pnpm test:integration rerun passed all 220 including parity; pnpm build; smoke-admin-topic-editor.ts; smoke-admin-separation.ts; check-handbook.ts 05-social-posts and 08-operations; git diff --check.
- /healthz database/Redis green; saved reader endpoint 200; 36 sources collecting with recent successes. Existing observability shipper memory warning became firing; service active at about 76 MiB of 80 MiB ceiling, no app failure.
- Next: X threshold/exclusion admin controls, then final reader; Nov 6 edition/grouping review and X fresh-window round after 21:00 UTC. No X activation before decision.

## 2026-11-05: iteration 899 — X discovery topic controls

- Started clean on main; no leftover work. Owner would care: edit X discovery minimum likes and exclusions directly in the topic editor.
- Added protected settings read/write through the existing topic endpoint, with atomic topic/settings updates and strict integer/operator validation. Uses the existing settings table; omitted/null settings preserve configuration, and historical reaction thresholds stay intact. No migration or live settings changes.
- Isolated HTTP coverage verifies unset defaults, save/read, invalid likes/operators and preservation during other edits. Browser writes intercepted; invalid exclusions block writes, save/reload and four theme/viewport screenshots passed. Desktop light/mobile dark visually reviewed; discarded unrelated delete/separation screenshots.
- Review caught nullable settings breaking topic-list updates for new topics; allowed null as preserve and verified the contract directly, then rebuilt. No paid calls or X activation.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries, 508 unit and 220 isolated integration tests; pnpm build (including final nullable change); direct unset-settings contract check; smoke-admin-topic-editor.ts; smoke-admin-separation.ts; check-handbook.ts 05-social-posts and 08-operations; git diff --check.
- Updated TASKS, SOURCES and affected handbook pages; NEEDS_FROM_HUMAN unchanged. Four services restarted/active; /healthz database/Redis green, reader 200, 36 active sources/zero errors with successes through 23:10 UTC. Existing observability shipper memory warning remains; service active.
- Next: final reader per approved spec; Nov 6 scheduled edition/grouping review and fresh-window X round after 21:00 UTC. No X activation before decision.

## 2026-11-05: iteration 900 — Reader archive

- Started clean on main; no leftover work. Owner would care: browse past editions in a clean date/topic list and open their saved reader pages.
- Built `/editions` with 20-entry pages, URL-backed page navigation, empty/error/retry states and light/dark mobile/desktop layouts. Added Past editions link from the current reader; final edition layout remains next.
- Reader history now includes only saved topic IDs/names alongside dates, without editorial modes or methods; no extra per-edition reads. Unit coverage verifies this boundary and rejects invalid offsets.
- Browser checks use real saved history for screenshots/links and replay it for paging/failure cases; no writes, paid calls, settings changes or X activation. Four archive screenshots saved; desktop light/mobile dark visually reviewed. Discarded unrelated separation screenshots.
- Browser script initially used unsupported top-level await, then expected an empty real third page; corrected its wrapper and retry assertion. Product browser checks passed. Integration HTTP expectation still omitted topic names; updated it and reran.
- Updated TASKS and Stack/runtime and Operations handbook; archived iterations 888–889 to keep PROGRESS small. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries and 509 unit tests; first integration 219/220 exposed the stale history expectation; pnpm test:integration rerun passed all 220; pnpm build; smoke-reader-archive.ts; smoke-admin-separation.ts; check-handbook.ts 01-stack-and-runtime and 08-operations; git diff --check.
- Four app services restarted; /healthz database/Redis green; 36 sources/zero errors with collection through 23:16 UTC; Nov 5 scheduled edition complete and Nov 6 15:00 UTC next run retained. Existing observability shipper memory warning remains.
- Push initially rejected because owner commit 390687a added STEERING 39 and revised X plan; fetched/merged without rewriting history. Docs-only merge needs no rebuild. Item 39 now precedes UI; updated TASKS. Subsequent push twice rejected by integration with `fatal error in commit_refs_rules`; local commits retained, publishing blocked.
- Next: X reliability/accounting under STEERING 39, three Nov 5 failed keyword reruns after Nov 6 00:00 UTC; then fresh Nov 6 round/edition review. Edition reader layout follows. No X activation before decision.

## 2026-11-05: iteration 901 — X token-only accounting and timeout

- Started clean on main; no leftover work. Owner would care: failed X tool execution no longer leaves a full hold when valid token usage is available, and searches get 120 seconds.
- Shared validated usage parser between app adapter and experiment runner; absent post/profile counters default to zero, malformed counters still fail closed. Existing no-response holds remain charged. No paid calls or X activation.
- Synthetic runner coverage settles eight token-only calls at four micros each; adapter coverage checks absent/partial counters and malformed values. Initial direct mixed-suite invocation hit five expected isolation guards; used the proper full isolated harness afterward.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries, 510 unit and 221 isolated integration tests; pnpm build; check-handbook.ts 05-social-posts; git diff --check.
- Four app services rebuilt/restarted and active; /healthz database/Redis green after startup retry; saved Nov 5 reader endpoint readable; 36 sources/zero errors, latest success 23:30 UTC. Existing observability memory warning remains.
- Updated TASKS, SOURCES and social handbook; NEEDS_FROM_HUMAN unchanged. GitHub integration recovered: preflight push published the previous iteration's backlog successfully.
- Next: STEERING 39 supported forced tool execution and one separately admitted retry; append-only NBA/World saved-usage settlement; three failed keyword reruns after Nov 6 00:00 UTC. Production remains off; failure-rate acknowledgement needs real rerun evidence.

## 2026-11-05: iteration 902 — Require X search tool execution

- Started clean on main; no leftover work. Shared request builder now sets documented Responses `tool_choice: required`, with X search as the only tool. Existing windows, limits, caps and production-off state retained.
- Checked xAI public OpenAPI ModelRequest/ModelToolChoice; required means the model must call a tool. No paid calls; real execution/failure-rate evidence remains pending, so no STEERING 39 failure-rate acknowledgement yet.
- Offline coverage verifies revised prepared keyword/semantic bodies, all comparison styles and curated app requests require the sole X tool.
- Verification: targeted request suites 11/11; pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 05-social-posts; git diff --check. Full check passed typecheck/lint/format/boundaries, 511 unit tests and 221 isolated integration tests.
- Rebuilt/restarted API, worker, docs and schema services; all active. /healthz database/Redis green; saved reader edition readable; 36 active sources/zero errors with successes through 23:35 UTC. Existing observability memory warning remains.
- Updated TASKS, SOURCES and social handbook; NEEDS_FROM_HUMAN unchanged.
- Next: separately admitted one retry for no-execution/no-post failures; append-only saved NBA/World usage settlement; then authorized Nov 5 keyword reruns after Nov 6 00:00 UTC. Fixed production search remains off.

## 2026-11-05: iteration 903 — settle saved X experiment usage

- Started clean on main; no leftover work. Owner would care: NBA/World failed-response holds now reflect saved token usage, freeing $0.283288 for the authorized comparison.
- Added offline saved-response reconciliation and hash-linked journal settlements; original reservation entries and response files preserved. Repeated/undispatched settlement rejected; daily/lifetime admission and overrun guards use appended costs across restart.
- Reconciled NBA $0.010383 and World $0.006329 using existing runner rates; saved pre-settlement private journal and verified entries unchanged. Nov 5 charged $0.445318, lifetime $0.977649, remaining $1.522351. Gaming timeout holds retained. No paid calls or activation.
- Verification: targeted budget/CLI suite 9/9; pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 05-social-posts; git diff --check. First full check caught the newly archived page before formatting completed; formatted it and reran. Rerun passed typecheck/lint/format/boundaries, 514 unit tests and 221 isolated integration tests.
- Four app services rebuilt/restarted and active; initial startup health fetch failed, repeat database/Redis health green; real saved Nov 5 edition has four topics. All 36 sources healthy, latest success 23:41 UTC; Nov 6 15:00 schedule retained; alerts clear.
- An unsupported combined obs jobs --check/state invocation failed; corrected to the read-only jobs query. No failed digest runs; historical ingestion/social failures remain alongside healthy sources.
- Updated TASKS, SOURCES, saved experiment review and social handbook; archived iteration 890 to keep PROGRESS small. NEEDS_FROM_HUMAN unchanged.
- Next: one separately admitted retry in experiment and switched-off schedule; then three Nov 5 failed keyword reruns after Nov 6 00:00 UTC. Fair semantic query and fresh Nov 6 comparison follow; no production activation.
- Push first rejected for incoming lead-workflow commits; fetched/merged without rewriting history. Owner lead files left untouched; no app runtime changes. Post-merge formatting/lint and handbook check run before repush.

## 2026-11-05: iteration 904 — separately admit an experiment timeout retry

- Started clean on main; no leftover work. Alerts clear; all 36 sources healthy and no failed digest runs.
- Revised experiment runner retries a transport TimeoutError once with its own -retry-1 request/evidence and fresh $0.15 admission. Original hold stays charged; second timeout stops. Continuation skips attempted cells, preventing a third attempt.
- Offline tests cover successful retry settlement, double-timeout holds/restart, and daily-cap refusal before retry dispatch. Other transport errors still stop without retry; no paid calls or activation.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries, 517 unit and 221 isolated integration tests; pnpm build; check-handbook.ts 05-social-posts; git diff --check.
- Rebuilt/restarted API, worker, docs and schema services; health database/Redis green. Real saved reader edition returns four topics/17 stories; 36 sources healthy, success through 23:50 UTC; next edition Nov 6 15:00 UTC.
- Updated TASKS, SOURCES, experiment notes and social handbook; archived iteration 891 to keep PROGRESS small. NEEDS_FROM_HUMAN unchanged.
- Next: tool-failure/no-execution retry and switched-off scheduler retry, then authorized three failed Nov 5 keyword reruns after Nov 6 00:00 UTC. Fair semantic query and fresh Nov 6 round follow. Fixed production search remains off.
- First push rejected for incoming owner workflow commits; fetched/merged without rewriting history. New Current order keeps X reliability first. Owner files unchanged by this iteration; post-merge formatting/lint/handbook verification before repush.

## 2026-11-06: iteration 905 — retry unexecuted experiment searches once

- Started clean on main; no leftover work. Alerts clear, 36 sources healthy and no failed digest runs.
- Experiment now retries zero-fetched failed/unconfirmed execution once after settling actual returned usage and admitting a fresh $0.15 reservation. Completed empty searches never retry; no-response timeouts retain their holds. Restart skips attempted cells.
- Offline coverage includes failed-tool recovery, completed empty results, token-only double failure and continuation without a third attempt. No paid calls, keyword reruns or production activation.
- Verification: targeted runner 12/12; pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries, 519 unit tests and 221 isolated integration tests; pnpm build; check-handbook.ts 05-social-posts; git diff --check.
- Rebuilt/restarted API, worker, docs and schema; all active. /healthz database/Redis green; real saved edition has four topics/17 stories; all 36 sources healthy through Nov 6 00:00 UTC; next edition 15:00 UTC; alerts clear.
- Initial obs jobs query used an unknown queue; corrected read-only query shows no failed digest runs, historical ingestion/social failures alongside healthy sources.
- Updated TASKS, SOURCES and social handbook; archived iteration 892 to keep PROGRESS small. NEEDS_FROM_HUMAN unchanged.
- Next: switched-off scheduler retry, then authorized three failed Nov 5 keyword reruns on the same window. Fair semantic query and fresh Nov 6 round follow; fixed production search remains off.
- First push rejected for incoming owner instructions; fetched/merged without rewriting history. X reliability stays first; new item 40 queues Bluesky edition outcomes/recovery/slot gating ahead of UI. Owner files left untouched; post-merge format/lint/handbook checks before repush.
