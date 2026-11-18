# November 18 NBA social event comparison

Iteration 2773 compares the four published NBA posts in edition
`cd357e84-9383-4e10-b60c-c8318da4b314` using
[retained texts](2026-11-18-bluesky-selection.json) and
[manual labels](2026-11-18-nba-event-labels.json).

| Post              | Supplied development                                                                   | Comparison decision                                                   |
| ----------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| nuel / X          | Stephen A. Smith's attributed report that Curry believes this may be his last contract | Separate contract report; retain attribution and uncertainty          |
| Hoop Central / X  | Lakers have won nine straight games                                                    | Useful game/streak representative                                     |
| Underdog NBA / X  | “GRIMES SENDS IT TO OT”                                                                | Teaser lacks score, opponent and result; do not infer the unseen play |
| nbastat / Bluesky | Dončić/Grimes combined statistics, attributed to OptaSports                            | Most informative game representative in this manual comparison        |

The game label follows the published-edition review's contextual judgment.
The short X texts do not independently establish the opponent, date or that
all three describe one game. No linked page or media was fetched, and the
record claim was not independently verified. These labels are editorial
expectations, not model predictions or a general event-identity classifier.

## Offline comparison

Run `pnpm exec tsx scripts/evaluate-saved-nba-event-breadth.ts`.
The script verifies all four author/full-text SHA-256 matches, enumerates all
16 subsets and compares supplied standalone text and manually labeled breadth.

| Selection                     | Slots | Labeled developments | Repeated event slots | Non-standalone posts |
| ----------------------------- | ----: | -------------------: | -------------------: | -------------------: |
| Published                     |     4 |                    2 |                    2 |                    1 |
| Curry report + Lakers streak  |     2 |                    2 |                    0 |                    0 |
| Curry report + duo statistics |     2 |                    2 |                    0 |                    0 |

Both alternatives preserve the labeled developments without padding. The duo
statistics are the preferred manual representative for their concrete detail;
the streak remains a valid alternative. This comparison does not establish
that either two-post set is the best selection from the full candidate pool.

## Cause and next change

The editor's saved reason explicitly rewards the stat line for adding detail
beyond the streak and overtime posts. The current shared instruction says to
avoid duplicate moments, but its detailed same-announcement examples concern
launches and awards, leaving this game-detail judgment insufficiently specified.

The production path selects X/Reddit first, then offers remaining slots to
Bluesky with those texts as `alreadySelected`. The Bluesky pass cannot replace
existing picks: it can decline this candidate but cannot remove the earlier
overtime teaser or consolidate the two X game posts. A Bluesky-only fix leaves
the earlier repetition intact. Fix selection at the X comparison as well as
cross-platform comparison; preserve distinct later developments involving the
same team/player. Do not use author exclusions or blanket team matching.

The saved-text regression supplies all three preceding X texts and the exact
Bluesky candidate to both Sonnet and capped-Haiku routes. A simulated empty
response is accepted without padding. This verifies context transport and
response handling, not semantic model compliance. No selection instructions,
queries, budgets or published content changed; no provider calls were made.
Next implementation should use these retained cases and the existing distinct
trade-completion control, then await a natural scheduled selection for acceptance.
