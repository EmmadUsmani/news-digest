# Ranking evaluation

Current grouping state (STEERING 27, iteration 649): publication now has a
bounded AI grouping path, disabled unless `LLM_STORY_GROUPING_ENABLED=1`.
It groups only the existing ten-item semantic shortlist after complete triage,
using the evaluated same-story prompt and the shared Haiku budget ledger.
The recorded sample passed: frozen-label precision 141/141, recall 141/157;
supplemental review found zero clearly unrelated and one borderline pair among
155 merges. This is agent-reviewed sample evidence, not general accuracy.
Nov 4 has been checked; Nov 5 activation and screenshots remain the next step.
Production still keeps articles separate. Wording matchers remain removed;
canonical-URL ingestion dedupe continues.
The iteration sections below record historical experiments and superseded states.

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
numeric tokens in the same order (preserving score and version roles).
Normalized identical headlines match; otherwise at least four
non-stopword tokens, 80% containment and 65% Jaccard overlap are required.
A small action/negation token guard separates obvious announcement/delay and
confirmation/denial changes. For a small set of directed actions (beat, defeat,
acquire and sue), shared meaningful tokens cannot cross from before the verb
to after it; ambiguous multiple actions refuse lexical merging. This protects
participant roles conservatively and can miss paraphrases. Synthetic tests cover
reversed winners, buyers and lawsuit participants, in both input orders. Input order is deterministic by score then ID.
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

Iteration 55 connects semantic triage to publication; the frozen signals-v6
benchmarks above remain baseline measurements, not AI precision estimates.
The live 24h check had 74 Tech, 45 NBA, 22 Gaming and 50 World candidates,
with five Sonnet stories per topic. Spot inspection of the lead story in each
topic found attribution and explicit limits where excerpts lacked details.
Significance lines remain generated interpretation, and this was not an
independent factual audit. Full article text was not fetched. A free-form editor
brief mentioned unselected candidates; published briefs now use selected rewritten
headlines only. An initially incomplete NBA triage produced labeled non-AI
fallback; a later run completed scoring rather than treating partial coverage
as a semantic selection. No measured precision improvement is claimed.

## Iteration 59: first recorded AI selection comparison

Run `pnpm evaluate:editorial` offline. The immutable checked-in inference
artifact `editorial-nba-2026-11-01.json` contains complete Haiku scores, the
exact ten-item production shortlist, Sonnet output, topic guidance, run ID and
actual ledger cost. A SHA-256 binds it to the existing 52-candidate NBA fixture,
including its labels. Neither model received event/omission labels. Selection
uses the same extracted shortlist function as publication; thresholds, tie
ordering, exclusions, clustering and source text bounds are unchanged.
The explicit recorder uses the configured Anthropic provider/models and capped
production ledger, but never inserts fixture content or publishes an edition.
It refuses to overwrite an existing artifact before making calls.

On this window Sonnet selects all five previously labeled target events:
record, ownership dispute, injuries, Sixers comeback and Spurs win. Target
recall and target slot yield are 5/5 (100%), versus signals-v6's 2/5 (40%).
All four omission labels are absent. Six new charged calls (five Haiku, one
Sonnet; other per-item triage results reused cache) cost $0.026394. Replaying
the saved output uses no inference or database. Tests check complete score
accounting, exact shortlist replay, valid unique selected IDs, event metrics
and absence of negative labels. A separate synthetic regression protects
semantic include-phrase recovery and hard quality/exclusion/score thresholds.

This is **not a precision estimate**: the five targets are provisional agent
labels from one date, not independently reviewed exhaustive judgments. The
offline regression does not require perfect target recall for future models.
No scoring was fitted to these labels. No article pages or independent facts
were checked. Source text itself contains potentially questionable claims
(for example the Brown/76ers and Acuff headlines); agreement with feed text
does not establish truth.

A manual excerpt-support audit of all five saved summaries found the concrete
claims in the supplied shortlist headlines/excerpts. The injury summary
explicitly admits missing diagnoses/timelines. However, the ownership, Spurs
and Sixers summaries also draw on other shortlisted articles. Those articles
are not guaranteed to appear in the selected lead's conservative headline
cluster: publication currently retains cluster coverage, not claim citations.
This is a discovered provenance limitation, not verified independent coverage.
Next retain explicit editor evidence IDs/links and test their validation; then
add other topics/dates and independent labels before claiming broad quality.

## Iteration 62: World and Tech editorial replay

`pnpm evaluate:editorial` now reports NBA, World and Tech separately, including
model, actual recorded cost, per-target triage scores, shortlist/selection state
and model-reported evidence inputs. New recordings require unique known evidence
IDs including the lead. The original NBA artifact is preserved as v1 with no
inferred evidence citations. SHA checks bind each recording to its unchanged
candidate/label fixture. Run the explicit paid recorder with `world` or `tech`
after loading the configured environment; it refuses existing outputs before
inference and uses exclusive file creation. Neither recorder nor replay inserts
fixture articles or publishes editions; the replay needs no DB or network.

World: 47 candidates, five selected, 3/5 prior targets (60% target recall/yield)
versus signals' 1/5; both omission labels absent. Ukraine power strikes reached
the shortlist but were not selected. Alaska certification litigation received
relevance 9/importance 7 but missed the ten-item shortlist. Tech: 54 candidates,
five selected, 3/5 targets versus 0/5; all six omission labels absent. Watermarking,
prompt-injection sanctions and the coding-benchmark claim surfaced. The Binance
attribution (relevance 4) and Flock dispute (relevance 3) fell below the semantic
cutoff. These misses expose topic-guidance/selection tradeoffs, not grounds to
fit thresholds to provisional labels.

Both editors used the configured Haiku fallback because Sonnet's remaining
allocation could not cover its conservative reservation. World used seven calls,
$0.005343; Tech three calls, $0.002064 (including reused per-item caches). This
is a hybrid pipeline evaluation with Haiku editing, not a Sonnet comparison.
All labels predate inference and were withheld from prompts. These are still
agent labels from one date: target yield is not precision, source coverage or
factual verification. Independent review, Gaming and later dates remain open.

Manual audit compared all ten summaries with their recorded evidence inputs.
Concrete reported facts were present in supplied titles/excerpts; World combines
three protest reports with retained evidence IDs. Tech explicitly qualifies
three title-only stories and preserves attribution for the sanctions report.
However, the Apple summary says “Apple has not confirmed the feature” without
an explicit statement of non-confirmation in the supplied excerpt. Missing
confirmation in an input does not establish that no confirmation exists. This
is a remaining unsupported negative claim; evidence IDs alone do not ensure
entailment. No article pages or independent facts were checked. Prioritize an
editor factual-support regression/prompt fix and broader reviewed labels before
claiming general editorial quality. Production scoring/prompts are unchanged.

### Iteration 63: targeted absence-claim mitigation

Editor v3 explicitly distinguishes omitted facts from evidence of absence,
permits shorter summaries, and asks for clause review before returning. The
changed instructions invalidate editor caches, retaining valid triage caches
and immutable historical editions. This is prompt guidance, not a semantic
validator or independent fact check.

A separately recorded `editorial-tech-2026-11-01-v3.json` uses the same frozen
54 candidates and production shortlist, with labels withheld. One configured
Haiku fallback call cost $0.001691; no new triage calls. Offline replay retains
3/5 provisional targets and zero labeled omissions. The Apple summary now
attributes code findings to The Verge and the Reddit user, omitting the earlier
“Apple has not confirmed” sentence. A regression preserves this observed case.
All five revised summaries were compared with their bounded evidence inputs.
Remaining concerns: Apple significance says “rather than an announcement” and
its rationale calls findings “unconfirmed”; the benchmark summary says details
“could not be verified” although no verification was performed. Other summaries
include repetitive descriptions of input limitations. These limit the result:
no general factuality or precision improvement is established. Next work should
validate clause support and distinguish editor input limitations from real-world
absence, including significance, rationale and brief text.

Explicit replay command (load secrets without printing them):
`pnpm exec tsx apps/api/scripts/record-editorial-evaluation.ts tech v3`.
It refuses to overwrite the existing artifact before inference. Historical
artifacts remain unchanged; no fixture items or editions were published.

Iteration 64 adds an offline rejection regression for the four remaining v3
Tech caveats (Apple significance/rationale and benchmark summary/rationale).
Editor v4 requires lexical absence sentences to occur verbatim in cited bounded
input; this is conservative validation, not factual entailment. Its explicit
Tech replay returned no validated result after two Haiku calls ($0.003047), so
no v4 artifact, recall measurement or edition was produced. Historical replay
results remain unchanged. Prioritize diagnosing false rejections and useful
repair feedback before claiming quality improvement; see docs/LLM.md for scope.

Iteration 65 supplies a fixed absence-support repair hint rather than only
asking for valid JSON after semantic rejection. The explicit Tech v4 retry
still failed closed after two Haiku attempts ($0.003279), with no artifact or
edition. No quality improvement or false-rejection rate can be inferred from
this failure: responses are deliberately not logged, and the recorder currently
collapses schema and support failures into a generic failure. Add bounded,
application-owned failure categories before further paid replays. Historical
NBA/World/Tech evaluation artifacts and measurements remain unchanged.

### Iteration 67: diagnosed rejection and accepted v4 replay

A bounded replay distinguished initial schema rejection from absence rejection
on repair; rejected text was not retained, so neither the failing field nor an
absence false-rejection rate is known. The editor prompt lacked enforced text
bounds. After making those limits explicit (without changing the guard), a
second replay succeeded after one absence repair. The v4 artifact preserves the
same shortlist and 3/5 provisional targets, with zero labeled omissions. Its five
stories pass offline lexical absence checks across all four story text fields.
No fixture content or evaluation edition was published.

Compared all five accepted summaries against their cited bounded inputs: Apple
preserves code-finding attribution, Anthropic preserves the reported date,
the court story attributes the reported fine and detection, the benchmark
attributes the title-only claim, and the hospital preserves the quoted claim.
The earlier Apple/benchmark absence caveats are gone in these accepted fields.
Significance still extrapolates beyond explicit evidence: the hospital's early
access claim does not establish actual adoption, and a benchmark title alone
does not establish that multi-model systems generally improve results. These
are broader support gaps the lexical guard cannot detect. This is one-date,
agent-audited target recall, not independent factual verification or precision.

### Iteration 68: reproducible factual-support challenge audit

Run `pnpm evaluate:support` offline; no credentials, inference or publication.
The report includes claim text, actual bounded evidence, support labels, reasons
and guard decisions. Ten explicitly synthetic cases cover attribution, scope,
paraphrase, omitted facts, uncertainty and causation. Two significance fields
are loaded directly from the SHA-checked Tech v4 replay with their cited inputs;
no copied claim/evidence pair can silently drift from that artifact.

On these twelve hand-selected, agent-labeled challenges, four claims are
supported and eight unsupported. The unchanged guard rejects two supported
negative paraphrases and accepts six unsupported claims. Accepted gaps include
attribution removal (a ministry claim becomes an established fact through
substring matching), an absence synonym outside the trigger list, invented
causation, rumor promoted to certainty, and both recorded significance
extrapolations (hospital access becomes adoption; one benchmark claim becomes
a broader route to better results). Exact negatives and a positive paraphrase
pass; omitted confirmation and changed-subject negatives are rejected.

These counts describe this challenge set only, not production error rates,
precision, independent review, or an audit of rejected live responses (which
were not retained). No production prompts, cache identities or guard behavior
changed. The support labels and reasons are visible in the report for review;
regression tests check accounting and recorded-evidence linkage without making
known validator weaknesses mandatory forever. Prioritize preserving attribution
at lexical matches, then broader clause support, with these cases as evaluation
inputs. Independent labels, additional dates/topics and full-article retrieval
remain open.

### Iteration 69: preserve whole absence evidence sentences

Absence matching now compares complete normalized source sentences rather than
searching for output substrings inside evidence. This rejects the audit's dropped
ministry attribution and removals of trailing attribution, location or conditional
scope. Exact attributed sentences still pass, including within multi-sentence
excerpts. All four story fields and briefs use the same rule and reserved repair.
The instruction hash changes to prevent reuse of old editor cache identities;
triage caches and historical editions remain intact.

The original twelve offline challenges now have five unsupported acceptances
(previously six) and the same two supported paraphrase rejections. The remaining
synonym, causal, uncertainty and recorded significance gaps persist. These are
hand-selected agent labels, not a production rate. Simple punctuation/newline
splitting can reject valid quotes or abbreviations and cannot resolve cross-sentence
attribution or semantic entailment. No paid replay or published edition validates
this change; broader independently reviewed support evaluation remains next.

### Iteration 70: paired clause-support challenges across topics

`pnpm evaluate:support` now adds eight explicitly synthetic minimal pairs across
Tech & AI, NBA, Gaming and World. Each pair holds evidence fixed and changes a
supported claim into an unsupported one: attribution, uncertainty, causation,
quantity, population scope, planned versus completed events, attribution carried
by a previous sentence, and an invented second clause. The report exposes each
pair's support/rejection decisions, claim, evidence and provisional reason.
Tests enforce shared evidence, opposite labels and four-topic coverage without
requiring current validator weaknesses to persist.

All eight new unsupported claims pass the existing lexical guard. Seven supported
partners pass; the cross-sentence attributed paraphrase fails, while the naked
negative sentence passes because it matches a complete evidence sentence. This
shows why whole-sentence matching alone cannot retain attribution across sentence
boundaries. The expanded 28-case set has 12 supported/16 unsupported labels,
three supported rejections and thirteen unsupported acceptances. These selected,
agent-authored examples are diagnostic challenges, not production rates or an
independently reviewed evaluation. The original twelve-case results are unchanged.

No guard, prompt, model, cache identity or published edition changed. Next:
measure broader support on recorded output fields and independent labels before
choosing a general validation approach; avoid treating a longer lexical trigger
list as a solution to clause entailment. Additional real dates/Gaming windows,
full-article inputs and scheduled batching remain unfinished.

### Iteration 71: complete recorded Tech v4 story-field review

`pnpm evaluate:recorded-support` audits all twenty text fields (headline, summary,
significance and rationale) of the five accepted Tech v4 stories against their
recorded bounded cited inputs. `support-review-tech-v4.json` stores provisional
build-agent labels and reasons, pinned to the inference snapshot and each claim
with SHA-256. The existing replay also checks the candidate fixture hash and
shortlist/citation membership. Missing, duplicate, changed or extra field reviews
fail the audit rather than silently changing its denominator. Reports include
actual claims, cited titles/excerpts/URLs and the current absence-guard decision.

The field-level review labels eleven fields supported, six editorial
interpretations and three unsupported. All three unsupported fields pass the
lexical absence guard: the previously identified benchmark and hospital
significance extrapolations, plus the hospital rationale calling access an
"adoption story." This shows the access-to-adoption extrapolation also recurs in
selection justification. Conditional implications and audience-relevance judgments
are listed as interpretation rather than silently counted as supported facts.
Mixed factual/editorial fields with an unsupported factual clause are unsupported.

These are one agent's judgments on a single accepted historical Tech output, not
independent labels, clause-level truth verification or production rates. Zero
supported rejections here cannot estimate false rejection: selected accepted
outputs exclude rejected attempts, and these fields contain no absence claims.
Briefs and triage output are explicitly outside scope. No source was fetched for
this audit, no inference was purchased, and no edition/guard/prompt/cache changed.
Next: review additional recorded topics and briefs, obtain independent labels,
and evaluate rejected/support-preserving negative claims before expanding a
production support validator. Later-date/Gaming windows remain open.

### Iteration 72: complete recorded World story-field review

`pnpm evaluate:recorded-support` now reports Tech v4 and World separately. The
World review pins all twenty fields and the historical snapshot with SHA-256,
replays the same citation checks, and includes the three-input European protest
story. Ten fields are provisionally supported, five interpretations and five
unsupported. The current guard rejects two historical absence rationales, while
accepting three unsupported fields: shipping-route background not in the cited
input, local-election scope/midterm timing not in the cited BBC input, and a
rationale claiming every source was attributed when the displayed story names
neither publisher. These judgments use only each story's bounded citations;
unsupported background is not a claim that the statement is false in the world.

The historic output predates the current absence guard. Its two rejected
rationales infer unavailable information from short excerpts; this audit does not
republish it or treat rejection as a new runtime failure. Interpretation labels
remain excluded from support/rejection counts. Zero supported rejections in this
selected accepted sample cannot estimate false-rejection rates. No independent
review, inference, source fetching or production validator change is involved.
Briefs remain outside this story-field audit. NBA lacks recorded evidence IDs,
so a citation-based review must not reconstruct historical provenance. Next: retained
briefs/rejected responses where available, independently reviewed negative claims,
and later-date/Gaming evidence rather than invented historical provenance.

### Iteration 87: editorial audit wrap-up (STEERING 5)

