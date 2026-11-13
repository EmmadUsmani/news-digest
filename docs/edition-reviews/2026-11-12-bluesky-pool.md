# Stored Bluesky candidate quality — iteration 2145

Read-only review on November 13 at 12:15 UTC, before the scheduled edition.
`pnpm exec tsx scripts/report-bluesky-coverage.ts --window-end 2026-11-12T15:00:00Z`
uses the previous 24-hour publication window and excludes observations after
that cutoff. The default command also reviewed the rolling window ending
November 13 at 12:15:57 UTC. Neither command collects posts or calls a model.

| Topic     | Nov 12 observations | Safe engaged candidates, capped at 50 | Maximum likes in those candidates | Nov 13 candidates / maximum likes |
| --------- | ------------------: | ------------------------------------: | --------------------------------: | --------------------------------: |
| Tech & AI |                 571 |                                    50 |                             4,486 |                        49 / 7,010 |
| NBA       |                 622 |                                    48 |                               195 |                          46 / 127 |
| Gaming    |                 594 |                                    47 |                             1,003 |                        50 / 3,113 |
| World     |                 614 |                                    29 |                                 5 |                            19 / 7 |
| U.S.      |                   0 |                                     0 |                                 0 |                        50 / 6,820 |

World's weak engagement is already present before semantic triage/editorial
selection. Its three strongest safe examples are a local Canadian missing-person
notice (three likes) and two copies of a generic news bulletin (three/five likes).
This supports investigating discovery/query coverage after the scheduled gate;
it does not support merely relaxing editorial selection or filling more slots.
U.S. now has 417 observations, consistent with the earlier collection repair.

High engagement alone would also produce poor picks: Tech's top examples are
an AI-girlfriend joke and generic anti-AI commentary; Gaming's include political
activation phrased as a “game” and a generic motivational post. Retain semantic
relevance and originality checks when tuning discovery.

The report now includes bounded text examples, configured Bluesky queries and a
historical cutoff. Current enabled-topic policies apply to both windows; this
is not a reconstruction of the historical triage shortlist. Safe candidates
have positive official engagement but have not passed semantic relevance.
Counts are observations rather than distinct posts; none reached the 5,000-row
read cap. No evidence here establishes measured growth or account-relative reach.

Verification: default and historical commands succeed; five malformed, missing,
future or timezone-free CLI cases refuse before reads. Example publication and
observation times respect the historical cutoff and text stays within 600 characters.
No generation, source/query configuration, budget, flag or sharing change.

## Effective discovery queries — iteration 2146

The November 13 configuration has empty explicit Bluesky queries for four
of five topics. The collector uses the first general query, then the first
`includeAny` phrase, then the topic name; it does not search the complete
relevance policy. The report now exposes the effective query and its source.

| Topic     | Effective query         | Fallback source        | Nov 12 distinct stored posts |
| --------- | ----------------------- | ---------------------- | ---------------------------: |
| Tech & AI | `AI`                    | first relevance phrase |                           52 |
| NBA       | `NBA`                   | first relevance phrase |                           54 |
| Gaming    | `game`                  | first relevance phrase |                           51 |
| World     | `World news & politics` | display name           |                           46 |
| U.S.      | `Congress`              | explicit Bluesky query |                            0 |

World currently has neither a positive phrase list nor an explicit Bluesky
query. The resulting display-name search is a concrete discovery
configuration weakness alongside the low-engagement pool. Tech and Gaming
also rely on single ambiguous words, consistent with the off-topic examples.
This identifies what is searched; it does not measure how Bluesky interprets
the query or establish that an alternative will improve results.

Next eligible tuning step: give World an explicit, topic-appropriate discovery
query and compare distinct relevant posts and engagement across normal hourly
collections. Preserve semantic safety and editorial gates. Do this after the
scheduled acceptance gate; no collection or generation configuration changed
in this review, and no manual search or model call ran.

Verification: historical report succeeds; a separate offline invocation of
`collectBlueskyTopics` with current topics and fake search/storage ports matches
all five reported effective queries. Current policies are not historical query
provenance; the U.S. zero is from the pre-repair window.

## Author concentration — iteration 2147

The read-only report now counts distinct authors and posts per author within
its capped safe engaged candidates. Repeated observations do not inflate these
counts: the ranker uses one latest valid snapshot per external post ID.

| Topic     | Nov 12 candidates / authors / largest author | Nov 13 candidates / authors / largest author |
| --------- | -------------------------------------------: | -------------------------------------------: |
| Tech & AI |                                  50 / 44 / 3 |                                  48 / 45 / 3 |
| NBA       |                                  48 / 43 / 3 |                                  46 / 42 / 2 |
| Gaming    |                                  47 / 46 / 2 |                                  50 / 47 / 2 |
| World     |                                  29 / 25 / 2 |                                  19 / 16 / 2 |
| U.S.      |                                    0 / 0 / 0 |                                  50 / 37 / 6 |

