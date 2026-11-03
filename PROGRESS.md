# Progress

Earlier entries: [progress archive](docs/progress-archive/).

## 2026-11-03: iteration 426 — preserve editorial rejection evidence

- Started clean on main; no leftover work. Health, 32 sources and queues healthy; no alerts; two historical ingestion failures unchanged.
- Read-only Nov 3 journal analysis: all 43 calls admitted, no budget refusals. Article triage: 17 calls, 133,175 output tokens, 517,143 ms aggregate; all inference: 811,368 ms. Four slots imply ~203 s at observed call times, before other work; reducing output/provider work is necessary for item 7.
- Rejected responses were not cached and validation categories were memory-only, so the NBA rejection cause cannot be reconstructed from saved responses. Added structured llm.validation events with fixed category, initial/repair/cache phase, run/model and original request fingerprint; external call fingerprints link initial rejections to purpose/timing. No prompts, rejected text, schema details or error messages logged.
- Fake tests cover parse/schema/selection/absence/validator categories, successful repair/cache silence, invalid-cache logging, fingerprint correlation and content exclusion. Corrected a test expectation to hash its customized private fixture request; targeted 21/21 passed.
- Updated handbook/TASKS; archived iteration 410 to keep this file small. No UI/edition behavior changes, paid calls or Reddit requests. NBA fallback, World eligibility and items 13/7 remain open.
- Verification: pnpm format, pnpm lint:fix, pnpm check (261 unit/174 isolated integration), pnpm build, targeted llm.test.ts (21), check-handbook.ts 09-observability and git diff --check passed; real edition GET still returns 19 stories/11 X posts. Zero dangling Docker volumes.
- Next: reduce triage output/provider work using saved scores/fakes, then resolve NBA rejection and World eligibility; no paid trial. Items 13/7 stay open.
- Deployment: pushed 3c98bf1; systemctl --user restart news-digest-api.service news-digest-worker.service. Initial pnpm obs health --check raced startup; repeat passed at 15:15:44 UTC (DB/Redis healthy), both services active; edition GET preserved 19 stories/11 posts, zero alerts.

## 2026-11-03: iteration 427 — compact triage output

- Started clean on main; no leftover work. Health, 32 sources and four queues healthy; zero alerts; two historical ingestion failures unchanged.
- Article/social triage now requests compact JSON, event labels ≤80 characters and factual rationale phrases ≤100 (previously 160/300). A 50-UUID-item output reservation drops from 15,000 to 9,964 tokens (33.6%); long escaped IDs retain headroom up to 16,000. This is a ceiling reduction, not measured savings or latency.
- Scoring instructions, full-ID coverage checks and per-item cache keys remain unchanged; historical score schema stays compatible. Fake coverage verifies compact batches, cache reuse, ordering/concurrency, escaped IDs, repair and refusal (11 targeted tests).
- First full check exposed the expected synthetic raw-replay fingerprint mismatch. Re-fingerprinted only its Haiku request offline for the changed prompt; authored response bodies and golden edition unchanged. No provider responses re-recorded or paid calls.
- Updated ranking/owner pipeline docs. Archived completed TASKS markers and replaced the long archive-link index in PROGRESS with its directory link; open priorities remain.
- Verification: pnpm format, pnpm lint:fix, final pnpm check (263 unit/174 isolated integration), pnpm build, targeted triage.test.ts, check-handbook.ts 04-edition-pipeline and git diff --check passed. Zero dangling Docker volumes.
- Restarted API/worker; pnpm obs health --check and alerts passed at 15:24:58 UTC. Existing edition GET retains 19 stories/11 real X posts. No UI changes, Reddit requests or new editions.
- Next: inspect next scheduled triage output/cost/duration and truncation/validation rates; resolve NBA editor fallback and World eligibility offline. Items 13/7 remain open; no speed-target claim or paid trial.

## 2026-11-03: iteration 428 — align scheduled X search with edition coverage

