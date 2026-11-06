# Observability

**Status:** Grafana is not fixed for good. Item 44 added a health alert and
restored it once, but it hung again at 22:11 UTC on Nov 6 with memory at its
288 MiB reclaim ceiling. The agent restarted it and put its CPU limit back to
3%. The agent's own 31-minute stability check was too short.

**Next:**

1. The agent diagnoses why memory keeps growing (its open task for item 44).
2. Check `obs alerts` shows `GrafanaHealthFailed` clear.
3. Confirm Grafana stays healthy for a full day after the real fix.

**Open:** nothing needs the owner.
