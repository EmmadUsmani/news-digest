# Progress

Earlier entries: [iterations 269–270](docs/progress-archive/2026-11-03-iterations-269-270.md), [271–272](docs/progress-archive/2026-11-03-iterations-271-272.md), [273–274](docs/progress-archive/2026-11-03-iterations-273-274.md), [275–276](docs/progress-archive/2026-11-03-iterations-275-276.md), [277–278](docs/progress-archive/2026-11-03-iterations-277-278.md), [279–280](docs/progress-archive/2026-11-03-iterations-279-280.md), [282](docs/progress-archive/2026-11-03-iteration-282.md), [283](docs/progress-archive/2026-11-03-iteration-283.md), [284](docs/progress-archive/2026-11-03-iteration-284.md).

## 2026-11-03: iteration 285 — stop stale scheduled X plans after topic edits

- Started clean on main; all four services and health healthy; no leftover work.
- Scheduled X now rereads enabled topic configuration before each paid attempt; disable/delete/add, name, guidance and account edits stop the old tick.
- Coverage count changes remain valid; schedule/day/window checks run after the added read, retaining weakest-first order and daily ledger admission.
- Applies to current account-list scheduling and prepared open mode; production mode unchanged pending item 15 acknowledgement.
- Fake regression cases cover both modes, mid-run topic edits, changing coverage and delayed reads crossing the window or changing schedule.
- Verification: targeted scheduler tests (9 passed), `pnpm format`, `pnpm lint:fix`, `pnpm check` (142 unit/167 integration), `pnpm build`, `git diff --check`.
- Restarted API/worker/docs/schema; all active, health OK, SPA 200, 32 sources error-free with recent success; latest social collection completed.
- Read-only reports: no Nov 3 X calls; scheduled reserve pending at $0.482788 with zero other-spend allowance; latest scheduled edition is Nov 2 fallback (856 ms).
- No paid provider or Reddit requests. Scheduled X/AI evidence remains pending Nov 3 14:30–15:00 UTC; no premature acknowledgement.
- Next: collect scheduled cost/yield and AI timing, acknowledge 15/13/7, enable open search, then durable optional admission and scheduler wiring.

## 2026-11-03: iteration 286 — bound low-yield X followups

- Started clean on main; all four services/health healthy, no leftover work.
- Prepared optional runner now requires 0–2 verified additions from the first open search; missing/invalid counts cannot authorize calls.
- At most one optional attempt per topic, including failure; highest-priority reaction wins, accounts fill topics without valid reactions.
- All open searches must complete first; production remains unchanged pending scheduled evidence and durable optional admission/article wiring.
- Six fake tests cover yield boundaries/invalid counts, failure allowance, reaction priority, budget/settings stops and input immutability.
- Verification: targeted tests (6 passed), `pnpm format`, `pnpm lint:fix`, `pnpm check` (144 unit/167 integration), `pnpm build`, `git diff --check`.
- Restarted API/worker/docs/schema; all active, health OK, SPA/docs/db 200, 32 sources error-free; latest social collection completed.
- Latest real edition has five X posts each for Tech/AI and NBA, zero Gaming/World; social milestone remains incomplete.
- Read-only reports: Nov 3 X calls/cost zero; reserve pending at $0.482788, other-spend allowance zero; latest scheduled run remains Nov 2 fallback (856 ms).
- No paid provider or Reddit requests. Archived iterations 269–270 and prior archive index; compacted task preparation history.
- Next: Nov 3 14:30–15:00 UTC scheduled evidence/acks, open-search switch, then durable optional admission and article wiring.

## 2026-11-03: iteration 287 — article pipeline boundary for X reactions

- Started clean on main; all four services/health healthy; no leftover work.
- Added read-only `loadReactionStories` public boundary: up to two topic/window stories using existing relevance, quality, ranking and clustering, without LLM calls or publication.
- Extracted the edition's existing 200-candidate query unchanged so reaction preparation and edition generation share article loading.
- Fake tests cover ranking/duplicate grouping, relevance/quality/window exclusions, invalid windows, disabled topics and highest-priority reaction handoff.
- Preparation only: production remains account-list pending item 15 acknowledgement; durable optional admission and scheduler wiring remain open.
- Verification: targeted tests (2 passed), `pnpm format`, `pnpm lint:fix`, `pnpm check` (146 unit/167 integration), `pnpm build`, `git diff --check`.
- Restarted API/worker/docs/schema; health and SPA/docs/db checks pass; 32 sources error-free, social collection completed.
- Read-only reports: Nov 3 X calls/cost zero; reserve pending at $0.482788, other-spend allowance zero; latest scheduled run Nov 2 fallback (856 ms).
- No paid provider or Reddit requests. Next: scheduled Nov 3 evidence/acks, open-search switch, durable optional admission and scheduler wiring.

