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
