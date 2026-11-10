# Public access and reader accounts

**Status (04:00 UTC Nov 10):** phases 0–2 accepted. Phase 3 (accounts) is live
on the private VM, and the owner's two-device test passed (saves sync through
exe.dev). Phase 3 closes when the Nov 10 edition publishes normally. Phase 4
(public readiness) is being rehearsed behind flags.

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

1. Check the Nov 10 edition publishes normally, then the agent's phase 3 ack.
   Also its ack for the mailbox script fix, and the link expiry after 00:33
   UTC Nov 11.
2. Steered Nov 10: migration 0019 stays rehearsal-only until phase 3 is
   accepted; spare time goes to item 42, not small hardening. Check overnight.
3. Check work-ahead stays behind flags and doesn't drift into polish.
4. Phase 4: lead security review before the owner decides to go public.

**Owner gates later:** published manual editions (phase 0), go public and the
"VM stays private" rule change (phase 5), email provider (phase 6), clean-up
(phase 7).
