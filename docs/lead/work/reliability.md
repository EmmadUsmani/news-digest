# Reliability

**Status:** steered on Nov 7 as item 47, not yet acked. The agent rehearses four
failed-edition cases and a rebuild from backup, then settles M6 and M7.
Publisher names are built on the `publisher-attribution` branch and stay off
`main` until the Nov 7 edition review is committed.

**Next:**

- Read each step's ack. A rehearsal must not have touched production.
- Check the branch wasn't merged early. It needs both 16:00 UTC on Nov 7 and the
  committed review.
- Owner's Mac-side decrypt test is still open. See [backups](backups.md).

**Open decisions:**

- Failed-edition alert: the owner wants one, but no delivery channel is chosen.
  `MISSION.md` bans real notifications, so this needs an owner-approved exception.
- Richer Tech evidence: wait for a cost estimate before deciding. Not steered.
