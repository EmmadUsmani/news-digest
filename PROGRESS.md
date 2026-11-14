# Progress

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

## 2026-11-14: iteration 2224 — passive compaction recovery evidence

- Clean main; no inherited work. Health/database/Redis pass; zero pending/firing alerts. Scheduled NBA/item 58/public-mode gates still await 15:00 UTC.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`: 24 healthy rules, four uncached queries ≤0.643 s; unchanged process starts and zero new evaluator/admission/timeout/slow-query failures. Neither storage tier merged; recovery stays open.
- Metrics/alerts warning journal since Nov 13 22:47 UTC empty. Updated capacity evidence/TASKS; archived iteration 2211 to keep PROGRESS small.
- No source, schema, production code/configuration, provider calls or live content writes; SOURCES/handbook unchanged. Services already run main; no restart needed for evidence-only documentation.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, affected handbook/schema and diff checks pass: 990 unit/309 integration tests, four expected integration skips.
- Next: scheduled all-topic/NBA recovery and diversity review, item 58 closure, then private public-mode activation. No further passive metrics sample before 05:36 UTC.

## 2026-11-14: iteration 2225 — GameSpot navigation in feed excerpts

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. NBA/item 58/public activation still await the 15:00 UTC edition.
- Reader weakness: recorded GameSpot table-of-contents navigation repeats headings and displaces reporting inside the excerpt cap. Remove only its named navigation block before truncation.
- Unchanged recorded feed retains event dates, Pokemon list, metadata and the 1,500-character bound; boundary controls retain headings, article lists, other navigation and literal class-name prose.
- Focused GameSpot tests pass (3). Initial whole-file direct test had 37 passes/two isolation guards; no live DB access occurred. Full isolated verification follows below.
- TASKS, SOURCES and affected handbook updated; archived iteration 2212 to keep PROGRESS small. GameSpot remains blocked; no source requests, paid calls, flags or generation-policy changes.
- Build and handbook/schema checks pass (18 pages/39 tables; existing bundle-size warning). Reader gate verifies five topics/15 stories/20 posts in the unchanged saved edition.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass: 990 unit/311 integration tests, four expected skips; finite systemd check unit exits 0. Diff check passes.
- API/worker restarted active; health/database/Redis pass. All 38 active sources have successful collection/stored data and zero errors. No UI change or new screenshots required.
- Next: 15:00 UTC all-topic/NBA recovery and diversity review, item 58 closure, then private public-mode activation. No passive metrics sample before 05:36 UTC.

## 2026-11-14: iteration 2226 — bracketed publisher teaser continuation

- Clean main; no inherited work. Initial alerts zero; scheduled NBA/item 58/public-mode acceptance still awaits 15:00 UTC.
- Reader weakness: unchanged PlayStation/Xbox feed excerpts end in `[…]`, which hid the source-continuation link in edition cards and saved copies. Shared detection now recognizes terminal bracketed Unicode/ASCII ellipses.
- `pnpm exec tsx scripts/smoke-ars-continuation.ts playstation` and `... xbox` pass all eight desktop/mobile light/dark cases: original reporting, source URL, focus, reload, complete-story control and overflow. Responses are simulated using recorded reporting; no live edition writes.
- Sixteen screenshots saved; inspected Xbox mobile edition card. No feed, generation, schema, budget or runtime configuration changes; SOURCES/handbook remain accurate. Archived iteration 2213 to keep PROGRESS small.
- `pnpm format`, `pnpm lint:fix` and `pnpm build` pass (existing bundle warning); API/worker restarted active. Health/database/Redis pass; read-only scheduled reader check confirms five topics/15 stories/20 posts in the unchanged Nov 13 edition.
- First shell `pnpm check` ended with signal 143 during integration (990 unit passes, no reported failures); reran full verification in finite systemd unit `news-digest-check-2226`. Handbook/schema check passes: 18 pages/39 tables.
- Final `pnpm check` passes: 990 unit/311 integration passes, four expected integration skips; finite check unit exits 0. Diff check passes.
- Next: 15:00 UTC all-topic/NBA recovery and diversity review, item 58 closure, then private public-mode activation.

## 2026-11-14: iteration 2227 — Destructoid contents in feed excerpts

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. NBA/item 58/public-mode gates still await 15:00 UTC.
- Reader weakness: recorded Destructoid contents navigation repeats headings and displaces reporting. Omit only its named Yoast heading/list block before the existing excerpt cap; retain article headings/lists and unrelated blocks.
- Focused offline tests pass (2): unchanged recorded feed, metadata equivalence, retained location instructions, 1,500-character cap and boundary controls. No live source/inference calls or saved-edition changes.
- Updated TASKS, SOURCES and affected data-model handbook; archived iteration 2214 to keep PROGRESS small. No UI, schema, configuration or budget changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and affected handbook/schema checks pass (18 pages/39 tables; existing bundle warning). All 38 active sources healthy; saved reader gate confirms five topics/15 stories/20 posts.
- First full check stalled in unchanged telemetry-export transport after test 828; stopped the finite unit. Standalone telemetry tests pass (3); fresh full check in `news-digest-check-2227-retry` passes: 990 unit/313 integration passes, four expected skips; unit exits 0.
- API/worker rebuilt and restarted active; health/database/Redis and saved reader gate pass after restart. Diff check passes. No UI change or screenshots required.
- Next: investigate intermittent telemetry-export unit hang if reproduced; 15:00 UTC all-topic/NBA recovery and diversity review, item 58 closure, then private public-mode activation.

## 2026-11-14: iteration 2228 — telemetry cancellation hang

- Clean main; no inherited work. Initial alerts zero and app health/database/Redis pass. Scheduled NBA/item 58/private public-mode gates still await 15:00 UTC.
- Reproduced the transport hang in unchanged tests on stress run 38; instrumented run 13 locates it at caller cancellation (`/cancel`), past the fetch deadline. Server-close ordering was not the cause of this occurrence.
- Replaced pooled fetch with a one-shot HTTP(S) socket; cancellation/deadline reject directly and destroy the request. Byte cap, content type, credential stripping, redirect refusal and downstream buffering remain enforced; route admission unchanged.
- Added 50 body-start-synchronized cancellations per focused run, plus cookie/status/truncated-body/protocol refusals. Local 15-second diagnostics and a 60-second unit-file watchdog bound future failures; deliberately hung fixture proves the runner exits nonzero even with an open socket.
- Initial unchanged full unit suite passes 990 tests. Replacement passes 80 focused runs/4,000 synchronized cancellations; `pnpm build` passes (existing bundle warning). No paid calls, source requests, schema, budget, UI or generation changes.
- Updated TASKS; archived iteration 2215 to keep PROGRESS small. No handbook/SOURCES behavior changes.
- `pnpm format`, `pnpm lint:fix` and full `pnpm check` pass: 990 unit/313 integration passes, four expected skips; handbook/schema check passes (18 pages/39 tables). Diff check passes.
- API/worker rebuilt and restarted active; health/database/Redis pass. Saved reader gate verifies five topics/15 stories/20 posts; all 38 active sources healthy. No UI change or screenshots required.
- Next: 15:00 UTC all-topic/NBA recovery and diversity acceptance, item 58 closure, then private public-mode activation. Watch for any further transport failures; no paid replay.

## 2026-11-14: iteration 2229 — Google News headline-only descriptions

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. NBA/item 58/private public-mode gates await 15:00 UTC.
- Reader weakness: both recorded Google News descriptions repeat only their linked headline and publisher; nonblank text could fill source-fallback slots without additional reporting. Leave exact repetitions blank on Google's RSS article path.
- Recorded fixture/fallback check passes: both headline-only candidates excluded; added reporting supplies one readable slot. Explicit article content, metadata and other host/path controls remain intact. Existing stored excerpts/editions are not rewritten; blank ingestion retains saved text. No external or inference calls.
- Updated TASKS, SOURCES and affected data-model handbook; archived iteration 2216 to keep PROGRESS small. No UI/schema/budget/flag changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` pass (existing bundle warning). Five news-query tests and the focused recorded-feed test pass. Handbook/schema check passes: 18 pages/39 tables; initial render timing failure cleared on retry, and prose remains within 100 lines.
- Initial full check raced import autofix; next check found archived-entry formatting. Fixed both; final `pnpm check` passes: 990 unit/314 integration, four expected skips.
- Rebuilt API/worker restarted active; health/database/Redis pass. First reader request raced startup; retry verifies five topics/15 stories/20 posts. All 38 active sources have stored content/success/no errors.
- Next: 15:00 UTC all-topic/NBA recovery/diversity review, item 58 closure, then private public-mode activation; no paid replay.

