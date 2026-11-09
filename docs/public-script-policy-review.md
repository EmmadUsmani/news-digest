# Prepared public script-policy review

Iteration 1566, 2026-11-09. Accounts and public mode remain disabled.

Run `pnpm exec tsx scripts/check-public-live-embeds.ts --review-scripts`.
The browser receives the actual prepared enforced CSP plus a separate
report-only candidate: `script-src 'self' https://platform.twitter.com`.
This changes only intercepted browser responses, never deployment headers.
No report collector is installed: all non-GET/HEAD requests, including CSP
report submissions, are blocked. The diagnostic collects browser events locally
and prints only directive, inline/eval/external category, source category and count.
It leaves screenshots untouched; the normal command still refreshes them.

## Observed result

The Nov 9 saved edition contains 10 real X posts. All load in each view:

| View          | Candidate inline violations | Candidate eval violations | Enforced violations |
| ------------- | --------------------------: | ------------------------: | ------------------: |
| Desktop light |                           1 |                        13 |                   0 |
| Desktop dark  |                           1 |                        13 |                   0 |
| Mobile light  |                           1 |                        13 |                   0 |
| Mobile dark   |                           1 |                        13 |                   0 |

Events report the same origin as their source. That category describes the
browser event, not which dependency authored or invoked the script. The report
contains no script bodies, identity values, provider errors or full source URLs.
The report-only trial preserves execution; the earlier enforcing trial (1558)
also produced violations. Successful rendering here does not accept the candidate.

## Readiness decision

Keep the candidate out of enforced headers. Do not add `unsafe-inline` or
`unsafe-eval` merely to silence the reports. The prepared policy continues to
block inline HTML event handlers independently with `script-src-attr 'none'`.
Script elements and eval remain unrestricted in the prepared stack.

Before Phase 4 acceptance, review the invoking code and choose a compatible
script policy or an embed integration that avoids the required exceptions.
Nonce/hash handling must cover dynamically inserted scripts as well as the app;
nonces and hashes alone do not authorize eval. Re-run the enforcing compatibility
check after that decision. The separate item 53 proxy proof still gates Phase 3.
