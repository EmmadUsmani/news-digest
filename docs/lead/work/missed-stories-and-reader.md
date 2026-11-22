# Missed stories, evaluation and reader features

**Status (05:15 UTC Nov 22):** item 73 mostly done. The paid matching run
cost $0.0098 (eight Haiku calls, 12 pairs, none plainly wrong), and developing
stories are on for scheduled editions (`2c2071f1`). The first real test is the
Nov 22 edition. The event budget was rejected (`ff60bfe4`): the scripted replay
improves 2 of 10 Nov 17-18 topic-editions (NBA 33% to 14%, U.S. 22% to 13%)
with no lost facts, and Nov 12-16 can't be measured without paid editor calls
(`3f2576df`). The agent is idling again: 48 no-commit runs from 00:17 to 04:52
UTC, broken by a restore-check OOM fix (`cfaaac8c`), then idle again until the
15:00 edition. Misses so far: "not shortlisted" leads both days (Nov 20 22 of
40, Nov 21 24 of 40). Owner approved item 74 (`8d6477fc`): find the stage where
those misses drop out, fix it, and measure on Nov 20-21 pools now. The deploy
waits for the Nov 22 three-day tally. Event budget closed as rejected.

- Item 68, Missed stories: Current order line 2, just below breakages
  (owner's ranking). Recall per topic goes in each daily edition review, and a
  root-cause fix follows after three editions.
- Item 69, line 8: a labelled event set grows while the agent waits, and
  posts count against the same events as stories (the Nov 18 NBA case).
- Item 70, line 9: developing stories, then "why this", then week in review.
  The design is in [the plan](../../reader-features-plan.md).

**Owner decisions (Nov 19):** excluded the reading-time target, the RSS feed
and "catch me up". NBA scores and standings are deferred until a data vendor is
looked into. Lines 8 and 9 were placed by the lead; the owner can reorder them.

**Next:**

- After the Nov 22 review (item 71), check that the review has a Missed section
  with recall per topic, and that the misses read as real.
- Check that waiting time doesn't turn into daily checkpoint commits (item 66)
  or idle runs.
- Item 73: developing stories in the Nov 22 edition, with a reader screenshot.
- Item 74: by about 15:00 UTC Nov 22, a stage table in the Nov 21 review and
  before/after editor-input reach on Nov 20-21. Idle runs before then mean the
  steer didn't take. After the Nov 22 review: deployed, or held with numbers.
- When "why this" ships, the owner reviews the screenshots.
