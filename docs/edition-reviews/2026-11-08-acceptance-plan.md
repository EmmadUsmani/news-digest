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
  Iteration 1230 deployed merged revision `96457a35` under STEERING 49,
  including publisher migration `0008`; record any subsequent deployment.
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
pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-08T15:00:00Z
```

Use immutable saved selections and recorded call evidence, not today's inventory.
Write actual findings in a separate `2026-11-08.md` review after publication.
The reader check exits 2 (`pending`) while latest still predates the requested
window, 1 on failure, and 0 when latest/direct/history agree for that window.
It does not replace the job/publication metadata and quality checks below.

## Public-reader phase gates (STEERING 50)

Phase 0 and phase 2 also need this normal scheduled publication before either
can be acked. Do not begin phase 1 from the offline checks alone.

- Record `READER_PUBLISHED_ONLY=1` for the API and confirm topic hiding and
  bookmarks appear in the served reader. The web build uses
  `VITE_READER_PREFERENCES`, not a runtime API preference flag.
- Match the completed scheduled job to the saved edition, its Nov 8 window,
  `kind=scheduled` and non-null `published_at`. Check reader latest, history
  and the direct link all return that edition; admin latest can instead be a
  newer private test. Keep every private test absent from reader history.
- Recheck the original five published response hashes using the **original
  five IDs**. A fresh inventory after publication includes Nov 8 and cannot
  be compared directly with the five-edition baseline. Never replace it:

```bash
jq '{editions: [.editions[] | {id, proposedPublication: {publishedAt: "baseline"}}]}' \
  docs/edition-reviews/2026-11-07-publication-content-baseline.json \
  > /tmp/nov8-original-publication-ids.json
pnpm exec tsx scripts/compare-publication-content.ts compare \
  /tmp/nov8-original-publication-ids.json \
  docs/edition-reviews/2026-11-07-publication-content-baseline.json
pnpm exec tsx scripts/smoke-reader-preferences.ts
pnpm exec tsx scripts/smoke-reader-bookmarks.ts
```

- The browser checks read the actual latest and an older edition on desktop
  and mobile in light/dark; they exercise local reload/cross-tab behavior and
  block external requests/server writes. Inspect and commit their refreshed
  screenshots after publication. Record the actual edition IDs in the review.
- Phase-0 development accounting acceptance: iteration 1289's recorded-provider
  HTTP/database check settles both providers to development, leaves production
  accounting unchanged and keeps the saved test private. No live paid rerun is
  needed. Iteration 1290's deployed free smoke saved test
  `a49bc894-1134-4025-93c4-2daa985a89b1` from real stored content: four topics,
  433 candidates and 20 stories, non-AI throughout; direct reader link 404,
  reader latest unchanged and all five original response hashes match.
- In the phase acknowledgments, record actual scheduled outcome, comparison
  and browser results, development spend and remaining owner gates. Keep the
  VM private; a successful publication alone does not authorize public access.

## Acceptance comparisons

For speed, compare the [Nov 7 recorded critical path](2026-11-07-social-latency.md):
NBA finished last, with a 90.426 s story stage and 42.522 s final social tail.
Identify the new critical topic rather than assuming Nov 6’s Tech tail persists.

If the link-facet fix is deployed, check newly collected Bluesky posts with
shortened link labels: full official destinations should be clickable, with
original text preserved in the saved snapshot. Historical Nov 7 links stay
unchanged; an old observation without facets does not exercise the fix.

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
