# Progress

Earlier entries: [pre-3166 archive](docs/progress-archive/2026-11-21-pre-3166.md).

Earlier entries: [3166–3173 archive](docs/progress-archive/2026-11-21-3166-3173.md).

## 2026-11-21: iteration 3174 — ship Why this; record incomplete developing acceptance

- Clean main at f70b994e; no inherited work. Health/database/Redis pass; zero alerts; 37 active sources healthy, Destructoid intentionally inactive; no failed digest runs.
- Item 72 one-time check: eight matcher cache misses; no model output/semantic acceptance. Existing manual memberships replay once: eight cases/eight links/twelve earlier-current headline pairs, listed in STEERING ack.
- Budget correction: summed normal dispatch reservations + captures ($1.839375) overstate sequential work and cannot prove a cap failure; rejected that envelope as an acceptance measure.
- Existing developingEditionBudget with settled normal spend + supplied feature captures peaks at $0.613774 against $0.65; incomplete topic/evidence coverage prevents whole-day acceptance. Developing stays disabled; NEEDS_FROM_HUMAN records blocker. No new references, scripts or fixtures for developing; no paid calls/cap changes.
- With developing acceptance incomplete, moved to Why this: public projection derives only saved Editor rationale; native collapsed disclosure under stories/posts, blank/missing reasons omitted. Existing saved editions untouched; scores, semantic/ranking reasons and operational fields stay private.
- Projection tests cover stories/X/Bluesky/Reddit, omitted historical reasons and immutable inputs: 11 pass. Updated owner and reader handbooks.
- Live Playwright: Nov 20 edition 9c810e64, 390/1440 light/dark, story/post text matches saved rationale; keyboard/click toggles, collapsed defaults, no horizontal overflow/page errors. Eight screenshots; mobile story/post inspected.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx scripts/check-handbook.ts edition-pipeline --owner-services; pnpm exec tsx scripts/check-reader-why-this.ts; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; git diff --check.
- Build/handbook/live reader pass (five topics/25 stories/20 posts); API/worker/reader-docs restarted healthy. Full check results below. Logs /tmp/3174-check-fixed.log and /tmp/3174-{build,handbook,ui,reader}.log; offline receipt /tmp/3174-acceptance.json.
- Integration caught undefined optional reason keys disappearing over JSON; fixed by omitting absent reasons, with explicit regression assertions. Initial full command interrupted; final check runs in a temporary systemd user unit.
- Final pnpm check passes: 1,338 unit tests, 336 integration passes/four expected skips; static checks green. API rebuilt after absent-field fix; repeated live UI checks pass (/tmp/3174-ui-final.log).
- Next: Nov 21/22 scheduled recall/v16 review, then largest miss-cause fix; item 70 next feature is week in review. Stop historical developing controls.

## 2026-11-21: iteration 3175 — week in review published input selection

- Clean main at f1a08447; no inherited work. Zero alerts; health/database/Redis pass; active sources healthy, Destructoid intentionally inactive; zero failed digest runs.
- Nov 21 review awaits 15:00 UTC; item 69 evaluation commit already used. Started next item 70 feature without provider calls or cap changes.
- Weekly input selects published daily coverage windows in (Sunday 17:00 UTC minus seven days, Sunday 17:00 UTC], including Sunday's daily. Latest published regeneration per coverage window wins; removed topics do not revive old versions.
- Excludes unpublished, test, weekly, future and other-profile editions; copies saved stories/posts with edition provenance, preserving source snapshots. No raw candidates, ranking or truncation. Scheduling/editor/storage/history UI remain unconnected; feature is not reader-visible.
- Four focused tests pass: UTC/window boundaries, selection/provenance preservation, deep-copy isolation, publication/profile filters and regeneration behavior.
- Read-only saved-publication smoke passes all five topics, five daily editions each: 25 stories/topic and 19/22/17/22/19 posts; exact equality to saved selections. Current partial week only; no model or weekly editorial acceptance claimed.
- Live scheduled-reader gate passes Nov 20 edition 9c810e64: five topics/25 stories/20 posts. Logs /tmp/3175-{targeted,saved-input,reader,sources,jobs}.log.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx --test apps/api/test/weekly-review-input.test.ts; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z. Final verification/restart results below.
- Next: Nov 21/22 edition reviews first; weekly editor and budget admission, persistence/history separation, Sunday scheduling and reader acceptance remain.
- Final pnpm check passes: 1,342 units, 336 integrations/four expected skips; typecheck/lint/format/boundaries green. pnpm build and git diff --check pass. API/worker restarted active; health/database/Redis and repeated live reader pass; zero alerts. Archived pre-3166 progress to keep this file small.

