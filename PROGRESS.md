## 2026-11-06: iteration 924 — linked reader source rows

- Started clean on main; no leftover work. Alerts/health green, 36/36 sources healthy and zero failed digest-generation jobs. Higher priorities await Nov 6 publication/21:00 UTC.
- Owner-visible value: readers can open each named outlet's own report and see distinct-outlet coverage without confusing article counts with outlet counts.
- Added compact linked source rows with direct-origin, lazy favicons and no referrer; failed icons hide while text links remain. Deduplicated outlet names across saved coverage; show two names and expand additional reports inline.
- Grouped story.sources contains an outlet union: resolved each outlet's link/icon through its saved coverage report, preserving primary ordering. No changes to saved content, collection, selection, budgets or flags; no paid calls.
- Browser assertions cover saved names, per-outlet URLs/icon origins, 12 px labels, distinct-outlet counts, contents/mobile/deep links, no overflow/writes/admin reads. External assets blocked in layout checks; screenshots retain real saved text.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; final web build/typecheck/targeted ESLint; smoke-reader-layout.ts; smoke-reader-story-text.ts with latest saved edition; smoke-reader-archive.ts; smoke-admin-gate.ts; check-handbook.ts 08-operations; git diff --check.
- First full check was terminated (143) after 543 passing unit tests and 88 passing integration cases; clean rerun passed all 543 unit/224 isolated integration tests. Final browser checks and web build/typecheck/ESLint passed.
- Updated TASKS and Operations handbook; refreshed device/theme screenshots, visually reviewed desktop/mobile. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Rebuilt/restarted API/worker/docs/schema; all active, database/Redis healthy, reader HTTP 200, 36/36 sources healthy and alerts clear. Latest saved edition: four topics/17 stories/14 posts.
- Initial push rejected: owner added STEERING 42 remotely. Merged without rewriting history; next iteration reads the saved edition topic by topic and fixes its biggest content weakness before more reader polish. Nov 6 review/Bluesky gate after publication; X round after 21:00 UTC. Both experimental flags remain OFF.

## 2026-11-06: iteration 925 — restore saved context for reader posts

- Started clean on main; alerts/health green, 36/36 sources healthy, no failed digest jobs. Nov 6 edition and X round are not due yet.
- Read all four topics in the saved Nov 5 edition; review in docs/edition-reviews/2026-11-05-reader.md. Biggest gap is thin World coverage; its deployed pool fix awaits Nov 6 evidence.
- Fixed the actionable reader weakness: Japanese Gaming announcement and opaque posts had saved English context hidden by the reader API. Exposed only saved whyItMatters and rendered it above original posts/embeds on all platforms; no selection reasons exposed.
- Owner-visible value: all 14 saved posts now have their existing context, including an understandable English explanation of Monolith Soft's announcement. No new inference, selection, queries, flags or spend.
- Added browser comparison of public posts with saved protected posts and exact rendered context checks across devices/themes. Refreshed reader screenshots; updated affected handbook, TASKS and STEERING ack. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-layout.ts; smoke-reader-story-text.ts with saved edition; smoke-admin-gate.ts; smoke-reader-archive.ts; targeted reader-edition tests (4 passed); check-handbook.ts 08-operations; git diff --check. Full check passed 543 unit/224 isolated integration tests.
- Initial check caught a concurrent smoke-script formatting edit; formatted and reran. Initial browser check used the reader schema for protected data without brief; corrected to protected schema and parsed only allowed post fields.
- Rebuilt/restarted API/worker/docs/schema; all active, health/database/Redis green; 36/36 sources healthy, zero failed digest jobs, alerts clear. Browser, build, handbook and admin checks passed; full check initially terminated 143; rerun found an obsolete assertion treating context as private. Updated it to require saved public context while retaining private-field checks; final full check passed.
- Next: read Nov 6 edition, compare World breadth/composition/cost and apply Bluesky gate; fresh X round after 21:00 UTC. Reserved slot and fixed search remain OFF.

## 2026-11-06: iteration 926 — direct links on saved X cards

