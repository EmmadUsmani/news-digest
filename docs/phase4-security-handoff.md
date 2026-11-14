# Phase 4 security fix handoff

Prepared Nov 12, 2026 (iteration 1881). Public mode remains off and the VM
remains private. This records fixes, not acceptance or permission to activate.
The private review remains in `~/lead-private/phase4-security-review.md`.

## Item 58 fixes deployed

| Item  | Protection                                                                                     | Commits                                        |
| ----- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1     | Ordered activation and rollback [runbook](public-readiness.md#activation-and-rollback-runbook) | `2398735f`                                     |
| 2     | Independent client sign-in allowances and challenges                                           | `19ac931f`, `6d7c4cfd`                         |
| 3     | Mailbox verification required to renew admin access                                            | `fd1d4704`                                     |
| 4     | Administrative history survives account deletion                                               | `3587af64`                                     |
| 5     | Authenticate before consuming large sync uploads                                               | `db2b11e1`                                     |
| 6     | IPv6 subnet admission, admission before locks, daily caps and response floor                   | `f5fe836e`, `f3f89e19`, `2460fd30`, `ba111cb8` |
| 7     | Grafana excluded from public forwarding; tool table corrected                                  | `7cc73550`                                     |
| 8     | Public-mode admin topic editing and browser reports restored                                   | `ea10789c`, `98fe09f3`                         |
| 9     | Stale test servers stopped; smoke process cleanup protected                                    | `0f8c26db`                                     |
| Minor | Explicit explorer credentials; restrictive CSP; isolated metrics credentials                   | `15e126af`, `7812569f`, `382f3097`             |
| Minor | Signup policy for links; all reader-role account grants revoked                                | `67c11850`, `0d7635a4`                         |
| Minor | Bounded log queries; shared API/tool visitor admission                                         | `4a902c5a`, `1e3d5768`                         |

## Item 10 live verification

- Trusted loopback proxy configuration and explorer credential drop-in checked (1875).
- Reader privileges and default grants checked; migration 0023 removes remaining
  account grants across all five reader roles and PUBLIC (1878).
- Owner verified Nov 13 from the Mac: shared proxy target is port 8000, and
  a signed-in request with a spoofed email header retained the real admin identity.
  UserID-header replacement and future anonymous visitor behavior remain uncovered;
  see [the owner evidence](../NEEDS_FROM_HUMAN.md#phase-4-proxy-verification-nov-12-iteration-1879).

## Verification and remaining acceptance

- Refusal regressions accompany the fixes; iteration 1880 passed 877 unit tests,
  286 integration tests (four expected skips), build, formatting, lint and handbook checks.
- Nov 12 03:02 UTC snapshot: API/database/Redis healthy, 14 services healthy,
  eight scrape targets healthy, 38 sources healthy and zero alerts. A transient
  worker scrape alert during the preceding restart cleared without intervention.
- Digest generation has one worker, zero failed jobs and its next scheduled run
  at Nov 12 15:00 UTC. No paid verification run was started.
- Nov 12 published at 15:03:52 UTC: five topics/25 stories/22 posts; reader
  latest/direct/history agree. NBA fell back to source excerpts and three Sonnet
  admissions were refused. This does not close normal post-fix acceptance.
  [Scheduled review and NBA diagnosis](edition-reviews/2026-11-12.md); restore NBA
  before accepting a later normal edition. Owner proxy evidence is recorded above.
- Nov 13 edition `f901ba6c-cba3-4116-8539-fd0e92b98ec4` published, but local
  triage queue expiry prevented every story editor and withheld World/U.S.
  stories. NBA/item 58 acceptance remains open; no activation follows this run.
  [Admission breakage review](edition-reviews/2026-11-13.md).
- Nov 14 edition `b9d55088-892a-4e34-b77c-a398d64c6a9f` restores NBA AI editing,
  but Gaming fallback and failed World/U.S. ownership prevent normal full-edition
  acceptance. Item 58 and activation remain open. [Review](edition-reviews/2026-11-14.md).
- Item 58 stays open until the live checks are answered and a normal scheduled
  edition publishes after the fixes. Then add the required steering ack and
  request the lead re-check; the owner retains the go-public decision.
- The broader [readiness checklist](public-readiness.md) still applies to future
  activation, including public-mode verification and ordered rollback.

## Post-fix deployed boundary check — iteration 1885

- Nov 12 03:45 UTC: `check-live-account-boundary.ts` passes all 32 deployed
  loopback checks after the item 58 fixes. Anonymous writes, invalid origins,
  wrong content types and malformed payloads are refused; no cookies issued,
  credentials requested or account identities created. This is local application
  evidence; the later owner proxy verification is recorded above.
- `check-scheduled-reader.ts 2026-11-11T15:00:00Z` passes: latest, direct and
  history agree on the saved four-topic edition, 19 stories and 19 posts.
  That edition predates the fixes and does not satisfy post-fix acceptance.
- API/database/Redis and all 38 sources are healthy; zero alerts. The staffed
  digest queue has zero failures and still targets Nov 12 15:00 UTC. No paid
  generation, public activation or accepted-screen rerun was performed.
