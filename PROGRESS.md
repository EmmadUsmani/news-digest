## 2026-11-06: iteration 909 — dispatch one fixed X retry

- Started clean on main; no leftover work. Alerts clear, 36 sources healthy, no failed digest jobs; next edition Nov 6 15:00 UTC.
- Switched-off fixed scheduler now dispatches one separately admitted linked retry for uncertain failures or settled unconfirmed zero-post/no-citation calls. Rechecks live balance, configuration, enabled state, schedule and time window before dispatch; completed empty, fetched/cited, rejected and budget-blocked outcomes stop.
- searchX accepts fixed parent links and returns failed call identity/reason after recording the hold. Returned usage settles before retry; timeout holds and durable ledger uniqueness remain intact. Offline runtime coverage checks settlement/hold ordering, linked admission and refusal on later ticks; guard tests cover budget/window/configuration changes. No paid calls or production activation.
- Verification: targeted 14 tests; pnpm format; pnpm lint:fix; pnpm check (524 unit/223 isolated integration tests, typecheck/lint/format/boundaries); pnpm build; check-handbook.ts 05-social-posts; git diff --check. All pass. First full check stopped on newly archived entry formatting; fixed and reran successfully.
- Rebuilt/restarted API, worker, docs and schema; all active. /healthz database/Redis green, alerts clear; real latest edition has four topics/17 stories/14 posts. No migration needed.
- Updated TASKS, SOURCES and social handbook; archived iteration 895 to keep PROGRESS small. No owner input needed.
- Next: authorized Nov 5 NBA/Gaming/World keyword reruns on the same window, then fair semantic query/Nov 6 fresh-window round and edition review. Fixed search remains off.

## 2026-11-06: iteration 910 — authorized Nov 5 keyword reruns

- Started clean on main; no leftover work. Owner would care: measure whether the repaired paid X path actually executes before any production decision.
- Alerts clear, 36 sources healthy, no failed digest jobs; next scheduled edition Nov 6 15:00 UTC. Added narrowly scoped Nov 6 rerun mode: exact original inputs/window, NBA/Gaming/World only, required tool choice, shared caps, deterministic IDs and no further retry. Continuations skip attempted cells.
- Live direct xAI/Grok 4.3 reruns: NBA failed/$0.010803/zero posts; Gaming completed/$0.026117/three posts; World failed/$0.011233/zero posts. Post-fix failure rate 2/3 (66.7%). Gaming actual tool limit 3; all three in-window, likes 552/1,058/1,063, official oEmbed HTTP 200.
- All $0.048153 settled, zero new holds; lifetime charged $1.025802/$2.50, historical timeout holds preserved. Immutable private evidence, manifest, extracted report and embeds saved separately. Fixed search stays off; no ingestion, winner or production activation.
- First extraction rejected token-only failures; extended offline extraction to accept validated token usage with zero missing fetched counters, preserving historical fetched-only support. Six extractor and fifteen runner tests pass. Initial full check passed (527 unit/223 isolated integration); final rerun covers extractor change (528 unit/223 isolated integration, all pass).
- Verification final: pnpm check passed (typecheck/lint/format/boundaries and tests); pnpm format; pnpm lint:fix; pnpm build passed; git diff --check clean. API/worker/docs/schema restarted active, /healthz database/Redis green, reader HTTP 200, 36 healthy sources and alerts clear; saved latest edition four topics/17 stories/14 posts.
- Updated TASKS, SOURCES, experiment guide/review and NEEDS_FROM_HUMAN; appended STEERING 39 failure-rate ack. Archived iterations 896–897 and shortened TASKS to keep orientation small. No owner action requested.
- Next: scorer review for three Gaming candidates (relevance ≥6/interestingness ≥4 is non-promotion), fair semantic preparation, then STEERING 40 outcomes before 13:00 UTC if ready; Nov 6 edition review and fresh round after 21:00 UTC. NBA/World provider tool failures remain a decision gap; no more Nov 5 reruns.

## 2026-11-06: iteration 911 — fair semantic experiment preparation

