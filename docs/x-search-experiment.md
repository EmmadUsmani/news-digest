# X search experiment preparation

The [owner-approved plan](x-search-plan.md) defines the comparison and decision rule.
Round 1 dispatch is authorized by STEERING 31. Production discovery is unchanged.

## Implemented admission

`scripts/lib/x-experiment-budget.ts` provides standalone experiment accounting,
separate from the production database ledger. Amounts are integer USD micros.

| Operation                 | Behavior                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Reserve                   | Checks $1 per UTC day, $2.50 lifetime and the 13:00–16:00 UTC exclusion before saving a unique request ID                   |
| Dispatch claim            | Rechecks protected hours and reservation UTC day; durably records one claim and refuses retries or settled/overrun requests |
| Settle                    | Saves known actual usage once and releases unused reservation                                                               |
| Unknown outcome           | Keeps the full reservation; no automatic release; one separately admitted timeout retry                                     |
| Cost above reservation    | Saves the actual cost and blocks further admissions                                                                         |
| Restart                   | Reads persisted reservations and settlements                                                                                |
| Locked or damaged journal | Refuses admission; never replaces damaged evidence or reclaims stale locks                                                  |

Updates use an exclusive directory lock, private temporary file, file sync,
atomic rename and directory sync on the VM's local filesystem.

## Offline report

`scripts/lib/x-experiment-report.ts` summarizes saved call evidence without
HTTP or model calls. It preserves topic, model, style, exact window and actual
tool inputs; reports fetched versus returned posts, observed median/maximum
likes, window and relevance ≥6 shares, promotions, and in-window,
triage-passing, non-promotional posts per dollar. Likes remain provider-reported.

Window boundaries and known publication timestamps require ISO instants with
`Z` or an explicit UTC offset; local-time and date-only values are rejected.
Missing timestamps, triage scores or promotion reviews remain unknown and
prevent a complete eligible-yield result. Missing likes are counted separately;
medians use observed counts only. Duplicate request/post IDs are rejected within
a call/report, while a post appearing in different styles remains measurable in
each. No winner is selected from an incomplete single-day comparison.

With `expectedSearch` settings, the report also checks every saved adapter
`{name, input}` record for keyword search, Top, the exact threshold, filters,
exclusions and story OR. Missing/unreadable inputs remain unknown; assistant
prose and requested settings never count as execution evidence. A confirmed
violation stays false even when another tool record is unreadable; unknown
evidence cannot erase an observed failure. It separately
counts returned posts below the threshold and unknown likes. Matching inputs
and reported counts alone do not prove X honored the operators.

Missing publication times are decoded from modern X Snowflake IDs with the same
helper as production. Supplied times remain unchanged; `publicationTime` counts
supplied, ID-derived and unknown dates per call. Legacy, invalid and future IDs
stay undated. This metadata does not verify post existence or official embeds.

The runner must supply saved triage/review labels; this report creates none.
All current report tests use synthetic evidence, not live experiment results.

Run the offline command against a saved JSON array of `XExperimentEvidence`
records (the interface is in `scripts/lib/x-experiment-report.ts`):

```sh
pnpm exec tsx apps/api/scripts/report-x-experiment.ts /private/path/evidence.json > /private/path/report.json
```

It validates the complete input before writing JSON to stdout, preserves unknown
labels as `null`, and exits nonzero on invalid input without echoing its contents.
It reads no secrets and imports no application services. It neither modifies the
evidence nor selects a winner. Keep input and output outside the repository;
reports contain saved queries and post IDs. An empty array reports no calls.

Optionally supply a second JSON array describing comparison rounds:

```sh
pnpm exec tsx apps/api/scripts/report-x-experiment.ts /private/path/evidence.json /private/path/rounds.json > /private/path/report.json
```

