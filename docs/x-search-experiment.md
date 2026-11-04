# X search experiment preparation

The [owner-approved plan](x-search-plan.md) defines the comparison and decision rule.
The experiment has not run. Production discovery is unchanged.

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
prose and requested settings never count as execution evidence. It separately
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
window, dispatches within one hour and one UTC day. Missing/duplicate cells,
window mismatch and elapsed time are reported; unknown/reused request IDs or
mislabelled topics/models fail validation. Unassigned evidence is listed.
`twoDayCoverage` requires complete rounds for the same model and four topics on
different UTC days and non-overlapping news windows. Repeating the same window
on a later dispatch day cannot satisfy the second-news-day requirement. Round
summaries include the normalized window (or null if inconsistent). This checks
structural coverage only, not operator behavior,
threshold calibration or model acceptance, and never selects a winner.
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
Paid dispatch remains unwired pending a defensible provider-enforced bound.
No experiment calls have been made.

The [Responses reference](https://docs.x.ai/developers/rest-api-reference/inference/responses.md)
explicitly excludes reasoning and function-call tokens from `max_output_tokens`.
Its `search_parameters.max_search_results` describes a separate search interface,
not a fetched-item limit on the `x_search` tool. The
[billing reference](https://docs.x.ai/developers/rest-api-reference/management/billing.md)
says the postpaid spending limit does **not** limit prepaid-credit usage.
These documented controls do not supply the missing experiment cost bound.
The $5 top-up's shared prepaid balance cannot enforce the separate $1/day or
$2.50 experiment limits. Do not change account billing or invent a request
parameter. This dispatch blocker is reported in NEEDS_FROM_HUMAN.md; independent
offline work and Nov 5 scheduled acceptance checks can continue.

## Remaining runner requirements

- Use one fixed journal path outside the repo for every run and process.
- Derive a defensible per-call cost reservation from provider limits before
  making calls. Admission alone cannot cap an individual provider response.
- Reserve before each paid call; invoke `claimDispatch` immediately before
  dispatch. Its durable single-use claim rechecks the time exclusion and UTC
  budget day. A crash after claiming retains the hold and prevents retry, even
  if the request was never sent. The runner is not wired; this does not remove
  the provider-bound blocker. Never retry a call with an unknown outcome.
- Persist request, response, exact tool inputs and usage evidence outside the
  repo. Do not ingest experiment posts into production discovery.
- Wire the same-window four-topic comparison, offline scoring and reports,
  then run the two-day comparison within the approved caps.
