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

## 2026-11-04: iteration 664 — batch triage cache lookups

- Started clean on main; no leftover work. Zero alerts; healthz/database/Redis healthy and all 36 sources returning nonempty successful collections.
- Article/social triage and pending probes now resolve up to 200 item-cache keys with one PostgreSQL query; empty pools read nothing. Optional port capability preserves single-key adapters.
- Fingerprints, exact score/identity validation, prompts, provider batching and budgets unchanged. Read failures propagate before provider calls; no paid calls or claimed live latency improvement.
- Synthetic bulk-read regression covers reversed mixed hits, malformed/wrong-ID/missing rows, empty pools and failure for both modes; isolated DB coverage includes missing/duplicate keys and empty input.
- Updated TASKS/RANKING; archived iteration 648 to keep PROGRESS bounded. Internal cache access only; no source/schema/UI/system-flow change or handbook/SOURCES update needed.
- Verification: targeted triage tests 20/20; pnpm format, pnpm lint:fix, pnpm check (404 unit/207 isolated integration), pnpm build and git diff --check pass. Corrected an initial test-only unbound-method lint error before the passing full check.
- Restarted API/worker: active; healthz healthy after startup retry, saved edition four topics/14 stories/15 posts; 36 nonempty successful sources, zero errors/alerts.
- Next: Nov 5 grouping/cost/latency/screenshots, NBA full-AI acceptance and World posts; incremental triage stays off.
- Initial push rejected (remote advanced); merged owner docs/instructions commit e1899d7 without conflicts or history rewriting. Application files unchanged by merge. Merged checker found Operations 101/100 prose lines; shortened its test note without changing policy.

## 2026-11-04: iteration 665 — preserve bulk reads through triage evidence

