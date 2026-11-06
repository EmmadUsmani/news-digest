## 2026-11-05: iteration 900 — Reader archive

- Started clean on main; no leftover work. Owner would care: browse past editions in a clean date/topic list and open their saved reader pages.
- Built `/editions` with 20-entry pages, URL-backed page navigation, empty/error/retry states and light/dark mobile/desktop layouts. Added Past editions link from the current reader; final edition layout remains next.
- Reader history now includes only saved topic IDs/names alongside dates, without editorial modes or methods; no extra per-edition reads. Unit coverage verifies this boundary and rejects invalid offsets.
- Browser checks use real saved history for screenshots/links and replay it for paging/failure cases; no writes, paid calls, settings changes or X activation. Four archive screenshots saved; desktop light/mobile dark visually reviewed. Discarded unrelated separation screenshots.
- Browser script initially used unsupported top-level await, then expected an empty real third page; corrected its wrapper and retry assertion. Product browser checks passed. Integration HTTP expectation still omitted topic names; updated it and reran.
- Updated TASKS and Stack/runtime and Operations handbook; archived iterations 888–889 to keep PROGRESS small. SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries and 509 unit tests; first integration 219/220 exposed the stale history expectation; pnpm test:integration rerun passed all 220; pnpm build; smoke-reader-archive.ts; smoke-admin-separation.ts; check-handbook.ts 01-stack-and-runtime and 08-operations; git diff --check.
- Four app services restarted; /healthz database/Redis green; 36 sources/zero errors with collection through 23:16 UTC; Nov 5 scheduled edition complete and Nov 6 15:00 UTC next run retained. Existing observability shipper memory warning remains.
- Push initially rejected because owner commit 390687a added STEERING 39 and revised X plan; fetched/merged without rewriting history. Docs-only merge needs no rebuild. Item 39 now precedes UI; updated TASKS. Subsequent push twice rejected by integration with `fatal error in commit_refs_rules`; local commits retained, publishing blocked.
- Next: X reliability/accounting under STEERING 39, three Nov 5 failed keyword reruns after Nov 6 00:00 UTC; then fresh Nov 6 round/edition review. Edition reader layout follows. No X activation before decision.

## 2026-11-05: iteration 901 — X token-only accounting and timeout

- Started clean on main; no leftover work. Owner would care: failed X tool execution no longer leaves a full hold when valid token usage is available, and searches get 120 seconds.
- Shared validated usage parser between app adapter and experiment runner; absent post/profile counters default to zero, malformed counters still fail closed. Existing no-response holds remain charged. No paid calls or X activation.
- Synthetic runner coverage settles eight token-only calls at four micros each; adapter coverage checks absent/partial counters and malformed values. Initial direct mixed-suite invocation hit five expected isolation guards; used the proper full isolated harness afterward.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries, 510 unit and 221 isolated integration tests; pnpm build; check-handbook.ts 05-social-posts; git diff --check.
- Four app services rebuilt/restarted and active; /healthz database/Redis green after startup retry; saved Nov 5 reader endpoint readable; 36 sources/zero errors, latest success 23:30 UTC. Existing observability memory warning remains.
- Updated TASKS, SOURCES and social handbook; NEEDS_FROM_HUMAN unchanged. GitHub integration recovered: preflight push published the previous iteration's backlog successfully.
- Next: STEERING 39 supported forced tool execution and one separately admitted retry; append-only NBA/World saved-usage settlement; three failed keyword reruns after Nov 6 00:00 UTC. Production remains off; failure-rate acknowledgement needs real rerun evidence.

## 2026-11-05: iteration 902 — Require X search tool execution

- Started clean on main; no leftover work. Shared request builder now sets documented Responses `tool_choice: required`, with X search as the only tool. Existing windows, limits, caps and production-off state retained.
- Checked xAI public OpenAPI ModelRequest/ModelToolChoice; required means the model must call a tool. No paid calls; real execution/failure-rate evidence remains pending, so no STEERING 39 failure-rate acknowledgement yet.
- Offline coverage verifies revised prepared keyword/semantic bodies, all comparison styles and curated app requests require the sole X tool.
- Verification: targeted request suites 11/11; pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 05-social-posts; git diff --check. Full check passed typecheck/lint/format/boundaries, 511 unit tests and 221 isolated integration tests.
- Rebuilt/restarted API, worker, docs and schema services; all active. /healthz database/Redis green; saved reader edition readable; 36 active sources/zero errors with successes through 23:35 UTC. Existing observability memory warning remains.
- Updated TASKS, SOURCES and social handbook; NEEDS_FROM_HUMAN unchanged.
- Next: separately admitted one retry for no-execution/no-post failures; append-only saved NBA/World usage settlement; then authorized Nov 5 keyword reruns after Nov 6 00:00 UTC. Fixed production search remains off.

## 2026-11-05: iteration 903 — settle saved X experiment usage

