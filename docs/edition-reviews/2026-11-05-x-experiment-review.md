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

## Free-link overlap and visible-text review — iteration 886

Joined every settled candidate by exact post ID against the saved read-only
snapshot: **41 candidates, zero free-link matches**. The snapshot contains
1,000 citation rows for **863 distinct posts**, not 1,000 distinct posts. Its
SQL has no LIMIT and captures all retained `x_link_citations` at
21:02:31.750 UTC, shortly after the experiment window closed. Absence describes
that snapshot, not future collection or a guarantee that the press never
covered a post.

| Topic     | Style    | Candidates | Free matches | Old paid matches |
| --------- | -------- | ---------: | -----------: | ---------------: |
| Tech & AI | Keyword  |         10 |            0 |                0 |
| Tech & AI | Semantic |          8 |            0 |                0 |
| NBA       | Semantic |          8 |            0 |                0 |
| Gaming    | Semantic |          8 |            0 |                1 |
| World     | Semantic |          7 |            0 |                1 |

The old paid baseline has 19 unique citations and also zero free-link matches.
Its Gaming overlap (`2117883840450511051`) is outside the revised window;
its World overlap (`2118163283282989453`) is inside. Tech's eight semantic
candidates share no IDs with its ten keyword candidates. The other topics
have no settled keyword cell, so keyword-missed yield cannot be compared.
No old paid call was rerun.

Read all 41 saved official embeds. Concrete concerns for the later AI review:

- Tech keyword `2118273559038484848` offers $10,000 for likes, comments and
  follows; `2118414128973029573` offers $100 in ZEC for liking/following.
  Both survived the executed `-giveaway` operator. Other candidates include
  product demos and launches; a product announcement alone is not labelled
  a promotion here.
- NBA semantic includes three betting-guide posts from `johnny_lockzzz`,
  plus injury lists and commentary. Visible text does not show a highlights
  shortlist.
- Gaming semantic mixes a publisher roundup, release discussion and
  commentary. World mixes political commentary with three Grok-authored posts;
  World remains separate from the main acceptance target.

Private `overlap-runner-886.py`, `overlap-review-886.json`,
`overlap-evidence-886.json` and `overlap-report-886.json` preserve the exact
ID join, input SHA-256 hashes and reporter output. Original artifacts remain
unchanged. Only free-link labels were resolved; AI relevance/promotion labels
remain unknown, and the 31 semantic likes remain unknown. Thus no usable-yield
number or winner follows from the zero overlap. Next: score saved candidates
with the production social scorer under verification admission, then the
Nov 6 fresh-window round. No paid calls, ingestion or production changes.
