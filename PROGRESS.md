# Progress

Older entries: [through iteration 2288](docs/progress-archive/2026-11-14-through-2288.md), [2289–2294](docs/progress-archive/2026-11-14-2289-through-2294.md), [2295–2298](docs/progress-archive/2026-11-14-2295-through-2298.md).

Archived continuation: [2299–2304](docs/progress-archive/2026-11-14-2299-through-2304.md).

Archived continuation: [2305–2314](docs/progress-archive/2026-11-14-2305-through-2314.md).

Archived continuation: [2315–2324](docs/progress-archive/2026-11-15-2315-through-2324.md).

## 2026-11-15: iteration 2325 — saved X fallback evidence

- Clean main; no inherited work. Alerts zero, health passes and all 38 sources healthy. Scheduled acceptance and metrics probe not due; public mode off/VM private.
- Reader concern: selected X posts must stay readable when third-party media is unavailable. The owner would notice missing text or broken recovery beside already-thin topic sections.
- `pnpm exec tsx scripts/smoke-reader-x-media.ts` passes desktop/mobile/320px light/dark: saved text, all selected failure states, original links, retry/keyboard recovery and theme persistence. Recovery uses a local widget stub, not live X.
- Recorded evidence in Tech social review and refreshed four desktop/mobile fallback screenshots; inspected mobile light. Discarded all other incidental screenshot refreshes. No observed app defect or code change.
- `pnpm exec tsx scripts/smoke-reader-coverage-count.ts` also passes all four views; discarded its screenshot refreshes. No external requests, provider calls, production writes or configuration changes; handbook/SOURCES unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit. Private receipts `/tmp/2325-*.log`.

## 2026-11-15: iteration 2326 — restore saved edition selection verification

- Clean main; no inherited work. Initial alerts zero, health passes, all 38 sources healthy. Scheduled acceptance and metrics probe not due; public mode off/VM private.
- Actual failure: `pnpm exec tsx scripts/smoke-edition-selection.ts` expects a desktop date without the visible weekday, then compares Bluesky rendered text against raw text despite saved display text. Updated assertions to match the current reader contract, preserving exact date/accessibility and content/destination checks; added post URL to mismatch diagnostics.
- Selection and `pnpm exec tsx scripts/smoke-edition-history.ts` pass 16 combined desktop/mobile light/dark delayed-success/error scenarios: late responses preserve the chosen saved edition, without writes or browser errors. External browser traffic blocked. Refreshed eight screenshots; inspected both mobile light views.
- No app behavior, source, schema, runtime settings or editorial changes; handbook/SOURCES unchanged. No provider calls or production writes. Receipts `/tmp/2326-*.log`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit. Next: due passive metrics sample, then scheduled Nov 15 review.

## 2026-11-15: iteration 2327 — due passive metrics recovery sample

- Clean main; no inherited work. Alerts zero, health passes, all 38 sources and 14 monitored services healthy; recent collection jobs completed. Historical failed transient check units are not monitored app services.
- Due read-only sample at 01:31:24–01:31:55 UTC: 24 fresh healthy rules; uncached queries ≤0.456 s; no new evaluator errors, missed iterations, admission hits, timeouts or slow queries. Neither tier merged; process starts unchanged.
- Warning-level system metrics/alerts journal since 00:25:32 UTC has no entries. Comparable natural merge still required; retain CPU-only 2% trial, no retuning/forced merge/restart. Next probe no earlier than 02:32 UTC. Raw receipt `/tmp/2327-metrics.jsonl`.
- Updated recovery evidence and open task. Public mode remains off/VM private; scheduled Nov 15 acceptance still pending. No provider/source requests, production writes, UI/schema/system-flow changes; handbook/SOURCES/screenshots unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit.

## 2026-11-15: iteration 2328 — saved-reader reporting provenance

- Clean main; no inherited work. Alerts zero, health passes and all 38 sources healthy. Scheduled acceptance and metrics sample not due; public mode remains off/VM private.
- Reader weakness under review: thin Tech reporting makes discovery-site versus publisher attribution material, including after bookmarking. No new editorial change is justified before the next natural edition.
- `pnpm exec tsx scripts/smoke-reader-saved-source.ts` passes desktop/mobile light/dark: real Nov 14 discovery and grouped primary-report provenance survives saved-item reload, with exact destinations; explicit synthetic publisher override and legacy fallback also pass. All external browser requests blocked. Refreshed four screenshots; inspected mobile light. No observed app defect.
- `pnpm exec tsx scripts/smoke-reader-story-text.ts` passes all four views for the older saved regression edition: exact story text, five NBA summaries, no writes/errors or saved-data changes. Discarded its incidental screenshot refreshes; this is not Nov 15 acceptance.
- No provider calls, production writes, configuration/schema/source changes; handbook/SOURCES unchanged. Receipts `/tmp/2328-reader.log` and `/tmp/2328-story.log`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit. Next: metrics no earlier than 02:32 UTC, then Nov 15 scheduled recovery acceptance.
- Initial push rejected after concurrent lead commit `50c0295b` (owner notes only); merged without editing owner files or rewriting history. API/worker restarted; `/healthz` confirms database/Redis healthy. Retrying push.

