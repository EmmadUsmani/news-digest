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

## 2026-11-13: iteration 2181 — compare U.S. Bluesky reporting supply

- Clean main; no inherited work. Initial alerts zero, database/Redis healthy, no failed user services.
- Owner value: test whether alternate U.S. searches supply concrete reporting beyond the repaired Congress pool, without risking tomorrow’s edition.
- Added non-storing `probe-bluesky.ts --us`; four free searches return 49/49/50/48 observations for Congress/Senate/House of Representatives/US politics.
- Senate exposes first-person leadership text but repeats selected X coverage; House repeats election coverage/adds foreign-policy scope; broad politics adds commentary. Retain Congress and semantic/editorial gates.
- Four-result window/count/non-storage/publication assertions pass; combined `--us --store` refuses before credentials/network. Export mode 600; no media or paid calls.
- Updated TASKS/SOURCES and U.S. selection evidence; archived iterations 2164–2165 to keep progress small. Handbook/NEEDS_FROM_HUMAN unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 977 unit/291 integration tests, four expected skips; existing build warnings only.
- Local probe only; runtime unchanged, no restart required. Next: Nov 14 scheduled recovery/AI/event-diversity review, then item 58/private public activation.

## 2026-11-13: iteration 2182 — accurate empty-story reader message

- Clean main; no inherited work. Alerts zero, health/database/Redis pass, all 38 sources healthy, all queues available; next digest Nov 14 15:00 UTC.
- Owner value: World/U.S. withheld stories after failed triage must not be described as a quiet news day.
- Reader now says “No stories in this edition”; published posts remain visible. Immutable snapshots and generation unchanged; NBA/item 58 acceptance still awaits Nov 14.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 977 unit/291 integration tests, four expected skips; existing build warnings only.
- Restarted `news-digest-api.service`; retrying `curl -fsS http://localhost:8000/healthz` passes; post-restart alerts zero.
- `node /tmp/iteration-2182-reader.cjs`: GET-only Playwright on real saved edition, third parties blocked; both empty sections and retained posts pass at 390/1440px light/dark; no overflow/browser errors.
- Saved four screenshots under `docs/screenshots/ui/reader-empty-stories-*`; inspected mobile light and desktop dark images.
- Updated TASKS; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged (reader wording fix only); no paid calls.
- Next: Nov 14 scheduled recovery/AI/event-diversity review, then item 58/private public activation.

## 2026-11-13: iteration 2183 — disclose missing story summaries

- Clean main; no inherited work. Initial alerts zero, health/database/Redis pass, no failed user services.
- Owner value: five saved Tech headlines have no summary; readers now see an explicit unavailable message and an accessible source link instead of an unexplained gap.
- Whitespace-only summaries use the same fallback; existing summaries render unchanged. Saved editions, generation, budgets and activation gates unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass; 977 unit/291 integration tests, four expected skips.
- Restarted API; `/healthz` passes. GET-only `node /tmp/iteration-2183-reader.cjs` checks the real saved edition at 390/1440px, light/dark: five fallbacks, correct source URLs, retained summaries, no overflow/browser errors.
- Corrected the temporary browser check’s exact-text matcher (message includes its link); rerun passes. Four screenshots saved under `docs/screenshots/ui/reader-missing-summaries-*`; inspected mobile light and desktop dark.
- Updated TASKS; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged (reader presentation only); no paid calls.
- Next: Nov 14 scheduled all-topic AI/event-diversity acceptance, then item 58/private public activation.

