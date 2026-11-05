## 2026-11-04: iteration 714 — recover dates automatically in X experiment reports

- Started clean on main; no leftover work. Zero alerts, healthz/database/Redis green, reader HTTP 200, 36 healthy sources and no failed retained digest runs. Nov 5 scheduled acceptance remains future.
- Offline reports now fill missing publication times with the existing production Snowflake decoder and count supplied/ID-derived/unknown dates. Supplied dates and input evidence remain unchanged; legacy/invalid/future IDs remain unknown. Date metadata does not establish post existence or official verification.
- Replayed all 11 settled round-1 calls: exactly 17 automatic recoveries; per-call window/eligible-yield/unknown metrics and the entire comparison match the separate iteration-713 recovery. Saved private automatic-dates-report-714.json (600); originals and admission journal untouched. No paid calls, parameter changes or activation.
- Verification: targeted report/CLI/comparison tests 23/23; pnpm format, pnpm lint:fix, pnpm check (471 unit/213 isolated integration), pnpm build, handbook validation and git diff --check passed. Initial targeted run caught an overbroad edit of postsFetched; corrected and reran successfully.
- Updated TASKS and experiment reference; archived iterations 700–701 to bound PROGRESS. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no runtime/source change or new owner blocker. No restart under STEERING 22; running services do not import this offline report.
- Next: second independent experiment day, threshold calibration/model comparison under shared caps; Nov 5 grouping/NBA AI/cost/latency/screenshots take priority. Production fixed A/B remains off.

## 2026-11-04: iteration 715 — reproducible saved X response extraction

- Started clean on main; no leftover work. Zero alerts, healthz/database/Redis green, reader HTTP 200, all 36 sources healthy, no failed retained digest jobs; next edition Nov 5 15:00 UTC.
- Added an offline saved-round extractor: joins settled manifest, original requests/settings/responses and settlements; emits all cited posts, actual tool inputs and fetched usage for the existing reporter. Prose cannot add candidates; duplicate metrics and absent review labels stay unknown. No provider calls, ingestion, journal writes or production changes.
- Replayed round 1: all 11 calls/47 posts exactly match original costs, fetched counts, tool calls and post fields. Saved private extracted-evidence-715.json (600); originals and retained Gaming hold untouched.
- Verification: four targeted tests passed; pnpm format, pnpm lint:fix, pnpm check (475 unit; 213 integration cases reported success before exit 143, then clean isolated integration rerun), pnpm build, handbook validation and git diff --check passed. Initial lint caught four missing void test declarations; corrected before rerunning full check.
- Updated TASKS and experiment reference. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no runtime/source change or new owner blocker. No restart under STEERING 22; running services do not import the offline extractor.
- Next: second independent experiment day, then threshold calibration/model comparison under shared caps. Nov 5 grouping/NBA AI/cost/latency/screenshots take priority; production fixed A/B remains off.

## 2026-11-04: iteration 716 — assess the cheaper X model candidate

- Started clean on main; no leftover work. Zero alerts, healthz/database/Redis green, reader HTTP 200, all 36 sources healthy, no failed retained digest jobs; next edition Nov 5 15:00 UTC.
- Checked official xAI model/pricing/tool docs and authenticated read-only GET /v1/models: grok-build-0.1 is listed/available at $1/$2 per million versus 4.3 $1.25/$2.50. Function calling is documented; built-in x_search compatibility remains unverified. No model/provider switch or inference calls.
- Reconciled all 11 original settlements: 68,517 input/24,672 output tokens, 47 posts/zero profiles; $0.382331 after per-call rounding. Identical-usage Build pricing saves only $0.02946525 (7.7%); this is a counterfactual, not measured model performance. Fetch charges dominate. Private source snapshots/assessment saved mode 600; originals and journal untouched.
- Documented model-round prerequisites: after second-day style/calibration, measure actual search support and ≥90% passing yield; request model, settlement rates and manifest must agree. Existing runner stays unchanged; no more experiment safeguards or speculative machinery.
- Updated TASKS and experiment review; archived iterations 702–703 to bound PROGRESS. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no source/runtime change or new owner blocker. No restart under STEERING 22.
- Verification: pnpm format, pnpm lint:fix, pnpm check (490 unit/213 isolated integration, exit 0), pnpm build, handbook validation and git diff --check passed.
- Next: second independent experiment day, threshold calibration and model round within shared caps; Nov 5 grouping/NBA AI/cost/latency/screenshots take priority when due. Fixed A/B remains off pending decision.