## 2026-11-15: iteration 2329 — protected editorial handoff design

- Clean main; no inherited work. Alerts zero, health passes, 38 sources healthy. Metrics sample not due until 02:32 UTC; scheduled recovery pending, public mode off/VM private.
- Owner benefit: earlier U.S. editing must not steal NBA repair capacity; five-topic latency remains over target. Chose the explicitly deferred handoff design after NBA scheduled acceptance instead of repeating accepted reader checks.
- Added proposed decision 0005: owned topic/model/attempt envelopes, atomic transfer into real ledger holds, bounded initial/repair estimates, fallback separation, cache/uncertainty accounting, fenced recovery and drain-before-rollback. No production implementation or speedup claimed.
- Read existing production ledger/admission and topic scheduling; static subtraction and a story/social barrier alone cannot solve editor-versus-editor contention. Next: owned-balance simulator counterexample and saved-request bound feasibility before any migration/runtime change.
- No provider/source requests, production writes, runtime/schema/UI changes; handbook/SOURCES/screenshots unchanged. Existing seven staged scheduler tests pass; receipts `/tmp/2329-*.log`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. Seven staged tests, saved-timeline reproduction and local decision links pass. API/worker restart and health verification follow commit.
- Initial push rejected by concurrent owner/lead commits; merged without conflicts or owner-file edits. New STEERING 60 authorizes the two inventoried artifacts: privileged `fuser` checks across 50 paths found no open references. Removed `/tmp/obs355` (254,668,800 allocated bytes) and `/tmp/news-digest-vmutils.tgz` (144,220,160); disk 78%→77%. Marked owner request resolved and acked item 60; no other cleanup.
- API/worker restart and `/healthz` passed. Incoming commits only change steering/lead notes; no application rebuild needed after merge. Final doc formatting and diff checks pass; retrying push.

## 2026-11-15: iteration 2330 — item 58 acceptance

- Clean main at 576fd167; no inherited work. Alerts zero, database/Redis healthy, 38 sources healthy; next scheduled digest Nov 15 15:00 UTC with no failed digest jobs.
- New owner STEERING 62 supersedes the all-topic AI gate. Acked item 58 against Nov 14 edition b9d55088-892a-4e34-b77c-a398d64c6a9f and owner proxy/TLS result; security fix commits and evidence retained in handoff. No lead/security rehearsal rerun.
- Next: fresh private backup/baseline, activate server/web public mode while sharing stays private, verify deployed admission, then wait for next scheduled publication. No new spend or sharing changes.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), public `VITE_PUBLIC_MODE=1 pnpm build` and `git diff --check` pass; existing bundle warning only. Activation follows this separate item 58 acknowledgement commit.

## 2026-11-15: iteration 2330 — public mode enabled, VM private

