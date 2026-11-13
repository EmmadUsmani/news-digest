# Public access and reader accounts

**Status (Nov 13):** phases 0–3 accepted. Item 58 security fixes deployed; the
owner passed the proxy checks and the lead re-check found every finding fixed
(details in `~/lead-private/phase4-security-review.md` on the VM). Item 59
(steered `69fa4f43`) takes the agent through: NBA fix, item 58 ack, remaining
readiness work, public mode on while sharing stays private. It stops before sharing.

**Owner decisions (Nov 7):**

- Profiles go away; topics, schedule and editions are system-level.
- Signed-out and signed-in readers can hide topics and bookmark; signed-in syncs.
- Login codes, no passwords. Friends onboard through admin-issued sign-in links
  until real email exists. Real email is optional, decided later.
- Reader sessions never expire; admin rights need a session under 7 days old.
- Admin = account email in `ADMIN_EMAILS`; exe.dev headers ignored once public.
- Handbook, DB explorer, jobs browser and admin pages (Spend included, Nov 13)
  publicly viewable; launch without public Grafana (Nov 13); `/logs` and `/metrics` admin-only; all writes admin-only.
- Sign-up is invite-only at launch. New topics shown by default.
- Dev budget: Anthropic $5, xAI $2, one-time. xAI balance about $18 covers it.
- Backfill: published editions keep working; owner confirms manual ones.
- No skipped editions; flags undo each phase until the final clean-up.

**Next:**

1. Prep is done (rehearsal, rollback record, Grafana off the public tools). The
   item 58 ack and public mode wait on a normal Nov 14 edition. Read item 59's three acks: NBA AI-edited, item 58 closed, public mode on
   with sharing private. Check it doesn't touch sharing.
2. Owner's call (non-blocker): sign-in guess limits are per address, so a large
   distributed attacker isn't capped per email. Longer codes would fix it.
3. After the owner runs `share set-public`: repeat the fake-header check from a
   signed-out browser, and confirm admin pages refuse writes.

**Owner gates later:** published manual editions (phase 0), go public and the
"VM stays private" rule change (phase 5), email provider (phase 6), clean-up
(phase 7).
