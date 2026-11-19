# Progress

[Iterations 2768–2777](docs/progress-archive/2026-11-18-iterations-2768-2777.md).

[Iterations 2778–2786](docs/progress-archive/2026-11-18-iterations-2778-2786.md).

[Iterations 2875–2880](docs/progress-archive/2026-11-19-iterations-2875-2880.md).

[Iterations 2881–2890](docs/progress-archive/2026-11-19-iterations-2881-2890.md).

## 2026-11-19: iteration 2891 — developing-link snapshot provenance

- Clean main at 6c576c61; no inherited work. Alerts/health clear; 38 monitored sources pass, Destructoid inactive; digest-generation zero failed jobs, next scheduled 15:00 UTC. Invalid `obs queue` corrected to `obs jobs --queue digest-generation --check`.
- Snapshot assembly now removes editor-supplied developing metadata and attaches only current validated matches. Unavailable or empty matching cannot retain an unsupported earlier-coverage relationship; editorial prose and input objects are preserved.
- All five saved editor controls inject incorrect metadata: valid links replace it, unmatched stories discard it. Separate unavailable-matcher control verifies no unsupported link is published. No provider calls, live writes, UI changes or activation.
- Verification: targeted tests 14/14; pnpm format/lint:fix, build and handbook (19 pages/21 diagrams/39 tables) pass. Full pnpm check passes (1,170 unit / 332 integration, four expected skips). Logs `/tmp/2891-*.log`; git diff --check clear.
- Latest reader returns five topics/25 stories. TASKS and saved review updated; no source or handbook system change. Full semantic review, production pool/budget admission and generation wiring remain open.
- Next: continue developing-story admission; scheduled missed-story/NBA/Tech review after 15:00 UTC. Commit/push and API/worker/docs restart follow verification.

## 2026-11-19: iteration 2892 — developing editor context provenance

- Clean main at b187cf70; no inherited work. Alerts/health clear; 38 monitored sources healthy, Destructoid inactive; digest-generation zero failures, next scheduled 15:00 UTC.
- Prepared developing-story editing now removes inherited earlierCoverage before attaching this run’s validated predecessor. Unmatched candidates cannot carry stale context into rewritten prose; other fields and input objects remain intact.
- All five saved controls inject incorrect inherited context; validated predecessors replace it, unmatched stories discard it. Dedicated unavailable/empty-match controls pass. No provider calls, saved-edition changes or activation.
- Verification: targeted editor tests 9/9; pnpm format, lint:fix, check (1,171 unit / 332 integration passes, four expected skips), build and handbook (19 pages/21 diagrams/39 tables) pass. Logs /tmp/2892-*.log; git diff --check clear. Latest reader five topics/25 stories.
- TASKS and saved review updated; no affected source, UI or handbook behavior. Full semantic review, production pool/budget admission and generation wiring remain open; scheduled missed-story/NBA/Tech review after 15:00 UTC.
- Commit/push and API/worker/docs restart follow verification.

## 2026-11-19: iteration 2893 — developing full-shortlist capacity decision

- Clean main at d7ec7140; no inherited work. Alerts/health clear; 38 monitored sources healthy, Destructoid inactive. Scheduled digest queue has zero failures, next run 15:00 UTC.
- Offline request tool now reports history size, remaining current-story capacity and 5/10/20/40-current-story scenarios without changing matching or truncating history.
- All 35 Nov 12–18 windows fit five current stories; only 12 fit ten, seven fit twenty and one fits forty. At ten: Tech/NBA/Gaming 0/7 each, World 5/7, U.S. 7/7 (includes empty history as capacity only).
- Full-shortlist integration rejected under current 40-occurrence limit: saved selected-story request costs cannot establish production admission. Next: bounded matching/editor design, semantic review and budget admission; feature inactive, no provider calls.
- Verification: targeted request tests 3/3; pnpm format, lint:fix, check pass (1,172 unit / 332 integration, four expected skips); pnpm build and handbook (19 pages/21 diagrams/39 tables) pass. git diff --check clear. Logs /tmp/2893-*.log; receipt /tmp/2893-capacity.json.
- Latest reader five topics/25 stories. TASKS and saved review updated; no source/UI/handbook-system change. Scheduled missed-story/NBA/Tech acceptance remains after 15:00 UTC.
- Commit/push and API/worker/docs restart follow verification.