The audit is closed for now. Offline commands retain frozen NBA/World/Tech
selection replays, 28 synthetic/recorded support challenges, and complete
twenty-field Tech and World reviews. Labels are provisional agent judgments;
they are neither independent truth verification nor production error rates.
Known gaps include paraphrase rejection, unsupported significance/background,
causation, scope and cross-sentence attribution. Briefs and rejected responses
remain unaudited. No partial code was left to finish. Resume auditing only when
a real digest shows an unsupported summary; social posts now take priority.

## Triage throughput (iteration 155)

Article and social triage use up to 50 candidates per call and four concurrent
calls per scoring invocation. Escaped UTF-8 payloads split earlier to keep
instructions, prompt and framing within a conservative 60 KB bound. Output
reservations scale with batch size and serialized ID size (up to 16,000 tokens). Existing instruction
prompt caching and validated per-item cache keys remain unchanged. A refusal
stops new batches; in-flight calls complete and retain valid scores.

Iteration 427 requests compact JSON, event labels of at most 80 characters and
rationales of at most 100 characters, rather than 160/300. A 50-item UUID batch
reserves 9,964 output tokens instead of 15,000 (33.6% less); this is an admission
ceiling reduction, not measured provider savings or latency. Existing per-item
scores remain reusable: scoring instructions and cache keys are unchanged, and
validation still accepts historical 160/300-character fields. The wire prompt
and response-cache fingerprint change. The authored synthetic publication fixture
was re-fingerprinted offline for the changed prompt; response bodies and the
golden edition are unchanged. No provider responses were re-recorded. Long
escaped IDs retain additional headroom up to the existing 16,000-token ceiling.
The next scheduled run must establish actual output volume, validation success,
cost and duration; the 60-second target remains open.

Offline tests cover overlapping calls, ordering, cache reuse, changed inputs,
invalid outputs, byte bounds and refusal. A synthetic 1,500-item run in sequential
200-item chunks used 30 calls in 217 ms with 20 ms fake latency; cached replay
used zero calls in 15 ms. These are orchestration measurements, not provider
latency or full-edition performance. Async generation and full-edition performance measurement
remain unfinished under STEERING 7.

The Anthropic adapter retries ordinary rejected HTTP 429 requests at most twice,
within the same budget reservation. Backoff defaults to 1s then 2s and honors
Retry-After seconds or HTTP dates, with at most 10s per wait (20s total). Longer
deadlines fail immediately instead of retrying early. Spend-limit responses,
transport errors and other HTTP failures never retry. Offline SDK/HTTP tests
verify bounds, deadlines, successful usage settlement and single-call spend blocks.

Iteration 157 adds a process-wide FIFO limit of four logical Anthropic calls,
shared by all adapter instances, article/social triage and editing. A call retains
its slot during bounded 429 backoff; success and failure both release it. The API
and worker each have their own limit; there is no cross-process coordination.
Offline HTTP tests overlap twelve calls across twelve adapters, assert FIFO start
order and a four-call peak, and verify progress after transport failures. Full-edition timing remains future work.

Iteration 158 runs up to four topics concurrently, overlapping article/social
triage and editing while preserving configured topic order and the single
repeatable-read publication snapshot. The existing process-wide Anthropic cap
still applies. A failed topic stops queued topics and drains in-flight siblings
before rollback/release. Fake publication tests require all four topic editors
to overlap; worker tests cover multiple waves, ordering and failure draining.
No live inference or full-edition latency claim is involved.

### Reddit ranking preparation — iteration 172

A separate, unpublished Reddit shortlist compares each post with at least five
unique stored posts from the same subreddit published in the preceding seven
days and observed before the window starts. It requires score >=10, upvote ratio

> =0.7, and both score and lifetime score/hour >=2× their cohort medians. The
> geometric mean of these two ratios orders candidates; score and ID break ties.
> Lifetime score/hour uses age at collection (one-hour minimum), **not measured
> engagement growth**. Public top-listing samples are biased, so these conservative
> thresholds are provisional and are not a validated estimate of usual reach.
> Sparse or missing historical evidence yields no shortlist, rather than padding.
> Topic/time/exclusion checks still apply. Posts citing X are excluded from this
> shortlist so they can use the existing verified-X pipeline.

The bounded repository read rechecks enabled topics and current community choices,
includes seven days of historical posts, and retains collection timestamps and
citation presence. No inference or network access occurs here. This is not yet
connected to publication: platform-aware immutable contracts, editorial candidates,
X slot preference and faithful cards must land together before publishing Reddit.
Access remains blocked and all ranking evidence in tests is synthetic.

## Platform-aware editorial boundary — iteration 173

The social editorial orchestrator can now preserve typed Reddit candidate metadata
without treating it as a published X post. Callers must first apply the Reddit
historical-strength shortlist. Reddit triage IDs are namespaced; existing X IDs
stay unchanged. The ten-item editor shortlist puts qualifying X candidates first.
About 70% of the post budget is reserved for qualifying X candidates (rounded up,
bounded by their count); declined X choices leave empty slots. With no qualifying
X, strong Reddit candidates may use the full budget. Fallback selection also
preserves X preference. The v2 editor prompt identifies platforms and explicitly
forbids inferring virality or unseen media; its changed prompt invalidates cached
editor responses. Synthetic fake-service tests cover ID overlap, higher-scoring
Reddit pressure, sparse/no X, fallback and no padding. Publication contracts and
rendering remain X-only; no live Reddit or live inference claim is made.

### Reported X engagement shortlist (iteration 274)

Verified X candidates now read the latest topic-bound search report observed no
later than the window end, separately from official post metrics. Preliminary
shortlisting and lexical fallback require their existing scope, time, safety and
relevance gates, then order by a bounded reported-engagement signal, recency and
ID. Duplicate checks run in that order before the post budget is applied.
The weighted count is likes + 2×reposts + replies + 0.01×views. The signal is
min(2, (log10(1 + count) + log10(1 + count / ageHours)) / 4), with age measured
at observation from the verified post time and a one-hour floor. Unknown fields
stay unknown in frozen reasons; they contribute no numeric evidence. Invalid,
future or pre-publication observations supply no bonus. This single-snapshot
lifetime rate is an age proxy, not measured growth or account-relative reach.
Reports remain explicitly unverified and never populate official metrics.
Fallback snapshots use `verified-lexical-engagement-v3`; older editions retain
accepted v2 identifiers. Synthetic golden changes update this method label only;
no LLM recording or live request was made. Fake unit and isolated Postgres tests
cover ranking/gates, missing/zero counts and historical report exclusion.
Iteration 275 combines interestingness with the bounded 0–2 engagement bonus
after the unchanged relevance ≥6 and interestingness ≥4 gates, then breaks ties
by relevance and ID. X preference and the ten-candidate editor limit remain.
The editor still makes final picks from supplied text; no prompt or cache version
changes. Optional `xSearchRanking` freezes the numeric bonus and explicitly
unverified explanation without populating official metrics. AI snapshots use
`verified-semantic-engagement-v3`; historical v2 snapshots remain accepted.
Fake-service tests show high-engagement candidates entering the shortlist while
low-relevance/low-interest candidates remain excluded; no live quality claim.

## Iteration 334: opt-in grouping in ranked story slots

Ranking now accepts an explicit event matcher, retaining the lexical matcher
when omitted. No production caller opts in. This prepares the studio/game
matcher for later activation after the scheduled-run gate and further evidence.
Clustering still runs after quality/window filtering and score ordering, and
before applying the story limit. Merged articles retain their outlet URLs in
coverage; the highest-ranked article supplies the lead and score. Observed
source labels still receive no independence or ranking bonus.

Offline recorded Gaming ranking with the prepared matcher retains all three
Nagoshi closure reports in one story slot. Synthetic regressions also verify
that a merge frees a slot for another event, input order does not change the
scored lead, zero budget selects nothing, and excluded articles cannot become
coverage. These checks verify integration behavior, not general merge quality;
the existing 60-pair benchmark and independent-review limitations still apply.

## Iteration 326: strict event-grouping baseline

Run `pnpm exec tsx scripts/evaluate-event-grouping.ts` offline. It reads 21
explicit pair labels referencing the existing November 1 Tech, NBA and World
recordings, reports pair precision/recall and lists disagreements with titles
and reasons. No network, database, inference or production selection changes.

The agent reviewed these pairs for strict event identity: matching games and
scores, the same lawsuit/allegation, the same rally or the same crash. A broad
controversy and one specific response stay separate, as do separate national
protests, different games and different election disputes. Existing ranking
event labels are broader editorial coverage labels and are not reused as
strict merge truth. Syndicated identical headlines may match without proving
independent reporting. Labels describe the recorded reports, not verified facts.

The current lexical matcher merges **1 of 11** same-event pairs and **0 of 10**
different-event pairs: precision 1/1 (100%), recall 1/11 (9.1%). The sole match
is a syndicated investment headline; it provides little evidence about safe
paraphrase merging. The ten missed matches include NBA scores, alternate team
names and cross-outlet paraphrases. This small, deliberately selected,
agent-labeled single-date set is a development baseline, not an independent or
general quality estimate. Gaming, other dates, larger negative sets and
independent review remain gaps. The test prevents false merges on these pairs
while the report makes missed paraphrases visible. Any production grouping or
ranking change remains gated off under STEERING 23 until scheduled evidence is
recorded and acknowledged.

## Iteration 327: opt-in NBA score grouping

`pnpm exec tsx scripts/evaluate-event-grouping.ts --game-scores` evaluates the
prepared matcher against the same recorded labels. It merges **4/11** positive
pairs with **0/10** false merges (observed precision 4/4, recall 36.4%). Three
additional matches are game recaps naming both teams and the complete score,
including Cavs/Cavaliers and Wolves/Timberwolves aliases. This remains a small,
agent-labeled development sample, not a general precision claim.

The matcher requires two unambiguous NBA teams, a single plausible score and
at most 18 hours between reports; it preserves score attribution to each team.
Previews, predictions, multi-score reports, missing scores, conflicting outcomes
and invalid timestamps cannot use this extra rule. Conservative misses remain:
reports naming only a city, scoreless highlights and non-sports paraphrases.
Synthetic adversarial tests supplement the recorded pairs. The existing lexical
matcher remains the default; only an explicit matcher argument enables the
prepared grouping, and no production caller supplies it. No ranking bonus or
claim of outlet independence was added. More dates, Gaming and independent
negative review remain necessary before broader activation under STEERING 23.

## Iteration 328: conservative score attribution

The opt-in matcher now canonicalizes explicit team-score pairs, including
loser-first recaps, before considering lexical similarity. Conflicting explicit
outcomes and the 18-hour bound cannot be bypassed by overlapping words or sorted
numbers. Bare scores require a clear winning action; loss-first and ambiguous
matchup wording are rejected rather than guessing which team owns each score.
Synthetic regression cases cover both argument orders and reversed outcomes.
The recorded benchmark remains 4/11 positives and 0/10 false merges; these
regressions are synthetic, not additional real-world precision evidence.
Production still uses the original lexical matcher.

## Iteration 329: second-date and Gaming event evidence

The offline command now evaluates **55 pairs** from November 1 and 2 across
five recorded topic windows. Two new selected snapshots contain stored NBA and
Gaming publisher-feed items from November 2 UTC, read without changing live
data or fetching publisher pages. Headlines, URLs, source labels and timestamps
are retained; excerpts are capped at 600 characters. Each added pair has an
explicit agent-reviewed reason. This is development evidence, not independent
fact verification or a representative precision estimate.

The lexical baseline merges **4/27** positive pairs with **0/28** false merges
(observed precision 4/4, recall 14.8%). The opt-in game matcher merges **7/27**
with **0/28** false merges (precision 7/7, recall 25.9%). The three additional
matches in the new NBA window are also matched by the lexical baseline; the
new scoreless game recaps remain misses. Syndicated reports contribute positive
matches and do not establish independent reporting. Gaming contributes eight
positive pairs and twelve negatives; neither matcher finds any Gaming positive.

New negatives distinguish weekly awards for different players, current versus
retrospective events, separate game announcements sharing publisher templates,
different developments from one Zelda interview, AI upload reports on different
stores, and separate guides for one game. Per-window counts appear in the report.
Regression tests cover all negative labels and both argument orders for the
opt-in matcher. Conservative paraphrase recall and independent review remain
open. Production grouping and ranking behavior are unchanged and gated under
STEERING 23.

## Iteration 330: full-window cluster membership

The offline evaluator now runs complete-link clustering over every recorded
candidate in each window, rather than reporting only isolated pair decisions.
It counts all within-cluster pairs, labeled correct/incorrect merges, missed
positive pairs and unlabelled merges. Unlabelled pairs include IDs and titles
for review and never count toward labeled precision. Reversing candidate order
also reports membership differences; this is one order probe, not a proof of
order independence for every permutation or future window.

With `--game-scores`, the five windows yield ten merged pairs: seven labeled
positives and **three unreviewed pairs**, with no labeled negative merges.
Forward and reverse membership agree in these windows. Thus the earlier 7/7
pairwise precision claim does not establish correctness of all actual merges.
Gaming still has no merges. Synthetic tests demonstrate overlapping A–B/B–C
matches with a negative A–C label, order-sensitive complete-link assignment,
and explicit unknown/incorrect merge accounting. These tests do not add real
precision evidence. Production grouping and ranking remain unchanged.

## Iteration 331: review all observed cluster merges

Reviewed the three previously unlabelled pairs using the stored headlines,
excerpts and timestamps, without fetching publishers. The NBA pair describes
the same Spurs–Timberwolves Halloween game, with identical winner and 121–111
score. The two Tech pairs share a distinctive investment-column headline and
excerpt within one hour, differing by publisher suffix. They are positive
**content deduplication** labels, not evidence of a discrete news event,
independent reporting, original attribution or investment relevance.

The selected set now has **58 pairs: 30 positive and 28 negative**. Lexical
matching finds 6/30 positives; opt-in game matching finds 10/30, both with
0/28 false merges. All ten full-window opt-in merges now have positive labels,
with no unknown or negative merges in either input direction. This closes the
observed label gap, not the general precision question: labels remain agent
reviewed, Gaming still has no merges, and outlet independence needs separate
verification. No matcher, production grouping or ranking behavior changed.

## Iteration 332: opt-in studio closure identity

The offline `--studio-closures` evaluator adds a deliberately narrow rule:
matching single-word proper studio names directly followed by an explicit
closure assertion in the title or feed excerpt, within 36 hours. Negation,
rumors, modal uncertainty, reopening language, multiple studio identities and
multiword-name suffix collisions reject the identity. Funding loss or game
cancellation alone does not establish a studio closure. The rule composes
with the prepared NBA matcher; production has no caller.

Two additional agent-reviewed pairs connect the recorded Eurogamer and Game
Developer Nagoshi closure reports to GameSpot's explicit studio-closure
headline. Game cancellation remains qualified in that headline; the label
concerns the studio closure only. No publisher fetch or independent review.
The selected set is now **60 pairs: 32 positive, 28 negative**. Lexical matching
finds 6/32, game-only 10/32, studio/game 13/32; all have zero labeled false
merges. Gaming improves from 0/10 to 3/10 positives. All 13 full-window merged
pairs have positive labels and reverse-input membership agrees. This modest
recall gain is specific to the selected examples; it does not establish
general precision, arbitrary-order stability or independent outlet coverage.

## Iteration 333: reject uncertain and historical studio closures

The unused studio matcher now rejects questions, conditional and attributed
uncertainty, prospective language, and historical closure references. Explicit
years immediately following a closure assertion are conservatively rejected:
publication time alone cannot establish when the closure happened. A founding
year in a separate excerpt does not invalidate a current closure headline.
These guards apply to named-studio candidates, preserving unrelated game and
lexical comparisons. Rejected claims cannot fall through to lexical matching,
even when the two uncertain headlines are identical.

Synthetic adversarial cases cover these boundaries and symmetry. The recorded
benchmark remains 13/32 positive matches and zero labeled false merges, with
all observed cluster merges labeled. These tests add safety examples, not
independent or general precision evidence. Production remains unchanged.

## Iteration 335: gated edition caller

`EDITION_EVENT_GROUPING_ENABLED=1` selects the prepared studio/game matcher
for both fallback ranking and the semantic editorial shortlist. Every other
value retains lexical matching; the switch is unset in production pending
Nov 3 scheduled evidence and acknowledgements. The matcher is captured once
per edition so both paths agree. Semantic eligibility and the ten-candidate
shortlist remain unchanged; grouped coverage never admits unscored or rejected
items. This does not broaden label evidence, establish outlet independence or
activate the feature. Tests pin exact opt-in, baseline equivalence and coverage
exclusion for semantically rejected/unscored items.

## Iteration 336: persisted opt-in grouping

Disposable-database publication tests seed the three recorded Nagoshi closure
reports and generate editions with the flag unset, enabled, then unset again.
Both fallback and synthetic semantic-editor paths preserve all three coverage
links in one grouped story, retain the lead and score, and restore the baseline
when disabled. Reading every saved edition after the flag changes returns its
original snapshot. These tests use no live providers and do not establish
outlet independence or broaden the reviewed event labels. Production remains off.

## Iteration 337: refuse uncertain game grouping before lexical fallback

