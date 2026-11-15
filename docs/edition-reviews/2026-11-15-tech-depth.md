# Nov 15 Tech summary depth

Read-only natural-edition follow-up, iteration 2406. Edition
`a0fa3916-f1dc-4fbd-8d76-2884d5e01c06`; no inference, source requests or writes.

## Published evidence

| Story                         | Immutable supplied prose          | Published use                          |
| ----------------------------- | --------------------------------- | -------------------------------------- |
| Anthropic IPO                 | Empty                             | One headline-level sentence            |
| Lovable private-data exposure | Empty                             | One attributed headline-level sentence |
| Jensen Huang / Nvidia         | 595 characters of Verge reporting | Two attributed sentences               |
| Lutnick chip rules            | Empty                             | One attributed headline-level sentence |

Three thin summaries lack supplied reporting. The Nvidia story uses the available
reporting; this review finds no unused supplied detail that establishes an editor
failure. Saved evidence length is 595 characters, rather than the rounded 600
reported in the initial daily review.

## Supply and admission

A current read-only loader reconstruction returns 126 candidates for the saved
window, compared with 121 saved triage scores. Eleven currently have text. Using
only the saved scores and production eligibility rules admits 29 candidates,
of which two have prose:

| Candidate                          | Saved relevance / importance | Current prose    | Current outcome                                             |
| ---------------------------------- | ---------------------------- | ---------------- | ----------------------------------------------------------- |
| Nvidia overview (`ef668c6e`)       | 8 / 8                        | 649 characters   | In ten-slot ungrouped pool and published                    |
| Helen Toner interview (`678d16cc`) | 7 / 5                        | 1,495 characters | Admitted, outside first twenty ungrouped ranks, unpublished |

The interview includes OpenAI board history and AI accountability discussion.
It is substantive interview context, rather than a missing body for any of the
three empty-evidence published stories. The other nine text-bearing candidates
fail saved triage thresholds: shopping, entertainment, an environmental study,
robotics retrospective, aviation, two Starship reports and a small developer tool.
No new scoring or admission variant was evaluated.

## Historical limit and decision

The reconstructed grouping fingerprint is
`2d9a0f168444d5b31e38a7cae10cd5848b05c449fc493e47ae9ba1e4f0be4378`.
It has no saved cache hit. The grouped historical editor request is unavailable
in this review; ungrouped current ranking is not its membership. Later collection
and changed excerpts can explain the differing candidate count and fingerprint.
The immutable published-evidence finding does not depend on reconstruction.

Keep production admission unchanged, following the
[Nov 14 decision](2026-11-14-tech-depth.md). This edition confirms missing prose
for the three thin summaries but does not establish a new loss of reporting
about those stories. No longer-summary prompt, linked-page crawl, additional
source or budget increase follows. During the next daily review, inspect natural
supplied evidence and reopen admission only for an observed loss of usable
reporting; do not repeat these reconstruction variants.

## Verification

`pnpm exec tsx /tmp/2406-tech.ts` loads the saved edition snapshot and current
candidates inside `BEGIN READ ONLY` / `ROLLBACK`, uses saved triage scores, and
attempts only an exact grouping-cache lookup. No provider adapter is instantiated.
Assertions confirm four published stories, three with empty saved evidence,
eleven current prose candidates, two admitted, and the grouping-cache miss.
Private receipts: `/tmp/2406-tech.{ts,json,log}` and `/tmp/2400-snapshot.json`.
