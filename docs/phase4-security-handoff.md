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
- Authenticated exe.dev identity-header replacement and shared target port checks
  remain pending. The VM lacks SSH credentials/trust; see
  [the recorded gate](../NEEDS_FROM_HUMAN.md#phase-4-proxy-verification-nov-12-iteration-1879).
  Local application behavior does not substitute for these proxy checks.

## Verification and remaining acceptance

- Refusal regressions accompany the fixes; iteration 1880 passed 877 unit tests,
  286 integration tests (four expected skips), build, formatting, lint and handbook checks.
- Nov 12 03:02 UTC snapshot: API/database/Redis healthy, 14 services healthy,
  eight scrape targets healthy, 38 sources healthy and zero alerts. A transient
  worker scrape alert during the preceding restart cleared without intervention.
- Digest generation has one worker, zero failed jobs and its next scheduled run
  at Nov 12 15:00 UTC. No paid verification run was started.
- After that run, review publication and five-topic content under the
  [World/U.S. acceptance plan](us-news-topic-plan.md); record item 58 post-fix
  acceptance separately from the three-edition split review.
- Item 58 stays open until the live checks are answered and a normal scheduled
  edition publishes after the fixes. Then add the required steering ack and
  request the lead re-check; the owner retains the go-public decision.
- The broader [readiness checklist](public-readiness.md) still applies to future
  activation, including public-mode verification and ordered rollback.
