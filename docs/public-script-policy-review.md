# Prepared public script-policy review

Iterations 1566–1567, 2026-11-09. Accounts and public mode remain disabled.

Run `pnpm exec tsx scripts/check-public-live-embeds.ts --review-scripts`.
The browser receives the actual prepared enforced CSP plus a separate
report-only candidate: `script-src 'self' https://platform.twitter.com`.
This changes only intercepted browser responses, never deployment headers.
No report collector is installed: all non-GET/HEAD requests, including CSP
report submissions, are blocked. The diagnostic collects browser events locally
and prints only directive, inline/eval/external category, source category, source line/column and count.
It leaves screenshots untouched; the normal command still refreshes them.

## Initial result (1566)

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

## Attribution and resolution (1567)

Adding source line/column to the bounded diagnostic locates the inline report in
the document's theme startup and both eval sites in the app bundle. They are
Zod's eval-availability probe and object-validator code generator, rather than
required X widget execution. The initial source category alone did not establish
the dependency; the previous plan's widget attribution was incorrect.

Theme startup now loads synchronously from `/theme.js` before the app module.
The browser initializes Zod with `jitless: true` before importing schemas, avoiding
both the probe and generated validators. Server validation is unchanged.

The prepared enforced policy now includes
`script-src 'self' https://platform.twitter.com`, without unsafe exceptions.
The offline `check-public-script-policy.ts` admits local/official scripts and
refuses inline scripts, eval and a lookalike host; private mode still admits them.
The live saved-widget check passes all 40 desktop/mobile light/dark views with
zero enforced document violations. The four theme variants still render correctly.
Screenshots are linked from the [compatibility manifest](screenshots/ui/public-x-policy.md).

The report-only command remains available for future regressions. Phase 4 still
needs its complete readiness review; item 53 proxy proof still gates Phase 3.
