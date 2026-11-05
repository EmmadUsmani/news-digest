---
name: steer
description: Write instructions for the news-digest build agent in STEERING.md after the owner approves them. Use when the owner says yes to proposed steering, or asks to steer, tell the agent, or add something to its priorities. Don't use during discussion, or when the owner says not to steer yet.
---

# Steer the build agent

Steering directs an unattended agent, so approval and wording both matter. If
the owner hasn't approved this exact direction, propose it and stop.

## 1. Before writing

- `git pull --rebase origin main`, then read the recent items and acks in `STEERING.md`.
  Another session may have just steered something related.
- If this conflicts with another item's priority, ask the owner to choose.
- Re-read the owner's goal. Check the design hasn't drifted from it.
- Read "Steering traps" in `docs/lead/playbook.md`.

## 2. Write the item

Append a new item, using the next number:

```markdown
## 40. NOW: short title (YYYY-MM-DD)
```

Make sure it says:

- **Why,** in a sentence or two, with the facts it rests on.
- **Priority** relative to named open items.
- **What to do,** in order, with exact files where you know them.
- **What to do while waiting,** if anything has to wait.
- **What not to do,** and when to stop.
- **Done when,** and what the ack should report.
- **Limits:** budget, the 13:00–16:00 UTC window, edition protection.

Rules must be computable from data that really exists. For anything larger than
a short item, put the design in a plan under `docs/` and link it.

If this replaces part of an older item, add a one-line pointer under that item.
The agent only appends `ack:` lines, so older text must not contradict the new.

## 3. Publish

```bash
npx --no-install prettier --write <files you changed>
git add <files> && git commit -m "Steer: <what> (item N)"
git push origin HEAD:main
```

**Commit and push straight away,** so other sessions see it. If the push is
rejected, run `git pull --rebase origin main`. If another session took your number, renumber
yours and push again. Never force-push.

## 4. Finish

- **Update the workstream file** in `docs/lead/work/`. This step isn't optional.
- Tell the owner the commit, what the agent will do, and what to watch for.
