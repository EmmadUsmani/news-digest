# Public access and reader accounts

**Status (16:00 UTC Nov 8):** phases 0 and 2 accepted by the agent after the Nov 8
scheduled edition published by itself. Lead checked: archive lists six editions,
Nov 3–8. Phase 1 (accounts) not begun. Dev spend $0 so far (agent's figure).

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

1. Read phase 1's ack against the plan's checks, and its development spend.
2. Steered Nov 8 (owner update in item 50): phase 1 now, build the next phase
   with its flag off while waiting, no more phase 2 polish. Check tonight's
   commits are phase 1, not reader tweaks.
3. Phase 4: lead security review before the owner decides to go public.

**Owner gates later:** published manual editions (phase 0), go public and the
"VM stays private" rule change (phase 5), email provider (phase 6), clean-up
(phase 7).