## 2026-11-04: iteration 717 — UI foundations: routing and saved-edition deep links

- Started clean on main; no leftover work. Zero alerts, local health/database/Redis green, 36 active sources with zero errors and zero failed digest jobs. Second independent X news day and Nov 5 scheduled checks remain future; progressed STEERING 33 under item 22.
- Preserved current page inside code-based TanStack Router with TanStack Query provider (60-second stale default). Added canonical /editions/:id, validated legacy-link redirect, route error/retry and not-found screens. Current fetching stays unchanged; Tailwind/shadcn, Inter/theme and resource hooks remain in foundations.
- Server history fallback now excludes API roots and all specified tool/proxy prefixes. Edition/history/status links and existing smoke selectors use canonical routes. No admin pages or authorization behavior changed; those follow foundations per the spec.
- Verification: pnpm format, pnpm lint:fix, pnpm check (475 unit; 213 integration cases reported success before exit 143, then clean isolated integration rerun), pnpm build, check-handbook.ts and git diff --check passed. Handbook initially exceeded 100 lines; shortened the addition and revalidated.
- Restarted news-digest-api for changed runtime; local health green. smoke-ui-routing, smoke-edition-selection, smoke-edition-history, smoke-ui and smoke-status passed desktop/mobile using real stored content; history completion/failure checks remain explicitly simulated, with no writes or provider calls.
- Viewed desktop/mobile routing screenshots in docs/screenshots/ui/. Discarded unrelated telemetry screenshot churn from broad smoke checks. HTTPS app hostname resolves to private 10.42.0.42 and refuses port 443 from this VM; proxy access unverified, localhost endpoints/browser checks pass.
- Compacted TASKS and archived iterations 704–705; updated affected handbook pages; SOURCES/NEEDS_FROM_HUMAN unchanged (no source or new owner requirement). No paid calls, model/provider/budget changes or fixed A/B activation.
- Next: finish foundations (Tailwind v4/shadcn, Inter/theme and query hooks), then admin gate; return first to Nov 5 scheduled acceptance and second-day X experiment when due.

## 2026-11-04: iteration 718 — shared query resources for UI foundations

- Started clean on main; no leftover work. Zero alerts, local health/database/Redis green, 36 sources healthy, zero failed digest jobs; next edition Nov 5 15:00 UTC. Scheduled acceptance and second independent X day remain future.
- Replaced App's manual fetch effects with shared TanStack Query resources for topics, profile, incoming content and health. All responses parse shared contracts, requests accept cancellation, route loaders prefetch with ensureQueryData, and settings callbacks update/invalidate caches. Edition/status fetching remains for a later foundation slice.
- Browser check proves one request per shared resource under StrictMode and fresh-cache reuse across client navigation. Explicit malformed content/health responses are rejected without hiding topics or edition. Saved/viewed desktop/mobile screenshots in docs/screenshots/ui/; existing layout preserved.
- Desktop/mobile routing, delayed edition selection, topic create/delete/order/availability and schedule checks passed; writes replayed in browser only, real stored content read unchanged. One immediate post-restart browser attempt raced readiness; health checked and rerun passed.
- Verification passed: pnpm format, pnpm lint:fix, pnpm check (475 unit; 213 integration cases reported success before exit 143, then clean isolated integration rerun), pnpm build, final web typecheck/build, check-handbook.ts 01-stack-and-runtime and git diff --check. Updated stack handbook; discarded unrelated smoke screenshot churn. SOURCES/NEEDS_FROM_HUMAN unchanged: no source or new owner requirement.
- Restarted API for changed served assets; worker unchanged under STEERING 22. No paid calls, model/provider/budget changes or fixed A/B activation.
- Next: finish foundation edition/status query migration and Tailwind v4/shadcn, Inter/theme, then admin gate. Second independent X experiment day and Nov 5 scheduled grouping/NBA AI/cost/latency checks take priority when due.