- Enabled server/web public mode under STEERING 62 after separate item 58 ack 69699604. No sharing, budget or provider changes; next scheduled acceptance remains Nov 15 15:00 UTC. Updated readiness/plan/handbook to publishing/reader/refusal gate; AI quality stays breakage work.
- Fresh private backup: 39 tables/19,637,477 bytes; mode-600 env rollback copy and reader baseline retained outside repo. Full paths and deployment evidence in docs/public-activation-record.md. API/worker restarted with shared env; database/Redis healthy.
- Deployed boundary: 32 checks pass; explicit activation probe: 26 checks pass for signed-out reader/assets, private-route and legacy-header refusals, fresh-admin read and disposable reader isolation. Reader deleted/admin logged out; no owner settings changed.
- Desktop/mobile Playwright show saved real Nov 14 edition without page errors (external embeds blocked); screenshots refreshed and mobile inspected. Latest/direct/history agree: five topics/14 stories/19 posts. This is activation baseline, not next scheduled acceptance.
- Public DNS/TLS curl returns 307 to exe.dev login with HSTS, confirming private sharing. In-VM DNS points hostname locally; public address supplied only for TLS probe. Application checks use explicit loopback visitor headers.
- Fixed local scheduled-reader and operations probes for configured public admission. Public source error flags and queue counts/next runs preserve health exit codes; state filtering refuses unavailable private detail. Regression tests cover credential isolation and malformed private snapshots.
- Temporary probe's unsupported GET sync corrected to POST; cleanup succeeded. Initial ack push rejected by concurrent owner notes; merged cb50449b without owner-file edits or history rewrite. Public reader remained healthy; no rollback required.
- Sources: all 38 healthy, no source errors. Digest queue: one worker/no failures, next run 15:00 UTC; alerts zero. No source/schema/editorial changes or new live generation. Next: scheduled publishing gate, then item 50 ack and stop before sharing.
- Verification: targeted 22 CLI/credential tests and final `pnpm check` pass (1,027 unit/329 integration passes, four expected skips); `VITE_PUBLIC_MODE=1 pnpm build`, `pnpm format`, `pnpm lint:fix` and diff checks pass. Initial new-test lint/handbook length findings corrected. Handbook check with `NODE_OPTIONS=--import=/tmp/2330-owner-handbook.mjs` validates owner pages, diagrams and all 39 schema tables. Archived 2315–2324 and trimmed done markers; no diagram changes. Final service restart/health/reader checks follow commit.

## 2026-11-15: iteration 2331 — owner handbook verification in public mode

- Clean main; no inherited work. `pnpm obs alerts` zero; `pnpm obs health --check` healthy; all 38 sources healthy. Digest queue has no failures and next scheduled publication remains Nov 15 15:00 UTC.
- Completed open public-mode local tooling task: `check-handbook.ts --owner-services` reads existing loopback owner handbook/catalog services directly; browser requests remain intercepted, no credentials forwarded and app admission unchanged. Removed need for the temporary fetch shim.
- Updated owner handbook usage and TASKS.md. No source, schema, editorial, budget or sharing changes; natural World/U.S./Gaming recovery and scheduled public publishing acceptance remain pending. No provider calls or generation triggered.
- Verification: `pnpm exec tsx scripts/check-handbook.ts --owner-services` passes: 18 owner pages, 22 diagrams, 39 tables; no diagram changes. Signed-out latest/history return 200 and saved Nov 14 edition b9d55088 has five topics.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,027 unit/329 integration passes, four expected skips). `VITE_PUBLIC_MODE=1 pnpm build` and diff checks pass (existing bundle warning only). API/worker restarted; health, signed-out latest/history, zero-alert and digest-queue checks pass. Logs `/tmp/2331-*.log`.

## 2026-11-15: iteration 2332 — due metrics recovery evidence

