# Public access and reader accounts

**Status (22:50 UTC Nov 15):** **public.** The owner ran
`ssh exe.dev share set-public news-digest`. Lead checked signed out from the
Mac over HTTPS: reader, `/healthz` and latest edition `a0fa3916` return 200;
`/api/me`, admin writes, `/logs` and `/metrics` return 404, with or without
a faked `X-ExeDev-Email` admin header; account sync gets 401 with our origin
and 400 with a foreign one; no cookies issued. Admin and `/db/` pages are
viewable read-only, as decided Nov 7. The VM can't reach its own public URL,
so run checks from the Mac. Undo: `share set-private`, then
[public-readiness.md](../../public-readiness.md) rollback.

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
- Backfill keeps published editions; no skipped editions.
- Nov 15: keep sign-in codes and guess limits as they are; the site isn't
  being shared widely. Harden later if needed.

**Next:**

1. Proposed steer, awaiting owner: sharing is public on purpose; deploy
   without downtime (the agent builds into the live `apps/web/dist` and
   restarts API and worker every iteration, 81 restarts Nov 15, each about
   15 s of 503 and a blank page during the build); serve elkjs from `/db/`
   instead of jsdelivr (public CSP blocks it: "ELK is not defined").
2. Owner decision: full handbook public, or the one-page reader handbook
   public mode serves on port 8110 (`apps/api/src/internal-tools.ts`).
3. Admin pages need a signed-in admin session under 7 days old; exe.dev login
   no longer counts. Owner to check `/account`.
4. Watch the Nov 16 edition publish publicly. Fix `status.sh` edition step.

**Owner gates later:** manual editions, email provider, clean-up.
