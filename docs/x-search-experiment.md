# X search experiment preparation

The [owner-approved plan](x-search-plan.md) defines the comparison and decision rule.
The experiment has not run. Production discovery is unchanged.

## Implemented admission

`scripts/lib/x-experiment-budget.ts` provides standalone experiment accounting,
separate from the production database ledger. Amounts are integer USD micros.

| Operation                 | Behavior                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| Reserve                   | Checks $1 per UTC day, $2.50 lifetime and the 13:00–16:00 UTC exclusion before saving a unique request ID |
| Settle                    | Saves known actual usage once and releases unused reservation                                             |
| Unknown outcome           | Keeps the full reservation; no automatic release or retry                                                 |
| Cost above reservation    | Saves the actual cost and blocks further admissions                                                       |
| Restart                   | Reads persisted reservations and settlements                                                              |
| Locked or damaged journal | Refuses admission; never replaces damaged evidence or reclaims stale locks                                |

Updates use an exclusive directory lock, private temporary file, file sync,
atomic rename and directory sync on the VM's local filesystem.

## Remaining runner requirements

- Use one fixed journal path outside the repo for every run and process.
- Derive a defensible per-call cost reservation from provider limits before
  making calls. Admission alone cannot cap an individual provider response.
- Reserve before each paid call; recheck the time exclusion immediately before
  dispatch. Never retry a call with an unknown outcome.
- Persist request, response, exact tool inputs and usage evidence outside the
  repo. Do not ingest experiment posts into production discovery.
- Wire the same-window four-topic comparison, offline scoring and reports,
  then run the two-day comparison within the approved caps.
