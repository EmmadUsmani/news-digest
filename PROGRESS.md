# Progress

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

## 2026-11-06: iteration 1058 — direct source links in saved X cards

- Clean main; no leftovers. Alerts clear, health DB/Redis OK, 36/36 sources healthy.
- Advanced item 33/43: saved X source URLs previously opened the X post; shared linked-text rendering now opens source destinations directly, preserving original text and original-post links.
- Preserve keyboard focus on any saved source link when official media replaces fallback text; updated existing embed recovery/sizing scripts.
- Saved-edition Playwright replay passed desktop/mobile light/dark with third-party requests blocked; screenshots updated. No paid calls or edition writes.
- Passed embed sizing and media retry/theme/resize replays, including source-link focus; inspected mobile screenshot. Build, format and lint:fix passed; initial full check terminated (143) during unit tests with no reported failure; rerun required.
- Fresh full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; format/typecheck/lint/boundaries green. git diff --check clean.
- API/worker restart and post-deploy health/alerts verification recorded below; next Nov 7 keyword production/three-edition acceptance, with World separate.
- Post-deploy app health OK, 36 sources healthy, saved edition 4 topics/20 stories/17 posts. GrafanaHealthFailed recurred at 22:11 with memory at 288 MiB reclaim ceiling; restarted, temporarily allowed 50% CPU for startup then restored 3%; endpoint database OK. Long-term recurrence remains open.

## 2026-11-06: iteration 1059 — repair Grafana cold-cache thrashing

- Started clean on main; no leftovers; initial alerts clear. Reproduced the recurrence before new work.
- Warm restart understated memory because executable cache remained charged outside the new unit. Targeted stopped-file posix_fadvise reproduced ~159 GiB disk reads/refault thrashing; smaller Go target and 352 MiB reclaim still failed.
- Runtime reclaim/max 288/320→448/512 MiB; Go 128→96 MiB, CPU remains 3%. Start/stop hooks temporarily allow 512/544 MiB and 50% CPU; 90-second bounded HTTP/database wait precedes restoring caps (READY arrives too early).
- Final cold start 22:33:25 UTC; 23:03:50 check (30.43 min): 61/61 probes, max 0.2032 s/final 0.0367 s, 416.7 MiB/0.81% mean CPU, no OOM/restarts. Initial 78 reclaim events unchanged after first minute; current pressure zero. Final process disk reads ~398 MiB.
- Stack 754.1 MiB, 2.05% five-minute CPU: ~500 MiB RAM target remains unmet. Updated STEERING ack, TASKS, NEEDS_FROM_HUMAN, capacity decision and observability handbook; archived iterations 1042–1043.
- Passed pnpm check (536 unit/226 isolated integration, exit 0), pnpm build, fresh pnpm typecheck, pnpm format and pnpm lint:fix. python3 ops/observability/test-grafana-health.py 4/4; vmalert-tool-prod unittest -files=ops/observability/alerts.test.yml passed; systemd-analyze verify clean.
- Legacy broad Grafana verifier hit telemetry guard, network-idle and historical worker-row assumptions; not claimed passing. Read-only pnpm exec tsx /tmp/nd-1059-grafana-smoke.ts passed 20 views/184 panels; /tmp/nd-1059-grafana-services.ts passed desktop/mobile live metric frames and charts. Saved two screenshots; inspected mobile.
- pnpm exec tsx scripts/check-handbook.ts observability passed (18 pages/28 tables); git diff --check clean. Installed unit/readiness helper match repository; Grafana restarted outside protected window and caps restored automatically.
- Post-repair obs health DB/Redis OK, sources --check 36/36, digest queue zero failed, saved edition 4 topics/20 stories/17 posts; alerts clear. No paid calls or edition writes.
- Next: resume owner-priority UI work while Nov 7 keyword production acceptance waits; whole-stack RAM target remains open.

## 2026-11-06: iteration 1060 — recover reader date navigation

