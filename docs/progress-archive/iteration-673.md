## 2026-11-04: iteration 673 — extend offline batching to social pools

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- Offline batching now accepts validated local article/social inputs with supplied topic context; invokes the real kind-specific triage prompt, purpose and cache namespace. Existing recorded article mode preserved.
- Reports aggregate shape only; synthetic provider/cache stay in process, with no database/environment/provider dependency or paid calls. Invalid input exits with a bounded diagnostic.
- Synthetic 101-post social probe: caller sizes 10/25/50/200 produced 11/5/3/3 requests; 50/200 share bytes but have sequential `[1,1,1]` versus concurrent-capable `[3]` barriers. No live latency/quality/cost claim or production change.
- Targeted `pnpm exec tsx --test apps/api/test/triage-batching.test.ts`: 7/7; default CLI: 36 article rows, zero repeat requests; supplied social CLI and missing-file rejection checked.
- Updated TASKS/RANKING; archived iteration 656 to keep PROGRESS bounded. No affected handbook/source/schema behavior.
- Verification: pnpm format, pnpm lint:fix, pnpm check (415 unit/207 isolated integration), pnpm build and git diff --check passed. Live: API/worker active, 36 sources/zero current errors, four-topic saved edition, zero alerts.
- Runtime/config unchanged: no restart under STEERING 22. Push initially rejected by new owner commits; fetched and merged docs-only changes without rewriting history.
- Read new STEERING 30 and plan opening; added X search redesign as next product priority. Full plan still needs reading before implementation; production/experiment budgets remain separate.
- Next: STEERING 30 X search plan; Nov 5 grouping/NBA checks take priority when available.
