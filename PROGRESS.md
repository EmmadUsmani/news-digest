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

## 2026-11-11: iteration 1863 — protect admin freshness

- Clean main/no inherited work; initial health and alerts green. Completed item 58.3 in owner order.
- Sign-in links now create reader-only sessions even for admin recipients; only verified mailbox-code exchange grants a new seven-day admin window. Updated owner access documentation.
- Composed regression proves link-created sessions cannot issue more links or retain admin rights beyond the original window; mailbox-code authentication still grants fresh admin rights.
- pnpm format, pnpm lint:fix, pnpm check (864 unit/286 integration pass, four expected skips), pnpm build and git diff --check pass; existing build warnings only.
- Filtered check-handbook passes (one unchanged diagram/39 tables); shortened the affected page to retain its 100-line limit.
- Live read-only checks: 32 account-boundary refusals pass, all 38 sources have successful collections/no current errors, saved edition eb6e962e unchanged with four topics.
- No migration, provider calls, public-mode/sharing/budget/source changes or accepted-screen reruns. Commit/push and main-matching API/worker restart outside deployment hold follow; final health/alerts checked after restart.
- Next: item 58.4 audit retention. Nov 12 first five-topic scheduled acceptance remains due; item 50 still awaits remaining fixes, scheduled publication, lead re-check and owner decision.

## 2026-11-11: iteration 1864 — preserve administrative history

- Clean main/no inherited work; initial health and alerts green. Completed item 58.4 in owner order.
- Account deletion now retains private admin audit and write-admission rows, including historical actor IDs and recipient emails; sessions, proofs and personal settings still disappear. Updated handbook, plan and implicit schema relations.
- Migration 0022 replaces cascading audit foreign keys with insertion/actor-change checks that lock the current identity; missing actors still refuse and transactional mutations still roll back.
- Initial integration run exposed reliance on foreign-key actor validation (nine failures); added equivalent trigger checks and updated the old cascading-deletion expectation. Final pnpm check: 864 unit/286 integration pass, four expected skips; schema parity/offline migration checks pass.
- pnpm format, pnpm lint:fix, pnpm build and git diff --check pass; existing build warnings only. Filtered check-handbook passes (three unchanged diagrams/39 tables); one transient render failure passed on retry.
- Private backup news-digest-20261111T230721Z completed (39 tables); stopped API/worker, applied 0022 outside deployment hold, restarted. Audit/admission counts preserved (1/0), both identity-validation triggers installed.
- Live: health/database/Redis green, 32 account-boundary refusals pass, 38/38 sources healthy, saved edition eb6e962e unchanged with four topics, zero alerts. No provider calls or public-mode/sharing/budget/source changes.
- Commit/push and final main-matching restart follow. Next: item 58.5 account-body admission; Nov 12 five-topic scheduled acceptance remains due.

## 2026-11-11: iteration 1865 — authenticate large reader uploads

- Clean main/no inherited work; initial health and alerts green. Completed item 58.5 in owner order.
- Reader sync authenticates before consuming its up-to-16-MiB stream and again after upload; expired/revoked sessions cannot merge changes. Successful requests preserve cookie renewal.
- Added unfinished declared/chunked upload refusals for absent, malformed and unknown session cookies, mid-upload revocation refusal and valid reader/renewal coverage; existing authenticated size/UTF-8 checks retained.
- Targeted account HTTP tests pass (9/9); pnpm format, pnpm lint:fix, pnpm check (865 unit/286 integration pass, four expected skips), pnpm build and git diff --check pass; existing build warnings only.
- Read-only predeploy checks: 38/38 sources healthy/nonempty; recent collection jobs complete; saved edition eb6e962e unchanged with four topics. No provider calls, migration, public-mode/sharing/budget/source changes or accepted-screen reruns.
- Next: item 58.6 smaller sign-in issues in private review; Nov 12 first five-topic scheduled acceptance remains due. Item 50 awaits remaining fixes, scheduled publication, lead re-check and owner decision.
- API/worker restarted outside deployment hold; health/database/Redis green. node /tmp/nd-1865-live.cjs: six unfinished declared/chunked uploads refuse before body data; pnpm exec tsx scripts/check-live-account-boundary.ts: 32 refusals pass. Zero alerts; saved edition unchanged.
- Commit/push and final main-matching service restart follow.

## 2026-11-11: iteration 1866 — group IPv6 admission by subnet

- Clean main/no inherited work; health/services green and zero initial alerts. Continued item 58.6 with the IPv6 limit fix.
- Observed IPv6 visitors share a /64 for API admission and sign-in challenges; trusted immediate proxy peers still require exact addresses. IPv4/mapped-IPv4 equivalence retained. Updated the runtime handbook.
- Proxy tests cover rotating/compressed/full IPv6 forms, separate subnets and refusal of an unconfigured peer in the trusted peer's subnet. Real Redis regression verifies only ten of twenty rotating-address attempts pass across two adapter instances.
- Targeted proxy tests pass (5/5); pnpm format, pnpm lint:fix and pnpm build pass (existing build warnings). Handbook initially exceeded its length limit; shortened affected text, filtered check-handbook now passes (one unchanged diagram/39 tables).
- Predeploy live checks: 32 account-boundary refusals pass, all 38 sources healthy, collection runs completing, latest saved edition eb6e962e unchanged with four topics. No migrations, paid calls, access-flag, sharing, budget or source changes.
- Next: remaining item 58.6 timing, long-term guess allowance and admission-before-lock fixes; Nov 12 five-topic scheduled acceptance remains due. Item 50 still awaits remaining fixes, scheduled publication, lead re-check and owner decision.
- Full pnpm check passes: 866 unit/286 integration tests, four expected skips; git diff --check passes. API/worker restarted outside the deployment hold; post-restart health and 32 account-boundary refusals pass, zero alerts. Commit/push and final main-matching restart follow.

