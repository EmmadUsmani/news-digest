# Disk retention

- The daily `news-digest-retention.timer` runs at 04:40 UTC and catches up after downtime. VM setup installs it with `bash ops/retention/install.sh`.
- Codex session files expire after seven days; the newest session always survives. Preview with `python3 ops/retention/sessions.py`.
- `systemd-tmpfiles` cleans `/tmp` after three days without access or modification, preserving in-use sockets and locked files.
- The system journal is capped at 200 MiB. Backups, databases, metrics and agent-control files are outside this cleanup.
- The agent supervisor separately prunes `iter-*` and `report-*` logs after seven days. It keeps `supervisor.log`, `usage.tsv` and `health.log`.
- Check the last run with `sudo systemctl status news-digest-retention.service` and the next run with `systemctl list-timers news-digest-retention.timer`.
