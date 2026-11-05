---
name: edition-review
description: Review a news-digest edition as a reader would, and judge its stories and posts. Use when the owner asks how the edition went, how today's or this morning's edition looks, or whether a topic looks right, even without naming this skill.
---

# Edition review

Judge the edition as the reader sees it, then explain any problem with evidence.

## 1. Read it

Get the saved edition, with stories, summaries, outlets and posts, from the
admin API on the VM. `status.sh` in the `status-check` skill shows how, and its
output gives the edition ID. Reader data is at `/api/editions/latest` and needs
no login. The agent's review, if done, is in `docs/edition-reviews/<date>.md`.

## 2. Judge it

For each topic:

- **Stories:** enough of them, distinct, and do they matter?
- **Summaries:** real AI summaries or excerpts? Anything unsupported?
- **Grouping:** one story per event, and no unrelated merges?
- **Posts:** good ones? Do they add something the stories don't?
- **Fallback:** did any section lose its AI editing, and why?

Then the edition: cost, time and AI steps refused. Compare with the last few
editions. Check every `Next` item due in `docs/lead/work/edition-quality.md`.

## 3. Explain problems

Trace a problem to its cause in the saved data and the code before suggesting a
fix. Scores and candidate counts in the admin data often show why something is
missing. Say which conclusions are confirmed and which are inference.

## 4. Report

Say how it reads first, then what's better or worse than before. Propose steering
if something needs fixing, without adding it. Update the workstream file.
