# Progress

Older entries: [through iteration 2288](docs/progress-archive/2026-11-14-through-2288.md), [2289–2294](docs/progress-archive/2026-11-14-2289-through-2294.md), [2295–2298](docs/progress-archive/2026-11-14-2295-through-2298.md).

## 2026-11-14: iteration 2299 — NBA selected-story social comparison

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero active alerts. Natural Gaming/ownership recovery still gates item 58/private public-mode activation.
- Owner-visible benefit: address Nov 14 NBA's Murray story/post repetition at its missing-input cause. NBA now receives bounded selected-story context in X/Reddit and Bluesky final editing after scheduled NBA AI acceptance.
- Shared projection limits ten titles/summaries to 300/400 characters; Tech context remains supported, story-evidence enrichment remains Tech-only, other topics retain their rollout. No keyword filter, cap change, extra call or saved-edition mutation.
- Synthetic Sonnet/Haiku transport preserves distinct follow-ups; orchestration retains empty AI selections, context-free behavior and original post text. Bounds/topic-isolation controls pass. Natural semantic selection remains unverified; review next scheduled NBA picks.
- Updated TASKS, Nov 14 review and affected social handbook prose; no source/schema/UI change. SOURCES/screenshots unchanged.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass: 1,025 unit/329 integration tests, four expected skips. Targeted editor/context/orchestration tests: 37 pass. `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle warnings; handbook check passes; `git diff --check` clean.
- API/worker restarted; `pnpm obs health --check` healthy/database/Redis true, `pnpm obs sources --check` 38/38 healthy. `check-scheduled-reader.ts 2026-11-14T15:00:00Z` verifies scheduled provenance/five topics/14 stories/19 posts. Private logs `/tmp/2299-*`.
- No verification inference, source requests or production writes. Next: natural scheduled Gaming/ownership recovery before activation; review NBA story/post distinctions and retain broader social-quality challenges.

## 2026-11-14: iteration 2300 — compact current task handoff

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero active alerts. Natural Gaming/ownership recovery still gates item 58/private public-mode activation.
- TASKS.md had grown to 36,435 bytes, obscuring current acceptance work and exceeding the ~8 KB standing target. Reduced it below 8 KB; next scheduled acceptance and deployed fixes now lead the handoff.
- Preserved all 23 open items in order, with current concise status and individual links to a complete historical snapshot in `docs/progress-archive/2026-11-14-task-detail-2300.md`. No task closed or priority changed.
- Offline integrity check compares all 23 original open paragraphs against the archive, verifies every local linked file and all 23 anchors, and enforces the size target. No product, source, UI, schema, budget or runtime behavior changes; handbook/SOURCES/screenshots unchanged.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass: 1,025 unit/329 integration tests, four expected skips. `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle warnings; `git diff --check` clean. Private receipts `/tmp/2300-*`.
- `pnpm obs sources --check`: 38/38 healthy. `check-scheduled-reader.ts 2026-11-14T15:00:00Z`: scheduled provenance/five topics/14 stories/19 posts verified. No inference, source requests or production writes.
- Next: natural scheduled Gaming/ownership recovery before activation, plus NBA story/post distinction review. Public mode remains off and sharing private.

