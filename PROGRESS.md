# Progress

## 2026-11-06: iteration 1032 — open mobile contents at the current entry

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; no leftover work; alerts clear and /healthz DB/Redis OK.
- Reproduced a 390×400 reader weakness: opening Contents while reading World's Posts left that entry offscreen and focused the first topic. The sheet now reveals/focuses the current entry; keyboard navigation starts where the reader is.
- Read-only saved-edition browser regression passed in light/dark: current entry visible/focused, Escape restores Contents focus and exact reading position. Screenshots added and light visually inspected. Broader desktop/mobile light/dark reader-layout checks passed, including sheet navigation and deep links.
- Passed pnpm format; pnpm lint:fix; pnpm build; pnpm exec tsx scripts/smoke-reader-sheet-current.ts; pnpm exec tsx scripts/smoke-reader-layout.ts; git diff --check.
- API/worker restarted; /healthz DB/Redis OK and alerts clear. Real saved edition retains four topics, 20 stories and 17 posts. No paid calls or source/schema/handbook-flow changes; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Full pnpm check passed: static checks, 562 unit tests and 225 isolated integration tests (exit 0).
- Next: continue final reader spec; approved Bluesky slot activation pending under Current order; fresh X round after 21:00 UTC.

## 2026-11-06: iteration 1033 — compact unavailable X media

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; no leftovers, alerts clear and /healthz DB/Redis OK.
- Saved reader repeated multi-line embed failure instructions under otherwise readable X posts. Replaced them with one compact media-unavailable/retry row; saved text, original link, loading and focus behavior retained.
- Read-only saved-edition Playwright check passed desktop/mobile light/dark, covering failure-row height, retry, focus, media recovery, resizing and theme replacement. Widget recovery uses a local stub; no external calls or writes. Updated four failure screenshots; final mobile light visually inspected.
- Passed pnpm build; pnpm exec tsx scripts/smoke-reader-x-media.ts; pnpm format; pnpm lint:fix; git diff --check. Full pnpm check passed static checks, 562 unit and 225 integration tests, then exited 143 after coverage; standalone pnpm test:integration passed all 225 tests (exit 0).
- API/worker restarted; /healthz DB/Redis OK, alerts clear; saved edition retains four topics, 20 stories and 17 posts. No paid calls or source/schema/handbook-flow changes; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Archived iteration 1017 to keep PROGRESS small. Next: continue final reader; approved Bluesky slot pending under Current order; X round after 21:00 UTC.

## 2026-11-06: iteration 1034 — shared final reader post cards

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; no leftover work; alerts clear and /healthz DB/Redis OK.
- Reader weakness: legacy post cards had different corners/padding from story cards, and Posts skipped a heading level. All platforms now use the shared card component with matching appearance; Posts uses the approved 20px semibold scale. Removed replaced legacy card/section CSS.
- Saved-edition Playwright layout and X loading/failure/retry checks passed desktop/mobile light/dark. Synthetic Bluesky and Reddit card checks passed all four views; repaired stale Reddit assertion that wrongly rejected the now-public editorial note. No external calls/writes; Reddit stays parked.
- Screenshots updated for post cards/section; mobile X and desktop dark reader visually inspected. Archived old completed task markers and iteration 1018 to keep orientation files smaller.
- Passed pnpm build; pnpm format; pnpm lint:fix; git diff --check. Full pnpm check passed static checks and all 562 unit tests, then was terminated (exit 143) during integration without a reported test failure; standalone pnpm test:integration passed all 225 tests (exit 0).
- API/worker restarted; /healthz DB/Redis OK and alerts clear. Real saved edition retains four topics, 20 stories and 17 posts. No paid calls or source/schema/handbook-flow changes; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: continue final reader; approved Bluesky reserved slot activation pending under Current order; fresh X round after 21:00 UTC. Fixed search stays OFF.

