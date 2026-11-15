# Nov 15 NBA Bluesky selection

## Natural result — iteration 2422

Scheduled edition `a0fa3916` reads 622 stored observations and shortlists
seven Bluesky posts. Read-only reconstruction scores 42 candidates using
42 exact cached scores; the saved pick matches shortlist rank three and
preserves its original text. Two slots were available, one pick survives,
and the saved diagnostics report one unsupported-claim rejection.

The selected Tony Reast post (`3n2cdt2dzrk2j`) describes two incorrect calls
in the NBA Last Two Minutes Report for Pacers–Knicks: Nembhard's kicked-ball
call and a missed Mikal Bridges hold. Its saved editor rationale attributes
those claims to the post. This adds a concrete officiating development,
separate from the four selected stories and the three saved X posts.
The API observed nine likes; useful selection here does not establish
viral reach. The reader note is empty, so the original text carries the news.

## Seven-finalist comparison

| Rank | Author      | Supplied development and overlap                                                                       |
| ---: | ----------- | ------------------------------------------------------------------------------------------------------ |
|    1 | Aaron Rupar | LaMelo approaching a missed-three record; commentary describes proximity, not a completed record       |
|    2 | TSN         | Kyrie welcomed back to Cleveland; overlaps the saved Kyrie game context but adds a reception moment    |
|    3 | Tony Reast  | Selected: specific officiating findings for Pacers–Knicks                                              |
|    4 | OPB         | Lillard's 29 points, Portland 9–3 and road record; separate concrete result, an unselected alternative |
|    5 | TSN         | Giannis/Klay Heat win; repeats the selected Heat–Pistons story without a supplied new stat line        |
|    6 | Keith Smith | Promotional list of four game notes; essential observations are behind the link                        |
|    7 | NBA Stat    | Spoelstra's challenge reaction; supplied text does not establish the decision or result                |

The selected officiating post contributes more concrete information than the
teasers and reaction posts. OPB supplies another distinct game result, so
seven finalists should not be described as seven unusable candidates.
The retained shortlist and accepted selection do not identify which second
pick was rejected or its rejected wording. The diagnostic count alone cannot
establish a false rejection, a missed OPB selection, or the reason every
other finalist was omitted. No guard or query change is justified here.

## Decision and verification

Retain NBA discovery, gates and budgets. Natural source-exclusion acceptance
remains pending: the already-reviewed NBACentel X spoof in this edition
predates the deployed exclusion. This Bluesky review does not accept it.
No Murray claim occurs in the seven finalists or saved posts.

`pnpm exec tsx /tmp/2422-nba.ts` runs in a repeatable-read, read-only
transaction and rolls back. Assertions verify observation/shortlist counts,
complete cached scoring, and exact membership/text of the saved pick.
Inference and cache-write methods throw. Private receipts are
`/tmp/2422-nba.{ts,json}`. Current stored inputs do not prove byte identity
with an unretained historical request. No provider calls or publication writes.

`pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z`
verifies saved-to-reader agreement for five topics, 23 stories and 16 posts.