- Started clean on main; no leftover work. Alerts clear, 36 sources healthy, /healthz database/Redis green, no failed digest-generation jobs; next edition Nov 6 15:00 UTC.
- Experiment-only semantic requests now ask what is new and getting attention in the saved topic name. Description exclusions and keyword operators no longer enter the semantic request; exact start-inclusive/end-exclusive UTC window and saved likes minimum remain.
- Requests explicitly retain returned likes/reposts/replies/views even below threshold, omit unknown counts and preserve nonempty tool results. Eight results requested or supported tool limit; Grok 4.3, required tool choice, budget and production fixed-search OFF unchanged.
- Regression coverage includes operator-bearing guidance, excluded text, missing-count instructions, exact bounds and unchanged tool configuration. Six focused input tests pass.
- Read-only prepare-x-experiment.ts for Nov 5–6 21:00 UTC returned four saved topics and clean natural-language queries; private inputs saved under ~/.local/state/news-digest/x-experiment/preparation-911/ (700/600). Refresh at dispatch to capture current settings. No paid calls, ingestion or edition writes.
- Verification: pnpm format; pnpm lint:fix; pnpm check (528 unit/223 isolated integration tests, typecheck/lint/format/boundaries); pnpm build; git diff --check all passed. Rebuilt/restarted API, worker, docs and schema active; initial startup health probe raced readiness, repeated health green, reader HTTP 200, latest real edition four topics/17 stories/14 posts, alerts clear.
- Archived iteration 898 to keep orientation small. Updated TASKS, SOURCES and experiment guide; no owner input needed. No handbook change: production behavior unchanged.
- Next: score three Gaming rerun candidates; Nov 6 edition review after publication and fresh X round after 21:00 UTC, keywords first. Bluesky outcomes remain next in Current order; NBA/World tool failures remain unresolved.

## 2026-11-06: iteration 912 — Gaming keyword scorer review

- Started clean on main; no leftover work. Alerts clear, 36 sources healthy, /healthz database/Redis green; no failed digest jobs, next edition Nov 6 15:00 UTC.
- Scored all three saved verified Gaming rerun posts with production Haiku social triage, saved author/reported likes/media hints and current topic guidance. Shared reserve/verification admission applied, repair disabled; one successful verification call/$0.000337, zero unscored. No X calls, ingestion or edition writes.
- Scores: RIG Gaming giveaway 4/1; MSI Gaming giveaway 4/1; Tiny Legends launch 7/4 with 552 reported likes. Under STEERING 39 one usable/non-promotion candidate out of three. All in-window, above saved 500 likes; zero exact-ID matches against retained 863-post free-link baseline. Tech's prior keyword yield is 2/10; NBA/World still failed.
- Private scorer inputs/results, ledger settlement and hashed baseline join saved mode 600. Runner's initial console count used the wrong property (interestingness instead of production importance); corrected offline, asserted one gate-passer without another paid call. Original rerun evidence unchanged.
- Updated experiment review, SOURCES, TASKS and NEEDS_FROM_HUMAN; archived iteration 899 to keep PROGRESS small. No owner action needed; no production behavior/handbook change.
- Verification: pnpm format; pnpm lint:fix; pnpm check (528 unit/223 isolated integration tests, typecheck/lint/format/boundaries); pnpm build; git diff --check. All passed.
- Rebuilt/restarted API, worker, docs and schema; /healthz green and reader HTTP 200. First source probe raced readiness; repeat shows 36/36 healthy, alerts clear and no failed digest-generation jobs.
- Next: Nov 6 edition review after publication; fresh X comparison after 21:00 UTC, keywords first. Bluesky outcomes next in Current order. Fixed X remains off, no further Nov 5 reruns; NBA/World failures remain unresolved.

## 2026-11-06: iteration 913 — attribute AI diagnostics to step and topic

- Started clean on main; no leftover work. Alerts clear, 36/36 sources healthy, no failed digest jobs; next scheduled edition Nov 6 15:00 UTC. X round waits until 21:00 UTC.
- Implemented STEERING 40 diagnostic prerequisite: LLM validation and budget decision/failure/settlement logs now include purpose and topic ID. Article/social triage, story grouping and article/social editors supply topic IDs, including Bluesky editing.
- Metadata stays outside prompt/cache fingerprints; no model/provider, budget, collection, query, selection or reader behavior changes. No paid calls or edition writes. Older requests without topic IDs still work; rejected text remains excluded.
- One initial historical journal read confirmed missing attribution; historical Bluesky log/ledger reconciliation and saved outcomes remain open, including Nov 5 Sonnet skip. This step does not resolve those causes.
- Verification: focused LLM tests 24/24; pnpm format; pnpm lint:fix; pnpm check; pnpm build; handbook observability check (18 pages/28 tables); git diff --check. All passed (528 unit/223 isolated integration tests).
- Updated TASKS and observability handbook; archived iteration 900. SOURCES/NEEDS_FROM_HUMAN unchanged because source behavior and owner requirements did not change.
- Rebuilt/restarted API, worker, docs and schema active; /healthz database/Redis green, reader HTTP 200, 36/36 sources healthy and alerts clear.
- Next: finish STEERING 40 historical attribution once, then persist per-topic Bluesky outcomes/inspector before 13:00 UTC if ready; Nov 6 edition review after publication and fresh X comparison after 21:00 UTC. Fixed X stays off.