## 2026-11-06: iteration 1035 — final reader loading layout

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; no leftover work; alerts clear and /healthz DB/Redis OK.
- Replaced the initial blank reader wait with responsive brief/card skeletons and desktop contents placeholders, using shared Card/Skeleton components. Screen readers receive one loading status; placeholders are hidden and contain no focus targets.
- Read-only Playwright replay uses the real saved edition with locally delayed responses: loading, saved-content transition and failed-request recovery passed desktop/mobile light/dark; four screenshots saved, mobile light and desktop dark visually inspected.
- No external browser requests, paid calls or data writes. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged: no source/schema/system-flow changes. Archived iteration 1019 to keep PROGRESS small.
- Passed pnpm build; pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration, exit 0); pnpm exec tsx scripts/smoke-reader-loading.ts; pnpm exec tsx scripts/smoke-reader-layout.ts; git diff --check. First check stopped on archived Markdown formatting; corrected and full rerun passed.
- All 36 sources healthy; completed collection jobs and saved edition retain four topics, 20 stories and 17 posts. API/worker restarted and health/alerts verified before commit.
- Initial push rejected: owner updated B2 steering concurrently. Merged origin/main without conflicts or history changes; owner now caps the backup bucket at 3 GB with tiered retention. Code unchanged; push succeeded.
- Next: continue final reader spec; approved Bluesky slot activation pending under Current order; fresh X round after 21:00 UTC. Fixed search remains OFF.

## 2026-11-06: iteration 1036 — archive loading layout

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; no leftovers; alerts clear and /healthz DB/Redis OK.
- Archive now shows four responsive date-row placeholders instead of a text-only wait, matching saved date/coverage/topic rows. Screen readers receive one loading announcement; placeholders are hidden and have no focus targets.
- Read-only Playwright replay of saved archive passed loading, saved links, failure/retry recovery and overflow checks desktop/mobile light/dark. Saved four loading screenshots; mobile light and desktop dark visually inspected.
- Existing archive smoke passed saved links, pagination/reload, empty/error/retry and reader-only requests. Restored its unrelated regenerated screenshots. No external traffic or paid calls.
- Passed pnpm build; pnpm exec tsx scripts/smoke-reader-archive-loading.ts; pnpm exec tsx scripts/smoke-reader-archive.ts; pnpm format; pnpm lint:fix. First pnpm check stopped on newly archived Markdown formatting; corrected; full rerun passed (562 unit, 225 isolated integration tests, exit 0); git diff --check passed.
- API/worker restarted; health and alerts clear; all 36 sources healthy. Real saved edition retains four topics, 20 stories and 17 posts. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged: no source/schema/system-flow changes.
- Archived iteration 1020 to keep PROGRESS small. Next: final reader completion; X round after 21:00 UTC; approved Bluesky slot activation remains pending. Fixed search OFF.

## 2026-11-06: iteration 1037 — keyboard access to reader content

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; no leftovers; health DB/Redis OK and alerts clear.
- Added focus-only skip links before the edition/archive headers. Keyboard readers can bypass header and contents navigation, focus the first topic/archive heading and continue into content with Tab; normal layouts stay unchanged.
- Read-only Playwright check passed desktop/mobile light/dark: first focus, visible unobscured skip link, Enter destination focus, sticky-header clearance, next content link and no horizontal overflow. Eight screenshots saved; mobile edition light and desktop archive dark visually inspected.
- Browser checks exposed and corrected focus-only Tailwind position/padding interactions before acceptance; initial smoke wrapper corrected for the repo's CommonJS execution.
- No external browser traffic, writes or paid calls. All 36 sources healthy; no failed retained digest runs; saved edition has four topics, 20 stories and 17 posts. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged: no source/schema/system-flow changes.
- Passed pnpm build; pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration tests, exit 0); pnpm exec tsx scripts/smoke-reader-skip-link.ts; git diff --check.
- API/worker restarted; health DB/Redis OK and alerts clear. Archived iteration 1021 to keep PROGRESS small.
- Next: finish final reader under item 33; fresh X round after 21:00 UTC; approved Bluesky slot activation pending. Fixed search stays OFF.

