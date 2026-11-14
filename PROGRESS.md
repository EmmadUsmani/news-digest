# Progress

Archived entry: [iteration 2230](docs/progress-archive/2026-11-14-iteration-2230.md).

Archived entry: [iteration 2229](docs/progress-archive/2026-11-14-iteration-2229.md).

Archived entry: [iteration 2228](docs/progress-archive/2026-11-14-iteration-2228.md).

Archived entry: [iteration 2227](docs/progress-archive/2026-11-14-iteration-2227.md).

Archived entry: [iteration 2226](docs/progress-archive/2026-11-14-iteration-2226.md).

Archived entry: [iteration 2225](docs/progress-archive/2026-11-14-iteration-2225.md).

Archived entry: [iteration 2224](docs/progress-archive/2026-11-14-iteration-2224.md).

Archived entry: [iteration 2223](docs/progress-archive/2026-11-14-iteration-2223.md).

Archived entry: [iteration 2222](docs/progress-archive/2026-11-14-iteration-2222.md).

Archived entry: [iteration 2221](docs/progress-archive/2026-11-14-iteration-2221.md).

Archived entry: [iteration 2220](docs/progress-archive/2026-11-14-iteration-2220.md).

Archived entry: [iterations 2218–2219](docs/progress-archive/2026-11-14-iterations-2218-2219.md).

Archived entry: [iteration 2217](docs/progress-archive/2026-11-14-iteration-2217.md).

Archived entry: [iteration 2216](docs/progress-archive/2026-11-14-iteration-2216.md).

Archived entry: [iteration 2213](docs/progress-archive/2026-11-14-iteration-2213.md).

Archived entry: [iteration 2212](docs/progress-archive/2026-11-14-iteration-2212.md).

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

Archived entry: [oldest retained iteration](docs/progress-archive/2026-11-14-oldest-before-2224.md).

## 2026-11-14: iteration 2231 — PlayStation podcast reporting first

