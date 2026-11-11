# Phase 4 readiness checklist

Public mode is off; the VM remains private. This checklist does not authorize
activation or exe.dev sharing. The [approved plan](public-access-plan.md#phases)
and STEERING 50 define the phase order and owner gates.

## Entry gates

- [x] Phase 3 accepted by the owner Nov 10; NBA editorial acceptance is tracked
      separately under STEERING 54.
- [x] Natural 24-hour sign-in-link expiry passed Nov 11 (1757):
      `pnpm exec tsx scripts/check-live-link-expiry.ts --live verify` returned
      HTTP 401 with no cookie or reader identity and left the link unconsumed.
- [ ] Confirm healthy services, `/healthz`, sources, alerts and scheduled jobs.
      Observe the noon generation cutoff and 13:00–16:00 UTC deployment hold.

## Prepared checks to retain

| Area                                          | Existing verification                                                                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Real application and storage                  | `apps/api/test/public-application-storage.test.ts`, included in `pnpm check`                                                            |
| Browser policy and private rollback           | `pnpm exec tsx scripts/check-public-policies.ts` (offline)                                                                              |
| Saved X widgets under prepared policy/routing | `pnpm exec tsx scripts/check-public-live-embeds.ts --review-routing --review-scripts` (explicit external browser traffic; no LLM calls) |
| Deployed account refusals                     | `pnpm exec tsx scripts/check-live-account-boundary.ts` (read-only acceptance)                                                           |
| Saved scheduled reader                        | `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-09T15:00:00Z`                                                                  |

Passing these checks alone does not accept Phase 4. Keep their receipts with the
activation review, rather than adding more variants of already-covered refusals.

## Remaining activation work

- [x] Rehearse additive migration 0019 on a fresh private restored copy (1618) with
      `python3 ops/backups/rehearse_admission_outcome.py`; verify rollback,
      repeat-run behavior and reader-role grants. Take a fresh private backup
      before applying it live with `MIGRATE_THROUGH=0019_admin_write_outcomes`.
      Private receipt: `~/backups/news-digest/admission-outcome-migration-proof.json`.
- [x] Applied 0019 live (1730) after fresh backup/restore rehearsal; bounded
      runner twice, original admissions preserved, eight private tables deny
      both operational reader roles. Public mode remains off.
- [x] VictoriaMetrics deletion/forced-merge keys configured (iteration 1616).
      Private keys live only in the mode-600 secrets file; the tracked unit loads
      them through prefixed environment flags. Installer and service startup refuse missing keys.
      `pnpm exec tsx scripts/check-metrics-mutation-guards.ts` confirms all three
      mutation routes refuse unauthenticated requests (401), without credentials
      or a deletion/forced merge. Normal queries and scraping remain available.
- [ ] Finish the [admin/tool response rollout findings](public-read-rollout-review.md)
      (1620): install sanitized readers without legacy overlaps, finish status/preview
      projections and expose the approved read-only pages/tools. Initial [tool producer review](public-tool-response-review.md) completed (1716):
      Grafana grants expose unpublished snapshots/raw errors and jobs return raw payloads.
      Separate Grafana view-only reader SQL prepared, not installed (1717–1718), including published daily content counts. A separate uninstalled three-panel public overview
      now executes against that role in disposable tests (1719). Inherited privilege/catalog
      review (1721) pins denied escalation but demonstrates readable comments/view definitions;
      same-database arbitrary public SQL remains unapproved. Separate-instance aggregate storage and real-login denial rehearsal pass (1722);
      bounded atomic refresh/30-day retention prepared and tested (1731); restricted writer login and lock-timeout rollback rehearsed (1732); single-statement published-only producer prepared (1733); atomic capture timestamp prepared (1734); dedicated-store source query and export-age panel prepared (1735); monotonic capture replacement prepared (1736); loopback-only one-shot transport prepared (1737); target SCRAM login/wrong-password preservation rehearsed (1738); source SCRAM authentication/wrong-password capture preservation and grant-level write denial rehearsed (1739); prepared loopback listener/dedicated-network rehearsal (1740); freshness alert SQL prepared and restricted-login tested (1742); disposable Grafana provisioning and SQL/threshold evaluation pass (1743); exact scheduled pending/firing, query-error and recovery transitions pass (1753); [fixed-port rehearsal and capacity check](public-tool-response-review.md#fixed-port-and-capacity-rehearsal-iteration-1758) confirm loopback isolation; the [paired startup and read trial](public-tool-response-review.md#paired-startup-and-read-rehearsal-iteration-1759) met both short-window targets, but installation still needs capacity evidence under scheduled load or natural compaction. Provisioning, rendering and query-route review remain.
      The [public queue status endpoint](public-tool-response-review.md#exclusive-queue-routing-and-admission-iteration-1761) projects fixed counts and next runs. The compiled isolated app verifies shared request admission and denial of legacy routes; the live flag remains off.
      The [handbook response inventory](public-tool-response-review.md#handbook-response-inventory-iteration-1762) removes broad image serving and verifies exact page routes. The [standalone reader handbook](public-tool-response-review.md#reader-handbook-candidate-iteration-1763) passed its corpus and browser rehearsal. [Proxy admission and private rollback](public-tool-response-review.md#reader-handbook-proxy-rehearsal-iteration-1764) passed in isolation; install the reader service before public activation.
      Explorer [HTTP/proxy/browser rollback](public-tool-response-review.md#explorer-proxy-and-browser-rollback-iteration-1775) passes against the captured live restricted-role catalog; public admission remains closed. [Disposable credential lifecycle rollback](public-tool-response-review.md#explorer-credential-lifecycle-rollback-iteration-1776) passes; live credential/environment/authentication rollback and reader admission remain.
      Fix these data boundaries before installing tool routes; the gate is still open. Confirm `/logs`
      and `/metrics` require an admin session and account tables deny operational/PUBLIC reader roles after migration.
- [ ] Run the complete public-mode rehearsal: anonymous reader/admin reads,
      ordinary-reader isolation, fresh-admin writes and durable audit, rate limits,
      security headers, privacy page, log hygiene and private-mode rollback.
- [ ] Build the web app with `VITE_PUBLIC_MODE=1` when activating server
      `PUBLIC_MODE=1`; rollback rebuilds with `VITE_PUBLIC_MODE=0`. Only the
      reviewed overview and published-edition history/detail are anonymous-capable; other admin pages remain guarded.
- [ ] Prepare an exact flag/migration/service rollback record and fresh baseline
      reader responses before enabling `PUBLIC_MODE`, after Phase 3 acceptance.
      Restore private mode first if the scheduled edition fails or looks abnormal.
- [ ] Accept a normal scheduled edition with public mode enabled, then provide
      the lead a security-review handoff with evidence and unresolved findings.

Phase 5 sharing, real email and destructive cleanup remain owner decisions.
