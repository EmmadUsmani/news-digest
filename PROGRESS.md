# Progress

Dated entries of 15 lines or fewer, newest last. Record what changed, how it
was verified (commands and results) and what's next. When this file passes
about 400 lines, move older entries to `docs/progress-archive/`.

Earlier bootstrap and iterations 7–16: [archive](docs/progress-archive/2026-11-01-iterations-7-16.md).

## 2026-11-01: iteration 17 — edit topic settings and active phrase rules

- Started clean on main; no leftover work; baseline 19 tests, services and `/healthz` healthy.
- Added profile-scoped validated PUT settings and Manage topics UI: name, description, enabled, budgets, guidance and phrase rules.
- Disabled topics leave incoming cards/new editions; collection continues. Historical snapshots remain unchanged.
- UI distinguishes active phrase rules from editorial notes and future post budgets; source wiring/create/reorder remain unfinished.
- `pnpm check` passed typecheck/lint/boundaries and all 19 tests; `pnpm build` passed (existing upstream Zod warnings).
- `pnpm exec tsx scripts/smoke-topics.ts` passed desktop/mobile persistence, disable, budget, immutable-history and 400/404 checks; original settings restored.
- Corrected smoke cleanup's read-only fields and textarea locator after initial failures; successful reruns and screenshots verified.
- `pnpm exec tsx scripts/smoke-ui.ts` passed existing desktop/mobile/history/window checks; screenshots updated and topic mobile inspected.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 266 URLs, four topics, seven healthy sources.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed history/versions/preservation/ranking; restored default 24h edition selects 5/5/3/5.
- `git diff --check` passed; API/worker rebuilt/restarted and health healthy. No provider/model/billing changes; editorial configuration pending.
- Next: topic creation/reorder/source configuration, schedule settings, semantic ranking evaluation.

## 2026-11-01: iteration 18 — persist topic reading order

- Started clean on main; no leftover work; baseline checks, services and health healthy.
- Added accessible up/down controls and profile-scoped PUT /api/topics/order with strict unique/full-list validation.
- Transaction locks topics in stable ID order and updates positions atomically; invalid lists leave settings unchanged.
- Incoming cards and new editions use saved order; immutable historical editions retain their original order.
- Seven healthy sources still store 266 real URLs; no source or provider/model/billing changes.
- `pnpm check` passed types/lint/boundaries and all 19 tests; `pnpm build` passed (existing upstream Zod warnings).
- `pnpm exec tsx scripts/smoke-topic-order.ts` passed desktop/mobile persistence, new-edition order, history and invalid atomicity; screenshots added/inspected.
- Fixed initial smoke script CJS top-level-await failure by wrapping its entrypoint; successful rerun.
- `pnpm exec tsx scripts/smoke-topics.ts` and `pnpm exec tsx scripts/smoke-ui.ts` passed existing UI checks/screenshots.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes; `pnpm exec tsx apps/api/scripts/smoke-previews.ts` restored 5/5/3/5 selections.
- `pnpm lint` and `git diff --check` passed; API/worker restarted and /healthz healthy.
- Next: topic creation/source configuration and schedule settings; editorial review still awaits allowed model configuration.

## 2026-11-01: iteration 19 — repair reorder regression before new features

- Started clean on main; no leftover work. Services/health healthy, but baseline `pnpm check` failed: reorder saved positions 1–4 while seeds/tests require 0–3.
- Fixed SQL ordinality offset; migration 007 normalizes persisted positions per profile without changing reading order.
- Added repository integration coverage for reverse order, exact positions and invalid-list atomicity; settings assertions now respect configurable names/enabled states.
- Strengthened desktop/mobile reorder smoke to verify persisted zero-based positions; existing screenshots remain unchanged.
- `pnpm migrate` applied 007; `pnpm check` passed all 20 tests, types/lint/boundaries, including a rerun after live browser reorders.
- `pnpm build` passed with existing upstream Zod annotation warnings; `git diff --check` passed.
- `pnpm exec tsx scripts/smoke-topic-order.ts` passed desktop/mobile persistence, new-edition order and immutable history.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 267 real URLs, four topics, seven healthy sources.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed history/window/preservation checks; default selections remain 5/5/3/5.
- API/worker restarted; `/healthz` healthy. No provider/model/billing changes; allowed editorial configuration remains pending.
- Next: topic creation/source configuration and schedule settings; triage completed instead of starting new features.