## 2026-11-06: iteration 914 — historical Bluesky attribution

- Started clean on main; no leftover work. Alerts clear, /healthz green and 36/36 sources healthy. X round waits until 21:00 UTC; Nov 6 edition not yet due.
- Completed STEERING 40's one-pass Nov 4–5 worker journal/ledger/snapshot reconciliation; saved review and owner ack. No paid calls, collection or edition writes.
- NBA/Gaming had no slots both days. Nov 4 World exhausted four attempts; Tech recovered with Haiku repair and one pick. Nov 5 Tech Sonnet returned no picks; World Sonnet was refused before dispatch, then Haiku initial/repair failed.
- Refusal was not insufficient scheduled reserve; exact model-allocation/blocked-ledger decision inputs were not logged. Historical candidate counts/rejected text remain unavailable; investigation closed as instructed.
- Assertions passed for both snapshots' X counts, all 11 settled editor calls and $0.045524 total. Private extracts retained 700/600 under ~/.local/state/news-digest/bluesky-history-914/.
- Updated TASKS, SOURCES and STEERING ack; production behavior unchanged, no handbook or owner-input change needed.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; git diff --check. All passed: 528 unit/223 isolated integration tests, typecheck/lint/format/boundaries and build.
- Rebuilt/restarted API, worker, docs and schema; health and reader checks recorded at deployment.
- Next: persist per-topic Bluesky outcomes and admin inspector line before 13:00 UTC if ready; Nov 6 edition review after publication, X comparison after 21:00 UTC. Fixed X stays off.

## 2026-11-06: iteration 915 — save Bluesky selection evidence

- Started clean on main; no leftover work. Alerts clear, health green and 36/36 sources healthy; X testing and edition review await their windows.
- New edition snapshots retain per-topic open slots, observations read, shortlisted candidates, picks and selection result. Full slots now save no-slot rather than looking like a successful empty edit.
- Results distinguish switched-off, no candidates, nothing passed triage, deliberate editor omission, picks, invalid/incomplete AI and unavailable AI. Existing selections and reader behavior are unchanged.
- Unavailable AI still combines budget refusal and other editor failures: exact budget result and inspector remain open. No guessed attribution, paid calls, collection/query/cap changes or edition writes.
- Added fixture checks for counts, empty paths, unavailable AI and schema round-trip/older missing fields. Initial integration run found three golden diffs; added diagnostic expectations and fixed no-service/full-slot attribution. Updated source table/handbook; archived 901–902.
- Verification: pnpm format; pnpm lint:fix; pnpm check (529 unit/223 isolated integration tests); pnpm build; handbook social-posts check; git diff --check. All passed on final run.
- Restarted API/worker/docs/schema, all active; /healthz database/Redis green, reader HTTP 200, 36/36 sources healthy, alerts clear and zero failed digest jobs.
- Next: propagate precise budget refusal through editor/triage outcomes, then inspector; item 40 per-post validation follows. Reserved slot stays unbuilt/off; Nov 6 review after publication and X round after 21:00 UTC.

## 2026-11-06: iteration 916 — Bluesky outcomes in the inspector

- Started clean on main; no leftover work. Alerts clear. X round and Nov 6 edition review await their scheduled windows.
- Admin edition inspector now shows one Bluesky outcome per topic with open slots, candidates read/shortlisted and picks. Older snapshots explicitly report missing evidence.
- All eight stored results have plain labels; unavailable AI keeps its cause unknown. Exact budget-refusal attribution remains open; reader and selection behavior unchanged.
- Added read-only Playwright coverage for saved editions and eight synthetic outcomes at desktop/mobile widths; saved clearly named synthetic screenshots. No writes, paid calls or external browser requests.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; handbook social-posts check; pnpm exec tsx scripts/smoke-bluesky-outcomes.ts; git diff --check. All passed: 529 unit/223 isolated integration tests.
- Initial browser harness needed an async entry point and a text matcher including nested counts; fixed and rerun passed. Handbook length check caught 101 lines; shortened to 100 and passed.
- Updated TASKS and affected handbook page. SOURCES and NEEDS_FROM_HUMAN unchanged: collection and owner requirements unchanged.
- Restarted API/worker/docs/schema; /healthz database/Redis green, 36/36 sources healthy, alerts clear and zero failed digest jobs.
- Next: exact budget-refusal attribution, then Bluesky per-post validation; Nov 6 edition review after publication and X round after 21:00 UTC. Reserved slot remains unbuilt/off; fixed X stays off.

