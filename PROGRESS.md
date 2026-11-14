# Progress

Older entries: [through iteration 2288](docs/progress-archive/2026-11-14-through-2288.md), [2289–2294](docs/progress-archive/2026-11-14-2289-through-2294.md), [2295–2298](docs/progress-archive/2026-11-14-2295-through-2298.md).

Archived continuation: [2299–2304](docs/progress-archive/2026-11-14-2299-through-2304.md).

## 2026-11-14: iteration 2305 — due natural metrics recovery sample

- Clean main; no inherited work. Initial alerts zero; app/database/Redis healthy, 38/38 sources healthy. Public mode remains off, sharing private; scheduled Gaming/ownership acceptance still pending.
- Owner benefit: retained evidence-based capacity limits rather than declaring metrics recovered from a small compaction. Due passive sample follows the Nov 14 13:51 observation; no new monitoring feature or capacity change.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` at 21:08:39–21:09:10: 24 healthy fresh rules, four uncached queries ≤1.368 s; no new evaluator errors/missed iterations, admission-limit hits, queue timeouts or slow queries. Both process starts unchanged.
- One natural small merge processed 14,631 rows, no big merge; below the five-million-row acceptance threshold. Recovery stays open. Warning journal since 13:51 has two app scrape refusals; user journals confirm matching API/worker restarts at 19:22/20:29, with no metrics/evaluator restart.
- Updated TASKS and capacity decision evidence; no source/schema/UI/system-flow change, so SOURCES, handbook and screenshots unchanged. No provider calls, generation changes or forced merges.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,025 unit/329 integration passes, four expected skips); `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle warning; targeted Prettier and `git diff --check` pass. API/worker restarted; `pnpm obs health --check` healthy/database/Redis true. Receipts `/tmp/2305-*`.
- Next: natural scheduled five-topic acceptance before activation; NBA social breadth review remains pending. Metrics next passive sample no earlier than Nov 14 22:10 UTC.

## 2026-11-14: iteration 2306 — scope official media on saved X cards

- Clean main; no inherited work. Initial alerts zero; app/database/Redis healthy and 38/38 sources healthy. Natural Gaming/World/U.S. acceptance remains pending; public mode off, sharing private.
- Reader gap: today's Giannis/Bam X post carries a media link, but Saved retains linked text/context without the official embed. Owner would notice losing the media when returning to a saved post.
- Added a bounded owner-review proposal to docs/ideas.md: reuse official embed behavior with text/original/edition fallbacks, compatible bookmarks, no new collection/model spend. No feature implementation or generation/configuration change.
- Discarded this iteration's proposed escaped-newline display helper and browser script: character-level inspection proved the saved posts already contain actual newlines. Initial format encountered the removed temporary script; final clean formatting rerun succeeds. No inherited work discarded.
- Evidence: GET latest edition plus static bookmark/renderer assertions confirm the real NBA media link and text-only Saved rendering. No third-party requests or provider calls. No UI/source/schema/system-flow changes; screenshots, SOURCES and handbook unchanged.
- Verification: final `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,025 unit/329 integration passes, four expected skips); clean-source `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle warning. Targeted Prettier and `git diff --check` pass. API/worker restart healthy/database/Redis true. Receipts `/tmp/2306-*`.
- Next: natural scheduled five-topic acceptance before activation, then existing Current order; saved-media proposal waits on owner approval.

## 2026-11-14: iteration 2307 — retain independent discovery-linked coverage

