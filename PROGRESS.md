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

## 2026-11-13: iteration 2187 — verify richer feed evidence reaches candidates

- Clean main; no inherited work. Alerts zero; health/database/Redis pass and no failed user units. NBA/item 58 still awaits Nov 14 scheduled acceptance.
- Owner value: verify that the planned richer Ars reporting survives database updates and reaches the evidence used to select digest stories.
- Added one isolated repository-to-candidate regression using the recorded Ars fragment: teaser replaced under the same URL/ID, full 593-character reporting retained, repeat ingestion deduplicated, later empty/whitespace-only observations cannot erase it.
- Candidate title/image/date/source attribution remain intact. No production parser change, live database writes, network calls or inference; STEERING 59 noon cutoff respected.
- Updated TASKS and feed-depth evidence. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no source or runtime behavior changed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build` and `git diff --check` pass: 977 unit/294 integration tests, four expected skips; existing build chunk warnings. Archived progress 2171–2172 to retain the file-size limit.
- Runtime/services remain on unchanged production code; no restart needed for test/docs-only changes.
- Next: before-noon precedence implementation; Nov 14 scheduled AI/grouping acceptance, then item 58/private public activation. Move to another area rather than another feed-preparation iteration tonight.

## 2026-11-13: iteration 2188 — describe historical empty posts accurately

- Clean main; no inherited work. Alerts zero; health/database/Redis pass, no failed user units. NBA/item 58 remains pending Nov 14 scheduled acceptance.
- Owner value: Nov 4 World has zero saved posts but said “No standout posts today”; historical readers now see “No posts in this edition” without unsupported quality or date claims.
- Changed reader wording only. Feed-content precedence remains for before noon; no generation, saved editions, collection, budgets or inference changes.
- Temporary GET-only Playwright check against actual saved edition `3bf10f5b-4c00-48b2-85bd-8e6dac7e3238` passes desktop/mobile light/dark, all topic post counts, no overflow/page errors and immutable API before/after. Probe removed; four screenshots saved and mobile light inspected.
- Initial temporary probe needed a CommonJS entry-point wrapper; corrected and all browser checks passed. First lint-fix overlapped probe removal (ENOENT); reran after cleanup.
- `pnpm format`, retried `pnpm lint:fix`, `pnpm check`, `pnpm build`, handbook/schema validation and `git diff --check` pass: 977 unit/294 integration tests, four expected skips; existing build chunk warnings. API restarted with rebuilt reader; health/database/Redis pass.
- TASKS updated; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no source, operation or system-flow changes.
- Next: before-noon feed-content precedence; Nov 14 scheduled all-topic AI editing/event diversity, then item 58/private public activation.

## 2026-11-13: iteration 2189 — continue truncated story excerpts at source

- Clean main; no inherited work. Alerts zero; health/database/Redis pass, no failed user units. NBA/item 58 awaits Nov 14 scheduled acceptance; noon generation cutoff respected.
- Reader weakness: Nov 13 Beal and three Gaming summaries end mid-sentence with ellipses. Added “Continue reading at source” beneath explicitly truncated summaries; complete/blank summaries keep their existing treatment.
- Saved text, links, editions and generation unchanged. No inference, collection or database writes.
- Temporary GET-only Playwright check against actual latest edition passes desktop/mobile light/dark: four continuation links, exact source URLs, all saved summary text, keyboard focus, 44px targets, no overflow/page errors, immutable API before/after. Probe removed; four screenshots saved; mobile light inspected.
- TASKS updated; archived progress 2173–2174 to stay below size limit. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no source or system-flow change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check`; all pass: 977 unit/294 integration tests, four expected skips; existing build chunk warnings. API restarted with rebuilt reader; health/database/Redis pass.
- Next: pre-noon feed-content precedence, then Nov 14 scheduled all-topic AI editing/event diversity and item 58/private public activation.

## 2026-11-13: iteration 2190 — continue reading bookmarked excerpts

