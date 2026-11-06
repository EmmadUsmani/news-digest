# Nov 4–5 Bluesky outcome reconstruction

Iteration 914, Nov 6: one read-only pass over the real worker journal,
immutable scheduled snapshots and the `llm_calls` ledger. No inference,
replays, collection or edition writes. Rejected text was not retained.

## Per-topic findings

The saved five-post budgets and selected X counts establish open slots.
Editor calls are attributed using ledger purpose, call times, validation
fingerprints and topic `posts`/`ready` boundaries. Old validation and budget
lines lack purpose/topic IDs, so unrelated overlapping calls are excluded.

| Edition | Topic     | Open slots | Models dispatched         | Validation failures in order                                                                    | Result                                                  |
| ------- | --------- | ---------: | ------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Nov 4   | Tech & AI |          1 | Sonnet twice, Haiku twice | Sonnet: unsupported-absence initial/repair; Haiku: unsupported-absence initial                  | Haiku repair accepted; one pick                         |
| Nov 4   | NBA       |          0 | None for Bluesky          | None                                                                                            | No slot                                                 |
| Nov 4   | Gaming    |          0 | None for Bluesky          | None                                                                                            | No slot                                                 |
| Nov 4   | World     |          5 | Sonnet twice, Haiku twice | Sonnet: validator-error initial/repair; Haiku: invalid-json initial, unsupported-absence repair | AI editing failed; zero picks                           |
| Nov 5   | Tech & AI |          2 | Sonnet once               | None                                                                                            | Accepted empty selection; zero picks                    |
| Nov 5   | NBA       |          0 | None for Bluesky          | None                                                                                            | No slot                                                 |
| Nov 5   | Gaming    |          0 | None for Bluesky          | None                                                                                            | No slot                                                 |
| Nov 5   | World     |          4 | Haiku twice               | invalid-json initial, unsupported-absence repair (rationale)                                    | Sonnet budget refused; Haiku editing failed; zero picks |

Provider ledger status `succeeded` records billable provider completion, even
when application validation rejects the response. On Nov 4, both eligible
topics used four calls; Tech ultimately succeeded. That is not eight failures.

## Nov 5 Sonnet skip

At 15:01:58.541 UTC, `budget.decision` refused Sonnet's 63,268-microdollar
estimate. Haiku was admitted immediately afterward, and its two ledger calls
are explicitly `bluesky-social-editor-v1`. World reached `ready` at
15:02:09.087, two milliseconds after that fingerprint's repair rejection.
Tech remained in its posts stage and later made the sole Sonnet Bluesky call
at 15:02:28.968–15:02:32.330, immediately before its `ready` marker.

The refusal's reserve log reports 76,864 available microdollars, scheduled run
true, `limitedByReserve=false` and `reserveInsufficient=false`. Thus it was
not an insufficient scheduled-reserve balance. Admission also checks model
allocation and blocked ledger entries; those decision inputs were not logged.
The exact limiting rule cannot be established from these historical logs.
No paid replay or recovery of rejected text was attempted.

## Reconciliation and limits

| Edition | Scheduled edition ID                   | Bluesky calls | Settled cost |
| ------- | -------------------------------------- | ------------: | -----------: |
| Nov 4   | `3bf10f5b-4c00-48b2-85bd-8e6dac7e3238` |             8 |    $0.037840 |
| Nov 5   | `7d99b279-cb6a-4cf0-b0a2-d94c5645f0b7` |             3 |    $0.007684 |

All eleven ledger calls settled successfully, with no unresolved Bluesky call.
Nov 4 World cost $0.025756 and Tech $0.012084; Nov 5 World cost $0.001548
and Tech $0.006136. Counts and totals match the original edition reviews.

An accepted empty response is inferred from the successful editor return path,
no validation rejection/retry, and zero saved additions; raw replies are not
available. Historical candidate/shortlist counts were not saved and remain
unknown. `validator-error` does not identify its underlying rejected field.
The absence check categories do not prove that the rejected claim was false.

Private journal and ledger extracts are retained under
`~/.local/state/news-digest/bluesky-history-914/` with directory/file modes
700/600. Iteration 913 added purpose/topic IDs to future diagnostic lines.
Next: persist per-topic outcomes and show them in the admin inspector; do not
repeat this historical investigation.

## Nov 6 reserved-slot decision worksheet

After publication, run the offline calculator with a private JSON worksheet:

```sh
pnpm exec tsx apps/api/scripts/evaluate-bluesky-slot-gate.ts /path/to/worksheet.json
```

Required fields: `editionDate` (`2026-11-06`), `editionId`,
`fullyAiEdited`, `budgetRefused`, `usageSettled`, `editionCostMicros`,
`dailyCapMicros` and `topics`. Each topic has `topicId`, `extraCostMicros`
(integer microdollars or null when unknown) and a plain `basis` explaining
its estimate from Nov 6 saved triage/editor usage. Include every enabled topic
with a post budget, including topics that previously had no open slot. Check
that topic coverage against the saved edition; the offline tool cannot do it.

Use the complete edition cost, including retries and unsuccessful charged
calls. Estimate only incremental Bluesky work beyond what the edition already
paid for, including additional triage/editor attempts where needed. Do not
assume a no-slot topic costs zero or infer its triage cost from overlapping
call timestamps. Missing attribution means an unknown estimate until a
conservative bound can be justified from saved usage. Make no paid replay.

The calculator sums estimates and applies STEERING 40's exact inequality,
rounding the protected amount up to a whole microdollar. Unknown estimates,
unsettled usage, non-AI editing or any budget refusal block eligibility.
Eligibility is a worksheet result, not activation: inspect its evidence first,
keep runtime admission/reserves unchanged, and respect the 13:00–16:00 freeze.
No actual Nov 6 result is recorded here before publication.
