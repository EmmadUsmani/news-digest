# Progress

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

## 2026-11-06: iteration 1047 — retain failed-image descriptions

- Advanced item 33/43 while X rounds wait until after 21:00 UTC. Started clean on main; alerts clear, all 36 sources healthy, digest queue zero failed runs.
- Failed Bluesky thumbnails previously replaced their saved alt text with a generic image link. Preserve that description in the link's accessible name so screen-reader readers can identify the image before opening it; video preview descriptions are retained too.
- Discarded an initial missing-thumbnail change: browser fixture validation showed image thumbnails are required by the contract. No contract expansion or source changes.
- Updated synthetic browser replay to assert the described failed-image link, original destination and keyboard focus across desktop/mobile light/dark; screenshots refreshed. No paid calls or edition writes.
- Passed pnpm format; pnpm lint:fix; pnpm build; pnpm check through formatting/typecheck/lint/boundaries and 562 unit tests. Full check exited 143 during integration; separate isolated integration result follows. Rebuilt and reran format/lint after correcting the initial change.
- Browser commands: pnpm exec tsx scripts/smoke-bluesky-cards.ts; pnpm exec tsx scripts/smoke-reader-bluesky-links.ts; both passed all four views. Screenshots regenerated with no pixel changes; mobile failed-image view inspected.
- API/worker restarted; /healthz DB/Redis OK, alerts clear, latest edition four topics/20 stories/17 posts. Initial health request preceded socket startup; retry passed. Archived iteration 1032; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Separate pnpm test:integration passed 225/225 (exit 0); git diff --check passed. No blockers; next continue approved reader work until the fresh X round after 21:00 UTC; fixed search OFF.

## 2026-11-06: iteration 1048 — repair prose-wrapped post links

- Advanced item 33/43 while fresh X rounds wait until after 21:00 UTC. Started clean on main; alerts clear, API health DB/Redis OK.
- Bluesky saved-text URLs now exclude unmatched closing parentheses/brackets/braces from surrounding prose while retaining balanced URL delimiters. Displayed saved text remains unchanged.
- Extended synthetic browser replay with parenthesized/bracketed links and a balanced Wikipedia URL. Desktop/mobile light/dark passed; eight screenshots updated, mobile light inspected. No paid calls, external requests or edition writes.
- Passed pnpm format; pnpm lint:fix; pnpm build; pnpm exec tsx scripts/smoke-bluesky-cards.ts. pnpm check passed typecheck/lint/format/boundaries and 562 unit tests, then exited 143 during integration. Separate integration result follows.
- SOURCES, NEEDS_FROM_HUMAN and handbook unchanged: no source/schema/system-flow changes.
- Separate pnpm test:integration passed 225/225 (exit 0); git diff --check passed. API/worker restarted; health DB/Redis OK, alerts clear, saved edition four topics/20 stories/17 posts. Archived iteration 1033. No blockers; next final reader work, then fresh X round after 21:00 UTC.

## 2026-11-06: iteration 1049 — readable mobile post media

- Advanced item 33/43 while X rounds wait until after 21:00 UTC. Started clean on main; alerts clear and /healthz DB/Redis OK.
- Bluesky media's automatic columns squeezed images beside other media on phones. Narrow cards now use full-width rows; wider cards use at most two columns based on card width, preserving original-image links.
- Extended synthetic browser replay with media-position assertions; desktop/mobile light/dark passed, four changed screenshots updated, mobile light inspected. No external image requests, paid calls or edition writes.
- Passed pnpm format; pnpm lint:fix; pnpm build; pnpm exec tsx scripts/smoke-bluesky-cards.ts. Full check result recorded below.
- SOURCES, NEEDS_FROM_HUMAN and handbook unchanged: no source/schema/system-flow changes. Next: fresh X rounds after 21:00 UTC; fixed search stays OFF.
- pnpm check passed (562 unit/225 integration); git diff --check passed. API/worker restarted; health OK, alerts clear; four topics/20 stories/17 posts intact. No blockers.

## 2026-11-06: iteration 1050 — second fresh-window X round