## 2026-11-06: iteration 917 — explain ledger budget refusals

- Started clean on main; no leftover work. Alerts clear, 36/36 sources healthy and no failed digest jobs. X round and edition review await their windows.
- Added committed ledger admission logs with purpose/topic/model and exact shared, model-allocation, scheduled-reserve and provider-block refusal reasons plus numeric inputs; verification-cap early refusal is logged separately.
- Multiple simultaneous limits stay visible; rollback produces no admission log. No request/rejected text, paid calls, selection changes or budget-rule changes.
- This closes the missing ledger-decision inputs, not the saved Bluesky result: propagate precise budget refusal through AI/editor/triage outcomes next, then per-post validation and item 41 alerts.
- Verification: pnpm format; pnpm lint:fix; pnpm check (530 unit/223 isolated integration tests); pnpm build; pnpm exec tsx scripts/check-handbook.ts 09-observability; git diff --check. All passed.
- Updated TASKS and observability handbook; archived iterations 903–904 to keep PROGRESS small. SOURCES/NEEDS_FROM_HUMAN unchanged: collection and owner requirements unchanged.
- Rebuilt/restarted API/worker/docs/schema; /healthz database/Redis green, reader HTTP 200, 36/36 sources healthy and alerts clear. Fixed X and reserved Bluesky slot remain off.

## 2026-11-06: iteration 918 — call-scoped AI failure outcomes

- Started clean on main; no leftover work. Alerts clear, health green, 36/36 sources healthy and no failed digest jobs. X round and edition review await their windows.
- Added typed JSON outcomes for budget refusal, provider spend limit, transport failure, exhausted validation and repair input limit; successful outcomes retain validated values.
- Coalesced requests share the outcome, including across run IDs; nullable callers keep existing behavior. Refusals do not poison later funded calls, and cached success remains usable without funds.
- This is the shared evidence path for item 40, not saved Bluesky attribution yet. No paid calls, selection, prompt, collection, cap or schema changes.
- Added offline coverage for coalesced causes, mixed old/new callers, later funding, cached success and a refused repair. Targeted llm.test.ts: 27 passed.
- Verification: pnpm format; pnpm lint:fix; pnpm check (533 unit/223 isolated integration tests); pnpm build; git diff --check. All passed.
- Restarted API/worker/docs/schema; all active, /healthz database/Redis green, reader HTTP 200, 36/36 sources healthy and alerts clear.
- TASKS condensed; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged because this is internal result plumbing.
- Next: carry jsonOutcome through social triage/editor and persist Bluesky budget-refused results; then item 41 alerts. Nov 6 review after publication, X round after 21:00 UTC; reserved slot and fixed search stay off.

## 2026-11-06: iteration 919 — save Bluesky budget-refusal outcomes

- Started clean on main; no leftover work. Alerts clear, health green, 36/36 sources healthy and zero failed digest jobs. Edition review/X round await their windows.
- Carried call-scoped AI outcomes through social triage and editor fallback into saved Bluesky selection evidence; inspector now labels budget refusal explicitly.
- Mixed validation/refusal reports editing failure, successful Haiku recovery stays complete, and legacy nullable adapters retain unknown causes. No inference from shared diagnostics.
- Added offline coverage for exact refusals, mixed failures, fallback recovery, cached triage preservation and saved-schema round trips. No paid calls, prompts, selection, collection or budget changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 05-social-posts; smoke-bluesky-outcomes.ts; git diff --check. All passed: 535 unit/223 isolated integration tests.
- Browser passed saved compatibility and nine synthetic states at desktop/mobile widths; inspected updated screenshots. Handbook limit initially caught 101 lines; shortened and passed.
- Updated TASKS/affected handbook; archived iterations 905–906. SOURCES/NEEDS_FROM_HUMAN unchanged because collection and owner requirements are unchanged.
- Rebuilt/restarted API/worker/docs/schema; all active, /healthz database/Redis green, reader HTTP 200, 36/36 sources healthy, no failed digest jobs and alerts clear.
- Next: item 41 durable saved-edition alerts, then per-post validation. Nov 6 review after publication; X round after 21:00 UTC. Reserved slot and fixed X stay off.

## 2026-11-06: iteration 920 — durable Bluesky edition alerts

