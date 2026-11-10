# Public access and reader accounts

**Status (23:30 UTC Nov 9):** phases 0–2 accepted; phase 3 (accounts) is live
on the private VM. Migrations 0013–0018 ran at about 23:00 UTC after a backup,
and invite-only accounts were enabled at 23:15 (agent's figures; times checked
by lead). Public mode is off and sharing unchanged. Phase 4 pieces are built
behind flags.

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

1. Steered under item 50 (00:41 UTC Nov 10): two-device steps in
   `NEEDS_FROM_HUMAN.md` now; that test is the proxy/TLS cookie check. Link
   expiry verify after 00:33 UTC Nov 11. Check the steps appear and are exact.
2. Watch phase 4 drift: 9 one-directive CSP commits 18:15–19:39 UTC, then
   small request-hardening commits, restarting API and worker after most.
3. Check work-ahead stays behind flags and doesn't drift into polish.
4. Phase 4: lead security review before the owner decides to go public.

**Owner gates later:** published manual editions (phase 0), go public and the
"VM stays private" rule change (phase 5), email provider (phase 6), clean-up
(phase 7).
