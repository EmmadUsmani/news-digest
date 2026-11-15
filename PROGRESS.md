# Progress

Older entries: [archived through the first half of Nov 15](docs/progress-archive/2026-11-15-before-2346.md).

## 2026-11-15: iteration 2347 — separate launch acceptance from editorial quality

- Clean main at 4ea39e3c; no inherited work. Initial orientation was overbroad; subsequent reads narrowed. Alerts zero, health/database/Redis healthy; all 38 sources pass.
- Owner value: the Nov 15 review still required complete all-topic triage under the public readiness gate, contradicting STEERING 62 and risking an incorrect launch refusal.
- Split the checklist into scheduled publication/access acceptance and editorial breakage review; added exact read-only commands and item 50 handoff. Fallbacks, withheld topics and thin summaries remain recorded without blocking access acceptance.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check`, `git diff --check`; handbook/schema validation passes with `pnpm exec tsx scripts/check-handbook.ts --owner-services public-readiness` (18 pages, 39 tables). Initial handbook invocation without owner-services returned expected public-mode HTTP 404; corrected invocation passed. Logs `/tmp/2347-*`.
- No runtime/config changes or restart under STEERING 22; no spend or sharing changes. Scratch cleanup already applied today (2339), so not repeated. Next: Nov 15 15:00 UTC publication/access acceptance and separate natural editorial review.

## 2026-11-15: iteration 2339 — reclaim stale installer scratch

- Clean main at accf2897; no inherited work. Orientation output was overbroad; subsequent reads narrowed. Alerts zero; health/database/Redis healthy, sources collecting and scheduled digest due 15:00 UTC. No duplicate acceptance or metrics probe.
- Owner value: reclaim disk headroom before the scheduled edition and test-container peaks, applying STEERING 61 once today at 76% use.
- Deleted only four top-level regular files, each exedev-owned, older than seven days and unused according to privileged `fuser -v` (exit 1, empty output). Installer archive listings confirmed tools rather than backups.
- Deleted `/tmp/vmalert-tool-prod` (36,474,880 allocated bytes), `/tmp/vmalert-prod` (28,065,792), `/tmp/news-digest-age-v1.3.2.tar.gz` (19,406,848) and `/tmp/nd-postgres-exporter.tgz` (10,559,488). Total 94,507,008 bytes (90.1 MiB); absence asserted after deletion.
- `df -B1 --output=size,used,avail,pcent /`: available 6,008,619,008→6,102,863,872 bytes; rounded disk use 76%→76%. Retained all logs, metrics/data, backups, browser profiles/sessions and installed executables.
- Verification: ownership/age/regular-file assertions, archive inspection, privileged open-reference checks and post-delete absence checks pass. `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,040 unit/329 integration passes, four expected skips). Logs `/tmp/2339-{format,lint,check}.log`.
- No app code/config, source, schema, budget, inference or sharing changes; no restart under STEERING 22. Next: scheduled recovery and public-reader acceptance; keep VM private.

## 2026-11-15: iteration 2340 — restore archive verification in public mode

- Clean main at 03926499; no inherited work. Alerts zero, API/database/Redis healthy; all 38 sources healthy and collecting. Scheduled acceptance still due 15:00 UTC.
- Owner value: past editions and older/newer navigation must remain usable before sharing. Reproduced the archive check failing before browser launch: its visitor-less loopback fetch returned an empty public-mode refusal response.
- Repaired `smoke-reader-archive.ts` with an explicit documentation-range local visitor for fixed-origin history reads and loopback GET/HEAD browser requests. No account identity; external requests blocked and admin/writes asserted absent.
- Real published history and saved-edition date navigation pass desktop/mobile light/dark. Controlled pagination/empty/error/retry cases replay saved history and are not live pagination evidence. Zero page errors or horizontal overflow.
- Refreshed eight archive/date screenshots and inspected mobile light archive and saved edition. App, admission policy, collection, generation, budgets and VM sharing unchanged.
- Verification: `pnpm exec tsx scripts/smoke-reader-archive.ts`, `pnpm obs sources --check`, `pnpm format`, `pnpm lint:fix`, full `pnpm check` and diff checks pass (1,040 unit/329 integration passes, four expected skips). Initial non-TTY full check exited 143 during unit tests; persistent-terminal retry completed. Logs `/tmp/2340-{archive,sources,format,lint,check-retry}.log`.
- Initial push rejected because remote advanced; fetched and merged owner-only `docs/lead/` updates without editing them or rewriting history. No runtime impact or additional checks needed.
- No restart under STEERING 22: services run unchanged code/config. Next: Nov 15 scheduled recovery/public-reader gate; retain private VM sharing.

