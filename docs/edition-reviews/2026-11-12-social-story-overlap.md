# Tech story/post overlap — iteration 2134

The immutable Nov 12 edition `b1be5a12-2972-4eeb-9bff-82cbb10c1b07`
selects a United Airlines story about blocking AI flight-booking agents and a
Bluesky post repeating that decision with a WSJ link. Its reader note says it
is relevant to agent builders, without supplying a separate development.
The exact saved reader objects and window provenance are retained in
`apps/api/test/fixtures/social-story-overlap-2026-11-12.json`.

The Bluesky editor previously compared existing social picks but received no
selected stories. Production now supplies Tech's selected story titles and
summaries as comparison context (at most ten, 300/400 characters each). Other
topics retain their previous input while NBA scheduled acceptance is pending.
An overlapping post must add a distinct substantive development or original
contribution, such as a firsthand demonstration or on-the-ground observation.
A shared subject alone is not a duplicate. Story context cannot support claims
in the post's rationale or reader note; those still require the original post.
Original text, ranking, platform reservation, caps and call counts are unchanged.

Offline production-budgeted-editor tests transport the saved post and selected
story through both model routes with simulated rejection, preserve a separate
synthetic development, enforce context bounds and isolate context-free caches.
Edition composition also verifies transport through Bluesky preparation.
These tests do not measure future model compliance. Review natural Tech picks
after the next scheduled publication; do not regenerate the immutable edition.
