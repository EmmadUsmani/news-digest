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

Archived entries: [iterations 2202–2203](docs/progress-archive/2026-11-14-iterations-2202-2203.md).

Archived entry: [iteration 2204](docs/progress-archive/2026-11-14-iteration-2204.md).

Archived entry: [iteration 2205](docs/progress-archive/2026-11-14-iteration-2205.md).

Archived entry: [iteration 2206](docs/progress-archive/2026-11-14-iteration-2206.md).

Archived entry: [iteration 2207](docs/progress-archive/2026-11-14-iteration-2207.md).

Archived entry: [iteration 2208](docs/progress-archive/2026-11-14-iteration-2208.md).

Archived entry: [iteration 2209](docs/progress-archive/2026-11-14-iteration-2209.md).

Archived entry: [iteration 2210](docs/progress-archive/2026-11-14-iteration-2210.md).

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

## 2026-11-14: iteration 2214 — Verge commerce evidence cleanup

- Clean main; no inherited work. Zero alerts, healthy API/database/Redis. Scheduled NBA/item 58/private public-mode gates still await today's normal edition.
- Reader weakness: saved Verge CMF feed reporting ended with untagged Hype Desk JavaScript advertising unrelated Beats/Walmart products; its first configuration field entered the bounded excerpt.
- Remove only the exact empty widget plus terminal configuration before normalization; all preceding reporting remains. Plain configuration mentions, different configuration and following reporting are preserved.
- Added a minimal recorded Atom entry from the previous iteration's saved response; XML serialization differs. No new source request, crawl, paid call or change to saved editions/budgets/providers.
- Five targeted feed cases pass, including recorded metadata/reporting equality and negative controls. Handbook/SOURCES/TASKS updated; no UI or diagram change.
- First full check stalled in telemetry-export.test.ts after its first test; stopped that child after several minutes. Independent telemetry test file passes 3/3. Full `pnpm check` retry passes: 989 unit/301 integration, four expected skips.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` (existing bundler warnings), handbook/schema and diff checks pass. Saved reader verifies five topics/15 stories/20 posts; all 38 active sources report data/no errors.
- Commit/push and built API/worker restart follow; no activation flag changes.
- Next: today's scheduled all-topic/NBA acceptance, item 58 closure, then private public-mode activation.

## 2026-11-14: iteration 2215 — retain feed lead images

- Clean main; no inherited work. Zero active alerts and healthy API/database/Redis. NBA/item 58/private public-mode gates await today's normal scheduled edition.
- Reader weakness: Verge supplies its lead image in an opening HTML figure, but ingestion discarded it because only media metadata was read. Retain the supplied figure image when valid media metadata is absent.
- Only an opening figure/immediate image qualifies; preserve media priority and reject later/bare images, relative URLs, unsafe schemes and credentials. Reporting text and immutable saved editions remain unchanged.
- Recorded commerce fixture verifies the exact canonical image and unchanged excerpt; synthetic RSS controls verify priority/safety. All ten entries in the existing saved Verge response retain their supplied images. No new source/page request or paid call.
- Focused `pnpm exec tsx --test --test-name-pattern='Verge|lead figures' apps/api/test/ingestion.test.ts` passes 4/4 with the recorded SB Nation case included. Initial fixture comparison removed the caption too; corrected the control to remove only the image.
- TASKS/SOURCES/affected handbook updated; archived iterations 2202–2203 to keep PROGRESS small. No diagram, schema, UI, budget, provider or activation change.
- First full check passed 989 unit tests but failed the SB Nation no-image expectation (302 integration passed/four skipped). Its recorded opening figure now supplies the exact expected cover URL; the video-first entry remains null. Full retry follows.
- Final `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 989 unit/303 integration, four expected skips. `pnpm build` passes with existing chunk warning; `pnpm exec tsx scripts/check-handbook.ts 07-data-model` and diff checks pass.
- Built API/worker restarted active. First immediate reader request raced startup; retry passes. `/healthz` healthy; `check-scheduled-reader.ts 2026-11-13T15:00:00Z` verifies five topics/15 stories/20 posts; protected source read reports all 38 with data/no errors.
- Commit/push and final service restart follow. Next: normal scheduled all-topic/NBA acceptance, item 58 closure, then private public-mode activation.

## 2026-11-14: iteration 2216 — rejected NBA output stays out of publication

