# Nov 14 NBA social selection — iteration 2290

Reader weakness: three of five saved NBA posts concern Murray's trade request,
already covered by a story. Trace of scheduled edition
`b9d55088-892a-4e34-b77c-a398d64c6a9f`, ending 15:00 UTC.

## Where the concentration arises

All 70 saved X triage scores are complete; 29 meet relevance ≥6 and
interestingness ≥4. The current stored loader recovers all 70 scored IDs.
Restricting it to those saved IDs and calling production `editTopicPosts` with
saved scores and an editor spy produces this ten-post shortlist:

| Rank | Author          | Supplied development                              | Selected by X editor |
| ---: | --------------- | ------------------------------------------------- | -------------------- |
|    1 | Shams Charania  | Murray trade request and resolution talks         | Yes                  |
|    2 | Shams Charania  | TV segment about the same request                 | No                   |
|    3 | Hoop Central    | Giannis/Bam 37-point performances                 | No                   |
|    4 | NBA             | Same duo's franchise milestone                    | Yes                  |
|    5 | Hoop Central    | Murray request, citing Shams                      | No                   |
|    6 | BrickCenter     | “SGA FOR THE WIN” with media link                 | No                   |
|    7 | Pelicans        | Acknowledges request; will evaluate opportunities | Yes                  |
|    8 | Priority Sports | Doug McDermott retirement after 12 seasons        | No                   |
|    9 | Chris Haynes    | Suns interest in Murray, citing league sources    | Yes                  |
|   10 | NBA             | Spurs' record opening 18–0 run                    | Yes                  |

The saved successful editor response explicitly calls the team statement a
“distinct development” confirming the scoop and Haynes's report a concrete
suitor separate from the request. It removes the repeated Shams/Hoop Central
request and selects one of the two Giannis/Bam posts. Duplicate removal
therefore works for direct repetition, while allowing a trade's related
updates to dominate. Shared player names alone do not establish duplication;
the official response and reported suitor contain different supplied facts.

The X editor originally selected five posts. The Bluesky reserved-slot path
then removes the last ranked X selection, the Spurs record, and adds Howard
Beck's Nets ground-stop report. Saved `replacedXPostId` and cached order agree.
This preserves three trade posts and changes which separate event appears;
it does not create the trade concentration. The Bluesky report supplies a
concrete travel disruption and possible schedule effect, so this trace does
not establish that it is a worse pick than the unseen Spurs clip.

## Decision and next review

Keep prompts, ranking, budgets and the reserved-slot rule unchanged. The
shortlist contains distinct supplied developments, including retirement and
a record run; discovery absence is not the sole cause of the final mix.
Do not merge posts solely by player name or require unseen highlights.
On the next natural edition, review the whole section's event breadth as well
as exact duplicates, and distinguish a team's confirmation from an actual
trade decision. A new wording rule or platform change needs a concrete quality
case beyond this single selection. NBA story-editing acceptance remains valid;
social breadth and viral quality remain open.

## Verification

Temporary `scripts/.2290-review.ts` ran read-only against a repeatable-read
transaction, production selection functions, authenticated local preview and
saved reader GETs. Assertions verify 70 scored IDs, zero unscored, 29 qualifying,
ten shortlisted and membership of all five cached selections. The first four
cached IDs equal the four published X IDs in order; the fifth equals the saved
replacement ID. The temporary script was removed after use. Private receipt:
`/tmp/2290-nba-social.json` (mode 600).

The single matching cached selection in the publication interval has key
`69bead5b7b43b411d8e705e896ccaa72f7c85841ac49799d02688b3a8921f083`.
The shortlist uses current stored text/engagement and saved score membership;
its historical request fingerprint was not reproduced. Omitted candidates
have no saved omission reasons. Official X metrics remain unknown; media was
not viewed. No provider, source, embed or collection request, publication or
database write occurred.