- Advanced items 39/34: Nov 5–6 21:00 UTC round complete. Started clean on main; alerts/health/sources OK, digest queue no failures. No leftover work.
- Direct configured Grok 4.3, existing caps/required tool/120 s deadline; ten attempts settled $0.442837, 61 unique candidates all officially embed-verified. No new unresolved holds; lifetime charged $1.468639/$2.50.
- Tech keyword failed twice; continued only never-attempted cells. NBA recovered on its one retry; Gaming/World and all semantic cells succeeded. Failure rate 3/10 attempts; keyword 1/4 cells still failed after retries. No third attempts.
- Four production Haiku verification calls scored all 61 saved posts, zero unscored, $0.005013. Usable keyword Tech/NBA/Gaming/World 0 (failed)/3/3/0; semantic zero. World separate; no threshold/query/model changes.
- Read-only baseline: five production calls/$0.157475/19 posts. Retained free snapshot 1,188 rows/1,022 unique IDs; three NBA keyword overlaps excluded. No old search rerun, ingestion or edition writes.
- Commands: prepare-x-experiment, run-x-experiment (one continuation), extract-x-experiment, report-x-experiment; private oEmbed/scorer/snapshot scripts. Full review and SHA-256-linked private evidence saved. Archived iterations 1034–1035.
- pnpm check passed: typecheck/lint/format/boundaries, 562 unit and 225 integration tests. pnpm format, pnpm lint:fix, pnpm build and git diff --check passed; API/worker restarted, health DB/Redis OK, alerts clear, saved edition four topics/20 stories/17 posts.
- Next: compare saved Nov 5/6 old-search baselines under the same usable rule, apply the plan decision; fixed search OFF, no winner/activation. Handbook unchanged: no system-flow change.

## 2026-11-06: iteration 1051 — complete X experiment decision

- Started clean on main; alerts clear, /healthz DB/Redis OK, all 36 sources healthy; latest digest completed, next Nov 7 scheduled. No leftover work.
- Compared original Nov 5/6 production baseline snapshots offline: 38 daily citations, 31 unknown likes, seven known below saved minimums; zero usable regardless of other gates. Nine calls/$0.300666; no old-search rerun or paid scoring.
- Keywords yield nine usable across rounds (Tech/NBA/Gaming 2/3/4), World zero separately. Approved rule passes: ship keywords; semantic zero additions, dropped. Decision ack saved; fixed search stays OFF pending verified rollout.
- Explicit reliability: post-fix keyword failures 5/9 attempts (55.6%), three of seven post-fix topic/day cells failed after allowed rerun/retry; no additional experiment rounds or third attempts.
- Private baseline-comparison-1051.json records per-topic likes/counts and original snapshot SHA-256 hashes. Updated TASKS/SOURCES/NEEDS_FROM_HUMAN; handbook unchanged because runtime is unchanged.
- Passed pnpm format, pnpm lint:fix, pnpm build and full pnpm check (562 unit/225 integration, exit 0); git diff --check clean. API/worker restarted; health DB/Redis OK, alerts clear; saved edition four topics/20 stories/17 posts. No ingestion or edition writes. Archived iteration 1036.
- Next: production keyword adapter/result-limit/admission cleanup, remove old open/follow-up/reaction paths, then enable outside 13:00–16:00 UTC; three-edition acceptance remains open. No human blocker.

## 2026-11-06: iteration 1052 — preserve keyword result engagement

- Started clean on main; alerts clear, health DB/Redis OK and API/worker active. No leftover work.
- Advanced items 39/34 rollout: shared ten-result prompt/citation limit matches both saved rounds; 4,000 output tokens retained.
- Fixed engagement parser's five-item-array rejection: disabled keyword adapter now retains reported metrics for all ten cited posts. Legacy requests keep their five-item bound.
- Offline protocol test covers ten observations, eleventh-link cutoff and all eleven fetched-post charges; focused viral/engagement tests passed 6/6.
- Initial direct x-search test invocation hit five disposable-DB guards; full check uses the supported isolated runner. No live DB tests or paid calls.
- Fixed search remains OFF; no edition writes. Cleanup, admission proof and activation remain next; three-edition acceptance open.
- SOURCES/TASKS updated; handbook unchanged (internal disabled-adapter fix); no human blocker.
- pnpm format, pnpm lint:fix and pnpm build passed; lint auto-fix changed one layout, re-formatted before successful full pnpm check (562 unit/225 integration). git diff --check clean.
- API/worker restarted; health DB/Redis OK, alerts clear, 36 sources healthy, digest queue zero failures/Nov 7 scheduled; saved edition four topics/20 stories/17 posts unchanged.

## 2026-11-06: iteration 1053 — prove keyword admission and fix completion crash

- Started clean on main; alerts clear, health DB/Redis OK, 36 sources healthy, no failed digest runs; no leftover work.
- Added production-runtime/real-ledger isolated proof: four topics, retained timeout hold, one linked retry, settlement, restart and durable duplicate refusal with funds available. Fake responses only; no paid calls or edition writes.
- Initial integration run exposed a real rollout blocker: keyword verification invoked the legacy open-search completion gate and threw. Fixed completion eligibility; official citation verification remains mandatory.
- Proof charges $0.200016 plus $0.10 retained hold under unchanged $0.40/day cap; reconciliation restores $0.199984 and restart still makes no duplicate calls.
- Passed focused runtime/verification tests 10/10, pnpm format, pnpm lint:fix, pnpm build and full pnpm check (562 unit/226 isolated integration; exit 0); git diff --check clean.
- TASKS/SOURCES updated; archived iteration 1037. Handbook unchanged: bug fix, no new system flow. No human blocker.
- Next: remove legacy open/follow-up/reaction paths, finish rollout, then activate outside 13:00–16:00 UTC. Fixed search remains OFF; three-edition acceptance open.

