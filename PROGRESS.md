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

Earlier iterations 139–140: [archive](docs/progress-archive/2026-11-02-iterations-139-140.md).

Earlier iterations 141–142: [archive](docs/progress-archive/2026-11-02-iterations-141-142.md).

Earlier iteration 143: [archive](docs/progress-archive/2026-11-02-iteration-143.md).

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

## 2026-11-02: iteration 161 — edition duration on Status

- Started clean on main; no leftover work. API/worker and health healthy, all 32 sources without current errors, no failed digest jobs; two historical ingestion failures retained.
- Status API exposes startedAt and nullable durationMs from BullMQ processing/finish timestamps. Retained runs sort by finish/start before schedule, placing finished on-demand runs correctly.
- Status shows latest finished edition duration and per-run processing time; includes on-demand editions and explains queue-wait exclusion and final-attempt timing. Pending jobs have no duration.
- Added isolated Redis worker test comparing telemetry to stored timestamps and checking pending/completed states. No live generation or inference spend.
- `pnpm exec tsx scripts/smoke-run-duration.ts`: desktop/mobile completed and waiting states pass with intercepted telemetry; screenshots docs/screenshots/run-duration-{desktop,mobile}.png.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 163 isolated tests pass. `pnpm build` passes.
- Restarted API/worker; /healthz healthy. Live Status retains 32 sources, no current source errors or failed digest jobs; stored editions remain available.
- Updated TASKS; no source changes, docs/SOURCES unchanged. Item 7 remains open: granular editorial-stage progress and full-edition fake timing. No latency claim or new blocker.

## 2026-11-02: iteration 162 — editorial-stage progress

- Started clean on main; no leftover work. API/worker and health healthy, 32 sources without current errors and no failed digest jobs.
- Generation reports each topic's story triage, story editing, social triage/editing and readiness, then publication; concurrent topics retain individual stages.
- Scheduled/on-demand workers persist progress in BullMQ; polling API returns it and creation UI displays it, including resumed jobs. Publication progress precedes the insert/commit; completion still requires a saved edition.
- Extended fake publication harness checks stage ordering and independent snapshots across parallel topics; isolated Redis test checks generator-to-worker-to-API progress delivery. No live inference spend.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 163 isolated tests pass. `pnpm build` passes.
- `pnpm exec tsx scripts/smoke-edition-jobs.ts`: desktop/mobile stages, publication, reload, reconnect, completion and failure pass; updated docs/screenshots/edition-job-{desktop,mobile}.png. Generation intercepted; reads stored edition only.
- Restarted API/worker; `/healthz` healthy, 32 sources/no current errors, zero failed digest jobs; latest stored edition retains four topics.
- README/TASKS updated; no source changes, docs/SOURCES unchanged. No new blocker. Item 7 remains open for full-edition fake timing; no live latency claim.

## 2026-11-02: iteration 163 — reproducible full-publication timing baseline

- Started clean on main; no leftover work. API/worker and health healthy, 32 sources without current errors, zero failed digest jobs; two historical ingestion failures retained.
- Added disposable-Postgres four-topic cold/warm generation benchmark: real candidate SQL, CandidateTriage batching/validation/cache, ranking, post queries (empty), editor orchestration and immutable publication/readback.
- Synthetic 400 stored articles: 400 triaged, 8 calls, cold 144 ms / warm 87 ms. Synthetic 1,500 stored: 800 triaged, 16 calls, cold 238 ms / warm 204 ms. Both warm regenerations make zero new triage calls; all eight topic edits run.
- Uses fake triage inference and fake editor with 25 ms delays; excludes real provider/concurrency/network/queue latency and social inference. These are application baselines, NOT proof of live <60s/<2min targets; 200 articles/topic cap explicitly recorded in README/TASKS.
- Initial verification caught missing fixture guidance and prohibited immutable-edition cleanup; corrected fixture and leave editions for disposable-container removal. All temporary sources/items/topics are removed and original topic flags restored.
- `pnpm lint:fix`, `pnpm format`, `pnpm check`: types/lint/format/boundaries and all 164 isolated tests pass. `pnpm build` passes.
- Restarted API/worker; `/healthz` healthy; live sources, queues and stored editions checked. No live inference calls or spend; no UI/source changes, docs/SOURCES unchanged.
- Archived iterations 139–140 to keep PROGRESS below 25 KB. Next: social-inclusive timing through the fake provider/worker path; item 7 remains open without a live latency claim.

## 2026-11-02: iteration 164 — social-inclusive publication timing

