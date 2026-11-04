# Nov 4 X experiment: visible-text review

Iteration 710 reviewed round 1 using the saved responses and official X oEmbed.
**No style or model decision:** social-triage scores remain unavailable, Gaming
current has an unknown outcome, and a second independent news day is required.
Production fixed A/B scheduling remains off. No paid calls were made.

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
All relevance fields remain unknown; no eligible-post-per-dollar result exists.

Next: the second non-overlapping news day, then threshold calibration and model
comparison within the shared $1/day and $2.50 total experiment admission limits.
The original $0.15 Gaming hold remains charged. Nov 5 scheduled acceptance takes
priority when due; no experiment calls during 13:00–16:00 UTC.
