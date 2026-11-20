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
