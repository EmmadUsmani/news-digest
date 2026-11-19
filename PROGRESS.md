# Progress

[Iterations 2768–2777](docs/progress-archive/2026-11-18-iterations-2768-2777.md).

[Iterations 2778–2786](docs/progress-archive/2026-11-18-iterations-2778-2786.md).

[Iterations 2875–2880](docs/progress-archive/2026-11-19-iterations-2875-2880.md).

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

## 2026-11-19: iteration 2885 — developing-link database persistence controls

- Clean main at 0ef7ba62; no inherited work. Alerts and health clear; source check passes, digest queue zero failures with next run 15:00 UTC. Today's item 69 evaluation allowance already used; scheduled review waits.
- Added isolated PostgreSQL coverage for contract-valid synthetic developing links: exact snapshot retrieval, optional-field compatibility, copied prose/count/IDs, history ordering and independence from later caller/assembly mutation.
- Existing database triggers must reject updates/deletes of linked and unlinked editions; inserting a later edition must preserve the earlier link. Test inserts are setup, not production generation/publication orchestration.
- No provider calls, live edition/source changes or reader changes. Semantic matching acceptance, generation/editor wiring and reader label remain open. TASKS and saved review updated; no affected handbook architecture.
- Verification: pnpm format, pnpm lint:fix, pnpm check (1,157 unit / 332 integration passes, four expected skips), pnpm build, handbook (19 pages/21 diagrams/39 tables) and git diff --check pass. Logs /tmp/2885-*.log. Public-mode job state filter refused as designed; unfiltered queue-count check passes.
- Next: semantic matching review and production integration; Nov 19 missed-story/NBA/Tech review after 15:00 UTC. Destructoid remains blocked. Commit/push and API/worker/docs restart follow checks.

## 2026-11-19: iteration 2886 — developing-story reader presentation

- Clean main at 3d4ca19e; no inherited work. Alerts/health clear, all 38 monitored sources healthy; digest queue zero failures, next run 15:00 UTC. Today's item 69 evaluation already used.
- Reader allowlist now retains validated saved developing links, stripping extra nested fields. Conditional cards show edition count and earlier-story destination; projection test proves snapshot immutability and old-edition compatibility.
- Added GET-only browser smoke with explicitly synthetic link/destination interception, no DB writes: 320/390/1440px light/dark pass keyboard activation, exact route, earlier-card scroll position, unchanged prose/source and legacy absence. Six screenshots saved; narrow light PNG inspected.
- Initial typecheck caught the missing reader allowlist field; corrected. Initial local browser fetch hit shared loopback rate limiting; used existing documented test-address convention. Replaced incorrect focus expectation with the reader's actual deep-link scroll behavior. Handbook overlength corrected; source-excerpt description brought current.
- Verification: pnpm format, pnpm lint:fix, pnpm check (1,158 unit / 332 integration passes, four expected skips), pnpm build, targeted reader projection tests, final changed-file ESLint, handbook (19 pages/one affected diagram/39 tables), browser six cases and git diff --check pass. Logs /tmp/2886-*.log.
- TASKS, saved review and affected handbook updated; no source changes or provider calls. Production matching/editor/persistence wiring and real-edition acceptance remain open; synthetic screenshots are not semantic acceptance. Destructoid remains blocked.
- Next: semantic review and generation integration; Nov 19 missed-story/NBA/Tech review after 15:00 UTC. Commit/push and API/worker/docs restart follow checks.

## 2026-11-19: iteration 2887 — developing-story editor/snapshot orchestration

- Clean main at 91116f53; no inherited work. Alerts and health clear; source check passes, digest queue zero failures and next run 15:00 UTC. Today's item 69 evaluation allowance already used.
- Added opt-in application flow joining one bounded semantic request, nearest earlier-coverage editor context and selected-only immutable link assembly. Retains editor metadata/current prose; history is never selectable. Production generation does not call it yet.
- Three saved manual controls pass with reviewed candidates retained and dropped. Matching failure preserves ordinary editing, editor refusal stays null, unknown/duplicate selections reject; inputs unchanged. Four offline tests, no provider calls or database writes; no semantic precision claim.
- TASKS and saved review updated; no affected handbook architecture, UI/source or published-edition changes. Semantic review, production generation wiring/admission and real-edition acceptance remain open; Destructoid remains blocked.
- Verification: pnpm format/lint:fix, pnpm check (1,162 unit / 332 integration passes, four expected skips), pnpm build, final API build, targeted 4/4, changed-file ESLint and handbook (19 pages/21 diagrams/39 tables) pass; git diff --check clear. Logs /tmp/2887-*.log.
- Next: semantic matching review before activation; Nov 19 missed-story/NBA/Tech review after 15:00 UTC. Commit/push and API/worker/docs restart follow checks.

