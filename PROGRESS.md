# Progress

Earlier entries: [archive before iteration 2155](docs/progress-archive/2026-11-13-iterations-before-2155.md).

## 2026-11-13: iteration 2146 — trace effective Bluesky discovery queries

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. NBA/item 58 awaits 15:00 UTC; generation cutoff preserved, public mode off.
- Traced weak World supply to a concrete configuration gap: no explicit query or positive phrase list, so collection searches the display name `World news & politics`. Tech/Gaming fallback queries are `AI`/`game`.
- Read-only coverage report now shows effective query and fallback source. Historical Nov 12 World/Tech/Gaming observations represent 46/52/51 distinct posts; alternative query quality remains unmeasured.
- Default/historical reports pass. Separate `collectBlueskyTopics` invocation with current topics and fake search/storage matches all five reported queries; zero provider calls or database writes. Updated TASKS/SOURCES/pool evidence; NEEDS_FROM_HUMAN unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 966 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warning; `git diff --check` clean.
- API/worker/docs restarted before the protected window; health database/Redis pass, 38 sources/zero unhealthy, Nov 12 saved reader passes five topics/25 stories/22 posts. No generation, collection configuration, budget, flag or sharing changes.
- Next: scheduled NBA/item 58 acceptance, then private-sharing activation outside 13:00–16:00; explicit World discovery query tuning follows the scheduled gate.

## 2026-11-13: iteration 2147 — distinguish weak supply from author concentration

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. Scheduled NBA/item 58 acceptance remains due at 15:00 UTC; generation cutoff preserved.
- Read-only Bluesky coverage now reports distinct authors and per-author distinct posts within the capped safe engaged pool, using the ranker's latest valid snapshots.
- Historical World: 29 candidates/25 authors/max two posts per author; rolling World: 19/16/two. Weak discovery is not explained by one dominant author. Rolling U.S.: 50/37/six; relevance/event diversity still unmeasured.
- Default and historical report commands pass. Independent Python JSON assertions reconcile candidate totals, unique authors and maxima for all five topics, including the empty historical U.S. pool. No provider requests or database writes.
- Updated TASKS/SOURCES/pool evidence; NEEDS_FROM_HUMAN unchanged. No collection/query, generation, budget, flag or sharing changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 966 unit/291 integration tests, four expected skips. `pnpm build` passes with existing bundle warning; `git diff --check` clean.
- API/worker/docs restarted before protected window. Initial health probe raced startup; repeat `pnpm obs health --check` and `/healthz` pass database/Redis. Sources check passes; saved-reader check Nov 12 verifies five topics/25 stories/22 posts.
- Next: 15:00 scheduled NBA/item 58 acceptance, then private-sharing public activation outside 13:00–16:00; explicit World query tuning follows the gate.

## 2026-11-13: iteration 2148 — verify private activation rollback artifacts

- Clean main; no inherited work. Alerts zero; health database/Redis pass, 38 sources healthy, digest worker available with Nov 13 15:00 UTC scheduled run pending.
- Completed concrete item 50 rollback preparation while NBA/item 58 waits: `python3 ops/backups/database.py backup` created a 17,053,163-byte snapshot; `python3 ops/backups/database.py restore` verified checksum and all 39 tables/98,127 rows in an isolated container, then removed it. Live database not restored.
- Verified private dump/manifest permissions and receipt-to-backup match. Created byte-identical mode-600 environment rollback copy under a mode-700 private directory; contents never printed. Recorded artifact paths and live migration head in `docs/public-activation-record.md`.
- Updated TASKS with preparation evidence; baseline and artifacts must be refreshed after scheduled acceptance. SOURCES/NEEDS_FROM_HUMAN unchanged: no source behavior or owner request changed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 966 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warning; `pnpm exec tsx scripts/check-handbook.ts public-activation-record` and `git diff --check` pass.
- No runtime code, collection/query, generation, budget, public flag or sharing changes. No service restart needed for operational receipts/docs; deployed runtime remains unchanged.
- Next: accept scheduled NBA AI editing/item 58 at 15:00, then refresh baseline and activate public mode with private sharing outside 13:00–16:00 UTC.