- Clean main; no leftovers. Initial health DB/Redis OK, alerts clear and 36/36 sources healthy. X production acceptance waits for Nov 7.
- Advanced item 33/43: failed edition-history reads now offer a header retry instead of silently removing date arrows; edition and archive link stay available.
- History reads own retries; removed the enclosing retry layer. Retry remains visible/disabled during recovery and restores keyboard focus to a date link on success.
- Read-only saved-edition Playwright replay injects invalid history and repeated failure, then restores real saved history; desktop/mobile light/dark passed. Four screenshots saved; inspected mobile.
- No paid calls, external browser requests or edition writes. No handbook change: existing routes/data flow unchanged.
- Passed pnpm build (plus final web rebuild), pnpm format, pnpm lint:fix and full pnpm check: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- Passed pnpm exec tsx scripts/smoke-reader-date-recovery.ts and scripts/smoke-reader-position.ts; inspected final mobile recovery screenshot. git diff --check clean.
- API restarted for browser verification; health/alerts clear, 36/36 sources healthy, digest-generation queue available/zero failed; saved edition 4 topics/20 stories/17 posts.
- Next: continue item 33 reader work; Nov 7 keyword production/three-edition acceptance and approved Bluesky reserved-slot activation remain open. Whole-stack RAM target still unmet.
- Initial push rejected: concurrent lead-only updates in docs/lead/work/{observability,x-search}.md. Fetched and merged without changing owner files or rewriting history; application checks remain applicable. API/worker active and post-restart health/alerts clear.

## 2026-11-06: iteration 1061 — activate the approved Bluesky slot

- Clean main; no leftovers. Initial health/alerts clear, 36/36 sources healthy; X production acceptance waits for Nov 7.
- STEERING 40: reader weakness is full X sections excluding qualifying distinct Bluesky posts. Enabled the owner-approved reserved slot at 23:19 UTC, outside the protected window, for Nov 7 15:00 UTC.
- Only BLUESKY_RESERVED_SLOT_ENABLED changed in the private environment; every other byte and mode 600 verified, daily cap unchanged. Explicit opt-in/default-off behavior retained.
- Saved Nov 6 outcomes predate activation: Tech/NBA/Gaming no slots, World one distinct Bluesky pick/one unsupported drop; edition $0.286904 versus $0.501698 cap. No paid verification run or edition writes.
- Updated source inventory, social-post handbook, historical review, TASKS and resolved gate note; STEERING ack records approval and next three-edition review.
- Passed 22 focused Bluesky tests, pnpm check (536 unit/226 isolated integration, zero failures), pnpm build, pnpm format and pnpm lint:fix; git diff --check clean.
- Handbook initially exceeded 100 lines; cut redundant card description, then pnpm exec tsx scripts/check-handbook.ts social-posts passed (18 pages/28 tables); no diagrams changed.
- API/worker restarted; both process environments confirm flag=1. Immediate startup health probe raced readiness; repeat health DB/Redis OK, alerts clear, 36/36 sources healthy, digest queue available/zero failed.
- Next: resume final reader work; Nov 7 X acceptance and first reserved-slot edition review (per-topic outcomes/picks/replaced X/added cost). Three-clean-editions stop applies. Observability RAM target remains open.

## 2026-11-06: iteration 1062 — fill single-image Bluesky cards

- Advanced item 33/43 while Nov 7 X/Bluesky acceptance waits. Clean main; no leftovers; initial health/alerts clear and 36/36 sources healthy.
- Reader weakness: one Bluesky image occupied half a wide card because its grid always had two columns. Single-image posts now use the full row; multiple images retain two wide-screen columns and one mobile column.
- Saved World post currently has no media. Explicit synthetic one/two-image variants over saved data passed eight desktop/mobile light/dark cases; external requests blocked, GET-only, no paid calls or edition writes.
- Passed pnpm exec tsx scripts/smoke-reader-bluesky-grid.ts; four screenshots saved, desktop light inspected. Browser fixture initially used HTTP media rejected by contracts; corrected to intercepted HTTPS URLs and validated fixtures before navigation.
- First pnpm check stopped on formatting of the newly moved progress archive; formatted it and reran. Archived iterations 1044–1052 to keep this log small.
- No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Passed pnpm format, pnpm lint:fix, pnpm build, final pnpm check (536 unit/226 isolated integration, zero failures), scripts/smoke-bluesky-cards.ts and git diff --check; desktop light/mobile dark screenshots inspected.
- API/worker restarted; health DB/Redis OK, alerts clear, 36/36 sources healthy, digest queue available/zero failed. Saved edition remains four topics/20 stories/17 posts.
- Next: continue final reader work; Nov 7 fixed-keyword X and reserved-slot Bluesky acceptance await the scheduled edition. Observability RAM target remains unmet.