## 2026-11-19: iteration 2888 — developing-story request feasibility

- Clean main at 7b227b79; no inherited work. Alerts/health clear; 37 sources healthy, Destructoid inactive; digest-generation zero failed jobs, next run 15:00 UTC. Initial `--queue digest` was invalid; corrected to `digest-generation`.
- Added offline exact-request capture through the real EventGrouping adapter using configured Haiku prices, fingerprint-bound replay inputs and private exclusive-create output. No provider/database adapter, calls, semantic results or edition writes.
- All 35 saved Nov 12–18 windows checked: 30 ready, five unavailable from empty current/history stories, none over 40 occurrences. Maximum input bound 18,868; total conservative reservation $0.118047, largest day $0.020139. These bounds do not establish budget admission, semantic quality or fit of larger production candidate pools.
- Artifact `/tmp/2888-developing-requests-final.json`; two offline tests cover saved request transport, dates/fingerprints/bounds and unavailable pools. TASKS and saved review updated; no affected handbook architecture or sources.
- Verification: pnpm format/lint:fix, pnpm check (1,164 unit / 332 integration passes, four expected skips), pnpm build, targeted 2/2, handbook (19 pages/21 diagrams/39 tables) and git diff --check pass; logs `/tmp/2888-*.log`. Latest reader returns five topics/25 stories; shared-loopback 429 corrected using existing smoke-test address. Archived iterations 2875–2880 to keep PROGRESS small.
- Next: semantic matching review and production candidate-pool admission before activation; missed-story/NBA/Tech scheduled review after 15:00 UTC. Destructoid remains blocked. Commit/push and API/worker/docs restart follow checks.

## 2026-11-19: iteration 2889 — developing-story IPO/policy controls

- Clean main at 7457d57e; no inherited work. Alerts/health clear; 38 monitored sources pass, digest-generation zero failures/one delayed job for 15:00 UTC. Destructoid remains inactive/blocked.
- Added two exact saved Tech controls (five total): Nov 15 Anthropic IPO arrival follows Nov 10 proposed valuation; Nov 17 indirect China access policy stays separate from Nov 16 remote-access rule because saved summaries do not establish the same instrument/follow-up.
- Full current/history pools preserved. Manual agent labels, not semantic model results; policy ambiguity intentionally yields no link, without claiming the policies differ. No wording rules, provider calls, live writes or activation.
- Targeted matcher/snapshot/evaluator/editor orchestration 16/16 and request capture 2/2 pass. Initial full check caught request-capture test hard-coding three fixture cases; changed to fixture length and reran. Final pnpm format/lint:fix/check (1,168 unit, 332 integration, four expected skips), pnpm build, handbook (19 pages/21 diagrams/39 tables) and git diff --check pass; logs /tmp/2889-*.log.
- TASKS and saved review updated; no affected handbook/system/source behavior. Full semantic output review, production candidate-pool/budget admission and integration remain open.
- Latest reader: five topics/25 stories; initial shared-loopback 429 resolved with existing smoke-test address. Commit/push and API/worker/docs restart follow verification.
- Next: continue developing-story admission; missed-story/NBA/Tech review after today's 15:00 scheduled edition.

## 2026-11-19: iteration 2890 — developing-story candidate identity safety

- Clean main at 9e1cc39d; no inherited work. Alerts/health clear; 38 monitored sources pass and digest-generation has zero failures, next run 15:00 UTC. Destructoid remains inactive/blocked.
- Prepared editor flow rejects duplicate, empty and whitespace-only current candidate IDs before matching or editing. Occurrence-based matching otherwise allowed ambiguous story-ID context/link attachment; history may still reuse story IDs across editions.
- New offline guard test confirms neither adapter is invoked for invalid inputs; all five saved controls pass. No provider calls, live writes or activation; semantic review and production candidate/budget admission remain open.
- Verification: targeted editor tests 7/7; pnpm format, lint:fix and check pass (1,169 unit / 332 integration, four expected skips). Handbook 19 pages/21 diagrams/39 tables passes. Latest reader returns five topics/25 stories. Logs `/tmp/2890-*.log`.
- TASKS and saved review updated; no source, handbook architecture or UI change. Initial `sources:check` console invocation was invalid; corrected to `pnpm obs sources --check`.
- Full pnpm build and git diff --check pass. Commit/push and API/worker/docs restart follow verification; next scheduled missed-story/NBA/Tech review after 15:00 UTC.

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
