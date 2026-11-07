# Observability

**Status:** Grafana has zero restarts since 22:33 UTC Nov 6 (lead check 19:09
UTC Nov 7). New issue Nov 7: the metrics store hit its 1% CPU cap, causing a
scrape alert at 13:45. The agent began a 2% CPU trial at 16:00, healthy since.
It holds all queued app deploys until it sees a large natural compaction, an
open-ended gate ([decision 0004](../../decisions/0004-observability-capacity.md)).

**Next:**

1. Grafana passes 22:33 UTC Nov 7 with no restart: close the Grafana check.
2. Owner decision pending: time-box the metrics gate so fixes ship before the
   protected window before the Nov 8 edition.

**Budget:** the owner raised the whole-stack RAM target to about 800 MiB on Nov 7
(item 45). The stack uses about 754 MiB. CPU and disk budgets are unchanged.
