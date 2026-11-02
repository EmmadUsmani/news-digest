# Archived progress

## 2026-11-02: iteration 156 — bounded Anthropic rate-limit backoff

- Started clean on main; no leftover work. API/worker healthy, 32 sources without current errors; digest queue has zero failures. Two historical ingestion failures remain retained.
- STEERING 7 partial: ordinary HTTP 429 rejections retry at most twice within one existing reservation; default waits 1s/2s, honoring Retry-After seconds/dates up to 10s per wait. Longer deadlines fail rather than retry early.
- Spend-limit responses remain immediate monthly blocks; transport/other HTTP failures never retry. Successful inference usage settles once; exhausted failures retain conservative reservations.
- Fake HTTP tests cover retry recovery/exhaustion, one reservation/settlement, long deadlines, date parsing and non-retry failures. No live inference calls or spend.
- `pnpm exec tsx --test apps/api/test/llm.test.ts`: 19 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and 157 isolated tests pass. Initial check caught SDK headers typed any; narrowed before green rerun.
- `pnpm build` passes; restarted API/worker; `/healthz` healthy and `/api/digest-previews/latest` returns the stored four-topic edition. No new publication or schedule/source/UI changes; source docs unchanged.
- Updated TASKS/docs/RANKING and archived progress 133–134 to stay below 25 KB. No new blocker; next: shared concurrency/parallel editors, async jobs/window dedupe/progress and full-edition timing. Item 7 remains open.

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

## 2026-11-02: iteration 167 — budget-safe live timing evidence

- Started clean on main; no leftover work. Health/API/worker healthy, 32 sources without errors, zero failed digest jobs; two historical ingestion failures remain.
- Added read-only `scripts/report-edition-timing.ts`: GETs status and three retained completed editions; reports worker timing, attempts, window, candidate counts, AI/fallback metadata and remaining app budget. No jobs, settings writes or inference.
- Actual live report: retained runs took 85/73/74 ms and published older signals-v6 editions with four topics and no AI metadata. These are NOT live AI latency evidence.
- Only 848 micros ($0.000848) remains today, with no reservations; a meaningful fresh provider trial cannot fit. Preserved the scheduled digest's budget. Item 7 targets stay unverified; inspect routine runs instead of more paid verification.
- `pnpm exec tsx scripts/report-edition-timing.ts` plus JSON assertions passed (three runs, four topics each, nonnegative duration, exact remaining budget); next scheduled run is 15:00 UTC, unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (all 164 isolated tests, types/lint/format/boundaries) and `pnpm build` passed. No UI/source changes or live inference spend; docs/SOURCES unchanged.
- README/TASKS updated. Next: inspect 15:00 scheduled publication with this report; proceed to Reddit while fresh live latency evidence awaits budget. No human action needed.
