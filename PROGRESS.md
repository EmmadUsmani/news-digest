# Progress

Older entries: [through iteration 2273](docs/progress-archive/2026-11-14-through-2273.md).

## 2026-11-14: iteration 2274 — bounded stored Bluesky examples

- Clean main; no inherited work. Alerts zero; health database/Redis pass; all 38 sources healthy. Digest queue has one worker, no failed runs, next edition 15:00 UTC. Deployed account boundary: 32 checks pass.
- Stored coverage report now accepts `--examples 1..50` (default 3), in either order with `--window-end`; both safe-post/video lists honor the bound and output records it. Removes the temporary-script edit needed in iteration 2267.
- Actual stored fixed-window reports at 13:27:44.705 UTC with limits 3/50/1 have identical counts and ranked prefixes. Full World output reproduces 525 observations/26 safe examples, including Lakenheath; no new relevance or editorial acceptance claimed.
- Eight invalid argument controls fail with no report output: zero, over-cap, fractional, missing, duplicate, unknown flag, invalid date and future cutoff. Private mode-600 receipts `/tmp/2274-bluesky-{3,50,1}.json`.
- No searches, inference, database writes, production configuration or restart. Protected deployment hold preserved; standalone reporting/docs change needs no runtime rebuild or restart.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 1,012 unit and 328 integration passes, four expected skips; isolated runner rebuilt API.
- Next: review 15:00 all-topic scheduled acceptance/event diversity and admissions; NBA/item 58 closure, then fresh rollback/private public-mode activation after 16:00. HUD provenance repair remains after edition protection.

## 2026-11-14: iteration 2275 — scheduled review and NBA recovery

- Clean main; no inherited work. Alerts zero. Nov 14 scheduled edition `b9d55088-892a-4e34-b77c-a398d64c6a9f` publishes 15:03:47.533 UTC, 227.528-second worker attempt: five topics/14 stories/19 posts.
- All-topic `check-scheduled-reader.ts` returns editorial-refused/exit 1: NBA and Tech accepted; Gaming/World/U.S. refused. Latest/direct/history and scheduled provenance agree. NBA five Sonnet summaries after repair close recurrence; STEERING 59 step 1 acked.
- All 19 candidate-triage calls succeed; prior inference-slot expiry absent. World/U.S. ownership invalid JSON (repair disabled) withholds both sections; Gaming exhausts Sonnet absence and Haiku JSON/schema validation. Item 58/activation stay open; no weak acceptance.
- Read `report-edition-timing.ts --scheduled-only --limit 1`, worker validation/ledger/settlement logs and saved story/post text. Anthropic 60 successful calls/$0.474821/zero holds; all 60 admissions accepted. Twenty immediate Sonnet admissions, no settlement recovery observed. xAI five successful daily calls/$0.326709.
- `/healthz` via `pnpm obs health --check` passes; `pnpm obs sources --check`: 38/38 healthy. Chromium verifies all 14 story titles/five sections at 1440/390 px, light/dark; `/tmp/2275-reader-*.png`. No UI changes.
- `pnpm check` passes: typecheck/lint/format/boundaries, 1,012 unit and 328 integration passes, four expected skips. Review/preflight evidence retained; archived progress 2264–2265 for size.
- `pnpm format` and `pnpm lint:fix` pass. Docs/status only; no new inference, production writes, flags, rebuild or restart. Protected deployment hold preserved; isolated integration runner rebuilt API without live restart.
- Next: stored World/U.S. ownership JSON/output-limit and Gaming validation diagnosis offline; normal full-edition acceptance before item 58/private public activation. No replay or cap changes.

## 2026-11-14: iteration 2276 — offline edition failure diagnosis

- Clean main; no inherited work. `pnpm obs alerts`: zero firing/pending. No repeated health/source/reader probes after the daily review.
- Worker journal 15:00–15:04 confirms joint ownership admitted and settled $0.002961, but hit exactly 4,096 output tokens (`max_tokens`) before invalid JSON. Raw ownership body was never retained; exact-body replay is unavailable.
- Four stored Gaming rejections diagnosed offline: unsupported PS5 price-cut claim; Pioner funding paraphrase rejected by lexical support; fenced AND truncated Haiku initial JSON; complete Haiku repair has five brief bullets (maximum four).
- `pnpm exec tsx -e` with production `assertAbsenceSupport` reproduces exactly one summary refusal per Sonnet response; strict assertions reject raw/unfenced Haiku initial JSON and confirm five repair bullets. No factual guard relaxed; clipped funding evidence remains qualified.
- Updated Nov 14 review and open breakage task with bounded next action: compact ownership identifiers, exact complete/exclusive mapping tests, unchanged output budget; then evidence-preserving Gaming recovery. Item 58/public activation remain open.
- No inference, production writes, flags, runtime rebuild or restart. Documentation/evidence only; protected deployment hold preserved and live app unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 1,012 unit and 328 integration passes, four expected skips. Isolated test runner rebuilt API; production unchanged.
- Next: implement and verify compact ownership representation offline, deploy outside hold, then resolve Gaming at its distinct failure boundaries; no new paid replay.

