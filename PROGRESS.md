# Progress

[Through iteration 1743](docs/progress-archive/2026-11-10-through-1743.md).

[Iterations 1753–1759](docs/progress-archive/2026-11-11-through-1759.md).

[Iterations 1760–1763](docs/progress-archive/2026-11-11-iterations-1760-1763.md).

[Iterations 1764–1769](docs/progress-archive/2026-11-11-through-1769.md).

[Iterations 1770–1775](docs/progress-archive/2026-11-11-iterations-1770-1775.md).

[Iterations 1776–1781](docs/progress-archive/2026-11-11-iterations-1776-1781.md).

[Iterations 1782–1787](docs/progress-archive/2026-11-11-iterations-1782-1787.md).

[Iterations 1788–1793](docs/progress-archive/2026-11-11-iterations-1788-1793.md).

[Iterations 1794–1804](docs/progress-archive/2026-11-11-iterations-1794-1804.md).

[Iterations 1805–1810](docs/progress-archive/2026-11-11-iterations-1805-1810.md).

[Iterations 1811–1814](docs/progress-archive/2026-11-11-iterations-1811-1814.md).

[Iterations 1815–1820](docs/progress-archive/2026-11-11-iterations-1815-1820.md).

[Iterations 1821–1827](docs/progress-archive/2026-11-11-iterations-1821-1827.md).

[Iterations 1828–1833](docs/progress-archive/2026-11-11-iterations-1828-1833.md).

[Iterations 1834–1839](docs/progress-archive/2026-11-11-iterations-1834-1839.md).

[Iterations 1840–1849](docs/progress-archive/2026-11-11-iterations-1840-1849.md).

[Iterations 1850–1857](docs/progress-archive/2026-11-12-iterations-1850-1857.md).

[Iterations 1858–1862](docs/progress-archive/2026-11-12-iterations-1858-1862.md).

[Iterations 1863–1869](docs/progress-archive/2026-11-12-iterations-1863-1869.md).

[Iterations 1870–1872](docs/progress-archive/2026-11-12-iterations-1870-1872.md).

## 2026-11-12: iteration 1873 — stop stale test servers and own smoke children

- Clean main/no inherited work; initial alerts empty and health/services green. Read item 58 private review; public mode remains off.
- Confirmed the three Nov 2 processes belonged to deleted /tmp/nd-test; stopped only those PIDs. Ports 8011/8101/8201 no longer listen; production API/docs/explorer remain healthy.
- Shared smoke-server ownership kills the complete child process group on cleanup, process exit, SIGINT or SIGTERM; account/privacy scripts use it. Account cleanup stops servers before closing the browser. Uncatchable SIGKILL remains outside Node exit hooks.
- New subprocess regressions start a server grandchild and prove its port can be rebound after owner exit/SIGINT/SIGTERM: targeted test 3/3 pass. No accepted-screen reruns, live provider calls, migrations or access/budget changes.
- Live checks: 38/38 sources healthy, zero failed digest-generation jobs, one worker and next scheduled run Nov 12 15:00 UTC. Verification/deployment results follow.
- Next: item 58.10 read-only checks and minor findings; Nov 12 first five-topic scheduled acceptance remains due. Publication, lead re-check and owner decision still gate public activation.
- pnpm format, pnpm lint:fix, full pnpm check and pnpm build pass: 874 unit/286 integration passes, four expected skips; existing bundle warning only. Final focused eslint --fix and git diff --check pass. No handbook change needed for test-only process ownership.
- Rebuilt API/worker/docs restarted outside the hold; pnpm obs health/services/sources --check pass, 38 healthy sources, zero alerts, zero failed digest jobs. Stale ports still closed. Commit/push and final main-matching restart follow.

## 2026-11-12: iteration 1874 — require explicit explorer credentials

