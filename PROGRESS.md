## 2026-11-06: iteration 1023 — make headline-only summaries direct

- Started clean on main; no leftover work. Alerts clear, /healthz DB/Redis OK, 36 sources and 13 services healthy; no failed digest jobs. Two retained ingestion failures have recovered healthy sources.
- Read latest saved briefs/stories/posts across all four topics. Tech has two summaries that announce a Hacker News title and then repeat its claim; richer excerpts/repetition fixes already await the next edition.
- Owner value: readers should get the supported news once, with attribution, rather than two sentences describing a headline.
- Story editor v12 requests a direct attributed sentence for thin evidence, with a concrete allegation example. Attribution, absence checks, grouping, models and budgets remain intact; saved editions unchanged.
- Fake-only headline-summary test checks both Sonnet and Haiku paths; golden purpose expectations advance to v12. No generated-prose quality claim or paid calls.
- Passed pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration); pnpm build; git diff --check. Targeted editor tests passed 19. First check caught stale synthetic replay hash; refreshed only its fingerprint, response unchanged.
- Archived iterations 1006–1007 to keep PROGRESS small; recorded actual saved weakness and next-edition evaluation in the Nov 6 review. No source/schema/handbook flow change; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Initial push rejected: owner added item 43 and lead status updates. Merged owner changes without rewriting history; resolved only appended steering ack. New order raises item 33; next iteration must build final reader before item 42. This step advanced item 42, not 39/34/33.
- Next: final reader under item 33; fresh X round after 21:00 UTC. Reserved Bluesky slot stays OFF. API/worker restart and health/content checks follow push.

## 2026-11-06: iteration 1024 — build compact reader contents

- Advanced item 33 under item 43; X items 39/34 await the authorized round after 21:00 UTC. Started clean on main; no leftover work. Alerts clear and /healthz DB/Redis OK.
- Reader contents now match the approved spec: one-line headlines, expanded-topic chevrons and a visible current-story arrow. Full titles remain in accessible text and hover titles; links and mobile sheet navigation preserved.
- Extended read-only scrolling verification for single-line containment, full titles and active markers. Fixed stale selectors exposed by the saved Bluesky post and an NBA headline, without changing reader data.
- Passed pnpm exec tsx scripts/smoke-reader-scroll.ts and scripts/smoke-reader-layout.ts across desktop/mobile light/dark, including deep links, coverage and forbidden-label checks; no writes or external calls. Updated screenshots; visually inspected desktop/mobile light.
- pnpm build passed; API/worker restarted, /healthz and pnpm obs alerts clear. pnpm check passed (562 unit/225 isolated integration), as did pnpm format, pnpm lint:fix and git diff --check.
- Archived iterations 1008–1009 to keep this file small. No source/schema/handbook-flow change; SOURCES and NEEDS_FROM_HUMAN unchanged. No paid calls.
- Next: continue item 33 spec completion; fresh X round after 21:00 UTC. Reserved Bluesky slot stays OFF; deployed editorial changes await next edition.

## 2026-11-06: iteration 1025 — compact reader post notes

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; alerts clear and /healthz DB/Redis OK.
- Reader post notes now occupy at most one line, retaining full accessible text and hover titles. Exact repeats of original/display text (ignoring case/whitespace) are omitted across platforms.
- Saved-edition desktop/mobile light/dark layout checks passed; synthetic Bluesky replay verifies repetition suppression without changing saved data. Updated screenshots; visually inspected desktop/mobile light post cards.
- Additional official-widget sizing replay exposed a stale immediate-after-resize assertion: the iframe is replaced asynchronously. Updated it to wait for the resized iframe and its requested width, keeping lazy loading intact.
- Passed pnpm build; pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration); pnpm exec tsx scripts/smoke-reader-layout.ts; scripts/smoke-bluesky-cards.ts; scripts/smoke-post-sizing.ts; git diff --check.
- API/worker restarted; saved edition serves 20 stories and 17 posts, /healthz and alerts clear. No paid calls; no source/schema/handbook-flow changes; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: continue final reader spec completion; fresh X round after 21:00 UTC. Reserved Bluesky slot remains OFF awaiting owner; editorial fixes await next scheduled edition.

