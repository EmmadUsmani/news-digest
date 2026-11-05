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

## Failed-batch recovery probe (iteration 683)

Run `pnpm exec tsx apps/api/scripts/evaluate-triage-recovery.ts` for a synthetic
200-item pool through the real article/social triage loops. The first request
returns no result or throws; the caller stops after an incomplete pass, then
explicitly retries the pool using the same item cache.

| Caller size | Initial requests | Cached after failure | Recovery requests | Total requested items |
| ----------: | ---------------- | -------------------: | ----------------- | --------------------: |
|          25 | 25               |                    0 | eight × 25        |                   225 |
|          50 | 50               |                    0 | four × 50         |                   250 |
|         200 | four × 50        |                  150 | one × 50          |                   250 |

Both content kinds and failure modes produce these counts. In-flight siblings
settle before the initial pass returns, including thrown failures. All 200
items eventually score exactly once successfully; failed work accounts for the
extra requested items. A further repeat issues zero calls. Thus larger caller
passes preserve successful sibling work but expose more items to one failed
request than size-25 passes. This does not measure provider repair attempts,
actual failure frequency, latency or billed usage, or propose automatic retries.
Production batching and retry behavior remain unchanged.

## Stored Bluesky pool batching (iteration 686)

`report-bluesky-batching.ts` reads stored observations in one repeatable-read,
read-only transaction, applies the production safety/ranking shortlist with
current topic settings, and passes the actual text/context to the offline fake
scorer. It prints aggregates only. Reproduce on the VM:

```sh
node --env-file=$HOME/.config/news-digest/env --import tsx apps/api/scripts/report-bluesky-batching.ts 2026-11-03T15:00:00Z 2026-11-04T15:00:00Z
```

| Topic     | Stored observations | Shortlist | Calls at size 10 / 25 / 50 / 200 | Input bytes at size 50 |
| --------- | ------------------: | --------: | -------------------------------- | ---------------------: |
| Tech & AI |                 497 |        50 | 5 / 2 / 1 / 1                    |                 16,323 |
| NBA       |                 630 |        47 | 5 / 2 / 1 / 1                    |                 13,597 |
| Gaming    |                 636 |        50 | 5 / 2 / 1 / 1                    |                 15,128 |
| World     |                 682 |        50 | 5 / 2 / 1 / 1                    |                 19,779 |

All 197 shortlisted items were scored once per experiment; repartitioned repeat
passes made zero calls. Size 200 matched size 50 exactly: four requests and
64,827 input bytes overall. Thus these real-text Bluesky pools do not offer a
batching win from raising the caller limit beyond 50. Smaller caller passes
repeat instructions/context and increase requests. Keep production unchanged.

These are stored real observations with synthetic scores, not live model
results. Current settings and a cold in-memory cache do not reconstruct the
historical edition's exact pool/cache. The observation reader caps each topic
at 5,000 rows (none saturated here). Bytes are not tokens; this measures no
provider latency, billed cost, semantic quality or X-post batching. Compare
Nov 5 actual call/repair/cache evidence before changing runtime settings.

## Stored X pool batching (iteration 688)

`report-x-batching.ts` uses the production verified X semantic-candidate
selector in a repeatable-read, read-only transaction. It passes stored real
text and current topic context to the offline fake scorer, printing aggregates
only. Reproduce on the VM:

```sh
node --env-file=$HOME/.config/news-digest/env --import tsx apps/api/scripts/report-x-batching.ts 2026-11-03T15:00:00Z 2026-11-04T15:00:00Z
```

| Topic     | Candidates | Calls at size 10 / 25 / 50 / 200 | Input bytes at size 50 |
| --------- | ---------: | -------------------------------- | ---------------------: |
| Tech & AI |         96 | 10 / 4 / 2 / 2                   |                 29,388 |
| NBA       |         24 | 3 / 1 / 1 / 1                    |                  9,102 |
| Gaming    |         32 | 4 / 2 / 1 / 1                    |                 10,410 |
| World     |         11 | 2 / 1 / 1 / 1                    |                  4,446 |

