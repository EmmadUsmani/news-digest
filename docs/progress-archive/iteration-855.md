## 2026-11-05: iteration 855 — recover durable job links during Redis read outages

- Started clean on main; no leftover work. Alerts clear, 36 sources healthy and no failed digest jobs; X tests await 21:00 UTC, admin rollout awaits identity/proxy evidence.
- Saved completed and recorded failed on-demand job links now fall back to Postgres when the initial Redis lookup rejects. Unknown jobs preserve the outage error rather than falsely returning 404; no generation or paid calls.
- Extended the isolated queue test with Redis read rejection: completed edition and generic failed status recover, unknown ID rejects with the original error, and generation count stays unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (499 unit/215 isolated integration); pnpm build; git diff --check; check-handbook.ts 03-jobs-and-schedules (18 pages/2 diagrams, 27 tables, no warnings); smoke-admin-gate.ts; /healthz; obs alerts/sources/jobs.
- API/worker restarted healthy; initial smoke raced startup, rerun passed. Saved edition byte-identical, all 36 sources healthy, no failed digest jobs and alerts clear. Jobs handbook/TASKS updated; no UI/schema/source/budget changes.
- Next: X fresh-window tests after 21:00 UTC Nov 5/6, editor-v5 evidence Nov 6; unfinished/stalled durable history and admin identity/proxy verification remain open.
