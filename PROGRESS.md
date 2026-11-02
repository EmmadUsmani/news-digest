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

Earlier iterations 133–134: [archive](docs/progress-archive/2026-11-02-iterations-133-134.md).

Earlier iterations 135–136: [archive](docs/progress-archive/2026-11-02-iterations-135-136.md).

Earlier iterations 137–138: [archive](docs/progress-archive/2026-11-02-iterations-137-138.md).

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

## 2026-11-02: iteration 155 — bounded concurrent article/social triage

- Started clean on main; no leftover work. Services/health healthy; 32 sources without current errors, 1,398 stored items. Two historical ingestion failures retained; digest queue has no failures.
- STEERING 7 partial: replace sequential three-item calls with up to 50 items, four calls in flight per invocation, conservative 60 KB escaped UTF-8 input bound and batch-scaled output limits. Per-item cache keys and existing shared-instruction caching preserved.
- Refusal stops new batches; in-flight calls finish and retain validated scores. Fake tests cover concurrency/order, byte splitting, changed inputs/cache reuse and refusal; no live LLM calls.
- `pnpm exec tsx --test apps/api/test/triage.test.ts`: 9 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and 154 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- Temporary offline benchmark: 1,500 candidates in sequential 200-item chunks, 20 ms fake calls: cold 30 calls/217 ms; replay zero calls/15 ms. This is triage orchestration only, not a live/full-edition timing claim.
- Restarted API/worker; `/healthz`, `/api/status` and latest edition read pass (four topics). No new publication, schedule mutation or inference/discovery spend. No UI/source changes; source docs unchanged.
- TASKS and docs/RANKING updated. Next: bounded 429 backoff, parallel topic editors/shared concurrency, async generation/dedupe/progress and full-edition timing. Item 7 remains open; no new blocker.

## 2026-11-02: iteration 156 — bounded Anthropic rate-limit backoff

- Started clean on main; no leftover work. API/worker healthy, 32 sources without current errors; digest queue has zero failures. Two historical ingestion failures remain retained.
- STEERING 7 partial: ordinary HTTP 429 rejections retry at most twice within one existing reservation; default waits 1s/2s, honoring Retry-After seconds/dates up to 10s per wait. Longer deadlines fail rather than retry early.
- Spend-limit responses remain immediate monthly blocks; transport/other HTTP failures never retry. Successful inference usage settles once; exhausted failures retain conservative reservations.
- Fake HTTP tests cover retry recovery/exhaustion, one reservation/settlement, long deadlines, date parsing and non-retry failures. No live inference calls or spend.
- `pnpm exec tsx --test apps/api/test/llm.test.ts`: 19 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and 157 isolated tests pass. Initial check caught SDK headers typed any; narrowed before green rerun.
- `pnpm build` passes; restarted API/worker; `/healthz` healthy and `/api/digest-previews/latest` returns the stored four-topic edition. No new publication or schedule/source/UI changes; source docs unchanged.
- Updated TASKS/docs/RANKING and archived progress 133–134 to stay below 25 KB. No new blocker; next: shared concurrency/parallel editors, async jobs/window dedupe/progress and full-edition timing. Item 7 remains open.

## 2026-11-02: iteration 157 — shared Anthropic concurrency

- Started clean on main; no leftover work. API/worker healthy, 32 sources without current errors and no digest queue failures; two historical ingestion failures remain retained.
- STEERING 7 partial: process-wide FIFO four-call limit shared across Anthropic adapter instances and article/social triage/editing. Retains slots through 429 backoff and releases on success/failure. API and worker retain independent limits.
- Fake HTTP test overlaps twelve calls across twelve adapters, verifies FIFO order, four-call peak and continued progress after four transport failures. No live LLM calls or spend.
- `pnpm exec tsx --test apps/api/test/llm.test.ts`: 20 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and 158 isolated tests pass. `pnpm build` passes.
- Restarted API/worker; both active. `/healthz` healthy, `/api/status` shows 32 sources with zero current errors and zero digest failures; `/api/digest-previews/latest` returns stored four-topic edition.
- Updated TASKS and docs/RANKING. No UI/source/schedule changes or new publication; source docs unchanged. No new blocker.
- Next: parallel topic editors, async jobs/window dedupe/progress and full-edition timing. Item 7 remains open; no full-edition performance claim.

