# Bluesky in editions

**Status:** steered as [item 40](../../../STEERING.md), not started. One Bluesky
post has reached an edition so far (Nov 4, Tech), and it repeated an X pick.

**What we know:**

- Collection works hourly. Bluesky has been on in editions since Nov 3.
- Bluesky only got slots X left empty. NBA and Gaming had none on Nov 4 or Nov 5.
- Call records show rejected editor replies on both days. The saved edition
  doesn't keep the Bluesky result, so failures are invisible.
- `llm.validation` and `budget.decision` logs don't name the step or topic.

**Owner decisions (Nov 5):** Bluesky can take one X slot per topic. The work
ranks after the Nov 6 review and ahead of the UI rebuild.

**Unknown:** why each topic ended with no picks, and why Sonnet was skipped for
one topic on Nov 5. A lead session's production read was blocked, so item 40
has the agent read the logs.

**Next:**

- Check the Nov 6 edition has saved Bluesky outcomes, if they deployed in time.
- Check the slot's cost gate against Nov 6's cost before it switches on.
- Review the first picks: are they different from the X posts, and worth reading?

**Open with the owner:** whether to add an alert when a source's AI step fails
or a source yields nothing for several editions. Proposed, not steered.
