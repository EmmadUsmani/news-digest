## 2026-11-04: iteration 676 — prepare fixed-filter X comparison requests

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 healthy sources and no failed digest jobs; next edition scheduled Nov 5 15:00 UTC.
- Added offline-only comparison request builder: exact current baseline plus A/B requests using Top sort, fixed reply/retweet/language filters, supplied database thresholds/exclusions and two–three supplied ranked story titles joined with OR.
- Preserves tool dates/exact publication window, disables media understanding, requests eight results with max_turns 2 and rejects unsafe exclusions/invalid thresholds/missing reaction context before calls. Does not select stories or execute requests.
- Four synthetic tests cover baseline equivalence, filters/thresholds, invalid inputs and exact windows. No claim operators work through the live tool; that remains an experiment measurement.
- Verification: targeted tests 4/4, pnpm format, pnpm lint:fix, pnpm check (419 unit/209 isolated integration), pnpm build and git diff --check passed. Initial lint failure for missing void test markers corrected before final checks.
- Updated TASKS; archived iteration 659. No source/UI/schema/handbook behavior changes, paid calls or production schedule/model/budget changes. No service restart under STEERING 22: new helper is not imported by running services.
- Next: separately capped experiment runner/admission and results reporting, then two-day same-window comparison under STEERING 30. Nov 5 grouping/NBA checks retain priority.
