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

## 2026-11-13: iteration 2198 — clickable X media references

- Clean main; no inherited work. Alerts zero; health/Postgres/Redis pass. Scheduled acceptance awaits Nov 14; generation cutoff retained.
- Reader weakness: actual NBA Cade Cunningham post includes a plain `pic.twitter.com` media reference. Shared edition/saved-post text now opens these references over HTTPS, retaining visible original text and punctuation handling.
- No generation, source, prompt, budget or stored-data changes; no paid calls. Feed-depth implementation remains gated before noon.
- `pnpm exec tsx scripts/smoke-saved-media-links.ts`: actual NBA saved post passes desktop/mobile light/dark, destination/text/reload, typography, no overflow/errors. Four screenshots added; mobile light inspected. Existing full-URL Gaming browser regression also passes all four variants.
- Handbook reading preferences and TASKS updated; archived iteration 2184. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: format/lint fixes, full check, build, final web rebuild, handbook/schema check and diff checks. 985 unit/294 integration tests pass, four expected skips; existing web chunk warning. First combined check terminated during typechecking without a reported failure; standalone retry used for acceptance.
- Next: pre-noon feed-content precedence; Nov 14 all-topic AI editing/diversity and NBA/item 58 scheduled acceptance, then private public-mode activation.
- Full standalone check passes; built API/worker restart and push follow verification.

## 2026-11-13: iteration 2199 — label saved engagement snapshots

- Clean main; no inherited work. Alert snapshot zero; health/Postgres/Redis pass. Scheduled acceptance awaits Nov 14; after-noon generation cutoff retained.
- Reader weakness: all four actual Nov 13 Bluesky count rows lacked a snapshot label, making historical engagement appear current. Bluesky and parked Reddit cards now say “at collection”, matching X; counts and saved data unchanged.
- Inline read-only Playwright (`node --input-type=module`) reproduced all four missing labels before rebuild, then verified exact saved counts and labels on desktop/mobile light/dark; no overflow/browser errors. Four screenshots added; mobile light inspected.
- Social-post handbook and TASKS updated; archived progress 2185. SOURCES/NEEDS_FROM_HUMAN unchanged: no collection, source, generation, budget or paid-call change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, social-post handbook/schema check and diff checks pass: 985 unit/294 integration tests, four expected skips; existing web chunk warning. First combined run terminated during formatting; next run hung in unchanged telemetry-export test. Isolated test passes (3/3); terminated stuck child and complete standalone retry passes.
- Rebuilt API/worker restarted healthy; latest reader retains five topics/15 stories/20 posts. Commit/push and final service restart follow verification.
- Next: before-noon feed-content precedence fix; Nov 14 scheduled all-topic AI editing/diversity and NBA/item 58 acceptance, then private public-mode activation.

## 2026-11-13: iteration 2200 — publisher teaser continuation

- Clean main; no inherited work. Initial alerts zero and health/Postgres/Redis pass; scheduled recovery acceptance awaits Nov 14. Generation cutoff retained.
- Reader weakness: actual Gaming PS5 QSSR teaser ends “Read the full article on pushsquare.com” as plain text. Editions and saved story copies now offer source continuation for explicit publisher full-article prompts as well as ellipses. Owner can continue the incomplete report directly.
- Original summary, source URL, storage, source collection, generation and budgets unchanged; no paid calls. Older STEERING 35 requires plain summaries without mode labels; retained.
- Handbook reading preferences and TASKS updated; oldest progress entry archived. SOURCES/NEEDS_FROM_HUMAN unchanged.
- `pnpm exec tsx scripts/smoke-publisher-continuation.ts`: actual published Gaming teaser passes desktop/mobile light/dark, exact source URL/text, keyboard focus, saved reload and no overflow/browser errors; complete NBA story retains no continuation. Four screenshots added; mobile light inspected.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `pnpm build`, handbook/schema and diff checks pass: 985 unit/294 integration tests; four expected skips, existing web chunk warning. Initial checks caught import order then smoke-script formatting; fixed before final complete pass.
- Built API/worker restarted healthy; Postgres/Redis pass and latest edition retains five topics/15 stories/20 posts. Commit/push and final service restart follow checks.
- Next: pre-noon feed-content precedence; Nov 14 scheduled all-topic AI editing/diversity and NBA/item 58 acceptance, then private public-mode activation.

## 2026-11-13: iteration 2201 — stabilize explorer rollback verification

- Clean main; no inherited work. Alerts zero; health/Postgres/Redis pass; all 38 sources healthy. Recent failure was OpenAI feed's 20-second timeout at 21:24; natural collection recovered by 22:24 with 60 items. No retry or source change needed.
- Highest scheduled/public gates await Nov 14; after-noon generation hold retained. No new reader defect established; no speculative UI change.
- Open metrics-store recovery step: `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` observed 24 healthy rules, queries ≤1.273 s, zero new evaluator failures/missed iterations/admission hits/timeouts/slow queries. One small natural merge/14,648 rows; no comparable merge, so recovery remains open.
- Warning-level system metrics/alerts journal since 18:34:06 UTC empty. CPU-only limits retained; next passive probe no earlier than 23:48 UTC. Grafana remains excluded from public launch.
- Updated TASKS and capacity evidence; archived oldest progress entry. SOURCES/NEEDS_FROM_HUMAN unchanged. No app, generation, budget, provider or stored-content changes; no paid calls.
- Full check caught existing explorer rollback test comparing changing physical relation sizes (49,152→57,344 bytes). Fixed assertion to retain structural/comment equality and separately validate private statistics; public omission and denied-grant checks retained. This test-only breakage fix changes no production code.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` retry, `pnpm build`, handbook/schema check, selected-file formatting and diff checks pass: 985 unit/294 integration tests, four expected skips; existing bundle-size warning.
- Rebuilt API/worker restarted active; health/Postgres/Redis pass; latest saved edition retains five topics/15 stories/20 posts. Commit/push and final service restart follow checks.
- Next: before-noon feed-content precedence; Nov 14 all-topic AI editing/diversity and NBA/item 58 scheduled acceptance, then private public-mode activation.

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
