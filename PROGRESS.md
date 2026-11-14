# Progress

Earlier entries: [archive before iteration 2155](docs/progress-archive/2026-11-13-iterations-before-2155.md).

Archived entries: [iterations 2146–2154](docs/progress-archive/2026-11-13-iterations-2146-2154.md).

Archived entries: [earliest retained entries before iteration 2172](docs/progress-archive/2026-11-13-before-2172.md).

Archived entries: [iterations 2162–2163](docs/progress-archive/2026-11-13-iterations-2162-2163.md).

Archived entries: [iterations 2164–2165](docs/progress-archive/2026-11-13-iterations-2164-2165.md).

Archived entries: [iterations 2166–2168](docs/progress-archive/2026-11-13-iterations-2166-2168.md).

Archived entries: [iterations 2169–2170](docs/progress-archive/2026-11-13-iterations-2169-2170.md).

Archived entries: [iterations 2171–2172](docs/progress-archive/2026-11-13-iterations-2171-2172.md).

Archived entries: [iterations 2173–2174](docs/progress-archive/2026-11-13-iterations-2173-2174.md).

Archived entries: [iterations 2175–2176](docs/progress-archive/2026-11-13-iterations-2175-2176.md).

Archived entries: [iterations 2177–2178](docs/progress-archive/2026-11-13-iterations-2177-2178.md).

Archived entries: [iterations 2179–2180](docs/progress-archive/2026-11-13-iterations-2179-2180.md).

Archived entries: [iterations 2181–2182](docs/progress-archive/2026-11-13-iterations-2181-2182.md).

Archived entry: [earliest retained iteration](docs/progress-archive/2026-11-13-iteration-2183.md).

Archived entry: [iteration 2185](docs/progress-archive/2026-11-13-iteration-2185.md).

Archived entry: [iteration 2188](docs/progress-archive/2026-11-13-iteration-2188.md).

Archived entry: [iteration 2189](docs/progress-archive/2026-11-13-iteration-2189.md).

Archived entry: [iteration 2190](docs/progress-archive/2026-11-13-iteration-2190.md).

Archived entry: [iteration 2191](docs/progress-archive/2026-11-13-iteration-2191.md).

Archived entry: [iteration 2192](docs/progress-archive/2026-11-13-iteration-2192.md).

Archived entry: [iteration 2194](docs/progress-archive/2026-11-13-iteration-2194.md).

Archived entry: [iteration 2195](docs/progress-archive/2026-11-13-iteration-2195.md).

Archived entry: [iteration 2196](docs/progress-archive/2026-11-13-iteration-2196.md).

Archived entry: [iteration 2197](docs/progress-archive/2026-11-14-iteration-2197.md).

Archived entry: [iteration 2198](docs/progress-archive/2026-11-13-iteration-2198.md).

Archived entry: [iteration 2199](docs/progress-archive/2026-11-13-iteration-2199.md).

Archived entries: [iterations 2200–2201](docs/progress-archive/2026-11-14-iterations-2200-2201.md).

## 2026-11-13: iteration 2202 — historical NBA raw-body replay