## 2026-11-01: iteration 20 — create configurable topics

- Started clean on main; no leftover work; baseline 20 tests, both services and `/healthz` healthy.
- Added strict profile-scoped POST /api/topics and shared Create topic form with budgets, guidance, phrase rules and enable state.
- Server assigns UUID and appended zero-based position; creation/reorder serialize on the profile row; stale reorder lists fail atomically.
- New topics explicitly have no source connections; no articles are invented or fetched. Source setup remains the next configuration step.
- `pnpm check` passed types/lint/boundaries and all 21 tests, including concurrent creation/order/defaults integration coverage.
- `pnpm build` passed (existing upstream Zod warnings); `git diff --check` passed.
- `pnpm exec tsx scripts/smoke-topic-create.ts` passed desktop/mobile validation, persistence, quiet editions and immutable history; screenshots inspected.
- `pnpm exec tsx scripts/smoke-topic-order.ts`, `scripts/smoke-topics.ts`, and `scripts/smoke-ui.ts` passed existing browser checks; screenshots updated.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 268 real URLs, four topics, seven healthy sources.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed saved-window/history checks; restored latest 24h selections remain 5/5/3/5.
- API/worker rebuilt/restarted; health healthy. No provider/model/billing changes; allowed editorial configuration remains pending.
- Next: source/query/account configuration and schedule settings; deletion remains unfinished.

## 2026-11-01: iteration 21 — connect topics to shared real sources

- Started clean on main; no leftover work; baseline 21 tests, services and `/healthz` healthy.
- Added migration 008 and transactional source connections, catalog API, validated replacement API and accessible desktop/mobile selection UI.
- New topics immediately reuse stored articles; future collection stays shared per source; incoming cards refresh after saves.
- Disconnecting removes candidates from new editions; old snapshots remain unchanged. Custom feeds/queries/accounts remain unfinished.
- Worker refreshes source schedules every minute; collection pauses when no enabled topic connects a source.
- First check exposed an ingestion fixture missing its new connection; updated fixture/cleanup and added atomicity/shared-catalog integration coverage.
- `pnpm migrate`, `pnpm check` (22 tests/types/lint/boundaries), `pnpm build`, `pnpm lint`, `pnpm test` and `git diff --check` passed; existing Zod warnings only.
- `pnpm exec tsx scripts/smoke-topic-sources.ts` passed desktop/mobile connect/reload/real articles/new editions/disconnect/400/404/history; screenshots inspected.
- Existing `scripts/smoke-topic-create.ts`, `scripts/smoke-topics.ts`, `scripts/smoke-topic-order.ts`, `scripts/smoke-ui.ts` passed; screenshots updated.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 268 real URLs, four topics, seven healthy sources.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed immutable-history/window checks; restored latest selections 5/5/3/5.
- API/worker rebuilt/restarted; `/healthz` healthy. No provider/model/billing changes; allowed editorial configuration remains pending.
- Next: schedule settings; custom feeds/discovery configuration and topic deletion remain unfinished.

## 2026-11-01: iteration 22 — persist schedule settings and topic defaults

