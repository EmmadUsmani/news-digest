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

## First Gaza pass retained — iteration 2424

The 19:54:43–54 UTC scheduled job completed all five topics. World used
`Gaza` and fetched/submitted 50 observations; companion queries stayed
`AI`, `NBA`, `game`, `Congress`. Assertions on the four retained jobs confirm
the complete baseline → Ukraine → baseline → Gaza rotation, completion,
five-topic admission and the existing 50-observation bound for every topic.
The linked retained-job export now preserves all four actual results.

Read-only rolling coverage immediately before/after the Gaza pass shows
484 → 534 observations and 107 → 157 distinct posts. Safe engaged candidates
remain capped at 50; the strongest examples still come from the Ukraine
pass. This establishes collection and pool growth, not Gaza selection quality.
Private receipts: `/tmp/2424-{bluesky-collections,coverage-before,coverage-after}.json`.
Keep queries, gates and budgets unchanged. Export again by November 16
06:56 UTC, compare the first full UTC day and read the next natural edition.

## Exact Gaza cohort reviewed — iteration 2430

[First-pass quality review](2026-11-15-world-gaza-quality.md) reads all 50 saved
posts and retains representative snapshots. Outlet reporting and an image
correction coexist with popular commentary and repeated developments; retain
the query and selection gates. The linked job export now also preserves the
20:54 baseline return (46 World observations). Natural acceptance remains open.

## Acceptance still needed

Retain actual query/count results, compare November 16 as the first full UTC
day and read the next natural edition. Rolling windows and observation-level
query attribution prevent treating a before/after difference as a controlled
query-quality estimate. Keep selection gates, request bounds and sharing
unchanged.

## Next natural Gaza return retained — iteration 2542

The Nov 16 19:54 UTC job completed all five topics: AI 49, NBA 46, game 50,
Gaza 50 and Congress 50 fetched/submitted observations. The Nov 16 retained
export now preserves twenty consecutive hours; all 100 topic counts and the
World baseline/Ukraine/baseline/Gaza rotation pass assertions. The prior
nineteen records are unchanged. Full-day quality review remains due after
Nov 17 midnight; next export by 21:36 UTC. No collection or provider calls.

## Next natural Ukraine return retained — iteration 2550

The Nov 16 21:54 UTC job completed all five topics: AI 50, NBA 46, game 50,
Ukraine 48 and Congress 50 fetched/submitted observations. The merged private
export at `/tmp/2550-bluesky-collections.json` retains 22 consecutive Nov 16
hours; all 110 topic counts, hourly continuity and the expected World rotation
pass assertions. All 27 overlapping receipts from the prior export are unchanged.
Full-day quality review remains due after Nov 17 midnight; export again by
23:36 UTC. Read-only Redis export; no collection or provider calls.
