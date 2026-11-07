# Nov 8 scheduled edition acceptance plan

Prepared in iteration 1217. This is the second scheduled keyword/Bluesky
acceptance review, not a production result. Compare with [Nov 7](2026-11-07.md).

## Establish what ran

- Verify the saved scheduled window ends **Nov 8 15:00 UTC**. A latest-job
  report before publication still describes Nov 7; never count it twice.
- Record edition/job IDs, start/end, attempts, topic presence, candidate counts,
  AI/fallback outcome and released reserve. Nov 7: 180.570 s, 693 candidates,
  20 stories, 15 X posts, three Bluesky posts, mixed NBA story fallback.
- Record the deployed revision and API/worker start times at publication from
  deployment history. Main containing a fix does not establish worker deployment.
  If the metrics recovery gate still prevents deployment, mark queued changes
  unexercised rather than judging their effectiveness from Nov 8 output.
- Preserve the protected 13:00–16:00 UTC window, existing models and caps.
  No paid reruns or forced publication to obtain acceptance evidence.

## Collect read-only evidence

Use the normal secret-loading environment; retain full reports only in private
temporary files and inspect selected fields. Never print credentials.

```bash
pnpm exec tsx scripts/report-edition-timing.ts --scheduled-only --limit 1
pnpm exec tsx scripts/report-x-discovery.ts 2026-11-08
pnpm exec tsx scripts/report-x-week.ts 2026-11-08
pnpm obs alerts
```

Use immutable saved selections and recorded call evidence, not today's inventory.
Write actual findings in a separate `2026-11-08.md` review after publication.

## Acceptance comparisons

For Tech summary depth, first classify every selected story's supplied evidence
as empty, headline-only or substantive. Nov 7 had four empty HN excerpts and one
headline-only Google News excerpt across all five stories. Assess whether the
summary omits supplied facts separately from missing source detail; see the
[diagnosis](2026-11-07.md#tech-evidence-depth-diagnosis--iteration-1220). Do not
fetch full articles or change sources to manufacture this comparison.

| Area              | What to record                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NBA stories       | Brief presence, five or fewer substantive stories, AI/fallback outcome and validation categories. Nov 7 had an empty brief, routine debut/preview slots and four failed edit attempts. If deployed, confirm the dated matchup-preview filter removes the Nov 7 Knicks–Cavaliers format and assess the feedback/schema repair changes. If editing fails after complete triage, check retained importance order and grouped source excerpts; do not infer the historical rejected text. |
| Repeated posts    | Read every topic's original posts and contexts. Compare Nov 7's paired LeBron return posts, BioWare campaign posts and Miller reactions. Count repeated events separately from independent developments about the same person/franchise; assess v8 only if deployed.                                                                                                                                                                                                                  |
| Keyword X         | Per topic, record attempts, reported execution/tool status, retries, fetched/verified candidates, engagement (including unknowns), outside-list/free-link overlap and selected IDs. Nov 7 had three novel Tech citations and one already-verified NBA citation; Gaming/World execution was unconfirmed. Historical missing tool status stays unknown.                                                                                                                                 |
| Bluesky           | Per topic, record reserved/open slot outcome, read/shortlisted/picked counts, refusal/drop categories, selected/replaced X IDs and attributed scoring/editing cost. Nov 7 selected one distinct post each for NBA/Gaming/World, none for Tech, with no X replacement and $0.061842 attributed cost.                                                                                                                                                                                   |
| Reader/publishers | Read briefs, summaries, original posts and coverage across all topics. If deployed, confirm the terminal Cavaliers credit cleanup and publisher labels where new snapshots contain publisher evidence. Historical unknown publisher metadata stays unknown; do not expect a migration to backfill attribution.                                                                                                                                                                        |
| Cost/speed        | Record per-purpose/topic settled costs, unresolved calls/holds, refusals, daily allowance and released reserve. Compare Nov 7's $0.380173, 51 calls, zero refusals/holds and 180.570 s.                                                                                                                                                                                                                                                                                               |
| Reliability       | Confirm readable saved reader route, source freshness, scheduled-job success, Bluesky failure/no-pick alerts and dispatcher events. Breakages take priority over acceptance work.                                                                                                                                                                                                                                                                                                     |

Keep keyword and Bluesky three-edition acceptance open after this second review.
The Nov 2–8 first-week report is due with the daily report; cumulative spending
and novel verified discovery must remain separate from selected-post quality.
