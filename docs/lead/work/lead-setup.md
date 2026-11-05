# Lead setup

**Status:** first version built. It needs testing with fresh sessions.

**Goal:** any session, person or agent can do this work from the repo alone, in
parallel. No single long thread.

**Next:**

1. Steer the agent to build the status script (one command, about 40 lines, with
   commit classification, a stale-workstream flag and size-limit checks).
2. Test with fresh sessions, including two at once, then retire the old thread.
3. Slim `STEERING.md`, after the X search decision. It's 72 KB, and the agent
   reads it every iteration. Safe process:
   - Audit every instruction: standing, active, finished, replaced.
   - **Owner approves the list before anything moves.**
   - Move word for word to the archive. Keep item numbers. Unsure stays active.
   - Check by script, test rules with a fresh session, single revertible commit.

**Later:** a daily brief the owner can read without a session, proposed steering
through pull requests, and a short monthly review of this setup.

**Limit:** sessions need SSH access to the VM. Other people need their own.