The opt-in NBA matcher now rejects previews, predictions, conditional/negative
claims and historical wording when two teams are named, even if both titles
are identical. Previously those rejected score identities returned to lexical
matching, which could group them as a current game. Synthetic regressions
exercise seven such pairs, symmetric matching and separate story slots; an
unrelated developer-tools preview still follows lexical matching. This does
not extend the recorded benchmark or provide independent event labels.
Production remains on the unchanged lexical matcher pending the scheduled-run
gate and broader evidence.

## Iteration 338: keep ambiguous score claims out of lexical fallback

The opt-in matcher now refuses two-team headlines with multiple score pairs,
implausible or tied scores, or an outcome that cannot be assigned to a winner.
Previously these returned to lexical matching, so identical ambiguous recaps
could share a story slot. Seven synthetic cases now keep separate slots in
both argument orders; scoreless coverage retains lexical matching. The recorded
benchmark remains unchanged. This is a conservative guard, not new independent
quality evidence; production event grouping remains off.

## Iteration 339: retain complete multiword studio identities

The default-off matcher now recognizes multiword proper studio names directly
followed by closure assertions, retaining the full name instead of rejecting
it or matching only its last word. Sentence connectives `As` and `The` retain
the existing behavior. Synthetic tests cover matching headlines/excerpts,
suffix collisions, different prefixes, singular/plural names, multiple
closures and existing historical/uncertainty guards. The recorded benchmark
remains 13/32 positive pairs, zero labeled false merges; this adds no independent
labels or measured real-world recall gain. Production grouping stays off.

## Iteration 340: explicit studio closure paraphrases

The default-off matcher also recognizes a named studio that “ceases operations”
or “closes/shuts its doors,” including completed assertions. It keeps the same
full-identity and 36-hour checks. Temporary closures and closed alpha/beta,
playtest, application or submission announcements refuse lexical fallback;
these assertions do not establish that the company closed. Synthetic pairs
cover title/excerpt paraphrases, symmetry, distinct studios, historical and
uncertain assertions, and identical non-closure headlines. The recorded
benchmark remains 13/32 positives with zero labeled false merges; this adds no
independent labels or measured real-world recall claim. Production stays off.

## Iteration 341: ongoing shutdown assertions

The opt-in studio matcher recognizes “is shutting down,” “is ceasing
operations,” and “is closing its doors,” retaining the same identity and
36-hour checks. Office, division, server, website, store and test closures
refuse lexical fallback: closing a part of a company does not establish that
the company closed. Synthetic tests check symmetry, excerpt assertions,
negation, uncertainty and history. The recorded benchmark remains 13/32
positives and zero labeled false merges; independent evidence is still open.
Production grouping stays off pending the scheduled-run gate.

Iteration 342 also rejects historical qualifiers before a closure assertion
in the same excerpt sentence (for example, “In 2020, Copper Studio shut
down”). A date in a separate founding sentence does not date the closure.
Synthetic regressions cover symmetry and identical historical excerpts; the
recorded benchmark and production gate are unchanged.

## Iteration 434: grouping input-order review

`pnpm exec tsx scripts/evaluate-event-grouping.ts --studio-closures` now
reports `permutationCheck` for each recorded window. It checks every permutation
for sets of at most six candidates; larger windows use the original order,
its reverse and 32 deterministic shuffles from canonical candidate-ID order.
The report distinguishes sampled checks from exhaustive ones and records pair
membership changes, worst labeled false/unknown merges and the range of matched
positive pairs. Pure directional matcher comparisons are reused across orders.

A synthetic four-item case demonstrates why reversal alone is insufficient:
forward and reverse both merge A–C and B–D, while another order merges B–C,
a labeled negative. The exhaustive check exposes this failure. Unknown merges
remain unknown rather than contributing to precision.

All five recorded windows retain stable membership over the 34 checked orders,
with zero labeled false merges or unknown merged pairs. The studio/game matcher
still finds 13/32 positive pairs and rejects all 28 labeled negatives. This is
bounded order testing on the existing agent-labeled dataset, not independent
review, improved recall or proof of stability for every possible input order.
Production matching and the grouping activation setting are unchanged.

## Iteration 449: past-tense NBA victories

The opt-in game-score matcher accepts an active “Cavs defeated the Bucks
136–111” result alongside the equivalent explicit team-score report. Passive
“defeated by” claims remain ineligible, including intervening overtime wording;
reversed winners, reversed scores, historical and uncertain claims stay separate.
Synthetic tests cover both input orders and final cluster membership. The
recorded evaluation remains 13/32 positive pairs for the combined studio/game
matcher, with zero labeled false merges; this change adds synthetic paraphrase
coverage, not a measured gain on real reports. Production activation and
independent review remain open.

## Iteration 450: third-date Gaming recall check

A read-only snapshot adds 23 stored publisher-feed candidates from November 3
and 26 agent-reviewed headline/excerpt pairs: 13 same-event, 13 distinct-event.
The positive pairs cover the GTA 6 preload announcement, the official Elder
Scrolls VI: Sentinel title/trailer reveal, and Aonuma's Water Temple revisions.
Negative pairs distinguish preload news from presale revenue and prospective
PlayStation details, title reveals from development-timeline reports, and Water
Temple changes from auto-jump design. No article pages or providers were called.

All three matchers miss all 13 new positive pairs, while rejecting all 13
negatives. The full benchmark is now 86 pairs: 45 positive and 41 negative.
Lexical matching finds 6/45, game-only 10/45, combined studio/game 13/45, with
zero labeled false merges. This exposes a substantial Gaming recall gap; the
previous 13/32 result applied only to the earlier selected windows. No unknown
full-window merges or input-order variation appeared in the new 23-candidate
snapshot across 34 deterministic orders. These labels remain agent-reviewed
and selected, with no independent quality or outlet-independence claim.
Production behavior and grouping activation are unchanged.

## Iteration 451: conservative preload overview grouping

The opt-in matcher now groups headlines that start with the same explicit game
name followed by preload dates/times. Hyphenation is normalized; no franchise
aliases or inferred names are used. Questions, uncertain/historical reports,
schedule changes, secondary announcements, concrete numbers after the game name
(except PS4/PS5), conflicting explicit platforms and invalid/out-of-window times
are excluded from this rule. Existing lexical fallback is unchanged.

Three Nov 3 GTA 6 schedule overviews now group. Reviewed the two previously
unlabeled within-cluster pairs and added positive labels based on the stored
headlines/excerpts. Across 88 pairs (47 positive/41 negative), lexical remains
6/47, game-only 10/47 and combined opt-in matching improves to 16/47, with zero
labeled false merges. All six windows have zero unknown/false cluster merges
and no membership variation across 34 deterministic orders. These agent labels
are not independent validation; grouping remains disabled in production. Alias,
explicit-date and broader Gaming paraphrase recall remain unfinished.

## Iteration 452: explicit preload hardware variants

The opt-in preload rule now distinguishes PS5 Pro, Xbox One, Xbox Series X/S
and Switch 2 from their other hardware variants. PlayStation 4/5 spellings
normalize to PS4/5, repeated mentions are deduplicated, and platform sets are
compared regardless of order. Conflicting explicit sets stay separate; an
unspecified platform still supplies no evidence of a conflict. Synthetic pairs
exercise both argument orders. Recorded results remain 16/47 positive pairs,
zero/41 false merges; this guard adds no real-report recall evidence.
Production grouping remains disabled.

## Iteration 453: explicit game-title reveals

The opt-in matcher recognizes sequel/subtitle headlines explicitly announcing an
official name or title reveal, including Roman/Arabic sequel numerals. It requires
the full game identity, a 36-hour publication bound and unqualified announcement
language. Generic trailers, release-date news, different subtitles/sequels and
uncertain or historical headlines do not qualify under this rule. Production
grouping remains disabled.

Three recorded Sentinel title announcements now group. Reviewed the previously
unlabeled trailer/title-reveal pair as positive using stored headlines/excerpts.
The benchmark now has 89 pairs (48 positive/41 negative): lexical 6/48, game-only
10/48, combined opt-in 19/48, with zero labeled false merges. All six windows have
zero unknown merges or membership variation across 34 deterministic orders each.
These agent-reviewed labels are not independent validation; the narrow supported
headline forms still miss broader paraphrases and do not establish outlet independence.

## Iteration 455: successor framing in title reveals

The opt-in title-reveal matcher also accepts “successor finally re-revealed as”
headlines when they name the complete sequel and subtitle. Existing uncertainty,
historical language and time guards still apply. Different sequel/subtitle names
and release-date announcements stay separate. Production grouping stays disabled.

The stored Push Square Sentinel headline/excerpt describes the same official title
announcement as the three previously matched stories. Two newly reviewed positive
pairs complete its labels; these are agent judgments, not independent validation.
The 91-pair benchmark now has 50 positives and 41 negatives: lexical 6/50, game-only
10/50, combined opt-in 22/50, zero labeled false merges. All six windows retain zero
unknown merges and no membership variation across 34 deterministic orders each.

## Iteration 456: publisher confirmation of a full game title

The opt-in title-reveal matcher accepts “Publisher officially confirms [full
sequel: subtitle] as its next game”. It retains the complete game identity,
uncertainty/history exclusions and 36-hour bound. Different sequels, subtitles,
release-date announcements and expansions stay separate. Production stays off.

The recorded Insider Gaming headline and excerpt explicitly confirm the same
Sentinel title as the four matched announcements. Four added agent-reviewed
positive pairs complete the five-story cluster; these labels are not independent
verification. The 95-pair benchmark has 54 positives and 41 negatives: lexical
6/54, game-only 10/54, combined opt-in 26/54, zero labeled false merges. All
windows retain zero unknown merges and no variation across 34 orders each.

## Iteration 457: title identity from an explicit excerpt

The opt-in matcher now accepts “Game N finally has an official title” when
its excerpt contains exactly one explicit “the next game in the series is
titled [full sequel: subtitle]” assertion. Franchise and sequel must match
the headline; numeral normalization, uncertainty/history exclusions and the
36-hour bound apply. Missing, conflicting or different identities stay separate.
Production grouping remains disabled.

The recorded Nintendo Life excerpt explicitly names The Elder Scrolls VI:
Sentinel, joining the five matched reveals. Two of its five positive pairs
were already labeled; three added agent-reviewed labels complete the cluster.
The 98-pair benchmark has 57 positives and 41 negatives: lexical 6/57,
game-only 10/57, combined opt-in 31/57, zero labeled false merges. All windows
retain zero unknown merges and no variation across 34 orders each. These labels
are not independent validation or a general quality estimate.

## Iteration 458: qualifiers after excerpt naming assertions

The opt-in title-reveal matcher now checks uncertainty and historical qualifiers
after the asserted name within the same sentence, including parentheses. This
prevents an excerpt dated “in 2020” or qualified “according to a rumor” from
establishing a current title reveal. Separate background sentences and “the
previously reported name” remain accepted. Synthetic bidirectional guards pass;
the recorded benchmark stays 31/57 positive pairs and 0/41 false merges. These
agent-reviewed labels are not independent validation. Production remains off.

## Iteration 459: explicit dated preload starts

The opt-in preload matcher recognizes a named sequel followed by an explicit
pre-load/pre-download start date. Roman/Arabic sequel numbers and month/day
order normalize to the same identity. The recorded PlayStation Blog and
Eurogamer November 10 announcements now match. Schedule changes, uncertainty,
different games/dates, invalid calendar days and undated overviews stay outside
this rule; existing platform and 36-hour limits still apply. Dates without a
year use the publication's UTC year; explicit years are not supported.

The existing 98 agent-reviewed pairs now yield 32/57 positives with zero/41
false merges, no unknown merged pairs and no membership variation across the
bounded input orders. These labels are not independent validation. Production
grouping remains disabled; no provider calls were made.

## Iteration 460: revised preload schedules

The opt-in matcher distinguishes an earlier revised preload from the original
start announcement. It requires the same explicitly named numbered game, new
calendar date and install size, plus a moved-up/earlier assertion on both sides.
A publisher confirmation may supply its new start from an excerpt only when
the excerpt directly names the same game. Uncertainty, history, conflicting
size/date/game, invalid dates, explicit years and the 36-hour bound remain
guarded. Original starts and undated overviews do not join revised schedules.
The current phrase patterns are deliberately narrow and do not infer aliases.

This recovers the existing GamesRadar+/GamingBolt revised GTA 6 schedule pair:
33/57 recorded positive pairs, zero/41 false merges, no unknown cluster pairs
or membership variation across the sampled orders. Labels remain agent-reviewed,
not independent validation. Production grouping stays disabled. No paid calls.

## Iteration 461: relative future studio closures

The opt-in studio matcher rejects closure assertions qualified by “tomorrow”
or “next week/month/year”, before the named assertion in its sentence or
within the existing bounded suffix. These dates cannot establish a current
shutdown, including in excerpts or identical-headline lexical fallback.
Separate sentences about future games or staff meetings remain accepted.
Bidirectional synthetic guards pass. The recorded benchmark remains 33/57
positives with zero/41 false merges; agent labels are not independent
validation. Production grouping remains disabled.

## Iteration 462: rejected remake fast-travel experiments

The default-off matcher joins explicit reports about the same remake's
abandoned fast-travel experiment. It requires a complete game identity and
rejection wording, retaining subtitles and sequel numbers. The established
“The Legend of Zelda”/“Zelda” alias is normalized. Shipped features, other
mechanics, uncertainty, historical reports and vague quality-of-life headlines
are excluded; publication times must be valid and within 36 hours.

This recovers the recorded Eurogamer/Kotaku Ocarina of Time pair, while leaving
the GamesRadar+ vague-feature headline separate: its recorded excerpt does not
identify fast travel. The benchmark reaches 34/57 positives, zero/41 false
merges, no unknown merged pairs or sampled membership variation. These are
agent-reviewed labels, not independent validation. Production remains disabled.

## Iteration 463: explicit Water Temple remake adjustments

The default-off matcher joins the recorded GamesRadar+/Kotaku reports about
fixing Ocarina of Time's Water Temple in the remake. It requires the full game
identity, the specific dungeon and adjustment assertion, and explicit excerpt
evidence of the remake or quoted rationale. Other dungeons/games, uncertainty,
historical titles, missing evidence and invalid/out-of-window times stay separate.
The benchmark reaches 35/57 positives and zero/41 false merges, with no unknown
cluster pairs or sampled membership variation. Labels remain agent-reviewed,
not independent validation. Production grouping stays disabled.

## Iteration 467: wording grouping removed (STEERING 26)

This supersedes the historical grouping experiments above. All wording-based
event matchers and their opt-in flag have been removed. Production ranking and
the AI shortlist now keep every article separate, including identical headlines.
Ingestion still deduplicates canonical URLs. Generic complete-link plumbing,
coverage links and all recorded pair labels remain; past editions are immutable.

`pnpm exec tsx scripts/evaluate-event-grouping.ts` now measures the disabled
baseline: no predicted merges, null precision and zero recall. Rule-specific CLI
options no longer exist. These results are not an AI grouping evaluation. The
next step is a ledger/cache-backed Haiku pass, validated and evaluated before
activation under STEERING 26's cost and precision gates.

## Iteration 468: AI grouping component, inactive

`EventGrouping` accepts one topic's ranked shortlist (2–40 articles), with
identity, title, outlet, time and a bounded excerpt. It asks the configured
Haiku model for same-event ID groups, prioritizing precision and omitting
singletons. Known, unique IDs and topic-isolated inputs are mandatory; invalid
answers discard the entire result. Budget refusal/provider failures also keep
articles separate. The existing ledger and request cache handle reservations,
actual usage and reuse; repairs are disabled for this operation so invalid
output cannot cause a second paid call. Other editorial operations retain
repair behavior.

This component has no production caller and no effect on editions or ranking.
Fake-provider tests establish validation, accounting and cache behavior only.
Approved shared-link/X hints were added in iteration 469; evaluation tooling
and the capped labelled-day quality evaluation remain unfinished. No live quality, cost or latency claim is
made; activation still requires STEERING 26's zero-wrong-merge/recall gate.

## Iteration 469: shared-reference hints, still inactive

Grouping v2 accepts optional outbound links from each shortlisted article.
It supplies shared HTTP(S) references to the model, bounded to the first 20
links per article and 2,048 characters per URL. Exact links ignore fragments;
X/Twitter status URLs normalize to the post ID, ignoring handle and media/query
suffixes. Credentials and non-HTTP links are discarded. References are never
fetched, and shared references never cause a code-level merge. The prompt
explicitly warns that one link can cover separate events. Prompt/cache version
changed; fake tests verify citation dedupe, X aliases, unrelated links, empty
model decisions and cache invalidation. No production caller or paid call was
added. Extraction/caller wiring and the quality evaluation remain open.

## Iteration 470: offline saved-membership evaluation

`pnpm exec tsx scripts/evaluate-event-grouping.ts --memberships /path/to/groups.json`
now scores saved AI groups against the unchanged 98 recorded labels. The file is
an object mapping recorded fixture filenames to arrays of groups of article IDs;
for example `{"ranking-nba-2026-11-01.json":[["article-id-a","article-id-b"]]}`.
Omitted windows and omitted articles stay separate. Unknown windows, IDs from
another window, singletons and duplicate membership are rejected. This command
reads local files only; it cannot call a provider or activate production grouping.

