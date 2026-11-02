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

Earlier iteration 157: [archive](docs/progress-archive/2026-11-02-iteration-157.md).

Earlier iterations 161–162: [archive](docs/progress-archive/2026-11-02-iterations-161-162.md).

Earlier iterations 163–164: [archive](docs/progress-archive/2026-11-02-iterations-163-164.md).

Earlier iteration 165: [archive](docs/progress-archive/2026-11-02-iteration-165.md).

Iteration 166: [archive](docs/progress-archive/2026-11-02-iteration-166.md).

Earlier iterations 169–170: [archive](docs/progress-archive/2026-11-02-iterations-169-170.md).

Earlier iterations 171–172: [archive](docs/progress-archive/2026-11-02-iterations-171-172.md).

Earlier iterations 173–174: [archive](docs/progress-archive/2026-11-02-iterations-173-174.md).

## 2026-11-02: iteration 175 — faithful Reddit cards and edition readback

- Started clean on main; no leftover work. Health/services healthy, 32 sources/no current errors, no failed digest/social jobs; two historical ingestion failures retained.
- Edition readback now accepts discriminated X/Reddit snapshots while preserving historical X compatibility. Publication selection remains X-only pending pipeline wiring.
- Added faithful Reddit cards: title/body, community/author/time, optional thumbnail/destination, saved score/comments/upvote ratio and observation time, context and selection reasons. Platform-qualified React keys avoid cross-platform ID collisions.
- Added synthetic browser replay for desktop/mobile, media/no-media, links, metrics, no overflow/errors and zero X widget requests; screenshots saved under docs/screenshots/reddit-card-*.png. Inspected mobile screenshot.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (176 tests), `pnpm build` passed. First check caught source-note formatting; corrected before the successful full run.
- `pnpm exec tsx scripts/smoke-reddit-cards.ts` passed after fixing its CommonJS main wrapper; final script lint/format checks passed. No live source or inference requests and no edition writes.
- Restarted API/worker; `/healthz` DB/Redis true. Latest real edition retains four topics/20 stories/10 X posts (Tech/NBA), non-AI mode. Updated TASKS/SOURCES.
- Next: wire conservative Reddit shortlist/snapshots through platform-aware publication. Real Reddit remains blocked/unscheduled; live AI latency remains unverified.

## 2026-11-02: iteration 176 — platform-aware social publication

- Started clean on main; no leftover work. API/worker and health healthy, 32 sources/no current errors, no failed digest/social jobs; two historical ingestion failures retained.
- Connected historical-strength Reddit shortlist/snapshots to semantic candidates and non-AI fallback inside the publisher repeatable-read transaction; retained enforced X preference and immutable platform metadata.
- Shared repository observation reader accepts the publisher client; no extra connection, source fetch or inference added. Citation story links now apply only to X, preventing cross-platform ID collisions.
- Added synthetic publication test for qualified Reddit fallback/metadata and isolated SQL citation collision coverage. No UI changes; existing faithful cards render these snapshots. No live source/inference requests or edition writes.
- Initial direct targeted command was correctly refused by test-isolation guard. First full check found a test assertion expecting empty citation metadata with no stories; corrected to absent metadata.
- `pnpm format`, `pnpm lint:fix`, final `pnpm check` passed (177 tests); `pnpm build` passed. Updated TASKS/SOURCES. No browser check needed for pipeline-only change.
- Restarted API/worker; health DB/Redis true, 32 sources/no current errors and all queue workers present; latest real edition retains four topics/20 stories/10 X posts.
- Read-only timing report unchanged: 856 ms non-AI edition, 481910 micros spent/848 available; next Nov 3 15:00 UTC. Live AI latency remains unverified.
- Reddit remains blocked/unscheduled, with no real Reddit content. Next: real collection/publication evidence when legitimate access permits; five prior community observations required. Proceed to next unblocked owner priority meanwhile.

## 2026-11-02: iteration 177 — per-topic live coverage on Status