## 2026-11-06: iteration 1054 — remove legacy production search fallback

- Started clean on main; alerts clear, health DB/Redis OK, all 36 sources healthy; no leftover work.
- Removed legacy open-topic/account/reaction fallback from the production runtime and its worker wiring; OFF now exits before configuration reads or paid work. Standalone historical helpers remain for subsequent cleanup.
- Replaced obsolete fallback tests with disabled/missing configuration coverage; retained keyword dispatch/retry tests and real-ledger four-topic proof. No paid calls or edition writes.
- Updated social handbook and SOURCES/TASKS; fixed search remains OFF.
- Passed focused runtime tests 3/3, pnpm format, pnpm lint:fix, pnpm build and full pnpm check (558 unit/226 isolated integration); initial duplicate-import lint failure corrected. Handbook check passed after cutting one over-limit line; unchanged diagram.
- Archived iteration 1038. Next: remove remaining standalone legacy search helpers/adapter branches, then activate outside 13:00–16:00 UTC; earliest edition Nov 7. No human blocker.
- API/worker restarted active; health DB/Redis OK, alerts clear, 36 sources healthy; digest worker available/zero failed runs and saved four-topic edition readable.

## 2026-11-06: iteration 1055 — delete obsolete paid-search orchestration

- Started clean on main; alerts clear, health DB/Redis OK and 36 sources healthy. No leftover work.
- Removed unused pre-keyword scheduler, optional follow-up orchestration and story-reaction request planner, plus obsolete tests. Saved account lists, historical experiment story inputs/replay and ledger history retained.
- Focused runtime/historical story tests passed 6/6; no paid calls or edition writes. Fixed search remains OFF.
- TASKS/SOURCES updated; handbook unchanged (unused implementation removal). Archived oldest progress entry.
- Next: remaining adapter branch cleanup, then activate for Nov 7; three-edition acceptance remains open.
- Passed pnpm format, pnpm lint:fix, pnpm build and full pnpm check (535 unit/226 isolated integration; exit 0); git diff --check clean.
- API/worker restarted active; health DB/Redis OK, alerts clear and saved four-topic edition readable; digest queue available with zero failures. No human blocker.

## 2026-11-06: iteration 1056 — restrict production X adapter to keywords

- Started clean on main; no leftovers; alerts clear, DB/Redis healthy, all 36 sources OK and digest queue zero failures.
- Production rejects legacy open/account/reaction requests before HTTP; moved historical dispatch into a replay adapter and removed obsolete manual curated-account paid command. Keyword logs now identify keyword discovery.
- Added no-HTTP rejection coverage; retained ten-citation/engagement production proof and historical five-result replay. No paid calls or edition writes; fixed search remains OFF.
- Focused tests 9/9; initial broad direct runner correctly rejected DB tests without isolation. Full pnpm check passed 536 unit/226 isolated integration tests (exit 0).
- Passed pnpm format, pnpm lint:fix, pnpm build, handbook check (18 pages/28 tables) and git diff --check. Updated TASKS/SOURCES/social handbook; archived iteration 1040.
- Next: activate approved keyword rollout for Nov 7; three-edition acceptance remains open. No human blocker.

## 2026-11-06: iteration 1057 — activate approved keyword discovery

- Started clean on main; alerts clear, health DB/Redis OK and all 36 sources healthy. No leftover work.
- Enabled private X_FIXED_SEARCH_ENABLED=1 after the approved decision, cleanup and real-ledger admission proof; API/worker restarted and both process environments confirm ON.
- First eligible window Nov 7 14:30–14:55 UTC for the 15:00 edition; all four live thresholds checked, NBA exclusions plus code-enforced -giveaway retained. Grok 4.3/caps unchanged.
- Restart made no paid calls: ledger unchanged at $0.157475 today/$0.610551 month, zero held. Saved edition remains four topics/20 stories/17 posts; no edition writes.
- Updated TASKS/SOURCES and social/schedule handbook; activation ack appended to STEERING. Three-edition acceptance remains open; World reported separately.
- Passed pnpm format, pnpm lint:fix, pnpm build and full pnpm check (536 unit/226 isolated integration, exit 0); both affected handbook checks passed (18 pages/28 tables), git diff --check clean.
- Post-restart /healthz DB/Redis OK, pnpm obs alerts clear, pnpm obs sources --check 36/36 healthy; digest queue available/zero failed. No human blocker; next inspect Nov 7 keyword calls and edition.
