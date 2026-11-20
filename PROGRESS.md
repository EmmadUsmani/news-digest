# Progress

Earlier entries: [pre-3055 archive](docs/progress-archive/2026-11-20-pre-3055.md).

## 2026-11-20: iteration 3055 — reject Nov 15 category-only developing links

- Clean main at ae5126bd; no inherited work. Alerts clear; healthz database/Redis pass; API/worker active.
- Reviewed Nov 15 Tech selections against 32 earlier stories; Lovable exposure and Lutnick conflict have explicit nonmatches.
- Existing IPO positive retained; Huang recap not newly labelled. Saved titles/summaries only, not original excerpts or model responses.
- Four security/chip false-link challenges fail while IPO passes; snapshot checks consume both additional negatives.
- Targeted: pnpm exec tsx --test apps/api/test/evaluate-developing-stories.test.ts apps/api/test/developing-saved-evidence.test.ts — 41 pass.
- Reader: pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-19T15:00:00Z — five topics, 25 real stories/22 posts pass.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (/tmp/3055-*.log); results follow.
- Production inactive; no provider calls, cap, UI, source, schema or runtime changes.
- Next: Nov 20 review after 15:00 UTC, including per-topic event recall and miss causes.
- Full check/build pass: 1,316 unit and 336 integration passes/four expected skips; typecheck, lint, formatting and boundaries green.
- Build republished unchanged web assets; API/worker restart deferred under the 13:00–16:00 freeze; no runtime source changed. Commit/push follow.

## 2026-11-20: iteration 3079 — diagnose Tech/Gaming scheduled fallback

- Clean main at d1859f2a; no inherited work. Alerts clear; health database/Redis pass; API/worker active; disk 62%.
- Nov 20 scheduled `9c810e64` published 15:03:54.277 UTC: five topics/25 stories/20 posts. Reader gate passes; AI gate refuses Tech/Gaming, accepts NBA/World/U.S. Sonnet.
- Breakage preempts daily review: reproduced all eight retained Tech/Gaming attempts offline; five parseable first failures match production absence guard, three invalid JSON (two empty Tech responses).
- Eight rejected story fields pinned with exact bounded evidence. Regression checks original rejection, complete verbatim source acceptance, and invented-absence refusal; six targeted tests pass.
- Incident: docs/editorial-fallback-2026-11-20.md. No runtime, provider, budget, source, schema or publication changes; immutable edition retained.
- Commands: pnpm exec tsx /tmp/3079-editor-diagnosis.ts; pnpm exec tsx --test apps/api/test/absence-support.test.ts; scheduled-reader with/without five --require-ai-topic flags.
- pnpm format; pnpm lint:fix; pnpm check — final results follow (/tmp/3079-*.log).
- Build/restart deferred: test/docs-only change and active 13:00–16:00 freeze; deployed runtime already matches main.
- Next: fix prompt/repair behavior with saved evidence, preserving guard/models/caps; then one consolidated Nov 20 review with per-topic event recall and miss causes. Reference capture: /tmp/3078-reference-stories.json.
- Full pnpm check passes: 1,317 unit/336 integration passes, four expected skips; typecheck, lint, formatting and boundaries green. Commit/push follow; runtime unchanged during freeze.

## 2026-11-20: iteration 3080 — source-bound fallback repair controls

- Clean main at b564860e; no inherited work. Alerts clear; health database/Redis pass; API/worker active; disk 62%.
- Added eight manually written repairs to the saved Tech/Gaming rejected-field fixture; all pass the unchanged absence guard and field limits.
- All seven summary repairs reject with evidence removed; positive Steam Machine headline needs no negative exception. Original rejected text still fails.
- Retained OpenSSL input condition, PostgreSQL limits, Ubisoft IGN attribution, Steam Machine 2TB uncertainty and DFA contrast; documented support and generic prompt next step.
- Controls are manual, not model acceptance. PostgreSQL marketing prose remains unsuitable for publication; full-response/model completion remains open.
- Targeted absence-support suite: six pass. Scheduled-reader: five topics/25 real stories/20 posts pass.
- pnpm format/lint:fix pass; check passes static checks/1,317 units, but Grafana listener has one administrator-termination exception. Isolated rerun passes; full integration retry below (/tmp/3080-*.log).
- Test/fixture/docs only; no providers, caps, source, schema or runtime changes. Build/restart deferred under 13:00–16:00 freeze; deployed runtime matches main.
- Next: implement generic all-topic repair guidance outside freeze, then finish consolidated Nov 20 daily recall/miss-cause review.
- Full integration rerun passes: 336 pass/four expected skips; API build passes. Initial listener exception did not recur isolated or in-suite. Archived pre-3055 progress; final health passes. Commit/push follow.
