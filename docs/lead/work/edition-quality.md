# Edition quality

**Status (17:45 UTC Nov 13):** Nov 13 edition degraded, a new breakage. 11 of
15 triage calls expired in a local 10-second queue and never reached the
provider, so every topic shipped source excerpts and World/U.S. withheld their
stories. The NBA fix from item 59 was never exercised. A Claude API incident
was open 13:09–15:38 UTC (status.claude.com), but no call got a provider
error: the timer was ours, added Nov 12 18:00 (`da45b0f4`), and Nov 13 was its
first edition. The outage may have slowed calls; normal speeds would likely
still fail (lead inference, normal triage latency not checked). The agent fixed admission
(four shared slots claimed before budget reservations), proved five-topic
contention offline and deployed at 16:00 UTC (`a9d4ccf1`). Review:
[docs/edition-reviews/2026-11-13.md](../../edition-reviews/2026-11-13.md).

**Latest:**

- Nov 7: $0.380 of the $0.510 cap, 181 seconds, no budget refusals. NBA got a
  routine debut story and a dated game preview. Review:
  [docs/edition-reviews/2026-11-07.md](../../edition-reviews/2026-11-07.md).
- Fixes for the NBA failure (repair hints, preview exclusion, excerpt cutoff)
  deployed at 19:20 UTC Nov 7 (item 49).

**Next:**

1. Nov 14 15:00 UTC edition: all 15 triage calls dispatch, all topics
   AI-edited, NBA included (item 59). If it fails again, it's a repeat
   breakage: propose steering.
2. Tech summary depth: on Current order after item 50 and Bluesky (item 59).

**Watching:** speed target of 60 seconds is unmet, and low priority.
