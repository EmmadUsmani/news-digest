## 2026-11-04: iteration 643 — explain incremental replay backlog by pass

- Started clean on main; no leftover work. Healthz healthy and zero alerts; Nov 4 edition pending.
- Added per-tick/final-pass replay traces: pending/pool/scored/request counts and scored/cached/threshold/rotation/cutoff outcomes. No production code/config or paid calls.
- Hourly offset-1 rotation with threshold/cap 25 and two-hour cutoff: World/Tech last assigned ticks have 22/24 pending, defer, and leave all 47/54 for publication; NBA prepares 25 and leaves 27. Publication proxies and synthetic scores do not establish live cost/speed.
- Targeted incremental replay tests 13/13 pass, including backlog/threshold traces, cutoff precedence, cached passes and request/item reconciliation.
- Updated TASKS/RANKING; archived iteration 625 to keep PROGRESS bounded. No source/handbook/schema change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (388 unit/205 isolated integration), pnpm build and git diff --check passed. Healthz healthy, zero alerts/dangling volumes; saved edition remains four topics/19 stories/11 posts.
- Offline tools only; no restart under STEERING 22. Incremental triage/grouping remain off; next priority is Nov 4 scheduled edition review.

## 2026-11-04: iteration 644 — attribute preparation waste to each replay pass

- Started clean on main; no leftover work. Healthz healthy, zero alerts; Nov 4 scheduled edition pending.
- Offline incremental replay now attributes reusable/wasted score versions to their originating background passes using actual item-cache writes and final probe keys. Reverted inputs credit the original pass; missing pool snapshots remain unknown.
- Synthetic two-item replay reconciles three wasted versions: one from the first pass, two from the second, none from the cached third pass. These are work counts, not paid usage, expiry waste or live latency.
- Targeted replay tests 13/13 pass; CLI verifies 48 rotation scenarios retain unknown waste without snapshots and reconcile scoring totals. Updated TASKS/RANKING; archived iteration 626 to keep PROGRESS bounded.
- Verification: pnpm format, pnpm lint:fix, pnpm check (388 unit/205 isolated integration), pnpm build and git diff --check passed. First check caught archive formatting; formatted it and reran successfully.
- Healthz healthy and zero alerts; no paid calls, sources, prompts, schema or production configuration changed. Offline tools only; no restart under STEERING 22.
- Next: Nov 4 15:00 UTC edition review for open-X/Bluesky/World selections, NBA fallback and timing/cost; incremental triage/grouping remain off.

## 2026-11-04: iteration 645 — measure first scheduled open-X quality

- Started clean on main; no leftover work. Healthz healthy, zero alerts and no failed user services. Scheduled edition remains pending.
- Reviewed four completed Nov 4 open-topic searches via read-only discovery/day/week reports and a stored citation/post join: $0.149447, 19 newly verified posts, all outside current curated lists, zero profiles/holds.
- Only 13/19 fit the edition window: World 4/4, NBA 5/5, Gaming 1/5, Tech 3/5. All five NBA embeds promote betting; available xAI-reported likes peak at 12. World timestamps recover in-window coverage, not proven editorial quality.
- Added reproducible cost/window/quality evidence and linked examples in SOURCES; updated TASKS and NEEDS_FROM_HUMAN with the weakness and no immediate owner request. Seven-day recorded spend $0.309885/9 calls; incomplete day and unattributed Nov 2 call identified.
- Archived iterations 627–628 to keep PROGRESS bounded. No source/prompt/config/schema change, inference, re-verification or scraping. No restart under STEERING 22; grouping/incremental triage remain off.
- Verification: read-only reports and independent timestamp/cost assertions passed; pnpm format, pnpm lint:fix, pnpm check (388 unit/205 isolated integration), pnpm build and git diff --check passed. Healthz healthy; zero alerts.
- Next: prioritize the Nov 4 15:00 UTC edition's immutable selections, NBA fallback/logs, timing/cost and activation gates. Successful discovery counts must not substitute for quality.

## 2026-11-04: iteration 646 — review scheduled edition and prove NBA fallback cause

- Started clean on main; no leftover work. Healthz healthy and zero alerts; observed scheduled publication without production changes or extra paid calls.
- Edition 3bf10f5b-4c00-48b2-85bd-8e6dac7e3238: 701 article candidates, 14 stories/15 posts, 151.532 s, $0.291162/43 Anthropic calls, zero holds; protected $0.487477 reserve released with mixed outcome. Still misses speed/full-AI acceptance.
- Reconstructed NBA requests with inert editor callback and saved scores; exact fingerprints prove Sonnet+Haiku initial/repair unsupported-absence rejections. NBA triage complete; rejected text unavailable. Fallback includes quiz/overlapping rankings.
- Immutable X picks Tech/NBA/Gaming/World 4/5/5/0; none of 19 paid discoveries selected. Eleven selected posts outside current lists lack saved engagement reports. Read back reviewed 11/10/12/11 lists.
- First selected Tech Bluesky post has observed 767 likes/329 replies/342 reposts; duplicates a selected X post. World remains empty. Saved desktop/mobile topic-post screenshots; 14 iframe mounts, one Bluesky card, no page errors/overflow. Offscreen widgets may be blank in full captures.
- Added durable edition review; updated STEERING ack, TASKS, SOURCES, RANKING and NEEDS_FROM_HUMAN. Archived iterations 629–630; no handbook/schema/runtime change.
- Verification: pnpm check (388 unit/205 isolated integration), pnpm build, read-only report-edition-timing/capture-triage-pool, citation join, exact NBA fingerprints and Playwright checks passed. pnpm format, pnpm lint:fix, format:check and git diff --check passed.
- No restart under STEERING 22: only docs/screenshots changed. Grouping/incremental triage remain off; next fix NBA validation/fallback quality, then useful World/open-X yield and gated Nov 5 activation assessment.

## 2026-11-04: iteration 647 — avoid absence rejection for numeric ranks

- Started clean on main; no leftover work. Healthz healthy, zero alerts; 36 active sources with no errors and fresh ingestion.
- Fixed demonstrated lexical false positive: “No. 1” rank abbreviations no longer assert absence. Sentence splitting preserves the rank in full evidence so real negative claims still require attribution and scope.
- Synthetic guard/editor regressions accept numeric ranks in one provider call, reject true negatives and prevent dropping the rank/attribution from negative evidence. This does not prove the unavailable rejected Nov 4 wording caused fallback.
- Updated TASKS/RANKING; no prompts, budgets, provider, schema or immutable editions changed. Grouping/incremental triage remain off; full-AI acceptance stays open.
- Verification: targeted tests 15/15; pnpm format, pnpm lint:fix, pnpm check (390 unit/205 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker after build; both active, healthz database/Redis healthy, published four-topic edition readable, zero alerts. No paid calls or new edition generated.
- Next: assess remaining NBA repair diagnostics and gated Nov 5 grouping activation; useful World/open-X yield and edition latency remain open.

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