- Clean main; no inherited work. `pnpm obs alerts` zero; `/healthz` database/Redis pass. NBA/item 58/private public-mode gates await 15:00 UTC.
- Reader weakness: recorded PlayStation podcast excerpts start with email/subscription navigation. Omit the exact opening promotion on its blog; retain episode reporting, metadata and the 1,500-character cap. Saved editions unchanged; no external requests or inference calls.
- Focused recorded-feed test passes, including other-host/non-opening/changed-wording controls. Updated TASKS, SOURCES and affected handbook prose; no UI/schema/budget/flag changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 07-data-model` and full `pnpm check` pass: 990 unit/317 integration passes, four expected skips; 18 handbook pages/39 tables. Existing bundle warning only.
- API/worker restarted active; `/healthz` passes. `check-scheduled-reader.ts 2026-11-13T15:00:00Z` verifies five topics/15 stories/20 posts; local source read confirms all 38 successful with stored content/no errors. Diff check passes.
- Next: scheduled all-topic/NBA recovery/diversity acceptance, close item 58, then private public-mode activation; no paid replay.

## 2026-11-14: iteration 2232 — NBA automatic repair through publication

- Clean main; no inherited work. Initial alerts zero; `/healthz` database/Redis pass. Scheduled NBA/item 58/private public-mode gates still await 15:00 UTC.
- Owner-visible value: protect corrected NBA summaries through automatic repair and publication, covering the actual malformed saved Haiku story ID rather than adding another excerpt cleanup.
- Added one isolated regression: saved invalid initial output → real budgeted repair → saved supported output → publication/immutable retrieval/public reader HTTP. Fingerprinted requests reject unexpected repair transport; only corrected output is cached, with two reservations/settlements and no extra calls across later generations.
- Targeted temporary Testcontainers runner passes the new case (one test); runner removed. Historical structured outputs/candidate reporting retained; synthetic request, triage, metadata and zero usage explicit. No live provider call, data mutation or runtime behavior change.
- Updated TASKS and DATABASE-VERIFICATION; archived iterations 2218–2219 to keep PROGRESS small. Full-edition raw-response golden remains open because historical triage responses are absent. No handbook/UI/source changes.
- `pnpm format`, `pnpm lint:fix`, API typecheck and `pnpm build` pass (existing bundle warnings). Full `pnpm check` passes: 990 unit/318 integration tests, four expected skips; format/lint/typecheck/boundaries pass.
- Rebuilt API/worker restarted active; `/healthz` passes after startup retry. `check-scheduled-reader.ts 2026-11-13T15:00:00Z` verifies five topics/15 stories/20 posts; local status read confirms all 38 active sources have stored content/success/no errors. Diff check passes.
- Next: 15:00 UTC all-topic/NBA recovery/diversity acceptance, item 58 closure, then private public-mode activation; no paid replay.

## 2026-11-14: iteration 2233 — Verge reporting without purchase navigation

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. NBA/item 58/private public-mode gates await 15:00 UTC scheduled acceptance.
- Reader weakness: recorded Verge commerce excerpts flatten widget old/current prices into ambiguous “$59 $39” between reporting paragraphs. Omit its exact purchase-widget structure on the publisher host; article prices, discounts, battery life and customization details remain.
- Three focused recorded-Verge tests pass, including unchanged fixture/metadata equivalence and other-host/changed-structure/nested-reporting controls. No live source requests, inference calls or saved-edition edits.
- Updated TASKS, SOURCES and affected handbook prose; archived iteration 2220 to keep PROGRESS small. No UI/schema/budget/flag changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 07-data-model` and full `pnpm check` pass: 990 unit/319 integration tests, four expected skips; format/lint/typecheck/boundaries pass; 18 handbook pages/39 tables. Existing bundle warnings only.
- API/worker restarted active; `/healthz` passes. `check-scheduled-reader.ts 2026-11-13T15:00:00Z` verifies five topics/15 stories/20 posts after startup retry. Local source status confirms all 38 active sources have successful collection/stored content/no errors. Diff check passes.
- Next: scheduled all-topic/NBA recovery/diversity acceptance, close item 58, then private public-mode activation; no paid replay.

## 2026-11-14: iteration 2234 — Push Square reporting without teaser navigation

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. NBA/item 58/private public-mode gates await 15:00 UTC.
- Reader weakness: saved Gaming excerpt includes Push Square's “Read the full article” self-link as reporting. Omit its exact terminal footer on the publisher host when the destination matches; retain reporting, metadata and an omission marker for source continuation.
- Recorded-feed regression passes with other-host/changed-wording/other-destination/nonterminal controls; unchanged fixture, reporting and metadata verified. No live source requests, paid calls or saved-edition rewrites.
- Updated TASKS, SOURCES and affected handbook prose; archived iteration 2221 to keep PROGRESS small. No UI/schema/budget/flag changes.
- Formatting, lint fix and build pass; handbook check passes on retry (initial render failure). Initial full check caught new archive formatting, corrected before final verification.
- Final pnpm check passes: 990 unit/320 integration tests, four expected skips; format/lint/typecheck/boundaries pass. Existing build bundle warnings only.
- Rebuilt API/worker restarted active; health passes. Saved-reader gate verifies five topics/15 stories/20 posts; all 38 sources healthy. Diff check passes.
- Next: scheduled all-topic/NBA recovery/diversity acceptance, item 58 closure, then private public-mode activation; no paid replay.

