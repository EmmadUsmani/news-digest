# Reader features plan (STEERING item 70)

Approved by the owner on 2026-11-19. Three features, built in this order.
Each one ships on its own and must fit the existing AI caps (daily at most
$0.65, monthly $20). If one can't fit, record that in `NEEDS_FROM_HUMAN.md` in
one line and go on to the next one. Don't raise a cap.

## 1. Developing stories

**Goal:** when a story continues from an earlier edition, the reader sees what
is new and can reach the earlier coverage. Today each edition summarizes a
continuing story from scratch.

- Match each selected story against the stories in the last 7 published
  editions of the same topic. Use the existing clustering or embedding
  similarity, not wording rules. Save the link (earlier edition and story) with
  the edition so the snapshot stays immutable.
- When there is a match, give the editor the earlier headline and summary.
  The summary should lead with what changed since then.
- In the reader, show a small "Developing" label with the number of editions
  it has run in, plus one "Earlier coverage" link to the previous edition's
  story.
- Check it offline first: replay matching over the saved editions from Nov 12
  to 18 and list the matched pairs in the ack. Wrong matches are worse than
  missed ones, so if the matches look wrong, raise the threshold. Don't add
  rules.

Implementation decision: [selected-story enrichment](decisions/2026-11-19-developing-selection.md).
Production stays disabled: the Nov 21 one-time offline check has no cached
matcher responses and incomplete whole-day feature captures. The available
plan peaks at $0.613774 against $0.65; that is not a complete admission pass.
The blocker is recorded in NEEDS_FROM_HUMAN.md; work moved to feature 2.

## 2. Why this was picked

Live since Nov 21 on published editions with saved editor reasons.

**Goal:** readers can see why each story and post made the edition.

- The editor's reason is already saved with each edition. Show it as a
  collapsed "Why this" disclosure under each story and post, using existing
  reader styles. It works on desktop and mobile, and in light and dark modes.
- Show the reason text only. No scores, signal values or operational fields.
  Public projections must keep omitting them.
- Older editions with no saved reason show nothing. Don't backfill them.
- Put desktop and mobile screenshots in the ack. The owner reviews the look
  afterwards.

## 3. Week in review

**Goal:** one weekly edition per topic that covers the week's biggest stories.

- Build it from the week's published daily editions (their selected stories
  and posts), not from raw candidates. That keeps the cost to one editor run
  per topic.
- It runs on Sundays at 17:00 UTC, covering the last 7 days and the daily
  edition published that day. It's outside the 13:00–16:00 UTC window, and
  the daily edition always comes first.
- Up to 5 stories per topic, each with a short summary of how the story moved
  over the week and links to the daily editions that covered it.
- It appears in history labelled "Week in review" and never replaces the
  latest daily edition on the home page.
- Same immutability as daily editions: a regeneration creates a new version.

## Out of scope (owner, Nov 19)

Reading-time targets, an RSS feed of editions, "catch me up since my last
visit", and NBA scores or standings (deferred; it needs a data vendor).
