# November 17 Bluesky: partial-day retention checkpoint

Iteration 2658 preserves the first 20 natural hourly collections, 00:54–19:54
UTC, in the [retained results](2026-11-17-world-bluesky-jobs.json).
All 20 jobs completed successfully; all 100 topic results have positive,
matching fetched/submitted counts. The 20 distinct UTC hours have no gap.
World follows baseline/Ukraine/baseline/Gaza throughout these hours.

| Query                 | Jobs | Fetched/submitted observations | Nov 16, same hours |
| --------------------- | ---: | -----------------------------: | -----------------: |
| AI                    |   20 |                            996 |                981 |
| NBA                   |   20 |                            906 |                948 |
| game                  |   20 |                            992 |                991 |
| World news & politics |   10 |                            483 |                485 |
| Ukraine               |    5 |                            241 |                234 |
| Gaza                  |    5 |                            245 |                250 |
| Congress              |   20 |                            988 |                998 |

These are repeated fetched/submitted observations, not unique or editorially
relevant posts. Collection windows roll over the preceding 24 hours. The
comparison uses only Nov 16 jobs starting before 20:00 UTC, from the
[complete prior-day results](2026-11-16-world-bluesky-jobs.json).
It checks continued collection and rotation; it does not establish a quality
improvement. NBA's smaller count alone does not justify a query change.

Keep queries, cadence and selection gates unchanged. Preserve the remaining
20:54–23:54 UTC results before queue retention expires, merge by job ID, and
then run the fixed-end UTC-day coverage/reader review after midnight. Do not
call this a complete day or compare partial-day unique supply with Nov 16.
The [scheduled edition review](2026-11-17.md) already records natural picks;
this checkpoint does not repeat that acceptance.

Verification: `pnpm exec tsx scripts/report-bluesky-collections.ts`, followed by
assertions on job state, unique hours, five distinct topics per job, positive
matched counts and hour-specific World queries. No collection, search, paid
inference, publication or runtime change occurred.

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
