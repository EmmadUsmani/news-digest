# Missed stories, evaluation and reader features

**Status (19:25 UTC Nov 21):** Nov 21 review done (`85b41f05`): event recall
Tech 3/13, NBA 4/11, Gaming 3/6, World 2/11, U.S. 1/12; 40 misses, 24 never
shortlisted. Nov 22 review and the item 71 fix come next. Item 70 "why this"
shipped and acked. Week in review is built and waits for Sunday's edition.
Developing stories is still off: the agent's item 72 ack says the matcher has
no cached responses (a fresh run would be paid) and it read "fits $0.65" as
needing full feature coverage, though the worst day was $0.61. The agent then
idled: 157 of 180 runs on Nov 21 had no commit, 45 in a row since 15:18 UTC,
each citing item 69's one-commit-a-day limit, though item 69's event budget
(step 2) is build work that limit doesn't cover. Steering proposed to owner.

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
- Item 72: owner decides on a paid matcher run; then check developing stories
  in a published edition.
- When "why this" ships, the owner reviews the screenshots.
