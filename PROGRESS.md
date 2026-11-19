# Progress

[Iterations 2768–2777](docs/progress-archive/2026-11-18-iterations-2768-2777.md).

[Iterations 2778–2786](docs/progress-archive/2026-11-18-iterations-2778-2786.md).

## 2026-11-19: iteration 2875 — prepare missed-story reference captures

- Clean main at abc77550; no inherited work. Owner added STEERING 68–70; followed new line-2 missed-story priority rather than waiting for scheduled acceptance.
- Alerts clear; health/DB/Redis and 14 services pass; 38 sources healthy (Destructoid paused). Digest-generation queue has zero failures, next Nov 19 15:00 UTC. Initial console invocation was interactive; corrected to obs sources. Initial queue alias digest was invalid; actual queue is digest-generation.
- Selected two free reference feeds/topic in SOURCES, reusing existing sources and Techmeme; documented importance filtering, semantic event matching, rolling-feed limits and same-review Missed section. No scoring/source configuration change.
- Added explicit capture-reference-stories.ts: ten bounded existing HTTP/parser requests, half-open window filtering, timestamps, per-feed failures and exclusive output creation; no DB, model, embedding or paid API calls.
- Live early capture /tmp/2875-reference-stories.json: all ten feeds pass, 166 dated entries (Tech 25/NBA 55/Gaming 14/World 44/U.S. 28), not importance-labelled/deduplicated. Exact reread verifies dates/links/titles. Invalid arguments fail before network. No recall or historical completeness claimed.
- Added open tasks for 68–70. Next: capture after publication, use existing clustering/embeddings and editorial judgement, record recall/miss causes in daily review; three editions then one measured root-cause fix. Scheduled NBA/Tech acceptance remains pending.
- Verification: pnpm format, pnpm lint:fix, standalone script tsc, full pnpm check (1,137 unit/330 integration passes, four expected skips), pnpm build, check-handbook.ts (19 pages/21 diagrams/39 tables) and git diff --check pass. Logs /tmp/2875-*.log. No UI change or paid replay.
- Rebuilt API/worker/docs restarted active; immediate health probe hit startup, retry obs health --check passes. Alerts clear, digest queue zero failures; next edition 15:00 UTC.

## 2026-11-19: iteration 2876 — expand saved Tech event labels

- Clean main at 5a160a4b; no inherited work. Initial orientation output was too broad; subsequent reads narrowed. Alerts/health clear, 14 monitored services healthy, 38 monitored sources healthy (Destructoid paused), digest queue zero failures; next edition 15:00 UTC.
- Higher-priority acceptance/missed-story review awaits publication. Used STEERING 69 waiting time for today’s single evaluation commit, adding three Tech event labels to the saved Nov 13 200-candidate pool (five targets → eight).
- Additive SHA-256-pinned overlay preserves historical fixtures/results. Existing evaluator reports five-slot fallback recall 0/8, unchanged selection: Google schools backlash outside top 20; reported SpaceX investment and renewed Starshield restrictions fail relevance. Agent labels only, not published-AI recall or independently verified news.
- No tuning to labels, paid replay, budget/provider change, source change, UI change or edition mutation. Joint story/post event-budget comparison remains open. Updated TASKS and RANKING; no affected handbook architecture or source configuration.
- Verification: offline replay/assertions, standalone script tsc, pnpm format/lint:fix, pnpm build, full handbook check and git diff --check pass. Full pnpm check passes: 1,137 unit and 330 integration tests, four expected skips; logs /tmp/2876-*.log. Invalid obs queues command corrected to obs jobs --queue digest-generation.
- API/worker/docs rebuilt and restarted; first health probe met startup, retry obs health --check and /healthz pass. Alerts clear.
- Next: after 15:00 scheduled publication, capture references and include Missed recall/causes in the same daily review; assess NBA/Tech editorial acceptance. No further waiting-time evaluation commit today.

## 2026-11-19: iteration 2877 — prepare developing-story history evidence

