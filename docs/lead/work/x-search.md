# X search

**Status:** test in progress. The new search isn't live. Production still runs
the old open search.

**Goal:** find viral posts the news hasn't picked up. Free links from articles
already cover press-linked posts. See [the plan](../../x-search-plan.md).

**Design:** one paid keyword search per topic. Grok writes general words and
well-known names from the topic description. Code adds filters, likes minimum and
exact time window.

**Latest:** Nov 6 rerun of NBA, Gaming and World: 2 of 3 failed (NBA and World
tool calls, zero posts). Gaming gave 3 verified posts (median 1,058 likes). Spend
is $1.31 of $2.50 over 23 calls. The fixed search is still OFF in production.
Item 39 is not finished.

**Next:**

- Check the meaning-based test after 21:00 UTC on Nov 6, the agent's priority 2.
- Then the agent decides by the plan's rule. Earliest live edition is Nov 7.

**Open decisions:** whether meaning-based search stays. Owner decides any split
of the $0.40.

**Spend:** read the experiment journal for the current figure. Limit $2.50 total.