## 2026-11-21: iteration 3176 — week in review editor contract

- Clean main at fc636df7; no inherited work. Zero alerts; health/database/Redis pass; 37 active sources fresh with no errors; zero digest failures in 24 hours. Nov 21 daily review awaits 15:00 UTC.
- Added weekly editor evidence from saved daily stories/posts, using opaque per-edition item references so recurring story IDs retain separate daily provenance. Private scores/reasons are excluded.
- Validated weekly output permits zero to five summaries, each supported by at least one daily story; posts may supplement coverage. Unknown, repeated or reused references and malformed output reject the entire result. Saved snapshots remain untouched.
- This is structural/provenance validation, not semantic acceptance. No provider calls, budget changes, scheduling or production editing enabled. Updated reader feature plan and TASKS; no live flow/schema change.
- Three focused tests pass: cross-day coverage/immutability/private metadata, atomic fabricated/reused/post-only rejection, and output bounds/strict shape.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx --test apps/api/test/weekly-review-editor.test.ts; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; git diff --check. Final results recorded below.
- Live reader passes Nov 20 edition 9c810e64: five topics/25 stories/20 posts. Read-only failure query initially used created_at; corrected to failed_at and returned zero. Logs /tmp/3176-{targeted,reader,check,build}.log.
- Initial boundary check rejected Zod in the domain layer; moved the editor contract to application and reran full checks.
- Next: Nov 21/22 edition reviews first; connect a budgeted single weekly editor call, then persistence/history separation, Sunday scheduling and reader acceptance. Developing remains blocked/disabled.
- Final pnpm check passes: 1,345 units, 336 integrations/four expected skips; all static checks green. Build and git diff --check pass. API/worker restarted active; health/database/Redis, repeated live reader and zero alerts pass.

## 2026-11-21: iteration 3177 — budgeted weekly editor execution

- Clean main at fa3283cf; no inherited work. Zero alerts; health/database/Redis pass; all active sources healthy, Destructoid intentionally inactive. Daily review awaits 15:00 UTC.
- Added weekly execution through the existing budgeted LLM, model configuration and durable cache. One Sonnet attempt per topic; no repair, alternate-model fallback, paid replay or cap changes. Empty daily story input makes no call.
- Prompt uses saved daily evidence only, groups recurring events and asks for chronological developments with attribution. Raw references are cached and validated again on cache hits; invalid/unknown coverage rejects atomically and daily snapshots remain unchanged.
- Five targeted tests pass, including real BudgetedLlm with fake provider/ledger for reservation, settlement, cache reuse, refusal and invalid output. No semantic/model acceptance claimed.
- Production trigger, weekly persistence/history and Sunday scheduling remain unconnected. Updated reader feature plan and TASKS; no live flow/schema change.
- Source check and live Nov 20 reader pass (five topics/25 stories/20 posts). Job snapshot: zero failed digest jobs; historical ingestion/social failures retained, current sources healthy. Private job-state filtering unavailable in public mode; used queue counts.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx --test apps/api/test/weekly-review-editor.test.ts; pnpm exec tsx scripts/check-handbook.ts; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; git diff --check. Results below.
- Next: Nov 21/22 reviews first; weekly persistence/history separation, then Sunday scheduling and live reader acceptance. Developing remains blocked/disabled.
- Final pnpm check passes: 1,347 unit tests, 336 integration passes/four expected skips; all static checks green. Build/handbook/diff checks pass. API/worker restarted active; health/database/Redis, repeated live reader and zero alerts pass. Logs /tmp/3177-{check,build,handbook,targeted-final,reader-final,alerts-final}.log.

## 2026-11-21: iteration 3178 — PostgreSQL weekly input loading