- Started clean on main; no leftover work. Owner would care: NBA/World failed-response holds now reflect saved token usage, freeing $0.283288 for the authorized comparison.
- Added offline saved-response reconciliation and hash-linked journal settlements; original reservation entries and response files preserved. Repeated/undispatched settlement rejected; daily/lifetime admission and overrun guards use appended costs across restart.
- Reconciled NBA $0.010383 and World $0.006329 using existing runner rates; saved pre-settlement private journal and verified entries unchanged. Nov 5 charged $0.445318, lifetime $0.977649, remaining $1.522351. Gaming timeout holds retained. No paid calls or activation.
- Verification: targeted budget/CLI suite 9/9; pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 05-social-posts; git diff --check. First full check caught the newly archived page before formatting completed; formatted it and reran. Rerun passed typecheck/lint/format/boundaries, 514 unit tests and 221 isolated integration tests.
- Four app services rebuilt/restarted and active; initial startup health fetch failed, repeat database/Redis health green; real saved Nov 5 edition has four topics. All 36 sources healthy, latest success 23:41 UTC; Nov 6 15:00 schedule retained; alerts clear.
- An unsupported combined obs jobs --check/state invocation failed; corrected to the read-only jobs query. No failed digest runs; historical ingestion/social failures remain alongside healthy sources.
- Updated TASKS, SOURCES, saved experiment review and social handbook; archived iteration 890 to keep PROGRESS small. NEEDS_FROM_HUMAN unchanged.
- Next: one separately admitted retry in experiment and switched-off schedule; then three Nov 5 failed keyword reruns after Nov 6 00:00 UTC. Fair semantic query and fresh Nov 6 comparison follow; no production activation.
- Push first rejected for incoming lead-workflow commits; fetched/merged without rewriting history. Owner lead files left untouched; no app runtime changes. Post-merge formatting/lint and handbook check run before repush.

## 2026-11-05: iteration 904 — separately admit an experiment timeout retry

- Started clean on main; no leftover work. Alerts clear; all 36 sources healthy and no failed digest runs.
- Revised experiment runner retries a transport TimeoutError once with its own -retry-1 request/evidence and fresh $0.15 admission. Original hold stays charged; second timeout stops. Continuation skips attempted cells, preventing a third attempt.
- Offline tests cover successful retry settlement, double-timeout holds/restart, and daily-cap refusal before retry dispatch. Other transport errors still stop without retry; no paid calls or activation.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries, 517 unit and 221 isolated integration tests; pnpm build; check-handbook.ts 05-social-posts; git diff --check.
- Rebuilt/restarted API, worker, docs and schema services; health database/Redis green. Real saved reader edition returns four topics/17 stories; 36 sources healthy, success through 23:50 UTC; next edition Nov 6 15:00 UTC.
- Updated TASKS, SOURCES, experiment notes and social handbook; archived iteration 891 to keep PROGRESS small. NEEDS_FROM_HUMAN unchanged.
- Next: tool-failure/no-execution retry and switched-off scheduler retry, then authorized three failed Nov 5 keyword reruns after Nov 6 00:00 UTC. Fair semantic query and fresh Nov 6 round follow. Fixed production search remains off.
- First push rejected for incoming owner workflow commits; fetched/merged without rewriting history. New Current order keeps X reliability first. Owner files unchanged by this iteration; post-merge formatting/lint/handbook verification before repush.

## 2026-11-06: iteration 905 — retry unexecuted experiment searches once

- Started clean on main; no leftover work. Alerts clear, 36 sources healthy and no failed digest runs.
- Experiment now retries zero-fetched failed/unconfirmed execution once after settling actual returned usage and admitting a fresh $0.15 reservation. Completed empty searches never retry; no-response timeouts retain their holds. Restart skips attempted cells.
- Offline coverage includes failed-tool recovery, completed empty results, token-only double failure and continuation without a third attempt. No paid calls, keyword reruns or production activation.
- Verification: targeted runner 12/12; pnpm format; pnpm lint:fix; pnpm check passed typecheck/lint/format/boundaries, 519 unit tests and 221 isolated integration tests; pnpm build; check-handbook.ts 05-social-posts; git diff --check.
- Rebuilt/restarted API, worker, docs and schema; all active. /healthz database/Redis green; real saved edition has four topics/17 stories; all 36 sources healthy through Nov 6 00:00 UTC; next edition 15:00 UTC; alerts clear.
- Initial obs jobs query used an unknown queue; corrected read-only query shows no failed digest runs, historical ingestion/social failures alongside healthy sources.
- Updated TASKS, SOURCES and social handbook; archived iteration 892 to keep PROGRESS small. NEEDS_FROM_HUMAN unchanged.
- Next: switched-off scheduler retry, then authorized three failed Nov 5 keyword reruns on the same window. Fair semantic query and fresh Nov 6 round follow; fixed production search remains off.
- First push rejected for incoming owner instructions; fetched/merged without rewriting history. X reliability stays first; new item 40 queues Bluesky edition outcomes/recovery/slot gating ahead of UI. Owner files left untouched; post-merge format/lint/handbook checks before repush.

