# X search

**Status:** keyword search is switched on in production. First eligible
window is Nov 7, 14:30–14:55 UTC. Three-edition acceptance is still open.

**Goal:** find viral posts the news hasn't picked up. Free links from articles
already cover press-linked posts. See [the plan](../../x-search-plan.md).

**Design:** one paid keyword search per topic. Grok writes general words and
well-known names from the topic description. Code adds filters, likes minimum and
exact time window.

**Latest:** the agent compared the saved Nov 5/6 baselines. Old open search:
0 usable of 38 citations. Keywords: 9 usable (Tech 2, NBA 3, Gaming 4), World 0.
Meaning-based search added nothing and was dropped. Grok 4.3, the caps and the
likes minimums stay. After the fix, 5 of 9 keyword attempts failed.

**Next:**

- Check the Nov 7 window: which topics got usable posts, and the real cost.
- Acceptance needs three editions. Report World separately.

**Open decisions:** none. The meaning-based question is settled.

**Spend:** read the experiment journal for the current figure. Limit $2.50 total.
