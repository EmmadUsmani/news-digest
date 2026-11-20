# Progress

[Iterations 2768–2777](docs/progress-archive/2026-11-18-iterations-2768-2777.md).

[Iterations 2778–2786](docs/progress-archive/2026-11-18-iterations-2778-2786.md).

[Iterations 2875–2880](docs/progress-archive/2026-11-19-iterations-2875-2880.md).

[Iterations 2881–2890](docs/progress-archive/2026-11-19-iterations-2881-2890.md).

[Iterations 2891–2898](docs/progress-archive/2026-11-19-iterations-2891-2898.md).

[Iterations 2899–2910](docs/progress-archive/2026-11-19-iterations-2899-2910.md).

[Iterations 2937–2940](docs/progress-archive/2026-11-19-iterations-2937-2940.md).

[Iterations 2941–2945](docs/progress-archive/2026-11-19-iterations-2941-2945.md).

[Iterations 2946–2958](docs/progress-archive/2026-11-19-iterations-2946-2958.md).

## 2026-11-19: iteration 2989 — close Nov 19 recall audit under item 71

- Clean main at 06dfcff1; no inherited work. Read new owner item 71; closed Nov 19 Missed section partial and removed stale instructions to continue its census from TASKS.
- Preserved existing evidence unchanged; 120/153 article routes unresolved, event recall unavailable. Nov 19 does not count toward three complete reviews; next reviews are Nov 20–22, followed by cause tally and one measured root-cause fix.
- Alerts clear; /healthz database/Redis pass; all 14 services and 38 source checks pass, disk 61%. Digest-generation has zero failures and next run Nov 20 15:00 UTC. Live latest remains 7a747d9c with five topics.
- No runtime, UI, source, schema or handbook changes; no provider calls. Verification logs: /tmp/2989-{format,lint,check,build}.log. Queue check initially used invalid digest name; all-queue check succeeds with digest-generation.
- pnpm format/lint:fix, full pnpm check and pnpm build pass; 1,212 unit tests and 332 integration passes/four expected skips. Final diff check passes. Commit/push and API/worker restart follow; next use waiting time for items 69/70 and review Nov 20 scheduled evidence.

## 2026-11-19: iteration 2990 — prepare selected developing enrichment

- Clean main at 3470c4eb; no inherited work. Alerts clear, health database/Redis pass, 14 monitored services/38 source checks healthy and digest failures zero; next edition Nov 20 15:00 UTC.
- Added inactive selection → matching → rewrite orchestration: original representative source reporting feeds matching, complete history retained, accepted selections stay fixed. No production generation wiring or provider calls.
- Missing/duplicate evidence, duplicate selection IDs, non-AI fallback and oversized history refuse without dispatch; matching/refused rewrite retains the original accepted array without labels/retries. Successful rewrite preserves metadata and unmatched stories.
- Two new offline tests verify source-vs-edited input, dispatch order, atomic fallback, capacity and unchanged inputs. Semantic review, complete runtime/ledger admission and real-edition acceptance remain open.
- pnpm format, pnpm lint:fix, pnpm check and pnpm build pass: 1,214 unit tests, 332 integration passes/four expected skips. Logs /tmp/2990-{format,lint,check,build}.log; targeted test log /tmp/2990-target.log.
- Local latest confirms 7a747d9c/five topics/25 real stories using existing local probe visitor. Initial unforwarded reader request hit rate limit; VM public HTTPS connection unavailable, so external HTTPS acceptance not claimed.
- Updated TASKS and developing evidence; no active behavior/UI/source/schema/handbook change. Commit/push and API/worker restart follow. Next: semantic/whole-edition admission; Nov 20–22 missed-event daily reviews.

## 2026-11-19: iteration 2991 — explicit developing enrichment refusals

- Clean main at ac268708; no inherited work. Alerts clear; health database/Redis pass. Monitored services/source checks healthy; digest-generation zero failures, next run Nov 20 15:00 UTC.
- Inactive selected enrichment reports explicit reasons for preflight refusals, no validated matches and rewrite refusal; history capacity is checked before dispatch without truncation. All failures retain the exact accepted array.
- Extended the two offline tests to assert refusal reasons, missing matcher/empty selection, no-dispatch preflight and atomic rewrite fallback. Targeted tests pass; no provider calls or production activation.
- Updated TASKS and developing evidence. No UI/source/schema/handbook changes. Runtime budget admission, semantic review and real-edition reader acceptance remain open.
- Live latest remains 7a747d9c, five topics/25 real stories. Initial private job-state filter unsupported in public mode; queue-count probe succeeds.
- pnpm format, pnpm lint:fix and full pnpm check pass: 1,214 unit tests, 332 integration passes/four expected skips. Targeted log /tmp/2991-target.log; full logs /tmp/2991-{format,lint,check,build}.log.
- pnpm build and final diff check pass. Commit/push and API/worker restart follow. Next: complete semantic/whole-edition admission; Nov 20–22 daily missed-event recall reviews.

