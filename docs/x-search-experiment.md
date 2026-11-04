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
| Unknown outcome           | Keeps the full reservation; no automatic release or retry                                                                   |
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

## Prepare real article inputs without dispatch

```sh
pnpm exec tsx apps/api/scripts/prepare-x-experiment.ts START END > /private/path/inputs.json
```

START and END require explicit timezones. The read-only repeatable-read snapshot
uses enabled owner topics, saved thresholds/exclusions and the existing reaction
story pipeline: up to 200 stored articles per topic, relevance/quality filters,
then heuristic ranking. It saves two distinct ranked titles and prepared bodies
for current, trending and reaction styles with an identical precise window.
Provider date filters enclose that window; the requested end remains exclusive.
Fewer than two distinct titles blocks that topic's reaction request explicitly.
Missing settings fail the whole snapshot before output. No AI calls, cache
writes, admission or dispatch occur. Store the output privately; it contains
article IDs, titles and request prompts. Current observations/settings may
postdate END; this does not reconstruct a historical snapshot or establish
comparison eligibility. A runner must still enforce admission and dispatch gates.

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

The runner uses Grok 4.3 for the four-topic current/trending/reactions comparison,
within one hour. It reserves $0.15 and claims dispatch through the existing
journal before each request, settles known token/post/profile usage, and stops
on any error or over-reservation settlement. It never retries automatically. To continue only never-attempted cells within
the same hour, append the existing round directory name as a second argument.
Previously saved requests are skipped, including unknown outcomes; their holds
remain charged. The completed manifest lists settled calls only, so unknown
cells remain gaps in comparison coverage.

All runs share `~/.local/state/news-digest/x-experiment/budget.json`.
Private timestamped directories hold the prepared inputs, dispatched requests,
raw responses, actual usage and completed round manifest. Directory mode is 700;
files are 600. Keys and request headers are never saved. Calls are separate from
production discovery and do not ingest posts or write the production ledger.

Saved responses still need offline evidence extraction, social relevance scoring
and promotion reviews. Unknown labels must remain unknown; dispatch completion
does not establish a winner. Repeat on a second non-overlapping news day, then
calibrate thresholds and compare the cheaper model under the plan's limits.

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
