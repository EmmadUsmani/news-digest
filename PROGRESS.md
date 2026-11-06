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

## 2026-11-06: iteration 939 — restore malformed reader/archive response recovery

- Started clean on main; alerts clear, health/database/Redis green and all app services active. No leftover work.
- Nov 6 edition/Bluesky evidence and 21:00 UTC X round remain time-gated. Latest saved edition retains the known World breadth/Tech grouping issues awaiting deployed fixes' publication evidence.
- Found and reproduced an existing verification breakage: smoke-reader-invalid-data timed out clicking the deleted inline-history panel.
- Ported the replay to the archive and current retry controls. Owner value: retain proof that unreadable responses show an error and let readers recover their saved edition through a working archive link.
- Browser-only malformed JSON/schema responses; verify one request before manual retry, empty invalid content, saved links and subsequent real edition navigation. Third-party requests blocked; no writes or paid calls.
- Verification: pnpm exec tsx scripts/smoke-reader-invalid-data.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build; git diff --check. Final results below.
- Updated TASKS and reader/archive error screenshots (inspected mobile light archive and desktop dark reader); archived iteration 924 and compacted old done markers. No system-flow change; SOURCES/handbook/STEERING/NEEDS_FROM_HUMAN unchanged.
- Next: Nov 6 World/cost/Bluesky review after publication, X round after 21:00 UTC; keep fixed search and reserved-slot flags off.
- Final check passed (543 unit/224 isolated integration tests); build and eight browser cases passed. Initial check caught an archived entry formatted after the main formatter; fixed and full rerun passed. Services/source/job/health/alerts checked around restart.

## 2026-11-06: iteration 940 — original posts before editorial context

- Started clean on main; alerts clear and health/database/Redis green. No leftover work; Nov 6 edition review and 21:00 UTC X round remain time-gated.
- Read all four saved topics. World breadth/Tech grouping await publication evidence; post cards put paraphrased editorial context before the original post, making readers read the explanation first.
- Moved context below original text, media and metrics on X, Reddit and Bluesky cards, following the approved design. Preserved every saved note, including English context for Gaming's Japanese announcement.
- Updated existing layout/widget browser checks to verify visible reading order with failed external widgets and with a local widget stub. Saved production content; no external requests, writes, paid calls or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-layout.ts; smoke-post-sizing.ts; git diff --check. Final results below.
- Updated TASKS, operations handbook and screenshots; archived iteration 925. No source or data-contract change; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Next: Nov 6 World/cost/Bluesky review after publication; X round after 21:00 UTC. Fixed search and reserved-slot flags remain off.
- Final full check passed (543 unit/224 isolated integration tests); build, handbook validation and both four-view browser replays passed. Inspected mobile light/desktop dark screenshots; all 36 sources healthy, recent collections completed and no failed digest jobs. Final service restart/health/alerts checked before handoff.

## 2026-11-06: iteration 941 — restore canonical reader routing verification

- Started clean on main; health/alerts/services green, all 36 sources healthy, no failed digest runs. No leftover work.
- Read all four saved topics: World breadth and mixed Tech grouping await Nov 6 publication evidence; no new content defect identified.
- Reproduced a broken existing routing check: it timed out on the deleted inline-history panel. Ported it to the archive and current story/error markup.
- Reader value: restored proof that old edition links redirect correctly, reload preserves saved stories/summaries, and archive switching returns cached editions without refetching.
- Four desktop/mobile light/dark cases also cover malformed responses, missing routes, self-hosted fonts, overflow, API-only 404s and zero writes. External requests blocked; no paid calls or flag changes.
- Verification: pnpm exec tsx scripts/smoke-ui-routing.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build; git diff --check. Final results recorded below.
- Updated TASKS and screenshots; archived iteration 926. No source/system-flow change; SOURCES/handbook/NEEDS_FROM_HUMAN/STEERING unchanged.
- Next: Nov 6 World/cost/Bluesky review after 15:00 UTC publication; X round after 21:00 UTC. Fixed search and reserved slot remain off.
- Final standalone pnpm check exited zero (543 unit/224 isolated integration tests); build and four post-build browser cases passed. Initial chained check exited 143 after passing tests; standalone rerun clean. Browser rerun after restart readiness passed. Inspected desktop light/mobile dark; services/health/36 sources/alerts green.

## 2026-11-06: iteration 942 — readable mobile contents headlines

