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

## 2026-11-20: iteration 3081 — separate output exhaustion from support failures

- Clean main at 7fe32c47; no inherited work. Alerts clear; health database/Redis pass.
- Joined eight retained Tech/Gaming failures to exact worker journal fingerprints; repairs reconstructed because artifacts retain original requests.
- Three invalid JSON responses terminate at the 4,000-token cap (Tech two empty; Gaming one partial); five parseable responses end normally below cap and fail support validation.
- Empty Tech content cause remains unknown: successful responses/aggregate usage do not identify content-block types. No timeout/refusal/hidden-reasoning claim.
- Saved sanitized completion receipt and incident interpretation; no runtime, providers, model, cap, schema, source or publication changes.
- Verification: pnpm exec tsx /tmp/3081-completion.ts — eight unique joins, three cap terminations, validity/completion assertions pass.
- Next: generic support/repair plus concise-output guidance after 16:00 UTC, then consolidated Nov 20 recall review. No deployment/restart during freeze.
- pnpm format; pnpm lint:fix; pnpm check pass: static checks, 1,317 units, 336 integrations/four expected skips. Receipt equality/diff checks pass.
- Scheduled-reader passes five topics/25 real stories/20 posts; API/worker active, disk 62%. Docs/receipt only: no rebuild or restart needed; freeze preserved.

## 2026-11-20: iteration 3082 — generic source-bound editorial repair

- Clean main at be4593f3; no inherited work. Alerts clear; health passes; 37 active sources healthy/Destructoid intentionally inactive; disk 62%.
- Story editor v16 extends complete-negative-sentence guidance to technical conditions, product limits and contrasts across topics; fixed repair hints preserve every condition/attribution/uncertainty and recheck all fields.
- Generalized Gaming concise-output guidance to all topics; support validator, schemas, models, budgets and 4,000-token cap unchanged. Offline manifest accepts v16 plus retained historical captures.
- Scripted tests traverse all eight manual Nov 20 field controls through editorial validation on both model routes; five-topic repairs retain fixed feedback. No paid calls or model-obedience claim.
- Updated affected pipeline handbook and incident; pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline passes; unchanged diagram inspected.
- Targeted editor/absence tests 57 pass; manifest tests three pass; API build passes. Scheduled-reader passes five topics/25 real stories/20 posts.
- pnpm format; pnpm lint:fix; final pnpm check pass: static checks, 1,319 units, 336 integrations/four expected skips. Logs: /tmp/3082-retry-*.log.
- Initial full check: 1,319 units pass; two integrations fail on stale golden dispatch/fingerprint pins. Updated synthetic v16 mapping/fingerprint with response and golden output unchanged; direct fake-DB publication replay passes. No live inference.
- Next: consolidated Nov 20 daily review with per-topic event recall/miss causes from saved grouping inputs; next scheduled edition must establish Tech/Gaming model acceptance.
- After 16:09 UTC, systemctl --user restart news-digest-api.service news-digest-worker.service succeeds; both active. Health/database/Redis, scheduled-reader and obs sources --check pass; zero alerts. Commit/push follow.

## 2026-11-20: iteration 3083 — consolidated daily event-recall review

- Clean main at 23c6d1de; no inherited work. Alerts clear; health/database/Redis pass; 37 active sources healthy, Destructoid intentionally inactive.
- Published Nov 20 edition remains 25 real stories/20 posts; Tech/Gaming source-excerpt fallback, NBA/World/U.S. Sonnet. All 15 AI summaries read against saved evidence; World/U.S. selected/evidence/coverage IDs disjoint.
- Judged all 196 frozen reference entries: 94 important-event references, 102 exclusions, 62 distinct topic-events. Split separate Raptors injuries, Ubisoft developments and construction court actions.
- Event recall: Tech 3/13; NBA 6/13; Gaming 5/11; World 5/10; U.S. 3/15. Total 22/62; vague Edwards quote and retrospective Lillard contract post do not cover the reference developments.
- Forty misses: 22 collected/not shortlisted, ten shortlisted/not published, eight retained collection gaps. Tech/Gaming final losses identify exhausted editing/fallback, not a successful editor's choice.
- Existing trace-reference-stories.ts passes all ten feeds; inline assertions pass every unique ID/membership/admission/publication route, collection URL absence, reference partition and recall arithmetic.
- pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z passes five topics/25 stories/20 posts; pnpm obs sources --check passes. Review/capture/docs only; no inference, new tooling/schema, runtime or publication changes.
- pnpm format; pnpm lint:fix; full pnpm check pass: static checks, API build, 1,319 units, 336 integrations/four expected skips (/tmp/3083-check.log). Final document formatting and git diff --check pass; service revision refresh follows push.
- Next: Nov 21 and 22 daily recall reviews, then tally/fix the largest cause; next scheduled edition must establish v16 model acceptance. No owner input needed.

