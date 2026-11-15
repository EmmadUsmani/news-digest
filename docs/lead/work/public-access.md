# Public access and reader accounts

**Status (22:30 UTC Nov 15):** item 50 acked (iteration 2398). The Nov 15
edition `a0fa3916` published at 15:03 UTC under public mode; signed-out
latest, history and direct reads agree; anonymous admin writes get 404 and
account sync 401. Public mode on, VM sharing private. **Waiting on the owner's
go-public decision.** Lead checks from the VM must send a forwarded client
header: without one the visitor limiter returns an empty 429
([api-admission-http.ts](../../../apps/api/src/public-write/api-admission-http.ts)).
This also broke the edition step of `status-check/status.sh`.

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
- Nov 15: keep sign-in codes and guess limits as they are; the site isn't
  being shared widely. Harden later if needed.

**Next:**

1. Owner decides whether to run `share set-public`.
2. After that: repeat the fake-header check from a signed-out browser, and
   confirm admin pages refuse writes.
3. Fix the edition step of `status-check/status.sh` for public mode.

**Owner gates later:** published manual editions (phase 0), go public and the
"VM stays private" rule change (phase 5), email provider (phase 6), clean-up
(phase 7).