Reports retain labelled precision/recall, all within-cluster pair checks,
unlabelled merged pairs requiring review, and order-stability checks. A perfect
labelled precision with unlabelled merges is insufficient activation evidence.
Synthetic saved groups verify the evaluator, not AI quality. The owner-capped
real evaluation and a newly labelled unseen day remain pending; production still
keeps articles separate.

## Iteration 471: bounded evaluation shortlists and orchestration

`pnpm exec tsx scripts/evaluate-event-grouping.ts --plan` previews six recorded
window shortlists without a provider or database. Each includes every labelled
pair endpoint, then fills to at most 40 candidates in recorded order. November 1
windows contain more than 40 articles, so this is an explicitly label-aware
sample, not evidence about production shortlist ranking or general quality.
No labels, reasons or expected groups enter the model input.

The evaluation runner accepts the existing budgeted grouping component and
processes windows sequentially, once per topic/day, with no provider reruns for
permutation checks. It returns saved memberships, shortlist counts and the full
existing precision/recall and all-pair report. Invalid memberships stop the run
before another request. Fake-provider tests exercise all six windows and confirm
cache reuse on a repeated run. Empty groups remain conservative abstentions;
they do not prove a successful provider response or quality acceptance.

There is no live entrypoint yet. A capped ledger/explicit live opt-in and time
gate, plus newly labelled unseen-day evidence, are still required before the
owner-authorized evaluation. This iteration made no paid calls and leaves
production grouping disabled.

## Iteration 472: evaluation admission, no live caller

The evaluation ledger decorator requires explicit live opt-in, rejects invalid
clocks and reservations during 13:00–16:00 UTC, and binds requests to the chosen
run, model and grouping purpose. Its integer-microdollar execution ceiling is at
most $0.10. It claims conservative request estimates before awaiting shared
admission; estimates are never refunded after refusal, failure or settlement.
Concurrent requests therefore cannot race past this additional ceiling.
The shared ledger still controls daily/monthly caps, scheduled reserve,
verification allowance, settlement and cache; this wrapper adds no funds.

Fake tests cover boundary times, crossing into the protected interval, malformed
reservations, concurrency, refusal, failures, settlement and budgeted cache reuse.
This is a per-execution guard, not durable authorization for repeated executions.
A once-only live entrypoint and new-day labels remain necessary before any paid
evaluation. No provider calls or production changes were made.

## Iteration 473: durable once-only execution guard

The evaluation-only harness exclusively creates and fsyncs one fixed item-26
claim before invoking the supplied runner. Concurrent invocations, subsequent
processes and empty crash markers all fail closed. The claim survives provider
errors and report-write failures; successful output is exclusively saved with
owner-only permissions and fsynced. Changing run IDs or UTC days does not reset
the fixed claim. Tests use temporary directories and fake callbacks only.

This guard is local to this VM, not distributed admission. The eventual live
entrypoint must use one already provisioned persistent directory, perform
preflight validation before claiming, and retain the shared ledger/time/cost
checks. It must never choose a new directory or delete a claim to retry. Live
wiring and unseen-day labels remain unfinished; no paid calls or production
activation occurred.

## Iteration 474: fresh NBA topic/day labels

A read-only November 3 NBA snapshot adds 19 real stored publisher-feed items
and 40 newly agent-reviewed pairs (20 same event, 20 separate). The labels
cover the Dalen Terry signing, LeBron’s fan-wine incident, two completed
games, and hard negatives for previews and subsequent third-party reactions.
All within-group positive pairs are labelled, including the five-item signing.
The snippets are recorded source claims, not independently verified facts.

These labels were frozen before any grouping-provider evaluation and without
changing the grouping prompt. This is a fresh topic/day sample, not a wholly
untouched calendar date: November 3 Gaming already appears in development
fixtures. Selection is deliberate and label-aware, not a representative quality
estimate. No claim of independent review or live grouping accuracy is made.
The original 60 labels remain intact; the combined set now has 138 labels
across seven windows. The bounded runner preserves all 19 fresh endpoints,
sends article facts only, and reports each window separately, so the fresh
sample can be assessed apart from older development labels. No paid calls
were made; live entrypoint wiring and the once-only capped evaluation remain
pending. Production still performs no event grouping.

## Iteration 475: fixed-state live evaluation entrypoint

`pnpm exec tsx scripts/run-event-grouping-evaluation.ts` is the explicit paid
entrypoint, requiring `LLM_LIVE=1` and the configured secrets environment.
It accepts no arguments or state-directory override. The preprovisioned
`/home/exedev/.local/state/news-digest/item-26` directory must be owned by the
current user, mode 0700, and resolve without symlinks. It is outside the repo
and survives builds and service restarts. Never delete its claim to retry.

Before claiming, the caller validates the recorded plan, configuration, UTC
admission, directory and database connectivity. It then composes the configured
Anthropic Haiku adapter, shared verification ledger/cache, conservative $0.10
execution ceiling and durable once-only guard. The ordinary verification cap
and scheduled reserve can further restrict spending. Reports retain run/model
identity, start time, memberships and per-window metrics. Failure consumes the
claim once execution starts; inspect the ledger/report without paid retries.
No production app or scheduler imports this script. This iteration provisioned
the directory and tested preflight rejection, but made no paid calls. Grouping
remains disabled; evaluation and activation evidence are still pending.

## Iteration 476: once-only evaluation failed; grouping parked

**Current state:** item 19/26 grouping is parked. Production keeps articles
separate. The inactive AI pass, live evaluation entrypoint and its admission/state
helpers were removed after the owner’s zero-wrong-merge gate failed. Generic
clustering/coverage plumbing and the offline evaluator remain. Earlier sections
468–475 describe the removed implementation, not the current runtime.

The owner-authorized once-only run used configured `claude-haiku-5-5` at
20:25–20:26 UTC on November 3, outside the excluded UTC hours. Run ID:
`item-26-evaluation-78af9286-4635-4122-8c41-89928e98cd8a`. The shared ledger
records seven succeeded calls, $0.008275 actual cost and $0.027462 total
conservative reservations, within the $0.10 ceiling. No repairs or paid retries.
The persistent claim and complete report remain in the fixed VM state directory;
do not remove the claim. No new edition was generated or grouping activated.

| Recorded sample | Positive pairs matched | Wrong labelled merges | Unlabelled merged pairs |
| --------------- | ---------------------: | --------------------: | ----------------------: |
| Nov 1 NBA       |                    7/8 |                     0 |                      14 |
| Nov 1 World     |                    2/2 |                     0 |                       3 |
| Nov 1 Tech/AI   |                    4/4 |                     1 |                       0 |
| Nov 2 NBA       |                    8/8 |                     0 |                       9 |
| Nov 2 Gaming    |                  10/10 |                     0 |                       4 |
| Nov 3 Gaming    |                  25/25 |                     0 |                      27 |
| Fresh Nov 3 NBA |                  20/20 |                     1 |                       0 |

Across 138 frozen labels: precision **76/78 (97.44%)**, recall **76/77
(98.70%)**. On the original 60 labels: precision 31/32 and recall 31/32,
above old recall 13/32 but failing the required zero wrong merges. The fresh NBA
sample also fails: precision 20/21, recall 20/20. The 57 unlabelled merged pairs
are **unreviewed**, not verified correct; labelled precision is not overall merge
precision. These selected agent labels are not independent or representative,
and November 3 overlaps the Gaming development date as previously disclosed.
The known failures alone are enough to reject activation without relabelling,
prompt tuning or another provider call.

Wrong merges combine the general Flock contract-cancellation pattern with one
police chief unplugging cameras, and Draymond Green’s ejection with teammates’
subsequent response. The sole missed positive is the Jeanie Buss allegation
pair. Labels were preserved unchanged.

Frozen memberships are in
`apps/api/test/fixtures/event-grouping-evaluation-2026-11-03.json`. Reproduce all
metrics without network/database/provider access:

```sh
pnpm exec tsx scripts/evaluate-event-grouping.ts --memberships apps/api/test/fixtures/event-grouping-evaluation-2026-11-03.json
```

The offline regression test pins the saved result and fresh-window failure.
Reopening grouping requires a new owner decision; no paid runner remains.

## Iteration 481: skip hard exclusions before article triage

Publication no longer sends existing quality-rule rejections or explicit excluded
phrases to Haiku. These same hard gates already apply to the final shortlist.
Missing required include phrases still receive semantic triage, preserving
relevance recovery. Candidate totals and quality omissions retain all loaded
inputs; unscored IDs track incomplete scoring among admitted candidates only.
This reduces unnecessary scoring without an arbitrary top-N cutoff; live latency
and cost effects await the scheduled edition. No paid verification was used.

## Iteration 482: inactive same-story AI pass restored

Restored the budgeted, cached grouping component from before `364cb1b`, with
STEERING 27's broader story definition. Prompt/purpose version `story-grouping-v3`
separates its cache entries from the previous same-event judgments. Shared links
and X citations remain hints only. Known IDs, unique membership, one-topic
inputs and bounded shortlists are validated; invalid output, unavailable AI or
refused budget keeps stories separate without repair calls.

Fake-provider tests cover these safeguards and the revised prompt contract.
They do not establish semantic accuracy. There is no production caller, paid
runner, paid call or activation in this step. Next: relabel the 138 pairs and
57 previously unlabelled merges, then run the single $0.05-capped evaluation
outside 13:00–16:00 UTC. Historical item 26 numbers use the old definition.

## Iteration 483: retrospective same-story review

`same-story-pairs.json` preserves a separate review of all 138 original pairs
and all 57 previously unlabelled merged pairs. Original strict-event labels and
saved predictions are unchanged. The legacy `sameEvent` field means same story
in this fixture. Each row records its original index (or null for the 57 added
pairs), rationale and whether its boundary is borderline.

The review changes 23 negative labels to positive: the two owner examples,
direct reactions to LeBron’s fan-wine incident, previews/results of one exact
game, Sentinel-reveal follow-ups and shared developer-interview coverage. The
European protest roundup explicitly overlaps the German violence report.
Ten labels flag uncertain boundaries, including sparse rookie-record/advice
and remaster-expansion/packaging links retained as negatives. Shared wars,
players, games or publishers alone still do not establish a story connection.
All 57 added pairs are same-story: specific games/previews, the endorsement,
German protests, Binance recovery, retirement/suspension announcements, studio
closure, cloning policy, fast travel, preload details and Sentinel reveal.

Offline replay of the **old prompt’s saved output**, using the revised labels:

| Recorded sample | Matched positive pairs | Wrong merges | Unknown merges |
| --------------- | ---------------------: | -----------: | -------------: |
| Nov 1 NBA       |                  21/22 |            0 |              0 |
| Nov 1 World     |                    5/6 |            0 |              0 |
| Nov 1 Tech/AI   |                    5/5 |            0 |              0 |
| Nov 2 NBA       |                  17/17 |            0 |              0 |
| Nov 2 Gaming    |                  14/18 |            0 |              0 |
| Nov 3 Gaming    |                  52/59 |            0 |              0 |
| Nov 3 NBA       |                  21/30 |            0 |              0 |

Precision is **135/135 (100%)**, recall **135/157 (85.99%)**, with 38
negative labels and zero borderline merged pairs out of 135 merges. The broader
labels explain the lower recall; predictions have not changed. These selected,
retrospectively agent-reviewed labels are neither independent nor representative.
This does **not** validate the restored prompt or authorize production activation.
The single new $0.05-capped evaluation remains pending, as does the Nov 4 review.

Reproduce without network, database or provider access:

```sh
pnpm exec tsx scripts/evaluate-event-grouping.ts --same-story --memberships apps/api/test/fixtures/event-grouping-evaluation-2026-11-03.json
```

Omit `--same-story` to reproduce the historical strict-event failure. Regression
checks pin every original pair’s identity, all 57 added reviews, zero unknown
saved merges, the historical failure and clear-unrelated/borderline reporting.

## Iteration 484: once-only restored-prompt evaluation

The explicit live runner now consumes a separate fixed item-27 authorization
under `/home/exedev/.local/state/news-digest/item-27`. Item 26's consumed claim
is untouched. Exclusive, synced claims survive failures; a second invocation
cannot make calls. `LLM_LIVE=1`, configured Haiku, verification-ledger tagging,
the shared daily/monthly/reserve rules, a conservative $0.05 execution ceiling
and the 13:00–16:00 UTC exclusion all remain enforced. Seven windows run
sequentially without repairs or retries. No app or scheduler imports this runner.

Run `item-27-evaluation-9c53e904-c472-4528-8252-aeb4653d2571` completed
seven successful calls for **$0.008393**, with no remaining holds. Frozen
195-pair labels give precision **141/141 (100%)**, recall **141/157 (89.81%)**,
zero labelled false positives and one borderline merged pair. New memberships
also contain **14 unlabelled merged pairs**; the offline evaluator continues
to report them as unknown rather than silently count them as correct.

Separate retrospective review records all 14 in
`apps/api/test/fixtures/same-story-evaluation-review-2026-11-03.json`:
13 directly connect Sentinel reveal coverage with its release-timing follow-ups.
The other connects the French-investigation/European-protest roundup to German
protest coverage: the supplied excerpt explicitly reports Germany's protests
and minister response. It is not a merge based solely on a shared protest theme.
All 14 are same-story under item 27; frozen labels remain unchanged.

Across all **155 merged pairs**, review found **zero clearly unrelated** and
**one borderline (0.65%)**, passing this sample's gate. Counting the supplemental
positive labels gives 155/155 precision and 155/171 recall (90.64%); keep these
post-output review numbers separate from the frozen-label metrics above.
Agent-labelled, label-aware shortlists across seven saved windows are not an
independent or representative production quality estimate. No retry evaluation
is authorized. Production has no caller and remains off until the Nov 4 run
is checked; conditional activation is for Nov 5 only.

Reproduce the frozen-label report without provider or database access:

```sh
pnpm exec tsx scripts/evaluate-event-grouping.ts --same-story --memberships apps/api/test/fixtures/same-story-evaluation-2026-11-03.json
```

Restored fake tests cover single consumption, crash/failure persistence, state
ownership, time and budget gates, concurrent reservation bounds, shared ledger
refusal, cache/settlement, all labelled endpoints and invalid membership stops.

## Iteration 485: admission loss from smaller triage pools

`pnpm exec tsx apps/api/scripts/evaluate-triage-cap.ts` compares newest-first
caps of 20, 30, 40 and 50 against current hard-exclusion admission on the three
recorded November 1 windows. Required include phrases remain advisory so semantic
recovery is preserved. Labels only measure admission; they never drive the cap.

| Topic     | After hard exclusions | Lost target events at 20 / 30 / 40 / 50 |
| --------- | --------------------- | --------------------------------------- |
| NBA       | 43                    | 2 / 1 / 0 / 0                           |
| World     | 46                    | 1 / 0 / 0 / 0                           |
| Tech & AI | 53                    | 3 / 2 / 1 / 1                           |

All five targets per topic are reachable before the cap. Even cap 50 loses the
reported Memdoor multi-model coding result in Tech. NBA and World already fit
one cold 50-item batch; smaller caps reduce tokens without reducing their batch
count. Tech drops from two theoretical cold batches to one, at a target loss.
These are recorded excerpts and existing agent labels, not live latency or a
representative quality estimate. Cache hits and input/output size affect actual
calls and duration. Gaming and current 200-item pools remain unmeasured. No paid
calls or production cap: a simple recency cutoff lacks a safe quality basis.

## Iteration 515: incremental triage cache experiment

`pnpm exec tsx apps/api/scripts/evaluate-incremental-triage.ts` runs the real
triage batching and item cache with synthetic scores over three recorded November
1 windows. Every in-window candidate is retained, including items the later hard
prefilter could exclude. Publication time stands in for availability because the
fixtures lack ingestion timestamps. The experiment is optimistic about arrivals;
it measures cache reuse and request fragmentation, not quality or live speed.

| Topic     | Candidates | Edition items, hourly / 3-hour / 6-hour / cold | Total requests, hourly / cold |
| --------- | ---------- | ---------------------------------------------- | ----------------------------- |
| NBA       | 52         | 0 / 2 / 9 / 52                                 | 18 / 2                        |
| World     | 47         | 5 / 18 / 25 / 47                               | 15 / 1                        |
| Tech & AI | 54         | 2 / 12 / 30 / 54                               | 17 / 2                        |

All cadences score each unchanged candidate once through the existing per-item
cache, despite growing pools and changed batch-local IDs. Hourly passes move most
items earlier but create many smaller requests, repeating prompt framing and
minimum output reservations; equal item counts do not prove equal cost. Across
these windows, hourly passes send 121,066 instruction/prompt UTF-8 bytes versus
65,824 cold, and reserve 70,000 output tokens versus 27,070 cold. These are wire
bytes and upper-bound reservations, not provider token usage or settled spend. Waste
from articles absent from the eventual edition pool is explicitly unknown: these
fixtures contain only one window and no ingestion or pool-change history. Gaming,
production arrival lag, budget admission and reserve interactions are unmeasured.
This is an offline experiment only; no scheduler, setting or activation ships.
A production implementation must stay off by default, respect the shared ledger
and scheduled reserve, and measure discarded pretriaged items before activation.

