## 2026-11-04: iteration 657 — keep rejected social posts out of degraded selection

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and four available queues; saved edition has four topics/14 stories/15 posts.
- Fixed an unavailable-editor path that could restore lexical fallback posts rejected by completed semantic triage. Fallback now obeys the existing relevance 6/interestingness 4 gates; rejected and missing-score posts stay out.
- Incomplete triage preserves its original fallback. Stored explanation identifies completed-gate degradation; model order, caps and shortlisting thresholds are unchanged.
- Added synthetic regression covering both rejection thresholds, boundary acceptance, absent scores, empty results, retained identity and untouched input. No claim this path caused Nov 4's selections or improves live World coverage yet.
- Updated TASKS/RANKING; archived iteration 641. Bug fix changes no system flow, source inventory or schema; no handbook/SOURCES changes needed. No paid calls, discovery requests or configuration changes.
- Verification: targeted orchestration tests 6/6; pnpm format, pnpm lint:fix, pnpm check (399 unit/207 isolated integration), pnpm build and git diff --check passed. Initial full check caught archive formatting; corrected before rerun.
- Restarted API/worker; both active, healthz/database/Redis healthy, saved four-topic/15-post edition readable, zero alerts and no failed user services.
- Next: Nov 5 grouping/cost/latency/screenshots, NBA full-AI acceptance, World coverage and actual social selection quality; incremental triage stays off.