## 2026-11-11: iteration 1867 — admit sign-in attempts before locking

- Clean main/no inherited work; initial health/services green and zero alerts. Continued item 58.6 with admission before recipient coordination.
- Throttled code redemption now refuses before acquiring a recipient lock or database connection; admitted attempts retain coordination through eligibility, proof consumption, identity creation and session issuance. Admission runs once per attempt.
- Added refusal/order regressions using real application services; malformed recipients and failed locks do not consume proofs. Existing isolated Postgres exchange regression retains concurrent single-winner and replay coverage.
- Targeted login-code/exchange tests pass (12/12). No migrations, provider calls, source/budget/access-flag changes or accepted-screen reruns.
- Predeploy: 38/38 sources healthy, digest queue available with no failed jobs, next scheduled run Nov 12 15:00 UTC; saved edition eb6e962e unchanged with four topics. All 32 deployed account-boundary refusals pass.
- Next: item 58.6 timing and daily guess cap; Nov 12 first five-topic scheduled acceptance remains due. Public mode remains off pending remaining fixes, scheduled publication, lead re-check and owner decision.
- pnpm format and pnpm lint:fix run; initial full check caught a require-await callback lint error, corrected. Final pnpm check passes: 867 unit/286 integration, four expected skips; pnpm build and git diff --check pass (existing build warnings only).
- API/worker restarted outside the deployment hold; health/database/Redis green, all 32 account-boundary refusals pass and zero alerts. Commit/push and final main-matching restart follow. No owner-handbook behavior changed.

## 2026-11-12: iteration 1868 — retain a daily sign-in allowance

- Clean main/no inherited work; initial health/services green and zero alerts. Continued item 58.6 with longer-lived code admission.
- Code requests and redemption share an atomic 100-attempt, 24-hour Redis allowance per recipient/client. Short-window resets and challenge replacement cannot reset it; client isolation preserves the sign-in lockout fix. Updated runtime handbook and public-access plan.
- Real Redis regression spans eleven short windows/two adapter instances, recipient normalization, client isolation, daily expiry and independent short-window refusal. No migrations, paid calls, source/budget/access-flag changes or accepted-screen reruns.
- pnpm check passed typecheck/lint/format/boundaries and 867 unit tests; integration found one test assertion incorrectly expecting daily expiry to bypass the short limit. Corrected the assertion to verify both windows independently; fresh pnpm test:integration rerun passes: 286 tests, four expected skips, zero failures.
- pnpm format, pnpm lint:fix, pnpm build, filtered check-handbook and git diff --check pass. Archived progress iterations 1850–1857 to keep orientation small.
- Live: all 38 sources healthy; digest queue available/no failed jobs, latest edition eb6e962e unchanged, next scheduled run Nov 12 15:00 UTC. API/worker restarted outside hold; health/database/Redis green, 32 deployed account-boundary refusals pass, zero alerts.
- Next: item 58.6 timing, then tool admission/public-mode defects and remaining owner-ordered findings. Nov 12 first five-topic scheduled acceptance remains due; public mode off pending fixes, publication, lead re-check and owner decision.
- Commit/push and final main-matching API/worker restart follow.

## 2026-11-12: iteration 1869 — equalize ordinary sign-in response timing

- Clean main/no inherited work; initial health/services green, zero alerts. Continued item 58.6 with sign-in response timing.
- Valid HTTP code requests start a common one-second response floor before recipient lookup, coordination and delivery. Unknown, malformed-email and throttled recipients wait too; dependency failures cannot skip the floor. Delivery remains awaited; slow dependencies can exceed the floor, so this is not a constant-time guarantee under overload.
- Real login-code service regressions cover eligible/unknown/throttled/malformed paths, delivery failure and slow completion; HTTP handler verifies the production timer is wired. Targeted tests pass (15/15). Updated runtime handbook and access plan.
- Predeploy: 38/38 sources healthy; digest queue available, zero failed jobs, Nov 11 edition eb6e962e published normally; next run Nov 12 15:00 UTC. No paid calls, migrations, access-flag, budget or source changes.
- Next: item 58.7 tool admission, then public-mode defects/leftover services/live checks. Nov 12 five-topic scheduled acceptance remains due; public mode off pending remaining fixes, publication, lead re-check and owner decision.
- pnpm format, pnpm lint:fix and full pnpm check pass: 869 unit/286 integration tests, four expected skips. pnpm build, filtered check-handbook (one unchanged diagram/39 tables) and git diff --check pass; existing build warnings only.
- API/worker restarted outside deployment hold; health/database/Redis green, 32 deployed account-boundary checks pass, zero alerts. A malformed-email live code request returns generic HTTP 202 in 1.004 seconds without recipient admission or mailbox delivery. Commit/push and final main-matching restart follow.

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