Iteration 516 extends the same offline runner with an optional JSON input path:
`pnpm exec tsx apps/api/scripts/evaluate-incremental-triage.ts /path/to/window.json`.
The existing window format accepts `availableAt` on every candidate (first
observed availability, no earlier than publication), and `poolSnapshots`, an
ordered array of `{ at, candidateIds }` complete eligible pools. The latest
snapshot persists until replaced; no pool is inferred before the first snapshot.
Arrivals exactly at a pass boundary wait until the next pass, including items
arriving at edition time. Snapshot membership changes apply at their timestamp.
Unknown IDs, duplicate IDs, unordered snapshots and partial arrival evidence
are rejected. All IDs must refer to in-window candidates.

The report distinguishes arrival evidence from publication proxies, counts
articles unavailable at edition time, and reports waste as distinct articles
scored before the edition but absent from its final available pool. It also
checks cache reuse when an article disappears and returns. Without snapshots,
waste remains unknown. A synthetic four-article regression demonstrates one
wasted score, one edition-time arrival missed, one late article scored during
the edition, and a returning article reused from cache. These are test outcomes,
not measurements of production ingestion lag or waste. The three existing
recorded windows still lack those observations; their results are unchanged.
No collection, scheduling, production setting or activation is added.

Iteration 517 adds an offline `--minimum-pending=25` option (with or without
an input JSON path). At each tick it waits for at least that many **uncached**
items in the currently available pool; edition time always flushes the remainder.
This defers work rather than dropping candidates. The default remains one.
On the three recorded windows, hourly passes with a 25-item minimum make six
requests total instead of 50, with 47 edition-time items instead of seven.
NBA/World/Tech edition remainders are 0/22/25, with two total requests each.
Prompt bytes total 67,051 and reserved output tokens 25,416; neither is actual
provider usage or cost. All 153 items are scored once. Compared with five cold
requests, this trades less edition work for one additional request. The gate
counts pending items rather than pool size, so cached items cannot repeatedly
trigger small batches. Real arrival/pool evidence, budget admission and live
latency remain unmeasured; no production setting or activation is added.

Iteration 518 adds `--stop-before-edition-hours=2` to the offline replay.
Pretriage ticks at or after that cutoff are skipped; edition time still scores
all remaining candidates. The cutoff is relative to each window end, accepts
fractional hours, and defaults to zero. It models a quiet period, not ledger
admission: it does not prove the normal budget can fund earlier passes or that
the scheduled reserve is protected.
With hourly ticks, minimum 25 and a two-hour cutoff, the recorded NBA/World/Tech
windows leave 26/22/25 items for edition time (73 total versus 47 without the
cutoff). All 153 articles are scored once in six requests; prompt bytes remain
67,051 and reserved output tokens 25,416. Stopping earlier moves NBA's last batch
to edition time without increasing the request count in these windows. These
are publication-proxy, synthetic-score measurements, not live spend or latency.
No production schedule, setting, reserve or feature is changed.

## Iteration 519: reserve-safe background triage entry point

`incrementalTriageServices` is prepared behind `LLM_INCREMENTAL_TRIAGE_ENABLED`
(default `0`); no collection or scheduler path invokes it. Enabling requires
`LLM_SCHEDULED_RESERVE_ENABLED=1`. It uses the normal configured Anthropic
ledger and Haiku per-item cache; a dedicated request coordinator avoids joining
scheduled in-flight work. The background boundary clears inherited scheduled
context, even when called inside an edition worker. Reserve denial leaves items
unscored for the edition, without making a provider call.

Isolated Postgres + fake-provider coverage checks full-reserve refusal inside a
claimed edition, ordinary-budget admission, settled purpose, and cache reuse by
a different edition with no new call. This establishes admission/cache behavior,
not real cost, waste or latency. No production flag was enabled; arrival/pool
capture and scheduler batching remain unfinished pending the Nov 4 review.

Iteration 520 bounds offline replay invocations to 200 candidates, matching the
triage entry point, while retaining the complete pool. Previously a growing
pool above 200 failed before it could be measured. A synthetic 1,500-item
arrival/pool regression scores every article once, reuses scores despite shifted
chunk boundaries, and counts one pretriaged article removed from the final pool
as waste. A cold replay scores the remaining 1,499 articles. This verifies scale
and accounting only; it supplies no real arrival, waste, spend or latency evidence.
Production configuration and scheduling are unchanged.

## Iteration 521: read-only first-fetch arrival evidence

`pnpm exec tsx scripts/export-triage-arrivals.ts START END OUTPUT_DIRECTORY`
exports one replay JSON per enabled topic from a consistent read-only database
transaction. Windows must be completed and at most 48 hours. Output files are
created exclusively with mode 600; use a fresh directory outside the repo.
No models, queues, settings or content are written. The export includes every
currently source-associated article in the publication window, without a cap.

`availableAt` is the immutable global `content_items.fetched_at`, **not** the
first observation for that topic. Source connections and article text are current,
not historical. Arrivals before publication are excluded and counted explicitly;
no timestamps are invented. No historical eligible-pool snapshots exist here,
so waste stays unknown and these pools are not production shortlists.

Read-only live export for Nov 3 00:00–Nov 4 00:00 UTC found Tech/NBA/Gaming/World
332/159/296/236 articles, including 6/3/2/2 first fetched after window end; none
had arrival before publication. Offline hourly replay, minimum 25 and two-hour
cutoff, pretriaged 288/120/248/194 and left 38/36/46/40 edition-time articles.
There were 14/5/10/8 synthetic requests and zero repeated scoring. This measures
first-fetch availability under current source membership, not provider latency,
settled spend, historical pool waste or production edition quality. Exports live
under `/tmp/triage-arrivals-521/` on this VM; no new production setting is enabled.

## Iteration 522: bounded background work replay

The offline incremental CLI accepts `--maximum-items-per-pass=25` alongside
`--minimum-pending=25 --stop-before-edition-hours=2`. This bounds new items
per background tick, leaving backlog for later ticks; it never caps final
edition scoring. Omit the maximum to retain the previous replay behavior.
The report includes bounded passes and peak pending items. This is an offline
scheduling experiment, with no production scheduler or setting activation.

On the iteration 521 Nov 3 first-fetch exports, hourly bounded passes
pretriaged Tech/NBA/Gaming/World 275/125/250/200 items, leaving 51/31/44/34
for edition time (160 total). Total synthetic requests were 13/6/12/9,
with zero repeated scoring. Bounding changes which ticks meet the minimum,
so individual topics can pretriage more or fewer items than the unbounded
replay. These are synthetic scores over real exported content; global fetch
times remain an imperfect topic-arrival proxy. Historical pool waste, provider
latency, settled cost and quality remain unmeasured. No paid calls were made.

## Iteration 523: cache-aware bounded pass preparation

`incrementalTriagePass` prepares background orchestration over a caller-supplied
eligible pool. It probes the same validated per-item cache fingerprints used by
edition scoring, in chunks of at most 200, waits for a minimum pending count,
and scores at most the configured maximum (1–200). Input order is preserved;
excess work remains for later calls. Invalid bounds and duplicate pool IDs fail
before cache/provider access. The reserve-safe prepared service exposes the
read-only probe alongside its background scorer.

Fake-provider regressions cover a 450-item backlog, disjoint successive passes,
refused items remaining pending, corrupt cache identities, changed title/topic
fingerprints, and a 60-item pool scored in 25/25 background batches followed by
an uncapped 10-item edition tail. These are accounting checks, not live latency,
settled cost, historical waste or quality evidence. Cache probing and scoring are
not atomic: the prepared runner serializes worker-local passes and enforces the
cutoff; eventual scheduler wiring must supply current eligible pools. No collector/scheduler invokes this code;
the setting remains off by default pending the Nov 4 review. Historical pool
measurement and durable scheduler admission remain open.

## Iteration 524: serialized background admission and cutoff

The prepared `IncrementalTriageRunner` admits one pass across all topics per
instance, skips overlapping ticks without loading or queueing stale pools, and
releases admission after success or failure. It checks the current schedule
before loading, after loading, and immediately before scoring after cache reads.
The cutoff boundary is exclusive. Invalid timing fails closed; work refused at
the cutoff remains unscored for the edition. Already-started provider calls can
finish after the cutoff. The caller must provide the next scheduled edition and
cutoff duration from current settings, and use the reserve-safe scorer.

Three fake-only regressions cover overlapping ticks, exact boundary and schedule
changes during reads, retries, and loader/cache/provider/configuration failures.
This is worker-local admission, not a cross-process lock. No timer invokes the
runner; production activation, durable admission, eligible-pool capture and
historical waste evidence remain open. No paid calls or latency claims.

## Iteration 525: prospective eligible-pool capture

`pnpm exec tsx scripts/capture-triage-pool.ts START END OUTPUT_FILE` captures
current edition-loader inputs in a consistent read-only transaction, using the
same newest-200 query and hard quality/excluded-phrase admission as edition
triage. Missing required phrases remain eligible for semantic recovery; zero
story budgets admit nothing. It stores current text, topic guidance/policy,
publication times and eligibility, timestamped by the database transaction.
Windows must have started and span at most 48 hours; the end may be future so
successive captures can target the **same upcoming edition window**. Files are
exclusive-created with mode 600; keep them outside the repo. No cache, provider,
queue or configuration writes occur.

At 2026-11-04 01:07 UTC, the Nov 3 15:00–Nov 4 15:00 UTC window contained
Tech/NBA/Gaming/World 172/53/175/94 candidates, with 172/52/174/94 eligible.
The private capture is `/tmp/triage-pool-525.json`. This is current eligibility,
not historical arrival or actual pretriaged work. A later capture for that same
window can establish pool churn; eligibility loss becomes measured waste only
when joined to actual scoring. Source membership/text/settings are observed now,
not reconstructed. No spend, latency or quality claim follows from this capture.
The existing global-first-fetch export remains a separate, weaker arrival proxy.

## Iteration 526: compare successive prospective pools

`pnpm exec tsx scripts/compare-triage-pools.ts BEFORE_CAPTURE AFTER_CAPTURE`
reads only local capture files and reports per-topic retained, added and lost
eligible IDs. Loss is split between absent candidates and candidates still
present but no longer eligible; added/removed topics and changed topic settings
are explicit. It rejects different windows, nonchronological observations,
duplicate IDs and malformed capture structure. It emits counts, not article text.

Comparing `/tmp/triage-pool-525.json` (01:07:11 UTC) with
`/tmp/triage-pool-526.json` (01:11:49 UTC), for the same Nov 4 edition window,
retained all 492 previously eligible candidates and added three NBA candidates.
No observed eligibility losses or topic-setting changes occurred in this short
interval. This does not establish day-long stability, unchanged scoring inputs,
cache reuse, final-edition membership, actual scored-work waste or provider cost.
Continue capturing this window before/at publication and join actual scoring
before quantifying waste. No provider calls or production activation occurred.

## Iteration 527: prepared cross-process background admission

`IncrementalTriageRunner` accepts an optional admission port. The prepared
Postgres adapter takes one nonblocking session advisory lock across all topics,
on a dedicated connection, separately from the budget transaction lock. A busy
worker skips before loading the pool. The runner rechecks the schedule cutoff
after admission and releases on completion, cutoff or failure. Unlock failure
destroys the connection; normal release is idempotent. Postgres releases session
locks when the connection closes, including worker termination.

Isolated Postgres tests exercise independent pools contending for the lock,
busy-loader avoidance, repeated release and recovery after loader failure.
Fake tests cover admission/release errors and crossing cutoff during admission.
This is mutual exclusion while the database session survives, not fencing of
already-started provider calls after a connection failure. No scheduler invokes
the runner, and incremental triage remains off; future wiring must supply the
shared admission adapter. No paid calls or measured waste/latency claim.

## Iteration 528: prospective triage cache compatibility

`pnpm exec tsx scripts/compare-triage-cache.ts BEFORE_CAPTURE AFTER_CAPTURE TRIAGE_MODEL_ID`
compares eligible article fingerprints through the production `CandidateTriage.pending`
probe with a local empty cache. It uses the edition topic guidance, current prompt,
model and truncation rules. No database, provider request or cache write is possible.
The explicit model is held constant across both observations; this does not recover
historical prompts or models. Incomplete captures are rejected.

Reports separate compatible fingerprints, changed fingerprints among retained IDs,
and prior fingerprints potentially unusable because eligibility or inputs changed.
Text, source and guidance changes can invalidate scores even when IDs remain eligible;
changes outside production truncation limits do not. Compatible fingerprints do not
prove an entry exists, and potential waste is not actual paid/scored work.

The Nov 4 same-window captures at 01:07:11 and 01:21:12 UTC retain all 492 eligible
articles with compatible fingerprints under `claude-haiku-5-5`; NBA adds three eligible
articles. Private latest capture: `/tmp/triage-pool-528.json` (mode 600). This roughly
14-minute observation does not establish final-edition reuse, scored-work waste,
provider cost or latency. Scheduler wiring and joins to successful scoring remain open.
No production setting or service flow changed.

## Iteration 529: successful-scoring work evidence join

`pnpm exec tsx scripts/report-triage-work.ts /private/scoring-evidence.json`
compares observed background scoring results with the final eligible triage
pool. The JSON contains `windowStart`, `windowEnd`, `finalPoolObservedAt`,
`finalPool` and `attempts`. Pool entries have `topicId`, `articleId` and the
production cache `fingerprint`; attempts add `attemptId`, `completedAt` and
`outcome` (`scored` or `unscored`). An attempt ID identifies one scoring
invocation; duplicate article evidence within that invocation is rejected.

Only successful scores count as scored work. The report separates final-pool
absences, changed fingerprints, compatible scores and repeated compatible
scoring. Topic IDs prevent cross-topic cache reuse claims. Unscored attempts
remain separate because failed calls can still cost money. Final membership
means the eligible triage pool, not the editor's selected stories. The final
observation must be at or after window end; background completions must precede
it and fall inside the window.

This is an offline input contract and join, with synthetic regression coverage;
there is no production scoring exporter or scheduler caller yet. Do not feed
prospective captures in as successful scoring. Compatibility does not prove
actual cache consumption; these counts establish neither spend nor latency.
No actual incremental scores exist yet and no measured waste claim is made.

## Iteration 530: bounded multi-topic scheduler preparation

The prepared `IncrementalTriageScheduler` processes one topic per tick through
an injected `IncrementalTriageRunner`. The item bound applies to the entire tick,
rather than being multiplied by the number of topics. It rotates through the
current topic list after completed passes and failures, so a failing topic does
not starve the others. Busy/cutoff results preserve the next turn; overlapping
ticks skip immediately without queuing work. Removing the last-served topic
restarts rotation at the beginning of the current list. Duplicate/blank topic
IDs and loader identity mismatches are rejected.

Three fake-only regressions cover bounded work, topic changes, overlap,
failure recovery, contention/cutoff turns and invalid input. This is prepared
orchestration, with no timer, production pool caller, scoring export or paid
calls. The eventual caller must use the reserve-safe scorer and shared database
admission, reload current enabled topics/settings, and keep activation off until
the Nov 4 review. No live speed, cost or waste measurement is claimed.

## Iteration 531: prepared successful item-write observation

`triageWorkEvidence` decorates the item cache for one article-scoring invocation.
Its `attempts()` snapshot uses the exact production cache fingerprint and
original article ID after a successful item write, with topic, attempt ID and
completion time. Returned scores are deliberately not the observation point: they
include cache hits. Whole-request and social cache writes are excluded. Failed
writes produce no successful evidence; earlier successful writes remain available
when later work fails. Snapshots contain no article text or provider responses.

The caller must create a recorder per invocation, retain its snapshot even after
a scoring exception, and persist the rows privately before discarding it. Rows
feed `report-triage-work.ts`; they do not represent failed/unscored attempts,
provider spend, or proof that the final edition consumed a cache entry. Fake
provider tests exercise real triage/cache behavior, warm hits, changed inputs,
failed writes and the offline report join. There is no production caller, activation or actual scored-work measurement yet.

## Iteration 532: prepared private scoring-evidence export

`exportTriageEvidence` persists a successful-write snapshot to an existing
absolute private directory outside the repository. Each export has a random
filename and mode 600. It writes and syncs a temporary file before publishing
with an exclusive hard link, so readers see a complete file and concurrent
exports cannot replace one another. Temporary files are removed on completion.
The bounded schema accepts at most 200 rows, strips extra fields and rejects
invalid fingerprints or duplicate attempt/article identities. Empty snapshots
create no file. Failures propagate; a future caller must retain the snapshot
and report persistence failures rather than silently losing evidence.

