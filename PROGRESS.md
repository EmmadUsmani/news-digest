## 2026-11-05: iteration 724 — revised X saved-response extractor

- Started clean on main; no leftover work. Zero alerts, health/database/Redis green, all 36 sources healthy; zero failed digest jobs, next edition Nov 5 15:00 UTC. Two retained ingestion failures have no retained run details; current source health is green.
- Offline extractor now accepts viral/semantic saved requests and their saved likes threshold without requiring unused historical reaction settings. Historical reaction extraction still requires its threshold.
- Retains all 16 viral/eight semantic citations and explicitly leaves free-link overlap unknown, alongside relevance/promotion labels. No invented usable yield; settlement/settings failures write no partial evidence.
- Verification: targeted extractor tests 5/5; pnpm format, pnpm lint:fix, full pnpm check (485 unit, 213 isolated integration, exit 0), pnpm build and git diff --check passed. First check caught formatting of newly archived progress; formatted and reran successfully.
- Updated TASKS and experiment reference; archived iteration 710 to keep PROGRESS small. SOURCES/NEEDS_FROM_HUMAN unchanged; no source change or new owner blocker. No UI changes/screenshots required.
- Healthy services left running under STEERING 22: only offline scripts/tests/docs changed. No paid calls, scorer/cache changes, provider/model/budget changes or activation.
- Next: migrate round comparison before Nov 5/6 rounds after 21:00 UTC; scheduled acceptance takes priority when due, scorer only afterward.

## 2026-11-05: iteration 725 — revised X round comparison

- Started clean on main; no leftover work. Zero alerts, health/database/Redis green, reader HTTP 200, all 36 sources healthy and no failed retained digest runs. Nov 5 scheduled acceptance remains future at 15:00 UTC.
- Offline comparator now accepts eight-cell viral/semantic rounds, requiring a full 24-hour window. Preserves historical three-style reports; mixed designs fail and cannot establish two-day coverage together.
- Reports usable style totals and per-topic viral/semantic counts plus semantic-only usable IDs, including World separately. Incomplete rounds or missing review evidence keep totals unknown. Raw promotions exclude their own posts without disqualifying usable peers; no automatic winner or invented baseline.
- Verification: targeted comparison/CLI tests 19/19; pnpm format, pnpm lint:fix, pnpm check (490 unit/213 isolated integration, exit 0) and pnpm build passed; git diff --check clean. No UI changes or screenshots needed.
- Updated TASKS and experiment reference; archived iteration 711 to keep PROGRESS bounded. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new owner blocker. Healthy services left running under STEERING 22; only offline scripts/tests/docs changed.
- No paid calls, scorer/cache changes, provider/model/budget changes or production activation. Next: scheduled Nov 5 acceptance first, then scorer; rounds after 21:00 UTC Nov 5/6 with same-day old-search baseline review.

## 2026-11-05: iteration 726 — shared saved-edition queries

- Started clean on main; no leftover work. Zero alerts, health/database/Redis green, all 36 sources returning items, zero failed retained digest jobs. Nov 5 scheduled acceptance remains future at 15:00 UTC; two old ingestion failures remain without retained run details, current sources healthy.
- Continued approved UI foundations while X/scorer work waits on scheduled times. Saved editions, latest and paged history now use validated, abortable TanStack Query resources, separate cache keys and route prefetch. Completed generation invalidates edition/history data; history retry uses query refetch.
- Read-only Playwright checks passed on desktop/mobile: real saved editions, reload, legacy redirect, cached switching without repeat historical reads, reserved paths and no browser errors. Intercepted malformed edition responses show errors with no stale edition or false empty-state message. Updated and inspected both screenshots in docs/screenshots/ui/.
- Verification: pnpm format, pnpm lint:fix, pnpm check (490 unit/213 isolated integration), pnpm build, pnpm exec tsx scripts/smoke-ui-routing.ts, pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime and git diff --check. Handbook check: 18 pages, one unchanged diagram, 26 tables, no errors.
- Updated TASKS and Stack & runtime; archived iteration 712 to keep PROGRESS bounded. SOURCES/NEEDS_FROM_HUMAN unchanged: no source changes or new owner blocker. Rebuilt and restarted API/docs; worker/schema unchanged and healthy.
- No paid calls, scorer/cache version changes, provider/model/budget changes or X activation. Next: Tailwind/shadcn, Inter/theme foundations while waiting; Nov 5 scheduled review first when due, then scorer and evening X rounds.

## 2026-11-05: iteration 727 — Tailwind, shadcn buttons and Inter

