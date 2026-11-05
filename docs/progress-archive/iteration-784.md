## 2026-11-05: iteration 784 — reuse loaded X widgets on card retry

- Started clean on main; no leftover work. Alerts zero, health/database/Redis green, 36 sources healthy and no failed retained jobs. Four services active; next edition 15:00 UTC.
- X card retries now reuse an already loaded official widget API instead of fetching widgets.js again. Failed script downloads still load a replacement on manual retry.
- Read-only desktop/mobile Playwright replay passed success, blocked script, widget timeout, rejection and empty-result recovery. Failed cards reuse one script; blocked downloads fetch a replacement. Saved text/links remain, no overflow/page errors, saved edition unchanged. No live provider calls.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-posts.ts /tmp/783-posts.jsonl; smoke-admin-gate.ts; git diff --check. Static checks, 497 unit/214 isolated integration tests, build and both browser/gate checks passed. Initial replay-stub lint error corrected before rerun.
- TASKS updated; archived iteration 769. Regenerated screenshots discarded because appearance is unchanged. No handbook/source changes or new human blockers.
- API restarted after web build; final health green and all four services active. No paid calls, stored-edition writes, config/schema or model/provider changes.
- Next FIRST: Nov 5 15:00 UTC NBA/grouping/cost/latency review; investigate fallback before scorer. X rounds after 21:00 UTC Nov 5/6. Identity configuration/proxy verification still block admin rollout.