The JSON contains only `attempts`; combine these with window bounds and the
final eligible fingerprint pool for `report-triage-work.ts`. Fake cache writes
exercise export, private permissions, concurrent publication and the report
join. No production caller or timer invokes this adapter yet, and incremental
triage remains off. These tests are not actual waste, cost or latency evidence.

## Iteration 533: service-level evidence wiring, still inactive

The prepared incremental service now creates a separate write recorder for
each scoring invocation and exports its successful writes, including partial
successes when scoring throws. Random attempt IDs distinguish invocations
sharing a run ID. Export errors propagate; simultaneous scoring/export failures
retain both errors. The wrapper clears scheduled privilege throughout scoring
and export. Pending probes still use the unmodified production cache.

When enabled with credentials, the service requires an absolute
`LLM_INCREMENTAL_TRIAGE_EVIDENCE_DIRECTORY` naming an existing private directory
outside the repo. The directory must be provisioned before activation. No timer
or pool caller invokes the service yet; the setting stays off by default. Fake
regressions cover concurrent topic isolation, partial evidence and both failure
paths. No paid calls, actual background scores or waste measurements occurred.

## Iteration 534: shared-admission scheduler composition, still inactive

The prepared public scheduler factory composes the reserve-safe, evidence-writing
service with the bounded round-robin scheduler and mandatory Postgres admission.
It scores at most 25 pending items from one topic per tick. Separate worker
instances share the lock before loading pools; scoring failures release it.
The default-off factory returns before reading the schedule or database.
Isolated Postgres tests use a fake scorer to verify contention, the item bound,
cutoff and recovery. No timer or production pool loader invokes this factory;
there are no paid calls, activation or measured waste/latency results. Future
worker wiring must supply the current schedule and exact edition candidate pool.

## Iteration 535: exact edition-pool boundary, still inactive

`loadIncrementalTriagePool` loads the scheduled window through the edition's
existing newest-200 query, rereads the topic's enabled/story-budget settings,
and returns no pool for missing, disabled or zero-story topics. Invalid windows
fail before database access. A shared pure input builder now supplies both this
boundary and edition generation with identical guidance and hard-exclusion
admission, retaining articles without required phrases for semantic recovery.
This extraction preserves edition behavior and per-item fingerprints. Fixture
regression covers guidance, exclusion, semantic recovery and exact query
parameters; existing isolated edition goldens verify publication behavior.
There is still no worker/timer caller or activation, and no actual background
scoring, paid verification or waste/latency measurement. Current schedule and
window derivation remain the next caller responsibility.

## Iteration 536: prepared current-schedule window boundary

`incrementalTriageWindow` resolves the next configured local publication time
with the same cron parser/timezone behavior as the scheduler, then derives the
edition coverage window and a two-hour background cutoff. Each invocation uses
its supplied current settings. At the exact publication instant it retains that
slot so the runner cannot evade the cutoff by moving to tomorrow. Coverage is
elapsed time across DST, matching edition generation.

Offline tests cover local/UTC schedules, changed settings, the exact slot and
next millisecond, DST coverage and invalid settings/time. No production caller,
timer, activation or paid request was added; actual scored-work waste and live
latency remain unmeasured.

## Iteration 537: prepared settings/pool tick composition

`prepareIncrementalTriageTick` joins current settings, the scheduled window and
lazy topic pools to one persistent bounded scheduler. Disabled composition
returns before settings/clock/pool reads. An outer guard skips overlapping
settings reads, releases on failure, and preserves round-robin state. A topic
removed or disabled during loading contributes empty work. Each tick pins its
cutoff to its pool window: a slow read crossing publication cannot move the
cutoff to tomorrow. Each load receives a separate background run identifier.

Four offline tests cover disabled reads, current schedule changes, topic
rotation, the 25-item limit, unavailable topics, settings failure recovery,
overlap and publication-crossing cutoff. No worker imports this adapter, no
timer is installed, and production dependency wiring remains open. There are
no paid requests, activation or actual scored-work waste/latency measurements.

## Iteration 538: prepared timer lifecycle

`prepareIncrementalTriageTimer` prepares bounded periodic invocation without
connecting it to the production worker. It skips overlapping calls, reports
failures and allows the next interval to recover. Its stop function clears the
timer and awaits active work, so a future worker can drain scoring before
closing the database. The timer is unreferenced and does not tick immediately.
Offline tests cover overlap, draining, error recovery, reporter failure and
invalid intervals. No timer is running in production, no paid calls were made,
and this supplies no live speed or scored-work waste evidence. Activation
remains gated on the November 4 edition review.

## Iteration 539: prepared runtime dependency composition

`prepareIncrementalTriageRuntime` joins the shared database pool, current-settings
reader, article pool loader, reserve-safe scheduler and draining timer. The
caller owns the database and must await the returned stop function before
closing it. The scheduler is composed once so topic rotation survives ticks.
Default-off returns without allocating a timer or reading settings/content.
Offline tests verify that gate and the settings/scheduler/timer contract.
The production worker still does not import this runtime; no activation, paid
calls or live latency/waste evidence is claimed. Worker-owned settings and
database lifecycle wiring remain, subject to the Nov 4 review gate.

## Iteration 540: prepared worker resource ownership

`prepareIncrementalTriageWorker` owns the scoring pool and the existing profile
and topic repositories. Each tick reads the current saved schedule and enabled
topics in repository order. These reads are separate snapshots; the pool loader
still rechecks topic availability before scoring. Disabled mode allocates no
resources. Startup failure closes all allocated resources and preserves cleanup
errors; concurrent or repeated shutdown calls share one drain and close operation.
Connections close only after scoring drains. Offline lifecycle tests cover these
paths; isolated database verification checks persisted settings and topic IDs.
The production worker does not import this entry point. Activation still awaits
the Nov 4 edition review; no paid scoring or live waste/latency claim is made.

## Iteration 541: preserve ranked pool order in offline replay

The incremental replay now consumes each recorded snapshot's candidate order
when selecting a bounded batch. Previously it used catalogue order, which could
score a lower-ranked article and distort edition remainder and waste estimates.
A synthetic changing-rank regression verifies two useful background scores,
zero edition remainder and zero waste, independently of catalogue ordering.
The eight offline replay tests pass. This corrects simulation accounting only;
production remains off and no actual scoring, cost or latency was measured.

## Iteration 542: per-topic observed scoring accounting

The offline `report-triage-work.ts` report now includes a sorted `topics`
breakdown with the same counts as the overall result. Topics seen only in
scoring or only in the final pool remain visible; an article shared across
topics cannot borrow another topic's score. Every topic count sums to its
overall counterpart, including repeated compatible scores, changed fingerprints,
absent articles, unscored attempts and final-pool remainder. Synthetic regression
coverage verifies reconciliation and input-order independence. This prepares
per-topic waste assessment from future observed scores; it supplies no live
waste, spend, cache-consumption or latency evidence. Production remains off.

## Iteration 543: longer real-pool compatibility observation

Read-only production captures for the Nov 3 15:00–Nov 4 15:00 UTC edition
window now span Nov 4 01:07:11.668–02:40:47.716 UTC (93 minutes 36 seconds).
The existing offline fingerprint comparator uses `claude-haiku-5-5` and the
current production prompt for both captures; no provider or cache writes occur.

| Topic                 | Earlier eligible | Later eligible | Added | Lost | Compatible earlier fingerprints | Changed earlier fingerprints |
| --------------------- | ---------------: | -------------: | ----: | ---: | ------------------------------: | ---------------------------: |
| Tech & AI             |              172 |            178 |     6 |    0 |                             170 |                            2 |
| NBA                   |               52 |             62 |    10 |    0 |                              52 |                            0 |
| Gaming                |              174 |            175 |     1 |    0 |                             174 |                            0 |
| World news & politics |               94 |            109 |    15 |    0 |                              88 |                            6 |
| Total                 |              492 |            524 |    32 |    0 |                             484 |                            8 |

All earlier eligible IDs remain eligible and topic settings are unchanged, but
8/492 earlier fingerprints (1.63%) are incompatible. Comparing captured input
fields finds two title and two excerpt changes in Tech, four title and five
excerpt changes in World, and no source-list changes. Field counts overlap;
production fingerprints, rather than field counts, determine compatibility.
This observation demonstrates why retained membership alone overstates potential
reuse. It does not establish how often updates happen over a full day.

Private inputs: `/tmp/triage-pool-525.json`, `/tmp/triage-pool-543.json`;
comparison: `/tmp/triage-cache-543.json`. Reproduce with
`pnpm exec tsx scripts/compare-triage-cache.ts /tmp/triage-pool-525.json /tmp/triage-pool-543.json claude-haiku-5-5`.
The later pool was captured with `scripts/capture-triage-pool.ts` using the
window above. Inputs contain current article text and stay outside git.
Neither observation is the final edition pool. No background scores, cache
hits, paid-work waste, cost or latency were measured. Incremental triage remains
off; final-pool joins to observed scoring are still required after activation.

## Iteration 544: attribute prospective cache invalidation

`compare-triage-cache.ts` now partitions changed retained fingerprints into
article-only, topic-only and combined article/topic changes. It computes
counterfactual keys through the production triage implementation: old articles
with new topic instructions, and new articles with old topic instructions.
This respects prompt truncation and avoids treating every raw field edit as
an invalidation. The three counts sum to changed retained fingerprints;
removed or newly ineligible items remain in the separate loss counts.

Replaying the iteration 543 inputs attributes all eight changed keys to article
inputs (Tech 2, World 6); topic-only and combined counts are zero. Private output:
`/tmp/triage-cache-544.json`, using the reproduction command above. Five offline
regressions cover isolated/combined changes, ignored truncated text, eligibility
loss and reconciliation. These are prospective key comparisons, not actual
scored-work waste or paid-call evidence. No activation or provider requests.

## Iteration 545: join final captures to exported score evidence

`pnpm exec tsx scripts/report-captured-triage-work.ts FINAL_CAPTURE TRIAGE_MODEL_ID SCORE_EXPORT...`
joins the existing private pool-capture format and one or more atomic scoring
exports directly into the observed-work report. It derives eligible article
fingerprints through production triage code, with an explicit model, and
retains per-topic counts, repeated writes, changed inputs and absent items.
It rejects pre-window-end observations, duplicate topics/articles, duplicate
scoring evidence, malformed exports and out-of-window writes.

Use a capture taken at the edition boundary: a later capture reflects later
text/settings and is not proof of the exact pool consumed by publication.
Inputs must describe the same window and scoring configuration; the records
do not independently prove their provenance. Compatible keys do not prove
cache consumption. This iteration verifies the join with synthetic records
only; no actual scored-work waste, cost or latency was measured, and no worker
was connected or activated. The early private 525/543 captures are deliberately
rejected as final-pool observations. No provider or database calls are made.

## Iteration 546: recover incremental admission after session loss

A disposable-Postgres regression terminates only the backend owned by the
prepared admission test. It verifies that another worker acquires the released
session lock, stale cleanup fails without unlocking that successor, and the
original pool replaces its dead connection and can acquire admission again.
No provider call occurs. This is recovery evidence, not fencing: a provider
request already in flight can outlive its database session, so session loss
can still permit overlapping scoring. Incremental triage remains inactive.

## Iteration 547: contain admission-client disconnect errors

The prepared Postgres admission adapter now owns an error listener while its
client is checked out. Unlike idle connections, checked-out client errors do
not reach the pool; without a listener a connection loss during provider work
could terminate the process. Cleanup destroys a failed connection, reports the
session error and removes its listener. The isolated session-termination test
now relies on the adapter's listener, with no test error handler masking this
path, and verifies listener removal and successor-lock safety. This does not
fence already-started provider requests. No worker activation or paid calls.

## Iteration 548: preserve work and admission-cleanup errors

The inactive incremental runner reports both failures in an `AggregateError`
when loading, cache reads or scoring fails together with admission cleanup.
Previously cleanup hid the work failure. Single failures retain their original
identity. Fake regressions cover each stage, falsy thrown values, release count
and next-tick recovery. No provider calls or production activation occurred;
this improves diagnosis, not fencing of already-started requests.

## Iteration 549: replay scoring-input changes

The offline incremental replay accepts optional `candidateUpdates` on each
`poolSnapshots` entry: full scoring inputs (`id`, `title`, `excerpt`, `sources`)
for existing candidates. Updates persist across later observations and pool
removal; publication and arrival times retain their original values. Unknown or
duplicate update IDs and malformed scoring fields are rejected.

Pending work now uses `CandidateTriage.pending` and its actual compact-input
fingerprints rather than an ID-only set. `invalidatedPreEditionItems` counts
final-pool articles scored earlier whose current inputs still need scoring at
publication. `repeatScoring` counts additional versions scored for previously
seen article IDs; `wasteItems` continues to count membership loss only. Neither
metric is settled provider spend or full version-level waste accounting.

A synthetic regression scores two successive versions before publication and a
third at publication after removal and return: three scored items, two repeat
scores, one invalidated final item, zero membership waste. Changes beyond the
500-character title bound reuse the cache. Existing recorded November 1 windows
have no updates and retain their hourly edition remainders (NBA 0, World 5,
Tech/AI 2), with zero repeats or invalidations. No production activation, paid
requests or live cost/latency evidence.

## Iteration 550: version-level offline waste

Replay now partitions pre-edition scored versions into reusable final inputs,
versions belonging to removed articles, and obsolete versions of retained
articles. `wastedPreEditionVersions` is the latter two combined;
`reusablePreEditionVersions`, `removedPreEditionVersions` and
`obsoletePreEditionVersions` expose the partition. Counts use real cache probes,
so reverting to an earlier cached headline reuses that version. All four fields
are null without observed pool snapshots: a publication proxy cannot establish
waste. These are synthetic scoring counts, not provider spend or live waste.

A regression scores two versions each of two articles, removes one article and
reverts the other: four pre-edition scores, one reusable version, two removed
versions and one obsolete retained version. Edition work is zero. The earlier
three-version invalidation case now reports two wasted pre-edition versions.
Production remains off pending the Nov 4 review; no provider calls were made.

## Iteration 551: offline triage batch-size comparison

Run `pnpm exec tsx apps/api/scripts/evaluate-triage-batching.ts` to compare
10/25/50/200-candidate caller chunks through the real request builder, with
synthetic responses and an in-memory item cache. The three recorded Nov 1
windows contain 153 in-window articles. Topic descriptions/guidance are empty
in this experiment, so request sizes do not exactly reproduce production.

| Caller chunk | Requests | Input UTF-8 bytes | Reserved output tokens |
| ------------ | -------: | ----------------: | ---------------------: |
| 10           |       17 |            80,479 |                 27,916 |
| 25           |        8 |            69,487 |                 27,232 |
| 50           |        5 |            65,824 |                 27,070 |
| 200          |        5 |            65,824 |                 27,070 |

Smaller chunks increase repeated prompt overhead: 10-item passes use 22.3%
more input bytes and 3.1% more output reservation than the current 200-item
caller bound. The internal 50-item limit makes the 50/200 request shapes equal
for these short excerpts. This does **not** make their scheduling equivalent:
caller passes are sequential, while each pass allows four concurrent requests.
No durations were simulated or measured, so this supplies no evidence that
smaller batches improve latency. Keep production batching unchanged pending
provider evidence. Bytes are not token usage; reservations are not spend.

All variants cover every candidate exactly once and reuse every item score
when repartitioned. A separate long-Unicode-excerpt regression verifies that
the conservative 60,000-byte bound splits a nominal 50-item pass. No live
provider calls, production cache writes, settings changes or activation occurred.

## Iteration 552: concurrency sensitivity from recorded HTTP durations

Run `pnpm exec tsx apps/api/scripts/evaluate-call-concurrency.ts
apps/api/test/fixtures/edition-call-durations-2026-11-03.json` (one line).
The fixture preserves only purpose, duration and HTTP outcome from the worker
journal, Nov 3 15:00–15:04 UTC, filtered by edition/run ID
`777fdd95-0bcd-4ca7-9ea6-36c654effcca`. No response bodies, prompts or credentials
are stored. Its 43 calls total 811,368 ms; the 17 article-triage calls total
517,143 ms. HTTP success does not establish editorial validation success.

| Slots | All-call lower bound | Independent longest-first schedule |
| ----: | -------------------: | ---------------------------------: |
|     4 |           202,842 ms |                         204,729 ms |
|     8 |           101,421 ms |                         104,149 ms |
|    16 |            50,711 ms |                          52,008 ms |

The lower bound is the larger of total duration divided by slots (rounded up)
and the longest call. The hypothetical schedule assumes every call is ready
immediately and assigns longest calls first. Real topic/phase dependencies,
admission, rate limits, non-provider work and changing latency under load are
omitted. This is neither an optimal schedule nor a production speed prediction.
Eight slots cannot reach 60 seconds at these fixed durations even before those
constraints; 16 slots supplies no evidence of achieving the target. Compact
output and incremental cache preparation remain relevant. Production concurrency
is unchanged; no paid calls or activation occurred. Missing or failed requests
must not be silently removed when preparing future evidence.

## Iteration 624: ideal article-cache remainder

