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

## Saved-candidate social triage — iteration 887

Scored all 41 candidates with the configured production Haiku social scorer,
using saved official-embed text and author, reported likes where present, and
media-link hints through `socialTriageCandidate`. Media contents and missing
likes stayed unknown. Current saved topic descriptions/guidance applied.
Four successful calls cost **$0.003782**, ledger `purpose=verification`, run
`iteration-887-x-experiment`; shared app/reserve and verification admission
applied, repairs disabled. No X calls, ingestion or edition writes.

| Topic     | Style    | Relevance ≥6 | In-window relevance ≥6 | In-window relevance ≥6 / interestingness ≥4 |
| --------- | -------- | -----------: | ---------------------: | ------------------------------------------: |
| Tech & AI | Keyword  |         2/10 |                      2 |                                           2 |
| Tech & AI | Semantic |          6/8 |                      4 |                                           1 |
| NBA       | Semantic |          5/8 |                      2 |                                           1 |
| Gaming    | Semantic |          6/8 |                      3 |                                           2 |
| World     | Semantic |          7/7 |                      4 |                                           1 |

The two Tech keyword gate-passers are `2118411960337289583` (consumer voice
launch, scores 6/4) and `2118140532715028495` (hardware embodiment demo, 6/5).
Both have reported 500+ likes and no retained free-link match. The two explicit
giveaways scored 1/0 each. The remaining keyword candidates scored relevance
1–4; several rationales identify promotion, vague hype or networking.

Historical interpretation before STEERING 39 (superseded below): these were scorer gates, not completed usable-yield labels. The production
scorer returns relevance, interestingness and rationale, without a separate
promotion boolean; no boolean was inferred from a score or rationale. Promotion
labels remain unknown. Semantic likes remain unknown for all 31 candidates;
missing keyword cells also prevent an all-topic comparison. No winner or
activation follows; Nov 6 fresh-window round remains next. World is separate.

Private `triage-runner-887.ts`, `triage-scores-887.json`,
`ledger-snapshot-887.ts`, `triage-calls-887.json`, `triaged-evidence-887.json`
and `triaged-report-887.json` preserve inputs, scores, accounting and the
unchanged offline reporter output (mode 600). All original evidence is
unchanged; scores were joined by exact topic/post ID. Assertions checked 41
unique scores, zero unscored IDs, four successful verification ledger rows
and matching total cost. Anthropic cost is separate from X experiment spend.

## Saved-usage settlement — iteration 903

STEERING 39 permits settlement from saved token usage even when fetched-post
counters are absent. Offline reconciliation appended two hash-linked settlements
to the private budget journal; original entries and response files are unchanged.
NBA keyword: 5,186 input/1,560 output tokens, **$0.010383**. World keyword:
1,837 input/1,613 output tokens, **$0.006329**. Both use zero fetched posts and
the experiment runner's existing standard token rates (including cached input).
No search succeeded as a result of this accounting change.

Nov 5 charged total is now **$0.445318**, lifetime **$0.977649**, leaving
**$1.522351** under $2.50. Gaming's two historical no-response timeout holds
remain charged. The private `budget-before-saved-settlement-903.json` preserves
the pre-settlement journal; the journal's new `settlements` records carry each
response SHA-256. No original `.settled.json` was invented or overwritten.

`pnpm exec tsx apps/api/scripts/settle-x-experiment.ts <budget.json>
<request-id.response.json>` reconciles a dispatched, unresolved request from
validated saved usage without making a network call. Repeated settlement is
rejected. A separately admitted single retry remains the next reliability step;
no reruns or production activation occurred in this iteration.

## Authorized keyword reruns — iteration 910 (Nov 6)

Reused the unchanged Nov 4–5 21:00 UTC keyword requests, adding required tool
choice and the 120-second deadline. Each failed cell received one separately
admitted rerun; none received another retry. Direct xAI/Grok 4.3, unchanged
$1/day and $2.50 total caps. Continuations dispatched only unattempted cells.

