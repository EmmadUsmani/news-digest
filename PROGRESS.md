## 2026-11-05: iteration 854 — retain failed on-demand job links after Redis pruning

- Started clean on main; no leftover work. Alerts/health green, 36 sources healthy and zero failed digest jobs. X rounds await 21:00 UTC; admin rollout awaits owner identity/proxy evidence.
- Added profile-scoped Postgres failure history through a domain port. Caught on-demand generation errors retain job ID, duration and failure time before the worker reports failure. No exception text is stored; recovered status uses the existing generic message.
- Missing Redis jobs resolve committed publications first, then recorded failures; unknown IDs remain 404. Queued/active jobs lost with Redis, worker-crash/stalled failures and history writes during DB outages remain outside this slice; original generation errors are preserved if history cannot be written.
- Real isolated HTTP test fails a fixture job, removes it from Redis and recovers the same failed link without publication. Repository checks cover idempotence, unknown IDs and profile isolation; unavailable-history fixture preserves the original error.
- Verification: pnpm format; pnpm lint:fix; pnpm check (499 unit/215 isolated integration passed); pnpm build; git diff --check; filtered check-handbook.ts (18 pages/2 diagrams, 27 tables, no warnings); smoke-admin-gate.ts; protected unknown-job GET 404; obs alerts/sources/jobs; /healthz.
- Took fresh private production backup (26 tables) before additive Drizzle migration 0002; applied successfully. Verified owner_ro SELECT and owner_rw writes remain granted on the new table. Updated schema metadata and Jobs handbook, including accurate on-demand attempt count.
- API/worker restarted healthy; saved Nov 5 edition byte-identical, 36 sources healthy, zero failed digest jobs and alerts clear. No UI/source/ranking/budget changes or paid calls; screenshots, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: X fresh-window rounds after 21:00 UTC Nov 5/6; scheduled editor-v5 evidence Nov 6. Unfinished/stalled job history and admin identity/proxy rollout remain open.

## 2026-11-05: iteration 855 — recover durable job links during Redis read outages

- Started clean on main; no leftover work. Alerts clear, 36 sources healthy and no failed digest jobs; X tests await 21:00 UTC, admin rollout awaits identity/proxy evidence.
- Saved completed and recorded failed on-demand job links now fall back to Postgres when the initial Redis lookup rejects. Unknown jobs preserve the outage error rather than falsely returning 404; no generation or paid calls.
- Extended the isolated queue test with Redis read rejection: completed edition and generic failed status recover, unknown ID rejects with the original error, and generation count stays unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (499 unit/215 isolated integration); pnpm build; git diff --check; check-handbook.ts 03-jobs-and-schedules (18 pages/2 diagrams, 27 tables, no warnings); smoke-admin-gate.ts; /healthz; obs alerts/sources/jobs.
- API/worker restarted healthy; initial smoke raced startup, rerun passed. Saved edition byte-identical, all 36 sources healthy, no failed digest jobs and alerts clear. Jobs handbook/TASKS updated; no UI/schema/source/budget changes.
- Next: X fresh-window tests after 21:00 UTC Nov 5/6, editor-v5 evidence Nov 6; unfinished/stalled durable history and admin identity/proxy verification remain open.

## 2026-11-05: iteration 856 — recover job links after mid-read Redis failures

- Started clean on main; no leftover work. Alerts/health green, collection active and scheduled digest successful; X tests await 21:00 UTC and admin rollout awaits identity/proxy evidence.
- Extended durable saved/failed job-link recovery to Redis state inspection and terminal-field refresh failures after initial lookup. Unknown links retain the original outage error; no generation or paid calls.
- Isolated queue tests exercise both mid-read failures for published, recorded-failed and unknown IDs, asserting no extra generation. No UI/schema/source/ranking/budget changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check (499 unit/215 isolated integration passed); pnpm build; check-handbook.ts 03-jobs-and-schedules (18 pages/2 diagrams, 27 tables); smoke-admin-gate.ts; git diff --check; /healthz; obs alerts.
- API/worker restarted healthy; saved Nov 5 edition byte-identical and alerts clear. Jobs handbook/TASKS updated; archived oldest progress entry to stay under 25 KB. SOURCES, screenshots and NEEDS_FROM_HUMAN unchanged.
- Next: X fresh-window rounds after 21:00 UTC Nov 5/6, editor-v5 evidence Nov 6; unfinished/stalled job history and admin identity/proxy rollout remain open.

