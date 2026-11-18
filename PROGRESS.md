# Progress

[Earlier entries](docs/progress-archive/2026-11-17-progress-before-2575.md).

[Iterations 2575–2582](docs/progress-archive/2026-11-17-iterations-2575-2582.md)

[Iterations 2583–2590](docs/progress-archive/2026-11-17-iterations-2583-2590.md)

[Iterations 2591–2597](docs/progress-archive/2026-11-17-iterations-2591-2597.md)

[Iterations 2598–2603](docs/progress-archive/2026-11-17-iterations-2598-2603.md)

[Iterations 2604–2610](docs/progress-archive/2026-11-17-iterations-2604-2610.md)

[Iterations 2611–2618](docs/progress-archive/2026-11-17-iterations-2611-2618.md)

[Iterations 2619–2626](docs/progress-archive/2026-11-17-iterations-2619-2626.md)

[Iterations 2627–2635](docs/progress-archive/2026-11-17-iterations-2627-2635.md)

[Iterations 2636–2645](docs/progress-archive/2026-11-17-iterations-2636-2645.md)

[Iterations 2646–2653](docs/progress-archive/2026-11-17-iterations-2646-2653.md).

[Iterations 2654–2658](docs/progress-archive/2026-11-17-iterations-2654-2658.md).

[Iterations 2659–2664](docs/progress-archive/2026-11-18-iterations-2659-2664.md)

[Iterations 2665–2672](docs/progress-archive/2026-11-18-iterations-2665-2672.md)

[Iterations 2673–2676](docs/progress-archive/2026-11-18-iterations-2673-2676.md)

## 2026-11-18: iteration 2677 — review published grouping provenance

- Clean main at 54458739; no inherited work. Initial alerts clear; health database/Redis pass; supported services/sources/jobs checks pass. Metrics checkpoint remains due ≥01:25 UTC.
- Owner value: distinguish shared reporting from broad subject overlap before changing coverage counts or splitting useful multi-source stories.
- Reviewed all twelve Nov 17 published multi-report groups against all 45 exact ID/URL-matched captured members; saved texts and assessments in docs/edition-reviews/2026-11-17-grouping.{md,json}.
- Seven groups supported; five retain scope/provenance uncertainty. GTA reports share Sensor Tower estimates, unlike Nov 16's separate forecasts. Empty Tech and short Gaming members remain unresolved; no new grouping wording rule.
- NBA excerpts disagree on retrospective points and a recap score; preserved attribution and immutable summaries. Published Memphis summary gives no final score. Source discrepancies do not establish a grouping failure.
- Signed-out public HTTPS latest matches all 45 coverage IDs/URLs/titles and returns five topics/25 stories/20 posts. Receipt /tmp/2677-reader.json; existing DNS override retains certificate checks.
- No model call, publisher fetch, source/provider/budget/flag change or UI change. No handbook or screenshot update needed. Tech admission remains enabled pending natural scheduled acceptance.
- Verification: pnpm format/lint:fix/check pass: 1,087 unit/330 integration tests, four expected skips; isolated harness rebuilt API. Assertions cover unique members, group/assessment counts and public projection. Receipts /tmp/2677-{format,lint,check,services,sources,jobs}.log.
- Next: natural Nov 18 admission/reader review and 04:40 retention; metrics ≥01:25 UTC. API/worker restart after push.

## 2026-11-18: iteration 2678 — retain shared-estimate GTA coverage

- Clean main at fb6c665e; no inherited work. Alerts clear; health database/Redis pass, 14 monitored services and active sources/jobs checks pass; disk 73%. Metrics checkpoint not yet due (≥01:25 UTC).
- Reader weakness: Nov 16 merged separate forecasts, but splitting all GTA coverage would also discard Nov 17's supported shared Sensor Tower estimate. Added the latter as a positive offline membership control.
- Three exact pre-publication candidates match saved reviewed IDs, URLs and excerpts; three agent-labeled positive pairs pass all six orders. Separate-all control misses three positives. Independent labels/semantic evaluation remain open.
- No production grouping, prompt, source, provider, budget, UI or flag change; Tech admission stays enabled for natural scheduled acceptance. No handbook or screenshot change needed.
- Verification: targeted grouping suite passes 19 tests; pnpm format/lint:fix/check pass, 1,088 unit and 330 integration tests/four expected skips. Isolated harness rebuilt API. Receipts: /tmp/2678-{targeted,format,lint,check}.log.
- Next: natural Nov 18 Tech admission/reader review, 04:40 retention, metrics ≥01:25 UTC. API/worker restart after push.