## 2026-11-14: iteration 2301 — clarify live NBA source coverage

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero active alerts; health/database/Redis healthy and 38 sources healthy.
- Owner benefit: the handoff no longer misidentifies an active NBA feed as disabled, avoiding redundant activation or incorrect coverage decisions.
- TASKS conflated Yardbarker RSS with its disabled article-page X harvesting. Migrations 053–055 and read-only live SELECT confirm RSS success at 20:16:53 UTC, 20 fetched items, 83 stored observations, null discovery host and no error.
- Corrected current TASKS and clarified SOURCES; historical task archive preserved. No runtime/source activation, provider calls, external collection requests or saved-edition writes.
- Natural Gaming/ownership recovery still gates item 58/public activation; NBA social-context acceptance awaits the next scheduled edition. Public mode off, sharing private.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,025 unit/329 integration tests, four expected skips); `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle warnings; `git diff --check` clean. Private receipts `/tmp/2301-*`.
- API/worker restarted; `pnpm obs health --check` healthy; `check-scheduled-reader.ts 2026-11-14T15:00:00Z` verifies scheduled provenance, five topics/14 stories/19 posts. No UI/schema/system-flow change; handbook/screenshots unchanged.

## 2026-11-14: iteration 2302 — require full-edition activation evidence

- Clean main; no inherited work. Initial alerts zero; health/database/Redis healthy.
- Found activation checklist still prescribed an NBA-only command despite known Gaming/World/U.S. failures. Updated readiness and activation record to use the existing explicit five-topic gate before activation and after its first public-mode scheduled edition.
- Explicit names retain missing-section refusal; saved AI provenance, complete triage, published selection and summary agreement remain required. No checker variant or runtime/generation change.
- Read-only live gate for Nov 14 returns exit 1/editorial-refused: Tech/NBA accepted, Gaming/World/U.S. refused. Latest/direct/history agree on five topics/14 stories/19 posts. Public mode remains off, sharing private; no provider calls or publication writes.
- Verification: nine targeted gate tests pass; `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,025 unit/329 integration tests, four expected skips). `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle warning; `git diff --check` clean.
- API/worker restarted; first immediate health probe preceded startup, retry healthy/database/Redis true; 38/38 sources healthy. Archived 2289–2294 verbatim to keep PROGRESS below 25 KB; integrity comparison passes. Private receipts `/tmp/2302-*`.
- No source/schema/UI/system-flow change; SOURCES, handbook and screenshots unchanged. Next: natural scheduled Gaming/ownership recovery, then activation in runbook order; NBA social breadth review remains open.

## 2026-11-14: iteration 2303 — preserve linked-report attribution when saving

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero active alerts. Known Gaming/ownership recovery remains scheduled-only; public mode off, sharing private.
- Owner benefit: saved grouped stories no longer attribute one linked report to every source in the cluster. Today's Nvidia stock-sale link previously saved Google News/Hacker News/The Verge; now it saves its actual per-report Hacker News provenance.
- Save uses the matching coverage URL's publisher or source labels, falling back to the story only when that report is absent. Existing saved copies are unchanged; resaving captures corrected attribution. No edition-generation, source, budget or provider changes.
- Browser check `pnpm exec tsx scripts/smoke-reader-saved-source.ts` passes real saved Nvidia provenance plus explicitly synthetic publisher-precedence/legacy controls, preserved links, reload and no overflow/errors in desktop/mobile light/dark. Four screenshots retained under `docs/screenshots/ui/reader-saved-source-*`; mobile light visually checked.
- `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle warning. Initial lint caught a component/helper export; moved the helper to a utility before final verification.
- Final `pnpm format`, `pnpm lint:fix`, targeted Prettier and full `pnpm check` pass: 1,025 unit tests, 329 integration passes/four expected skips. Corrected a browser-script formatting conflict before the successful full run; `git diff --check` clean.
- API/worker restarted; startup health retry healthy/database/Redis true. `pnpm obs sources --check`: 38/38 healthy. `check-scheduled-reader.ts 2026-11-14T15:00:00Z`: scheduled provenance/latest/direct/history agree on five topics/14 stories/19 posts. Receipts `/tmp/2303-*`.
- No schema/system-flow/source change; handbook/SOURCES unchanged. Next: scheduled Gaming/ownership acceptance before activation, NBA social breadth review. Continue Current order while those await evidence.

## 2026-11-14: iteration 2304 — reconcile activation handoff with full-edition gate

- Clean main; no inherited work. Initial `pnpm obs alerts` zero; health/database/Redis healthy; `pnpm obs sources --check` confirms 38/38 sources healthy.
- Owner benefit: the top-level public plan no longer suggests NBA-only success permits activation while Gaming/World/U.S. remain broken.
- Reconciled current plan handoff and readiness introduction/checklist with the existing explicit five-topic gate, before activation and after its first public-mode scheduled edition. Historical plan sections retained.
- Nov 14 NBA recovery remains accepted; Gaming fallback and World/U.S. ownership recovery still await a natural scheduled edition. Public mode off, VM private; no provider calls or generation/configuration changes.
- Verification: static link/topic/repeated-gate agreement check passes; `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,025 unit/329 integration passes, four expected skips); targeted Prettier and `git diff --check` pass.
- `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle warning. API/worker restarted; `pnpm obs health --check` healthy/database/Redis true. Receipts `/tmp/2304-*`.
- No UI/source/schema/system-flow change; screenshots, SOURCES and handbook unchanged. Next: natural Gaming/ownership acceptance, then activation in runbook order; NBA social breadth review pending.

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
