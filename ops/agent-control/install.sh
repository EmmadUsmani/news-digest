#!/usr/bin/env bash
# Install only reviewed source files, never logs/state/secrets. Does not start a run.
set -Eeuo pipefail
SOURCE=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
TARGET="$HOME/agent-control"
# shellcheck source=/dev/null
source "$SOURCE/harness.conf"
UNIT="$PROJECT_NAME-agent.service"
mkdir -p "$TARGET/status" "$HOME/.config/systemd/user"
# The lock file must never be replaced: refuse updates while a run holds it.
exec 9>"$TARGET/status/supervisor.lock"
flock -n 9 || { echo 'Stop the running supervisor before installing.' >&2; exit 1; }
for name in run.sh control.py verify.py verify_service.py stop-now.sh; do
    install -m 700 "$SOURCE/$name" "$TARGET/$name"
done
for name in ITERATION_PROMPT.md README.md harness.conf; do
    install -m 600 "$SOURCE/$name" "$TARGET/$name"
done
install -m 600 "$SOURCE/agent.service" "$HOME/.config/systemd/user/$UNIT"
systemctl --user daemon-reload
# Start at boot so a VM restart resumes the build. A STOP file still wins.
systemctl --user enable "$UNIT" >/dev/null
printf '%s\n' "Harness installed and $UNIT enabled at boot. No build started." \
    "Start now: systemctl --user start $UNIT" "See ~/agent-control/README.md for monitor/stop commands."