## 2026-11-05: iteration 857 — reconcile retained on-demand failures

- Started clean on main; no leftover work. Alerts clear, 36 sources healthy, health green; X rounds await 21:00 UTC and admin rollout awaits owner identity/proxy evidence.
- Worker startup/10-second refresh now persists retained failed on-demand jobs, including terminal stalls outside the generation catch. Rechecks state, ignores unrelated/retried/incomplete jobs, stores duration only and uses existing idempotent history.
- Isolated queue test bypasses application error handling, reconciles twice, removes the Redis job and recovers generic failed status/duration from its original link. Unit coverage checks guards and DB error propagation. No actual process-kill/stall experiment performed.
- Jobs pruned before scanning, queued/active jobs lost with Redis, and unavailable DB history remain limitations. Updated Jobs handbook/TASKS; archived oldest progress entry.
- Verification: pnpm format; pnpm lint:fix; pnpm check (500 unit/215 isolated integration passed); pnpm build; check-handbook.ts 03-jobs-and-schedules (18 pages/2 diagrams, 27 tables); git diff --check; smoke-admin-gate.ts (startup race failed, rerun passed).
- API/worker restarted active; /healthz OK, saved edition byte-identical, all 36 sources healthy and alerts clear. No paid calls, UI/schema/source/budget changes; SOURCES, screenshots and NEEDS_FROM_HUMAN unchanged.
- Next: X fresh-window rounds after 21:00 UTC Nov 5/6; editor-v5 evidence Nov 6. Unfinished durable history and admin identity/proxy rollout remain open.

## 2026-11-05: iteration 858 — persist terminal failures on worker events

- Started clean on main; no leftover work. Health/alerts green, 36 sources healthy and scheduled digest successful; X rounds await 21:00 UTC and admin rollout awaits identity/proxy evidence.
- Worker now records terminal on-demand failure events immediately through the existing state-checked, idempotent history adapter. Retryable attempts remain excluded; persistence errors are caught/logged and the periodic scan remains the downtime/retry fallback.
- Isolated queue test proves a failure bypassing the generation catch reaches Postgres without scanning, then survives Redis removal; existing duplicate scan checks remain. Unit test verifies missing-job events and caught persistence rejection. No actual process-kill/stall experiment.
- Verification: pnpm format; pnpm lint:fix; pnpm check (501 unit/215 isolated integration passed); pnpm build; check-handbook.ts 03-jobs-and-schedules (18 pages/2 diagrams, 27 tables); targeted failed-edition-job.test.ts (2 passed); git diff --check; smoke-admin-gate.ts before/after restart.
- API/worker restarted active; /healthz OK, saved edition byte-identical, 36 sources healthy, zero failed digest jobs and alerts clear. Updated Jobs handbook/TASKS; archived iteration 842 to keep progress small.
- Jobs lost before either event persistence or scanning remain unrecoverable. No paid calls or UI/schema/source/budget changes; screenshots, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: X fresh-window rounds after 21:00 UTC Nov 5/6; editor-v5 evidence Nov 6. Unfinished durable job history and admin identity/proxy rollout remain open.

## 2026-11-05: iteration 859 — recover links during Redis pruning races

- Started clean on main; no leftover work. Alerts/health green, 36 sources healthy, no failed digest jobs; X rounds await 21:00 UTC and admin rollout awaits identity/proxy evidence.
- Job status now recovers durable saved/failed links when pruning races state inspection (unknown state) or terminal-field refresh (missing job), instead of returning stale fields without the edition link.
- Isolated queue test simulates both mid-read pruning stages for saved, failed and unknown IDs; preserves observed status without durable history and asserts no extra generation. No actual Redis outage or live job deletion.
- Verification: pnpm format; pnpm lint:fix; pnpm check (501 unit/215 isolated integration passed); pnpm build; check-handbook.ts 03-jobs-and-schedules (18 pages/2 diagrams, 27 tables); smoke-admin-gate.ts; git diff --check; /healthz; obs alerts/sources/jobs.
- API/worker restarted active; health OK, saved edition byte-identical and alerts clear. Jobs lost before durable history remains a limitation; no paid calls, UI/schema/source/budget changes.
- Updated Jobs handbook/TASKS; archived iteration 844 to keep progress small. SOURCES, screenshots and NEEDS_FROM_HUMAN unchanged.
- Next: X fresh-window rounds after 21:00 UTC Nov 5/6; editor-v5 evidence Nov 6. Unfinished durable job history and admin identity/proxy rollout remain open.

