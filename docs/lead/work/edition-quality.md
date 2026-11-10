# Edition quality

**Status:** Nov 10 NBA fell back to raw source excerpts: all four story-editor
attempts were rejected (unsupported-absence, negative-word, invalid JSON).
Steered as item 54 (`7c7df8ab`): find the cause, fix it before noon UTC Nov 11.
Lead's untested guess: the absence guard
(`apps/api/src/modules/curation/application/absence-support.ts`) rejects any
"not/no/without" sentence that isn't copied from a source word for word.

**Latest:**

- Nov 7: $0.380 of the $0.510 cap, 181 seconds, no budget refusals. NBA got a
  routine debut story and a dated game preview. Review:
  [docs/edition-reviews/2026-11-07.md](../../edition-reviews/2026-11-07.md).
- Fixes for the NBA failure (repair hints, preview exclusion, excerpt cutoff)
  deployed at 19:20 UTC Nov 7 (item 49).

**Next:**

1. Read item 54's ack: the cause named from the Nov 10 replay, a test-backed
   fix deployed before noon UTC, replays within $0.10.
2. Nov 11 edition: NBA must be AI-edited. If not, re-diagnose rather than
   re-steer the same fix.
3. Tech summary depth: propose steering once item 50 frees the agent.

**Watching:** speed target of 60 seconds is unmet, and low priority.
