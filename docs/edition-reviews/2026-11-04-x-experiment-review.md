# Nov 4 X experiment: visible-text review

Iteration 710 reviewed round 1 using the saved responses and official X oEmbed.
**No style or model decision:** the initial review had no social-triage scores; iteration 712 added them below. Gaming
current has an unknown outcome, and a second independent news day is required.
Production fixed A/B scheduling remains off. The initial iteration-710 review
made no paid calls; iteration-712 scoring spend is recorded below.

## Promotion findings

All 47 unique cited IDs returned official oEmbed successfully. Agent review of
visible text found six definite promotions, 26 without an explicit promotion
in the visible text, and 15 unresolved cases. Truncated posts and content whose
meaning depends on media remain unresolved. These are manual promotion labels,
not Haiku social-triage scores, factual checks or overall quality acceptance.

| Topic     | Style     |           Cited | Definite promotions | Unresolved promotions |
| --------- | --------- | --------------: | ------------------: | --------------------: |
| Tech & AI | Current   |               5 |                   1 |                     2 |
| Tech & AI | Trending  |               8 |                   1 |                     4 |
| Tech & AI | Reactions |               1 |                   0 |                     1 |
| NBA       | Current   |               4 |                   1 |                     0 |
| NBA       | Trending  |               8 |                   1 |                     4 |
| NBA       | Reactions |               0 |                   0 |                     0 |
| Gaming    | Current   | Unknown outcome |             Unknown |               Unknown |
| Gaming    | Trending  |               8 |                   2 |                     2 |
| Gaming    | Reactions |               1 |                   0 |                     0 |
| World     | Current   |               4 |                   0 |                     1 |
| World     | Trending  |               8 |                   0 |                     1 |
| World     | Reactions |               0 |                   0 |                     0 |

Definite examples, with the visible evidence supporting each label:

- [Oak](https://x.com/i/status/2117508792179138595): free first month offer.
- [MEXC](https://x.com/i/status/2117519649416102232): USDT giveaway, reply request and trading campaign.
- [Picks community](https://x.com/i/status/2117768747880464810): hockey moneyline betting pick, also off-topic for NBA.
- [Angelo](https://x.com/i/status/2117897136516088028): NBA moneyline betting script and season betting record.
- [MSI](https://x.com/i/status/2118010383374143794): graphics-card giveaway requiring follow, like, repost and comment.
- [Mitch Jones](https://x.com/i/status/2118058414894940193): million-dollar giveaway advertisement.

Both current and trending therefore fail the zero-promotion check on their raw
round-1 candidates. This does not measure the yield after the existing social
triage/editor pipeline. Reactions returned only two citations; its unknown
scores and one unresolved promotion label prevent declaring it the winner.
Trending's higher reported likes alone are insufficient for the decision rule.

## World article input diagnosis

A read-only repeatable-read snapshot reproduced the exact Nov 3–4 21:00 UTC
window using the production article loader, relevance assessment and ranking.
The 200-item pool had 200 eligible items. World's saved `includeAny` was empty;
its exclusions were sponsored, promo code, horoscope and gift guide.

The Guardian US NFL trade article ranked first at 9.94, ahead of Al Jazeera's
midterm headline at 9.93. The next two were Serbia's detained police officers
and UK smart-glasses restrictions, both 9.88. The NFL excerpt also describes
only football. The article was admitted because the source is connected to
World and the relevance policy has no required phrases; recency then won.
There is no semantic relevance judgement in this read-only heuristic path.

The World reaction search consequently included NFL keywords. Its zero results
cannot isolate the quality of reactions to World stories. No owner settings,
thresholds, ranking or production inputs were changed. A future input correction
must use the plan's existing ranking/cached-triage route, without new paid AI
calls, handpicked headlines or new wording rules.

## Reproducible evidence and next gate

Private evidence is beside the original round in
`~/.local/state/news-digest/x-experiment/2026-11-04T21-46-02-565Z/`:
`oembed-review.json`, `promotion-review.json`, `world-article-review.json`,
`reviewed-evidence.json` and `reviewed-report.json` (all mode 600).
The original evidence and admission journal were preserved. The offline report
command in [experiment preparation](../x-search-experiment.md#offline-report)
accepts the reviewed evidence and original `rounds.json` without modification.
The initial reviewed evidence keeps relevance unknown. Iteration 712 saved a separate scored copy below; no complete eligible-post-per-dollar result exists.

Next: the second non-overlapping news day, then threshold calibration and model
comparison within the shared $1/day and $2.50 total experiment admission limits.
The original $0.15 Gaming hold remains charged. Nov 5 scheduled acceptance takes
priority when due; no experiment calls during 13:00–16:00 UTC.

## Saved-candidate social triage (iteration 712)

The existing production `CandidateTriage` social instructions scored all 47
unique cited posts with the configured Haiku model, `claude-haiku-5-5`.
Inputs were the paragraph text from the saved official oEmbed responses and
current saved topic descriptions/guidance. Four live calls cost **$0.003209**,
recorded in the app ledger as `purpose=verification`, run
`iteration-712-x-experiment`. Shared app/reserve admission and the verification
cap applied; repairs were disabled. No X calls or ingestion occurred.

| Topic     | Current relevance ≥6 | Trending relevance ≥6 | Reactions relevance ≥6 |
| --------- | -------------------: | --------------------: | ---------------------: |
| Tech & AI |                  4/5 |                   0/8 |                    1/1 |
| NBA       |                  0/4 |                   2/8 |                    0/0 |
| Gaming    |      Unknown outcome |                   2/8 |                    1/1 |
| World     |                  1/4 |                   2/8 |                    0/0 |
| Total     |                 5/13 |                  6/32 |                    2/2 |

These are relevance scores for supplied visible text, including truncated posts;
media and absent text were not inferred. Relevance alone does not clear promotion,
window, interestingness or final editor acceptance. All original promotion labels
remain unchanged: current has two definite promotions, trending four; reactions
has one unresolved label. Publication time remains unknown for 10 current,
five trending and both reaction posts. No complete eligible yield or winner can
be reported, even though both reaction citations passed relevance.

Private `triage-text-712.json`, `triage-scores-712.json`,
`triage-calls-712.json` and `triage-runner-712.ts` preserve the inputs, scores,
usage/fingerprints and exact runner. `triaged-evidence-712.json` joins scores by
exact topic/post ID; `triaged-report-712.json` is the unchanged offline reporter's
output. All files are mode 600. Original round evidence, reviewed evidence,
manual labels and the X experiment budget journal are unchanged. The Anthropic
verification cost is separate from xAI experiment spend and its retained hold.
