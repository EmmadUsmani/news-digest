# Progress

Dated entries of 15 lines or fewer, newest last. Record what changed, how it
was verified (commands and results) and what's next. When this file passes
about 400 lines, move older entries to `docs/progress-archive/`.

## 2026-11-01: bootstrap (owner, from laptop)
- Repo created with MISSION, AGENTS, STEERING, TASKS and the `ops/` harness
  ported from the price-finder project (never-give-up retries, usage-limit
  polling, systemd supervisor restarts, owner-file guards).
- VM provisioned with `ops/vm/provision.sh`. No application code yet; start at
  TASKS M0.

## 2026-11-01: iteration 7 — runnable foundation
- Clean main at start; no leftover work, application, containers or port 8000 listener.
- Added pnpm NestJS/React/contracts workspace, SQL migrations/default profile, Docker Postgres/Redis.
- Added real DB/Redis `/healthz`, static SPA, BullMQ operations heartbeat, restart-always user services.
- Empty page explicitly says no live sources/digests; no fixtures presented as content.
- `pnpm build` passed; `pnpm migrate` twice passed (second run applied nothing).
- `pnpm check` passed: types, ESLint, dependency boundaries, 2 local integration tests.
- `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile, no page errors/overflow; screenshots saved.
- `curl localhost:8000/healthz` returned 200; stopping Redis returned 503; restored Redis returned 200.
- Both user services active; Redis completed-set confirms operations heartbeat processed.
- Public hostname resolves to this VM's private address here; HTTPS curl refused (no local TLS listener).
- No proxy/DNS/visibility changes made; owner-facing HTTPS path remains externally unverified.
- Documented architecture, sources (all untried/needs key), operations and ranking baseline.
- Next: M1 topic/schedule domain and seeds, then M2 real ingestion across all four topics.

## 2026-11-01: iteration 8 — topic and schedule foundations
- Started clean on main; no leftover work to recover or discard; baseline checks and both services healthy.
- Completed M1: seeded four persisted topics with guidance, source/query/account slots, order and budgets.
- Added repository ports and read-only `/api/profile` and `/api/topics`; SPA renders actual stored settings.
- Added schedule validation and half-open elapsed coverage windows; P1D explicitly means 24 hours across DST.
- Schedule currently accepts daily local-time cron; execution and broader cadence support remain M7.
- Added shared runtime contracts with CommonJS/ESM builds after fixing Vite's local CommonJS import failure.
- `pnpm migrate` applied 002; repeat succeeded without changes; `pnpm check` passed all six tests, types, lint and boundaries.
- `pnpm build` passed (only upstream Zod annotation warnings); `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile.
- Updated screenshots; checked mobile rendering; no browser errors or horizontal overflow.
- Restarted API/worker; both active; curl health/profile/topics returned healthy persisted settings.
- No live ingestion or digest runs exist yet; no fixtures advertised as live. Next: M2 RSS/Atom/HN ingestion across four topics.

## 2026-11-01: iteration 9 — real incoming articles across all topics
- Started clean on main; no leftover work; baseline `pnpm check`, services and `/healthz` healthy.
- Completed M2: source/HTTP/repository ports, RSS/Atom and official HN adapters, migration 003.
- BullMQ ingests five persisted sources immediately/every 30m with retries; shared client enforces bounds/cache/backoff.
- Stored 155 real URLs: Verge 10, HN 20, CBS NBA 36, GamesIndustry 60, BBC World 29.
- Added read-only content/source-health APIs and recent linked headlines per topic; clearly unreviewed, not digests.
- ESPN returned empty HTTP 202; chose CBS; no bot-protection bypass. Incoming view omits betting URLs.
- Fixed XML entities; removed 29 first-pass malformed BBC URLs and successfully re-ingested them.
- `pnpm migrate` applied 003; repeat clean. `pnpm check` passed types/lint/boundaries and all 9 tests.
- `pnpm build` passed (only existing upstream Zod annotation warnings).
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 155 unchanged URLs, 4 topics, 5 healthy sources.
- `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile with articles in each topic, no browser errors/overflow; screenshots updated and mobile inspected.
- API/worker restarted; `/healthz` healthy; content/source endpoints show real stored content. No digest pipeline/runs exist yet.
- No blockers or LLM calls/provider changes. Next: M3 first capped editorial pass and immutable digest snapshot.

## 2026-11-01: iteration 10 — immutable preliminary ranked editions
- Started clean on main; no leftover work; baseline checks, both services, health and five sources healthy.
- Added signal ranking, explicit-window API and repeatable-read snapshots; DB trigger rejects UPDATE/DELETE.
- Home creates/loads a saved last-24-hour edition, publisher excerpts and auditable score reasons.
- Clearly preliminary: no LLM summaries, briefs, editorial rationale or posts claimed; M3 remains open.
- Exact windows/budgets, title deduplication and betting/watch-guide exclusions; no padding quiet topics.
- Live edition: 5 Tech + 5 World stories; NBA's one candidate excluded; Gaming had none in-window.
- Observed HN off-topic popularity; documented relevance/editorial review as next priority in docs/RANKING.md.
- Fixed HN excerpt HTML entities with offline regression coverage; old snapshots remain unchanged.
- `pnpm migrate` applied 004; repeat clean. `pnpm check` passed types/lint/boundaries and all 12 tests.
- `pnpm build` passed (existing upstream Zod annotation warnings only).
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed bad-window/versions/preservation checks.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 156 items, four topics, five healthy sources.
- `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile creation/reload, no browser errors/overflow; screenshots updated/inspected.
- API/worker restarted and health healthy; no LLM/provider changes or blockers. Next: capped LlmPort editorial pass.

