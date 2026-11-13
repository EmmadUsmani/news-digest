# Progress

Earlier entries: [archive before iteration 2155](docs/progress-archive/2026-11-13-iterations-before-2155.md).

Archived entries: [iterations 2146–2154](docs/progress-archive/2026-11-13-iterations-2146-2154.md).

## 2026-11-13: iteration 2155 — retain actual Bluesky collection evidence

- Clean main; no inherited work. Initial `pnpm obs alerts` zero; `/healthz` database/Redis pass. Scheduled NBA/item 58 acceptance still due at 15:00 UTC; deployment hold respected.
- Added `scripts/report-bluesky-collections.ts`: bounded Redis ZREVRANGE/HMGET reads export retained actual query/window/count results and failure presence without collecting, modifying jobs or exposing error text.
- Live read-only export captured 24 completed five-topic passes and two older failures. Assertions validate completed status, five topics, query strings and nonnegative counts; unexpected arguments fail before Redis access. Export retained mode 600 at `/tmp/bluesky-collections-2155.json`.
- Latest 13:54 UTC run: World fallback 46 submissions/U.S. Congress 49. Shared 48-job retention covers roughly 24 Bluesky passes, not 48; documented 12-hour capture cadence and absence of observation-level query attribution.
- Updated TASKS/SOURCES and pilot contract; archived older PROGRESS entries after 25 KB. No provider calls, live writes, budgets, generation, configuration or sharing changes. NEEDS_FROM_HUMAN unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, filtered handbook/schema check and `git diff --check` pass; existing build warnings only. `pnpm check` passes: 966 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green.
- No service restart during hold; production unchanged. Next: scheduled NBA/item 58 acceptance, then private public-mode activation outside hold; World pilot activation follows those gates.

## 2026-11-13: iteration 2156 — review saved X content and correct stale World status

- Clean main; no inherited work. Initial `pnpm obs alerts` zero; `/healthz` database/Redis pass. NBA/item 58 gate still due at 15:00 UTC; deployment hold respected.
- Read all 18 saved Nov 12 X texts and notes; documented topic-level reporting, announcements, political attribution and media limitations in `docs/edition-reviews/2026-11-12-x-quality.md`.
- World now has four X picks, all cited by daily keyword search; removed stale Nov 9 absence from TASKS. Nine of 18 total X picks are daily-search citations, eight outside-list; no exclusive first-discovery attribution claimed.
- GET-only assertions pass: immutable edition ID, all 18 publication times within saved window, all official metrics empty. `report-x-discovery.ts 2026-11-12` confirms five completed successful calls, zero holds, $0.327795 settled. No provider calls or writes.
- Existing Gaming translation/date/repetition and Tech overlap fixes await natural acceptance; viral quality remains open. Updated TASKS/SOURCES; no new generation rules or duplicate repairs. NEEDS_FROM_HUMAN unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, filtered handbook/schema check and `git diff --check` pass; existing build warnings only. `pnpm check` passes: 966 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green.
- No service restart during hold: runtime/configuration unchanged. Next: 15:00 NBA/item 58 acceptance, then private public-mode activation outside hold; World discovery pilot follows those gates.

## 2026-11-13: iteration 2157 — retain saved Bluesky reader baseline

