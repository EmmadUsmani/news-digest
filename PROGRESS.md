## 2026-11-05: iteration 753 — Google News checks without production writes

- Started clean on main; no leftover work. Health/database/Redis green, 36 healthy sources, no failed retained digest runs. Existing metrics memory warning pending; Nov 5 edition due at 15:00 UTC.
- Google News query browser check now reads protected topic/content/catalog/edition snapshots in Node. Validation and failure responses, retry, reload and disconnect stay in browser memory; unexpected API writes abort. Removed live topic creation/deletion, query connections and scheduler polling.
- `pnpm exec tsx scripts/smoke-news-queries.ts` passed desktop/mobile validation response, retained input after failed save, retry/cleared input, stored Google News articles, reload and disconnect. Protected reads prove live topics and saved edition unchanged. Two screenshots refreshed; mobile visually inspected. First run found checkbox label mismatch; corrected and rerun passed. Server validation remains in isolated tests.
- Updated TASKS and Operations; archived iteration 739. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. No runtime/config/schema changes, live writes or paid calls; healthy services remain running under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check (497 unit/214 isolated integration tests, exit 0); pnpm build; check-handbook.ts 08-operations; git diff --check all passed. Final health green; reader latest has four real topics.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review after 15:00 UTC; investigate fallback before scorer. X rounds after 21:00 UTC Nov 5/6; coordinated admin migration while waiting.

## 2026-11-05: iteration 754 — topic editing without live writes

- Started clean on main; no leftover work. Health/database/Redis green, 36 sources healthy, no failed retained digest runs; two historical ingestion failures remain with current sources healthy. Alert snapshot has no firing/pending alerts.
- General topic-editing browser check now reads protected topic/edition snapshots in Node. Name, budget, relevance and disable saves/reloads stay in browser memory; unexpected API writes abort. Removed production updates/restoration, preview generation and live invalid-write probes; server validation and generated-budget behavior remain in isolated tests.
- `pnpm exec tsx scripts/smoke-topics.ts` passed desktop/mobile edit, reload, budget, disable, no browser errors/overflow and live topic/edition immutability. Two screenshots refreshed; mobile visually inspected.
- Updated TASKS, Operations and access decision. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. No runtime/config/schema changes, live writes or paid calls; healthy services remain running under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check (497 unit/214 isolated integration tests, exit 0); pnpm build; check-handbook.ts 08-operations; git diff --check all passed. Final health green; reader latest has four topics, 14 stories and 15 posts.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review after 15:00 UTC; investigate fallback before scorer. X rounds after 21:00 UTC Nov 5/6; coordinated admin migration while waiting.

## 2026-11-05: iteration 755 — general UI check follows the reader contract