## 2026-11-06: iteration 1026 — compact relative story times

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; alerts clear and /healthz DB/Redis OK.
- Story cards now show minute/hour/day ages, refreshing every minute. Exact saved local date/time remains in hover and accessible labels; article disclosures retain exact times. Future-dated reports show a calendar date.
- Extended read-only browser checks for exact timestamp retention and clock-driven minute/hour/day transitions across desktop/mobile light/dark; screenshots updated and desktop/mobile light visually inspected.
- Initial browser attempt raced API startup; reran after healthy. Clock assertions initially depended on timer phase; fixed time plus fast-forward now isolates age boundaries without changing real edition data.
- Passed pnpm format; pnpm lint:fix; pnpm build; pnpm exec tsx scripts/smoke-reader-layout.ts; git diff --check. pnpm check passed typecheck/lint/format/boundaries and 562 unit tests, then exited 143 after 225 integration cases without a final summary; standalone pnpm test:integration rerun exited 0 (225 passed).
- API/worker restarted; saved edition has 20 stories/17 posts; health and alerts clear. No paid calls or source/schema/handbook-flow changes; SOURCES unchanged.
- Corrected stale TASKS/NEEDS_FROM_HUMAN owner-wait wording: latest item 40 explicitly approves reserved-slot activation without a cap increase. Slot activation remains next under Current order; no configuration changed here.
- Archived iterations 1010–1011 to keep PROGRESS under 25 KB. Next: continue approved reader; enable approved Bluesky slot under Current order; X fresh-window round after 21:00 UTC.

## 2026-11-06: iteration 1027 — inline grouped outlets

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; alerts clear and /healthz DB/Redis OK.
- Collapsed report disclosures now share the source/time row, saving a row per story. Additional publishers use +N outlets; all saved reports expand below. Full article count remains in hover/accessibility text.
- Extended read-only browser verification for desktop row alignment and accessible counts; updated old-label assertions. Desktop/mobile light/dark passed, including expansion, timestamps, no overflow and no writes. Updated screenshots; inspected desktop/mobile light.
- Passed pnpm build; pnpm check (562 unit/225 isolated integration); pnpm format; pnpm lint:fix; pnpm exec tsx scripts/smoke-reader-layout.ts. API/worker restarted; health and alerts clear.
- No paid calls or source/schema/handbook-flow changes; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Initial push rejected by concurrent owner backup steering commit cce78a99; fetched and merged without conflicts, preserving owner changes. No runtime change in merge.
- Next: continue approved reader completion; approved Bluesky slot activation pending under Current order; X round after 21:00 UTC.

## 2026-11-06: iteration 1028 — compact post timestamps

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; health and alerts clear.
- X, Bluesky and Reddit cards now share the story age display, refreshing every minute and retaining exact saved timestamps in hover/accessibility labels. Mobile author rows fit more comfortably.
- Extended saved-post browser assertions for relative ages and exact timestamp retention; updated the broader reader's old full-date assertion. Desktop/mobile light/dark sizing, synthetic Bluesky and saved reader checks passed; screenshots updated and desktop/mobile light visually inspected.
- Passed pnpm format; pnpm lint:fix; pnpm build; pnpm exec tsx scripts/smoke-post-sizing.ts; scripts/smoke-bluesky-cards.ts; scripts/smoke-reader-layout.ts; git diff --check.
- pnpm check passed static checks and 562 unit tests, then exited 143 during integration; standalone pnpm test:integration passed all 225 cases (exit 0).
- API/worker restarted; /healthz DB/Redis OK, all 36 sources and 13 services healthy, alerts clear. Browser checks confirmed saved edition unchanged; no paid calls or source/schema/handbook-flow changes.
- Archived iterations 1012–1013 to keep PROGRESS small. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: continue final reader spec; approved Bluesky slot activation pending under Current order; fresh X round after 21:00 UTC.

