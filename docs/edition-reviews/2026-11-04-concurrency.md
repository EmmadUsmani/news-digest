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

## Recorded token work (iteration 670)

The same 43 calls retain allowlisted usage, model, completion reason and
output limit in `apps/api/test/fixtures/edition-call-usage-2026-11-04.json`.
Replay without database access or paid calls:

```sh
pnpm exec tsx apps/api/scripts/evaluate-call-tokens.ts apps/api/test/fixtures/edition-call-usage-2026-11-04.json
```

| Purpose / model         | Calls | HTTP ms | Input tokens including cache | Output tokens |
| ----------------------- | ----: | ------: | ---------------------------: | ------------: |
| Article triage / Haiku  |    14 |  243105 |                       133969 |         68220 |
| Social triage / Haiku   |     7 |   83826 |                        33772 |         20867 |
| Story editor / Sonnet   |     6 |   74774 |                        18180 |         10559 |
| X editor / Sonnet       |     6 |   40349 |                         9106 |          3716 |
| Story editor / Haiku    |     2 |   23087 |                         6215 |          5608 |
| Bluesky editor / Sonnet |     4 |   20908 |                         7433 |          2021 |
| Bluesky editor / Haiku  |     4 |   20566 |                         7433 |          4041 |

All 43 calls have usage and none stopped at the output-token limit. Combined
article/social triage emitted 89,087 of 115,032 output tokens (77.4%) and
consumed 326,931 of 506,615 aggregate HTTP ms (64.5%). This makes the actual
length of triage event/rationale strings a useful next offline measurement;
merely raising output limits has no truncation evidence here. Smaller batch
sizes repeat input and add calls, so require a measured tradeoff before any
production change. Do not extrapolate a speedup from token shares.

The tool separates purpose and model, counts missing usage as unknown,
retains failed HTTP time, and reports uncached/cache-write/cache-read input
separately. Its output-token/HTTP-second ratio includes prefill and network
wait, not measured decoding speed. HTTP success includes responses later
rejected by application validation; these fields alone cannot label repairs
or decide which calls could be removed. No prompts or response text were
exported. Current call shapes have changed since this edition; compare the
Nov 5 record before tuning concurrency or response sizes.

## Cached triage field lengths (iteration 671)

Read-only measurement of per-item cache entries created in
`[2026-11-04T15:00:00Z, 2026-11-04T15:03:00Z)`:

```sh
pnpm exec tsx apps/api/scripts/report-triage-lengths.ts 2026-11-04T15:00:00Z 2026-11-04T15:03:00Z
```

| Kind    | Field     | Scores | Mean characters | Median | p95 | Maximum |
| ------- | --------- | -----: | --------------: | -----: | --: | ------: |
| Article | Event     |    689 |           33.32 |     33 |  46 |      55 |
| Article | Rationale |    689 |           41.81 |     42 |  58 |      71 |
| Social  | Event     |    227 |           30.31 |     30 |  43 |      52 |
| Social  | Rationale |    227 |           34.79 |     33 |  53 |      75 |

All fields were strings; none exceeded prompt guidance (80/100 characters)
or schema limits (160/300). Successful cached fields are already short, so
this measurement supplies no evidence of runaway rationale/event verbosity.
Do not tighten schema limits or change batch sizes from token totals alone.
Compare Nov 5 timing and repair outcomes before changing production prompts.

This is a creation-time cache sample, not the exact edition pool or raw wire
output. Reused entries and failed/repair responses are absent. Character
counts use PostgreSQL Unicode code points; schema checks use JavaScript
UTF-16 lengths. These counts are not token counts or a speedup estimate.
The report uses a read-only transaction and 15-second query timeout and emits
only aggregate lengths, never text or candidate identifiers. No paid calls.

## Observed offline batch dispatch (iteration 680)

`evaluate-triage-batching.ts` now reports each caller pass's actual request
item counts, full/partial batches and peak overlapping fake requests. The
fake yields before returning, exercising the production triage worker loop.
Supplied local article or social input accepts optional `warmedIds`, checked
for uniqueness and pool membership; preparation remains separately counted.

```sh
pnpm exec tsx apps/api/scripts/evaluate-triage-batching.ts
pnpm exec tsx apps/api/scripts/evaluate-triage-batching.ts /path/to/local-pool.json
```

Recorded Nov 1 article fixtures, cold cache, caller size 200:

| Topic   | Candidates | Request item counts | Peak fake calls |
| ------- | ---------: | ------------------- | --------------: |
| NBA     |         52 | 50, 2               |               2 |
| World   |         47 | 47                  |               1 |
| Tech/AI |         54 | 50, 4               |               2 |

Synthetic social probe: 200 short posts, every other item warmed. Caller
size 50 dispatches four sequential 25-item requests (peak one); size 200
dispatches two 50-item requests (peak two). Both preserve all 100 pending
items, count 100 preparation items, and issue zero repeat-pass requests.
Fully warm pools dispatch zero publication requests. Byte-heavy inputs
still split below 50; the report does not infer why a partial batch formed.

These are request-shape and fake-worker observations before provider
admission, with synthetic scores. The article fixtures have empty topic
guidance. They do not measure actual social pools, provider concurrency,
latency, cost or editorial quality. Keep production batching unchanged
until the Nov 5 evidence can be compared.

## Context and byte pressure (iteration 681)

The batching evaluator now separates serialized topic context from framing and
reports maximum conservative input bytes (wire input plus the splitter's 2,048-byte
schema allowance). This measures bytes, not tokens or observed split causes.

A synthetic social pool of 50 posts, each with a 1,800-character Unicode excerpt
(`界` repeated), uses five 10-item calls with empty description/guidance. Adding
3,000 characters each of description and guidance (both clipped to the production
2,000-character limit) produces six 8-item calls and one 2-item call. Total input
rises from 281,035 to 368,053 bytes; repeated serialized topic context rises from
310 to 84,434 bytes. Maximum conservative input is 58,257 versus 59,317 bytes,
both below 60,000. All 50 items score and the repeat pass makes zero calls.

This isolates context pressure on the real splitter using synthetic responses.
It does not establish actual social pool sizes, provider latency or a reason to
shorten owner guidance. Regression coverage checks context clipping, UTF-8 byte
accounting, complete cache reuse and empty inputs. Production is unchanged.
