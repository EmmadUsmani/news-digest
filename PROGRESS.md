## 2026-11-06: iteration 956 — navigate from topic briefs

- Started clean on main; alerts clear, health/database/Redis green, 36/36 sources healthy and latest scheduled digest completed. No leftover work.
- Read all four saved topics: World breadth and mixed Tech grouping await Nov 6 publication. Briefs repeat story headlines without a direct route to their reports.
- Owner value: matching brief headlines now jump to the saved story so readers can go straight from scanning a topic to reading its report. Unmatched editorial brief lines remain plain text.
- Extended saved-edition layout replay: keyboard activation, exact story hash/focus and sticky-header clearance for each matching brief, across desktop/mobile light/dark. External calls and writes blocked; no spend or flag changes.
- Screenshot review caught inherited headline sizing on brief links; restored normal brief typography and added a computed-size check.
- Updated TASKS, STEERING ack and operations handbook; archived iteration 940. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-layout.ts; check-handbook.ts 08-operations; git diff --check. Final results below.
- Initial pnpm check exited 143 during integration tests without a test failure; standalone rerun started for a conclusive result.
- Next: Nov 6 edition/Bluesky review after 15:00 UTC publication; fresh X round after 21:00 UTC. Fixed search and reserved slot remain off.
- Final: standalone pnpm check passed (543 unit/224 isolated integration tests); build, final lint/format, handbook and four-view browser replay passed. Inspected corrected mobile screenshot; saved edition remains four topics/17 stories/14 posts. API/worker/docs/schema restarted active, health green and alerts clear.

## 2026-11-06: iteration 957 — publication times on every story

- Started clean on main; alerts clear, health/database/Redis green, all 36 sources healthy, digest queue has no failed runs. No leftover work.
- Read all four saved topics; World breadth and mixed Tech grouping await Nov 6 publication. Standalone stories expose only edition-relative ages, unlike dated expanded reports.
- Owner value: every story now shows its saved publication date and local time so earlier reporting can be distinguished from updates without expanding coverage.
- Extended saved-edition browser replay to verify every primary timestamp against saved data in desktop/mobile light/dark; all writes and external calls blocked.
- Initial browser replay caught an existing brief-navigation timing race; wait for the target URL before checking the hash/focus.
- Updated TASKS, STEERING ack and operations handbook; archived iteration 941. SOURCES and NEEDS_FROM_HUMAN unchanged. No spend, collection or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-layout.ts; check-handbook.ts 08-operations; git diff --check. Final results below.
- Next: Nov 6 edition/Bluesky review after 15:00 UTC publication; fresh X round after 21:00 UTC. Fixed search and reserved slot remain off.
- Final: pnpm check passed (543 unit/224 isolated integration tests); build, handbook, four-view saved-edition browser replay and diff checks passed. Inspected mobile light screenshot. API/worker/docs/schema restarted active; health green and alerts clear.

## 2026-11-06: iteration 958 — restore reader theme verification

- Started clean on main; alerts clear and health/database/Redis green. No leftover work.
- Read the saved four-topic edition; World breadth and mixed Tech grouping await Nov 6 publication; no new editorial evidence or paid calls.
- Found the remaining theme smoke still waiting for the replaced reader’s period/UUID and list selectors; it could no longer verify reader content.
- Ported it to current story cards, added exact saved-post text checks, and blocked third-party requests. Readers’ theme choices and saved content are checked together.
- Desktop/mobile system changes, light/dark, reload persistence, cross-tab changes and blocked storage passed; replaced old foundation screenshots with current reader screenshots and inspected mobile dark.
- No product behavior, collection, budgets or flags changed; handbook, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx scripts/smoke-ui-theme.ts; git diff --check. Final results below.
- Next: Nov 6 edition/Bluesky review after 15:00 UTC; X round after 21:00 UTC. Fixed search and reserved slot remain off.
- Initial combined check exited 143 during unit tests without a failure; standalone pnpm check passed (543 unit/224 isolated integration tests). Build, four-view reader theme checks and diff check passed.
- API/worker/docs/schema restarted active; health/database/Redis green and alerts clear.

## 2026-11-06: iteration 959 — readable post publication times

