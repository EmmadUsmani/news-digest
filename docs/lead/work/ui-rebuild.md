# UI rebuild

**Status:** in progress. Admin pages mostly built, final reader still to come.

**Spec:** [docs/ui-spec.md](../../ui-spec.md), STEERING item 33. The ack there
marks it finished, with screenshots of every route.

**Latest:** admin gate works, and `ADMIN_EMAILS` is set. Overview, Sources, Spend,
Schedule, Editions and Topics exist. The lead hasn't reviewed them against the
spec yet.

**Next:**

- Review admin pages against the spec once the agent acks.
- Check the reader: timestamps, official X embeds, contents sidebar.
- Confirm the owner's real login gets `isAdmin: true` at `/api/me`.