## 2026-11-03: iteration 288 — durable optional X admission

- Started clean on main; all four services/health healthy; no leftover work.
- Added migration 048: separate first/optional topic/day unique slots, parent-call references and durable verification-completion markers.
- Optional admission uses the shared budget lock, requires all enabled topics' open searches/verification complete, a matching successful parent and fewer than three new verified additions; unknown baselines fail closed.
- Rejected/uncertain optional calls consume their slot across processes/restarts; denied projections do not. Existing first-search admission remains unchanged.
- Preparation only: production stays account-list pending item 15 acknowledgement; optional port/execution and scheduler wiring remain open.
- Test covers concurrent admission, index bypass, incomplete verification, three-post threshold, unknown baseline, budget denial, wrong parent and failed/uncertain retries.
- First full check exposed fixture cleanup ordering; corrected citation deletion before parent calls and reran verification.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (146 unit/168 integration), `pnpm build`, `git diff --check`.
- Applied migration 048; restarted API/worker/docs/schema; health and SPA/docs/db 200; 32 sources error-free and latest social collection completed.
- Read-only evidence: Nov 3 X calls/cost zero; Anthropic reserve pending at $0.482788, other-spend allowance zero; next edition 15:00 UTC.
- No paid provider or Reddit requests. Next: scheduled evidence/acks, open-search switch, then optional execution/scheduler wiring.

## 2026-11-03: iteration 289 — optional X executor admission

- Started clean on main; four services and health healthy; no leftover work.
- Extended the ledger port and search executor to carry an optional parent call ID into durable atomic admission for reaction/account searches.
- Reject malformed optional requests before side effects; existing settlement-before-persistence and uncertain-call handling remain in force.
- Fake tests cover both search types, denied admission/no HTTP, success, uncertain HTTP, persistence failure after settlement and invalid parent/context.
- Preparation only: production remains account-list pending item 15 scheduled evidence/ack; verification completion and optional scheduler wiring remain.
- Verification: targeted tests (2 passed), `pnpm format`, `pnpm lint:fix`, `pnpm check` (148 unit/168 integration), `pnpm build`, `git diff --check`.
- Restarted API/worker/docs/schema; all active, health OK and SPA/docs/db 200; 32 sources error-free and latest social collection completed (10 verified).
- Two retained ingestion failures are older Nov 1/2 jobs; sources have recovered. No failed digest runs or stalled collection found.
- Read-only X report: Nov 3 zero calls/cost; Anthropic reserve pending at $0.482788, other-spend allowance zero. Scheduled evidence is not due yet.
- No paid provider or Reddit requests. Next: observe Nov 3 scheduled evidence/acks, switch open search, finish verification completion and optional scheduler wiring.

## 2026-11-03: iteration 290 — scheduled X verification completion

- Started clean on main; no leftover work; services/health healthy and all 32 sources error-free.
- Wired the scheduler's bounded official verification pass to durable open-search completion, after settlement and citation persistence.
- Only scheduled primary open searches with zero verification errors mark completion; manual/account/reaction searches still verify but cannot unlock optional admission.
- Verification/storage/ledger failures propagate without authorizing optional spend; fake tests cover ordering and these failure paths.
- Production remains account-list pending item 15's first scheduled evidence/ack; optional scheduler execution remains unfinished.
- Verification: targeted fake tests (3 passed), `pnpm format`, `pnpm lint:fix`, `pnpm check` (151 unit/168 integration), `pnpm build`, `git diff --check`.
- Initial lint found missing `void` on test registration; fixed before full checks.
- Restarted API/worker/docs/schema; all active, health OK, SPA/docs/db HTTP 200; latest social collection completed.
- Read-only reports: Nov 3 X calls zero; Anthropic reserve pending at $0.482788, other-spend allowance zero; edition due 15:00 UTC.
- No paid provider or Reddit requests. Next: scheduled evidence/acks, switch open search, wire optional scheduler with persisted parents/yield.

## 2026-11-03: iteration 291 — optional X planner parent forwarding