- Started clean on main; alerts clear and health/database/Redis green. No leftover work.
- Read all four saved topics. World breadth and mixed Tech grouping await Nov 6 publication; headline-only HN summaries reflect absent API body text, with full-article fetching deferred.
- Reader weakness: post bylines use long numeric dates with seconds, unlike the concise story dates; this clutters mobile cards.
- Owner value: every post platform now uses the same readable publication date and local time as stories, retaining exact saved datetime values.
- Extended existing saved-edition browser replay to compare all post dates with saved data in desktop/mobile light/dark; external requests and writes blocked.
- Updated TASKS, STEERING ack and operations handbook; archived oldest progress entry. SOURCES and NEEDS_FROM_HUMAN unchanged. No spend, collection or flag changes.
- Verification commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-layout.ts; check-handbook.ts 08-operations; git diff --check.
- Next: Nov 6 edition/Bluesky review after 15:00 UTC; X round after 21:00 UTC. Fixed search and reserved slot remain off.
- Final: pnpm check passed (543 unit/224 isolated integration tests); build, final format/lint, handbook and four-view saved-edition browser replay passed. Inspected mobile light post screenshot. Sources healthy; no failed digest runs.

## 2026-11-06: iteration 960 — keep the small-screen reader header on one line

- Started clean on main; alerts clear, health/database/Redis green. No leftover work.
- Read saved Tech, NBA, Gaming and World content; World breadth and Tech grouping still await Nov 6 publication evidence.
- Reader weakness reproduced at 320px: the wordmark and date each wrapped into two lines, crowding the fixed-height header.
- Keep the wordmark on one line and use month/day on mobile; wider screens and the accessible date description retain the year.
- Owner value: the smallest supported reader view keeps its title, date arrows and theme control in a clean single row.
- Extended saved-edition layout replay with 320px header fit/single-line checks in light/dark; updated screenshots and affected handbook.
- Archived iteration 943; updated TASKS and STEERING ack. SOURCES and NEEDS_FROM_HUMAN unchanged; no spend, collection or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx scripts/smoke-reader-layout.ts; pnpm exec tsx scripts/check-handbook.ts 08-operations; git diff --check.
- Next: edition/Bluesky review after 15:00 UTC; fresh X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Initial full check passed 543 unit tests, then exited 143 during integration tests without a reported assertion failure; rerunning standalone before commit.
- Standalone pnpm check passed (543 unit/224 isolated integration tests); build, handbook, four-view browser replay plus 320px light/dark and final format/lint/diff checks passed. Inspected small-screen light screenshot.
- API/worker/docs/schema restarted active; health/database/Redis green and alerts clear. All 36 sources healthy; no failed digest-generation jobs.

## 2026-11-06: iteration 961 — distinguish digest commentary from original posts

- Started clean on main; alerts clear and health/database/Redis green. No leftover work.
- Read all four saved topics; World breadth/Tech grouping await Nov 6 publication; X round waits until 21:00 UTC.
- Reader weakness: saved editorial explanations below posts had no attribution label, making them easy to confuse with the original author’s words.
- Added “Digest context” above existing commentary for every platform; saved text, explanations and selection unchanged.
- Owner value: readers can distinguish the digest’s explanation from what the post author actually wrote.
- Extended saved-edition browser replay to verify labels and unchanged context in desktop/mobile light/dark; screenshots refreshed.
- Archived iteration 944; updated TASKS, STEERING ack and affected handbook. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-layout.ts; check-handbook.ts 08-operations; git diff --check.
- First full check stopped on formatting of the newly archived progress entry; formatting corrected before rerunning.
- Next: edition/Bluesky review after 15:00 UTC; fresh X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final pnpm check passed (543 unit/224 isolated integration tests); build, handbook, four-view layout/media recovery and diff checks passed. Inspected mobile light post screenshot.
- API/worker/docs/schema restarted active; health/database/Redis green, alerts clear, all 36 sources healthy and no failed digest jobs.

## 2026-11-06: iteration 962 — open X authors from saved post bylines

- Started clean on main; alerts clear and health/database/Redis green. No leftover work.
- Read all four saved topics; World breadth/Tech grouping await Nov 6 publication; X round waits until 21:00 UTC.
- Investigated Tech's article-like Oumi post: text is from the verified embed; no ingestion mismatch established.
- Reader weakness: X author names were plain text, preventing inspection of unfamiliar accounts without opening the post first.
- Link X author names to saved author URLs; preserve compact byline typography and original post text/context.
- Owner value: inspect who posted directly, even when external media cannot load.
- Extended saved-edition replay with author URL, new-tab/privacy, keyboard focus and font-size checks in four views; screenshots refreshed.
- Archived iteration 945; updated TASKS, STEERING ack and affected handbook. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend or flags changed.
- Verification: pnpm format; pnpm lint:fix; pnpm check (543 unit/224 isolated integration tests); pnpm build; smoke-reader-layout.ts; check-handbook.ts 08-operations; git diff --check. All passed.
- Initial browser run raced service startup (connection refused); rerun after green health passed four device/theme views. Inspected mobile light post screenshot; retained only post screenshots.
- API/worker/docs/schema restarted active; health/database/Redis green, alerts clear, all 36 sources healthy and no failed digest jobs.
- Next: edition/Bluesky review after 15:00 UTC; fresh X round after 21:00 UTC. Fixed search and reserved slot stay off.

