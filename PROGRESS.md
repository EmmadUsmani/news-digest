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

## 2026-11-13: iteration 2193 — isolate grouping from missing-event recall

- Clean main; no inherited work. Alerts zero; health/database/Redis pass, no failed user units. At 21:04 UTC, generation cutoff protects feed parser and scheduled acceptance waits for Nov 14.
- Owner value: distinguish repeated coverage from ranking/relevance omissions before changing selection; this step supplies offline evidence, not a reader-visible fix.
- Extended recorded ranking evaluation with label-only grouping at unchanged policy, scores, windows and budgets; unknown articles stay separate. Reports labeled slots, repeated-slot count, consolidated selections and omission violations. No inference, new labels or live writes.
- Four windows retain baseline target counts (NBA 2, World 1, Tech 0, Gaming 1); selected groups contain up to five NBA/seven Gaming articles, but no extra targets enter. Zero known repeats does not measure unlabeled duplicates or accept semantic grouping.
- Synthetic control proves grouping can recover a slot when two top reports share a label; unknown reports stay separate. Empty labels yield null recall. Six targeted tests pass.
- TASKS/RANKING updated; archived progress 2177–2178. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no source, owner-decision or system-flow change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm evaluate:ranking`, handbook/schema check and `git diff --check` pass: 982 unit/294 integration tests, four expected skips; existing web chunk warning. No UI change; no browser screenshots needed.
- Saved reader endpoint serves five topics/15 stories/20 posts. API/worker restart follows push; no runtime generation or budget changes.
- Next: pre-noon feed-content precedence, Nov 14 scheduled all-topic AI editing/diversity, then NBA/item 58/private public activation. Independent labels and semantic grouping remain open.

## 2026-11-13: iteration 2194 — later Gaming grouping boundaries

- Clean main; no inherited work. Alerts zero; health/database/Redis pass. Evening cutoff retains the feed parser; scheduled NBA/item 58 acceptance awaits Nov 14.
- Open M5 step: added six positive/four negative same-story pairs from the recorded Nov 11–12 Gaming pool. Ceremony reports group across winners; Witcher awards stay separate from Geralt voice-production news.
- Separate offline `--later-gaming` report leaves historical reports and the paid evaluation plan unchanged. Default matcher misses six positives; broad Witcher-title control falsely merges two negatives. Event-label control finds six with zero known false merges; other pairs stay unknown.
- Labels are agent judgments, not independent acceptance or model accuracy. No inference, new fetch, production generation or budget changes. Semantic evaluation remains open.
- Verification: ten targeted tests; `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, offline CLI, handbook/schema check and `git diff --check` pass: 983 unit/294 integration tests, four expected skips; existing web chunk warning.
- TASKS/RANKING updated; archived progress 2179–2180. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no source, owner decision or system-flow change. No UI change; browser screenshots unnecessary.
- Rebuilt API/worker restarted; both active, health/database/Redis pass, latest reader endpoint serves five topics. Commit/push follows verification.
- Next: pre-noon feed-content precedence, Nov 14 all-topic AI editing/event diversity, then NBA/item 58/private public activation. No paid replay.

## 2026-11-13: iteration 2195 — publication dates in saved items

