## 2026-11-05: iteration 903 — settle saved X experiment usage

- Started clean on main; no leftover work. Owner would care: NBA/World failed-response holds now reflect saved token usage, freeing $0.283288 for the authorized comparison.
- Added offline saved-response reconciliation and hash-linked journal settlements; original reservation entries and response files preserved. Repeated/undispatched settlement rejected; daily/lifetime admission and overrun guards use appended costs across restart.
- Reconciled NBA $0.010383 and World $0.006329 using existing runner rates; saved pre-settlement private journal and verified entries unchanged. Nov 5 charged $0.445318, lifetime $0.977649, remaining $1.522351. Gaming timeout holds retained. No paid calls or activation.
- Verification: targeted budget/CLI suite 9/9; pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 05-social-posts; git diff --check. First full check caught the newly archived page before formatting completed; formatted it and reran. Rerun passed typecheck/lint/format/boundaries, 514 unit tests and 221 isolated integration tests.
- Four app services rebuilt/restarted and active; initial startup health fetch failed, repeat database/Redis health green; real saved Nov 5 edition has four topics. All 36 sources healthy, latest success 23:41 UTC; Nov 6 15:00 schedule retained; alerts clear.
- An unsupported combined obs jobs --check/state invocation failed; corrected to the read-only jobs query. No failed digest runs; historical ingestion/social failures remain alongside healthy sources.
- Updated TASKS, SOURCES, saved experiment review and social handbook; archived iteration 890 to keep PROGRESS small. NEEDS_FROM_HUMAN unchanged.
- Next: one separately admitted retry in experiment and switched-off schedule; then three Nov 5 failed keyword reruns after Nov 6 00:00 UTC. Fair semantic query and fresh Nov 6 comparison follow; no production activation.
- Push first rejected for incoming lead-workflow commits; fetched/merged without rewriting history. Owner lead files left untouched; no app runtime changes. Post-merge formatting/lint and handbook check run before repush.

## 2026-11-05: iteration 904 — separately admit an experiment timeout retry

- Started clean on main; no leftover work. Alerts clear; all 36 sources healthy and no failed digest runs.
- Revised experiment runner retries a transport TimeoutError once with its own -retry-1 request/evidence and fresh $0.15 admission. Original hold stays charged; second timeout stops. Continuation skips attempted cells, preventing a third attempt.
- Offline tests cover successful retry settlement, double-timeout holds/restart, and daily-cap refusal before retry dispatch. Other transport errors still stop without retry; no paid calls or activation.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries, 517 unit and 221 isolated integration tests; pnpm build; check-handbook.ts 05-social-posts; git diff --check.
- Rebuilt/restarted API, worker, docs and schema services; health database/Redis green. Real saved reader edition returns four topics/17 stories; 36 sources healthy, success through 23:50 UTC; next edition Nov 6 15:00 UTC.
- Updated TASKS, SOURCES, experiment notes and social handbook; archived iteration 891 to keep PROGRESS small. NEEDS_FROM_HUMAN unchanged.
- Next: tool-failure/no-execution retry and switched-off scheduler retry, then authorized three failed Nov 5 keyword reruns after Nov 6 00:00 UTC. Fair semantic query and fresh Nov 6 round follow. Fixed production search remains off.
- First push rejected for incoming owner workflow commits; fetched/merged without rewriting history. New Current order keeps X reliability first. Owner files unchanged by this iteration; post-merge formatting/lint/handbook verification before repush.
