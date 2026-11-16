# Progress

[Earlier entries](docs/progress-archive/2026-11-16-progress-before-2549.md).

## 2026-11-16: iteration 2541 — compact durable iteration handoffs

- Clean main at e97e69bd; no inherited work to recover/discard. No protected paths touched; agent-control retention remains blocked by the explicit run prohibition.
- TASKS had reached 20,944 bytes and PROGRESS 25,923 bytes. Archived older progress and complete prior open-task/completion detail; condensed active summaries while preserving task order, evidence links, gates and next deadlines.
- TASKS now about 8 KB; PROGRESS about 14 KB. Full-text preservation assertions pass for both archives, all 24 open tasks remain, and local file links resolve. No product/runtime behavior changed.
- Health, all 14 services, all 38 sources and digest queue healthy; zero alerts, disk 61%. Reader-content and scheduled-edition gates remain unchanged.
- Verification: preservation/link assertions, pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 1,060 unit/329 integration passes, four expected skips. Logs /tmp/2541-{format,lint,check}.log.
- Documentation-only change; no rebuild or app restart, respecting STEERING 65. No paid calls or production writes.
- Next: metrics ≥20:00 UTC; Bluesky export by 20:36 UTC; full-day review after Nov 17 midnight.
- Initial push rejected because origin advanced to owner commit 63c9e48e (lead documentation only); fetched and merged without rewriting history or editing owner files, then retried push.

## 2026-11-16: iteration 2542 — preserve natural collection and triage rate limit

- Clean main at e3b995db; no inherited edits to recover/discard. No protected paths touched; agent-control retention remains blocked.
- Preserved 19:54 natural Gaza job before pruning: twenty consecutive hours, five topics each, 100 fetched/submitted matches and expected rotation; prior nineteen records unchanged. Full-day review remains after midnight; export again by 21:36 UTC.
- Initial alert traced to Google News AI HTTP 429 at 20:04/20:05; last success 19:34/60 items. Existing Retry-After/backoff retained; no extra fetch, bypass or schedule change. Recovery awaits next natural attempt.
- API health/database/Redis and digest queue healthy; next edition Nov 17 15:00 UTC, no failed/active digest jobs. Service snapshot briefly showed agent inactive; direct systemd check and refreshed snapshot confirm all 14 active, Result=success.
- Due metrics checkpoint: 24 healthy rules, six queries ≤1.276 s, no new failure/admission counters, zero OOM/restarts; reclaim persists, no big merge. Limits unchanged; next check ≥21:10 UTC. Disk 60%.
- Public HTTPS probe could not connect from this session (DNS 10.42.0.42:443); local reader HTTP 200 and /healthz OK. External access could not be reverified; no proxy/sharing changes.
- Read-only evidence changes; no app rebuild/restart under STEERING 65, no paid calls or production writes.
- Verification: hourly receipt assertions, metrics sampler, pnpm format, pnpm lint:fix, pnpm check and git diff --check; PASS: 1,060 unit / 329 integration passes, four expected skips. Logs /tmp/2542-{format,lint,check}.log.
- Initial push rejected: origin advanced to owner commit 05beb1da; fetched and merged without editing owner files or rewriting history. Lead resolved agent-control retention through supervisor-owned pruning; next 04:40 timer receipt remains. TASKS updated; protected paths untouched.

## 2026-11-16: iteration 2543 — accept natural Google News AI recovery