- Clean main at 1eba5feb; no inherited changes. Zero alerts; health/database/Redis pass; active sources healthy, Destructoid intentionally inactive. No failed digest jobs; Nov 21 review awaits 15:00 UTC.
- Connected the weekly saved-input selector to PostgreSQL: explicit profile, scheduled publication, seven-day coverage bounds and publication cutoff; latest saved regeneration and Sunday daily inclusion retained. Invalid slots reject before querying.
- Isolated database regression covers old/new regenerations, exact lower boundary, future coverage/publication, private/test/manual/foreign exclusions, missing topics, profile selection and immutable saved text. No migrations or live publication writes.
- Read-only live smoke loads five published daily editions per topic, 25 stories each and 19/22/17/22/19 posts. This is the current partial week, not weekly editorial acceptance. No provider calls or cap changes.
- Live Nov 20 reader passes: edition 9c810e64, five topics/25 stories/20 posts. Weekly generation, persistence/history separation and Sunday scheduling remain unconnected; developing disabled.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx scripts/check-handbook.ts; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; read-only adapter smoke; git diff --check. Final results below.
- Next: Nov 21/22 reviews first, then weekly persistence/history separation and Sunday scheduling. Logs /tmp/3178-{check,build,handbook,saved-input,reader,sources,jobs}.log.
- Final pnpm check passes: 1,347 units, 337 integrations/four expected skips; all static checks green. Build/handbook/diff checks pass. API/worker restarted active; health/database/Redis, repeated live reader and zero alerts pass.

## 2026-11-21: iteration 3179 — weekly publication workflow

- Clean main at 8e3a8b72; no inherited work. Zero alerts; health/database/Redis and API/worker active. Nov 21 review awaits 15:00 UTC.
- Added weekly publication orchestration connecting saved input loading and the budgeted editor to an atomic storage port. Requires Sunday's published daily first; quiet topics make no call; refusal/invalid output or exceptions never save a partial weekly edition.
- Generation-key retries return the saved snapshot without editing; regeneration uses a new key. Snapshot includes weekly kind, profile, bounds and daily provenance; never invokes daily generation/latest. Database adapter, history and scheduling remain unconnected.
- Four focused tests pass with real weekly editor/fake provider and in-memory storage: provenance, quiet topics, retry/regeneration immutability, daily prerequisite, partial failures, invalid requests/bounds and exception propagation. No paid calls or model acceptance claimed.
- Updated reader feature plan and TASKS; no schema or live flow changes. Live Nov 20 reader passes: 9c810e64, five topics/25 stories/20 posts.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx --test apps/api/test/generate-weekly-review.test.ts; pnpm exec tsx scripts/check-handbook.ts; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; git diff --check. Final checks below.
- Full handbook run hit local-tool HTTP 429; filtered retry (`04-edition-pipeline`) passes: 19 pages/one diagram/39 tables. Sources pass (Destructoid intentionally inactive); jobs snapshot has zero digest failures. Initial queue name `digest` was rejected; corrected with unfiltered jobs snapshot.
- Next: Nov 21/22 reviews first; weekly database publication adapter/history separation and Sunday scheduling. Developing remains blocked/disabled. Logs /tmp/3179-{targeted,check,build,handbook-retry,reader,sources,jobs}.log.
- Final pnpm check passes: 1,350 units and 337 integration passes/four expected skips; all static checks green. Build, filtered handbook and diff checks pass.

## 2026-11-21: iteration 3180 — durable weekly publication storage

- Clean main at 74a0dd73; no inherited work. Zero alerts; health/database/Redis and active sources pass; no failed digest jobs. Nov 21 review awaits 15:00 UTC.
- Added Drizzle migration/schema for separate immutable weekly publications, unique generation keys and profile/history indexing. Daily latest/history remain isolated; no scheduled weekly calls enabled.
- PostgreSQL adapter persists all topic snapshots together, handles concurrent retry conflicts, preserves regeneration versions and checks Sunday’s published scheduled daily at the cutoff. Input loading delegates to the existing saved-input reader.
- Isolated database regression covers concurrent retries, regeneration, immutability, atomic constraint failure, quiet-topic snapshots, daily-reader isolation and private/manual/late/foreign daily exclusions. No provider calls.
- Updated reader feature plan, affected handbook pages and schema metadata. Initial handbook check caught page limits and unapplied schema; shortened prose before final verification.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm --filter @digest/api exec drizzle-kit generate --name weekly_publications; pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; git diff --check. Final results below.
- Next: Nov 21/22 reviews first, then production wiring, weekly history labels and Sunday scheduling. Developing remains blocked/disabled. Logs /tmp/3180-{check,build,handbook,reader,sources,jobs}.log.
- Final pnpm check passes: 1,350 units, 338 integration passes/four expected skips; all static checks green. Build/diff checks pass. Migration applied live; final handbook (`--owner-services`) passes 19 pages/21 diagrams/40 tables without warnings. API/worker restarted active; health/database/Redis, live daily reader (five topics/25 stories/20 posts) and zero alerts pass.