## 2026-11-13: iteration 2184 — continue incomplete saved X excerpts

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass, no failed user services. All 38 sources healthy; digest queue available with Nov 14 15:00 UTC scheduled.
- Owner value: Curry's saved injury update stops at “two (2)…”; readers now have a clear continuation link beside that incomplete text, also covering two other saved X excerpts.
- Reader offers “Continue reading on X” for a terminal ellipsis, ignoring trailing media links. Internal ellipses do not trigger it; all saved text and generation remain unchanged.
- Ten targeted excerpt-ending cases pass. GET-only `node /tmp/iteration-2184-reader.cjs` passes actual saved-edition checks at 390/1440px, light/dark: three correct links, 16 original texts preserved, no overflow/browser errors.
- Restarted API; health passes. Four screenshots saved under `docs/screenshots/ui/reader-x-continue-*`; inspected mobile light/desktop dark. Initial browser attempt raced startup; retry after healthy endpoint passed.
- `pnpm format`, `pnpm lint:fix`, standalone `pnpm check`, `pnpm build`, `git diff --check` pass: 977 unit/291 integration tests, four expected skips; existing build warnings. Initial combined check received SIGTERM near unit-test completion; full retry passed.
- Updated TASKS; archived progress 2166–2168 to keep this file small. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged (reader link only); no paid calls.
- Next: Nov 14 scheduled all-topic AI/event-diversity acceptance, then item 58/private public activation. Further small reader changes give way to source/editorial work.

## 2026-11-13: iteration 2185 — identify Tech feed evidence loss

- Clean main; no inherited work. Initial alerts zero, health/database/Redis pass, no failed user services. NBA/item 58/public activation still requires Nov 14 scheduled acceptance.
- Owner value: richer Tech reporting is already fetched but discarded: Ars parser chooses a short teaser before supplied article content, losing concrete Microsoft outage/recovery details.
- One explicit live RSS GET, no article destinations/media/paid calls or writes. Temporary offline `pnpm exec tsx scripts/tmp-2185.ts` passed 20 canonical-URL matches, exact teaser precedence, richer bounded bodies and the recovery-quote check; probe removed.
- All 20 teasers are 52–101 characters versus 593–1,500 supplied body characters. Recorded response hash, example and bounded content-first/blank-fallback implementation in `docs/edition-reviews/2026-11-13-tech-feed-depth.md`; updated SOURCES/TASKS.
- No production parser/generation change after noon under STEERING 59. Implement before noon UTC; retain text cap, attribution and no-crawl rule. Existing HN blank-link limitation is unchanged, not a new failure.
- Saved NBA fixtures contain normalized outputs, not original raw response bytes; raw-response golden remains open. No fixture relabelled or paid re-recording.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, handbook/schema validation and `git diff --check` pass; build has existing chunk warnings. Full `pnpm check` passes: 977 unit/291 integration tests, four expected skips.
- Archived progress 2169–2170 to retain the size limit. Runtime/services remain on unchanged production code; no restart needed for this evidence-only step. NEEDS_FROM_HUMAN unchanged; no new owner decision required.
- Next: pre-noon feed-content precedence fix; then Nov 14 all-topic AI/event-diversity acceptance and item 58/private public activation.

## 2026-11-13: iteration 2186 — prepare recorded feed-content safety checks

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass, no failed user units. NBA/item 58 still awaits Nov 14 scheduled acceptance.
- Owner value: prepare the richer Ars reporting fix without changing generation after STEERING 59’s noon cutoff; recovery details and attribution now have reproducible offline checks.
- Recorded one minimal article from iteration 2185’s saved RSS; retained original fields, reserialized XML. No new live fetch, crawl, inference or ingestion write.
- Two new tests cover the 593-character recovery body, unchanged metadata, RSS/Atom body paths, blank fallback, 1,500-character cap and X citations beyond that cap.
- Targeted `pnpm exec tsx --test --test-name-pattern='recorded Ars content|feed content paths' apps/api/test/ingestion.test.ts` passes (2/2).
- Initial direct whole-file test correctly refused its DB case outside the isolated harness; no live DB access. Full harness verification recorded below.
- Updated TASKS/SOURCES and feed-depth implementation notes, including existing summary-first assertions to replace with direct precedence checks before noon. NEEDS_FROM_HUMAN/handbook unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build` and `git diff --check` pass: 977 unit/293 integration tests, four expected skips; existing build chunk warnings.
- Production parser/services unchanged; no restart needed for fixture/test/docs-only changes. Next: pre-noon content precedence, then scheduled all-topic AI/event-diversity acceptance and private public-mode activation.

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
- API/worker restart and health/reader confirmation follow commit/push; no paid calls or production edition writes.
- Next: pre-noon feed precedence fix, Nov 14 scheduled all-topic editing/diversity and NBA/item 58/private public activation. Evening generation cutoff retained; no paid calls.
