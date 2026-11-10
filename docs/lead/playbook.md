# Lead playbook

How lead sessions work, and what we've learned. These are notes, not facts: check
them against the code. See [CLAUDE.md](../../CLAUDE.md) for the rules. For how the
app and agent work, see the [handbook](../handbook/README.md).

## Key places

| What                   | Where                                                         |
| ---------------------- | ------------------------------------------------------------- |
| Product goals          | `MISSION.md`                                                  |
| Owner's instructions   | `STEERING.md`, finished ones in `docs/steering-archive.md`    |
| Agent's task list, log | `TASKS.md`, `PROGRESS.md`                                     |
| Agent's questions      | `NEEDS_FROM_HUMAN.md`                                         |
| Plans and specs        | `docs/x-search-plan.md`, `docs/ui-spec.md`, `docs/decisions/` |
| Edition reviews        | `docs/edition-reviews/<date>.md`                              |
| VM                     | `ssh news-digest.exe.xyz`, repo at `~/news-digest`            |
| X test evidence (VM)   | `~/.local/state/news-digest/x-experiment/<round>/`            |

## Worktrees

Parallel sessions each use `.worktrees/<workstream>`, which is gitignored. Use
these commands rather than `claude --worktree`, so there's one location. Run
them from the main clone:

```bash
git fetch origin
git worktree add -b lead/<workstream> .worktrees/<workstream> origin/main
ln -s ../../node_modules .worktrees/<workstream>/node_modules
ln -s ../../.env.db.local .worktrees/<workstream>/.env.db.local
```

`main` is checked out in the main clone, so a worktree uses its own branch:

```bash
git pull --rebase origin main   # get the latest
git push origin HEAD:main       # publish
```

When finished, from the main clone:

```bash
git worktree remove --force .worktrees/<workstream>
git branch -D lead/<workstream>
```

**Careful:** `git clean -fdx` in the main clone deletes `.worktrees/`, along with
anything unpushed. So does deleting the clone.

## How the owner works

- **Discuss, then steer.** Ideas and questions get an answer. Steering happens
  after the owner approves it.
- **Plain language.** Short answers, no jargon or internal labels. When a word
  needs explaining, the fault is in the wording.
- **Honest answers.** Say when you were wrong, and change your recommendation
  when the evidence changes. Give an opinion, not a survey of options.
- **Dislikes:** hand-written wording rules, anything needing manual upkeep such
  as saved keyword lists, and busy UI full of system language.
- **The agent never idles.** It should always do something, and the most
  meaningful thing available.
- **Goal first.** Check designs against what the owner wants the product to do.
- **AI describes the system.** The owner doesn't write descriptions of code or
  structure. Any tool that needs them generates them with AI.

## Standing decisions

- **Not now:** feedback buttons and email delivery.
- **Grouping** means "same story", as defined in STEERING item 27. It's done by
  AI, never by wording rules.
- **Paid X search** exists to find what free links can't: viral posts the news
  hasn't reached. Don't pay to repeat what they already cover.
- **Readers see no system language.** Scores, spend and settings are admin-only.
- **Owner database logins** are in the Operations handbook page. Prefer read-only.
- **The X experiment budget** is separate from production's caps.

## Steering traps we've hit

| What went wrong                                             | Lesson                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| "Wait for the Nov 4 run" made the agent idle for two hours  | Say what to do while waiting                              |
| "Never idle" led to 116 commits polishing replaced screens  | Rank meaningful work, and name the warning signs          |
| Agent believed it was blocked on a setting already in place | Tell it to check the real setting. Stale notes mislead it |
| A zero-wrong-merges gate wrongly parked AI grouping         | Set gates from what the product needs, not perfection     |
| UI spec banned "excerpts", so story text vanished           | Ban labels explicitly, and say what stays visible         |
| Decision rule needed a promotion flag that doesn't exist    | Check that a rule can be computed from data we have       |
| Design drifted to story reactions, away from viral posts    | Re-read the owner's goal before each design change        |
| Agent kept re-analysing 47 posts                            | Give every investigation a stopping point                 |
| Items grew long, and the agent rereads them each iteration  | Put designs in a plan under `docs/`, and keep items short |
| Owner's mailbox command crashed: the agent never ran it     | Lead runs every owner command before passing it on        |

## Diagnosing

- **Read primary data before concluding.** The actual queries Grok ran showed
  more than the agent's summary did. The same goes for saved editions and code.
- **Check that a test was fair** before rejecting an idea.
- **Agent reviews are good but cautious.** Read the numbers, then make the call.
- **Agent quiet with no commits:** read `~/agent-control/status/heartbeat.json`
  and `logs/iter-<n>.jsonl` on the VM. The supervisor retries crashes every 5
  minutes forever, so a crash loop looks like a quiet agent.
- **`/admin` returns 200 for any path** once the gate passes, because the page is
  a client-side app. That doesn't prove a page exists.

## Technical gotchas

- **Times:** the edition runs at 15:00 UTC, which is 7:00 AM PT in winter.
  Avoid deploys and paid tests between 13:00 and 16:00 UTC.
- **Local clone:** `pnpm install --frozen-lockfile` fails here. Don't touch the
  lockfile. Prettier works with `npx --no-install prettier`.
- **Editions by API:** the old preview routes are behind the admin gate. Read the
  admin email on the VM from the env file, and never put it in the repo.
- **`scripts/report-edition-timing.ts`** prints a huge JSON blob. Always filter
  it.
- **Shell quoting over ssh:** `$$` expands inside double quotes, and heredocs to
  `python3 -` work well. zsh rejects unquoted globs like `--include=*.ts`.
- **Prettier** runs in the agent's checks, so format files you touch. It skips
  `STEERING.md`, but keep that file tidy anyway.