## 2026-11-19: iteration 2894 — bounded developing-story design

- Clean main at 34f3f321; no inherited work. Alerts clear, health passes, 38 monitored sources healthy; digest queue zero failures, next scheduled 15:00 UTC.
- Recorded selection → matching → fixed-selection rewrite decision. Preserve the ten-candidate editor shortlist and seven-edition history; reject shortlist reduction/history splitting. Existing pre-selection helper stays inactive.
- Defined exact-ID rewrite contract, original-evidence matching, atomic fallback, final brief/social context, actual-selection capacity check and combined ledger admission requirements. Five-story receipt does not cover configured ten-story budgets or rewrite costs.
- Next concrete step: capture exact rewrite requests and test fixed-selection/failure contracts offline, then semantic and whole-edition budget acceptance. No provider calls, feature activation, source changes or UI changes.
- Verification: pnpm format, lint:fix, check (1,172 unit / 332 integration pass, four expected skips), build and handbook (19 pages/21 diagrams/39 tables) pass; git diff --check clear. Logs /tmp/2894-*.log.
- Reader five topics/25 stories. Initial headerless local reader probe returned admission 429; corrected existing smoke-check forwarded-client header passes. No live breakage.
- TASKS, feature plan and saved review updated; no changed handbook behavior. Commit/push and API/worker/docs restart follow verification. Scheduled missed-story/NBA/Tech review remains after 15:00 UTC.

## 2026-11-19: iteration 2895 — fixed-selection rewrite contract

- Clean main at 8de45aa9; no inherited work. Alerts/health clear, 37 active sources healthy and Destructoid inactive. Digest queue zero failures; next scheduled 15:00 UTC.
- Added inactive rewrite contract after selection/matching: exact ordered matched IDs, prose-only replacement, mandatory current-evidence guard callback, validated snapshot links and atomic original-selection fallback. Accepted output and evidence are isolated from adapter mutation.
- Three offline tests cover success, changed/missing/extra/reordered IDs, rationale/evidence injection, refusal, partial guard failure, guard errors, mutation and invalid preflight without calls. Synthetic contract prose establishes no semantic acceptance.
- Initial full check found unsafe unknown-array narrowing; fixed explicitly. Verification: pnpm format, lint:fix, check (1,175 unit / 332 integration passes, four expected skips), build and final API rebuild pass; targeted 3/3 and handbook (19 pages/21 diagrams/39 tables) pass. Logs /tmp/2895-*.log.
- TASKS and saved review updated. No provider calls, activation, source/UI changes or affected handbook behavior. Exact provider requests, existing factual-guard integration, semantic review and whole-edition budget admission remain next.
- Latest reader five topics/25 stories. Commit/push and API/worker/docs restart follow verification. Scheduled missed-story/NBA/Tech review remains after 15:00 UTC.

## 2026-11-19: iteration 2896 — bounded developing rewrite request

- Clean main at 339a8579; no inherited work. Alerts/health pass; active sources healthy, Destructoid inactive. Digest queue has zero failures, next scheduled run 15:00 UTC.
- Added inactive pure rewrite request builder: configured model/run/topic, distinct purpose, 800 output tokens per match (maximum 8,000), fixed ordered selections and explicit original cluster evidence. Historical comparison is isolated; inherited history/link metadata excluded.
- Two offline request tests pass: current/history isolation, mutation, ten-story bounds/order and invalid preflight. Synthetic controls establish no semantic acceptance; no provider calls or activation.
- Saved exact request receipts/cost bounds, existing factual-guard integration, semantic review and whole-edition admission remain next. Daily missed-story/NBA/Tech acceptance remains after 15:00 UTC.
- Verification: targeted tests 2/2; pnpm format, lint:fix, check (1,177 unit / 332 integration pass, four expected skips), build and handbook (19 pages/21 diagrams/39 tables) pass. git diff --check clear. Latest reader five topics/25 stories; no changed source/UI/handbook behavior.
- TASKS and saved review updated. Commit/push and API/worker/docs restart follow verification. Logs /tmp/2896-*.log.

