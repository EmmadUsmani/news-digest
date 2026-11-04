# Nov 4 offline concurrency assessment

Iteration 662 measured the retained worker journal for immutable edition
`3bf10f5b-4c00-48b2-85bd-8e6dac7e3238`. This is an offline assessment of
item 7, not a provider trial or a latency prediction. No production changes
or paid calls were made.

## Evidence and reproduction

Read `journalctl --user -u news-digest-worker.service --since
"2026-11-04 15:00:00" --until "2026-11-04 15:03:00" -o cat`.
Parse JSON lines and retain only `event=external.call`, `target=anthropic`
and the exact edition UUID in `runId`. There are 43 successful calls; their
`durationMs` sum is 506,615 ms, matching the scheduled review. The longest
call is 20,073 ms. These are HTTP durations, excluding local admission wait.

For each call, reconstruct its interval as `[time-durationMs, time)`.
Sweep start (+1) and end (-1) events, ordering ends before starts at ties.
The observed maximum overlap is **four**, consistent with the adapter's
four-slot gate. Logger timestamp/rounded-duration precision limits interval
accuracy; this is not provider-side tracing.

Offsets below use the job start, 15:00:00.063 UTC. Each row spans all calls
of that purpose, across topics and initial/repair/fallback attempts; it is
not a single sequential stage or a topic critical path.

| Purpose                           | Calls | Aggregate HTTP ms | First start offset ms | Last end offset ms |
| --------------------------------- | ----: | ----------------: | --------------------: | -----------------: |
| Article triage                    |    14 |            243105 |                   476 |              68041 |
| Story editing                     |     8 |             97861 |                 53091 |             108819 |
| Social triage (including Bluesky) |     7 |             83826 |                 70506 |             136536 |
| X/Reddit editing                  |     6 |             40349 |                 79684 |             126584 |
| Bluesky editing                   |     8 |             41474 |                100955 |             151493 |

## What this rules out

Holding the recorded call durations and call set fixed, an ideal scheduler
with N slots needs at least `max(longest call, ceil(total duration / N))`.
This deliberately ignores dependencies, admission, database work and rate
limits, so it is an optimistic bound, not an achievable schedule.

| Slots | Optimistic lower bound ms |
| ----: | ------------------------: |
|     4 |                    126654 |
|     6 |                     84436 |
|     8 |                     63327 |
|     9 |                     56291 |
|    12 |                     42218 |

**Doubling concurrency alone cannot meet 60 seconds with these durations.**
Nine slots are merely necessary under this simplified model, not sufficient
or recommended. More concurrency can change provider latency and rejection
rates. No higher-slot configuration has been tested or enabled.

Article triage accounts for 48.0% of aggregate HTTP duration. Even removing
all of it would leave 263,510 ms / four slots = 65,878 ms rounded upward,
before dependencies. Incremental triage alone therefore cannot establish
60-second acceptance for this unchanged remaining call set either. Its
budget admission remains blocked as described in the incremental assessment.

Bluesky editing finishes 39 ms before job completion (151,532 ms); it is a
visible tail worth measuring after the NBA repair and duplicate-selection
fixes run. The eight calls include fallback/repair work: do not equate them
to eight topics or assume they are unnecessary. Do not remove quality checks
or platform coverage to improve the number.

Next: compare Nov 5's actual call counts, repairs, overlap and tail after the
shipped fixes and grouping activation. If it still misses the target, assess
avoided repair work and smaller prompts offline before any bounded
concurrency experiment. The <60-second/current-volume and <2-minute/1,500-item
targets remain unfulfilled; this run had 701 article candidates.