## 2026-11-06: iteration 1063 — identify Bluesky videos in the reader

- Advanced STEERING 33/43 while X/Bluesky scheduled acceptance waits for Nov 7. Clean main; no leftovers; initial health and alerts clear.
- Reader benefit: video thumbnails looked like still images. Added a contrasting play cue over previews and a compact underlined original-post action; videos without thumbnails retain their text action.
- Passed pnpm exec tsx scripts/smoke-reader-bluesky-video.ts: synthetic video over saved edition, desktop/mobile light/dark, original URL/target, play cue and no overflow; four screenshots saved, mobile light/desktop dark inspected.
- Synthetic media was intercepted locally, external requests blocked and GET-only; no paid calls or edition writes. No source/schema/system-flow changes; handbook, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Passed pnpm format, pnpm lint:fix, pnpm build and git diff --check. Full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- API/worker restarted; /healthz DB/Redis OK, pnpm obs alerts clear; saved edition remains four topics/20 stories/17 posts.
- Next: continue final reader work; Nov 7 keyword X and reserved-slot Bluesky acceptance await publication. Observability RAM target remains unmet.

## 2026-11-06: iteration 1064 — keep failed video previews readable

- Advanced STEERING 33/43 while Nov 7 X/Bluesky acceptance waits. Clean main, no leftovers; initial health/alerts clear.
- Reader weakness reproduced against the previous build: failed Bluesky video thumbnails left an absolute play badge over the short fallback. The badge now belongs to the preview; unavailable previews keep a clear original-post action on its own line.
- Expanded scripts/smoke-reader-bluesky-video.ts to 12 loaded/failed/missing-preview cases, desktop/mobile light/dark; checks link targets, badge state, fallback spacing and overflow. Synthetic fixtures only; no paid calls or edition writes.
- Browser fixture initially used undefined for a nullable thumbnail; corrected to null. Screenshot inspection caught touching fallback/action text; made fallback block-level and added a spacing assertion. Final browser replay and existing image-grid replay passed; four failure screenshots saved, mobile light/desktop dark inspected.
- Passed pnpm format, pnpm lint:fix, pnpm build and git diff --check. Full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- API/worker restarted; /healthz DB/Redis OK, pnpm obs alerts clear, 36/36 sources healthy, digest queue available/zero failed. Saved edition remains four topics/20 stories/17 posts.
- No source/schema/system-flow changes; handbook, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: continue final reader work; Nov 7 keyword X and reserved-slot Bluesky acceptance await publication. Observability RAM target remains unmet.

## 2026-11-06: iteration 1065 — repair quoted source URLs in post text

- Advanced STEERING 33/43 while Nov 7 scheduled X/Bluesky acceptance waits. Clean main, no leftovers; initial health/alerts clear.
- Reader weakness: closing straight/curly quotation marks became part of cited URLs, sending readers to a different destination. Link parsing now leaves closing quotes in prose while preserving internal apostrophes, balanced parentheses and saved text.
- Expanded scripts/smoke-bluesky-cards.ts with quoted URL and internal-apostrophe cases; desktop/mobile light/dark passed, screenshots refreshed and mobile light inspected. Synthetic fixtures only; no paid calls or edition writes.
- Passed pnpm format, pnpm lint:fix, pnpm build, git diff --check and full pnpm check: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- API/worker restarted after verification; /healthz DB/Redis OK and alerts clear. Sources 36/36 healthy; saved edition four topics/20 stories/17 posts. No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Next: continue final reader work; inspect first scheduled keyword X and reserved-slot Bluesky picks Nov 7. Observability RAM target remains unmet.

## 2026-11-07: iteration 1066 — fill small Bluesky image previews

