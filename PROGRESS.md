## 2026-11-05: iteration 767 — live admin gate verification

- Started clean on main; no leftover work. Alerts zero, /healthz database/Redis green, all 36 sources healthy; no failed retained digest runs. Nov 5 edition remains due at 15:00 UTC.
- Added read-only deployment check for 18 reserved admin paths (GET/HEAD), anonymous/invalid identity, private cache headers, direct-local token access and eight forwarded-token rejection cases, including empty headers. Credentials stay in Node; redirects fail and requests time out. Saved reader edition unchanged.
- `pnpm exec tsx scripts/smoke-admin-gate.ts` passed against the running app. Only GET/HEAD requests; no jobs, browser credentials, writes or paid calls. Proxy URL still fails to connect (curl exit 7), so proxy identity replacement remains unverified.
- TASKS, Operations and access decision updated; archived iteration 751. SOURCES/NEEDS_FROM_HUMAN unchanged. No runtime/config/schema or model/provider changes; healthy services remain running under STEERING 22.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (497 unit/214 isolated integration, zero failures), `pnpm build`, `check-handbook.ts 08-operations`, `git diff --check` passed. Handbook initially exceeded the line limit by one; shortened and rechecked. Final health green; all four app services active.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate fallback before scorer. Fresh X rounds after 21:00 UTC Nov 5/6; owner identity configuration still blocks coordinated admin rollout.

## 2026-11-05: iteration 768 — reject malformed edition links before loading

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; no failed retained digest runs. Two historical ingestion failures remain while current collection succeeds.
- Reader edition routes now validate UUIDs before loading the app or issuing edition/operational API reads. Malformed links show the existing not-found view and a working home link. Valid saved-edition routing remains unchanged.
- `pnpm exec tsx scripts/smoke-invalid-edition.ts` passed three invalid IDs on desktop/mobile light/dark, zero API reads on invalid pages, home recovery, no writes/browser errors and saved-edition immutability. Four screenshots saved under docs/screenshots/ui; mobile dark and desktop light inspected. Existing `smoke-edition-selection.ts` also passed valid saved-edition selection and late-response races in both themes/viewports.
- TASKS and Operations updated; archived iteration 752. SOURCES/NEEDS_FROM_HUMAN unchanged. No paid calls, generation/config/schema or model/provider changes. API restarted after web build; health green.
- Verification: pnpm format; pnpm lint:fix; pnpm check (497 unit/214 isolated integration); pnpm build; check-handbook.ts 08-operations; git diff --check. Initial check hit newly archived Markdown formatting, corrected; initial smoke needed its async entry point wrapped for CommonJS, corrected before passing.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate fallback before scorer. Fresh X rounds after 21:00 UTC Nov 5/6; owner identity configuration and proxy verification still block admin rollout.

## 2026-11-05: iteration 769 — recover malformed legacy edition links

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; no failed retained digest runs. Two historical ingestion failures remain while current collection succeeds.
- Malformed legacy `?edition=` links now show Page not found before app/API loading, including empty and numeric values. Valid legacy links still redirect to the saved edition and preserve their section anchor.
- `pnpm exec tsx scripts/smoke-invalid-edition.ts` passed six malformed paths, home recovery and valid legacy redirects on desktop/mobile light/dark; zero invalid-page API reads, no writes/browser errors, saved edition unchanged. Four screenshots refreshed with identical output; mobile dark inspected.
- TASKS updated; archived iteration 753. SOURCES/NEEDS_FROM_HUMAN unchanged; no source changes or new blockers. No paid calls, stored-edition writes, generation/config/schema or model/provider changes. API restarted for the web build; health green.
- Verification: pnpm format; pnpm lint:fix; pnpm check (497 unit/214 isolated integration, zero failures); pnpm build; git diff --check. Initial browser launch raced API startup (ECONNREFUSED); rerun after healthy startup passed.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. X rounds after 21:00 UTC Nov 5/6; owner identity configuration and proxy verification still block admin rollout.