## 2026-11-19: iteration 2897 — current-evidence rewrite guard

- Clean main at cda81321; no inherited work. Alerts/health pass; active sources healthy, Destructoid inactive. Digest queue zero failures; next scheduled 15:00 UTC. Latest reader five topics/25 stories.
- Prepared rewrite validator reuses the selection editor’s bounded current-evidence absence guard, NBA summary exception and editorial prose limits. Historical context is excluded from factual support.
- Two offline tests cover real-guard integration with atomic fallback, historical-only rejection/current-supported acceptance, attribution stripping in all fields, supplemental support, truncation, IDs and length bounds. This lexical guard does not establish general entailment or semantic acceptance.
- No provider calls, production activation, source/UI changes or affected handbook behavior. Exact saved request/cost capture, semantic review and whole-edition admission remain next; scheduled acceptance after 15:00 UTC.
- Verification: targeted 2/2; pnpm format, lint:fix and check pass (1,179 unit / 332 integration tests, four expected skips); handbook 19 pages/21 diagrams/39 tables passes. Build passes; API/worker/docs restarted, health passes and reader retains five topics/25 stories. git diff --check clear. Logs /tmp/2897-*.log.
- TASKS and saved review updated; no changed handbook behavior. Commit/push follow verification. Scheduled missed-story/NBA/Tech review remains due after 15:00 UTC.

## 2026-11-19: iteration 2898 — bound rewrite input before dispatch

- Clean main at f9d4e09a; no inherited work. Alerts and health pass; 37 active sources healthy, Destructoid inactive. Digest queue zero failures; scheduled review remains after 15:00 UTC.
- Found rewrite preparation bounded output but not full original evidence input. Added the existing BudgetedLlm UTF-8/framing bound: reject at 100,000 without truncating evidence or partially rewriting selections.
- Four targeted request tests pass, including exact 99,999/100,000 boundary, Unicode, supplemental/history overflow and atomic contract fallback before dispatch. Reader retains five topics/25 stories.
- No provider calls, activation, source/UI changes or affected handbook behavior. Matching replay files contain published prose, not complete original editorial evidence; exact rewrite capture must not substitute summaries as source evidence. Saved request/cost capture, semantic review and whole-edition admission remain open.
- Verification: pnpm format, lint:fix, check (1,181 unit / 332 integration pass, four expected skips), build and handbook (19 pages/21 diagrams/39 tables) pass; git diff --check clear. Logs /tmp/2898-*.log.
- TASKS and saved review updated; no changed handbook behavior. Commit/push and API/worker/docs restart follow verification; scheduled review remains due after 15:00 UTC.

## 2026-11-19: iteration 2899 — prepared atomic rewrite orchestration

- Clean main at 81a41d74; no inherited work. Alerts/health and active sources pass. Digest-generation queue zero failures; next scheduled 15:00 UTC. Reader five topics/25 stories.
- Added inactive orchestration across the curation public boundary: bounded request, one attributed LlmPort dispatch with execution context, strict JSON parsing and current-evidence validation through the atomic fixed-selection contract.
- Three fake-port tests cover matched-only success/metadata preservation, refusal/malformed output/injected fields/guard or port errors without retry, and no dispatch for empty matches or oversized evidence. No provider calls or generation activation.
- Verification: pnpm format, lint:fix, typecheck, build and handbook (19 pages/21 diagrams/39 tables) pass; full pnpm check passes (1,184 unit / 332 integration, four expected skips). Logs /tmp/2899-*.log.
- Exact saved original-evidence requests, semantic review and whole-edition budget admission remain open. No source/UI or handbook behavior changes; scheduled missed-story/NBA/Tech review remains after 15:00 UTC.
- Final git diff --check clear. Commit/push and API/worker/docs restart follow verification; no feature activation.

