# Public access and reader accounts

**Status (18:15 UTC Nov 10):** phases 0–3 accepted. The owner accepted phase 3
on Nov 10 evening (steered, `7c7df8ab`): the Nov 10 edition published with
accounts on, and its NBA fallback is a story-editing failure that item 54 now
owns. Migration 0019 may go live. Phase 4 (public readiness) continues behind
flags.

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

1. Check the agent's ack: phase 3 recorded as accepted, and migration 0019
   applied after a fresh backup, outside 13:00–16:00 UTC.
2. Check the link-expiry verify after 00:33 UTC Nov 11.
3. Check phase 4 work stays behind flags and doesn't drift into polish.
4. Phase 4: lead security review before the owner decides to go public.

**Owner gates later:** published manual editions (phase 0), go public and the
"VM stays private" rule change (phase 5), email provider (phase 6), clean-up
(phase 7).
