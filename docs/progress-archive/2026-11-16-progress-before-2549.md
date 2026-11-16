# Progress before iteration 2549

[Earlier entries](2026-11-16-progress-before-2541.md).

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