- Clean main; no inherited work. Zero active alerts; API/database/Redis healthy. Scheduled NBA/item 58/private public-mode acceptance still waits for today's edition.
- Reader risk: saved malformed Haiku initial story ID was refused in isolation but lacked publication/HTTP coverage. Extend the existing historical NBA regression so rejected generated text cannot become reader content.
- Feed both simulated model attempts the unchanged saved malformed output; require non-AI source-only fallback, five supplied story IDs/headlines/excerpts and no generated summaries/context/brief. Immutable retrieval and public reader latest/history/detail checks include these fallback snapshots; unpublished copies stay hidden.
- Repeated generations dispatch/settle six synthetic-zero-usage responses, produce six invalid-selection diagnostics and never cache the rejection. Accepted initial/repair cache cases remain covered. Historical structured output, synthetic transport/triage/metadata; no paid calls or production changes.
- Typecheck and targeted fresh-container malformed-Haiku regression pass. Initial targeted attempt exhausted the one-record replay; corrected it to supply every simulated dispatch. Temporary scoped runner removed.
- TASKS and DATABASE-VERIFICATION updated; archived iteration 2204 to keep PROGRESS small. No UI, diagram, schema, source, provider, budget or activation change. Handbook/schema check passes (18 pages/39 tables).
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 989 unit/304 integration, four expected skips. `pnpm build` passes with existing chunk warnings; diff checks pass.
- Built API/worker restarted active; `/healthz` healthy. Immediate reader check raced startup; retry of `check-scheduled-reader.ts 2026-11-13T15:00:00Z` verifies five topics/15 stories/20 posts. Protected source read: all 38 have data/success/no errors. Commit/push follow.
- Next: today's scheduled all-topic/NBA acceptance, close item 58, then private public-mode activation.

## 2026-11-14: iteration 2217 — keep opening photo captions out of reporting

- Clean main; no inherited work. Zero alerts and healthy API/database/Redis. NBA/item 58 acceptance awaits today's scheduled edition.
- Reader weakness: four entries in the saved Nov 13 Verge response start excerpts with photo captions; the FAA report begins with a June airport-photo date ahead of November reporting.
- Exclude only opening image-and-caption-only figures from excerpt text. Keep the separately extracted lead image, subsequent reporting, later captions and figures containing reporting paragraphs; caption-only content falls back to the publisher teaser.
- Recorded commerce regression preserves reporting/metadata; synthetic boundary controls pass. Offline saved ten-entry feed probe confirms FAA reporting starts the excerpt, June date is absent and lead image survives. No new source requests, paid calls or UI changes.
- TASKS/SOURCES/affected handbook updated; archived iteration 2205 to keep PROGRESS small. Saved editions, provider, budgets and activation flags unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 989 unit/305 integration, four expected skips. `pnpm build` passes with existing chunk warning; handbook/schema and diff checks pass.
- Built API/worker restarted; `/healthz` healthy. `check-scheduled-reader.ts 2026-11-13T15:00:00Z` verifies five topics/15 stories/20 posts. Protected status: all 38 active sources have data/success and no errors.
- Commit/push and final restart follow. Next: scheduled all-topic/NBA recovery and diversity acceptance, item 58 closure, then private public-mode activation.

## 2026-11-14: iteration 2218 — preserve publisher truncation signals

- Clean main; no inherited work. Zero alerts; API/database/Redis healthy. Scheduled NBA/item 58 acceptance awaits today's edition.
- Recorded VGC/Gematsu excerpts end in “… Source”, hiding truncation from the reader's existing continuation detection.
- Remove only terminal standalone Source paragraphs linking to the same canonical article. Preserve reporting, external/inline/nonterminal links and all metadata.
- Focused ingestion self-link tests pass 2/2: four recorded articles plus synthetic boundaries. No live source request, paid call, saved-edition rewrite or UI change.
- TASKS/SOURCES/affected handbook updated; archived iteration 2206 to keep PROGRESS small. Initial handbook check exceeded its length limit by one line; shortened affected text and recheck passes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 989 unit/307 integration, four expected skips. `pnpm build` passes with existing chunk warning; `check-handbook.ts 07-data-model` and diff checks pass.
- Built API/worker restarted active; `/healthz` healthy. `check-scheduled-reader.ts 2026-11-13T15:00:00Z` verifies five topics/15 stories/20 posts. Protected status reports all 38 active sources with data/success/no errors; initial inline probe needed a CJS-compatible promise wrapper.
- Commit/push and final restart follow. Next: scheduled all-topic/NBA recovery and diversity acceptance, item 58 closure, then private public-mode activation.

## 2026-11-14: iteration 2219 — require complete triage for recovery acceptance

