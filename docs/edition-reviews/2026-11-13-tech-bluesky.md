# Tech Bluesky discovery comparison — iteration 2177

Tech published no Bluesky additions in the Nov 13 scheduled edition. Its
557 observations supplied one semantic shortlist candidate; the editor chose
none. This free discovery comparison asks whether product names or a demo
query supply a useful alternative to the probe query `artificial intelligence`.
That query was not established as the production baseline; see the correction
below.

## Bounded live comparison

`pnpm exec tsx scripts/probe-bluesky.ts --tech` made four free API searches,
two pages of 25 at most per query, with one common 24-hour window ending
2026-11-13T18:02:31.949Z. No posts were stored, media fetched or AI called.
These results are live search observations, not a generated edition.

| Query                     | Fetched | Safety/engagement eligible | Attached videos in that pool |
| ------------------------- | ------: | -------------------------: | ---------------------------: |
| `artificial intelligence` |      41 |                         41 |                            0 |
| `Claude`                  |      50 |                         47 |                            0 |
| `Gemini`                  |      50 |                         48 |                            1 |
| `AI demo`                 |      47 |                         28 |                            5 |

The existing preparation ranker applies safety, window and engagement checks,
without positive semantic relevance. Its highest-ranked examples show why
candidate counts or attached-video counts alone cannot select a better query:

- Baseline: a Jensen Huang joke, Microsoft outage commentary and commentary
  about AI employment claims. None of these three supplies a concrete demo.
- `Claude`: two posts about power generation and an itinerary anecdote. The
  product name increases supply without establishing useful launches or demos.
- `Gemini`: an Onion headline and two posts about protests against AI in
  schools. Its only eligible attached video has AI-art/song text, rather than
  a supplied product demonstration. The headline illustrates name ambiguity.
- `AI demo`: the first three examples promote games, including explicit
  no-generative-AI development. The displayed video examples include a sound
  pack, a blockchain-wallet promotion and a game-development asset. Matching
  words and attachments do not establish an AI product demo.

These are text assessments of the probe's bounded examples; linked pages and
videos were not opened. They do not assess every result or verify its claims.
Safety eligibility is preparation, not publication approval: semantic triage
and editing remain necessary, including for the blockchain promotion.

## Decision and verification

Retain the production query and semantic/editorial gates. None of these
alternatives establishes a better standalone discovery query; do not replace
the baseline with `Claude`, `Gemini` or `AI demo`, or force a Bluesky slot.
A future discovery proposal needs concrete relevant examples, not higher
raw yield. Scheduled story recovery and story/post overlap acceptance still
come first; no discovery rollout is authorized by this comparison.

The explicit `--tech` mode cannot combine with `--store`, matching existing
NBA and World comparison modes. Four exported result assertions pass for the
shared publication window, counts bounded by 50, zero submitted/stored posts
and false semantic/publication flags. `--tech --store` exits nonzero before
credentials or network access. Private export: `/tmp/bluesky-tech-2177.jsonl`
(mode 600). Production query, scheduling, providers and budgets are unchanged.

## Current-query correction and stored media — iteration 2270

At `2026-11-14T14:01:25.613Z`, current topic metadata resolves the production
fallback to `AI`: `blueskyQuery` is empty, no nonblank topic query wins, and
`includeAny[0]` supplies `AI`. The collector uses that same precedence.
The earlier explicit probe searched `artificial intelligence`; its result is
not a measurement of the current production query. Stored observations do not
retain collection queries, so this does not establish a historical query change.
Future query comparisons must include the actual configured baseline.

Read-only stored window: `[Nov 13 14:01:25.613, Nov 14 14:01:25.613)` UTC.

| Measure                                 |                  Result |
| --------------------------------------- | ----------------------: |
| Observations / distinct posts           |                643 / 53 |
| Safe candidates / authors, capped at 50 |                 50 / 46 |
| Safe candidates with images / videos    |                  10 / 3 |
| Safe candidates without media           |                      37 |
| Latest observation                      | Nov 14 13:54:44.988 UTC |

All 50 engagement-ranked supplied texts were inspected. They are dominated
by FAA/outage commentary, jokes and AI criticism, with additional AI-art tags
and ambiguous short captions. None supplies a clear named product launch or
usable demo description. This is a text assessment, not media verification.
The three video captions are:

| Safe rank | Author              | Supplied caption                                                           |
| --------- | ------------------- | -------------------------------------------------------------------------- |
| 1         | atrupar.com         | “sure sounds like AI might've f'd up America's air traffic control system” |
| 10        | meidastouch.com     | “Q: Could this be AI related? Mullin: We call it SI around here.”          |
| 45        | diplomatofnight.com | “Found a AI gem”                                                           |

Video presence therefore does not establish demo supply; the first caption
also speculates about a cause rather than establishing it. A maximum 8,679
saved likes establishes engagement, not accuracy or useful Tech coverage.
Semantic scoring/editorial selection must still assess this pool; this rolling
window cannot accept today's scheduled edition. The observation read is below
its 5,000 cap, but safe intake reaches 50, so this capture cannot establish
that raising the semantic limit would add nothing. No limit change is justified
by these inspected examples.

Verification: a temporary copy of `report-bluesky-coverage.ts` expanded only
`strongestSafeExamples` from three to 50; removed after capture. Private receipt
`/tmp/2270-bluesky-pool.json` is mode 600. Assertions check 50 unique example
URLs, media counts, ranks/authors of all three videos and uncapped observations.
No source searches, model calls, media fetches, writes or production changes.

## Configured-baseline comparison — iteration 2272

The explicit probe now resolves the first query for each topic from its current
`blueskyQuery` override, first nonblank topic query, first relevance term, then
name, with the collector's trimming/500-character bound. Later comparison
queries stay explicit. `configuredBaseline` identifies the first search in the
export. This follows the default-off rotation configuration; it does not claim
to reproduce an enabled World hourly rotation or historical collection queries.
The same correction applies to all comparison modes and the default probe.

Four free searches share a 24-hour window ending **2026-11-14T14:22:42.383Z**:

| Query                      | Fetched | Safety/engagement eligible | Attached videos in eligible pool |
| -------------------------- | ------: | -------------------------: | -------------------------------: |
| `AI` (configured baseline) |      48 |                         47 |                                3 |
| `Claude`                   |      50 |                         50 |                                2 |
| `Gemini`                   |      49 |                         48 |                                1 |
| `AI demo`                  |      44 |                         24 |                                3 |

The baseline's three video captions remain outage speculation, an interview
exchange and “Found a AI gem”. Claude's video examples include ambiguous
“Welcome to the Claude” and unrelated Claude Bolling jazz footage. Gemini's
video describes generated kittens, rather than a new product launch. The
`AI demo` examples include game promotions, a blockchain-wallet promotion,
a claimed Krea 2 workflow breakdown and an online-review sales pitch. The Krea
caption names a workflow but supplies no actual steps in the exported text;
its linked media was not inspected. These bounded examples do not justify
replacing the baseline or forcing a Bluesky slot. Keep semantic/editorial gates.

`pnpm exec tsx scripts/probe-bluesky.ts --tech` succeeded; the private mode-600
receipt is `/tmp/bluesky-tech-2272.jsonl`. Assertions verify four query results,
exact baseline/alternative labels, shared windows, at most 50 fetched per query,
zero submitted/stored observations and false semantic/publication flags.
Transport log records are excluded from result assertions. No inference,
media fetch, database write, production query change or deployment occurred.
