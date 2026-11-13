# Progress

Earlier entries: [archive](docs/progress-archive/2026-11-13-iterations-2135-2137.md).

## 2026-11-13: iteration 2138 — compare Tech X picks with selected news

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. NBA/item 58 awaits Nov 13 15:00 UTC; public mode remains off.
- Found Tech selected-story context reached only Bluesky; X/Reddit editing ran without it. One shared Tech-only projection now feeds both final editors, so overlapping posts need a distinct development or original contribution.
- Existing context bounds, comparison-only prompt, cache fingerprint, platform preference, fallbacks and call counts retained. NBA/other topics retain their prior input.
- `pnpm exec tsx --test apps/api/test/social-editorial-selection.test.ts apps/api/test/social-editor.test.ts`: 33/33 pass. New orchestration regression verifies final-edit transport, no story context in triage, simulated empty selection without restoring fallback, omitted context and original text preservation; no semantic compliance claim.
- `pnpm build` passes with existing bundle warning; `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` passes. Updated TASKS, existing overlap review and affected handbook. SOURCES/NEEDS_FROM_HUMAN unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 954 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green.
- API/worker/docs restarted active; `/healthz` database/Redis healthy; 38 sources/zero unhealthy. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z`: five topics/25 stories/22 posts agree.
- No paid calls, manual collection/generation, budget, flag or sharing changes. Next: scheduled NBA/item 58 acceptance, then private-sharing public activation; review natural Tech overlap alongside pending social quality.

## 2026-11-13: iteration 2139 — refuse invented Gaming calendar dates

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. NBA/item 58 still awaits Nov 13 15:00 UTC; public mode remains off.
- Exact saved French Gaming clip note added Nov 19 from other posts and passed prior validation. Gaming-only final validation now requires recognized English/French month dates and ISO dates in notes/rationales to occur in the selected post’s own prose; matching years required when claimed.
- URLs (including bare-domain paths), publication timestamps, other candidates, existing picks and selected stories cannot supply date support. Other topics, including NBA, retain prior instructions/validation; Gaming-specific instructions isolate caches. Existing repair/fallback limits retained.
- Offline saved-note regressions verify rejection and simulated source-bound repair through X/Bluesky and Sonnet/Haiku routes, rationale refusal/exhaustion, equivalent French/English/ISO support and unchanged NBA scope. Narrow date-presence check; other date formats/languages and event/date relationships are outside scope. Natural quality acceptance remains open.
- `pnpm exec tsx --test apps/api/test/social-date-support.test.ts apps/api/test/social-editor.test.ts`: 24/24 pass; added bare-URL regression rerun 2/2. `pnpm format`, `pnpm lint:fix` completed; first check caught import sorting during autofix, final `pnpm check` passes: 958 unit/291 integration, four expected skips; typecheck/lint/format/boundaries green.
- `pnpm build` passes with existing bundle warning; final parser API rebuild passes. `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` passes; no diagram changes. Updated TASKS, affected handbook and existing translation evidence; SOURCES/NEEDS_FROM_HUMAN unchanged.
- API/worker/docs restarted active; `/healthz` database/Redis healthy; 38 sources/zero unhealthy. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z`: five topics/25 stories/22 posts agree.
- No paid calls, manual collection/generation, budget, flag or sharing changes. Next: scheduled NBA/item 58 acceptance, then public activation with sharing private; review natural Tech and social quality.

