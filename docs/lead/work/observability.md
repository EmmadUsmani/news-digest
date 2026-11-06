# Observability

**Status:** Grafana hung on Nov 6 (unit `active`, health check gets no answer).
It sits at its 208 MB memory ceiling with a 2% CPU quota. Steered as item 44.

**Next:**

1. Read the agent's ack on item 44: the cause it found, limits before and after.
2. Check `obs alerts` now flags a failing Grafana health check.
3. Confirm Grafana stays healthy a day after the fix.

**Open:** nothing needs the owner.