- Started clean on main; no leftover work; four services and health healthy.
- Followup planning now requires a distinct valid durable primary call ID for every topic and forwards that parent to reaction/account execution and results.
- Missing, malformed or reused parents stop planning before schedule checks or execution; the ledger remains responsible for atomic persisted eligibility and caps.
- Fake tests cover parent forwarding for both paths and invalid/reused parents; production remains account-list pending item 15 evidence/ack.
- Archived iterations 271–272 to keep PROGRESS below 25 KB; preserved their archive links.
- Verified: 10 targeted tests; `pnpm format`, `pnpm lint:fix`, `pnpm check` (153 unit/168 integration), `pnpm build`, `git diff --check`.
- Restarted API/worker/docs/schema; all active, health OK and SPA/docs/schema HTTP 200.
- First full check stopped on formatting of the new archive; formatted it and reran checks.
- Read-only status: 32 sources error-free, no failed digests; latest social collection completed with 10 verified posts, zero errors.
- Nov 3 X spend zero; Anthropic reserve pending at $0.482788 with other-spend allowance zero; next edition 15:00 UTC.
- No paid provider or Reddit requests. Next: scheduled evidence/acks, open-search switch, persisted followup snapshots and scheduler wiring.

## 2026-11-03: iteration 292 — persisted open-search followup evidence

- Started clean on main; no leftover work. Four services/health healthy; 32 sources error-free and no retained failed jobs.
- Added a read-only repository reader for durable completed primary open-search IDs and incremental currently verified additions per enabled topic/day.
- Missing/unfinished verification, failed calls and unknown historical attribution cannot produce a completed planning snapshot; ledger admission still revalidates under its lock.
- Extended disposable-DB integration assertions for restart recovery, zero/three/two additions, unknown attribution and invalid/other dates; no external calls.
- Production remains account-list pending item 15 scheduled evidence/ack; optional scheduler wiring remains unfinished.
- Verified: `pnpm format`, `pnpm lint:fix`, `pnpm check` (153 unit/168 integration), `pnpm build`, `git diff --check`.
- Restarted API/worker/docs/schema; all active, health OK, SPA/docs/db HTTP 200.
- Read-only Nov 3 X report: zero calls/cost/holds; scheduled evidence still due before the 15:00 UTC edition. No paid provider or Reddit requests.
- Next: observe scheduled evidence/acks, switch open search, connect persisted followup snapshots to scheduler execution.

## 2026-11-03: iteration 293 — optional X scheduler orchestration

- Started clean on main; four services and health healthy, 32 sources error-free and no failed digests.
- Connected open-mode scheduler orchestration to injected persisted completion/yield, article-story readers and parent-aware optional execution.
- Every enabled topic needs exactly one durable completed primary; reactions precede account fallbacks, with weakest-first order inside each path.
- Rechecks enabled topic settings, saved schedule, UTC day and pre-edition window after evidence/story I/O and before each optional attempt.
- Fake tests cover restart recovery despite rejected duplicate primary admissions, durable parents, reaction priority, missing/duplicate evidence, delayed I/O and configuration changes.
- Production remains account-list pending item 15 evidence/ack; production dependency wiring and open-mode activation remain.
- Archived iterations 273–274 to keep PROGRESS bounded. Historical GamesRadar/DeepMind failed ingestion jobs have newer successful collections; no current outage.
- Verified: 11 targeted tests; `pnpm format`, `pnpm lint:fix`, `pnpm check` (155 unit/168 integration), `pnpm build`, `git diff --check`.
- Restarted API/worker/docs/schema; all active, health OK and SPA/docs/db HTTP 200. Latest social collection verified 10 posts without errors.
- No paid provider or Reddit requests; Nov 3 X spend remains zero. Next: scheduled evidence/acks, then open-mode production wiring and activation.

## 2026-11-03: iteration 294 — production X dependency wiring

- Started clean on main; four services/health healthy, all 32 sources error-free and no failed digests; retained historical ingestion failures remain recovered.
- Worker now connects persisted open completion/yield, article-ranked reaction stories, parent-aware search and official verification through one shared runtime.
- Production defaults to account-list; open-topic activation still waits for the first scheduled item 15 run and acknowledgement.
- Five fake-only runtime tests cover default mode, completion-before-followup order, durable parent forwarding, verification errors, budget rejection and persistence failure.
- Updated social handbook and TASKS; archived iterations 275–276 to keep PROGRESS bounded.
- Initial full check stopped on archive formatting; corrected and reran successfully.
- Verified: `pnpm format`, `pnpm lint:fix`, `pnpm check` (160 unit/168 integration), `pnpm build`, `git diff --check`; handbook social page/24-table metadata check passed.
- Restarted API/worker/docs/schema; all active, health OK and SPA/docs/db HTTP 200; latest real edition has four story sections, Gaming/World posts still empty.
- Read-only Nov 3 X report: zero calls/cost/holds; scheduled reserve pending, latest social collection verified 10 posts without errors.
- No paid provider or Reddit requests. Next: measure Nov 3 scheduled X/edition evidence, acknowledge required items, then activate open mode.

