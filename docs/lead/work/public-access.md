# Public access and reader accounts

**Status (18:00 UTC Nov 10):** phases 0–2 accepted. Phase 3 (accounts) is live
on the private VM and the owner's two-device test passed. The Nov 10 edition
published on time with accounts on, but NBA stories fell back to raw source
excerpts (the story check rejected all four editing attempts). The agent read
that as "not normal" and holds phase 3 for the Nov 11 edition. It hasn't fixed
the NBA cause, and is spending the wait on default-off phase 4 prep.

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

1. Owner decides: accept phase 3 now (the NBA fallback isn't an account
   failure), and/or steer the agent to fix the NBA rejection before Nov 11.
2. Otherwise check the Nov 11 edition (15:00 UTC) and the agent's phase 3 ack,
   plus the link-expiry check after 00:33 UTC Nov 11.
3. Migration 0019 stays rehearsal-only until phase 3 is accepted.
4. Phase 4: lead security review before the owner decides to go public.

**Owner gates later:** published manual editions (phase 0), go public and the
"VM stays private" rule change (phase 5), email provider (phase 6), clean-up
(phase 7).
