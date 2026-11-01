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

## Iteration 30: remove unverified observation bonuses (signals-v5)

A single canonical URL can be observed in a publisher feed, Hacker News and
multiple Google News queries. These are discovery paths, not independent
reporters. Previously, each additional label added eight points to that item
before clustering, potentially overpowering the entire ten-point recency range.
New editions score only recency (0–10) plus bounded HN engagement (0–10).
All observation labels and grouped coverage links remain available for audit;
they contribute zero points until outlet independence can be established.
The strongest candidate remains the lead without a cluster bonus. Historical
signals-v1 through v4 snapshots retain their original scores and explanations.

An offline regression reproduces an older article discovered through four
labels outranking fresher reporting under the previous formula. It now preserves
the fresh selection, retains labels, and prevents repeated discovery from
changing the lead in a same-headline cluster. These are synthetic candidates,
not a historical precision benchmark. Authority, independently verified breadth,
semantic importance and editorial review remain unfinished; recency and HN
engagement alone do not establish newsworthiness.

Live stored-content check on 2026-11-01: new v5 editions examined 54 Tech,
52 NBA, 5 Gaming and 47 World candidates and selected 5/5/3/5 stories.
History and immutable snapshots passed the API smoke check; no improvement in
live precision or independent coverage is claimed from unchanged item counts.

## Iteration 31: first recorded-window event benchmark

Run `pnpm evaluate:ranking` for an offline report. The checked-in
`apps/api/test/fixtures/ranking-nba-2026-11-01.json` freezes all 52 candidates
returned by the production candidate query for NBA over
[2026-10-31 20:15 UTC, 2026-11-01 20:15 UTC), with the saved phrase policy,
five-slot budget, source observations, excerpts and engagement. It is recorded
publisher-feed content, never inserted into production by the evaluator or tests.
Article claims were not independently verified; dates are publisher supplied.

Before running the benchmark, the build agent labeled five target events from
the recorded headlines/excerpts: Acuff's reported teenager three-pointer record,
the Lakers ownership dispute, the Edwards/Leonard injury roundup, the Sixers
comeback/Maxey's 38 points and the Spurs win over Minnesota. Each label includes
its rationale and acceptable alternative article IDs. Four negative labels cover
a betting promotion, monthly schedule, matchup preview and open thread. These
are subjective agent labels, not owner judgments or a complete list of the day's
important events. Labels should receive owner review before tuning against them.

The evaluator runs the same phrase screening and rank/quality/cluster functions
as edition generation. An event counts once if any accepted article appears in
a selected story's coverage. It reports missed events, selected headlines,
event recall (found / labeled events) and target slot yield (distinct found
events / selected slots). Target yield is not precision: unlabeled stories may
be important too. Candidate availability is fixed, so this cannot measure missing
source coverage or establish whether reported claims are true.

Signals-v5 baseline: 2/5 events found, 40% event recall and 40% target slot yield;
all four negative labels omitted. Injury coverage and Spurs analysis surface;
the record, ownership dispute and Sixers outcome miss the five slots. More
recent commentary/rotation items displace older target events. This is evidence
of the recency baseline's limits, not evidence that these exact five events are
objectively optimal. No scoring change was fitted to these labels.

`pnpm check` now includes a network/database-free regression requiring at least
the measured 40% recall/yield and zero negative-label selections. It allows
future improvements without freezing exact headlines or score values. Add
independently labeled windows across other days/topics before assessing general
ranking quality; semantic relevance/editorial judgment remain pending.

## Iteration 33: recorded World window and selection diagnostics

The offline command now reports NBA and World separately, without averaging
subjective labels across topics. `ranking-world-2026-11-01.json` freezes all 47
production-query candidates for [2026-10-31 20:20 UTC, 2026-11-01 20:20 UTC),
with the saved World phrase policy (empty include list, four exclusions) and
five-slot budget. It uses
stored BBC, NPR and Guardian observations; it makes no new publisher requests.
Fixtures are offline only and never seed the application.

Before evaluation, the agent labeled five target events: Russian power strikes
in Ukraine, Hormuz negotiations, dismissal of the Alaska election-certification
lawsuit, India's opposition rally over electoral administration, and European
cost-of-living protests. Alternative reports count once per labeled event.
Separate Ukrainian refinery strikes and a separate Alaska ballot-name dispute
do not substitute for the corresponding targets. Two omission labels mark a
celebrity costume and a cruise passenger ordeal as lower priority in this window.
These are agent judgments from headlines/excerpts, not owner labels, verified
claims, or a complete account of important news. Other selected stories may
also be important; target slot yield is not precision.