## 2026-11-21: iteration 3181 — production weekly generation entry point

- Clean main at c6515712; no inherited work. Zero alerts; health/database/Redis and active sources pass; no failed digest jobs. Nov 21 review awaits 15:00 UTC.
- Connected PostgreSQL weekly generation to saved daily input loading, atomic immutable storage and the existing shared budgeted Sonnet editor. Lazy editor creation keeps prerequisite waits, quiet topics and saved retries free of provider construction; missing credentials/refusal publishes nothing.
- Extended isolated PostgreSQL regression through the real input reader, weekly editor and storage with a fake provider: daily provenance/model retained, quiet topic skipped, one edit, retry reuse, refusal and missing-key atomicity, credential-free quiet publication. No paid calls or scheduled jobs enabled.
- Updated reader feature plan, affected pipeline handbook and TASKS. Weekly reader history and Sunday scheduling remain unfinished; developing stays blocked/disabled.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; pnpm obs alerts/sources/jobs; git diff --check. Final results below.
- Handbook passes: 19 pages/one unchanged diagram/40 tables. Live Nov 20 reader passes: 9c810e64, five topics/25 stories/20 posts. Logs /tmp/3181-{check,build,handbook,reader,sources,jobs}.log.
- Next: Nov 21/22 reviews first; weekly history labels and Sunday scheduling.
- Final pnpm check passes: 1,350 units, 338 integrations/four expected skips; static checks, build, filtered handbook and diff checks pass. API/worker restarted active; health/database/Redis, repeated live daily reader and zero alerts verified. No migrations or paid calls.

## 2026-11-21: iteration 3182 — weekly storage history

- Clean main at 893cdcad; no inherited work. Zero alerts; health/database/Redis and active sources pass; no failed digest jobs. Nov 21 review awaits 15:00 UTC.
- Added explicitly profile-scoped weekly ID lookup and bounded history pagination. Coverage end, publication time and ID provide stable newest-first ordering; regeneration versions remain available and daily latest is unchanged.
- Extended isolated PostgreSQL regression for scoped lookup, absent IDs/profiles, pagination boundaries/repeatability, immutable read copies and invalid pagination. Reader routes/UI and Sunday scheduling remain unconnected; no paid calls.
- Updated reader feature plan, pipeline handbook and TASKS. No schema change or diagram change.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; pnpm obs alerts/sources/jobs; git diff --check. Final results below.
- Build and handbook pass (19 pages/one unchanged diagram/40 tables); live Nov 20 reader passes with five topics/25 stories/20 posts. Logs /tmp/3182-{check,build,handbook,reader,sources,jobs}.log.
- Next: Nov 21/22 reviews first, then weekly reader routes/labels and Sunday scheduling. Developing remains blocked/disabled.
- Final pnpm check passes: 1,350 units, 338 integrations/four expected skips; static checks, build, handbook and diff checks pass. Archived iterations 3166–3173 to keep PROGRESS small. API/worker restart and final live checks follow.

## 2026-11-21: iteration 3183 — public weekly reader API

- Clean main at abff786b; no inherited work. Zero alerts, healthy health/database/Redis and all active sources; no failed digest jobs. Nov 21 review awaits 15:00 UTC.
- Added public weekly history and UUID detail endpoints, explicitly scoped to null-profile publications. Strict response contracts expose weekly summaries, quiet topics and saved daily coverage links while removing profile, model, opaque references and evidence text. Daily latest/history remain separate.
- Shared the existing PostgreSQL daily input repository through a Nest alias; weekly reads use the saved publication adapter. No generation trigger, scheduled jobs, paid calls or fabricated live weekly content.
- Added projection/scope, admission and real Nest HTTP regressions for UUIDs, offset bounds, missing IDs, HEAD, no-store and unsupported writes. Three targeted tests pass. Updated reader plan and affected pipeline handbook; UI and Sunday scheduling remain unfinished.
- Commands: pnpm format; pnpm lint:fix; pnpm build; pnpm check; pnpm exec tsx --test apps/api/test/reader-weekly.test.ts; pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline; pnpm obs alerts/sources/jobs; git diff --check. Full-check and restart results follow.
- Build/typecheck and handbook pass (19 pages/one unchanged diagram/40 tables); logs /tmp/3183-{check,build,target,handbook,sources,jobs}.log.
- Next: Nov 21/22 reviews first, then weekly reader UI/history labels and Sunday scheduling. Developing remains blocked/disabled.
- Final pnpm check passes: 1,353 units, 338 integrations/four expected skips; all static checks green. API/worker restarted active; health/database/Redis, Nov 20 daily reader and zero alerts pass. Weekly live local history is empty, missing UUID 404 and invalid offset 400 using the existing reader-check visitor header; bare requests correctly fail visitor admission (429). External hostname connection from VM failed; no external verification claimed.