## 2026-11-06: iteration 1029 — keep current contents visible

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; alerts clear and /healthz DB/Redis OK.
- Reproduced a reader weakness at 1280×400: World's active Posts entry ended at y=508 below the contents panel's y=384 edge. The panel now reveals the active entry in either direction without moving the edition.
- Added read-only saved-edition Playwright regression for short desktop light/dark, both scroll directions and stable reading position; screenshots updated and light visually inspected. Broader desktop/mobile light/dark reader layout checks passed.
- Passed pnpm format; pnpm lint:fix; pnpm build; pnpm exec tsx scripts/smoke-reader-short-contents.ts; pnpm exec tsx scripts/smoke-reader-layout.ts; git diff --check.
- pnpm check passed static checks and 562 unit tests, then exited 143 during integration; standalone pnpm test:integration passed all 225 cases (exit 0).
- API/worker restarted; health and alerts clear; saved edition retains four topics, 20 stories and 17 posts. No paid calls or source/schema/handbook-flow changes; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Initial push rejected by concurrent owner .gitignore commit d27912a6; merged it without conflicts, preserving owner-only .local/ exclusion. No runtime change in merge.
- Next: continue approved reader completion; approved Bluesky slot activation pending under Current order; fresh X round after 21:00 UTC. Combined-check signal 143 recurs; standalone integration remains green.

## 2026-11-06: iteration 1030 — preserve contents visibility on resize

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; no leftover work, alerts clear and /healthz DB/Redis OK.
- Reader weakness: shrinking a desktop window hid the current contents entry below the panel (entry bottom 476 versus panel bottom 384). Sidebar resize observation now reveals it without moving the edition.
- Extended read-only saved-edition browser regression from 1280×900 to 1280×400, retaining forward/backward short-window coverage and asserting unchanged scroll position; light/dark passed. Broader desktop/mobile light/dark reader layout passed. Updated resize screenshots and visually inspected light.
- Passed pnpm build; pnpm exec tsx scripts/smoke-reader-short-contents.ts; pnpm exec tsx scripts/smoke-reader-layout.ts. Initial pnpm check stopped on script formatting during development; corrected before rerunning.
- Final pnpm check passed (562 unit/225 isolated integration), pnpm format and pnpm lint:fix passed; git diff --check clean. API/worker restarted; /healthz DB/Redis OK, alerts clear; saved edition remains four topics, 20 stories and 17 posts.
- Archived iteration 1014 to keep PROGRESS small. No source/schema/handbook-flow changes or paid calls; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: continue approved reader completion; approved Bluesky slot activation pending under Current order; fresh X round after 21:00 UTC.

- Push initially rejected by concurrent owner steering commits b5ad6a05/dc872f6e; merged without conflicts, preserving B2 readiness and lowest priority. No runtime changes in the merge.

## 2026-11-06: iteration 1031 — keep the mobile topic visible on resize

- Advanced item 33/43 while X items 39/34 wait until after 21:00 UTC. Started clean on main; no leftovers, alerts clear and /healthz DB/Redis OK.
- Reproduced offscreen active topic chips when the row narrows. Resize observation now reveals the active chip across desktop/mobile transitions and rotation, scrolling only the chip row.
- Read-only saved-edition Playwright regression covers 390/320/844/320 widths in light/dark, preserving reading position after responsive layout settles; screenshots updated and light visually inspected. Broader desktop/mobile light/dark reader checks passed.
- Passed pnpm format; pnpm lint:fix; pnpm build; pnpm exec tsx scripts/smoke-reader-chip-resize.ts; pnpm exec tsx scripts/smoke-reader-layout.ts; git diff --check. pnpm check passed static checks and 562 unit tests, then exited 143 during integration; standalone pnpm test:integration passed all 225 cases (exit 0).
- API/worker restarted; health and alerts clear. Saved edition retains four topics, 20 stories and 17 posts. No paid calls or source/schema/handbook-flow changes; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Archived iterations 1015–1016 to keep PROGRESS small. Next: continue final reader spec; approved Bluesky slot activation pending under Current order; fresh X round after 21:00 UTC.

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