## 2026-11-14: iteration 2235 — Gematsu lead images from descriptions

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. NBA/item 58/private public-mode acceptance awaits the 15:00 UTC scheduled edition.
- Owner-visible weakness: both saved Nov 13 Gematsu stories lack images. The recorded publisher feed puts lead images at the beginning of descriptions, outside existing media/content-figure extraction.
- Preserve opening Gematsu HTTPS upload images as the last fallback; existing media/content images retain priority. Recorded excerpts and metadata remain unchanged; other publishers, image hosts/paths, later images and lazy attributes excluded.
- New offline recorded-feed regression passes; no live source requests, paid calls or saved-edition rewrites. Updated TASKS, SOURCES and affected handbook prose; archived iteration 2222 to keep PROGRESS small.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, handbook check and full `pnpm check` pass: 991 unit/320 integration tests, four expected skips. Existing build bundle warnings only.
- Rebuilt API/worker restarted active; health passes after startup retry. Saved-reader gate verifies five topics/15 stories/20 posts; all 38 active sources healthy. Diff check passes.
- Next: scheduled all-topic/NBA recovery/diversity acceptance, item 58 closure, then private public-mode activation; no paid replay.

## 2026-11-14: iteration 2236 — NBA repair budget exhaustion at publication

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. Scheduled NBA/item 58/public-mode acceptance remains gated on the 15:00 UTC edition.
- Added isolated historical NBA regression for malformed initial output consuming the last reservation: automatic repair carries selection feedback but admission refuses; only one dispatch/settlement, no cache writes.
- Two published snapshots retain five source-only fallback stories/non-AI provenance through immutable retrieval and public reader HTTP latest/history/detail; unpublished generation stays hidden. Requests/triage/metadata/zero usage and ledger exhaustion are synthetic; no live inference.
- Updated TASKS and database-verification evidence; archived iteration 2223 to keep PROGRESS small. Runtime, budgets, source configuration and saved editions unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and full `pnpm check` pass: 991 unit/321 integration tests, four expected skips. Final targeted isolated edition-golden run passes all 14 cases; final API typecheck/targeted ESLint pass. Existing build bundle warnings only.
- API/worker restarted active; health/database/Redis pass. Saved-reader gate verifies five topics/15 stories/20 posts; all 38 active sources have successful collection/stored content/no errors. Diff check passes.
- Next: 15:00 scheduled all-topic/NBA recovery/diversity acceptance, item 58 closure, then private public-mode activation; no paid replay.

## 2026-11-14: iteration 2237 — CBS lead photos from RSS enclosures

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. Scheduled NBA/item 58/private public-mode acceptance awaits 15:00 UTC.
- Reader weakness: saved NBA CBS story lacks an image. Current CBS feed explicitly supplies JPEG/PNG photos as RSS enclosures; one free feed GET confirmed the unchanged recorded fixture's format.
- Ingestion now retains HTTPS raster-image enclosures as the last image fallback, so future NBA cards can show publisher-supplied photos. Recorded reporting/metadata remain unchanged; unsupported/missing MIME, HTTP, credential URLs, audio-first and existing-image precedence controls pass offline.
- Updated TASKS, SOURCES and affected handbook prose; archived iteration 2224 to keep PROGRESS small. No paid calls, article crawling, selection changes or saved-edition rewrites.
- Targeted two-test run, `pnpm format`, `pnpm lint:fix`, `pnpm build` and handbook check pass; existing build bundle warnings only.
- Full `pnpm check` passes: 992 unit/321 integration tests, four expected skips; typecheck/lint/format/boundaries pass.
- Rebuilt API/worker/docs restarted active; health passes. Saved-reader gate passes on startup retry: five topics/15 stories/20 posts. All 38 active sources have successful collection/stored content/no errors. Diff check passes.
- Next: 15:00 scheduled all-topic/NBA recovery/diversity acceptance, item 58 closure, then private public-mode activation; no paid replay.