- Clean main; no inherited work. Initial alerts zero; health/database/Redis healthy; all 38 sources healthy. Public mode off, VM private; scheduled Gaming/World/U.S. acceptance still pending.
- Reader benefit (items 42/43): grouped Tech coverage no longer hides independent sites merely because Hacker News discovered them. No generation, source, budget or provider changes.
- Actual saved NVIDIA transition story `3020ff24-fcbc-489b-8fd1-3e10be2bec00` has 23 reports: previous source-list algorithm counted 13 sites/outlets instead of 18. Saved AI Frontiers story `fb27faa4-5cea-427e-9df9-e1e64f89cc00` collapsed two sites to one.
- Cause/fix: source-name lookup reassigned later reports to the first matching feed URL. Use each report's own URL; distinguish repeated discovery labels by linked hostname, retaining “via Hacker News”. Primary-first deduplication and expanded report links remain.
- Extended existing coverage browser smoke to accept historical edition/story IDs and assert collapsed primary URLs as well as exact counts and every expanded report link. Both saved cases plus latest mixed-publisher control pass desktop/mobile light/dark; external traffic blocked, GET-only. Screenshots updated.
- Verification: `pnpm format`, `pnpm lint:fix`, standalone `pnpm check` pass (1,025 unit/329 integration passes, four expected skips); `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle warning; all three coverage smokes and `git diff --check` pass. First combined validation shell exited 143 during unit tests without an assertion failure; complete standalone rerun passed. No schema/system-flow change; SOURCES and handbook unchanged.
- Next: natural scheduled all-topic AI acceptance before activation; pending NBA social breadth and Tech depth evidence retained. Receipts `/tmp/2307-*`.

## 2026-11-14: iteration 2308 — identify discovery-linked report sites

- Clean main; no inherited work. Initial alerts zero; health/database/Redis healthy. Scheduled Gaming/World/U.S. acceptance remains pending; public mode off, sharing private.
- Owner benefit (items 42/43): today's Meta fine story links to Reuters but called its source only “via Hacker News”; readers now see “reuters.com · via Hacker News” without opening the link.
- Centralized discovery-label rendering in SourceLink, so single-source stories and expanded report attribution identify their linked hostname just as grouped collapsed sources do. Publisher labels and report destinations remain intact; no generation/source/provider/budget change.
- Extended existing browser smoke using real saved discovery-only stories and per-report provenance. All 14 coverage controls, exact labels/destinations, keyboard expansion/focus, 44px targets and layout pass desktop/mobile light/dark; mixed-publisher count regression passes. External requests blocked, GET-only.
- Updated screenshots; inspected mobile light capture of Reuters collapsed/expanded attribution. No schema/system-flow change; SOURCES and handbook unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,025 unit/329 integration passes, four expected skips); `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle warning. Initial browser smoke raced the build and correctly saw old served assets; post-build API/worker restart and both smokes pass.
- Post-restart `pnpm obs health --check` healthy/database/Redis true; source check passes. Receipts `/tmp/2308-*`. Next: natural scheduled full-edition AI acceptance before activation; existing NBA breadth/Tech depth evidence remains pending.

## 2026-11-14: iteration 2309 — retain linked sites when saving stories

- Clean main; no inherited work. Initial alerts zero; health/database/Redis healthy; source check passes. Public mode remains off, VM private; Gaming/World/U.S. scheduled acceptance still pending.
- Reader weakness (items 42/43): saving today's Reuters-linked Meta story retained only “Hacker News”, losing the linked site visible in the edition. New saved discovery-only attribution now includes hostname and discovery feed; explicit publisher names still win and grouped stories still use primary-report provenance.
- Extended existing saved-source Playwright smoke with the real Reuters story, grouped primary report, explicit synthetic publisher/legacy controls, exact attribution/destinations and reload persistence. Desktop/mobile light/dark pass; updated screenshots and inspected mobile light. External browser traffic blocked; GET-only.
- `pnpm format`, `pnpm lint:fix`, `VITE_PUBLIC_MODE=0 pnpm build` pass (existing bundle warning); full `pnpm check` passes (1,025 unit/329 integration passes, four expected skips). Browser smoke passes; `git diff --check` clean.
- API/worker restarted; `pnpm obs health --check` healthy/database/Redis true. `check-scheduled-reader.ts 2026-11-14T15:00:00Z` confirms scheduled provenance and five topics/14 stories/19 posts. No model calls or edition mutation.
- Archived progress 2295–2298 to keep the active handoff below 25 KB. No source/schema/system-flow change; SOURCES and handbook unchanged. Existing bookmark snapshots are retained; improved attribution applies when saving a story.
- Receipts `/tmp/2309-*`. Next: natural scheduled five-topic AI acceptance before activation; retain NBA breadth/Tech depth evidence gates.