- Clean main; no inherited work. Initial alerts zero. NBA/item 58 scheduled acceptance remains due at 15:00 UTC; deployment hold respected.
- Read all four Nov 12 saved Bluesky texts/context lines: Tech/Gaming repeat selected events, World is a weak link list, NBA supplies attributed media/legal reporting; U.S. historical absence cannot accept its repaired query.
- Added per-topic author/official metric snapshots and concrete next-edition comparisons to the existing pool review; updated TASKS/SOURCES. Existing overlap/award/link-list fixes already cover observed defects; no duplicate rules or provider calls.
- GET-only assertions pass: immutable edition ID, four Bluesky picks, exact saved likes/reposts/replies, window inclusion and U.S. absence. Media references were not fetched; snapshots do not establish growth or viral quality.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts sources`, `git diff --check` pass: 966 unit/291 integration passes, four expected skips; existing build warnings only.
- No runtime/configuration changes or service restarts during hold; budgets, generation and private sharing unchanged. NEEDS_FROM_HUMAN unchanged.
- Next: scheduled NBA/item 58 acceptance, private public-mode activation outside hold, then World discovery pilot and natural social-quality acceptance.

## 2026-11-13: iteration 2158 — verify repaired U.S. Bluesky content supply

- Clean main; no inherited work. Initial alerts zero and `/healthz` database/Redis pass. NBA/item 58 remains due at 15:00 UTC; deployment hold respected.
- Read all 50 safe engaged U.S. candidate texts from stored observations: 55 distinct posts/474 observations, 40 candidate authors/max three per author. Concrete election/investigation reporting exists alongside repeated RFK/class-photo events, petitions and context-free commentary.
- Recorded pre-edition baseline and selection checks in the pool review; updated TASKS/SOURCES. Keep repaired Congress query; no evidence warrants another discovery change before natural selection. Lexical zero does not establish semantic failure.
- Temporary READ ONLY probe removed; mode-600 `/tmp/us-pool-2158.json` retained. Assertions pass for distinct counts, unique URLs, author concentration and publication/observation cutoff bounds. No provider calls, collection, jobs or live writes.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts sources`, `git diff --check` pass: 966 unit/291 integration tests, four expected skips; existing build warnings only.
- Runtime/configuration unchanged; no service restart during hold. NEEDS_FROM_HUMAN unchanged. Next: scheduled NBA/item 58 acceptance, private public-mode activation outside hold, then World pilot/natural social-quality acceptance.

## 2026-11-13: iteration 2159 — passive metrics recovery follow-up

- Clean main; no inherited work. Initial alerts zero; `/healthz` database/Redis pass. NBA/item 58 scheduled gate remains due at 15:00 UTC; deployment hold respected.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`: 24 fresh healthy rules, four uncached queries ≤0.698 s, unchanged process starts and no new evaluator/admission/queue/slow-query failures.
- Neither tier merged during the sample; comparable natural-merge recovery remains unaccepted. Recorded evidence and next passive-probe bound (15:44 UTC) in capacity decision/TASKS. No retuning or forced compaction.
- System journal since 09:53:30 shows isolated worker/API scrape refusals at 10:34/12:31; current probes pass. No new incident inferred.
- No runtime/configuration changes, provider calls, service restarts or live writes. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts observability`, `git diff --check` pass; 966 unit/291 integration passes, four expected skips; existing build warnings only.
- Next: 15:00 scheduled NBA/item 58 acceptance, then private public-mode activation outside hold.

## 2026-11-13: iteration 2160 — scheduled edition exposes triage admission regression

- Clean main; no inherited work. Initial alerts zero, database/Redis healthy. Waited for the natural 15:00 run; no paid replay or collection.
- Edition `f901ba6c-cba3-4116-8539-fd0e92b98ec4` publishes in 97.787 s: five topics/15 stories/20 posts; latest/direct/history agree. All story sections non-AI; World/U.S. stories withheld. NBA/item 58/public activation gates remain open.
- Diagnosed 11 local pre-dispatch triage expirations: four active calls take 16–37 s while queued calls expire at ten seconds. Ledger releases unused holds; no provider errors or budget refusals. No story-editor call exercised NBA repair.
- Offline production `InferenceSlots` reproduction (scaled timers): 15 simultaneous calls, four dispatch/11 `ProviderNotDispatched`, subsequent slot reuse passes. Next priority: bounded multi-topic admission before provider queue, with offline composition proof.
- Fourteen Sonnet admissions immediate, no settlement waits; natural recovery unobserved. Anthropic $0.236599/29 settled calls, 11 released reservations; xAI UTC-day five successes/$0.330667, no pending/uncertain calls. Caps unchanged.
- Repaired U.S. Bluesky naturally publishes two concrete posts (511 read/10 shortlisted); restored presence accepted, overall quality open. All 16 official X metrics empty. Updated daily review, TASKS, SOURCES and security handoff; NEEDS_FROM_HUMAN unchanged.
- `pnpm check` passes: 966 unit/291 integration tests, four expected skips. `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts sources`, `git diff --check` pass; existing build warnings only.
- Runtime/configuration unchanged; no restart during 13:00–16:00 hold. Fix admission before the next scheduled acceptance; public mode remains off/VM private.

