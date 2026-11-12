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

## 2026-11-12: iteration 1870 — exclude Grafana from public tool forwarding

- Clean main/no inherited work; health/services green and zero alerts. Completed item 58.7 after reading the private review; public mode remains off.
- Public-mode tool selection omits Grafana independently of route authorization; private selection retains it. Corrected Grafana/jobs access in the public-access plan and observability handbook.
- Added direct proxy regression: GET/HEAD/POST on bare, slash, query and nested Grafana paths return 404 without redirects or upstream requests. Targeted internal-tools tests pass (6/6); no accepted-screen reruns.
- pnpm format, pnpm lint:fix and full pnpm check pass: 870 unit/286 integration tests, four expected skips. pnpm build, filtered check-handbook (one unchanged diagram/39 tables) and git diff --check pass; existing build warnings only.
- Rebuilt API/worker/docs restarted outside the hold; health/database/Redis green, all 32 deployed account-boundary checks pass, 38/38 sources healthy, zero alerts. Digest queue available with zero failed jobs; next run Nov 12 15:00 UTC. Latest saved edition eb6e962e remains available with four topics.
- No migrations, provider calls, source/budget/access-flag changes. Next: item 58.8 public-mode topic editing/browser reports, then leftover services and listed live checks. Nov 12 first five-topic scheduled acceptance remains due.
- Commit/push and final main-matching service restart follow; public activation still waits on remaining fixes, scheduled publication, lead re-check and owner decision.

## 2026-11-12: iteration 1871 — restore public-mode topic editor routing

- Clean main/no inherited work; health green, zero alerts. Continued item 58.8; public mode remains off.
- Moved atomic topic toggles to dedicated PUT /api/admin/topics/:id/enabled. Full edits, deletion and topic source changes now enter general admin admission/controllers. Writer admission binds the dedicated target; updated access plan.
- Router regressions cover admin-admission refusal without controller work; compiled full-app regression edits/restores a real fixture description with a fresh admin, checks readback and refuses anonymous edits. Atomic toggle/storage/disconnect regressions retain their coverage.
- pnpm format, pnpm lint:fix, build, filtered check-handbook and git diff --check pass. Full pnpm check passed static checks and 870 unit tests; integration caught an old toggle URL in the full-app test. Updated that rehearsal and added the editor regression; fresh integration result below.
- Initial live checks: 38/38 sources healthy, all queues available with workers, zero failed digest jobs; next edition Nov 12 15:00 UTC. No provider calls, migrations, source/budget/access-flag changes or accepted-screen reruns.
- Next: item 58.8 browser error reporting, then leftover test services and listed read-only checks; scheduled five-topic acceptance remains due. Publication, lead re-check and owner decision still gate public activation.
- Fresh pnpm test:integration passes: 286 tests, four expected skips, zero failures. Rebuilt API/worker/docs restarted outside hold; immediate probe raced startup, retry health/database/Redis green. All 32 deployed account-boundary checks pass, 38 healthy sources, zero alerts and zero failed digest jobs. Commit/push and final main-matching restart follow.
- Initial push rejected because upstream lead documentation advanced main (8ee1cb68); fetched and merged without rewriting history or editing owner files. Merge changes only lead status docs; verified app build remains unchanged. Retrying push after recording this result.

## 2026-11-12: iteration 1872 — restore public browser error reporting

- Clean main/no inherited work; initial health green and zero alerts. Completed item 58.8 browser reporting; public mode remains off.
- Admitted only POST on the reviewed technical-report endpoint. Existing strict fields reject private text/URLs/stacks; the receiver retains its global 20/minute log cap and visitor API admission still applies. Updated access plan.
- Route regressions refuse other methods and ambiguous/nested paths. Full configured application checks anonymous acceptance, private-field rejection, cap exhaustion and other-method refusals against disposable storage. No accepted-screen reruns.
- pnpm format, pnpm lint:fix, static checks and 871 unit tests pass; pnpm build, filtered check-handbook (39 tables, no diagrams changed) and git diff --check pass. Fresh pnpm test:integration passes: 286 tests, four expected skips, zero failures. Deployment below.
- Integration exposed two fixture issues: missing same-origin Origin (403), then extra requests consuming the existing visitor exhaustion allowance (429). Matched browser Origin and isolated report checks on a separate fixture visitor; fresh integration result below.
- Live predeploy: 38/38 sources healthy, zero failed digest-generation jobs, next edition Nov 12 15:00 UTC. No provider calls, migrations, source/budget/access-flag changes. Archived iterations 1858–1862 to keep this file small.
- Next: item 58.9 leftover test services, then listed read-only checks/minor items; Nov 12 five-topic scheduled acceptance remains due. Publication, lead re-check and owner decision still gate public activation.
- Rebuilt API/worker/docs restarted outside the hold; health/database/Redis green, all 32 deployed account-boundary checks pass, 38 healthy sources, zero alerts and zero failed digest jobs. Commit/push and final main-matching restart follow.

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
