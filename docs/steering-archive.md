# Steering archive

Completed owner steering items, moved out of STEERING.md to keep the
per-iteration reading small. They remain binding as records of decisions.

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

ack: 2026-11-01 iteration 51 — configured/enforced Prettier and typed ESLint, isolated formatting commit in blame-ignore, fixed imports and documented scoped legacy-rule follow-ups; 43 tests/build/browser checks pass.

## 3. HIGH PRIORITY (after item 1, before item 2): AI editorial for M3 (2026-11-01)

This answers the M3 model question in NEEDS_FROM_HUMAN.md. Do it right after
item 1, ahead of item 2.

**Status (2026-11-01 21:40 UTC): the key is installed and verified.**
- `ANTHROPIC_API_KEY` is in `~/.config/news-digest/env`.
- A real Haiku test call succeeded.
- `news-digest-api` and `news-digest-worker` were restarted, and both have the
  key loaded.

Build the real Anthropic adapter now (right after item 1), not a placeholder.
The "if the key isn't there yet" fallback below no longer applies.

### Provider and key

- Use the Anthropic API directly with the official `@anthropic-ai/sdk`. Do not
  use the exe.dev gateway or any OpenAI/ChatGPT route for app inference.
- The key is `ANTHROPIC_API_KEY` in `~/.config/news-digest/env`. The owner
  adds it, and the API/worker services already load that file.
- The key belongs to a dedicated Anthropic workspace with a **hard $15/month
  spend limit**. Never print, log or commit it.
- If the key isn't there yet, build everything against a fake `LlmPort`
  adapter with tests. Keep the non-AI ranking as the live behavior, and check
  for the key again each iteration.

### Models (hybrid)

- **Triage with `claude-haiku-5-5`**:
  - Score every candidate item for each topic: relevance, importance, and
    whether it duplicates or belongs to the same story as another item.
  - Use compact item text (title, short excerpt, source).
  - Send batches, and keep every Haiku prompt **under 100k input tokens**.
    Above that, Haiku 5.5 costs 5x as much.
- **Final edit with `claude-sonnet-5-5`**:
  - Work from the shortlist only.
  - Pick the final stories per topic within the digest budgets and write the
    brief.
  - Write 2–3 sentence neutral summaries of the chosen stories, using only
    facts from the source. Use full article text where fetched, at most about
    2.5k tokens per story.
- Use prompt caching for the shared instructions. Use structured JSON output
  validated with a schema; on invalid JSON, do one repair retry.
- Use the Message Batches API (50% off) where latency doesn't matter, for
  example for scheduled triage.
- Make model IDs and the price table configuration, not code constants.
  Prices per 1M tokens:
  - Haiku: $0.10 in, $0.01 cache read, $0.50 out.
  - Sonnet: $2 in, $0.10 cache read, $10 out.

### Budget (the app's own caps on top of the provider's hard cap)

- **Ledger:** record every call in Postgres:
  - model, purpose, digest/run
  - input, cache-write, cache-read and output tokens
  - computed cost
- **Monthly app cap:** `LLM_MONTHLY_BUDGET_USD=14`, kept just under the $15
  provider limit.
- **Daily cap:** whatever is left of the month's budget divided by the days
  left in the month, with a ceiling of `LLM_DAILY_MAX_USD=1.00`. Unspent days
  roll forward, but a bug can never spend the month in one day.
- **Check before every call:** estimate the cost, including `max_tokens`
  worst case, and reserve it. Refuse the call if it would go over.
- **Fallbacks:**
  - When Sonnet's share is used up, finish with Haiku.
  - When everything is used up, publish the digest with the existing non-AI
    ranking and mark the edition as "non-AI" in the UI.
- **Provider limit reached:** Anthropic answers HTTP 400 `invalid_request_error`
  "...workspace API usage limits", or 429 with `error_code`
  `enforced_spend_limit_reached`. Treat either as "budget exhausted until next
  month". Never retry-loop on them.
- **Status page:** show today's and this month's spend against both caps,
  calls by model, and the last provider error.
- **Projected cost:** about $0.25/day at expected volume (about 1,500
  items/day). Record the actual daily cost in PROGRESS.md for the first week.

### Done when

- With the key present, one real end-to-end digest is generated, and its cost
  is shown on the status page and is within the caps.
- Tests cover:
  - the budget math (rollover, ceiling, reservation)
  - the fallbacks
  - provider-limit error handling (with mocked responses)
- Update NEEDS_FROM_HUMAN.md to clear the model question.


