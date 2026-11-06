## 2026-11-06: iteration 949 — show every grouped coverage report

- Started clean on main; alerts clear, health/database/Redis green. Edition/Bluesky reviews wait for 15:00 publication; X round waits for 21:00 UTC.
- Reader weakness: saved NBA Wembanyama “4 articles” expanded to only three reports because the primary was filtered out. Include it, preserving outlet links and the compact count; readers can now browse the complete report list.
- Extended saved-edition browser replay to assert every expanded report title and URL; four device/theme screenshots added. Inspected desktop light screenshot. No paid calls, collection, selection or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-layout.ts; check-handbook.ts 08-operations; git diff --check. Final results below.
- Initial smoke reached API before restart finished; retried after healthy. Coverage clicks changed the active topic, so the replay now resets before its existing contents checks.
- Updated TASKS, handbook and STEERING ack; archived iteration 933. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: Nov 6 World/cost/Bluesky review after publication; fresh X round after 21:00 UTC. Fixed search and reserved slot remain off.
- Final: first full check ended 143 during integration startup; retry exited zero (543 unit/224 isolated integration passes). Build, four-view reader replay and handbook check passed; services restarted, 36/36 sources healthy, zero failed digest jobs and alerts clear.

## 2026-11-06: iteration 950 — attribute grouped headlines to their primary outlets

- Started clean on main; health/database/Redis green, 36/36 sources healthy, no failed digest runs and alerts clear. Edition/X reviews remain time-gated.
- Read the latest saved four-topic edition. World's Trump headline opens The Guardian, but its source row started with Al Jazeera because grouped sources were alphabetized.
- Put the primary report's outlets first, preserving the other outlets and all grouped reports. Readers now see attribution matching the headline destination.
- Extended four-view saved-edition browser checks with the real World mismatch, direct primary URL assertions and screenshots. No paid calls, selection, collection or flag changes.
- Updated TASKS, operations handbook and STEERING ack; archived iteration 934. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (543 unit/224 isolated integration passes); pnpm build; check-handbook.ts 08-operations; smoke-reader-layout.ts; git diff --check. All passed.
- Browser first reached the restarting API too early; retry after healthy passed all four views. Inspected mobile light attribution screenshot. API/worker/docs/schema active, health green and alerts clear.
- Next: Nov 6 World/cost/Bluesky review after publication; X round after 21:00 UTC. Fixed search and reserved slot remain off.

## 2026-11-06: iteration 951 — expose grouped coverage depth

- Started clean on main; alerts clear, health/database/Redis green, 36/36 sources healthy and job checks green. Edition/Bluesky review waits for publication; X round waits for 21:00 UTC.
- Read saved topics: World's eight-report Trump story disclosed only “+1 more outlet,” hiding its coverage depth. Always show the article count alongside extra outlets before expansion.
- Extended saved-edition browser assertions for every grouped count; four device/theme checks passed and screenshots updated. Inspected mobile light World screenshot. No paid calls, selection, collection or flag changes.
- Updated TASKS, operations handbook and STEERING ack; archived iteration 935. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm build; check-handbook.ts 08-operations; smoke-reader-layout.ts; git diff --check passed. First pnpm check ended 143 during unit tests; retry passed (543 unit/224 isolated integration tests).
- API/worker/docs/schema restarted active; health green and alerts clear.
- Next: Nov 6 World/cost/Bluesky review after publication; fresh X round after 21:00 UTC. Fixed search and reserved slot remain off.

## 2026-11-06: iteration 952 — expose independent publishers in grouped coverage

- Started clean on main; health/database/Redis green, alerts clear; latest scheduled run completed and Nov 6 remains scheduled for 15:00 UTC.
- Read all four saved topics. World’s Guardian US and Guardian World feed labels occupied both source slots, hiding Al Jazeera behind expansion.
- Deduplicate source-row publishers by hostname (ignoring www), retaining primary attribution and every expanded report. Owner-visible result: independent coverage appears beside the headline publisher.
- Extended saved-edition browser checks to require distinct visible publishers; updated four-view screenshots and operations handbook. No paid calls, collection, selection or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 08-operations; smoke-reader-layout.ts; git diff --check. Final results recorded below.
- Updated TASKS and STEERING ack. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: Nov 6 World/cost/Bluesky review after publication; fresh X round after 21:00 UTC. Fixed search and reserved slot remain off.
- Final: initial check and concurrent lint-fix exited 143 without diagnostics; retries passed (543 unit/224 isolated integration tests). Build, handbook, four-view browser replay and diff checks passed; inspected mobile light World screenshot. Archived iteration 936. Services restarted healthy, 36/36 sources healthy, zero failed digest jobs and alerts clear.

