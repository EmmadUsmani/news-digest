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

## Exhaustive deletion bound (iteration 3350)

The same evaluator now enumerates every subset of the published posts while
keeping all stories, all labelled events and every slot marked as carrying
material facts. It uses existing labels only; it makes no model calls. This
is an optimistic feasibility bound for deletion, not a production selector.

| Topic                 | Nov 17 before → best | Nov 18 before → best | Subsets searched, both days |
| --------------------- | -------------------: | -------------------: | --------------------------: |
| Tech & AI             |      22.22% → 22.22% |      12.50% → 12.50% |                          24 |
| NBA                   |      11.11% → 11.11% |      33.33% → 14.29% |                          32 |
| Gaming                |      10.00% → 10.00% |      30.00% → 30.00% |                          64 |
| World news & politics |      11.11% → 11.11% |      25.00% → 25.00% |                          24 |
| U.S. news & politics  |      12.50% → 12.50% |      22.22% → 12.50% |                          24 |

All 168 subsets are enumerated; 15 preserve the required facts and events.
For Gaming, keeping the redundant WoW slot gives a lower concentration than
deleting it: 30% versus 33.33%. No permissible deletion improves on 30%.
For Nov 17, all slots carry retained facts, so only the original selection
is admissible in each topic. NBA membership remains provisional as above.

Reject a deletion-only event budget as the complete solution. Further build
work must consider alternative candidate posts that add different events,
rather than only pruning the published picks. Nov 12–16 candidate replay and
the full Nov 12–18 deployment gate remain open. No runtime change is shipped.

## Editor-path replay (iteration 3357)

The same evaluator now sends the existing Nov 17–18 labels through
`SocialPostEditor`, its actual bounded story context, wire-ID aliases,
validation and budget/cache wrapper. A scripted response preserves all original
picks and supplies existing annotations; it qualifies no new alternatives.
Each topic runs fresh and cached, with identical results and one scripted
response. There are no network calls or new reference labels.

| Topic                 | Nov 17 before → editor preview | Nov 18 before → editor preview | Refused for shortened evidence |
| --------------------- | -----------------------------: | -----------------------------: | ------------------------------ |
| Tech & AI             |                      2/9 → 2/9 |                      1/8 → 1/8 | Both days                      |
| NBA                   |                      1/9 → 1/9 |                      3/9 → 3/9 | Nov 18                         |
| Gaming                |                    1/10 → 1/10 |                    3/10 → 3/10 | Neither                        |
| World news & politics |                      1/9 → 1/9 |                      2/8 → 2/8 | Neither                        |
| U.S. news & politics  |                      1/8 → 1/8 |                      2/9 → 2/9 | Nov 18                         |

All 81 labelled topic-events and retained-fact slots survive. Four of ten
previews refuse because at least one story summary exceeds the 400-character
context limit. In particular, both Nov 18 improvements available to the
planner (NBA 33.33% → 14.29%, U.S. 22.22% → 12.50%) disappear in the editor
path. The six complete previews have no improving deletion.

Reject the current bounded, published-picks-only preview as a deployment
candidate: it improves zero of ten topic-editions. The planner's optimistic
numbers must not be reported as editor results. An implementation needs
complete comparison evidence and independently qualified alternatives before
it can meet item 69. Semantic annotation quality and the remaining Nov 12–16
comparison are still open; this replay establishes neither.