- Started clean on main; alerts clear and health/database/Redis green. Nov 6 edition and 21:00 UTC X round still pending; World breadth fix awaits that edition.
- Reader weakness: every saved X card repeated a footer link and reserved empty retry space. Saved text now opens its original post directly, including text retained beneath a successful embed; retries appear only after failure.
- Kept saved editorial context, original text, lazy official widgets and recovery behavior. No selection, source, prompt, budget or flag changes; no paid calls.
- Ported post replay's old story-heading selector and obsolete private-context assertion to the current reader. Public selection reasons remain excluded. First input attempt used public data without protected reasons; rebuilt replay input from the saved protected edition.
- Screenshot inspection caught inherited headline sizing on the new links; explicitly inherit body typography and assert 16 px in the browser. Updated operations handbook and TASKS; archived iterations 911–913 to keep this file small. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (twice); pnpm build; smoke-reader-layout.ts; smoke-posts.ts with protected saved-edition replay input; smoke-admin-gate.ts; smoke-reader-archive.ts; check-handbook.ts 08-operations; git diff --check.
- Both full-check runs reported all 543 unit and 224 integration cases passing, but the shell exited 143 after integration cases (first run also printed complete coverage). No clean full-command exit claimed; termination remains an operational verification limitation. Build and all listed browser/handbook/access checks exited zero.
- Refreshed post replay screenshots; inspected blocked mobile and successful dark desktop plus reader mobile. Widgets are stubbed in replay and screenshots label this; saved content is real, no edition published.
- API/worker/docs/schema rebuilt/restarted and active; reader HTTP 200, health/database/Redis green, alerts clear. Next: Nov 6 edition/World comparison and Bluesky gate after publication; X round after 21:00 UTC. Experimental flags remain OFF.

## 2026-11-06: iteration 927 — reproduce interrupted verification

- Started clean on main; prioritized the previous iteration's two exit-143 full checks under breakage triage. No leftover work to recover or discard.
- Standalone pnpm check exited zero: typecheck, lint, formatting, boundaries, 543 unit tests and 224 isolated integration tests passed; coverage report completed.
- Attached temporary strace signal tracing to the check's pnpm process and subsequent descendants; no SIGTERM observed. Previous interruptions did not reproduce; no root cause claimed and no speculative runner change. Trace/logs remain outside the repo.
- pnpm build passed; pnpm format and pnpm lint:fix completed before commit; git diff --check passed.
- Rebuilt/restarted API/worker/docs/schema; all active, /healthz database/Redis green, reader HTTP 200, 36/36 source states ok, alerts clear and zero retained failed digest jobs. Latest saved edition remains Nov 5 (four topics, 17 stories, 14 posts).
- TASKS records clean verification. No product, source, prompt, budget or flag changes; no paid calls. SOURCES, handbook and NEEDS_FROM_HUMAN unchanged.
- Reader's largest known weakness remains World breadth (two stories/one post); deployed forty-article pool awaits Nov 6 scheduled evidence. Nov 6 edition/Bluesky gate and X round after 21:00 UTC remain next; experimental flags OFF.

## 2026-11-06: iteration 928 — reader edition date switching

- Started clean on main; alerts clear, health/database/Redis green, all 36 sources healthy. Nov 6 edition/Bluesky review and the X round remain time-gated; no leftover work.
- Reader weakness: changing dates required leaving the edition for the archive. Header arrows now open adjacent saved editions, following archive pagination; the date remains an archive link. The owner can compare consecutive editions directly.
- Uses only public saved-edition history and cached reads; no source, selection, prompt, budget or flag changes and no paid calls. World breadth still awaits Nov 6 evidence.
- Browser verification used real saved editions: older/newer links, reload, first-page boundary, archive link, desktop/mobile and light/dark. Updated/inspected screenshots; layout and admin gate checks passed.
- Updated affected handbook and TASKS, added STEERING ack; archived iterations 914–915 to keep this file small. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-archive.ts; smoke-reader-layout.ts; smoke-admin-gate.ts; check-handbook.ts 08-operations; git diff --check.
- First full check exited 143 during integration after 543 unit passes. Retry caught formatting in the newly archived progress entries; corrected it. Final full check exited zero: 543 unit and 224 isolated integration tests passed, with coverage completed.
- Rebuilt/restarted API/worker/docs/schema; health green, alerts clear, all sources healthy and zero retained failed digest jobs. Next: Nov 6 World/composition/cost review and Bluesky gate after publication; X round after 21:00 UTC. Experimental flags stay OFF.

## 2026-11-06: iteration 929 — restore archive recovery verification