## 2026-11-21: iteration 3184 — weekly reader pages

- Clean main at 36387361; no inherited work. Zero alerts, healthy health/database/Redis and active sources; no failed digest jobs. Nov 21 review awaits 15:00 UTC.
- Added “Week in review” link in Past editions, separate paginated weekly history and UUID detail pages with saved summaries, quiet topics and daily coverage links. Daily home/latest remains unchanged; posts link to the daily topic’s posts section because saved weekly post references lack platform identity.
- Added explicit GET/HEAD admission for both reader routes, including malformed-path/write denials. Browser reload caught the missing route policy before completion; repaired and targeted policy tests pass.
- Live weekly history is empty: no weekly publication or AI call was triggered. Synthetic detail responses are labelled in screenshots and smoke script; they are not live editions. Scheduling and developing acceptance remain unfinished.
- Browser checks pass: 390/1440 light/dark, empty live history, synthetic summaries/daily links/quiet topic, pagination, keyboard entry, 404, no overflow or browser errors. Eight screenshots under docs/screenshots/ui/weekly-{live-history,synthetic-detail}-*; mobile light and desktop dark inspected.
- Updated TASKS, reader plan and affected pipeline handbook. No schema or diagram change.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; targeted API/web builds; pnpm exec tsx --test apps/api/test/public-route-policy.test.ts; pnpm exec tsx scripts/smoke-reader-weekly.ts; pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; pnpm obs alerts/sources/jobs; git diff --check.
- Build, handbook (19 pages/one unchanged diagram/40 tables), policy tests and live Nov 20 reader (9c810e64, five topics/25 stories/20 posts) pass. Logs: /tmp/3184-*.log. Full-check static stages and 1,353 units pass; combined process ended 143 during integrations. Separate pnpm test:integration exits 0: 338 pass/four expected skips; final web typecheck and lint:fix pass.
- Next: Nov 21/22 scheduled reviews first, then weekly Sunday scheduling. Developing remains blocked/disabled; no paid calls.
- Final API/worker restart active; health/database/Redis, live Nov 20 reader and zero alerts pass. No schema changes, generation triggers or paid calls.

## 2026-11-21: iteration 3185 — weekly scheduled admission

- Clean main at 722ef363; no inherited work. Zero alerts, health/database/Redis pass, active sources returning data and no failed digest jobs. Nov 21 daily review awaits 15:00 UTC.
- Added scheduled weekly runner and Sunday 17:00 UTC schedule definition. Original queue timestamps pin public scope, coverage and retry keys; invalid/future/non-Sunday slots refuse dispatch, recovery over six hours late skips generation.
- Missing Sunday daily or refused editing throws a retryable failure; storage errors propagate. Existing immutable publication workflow owns prerequisite checks and saved retries. Queue registration/lifecycle remain unconnected; no automatic or paid calls.
- Three targeted regressions pass, including six-hour boundary, delayed attempts, stable keys, public scope and refusal/storage failure. Updated reader plan and TASKS; no runtime service, schema or diagram change.
- Commands: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx --test apps/api/test/scheduled-weekly-review.test.ts; pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline; pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z; pnpm obs alerts/sources/jobs; git diff --check.
- Build, handbook (19 pages/one unchanged diagram/40 tables) and live Nov 20 reader (five topics/25 stories/20 posts) pass. Full check and final restart results follow; logs /tmp/3185-*.log.
- Next: Nov 21/22 scheduled reviews first, then weekly queue registration/worker lifecycle. Developing remains blocked/disabled.
- Final pnpm check exits 0: 1,356 units and 338 integrations/four expected skips; all static checks pass. Fixed new test registration lint declarations and exposed shared slot policy through the profiles public boundary after initial failures. Rebuild passes; no paid calls. API/worker restart and final reader/health checks follow.