- Started clean on main; no leftover work. Health/services healthy, 32 sources/no current errors, all workers present; two historical ingestion failures retained.
- Added rolling 24-hour distinct article and verified X/Reddit counts by publication time, connected feeds and feeds healthy in the past hour. Includes paused topics; excludes undated posts/unverified citations. Counts describe collection scope, not relevance.
- Isolated SQL fixture test covers duplicate observations/citations, platform ID collisions, window edges, undated/unverified posts, source health and paused/empty topics; rolls back. Fixed ambiguous fixture column after first test run failed.
- `pnpm format`, `pnpm lint:fix`, final `pnpm check` passed (178 tests), `pnpm build` passed. Earlier checks caught formatting while new script/archive were being written; final run clean.
- Restarted API/worker; `pnpm exec tsx scripts/smoke-topic-coverage.ts` passed read-only desktop/mobile checks with screenshots; inspected mobile. `/healthz` DB/Redis true, all workers present, latest edition four topics/20 stories/10 X posts.
- Live 15:38 UTC baseline (articles/X/Reddit): Tech 198/34/0, NBA 74/35/0, Gaming 188/22/0, World 174/9/0. All 32 feeds healthy. NBA weakest in articles, World weakest in X. No new sources, inference calls or edition writes.
- Updated TASKS/SOURCES and item 10 acknowledgment; archived iterations 163–164 to keep PROGRESS below 25 KB.
- Next: legitimate Reddit access/publication evidence and live AI latency remain blocked; item 9 paid scheduling follows Reddit per owner order. Coverage now informs the next source/discovery decision.

## 2026-11-02: iteration 178 — bound explicit development inference

- Started clean on main; health/services and queues healthy, 32 sources. No leftover work. Higher priorities remain blocked on legitimate Reddit access and live AI timing budget (848 micros available).
- Three Anthropic live smoke entrypoints now require LLM_LIVE=1 before opening DB connections. Their ledger reservations, including repairs/editor fallback, use purpose=verification.
- Added serialized $0.05 UTC-day verification cap across processes, stricter than the owner per-iteration ceiling; pending/uncertain calls retain holds across days, known failures release funds. Normal digest/model caps still apply.
- Isolated tests cover opt-in rejection, concurrent ledger instances, exact cap, settlement, uncertainty rollover/resolution and ordinary digest allowance. No live inference/source requests or edition/settings writes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (180 tests); `pnpm build` passed. No UI change; no browser check required.
- Restarted API/worker; `/healthz` DB/Redis true, all workers available/no retained failed queue jobs. Latest real edition four topics/20 stories/10 X posts; remaining app budget unchanged.
- Updated TASKS and docs/LLM. Separate verification spend on Status, fingerprinted replay and guarding historical recording entrypoint remain open; Reddit/AI timing blockers unchanged.

## 2026-11-02: iteration 179 — guard historical paid recording

- Started clean on main; no leftover work. Health/services healthy, 32 sources/no current errors; two historical ingestion failures retained, no failed digest/social jobs.
- Historical editorial recorder now requires LLM_LIVE=1 before DB/file work and uses verification-mode ledger for triage, editor, repair and fallback; shared $0.05/day cap and normal app caps apply. Existing snapshots remain immutable.
- Extended subprocess refusal test to recorder with invalid DB URL/no provider key; tests use disposable services/fakes, no paid calls or live configuration/content writes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (180 tests); `pnpm build` passed. No UI changes; no browser check needed.
- Restarted API/worker; retry reached healthy `/healthz` (DB/Redis true); latest real edition retains four topics/20 stories/10 posts. Available app budget remains 848 micros.
- Updated TASKS/docs/LLM; archived iteration 165 to keep PROGRESS below 25 KB. No source changes.
- Next: fingerprinted LlmPort replay and separate verification spend on Status. Reddit access/live AI timing remain blocked; scheduled xAI follows Reddit per owner order.

## 2026-11-02: iteration 180 — show AI spend by purpose

