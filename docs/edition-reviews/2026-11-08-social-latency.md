# Nov 8 scheduled-edition latency

Iteration 1383 compares saved worker evidence with [Nov 7](2026-11-07-social-latency.md).
Edition `f9af996b-f647-4994-836e-054964a93b74` ran on deployed `2f5635ed`.
No rerun, inference, concurrency change or restart was needed.

## Reproduce offline

```sh
pnpm exec tsx apps/api/scripts/evaluate-edition-timeline.ts apps/api/test/fixtures/edition-timeline-2026-11-08.json
```

The fixture exports 63 allowlisted events from the worker journal, Nov 8
15:00–15:03 UTC: start/finish, 18 stages and 43 Anthropic HTTP completions.
The digest-generation queue filter excludes concurrent ingestion. Only event,
time, topic/stage and call purpose/duration/outcome survive; no credentials,
request fingerprints, prompts or responses are retained.

Offsets start at 15:00:00.062 UTC. Edition span is 162,301 ms; worker job
is 162,339 ms. Stages include admission, database and validation work.

| Topic     | Triage ms | Grouping/story editing ms | Posts ms | Ready offset ms |
| --------- | --------: | ------------------------: | -------: | --------------: |
| Tech & AI |    28,777 |                    61,690 |   42,143 |         132,630 |
| NBA       |    18,064 |                    34,299 |   50,653 |         103,036 |
| Gaming    |    29,281 |                    33,107 |   42,129 |         104,537 |
| World     |    47,576 |                    58,830 |   55,847 |         162,273 |

NBA story editing fell from 90,426 to 34,299 ms and recovered to AI with
four stories and a brief. Its topic has no recorded validation rejection.
Different candidates and provider timings prevent attributing the entire
improvement to repair-feedback changes. Tech and World instead exhaust their
Sonnet story initial/repair attempts and finish with Haiku, both still AI.
Gaming's initial story rejection repairs successfully.

## World is last

Tech is ready at offset 132,630 ms, leaving World alone for 29,671 ms.
The tail contains 29,253 ms of active HTTP and 418 ms without an active call.

| Intersecting call      | Start offset ms | End offset ms |
| ---------------------- | --------------: | ------------: |
| X editor Haiku initial |         127,362 |       132,929 |
| X editor Haiku repair  |         133,037 |       141,386 |
| Bluesky triage         |         141,531 |       150,606 |
| Bluesky editor         |         150,724 |       162,254 |

World's Sonnet X initial and repair fail unsupported-absence validation;
Haiku initial also fails, then repair succeeds. The initial Haiku call
straddles the last-topic boundary; later calls occur after every other topic
is ready. Sequential X then Bluesky processing remains unchanged.

The nine recorded validation rejections are five story unsupported-absence
(Tech two, Gaming one, World two), one Gaming social-triage
invalid JSON, and three World social-editor unsupported-absence: **five +
one + three = nine**. Rejected HTTP responses still count as successful
transport and settled spend; no rejected response text is inferred.

Four calls overlap for 100,609 ms. A one-millisecond five-call overlap in
completion-time-minus-rounded-duration intervals is within the timestamps’
millisecond precision; it does not establish a fifth admitted call. Do not infer topic assignment
for earlier interleaved HTTP calls from their timestamps alone.

Overall improvement is 18,231 ms with 420 rather than 693 article candidates.
Both the under-60-second/current-volume and under-two-minute/1,500 targets
remain unmet. Even removing the entire final tail leaves 132,630 ms.

## Accounting comparison

The saved edition ledger settles 43 calls at $0.320864, zero unresolved calls
or holds, versus Nov 7's 51 calls/$0.380173. By purpose: article triage
$0.027335 (10 calls), story grouping $0.004778 (4), story editing $0.183829
(9), social triage $0.019949 (10), X/social editing $0.058687 (7), and Bluesky
editing $0.026286 (3). These sum to the edition total; Bluesky triage is
included in social triage and is not separately attributed here.

Daily allowance was $0.516088, remaining $0.195224, scheduled reserve released.
X discovery's separate $0.260107 is excluded from the Anthropic total.
Per-topic Bluesky cost/selection acceptance remains open. No budget,
concurrency, model or scheduling change follows from this comparison.