## 2026-11-05: iteration 770 — missing saved-edition recovery

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; API/worker/docs/schema active. Scheduled Nov 5 review still due at 15:00 UTC.
- Reader queries retain HTTP status: saved-edition 404s stop automatic retries and show Edition not found with a latest-edition link. Other load failures retain automatic retries and now offer an explicit retry button; creation failures keep their existing message.
- `pnpm exec tsx scripts/smoke-missing-edition.ts` passed real missing-edition 404/single request, home recovery and browser-only 503/retry recovery on desktop/mobile light/dark. No writes/browser errors; saved edition unchanged. Four screenshots added; mobile dark/desktop light inspected. Existing `smoke-invalid-edition.ts` passed all four combinations too.
- TASKS and Operations updated; archived iteration 754. SOURCES/NEEDS_FROM_HUMAN unchanged: no source changes or new blocker. No paid calls, stored-edition writes, generation/config/schema or model/provider changes. API restarted after web build.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 08-operations; git diff --check. 497 unit tests passed; initial integration process received SIGTERM after reporting all 214 test cases, isolated integration rerun passed all 214 tests (exit 0). Final health green; all four app services active.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. X rounds after 21:00 UTC Nov 5/6; owner identity configuration and proxy verification still block admin rollout.

## 2026-11-05: iteration 771 — authenticated handbook verification

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; API/worker/docs/schema active. Nov 5 edition review remains due at 15:00 UTC.
- Handbook checker now authenticates local docs pages/assets/API and DB schema reads through Node, relaying response bodies into Playwright without browser credentials. Fixed loopback origin, redirect refusal and 15-second deadlines keep it ready for tool gating; remote APP_URL values are rejected.
- Extended credential adapter only to exact docs/db path families. Tests cover unrelated origins/prefixes, traversal, header preservation, invalid tokens, gated tool access and redirect rejection. Actual tool gating remains part of the coordinated admin migration.
- Verification: pnpm format; pnpm lint:fix; pnpm check (497 unit/214 isolated integration, zero failures); pnpm build; full check-handbook.ts (18 pages/22 diagrams/26 tables, no metadata warnings); remote-origin rejection; targeted local-admin-fetch tests (2/2); git diff --check.
- TASKS, Operations and access decision updated; archived iteration 755. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. No paid calls, stored-edition writes, runtime/config/schema or model/provider changes. Healthy services remain running under STEERING 22.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. X rounds after 21:00 UTC Nov 5/6; owner identity configuration and proxy verification still block admin rollout.

## 2026-11-05: iteration 772 — recover failed archive pages

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; no failed retained digest runs. Two historical ingestion failures remain with current collection healthy.
- Archive paging now keeps Newer editions available during loading/errors, so a failed older page no longer traps navigation. Older editions waits for a successful response; retry and empty-page return remain available.
- `pnpm exec tsx scripts/smoke-history-recovery.ts` passed failed-page escape, retry and empty-page return on desktop/mobile light/dark, with browser-only pagination/failure responses, blocked writes, no browser errors and the saved edition unchanged. Four screenshots added; desktop light/mobile dark inspected.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 08-operations (18 pages/1 diagram/26 tables); git diff --check. Initial check raced import autofix and failed import sorting; corrected. Full rerun passed static checks and 497 unit tests, then received SIGTERM during integration; isolated integration rerun passed all 214 tests.
- TASKS and Operations updated; archived iteration 756. SOURCES/NEEDS_FROM_HUMAN unchanged: no source changes or new blockers. No paid calls, stored-edition writes, generation/config/schema or model/provider changes. API restarted after web build; health green.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate fallback before scorer. X rounds after 21:00 UTC Nov 5/6; owner identity configuration and proxy verification still block admin rollout.

