# Progress

Earlier entries: [pre-3038 archive](docs/progress-archive/2026-11-20-pre-3038.md).

## 2026-11-20: iteration 3038 — bind settlement to dispatched prices

- Clean main at e1a058dc; no inherited work. Alerts clear, healthz passes, source checks healthy, digest queue zero failures; next edition 15:00 UTC, disk 61%.
- Found caller mutation during pending provider completion could change the provider request and ledger settlement prices after admission.
- BudgetedLlm now copies the admitted request and nested model before dispatch; completion and settlement use that copy.
- Targeted reserved-plan suite: 30 passes, including mutation of prompt, run/model identity and rates during pending completion; original input and exact 8-micro settlement survive. No provider calls.
- No activation or cap/source/schema/UI changes; developing stories remains inactive pending semantic and whole-edition acceptance. Handbook behavior unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3038-{format,lint,check,build}.log); final results follow.
- Read-only check-scheduled-reader.ts 2026-11-19T15:00:00Z passes: five topics, 25 real stories/22 posts. Nov 20–22 reviews remain next.
- Final pnpm check/build pass: 1,282 unit tests; 336 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Commit/push and API/worker restart follow; post-restart health and scheduled reader verification required.

## 2026-11-20: iteration 3039 — bind ordinary reservation to provider input

- Clean main at f591406a; no inherited work. Alerts clear and healthz passes; next scheduled review remains Nov 20 at 15:00 UTC.
- Ordinary requests could change during reservation I/O, allowing provider input to exceed the priced request. Snapshot request/model before admission; reservation and dispatch now share it.
- Scoped callers still recheck original request identity after reservation and release changed requests. No activation, caps, sources, schema, UI or handbook flow changes.
- Targeted reserved-plan suite: 31 passes, including ordinary mutation during admission and prior scoped refusal controls; no live provider calls.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3039-{format,lint,check,build}.log). Final results follow.
- Final pnpm check/build pass: 1,283 unit tests, 336 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Read-only scheduled reader gate passes for Nov 19: five topics, 25 real stories/22 posts; all 38 sources healthy, digest queue zero failures, disk 61%.
- Commit/push and API/worker restart follow; post-restart health and reader verification required.

## 2026-11-20: iteration 3040 — bind cache identity to ordinary request input

- Clean main at a7a79636; no inherited work. Alerts clear; healthz passes; sources healthy, digest queue zero failures, disk 61%.
- Ordinary requests could change during cache lookup, dispatching different input under the original fingerprint. Snapshot request/model before fingerprinting; input checks, cache, dispatch and repair share stable input.
- Scoped requests retain original-reference admission checks; developing stories stays inactive. No caps, source, schema, UI or handbook behavior changes.
- Targeted command: pnpm exec tsx --test apps/api/test/reserved-llm-plan.test.ts — 32 passes, including cache-hit/miss mutation controls; no provider calls.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3040-{format,lint,check,build}.log). Final results follow.
- Read-only reader gate (API NODE_PATH, node --env-file, --import tsx scripts/check-scheduled-reader.ts 2026-11-19T15:00:00Z) verifies five real topics, 25 stories/22 posts.
- Next scheduled reviews remain Nov 20–22 at/after publication; no new reference tooling or paid replay.
- Final pnpm check/build pass: 1,284 unit tests; 336 integration passes/four expected skips; typecheck/lint/format/boundaries green.
- Commit/push and API/worker restart follow; post-restart health and reader gates required.

## 2026-11-20: iteration 3041 — validate developing-history chronology

- Clean main at 8b3dc7d2; no inherited work. Alerts clear; healthz database/Redis pass. Next scheduled edition review: Nov 20 15:00 UTC.
- Inactive edition coordinator accepted oldest-first history, although link construction treats the first matching occurrence as latest coverage. Reject reversed history before any topic dispatch.
- Also refuse duplicate/blank edition identities and more than seven history editions; preserve accepted story arrays on refusal. Equal publication instants and seven-entry histories remain supported.
- Targeted edition coordinator tests: seven pass, including invalid later-topic histories making zero earlier calls. No provider calls or activation; no cap/source/schema/UI or handbook behavior changes.
- Archived older progress and completed task detail to keep orientation files smaller; open priorities unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build all pass (logs /tmp/3041-*.log). 1,285 unit passes; 336 integration passes/four expected skips.
- Read-only Nov 19 scheduled reader gate passes: five topics, 25 stories/22 posts. Commit/push and API/worker restart follow; post-restart health/reader verification required.