- Started clean on main; alerts clear and services/health green. No leftover work. Edition/Bluesky review and X round remain time-gated.
- Read all four saved topics. World breadth and mixed Tech grouping await Nov 6 evidence; mobile Contents cuts off long saved titles, hiding the details needed to choose a story.
- Reproduced headline clipping with the real saved OpenSSH story. Titles now wrap in the mobile sheet; desktop keeps compact single-line titles. Owner value: choose a story from its complete headline.
- Extended the existing saved-edition browser replay for full headline visibility, mobile story selection and sheet dismissal; updated screenshots. External widgets blocked; no writes, paid calls, flags or selection changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx scripts/smoke-reader-layout.ts; pnpm exec tsx scripts/check-handbook.ts 08-operations; git diff --check. Final results below.
- Updated TASKS, affected handbook and STEERING ack; archived iteration 927 and compacted done markers. SOURCES/NEEDS_FROM_HUMAN unchanged; no collection or budget changes.
- Next: Nov 6 World/cost/Bluesky review after publication; X round after 21:00 UTC. Fixed search and reserved slot remain off.
- Final standalone pnpm check exited zero (543 unit/224 isolated integration tests); build, handbook and four post-restart browser views passed. First check exited 143 during integration; standalone rerun clean. Inspected both mobile sheet screenshots. API/worker/docs/schema active, health green, 36 sources healthy, no failed digest jobs and alerts clear.

## 2026-11-06: iteration 943 — focus the content chosen from Contents

- Started clean on main; alerts clear, health/database/Redis green, 36 sources healthy. No leftover work; edition and X reviews remain time-gated.
- Read the latest saved edition across all four topics; World breadth/Tech grouping await Nov 6 publication evidence.
- Reader weakness reproduced: desktop Contents left focus on the body; mobile returned focus to the menu button after selecting a story.
- Made topic/story/post destinations programmatically focusable; mobile selection focuses its destination after the sheet closes. Escape still restores the menu button. Keyboard readers can continue from their chosen content.
- Extended the existing saved-edition browser replay with Enter, destination focus, Tab to original article and Escape restoration in desktop/mobile light/dark; screenshots refreshed. No paid calls, writes, selection or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx scripts/smoke-reader-layout.ts; pnpm exec tsx scripts/check-handbook.ts 08-operations; git diff --check. Final results below.
- Updated TASKS, affected handbook and STEERING ack; archived iteration 928. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Next: Nov 6 edition/Bluesky review after publication; X round after 21:00 UTC. Fixed search and reserved-slot flags stay off.
- Final pnpm check passed (543 unit/224 isolated integration tests); build, handbook and four-view browser replay passed. First full check caught archive formatting, corrected before the successful rerun. Desktop/mobile Posts focus also verified. Post-restart replay caught a test timing race with dialog focus-scope removal; waiting for teardown fixed it, then repeated four-view replay passed. All four services restarted; health/database/Redis green and alerts clear.

## 2026-11-06: iteration 944 — restore delayed archive response verification

- Started clean on main; alerts clear and health/database/Redis green. No leftover work.
- Read saved topics; known World breadth/Tech grouping await Nov 6 publication. X round waits until 21:00 UTC.
- Existing edition-history smoke failed on the deleted Browse saved editions panel. Ported it from removed inline history/job state to the archive.
- Reader value: verifies a late archive refresh success or failure cannot replace the saved story edition the reader opened. Uses real stored content; delayed responses are browser simulations.
- Eight desktop/mobile light/dark success/error cases passed; screenshots refreshed. No writes, paid calls, flags or app behavior changes.
- Verification: pnpm exec tsx scripts/smoke-edition-history.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build; git diff --check. Final results below.
- Updated TASKS; no source/system-flow change, so handbook/SOURCES unchanged.
- Next: Nov 6 edition/Bluesky cost gate after publication; X after 21:00 UTC. Fixed search and reserved slot stay off.
- Final pnpm check exited zero (543 unit/224 isolated integration tests); build and eight post-restart browser cases passed. Inspected mobile dark screenshot. All four app services restarted; health/database/Redis green and alerts clear.

## 2026-11-06: iteration 945 — restore the main reader smoke