## 2026-11-06: iteration 1038 — keyboard reading after archive pagination

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; no leftovers; alerts clear and /healthz DB/Redis OK.
- Archive pagination now focuses and reveals the heading after the new dates or error state load. The heading describes the page number; Tab continues into the new dates rather than remaining at the footer. Initial arrival keeps normal browser focus.
- Read-only saved-data replay simulates two pages and delayed responses; desktop/mobile light/dark focus, next date, heading visibility and overflow checks passed. Eight screenshots saved; mobile light and desktop dark visually inspected. Existing archive navigation/recovery smoke passed.
- No writes, external browser traffic or paid calls in the new replay. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged: no source/schema/system-flow changes. Archived iteration 1022 to keep this file small.
- Verification: pnpm build; pnpm exec tsx scripts/smoke-reader-archive-focus.ts; pnpm exec tsx scripts/smoke-reader-archive.ts; pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration, exit 0); git diff --check. API/worker restarted; all 36 sources healthy, no failed retained digest runs, saved edition four topics/20 stories/17 posts.
- Next: continue final reader; X round after 21:00 UTC; approved Bluesky slot activation pending under Current order. Fixed search stays OFF.

## 2026-11-06: iteration 1039 — remove replaced combined admin screen

- Advanced item 33/43 while X rounds wait until after 21:00 UTC. Started clean on main; no leftovers; alerts clear and health DB/Redis OK.
- Removed the legacy combined controls and status component below Overview, completing the spec's removal of replaced screens. Dedicated Editions/Sources/Topics/Schedule/Spend/Tools remain in desktop/mobile navigation.
- Read-only Playwright overview replay passed desktop/mobile light/dark: real saved edition/cost, healthy sources, anonymous denial, reload, mobile menu, navigation links and no overflow. Four screenshots saved; mobile light/desktop dark visually inspected.
- Updated runtime handbook to describe the completed admin navigation. SOURCES and NEEDS_FROM_HUMAN unchanged: no source or external-system changes. No paid calls.
- Verification: pnpm build; pnpm exec tsx scripts/smoke-admin-overview.ts; pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime; pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration tests, exit 0); git diff --check.
- API/worker restarted; health DB/Redis OK and alerts clear. Archived iteration 1023 to keep this log small. Next: final reader completion; fresh X rounds after 21:00 UTC; approved Bluesky reserved-slot activation pending under Current order. Fixed search OFF.

## 2026-11-06: iteration 1040 — weekday in the reader header

- Advanced item 33/43 while X rounds wait until after 21:00 UTC. Started clean on main; no leftovers; alerts clear and health DB/Redis OK.
- Desktop edition dates now include the weekday from the approved header spec; mobile dates retain their compact month/day display and accessible year.
- Read-only Playwright date/overflow check passed desktop/mobile light/dark; archive smoke passed older/newer navigation, reload, paging and error/retry. Four date screenshots updated; desktop light and mobile dark visually inspected.
- Initial browser assertion included the mobile screen-reader-only year; corrected the assertion to inspect the visible date text. No product defect or external calls.
- All 36 sources healthy; no failed retained digest runs; latest saved edition four topics/20 stories/17 posts. No paid calls. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged: no source/schema/system-flow changes.
- Verification: pnpm build; node /tmp/news-digest-1040-browser.cjs; pnpm exec tsx scripts/smoke-reader-archive.ts; pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration, exit 0); git diff --check. API/worker restarted; health DB/Redis OK and alerts clear.
- Archived iteration 1024 to keep this log small. Next: continue final reader; fresh X round after 21:00 UTC; approved Bluesky reserved-slot activation pending under Current order. Fixed search OFF.

## 2026-11-06: iteration 1041 — group source controls before publication time

- Advanced item 33/43 while X rounds wait until after 21:00 UTC. Started clean on main; no leftovers; alerts clear and health DB/Redis OK.
- Reader source rows now keep grouped-outlet controls beside publisher names before publication time, matching the approved spec. Expanded reports stay below the row with time above them.
- Read-only saved-edition Playwright replay checks disclosure order, expansion, article dates and reader navigation desktop/mobile light/dark; source-card screenshots updated and visually inspected.
- Browser replay initially used two direct-child timestamp selectors from the previous markup; updated both for the timestamp wrapper. First full check received SIGTERM after 562 unit passes at integration setup; reran. No paid calls.
- All 36 sources report no errors; digest queue has zero failed runs. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged: no source/schema/system-flow changes.
- Verification: pnpm build; pnpm exec tsx scripts/smoke-reader-layout.ts; pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration, exit 0); git diff --check. API/worker restarted; health/alerts clear.
- Archived iteration 1025 to keep this log small. Next: continue final reader; fresh X round after 21:00 UTC; approved Bluesky reserved-slot activation pending under Current order. Fixed search OFF.