## 2026-11-06: iteration 963 — show when X media is loading

- Started clean on main; alerts clear and health/database/Redis green. No leftover work.
- Read all four saved topics; World breadth/Tech grouping await Nov 6 publication; X round waits until 21:00 UTC.
- Reader weakness: lazy X media requests gave no pending indication, leaving readers unable to tell whether media was still arriving.
- Added a loading status only during active requests; clear it on success, failure or timeout. Saved text stays visible while loading and retrying.
- Extended saved-edition browser replay with held local widget responses, initial/retry loading checks and four-view screenshots; no external calls or writes.
- Updated TASKS, STEERING ack and affected handbook; archived iteration 946. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check (543 unit/224 isolated integration tests); pnpm build; smoke-reader-x-media.ts; check-handbook.ts 08-operations; git diff --check. All passed.
- Handbook check initially raced API startup; rerun after green health passed. Inspected mobile light loading screenshot; retained only new loading screenshots.
- API/worker/docs/schema restarted active; health/database/Redis green, all 36 sources healthy, no failed digest jobs and alerts clear.
- Next: edition/Bluesky review after 15:00 UTC; fresh X round after 21:00 UTC. Fixed search and reserved slot stay off.

## 2026-11-06: iteration 964 — keep Contents aligned while reading

- Started clean on main; alerts clear and health/database/Redis green. No leftover work.
- Read all four saved topics: World breadth and Tech grouping await today's publication; X round waits until 21:00 UTC.
- Reader weakness: ordinary scrolling left Contents highlighting the topic after the first Tech story crossed the reading line; reproduced at scrollY 180.
- Cause: intersections alone do not report every crossing of the reading line. Add passive scroll tracking, coalesced per animation frame, with cleanup.
- Owner value: Contents highlights the story being read and mobile chips follow topic changes during forward/backward scrolling.
- Added read-only saved-edition browser replay in four views; blocks writes/external requests. Settle lazy blocked media before measuring; account for the last story's page-end limit.
- Updated TASKS, STEERING ack and affected handbook; archived iterations 947–948. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-scroll.ts; smoke-reader-layout.ts; check-handbook.ts 08-operations; git diff --check. Final results below.
- Initial scroll replay exposed lazy media layout shifts and page-end limits in the test; corrected setup and reran successfully. Inspected desktop light current-story screenshot.
- Next: edition/Bluesky review after 15:00 UTC; X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final check passed: 543 unit/224 isolated integration tests; build, handbook and both four-view browser replays passed. API/worker/docs/schema restarted; health/database/Redis green, 36 sources healthy, no failed digest jobs, alerts clear.

## 2026-11-06: iteration 965 — resize X media with its reader card

- Started clean on main; alerts clear, health/database/Redis green, all 36 sources healthy and no failed digest runs. No leftover work.
- Read all four saved topics; World breadth/Tech grouping and Bluesky gates await 15:00 publication; X round waits until 21:00 UTC.
- Reader weakness: X media retained its creation width after rotation/window resizing; reproduced stale 550px media at a 320px viewport with a local widget stub.
- Observe successful media's card width and rebuild only after its capped width settles, preserving saved-text state. Failed media keeps explicit retry; observer/timer cleaned up on rebuild/unmount.
- Extended saved-edition browser replay across 320px, landscape and original widths in four device/theme views; all passed with saved text open. No external calls or writes.
- Updated TASKS, STEERING ack and affected handbook; archived iteration 949. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend, selection or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-x-media.ts; check-handbook.ts 08-operations; git diff --check. Final check results below.
- Inspected mobile light resize screenshot; retained four new resize screenshots only. API/worker/docs/schema restarted; health green, scheduled edition still due at 15:00 UTC.
- Initial jobs command used unsupported --check with filters; reran supported read-only jobs query: zero failed digest jobs. Historical ingestion/social failures remain retained, sources healthy and alerts clear.
- Next: Nov 6 edition/Bluesky review after 15:00 UTC; X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final: first full check ended 143 during unit tests without a reported failure; retry passed 543 unit/224 isolated integration tests. Build, handbook and four-view browser replay passed; services active, health green, alerts clear.

## 2026-11-06: iteration 966 — preserve keyboard focus in saved X text

