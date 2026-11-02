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

## 2026-11-02: iteration 171 — Reddit citations enter official X pipeline

- Started clean on main; no leftover work. API/worker/health healthy; 32 sources/no current errors, zero failed digest/social jobs; two historical ingestion failures retained.
- Migration 039 adds deduplicated per-Reddit-post X evidence with citing score, author verification URL and cascading cleanup; storage replaces citations transactionally on edits.
- Reddit citations now feed bounded X verification, topic association and existing X selection. Community breadth is not independence/virality; scores are retained, not inferred as tweet engagement. Only officially verified X posts can be selected.
- Extended synthetic isolated tests cover score refresh, repeat links, no premature verification, topic isolation, X selection, edited-away links and rollback. Reddit access remains blocked; collection unscheduled; no live HTTP/inference used.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (171 tests, types/lint/format/boundaries) and `pnpm build` passed; documentation formatting rechecked after updates. No UI changes.
- `pnpm migrate` applied 039; restarted API/worker; `/healthz` DB/Redis true, status 32 sources/no errors and all queue workers present. Timing report initially raced restart, then passed: unchanged 856 ms fallback edition/four topics, 481910 micros spent/848 available; next Nov 3 15:00 UTC.
- Updated README/TASKS/SOURCES; archived oldest progress entry to keep orientation compact. Next: Reddit ranking/cards; real Reddit content and live AI latency remain blocked/unverified.

## 2026-11-02: iteration 172 — conservative Reddit ranking preparation

- Started clean on main; no leftover work. Health/API/worker healthy, 32 sources/no errors, zero digest/social failures; two historical ingestion failures retained.
- Added a bounded Reddit observation repository port/read and application shortlist, rechecking enabled topics/current communities and excluding X wrappers from Reddit picks.
- Domain ranking requires five prior-week subreddit observations, >=2× median score and lifetime score/hour, score >=10 and ratio >=0.7; deterministic order and bounded results, no sparse-evidence padding.
- Lifetime score/hour is a one-snapshot proxy, not measured growth; historical top-listing cohorts are biased. Thresholds are provisional, not live-validated virality claims.
- Preparation stays unpublished pending platform-aware contracts/editorial/X preference and faithful cards. Reddit remains blocked/unscheduled; no live HTTP/inference or UI changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (173 tests); added application-port test afterward and reran three targeted ranking tests, typecheck, lint, boundaries and production build successfully.
- Isolated repository tests cover metadata/timestamps, X citation presence, topic isolation and removed-community filtering. Domain tests cover relative strength, sparse/duplicate/unsafe/future evidence and budget limits.
- Restarted API/worker; `/healthz` DB/Redis true, status all queue workers present. Read-only timing report unchanged: 856 ms fallback/four topics, 481910 micros spent/848 available; next Nov 3 15:00 UTC.
- Updated TASKS/SOURCES/RANKING and archived oldest progress entry. Next: platform-aware publication and faithful Reddit cards; real content and live AI timing remain blocked/unverified.

## 2026-11-02: iteration 173 — platform-aware social editorial boundary

- Started clean on main; no leftover work. Health/API/worker healthy, 32 sources/no current errors, no failed digest/social jobs; two historical ingestion failures retained.
- Added generic editorial candidates preserving platform metadata, namespaced Reddit triage IDs and platform-aware v2 editor instructions/cache purpose; existing X IDs stay unchanged.
- Shortlist retains qualifying X first; enforced ~70% X reservation bounded by available qualifying X, strong Reddit fills remaining slots, declined X leaves gaps. Fallback also preserves X preference.
- Synthetic fake tests cover overlapping IDs, higher-scored Reddit pressure, sparse/no X, fallback caps and no padding. No live HTTP/inference used; Reddit access blocked/collection unscheduled.
- Publication/snapshot contracts remain X-only pending faithful Reddit cards and publication wiring; this boundary alone publishes no Reddit content. No UI change/browser check needed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (175 tests, types/lint/format/boundaries); `pnpm build` passed. Updated TASKS/SOURCES/RANKING; archived oldest progress entries.
- Restarted API/worker; `/healthz` DB/Redis true; `/api/status` 32 sources/no errors, all queues have workers. Read-only timing report unchanged: 856 ms fallback edition/four topics, 481910 micros spent/848 available; next Nov 3 15:00 UTC. Live AI latency remains unverified.
- Next: connect conservative Reddit shortlist to platform-aware snapshots/publication and faithful cards; real content remains blocked by public access denial.

## 2026-11-02: iteration 174 — immutable Reddit card snapshot preparation

- Started clean on main; no leftover work. API/worker and health healthy; status has 32 sources and all queue workers present.
- Added a separate validated Reddit snapshot contract and ranked-shortlist converter preserving title/body, community, thumbnail, destination, metrics and observation time. Ranking now retains observation timestamps.
- Schema parsing copies nested evidence, preventing later source refreshes from changing prepared snapshots. Synthetic test covers metadata, mutation isolation and malformed timestamp/metric rejection.
- Published edition contract remains X-only until faithful cards and platform-aware publication are connected. Reddit remains blocked/unscheduled; no live HTTP or inference calls, no UI changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed (176 tests, types/lint/format/boundaries); `pnpm build` passed. Updated TASKS/SOURCES.
- Restarted API/worker; `/healthz` DB/Redis true, 32 sources and all queue workers present. Read-only timing report: unchanged 856 ms fallback edition, 481910 micros spent/848 available; next Nov 3 15:00 UTC. Live AI latency unverified.
- Next: faithful Reddit cards and publication wiring; real Reddit content remains blocked by public access denial.

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
