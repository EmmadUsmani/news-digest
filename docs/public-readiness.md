# Phase 4 readiness checklist

Public mode is off; the VM remains private. STEERING 59 authorizes activation
with sharing private after the scheduled NBA/item 58 gate. Only the owner may
change exe.dev sharing. Follow the [approved plan](public-access-plan.md#phases)
and STEERING 59 where older plan gates conflict.

Item 58 fix evidence and remaining live gates: [security handoff](phase4-security-handoff.md).

## Activation and rollback runbook

Complete item 58 after a normal scheduled NBA AI-edited edition. The lead
re-check proceeds in parallel and does not block the authorized private-sharing
activation. Public Grafana is excluded from launch; Spend may be public.
Public mode and sharing remain unchanged until the activation steps are run.

### Activate while the VM is private

1. Record the deployed commit, current private sharing state and proxy port
   (8000), service health, latest published edition ID, source freshness and
   scheduled jobs. Keep a private backup and the current flag/service settings.
   Work outside 13:00–16:00 UTC and preserve the noon generation cutoff.
2. While sharing is still private, set `PUBLIC_MODE=1` in the private
   `~/.config/news-digest/env`, preserving account, origin, trusted-proxy and
   secret settings. Build with `VITE_PUBLIC_MODE=1 pnpm build`, then run
   `systemctl --user restart news-digest-api.service`. Restart the worker only
   if its deployed code or configuration changed. A failed build or restart
   stops activation; do not share.
3. Verify `/healthz`, `pnpm obs alerts`, sources and scheduled jobs. Run
   `pnpm exec tsx scripts/check-live-account-boundary.ts`. Through the deployed
   public-mode router, verify signed-out published reader responses and
   refusal of private/admin reads and writes; verify an ordinary reader's
   isolation and a fresh admin's intended access. Verify public web assets,
   cookie/security headers and trusted-proxy handling over the private HTTPS
   URL. Do not treat a private-mode response or a proxy login redirect as
   proof of public-mode admission. Any failure stops sharing.
4. Accept one normal scheduled edition with public mode enabled and record its
   edition ID, NBA AI editing and reader verification. Provide the lead the
   security handoff, then ack item 50 and stop for the owner's sharing decision.
   Only then may the owner run
   `ssh exe.dev share set-public news-digest`. Keep server public mode and the
   public web build enabled throughout sharing. Verify anonymous HTTPS reader
   access and privileged refusals without an exe.dev login; monitor health,
   alerts and the next scheduled edition. Roll back on abnormal publication
   or access behavior.

### Roll back in this order

1. **Unshare first:** the owner runs
   `ssh exe.dev share set-private news-digest`. Confirm the command succeeded
   and a signed-out HTTPS visitor is required to authenticate with exe.dev.
   If this cannot be confirmed, keep public mode enabled and resolve sharing;
   do not restore the private-mode application while the proxy is public.
2. With sharing confirmed private, restore `PUBLIC_MODE=0` in the private env,
   build with `VITE_PUBLIC_MODE=0 pnpm build`, then run
   `systemctl --user restart news-digest-api.service`. Preserve account flags,
   credentials, additive migrations and published data. No destructive
   migration rollback is needed. Restart the worker only if it changed.
3. Check `/healthz`, `pnpm obs alerts`, private HTTPS access, account admission,
   source freshness, scheduled jobs and the saved edition. Record the commit,
   flag values (no secrets), times, verification results and rollback reason.

Sharing commands and proxy behavior follow the documented
[exe.dev HTTPS proxy](https://exe.dev/docs/proxy.md). Never reverse the order:
verify public mode before sharing; confirm private sharing before disabling it.

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
- [x] Owner launch decisions (STEERING 59): omit public Grafana and its capacity
      work; keep Grafana closed and off the public Tools list. Spend may be public.
- [ ] Close item 58 with a normal scheduled NBA AI-edited edition and its ID.
      Proxy result is recorded in the [security handoff](phase4-security-handoff.md).
- [x] Read-only admin/tool rollout inventory reconciled (2103): reviewed pages,
      handbook/explorer and fresh-admin telemetry are installed behind the flag.
      Exact routes and retained evidence: [current inventory](public-read-rollout-review.md#current-rollout-inventory--iteration-2103).
      Accepted screens need no rerun; complete rehearsal and activation remain below.
- [ ] Run the complete public-mode rehearsal: anonymous reader/admin reads,
      ordinary-reader isolation, fresh-admin writes and durable audit, rate limits,
      security headers, privacy page, log hygiene and private-mode rollback.
- [ ] Build the web app with `VITE_PUBLIC_MODE=1` when activating server
      `PUBLIC_MODE=1`; rollback rebuilds with `VITE_PUBLIC_MODE=0`. Only the
      reviewed overview, topics, schedule, sources, Spend, Tools, Queues and published-edition history/detail are anonymous-capable; other admin pages remain guarded.
- [ ] Prepare an exact flag/migration/service rollback record and fresh baseline
      reader responses before enabling `PUBLIC_MODE`, after Phase 3 acceptance.
      If the scheduled edition fails or looks abnormal, follow the ordered
      rollback above: unshare and confirm private access before disabling public mode.
- [ ] Accept a normal scheduled edition with public mode enabled, then provide
      the lead a security-review handoff with evidence and unresolved findings.

Phase 5 sharing, real email and destructive cleanup remain owner decisions.

Earlier native-tool and public-page receipts: [rehearsal evidence](public-readiness-evidence.md).
