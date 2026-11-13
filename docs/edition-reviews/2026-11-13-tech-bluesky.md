# Tech Bluesky discovery comparison — iteration 2177

Tech published no Bluesky additions in the Nov 13 scheduled edition. Its
557 observations supplied one semantic shortlist candidate; the editor chose
none. This free discovery comparison asks whether product names or a demo
query supply a useful alternative to `artificial intelligence`.

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
