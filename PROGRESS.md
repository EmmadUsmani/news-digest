# Progress

Earlier entries: [archive](docs/progress-archive/2026-11-13-pre-2126.md).

## 2026-11-13: iteration 2117 — retain X count age in final selection

- Clean main; no inherited work. Initial alerts zero; healthz, 38 sources and all queues healthy. NBA/item 58 acceptance awaits the 15:00 UTC scheduled edition; public mode remains off.
- Found final X selection received reported likes without their observation time. It now receives the validated report timestamp and explicit single-snapshot/unknown-growth evidence; missing timestamps remain unknown.
- Focused `pnpm exec tsx --test --test-reporter=dot apps/api/test/social-editorial-selection.test.ts`: 12 pass; covers dated/missing evidence, zero/unknown likes, 1,200-character bound and original-post preservation.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 931 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings; `git diff --check` passes.
- Handbook initially exceeded 100 lines; shortened affected paragraph. `pnpm exec tsx scripts/check-handbook.ts social-posts` now passes (18 pages/one unchanged diagram/39 tables).
- API/worker restarted active; healthz and `check-scheduled-reader.ts 2026-11-12T15:00:00Z` pass (five topics/25 stories/22 posts). Updated TASKS, SOURCES and affected handbook; NEEDS_FROM_HUMAN unchanged.
- No paid/external verification, collection, provider, budget, flag or sharing changes. Next: scheduled NBA/item 58 acceptance, then public activation with sharing private.

## 2026-11-13: iteration 2118 — reconcile public activation handoff

- Clean main; no inherited work. Initial alerts zero; healthz, source readiness and queue readiness pass. Next natural edition is Nov 13 15:00 UTC; NBA/item 58 acceptance remains pending.
- Corrected the public-access plan's current handoff, which still said to stop for lead review and treated Grafana capacity as a launch gate. It now follows STEERING 59 and the readiness runbook: private-sharing activation after scheduled acceptance, parallel lead review, no public Grafana, public Spend, then scheduled public-mode acceptance before the owner's sharing decision.
- Updated TASKS; SOURCES and NEEDS_FROM_HUMAN unchanged. No runtime, collection, budget, provider, flag or sharing changes; no paid verification.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 931 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings.
- `pnpm exec tsx scripts/check-handbook.ts` passes: 18 pages/22 unchanged diagrams/39 tables. Saved-reader check passes: five topics/25 stories/22 posts. `git diff --check` passes.
- API/worker restart and post-restart health verified before commit. Next: scheduled NBA/item 58 acceptance, then private-sharing public activation; while waiting, continue X/Bluesky tuning under STEERING 59.

## 2026-11-13: iteration 2119 — retain all X reported counts in selection

- Clean main; no inherited work. Initial alerts zero; health, 38 sources and queues healthy. NBA/item 58 acceptance awaits the 15:00 UTC edition; public mode stays off.
- X triage previously received only likes from validated reports. It and final selection now retain reported reposts, replies and views, including explicit zero/unknown distinctions. Counts remain unverified hints; official metrics and ranking weights unchanged.
- Focused X selection, social-editorial selection and production triage tests pass (42 tests): invalid reports withheld, offset normalization, unknown/zero counts, cache invalidation for every added count and bounded final-editor transport.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 931 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings; social-posts handbook check passes (18 pages/one unchanged diagram/39 tables); `git diff --check` passes.
- API/worker restarted active; healthz and `check-scheduled-reader.ts 2026-11-12T15:00:00Z` pass (five topics/25 stories/22 posts). Initial health probe raced startup; bounded retry passed.
- Updated TASKS, SOURCES and affected handbook; archived progress 2105–2110 to keep the live log small. NEEDS_FROM_HUMAN unchanged. No paid calls, collection, budget, provider, flag or sharing changes.
- Next: scheduled NBA/item 58 acceptance, then public activation with sharing private; continue authorized X/Bluesky tuning while waiting.

