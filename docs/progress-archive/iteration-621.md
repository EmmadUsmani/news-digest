## 2026-11-04: iteration 621 — deterministic concurrent LLM recordings

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 sources without current errors and no retained failed digest jobs.
- Fixed RecordingLlmAdapter to preserve invocation order when concurrent identical requests finish out of order; failed calls remain omitted. Offline regression reverses completions with a failed middle call, then verifies exact replay order and exhaustion.
- Updated LLM recording documentation and TASKS; archived iteration 604 to keep this file below 25 KB. Real raw-response golden remains open: validated historical results cannot supply raw transport responses.
- Verification: targeted recording tests 4/4; pnpm format, pnpm lint:fix, pnpm check (365 unit/205 isolated integration), pnpm build and git diff --check passed. First check caught formatting in the newly moved archive; fixed before the final run.
- Recorder is imported only by the explicit historical recording script; no running service code/config changed, so no restart under STEERING 22. No paid calls, prompts, fixture recordings, production flags or edition behavior changed.
- Restarted worker only; final healthz healthy, zero alerts/failed units/dangling volumes. Saved Nov 3 edition still serves 19 real stories/11 X posts. No Postgres/Redis restart.
- Next: Nov 4 15:00 UTC edition review; grouping and incremental triage remain off until that review.