- Clean main/no inherited work; zero alerts, healthy API/database/Redis and 38/38 healthy sources. Continued item 58; public mode remains off.
- Explorer now stops before starting metrics/HTTP or creating a pool when its dedicated database URL is missing/blank. Removed default connection; updated handbook and credential rollback instructions.
- Startup subprocess regressions cover missing, empty and whitespace credentials; explorer suite 8/8 passes. No accepted-screen reruns, provider calls, migrations or budget/access changes.
- Read-only live checks: API trusted proxy peers exactly 127.0.0.1,::1; listener 0.0.0.0:8000; catalog credentials drop-in installed. Three installed tool readers (grafana_product, postgres_metrics, schema_catalog_reader) have zero SELECT/write grants on all 39 public tables; grafana_public_product/grafana_export_reader absent. Default table/sequence ACLs name only owner_ro/owner_rw.
- Documented exe.dev proxy/auth docs read; authenticated share inspection unavailable because SSH host verification refused. No host-key bypass or sharing change. Header stripping/shared proxy target still need authoritative verification; local listener alone does not settle target.
- Next: remaining item 58.10 proxy checks and minor findings, then lead re-check/owner decision; Nov 12 scheduled edition must validate the fixes and fifth topic. Verification/deployment results follow.
- pnpm format, pnpm lint:fix, full pnpm check and pnpm build pass: 874 unit/286 integration passes, four expected skips; explorer suite separately passes 8/8. Filtered handbook check and git diff --check pass; no diagram edits. Existing bundle-size warning only.
- Credential preflight passes. API/worker/docs/schema restarted outside hold; explorer /healthz, API/database/Redis and all 14 services healthy. Digest queue has zero failed jobs, one worker and next run Nov 12 15:00 UTC. Commit/push and final main-matching restart follow.

## 2026-11-12: iteration 1875 — default-deny public document resources

- Clean main/no inherited work; initial alerts empty and API/database/Redis healthy. Continued item 58 minor findings; proxy checks remain unavailable pending authenticated controls.
- Added CSP default-src none and explicit same-origin/inline style allowance, preserving the existing resource-specific policies. Updated access plan and runtime handbook. Public mode remains off.
- HTTP stack regressions 3/3 pass. Offline Chromium manifest probe proves default denial before network access and private rollback; existing font/frame policy probes pass. Synthetic resources only; no accepted-screen reruns or provider calls.
- pnpm obs sources --check passes; digest-generation has zero failures, one worker and next run Nov 12 15:00 UTC. No budgets, migrations or sharing changes. Full verification/deployment results follow.
- Next: remaining minor findings and authoritative proxy checks; Nov 12 scheduled five-topic acceptance remains due, followed by lead re-check/owner decision.
- pnpm format, pnpm lint:fix, full pnpm check and pnpm build pass: 874 unit/286 integration passes, four expected skips. Handbook check (39 tables) and git diff --check pass; no diagrams changed. Existing bundle warnings only.
- Rebuilt API/worker/docs restarted outside hold; first immediate health probe raced startup, subsequent obs health and direct /healthz pass with database/Redis green. All services active, no firing alerts. Commit/push and final main-matching restart follow.

## 2026-11-12: iteration 1876 — isolate metrics service credentials

- Clean main/no inherited work; zero alerts, healthy API/database/Redis, sources healthy. Continued item 58 minor findings; public mode remains off.
- VictoriaMetrics now reads a dedicated mode-600 credentials file containing only its two mutation keys. Installer refreshes it from the canonical private secrets file; handbook documents rotation.
- Credential publisher rejects missing, short, duplicate or unfamiliar quoted values before replacement. Python unittest discovery passes 2/2, including unrelated-secret exclusion and preservation on refusal.
- Installed unit and generated private credentials; restarted only metrics initially. Root read-only /proc verification confirms both required keys present and every other app-env key absent; metrics health OK and service active. Initial non-root inspection was denied; no secret values printed.
- Digest queue has zero failed jobs, one worker and next run Nov 12 15:00 UTC. No provider calls, migrations, sharing or budget changes; no accepted-screen reruns.
- Next: remaining minor findings and authoritative proxy checks; scheduled post-fix five-topic edition acceptance still due. Full verification/deployment results follow.
- pnpm format, pnpm lint:fix, full pnpm check and pnpm build pass: 874 unit/286 integration passes, four expected skips; existing bundle-size warning only. bash -n and systemd-analyze verify pass. Handbook initially exceeded 100 lines; shortened it and filtered check now passes (39 tables); no diagram edits.
- API/worker/docs restarted outside hold; obs health/services --check pass with database/Redis green. Python credential tests still 2/2; git diff --check passes. Commit/push and final main-matching restart follow.

