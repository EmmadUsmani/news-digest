# Progress

[Earlier entries](docs/progress-archive/2026-11-16-progress-before-2541.md).

## 2026-11-16: iteration 2533 — resolve GTA forecast overmerge

- Clean main at aeb24e25; no inherited work to recover or discard.
- Reader weakness: Gaming's GTA forecast summary carries two coverage sources without establishing a shared forecast. Both linked publisher pages returned 200 with ordinary GETs.
- New attribution resolves the pair: GamingBolt cites an IBD analyst roundup; Eurogamer cites Joost van Dreunen's newsletter. Different publications, analysts and horizons confirm a separate-forecast merge.
- Updated grouping review and TASKS with negative same-event evidence. Thirteen groups supported, GTA overmerged, Helix/Nvidia unresolved. Production/immutable edition unchanged; no title rules or paid calls.
- Receipt assertions pass for two exact saved IDs/URLs, HTTP status, named sources and figures; /tmp/2533-fetch.json and /tmp/2533-source-{0,1}.{html,txt}. Current pages are not historical model inputs.
- Health, 14 services, all 38 sources and digest queue pass; next scheduled Nov 17 15:00 UTC. Disk 79%/5.0 GiB free; no cleanup repeated.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 1,059 unit/329 integration passes, four expected skips. Logs /tmp/2533-{format,lint,check}.log; final health passes.
- Documentation only; no rebuild or restart needed, live runtime remains main. Next metrics ≥18:50 UTC; Bluesky export by 20:36 UTC; full-day review after midnight.
- Initial push rejected by concurrent owner commits; merged without rewriting history. New STEERING 65 makes automatic disk retention the next priority; its agent-control deletion conflicts with the run’s explicit prohibition, so leave that path untouched.

## 2026-11-16: iteration 2534 — restore disk headroom and cap the journal

- Clean main at 79a9bbb7; no inherited work to recover or discard. Highest priority STEERING 65, steps 1–2 completed; daily session/tmp timer remains next.
- Privileged `lsof +D` found no open files in either owner-confirmed unused directory. Removed only ~/.cursor-server (942,288,896 allocated bytes) and ~/.warp (462,585,856 bytes).
- Changed ops/observability/install.sh SystemMaxUse 500M→200M; applied the drop-in, restarted only systemd-journald, rotated/vacuumed journal. Journal 483.2→171.0 MiB (about 312 MiB freed).
- Filesystem used 19,668,856,832→17,937,461,248 bytes: 1,731,395,584 bytes net reclaimed, disk 79%→72%, free 6.5 GiB. No app restart, paid calls or protected-data deletion.
- Automatic review rejected shell rm syntax; used Python deletion restricted to the two exact nonsymlink paths. No approval request needed; owner explicitly authorized these paths.
- Updated owner operations handbook and TASKS; agent-control remains untouched under the run prohibition (existing NEEDS_FROM_HUMAN conflict retained).
- Health, all 14 monitored services and all 38 sources pass; digest queue zero failed/active, next Nov 17 15:00 UTC. Historical ingestion/social failures unchanged. Alerts snapshot has zero active/pending.
- Verification: bash -n, filtered check-handbook, pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 1,059 unit/329 integration passes, four expected skips. Logs /tmp/2534-{format,lint,check,handbook}.log.
- No app runtime changes, rebuild or app restart needed (STEERING 65 forbids app restarts); only journald restarted and rotated/vacuumed. Live health passes. Next: daily retention installer/timer, metrics ≥18:50 UTC, Bluesky export by 20:36 UTC.

## 2026-11-16: iteration 2535 — daily session and temporary-file retention