- Clean main at 10a33eba; no inherited work. Alerts zero, database/Redis healthy, all 38 sources healthy. Digest queue has one worker/no failures; next scheduled publication remains Nov 15 15:00 UTC. Signed-out scheduled-reader check correctly reports pending against saved Nov 14 edition.
- Due read-only `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`: 24 fresh healthy rules, four uncached queries ≤1.408 s, one 1,890-row small merge/no big merge; unchanged process starts. One admission-limit hit, no new evaluator errors/misses, queue timeouts or slow queries. Comparable natural merge remains unproven; unchanged CPU-only 2% trial, next probe ≥03:43 UTC.
- Metrics journal since 01:31 UTC has one API scrape refusal at 02:05:06; current health/probes pass. Updated capacity evidence and TASKS.md; no runtime/source/schema/UI or sharing changes, provider calls or generation. Raw receipt `/tmp/2332-metrics.jsonl`.
- Corrected unsupported `obs queues`/`--queue digest` invocations to `pnpm obs jobs --check`; queue name is `digest-generation`. Historical ingestion/social failed counts remain visible; current sources and alerts healthy.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,027 unit/329 integration passes, four expected skips), `VITE_PUBLIC_MODE=1 pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart, health and signed-out saved-reader checks follow commit. Logs `/tmp/2332-*.log`.

## 2026-11-15: iteration 2333 — offline owned editorial capacity

- Clean main at 486609b4; no inherited work. Alerts zero, health/database/Redis healthy, source check passes; digest queue has one worker/no failures, next edition 15:00 UTC. Metrics probe not due until ≥03:43 UTC; no repeated probe or paid generation.
- Owner value: prevent a faster scheduler from consuming NBA repair capacity or silently losing another topic under unchanged caps. Added isolated integer-unit ownership model, with no runtime wiring, provider calls, budget or sharing changes.
- Seven fixture tests cover the 11-unit counterexample, initial refusal, validation/cache release, repair growth, atomic transfer, duplicate settlement and fenced recovery retaining uncertain calls. Existing whole-topic simulation admits U.S. later where early owned admission refuses it: protection alone does not establish a safe rollout or speedup.
- Updated decision 0005 and TASKS.md. Next: integrate owned balances into the four-slot event/draining simulation and measure actual saved-request bounds; production stays unchanged. Natural Gaming/World/U.S. recovery and public-mode scheduled publication gate remain pending.
- Verification: 14 targeted experiment tests pass; `pnpm format`, `pnpm lint:fix`, public `VITE_PUBLIC_MODE=1 pnpm build` and diff checks pass (existing bundle warning only). `pnpm check` passes: 1,034 unit and 329 integration tests, four expected skips. Logs `/tmp/2333-*.log`.
- No service restart: no running code/config changed, following STEERING 22; current runtime remains the deployed main implementation.

## 2026-11-15: iteration 2334 — four-slot owned scheduling and draining

- Clean main at e359743e; no inherited work. `pnpm obs alerts` zero, `pnpm obs health --check` healthy, source check passes; digest queue has one worker/no failures and next edition 15:00 UTC. No repeated metrics probe or generation.
- Extended the isolated event simulator with optional owner envelopes, atomic call transfers and explicit validation release. No runtime imports, provider calls, budget or sharing changes.
- Cap-11 synthetic comparison: owned scheduling protects NBA repair at 30 ms but refuses U.S.; whole-topic ordering admits both at 60 ms. Reject the shorter incomplete result as a speedup. Peak owned exposure 11.
- Four-active-call failure cancels queued editor/repair, drains through 30 ms, charges 5 units once and releases balances; peak exposure 17/20. Successful validation frees repair balance before dependent admission; invalid ownership/bounds fail closed.
- Updated decision 0005 and TASKS.md. Next: saved-request bounds and bounded waiting feasibility. Natural scheduled recovery/public publishing acceptance still pending; no restart needed under STEERING 22 because no running code/config changed.
- Verification: 18 targeted experiment tests pass; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,038 unit/329 integration passes, four expected skips), `VITE_PUBLIC_MODE=1 pnpm build` and `git diff --check` pass. Existing bundle warning only. Logs `/tmp/2334-*.log`.
- Initial push rejected because remote main gained owner lead notes (eb0b7ee9). Merged those notes without editing owner files or rewriting history; no runtime changes or additional test scope.

## 2026-11-15: iteration 2335 — bounded offline editorial waiting

- Clean main at dbae7d77; no inherited work. Alerts zero, health/database/Redis healthy, all 38 sources healthy; digest worker has no failures and next edition is 15:00 UTC. Metrics sample not due before 03:43 UTC; no repeat probe or generation.
- Added optional bounded admission waiting to the isolated owned scheduler. Waiting holds no capacity or inference slot; retries at settlements, permits exact-deadline admission, refuses idle impossible capacity and cancels on failure.
- Cap-11 synthetic scenario: U.S. waits 10–30 ms while NBA repairs, both finish by 60 ms with peak exposure 11/spend 4, matching whole-topic ordering. A 19 ms wait refuses U.S. at 29 ms. This recovers synthetic admission, not a measured speedup.
- Updated decision 0005 and TASKS.md. Next: saved-request bounds and useful actual wait limits. No runtime imports/config, provider calls, budgets, sources, schema, UI or sharing changes; scheduled recovery/publication acceptance remains pending.
- Verification: 20 targeted experiment tests pass. `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,040 unit/329 integration passes, four expected skips), `VITE_PUBLIC_MODE=1 pnpm build` and `git diff --check` pass; existing build warnings only. Logs `/tmp/2335-*.log`. No restart under STEERING 22: running code/config unchanged.

## 2026-11-15: iteration 2336 — measured saved NBA envelope admission