## 2026-11-14: iteration 2277 — compact joint ownership identifiers

- Clean main; no inherited work. `pnpm obs alerts`: zero firing/pending. Continued the diagnosed World/U.S. scheduled-edition breakage offline.
- Ownership v2 sends request-local topic/article aliases, including shared citations, and restores stored IDs only after strict complete/exclusive partition validation. Prompt version/purpose changed to separate old cached responses.
- Same model, 4,096 output tokens, 40 candidates and repair-disabled policy; no factual, topic-scope or budget guard relaxed. Normal grouping unchanged.
- `pnpm exec tsx --test apps/api/test/joint-story-grouping.test.ts apps/api/test/joint-story-shortlists.test.ts`: 24 pass. Forty 200-character IDs round-trip through <1,500-byte singleton JSON; citations, cross-topic reassignment and input immutability verified. Missing/duplicate/unknown/legacy membership refused.
- No inference, production writes, flags or service restart. At 15:20 UTC start the 13:00–16:00 deployment prohibition applies; deploy/rebuild/restart and health/reader verification remain explicitly pending after 16:00.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 1,015 unit and 328 integration passes, four expected skips; isolated runner rebuilt API. No live restart.
- Archived older progress through 2267 to keep the orientation file small. No system-flow/handbook change.
- Next: deploy this breakage fix outside hold; evidence-preserving Gaming recovery, then normal scheduled acceptance before item 58/public activation.

## 2026-11-14: iteration 2278 — Gaming brief-count recovery guidance

