# Archived progress

## 2026-11-02: iteration 156 — bounded Anthropic rate-limit backoff

- Started clean on main; no leftover work. API/worker healthy, 32 sources without current errors; digest queue has zero failures. Two historical ingestion failures remain retained.
- STEERING 7 partial: ordinary HTTP 429 rejections retry at most twice within one existing reservation; default waits 1s/2s, honoring Retry-After seconds/dates up to 10s per wait. Longer deadlines fail rather than retry early.
- Spend-limit responses remain immediate monthly blocks; transport/other HTTP failures never retry. Successful inference usage settles once; exhausted failures retain conservative reservations.
- Fake HTTP tests cover retry recovery/exhaustion, one reservation/settlement, long deadlines, date parsing and non-retry failures. No live inference calls or spend.
- `pnpm exec tsx --test apps/api/test/llm.test.ts`: 19 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and 157 isolated tests pass. Initial check caught SDK headers typed any; narrowed before green rerun.
- `pnpm build` passes; restarted API/worker; `/healthz` healthy and `/api/digest-previews/latest` returns the stored four-topic edition. No new publication or schedule/source/UI changes; source docs unchanged.
- Updated TASKS/docs/RANKING and archived progress 133–134 to stay below 25 KB. No new blocker; next: shared concurrency/parallel editors, async jobs/window dedupe/progress and full-edition timing. Item 7 remains open.