## 2026-11-12: iteration 1877 — enforce signup policy for sign-in links

- Clean main/no inherited work; zero alerts, API/database/Redis healthy and all 38 sources healthy. Continued item 58 minor findings; public mode remains off.
- Link issuance and redemption now honor signup-off inside recipient coordination: new accounts are refused, including previously issued invitations; existing readers can still sign in. Invite mode remains available.
- Added refusal coverage for issuance, redemption without consuming a link or creating identities/sessions, mode changes, existing-reader admission and failed identity lookup; runtime injects the shared signup policy. Updated access plan and runtime handbook.
- Targeted account tests initially pass 19/19; added policy coverage is included in full checks. Filtered handbook check passes (39 tables); no diagram edits. Full verification/deployment results follow.
- Read-only source check passes 38/38; digest queue has zero failed jobs, one worker and next scheduled run Nov 12 15:00 UTC. No provider calls, migrations, sharing or budget changes; no accepted-screen reruns.
- Next: remaining minor findings and authoritative proxy checks, then scheduled post-fix five-topic acceptance and lead re-check/owner decision.
- Full pnpm check passed typecheck/lint/format/boundaries and 876 unit tests; integration initially exposed an old signup-off invitation expectation. Updated the real HTTP fixture to verify both refusals, then restore invite mode for lifecycle checks. pnpm test:integration rerun passes 286 with four expected skips.
- pnpm format and pnpm lint:fix rerun pass; pnpm build, filtered handbook and git diff --check pass. Existing bundle warning only. Rebuilt API/worker/docs restarted outside hold; direct /healthz and obs health/services --check pass (14 services). Commit/push and final main-matching restart follow.

## 2026-11-12: iteration 1878 — cover every tool reader in account privacy revocation

- Clean main/no inherited work; zero alerts, API/database/Redis healthy and all 38 sources healthy. Continued item 58 minor findings; public mode remains off.
- Added forward ACL migration 0023 for all eight account tables, denying PUBLIC and all five tool readers without rewriting applied migration history or changing other product grants.
- Integration regression seeds default and explicit overbroad privileges, applies the migration twice, checks every table/reader refusal and preserves unrelated topic access. Existing fresh-container migration covers absent-role handling.
- Updated access plan and data-model handbook; no schema/table/relationship changes or diagram edits. Filtered handbook check passes (39 tables).
- Fresh snapshot-consistent backup completed: 39 tables, 14,990,940 bytes. Full verification/deployment results follow. No provider calls, budget/sharing changes or accepted-screen reruns.
- Next: authoritative exe.dev proxy checks and remaining minor findings; scheduled post-fix five-topic acceptance at Nov 12 15:00 UTC, then lead re-check/owner decision.
- Live migration applied once after backup. Read-only SQL confirms zero account privileges for all three installed readers and PUBLIC; two prepared roles absent. API/worker/docs restarted; obs health/services --check and direct /healthz pass; zero alerts.
- pnpm format, pnpm lint:fix, pnpm build and git diff --check pass (existing bundle warnings only). Full pnpm check passes typecheck/lint/format/boundaries, 876 unit tests and 286 integration tests (four expected skips), including account privacy refusal.
- Commit/push and final main-matching service restart follow. No source changes; SOURCES.md unchanged.

## 2026-11-12: iteration 1879 — bound VictoriaLogs search work

