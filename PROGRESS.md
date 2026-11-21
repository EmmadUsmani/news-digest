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

## 2026-11-21: iteration 3167 — review saved World developing continuity

- Clean main at a91d5a44; no inherited work. Zero alerts; health/database/Redis pass; 37 active sources healthy, Destructoid intentionally inactive.
- Nov 21–22 daily recall/v16 acceptance await publication; today's item 69 commit used. Continued item 70 without paid calls or production changes.
- Reviewed Nov 17 World selections against 25 historical stories/seven snapshots: second-day Kerch continuation, three nonmatches; peace-talk continuity remains unresolved.
- Added exact saved source evidence/prose from existing 2901 export; Python equality checks preserve every export field and every older fixture case.
- Existing replay and immutable snapshot checks cover four new labels; missing Kerch/shared-war/shared-policy challenges fail. Initial new failure-count assertion was too narrow for whole-response rejection and corrected.
- Targeted tests: pnpm exec tsx --test apps/api/test/evaluate-developing-stories.test.ts apps/api/test/developing-saved-evidence.test.ts — 48 pass.
- Scheduled-reader Nov 20 passes five topics/25 real stories/20 posts; pnpm obs sources --check passes. No schema/source/UI/runtime changes; developing feature remains inactive.
- Full check caught two legacy two-case assumptions after adding original World evidence; scoped the Nov 18 execution and extended generic request coverage. Seven capture tests pass.
- Verification: pnpm format; pnpm lint:fix; full pnpm check rerun (results below). Logs /tmp/3167-{format,lint,check,reader,targeted,capture}.log.
- Next: scheduled Nov 21 recall and v16 Tech/Gaming acceptance. Model semantics and whole-edition budget acceptance remain open; no cap changes.
- Full pnpm check passes: static checks/API build, 1,327 units, 336 integrations/four expected skips. Final formatting/diff checks pass; commit/push and healthy service refresh follow.

## 2026-11-21: iteration 3168 — source-bound Kerch rewrite control

- Clean main at b14c5f7e; no inherited work. pnpm obs alerts: zero; health/database/Redis pass; API/worker active; pnpm obs sources --check passes (37 active, Destructoid intentionally inactive).
- Nov 21 edition/recall and v16 acceptance await publication; today's item 69 evaluation commit already used. Continued item 70 without paid calls or production changes.
- Source-reviewed manual Kerch update uses original Nov 17 excerpt: actor/action, bridge/location and second-day development only. Earlier drone/traffic/timing facts and escalation claims omitted.
- Existing current-evidence guard/fixed-selection rewrite accepts the manual response; all five selected IDs/order and four untouched stories retained. Peace-talk continuity unresolved; feature stays inactive.
- Targeted: pnpm exec tsx --test apps/api/test/developing-rewrite-support.test.ts — 3 pass. Guard is lexical, not general entailment; no provider/model acceptance claimed.
- Reader: pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z — five topics/25 real stories/20 posts pass. No runtime/schema/source/UI changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check (results below); git diff --check. Logs /tmp/3168-{format,lint,check,targeted,reader}.log.
- Next: Nov 21 recall/v16 Tech and Gaming acceptance; semantic/model and whole-edition budget acceptance remain open. Commit/push and service revision refresh follow checks.
- Full pnpm check passes: static checks/API build, 1,328 units, 336 integrations/four expected skips. Initial check stopped on the newly appended progress-entry formatting; corrected with Prettier before the passing rerun.

## 2026-11-21: iteration 3169 — Nov 18 World developing continuity

- Clean main at de6162d3; no inherited work. Zero alerts; health/database/Redis pass; all 37 active sources healthy, Destructoid intentionally inactive.
- Nov 21 scheduled acceptance awaits publication; today's item 69 commit used. Continued item 70 with no paid calls or runtime changes.
- Reviewed Nov 18 World against 25 historical stories/seven snapshots: summit, Kerch campaign (three editions), sanctions/contract delay continuations; Gaza nonmatch; Iran analysis unresolved.
- Preserved original 2901 exported inputs unchanged. E1 excerpt denies sanctions causality and cites caretaker-government objection; review explicitly retains qualification for future rewrites.
- Existing evaluator rejects missing/partial continuity and false Gaza/policy links; immutable snapshot checks retain selection/order, nearest predecessor and counts. Agent labels only; feature inactive.
- Targeted: pnpm exec tsx --test apps/api/test/evaluate-developing-stories.test.ts apps/api/test/developing-saved-evidence.test.ts — 53 pass.
- Verification: pnpm format; pnpm lint:fix; pnpm check; scheduled-reader and service refresh results follow. Logs /tmp/3169-{targeted,format,lint,check,reader}.log.
- Next: Nov 21 recall/v16 Tech/Gaming acceptance; developing semantic/model and whole-edition budget acceptance still open. No schema/source/UI changes.
- Full pnpm check passes: static checks, 1,333 units, 336 integrations/four expected skips. pnpm build passes; scheduled-reader Nov 20 verifies five topics/25 real stories/20 posts. Export-field equality and git diff --check pass.