## 2026-11-06: iteration 906 — preserve scheduled X execution evidence

- Started clean on main; no leftover work. Alerts clear, all 36 sources healthy, no failed digest runs; next edition Nov 6 15:00 UTC.
- Production X adapter now exposes completed keyword/semantic tool execution independently of citations, and searchX preserves it after settlement. Failed, absent, unrelated and status-less traces stay unconfirmed.
- Offline protocol coverage checks six outcomes, including valid completed empty searches and token-only usage settling before persistence. This is the scheduler retry prerequisite; retry admission itself remains open. No paid calls or activation.
- Verification: targeted execution test; pnpm format; pnpm lint:fix; pnpm check; pnpm build; git diff --check. Passed typecheck/lint/format/boundaries, 520 unit tests and 221 isolated integration tests.
- Updated TASKS and SOURCES; archived iteration 893 to keep PROGRESS small. No handbook behavior change or owner input needed.
- Rebuilt/restarted API, worker, docs and schema; all active. /healthz database/Redis green; real saved edition has four topics/17 stories.
- Next: durable separately admitted scheduler retry, then authorized Nov 5 NBA/Gaming/World keyword reruns on the same window. Fixed search remains off.
- First push rejected for incoming owner instructions; fetched/merged without rewriting history. Item 41 queues Bluesky alerts after item 40 saved outcomes; Current order still prioritizes X reliability. No app runtime changes arrived.

## 2026-11-06: iteration 907 — persist scheduled X execution evidence

- Started clean on main; no leftover work. Alerts clear, 36 sources healthy and no failed digest runs; next edition Nov 6 15:00 UTC.
- Search settlement now saves confirmed/unconfirmed execution atomically with usage, cost and tool traces. Completed empty results survive restart; historical/pending calls keep unknown execution. Generated additive migration 0006; no paid calls or activation.
- Offline protocol checks assert settlement receives execution; isolated database coverage checks empty-search evidence via another connection, historical nulls, exact cost and rejection of repeat settlement.
- Verification: targeted execution test; pnpm format; pnpm lint:fix; pnpm check (520 unit/222 isolated integration, typecheck/lint/format/boundaries); pnpm build; check-handbook.ts 05-social-posts; git diff --check.
- Initial full check overlapped final migration generation and stopped on formatting/deleted temporary migration; corrected generated artifacts and reran successfully. Initial read-only digest queue name was invalid; corrected to digest-generation.
- Pre-migration news-digest-backup.service succeeded; pnpm migrate applied drizzle/0006_x_search_execution.sql. Rebuilt/restarted API, worker, docs and schema; all active. /healthz database/Redis green; saved edition four topics/17 stories; 36 healthy sources, alerts clear, no failed digest jobs.
- Updated TASKS, SOURCES and social handbook; archived iteration 894 to keep PROGRESS small. No owner input needed.
- Next: durable separately admitted scheduler retry, then authorized Nov 5 NBA/Gaming/World keyword reruns on the same window. Fair semantic query/fresh Nov 6 round follow. Fixed search remains off.
- Fetched/fast-forwarded incoming owner lead-only documentation commit c44d975 before committing; no runtime changes or owner-file edits.

## 2026-11-06: iteration 908 — durable fixed X retry admission

- Started clean on main; no leftover work. Alerts clear, all 36 sources healthy, no failed digest jobs; next edition Nov 6 15:00 UTC.
- Fixed search ledger now admits one linked retry for an uncertain timeout or settled unconfirmed zero-post/no-citation call. Parent must match topic/day/style/model/run and be a primary; enabled topic, UTC day and shared daily/monthly caps still apply.
- Timeout holds remain counted. Pending/rejected calls, completed empty searches, settled historical unknown execution, fetched/cited posts and retry chains cannot qualify. Migration 0007 separates primary/retry uniqueness without deleting evidence. Scheduler dispatch remains next; fixed search OFF, no paid calls.
- Verification: pnpm format; pnpm lint:fix; pnpm check (520 unit/223 isolated integration tests, typecheck/lint/format/boundaries); pnpm build; check-handbook.ts 05-social-posts; git diff --check. New isolated test covers two connections/concurrent admission, restart dedupe, exhausted budget, preserved holds and exclusions.
- Backup service succeeded; pnpm migrate applied drizzle/0007_fixed_x_retry.sql. Rebuilt/restarted API, worker, docs and schema; all active. /healthz database/Redis green; saved latest edition four topics/17 stories, alerts clear.
- Updated TASKS, SOURCES and social handbook; no new owner input. Initial jobs CLI positional argument was rejected; corrected --queue query confirms zero failed digest jobs.
- Next: wire switched-off fixed scheduler retry dispatch through durable admission, then authorized Nov 5 NBA/Gaming/World keyword reruns. Fair semantic query/fresh Nov 6 round follow; no production activation.

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