- Clean main/no inherited work; zero alerts, healthy API/database/Redis, all 14 services and 38 sources healthy. Continued item 58; public mode remains off.
- VictoriaLogs now caps concurrency at two, execution at 5s, queueing at 1s, requested windows at 24h and query text at 4 KiB. Updated runtime handbook and access plan.
- Added explicit disposable installed-binary check reading the production unit: bounded reads pass, 25-hour windows and oversized queries refuse, subsequent reads/health recover. No live data or external calls in this check.
- Installed unit and restarted only logs initially; isolated check passes again. Live 25-hour query refuses with configured range limit; normal `pnpm obs logs --since 1h --limit 1` reads real collected logs.
- Documented authenticated proxy gate in NEEDS_FROM_HUMAN.md: no VM SSH credentials/known-host entry; documented read-only SSH help attempt refused host-key verification. No sharing changes or setup attempted.
- Digest queue: one worker, zero failed jobs, next Nov 12 15:00 UTC. Initial CLI attempts used unsupported --check/options and wrong queue name; corrected status read confirms schedule.
- Build and filtered handbook checks pass; systemd-analyze verify passes. No diagram changes, provider calls, budget changes or accepted-screen reruns; SOURCES.md unchanged. Full verification/deployment results follow.
- Next: remaining minor admission finding, authenticated proxy checks and scheduled post-fix five-topic edition acceptance, then lead re-check/owner decision.
- Full `pnpm check` passes typecheck/lint/format/boundaries, 876 unit tests and 286 integration tests (four expected skips). `pnpm format`, `pnpm lint:fix`, build and diff checks pass; existing bundle warnings only.
- Shortened handbook after its line-limit refusal; filtered check passes (39 tables). Archived iterations 1863–1869 and older completed task markers. Rebuilt API/worker/docs restarted; health and 14-service checks pass. Commit/push and final main-matching restart follow.

## 2026-11-12: iteration 1880 — share visitor admission across tool routes

- Clean main/no inherited work; zero alerts and all 14 services healthy. Continued item 58 minor findings; public mode remains off.
- API and proxied handbook/explorer/logs/metrics namespaces, including tool assets, share the 120/minute visitor allowance before accounts, authorization and proxy work. Health and app static paths retain their bypass.
- Composed HTTP refusal regression covers GET/HEAD/POST, query strings, empty no-store denials, namespace boundaries and a shared API/tool allowance. Targeted admission/access tests pass 9/9.
- Updated access plan and runtime handbook; filtered handbook check passes (39 tables). No diagram edits, provider calls, budget changes, sharing or accepted-screen reruns. SOURCES.md unchanged.
- Read-only status confirms 38 nonempty sources/zero errors; four queues have one worker each, next digest Nov 12 15:00 UTC.
- `pnpm check` passed typecheck/lint/format/boundaries and 877 unit tests; integration exposed authorization fixtures exhausting the newly shared allowance. Separated fixture visitors and supplied browser visitor headers; real Redis exhaustion now also refuses explorer/handbook/metrics.
- `pnpm build`, filtered handbook and diff checks pass (existing bundle warning only). Final `pnpm test:integration` passes 286 with four expected skips; `pnpm format` and `pnpm lint:fix` pass.
- Rebuilt API/worker/docs restarted; initial immediate health probe raced startup, then direct `/healthz` and `pnpm obs health` pass. All 14 services healthy, zero alerts; 38 sources healthy, digest queue zero failed/one worker. Commit/push and final main-matching restart follow.
- Next: authenticated exe.dev header/shared-port checks remain owner-blocked as documented; scheduled post-fix five-topic acceptance at 15:00 UTC, then lead re-check/owner decision.

## 2026-11-12: iteration 1881 — consolidate security fix handoff