- Started clean on main; no leftover work. Worker scrape alert briefly pending after restart, metrics HTTP 200 and worker active; alert cleared without intervention. Health/database/Redis green.
- Reader weakness: the existing failed-history recovery check still targeted the deleted inline history, leaving archive failure recovery unverified. Ported it to archive routes and current controls; no product behavior or content changes.
- Browser replay uses real saved content with simulated pagination/failures: failed-page escape, retry to empty last page, return and edition opening across desktop/mobile light/dark. No writes; saved edition unchanged. Refreshed recovery screenshots.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-history-recovery.ts; git diff --check. Browser replay passed all four viewport/theme combinations; inspected mobile dark and desktop light screenshots. First full check exited 143 during integration after 543 unit passes; retry exited zero: 543 unit and 224 isolated integration tests passed, coverage completed; build passed.
- Rebuilt/restarted API/worker/docs/schema; all active, reader HTTP 200 and health/database/Redis green. All 36 sources healthy and zero retained failed digest jobs.
- Nov 6 World/Bluesky review and X round after 21:00 UTC remain time-gated; no paid calls or flag changes. SOURCES, handbook and NEEDS_FROM_HUMAN unchanged.

## 2026-11-06: iteration 930 — fit X embeds to reader cards

- Started clean on main; no leftover work. Health/database/Redis green, alerts clear and all sources healthy. Nov 6 review/Bluesky gate and X round remain time-gated.
- Reader weakness: saved X posts requested 550px widgets inside narrower two-column/mobile cards. Request the actual card width within X's 250–550px range and constrain loaded iframe width after resizing; readers can keep media within the post card.
- Added saved-post browser replay with a clearly labelled local widget stub; no third-party requests, paid calls or writes. Desktop/mobile light/dark sizing and 320px resize passed; saved edition unchanged. Refreshed/inspected screenshots. General reader layout replay passed all four combinations.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-post-sizing.ts; smoke-reader-layout.ts; git diff --check. Full check exited zero: 543 unit and 224 isolated integration tests passed, with coverage completed; build passed.
- Updated TASKS and STEERING ack; archived iterations 916–917 to keep PROGRESS small. No source, selection, budget, flag or system-flow changes; SOURCES, handbook and NEEDS_FROM_HUMAN unchanged.
- Rebuilt/restarted API/worker/docs/schema; health/database/Redis green, alerts clear, 36/36 source states ok and zero retained failed digest jobs. Next: Nov 6 World/cost/Bluesky review after publication, fresh X round after 21:00 UTC; fixed search and reserved Bluesky slot remain OFF.

## 2026-11-06: iteration 931 — keep the active mobile topic visible

- Started clean on main; no leftover work. Alerts clear and health/database/Redis green. Nov 6 edition/Bluesky review and X round remain time-gated.
- Read the latest saved edition: Tech/NBA/Gaming have five stories; World has two stories/one post, awaiting the deployed pool fix’s Nov 6 evidence. No further selection change before that evidence.
- Reader weakness reproduced: scrolling to World left its active mobile chip clipped outside the topic bar. The owner can now see the current topic while reading; scroll only the chip row, preserving vertical reading position.
- Saved-edition browser check failed before the fix and passed afterward at 390px/320px light/dark; covers forward/backward reading, visible Contents control and no horizontal page overflow. No writes, paid calls or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-topic-chips.ts; smoke-reader-layout.ts; git diff --check. Browser checks passed; refreshed/inspected light/dark screenshots. First full check exited 143 during integration after 543 unit passes; retry exited zero with 543 unit/224 isolated integration tests passing and coverage completed. Build passed.
- Rebuilt/restarted API/worker/docs/schema; all active, reader HTTP 200, health/database/Redis green, alerts clear, 36 sources healthy and zero retained failed jobs. TASKS and STEERING ack updated; no source/system-flow changes, so SOURCES, handbook and NEEDS_FROM_HUMAN unchanged. Next: Nov 6 World/cost/Bluesky review after publication; X round after 21:00 UTC.

## 2026-11-06: iteration 932 — preserve archive browsing after refresh failure