## 2026-11-06: iteration 1042 — preserve reader position on refresh

- Advanced item 33/43 while X rounds wait until after 21:00 UTC. Started clean on main; no leftovers; health DB/Redis OK and alerts clear.
- Found and reproduced a reading-position jump: changed background edition data reran initial hash restoration, returning readers to an earlier contents link after they had scrolled onward.
- Moved initial deep-link restoration to edition mount; keyed contents by edition ID so opening another edition still restores its link. Refreshes continue updating contents tracking without moving the page.
- Saved-data Playwright replay failed before the fix and passed desktop/mobile light/dark afterward; initial deep link and changed refresh both verified. Four screenshots saved; mobile light visually inspected. External requests blocked; no paid calls.
- Broader reader layout/navigation replay passed all four views. All 36 sources healthy; digest queue zero failed runs. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged: no source/schema/system-flow changes.
- Verification: pnpm build; pnpm exec tsx scripts/smoke-reader-position.ts; pnpm exec tsx scripts/smoke-reader-layout.ts; pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration, exit 0); git diff --check.
- API/worker restarted; health DB/Redis OK and existing alerts clear. Push initially rejected by concurrent owner steering; merged without rewriting history, preserving item 44 and owner files. Archived iteration 1026. Grafana endpoint timed out at 2 s while system unit active, MemoryCurrent 218013696/MemoryHigh 218103808 bytes, CPU quota 20ms/s; current alerts miss it. Next: item 44 Grafana breakage/health alert first; X round after 21:00 UTC. Fixed search OFF.

## 2026-11-06: iteration 1043 — recover Grafana and detect endpoint failures

- Item 44 breakage first; started clean on main with no leftovers. Existing alerts were clear despite health timing out; app DB/Redis, 36 sources and digest queue healthy.
- Confirmed memory-reclaim thrash: MemoryHigh 208 MiB, 2.89M high events, ~60% full stalls; CPU quota 2% saturated. Raising reclaim to 240 MiB alone did not recover it; repaired instance answered ~1 ms at the old 2% CPU cap.
- Disabled snapshots/Kubernetes dashboard UI, reduced index workers/cache and made dashboard cleanup hourly. Go target 160→128 MiB; MemoryHigh 208→288 MiB, hard ceiling 256→320 MiB, CPU cap 2→3%. Missing plugin/provisioning directories reconciled.
- Existing 30-second unit collector now probes Grafana health with curl's two-second deadline and checks database health. GrafanaHealthFailed catches failures/timeouts/missing probes even with an active unit; fired and cleared live during recovery. No CLI/dashboard layout changes or new services.
- Final restart 19:37:45 UTC; 20:08:44 snapshot (31 min): health 16 ms, 129.99 MiB, average CPU 0.53%, zero restarts/reclaim/OOM events. All 58 persisted health samples since 19:40 passed. Stack 418.8 MiB/1.84% CPU, within budget.
- Passed pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration); pnpm build; python3 ops/observability/test-grafana-health.py; vmalert-tool-prod unittest -files=ops/observability/alerts.test.yml; bash -n installers; git diff --check.
- Passed scripts/check-observability.ts --verify-alerts and --verify-grafana --grafana-agent-only via pnpm exec tsx; scripts/check-handbook.ts observability passed. Desktop/mobile screenshots saved and inspected; ten dashboards discoverable.
- Initial Grafana check needed its old 256 MiB assertion updated. Jobs-only verification hit changing schedule/timing equality assertions; stable Agent dashboard checks passed. Temporary sampler exited 143; durable collector history and direct probes provided stability evidence.
- API/worker rebuilt/restarted; final health DB/Redis OK, all 36 sources healthy, digest queue zero failed runs, alerts clear. No paid verification calls or source/schema changes; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Updated affected handbook/owner ack, archived iteration 1027 and older completed task markers. Stop after item 44 as instructed; next resume approved UI while X tests wait until after 21:00 UTC. Fixed search OFF.

## 2026-11-06: iteration 1044 — open Bluesky posts from compact cards