## 2026-11-14: iteration 2310 — identify sites in older saved stories

- Clean main; no inherited work. Initial alerts zero and health/database/Redis healthy. Public mode off; normal five-topic scheduled acceptance remains pending.
- Reader weakness: pre-2309 saved discovery stories show only Hacker News, hiding the linked site. Saved cards now derive the site from their retained URL for bare discovery-feed attribution, preserving snapshots and timestamps. Publisher and social attribution stay intact.
- Extended existing saved-source browser smoke to reproduce older snapshots, verify linked-site display after reload and assert storage remains byte-for-byte unchanged. Real edition story plus synthetic publisher/legacy controls; external traffic blocked, GET-only.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,025 unit/329 integration passes, four expected skips); private web build passes with existing bundle warning. Initial lint rejected a smoke-script type assertion; corrected with explicit generic before successful full rerun.
- Saved-source Playwright passes desktop/mobile light/dark, including exact legacy labels, URLs, reload and unchanged storage; screenshots refreshed (same visual output), mobile light inspected. API/worker restarted; health/database/Redis healthy and source check passes. `git diff --check` clean.
- No generation, source, schema, provider or budget changes; SOURCES and handbook unchanged. Receipts `/tmp/2310-*`. Next: normal five-topic scheduled acceptance before public activation.

## 2026-11-14: iteration 2311 — outstanding metrics recovery sample

- Clean main; no inherited work. Initial `pnpm obs alerts` reports zero alerts. Public mode remains off and scheduled five-topic acceptance remains pending.
- Investigated expanded coverage ordering; saved editions already put the primary report first. Deliberately discarded the speculative UI/test change rather than ship a guard for an unobserved failure. No screenshots or app behavior changed.
- Outstanding metrics recovery: `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` at 22:22:42–22:23:13 UTC finds 24 healthy rules, uncached queries ≤1.119 s, no new evaluator errors/missed iterations, admission hits, queue timeouts or slow queries; process starts unchanged and neither tier merged.
- Warning-level system metrics/alerts journal since 21:08:39 UTC has no entries. Second comparable natural merge remains unobserved; retain CPU-only 2% trial. Next passive probe no earlier than 23:24 UTC; no forced merge or capacity tuning.
- Receipt `/tmp/2311-metrics.jsonl`. No source/schema/system-flow change; SOURCES and handbook unchanged. No paid calls, generation changes or runtime configuration changes.
- Verification: `pnpm format`, `pnpm lint:fix` and full `pnpm check` pass (1,025 unit/329 integration passes, four expected skips). Private build checked separately; no application changes retained, so no service restart needed. Next: normal scheduled five-topic acceptance and due passive recovery evidence.

## 2026-11-14: iteration 2312 — compare semantic Tech admission

- Clean main; no inherited work. Initial alerts zero; health/database/Redis healthy and source check passes. Public mode remains off, VM private; scheduled five-topic acceptance pending. Metrics probe not due before 23:24 UTC.
- Reader weakness (items 42/59): three Tech summaries have headline-only evidence. Owner-visible value: avoid replacing that weakness with a ranking change that loses important published stories.
- Extended the existing offline admission evaluator to compare importance-first and relevance-first saved semantic scores across Nov 12 ungrouped/reviewed groups and Nov 14 recorded groups; neither uses reporting labels for selection. Pair scores belong to one member; existing groups, evidence, ten slots and tie ordering retained.
- Importance-first admits Wallet/retains four Nov 14 stories, but loses published smartglasses and reduces reporting in Nov 12 grouped control. Relevance-first loses Meta/Nvidia on Nov 14. Recorded counts pinned; no production admission change justified. Updated depth study and TASKS.
- `pnpm format`, `pnpm lint:fix`, offline evaluator and private build pass (existing bundle warning); full `pnpm check` passes (1,025 unit/329 integration passes, four expected skips). API/worker restarted; initial health request raced startup, retry healthy/database/Redis true. `git diff --check` clean.
- No source/schema/system-flow/UI changes; SOURCES, handbook and screenshots unchanged. Trimmed old TASKS done markers (history remains in PROGRESS/archive) to 8 KB. No provider calls, edition writes or runtime configuration changes. Receipts `/tmp/2312-*`.