- Started clean on main; no leftover work. API/worker, health and 32 sources healthy; two historical ingestion failures retained, no failed digest/social jobs.
- Status shows UTC-day/month spend and unresolved reservations per ledger purpose, including development verification. Historical tags stay visible with an explicit warning that older development/editorial spend cannot reliably be separated.
- Isolated transactional test covers mixed purposes, failed calls, old uncertain holds, expired settled calls and reconciliation to overall totals. Existing app/model budgets unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (181 tests); `pnpm build` passed. `pnpm exec tsx scripts/smoke-ai-spend.ts` passed read-only desktop/mobile checks; screenshots saved and mobile inspected.
- Restarted API/worker; `/healthz` database/Redis true. Read-only timing report confirms latest real edition four topics/10 posts; available budget unchanged at 848 micros. No inference, settings writes or source changes.
- Updated TASKS/docs/LLM. Next: fingerprinted LlmPort replay; legitimate Reddit access/live AI timing remain blocked, paid xAI scheduling follows Reddit.

## 2026-11-02: iteration 181 — fingerprinted offline LLM replay

- Started clean on main; no leftover work. API/worker, health, 32 sources and queues available. Higher priorities still await legitimate Reddit access and live AI timing budget (848 micros available).
- Extracted unchanged production cache fingerprint and added fail-closed replay plus response-recording LlmPort adapters. Repeated requests replay in order; changed prompts/models fail without network fallback.
- Guarded historical recorder now saves raw successful responses/model/fingerprint to new fixtures even when later validation fails; preserves opt-in, verification cap and existing snapshot refusal. No keys/headers/request text/provider errors recorded.
- Added explicitly synthetic transport fixture; no paid recording or inference. Full editorial golden wiring to raw recordings remains open; older validated snapshots cannot faithfully supply transport responses.
- Targeted `pnpm exec tsx --test apps/api/test/recorded-llm.test.ts apps/api/test/llm.test.ts` passed (23 tests). Fixed replay method lint error before final checks.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (184 tests); `pnpm build` passed. No UI changes; no browser check needed.
- Restarted API/worker; `/healthz` DB/Redis true. Read-only `scripts/report-edition-timing.ts`: latest real scheduled edition four topics/10 X posts; spend unchanged. No settings/content writes or source changes.
- Updated TASKS/docs/LLM; archived iteration 167 to keep orientation small. Next: full editorial fixture replay; Reddit/live AI timing blockers unchanged, scheduled xAI follows Reddit per owner order.

## 2026-11-02: iteration 182 — article publication transport replay

