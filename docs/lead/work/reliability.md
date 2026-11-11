# Reliability

**Agent outage, Nov 10 (resolved):** from 22:13 UTC every Codex run failed with
"The 'gpt-6.1-sol' model requires a newer version of Codex". The temporary
`gpt-6-sol` pin is already gone from the VM's `~/.codex/config.toml` (checked
Nov 11 17:50 UTC), so the agent runs on the default, `gpt-6.1-sol`. Iterations
1756 to 1837 all ran as `model=default`; sessions show `gpt-6.1-sol`. A one-line
`codex exec -m gpt-6.1-sol` test answered. No fallback has run, so the live
fallback path is untested; the offline suite (31 tests) passes on the VM.

**Supervisor fallback and AgentCrashLoop alert** (commits 238d5af0, 657582d9) are
live. Installed at 00:16 UTC Nov 11, between iterations 1755 and 1756; the
installing session left no commit. Installed `run.sh` matches `main` 0b764829,
`news_digest_harness_failure_streak` reads 0, and vmalert has loaded `AgentCrashLoop`.

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