## 2026-11-19: iteration 2900 — offline exact rewrite request receipts

- Clean main at 9402f919; no inherited work. Alerts/health pass, active sources healthy; Destructoid inactive. Digest queue zero failed jobs, next scheduled 15:00 UTC. Disk 62%; reader five topics/25 stories.
- Added offline capture CLI using the inactive real rewrite orchestration and a refusing fake port. Saves exact configured requests, original-input fingerprints, UTF-8/framing bounds and conservative single-rewrite reservations. No provider/DB calls or generation activation.
- Two synthetic targeted tests pass: exact builder equality, Unicode/input preservation, cost arithmetic, changed-evidence fingerprint and zero requests for missing matches/evidence or oversized input. CLI empty capture writes mode 600 and refuses overwrite. Real saved evidence and semantic/whole-edition admission remain open.
- Verification: pnpm format, lint:fix, check (1,186 unit / 332 integration pass, four expected skips), build pass; logs /tmp/2900-*.log. Default handbook hit HTTP 429; immediate restart retry hit startup ECONNREFUSED; explicit --owner-services verification passes (19 pages/21 diagrams/39 tables). API/worker/docs restarted; health passes.
- TASKS and saved review updated; no source/UI/handbook behavior change. Scheduled missed-story/NBA/Tech review remains after 15:00 UTC. Commit/push follow verification.

## 2026-11-19: iteration 2901 — extract saved original editorial evidence

- Clean main at 50858527; no inherited work. Alerts/health pass; 37 active sources have no errors, Destructoid inactive; digest queue zero failures, next 15:00 UTC. Reader five topics/25 stories.
- Replay export now extracts source evidence from immutable candidatePrompt with exact SHA-256, preserving bounded source text/attribution separately from published prose. Strict topic/ID/schema/completeness checks refuse ambiguous or missing evidence atomically; restores representative before supplemental guard evidence.
- Read-only export /tmp/2901-original-evidence.json: nine/35 topic windows, 45 selections. Available: all Nov 17 topics and Nov 18 except NBA. Existing reviewed positive matches have no complete-evidence overlap; no fabricated backfill, provider calls or activation. Semantic review and whole-edition admission remain open.
- Two offline tests pass for preservation, hashes, history isolation, ordering and malformed/ambiguous/missing input refusal. Build and handbook pass (19 pages/21 diagrams/39 tables). Initial full check inherited production flags from the read-only export shell: 1,188 unit pass, integration fails on public/selection configuration. Fresh unsourced pnpm check passes: 1,188 unit / 332 integration, four expected skips. pnpm format/lint:fix pass; logs /tmp/2901-*.log.
- TASKS and saved review updated; no source/UI/handbook behavior change. Direct default-visitor endpoint probes hit rate limits; standard explicit local probe visitor succeeds. Scheduled missed-story/NBA/Tech review remains due after 15:00 UTC.
- Final git diff --check clear. Commit/push and API/worker/docs restart follow verification; no feature activation.

## 2026-11-19: iteration 2902 — saved positive rewrite evidence controls