- Started clean on main; no leftover work; baseline 22 tests, services and `/healthz` healthy.
- Added strict PUT /api/profile/schedule through ProfileRepository and accessible daily time/timezone/coverage/default-budget form.
- Validates daily cron, IANA timezone, positive elapsed duration (maximum 31 days), bounded budgets and unknown fields; invalid saves leave settings intact.
- Saved defaults prefill new topics; existing topics and immutable editions remain unchanged. Schedule note reflects actual saved coverage.
- Automatic generation remains explicitly pending M7; no provider/model/billing changes; editorial configuration still blocked.
- `pnpm check` passed types/lint/boundaries and all 23 tests; `pnpm build` passed with existing upstream Zod annotation warnings.
- `pnpm exec tsx scripts/smoke-schedule.ts` passed desktop/mobile persistence, invalid-save atomicity, timezone errors, defaults and history; screenshots saved and mobile inspected.
- Initial existing UI checks exposed a shared CSS selector and outdated schedule notice expectation; corrected both and reran successfully.
- `pnpm exec tsx scripts/smoke-topic-create.ts` and `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile regressions; screenshots updated.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 268 real URLs, four topics, seven healthy sources.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed saved-window/history checks; latest selections remain 5/5/3/5.
- `pnpm lint` and `git diff --check` passed; API/worker rebuilt/restarted and health healthy.
- Next: custom feeds/discovery configuration and topic deletion; wire saved schedules into automatic generation under M7.

## 2026-11-01: iteration 23 — automatic preliminary editions

- Started clean on main; no leftover work. Baseline services, /healthz and all 23 checks healthy.
- Prioritized saved-schedule operation over custom feeds so real editions appear without manual generation.
- Added BullMQ daily cron/timezone scheduler, 10-second settings refresh, obsolete-job skip and three bounded retry attempts.
- Windows end at the scheduled slot; migration 009 plus pre-snapshot advisory lock makes retries return one immutable edition.
- Manual generation remains independently versioned; UI identifies automatic editions as preliminary; no LLM/provider/billing changes.
- `pnpm migrate`, `pnpm check` (24 tests/types/lint/boundaries), `pnpm build`, `pnpm lint` and `git diff --check` passed; existing Zod warnings only.
- New concurrent-retry integration test verifies identical snapshots, one scheduled row and separate manual versions.
- `pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts` observed actual 19:43 UTC scheduled generation, exact 6h window, real candidates and completed queue job; original schedule restored.
- `pnpm exec tsx scripts/smoke-schedule.ts` and `scripts/smoke-ui.ts` passed desktop/mobile checks; screenshots updated and mobile inspected.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 268 real URLs, four topics, seven healthy sources.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed immutable/history/window checks; default selections remain 5/5/3/5.
- API/worker rebuilt/restarted, /healthz healthy. Next: run/source status visibility, custom feeds, missed-run policy; editorial configuration remains blocked.

## 2026-11-01: iteration 24 — visible source and automatic-run status

- Started clean on main; no leftover work. Baseline 24 tests, services and /healthz healthy.
- Added read-only /api/status behind OperationsReader plus expandable desktop/mobile status panel and minute/manual refresh.
- Shows source freshness/errors/counts, active connections, queue workers/availability/pause/counts, next slot and up to 20 retained automatic runs with edition links.
- Raw job payloads/errors/stacks are omitted; queue totals explicitly mean retained jobs. LLM usage/caps remain honestly pending editorial integration.
- `pnpm check` passed typecheck/lint/boundaries and all 25 tests including Postgres/Redis telemetry integration.
- `pnpm build` passed with existing upstream Zod annotation warnings; initial missing JSX fragment closure was fixed before successful verification.
- `pnpm exec tsx scripts/smoke-status.ts` passed desktop/mobile real telemetry, real edition links, refresh errors and synthetic failure/paused rendering; screenshots saved and inspected.
- `pnpm exec tsx scripts/smoke-ui.ts` passed existing desktop/mobile regressions; screenshots updated.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 268 real articles, four topics, seven healthy sources.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed immutable/history/window checks; latest selections remain 5/5/3/5.
- API/worker rebuilt/restarted; /healthz healthy. No source/provider/model/billing changes.
- Next: custom feeds/discovery configuration, topic deletion and missed-run policy; editorial model configuration remains blocked.

## 2026-11-01: iteration 25 — delete topics without losing shared content

- Started clean on main; no leftover work. Baseline 25 tests, both services and /healthz healthy.
- Added profile-scoped DELETE /api/topics/:id and desktop/mobile permanent-delete confirmation, cancel and error/retry handling.
- Deletion serializes with creation/reorder, closes position gaps and cascades topic connections; immutable editions retain deleted sections.
- Migration 010 makes legacy source-topic provenance nullable with SET NULL; shared sources, articles and observations survive.
- New integration coverage verifies profile isolation, missing IDs, ordering, cascading connections and retained shared fixture content.
- `pnpm migrate`, `pnpm check` (26 tests/types/lint/boundaries), `pnpm build`, `pnpm lint` and `git diff --check` passed; existing Zod warnings only.
- `pnpm exec tsx scripts/smoke-topic-delete.ts` passed desktop/mobile cancel, failure/retry, deletion, history, new-edition exclusion and shared real content; screenshots saved/mobile inspected.
- Initial browser assertion matched the intentionally preserved historical section; scoped it to incoming topics and reran successfully.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-topic-order.ts` passed existing UI/order checks; screenshots updated.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 268 real articles, four topics, seven healthy sources.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed history/window checks; restored selections 5/5/3/5. Queue status has no failed jobs.
- API/worker rebuilt/restarted and /healthz healthy. No provider/model/billing changes; editorial configuration remains blocked.
- Next: custom feeds/discovery configuration and missed-run policy.