## 2026-11-13: iteration 2120 — correct social selection provenance

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. Scheduled NBA/item 58 acceptance still awaits 15:00 UTC; public mode remains off.
- Found Reddit AI selections recorded a misleading missing-X-search-evidence reason. Limited that diagnostic to X posts; Reddit retains its own provenance. No ranking, platform reservation, budgets or saved editions changed.
- `pnpm exec tsx --test --test-reporter=dot apps/api/test/social-editorial-selection.test.ts`: 12 pass, including mixed-platform provenance and original-post preservation.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 931 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings.
- API/worker restarted; healthz 200 and saved-reader check for Nov 12 pass (five topics/25 stories/22 posts). No handbook/source behavior changes; SOURCES and NEEDS_FROM_HUMAN unchanged.
- No paid calls, provider, collection, flag or sharing changes. Next: scheduled NBA/item 58 acceptance, then public activation with sharing private; continue authorized social tuning while waiting.

## 2026-11-13: iteration 2121 — reject invalid X ranking dates

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. Scheduled NBA/item 58 acceptance awaits 15:00 UTC; public mode stays off.
- X engagement ranking could return a NaN bonus for an invalid publication date, or accept an invalid cutoff. Both now return unknown evidence with zero bonus; valid-date scoring and weights unchanged.
- `pnpm exec tsx --test --test-reporter=dot apps/api/test/x-engagement-ranking.test.ts apps/api/test/x-search-engagement.test.ts`: six pass, including invalid publication/cutoff combinations and valid-date control.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 932 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings.
- API/worker restarted; healthz database/Redis healthy after startup retry. Saved-reader check for Nov 12 passes: five topics/25 stories/22 posts.
- Updated TASKS; bug fix needs no handbook/source change. SOURCES and NEEDS_FROM_HUMAN unchanged. No paid calls, provider, collection, budget, flag or sharing changes.
- Next: scheduled NBA/item 58 acceptance, then public activation with sharing private; continue authorized social tuning while waiting.

## 2026-11-13: iteration 2122 — withhold ambiguous Bluesky growth

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. NBA/item 58 acceptance still awaits 15:00 UTC; public mode remains off.
- Conflicting counts at an earliest/latest observation timestamp previously supplied arbitrary net growth. Growth now stays unknown for either conflict, including equivalent timestamp formats; ranking and valid signed changes unchanged.
- `pnpm exec tsx --test --test-reporter=dot apps/api/test/bluesky-ranking.test.ts`: five pass, covering all three counts at either endpoint, input-order independence and identical duplicate controls.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 933 unit/290 integration tests, four expected skips. `pnpm build`: pass with existing bundle warnings; handbook social-posts check passes (18 pages/one unchanged diagram/39 tables).
- API/worker restarted active; healthz passes after bounded startup retry. Saved-reader Nov 12 check passes (five topics/25 stories/22 posts).
- TASKS, SOURCES and affected handbook updated; NEEDS_FROM_HUMAN unchanged. No paid calls, provider, collection, budget, flag or sharing changes.
- Next: scheduled NBA/item 58 acceptance, then public activation with sharing private; continue authorized social tuning while waiting.

