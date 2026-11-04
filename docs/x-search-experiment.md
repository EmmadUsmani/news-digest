# X search experiment preparation

The [owner-approved plan](x-search-plan.md) defines the comparison and decision rule.
The experiment has not run. Production discovery is unchanged.

## Implemented admission

`scripts/lib/x-experiment-budget.ts` provides standalone experiment accounting,
separate from the production database ledger. Amounts are integer USD micros.

| Operation                 | Behavior                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| Reserve                   | Checks $1 per UTC day, $2.50 lifetime and the 13:00–16:00 UTC exclusion before saving a unique request ID |
| Settle                    | Saves known actual usage once and releases unused reservation                                             |
| Unknown outcome           | Keeps the full reservation; no automatic release or retry                                                 |
| Cost above reservation    | Saves the actual cost and blocks further admissions                                                       |
| Restart                   | Reads persisted reservations and settlements                                                              |
| Locked or damaged journal | Refuses admission; never replaces damaged evidence or reclaims stale locks                                |

Updates use an exclusive directory lock, private temporary file, file sync,
atomic rename and directory sync on the VM's local filesystem.

## Offline report

`scripts/lib/x-experiment-report.ts` summarizes saved call evidence without
HTTP or model calls. It preserves topic, model, style, exact window and actual
tool inputs; reports fetched versus returned posts, observed median/maximum
likes, window and relevance ≥6 shares, promotions, and in-window,
triage-passing, non-promotional posts per dollar. Likes remain provider-reported.

Missing timestamps, triage scores or promotion reviews remain unknown and
prevent a complete eligible-yield result. Missing likes are counted separately;
medians use observed counts only. Duplicate request/post IDs are rejected within
a call/report, while a post appearing in different styles remains measurable in
each. No winner is selected from an incomplete single-day comparison.

The runner must supply saved triage/review labels; this report creates none.
All current report tests use synthetic evidence, not live experiment results.

## Provider bound investigation (Nov 4)

The [official X Search documentation](https://docs.x.ai/developers/tools/x-search)
describes `max_turns` as reducing search rounds, not bounding fetched posts.
It counts repeated, parent, quoted and thread posts and profiles; its example
reports 44 posts and three profiles for two search calls. Requested result
counts and prompt instructions therefore do not establish a hard cost bound.
Paid dispatch remains unwired pending a defensible provider-enforced bound.
No experiment calls have been made.

## Remaining runner requirements

- Use one fixed journal path outside the repo for every run and process.
- Derive a defensible per-call cost reservation from provider limits before
  making calls. Admission alone cannot cap an individual provider response.
- Reserve before each paid call; recheck the time exclusion immediately before
  dispatch. Never retry a call with an unknown outcome.
- Persist request, response, exact tool inputs and usage evidence outside the
  repo. Do not ingest experiment posts into production discovery.
- Wire the same-window four-topic comparison, offline scoring and reports,
  then run the two-day comparison within the approved caps.
