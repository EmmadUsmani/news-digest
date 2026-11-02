# Progress

Dated entries of 15 lines or fewer, newest last. Record what changed, how it
was verified (commands and results) and what's next. When this file passes
about 25 KB, keep about 20 entries and move older entries to `docs/progress-archive/`.

Earlier bootstrap and iterations 7–16: [archive](docs/progress-archive/2026-11-01-iterations-7-16.md).

Earlier iterations 17–22: [archive](docs/progress-archive/2026-11-01-iterations-17-22.md).

Earlier iterations 23–37: [archive](docs/progress-archive/2026-11-01-iterations-23-37.md).

Earlier iterations 51–60: [archive](docs/progress-archive/2026-11-01-iterations-51-60.md).

Earlier iterations 61–72: [archive](docs/progress-archive/2026-11-02-iterations-61-72.md).

Earlier iterations 87–100: [archive](docs/progress-archive/2026-11-02-iterations-87-100.md).
Earlier iterations 101–123: [archive](docs/progress-archive/2026-11-02-iterations-101-123.md).
Earlier iterations 124–132: [archive](docs/progress-archive/2026-11-02-iterations-124-132.md).

## 2026-11-02: iteration 133 — recover interrupted schedule verification

- Started clean on main; no leftover work. API/worker/health, 27 feeds and digest runs healthy; scheduled semantic edition remains due 20:40 UTC, not yet inspectable.
- Both schedule-changing smoke scripts now save an exclusive mode-600 recovery record before mutation, restore/verify on normal completion and SIGINT/SIGTERM, and refuse to overwrite unresolved recovery state.
- Added `scripts/recover-schedule.ts` for retained records after SIGKILL/VM interruption; failed restoration keeps the record. README documents recovery and concurrent-edit limitations. No live schedule probe or schedule edit performed.
- Isolated fake-HTTP/child-process regression verifies SIGTERM exit 143, exact original restoration, record removal and refusal of a second probe. No live DB or external inference used by test.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 141 isolated tests pass. Initial lint caught unawaited test registration; corrected and full check rerun. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: 1,144 stored URLs/four topics/27 healthy sources, repeated collection idempotent.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; refreshed status screenshots. No product UI changes.
- No publication, inference/discovery spend, provider/model/billing change or new owner blocker. Gaming/World social gaps and Reddit access remain; paid X scheduling stays off.
- Next: inspect 20:40 UTC scheduled semantic edition when due; continue free social coverage work in the meantime.

## 2026-11-02: iteration 134 — visible free social collection results

- Started clean on main; no leftover work. API/worker/health, 27 feeds and retained digest runs healthy; semantic edition remains due 20:40 UTC.
- Status now exposes up to 20 retained free social runs with validated river/page citation, embed-check and partial-error counters; historical incompatible results show counts unavailable. Separate digest run list and correct next-social-collection label.
- Counts explicitly include refreshes/repeated citations and do not imply new posts, editorial relevance or virality. Latest hourly pass: two rivers, eight pages, one page citation, ten successful embed checks, zero errors.
- Fixed operations telemetry's hardcoded Redis connection to honor the shared configured/test-isolated connection; isolated worker regression verifies valid counters, malformed-result rejection and payload stripping without touching live Redis.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 142 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued passes, 1,144 URLs/four topics/27 healthy sources; repeat idempotent.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed, new mobile social panel inspected. README/TASKS/docs/SOURCES updated.
- No publication, schedule mutation, inference/discovery spend, provider/model/billing change or new owner blocker. Paid X scheduling stays off; Gaming/World social gaps and Reddit block remain.
- Next: inspect scheduled 20:40 UTC semantic edition when due; continue relevant free social coverage.

## 2026-11-02: iteration 135 — Aftermath free Gaming citation feed