## 2026-11-03: iteration 295 — handbook ownership acknowledgement

- Started clean on main; API/worker/docs/schema and health healthy, no source errors or failed digest runs.
- Completed STEERING 21 acknowledgement after full handbook validation: 16 pages, 21 diagrams, no render/link errors; all 24 tables assigned, no metadata warnings.
- No handbook content, diagrams, schema metadata or production behavior changed; compacted TASKS and archived iterations 277–278.
- Read-only Nov 3 report: zero X calls/cost/holds; next edition 15:00 UTC, reserve pending at 482,788 micros and other Anthropic allowance zero.
- Items 13/7/15 cannot be acknowledged before scheduled evidence; open-search activation remains gated on item 15 acknowledgement.
- Verified: full handbook check, `pnpm format`, `pnpm lint:fix`, `pnpm check` (160 unit/168 integration), `pnpm build`, `git diff --check`.
- Restarted all four services; active, health OK, app/docs/db HTTP 200.
- No paid provider or Reddit requests. Next: observe scheduled X cost/yield and AI edition timing, acknowledge required items, then activate open search.

## 2026-11-03: iteration 296 — daily X topic/type summaries

- Started clean on main; four services/health healthy, 32 error-free sources and no retained failed jobs.
- Read-only X report now groups cost/holds, fetched posts and incremental verified/outside-list post yield by reservation-time topic ID and search type, including empty/failed calls.
- Unknown charges/fetched counts stay explicit; unattributed historical calls are not assigned inferred topics/types/yield. Same-topic yield avoids attributing unrelated citations.
- Three fake-only tests cover grouping, zero yield, failed calls, unknowns, historical attribution, cross-topic citations and topic renames; updated source inventory/social handbook.
- Initial checks found missing `void` on test promises; fixed before final verification. Removed redundant completed task markers to keep TASKS under 8 KB.
- Read-only live reports: Nov 3 zero X calls/cost/holds; Nov 2 historical call remains $0.023382, unattributed. Scheduled edition remains 15:00 UTC with 482,788-micro reserve pending and zero other allowance.
- No paid provider or Reddit requests; open mode stays gated on item 15 scheduled evidence/acknowledgement.
- Verified: targeted 3 tests; `pnpm format`, `pnpm lint:fix`, `pnpm check` (163 unit/168 integration), `pnpm build`, `git diff --check`; social handbook/24-table metadata check passed.
- Restarted API/worker/docs/schema; all active, health OK, SPA/docs/db HTTP 200. Next: scheduled X/edition evidence and required acknowledgements, then activate open search.

## 2026-11-03: iteration 297 — scheduled-run readiness evidence

- Started clean on main; four services/health healthy, 32 sources without errors, all queues available with workers and no retained failed jobs.
- Read-only X/timing reports at 01:27 UTC: zero Nov 3 X calls/cost/holds; 15:00 UTC edition queued, 482,788-micro reserve pending, zero other Anthropic allowance.
- Items 13/7/15 await actual scheduled evidence; item 16 activation stays gated on item 15 acknowledgement. No production settings or application code changed.
- Refreshed ten desktop/mobile Status screenshots using real telemetry; synthetic error checks remain explicitly synthetic. Archived iterations 279–280 to keep PROGRESS bounded.
- First browser run overlapped build asset replacement and timed out on navigation; rerun after build passed all real telemetry, edition links and synthetic failure checks.
- Verified: `pnpm format`, `pnpm lint:fix`, `pnpm check` (163 unit/168 integration), `pnpm build`, `pnpm exec tsx scripts/smoke-status.ts`, `git diff --check`.
- Restarted API/worker/docs/schema; all active, health OK and app/docs/db HTTP 200.
- No paid provider or Reddit requests. Next: observe scheduled X cost/yield and 15:00 AI cost/duration, acknowledge results, then activate open search.

## 2026-11-03: iteration 298 — first-week X evidence report

