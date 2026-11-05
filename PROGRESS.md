## 2026-11-04: iteration 711 — reuse saved triage for experiment reaction inputs

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 healthy sources and zero failed retained digest jobs; Nov 5 15:00 UTC review remains future.
- Experiment preparation now reads exact-fingerprint article triage in its read-only snapshot. Saved relevance below 6 is excluded; scored articles rank by importance/relevance before unscored heuristic fallback under the saved relevance policy. No new wording rules or paid calls.
- Preserved cache/model/topic/content identity validation and score provenance; missing/corrupt scores stay unscored. Production reaction loader, thresholds, providers and fixed-schedule flag unchanged. Original round evidence untouched.
- Saved private cached-inputs-711.json (600) beside round 1: World's first three titles now cover midterms, each saved relevance 10/importance 9; 80 cached eligible World articles. This current snapshot is not historical or a second independent news day.
- Verification: targeted triage/reaction tests 27/27; pnpm format, pnpm lint:fix, pnpm check (470 unit/213 isolated integration), pnpm build, handbook (18 pages/22 diagrams/26 tables) and git diff --check passed. Initial lint found async-without-await stubs; fixed and reran. Isolated DB checks cover cache reads and semantic recovery/policy fallback.
- Updated TASKS, experiment reference and Social posts handbook; archived iteration 697. SOURCES/NEEDS_FROM_HUMAN unchanged. Rebuilt/restarted API and worker; healthz green, reader HTTP 200, zero alerts.
- Next: second independent experiment day, then calibration/model comparison within shared caps; Nov 5 grouping/NBA full-AI/cost/latency/screenshots take priority. No winner or production activation.

## 2026-11-04: iteration 712 — score saved X experiment candidates

- Started clean on main; no leftover work. Zero alerts, healthz/database/Redis green, all 36 active sources nonempty/error-free, zero failed retained digest jobs; Nov 5 acceptance remains future.
- Scored all 47 saved round-1 citations with production CandidateTriage social instructions and configured Haiku using saved official oEmbed paragraph text and current topic guidance. Four explicit live verification calls, repairs disabled, cost $0.003209; read back four succeeded ledger rows with purpose=verification and exact total. Existing shared app/reserve and $0.05 verification admission applied.
- Relevance ≥6: current 5/13, trending 6/32, reactions 2/2; by topic Tech 5/14, NBA 2/12, Gaming 3/9, World 3/12. Truncated/media-dependent text not inferred. Six definite promotions/15 unresolved labels unchanged; 17 missing publication times and Gaming's unknown outcome still prevent complete eligible yield or a winner.
- Saved private text, candidates/scores, exact runner, usage/fingerprints and separately joined evidence/report (600). Offline reporter and exact topic/post coverage assertions passed. Original evidence, manual promotion labels and X admission journal/hold unchanged. No X calls, ingestion, production parameter/provider/model changes or activation.
- Verification: pnpm format, pnpm lint:fix, pnpm check (470 unit/213 isolated integration), pnpm build, handbook validation (18 pages/22 diagrams/26 tables) and git diff --check passed. Initial check caught an extra blank line in the newly archived entry; formatted it and reran.
- Updated TASKS and experiment review/reference; archived iteration 698 to keep PROGRESS bounded. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no source/runtime change or new owner blocker. No restart under STEERING 22; services run unchanged main code.
- Next: second non-overlapping experiment day, threshold calibration/model comparison within shared caps; Nov 5 grouping/NBA full-AI/cost/latency/screenshots take priority when due. Fixed A/B remains off pending decision.

## 2026-11-04: iteration 713 — recover X experiment publication times

- Started clean on main; no leftover work. Zero alerts, healthz/database/Redis green, reader HTTP 200, all 36 sources active/nonempty/error-free, no failed retained digest jobs; Nov 5 scheduled checks remain future.
- Recovered 17 missing timestamps offline from X Snowflake IDs in a separate private evidence copy. All 47 UTC dates agree with saved official embed labels; all 30 prior timestamps agree within one second. Exact script/audit/evidence/report saved mode 600; original evidence, scores, promotion labels and budget journal untouched.
- In-window: current 10/13, trending 27/32, reactions 0/2. Both reaction citations predate Nov 3 21:00 UTC, despite passing triage. In-window relevance ≥6 counts are 3/6/0; existing visible-text promotion clearance gives 1/5/0, with 2/1/0 unresolved. No winner: raw promotions, unknown Gaming outcome, malformed trending query and second-day requirement remain.
- No HTTP/provider calls for recovery, ingestion, production parameters/models or activation. Updated TASKS and experiment references/review; archived iteration 699. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no runtime/source change or new owner blocker. No restart under STEERING 22; running code unchanged.
- Verification: private recovery assertions and offline report passed; pnpm format, pnpm lint:fix, pnpm check (470 unit/213 isolated integration), pnpm build, handbook validation and git diff --check passed.
- Next: second non-overlapping experiment day, then threshold calibration/model comparison within shared caps; Nov 5 grouping/NBA AI/cost/latency/screenshots take priority when due. Fixed A/B remains off.

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
- Verification: pnpm format, pnpm lint:fix, pnpm check, pnpm build, handbook validation and git diff --check passed.
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