- Started clean on main; no leftover work. Zero alerts, health/database/Redis green, all 36 sources returning items and zero failed digest jobs; scheduled Nov 5 acceptance remains future at 15:00 UTC.
- Added Tailwind v4 PostCSS integration, neutral button tokens, shadcn/ui configuration and Radix-based button primitives. Digest controls use the shared button with keyboard focus and disabled states. Existing page CSS stays in a legacy layer below utilities; layout preserved.
- Inter is self-hosted in the bundle; no font CDN. Added lucide and shared class merging for subsequent approved components. Theme remains the next foundation step before the admin gate.
- Read-only desktop/mobile Playwright checks passed against actual saved editions, including loaded Inter and compiled button utilities; updated and inspected both route screenshots. No generation or external paid calls.
- Verification: pnpm format, pnpm lint:fix, pnpm check (490 unit/213 isolated integration, exit 0), pnpm build, pnpm exec tsx scripts/smoke-ui-routing.ts, pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime and git diff --check.
- Updated TASKS and Stack & runtime; archived iteration 713 to keep PROGRESS bounded. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new owner blocker. Rebuilt/restarted API/docs; worker/schema unchanged.
- Next: theme foundation while waiting; scheduled acceptance first when due, scorer after the edition, fresh X rounds after 21:00 UTC Nov 5/6. No provider/model/budget changes or activation.

## 2026-11-05: iteration 728 — system and saved light/dark theme

- Started clean on main; no leftover work. Zero alerts, services/health/database/Redis green, all 36 sources healthy; no failed retained digest runs. Existing ingestion/social failed counters have no retained failed run details; current sources healthy. Nov 5 acceptance remains future at 15:00 UTC.
- Finished theme foundations: neutral light/dark tokens across the existing page, class-based Tailwind dark utilities, accessible header toggle and pre-render preference application. System preference is default, explicit choice persists across reloads/tabs; unavailable storage still permits toggling.
- Read-only Playwright desktop/mobile theme and routing checks passed against real stored editions: system changes, saved override, cross-tab sync, blocked storage, no overflow/browser errors. Four light/dark screenshots added and routing screenshots refreshed in docs/screenshots/ui/; inspected screenshots.
- Verification: pnpm format, pnpm lint:fix, pnpm check (490 unit/213 isolated integration), pnpm build, pnpm exec tsx scripts/smoke-ui-theme.ts, pnpm exec tsx scripts/smoke-ui-routing.ts, pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime and git diff --check.
- Updated TASKS and Stack & runtime; archived iteration 714 to keep PROGRESS bounded. SOURCES/NEEDS_FROM_HUMAN unchanged: no source changes or new owner blocker. Rebuilt/restarted API/docs; worker/schema unchanged and healthy.
- No paid calls, scorer/cache changes, provider/model/budget changes or X activation. Next: step 2 server-side admin gate while waiting; Nov 5 scheduled review first when due, scorer afterward, fresh X rounds after 21:00 UTC Nov 5/6.

## 2026-11-05: iteration 729 — admin identity and reserved-route gate

- Started clean on main; no leftover work. Zero alerts, health/database/Redis green, 13 services healthy, all 36 sources healthy and no failed retained digest runs. Nov 5 acceptance remains future at 15:00 UTC; existing ingestion/social failure counters have no retained failed details.
- Started UI step 2: server middleware before static/tool routing, exact configured admin email matching, uncached GET /api/me, and 404 protection for reserved /admin and /api/admin paths. Local token requires a direct loopback socket without forwarding headers; socket locality alone never grants access.
- ADMIN_EMAILS/ADMIN_LOCAL_TOKEN absent; no owner identity inferred or secrets created. Documented proxy headers read; VM request to public app failed (curl 7), so socket-origin and forged-header replacement remain unverified. Existing operational routes/tools intentionally await coordinated endpoint/UI/script migration; full admin milestone remains open.
- Two new security HTTP/unit tests cover identities, token failures, forwarded sockets, method/path variants and uncached identity. pnpm format, pnpm lint:fix, pnpm check (492 unit/213 isolated integration), pnpm build, handbook validation and git diff --check passed. Initial handbook length failure fixed by shortening Operations.
- Rebuilt/restarted API/docs; live HTTP checks passed for health, identity, admin denial, current edition/status/docs. Initial smoke used planned /api/editions/latest (404); corrected to existing /api/digest-previews/latest. Read-only desktop/mobile Playwright passed: real saved edition, no overflow/page errors, server-side admin 404. No UI visual changes or screenshot updates.
- Updated TASKS, NEEDS_FROM_HUMAN, access decision, Stack/runtime and Operations. Archived iterations 715–716 to keep PROGRESS bounded. SOURCES unchanged; no source change, paid calls, provider/model/budget changes or X activation.
- Next: configure admin identity before migrating existing operational endpoints, reader payloads and tools; scheduled Nov 5 acceptance first when due, scorer afterward, fresh X rounds after 21:00 UTC Nov 5/6.