- Clean main; no inherited work. Zero alerts and healthy API/database/Redis; scheduled recovery remains due at 15:00 UTC.
- Nov 13's missing sections/repeated fallback events came from partial triage. AI provenance alone could accept a partially scored shortlist.
- Read-only required-topic gate now also requires zero saved unscored candidates; cached scores remain valid. No generation, provider, budget, activation or UI change.
- Five focused gate tests pass, including AI-edited but partially scored refusal. Initial test expectation accidentally included an internal evidence field; corrected before verification.
- Saved Nov 13 NBA still fails non-AI acceptance. In-memory synthetic AI-provenance control on its unchanged 59 unscored IDs also fails; no saved data mutation or paid call.
- TASKS and Nov 13 review updated. No source/handbook/schema change.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 990 unit/307 integration, four expected skips. `pnpm build`, handbook/schema (18 pages/39 tables) and diff checks pass.
- Built API/worker restarted active; health/database/Redis pass. Initial reader check raced startup; retry verifies five topics/15 stories/20 posts. All 38 active sources have data/success/no errors.
- Commit/push and final restart follow.
- Next: scheduled all-topic/NBA recovery and manual diversity/support review, item 58 closure, then private public-mode activation.

## 2026-11-14: iteration 2220 — omit repeated publisher post footers

- Clean main; no inherited work. Zero alerts. Scheduled recovery/NBA/item 58 acceptance awaits 15:00 UTC.
- Recorded NBA/Gaming feeds repeat headlines and publisher names after reporting in “The post … appeared first on …” navigation.
- Omit only terminal two-link paragraphs whose headline link canonicalizes to the article. Preserve external/nonterminal links and prose mentions; reporting and metadata remain intact.
- Two focused tests pass: five recorded Basketball Insiders/Insider Gaming articles plus synthetic boundary controls. No new source requests, paid calls, saved-edition writes or UI changes.
- TASKS/SOURCES/affected handbook updated; archived iteration 2207 to keep PROGRESS small. Budgets, provider and activation unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 990 unit/309 integration, four expected skips. Build passes with existing bundle warnings; affected handbook/schema and diff checks pass.
- API/worker restarted active; `/healthz` database/Redis pass. Reader gate verifies five topics/15 stories/20 posts; all 38 active sources have successful collection and no errors.
- Commit/push and final restart follow. Next: scheduled all-topic/NBA recovery and diversity review, item 58 closure, then private public-mode activation.

## 2026-11-14: iteration 2221 — Gaming Read more continuation

- Clean main; no inherited work. Zero alerts and healthy API/database/Redis. Scheduled recovery/NBA/item 58 acceptance awaits 15:00 UTC.
- Recorded Eurogamer/RPS reporting ends in plain “Read more” without the reader's explicit source continuation; recognize that terminal standalone prompt in edition cards and saved copies.
- Preserve reporting and destinations; ordinary read-more prose and nonterminal prompts stay unchanged. No generation, paid calls, saved-edition writes, source requests or activation changes.
- Four unchanged recorded excerpts recognized offline. `smoke-ars-continuation.ts eurogamer` and `rps` pass all eight desktop/mobile light/dark cases: source links, focus, saved text/reload, complete-story negative control, no overflow/page errors. Sixteen screenshots saved; mobile edition/saved images inspected.
- TASKS/affected handbook updated; archived iterations 2208–2209 to keep PROGRESS small. SOURCES unchanged: no collection change.
- `pnpm format`, `pnpm lint:fix`, build and affected handbook/schema checks pass. Initial concurrent `pnpm check` reached lint before autofix sorted smoke imports; corrected and full recheck passes: 990 unit/309 integration tests, four expected skips.
- API/worker restarted; health passes. Reader gate verifies five topics/15 stories/20 posts. All 38 active sources have data/success/no errors; initial probe used nonexistent lastSuccessAt/lastError fields, corrected to actual status fields.
- Next: scheduled all-topic/NBA recovery and diversity review, item 58 closure, then private public-mode activation.

## 2026-11-14: iteration 2222 — saved social continuation

- Clean main; no inherited work. Zero alerts; NBA/item 58 acceptance awaits the scheduled edition.
- Reader value: clipped saved Bluesky/Reddit posts now offer explicit platform-labelled continuation links, matching X; complete posts remain unchanged. Shared 600-character bounds exposed the gap.
- `smoke-saved-post-continuation.ts` passes desktop/mobile light/dark: real bookmark clipping with explicit offline fixtures, three platforms, complete controls, destinations, focus, reload/storage preservation, no overflow/page errors. Four screenshots saved; mobile light/desktop dark inspected.
- TASKS/affected handbook updated; SOURCES unchanged (no ingestion change). No paid calls, server content writes, generation/configuration or activation changes.
- `pnpm format`, `pnpm lint:fix`, build, handbook/schema and diff checks pass. Archived iteration 2210 to keep this file small.
- Restarted API/worker active; health/database/Redis pass. Reader gate: five topics/15 stories/20 posts. All 38 active sources have data/success and no errors.
- Interactive check and isolated retry each terminated (143) after case 313, before summary. Finite temporary systemd unit completes `pnpm check` exit 0: 990 unit/309 integration pass, four expected skips. Unit collected after success.
- Next: 15:00 UTC scheduled recovery/NBA/diversity review, item 58 closure, then private public-mode activation.
