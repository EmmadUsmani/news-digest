---
name: status-check
description: Report how the news-digest project and its build agent are doing. Use when the owner asks "how's it going", "what's the agent doing", "any problems", "status", or how last night or this morning went, even without naming this skill.
---

# Status check

Find out what changed, judge whether it was useful, and report in plain language.

## 1. Gather

Run `status.sh` from this skill's folder, with the hours to look back (default 12):

```bash
bash .claude/skills/status-check/status.sh 12
```

It prints commits, the agent's acks, app health, alerts, disk, usage and the
latest edition by topic. Then read the `Status` and `Next` lines in
`docs/lead/work/`.

## 2. Judge

Don't just relay the commits. Check:

- **Direction:** do the commits match the current priorities? Many small commits
  on old screens, or endless verification, is a warning sign.
- **Claims of being blocked:** check the real setting.
- **`NEEDS_FROM_HUMAN.md`:** did the agent add anything for the owner?
- **Next checks:** did any item in the workstream files come due? Look at what
  it depends on, such as the edition review or experiment review.
- **Anything surprising:** read the source. A review file or saved data usually
  explains more than a commit message.

Stop once you can answer. Don't investigate what the answer doesn't need.

## 3. Report

- First sentence: is it going well, and does anything need the owner?
- Then what's done, what's in progress, and what's coming next, briefly.
- Say what you verified yourself and what you only read in the agent's notes.
- Propose steering if needed, but don't add it without approval.

## 4. Update

Overwrite anything out of date in the workstream files, then commit and push it
with a `Lead:` message.