## 2026-11-05: iteration 773 — accurate cached-edition refresh recovery

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; no failed retained digest runs. Historical ingestion/social failures remain with collection healthy.
- Cached reader content now gets an accurate refresh-failure message instead of initial-load wording or a contradictory Edition not found heading. Saved stories remain visible; retry restores the normal view.
- `pnpm exec tsx scripts/smoke-edition-refresh.ts` passed browser-only 503/404 focus-refresh and retry on desktop/mobile light/dark, exact retained topic text, blocked writes, zero browser errors and unchanged saved edition. Four screenshots saved; desktop light/mobile dark inspected. Existing smoke-missing-edition.ts also passed all four viewport/theme cases. Initial harness event target corrected to window.
- TASKS and Operations updated; archived iteration 757. SOURCES/NEEDS_FROM_HUMAN unchanged: no source changes or new blockers. No paid calls, stored-edition writes, generation/config/schema or model/provider changes. API restarted after web build.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 08-operations; git diff --check. 497 unit/214 isolated integration tests passed (exit 0). Initial check caught concurrent handbook formatting; formatted and reran. Final health green; all four services active.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate fallback before scorer. X rounds after 21:00 UTC Nov 5/6; owner identity configuration and proxy verification still block admin rollout.

## 2026-11-05: iteration 774 — read-only shared-query browser verification

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; no failed retained digest runs. Scheduled Nov 5 review remains due at 15:00 UTC.
- Shared-query smoke now blocks browser writes across all paths, disables service-worker interception, rejects browser admin credentials and compares the full protected saved edition before/after. Snapshot routes delegate non-read requests to the guard; an intentional POST probe verifies interception without contacting the API.
- Browser verification passed shared-request deduplication/cache reuse, malformed status recovery and malformed content/health isolation. Desktop/mobile screenshots refreshed and inspected. No stored-edition writes or paid calls.
- TASKS and Operations updated; archived iteration 758. SOURCES/NEEDS_FROM_HUMAN unchanged: no source changes or new blockers. No runtime/config/schema or model/provider changes; healthy services stay running under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx scripts/smoke-query-resources.ts; check-handbook.ts 08-operations; git diff --check. All passed: 497 unit/214 isolated integration tests, zero failures (exit 0). Initial concurrent lint-fix process received SIGTERM; sequential rerun passed. Final health green; all four services active.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate fallback before scorer. X rounds after 21:00 UTC Nov 5/6; identity configuration and authenticated proxy verification still block admin rollout.

## 2026-11-05: iteration 775 — retain archive links after refresh failures

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; no failed retained digest runs. Scheduled review remains due at 15:00 UTC.
- Cached archive refresh failures now preserve loaded edition links and dates with accurate refresh wording and Retry; initial-load failure behavior and conservative older-page controls remain intact.
- `pnpm exec tsx scripts/smoke-history-refresh.ts` passed browser-only 503 focus refresh, exact saved links/text, retry and edition navigation on desktop/mobile light/dark. Blocks browser writes and credentials, checks zero browser errors and the full protected saved edition unchanged. Four screenshots added; desktop light/mobile dark inspected. Initial exact-text assertion included the nested Retry button; corrected the selector.
- TASKS and Operations updated; archived iteration 759. SOURCES/NEEDS_FROM_HUMAN unchanged: no source changes or new blockers. No paid calls, edition writes, generation/config/schema or model/provider changes. API restarted after web build; worker left running under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-history-refresh.ts; smoke-history-recovery.ts; check-handbook.ts 08-operations; git diff --check. Static checks and 497 unit tests passed; command received SIGTERM during integration. Isolated user-unit rerun passed all 214 integration tests (exit 0). Build, browser checks, handbook and diff checks passed; final health green.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate fallback before scorer. X rounds after 21:00 UTC Nov 5/6; identity configuration and proxy verification still block admin rollout.

