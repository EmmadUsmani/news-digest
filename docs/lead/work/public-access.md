# Public access and reader accounts

**Status (03:20 UTC Nov 15):** public mode is on, sharing private (item 62
ack, iteration 2330; item 58 acked `69699604`). Lead check on the VM:
`PUBLIC_MODE=1`, invite-only sign-up. A request with a forwarded client header
gets 200. A bare loopback request with none gets an empty 429: the visitor
limiter fails closed when it can't identify the client
([api-admission-http.ts](../../../apps/api/src/public-write/api-admission-http.ts)).
Expected. Lead checks from the VM must send a forwarded header. The 15:00 UTC
edition is the publishing-only test.

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

1. Read item 62's acks: item 58 closed, public mode on (before 12:00 UTC or
   after 16:00), the edition accepted under the publishing-only gate, item 50
   acked. Check it didn't touch sharing or re-run the rehearsal, and that the
   all-topic gate wording is gone from `docs/public-readiness.md`.
2. After the owner runs `share set-public`: repeat the fake-header check from a
   signed-out browser, and confirm admin pages refuse writes.

**Owner gates later:** published manual editions (phase 0), go public and the
"VM stays private" rule change (phase 5), email provider (phase 6), clean-up
(phase 7).
