## 2026-11-05: iteration 844 — preserve schedule-save keyboard focus

- Started clean on main; no leftover work. Alerts clear and health/database/Redis green; scheduled Nov 5 review remains due at 15:00 UTC.
- Save schedule restores focus after success, rejection and timeout, including when saved settings replace the form.
- Desktop/mobile smoke-schedule.ts passed: focus assertions, Enter retry, real timeout, pending locks, rejection/lost-response recovery, saved fields and live topics/profile/full edition immutability. Two focus screenshots inspected; unrelated regenerated screenshots discarded.
- Verification: pnpm format; pnpm lint:fix; pnpm build; pnpm check (497 unit/214 isolated integration passed); smoke-admin-gate.ts passed; git diff --check.
- Static UI served by healthy API; no service runtime changes, so no restart under STEERING 22. No paid calls or live writes.
- TASKS updated; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged (keyboard fix, no new blocker).
- Next FIRST: 15:00 UTC NBA/grouping/cost/latency review, fallback before scorer; X rounds after 21:00 UTC Nov 5/6. Admin identity/proxy verification remains pending.