- Clean main; no inherited work. Initial alerts zero; health/Postgres/Redis pass. NBA/item 58 scheduled acceptance awaits Nov 14; after-noon generation hold retained.
- Closed one recorded-response test gap: retained the actual Nov 12 Sonnet initial request and verbatim body, without credentials/headers. Fixed fingerprint refuses changed prompts/instructions.
- New offline regression transports the historical body through replay, JSON parsing and today's complete NBA validator; all fields match the saved parsed fixture. Second read uses cache with one total reservation/settlement.
- Token usage was not retained: test usage is explicitly synthetic zero and ledger is in memory. Full recorded-response edition golden stays open; no paid calls or production/generation/source/budget changes.
- TASKS and database-verification evidence updated; archived iteration 2188. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: targeted NBA tests 4/4; `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `pnpm build`, handbook/schema and diff checks pass: 986 unit/294 integration tests, four expected skips; existing web chunk warning. Initial full check caught archive formatting; fixed before complete retry.
- API/worker rebuilt/restarted active; health/Postgres/Redis and latest five-topic reader pass. Commit/push and final restart follow verification.
- Next: pre-noon feed-content precedence fix; Nov 14 scheduled all-topic AI editing/diversity and NBA/item 58 acceptance, then private public-mode activation.

## 2026-11-13: iteration 2203 — historical NBA publication regression

- Clean main; no inherited work. Alerts zero; health/Postgres/Redis and API/worker active. Scheduled NBA/item 58 acceptance awaits Nov 14; generation cutoff retained.
- Extended the historical Sonnet raw-body replay through real isolated Postgres publication, published-only retrieval and reader projection using today's complete validator and database-loaded candidates.
- All five story IDs/headlines/summaries/context/evidence and the selected-headline brief compared with the saved response. Second publication must use cache, create a new snapshot and preserve the first.
- Historical candidate reporting/body distinguished from synthetic triage, attribution, URLs/dates and zero usage. No paid calls, live database writes or production behavior changes. Full recorded-response edition golden stays open.
- TASKS and database-verification evidence updated; archived iterations 2189–2190. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification caught two test setup assumptions: manual generation is unpublished, and reader contracts omit story context. Explicit offline scheduled keys and reader-field assertions now match those contracts; stored context still checked. Final integration rerun passes.
- Verification: `pnpm check` passed typecheck/lint/format/boundaries and 986 unit tests, then caught the reader assertion above. Corrected `pnpm test:integration` passes 295 tests/four expected skips; targeted API typecheck/lint and changed-file formatting pass. `pnpm build`, handbook/schema and diff checks pass; existing web chunk warning only.
- Final formatting/lint, commit/push and built API/worker restart follow checks; latest reader retains five topics/15 stories/20 posts.
- Next: pre-noon feed-content precedence fix; Nov 14 scheduled all-topic AI editing/diversity and NBA/item 58 acceptance, then private public-mode activation.

## 2026-11-13: iteration 2204 — historical NBA public reader HTTP

- Clean main; no inherited work. Alerts zero; health/Postgres/Redis pass; all 38 monitored sources healthy. NBA/item 58 acceptance still awaits Nov 14; generation cutoff retained.
- Extended the historical NBA publication regression through the deployed Nest reader controller over local HTTP with real isolated repository reads and public/published-only mode.
- Both published snapshots retain exact reader content without private editorial fields. A newer unpublished copy returns 404, stays out of history, and cannot replace latest. ID caching is private/immutable; latest/history/errors remain no-store.
- Archived request/body and candidate reporting remain historical; triage, metadata and zero usage remain synthetic. No live writes, paid calls, runtime generation or provider/budget changes. Complete recorded-response edition golden stays open.
- TASKS/database-verification evidence updated; archived iteration 2191. SOURCES/NEEDS_FROM_HUMAN unchanged; handbook behavior unchanged.
- Initial full check stalled in existing telemetry-export transport test; terminated that child. File-only rerun passed 3/3; complete `pnpm check` retry passed 986 unit/295 integration tests, four expected skips.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, handbook/schema and diff checks pass; existing web chunk warning only. Full-check retry passes typecheck/lint/format/boundaries and tests; commit/push and built API/worker restart follow.
- Next: pre-noon feed-content precedence fix; Nov 14 all-topic AI editing/diversity and NBA/item 58 scheduled acceptance, then private public-mode activation.

## 2026-11-14: iteration 2205 — prefer supplied feed reporting

- Clean main; no inherited work. Alerts zero; health/Postgres/Redis and API/worker active. NBA/item 58 scheduled acceptance remains pending.
- RSS encoded/Atom content now precedes teasers, with blank fallback and unchanged 1,500-character cap, metadata and all-field X citation extraction. No article-page crawl, new source, provider or budget change.
- Unchanged recorded Ars fragment supplies 593 reporting characters; precedence/cap/blank/Atom tests and isolated teaser-to-body enrichment/repeat/blank-observation regression updated.
- TASKS, SOURCES, affected handbook and evidence updated; archived iteration 2192. NEEDS_FROM_HUMAN unchanged.
- Implementation/checks began Nov 13 evening; deployment held until Nov 14 UTC to obey the pre-noon generation window. Natural summary-depth/AI-editing acceptance remains open.
- Initial full check caught an X-link test pinning old teaser precedence; updated bounded-body expectation, retaining both-field citation assertions. Targeted X tests pass 2/2.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` retry pass (986 unit/295 integration, four expected skips); `pnpm build`, handbook/schema and diff checks pass; existing web chunk warning only.
- Read-only live Ars fetch/parser check: 20/20 nonempty bounded excerpts, first 883 characters. No live storage writes or paid calls. Commit/push and built API/worker restart follow; saved reader checked after restart.
- Next: Nov 14 normal scheduled all-topic AI editing/diversity, NBA/item 58 acceptance, then private public-mode activation.

