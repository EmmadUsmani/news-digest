# Lead setup

**Status:** working. Fresh sessions passed the status and steering tests. Two
parallel sessions worked in separate worktrees, and one steered item 40 correctly.
The original long thread has handed over and is retired.

**Goal:** any session, person or agent can do this work from the repo alone, in
parallel. No single long thread.

**Next:**

1. Check the agent follows Current order: it may remove finished lines or mark
   them blocked, and must flag mismatches in `NEEDS_FROM_HUMAN.md`.
2. Watch the first time two sessions change the same file, and the first time a
   lead session and the agent both change app code.
3. Slim `STEERING.md`, after the X search decision. It's over 72 KB, and the agent
   reads it every iteration. Safe process:
   - Audit every instruction: standing, active, finished, replaced.
   - **Owner approves the list before anything moves.**
   - Move word for word to the archive. Keep item numbers. Unsure stays active.
   - Check by script, test rules with a fresh session, single revertible commit.

**Later:** a daily brief the owner can read without a session, proposed steering
through pull requests, and a short monthly review of this setup.

**Limit:** sessions need SSH access to the VM, and the rule that auto-approves it
is in the owner's personal settings. Other people need their own.
