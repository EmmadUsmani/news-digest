## 2026-11-04: iteration 669 — reuse triage fingerprint context

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- Article/social triage now serializes and hashes shared instructions/model/topic once per pool, copying hash state for each candidate.
- Existing JSON bytes/cache keys, prompts, models, budgets and candidate coverage unchanged; incremental triage remains off.
- Differential synthetic regression covers 200 escaped/Unicode/truncated candidates per mode, reverse-order probes and warm scoring without new calls.
- Local synthetic 60,000-fingerprint benchmark: legacy 1,718 ms, shared context 536 ms. CPU preparation only; no measured live edition speed improvement or paid calls.
- Updated TASKS/RANKING; internal optimization needs no handbook/schema/SOURCES changes.
- Verification: targeted triage 23/23; pnpm format, pnpm lint:fix, pnpm check (410 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker active; healthz healthy, zero alerts, all 36 sources without current errors. Saved edition remains four topics/14 stories/15 posts.
- Next: Nov 5 grouping admission/accuracy/cost/latency/screenshots, NBA full-AI outcome, World posts and Bluesky repair tail.

## 2026-11-04: iteration 670 — replay recorded token work before latency tuning

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis and all 36 sources nonempty without current errors.
- Added offline call-usage evaluator and allowlisted Nov 4 metadata for all 43 Anthropic calls; no prompts, response text, secrets, database access or paid calls.
- Groups by purpose/model, separates cache input, retains failed time, counts unknown usage explicitly and rejects invalid/overflowing totals. HTTP token ratios are not decode throughput or predicted speedups.
- Nov 4: triage emitted 89,087/115,032 output tokens (77.4%) and used 326,931/506,615 aggregate HTTP ms (64.5%); zero output-limit stops. Measure actual event/rationale lengths before changing batches; compare Nov 5's changed pipeline.
- Updated TASKS and concurrency review; archived iteration 653 to keep PROGRESS bounded. No runtime/handbook/schema/SOURCES changes; incremental triage remains off.
- Verification: targeted replay 3/3; pnpm format, pnpm lint:fix, pnpm check (413 unit/207 isolated integration), pnpm build and git diff --check passed. First check found archive formatting; corrected and reran successfully.
- Live saved edition remains four topics/14 stories/15 posts. Services unchanged and healthy, so no restart under STEERING 22.
- Next: Nov 5 grouping admission/accuracy/cost/latency/screenshots, NBA full-AI acceptance and World posts; offline response-length measurement if still waiting.
