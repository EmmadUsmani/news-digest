# NBA Bluesky selection — iteration 2171

Saved edition `f901ba6c-cba3-4116-8539-fd0e92b98ec4` fills its fifth
NBA post slot with nbastat.bsky.social's attributed Vucevic/Magic Johnson
scoring-list claim. Its saved official counts are 18 likes, zero reposts and
one reply. Four X posts already cover Cunningham, Curry, Smart and Wilson.
No X post was displaced: `replacedXPostId` is absent. This is a distinct
development, but the evidence does not establish a viral pick or verify the
underlying scoring claim independently.

## Trace through the saved pool

The historical GET-only coverage report reads 593 observations covering 54
distinct posts before the 15:00 UTC cutoff. Fifty pass the bounded safe,
engaged candidate preparation. The strongest has 130 likes, but its visible
text is only “new words” and a Substack link; semantic triage scores it 1/1.
Another reported example has 54 likes and opinion about Mikal Bridges, scored 7/3.
Neither is an overlooked high-quality news pick.

Reconstructed production shortlisting using those observations and the 50
saved per-item semantic scores produces the recorded ten-candidate count:

| Event                                | Importance / relevance | Existing X coverage  |
| ------------------------------------ | ---------------------- | -------------------- |
| Cunningham 50/10 with no turnovers   | 8 / 9                  | Yes                  |
| Smart suspension                     | 7 / 9                  | Yes                  |
| Vucevic scoring-list milestone       | 7 / 9                  | No                   |
| Cunningham 52 points / 11 assists    | 7 / 9                  | Yes                  |
| Cunningham first 50-point game       | 6 / 9                  | Yes                  |
| Smart suspension, second reporter    | 6 / 9                  | Yes                  |
| Bucks investigation speculation      | 6 / 8                  | No                   |
| Pistons/Wizards final score          | 5 / 9                  | Same Cunningham game |
| NBA Cup stakes primer                | 5 / 8                  | No                   |
| Wolves/Mavericks third-quarter score | 4 / 9                  | No                   |

The final cached editor result chooses Vucevic specifically because it adds a
different development. Its diagnostics count one unsupported-claim rejection;
the cached result does not identify that rejected candidate. Do not attribute
the rejection to a particular post.

## Decision and verification

The concrete weakness is limited distinct, high-interest supply from the
current generic `NBA` query, with six of ten shortlisted posts covering events
already represented by X. This does not justify weakening semantic gates,
forcing an engagement floor or adding an event-wording rule. A later discovery
comparison should seek distinct insider reporting or highlights and retain
text/media evidence requirements. World discovery and the scheduled NBA/item
58/public-mode gates keep their existing priority; no new rollout is proposed.

- `pnpm exec tsx scripts/report-bluesky-coverage.ts --window-end 2026-11-13T15:00:00Z`
  supplies the pool, distinct count, current query and strongest examples.
- A temporary offline invocation of production `shortlistBlueskyPosts` uses
  `readBlueskyObservations` with the historical cutoff and only saved
  `social-triage-item-v1` cache scores from 15:00–15:03 UTC. All 50 IDs match;
  status is complete and the shortlist has ten entries. The temporary script
  was removed. No live triage/editor adapter was instantiated.
- Protected saved-preview GET and read-only cache queries reconcile the pick,
  metrics, rationale, open slot and diagnostic counts. All database work is
  read-only; no provider calls, collection, generation or configuration changes.
