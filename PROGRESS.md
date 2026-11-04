## 2026-11-04: iteration 539 — prepare incremental runtime dependency composition

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 sources with no current errors and zero failed digest jobs. Nov 4 review still pending.
- Composed caller-owned database, settings reader, shared article pool, reserve-safe scheduler and draining timer. Default-off constructs no timer and reads no settings/content; scheduler identity persists across ticks.
- Two offline contract tests pass. No worker import, production activation or paid calls; no live latency/waste claim. Next: worker-owned settings/database lifecycle wiring after the review gate permits activation.
- Updated TASKS/RANKING and archived iteration 520 to keep this file small. No source/schema/UI or live handbook flow changes; services stay running under STEERING 22.
- Verification: targeted tests 2/2; pnpm format, pnpm lint:fix, pnpm check (344 unit/185 isolated integration), pnpm build and git diff --check passed. Initial checks caught two unbound-method lint errors; fixed before the successful full rerun. Root HTTP 200, healthz healthy and zero dangling Docker volumes.

## 2026-11-04: iteration 540 — prepare worker resource ownership

- Started clean on main; no leftover work. Zero alerts, healthy root/healthz, 36 sources with recent nonempty successful collections and no current errors; no failed digest jobs. Nov 4 scheduled review remains pending.
- Added prepared worker entry point owning scoring DB and existing settings/topic repositories. Disabled mode allocates nothing; current settings filter enabled topics. Startup failures clean up, repeated shutdowns share one drain, and connections close after scoring stops.
- Four offline lifecycle tests and one isolated persisted-settings/topic integration test pass. No production worker import, activation or paid requests; no live latency/waste claim. Next: gated worker connection after review, longer-span pool/waste evidence.
- Updated TASKS/RANKING; archived iteration 521 to keep PROGRESS small. No source/schema/UI or live handbook flow change. Services stay running under STEERING 22 because prepared code has no production caller.
- Verification: targeted tests 4/4; pnpm format, pnpm lint:fix, pnpm check (348 unit/186 isolated integration), pnpm build, git diff --check; root HTTP 200, healthz healthy, zero alerts and zero dangling Docker volumes. Initial test synchronization and cleanup-error typing failures fixed before successful full checks.

## 2026-11-04: iteration 541 — respect ranked pools in offline triage replay

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 nonempty successful sources without current errors and no failed digest jobs. Historical social failure is the already investigated Nov 3 23:54 event; Nov 4 review remains pending.
- Fixed bounded offline replay to consume snapshot ranking instead of candidate catalogue order, avoiding incorrect remainder/waste estimates. Changing-rank regression proves catalogue-order independence; all eight targeted offline tests pass.
- Production incremental triage remains off; no paid calls or actual waste/latency claim. No running code/config changed, so no restart under STEERING 22.
- Updated TASKS/RANKING; archived iteration 522 to keep PROGRESS small. No source/schema/UI or handbook flow changes.
- Verification: pnpm format, pnpm lint:fix, pnpm check (349 unit/186 isolated integration), pnpm build, targeted replay (8/8) and git diff --check passed; root HTTP 200 and healthy healthz. Zero dangling Docker volumes.
- Next: Nov 4 scheduled review first, then gated worker connection and actual scored-work waste evidence.

## 2026-11-04: iteration 542 — report observed triage work per topic

- Started clean on main; no leftover work. Zero alerts, healthy healthz, 36 nonempty successful sources without current errors and zero failed digest jobs. Nov 4 scheduled review remains pending.
- Added sorted per-topic counts to offline scoring-evidence report, preserving global totals. Includes scoring-only/final-only topics, repeated compatible scores, changed fingerprints, absent items and unscored attempts.
- Four targeted tests pass; regression verifies all counts reconcile, topic isolation and input-order independence. Synthetic evidence only; no paid calls, production activation or actual waste/latency claim.
- Updated TASKS/RANKING; archived iteration 523 to keep PROGRESS small. No source/schema/UI or handbook flow changes; no restart under STEERING 22 because running code/config is unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check (350 unit/186 isolated integration), pnpm build, targeted report tests (4/4), git diff --check; root HTTP 200 and healthy healthz, zero dangling Docker volumes.
- Next: Nov 4 scheduled review first; then gated worker connection and actual scored-work waste evidence.