## 2026-11-05: iteration 730 — reader-only edition payloads

- Started clean on main; no leftover work. Zero alerts, health/database/Redis green, 13 services and all 36 sources healthy; no retained failed digest runs. Nov 5 scheduled acceptance remains future at 15:00 UTC.
- Prepared GET /api/editions/latest and /api/editions/:id with shared explicit allowlist contracts. Stories/posts retain display content and engagement, excluding scores, reasons, significance notes, candidate counts, model details and triage. Historical missing posts/briefs become empty arrays; non-AI briefs are hidden. Saved snapshots stay unchanged.
- Added projection/missing-edition unit coverage and isolated real HTTP checks for sanitized responses, UUID validation and missing IDs. Current browser/operational endpoints remain unchanged pending the coordinated admin migration; reader archive remains open.
- Verification: pnpm format, pnpm lint:fix, pnpm check (494 unit/213 isolated integration, exit 0), pnpm build, pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime, pnpm exec tsx scripts/smoke-ui-routing.ts and git diff --check. Read-only desktop/mobile routing passed; no visual change or screenshot update.
- Rebuilt/restarted API/docs; live health and reader latest/by-ID checks passed against the real saved edition: four topics, 14 stories, 15 posts, no extra fields. Final restart health green; one pending ObservabilityMemoryBudget warning (obs-metrics 104.9/112 MiB, active/zero restarts), no firing alerts; worker/schema unchanged.
- Updated TASKS, Stack/runtime and access decision. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. Admin identity configuration and proxy-origin/spoof verification remain open.
- No paid calls, provider/model/budget changes, scorer changes or X activation. Next: reader archive preparation while identity is unresolved; Nov 5 scheduled acceptance first when due, scorer afterward, fresh X rounds after 21:00 UTC Nov 5/6.

## 2026-11-05: iteration 731 — reader archive payloads