Each round has `model`, four distinct `topicIds`, and `calls` containing
`requestId` and timezone-qualified `startedAt` (saved dispatch time). A complete
round requires exactly one call per topic/style, the same model and edition
window, dispatches within one hour and one UTC day, and every search starting
at or after its window end. Premature calls are listed by request ID and block
complete-round coverage and comparable yield, while still counting toward spend.
Missing/duplicate cells,
window mismatch and elapsed time are reported; unknown/reused request IDs or
mislabelled topics/models fail validation. Unassigned evidence is listed.
`twoDayCoverage` requires complete rounds for the same model and four topics on
different UTC days and non-overlapping news windows. Repeating the same window
on a later dispatch day cannot satisfy the second-news-day requirement. Round
summaries include the normalized window (or null if inconsistent). This checks
structural coverage only, not operator behavior,
threshold calibration or model acceptance, and never selects a winner.
Confirmed promotions fail the zero-promotion check even beside unreviewed posts.
Per-style totals retain unknown review labels; comparable yield per dollar is
withheld for incomplete rounds. Current tests use synthetic rounds only.

`guardrails` reports saved-call total spend against $2.50, assigned UTC-day
spend against $1, and dispatches during 13:00–16:00 UTC. All rounds share
the daily totals. Unassigned calls count toward total spend but leave compliance
unknown unless a violation is already known. This checks only supplied evidence;
it does not replace the admission journal, outstanding holds or a complete ledger.
Structural coverage remains separate from budget/time compliance.

## Extract a saved round without dispatch

```sh
pnpm exec tsx apps/api/scripts/extract-x-experiment.ts /private/path/round-directory > /private/path/evidence.json
```

Reads the runner's `round.json`, prepared settings, requests, responses and
settlements. It extracts all cited X IDs (including more than five per call),
reported counts/dates and actual tool calls into the offline report format.
Only assistant URL citations create candidates; prose URLs do not. Duplicate
metric observations remain unknown. Relevance and promotion labels stay null.
Unknown-outcome calls absent from the settled manifest remain absent; their
budget holds stay in the admission journal. The command performs no network,
provider, database or journal writes. Invalid input produces no partial stdout.
Store output privately and separately from reviewed/scored evidence.

Iteration 715 replayed round 1: all 11 calls/47 posts match the original
costs, fetched counts, tool calls and post fields exactly. Private output is
`extracted-evidence-715.json` beside the original round, mode 600.

## Prepare topic requests without dispatch

```sh
pnpm exec tsx apps/api/scripts/prepare-x-experiment.ts START END > /private/path/inputs.json
```

START and END require explicit timezones. The read-only repeatable-read snapshot
uses enabled owner topics and saved thresholds/exclusions. It prepares only
`viral` (16 keyword results) and test-only `semantic` (8 results) requests from
topic descriptions. Both use Grok 4.3, the same exact publication window and
saved likes minimum; semantic requests also carry the topic exclusions and
mandatory -giveaway. No articles or cached article triage are loaded or required.
Provider date filters enclose the exact window; its end remains exclusive.
Missing settings fail the snapshot. No AI calls, cache writes, admission or
dispatch occur. Store the output privately; it contains topic settings and prompts.
The runner, call report and round comparison accept these inputs. No dispatch before the plan’s scheduled test windows.

Historical article preparation (before iteration 721):

Iteration 691's Nov 3–4 15:00 UTC snapshot returned two distinct ranked titles
for each of Tech, NBA, Gaming and World, with saved A/B thresholds 50/500,
100/1000, 50/500 and 200/2000 respectively. No experiment calls were made.

## Provider bound investigation (Nov 4)

