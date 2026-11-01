# Architecture

The pnpm workspace contains a NestJS API serving a React/Vite SPA and shared
Zod contracts. Node 22 is required. The API binds to port 8000 on all interfaces;
PostgreSQL 17 and Redis 7 bind only to VM loopback through Docker Compose.
Volumes survive container replacement. PostgreSQL currently trusts loopback
connections: this is a single-owner VM, not a deployment for untrusted local users.

Use `pg` with explicit SQL migrations: it keeps SQL visible, requires no generated
client, and supports transactions and advisory locks. `schema_migrations` records
applied filenames. Migrations run atomically under a transaction advisory lock;
run from repository root using `pnpm migrate` before starting services.

Future contexts live under `apps/api/src/modules/<context>` with domain,
application use cases, repository ports/adapters and transport controllers.
Dependency-cruiser prevents domain imports of frameworks/I/O and imports of
another context's internals; cross-context public facades go in `public/`.
There is no news ingestion or editorial pipeline yet. The operations BullMQ
worker runs a local heartbeat every minute, retaining ten successful/failed
jobs. This is infrastructure telemetry, never content ingestion.

`/healthz` checks actual database and Redis connections and returns 503 on
failure. Both processes use graceful shutdown and systemd automatic restart.
The default profile, four topics and schedule are persisted by migrations.
`GET /api/profile` and `GET /api/topics` expose read-only settings through
repository ports; editing remains M6. Topic configuration includes guidance,
source/query/account arrays, order, enablement and item budgets. No live sources
are configured yet. The SPA displays these persisted topics and budgets.

The schedule domain validates IANA timezones, daily local-time cron expressions,
ISO elapsed durations (days/hours/minutes/seconds), and 0–20 item budgets.
`coverageWindow` produces a concrete half-open `[start, end)` interval for any
provided end instant; P1D means 24 elapsed hours even across DST transitions.
Calendar months/years are rejected. Scheduling execution and broader cron support
remain M7; there is no claim that daily jobs run yet. Shared contracts publish
CommonJS for NestJS and an ES module build for Vite runtime validation.