## 2026-11-18: iteration 2679 — restore scheduled timing evidence in public mode

- Clean main at 99a14fc0; no inherited work. Alerts clear; health database/Redis pass; services/sources/jobs checks pass. Destructoid remains deliberately paused.
- Owner value: the next morning review can measure real worker latency and inspect saved editorial/social evidence instead of losing the report to the public status projection.
- Reproduced `Edition timing report unavailable`: the private status schema rejects deliberately omitted public fields. Reporter now reads existing local OperationsStatus and saved-preview adapters, closing their DB/Redis resources afterward.
- No public API expansion, inference, jobs, provider/budget/source/flag/UI changes. Updated the affected operations handbook; no diagram or screenshot change needed.
- Live read-only report passes for the latest three scheduled editions, all five topics/edition ledgers, zero unavailable runs. Nov 17 retained worker attempt 247.549 s; scheduled completion delay 247.632 s. Immutable publication timestamps remain distinct.
- Signed-out HTTPS scheduled reader passes: five topics/25 stories/20 posts. Public status still omits job runs and model details. Handbook check passes (19 pages/39 tables). Receipts /tmp/2679-{timing,history,reader}.json and handbook.log.
- Verification: pnpm format, pnpm lint:fix and pnpm check pass: 1,088 unit tests/330 integration tests, four expected skips; isolated harness rebuilt API. Logs /tmp/2679-{format,lint,check}.log.
- API/worker restart after commit/push; next: metrics ≥01:25 UTC, 04:40 retention, natural Nov 18 Tech admission and reader review.

## 2026-11-18: iteration 2680 — due metrics recovery checkpoint

- Clean main at 23bcdaaf; no inherited work. Initial alerts clear; health database/Redis, all 14 monitored services, active sources and jobs pass. Destructoid remains deliberately paused.
- Reader weakness: Gaming lexical noise has a retained bounded comparison that does not justify a replacement query; retain it rather than repeat the investigation. Tech admission awaits the natural Nov 18 scheduled edition.
- Completed the due 01:25 metrics checkpoint with eleven samples, 01:16:20–01:26:26, spanning required repository verification: all 24 rules healthy, 22 uncached probes ≤1.890 s.
- Since 00:22:37: 68 small merges/1,638,424 rows, no new big merge; one admission-limit event without timeout. No new slow query, process/evaluator restart, evaluator error/miss or max/OOM/kill event; metrics journal empty.
- Memory-high +1,368 (287 sampled); ending memory 90,267,648 bytes, lifetime peak 93,683,712; NRestarts=0, disk 73%. Resource acceptance remains open; retain CPU 2%/88 MiB high/112 MiB max.
- Signed-out HTTPS latest passes five topics/25 stories/20 posts; certificate checks retained with the existing public DNS override. No inference, source/query/provider/budget/flag/UI change, or metrics restart/retuning.
- Archived progress iterations 2665–2672 and older scheduled/completed task detail to keep handoffs small; updated capacity evidence and the task checkpoint. No handbook, schema metadata or screenshot change needed.
- Verification: pnpm format, pnpm lint:fix and pnpm check pass: 1,088 unit/330 integration tests, four expected skips; isolated harness rebuilt API. Receipts /tmp/2680-{format,lint,check,metrics.jsonl,summary.json,reader.json}; summary assertions pass.
- Initial push rejected: owner commit a20e05b0 added item 66 during verification. Merged without rewriting history; routine metrics checks stop, TASKS retains limits only. This checkpoint was committed before the newer instruction arrived.
- API/worker restart after merge/push; next: fix missing Tech excerpts under item 66, retention 04:40 UTC, natural admission and the single daily reader review after 15:00 UTC.

## 2026-11-18: iteration 2681 — collect publisher evidence for HN Tech stories