## 2026-11-01: iteration 26 — bounded recovery for missed automatic editions

- Started clean on main; no leftover work; baseline 26 tests, services, /healthz and seven sources healthy.
- Retained queued slots up to six hours late preserve original windows; older slots skip visibly without snapshots or historical backfill.
- Invalid/future slot timestamps fail; schedule changes still skip obsolete jobs; retries retain immutable snapshot identity.
- Settings/status explain the policy and custom-window recovery; Redis job loss remains outside recovery scope.
- `pnpm check` passed typecheck/lint/boundaries and all 27 tests; `pnpm build` passed with existing upstream Zod warnings.
- `pnpm exec tsx apps/api/scripts/smoke-missed-runs.ts` passed synthetic stale/recent slots against the real worker: no stale snapshot, original recovered window, idempotent retry, visible skip reason.
- `pnpm exec tsx scripts/smoke-status.ts`, `scripts/smoke-schedule.ts` and `scripts/smoke-ui.ts` passed desktop/mobile checks; screenshots updated and mobile inspected.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 270 real articles, four topics, seven healthy sources.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed immutable/history/window checks; selections remain 5/5/3/5.
- `pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts` observed actual 19:54 UTC automatic generation, real candidates, exact 6h window and completed job; original schedule restored.
- `pnpm lint` and `git diff --check` passed; API/worker rebuilt/restarted and /healthz healthy. No provider/model/billing changes.
- Next: custom feeds/discovery configuration; editorial model configuration remains blocked.

## 2026-11-01: iteration 27 — custom feeds and wider live technology coverage

- Started clean on main; no leftover work. Baseline 27 checks, services, /healthz, sources and digest queues healthy.
- Added strict POST /api/topics/:id/feeds and desktop/mobile RSS/Atom form; registration connects atomically and identical normalized URLs share saved names, articles and collection.
- Bounded catalog (500)/topic connections (100); unverified feeds wait for worker results, with disconnect and immutable history preserved.
- Shared HTTPS client now validates/pins public DNS addresses at socket lookup; private literals/answers, credentials, custom ports and unsafe redirects are rejected; four-hop cap and existing limits retained.
- Connected Ars Technica to Tech & AI after actual minute-scheduler collection stored 20 real articles; no provider/model/billing changes.
- `pnpm check` passed types/lint/boundaries and all 30 tests; `pnpm build` passed with existing upstream Zod annotation warnings; final `pnpm test`, `pnpm lint`, `git diff --check` passed.
- `pnpm exec tsx scripts/smoke-custom-feeds.ts` passed desktop/mobile invalid URLs, scheduled collection, shared URL reuse, reload and disconnect; screenshots saved/mobile inspected.
- Existing `scripts/smoke-topic-sources.ts`, `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile regressions; screenshots updated.
- Wider smoke checks exposed fixed-source-count/legacy-provenance assumptions; corrected scripts to use actual catalog and enabled topic connections, then reran successfully.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 293 real URLs, four topics, eight healthy sources; `smoke-previews.ts` passed history/window checks, selections 5/5/3/5.
- `pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts` observed actual 20:01 UTC generation, exact 6h window, real candidates and completed job; original schedule restored.
- API/worker rebuilt/restarted and /healthz healthy. Next: query/account discovery configuration; allowed editorial configuration remains blocked.

## 2026-11-01: iteration 28 — configurable news-query discovery

- Started clean on main; no leftover work. Baseline 30 checks, services, /healthz, sources and digest queues healthy.
- Added POST /api/topics/:id/queries and desktop/mobile Google News RSS query form with fixed English/US edition, strict bounded text and encoded parameters.
- Query feeds reuse shared registration, caps, safe HTTP, scheduled collection and disconnect controls; replacement preserves collected articles and immutable editions.
- Actual worker collected 60 Google News articles; artificial intelligence query remains connected to Tech & AI. Google redirects/dedup and unverified outlet independence documented honestly.
- `pnpm check` passed types/lint/boundaries and all 32 tests, including query encoding/validation and recorded Google RSS parsing; `pnpm build` passed with existing upstream Zod warnings.
- `pnpm exec tsx scripts/smoke-news-queries.ts` passed desktop/mobile validation, scheduled real collection, shared query reuse, reload and disconnect; screenshots saved/mobile inspected.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-topic-sources.ts` passed; initial UI check overlapped a temporary probe topic and passed after cleanup/rerun; screenshots updated.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 354 real URLs, four topics, nine healthy sources; `smoke-previews.ts` passed history/window checks, selections 5/5/3/5.
- `pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts` observed actual 20:06 UTC generation, exact 6h window, real candidates and completed job; original schedule restored.
- `pnpm lint` and `git diff --check` passed; API/worker rebuilt/restarted and /healthz healthy. No provider/model/billing changes; editorial configuration remains blocked.
- Next: social account discovery/configuration; semantic ranking and durable queue recovery remain unfinished.