## 2026-11-05: iteration 776 — recover stalled reader requests

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; no failed retained digest runs. Historical ingestion/social failures remain with collection healthy.
- Shared browser reads now combine query cancellation with a 15-second timeout. Edition/history timeouts stop automatic retries and offer the existing manual recovery; ordinary transient retries and single-request 404 behavior remain.
- `pnpm exec tsx scripts/smoke-reader-timeout.ts` passed stalled edition/history requests, exactly one attempt before Retry, real saved-content recovery on desktop/mobile light/dark, blocked writes/credentials, zero browser errors and unchanged protected saved edition. Four screenshots added; desktop light/mobile dark inspected. `smoke-missing-edition.ts` also passed all four cases; unrelated regenerated screenshots discarded.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 08-operations; git diff --check. Static checks, 497 unit and 214 isolated integration tests passed (exit 0). Handbook initially exceeded 100 lines; shortened and rechecked successfully.
- TASKS and Operations updated; archived iteration 760. SOURCES/NEEDS_FROM_HUMAN unchanged: no source changes or new blockers. No paid calls, edition writes, generation/config/schema or model/provider changes. API restarted after build; all four services active, health green.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate fallback before scorer. X rounds after 21:00 UTC Nov 5/6; identity configuration and proxy verification still block admin rollout.

## 2026-11-05: iteration 777 — recover invalid reader data promptly

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy. Scheduled Nov 5 review still due at 15:00 UTC.
- Edition/history schema failures now offer manual Retry immediately instead of issuing three automatic repeat requests. Transient HTTP retries and timeout/404 handling remain intact.
- `pnpm exec tsx scripts/smoke-reader-invalid-data.ts` passed malformed 200 responses, one attempt before Retry, real saved-content recovery and unchanged protected saved edition on desktop/mobile light/dark. Browser writes/credentials blocked; zero browser errors. Four screenshots added; desktop light/mobile dark inspected.
- `smoke-missing-edition.ts` passed single-404 and transient-outage recovery in all four cases; discarded unrelated regenerated screenshots. Operations/TASKS updated; archived iteration 761. SOURCES/NEEDS_FROM_HUMAN unchanged: no source changes or new blockers.
- No paid calls, stored-edition writes, generation/config/schema or model/provider changes. API restarted after build; worker kept running under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 08-operations; git diff --check. Static checks, 497 unit/214 isolated integration tests passed (exit 0). Initial check caught import spacing after lint auto-fix; reformatted and full rerun passed. Final health green; all four services active.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate fallback before scorer. X rounds after 21:00 UTC Nov 5/6; identity configuration/proxy verification still block admin rollout.

## 2026-11-05: iteration 778 — recover malformed reader JSON promptly

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; no failed retained digest runs. Free social and Bluesky collections continue successfully.
- Reader JSON parse failures now offer immediate manual Retry instead of automatically repeating malformed responses. Schema, timeout, 404 and transient HTTP behavior remain covered.
- Expanded `pnpm exec tsx scripts/smoke-reader-invalid-data.ts`: schema failures and truncated JSON for edition/history in desktop/mobile light/dark; one attempt before Retry, real saved-content recovery, blocked browser writes/credentials, zero browser errors and full protected saved edition unchanged. Four malformed-JSON screenshots added; desktop light/mobile dark inspected.
- `smoke-missing-edition.ts` passed all four cases; discarded unrelated regenerated screenshots. Initial invalid-data smoke ran before restarted API was ready (connection refused); health-ready rerun passed.
- TASKS/Operations updated; archived iterations 762–763. SOURCES/NEEDS_FROM_HUMAN unchanged: no source changes or new blockers. No paid calls, stored-edition writes, generation/config/schema or model/provider changes. API restarted after build; worker kept running under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 08-operations; git diff --check. Static checks and 497 unit tests passed; full check received SIGTERM during integration. Separate user-unit `pnpm test:integration` passed all 214 tests (exit 0). Build, browser, handbook and diff checks passed; final health green, four app services active.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate fallback before scorer. X rounds after 21:00 UTC Nov 5/6; identity configuration/proxy verification still block admin rollout.

