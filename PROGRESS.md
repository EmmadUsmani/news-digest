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