## 2026-11-20: iteration 3042 — consistent shared historical editions

- Clean main at 42c7e590; no inherited work. Alerts clear, healthz passes; disk 62%. Historical failed check-only units remain, no active service alert.
- Inactive developing coordinator now refuses conflicting timestamps for one historical edition across topics before dispatch, preserving every original selection.
- Equivalent timezone representations and different historical edition IDs remain accepted. Developing stories stays inactive; no paid replay or cap change.
- Targeted coordinator suite: eight passes, including zero-dispatch refusal and accepted controls.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3042-*.log); final results below.
- Read-only scheduled reader gate verifies Nov 19 publication: five topics, 25 real stories/22 posts. Next reviews Nov 20–22 after 15:00 UTC.
- Final check/build pass: 1,286 unit passes; 336 integration passes/four expected skips; typecheck, lint, formatting and boundaries green.
- API/worker restarted active; post-restart healthz and reader gate pass, alerts clear. Commit/push follows; production feature remains inactive.

## 2026-11-20: iteration 3043 — refuse ambiguous historical story identities

- Clean main at 04bf97e6; no inherited work. Alerts clear and healthz database/Redis pass; next scheduled review Nov 20 after 15:00 UTC.
- Inactive developing coordinator now rejects blank or duplicate story IDs within one historical snapshot before any topic matching spend; accepted selections remain intact.
- Recurring IDs across different historical editions/topics remain valid. Capacity regression now uses distinct IDs, isolating its actual capacity boundary.
- Targeted command: pnpm exec tsx --test apps/api/test/enrich-developing-edition.test.ts — nine pass, including zero-dispatch refusal and valid recurrence.
- No activation, paid replay, cap, source, schema, UI or handbook behavior change.
- Read-only Nov 19 scheduled reader gate passes: five topics, 25 real stories/22 posts.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3043-*.log); final results below.
- Final check/build pass: 1,287 unit passes; 336 integration passes/four expected skips; typecheck, lint, formatting and boundaries green.
- API/worker restarted active; post-restart healthz, scheduled reader gate and alerts pass. Commit/push follows; next Nov 20–22 scheduled reviews remain pending.

## 2026-11-20: iteration 3044 — complete saved U.S. semantic reference

- Clean main at b0d38134; no inherited work. Alerts clear; healthz database/Redis pass. Nov 20 scheduled review awaits 15:00 UTC.
- Reviewed all five Nov 18 U.S. selections against all six available same-topic history snapshots (20 stories), using exact saved prose and original editorial excerpts.
- One supported Peltola outcome update; four explicit nonmatches, with tempting shared-subject alternatives and source-supported wording limits documented.
- Reference integrity check passes: five exact current IDs/excerpts, six snapshots, 20 earlier stories and exact Peltola predecessor. Manual agent labels only; no provider calls or model acceptance claim.
- Developing stories remains inactive pending semantic output and whole-edition budget acceptance. No code, UI, schema, source, caps or handbook behavior changes.
- Read-only scheduled reader gate passes for Nov 19: five topics, 25 real stories/22 posts. Next daily missed-event reviews remain Nov 20–22.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3044-*.log); final results follow.
- Final check/build pass: 1,287 unit passes; 336 integration passes/four expected skips; typecheck, lint, formatting and boundaries green. Commit/push and API/worker restart follow, then health/reader/alert verification.

## 2026-11-20: iteration 3045 — complete saved Gaming semantic reference

