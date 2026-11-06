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