- Clean main at d5119173; no inherited work. Alerts clear; health database/Redis pass. Work outside protected hours; no paid calls, cap/flag/provider/UI changes.
- Read latest public Tech: Grok report has concrete detail; four other summaries remain headline-level. HN collection saved only optional item.text; ordinary link submissions were empty before storage.
- Added shared-client publisher fetch only for empty link submissions, extracting article paragraphs (1,500 characters), removing scripts/navigation/header/footer. Existing HN text wins; blocked/unavailable pages preserve the valid story without text. No bypass or body-wide fallback.
- Live HN batch: 19 previously saved candidates, only two with excerpts; after collecting/storing 20, ten have excerpts. Eight existing empty rows enriched, including MAI Code, Solid 2, Java4Shell and Cloudflare Quad9. Receipt /tmp/2681-live.json; original Nov 17 eligible-pool baseline remains 29/200 with text.
- Added offline extraction/enrichment/failure tests and recorded Java4Shell publisher paragraphs; updated sources and pipeline handbook. No diagram/schema/screenshot changes.
- Signed-out HTTPS reader passes five topics/25 stories/20 posts. Local reader requests returned 429; public route succeeds. Existing published editions unchanged.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass: 1,091 unit/330 integration tests, four expected skips; targeted 3/3 and handbook 19 pages/39 tables pass. Initial format check caught newly added fixtures/tests; final check is green. Logs /tmp/2681-*.log.
- All 14 monitored services, active sources and job checks pass. Commit/push followed by API/worker restart; no inherited work or paid replay.
- Next: natural Nov 18 Tech candidate share and summary-depth acceptance after 15:00 UTC; item 66 stays open. Pages without usable article markup remain empty.

## 2026-11-18: iteration 2682 — retain reporting from publisher main sections

- Clean main at 3562a070; no inherited work. Alerts clear and health passes; outside protected hours. Owner-visible value: richer Tech evidence from readable publisher pages previously saved empty.
- Cerebras announcement uses main rather than article. Extractor now accepts paragraphs after a heading within main, preserving article precedence and excluding navigation/scripts/header/footer. No body-wide fallback or blocked-access workaround.
- Live collection: 10/19 existing candidates had excerpts; final 12/20 batch has excerpts. Cerebras and Revscope existing empty rows gained 1,500-character reporting excerpts, including architecture/capacity and experiment details. Receipts /tmp/2682-{live-final,final-excerpts}.json.
- Inspection found a link-only jQuery release paragraph in the initial batch; exclude URL-only paragraphs and cleared only that exact newly stored link. No paid calls, model/provider/budget/flag changes.
- Added recorded Cerebras main excerpt plus heading/chrome/precedence/link-only tests; targeted 6/6 pass. Updated sources and pipeline handbook; no diagram/schema/UI changes.
- Signed-out public HTTPS reader returns five topics/25 stories/20 posts. All 14 monitored services, sources and job checks pass. Scheduled Tech share/depth acceptance remains after 15:00 UTC.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass: 1,094 unit/330 integration tests, four expected skips. Logs /tmp/2682-{format,lint,check,build}.log. Initial formatter rejected the truncated HTML fixture; retained original heading/paragraph tags with layout wrappers omitted, then reran successfully.
- Handbook initially exceeded its line limit; shortened affected explanation and page check passes (19 pages/39 tables). Final format/lint pass. Commit/push followed by API/worker restart; next: natural Nov 18 Tech share and depth acceptance after 15:00 UTC.

## 2026-11-18: iteration 2683 — recover MediaWiki Tech evidence

- Clean main at 7471ec73; no inherited work. Alerts clear and health passes; outside protected hours. No paid calls, budget/provider/flag/UI changes or edition regeneration.
- Two readable HN-linked pages use MediaWiki containers rather than article/main reporting. Added parse5-backed extraction scoped to mw-content-text / mw-parser-output, excluding nested tables and citation markers; article precedence and 1,500-character limit retained.
- Saved empty Tech candidates repaired from normal shared-client HTTP 200 responses: ArchiveTeam Apple Discussions 0 → 681 characters; Consumer Rights ID.me 0 → 1,500. Reporting includes shutdown dates/read-only status and arbitration/privacy/sign-in alternatives. Conditional updates touched only empty excerpts; receipt /tmp/2683-saved.json.
- Original 2682 20-URL cohort now observed at 15 with excerpts; only the two above are attributed to this step. Earlier 12/20 batch is not a same-time baseline for concurrent ingestion. Scheduled candidate-share/reader-depth acceptance remains after 15:00 UTC.
- Shared-client requests found linked OpenAI/FT pages HTTP 403 and microsoft/onnxruntime HTTP 404. Named once in NEEDS_FROM_HUMAN.md; no workaround. Browser Engineering has no supported reporting container; link-only jQuery remains empty.
- Recorded ArchiveTeam fixture and scoped/nested/class-token/precedence cases pass (8/8). Updated source inventory and pipeline handbook; no diagrams/schema/UI changes.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass: 1,096 unit/330 integration tests, four expected skips. Handbook passes (19 pages/39 tables); initial page length failure fixed. Logs /tmp/2683-{format,lint,check,build,handbook}.log.
- Signed-out public HTTPS reader passes five topics/25 stories/20 posts. Commit/push and API/worker restart follow; next: natural Nov 18 Tech share and summary-depth acceptance, retention at 04:40 UTC.

