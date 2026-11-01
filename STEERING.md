# Steering

The owner writes instructions here, often by editing on GitHub. The agent reads
this file every iteration, and it overrides MISSION.md where they conflict. The
agent only appends `ack: <date> <what you did>` lines under an item.

## 1. TOP PRIORITY: formatting and linting (2026-11-01)

Do this before any other task, at the start of the next iteration that has
model quota. The code has no formatter, and the only ESLint config is a single
line using the basic `recommended` rules. Fix that across the whole repo:

- **Prettier:**
  - Add Prettier with a root config (`.prettierrc`), `.prettierignore`
    (dist, lockfile, generated output) and `.editorconfig`.
  - Add root scripts `format` (write) and `format:check`.
- **ESLint:**
  - Replace `eslint.config.mjs` with a real flat config:
    - `typescript-eslint` type-checked rules for `apps/api`, `packages/*` and
      `scripts`
    - React (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) for
      `apps/web`
    - import hygiene (sorted, no duplicate or unused imports)
    - `eslint-config-prettier` last, so lint and format never conflict
  - Lint every TS/TSX file in the workspace, including tests, the SPA and the
    configs.
  - Add `lint:fix`.
- **Make it enforced:**
  - Add `format:check` and lint (zero warnings) to `pnpm check`.
  - Add a one-line rule to AGENTS.md: run `pnpm format` and `pnpm lint:fix`
    before every commit.
- **Reformat everything:**
  - Run Prettier over the whole repo as one formatting-only commit with no
    behavior changes.
  - Add that commit's hash to `.git-blame-ignore-revs`.
  - Then fix what `eslint --fix` can't, in separate small commits.
  - If a rule would need a large risky rewrite, disable it in the config with
    a comment saying why, and add a follow-up to TASKS.md. Do not leave the
    build red.
- **Verify:**
  - `pnpm check` (typecheck, lint, format check, boundaries, all tests and
    specs) passes.
  - The API and web build.
  - The services restart healthy, `/healthz` is ok, and the digest page still
    renders (Playwright screenshot).

Only after this is green, resume the normal task order.

## 2. LOWER PRIORITY: real DB verification, then an ORM (2026-11-01)

Do this after item 1. It ranks below the milestone in progress: add it to
TASKS.md as two tasks, 2a and 2b. Work on it when the current milestone is done
or blocked (for example, M3 waiting on an LLM model decision). The owner does
not want raw SQL queries in the app. **2a must be finished and green before 2b
starts.**

### 2a. Verification infrastructure strong enough for a data-layer refactor

- **Containers:** add DB integration tests that use Testcontainers (Docker
  works on this VM).
  - Postgres uses the same image and major version as `compose.yaml`
    (including pgvector if used). Redis is there for BullMQ flows.
  - Each test run starts fresh containers, runs every migration from zero,
    and seeds from fixtures.
  - Tests must never touch the live database.
- **Repository characterization tests:** cover every repository and every
  query against the current raw-SQL code, so the tests pin today's behavior.
  - Include create/read/update/delete, filters, ordering, limits, dedupe,
    unique constraints, upserts, transactions and rollback, and JSON columns.
  - Include timestamp and time-zone handling, window boundaries, and topic
    deletion and reordering.
  - Also cover `operations.status` and anything else that queries the DB
    directly.
- **API tests:** add end-to-end tests that boot the NestJS app against the
  containers and call the real HTTP endpoints. Cover health, topics, settings,
  digests and editions.
- **Golden test:** given fixed fixture content, the generated digest edition
  stays the same.
- **Commands:**
  - Add `pnpm test:integration` and include it in `pnpm check`.
  - Keep fast unit tests separate, so they still run quickly.
  - Report coverage for the `database/` layers and document the commands in
    README.
- The tests must be written so they pass unchanged after the ORM swap. Test
  through repository ports and HTTP, not through SQL strings.

### 2b. Replace raw SQL with an ORM

- **Default: Drizzle ORM** plus drizzle-kit. It is type-safe, thin and
  SQL-shaped, works with pgvector, and suits the hexagonal layout. You may
  pick another ORM only if you write down a clear reason in
  `docs/decisions/`. Record the choice there either way.
- **Hexagonal boundaries:**
  - The ORM lives only in each module's `database/` adapters and `libs/db`.
  - Mappers convert rows to domain entities.
  - The domain and application layers never import the ORM. Enforce this with
    dependency-cruiser and ESLint rules.
  - After the swap, ban direct `pg` / `pool.query` use outside `libs/db`.
- **Schema and migrations:**
  - Write a Drizzle schema that exactly matches the current migrated
    database. Prove it with a test: running drizzle-kit against a freshly
    migrated container shows no difference.
  - Then move future migrations to drizzle-kit, keeping the existing 001–014
    history valid.
  - Back up the live database with `pg_dump` before running the first new
    migration. Migrations must never drop data.
- **Swap gradually:** convert one repository or module per commit. The 2a
  suite must pass unchanged after every commit.
  - Use Drizzle's typed `sql` template only where the query builder can't
    express something (for example, complex CTEs or vector operators). Keep
    those inside repositories and comment why.
- **Done when:**
  - No raw-SQL query strings remain in the application code.
  - `pnpm check` (including integration tests) passes.
  - Services restart healthy and the live data is intact.
  - The digest page still renders.
  - Update the architecture notes in README/docs.
