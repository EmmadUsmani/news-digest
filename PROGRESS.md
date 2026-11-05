## 2026-11-04: iteration 708 — wire default-off fixed A/B discovery

- Started clean on main; no leftover work. Zero alerts, healthz/database/Redis healthy, 36 healthy nonempty sources and zero failed retained digest jobs; next edition Nov 5 15:00 UTC.
- Added exact worker opt-in X_FIXED_SEARCH_ENABLED=1 (default off). Fixed A/B replaces legacy open/followup execution when enabled; stored thresholds/exclusions, ranked article windows, shared caps, reserve/settle and verification remain mandatory. Production flag confirmed off; no paid calls or activation.
- A precedes B; live balance checks drop quiet-topic B first. Consumed A slots do not hide affordable B on restart. Settings, enabled topics and time are rechecked before every call; slow work cannot spend after the window closes.
- Fake-only targeted tests passed 10/10, including composed ledger style/verification, budget ordering, restart slots, config changes and cutoff. Initial fixture omitted story budget/verification completion; corrected. Full check initially rejected duplicate type import; combined imports and reran.
- Verification: pnpm format, pnpm lint:fix, pnpm check (468 unit/213 isolated integration), pnpm build, handbook validation (17 pages/2 diagrams/26 tables, no warnings) and git diff --check passed.
- Updated TASKS, experiment reference and affected schedule handbook; archived iteration 692. SOURCES unchanged: active sources and production discovery behavior unchanged. API/worker restarted; healthz, all 36 sources and alerts green, zero failed digest jobs; worker opt-in still off.
- Next: nightly private backups with real throwaway-container restore proof and 26-hour stale alert; then experiment review/second day. Experiment decision gates activation; Nov 5 scheduled acceptance takes priority when due.

## 2026-11-04: iteration 709 — private nightly backups and restore proof

- Started clean on main; no leftover work. Alerts/healthz green, all 36 sources healthy/nonempty, zero retained failed digest jobs; next edition Nov 5 15:00 UTC.
- Installed 02:20 UTC nightly custom-format pg_dump and Sunday 03:20 UTC isolated restore-check user timers. Both skip 13:00–16:00 UTC; private directory/files 700/600, seven-day retention, no off-VM copies or secrets in logs.
- Dump and all 26 application-table counts share an exported repeatable-read snapshot. Atomic completion manifest/checksum and success metric follow successful dump only; failed dumps never prune or advance freshness.
- Real service restore into network-isolated postgres:17-alpine matched 26 tables/22,191 rows; disposable container/volumes removed. Weekly proof receipt stays private. Initial manual backup exposed conflicting subprocess capture options; fixed before installation.
- Added DatabaseBackupStale to local vmalert for missing or >26-hour success; fake cases cover absent, overdue and recovered. Initial recovery test used epoch-zero timestamps; corrected to vmalert's documented Jan 2000 start. Four Python safeguard checks cover retention, partial files, corrupt dumps and failed dumps, included in the unit suite.
- Verification: pnpm format, pnpm lint:fix, pnpm check (469 unit/213 isolated integration), pnpm build, handbook validation (18 pages/22 diagrams/26 tables), systemd unit verification and git diff --check. Initial full check caught missing void on the Node test; fixed and reran. check-observability --verify-alerts passed (16 rules, zero alerts).
- Updated TASKS/STEERING acknowledgement and affected Operations/schedule handbook; split restore instructions to keep pages short; archived iteration 693. SOURCES/NEEDS_FROM_HUMAN unchanged. No app/runtime/provider changes; API/worker restart unnecessary under STEERING 22. Alert service restarted; backup/restore services ran successfully.
- Next: offline experiment review/second independent day under existing caps; Nov 5 grouping/NBA AI/cost/latency/screenshots take priority when due. Fixed X scheduling stays off until the experiment decision.

## 2026-11-04: iteration 710 — review saved X experiment candidates

- Started clean on main; no leftover work. Zero alerts, healthz/database/Redis healthy, all 36 sources active/nonempty without errors, all queues available with workers; next edition Nov 5 15:00 UTC.
- Retrieved official oEmbed for all 47 saved experiment citations, privately (47 successes, no errors). Manual visible-text promotion review: six definite promotions, 26 without explicit promotion in visible text, 15 unresolved. Truncated/media-dependent cases and every social-triage score remain unknown; no fabricated AI scores or winner.
- Found giveaways in Tech/Gaming trending and betting content in NBA current/trending. Saved reviewed evidence/report separately; original responses/journal unchanged. Gaming's unknown $0.15 hold remains charged. No paid calls, ingestion, production parameter changes or fixed-schedule activation.
- Read-only repeatable-read World snapshot reproduces 200/200 eligible candidates: empty required phrases admit Guardian US NFL article, ranked first by recency (9.94 vs midterms 9.93). Recorded exact policy, pool and ranked evidence privately; no new relevance rules or owner-setting edits.
- Added detailed experiment review and linked it from TASKS/experiment reference; archived iterations 695–696 to bound PROGRESS. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no source/runtime changes or new owner blocker. No service restart under STEERING 22 because only documentation changed.
- Verification: private review coverage/assertions and offline report command passed; pnpm format, pnpm lint:fix, pnpm check (469 unit/213 isolated integration), pnpm build, handbook link/metadata check (18 pages/26 tables) and git diff --check passed.
- Next: second independent news day, threshold calibration/model comparison within shared experiment caps; Nov 5 grouping/NBA full-AI/cost/latency/screenshots take priority when due. Production fixed A/B remains off pending decision.

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