- Started clean on main; four services/health healthy, 32 sources returning data without errors, all queues available with workers and no retained failed jobs.
- Added read-only `scripts/report-x-week.ts [end-day]`: seven inclusive UTC days, explicit empty days, daily and whole-week topic/type cost/holds, fetched counts, unknown counters and incremental verified/outside-list yield.
- Reuses existing daily evidence and attribution; no provider requests, new discovery, settings writes or inferred historical topics. Current verification/list and incomplete-day caveats remain explicit.
- Updated README, source inventory and social handbook; recorded reporting support under item 9. Items 13/7/15 still await scheduled evidence; open search remains gated.
- Live report through Nov 3: only Nov 2 historical $0.023382 call (unattributed); Nov 3 zero calls/holds. Scheduled edition remains 15:00 UTC with 482,788-micro reserve pending and zero other allowance.
- Verified weekly output against all seven daily reports; rejected four invalid dates; checked leap-day and year boundaries. No paid provider or Reddit requests.
- Verified `pnpm format`, `pnpm lint:fix`, `pnpm check` (163 unit/168 integration), `pnpm build`, social handbook/24-table metadata check and `git diff --check`; archived iteration 281 to keep PROGRESS bounded.
- Restarted all four services; active, health OK, app/docs/db/edition endpoints HTTP 200. No UI change. Next: observe scheduled X/edition evidence, acknowledge required items, then activate open search.

## 2026-11-03: iteration 299 — scheduled evidence gate rechecked

- Started clean on main; no leftover changes. All four services and `/healthz` healthy.
- At 01:36 UTC, all 32 sources had succeeded within 30 minutes without reported errors; all four queues had workers and no retained failed runs.
- Read-only `scripts/report-x-discovery.ts 2026-11-03` confirms zero calls/cost/holds; `scripts/report-edition-timing.ts` confirms the 15:00 UTC delayed edition, pending 482,788-micro reserve and zero other Anthropic allowance.
- Items 13/7/15 remain pending actual scheduled evidence; item 16 activation stays gated by item 15 acknowledgement. No application/settings changes, paid provider calls or Reddit requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (163 unit/168 integration), `pnpm build`, `git diff --check`; services restarted and app/health/docs/db checked after build.
- Next: observe the scheduled X run and 15:00 UTC edition, record actual per-topic yield and AI cost/duration, acknowledge results, then activate open search.

## 2026-11-03: iteration 300 — distinguish recovered ingestion failures

- Started clean on main; no leftover work. All four services and `/healthz` healthy; all 32 sources have successful recent collections and no current errors.
- Investigated two retained ingestion failures: GamesRadar collection and DeepMind XML failures are historical; both subsequently succeeded (01:20 and 01:24 UTC). No retry, source change or deletion of failure evidence needed.
- Read-only X report at 01:41 UTC: zero Nov 3 calls/cost/holds. Timing report: 15:00 UTC edition delayed as expected; 482,788-micro reserve pending, zero other Anthropic allowance.
- Items 13/7/15 still await scheduled evidence; item 16 activation remains gated. No application/settings changes, paid calls or Reddit requests. Archived iteration 282 to keep progress bounded.
- Verified `pnpm format`, `pnpm lint:fix`, `pnpm check` (163 unit/168 integration), `pnpm build`; restarted API/worker/docs/schema, all active; health/app/docs/db/status HTTP 200.
- Next: observe scheduled X per-topic cost/yield and 15:00 UTC edition AI cost/duration, acknowledge required results, then activate open search.

## 2026-11-03: iteration 301 — readiness and weakest-topic baseline

- Started clean on main; no leftover work. All four services healthy; 32 sources collected within 30 minutes with no current errors. The two retained ingestion failures remain historical/recovered.
- Read-only status at 01:45 UTC: rolling-day verified X posts Tech/AI 51, NBA 35, Gaming 21, World 3; World remains weakest. Article counts respectively 332/114/287/220.
- `pnpm exec tsx scripts/report-x-discovery.ts 2026-11-03`: zero calls/cost/holds. `pnpm exec tsx scripts/report-edition-timing.ts`: scheduled edition delayed until 15:00 UTC, reserve 482,788 micros pending, other allowance zero.
- No application/settings changes: items 13/7/15 still need actual scheduled evidence; item 16 activation remains explicitly gated by item 15 acknowledgement. No paid provider or Reddit requests.
- Verified `pnpm format`, `pnpm lint:fix`, `pnpm check` (163 unit/168 integration), `pnpm build`; restarted all four services, active; health/app/docs/db/status HTTP 200. No UI change.
- Updated task handoff and archived iterations 283–284 to keep PROGRESS under 25 KB. Next: observe scheduled per-topic X cost/yield and 15:00 edition AI cost/duration, acknowledge required evidence, then activate open search.
