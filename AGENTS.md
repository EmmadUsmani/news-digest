# AGENTS.md: standing instructions for the build agent

Read `MISSION.md` (repo root) first; it is the source of truth for the product.
`STEERING.md` holds newer owner instructions and overrides it where they
conflict. Never edit `MISSION.md`, `BOOTSTRAP.md` or anything under
`~/agent-control/`.

## Every iteration

1. Read STEERING.md, the open items of TASKS.md and the tail of PROGRESS.md.
   Read only the MISSION.md sections your task needs (see Token efficiency).
2. `git status` / `git log -5`; recover or deliberately discard leftover work.
3. Run `pnpm obs alerts` for a cheap local alert snapshot. Fix broken things first: build, tests, services, `/healthz`, stalled
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

## Token efficiency (Codex quota is shared and limited)

Every command's output stays in your context and is re-sent on every later
step. Large outputs therefore cost many times their size. The supervisor paces
iterations against the weekly quota, and each prompt says whether you are on
pace.

- **Cap output:**
  - Pipe through `| tail -n 40`, `| head -n 60` or `| head -c 6000`.
  - Never print whole JSON payloads, status dumps, HTML, logs, lockfiles,
    screenshots-as-JSON or full test output.
  - Extract only the fields you need (`jq '.field'`).
- **Read narrowly:**
  - Use `rg -n` with specific patterns, then `sed -n 'a,bp'` for the lines
    you need.
  - Don't `cat` large files, and don't re-read a file already in this
    session.
- **Tests:**
  - While developing, run targeted tests with quiet reporters that print
    failures and a summary only.
  - Run the full `pnpm check` once before committing, with output trimmed to
    failures and the summary.
- **Keep the per-iteration orientation files small:**
  - TASKS.md holds open work and one-line done markers (under about 8 KB).
  - PROGRESS.md entries are 15 lines or fewer. Move older entries to
    `docs/progress-archive/` when the file passes about 25 KB.
- **Scope:** one meaningful, verified step per iteration. Skip exploratory
  side quests, repeated audits and speculative refactors.
- **Never trade correctness for tokens:** always verify the code you changed.

## Owner handbook and DB explorer metadata

`docs/handbook/` explains the system to the **owner**: a technical reader who
doesn't read the code. It is **not agent memory**. Task status, plans and logs
belong in TASKS.md and PROGRESS.md, never in the handbook. Follow
`docs/handbook/about-these-docs.md` (style rules and diagram checklist).

- **You are its editor.** Keep it true and readable as the system changes:
  add, rewrite, merge, split or delete pages and diagrams as needed, and
  remove anything stale. Describe how things work now, at system level
  (components, flows, jobs, data, budgets, operations), not code level.
- **Same commit as the change:** when a change alters what a page describes
  (a service, queue, schedule, external system, data flow, budget rule, table
  group, URL, or agent-harness behavior), update the page in that commit. Bug
  fixes and internal refactors usually need no doc change.
- **DB explorer metadata:** when a migration adds, renames or drops a table or
  a relationship without a foreign key, update `docs/schema-meta.json` (group,
  one-line note, implicit relations) in the same commit. Target: no warnings
  and no "Unassigned" tables.
- **Verify** with `pnpm exec tsx scripts/check-handbook.ts [page-filter]`
  (render errors, broken links, metadata drift). Look at the PNGs of the
  diagrams you changed (in `/tmp/handbook-diagrams/`): no line may cross
  another line, a box or a title.
- **Short and plain (owner request, 2026-11-04):** the README and the
  handbook pages were rewritten because they had grown into long lists of
  caveats.
  - **What goes in:** how things work and how to use them, as tables and
    bullets.
  - **What stays out:** test evidence, measurement caveats ("this does not
    prove…"), edge cases and per-iteration history. Those belong in
    PROGRESS.md, `docs/RANKING.md` or `docs/DATABASE-VERIFICATION.md`.
  - **README.md is a landing page,** not a manual.
  - **Length limit:** `check-handbook.ts` fails a page, or the README, over
    100 lines outside code blocks. When one grows, cut or split it; don't
    append.
- **Keep it cheap:** edit only the affected pages. Don't re-read the whole
  handbook each iteration.

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
- Only the owner edits owner files. `CLAUDE.md`, `.claude/` and `docs/lead/`
  belong to the owner's lead sessions: leave them alone.

Run `pnpm format` and `pnpm lint:fix` before every commit.