## 2026-11-01: iteration 29 — wider live world reporting

- Started clean on main; no leftover work. Baseline 32 tests, services, /healthz, nine sources and digest queues healthy.
- Prioritized real coverage while editorial configuration remains blocked: migration 011 connects NPR World and The Guardian World to the original world topic if present.
- Existing shared RSS adapter, safe HTTP, worker schedule and disconnect controls apply; no article-page crawling or provider/model/billing changes.
- Worker stored 10 NPR + 45 Guardian articles; two queued passes retained 411 real URLs from eleven healthy sources across four topics.
- Recorded two-item publisher fixtures cover links, bylines, timestamps, media and plain excerpts offline; never seeded into production.
- `pnpm migrate`, `pnpm check` (33 tests/types/lint/boundaries), `pnpm build`, `pnpm lint` and `git diff --check` passed; existing upstream Zod warnings only.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed; eleven simultaneous waits exposed a smoke-only listener warning, adjusted limit to source count and reran without warnings.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed immutable/history/window checks; selections 5/5/3/5, world candidates 47; new editions include Guardian coverage.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile checks; screenshots updated and mobile inspected.
- `pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts` observed actual 20:09 UTC automatic generation, exact 6h window, real candidates and completed job; original schedule restored.
- API/worker rebuilt/restarted and /healthz healthy. Next: social discovery/configuration; semantic ranking, editorial integration and durable queue recovery remain unfinished.

## 2026-11-01: iteration 30 — stop rewarding repeated discovery as independent coverage