## 2026-11-14: iteration 2230 — omit screenshot-only credits

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass. NBA/item 58/private public-mode gates await the 15:00 UTC scheduled edition.
- Reader weakness: repeated Destructoid screenshot credits consume excerpt space mid-report. Omit its two exact credit-only figcaption forms before the cap so readers get more reporting; descriptive captions and ordinary article text remain.
- Two focused offline tests pass: unchanged recorded feed/metadata equivalence, retained additional reporting, 1,500-character bound, descriptive-caption and ordinary-text controls. No live source requests, inference calls or saved-edition changes.
- Updated TASKS, SOURCES and affected data-model handbook; archived iteration 2217 to keep PROGRESS small. No UI, schema, flag or budget changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and affected handbook/schema check pass (18 pages/39 tables; existing bundle warning). Full `pnpm check` passes typecheck/lint/format/boundaries and 990 unit tests; integration has one unchanged Grafana listener startup failure (Postgres administrator disconnect), with 315 passes/four skips. Listener passes unchanged standalone; fresh `pnpm test:integration` passes 316 tests/four expected skips, unit exits 0.
- Rebuilt API/worker restarted active; health/database/Redis pass after startup retry. Saved reader gate verifies five topics/15 stories/20 posts; all 38 active sources have successful collection/stored content/no errors. No UI change or screenshots required.
- Diff check passes. Next: 15:00 UTC all-topic/NBA recovery/diversity acceptance, item 58 closure, then private public-mode activation; no paid replay.

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