The same offline concurrency command now reports `ideal-article-cache-remainder`:
it removes only the 17 `candidate-triage-v1` calls, as if every article score
were already cached before publication. All social triage, editorial calls and
unknown purposes remain, including any failed HTTP requests. This is an ideal
cache scenario, not measured incremental-worker readiness.

The Nov 3 recording leaves 26 calls totaling 294,225 ms. With four slots, even
the dependency-free lower bound is 73,557 ms (longest-first: 75,650 ms), above
the 60-second target. Eight slots yield a 36,779 ms lower bound (longest-first:
38,261 ms), which does not establish that production could meet the target:
phase dependencies, budget admission, rate limits and non-provider work remain
excluded, and observed durations may change under load. Article pretriage alone
therefore cannot meet 60 seconds at four slots with these fixed observations.
It moves 517,143 ms of aggregate HTTP work earlier; it does not eliminate its
cost, prove cache reuse or measure unused-score waste. No production flag,
concurrency, prompt or provider call changed.

## Iteration 625: where the remaining HTTP time goes

The offline concurrency report now includes exact-purpose totals (calls,
failures, aggregate HTTP milliseconds and longest call), ordered by aggregate
time. Unknown purposes and failures remain visible; these totals partition
recorded work rather than infer missing calls or explain retries.

For the Nov 3 ideal article-cache remainder:

| Purpose                                         | Calls | Aggregate HTTP time | Share of remainder |
| ----------------------------------------------- | ----: | ------------------: | -----------------: |
| Story shortlist editing (`shortlist-editor-v4`) |    10 |          144,055 ms |              49.0% |
| Social triage (`social-triage-v1`)              |     6 |           83,770 ms |              28.5% |
| Social editing (`social-editor-v2`)             |    10 |           66,400 ms |              22.6% |

All 26 recorded remainder calls report success at the HTTP layer. That does
not establish successful output validation or explain NBA fallback. Story and
social editing together account for 210,455 ms (71.5%) of the remainder:
optimizing article triage alone leaves most of this work untouched. These are
aggregate durations, not sequential edition phases or avoidable overhead;
the report has no topic, attempt or dependency identity. Use the Nov 4 logs
and edition evidence before attributing the ten calls per editor to retries
or changing any production behavior. No paid calls or production changes.

## Iteration 553: offline triage input composition

The batching replay also partitions actual serialized input bytes into instructions,
excerpt values, title values, source arrays and remaining framing. Value counts
include JSON quoting/escaping (and `null` excerpts); framing includes topic,
output instructions, identity fields, field names and JSON punctuation. The
parts sum exactly to the request input size, including multibyte text.

At the current 200-item caller setting, the three recorded windows total
65,824 bytes: excerpts 30,116 (45.8%), titles 11,681 (17.7%), sources 3,393
(5.2%), repeated instructions 3,665 (5.6%), and framing 16,969 (25.8%).
These windows have empty topic guidance. Removing all repeated instructions
would save at most 5.6% here; shortening excerpts could affect relevance and
has not been quality-tested. No prompt edits, token/cost/latency inference,
paid calls or production change. Use the existing batching CLI to reproduce.

## Iteration 626: capacity needed for the timing targets

The offline concurrency report now includes necessary provider-capacity bounds
for 60 and 120 seconds. These assume fixed recorded durations, independent calls
and no other work; they do not establish a feasible schedule or production speed.
An individual call longer than the target makes the fixed-duration slot bound
unavailable, even when aggregate capacity fits. Empty evidence means zero work,
not a successful edition.

For Nov 3, all 43 calls require at least 14 slots by aggregate capacity for
60 seconds (7 for 120 seconds). With ideal article caching, the remainder still
requires at least 5 slots for 60 seconds. Keeping four slots instead requires
removing at least 54,225 ms of aggregate HTTP work, about 18.4% of the remainder,
before a 60-second result is even possible. This reduction is an aggregate work
bound, not 54 seconds of wall-clock savings. Dependencies and non-provider work
can require further reductions. The 120-second remainder bound is 3 slots; that
does not prove the target at 1,500 candidates, which this recording did not cover.
No production concurrency, cache activation, prompts or provider calls changed.

## Iteration 628: recorded output-token baseline

Run `pnpm exec tsx apps/api/scripts/evaluate-call-output.ts
apps/api/test/fixtures/edition-call-output-2026-11-03.json` (one line).
The fixture contains only purpose, HTTP outcome/duration and output-token usage
from the same 43 Nov 3 worker calls and run ID documented above. This is a
metadata export, not re-recorded inference or raw model responses.

| Purpose        | Calls | Output tokens |
| -------------- | ----: | ------------: |
| Article triage |    17 |       133,175 |
| Story editing  |    10 |        24,917 |
| Social triage  |     6 |        21,663 |
| Social editing |    10 |        10,908 |

Ideal article caching leaves 57,488 output tokens at publication in this
recording, including 35,825 from editors. These totals are emitted work, not
avoidable tokens or a prediction of latency savings. Nov 3 did not record
output limits or completion reasons: reservation utilization and truncation
cannot be established, and HTTP success does not explain NBA validation.
The report keeps unknown usage distinct from observed zero, includes failed
work, and computes utilization only for calls with both usage and limits.
It also reports the highest per-call utilization and the count reaching or
exceeding the limit, so a low aggregate cannot hide a saturated call. Both
remain unknown without paired evidence; reaching a limit alone does not prove
truncation.
It can consume the newer allowlisted metadata when the Nov 4 run is available;
a reported `max_tokens` stop is counted without inferring stops from token totals.
No prompts, production limits, concurrency or activation changed; no paid calls.

## Iteration 631: connect the disabled incremental-triage worker

The production worker now calls the prepared entry point and drains it during
shutdown. Disabled mode still allocates no scoring resources or timer. Startup
configuration failures log an error and shut down the worker; tick failures are
reported without stopping ingestion. Shutdown waits for startup before draining.

`LLM_INCREMENTAL_TRIAGE_ENABLED` remains unset in production (default off), so
no background scoring or paid calls begin. Activation still requires the Nov 4
edition review. The existing reserve-safe ledger, shared admission, 25-item
limit, two-hour cutoff and private evidence export requirements are unchanged.
This connection establishes lifecycle readiness, not cache readiness, measured
scoring waste or a latency improvement.

## Iteration 632: reject incomplete incremental activation

Explicitly enabled background triage now rejects missing, empty or whitespace-only
Anthropic credentials at startup instead of silently returning a disabled service.
The default-off path still returns before reading credentials or touching the
database. Offline regressions use an inaccessible database proxy and no provider.
Production remains off pending the Nov 4 review; no timing or cost claim follows
from this configuration fix.

## Iteration 633: stop background cache scans at cutoff

The default-off incremental runner now checks the publication cutoff before
each cache chunk, and records a cutoff crossed during an empty cache read.
An in-flight read can finish; later chunks and scoring do not start. Shared
admission is released normally. Synthetic tests cover a 601-item scan crossing
the exact cutoff and a single empty chunk crossing it. No activation or paid calls.

## Iteration 634: pending threshold versus edition remainder

Offline replay compares minimum pending thresholds of 1, 10 and 25 while
keeping the prepared worker's 25-item pass cap and two-hour cutoff fixed.
Reproduce each variant with
`pnpm exec tsx apps/api/scripts/evaluate-incremental-triage.ts --minimum-pending=1 --stop-before-edition-hours=2 --maximum-items-per-pass=25`
(substitute 10 or 25), selecting the rows with `intervalHours: 1`.
The three Nov 1 recorded windows contain 153 articles in total.

| Minimum pending | Background items | Edition remainder | Background requests | Total requests | Input UTF-8 bytes | Reserved output tokens |
| --------------- | ---------------: | ----------------: | ------------------: | -------------: | ----------------: | ---------------------: |
| 1               |              121 |                32 |                  43 |             46 |           116,120 |                 66,628 |
| 10              |              102 |                51 |                   9 |             12 |            74,345 |                 26,102 |
| 25              |              100 |                53 |                   4 |              7 |            68,264 |                 26,488 |

Relative to threshold 1, threshold 25 removes 39 requests (84.8%) and
41.2% of input bytes, while leaving 21 more articles for publication-time
triage. Threshold 10 leaves two fewer articles than 25 but adds five
requests. Remainders differ by topic: NBA 2/6/2, World 18/25/22 and
Tech/AI 12/20/29 at thresholds 1/10/25. Waiting for a full batch therefore
does not produce a monotonic remainder for every topic.

These are synthetic scoring responses through the real request builder and
in-memory cache, using publication times as optimistic arrival proxies.
Every variant scores all 153 articles once. There are no observed pool
snapshots, so waste remains unknown. Each topic receives an independent
hourly pass here; the actual timer rotates topics and this is not a worker
schedule replay. Topic guidance is empty, Gaming is absent, and the recorded
volume is smaller than Nov 3. Bytes and reserved output are not billed
tokens or spend; request counts cannot establish a live duration.

Keep the prepared minimum of 1 and production activation off pending the
Nov 4 review. A higher threshold is an option to test against actual arrival
and cache evidence, not a production recommendation from this experiment.

## Iteration 635: rotating-topic sensitivity offline

The replay now accepts `--rotation-topics=4`, assigning each recorded topic
one of four possible turn positions on the common interval grid. Reproduce:
`pnpm exec tsx apps/api/scripts/evaluate-incremental-triage.ts --minimum-pending=1 --stop-before-edition-hours=2 --maximum-items-per-pass=25 --rotation-topics=4`
(substitute 10 or 25). Select `intervalHours: 1`. The first position runs at
hours 1, 5, 9, 13, 17 and 21; the others rotate after it. Exact cutoff ticks
are excluded. Every position scores each final candidate once through the
real cache/request builder with synthetic responses.

| Minimum pending | NBA remainder range | World remainder range | Tech/AI remainder range | Per-topic total request ranges (NBA / World / Tech) |
| --------------- | ------------------: | --------------------: | ----------------------: | --------------------------------------------------- |
| 1               |                 2–9 |                 18–25 |                   12–30 | 6–7 / 5–7 / 5–7                                     |
| 10              |                 2–9 |                 18–34 |                   12–30 | 3–5 / 2–3 / 2–3                                     |
| 25              |                2–27 |                 22–47 |                   29–54 | 2–3 / 1–2 / 2                                       |

These are independent per-topic phase envelopes, not an aggregate edition:
topics cannot all occupy the same turn. Gaming has no recorded fixture here;
the fourth slot represents its capacity consumption without scoring it.
Unlike independent hourly passes, rotation can leave an entire small topic
unprepared: World at threshold 25 in positions 2 or 3 has all 47 candidates
remaining at publication. This strengthens the case for measuring actual
arrival and turn timing before choosing a threshold.

This is a deterministic capacity sensitivity experiment, not a replay of the
live timer: it omits provider durations, overlapping ticks, restarts, budget
admission and changing topic membership. Publication times remain optimistic
arrival proxies; pool churn, waste, billed cost and live latency remain
unknown. Production settings and activation stay unchanged.

## Iteration 636: cutoff admission inside the scorer

The inactive background runner now supplies a live cutoff predicate to article
triage. The scorer checks it after its own cache scan and before each provider
batch, including later batches after an earlier call finishes. Previously the
runner checked only before entering the scorer, allowing cache reads to cross
the cutoff before provider work began. Already-started calls still finish and
cache valid results; untouched IDs remain explicitly unscored for a later pass.
Normal edition scoring has no additional gate. Synthetic tests cover blocked
admission, partial cache retention, subsequent completion and runner admission
release. No paid calls, production activation or latency claim.

## Iteration 637: incremental pass capacity sensitivity

Increasing the per-pass item cap above 25 does not reduce the edition
remainder in the three small recorded Nov 1 windows at any tested hourly
turn position. Reducing it to 10 leaves more work at publication. This tests the
number of items admitted per background pass, **not** the scorer's provider
batch size, concurrency, billed cost or live latency.

Reproduce each cap (10, 25, 50, 100, 200) with:

```sh
pnpm exec tsx apps/api/scripts/evaluate-incremental-triage.ts --minimum-pending=1 --stop-before-edition-hours=2 --maximum-items-per-pass=25 --rotation-topics=4
```

Change only `--maximum-items-per-pass`. The table uses `intervalHours=1`
(hourly global ticks, each topic every fourth tick), with positions 0–3
listed in order. Other settings match iteration 635.

| Per-pass cap | NBA edition remainder | World edition remainder | Tech/AI edition remainder |
| ------------ | --------------------- | ----------------------- | ------------------------- |
| 10           | 2 / 10 / 10 / 6       | 19 / 25 / 25 / 22       | 27 / 35 / 34 / 32         |
| 25           | 2 / 9 / 6 / 3         | 18 / 25 / 25 / 22       | 12 / 30 / 25 / 20         |
| 50, 100, 200 | 2 / 9 / 6 / 3         | 18 / 25 / 25 / 22       | 12 / 30 / 25 / 20         |

All hourly comparisons retain the same request counts at each position:
NBA 7/6/6/6, World 7/6/5/6, Tech/AI 7/5/6/6 (background plus edition).
Prompt bytes are identical for caps 25–200. The smaller cap mostly moves
items between requests rather than removing requests. These small windows
provide no evidence that raising the cap above 25 would accelerate the real
edition; they also cannot rule out a benefit on larger actual arrival pools.

Assertions over all 240 replay rows (five caps, three topics, four intervals,
four positions) confirmed every final candidate scored once, zero repeat
scoring, and unknown waste without arrival/pool evidence. Scores are
synthetic; publication times remain arrival proxies. Independent position
comparisons are not simultaneous editions or measured production turns.
No configuration, source, prompt or activation changed; the Nov 4 review
and actual arrival/cache evidence remain prerequisites to choosing settings.

## Iteration 640: caller barriers and provider capacity

The offline batching report now emits cold `requestsPerPass` and
`equalDurationRounds` at 1, 2 and 4 provider slots. Rounds sum
`ceil(requests / slots)` separately for each sequential caller pass; they
cannot pool spare slots across caller barriers. Cache-only repeat passes are
excluded. This models equal-duration independent calls, not provider latency,
queue contention, cost or quality. Production settings remain unchanged.

Reproduce: `pnpm exec tsx apps/api/scripts/evaluate-triage-batching.ts`.
The same recorded Nov 1 windows and empty guidance from iteration 553 apply.

| Caller chunk | NBA requests / four-slot rounds | World requests / four-slot rounds | Tech/AI requests / four-slot rounds |
| ------------ | ------------------------------- | --------------------------------- | ----------------------------------- |
| 10           | 6 / 6                           | 5 / 5                             | 6 / 6                               |
| 25           | 3 / 3                           | 2 / 2                             | 3 / 3                               |
| 50           | 2 / 2                           | 1 / 1                             | 2 / 2                               |
| 200          | 2 / 1                           | 1 / 1                             | 2 / 1                               |

At chunk 200, two slots already reach the same modeled rounds as four in
these small windows. At chunk 50 or below, additional slots cannot help
because every caller pass makes just one request. Thus request counts alone
hide the serialization introduced by smaller caller chunks. This does not
establish the best setting for larger pools or actual arrivals. Synthetic
regressions cover a partial final pass (201 items), byte-bound splitting,
empty work and cache-preserving repartitioning. No paid calls or activation.

## Iteration 641: partially warm item caches and caller barriers

`pnpm exec tsx apps/api/scripts/evaluate-triage-batching.ts` now compares
cold, prefix-half and alternating-half synthetic cache preparation on the same
three recorded Nov 1 windows. Preparation uses the real item fingerprints but
synthetic scores, excluded from publication request totals. These patterns are
sensitivity probes, not observed incremental-triage hit rates or paid usage.

Both half-warm patterns leave NBA 26, World 23 and Tech 27 candidates. At caller
chunk 50, publication still needs 2/1/2 requests (the cold counts), because
remaining items straddle caller boundaries. Chunk 200 consolidates each topic
into one request, versus cold counts 2/1/2. Fewer remaining items alone therefore
do not establish fewer requests or lower latency. A synthetic 200-item probe
also shows placement matters: 100 prefix cache hits leave two requests at chunk
50; 100 alternating hits leave four. All-warm pools make no requests, and
repartitioned repeat scoring retains every cache hit. No production setting,
prompt, feature activation or provider call changed; bytes/rounds are not cost
or live timing evidence.

The batching replay now reports `preparation` and `combined` request counts,
serialized input bytes, scored items and output reservations alongside the
publication-only totals. This includes the work shifted before publication;
it is not a dollar estimate (bytes are not tokens, reservations are not usage,
and provider prompt-cache discounts are not modeled). Warmup uses synthetic
scores and packs the supplied warmed IDs into 200-item caller passes; it does
not model hourly arrival fragmentation or items that expire unused.

