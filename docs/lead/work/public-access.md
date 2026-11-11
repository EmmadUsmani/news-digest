# Public access and reader accounts

**Status (21:30 UTC Nov 10):** phases 0–3 accepted. Migration 0019 is live
(19:37 UTC, after a fresh backup and restore rehearsal, per the agent's notes).
Phase 4 continues behind flags. Since then it's mostly the public Grafana
export (about 10 commits).

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

0. Item 55 (Nov 11) stops re-verifying accepted screens; the agent stops at the
   phase 4 summary. Check the verify-only commit share falls.

1. Check the link-expiry verify after 00:33 UTC Nov 11.
2. Check phase 4 stays behind flags. Watch the Grafana export work for drift
   into hardening: 17 of the last 46 commits were guards or re-checks.
3. Phase 4: lead security review before the owner decides to go public.

**Owner gates later:** published manual editions (phase 0), go public and the
"VM stays private" rule change (phase 5), email provider (phase 6), clean-up
(phase 7).
