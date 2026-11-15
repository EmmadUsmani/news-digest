# Public access and reader accounts

**Status (22:50 UTC Nov 15):** **public.** The owner ran
`ssh exe.dev share set-public news-digest`. Lead checked signed out from the
Mac over HTTPS: reader, `/healthz` and latest edition `a0fa3916` return 200;
`/api/me`, admin writes, `/logs` and `/metrics` return 404, with or without
a faked `X-ExeDev-Email` admin header; account sync gets 401 with our origin
and 400 with a foreign one; no cookies issued. Admin and `/db/` pages are
viewable read-only, as decided Nov 7. The VM can't reach its own public URL,
so run these checks from the Mac. Undo:
`ssh exe.dev share set-private news-digest`, then the rollback in
[public-readiness.md](../../public-readiness.md).

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

1. Owner approval pending: change the "VM stays private" rule in `CLAUDE.md`
   and tell the build agent that sharing is public.
2. Watch the Nov 16 edition publish publicly; check health and alerts.
3. Fix the edition step of `status-check/status.sh` for public mode.

**Owner gates later:** published manual editions (phase 0), email provider (phase 6), clean-up
(phase 7).