## 2026-11-15: iteration 2341 — verify archive keyboard and loading recovery

- Clean main at dfcf719e; no inherited work. Alerts zero, health/database/Redis healthy; source check passes. Scheduled recovery/public-reader acceptance remains due 15:00 UTC.
- Reproduced archive keyboard check failing on visitor-less public-mode history fetch. Added documentation-range visitor admission to fixed loopback history/browser reads in focus and loading checks, with status/timeout assertions, no identity and external requests blocked.
- The keyboard check also sampled the heading during scroll settlement (y=-73); it now waits for the existing viewport condition before measuring, without relaxing focus or visibility requirements.
- Desktop/mobile light/dark pass delayed older/newer pagination, heading focus/page description, visible focus outline and next-date Tab order. Loading skeletons, saved links and failed-request retry pass all four combinations.
- Controlled pagination/delay/failure responses replay real saved history, not live pagination evidence. Refreshed twenty screenshots; inspected mobile light pagination. No app/admission, source, schema, inference, budget or sharing change.
- Verification: both Playwright scripts pass all four viewport/theme combinations; `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,040 unit/329 integration passes, four expected skips). Initial check stopped at formatting after the progress archive was created; formatted and reran successfully. Logs `/tmp/2341-{focus,loading,sources,format-retry,lint-retry,check-retry}.log`.
- Archived iterations 2325–2330 to keep PROGRESS.md below 25 KB. No restart under STEERING 22: runtime code/config unchanged. Next: Nov 15 scheduled recovery/public-reader acceptance; keep VM private.

## 2026-11-15: iteration 2342 — restore keyboard skip verification

- Clean main at d4e8e38b; no inherited work. Initial orientation output was overbroad; narrowed subsequent reads. Alerts zero, health/database/Redis healthy and source check passes. Scheduled acceptance remains due 15:00 UTC.
- Reproduced keyboard skip check failing before browser launch on visitor-less public-mode latest-edition fetch. Added documentation-range visitor admission to fixed loopback reads, status/timeout assertions and published-topic assertion; no identity, writes or external requests.
- Real saved edition and archive pass desktop/mobile light/dark: first Tab reveals the skip link, Enter focuses the visible content heading, next Tab reaches content and no overflow/page errors occur.
- Refreshed eight screenshots and inspected mobile light edition. No app/admission, content, source, schema, budget or sharing changes.
- Verification: `pnpm exec tsx scripts/smoke-reader-skip-link.ts`, `pnpm obs sources --check`, `pnpm format`, `pnpm lint:fix`, full `pnpm check` and diff checks pass. Logs `/tmp/2342-{skip,sources,format,lint,check}.log`.
- No restart under STEERING 22: runtime code/config unchanged. Next: scheduled recovery/public-reader gate; keep VM private.

## 2026-11-15: iteration 2343 — restore timeout recovery verification

- Clean main at f851b6b2; no inherited work. Initial orientation output was overbroad; narrowed subsequent reads. Alerts zero, health/database/Redis healthy; all 38 sources pass the source check. Scheduled acceptance remains due 15:00 UTC.
- Reproduced timeout smoke failure before browser launch: visitor-less public-mode latest-edition read returned 429. Added documentation-range visitor admission to fixed loopback reads, redirect refusal and a published-topic assertion.
- Browser reads now carry the local visitor; external requests are blocked and admin reads/writes remain asserted absent. No app or admission-policy change.
- Controlled stalled edition/archive requests reach bounded timeout without automatic retries; manual retry restores real saved content on desktop/mobile light/dark. Saved reader and admin-preview data remain unchanged; zero browser errors or writes.
- Refreshed eight timeout screenshots and inspected mobile light archive. Stalls are simulated; recovered content is the real published edition.
- Verification: `pnpm exec tsx scripts/smoke-reader-timeout.ts`, `pnpm obs sources --check`, `pnpm format`, `pnpm lint:fix`, full `pnpm check` and diff checks pass (1,040 unit/329 integration passes, four expected skips). Logs `/tmp/2343-{timeout,sources,format,lint,check}.log`.
- No restart under STEERING 22: runtime code/config unchanged. No collection, generation, budget or sharing changes. Next: scheduled recovery/public-reader acceptance; keep VM private.

## 2026-11-15: iteration 2344 — restore edition loading verification

- Clean main at 4c60b771; no inherited work. Initial orientation output was overbroad; narrowed later reads. Alerts zero, health/database/Redis healthy and all 38 sources pass. Scheduled acceptance remains due 15:00 UTC.
- Reproduced loading smoke failure before browser launch: visitor-less latest-edition fetch returned an empty non-JSON response. Added documentation-range visitor admission, explicit HTTP status/timeout/redirect checks and a published-topic assertion to fixed loopback reads.
- Browser traffic now asserts no admin reads, identity headers or writes; external requests and service workers are blocked. No application admission-policy change.
- Desktop/mobile light/dark pass loading skeletons, real saved-topic rendering and controlled 404 recovery. Refreshed four screenshots; inspected mobile light. Delay/error responses are simulated; rendered edition content is real saved content.
- Verification: `pnpm exec tsx scripts/smoke-reader-loading.ts`, `pnpm obs sources --check`, `pnpm format`, `pnpm lint:fix`, full `pnpm check` and diff checks pass (1,040 unit/329 integration passes, four expected integration skips). Logs `/tmp/2344-{loading,sources,format,lint,check}.log`.
- No restart under STEERING 22: runtime code/config unchanged. No generation, source, budget or sharing changes. Next: scheduled recovery/public-reader acceptance; VM stays private.

## 2026-11-15: iteration 2345 — restore date-navigation recovery verification

- Clean main at 208e24d5; no inherited work. Initial orientation output was overbroad; narrowed subsequent reads. Alerts zero, health/database/Redis healthy and all 38 sources pass. Scheduled acceptance remains due 15:00 UTC.
- Reproduced date-navigation smoke failure before browser launch: visitor-less latest-edition fetch returned empty non-JSON. Added documentation-range visitor admission to fixed loopback reads, status/timeout checks and redirect refusal.
- Browser requests assert no identity headers, admin reads or writes; external traffic and service workers blocked. No application admission-policy change.
- Desktop/mobile light/dark pass invalid history, repeated failure, manual retry, older-date destination and keyboard-focus recovery using real saved edition/history. Failures are simulated; refreshed four screenshots and inspected mobile light.
- Verification: `pnpm exec tsx scripts/smoke-reader-date-recovery.ts`, `pnpm obs sources --check`, `pnpm format`, `pnpm lint:fix`, full `pnpm check` and diff checks pass. Logs `/tmp/2345-{date,sources,format,lint,check}.log`.
- No restart under STEERING 22: runtime code/config unchanged. No source, generation, budget or sharing changes. Next: scheduled publication/public-reader acceptance; VM stays private.

## 2026-11-15: iteration 2346 — correct scheduled-review activation chronology

- Clean main at e6cde7d5; no inherited work. Owner-visible correction: the Nov 15 review incorrectly described public mode as still off, which could mislead scheduled launch acceptance. Preserved the historical capture state and documented subsequent activation.
- Alerts zero, health/database/Redis healthy; all 38 sources pass. Scheduled-reader gate returns expected pending (exit 2) before Nov 15 15:00 UTC; latest remains Nov 14. All 32 deployed-loopback account-boundary checks pass.
- Due passive metrics sample at 05:22:36–05:23:06: 24 healthy rules, four uncached queries ≤0.949 s, no merges or new evaluator errors/misses/admission hits/timeouts/slow queries. Both process starts unchanged; warning journal empty since 03:53:55. Next sample ≥06:24 UTC; comparable merge acceptance remains open.
- Examined Tech excerpt collection against the existing depth decision: empty HN evidence is already explained by metadata-only collection. No new admission variant, linked-page crawl, source or paid replay is justified before natural scheduled evidence.
- Verification: `pnpm obs alerts`, `pnpm obs sources --check`, `/healthz`, `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z`, `pnpm exec tsx scripts/check-live-account-boundary.ts`, metrics sampler and warning journal; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,040 unit/329 integration passes, four expected skips), diff checks. Logs `/tmp/2346-*`.
- Archived older progress and completed task markers to keep orientation files bounded; history retained with links.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private. Next: scheduled publication/reader gate and natural editorial recovery review; avoid more browser-smoke restoration or repeated Tech admission studies.

## 2026-11-15: iteration 2348 — correct Nov 14 recovery handoff

- Clean main at 819957c3; no inherited work. Saved review still instructed all-topic recovery before item 58 closure/public activation, contradicting STEERING 62 and deployed state.
- Updated that actionable paragraph to record closure/activation and separate next scheduled publication/access acceptance from Gaming/World/U.S. editorial recovery; historical diagnosis retained.
- Initial alerts zero; health/database/Redis pass and all 38 sources healthy. No paid calls, generation, settings or sharing changes.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,040 unit/329 integration passes, four expected skips); `pnpm exec tsx scripts/check-handbook.ts --owner-services` passes (18 pages, 22 diagrams, 39 tables). Logs `/tmp/2348-{format,lint,check,handbook,sources}.log`.
- Runtime/config unchanged; no restart under STEERING 22. Next: Nov 15 15:00 UTC scheduled publication/access acceptance and separate editorial review; VM stays private.

## 2026-11-15: iteration 2349 — restore stored Bluesky coverage reporting

- Clean main at 9e53e81f; no inherited work. Initial orientation was overbroad; subsequent reads narrowed. Alerts zero.
- Found a real public-mode tooling failure while taking the next source-quality task: coverage report required private `profileId`, omitted by the public topics response. Switched to the existing public `topicSettingsSchema`; no application-policy change.
- Read-only production report now succeeds for all five topics. Tech/NBA/Gaming/World/U.S. distinct stored posts: 52/48/51/46/49; safe engaged candidates capped at 50: 50/43/49/16/48. U.S. Congress collection is returning data; lexical zero is not semantic rejection. Updated SOURCES.
- Verification: `pnpm exec tsx scripts/report-bluesky-coverage.ts --examples 1` with private environment loaded; receipt `/tmp/2349-bluesky.json`. No provider calls or writes. `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,040 unit/329 integration passes, four expected skips); diff checks pass. Logs `/tmp/2349-{format,lint,check}.log`.
- Runtime/config unchanged; no restart under STEERING 22. No generation, budget, query or sharing changes. Next: natural scheduled publication/access acceptance and editorial recovery review at 15:00 UTC; public mode ON, VM private.

