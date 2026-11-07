# Observability

**Status:** Grafana has zero restarts since 22:33 UTC Nov 6 (lead check 19:09
UTC Nov 7). New issue Nov 7: the metrics store hit its 1% CPU cap, causing a
scrape alert at 13:45. The agent began a 2% CPU trial at 16:00, healthy since.
It was holding all app deploys until a large natural compaction, an open-ended
gate. Owner removed the hold; steered as item 49 (deploy by 23:00 UTC Nov 7).

**Next:**

1. Read item 49's ack: deployed commit, migration applied, checks pass.
2. Grafana passes 22:33 UTC Nov 7 with no restart: close the Grafana check.

**Budget:** the owner raised the whole-stack RAM target to about 800 MiB on Nov 7
(item 45). The stack uses about 754 MiB. CPU and disk budgets are unchanged.