## 2026-11-05: iteration 860 — retain edition links after publication-side worker failures

- Started clean on main; no leftover work. Alerts clear, all 36 sources healthy and no failed digest jobs; X rounds await 21:00 UTC and admin rollout awaits owner identity/proxy evidence.
- Terminal on-demand status without a returned edition ID now checks durable history. A committed edition takes precedence over a retained queue failure, so its original link opens the saved edition without regeneration; retained duration is preserved.
- Isolated integration extends the real BullMQ worker case: register a fixture publication then throw, persist the failure in Postgres, verify completed status/link before and after Redis removal. Existing genuine failures remain failed. No process-kill or live generation experiment.
- Verification: pnpm format; pnpm lint:fix; pnpm check (501 unit/215 isolated integration passed); pnpm build; check-handbook.ts 03-jobs-and-schedules (18 pages/2 diagrams, 27 tables); smoke-admin-gate.ts; git diff --check; /healthz; obs alerts/sources/jobs.
- API/worker restarted active, health green, latest saved edition byte-identical, 36 healthy sources and zero alerts/failed digest jobs. No paid calls, UI/schema/source/budget changes.
- Updated Jobs handbook/TASKS; archived iterations 845–846 to keep progress small. SOURCES, screenshots and NEEDS_FROM_HUMAN unchanged. Jobs lost before durable history remains a limitation.
- Next: fresh-window X rounds after 21:00 UTC Nov 5/6; editor-v5 evidence Nov 6. Unfinished durable job history and admin identity/proxy rollout remain open.

## 2026-11-05: iteration 861 — open published editions before worker acknowledgement

- Started clean on main; no leftover work. Alerts/health green, 36 sources healthy and no failed digest jobs. X fresh-window rounds await 21:00 UTC; admin rollout awaits identity/proxy evidence.
- Active on-demand status now checks the profile-scoped durable publication key and returns a committed edition immediately, even if the worker stalls before acknowledging completion. In-progress jobs retain progress; final duration remains unknown until acknowledgement.
- Isolated BullMQ test holds a real worker active after fixture publication and verifies completed reader status/link, null duration/progress and no error, then releases it into the existing failure/pruning recovery checks. Publication is a fixture map, not a live edition or process-kill experiment.
- Verification: pnpm format; pnpm lint:fix; pnpm check (501 unit passed; 214/215 integration initially passed). Fixed the timing benchmark to wait for final worker duration; pnpm test:integration rerun passed all 215. Final lint/changed-file formatting and git diff --check passed.
- pnpm build and check-handbook.ts 03-jobs-and-schedules passed (18 pages/2 diagrams, 27 tables); smoke-admin-gate.ts passed before/after deployment. Initial immediate restart probe raced startup; readiness retry passed /healthz, database and Redis.
- API/worker active; latest saved edition byte-identical, 36 healthy sources, zero alerts/failed digest jobs; zero dangling Docker volumes. No paid calls, UI/schema/source/budget changes.
- Updated Jobs handbook/TASKS; archived iteration 847 to keep progress small. SOURCES, screenshots and NEEDS_FROM_HUMAN unchanged. Jobs lost before durable history remain unresolved.
- Next: X fresh-window rounds after 21:00 UTC Nov 5/6; editor-v5 evidence Nov 6; durable unfinished history and admin identity/proxy rollout remain open.

## 2026-11-05: iteration 862 — preserve published links after worker requeue

- Started clean on main; no leftover work. Alerts/health green, 36 sources healthy and no failed digest jobs. X rounds await 21:00 UTC; admin rollout awaits identity/proxy evidence.
- Published on-demand editions now remain reader-ready when a stalled worker returns to waiting, delayed, paused or dependency-wait states, extending active-worker recovery. Unpublished jobs retain their state/progress.
- Isolated queue integration simulates those four Redis states against fixture publication history and verifies the saved link, cleared progress/error, unknown duration and no extra generation. It also verifies unknown jobs retain progress; no real process-kill experiment.
- Verification: pnpm format; pnpm lint:fix; pnpm check (501 unit/215 isolated integration passed); pnpm build; check-handbook.ts 03-jobs-and-schedules (18 pages/2 diagrams, 27 tables); smoke-admin-gate.ts before/after restart; git diff --check.
- API/worker restarted active; /healthz database/Redis OK, saved edition byte-identical, 36 healthy sources, zero alerts and failed digest jobs. No paid calls, UI/schema/source/budget changes.
- Updated Jobs handbook/TASKS; archived iteration 848 to keep progress small. SOURCES, screenshots and NEEDS_FROM_HUMAN unchanged. Jobs lost before durable history remain unresolved.
- Next: fresh-window X rounds after 21:00 UTC Nov 5/6; editor-v5 evidence Nov 6; durable unfinished history and admin identity/proxy rollout remain open.