- Started clean on main; no leftover work. API/worker/health, current collection and digest runs healthy; two historical ingestion failures retained. First semantic edition remains due 20:40 UTC.
- Migration 032 connects Aftermath public RSS: 15 real articles, three distinct X citations, all three verified via official oEmbed. Reporting/interviews/opinion remain candidates; no page harvesting configured.
- All three cited posts precede upcoming daily window. Read-only `screen-social-posts.ts 2026-11-01T20:40:00Z 2026-11-02T20:40:00Z`: semantic pools 9/26/1/2, lexical selections 3/5/0/0; Gaming 21 scoped verified posts. No fresh-window or virality gain claimed.
- Public AUTOMATON English RSS probe: 30 articles, latest Oct 31, zero feed X links; not connected. Temporary probe removed; no bypass or paid calls.
- Two original Aftermath entries recorded for offline dates/excerpts/exact citations. Initial check caught citation assertion assigned to wrong entry; corrected. `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 143 isolated tests pass.
- `pnpm migrate`, `pnpm build` pass (existing upstream Zod warnings). Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued passes, 1,161 URLs/four topics/28 healthy sources; repeat idempotent.
- `pnpm exec tsx apps/api/scripts/verify-x-embeds.ts`: three successes/zero failures. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; refreshed screenshots and inspected mobile Aftermath card.
- TASKS/docs/SOURCES updated. No publication, schedule mutation, inference/discovery spend or provider/model/billing change. Anthropic $0.408415; X $0.023382; no new owner blocker.
- Next: inspect 20:40 UTC scheduled semantic edition when due. Gaming/World daily social gaps and Reddit block persist; keep paid X scheduling off.

## 2026-11-02: iteration 136 — truthful empty social selection status

- Started clean on main; no leftover work. API/worker/health, all 28 feeds and current collection/digest runs healthy; two historical ingestion failures retained. First semantic edition remains due 20:40 UTC.
- Fixed empty verified candidate pools being labeled AI-selected despite no model call: skip both social services and preserve non-AI/null-model provenance with an explicit no-candidates reason. Incomplete triage now explains its lexical fallback separately from unavailable editing.
- Regression uses throwing fake services to prove empty/zero-budget paths cannot invoke AI; verifies reasons and null model. Historical editions, prompts, model configuration and ranking are unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 144 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued live passes, 1,170 URLs/four topics/28 healthy sources; repeat idempotent.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; refreshed screenshots and inspected mobile status. README/TASKS updated; no source configuration change.
- No publication, schedule mutation, inference/discovery spend, provider/model/billing change or new owner blocker. Gaming/World social gaps and Reddit block remain; paid X scheduling stays off.
- Next: inspect 20:40 UTC scheduled semantic edition when due; continue relevant free social discovery.

## 2026-11-02: iteration 137 — preserve saved social post formatting

- Started clean on main; no leftover work. API/worker/health, 28 feeds and current digest/collection runs healthy; two historical ingestion failures retained. First semantic edition remains due 20:40 UTC.
- New immutable post selections include optional display-only plain text preserving visible URL labels and line breaks. React renders escaped text when widgets fail or in saved-text details; historical editions retain their existing fallback.
- Screening/editorial text, duplicate keys, prompts, models and historical snapshots unchanged. Unit regression covers URLs, blank lines, encoded markup, ambiguous paragraphs and bounds; isolated publication regression verifies frozen display text survives post refresh/retry.
- Free World probes: Kyiv Independent advertised feed 15 items/three accessible pages with no X citations; Independent World 44 items/no citations; Guardian politics adds only a citation already in World. None configured; no bypass or paid calls.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued live passes, 1,172 URLs/four topics/28 healthy sources; repeat idempotent. `verify-x-embeds.ts`: one success/zero failures, current Guardian World citation. `screen-social-posts.ts` upcoming window: semantic 9/26/1/2, fallback 3/5/0/0; incomplete window, not relevance/virality evidence.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 145 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `scripts/smoke-ui.ts`, `scripts/smoke-status.ts`, and `scripts/smoke-posts.ts /tmp/iteration137-posts.jsonl` pass desktop/mobile; post replay covers blocked/stubbed widgets and legacy snapshots. Initial style assertion raced widget replacement; restricted to stable blocked mode, rerun passed. Screenshots refreshed; mobile fallback inspected.
- README/TASKS/docs/SOURCES updated. No publication, schedule mutation, inference/discovery spend or provider/model/billing change; no new owner blocker.
- Next: inspect scheduled 20:40 UTC semantic edition. Gaming/World social gaps and Reddit access persist; keep paid X scheduling off.

## 2026-11-02: iteration 138 — recover unavailable X widgets

- Started clean on main; no leftover work. API/worker/health, 28 feeds and current digest/collection runs healthy; two historical ingestion failures retained. First semantic edition remains due 20:40 UTC.
- Failed official widget script/load or empty widget results now explain unavailable X media and offer an explicit retry. Removed failed script nodes; retry resets the shared loader and preserves saved text/original links. No automatic retries or edition changes.
- Extended read-only post replay to assert visible failure controls, one shared initial script, successful blocked-script recovery and preserved saved text on desktop/mobile. Widgets are protocol stubs, not evidence of live X media availability.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 145 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued live passes, 1,179 URLs/four topics/28 healthy sources; repeat idempotent. Upcoming-window screening still selects 3/5/0/0 lexical posts; no Gaming/World improvement claimed.
- Restarted API/worker; `/healthz` healthy. `scripts/smoke-ui.ts`, `scripts/smoke-status.ts`, `scripts/smoke-posts.ts /tmp/iteration138-posts.jsonl` pass desktop/mobile; screenshots refreshed, mobile failure card inspected.
- README/TASKS updated. No publication, schedule mutation, inference/discovery spend or provider/model/billing change; no source configuration change or new owner blocker.
- Next: inspect scheduled 20:40 UTC semantic edition. Gaming/World social gaps and Reddit access persist; keep paid X scheduling off.

## 2026-11-02: iteration 139 — Gematsu Gaming reporting

- Started clean on main; no leftover work. API/worker/health, current collection and digest runs healthy; two historical ingestion failures retained. Semantic edition remains due 20:40 UTC.
- Migration 033 connects Gematsu public RSS to original Gaming topic: 20 real articles covering studio/release/platform news, also rumors and lists subject to selection. Feed contains no X links; four sampled article pages returned 403, so page harvesting stays off. No bypass or social gain claimed.
- First two original RSS entries recorded for offline headline/date/host/excerpt/absent-citation regression. Fixtures are not live evidence.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 146 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings); `pnpm migrate` applied 033.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued live passes, 1,199 URLs/four topics/29 healthy sources; repeat idempotent. Read-only `screen-social-posts.ts` upcoming window still selects 3/5/0/0 lexical posts.
- Restarted API/worker; `/healthz` healthy. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed and targeted mobile Gematsu card inspected.
- Updated TASKS/docs/SOURCES. No publication, schedule mutation, inference/discovery spend or provider/model/billing change; Anthropic $0.408415 and X $0.023382. No new owner blocker.
- Next: inspect 20:40 UTC scheduled semantic edition. Gaming/World social gaps and Reddit access persist; keep paid X scheduling off.

## 2026-11-02: iteration 140 — Kotaku free Gaming citations

- Started clean on main; no leftover work. API/worker/health, current sources and digest runs healthy; two historical ingestion failures retained. Semantic edition remains due 20:40 UTC.
- Migration 034 connects Kotaku RSS (20 real articles) and exact-host bounded page discovery after three public pages returned 200. Two sampled pages expose three named X citations, persisted with article/source provenance; all three officially verified.
- All three cited posts precede upcoming daily window; no fresh-selection or virality gain claimed. Existing page caps/rotation/cooldowns apply. Wccftech probe found only an already-known citation; left unconfigured.
- Original two-entry RSS and speedrun embed fragment recorded for offline dates/hosts/excerpts/exact citation regression; fixtures are not live data.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 148 isolated tests pass. `pnpm migrate`, `pnpm build` pass (existing upstream Zod warnings).
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued live passes, 1,220 URLs/four topics/30 healthy sources; repeat idempotent. Temporary shared-client probe stored three citations and was removed. `verify-x-embeds.ts`: eight successes/zero failures, including refreshes.
- `screen-social-posts.ts` upcoming window: semantic pools 9/26/3/2, lexical selections 3/5/0/0; extra Gaming candidates come from existing sources, not older Kotaku citations. No publication/inference.
- Restarted API/worker; `/healthz` healthy. `scripts/smoke-ui.ts`, `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed and targeted Kotaku mobile card inspected.
- TASKS/docs/SOURCES updated. Spend unchanged: Anthropic $0.408415, X $0.023382. No provider/model/billing or schedule changes, new owner blocker, or bot-protection bypass.
- Next: inspect scheduled 20:40 UTC semantic edition. Gaming/World social gaps and Reddit access persist; paid X scheduling stays off.