## 2026-11-13: iteration 2140 — diagnose fifth-topic scheduling latency

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. NBA/item 58 awaits 15:00 UTC; public mode remains off.
- Owner-visible weakness: the five-topic edition takes 232 seconds. Exported 94 allowlisted Nov 12 journal events (22 stages/70 HTTP completions) into a replayable timing fixture; no prompts, responses or credentials retained.
- Found U.S. waits for Gaming to finish under four whole-topic workers: enters editing at 173,524 ms, 53,257 ms after World passed shared politics preparation. The initial `triage` interval includes scheduler waiting, not just provider work. Only 4,512 ms is final single-topic tail.
- Saved cause and bounded next step in the Nov 12 latency review: evaluate staged scheduling offline with existing provider limit, protected reservations, ordered output and rollback draining. No predicted speedup or concurrency/admission change; NBA scheduled acceptance stays first.
- `pnpm exec tsx --test apps/api/test/edition-timeline.test.ts`: 4/4 pass; saved five-topic regression conserves 852,391 HTTP milliseconds and verifies delayed U.S./final tail. Offline evaluator reproduces the 232,297 ms edition interval; GET-only timing report independently matches 70 calls/$0.517657/zero holds.
- `pnpm format`, `pnpm lint:fix` completed; `pnpm check` passes: 959 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warning. Updated TASKS; archived progress 2126–2134 to keep orientation small. No runtime/source/handbook behavior change.
- API/worker/docs restarted active; startup readiness retry passes `/healthz` (database/Redis healthy). 38 sources/zero unhealthy; saved-reader check passes five topics/25 stories/22 posts. SOURCES/NEEDS_FROM_HUMAN unchanged.
- No paid calls, manual collection/generation, budget, flag or sharing changes. Next: 15:00 NBA/item 58 acceptance, then public activation with sharing private; staged scheduling remains an offline follow-up.

## 2026-11-13: iteration 2141 — stage scheduling admission counterexample

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. NBA/item 58 awaits 15:00 UTC; public mode remains off.
- Owner-visible goal: shorten the fifth-topic wait without displacing NBA editing. Added an isolated offline DAG experiment, not a production scheduler; four active slots, dependencies, integer-unit reservations, settlement and protected capacity.
- Synthetic shared preparation releases both politics editors before posts finish. A second scenario proves an earlier U.S. reservation can refuse NBA repair despite four-slot concurrency; a static protected control admits repair but loses U.S. editing. This rules out an unprotected rollout, not a measured speedup.
- `pnpm exec tsx --test apps/api/test/staged-scheduling.test.ts`: 4/4 pass, including credit release, concurrency bounds, refusal propagation and invalid/cyclic inputs. No reconstruction of topic-linked Nov 12 reservations is claimed.
- Updated TASKS and latency evidence. No runtime/source/handbook behavior change; SOURCES/NEEDS_FROM_HUMAN unchanged.
- `pnpm build` passes with existing bundle warning. API/worker/docs restarted; readiness retry passes `/healthz` (database/Redis healthy). `pnpm obs sources --check`: 38 sources/healthy; saved-reader check passes five topics/25 stories/22 posts. Initial source probe used a nonexistent URL (404); corrected to the supported CLI.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 963 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green.
- No paid calls, manual collection/generation, budget, concurrency, flag or sharing changes. Next: 15:00 NBA/item 58 acceptance, then public activation with sharing private; protected admission handoff/failure draining remains an offline scheduling prerequisite.

## 2026-11-13: iteration 2142 — offline staged failure draining

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. NBA/item 58 still awaits 15:00 UTC; public mode remains off.
- Owner-visible goal remains shortening fifth-topic waiting safely. Extended the isolated synthetic scheduler to stop queued dispatch after failure and drain running calls before returning, charging explicit failed/successful costs and releasing each hold once.
- `pnpm exec tsx --test apps/api/test/staged-scheduling.test.ts`: 6/6 pass; new cases cover same-time success/failure, cancelled descendants, longer in-flight completion and simultaneous charged failures. No production scheduler, admission, expiry or provider cancellation change; owned repair-hold handoff remains after NBA acceptance.
- Updated TASKS and latency evidence; SOURCES/NEEDS_FROM_HUMAN unchanged. No source/runtime/handbook behavior change.
- `pnpm format` and `pnpm lint:fix` completed. Initial `pnpm check` caught formatting in the concurrently added progress entry; fixed it, then full rerun passed: 965 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warning.
- API/worker/docs restarted; initial source/reader checks raced startup and failed to connect, then retry passed: `/healthz` database/Redis healthy; 38 sources/zero unhealthy; saved-reader check five topics/25 stories/22 posts.
- No paid calls, manual collection/generation, budget, flag or sharing changes. Next: scheduled NBA/item 58 acceptance, then public activation with sharing private; production scheduling unchanged.

