# Autonomous build harness

The reviewed source for the harness lives in `ops/agent-control/` in this repo.
`ops/vm/setup.sh` installs it (it calls `install.sh`) to `~/agent-control/`
and installs the user unit `news-digest-agent.service`, enabled at boot.
Installation preserves private logs, state, locks and runtime files, refuses
to run while a supervisor holds the lock, and never starts work by itself.
Never commit runtime data. The build agent must not change the installed
`~/agent-control/`. To change the harness, edit this tracked source and
reinstall.

Project identity (name, repo path, health URL) is in `harness.conf`. Timing is
set in the unit's `Environment=` lines.

## Start and monitor

```bash
systemctl --user start news-digest-agent.service
systemctl --user status news-digest-agent.service
journalctl --user -u news-digest-agent.service -f
cat ~/agent-control/status/heartbeat.json
tail -f ~/agent-control/logs/supervisor.log
```

## Never-give-up retry behavior

Defaults:
- Runs continuously (`RUN_HOURS=0`), with a 75-minute timeout per iteration.
- **Retries every 5 minutes** after crashes, timeouts, unknown errors, or
  iterations that made no commits.
- **Retries every 15 minutes** after Codex usage-limit (for example the
  5-hour window) or authentication failures. While the limit is active, each
  retry fails quickly and cheaply, so this is effectively polling until the
  window reopens.

There is **no failure-count cutoff**, including when a quota message is not
recognized. Quota and authentication failures don't change the diagnostic
no-progress counter. Other unproductive turns increment it, but it never stops
the run, and a productive iteration resets it. The harness never switches
model, provider, account or billing, never attempts login, and never buys
credits.

Each retry starts a fresh Codex session from repo history, progress notes and
the last nonempty final summary. Interrupted work stays on disk for the next
iteration to recover.

The systemd unit restarts the **supervisor process** 60 seconds after any
unexpected failure, with no start-rate cutoff. It is enabled at boot, so a VM
restart resumes the build (user lingering is enabled by `ops/vm/setup.sh`).
Clean STOP or deadline exits are not restarted. A lock prevents overlapping
tmux, systemd or manual runs.

The heartbeat shows `retry_wait` or `usage_wait`, `next_retry_at`, the last
exit code, the no-progress count and health checks. It refreshes every five
seconds during waits, and STOP is checked within five seconds.

Health checks curl `HEALTH_URL` and check every `news-digest-*.service` user
unit except the agent unit itself. Before the app has services, they report
`services=none`.

For an intentionally bounded run, use
`RUN_HOURS=10 bash ~/agent-control/run.sh`. To override settings for the
service, run `systemctl --user edit news-digest-agent.service`, add
`[Service] Environment=...`, then restart.

## Stop and restart

```bash
# Graceful: finish the current iteration, then stop (within five seconds if waiting).
touch ~/agent-control/STOP
# Immediate: kill the supervisor and its child group, skipping the final report.
bash ~/agent-control/stop-now.sh
```

A graceful stop makes one bounded final-report attempt (`MORNING_REPORT.md`),
but only if the last attempt succeeded. The STOP file persists, so neither
systemd nor a reboot will restart work until it is removed:

```bash
rm -f ~/agent-control/STOP
systemctl --user start news-digest-agent.service
```

None of these commands stop the app's own services.

## Verification

```bash
bash -n ops/agent-control/run.sh ops/agent-control/install.sh
python3 ops/agent-control/verify.py
# Optional real user-systemd checks; uses only disposable fake supervisor processes:
python3 ops/agent-control/verify_service.py
```

The tests use temporary directories and fake Codex, Git and services; they need
no model usage. They cover:
- the real Unicode quota message with no error code
- four consecutive failures, then recovery
- unknown crashes, timeouts, authentication failures and no-commit turns
- continuous and bounded runs
- STOP and deadline during waits
- lock exclusion and immediate child cleanup
- owner-file guards and final-report behavior