## 2026-11-04: iteration 543 — measure longer real triage-pool compatibility

- Started clean on main; no leftovers. Zero alerts, healthy healthz/root, all 36 sources returning nonempty collections; no failed digest jobs. Nov 4 review remains pending.
- Read-only capture `/tmp/triage-pool-543.json` extends the same edition-window observation from 01:07 to 02:40 UTC (93m36s). Retains all 492 earlier eligible IDs, adds 32; 484 compatible fingerprints, eight changed (2 Tech/6 World), unchanged settings. Title/excerpt updates demonstrate that membership alone overstates reuse.
- Reproduced with `pnpm exec tsx scripts/compare-triage-cache.ts /tmp/triage-pool-525.json /tmp/triage-pool-543.json claude-haiku-5-5`; Node assertions reconcile totals and every topic. Private captures stay outside git. No actual scored-work waste, cache-hit, cost or latency measurement; no paid calls or activation.
- Updated TASKS/RANKING with counts, interpretation and limits. No source/schema/UI or handbook flow changes; no restart under STEERING 22 because running code/config is unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check (350 unit/186 isolated integration), pnpm build and git diff --check passed; root HTTP 200, healthy healthz, zero dangling Docker volumes.
- Next: Nov 4 scheduled review first; gated worker connection and actual scoring/final-pool waste evidence thereafter.

## 2026-11-04: iteration 544 — attribute prospective cache invalidation

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 successful sources without current errors and no failed digest jobs. Two retained historical ingestion failures remain; Nov 4 review is pending.
- Offline cache comparator partitions changed retained keys into article-only, topic-only and combined causes using production-key counterfactuals, respecting prompt truncation. Five targeted tests pass, including reconciliation and eligibility loss.
- Replayed private 525/543 captures to `/tmp/triage-cache-544.json`: all eight changes are article-only (2 Tech/6 World); zero topic-only or combined. No actual scored-work waste, cost, latency, activation or paid calls.
- Updated TASKS/RANKING and archived iteration 524 to keep PROGRESS small. No source/schema/UI or handbook flow changes. No restart under STEERING 22 because running code/config is unchanged.
- Next: Nov 4 scheduled review first, then gated worker connection and actual scoring/final-pool waste measurements.
- Verification: pnpm format, pnpm lint:fix, pnpm check (351 unit/186 isolated integration), pnpm build, targeted comparator tests (5/5) and git diff --check passed; root HTTP 200, healthy healthz and zero alerts.

## 2026-11-04: iteration 545 — join final captures to observed scoring exports

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 nonempty error-free sources; latest Bluesky collection succeeded with zero discovery/verification errors. Retained Nov 3 token failure is historical. Nov 4 review remains pending.
- Added offline `report-captured-triage-work.ts`: derives production fingerprints from final eligible captures and joins atomic scoring exports into the per-topic waste report. Rejects early observations, duplicate pool identities/score evidence and malformed records.
- Seven targeted tests pass, including synthetic end-to-end retained/changed/excluded/repeated work. CLI rejects the real early 543 capture as a final observation. No actual scoring, provider calls, production activation or cost/latency claims.
- Updated TASKS/RANKING and archived iteration 525. No source/schema/UI or handbook flow changes; no restart under STEERING 22 because running code/config is unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check (353 unit/186 isolated integration), pnpm build and git diff --check; root HTTP 200, healthy healthz, zero dangling Docker volumes.
- Next: Nov 4 scheduled review first; gated worker connection and actual scoring/final-pool waste evidence thereafter.

