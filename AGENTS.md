# AGENTS.md: standing instructions for the build agent

Read `MISSION.md` (repo root) first; it is the source of truth for the product.
`STEERING.md` holds newer owner instructions and overrides it where they
conflict. Never edit `MISSION.md`, `BOOTSTRAP.md` or anything under
`~/agent-control/`.

## Every iteration

1. Read MISSION.md, STEERING.md, TASKS.md, and the tail of PROGRESS.md.
2. `git status` / `git log -5`; recover or deliberately discard leftover work.
3. Fix broken things first: build, tests, services, `/healthz`, stalled
   sources, failed digest runs.
4. Then complete one meaningful, verified step. Prefer user-visible progress
   (real content, better digests, better UI) over internal polish.
5. Verify, update TASKS.md and PROGRESS.md (15 lines or fewer per entry),
   commit, `git push origin main`, and restart services so the live app
   matches `main`.

## Environment

- exe.dev VM, Ubuntu-based. You have passwordless sudo. Project at
  `~/news-digest`.
- App URL: `https://news-digest.exe.xyz/` maps to `0.0.0.0:8000` on this VM
  (private to the owner).
- Secrets: `~/.config/news-digest/env` (mode 600). Read keys from there. Never
  print, log or commit them.
- App LLM: the Anthropic API with `ANTHROPIC_API_KEY` from the secrets file.
  It is a dedicated workspace with a hard $15/month limit. Haiku triages and
  Sonnet edits; see MISSION.md "LLM usage inside the app" and STEERING.md
  item 3.
- The exe.dev LLM gateway `https://llm.int.exe.xyz` (no key) is only for the
  xAI `x_search` evaluation. Never spend the OpenAI ChatGPT-subscription quota
  on app traffic.
- GitHub: `origin` goes through the exe.dev GitHub integration
  (`github.int.exe.xyz`). For `gh`, set `GH_HOST=github.int.exe.xyz`.
- Long-lived app processes are systemd **user** units named
  `news-digest-<role>.service`. The supervisor health-checks all of them plus
  `http://localhost:8000/healthz`.

## Engineering rules

- pnpm workspace: `apps/web` (React + Vite SPA), `apps/api` (NestJS,
  Domain-Driven Hexagon), `packages/*` (shared contracts).
- Hexagonal boundaries are enforced by tooling. Domain code never imports
  NestJS, database or HTTP code. External systems (sources, LLM, X, queues)
  are reached only through ports.
- One command runs everything CI-like (for example `pnpm check`: typecheck,
  lint, boundaries, unit and integration tests). Keep it green.
- Tests never call live external services. Use recorded fixtures for source
  adapters. Live checks are separate, explicit and budgeted.
- Never label fixture or mock content as live.

## Git

- Work on `main`. Small clear commits. Push after every verified step.
- Never force-push, rewrite history or change remotes.
- Never commit secrets, `.env*`, databases, logs, `node_modules`, `dist` or
  coverage output.

## Hard limits (see MISSION.md section 8)

- No purchases, paid plans or account signups.
- No real emails or notifications.
- No exe.dev sharing/DNS changes.
- No scraping that depends on evading bot protection.
- Only the owner edits owner files.

Run `pnpm format` and `pnpm lint:fix` before every commit.