## 2026-11-05: iteration 779 — consistent uncached admin identity methods

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; no failed retained digest runs. Nov 5 scheduled review remains due at 15:00 UTC.
- `/api/me` now handles GET/HEAD and trailing-slash paths consistently with uncached identity headers; HEAD has no body. Other methods return uncached 405 with Allow instead of falling through to the SPA.
- HTTP gate characterization covers anonymous, configured email, direct token and forwarded-token identities across canonical/trailing-slash/case/query paths and unsupported methods. Focused test passed (2/2).
- Live `pnpm exec tsx scripts/smoke-admin-gate.ts` passed 18 reserved paths, anonymous/invalid identity HEAD checks, direct protected access, forwarded-token denial and unchanged saved edition. An initial new authenticated identity assertion failed because the local adapter deliberately sends no token to `/api/me`; removed that invalid smoke assumption, retaining authenticated HEAD coverage in the HTTP test.
- TASKS/access decision updated; archived iteration 764. SOURCES/NEEDS_FROM_HUMAN unchanged: no source changes or new blockers. No UI changes, paid calls, stored-edition writes or generation/config/schema changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-admin-gate.ts; git diff --check. Static checks, 497 unit/214 isolated integration tests passed (exit 0). First check caught archive formatting, corrected before the successful full rerun. API restarted and health green; worker unchanged under STEERING 22.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate fallback before scorer. X rounds after 21:00 UTC Nov 5/6; identity configuration/proxy verification still block admin rollout.

## 2026-11-05: iteration 780 — prepare async-edition verification for admin gating

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; no failed retained digest runs. Next scheduled edition remains 15:00 UTC.
- Async-edition smoke now reads operational content/topics/profile/status through protected Node snapshots and replays them in the browser. Local credentials stay outside Playwright; browser requests are checked for credential absence, unexpected writes blocked and service workers disabled.
- Job submission/polling remain browser-only simulations. Queue, active stages, reload recovery, reconnect, completion with real saved story text and failed-job recovery passed desktop/mobile. Full protected saved edition, topics and profile remain unchanged.
- Commands: pnpm exec tsx scripts/smoke-edition-jobs.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 08-operations; git diff --check. Static checks, 497 unit and 214 isolated integration tests passed (exit 0); build, browser smoke, handbook and diff checks passed.
- TASKS/Operations/access decision updated; archived iteration 765. Discarded regenerated screenshots because the UI is unchanged. SOURCES/NEEDS_FROM_HUMAN unchanged: no source changes or new blockers.
- No paid calls, real job submissions, stored-edition writes, runtime/config/schema or model/provider changes. Healthy services left running under STEERING 22; all four services active and final health green.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; fallback investigation before scorer. X rounds after 21:00 UTC Nov 5/6. Owner identity configuration/proxy verification still block coordinated admin rollout.

## 2026-11-05: iteration 781 — prepare queue verification for tool gating

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; no failed retained digest runs. Next edition remains Nov 5 15:00 UTC.
- Queue HTTP/browser checks now use the fixed-loopback credential adapter for queue APIs, pages and assets. Credentials stay in Node; redirects fail and reads time out after 15 seconds. Tool gating itself remains pending the coordinated admin rollout.
- Desktop/mobile checks passed against four real queues and 40 schedules: schedulers visible, zero page errors, browser writes blocked, credentials absent and full saved edition unchanged. Server mutation barrier still returns 405 for empty POST/PUT/PATCH/DELETE probes; no jobs enqueued or retried.
- Credential tests cover queue path boundaries, external/localhost exclusion, authenticated tool access and anonymous denial. Focused tests passed 2/2. Queue smoke passed twice; discarded regenerated screenshots because the UI is unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 08-operations; git diff --check. Static checks, 497 unit/214 isolated integration tests passed (exit 0); build, handbook and diff checks passed. Final health green; all four services active.
- TASKS/Operations/access decision updated; archived iteration 766. SOURCES/NEEDS_FROM_HUMAN unchanged: no source changes or new blockers. No paid calls, stored-edition writes, runtime/config/schema or model/provider changes; healthy services left running under STEERING 22.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate fallback before scorer. X rounds after 21:00 UTC Nov 5/6. Owner identity configuration/proxy verification still block admin rollout.
