## 2026-11-04: iteration 683 — offline failed-batch recovery measurement

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis and 36 healthy nonempty sources; no failed retained digest jobs. Next edition Nov 5 15:00 UTC.
- Added offline first-call refusal/throw probe through real article/social triage loops, with explicit recovery and a final cache-only pass. No provider, DB or secret access; no production retry change or paid calls.
- Synthetic 200-item pool: size-200 caller passes retain 150 sibling scores after failure and recover with one 50-item call; size-25 passes retain zero and recover with eight 25-item calls. Total requested items 250 vs 225; all 200 score successfully once, repeat zero calls. No live latency/cost/failure-rate claim.
- Updated TASKS/concurrency evidence; archived iterations 667–668 to keep PROGRESS small. SOURCES/handbook unchanged because runtime/source behavior is unchanged.
- Verification: targeted recovery tests 2/2, standalone strict tsc, pnpm format, pnpm lint:fix, pnpm check (435 unit/209 isolated integration), pnpm build and git diff --check passed. Initial lint/check caught require-await in fake cache methods; fixed before final checks.
- Final healthz healthy, zero alerts and 36 healthy nonempty sources. No restart under STEERING 22: running services do not import the offline probe.
- X experiment remains blocked on supported per-call bound or owner decision. Next: Nov 5 grouping/NBA/cost/latency/screenshots; compare actual batching/repair evidence before tuning.
