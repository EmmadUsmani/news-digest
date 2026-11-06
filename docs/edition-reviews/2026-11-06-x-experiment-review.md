# Nov 6 fresh-window X experiment

Iteration 1050 ran the second revised round at 21:00–21:05 UTC on the fresh
Nov 5 21:00–Nov 6 21:00 UTC window. Direct configured xAI, Grok 4.3,
required tool choice, 120-second deadline, one failure retry per cell and
unchanged $0.15 reservations / $1 UTC-day / $2.50 lifetime admission applied.
Fixed production search remains off; no experiment ingestion or edition writes.

## Cost and reliability

Ten attempts settled **$0.442837**, fetching 61 unique candidates. Every
candidate passed official oEmbed verification. No new unresolved holds or
settlement above $0.15. Today is charged **$0.490990**, including $0.048153
for the earlier Nov 5 keyword reruns; lifetime is **$1.468639** including
historical unresolved holds, leaving $1.031361 under $2.50.

| Topic     | Style    | Attempts |      Cost | Fetched | In window | Known likes |     Usable |
| --------- | -------- | -------: | --------: | ------: | --------: | ----------: | ---------: |
| Tech & AI | Keyword  |        2 | $0.019286 |       0 |         0 |           0 | 0 (failed) |
| NBA       | Keyword  |        2 | $0.076859 |      10 |        10 |          10 |          3 |
| Gaming    | Keyword  |        1 | $0.067898 |      10 |        10 |          10 |          3 |
| World     | Keyword  |        1 | $0.067264 |      10 |        10 |          10 |          0 |
| Tech & AI | Semantic |        1 | $0.054814 |       8 |         5 |           8 |          0 |
| NBA       | Semantic |        1 | $0.053444 |       8 |         4 |           8 |          0 |
| Gaming    | Semantic |        1 | $0.047440 |       7 |         6 |           7 |          0 |
| World     | Semantic |        1 | $0.055832 |       8 |         3 |           3 |          0 |

Tech's two keyword attempts and NBA's first attempt returned HTTP 200 with
`x_keyword_search` status `failed`, zero fetched posts and token usage.
All settled actual usage. NBA's retry completed with ten posts. The runner
stopped after Tech exhausted its retry; continuation skipped attempted cells
and dispatched only never-attempted cells within the same comparison hour.
No third Tech attempt was made.

Failure rate: **3/10 attempts (30%)**, or **1/8 cells (12.5%)** after allowed
retries. Keyword-only: **3/6 attempts (50%)**, **1/4 cells (25%)** still failed.
Together with iteration 910's three post-fix keyword reruns, keyword attempt
failures are **5/9 (55.6%)**. All four keywords were attempted; Tech coverage
remains absent on Nov 6 because both supported tool calls failed.
The actual keyword tool limit was **10**, despite requesting 16; semantic
requests asked for eight and Gaming returned seven.

## Scorer, engagement and free-link review

Four production Haiku social-triage calls scored all 61 saved candidates,
with zero unscored IDs, costing **$0.005013**, `purpose=verification`, run
`iteration-1050-x-experiment`. Shared app admission applied; repairs disabled.
This Anthropic spend is separate from the X experiment total. Author, saved
visible text, reported likes and media-link hints entered the existing scorer;
media contents were not inspected or inferred.

Usable means in-window, relevance ≥6, interestingness (`importance`) ≥4,
reported likes at least the saved minimum, and absent from retained free links.
Passing the scorer counts as non-promotion under STEERING 39; there is no
separate manual promotion veto. Saved minimums remain Tech/Gaming 500,
NBA 1,000 and World 2,000.

| Topic     | Keyword scorer pass | Free-link matches | Usable IDs                                                    |
| --------- | ------------------: | ----------------: | ------------------------------------------------------------- |
| Tech & AI |           No result |                 0 | None                                                          |
| NBA       |                5/10 |              3/10 | 2118583549775208600, 2118584764320068015, 2118782373676650807 |
| Gaming    |                3/10 |              0/10 | 2118585420367970647, 2118795735005020482, 2118629471230075210 |
| World     |                0/10 |              0/10 | None                                                          |

NBA usable posts include Steph's fan high-five, a Jimmy Butler social post,
and a Lakers record-list post. Gaming includes Digimon launch details, the
Apex/Godzilla event and Stellar Blade's Switch 2 release. Some depend on media;
the saved-text scoring is not a media-content evaluation.

