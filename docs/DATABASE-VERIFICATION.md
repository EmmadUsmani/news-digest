# Database verification

Run `pnpm test:integration` with Docker available, or `pnpm check` for the full
verification chain. The runner starts fresh PostgreSQL 17 and Redis 7 containers,
applies every migration, runs the explicitly registered integration suite, and
prints Node's native V8 line/branch/function coverage. It never uses the live DB.

## Baseline: iteration 223, November 2, 2026

All 122 integration tests passed. The report includes all 16 source database
adapters/helpers plus the direct operations-status adapter. Migration execution
is a separate setup process and is not included in coverage. The test suite also
loads compiled adapters through the Nest HTTP app; those appear separately under
`dist/`. Their percentages must not be combined with the `src/` measurements.
Native V8 coverage lists only loaded files; check the source inventory before
interpreting missing rows:

```sh
rg --files apps/api/src | rg '/(database|libs/db)/|/operations/adapters/operations.status.ts$'
```

Source rows with branch coverage below 85% in this baseline:

| Source file                                |   Lines | Branches | Functions |
| ------------------------------------------ | ------: | -------: | --------: |
| `libs/db/connections.ts`                   |  85.71% |   60.00% |    83.33% |
| `curation/database/edition-cost.reader.ts` | 100.00% |   80.00% |    75.00% |
| `curation/database/usage.reader.ts`        |  99.12% |   42.86% |    66.67% |
| `operations/adapters/operations.status.ts` |  89.73% |   79.41% |    83.33% |
| `operations/database/topic-coverage.ts`    | 100.00% |   75.00% |    66.67% |
| `topics/database/topic.repository.ts`      |  93.60% |   80.70% |    94.12% |

Module paths above are relative to `apps/api/src/modules/`, except `libs/db`.
The runtime report identifies uncovered line numbers. Remaining source rows have
at least 85% branch coverage; that does not prove every query behavior is pinned.
High line coverage can coexist with missing error paths, JSON shapes, transaction
outcomes or boundary assertions. No coverage threshold currently certifies the
ORM migration as safe. Continue characterization through repository ports and
HTTP, and finish AI golden coverage before declaring STEERING 2a complete.

## Usage reader characterization (iteration 224)

`usage-purpose.test.ts` also pins an empty ledger, UTC day/month inclusion
(including an offset timestamp at midnight), per-model ordering and totals,
failed-reservation exclusion, pending and older uncertain holds, latest error
selection, and current-month versus expired provider blocks. All assertions use
the reader API against disposable PostgreSQL; no provider requests are made.
The 123-test integration run measures this source reader at 100% lines and
92.86% branches (previously 99.12% and 42.86%). The iteration 223 table above
remains the historical baseline. AI golden and other behavior gaps remain open.