## 2026-11-14: iteration 2238 — Guardian lead-photo resolution

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. NBA/item 58/private public-mode acceptance awaits the 15:00 UTC scheduled edition.
- Recorded Guardian World RSS supplies 140/460/700px versions of each lead photo; ingestion previously selected 140px. It now retains the largest supplied width of that same HTTPS publisher-hosted photo, preserving its signed URL.
- Unchanged recorded reporting/metadata verified; other-publisher, host/path, insecure URL, invalid/mismatched width and reordered-entry controls pass. No live requests, paid calls, source configuration changes or saved-edition rewrites.
- Updated TASKS, SOURCES and affected handbook prose; archived iteration 2225 to keep PROGRESS small.
- Targeted recorded-feed regression, `pnpm format`, `pnpm lint:fix`, `pnpm build` and handbook check pass. Existing build bundle warnings only. Initial full check caught archived-entry formatting; fixed with Prettier and reran successfully.
- Full `pnpm check` passes: 992 unit/322 integration tests, four expected skips; typecheck/lint/format/boundaries pass.
- Rebuilt API/worker/docs restarted active; health/database/Redis pass. Saved-reader gate passes after startup retry: five topics/15 stories/20 posts; all 38 active sources healthy. Diff check passes.
- Next: scheduled all-topic/NBA recovery/diversity acceptance, item 58 closure, then private public-mode activation; no paid replay.

## 2026-11-14: iteration 2239 — Nintendo Life teaser continuation

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. NBA/item 58/private public-mode acceptance awaits the 15:00 UTC scheduled edition.
- Reader weakness: Nintendo Life feed teasers include publisher navigation as reporting. The owner will see cleaner future summaries with source continuation retained.
- Extended the existing publisher/self-destination/terminal-only teaser rule to Nintendo Life; both unchanged recorded articles preserve reporting and metadata with an omission marker. Other hosts, cross-publisher labels, changed wording, other destinations and nonterminal controls pass offline.
- Updated TASKS and SOURCES; archived iteration 2226 to keep PROGRESS small. No live requests, paid calls, source configuration changes or saved-edition rewrites.
- Targeted `pnpm exec tsx --test apps/api/test/feed-nintendo-teaser.test.ts`, `pnpm format`, `pnpm lint:fix`, `pnpm build` and full `pnpm check` pass: 993 unit/322 integration tests, four expected skips; typecheck/lint/format/boundaries pass. Existing build bundle warnings only.
- Rebuilt API/worker restarted active; `/healthz` passes. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-13T15:00:00Z` verifies five topics/15 stories/20 posts; local admin status read confirms all 38 active sources healthy with stored content. Diff check passes.
- Next: scheduled all-topic/NBA recovery/diversity acceptance, item 58 closure, then private public-mode activation; no paid replay.

## 2026-11-14: iteration 2240 — Ars fragment navigation

- Clean main; no inherited work. Alerts zero; health/database/Redis pass. NBA/item 58/private public-mode acceptance awaits the 15:00 UTC scheduled edition.
- Reader weakness: supplied Ars outage reporting ends with “Read full article Comments”, contaminating evidence sent to summaries. Omit only that terminal pair on the publisher host with article-matching links and #comments.
- Unchanged recorded fragment retains all 566 reporting characters plus continuation ellipsis and identical metadata. Publisher, wording, destinations, fragment and nonterminal controls pass offline. No external requests, paid calls or saved-edition changes.
- Updated TASKS, SOURCES and source-depth evidence; archived iterations 2227–2228 to keep PROGRESS small. No affected handbook behavior change beyond existing feed normalization.
- Targeted `pnpm exec tsx --test apps/api/test/feed-ars-navigation.test.ts`, `pnpm format`, `pnpm lint:fix` and `pnpm build` pass; existing bundle-size warnings only.
- Full `pnpm check` passes: 994 unit/322 integration tests, four expected skips; typecheck/lint/format/boundaries pass. Diff check passes.
- Rebuilt API/worker restarted active; `/healthz` passes. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-13T15:00:00Z` passes after startup retry: five topics/15 stories/20 posts; local admin status confirms all 38 active sources healthy with stored content.
- Next: scheduled all-topic/NBA recovery/diversity acceptance, item 58 closure, then private public-mode activation; no paid replay.

## 2026-11-14: iteration 2241 — Sonnet repair publication regression

