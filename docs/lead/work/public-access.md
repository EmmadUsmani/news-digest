# Public access and reader accounts

**Status:** agent started item 50 at 20:48 UTC Nov 7. Phase 0 inventory done
([inventory](../../edition-reviews/2026-11-07-publication-inventory.md)): 546
editions, of which 65 keyed ones are `integration:` tests, so the plan's
"keyed = published" rule was wrong. Waiting on the owner, the agent moved to
phase 2 (hide topics, browser bookmarks), as instructed.

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

1. Read each phase's ack against the plan's checks, and its development spend.
2. Phase 0: owner decides the published set. Lead recommends the Nov 3–7
   scheduled editions only; Nov 1–2 stay unpublished.
3. Watch the agent's weekly ChatGPT allowance (71% on Nov 7) during the refactor.
4. Phase 4: lead security review before the owner decides to go public.

**Owner gates later:** published manual editions (phase 0), go public and the
"VM stays private" rule change (phase 5), email provider (phase 6), clean-up
(phase 7).
