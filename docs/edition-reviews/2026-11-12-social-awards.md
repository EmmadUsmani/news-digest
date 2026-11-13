# Gaming awards repetition — iteration 2131

Saved edition `b1be5a12-2972-4eeb-9bff-82cbb10c1b07` (Nov 12 15:00 UTC)
contains two posts celebrating Resident Evil Requiem at the Golden Joysticks:

| Platform / author        | Supplied development                                                     |
| ------------------------ | ------------------------------------------------------------------------ |
| X / Resident Evil        | Console Game of the Year, trailer and performer awards                   |
| Bluesky / nintendeal.com | Same awards plus Ultimate Game of the Year and Capcom Studio of the Year |

The second pick's saved reader note emphasizes the top prize and studio award.
Those are additional results of the same ceremony, rather than an independent
moment deserving another slot. The saved reader objects are retained in
`apps/api/test/fixtures/social-awards-2026-11-12.json` with edition provenance.

Production already passes existing X picks to the Bluesky editor; its generic
same-moment rule leaves the additional-award distinction implicit. Social
editor v9 explicitly treats extra categories, top prizes and associated studio
awards for the same winning work at the same ceremony as one moment. A separate
release or later independent development remains eligible. No deterministic
word matching, topic-specific filtering or additional model calls are added.

Offline real-budgeted-editor tests transport both saved texts unchanged to
Sonnet and Haiku routes. Simulated responses exercise returning no duplicate
and retaining a separate synthetic release. They do not prove future model
compliance. Review the next natural Gaming selection for repeated ceremonies;
never regenerate or change this immutable saved edition to validate the fix.