## 2026-11-05: iteration 863 — explain accepted on-demand jobs lost from Redis

- Started clean on main; no leftover work. Alerts/health green, 36 sources healthy, digest queue zero failures. X rounds await 21:00 UTC; admin rollout awaits owner identity/proxy evidence.
- New profile-scoped Drizzle request repository saves each accepted on-demand job ID before returning its link, including deduplicated adds. Successful missing/unknown Redis reads now return a generic unavailable failure for known requests; unknown IDs remain absent, outages remain retryable, and saved editions/failures take precedence. Status reads never regenerate.
- Isolated tests cover real paused-job removal, lookup/state removal race, dedupe, acceptance-write failure, outage behavior, no replacement enqueue, idempotency and profile isolation. Older unfinished jobs already lost before deployment cannot be reconstructed; no worker/process-kill or live generation experiment.
- Verification: pnpm format; pnpm lint:fix; pnpm check (501 unit, initially 216/217 integration). Fixed a timing-test constructor missing the new request port; pnpm test:integration rerun passed all 217. pnpm build, git diff --check and Jobs handbook check passed (18 pages/2 unchanged diagrams, 28 assigned tables).
- Private backup service succeeded before additive migration 0003; pnpm migrate applied it. Owner read/write role access verified; request table initially empty. No data rewrite or source/UI/budget change.
- API/worker restarted active; /healthz database/Redis OK; smoke-admin-gate.ts before/after restart passed, saved reader edition byte-identical, 36 healthy sources, zero alerts/failed digest jobs and dangling Docker volumes. No paid calls.
- Updated Jobs handbook, schema metadata and TASKS; archived iteration 849 to keep progress small. SOURCES, screenshots and NEEDS_FROM_HUMAN unchanged.
- Next: X fresh-window rounds after 21:00 UTC Nov 5/6; scheduled editor-v5 evidence Nov 6; admin identity/proxy rollout and broader job reliability acceptance remain open.

## 2026-11-05: iteration 864 — verify recovery after an actual worker crash

- Started clean on main; no leftover work. Alerts/health green, 36 sources healthy and digest queue zero failures. X rounds remain time-gated; admin rollout still needs owner identity/proxy evidence.
- Added isolated acceptance coverage that starts a real child BullMQ worker, waits for active progress, kills it with SIGKILL, then starts a replacement. The same accepted job completes once and its fixture publication link survives explicit queue pruning.
- Acceptance IDs use disposable Postgres; publication is an in-memory fixture map, not live content. Child refuses non-isolated execution; no external services or paid calls. Recovery timeout accommodates an earlier worker's 30-second stalled-check lease.
- Verification: pnpm format; pnpm lint:fix; pnpm check (501 unit/218 isolated integration passed); pnpm build; git diff --check. First check stopped on an unnecessary assertion, corrected before the passing run. Targeted isolated queue rerun passed all five tests after the final timeout adjustment.
- API/worker remain active; /healthz database/Redis OK, latest reader edition 7d99b279-cb6a-4cf0-b0a2-d94c5645f0b7 serves four topics; no dangling Docker volumes. Test/docs-only change, so no restart under STEERING 22.
- Updated TASKS; archived iteration 850 to keep progress below 25 KB. Handbook, schema metadata, SOURCES, screenshots and NEEDS_FROM_HUMAN unchanged; production behavior unchanged.
- Next: X fresh-window rounds after 21:00 UTC Nov 5/6; scheduled editor-v5 evidence Nov 6; admin identity/proxy rollout and broader job reliability acceptance remain open.

## 2026-11-05: iteration 865 — reassess incremental triage after full-AI acceptance

