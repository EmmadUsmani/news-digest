# Plan: split World into World and U.S. news & politics

Owner decision, 2026-11-11. Steered as STEERING item 56.

## Goal

Two separate politics topics instead of one:

- **World news & politics:** global news and international affairs, including
  US foreign policy (wars, strikes, diplomacy, tariffs and trade with other
  countries).
- **U.S. news & politics:** what mainly plays out inside the US: Congress, the
  White House's domestic agenda, the courts, elections, federal and state
  policy, and major domestic events.

A reader who opens either topic should see the most important stories for that
scope, with no story repeated across the two.

## Setup

- **Keep the existing topic as World.** Same topic ID
  (`00000000-0000-4000-8000-000000000014`), so past editions, X search settings
  and readers' hidden-topic choices carry over. Rename it to "World news &
  politics" if needed, and narrow its description, includes and excludes to the
  scope above.
- **Add "U.S. news & politics" as a new topic,** through the normal topic data
  path (a seeded migration like the existing ones, or the topics API). Topics are
  data, not code. Place it directly after World.
- **Visible by default** to every reader, signed in or not. Nobody has to opt in.
- **Sources:** move US-domestic sources (for example Guardian US) to the new
  topic, and add credible US domestic feeds so it has depth comparable to the
  other topics. Choose them yourself and record the list in `docs/SOURCES.md`.
  Use free public feeds only: no new paid services or vendors.
- **X:** give the new topic its own curated account list, its own
  `x_search_topic_settings` row and its own daily keyword search, the same way
  the other topics work. Bluesky follows the existing per-topic pattern.

## Where the line falls

- The rule is the scope above. Topic descriptions carry it, and AI applies it.
  **No hand-written word lists or keyword rules** decide which topic a story
  goes to.
- **One story, one topic.** Story grouping never crosses topics today
  (`event-grouping.ts`), so the same event can currently reach both. Add a step
  so each story is published in only one of the two topics: the one whose scope
  fits best. Prefer extending the existing AI curation step over adding a new
  model call.
- Don't change how the other three topics work.

## Budgets (owner-approved 2026-11-11)

- **X production caps rise to $0.50 a day and $15 a month** (from $0.40 and
  $12). Find where the caps are enforced, and change them there and in the docs
  that state them. About $0.065 per topic per day today, so five topics at
  about $0.33 leave room for retries.
- **The AI daily cap (`LLM_DAILY_MAX_USD`) may rise up to $0.65,** only if a
  measurement shows the fifth topic needs it. The scheduled edition's 1.5×
  reserve must still fit under the cap. Measure first, with no extra paid
  runs: estimate from saved World editions. Report the measured edition cost and
  the new value in the ack.
- The X experiment budget is separate and unchanged.

## Order of work

1. Write the topic scope, setup and sources. Test them offline against saved
   World editions from Nov 4–10: which stories would land in each topic, and
   is any story in both?
2. Set the caps, deploy outside 13:00–16:00 UTC, and let the next scheduled
   edition run with both topics.
3. Review three scheduled editions in the normal daily edition review.

## Done when

Three scheduled editions in a row where:

- both topics have a full set of stories, with depth comparable to the other
  topics;
- no story appears in both topics;
- US-domestic stories are in U.S., and international stories, including US
  foreign policy, are in World, judged by reading the stories;
- X and AI spending stay within the caps, with no budget refusals;
- the edition still publishes on time, and the other three topics are no
  worse.

Each review reports per-topic story counts, any misplaced or repeated story,
and spending against the caps.