- Clean main at af646c3e; no inherited edits to recover/discard. Protected paths untouched.
- Owner value: confirm the AI feed is supplying real articles again after rate limiting, without extra requests or weakening backoff.
- Read-only Postgres source record and retained BullMQ scheduled-job result agree: 20:07:10 UTC success/60 items, cleared error; prior success 19:34. Closed source-recovery task and recorded receipt in docs/SOURCES.md.
- Public source snapshot uses an opaque feed ID (not the feed name); matching that ID confirms recovery. All 38 sources and 14 services healthy; zero alerts, /healthz OK, local reader HTTP 200, disk 60%. Digest queue has zero active/failed jobs, next edition Nov 17 15:00 UTC.
- One initial diagnostic SQL used nonexistent content_items.source_id; read failed without writes. Recovery verification uses source metadata and completed-job receipt instead.
- Verification: pnpm obs alerts/sources/services/health, pnpm obs jobs, read-only Postgres/Redis receipt checks; pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 1,060 unit/329 integration passes, four expected integration skips. Logs /tmp/2543-{format,lint,check}.log.
- Evidence-only change; no rebuild/restart under STEERING 22/65. Public HTTPS remains unverified from this session; no proxy/sharing changes.
- Next: Bluesky export by 21:36 UTC, metrics ≥21:10, retention timer 04:40 UTC; full-day Bluesky review after midnight.

## 2026-11-16: iteration 2544 — preserve same-interview grouping while rejecting overmerge

- Clean main at 73fa5da3; no inherited work to recover/discard. Protected paths untouched.
- Owner value: the offline grouping case now requires retaining useful Helix coverage across different interview angles while rejecting unrelated GTA forecasts.
- Added exact stored GamingBolt preservation/GameSpot console excerpts and immutable metadata to the Nov 16 Gaming fixture; all six pairs across four articles labeled. Agent review only; independent labels and semantic evaluation remain open.
- Published membership: one correct merge/one false merge. Splitting everything misses Helix; separating GTA/retaining Helix passes all 24 permutations with no unknown merged pairs or order sensitivity.
- Verification: 17 targeted tests; pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 1,060 unit/329 integration passes, four expected skips. Immutable coverage metadata matches for all four candidates. Logs /tmp/2544-{targeted,format,lint,check}.log.
- Initial health/database/Redis and digest queue healthy; zero active alerts, no failed/active digest jobs; next edition Nov 17 15:00 UTC.
- Offline fixture/test change only; no production code/config changes, source requests, paid calls, rebuild or service restart under STEERING 22/65.
- Next: metrics ≥21:10 UTC; Bluesky export by 21:36 UTC; retention receipt 04:40 UTC; full-day review after midnight.

## 2026-11-16: iteration 2545 — preserve prepared editor inputs for the next Tech review

- Clean main at 5d25883b; no inherited edits to recover/discard. Protected paths untouched.
- Owner value: future thin-summary reviews can establish which reporting actually reached editor preparation, including unselected reports, without historical reconstruction.
- Added bounded candidatePrompt to private immutable editorial snapshots, captured from the editor's existing prompt after its size guard. Captures include cache reuse and budget refusal; they establish preparation, not provider admission. Public reader contracts omit the field; old snapshots remain readable.
- Existing model inputs/fingerprints, selection rules, budgets and provider traffic unchanged. No paid calls or new digest generation. Next natural capture awaits Nov 17's edition; historical Tech investigation remains closed.
- Verification: targeted editor/publication/public-filter tests 59 pass; pnpm format, pnpm lint:fix, pnpm check (including API rebuild), handbook check and git diff --check pass. Final suite: 1,061 unit/329 integration passes, four expected skips. Logs /tmp/2545-{targeted,final-format,final-lint,final-check,handbook}.log.
- Initial direct publication tests hit the isolation guard before DB access; reran with mocked storage and unreachable connection settings. First full check exposed two golden snapshots missing the new field; updated their shared synthetic fixture and reran the full check successfully.
- Restarted API/worker at 21:07 UTC; both active, /healthz database/Redis OK. Published reader response exactly matches the pre-deploy five-topic/25-story snapshot; no private prompt field. Digest queue zero active/failed, next edition Nov 17 15:00 UTC.
- Preserved natural 20:54 Bluesky result in /tmp/2545-bluesky-collections.json: 21 consecutive hourly runs, five topics each, fetched/submitted matches and expected World rotation; shared prior receipts unchanged. Full-day review remains after midnight, export again by 22:36 UTC.
- Handbook pipeline updated; no UI changes, source requests or sharing changes. Next: metrics ≥21:10 UTC, retention timer receipt 04:40 UTC, next natural Tech inputs.