- Clean main at 45b46466; no inherited work. Alerts clear; healthz database/Redis pass; API/worker active.
- Reviewed all five saved Nov 18 Gaming selections against seven same-topic history snapshots/35 stories and all five original editorial excerpts.
- GTA pre-order totals support a continuation, with launch/stock/attribution limits; Zelda repeats old milestones and requires whole-request refusal. Three other stories have no predecessor.
- Complete Gaming reference therefore refuses the combined request; all ten evidence-backed U.S./Gaming selections now have manual decisions. No model acceptance, activation, paid replay or cap change.
- Inline fixture integrity check passes: five exact selection/excerpt IDs, seven snapshots, 35 earlier stories, all cited current/history IDs valid.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3045-*.log); final results follow.
- Full check/build pass: 1,287 unit passes; 336 integration passes/four expected skips; typecheck, lint, formatting and boundaries green.
- Nov 19 scheduled reader gate passes: five topics, 25 real stories/22 posts. Commit/push and API/worker restart follow, then health/reader/alerts verification. Nov 20 review awaits 15:00 UTC.

## 2026-11-20: iteration 3046 — execute complete saved developing matching reviews

- Clean main at bc933647; no inherited work. Alerts clear; healthz database/Redis pass; API/worker active.
- Existing offline developing evaluator now checks multiple labelled selections per case; saved Nov 18 Gaming/U.S. controls cover all ten reviewed selections, including seven explicit nonmatches.
- Each continuation requires exact historical membership, nearest predecessor and edition count. Duplicate/foreign/reversed labels or conflicting legacy labels reject.
- Targeted test: pnpm exec tsx --test apps/api/test/evaluate-developing-stories.test.ts — six pass; omitted GTA and false nonmatch links fail while the legacy Zelda control passes.
- Manual control partitions only; Zelda rewrite refusal, actual model semantics and whole-edition budget acceptance remain open. Production inactive; no paid calls, cap, UI, source or handbook behavior change.
- Read-only scheduled reader gate passes Nov 19: five topics, 25 real stories/22 posts. Nov 20 review remains due after 15:00 UTC.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (logs /tmp/3046-*.log); final results below.
- Full check/build pass: 1,289 unit passes; 336 integration passes/four expected skips; typecheck, lint, formatting and boundaries green. Fixture integrity confirms original inputs unchanged; ten labels/seven nonmatches added.
- Commit/push and API/worker restart follow, then health/reader/alerts verification. Next: Nov 20 scheduled edition review after 15:00 UTC.

## 2026-11-20: iteration 3047 — capture every reviewed developing continuation

- Clean main at 032360e4; no inherited work. Alerts clear; healthz database/Redis pass; API/worker active.
- Found saved end-to-end capture still dispatched only legacy Zelda membership despite the complete Gaming review also identifying GTA.
- Capture now consumes all reviewed positive memberships (two Gaming, one U.S.), verifies exact linked rewrite IDs and supplies all three scripted rewrite outputs through complete captured admission.
- Saved Gaming refusal covers both GTA and Zelda atomically; exact selections and untouched inputs retained. Scripted unchanged prose remains transport-only, not semantic acceptance.
- Targeted: pnpm exec tsx --test apps/api/test/capture-developing-execution.test.ts — three pass.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (/tmp/3047-*.log). Final results below.
- Developing stories remains inactive; no provider calls, caps, UI, source, schema or handbook behavior changes. Nov 20 scheduled review due after 15:00 UTC.
- Full check passes: 1,289 unit passes; 336 integration passes/four expected skips; typecheck, lint, formatting and boundaries green. Nov 19 reader gate: five topics, 25 real stories/22 posts. Build, commit/push and API/worker restart follow.

## 2026-11-20: iteration 3048 — persist complete reviewed developing memberships