- Started clean on main; no leftover work. Baseline 33 tests, services, /healthz, eleven sources and digest queues healthy.
- New signals-v5 editions remove the eight-point bonus per additional source label; feeds/aggregators do not establish outlet independence.
- Coverage labels/links remain auditable; ranking uses recency plus capped HN engagement. Historical snapshots keep original methods/scores.
- Added synthetic regression for repeated discovery displacing fresher reporting and changing same-headline cluster leads; no live precision claim.
- Updated shared method validation, generation smoke check, ranking documentation and UI explanation.
- `pnpm check` passed types/lint/boundaries and all 34 tests; `pnpm build` passed with existing upstream Zod annotation warnings.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed v5 generation, immutable history and exact-window checks; selections 5/5/3/5.
- `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile rendering/history/window regressions; screenshots updated and mobile inspected.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 412 real URLs, four topics, eleven healthy sources.
- `pnpm exec tsx scripts/smoke-status.ts` passed real telemetry/edition links and synthetic failure rendering; status screenshots updated.
- `pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts` observed actual 20:12 UTC generation, exact 6h window and completed job; original schedule restored.
- Final `pnpm lint`, `git diff --check` and rebuild passed; services restarted and /healthz healthy. Provider/model/billing unchanged; editorial configuration remains blocked.
- Next: social discovery/configuration, independent-outlet attribution and labeled historical ranking evaluation.

## 2026-11-01: iteration 31 — recorded NBA ranking benchmark

- Started clean on main; no leftover work. Baseline 34 tests, services, /healthz and eleven sources healthy.
- Public Reddit NBA RSS probe returned HTTP 403; documented blocked status without bypass attempts or registration.
- Froze all 52 real stored candidates for a concrete 24h NBA window, saved phrase policy and five-slot budget; offline only, never seeded.
- Agent labeled five target events with alternative coverage IDs/rationales and four filler omissions before evaluation; not owner labels or verified article claims.
- Added `pnpm evaluate:ranking` and offline regression: v5 finds 2/5 events (40% recall/target slot yield), omits all four negatives; documented missed record/ownership/Sixers events.
- No scoring fitted to labels; broader independently labeled windows remain needed before general quality claims.
- `pnpm check` passed types/lint/boundaries and all 35 tests; `pnpm build` passed with existing upstream Zod warnings.
- `pnpm exec tsc --noEmit --strict --esModuleInterop --skipLibCheck --target ES2022 --module commonjs apps/api/scripts/evaluate-ranking.ts apps/api/test/historical-ranking.test.ts` passed.
- Capture initially needed an async wrapper; evaluator moved into API package for standalone contracts typechecking; temporary capture script removed.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 416 URLs, four topics, eleven healthy sources; `smoke-previews.ts` passed immutable/history/window checks, selections 5/5/3/5.
- `pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts` observed actual 20:16 UTC generation, exact 6h window and completed job; original schedule restored.
- Final `pnpm lint`, `pnpm evaluate:ranking` and `git diff --check` passed. No UI changes; provider/model/billing unchanged, editorial configuration blocked.
- Next: more labeled windows, social discovery and independently verified outlet attribution.

## 2026-11-01: iteration 32 — direct gaming platform announcements

- Started clean on main; no leftover work. Baseline 35 tests, services, /healthz, eleven sources and digest queues healthy.
- Migration 012 connects PlayStation Blog and Xbox Wire to the original Gaming topic if present, through existing safe shared feed collection/disconnect controls.
- Worker stored ten real articles each; `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes with 436 URLs, thirteen healthy sources and four topics.
- First-party promotional/platform coverage is not independent corroboration; newest posts are October 30. Today's Gaming selection stays 3/5 with five candidates.
- Explicit seven-day POST /api/digest-previews passed with 114 Gaming candidates; all five selections remain Eurogamer. No ranking improvement claimed.
- Added two-item recorded fixtures (full content:encoded omitted) and offline link/date/author/excerpt regression; fixtures never enter production.
- `pnpm migrate`, `pnpm check` (36 tests/types/lint/boundaries), `pnpm build`, `pnpm lint` and `git diff --check` passed; existing upstream Zod warnings only.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed immutable/history/window checks; selections remain 5/5/3/5.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile checks; screenshots updated and mobile inspected.
- `pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts` observed actual 20:19 UTC generation, exact 6h window and completed run; original schedule restored.
- API/worker rebuilt/restarted; /healthz healthy. No provider/model/billing changes; editorial configuration remains blocked.
- Next: social discovery, independently labeled windows and verified outlet attribution; broader feeds alone do not fix editorial quality.

## 2026-11-01: iteration 33 — World ranking benchmark and missed-event diagnostics

- Started clean on main; no leftover work. Baseline 36 tests, services, /healthz, thirteen sources and digest queues healthy.
- Froze all 47 real stored World candidates for an exact 24h window with saved policy/budget; offline only, never seeded into production.
- Agent labeled five target events and two lower-priority omissions before evaluation; labels are provisional, not owner judgments or fact checks.
- Generalized `pnpm evaluate:ranking` to separate NBA/World reports and show each target's article counts, phrase eligibility and first rank within twenty groups.
- World baseline finds 1/5 targets (20% recall/yield), omits both negatives; missed protests/court decision/Hormuz rank 7/9/14, India outside twenty. NBA stays 2/5.
- Added World recall/yield regression without changing production ranking, budgets or provider/model/billing; independent labels and different dates remain needed.
- `pnpm check` passed types/lint/boundaries and all 37 tests; `pnpm build` passed with existing upstream Zod annotation warnings.
- Standalone strict `pnpm exec tsc --noEmit --strict --esModuleInterop --skipLibCheck --target ES2022 --module commonjs apps/api/scripts/evaluate-ranking.ts apps/api/test/historical-ranking.test.ts` passed.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 437 URLs, four topics, thirteen healthy sources; `smoke-previews.ts` passed immutable/history/window checks, selections 5/5/3/5.
- `pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts` observed actual 20:23 UTC generation, exact 6h window and completed job; original schedule restored.
- `pnpm evaluate:ranking`, `git diff --check` and GET / passed. No UI changes. API/worker rebuilt/restarted and /healthz healthy.
- Next: social discovery, reviewed labels across different dates and verified outlet attribution; editorial configuration remains blocked.

## 2026-11-01: iteration 34 — direct AI announcements and compressed feed repair