- Started clean on main; no leftover work. API/worker and health healthy, 32 sources without errors, zero failed digest jobs; two historical ingestion failures remain.
- Extended isolated four-topic timing with 60 synthetic verified X posts/topic, scoped citations, real social triage/editor validation, selection and immutable readback. No live posts or inference used.
- Synthetic 400 articles + 240 posts: cold 206 ms / warm 99 ms; 1,500 stored articles + 240 posts: cold 286 ms / warm 205 ms. Existing article cap scores only 800 at larger volume.
- Both volumes score all 240 posts in eight batches; warm regeneration adds no article/social triage or social editor calls. Each topic publishes five AI-selected synthetic posts.
- Measurements use 25 ms fake inference and fake story editing; exclude provider/network/concurrency limits and BullMQ path. They do not establish live <60s/<2min targets. No live inference spend.
- Verification initially caught integer instead of JSON citation fixture data; corrected. `pnpm lint:fix`, `pnpm format`, `pnpm check` pass: types/lint/format/boundaries and all 164 isolated tests. `pnpm build` passes.
- Restarted API/worker; `/healthz` healthy, 32 sources/no errors, zero failed digest jobs, latest stored edition still has four topics. No UI/source changes; docs/SOURCES unchanged.
- README/TASKS updated. Next: representative fake provider/worker timing; live latency still unverified, item 7 stays open.