- Started clean on main; no leftover work. Alerts clear, health database/Redis OK, 36 active sources without errors and zero failed digest jobs.
- Read-only production cost reader now returns one qualifying full-AI cost ($0.315445). Unchanged 1.5 headroom protects $0.473168; production policy projects Nov 6 morning allowance $0.021736–$0.028915 depending on remaining Nov 5 spend.
- Captured the same Nov 5 window after publication and compared actual configured Haiku fingerprints with iteration 655: 2/65 compatible, 62 absent, one NBA article-input change. This is prospective compatibility, not publication-time membership or actual paid waste.
- Added docs/edition-reviews/2026-11-05-incremental-admission.md; keep incremental triage OFF and reserve unchanged. No provider calls, cache writes, configuration changes or generation.
- Verification: pnpm format; pnpm lint:fix; pnpm check (501 unit/218 isolated integration passed); pnpm build; git diff --check. First check caught formatting in the newly archived progress entry; corrected before passing rerun.
- Archived iteration 851; updated TASKS. Runtime unchanged, no restart under STEERING 22. Handbook, schema metadata, SOURCES, screenshots and NEEDS_FROM_HUMAN unchanged.
- Next: X fresh-window rounds after 21:00 UTC Nov 5/6; scheduled editor-v5 evidence Nov 6. Incremental activation needs closer-to-cutoff consumption/waste evidence; admin rollout still needs identity/proxy evidence.

## 2026-11-05: iteration 866 — preflight paid X experiment rounds

- Started clean on main; no leftover work. Alerts clear, database/Redis healthy, 36 sources healthy and zero failed digest jobs. X rounds remain gated until 21:00 UTC; UI rollout still awaits identity/proxy evidence.
- Found that the runner accepted 48-hour windows and repeated topic IDs even though round reporting rejects those inputs as valid coverage. It now rejects non-24-hour, future or timezone-ambiguous windows, starts before 21:00 UTC, and duplicate/blank topics before creating state or reserving funds.
- Mocked subprocess tests cover those refusals with no dispatch/journal, plus successful eight-cell settlement, reservation overrun and interrupted-round continuation. Corrected the old success fixture's accidental 48-hour window; no provider calls or production ingestion.
- Verification: pnpm format; pnpm lint:fix; pnpm check (503 unit/218 isolated integration passed); pnpm build; git diff --check.
- Archived iteration 852; updated TASKS and experiment reference. CLI-only change; services remain active, no restart under STEERING 22. Handbook, SOURCES, schema metadata, screenshots and NEEDS_FROM_HUMAN unchanged.
- Next: fresh-window X rounds after 21:00 UTC Nov 5/6; saved comparison still checks cross-round non-overlap. Nov 6 scheduled editor-v5 evidence and admin identity/proxy rollout remain open.

## 2026-11-05: iteration 867 — compare scheduled inference work across days

- Started clean on main; no leftover work. Alerts clear, database/Redis healthy, 36 healthy sources and zero failed digest-generation jobs. X rounds remain time-gated; admin rollout needs identity/proxy evidence.
- Retained Nov 5's 46 allowlisted call-usage records, without prompts, responses, headers or fingerprints, for existing offline token tooling. Journal-derived purpose spans show social triage through 148.890 s and Bluesky editing through 152.264 s.
- HTTP work grew 8.7% versus Nov 4 while elapsed time grew 0.5%. Combined triage consumes 63.8% of HTTP work/77.3% of output tokens. Removing all article triage still leaves an optimistic 70.404 s four-slot bound; no output-limit stops or missing usage.
- Interval reconstruction shows one apparent five-call overlap for 1 ms, consistent with timestamp/duration precision rather than sustained extra concurrency. Kept four slots, candidate pools, prompts and settings unchanged; no paid calls.
- Verification: offline fixture evaluator plus assertions confirmed 46 calls/550600 HTTP ms/118758 output tokens, complete usage and zero HTTP failures/truncations; pnpm format; pnpm lint:fix; pnpm check (503 unit/218 isolated integration passed); pnpm build; git diff --check.
- Updated concurrency review/TASKS; archived iteration 853. Evidence/docs-only change, no restart under STEERING 22; API/worker active and /healthz healthy. Handbook, SOURCES, schema metadata, screenshots and NEEDS_FROM_HUMAN unchanged.
- Next: X fresh-window rounds after 21:00 UTC Nov 5/6; saved editor-v5 evidence Nov 6. Offline speed work should address social/editor dependencies and recoverable editor retries.
