# Nov 14 Tech story/post overlap — iteration 2295

Scheduled edition `b9d55088-892a-4e34-b77c-a398d64c6a9f`, window ending
15:00 UTC, publishes four Tech stories and two X posts. The saved admin
preview records AI social editing with Sonnet and zero unscored social IDs.
Reader post IDs, original text and reader notes match the saved preview.

| Saved item                                   | Supplied development                                                                                               | Overlap assessment                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Story `effd70d7-7895-48f3-a024-bbc5e875cc2e` | Italy's Meta data-access fine                                                                                      | Neither selected post repeats it.                                                                 |
| Story `3c54c5f4-93f9-4e71-aa2c-ba5118fa0fe1` | Nvidia leadership reporting and preceding director stock sale                                                      | Neither selected post repeats it.                                                                 |
| Story `556e39b9-2692-4d9d-bda0-913f5d6e9517` | Claude Code Projects parallel workers                                                                              | Neither selected post repeats it.                                                                 |
| Story `328e97d8-86c8-4c7a-8216-188a4185cb14` | Ggml v1.0.0                                                                                                        | Neither selected post repeats it.                                                                 |
| X `2121303079803089179`                      | Author says shipped Grok Bot harness optimizations yield about 7% more plan usage, up to about 15% on routine runs | Separate product update; original approximate figures retained; empty reader note adds no claims. |
| X `2121365318895571092`                      | Techmeme relays an FAA SMART congestion-advice AI expansion, crediting Ars Technica                                | Separate deployment report; reader note correctly calls it a secondhand summary.                  |

There is no story/post or post/post repeated event in this saved Tech section.
The FAA post describes tool deployment; do not conflate it with the separate
air-traffic outage candidates merely because both mention the FAA. The saved
triage also distinguishes the selected Grok optimization from a low-scoring
Grok enterprise-hype post. No unseen media or linked articles were inspected.
The editor rationale calls the Grok post firsthand, but authorship expertise
is not independently established here; the reader itself makes no such claim.

This is a positive natural X-path observation after Nov 13's incomplete story
triage, not evidence that story context caused rejection of a duplicate.
The saved triage scores Nvidia governance text at relevance 3/importance 3;
that unselected candidate cannot demonstrate editor-level overlap rejection.
The exact historical editor request is not retained in this review.

Bluesky read 671 candidates, shortlisted one and selected none despite three
open slots (`editor-chose-none`), with no post-validation drops. This is not
a new selected Bluesky observation and does not establish why the candidate
was omitted. The Nov 12 saved United Airlines repetition remains the relevant
Bluesky challenge. Keep overall story/post acceptance open until natural
selection exercises that path; do not add prompt rules from this clean run.
Both selected X official metric objects are empty; reported discovery counts
do not establish measured virality or growth. Broader social quality is open.

Verification: read-only GETs of `/api/editions/latest` and the authenticated
saved admin preview; local assertions check edition ID, four stories, two posts,
AI method, zero unscored social IDs and exact reader/admin post text/context
agreement. Event comparisons above are a manual supplied-text review, not an
automated semantic test. Private receipts: `/tmp/2295-reader.json` and
`/tmp/2295-preview.json`. No inference, external source requests, production
writes or saved-edition changes.

## Bluesky supply diagnosis — iteration 2322

Reconstructed the fixed window with production `shortlistBlueskyPosts`, using
stored candidate scores inside a repeatable-read, read-only transaction.
All 671 observations load; the safe intake has 50 uniquely scored candidates,
complete scores and exactly one finalist, matching saved selection counts.

The finalist is `spavel.bsky.social`'s post
`at://did:plc:o7xt7svg2xtjbb4e2xqahqqc/app.bsky.feed.post/3n27xqfn2gk2r`:

> Nov 12: FAA adopts AI tool for managing air traffic
> Nov 13: FAA grounds all US flights

Its stored relevance is 7 and importance 4. Triage's rationale says:
“Timeline links AI adoption to grounding; causation unverified.” This supplies
no independent evidence of a causal connection. The selected X FAA SMART
post already covers tool deployment, although the exact historical editor
request and omission rationale are not retained here. Do not claim either
causation or overlap was the editor's recorded reason for omitting this post.

The publication records `editor-chose-none`, three open slots and zero
validation drops. The publication-window cache contains one empty social
selection, also with zero drops; matching its shape alone does not establish
its request identity. No stronger qualifying Bluesky alternative is lost to
the ten-post shortlist cap in this reconstruction. Keep gates and budgets:
forcing this finalist into an empty slot would add no established reporting.
Compare the next natural intake for independent developments before tuning.

Assertions verify complete scoring, observation and shortlist counts against
saved metadata. Private receipts: `/tmp/2322-tech-receipt.json` and
`/tmp/2322-tech-output.json`; temporary script `/tmp/2322-tech.ts` uses a
cache-only triage substitute and rolls back its read-only transaction. Current
stored observations and policy are a reconstruction, not an exact historical
request replay. No inference, collection, publication or database writes.

## Saved X media fallback — iteration 2325

The saved FAA post remains readable with X widgets blocked: its complete saved
text, author, timestamp, original destination and expandable context remain
available. The browser check also covers every selected X post's failure state.
A local widget stub exercises retry, keyboard recovery, width changes and saved
text disclosure persistence across theme changes at 1440, 390 and 320 pixels in
light and dark modes. All six views pass without writes or external requests.
This establishes reader fallback behavior, not live X media availability.

Refreshed desktop/mobile light/dark `x-media-failure-*` screenshots from the
Nov 14 saved edition; inspected mobile light. Other incidental screenshot
refreshes were discarded. `pnpm exec tsx scripts/smoke-reader-x-media.ts` passes
(private receipt `/tmp/2325-media.log`). The independent saved mixed-publisher
coverage browser check also passes; its screenshots were discarded. No reader,
editorial, discovery, budget or activation setting changed. Scheduled acceptance
for Gaming and World/U.S. remains required before public activation.