## 2026-11-13: iteration 2123 — compare Bluesky publication instants

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. Scheduled NBA/item 58 acceptance remains due at 15:00 UTC; public mode stays off.
- Equivalent publication timestamps previously prevented valid same-post growth comparisons. Compare parsed instants in history and conflict checks; mismatched authors/times remain excluded.
- `pnpm exec tsx --test --test-reporter=dot apps/api/test/bluesky-ranking.test.ts`: six pass, including offset/UTC equivalence, input-order independence, mismatched identity/time and equivalent-format count conflicts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 934 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings.
- API/worker restarted active; healthz passes after startup retry. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z` passes: five topics/25 stories/22 posts.
- TASKS updated; bug fix needs no handbook/source change. SOURCES and NEEDS_FROM_HUMAN unchanged. No paid calls, provider, collection, budget, flag or sharing changes.
- Next: scheduled NBA/item 58 acceptance, then public activation with sharing private; continue authorized social tuning while waiting.

## 2026-11-13: iteration 2124 — resolve Tech launch/promotion comparison

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts; NBA/item 58 awaits 15:00 UTC.
- Completed the saved Nov 11 FishAudio comparison from docs/ideas.md using a temporary read-only `pnpm exec tsx scripts/tmp-social-review.ts` probe (removed afterward). Read-only repeatable-read transaction; no provider instantiated or writes.
- Nine of 84 saved scores qualify; the only higher-interestingness unselected post duplicates the selected official Claude launch. Remaining distinct alternatives have equal/lower scores and less concrete topic substance. Retain the voice launch; no ranking/prompt/publication change justified.
- Both saved editorial stages recognized its promotion. Corrected the earlier metrics ambiguity: official metrics empty, saved reasons retain unverified xAI counts and bounded bonus. Evidence in docs/edition-reviews/2026-11-11-tech-social-launch.md.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 934 unit/290 integration tests, four expected skips. `pnpm build` passes with existing bundle warnings. Full handbook check passes: 18 pages/22 diagrams/39 tables.
- API/worker restarted active; `/healthz` database/Redis healthy. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z`: five topics/25 stories/22 posts, pass.
- TASKS and resolved idea updated; SOURCES/NEEDS_FROM_HUMAN unchanged. No paid calls, budgets, flags, provider or sharing changes.
- Next: 15:00 UTC scheduled NBA/item 58 acceptance, then private-sharing public activation; continue remaining authorized social tuning meanwhile.

## 2026-11-13: iteration 2125 — isolate Tech cluster evidence loss

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts; NBA/item 58 acceptance still awaits 15:00 UTC, public mode off.
- Read all five saved Nov 12 Tech summaries against immutable evidence. NVIDIA has 23 coverage links but only its empty-excerpt representative reaches editing; saved Verge triage already recognizes the resignation. Other four summaries retain supplied facts.
- Traced rank → editor → saved evidence transport; scoped bounded attributed member evidence repair in docs/edition-reviews/2026-11-12-tech-depth.md and TASKS. No runtime/publication change; repair remains open.
- Temporary `pnpm exec tsx scripts/tmp-tech-depth.ts` read-only repeatable-read probe passes assertions for edition/coverage/evidence IDs, saved triage and five reader summaries; current substantive Verge excerpt separately identified as mutable. Probe removed; no provider instantiated or writes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 934 unit/290 integration tests, four expected skips. `pnpm build`: pass with existing bundle warnings; full handbook check passes (18 pages/22 diagrams/39 tables).
- API/worker restarted active; `/healthz` database/Redis healthy. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z`: five topics/25 stories/22 posts, pass.
- SOURCES/NEEDS_FROM_HUMAN unchanged; no source, budget, provider, paid-call, flag or sharing changes.
- Next: bounded cluster-member evidence transport repair offline before the noon generation freeze; 15:00 NBA/item 58 acceptance, then public activation with sharing private.

## 2026-11-13: iteration 2126 — prepare attributed cluster evidence

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts; NBA/item 58 awaits 15:00 UTC, public mode stays off.
- Added pure `clusterEvidence` projection: explicit lead plus two substantive coverage members, own publisher/URL/source/time, 300-character titles/600-character excerpts. Does not alter ranking, editor input or saved publication yet.
- `pnpm exec tsx --test --test-reporter=dot apps/api/test/group-shortlist.test.ts`: five pass; empty lead, substantive member, attribution, bounds, missing/duplicate members, unrelated clusters, stable ordering and Unicode truncation verified with synthetic fixtures.
- Editor/validator/saved-evidence integration and historical saved-case acceptance remain open; final transport must retain existing admission/token limits. TASKS/review updated; no handbook/source behavior change.
- Archived older PROGRESS entries after reaching 25 KB. First full check caught archive formatting; corrected before rerun.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 935 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm obs sources`: 38 healthy/zero unhealthy.
- `pnpm build`: pass with existing bundle warnings. API/worker restarted active; `/healthz` database/Redis healthy after startup retry. Saved-reader check passes: five topics/25 stories/22 posts.
- SOURCES/NEEDS_FROM_HUMAN unchanged. No paid calls, budgets, provider, collection, flags or sharing changes.
- Next: wire attributed evidence through editor/validator/publication before noon; review 15:00 scheduled NBA/item 58 acceptance.

