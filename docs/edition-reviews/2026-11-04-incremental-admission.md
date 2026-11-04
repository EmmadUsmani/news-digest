# Incremental triage admission assessment, Nov 4

Iteration 655 leaves incremental triage **off**. The Nov 4 review permits an
activation assessment, but the current reserve gives it no allowance during
the UTC morning of Nov 5. Do not reduce the reserve to manufacture headroom.
The already-enabled story grouping switch is unaffected.

## Observed budget and projected admission

Read-only `/api/status` at **2026-11-04T16:06:24.347Z** reports $1.129264
spent this month, $0.291162 today, a $0.487477 daily cap and $0.196315
available after today's scheduled edition. No funds are held. Configuration
has reserve protection enabled, headroom 1.5, no explicit reserve amount and
incremental triage disabled.

The production full-AI cost reader returns **zero qualifying editions**.
Its gate requires every topic's story and post sections to be AI edited with
no unscored IDs, positive settled cost and no unresolved or verification
calls. Nov 4's mixed NBA outcome cannot size this reserve. Without qualifying
measurements the existing policy protects the whole daily cap, regardless of
its 1.5 headroom setting.

Applying the production budget and reserve functions to Nov 5 with the same
monthly ceiling, no new qualifying edition and a pending scheduled run gives:

| Additional Nov 4 spend | Projected Nov 5 daily cap | Protected reserve | Background allowance |
| ---------------------- | ------------------------- | ----------------- | -------------------- |
| $0                     | $0.495028                 | $0.495028         | $0                   |
| $0.196315              | $0.487477                 | $0.487477         | $0                   |

These are conditional calculations, not future ledger observations. Other
spend, new full-AI editions or owner configuration changes alter the inputs.
At any intervening spend amount the no-measurement policy still protects the
whole cap. Incremental calls clear scheduled-run privileges and cannot use it.

Today after publication, background work could use the remaining $0.196315.
That would prepare only part of Nov 5's Nov 4 15:00–Nov 5 15:00 UTC window:
from activation until midnight, followed by reserve refusal until the
13:00 UTC cutoff. Publication ends that quiet period at 15:00 UTC. Enabling
now therefore cannot establish full-window preparation or the speed target,
and spending the remainder would lower tomorrow's cap. Keep the current
production setting while NBA full-AI acceptance remains unresolved.

## Prospective pool baseline

A read-only capture at **2026-11-04T16:06:50.993Z**, for the next edition's
exact window, finds:

| Topic                 | Loaded and eligible articles | Matching current triage cache rows |
| --------------------- | ---------------------------- | ---------------------------------- |
| Tech & AI             | 25                           | 0                                  |
| NBA                   | 3                            | 0                                  |
| Gaming                | 25                           | 0                                  |
| World news & politics | 12                           | 0                                  |

The private capture is
`~/.local/share/news-digest/triage-evidence/nov5-iteration655.json` (mode 600).
It uses the current newest-200 loader and hard-exclusion admission. Exact
fingerprints come from the actual triage request builder and configured Haiku
model; a read-only cache-key lookup finds no matching rows for these 65
articles. Row presence alone would not prove valid scores or consumption.
This early pool is not the final edition pool, measured waste, paid scoring,
or evidence of later retained membership.

Reproduce a new observation, after loading the secrets file into the shell
without printing it:

```sh
pnpm exec tsx scripts/capture-triage-pool.ts \
  2026-11-04T15:00:00Z 2026-11-05T15:00:00Z \
  /absolute/private/path/new-capture.json
```

Budget calculations use `budgetAllowance` for Nov 5 with month totals
1,129,264 or 1,325,579 microdollars and zero spent that day, then
`scheduledReserveAllowance` with `state: pending`, `scheduledRun: false`,
an empty full-AI cost list and the configured policy. These functions make no
provider calls. The full-AI cost list was read through
`readFullAiEditionCosts`; no historical pool or completed work was fabricated.

## Next evidence

After Nov 5 publication, compare this capture with a new same-window capture
using `scripts/compare-triage-cache.ts` and the explicit configured model.
That measures prospective compatibility only. Actual waste needs scoring
exports joined to an observed final pool. Reassess activation once a complete
AI edition establishes a measured reserve and status shows positive
background allowance. The real timer ticks once a minute, rotating one topic
per completed pass, with at most 25 pending articles and a minimum of one;
older hourly replay results are not a measurement of that timer's overhead.
No paid calls, new jobs, configuration changes or latency claims were made.
