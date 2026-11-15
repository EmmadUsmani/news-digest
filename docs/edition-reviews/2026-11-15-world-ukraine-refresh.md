# World Ukraine discovery: second-pass yield

Iteration 2437, November 15. World discovery needs useful reporting rather
than repeated popular commentary. The second natural Ukraine pass adds new
reporting, but most of its returned posts repeat the first pass.

## Exact collection and overlap

Completed job `repeat:bluesky-hourly:1794779683867` ran 21:54:43–54 UTC,
using `Ukraine` with unchanged companion queries `AI`, `NBA`, `game`, `Congress`.
It fetched/submitted 48 World observations. A read-only repeatable-read
transaction finds exactly 48 distinct posts in that job's timestamp interval:

| Measure                                | Posts |
| -------------------------------------- | ----: |
| Previously observed for World          |    35 |
| Also present in the 17:54 Ukraine pass |    35 |
| Never previously observed for World    |    13 |

These are post identities, not distinct events or editorially eligible picks.
The 13 new identities are 27% of the second pass. Existing posts have refreshed
snapshots; they are not 35 additional discoveries. The observation timestamps
and historical existence checks come from stored production data, not a search.

## Reader value in the new posts

All 48 saved texts were read. [Preserved examples](2026-11-15-world-ukraine-refresh-examples.json)
include all 13 new posts and the three strongest repeated commentary/satire examples.
Counts below are the second job's saved likes, not independently verified claims.

| New saved contribution                                                     |   Likes | Editorial implication                                                 |
| -------------------------------------------------------------------------- | ------: | --------------------------------------------------------------------- |
| Kyiv Independent: airfield/drone-site strikes, attributed to General Staff |     566 | A specific reported development; retain the attribution               |
| Kyiv Independent: YouTube blocks 16 Russian channels in Ukraine            |     520 | A separate platform-policy development                                |
| Noelreports: opening moments of the Nizhnekamsk drone attack               |     347 | Overlaps the industrial-strike development already in the first pass  |
| UNITED24: Macron on collective security and support for Ukraine            |     273 | Overlaps a Macron statement already collected from Noelreports        |
| Kyiv Independent: romance scams exploiting the war                         |     116 | Reporting/promotion with a different subject; importance needs triage |
| Al Jazeera / Tim White: Prince Harry's Ukraine veterans visit              | 92 / 72 | Both overlap Kate in Kharkiv's first-pass visit report                |

The other six new posts comprise one battlefield-advance claim, four political
or solidarity comments and a hashtag-only caption. New identity alone therefore
overstates new reporting and event diversity.

The strongest repeated posts remain Kushner/refinery commentary (5,687 likes),
a speculative Trump/Putin allegation (2,497), and Darth Putin satire (1,170).
They outrank every newly collected outlet post by likes. Keep semantic relevance,
safety, attribution and duplicate-event checks; popularity alone is insufficient.

## Decision and next acceptance

Retain the rotation, two-page limit, budgets and selection rules. The second
pass contributes reporting beyond the first while also refreshing familiar
posts; this sample does not justify a query or cadence change. No inference,
manual collection, paid replay or publication occurred.

[Six retained jobs](2026-11-15-world-bluesky-jobs.json) now cover 16:54–21:54 UTC.
Private exact cohort and full job receipts: `/tmp/2437-ukraine-posts.json` and
`/tmp/2437-bluesky-collections.json`. Export again by November 16 06:56 UTC;
review the first full UTC day and the next natural edition before accepting
selection quality. Inspect exact intake scores and shortlist admission if the
new reporting does not appear; absence alone does not identify where it was lost.