- Clean main at 2c26bb60; no inherited work. Alerts/health pass; active sources healthy, digest queue zero failures/next 15:00 UTC; reader five topics/25 stories.
- Added two agent-reviewed positive memberships with exact saved original editor evidence/prompt hashes: Nov 18 Peltola result follows Nov 17 near-50% count (two editions); Zelda sales follows Nov 17 ranking/Nov 11 launch total (three editions). Zelda repeats established facts: a rewrite must not invent a new milestone.
- Existing saved-membership replay now checks both; offline capture checks exact request construction, nearest links/counts and unchanged five-story selections. All 15 targeted replay/membership/capture tests pass. Saved bounded-evidence rewrite reservations: Gaming 19,850 / U.S. 18,685 micros ($0.038535 total); not runtime or whole-edition admission.
- No provider calls, activation or production behavior changes. Semantic model matching/generated rewrite review, whole-edition admission and live acceptance remain open. Scheduled missed-story/NBA/Tech review remains after 15:00 UTC.
- Build and handbook pass (19 pages/21 diagrams/39 tables); pnpm format/lint:fix pass. Initial full check exposed the evaluator's stale three-link count; updated to five for the added controls. Fresh full pnpm check passes: 1,193 unit / 332 integration, four expected skips. Logs /tmp/2902-*.log.
- Direct default-visitor reader probe was rate-limited; explicit local probe succeeds. Public mode refuses private failed-job filtering; queue-count probe confirms zero failures. TASKS and saved review updated; older progress archived, task handoff condensed. No handbook/source behavior change.
- Final git diff --check clear; commit/push and API/worker/docs restart follow verification. No feature activation.

## 2026-11-19: iteration 2903 — combined developing-request budget preflight

- Clean main at 1790fd94; no inherited work. Alerts/health pass; sources healthy (Destructoid inactive), digest queue zero failures/next 15:00 UTC. Reader five topics/25 stories.
- Added offline combined-request calculator using production budget arithmetic: conservative UTF-8/cache-price bounds for all supplied matching/repair/rewrite requests, protected remaining edition obligations, shared daily/monthly headroom and model ceilings. Missing allocated-model snapshots, invalid funds/output bounds and oversized inputs refuse.
- Two offline tests cover multiple calls, Unicode, exact model headroom/one-micro refusal, protected baseline funds, monthly limits, outstanding holds and invalid inputs. No provider/DB calls, ledger reservations or feature activation. Complete runtime plan, transactional admission and semantic review remain open.
- Verification: initial full check caught missing void on the new node:test promises; corrected. Final pnpm check passes (1,195 unit / 332 integration, four expected skips). pnpm format/lint:fix pass. Build and handbook pass (19 pages/21 diagrams/39 tables). Logs /tmp/2903-*.log.
- TASKS and saved review updated; no source/UI/handbook behavior change. Scheduled missed-story/NBA/Tech acceptance remains after 15:00 UTC. Commit/push and API/worker/docs restart follow verification.

## 2026-11-19: iteration 2904 — complete captured-edition coverage gate

- Clean main at c7070c6b; no inherited work. Alerts/health pass; sources report healthy, digest queue zero failures/next 15:00 UTC; reader five topics/25 stories.
- Offline capture-plan gate requires one ready matching and rewrite request per expected topic/edition before combined budget calculation. Missing, duplicate, unexpected, cross-edition, unavailable and mismatched request-topic captures refuse. Explicit additional repair requests and protected baseline obligations count toward shared/model limits.
- New CLI reads supplied captures/budget only, recalculates costs and writes a compact mode-600 report without overwriting. No provider, DB, config or ledger calls; production stays inactive. Supplied coverage does not prove complete runtime bounds or semantic quality.
- Two targeted tests pass; synthetic CLI report/permissions/overwrite refusal pass. pnpm format/lint:fix and full check pass (1,197 unit / 332 integration, four expected skips); build and handbook pass (19 pages/21 diagrams/39 tables). Logs /tmp/2904-*.log.
- TASKS and saved review updated; no source/UI/handbook behavior change. Semantic model/rewrite review, runtime five-topic plan and transactional admission remain open; scheduled missed-story/NBA/Tech review due after 15:00 UTC.
- Final git diff --check clear; commit/push and API/worker/docs restart follow verification. No feature activation.

## 2026-11-19: iteration 2905 — refuse invented developing-story updates