- Started clean on main; no leftover work. Health/database/Redis, 13 services and 36 sources healthy; no retained failed digest runs. One pending metrics memory warning, no firing alerts. Nov 5 acceptance and fresh X windows remain future.
- Added GET /api/editions?offset=0 with explicit shared reader-history allowlist: IDs, creation/window dates and hasMore only. Reuses stable 20-entry repository pages; generation methods and future operational fields are stripped. Browser/admin migration remains open.
- Added isolated HTTP assertions matching existing history pagination, empty high-offset pages, exact field filtering and five invalid offsets. Existing latest/by-ID checks remain unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check (494 unit/213 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime, pnpm exec tsx scripts/smoke-ui-routing.ts and git diff --check passed.
- Rebuilt/restarted API/docs. Live read-only checks passed across ten archive pages/200 stored editions, allowed fields, invalid offsets and health. Desktop/mobile routing passed with real saved editions and no writes; no visual changes or screenshot updates.
- Updated TASKS, affected handbook and access decision; archived iteration 717 to keep PROGRESS bounded. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. Admin identity/proxy verification remains open.
- No paid calls, provider/model/budget changes, scorer changes or X activation. Next: coordinated reader/admin migration; scheduled Nov 5 acceptance first when due, scorer afterward, fresh X rounds after 21:00 UTC Nov 5/6.

## 2026-11-05: iteration 732 — browser reader history and completion race

- Started clean on main; no leftover work. Zero initial alerts, health/database/Redis and all 36 sources healthy; no retained failed digest runs. Nov 5 acceptance remains future at 15:00 UTC.
- Browser saved-edition history now uses /api/editions with reader allowlist validation and no generation-method display; edition detail/admin endpoints remain pending coordinated migration and configured admin identity.
- Delayed-history smoke exposed a completion stall: invalidation could await the first in-flight archive request. Explicitly cancel stale history before invalidating; delayed success/error cases now pass. Updated smoke synchronization to await delayed route handlers because navigation legitimately aborts HTTP responses.
- Verification: pnpm format, pnpm lint:fix, pnpm check (494 unit/213 isolated integration), pnpm build, final web build/typecheck, check-handbook.ts 01-stack-and-runtime, smoke-ui-routing.ts, smoke-edition-history.ts, smoke-edition-selection.ts and git diff --check. Desktop/mobile pagination, cache switching, reload and stale success/error recovery passed.
- Initial browser launch raced API startup (ECONNREFUSED); reran after health readiness. Rebuilt/restarted API/docs; real stored history page 2 returned 20 entries with only IDs/dates. Updated and inspected history screenshots; discarded unrelated foundation screenshot churn.
- Metrics warning became firing at the post-push check (106.3/112 MiB, active/zero restarts); app health remains green. Worker unchanged. Updated TASKS, affected handbook/access decision; archived iteration 718 to keep PROGRESS bounded. SOURCES/NEEDS_FROM_HUMAN unchanged; no new source or owner blocker.
- No paid calls, provider/model/budget changes, scorer changes or X activation. Next: coordinated reader/admin migration; scheduled Nov 5 acceptance first when due, scorer afterward, fresh X rounds after 21:00 UTC Nov 5/6.

## 2026-11-05: iteration 733 — reader edition content without diagnostics

- Started clean on main; no leftover work. Health/database/Redis green, 36 sources healthy, no retained failed digest runs; Nov 5 edition remains scheduled for 15:00 UTC. Existing metrics memory warning firing (active, zero restarts, ~109.5/112 MiB); no ceiling change or restart to hide it.
- Browser latest/by-ID queries now validate sanitized reader contracts. Stories retain summaries, source/date and related coverage; posts retain text, media and engagement. Removed generation method, models, selection scores/reasons, omissions, evidence excerpts and significance diagnostics from edition content. Stored editions/operational APIs unchanged; full admin migration still awaits configured identity.
- Extended routing smoke to reject legacy edition requests and check real saved story rendering without diagnostics. Updated delayed-selection interception; generation smoke exposed its stale query-string assertion, corrected to await canonical /editions/:id navigation.
- Verification: pnpm format, pnpm lint:fix, pnpm check (494 unit/213 isolated integration, exit 0), pnpm build, check-handbook.ts 01-stack-and-runtime, smoke-ui-routing.ts, smoke-edition-selection.ts, smoke-edition-history.ts, smoke-edition-jobs.ts and git diff --check all passed. Live reader latest returned four topics/14 stories/15 posts and zero diagnostic fields; health green.
- Saved and inspected reader-content desktop/mobile light/dark screenshots. Browser reads use real stored editions; generation/completion states are intercepted, with no writes or inference. Discarded incidental foundation/job screenshot churn.
- Updated TASKS, affected runtime handbook/access decision; archived iteration 719 to keep PROGRESS bounded. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. API/docs rebuilt/restarted; worker/schema unchanged.
- No paid calls, provider/model/budget changes, scorer changes or X activation. Next: configured admin identity and coordinated migration; Nov 5 scheduled acceptance first when due, scorer afterward, fresh X rounds after 21:00 UTC Nov 5/6.

## 2026-11-05: iteration 734 — protected admin API aliases

- Started clean on main; no leftover work. Health/database/Redis, 13 services and 36 sources healthy; zero retained failed digest jobs. Metrics memory warning initially firing, later pending; no observability restart or limit change. Nov 5 edition remains due at 15:00 UTC.
- Prepared protected /api/admin aliases for topics, profile/schedule, status, content/sources and digest previews/jobs using the existing controllers. Legacy routes remain available until configured identity and coordinated UI/script/tool cutover; this is not completed admin isolation.
- Added isolated real-HTTP parity checks for eight reads, denied reads/writes, authorized topic create/update/delete and public reader access. Existing characterization tests unchanged; no live writes or inference.
- Verification: pnpm format, pnpm lint:fix, pnpm check (494 unit/214 isolated integration), pnpm build, check-handbook.ts 01-stack-and-runtime, smoke-ui-routing.ts and git diff --check passed. Desktop/mobile routing uses real saved editions; discarded incidental unchanged-UI screenshot churn.
- Rebuilt/restarted API/docs. Initial immediate health probe raced startup; readiness retry and pnpm obs health --check passed. Live six admin paths denied, /api/me denied identity, and reader latest returned four topics/14 stories/15 posts. Worker/schema unchanged.
- Updated TASKS, runtime handbook and access decision; archived iteration 720 to keep PROGRESS bounded. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker.
- No paid calls, model/provider/budget changes, scorer work or X activation. Next: configured admin identity, UI/script migration and tool gate together; scheduled Nov 5 acceptance first when due, scorer afterward, fresh X rounds after 21:00 UTC Nov 5/6.

## 2026-11-05: iteration 735 — prevent caching identity-dependent admin responses

- Started clean on main; no leftover work. Health/database/Redis, 13 services and 36 sources healthy; zero retained failed digest runs. Existing metrics memory warning pending; no ceiling change or observability restart. Nov 5 edition remains due at 15:00 UTC.
- Protected /admin and /api/admin responses now use no-store and vary on both identity headers before downstream handling, covering authorized reads/writes/pages and errors as well as denied requests. Reader caching policy unchanged. Legacy routes/tools remain pending coordinated migration and configured identity.
- Expanded real-HTTP gate checks for email/token identity, HEAD, downstream 404/500 and reader isolation; isolated controller parity checks assert cache headers on protected reads and topic creation. No live writes or inference.
- Verification: targeted admin-access tests 2/2; pnpm format, pnpm lint:fix, pnpm check (494 unit/214 isolated integration, exit 0), pnpm build, check-handbook.ts 01-stack-and-runtime and git diff --check all passed.
- Rebuilt/restarted API/docs; readiness retry and pnpm obs health --check passed. Live three admin paths returned 404/no-store/identity Vary, reader latest returned four topics. Worker/schema/UI unchanged; no screenshot changes needed. Final alerts zero.
- pnpm obs jobs --check with filters was rejected; corrected read-only jobs command confirmed no failed digest runs. Historical ingestion/social queue failure counts persist with current source health green.
- Updated TASKS and access decision; archived iteration 721 to keep PROGRESS bounded. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new owner blocker. No paid calls, model/provider/budget changes, scorer work or X activation.
- Next: configured admin identity, UI/script migration and tool gate together; scheduled Nov 5 acceptance first when due, scorer afterward, fresh X rounds after 21:00 UTC Nov 5/6.

## 2026-11-05: iteration 736 — authenticated local operations reads

- Started clean on main; no leftover work. Health/database/Redis green, 36 sources healthy, zero failed retained digest runs; Nov 5 edition due at 15:00 UTC. Metrics memory warning later pending; no ceiling change or observability restart.
- Installed a random ADMIN_LOCAL_TOKEN in the private mode-600 env file without exposing it. API loads it after restart; owner email allowlist remains unconfigured.
- Sources/jobs CLI queries now use /api/admin/status with a reusable local credential adapter. It reads credentials only for the fixed loopback protected API origin, preserves request headers, rejects missing/invalid tokens and refuses redirects. No legacy-route fallback.
- Isolated tests cover credential scope, header preservation, missing/invalid token refusal, real HTTP gate acceptance and redirect refusal. Targeted local-admin/obs tests 19/19 passed; no live writes or inference.
- Verification: pnpm format, pnpm lint:fix, pnpm check (496 unit/214 isolated integration, exit 0), pnpm build, check-handbook.ts 08-operations and git diff --check. Initial test lint and handbook length failures corrected before final checks.
- Rebuilt/restarted API/docs; readiness retry passed. Live protected sources/jobs reads: 36 healthy sources, no failed digest runs; anonymous protected status 404, reader latest four topics, health green. Worker/schema/UI unchanged; no screenshot changes needed. Final alerts zero.
- Updated TASKS, Operations and access decision; archived iteration 722. SOURCES/NEEDS_FROM_HUMAN unchanged; no source change or new owner blocker. No paid calls, model/provider/budget changes, scorer work or X activation.
- Next: owner email identity and coordinated UI/scripts/tool migration; Nov 5 scheduled acceptance first when due, scorer afterward, fresh X rounds after 21:00 UTC Nov 5/6.

## 2026-11-05: iteration 737 — authenticated scheduled-evidence reports

- Started clean on main; no leftover work. Health/database/Redis, 36 sources healthy, zero failed retained digest runs; Nov 5 edition due at 15:00 UTC. Initial alerts zero.
- Edition timing report now reads protected status and digest previews; Bluesky coverage reads protected topics. Both reuse the private local token adapter, fixed loopback origin and redirect refusal; no legacy fallback.
- Live read-only timing report returned complete evidence for the latest scheduled edition. Stored Bluesky observations: Tech 517, NBA 682, Gaming 687, World 666; these are stored observations, not new collection or selected picks.
- Verification: pnpm format, pnpm lint:fix, pnpm check (496 unit/214 isolated integration, exit 0), pnpm build, check-handbook.ts 08-operations and git diff --check passed. No UI/schema/worker changes or screenshots needed.
- Rebuilt/restarted API/docs. Updated TASKS, Operations and access decision; archived iteration 723. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker.
- No paid calls, model/provider/budget changes, scorer work or X activation. Next: coordinated admin migration/configured email; Nov 5 scheduled acceptance when due, scorer afterward, fresh X rounds after 21:00 UTC Nov 5/6.