## 2026-11-02: iteration 165 — fake HTTP provider and worker timing

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without errors, zero failed digest jobs; two historical ingestion failures retained.
- Extended social-inclusive disposable-service benchmark through real Anthropic SDK serialization, adapter four-call limiter, BullMQ enqueue/worker, progress persistence and completed-edition readback. Story editor remains fake.
- Synthetic 400 articles + 240 posts: cold/warm enqueue-to-readback 273/114 ms; worker 262/108 ms. Synthetic 1,500 stored articles + 240 posts: 349/261 ms; worker 336/252 ms. Existing cap triages 800 articles at larger volume.
- Both volumes reach exactly four fake HTTP calls concurrently, reuse all warm article/social scores and social selection caches, and publish four five-story/five-post topics. Uses 25 ms fake HTTP inference; NOT proof of live <60s/<2min targets. No live inference spend.
- Initial lint caught unsafe RequestInit body stringification; added explicit string assertion. `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 164 isolated tests pass. `pnpm build` passes.
- Restarted API/worker; `/healthz` healthy; 32 sources, 1,451 stored source items, no source errors, zero failed digest jobs. Latest stored edition remains four topics.
- README/TASKS updated; archived iterations 141–142 to keep PROGRESS small. No source/UI changes; docs/SOURCES unchanged.
- Next: live/cache-backed provider latency evidence within verification budget; item 7 remains open. Avoid treating fake timings as live targets; Reddit follows item 7.

## 2026-11-02: iteration 166 — restore owner schedule and stop live smoke writes

- Started clean on main; API/worker/health healthy, 32 sources without errors, no failed digest jobs; two historical ingestion failures retained.
- Triage found the reported wrong live schedule still active: 20:40 UTC/PT6H. Restored 07:00 America/Los_Angeles/P1D through API, preserving both budgets at five; Redis next slot now 2026-11-02T15:00Z.
- Schedule UI smoke now intercepts profile reads/writes in memory, checks reload/defaults/timezone errors, and asserts live profile unchanged. Updated desktop/mobile screenshots are replay settings, not live schedule evidence.
- Disabled the obsolete live scheduler probe with an explicit failure directing callers to isolated scheduling tests. Legacy recovery remains manual only; README explains the distinction.
- Initial replay needed domain timezone validation; corrected. `pnpm exec tsx scripts/smoke-schedule.ts` passed desktop/mobile with unchanged live profile.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `pnpm build` pass (164 tests); services restarted and health/schedule/source/edition endpoints checked.
- No live inference calls/spend or source changes; docs/SOURCES unchanged. Item 7 live latency still unverified; next use budget-safe evidence before Reddit.

## 2026-11-02: iteration 167 — budget-safe live timing evidence

- Started clean on main; no leftover work. Health/API/worker healthy, 32 sources without errors, zero failed digest jobs; two historical ingestion failures remain.
- Added read-only `scripts/report-edition-timing.ts`: GETs status and three retained completed editions; reports worker timing, attempts, window, candidate counts, AI/fallback metadata and remaining app budget. No jobs, settings writes or inference.
- Actual live report: retained runs took 85/73/74 ms and published older signals-v6 editions with four topics and no AI metadata. These are NOT live AI latency evidence.
- Only 848 micros ($0.000848) remains today, with no reservations; a meaningful fresh provider trial cannot fit. Preserved the scheduled digest's budget. Item 7 targets stay unverified; inspect routine runs instead of more paid verification.
- `pnpm exec tsx scripts/report-edition-timing.ts` plus JSON assertions passed (three runs, four topics each, nonnegative duration, exact remaining budget); next scheduled run is 15:00 UTC, unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (all 164 isolated tests, types/lint/format/boundaries) and `pnpm build` passed. No UI/source changes or live inference spend; docs/SOURCES unchanged.
- README/TASKS updated. Next: inspect 15:00 scheduled publication with this report; proceed to Reddit while fresh live latency evidence awaits budget. No human action needed.

## 2026-11-02: iteration 168 — bounded Reddit listing adapter

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without current errors, zero failed digest jobs; two historical ingestion failures retained.
- Live timing report still has only 848 micros available today; made no inference calls. Owner's next scheduled slot remains 15:00 UTC; live AI latency targets stay unverified.
- Added RedditListingPort and public top/day JSON adapter using the shared HTTP port; retains card metadata, UTC timestamps, engagement and external X URLs, validates identity, deduplicates and skips unsafe/removed/adult/pinned entries.
- One bounded LocalLLaMA public JSON probe with descriptive User-Agent returned 403. No bypass, alternate host or source activation. Reddit storage/settings/ranking/cards remain unfinished; no live Reddit content claimed.
- Synthetic fixture tests cover faithful metadata/X citation evidence, malformed posts, URL/identity rejection, dedupe, invalid community input and single-call denial propagation.
- `pnpm exec tsx --test apps/api/test/reddit-listing.test.ts`: 3 passed. Initial full check caught docs formatting during an edit; formatted and reran `pnpm check`: all 167 isolated tests, types/lint/format/boundaries pass. `pnpm build` passed.
- Restarted API/worker; health database/Redis true, 32 sources/no current errors, digest queue zero failed, latest edition four topics. No UI changes; docs/SOURCES and TASKS updated; archived iteration 143 to keep orientation small.
- Next: inspect 15:00 scheduled publication via read-only timing report; connect Reddit community settings/persistence behind the new port while respecting denied public access.

## 2026-11-02: iteration 169 — editable Reddit community configuration

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without current errors, zero failed digest jobs; two historical ingestion failures retained.
- Added migration 037 with owner-curated communities for four original topics; settings/API persist bounded unique names, normalize r/ in UI, support clearing and preserve choices for older clients omitting the field.
- Reddit collection stays disabled after prior 403s; no new access probe, bypass, inference or paid search. Post storage/collection/ranking/cards remain next; no live Reddit content claimed.
- Added isolated repository/validation coverage for seed data, create/update/read, omission, clearing, independent X accounts and unchanged other topics.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (169 tests, types/lint/format/boundaries) and `pnpm build` pass. Fixed smoke script's CJS top-level-await issue before rerunning.
- Applied migration with `pnpm migrate`; restarted API/worker. `pnpm exec tsx scripts/smoke-reddit-communities.ts` passed desktop/mobile normalize/save/reload/duplicates/clear with intercepted writes and unchanged live topics; screenshots updated.
- Read-only timing report observed 15:00 scheduled edition 60718fe7 publish in 856 ms, 604 candidates/four topics, ten X posts; all story/social selection non-AI fallback due incomplete triage within caps. NOT live AI latency evidence. Spend unchanged at 481910 micros; next run Nov 3 15:00 UTC.
- Health/source/status/latest-edition endpoints pass, no failed digest runs. README/TASKS/SOURCES updated; archived oldest progress entry to stay compact. Next: Reddit post persistence/collection behind port, respecting blocked public access.

## 2026-11-02: iteration 170 — transactional Reddit post storage

- Started clean on main; no leftover work. Health/API/worker healthy, 32 sources/no current errors, zero failed digest runs; two historical ingestion failures retained.
- Added migration 038: platform-specific Reddit/X ID checks, Reddit metadata on SocialPost rows and per-topic associations. Existing X selection remains unchanged.
- Added repository/collection ports and bounded explicit collector: deduped enabled communities, 20-community cap, 100 posts/community, stop on first listing error; no scheduler activation or public requests while access remains blocked.
- Transactional writes preserve title/text, author, UTC time, subreddit, external URL/thumbnail and engagement snapshot; upserts refresh metrics and associations recheck enabled/configured topics.
- Synthetic/isolated tests verify metadata, repeated collection, topic scope, rollback and stop-on-denial; no live Reddit data claimed. X citation integration, ranking and cards remain next.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (171 tests, types/lint/format/boundaries) and `pnpm build` passed. No UI changes; browser verification not applicable. README/TASKS/SOURCES updated; oldest progress entry archived.
- `pnpm migrate` applied 038; restarted API/worker. `/healthz` DB/Redis true; `/api/status` 32 sources/no errors and zero failed digest/social jobs, all queues have workers.
- Read-only `pnpm exec tsx scripts/report-edition-timing.ts`: same 856 ms scheduled fallback edition/four topics; budget unchanged (481910 micros spent, 848 available), no inference calls. Live AI latency remains unverified; next routine run Nov 3 15:00 UTC.