- Clean main at bd7d5d45; no inherited work. Initial orientation was overbroad; subsequent reads narrowed. Alerts/health clear, 38 monitored sources healthy; digest queue zero failures, next publication Nov 19 15:00 UTC.
- Scheduled acceptance/missed-story review awaits publication; today’s item 69 evaluation commit already used. Started owner-approved item 70 feature groundwork, without changing ranking or labels.
- Added pure history selector: last seven earlier published same-topic editions within the same profile; excludes self, future/equal publication times, invalid dates and other profiles. Copies only story IDs, headlines and saved summaries; no wording rules or match claims.
- Read-only replay-input exporter captures Nov 12–18: 35 topic editions / 152 selected stories (Tech 33, NBA 34, Gaming 35, World 25, U.S. 25), with 0–7 prior editions per case. Exclusive mode-600 output `/tmp/2877-developing-story-inputs.json`; no model calls, writes to DB, source configuration or public snapshot changes.
- Existing grouping uses AI; no stored embedding matcher exists. This is evidence preparation, not accepted matching or feature completion. Next feature step: review semantic matched pairs offline, then persist prior-story links and feed earlier summaries to the editor within existing caps.
- Verification: three targeted history tests, two identical live read-only exports, invalid-argument rejection and standalone script tsc pass. pnpm format/lint:fix and full pnpm check pass: 1,140 unit / 330 integration tests, four expected skips; handbook 19 pages/21 diagrams/39 tables passes. Initial standalone tsc import-resolution failure fixed by locating the script in apps/api/scripts; lint rerun after file move. Logs `/tmp/2877-*.log`.
- Build passed and published web assets atomically; API/worker/docs restarted healthy. obs health --check and /healthz pass; alerts clear and digest queue zero failures. No reader UI change or screenshots required; no affected handbook architecture or source configuration. TASKS updated.
- Next: Nov 19 scheduled review after 15:00, including missed-story recall/causes and NBA editorial acceptance; developing-story semantic replay and full feature integration remain open. Destructoid access remains blocked.

## 2026-11-19: iteration 2878 — resolve developing-story semantic memberships

- Clean main at ebe0e9c4; no inherited work. Alerts/health clear, 38 monitored sources healthy, digest queue zero failures; scheduled review awaits Nov 19 15:00 UTC. Today's item 69 evaluation commit already used; continued item 70 feature implementation.
- Added pure developingEvidence/developingLinks: snapshot-occurrence references distinguish recurring story IDs; explicit semantic memberships resolve nearest earlier coverage, headline/summary context and distinct edition count. No title rules or transitive joins.
- Invalid partitions (unknown/repeated references or singleton groups) reject all links; multiple current stories or multiple predecessors in one edition omit the ambiguous group. Three offline tests cover valid resolution, input immutability and failure cases.
- This is link-resolution groundwork, not semantic acceptance or a deployed reader feature. No provider calls, DB writes, production integration, source changes or UI changes. Saved Nov 12–18 semantic replay, persistence, editor context and reader label remain open. No affected handbook architecture.
- Verification: targeted tsx --test passes 3/3; pnpm format, pnpm lint:fix, full pnpm check (1,143 unit / 330 integration passes, four expected skips), pnpm build, check-handbook.ts (19 pages/21 diagrams/39 tables) and git diff --check pass. Logs /tmp/2878-*.log.
- Web assets published atomically; API/worker/docs restarted active. pnpm obs health --check and curl /healthz pass; obs alerts clear; digest-generation queue zero failures, next 15:00 UTC. TASKS updated; Destructoid remains paused/blocked.
- Next: scheduled edition review with missed-story recall/causes and NBA/Tech acceptance; otherwise continue developing-story matching integration and saved semantic review within existing caps.

## 2026-11-19: iteration 2879 — connect developing-story semantic orchestration

- Clean main at 677541f8; no inherited work. Initial orientation output was too broad; narrowed subsequent reads. Alerts/health clear, 38 monitored sources healthy; digest queue zero failures, next scheduled edition 15:00 UTC.
- Scheduled review awaits publication; today's item 69 evaluation commit already used. Continued item 70 with opt-in matchDevelopingStories through the existing budgeted grouping interface, preserving occurrence IDs, publication dates and saved summary evidence.
- One request at most; no batching, history truncation or added admission path. Missing evidence, pools above existing 40-item limit, unavailable/error responses and invalid memberships leave stories unlinked.
- Three offline tests cover evidence/run-context transport, recurring story IDs, immutability, unavailable/invalid/error results and no-call limits. No live provider calls, production wiring, DB/snapshot writes, UI/source/budget changes or affected handbook architecture.
- Verification: targeted tsx tests 3/3; pnpm format/lint:fix, pnpm build and git diff --check pass. Handbook check initially interrupted by service restart (ECONNREFUSED); rerun passes 19 pages/21 diagrams/39 tables. Full pnpm check passes: 1,146 unit / 330 integration tests, four expected skips; logs /tmp/2879-*.log.
- Web assets published atomically; API/worker/docs restarted. pnpm obs health --check and curl /healthz pass; sources healthy and digest queue zero failures. TASKS updated.
- Next: saved Nov 12–18 semantic matching review, then persistence/editor context/reader label; feature not yet live or semantically accepted. Scheduled missed-story/NBA/Tech review after 15:00; Destructoid remains blocked.

