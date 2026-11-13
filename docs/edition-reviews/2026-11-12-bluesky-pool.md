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