## 2026-11-13: iteration 2127 — prepare attributed editor evidence contract

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts; scheduled NBA/item 58 acceptance remains due 15:00 UTC, public mode off.
- Added optional editor cluster evidence contract: representative plus two separately attributed reports; only representative IDs selectable, member IDs citable. Invalid/shared membership and changed representative facts fail before calls.
- Absence validation reads only cited reports at the exact transported title/excerpt bounds. Fixtures cover supported member sentences, uncited/unsupported/truncated-away refusal, attribution and supplemental-story refusal.
- Existing production callers do not supply the optional field: deployed prompt/publication behavior unchanged. Production projection/persistence wiring, historical saved-case acceptance and final admission review remain open.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 938 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build`: pass with existing bundle warnings.
- API/worker restarted active; `/healthz` database/Redis healthy. Source-status startup connection failure cleared on retry: 38 healthy/zero unhealthy. Saved-reader check passes: five topics/25 stories/22 posts.
- TASKS/review updated; no handbook/source behavior change. SOURCES/NEEDS_FROM_HUMAN unchanged; no paid calls, budgets, provider, flags or sharing changes.
- Next: wire projection and saved evidence together before noon; review 15:00 scheduled NBA/item 58 acceptance.

## 2026-11-13: iteration 2128 — wire Tech cluster evidence and snapshots

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. NBA/item 58 still awaits 15:00 UTC; public mode off.
- Tech production editor input and saved cited evidence now share bounded attributed cluster projection. Member publisher names reach editing; publisher objects/links survive snapshots. Other topics retain existing inputs and evidence.
- Fixed representative projection to retain ranked word-boundary excerpts; Unicode-boundary comparison stays aligned. Unknown citations fail closed; ranking, coverage, ownership and fallback unchanged.
- Offline targeted editor/grouping/composition: 44 pass. Added publication-path member citation/snapshot regression; no providers called. Historical saved-case and worst-case admission acceptance remain open.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 941 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build`: pass with existing bundle warning. `pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline`: pass.
- API/worker restarted active; `/healthz` database/Redis healthy; 38 healthy sources. Saved-reader check initially raced startup, then passes five topics/25 stories/22 posts.
- Updated TASKS, Tech diagnosis and affected handbook page. SOURCES/NEEDS_FROM_HUMAN unchanged; no paid calls, caps, provider, collection, flag or sharing changes.
- Next: historical Tech case and worst-case admission acceptance before noon; review 15:00 scheduled NBA/item 58 acceptance, then public activation with sharing private.

## 2026-11-13: iteration 2129 — preserve fallback for oversized Tech evidence

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts; NBA/item 58 still awaits 15:00 UTC, public mode off.
- Added full ten-cluster/30-report admission regression through real editor/BudgetedLlm with offline provider: maximal ASCII fields admit once; escaped controls and multibyte text exceed the unchanged 100 KB byte bound.
- Found oversized input previously threw through publication. Editor now returns its existing unavailable result at the same bound, retaining source-excerpt fallback before any reservation or provider dispatch. Prompt content, output limit, caps and selection unchanged.
- `pnpm exec tsx --test --test-reporter=dot apps/api/test/editor-evidence.test.ts apps/api/test/editor.test.ts`: 42 pass. Historical saved-case acceptance remains open; synthetic bounds fixtures are not historical content.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 944 unit/291 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` and handbook pipeline check pass.
- API/worker restarted active; `/healthz` database/Redis healthy after startup retry. `pnpm obs sources`: 38 healthy/zero unhealthy. Scheduled-reader check passes with explicit Nov 12 15:00 cutoff (initial invocation lacked required argument).
- Updated TASKS and Tech review. SOURCES/NEEDS_FROM_HUMAN unchanged; no paid calls, budgets, provider, flags or sharing changes.
- Next: historical Tech-case acceptance before noon; review scheduled 15:00 NBA/item 58 acceptance, then public activation with sharing private.