## 2026-11-16: iteration 2546 — due metrics recovery checkpoint

- Clean main at 9881245a; no inherited work to recover/discard. Protected paths untouched.
- Read-only 21:10:05–21:11:06 UTC checkpoint: three samples, 24 fresh healthy rules, six uncached probes ≤0.364 s; baseline comparison assertions pass.
- Since 20:08:32: +383 memory-high events (nine during sampling), 58 small merges/1,748,918 rows; no big merge. Process starts, admission/timeout/slow-query and evaluator failures unchanged; max/OOM/kill zero, NRestarts=0; ending memory 89,546,752 bytes.
- Journal has one worker scrape refusal at 21:07:55 during iteration 2545 deployment; worker now healthy. Retain CPU 2%/88 MiB high/112 MiB max; reclaim and absent big-merge evidence keep acceptance open. Decision record and task checkpoint updated.
- All 14 services/38 sources healthy, zero alerts, /healthz OK; disk 60%, digest queue zero active/failed jobs, next edition Nov 17 15:00 UTC. Local SPA HTTP 200. Headerless local reader API HTTP 429 is expected fail-closed proxy visitor extraction; public HTTPS unavailable from session (HTTP 000), so no new public-reader acceptance claimed.
- Evidence/docs only; running main code unchanged, no rebuild/restart under STEERING 22/65. No source requests, paid calls, new digests or sharing changes.
- Receipts /tmp/2546-{metrics.jsonl,metrics-error.log,summary.json,metrics-journal.log,sources.json,alerts-final.log,format.log,lint.log,check.log}; pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 1,061 unit/329 integration passes, four expected skips.
- Next: Bluesky export by 22:36 UTC, metrics ≥22:12 UTC, retention timer receipt 04:40 UTC; next natural Tech inputs Nov 17.

## 2026-11-16: iteration 2547 — reachable edition home link

- Clean main at 611fd076; no inherited work to recover/discard. Protected paths untouched.
- Reader weakness: the published edition header home link measured only 28px tall. It now has a 44px minimum target, matching archive/saved navigation, while retaining header reflow. Owner value: easier return to the latest edition on touch screens.
- Real published-content Playwright smoke reproduces the original 106×28px failure, then checks 1440/390/320px, light/dark, 100%/200% text, horizontal reachability and keyboard focus; six header screenshots refreshed. Loopback visitor admission only; external requests blocked.
- Verification: pnpm format, pnpm lint:fix, pnpm check (1,061 unit/329 integration passes, four expected skips), atomic web build and git diff --check pass; receipts /tmp/2547-{format,lint,check,web-build,home-before,home-after}.log.
- Initial health/database/Redis OK, all 14 services/38 sources healthy, zero active alerts; disk 60%. Digest queue zero active/failed, next Nov 17 15:00 UTC. Historical ingestion/social failures retained; current sources healthy. Initial obs status/digest queue aliases rejected; corrected to supported health/jobs commands.
- Atomic web build serves the changed assets immediately; no app process code/config changes or restart under STEERING 22/65. No source requests, paid calls, new editions or sharing changes.
- Next: metrics ≥22:12 UTC; Bluesky export by 22:36 UTC/full-day review after midnight; retention receipt 04:40 UTC; natural Tech inputs Nov 17.

## 2026-11-16: iteration 2548 — contents follows the reader header