## 2026-11-02: iteration 141 — Guardian US free World citations

- Started clean on main; no leftover work. API/worker/health, all current sources and digest/social runs healthy; two historical ingestion failures retained. Semantic edition remains due 20:40 UTC.
- Migration 035 connects Guardian US RSS to World and enables bounded exact-host discovery: 33 real articles, eight distinct X citations persisted with reporting provenance, all eight verified by official oEmbed. Same outlet as Guardian World, not independent coverage.
- Two new World posts (Bernie Sanders, 2WAY) fall inside the upcoming daily window: semantic pools 9/26/3/4 versus 9/26/3/2; lexical selections still 3/5/0/0. No relevance/virality or published-selection claim.
- France 24/PBS/HuffPost World public feeds and three pages each yielded no X citations; left unconfigured. Alternate BBC feed duplicates existing coverage. No bypass or paid calls.
- Two original RSS entries/four original page anchors recorded for offline date/excerpt/named-link regressions. `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 150 isolated tests pass. Initial check encountered temporary unformatted probe; removed it and full rerun passed.
- `pnpm migrate`, `pnpm build` pass (existing upstream Zod warnings). Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued passes, 1,252 URLs/four topics/31 healthy sources; repeat idempotent.
- Temporary shared-client probe checked four Guardian pages and was removed. Two `verify-x-embeds.ts` passes: five plus three successes/zero failures. `screen-social-posts.ts` read-only upcoming-window report confirms counts above.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed and targeted Guardian US mobile card inspected. TASKS/docs/SOURCES updated.
- No publication, schedule mutation, inference/discovery spend, provider/model/billing change or new owner blocker. Gaming social gap and Reddit access remain; paid X scheduling stays off.
- Next: inspect scheduled 20:40 UTC semantic edition when due; continue relevant free social discovery.

## 2026-11-02: iteration 142 — recover stalled official widgets

- Started clean on main; no leftover work. API/worker/health, all 31 feeds and current digest/social runs healthy; two historical ingestion failures retained. First scheduled semantic edition remains due 20:40 UTC.
- Official widget creation now has a 15-second deadline: stalled promises expose the existing saved-text/retry UI. Each attempt owns a detached-on-expiry target; late widget writes/results cannot overwrite a newer retry. Cleanup cancels timers on navigation.
- Extended read-only browser replay with accelerated production deadlines and delayed widget completion; desktop/mobile confirm fallback, successful retry, no stale widget nodes, preserved text, singleton scripts and no overflow/page errors. Protocol stubs are not live media evidence.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 150 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-posts.ts /tmp/iteration142-posts.jsonl`, `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass; screenshots refreshed and mobile stalled-widget card inspected.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued live passes, 1,256 URLs/four topics/31 healthy sources; repeat idempotent. Read-only `screen-social-posts.ts` upcoming window: semantic pools 9/26/3/4, lexical picks 3/5/0/0; no relevance or virality gain claimed.
- README/TASKS updated; source configuration unchanged. No publication, schedule mutation, inference/discovery spend or provider/model/billing change; no new owner blocker.
- Next: inspect 20:40 UTC scheduled semantic edition. Gaming social coverage and Reddit access remain unresolved; keep paid X scheduling off.

## 2026-11-02: iteration 143 — Insider Gaming free social discovery

- Started clean on main; no leftover work. API/worker/health and current source/digest/social runs healthy; two historical ingestion failures retained. Scheduled semantic edition remains due 20:40 UTC.
- Migration 036 connects Insider Gaming RSS and exact-host bounded article discovery: 10 real articles; four accessible reporting pages yielded 11 X citations persisted with article/source provenance. Existing page cap/rotation/cooldowns apply. Guides/esports coverage remains subject to selection.
- Explicit official verification: 10 successes/zero failures; subsequent pass has no candidates. Upcoming-window semantic pools 9/26/14/4, lexical picks 3/5/0/0; Gaming pool previously 3. No relevance/virality or published-selection claim.
- Recorded three original feed entries and firmware citation anchor for offline regressions. Siliconera feed returned 15 items/no citations and much anime/merchandise coverage; left unconfigured.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 152 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings); `pnpm migrate` applied 036.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued passes, 1,268 URLs/four topics/32 healthy sources; repeat idempotent. Temporary shared-client probe persisted reporting citations and was removed. `verify-x-embeds.ts` and read-only `screen-social-posts.ts` confirm above.
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; refreshed screenshots and captured targeted mobile Insider Gaming card.
- TASKS/docs/SOURCES updated. No publication, schedule mutation, inference/discovery spend, provider/model/billing change or new owner blocker. Reddit remains blocked; paid X scheduling stays off.
- Next: inspect 20:40 UTC scheduled semantic edition; measure Gaming selection quality before further discovery changes.

## 2026-11-02: iteration 154 — compact iteration orientation

- Started clean on main; no leftover work. Completed STEERING 12 before item 7 as explicitly ordered.
- Archived complete prior TASKS and progress iterations 101–132; TASKS shrank 25.8 KB to 4.5 KB, PROGRESS 61.5 KB to under 24 KB. Retained eleven recent entries rather than twenty to meet the 25 KB limit.
- Preserved open work and added owner priorities 7–11 plus lower-priority recorded LLM testing; marked implemented social components clearly. Appended item 12 ack.
- Python archive-preservation check confirms every original progress entry and the complete original task list survive (ignoring formatting whitespace).
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and 152 isolated tests pass. First check caught an archive created during formatting; corrected and full rerun green.
- `pnpm build` passes; restarted API/worker, `curl -fsS http://localhost:8000/healthz` healthy. Read-only `/api/status`: 32 sources, zero current errors, 1,398 stored source items; digest queue has no failures. Two historical ingestion failures remain retained.
- Included formatter-only fixes to two existing Markdown files so repository-wide format checking stays green. No UI/code/source changes, inference calls, schedule changes or provider changes.
- Next: STEERING 7 edition speed/async jobs, then Reddit; restore owner schedule under item 11 and isolate schedule verification. No new blocker.
- Initial push rejected because origin advanced to 31816b1 (supervisor weekly-window pacing). Merged without rewriting history; README conflict resolved using incoming text plus required formatting.
