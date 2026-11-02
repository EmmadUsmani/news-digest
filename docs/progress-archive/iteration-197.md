## 2026-11-02: iteration 197 — register scheduled UTC budget identities

- Started clean on main; API/worker, health and 32 sources healthy. No leftover work.
- Wired ten-second scheduler refresh to register today's cron-resolved UTC slot with the stable edition publication key, before BullMQ schedule updates.
- Read expected identity before loading settings; stale refreshes cannot replace a newer registration/reconciliation. Preserve claimed/retrying/terminal work and prior days; no-slot days create no identity.
- Three isolated Postgres tests cover restart, past-slot retention, settings changes, obsolete claims, running/retrying/failed protection, UTC rollover, stale-snapshot races, missing slots and invalid settings.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (109 unit/102 integration), `pnpm build`, `git diff --check` passed. First check caught import-sort formatting; reformatted and reran successfully.
- Restarted API/worker: both active, health DB/Redis true, SPA 200, four queues available, 32 sources without errors, latest real edition four topics/10 posts. Read-only DB check confirms today's 15:00 UTC identity; next queue slot Nov 3 15:00 UTC.
- Updated README, reserve decision and TASKS; archived iteration 182 to keep orientation bounded. No UI changes, paid inference or Reddit requests.
- Reserve enforcement remains UNFINISHED. Next: worker claim/retry/stall recovery, terminal outcomes and obsolete/missed-slot release (including today's already-published run), then shared-lock ledger admission/races and manual/Status visibility.