- Started clean on main; no leftover work. API/worker and health healthy; 32 sources and all queues available, no retained failed jobs.
- Added authored synthetic raw triage/editor responses and frozen topic golden. Replaying LlmPort now traverses real budgeting, triage, editor validation and publication mapping with fake ledger/SQL; two fresh-cache runs match all topic fields and retain progress/commit assertions.
- This is article-path synthetic coverage, not real provider recordings, social selection or SQL integration. No prompt changes, re-recordings, paid inference, live content/settings writes or source changes.
- First direct targeted run hit the existing isolation guard; rerun with isolated flag and invalid DB URL passed 7/7 without connecting. Full disposable-service suite passed 185/185.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build` passed; no UI changes/browser check needed.
- Restarted API/worker; healthy `/healthz` DB/Redis true. Read-only timing report: latest real edition four topics/10 posts; available app budget unchanged at 848 micros.
- Updated TASKS/docs/LLM. Next: real raw-response golden coverage when legitimately captured; Reddit access/live AI timing still blocked, scheduled xAI follows Reddit per owner order.

## 2026-11-02: iteration 183 — Testcontainers verification infrastructure

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without current errors, all queues available; two historical ingestion failures retained, no failed digest/social jobs.
- Higher priorities remain blocked: real AI latency has only 848 micros available; Reddit access remains denied. No paid calls or live settings/content writes.
- Replaced manual Docker lifecycle with Testcontainers PostgreSQL 17/Redis 7 matching compose, fresh migrations/seeds, readiness waits, cleanup and resource reaper.
- Added separate `pnpm test:unit` (99 tests, no Docker, database access blocked) and `pnpm test:integration` (86 tests, disposable services); `pnpm test`/`check` include both. Both clear inference keys and live opt-in; mixed files remain integration.
- Targeted commands passed 99/99 and 86/86. `pnpm format`, `pnpm lint:fix`, `pnpm check` passed all 185 tests; `pnpm build` passed. Temporary database/Redis containers removed; no UI changes/browser check needed.
- Updated README/TASKS; archived completed speed detail to keep TASKS under 8 KB. STEERING 2a is partial: full repository/HTTP characterization, golden SQL edition and coverage reporting remain before ORM work.
- Restarted API/worker after build; `/healthz` DB/Redis true. Read-only timing report confirms latest real scheduled edition four topics/10 X posts; budget unchanged. No source changes.
- Next: expand repository/HTTP characterization while Reddit/live AI evidence is blocked; scheduled xAI still follows Reddit per owner order.

## 2026-11-02: iteration 184 — production-module HTTP characterization

- Started clean on main; no leftover work. API/worker/health healthy, all 32 sources recently successful, no digest/social failures; two retained historical ingestion failures unchanged.
- Higher priorities still blocked by Reddit access and live AI timing budget (848 micros available). No paid inference, live content/settings writes or source changes.
- Extracted the unchanged production Nest module from bootstrap so HTTP tests boot the same app on an ephemeral loopback port. Integration runner builds API first to preserve Nest constructor metadata.
- Added HTTP characterization for healthy DB/Redis, topic create/read/update/delete, JSON fields, reorder/position closure, catalog/connections, missing/invalid IDs and atomic rejected writes.
- Profile HTTP tests persist an Asia/Kolkata schedule and budgets, reject invalid timezone/window/budget changes without mutation and restore fixture settings. App shutdown is registered even on assertion failure.
- `pnpm test:integration` passed 87/87; `pnpm format`, `pnpm lint:fix`, full `pnpm check` passed 99 unit/87 integration tests; `pnpm build` passed. No UI changes/browser check needed.
- Updated README/TASKS; archived iterations 169–170 to keep orientation small. STEERING 2a remains partial; digest/edition HTTP, remaining repository characterization and database coverage precede ORM work.
- Restarted API/worker; `curl /healthz` DB/Redis true, SPA HTTP 200 and `/api/status` all queues available. Latest real edition still has four topics/10 X posts; source successes remain current. Read-only timing report confirms spend unchanged.
- Next: digest/edition HTTP characterization and remaining repository-port coverage; Reddit/live AI evidence blockers unchanged, scheduled xAI still follows Reddit per owner order.

## 2026-11-02: iteration 185 — digest and edition HTTP characterization

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without current errors, no failed digest/social jobs; two historical ingestion failures unchanged.
- Added production-module HTTP tests against disposable Postgres/Redis for synchronous publication, retrieval/latest/history offsets, rejected windows/IDs/offsets and preservation of earlier snapshots.
- A real BullMQ worker calls the real repository: overlapping HTTP creation requests dedupe, complete, expose duration/edition ID and publish retrievable immutable editions. Empty historical content fixes transport/persistence behavior; this is not a nonempty editorial golden.
- `pnpm test:integration` passed 88/88; typecheck passed. Initial lint found an assertion style issue (fixed); a check then caught formatting in the newly archived progress entries (fixed).
- No paid inference, live settings/content writes, source changes or UI changes; browser verification unnecessary. Updated README/TASKS and archived iterations 171–172 to keep orientation small.
- Final `pnpm format`, `pnpm lint:fix`, `pnpm check` (99 unit/88 integration) and `pnpm build` passed. Restarted API/worker; health DB/Redis true, SPA 200, all queues available and 32 sources without errors; latest real edition retains four topics/10 X posts.
- Next: remaining repository characterization, nonempty SQL golden and database coverage before ORM work. Reddit access/live AI timing blockers persist; scheduled xAI follows Reddit.

## 2026-11-02: iteration 186 — ingestion repository characterization

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without errors, queues available; two historical ingestion failures unchanged.
- Added disposable-Postgres characterization of connected/enabled source eligibility, empty/latest views, shared observations, URL dedupe, five-item order/limit and betting exclusion.
- Pinned timezone normalization, stable item identity, title/excerpt updates and merged engagement JSON while original author/image/publication time persist.
- Covered 300-character failure truncation, preserved last success, atomic batch rollback of inserts and existing updates, empty-store recovery and disabled-topic visibility. Assertions use repository methods; SQL only seeds/cleans fixtures and inspects fields lacking public readers.
- `pnpm test:integration` passed 89/89; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (99 unit/89 integration) and `pnpm build` passed. No paid inference, live mutations, source or UI changes; browser verification unnecessary.
- Read-only timing report confirms 848 micros available and latest real edition four topics/10 X posts; 856 ms fallback run is not live AI latency evidence. Reddit denial remains unresolved; paid scheduling follows Reddit.
- Restarted API/worker; health DB/Redis true, SPA 200, all four queues available and 32 sources without errors. Updated README/TASKS. Next: remaining repository characterization, nonempty SQL golden and database coverage before any ORM swap.

## 2026-11-02: iteration 187 — Reddit observation characterization

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without errors; two historical ingestion failures unchanged.
- Disposable-Postgres tests pin inclusive seven-day lookback, exclusive end, timezone normalization, timestamp tie ordering, shared-topic dedupe and case-insensitive community aggregation.
- Covered disabled/removed communities, write-time association checks, topic deletion isolation and rollback of existing metadata, new posts and X citations after a later invalid insert.
- Initial integration run caught an overlong synthetic Reddit ID; corrected to the schema limit. Full `pnpm check` passed 99 unit/90 integration tests; `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` passed.
- Restarted API/worker; health DB/Redis true, SPA 200, all queues available, no current source errors. Latest real edition has four topics/10 posts. No paid inference, live mutations or UI changes.
- Updated README/TASKS. Next: remaining repository coverage, nonempty SQL golden and database coverage before ORM work. Reddit access/live AI timing blockers persist; paid scheduling follows Reddit.

## 2026-11-02: iteration 188 — publisher citation transaction characterization

- Started clean on main; no leftover work. API/worker/health healthy, 32 sources without errors; two historical ingestion failures unchanged.
- Added disposable-Postgres publisher coverage for shared-topic candidate dedupe, enabled/deleted topic connections, removed opt-in hosts and stale-candidate writes.
- Pinned engagement JSON, verification URL updates and stable first-seen provenance. A fixture-only final-write constraint failure proves citation inserts/updates and check state roll back together; successful retry recovers.
- Initial integration run found fixture cleanup violating an observation FK and contaminating a later count; fixed cleanup order. A full check caught new archive formatting; corrected. Final `pnpm check` passed 99 unit/91 integration tests.
- Updated README/TASKS and archived iterations 173–174 to keep PROGRESS below 25 KB. No paid inference, live settings/content writes or UI changes; browser verification unnecessary.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` passed. Restarted API/worker; health DB/Redis true, SPA 200, queues available and no current source errors; latest real edition retains four topics/10 posts.
- Next: remaining repository coverage, nonempty SQL golden and database coverage before ORM work. Reddit access/live AI timing blockers persist; paid scheduling follows Reddit.

## 2026-11-02: iteration 189 — X-search repository characterization

- Started clean on main; no leftover work. API/worker/health healthy, all 32 sources without current errors and queues available.
- Added disposable-Postgres coverage for current guidance/account JSON, zero-post budgets, call/post dedupe, first-write topic/URL provenance, shared-topic eligibility and deletion with retained call history.
- Pinned foreign-key rejection and atomic partial-batch rollback/recovery using a fixture-only final-row constraint. Assertions use repository readers; SQL sets up fixtures and cleans them up.
- `pnpm test:integration` passed 92/92; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (99 unit/92 integration), `pnpm build` and `git diff --check` passed.
- Updated README/TASKS. No paid inference, live settings/content writes or UI changes; browser verification unnecessary.
- Restarted API/worker; health DB/Redis true, SPA 200, all queues available, 32 sources without current errors and latest edition four topics/10 posts. Next: remaining repository characterization, nonempty SQL golden and database coverage before ORM work. Reddit access/live AI timing blockers persist; paid scheduling follows Reddit.