## 2026-11-15: iteration 2350 — restore public-mode World rotation rehearsal

- Clean main at 5e7c0e9d; no inherited work. Alerts zero, health/database/Redis healthy and all 38 sources returning data.
- Reproduced a concrete discovery-tool breakage: the offline World rotation rehearsal fails against current public-mode topic metadata because the private topic schema requires `profileId`.
- Changed the rehearsal to the existing public topic-settings contract and documented that contract. No collector, source-query, pilot-flag or admission changes.
- Verification: rehearsal fails before the fix and passes after it: 24 simulated hours, 120 fake searches, 12/6/6 World query allocation, six collector, eight rollover/retry and nine scheduler checks; other-topic queries unchanged; zero live searches/writes. Receipts `/tmp/2350-rotation{,-before}.log`.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` and diff checks pass; logs `/tmp/2350-{format,lint,check}.log`.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private; World pilot remains off. Next: scheduled publication/access acceptance and separate natural editorial recovery review at 15:00 UTC.

## 2026-11-15: iteration 2351 — restore live Bluesky probe in public mode

- Clean main at 11e263db; no inherited work. Alerts zero, health/database/Redis healthy, all 38 sources returning data.
- Reproduced probe failure before searches; read-only contract check isolates missing private profile IDs for all five topics. Switched probe to public topic-settings schema.
- Explicit free `pnpm exec tsx scripts/probe-bluesky.ts --world` succeeded after fix: common 24-hour window, baseline/Ukraine/Gaza/geopolitics fetched 45/49/49/47, engaged 19/49/49/35; eight search-page requests, no observation writes or paid calls. Receipts `/tmp/2351-{probe-before,contract}.log`, `/tmp/2351-world.jsonl`.
- Strongest examples mix reporting/commentary and U.S. overlap; zero legacy phrase shortlists do not establish semantic rejection. Updated SOURCES; no production-query or pilot changes.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,040 unit/329 integration passes, four expected skips); diff checks pass. Logs `/tmp/2351-{format,lint,check}.log`.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private. Next: 15:00 UTC publication/access acceptance and separate natural editorial recovery review.

## 2026-11-15: iteration 2352 — restore reviewed X account settings verification

- Clean main at e7f8ad2f; no inherited work. Alerts zero; health/database/Redis pass; all 38 enabled sources returning data with no source errors.
- Reproduced read-only X account smoke failure on missing private profile IDs; switched both snapshots to the public topic-settings contract. No production policy or settings changes.
- `pnpm exec tsx scripts/smoke-reviewed-x-accounts.ts` passes: all four documented lists match live settings in desktop/mobile local browser replays, zero writes/errors/overflow. Refreshed eight screenshots; inspected mobile output. Access is replayed, not signed-out public acceptance.
- Due passive metrics probe: 24 healthy rules, two small merges/17,411 rows below comparable threshold, no new evaluator errors/missed evaluations/admission hits/timeouts/slow queries; warnings journal empty. Next sample ≥07:25 UTC; recovery stays open.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,040 unit/329 integration passes, four expected skips); `git diff --check` passes. Receipts `/tmp/2352-{x-before,x,format,lint,check}.log` and `/tmp/2352-metrics.jsonl`.
- Runtime/config unchanged; no restart under STEERING 22. No paid calls, generation, query, budget or sharing changes. Scratch cleanup already applied today (2339). Next: 15:00 UTC scheduled publication/access acceptance and separate editorial recovery review.
