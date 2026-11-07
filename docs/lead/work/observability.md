# Observability

**Status:** Grafana is healthy after a third fix, but it hasn't yet held for a
day. The cause of the Nov 6 hangs was a memory limit too small for Grafana's own
program files, so it kept rereading them from disk. Limits are now 448/512 MiB,
restarted 22:33 UTC on Nov 6. Lead check at 00:43 UTC on Nov 7: health 200 in
88 ms, 360 MiB, no restarts.

**Next:**

1. Confirm Grafana stays healthy until at least 22:33 UTC on Nov 7.
2. Check `obs alerts` shows `GrafanaHealthFailed` clear.

**Budget:** the owner raised the whole-stack RAM target to about 800 MiB on Nov 7
(item 45). The stack uses about 754 MiB. CPU and disk budgets are unchanged.