## 2026-11-19: iteration 2992 — developing rewrite budget lifecycle

- Clean main at df5a98d1; no inherited work. Alerts clear; health database/Redis pass, 14 monitored services and 38 source checks healthy, disk 61%. Digest-generation has zero failures; next edition Nov 20 15:00 UTC.
- Added six offline selected-enrichment scenarios using the real BudgetedLlm, scripted provider and in-memory ledger: reservation refusal, success, malformed JSON, uncertain transport, provider limit and expired execution.
- Exact attribution/reservation bounds, actual-usage settlement, uncertain-hold retention, provider-limit release and no-dispatch refusals pass. Failures preserve the accepted array; repair disabled, no retries.
- This establishes rewrite-stage composition only, not transactional DB/whole-edition admission or semantic quality. Production remains inactive; no provider calls or runtime/UI/source/schema/handbook changes. Updated TASKS and developing evidence.
- Targeted test passes (3 tests); pnpm format, pnpm lint:fix, full pnpm check and pnpm build pass: 1,215 unit tests, 332 integration passes/four expected skips. Logs /tmp/2992-{target,format,lint,check,build}.log; final diff check passes.
- Live latest 7a747d9c retains five topics/25 real stories. Commit/push and API/worker restart follow. Next: semantic review and whole-edition admission; Nov 20–22 recall reviews.

## 2026-11-19: iteration 2993 — bound developing matching by execution deadline

- Clean main at 3a089c97; no inherited work. Alerts clear; health database/Redis pass, 14 monitored services/38 source checks healthy, disk 61%. Digest queue has zero failures; next edition Nov 20 15:00 UTC.
- Threaded optional execution context through the semantic grouping port and EventGrouping into BudgetedLlm. Prepared selected enrichment now bounds matching and rewriting by the same deadline; existing callers retain ambient context behavior.
- Three offline scenarios compose real grouping/budget wrappers with a scripted provider/in-memory ledger. Expired-before-match dispatches/reserves nothing; expiry after matching settles matching but prevents rewrite reservation; both retain the accepted array. Success verifies context identity and run/topic attribution across both calls. No retries or provider calls.
- Targeted enrichment/matching tests pass (7); pnpm format, pnpm lint:fix and full pnpm check pass: 1,216 unit tests, 332 integration passes/four expected skips. Logs /tmp/2993-{target,format,lint,check,build}.log.
- Updated TASKS and developing evidence; no active feature/UI/source/schema/handbook change. Live latest 7a747d9c retains five topics/25 real stories. Semantic review, whole-edition transactional admission and activation remain open; Nov 20–22 recall reviews stay next scheduled work.
- pnpm build and final diff check pass. Commit/push and API/worker restart follow; no production activation or paid replay.

## 2026-11-19: iteration 2994 — five-topic PostgreSQL enrichment admission

- Clean main at 6b58d3c6; no inherited work. Alerts clear; health database/Redis pass, 14 monitored services active and 37 enabled sources healthy. Digest-generation has zero failures; next edition Nov 20 15:00 UTC.
- Added an isolated-container integration test composing real EventGrouping, BudgetedLlm and PostgresLlmLedger across five concurrent synthetic topics. All ten matching/rewrite reservations settle; their stored bounds equal offline feature cost and protected-work funds remain charged.
- Clearing cache then consuming headroom with a competing hold makes the earlier fitting preflight stale: all five topics retain the exact accepted stories, with no later provider dispatch or ledger row. Scripted provider only; no live database or paid calls.
- Initial test reused identical rewrite prompts, so cache coalescing correctly produced six calls; distinct synthetic source titles establish ten independent requests. Targeted disposable PostgreSQL/Redis test now passes (one test); temporary runner removed.
- Updated TASKS and developing evidence. No runtime/UI/source/schema/handbook change or activation. Synthetic reservation composition does not establish atomic whole-edition admission or saved-edition semantic quality; those gates remain open.
- Live latest 7a747d9c retains five topics/25 real stories. pnpm format, pnpm lint:fix and full pnpm check pass on rerun: 1,216 unit tests, 333 integration passes/four expected skips. Logs /tmp/2994-{target,format,lint,check,build}.log. pnpm build and final diff check pass. Commit/push and API/worker restart follow.
- First full check: 1,215/1,216 unit tests pass; unrelated SIGTERM listener-rebind test hit EADDRINUSE. All three cleanup cases pass targeted retry; full check rerun passes. Logs /tmp/2994-check-first.log and /tmp/2994-server-retry.log.
- Archived iterations 2946–2958 to keep PROGRESS below 25 KB. Iteration crossed into Nov 20 UTC during verification.
- Next: complete saved-edition semantic and whole-edition admission; Nov 20–22 scheduled missed-event recall reviews.