- Clean main/no inherited work. Item 58 code fixes are deployed; added a commit-indexed handoff and linked it from readiness/TASKS without declaring acceptance or adding the final steering ack.
- Read the private review; all listed code findings have fixes. Authenticated exe.dev header/shared-target checks remain owner-blocked; Nov 12 15:00 UTC post-fix scheduled publication remains pending. No proxy setup, public activation, paid run or accepted-screen rerun.
- Initial worker scrape alert followed the preceding restart and cleared unaided. Direct `/healthz`, `pnpm obs health`, services/targets/sources checks pass: 14 services, eight targets, 38 sources; zero alerts. Digest-generation has one worker/zero failed jobs and next run 15:00 UTC.
- `pnpm obs --help` and jobs `--check --queue digest` were unsupported; corrected to the documented jobs snapshot and actual digest-generation queue. Historical other-queue failures remain retained; sources are currently healthy.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, filtered handbook check (39 tables, no diagrams) and `git diff --check` pass. Existing build warnings only. Docs service restarted; API health remains green.
- Full `pnpm check` passes typecheck/lint/format/boundaries, 877 unit tests and 286 integration tests (four expected skips). SOURCES.md unchanged because no source behavior changed. Docs-only commit/push and final main-matching docs restart follow.
- Next: authenticated proxy evidence and scheduled five-topic acceptance; then final item 58 ack, lead re-check and owner decision.

## 2026-11-12: iteration 1882 — passive metrics recovery follow-up