## 2026-11-02: iteration 158 — parallel topic editorial pipelines

- Started clean on main; no leftover work. API/worker and health healthy; 32 sources without current errors, zero failed digest jobs; two retained historical ingestion failures.
- STEERING 7 partial: run four topic pipelines concurrently, overlapping article/social triage and editing under the existing shared Anthropic limit. Preserve configured topic order and one repeatable-read publication snapshot.
- Stop queued topics after failure and drain in-flight siblings before rollback/release. Fake publication test requires four simultaneous editors; worker tests cover multiple waves, order, empty input and failure draining.
- Initial direct targeted invocation hit the test-isolation guard (no live access); reran through the disposable Postgres/Redis harness. `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 161 isolated tests pass. `pnpm build` passes.
- Restarted API/worker; both active. `/healthz` healthy; `/api/status` shows 32 sources, no current source errors or failed digest jobs; latest stored edition returns four topics.
- Updated TASKS/docs/RANKING; archived iterations 135–136 to keep PROGRESS compact. No UI/source/schedule changes, new publication or live inference spend; source docs unchanged.
- Next: async creation/regeneration, window dedupe, progress UI and last-run duration; measure full-edition timing with fakes. No full-edition latency claim or new blocker; item 7 stays open.

## 2026-11-02: iteration 159 — async edition job backend

- Started clean on main; no leftover work. API/worker healthy, 32 sources without current errors and zero failed digest jobs; two historical ingestion failures retained.
- STEERING 7 partial: POST `/api/digest-previews/jobs` returns 202; GET `jobs/:id` exposes state, edition ID, processing duration and sanitized failure. Existing UI/POST stay synchronous pending polling UI.
- BullMQ atomically dedupes normalized exact windows while waiting/active. Completion/failure allows a new regeneration; retained job IDs provide idempotent publication keys for worker recovery. One attempt per on-demand job; scheduled retries unchanged.
- Isolated Redis/fake-generator test covers ten concurrent submissions, active dedupe, completion/duration, regeneration, failures/retry, request validation and unknown IDs. No live inference calls/spend or new edition.
- Initial test setup had a transient migration failure; fresh-container rerun migrated successfully. Fixed strict request fixture and retained test-job cleanup exposed by full-suite verification.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 162 isolated tests pass. `pnpm build` passes; restarted API/worker, both active; `/healthz` healthy.
- Live invalid enqueue returns 400 and unknown job 404; `/api/status` has 32 sources, no current errors/failed digest jobs; latest stored edition has four topics. README/TASKS updated; no UI/source changes, source docs unchanged.
- Next: connect creation/regeneration UI to enqueue/poll, editorial-stage progress and Status duration; measure full-edition timing with fakes. Item 7 remains open; no latency claim or new blocker.

## 2026-11-02: iteration 160 — asynchronous edition UI

- Started clean on main; no leftover work. API/worker and health healthy, 32 sources without current errors, no failed digest jobs; two historical ingestion failures retained.
- Create edition now enqueues and polls BullMQ jobs, disables repeat submission, opens the saved edition on completion and refreshes history. Session storage resumes the job after reload/navigation within the tab.
- Shows queued/active, completion and sanitized failure messages. Temporary status/edition-fetch failures retry without submitting another job; expired jobs direct the user to saved editions.
- `pnpm exec tsx scripts/smoke-edition-jobs.ts`: desktop/mobile queued, active, reload, reconnect, completion and failure pass; screenshots in docs/screenshots/edition-job-{desktop,mobile}.png. Generation intercepted; reads real stored edition only, no live inference spend.
- Initial checks caught state declaration order and smoke-script CommonJS top-level await; both corrected before verification.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: all 162 isolated tests and types/lint/format/boundaries pass; `pnpm build` passes; services restarted and health checked.
- TASKS updated; no source changes, docs/SOURCES unchanged. Item 7 remains open: granular editorial-stage progress, last-run duration on Status and full-edition fake timing. No latency claim or new blocker.
