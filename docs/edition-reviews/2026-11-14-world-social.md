# World Bluesky selection — iteration 2294

Scheduled edition `b9d55088-892a-4e34-b77c-a398d64c6a9f`, ending
Nov 14 at 15:00 UTC, publishes one Bluesky post: a report of suspected
unauthorised drone activity at RAF Lakenheath. Its text attributes the report
to the US Air Force and gives the location. The saved editorial context is
empty; the reader adds no inferred development from the shortened article URL.
The television-channel footer is navigation, not additional reporting.

## Supply and selection

A read-only reconstruction loads 596 observations before the window cutoff,
representing 60 distinct posts. Production safe ranking supplies 26 candidates
for semantic triage. All 26 have stored scores before publication; each ID's
matching cache records agree. Applying those scores through production
`shortlistBlueskyPosts` produces two candidates, matching saved selection counts:

| Candidate                                                   | Relevance / importance | Outcome                    |
| ----------------------------------------------------------- | ---------------------- | -------------------------- |
| RAF Lakenheath drone report                                 | 8 / 6                  | Shortlisted and published  |
| Nvidia controls dispute, Independent headline               | 6 / 4                  | Shortlisted, not published |
| Three EU news bulletins with unspecified contents           | 4 / 2 each             | Below triage admission     |
| Bare CNN link                                               | 1 / 0                  | Below triage admission     |
| Generic news-reader section list                            | 1 / 0                  | Below triage admission     |
| Times of India link with no reporting prose                 | 1 / 1                  | Below triage admission     |
| Independent NY highway-funding URL with only “Source” label | 1 / 1                  | Below triage admission     |

The last example's saved event label names the URL's court/funding subject,
but its score excludes it; no such claim reaches the reader. The Nvidia
headline itself supplies a development and is not a URL-slug-only control.
Its omission has no saved rationale, so do not attribute it to scope or quality.

## Acceptance and limits

The Nov 12 publisher-label/link-list defect does not recur in this saved
selection. This is a natural reader observation, not an editor challenge:
triage removes the bare links, generic bulletins and aggregator before the
editor sees them. Therefore the deployed social-editor v10 instruction's
natural rejection behavior remains unexercised. Keep that acceptance open;
do not introduce a phrase filter or raise intake to manufacture a challenge.
World viral quality and the withheld World/U.S. story sections remain open.

## Verification

`pnpm exec tsx scripts/report-bluesky-coverage.ts --window-end
2026-11-14T15:00:00Z --examples 50` records the fixed-window supply. A temporary
read-only script uses authenticated local topic/preview GETs, a repeatable-read
read-only transaction, stored cache scores and production shortlist logic.
Assertions check complete/nonconflicting scores, 596 observations, complete
shortlisting and the saved two-candidate count. It was removed after use.
Private receipts: `/tmp/2294-world-receipt.json` and `/tmp/2294-bluesky.json`.

Current stored observations/topic policy are reconstructed; exact historical
triage request fingerprints and the editor request were not reproduced. Cache
matches by candidate ID establish consistent stored scores, not request identity.
No provider, source, embed or article request, publication, or database write.