- Clean main at caa879b4; no inherited edits to recover/discard. Protected paths untouched.
- Reader weakness: desktop contents used a fixed 6rem top offset while the header already reports its actual height. At 1024px/200% text this left 103px below the 89px header unused. Contents now starts one rem below the measured header; its maximum height uses the same measurement, gaining 71px of navigation space.
- Owner value: more topic/story links fit beside the edition with enlarged text; keyboard focus still reveals the final archive link inside the scrollable panel.
- Playwright on real published content passes 1024/1440/390px, both themes, 100%/200% text: measured desktop offset, viewport bounds, final-link keyboard visibility, mobile contents and zero browser errors. Two enlarged-text screenshots saved. GET-only loopback reader admission; external requests blocked.
- Initial browser harness incorrectly assumed the mobile chips were a named nav, then guessed the topic name as Tech; corrected to the actual fixed topic-link container. Final 12 configurations pass; /tmp/2548-contents-final.log. Original fixed-offset assertion reproduced before deployment.
- Verification: pnpm format, pnpm lint:fix, atomic web build and git diff --check pass. pnpm check passed static checks and 1,061 unit tests, then exited 143 as integration began; separate pnpm test:integration passes 329 tests with four expected skips. Receipts /tmp/2548-{format,lint,web-build,check,integration}.log.
- Initial /healthz database/Redis OK; all 14 services/38 sources healthy, zero alerts, disk 60%; digest-generation queue check passes. Initial shorthand digest queue rejected; corrected to supported name.
- Atomic web deployment serves the changed assets; no app process changes or restart under STEERING 22/65. No source requests, paid calls, new editions or sharing changes.
- Next: metrics ≥22:12 UTC; Bluesky export by 22:36 UTC/full-day review after midnight; retention receipt 04:40 UTC; natural Tech inputs Nov 17.

## 2026-11-16: iteration 2549 — keep keyboard focus below the reader header

- Clean main at 7270d25b; no inherited edits to recover/discard. Protected paths untouched.
- Reader weakness: backward keyboard navigation left 19 story/post links and Save controls behind the sticky mobile header in a 60-step browser reproduction.
- Replaced heading-only scroll margins with reader-scoped viewport scroll padding. The measured header height now lives on the document root, is inherited by contents/chips, and is restored on reader unmount. Owner value: keyboard readers can see focused controls while navigating the edition.
- Real published-content Playwright checks pass mobile/desktop, both themes and 100%/200% text: 464 backward and 344 forward focus targets, anchor spacing, no horizontal overflow/browser errors and SPA route cleanup. Links taller than available space remain scrollable; browser assertions account for their height. Two screenshots saved.
- Contents/header measurement regression: all twelve existing configurations pass. GET-only loopback reader admission; external requests blocked. Receipts /tmp/2549-{keyboard,keyboard-forward,contents}.log; initial forward assertion was corrected for links taller than the padded viewport.
- Verification: pnpm format, pnpm lint:fix, atomic web build, final pnpm check and git diff --check pass: 1,061 unit/329 integration passes, four expected skips. First check caught the new archive before formatting finished; corrected and reran successfully. Receipts /tmp/2549-{format,lint,check-final,web-build}.log.
- Initial health/database/Redis, all 14 services/38 sources and digest-generation queue healthy; zero alerts, disk 60%, next edition Nov 17 15:00 UTC. Final health/alerts receipts retained. No source requests, paid calls, new editions or sharing changes.
- Atomic web deployment serves the changed assets; no app process/config changes or restart under STEERING 22/65. Archived older progress entries after the file crossed 25 KB; history remains linked.
- Next: metrics ≥22:12 UTC; Bluesky export by 22:36 UTC/full-day review after midnight; retention receipt 04:40 UTC; natural Tech inputs Nov 17.

## 2026-11-16: iteration 2550 — retain natural Ukraine collection evidence

