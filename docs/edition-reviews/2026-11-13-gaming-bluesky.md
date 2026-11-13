# Gaming Bluesky discovery comparison — iteration 2178

The scheduled Gaming section selected a Slay the Spire 2 beta update alongside
four distinct X posts. This comparison asks whether replacing broad `game`
discovery with gaming vocabulary or that concrete title would improve supply.

## Four free searches

`pnpm exec tsx scripts/probe-bluesky.ts --gaming` used one common 24-hour
window ending 2026-11-13T18:13:28.239Z, at most two 25-result pages per query.
No observations were stored, media fetched or paid inference called.

| Query            | Fetched | Safety/engagement eligible | Attached videos in that pool |
| ---------------- | ------: | -------------------------: | ---------------------------: |
| `game`           |      50 |                         48 |                            5 |
| `gaming`         |      48 |                         48 |                            5 |
| `video games`    |      50 |                         50 |                            1 |
| `Slay the Spire` |      48 |                         48 |                            1 |

The preparation ranker does not apply positive semantic relevance. Bounded
highest-ranked text examples show different kinds of irrelevant supply:

- `game`: a comic link and an unrelated joke rank above game-industry AI
  commentary. Video examples include Jumping Flash 2 trivia, a Skyrim question
  and the concrete Slay the Spire update already selected naturally.
- `gaming`: political commentary and commissioned art lead the examples.
  Videos include an explicitly labelled horror-game re-run, a gaming-chair
  post and nostalgia. None establishes a fresh launch or reveal.
- `video games`: general commentary and personal posts lead; its one video
  advertises an E3 2005 DVD trailer, not a current announcement.
- `Slay the Spire`: the same beta-update post found by `game` leads, followed
  by a contextless “it's been” and reaction to that update. Narrowing to this
  title supplies repetition without demonstrating additional event diversity.

These assessments cover only exported bounded text examples. Linked pages
and media were not opened, claims were not independently verified, and
safety eligibility does not mean semantic or publication approval.

## Decision and verification

Retain `game` and the existing semantic/editorial gates. Neither broader gaming
vocabulary nor a single already-covered title establishes a better replacement.
Do not force a Bluesky slot or infer freshness from attached video alone.
No production query, configuration, schedule or budget changed.

Four exported result assertions pass: common window, counts bounded by 50,
zero submissions/storage and false semantic/publication flags. The private
mode-600 export `/tmp/bluesky-gaming-2178.jsonl` also contains adapter event
records; assertions select query-result records explicitly. `--gaming --store`
refuses before credentials/network access. No additional live search is needed
without a concrete new discovery hypothesis.