- Clean main; no inherited work. Alert triage found PlayStation HTTP 502/OpenAI timeout, both recovered on automatic second attempts; health/database/Redis pass. No source or digest outage requiring a generation change.
- Reader weakness: saved cards showed save dates but omitted original publication dates, obscuring the age of bookmarked news/posts. New saves now retain and show publication time separately; legacy saves have no invented date.
- Bounded optional timestamp normalizes in browser storage and validates in account sync; deterministic merge ordering stays aligned. No migration, generation, prompt, source or budget changes.
- Targeted store/sync tests: 19 pass, including legacy compatibility, invalid date handling, reload and browser/server merge convergence.
- Playwright `pnpm exec tsx scripts/smoke-saved-publication.ts`: actual Nov 13 story/post saves pass desktop/mobile light/dark, reload, legacy absence, no overflow or browser errors; four screenshots updated and mobile inspected.
- Handbook reading preferences and TASKS updated; SOURCES/NEEDS_FROM_HUMAN unchanged. Handbook/schema check passes: 18 pages, 39 tables.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, handbook/schema check and `git diff --check` pass: 985 unit/294 integration tests, four expected skips; existing web chunk warning. Corrected smoke-script lint assertion; interrupted first lint invocation rerun successfully.
- Pushed `a0ba49ad`; `systemctl --user restart news-digest-api.service news-digest-worker.service` leaves both active. `curl /healthz` confirms app/Postgres/Redis; latest reader serves five topics/15 stories/20 posts. Recent NPR feed and hourly social jobs complete. No paid calls or production edition writes.
- Next: pre-noon feed precedence fix, Nov 14 scheduled all-topic editing/diversity and NBA/item 58/private public activation. Evening generation cutoff retained; no paid calls.

## 2026-11-13: iteration 2196 — visible dates in older editions

- Clean main; no inherited work. Alerts zero; health/database/Redis pass. Scheduled acceptance awaits Nov 14; evening generation cutoff retained.
- Reader weakness: older story/post timestamps required hover to discover a calendar date. Owner benefit: publication dates now remain visible on mobile and in historical editions.
- Shared story/post timestamps show month/day/year after 24 hours, preserving recent relative times and exact accessible labels. No saved data, generation, sources, prompts or budget changes.
- Actual-edition Playwright checks (`pnpm exec tsx scripts/smoke-reader-publication-dates.ts`) pass desktop/mobile light/dark at the one-hour and 24-hour boundary; four screenshots added, mobile light inspected. No overflow or browser errors. Initial selector included an article-detail timestamp; narrowed to the shared timestamp.
- TASKS updated; archived progress 2181–2182. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: display-only fix. Initial handbook run overlapped service restart and hit connection refusal; rerun after recovery.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, handbook/schema check and `git diff --check` pass: 985 unit/294 integration tests, four expected skips; existing web chunk warning. Follow-up smoke-script lint passes.
- Rebuilt API/worker restarted active; health/database/Redis pass. Latest reader retains five topics/15 stories/20 posts. Commit/push and final restart follow verification.
- Next: pre-noon feed-content precedence fix, Nov 14 scheduled all-topic AI editing/diversity, then NBA/item 58/private public activation. No paid calls or edition writes.

## 2026-11-13: iteration 2197 — clickable saved post excerpts

- Clean main; no inherited work. Alert snapshot zero; health/Postgres/Redis pass. Scheduled acceptance waits for Nov 14; generation cutoff retained.
- Reader weakness: saved Gaming post supplied a complete patch-notes URL, but saved excerpts rendered plain text. Saved social excerpts now reuse edition link rendering; explicit URLs open their destination and other text opens the original post.
- Stored text, editorial context, publication dates and story rendering retained. No source, prompt, generation, budget or data changes; no paid calls.
- Actual Nov 13 Gaming post browser check: `pnpm exec tsx scripts/smoke-saved-post-links.ts` passes desktop/mobile light/dark, exact patch destination/text and reload, legacy dates, no overflow/errors. Four screenshots saved; mobile light inspected.
- Visual review caught oversized inherited link typography; shared post-text styling and a 16px browser assertion fix it before final verification.
- Handbook reading preferences and TASKS updated; progress 2183 archived. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, targeted lint, `pnpm check`, `pnpm build`, web rebuild, handbook/schema check and `git diff --check`; all pass: 985 unit/294 integration tests, four expected skips; existing web chunk warning.
- Rebuilt API/worker restarted; latest reader retains five topics/15 stories/20 posts. Commit/push and final service restart follow checks.
- Next: pre-noon feed-content precedence, Nov 14 all-topic AI editing/diversity and NBA/item 58 acceptance, then private public-mode activation.

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