- Clean main; no inherited work. Alerts zero; health/database/Redis pass. Scheduled NBA/item 58/public-mode acceptance still awaits 15:00 UTC.
- Owner-visible purpose: protect AI-edited NBA summaries through repair and publication rather than accepting a corrected response only in isolation.
- Added the saved corrected Sonnet response to the existing automatic repair/publication/public-reader HTTP regression. The malformed initial output is historical Haiku output under synthetic Sonnet transport; this is an offline orchestration case, not a historical request pair.
- Verifies two separate reservations/settlements, exactly one corrected cache write, cache reuse across generations, immutable published snapshots and hidden unpublished content.
- Updated TASKS and database verification evidence. No runtime behavior changes, provider requests, paid replay or saved-edition changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and full `pnpm check` pass: 994 unit/323 integration tests, four expected skips; typecheck/lint/format/boundaries green. Existing build bundle warnings only.
- API/worker restarted healthy; `/healthz` passes. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-13T15:00:00Z` passes after startup retry: five topics/15 stories/20 posts. New Sonnet automatic repair publication case passes; diff check passes.
- Next: scheduled all-topic/NBA recovery/diversity acceptance, item 58 closure, then private public-mode activation.

## 2026-11-14: iteration 2242 — Guardian teaser navigation

- Clean main; no inherited work. Alerts zero and health/database/Redis pass. NBA/item 58/private public-mode acceptance awaits the scheduled 15:00 UTC edition.
- Reader weakness: recorded World/U.S. Guardian teasers pass terminal “Continue reading...” navigation to summary evidence. Omit only the terminal article-matching link on the Guardian host; retain reporting, metadata and a source-continuation ellipsis.
- Unchanged recorded feeds and publisher/destination/wording/nonterminal controls pass offline. GamesRadar body-loss suspicion was ruled out: its content:encoded already supplies reporting. No external requests, paid calls or saved-edition changes.
- Updated TASKS and SOURCES; archived iteration 2229 to keep PROGRESS small. No affected handbook system behavior beyond existing feed normalization.
- Targeted `pnpm exec tsx --test apps/api/test/feed-guardian-navigation.test.ts`, `pnpm format`, `pnpm lint:fix` and `pnpm build` pass; existing build warnings only. Full check initially stopped on archive formatting; corrected with Prettier and rerun.
- Full `pnpm check` passes: 996 unit/323 integration tests, four expected skips; typecheck/lint/format/boundaries green. Final changed-file Prettier and diff checks pass.
- Rebuilt API/worker active; `/healthz` passes. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-13T15:00:00Z` verifies five topics/15 stories/20 posts. Local admin status confirms all 38 active sources have stored content and no recorded errors.
- Next: scheduled all-topic/NBA recovery/diversity acceptance, item 58 closure, then private public-mode activation; no paid replay.

## 2026-11-14: iteration 2243 — Verge teaser navigation

- Clean main; no inherited work. Alerts zero; health/database/Redis pass. NBA/item 58/private public-mode acceptance awaits 15:00 UTC.
- Reader weakness: recorded Verge Atom fragments append “Read the full story at The Verge.” to reporting evidence. Remove only terminal article-matching links on the publisher host; preserve reporting and continuation ellipsis.
- Unchanged recorded feed retains all reporting and metadata; publisher/destination/wording/nonterminal controls pass offline. No external requests, paid calls or saved-edition changes.
- Updated TASKS and SOURCES; archived iteration 2230 to keep PROGRESS small. Existing handbook feed-normalization description remains accurate.
- Targeted `pnpm exec tsx --test apps/api/test/feed-verge-navigation.test.ts`, `pnpm format`, `pnpm lint:fix` and `pnpm build` pass; existing bundle warnings only.
- Rebuilt API/worker restarted healthy; `/healthz` passes. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-13T15:00:00Z` verifies five topics/15 stories/20 posts. Local admin status confirms all 38 active sources have stored content and no recorded errors.
- Full `pnpm check` passes: 998 unit/323 integration tests, four expected skips; typecheck/lint/format/boundaries green. Final changed-file formatting and diff checks pass.
- Next: scheduled all-topic/NBA recovery/diversity acceptance, item 58 closure, then private public-mode activation; no paid replay.