The [official X Search documentation](https://docs.x.ai/developers/tools/x-search)
describes `max_turns` as reducing search rounds, not bounding fetched posts.
It counts repeated, parent, quoted and thread posts and profiles; its example
reports 44 posts and three profiles for two search calls. Requested result
counts and prompt instructions therefore do not establish a hard cost bound.
STEERING 31 accepts this per-call exposure and authorizes a $0.15 reservation
per call. A provider-enforced per-request bound is no longer a dispatch prerequisite.
The existing journal enforces $1/day and $2.50 total admission. Any settlement
above $0.15 stops the experiment; unknown outcomes retain their holds.

## Live runner

Load the configured secrets environment, prepare the inputs above, then run:

```sh
X_EXPERIMENT_LIVE=1 pnpm exec tsx apps/api/scripts/run-x-experiment.ts /private/path/inputs.json
```

The runner uses Grok 4.3 for the four-topic viral/semantic comparison (eight calls),
within one hour. It reserves $0.15 and claims dispatch through the existing
journal before each request and settles known token/post/profile usage. A timeout
or unconfirmed zero-post search gets one separately admitted retry; completed
empty searches never retry. Other errors and over-reservation settlements stop
dispatch. To continue only never-attempted cells within
the same hour, append the existing round directory name as a second argument.
Previously saved requests are skipped, including unknown outcomes; their holds
remain charged. The completed manifest lists settled calls only, so unknown
cells remain gaps in comparison coverage.

### Authorized Nov 5 keyword reruns

STEERING 39 authorizes one rerun each for NBA, Gaming and World on the
original Nov 4–5 21:00 UTC window. On Nov 6, outside 13:00–16:00 UTC, use:

```sh
X_EXPERIMENT_LIVE=1 pnpm exec tsx apps/api/scripts/run-x-experiment.ts /private/path/inputs-2026-11-05.json --nov5-keyword-rerun
```

This mode checks the unchanged original saved inputs, selects only those three
keyword cells and adds required tool choice. It uses the shared journal and
120-second deadline, with no further retry for these already failed cells.
Evidence is saved separately in `nov5-keyword-rerun/`; original calls and holds
stay intact. Repeating the command continues only never-attempted cells within
the same dispatch hour. It cannot dispatch a cell twice.

All runs share `~/.local/state/news-digest/x-experiment/budget.json`.
Private timestamped directories hold the prepared inputs, dispatched requests,
raw responses, actual usage and completed round manifest. Directory mode is 700;
files are 600. Keys and request headers are never saved. Calls are separate from
production discovery and do not ingest posts or write the production ledger.

Saved responses still need offline evidence extraction and social scoring.
Under STEERING 39, relevance ≥6 and interestingness ≥4 count as non-promotion;
no manual promotion label is required. Unscored candidates do not establish
usable yield, and dispatch completion does not establish a winner. Repeat on a second non-overlapping news day, then
apply the decision rule in the revised plan. Grok 4.3 stays unchanged.

## Round 1 — Nov 4, iteration 703

Window: Nov 3 21:00 through Nov 4 21:00 UTC. Twelve cells dispatched at
21:46–21:53 UTC (440.773 seconds between first and last dispatch).
Eleven settled for **$0.382331**; Gaming current has no response and retains
**$0.15**, for **$0.532331 charged**. It was never retried. The runner stopped
on the transport failure, then continued only never-attempted cells. No known
call exceeded its reservation; maximum settlement was $0.056935.

| Style           | Settled calls | Fetched / cited |      Cost | Observed median / max likes |
| --------------- | ------------: | --------------: | --------: | --------------------------: |
| Current         |             3 |         13 / 13 | $0.101068 |                      8 / 42 |
| Topic trending  |             4 |         32 / 32 | $0.226258 |                1714 / 16089 |
| Story reactions |             4 |           2 / 2 | $0.055005 |                     unknown |

Counts are provider-reported; experiment posts were not verified or ingested.
Trending has five unknown like counts; current has eight. Relevance and
promotion labels remain unknown. All four trending tool inputs used Top and
correct thresholds, but joined the topic directly to `-filter:replies`, failing
the exact filter check. All four reaction tool inputs match Top, thresholds,
filters, exclusions and OR; this does not establish X's execution semantics.
World reaction inputs include an off-topic NFL title from heuristic article
ranking; inspect the prepared article pool before selecting production parameters.

**No winner:** Gaming current is unresolved, reviews are incomplete and the
trending query construction needs correction. No extra paid retry or threshold
change was made. The next independent news day, calibration and model comparison
remain open under the original caps; the unknown hold stays charged.

Evidence: `~/.local/state/news-digest/x-experiment/2026-11-04T21-46-02-565Z/`.
It includes raw responses, requests, settlements, `evidence.json`, `rounds.json`
and `report.json`. The offline report deliberately excludes unknown cost from
settled totals; the admission journal remains authoritative for charged holds.

## Query separator correction — iteration 704

New comparison requests include a code-built `queryTemplate` with the space
before `-filter:replies` preserved inside the operator suffix. Grok replaces
only the keyword placeholder. This corrects the ambiguous concatenation in
round 1; saved round-1 requests and results remain unchanged. The current
baseline request is unchanged. No paid rerun was made. Actual tool-call
compliance still needs checking on the next independent news day.

## Disabled schedule preparation — iteration 705

A pure planner now prepares A requests from the top two or three distinct
ranked article titles, followed by B requests. It takes stored thresholds and
exclusions without defaults, reuses the pre-edition window, and projects the
caller-supplied reservation against available budget. A comes first; B drops
from the quietest article pools first. Missing settings skip the topic; fewer
than two distinct stories skip A. Both styles use the comparison request
builder, including the code-built operator suffix.

This is preparation only, off by default and disconnected from running services.
The runtime setting, durable A/B admission and executor wiring remain to build;
the old follow-up path remains active until replaced. The experiment decision
still gates activation. No paid searches or production configuration changes.

## Direct adapter preparation — iteration 706

The direct xAI adapter accepts explicit fixed A/B request configuration and
uses the same request builder as the experiment. Legacy requests retain their
existing body. Both paths preserve provider usage, citations and actual tool
inputs; fake HTTP checks cover A/B dispatch and rejection before dispatch.
No scheduler supplies this configuration yet. Runtime settings, durable A/B
admission and scheduler replacement remain; activation still requires the
experiment decision. No provider calls were made for this preparation.

## Durable fixed-slot admission — iteration 707

The ledger now admits one fixed reactions call and one fixed trending call per
topic and UTC day, under the existing shared production caps. Rejected and
uncertain calls consume their slot across restarts. Fixed calls need no optional
parent; legacy and fixed schedules cannot both consume a topic on the same day.
The generated Drizzle migration preserves existing calls and legacy admission.
Iteration 708 wires the worker runtime behind `X_FIXED_SEARCH_ENABLED=1`
(default off). Enabling replaces the legacy open/followup path entirely, with
A before B, live budget checks, exact article windows, settings/time rechecks
and the same reserve/settle/verify pipeline. Consumed A slots cannot hide B on
later ticks. Production remains off; experiment decision still gates activation.

## Visible-text review — iteration 710

[Round-1 review](edition-reviews/2026-11-04-x-experiment-review.md) records
47 successful official oEmbed lookups, six definite promotions and the World
article-pool diagnosis. Private reviewed evidence preserves unknown social
triage scores and unresolved promotions; original responses remain unchanged.
Current/trending raw candidates fail the zero-promotion check. No winner,
paid rerun, production activation or parameter changes.

## Cached reaction inputs — iteration 711

Experiment preparation now reads saved article-triage scores in the same
read-only snapshot, using the edition's exact topic/model/content fingerprint.
Changed guidance, content or model cannot reuse stale scores; corrupt or
wrong-identity cache entries remain unscored. No provider or cache writes.
The production reaction loader and fixed-schedule flag are unchanged.

On the original Nov 3–4 21:00 UTC window, World's first three titles now cover
the midterm result (saved relevance 10, importance 9), replacing the NFL lead.
The current snapshot has 80 cached eligible World articles; it is not the
original round's historical state. Prepared inputs and queries from round 1
remain unchanged. Repeating that window does not count as the second news day.
Private evidence: `cached-inputs-711.json` beside the original round. No paid
rerun, threshold adjustment, new wording rule or winner decision.

Round 1's [saved-candidate review](edition-reviews/2026-11-04-x-experiment-review.md#saved-candidate-social-triage-iteration-712)
now includes existing Haiku social-triage scores for all 47 citations. The four
verification calls cost $0.003209; promotion/time unknowns still prevent a
complete eligible-yield result. Original evidence and X admission spend are unchanged.

Iteration 713 [recovered missing publication times](edition-reviews/2026-11-04-x-experiment-review.md#publication-time-recovery-iteration-713)
offline from post IDs, cross-checked against all saved official embed dates
and existing timestamps. Both reaction citations fall before the window;
current has 10/13 and trending 27/32 in-window citations. Separate private
dated evidence preserves originals. Promotion unknowns and second-day coverage
remain open; no paid calls or winner decision.

## Viral query/runtime preparation — iteration 720

STEERING 34 supersedes the historical comparison above. The shared viral query
builder uses fresh description-based keywords, grouped OR terms, exact UTC
since/until operators, stored trending minimums and mandatory -giveaway. It
requests 16 posts with 4,000 output tokens. Fixed runtime now plans one slot per
topic without loading articles, under the existing fixed-trending ledger identity;
four $0.10 reservations fit the daily cap. The flag remains off.

Offline experiment preparation now exposes only requests.viral and test-only
requests.semantic, without article readiness requirements (721). The runner now
dispatches only these two styles (722), rejecting legacy inputs before any
reservation or provider call. Round comparison supports these styles (725). No paid dispatch, scorer change or activation occurred.
Historical request constructors remain for old evidence.

## Revised call report (iteration 723)

The offline report accepts `viral` and `semantic` saved evidence. Each requires
`expectedSearch` with the saved minimum and exclusions including `-giveaway`.
Post evidence may supply `foundByFreeLinks` as true, false or null; omission
means unknown. `usablePosts` requires in-window publication, relevance ≥6,
no promotion, reported likes at the minimum and explicit false free-link overlap.
Missing labels, likes or overlap leave the total unknown. `usablePostIds` lists
only confirmed usable IDs; historical `eligiblePosts` retains its older meaning.
Viral execution checks include OR and exact UTC window operators. Semantic
execution compliance stays unknown; keyword operators cannot establish it.
Round comparison supports viral/semantic coverage and usable yields (725).
No paid calls or production scorer changes are part of this report update.

### Revised saved-response extraction (iteration 724)

The offline extractor accepts viral and semantic request files and the saved
trending likes minimum used by both styles. Historical reaction settings are
optional unless extracting a historical reaction call. All 16 viral citations
and eight semantic citations are retained; review labels and free-link overlap
remain explicitly unknown. Settlement mismatches or missing mandatory giveaway
exclusions fail without writing partial evidence.

### Revised round comparison (iteration 725)

Each revised round requires all eight viral/semantic topic cells. Historical
three-style rounds remain readable; mixing the designs inside a round fails,
and different designs cannot establish two-day coverage together. Existing
window, timing, spend and protected-hour checks remain.

Revised style totals expose `usablePosts`; per-topic rows show viral and
semantic usable counts and the IDs/count of semantic usable posts keywords
missed. Totals stay unknown for incomplete rounds or missing review evidence.
Raw promotions remain visible but only exclude their own posts from usable yield.
World has its own topic row. No winner is inferred: compare the old scheduled
search over the same days separately before applying the owner's decision rule.

### Round preflight (iteration 866)

Before creating a private round directory or reserving money, the revised runner
requires four distinct nonblank topic IDs and a timezone-qualified, closed
24-hour window. Dispatch starts only at or after 21:00 UTC. Invalid inputs stop
without a journal entry or provider request. This preflight does not establish
non-overlap with another round; the saved-round comparison checks that separately.

## Nov 5 fresh-window comparison — iteration 885

The revised Grok 4.3 viral/semantic round used Nov 4–5 21:00 UTC.
Three keyword cells have unresolved holds: NBA tool failure without fetched
usage, Gaming timeout, World no execution/fetched usage. None was retried;
continuations dispatched only never-attempted cells within the same hour.
Five settlements cost $0.278606 for 41 fetched/cited candidates, all officially
embed-verified. Three retained holds bring today to $0.728606 and the total to
$1.260937. Production fixed search remains off; no winner is established.
See the [round review](edition-reviews/2026-11-05-x-experiment-review.md)
for measured costs, raw results and remaining scoring/second-day gates.

Extraction now includes the code-required `-giveaway` alongside saved
exclusions for revised styles; saved settings need not contain the mandatory
operator themselves. Historical styles are unchanged.

### Timeout retry (iteration 904)

The revised runner retries a transport `TimeoutError` once, using a separate
`-retry-1` request ID and a fresh $0.15 admission. The original hold stays charged.
A second timeout stops dispatch. Continuing a round skips its attempted cells,
so restart cannot grant another retry. Other transport errors still stop without
retry. Tool-failure/no-execution retries and the switched-off schedule remain open.