Signals-v5 finds 1/5 targets (20% recall and target slot yield), with both
omission labels absent. All nine target articles pass phrase screening.
The first selected coverage of European protests ranks 7th, the Alaska decision
9th and Hormuz talks 14th; the India rally is outside the first twenty groups.
The report now includes recorded/phrase-eligible article counts and the first
rank within twenty for each event, for both topic fixtures. A null rank means
absent from that audit horizon, not necessarily rejected. The saved five-slot
budget still controls recall/yield. No production scoring or budgets changed.

The World regression requires at least the observed 20% recall/yield and zero
labeled omissions, alongside NBA's existing 40% floor. This second topic on the
same day widens failure analysis but does not provide temporal diversity or
independent labels. Next add different dates and reviewed labels; editorial
importance remains unresolved rather than treating fresh headlines as sufficient.

## Iteration 37: keep HN question threads out of news slots (signals-v6)

New editions reject titles beginning `Ask HN:` (NFKC/case normalized) only when
the original URL is `news.ycombinator.com/item`. The stable `hn-question` rule
and reason are saved in quality omissions. Questions stay in incoming content;
Show HN launches and reporting at publisher URLs remain eligible. This is a
narrow discussion-format rule, not semantic importance assessment. Exceptional
newsworthy questions can also be omitted; the pending editor will need richer
judgment. Scores, budgets, other quality rules and clustering are unchanged.
Old method versions remain readable and saved snapshots are never recomputed.

A same-window real-content comparison removed “Ask HN: Which TV do you recommend
for privacy?” from a five-story Tech selection, admitting the next eligible
publisher item. The other three topics were byte-for-byte equal; the old v5
snapshot remained identical on reread. A fresh 24h edition examined 54 Tech
candidates with one quality omission and still selected five stories. This
removes an observed discussion-format mismatch, not a general precision claim.
Offline regressions protect launches, publisher coverage, Unicode titles, domain
boundaries and empty sections even with high-engagement questions. NBA and World
historical target recall remain 2/5 and 1/5; editorial selection stays unfinished.

## Iteration 38: recorded Tech window exposes phrase and engagement limits

The offline command now also evaluates `ranking-tech-2026-11-01.json`: all 54
production-query candidates from [2026-10-31 20:35 UTC, 2026-11-01 20:35 UTC),
with the saved Tech phrase policy, five-slot budget, excerpts, media references,
source labels and HN points. No article pages were fetched. The fixture remains
offline and is never seeded into production. Source dates and claims are not
independently verified; even apparently concrete model benchmark claims require
confirmation before publication as facts.

Before evaluation, the build agent labeled five targets: reported Claude
watermarking expansion, Brazilian court prompt-injection sanctions, a claimed
Memdoor multi-model coding result, FBI attribution of the reported Binance
heist, and the Flock camera cancellation controversy. Either recorded Flock
report is accepted for that controversy; this does not prove event identity or
independent corroboration. Six negative labels cover a personal TV question,
celebrity opinion, an agricultural anecdote and three speculative crypto
investment headline variants. These are provisional agent judgments, not owner
labels, a complete important-event list or factual verification. Review them
before using the benchmark to tune selection.

Signals-v6 finds 0/5 targets: zero event recall and target slot yield, with all
six negative labels absent. Four selected stories have an HN observation label;
the fifth is a Google-discovered hospital/OpenAI headline. This does not mean
those stories have no value. The watermarking report ranks 15th; the eligible
Google-discovered prompt-injection report is outside twenty. Its HN alternative
fails phrase screening. All recorded coverage of the model coding result, heist
attribution and Flock dispute fails the saved phrase rules. This separates two
observed problems: lexical false negatives and ranking of eligible candidates.
No production policy, score, budget or provider/model/billing was changed.

All three reports now show per-target article IDs/titles, phrase eligibility and
reason, quality rule (only assessed after phrase eligibility), selection state,
and the existing first rank within twenty. Selected headlines include their
scores and observation labels. A null rank still means outside the audit horizon
or ineligible, not necessarily a quality rejection. The Tech regression checks
complete diagnostic accounting, metric consistency and negative-label omissions;
it deliberately does not claim a useful recall floor for a zero baseline.
NBA/World retain their existing 40%/20% floors. All windows are from one date,
with agent labels; temporal diversity and independent review remain unfinished.
