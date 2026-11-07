# Nov 5 social-selection latency

Iteration 970 measures the saved edition's social tail without paid calls or
runtime changes. The reader still waits 152.320 seconds for the whole job.

## Reproduce

```sh
pnpm exec tsx apps/api/scripts/evaluate-edition-timeline.ts apps/api/test/fixtures/edition-timeline-2026-11-05.json
```

The fixture exports 66 allowlisted events from the worker journal, Nov 5
15:00–15:03 UTC, for run `7d99b279-cb6a-4cf0-b0a2-d94c5645f0b7`.
Keep edition start/finish timestamps, topic stage timestamps, and Anthropic
call timestamp/purpose/duration/outcome only. No prompts, responses, headers,
request fingerprints or secrets are retained. HTTP starts are reconstructed
as end timestamp minus duration, using half-open intervals.

Offsets here use `edition.start` at 15:00:00.094 UTC, **31 ms later** than
the job-start origin used in the [concurrency review](2026-11-04-concurrency.md).
The observed edition span is 152,273 ms; job duration includes work outside
that span. Stage durations include admission, database and validation work;
they are not sums of provider time.

## Where the time goes

| Topic     | Article triage ms | Grouping/story editing ms | Posts ms | Ready offset ms |
| --------- | ----------------: | ------------------------: | -------: | --------------: |
| Tech & AI |            71,353 |                    24,982 |   55,895 |         152,240 |
| NBA       |            51,443 |                    44,738 |   34,449 |         130,640 |
| Gaming    |            59,980 |                    50,739 |   32,739 |         143,469 |
| World     |            52,820 |                    34,506 |   41,656 |         128,993 |

After Gaming becomes ready, only Tech remains. The final 8,804 ms comprises
8,663 ms with one recorded HTTP call active and 141 ms with none. The two
calls intersecting this tail are:

| Purpose         | Start offset ms | End offset ms |
| --------------- | --------------: | ------------: |
| Social triage   |         132,415 |       148,859 |
| Bluesky editing |         148,960 |       152,233 |

Across the whole edition, four calls overlap for 125,665 ms (82.5% of the
edition span). The occupancy-weighted duration is 550,600 ms, matching the
existing usage fixture. The apparent fifth call lasts only 1 ms, the same
rounded-log boundary already documented in the concurrency review.

## Cause and next implementation

`preview.repository.ts` finishes article selection before starting social
selection. It then awaits X/Reddit selection before calling Bluesky selection.
`bluesky-edition.ts` uses those selected posts to calculate remaining slots;
`bluesky-editor.ts` awaits Bluesky scoring before editing. These are real
serial dependencies, rather than an exhausted four-slot gate at the end.
External-call logs have no topic or platform field for social triage, so this
analysis does not assign earlier overlapping calls to topics, distinguish
initial calls from repairs, or calculate a hypothetical speedup.

The next implementation candidate is to separate Bluesky candidate scoring
from final slot-dependent selection, allowing already-admitted scoring to
finish earlier. First prove with isolated fixtures that it preserves budget
refusals, no-slot behavior, selected-post deduplication, and editorial output.
Do not speculatively score no-slot topics: that could spend money the current
sequence avoids. Moving calls also changes shared budget admission order and
must preserve morning-edition protection. The Nov 6 reserved-slot decision
comes first; reassess the split against its actual slot behavior.

Do not raise concurrency to address this tail, skip Bluesky quality checks,
or claim that eliminating it would meet 60 seconds. Even subtracting all
8.804 seconds leaves more than 143 seconds. The existing four-slot work-only
bound and unfinished speed targets still apply. No runtime flags, prompts,
provider choices, budgets or candidate pools changed.

## Scoring separation — iteration 1020

Bluesky final editing now accepts a previously scored shortlist, its final
slot budget and the current selected posts. The existing edition caller still
scores and edits sequentially after X selection. No early paid work is enabled.
Fake-only regressions verify equivalent sequential output, one scoring pass,
zero editor calls when no slot remains, and refusal of incomplete scores.
This prepares the dependency split; it establishes no live latency improvement.
Earlier scheduling still needs admission and slot protection before activation.

## Admission proof — iteration 1022

The existing scheduled-reserve integration test now exercises both orders
against the real PostgreSQL ledger in a disposable test database. It gives the
owning edition 80,000 microdollars of available allowance, then requests a
20,001-microdollar social-triage hold and a 60,000-microdollar editor hold:

| Order                                    | First hold | Second hold |
| ---------------------------------------- | ---------- | ----------- |
| Earlier Bluesky scoring, then X editing  | admitted   | refused     |
| Existing X editing, then Bluesky scoring | admitted   | refused     |

These are synthetic reservation amounts, not observed provider costs. The
first hold is explicitly released between orders. Both calls use the same
trusted scheduled attempt and edition identity. No provider is contacted.
The scheduled reserve protects the edition against other runs; it does not
earmark money for particular stages inside that edition. Even a guaranteed
open post slot therefore cannot make the two admission orders equivalent.
Outstanding calls consume allowance before settlement, so concurrent starts
can cause this difference even if their final costs would both fit.

**Decision:** keep the production sequence. The separated final editor is
usable, but early paid scoring is not safe under the existing shared ledger.
Do not enable it merely after proving slot availability or enabling a reserved
slot. A future implementation must protect outstanding X editing and possible
repair reservations before admitting earlier Bluesky work, or use exact cached
scores without reserving paid work. Neither behavior is implemented here.
Do not keep revisiting this ordering question without such an implementation.

The Nov 6 review supersedes the Nov 5 slot situation: three topics had no open
slot and only World scored Bluesky. Its reserved-slot cost gate failed; that
flag remains off. No latency gain or production admission change is claimed.

## Nov 6 comparison — iteration 1078

Immutable edition `1c83e78b-47f9-4a6f-bfb4-93820a691aea` changes the
critical tail. Exported 57 allowlisted events and 37 call-usage records from
the worker journal, Nov 6 15:00–15:03 UTC. Fixtures contain no prompts,
responses, headers, fingerprints or secrets. Reproduce offline:

```sh
pnpm exec tsx apps/api/scripts/evaluate-edition-timeline.ts apps/api/test/fixtures/edition-timeline-2026-11-06.json
pnpm exec tsx apps/api/scripts/evaluate-call-tokens.ts apps/api/test/fixtures/edition-call-usage-2026-11-06.json
```

The edition span is 137,030 ms; the queue's 137,059 ms includes surrounding
work. Offsets below use `edition.start` at 15:00:00.091 UTC.

| Topic     | Article triage ms | Grouping/story editing ms | Posts ms | Ready offset ms |
| --------- | ----------------: | ------------------------: | -------: | --------------: |
| Tech & AI |            72,536 |                    20,776 |   43,687 |         137,011 |
| NBA       |            17,649 |                    71,585 |   25,052 |         114,298 |
| Gaming    |            54,461 |                    49,089 |   15,935 |         119,497 |
| World     |            61,996 |                    24,353 |   36,528 |         122,889 |

World finishes second-last. The remaining **14,141 ms** has one HTTP call
active for 13,975 ms and none for 166 ms. Both intersecting calls are X editing:

| Purpose          | Start offset ms | End offset ms |
| ---------------- | --------------: | ------------: |
| social-editor-v2 |         111,576 |       127,139 |
| social-editor-v2 |         127,274 |       136,999 |

Unlike Nov 5, Bluesky scoring/editing does not occupy this final tail. The
worker's validation event at offset 127,142 explicitly identifies Tech,
initial Sonnet, unsupported absence in `rationale` (`negative-word`). This
establishes the topic and repair cause independently of overlapping calls.
The subsequent repair takes 9,725 HTTP ms; it succeeds and Tech becomes ready
12 ms after it ends. This is necessary validation work in the observed run,
not permission to weaken the validator or remove repairs.

Total HTTP work falls from 550,600 to 490,055 ms (11.0%); calls fall from
46 to 37. Four calls overlap for 111,907 ms (81.7% of the edition span),
with no observed overlap above four. All 37 calls have usage and succeed at
the provider; none stops at the output limit. Aggregate output is 109,290
tokens. Article/social triage consumes 327,413 HTTP ms (66.8% of work).
The work-only four-slot lower bound is 122,514 ms, still over 60 seconds.

**Next:** inspect the Nov 7 run after the already-deployed social editor v6
and reserved-slot changes. Early cache-only Bluesky scoring cannot remove
Nov 6's final X-editor dependency, so no speculative scheduling or prompt
change was added. Paid earlier scoring still has the admission-order failure
proved above. The largest saved reader weakness remains Tech's repeated
launch posts; its deployed fix awaits publication. No paid calls or edition
writes were made for this comparison.