## 2026-11-13: iteration 2161 — bound multi-topic inference before budget holds

- Clean main; no inherited work. Initial alerts zero; `/healthz` database/Redis pass. Nov 13 failed story editing remains the highest-priority breakage.
- Added process-shared four-request FIFO admission before reservation across triage, editors and repairs; cache hits bypass it. Queue limited to 64/200 seconds and inherited generation deadline; timeout/overflow degrades without a hold. Provider four-slot/ten-second safety queue, models, prompts and caps unchanged.
- Offline five-topic composition scores 750 candidates in 15 batches with peak four provider calls/four holds, zero missing scores or failures. Separate provider-slot composition, queue overflow/expiry, late transfer, exception cleanup and reuse pass; no live provider calls or replay.
- Updated AI handbook and TASKS. SOURCES/NEEDS_FROM_HUMAN unchanged; NBA/item 58/public activation still require scheduled acceptance.
- Verification: targeted admission 3/3 and triage 27/27; `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts ai-and-budgets`, `git diff --check` pass: 970 unit/291 integration tests, four expected integration skips. Existing build warnings only.
- No deploy/restarts during the explicit 13:00–16:00 UTC hold. Source fix is prepared for deployment after 16:00; runtime remains on previous deployed code. Next: deploy API/worker outside hold, verify health, then accept next normal scheduled edition; no paid generation.

## 2026-11-13: iteration 2162 — verify queued editors retain repair admission

- Clean main; no inherited work. Initial alerts zero; `/healthz` database/Redis pass; no failed user services. Deployment remains blocked by the explicit 13:00–16:00 UTC hold.
- Added offline production-composition regression: nine independent BudgetedLlm editor instances share four provider slots; every initial response fails validation and all nine repairs succeed despite responses exceeding the provider queue allowance.
- Verifies first-wave repairs dispatch before the fifth editor, all 18 calls settle, peak four budget holds and zero leftover holds/provider failures. No live calls, paid replay, prompts, caps or runtime changes.
- Targeted `pnpm exec tsx --test apps/api/test/llm.test.ts`: 48/48 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 971 unit/291 integration tests, four expected skips; existing build warnings only.
- TASKS updated; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged (test-only behavior coverage). No restart during hold; runtime still awaits deployment of 84106006 after 16:00 UTC.
- Next: deploy API/worker outside hold, verify health, then accept the next scheduled NBA edition before item 58/public-mode activation.

## 2026-11-13: iteration 2163 — review scheduled X content during deployment hold

- Clean main; no inherited work. Alerts zero, `/healthz` database/Redis pass, no failed user services. Admission deployment still prohibited by the 13:00–16:00 UTC hold.
- Read all 16 saved X picks from Nov 13 edition `f901ba6c-cba3-4116-8539-fd0e92b98ec4`: concrete NBA/Gaming news, overlapping Tech Gemini recap/rollout and weak computer-demo/project teasers. Existing instructions already cover these weaknesses; no new wording rule.
- Read-only discovery report reconciles five completed keyword calls/$0.330667/zero holds; eight selected daily-search citations, all outside-list. All 16 official metric objects remain empty; viral acceptance open.
- Asserted immutable edition ID, X count, every publication-window timestamp and missing official metrics. Recorded attributed political claims and unexercised Gaming translation/ceremony and World link-list guards in the new daily X review; TASKS/daily review linked.
- No paid calls, media fetches, collection, generation, configuration or runtime changes. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged; no deployment/restart during hold.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `git diff --check` pass: 971 unit/291 integration tests, four expected skips. Documentation-only step; no rebuild/restart needed.
- Next: deploy prepared API/worker admission fix after 16:00 UTC, then review the next scheduled NBA/item 58 acceptance before private public-mode activation.