All 163 items were scored exactly once per comparison; repartitioned repeats
made zero requests. Sizes 50 and 200 both use five requests and 53,346 input
bytes. The Tech pool exposes two simultaneous fake requests at size 200 versus
one at size 50; production already supplies up to 200 X candidates, so this
concurrency is already available. Raising the caller limit offers no additional
request-count gain in this pool. Keep production unchanged.

This is not the historical edition pool: current citations and verification
can have arrived after the window cutoff; only publication time and reported
engagement use that cutoff. Current topic settings, a cold in-memory cache and
synthetic scores cannot establish actual cache incidence, provider admission,
latency, cost or quality. The production selector caps each topic at 200;
none reached it here. Compare Nov 5 actual evidence before runtime tuning.

## Nov 5 comparison (iteration 867)

The next scheduled edition, `7d99b279-cb6a-4cf0-b0a2-d94c5645f0b7`,
took 152,320 ms for 756 article candidates. Exported only the same allowlisted
usage fields into `apps/api/test/fixtures/edition-call-usage-2026-11-05.json`.
Reproduce the export from the worker journal, Nov 5 15:00–15:03 UTC, selecting
`event=external.call`, `target=anthropic` and that exact `runId`; preserve only
purpose, model, durationMs, outcome, usage, outputLimit and completionReason.
No prompts, response text, headers or fingerprints are in this fixture.

```sh
pnpm exec tsx apps/api/scripts/evaluate-call-tokens.ts apps/api/test/fixtures/edition-call-usage-2026-11-05.json
```

| Purpose             | Calls | Aggregate HTTP ms | First start offset ms | Last end offset ms | Output tokens |
| ------------------- | ----: | ----------------: | --------------------: | -----------------: | ------------: |
| Article triage      |    15 |            268985 |                   273 |              71381 |         71105 |
| Same-story grouping |     4 |             17060 |                 59998 |              74728 |          2344 |
| Story editing       |     8 |            102256 |                 68783 |             110755 |         13166 |
| Social triage       |     7 |             82527 |                 87541 |             148890 |         20741 |
| X editing           |     9 |             66158 |                 91916 |             143493 |          9063 |
| Bluesky editing     |     3 |             13614 |                118591 |             152264 |          2339 |

Offsets use job start 15:00:00.063 UTC. As above, these are purpose spans
across topics, not a sequential critical path. All 46 HTTP calls succeeded,
all have usage and none stopped at the output limit. Validation rejections
are recorded separately in the [edition review](2026-11-05.md).

Compared with Nov 4, aggregate HTTP work rose 43,985 ms (8.7%) while elapsed
time rose only 788 ms (0.5%). Bluesky editor calls fell from eight to three
and their HTTP work fell 6,952 ms, but they still end 56 ms before completion.
Article triage grew by 25,880 ms; X editing grew by 25,809 ms and three calls.
These observed changes do not isolate a causal effect of the shipped fixes.

Combined triage accounts for 351,512 ms (63.8% of HTTP work) and 91,846 of
118,758 output tokens (77.3%). Removing all article triage still leaves
281,615 ms, or an optimistic 70,404 ms at four slots before dependencies.
Incremental article triage alone cannot establish the 60-second target for
this unchanged call set. Even eight slots gives a 68,825 ms work-only bound;
no concurrency change is justified as a sufficient fix.

The interval sweep yields one apparent five-call overlap lasting **1 ms**;
all other intervals have at most four. Logger timestamps and rounded HTTP
durations cannot resolve this boundary; it is not evidence of a sustained
fifth slot. The adapter still uses four slots. Total recorded HTTP work is
550,600 ms and the longest call is 22,014 ms.

Next speed work should measure social-triage/edit dependencies and recoverable
editor retries offline; article-only pre-triage and higher output limits do
not address the remaining bound. Keep current concurrency, candidate pools,
quality checks and production settings unchanged. No paid trials were run.