## 2026-11-14: iteration 2206 — mark bounded feed reporting

- Clean main; no inherited work. Alerts zero; health/Postgres/Redis healthy. NBA/item 58 acceptance awaits today's normal scheduled edition; public mode stays off/private.
- Saved Gaming fallback already marks its 600-character shortening; upstream feed normalization silently cut reporting at 1,500 characters, including within words or Unicode pairs.
- Feed excerpt caps now use an ellipsis, whole-word boundaries where possible and intact surrogate pairs. Complete text stays exact; content precedence, blank fallback, limits and all-field X citations retained.
- Offline tests cover exact cap, complete text, split date word, emoji, blank HTML, RSS/Atom content and citations beyond the cap. No paid/live requests or saved-edition rewrites.
- TASKS, SOURCES and affected handbook pages updated; corrected stale summary-first data-model wording. Archived oldest progress entry; NEEDS_FROM_HUMAN unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` retry pass (986 unit/296 integration, four expected skips); `pnpm build`, handbook/schema and diff checks pass; existing web chunk warning only.
- Targeted feed 4/4 and X links 2/2 pass. Initial X expectation omitted a complete trailing word; corrected. First full check caught archive formatting; fixed before successful retry. Commit/push and built API/worker restart follow.
- Next: Nov 14 scheduled all-topic AI editing/diversity and NBA/item 58 acceptance, then private public-mode activation.

## 2026-11-14: iteration 2207 — preserve inline feed sentence spacing

- Clean main; no inherited work. Alerts zero; health/Postgres/Redis healthy. Scheduled NBA/item 58 acceptance remains pending; public mode stays off/private.
- Saved Gaming reporting exposes `Spider-Man 2 .`: feed normalization inserted whitespace for every inline HTML tag. Known inline tags now contribute no spacing; block tags retain separators.
- Offline regression covers emphasis, nested links, punctuation, subscripts, adjacent spans, breaks, paragraphs and list items. Caps, field precedence, metadata, X extraction and saved editions retained.
- TASKS and SOURCES updated; archived iteration 2194. Minor normalization fix needs no handbook behavior change; NEEDS_FROM_HUMAN unchanged. No paid/live source calls, budget/provider changes or stored-edition rewrites.
- Targeted feed/recorded-Ars checks pass 5/5. Initial broad test filter also selected a DB test without isolation; guard refused it. Corrected targeted filter; full suite uses disposable services.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, handbook/schema and diff checks pass; existing web chunk warning only. Full `pnpm check` passes: 986 unit/297 integration tests, four expected skips. Commit/push and built API/worker restart follow.
- Next: Nov 14 normal scheduled all-topic AI editing/diversity and NBA/item 58 acceptance, then private public-mode activation.

## 2026-11-14: iteration 2208 — Ars publisher continuation

- Clean main; no inherited work. Alerts zero; health/Postgres/Redis healthy. NBA/item 58 still awaits today's normal scheduled edition; public mode off/private.
- Recorded Ars outage reporting ends “Read full article Comments”; the existing reader recognized only the named-publisher footer. Retained Nov 13 feed bodies also use the plain “Read full article” form.
- Continuation recognition now covers both explicit Ars forms, preserving reporting and source destinations in edition cards and saved copies. No ingestion, generation, spend or saved-edition changes.
- Added GET-only/external-blocked browser replay: unchanged recorded Ars reporting inside a simulated edition; desktop/mobile light/dark, local bookmark, reload, keyboard focus and complete-story negative control.
- TASKS and SOURCES updated; minor link recognition needs no handbook behavior change. NEEDS_FROM_HUMAN unchanged; archived iteration 2195.
- Verification: `pnpm format`, `pnpm lint:fix`, build, handbook/schema and diff checks pass; existing web chunk warning only. Seven direct continuation checks and both publisher browser replays pass all four viewport/theme combinations.
- Initial replay assertion omitted the recorded trailing “Comments”; corrected to match the unchanged fixture. Screenshot review corrected inherited synthetic publisher metadata to Ars. `pnpm check` passes: 986 unit/297 integration tests, four expected skips. Commit/push and built API/worker restart follow.
- Next: scheduled all-topic editing/diversity, NBA/item 58 acceptance, then private public-mode activation.

## 2026-11-14: iteration 2209 — measure recoverable Tech repetition

- Clean main; no inherited work. Zero alerts; health/database/Redis healthy. NBA/item 58 and private public activation await the normal scheduled edition; no paid replay.
- Owner-visible weakness: two Claude outage cards consume scarce Tech slots while Microsoft outage coverage is omitted. A later-date recorded benchmark now measures the available grouping benefit before changing production.
- Exported 200 Tech candidates/current policy read-only in repeatable-read; this is current stored feed evidence for Nov 12–13, not exact scheduled inputs. No content, jobs or inference written.
- Five agent event labels authored before scoring; two unrelated-report omission controls. Ambiguous Orchestrator text, second-relationship allegation, market analysis and patent lawsuit remain outside the selected event labels.
- Fallback finds one of five targets and repeats Claude twice; label-only grouping restores one slot for Microsoft outage. All 15 labeled articles pass relevance; three other target events stay outside the twenty-slot horizon. Independent labels/semantic evaluation remain open.
- Added later Tech window to offline ranking command and regression suite; production selection, budgets, providers, saved editions and public flags unchanged. TASKS/RANKING updated; no source/handbook behavior change.
- Verification: targeted historical ranking 7/7 and `pnpm evaluate:ranking` pass; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (987 unit/297 integration; four expected skips), `pnpm build`, targeted formatting and diff checks pass. Existing web bundle warnings only. Archived iteration 2196.
- All 38 sources healthy; API/worker restart and endpoint verification follow commit/push. No UI change; browser replay unnecessary.
- Next: normal all-topic editing/diversity and NBA/item 58 acceptance, then private public-mode activation.

## 2026-11-14: iteration 2210 — Tech same-story boundaries

- Clean main; no inherited changes. Alerts zero and health/database/Redis healthy. Scheduled NBA/item 58/public-mode gates await today's normal edition; no paid replay.
- Reader weakness: repeated Tech outage coverage consumes scarce slots. Added 13 same-story pair labels from unchanged recorded Nov 12–13 evidence: eight positives/five negatives.
- Cases cover outage recovery, separate providers, Gemini launch, AI-freeze versus patent claims, syndicated resignation versus a later allegation, and product review versus downtime.
- Offline CLI accepts `--later-tech` and saved memberships. No-grouping misses eight positives; deliberately broad downtime control falsely merges two cross-provider pairs; event-label control matches eight with no known false merge. Unknown pairs stay unknown.
- Agent labels are not independent judgments or semantic accuracy; production matcher/selection, budgets, providers and saved editions unchanged. Historical and paid evaluation plans unchanged.
- TASKS/RANKING updated; source/handbook behavior and NEEDS_FROM_HUMAN unchanged. Archived iteration 2197. No UI change; browser replay unnecessary.
- Verification: targeted event-grouping suite (11/11), offline CLI, `pnpm format`, `pnpm lint:fix`, `pnpm check` (988 unit/297 integration; four expected skips), `pnpm build`, handbook/schema and diff checks pass. Existing web bundle warning only; commit/push and built API/worker restart follow.
- Next: scheduled all-topic editing/diversity and NBA/item 58 acceptance, then private public-mode activation.

## 2026-11-14: iteration 2211 — correct the fallback ranking measurement

- Clean main; no inherited work. Zero alerts; health/database/Redis healthy. Scheduled NBA/item 58/private public-mode gates await today's normal edition; no paid replay.
- Reader weakness remains repeated/weak Tech coverage. Investigation found the offline benchmark used general `rank`, despite describing deployed fallback; it missed iteration 2167's blank-text exclusion.
- Baseline and twenty-slot audit now call production `rankFallback`; label-only grouping uses the same readable pool. Diagnostics expose missing text separately from relevance/quality rejection.
- Corrected later Tech result: 16 relevance-eligible blanks excluded, including both Claude reports; zero of five targets in both five-slot selections. Microsoft is slot 18. Prior claim that grouping recovers a target is withdrawn in RANKING/TASKS.
- Earlier Tech has two blanks; NBA/World/Gaming have none. Fixture content/labels, production generation, budgets, providers and saved editions unchanged. Agent labels still need independent review.
- Added synthetic blank/whitespace high-score and grouped-target controls; updated recorded Tech regression to preserve the measured weakness. Targeted historical ranking passes 8/8; offline CLI passes.
- Source/handbook behavior and NEEDS_FROM_HUMAN unchanged; no UI change or browser replay needed. Archived iteration 2198 to retain the progress size bound.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (989 unit/297 integration; four expected skips), `pnpm build`, handbook/schema checks and `git diff --check` pass; existing web chunk warning only. Commit/push and built API/worker restart follow.
- Next: scheduled all-topic editing/diversity and NBA/item 58 acceptance, then private public-mode activation. Corrected fallback evidence shows ranking loss persists without headline-only cards.

## 2026-11-14: iteration 2212 — NBA repair publication coverage

- Clean main; no inherited work. Zero alerts and healthy database/Redis/API at orientation. Scheduled NBA/item 58/private public-mode gates still await today's normal edition; no paid replay.
- Reader risk: supported NBA repair summaries had validator coverage but only the Sonnet initial body had publication/reader coverage. Extended that regression to saved Sonnet and Haiku repair outputs.
- All three preserve exact story fields through two publications, immutable retrieval, cache reuse and public reader latest/history/detail HTTP reads; unpublished copies remain hidden.
- Only Sonnet initial transport is verbatim historical. Repair requests/serialization, triage, URLs/dates/attribution and zero usage are explicit test scaffolding; this does not replay automatic repair or establish scheduled acceptance.
- First integration run exposed shared synthetic job IDs reusing the initial edition; gave each response distinct IDs. All three corrected cases pass. Invalid Haiku initial remains covered by separate refusal tests.
- TASKS/DATABASE-VERIFICATION updated; archived iteration 2199. Production generation, saved editions, providers, budgets and public flags unchanged; no UI/source/handbook behavior change.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (989 unit/299 integration; four expected skips), `pnpm build`, handbook/schema and diff checks pass. Existing web chunk warning only.
- API/worker restarted active; `/healthz` passes, `check-scheduled-reader.ts 2026-11-13T15:00:00Z` verifies five topics/15 stories/20 posts; all 38 sources report data/no errors. Commit/push follow.
- Next: scheduled all-topic editing/diversity and NBA/item 58 acceptance, then private public-mode activation. Full-edition raw-response golden remains open.

## 2026-11-14: iteration 2213 — Verge source continuation

- Clean main; no inherited work. Zero alerts and healthy API/database/Redis. NBA/item 58/private public-mode gates still await the normal scheduled edition.
- Reader weakness: recorded Verge excerpts end with “Read the full story at The Verge” but offered no explicit continuation link. Added full-story/named-publisher handoffs alongside existing full-article recognition.
- Reused the publisher browser replay with unchanged recorded Atom reporting in a simulated edition; source URLs/text and normal saved-copy limits retained. Complete-story control unchanged.
- Before-change Verge replay reproduced the missing link; `pnpm exec tsx scripts/smoke-ars-continuation.ts verge` and `pnpm exec tsx scripts/smoke-ars-continuation.ts` pass desktop/mobile light/dark, including saved-copy reload, focus and overflow checks. Updated/inspected screenshots.
- One live Verge feed GET exposed untagged commerce JavaScript. Script-tag stripping would not solve it, so no heuristic removal or ingestion change was made; evidence noted in SOURCES.
- TASKS/SOURCES/affected handbook updated; archived iterations 2200–2201. No generation, provider, budget, public-flag or saved-server-content change.
- First full check stopped on new archive formatting; corrected it. Typecheck/lint, `pnpm exec tsx scripts/check-handbook.ts 01-app/README`, web build and `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-13T15:00:00Z` pass; all 38 sources report data/no errors. Final `pnpm check` passes (989 unit/299 integration; four expected skips); `pnpm build` passes with the existing chunk warning.
- Final `pnpm format`, `pnpm lint:fix` and diff checks precede commit/push; built API/worker restart follows. No paid calls.
- Next: normal scheduled all-topic/NBA acceptance, close item 58, then private public-mode activation.
