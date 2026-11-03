# Steering & memory

The agent has no memory between iterations except **files in the repo**. They
form a hierarchy: the owner sets direction, and the agent keeps its own plan
and log.

```mermaid
flowchart LR
  subgraph owner["Owner writes"]
    mission["MISSION.md<br/>product vision + rules"]
    steering["STEERING.md<br/>current priorities<br/>(overrides MISSION)"]
  end
  subgraph shared["Shared"]
    agents["AGENTS.md<br/>how to work"]
    needs["NEEDS_FROM_HUMAN.md<br/>blockers for the owner"]
  end
  subgraph agent["Agent writes"]
    tasks["TASKS.md<br/>open work (under 8 KB)"]
    progress["PROGRESS.md<br/>log (under 25 KB)"]
    archive["docs/progress-archive/"]
  end
  mission --> steering
  steering --> tasks
  agents --> tasks
  tasks --> progress --> archive
```

The agent's only write to `STEERING.md` is appending `ack:` lines.

## Who edits what

| File                  | Owner      | Agent                            | Read every iteration?   |
| --------------------- | ---------- | -------------------------------- | ----------------------- |
| `MISSION.md`          | ✏️ writes  | 🚫 never (supervisor reverts it) | Only relevant sections  |
| `STEERING.md`         | ✏️ writes  | Appends `ack:` lines only        | ✅ Yes                  |
| `AGENTS.md`           | ✏️ writes  | Rarely, for workflow facts       | ✅ Auto-loaded by Codex |
| `TASKS.md`            | Reads      | ✏️ maintains                     | ✅ Open items           |
| `PROGRESS.md`         | Reads      | ✏️ appends, archives old entries | ✅ Last ~30 lines       |
| `NEEDS_FROM_HUMAN.md` | Acts on it | ✏️ writes requests               | When relevant           |
| `docs/decisions/`     | Reads      | ✏️ records decisions             | When relevant           |

## How to steer the agent

```mermaid
sequenceDiagram
  actor Owner
  participant GH as GitHub (main)
  participant Agent
  Owner->>GH: add a numbered item to STEERING.md, push
  Note over Agent: next iteration starts
  Agent->>GH: git pull
  Note over Agent: reads STEERING,<br/>reorders TASKS
  Agent->>GH: works the item, commits
  Agent->>GH: appends "ack: item N — what was done"
```

Tips for good steering items:

- **Number them** and state priority explicitly ("TOP PRIORITY", "LOWER",
  "after item 16"), plus a **"Done when"** line.
- **Say what not to do** too ("not now: email delivery"). The agent follows
  exclusions reliably.
- **Archive finished items** to `docs/steering-archive.md`, so every iteration
  reads less.
- Changes take effect at the **next iteration** (usually within minutes). The
  running iteration is never interrupted.
