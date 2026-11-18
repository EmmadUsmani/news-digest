# November 17 Bluesky: complete UTC-day review

Iteration 2674 merges the final retained hour from iteration 2673 with the
previous 23 hours. All 24 natural hourly jobs succeeded, with 120 positive,
matching fetched/submitted topic counts and no missing UTC hour.
[Retained results](2026-11-17-world-bluesky-jobs.json) preserve actual queries.
World follows baseline/Ukraine/baseline/Gaza for all six cycles.

| Query                 | Jobs | Fetched/submitted observations | Nov 16 |
| --------------------- | ---: | -----------------------------: | -----: |
| AI                    |   24 |                           1194 |   1181 |
| NBA                   |   24 |                           1091 |   1131 |
| game                  |   24 |                           1191 |   1190 |
| World news & politics |   12 |                            581 |    582 |
| Ukraine               |    6 |                            291 |    282 |
| Gaza                  |    6 |                            294 |    299 |
| Congress              |   24 |                           1187 |   1194 |

Counts include repeated snapshots and posts published the previous day.
The separate [fixed UTC-day coverage](2026-11-17-bluesky-day-coverage.json)
reads November 17 publications observed before November 18. All five reads
remain below the 5,000-observation limit. Safe candidates use current policies;
these counts do not establish semantic relevance or editorial eligibility.

| Topic     | Observations | Distinct posts | Safe candidates, capped at 50 | Candidate videos | Candidate authors |
| --------- | -----------: | -------------: | ----------------------------: | ---------------: | ----------------: |
| Tech & AI |          405 |             49 |                            48 |                4 |                41 |
| NBA       |          562 |             49 |                            41 |                7 |                33 |
| Gaming    |          594 |             68 |                            50 |                3 |                48 |
| World     |          468 |            149 |                            50 |               12 |                37 |
| U.S.      |          527 |             51 |                            50 |                1 |                35 |

## Full-day saved-text review and decision

Read the five strongest safe texts per topic (25 total), retained with URLs
in the coverage report. No linked article or media was fetched.

- Tech: a dictionary coinage, political joke, employment humor, industrial
  comparison and outage commentary supply no concrete AI launch or demo.
- NBA: Shannon's career-high 34 is concrete reporting. A Maxey dunk caption
  and attributed Luka video offer basketball leads, but the saved text alone
  cannot verify their media. A trade-status link is thin; the Onion's
  simultaneous Nicholson appearances are satire, not NBA reporting.
- Gaming: an unnamed Sunday release and unexplained seasonal image lack
  standalone detail. Blame-game politics, capitalism commentary and GTA/birding
  humor show lexical noise. None establishes a strong reveal or playable demo.
- World: three Kerch attack claims repeat one event; another celebrates it
  without detail. The fifth is Ukraine/U.S. strategy commentary. Preserve
  attribution and event deduplication rather than selecting by likes alone.
- U.S.: Warren's attributed stock-trading claim and Eisen's GAO budget-law
  account add specific leads. Tariff/spending arguments and permitting-bill
  criticism mix commentary with reporting; linked details were not checked.

Against [November 16](2026-11-16-bluesky-day.md), distinct posts change
Tech 52→49, NBA 57→49, Gaming 52→68, World 155→149 and U.S. 54→51.
World candidate videos rise 11→12 within the capped pool. Gaming's larger
supply does not translate into stronger top-five saved texts. Current policies,
news variation and overlapping searches prevent attributing changes to rotation;
observations do not retain the collection query that discovered each post.

Retain queries, rotation, cadence, budgets and gates. Continuous collection is
accepted for November 17; relevance quality remains mixed. Keep U.S. standalone
detail and NBA satire out of automatic quality acceptance. The edition-window
review below covers actual published picks separately. Next: review November 18
natural selections and preserve hourly results before shared retention expires.

Verification: fixed-end read-only coverage command with five examples; asserted
24 distinct UTC hours, 120 positive matched counts, five distinct topics per job,
24-hour windows, exact World rotation and five uncapped coverage reads.
No search, collection, inference, publication or runtime change occurred.

## Scheduled-edition quality — iteration 2666

Read all five published Bluesky texts and the five strongest safe candidates
per topic for the actual edition window, November 16 15:00–November 17 15:00 UTC.
[Retained texts and URLs](2026-11-17-bluesky-edition-quality.json) separate
published picks from engagement-ranked candidates. All five observation reads
are below the 5,000-row limit. This is the edition window, not the UTC-day
comparison still due after midnight. No linked article or media was fetched.

| Published pick                  | Reader value                                                                                                      | Remaining weakness                                                                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NBA: Jack Borman                | TJ Shannon's career-high 34 and season bench-scoring record are concrete and self-contained.                      | No extra explanation needed; already accepted in the NBA review.                                                                                       |
| Gaming: Kerr                    | Names the cross-border game-worker bodies and their generative-AI manifesto demand. Adds an industry development. | Reporting rather than a playable demo, reveal or clip.                                                                                                 |
| World: NOELREPORTS              | Attributes the Volia mission report to RFI and specifies non-combat training and equipment maintenance.           | Treat as an attributed report; attached image is not independent confirmation.                                                                         |
| U.S.: Alt National Park Service | Gives an oversight-intimidation claim and names U.S. Attorney Aaron Reitz.                                        | Does not name the targeted Democrat or supply the letter's contents. The context note repeats the supplied attribution, so the missing detail remains. |
| U.S.: Norm Eisen                | Explains the GAO vacancy, proposed timing and 15-year appointment stakes.                                         | Mixes prediction and opinion with reporting; “My friend Max Stier” points outside the supplied text.                                                   |

### Candidate comparison and decision

- Tech: the top five are cultural jokes, a quoted anti-data-center statement,
  political analogy and outage speculation. None supplies a concrete AI launch
  or demo. Zero published Bluesky picks is preferable to filling a slot with
  these examples. This does not assess all 51 stored distinct posts.
- NBA: the published Shannon item is also the strongest safe example. Other
  top-five texts include a hairline joke, identity commentary, a subscription
  complaint and a Gun+/Ball joke; engagement alone would weaken the section.
- Gaming: top-five candidates include an unnamed upcoming game, birding/GTA
  humor, a Kerch Bridge post using “Game over,” vague game commentary and a
  concrete Epic AI MegaJam result. The last is a plausible alternative, but
  these texts do not establish that it should displace the union development.
- World: the top five are dominated by Kerch claims, reactions and slogans.
  The published mission report adds a separate development rather than another
  bridge post beside the edition's bridge story.
- U.S.: the top five include two tariff/spending arguments, a headline-only
  Supreme Court link, the selected intimidation claim and “Important.”
  The published pair is more specific than the weakest high-engagement options,
  but its missing source detail and commentary keep quality acceptance open.

Retain queries, rotation, budgets and selection gates. The visible weakness is
standalone detail in U.S. picks, not a collection outage or a demonstrated need
to admit higher-engagement candidates. Do not invent the missing name or letter
contents. Compare the complete UTC-day supply after midnight; do not count this
edition-window read as the full-day rotation result.

Verification: `pnpm exec tsx scripts/report-bluesky-coverage.ts --window-end
2026-11-17T15:00:00Z --examples 5`; assertions confirm five published Bluesky
picks, 25 candidate examples, fixed cutoff and five uncapped observation reads.
No collection, inference, publication or runtime change occurred.