- Started clean on main; no leftover work. Health, 32 sources and all queues healthy; zero alerts; two historical ingestion failures unchanged.
- Read-only World investigation: all five scheduled discoveries were published Nov 2 03:00–13:10 UTC, before the edition's Nov 2 15:00 start. The lone eligible candidate from other discovery says “Some of this morning's arrests”; saved relevance 3/importance 2 appropriately rejected it.
- Fixed scheduled date-only search bounds to include the partial current UTC day. Exact UTC publication interval is supplied in the prompt, from configured edition start through search time, capped at the latest 24 hours. Timestamp/safety/relevance gates still decide publication; spending caps, one-search/five-result limits and disabled features unchanged.
- Fake regression coverage checks current-day bounds, midnight, configured six-hour windows, recent-day cap and invalid intervals. Initial full check caught optional follow-up request type narrowing; explicit port return type fixed it. No paid calls, Reddit requests, new editions or UI changes.
- Updated SOURCES, TASKS and owner schedule handbook. Verification: targeted scheduled tests 17/17, pnpm format, pnpm lint:fix, final pnpm check (267 unit/174 isolated integration), pnpm build, check-handbook.ts 03-jobs-and-schedules and git diff --check passed. Zero dangling Docker volumes.
- Restarted API/worker; health passed at 15:32:40 UTC, zero alerts. Existing edition GET retains 19 stories/11 real X posts; no improved World-yield claim before the next scheduled search.
- Next: observe corrected scheduled World yield and compact triage output/latency; NBA fallback rejection needs the new validation diagnostics. Items 13/7 remain open; open X/Bluesky/grouping remain disabled.

## 2026-11-03: iteration 429 — distinguish provider truncation from validation rejection

- Started clean on main; no leftover work. Zero alerts and healthy DB/Redis/API; existing edition retains 19 stories/11 real X posts.
- NBA's historical rejected response cannot be reconstructed. Added allowlisted completion reason and requested output ceiling to successful Anthropic HTTP logs, correlated by request fingerprint. Future output-limit/refusal responses can be separated from normal completion and subsequent parse/schema/semantic rejection.
- Unknown/null reasons become `unknown`; no response text, stop sequence or arbitrary provider reason is logged. HTTP success still does not imply usable editorial output. No selection, cache, budget, retry or provider changes; no paid calls or Reddit requests.
- Fake-provider regression covers normal completion, output limit, refusal, null/unrecognized reasons, fingerprint/usage correlation and private-content exclusion (22 targeted tests passed). Updated TASKS and owner observability handbook.
- Verification: pnpm format, pnpm lint:fix, pnpm check (268 unit/174 isolated integration), pnpm build, check-handbook.ts 09-observability and git diff --check passed; zero dangling Docker volumes.
- Restarted API/worker with rebuilt code; pnpm obs health --check passed at 15:37:37 UTC, zero alerts; edition GET still returns 19 stories/11 posts. No UI change.
- Next: measure compact triage latency/output and corrected World search yield on the next scheduled run; inspect NBA completion/validation diagnostics if it falls back again. Items 13/7 stay open; no latency or full-AI acceptance claim.

## 2026-11-03: iteration 430 — activate scheduled open X discovery

- Started clean on main; no leftover work. Zero alerts, 32 healthy sources and four working queues; two historical ingestion failures unchanged.
- Nov 3 item 15 run is recorded/acked; followed item 22 while NBA rejection/compact-triage latency await scheduled provider evidence. Activated item 16's prepared open-topic runtime, without curated-handle restrictions.
- All primary searches must complete verification before durable low-yield (0–2 new verified posts) followups: story reactions first, otherwise accounts. Existing atomic admission, $0.40/day/$12/month caps, official verification and window guards remain. Current account lists unchanged.
- Updated Status/settings guidance, SOURCES and affected handbook pages; empty account lists no longer claim to disable primary discovery. No paid calls, new editions, Reddit requests, Bluesky inclusion or grouping activation.
- Fake regression verifies production default with empty handles, persisted verification before parented reactions, explicit account-list compatibility and budget/failure guards; targeted runtime/scheduled suite 17/17.
- Verification: pnpm format, pnpm lint:fix, pnpm check (268 unit/174 isolated integration), pnpm build, check-handbook.ts 03-jobs-and-schedules and 05-social-posts, git diff --check passed. Zero dangling Docker volumes.
- Restarted API/worker with rebuilt code; pnpm obs health --check and alerts passed at 15:41 UTC. Existing edition GET retains 19 stories/11 real X posts.
- pnpm exec tsx scripts/smoke-x-schedule-copy.ts passed desktop/mobile with no browser errors or horizontal overflow; refreshed four screenshots and inspected mobile Status/desktop settings.
- Next: measure scheduled open-search cost/yield/outside-list picks, compact triage latency and corrected World window; inspect NBA completion/validation diagnostics if fallback recurs. Items 13/7/16 remain open; no live quality or latency claim.

## 2026-11-03: iteration 431 — activate reviewed secondary X account lists