At chunk 200, the recorded cold NBA/World/Tech pools require 2/1/2 requests
and 16,889/27,640/21,295 input bytes. Either synthetic half-warm pattern leaves
one publication request per topic, but preparation plus publication requires
2/2/2 requests and 16,881/28,881/21,289 bytes. World therefore shifts work
without reducing publication request count and adds 1,241 input bytes; NBA
and Tech mostly shift one existing request earlier. Small byte differences
also reflect batch-local wire IDs. These small recorded pools demonstrate
why publication-only savings cannot establish a total-cost improvement.
No live hit rates, latency, waste, spending or production setting changed.

### Per-pass incremental backlog trace (iteration 643)

The offline incremental replay now reports every background tick and the final
publication pass: time, eligible pool size, pending count, actually scored items,
provider-shaped requests, and outcome (scored, cached, threshold, rotation or
cutoff). Cutoff takes precedence over rotation. Skipped ticks only inspect the
synthetic cache; they perform no scoring and do not change the scheduling totals.
Trace request/item totals reconcile with the aggregate report.

Reproduce with `pnpm exec tsx apps/api/scripts/evaluate-incremental-triage.ts
--minimum-pending=25 --stop-before-edition-hours=2
--maximum-items-per-pass=25 --rotation-topics=4` (one shell line).
At hourly interval/rotation offset 1, World's last eligible assigned tick has
22 pending items and Tech's has 24: both defer under the threshold of 25.
Their publication passes therefore score all 47/54 candidates. NBA scores 25
at its 06:15 tick, then defers pending counts of 7 and 18; publication scores 27. This explains the earlier aggregate rotation sensitivity rather than
measuring an observed production backlog. Fixture publication times remain
optimistic arrival proxies, scores are synthetic, and no billed cost or live
latency is established. Production settings remain unchanged.

### Attribute preparation waste to passes (iteration 644)

Each background replay pass now reports `reusableVersions` and
`wastedVersions` against the final publication pool. Attribution uses the
actual item-cache keys written by that pass and read by the final cache probe,
so reverted scoring inputs credit the original pass, not the latest pass for
that article. A synthetic two-article replay prepares both original and changed
versions, then publishes only the original kept article: pass one has one
reusable/one wasted version, pass two zero reusable/two wasted versions.
The cached third pass produces neither; the three wasted versions reconcile
with the existing aggregate. Skipped passes report zero when snapshots exist;
without complete pool snapshots, these fields remain unknown (`null`). Edition
passes use `null` because they are not preparation. These are synthetic cache
work counts, not measured provider dollars, expiry waste or live latency.

## Iteration 646: Nov 4 scheduled outcome checked

[Full edition evidence](edition-reviews/2026-11-04.md): 701 article candidates,
151.532 s and $0.291162, with NBA still non-AI. Exact reconstructed NBA editor
fingerprints match four live `unsupported-absence` rejections: initial and
repair for both Sonnet and Haiku. NBA triage is complete; rejected sentences
were not stored, so their factual validity cannot be inferred. The fallback
includes a quiz and overlapping power rankings. The run's 43 Anthropic HTTP
calls total 506,615 ms, giving a four-slot aggregate lower bound of 126,654 ms;
no higher-concurrency speed prediction is claimed.

None of today's 19 paid open-X discoveries was selected. World posts remain
empty; Tech's first selected Bluesky post duplicates an X selection. The Nov 4
review gate is checked, with full-AI, speed and social-quality acceptance open.
Same-story grouping and incremental triage remain off; fix NBA before claiming
item 7 complete or proceeding with grouping activation for Nov 5.

### Iteration 647: numeric rank abbreviation false positive

The lexical absence guard now distinguishes numeric ranks such as “No. 1”
from negative claims. Sentence splitting keeps that abbreviation attached to
its number, so genuinely negative ranked sentences still require complete
verbatim cited evidence, including attribution and scope. Synthetic guard and
editor tests cover rank acceptance without repairs, retained negative rejection
and attribution preservation. This is a demonstrated false-positive repair,
not proof of the Nov 4 NBA failure's wording: rejected responses were not saved.
No prompt, provider, budget or immutable edition changed; scheduled full-AI
acceptance remains open until a later real run.

### Iteration 648: bounded NBA rejection diagnostics

Future absence-support rejections identify the editorial field (headline,
summary, whyItMatters, rationale or brief) and the first matching marker class
(negative word, negative contraction or absence phrase). Both the retained
32-entry diagnostics and `llm.validation` logs use runtime-allowlisted labels;
no rejected sentence, source text or exception message is retained. Article
and social editors attach these labels to the existing initial/repair/cache
failure path. These are diagnostic additions, with unchanged acceptance,
repair prompts, fingerprints, provider calls and budget rules. Fake-provider
tests verify field propagation, all three marker classes, repair attempts and
rejection of untrusted runtime labels. Nov 4's exact rejected wording remains
unavailable; no new live inference was run to reproduce it.

## Iteration 649: opt-in publication grouping path

Publication composes the evaluated Haiku grouping pass behind a strict,
default-off `LLM_STORY_GROUPING_ENABLED` switch. After complete triage, it sends
only the existing semantic shortlist (at most ten articles), then ranks explicit
memberships into story slots before editing. No extra candidates, title rules,
transitive joins or coverage score bonuses are introduced. Coverage links are
preserved in the immutable snapshot; editor evidence remains restricted to the
ranked candidates supplied to it. No grouping runs for incomplete triage or
zero story budgets. Disabled, failed, refused or invalid grouping leaves each
article separate. All calls use the ordinary shared ledger/cache and edition
run identity, including reserve and daily/monthly admission; no additional funds
or paid verification calls are introduced. No repairs are added.

Fake tests cover configuration, bounded inputs, invalid/overlapping membership,
provider failure, preserved coverage and unchanged scores. The isolated
publication test checks grouped coverage survives editing and persistence.
The switch remains off; activation, budget impact, live quality and screenshots
must be checked separately before claiming the Nov 5 grouping milestone.

## Iteration 650: activate evaluated grouping for Nov 5

After the Nov 4 edition review and the passed same-story evaluation, production
sets `LLM_STORY_GROUPING_ENABLED=1`; code still defaults off. No new edition
was requested. The existing four-topic publication path permits at most four
grouping calls with no repair. Each input admission bound is below 100,000
UTF-8 bytes including framing; the ledger conservatively charges that bound
at the current Haiku cache-write rate ($0.125/M), plus 4,096 output tokens
at $0.50/M: at most $0.014548 per call, $0.058192 across four topics.
Nov 4 settled spend is $0.291162, with no holds and $0.196315 headroom.
That edition cost plus the grouping bound is $0.349354, below the current
$0.487477 daily cap. Existing 1.5x historical reserve sizing is already capped
at the full daily allowance, so increasing its configured amount cannot
protect more. Daily/monthly admission still applies to every call; this is
a conservative planning bound, not a promise that future volume or concurrent
editor reservations will fit. No budget or model configuration changed.

Nov 5 must establish actual grouping requests/charges or refused admission,
validate persisted coverage and same-story accuracy, compare edition latency,
and capture desktop/mobile screenshots of real grouped stories. Today's
immutable edition remains unchanged. NBA full-AI acceptance and World social
coverage remain unresolved. Incremental triage remains off.

### Iteration 653: field-specific absence repair guidance

The existing single repair now names the rejected editorial field using a
closed mapping of application-owned text. It gives field-appropriate guidance
for rewriting supported facts, including significance, selection rationale and
brief bullets. It still asks the model to review every field and return the
complete JSON. Unknown runtime field labels receive only generic guidance; no
rejected response, source sentence or exception text is added. Acceptance,
model order, reservations and call limits are unchanged. Fake editor tests
verify repaired responses, the field hints and rejection of untrusted labels.
This addresses the generic feedback in the demonstrated Nov 4 NBA repair
failure; actual full-AI acceptance awaits the next scheduled edition.

## Within-selection social repetition (iteration 654)

The Nov 4 Tech section selected five posts about the same story. The shared
social editor now explicitly compares candidates before choosing: select the
strongest single post for a repeated announcement, clip, scoop or moment,
including repetitions within one platform. A new author, commentary or
rewording alone does not add a distinct development; distinct developments
about the same subject may still qualify. Return fewer posts rather than
filling slots with repetitions. This supplements the existing cross-platform
context supplied to Bluesky.

This is semantic prompt guidance, not a deterministic duplicate detector or a
claim that future editions will be diverse. Changed instructions naturally
change request fingerprints; cached old selections are not reused. Selection
validation, original post text, candidate limits, call counts, model order and
budget caps are unchanged. Existing fake editor tests verify identity, cache
reuse, fallback, bounded context and validation; no paid replay or live quality
measurement was performed.

## Iteration 655: incremental admission decision after Nov 4

[The read-only assessment](edition-reviews/2026-11-04-incremental-admission.md)
finds no qualifying full-AI edition cost measurements. The pending Nov 5
reserve therefore protects the whole projected daily cap, leaving zero
background allowance; today's released $0.196315 would fund only the earlier
UTC portion of the next window. Keep incremental triage off without weakening
the scheduled reserve. A private prospective pool capture records 65 eligible
articles across all four topics and zero matching current cache rows. This is
not a final pool, scoring, cache consumption, waste or latency measurement.
Reassess after full-AI acceptance supplies reserve evidence. No paid calls.

Final social editing now receives bounded saved engagement evidence: X ranking explanations retain unverified search provenance and unknown-count semantics; Bluesky supplies timestamped API counts. Counts are advisory and do not establish growth, account-relative reach or virality. Fake request/cache and caller propagation checks cover this path; selection quality still awaits the next scheduled edition.

## Social fallback respects completed triage (iteration 657)

When social triage completes but editing is unavailable within caps or fails
validation, lexical fallback now retains only posts meeting the same relevance
(6/10) and interestingness (4/10) gates used for the editor shortlist. Rejected posts cannot return through degradation. Incomplete triage
still retains the original lexical fallback; no unavailable score is treated
as a rejection. The stored explanation distinguishes this gated fallback.
Synthetic tests cover both thresholds, absent scores, an empty fallback result,
identity and input preservation. This fixes a degradation path; it does not
claim that the Nov 4 edition used it or that future World coverage improves.
No paid calls, model changes or additional selection requests.

Iteration 658 corrects Bluesky instruction specialization: it replaces only platform provenance, retaining the shared engagement-evidence guidance. The previous broad replacement incorrectly said engagement was absent despite the timestamped API counts added in iteration 656. Saved counts remain advisory; missing counts, growth, usual reach, virality and unseen media retain their uncertainty rules. Fake-request regression verifies the actual Bluesky prompt and evidence. No paid calls; live selection effects remain unmeasured.

Iteration 659 requires exact triage coverage before applying those completed
semantic gates to X/Reddit selection: every candidate must have exactly one
score, with integer relevance and interestingness in 0–10 and no unknown IDs.
Missing, duplicate, foreign or invalid scores retain the original lexical
fallback and skip final editing, matching Bluesky's existing completeness
check. Missing IDs are included in immutable unscored metadata even if the
triage adapter omitted them. Synthetic malformed-result tests verify this;
no live failure or selection improvement is claimed.

Iteration 660 validates final X/Reddit editor selections against the actual
shortlist, rather than the full triage pool. Unknown IDs, triage-rejected IDs,
qualifying IDs outside the bounded shortlist, duplicate picks and over-budget
results retain the gated fallback with a non-AI explanation. Synthetic tests
cover these cases; no live selection effect or additional paid call is claimed.

## Fully rejected social pools (iteration 661)

When complete social triage leaves no candidate above both selection thresholds,
selection stops before final editing. The saved result keeps all triage scores
and explains that no post qualified, with no final editor model. Previously the
production editor returned an empty result with model `none`, which orchestration
labelled AI-edited. This changes selection provenance, not paid-call volume:
the production editor already skipped LLM requests for empty pools. Synthetic
coverage checks both rejection thresholds and prevents any editor invocation.

### Iteration 663: compact long social-editor identities

Social editing replaces IDs longer than 32 characters (notably Bluesky AT URIs)
with short request-local aliases. Existing short IDs are reserved before aliases
are allocated, preventing collisions. Only supplied wire IDs validate; selections
are mapped back to exact original IDs after fresh or cached response validation.
Post text, engagement evidence, budgets, model order, absence validation and the
4,000-token output limit stay unchanged. Whole-request cache fingerprints change
when wire prompts change; no paid cache warming was performed. Synthetic tests
cover collisions, exact identity restoration, unchanged inputs, cache hits and
rejection of an original long ID returned instead of its wire alias. This reduces
serialized ID bytes, not a measured token/cost/latency improvement. Lowering the
output cap was deferred because field character limits do not establish a safe
smaller token bound for arbitrary text.

### Iteration 664: bulk triage cache reads

Article and social triage now use an optional ledger bulk-read capability for
both scoring and read-only pending probes. The PostgreSQL adapter resolves a
bounded pool (at most 200 items) with one query instead of one per candidate;
empty pools do no reads. Adapters without this capability retain single-key
reads. Item fingerprints, score schema, exact identity checks and missing-item
provider batching are unchanged. A bulk-read failure propagates before any
provider request rather than silently converting cached hits into paid misses.

Synthetic coverage mixes valid hits, wrong identities, malformed responses and
missing rows in reverse order, then checks scoring, probes and read failure for
both article and social modes. Isolated PostgreSQL coverage checks mixed hits,
missing/duplicate keys and empty input. This reduces database round trips;
no paid calls or live edition duration improvement are claimed.

Iteration 665 carries this optional capability through the incremental scoring
evidence wrapper, preserving the ledger receiver. Cold/warm/changed-input
scoring uses bulk reads while only successful new writes enter work evidence;
read failures propagate and single-key adapters remain supported. The prepared
incremental runtime remains disabled; no live latency improvement is claimed.

### Iteration 666: atomic triage cache writes

Article and social triage save each validated provider batch with one optional
bulk cache operation, replacing up to 50 sequential item inserts. PostgreSQL
uses one atomic insert with conflict-ignore semantics: existing responses stay
immutable, duplicate keys keep the first supplied response, and an invalid JSON
value rolls back the entire batch. Single-write adapters retain their behavior.
Fingerprints, prompts, output limits, scores and budgets are unchanged.

The incremental evidence wrapper forwards bulk writes and records article work
only after commit; failed writes release duplicate guards for retry. Synthetic
checks cover original-ID restoration, warm reuse, retry after atomic failure,
sibling write draining and committed-only evidence. Isolated PostgreSQL checks
cover conflicts, duplicate keys, empty input and whole-batch rollback. No paid
calls or measured live edition speed improvement; incremental triage stays off.

### Iteration 667: linear batch-size accounting

Triage measures each serialized wire item once while packing batches, adding
commas and the fixed prompt framing exactly. A split resets batch-local IDs
before sizing the first item. This replaces repeated serialization of growing
prompts while preserving the 50-item/60,000-byte limits, exact prompts, cache
keys and provider requests. Differential synthetic checks compare every prompt
against the former full-serialization algorithm in article and social modes,
with 200 short or Unicode/escaped long candidates. No paid calls or measured
live latency improvement; incremental triage remains disabled.

### Iteration 668: repair invalid social selections

Nov 4 journal evidence for request
`80f66b954fef88d7ecabe7c50ce6136bb4e576fa25e0547906788ef0273e2c64`
links a `bluesky-social-editor-v1` Sonnet call (6,758 ms) to initial and repair
`validator-error` rejections. The social validator throws those errors for
unknown candidate IDs, duplicate IDs or excess picks; schema and absence
failures have separate categories. The rejected output was not saved, so the
specific violation and topic are unknown. This is not evidence of an outage.

Those checks now emit `invalid-social-selection` with a fixed repair hint:
use candidate IDs once, respect the budget and aliases, and allow fewer or
zero picks. No rejected text, IDs or error messages enter feedback. Initial
prompts/cache keys, support checks, model order, output limits and one repair
per model are unchanged. Fake X/Bluesky tests recover on repair for each
violation, reuse the valid cache and retain four-call maximum failure. No paid
calls or measured live latency improvement; compare the Nov 5 repair tail.

### Shared-context triage fingerprints (iteration 669)

Article and social item fingerprints now serialize and hash the common topic,
model and instructions once per pool, then copy that hash state per item.
The JSON bytes and resulting cache keys remain identical to the former
whole-object algorithm. Differential tests cover 200 escaped/Unicode and
truncated candidates per mode, reversed probes and warm scoring. A local
synthetic benchmark of 60,000 candidate fingerprints took 1,718 ms before
and 536 ms with shared context; this measures CPU preparation only, not
provider or live edition latency. No paid calls or prompt changes.

## Triage coverage repair (iteration 672)

Article and social triage now classify well-formed score arrays with missing,
duplicate, extra or non-batch IDs as `invalid-triage-coverage`. The existing
single budgeted repair gets fixed guidance to return every batch-local ID
exactly once, including low-relevance items, rather than using original IDs.
Schema-invalid scores still fail schema validation. No rejected text or IDs
enter feedback or diagnostic logs. Initial prompts and cache identity stay
unchanged; successful repairs restore original IDs before item caching.

Offline fake-provider checks cover all four defects for both kinds, complete
recovery and subsequent cache reuse. No production failure count or speedup
is inferred; the next scheduled edition supplies the live evidence.
