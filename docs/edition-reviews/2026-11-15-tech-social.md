# Nov 15 Tech Bluesky intake — iteration 2420

Tech publishes two X posts and no Bluesky additions in edition
`a0fa3916-f1dc-4fbd-8d76-2884d5e01c06`, leaving three social slots open.
This review locates the loss using saved scores rather than new inference.

## Saved-window reconstruction

A repeatable-read, read-only transaction loads all 426 stored observations
for the edition window. Production safety/engagement ranking admits 49 posts;
all 49 have exact fingerprint matches through production `cachedScores`.
Production shortlisting completes with zero finalists, matching the saved
`nothing-passed-triage` outcome.

| Stage or gate              | Count |
| -------------------------- | ----: |
| Stored observations        |   426 |
| Safety/engagement intake   |    49 |
| Exact cached scores        |    49 |
| Relevance at least 6       |     0 |
| Interestingness at least 4 |     0 |
| Final shortlist            |     0 |

Read all 49 texts and saved score rationales. The strongest score is 5 / 3
for an allegation about an FAA AI procurement contract. A Microsoft outage
quip scores 4 / 2. Most remaining texts are AI-art hashtags, political
commentary, jokes and complaints about AI. No candidate meets either semantic
threshold, so neither the ten-post shortlist limit nor the final editor
causes the missing additions. No Bluesky editor was needed for this intake.

## Decision

Keep the current `AI` query, selection gates and budgets. This is concrete
natural-edition evidence of weak discovery supply, not a reason to force a
post. The [earlier comparison](2026-11-13-tech-bluesky.md) already examined
alternatives without establishing a better replacement. Do not repeat those
searches or relax gates on this evidence. Review the next natural edition;
Tech summary evidence depth remains a separate open task.

## Verification

`pnpm exec tsx /tmp/2420-tech.ts` asserts 426 observations, 49 exact cached
scores, complete scoring and zero finalists matching the saved outcome.
The first assertion inherited Gaming's expected intake of 50 and failed;
inspection confirmed Tech has 49 intake posts, and topic-specific assertions
then passed. Inference and cache-write methods throw if called; the transaction
rolls back. Private receipts: `/tmp/2420-tech.json` and `/tmp/2420-tech.log`;
saved snapshot: `/tmp/2400-snapshot.json`.

This reconstruction uses current stored observations and configuration at the
saved cutoff; it does not claim byte identity with an unretained historical
request. No external search, inference, publication or runtime change occurred.