## 2026-11-21: iteration 3170 — qualified E1 delay rewrite control

- Clean main at ed3618b4; no inherited work. Zero alerts; health/database/Redis pass; 37 active sources healthy, Destructoid intentionally inactive.
- Nov 21 recall/v16 acceptance awaits publication; today's item 69 evaluation commit used. Continued item 70 without provider calls or runtime changes.
- Manual Nov 18 E1 rewrite preserves diplomats' denial of sanctions causality and attorney general's caretaker-government objection; replaces causal implication in published importance line with sourced two-state concern.
- Unchanged lexical guard requires the complete attributed denial: initial paraphrase refused; exact attributed sentence passes. Attribution-stripping and negative paraphrase controls fail as expected.
- Single-link fixed-selection control retains five IDs/order and four unchanged stories. Combined World/model/whole-edition budget acceptance remains open; feature inactive.
- Verification: pnpm exec tsx --test apps/api/test/developing-rewrite-support.test.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build; reader and service refresh results below. Logs /tmp/3170-{targeted,format,lint,check,build,reader}.log.
- Full pnpm check passes: static checks, 1,334 units, 336 integrations/four expected skips. pnpm build passes; scheduled-reader Nov 20 verifies five topics/25 real stories/20 posts. No schema/source/UI changes; next: Nov 21 recall/v16 acceptance.

## 2026-11-21: iteration 3171 — source-bound summit rewrite control

- Clean main at d8106de5; no inherited work. Zero alerts; health/database/Redis pass. Failed historical check units are transient test jobs, not app services.
- Nov 21 recall/v16 acceptance awaits publication; today's item 69 evaluation commit used. Continued item 70 without provider calls or runtime changes.
- Manual Nov 18 summit rewrite uses current greeting title and prospective first-meeting excerpt; omits inherited agenda/denuclearisation hopes, location and outcome claims.
- Existing support guard/fixed-selection contract passes: five IDs/order and four unchanged stories retained. Single-link manual evidence only; combined World/model/budget acceptance open, production inactive.
- Targeted: pnpm exec tsx --test apps/api/test/developing-rewrite-support.test.ts — five pass.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; scheduled-reader and service refresh results below. Logs /tmp/3171-{targeted,format,lint,check,build,reader}.log.
- Next: Nov 21 recall and v16 Tech/Gaming acceptance. No source/schema/UI changes.
- Full pnpm check passes: static checks, 1,335 units, 336 integrations/four expected skips. pnpm build passes; scheduled-reader Nov 20 verifies five topics/25 real stories/20 posts. git diff --check passes.

## 2026-11-21: iteration 3172 — source-bound Crimea operation rewrite control

- Clean main at d37c36d8; no inherited work. Zero alerts; health/database/Redis pass.
- Nov 21 recall/v16 acceptance awaits publication; today's item 69 evaluation commit used. Continued item 70 without paid calls or runtime changes.
- Manual Nov 18 bridge rewrite leads with newly reported weeks-long preparation, two waves and Ukrainian-developed weapons; omits inherited damage/traffic claims.
- Unchanged support guard and fixed-selection contract pass: five IDs/order and four unchanged stories; nearest Nov 17 predecessor with three-edition continuity supplied.
- Manual control only; combined World/model/whole-edition budget acceptance remains open; production inactive.
- Targeted: pnpm exec tsx --test apps/api/test/developing-rewrite-support.test.ts — six pass.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; scheduled-reader and service refresh results below. Logs /tmp/3172-{targeted,format,lint,check,build,reader}.log.
- Next: Nov 21 recall and v16 Tech/Gaming acceptance. No source/schema/UI changes.
- Full pnpm check passes: static checks, 1,336 units, 336 integrations/four expected skips. pnpm build passes; scheduled-reader Nov 20 verifies five topics/25 real stories/20 posts. git diff --check passes.
