# Edition quality

**Status:** item 54 acked (Nov 10, 19:28 UTC). Causes from the replay: an
invented "no timeline" claim, a supported sentence rejected for not being word
for word, and too many brief bullets. Fix: NBA-only prompt guidance (v14),
check unchanged, deployed before the cutoff. The replay passed only on the Haiku
repair; Sonnet, the main model, wasn't tested, and the first Haiku attempt still
failed on a supported sentence. $0.008 spent (agent's figures).

**Latest:**

- Nov 7: $0.380 of the $0.510 cap, 181 seconds, no budget refusals. NBA got a
  routine debut story and a dated game preview. Review:
  [docs/edition-reviews/2026-11-07.md](../../edition-reviews/2026-11-07.md).
- Fixes for the NBA failure (repair hints, preview exclusion, excerpt cutoff)
  deployed at 19:20 UTC Nov 7 (item 49).

**Next:**

1. Steered Nov 10 21:40 UTC (`0282665f`): replay Nov 10 NBA through Sonnet
   then Haiku, up to three runs, $0.25 total. Fix the check only if Sonnet is
   rejected for supported sentences. Read the ack: per-run results, cost, change.
2. Nov 11 edition: NBA must be AI-edited.
3. Tech summary depth: propose steering once item 50 frees the agent.

**Watching:** speed target of 60 seconds is unmet, and low priority.