| Topic  | Tool result | Actual cost | Fetched / cited | Reported likes    |
| ------ | ----------- | ----------: | --------------: | ----------------- |
| NBA    | Failed      |   $0.010803 |           0 / 0 | —                 |
| Gaming | Completed   |   $0.026117 |           3 / 3 | 552, 1,058, 1,063 |
| World  | Failed      |   $0.011233 |           0 / 0 | —                 |

**Failure rate after the fixes: 2/3 (66.7%)**, with two HTTP 200 replies
containing failed `x_keyword_search` calls and no fetched posts. Returned
usage settled at actual cost even without fetched-post counters. Neither reply
contains a provider failure reason. Required tool choice ensures a tool call
is attempted; these observations do not establish reliable execution.

Gaming's tool requested a limit of **3**, despite the unchanged prompt asking
for 16; failed NBA/World traces each requested 10. Gaming copied Top mode,
threshold 500, OR terms, mandatory filters/exclusions and exact UTC bounds.
All three cited posts have supplied in-window times and official oEmbed HTTP
200 responses. Median reported likes: **1,058**; maximum: **1,063**.
Scorer review is next: relevance ≥6 and interestingness ≥4 count as
non-promotion under STEERING 39; no separate manual promotion labels are needed.
No usable-yield or winner claim is made from these raw results.

The reruns cost **$0.048153**, all settled with zero new holds. Lifetime charged
is **$1.025802**, leaving **$1.474198**; historical timeout holds stay charged.
Nov 5 keyword coverage now has completed Tech and Gaming searches, while NBA
and World still failed. The Nov 6 fresh-window round remains due after 21:00
UTC, with keyword cells first. Fixed production search remains off and Nov 7
remains the earliest edition eligible for a decision.

Private evidence: `~/.local/state/news-digest/x-experiment/nov5-keyword-rerun/`
(700/600), including immutable requests/responses/settlements, manifest,
`extracted-evidence-910.json`, `report-910.json` and three official embeds.
Offline extraction now accepts validated token-only failure usage as zero
fetched while retaining historical fetched-only extraction support.

## Gaming rerun scorer review — iteration 912 (Nov 6)

Applied the configured production Haiku social scorer to the three saved,
officially verified Gaming embeds, with author, reported likes and media-link
hints. Current topic guidance, production cache and shared reserve admission
applied; repair disabled. One successful verification call cost **$0.000337**,
run `iteration-912-x-experiment`; zero unscored candidates. No new X searches,
ingestion or edition writes.

| Post ID             | Author       | Reported likes | Relevance / interestingness | Pass |
| ------------------- | ------------ | -------------: | --------------------------- | ---- |
| 2118435188883533910 | RIG Gaming   |          1,058 | 4 / 1                       | No   |
| 2118146287250104534 | MSI Gaming   |          1,063 | 4 / 1                       | No   |
| 2118241331202158609 | Tiny Legends |            552 | 7 / 4                       | Yes  |

The first two are follow/share giveaways. Tiny Legends announces a game launch
with limited detail. The scorer's `importance` field is the interestingness
score. Under STEERING 39, relevance ≥6 and interestingness ≥4 count as
non-promotion: **one usable Gaming keyword candidate out of three fetched**.
All three are in-window and above Gaming's saved 500-like minimum.
Exact-ID comparison against the same retained baseline (863 unique free posts,
iteration 886) found zero matches, including the passing launch. This compares
with that saved baseline, without refreshing historical collection coverage.

STEERING 39 also supersedes the earlier promotion-unknown interpretation:
the two Tech keyword gate-passers above count as non-promotion. Thus completed
Nov 5 keyword searches yielded Tech **2/10** and Gaming **1/3** usable picks;
NBA and World failed, with no usable picks. This is incomplete four-topic
coverage. Semantic candidates still lack reported likes. No winner or activation;
Nov 6 fresh-window comparison after 21:00 UTC remains required.

Private `nov5-keyword-rerun/triage-scores-912.json`, `triage-calls-912.json`
and `triaged-review-912.json` preserve scorer inputs/results, ledger settlement,
exact-ID joins and the baseline hash. Original rerun evidence is unchanged.
