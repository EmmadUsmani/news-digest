# World Bluesky stored supply — iteration 2267

Read-only capture at 13:27 UTC on November 14. This is a rolling window
`[2026-11-13T13:27:44.705Z, 2026-11-14T13:27:44.705Z)`, not today's scheduled
edition window or a replay of editorial selection. No searches or model calls.

| Stored-pool measure               |   Result |
| --------------------------------- | -------: |
| Observations / distinct posts     | 525 / 56 |
| Safe engaged candidates / authors |  26 / 20 |
| Candidates with images / videos   |    2 / 0 |
| Candidates without attached media |       24 |
| Maximum saved likes               |        9 |

The newest observation is 12:54:52 UTC; collection is returning data.
The 5,000-observation read cap is not reached. All 26 safe candidates fit
production's 50-candidate semantic intake in `shortlistBlueskyPosts`.
The report's zero lexical shortlist is not an empty production semantic pool:
production scores safe candidates before applying relevance/importance gates.
No semantic scores or editorial choices are inferred here.

## Read the supply before changing limits

All 26 engagement-ranked examples were inspected as supplied text. Three
concrete non-U.S. leads deserve comparison with later semantic results:

| Safe rank | Author                   | Supplied subject                                           |
| --------- | ------------------------ | ---------------------------------------------------------- |
| 1         | labourstart.bsky.social  | Uganda workers and collective bargaining agreements        |
| 5         | jamieb1000.bsky.social   | Canada barring Russian World Juniors players despite visas |
| 24        | wilsonsworld.bsky.social | Reported suspected drone activity at RAF Lakenheath, UK    |

Rank 24 remains in the semantic intake; raising its cap would not admit
additional safe candidates in this capture. These are leads, not verified
claims or automatic publication recommendations. Linked pages/media were
not opened, and the Uganda/Canada texts offer little detail beyond headlines.

The rest includes repeated U.S. flight-outage coverage, U.S. political
commentary, three generic news bulletins, lifestyle/technology/culture posts,
and link-only text. The second-ranked post links to a CNN path dated 2015;
a recent post timestamp does not establish a current reported event. Do not
infer a new World event from a URL or fill slots merely to add countries.

Retain current limits and semantic gates. This supports evaluating discovery
supply before increasing intake or changing selection. The prepared
[World discovery pilot](../plans/world-bluesky-discovery.md) remains off and
behind NBA/item 58/private public-mode activation. Today's scheduled review
must inspect actual selection separately; this rolling pool cannot accept it.

## Verification and receipt

`pnpm exec tsx scripts/report-bluesky-coverage.ts` produced the initial report.
A temporary copy replaced only `safe.slice(0, 3)` with `safe.slice(0, 50)` in
`strongestSafeExamples`, then ran with
`--window-end 2026-11-14T13:27:44.705Z` to inspect the entire safe pool.
The copy was removed. Private mode-600 receipt: `/tmp/2267-world-pool.json`.
Assertions verify 26 distinct example URLs, matching safe count, uncapped
observation read, media totals and the Lakenheath example at rank 24.
Production code, stored observations, collection queries and generation are unchanged.
