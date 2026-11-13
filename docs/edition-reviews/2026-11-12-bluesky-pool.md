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