## 2026-11-19: iteration 2880 — review saved developing-story acceptance controls

- Clean main at 60b8d6b6; no inherited work. Initial orientation output was too broad; subsequent reads narrowed. Alerts/health clear, sources healthy, digest queue zero failures; next scheduled publication 15:00 UTC. Disk 64%.
- Continued item 70 while scheduled acceptance waits and today's item 69 evaluation commit is already used. Committed exact full saved pools/history for three reviewed stories (36/37/39 occurrences) and explicit manual labels; other current stories remain unreviewed.
- Supported pairs: Nov 16 Huang return to Nov 15 leadership-crisis recap and Nov 14 resignation; Nov 18 LeBron career-assist milestone to Nov 16 same milestone. Nov 18 Nvidia shipment cessation remains separate from leadership and US policy events. No unsupported new fact inferred from NBA's absent saved summary.
- Three offline application replays pass: nearest prior occurrence, exact saved headline/summary and edition counts survive reversed membership order; separate-event control remains unlinked. These are manual-membership controls, not independent labels or semantic-model precision acceptance. No paid calls, production wiring or snapshot changes.
- Full Nov 12–18 input inventory ranges 5–40 occurrences across 35 topic cases; no truncation needed. Review records unresolved generic CEO transition and Curry/game relationships. Semantic output review, persistence, editor context and reader UI remain open.
- Verification: targeted tsx tests 3/3, pnpm format/lint:fix, pnpm build (atomic web publication), handbook check (19 pages/21 diagrams/39 tables) and git diff --check pass. Full pnpm check passes: 1,149 unit / 330 integration tests, four expected skips; logs /tmp/2880-*.log. No source or handbook architecture change; TASKS updated; archived iterations 2778–2786 to keep progress below 25 KB.
- API/worker/docs restarted active. Immediate health probe raced startup; subsequent pnpm obs health --check and curl /healthz pass; alerts remain clear.
- Next: complete semantic acceptance and feature integration; scheduled Nov 19 missed-story/NBA/Tech review after 15:00. Destructoid remains paused/blocked.

## 2026-11-19: iteration 2881 — prepare developing-story editor context

- Clean main at e57051bc; no inherited work. Alerts/health clear, 38 monitored sources healthy, digest queue zero failures; next publication 15:00 UTC. Scheduled acceptance awaits that edition; today's item 69 evaluation already used.
- Continued item 70: optional earlier headline/summary comparison context reaches both editor model routes, bounded to 300/1,400 characters. Instructions lead with a supported change, reject invented updates from repetition and keep historical reporting separate from current evidence.
- Historical context never enters selectable IDs or factual absence support. Three offline tests cover both routes, historical-negative-claim rejection, input immutability, bounds and unchanged ordinary inputs. These are transport/validation controls, not semantic writing acceptance.
- No paid calls, production context wiring, snapshot/reader/source changes or affected handbook architecture. Semantic matching review, immutable persistence, production wiring and reader label remain open. TASKS and saved review updated; Destructoid remains blocked.
- Verification: editor tests 49/49; pnpm format, pnpm lint:fix, full pnpm check (1,152 unit / 330 integration passes, four expected skips), pnpm build and git diff --check pass. Handbook initially hit tool API HTTP 429; retry after service restart passes 19 pages/21 diagrams/39 tables. Logs /tmp/2881-*.log.
- Web assets published atomically; API/worker/docs restarted healthy. Final restart follows commit/push so services match main. Next: semantic acceptance/integration; Nov 19 missed-story recall/causes and NBA/Tech acceptance after 15:00 UTC.

## 2026-11-19: iteration 2882 — prepare immutable developing-story snapshot links