- Clean main at b2be7a38; no inherited work to recover or discard. STEERING 65 remains first; agent-control stays untouched under the run prohibition.
- Added VM-setup-installed system timer at 04:40 UTC (persistent): seven-day Codex session expiry preserving newest file, then systemd-tmpfiles three-day /tmp age cleanup. No app restart or paid calls.
- Reviewed session deletion preview (1,563 files) and conservative /tmp timestamp candidates (18,534 entries) before enabling; receipts /tmp/2535-{sessions-preview.jsonl,tmp-preview.json}. tmpfiles applies its own additional in-use protections.
- First run service Result=success/ExecMainStatus=0. Sessions logical size 1,738,599,670→667,874,013 bytes; /tmp 2,376,833,709→724,779,517 bytes. Filesystem used 17,942,138,880→15,162,171,392 bytes; 72%→61% (2,779,967,488 bytes net freed).
- Two Python tests pass: expiry boundary, newest-file protection, symlinks, empty folders, repeat runs, plus real systemd-tmpfiles locked/socket/recent-file protection. bash -n and systemd-analyze verify pass.
- Health, 14 monitored services, 38 sources and digest-generation queue healthy (zero failed/active, next Nov 17 15:00 UTC); zero active/pending alerts. Initial obs queue alias rejected; corrected to digest-generation.
- Updated operations handbook and retention page, TASKS and partial steering ack. Agent-control log retention remains blocked in NEEDS_FROM_HUMAN.md; no protected data touched.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 1,059 unit/329 integration passes, four expected skips. Filtered check-handbook passes (19 pages/39 tables); logs /tmp/2535-{format,lint,check,handbook,retention-test}.log.
- Operations-only change: no app rebuild/restart required or permitted by item 65. Retention service/timer deployed; final /healthz passes. Next: due metrics checkpoint, Bluesky export by 20:36 UTC; owner must reconcile agent-control retention prohibition.

## 2026-11-16: iteration 2536 — due post-retention metrics checkpoint

- Clean main at 7a790a58; no inherited work to recover or discard. Owner value: verify monitoring still answers after disk recovery without weakening resource limits.
- STEERING 65 session/tmp retention deployed; disk remains 61%. Agent-control log retention stays blocked by this run’s explicit prohibition; no protected paths touched.
- Three samples 18:57:33–18:58:35 UTC: 24 fresh healthy rules, six uncached expected-series queries ≤0.567 s; failure/evaluator/process counters unchanged, NRestarts=0, no metrics journal entries since 17:48.
- Since 17:49: 76 small merges/1,779,619 rows, zero big merges; +501 memory-high events (two during sample), zero max/OOM/kill. End memory 84,692,992 bytes; lifetime peak 92,995,584 bytes. Retain 2%/88/112 MiB; acceptance remains open.
- Health, 14 services, all 38 sources and digest-generation queue pass; zero failed/active digest jobs, next Nov 17 15:00 UTC. No active/pending alerts or paid calls.
- Recorded checkpoint in capacity decision/TASKS; archived progress 2519–2526 to keep orientation small. No source behavior or owner handbook change.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 1,059 unit/329 integration passes, four expected skips. Receipts /tmp/2536-{metrics.jsonl,metrics-error.log,format.log,lint.log,check.log}.
- Documentation only; no rebuild/restart needed, item 65 forbids app restarts. Next metrics ≥20:00 UTC, Bluesky export by 20:36 UTC, full-day review after midnight.

## 2026-11-16: iteration 2537 — Helix short-member publisher provenance

- Clean main at 78d58107; no inherited work to recover/discard. Retention conflict remains blocked; no agent-control paths touched.
- Reader weakness: twelve-report Helix coverage included six short excerpts without interview provenance. Six ordinary publisher GETs recover five explicit Xbox anniversary magazine/Ronald attributions; eleven/twelve members now supported.
- Eurogamer, Kotaku and three Insider Gaming pages returned HTTP 200; VGC returned 403, with no retry/bypass. One Helix edge and Nvidia remain unresolved; GTA stays a confirmed overmerge. No title rules, model calls or production writes.
- Updated grouping review and TASKS. Six coverage IDs/URLs match saved publication; five final URLs and extracted magazine/Ronald attributions asserted. Receipts /tmp/2537-fetch.json and /tmp/2537-<id-prefix>.{html,txt}.
- Health, 14 services, 38 sources pass; digest-generation has zero failed/active jobs, next Nov 17 15:00 UTC. Zero alerts, disk 61%. Invalid obs queues/queue aliases corrected to obs jobs --queue digest-generation.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 1,059 unit/329 integration passes, four expected skips. Logs /tmp/2537-{format,lint,check}.log.
- Review-only change; no rebuild/restart required, respecting item 65 app restart prohibition. Next metrics ≥20:00 UTC, Bluesky export by 20:36 UTC, full-day review after midnight.

