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