## 2026-11-05: iteration 719 — share status and manual-edition budget queries

- Started clean on main; no leftover work. Zero alerts, health/database/Redis green, 36 sources without active errors, zero failed retained digest jobs and 942 articles in current topic coverage. Nov 5 scheduled acceptance and second independent X window remain future.
- Moved status polling and manual-edition budget notices onto one shared, contract-validated TanStack Query resource; route prefetch avoids duplicate initial requests. Manual generation still refreshes budget status before submitting. Minute polling, refresh button, cached snapshot on failure and recovery remain available.
- Playwright smoke-query-resources passed navigation cache reuse, one request per resource, malformed status with retained data/recovery, and isolated malformed health/content. Saved/viewed desktop/mobile status screenshots in docs/screenshots/ui/. smoke-reserve-status and smoke-edition-selection passed, using real stored reads and explicitly simulated error/budget states; no writes or inference.
- Verification: pnpm format, pnpm lint:fix, pnpm check (475 unit; 213 integration cases reported success before exit 143, then clean isolated integration rerun), pnpm build, final web build, check-handbook.ts 01-stack-and-runtime and git diff --check passed. Full check began before the final budget-consumer migration; final web build, lint and browser checks cover that change.
- Restarted API for changed assets; worker unchanged under STEERING 22. Updated runtime handbook/TASKS; archived iterations 706–707 and discarded unrelated reserve screenshot churn. SOURCES/NEEDS_FROM_HUMAN unchanged: no source/runtime integration or new owner blocker. No paid calls, model/provider/budget changes or fixed A/B activation.
- Initial push rejected (remote advanced); merged owner commit 27eb666 without rewriting history. STEERING 34 supersedes old X experiment/design: current UI step finished, next change experiment/disabled schedule queries without paid calls; scorer after Nov 5 edition, test rounds after 21:00 Nov 5/6, Grok 4.3 unchanged. Nov 5 acceptance/protections first; return to UI foundations while waiting.

## 2026-11-05: iteration 720 — viral X query and disabled single-slot schedule

- Started clean on main; no leftover work. Zero alerts, health/database/Redis green, source snapshot healthy and no failed digest jobs. Nov 5 15:00 UTC acceptance is still future.
- Added shared viral query construction: 8–10 fresh description-based OR terms, code-built exact UTC since/until, reply/retweet/language filters, stored trending minimum and mandatory -giveaway. Grok 4.3 unchanged; requests 16 posts with 4,000 output tokens and retains 16 citations rather than five.
- Disabled fixed schedule now prepares one viral slot/topic, no article loading or reaction slots. Exact edition window and existing fixed-trending ledger identity retained; four $0.10 reservations fit $0.40. Legacy production discovery, scorer/cache keys and activation flag unchanged.
- Experiment preparation exposes requests.viral without article context. Historical runner/report/extractor still use old styles: next update them for viral + test-only semantic searches and remove article readiness; do not dispatch the legacy runner. Historical constructors remain for old evidence.
- Verification: 23 targeted fixture cases, pnpm format, pnpm lint:fix, pnpm check (479 unit, 213 isolated integration, exit 0), pnpm build, check-handbook.ts 05-social-posts and git diff --check passed. Initial direct invocation included DB tests without the isolation harness and was correctly rejected; full isolated check passed.
- Updated social handbook, experiment notes and TASKS. No UI changes/screenshots required; SOURCES/NEEDS_FROM_HUMAN unchanged. No paid calls, provider/model/budget changes or scorer changes.
- Restarted API, worker and docs for changed runtime/handbook; health passed after readiness retry. Next: finish experiment harness before rounds after 21:00 Nov 5/6; Nov 5 scheduled acceptance first when due, scorer only afterward.

## 2026-11-05: iteration 721 — article-free viral experiment preparation

