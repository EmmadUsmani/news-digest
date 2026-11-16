# Phase 4 readiness checklist

Public mode and public VM sharing are enabled under STEERING 63 (Nov 15).
Only the owner may change exe.dev sharing. Follow the [approved plan](public-access-plan.md#phases).
Nov 15 scheduled edition `a0fa3916` passed the publishing and reader gate.
[Acceptance record](edition-reviews/2026-11-15.md#scheduled-acceptance--iteration-2398).
Nov 16 scheduled publication over public HTTPS remains the next acceptance gate.
Keep public mode enabled while sharing is public. Deploy using the
[operations runbook](handbook/01-app/08-operations.md); restart only changed services
and never deploy or restart between 13:00 and 16:00 UTC.

Item 58 fix evidence and remaining live gates: [security handoff](phase4-security-handoff.md).

## Activation and rollback runbook

Item 58 is accepted against Nov 14 edition `b9d55088` and the owner's proxy result.
STEERING 62 replaces the former all-topic AI gate with scheduled publication,
signed-out reader agreement and continued private/admin refusals.
Public Grafana is excluded from launch; Spend may be public.

### Initial activation (completed Nov 15)

1. Record the deployed commit, current private sharing state and proxy port
   (8000), service health, latest published edition ID, source freshness and
   scheduled jobs. Keep a private backup and the current flag/service settings using the
   [prepared deployment record](public-activation-record.md).
   Work outside 13:00–16:00 UTC and preserve the noon generation cutoff.
2. While sharing is still private, set `PUBLIC_MODE=1` in the private
   `~/.config/news-digest/env`, preserving account, origin, trusted-proxy and
   secret settings. Publish the web build with
   `VITE_PUBLIC_MODE=1 pnpm --filter @digest/web build`, then run
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
   edition ID and reader verification using the gate below. Provide the lead the
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
   publish atomically with `VITE_PUBLIC_MODE=0 pnpm --filter @digest/web build`, then run
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
- [x] Item 58 accepted under STEERING 62: Nov 14 scheduled edition
      `b9d55088-892a-4e34-b77c-a398d64c6a9f` published with NBA AI editing.
      Owner proxy result is recorded in the [security handoff](phase4-security-handoff.md).
- [x] Nov 15 edition `a0fa3916` accepted in public mode: publication on schedule;
      latest, history and direct edition agree for signed-out readers; private/admin
      reads and writes remain refused. Record fallbacks and thin or withheld topics
      as edition breakages; they do not fail this access/publication gate.

```sh
pnpm exec tsx scripts/check-scheduled-reader.ts YYYY-MM-DDTHH:mm:ssZ
SCHEDULED_READER_ORIGIN=https://news-digest.exe.xyz pnpm exec tsx scripts/check-scheduled-reader.ts YYYY-MM-DDTHH:mm:ssZ
pnpm exec tsx scripts/check-live-account-boundary.ts
```

Replace the timestamp with the scheduled window end. Verify signed-out private/admin
refusals through the deployed router as well. Do not add AI-topic requirements.

- [x] Read-only admin/tool rollout inventory reconciled (2103): reviewed pages,
      handbook/explorer and fresh-admin telemetry are installed behind the flag.
      Exact routes and retained evidence: [current inventory](public-read-rollout-review.md#current-rollout-inventory--iteration-2103).
      Accepted screens need no rerun; rehearsal receipt and activation gates follow.
- [x] Complete disposable public-mode rehearsal (2104): anonymous reader/admin
      reads, ordinary-reader isolation, fresh-admin writes and durable audit,
      rate limits, security headers, privacy page, request-log hygiene and
      private-mode rollback. Commands and scope: [rehearsal receipt](public-readiness-evidence.md#complete-public-mode-rehearsal-iteration-2104).
      Deployed public-mode acceptance remains in activation step 3.
- [x] Build the web app with `VITE_PUBLIC_MODE=1` when activating server
      `PUBLIC_MODE=1`; rollback rebuilds with `VITE_PUBLIC_MODE=0`. Only the
      reviewed overview, topics, schedule, sources, Spend, Tools, Queues and published-edition history/detail are anonymous-capable; other admin pages remain guarded.
- [x] Prepare an exact flag/migration/service rollback record and fresh baseline
      reader responses before enabling `PUBLIC_MODE`, after Phase 3 acceptance.
      If publication fails or the public reader breaks, follow the ordered
      rollback above: unshare and confirm private access before disabling public mode.
- [x] Nov 15 scheduled public-mode edition and security handoff accepted.
- [ ] Accept the Nov 16 scheduled edition signed out over public HTTPS; latest,
      history and direct edition must agree, with private/admin refusals retained.

The owner enabled sharing Nov 15. Real email and destructive cleanup remain owner decisions.

Earlier native-tool and public-page receipts: [rehearsal evidence](public-readiness-evidence.md).