- Started clean on main; no leftover work. Zero alerts, health green, 32 healthy sources and four working queues; two historical ingestion failures unchanged.
- Followed items 20/22 after Nov 3 evidence/acks: activated item 17's already-reviewed editable lists (Tech/AI 11, NBA 10, Gaming 12, World 11). Open-topic search stays primary; these lists support optional secondary searches under unchanged caps.
- Saved through topic HTTP API and read back all four lists. Asserted every other topic field and latest edition unchanged. No paid calls, discovery triggers, Reddit requests or new editions.
- Added read-only scripts/smoke-reviewed-x-accounts.ts: compares documented lists with live API/settings across desktop/mobile, checks errors/overflow and refreshes eight screenshots. Passed; visually inspected desktop Tech and mobile NBA.
- Updated SOURCES, TASKS and item 17 ack; archived iterations 411–415 to keep PROGRESS below 25 KB. No handbook behavior change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (268 unit/174 isolated integration), pnpm build passed. Initial check stopped on newly archived Markdown formatting; corrected before successful full rerun. Browser script initially needed the repo's async-main wrapper; corrected before verification.
- No restart under STEERING 22: production binaries unchanged and topic settings are read from DB. Health/source/jobs checks passed; existing edition preserved. Final health at 15:49:59 UTC, alerts and git diff --check passed; zero dangling Docker volumes.
- Next: item 18 Bluesky production inclusion; continue scheduled open-search cost/yield/outside-list evidence and triage/NBA fallback diagnostics. No account-list quality or latency claim.

## 2026-11-03: iteration 432 — hourly official Bluesky collection

- Started clean on main; no leftover work. Zero alerts, healthy API/DB/Redis and 32 healthy sources.
- Added hourly Bluesky collection to the existing social queue: one open query per enabled topic with positive post budget, maximum four topics/200 submissions. Query uses configured first nonempty query, first relevance term or topic name.
- Shared authenticated session/backoff; sequential pass stops on search/storage error, one attempt, missing credentials skip. Per-topic counts retained in queue results; no paid calls or edition changes. Production inclusion stays off pending activation next.
- Tests pin configuration filtering, cap/window and failure stop behavior. Targeted Bluesky suite 12/12; pnpm format, pnpm lint:fix, pnpm check (270 unit/174 isolated integration), pnpm build and affected handbook checks passed.
- Restarted worker with rebuilt code. First automatic pass completed 15:54 UTC: Tech/AI 50, NBA 49, Gaming 48, World 45 fetched/submitted. Stored window readback 81/82/82/74 includes earlier probes, not new-insert counts or editorial evidence.
- Updated SOURCES, TASKS and social/schedule handbook pages. No UI change. Existing edition remains 19 stories/11 X posts; health green, zero alerts and zero dangling Docker volumes.
- Next: activate Bluesky edition inclusion under existing budget, then verify actual scheduled selections/screenshots. Continue scheduled X yield and triage/NBA fallback evidence; no paid verification run.

## 2026-11-03: iteration 433 — enable Bluesky edition inclusion

- Started clean on main; no leftover work. Health green and zero alerts.
- Activated the prepared stored-Bluesky publisher by default after Nov 3 acknowledgments; explicit BLUESKY_EDITIONS_ENABLED=0 disables it. Production has no override.
- Existing X/other picks stay intact; Bluesky fills only remaining topic slots using existing budgeted services. Hourly collection unchanged.
- Fake publisher tests cover default transaction-scoped selection, preserved X picks and disabled storage/AI; targeted suite 7/7. Updated SOURCES, TASKS and social handbook.
- No paid calls or new editions; real selections, per-topic yield and screenshots await the next scheduled edition. Item 18 remains open.
- Verification: pnpm format, pnpm lint:fix, pnpm check (270 unit/174 isolated integration), pnpm build and check-handbook.ts 05-social-posts passed. No diagram edits; zero dangling Docker volumes.
- Restarted API/worker with rebuilt code. pnpm obs health --check and alerts passed at 15:59 UTC; existing edition unchanged at 19 stories/11 real X posts. git diff --check passed.
- Next: measure scheduled Bluesky picks/screenshots, X cost/yield and compact-triage latency; inspect NBA diagnostics if fallback recurs. No live editorial-quality claim.

## 2026-11-03: iteration 434 — check grouping across input permutations