- Started clean on main; no leftover work. Zero alerts, health/database/Redis green, 36 healthy sources, zero failed digest jobs; latest stored edition has four topics. Nov 5 15:00 UTC acceptance remains future.
- Read-only experiment CLI now emits only viral keyword and test-only semantic requests from topic descriptions/settings, without article loading or article readiness. Semantic requests ask for eight results, exact window, saved likes minimum/exclusions and mandatory -giveaway; Grok 4.3 and media understanding off unchanged.
- Historical constructors remain for old evidence. Legacy runner rejects revised inputs before dispatch/reservation (fixture verified); runner/report/extractor migration remains next. Do not dispatch it for the new rounds.
- Read-only real preparation confirmed four ready topics and approved Tech/NBA/Gaming/World thresholds 500/1000/500/2000, including NBA exclusions. No paid calls, cache writes, scorer changes, model/provider changes or activation.
- Verification: targeted input/runner tests 10/10, pnpm build and full pnpm check passed (481 unit, 213 isolated integration, exit 0). pnpm format and pnpm lint:fix run before commit; git diff --check clean.
- Updated TASKS and experiment instructions; archived iterations 708–709 to keep PROGRESS small. SOURCES/NEEDS_FROM_HUMAN unchanged: no source or new owner blocker. No UI changes. Services remain healthy; no restart under STEERING 22 because only offline scripts/tests/docs changed.
- Next: migrate runner/report/extractor to viral + semantic; scorer only after Nov 5 edition, rounds after 21:00 UTC Nov 5/6. Scheduled acceptance/protections first when due.

## 2026-11-05: iteration 722 — revised X experiment runner

- Started clean on main; no leftover work. Zero alerts, health/database/Redis green, all 36 sources healthy and zero failed retained digest jobs. Nov 5 scheduled acceptance remains future (15:00 UTC).
- Runner now consumes article-free viral/semantic preparation and dispatches eight cells (four per style), staying on Grok 4.3. Legacy inputs are rejected before private round creation, reservation or provider dispatch.
- Existing separate $2.50 total/$1 daily ledger, $0.15 per-call reservation, one-hour comparison, protected hours and unknown-outcome no-retry behavior remain. Fixture tests verify eight settled calls, immediate overrun stop, continuation without retry and legacy rejection.
- Verification: targeted runner tests 4/4; pnpm format, pnpm lint:fix, pnpm check (481 unit, 213 isolated integration, exit 0), pnpm build and git diff --check passed. No UI/runtime changes or screenshots needed.
- Updated TASKS and experiment instructions. SOURCES/NEEDS_FROM_HUMAN unchanged; no source change or new owner blocker. Healthy services left running under STEERING 22 because only offline scripts/tests/docs changed.
- No paid calls, scorer/cache changes, model/provider changes or production activation. Next: migrate report/extractor to viral/semantic before rounds after 21:00 UTC Nov 5/6; prioritize scheduled acceptance and only then scorer changes.

## 2026-11-05: iteration 723 — revised X experiment call report

- Started clean on main; no leftover work. Zero alerts, health/database/Redis green, 36 healthy sources and zero failed retained digest jobs. Nov 5 15:00 UTC scheduled acceptance remains future.
- Offline report accepts viral/semantic evidence with saved likes minimum and mandatory giveaway exclusion. Added usable yield and confirmed IDs requiring exact window, relevance ≥6, no promotion, minimum likes and explicit absence from free links. Missing labels/likes/overlap keep totals unknown; historical eligibility stays unchanged.
- Viral execution evidence now checks OR and exact UTC time operators. Semantic execution compliance remains unknown rather than applying keyword checks. Legacy round comparator rejects revised calls pending migration; extractor and round comparison remain next.
- Verification: targeted report/CLI/comparison tests 26/26; pnpm format, pnpm lint:fix, pnpm check (484 unit, 213 isolated integration, exit 0) and pnpm build passed. git diff --check clean.
- Updated TASKS and experiment instructions. SOURCES/NEEDS_FROM_HUMAN unchanged: no source change or new owner blocker. No UI/runtime changes or screenshots; healthy services remain running under STEERING 22.
- No paid calls, scorer/cache changes, provider/model/budget changes or activation. Next: migrate extractor and comparison before Nov 5/6 test rounds; scheduled acceptance first, scorer only afterward.

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
