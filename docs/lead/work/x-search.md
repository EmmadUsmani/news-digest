# X search

**Status:** acceptance run 3 of 3 done (Nov 9). All four searches worked first
try, 40 new candidates, $0.260. Only NBA used them (2 picks); World picked no X.
Agent's verdict: runs reliably, but quality acceptance **not met**: selected
posts have no saved engagement figures, and novel picks fell from 8 to 2
([review](../../edition-reviews/2026-11-09.md)). Tuning waits for item 50.

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

- Owner decided Nov 10: keep paying and keep the daily keyword search running
  while tuning waits. No steering needed. Journal: $1.75 of $2.50 spent, about
  three days left. Before it reaches $2.50, ask the owner whether to raise the
  limit or let it stop.

**Open decisions:** none. The meaning-based question is settled.

**Spend:** read the experiment journal for the current figure. Limit $2.50 total.