- Started clean on main; no leftover work. Zero alerts, health green, 32 healthy sources and four available queues. Scheduled Bluesky/open-X evidence is still pending; progressed item 19 offline.
- Extended the grouping evaluator beyond forward/reverse order: exhaustive permutations for up to six candidates; original/reverse plus 32 reproducible shuffles for larger windows. Reports unstable pair membership, worst false/unknown merges and positive-match range; caches pure directional comparisons.
- Synthetic four-item regression proves forward/reverse agreement can conceal a labeled false merge. Covers bounded deterministic sampling, unknown merges and empty input too.
- Recorded studio/game evaluation: five windows × 34 orders, no observed unstable, negative or unknown merges. Still 13/32 positive pairs and zero labeled false merges; no recall gain, independent labels or general order-stability claim. Production matcher/activation unchanged.
- Verification: targeted grouping suites 18/18 before caching; pnpm format, pnpm lint:fix and pnpm check passed (272 unit/174 isolated integration). Final cached evaluator reproduced recorded results; pnpm build passed. git diff --check and zero dangling Docker volumes.
- Updated TASKS and RANKING. No UI or handbook behavior change. No paid calls/new editions; current real edition remains 19 stories/11 X posts, with articles and stored X posts across all topics.
- No restart under STEERING 22: deployed runtime source/config unchanged. Final health/alerts checked before push.
- Next: scheduled Bluesky selections/screenshots and open-X cost/yield; item 19 still needs broader paraphrase recall and independent labels before activation.

## 2026-11-03: iteration 435 — detect missing scheduled lifecycles

- Started clean on main; no leftovers. Health green/zero alerts. Social acceptance awaits scheduled evidence; advanced O9 under items 24/25.
- Added latest due lifecycle timestamp aggregate and observed-due recording rule, retained 48 hours across scheduler advances. Warns after two minutes without a matching/newer due record; future rows cannot mask it.
- Enabled evaluator remote-write to the existing local metric store. Requires pre-advance scrape history; canceled schedules can warn. Lifecycle existence does not prove publication. Handbook/plan/TASKS updated.
- Verified offline rules (advance, existing record, retention/recovery, zero/absent metrics) and isolated SQL time/state boundaries. Targeted 2/2 passed after correcting omitted isolation flag; guard prevented DB access on the first attempt.
- pnpm format, pnpm lint:fix, pnpm check (272 unit/174 isolated integration), pnpm build and handbook 09-observability passed. No diagram/UI changes or paid calls.
- Restarted only changed obs-postgres/obs-alerts; app/DB/Redis unchanged. check-observability.ts --verify-alerts verifies 15 healthy rules and persisted recording output; uncached read avoids initial negative query cache.
- Final health/alerts green; latest real edition remains 19 stories/11 X posts; articles/stored X present across four topics. Zero dangling volumes; git diff --check passed.
- Next: scheduled Bluesky/open-X picks and latency evidence take priority; otherwise O7 top queries. Grouping activation/independent labels remain open.

## 2026-11-03: iteration 436 — bounded top statement timing

- Started clean on main; no leftovers. Zero alerts/healthy services. Scheduled social/latency evidence still pending; advanced O7 under items 24/25.
- Enabled pg_stat_statements with 1,000 shared entries, top-level queries only and utility tracking off. Restricted function exposes current-DB statement IDs/numeric execution statistics, excluding monitoring roles; no SQL/usernames or new metric labels.
- Added current top-20 total/mean timing tables to Database; documented cumulative/reset/eviction limits and planning-time exclusion. Raw slow-statement logging stays disabled to avoid private SQL values; O7 remains open.
- First install checked idle publication and next run Nov 4 15:00 (>2 h), then restarted only Postgres, retaining container/log paths. Second reconciliation did not restart it. Compose retains configuration on recreation; Grafana picked up its changed provisioned dashboard.
- Isolated privilege/privacy regression passed; pnpm check passed (272 unit/175 integration). pnpm format, pnpm lint:fix, pnpm build, bash -n and docker compose config --quiet passed. Corrected intermediate formatting failure before successful full check.
- check-observability.ts --verify-grafana --grafana-database-only passed: 11/11 populated panels, restricted Viewer/DB grants, real desktop/mobile screenshots inspected. Initial checks caught provisioning reload lag and mobile lazy rendering; final checks pass.
- check-handbook.ts 09-observability passed; no diagram edits. Health/alerts green; 32 healthy sources/four available queues, all-topic articles/X storage. Latest real edition unchanged: 19 stories/11 X posts. No paid calls/new editions.
- Archived iterations 416–419 to keep PROGRESS small. Zero dangling Docker volumes; git diff --check passed. No API/worker restart under item 22 because their runtime code/config is unchanged.
- Next: scheduled Bluesky/open-X picks and latency evidence first; otherwise finish O7 with safe duration-only slow-query evidence, then O8/O10.

## 2026-11-03: iteration 437 — private slow database-call evidence

