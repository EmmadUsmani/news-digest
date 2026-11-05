# X search

**Status:** test in progress. The new search isn't live. Production still runs
the old open search.

**Goal:** find viral posts the news hasn't picked up. Free links from articles
already cover press-linked posts. See [the plan](../../x-search-plan.md).

**Design:** one paid keyword search per topic. Grok writes general words and
well-known names from the topic description. Code adds filters, likes minimum and
exact time window.

**Latest:** Nov 5, only 1 of 4 keyword searches ran. Tech gave 10 posts, median
1,580 likes, 2 usable. NBA's tool failed, Gaming timed out, World never ran the
query. Steered reliability fixes in STEERING item 39.

**Next:**

- Check the reliability fixes and tonight's rerun of NBA, Gaming and World.
- Check the fair meaning-based test after 21:00 UTC on Nov 6.
- Then the agent decides by the plan's rule. Earliest live edition is Nov 7.

**Open decisions:** whether meaning-based search stays. Owner decides any split
of the $0.40.

**Spend:** read the experiment journal for the current figure. Limit $2.50 total.