## 2026-11-01: iteration 11 — topic relevance before ranking
- Started clean on main; no leftover work; baseline checks, health and both services passed.
- Added seeded, data-driven include/exclude phrase policies and read-only topic API fields.
- New signals-v2 editions store policy copies, rejection counts and selected-story matching reasons.
- UI shows filtering counts; old immutable signals-v1 editions remain readable and unchanged.
- Live Tech window: 24 candidates, 16 phrase rejections, five selected; Patrick Stewart excluded.
- World: 19 candidates/five selected; NBA betting candidate excluded; Gaming quiet. Still preliminary.
- Phrase rules are not semantic editorial review; documented limits and 14 synthetic labeled cases.
- `pnpm migrate` applied 005; repeat clean; `pnpm check` passed types/lint/boundaries and all 14 tests.
- `pnpm build` passed with existing upstream Zod warnings; `git diff --check` passed.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed versions/preservation/policy/reason checks.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 156 items, four topics, five healthy sources.
- `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile/reload/expanded reasons; screenshots updated, mobile inspected.
- Restarted API/worker; health/topics endpoints healthy. No LLM calls or provider/model changes; no blockers.
- Next: capped/cached LlmPort editorial review using configured model/provider; broader NBA/Gaming sources.

## 2026-11-01: iteration 12 — recent NBA and Gaming coverage
- Started clean on main; no leftover work; baseline checks, services, health and existing sources healthy.
- Added migration 006: Yahoo Sports NBA and Eurogamer feeds, topic source configuration and existing worker scheduling.
- Stored 110 additional real URLs: Yahoo 50, Eurogamer 60; seven healthy sources now supply 266 items.
- Last-24-hour edition now selects NBA 5/51 candidates and Gaming 3/5; all four topics populated.
- Still preliminary: NBA schedule/preview filler demonstrates the remaining editorial-quality gap; documented in RANKING.
- Added two-entry recorded fixtures per publisher; no fixture data seeded or presented as live.
- NBA.com/GameSpot returned 403; IGN returned malformed XML; recorded results without bypass attempts.
- `pnpm migrate` applied 006; repeat clean; `pnpm check` passed types/lint/boundaries and all 14 tests.
- `pnpm build` passed (existing upstream Zod warnings); `git diff --check` passed.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued passes: 266 items, no duplicates/errors.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed immutable versions/window/relevance checks.
- `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile/reload with updated screenshots; mobile inspected.
- API/worker restarted; `/healthz` healthy. No LLM calls/provider/model changes or blockers.
- Next: bounded cached LlmPort editorial pass; distinguish syndicated coverage when clustering.

