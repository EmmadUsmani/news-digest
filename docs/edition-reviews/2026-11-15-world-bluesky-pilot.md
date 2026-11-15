# World Bluesky pilot: first natural collection

Iteration 2413, November 15. The reader weakness is a World social pool
with weak generic discovery. This review checks the first scheduled event
query after activation; it does not accept a full day or published selection.

## Before the event pass

Read-only coverage export at 17:49 UTC, using the rolling 24-hour window:

| Measure                                 | World baseline |
| --------------------------------------- | -------------: |
| Stored observations                     |            459 |
| Distinct posts                          |             63 |
| Safe engaged candidates (limit 50)      |             22 |
| Distinct authors among those candidates |             16 |
| Strongest likes                         |             19 |
| Safe engaged posts with images / video  |          2 / 0 |

The five strongest examples include a hashtag-only image caption, commentary
on a UK speechwriter allegation, a Russian hockey dispute, a Bloomberg
programme promotion and another low-engagement post. This is not a strong
international reporting pool. The zero phrase shortlist reflects World's
empty positive policy; it is not a semantic rejection.

Private receipts: `/tmp/2413-bluesky-before.json` and
`/tmp/2413-coverage-before.json`. Read-only exports use existing Redis and
Postgres adapters; no manual search, paid inference or publication occurred.

## First scheduled event pass

The retained job ran 17:54:43–17:54:54 UTC and completed all five topics.
Queries were exactly `AI`, `NBA`, `game`, `Ukraine`, `Congress`. World fetched
and submitted 50 observations within its existing two-page allowance.

| Measure                                 | After pass |
| --------------------------------------- | ---------: |
| Stored observations                     |        509 |
| Distinct posts                          |        113 |
| Safe engaged candidates (limit 50)      |         50 |
| Distinct authors among those candidates |         36 |
| Strongest likes                         |      5,081 |

The five strongest saved examples discuss Ukraine: Kushner/refinery commentary,
a speculative Trump/Putin allegation, Kyle Griffin's report of senators seeking
Starlink records, Darth Putin satire and Kate in Kharkiv's account of Prince
Harry visiting a veterans' competition. These are varied contributions, but
speculation and satire must not become verified reporting in the digest.
The author list also includes Kyiv Independent, Al Jazeera and UNITED24;
author presence alone does not establish accuracy or final eligibility.

Assertions verify a completed 17:54 job, exactly five unchanged query slots
apart from World, and the intended Ukraine query. Receipts:
`/tmp/2413-bluesky-after.json`, `/tmp/2413-coverage-after.json`.
The first event collection works; retain the current pilot and selection rules.

## Baseline return retained — iteration 2419

The 18:54:43–54 UTC scheduled job completed all five topics. World used
`World news & politics` and fetched/submitted 47 observations; the other
queries remained `AI`, `NBA`, `game`, `Congress`. All topics stayed within
50 fetched/submitted observations. The first three pilot jobs therefore show
baseline → Ukraine → baseline at 16:54, 17:54 and 18:54 UTC.

[Retained job results](2026-11-15-world-bluesky-jobs.json) preserve the actual
query, window, counts, job ID and timestamps for those three completed jobs.
Assertions verify completion, query sequence, five-topic admission and counts.
The full 28-job export is private at `/tmp/2419-bluesky-collections.json`.
Counts describe observations, not unique or eligible posts; no new selection
quality conclusion follows. Retain the pilot unchanged. Capture the first
Gaza pass after 19:54 UTC and export again by November 16 06:56 UTC.

## Acceptance still needed

Retain actual query/count results, compare November 16 as the first full UTC
day and read the next natural edition. Rolling windows and observation-level
query attribution prevent treating a before/after difference as a controlled
query-quality estimate. Keep selection gates, request bounds and sharing
unchanged.
