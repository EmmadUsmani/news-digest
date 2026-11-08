# Public access and reader accounts

**Status (01:05 UTC Nov 8):** published-only reader live since 00:15 UTC (lead
checked: archive lists exactly the five Nov 3–7 editions). Phase 2 browser
features shipped. Development budget built as separate ledger tables, with the
$5/$2 ceilings enforced in the database; test-edition routes not wired yet.
Item 51 done: disk 71%→59%.

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
2. After the Nov 8 edition: it is published automatically and the archive shows
   six editions.
3. Watch the agent's weekly ChatGPT allowance (71% on Nov 7) during the refactor.
4. Phase 4: lead security review before the owner decides to go public.

**Owner gates later:** published manual editions (phase 0), go public and the
"VM stays private" rule change (phase 5), email provider (phase 6), clean-up
(phase 7).