## 2026-11-14: iteration 2313 — close recorded Tech admission study

- Clean main; no inherited work. Initial alerts zero; health/database/Redis healthy and source check passes. Public mode off; next normal five-topic scheduled acceptance still required.
- Read the current saved Tech summaries and coverage: three headline-only summaries remain the reader weakness. Existing evidence already identifies missing supplied prose and a Wallet admission loss; further variants on the same recordings would not establish a safe production fix.
- Consolidated the completed study's decision at the top of the depth review, corrected superseded next-step wording, and updated TASKS. Next daily review separates missing prose, admission loss and editor use of supplied reporting using natural grouped artifacts; later reconstructions must stay labelled. Production admission unchanged.
- Verification: recorded evaluator passes with productionChanged=false; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips) and `pnpm build` pass with existing bundle warnings. API/worker restarted; health/database/Redis healthy. `git diff --check` clean.
- No app/UI/source/schema/system-flow change, provider calls, edition writes or runtime configuration changes. SOURCES, handbook and screenshots unchanged. Receipts `/tmp/2313-*`. Metrics probe remains not due before 23:24 UTC.

## 2026-11-14: iteration 2314 — next-edition supply baseline

- Clean main; no inherited work. Initial alerts zero; health/database/Redis healthy and all 38 sources healthy.
- Reader weakness remains missing World/U.S. stories and Gaming fallback; deployed recovery awaits natural acceptance. Owner benefit: the next review now distinguishes available supply from another ownership/editor failure instead of repeating completed diagnosis.
- Captured the next scheduled window read-only at 22:55 UTC: Tech 40/40 eligible, NBA 23/20, Gaming 32/32, World 37/37, U.S. 15/15. Tech has only five nonempty excerpts, including a shopping roundup; no semantic reporting-quality claim. Early sample, not scheduled membership or recovery acceptance.
- Added Nov 15 review baseline and five-topic acceptance checklist; replaced stale Nov 14 repair instructions with deployed status and the remaining natural gate. Archived PROGRESS 2299–2304 after crossing 25 KB, preserving all entries.
- Verification: `capture-triage-pool.ts` succeeds; review/handoff links resolve; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips) and `pnpm build` pass with existing bundle warnings. `git diff --check` clean. Private receipts `/tmp/2314-*`.
- API/worker restarted and active; `/healthz` confirms database/Redis healthy. No app/UI/source/schema/system-flow changes, provider calls, edition writes or runtime settings changed. SOURCES, handbook and screenshots unchanged. Public mode remains off; metrics probe not due before 23:24 UTC.

## 2026-11-14: iteration 2315 — repair saved-reader browser verification