## 2026-11-06: iteration 953 — explain unavailable X media

- Started clean on main; health/database/Redis green, alerts clear, source and job checks passed. Edition review waits for publication; X round waits for 21:00 UTC.
- Read all four saved topics. Gaming’s release-date announcement relies on an attached image; blocked widgets left only a retry button, without explaining the missing attachment.
- Added an accessible media-failure message beside retry. Saved original text and editorial context remain visible; successful retry removes the message. No spend, selection, collection or flag changes.
- Added saved-edition browser failure/recovery checks across desktop/mobile light/dark, with external traffic blocked and a local widget stub; all passed, no writes, edition unchanged. Inspected mobile light screenshot; four screenshots saved.
- Initial browser recovery assertion lost its card locator when saved text became collapsed; corrected the locator to include hidden saved links, then all four views passed.
- Updated TASKS, STEERING ack and operations handbook; archived iteration 937. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm build; check-handbook.ts 08-operations; smoke-reader-x-media.ts passed. Full pnpm check result below.
- API/worker/docs/schema restarted active, health green. Next: Nov 6 World/cost/Bluesky review after publication; fresh X round after 21:00 UTC. Fixed search and reserved slot remain off.
- Final: pnpm check passed (543 unit/224 isolated integration tests); build, handbook, four-view browser replay and diff checks passed. Services active, health green and alerts clear.

## 2026-11-06: iteration 954 — preserve opened saved X text

- Started clean on main; alerts clear, health/database/Redis green, 36/36 sources healthy and current scheduled/social jobs completed. Edition review waits for publication; X round waits for 21:00 UTC.
- Read saved topics: switching theme rebuilt X media and collapsed the saved original text a reader had opened. Reproduced with saved Gaming content and a local widget stub before fixing it.
- Preserve the reader's opened/collapsed disclosure choice through media reloads. No paid calls, selection, collection or flag changes.
- Expanded smoke-reader-x-media.ts: failure/retry plus open and closed theme round trips passed across desktop/mobile light/dark. No writes or external calls; saved edition unchanged. Four screenshots saved; inspected mobile screenshot. Archived iteration 938 to keep this file small.
- Updated TASKS, STEERING ack and operations handbook. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm build; check-handbook.ts 08-operations; smoke-reader-x-media.ts passed. Full pnpm check result recorded below.
- API/worker/docs/schema restarted. Next: Nov 6 World/cost/Bluesky review after publication; fresh X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final: pnpm check passed (543 unit/224 isolated integration tests); build, handbook and four-view browser replay passed. Services active, health green and alerts clear; git diff --check passed.

## 2026-11-06: iteration 955 — date grouped coverage reports

- Started clean on main; health/database/Redis green, alerts clear and 36/36 sources current. Latest scheduled digest completed. Two retained ingestion failures date to Nov 1–2; subsequent collection recovered.
- Read all four saved topics. World breadth/Tech grouping await Nov 6 publication; World’s expanded coverage combines Nov 4/5 reports without identifying their dates.
- Owner value: show each report’s publication date and local time so earlier coverage can be distinguished from updates. All saved titles, sources and links preserved; no paid calls, collection or flag changes.
- Extended saved-edition layout replay to check every grouped report’s visible timestamp and exact saved datetime in desktop/mobile light/dark. Four coverage screenshots updated; inspected mobile light.
- Updated TASKS, STEERING ack and operations handbook; archived iteration 939. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-layout.ts; check-handbook.ts 08-operations; git diff --check. Final check/restart results below.
- Next: Nov 6 edition/Bluesky cost and quality review after publication; X round after 21:00 UTC. Fixed search and reserved slot remain off.
- Final: pnpm check passed (543 unit/224 isolated integration tests); build, four-view browser replay, handbook and diff checks passed. API/worker/docs/schema restarted active, health green and alerts clear.

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