## 2026-11-13: iteration 2143 — reject concealed offline scheduling cycles

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. NBA/item 58 still awaits 15:00 UTC; public mode remains off.
- Found an offline evidence defect: an unrelated failure cancelled cyclic pending jobs before cycle detection, allowing an invalid scenario to return normally. Validate the complete graph before dispatch; no production scheduling/admission changes.
- `pnpm exec tsx --test apps/api/test/staged-scheduling.test.ts`: 7/7 pass; disconnected cycles are refused with unrelated failure in either input order and with an unrelated budget refusal.
- Updated TASKS and latency evidence; SOURCES/NEEDS_FROM_HUMAN unchanged. No runtime/source/handbook behavior change.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 966 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warning.
- API/worker/docs restarted; `/healthz` database/Redis healthy. `pnpm obs sources --check`: 38 sources/zero unhealthy; `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z`: five topics/25 stories/22 posts verified.
- No paid calls, manual collection/generation, budget, flag or sharing changes. Next: scheduled NBA/item 58 acceptance, then public activation with sharing private.

## 2026-11-13: iteration 2144 — compact scheduled acceptance handoff

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. NBA/item 58 acceptance still awaits 15:00 UTC; generation frozen after noon, public mode off.
- Owner benefit: the next edition review now follows the actual proxy decision instead of reopening a resolved blocker. Corrected the settlement-review checklist to follow STEERING 59 and private-sharing activation after NBA acceptance.
- TASKS had grown to 31,141 bytes. Archived its detailed state, retained all 23 open checkboxes and reduced the handoff below 8 KB; completed histories remain linked. No owner priority changes.
- Python verification: all local link targets in the three task/review files exist; 23/23 open tasks retained. No source, product, generation, budget, flag or sharing changes; SOURCES/NEEDS_FROM_HUMAN unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 966 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with the existing bundle warning; `git diff --check` clean.
- API/worker/docs restarted before the protected window. `pnpm obs health --check`: database/Redis healthy; `pnpm obs sources --check`: 38 sources/zero unhealthy; `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z`: five topics/25 stories/22 posts.
- Next: Nov 13 15:00 scheduled NBA/item 58 acceptance, then private-sharing public activation outside 13:00–16:00. Natural Tech/social quality and settlement recovery remain unaccepted until observed.

## 2026-11-13: iteration 2145 — locate weak Bluesky candidate supply offline

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. NBA/item 58 awaits 15:00 UTC; generation cutoff preserved, public mode off.
- Added optional historical UTC cutoff, bounded post text and pool engagement evidence to the existing read-only Bluesky report; current topic policies are explicit. No provider requests or writes.
- Historical Nov 12 report: World has 29 safe engaged candidates, maximum five likes; current rolling pool has 19, maximum seven. Strong Tech/Gaming examples include off-topic jokes/commentary, so engagement alone is insufficient. U.S. now has 417 observations.
- Saved findings in `docs/edition-reviews/2026-11-12-bluesky-pool.md`; updated TASKS/SOURCES. Investigate World discovery after the scheduled gate; no query or generation tuning deployed today.
- Default/historical report commands pass; Python subprocess checks refuse five invalid CLI cases and verify historical example timestamps/text bounds. No handbook/runtime/schema behavior change; NEEDS_FROM_HUMAN unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 966 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warning; `git diff --check` clean.
- API/worker/docs restarted before the protected window. Health database/Redis pass; 38 sources/zero unhealthy; saved-reader check Nov 12 passes five topics/25 stories/22 posts.
- No paid calls, manual collection/generation, budget, flag or sharing changes. Next: 15:00 scheduled NBA/item 58 acceptance, then private-sharing activation outside 13:00–16:00.

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