## 2026-11-04: iteration 546 — verify admission recovery after database session loss

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 nonempty error-free sources and no failed digest jobs. Nov 4 review remains pending.
- Added isolated Postgres regression terminating only its dedicated test backend: session lock releases, another worker acquires it, stale cleanup cannot unlock the successor, and the original pool replaces its dead client and reacquires admission.
- Recovery is not provider-call fencing: an in-flight request may outlive the session. No provider calls, production activation or cost/latency claims; incremental triage stays off.
- Updated TASKS/RANKING and archived iteration 526. No source/schema/UI or handbook flow changes. No restart under STEERING 22: only tests/docs changed.
- Verification: pnpm format, pnpm lint:fix, pnpm check (353 unit/187 isolated integration), pnpm build and git diff --check passed; root HTTP 200, healthy healthz, zero alerts and dangling Docker volumes.
- Next: Nov 4 scheduled review first; gated worker connection and actual scoring/final-pool waste evidence thereafter.

## 2026-11-04: iteration 547 — contain admission session errors

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, all 36 sources nonempty/error-free and no failed digest jobs; latest social collection completed. Retained ingestion/social failures are historical; Nov 4 review remains pending.
- Fixed the prepared admission adapter's missing checked-out client error listener: database loss during scoring is contained, failed clients are destroyed and cleanup reports the session error. No activation or provider calls.
- Isolated backend-termination regression no longer installs a masking test error handler; verifies adapter listener removal, successor safety and pool recovery. Initial cleanup assertion incorrectly counted pg internal listeners; corrected to track only adapter-owned listeners.
- Updated TASKS/RANKING and archived iteration 527. No schema/source/UI or handbook flow changes. No restart under STEERING 22: this adapter remains outside the production worker import graph.
- Verification: pnpm format, pnpm lint:fix, pnpm check (353 unit/187 isolated integration), pnpm build and git diff --check passed. Initial archive formatting failure corrected before final full check.
- Next: Nov 4 scheduled review first; gated worker connection and actual scoring/final-pool waste evidence thereafter.

## 2026-11-04: iteration 548 — preserve simultaneous triage failures

- Started clean on main; no leftover work. Zero alerts and healthy healthz; Nov 4 edition review remains pending.
- Fixed prepared runner cleanup hiding loader/cache/provider failures when admission release also fails. AggregateError now retains both original values, including a thrown undefined; single failures retain existing behavior.
- Regression covers all three work stages plus next-tick recovery and exactly-once release. No provider calls or activation; admission still cannot fence in-flight provider work.
- Condensed the incremental-triage TASKS history into current state; archived iteration 528. No source/schema/UI or handbook flow change. No restart under STEERING 22: prepared runner remains outside production worker imports.
- Verification: pnpm format, pnpm lint:fix, pnpm check (354 unit/187 isolated integration), pnpm build and git diff --check passed; root HTTP 200, healthy healthz, zero alerts/dangling volumes. Initial lint rejected intentional non-Error throws; added narrow documented test exceptions before rerunning checks.
- Next: Nov 4 scheduled review first; gated worker connection and actual scoring/final-pool waste measurements thereafter.

## 2026-11-04: iteration 549 — replay triage input invalidation

- Started clean on main; no leftover work. Zero alerts, healthy healthz and all queues available; scheduled Nov 4 review remains ahead at 15:00 UTC.
- Offline replay previously treated article IDs as scored forever. Added timestamped scoring-input updates and real cache probes so headline/excerpt/source changes create pending work; updates persist through pool removal/return.
- Added invalidatedPreEditionItems alongside membership-only waste and repeatScoring. Synthetic regression: three versions, two repeated scores, one invalidated edition item, zero membership loss; truncation-only changes reuse cache.
- Existing recorded windows retain hourly NBA/World/Tech edition remainders 0/5/2, with zero repeat scores or invalidations. No paid calls, activation or live waste/cost/latency claim.
- Updated TASKS/RANKING; archived iteration 529. Only offline tooling/tests/docs changed, so no restart under STEERING 22; no handbook/source/schema flow change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (356 unit/187 isolated integration), pnpm build, recorded replay and git diff --check passed; root HTTP 200, healthy healthz, 36 nonempty/error-free sources, zero failed digest jobs, alerts and dangling volumes.
- Next: Nov 4 scheduled review first; gated worker connection and actual scoring/final-pool waste evidence thereafter.

