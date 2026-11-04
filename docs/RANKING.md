# Ranking evaluation

Current grouping state (STEERING 27, iteration 483): production keeps articles
separate. The inactive AI pass is restored with a same-story definition that
includes direct follow-ups, reactions and consequences, while keeping separate
stories that only share people, organizations or themes apart. No production
caller exists. The 195-pair same-story review is complete; the new capped
evaluation remains pending. The
Nov 4 run must be checked before any conditional Nov 5 activation.
Wording matchers remain removed. Canonical-URL ingestion dedupe continues.
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