## 2026-11-13: iteration 2149 — measure World discovery alternatives

- Clean main; no inherited work. `pnpm obs alerts`: zero alerts. NBA/item 58 scheduled gate remains pending at 15:00 UTC; no activation or deployment.
- Followed STEERING 59's while-waiting work: read all 20 safe engaged stored World candidates; domestic/Tech news and generic bulletins explain poor scope as well as low engagement.
- Added read-only `probe-bluesky.ts --world`, refusing `--store`; four official free searches share one 24-hour window and existing two-page/50-post limits.
- Actual probe: fallback 46 returns/19 engaged/max seven likes; Ukraine 50/50/5,748; Gaza 49/49/1,589; geopolitics 50/38/114. Top texts favor specific event discovery; geopolitics is not a suitable blanket replacement.
- Recorded comparison and next bounded event-rotation step in TASKS/SOURCES/pool evidence. Raw probe posts are not stored, safety-selected or independently verified. No paid inference, query configuration, budget, schedule, sharing or public-mode changes.
- Verification: same-window/bound assertions pass for all 195 returns; three invalid CLI combinations refuse before external calls. `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 966 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green.
- `pnpm build` passes (existing bundle warning); handbook/schema checker passes; `git diff --check` clean. No runtime change or service restart; protected deployment window respected. NEEDS_FROM_HUMAN unchanged.
- Next: 15:00 scheduled NBA/item 58 acceptance, then private-sharing activation outside 13:00–16:00; preserve aggregate allowance when implementing World event discovery.

## 2026-11-13: iteration 2150 — bound the World discovery pilot before activation

- Clean main; no inherited work. Initial alerts zero; health database/Redis pass. Scheduled NBA/item 58 gate remains due at 15:00 UTC; protected deployment/generation hold respected.
- Added a concrete opt-in World pilot contract: alternate unchanged fallback with Ukraine/Gaza, 12/6/6 searches per UTC day, explicit override precedence, deterministic hourly slot, acceptance and rollback. Implementation/activation remain behind higher-priority gates.
- `pnpm exec tsx scripts/rehearse-world-bluesky-rotation.ts` reads local topic metadata then uses real collection with fake search/storage: 24 simulated hours/120 planned searches, unchanged other topics, unchanged inputs and 24-hour windows. Derived bounds remain 240 pages/6,000 submissions. No provider calls or live writes; this does not establish post quality or implement rotation.
- Invalid `--store` argument refuses before metadata/provider access. Initial temporary rehearsal failed on CJS top-level await; replaced by the committed async-main script, which passes.
- Updated TASKS/SOURCES and rollout plan; archived iterations 2135–2137 as PROGRESS exceeded 25 KB. NEEDS_FROM_HUMAN unchanged; no owner decision needed.
- Initial full lint/check caught fake-port require-await errors; corrected to explicit promises. Final `pnpm lint:fix` and `pnpm check` pass: 966 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warning; `pnpm exec tsx scripts/check-handbook.ts world-bluesky-discovery` and `git diff --check` pass.
- No runtime code/config, budget, schedule, public-mode or sharing changes; no service restart required. Next: 15:00 scheduled NBA/item 58 review, private-sharing activation outside hold, then bounded discovery implementation.

## 2026-11-13: iteration 2151 — rehearse collector admission and failure boundaries

- Clean main; no inherited work. `pnpm obs alerts` zero alerts; `/healthz` database/Redis pass. NBA/item 58 acceptance remains scheduled for 15:00 UTC; protected deployment window respected.
- Extended the offline World pilot rehearsal with six existing-collector contract checks: explicit override, disabled/zero-budget exclusion, first-five admission, original search/storage error propagation and no later searches after failure.
- `pnpm exec tsx scripts/rehearse-world-bluesky-rotation.ts` passes: 24 hours/120 planned searches, 12/6/6 World allocation, unchanged other topics and inputs; six additional fake-port checks pass. No provider calls or live writes.
- Updated TASKS and pilot plan; rotation implementation/activation and its own rollover/override tests remain pending. SOURCES/NEEDS_FROM_HUMAN unchanged because source behavior and owner needs did not change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, filtered handbook/schema check and `git diff --check` pass: 966 unit/291 integration tests, four expected skips; existing build bundle warning only.
- No runtime/configuration/generation/budget/public-mode changes; no restart during deployment hold. Next: scheduled NBA/item 58 acceptance, then private public-mode activation outside 13:00–16:00 UTC.

## 2026-11-13: iteration 2152 — implement optional World collector rotation

- Clean main; no inherited work. `pnpm obs alerts` zero; `/healthz` database/Redis pass. Scheduled NBA/item 58 gate remains pending; no deployment during 13:00–16:00 hold.
- Implemented optional World topic-ID policy in the collector: fallback/Ukraine/fallback/Gaza from the captured UTC-hour slot. Explicit override wins; no production caller supplies the policy, so live queries remain unchanged.
- Updated the fake-port rehearsal to exercise the policy directly: 24 hours/120 searches, World 12/6/6, unchanged other topics and metadata; six admission/override/failure checks plus eight midnight/retry checks pass, including a moving observation clock.
- `pnpm exec tsx scripts/rehearse-world-bluesky-rotation.ts` passes with zero provider calls/live writes. No generation, prompt, budget, schedule, public-mode or sharing changes.
- Updated TASKS/SOURCES and pilot contract. Scheduler wiring, coverage-report explanation, activation and natural quality remain open; NEEDS_FROM_HUMAN unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, filtered handbook/schema check pass; build retains dependency annotation/bundle warnings. `pnpm check` passes: 966 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green. `git diff --check` clean.
- No restart: production behavior remains unchanged and protected deployment hold applies. Next: 15:00 NBA/item 58 scheduled acceptance, then private public-mode activation outside hold; wire discovery policy afterward.

## 2026-11-13: iteration 2153 — clarify stored Bluesky query provenance

- Clean main; no inherited work. Initial alerts zero; health database/Redis pass. Scheduled NBA/item 58 gate remains due at 15:00 UTC; deployment hold respected.
- Renamed coverage-report query fields to currentUnrotatedCollectionQuery/currentUnrotatedQuerySource; explained optional hourly rotation and the absence of historical query attribution on stored observations.
- Read-only `pnpm exec tsx scripts/report-bluesky-coverage.ts` passes against all five topics (435–662 stored observations each); JSON assertions verify new fields/provenance and removal of misleading effectiveCollectionQuery. No provider calls or writes.
- Updated TASKS/SOURCES and pilot contract; actual hourly results must be retained separately for a future baseline/event comparison. Scheduler wiring/activation remain pending; NEEDS_FROM_HUMAN unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, filtered handbook/schema check pass: 966 unit/291 integration tests, four expected skips. Existing build warnings only; `git diff --check` clean.
- No production service/configuration, generation, budget, public-mode or sharing changes; no service restart during hold. Next: 15:00 NBA/item 58 acceptance, then private public-mode activation outside hold.

## 2026-11-13: iteration 2154 — prepare default-off Bluesky scheduler wiring

- Clean main; no inherited work. Initial alerts zero; health database/Redis pass. NBA/item 58 scheduled acceptance remains due at 15:00 UTC; no restart/deployment during the hold.
- Wired optional World collector policy through exact `BLUESKY_WORLD_ROTATION_ENABLED=1` and explicit `BLUESKY_WORLD_TOPIC_ID`; enabled missing/malformed UUID refuses social startup. Default remains off, with no topic-name inference.
- Fake-port day now uses the scheduler parser: 120 searches, World 12/6/6, unchanged other queries, six collector controls/eight rollover controls/nine config checks. Zero provider calls/live writes.
- Private environment confirmed pilot not enabled, without printing secrets or changing the file. No generation, budget, public-mode or sharing changes.
- Updated TASKS, SOURCES, pilot contract and jobs handbook; activation still follows NBA/item 58 and private public-mode gates. NEEDS_FROM_HUMAN unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts jobs-and-schedules` and `git diff --check` pass: 966 unit/291 integration passes, four expected skips. Initial formatting failure corrected; existing build warnings only.
- No service restart: production unchanged and hold applies. Next: scheduled NBA/item 58 review, private public-mode activation outside hold, then discovery deployment/activation and retained hourly results.

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