- Clean main at b7f0d237; no inherited edits to recover/discard. Protected paths untouched.
- Preserved real 21:54 UTC Bluesky result before shared queue retention prunes it; owner value: the full-day source review retains actual collection evidence rather than inferred queries. No new collection or paid calls.
- Read-only `pnpm exec tsx scripts/report-bluesky-collections.ts` exported retained Redis results; merged with /tmp/2545-bluesky-collections.json into /tmp/2550-bluesky-collections.json.
- Python assertions pass: 22 consecutive Nov 16 hours, 110 five-topic fetched/submitted matches within bounds and expected World rotation; all 27 overlapping receipts unchanged. Latest AI/NBA/game/Ukraine/Congress counts 50/46/50/48/50.
- Initial pnpm obs alerts/health/services --check/sources --check/jobs --queue digest-generation --check pass: zero alerts, database/Redis healthy, 14 services/38 sources healthy, no active/failed digest jobs; next edition Nov 17 15:00 UTC. Unsupported obs --help rejected, then used documented commands.
- Verification: pnpm format, pnpm lint:fix, full pnpm check and git diff --check pass (1,061 unit/329 integration passes, four expected skips); receipts /tmp/2550-{format,lint,check}.log. Final /healthz healthy; disk 60%. Documentation/evidence only; no app assets or process/config changes, so no deployment/restart under STEERING 22/65.
- Next: metrics ≥22:12 UTC; Bluesky export by 23:36 UTC/full-day quality review after midnight; retention receipt 04:40 UTC; natural Tech inputs Nov 17.

## 2026-11-16: iteration 2551 — due late-evening metrics recovery evidence

- Clean main at d42f7321; no inherited edits to recover/discard. Protected paths untouched.
- Due read-only 22:12:13–22:13:13 UTC checkpoint: three samples, 24 fresh healthy rules, six uncached probes ≤0.526 s. Baseline assertions pass against final 2546 sample.
- Since 21:11:06: +467 memory-high events (six during sampling), 60 small merges/4,679,652 rows; no big merge. Failure/admission/timeout/slow-query/process-start counters unchanged; zero new OOM/max/kill, NRestarts=0, no journal entries.
- Retain CPU 2%/88 MiB high/112 MiB max. Continued reclaim and missing natural big-merge evidence keep acceptance open; decision record/task checkpoint updated.
- Initial health, 14 services/38 sources and digest-generation queue pass; zero alerts, disk 60%, next edition Nov 17 15:00 UTC. Final /healthz database/Redis healthy and zero alerts.
- pnpm format, pnpm lint:fix, full pnpm check and git diff --check pass: 1,061 unit/329 integration passes, four expected skips.
- Verification receipts: /tmp/2551-{format.log,lint.log,check.log,metrics.jsonl,metrics-error.log,summary.json,metrics-journal.log,alerts-final.log}; baseline assertions: python3 /tmp/2551-summarize.py.
- Evidence/docs only: no application changes, rebuild/deployment/restart under STEERING 22/65; no source requests, paid calls or new editions.
- Next: Bluesky export by 23:36 UTC; full-day review after midnight; metrics ≥23:14 UTC, preferably after natural big merge; retention timer receipt 04:40 UTC; natural Tech inputs Nov 17.

## 2026-11-16: iteration 2552 — align contents with enlarged reader header

- Clean main at 61dc4e93; no inherited edits to recover/discard. Protected paths untouched.
- Reader weakness: at 1024px/300% text the header is 277px tall, but desktop contents tracking used a fixed 180px reading line, leaving the highlighted story behind the visible reading position.
- Contents tracking now includes the existing measured header height plus reading space. Owner value: enlarged-text readers can identify their current story in the contents. No generation, source or budget changes.
- Playwright against real published content passes twelve configurations: 390/1024px, 100/200/300% text, light/dark; desktop contents and mobile sheet identify the scrolled story, no browser errors. GET-only loopback requests; external requests blocked. Screenshot: docs/screenshots/2552-contents-enlarged-desktop.png.
- Initial browser assertion ran before smooth scrolling settled; reduced-motion/instant scrolling corrected the harness. Receipt: /tmp/2552-contents.log.
- Initial health, services, all 38 sources and digest-generation queue healthy; zero alerts, next edition Nov 17 15:00 UTC.
- Verification: pnpm format, pnpm lint:fix, full pnpm check, atomic web build and git diff --check pass: 1,061 unit/329 integration tests, four expected skips. Receipts: /tmp/2552-{format,lint,check,web-build-final,contents-final}.log. Static deployment needs no service restart under STEERING 22/65.
- Next: metrics ≥23:14 UTC; Bluesky export by 23:36/full-day review after midnight; retention timer receipt 04:40 UTC; natural Tech inputs Nov 17.