- Clean main at 178894d3; no inherited work. Alerts/health pass; sources healthy, digest queue zero failures/next 15:00 UTC; reader five topics/25 stories.
- Prepared developing rewrite v2 explicitly requires whole-request null when current evidence repeats earlier results/rankings/sales totals; forbids invented milestones/reporting periods and unsupported confirmation of prior conditional claims. No grouping/title rules or feature activation.
- Exact saved Zelda transport supplies original evidence/history; scripted null preserves all five selections by identity with no relationship metadata and one dispatch/no retry. This verifies refusal handling, not semantic model compliance. No provider calls.
- Seven targeted tests pass. pnpm format/lint:fix and full pnpm check pass (1,197 unit / 332 integration, four expected skips); build and handbook pass (19 pages/21 diagrams/39 tables). Handbook results in /tmp/2905-handbook.log; remaining logs /tmp/2905-*.log.
- TASKS and saved review updated; v1 reservation figures explicitly historical, fresh captures recalculate v2 bounds. Semantic review/runtime admission/live acceptance remain open; missed-story/NBA/Tech scheduled review due after 15:00 UTC. No source/UI/handbook behavior change.
- Commit/push and API/worker/docs restart follow verification; live health and alert checks repeated after restart.

## 2026-11-19: iteration 2906 — trace missed-story references through saved coverage

- Clean main at ecca00b6; no inherited work. Alerts/health pass; all 37 active sources return data without errors (Destructoid inactive); digest queue zero failures/next 15:00 UTC. Reader five topics/25 stories; default local visitor was rate-limited, explicit loopback probe passes.
- Added offline trace-reference-stories CLI: compares a dated capture to a saved reader edition, uses ingestion canonical URLs to locate selected representatives/explicit cluster coverage, preserves reference excerpts and unavailable feeds, and leaves different URLs for event/importance review. No inferred misses, recall, wording matcher, DB writes or provider calls.
- Exact edition-window and unique-topic checks prevent cross-edition/topic matches. Early captures remain marked incomplete (derived from capture time); legacy captures without windowEnded are accepted. Output is a new mode-600 file, refusing overwrite.
- Two targeted tests pass (coverage/normalization, cross-topic isolation, unchanged inputs, failure preservation, window/credential refusals); synthetic CLI transport/permissions/overwrite checks pass. Actual early Nov 19 capture against saved Nov 18 edition refuses on window mismatch; no semantic recall claimed.
- pnpm format/lint:fix and full pnpm check pass: 1,199 unit / 332 integration, four expected skips. Build and handbook pass (19 pages/21 diagrams/39 tables). Logs /tmp/2906-*.log. TASKS and docs/SOURCES.md updated; no UI/handbook behavior change.
- Scheduled Missed/NBA/Tech review remains due after 15:00 UTC; developing semantic review/runtime admission remain open. Commit/push and API/worker/docs restart follow verification.

## 2026-11-19: iteration 2907 — retain early reference-feed observations

- Clean main at ad4dd107; no inherited work. Alerts/health pass; sources healthy, digest queue zero failures/next 15:00 UTC. Reader serves five topics/25 real saved stories.
- Corrected reference capture/trace windowEnded: every feed must have started observation after the window closes. A capture finishing after closing cannot promote earlier feed observations; trace reports each feed separately, including failures. Empty traces never imply post-window coverage.
- Three targeted offline tests pass, including mixed early/late observations, all-late observations, empty captures and preserved early feed errors. No provider calls or production editorial changes.
- TASKS and docs/SOURCES.md updated. Scheduled Missed/NBA/Tech review remains due after 15:00 UTC; event matching and importance review remain required before recall.
- Verification: pnpm format/lint:fix and full pnpm check pass (1,200 unit / 332 integration, four expected skips); pnpm build and handbook pass (19 pages/21 diagrams/39 tables). Logs /tmp/2907-*.log. Final diff check, commit/push and API/worker/docs restart follow; health/alerts rechecked after restart.