## 2026-11-13: iteration 2164 — verify admission under deadline expiry and cache load

- Clean main; no inherited work. Initial alerts zero, `/healthz` database/Redis pass, no failed user services. Deployment remains prohibited during 13:00–16:00 UTC.
- Added offline BudgetedLlm composition regression with all four shared slots occupied: cached results return immediately without reservations; queued edition expiry prevents provider dispatch and budget holds; transferred slots and the same service remain reusable.
- Targeted `pnpm exec tsx --test apps/api/test/llm.test.ts`: 49/49 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`, `git diff --check` pass: 972 unit/291 integration tests, four expected skips.
- TASKS updated. Test-only change; no build/restart, paid calls, configuration or runtime changes. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged.
- Next: deploy prepared API/worker admission fix after 16:00 UTC; accept next scheduled NBA edition before item 58/public activation.

## 2026-11-13: iteration 2165 — deploy shared inference admission after hold

- Clean main; no inherited work. Initial alerts zero; health database/Redis pass, no failed services. Waited until after the explicit 13:00–16:00 deployment hold.
- `pnpm check` passes: 972 unit/291 integration tests, four expected skips. `pnpm build` passes with existing bundle-size warning; AI handbook verification passes (18 pages/two diagrams/39 tables).
- Confirmed compiled shared admission, then restarted API/worker at 16:00:23 UTC with no active/waiting queue work. Four-call bound, deadlines, caps, providers and public mode unchanged; no paid replay.
- Post-restart `/healthz`, `check-scheduled-reader.ts 2026-11-13T15:00:00Z` and `smoke-admin-gate.ts` pass. Saved edition f901ba6c-cba3-4116-8539-fd0e92b98ec4 remains five topics/15 stories/20 posts.
- All four queues register one worker; all 38 enabled active sources have recent successes/no errors. Natural Bluesky collection completed 15:54:53; startup reconciles published reserve unchanged. Post-deploy alerts zero/no failed services.
- Updated TASKS/daily review; archived progress iterations 2146–2154 to keep this file small. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: deployment activates already-documented behavior.
- `pnpm format`, `pnpm lint:fix`, `git diff --check` pass. Next: accept Nov 14 15:00 UTC scheduled NBA editing/admission recovery, then item 58/private public-mode gates; lower-priority tuning remains available meanwhile.

## 2026-11-13: iteration 2166 — restore five-topic reader text verification

- Clean main; no inherited work. Initial alerts zero, health database/Redis pass, no failed user services.
- Fixed stale four-topic precondition/output in `smoke-reader-story-text.ts`; rendered topic count still must equal the immutable saved edition, and strict nonempty story checks remain.
- Nov 13 live saved-edition browser run now reaches and correctly fails `Tech & AI: missing story text`: all five Tech summaries are empty, with repeated Claude/Microsoft outage headlines. Gaming repeats QSSR three times. Recorded reader impact in daily review/TASKS; deployed admission repair awaits natural recovery.
- Historical saved edition 3bf10f5b-4c00-48b2-85bd-8e6dac7e3238 passes all four topics, NBA 5/5 summaries, desktop/mobile light/dark, no writes/errors and immutable response comparison. Discarded generated historical screenshot refreshes; no UI change.
- No provider calls, generation, source/configuration changes or runtime changes; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged. Script/docs-only step needs no service restart/build.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `git diff --check` pass: 972 unit/291 integration tests, four expected skips. Initial combined verification process ended with SIGTERM during checks; standalone full rerun passed.
- Next: Nov 14 scheduled NBA/admission acceptance before item 58/public activation; keep strict reader text gate and do not accept today's degraded content.

## 2026-11-13: iteration 2167 — prevent headline-only fallback slots

- Clean main; no inherited work. Initial alerts zero, health database/Redis pass, no failed user services.
- Reader weakness: Nov 13 Tech has five empty cards because fallback admitted articles with no saved source text. Non-AI recency/complete-triage selection now excludes blank excerpts before budgets; shared World/U.S. fallback excludes blank leads. AI headline evidence and immutable saved editions unchanged.
- Read-only replay of the currently retained Nov 13 Tech window: 200 candidates/123 with text; old fallback picks five empty excerpts, new fallback five with 91–337 characters. Retained pool is not the original publication snapshot; no generation/provider calls.
- Targeted `pnpm exec tsx --test apps/api/test/quality.test.ts`: 8/8 pass, including blank/whitespace slots, refill, empty pools and AI admission. Pipeline handbook updated; `check-handbook.ts edition-pipeline` passes (18 pages/one existing diagram/39 tables).
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 973 unit/291 integration tests, four expected skips; existing bundle-size warning.
- Restarted API/worker; `/healthz` and `check-scheduled-reader.ts 2026-11-13T15:00:00Z` pass. Reader response SHA-256 unchanged; 38 enabled active sources have successes/no errors, latest 16:22:47 UTC; post-deploy alerts zero/no failed services.
- TASKS/daily review updated. SOURCES/NEEDS_FROM_HUMAN unchanged: no source, owner decision, budget, provider or public-mode change. Next: scheduled NBA/admission recovery before item 58/private public-mode activation; today's saved edition remains degraded.

## 2026-11-13: iteration 2168 — passive metrics recovery evidence

- Clean main; no inherited work. Initial alerts zero; health database/Redis pass, no failed user services.
- Highest scheduled NBA/item 58 acceptance remains pending Nov 14. Took the permitted short passive probe for the open metrics breakage; no limits/configuration/provider changes.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` passes: 24 healthy rules, four uncached queries ≤0.572 s, unchanged process starts and zero new evaluator errors/missed iterations, admission limits, queue timeouts or slow queries.
- Two natural small merges processed 16,476 rows; no large-tier merge, comparable recovery still unaccepted. `journalctl -u obs-metrics.service --since '2026-11-13 14:43:13 UTC' --no-pager -p warning` has no entries.
- Updated TASKS/capacity evidence; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged. Documentation-only step leaves running services matching main; no restart/build needed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 973 unit/291 integration tests, four expected skips; `git diff --check` passes.
- Next: Nov 14 scheduled NBA/admission acceptance, then item 58/private public-mode activation. Next passive capacity probe no earlier than 17:26 UTC.

## 2026-11-13: iteration 2169 — gate scheduled NBA acceptance on saved AI editing

- Clean main; no inherited work. Initial alerts zero; health database/Redis pass, no failed user services.
- Owner impact: prevent accepting another readable but non-AI NBA fallback as recovery before private public-mode activation.
- Added optional `--require-ai-topic NBA` to the existing GET-only scheduled reader check. Joins protected immutable editorial evidence by edition/window/topic identity; requires AI mode, model, published stories and nonempty summaries. Default publication check remains available.
- Offline controls cover AI/non-AI provenance, blank/empty stories, mismatched editions/windows, missing/duplicate topics and absent model. No inference, generation, budget or stored content changes.
- Live Nov 13 gate correctly exits 1: `NBA: scheduled stories are not AI-edited`; targeted tests pass 2/2. This is the known degraded edition, not a new failure.
- TASKS/public readiness updated; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged. Script-only change requires no build/service restart.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `git diff --check` pass: 975 unit/291 integration tests, four expected skips. Default Nov 13 publication check passes; Nov 14 reports pending.
- Next: run this gate plus normal scheduled-job/editorial review after Nov 14 publication; only then close item 58 and activate public mode privately.
