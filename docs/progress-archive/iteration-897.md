## 2026-11-05: iteration 897 — Sources collection switches

- Started clean on main; no leftover work. Owner would care: pause or resume a feed directly from Sources without losing its topic connections or saved articles.
- Added protected, strictly validated source enable writes and a default-true column through generated Drizzle migration 0004. Ingestion and active-source status honor the setting across topics; already-running collection may finish. Existing feeds stay enabled.
- Isolated repository/HTTP checks cover pause/resume, preserved connections/counts, missing sources, invalid bodies and anonymous denial. Browser checks intercept all writes and verify both states, reload and failed saves; no live setting changes or paid calls.
- Initial browser count comparison raced incoming collection; replayed one saved live snapshot consistently. Refreshed eight Sources/dialog screenshots; desktop light/mobile dark visually reviewed. Discarded unrelated separation screenshots.
- Pre-migration private database backup succeeded; migration applied. Updated TASKS and Operations handbook; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries and 507 unit tests, then ended with signal 143 during integration without an assertion failure. Standalone pnpm test:integration passed all 220, including schema parity. pnpm build; smoke-admin-sources.ts; smoke-admin-separation.ts; check-handbook.ts 08-operations; git diff --check passed.
- All four services restarted and active; /healthz database/Redis green, 36/36 feeds enabled/active with collection through 22:48 UTC; saved reader endpoint 200 and alerts clear.
- Next: remaining topic discovery settings and final reader; Nov 6 scheduled edition/grouping review and fresh-window X round after 21:00 UTC. No X activation before decision.