## 2026-11-01: iteration 13 — remove routine filler with inspectable reasons
- Started clean on main; no leftover work; baseline 14 tests, both services and health passed; seven sources healthy.
- Added signals-v3 quality rules for matchup previews, monthly schedules, discussion threads and shopping guides; retained betting/watch exclusions.
- Immutable snapshots copy omitted IDs/headlines/rules/reasons; home shows counts and expandable explanations; older versions remain readable.
- NBA: 51 candidates, five topic rejections, seven quality omissions; schedule/preview replaced by injury/rotation/game reporting.
- Tech/World still five stories each; Gaming three. Lexical rules still admit filler such as Winners & Sinners; editorial review remains M3.
- No app LLM provider/model configured in env/code; no calls or provider/model/billing changes. Recorded configuration dependency in NEEDS_FROM_HUMAN.
- `pnpm check` passed typecheck/lint/boundaries and all 16 tests; 20 labeled headline cases plus quiet-budget regression.
- `pnpm build` passed (existing upstream Zod warnings); `pnpm lint` and `git diff --check` passed.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed versions/window/relevance/quality/preservation checks; all 15 historic snapshots validated separately.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 266 URLs, four topics, seven healthy sources.
- `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile create/reload/omission details; screenshots updated and mobile inspected.
- API/worker restarted; `/healthz` healthy. Next: capped cached editorial adapter after allowed model configuration; event clustering meanwhile.

## 2026-11-01: iteration 14 — linked coverage in conservative headline groups
- Started clean on main; no leftover work; baseline 16 tests, services and `/healthz` healthy.
- Added signals-v4 complete-link headline groups before budgets; lead score preserved, all original coverage links copied.
- Numeric/date/action guards and pairwise overlap checks reduce accidental merging; no unverified syndication bonus.
- UI expands related coverage and explicitly warns that source independence is unverified; historical methods remain readable.
- Current live 24h window has no matching pairs: Tech/NBA/Gaming/World remain 5/5/3/5; no live deduplication gain claimed.
- `pnpm check` passed typecheck/lint/boundaries and all 19 tests, including three clustering regressions.
- `pnpm build` passed (existing upstream Zod warnings only); `git diff --check` passed.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed windows/versions/preservation/coverage checks; all 19 saved snapshots validate.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 266 URLs, four topics, seven healthy sources.
- `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile/reload and isolated unpersisted coverage fixture; live screenshots updated/inspected.
- API/worker restarted; health healthy. No LLM calls/provider/model/billing changes; editorial model configuration remains pending.
- Next: semantic event/independence evaluation and capped cached editorial pass after allowed model configuration; topic configuration/history UI.

## 2026-11-01: iteration 15 — browse immutable edition history
- Started clean on main; no leftover work; baseline 19 tests, services and `/healthz` healthy.
- Added profile-scoped history metadata pages (20 versions) and UUID snapshot API with 400/404 handling.
- Home browses saved versions with creation/coverage times and method; direct edition URLs survive reload.
- New editions and latest navigation update URL; all snapshots retain their original content and rules.
- Offset pages may shift during concurrent generation; stable version URLs documented; topic/window editing remains M6.
- `pnpm check` passed typecheck/lint/boundaries and all 19 tests; `pnpm build` passed (existing Zod warnings).
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed all history pages, exact saved snapshots, invalid/missing IDs and prior checks.
- `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile old-version/reload/latest/pagination and existing checks; screenshots updated/inspected.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 266 URLs, four topics, seven healthy sources.
- `pnpm lint` and `git diff --check` passed; API/worker rebuilt/restarted; `/healthz` healthy.
- No LLM/provider/model/billing changes; editorial configuration still pending. Next: topic editing and arbitrary-window UI; semantic evaluation.

## 2026-11-01: iteration 16 — choose on-demand coverage windows
- Started clean on main; no leftover work; baseline checks, both services and `/healthz` healthy; seven sources returning data.
- Added elapsed 6h/24h/7d presets and custom local-time inputs with explicit browser timezone and half-open coverage labels.
- Client rejects reversed/future/>31-day windows; server independently enforces the same limits; snapshots remain immutable.
- UI warns that older stored coverage may be incomplete; no historical fetch or editorial-quality claim.
- `pnpm check` passed typecheck/lint/boundaries and all 19 tests; `pnpm build` passed (existing upstream Zod warnings).
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 266 URLs, four topics, seven healthy sources.
- `pnpm exec tsx apps/api/scripts/smoke-previews.ts` passed windows/history/versions/preservation/ranking checks; latest 24h has 5/5/3/5 selections.
- `pnpm exec tsx scripts/smoke-ui.ts` passed desktop/mobile preset durations, invalid/custom windows, DST UTC conversion and reload plus existing checks.
- Screenshots updated, mobile custom controls visually inspected; `pnpm lint` and `git diff --check` passed.
- Rebuilt/restarted API and worker; health healthy. No LLM/provider/model/billing changes; editorial configuration still pending.
- Next: topic editing, schedule/budgets; semantic ranking evaluation while editorial configuration remains pending.

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