- Advanced STEERING 33/43 while scheduled X/Bluesky acceptance awaits Nov 7 publication. Clean main, no leftovers; initial health and alerts clear.
- Reader weakness reproduced: media links filled the card but small thumbnails stayed at their intrinsic width. Images now fill the media column, retaining contain sizing and the 320 px height cap so portrait images stay fully visible.
- Expanded pnpm exec tsx scripts/smoke-reader-bluesky-grid.ts to 24 wide/small/portrait, single/multiple, desktop/mobile light/dark cases; all passed. Eight screenshots saved; small mobile light and portrait desktop dark inspected.
- pnpm exec tsx scripts/smoke-reader-bluesky-video.ts passed all 12 loaded/failed/missing-preview cases. Synthetic media over saved data, external requests blocked, GET-only; no paid calls or edition writes.
- Passed pnpm format, pnpm lint:fix, pnpm build and git diff --check. Initial pnpm check stopped on script formatting after lint:fix; corrected with Prettier. Final pnpm check: 536 unit/226 isolated integration passes; typecheck/lint/format/boundaries green.
- API/worker restarted; /healthz DB/Redis OK, pnpm obs alerts clear, pnpm obs sources --check 36/36 healthy; digest-generation queue available, zero failed. Saved edition remains four topics/20 stories/17 posts.
- No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Next: continue final reader work; inspect first scheduled keyword X and reserved-slot Bluesky picks Nov 7. Observability RAM target remains unmet.

## 2026-11-07: iteration 1067 — recognize mixed-case source URL schemes

- Advanced STEERING 33/43 while Nov 7 scheduled X/Bluesky acceptance waits. Clean main, no leftovers; initial health/alerts clear.
- Reader weakness reproduced in synthetic replay: uppercase HTTPS source URLs became ordinary post-text links to the social original. Shared X/Bluesky text rendering now recognizes HTTP schemes case-insensitively, preserving case-sensitive paths/query values and saved prose.
- Expanded pnpm exec tsx scripts/smoke-bluesky-cards.ts with uppercase/mixed-case URLs; desktop/mobile light/dark passed, eight screenshots refreshed; mobile light inspected. Synthetic fixtures only, no paid calls or edition writes.
- pnpm exec tsx scripts/smoke-reader-x-media.ts passed loading/failure/retry, resize and theme recovery. Initial final API read overlapped service restart and failed; rerun passed. Unrelated X screenshot churn discarded.
- Passed pnpm format, pnpm lint:fix, pnpm build and git diff --check. Initial full check terminated with SIGTERM during integration, without assertion failure; reran via temporary systemd user unit to outlive command session.
- Final pnpm check passed: 536 unit/226 isolated integration tests; typecheck/lint/format/boundaries green.
- API/worker restarted; /healthz DB/Redis OK, pnpm obs alerts clear, sources 36/36 healthy; pnpm obs jobs --check digest queue available/zero failed. Saved edition four topics/20 stories/17 posts.
- Corrected stale TASKS next-step note: keyword X and reserved Bluesky slot are enabled. No source/schema/system-flow changes; handbook, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: inspect first Nov 7 scheduled keyword X and reserved-slot Bluesky picks; continue approved reader work meanwhile. Observability RAM target remains unmet.

## 2026-11-07: iteration 1068 — recover Bluesky images after thumbnail failure

- Advanced STEERING 33/43 while Nov 7 scheduled X/Bluesky acceptance waits. Clean main, no leftovers; initial health/alerts clear.
- Reader weakness: a failed Bluesky thumbnail immediately hid the image despite a saved full-size URL. Image cards now try that original once before retaining the accessible unavailable-image link; identical URLs are not retried and video behavior stays intact.
- pnpm exec tsx scripts/smoke-reader-bluesky-image-recovery.ts passed 16 loaded/recovered/both-failed/same-URL cases across desktop/mobile light/dark. Four screenshots saved; mobile light inspected. Synthetic media over saved edition, GET-only/external requests blocked; no paid calls or edition writes.
- pnpm exec tsx scripts/smoke-reader-bluesky-video.ts passed 12 loaded/failed/missing-preview cases. Discarded unrelated video screenshot churn.
- Passed pnpm format, pnpm lint:fix, pnpm build and git diff --check. Initial lint flagged a test DOM type assertion; corrected to a typed query selector before final verification.
- Full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- Sources 36/36 healthy; digest queue available/zero failed. Saved edition four topics/20 stories/17 posts. No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Next: inspect first Nov 7 scheduled keyword X and reserved-slot Bluesky picks, costs and Tech repetition. Observability RAM target remains unmet.

## 2026-11-07: iteration 1069 — keep Japanese punctuation out of post links