- Clean main/no inherited work; zero alerts, API/database/Redis healthy, 38 healthy sources. Digest generation has one worker/zero failed jobs; next scheduled run Nov 12 15:00 UTC. Retained ingestion failures are historical, with sources currently healthy.
- Owner value: confirm the outstanding metrics incident is quiet without changing production limits or risking scheduled content. Item 58 remains blocked on authenticated proxy evidence and scheduled post-fix acceptance; no public activation or final ack.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`: 24 healthy rules, four uncached queries ≤0.429 s, zero new evaluator errors/misses, admission limits/timeouts/slow queries; process starts unchanged. No merges: recovery remains unproven. Next passive probe ≥04:13 UTC Nov 12.
- Read latest saved edition topic by topic. Existing weakness remains thin Tech source evidence and weak social quality; recorded fixes/acceptance await scheduling and item 50. No new unsupported summary or missing context found; Japanese Gaming post has English context in `whyItMatters`. No speculative generation change or paid call.
- Updated TASKS and capacity evidence only; SOURCES unchanged. No UI/diagram edits or accepted-screen rerun.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (877 unit/286 integration passing; four expected skips), `pnpm build`, full handbook check (18 pages/22 diagrams/39 tables) and `git diff --check` pass; existing bundle warnings only. Docs service restarted; all 14 services healthy, API/database/Redis healthy and zero alerts. Commit/push follow.

## 2026-11-12: iteration 1883 — repair filtered queue health command

- Clean main/no inherited work; zero alerts, API/database/Redis and all 38 sources healthy. Item 58 still awaits authenticated proxy evidence and the 15:00 scheduled edition; no acceptance claim or final ack.
- Owner value: unattended checks can now verify the scheduled digest queue using the CLI's documented options, rather than rejecting the command during triage.
- Fixed `pnpm obs jobs --check --queue digest-generation --limit 1`; queue/state/limit options compose with `--check`. Filtered readiness checks the selected queue; unfiltered readiness still requires all four expected queues. Historical failures remain separate from readiness.
- Added refusal coverage for absent/duplicate/unavailable/paused/unstaffed selected queues and invalid queues before network access. Targeted CLI tests pass 18/18; updated affected handbook and observability reference.
- Live filtered and unfiltered checks pass: four staffed queues, digest zero failed jobs/next run Nov 12 15:00 UTC. Latest Nov 11 reader publication passes (four topics/19 stories/19 posts).
- `pnpm format`, `pnpm lint:fix`, build and filtered handbook validation pass (39 tables); existing bundle warning only. Archived three older progress entries to keep this file below 25 KB. No source/UI/diagram behavior changes, paid calls, public activation or budget changes; SOURCES unchanged.
- `pnpm check` passes typecheck/lint/format/boundaries, 878 unit and 286 integration tests (four expected skips). Docs restarted; all 14 services and API health pass with zero alerts. Commit/push and final docs restart follow.
- Next: authenticated proxy evidence, scheduled post-fix five-topic acceptance; next passive metrics sample no earlier than 04:13 UTC.

## 2026-11-12: iteration 1884 — restore fifth-topic Bluesky collection

- Clean main/no inherited work. Zero alerts; API/database/Redis, 14 services and 38 sources healthy. Digest queue has one worker/zero failures; next edition Nov 12 15:00 UTC.
- Preflight found hourly Bluesky still capped at four topics, silently skipping U.S. in fifth position. Raised the bounded pass to five topics/250 submissions; per-topic cap, sequential session/backoff and stop-on-failure unchanged. No budget/provider change.
- Read-only transaction: all five topics have 5/5 budgets and X settings; last-24h source-linked article counts Tech/NBA/Gaming/World/U.S. 254/135/268/220/72. All seven World/U.S. feeds successful without errors; effective AI config $20/month/$0.65/day.
- `pnpm exec tsx scripts/report-bluesky-coverage.ts`: U.S. zero observations before deployment; other topics have recent observations. First five-topic scheduled collection and saved U.S. readback remain pending; no live provider verification call started.
- `pnpm exec tsx --test --test-reporter=dot apps/api/test/bluesky-hourly.test.ts` passes 3/3, covering fifth dedicated query and sixth exclusion alongside disabled/zero-budget filtering, shared window and failure handling.
- Updated SOURCES and affected schedule handbook; no UI/diagram change. Temporary read-only preflight script removed (initial CJS top-level-await invocation failed, wrapped main rerun passed).
- Item 58 still awaits authenticated proxy evidence and scheduled post-fix publication; public mode stays off and no final ack. Next metrics probe no earlier than 04:13 UTC.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (878 unit/286 integration passing, four expected skips), `pnpm build`, filtered handbook check (39 tables) and `git diff --check` pass; existing bundle warning only.
- Worker/docs restarted at 03:43 UTC; compiled collector has five-topic limit. `/healthz`, staffed digest readiness, 14 services and zero alerts pass. Commit/push and final main-matching restart follow.

## 2026-11-12: iteration 1885 — deployed post-fix boundary evidence

- Clean main/no inherited work. API/database/Redis, all 38 sources and staffed digest queue healthy; zero alerts and zero failed digest jobs. Next edition Nov 12 15:00 UTC.
- Owner value: confirm that deployed account protections still refuse unsafe requests while preserving access to the saved reader edition; record the exact remaining acceptance gates.
- `pnpm exec tsx scripts/check-live-account-boundary.ts`: all 32 deployed loopback checks pass; no account credentials requested, identities created or cookies issued. This does not answer authenticated exe.dev proxy checks.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-11T15:00:00Z`: latest/direct/history agree, four topics/19 stories/19 posts. Read all saved summaries/posts: thin Tech evidence and weak World social engagement remain known; no new unsupported summary found. Tuning remains paused under item 50.
- Stored Bluesky readback at 03:45 UTC still predates the collector fix: four topics last observed 02:54, U.S. zero. No provider call or collection was triggered; scheduled five-topic readback remains pending.
- Updated security handoff and TASKS only; no app/UI/source behavior, budget, public-mode or accepted-screen changes. SOURCES and NEEDS_FROM_HUMAN unchanged. Initial unsupported `obs sources --limit 5` invocation corrected to `obs sources`; all 38 healthy.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (878 unit/286 integration passing, four expected skips), `pnpm build`, full handbook check (18 pages/22 diagrams/39 tables), and `git diff --check` pass; existing bundle warning only.
- Docs restart and final health/alerts check follow commit/push. Item 58 stays open: authenticated proxy evidence and scheduled post-fix acceptance; public mode stays off. Next passive metrics probe no earlier than 04:13 UTC.
