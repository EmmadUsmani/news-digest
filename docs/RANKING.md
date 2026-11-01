# Ranking evaluation

`signals-v1` is a preliminary baseline, not an editorial quality claim.
For each enabled topic/window, examine at most the 200 most recent candidates:
- Recency: 0–10, linearly within the exact half-open coverage window.
- Coverage: 8 per additional distinct observed source name. These are source
  observations, not a verified count of independent reporting outlets.
- Hacker News engagement: log2(1 + points), capped at 10.

Exclude betting URLs, odds/best-bets/promo/watch-guide titles, unsafe URLs and
items outside the window. Collapse identical normalized titles, sort by score
then stable item ID, and apply the topic story budget. Different headlines about
the same event are not clustered yet. Show fewer when candidates are absent.
Stored scores/reasons and copied publisher excerpts let selection be inspected.

Live observation, 2026-11-01, last 24 hours: Tech had 24 candidates examined and
5 selected; World 18 and 5. NBA had one excluded betting candidate and Gaming no
in-window candidates. Older incoming articles are still visible separately.
HN's engagement can promote general-interest/off-topic stories (for example a
Patrick Stewart opinion article) into Tech. Source membership alone does not
satisfy topic guidance. Relevance and editorial review are the next priority;
no precision score or labeled evaluation set exists yet. Quiet sports/gaming
coverage also needs wider publishers rather than silently expanding the window.

Offline tests cover window edges, budget zero/limits, exclusions, duplicate
titles, score order/ties and database snapshot immutability. The explicit local
smoke check verifies new versions preserve the earlier stored snapshot.

## Iteration 11: topic phrase screening (signals-v2)

New editions first apply each topic's persisted `relevance_policy`. A candidate
must match at least one `includeAny` phrase when that list is nonempty; any
`excludeAny` match rejects it. Only the headline and first 600 characters of
excerpt count. NFKC normalization, lowercase and punctuation-to-space conversion
give whole-token/phrase matches (AI does not match air). Source names and URLs
are not evidence of relevance. No stemming or semantic inference is performed.

Defaults are seeded in migration 005, not switches on topic names in ranking
code. Empty include lists allow broad coverage (World); a new topic's default
is unrestricted until rules are configured. The read-only topic API exposes the
policy; editing it through the settings UI remains M6. Free-text include/exclude
guidance is still reserved for the future editor, not interpreted by this filter.

Snapshots copy the policy, rejected count and selected stories' matching reason.
Old signals-v1 snapshots are readable and unchanged. Rejection counts cover only
the phrase screen; later low-value/duplicate/budget filters are separate.

Observed live window on 2026-11-01: Tech 24 candidates, 16 phrase rejections,
5 selected; World 19 candidates, 0 phrase rejections, 5 selected. The previously
observed Patrick Stewart general-interest item is no longer selected. The
Portal leak still qualifies via source-code discussion: lexical matches can
admit borderline items. Entity-free headlines can also be incorrectly rejected;
this is not a semantic relevance or importance guarantee.

Fourteen synthetic labeled cases in `relevance.test.ts` all pass against the
actual seeded policies, covering relevant AI/Linux/NBA/Nintendo stories and
off-topic/promotional examples. They are an initial regression set, not live
articles, a representative precision estimate, or the required historical
top-story benchmark. LLM review, event clustering and historical evaluation
remain unfinished.

Iteration 12 coverage observation: Yahoo NBA and Eurogamer fill the previously
quiet 24-hour NBA/Gaming sections (5/3 selected). NBA still includes a monthly
schedule and matchup preview; lexical eligibility plus recency does not equal
editorial importance. Prioritize the bounded editorial pass before calling
these snapshots curated digests. Syndicated Yahoo articles also require
independence-aware clustering before source breadth becomes a strong signal.

## Iteration 13: auditable quality exclusions (signals-v3)

New preliminary editions exclude headline patterns for monthly schedule guides,
matchup previews, open/game discussion threads, shopping guides and the existing
betting/watch-guide exclusions before applying story budgets. Unsupported or
malformed URLs are rejected too. These conservative rules apply across topics;
they do not switch on a topic's name. Each omission after the topic phrase screen
stores its item ID, copied title, stable rule ID and reason in the immutable
snapshot. The home page shows counts and expandable reasons. Topic rejections
and quality rejections are disjoint; duplicate titles and budget truncation are
still separate, so these counts are not a complete selection funnel.

Observed stored-content window on 2026-11-01: NBA 51 candidates, five topic
rejections and seven quality omissions. The Suns monthly schedule and Nets/Pacers
preview disappear from the five selected stories; injury/rotation reporting and
game analysis take their places. Tech/World remain five each; Gaming remains
three. Twenty labeled headline cases include observed examples and synthetic
counterexamples protecting injuries, release announcements and schedule-policy
news. They are offline regressions, not a representative precision estimate.
"Winners & Sinners" still qualifies: these rules cannot establish newsworthiness,
resolve duplicate events or replace semantic editorial judgment.

No app LLM provider/model is configured in the VM env file or application code.
The owner's instruction prohibits switching providers/models/billing, so this
iteration made no LLM calls and did not choose one. A bounded cached editorial
adapter remains pending an explicitly configured permitted gateway model.

## Iteration 14: conservative headline groups (signals-v4)

Eligible, quality-screened articles are scored and sorted as before, then grouped
before spending the topic budget. Every headline in a group must match every
other headline (complete-link), be within 36 elapsed hours, and have identical
numeric tokens. Normalized identical headlines match; otherwise at least four
non-stopword tokens, 80% containment and 65% Jaccard overlap are required.
A small action/negation token guard separates obvious announcement/delay and
confirmation/denial changes. Input order is deterministic by score then ID.
These are lexical groups, not verified event identity: paraphrases can be missed,
unrecognized conflicting verbs can merge, and names shared by different events
can mislead. No embeddings, LLM calls or article-page requests are involved.

The strongest original candidate remains the lead with its original score;
additional articles do not increase it. Copied coverage links and observed source
labels are stored with the snapshot and shown in an expandable section. Source
labels are explicitly not verified independent outlets, especially for Yahoo
syndication or HN linking to a publisher. Historical methods remain readable.
The current 24-hour live selection has no grouped pairs and remains 5 Tech,
5 NBA, 3 Gaming and 5 World stories; no live reduction is claimed. Three offline
cluster tests verify one-slot grouping/link retention, unchanged scores, numeric,
action/date/generic-title separation and resistance to overlap chains. Browser
coverage expansion uses an isolated, unpersisted fixture; screenshots remain live.
Editorial importance and semantic event clustering still require further work.

Iteration 28: Google News query feeds widen candidates without changing scoring.
Google article URLs remain Google redirects; no attempt is made to crawl or
resolve publisher articles. Headlines generally include publisher labels, but
all observations retain the Google News query source name. Neither those labels
nor different query feeds establish independent reporting. The same publisher
article reached by Google and a direct feed may have different canonical URLs;
existing headline clustering can group close matches but cannot guarantee dedup
of rewritten headlines. Editorial quality and verified outlet independence are
still unfinished. The UI describes these results as broad candidates.
