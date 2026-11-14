# Progress

Older entries: [through iteration 2267](docs/progress-archive/2026-11-14-through-2267.md).

## 2026-11-14: iteration 2268 — distinguish URL-only pool text

- Clean main; no inherited work. Alerts zero; health database/Redis pass; all 38 sources healthy; jobs check passes with normal 15:00 digest queued.
- Protected deployment/generation hold retained. NBA/item 58/private public-mode activation still await scheduled acceptance.
- Corrected preflight's misleading reporting label: nonempty includes two URL-only HN excerpts and the known legacy HUD headline. Reader already links original titles; no reader change needed.
- Read-only pool capture now labels empty/URLs-only/other text and reports eligible counts. This changes no production selection, admission or stored content.
- Actual 13:40 UTC Tech capture: 200 eligible, 175 empty, two URL-only, 23 other text; other text is explicitly not verified reporting. All five topic counts recorded in today's edition review; private receipt `/tmp/2268-pool.json` mode 600.
- Three targeted tests pass, including recorded HN excerpts, prose/link controls and unchanged admission/candidate fields. Initial test used an incomplete policy fixture; corrected to the required include/exclude arrays.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` pass (typecheck/lint/format/boundaries; 1,011 unit, 327 integration tests, four expected skips). Private receipt assertions pass for topic labels, exact HN IDs and mode 600. Tool/test/docs-only: no build/restart during hold; deployed app code unchanged.
- Next: 15:00 all-topic scheduled acceptance/diversity review; NBA/item 58 closure, fresh rollback baseline and private public-mode activation outside the hold. Address stale headline provenance after protected edition.

## 2026-11-14: iteration 2269 — metrics recovery observation

- Clean main; no inherited work. Alerts zero, health database/Redis pass, all 38 sources healthy; jobs check passes with normal 15:00 digest queued.
- Open metrics-store breakage: read-only natural-recovery sample at 13:51:07–13:51:39 finds 24 fresh healthy rules, four uncached queries ≤0.690 s, no new evaluation/admission/timeout/slow-query failures.
- Neither storage tier merged; process starts unchanged. Warning journal for system obs-metrics/obs-alerts since 09:20:17 has no entries. Comparable recovery remains unaccepted; retain 2% CPU-only trial and existing limits.
- Recorded actual evidence in capacity decision and TASKS; next passive probe no earlier than 14:52 UTC. No paid calls, forced merges, configuration/generation changes or deploy during protected hold.
- Verification: `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` and system warning journal pass; `pnpm format`/`pnpm lint:fix` pass; `pnpm check` passes typecheck/lint/format/boundaries, 1,011 unit and 327 integration tests, four expected skips.
- Documentation-only: deployed app code remains unchanged, so no rebuild/restart during 13:00–16:00 hold.
- Next: 15:00 all-topic scheduled acceptance/diversity review, NBA/item 58 closure, then rollback refresh/private public-mode activation outside hold.

## 2026-11-14: iteration 2270 — correct Tech discovery baseline

- Clean main; no inherited work. Alerts zero; health database/Redis pass; source/job checks pass, with the normal 15:00 digest queued.
- Read-only stored Tech capture at 14:01:25 UTC: 643 observations/53 distinct posts, 50 safe candidates/46 authors, ten image and three video posts. All 50 supplied texts inspected; no clear named launch/demo description.
- Found a comparison error: current collector fallback resolves to `AI`, while iteration 2177 explicitly probed `artificial intelligence`. Corrected review; historical observation queries are not stored, so no historical query change inferred.
- Video captions are outage speculation/interview and ambiguous “AI gem”; attachments and up to 8,679 likes do not establish demos or accurate reporting. Future comparisons must include the actual baseline; no query/cap changes.
- Private mode-600 receipt `/tmp/2270-bluesky-pool.json`; assertions pass for unique URLs, media counts and all three video ranks/authors. Temporary expanded report removed; no searches, model/media calls or database writes.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` pass (typecheck/lint/format/boundaries; 1,011 unit and 327 integration tests, four expected skips). Archived iterations 2260–2261 to keep this file bounded.
- Documentation-only; deployed app unchanged and 13:00–16:00 hold preserved, with no rebuild/restart.
- Next: 15:00 scheduled all-topic acceptance/diversity review, NBA/item 58 closure, then rollback refresh/private public-mode activation outside hold.

