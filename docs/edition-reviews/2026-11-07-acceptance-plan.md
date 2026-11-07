# Nov 7 production acceptance plan

Prepared in iteration 1101 before the 15:00 UTC publication. This is a checklist,
not the Nov 7 edition review; it does not satisfy the publisher merge gate.

## Collect after publication

Use existing read-only commands with the normal secret-loading environment;
redirect reports to private temporary files and inspect selected fields.

- `pnpm exec tsx scripts/report-edition-timing.ts --scheduled-only --limit 1`
- `pnpm exec tsx scripts/report-x-discovery.ts 2026-11-07`
- `pnpm exec tsx scripts/report-x-week.ts 2026-11-07`
- `pnpm obs alerts`

Confirm the timing report's window ends **Nov 7 15:00 UTC** before reviewing it.
Before publication, the latest completed scheduled job is still Nov 6.
Use the saved edition inspector and immutable reader selection for topic review;
current social inventory cannot establish what the editor selected.

## Record in the actual edition review

| Area           | Required evidence and comparison                                                                                                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Publication    | Saved edition ID/window, worker duration, retries, full-AI/fallback outcome, topic presence and readable reader endpoint. Nov 6: 137.059 seconds, 709 article candidates, five stories per topic.                                             |
| Cost           | Per-purpose/topic settled costs, refusals, unresolved holds, daily cap and released reserve. Nov 6 edition: $0.286904.                                                                                                                        |
| Keyword X      | Per topic: attempts/tool execution/retry, fetched and verified posts, reported engagement including unknowns, outside-list/free-link overlap and saved selected IDs. First production result after the keyword rollout; no experiment reruns. |
| Bluesky        | Per topic: reserved/open slots, read/shortlisted/picked, outcome/refusal/drop categories, replaced X ID and added scoring/editing cost. First scheduled reserved-slot acceptance; Nov 6 had one World Bluesky pick.                           |
| Reader quality | Read briefs, all stories, coverage and original posts in all four topics. Compare Tech's three GPT-6 Cyber/two Inkling repetitions, NBA routine availability/assignment picks, World breadth and unrelated merges.                            |
| Alerts         | Source freshness, failed scheduled jobs, Bluesky failure/no-pick alerts and dispatcher events. Diagnose actual failures before other work.                                                                                                    |

Unknown engagement stays unknown. One edition does not close the three-edition
X/Bluesky acceptance or establish viral quality. Keep the existing caps and
protected window; no paid verification calls or editor changes before the
actual review is committed.

## Publisher handoff after the review

`publisher-attribution` is pushed through `0ba83c73` (iterations 1097–1100).
It contains parsing, persistence/migration, immutable snapshot propagation and
reader labels; branch checks and four-layout browser evidence are recorded in
that branch's PROGRESS.md. Main has none of those runtime changes yet.

Merge/deploy only **after 16:00 UTC Nov 7 and a committed actual Nov 7 review**.
Reconcile this main-side task/status update when merging. Follow normal migration,
verification, build and service restart procedures; do not deploy branch artifacts
before the gates. Historical unknown publisher evidence must remain unknown.