- Started clean on main; no leftover work. Alerts clear and health/database/Redis green. Nov 6 edition/Bluesky review and X round remain time-gated.
- Read saved topic headlines: World remains two stories/one post awaiting the deployed pool fix; known Tech grouping issue awaits editor-v5 evidence. No new selection change before publication.
- Reader weakness: the rebuilt archive called background refresh failure an initial loading failure and hid older-page navigation despite retaining saved links. Preserve pagination and explain that loaded links remain usable; the owner can continue browsing during a refresh outage.
- Ported obsolete inline-history refresh replay to the archive. Saved-content browser checks passed desktop/mobile light/dark: simulated 503, unchanged links, pagination, retry and opening a saved edition. No writes, browser errors or paid calls; screenshots updated/inspected.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-history-refresh.ts; smoke-reader-archive.ts; git diff --check. Build/browser checks passed. First full check exited 143 during integration after 543 unit passes; full retry and final service results recorded below.
- Archived iterations 918–919 to keep PROGRESS small; updated TASKS/STEERING ack. No source or system-flow change; SOURCES, handbook and NEEDS_FROM_HUMAN unchanged. Experimental flags stay OFF.
- Full retry exited zero: 543 unit/224 isolated integration tests passed, coverage completed. Rebuilt/restarted API/worker/docs/schema; all active, reader HTTP 200, health/database/Redis green and alerts clear. 36/36 sources healthy and zero retained failed jobs. Next: Nov 6 World/cost/Bluesky review after publication and X round after 21:00 UTC.

## 2026-11-06: iteration 933 — preserve X post text for screen readers

- Started clean on main; no leftover work. Alerts and health green, 36 sources healthy, zero retained failed digest jobs. Nov 6 edition review and X round remain time-gated.
- Read saved topic headlines/posts: World breadth and Tech grouping await Nov 6 evidence. Reader weakness: X links' aria-label replaced their actual saved post text in screen-reader link navigation. Use text plus visually hidden author/destination context before and after media loads.
- Extended saved-post browser replay to check accessible link names after expanding saved text. Desktop/mobile light/dark and 320px sizing passed with a labelled local widget stub; no writes or third-party calls. Refreshed screenshots are byte-identical; inspected mobile light and desktop dark.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx scripts/smoke-post-sizing.ts; git diff --check. Final full-check result below.
- Updated TASKS and STEERING ack. No source/system-flow changes; SOURCES, handbook and NEEDS_FROM_HUMAN unchanged. No paid calls or flag changes. Next: Nov 6 World/cost/Bluesky review after publication; X round after 21:00 UTC.
- Full check exited zero: 543 unit and 224 isolated integration tests passed, coverage completed. Build and browser replay passed. API/worker/docs/schema restarted; final health/alerts green and reader HTTP 200.

## 2026-11-06: iteration 934 — restore the saved reader layout check

- Started clean on main; no leftover work. Health/database/Redis green and alerts clear. Nov 6 edition review and X round remain time-gated.
- Read latest saved headlines/posts across four topics: World breadth and known Tech grouping await Nov 6 publication; no new selection or paid calls.
- Found a real verification breakage: smoke-reader-layout still expected generic X link labels removed in 933; reproduced its timeout. Match saved text plus author/destination context, retaining exact accessible-name verification.
- Owner value: the reader's saved text, sources, navigation and responsive layout can again be checked before future releases. Desktop/mobile light/dark replay passed; screenshots byte-identical. No product behavior change.
- Verification: pnpm exec tsx scripts/smoke-reader-layout.ts (failed before, passed after); pnpm format; pnpm lint:fix; pnpm check; pnpm build; git diff --check. Final results below.
- Archived oldest progress entry; updated TASKS. SOURCES, handbook, STEERING and NEEDS_FROM_HUMAN unchanged; no source/system-flow or priority change. Next: Nov 6 edition/Bluesky review after publication, X round after 21:00 UTC.
- Full check first exited 143 during unit tests with no reported failure; retry exited zero with 543 unit/224 isolated integration tests passing. Build passed. Restarted API/worker/docs/schema; final health/alerts and reader HTTP results checked before commit.

## 2026-11-06: iteration 935 — accurate saved reader refresh recovery

- Started clean on main; no leftover work. Alerts/health green. Read saved headlines, summaries and posts: World breadth and known Tech grouping await Nov 6 publication; X round waits until 21:00 UTC.
- Reader weakness: refresh failure claimed the edition could not load, and refresh 404 claimed it did not exist, while saved content remained visible. Distinguish cached refresh failure from initial failure and retain clear retry; readers can keep reading with an accurate explanation.
- Existing smoke-edition-refresh.ts and smoke-missing-edition.ts failed before the fix; both passed after, desktop/mobile light/dark, with browser-only 503/404 replay, no writes and unchanged real saved edition. Updated screenshots and inspected mobile light/desktop dark.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; both recovery browser scripts; git diff --check. Final suite/service results below.
- Archived iteration 920 to keep PROGRESS small; updated TASKS and STEERING ack. No source/system-flow changes; SOURCES, handbook and NEEDS_FROM_HUMAN unchanged. No paid calls or flag changes.
- Next: Nov 6 World/cost/Bluesky review after publication; fresh X round after 21:00 UTC.
- Full check passed: 543 unit/224 isolated integration tests, coverage complete. Initial check caught unformatted archived progress; formatted it and reran successfully. Build and both browser replays passed; 36/36 sources healthy, all queue workers available and zero retained failed runs. Final restart/health/alerts checked before handoff.