## 2026-11-14: iteration 2271 — durable HUD provenance reproducer

- Clean main; no inherited work. Alerts zero; health database/Redis pass; all 38 sources healthy and jobs check passes, with normal 15:00 digest queued.
- Reader weakness remains the known changed-headline HUD excerpt counted as reporting. Recorded one actual Nov 14 Google feed item and four stored candidate fields in durable fixtures; no new source/provider requests.
- Isolated repository test now composes feed parsing, repeated persistence and production evidence filtering: blank recollection retains the old headline and exact-title suppression misses it. This explicitly characterizes a known defect, not desired behavior or acceptance.
- Synthetic reporting-preservation control replaces the old excerpt with prose and repeats blank recollection; future repair must preserve that prose. Original older feed body/title unknown; fixture seeds current storage, not invented observation history.
- Production repair stays after the protected edition; no generation/runtime/database changes, paid calls, rebuild or restart during 13:00–16:00 hold. Test runner builds API only for isolated tests; deployed app remains unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 1,011 unit and 328 integration passes, four expected skips. New recorded HUD persistence case passes; API rebuilt inside isolated test runner.
- Next: 15:00 all-topic scheduled acceptance/diversity review, NBA/item 58 closure, then rollback refresh/private public-mode activation outside hold. Fix HUD provenance after edition protection.

## 2026-11-14: iteration 2272 — configured Bluesky probe baselines

- Clean main; no inherited work. Initial alert snapshot has zero firing/pending alerts; no repeated service/edition probes.
- Fixed discovery probe's first query per topic to resolve current metadata with collector precedence and bounds; exports label configured baselines. Explicit alternatives unchanged; hourly World rotation is not claimed.
- Four free Tech searches share 14:22:42.383 UTC cutoff: AI 48/47/3 fetched/safe/videos, Claude 50/50/2, Gemini 49/48/1, AI demo 44/24/3. Baseline outage captions and alternatives' unrelated/promotional material do not justify a production query change.
- Private mode-600 receipt `/tmp/bluesky-tech-2272.jsonl`; result assertions pass for exact queries/baseline labels, common window, bounded counts, zero writes and false semantic/publication flags. Transport records filtered explicitly.
- `--tech --store` is rejected before credentials/network. No inference/media calls, production query/configuration changes, database writes or deployment.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 1,011 unit and 328 integration tests, four expected skips. Archived iterations 2262–2263 to keep this file bounded.
- Probe/docs-only change; deployed app unchanged, no rebuild/restart during 13:00–16:00 hold. Isolated integration runner builds API without restarting live services.
- Next: 15:00 all-topic scheduled acceptance/diversity review, NBA/item 58 closure, then rollback refresh/private public-mode activation outside hold; HUD provenance repair after edition protection.

## 2026-11-14: iteration 2273 — scheduled publication provenance gate

- Clean main; no inherited work. Initial alerts zero; no repeated service/source probes or generation calls.
- Read-only scheduled reader gate now requires saved scheduled kind, nonblank/non-integration key and valid publication time before reader/editorial acceptance. Manual publication can no longer establish a normal scheduled edition.
- Added offline refusal controls for manual/test kinds, missing/blank/integration keys and missing/invalid publication times; existing editorial requirements remain intact.
- Live read-only Nov 13 check returns scheduled provenance for `f901ba6c-cba3-4116-8539-fd0e92b98ec4` and correctly exits 1 for non-AI NBA. Nov 14 returns pending/exit 2; no acceptance claimed.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: typecheck/lint/format/boundaries, 1,012 unit and 328 integration tests, four expected skips. Initial query-overload/import lint issues corrected before final verification.
- Tool/tests/plan only; no inference, production database writes, runtime configuration or restart. API rebuilt only inside isolated test runner. Protected 13:00–16:00 deployment hold preserved; deployed app unchanged.
- Next: 15:00 all-topic scheduled acceptance/diversity review, NBA/item 58 closure, then rollback refresh/private public-mode activation outside hold; HUD provenance repair after edition protection.

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