- Started clean on main; alerts clear and health/database/Redis green. No leftover work.
- Read latest saved topics: World breadth/Tech grouping and Bluesky review await 15:00 publication; X round waits until 21:00 UTC.
- Reader weakness: X media rebuilding replaced the saved-text link, dropping keyboard focus during rotation/theme changes; reproduced against HEAD with browser focus assertion.
- Keep one saved-text disclosure/link mounted through pending, failed and successful media; preserve focused text when media first succeeds.
- Owner value: keyboard readers can continue from the same original post after rotation or a system theme change.
- Extended saved-edition replay with focus assertions across 320px, landscape, original width and system themes in desktop/mobile light/dark; local widget stub, no writes/external calls.
- Updated TASKS, STEERING ack and affected handbook; archived iterations 950–951. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-x-media.ts; check-handbook.ts 08-operations; git diff --check. Final results below.
- Next: edition/Bluesky review after 15:00 UTC; fresh X round after 21:00 UTC. Fixed search and reserved slot stay off.
- First full check terminated with exit 143 after 543 unit passes and during integration tests, without a reported test failure; rerunning the full check.
- Inspected mobile light focus/resize screenshot; retained eight resize/theme screenshots. Rebuilt and restarted API/worker/docs/schema; health green, 36 sources healthy, no failed digest jobs and alerts clear.
- Final retry passed: 543 unit/224 isolated integration tests; build, handbook and four-view browser replay passed. No spend/flag changes; services healthy.

## 2026-11-06: iteration 967 — keep keyboard position when retrying X media

- Started clean on main; health/database/Redis green, alerts clear, all 36 sources healthy and no failed digest runs. No leftover work.
- Read saved topics: World breadth/Tech grouping and Bluesky review await 15:00 publication; X round waits until 21:00 UTC.
- Reader weakness: retrying failed X media removes the focused Retry button and drops focus to the page body; reproduced against HEAD with saved-edition browser assertion.
- Move focus to the saved post link before retry removes the control; existing media-success behavior keeps that link visible and focused.
- Extended four-view recovery replay to require focus without manually setting it. Local widget stub; no writes or external calls.
- Updated TASKS, STEERING ack and affected handbook; archived iterations 952–953. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-x-media.ts; check-handbook.ts 08-operations; git diff --check. Results below.
- Next: edition/Bluesky review after 15:00 UTC; fresh X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final: pnpm check passed (543 unit/224 isolated integration tests); build, handbook and four-view recovery passed. Inspected mobile light screenshot; retained two changed resize screenshots.
- API/worker/docs/schema restarted; health/database/Redis green, alerts clear. Initial jobs query used an unknown queue name; supported unfiltered query confirmed zero failed digest-generation jobs.

## 2026-11-06: iteration 968 — preserve saved-text disclosure focus

- Started clean on main; health/database/Redis green, alerts clear, 36 sources healthy and no failed digest jobs. No leftover work.
- Read latest saved topics; World breadth/Tech grouping and Bluesky await Nov 6 publication; X round waits until 21:00 UTC.
- Reader weakness: a system theme change hides the focused saved-text disclosure while rebuilding X media, dropping keyboard focus to the body; reproduced against HEAD.
- Keep the disclosure visible after its first successful embed; only focused original-text links force the panel open on media success, preserving a focused disclosure's collapsed choice.
- Extended saved Gaming replay with system-theme focus/collapsed-state assertions in desktop/mobile light/dark; local widget stub, no writes or external calls.
- Updated TASKS, STEERING ack and affected handbook; retained/inspected mobile light screenshot. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-x-media.ts; check-handbook.ts 08-operations; git diff --check. Final results below.
- Next: Nov 6 edition/Bluesky review after 15:00 UTC; X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final: pnpm check passed (543 unit/224 isolated integration tests); build, handbook and four-view browser replay passed. API/worker/docs/schema restarted; health/database/Redis green and alerts clear.

## 2026-11-06: iteration 969 — preserve media space during reloads

- Started clean on main; alerts clear, health/database/Redis green, 36 sources healthy and no failed digest jobs. No leftover work.
- Read saved Nov 5 topics; Nov 6 edition/Bluesky review waits for publication and X round for 21:00 UTC.
- Reader weakness: saved Gaming X media loses its height during theme replacement, shifting following content; new pending-state browser assertion failed against HEAD.
- Reserve the previous media height during replacement and release on success, rejection or timeout. Reader sees a stable media area while loading.
- Extended saved-edition local-widget replay across desktop/mobile light/dark, with replacement screenshots; no writes or external calls.
- Updated TASKS, STEERING ack and affected handbook; archived iterations 954–955. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-x-media.ts; check-handbook.ts 08-operations; git diff --check. Final results below.
- First post-edit browser attempt served old code before build finished; completed-build replay passed. First pnpm check exited 143 after 543 unit and 224 integration passes; full detached rerun started to capture final exit status.
- Next: edition/Bluesky review after 15:00 UTC; fresh X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final rerun passed with exit 0: 543 unit/224 isolated integration tests; build, handbook and four-view browser replay passed. Inspected mobile replacement screenshot; four new screenshots retained.
- API/worker/docs/schema restarted; health/database/Redis green, alerts clear.
