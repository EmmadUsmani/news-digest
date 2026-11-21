# Nov 17 joint story/post event comparison

Iteration 3166 labels all 25 stories and 20 posts in immutable edition
`6216cb7a-3b6a-4fff-9e35-5fe959eb0c8e`, read through the local public API.
[Retained prose and labels](2026-11-17-joint-event-labels.json) use story titles
and summaries and the API's post text field. These are agent judgements of
published prose, not independent labels or verification of the reporting.

Run `pnpm exec tsx scripts/evaluate-saved-nba-event-breadth.ts` for Nov 17–18.
It verifies hashes, slot counts, unique IDs, retained events, unchanged stories
and the previously retained Nov 17 Bluesky texts. No provider calls occur.

| Topic                 | Labelled events | Published largest-event share | Manual subset share | Slots before → after |
| --------------------- | --------------: | ----------------------------: | ------------------: | -------------------: |
| Tech & AI             |               8 |                  2/9 (22.22%) |        2/9 (22.22%) |                9 → 9 |
| NBA                   |   9 provisional |                  1/9 (11.11%) |        1/9 (11.11%) |                9 → 9 |
| Gaming                |              10 |                 1/10 (10.00%) |       1/10 (10.00%) |              10 → 10 |
| World news & politics |               9 |                  1/9 (11.11%) |        1/9 (11.11%) |                9 → 9 |
| U.S. news & politics  |               8 |                  1/8 (12.50%) |        1/8 (12.50%) |                8 → 8 |

## Editorial decisions

- Tech's macOS story and Chance Miller post describe the same permissions
  change. Retain the post: it adds the macOS 27.3 interface, continued ability
  to enable Full Disk Access, and Apple's preference for folder-specific
  grants. A one-slot rule would remove those facts. Grok agent behaviour,
  Apple's permissions and Willison's sandbox demos are separate developments.
- NBA's Warriors loss and Fears triple-double might concern the same game.
  The saved post names no opponent, so do not infer membership from timing
  and team alone. Keep separate provisional labels and retain both; if joined,
  NBA has eight events and largest share 2/9 (22.22%) before and after.
  Fears' milestone remains additional information either way. Brown's injury,
  LeBron's conditioning and Shannon's bench-scoring record are distinct.
- Gaming's GTA pre-order estimate, leak prosecution and PSN suspensions are
  separate developments. Netflix layoffs and the union AI manifesto are also
  distinct despite the shared workforce theme. Retain every post.
- World's bridge strike, rescue-operation strike, refinery attacks, peace
  talks, California aid and French training mission are different developments;
  sharing Ukraine as a subject is insufficient to merge them.
- U.S. congressional oversight analysis, testimony-approval memorandum,
  Reitz letter and GAO leadership concern different actions. The Bonta lawsuit
  also appears in Tech, but this comparison counts events within each topic.

## Decision

Retain all 45 slots and all 44 provisional topic-events (43 if the NBA pair
is joined). Reject blanket one-slot deletion for this edition: the only
established story/post overlap contributes concrete additional facts. Neither
concentration nor event retention improves through the conservative subset.

This extends the bounded Nov 12–18 comparison by one edition; Nov 12–16 and
real-selector/material-fact acceptance remain open. This is a manual subset,
not a replay of a changed selector or a candidate-pool recall measurement.
Production stays unchanged; do not tune against these labels before owner
review. The [Nov 18 result](2026-11-18-joint-event-comparison.md) still rejects
simple deletion as sufficient for deployment.
