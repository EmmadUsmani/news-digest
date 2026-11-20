# Nov 18 joint story/post event comparison

Iteration 2995 evaluates all 25 stories and 19 posts in saved edition
`cd357e84-9383-4e10-b60c-c8318da4b314`. The
[labels and retained prose](2026-11-18-joint-event-labels.json) cover all five
topics. These are agent editorial labels, not model output or independent
acceptance. They measure published-slot breadth, not candidate-pool recall.

Run `pnpm exec tsx scripts/evaluate-saved-nba-event-breadth.ts`.
The existing offline evaluator now also checks joint labels, unique IDs,
prose hashes, exact retained post texts, unchanged stories and event retention.
No database, network, provider calls or selector changes are involved.

| Topic                 | Labelled events | Published largest-event share | Manual subset share | Slots before → after |
| --------------------- | --------------: | ----------------------------: | ------------------: | -------------------: |
| Tech & AI             |               8 |                  1/8 (12.50%) |        1/8 (12.50%) |                8 → 8 |
| NBA                   |               7 |                  3/9 (33.33%) |        1/7 (14.29%) |                9 → 7 |
| Gaming                |               7 |                 3/10 (30.00%) |        3/9 (33.33%) |               10 → 9 |
| World news & politics |               7 |                  2/8 (25.00%) |        2/8 (25.00%) |                8 → 8 |
| U.S. news & politics  |               8 |                  2/9 (22.22%) |        1/8 (12.50%) |                9 → 8 |

All 37 labelled topic-events survive in the 40-slot manual subset. This is
retention within the selected edition, not 100% important-event recall.

## Editorial decisions

- NBA retains the duo-statistics post and removes the streak and overtime
  alternatives, following the [prior four-post review](2026-11-18-nba-event-comparison.md).
  Curry's attributed contract report stays distinct from the Warriors' losses:
  the same player does not make the contract report the same development.
- Gaming removes the WoW post that repeats the story's weekly-player milestone.
  The GTA-required PS5 update stays distinct from launch reviews. All three
  Game Awards posts share the nominations event, but name different works or
  categories; keep them in this conservative subset rather than claiming
  their facts are interchangeable. Their authenticity is not established here.
- World keeps the summit post: Putin briefing Xi, prospective bilateral talks
  and a joint statement add detail beyond the selected handshake story.
  The bridge attack, UK air-defence aid and EU financial proposal are separate
  developments despite all involving Ukraine.
- U.S. removes the Peltola result post as a repeat of the selected race result.
  Its chamber total is an additional fact about that result. The Senate agenda,
  outage briefing request and stock-trading-ban demand remain distinct.
- Tech has no repeated labelled event across its eight published slots.

## Decision

Reject simple duplicate deletion as a sufficient deployment result. It reduces
NBA and U.S. concentration but increases Gaming's largest-event share by
shrinking the denominator around the remaining nominations cluster. A blanket
one-slot rule would also discard materially different summit or nominations
facts. Event count alone cannot establish preservation of those facts.

Keep production unchanged. This is the first complete topic-wide joint label
set for Nov 18, not a replay of a proposed model selector. Complete the same
bounded comparison for Nov 12–17, then evaluate a real selection change with
material-fact retention as well as event share. Item 69's deployment gate
remains open; do not tune against these agent labels before owner review.