- Started clean on main; no leftover work. Health/database/Redis green, 36 sources healthy, no failed retained digest runs. Existing metrics memory alert firing; service active with zero restarts. Nov 5 edition due at 15:00 UTC.
- General UI smoke now reads saved reader editions/archive and verifies rendered titles, URLs, summary text, image attributes, archive navigation/reload and desktop/mobile layout. Removed obsolete score/editorial assertions, legacy preview reads and paid creation/extended-window modes; unexpected browser API writes abort.
- `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile with no browser errors, overflow or API writes; latest reader snapshot unchanged. Four screenshots refreshed; mobile archive visually inspected. Removed stale paid-mode instructions from docs/LLM.md and updated Operations/TASKS; archived iteration 740.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 08-operations; git diff --check. Initial shell terminated during lint (143); checks rerun through isolated user service. Full check passed (497 unit/214 isolated integration tests); build and handbook validation passed.
- SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. Runtime/config/schema unchanged; healthy services remain running under STEERING 22. No live writes, inference or provider/model/budget changes.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review after 15:00 UTC; investigate repeated fallback before scorer. X rounds after 21:00 UTC Nov 5/6; coordinated admin migration while waiting.

## 2026-11-05: iteration 756 — edition selection preserves saved reader content

- Started clean on main; no leftover work. Health/database/Redis green, all 36 sources healthy; recent free-X/Bluesky collections succeeded and no retained failed digest runs. Existing metrics memory warning pending.
- Edition-selection browser check now chooses a genuinely different saved edition through reader schemas, waits for the delayed latest request to start, and checks selected story titles and summary text before and after delayed success/error. It also verifies URL/selection, browser errors, layout, blocks unexpected API writes and proves the latest saved edition unchanged.
- `pnpm exec tsx scripts/smoke-edition-selection.ts` passed all four desktop/mobile success/error cases; screenshots refreshed with identical image output. Mobile archive visually inspected. No live writes, paid calls, runtime/config/schema or model/provider changes.
- Updated TASKS and Operations; archived iteration 741 to keep PROGRESS small. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. Healthy services stay running under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check (497 unit/214 isolated integration, zero failures); pnpm build; check-handbook.ts 08-operations; git diff --check all passed. Final /healthz green.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. X rounds after 21:00 UTC Nov 5/6; coordinated admin migration while waiting.

## 2026-11-05: iteration 757 — completed jobs preserve saved reader text

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy, no failed retained digest runs; recent free-X/Bluesky collections succeeded.
- Async edition-job browser verifier now validates the latest saved reader schema in Node, blocks unexpected browser API writes and verifies every saved story title/text after simulated completion. Latest saved edition must remain unchanged; queue, progress, reload, reconnect and failure checks remain browser-only replays.
- `pnpm exec tsx scripts/smoke-edition-jobs.ts` passed desktop/mobile; no browser errors, overflow or unexpected writes. Two screenshots refreshed; mobile visually inspected. Initial archive-status wait was unsuitable with the archive closed; replaced with saved-story visibility and rerun passed.
- Updated TASKS and Operations; archived iteration 742. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. No live writes, paid calls, runtime/config/schema or model/provider changes. Healthy services stay running under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 08-operations; git diff --check all passed (497 unit/214 isolated integration tests, zero failures). Initial full-check shell terminated (143) during integration; isolated user-unit rerun passed. Final /healthz green.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. X rounds after 21:00 UTC Nov 5/6; coordinated admin migration while waiting.

## 2026-11-05: iteration 758 — archive refresh preserves saved reader content

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; latest free-X/Bluesky collections succeeded and no retained failed digest runs. Nov 5 edition due at 15:00 UTC.
- Archive race verifier reads validated reader snapshots in Node with bounded timeouts; verifies saved story titles/text before and after superseded archive success/error, catches browser errors and blocks unexpected API writes. Final archive/latest snapshots must remain unchanged.
- `pnpm exec tsx scripts/smoke-edition-history.ts` passed all four desktop/mobile cases; screenshots unchanged. Updated Operations/TASKS and archived iteration 743. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker.
- Verification: pnpm format; pnpm lint:fix; pnpm check (497 unit/214 isolated integration tests, zero failures); pnpm build; check-handbook.ts 08-operations; git diff --check all passed. Mobile archive screenshot visually inspected. No live writes, paid calls, runtime/config/schema or model/provider changes; healthy services stay running under STEERING 22.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. X rounds after 21:00 UTC Nov 5/6; coordinated admin migration while waiting.

## 2026-11-05: iteration 759 — canonical navigation preserves saved reader text

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy and no retained failed digest runs. Nov 5 scheduled edition remains due at 15:00 UTC.
- Canonical routing verifier now validates reader history/latest/historical snapshots in Node with bounded timeouts, checks every saved story title/text after redirect, reload and cached edition switching, blocks unexpected browser API writes and proves snapshots unchanged afterward.
- Desktop/mobile routing smoke passed, including pagination, malformed edition, reserved routes and shared-cache checks. Screenshots refreshed; mobile reader visually inspected. Updated TASKS/Operations; archived iteration 744.
- No runtime/config/schema changes, production writes, paid calls or model/provider changes. SOURCES/NEEDS_FROM_HUMAN unchanged. Healthy services remain running under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check (497 unit/214 isolated integration, zero failures); pnpm build; check-handbook.ts 08-operations; git diff --check all passed. Final /healthz green.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. X rounds after 21:00 UTC Nov 5/6; coordinated admin migration while waiting.

## 2026-11-05: iteration 760 — theme changes preserve saved reader text

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy; no failed retained digest runs. Nov 5 scheduled edition remains due at 15:00 UTC.
- Theme browser verifier validates the saved reader snapshot with a bounded Node read, checks all story titles/text through system/manual themes, reload, cross-tab sync and disabled storage, blocks unexpected API writes and proves the edition unchanged afterward. Browser errors are collected across every tab/context.
- Desktop/mobile theme smoke passed twice; four screenshots unchanged, mobile dark visually inspected. Initial story-count selector did not match the existing markup; corrected and rerun passed.
- Updated TASKS/Operations; archived iteration 745. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. No live writes, paid calls, runtime/config/schema or model/provider changes; healthy services remain running under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check (497 unit/214 isolated integration, zero failures); pnpm build; check-handbook.ts 08-operations; git diff --check all passed. Initial check shell terminated (143) during integration; full check rerun in isolated user unit passed. Final health green.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. X rounds after 21:00 UTC Nov 5/6; coordinated admin migration while waiting.

## 2026-11-05: iteration 761 — protected X-schedule guidance browser check

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, all 36 sources healthy, no retained failed digest runs; Nov 5 edition remains due at 15:00 UTC.
- X-schedule guidance verifier now reads validated status/topic snapshots through bounded protected Node requests, replays them in the browser, blocks unexpected browser API writes and verifies live topics are unchanged. Credentials remain outside the browser.
- `pnpm exec tsx scripts/smoke-x-schedule-copy.ts` passed desktop/mobile Status/settings copy, layout and browser-error checks. Four screenshots refreshed; desktop Status and mobile account guidance visually inspected.
- Updated TASKS/Operations; archived iteration 746. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. No production writes, paid calls, runtime/config/schema or model/provider changes; healthy services stay running under STEERING 22.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. Fresh X rounds after 21:00 UTC Nov 5/6; coordinated admin migration while waiting.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (497 unit/214 isolated integration, zero failures), `pnpm build`, `check-handbook.ts 08-operations` and `git diff --check` passed. Final health green; saved reader edition returns four real topics.

## 2026-11-05: iteration 762 — manual reserve check blocks live writes

- Started clean on main; no leftover work. Alerts zero and /healthz database/Redis green; Nov 5 scheduled edition remains due at 15:00 UTC.
- Manual-reserve browser verifier takes one validated protected status snapshot outside the browser, blocks unexpected API writes, checks simulated submission/poll methods and proves the saved reader edition unchanged afterward. Credentials stay outside the browser.
- `pnpm exec tsx scripts/smoke-manual-reserve.ts` passed desktop/mobile protected, refreshed, released and unavailable budget states with no live jobs or inference. Screenshots unchanged; mobile visually inspected.
- Updated TASKS/Operations. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. No runtime/config/schema, model/provider or production data changes; healthy services remain running under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check (497 unit/214 isolated integration, zero failures); pnpm build; check-handbook.ts 08-operations; git diff --check passed. Final /healthz green.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. Fresh X rounds after 21:00 UTC Nov 5/6; coordinated admin migration while waiting.

## 2026-11-05: iteration 763 — restore reader X-widget replay

- Started clean on main; no leftover work. Alerts zero and /healthz database/Redis green; Nov 5 scheduled edition remains due at 15:00 UTC.
- X-widget verifier now replays recorded selected posts through the reader contract/API rather than the legacy operational preview. Removed obsolete editorial/context expectations; verifies saved story titles/text, sanitized posts, blocked writes and unchanged saved edition.
- `pnpm exec tsx scripts/smoke-posts.ts /tmp/135-screen.jsonl` passed success, blocked-script retry, timeout retry and late-promise cleanup on desktop/mobile. Four screenshots refreshed; desktop/mobile blocked cards visually inspected. Posts are recorded replay; widgets are stubs, no live inference or publication.
- TASKS/Operations updated; archived iteration 747. SOURCES/NEEDS_FROM_HUMAN unchanged. No runtime/config/schema or model/provider changes; healthy services remain running under STEERING 22.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (497 unit/214 isolated integration, zero failures), `pnpm build`, `check-handbook.ts 08-operations` and `git diff --check` passed. Final /healthz green.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. X rounds after 21:00 UTC Nov 5/6; coordinated admin migration while waiting.

## 2026-11-05: iteration 764 — saved story text in both themes

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, 36 sources healthy and no retained failed digest runs; Nov 5 edition remains due at 15:00 UTC.
- Saved-story regression now checks every story title/text across all four Nov 4 topics, desktop/mobile and light/dark. NBA retains 5/5 non-empty summaries and clean reader labels. Browser API writes are blocked; bounded reader requests confirm the saved edition is unchanged.
- `pnpm exec tsx scripts/smoke-reader-story-text.ts` passed all four viewport/theme combinations. Added dark desktop/mobile screenshots and refreshed mobile light; dark desktop/mobile visually inspected.
- TASKS/Operations updated; archived iteration 748. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. No live writes, paid calls, runtime/config/schema or model/provider changes; healthy services remain running under STEERING 22.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (497 unit/214 isolated integration, zero failures), `pnpm build`, `check-handbook.ts 08-operations` and `git diff --check` passed. Final /healthz green.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. X rounds after 21:00 UTC Nov 5/6; owner identity configuration still blocks coordinated admin rollout.

## 2026-11-05: iteration 765 — reserve and duration checks block writes

- Started clean on main; no leftover work. Alerts zero, /healthz database/Redis green, all 36 sources healthy; recent collection succeeds and no retained digest failures. Nov 5 edition remains due at 15:00 UTC.
- Scheduled-reserve and run-duration browser checks now use one protected Node status snapshot each, block unexpected API writes, assert replayed status reads use GET, and prove the saved reader edition unchanged after both viewports. No credentials enter the browser.
- `pnpm exec tsx scripts/smoke-reserve-status.ts` and `pnpm exec tsx scripts/smoke-run-duration.ts` passed desktop/mobile protected/released reserve and completed/waiting telemetry states. Four screenshots refreshed; both mobile screenshots visually inspected. Synthetic states stay in memory; no jobs or paid inference.
- TASKS/Operations updated; shortened obsolete task history and archived iteration 749. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new blocker. No runtime/config/schema or model/provider changes; healthy services stay running under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check (497 unit/214 isolated integration, zero failures); pnpm build; check-handbook.ts 08-operations; git diff --check. First check terminated with exit 143 during unit tests without a reported failure; complete rerun passed. Final /healthz green.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. X rounds after 21:00 UTC Nov 5/6; owner identity configuration still blocks coordinated admin rollout.

## 2026-11-05: iteration 766 — archive navigation in both themes

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, 36 sources healthy; recent social collection succeeds and next edition remains Nov 5 15:00 UTC.
- Edition selection and archive refresh race checks now cover desktop/mobile light/dark. Late success/error responses preserve saved story titles/text, selection and current history; browser API writes stay blocked. Selection also verifies the older saved edition remains unchanged.
- `pnpm exec tsx scripts/smoke-edition-selection.ts` and `pnpm exec tsx scripts/smoke-edition-history.ts` passed all viewport/theme/race combinations. Eight screenshots added under docs/screenshots/ui; dark mobile history and desktop selection visually inspected.
- TASKS/Operations updated; archived iteration 750. SOURCES/NEEDS_FROM_HUMAN unchanged. No runtime/config/schema, model/provider, live writes or paid calls; healthy services left running under STEERING 22.
- Verification: pnpm format; pnpm lint:fix; pnpm check (497 unit/214 isolated integration, zero failures); pnpm build; check-handbook.ts 08-operations; git diff --check; final /healthz green. Initial check stopped on newly archived Markdown formatting, corrected before full passing rerun.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; repeated NBA fallback investigation before scorer. Fresh X rounds after 21:00 UTC Nov 5/6; admin rollout still needs owner identity configuration.

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