- Started clean on main; no leftover work. Zero alerts; healthz/database/Redis healthy, all 36 active sources successful/nonempty without current errors.
- Fixed incremental scoring evidence wrapper dropping the optional bulk-cache capability from iteration 664; receiver-bound pass-through preserves failures and single-key compatibility.
- Cold/warm/changed-input scoring now verifies three bulk reads; warm hits produce no work evidence. Regression also covers receiver binding, missing keys, read failure and single-key adapters.
- Incremental triage stays disabled; no paid calls, activation, model/budget changes or claimed live speed improvement.
- Updated TASKS/RANKING; archived iteration 649 to keep PROGRESS bounded. Internal cache forwarding only; no handbook/schema/SOURCES changes needed.
- Verification: targeted tests 16/16; pnpm format, pnpm lint:fix, pnpm check (405 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker; both active, healthz healthy, zero alerts; saved edition remains four topics/14 stories/15 posts.
- Next: Nov 5 grouping/cost/latency/screenshots, NBA full-AI acceptance and World posts; background triage remains off.

## 2026-11-04: iteration 666 — atomic triage cache writes

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis and 36 nonempty successful sources without current errors.
- Article/social triage now persists each validated batch in one atomic insert-only query instead of up to 50 sequential writes; optional single-key adapters remain compatible.
- Existing cache values, fingerprints, prompts, score validation, budgets and models unchanged. Failed batches remain retryable; sibling writes drain before errors return.
- Incremental evidence forwards bulk writes with the ledger receiver and records only committed article work; duplicate guards recover after failed batches. Incremental triage stays off.
- Synthetic tests cover original IDs, warm reuse, retries, sibling draining and evidence; isolated PostgreSQL covers conflicts, duplicate keys, empty input and whole-batch rollback.
- Updated TASKS/RANKING; archived iteration 650 to keep PROGRESS bounded. Internal persistence only; no source/schema/UI/system-flow changes requiring handbook/SOURCES edits.
- Verification: targeted tests 25/25; pnpm format, pnpm lint:fix, pnpm check (407 unit/207 isolated integration), pnpm build and git diff --check passed. No paid calls or claimed live speed improvement.
- Restarted API/worker; both active, healthz healthy, zero alerts/failed services. Saved edition remains four topics/14 stories/15 posts; all 36 sources successful/nonempty, zero errors.
- Next: Nov 5 grouping/cost/latency/screenshots, NBA full-AI acceptance and World posts; background triage stays disabled.

## 2026-11-04: iteration 667 — linear triage batch sizing

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis and 36 nonempty successful sources without current errors.
- Replaced repeated full-prompt serialization while packing triage batches with exact UTF-8 item/framing/comma accounting; batch-local indices reset on splits.
- Preserves article/social prompts, 50-item/60,000-byte boundaries, fingerprints, provider requests, models and budgets. Incremental triage stays off; no paid calls or measured live latency improvement.
- Differential synthetic regression compares every actual prompt against the former full-serialization algorithm for 200 short and Unicode/escaped long candidates in both modes.
- Updated TASKS/RANKING; archived iteration 651 to keep PROGRESS bounded. Internal batch preparation only; no handbook/schema/SOURCES changes needed.
- Verification: targeted tests 28/28; pnpm format, pnpm lint:fix, pnpm check (408 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker: both active, healthz healthy, zero alerts; saved edition four topics/14 stories/15 posts; all 36 sources nonempty with zero errors.
- Next: Nov 5 grouping admission/cost/accuracy/latency/screenshots, NBA full-AI acceptance and World posts; background triage remains disabled.

## 2026-11-04: iteration 668 — repair invalid social selections

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis, all 36 sources successful/nonempty with no current errors.
- Nov 4 journal fingerprint links a Bluesky Sonnet request to initial+repair validator-error failures; social code narrows these to unknown IDs, duplicates or excess picks. Rejected output/topic/precise violation remain unknown.
- Those checks now emit invalid-social-selection and fixed application-owned repair guidance for candidate IDs, aliases, uniqueness, budget and optional empty picks; no rejected text/IDs enter feedback.
- Initial prompts/cache keys, support checks, budgets/models/output limits and one repair per model unchanged. No paid calls or measured live latency improvement.
- Fake X/Bluesky tests cover each violation recovering on repair, warm cache reuse and the unchanged four-call maximum. Targeted social/story/LLM tests 46/46 passed.
- Updated RANKING and compacted TASKS below 8 KB; archived iteration 652 to keep PROGRESS bounded. Internal repair change needs no handbook/schema/SOURCES update.
- Verification: pnpm format, pnpm lint:fix, pnpm check (409 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker active; healthz healthy, zero alerts, four available queues and 36 nonempty sources without errors. Saved edition remains four topics/14 stories/15 posts.
- Next: Nov 5 grouping/cost/accuracy/latency/screenshots, NBA full-AI acceptance, World posts and Bluesky repair tail. Incremental triage remains off.

## 2026-11-04: iteration 669 — reuse triage fingerprint context

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- Article/social triage now serializes and hashes shared instructions/model/topic once per pool, copying hash state for each candidate.
- Existing JSON bytes/cache keys, prompts, models, budgets and candidate coverage unchanged; incremental triage remains off.
- Differential synthetic regression covers 200 escaped/Unicode/truncated candidates per mode, reverse-order probes and warm scoring without new calls.
- Local synthetic 60,000-fingerprint benchmark: legacy 1,718 ms, shared context 536 ms. CPU preparation only; no measured live edition speed improvement or paid calls.
- Updated TASKS/RANKING; internal optimization needs no handbook/schema/SOURCES changes.
- Verification: targeted triage 23/23; pnpm format, pnpm lint:fix, pnpm check (410 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker active; healthz healthy, zero alerts, all 36 sources without current errors. Saved edition remains four topics/14 stories/15 posts.
- Next: Nov 5 grouping admission/accuracy/cost/latency/screenshots, NBA full-AI outcome, World posts and Bluesky repair tail.

## 2026-11-04: iteration 670 — replay recorded token work before latency tuning

- Started clean on main; no leftover work. Zero alerts, healthy healthz/database/Redis and all 36 sources nonempty without current errors.
- Added offline call-usage evaluator and allowlisted Nov 4 metadata for all 43 Anthropic calls; no prompts, response text, secrets, database access or paid calls.
- Groups by purpose/model, separates cache input, retains failed time, counts unknown usage explicitly and rejects invalid/overflowing totals. HTTP token ratios are not decode throughput or predicted speedups.
- Nov 4: triage emitted 89,087/115,032 output tokens (77.4%) and used 326,931/506,615 aggregate HTTP ms (64.5%); zero output-limit stops. Measure actual event/rationale lengths before changing batches; compare Nov 5's changed pipeline.
- Updated TASKS and concurrency review; archived iteration 653 to keep PROGRESS bounded. No runtime/handbook/schema/SOURCES changes; incremental triage remains off.
- Verification: targeted replay 3/3; pnpm format, pnpm lint:fix, pnpm check (413 unit/207 isolated integration), pnpm build and git diff --check passed. First check found archive formatting; corrected and reran successfully.
- Live saved edition remains four topics/14 stories/15 posts. Services unchanged and healthy, so no restart under STEERING 22.
- Next: Nov 5 grouping admission/accuracy/cost/latency/screenshots, NBA full-AI acceptance and World posts; offline response-length measurement if still waiting.

## 2026-11-04: iteration 671 — measure cached triage field lengths

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- Added read-only aggregate triage-length report: parameterized half-open cache creation window, read-only transaction, 15-second query timeout; no text/IDs or paid calls.
- Nov 4 15:00–15:03 UTC cache sample: 689 article/227 social scores, all event/rationale strings. Article p95 46/58 characters; social 43/53; no prompt-guidance or schema-limit overruns.
- Successful cached fields are already short; do not infer token shares or speedups, or tighten limits from this sample. Reused cache entries, failed attempts and repairs are absent; exact edition membership is not established.
- Updated TASKS/concurrency evidence; archived iteration 654 to keep PROGRESS bounded. No runtime/handbook/schema/SOURCES changes; incremental triage stays off.
- Verification: real read-only sample, empty future window and invalid timestamp rejection; pnpm format, pnpm lint:fix, pnpm check (413 unit/207 isolated integration), pnpm build and git diff --check passed.
- API/worker active, healthz healthy, zero alerts, 36 nonempty sources without errors and four available queues. No restart under STEERING 22: runtime/config unchanged.
- Next: Nov 5 grouping admission/accuracy/cost/latency/screenshots, NBA full-AI acceptance, World posts and Bluesky repairs.

## 2026-11-04: iteration 672 — explain triage coverage repairs

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- Article/social missing, duplicate, extra and original-ID score arrays now emit a fixed coverage diagnostic and specific single-repair guidance; no rejected text/IDs enter feedback.
- Initial prompts, cache identity, candidate coverage, models, budgets and concurrency unchanged. Schema-invalid scores still fail closed; no paid calls or measured live speedup.
- Fake-provider regression covers eight defect/kind cases, corrected original-ID mapping and warm-cache reuse; targeted triage 24/24 passed. Fixed harness parsing so transport repairs actually reach its fake provider.
- Updated TASKS/RANKING; archived iteration 655 to keep PROGRESS bounded. No handbook/schema/SOURCES changes needed for this internal repair.
- Verification: pnpm format, pnpm lint:fix, pnpm check (414 unit/207 isolated integration), pnpm build and git diff --check passed.
- Restarted API/worker active; initial immediate probe preceded listener startup, retry healthy with database/Redis. Zero alerts, 36 nonempty sources without errors; saved edition remains four topics/14 stories/15 posts.
- Next: Nov 5 grouping admission/accuracy/cost/latency/screenshots, NBA full-AI outcome, World posts and Bluesky repair tail.

## 2026-11-04: iteration 673 — extend offline batching to social pools

- Started clean on main; no leftover work. Zero alerts and healthy healthz/database/Redis.
- Offline batching now accepts validated local article/social inputs with supplied topic context; invokes the real kind-specific triage prompt, purpose and cache namespace. Existing recorded article mode preserved.
- Reports aggregate shape only; synthetic provider/cache stay in process, with no database/environment/provider dependency or paid calls. Invalid input exits with a bounded diagnostic.
- Synthetic 101-post social probe: caller sizes 10/25/50/200 produced 11/5/3/3 requests; 50/200 share bytes but have sequential `[1,1,1]` versus concurrent-capable `[3]` barriers. No live latency/quality/cost claim or production change.
- Targeted `pnpm exec tsx --test apps/api/test/triage-batching.test.ts`: 7/7; default CLI: 36 article rows, zero repeat requests; supplied social CLI and missing-file rejection checked.
- Updated TASKS/RANKING; archived iteration 656 to keep PROGRESS bounded. No affected handbook/source/schema behavior.
- Verification: pnpm format, pnpm lint:fix, pnpm check (415 unit/207 isolated integration), pnpm build and git diff --check passed. Live: API/worker active, 36 sources/zero current errors, four-topic saved edition, zero alerts.
- Runtime/config unchanged: no restart under STEERING 22.
- Next: Nov 5 grouping admission/accuracy/cost/latency/screenshots, NBA full-AI, World posts; capture actual social inputs before batching changes.