- Started clean on main; no leftover work. Baseline 37 tests, services and /healthz healthy.
- Migration 013 connects OpenAI News and Google DeepMind to the original Tech & AI topic; worker stored 60 real articles each.
- Repeat DeepMind collection exposed gzip parsed as UTF-8; shared HTTP now decodes gzip/deflate/Brotli with 2 MB compressed/expanded caps and explicit encoding failures.
- Recorded two-item fixtures stay offline; regression covers publisher dates, absent fields/media, compression/cache reuse, corruption and expansion limits.
- `pnpm migrate`, `pnpm check` (39 tests/types/lint/boundaries), `pnpm build`, final `pnpm lint` and `git diff --check` passed; existing upstream Zod warnings only.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` initially failed on compressed DeepMind; after repair two passes passed: 557 URLs, fifteen healthy sources, four topics.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed immutable/history/window checks; selections 5/5/3/5. Seven-day POST: 141 Tech candidates, all five selections still HN.
- Newest publisher dates October 30/28; first-party sources are not independent corroboration, and no ranking improvement is claimed.
- `pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts` observed actual 20:26 UTC automatic generation with exact 6h window and completed run; original schedule restored.
- `pnpm exec tsx scripts/smoke-ui.ts` initially clicked related coverage instead of selection reasons; scoped selector fixed, desktop/mobile rerun passed. `scripts/smoke-status.ts` passed; screenshots updated/mobile inspected.
- Archived bootstrap/iterations 7–16 to keep progress below 400 lines. API/worker rebuilt/restarted and /healthz healthy; provider/model/billing unchanged, editorial configuration still blocked.
- Next: social discovery, reviewed ranking windows and verified outlet attribution; wider sources alone do not fix selection quality.

## 2026-11-01: iteration 35 — publisher lead images in saved editions

- Started clean on main; no leftover work. Baseline 39 tests, both services and /healthz healthy.
- New snapshots retain each selected lead article's existing feed image; media does not change scores, grouping or historical snapshots.
- Contracts accept missing/null media for older editions; ranking drops non-HTTPS/credentialed URLs and never borrows another cluster article's image.
- Responsive lazy images preserve aspect ratio, omit referrers and disappear on failure; decorative alt avoids inventing captions.
- Added lead-media/scheme regression, database-to-snapshot integration assertions and desktop/mobile browser failure checks; fixtures stay browser-only.
- `pnpm check` passed types/lint/boundaries and all 40 tests; `pnpm build` passed with existing upstream Zod annotation warnings.
- `pnpm exec tsx scripts/smoke-ui.ts` passed twice, including immutable history/windows and simulated broken images; screenshots updated and mobile inspected.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued passes: 558 real URLs, fifteen healthy sources, four topics.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed immutable/history/window checks; selections remain 5/5/3/5.
- `pnpm exec tsx scripts/smoke-status.ts` passed desktop/mobile telemetry and failure rendering; `pnpm evaluate:ranking` unchanged (NBA 2/5, World 1/5).
- `pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts` observed actual 20:30 UTC generation, exact 6h window and completed run; original schedule restored.
- Final lint/diff checks passed; API/worker rebuilt/restarted and /healthz healthy. Provider/model/billing unchanged; editorial configuration remains blocked.
- Next: social discovery, reviewed ranking windows and verified outlet attribution; publisher media does not improve editorial selection.

## 2026-11-01: iteration 36 — broader current Gaming coverage

- Started clean on main; no leftover work. Baseline 40 tests, services and /healthz healthy.
- Migration 014 connects PC Gamer and Rock Paper Shotgun to the original Gaming topic through existing shared collection/disconnect controls.
- `pnpm migrate` passed; `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 668 URLs, seventeen healthy sources, four topics; new feeds stored 50/60 articles.
- Gaming's checked 24h edition now has 22 candidates / five selections, including both new outlets, versus five / three; broader coverage is not an editorial precision claim.
- RPS shares IGN Entertainment with Eurogamer; no independence bonus, ranking/budget or provider/model/billing changes. No article-page crawling.
- Recorded two-item fixtures omit full-content fields and stay offline; regression verifies dates, bylines, publisher links, excerpts and lead media.
- `pnpm check` passed types/lint/boundaries and all 41 tests; `pnpm build` passed with existing upstream Zod annotation warnings.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed immutable/history/window checks; selections now 5/5/5/5.
- `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile checks twice; `scripts/smoke-status.ts` passed real telemetry/failure rendering. Screenshots updated and mobile inspected.
- `pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts` observed actual 20:33 UTC generation, exact 6h window and completed run; original schedule restored.
- `pnpm evaluate:ranking` unchanged (NBA 2/5, World 1/5); final `pnpm lint` and `git diff --check` passed. Rebuilt/restarted services and /healthz healthy.
- Next: social discovery, reviewed ranking windows and verified outlet attribution; editorial configuration remains blocked.

## 2026-11-01: iteration 37 — keep HN questions out of news slots

- Started clean on main; no leftover work. Baseline 41 tests, both services and /healthz healthy.
- New signals-v6 editions omit original HN `Ask HN:` question threads with stored `hn-question` reasons; incoming collection remains intact.
- Show HN launches and publisher reporting remain eligible; scores/budgets/clustering unchanged. Historical method contracts and immutable snapshots remain readable.
- Same-window live comparison removed the TV/privacy question, admitted the next eligible publisher item, preserved five Tech slots and identical other topics; old v5 snapshot reread unchanged.
- Added offline Unicode/domain/launch/reporting/high-engagement/quiet-window regression; this narrow format rule is not an editorial precision claim.
- `pnpm check` passed types/lint/boundaries and all 42 tests; `pnpm build` passed with existing upstream Zod annotation warnings.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued passes: 668 real URLs, seventeen healthy sources, four topics.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed immutable/history/window checks; 24h selections 5/5/5/5, one Tech quality omission.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots updated and mobile omission panel visually inspected. Scoped NBA omission selector for the new Tech panel.
- `pnpm exec tsx apps/api/scripts/smoke-scheduled-digests.ts` observed actual 20:36 UTC generation, exact 6h window and completed run; original schedule restored, fresh 24h edition left on home.
- `pnpm evaluate:ranking` unchanged (NBA 2/5, World 1/5); final `pnpm lint` and `git diff --check` passed. Rebuilt/restarted services; /healthz healthy.
- Provider/model/billing unchanged; editorial configuration remains blocked. Next: social discovery, reviewed ranking windows and verified outlet attribution.

## 2026-11-01: iteration 51 — recovered ranking benchmark

- Found uncommitted Tech benchmark, diagnostics, fixtures and source notes from the previous session; deliberately finished and retained them.
- `pnpm check` passed typecheck, lint, boundaries and all 43 tests; services and `/healthz` healthy.
- Tech's agent-labeled window finds 0/5 targets; no ranking changes or precision improvement claimed.
- Proceeding immediately to STEERING item 1 before further product work.

## 2026-11-01: iteration 51 — enforce formatting and workspace lint

- Recovered previous benchmark separately in `8eb77e2`; new STEERING instructions take priority over the stale prior summary.
- Added Prettier/config/ignore, EditorConfig, format scripts and mandatory precommit format/lint rule; owner files excluded.
- Isolated formatting-only commit `817d3be` in `.git-blame-ignore-revs`; setup is `7fe325d`.
- Typed ESLint covers API/contracts/scripts, React hooks/refresh covers web; sorted/duplicate/unused imports enforced across workspace, zero warnings required.
- Fixed imports, explicit Node test promise discards, rejection normalization and App export; scoped legacy I/O/coercion/loading-effect exemptions have comments and TASKS follow-ups.
- `pnpm check` passed typecheck, lint, format, boundaries and all 43 tests; `pnpm build` passed (existing upstream Zod warnings only).
- Rebuilt/restarted API/worker; `/healthz` healthy. `smoke-ui.ts` and `smoke-status.ts` passed desktop/mobile; screenshots refreshed/mobile inspected.
- `smoke-ingestion.ts` passed two queued live passes: 706 real URLs, four topics, seventeen healthy sources; `smoke-previews.ts` passed immutable/history/windows (5/5/5/5).
- Corrected stale editorial blocker: STEERING 3 authorizes installed Anthropic key and configured Haiku/Sonnet; next implement real capped/cached adapter and ledger before 2a/2b.
- No app inference calls made this iteration ($0 incremental); provider/model/billing unchanged. Added ordered 2a integration infrastructure and 2b ORM tasks.
- `smoke-scheduled-digests.ts` observed actual 23:59 UTC generation with exact 6h slot and completed run; original schedule restored. Final format/lint/diff checks passed.