November 13 sample: 12:36:39 UTC rolling window. World's weak pool spans many
authors; domination by one author does not explain it. The U.S. sample has
six posts from one author, worth comparing after natural editorial selection.
These counts measure neither relevance nor diversity of events. Keep the
explicit World query as the next tuning action after scheduled acceptance.

Verification: default and historical reports pass; independent JSON checks
reconcile every author count with the candidate total, unique author count and
maximum, including the empty historical U.S. pool. No live provider call or write.

## Bounded free discovery comparison — iteration 2149

At 12:57 UTC November 13, `pnpm exec tsx scripts/probe-bluesky.ts --world`
compared four official authenticated searches over the same preceding 24 hours.
Each retained the existing two-page/50-post bound. No observations were stored,
no edition was generated and no paid model was called.

| Query                   | Returned | Any official engagement | Images / video | Highest likes |
| ----------------------- | -------: | ----------------------: | -------------: | ------------: |
| `World news & politics` |       46 |                      19 |          5 / 0 |             7 |
| `Ukraine`               |       50 |                      50 |        17 / 14 |         5,748 |
| `Gaza`                  |       49 |                      49 |         10 / 3 |         1,589 |
| `geopolitics`           |       50 |                      38 |          8 / 2 |           114 |

Read the three highest-like returned texts for each query. The current fallback
leads with Vancouver housing, U.S. midterm districts and an archival collection.
Ukraine leads with commentary on current peace talks and satellite service;
Gaza includes a hospital-strike claim, context-free commentary and a U.S. primary
story. Geopolitics leads with worldbuilding and generic commentary. These are
post claims, not independently verified news or accepted editorial selections.

Decision: do not replace the fallback with `geopolitics`, or assume a more
general word supplies better news. Specific event terms demonstrably find
engaged relevant material, but one permanent event term would narrow World
coverage. Prepare bounded event-query rotation after the scheduled gate,
preserving the existing aggregate search allowance and semantic scope checks;
measure distinct relevant posts, event diversity and natural editorial picks.
Do not simply add four production searches. All four lexical shortlists were
zero under World's current empty positive-phrase policy; that is not a semantic
rejection or evidence that these posts cannot be selected by the semantic route.

The probe's optional `--world` mode is read-only and refuses combination with
`--store`. Its examples are raw API returns, not safety-ranked or selected posts.
Production queries, schedules, budgets and deployment remain unchanged.

## Saved selection baseline — iteration 2157

Read all four saved Bluesky texts and context lines from GET
`/api/editions/latest` on Nov 13 before the next scheduled edition. Asserted
edition `b1be5a12-2972-4eeb-9bff-82cbb10c1b07` and publication-window
inclusion. No links, images or providers were fetched.

| Topic     | Author                      | Likes / reposts / replies | Reader assessment                                                                                                                                                                                                                                         |
| --------- | --------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tech & AI | livesquawknews.bsky.social  | 242 / 44 / 10             | Concrete WSJ-attributed airline booking restriction; context identifies agent builders as affected. This repeats a selected story rather than supplying a distinct social development.                                                                    |
| NBA       | awfulannouncing.bsky.social | 28 / 2 / 1                | Publisher reports Torre describing Ballmer's threatened lawsuit. This is a media/legal angle, not a game highlight. Empty context adds no unsupported explanation; retain attribution to Torre rather than treating the threat as independently verified. |
| Gaming    | nintendeal.com              | 71 / 13 / 1               | Award list adds several categories and names, but repeats the selected Resident Evil X award event. Four image references are saved; their contents were not inspected.                                                                                   |
| World     | onlyfucts.bsky.social       | 0 / 0 / 1                 | Two publisher links and URL slugs, with no substantive authored account. Empty context avoids expanding unsupported details, but the post is a weak reader selection.                                                                                     |
| U.S.      | No selected post            | —                         | The historical zero-candidate run cannot evaluate the repaired Congress query. Collection recovery alone does not accept its next editorial selection.                                                                                                    |

These are saved metrics snapshots, not current counts or growth measurements.
Positive Tech/Gaming engagement does not resolve repetition; World's reply does
not make its link list a useful account of an event. NBA offers a distinct
format but does not establish that highlight discovery works.

Next natural review should check whether Tech adds information beyond selected
stories, Gaming avoids repeating the X award event, World contains actual text
supporting its context, and U.S. selects relevant domestic material from its
repaired supply. Existing overlap/award/link-list fixes already address the
observed defects; do not add another prompt rule or relax relevance based on
these snapshots. NBA/item 58 and private public-mode activation retain priority.