## 2026-11-20: iteration 2995 — joint published story/post event comparison

- Clean main at 51f218e7; no inherited work. Alerts clear, health database/Redis pass, 37 enabled sources healthy (Destructoid remains inactive); digest queue has zero failures, next scheduled edition Nov 20 15:00 UTC.
- Item 69: labelled all 44 Nov 18 publication slots across five topics with 37 manual topic-events. Added retained prose/hash evidence and extended the existing offline NBA evaluator to check joint IDs, full post texts, unchanged stories and event retention.
- Conservative 40-slot subset retains all 37 labels: NBA largest share 33.33%→14.29%, U.S. 22.22%→12.50%, Tech/World unchanged; Gaming rises 30%→33.33% after removing the WoW repeat but retaining distinct nomination facts. Reject simple deletion as sufficient for deployment; no model selection or pool recall claimed.
- Updated TASKS, RANKING and the bounded comparison. Nov 20 waiting-time evaluation commit used; no tuning/provider calls, runtime/UI/source/schema/handbook changes. Production selection unchanged. Nov 12–17 and real-selector/material-fact acceptance remain open.
- Targeted evaluator, pnpm format, pnpm lint:fix, full pnpm check and pnpm build pass: 1,216 unit tests; 333 integration passes/four expected skips. Logs /tmp/2995-{evaluation,format,lint,check,build}.log.
- Public latest 7a747d9c retains five topics/25 stories/22 posts. Default local reader probe hit rate limit; established explicit local-probe visitor header succeeds. Next: Nov 20–22 scheduled recall reviews; developing semantic/whole-edition admission, without more evaluation commits today.

## 2026-11-20: iteration 2996 — separate matching refusal from valid absence

- Clean main at 86891f25; no inherited work. Alerts clear; database/Redis health passes, monitored services active, 37 enabled sources healthy; Destructoid remains inactive. Digest queue has zero failures; next edition Nov 20 15:00 UTC.
- Prepared matching now returns explicit validated/unavailable outcomes. Inactive enrichment reports matching-refused for unavailable/failed/invalid matching, while valid empty memberships remain a successful no-link outcome. Existing link-only consumers retain compatibility.
- Offline controls distinguish valid absence from transport/refusal, unknown occurrences, singleton groups and repeated memberships. Enrichment preserves the accepted array and never rewrites valid no-link topics; real deadline refusal now exposes matching-refused.
- Targeted matching/enrichment tests pass (9). pnpm format and pnpm lint:fix pass; pnpm build passes. Full pnpm check passes: 1,218 unit tests and 333 integration passes/four expected skips. Logs /tmp/2996-{target,format,lint,check,build}.log.
- Updated TASKS and developing evidence. This prerequisite does not establish atomic whole-edition admission or semantic quality; generation remains unwired. No provider calls, feature activation or UI/source/schema/handbook changes.
- Final diff check passes; commit/push and API/worker restart follow. Live latest 7a747d9c retains five topics/25 real stories/22 posts. Next: whole-edition admission and semantic review; Nov 20–22 recall reviews after each scheduled edition. Today's evaluation commit is already used.

## 2026-11-20: iteration 2997 — atomic developing edition output

- Clean main at 58897d3b; no inherited work. Alerts clear; health database/Redis pass. Sources continue collecting; Destructoid remains inactive. Digest queue has zero failures, next scheduled edition Nov 20 15:00 UTC.
- Added inactive edition coordinator: stage topic enrichment, discard all staged rewrites on any refusal, and stop later dispatch. Duplicate/blank topic IDs or mixed run IDs refuse before matching. Valid no-link and ineligible topics retain accepted stories.
- Four offline controls pass, including successful first-topic rewriting followed by a later refusal restoring every original array. Atomicity covers output only; settled provider charges remain. Whole-edition budget reservation and saved-edition semantic acceptance remain open; generation stays unwired.
- pnpm format, pnpm lint:fix, full pnpm check and pnpm build pass: 1,222 unit tests, 333 integration passes/four expected skips. Logs /tmp/2997-{target,format,lint,check,build}.log. No provider calls or UI/source/schema/handbook changes.
- Live latest 7a747d9c retains five topics/25 real stories/22 posts. Updated TASKS and developing evidence. Final diff check, commit/push and API/worker restart follow.
- Next: whole-edition budget admission and semantic acceptance; Nov 20–22 missed-event recall reviews after scheduled editions. Today's evaluation commit is already used.

## 2026-11-20: iteration 2998 — validate every developing topic before spending

