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

## Attached-media supply — iteration 2172

The read-only coverage report now distinguishes attached video in any retained
snapshot from media on the latest safe engaged candidates. NBA has one distinct
stored video post across 54 distinct posts, but zero videos among the 50 safe
candidates. Those candidates have nine image posts, 41 without attached media,
and only two with author-provided descriptions. Attachments do not establish
highlight content; linked or quoted videos are not counted as author attachments.

A read-only inspection identifies the sole stored video as a Raptors/Sixers
`#gamecharts #dataviz #nft` post, with one like and zero reposts/replies.
The existing safety gate rejects `nft`; this is not evidence of a missed game
highlight or a reason to weaken the gate. No media was fetched or watched.
Tech/Gaming/U.S. have six/eight/ten safe attached-video posts in the same window,
so the NBA zero is not a universal absence of parsed video metadata.

Command: `pnpm exec tsx scripts/report-bluesky-coverage.ts --window-end 2026-11-13T15:00:00Z`.
All five topics pass count-bound checks; a temporary GET-only observation
inspection was removed. Counts describe this retained window, not platform-wide
supply. Discovery tuning should seek distinct reporting and actual attached
highlights; selection cannot recover media absent from the collected pool.
Production queries, eligibility, provider usage and generation remain unchanged.

## Bounded live query comparison — iteration 2173

Command: `pnpm exec tsx scripts/probe-bluesky.ts --nba`. Four explicit free
searches used one common 24-hour publication window ending
2026-11-13T17:17:59.988Z, two pages of 25 per query. No observations were
stored, no media downloaded and no AI calls made. The new probe mode refuses
combination with `--store`; existing default/World behavior is retained.

| Query            | Fetched | Safe engaged | Safe attached video |
| ---------------- | ------: | -----------: | ------------------: |
| `NBA`            |      48 |           44 |                   0 |
| `#NBA`           |      48 |           46 |                   1 |
| `NBA highlights` |      15 |            5 |                   0 |
| `basketball`     |      50 |           39 |                   3 |

Safety and engagement preparation uses the existing ranking function with a
50-post bound and NBA policy; it does not establish semantic NBA relevance.
The current `NBA` query's strongest result is a personal sports-preference
post (162 likes), followed by a Substack link (131). `#NBA` finds one
one-like Luka shot video; its strongest items are a chart and scoring posts.
`NBA highlights` includes basketball videogame requests and fantasy summaries.
`basketball` finds these three safe video candidates (saved API counts):

- [Cade Cunningham is on my basketball team 🫡](https://bsky.app/profile/did%3Aplc%3A7dlhmih6zwcpsu3e54yykpvp/post/3n266eqzv7r2y) — 45 likes.
- [Seven points, ONE possession — Celtics basketball](https://bsky.app/profile/did%3Aplc%3Ay2bvvrv2don5flff7trcyz27/post/3n25fj6ospc2k) — 11 likes.

- [Dejounte Murray — play good basketball](https://bsky.app/profile/did%3Aplc%3Aghkytoq425ln6xpdlztauqyo/post/3n255nrn3ws23) — 8 likes.

These posts have attached video metadata; the clips were not watched or
verified as game highlights. The Cade post also repeats the Cunningham game
already covered by X. Higher video yield alone does not establish better
reader picks or viral quality. Queries were sequential, top-search results
are bounded, and this later window differs from the scheduled saved pool.

Decision: retain `NBA` in production. A later bounded discovery trial can
compare `#NBA`/`basketball` coverage alongside it, retaining semantic filtering
and X preference; replacing it with `NBA highlights` has no support here.
Activation remains behind NBA/item 58/private public-mode gates. This completes
the immediate query comparison; do not repeat the same probe while waiting.