## 2026-11-04: iteration 550 — measure offline scoring-version waste

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 nonempty/error-free sources and four available queues; Nov 4 scheduled review remains ahead.
- Offline replay now partitions pre-edition versions into reusable final inputs, removed-article versions and obsolete retained versions, with a combined wasted-version count. Real cache probes recognize input reversion; missing pool snapshots leave waste unknown.
- Synthetic regression: four scores across two articles, one reusable version, two removed versions and one obsolete retained version; zero edition work. Earlier invalidation case reports two wasted versions. No paid calls, activation or live spend/latency claim.
- Updated TASKS/RANKING and archived iteration 530. No source/schema/UI/handbook flow change; no restart under STEERING 22 because only offline tooling/tests/docs changed.
- Verification: targeted replay tests 11/11; pnpm format, pnpm lint:fix, pnpm check (357 unit/187 isolated integration), pnpm build, recorded replay and git diff --check passed. Recorded hourly remainders remain NBA 0/World 5/Tech 2; zero alerts/dangling Docker volumes.
- Next: Nov 4 scheduled review first; gated worker connection and actual scoring/final-window waste evidence thereafter.

## 2026-11-04: iteration 551 — compare offline triage batch overhead

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 nonempty/error-free sources and four available queues. Nov 4 scheduled review remains pending at 15:00 UTC.
- Added offline 10/25/50/200-item caller comparison using real CandidateTriage request construction, synthetic replies and in-memory cache; no provider, DB, environment or production changes.
- Recorded 153 articles: 10-item chunks require 17 requests/80,479 input bytes versus current batching's 5/65,824 (+22.3% bytes); output reservations rise 3.1%. 50/200 request shapes match here, but sequential passes differ from four-way request scheduling. No latency/cost/quality claim.
- Regression verifies all candidates score once, repartitioning reuses every cache entry, Unicode excerpts split at the byte bound, and invalid chunks/duplicate IDs fail. Keep production batching unchanged.
- Updated TASKS/RANKING and archived iterations 531–532; no source/schema/UI/handbook flow change. No service restart under STEERING 22: only offline scripts/tests/docs changed.
- Verification: targeted tests 2/2; pnpm format, pnpm lint:fix, pnpm check (359 unit/187 isolated integration), pnpm build and git diff --check passed. Initial lint rejected unnecessary async fake methods; replaced with resolved promises before final checks.
- Live: root HTTP 200, healthz healthy, zero alerts/dangling volumes; latest hourly social collections completed. Retained Nov 3 23:54 social failure is the already-investigated item 18 incident, not a new failure; zero failed digest jobs.
- Next: Nov 4 scheduled review first; then gated activation/worker connection and actual waste/latency/cost evidence. No paid calls or activation this iteration.

## 2026-11-04: iteration 552 — replay observed provider concurrency bounds

- Started clean on main; no leftover work. Zero alerts; healthy healthz/root, 36 sources and four available queues; no failed digest jobs. Nov 4 15:00 UTC review remains pending.
- Preserved timing-only evidence from Nov 3 scheduled edition: 43 HTTP calls/811,368 ms, including 17 article-triage calls/517,143 ms. Journal filtered by exact run ID; no prompts, responses or secrets retained. HTTP success does not imply editorial validation success.
- Added offline concurrency sensitivity CLI: all-ready fixed-duration lower bounds and hypothetical longest-first schedules at 1/2/4/8/16 slots. Eight-slot all-call lower bound is 101.421 s; dependencies, admission/rate limits and changing latency are omitted. No production prediction, concurrency change, paid calls or activation.
- Regressions cover recorded totals, failed-call time, scope isolation, order independence, empty evidence and invalid/overflowing durations. Updated TASKS/RANKING; archived iterations 533–534. No source/schema/UI/handbook flow change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (362 unit/187 isolated integration), pnpm build, recorded replay and git diff --check passed; zero dangling Docker volumes. No restart under STEERING 22: only offline tooling, fixtures, tests and docs changed.
- Next: Nov 4 scheduled review first; then gated worker connection and actual scoring-waste/latency/cost evidence. Concurrency alone at eight slots cannot meet 60 s at the old durations.

