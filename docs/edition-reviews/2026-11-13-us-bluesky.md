# U.S. Bluesky scheduled selection — iteration 2174

Read-only trace of edition `f901ba6c-cba3-4116-8539-fd0e92b98ec4`,
window ending November 13 at 15:00 UTC. The repaired `Congress` query
supplies 511 observations / 56 distinct posts. Fifty safe engaged candidates
span 38 authors, with at most six posts from one author. This follows the
[pre-edition supply review](2026-11-12-bluesky-pool.md#repaired-us-supply-before-scheduled-selection--iteration-2158).

## From supply to ten candidates

The production shortlist was reconstructed offline from the historical
observations and 50 saved semantic scores. Every candidate has exactly one
matching cached ID; no model was instantiated. Scores below are saved
importance/relevance, not a new assessment of the claims.

| Rank | Author                         | Supplied development                                     | Score | Published |
| ---: | ------------------------------ | -------------------------------------------------------- | ----- | --------- |
|    1 | rbreich.bsky.social            | Commentary alleging attempts to strip Omar's citizenship | 7/9   | No        |
|    2 | iwillnotbesilenced.bsky.social | Ávila Chevalier House-election report                    | 6/9   | Yes       |
|    3 | kylegriffin1.bsky.social       | Wyden/Alsobrooks RFK testimony investigation             | 6/9   | Yes       |
|    4 | atrupar.com                    | Attributed Emmer remarks about removing Omar             | 6/8   | No        |
|    5 | bymichellersmith.com           | RFK investigation, exclusive-report headline             | 5/9   | No        |
|    6 | altcdc.altgov.info             | RFK investigation with commentary                        | 5/9   | No        |
|    7 | angrystaffer.bsky.social       | Van Hollen leadership challenge                          | 5/8   | No        |
|    8 | donmoyn.bsky.social            | GAO appointment/oversight commentary                     | 5/8   | No        |
|    9 | newrepublic.com                | Report of call to remove Omar                            | 5/8   | No        |
|   10 | atrupar.com                    | Attributed Walkinshaw question about Trump/Huang         | 5/6   | No        |

## Reader outcome and decision

The cached final editor selects ranks three and two. Its RFK rationale
explicitly prefers the named senators and AP/Guardian context over the other
two posts repeating that investigation. The election report adds a distinct
development. The shortlist's Van Hollen post repeats an already selected X
report; it is not published again. No Bluesky pick displaces X, and neither
duplicates the other selected posts. U.S. stories were withheld after failed
shared triage, so this cannot accept overlap handling with a normal story section.

Three slots were open, but only two posts survived. Saved diagnostics count
one unsupported-claim rejection; the accepted cache does not identify which
candidate was rejected. Do not attribute it to the Omar commentary or infer
editor reasons for every omitted candidate. The editor's explicit reason for
preferring the RFK recap is detail in supplied text, not verified authorship
or reporting provenance. No linked reporting or attached media was opened.

Retain `Congress` and the existing semantic/editorial gates. Collection is
restored, distinct concrete additions are observed, and repeated RFK coverage
is collapsed at selection. Remaining quality work is original-reporting depth
and normal story/post overlap, not absent supply or a need to fill all slots.
Official counts establish engagement snapshots, not measured growth or
independently verified claims. No new U.S. discovery rollout is justified here.

## Verification

- `pnpm exec tsx scripts/report-bluesky-coverage.ts --window-end 2026-11-13T15:00:00Z`.
- Temporary production-shortlist invocation uses a repeatable-read READ ONLY
  transaction, historical observation cutoff and only cached
  `social-triage-item-v1` scores created at 15:00–15:03 UTC. All 50 candidate
  IDs match exactly once; complete status and ten results asserted.
- Protected saved-preview GET reconciles 511/10/2 read/shortlisted/published,
  three open slots and one unsupported-claim drop. Cached final aliases
  `post3`/`post2` match the reconstructed candidates and public saved posts.
- Private exports in `/tmp/us-trace-2174.json`, `/tmp/bluesky-2174.json` and
  `/tmp/edition-2174.json`; temporary script removed. No provider calls,
  collection, generation, configuration changes or database writes.

## Free discovery comparison — iteration 2181

`pnpm exec tsx scripts/probe-bluesky.ts --us` compared four free searches
in one 24-hour window ending 2026-11-13T18:44:43.343Z. Each query fetches
at most two pages of 25. No observations were stored, media fetched or AI called.

| Query                    | Fetched | Safety/engagement eligible | Attached videos in eligible pool |
| ------------------------ | ------: | -------------------------: | -------------------------------: |
| Congress                 |      49 |                         49 |                                7 |
| Senate                   |      49 |                         49 |                                6 |
| House of Representatives |      50 |                         49 |                                8 |
| US politics              |      48 |                         48 |                                0 |

The three highest-ranked bounded text examples per query show:

- `Congress`: attributed Jeffries campaign-finance remarks, the already-selected
  Ávila Chevalier election report and Omar commentary. The baseline has concrete
  developments as well as commentary.
- `Senate`: a first-person leadership candidacy announcement, a second post
  reporting the same challenge and a linked Alaska election report. The
  first-person text is a promising provenance lead, but identity was not
  independently verified. The leadership event already appears in selected X
  coverage; higher likes do not make it an additional reader development.
- `House of Representatives`: the same election report as the baseline,
  Ukraine/Starshield foreign-policy coverage and a first-person count of doctors
  entering Congress. This adds scope ambiguity and repeated election coverage.
- `US politics`: a leadership endorsement, political strategy commentary and
  a policy wishlist. The broad phrase does not establish better concrete supply.

Retain `Congress`. `Senate` is worth revisiting if future scheduled pools lack
first-person reporting, but this sample does not justify replacing the baseline
or broadening production. Semantic scope and cross-platform event deduplication
remain necessary. These are live search observations, not a generated edition;
media and linked claims were not checked, and eligibility is not publication approval.

Four exported-result assertions pass: common window, expected query names,
counts bounded by 50, zero submitted/stored posts, false semantic/publication
flags and mode-600 export `/tmp/bluesky-us-2181.jsonl`. `--us --store` refuses
before credentials/network access. Production collection and generation are unchanged.