- Started clean on main; no leftovers. Zero alerts/healthy services. Product acceptance still awaits scheduled evidence; completed O7 under items 24/25.
- App database clients now emit duration/outcome for calls ≥250 ms, capped at ten/minute/process across pools; next emitted record includes suppressed count. No SQL, parameters, results or database errors. Existing request/job context and 14-day log retention apply.
- Covers promise/callback pool queries and transaction clients; excludes pool acquisition, custom streaming Query objects and non-app clients. This documented client-duration alternative replaces raw server slow-query text logging, which stays disabled.
- Unit tests pin thresholds/caps/privacy, receiver/callback/result/error behavior and single wrapping. Isolated Postgres verifies real pool/transaction success/failure logs; its deliberate slow calls are test evidence only.
- pnpm format, pnpm lint:fix, pnpm check (274 unit/176 isolated integration), pnpm build passed. Fixed initial wrapper typing/lint errors before the successful full check. check-handbook.ts 09-observability passed; no diagram/UI changes.
- Added slow-call suite to check-observability.ts --verify-o1; post-restart --verify-o1 --verify-o2 passed ten offline suites, request/worker logs, redaction and log-store delivery. Restarted only API/worker; no DB/Redis restart.
- TASKS/plan/handbook updated; O7 complete with documented limits. Health green, zero alerts/dangling volumes, 32 healthy sources/four available queues, all-topic articles/X storage. Latest real edition unchanged: 19 stories/11 X posts. No paid calls/new editions.
- Next: scheduled social/latency evidence first; otherwise O8 harness metrics, then O10 browser errors. Grouping activation/independent labels remain open.

## 2026-11-03: iteration 438 — read-only harness status metrics

- Started clean on main; no leftovers. Zero alerts/healthy services; product acceptance awaits scheduled evidence. Advanced O8 under items 24/25.
- Existing unit collector now bridges bounded heartbeat/quota JSON into its atomic node_exporter textfile. Protected harness files unchanged; no logs/transcripts/free text/run IDs read or exposed.
- Exposes iteration, previous exit code, no-progress streak, start/optional finish and observation timestamps, plus weekly quota when available. Per-file read-success; invalid/missing input removes that source's samples. Heartbeat age is not liveness, and quota can be stale.
- Offline tests cover privacy, missing/malformed/oversized/deep input, invalid quota and window identity. Added to normal unit suite and check-observability.ts --verify-o8; live exporter and metric-store delivery verified.
- pnpm format, pnpm lint:fix, pnpm check (275 unit/176 isolated integration), pnpm build, bash -n and check-handbook.ts 09-observability passed. Corrected initial test-wrapper lint failure; no UI/diagram changes.
- Installed only changed collector scripts; ran existing obs-unit-metrics service successfully. No app/DB/Redis restarts or paid calls. Health green, zero alerts/dangling volumes; 32 healthy sources/four available queues, articles and stored X across all topics.
- TASKS/plan/handbook updated; archived iteration 425 to keep PROGRESS small. O8 remains open: dashboard, duration/token/commit/pacing evidence next; scheduled product evidence still takes priority, then O10.

## 2026-11-03: iteration 439 — supervisor status dashboard

- Started clean on main; no leftovers. Health/alerts green; product acceptance still awaits next scheduled edition. Advanced O8 under items 24/25.
- Agent dashboard adds eight read-only panels: reported iteration, previous exit code, no-progress streak, weekly quota, heartbeat/quota observation ages, per-file read success and reported UTC start. Existing six cgroup panels retained.
- Missing status displays Unknown; observations can be stale, reads do not prove freshness and heartbeat age is not liveness. No inferred duration/tokens/commits/pacing; protected harness files unchanged.
- Extended check-observability Grafana verification with agent-only mode, finite populated samples and desktop/mobile screenshots; inspected both. Final --verify-o8 --verify-grafana --grafana-agent-only passed 14/14 panels, Viewer grants and memory ceiling (205 MiB).
- Initial checks caught provisioning reload lag, an obsolete unit-label assertion and mobile lazy rendering; corrected checker and final browser verification passed.
- pnpm format, pnpm lint:fix, pnpm check (275 unit/176 isolated integration), pnpm build and check-handbook.ts 09-observability passed; git diff --check clean. No diagram changes.
- Installed only dashboard JSON; Grafana hot-loaded it without restart. App/DB/Redis unchanged. Zero alerts/dangling volumes; healthy sources/queues and all-topic articles/stored X. Latest real edition remains 19 stories/11 posts; no paid calls/new editions.
- TASKS/plan/handbook updated. O8 remains open for available duration/token/commit/pacing evidence; next scheduled social/latency evidence takes priority, then O10 browser errors.
