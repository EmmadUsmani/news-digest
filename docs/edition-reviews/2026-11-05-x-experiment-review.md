# Nov 5 fresh-window X experiment

Iteration 885 ran the first revised viral-keyword/semantic comparison after
21:00 UTC, on Nov 4 21:00–Nov 5 21:00 UTC. Grok 4.3, configured direct xAI,
unchanged $0.15 reservations and $1/day/$2.50 total admission. Production fixed
search stays off. No failed or unknown cell was retried.

## Cost and raw yield

Five settled calls cost **$0.278606**, with 41 fetched/cited unique candidates.
All 41 returned official oEmbed successfully. Three unresolved $0.15 holds
bring the Nov 5 charged total to **$0.728606**; with historical round 1,
**$1.260937** is charged against $2.50. No settlement exceeded $0.15.

| Topic     | Style    | Settled cost | Fetched/cited | In window | Reported likes |
| --------- | -------- | -----------: | ------------: | --------: | -------------- |
| Tech & AI | Keyword  |    $0.065803 |            10 |        10 | 10 known       |
| Tech & AI | Semantic |    $0.054232 |             8 |         5 | Unknown        |
| NBA       | Semantic |    $0.056684 |             8 |         3 | Unknown        |
| Gaming    | Semantic |    $0.052559 |             8 |         4 | Unknown        |
| World     | Semantic |    $0.049328 |             7 |         4 | Unknown        |

Semantic times above come from post IDs; keyword times were supplied by the
response. The four semantic cells cite 31 posts, with 16 inside the window.
Window counts do not establish usable yield. World has seven citations and
four in-window IDs; its keyword cell remains unresolved, reported separately.

## Dispatch failures

- NBA keyword: HTTP 200; `x_keyword_search` status `failed`, empty array and
  no fetched-post usage. The $0.15 reservation remains charged.
- Gaming keyword: transport deadline at 60 seconds; unknown outcome, $0.15
  retained. No response was saved.
- World keyword: HTTP 200, query/results object with no tool execution and no
  fetched-post usage. The $0.15 reservation remains charged. This is not
  evidence of a successfully executed search returning zero matches.
- Continuations used the runner's existing never-attempted-cell support in
  the same comparison hour, preserving all original requests and holds.

## Observations and next gate

Tech keyword executed Top with OR, exact UTC bounds, saved likes threshold,
required reply/retweet/language filters and `-giveaway`. Its actual tool limit
was 10 despite requesting 16 in the prompt. Ten cited candidates reported
500+ likes (median 1,580, maximum 7,441), all within the supplied window.
Raw visible text includes giveaway solicitations despite the exclusion.
Promotions are judged after scoring under the revised rule.

Tech semantic cited eight posts with no reported likes or publication times;
ID-derived timestamps place five inside the window and three outside. Official
embeds establish existence, not reported engagement or semantic relevance.

The extractor now reconstructs the mandatory `-giveaway` for revised requests
alongside saved per-topic exclusions. Previously it rejected real prepared
inputs because saved exclusions do not themselves contain that code-added
operator. The regression test covers empty and nonempty saved exclusions;
historical styles retain their original exclusions.

Private evidence is in
`~/.local/state/news-digest/x-experiment/2026-11-05T21-00-19-488Z/` (700/600):
original inputs/requests/responses/settlements, current settled-only evidence
and report, official embeds and a read-only baseline/free-link snapshot.
The Nov 5 old production baseline is four calls, $0.143191, 19 citations;
1,000 retained free-link citation rows were captured in the same read-only
snapshot. No old search rerun, experiment ingestion or edition write occurred.

Usable yield remains unknown pending AI relevance, promotion and free-link
review. Missing likes and incomplete keyword coverage remain explicit; no
winner, threshold change, model change or activation. The second fresh round
is due after 21:00 UTC Nov 6; earliest production edition remains Nov 7.