- Started clean on main; no leftover work. Alerts clear; health/database/Redis green. Edition/Bluesky review and X round remain time-gated.
- Existing main reader smoke still targeted removed period labels, story links and inline archive controls. Ported it to the rebuilt reader and standalone archive.
- Checks real saved titles, summaries, image attributes, older-edition opening/reload, latest return and pagination on desktop/mobile. External requests and API writes blocked; no paid calls or product/flag changes.
- Browser verification passed; refreshed four screenshots and inspected the mobile archive. Archived iteration 929 to keep PROGRESS under its size limit.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx scripts/smoke-ui.ts; git diff --check. Final results below.
- Updated TASKS; no source/system-flow change, so SOURCES, handbook and NEEDS_FROM_HUMAN unchanged.
- Next: Nov 6 edition/Bluesky review after publication; X after 21:00 UTC. Fixed search and reserved slot stay off.
- Final pnpm check exited zero: 543 unit and 224 isolated integration tests passed; build and post-restart desktop/mobile smoke passed. API/worker/docs/schema restarted, health/database/Redis green, 36/36 sources healthy, zero failed digest jobs and alerts clear.

## 2026-11-06: iteration 946 — show full desktop Contents headlines

- Started clean on main; no leftover work. Alerts clear and health/database/Redis green; higher-priority reviews remain time-gated.
- Reader weakness: desktop Contents clipped saved headlines, including Wembanyama's game result; reproduced with a browser assertion before changing the UI.
- Owner value: full headlines let the reader distinguish stories before choosing one. Titles now wrap in the existing scrollable sidebar.
- Extended saved-edition layout replay to reject desktop headline clipping, retaining keyboard navigation checks and four-view screenshots. No paid calls, selection or flags changed.
- Updated TASKS, handbook and STEERING ack; archived the oldest progress entry. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (543 unit/224 isolated integration tests); pnpm build; pnpm exec tsx scripts/smoke-reader-layout.ts before/after restart; pnpm exec tsx scripts/check-handbook.ts 08-operations; git diff --check. All passed; desktop screenshot inspected.
- API/worker/docs/schema restarted; health/database/Redis green, 36/36 sources healthy, no failed digest jobs, alerts clear.
- Next: Nov 6 edition/Bluesky cost review after publication; fresh X round after 21:00 UTC.

## 2026-11-06: iteration 947 — verify on-demand recovery in both themes

- Started clean on main; alerts clear, health/database/Redis green, 36/36 sources healthy and no failed digest-generation jobs. Higher-priority edition/X reviews remain time-gated.
- Existing admin recovery check passed desktop/mobile but omitted dark mode; extended the existing timeout/reconnect/reload/completion/failure replay to both themes and blocked external traffic. No product behavior change.
- Refreshed recovery screenshots; inspected desktop dark warning/link/progress. All queue submissions are intercepted simulations against saved operational snapshots; no paid calls, publication, settings or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx scripts/smoke-edition-jobs.ts; git diff --check. Initial full check/browser run terminated with 143 (543 unit passes); retries recorded below.
- Updated TASKS and archived iteration 931 to keep PROGRESS small. No source/system-flow change; handbook, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: Nov 6 World/cost/Bluesky review after publication; fresh X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final retry exited zero: 543 unit/224 isolated integration tests passed; build and four-view recovery replay passed. API/worker/docs/schema restarted active; health/database/Redis green, all 36 sources healthy and alerts clear. Post-restart smoke-ui.ts passed saved reader content/archive/navigation with no writes or browser errors.

## 2026-11-06: iteration 948 — prevent host-metrics scrape starvation

- Started clean on main. Triage caught pending host scrape, unit-snapshot and backup alerts; the app and today's successful backup were healthy.
- Host scrapes reached the 10-second timeout twice in 24 hours. Exporter cgroup recorded 159,516 throttled periods out of 176,796; a direct scrape took 4.310 seconds.
- Raised only the low-priority host exporter's CPU ceiling from 0.5% to 2% of one core; deployed its checked-in unit. First successful post-restart direct scrape took 1.170 seconds.
- This protects visibility of real service/backup failures. No reader/content change; edition/X reviews remain time-gated. No paid calls or flag changes.
- Updated monitoring handbook and TASKS; archived iteration 932. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (543 unit/224 isolated integration passes); pnpm build; check-handbook.ts 09-observability; smoke-ui.ts; git diff --check. All passed.
- API/worker/docs/schema restarted healthy; 36/36 sources healthy, zero failed digest jobs, all scrape targets up and alerts clear. Host up stayed 1 throughout a four-minute post-change window.
- Next: Nov 6 World/cost/Bluesky review after publication; fresh X round after 21:00 UTC.
