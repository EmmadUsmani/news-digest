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