## 2026-11-18: iteration 2684 — retain research abstracts for Tech evidence

- Clean main at b7f41477; no inherited work. Alerts clear, health passes; outside protected hours. No paid calls, budget/provider/flag changes or edition regeneration.
- Reader weakness remains thin Tech evidence. Saved HN research links had empty excerpts: Latent Lattice uses section#abstract, while arXiv uses blockquote.abstract rather than paragraph reporting. Old arXiv main fallback selected 456 characters of footer text instead of its abstract.
- Added scoped named-abstract extraction before main fallback, preserving article precedence and the 1,500-character cap. No body-wide fallback, PDF fetch or access workaround.
- Shared-client HTTP 200 pages repaired two saved empty candidates: arXiv 2611.09827 0 → 1,194 characters; Latent Lattice 0 → 1,500, including modeled satellite effects and 15.41 → 14.40 validation perplexity. Updates touched only empty rows; receipt /tmp/2684-saved.json.
- Recorded both abstract containers; targeted extraction suite passes 11/11, including footer exclusion, explicit container boundaries, precedence and length. Updated source inventory and pipeline handbook; no schema/UI/diagram changes.
- Signed-out public HTTPS reader returns five topics/25 stories/20 posts. All 14 monitored services, active sources and job health checks pass; parked Destructoid remains inactive.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass (1,099 unit/330 integration tests, four expected skips); logs /tmp/2684-*.log. Commit/push followed by API/worker restart. Handbook initially exceeded its line limit; shortened the affected explanation and page check passes (19 pages/39 tables).
- Next: natural Nov 18 Tech candidate-share and summary-depth acceptance after 15:00 UTC; retention at 04:40 UTC. Scheduled edition unchanged; broader depth acceptance remains open.

## 2026-11-18: iteration 2685 — retain microformats Tech article bodies

- Clean main at 1680aa08; no inherited work. Initial pending worker scrape/service alerts followed the prior restart; worker running and alerts subsequently clear. Health passes; outside protected hours.
- Purism's HN-linked announcement uses a nested e-content body without article/main. Added exact class-token, parse5-scoped extraction; article/abstract precedence and 1,500-character cap remain. No body-wide fallback or access workaround.
- Shared-client live HTTP 200 returns 32,792 bytes and 1,500 extracted characters. Saved empty Purism candidate repaired 0 → 1,500 characters, retaining RISC-V/PureOS and crowdfunding details. Conditional update touched only its empty excerpt; receipt /tmp/2685-saved.json.
- Recorded publisher paragraphs plus scope/nesting/class-token/precedence cases pass 13/13. Source inventory and pipeline handbook updated; handbook passes (19 pages/39 tables). No schema/UI/diagram changes or paid calls, budget/provider/flag changes, or edition regeneration.
- Build passes. Signed-out public HTTPS Chromium reader returns five topics/25 stories/20 posts. Local health, active sources and job checks pass. Direct VM DNS path failed; public DNS resolved Chromium check passes, as in prior iteration.
- Verification: pnpm format and pnpm lint:fix pass; full pnpm check passes (1,101 unit/330 integration tests, four expected skips). Logs /tmp/2685-{format,lint,check,build,handbook,reader,fetch}.log.
- Next: natural Nov 18 Tech candidate-share and summary-depth acceptance after 15:00 UTC; scheduled edition unchanged. Commit/push and API/worker restart follow successful checks.

## 2026-11-18: iteration 2686 — backfill readable saved Tech reporting

