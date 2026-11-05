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

## 2026-11-05: iteration 888 — dedicated Topics management

- Started clean on main; no leftover work. Owner would care: topic ordering, availability and budgets now have a dedicated admin page instead of requiring legacy controls.
- Added `/admin/topics` navigation, drag/arrow ordering, enable controls, editable story/post budgets and New topic dialog using shared shadcn-style form controls and Radix dialog. Existing APIs retain the same validation; full guidance/sources/deletion remain on Overview until the dedicated editor replaces them.
- Playwright reads real saved topics; all creation/toggle/budget/order writes are intercepted and checked against browser replay state. No live topic changes or external requests. Desktop/mobile light/dark screenshots include list and dialog; visual review fixed cramped mobile titles and unstyled inputs. Drag and arrow paths both verified.
- Reader/admin separation smoke passed: real saved edition, no reader admin reads, anonymous admin denied, reload/navigation intact. Updated its screenshots for Topics navigation.
- Archived iterations 878–879; updated TASKS and affected Operations handbook; no source/budget/schema changes, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm build; pnpm check reached 505 passing unit tests then integration process ended SIGTERM; reran pnpm test:integration (218 passing); pnpm exec tsx scripts/smoke-admin-topics.ts; scripts/smoke-admin-separation.ts; scripts/check-handbook.ts 08-operations; git diff --check.
- Initial check caught import ordering (autofixed); initial browser assertion used Tech instead of saved Tech & AI (corrected). Handbook length corrected; check overlapping API restart retried successfully.
- API restarted for built assets; health/database/Redis green and alerts clear. No paid calls, experiment changes or worker configuration changes.
- Next: dedicated `/admin/topics/:id` editor, replace legacy topic controls when complete; X promotion/baseline review and Nov 6 fresh-window round; scheduled editor-v5/grouping evidence first when due.

## 2026-11-05: iteration 889 — dedicated topic editor

- Started clean on main; no leftover work. Owner would care: opening a topic now gives guidance, sources and social settings their own admin page.
- Added `/admin/topics/:id`, linked from Topics: basics/guidance, enable and budgets, phrase filters, X handles/Reddit communities, source selection, feed/news-query connection and confirmed deletion. Uses existing validated APIs and shared form/dialog controls; saved editions remain preserved by existing deletion behavior.
- Discovery-specific X thresholds/exclusions and Bluesky query still need API-backed controls. Legacy topic controls remain until the editor replacement is complete; removal and migration of their historical browser scripts remain explicit work, not acceptance claimed here.
- Playwright reads real saved topics/catalog and intercepts every write; verifies settings payloads, saved reload, list/editor navigation, source toggle, feed/query forms, cancellation and deletion. No live topic edits, collection requests or paid calls. Eight editor/delete screenshots saved in desktop/mobile light/dark; visually reviewed desktop and mobile layouts.
- Initial build caught unsupported button variant; initial browser checks caught populated-textarea label matching and missing explicit submit types on shared Buttons. Fixed and reran successfully.
- Updated TASKS and affected Operations handbook; SOURCES/NEEDS_FROM_HUMAN unchanged (no source/runtime/budget/schema changes beyond serving the new UI).
- Verification: pnpm check passed typecheck/lint/format/boundaries, 505 unit and 218 isolated integration tests; pnpm build and final web rebuild passed. pnpm exec tsx scripts/smoke-admin-topic-editor.ts; scripts/smoke-admin-topics.ts; scripts/smoke-admin-separation.ts; scripts/check-handbook.ts 08-operations passed; pnpm format; pnpm lint:fix; git diff --check.
- API restarted for built assets; all four app units active, health/database/Redis green, alerts clear. Reader smoke used the real saved edition with no reader admin reads.
- Next: complete topic discovery settings and remove replaced legacy controls; X promotion/baseline review and Nov 6 fresh-window round after 21:00 UTC; scheduled editor-v5/grouping review when due.

## 2026-11-05: iteration 890 — remove replaced topic controls