- Clean main; no inherited work. `pnpm obs alerts`: zero firing/pending. Protected 13:00–16:00 UTC deployment hold remains in effect.
- Extended the existing NBA brief-planning guidance to all topics after Gaming's stored Haiku repair exceeded four bullets. Five selected stories may have only four overview bullets; unrelated events must stay distinct.
- Non-NBA purpose now `shortlist-editor-v14-brief`; NBA instructions/namespace preserved. Strict four-bullet schema, absence guards, models, 4,000 output tokens and repair/budget limits unchanged.
- Synthetic Gaming regression exercises real budgeted validation/repair on Sonnet and Haiku fallback: rejects five bullets, accepts corrected four, retains all five stories. No future model compliance or scheduled acceptance claimed.
- Initial full check exposed two synthetic replay fixtures tied to the old prompt; updated purpose expectations and authored-response fingerprint offline. No provider re-recording.
- `pnpm exec tsx --test apps/api/test/editor.test.ts`: 37 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`: typecheck/lint/format/boundaries, 1,016 unit and 328 integration passes, four expected skips.
- No paid inference, production writes or live restart. Isolated integration checks rebuild API only. No UI/system-flow change; handbook/screenshots unchanged.
- Next: after 16:00 UTC rebuild/restart and verify pending ownership/brief guidance; evidence-preserving Gaming absence/truncation recovery, then normal scheduled acceptance before item 58/private public activation.

## 2026-11-14: iteration 2279 — Gaming repair controls and pending-fix deployment

- Clean main; no inherited work. `pnpm obs alerts`: zero firing/pending. Honored the 13:00–16:00 UTC deployment hold.
- Added synthetic Gaming regression through real budgeted validation/repair: unsupported PS5 price-cut absence and clipped Pioner funding paraphrase fail on Sonnet/Haiku; supported repair retains both stories, caches only corrected output, and invalid exhaustion returns no AI result.
- No prompt, factual guard, provider, model, token cap or budget changes; no paid inference or edition generation. Synthetic response compliance is not natural acceptance.
- `pnpm exec tsx --test apps/api/test/editor.test.ts`: 38 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`: typecheck/lint/format/boundaries, 1,017 unit and 328 integration passes, four expected skips.
- `VITE_PUBLIC_MODE=0 pnpm build` passes (existing bundle-size warning). API/worker restarted at 16:02:35 UTC, deploying pending ownership aliases and all-topic brief guidance; public mode stays off.
- `/healthz` returns ok/database/Redis true; local root 200. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-14T15:00:00Z` passes scheduled provenance/latest/direct/history: b9d55088-892a-4e34-b77c-a398d64c6a9f, five topics/14 stories/19 posts.
- `pnpm obs sources`: 38/38 ok, no empty last collections. HTTPS curl unavailable from VM: hostname resolves to VM 10.42.0.42 with no 443 listener; local HTTP checks pass. No sharing/DNS changes.
- Updated TASKS and Nov 14 evidence; no UI/system-flow/schema change, so no handbook/screenshots needed. Existing saved editorial failures remain; item 58/public activation open.
- Next: observe natural scheduled ownership/Gaming recovery; retain strict absence/truncation guards and no paid replay/cap changes.

## 2026-11-14: iteration 2280 — retain rejected ownership evidence

- Clean main; no inherited work. `pnpm obs alerts`: zero firing/pending.
- Reader weakness: missing World/U.S. stories; prior ownership output exhaustion could not be replayed because the rejected body was discarded. Extend the existing private rejection store to cross-topic ownership attempts so any recurrence preserves exact evidence.
- Existing 100-file/256-KiB/30-day limits and private permissions unchanged; no new logs, exports, retries, inference, model, prompt, budget or acceptance changes. Historical missing body remains unavailable.
- Synthetic malformed/truncated JSON and invalid-membership-shaped output verify one repair-disabled dispatch/settlement, exact private input/body retention and no invalid cache; successful ownership output stays cache-only.
- `pnpm exec tsx --test apps/api/test/llm.test.ts apps/api/test/rejected-editor-store.test.ts`: 51 pass. Handbook page updated; `pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline`: 18 pages/one diagram/39 tables pass; diagrams unchanged.
- `pnpm format`, `pnpm lint:fix` ran; first `pnpm check` caught formatting after a test edit, corrected with targeted Prettier. Full retry passes: typecheck/lint/format/boundaries, 1,018 unit and 328 integration passes, four expected skips.
- `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle-size warning; API/worker restarted healthy; `/healthz` ok/database/Redis true. Initial source check raced startup; retry passes all 38 sources. Saved scheduled reader check passes five topics/14 stories/19 posts with unchanged Nov 14 edition ID.
- Next: observe natural scheduled ownership/Gaming recovery before item 58/public activation; no paid replay or cap changes.

## 2026-11-14: iteration 2281 — preserve headline provenance during rediscovery

- Clean main; no inherited work. `pnpm obs alerts`: zero firing/pending. Scheduled ownership/Gaming acceptance still awaits the next natural edition.
- Reader weakness: Google News headline changes can leave old headline text looking like reporting. Blank rediscovery now clears exact stored headline/publisher descriptions before replacing their title; real reporting survives.
- Recorded HUD persistence case verifies known-title recovery while retaining its already-mismatched historical defect. Extended Google integration coverage preserves headline-plus-reporting through a subsequent blank observation. No fuzzy matching, cleanup or saved-edition changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: static checks and 1,018 unit tests pass; integration initially found one obsolete stored-headline assertion (327 pass/four skips), corrected to the new behavior. Targeted ESLint and `pnpm format:check` pass; integration retry passes 328 tests/four expected skips.
- `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle warnings. API/worker restarted; `/healthz` ok/database/Redis true; source retry passes 38/38 (initial check raced startup).
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-14T15:00:00Z` passes unchanged edition b9d55088-892a-4e34-b77c-a398d64c6a9f, five topics/14 stories/19 posts.
- No paid inference, generation, schema or UI change; handbook/screenshots unchanged. Public mode off; VM private.
- Next: natural scheduled ownership/Gaming recovery before item 58/public activation; already-mismatched legacy HUD text remains open.

## 2026-11-14: iteration 2282 — exclude URL-only reporting excerpts