## 2026-11-04: iteration 553 — measure offline triage input composition

- Started clean on main; no leftover work. Healthy healthz/root, zero alerts, 36 nonempty/error-free sources and four available queues; no failed digest jobs. Latest hourly social collections completed.
- Extended the existing recorded batching replay with additive serialized-byte composition: instructions, excerpts, titles, source arrays and framing. Unicode/escaping/null regressions verify exact accounting; no prompt or production changes.
- Current caller setting across 153 recorded articles: 65,824 input bytes; excerpts 45.8%, titles 17.7%, sources 5.2%, instructions 5.6%, framing 25.8%. Empty topic guidance limits representativeness; bytes are not tokens. No paid calls or speed/quality claim.
- Updated TASKS/RANKING. No source/schema/UI/handbook flow change; no restart under STEERING 22 because only offline scripts/tests/docs changed.
- Verification: targeted batching tests 3/3; pnpm format, pnpm lint:fix, pnpm check (363 unit/187 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes.
- Next: review Nov 4 15:00 UTC edition first; gated incremental worker connection and actual waste/latency/cost evidence thereafter. Removing repeated instructions alone offers limited input-byte savings here.

## 2026-11-04: iteration 554 — characterize Bluesky refresh rollback

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 error-free sources and four available queues. Nov 4 scheduled review remains pending at 15:00 UTC.
- Added isolated repository regression: a late invalid engagement count rolls back an existing metadata refresh, a new post and all new observations, preserving both topics' histories. Valid retry succeeds; repeating it is idempotent.
- Updated TASKS/database verification notes and archived iterations 535–536. No production, source, schema, UI or handbook flow change; no paid calls. No restart under STEERING 22 because only tests/docs changed.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/188 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes. Initial verification found doc formatting and invalid synthetic post IDs; corrected before the passing run.
- Next: Nov 4 scheduled review first; incremental triage activation and live waste/latency/cost evidence remain gated. Recorded-response golden and other repository characterization gaps remain open.

## 2026-11-04: iteration 555 — pin Bluesky observation boundaries

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 error-free sources and four available queues; zero failed digest jobs. Recent hourly social collections completed; Nov 4 15:00 review remains pending.
- Added isolated repository coverage for inclusive/exclusive publication bounds, exact millisecond observation cutoffs, offset timestamps, deterministic snapshot ordering and invalid window dates. No production changes or paid calls.
- Updated TASKS/database verification notes. No source/schema/UI/handbook flow change; no restart under STEERING 22 because only tests/docs changed.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/189 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes. First run correctly rejected synthetic observations preceding publication; fixture corrected before the passing run.
- Next: review Nov 4 scheduled edition first; production incremental triage/grouping activation and live cost/latency evidence remain gated. Other repository characterization and recorded-response golden remain open.

## 2026-11-04: iteration 556 — characterize Bluesky snapshot capacity

- Started clean on main; no leftover work. Zero alerts, healthy healthz/root, 36 healthy sources and zero failed digest jobs. Historical ingestion/social failures remain retained; next edition is Nov 4 15:00 UTC.
- Added isolated repository coverage with 5,001 immutable snapshots: exactly the newest 5,000 survive the read cap, filtering precedes limiting, and another topic receives none. The cap counts observations, not distinct posts.
- Updated TASKS/database verification notes; archived iterations 537–538 to keep PROGRESS below 25 KB. No production/source/schema/UI/handbook flow changes or paid calls; no restart under STEERING 22.
- Verification: pnpm format, pnpm lint:fix, pnpm check (363 unit/190 isolated integration), pnpm build and git diff --check passed; zero dangling Docker volumes. Initial check found new documentation formatting; corrected before passing rerun.
- Next: review Nov 4 scheduled evidence first; incremental triage/grouping activation stays gated. Continue remaining repository characterization and recorded-response golden when product work is blocked.
