# Nov 18 NBA injury grouping

Iteration 2779; scheduled edition `cd357e84-9383-4e10-b60c-c8318da4b314`.
The reader sees four reports on Jaylen Brown and six on CJ McCollum. Reviewed
all ten exact saved excerpts, retaining their IDs, URLs and timestamps in
`apps/api/test/fixtures/event-grouping-nba-2026-11-18.json`.

| Group                 | Evidence                                                                                                                | Decision                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Brown, four reports   | Left hamstring strain; Philadelphia rules him out of Wednesday's Orlando game after Monday's Brooklyn game.             | Same injury announcement.                         |
| McCollum, six reports | Atlanta's left calf strain announcement; approximately four-week absence or reevaluation after Sunday's Milwaukee game. | Same injury announcement.                         |
| Across the two groups | Different players, teams, injuries, games and announcements.                                                            | Separate events despite shared injury vocabulary. |

The shorter Yardbarker McCollum excerpt only describes an adverse injury update;
its title identifies McCollum and a month-long absence. This supports event
identity, but does not independently substantiate the calf diagnosis. The other
five excerpts explicitly identify the calf strain and four-week timeframe.
The lead Hawks report also covers Asa Newell's toe surgery; the shared McCollum
announcement supports its membership without making every detail common to all
six reports. Neither group supports counting independent reporting from the
number of coverage links.

All 45 unordered pairs are labeled: 21 same-event and 24 separate-event.
The production clustering evaluator accepts the published two-group membership
across 34 deterministic sampled orders, with zero missed positive, false positive,
unlabeled merged or order-sensitive pairs. These are sampled, not exhaustive,
orders. A merge-all control fails 24 pairs; an all-separate control misses 21.

Candidate IDs, titles and URLs match the pre-publication loader capture and
immutable coverage. This is agent annotation and an offline membership control,
not an independent assessment or a semantic-model replay. No paid calls,
publisher requests, production writes or grouping-guidance changes. The next
grouping step still needs independent labels and semantic evaluation; this does
not close M5 or the NBA editing regression.