- Advanced item 33/43 while X rounds wait until after 21:00 UTC. Started clean on main; no leftovers; health/alerts clear.
- Reader weakness: Bluesky text required a separate footer to open its original post. Text now links directly to the post while embedded source URLs keep their destinations; timestamp also links to the post, including URL-only posts. Removed the redundant footer.
- Read-only actual saved World-post replay passed desktop/mobile light/dark: original/source destinations, saved text, keyboard focus, no nested links or overflow. Four screenshots saved; mobile light visually inspected. Existing synthetic Bluesky media/context replay and broader saved reader layout replay passed all four views.
- Screenshot review caught an oversized timestamp link; matched author-row typography and added a browser assertion. First full check stopped on archive/script formatting; formatted both and reran.
- Initial new script used top-level await in this CommonJS workspace; wrapped its entry point and reran successfully. Updated old synthetic footer/link-count assertions for the new card. No paid calls, edition writes or source/selection changes.
- Passed pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration, exit 0); pnpm build; pnpm exec tsx scripts/smoke-reader-bluesky-links.ts; scripts/smoke-bluesky-cards.ts; scripts/smoke-reader-layout.ts; git diff --check.
- Built and restarted API/worker; /healthz DB/Redis OK, all 36 sources healthy, digest queue zero failed runs, alerts clear.
- Archived iteration 1028 to keep this log small. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged: no source/schema/system-flow changes.
- Next: continue final reader; fresh X round after 21:00 UTC. Approved Bluesky slot activation pending under Current order; fixed search OFF.

## 2026-11-06: iteration 1045 — keep failed Bluesky images usable

- Advanced item 33/43 while X rounds wait until after 21:00 UTC. Started clean on main; alerts clear, all 36 sources healthy, latest scheduled digest completed.
- Bluesky cards now replace failed thumbnails with a compact link to the full image; failed video previews retain the link to the original post. Successful images keep their existing alt text and lazy loading.
- Synthetic failed-image replay verifies original destination, keyboard focus, saved text and no overflow across desktop/mobile light/dark. Four screenshots saved; mobile light inspected. Actual saved-post link and broader reader layout replays also passed four views. External requests blocked; no paid calls or edition writes.
- Passed pnpm build; pnpm format; pnpm lint:fix; pnpm check through typecheck/lint/format/boundaries and 562 unit tests. Check exited 143 as isolated integration started; reran pnpm test:integration separately (result below).
- Browser commands: pnpm exec tsx scripts/smoke-bluesky-cards.ts; scripts/smoke-reader-bluesky-links.ts; scripts/smoke-reader-layout.ts. Discarded timestamp-only screenshot churn from unchanged views; retained new failed-image screenshots.
- Archived iteration 1029. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged: no source/schema/system-flow changes.
- Separate isolated integration run passed 225/225 (exit 0); all check stages verified. API/worker restarted; final /healthz DB/Redis OK and alerts clear. No blockers; next continue final reader until fresh X round after 21:00 UTC; fixed search OFF.

## 2026-11-06: iteration 1046 — open X originals from timestamps

- Advanced item 33/43 while fresh X rounds wait until after 21:00 UTC. Started clean on main; alerts clear, all 36 sources healthy, digest queue zero failed runs.
- Reader weakness: loaded X cards collapse saved text, leaving the app timestamp without an original-post destination. Timestamp now opens the original directly, matching Bluesky and retaining compact author-row typography.
- Extended saved-post sizing replay to assert original URL, new-tab behavior, keyboard focus and 12px timestamp text alongside loaded-media resizing. Desktop/mobile light/dark passed; four screenshots updated, mobile light inspected. Official widgets stubbed; no external requests, writes or paid calls.
- First browser run started before the new build finished and timed out against the old bundle; reran successfully after build completion.
- Passed pnpm format; pnpm lint:fix; pnpm build; pnpm check (562 unit/225 isolated integration, exit 0); pnpm exec tsx scripts/smoke-post-sizing.ts; git diff --check.
- Archived iteration 1030 to keep PROGRESS small. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged: no source/schema/system-flow changes.
- API/worker restarted from verified build; /healthz DB/Redis OK, alerts clear; latest saved edition four topics/20 stories/17 posts. Next: continue final reader until fresh X rounds after 21:00 UTC; fixed search OFF.
