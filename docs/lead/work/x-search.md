# X search

**Status:** acceptance edition 1 of 3 done (Nov 7). Tech and NBA searches
completed; Gaming and World failed twice each (unconfirmed execution). Three
new Tech picks made the edition. Cost $0.166; experiment total $1.75 of $2.50.

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

- Nov 8 and Nov 9 editions: Gaming/World failure rate, picks, cost.
- Watch the $2.50 total: at about $0.17 a day, two more editions fit.

**Open decisions:** none. The meaning-based question is settled.

**Spend:** read the experiment journal for the current figure. Limit $2.50 total.