- Clean main at c2810de2; no inherited work. Alerts clear; healthz database/Redis pass; API/worker active.
- Snapshot/JSON contract tests still covered only one legacy story per saved topic; now consume all reviewed selections, including nonmatches and simultaneous Gaming continuations.
- Every reviewed predecessor, edition count, absent label, selected ID/order and independent link copy is checked through snapshot serialization.
- Targeted: pnpm exec tsx --test apps/api/test/developing-saved-evidence.test.ts — 16 pass.
- Manual memberships only; developing stories remains inactive pending model semantics and whole-edition budget acceptance. No paid calls or cap changes.
- Scheduled reader gate: pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-19T15:00:00Z — five topics, 25 real stories/22 posts pass.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (/tmp/3048-*.log); final results below.
- Full check/build pass: 1,297 unit passes; 336 integration passes/four expected skips; typecheck, lint, formatting and boundaries green. Commit/push and API/worker restart follow; Nov 20 review due after 15:00 UTC.

## 2026-11-20: iteration 3049 — complete saved Tech matching reference

- Clean main at 106db510; no inherited work. Alerts clear; healthz database/Redis pass; API/worker active.
- Reviewed five Nov 18 Tech selections against all 32 earlier stories in seven history snapshots; all are explicit nonmatches, including separate Nvidia shipment/policy/leadership events.
- Added labels to existing fixture and reasons to semantic reference; original current evidence absent, so no rewrite-support claim. Production remains inactive; no paid calls/cap changes.
- Existing evaluator and snapshot checks consume all five labels. False Google experiment/smartglasses link fails while legacy Nvidia control passes; Gaming tests now identify topic explicitly.
- Targeted: pnpm exec tsx --test apps/api/test/evaluate-developing-stories.test.ts apps/api/test/developing-saved-evidence.test.ts — 27 pass.
- Reader: pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-19T15:00:00Z — five topics, 25 real stories/22 posts pass.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (/tmp/3049-*.log); results below.
- Next: Nov 20 scheduled daily review after 15:00 UTC; retain semantic and whole-edition budget gates.
- Full check/build pass: 1,302 unit passes; 336 integration passes/four expected skips; typecheck, lint, format and boundaries green. Original fixture inputs unchanged. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3050 — separate NBA injury events in developing reference

- Clean main at 123627a8; no inherited work. Alerts clear, healthz database/Redis pass, API/worker active.
- Reviewed five Nov 18 NBA headlines against 34 earlier stories; retained LeBron match and added two explicit injury nonmatches. Spurs/Warriors unresolved without original evidence; partial reference only.
- Brown trade dispute and Gueye injury adversarial links fail despite correct LeBron match. Existing snapshot checks consume both new negative labels; original saved inputs unchanged.
- Targeted: pnpm exec tsx --test apps/api/test/evaluate-developing-stories.test.ts apps/api/test/developing-saved-evidence.test.ts — 30 pass.
- Reader: pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-19T15:00:00Z — five topics, 25 real stories/22 posts pass.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (/tmp/3050-*.log); final results below.
- Developing stories inactive; no provider calls, cap changes, UI/source/schema changes. Next: Nov 20 scheduled review after 15:00 UTC.
- Full check/build pass: 1,305 unit passes; 336 integration passes/four expected skips; typecheck, lint, format and boundaries green. Commit/push and API/worker restart follow.

## 2026-11-20: iteration 3051 — source-bound manual GTA rewrite

- Clean main at 775e6598; no inherited work. Alerts clear; healthz database/Redis pass; API/worker active.
- Added one concrete manual GTA continuation rewrite and claim-by-claim source review to the existing semantic reference.
- Retained attributed pre-orders/revenue and critical reception; omitted unsupported launch, stock movement and inherited data-provider claims.
- One manual rewrite accepted; no model response certified. Zelda still refuses the combined Gaming request; production inactive and budget gates unchanged.
- Targeted: pnpm exec tsx --test apps/api/test/developing-rewrite-support.test.ts apps/api/test/capture-developing-execution.test.ts — five pass.
- Reader: pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-19T15:00:00Z — five topics, 25 real stories/22 posts pass.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build (/tmp/3051-*.log); results below.
- No code/UI/source/schema changes or provider calls. Next: Nov 20 scheduled review after 15:00 UTC.
- Full check/build pass: 1,305 unit passes; 336 integration passes/four expected skips; typecheck, lint, formatting and boundaries green. Commit/push and API/worker restart follow.