- Clean main at d1c0ee82; no inherited work. Alerts clear and health passes; outside protected hours. No paid calls, flag/budget/provider changes or edition regeneration.
- Read current public Tech: the Optimizely story still cites only an HN allegation. Eight existing empty HN candidates already yield publisher prose with the deployed extractor; collection changes alone had not enriched these stored rows.
- Backfilled only blank excerpts after shared-client HTTP 200 fetches and passage review: Human.md, PostHog decision models, Apple outage, US machine tools, Optimizely malware, Antfly licensing, Java4Shell and open-source operations. All eight 0 → 1,500 characters; exact saved IDs/text verified, 12,000 characters total.
- Durable URL/before/after receipt: docs/edition-reviews/2026-11-18-tech-excerpt-recovery.md; full local receipt /tmp/2686-saved.json. Tencent returns an application shell with no reporting; left empty. Previously named blocks not retried; no X/mirror fetches.
- Updated source inventory/tasks; archived progress 2673–2676 to keep orientation small. No application/schema/UI/handbook behavior change. Scheduled candidate-share and reader-depth acceptance remains after 15:00 UTC.
- Verification: exact database reread passes (8/8); signed-out public HTTPS Chromium reader passes five topics/25 stories/20 posts. pnpm format, pnpm lint:fix, pnpm check and pnpm build pass: 1,101 unit/330 integration tests, four expected skips. Handbook passes (19 pages/39 tables); logs /tmp/2686-*.log. Commit/push and API/worker restart follow.

## 2026-11-18: iteration 2687 — recover shutdown and agent-workflow evidence

- Clean main at 0a6b6e27; no inherited work. Alerts clear, health passes; outside protected hours. No paid calls, budget/provider/flag changes or edition regeneration.
- Read latest public Tech: Apple/China remain one-sentence summaries and Optimizely remains an HN allegation. Continued repairing blank saved candidate evidence for the next edition.
- Shared-client HTTP 200 pages recovered four blank candidates using the deployed extractor: Mem shutdown, lend workflow and two opinion posts. Mem retains shutdown/read-only dates, billing and export instructions; lend retains remote-agent/local-credential context.
- Conditional blank-only updates added 5,402 characters; exact IDs/text reread passes 4/4. Receipt: docs/edition-reviews/2026-11-18-tech-excerpt-recovery.md; local full text /tmp/2687-saved.json.
- Claude.dev verification and Browser Engineering landing page yield no scoped prose; left empty. Named publisher blocks not retried; no bypass or X/mirror fetches.
- Updated source inventory/tasks; no application/schema/UI/handbook behavior change. Signed-out public HTTPS Chromium reader passes five topics/25 stories/20 posts.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass (1,101 unit/330 integration tests, four expected skips). Handbook passes (19 pages/39 tables). Logs /tmp/2687-*.log. Commit/push and API/worker restart follow.
- Next: natural Nov 18 Tech candidate-share and reader-depth acceptance after 15:00 UTC; retention at 04:40 UTC. Existing edition remains immutable.

## 2026-11-18: iteration 2688 — collect explicit article-template evidence

- Clean main at 9f9eb9ac; no inherited work. Alerts clear, health and source/job checks pass; outside protected hours. No paid calls, budget/provider/flag changes or edition regeneration.
- Read current public Tech: Apple/China remain one sentence and Optimizely remains an HN allegation. Found another collection cause: Claude.dev verification reporting is in a data-tpl article with a named prose body, unsupported by the extractor.
- Added scoped article-template extraction requiring its heading and exact body/prose markers. Related posts, outside prose and partial class matches excluded; existing article precedence and 1,500-character cap retained.
- Fresh shared-client HTTP 200 returns 105,652 bytes; blank saved candidate repaired 0 → 1,500 characters. Exact ID/text reread passes. Receipt: docs/edition-reviews/2026-11-18-tech-excerpt-recovery.md; local /tmp/2688-saved.json.
- Recorded publisher paragraphs and layout/precedence cases pass 15/15. Source inventory and affected handbook page updated; no schema/UI/diagram change. Public HTTPS Chromium reader passes five topics/25 stories/20 posts.
- Verification: pnpm format, pnpm lint:fix, pnpm check and pnpm build pass (1,103 unit/330 integration tests, four expected skips). Affected-page handbook passes (19-page inventory/one diagram/39 tables); first full attempt hit HTTP 429, owner-services retry caught a 101-line page, shortened and passed. Logs /tmp/2688-*.log.
- Next: natural Nov 18 Tech share/depth acceptance after 15:00 UTC; retention at 04:40 UTC. Commit/push and API/worker restart follow successful checks.
