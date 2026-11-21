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
Matching acceptance passed Nov 21: eight paid Haiku calls cost $0.009843; seven
selected stories link to twelve predecessor occurrences. Every model pair is in
the item 73 ack. Item 73 accepts the existing $0.613774/$0.65 budget preflight.
Scheduled publication now enriches accepted selections after normal story/post
editing, using the shared budget ledger/cache. Refusal preserves the original
edition. Check the first real edition’s developing summaries and earlier-coverage
links on Nov 22.

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

Input selection is implemented: a Sunday 17:00 UTC cutoff selects published
daily coverage windows ending within the preceding seven days, using the latest
published regeneration of each window. Saved stories/posts retain their daily
edition IDs; private, test, weekly and other-profile editions are excluded.
The weekly editor contract supplies saved story/post text with opaque daily-item
references. Its response allows at most five summaries, requires daily story
coverage for each, and rejects unknown or reused references atomically. Validated
coverage retains daily edition IDs and original URLs. This validates structure
and provenance. Weekly execution uses the existing budget ledger, input limits
and durable cache, with one Sonnet attempt per topic and no repair or model
fallback. Budget refusal or invalid coverage produces no weekly edition.
The PostgreSQL input reader filters published scheduled daily snapshots by profile,
coverage window and publication cutoff before applying the saved-input selector.
The publication workflow now waits for Sunday’s published daily edition, skips
quiet-topic calls and saves all topics together only after every required edit
succeeds. Generation keys support retries; regeneration uses a new key.
The PostgreSQL publication adapter stores whole immutable snapshots in a separate
weekly table, with generation-key retries and a published Sunday daily prerequisite.
The production generation entry point connects saved daily inputs and atomic storage
to the shared budgeted Sonnet editor. Editor creation is lazy: waiting for Sunday
daily, quiet topics and saved retries need no provider or credentials. Missing
credentials or a refused edit publishes nothing. Weekly storage now supports explicit
profile-scoped ID lookup and bounded history pages, ordered by coverage end and
publication time with an ID tie-breaker; regeneration versions remain browseable.
Public `/api/weekly-editions` history and UUID detail reads expose saved weekly
summaries and daily coverage links, stripping profile, provider and evidence text.
Reader history links to `/weekly-editions`, labelled “Week in review”. Weekly detail
pages show saved summaries, quiet topics and links to daily story coverage (posts
link to the daily topic’s posts section). The scheduled runner now pins public scope, coverage and retry keys to the original
Sunday slot, skips work over six hours late and reports prerequisite/editor refusal
as a failed attempt. The worker registers Sunday 17:00 UTC on the shared digest queue,
with three attempts and five-minute exponential backoff. Its single execution slot
serializes weekly and daily generation; shutdown drains work before closing storage.
The first scheduled weekly publication still awaits acceptance.

## Out of scope (owner, Nov 19)

Reading-time targets, an RSS feed of editions, "catch me up since my last
visit", and NBA scores or standings (deferred; it needs a data vendor).
