# Reliability

**Agent outage, Nov 10:** from 22:13 UTC every Codex run failed with "The
'gpt-6.1-sol' model requires a newer version of Codex", even on 0.167.1 (latest
stable, installed) and the newest prerelease. `gpt-6-sol` works, so the block is
on the exe.dev gateway or OpenAI side. Owner approved a temporary pin: the VM's
`~/.codex/config.toml` has `model = "gpt-6-sol"` (backup `config.toml.pre-gpt6sol`),
and iteration 1753 ran from 22:59. Next: remove the pin once `gpt-6.1-sol`
answers a one-line `codex exec -m gpt-6.1-sol` test. A supervisor fallback is
under discussion, not steered.

**Status:** steered on Nov 7 as items 47 and 48, not yet acked. The agent rehearses four
failed-edition cases and a rebuild from backup, then settles M6 and M7.
Publisher names are built on the `publisher-attribution` branch and stay off
`main` until the Nov 7 edition review is committed.

**Next:**

- Read each step's ack. A rehearsal must not have touched production.
- Check the branch wasn't merged early. It needs both 16:00 UTC on Nov 7 and the
  committed review.
- Owner's Mac-side decrypt test is still open. See [backups](backups.md).

**Alerts:** item 48 builds a generic alert system that only writes to
`~/.local/state/news-digest/alerts/alerts.jsonl` on the VM. The status check
prints its last lines. The owner will choose email, Discord or similar later,
and that needs an exception to `MISSION.md`'s ban on real notifications.

**Open decisions:** Richer Tech evidence waits for a cost estimate. Not steered.