- Clean main at 6305490c; no inherited work. Alerts/health clear, 38 monitored sources healthy, digest queue zero failures; next publication 15:00 UTC. Scheduled review waits; today's item 69 evaluation already used.
- Continued item 70 with optional validated developing link fields on selected-story snapshots: previous edition/story UUIDs, copied headline/summary and 2–8 edition count. Old snapshots remain valid; no migration needed for existing JSON storage.
- Added opt-in snapshot assembly that validates all links before returning copied stories; unknown selections, duplicates and invalid links reject assembly. Exact saved positive/negative manual-membership controls survive JSON/contract round-trip; later link mutation cannot change assembled context.
- No live provider calls, production generation/persistence wiring, existing edition writes, public reader or source changes. These are storage preparation controls, not semantic acceptance or DB persistence integration. No affected handbook architecture; TASKS and saved review updated.
- Verification: targeted tests 4/4, pnpm format, pnpm lint:fix, pnpm build (atomic web publication), handbook check (19 pages/21 diagrams/39 tables), git diff --check pass. Full pnpm check passes (1,153 unit / 330 integration, four expected skips); logs /tmp/2882-*.log.
- API/worker/docs restart after commit/push so services match main; final health check required.
- Next: semantic acceptance and production integration, then reader label and real-edition acceptance; Nov 19 missed-story/NBA/Tech scheduled review after 15:00 UTC. Destructoid remains blocked.

## 2026-11-19: iteration 2883 — database-backed developing-story history

- Clean main at 04550c52; no inherited work. Alerts clear and `pnpm obs health --check` passes. Scheduled Nov 19 review still waits for 15:00 UTC; today's item 69 evaluation already used.
- Added bounded repository history read: same profile/topic, strictly earlier publication, excludes self/test/unpublished rows, publication-time order and seven-edition limit. Filters precede LIMIT; publication timestamps normalized to ISO.
- Isolated PostgreSQL coverage includes nine valid editions and foreign-profile/topic, self, equal/future time, test/unpublished rows; checks exact prose, order, empty results and invalid cutoff. Generation does not call it yet; no paid calls or published-edition changes.
- Initial verification exposed invalid fixture windows, forbidden immutable-row cleanup and database timestamp formatting; corrected fixtures, used existing isolated trigger-safe cleanup (null-owner fixtures otherwise break the later migration test) and normalized adapter output. No production failure or inherited work discarded.
- Verification: pnpm format/lint:fix, pnpm check unit 1,153/1,153 plus typecheck/lint/format/boundaries; final isolated integration rerun 331 passes/four expected skips. pnpm build passes; handbook 19 pages/21 diagrams/39 tables passes; logs /tmp/2883-*.log.
- TASKS and saved review updated; no affected handbook architecture or source changes. Semantic acceptance, generation/editor/persistence wiring and reader label remain open; Destructoid remains blocked.
- Final source/queue checks: 38 sources healthy; digest queue zero failures, next run 15:00 UTC. API/worker/docs restart and final health follow commit/push.

## 2026-11-19: iteration 2884 — recorded developing-story replay gate

- Clean main at 3c9b4d45; no inherited work. Alerts clear, health passes, 38 monitored sources healthy; digest-generation queue zero failures and next publication 15:00 UTC. Today's item 69 evaluation already used.
- Added offline recorded-membership evaluator using the application matcher. SHA-256 fingerprints bind results to exact saved evidence/order/publication times; duplicate/orphan records reject and missing/stale/invalid/unavailable cases fail controls.
- Reports every linked predecessor plus expected/actual reviewed memberships. Exact full historical membership is checked, so a correct nearest link cannot conceal a wrong older member. Unreviewed cases never pass the gate.
- Four offline tests cover the three saved manual controls and wrong/missing/stale/invalid/duplicate/orphan/unreviewed results. These verify evaluation transport, not model precision; reports always mark semantic acceptance unestablished.
- No provider calls, production wiring, published-edition/source changes or affected handbook architecture. TASKS and saved review updated; Destructoid remains blocked.
- Verification: pnpm format/lint:fix, final pnpm check (1,157 unit / 331 integration passes, four expected skips), pnpm build, handbook (19 pages/21 diagrams/39 tables), targeted 4/4 and git diff --check pass. CLI manual replay passes three controls and reports semantic acceptance unestablished; logs /tmp/2884-*.log. Initial lint async-method error corrected; final checks use final files.
- Next: obtain/review semantic outputs before activation, production integration and reader label; scheduled missed-story/NBA/Tech review after 15:00 UTC. Commit/push and API/worker/docs restart follow checks.
