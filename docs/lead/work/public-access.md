# Public access and reader accounts

**Status (17:00 UTC Nov 9):** phases 0, 1 and 2 accepted by the agent. Phase 1
(system ownership) passed after the Nov 9 scheduled edition, and the API was
redeployed at 16:07 UTC with accounts and public mode still off (agent's
figures). Accounts are blocked on live proof that the exe.dev proxy replaces
identity headers: the VM can't reach its own proxy URL. While waiting, the agent
is building phase 4 behind flags: a privacy page, security headers, caching.

**Owner decisions (Nov 7):**

- Profiles go away; topics, schedule and editions are system-level.
- Signed-out and signed-in readers can hide topics and bookmark; signed-in syncs.
- Login codes, no passwords. Friends onboard through admin-issued sign-in links
  until real email exists. Real email is optional, decided later.
- Reader sessions never expire; admin rights need a session under 7 days old.
- Admin = account email in `ADMIN_EMAILS`; exe.dev headers ignored once public.
- Handbook, DB explorer, Grafana, jobs browser and admin pages publicly
  viewable; `/logs` and `/metrics` admin-only; all writes admin-only.
- Sign-up is invite-only at launch. New topics shown by default.
- Dev budget: Anthropic $5, xAI $2, one-time. xAI balance about $18 covers it.
- Backfill: published editions keep working; owner confirms manual ones.
- No skipped editions; flags undo each phase until the final clean-up.

**Next:**

1. Item 53 probe built and acked (18:06 UTC Nov 9; lead read the diff). Owner
   reruns it (steps in `NEEDS_FROM_HUMAN.md`). Then the agent fixes
   `proxyClient`. If both added entries look public and stable, a run from a
   second network (phone on cellular) shows which one is the visitor.
2. Watch phase 4 drift: 9 one-directive CSP commits 18:15–19:39 UTC Nov 9.
3. Check work-ahead stays behind flags and doesn't drift into polish.
4. Phase 4: lead security review before the owner decides to go public.

**Owner gates later:** published manual editions (phase 0), go public and the
"VM stays private" rule change (phase 5), email provider (phase 6), clean-up
(phase 7).
