# Incremental triage admission reassessment, Nov 5

Keep incremental triage **off**. Nov 5 establishes a measured full-AI reserve,
but the available morning allowance is small and early pool turnover is high.
Do not reduce the reserve or narrow the edition candidate pool to enable it.

## Budget evidence

Read-only status at 17:44 UTC reports $1.447918 spent this month, $0.315445
today, a $0.494904 daily cap and $0.179459 available. No funds are held.
`readFullAiEditionCosts` returns one qualifying cost: 315445 microdollars.
The configured reserve is enabled, with 1.5 headroom and no explicit override.
The actual configured triage model is `claude-haiku-5-5`.

Production `budgetAllowance` and `scheduledReserveAllowance`, applied to
Nov 6 with the current monthly ceiling and a pending scheduled edition, give:

| Additional Nov 5 spend | Nov 6 daily cap | Protected reserve | Background allowance |
| ---------------------- | --------------- | ----------------- | -------------------- |
| $0                     | $0.502083       | $0.473168         | $0.028915            |
| $0.179459              | $0.494904       | $0.473168         | $0.021736            |

These are conditional projections with zero Nov 6 spending, unchanged policy
and the current qualifying cost list. They are not future ledger observations.
Today's released reserve permits background spend, but that spends tomorrow's
headroom too. One complete edition establishes sizing, not stable daily cost.

## Same-window fingerprint comparison

Compared the Nov 4 16:06 capture with a new Nov 5 17:44 read-only capture for
Nov 4 15:00–Nov 5 15:00 UTC, using the actual configured model and production
triage fingerprint builder:

| Topic                 | Early eligible | Later eligible | Retained | Compatible | Absent | Changed retained |
| --------------------- | -------------- | -------------- | -------- | ---------- | ------ | ---------------- |
| Tech & AI             | 25             | 198            | 0        | 0          | 25     | 0                |
| NBA                   | 3              | 153            | 3        | 2          | 0      | 1                |
| Gaming                | 25             | 198            | 0        | 0          | 25     | 0                |
| World news & politics | 12             | 200            | 0        | 0          | 12     | 0                |

Only 2/65 early fingerprints remain compatible. The other 63 comprise 62
absent candidates and one NBA article-input change; topic settings did not
change. This post-publication capture observes the current loader and text,
not the exact pool or text used at publication. It cannot establish actual
waste, cache hits, final edition membership or saved latency. No incremental
scoring was enabled, and no paid work is attributed to these candidates.

Private mode-600 evidence files live under
`~/.local/share/news-digest/triage-evidence/`:
`nov5-iteration655.json` and `nov5-iteration865.json`.
Reproduce with `scripts/capture-triage-pool.ts` for the same window and
`scripts/compare-triage-cache.ts BEFORE AFTER claude-haiku-5-5`.

## Next decision

Leave the reserve and default-off setting unchanged. Before activation, obtain
prospective captures closer to the actual timer/cutoff and join any admitted
scoring to the publication-time pool to measure consumption and waste. The
existing early capture does not justify spending today's remainder on a
partial-window rollout. Scheduled edition timings remain the live speed test;
no paid trial, cache write, configuration change or generation was performed.
