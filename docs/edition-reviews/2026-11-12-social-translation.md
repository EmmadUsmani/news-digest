# Gaming clip context — iteration 2135

The saved Nov 12 edition `b1be5a12-2972-4eeb-9bff-82cbb10c1b07`
includes a French post describing a possible GTA VI gameplay clip from
Only In Dade, reportedly reshared by Rockstar on Instagram. Its English
reader note omits that description and adds a Nov 19 launch date attributed
to other posts. The selected post itself supplies no launch date.
The immutable reader object and provenance are retained in
`apps/api/test/fixtures/social-translation-2026-11-12.json`.

Social editor v11 prioritizes an English translation of non-English posts'
essential news, retaining attribution and uncertainty. It explicitly forbids
adding dates or background from other candidates and upgrading a possible
clip to confirmed gameplay. Original post text remains unchanged.

Offline tests pass the exact saved text through production-budgeted Sonnet
and Haiku routes with a simulated, source-bound English note. They verify
transport, acceptance and original-text preservation; they do not establish
future model compliance. Review the next scheduled Gaming notes naturally;
no paid replay or change to the saved edition is needed.

## Source-date validation — iteration 2139

The exact saved reader note previously passed the social validator despite its
unsupported Nov 19 date. Gaming final selection now checks explicit English
and French month/day dates and ISO dates in notes and rationales against the
same candidate's supplied prose. Equivalent month abbreviations, day-first
French/English dates, accents, ordinals and ISO dates can support English notes.
A claimed year also requires a matching supplied year. URLs, publication time,
other candidates, existing picks and story context cannot supply evidence.

Both X and Bluesky routes reject the saved note and accept a simulated
source-bound translation on the existing bounded repair. Exhaustion retains
the existing fallback behavior. Gaming-only instructions isolate its cache;
other topics, including NBA, keep their prior instructions and validation.
This is a narrow date-presence check, not a general claim verifier: numeric
slash dates, written-out days, other languages and event/date relationships
remain outside its scope. No paid development calls, cap changes or immutable-edition changes were made.
Natural selection quality still awaits scheduled review.