## 2026-11-06: iteration 936 — restore stalled-request reader recovery checks

- Started clean on main; no leftover work. Health/database/Redis green and alerts clear. Saved four-topic headlines/posts reviewed; thin World and known Tech grouping await Nov 6 publication. X round waits until 21:00 UTC.
- Found an existing verification breakage: smoke-reader-timeout still clicked the removed inline-history panel; reproduced its 20-second locator timeout. Ported history recovery to the archive and retained edition recovery.
- The browser replay stalls requests locally, verifies one attempt before manual retry, restores real saved links and opens the saved edition. No writes, paid calls, flags or selection changes. Updated timeout screenshots.
- Verification: pnpm exec tsx scripts/smoke-reader-timeout.ts (failed before, passed after repair on desktop/mobile light/dark; inspected desktop archive/mobile edition screenshots); pnpm format; pnpm lint:fix; pnpm check; pnpm build; git diff --check. Final results recorded below.
- Archived iteration 922 to keep this file small; updated TASKS. No product/system-flow change; SOURCES, handbook, STEERING and NEEDS_FROM_HUMAN unchanged.
- Next: Nov 6 World/cost/Bluesky review after publication, X round after 21:00 UTC; continue remaining obsolete reader smoke-script ports while waiting.
- Initial full check exited 143 during integration tests without a reported test failure; standalone full retry passed (543 unit/224 isolated integration tests, coverage complete). Build and browser replay passed.
- Restarted API/worker/docs/schema: all active, health/database/Redis green, reader HTTP 200, source/job checks passed and alerts clear.

## 2026-11-06: iteration 937 — restore selected-edition response isolation checks

- Started clean on main; no leftover work. Alerts clear and health/database/Redis green. Nov 6 edition/Bluesky evidence and 21:00 UTC X round still time-gated.
- Reviewed latest saved topics/posts: thin World and known Tech grouping await Nov 6 publication; no new content failure identified.
- Reproduced smoke-edition-selection failure: it still opened the deleted inline-history panel. Ported navigation to the archive and assertions to the reader date, headings and saved summaries.
- Owner value: verify that choosing an older edition stays stable when the pending latest-edition request later succeeds or fails. No product behavior change.
- Desktop/mobile light/dark replay passed against real saved editions with browser-only delayed success/503 responses; no writes. Block third-party requests; updated screenshots and inspected mobile light.
- Verification: pnpm exec tsx scripts/smoke-edition-selection.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build; git diff --check. Final results below.
- Updated TASKS; no source/system-flow change, paid calls or flags. Next: Nov 6 edition/Bluesky review after publication and X round after 21:00 UTC.
- Final full check passed (543 unit/224 isolated integration tests); build and eight browser cases passed. Restarted API/worker/docs/schema and checked final health/alerts before handoff.

## 2026-11-06: iteration 938 — full-width reader posts

- Started clean on main; health/database/Redis green and alerts clear. Nov 6 publication and 21:00 UTC X round remain time-gated.
- Read saved stories/posts across four topics: World breadth and Tech grouping await deployed fixes; desktop posts still used the legacy two-column grid.
- Owner-visible value: each post now fills one reader row, giving saved text and media the space required by the approved reader design.
- Replaced the legacy auto-fit grid with Tailwind single-column layout. Retained official X width cap and mobile containment; no selection, collection, spend or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-layout.ts; smoke-post-sizing.ts; git diff --check. Final results below.
- First browser run caught the old build during rebuild; rerun against completed build passed. Updated desktop widget-sizing screenshots and inspected desktop light/mobile dark; archived iteration 923 to keep this file small.
- Updated TASKS and STEERING ack. No source/system-flow change; SOURCES, handbook and NEEDS_FROM_HUMAN unchanged.
- Next: Nov 6 edition World/cost/Bluesky review after publication; X round after 21:00 UTC.
- Final check passed: 543 unit/224 isolated integration tests, build and both four-view browser replays. All 36 sources healthy; collection jobs completed, services active and health green. Final restart/alerts checked before handoff.