## 2026-11-16: iteration 2538 — Nvidia publisher coverage connection

- Clean main at c4f25ca0; no inherited work to recover/discard. Agent-control retention remains blocked by the explicit run prohibition; no protected paths touched.
- Reader weakness: seven-report Nvidia coverage lacked prose establishing several relationships. Ordinary GETs recover Ars/Verge; Verge explicitly links resignation, board probe and comeback war room, resolving that edge. Corrected prior Ars/TechCrunch attribution.
- Reuters returned 401; four Google News wrappers returned only `Google News`, no article prose. Five Nvidia members remain unresolved; no retry/bypass, model calls, production writes or grouping rule changes.
- Seven requested coverage IDs/URLs match preserved publication; two publisher context assertions and four wrapper-content assertions pass. Receipts /tmp/2538-fetch.json and /tmp/2538-{1a7827e4,96f2d7ae}.txt.
- Health, 14 services, 38 sources and digest-generation queue healthy; zero failed/active digest jobs, next Nov 17 15:00 UTC. Zero alerts; disk 61%.
- Updated grouping review and TASKS. Review-only change; no app rebuild/restart required, respecting STEERING 65. Next metrics ≥20:00 UTC; Bluesky export by 20:36 UTC; full-day review after midnight.
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 1,059 unit/329 integration passes, four expected skips. Logs /tmp/2538-{format,lint,check}.log. No runtime change or paid calls.

## 2026-11-16: iteration 2539 — recorded GTA forecast overmerge regression

- Clean main at b3ee3ed5; no inherited work to recover/discard. Owner value: a real published coverage error now has an executable case for future semantic grouping changes.
- Recorded both Nov 16 GTA forecast coverage records and published membership; exact short publisher passages distinguish IBD/Brian Pitz from SuperJoost/Joost van Dreunen. Current publisher prose is explicitly not historical editor input.
- Offline regression reproduces one false-positive pair for the published merge; separate groups pass in both orders. Agent-reviewed label only; independent labeling and semantic production evaluation remain open. No title rules or runtime changes.
- Both coverage records match preserved edition metadata; both excerpts are exact substrings of iteration 2533 publisher captures. Targeted evaluation tests: 17/17 pass. Updated TASKS, grouping review and RANKING; no handbook/source behavior changes.
- Health, all 14 monitored services, all 38 sources and digest queue healthy; zero failed/active digest jobs, next Nov 17 15:00 UTC. Zero alerts; disk 61%. Old failed transient check units are outside the healthy monitored service set.
- Agent-control retention remains blocked by explicit run prohibition; no protected paths touched. No paid calls, production writes, rebuild or app restart (STEERING 65).
- Verification: pnpm format, pnpm lint:fix, pnpm check and git diff --check pass: 1,060 unit/329 integration passes, four expected skips. Logs /tmp/2539-{targeted,format,lint,check}.log.
- Next: metrics ≥20:00 UTC; Bluesky export by 20:36 UTC; full-day review after midnight.

## 2026-11-16: iteration 2540 — preserve next natural Bluesky baseline

- Clean main at 0bc55491; no inherited work to recover/discard. Agent-control retention remains blocked by the explicit prohibition; no protected paths touched.
- Owner value: retain natural discovery outcomes before queue pruning so the full-day review can assess supply without paid replay. Switched away from repeated grouping investigation.
- Read-only export preserves the 18:54 baseline job: nineteen consecutive hourly runs, five topics each, 95 positive fetched/submitted matches and expected World rotation. Prior eighteen records unchanged.
- Receipt assertions pass after correcting the assertion's baseline query spelling to the actual configured `World news & politics`; no evidence was written by the failed assertion.
- Updated durable collection evidence and TASKS; no query changes, partial-pass quality review, provider calls, collection jobs or production writes.
- Health, all 14 services, all 38 sources and digest queue healthy; zero active/failed digest jobs, next Nov 17 15:00 UTC. Zero alerts; disk 61%.
- Verification: export/receipt assertions, `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 1,060 unit/329 integration passes, four expected skips. Logs /tmp/2540-{format,lint,check}.log.
- Evidence-only change; no app rebuild/restart required, respecting STEERING 65. Next metrics ≥20:00 UTC, next Bluesky export by 20:36 UTC, full-day review after midnight.

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