- Clean main at 0c5f4182; no inherited work. Alerts zero, health/database/Redis healthy, 38 sources healthy; digest queue has one worker/no failures, next edition 15:00 UTC. Metrics probe not due before 03:43 UTC; no repeated probe or generation.
- Owner value: reject a faster-scheduler design that can lose an NBA editor under unchanged caps, using saved request estimates rather than more synthetic variants.
- Added `pnpm exec tsx scripts/measure-editor-envelope.ts`: nine self-checking synthetic failures exercise production repair construction/estimation against the committed Nov 12 NBA request and historical model prices. No provider adapter, secrets, database or production ledger writes.
- Initial reservation 76,118 µ$; repair 76,303–77,585 µ$; combined maximum 153,703 µ$. Supplied idle capacity 153,702 admits sequential calls with synthetic zero usage, but refuses the envelope immediately despite 60 s waiting. This is a counterexample, not historical admission or actual latency evidence.
- Decision 0005/TASKS reject unconditional owned-envelope rollout. No useful actual wait limit established; stop synthetic scheduler expansion and return to reader/source work while natural Gaming/ownership recovery and public publication gates await the next edition.
- Verification: nine offline probes/capacity assertions pass; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,040 unit/329 integration passes, four expected skips), `VITE_PUBLIC_MODE=1 pnpm build` and diff checks pass. Initial check stopped on progress-entry formatting; corrected before successful rerun. Existing bundle warning only; logs `/tmp/2336-*.log`, receipt `/tmp/2336-envelope.json`.
- No runtime/config, source, schema, UI, budget or sharing changes; no restart under STEERING 22. Running implementation remains deployed main.

## 2026-11-15: iteration 2337 — public-mode saved-reader link checks

- Clean main at 933e8d2f; no inherited work. Alerts zero, health/database/Redis healthy, all 38 sources collecting. Natural scheduled acceptance remains pending.
- Owner value: source and original-post checks must work against the deployed public reader so broken reading destinations can be detected before sharing.
- Found loopback GETs without an extracted visitor return HTTP 429 in public mode. Repaired `smoke-reader-source-targets.ts` and `check-saved-bluesky-destinations.ts` with explicit documentation-range local visitors, matching existing boundary probes.
- Headers are added only after loopback-origin and GET/HEAD checks; external traffic and writes remain blocked. No admission bypass, account credentials, runtime/config or source change.
- Published Nov 14 edition b9d55088: source/coverage links pass 44px target, keyboard focus and overflow checks at 1440/390/320 in light/dark. All five real saved Bluesky posts pass exact text/original URLs and link destinations at desktop/mobile in both themes; no page errors.
- Refreshed six source screenshots and captured twenty saved-post screenshots; inspected mobile source focus and World destination rendering. These are saved published content, not fixtures or Nov 15 acceptance.
- Verification: both Playwright commands, `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,040 unit/329 integration passes, four expected skips), `VITE_PUBLIC_MODE=1 pnpm build` and diff checks pass. Existing bundle warning only. Logs `/tmp/2337-{sources,bluesky,format,lint,check,build}.log`.
- No restart under STEERING 22: only check scripts, screenshots and task/progress records changed. Next: scheduled recovery/public-reader gate; retain current queries, budgets and private VM sharing.

## 2026-11-15: iteration 2338 — settled live X rendering and media failure

- Clean main at 7140efd8; no inherited work. Alerts zero. Scheduled publication/recovery gate remains pending at 15:00 UTC; sharing stays private.
- Repaired `verify-saved-posts.ts` for public-mode local visitor admission, restricted to loopback reads. External requests receive no added headers; Reddit and app writes remain blocked.
- Found its embed report raced widget loading because saved text exists immediately. It now waits for a visible official iframe or explicit media failure; failure requires visible saved text, retry and the exact original-post destination.
- Added explicit `--block-external` mode, labeled in output and kept separate from live screenshots. Initial blocked run exposed an old Bluesky image-count assumption; failed images are legitimately removed, so the controlled failure check now allows that recovery.
- Nov 14 b9d55088: all 14 X picks embed on desktop/mobile, zero official widget/app errors or overflow; all 19 saved post texts, times and original links agree. Controlled external blocking passes fallback checks for all 14 X picks at both widths. No fixture or replacement widget responses.
- Captured ten real live-embed screenshots; inspected NBA desktop and Tech mobile. No inference, discovery, collection, generation, source/config, schema, budget or sharing changes.
- Due passive metrics sample: 24 healthy rules, queries ≤0.368 s, no new errors/admission hits/timeouts/slow queries or merges. Recovery stays open; next probe ≥04:54 UTC. Metrics/alerts warning journal empty.
- Verification: both browser modes pass; public build passes (existing bundle warning). `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,040 unit/329 integration passes, four expected skips) and diff checks pass. Early non-TTY verification processes exited 143; rerun completed successfully. Logs `/tmp/2338-{posts,fallback,metrics,format,lint,check,build}.*`.
- No restart under STEERING 22: running app/config unchanged. Next: Nov 15 scheduled recovery and signed-out publication/refusal acceptance.

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