- Clean main at 90ef01e7; no inherited work. Alerts clear, health database/Redis pass; enabled sources collecting, Destructoid inactive. Digest queue has zero failures; next edition Nov 20 15:00 UTC.
- Shared pure topic preparation now runs across the entire inactive edition before matching starts. Missing/duplicate evidence, excess history and unavailable matching in later topics refuse with zero earlier matching dispatches and preserve every accepted array.
- Ten targeted tests pass, including the existing successful-rewrite/later-runtime-refusal rollback control. No provider calls or activation; whole-edition budget reservation and semantic acceptance remain open.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build; logs /tmp/2998-{target,format,lint,check,build}.log. All pass: 1,223 unit tests, 333 integration passes/four expected skips; build passes.
- Live reader probe retains edition 7a747d9c, five topics/25 stories/22 posts. Default local rate-limit bucket returns 429; explicit local-probe forwarded visitor succeeds. No UI/source/schema/handbook changes.
- Next: whole-edition budget admission and semantic acceptance; Nov 20–22 recall reviews after scheduled editions. Today's evaluation commit already used.

## 2026-11-20: iteration 2999 — match every topic before any developing rewrite

- Clean main at b97e1493; no inherited work. Alerts clear; health/database/Redis pass; API/worker active. Enabled sources healthy, Destructoid inactive. Digest queue has zero failures; next edition Nov 20 15:00 UTC.
- Separated selected-topic matching from rewriting. Inactive edition orchestration finishes every matching result before dispatching rewrites; a later matching refusal preserves all accepted arrays without earlier rewrite spend.
- Ten targeted tests pass, including all-three-matches-before-rewrites ordering and a second rewrite refusal that restores every accepted array and prevents the third rewrite. Existing single-topic behavior retained.
- pnpm format and pnpm lint:fix pass; full pnpm check passes: 1,223 unit tests, 333 integration passes/four expected skips. Shared explicit input types resolve extraction inference; API typecheck and pnpm build pass. Logs /tmp/2999-{target,format,lint,check,build}.log.
- Live latest 7a747d9c retains five topics/25 stories/22 posts. No provider calls, activation, UI/source/schema/handbook changes. Matching charges remain spent; whole-edition budget reservation and semantic acceptance remain open.
- Next: whole-edition admission and saved-edition semantic acceptance; Nov 20–22 scheduled recall reviews. Today's evaluation commit is already used.
- Final diff check passes; commit/push and API/worker restart follow.

## 2026-11-20: iteration 3000 — developing edition chronology guard

- Clean main at 0a8e0030; no inherited work. Alerts clear; health/database/Redis and API/worker pass. Enabled sources collecting; Destructoid remains inactive. Digest queue has zero failures; next edition Nov 20 15:00 UTC.
- Inactive edition coordinator rejects mixed or invalid publication instants, blank run IDs, same-run history and invalid/current/future history before any matching dispatch. Equivalent instants with different timezone offsets remain valid.
- Six targeted tests pass; malformed later-topic controls preserve both original arrays with zero dispatch, and equivalent-instant control completes both matches. No provider calls or activation; whole-edition budget admission and semantic acceptance remain open.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build (logs /tmp/3000-{target,format,lint,check,build}.log); all pass: 1,224 unit tests, 333 integration passes/four expected skips; build passes.
- Live reader retains 7a747d9c, five topics/25 real stories/22 posts. No UI/source/schema/handbook changes. Next: whole-edition budget admission and saved-edition semantic acceptance; Nov 20–22 scheduled recall reviews.
- Final diff check passes; commit/push and API/worker restart follow.

## 2026-11-20: iteration 3001 — atomic developing-plan ledger reservations

- Clean main at 93fe155e; no inherited work. Alerts clear; health/database/Redis, sources and digest-generation queue pass. Latest edition remains 7a747d9c with five topics/25 real stories/22 posts.
- Added optional reserveBatch capability: one shared ledger lock, existing per-request budget rules, all holds commit together or all roll back on refusal. Single-call reservations retain existing behavior; IDs retain plan order, with normal settlement/release.
- Isolated PostgreSQL test passes later shared/model/verification refusal rollback, invalid plans, competing whole plans (one winner), and settlement/release. No provider calls, cap changes or feature activation.
- pnpm format, pnpm lint:fix and pnpm check pass: 1,224 unit tests, 334 integration passes/four expected skips. pnpm build passes. Logs /tmp/3001-{format,lint,check,build}.log. Final diff check passes; commit/push and API/worker restart follow.
- TASKS and developing evidence updated. No UI/source/schema/handbook changes. Next: BudgetedLlm consumption of pre-admitted holds, whole-edition obligations/semantic acceptance; Nov 20–22 recall reviews after scheduled editions.