- Clean main; no inherited work. `pnpm obs alerts`: zero firing/pending. Natural ownership/Gaming recovery still awaits the next scheduled edition.
- Candidate loading now clears excerpts consisting only of HTTP(S) URLs: two recorded HN FAA excerpts cannot supply source-only reader summaries. Titles remain available; mixed prose/links, raw stored observations and saved editions survive.
- Recorded excerpt tests cover single/multiple/clipped URLs, surrounding whitespace, both production fallback selectors and synthetic reporting-slot preservation. No fuzzy matching or unsupported HUD cleanup.
- `pnpm exec tsx --test apps/api/test/reporting-excerpt.test.ts`: two pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`: static checks, 1,019 unit and 328 integration passes, four expected skips.
- `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle-size warning. API/worker restarted; `/healthz` ok/database/Redis true; `pnpm obs sources`: 38/38 healthy.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-14T15:00:00Z` passes unchanged edition b9d55088-892a-4e34-b77c-a398d64c6a9f, five topics/14 stories/19 posts.
- Updated TASKS and Tech evidence. Bug fix changes no system flow/schema/UI; no handbook/screenshots needed. No paid inference or generation; public mode off, VM private.
- Next: natural scheduled ownership/Gaming acceptance before item 58/public activation. Already-mismatched HUD excerpt still needs safe provenance evidence.

## 2026-11-14: iteration 2283 — verify compact ownership through publication

- Clean main; no inherited work. `pnpm obs alerts`: zero firing/pending.
- Reader weakness: World/U.S. stories are missing after ownership output exhaustion. Owner-visible value: protect their recovery by checking deployed compact ownership through publication and the serialized reader projection, beyond isolated alias validation.
- Synthetic valid wire output traverses real BudgetedLlm/EventGrouping, restores persistent UUIDs and preserves exclusive story evidence, source text/URLs and edited summaries. Duplicate membership and truncated JSON withhold both sections with one dispatch/no repair; wire aliases never enter saved evidence.
- Transaction, triage, editor and ledger are test doubles; no database persistence/HTTP retrieval or natural model recovery claimed. Existing live snapshot unchanged. Updated database verification notes and TASKS; archived progress through 2273 to keep this file small.
- `pnpm exec tsx --test apps/api/test/editorial-publication.test.ts` with isolated-test flag, disabled localhost database URL and empty provider keys: 15 pass. First direct invocation correctly refused missing isolation; rerun uses only the mocked transaction, no live DB.
- `pnpm format`, `pnpm lint:fix` ran; full `pnpm check` passes typecheck/lint/format/boundaries, 1,019 unit and 329 integration tests, four expected skips.
- `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle warnings. API/worker restarted; `pnpm obs health --check` passes database/Redis, `pnpm obs sources --check`: 38/38 healthy.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-14T15:00:00Z` passes unchanged edition b9d55088-892a-4e34-b77c-a398d64c6a9f, five topics/14 stories/19 posts.
- Test/docs-only; no UI/schema/flow change, screenshots/handbook unchanged. No paid inference or generation; public mode off, VM private. Next: natural ownership/Gaming acceptance before item 58/public activation.

## 2026-11-14: iteration 2284 — trace Tech headline-depth summaries

- Clean main; no inherited work. `pnpm obs alerts`: zero firing/pending; initial health and all 38 sources healthy.
- Owner-visible weakness: three of four published Tech summaries repeat headlines. Saved immutable evidence has no excerpts for Meta, Claude Code and Ggml; Nvidia alone includes 600 characters of Verge reporting. HN metadata collection never fetches linked article bodies.
- Read-only current-input reconstruction uses 200 saved scores, forty qualified candidates and the saved five-group Tech result. Nine of ten editor clusters have empty evidence; qualified readable ChatGPT Wallet falls below twenty slots (isolated recency/engagement score 2.40).
- Current grouping fingerprint differs from the scheduled cache key: explicitly a counterfactual, not exact historical input/model replay. Only two of forty current qualified candidates contain prose. No prompt, rank, source, cap or generation change; bounded Wallet-admission evaluation recorded for a permitted generation window.
- Added `docs/edition-reviews/2026-11-14-tech-depth.md` and updated TASKS. No new source, system flow, schema or UI; SOURCES/handbook/screenshots unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 1,019 unit and 329 integration tests; four expected integration skips. `git diff --check` clean.
- `VITE_PUBLIC_MODE=0 pnpm build` passes with existing bundle warnings. API/worker restarted; initial reader request raced startup, retry passes unchanged scheduled edition b9d55088-892a-4e34-b77c-a398d64c6a9f (five topics/14 stories/19 posts). Health database/Redis true and 38/38 sources healthy.
- No paid inference or source requests; public mode off, VM private. Next: natural ownership/Gaming acceptance before item 58/public activation; evaluate readable Tech evidence retention without erasing important headline-only news.