World remains separate: ten popular keyword posts (2,401–31,427 reported likes)
failed the scorer's joint gate. Rationales cite partisan messaging, unsupported
claims, vague posts and no identifiable news event. No World-only rule added.

Semantic search found **zero usable posts keywords missed**. Known likes range
0–18 Tech, 0–32 NBA, 0–49 Gaming and 0–1 World, all below saved minimums.
Five World posts have unknown likes and remain unusable. Only 18/31 semantic
posts are in-window; times came from saved responses or ID-derived timestamps.
No semantic candidate overlaps retained free links or the keyword candidates.

## Baseline and next step

The read-only repeatable-read snapshot at 21:00 UTC captured today's existing
production baseline: five calls, **$0.157475**, 19 unique cited posts; it was
not rerun. Free-link snapshot: 1,188 citation rows, **1,022 distinct post IDs**,
with no SQL LIMIT. Three NBA keyword IDs match; no other candidate does.
Absence describes this retained snapshot, not all historical press coverage.

Both revised rounds are now captured and scored. Next compare the Nov 5/6 old
production discoveries under the same usable-post rule, then apply the plan's
decision and ack it. No winner, threshold adjustment or activation yet. Semantic
usable increment is zero across both rounds (Nov 5 likes were unknown).
Earliest production edition remains Nov 7, subject to that decision and
reporting the incomplete keyword reliability.

Private evidence (700/600) is in
`~/.local/state/news-digest/x-experiment/2026-11-06T21-00-00-000Z/`:
original inputs/requests/responses/settlements, round manifest, settled evidence,
oEmbed results, baseline/free snapshot, scores, verification ledger rows,
joined triaged evidence, offline report and `review-1050.json` with SHA-256
input hashes. Joins use exact topic/post IDs; original artifacts unchanged.

## Baseline comparison and decision — iteration 1051

The saved production citations give **zero usable posts on both days** under
exactly the same minimum-likes rule. No additional scorer calls are needed:
every baseline citation fails a necessary engagement gate, regardless of its
window, relevance or free-link status. Missing likes remain unknown.

| Day   | Topic     | Cited | Unknown likes | Known likes | Usable |
| ----- | --------- | ----: | ------------: | ----------- | -----: |
| Nov 5 | Tech & AI |     5 |             5 | None        |      0 |
| Nov 5 | NBA       |     5 |             5 | None        |      0 |
| Nov 5 | Gaming    |     5 |             4 | 0           |      0 |
| Nov 5 | World     |     4 |             3 | 148         |      0 |
| Nov 6 | Tech & AI |     5 |             5 | None        |      0 |
| Nov 6 | NBA       |     5 |             3 | 0, 2        |      0 |
| Nov 6 | Gaming    |     5 |             2 | 1, 2, 1     |      0 |
| Nov 6 | World     |     4 |             4 | None        |      0 |

There are 38 day/citation observations: **31 unknown likes**, seven known below
minimum. Repeated IDs across days remain separate daily observations. None
matches its day's retained free-link snapshot. Baseline spend totals $0.300666
for nine calls; the old searches were not rerun. Production searched earlier
in each day with its existing date filters; no claim of identical search times
or complete recall is made.

Across both revised rounds, keywords supplied Tech/NBA/Gaming **2/3/4 usable
posts**, nine total; World supplied zero separately. Old search supplied zero.
**Decision: ship keyword search under the approved plan.** It gives more usable
posts, so the owner's rule passes. Semantic contributes zero usable additions
and is dropped from production. Grok 4.3, minimums and caps stay unchanged.

Reliability is poor: post-fix keyword attempts failed 5/9 (55.6%), with three
of seven post-fix topic/day keyword cells still failed after their permitted
rerun/retry. Nov 5 Tech succeeded before the fix and is outside that rate.
These are tool failures, not valid empty results. Production must retain the
single retry and admission checks, report failed cells, and keep free-link
collection available. No third attempts or additional experiment round.

This completes the experiment decision, not rollout or three-edition acceptance.
Next ship the plan's production adapter/limit/admission changes and remove old
open-search/follow-up/reaction paths before enabling outside 13:00–16:00 UTC.
Fixed search remains OFF until that verified deployment; earliest edition Nov 7.
The three consecutive edition checks and screenshots remain open.

Private `baseline-comparison-1051.json` alongside the Nov 6 evidence records
per-topic counts, observed likes and SHA-256 hashes of both original snapshots.
Only saved `reported_engagement.likes` were used; no later metrics, live search,
paid scoring, ingestion or edition changes were performed.
