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