- Started clean on main; no leftover work. Owner would care: topic and source management now has one editor, reached from Overview or Topics navigation.
- Deleted legacy TopicSettings/TopicSources and their Overview save/cache wiring; incoming articles and status remain pending their replacements. Overview links to the dedicated Topics page.
- Historical topic/source/feed/query/community smoke entry points now invoke the shared dedicated list/editor browser suites. Retired legacy-specific recovery/focus scenarios rather than rebuilding them on replaced screens; API/unit coverage remains. Adapted schedule default-budget and reviewed-account checks to new routes; X guidance accurately states scheduled search is off.
- Browser checks read real saved data and intercept writes; dedicated editor additionally compares live topics afterward. Schedule verifies saved profile/topic/edition immutability; account checks verify all four saved lists. No live edits, collection requests or paid calls.
- Saved desktop/mobile light/dark controls/editor screenshots and migrated account/X-guidance screenshots; visually inspected new Overview link in mobile light and desktop dark. Discarded unrelated generated screenshot changes.
- Initial reviewed-account check exposed its old localhost origin bypassing the credential helper; changed to the supported 127.0.0.1 origin and bridged catalog reads, then passed.
- Updated TASKS and Operations handbook; SOURCES/NEEDS_FROM_HUMAN unchanged (no collection, schema or budget changes). Discovery-specific API-backed settings remain open.
- Verification: pnpm format; pnpm lint:fix; pnpm build; pnpm check (505 unit and 218 isolated integration tests passed); smoke-topics.ts, smoke-topic-order.ts, smoke-admin-separation.ts, smoke-reviewed-x-accounts.ts, smoke-x-schedule-copy.ts, smoke-schedule.ts and check-handbook.ts 08-operations passed; git diff --check.
- API restarted for built assets; API/worker/docs/schema active, health/database/Redis green and alerts clear. Real incoming articles and saved Nov 5 edition rendered.
- Next: dedicated discovery settings and remaining spec admin pages; Nov 6 scheduled editor-v5/grouping review, then fresh-window X round after 21:00 UTC. No X activation before decision.

## 2026-11-05: iteration 891 — Sources topic connections

- Started clean on main; no leftover work. Owner would care: Sources now shows which topics use each source and links directly to their editors, making feed management reachable from collection health.
- Added connected-topic column, disabled-topic labels, explicit unconnected/loading/unavailable states, Manage topics & feeds entry, independent topic-read error and shared refresh. Corrected X platform copy: scheduled search is off pending experiment decision.
- Uses existing protected reads and editor routes; no API/schema/collection/budget changes. Discovery-specific settings need backend work; remaining Sources window counts/global enable/Add feed stay open.
- Browser checks compare every source row against saved topic connections and follow editor/feed-management links; exercise topic refresh failure/retry, anonymous denial, reload, mobile navigation and four viewport/theme combinations. All writes/external requests blocked. Four Sources screenshots saved; mobile light and desktop dark visually inspected.
- Initial navigation heading assertion timed out; destination-region assertion with failure diagnostics passed on rerun. Visual review caught legacy large anchor styling; set explicit small/medium link typography and rebuilt. Optional image crop unavailable (Pillow absent); viewed saved PNGs directly.
- Updated TASKS and Operations handbook; archived iterations 880–881 to keep PROGRESS small. Discarded unrelated separation-smoke screenshot changes. SOURCES/NEEDS_FROM_HUMAN unchanged; no paid calls or live edits.
- Verification: pnpm format; pnpm lint:fix; pnpm build; final web rebuild and targeted ESLint/Prettier; smoke-admin-sources.ts; smoke-admin-separation.ts; check-handbook.ts 08-operations passed. Full pnpm check passed: typecheck/lint/format/boundaries, 505 unit and 218 isolated integration tests.
- API restarted for final built assets; all four app units active, /healthz database/Redis green, alerts clear; reader regression rendered the real saved edition without reader admin reads.
- Next: remaining dedicated admin-page gaps and final reader; Nov 6 scheduled edition/grouping evidence and fresh-window X round after 21:00 UTC. No X activation before decision.

## 2026-11-05: iteration 892 — Overview edition cost

- Started clean on main; no leftover work. Owner would care: Overview now shows what the latest edition cost and links to its full inspector.
- Added protected edition-ledger read with recorded AI cost, call count and separate unresolved holds; explicit no-linked-calls state, independent retry and shared refresh. No API/schema/budget changes.
- Browser checks compare displayed values with the real saved edition ledger, verify the inspector URL, simulate cost-read outage/recovery and preserve edition access. Four viewport/theme screenshots refreshed; all writes/external requests blocked.
- Visual review caught inherited oversized anchor typography; set explicit small/medium link styling and rebuilt. Initial web-only build filter matched no project; corrected to @digest/web and build passed.
- Updated TASKS and Operations handbook; discarded unrelated separation-smoke screenshot changes. SOURCES/NEEDS_FROM_HUMAN unchanged; no paid calls or live settings changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check (typecheck/lint/format/boundaries, 505 unit and 218 isolated integration tests); pnpm build; final @digest/web build; smoke-admin-overview.ts; smoke-admin-separation.ts; check-handbook.ts 08-operations; git diff --check all passed.
- Real saved edition ledger: $0.315445/46 calls/zero unresolved holds. Final mobile light and desktop dark screenshots visually checked; API restarted for final assets, four app units active, /healthz database/Redis green and alerts clear.
- Next: remaining dedicated admin-page gaps and final reader; Nov 6 edition/grouping evidence and fresh-window X round after 21:00 UTC. No X activation before decision.

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