- Advanced STEERING 33/43 while scheduled Nov 7 X/Bluesky acceptance waits. Clean main, no leftovers; initial health/alerts clear.
- Reader weakness reproduced: Japanese closing quotes/full stops became part of saved-post source URLs. Shared X/Bluesky rendering now excludes sentence punctuation and unmatched full-width closers, retaining original text, Japanese paths and balanced URL brackets.
- pnpm exec tsx scripts/smoke-bluesky-cards.ts reproduced the missing clean Japanese link before the fix; final desktop/mobile light/dark replay passed six new Unicode cases plus existing links/media. Eight screenshots updated; mobile light inspected.
- Initial post-fix browser run overlapped the asset rebuild and could not load a card; rerun after build passed. pnpm exec tsx scripts/smoke-reader-x-media.ts passed loading/failure/retry/theme/resize checks; unrelated X screenshot churn discarded.
- Passed pnpm format, pnpm lint:fix, pnpm build, git diff --check and full pnpm check: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- API/worker restarted; /healthz DB/Redis OK, pnpm obs alerts clear, sources 36/36 healthy; digest-generation queue available/zero failed. Saved edition remains four topics/20 stories/17 posts.
- Synthetic browser data only; no paid calls or edition writes. No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Next: review first Nov 7 scheduled keyword-X and reserved-slot Bluesky picks, costs and Tech repetition. Observability RAM target remains unmet.

## 2026-11-07: iteration 1070 — keep publisher links on the primary report

- Advanced STEERING 33/43 while Nov 7 scheduled X/Bluesky acceptance waits. Clean main, no leftovers; alerts clear, health DB/Redis OK, sources 36/36 healthy; digest queue zero failed.
- Reader weakness reproduced in browser: with two reports from one publisher, its source-row link opened secondary coverage instead of the headline article. Prefer the primary report for matching source labels; expanded coverage retains every article and its own destination.
- pnpm exec tsx scripts/smoke-reader-primary-source.ts failed against the old build with secondary/primary URL mismatch, then passed desktop/mobile light/dark after rebuilding. Four destination screenshots saved; mobile light inspected. Synthetic coverage over saved edition, GET-only/external requests blocked.
- pnpm exec tsx scripts/smoke-reader-layout.ts passed saved-content/navigation/coverage checks in all four layouts after updating its stale whole-post X link selector for the linked-text cards. Discarded unrelated layout screenshot churn.
- Passed pnpm format, pnpm lint:fix, pnpm build and git diff --check. Full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- systemctl --user restart news-digest-api news-digest-worker completed; curl --retry /healthz DB/Redis OK after startup; pnpm exec tsx scripts/obs.ts alerts clear and sources 36/36 healthy.
- No paid calls or edition writes. Saved edition four topics/20 stories/17 posts. No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Next: review first Nov 7 scheduled keyword-X and reserved-slot Bluesky picks, costs and Tech repetition. Observability RAM target remains unmet.

## 2026-11-07: iteration 1071 — read full post context on mobile

- Advanced STEERING 33/43 while Nov 7 scheduled X/Bluesky acceptance waits. Clean main, no leftovers; health/alerts clear and sources 36/36 healthy.
- Reader weakness: compact post context exposed its full text only on hover, leaving touch readers unable to read truncated notes. Native disclosures now expand/collapse by touch, Enter or Space while retaining one-line collapsed notes and duplicate-text suppression.
- pnpm exec tsx scripts/smoke-reader-post-context.ts passed touch/keyboard/collapse/wrapping checks in desktop/mobile light/dark. Four screenshots saved; mobile light inspected. Synthetic context over a saved edition, GET-only/external traffic blocked.
- Initial targeted smoke caught missing truncation; corrected the layout. Screenshot inspection caught bottom-aligned disclosure marker; replaced it with a top-aligned chevron. Final targeted replay passed.
- pnpm exec tsx scripts/smoke-reader-layout.ts passed all four layouts, contents/deep links/coverage/overflow. Initial run overlapped rebuilding and timed out on navigation; rerun after the final build passed. Discarded unrelated screenshot churn.
- Passed pnpm format, pnpm lint:fix, pnpm build, git diff --check and full pnpm check: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- API/worker restarted; curl --retry /healthz DB/Redis OK after startup; pnpm obs alerts clear, sources 36/36 healthy, digest queue zero failed. Saved edition four topics/20 stories/17 posts.
- No paid calls or edition writes. No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Initial push rejected: concurrent lead status-doc commit 7cb32a12 on origin/main. Merged without rewriting history; no application overlap.
- Next: review first Nov 7 scheduled keyword-X and reserved-slot Bluesky picks, costs and Tech repetition. Observability RAM target remains unmet.
