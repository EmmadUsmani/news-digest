# Phase 4 readiness checklist

Public mode is off; the VM remains private. This checklist does not authorize
activation or exe.dev sharing. The [approved plan](public-access-plan.md#phases)
and STEERING 50 define the phase order and owner gates.

## Entry gates

- [ ] Accept Phase 3 after a normal scheduled edition with accounts enabled.
      Owner two-device sign-in/bookmark and proxy/TLS checks passed Nov 10 about
      03:50 UTC; recorded in [NEEDS_FROM_HUMAN.md](../NEEDS_FROM_HUMAN.md).
- [ ] Record the natural sign-in-link expiry check after Nov 11 00:33:01 UTC:
      `pnpm exec tsx scripts/check-live-link-expiry.ts --live verify`.
      This runs in parallel with Phase 3 acceptance.
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

- [ ] Rehearse additive migration 0019 on a fresh private restored copy; verify
      rollback, repeat-run behavior and reader-role grants. Take a private backup
      before applying it live, with an explicit migration stopping tag.
- [x] VictoriaMetrics deletion/forced-merge keys configured (iteration 1616).
      Private keys live only in the mode-600 secrets file; the tracked unit loads
      them through prefixed environment flags. Installer and service startup refuse missing keys.
      `pnpm exec tsx scripts/check-metrics-mutation-guards.ts` confirms all three
      mutation routes refuse unauthenticated requests (401), without credentials
      or a deletion/forced merge. Normal queries and scraping remain available.
- [ ] Review every public admin/tool GET response for user data, secrets and raw
      provider errors. Confirm `/logs` and `/metrics` require an admin session and
      account tables deny operational/PUBLIC reader roles after migration.
- [ ] Run the complete public-mode rehearsal: anonymous reader/admin reads,
      ordinary-reader isolation, fresh-admin writes and durable audit, rate limits,
      security headers, privacy page, log hygiene and private-mode rollback.
- [ ] Prepare an exact flag/migration/service rollback record and fresh baseline
      reader responses before enabling `PUBLIC_MODE`, after Phase 3 acceptance.
      Restore private mode first if the scheduled edition fails or looks abnormal.
- [ ] Accept a normal scheduled edition with public mode enabled, then provide
      the lead a security-review handoff with evidence and unresolved findings.

Phase 5 sharing, real email and destructive cleanup remain owner decisions.
