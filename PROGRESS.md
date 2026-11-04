## 2026-11-04: iteration 648 — retain bounded NBA rejection context

- Started clean on main; no leftover work. Healthz healthy, zero alerts; 36 active sources with recent successful ingestion and no current errors, latest four-topic edition readable.
- Article/social absence failures now identify the failed editorial field and first marker class (word/contraction/phrase) in existing bounded diagnostics and validation logs. Runtime allowlists reject arbitrary labels; no model/source text is retained.
- Fake-provider tests verify all article fields, marker classes, initial/repair propagation and untrusted-label exclusion. Acceptance rules, prompts, fingerprints and budgets are unchanged; today's NBA rejected wording remains unknown.
- Updated TASKS/RANKING; archived iteration 631 to keep PROGRESS bounded. No paid calls, UI/schema changes, new editions or grouping/incremental activation.
- Verification: targeted tests 44/44; pnpm format, pnpm lint:fix, pnpm check (392 unit/205 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker; both active, healthz database/Redis healthy, latest four-topic edition readable, zero alerts and no failed user services.
- Next: use future scheduled rejection labels if NBA still fails; assess Nov 5 same-story grouping activation against the passed gate, then useful World/open-X yield and reserve-safe incremental triage.

## 2026-11-04: iteration 649 — wire bounded opt-in story grouping

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 active sources without current errors and fresh ingestion.
- Replayed the saved same-story evaluation without calls: frozen-label precision 141/141, recall 141/157, zero clearly unrelated/one borderline merged pair; supplemental reviewed gate remains 155 pairs.
- Added default-off publication composition (`LLM_STORY_GROUPING_ENABLED=1` to opt in): group only the existing ten-item semantic shortlist after complete triage, then edit ranked explicit memberships through the shared ledger/cache and edition run identity.
- Invalid/overlapping membership, provider failure or refused budget preserves separate articles. No title rules, transitive joins, extra candidates, repairs or coverage score bonuses; immutable coverage links survive editing/storage.
- Fake tests cover configuration, inputs, failure and coverage; isolated publication regression checks persisted grouped coverage. Updated TASKS/RANKING and handbook pipeline; archived iterations 632–633. No schema/UI/source changes or paid calls.
- Verification: targeted grouping tests 16/16; pnpm format, pnpm lint:fix, pnpm check (395 unit/206 isolated integration), pnpm build, edition-pipeline handbook check (17 pages/one unchanged diagram/25 tables) and git diff --check passed.
- Restarted API/worker; both active, healthz database/Redis healthy, latest four-topic edition readable and zero alerts. Confirmed production grouping switch absent/default off; incremental triage remains off.
- Next: activate evaluated grouping for Nov 5 under item 27 after checking admission/headroom, then capture real grouped edition/screenshots; continue World/open-X quality and reserve-safe incremental assessment. NBA live full-AI acceptance awaits the next scheduled run.

## 2026-11-04: iteration 650 — activate evaluated grouping for Nov 5

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 sources without current errors and all four queues available.
- Enabled production LLM_STORY_GROUPING_ENABLED=1 after the Nov 4 review and passed same-story gate; confirmed both restarted API/worker processes received it. Code default remains off; incremental triage remains off.
- Conservative four-topic grouping reservation bound $0.058192 plus Nov 4 edition $0.291162 fits current $0.487477 cap; no pending holds. Existing 1.5x reserve already protects the full daily cap, so no budget/model/provider changes. Actual future admission/cost is not guaranteed.
- Updated TASKS/RANKING, handbook and steering activation ack; archived iteration 634 to keep PROGRESS bounded. No paid calls, new editions, UI changes or screenshots claiming real grouping.
- Verification: pnpm format, pnpm lint:fix, pnpm check (395 unit/206 isolated integration), pnpm build, edition-pipeline handbook check (17 pages/one unchanged diagram/25 tables), git diff --check. Initial format check caught the newly archived entry; formatted it and reran check.
- Restarted API/worker; healthz database/Redis healthy, saved four-topic Nov 4 edition readable, zero alerts/failed user units/dangling Docker volumes.
- Next: Nov 5 real grouping admission/cost/accuracy, persisted coverage, latency and desktop/mobile screenshots; NBA full-AI and World/open-X quality remain open.

## 2026-11-04: iteration 651 — correct low-quality open-X discovery instructions

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources with recent successful ingestion/no current errors and readable four-topic Nov 4 edition.
- Acted on Nov 4's 0/19 selected paid discoveries: shared X prompt excludes betting/tipster promotions, memberships, affiliate offers, engagement requests and generic roundups; seeks concrete original topic content and distinct moments, allowing fewer or zero results instead of filler.
- Models/providers, search/turn/result limits, official verification, exact window and budget caps unchanged. No paid calls, new edition, source requests or UI changes; actual yield improvement remains unproven.
- Extended prompt/transport fixture coverage; empty results preserve fetched-post usage without adapter retry. Initial direct whole-file test hit five isolation guards; no live DB access occurred. Correctly scoped adapter tests passed 4/4; full isolated suite then passed.
- Updated TASKS/SOURCES; archived iteration 635 to keep PROGRESS bounded. Handbook system flow unchanged by this discovery bug fix.
- Verification: pnpm format, pnpm lint:fix, pnpm check (395 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker: both active; healthz database/Redis healthy, saved four-topic edition readable, zero alerts/failed user services/dangling Docker volumes.
- Next: measure scheduled discovery quality and immutable picks; Nov 5 grouping admission/cost/accuracy/latency/screenshots, NBA full-AI and World coverage remain open.

## 2026-11-04: iteration 652 — give Bluesky editing cross-platform context

- Started clean on main; no leftover work. Zero alerts, healthy database/Redis, 36 active sources without current errors and four available queues.
- Nov 4's duplicate X/Bluesky pick exposed isolated editing: Bluesky had no visibility of existing picks. Added existing text/platform/author context, capped at 20 posts with 1,200-character text/200-character authors; no extra provider calls.
- Explicit semantic guidance avoids repeated announcements/clips/moments across platforms while permitting distinct developments. Existing picks remain immutable; only candidate IDs pass validation. Prompt fingerprints include context, isolating cached choices.
- Fake tests cover edition-to-editor propagation, context bounds, changed-context cache misses, repeat-context hits and refusal of non-candidate IDs. No paid calls, source requests, new editions or UI changes; actual duplicate reduction remains unmeasured.
- Updated TASKS/SOURCES and affected social handbook; archived iteration 636; corrected stale preparation-only/synthetic-only descriptions using the saved Nov 4 review.
- Verification: targeted editor/edition tests 16/16; pnpm format, pnpm lint:fix, pnpm check (396 unit/207 isolated integration), pnpm build, social handbook check (17 pages/one unchanged diagram/25 tables), git diff --check.
- Restarted API/worker; both active, healthz database/Redis healthy, saved four-topic Nov 4 edition readable, fresh ingestion through 15:48 UTC, zero alerts/failed user services.
- Next: scheduled discovery yield and Nov 5 grouping/cost/latency/screenshots; NBA full-AI, World coverage and live cross-platform duplicate behavior remain open.

## 2026-11-04: iteration 653 — target absence repair guidance to the rejected field

- Started clean on main; no leftover work. Zero alerts, healthy database/Redis, 36 sources without current errors and four available queues; saved Nov 4 four-topic edition readable.
- Nov 4 NBA's failed generic absence repairs motivate fixed field-specific guidance: headline/summary, significance, rationale or brief. Unknown runtime labels receive only generic feedback; no model/source text enters hints.
- Validation, model order, initial prompts/cache keys, budgets and one-repair limit unchanged. No paid calls, new edition or UI changes; live NBA full-AI outcome remains unmeasured.
- Updated TASKS/RANKING; archived iteration 637 to keep PROGRESS bounded. Internal repair change needs no handbook/source inventory update.
- Verification: targeted editor tests 13/13; pnpm format, pnpm lint:fix, pnpm check (397 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker; both active, healthz database/Redis healthy, saved four-topic edition readable, zero alerts/failed user services.
- Next: Nov 5 grouping admission/cost/accuracy/latency/screenshots, NBA full-AI acceptance, scheduled discovery yield and World posts.

## 2026-11-04: iteration 654 — discourage repeated moments within social selections

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and four available queues; Nov 4 saved edition readable.
- Acted on Nov 4 Tech's five posts about the same story: shared social editor explicitly compares candidates, chooses one strongest post per repeated announcement/clip/scoop/moment, and returns fewer picks rather than repetitions.
- Different authors, commentary and rewording alone do not establish distinct developments; distinct developments about a shared subject remain eligible. Applies within X/Reddit and Bluesky selections, alongside existing cross-platform context.
- Semantic guidance only: no deterministic dedupe claim, paid calls, source requests, new edition or UI change. Actual repetition reduction remains unmeasured. Model order, call limits, validation and budget caps unchanged; changed instructions isolate prior cached selections.
- Updated TASKS/RANKING; archived iteration 638. Bug fix leaves system flows/source inventory unchanged; no handbook/schema changes needed.
- Verification: existing social-editor tests 6/6; pnpm format, pnpm lint:fix, pnpm check (397 unit/207 isolated integration), pnpm build and git diff --check passed. First full check stopped on archive formatting; corrected and reran successfully.
- Restarted API/worker; both active, healthz database/Redis healthy, saved four-topic edition readable, zero alerts/failed user services; fresh source success observed at 15:58 UTC.
- Next: Nov 5 grouping/cost/latency/screenshots, NBA full-AI acceptance, scheduled discovery quality/World coverage and actual within/cross-platform repetition.

## 2026-11-04: iteration 655 — assess incremental triage without weakening the reserve

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without errors and four available queues.
- Read-only live assessment finds zero qualifying fully AI-edited editions; the pending reserve consequently protects the whole daily cap. Nov 5 projection: $0.495028 with no further spend, $0.487477 if today's $0.196315 remainder is spent; background allowance $0 in both cases.
- Kept incremental triage off: today's released funds cover only the pre-midnight portion of tomorrow's window. No reserve reduction, paid calls, source requests, new jobs or production configuration changes.
- Captured next-window pool privately at 16:06:50 UTC: Tech/NBA/Gaming/World 25/3/25/12 eligible articles, zero matching current fingerprint cache rows. This is prospective inventory, not final membership, actual scoring, waste or latency. Initial ad-hoc cache lookup used the wrong schema property; corrected it and reran successfully, without writes.
- Added reproducible admission assessment, updated TASKS/RANKING and corrected stale handbook timer description; archived iteration 639. Source inventory and schema unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check (397 unit/207 isolated integration), pnpm build, handbook check (17 pages/two unchanged diagrams/25 tables), private capture permissions and git diff --check passed.
- Restarted API/worker; both active, healthz/database/Redis healthy, saved four-topic edition readable, 36 sources without errors, four queues available and zero alerts/failed user units/dangling Docker volumes.
- Next: Nov 5 grouping/cost/accuracy/screenshots, NBA full-AI and World posts; compare private baseline with final same-window capture and reassess background headroom after full-AI evidence.

## 2026-11-04: iteration 656 — give the final social editor saved engagement evidence

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis; API and worker active.
- Found final social editing discarded engagement even though shortlist ranking used it. X candidates now carry the existing bounded ranking explanation, preserving unverified search provenance and explicit unknown counts; Bluesky carries timestamped API likes/reposts/replies.
- Shared editor treats counts as advisory alongside relevance/distinct content, never proof of truth, measured growth, account-relative reach or virality. Evidence is bounded at 1,200 characters and participates in request/cache identity.
- No paid calls, new discovery requests, configuration/model/cap changes, edition generation or UI change. Actual selection improvement remains unmeasured until the next scheduled edition.
- Updated TASKS/RANKING and affected handbook page; archived iteration 640. Source inventory and schema unchanged.
- Verification: targeted social tests 15/15; pnpm format, pnpm lint:fix, pnpm check (398 unit/207 isolated integration), pnpm build, handbook check (17 pages/one unchanged diagram/25 tables) and git diff --check passed.
- Restarted API/worker; both active, healthz/database/Redis healthy, saved four-topic edition readable, zero alerts/failed user services.
- Next: Nov 5 grouping/cost/accuracy/screenshots, NBA full-AI acceptance, World posts and evidence-informed social picks; incremental triage stays off.

## 2026-11-04: iteration 657 — keep rejected social posts out of degraded selection

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and four available queues; saved edition has four topics/14 stories/15 posts.
- Fixed an unavailable-editor path that could restore lexical fallback posts rejected by completed semantic triage. Fallback now obeys the existing relevance 6/interestingness 4 gates; rejected and missing-score posts stay out.
- Incomplete triage preserves its original fallback. Stored explanation identifies completed-gate degradation; model order, caps and shortlisting thresholds are unchanged.
- Added synthetic regression covering both rejection thresholds, boundary acceptance, absent scores, empty results, retained identity and untouched input. No claim this path caused Nov 4's selections or improves live World coverage yet.
- Updated TASKS/RANKING; archived iteration 641. Bug fix changes no system flow, source inventory or schema; no handbook/SOURCES changes needed. No paid calls, discovery requests or configuration changes.
- Verification: targeted orchestration tests 6/6; pnpm format, pnpm lint:fix, pnpm check (399 unit/207 isolated integration), pnpm build and git diff --check passed. Initial full check caught archive formatting; corrected before rerun.
- Restarted API/worker; both active, healthz/database/Redis healthy, saved four-topic/15-post edition readable, zero alerts and no failed user services.
- Next: Nov 5 grouping/cost/latency/screenshots, NBA full-AI acceptance, World coverage and actual social selection quality; incremental triage stays off.

## 2026-11-04: iteration 658 — preserve Bluesky engagement guidance in final editing

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 sources without current errors and all four queues available.
- Found Bluesky instruction specialization discarded shared engagement guidance and said counts were absent despite iteration 656 supplying timestamped API evidence. Narrowed the replacement to platform provenance; counts remain advisory alongside relevance and interestingness.
- Preserved unknown-count, measured-growth, account-relative reach, virality and unseen-media limits. Regression checks the actual fake-provider instructions and serialized evidence; seven targeted editor tests pass.
- No paid calls, discovery requests, configuration changes or new edition. Live selection effects await the scheduled run; NBA full-AI, World coverage and grouping acceptance remain open.
- Updated TASKS/RANKING; archived iteration 642. Bug fix changes no source, schema, UI or system flow, so no handbook/SOURCES update.
- Verification: pnpm format, pnpm lint:fix, pnpm check (399 unit/207 isolated integration), pnpm build and git diff --check passed; no dangling Docker volumes or failed user services.
- Pushed d04ca00; systemctl --user restart news-digest-api news-digest-worker: both active; curl /healthz healthy after startup retry; pnpm obs alerts zero; saved edition readable with four topics/14 stories/15 posts.
- Next: Nov 5 grouping/cost/latency/screenshots, NBA full-AI and World coverage; incremental triage stays off.

## 2026-11-04: iteration 659 — require complete social triage coverage

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, 36 sources without current errors; saved edition has four topics/14 stories/15 posts.
- X/Reddit orchestration now requires exactly one valid score per candidate, no foreign IDs, and integer relevance/interestingness in 0–10 before using completed semantic gates, matching Bluesky's existing check.
- Missing, duplicate, foreign and invalid scores skip final editing and retain the original lexical fallback. Missing candidate IDs are exposed even when the adapter's unscored list omitted them.
- Synthetic regression covers missing/duplicate/unknown IDs and negative, oversized, fractional, NaN and infinite scores. Updated prior fallback test to supply genuinely complete coverage.
- No paid calls, prompts, models, caps, configuration, sources, UI or schema changes; no claim this caused Nov 4's selection. No handbook/SOURCES update needed for this bug fix.
- Updated TASKS/RANKING; archived iteration 643. Verification: targeted tests 7/7, pnpm format, pnpm lint:fix, pnpm check (400 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker: both active; healthz/database/Redis healthy after startup retry, zero alerts/failed user services; saved four-topic/15-post edition readable.
- Next: Nov 5 grouping/cost/latency/screenshots, NBA full-AI acceptance and World social coverage; incremental triage stays off.

## 2026-11-04: iteration 660 — validate final social picks against their shortlist

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- X/Reddit orchestration now rejects final editor IDs outside the actual shortlist, duplicate IDs and over-budget results, preserving only the fallback that passed completed triage.
- Synthetic regression covers rejected candidates, qualifying candidates outside the shortlist, unknown IDs, duplicate/excess picks, fallback identity and untouched input. Targeted tests 8/8.
- No paid calls, source/configuration/model/schema/UI changes or claim of live selection improvement; no handbook/SOURCES changes needed. Updated TASKS/RANKING; archived oldest progress entry.
- Verification: pnpm format, pnpm lint:fix, pnpm check (401 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker: both active; healthz/database/Redis healthy, zero alerts/failed user services; saved four-topic/14-story/15-post edition readable.
- Next: Nov 5 grouping/cost/latency/screenshots, NBA full-AI acceptance and World social coverage; incremental triage stays off.

## 2026-11-04: iteration 661 — explain fully rejected social pools

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- Completed social triage rejecting every candidate now stops before final editing, retains scores and explains the empty selection without claiming an AI editor/model.
- Production editor already avoided paid calls for empty pools; this fixes orchestration/provenance, with no claimed cost savings or live coverage improvement.
- Synthetic regression covers relevance and interestingness rejection and fails on any final editor call; targeted tests 9/9.
- Updated TASKS/RANKING; archived iteration 645 to keep PROGRESS bounded. No source, schema, UI, configuration or system-flow change; no handbook/SOURCES update needed.
- Verification: pnpm format, pnpm lint:fix, pnpm check (402 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker: both active; curl healthz healthy after startup retry; pnpm obs alerts zero; no failed user services; latest edition readable with four topics/14 stories/15 posts.
- No paid calls. Next: Nov 5 grouping/cost/latency/screenshots, NBA full-AI acceptance and World social coverage; incremental triage stays off.

## 2026-11-04: iteration 662 — bound edition-speed options from saved calls

- Started clean on main; no leftover work. Zero alerts; healthz/database/Redis healthy.
- Added a reproducible offline Nov 4 concurrency assessment: 43 successful calls/506,615 aggregate HTTP ms, observed peak four slots, longest call 20,073 ms.
- Eight slots have a fixed-duration optimistic bound of 63.327 s; removing all article triage still leaves 65.878 s at four slots. Neither alone establishes the 60-second target.
- Purpose timing locates Bluesky editing at the publication tail (39 ms before completion); overlapping purposes are not claimed as sequential stages or per-topic critical paths.
- Independent Python journal arithmetic verified call count, total duration, non-triage bound and tail. No paid calls, production tuning, source/schema/UI changes or handbook update.
- Verification: pnpm format, pnpm lint:fix, pnpm check (402 unit/207 isolated integration), pnpm build and git diff --check passed; final alert snapshot zero. Archived iteration 646 to keep PROGRESS bounded.
- Documentation-only step; healthy services keep running under STEERING 22. Next: compare Nov 5 repair counts/overlap/tail and grouping evidence before choosing a speed experiment.

## 2026-11-04: iteration 663 — compact long social-editor wire IDs

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- Social editor replaces long platform IDs with collision-safe request aliases and restores original IDs after fresh/cached validation; source IDs cannot bypass wire validation.
- Eight targeted tests pass, including alias collisions, input immutability, cache hits/new caller identity and invalid-ID repairs/fallback. Output cap/models/budgets/selection checks unchanged.
- Lower output reservations deferred: character limits alone do not establish a smaller safe token bound. No paid calls or claimed live speed/cost improvement.
- Updated TASKS/RANKING. Internal serialization change; no source/schema/UI/system-flow change or handbook/SOURCES update needed.
- Verification: pnpm format, pnpm lint:fix, pnpm check (403 unit/207 isolated integration), pnpm build and git diff --check passed. Archived iteration 647 to keep PROGRESS bounded.
- Restarted API/worker: both active; healthz/database/Redis healthy, zero alerts/failed user services; saved four-topic/14-story/15-post edition readable. All 36 active sources had nonempty successful collection and no errors.
- Next: Nov 5 grouping/cost/latency/screenshots, NBA full-AI acceptance and World posts; incremental triage stays off.