- Started clean on main; no leftover work. Health green, 36/36 sources healthy, no failed digest jobs and alerts clear. Higher-priority reviews await publication/21:00 UTC.
- Added BlueskyEditingFailed and BlueskyNoPicks from saved scheduled snapshots; no worker counters. Missing/failing/refused results flag the latest edition; three open-slot opportunities without a pick persist until a pick.
- Excluded on-demand, switched-off and pre-step-1 editions (cutover 2026-11-06 01:36 UTC). A restricted aggregate view keeps snapshot content unavailable to the metrics login.
- Offline SQL coverage verifies exclusions, sibling failures, missing results, repeated fresh reads and recovery; alert rules verify thresholds and clearing. No paid calls or selection/budget changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check (535 unit/224 isolated integration tests); pnpm build; check-handbook.ts 09-observability; vmalert-tool-prod unittest; check-observability.ts --verify-alerts; git diff --check. All passed.
- Loaded aggregate view/exporter config and alert rules; live verification reports 18 healthy alert rules, zero firing/pending, saved Bluesky aggregates 0/0. No eligible scheduled edition exists yet; neither new alert fires.
- Rebuilt/restarted API/worker/docs/schema; health/database/Redis green, reader HTTP 200 and 36/36 sources healthy. Updated TASKS and affected handbook; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Next: item 40 per-post validation, then default-off reserved slot; Nov 6 edition/cost review after publication, X experiment after 21:00 UTC. Fixed search remains off.

## 2026-11-06: iteration 921 — keep valid Bluesky editor picks

- Started clean on main; no leftover work. Health/alerts green, 36/36 sources healthy, zero failed digest jobs. Higher priorities await edition publication/21:00 UTC.
- Bluesky now validates picks separately, retaining valid siblings in returned order and dropping bad fields, unknown/repeated IDs, unsupported claims and excess picks. X validation is unchanged.
- Only wholly rejected nonempty replies retry; deliberate empty replies stop. Existing unsupported-claim checks, slot limits, collection and budgets remain unchanged; no paid calls.
- Saved optional category counts survive successful/failed outcomes and sanitized cache reads; old editions remain compatible. Purpose v2 isolates earlier all-or-nothing cached results.
- Added offline mixed-reply, retry/empty, cache and saved-success/failure coverage. Full checks initially caught an unbound test helper and archive formatting; fixed both before final verification.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; API rebuild; check-handbook.ts 05-social-posts; git diff --check. All passed: 538 unit/224 isolated integration tests.
- Rebuilt/restarted API/worker/docs/schema; all active, /healthz database/Redis green and reader HTTP 200. Sources healthy, no failed digest runs, alerts clear.
- Updated TASKS, SOURCES and affected handbook; archived iterations 907–908 to keep PROGRESS small. NEEDS_FROM_HUMAN unchanged; no new owner requirements.
- Next: build default-off Bluesky reserved slot; review Nov 6 edition/cost gate after publication, X round after 21:00 UTC. Reserved slot and fixed X search stay off.

## 2026-11-06: iteration 922 — default-off Bluesky reserved slot

- Started clean on main; no leftover work. Health/alerts green, 36/36 sources healthy, zero failed digest jobs. Higher priorities await publication/21:00 UTC.
- Added BLUESKY_RESERVED_SLOT_ENABLED=1, default OFF pending Nov 6 AI/cost gate. Full topics can request one Bluesky pick; only a qualifying distinct pick replaces the last X pick. Empty/refused/unavailable editing keeps X unchanged.
- Existing open slots remain usable; zero-budget topics make no calls. Saved optional hold/replaced-X-ID evidence survives schema parsing; opportunity counts include held slots, so existing durable alerts cover them.
- Confirmed editTopicPosts preserves editor reply order through preferX. Explicitly requested descending editorial quality in the prompt and pinned saved order offline; instruction fingerprints isolate old cache entries. No selection thresholds, collection, queries or caps changed.
- Fixed editorial provenance for same-count replacements. Updated TASKS, SOURCES and affected handbook; NEEDS_FROM_HUMAN unchanged. No paid calls or UI changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check (543 unit/224 isolated integration tests); pnpm build; check-handbook.ts 05-social-posts; targeted Bluesky/social editor/order tests; git diff --check. All passed.
- Initial checks caught unsupported findLastIndex and handbook length; corrected before full verification. Rebuilt/restarted API/worker/docs/schema; after startup health/database/Redis green, reader HTTP 200, 36/36 sources healthy and alerts clear.
- Next: review Nov 6 edition/grouping/cost after publication and apply reserved-slot activation gate; X round after 21:00 UTC. Reserved slot and fixed search remain OFF. While waiting, final reader layout follows Current order.