- Clean main; no inherited work. Alerts zero; health/database/Redis healthy and source check passes. Scheduled Gaming/World/U.S. recovery still awaits Nov 15; public mode remains off and VM private.
- Reader weakness: linked-site attribution shipped, but the broad saved-reader layout smoke still expected feed-only labels and could not verify the current edition. Owner benefit: outlet identity, report links and navigation are again checked together across desktop/mobile light/dark.
- Reproduced stale `via Hacker News` expectation against real saved Reuters coverage; updated collapsed/expanded attribution and URL/favicon assertions to use each report's own destination, without attributing aggregate feeds to the primary report.
- Fixed the smoke's second stale expectation (`1d ago`): day-old reports show their publication date. No reader behavior or saved content changed. Full GET-only browser smoke passes in all four views, including coverage/deep links, contents tracking, time updates and overflow; external requests blocked.
- Refreshed four reader-layout screenshots and inspected desktop/mobile output. Discarded other incidental smoke screenshots deliberately. Trimmed old TASKS done markers; history remains in PROGRESS.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` and `pnpm build` pass (1,025 unit/329 integration passes, four expected skips; existing bundle warning). First combined verification process terminated with exit 143 during unit tests, no assertion failure; standalone full rerun passes. `git diff --check` clean.
- API/worker restarted and active; health retry confirms database/Redis healthy after startup. No app/source/schema/system-flow change, provider calls, edition writes or runtime setting changes; SOURCES/handbook unchanged. Receipts `/tmp/2315-*`. Next: normal five-topic scheduled acceptance; passive metrics probe no earlier than 23:24 UTC.

## 2026-11-14: iteration 2316 — restore saved Bluesky link verification

- Clean main; no inherited work. Alerts zero and health/database/Redis healthy. Gaming/World/U.S. scheduled recovery remains pending; public mode off, VM private.
- Reader concern: source-link verification failed on the current edition because the first Bluesky post has no inline URL. Owner benefit: real linked reporting is again checked with original-post navigation, focus and mobile layout.
- Reproduced `Saved post exercises inline source links`; select a saved post containing a source URL, locate its actual card, and compare rendered `displayText` with raw-text fallback. Sky News' saved display text correctly expands its short URL; discarded the initial unnecessary bare-link UI change after checking this. Reader behavior/content unchanged.
- GET-only smoke passes desktop/mobile light/dark against real saved reporting; four refreshed screenshots inspected. Post-byline smoke also passes six views; discarded incidental byline/clipped-link screenshot changes deliberately. No external requests/provider calls or edition writes.
- Due 23:24:15–23:24:46 passive metrics sample: 24 healthy rules, zero new evaluator errors/misses, one small 28,120-row merge, no big merge; uncached probes ≤0.487 s. Second comparable natural merge remains unobserved. Next probe no earlier than Nov 15 00:25 UTC.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm build`, final Bluesky browser smoke and full `pnpm check` pass (1,025 unit/329 integration passes, four expected skips; existing bundle warnings). Initial combined format and direct check processes exited 143 without assertion failures; standalone format and background user-unit full rerun pass. All 38 sources healthy; `git diff --check` clean.
- No app/source/schema/system-flow change, provider calls, edition writes or runtime settings changed; SOURCES and handbook unchanged. Final build restores unchanged reader code. Receipts `/tmp/2316-*`; next work is normal five-topic scheduled acceptance, with public mode still off.

## 2026-11-14: iteration 2317 — explain World X breadth before tuning

- Clean main; no inherited work. Initial alerts zero; health/database/Redis healthy. Public mode remains off, VM private; scheduled Gaming/World/U.S. recovery still pending.
- Reader weakness: World's two X picks are political claims with no independent reporting in saved text. Owner benefit: next acceptance can distinguish missing alternatives from an editor/ranking failure rather than changing the wrong control.
- Saved preview shows 16 unique scored candidates, no unscored IDs, and only three passing relevance ≥6/interestingness ≥4. Two carry the same Putin quote; the editor explicitly keeps one. The other selected claim was already scored as unverified/hype-style.
- All three qualifying IDs have interestingness four; a threshold of five leaves zero. Three cannot overflow the ten-candidate shortlist. Recorded the cause/decision and linked a concrete Nov 15 supply/contribution comparison. No threshold, prompt, generation or runtime change justified.
- Contract-parsed preview/reader assertions pass for complete scores, gates, duplicate event labels, selected order and every public X field. Initial whole-object equality included private preview metadata; corrected projection passes. No actual reader mismatch. Temporary assertion script removed; receipt `/tmp/2317-world-x.json`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warnings only. `check-scheduled-reader.ts 2026-11-14T15:00:00Z` verifies five topics/14 stories/19 posts and scheduled provenance; `pnpm obs sources --check` passes for all 38 sources. Receipts `/tmp/2317-*`.
- API/worker restarted and active; post-restart `/healthz` confirms database/Redis healthy.
- No app/UI/source/schema/system-flow change, provider/source/media calls, edition or database writes. SOURCES, handbook and screenshots unchanged. Next: normal all-topic acceptance; metrics probe no earlier than Nov 15 00:25 UTC.
