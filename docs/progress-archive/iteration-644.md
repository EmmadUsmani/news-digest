## 2026-11-04: iteration 644 — attribute preparation waste to each replay pass

- Started clean on main; no leftover work. Healthz healthy, zero alerts; Nov 4 scheduled edition pending.
- Offline incremental replay now attributes reusable/wasted score versions to their originating background passes using actual item-cache writes and final probe keys. Reverted inputs credit the original pass; missing pool snapshots remain unknown.
- Synthetic two-item replay reconciles three wasted versions: one from the first pass, two from the second, none from the cached third pass. These are work counts, not paid usage, expiry waste or live latency.
- Targeted replay tests 13/13 pass; CLI verifies 48 rotation scenarios retain unknown waste without snapshots and reconcile scoring totals. Updated TASKS/RANKING; archived iteration 626 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (388 unit/205 isolated integration), pnpm build and git diff --check passed. First check caught archive formatting; formatted it and reran successfully.
- Healthz healthy and zero alerts; no paid calls, sources, prompts, schema or production configuration changed. Offline tools only; no restart under STEERING 22.
- Next: Nov 4 15:00 UTC edition review for open-X/Bluesky/World selections, NBA fallback and timing/cost; incremental triage/grouping remain off.