## 2026-11-20: iteration 3084 — complete Nov 15 Tech continuity reference

- Clean main at 9b4394ab; no inherited work. Alerts clear; health/database/Redis pass; all active sources healthy, Destructoid intentionally inactive.
- Higher-priority Nov 21–22 recall reviews await scheduled editions; today's item 69 evaluation commit already used. Continued item 70 saved semantic review without provider calls.
- Reviewed remaining Nov 15 Huang recap against all 32 earlier stories: links Nov 14 departure, Nov 12 transition and Nov 10 probe/succession, excluding chip-category stories.
- Nov 15 Tech now has all four selections labelled: two continuations/two nonmatches. Recap establishes no fresh development; no original editorial evidence, model or rewrite acceptance. Production remains inactive.
- Added missing/partial/category-contamination challenges; existing replay and immutable snapshot checks consume the new manual membership.
- Initial targeted run caught an accidentally changed NBA review-count assertion; restored it before full verification.
- Verification: pnpm format; pnpm lint:fix; pnpm check (results recorded below). Scheduled-reader passes five topics/25 real stories/20 posts; pnpm obs sources --check passes.
- Next: Nov 21–22 recall reviews and v16 scheduled editorial acceptance; developing semantic/model and whole-edition budget acceptance remain open. No runtime/schema/source changes.
- Full pnpm check passes: static checks/API build, 1,321 unit tests, 336 integration tests/four expected skips (/tmp/3084-check.log). Final git diff --check passes; service revision refresh follows push.

## 2026-11-21: iteration 3166 — extend joint event comparison to Nov 17

- Clean main at 4e67fd5a; no inherited work. Zero alerts; API/worker and health/database/Redis pass; 37 active sources healthy, Destructoid intentionally paused.
- Nov 21–22 recall reviews await publication. Used Nov 21's one item 69 evaluation commit on the next saved edition, without paid calls or production tuning.
- Labelled all 45 Nov 17 story/post slots: Tech eight events, NBA nine provisional, Gaming ten, World nine, U.S. eight. Possible NBA same-game membership remains unresolved (43–44 total topic-events).
- Retain every slot: macOS post adds Full Disk Access/interface facts; blanket one-slot deletion rejected. Largest shares unchanged: Tech 22.22%, NBA 11.11% provisional (22.22% if joined), Gaming 10%, World 11.11%, U.S. 12.50%.
- Existing evaluate-saved-nba-event-breadth.ts now checks Nov 17–18; hashes/counts/IDs/event retention and prior Bluesky texts pass. Python comparison verifies all 45 saved IDs/kinds/prose against immutable public edition.
- Scheduled-reader Nov 20 passes five topics/25 real stories/20 posts. pnpm obs sources --check passes. No runtime/schema/source/UI changes; no new reference tooling.
- Verification: pnpm format; pnpm lint:fix; pnpm check (results below). Logs /tmp/3166-{format,lint,check,evaluation}.log.
- Next: Nov 21 scheduled recall/v16 Tech and Gaming acceptance; Nov 12–16 joint comparisons remain. Semantic/model/budget acceptance still blocks developing stories.
- Full pnpm check passes: static checks/API build, 1,321 units, 336 integrations/four expected skips. Final formatting/diff checks pass; commit/push and healthy service revision refresh follow.