- Clean main; no inherited work. Alerts zero; health/database/Redis pass, no failed user units; all 38 listed sources show recent successful collection. NBA/item 58 still awaits Nov 14 scheduled acceptance; noon generation cutoff respected.
- Reader weakness: saving Nov 13's truncated or headline-only story/post dropped the edition view's explicit source guidance. Saved cards now offer continuation for truncated stories/X excerpts, and “Summary unavailable” plus “Read source” for blank story summaries.
- Bookmark storage, text, links, edition snapshots and generation unchanged; no inference or server writes.
- Temporary GET-only Playwright probe saves all 35 actual-edition items through reader controls: five unavailable summaries, seven truncated excerpts and 23 complete controls pass desktop/mobile light/dark; exact text/URLs, keyboard focus, 44px targets, reload persistence, no overflow/page errors, unchanged local storage and immutable edition API. Probe stays outside repo; four screenshots saved and mobile light inspected.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 977 unit/294 integration tests, four expected skips; existing build chunk warning.
- TASKS updated; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no source, operation or system-flow change.
- API restarted after push to serve rebuilt reader; health/database/Redis pass.
- Next: pre-noon feed-content precedence; Nov 14 scheduled all-topic AI editing/event diversity, then item 58/private public activation.

## 2026-11-13: iteration 2191 — retain editorial caveats in saved posts

- Clean main; no inherited work. Alerts zero; health/database/Redis pass, no failed user units. Scheduled NBA/item 58 acceptance remains Nov 14; feed-depth implementation remains before noon.
- Owner value: saving the actual U.S. recess-appointment post dropped the editorial attribution of its constitutional claim; newly saved posts now retain bounded context separately from original excerpts.
- Optional context survives local reloads and account merges; legacy copies remain valid. Added offline reload/bounds, browser/server tie convergence and invalid-context checks; no migration, inference or generation changes.
- GET-only temporary Playwright probe saves all 35 actual-edition items and verifies context, exact excerpts/URLs, reload persistence, keyboard controls and no overflow/errors across desktop/mobile light/dark. Edition API unchanged; four screenshots saved, mobile light inspected.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, handbook/schema check and `git diff --check` pass: 979 unit/294 integration tests, four expected skips; existing build chunk warning.
- Corrected targeted test's expected error wording; first full check stopped on new archive formatting, fixed before successful rerun. Browser initially reached API during restart; retried after healthy startup and passed.
- TASKS/owner handbook updated; archived progress 2175–2176. SOURCES/NEEDS_FROM_HUMAN unchanged: no source or owner decision changes.
- API restarted with rebuilt reader; health/database/Redis pass. Next: pre-noon feed-content precedence, then Nov 14 scheduled AI editing/event diversity and item 58/private public activation.

## 2026-11-13: iteration 2192 — record Gaming fallback event coverage

- Clean main; no inherited work. Alerts zero; health/database/Redis pass, no failed user units. Generation cutoff respected; scheduled NBA/item 58 acceptance and feed-depth implementation remain time-gated.
- Open M5 step: recorded the production loader's bounded 200 Gaming candidates for Nov 11–12 in a read-only transaction. Current stored observations/policy are not exact scheduled inputs; no live article fetches, inference or writes.
- Labeled five events before scoring; Golden Joystick winners count as one ceremony. Corrected one draft article index after headline verification, before evaluation. Labels are agent judgments; independent acceptance stays open.
- Unchanged fallback finds one of five events in five slots (20% recall/yield); two guide negatives omitted. Partial Intergalactic/Geralt phrase eligibility and recency explain missed targets; no ranking/policy tuning.
- Extended `pnpm evaluate:ranking` and historical regression; targeted four tests pass. TASKS/RANKING updated; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged: no source/system-flow/owner-decision change.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm evaluate:ranking` and `git diff --check` pass: 980 unit/294 integration tests, four expected skips; existing web chunk warning. No UI change; browser screenshots unnecessary.
- Next: pre-noon feed-content precedence, then Nov 14 scheduled AI editing/event diversity and NBA/item 58/private public activation. Independent M5 labels and semantic grouping remain open.

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
