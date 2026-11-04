## 2026-11-04: iteration 674 — persist actual X search execution traces

- Started clean on main; no leftover work. Zero alerts; healthy healthz/database/Redis, 36 nonempty sources without current errors and four available queues.
- Read STEERING 30 and full X search plan; completed its tool-call instrumentation slice. Store exact provider-reported custom-tool function/input pairs atomically with settlement cost, including responses with unusable citations. Never infer queries from prompts/prose.
- Added nullable JSONB migration 056, Drizzle schema/baseline, schema metadata and Social posts handbook description. Nine historical calls remain NULL; per-topic threshold settings and experiments remain next.
- Synthetic protocol tests cover keyword/semantic calls, exact query/sort input, malformed/missing tool calls, empty citations, orchestration forwarding and isolated ledger persistence. No paid calls or production search/schedule/model/budget changes.
- Verification: pnpm format, pnpm lint:fix, pnpm check (415 unit/208 isolated integration), pnpm build, git diff --check and social-posts handbook check passed.
- Saved private mode-600 pg_dump outside repo; pg_restore listing readable. Applied pnpm migrate; owner_ro SELECT/owner_rw UPDATE privileges remain valid for the new column.
- Restarted API/worker active; healthz healthy, zero alerts, 36 nonempty sources without errors and four available queues. Updated TASKS; archived iteration 657. SOURCES unchanged: no source behavior change.
- Next: per-topic X thresholds/exclusions, then separately capped two-day comparison under the approved plan. Nov 5 grouping/NBA checks retain priority.
